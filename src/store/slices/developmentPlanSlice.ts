import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { $api } from '../../utils/axios.instance';

// ==================== ТИПЫ ====================

export interface PositionSkills {
  [key: string]: number;
}

export interface Position {
  id: string;
  title: string;
  icon: string;
  level: 'junior' | 'middle' | 'senior' | 'lead';
  category: string;
  skills: PositionSkills;
  requiredRoadmaps?: string[];
  codebattle?: {
    minRating: number;
    minSolved: number;
  };
  relatedPositions?: string[];
  matchScore?: number;
}

export interface CodeBattleFilter {
  categories?: string[];
  difficulties?: string[];
  languages?: string[];
  mode?: string;
  targetRating?: number;
}

export interface PlanStep {
  id: string;
  order: number;
  type: 'codebattle' | 'roadmap' | 'course' | 'project' | 'interview';
  title: string;
  titleEn?: string;
  description: string;
  descriptionEn?: string;
  targetSkill: string;
  targetValue?: number;
  weight: number;

  // Для codebattle
  requiredTasks?: number;
  completedTasks?: number;
  codebattleFilter?: CodeBattleFilter;
  solvedTaskIds?: number[];

  // Для roadmap
  roadmapId?: number;
  roadmapSlug?: string;
  requiredProgress?: number;
  currentProgress?: number;

  // Для interview
  requiredSessions?: number;
  completedSessions?: number;
  interviewType?: 'practice' | 'ai' | 'audio' | 'any';
  minPassPercentage?: number; // Минимум для засчитывания (по умолчанию 70%)
  sessionsByType?: {
    ai: number;
    audio: number;
    practice: number;
  };
  practiceStats?: {
    attempts: number;
    averagePercentage?: number;
    totalPercentage?: number;
    successfulAttempts?: number;
    categories: {
      [key: string]: {
        attempts: number;
        bestPercentage: number;
        successfulAttempts?: number;
      };
    };
  };

  // Статус
  status: 'locked' | 'unlocked' | 'in_progress' | 'completed';
  unlockedAt?: string;
  startedAt?: string;
  completedAt?: string;
}

export interface SkillGap {
  current: number;
  required: number;
  gap: number;
  progress: number;
}

export interface DevelopmentPlan {
  id: number;
  targetPosition: string;
  targetPositionTitle: string;
  targetPositionIcon: string;
  targetPositionLevel: string;
  targetSkills: PositionSkills;
  initialSkills: PositionSkills;
  skillProgress: { [key: string]: number };
  steps: PlanStep[];
  overallProgress: number;
  status: 'active' | 'completed' | 'paused' | 'abandoned';
  matchScore?: number;
  estimatedWeeks?: number;
  createdAt: string;
  lastSyncAt?: string;
  completedAt?: string;
}

export interface PlanStatus {
  hasPlan: boolean;
  plan?: {
    id: number;
    targetPosition: string;
    targetPositionTitle: string;
    targetPositionIcon: string;
    targetPositionLevel: string;
    overallProgress: number;
    status: string;
    estimatedWeeks?: number;
    createdAt: string;
    lastSyncAt?: string;
  };
  currentStep?: PlanStep;
  nextStep?: PlanStep;
  stepsStats?: {
    total: number;
    completed: number;
    inProgress: number;
    unlocked: number;
    locked: number;
  };
  skillProgress?: { [key: string]: number };
  gaps?: { [key: string]: SkillGap };
  steps?: PlanStep[];
}

export interface PositionGap {
  position: {
    id: string;
    title: string;
    icon: string;
    level: string;
  };
  matchScore: number;
  gaps: { [key: string]: SkillGap };
  totalGap: number;
  avgGap: number;
  isReached: boolean;
  roadmaps: Array<{
    slug: string;
    title: string;
    progress: number;
    status: string;
  }>;
  codebattle: {
    currentRating: number;
    requiredRating: number;
    currentSolved: number;
    requiredSolved: number;
    ratingReached: boolean;
    solvedReached: boolean;
  };
}

interface DevelopmentPlanState {
  // Позиции
  positions: Position[];
  positionsLoading: boolean;
  categories: { [key: string]: { title: string; icon: string; color: string } };
  levels: { [key: string]: { title: string; order: number; color: string } };

