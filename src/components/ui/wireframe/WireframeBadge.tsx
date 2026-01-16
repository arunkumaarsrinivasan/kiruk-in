'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface WireframeBadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'accent' | 'muted';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * WireframeBadge Component
 * 
 * Small label/tag component with outline-style borders.
 * Pixel-aligned sizing.
 */
export function WireframeBadge({
  children,
  variant = 'default',
  className,
  size = 'sm',
}: WireframeBadgeProps) {
  const sizeClasses = {
    sm: 'text-[10px] px-2 py-1',
    md: 'text-xs px-3 py-1.5',
    lg: 'text-sm px-4 py-2',
  };

  const variantStyles: Record<string, React.CSSProperties> = {
    default: {
      borderColor: 'var(--wireframe-border-color, var(--border-color))',
      color: 'var(--text-main)',
    },
    accent: {
      borderColor: 'var(--wireframe-border-hover, var(--accent-color))',
      color: 'var(--accent-color)',
    },
    muted: {
      borderColor: 'var(--text-muted)',
      color: 'var(--text-muted)',
    },
  };

  return (
    <span
      className={cn(
        'inline-block border rounded font-mono font-bold uppercase tracking-wider',
        'bg-transparent', // Transparent fill
        sizeClasses[size],
        className
      )}
      style={{
        borderWidth: 'var(--wireframe-outline-width, 1px)',
        borderStyle: 'solid',
        ...variantStyles[variant],
      }}
    >
      {children}
    </span>
  );
}
