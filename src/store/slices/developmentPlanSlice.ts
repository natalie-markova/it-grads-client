import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { $api } from '../../utils/axios.instance';

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

  requiredTasks?: number;
  completedTasks?: number;
  codebattleFilter?: CodeBattleFilter;
  solvedTaskIds?: number[];

  roadmapId?: number;
  roadmapSlug?: string;
  requiredProgress?: number;
  currentProgress?: number;

  requiredSessions?: number;
  completedSessions?: number;
  interviewType?: 'practice' | 'ai' | 'audio' | 'any';
  minPassPercentage?: number;
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
  positions: Position[];
  positionsLoading: boolean;
  categories: { [key: string]: { title: string; icon: string; color: string } };
  levels: { [key: string]: { title: string; order: number; color: string } };

  recommendedPositions: Position[];

  positionGap: PositionGap | null;
  gapLoading: boolean;

  planStatus: PlanStatus | null;
  planLoading: boolean;
  syncLoading: boolean;

  recommendedTasks: any[];
  tasksLoading: boolean;

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

export const fetchPositions = createAsyncThunk(
  'developmentPlan/fetchPositions',
  async (params: { category?: string; level?: string } = {}, { rejectWithValue }) => {
    try {
      const { data } = await $api.get('/development-plan/positions', { params });
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Error loading positions');
    }
  }
);

export const fetchRecommendedPositions = createAsyncThunk(
  'developmentPlan/fetchRecommendedPositions',
  async (limit: number = 6, { rejectWithValue }) => {
    try {
      const { data } = await $api.get('/development-plan/positions/recommended', {
        params: { limit },
      });
      return data.positions;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Error loading recommendations');
    }
  }
);

export const fetchPositionGap = createAsyncThunk(
  'developmentPlan/fetchPositionGap',
  async (positionId: string, { rejectWithValue }) => {
    try {
      const { data } = await $api.get(`/development-plan/positions/${positionId}/gap`);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Error analyzing GAP');
    }
  }
);

export const createPlan = createAsyncThunk(
  'developmentPlan/createPlan',
  async (targetPosition: string, { rejectWithValue }) => {
    try {
      const { data } = await $api.post('/development-plan', { targetPosition });
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Error creating plan');
    }
  }
);

export const fetchPlanStatus = createAsyncThunk(
  'developmentPlan/fetchPlanStatus',
  async (lang: string = 'ru', { rejectWithValue }) => {
    try {
      const { data } = await $api.get('/development-plan/active', { params: { lang } });
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Error loading plan');
    }
  }
);

export const syncPlan = createAsyncThunk(
  'developmentPlan/syncPlan',
  async (lang: string = 'ru', { rejectWithValue }) => {
    try {
      const { data } = await $api.post('/development-plan/sync', {}, { params: { lang } });
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Synchronization error');
    }
  }
);

export const completeStep = createAsyncThunk(
  'developmentPlan/completeStep',
  async (stepId: string, { rejectWithValue }) => {
    try {
      const { data } = await $api.post(`/development-plan/steps/${stepId}/complete`);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Error completing step');
    }
  }
);

export const pausePlan = createAsyncThunk(
  'developmentPlan/pausePlan',
  async (planId: number, { rejectWithValue }) => {
    try {
      const { data } = await $api.put(`/development-plan/${planId}/pause`);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Error pausing plan');
    }
  }
);

export const resumePlan = createAsyncThunk(
  'developmentPlan/resumePlan',
  async (planId: number, { rejectWithValue }) => {
    try {
      const { data } = await $api.put(`/development-plan/${planId}/resume`);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Error resuming plan');
    }
  }
);

export const abandonPlan = createAsyncThunk(
  'developmentPlan/abandonPlan',
  async (planId: number, { rejectWithValue }) => {
    try {
      const { data } = await $api.delete(`/development-plan/${planId}`);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Error abandoning plan');
    }
  }
);

export const fetchRecommendedTasks = createAsyncThunk(
  'developmentPlan/fetchRecommendedTasks',
  async (limit: number = 10, { rejectWithValue }) => {
    try {
      const { data } = await $api.get('/development-plan/codebattle-tasks', {
        params: { limit },
      });
      return data.tasks;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Error loading tasks');
    }
  }
);

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
        if (state.planStatus) {
          if (action.payload.steps) {
            state.planStatus.steps = action.payload.steps;
          }

          if (state.planStatus.plan) {
            state.planStatus.plan.overallProgress = action.payload.overallProgress;
            if (action.payload.planStatus) {
              state.planStatus.plan.status = action.payload.planStatus;
            }
          }

          if (action.payload.nextStep) {
            state.planStatus.currentStep = action.payload.nextStep;
          } else if (state.planStatus.steps) {
            const activeStep = state.planStatus.steps.find(s => s.status === 'in_progress') ||
                               state.planStatus.steps.find(s => s.status === 'unlocked');
            state.planStatus.currentStep = activeStep;
          } else {
            state.planStatus.currentStep = undefined;
          }

          if (state.planStatus.stepsStats && state.planStatus.steps) {
            const steps = state.planStatus.steps;
            state.planStatus.stepsStats = {
              total: steps.length,
              completed: steps.filter(s => s.status === 'completed').length,
              inProgress: steps.filter(s => s.status === 'in_progress').length,
              unlocked: steps.filter(s => s.status === 'unlocked').length,
              locked: steps.filter(s => s.status === 'locked').length,
            };
          }
        }
      });

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
