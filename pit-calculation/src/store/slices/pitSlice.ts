import { createSlice } from '@reduxjs/toolkit'
import { useSelector } from 'react-redux'

interface PitState {
    materialsCount: number
}

const initialState: PitState = {
    materialsCount: 0
}

const pitSlice = createSlice({
    name: 'pit',
    initialState,
    reducers: {
        incrementPitCount: (state) => {
            state.materialsCount += 1
        },
        decrementPitCount: (state) => {
            if (state.materialsCount > 0) {
                state.materialsCount -= 1
            }
        },
        setPitCount: (state, action) => {
            state.materialsCount = action.payload
        }
    }
})

export const usePitMaterialsCount = () =>
    useSelector((state: { pit: PitState }) => state.pit.materialsCount)

export const { incrementPitCount, decrementPitCount, setPitCount } = pitSlice.actions

export default pitSlice.reducer