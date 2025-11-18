import { FC } from 'react'
import { getStaticPath } from '../../utils/paths'
import './PitButton.css'

interface Props {
    pitCount: number
    hasActivePit: boolean
    pitId?: number
}

const PitButton: FC<Props> = ({ pitCount }) => {
    const handlePitClick = (e: React.MouseEvent) => {
        e.preventDefault()
        return -1
    }

    return (
        <div className="pit-button-container">
            <button 
                className="pit-button" 
                onClick={handlePitClick}
            >
                <img src={getStaticPath('static/img/basket_icon.png')} alt="Котлован" className="pit-icon" />
                <span className="pit-count">{pitCount}</span>
            </button>
        </div>
    )
}

export default PitButton