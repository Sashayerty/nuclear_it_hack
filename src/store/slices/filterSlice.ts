import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export interface FilterState {
  selectedCategory: string | null
  selectedUseCase: string | null
  searchQuery: string
  dateRange: 'all' | '7d' | '30d' | '90d'
  viewMode: 'overview' | 'categories' | 'useCases' | 'logs'
}

const initialState: FilterState = {
  selectedCategory: null,
  selectedUseCase: null,
  searchQuery: '',
  dateRange: 'all',
  viewMode: 'overview',
}

export const filterSlice = createSlice({
  name: 'filter',
  initialState,
  reducers: {
    setCategory: (state, action: PayloadAction<string | null>) => {
      state.selectedCategory = action.payload
      state.selectedUseCase = null
    },
    setUseCase: (state, action: PayloadAction<string | null>) => { state.selectedUseCase = action.payload },
    setSearchQuery: (state, action: PayloadAction<string>) => { state.searchQuery = action.payload },
    setDateRange: (state, action: PayloadAction<FilterState['dateRange']>) => { state.dateRange = action.payload },
    setViewMode: (state, action: PayloadAction<FilterState['viewMode']>) => { state.viewMode = action.payload },
    resetFilters: (state) => {
      state.selectedCategory = null
      state.selectedUseCase = null
      state.searchQuery = ''
      state.dateRange = 'all'
    },
  },
})

export const { setCategory, setUseCase, setSearchQuery, setDateRange, setViewMode, resetFilters } = filterSlice.actions
export default filterSlice.reducer
