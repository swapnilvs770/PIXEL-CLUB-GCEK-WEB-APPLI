import * as React from 'react';
import { cn } from '@/lib/utils';

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { interactive?: boolean }>(
  ({ className, interactive, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02]',
        'shadow-[0_8px_40px_-12px_rgba(0,0,0,0.5)] backdrop-blur-xl',
        'transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
        interactive &&
          'cursor-pointer hover:-translate-y-0.5 hover:border-white/[0.12] hover:bg-white/[0.04] hover:shadow-[0_20px_60px_-20px_rgba(99,102,241,0.35)]',
        className
      )}
      {...props}
    />
  )
);
Card.displayName = 'Card';

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />
  )
);
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('font-display text-lg font-semibold leading-tight tracking-tight', className)}
      {...props}
    />
  )
);
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn('text-sm text-muted-foreground leading-relaxed', className)} {...props} />
  )
);
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
  )
);
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex items-center p-6 pt-0', className)} {...props} />
  )
);
CardFooter.displayName = 'CardFooter';

/* Subtle inner highlight (top-edge sheen) for premium cards */
const CardGlow = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      aria-hidden
      className={cn(
        'pointer-events-none absolute inset-0 rounded-[inherit]',
        'bg-radial-highlight',
        className
      )}
      {...props}
    />
  )
);
CardGlow.displayName = 'CardGlow';

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, CardGlow };
