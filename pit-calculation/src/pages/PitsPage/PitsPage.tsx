import { FC, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { fetchDraftCount } from '../../store/slices/pitDraftSlice'
import { 
    getPitApplication, 
    updatePitParams, 
    updateMaterialSlopeAngle,
    deleteMaterialFromPit,
    deletePitDraft,
    formPitDraft
} from '../../store/slices/pitDraftSlice';
import Header from '../../components/Header/Header';
import './PitsPage.css';

const PitsPage: FC = () => {
    const { pit_id } = useParams<{ pit_id: string }>();
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [isSavingParams, setIsSavingParams] = useState(false);
    const [isSavingSlope, setIsSavingSlope] = useState<number | null>(null);
    const [isForming, setIsForming] = useState(false); 
    
    const [pitParams, setPitParams] = useState({
        pit_length: 0,
        pit_width: 0,
        pit_depth: 0,
    });
    
    const [slopeAngles, setSlopeAngles] = useState<Record<number, number>>({});

    const {
        materials,
        pitData,
        error,
        deletingMaterialId,
        deletingPit
    } = useSelector((state: RootState) => state.pitDraft);

    const { isAuthenticated } = useSelector((state: RootState) => state.user);

    useEffect(() => {
        if (!isAuthenticated) {
            return;
        }
        if (!pit_id) {
            setIsLoading(false);
            return;
        }
        if (!isLoading) {
            setIsLoading(true);
            console.log('🔍 PitsPage: Загружаем данные заявки', pit_id);
            dispatch(getPitApplication(pit_id))
                .unwrap()
                .finally(() => setIsLoading(false));
        }
    }, [pit_id, isAuthenticated, dispatch]);

    useEffect(() => {
        if (pitData) {
            setPitParams({
                pit_length: pitData.pit_length || 0,
                pit_width: pitData.pit_width || 0,
                pit_depth: pitData.pit_depth || 0,
            });
            
            if (materials && materials.length > 0) {
                const angles: Record<number, number> = {};
                materials.forEach((item: any) => {
                    const materialId = item.id || item.material?.id;
                    const slopeAngle = item.slope_angle;
                    
                    if (materialId !== undefined) {
                        angles[materialId] = slopeAngle || 0;
                    }
                });
                setSlopeAngles(angles);
            }
        }
    }, [pitData, materials]);

    const handlePitParamChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setPitParams(prev => ({
            ...prev,
            [id]: parseFloat(value) || 0,
        }));
    };

    const handleSavePitParams = async () => {
        if (!pit_id) return;
        
        setIsSavingParams(true);
        
        try {
            const params = {
                pit_depth: pitParams.pit_depth,
                pit_length: pitParams.pit_length,
                pit_width: pitParams.pit_width
            };
            
            await dispatch(updatePitParams({ 
                pitId: parseInt(pit_id), 
                params 
            })).unwrap();
            
            dispatch(getPitApplication(pit_id));
            
        } catch (error: any) {
            console.error('Ошибка сохранения параметров:', error);
        } finally {
            setIsSavingParams(false);
        }
    };

    const handleSlopeAngleChange = (materialId: number, value: string) => {
        const angleValue = parseFloat(value) || 0;
        const clampedAngle = Math.min(45, Math.max(0, angleValue));
        setSlopeAngles(prev => ({
            ...prev,
            [materialId]: clampedAngle,
        }));
    };

    const handleSaveSlopeAngle = async (materialId: number) => {
        if (!pit_id) return;
        
        const angle = slopeAngles[materialId] || 0;
        setIsSavingSlope(materialId);
        
        try {
            await dispatch(updateMaterialSlopeAngle({
                calculationId: parseInt(pit_id),
                materialId: materialId,
                slopeAngle: angle
            })).unwrap();
            
            dispatch(getPitApplication(pit_id));
            
        } catch (error: any) {
            console.error('Ошибка сохранения угла откоса:', error);
        } finally {
            setIsSavingSlope(null);
        }
    };

    const handleDeleteMaterial = async (materialId: number) => {
        if (!pit_id || !materialId) return;
        
        try {
            await dispatch(deleteMaterialFromPit({
                calculationId: parseInt(pit_id),
                materialId: materialId
            })).unwrap();
            
            dispatch(getPitApplication(pit_id));
            
        } catch (error: any) {
            console.error('Ошибка удаления материала:', error);
        }
    };

    const handleDeletePit = async () => {
        if (!pit_id || !isDraft) return;
        
        try {
            await dispatch(deletePitDraft(parseInt(pit_id))).unwrap();
            await dispatch(fetchDraftCount()).unwrap();
            navigate('/materials');
        } catch (error: any) {
            console.error('Ошибка удаления заявки:', error);
        }
    };

    const handleFormPit = async () => {
        if (!pit_id || !isDraft) return;
        
        try {
            setIsForming(true);
            await dispatch(formPitDraft(parseInt(pit_id))).unwrap();
            await dispatch(fetchDraftCount()).unwrap();
            navigate('/materials');
        } catch (error: any) {
            console.error('Ошибка формирования заявки:', error);
            alert(error.message || 'Ошибка при отправке заявки');
        } finally {
            setIsForming(false);
        }
    };

    const isDraft = pitData?.status === 'draft';
    const isFormed = pitData?.status === 'formed';
    const isCompleted = pitData?.status === 'completed';
    const isRejected = pitData?.status === 'rejected';

    const getStatusBadge = () => {
        switch (pitData?.status) {
            case 'draft':
                return <span className="badge bg-secondary">Черновик</span>;
            case 'formed':
                return <span className="badge bg-warning">На рассмотрении</span>;
            case 'completed':
                return <span className="badge bg-success">Завершена</span>;
            case 'rejected':
                return <span className="badge bg-danger">Отклонена</span>;
            default:
                return <span className="badge bg-secondary">Неизвестно</span>;
        }
    };

    const safeNumber = (value: number | null | undefined): number => {
        return value || 0;
    };

    const getVolumeResult = (item: any): string => {
        const volumeResult = item.volume_result || (item as any).volume_result;
        return `${safeNumber(volumeResult)} м³`;
    };

    const getCoefficient = (item: any): number => {
        return item.coefficient || item.material?.coefficient || 0;
    };

    const getMaterialId = (item: any): number | undefined => {
        return item.id || item.material?.id;
    };

    const getMaterialTitle = (item: any): string => {
        return item.title || item.material?.title || 'Без названия';
    };

    const getImageUrl = (item: any): string => {
        return item.image_url || item.material?.image_url || '/static/img/default_image.png';
    };

    return (
        <div>
            <Header />
            <main className="main-content">
                <section className="pits-section">
                    <div className="pits-header">
                        <h1 className="pits-title">Параметры котлована</h1>
                        <div className="pit-status">
                            {getStatusBadge()}
                        </div>
                    </div>
                    
                    {error && (
                        <div className="alert alert-danger" role="alert">
                            {error}
                        </div>
                    )}
                    
                    {isLoading ? (
                        <div className="loading-container">
                            <div className="spinner"></div>
                            <p>Загрузка данных заявки...</p>
                        </div>
                    ) : (
                        <>
                            <div className="pit-parameters">
                                <div className="parameter-input">
                                    <label htmlFor="pit_length">Длина (м)</label>
                                    <input 
                                        type="number" 
                                        id="pit_length" 
                                        placeholder="0.0" 
                                        step="0.1" 
                                        min="0" 
                                        value={pitParams.pit_length}
                                        onChange={handlePitParamChange}
                                        readOnly={!isDraft}
                                        className={!isDraft ? 'read-only-field' : ''}
                                    />
                                </div>
                                <div className="parameter-input">
                                    <label htmlFor="pit_width">Ширина (м)</label>
                                    <input 
                                        type="number" 
                                        id="pit_width" 
                                        placeholder="0.0" 
                                        step="0.1" 
                                        min="0" 
                                        value={pitParams.pit_width}
                                        onChange={handlePitParamChange}
                                        readOnly={!isDraft}
                                        className={!isDraft ? 'read-only-field' : ''}
                                    />
                                </div>
                                <div className="parameter-input">
                                    <label htmlFor="pit_depth">Глубина (м)</label>
                                    <input 
                                        type="number" 
                                        id="pit_depth" 
                                        placeholder="0.0" 
                                        step="0.1" 
                                        min="0" 
                                        value={pitParams.pit_depth}
                                        onChange={handlePitParamChange}
                                        readOnly={!isDraft}
                                        className={!isDraft ? 'read-only-field' : ''}
                                    />
                                </div>
                            </div>

                            {isDraft && (
                                <div className="save-params-container">
                                    <button 
                                        className="save-params-button"
                                        onClick={handleSavePitParams}
                                        disabled={isSavingParams}
                                    >
                                        {isSavingParams ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                Сохранение...
                                            </>
                                        ) : (
                                            'Сохранить параметры'
                                        )}
                                    </button>
                                </div>
                            )}

                            <div className="pit-items">
                                {materials.length ? (
                                    <>
                                        <div className="materials-header">
                                        </div>
                                        
                                        <div className="materials-list">
                                            {materials.map((item: any, index: number) => {
                                                const materialId = getMaterialId(item);
                                                if (!materialId) return null;
                                                
                                                const currentSlopeAngle = slopeAngles[materialId] || 
                                                                         item.slope_angle || 0;
                                                const isDeleting = deletingMaterialId === materialId;
                                                
                                                return (
                                                    <div key={materialId || index} className="pit-material-card slim-card">
                                                        <div className="pit-material-image">
                                                            <img 
                                                                src={getImageUrl(item)}
                                                                alt={getMaterialTitle(item)}
                                                                onError={(e) => {
                                                                    e.currentTarget.src = '/static/img/default_image.png';
                                                                }}
                                                            />
                                                        </div>
                                                        
                                                        <div className="pit-material-content">
                                                            <div className="card-header">
                                                                <h4 className="material-title">
                                                                    {getMaterialTitle(item)}
                                                                </h4>
                                                                {isDraft && (
                                                                    <button 
                                                                        className="delete-material-button"
                                                                        onClick={() => handleDeleteMaterial(materialId)}
                                                                        disabled={isDeleting}
                                                                        title="Удалить материал из заявки"
                                                                    >
                                                                        {isDeleting ? (
                                                                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                                                        ) : (
                                                                            '×'
                                                                        )}
                                                                    </button>
                                                                )}
                                                            </div>
                                            
                                                            <div className="card-body">
                                                                <div className="material-info-row">
                                                                    <span className="coefficient-label">
                                                                        Коэф. разрыхления: 
                                                                    </span>
                                                                    <span className="coefficient-value">
                                                                        {safeNumber(getCoefficient(item))}
                                                                    </span>
                                                                </div>
                                                                
                                                                <div className="slope-angle-row">
                                                                    <div className="slope-input-group">
                                                                        <label className="slope-label">
                                                                            Угол откоса:
                                                                        </label>
                                                                        <input 
                                                                            type="number" 
                                                                            className={`slope-input ${!isDraft ? 'read-only-field' : ''}`}
                                                                            placeholder="0-45" 
                                                                            step="1" 
                                                                            min="0" 
                                                                            max="45" 
                                                                            value={currentSlopeAngle}
                                                                            onChange={(e) => handleSlopeAngleChange(materialId, e.target.value)}
                                                                            readOnly={!isDraft}
                                                                        />
                                                                        {isDraft && (
                                                                            <button 
                                                                                className="save-slope-button"
                                                                                onClick={() => handleSaveSlopeAngle(materialId)}
                                                                                disabled={isSavingSlope === materialId}
                                                                            >
                                                                                {isSavingSlope === materialId ? (
                                                                                    <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                                                                                ) : null}
                                                                                Сохранить
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                
                                                                <div className="volume-row">
                                                                    <span className="volume-label">
                                                                        Объем после выемки:
                                                                    </span>
                                                                    <span className="volume-value">
                                                                        {getVolumeResult(item)}
                                                                    </span>
                                                                </div>
                                                                
                                                                <div className="actions-row">
                                                                    <button 
                                                                        className="browse-materials-button"
                                                                        onClick={() => navigate(`/materials/${materialId}`)}
                                                                    >
                                                                        Подробнее
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        
                                        {isDraft && (
                                            <div className="pit-actions-container">
                                                <button 
                                                    type="button" 
                                                    className="form-pit-button"
                                                    onClick={handleFormPit}
                                                    disabled={isForming}
                                                >
                                                    {isForming ? (
                                                        <>
                                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                            Отправка...
                                                        </>
                                                    ) : (
                                                        'Отправить на рассмотрение'
                                                    )}
                                                </button>
                                                
                                                <button 
                                                    type="button" 
                                                    className="delete-cart-button"
                                                    onClick={handleDeletePit}
                                                    disabled={deletingPit}
                                                >
                                                    {deletingPit ? (
                                                        <>
                                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                            Удаление...
                                                        </>
                                                    ) : (
                                                        'Удалить заявку'
                                                    )}
                                                </button>
                                            </div>
                                        )}

                                        {(isFormed || isCompleted || isRejected) && (
                                            <div className="pit-status-info">
                                                <div className="status-card">
                                                    <h4>Статус заявки: {getStatusBadge()}</h4>
                                                    <p>
                                                        {isFormed && 'Ваша заявка отправлена на рассмотрение модератору.'}
                                                        {isCompleted && 'Ваша заявка была одобрена и завершена.'}
                                                        {isRejected && 'Ваша заявка была отклонена модератором.'}
                                                    </p>
                                                    <p className="small-text">
                                                        ID заявки: #{pit_id}
                                                    </p>
                                                    <button 
                                                        className="back-to-list-button"
                                                        onClick={() => navigate('/my-pits')}
                                                    >
                                                        Вернуться к списку заявок
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <section className="materials-not-found">
                                        <h3>К сожалению, материалы не добавлены :(</h3>
                                        <p>Добавьте материалы для расчета объема котлована</p>
                                        {isDraft && (
                                            <button 
                                                className="browse-materials-button"
                                                onClick={() => navigate('/materials')}
                                            >
                                                Перейти к материалам
                                            </button>
                                        )}
                                    </section>
                                )}
                            </div>
                        </>
                    )}
                </section>
            </main>
        </div>
    );
};

export default PitsPage;