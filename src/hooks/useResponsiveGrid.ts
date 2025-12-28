'use client';

import { useState, useEffect } from 'react';
import { GRID_SIZE, alignToGrid } from '@/lib/utils';

interface GridAlignment {
  containerPaddingX: number;
  containerPaddingY: number;
  gridOffsetX: number;
  gridOffsetY: number;
  maxContentWidth: number;
}

/**
 * Hook to calculate responsive grid alignment based on screen dimensions
 * Ensures grid background and container padding align perfectly
 */
export function useResponsiveGrid(): GridAlignment {
  const [alignment, setAlignment] = useState<GridAlignment>({
    containerPaddingX: 20,
    containerPaddingY: 40,
    gridOffsetX: 0,
    gridOffsetY: 0,
    maxContentWidth: 1280,
  });

  useEffect(() => {
    const calculateAlignment = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      // Calculate grid-aligned padding based on screen size
      // Mobile: 1 grid unit (20px), Tablet: 2 grid units (40px), Desktop: 2-3 grid units (40-60px)
      let paddingX: number;
      if (width < 640) {
        paddingX = GRID_SIZE * 1; // 20px on mobile
      } else if (width < 1024) {
        paddingX = GRID_SIZE * 2; // 40px on tablet
      } else {
        paddingX = GRID_SIZE * 2; // 40px on desktop
      }

      // Vertical padding: 2 grid units (40px) on all sizes
      const paddingY = GRID_SIZE * 2; // 40px

      // Calculate grid offset to align with padding
      // Grid should start at the edge of the viewport, but content should align with grid
      const gridOffsetX = 0; // Grid starts at viewport edge
      const gridOffsetY = 0; // Grid starts at viewport edge

      // Calculate max content width (grid-aligned)
      // Content width = viewport width - (padding * 2), then align to grid
      let contentWidth: number;
      if (width < 640) {
        contentWidth = width - (paddingX * 2); // Full width minus padding
      } else if (width < 1024) {
        // Tablet: use 768px max, but align to grid
        const maxContainerWidth = 768;
        contentWidth = Math.min(maxContainerWidth, width) - (paddingX * 2);
      } else {
        // Desktop: use 1280px max, but align to grid
        const maxContainerWidth = 1280;
        contentWidth = Math.min(maxContainerWidth, width) - (paddingX * 2);
      }
      
      // Align content width to grid (round down to ensure it fits)
      contentWidth = Math.floor(contentWidth / GRID_SIZE) * GRID_SIZE;

      setAlignment({
        containerPaddingX: paddingX,
        containerPaddingY: paddingY,
        gridOffsetX,
        gridOffsetY,
        maxContentWidth: contentWidth,
      });
    };

    calculateAlignment();
    window.addEventListener('resize', calculateAlignment);

    return () => window.removeEventListener('resize', calculateAlignment);
  }, []);

  return alignment;
}
