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

