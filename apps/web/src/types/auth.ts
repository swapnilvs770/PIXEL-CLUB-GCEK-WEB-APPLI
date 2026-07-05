export type UserRole = 'user' | 'admin';
export type UserStatus = 'pending' | 'approved' | 'blocked';

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  lastLoginAt?: string | null;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export type AuthAction =
  | { type: 'INIT_START' }
  | { type: 'INIT_DONE'; user: User | null; token: string | null }
  | { type: 'LOGIN'; user: User; token: string }
  | { type: 'LOGOUT' }
  | { type: 'REFRESH_USER'; user: User };
