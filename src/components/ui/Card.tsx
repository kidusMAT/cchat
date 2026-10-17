import React from 'react';
import { cn } from '../../lib/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
  as?: 'div' | 'article' | 'section';
}

export function Card({
  interactive,
  as: Tag = 'div',
  className,
  children,
  ...props
}: CardProps) {
  return (
    <Tag
      className={cn(
        'rounded-2xl border border-line-2 bg-surface',
        interactive &&
          'cursor-pointer transition-colors hover:border-line-strong hover:bg-surface-2',
        className,
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}
