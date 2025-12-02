import { FC, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { 
    getPitApplication, 
    updatePitParams, 
    updateMaterialSlopeAngle,
    deleteMaterialFromPit 
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
        deletingMaterialId
    } = useSelector((state: RootState) => state.pitDraft);

    const { isAuthenticated } = useSelector((state: RootState) => state.user);

    useEffect(() => {
        if (pit_id && isAuthenticated) {
            setIsLoading(true);
            dispatch(getPitApplication(pit_id))
                .finally(() => setIsLoading(false));
        }
    }, [dispatch, pit_id, isAuthenticated]);

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

    const isDraft = pitData?.status === 'draft';

    const safeNumber = (value: number | null | undefined): number => {
        return value || 0;
    };

    const getVolumeResult = (item: any): string => {
        const volumeResult = item.volume_result || (item as any).volume_result;
        return `Объем после выемки: ${safeNumber(volumeResult)} м³`;
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
                    <h1 className="pits-title">Параметры котлована</h1>
                    
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
                                        <div className="materials-list">
                                            {materials.map((item: any, index: number) => {
                                                const materialId = getMaterialId(item);
                                                if (!materialId) return null;
                                                
                                                const currentSlopeAngle = slopeAngles[materialId] || 
                                                                         item.slope_angle || 0;
                                                const isDeleting = deletingMaterialId === materialId;
                                                
                                                return (
                                                    <div key={materialId || index} className="pit-material-card">
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
                                                                <span className="coefficient-header">
                                                                    Коэффициент разрыхления: {safeNumber(getCoefficient(item))}
                                                                </span>
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
                                                                <span className="material-name">
                                                                    {getMaterialTitle(item)}
                                                                </span>
                                                                <button 
                                                                    className="material-details-link"
                                                                    onClick={() => navigate(`/materials/${materialId}`)}
                                                                >
                                                                    подробнее
                                                                </button>
                                                                <div className="slope-input-group">
                                                                    <input 
                                                                        type="number" 
                                                                        className={`slope-input ${!isDraft ? 'read-only-field' : ''}`}
                                                                        placeholder="Угол откоса" 
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
                                                                <span className="volume-result">
                                                                    {getVolumeResult(item)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <div className="delete-cart-container">
                                            <form className="delete-cart-form">
                                                <button 
                                                    type="button" 
                                                    className="delete-cart-button"
                                                    onClick={() => navigate('/materials')}
                                                >
                                                    Удалить заявку
                                                </button>
                                            </form>
                                        </div>
                                    </>
                                ) : (
                                    <section className="materials-not-found">
                                        <h3>К сожалению, материалы не добавлены :(</h3>
                                        <p>Добавьте материалы для расчета объема котлована</p>
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