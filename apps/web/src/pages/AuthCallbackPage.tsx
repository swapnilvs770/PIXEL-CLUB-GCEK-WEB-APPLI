import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { apiClient, setStoredToken } from '@/api/client';
import { useAuth } from '@/contexts/AuthContext';
import type { User } from '@/types/auth';

/**
 * Handles the redirect from the backend after a successful Google OAuth login.
 * The backend redirects to /auth/callback?token=<jwt>.
 * This page:
 *   1. Extracts the token from the URL
 *   2. Persists it to localStorage
 *   3. Calls /auth/me to load the user
 *   4. Navigates to /dashboard, /pending, or /login based on the result
 */
export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { refresh } = useAuth();
  const handledRef = useRef(false);

  useEffect(() => {
    if (handledRef.current) return;
    handledRef.current = true;

    const error = searchParams.get('error');
    if (error) {
      navigate(`/login?error=${encodeURIComponent(error)}`, { replace: true });
      return;
    }

    const token = searchParams.get('token');
    if (!token) {
      navigate('/login?error=missing_token', { replace: true });
      return;
    }

    setStoredToken(token);

    apiClient
      .get<{ data: User }>('/auth/me')
      .then((res) => {
        const user = res.data.data;
        // Best-effort sync of AuthContext for any other components
        void refresh();
        if (user.status === 'approved') {
          navigate('/dashboard', { replace: true });
        } else if (user.status === 'pending') {
          navigate('/pending', { replace: true });
        } else if (user.status === 'blocked') {
          setStoredToken(null);
          navigate('/login?error=blocked', { replace: true });
        }
      })
      .catch(() => {
        setStoredToken(null);
        navigate('/login?error=auth_failed', { replace: true });
      });
  }, [searchParams, navigate, refresh]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3 text-sm text-muted-foreground">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
        <p>Signing you in…</p>
      </div>
    </div>
  );
}
