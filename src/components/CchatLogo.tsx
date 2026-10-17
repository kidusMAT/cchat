import React from 'react';
import { cn } from '../lib/cn';

export interface CchatLogoProps {
  size?: number;
  className?: string;
}

/** Shared CCHAT double chat-bubble mark. */
export function CchatLogo({ size = 26, className }: CchatLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('text-accent stroke-current', className)}
      aria-hidden="true"
    >
      <rect
        x="2"
        y="3"
        width="14"
        height="10"
        rx="3"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3 13L2 16L6 13"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 14V17C8 18.1046 8.89543 19 10 19H17L21 21L20.2 18.2C21.3 17.5 22 16.3 22 15C22 13.8954 21.1046 13 20 13H18"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
