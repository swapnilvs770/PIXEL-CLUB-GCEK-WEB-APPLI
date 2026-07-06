import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, leftIcon, rightIcon, id, onFocus, onBlur, ...props }, ref) => {
    const reactId = React.useId();
    const inputId = id ?? `inp-${reactId}`;
    const [focused, setFocused] = React.useState(false);
    const hasValue =
      (props.value != null && String(props.value) !== '') ||
      (props.defaultValue != null && String(props.defaultValue) !== '');

    return (
      <div className="space-y-1.5">
        <div
          className={cn(
            'group relative flex items-center rounded-xl border bg-white/[0.02] backdrop-blur-xl',
            'transition-all duration-300',
            'hover:border-white/15',
            focused ? 'border-white/25 shadow-[0_0_0_4px_rgba(96,165,250,0.12)]' : 'border-white/[0.08]',
            error && 'border-red-500/40 shadow-[0_0_0_4px_rgba(239,68,68,0.1)]',
            label && 'pt-5 pb-2 px-3.5'
          )}
        >
          {leftIcon && (
            <span className={cn('mr-2 text-muted-foreground transition-colors', focused && 'text-foreground')}>
              {leftIcon}
            </span>
          )}
          {label && (
            <label
              htmlFor={inputId}
              className={cn(
                'pointer-events-none absolute left-3.5 transition-all duration-200 origin-left',
                focused || hasValue
                  ? 'top-1.5 text-[10px] uppercase tracking-wider font-medium text-muted-foreground'
                  : 'top-1/2 -translate-y-1/2 text-sm text-muted-foreground/80',
                leftIcon && (focused || hasValue) && 'left-10',
                leftIcon && !(focused || hasValue) && 'left-10'
              )}
            >
              {label}
            </label>
          )}
          <input
            id={inputId}
            ref={ref}
            onFocus={(e) => {
              setFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              onBlur?.(e);
            }}
            className={cn(
              'flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 outline-none',
              label && 'pt-2.5 pb-1',
              className
            )}
            placeholder={focused ? props.placeholder : undefined}
            {...props}
          />
          {rightIcon && (
            <span className="ml-2 text-muted-foreground transition-colors">{rightIcon}</span>
          )}
        </div>
        {(error || hint) && (
          <p
            className={cn(
              'px-1 text-xs',
              error ? 'text-red-400' : 'text-muted-foreground'
            )}
          >
            {error || hint}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, id, onFocus, onBlur, ...props }, ref) => {
    const reactId = React.useId();
    const inputId = id ?? `ta-${reactId}`;
    const [focused, setFocused] = React.useState(false);
    const hasValue =
      (props.value != null && String(props.value) !== '') ||
      (props.defaultValue != null && String(props.defaultValue) !== '');

    return (
      <div className="space-y-1.5">
        <div
          className={cn(
            'relative rounded-xl border bg-white/[0.02] backdrop-blur-xl',
            'transition-all duration-300',
            'hover:border-white/15',
            focused
              ? 'border-white/25 shadow-[0_0_0_4px_rgba(96,165,250,0.12)]'
              : 'border-white/[0.08]',
            error && 'border-red-500/40 shadow-[0_0_0_4px_rgba(239,68,68,0.1)]',
            label && 'pt-5 pb-2 px-3.5'
          )}
        >
          {label && (
            <label
              htmlFor={inputId}
              className={cn(
                'pointer-events-none absolute left-3.5 transition-all duration-200 origin-left',
                focused || hasValue
                  ? 'top-1.5 text-[10px] uppercase tracking-wider font-medium text-muted-foreground'
                  : 'top-3 text-sm text-muted-foreground/80'
              )}
            >
              {label}
            </label>
          )}
          <textarea
            id={inputId}
            ref={ref}
            onFocus={(e) => {
              setFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              onBlur?.(e);
            }}
            className={cn(
              'w-full resize-y bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 outline-none',
              label && 'pt-2.5 pb-1',
              className
            )}
            placeholder={focused ? props.placeholder : undefined}
            {...props}
          />
        </div>
        {(error || hint) && (
          <p className={cn('px-1 text-xs', error ? 'text-red-400' : 'text-muted-foreground')}>
            {error || hint}
          </p>
        )}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

export { Input, Textarea };
