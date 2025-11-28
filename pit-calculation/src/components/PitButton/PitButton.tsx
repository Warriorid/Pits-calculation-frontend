import { FC } from 'react'
import { getStaticImagePath } from '../../utils/imageUtils'
import './PitButton.css'

const PitButton: FC = () => {
    const handlePitClick = async (e: React.MouseEvent) => {
        e.preventDefault()
        
        try {
            const response = await fetch('/api/pits/draft', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            
            const data = await response.json();
            
            if (response.ok) {
                return data.pit_id;
            } else {
                console.error('Error fetching draft pit:', data);
                return -1;
            }
        } catch (error) {
            console.error('Network error:', error);
            return -1;
        }
    }

    return (
        <div className="pit-button-container">
            <button 
                className="pit-button" 
                onClick={handlePitClick}
            >
                <img src={getStaticImagePath('basket_icon.png')} alt="Котлован" className="pit-icon" />
                <span className="pit-count">0</span>
            </button>
        </div>
    )
}

export default PitButton