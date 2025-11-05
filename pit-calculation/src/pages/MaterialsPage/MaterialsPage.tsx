// pages/MaterialsPage.tsx
import { FC, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Spinner } from 'react-bootstrap'
import { Material, getMaterials } from '../../modules/materialsApi'
import Header from '../../components/Header/Header'
import PitButton from '../../components/PitButton/PitButton'
import InputField from '../../components/InputField/InputField'
import MaterialCard from '../../components/MaterialCard/MaterialCard'
import './MaterialsPage.css'

const MaterialsPage: FC = () => {
    const [searchValue, setSearchValue] = useState('')
    const [loading, setLoading] = useState(false)
    const [materials, setMaterials] = useState<Material[]>([])
    const [allMaterials, setAllMaterials] = useState<Material[]>([])
    const navigate = useNavigate()

    const pitData = {
        pitCount: 0,
        hasActivePit: false,
        pitId: 1
    }

    useEffect(() => {
        const loadInitialMaterials = async () => {
            setLoading(true)
            const materialsData = await getMaterials('')
            const filteredMaterials = materialsData.filter(material => !material.is_deleted)
            setAllMaterials(filteredMaterials)
            setMaterials(filteredMaterials)
            setLoading(false)
        }
        
        loadInitialMaterials()
    }, [])

    const handleSearch = (e?: React.FormEvent) => {
        if (e) {
            e.preventDefault()
        }
        
        if (searchValue.trim() === '') {
            setMaterials(allMaterials)
        } else {
            const filtered = allMaterials.filter(material =>
                material.title.toLowerCase().includes(searchValue.toLowerCase())
            )
            setMaterials(filtered)
        }
    }

    const handleCardClick = (id: number) => {
        navigate(`/materials/${id}`)
    }

    return (
        <>
            <Header />
            <main className="main-content">
                <div className="search-pit-container">
                    <div className="search-wrapper">
                        <InputField
                            value={searchValue}
                            setValue={setSearchValue}
                            onSubmit={handleSearch}
                            loading={loading}
                            placeholder="Поиск грунта"
                            buttonTitle="🔍"
                        />
                    </div>
                    <PitButton 
                        pitCount={pitData.pitCount}
                        hasActivePit={pitData.hasActivePit}
                        pitId={pitData.pitId}
                    />
                </div>

                {loading && (
                    <div className="loadingBg">
                        <Spinner animation="border" variant="primary" />
                    </div>
                )}

                <section className="materials-section">
                    <div className="materials-container">
                        {materials.map((material) => (
                            <MaterialCard 
                                key={`material-${material.id}`}
                                {...material}
                                onCardClick={handleCardClick}
                            />
                        ))}
                    </div>
                </section>

                {!materials.length && !loading && (
                    <div className="no-results">
                        <h1>К сожалению, пока ничего не найдено :(</h1>
                    </div>
                )}
            </main>
        </>
    )
}

export default MaterialsPage