  // Рекомендуемые позиции
  recommendedPositions: Position[];

  // Анализ GAP
  positionGap: PositionGap | null;
  gapLoading: boolean;

  // Активный план
  planStatus: PlanStatus | null;
  planLoading: boolean;
  syncLoading: boolean;

  // Рекомендуемые задачи
  recommendedTasks: any[];
  tasksLoading: boolean;

  // Ошибки
  error: string | null;
}

const initialState: DevelopmentPlanState = {
  positions: [],
  positionsLoading: false,
  categories: {},
  levels: {},
  recommendedPositions: [],
  positionGap: null,
  gapLoading: false,
  planStatus: null,
  planLoading: false,
  syncLoading: false,
  recommendedTasks: [],
  tasksLoading: false,
  error: null,
};

// ==================== ASYNC THUNKS ====================

// Получить все позиции
export const fetchPositions = createAsyncThunk(
  'developmentPlan/fetchPositions',
  async (params: { category?: string; level?: string } = {}, { rejectWithValue }) => {
    try {
      const { data } = await $api.get('/development-plan/positions', { params });
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Ошибка загрузки позиций');
    }
  }
);

// Получить рекомендуемые позиции
export const fetchRecommendedPositions = createAsyncThunk(
  'developmentPlan/fetchRecommendedPositions',
  async (limit: number = 6, { rejectWithValue }) => {
    try {
      const { data } = await $api.get('/development-plan/positions/recommended', {
        params: { limit },
      });
      return data.positions;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Ошибка загрузки рекомендаций');
    }
  }
);

// Получить GAP анализ для позиции
export const fetchPositionGap = createAsyncThunk(
  'developmentPlan/fetchPositionGap',
  async (positionId: string, { rejectWithValue }) => {
    try {
      const { data } = await $api.get(`/development-plan/positions/${positionId}/gap`);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Ошибка анализа GAP');
    }
  }
);

// Создать план развития
export const createPlan = createAsyncThunk(
  'developmentPlan/createPlan',
  async (targetPosition: string, { rejectWithValue }) => {
    try {
      const { data } = await $api.post('/development-plan', { targetPosition });
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Ошибка создания плана');
    }
  }
);

// Получить статус активного плана
export const fetchPlanStatus = createAsyncThunk(
  'developmentPlan/fetchPlanStatus',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await $api.get('/development-plan/active');
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Ошибка загрузки плана');
    }
  }
);

// Синхронизировать план
export const syncPlan = createAsyncThunk(
  'developmentPlan/syncPlan',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await $api.post('/development-plan/sync');
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Ошибка синхронизации');
    }
  }
);

// Отметить шаг как выполненный
export const completeStep = createAsyncThunk(
  'developmentPlan/completeStep',
  async (stepId: string, { rejectWithValue }) => {
    try {
      const { data } = await $api.post(`/development-plan/steps/${stepId}/complete`);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Ошибка завершения шага');
    }
  }
);

// Приостановить план
export const pausePlan = createAsyncThunk(
  'developmentPlan/pausePlan',
  async (planId: number, { rejectWithValue }) => {
    try {
      const { data } = await $api.put(`/development-plan/${planId}/pause`);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Ошибка приостановки');
    }
  }
);

// Возобновить план
export const resumePlan = createAsyncThunk(
  'developmentPlan/resumePlan',
  async (planId: number, { rejectWithValue }) => {
    try {
      const { data } = await $api.put(`/development-plan/${planId}/resume`);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Ошибка возобновления');
    }
  }
);

// Отменить план
export const abandonPlan = createAsyncThunk(
  'developmentPlan/abandonPlan',
  async (planId: number, { rejectWithValue }) => {
    try {
      const { data } = await $api.delete(`/development-plan/${planId}`);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Ошибка отмены плана');
    }
  }
);

// Получить рекомендуемые задачи CodeBattle
export const fetchRecommendedTasks = createAsyncThunk(
  'developmentPlan/fetchRecommendedTasks',
  async (limit: number = 10, { rejectWithValue }) => {
    try {
      const { data } = await $api.get('/development-plan/codebattle-tasks', {
        params: { limit },
      });
      return data.tasks;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Ошибка загрузки задач');
    }
  }
);

// ==================== SLICE ====================

