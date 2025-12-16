import { FC } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Button } from 'react-bootstrap'
import { setSearchQuery } from '../../store/slices/searchSlice'
import './SearchField.css'

interface Props {
    onSubmit: () => void
    loading?: boolean
    placeholder?: string
    buttonTitle?: string
}

const SearchField: FC<Props> = ({ onSubmit, loading, placeholder, buttonTitle = '🔍' }) => {
    const dispatch = useDispatch()
    
    const searchQuery = useSelector((state: any) => state.search.searchQuery)

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(setSearchQuery(event.target.value))
    }

    const handleSubmit = () => {
        onSubmit()
    }

    return (
        <div className="inputField">
            <input 
                value={searchQuery} 
                placeholder={placeholder} 
                onChange={handleInputChange}
            />
            <Button disabled={loading} onClick={handleSubmit}>
                {buttonTitle}
            </Button>
        </div>
    )
}

export default SearchField