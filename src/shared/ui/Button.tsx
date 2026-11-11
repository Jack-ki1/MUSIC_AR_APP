import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const base =
  'inline-flex items-center justify-center gap-1.5 font-semibold rounded-tile border transition-colors cursor-pointer select-none disabled:opacity-45 disabled:cursor-not-allowed';

const sizes: Record<ButtonSize, string> = {
  xs: 'px-2 py-0.5 text-2xs',
  sm: 'px-2.5 py-1 text-xs',
  md: 'px-3 py-1.5 text-xs',
  lg: 'px-4 py-2 text-sm'
};

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-brand-500 text-navy-900 border-brand-500 hover:bg-brand-400 hover:border-brand-400',
  secondary:
    'bg-surface-subtle text-navy-700 border-line-strong hover:bg-purple-100 hover:border-purple-500',
  ghost:
    'bg-transparent text-purple-500 border-transparent hover:bg-purple-100 hover:text-navy-700',
  danger:
    'bg-danger-600 text-navy-900 border-danger-600 hover:bg-danger-600/85'
};

/** The one button for the app — signal-orange primary, dark ink on colour. */
export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading,
  leftIcon,
  rightIcon,
  className,
  children,
  disabled,
  type = 'button',
  ...props
}) => (
  <button
    type={type}
    className={[base, sizes[size], variants[variant], className ?? ''].join(' ').trim()}
    disabled={disabled || isLoading}
    {...props}
  >
    {isLoading ? (
      <span className="inline-block w-3 h-3 rounded-full border-2 border-current border-t-transparent animate-spin" />
    ) : (
      leftIcon
    )}
    {children}
    {!isLoading && rightIcon}
  </button>
);

export default Button;
