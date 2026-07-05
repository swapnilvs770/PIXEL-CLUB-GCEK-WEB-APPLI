import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { AuthState, User } from '@/types/auth';
import { apiClient, getStoredToken, setStoredToken } from '@/api/client';
import { env } from '@/lib/env';

interface AuthContextValue extends AuthState {
  loginWithGoogle: () => void;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: getStoredToken(),
    isLoading: true,
    isAuthenticated: false,
  });

  const refresh = useCallback(async () => {
    const token = getStoredToken();
    if (!token) {
      setState({ user: null, token: null, isLoading: false, isAuthenticated: false });
      return;
    }
    try {
      const res = await apiClient.get<{ data: User }>('/auth/me');
      setState({ user: res.data.data, token, isLoading: false, isAuthenticated: true });
    } catch {
      setStoredToken(null);
      setState({ user: null, token: null, isLoading: false, isAuthenticated: false });
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const loginWithGoogle = useCallback(() => {
    // Full implementation in Phase 2 — for now this points to the backend OAuth start endpoint.
    const backend = env.apiBaseUrl.replace(/\/api$/, '');
    window.location.assign(`${backend}/api/auth/google`);
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      /* ignore — local logout still happens */
    }
    setStoredToken(null);
    setState({ user: null, token: null, isLoading: false, isAuthenticated: false });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        loginWithGoogle,
        logout,
        refresh,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
