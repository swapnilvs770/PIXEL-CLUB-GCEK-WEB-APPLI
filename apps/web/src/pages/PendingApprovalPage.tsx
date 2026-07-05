import { useNavigate } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

export default function PendingApprovalPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 text-yellow-700">
            <Clock className="h-6 w-6" />
          </div>
          <CardTitle>Account pending approval</CardTitle>
          <CardDescription>
            Hi {user?.name ?? 'there'}, your account has been created successfully.
            An admin needs to approve your account before you can access the portal.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleLogout} variant="outline" className="w-full">
            Sign out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
