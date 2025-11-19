import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { useSelector } from 'react-redux'
import { Material } from '../../modules/materialsApi'

interface SearchState {
  searchQuery: string
  searchResults: Material[]
  hasSearched: boolean
}

const initialState: SearchState = {
  searchQuery: '',
  searchResults: [],
  hasSearched: false
}

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload
    },
    setSearchResults: (state, action: PayloadAction<Material[]>) => {
      state.searchResults = action.payload
      state.hasSearched = true
    },
    clearSearch: (state) => {
      state.searchQuery = ''
      state.searchResults = []
      state.hasSearched = false
    },
    resetSearchFlag: (state) => {
      state.hasSearched = false
    }
  }
})

export const useSearchQuery = () =>
  useSelector((state: { search: SearchState }) => state.search.searchQuery)

export const useSearchResults = () =>
  useSelector((state: { search: SearchState }) => state.search.searchResults)

export const useHasSearched = () =>
  useSelector((state: { search: SearchState }) => state.search.hasSearched)

export const { setSearchQuery, setSearchResults, clearSearch, resetSearchFlag } = searchSlice.actions

export default searchSlice.reducer