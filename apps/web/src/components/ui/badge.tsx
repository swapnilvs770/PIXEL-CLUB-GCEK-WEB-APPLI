import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'pending' | 'completed' | 'gradient';
}

const styles: Record<NonNullable<BadgeProps['variant']>, string> = {
  default: 'bg-white/[0.05] text-foreground/80 border-white/10',
  success: 'bg-emerald-500/10 text-emerald-300 border-emerald-400/20',
  warning: 'bg-amber-500/10 text-amber-300 border-amber-400/20',
  danger: 'bg-red-500/10 text-red-300 border-red-400/20',
  info: 'bg-sky-500/10 text-sky-300 border-sky-400/20',
  pending: 'bg-yellow-500/10 text-yellow-300 border-yellow-400/20',
  completed: 'bg-emerald-500/10 text-emerald-300 border-emerald-400/20',
  gradient:
    'border-transparent text-white bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20',
};

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap backdrop-blur',
        styles[variant],
        className
      )}
      {...props}
    />
  );
}
