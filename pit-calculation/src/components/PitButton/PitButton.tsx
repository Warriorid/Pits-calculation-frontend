// components/PitButton/PitButton.tsx
import { FC, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { getStaticImagePath } from '../../utils/imageUtils';
import './PitButton.css';

interface DraftPitResponse {
    pit_id?: number;
    pits_count?: number;
}

const PitButton: FC = () => {
    const [pitId, setPitId] = useState<number | null>(null);
    const [count, setCount] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    
    const { isAuthenticated } = useSelector((state: RootState) => state.user);

    const fetchDraftCount = async () => {
        if (!isAuthenticated) {
            setCount(0);
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
                const data: DraftPitResponse | number = await response.json();
                
                if (typeof data === 'number') {
                    setCount(data === -1 ? 0 : data);
                    setPitId(null);
                } else if (data && typeof data.pit_id === 'number') {
                    setCount(data.pits_count || 0);
                    setPitId(data.pit_id);
                } else {
                    setCount(0);
                    setPitId(null);
                }
            } else {
                setError('Ошибка загрузки');
                setCount(0);
                setPitId(null);
            }
        } catch (error) {
            console.error('Network error fetching draft pit:', error);
            setError('Ошибка сети');
            setCount(0);
            setPitId(null);
        } finally {
            setLoading(false);
        }
    };

    const handlePitClick = (e: React.MouseEvent) => {
        e.preventDefault();
        if (pitId && isAuthenticated) {
            navigate(`/pits/${pitId}`);
        } else if (isAuthenticated) {
            navigate('/pits');
        } else {
            navigate('/login');
        }
    };

    useEffect(() => {
        fetchDraftCount();
        
        const interval = setInterval(fetchDraftCount, 30000);
        return () => clearInterval(interval);
    }, [isAuthenticated]);

    return (
        <div className="pit-button-container">
            <button 
                className="pit-button" 
                onClick={handlePitClick}
                title={error 
                    ? `Ошибка: ${error}` 
                    : count > 0 
                        ? `Материалов в заявке: ${count}` 
                        : "Заявка пуста"}
                disabled={!isAuthenticated}
            >
                <img src={getStaticImagePath('basket_icon.png')} alt="Заявка" className="pit-icon" />
                <span className="pit-count" style={error ? {color: 'red'} : {}}>
                    {loading ? '...' : error ? '!' : count}
                </span>
            </button>
        </div>
    );
};

export default PitButton;