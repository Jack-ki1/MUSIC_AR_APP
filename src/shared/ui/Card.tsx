import React from 'react';

type CardVariant = 'default' | 'subtle' | 'dark' | 'accent';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  interactive?: boolean;
}

const variants: Record<CardVariant, string> = {
  default: 'bg-surface border border-line text-navy-700',
  subtle: 'bg-surface-subtle border border-line text-navy-700',
  dark: 'bg-navy-900 border border-line-strong text-navy-100',
  accent: 'bg-surface border border-brand-500 text-navy-700'
};

const paddings: Record<string, string> = {
  none: '',
  sm: 'p-2.5',
  md: 'p-3.5',
  lg: 'p-4'
};

/**
 * The single panel construction for the whole app: flat surface, 1px rule,
 * micro radius, no elevation. Density over decoration.
 */
export const Card: React.FC<CardProps> = ({
  variant = 'default',
  padding = 'md',
  interactive = false,
  className,
  children,
  ...props
}) => (
  <div
    className={[
      'rounded-card',
      variants[variant],
      paddings[padding],
      interactive
        ? 'transition-colors hover:border-line-strong cursor-pointer'
        : '',
      className ?? ''
    ].join(' ').trim()}
    {...props}
  >
    {children}
  </div>
);

export default Card;
