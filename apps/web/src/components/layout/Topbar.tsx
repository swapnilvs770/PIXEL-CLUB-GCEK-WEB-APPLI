import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Menu, Moon, Sun } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import NotificationBell from './NotificationBell';

interface TopbarProps {
  onMobileMenuToggle?: () => void;
}

export default function Topbar({ onMobileMenuToggle }: TopbarProps) {
  const { user, logout } = useAuth();
  const { resolved, toggle } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-white/[0.06] bg-background/60 px-4 backdrop-blur-xl sm:px-6">
      <Button
        variant="ghost"
        size="icon-sm"
        className="lg:hidden"
        onClick={onMobileMenuToggle}
        aria-label="Toggle menu"
      >
        <Menu className="h-4 w-4" />
      </Button>

      <div className="flex-1" />

      <NotificationBell />

      <Button
        variant="ghost"
        size="icon-sm"
        onClick={toggle}
        aria-label="Toggle theme"
      >
        {resolved === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </Button>

      <div className="hidden sm:flex items-center gap-3 pl-3 ml-1 border-l border-white/[0.06]">
        <div className="text-right">
          <p className="text-sm font-medium leading-none">{user?.name}</p>
          <p className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">
            {user?.role}
          </p>
        </div>
        <Avatar name={user?.name ?? '?'} src={user?.avatarUrl ?? null} size="sm" />
      </div>

      <Button variant="ghost" size="icon-sm" onClick={handleLogout} aria-label="Sign out">
        <LogOut className="h-4 w-4" />
      </Button>

      <Link to="/" className="lg:hidden ml-auto">
        <span className="font-display text-sm font-semibold">Pixel</span>
      </Link>
    </header>
  );
}
