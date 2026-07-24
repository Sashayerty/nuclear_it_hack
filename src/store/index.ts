import { configureStore } from '@reduxjs/toolkit'
import filterReducer from './slices/filterSlice'
import appReducer from './slices/appSlice'

export const store = configureStore({
  reducer: { filter: filterReducer, app: appReducer },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
