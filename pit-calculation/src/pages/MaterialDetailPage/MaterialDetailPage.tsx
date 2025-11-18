import { FC, useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Spinner } from 'react-bootstrap'
import { Material, getMaterialById } from '../../modules/materialsApi'
import Header from '../../components/Header/Header'
import { BreadCrumbs } from '../../components/BreadCrumbs/BreadCrumbs'
import { getStaticPath } from '../../utils/paths'
import { ROUTES, ROUTE_LABELS } from '../../Routers'
import './MaterialDetailPage.css'

const MaterialDetailPage: FC = () => {
    const { id } = useParams<{ id: string }>()
    const [material, setMaterial] = useState<Material | null>(null)
    const [loading, setLoading] = useState(true)

    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        e.currentTarget.src = getStaticPath('static/img/defaultImage.png')
    }

    useEffect(() => {
        const loadMaterial = async () => {
            if (!id) return
            
            setLoading(true)
            try {
                const materialData = await getMaterialById(parseInt(id))
                setMaterial(materialData)
            } catch (error) {
                console.error('Error loading material:', error)
            } finally {
                setLoading(false)
            }
        }

        loadMaterial()
    }, [id])

    const breadCrumbs = [
        { label: ROUTE_LABELS.MATERIALS, path: ROUTES.MATERIALS },
        { label: material?.title || 'Загрузка...' }
    ]

    if (loading) {
        return (
            <>
                <Header />
                <div className="loadingBg">
                    <Spinner animation="border" variant="primary" />
                </div>
            </>
        )
    }

    if (!material) {
        return (
            <>
                <Header />
                <div className="no-results">
                    <h1>Материал не найден</h1>
                    <Link to="/materials" className="material-back">
                        Вернуться к материалам
                    </Link>
                </div>
            </>
        )
    }

    return (
        <>
            <Header />
            <main className="main-content">
                <BreadCrumbs crumbs={breadCrumbs} />
                
                <div className="material-button-container">
                    <Link to="/materials" className="material-back">
                        ← Назад к материалам
                    </Link>
                </div>

                <section className="material-detail-section">
                    <div className="material-detail-container">
                        <div className="material-detail-image">
                            <img 
                                src={material.image_url || getStaticPath('static/img/defaultImage.png')} 
                                alt={material.title}
                                onError={handleImageError}
                            />
                        </div>
                        <div className="material-detail-content">
                            <h1 className="material-detail-title">{material.title}</h1>
                            <div className="material-detail-coefficient">
                                Коэффициент разрыхления: <span>{material.coefficient}</span>
                            </div>
                            <p className="material-detail-description">
                                {material.description}
                            </p>
                        </div>
                    </div>
                </section>
            </main>
        </>
    )
}

export default MaterialDetailPage