const developmentPlanSlice = createSlice({
  name: 'developmentPlan',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearPositionGap: (state) => {
      state.positionGap = null;
    },
    clearPlanStatus: (state) => {
      state.planStatus = null;
    },
  },
  extraReducers: (builder) => {
    // fetchPositions
    builder
      .addCase(fetchPositions.pending, (state) => {
        state.positionsLoading = true;
        state.error = null;
      })
      .addCase(fetchPositions.fulfilled, (state, action) => {
        state.positionsLoading = false;
        state.positions = action.payload.positions;
        state.categories = action.payload.categories;
        state.levels = action.payload.levels;
      })
      .addCase(fetchPositions.rejected, (state, action) => {
        state.positionsLoading = false;
        state.error = action.payload as string;
      });

    // fetchRecommendedPositions
    builder
      .addCase(fetchRecommendedPositions.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchRecommendedPositions.fulfilled, (state, action) => {
        state.recommendedPositions = action.payload;
      })
      .addCase(fetchRecommendedPositions.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // fetchPositionGap
    builder
      .addCase(fetchPositionGap.pending, (state) => {
        state.gapLoading = true;
        state.error = null;
      })
      .addCase(fetchPositionGap.fulfilled, (state, action) => {
        state.gapLoading = false;
        state.positionGap = action.payload;
      })
      .addCase(fetchPositionGap.rejected, (state, action) => {
        state.gapLoading = false;
        state.error = action.payload as string;
      });

    // createPlan
    builder
      .addCase(createPlan.pending, (state) => {
        state.planLoading = true;
        state.error = null;
      })
      .addCase(createPlan.fulfilled, (state, action) => {
        state.planLoading = false;
        // После создания плана нужно обновить статус
      })
      .addCase(createPlan.rejected, (state, action) => {
        state.planLoading = false;
        state.error = action.payload as string;
      });

    // fetchPlanStatus
    builder
      .addCase(fetchPlanStatus.pending, (state) => {
        state.planLoading = true;
        state.error = null;
      })
      .addCase(fetchPlanStatus.fulfilled, (state, action) => {
        state.planLoading = false;
        state.planStatus = action.payload;
      })
      .addCase(fetchPlanStatus.rejected, (state, action) => {
        state.planLoading = false;
        state.error = action.payload as string;
      });

    // syncPlan
    builder
      .addCase(syncPlan.pending, (state) => {
        state.syncLoading = true;
        state.error = null;
      })
      .addCase(syncPlan.fulfilled, (state, action) => {
        state.syncLoading = false;
        state.planStatus = action.payload;
      })
      .addCase(syncPlan.rejected, (state, action) => {
        state.syncLoading = false;
        state.error = action.payload as string;
      });

    // completeStep
    builder
      .addCase(completeStep.fulfilled, (state, action) => {
        if (state.planStatus && state.planStatus.steps) {
          const stepIndex = state.planStatus.steps.findIndex(
            (s) => s.id === action.payload.step.id
          );
          if (stepIndex !== -1) {
            state.planStatus.steps[stepIndex] = action.payload.step;
          }
          if (state.planStatus.plan) {
            state.planStatus.plan.overallProgress = action.payload.overallProgress;
          }
        }
      });

    // pausePlan, resumePlan, abandonPlan
    builder
      .addCase(pausePlan.fulfilled, (state) => {
        if (state.planStatus?.plan) {
          state.planStatus.plan.status = 'paused';
        }
      })
      .addCase(resumePlan.fulfilled, (state) => {
        if (state.planStatus?.plan) {
          state.planStatus.plan.status = 'active';
        }
      })
      .addCase(abandonPlan.fulfilled, (state) => {
        state.planStatus = { hasPlan: false };
      });

    // fetchRecommendedTasks
    builder
      .addCase(fetchRecommendedTasks.pending, (state) => {
        state.tasksLoading = true;
      })
      .addCase(fetchRecommendedTasks.fulfilled, (state, action) => {
        state.tasksLoading = false;
        state.recommendedTasks = action.payload;
      })
      .addCase(fetchRecommendedTasks.rejected, (state, action) => {
        state.tasksLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearPositionGap, clearPlanStatus } = developmentPlanSlice.actions;
export default developmentPlanSlice.reducer;
