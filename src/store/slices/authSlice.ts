import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import { authApi, type User, type LoginDto, type RegisterDto } from '../../api/authApi'
import { tokenStorage } from '../../utils/tokenStorage'

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  authModalOpen: boolean
  authModalMode: 'login' | 'register'
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: tokenStorage.hasTokens(),
  isLoading: false,
  error: null,
  authModalOpen: false,
  authModalMode: 'login',
}

export const loginThunk = createAsyncThunk(
  'auth/login',
  async (credentials: LoginDto, { rejectWithValue }) => {
    try {
      const response = await authApi.login(credentials)
      return response.user
    } catch (err: any) {
      return rejectWithValue(err.message || 'Ошибка входа в систему')
    }
  }
)

export const registerThunk = createAsyncThunk(
  'auth/register',
  async (dto: RegisterDto, { rejectWithValue }) => {
    try {
      const response = await authApi.register(dto)
      return response.user
    } catch (err: any) {
      return rejectWithValue(err.message || 'Ошибка при регистрации')
    }
  }
)

export const logoutThunk = createAsyncThunk('auth/logout', async () => {
  await authApi.logout()
})

export const checkAuthThunk = createAsyncThunk(
  'auth/checkAuth',
  async (_, { rejectWithValue }) => {
    if (!tokenStorage.hasTokens()) {
      return null
    }
    try {
      return await authApi.getProfile()
    } catch (err: any) {
      tokenStorage.clearTokens()
      return rejectWithValue('Сессия истекла')
    }
  }
)

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthModalOpen: (state, action: PayloadAction<boolean>) => {
      state.authModalOpen = action.payload
      if (!action.payload) state.error = null
    },
    setAuthModalMode: (state, action: PayloadAction<'login' | 'register'>) => {
      state.authModalMode = action.payload
      state.error = null
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(loginThunk.fulfilled, (state, action: PayloadAction<User>) => {
        state.isLoading = false
        state.isAuthenticated = true
        state.user = action.payload
        state.authModalOpen = false
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.isLoading = false
        state.error = (action.payload as string) || 'Не удалось войти'
      })
      .addCase(registerThunk.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(registerThunk.fulfilled, (state, action: PayloadAction<User>) => {
        state.isLoading = false
        state.isAuthenticated = true
        state.user = action.payload
        state.authModalOpen = false
      })
      .addCase(registerThunk.rejected, (state, action) => {
        state.isLoading = false
        state.error = (action.payload as string) || 'Не удалось зарегистрироваться'
      })
      .addCase(logoutThunk.fulfilled, (state) => {
        state.user = null
        state.isAuthenticated = false
        state.isLoading = false
      })
      .addCase(checkAuthThunk.pending, (state) => {
        state.isLoading = true
      })
      .addCase(checkAuthThunk.fulfilled, (state, action) => {
        state.isLoading = false
        if (action.payload) {
          state.user = action.payload
          state.isAuthenticated = true
        } else {
          state.user = null
          state.isAuthenticated = false
        }
      })
      .addCase(checkAuthThunk.rejected, (state) => {
        state.isLoading = false
        state.user = null
        state.isAuthenticated = false
      })
  },
})

export const { setAuthModalOpen, setAuthModalMode, clearError } = authSlice.actions
export default authSlice.reducer
