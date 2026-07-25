import { configureStore } from '@reduxjs/toolkit'
import filterReducer from './slices/filterSlice'
import appReducer from './slices/appSlice'
import authReducer from './slices/authSlice'
import datasetReducer from './slices/datasetSlice'
import dashboardReducer from './slices/dashboardSlice'

export const store = configureStore({
  reducer: {
    filter: filterReducer,
    app: appReducer,
    auth: authReducer,
    dataset: datasetReducer,
    dashboard: dashboardReducer
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false })
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
