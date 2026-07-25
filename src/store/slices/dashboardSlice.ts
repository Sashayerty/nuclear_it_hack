import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import { apiService } from '../../api/client'
import type { DashboardData, DatasetReport } from '../../api/types'

export type ActiveTab = 'auth' | 'dashboard' | 'datasets' | 'report' | 'admin'

interface DashboardState {
  dashboard: DashboardData | null
  currentReport: DatasetReport | null
  activeTab: ActiveTab
  isLoading: boolean
  isReportLoading: boolean
  error: string | null
}

const initialState: DashboardState = {
  dashboard: null,
  currentReport: null,
  activeTab: 'dashboard',
  isLoading: false,
  isReportLoading: false,
  error: null
}

export const fetchDashboardThunk = createAsyncThunk(
  'dashboard/fetchDashboard',
  async (_, { rejectWithValue }) => {
    try {
      return await apiService.getDashboard()
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail || 'Не удалось загрузить данные дашборда')
    }
  }
)

export const fetchReportThunk = createAsyncThunk(
  'dashboard/fetchReport',
  async (datasetId: number, { rejectWithValue }) => {
    try {
      return await apiService.getDatasetReport(datasetId)
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail || 'Отчёт по выбранному датасету еще не готов')
    }
  }
)

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setActiveTab(state, action: PayloadAction<ActiveTab>) {
      state.activeTab = action.payload
    },
    clearCurrentReport(state) {
      state.currentReport = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardThunk.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchDashboardThunk.fulfilled, (state, action) => {
        state.isLoading = false
        state.dashboard = action.payload
      })
      .addCase(fetchDashboardThunk.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      .addCase(fetchReportThunk.pending, (state) => {
        state.isReportLoading = true
        state.error = null
      })
      .addCase(fetchReportThunk.fulfilled, (state, action) => {
        state.isReportLoading = false
        state.currentReport = action.payload
        state.activeTab = 'report'
      })
      .addCase(fetchReportThunk.rejected, (state, action) => {
        state.isReportLoading = false
        state.error = action.payload as string
      })
  }
})

export const { setActiveTab, clearCurrentReport } = dashboardSlice.actions
export default dashboardSlice.reducer
