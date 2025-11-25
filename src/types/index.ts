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

export interface InterviewQuestion {
  id: number;
  question: string;
  difficulty: Level;
  technology: string;
  hints?: string[];
}

export interface InterviewAnswer {
  questionId: number;
  answer: string;
  score?: number; // 0-100
  feedback?: string;
  timestamp: string;
}

export interface InterviewSession {
  id: number;
  graduateId: number;
  config: InterviewConfig;
  status: InterviewStatus;
  currentQuestionIndex: number;
  questions: InterviewQuestion[];
  answers: InterviewAnswer[];
  totalScore?: number;
  recommendations?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface InterviewFeedback {
  score: number; // 0-100
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  detailedFeedback: string;
}