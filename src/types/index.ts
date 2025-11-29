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
  strengths?: string[];
  weaknesses?: string[];
  detailedFeedback?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InterviewFeedback {
  totalScore: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  detailedFeedback: string;
}

export interface Employer extends User {
  phone?: string;
  avatar?: string;
  createdAt: string;
  companyName?: string;
  companyDescription?: string;
  companyWebsite?: string;
  companyAddress?: string;
  companySize?: string;
  industry?: string;
}


export interface Vacancy {
  id: number;
  employerId: number;
  companyName?: string;
  title: string;
  description: string;
  requirements?: string;
  salary?: number;
  location?: string;
  employmentType: 'full-time' | 'part-time' | 'contract' | 'internship';
  level?: 'junior' | 'middle' | 'senior' | 'lead';
  skills?: string[];
  benefits?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  employer?: Employer; 
}


export interface EmployerProfile {
  employer: Employer;
  vacancies: Vacancy[];
  vacanciesCount: number;
}