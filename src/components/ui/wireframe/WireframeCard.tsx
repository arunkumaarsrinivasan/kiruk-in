'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { WireframeBadge } from './WireframeBadge';

interface WireframeCardProps {
  children: React.ReactNode;
  className?: string;
  header?: React.ReactNode;
  badge?: string;
  badgeVariant?: 'default' | 'accent' | 'muted';
  hoverable?: boolean;
  onClick?: () => void;
}

/**
 * WireframeCard Component
 * 
 * Base card with outline-style borders (transparent fill) that highlight on hover.
 * Preserves pixel/grid background visibility through transparent fill.
 */
export function WireframeCard({
  children,
  className,
  header,
  badge,
  badgeVariant = 'default',
  hoverable = true,
  onClick,
}: WireframeCardProps) {
  const Component = onClick ? motion.button : motion.div;
  const baseClasses = cn(
    'relative border rounded-[var(--wireframe-border-radius,12px)]',
    'bg-transparent', // Transparent fill so pixel/grid shows through
    'transition-all duration-150',
    'grid-p-4', // Grid-aligned padding
    className
  );

  const hoverClasses = hoverable
    ? 'hover:border-[var(--wireframe-outline-hover-width,2px)] hover:border-[var(--wireframe-border-hover,var(--accent-color))] hover:shadow-[0_0_8px_rgba(var(--accent-color-rgb,0,0,0),var(--wireframe-glow-opacity,0.3))]'
    : '';

  const defaultStyle: React.CSSProperties = {
    borderWidth: 'var(--wireframe-outline-width, 1px)',
    borderColor: 'var(--wireframe-border-color, var(--border-color))',
    borderStyle: 'solid',
  };

  return (
    <Component
      className={cn(baseClasses, hoverClasses)}
      style={defaultStyle}
      onClick={onClick}
      whileHover={hoverable ? { y: -2 } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
    >
      {/* Header section */}
      {header && (
        <div className="grid-mb-3 border-b" style={{ borderColor: 'var(--wireframe-border-color, var(--border-color))' }}>
          <div className="flex items-center justify-between">
            <div className="flex-1">{header}</div>
            {badge && (
              <WireframeBadge variant={badgeVariant} className="ml-2">
                {badge}
              </WireframeBadge>
            )}
          </div>
        </div>
      )}

      {/* Badge without header */}
      {!header && badge && (
        <div className="absolute top-4 right-4">
          <WireframeBadge variant={badgeVariant}>{badge}</WireframeBadge>
        </div>
      )}

      {/* Body content */}
      <div className={cn(header || badge ? '' : '')}>{children}</div>
    </Component>
  );
}
