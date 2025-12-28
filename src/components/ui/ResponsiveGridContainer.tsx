'use client';

import React from 'react';
import { useResponsiveGrid } from '@/hooks/useResponsiveGrid';
import { GridBackground } from './GridBackground';

interface ResponsiveGridContainerProps {
  children: React.ReactNode;
  className?: string;
  gridOpacity?: number;
  scanlinesOpacity?: number;
}

/**
 * Container component that ensures perfect grid alignment
 * Calculates responsive padding and aligns grid background accordingly
 */
export function ResponsiveGridContainer({
  children,
  className = '',
  gridOpacity = 0.3,
  scanlinesOpacity = 0.05,
}: ResponsiveGridContainerProps) {
  const { containerPaddingX, containerPaddingY, maxContentWidth } = useResponsiveGrid();

  return (
    <div
      className={`min-h-screen bg-[var(--bg-main)] relative ${className}`}
      style={{
        paddingLeft: `${containerPaddingX}px`,
        paddingRight: `${containerPaddingX}px`,
        paddingTop: `${containerPaddingY}px`,
        paddingBottom: `${containerPaddingY}px`,
      }}
    >
      {/* Grid Background - aligned to viewport, not container */}
      <GridBackground opacity={gridOpacity} scanlinesOpacity={scanlinesOpacity} />

      {/* Content Container - grid-aligned max width */}
      <div
        className="mx-auto relative z-10"
        style={{
          maxWidth: `${maxContentWidth}px`,
        }}
      >
        {children}
      </div>
    </div>
  );
}
