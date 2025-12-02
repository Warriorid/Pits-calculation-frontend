import { FC, useState } from 'react'; 
import { useLocation } from 'react-router-dom';
import { Row, Col, Button } from 'react-bootstrap'; 
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { getStaticImagePath } from '../../utils/imageUtils';
import './MaterialCard.css';
import { addMaterialToPit, fetchDraftCount } from '../../store/slices/pitDraftSlice'; // Убрали checkMaterialInPit

interface Props {
    id: number;
    title: string;
    coefficient: number;
    image_url: string;
    description: string;
    onCardClick: (id: number) => void;
    slope_angle?: number;
    showAddButton?: boolean;
}

const MaterialCard: FC<Props> = ({ 
    id,
    title, 
    coefficient, 
    image_url,
    onCardClick,
    slope_angle,
    showAddButton = true
}) => {
    const location = useLocation();
    const dispatch = useDispatch<AppDispatch>();
    const { isAuthenticated } = useSelector((state: RootState) => state.user);
    const [loading, setLoading] = useState(false); 
    const [, setAddError] = useState<string | null>(null); 
    const [, setSuccess] = useState(false);

    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        e.currentTarget.src = getStaticImagePath('defaultImage.png');
    };
    
    const handleAddToPit = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isAuthenticated) {
            try {
                setLoading(true);
                setAddError(null);
                setSuccess(false);
                
                await dispatch(addMaterialToPit(id)).unwrap();
                await dispatch(fetchDraftCount());
                
                setSuccess(true);
                setTimeout(() => setSuccess(false), 3000);
            } catch (error: any) {
                setAddError(error?.message || 'Ошибка при добавлении материала');
            } finally {
                setLoading(false);
            }
        }
    };
    if (location.pathname.includes('/pits/')) {
        return (
            <div className="pit-material-card">
                <Row>
                    <Col xs={3} sm={3} md={3}>
                        <div className="material-image-small">
                            <img 
                                src={image_url || getStaticImagePath('defaultImage.png')}
                                alt={title}
                                onError={handleImageError}
                            />
                        </div>
                    </Col>
                    <Col xs={9} sm={9} md={9}>
                        <div className="pit-material-body">
                            <h5>{title}</h5>
                            <div className="material-properties">
                                <Row>
                                    <Col xs={6}>
                                        <p><strong>Коэффициент:</strong> {coefficient}</p>
                                    </Col>
                                    <Col xs={6}>
                                        {slope_angle && (
                                            <p><strong>Угол откоса:</strong> {slope_angle}°</p>
                                        )}
                                    </Col>
                                </Row>
                            </div>
                            <Row>
                                <Col xs={12}>
                                    <Button 
                                        variant="outline-primary"
                                        className="material-details-btn"
                                        onClick={() => onCardClick(id)}
                                    >
                                        Подробнее
                                    </Button>
                                </Col>
                            </Row>
                        </div>
                    </Col>
                </Row>
            </div>
        );
    }
    return (
        <div className="material-card" onClick={() => onCardClick(id)}>
            <div className="material-image">
                <img 
                    src={image_url || getStaticImagePath('defaultImage.png')}
                    alt={title}
                    onError={handleImageError}
                />
            </div>
            <div className="material-content">
                <h3 className="material-title">{title}</h3>
                <p className="material-coefficient">
                    Коэффициент разрыхления: <span>{coefficient}</span>
                </p>
                

                
                <div className="material-actions">
                    {showAddButton && isAuthenticated && (
                        <button 
                            className={`material-add ${loading ? 'disabled' : ''}`}
                            onClick={handleAddToPit}
                            disabled={loading}
                        >
                            {loading ? 'Добавление...' : 'Добавить'}
                        </button>
                    )}
                    <button 
                        className="material-details"
                        onClick={(e) => {
                            e.stopPropagation();
                            onCardClick(id);
                        }}
                    >
                        Подробнее
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MaterialCard;