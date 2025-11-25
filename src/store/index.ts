import { configureStore } from '@reduxjs/toolkit';
import interviewReducer from './slices/interviewSlice';

export const store = configureStore({
  reducer: {
    interview: interviewReducer,
  },
});

// Типы для TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;