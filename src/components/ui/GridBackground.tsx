'use client';

import { GRID_SIZE } from '@/lib/utils';

interface GridBackgroundProps {
  opacity?: number;
  scanlinesOpacity?: number;
  className?: string;
  style?: React.CSSProperties;
  /**
   * Optional offset to align grid with container padding
   * When container has padding, grid should account for it
   */
  offsetX?: number;
  offsetY?: number;
}

/**
 * Reusable grid background component that matches the design system
 * Used across all pages for consistent pixelated grid styling
 * Grid starts at viewport (0,0) and aligns with container padding
 */
export function GridBackground({ 
  opacity = 0.3, 
  scanlinesOpacity = 0.05,
  className = '',
  style = {},
  offsetX = 0,
  offsetY = 0,
}: GridBackgroundProps) {
  return (
    <>
      {/* Grid Background - Starts at viewport (0,0), accounts for container padding offset */}
      <div 
        className={`absolute inset-0 pointer-events-none ${className}`}
        style={{
          backgroundImage: `
            linear-gradient(var(--border-color) 1px, transparent 1px),
            linear-gradient(90deg, var(--border-color) 1px, transparent 1px)
          `,
          backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
          backgroundPosition: `${offsetX}px ${offsetY}px`,
          opacity,
          imageRendering: 'pixelated' as any,
          ...style,
        }}
      />
      
      {/* Scanlines effect for retro pixel feel */}
      <div 
        className={`absolute inset-0 pointer-events-none ${className}`}
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)",
          opacity: scanlinesOpacity,
          ...style,
        }}
      />
    </>
  );
}
