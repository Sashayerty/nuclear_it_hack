import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import { apiService } from '../../api/client'
import type { UserRole } from '../../api/types'

interface AuthState {
  isAuthenticated: boolean
  role: UserRole | null
  orgName: string | null
  adminLogin: string | null
  accessToken: string | null
  isLoading: boolean
  error: string | null
  isAuthModalOpen: boolean
}

const token = localStorage.getItem('access_token')
const role = localStorage.getItem('user_role') as UserRole | null

const initialState: AuthState = {
  isAuthenticated: Boolean(token && role),
  role: token ? role : null,
  orgName: token ? localStorage.getItem('org_name') : null,
  adminLogin: token ? localStorage.getItem('admin_login') : null,
  accessToken: token,
  isLoading: false,
  error: null,
  isAuthModalOpen: false
}

export const loginOrgThunk = createAsyncThunk(
  'auth/loginOrg',
  async ({ name, password }: { name: string; password: string }, { rejectWithValue }) => {
    try {
      const data = await apiService.organizationLogin(name, password)
      return { token: data.access_token, role: 'organization' as UserRole, name }
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail || err.message || 'Ошибка входа в систему')
    }
  }
)

export const loginAdminThunk = createAsyncThunk(
  'auth/loginAdmin',
  async ({ login, password }: { login: string; password: string }, { rejectWithValue }) => {
    try {
      const data = await apiService.adminLogin(login, password)
      return { token: data.access_token, role: 'admin' as UserRole, login }
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail || err.message || 'Ошибка входа администратора')
    }
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthModalOpen(state, action: PayloadAction<boolean>) {
      state.isAuthModalOpen = action.payload
    },
    logout(state) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('user_role')
      localStorage.removeItem('org_name')
      localStorage.removeItem('admin_login')
      state.isAuthenticated = false
      state.role = null
      state.orgName = null
      state.adminLogin = null
      state.accessToken = null
      state.isAuthModalOpen = true
    },
    clearError(state) {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginOrgThunk.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(loginOrgThunk.fulfilled, (state, action) => {
        state.isLoading = false
        state.isAuthenticated = true
        state.role = 'organization'
        state.orgName = action.payload.name
        state.accessToken = action.payload.token
        state.isAuthModalOpen = false
      })
      .addCase(loginOrgThunk.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      .addCase(loginAdminThunk.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(loginAdminThunk.fulfilled, (state, action) => {
        state.isLoading = false
        state.isAuthenticated = true
        state.role = 'admin'
        state.adminLogin = action.payload.login
        state.accessToken = action.payload.token
        state.isAuthModalOpen = false
      })
      .addCase(loginAdminThunk.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  }
})

export const { setAuthModalOpen, logout, clearError } = authSlice.actions
export default authSlice.reducer
