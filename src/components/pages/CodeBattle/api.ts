import axios from 'axios';
import type { GameTask, PlayerRating, GameSession, Language, SubmitResult } from './types';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: `${API_URL}/codebattle`,
  withCredentials: true,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem('accessToken');
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Tasks
export const getTasks = async (params?: {
  difficulty?: string;
  category?: string;
  language?: string;
  page?: number;
  limit?: number;
}): Promise<{ tasks: GameTask[]; pagination: { page: number; limit: number; total: number; pages: number } }> => {
  const response = await api.get('/tasks', { params });
  return response.data;
};

export const getTask = async (id: number): Promise<GameTask> => {
  const response = await api.get(`/tasks/${id}`);
  return response.data;
};

export const getDailyChallenge = async (): Promise<{ task: GameTask | null }> => {
  const response = await api.get('/tasks/daily');
  return response.data;
};

// Player Rating
export const getMyRating = async (): Promise<PlayerRating> => {
  const response = await api.get('/rating/me');
  return response.data;
};

export const getLeaderboard = async (params?: { league?: string; limit?: number }): Promise<PlayerRating[]> => {
  const response = await api.get('/leaderboard', { params });
  return response.data;
};

// Sessions (Solo / VS AI)
export const startSession = async (data: {
  taskId: number;
  mode: 'solo' | 'vs_ai' | 'daily_challenge';
  aiDifficulty?: 'easy' | 'medium' | 'hard';
  language?: string;
}): Promise<{ session: GameSession; task: GameTask; starterCode: string }> => {
  const response = await api.post('/sessions/start', data);
  return response.data;
};

export const testSolution = async (sessionId: number, data: {
  code: string;
  language: string;
}): Promise<{
  success: boolean;
  testResults: Array<{
    passed: boolean;
    input: unknown;
    expected: unknown;
    actual: unknown;
    error?: string;
  }>;
  passed: number;
  total: number;
  executionTime: number;
  memoryUsed: number;
}> => {
  const response = await api.post(`/sessions/${sessionId}/test`, data);
  return response.data;
};

export const submitSolution = async (sessionId: number, data: {
  code: string;
  language: string;
}): Promise<SubmitResult> => {
  const response = await api.post(`/sessions/${sessionId}/submit`, data);
  return response.data;
};

export const getHint = async (sessionId: number): Promise<{
  hint: string;
  hintNumber: number;
  totalHints: number;
  remainingHints: number;
}> => {
  const response = await api.post(`/sessions/${sessionId}/hint`);
  return response.data;
};

export const getAiStatus = async (sessionId: number): Promise<{
  aiSolved: boolean | null;
  aiSolveTime: number;
  aiTestsPassed: number;
  status: 'solving' | 'completed' | 'failed';
}> => {
  const response = await api.get(`/sessions/${sessionId}/ai-status`);
  return response.data;
};

// Code Execution
export const executeCode = async (data: {
  code: string;
  language: string;
  input?: string;
}): Promise<{
  success: boolean;
  status: string;
  stdout: string;
  stderr: string;
  time: number;
  memory: number;
  error?: string;
}> => {
  const response = await api.post('/execute', data);
  return response.data;
};

export const getLanguages = async (): Promise<Language[]> => {
  const response = await api.get('/languages');
  return response.data;
};

// History & Stats
export const getHistory = async (params?: {
  type?: 'all' | 'solo' | 'pvp';
  page?: number;
  limit?: number;
}): Promise<{ sessions: GameSession[]; matches: unknown[] }> => {
  const response = await api.get('/history', { params });
  return response.data;
};

export const getStats = async (): Promise<{
  rating: PlayerRating | null;
  solvedByDifficulty: { difficulty: string; count: number }[];
  solvedByLanguage: { language: string; count: number }[];
  recentActivity: { date: string; count: number }[];
}> => {
  const response = await api.get('/stats');
  return response.data;
};

export default api;