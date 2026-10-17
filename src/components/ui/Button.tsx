import React from 'react';
import { cn } from '../../lib/cn';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  /** Optional leading icon rendered before the label. */
  icon?: React.ReactNode;
  /** Optional trailing icon rendered after the label. */
  trailingIcon?: React.ReactNode;
  fullWidth?: boolean;
  loading?: boolean;
}

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-accent text-white hover:bg-accent-strong shadow-lg shadow-accent/25 active:scale-[0.98]',
  secondary:
    'bg-surface-2 text-ink hover:bg-surface-3 border border-line-2 active:scale-[0.98]',
  outline:
    'bg-transparent text-ink-soft hover:text-white border border-line-2 hover:border-line-strong active:scale-[0.98]',
  ghost:
    'bg-transparent text-ink-muted hover:text-white hover:bg-surface-2 active:scale-[0.98]',
  danger:
    'bg-rose-500/90 text-white hover:bg-rose-500 shadow-lg shadow-rose-500/20 active:scale-[0.98]',
};

const SIZES: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5 rounded-lg',
  md: 'h-10 px-4 text-sm gap-2 rounded-xl',
  lg: 'h-12 px-5 text-sm gap-2 rounded-xl',
};

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  trailingIcon,
  fullWidth,
  loading,
  className,
  children,
  disabled,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center font-semibold transition-all duration-150',
        'cursor-pointer select-none disabled:opacity-50 disabled:pointer-events-none',
        VARIANTS[variant],
        SIZES[size],
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {loading ? (
        <span
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden="true"
        />
      ) : (
        icon
      )}
      {children}
      {trailingIcon}
    </button>
  );
}
