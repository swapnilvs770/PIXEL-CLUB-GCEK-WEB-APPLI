import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Camera,
  LayoutDashboard,
  ClipboardList,
  Users,
  Image as ImageIcon,
  UserCircle,
  BarChart3,
  FileText,
  Settings as SettingsIcon,
  ChevronDown,
  type LucideIcon,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

const userNav: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
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

export default function Sidebar() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-white/[0.06] bg-white/[0.015] backdrop-blur-xl">
      <div className="flex h-16 items-center gap-2 border-b border-white/[0.06] px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 shadow-[0_8px_24px_-8px_rgba(99,102,241,0.6)]">
          <Camera className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="font-display text-sm font-semibold tracking-tight">Pixel Club</p>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">GCE Karad</p>
        </div>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto p-4">
        <NavSection label="Workspace" items={userNav} />
        {isAdmin && <NavSection label="Admin" items={adminNav} />}
      </nav>

      <div className="border-t border-white/[0.06] p-4">
        <div className="glass rounded-xl p-3 text-xs text-muted-foreground">
          <p className="font-medium text-foreground/90">v1.0</p>
          <p className="mt-0.5">Pixel Club Management Portal</p>
        </div>
      </div>
    </aside>
  );
}

function NavSection({ label, items }: { label: string; items: NavItem[] }) {
  return (
    <div>
      <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/70">
        {label}
      </p>
      <ul className="space-y-0.5">
        {items.map((item) => (
          <li key={item.to}>
            <NavLink to={item.to} end={item.end}>
              {({ isActive }) => <NavRow item={item} active={isActive} />}
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
}

function NavRow({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;
  return (
    <div className="relative">
      {active && (
        <motion.span
          layoutId="sidebar-active"
          className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/15 via-purple-500/15 to-pink-500/15 ring-1 ring-white/10"
          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
        />
      )}
      <div
        className={cn(
          'relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
          active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-white/[0.04]'
        )}
      >
        <Icon
          className={cn(
            'h-4 w-4 transition-colors',
            active && 'text-foreground drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]'
          )}
        />
        <span>{item.label}</span>
        {active && (
          <span className="ml-auto h-1.5 w-1.5 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 shadow-[0_0_8px_rgba(99,102,241,0.7)]" />
        )}
      </div>
    </div>
  );
}

// Re-export to suppress unused warning in case we want to inline
export { ChevronDown };
