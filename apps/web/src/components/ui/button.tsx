import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  [
    'group relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium',
    'transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
    'focus-ring disabled:pointer-events-none disabled:opacity-50',
    'select-none active:scale-[0.98]',
  ].join(' '),
  {
    variants: {
      variant: {
        default:
          'bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 text-white shadow-[0_8px_30px_-12px_rgba(99,102,241,0.6)] hover:shadow-[0_12px_40px_-10px_rgba(168,85,247,0.7)] hover:saturate-[1.2]',
        primary:
          'bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 text-white shadow-[0_8px_30px_-12px_rgba(99,102,241,0.6)] hover:shadow-[0_12px_40px_-10px_rgba(168,85,247,0.7)] hover:saturate-[1.2]',
        secondary:
          'glass-strong text-foreground hover:bg-white/[0.06] hover:border-white/20',
        ghost:
          'text-foreground/80 hover:text-foreground hover:bg-white/[0.05]',
        outline:
          'border border-white/15 text-foreground hover:bg-white/[0.04] hover:border-white/25',
        destructive:
          'bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-[0_8px_30px_-12px_rgba(239,68,68,0.6)] hover:shadow-[0_12px_40px_-10px_rgba(244,63,94,0.7)]',
        gold:
          'bg-gradient-to-br from-amber-300 via-yellow-400 to-orange-500 text-black shadow-[0_8px_30px_-12px_rgba(245,158,11,0.7)] hover:shadow-[0_12px_40px_-10px_rgba(251,191,36,0.85)]',
      },
      size: {
        sm: 'h-9 px-3.5 text-xs',
        default: 'h-10 px-5 text-sm',
        lg: 'h-11 px-7 text-sm',
        xl: 'h-12 px-8 text-base',
        icon: 'h-10 w-10',
        'icon-sm': 'h-8 w-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading, children, disabled, ...props }, ref) => {
    // When asChild=true, Radix Slot requires exactly ONE React element child.
    // We can't inject the decorative inner-highlight span or the loading spinner
    // because that would make Slot receive multiple children and throw.
    if (asChild) {
      return (
        <Slot
          ref={ref}
          className={cn(buttonVariants({ variant, size }), 'overflow-hidden', className)}
          {...props}
        >
          {children}
        </Slot>
      );
    }

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(buttonVariants({ variant, size }), 'overflow-hidden', className)}
        {...props}
      >
        {/* Subtle inner highlight on primary/gold/destructive for glassy depth */}
        {(variant === 'default' ||
          variant === 'primary' ||
          variant === 'gold' ||
          variant === 'destructive') && (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[inherit] bg-gradient-to-b from-white/[0.18] to-transparent opacity-60"
          />
        )}
        {loading ? (
          <>
            <span
              aria-hidden
              className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"
            />
            <span className="sr-only">Loading</span>
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
