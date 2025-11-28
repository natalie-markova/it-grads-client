export type Direction = 'frontend' | 'backend' | 'fullstack';
export type Level = 'junior' | 'middle' | 'senior';
export type InterviewStatus = 'setup' | 'in-progress' | 'completed';


export interface User {
  username: string;
  email: string;
  id?: number;
  role?: 'graduate' | 'employer';
}

export interface AuthResponse {
  accessToken: string;
  user: User;
  message?: string;
}

export interface OutletContext {
  user: User | null;
  setUser: (user: User | null) => void;
}

export interface Technology {
  id: string;
  name: string;
  category: 'frontend' | 'backend' | 'database' | 'other';
}

export interface InterviewConfig  {
  direction: Direction;
  technologies: string[];
  level: Level;
  questionsCount: number;
}

export interface InterviewMessage {
  id: number;
  sessionId: number;
  role: 'assistant' | 'user';
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface InterviewSession {
  id: number;
  userId: number;
  direction: Direction;
  technologies: string[];
  level: Level;
  questionsCount: number;
  status: InterviewStatus;
  currentQuestionIndex: number;
  messages?: InterviewMessage[];
  totalScore?: number;
  recommendations?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface InterviewFeedback {
  totalScore: number; // 0-100
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  detailedFeedback: string;
}