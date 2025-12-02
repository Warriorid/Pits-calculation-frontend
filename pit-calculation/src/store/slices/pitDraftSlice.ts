import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Api } from '../../api/Api';

// Определите интерфейс для ответа от draftList
interface DraftListResponse {
    pits_count?: number;
    pit_id?: number;
}

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
    count: number;
    materials: MaterialInPit[];
    pitData: PitData;
    error: string | null;
}

const initialState: PitDraftState = {
    pit_id: NaN,
    count: 0,
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
    async (materialId: number, { rejectWithValue, dispatch }) => {
        try {
            const response = await api.materials.postMaterials(materialId);
            
            dispatch(fetchDraftCount());
            
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Ошибка при добавлении материала');
        }
    }
);

export const fetchDraftCount = createAsyncThunk<DraftListResponse | number>(
    'pitDraft/fetchDraftCount',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.pits.draftList();
            return response.data as DraftListResponse | number;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Ошибка при загрузке корзины');
        }
    }
);

const pitDraftSlice = createSlice({
    name: 'pitDraft',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        incrementCount: (state) => {
            state.count += 1;
        },
        setCount: (state, action) => {
            state.count = action.payload;
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
                    state.count = materials.length;
                }
            })
            .addCase(getPitApplication.rejected, (state) => {
                state.error = 'Ошибка при загрузке данных заявки';
            })
            .addCase(addMaterialToPit.fulfilled, (state) => {
                state.count += 1;
                state.error = null;
            })
            .addCase(addMaterialToPit.rejected, (state, action) => {
                state.error = action.payload as string;
            })
            .addCase(fetchDraftCount.fulfilled, (state, action) => {
                const data = action.payload;
                if (typeof data === 'number') {
                    state.count = data === -1 ? 0 : data;
                } else if (data && 'pits_count' in data && typeof data.pits_count === 'number') {
                    state.count = data.pits_count;
                }
            })
            .addCase(fetchDraftCount.rejected, (state, action) => {
                state.error = action.payload as string;
            });
    }
});

export const { clearError, incrementCount, setCount } = pitDraftSlice.actions;
export default pitDraftSlice.reducer;