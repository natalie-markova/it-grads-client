import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type {
  InterviewSession,
  InterviewQuestion,
  InterviewAnswer,
  InterviewConfig,
} from '../../types';

interface InterviewState {
  currentSession: InterviewSession | null;
  isLoading: boolean;
  error: string | null;
  currentQuestionIndex: number;
}

const initialState: InterviewState = {
  currentSession: null,
  isLoading: false,
  error: null,
  currentQuestionIndex: 0,
};

const interviewSlice = createSlice({
  name: 'interview',
  initialState,
  reducers: {
    setSession: (state, action: PayloadAction<InterviewSession>) => {
      state.currentSession = action.payload;
      state.currentQuestionIndex = action.payload.currentQuestionIndex;
      state.error = null;
    },

    clearSession: (state) => {
      state.currentSession = null;
      state.currentQuestionIndex = 0;
      state.error = null;
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },

    addQuestion: (state, action: PayloadAction<InterviewQuestion>) => {
      if (state.currentSession) {
        state.currentSession.questions.push(action.payload);
      }
    },

    addAnswer: (state, action: PayloadAction<InterviewAnswer>) => {
      if (state.currentSession) {
        state.currentSession.answers.push(action.payload);
        state.currentQuestionIndex += 1;
      }
    },

    nextQuestion: (state) => {
      if (state.currentSession) {
        state.currentQuestionIndex += 1;
      }
    },

    updateSessionStatus: (
      state,
      action: PayloadAction<'setup' | 'in-progress' | 'completed'>
    ) => {
      if (state.currentSession) {
        state.currentSession.status = action.payload;
      }
    },
  },
});

export const {
  setSession,
  clearSession,
  setLoading,
  setError,
  addQuestion,
  addAnswer,
  nextQuestion,
  updateSessionStatus,
} = interviewSlice.actions;

export default interviewSlice.reducer;