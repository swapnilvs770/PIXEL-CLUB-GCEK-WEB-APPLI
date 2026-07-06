import * as React from 'react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'relative flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-16 text-center',
        className
      )}
    >
      <div className="absolute inset-0 rounded-[inherit] bg-radial-highlight opacity-50" aria-hidden />
      {icon && (
        <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 ring-1 ring-white/10 text-white/80">
          {icon}
        </div>
      )}
      <div className="relative max-w-sm space-y-1">
        <h3 className="font-display text-base font-semibold text-foreground">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        )}
      </div>
      {action && <div className="relative pt-2">{action}</div>}
    </div>
  );
}
