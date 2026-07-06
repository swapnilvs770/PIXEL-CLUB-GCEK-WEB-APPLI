import * as React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardGlow } from './card';
import { Skeleton } from './skeleton';

interface StatCardProps {
  to?: string;
  icon: LucideIcon;
  label: string;
  value: number | string;
  loading?: boolean;
  hint?: string;
  trend?: { value: number; positive?: boolean };
  accent?: 'blue' | 'purple' | 'emerald' | 'amber' | 'pink' | 'cyan' | 'red' | 'slate';
}

const accentMap: Record<NonNullable<StatCardProps['accent']>, string> = {
  blue: 'from-blue-500/20 via-blue-400/10 text-blue-300',
  purple: 'from-purple-500/20 via-fuchsia-400/10 text-purple-300',
  emerald: 'from-emerald-500/20 via-teal-400/10 text-emerald-300',
  amber: 'from-amber-500/20 via-yellow-400/10 text-amber-300',
  pink: 'from-pink-500/20 via-rose-400/10 text-pink-300',
  cyan: 'from-cyan-500/20 via-sky-400/10 text-cyan-300',
  red: 'from-red-500/20 via-rose-400/10 text-red-300',
  slate: 'from-slate-500/20 via-slate-400/10 text-slate-300',
};

export function StatCard({
  to,
  icon: Icon,
  label,
  value,
  loading,
  hint,
  trend,
  accent = 'blue',
}: StatCardProps) {
  const content = (
    <Card interactive={!!to} className="relative h-full">
      <CardGlow />
      <div className="relative p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ring-1 ring-white/10',
              accentMap[accent]
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
          {to && (
            <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          )}
        </div>

        <div className="mt-5">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
          {loading ? (
            <Skeleton className="mt-2 h-9 w-24" />
          ) : (
            <div className="mt-1 flex items-baseline gap-2">
              <span className="font-display text-3xl font-semibold tabular-nums tracking-tight">
                {typeof value === 'number' ? value.toLocaleString() : value}
              </span>
              {trend && (
                <span
                  className={cn(
                    'text-xs font-medium',
                    trend.positive ? 'text-emerald-400' : 'text-red-400'
                  )}
                >
                  {trend.positive ? '+' : ''}
                  {trend.value}%
                </span>
              )}
            </div>
          )}
          {hint && !loading && (
            <p className="mt-1 text-xs text-muted-foreground/80">{hint}</p>
          )}
        </div>
      </div>
    </Card>
  );

  if (to) {
    return (
      <Link to={to} className="group block">
        {content}
      </Link>
    );
  }
  return content;
}
