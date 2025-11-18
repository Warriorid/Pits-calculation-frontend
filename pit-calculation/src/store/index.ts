import { configureStore } from '@reduxjs/toolkit'
import materialsReducer from './slices/materialsSlice'
import pitReducer from './slices/pitSlice'

export const store = configureStore({
  reducer: {
    materials: materialsReducer,
    pit: pitReducer
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch