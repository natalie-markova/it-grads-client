export interface GameTask {
  id: number;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit: number;
  languages: string[];
  testCases: TestCase[];
  starterCode: Record<string, string>;
  hints?: string[];
  category?: string;
  tags?: string[];
  points: number;
  solvedCount: number;
  attemptCount: number;
  hiddenTestsCount?: number;
  externalUrl?: string;
  externalSource?: 'local' | 'codeforces' | 'leetcode';
}

export interface TestCase {
  input: unknown;
  expectedOutput: unknown;
  isHidden?: boolean;
}

export interface TestResult {
  input: unknown;
  expectedOutput: unknown;
  actualOutput: string;
  passed: boolean;
  time: number;
  memory: number;
  error?: string;
  isHidden?: boolean;
}

export interface PlayerRating {
  id: number;
  userId: number;
  rating: number;
  maxRating: number;
  league: League;
  wins: number;
  losses: number;
  draws: number;
  streak: number;
  maxStreak: number;
  totalGames: number;
  totalSolved: number;
  favoriteLanguage?: string;
  avgSolveTime?: number;
  achievements: Achievement[];
  dailyChallengeStreak: number;
  leagueIcon?: string;
  rank?: number;
  user?: {
    id: number;
    username: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
  };
}

export type League = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'master' | 'grandmaster';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string;
}

export interface GameSession {
  id: number;
  userId: number;
  taskId: number;
  mode: 'solo' | 'vs_ai' | 'daily_challenge';
  status: 'in_progress' | 'completed' | 'abandoned' | 'timeout';
  code?: string;
  language?: string;
  solved: boolean;
  testsPassed: number;
  totalTests: number;
  timeSpent?: number;
  hintsUsed: number;
  pointsEarned: number;
  aiDifficulty?: 'easy' | 'medium' | 'hard';
  aiSolveTime?: number;
  beatAi?: boolean;
  startedAt?: string;
  finishedAt?: string;
  task?: GameTask;
}

export interface GameMatch {
  id: number;
  player1Id: number;
  player2Id: number;
  taskId: number;
  status: 'waiting' | 'in_progress' | 'completed' | 'cancelled' | 'timeout';
  winnerId?: number;
  isDraw: boolean;
  player1Code?: string;
  player2Code?: string;
  player1Language?: string;
  player2Language?: string;
  player1Solved: boolean;
  player2Solved: boolean;
  player1SolveTime?: number;
  player2SolveTime?: number;
  player1TestsPassed: number;
  player2TestsPassed: number;
  totalTests: number;
  player1RatingBefore?: number;
  player2RatingBefore?: number;
  player1RatingChange?: number;
  player2RatingChange?: number;
  timeLimit: number;
  startedAt?: string;
  finishedAt?: string;
  roomCode?: string;
  task?: GameTask;
  player1?: {
    id: number;
    username: string;
    avatar?: string;
  };
  player2?: {
    id: number;
    username: string;
    avatar?: string;
  };
}

export interface MatchFoundData {
  matchId: number;
  task: GameTask;
  opponent: {
    id: number;
    username: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
    rating: number;
    league: League;
  };
  timeLimit: number;
  startedAt: string;
}

export interface MatchFinishedData {
  matchId: number;
  winnerId?: number;
  isDraw: boolean;
  player1: {
    id: number;
    solved: boolean;
    solveTime?: number;
    testsPassed: number;
    ratingChange: number;
  };
  player2: {
    id: number;
    solved: boolean;
    solveTime?: number;
    testsPassed: number;
    ratingChange: number;
  };
}

export interface SubmitResult {
  solved: boolean;
  testsPassed: number;
  totalTests: number;
  results: TestResult[];
  timeSpent: number;
  pointsEarned: number;
  beatAi?: boolean;
  aiSolveTime?: number | null;
  aiSolved?: boolean | null;
  aiTestsPassed?: number | null;
  executionTime?: number;
  memoryUsed?: number;
  playerRating?: {
    rating: number;
    league: League;
    wins: number;
    losses: number;
    streak: number;
  };
}

export interface Language {
  id: string;
  name: string;
  template: string;
}

export type GameMode = 'solo' | 'pvp' | 'vs_ai' | 'daily';