// MaterialCard.tsx
import { FC } from 'react'
import './MaterialCard.css'

interface Props {
    id: number
    title: string
    coefficient: number
    image_url: string
    description: string
    onCardClick: (id: number) => void
}

const MaterialCard: FC<Props> = ({ 
    id,
    title, 
    coefficient, 
    image_url,
    onCardClick
}) => {
    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        e.currentTarget.src = '/static/img/defaultImage.png'
    }

    const handleAddToPit = (e: React.MouseEvent) => {
        e.stopPropagation()
        console.log('Функция "Добавить" временно недоступна')
    }

    return (
        <div className="material-card" onClick={() => onCardClick(id)}>
            <div className="material-image">
                <img 
                    src={image_url || '/static/img/defaultImage.png'} 
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
                    <button 
                        className="material-details"
                        onClick={(e) => {
                            e.stopPropagation()
                            onCardClick(id)
                        }}
                    >
                        Подробнее
                    </button>
                </div>
            </div>
        </div>
    )
}

export default MaterialCard