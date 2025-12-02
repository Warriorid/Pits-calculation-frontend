import { FC, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { getStaticImagePath } from '../../utils/imageUtils';
import { fetchDraftCount } from '../../store/slices/pitDraftSlice'; 
import './PitButton.css';

interface DraftPitResponse {
    pit_id?: number;
    pits_count?: number;
}

const PitButton: FC = () => {
    const [pitId, setPitId] = useState<number | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>(); 
    
    const { isAuthenticated } = useSelector((state: RootState) => state.user);
    const { count } = useSelector((state: RootState) => state.pitDraft);

    const fetchDraftData = async () => {
        if (!isAuthenticated) {
            setPitId(null);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('token');
            
            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
            };
            
            if (token && token.trim() !== '') {
                if (token.startsWith('Bearer ')) {
                    headers['Authorization'] = token;
                } else if (token.includes(' ')) {
                    headers['Authorization'] = token;
                } else {
                    headers['Authorization'] = `Bearer ${token}`;
                }
            }
            
            const response = await fetch('/api/pits/draft', {
                method: 'GET',
                headers: headers,
            });
            
            if (response.ok) {
                const data: DraftPitResponse = await response.json();
                if (data.pit_id && data.pit_id > 0) {
                    setPitId(data.pit_id);
                } else {
                    setPitId(null); 
                }
            } else {
                setError('Ошибка загрузки');
                setPitId(null);
            }
        } catch (error) {
            console.error('Network error fetching draft pit:', error);
            setError('Ошибка сети');
            setPitId(null);
        } finally {
            setLoading(false);
        }
    };

    const handlePitClick = (e: React.MouseEvent) => {
        e.preventDefault();
        if (pitId && isAuthenticated) {
            // Есть черновик - переходим к редактированию
            navigate(`/pits/${pitId}`);
        } else if (isAuthenticated) {
            // Нет черновика - показываем пустую страницу или создаем новый
            navigate('/pits');
        } else {
            // Не авторизован - на страницу входа
            navigate('/login');
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            dispatch(fetchDraftCount());
            fetchDraftData();
        }
        
        const interval = setInterval(() => {
            if (isAuthenticated) {
                dispatch(fetchDraftCount());
            }
        }, 30000);
        
        return () => clearInterval(interval);
    }, [isAuthenticated, dispatch]);

    // Определяем, есть ли черновик
    const hasDraft = pitId !== null && pitId > 0;
    
    // Определяем title в зависимости от состояния
    let titleText = "Заявка";
    if (error) {
        titleText = `Ошибка: ${error}`;
    } else if (hasDraft) {
        titleText = count > 0 
            ? `Материалов в заявке: ${count} (Черновик)` 
            : "Заявка пуста (Черновик)";
    } else {
        titleText = "Нет активной заявки";
    }

    return (
        <div className="pit-button-container">
            <button 
                className={`pit-button ${!hasDraft ? 'no-draft' : ''}`}
                onClick={handlePitClick}
                title={titleText}
                disabled={!isAuthenticated || (!hasDraft && count === 0)}
            >
                <img 
                    src={getStaticImagePath('basket_icon.png')} 
                    alt="Заявка" 
                    className="pit-icon" 
                    style={!hasDraft ? { opacity: 0.5 } : {}}
                />
                <span className="pit-count" style={error ? {color: 'red'} : {}}>
                    {loading ? '...' : error ? '!' : count}
                </span>
            </button>
        </div>
    );
};

export default PitButton;