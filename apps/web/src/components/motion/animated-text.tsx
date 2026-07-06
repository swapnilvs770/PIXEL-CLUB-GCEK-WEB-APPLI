import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'brand' | 'gold' | 'cool' | 'plain';

interface AnimatedTextProps {
  children: ReactNode;
  className?: string;
  as?: 'span' | 'h1' | 'h2' | 'h3' | 'p' | 'div';
  variant?: Variant;
}

const variantClass: Record<Variant, string> = {
  brand: 'text-gradient-brand',
  gold: 'text-gradient-gold',
  cool: 'text-gradient-cool',
  plain: '',
};

/**
 * AnimatedText — gradient-clipped heading text with an optional
 * moving highlight sweep. The class .text-gradient-brand (defined in
 * index.css) handles both the gradient fill and the animation.
 */
export function AnimatedText({
  children,
  className,
  as: Tag = 'span',
  variant = 'brand',
}: AnimatedTextProps) {
  return (
    <Tag
      className={cn(
        'font-display tracking-tight',
        variantClass[variant],
        className
      )}
    >
      {children}
    </Tag>
  );
}
