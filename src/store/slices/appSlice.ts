import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export interface AppState {
  selectedLogId: string | null
  isDetailModalOpen: boolean
  sidebarCollapsed: boolean
  notifications: Array<{ id: string; type: 'success' | 'error' | 'info' | 'warning'; message: string }>
}

const initialState: AppState = {
  selectedLogId: null,
  isDetailModalOpen: false,
  sidebarCollapsed: false,
  notifications: [],
}

export const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setSelectedLogId: (state, action: PayloadAction<string | null>) => {
      state.selectedLogId = action.payload
      state.isDetailModalOpen = action.payload !== null
    },
    setDetailModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isDetailModalOpen = action.payload
      if (!action.payload) state.selectedLogId = null
    },
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed
    },
    addNotification: (state, action: PayloadAction<Omit<AppState['notifications'][number], 'id'>>) => {
      state.notifications.push({ ...action.payload, id: Date.now().toString() })
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter((n) => n.id !== action.payload)
    },
  },
})

export const { setSelectedLogId, setDetailModalOpen, toggleSidebar, addNotification, removeNotification } = appSlice.actions
export default appSlice.reducer
