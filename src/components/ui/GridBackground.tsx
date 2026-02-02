'use client';

import { useEffect, useState } from 'react';

interface GridBackgroundProps {
  /**
   * Override opacity (takes precedence over CSS variable)
   */
  opacity?: number;
  scanlinesOpacity?: number;
  className?: string;
  style?: React.CSSProperties;
  /**
   * Optional offset to align grid with container padding
   */
  offsetX?: number;
  offsetY?: number;
  /**
   * Force show grid even if era doesn't have one
   */
  forceShow?: boolean;
}

/**
 * Reusable grid background component that uses era-specific CSS variables
 * Grid size and opacity adapt to the current design era
 * Grid is hidden for modern eras (2022+) that don't use grids
 */
export function GridBackground({
  opacity,
  scanlinesOpacity = 0.05,
  className = '',
  style = {},
  offsetX = 0,
  offsetY = 0,
  forceShow = false,
}: GridBackgroundProps) {
  const [hasGrid, setHasGrid] = useState(true);

  // Check if current era has a grid
  useEffect(() => {
    const checkGrid = () => {
      const hasGridValue = getComputedStyle(document.documentElement).getPropertyValue('--era-has-grid').trim();
      setHasGrid(hasGridValue === '1' || forceShow);
    };

    checkGrid();

    // Listen for theme changes via mutation observer on body data-era attribute
    const observer = new MutationObserver(checkGrid);
    observer.observe(document.body, { attributes: true, attributeFilter: ['data-era'] });

    return () => observer.disconnect();
  }, [forceShow]);

  // Don't render if era doesn't have a grid
  if (!hasGrid) return null;

  return (
    <>
      {/* Grid Background - Uses era-specific CSS variables */}
      <div
        className={`absolute inset-0 pointer-events-none ${className}`}
        style={{
          backgroundImage: `
            linear-gradient(var(--border-color) 1px, transparent 1px),
            linear-gradient(90deg, var(--border-color) 1px, transparent 1px)
          `,
          backgroundSize: `var(--era-grid-size, 20px) var(--era-grid-size, 20px)`,
          backgroundPosition: `${offsetX}px ${offsetY}px`,
          opacity: opacity ?? 'var(--era-grid-opacity, 0.3)',
          imageRendering: 'pixelated' as React.CSSProperties['imageRendering'],
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
