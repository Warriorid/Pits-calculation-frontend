
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Api } from '../../api/Api'
import { ModelUpdatePitParam } from '../../api/Api';

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
    deletingMaterialId: number | null;
    deletingPit: boolean;
    currentPitId?: number;
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
    deletingMaterialId: null,
    deletingPit: false,
    currentPitId: 0,
};

// Вспомогательная функция для получения ID материала
const getMaterialId = (material: MaterialInPit): number | undefined => {
    return material.material?.id;
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

export const fetchDraftCount = createAsyncThunk<DraftListResponse>(
    'pitDraft/fetchDraftCount',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.pits.draftList();
            return response.data as DraftListResponse;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Ошибка при загрузке корзины');
        }
    }
);

export const updatePitParams = createAsyncThunk(
    'pitDraft/updatePitParams',
    async (
        { pitId, params }: { pitId: number; params: ModelUpdatePitParam },
        { rejectWithValue, }
    ) => {
        try {
            await api.pits.pitsUpdate(pitId, params);
            
            return params;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Ошибка при обновлении параметров котлована');
        }
    }
);
export const formPitDraft = createAsyncThunk(
    'pitDraft/formPitDraft',
    async (
        pitId: number,
        { rejectWithValue, dispatch }
    ) => {
        try {
            await api.pits.formUpdate(pitId);
            
            dispatch(fetchDraftCount());
            
            return pitId;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Ошибка при формировании заявки');
        }
    }
);

export const updateMaterialSlopeAngle = createAsyncThunk(
    'pitDraft/updateMaterialSlopeAngle',
    async (
        { calculationId, materialId, slopeAngle }: { calculationId: number; materialId: number; slopeAngle: number },
        { rejectWithValue }
    ) => {
        try {
            await api.calculationMaterials.calculationMaterialsUpdate(
                calculationId,
                materialId,
                { slope_angle: slopeAngle }
            );
            
            return { materialId, slopeAngle };
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Ошибка при обновлении угла откоса');
        }
    }
);

export const deleteMaterialFromPit = createAsyncThunk(
    'pitDraft/deleteMaterialFromPit',
    async (
        { calculationId, materialId }: { calculationId: number; materialId: number },
        { rejectWithValue, dispatch }
    ) => {
        try {
            await api.calculationMaterials.calculationMaterialsDelete(calculationId, materialId);
            
            dispatch(fetchDraftCount());
            
            return materialId;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Ошибка при удалении материала из заявки');
        }
    }
);

// Новый thunk для удаления заявки
export const deletePitDraft = createAsyncThunk(
    'pitDraft/deletePitDraft',
    async (
        pitId: number,
        { rejectWithValue, dispatch }
    ) => {
        try {
            await api.pits.pitsDelete(pitId);
            
            // Обновляем счетчик черновика
            dispatch(fetchDraftCount());
            
            return pitId;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Ошибка при удалении заявки');
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
        },
        clearPitDraft: (state) => {
            state.pit_id = NaN;
            state.count = 0;
            state.materials = [];
            state.pitData = {
                pit_length: null,
                pit_width: null,
                pit_depth: null,
                status: null
            };
            state.error = null;
            state.deletingMaterialId = null;
            state.deletingPit = false;
        },
        setDeletingMaterialId: (state, action) => {
            state.deletingMaterialId = action.payload;
        },
        // Редуктор для сброса состояния удаления заявки
        resetDeletingPit: (state) => {
            state.deletingPit = false;
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
                state.deletingMaterialId = null;
                state.error = null;
            })
            .addCase(getPitApplication.rejected, (state) => {
                state.error = 'Ошибка при загрузке данных заявки';
                state.deletingMaterialId = null;
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
                if (data && typeof data === 'object') {
                    state.count = data.pits_count || 0;
                    state.currentPitId = data.pit_id || 0;
                }
                state.error = null;
            })
            .addCase(updatePitParams.fulfilled, (state, action) => {
                const { pit_depth, pit_length, pit_width } = action.payload;
                if (state.pitData) {
                    if (pit_depth !== undefined) state.pitData.pit_depth = pit_depth;
                    if (pit_length !== undefined) state.pitData.pit_length = pit_length;
                    if (pit_width !== undefined) state.pitData.pit_width = pit_width;
                }
                state.error = null;
            })
            .addCase(updatePitParams.rejected, (state, action) => {
                state.error = action.payload as string;
            })
            .addCase(updateMaterialSlopeAngle.fulfilled, (state, action) => {
                const { materialId, slopeAngle } = action.payload;
                state.materials = state.materials.map(material => {
                    const currentMaterialId = getMaterialId(material);
                    if (currentMaterialId === materialId) {
                        return {
                            ...material,
                            slope_angle: slopeAngle
                        };
                    }
                    return material;
                });
                state.error = null;
            })
            .addCase(updateMaterialSlopeAngle.rejected, (state, action) => {
                state.error = action.payload as string;
            })
            .addCase(deleteMaterialFromPit.pending, (state, action) => {
                const { materialId } = action.meta.arg;
                state.deletingMaterialId = materialId;
                state.error = null;
            })
            .addCase(deleteMaterialFromPit.fulfilled, (state, action) => {
                const deletedMaterialId = action.payload;
                state.materials = state.materials.filter(material => {
                    const currentMaterialId = getMaterialId(material);
                    return currentMaterialId !== deletedMaterialId;
                });
                state.count = Math.max(0, state.count - 1);
                state.deletingMaterialId = null;
                state.error = null;
            })
            .addCase(deleteMaterialFromPit.rejected, (state, action) => {
                state.error = action.payload as string;
                state.deletingMaterialId = null;
            })
            .addCase(deletePitDraft.pending, (state) => {
                state.deletingPit = true;
                state.error = null;
            })
            .addCase(deletePitDraft.fulfilled, (state) => {
                // Полностью очищаем состояние при успешном удалении заявки
                state.pit_id = NaN;
                state.count = 0;
                state.materials = [];
                state.pitData = {
                    pit_length: null,
                    pit_width: null,
                    pit_depth: null,
                    status: null
                };
                state.deletingPit = false;
                state.error = null;
            })
            .addCase(deletePitDraft.rejected, (state, action) => {
                state.error = action.payload as string;
                state.deletingPit = false;
            })
            .addCase(formPitDraft.pending, (state) => {
                state.error = null;
            })
            .addCase(formPitDraft.fulfilled, (state) => {
                if (state.pitData) {
                    state.pitData.status = 'formed';
                }
                state.error = null;
            })
            .addCase(formPitDraft.rejected, (state, action) => {
                state.error = action.payload as string;
            });;
    }
});

export const { 
    clearError, 
    incrementCount, 
    setCount, 
    clearPitDraft, 
    setDeletingMaterialId,
    resetDeletingPit 
} = pitDraftSlice.actions;
export default pitDraftSlice.reducer;