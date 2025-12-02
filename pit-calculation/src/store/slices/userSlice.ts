import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Api } from '../../api/Api'
import { loadUserSession, saveUserSession, clearUserSession } from '../../utils/authUtils';

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

interface UserState {
    username: string | null;
    isAuthenticated: boolean;
    role: number;
    error?: string | null;
    token?: string;
    userId?: number;
}
  
const initialState: UserState = {
    username: null,
    isAuthenticated: false,
    role: 2, 
    error: null,
    token: undefined,
    userId: undefined,
};

export const loginUserAsync = createAsyncThunk(
  'user/loginUserAsync',
  async (credentials: { username: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await api.users.loginCreate(credentials);
      return {
        ...response.data,
        username: credentials.username // Добавляем username из формы
      }; 
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка авторизации');
    }
  }
);

export const registerUserAsync = createAsyncThunk(
  'user/registerUserAsync',
  async (userData: { username: string; password: string; role?: number }, { rejectWithValue }) => {
    try {
      const response = await api.users.usersCreate(userData);
      return {
        ...response.data,
        username: userData.username 
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка регистрации');
    }
  }
);

export const logoutUserAsync = createAsyncThunk(
  'user/logoutUserAsync',
  async (_, { rejectWithValue, getState }) => { // Добавили dispatch
    try {
      const state = getState() as { user: UserState };
      if (state.user.token) {
        await api.users.logoutCreate();
      }
      // Очищаем корзину при выходе
      // dispatch(clearPitDraft()); // Так не работает, нужно через extraReducers
      return null;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка при выходе из системы'); 
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    restoreSession: (state) => {
      const session = loadUserSession();
      if (session) {
        state.username = session.username;
        state.role = session.role;
        state.isAuthenticated = true;
        state.token = session.token;
      }
    },
    clearError: (state) => {
      state.error = null;
    },
    // Новый reducer для принудительной очистки
    forceLogout: (state) => {
      Object.assign(state, initialState);
      clearUserSession();
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUserAsync.pending, (state) => {
        state.error = null;
      })
      .addCase(loginUserAsync.fulfilled, (state, action) => {
        const { access_token, token_type, username, role, user_id } = action.payload;
        const token = `${token_type} ${access_token}`;
        
        state.token = token;
        state.isAuthenticated = true;
        state.username = username || ''; 
        state.role = role || 0;
        state.userId = user_id;
        state.error = null;
    
        saveUserSession(state.username, state.role, token);
      })
      .addCase(loginUserAsync.rejected, (state, action) => {
        state.error = action.payload as string;
        state.isAuthenticated = false;
        clearUserSession();
      })
  
      .addCase(registerUserAsync.pending, (state) => {
        state.error = null;
      })
      .addCase(registerUserAsync.fulfilled, (state, action) => {
        const { username, role } = action.payload;
        state.username = username || '';
        state.role = role || 0;
        state.error = null;
      })
      .addCase(registerUserAsync.rejected, (state, action) => {
        state.error = action.payload as string;
      })
  
      .addCase(logoutUserAsync.fulfilled, (state) => {
        Object.assign(state, initialState);
        clearUserSession();
      })
      .addCase(logoutUserAsync.rejected, (state, action) => {
        state.error = action.payload as string;
        Object.assign(state, initialState);
        clearUserSession();
      });
  },
});

export const { restoreSession, clearError, forceLogout } = userSlice.actions;
export default userSlice.reducer;