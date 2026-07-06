import * as React from 'react';
import { cn } from '@/lib/utils';

interface SectionHeaderProps {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  align?: 'left' | 'center';
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
  className,
  align = 'left',
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between',
        align === 'center' && 'sm:flex-col sm:items-center sm:text-center',
        className
      )}
    >
      <div className="space-y-1.5">
        {eyebrow && (
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-medium">
            {eyebrow}
          </p>
        )}
        <h2 className="font-display text-2xl font-semibold tracking-tight text-pretty sm:text-3xl">
          {title}
        </h2>
        {description && (
          <p className="max-w-2xl text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
