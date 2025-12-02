// pages/PitsPage/PitsPage.tsx
import { FC, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { getPitApplication } from '../../store/slices/pitDraftSlice';
import Header from '../../components/Header/Header';
import './PitsPage.css';

const PitsPage: FC = () => {
    const { pit_id } = useParams<{ pit_id: string }>();
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const {
        materials,
        pitData,
    } = useSelector((state: RootState) => state.pitDraft);

    const { isAuthenticated } = useSelector((state: RootState) => state.user);

    useEffect(() => {
        if (pit_id && isAuthenticated) {
            setIsLoading(true);
            dispatch(getPitApplication(pit_id))
                .finally(() => setIsLoading(false));
        }
    }, [dispatch, pit_id, isAuthenticated]);

    return (
        <div>
            <Header />
            <main className="main-content">
                <section className="pits-section">
                    <h1 className="pits-title">Параметры котлована</h1>
                    
                    
                    {isLoading ? (
                        <div className="loading-container">
                            <div className="spinner"></div>
                            <p>Загрузка данных заявки...</p>
                        </div>
                    ) : (
                        <>
                            <div className="pit-parameters">
                                <div className="parameter-input">
                                    <label htmlFor="length">Длина (м)</label>
                                    <input 
                                        type="number" 
                                        id="length" 
                                        placeholder="0.0" 
                                        step="0.1" 
                                        min="0" 
                                        value={pitData.pit_length || ''}
                                        readOnly
                                    />
                                </div>
                                <div className="parameter-input">
                                    <label htmlFor="width">Ширина (м)</label>
                                    <input 
                                        type="number" 
                                        id="width" 
                                        placeholder="0.0" 
                                        step="0.1" 
                                        min="0" 
                                        value={pitData.pit_width || ''}
                                        readOnly
                                    />
                                </div>
                                <div className="parameter-input">
                                    <label htmlFor="depth">Глубина (м)</label>
                                    <input 
                                        type="number" 
                                        id="depth" 
                                        placeholder="0.0" 
                                        step="0.1" 
                                        min="0" 
                                        value={pitData.pit_depth || ''}
                                        readOnly
                                    />
                                </div>
                            </div>

                            <div className="pit-items">
                                {materials.length ? (
                                    <>
                                        <div className="materials-list">
                                            {materials.map((item) => (
                                                item.material && (
                                                    <div key={item.material.id} className="pit-material-card">
                                                        <div className="pit-material-image">
                                                            <img 
                                                                src={item.material.image_url || '/static/img/default_image.png'} 
                                                                alt={item.material.title || 'Материал'}
                                                                onError={(e) => {
                                                                    e.currentTarget.src = '/static/img/default_image.png';
                                                                }}
                                                            />
                                                        </div>
                                                        
                                                        <div className="pit-material-content">
                                                            <div className="card-header">
                                                                <span className="coefficient-header">
                                                                    Коэффициент разрыхления: {item.material.coefficient || 0}
                                                                </span>
                                                            </div>
                                            
                                                            <div className="card-body">
                                                                <span className="material-name">
                                                                    {item.material.title || 'Без названия'}
                                                                </span>
                                                                <button 
                                                                    className="material-details-link"
                                                                    onClick={() => navigate(`/materials/${item.material?.id}`)}
                                                                >
                                                                    подробнее
                                                                </button>
                                                                <div className="slope-input-group">
                                                                    <input 
                                                                        type="number" 
                                                                        className="slope-input" 
                                                                        placeholder="Угол откоса" 
                                                                        step="1" 
                                                                        min="0" 
                                                                        max="45" 
                                                                        value={item.slope_angle || 0}
                                                                        readOnly
                                                                    />
                                                                </div>
                                                                <span className="volume-result">
                                                                    Объем грунта после выемки: {item.material.coefficient || 0} м³
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            ))}
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