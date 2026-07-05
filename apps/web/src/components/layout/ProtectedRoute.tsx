import { Navigate, useLocation } from 'react-router-dom';
import { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (user.status === 'pending') {
    return <Navigate to="/pending" replace />;
  }

  if (user.status === 'blocked') {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="max-w-md rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center">
          <h1 className="text-xl font-semibold text-destructive">Access blocked</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your account has been blocked. Please contact an admin.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
