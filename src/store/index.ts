import { configureStore } from '@reduxjs/toolkit';
import interviewReducer from './slices/interviewSlice';
import developmentPlanReducer from './slices/developmentPlanSlice';

export const store = configureStore({
  reducer: {
    interview: interviewReducer,
    developmentPlan: developmentPlanReducer,
  },
});

// Типы для TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;