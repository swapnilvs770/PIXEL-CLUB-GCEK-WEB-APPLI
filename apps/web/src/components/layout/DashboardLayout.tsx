import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import {
  Camera,
  LayoutDashboard,
  LogOut,
  Moon,
  Sun,
  Menu,
  ClipboardList,
  Users,
  Image as ImageIcon,
  ChevronDown,
  UserCircle,
  FileText,
  BarChart3,
  Settings as SettingsIcon,
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import NotificationBell from './NotificationBell';

interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
}

const userNav: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/requests', label: 'My requests', icon: ClipboardList },
  { to: '/gallery', label: 'Gallery', icon: ImageIcon },
  { to: '/team', label: 'Team', icon: UserCircle },
];

const adminNav: NavItem[] = [
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/requests', label: 'All requests', icon: ClipboardList },
  { to: '/admin/albums', label: 'Albums', icon: ImageIcon },
  { to: '/admin/team', label: 'Team batches', icon: UserCircle },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/admin/logs', label: 'Audit logs', icon: FileText },
  { to: '/admin/settings', label: 'Settings', icon: SettingsIcon },
];

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const { resolved, toggle } = useTheme();
  const navigate = useNavigate();
  const [adminOpen, setAdminOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const renderLink = (item: NavItem, end = false) => (
    <NavLink
      key={item.to}
      to={item.to}
      end={end}
      className={({ isActive }) =>
        cn(
          'inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
          isActive
            ? 'bg-secondary text-secondary-foreground'
            : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
        )
      }
    >
      <item.icon className="h-4 w-4" />
      {item.label}
    </NavLink>
  );

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur">
        <div className="container flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="md:hidden" aria-label="Menu">
              <Menu className="h-5 w-5" />
            </Button>
            <Link to="/dashboard" className="flex items-center gap-2 font-semibold">
              <Camera className="h-5 w-5 text-primary" />
              <span>Pixel Club</span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {userNav.map((item) => renderLink(item, true))}

            {user?.role === 'admin' && (
              <div
                className="relative"
                onMouseEnter={() => setAdminOpen(true)}
                onMouseLeave={() => setAdminOpen(false)}
              >
                <button
                  type="button"
                  className="inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                  onClick={() => setAdminOpen((v) => !v)}
                >
                  Admin
                  <ChevronDown className="h-3 w-3" />
                </button>
                {adminOpen && (
                  <div className="absolute right-0 mt-1 w-56 rounded-md border bg-popover p-1 shadow-md">
                    {adminNav.map((item) => (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                          cn(
                            'flex items-center gap-2 rounded-sm px-2 py-2 text-sm transition-colors',
                            isActive
                              ? 'bg-secondary text-secondary-foreground'
                              : 'hover:bg-secondary/60'
                          )
                        }
                        onClick={() => setAdminOpen(false)}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            )}
          </nav>

          <div className="flex items-center gap-2">
            <NotificationBell />
            <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
              {resolved === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <div className="hidden sm:block text-sm">
              <div className="font-medium leading-tight">{user?.name}</div>
              <div className="text-xs text-muted-foreground capitalize">{user?.role}</div>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Logout">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="container py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
