import { FC, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { getStaticImagePath } from '../../utils/imageUtils';
import { fetchDraftCount } from '../../store/slices/pitDraftSlice'; 
import './PitButton.css';

const PitButton: FC = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>(); 
    
    const { isAuthenticated } = useSelector((state: RootState) => state.user);
    const { count, currentPitId } = useSelector((state: RootState) => state.pitDraft);
    
    const hasFetchedRef = useRef(false);

    useEffect(() => {
        if (isAuthenticated && !hasFetchedRef.current) {
            console.log('🔍 PitButton: Загружаем счетчик черновика...');
            dispatch(fetchDraftCount());
            hasFetchedRef.current = true;
        }
    }, [isAuthenticated, dispatch]);

    const handlePitClick = (e: React.MouseEvent) => {
        e.preventDefault();
        
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        hasFetchedRef.current = false;
        dispatch(fetchDraftCount()).then(() => {
            const state = store.getState().pitDraft;
            const pitId = state.currentPitId;
            const hasDraft = pitId && pitId > 0;
            
            if (hasDraft) {
                navigate(`/pits/${pitId}`);
            } 
        });
    };
    
    const hasDraft = currentPitId && currentPitId > 0;
    
    let titleText = "Заявка";
    if (hasDraft) {
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
                disabled={!isAuthenticated}
            >
                <img 
                    src={getStaticImagePath('basket_icon.png')} 
                    alt="Заявка" 
                    className="pit-icon" 
                    style={!hasDraft ? { opacity: 0.5 } : {}}
                />
                <span className="pit-count">
                    {hasDraft ? count : 0}
                </span>
            </button>
        </div>
    );
};

import { store } from '../../store';

export default PitButton;