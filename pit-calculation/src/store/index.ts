// store/index.ts
import { configureStore } from '@reduxjs/toolkit'
import searchReducer from './slices/searchSlice'
import userReducer from './slices/userSlice'
import pitDraftReducer from './slices/pitDraftSlice'

export const store = configureStore({
  reducer: {
    search: searchReducer,
    user: userReducer,
    pitDraft: pitDraftReducer
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch