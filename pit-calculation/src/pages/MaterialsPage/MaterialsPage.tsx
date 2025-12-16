import { FC, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Spinner } from 'react-bootstrap'
import { Material, getMaterials } from '../../modules/materialsApi'
import Header from '../../components/Header/Header'
import PitButton from '../../components/PitButton/PitButton'
import SearchField from '../../components/SearchField/SearchField'
import MaterialCard from '../../components/MaterialCard/MaterialCard'
import { 
  setSearchResults,
  clearSearch
} from '../../store/slices/searchSlice'
import './MaterialsPage.css'

import type { RootState, AppDispatch } from '../../store'

const MaterialsPage: FC = () => {
    const dispatch = useDispatch<AppDispatch>() 
    const navigate = useNavigate()
    
    const searchQuery = useSelector((state: RootState) => state.search.searchQuery)
    const searchResults = useSelector((state: RootState) => state.search.searchResults)
    const hasSearched = useSelector((state: RootState) => state.search.hasSearched)
    
    const [loading, setLoading] = useState(false)
    const [allMaterials, setAllMaterials] = useState<Material[]>([])

    useEffect(() => {
        const loadInitialMaterials = async () => {
            setLoading(true)
            const materialsData = await getMaterials()
            const filteredMaterials = materialsData.filter(material => !material.is_deleted)
            setAllMaterials(filteredMaterials)
            setLoading(false)
        }
        loadInitialMaterials()
    }, [dispatch])

    const materialsToShow = hasSearched ? searchResults : allMaterials

    const handleSearch = () => {
        if (searchQuery.trim() === '') {
            dispatch(clearSearch())
        } else {
            const filtered = allMaterials.filter(material =>
                material.title.toLowerCase().includes(searchQuery.toLowerCase())
            )
            dispatch(setSearchResults(filtered))
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
                        <SearchField
                            onSubmit={handleSearch}
                            loading={loading}
                            placeholder="Поиск грунта"
                            buttonTitle="🔍"
                        />
                    </div>
                    <PitButton />
                </div>

                {loading && (
                    <div className="loadingBg">
                        <Spinner animation="border" variant="primary" />
                    </div>
                )}

                <section className="materials-section">
                    <div className="materials-container">
                        {materialsToShow.map((material) => (
                            <MaterialCard 
                                key={`material-${material.id}`}
                                {...material}
                                onCardClick={handleCardClick}
                            />
                        ))}
                    </div>
                </section>

                {!materialsToShow.length && !loading && (
                    <div className="no-results">
                        <h1>К сожалению, пока ничего не найдено :(</h1>
                    </div>
                )}
            </main>
        </>
    )
}

export default MaterialsPage