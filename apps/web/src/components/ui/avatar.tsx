import * as React from 'react';
import { cn } from '@/lib/utils';
import { getInitials } from '@/lib/utils';

interface AvatarProps {
  src?: string | null;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes: Record<NonNullable<AvatarProps['size']>, string> = {
  xs: 'h-6 w-6 text-[10px]',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
};

export function Avatar({ src, name, size = 'md', className }: AvatarProps) {
  return (
    <div
      className={cn(
        'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-blue-500/30 via-purple-500/30 to-pink-500/30 font-medium text-foreground ring-1 ring-white/10',
        sizes[size],
        className
      )}
    >
      {src ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img src={src} alt={name} className="h-full w-full object-cover" />
      ) : (
        <span>{getInitials(name) || '?'}</span>
      )}
    </div>
  );
}
