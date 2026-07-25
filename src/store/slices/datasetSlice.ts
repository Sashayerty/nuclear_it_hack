import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import { apiService } from '../../api/client'
import type { Dataset, AnalysisRunStatus } from '../../api/types'

interface DatasetState {
  datasets: Dataset[]
  selectedDatasetId: number | null
  activeAnalysisRun: AnalysisRunStatus | null
  isLoading: boolean
  isUploading: boolean
  isAnalyzing: boolean
  error: string | null
}

const initialState: DatasetState = {
  datasets: [],
  selectedDatasetId: null,
  activeAnalysisRun: null,
  isLoading: false,
  isUploading: false,
  isAnalyzing: false,
  error: null
}

export const fetchDatasetsThunk = createAsyncThunk(
  'dataset/fetchDatasets',
  async (_, { rejectWithValue }) => {
    try {
      return await apiService.getDatasets()
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail || 'Не удалось загрузить список датасетов')
    }
  }
)

export const uploadDatasetThunk = createAsyncThunk(
  'dataset/uploadDataset',
  async (
    { file, name, textColumn }: { file: File; name?: string; textColumn: string },
    { rejectWithValue }
  ) => {
    try {
      return await apiService.uploadDataset(file, name, textColumn)
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail || 'Ошибка загрузки файла')
    }
  }
)

export const triggerAnalysisThunk = createAsyncThunk(
  'dataset/triggerAnalysis',
  async (datasetId: number, { rejectWithValue }) => {
    try {
      return await apiService.analyzeDataset(datasetId)
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail || 'Не удалось запустить анализ')
    }
  }
)

export const checkAnalysisStatusThunk = createAsyncThunk(
  'dataset/checkAnalysisStatus',
  async (analysisRunId: number, { rejectWithValue }) => {
    try {
      return await apiService.getAnalysisStatus(analysisRunId)
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail || 'Ошибка проверки статуса анализа')
    }
  }
)

const datasetSlice = createSlice({
  name: 'dataset',
  initialState,
  reducers: {
    setSelectedDatasetId(state, action: PayloadAction<number | null>) {
      state.selectedDatasetId = action.payload
    },
    clearDatasetError(state) {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDatasetsThunk.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchDatasetsThunk.fulfilled, (state, action) => {
        state.isLoading = false
        state.datasets = action.payload
      })
      .addCase(fetchDatasetsThunk.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      .addCase(uploadDatasetThunk.pending, (state) => {
        state.isUploading = true
        state.error = null
      })
      .addCase(uploadDatasetThunk.fulfilled, (state, action) => {
        state.isUploading = false
        state.datasets.unshift(action.payload)
      })
      .addCase(uploadDatasetThunk.rejected, (state, action) => {
        state.isUploading = false
        state.error = action.payload as string
      })
      .addCase(triggerAnalysisThunk.pending, (state) => {
        state.isAnalyzing = true
        state.error = null
      })
      .addCase(triggerAnalysisThunk.fulfilled, (state, action) => {
        state.isAnalyzing = false
        state.activeAnalysisRun = action.payload
        const ds = state.datasets.find((d) => d.id === action.payload.dataset_id)
        if (ds) ds.status = 'processing'
      })
      .addCase(triggerAnalysisThunk.rejected, (state, action) => {
        state.isAnalyzing = false
        state.error = action.payload as string
      })
      .addCase(checkAnalysisStatusThunk.fulfilled, (state, action) => {
        state.activeAnalysisRun = action.payload
        if (action.payload.status === 'completed' || action.payload.status === 'failed') {
          const ds = state.datasets.find((d) => d.id === action.payload.dataset_id)
          if (ds) ds.status = action.payload.status
        }
      })
  }
})

export const { setSelectedDatasetId, clearDatasetError } = datasetSlice.actions
export default datasetSlice.reducer
