import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Api } from '../../api/Api';

const createApiWithToken = () => {
    return new Api({
      securityWorker: () => {
        const token = localStorage.getItem('token');
        if (token) {
          return {
            headers: {
              Authorization: token,
            },
          };
        }
        return {};
      },
    });
  };
  
const api = createApiWithToken();
interface MaterialInPit {
    material?: {
        id?: number;
        title?: string;
        coefficient?: number;
        description?: string;
        image_url?: string;
        is_deleted?: boolean;
    } | undefined;
    count?: number | undefined;
    slope_angle?: number | undefined;
}

interface PitData {
    pit_length?: number | null;
    pit_width?: number | null;
    pit_depth?: number | null;
    status?: string | null;
}

interface PitDraftState {
    pit_id?: number;
    count: number | undefined;
    materials: MaterialInPit[];
    pitData: PitData;
    error: string | null;
}

const initialState: PitDraftState = {
    pit_id: NaN,
    count: NaN,
    materials: [],
    pitData: {
        pit_length: null,
        pit_width: null,
        pit_depth: null,
        status: null
    },
    error: null,
};

export const getPitApplication = createAsyncThunk(
    'pitDraft/getPitApplication',
    async (pitId: string) => {
        const response = await api.pits.pitsDetail(parseInt(pitId));
        return response.data;
    }
);

export const addMaterialToPit = createAsyncThunk(
    'pitDraft/addMaterialToPit',
    async (materialId: number, { rejectWithValue }) => {
        try {
            const response = await api.materials.postMaterials(materialId);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Ошибка при добавлении материала');
        }
    }
);
const pitDraftSlice = createSlice({
    name: 'pitDraft',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getPitApplication.fulfilled, (state, action) => {
                const { materials, ...pitData } = action.payload;
                if (pitData && materials) {
                    state.pit_id = pitData.id;
                    state.pitData = {
                        pit_length: pitData.pit_length,
                        pit_width: pitData.pit_width,
                        pit_depth: pitData.pit_depth,
                        status: pitData.status
                    };
                    state.materials = materials.map(material => ({
                        material: {
                            id: material.id,
                            title: material.title,
                            coefficient: material.coefficient,
                            description: material.description,
                            image_url: material.image_url,
                            is_deleted: material.is_deleted
                        },
                        count: 1,
                        slope_angle: material.slope_angle
                    })) || [];
                }
            })
            .addCase(getPitApplication.rejected, (state) => {
                state.error = 'Ошибка при загрузке данных заявки';
            })
            .addCase(addMaterialToPit.fulfilled, (state) => {
                state.count = state.materials.length + 1;
            })
            .addCase(addMaterialToPit.rejected, (state, action) => {
                state.error = action.payload as string;
            });
    }
});

export const { clearError } = pitDraftSlice.actions;
export default pitDraftSlice.reducer;