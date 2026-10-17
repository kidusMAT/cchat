import React from 'react';
import { cn } from '../../lib/cn';

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Required for accessibility — icon-only controls need a label. */
  label: string;
  size?: 'sm' | 'md';
  tone?: 'default' | 'danger';
}

export function IconButton({
  label,
  size = 'md',
  tone = 'default',
  className,
  children,
  type = 'button',
  ...props
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex items-center justify-center rounded-lg transition-colors cursor-pointer',
        size === 'sm' ? 'h-8 w-8' : 'h-9 w-9',
        tone === 'danger'
          ? 'text-ink-muted hover:text-rose-400 hover:bg-surface-2'
          : 'text-ink-muted hover:text-white hover:bg-surface-2',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
