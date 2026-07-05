import { Link, useSearchParams } from 'react-router-dom';
import { Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

const errorMessages: Record<string, string> = {
  oauth_failed: 'Google sign-in failed. Please try again.',
  missing_token: 'The sign-in callback was missing a token. Please try again.',
  auth_failed: 'Could not verify your sign-in. Please try again.',
  blocked: 'Your account has been blocked. Contact an admin for help.',
};

export default function LoginPage() {
  const { loginWithGoogle } = useAuth();
  const [searchParams] = useSearchParams();
  const errorCode = searchParams.get('error');
  const errorMessage = errorCode ? errorMessages[errorCode] ?? 'Sign-in failed.' : null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Camera className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>Sign in to Pixel Club</CardTitle>
          <CardDescription>
            We use Google to verify your identity. New accounts require admin approval.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {errorMessage && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {errorMessage}
            </div>
          )}
          <Button onClick={loginWithGoogle} className="w-full" size="lg">
            Continue with Google
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            By continuing, you agree to abide by the Pixel Club code of conduct.
          </p>
          <p className="text-center text-sm">
            <Link to="/" className="text-muted-foreground hover:text-foreground">
              ← Back to home
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
