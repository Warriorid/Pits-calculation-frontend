import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { useSelector } from 'react-redux'

export interface Material {
  id: number
  title: string
  coefficient: number
  image_url: string
  description: string
}

interface MaterialsState {
  materials: Material[]
  loading: boolean
  error: string | null
  selectedMaterial: Material | null
}

const initialState: MaterialsState = {
  materials: [],
  loading: false,
  error: null,
  selectedMaterial: null
}

export const fetchMaterials = createAsyncThunk(
  'materials/fetchMaterials',
  async () => {
    const response = await fetch('/api/materials')
    return await response.json()
  }
)

const materialsSlice = createSlice({
  name: 'materials',
  initialState,
  reducers: {
    setMaterials: (state, action) => {
      state.materials = action.payload
    },
    setSelectedMaterial: (state, action) => {
      state.selectedMaterial = action.payload
    },
    clearSelectedMaterial: (state) => {
      state.selectedMaterial = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMaterials.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchMaterials.fulfilled, (state, action) => {
        state.loading = false
        state.materials = action.payload
      })
      .addCase(fetchMaterials.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch materials'
      })
  }
})
export const useMaterials = () =>
  useSelector((state: { materials: MaterialsState }) => state.materials.materials)

export const useSelectedMaterial = () =>
  useSelector((state: { materials: MaterialsState }) => state.materials.selectedMaterial)

export const useMaterialsLoading = () =>
  useSelector((state: { materials: MaterialsState }) => state.materials.loading)

export const { setMaterials, setSelectedMaterial, clearSelectedMaterial } = materialsSlice.actions

export default materialsSlice.reducer