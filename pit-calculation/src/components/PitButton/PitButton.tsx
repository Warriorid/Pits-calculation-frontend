import { FC } from 'react'
import './PitButton.css'

interface Props {
    pitCount: number
    hasActivePit: boolean
    pitId?: number
}

const PitButton: FC<Props> = ({ pitCount, hasActivePit, pitId }) => {
    const buttonContent = (
        <button 
            className={`pit-button ${!hasActivePit ? 'disabled' : ''}`} 
            disabled={!hasActivePit}
        >
            <img src="/static/img/basket_icon.png" alt="Котлован" className="pit-icon" />
            <span className="pit-count">{pitCount}</span>
        </button>
    )

    return (
        <div className="pit-button-container">
            {hasActivePit ? (
                <a href={`/pits-calculations/${pitId}`} className="pit-button-link">
                    {buttonContent}
                </a>
            ) : (
                buttonContent
            )}
        </div>
    )
}

export default PitButton