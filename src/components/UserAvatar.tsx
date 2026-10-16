import React, { useState } from 'react';

export interface UserAvatarProps {
  src?: string | null;
  name?: string | null;
  handle?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  ring?: boolean;
}

const GRADIENTS = [
  'from-blue-600 to-indigo-700',
  'from-purple-600 to-pink-700',
  'from-emerald-600 to-teal-700',
  'from-cyan-600 to-blue-700',
  'from-amber-600 to-orange-700',
  'from-rose-600 to-red-700',
  'from-violet-600 to-purple-800',
];

function getInitials(name?: string | null, handle?: string | null): string {
  if (name && name.trim()) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  }
  if (handle && handle.trim()) {
    const clean = handle.replace(/^@/, '').trim();
    if (clean) return clean.substring(0, 2).toUpperCase();
  }
  return '?';
}

function getGradient(seed?: string | null): string {
  if (!seed) return GRADIENTS[0];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const idx = Math.abs(hash) % GRADIENTS.length;
  return GRADIENTS[idx];
}

const SIZE_CLASSES = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-xl',
};

export function UserAvatar({
  src,
  name,
  handle,
  size = 'md',
  className = '',
  ring = true,
}: UserAvatarProps) {
  const [imgError, setImgError] = useState(false);
  const initials = getInitials(name, handle);
  const gradient = getGradient(handle || name || '');
  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.md;
  const ringClass = ring ? 'border border-[#2b2b3d]' : '';

  const hasValidImage = !!src && src.trim().length > 0 && !imgError;

  if (hasValidImage) {
    return (
      <img
        src={src!}
        alt={name || handle || 'Avatar'}
        onError={() => setImgError(true)}
        className={`rounded-full object-cover shrink-0 ${sizeClass} ${ringClass} ${className}`}
      />
    );
  }

  return (
    <div
      aria-label={name || handle || 'Avatar'}
      className={`rounded-full bg-gradient-to-tr ${gradient} flex items-center justify-center font-bold text-white shrink-0 shadow-inner select-none ${sizeClass} ${ringClass} ${className}`}
    >
      <span>{initials}</span>
    </div>
  );
}
