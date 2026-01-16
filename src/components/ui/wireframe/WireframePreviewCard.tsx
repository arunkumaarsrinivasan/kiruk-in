'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { WireframeBadge } from './WireframeBadge';

interface WireframePreviewCardProps {
  title: string;
  badge?: string;
  badgeVariant?: 'default' | 'accent' | 'muted';
  children?: React.ReactNode;
  className?: string;
  overlap?: boolean; // For overlapping design like Tailwind homepage
}

/**
 * WireframePreviewCard Component
 * 
 * Preview card for hero section with overlapping design.
 * Title, badge, and visual content area.
 * Outline-style borders that highlight on hover.
 */
export function WireframePreviewCard({
  title,
  badge,
  badgeVariant = 'default',
  children,
  className,
  overlap = true,
}: WireframePreviewCardProps) {
  return (
    <motion.div
      className={cn(
        'relative border rounded-[var(--wireframe-border-radius,12px)]',
        'bg-transparent', // Transparent fill
        'transition-all duration-150',
        'hover:border-[var(--wireframe-outline-hover-width,2px)] hover:border-[var(--wireframe-border-hover,var(--accent-color))]',
        'hover:shadow-[0_0_12px_rgba(var(--accent-color-rgb,0,0,0),var(--wireframe-glow-opacity,0.3))]',
        'grid-p-4',
        overlap && 'shadow-xl',
        className
      )}
      style={{
        borderWidth: 'var(--wireframe-outline-width, 1px)',
        borderColor: 'var(--wireframe-border-color, var(--border-color))',
        borderStyle: 'solid',
        ...(overlap && {
          transform: 'translate(8px, -8px)',
        }),
      }}
      whileHover={{ y: -4, scale: 1.02 }}
    >
      {/* Header with title and badge */}
      <div className="flex items-start justify-between grid-mb-3">
        <h3
          className="font-mono font-black text-xl uppercase"
          style={{ color: 'var(--text-main)' }}
        >
          {title}
        </h3>
        {badge && (
          <WireframeBadge variant={badgeVariant}>{badge}</WireframeBadge>
        )}
      </div>

      {/* Visual content area */}
      {children && (
        <div className="grid-mt-2">{children}</div>
      )}
    </motion.div>
  );
}
