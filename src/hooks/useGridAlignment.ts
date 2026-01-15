import { useMemo } from 'react';
import { alignToGrid, alignSizeToGrid, alignSpacingToGrid } from '@/lib/utils';

/**
 * Hook to align style properties to the grid
 * Automatically aligns positioning, sizing, and spacing values to 20px grid
 */
export function useGridAlignment<T extends Record<string, any>>(styles: T): T {
  return useMemo(() => {
    const aligned: any = { ...styles };

    // Align positioning values
    if (typeof aligned.left === 'number') {
      aligned.left = alignToGrid(aligned.left);
    }
    if (typeof aligned.top === 'number') {
      aligned.top = alignToGrid(aligned.top);
    }
    if (typeof aligned.right === 'number') {
      aligned.right = alignToGrid(aligned.right);
    }
    if (typeof aligned.bottom === 'number') {
      aligned.bottom = alignToGrid(aligned.bottom);
    }

    // Align sizing values (round up to ensure content fits)
    if (typeof aligned.width === 'number') {
      aligned.width = alignSizeToGrid(aligned.width);
    }
    if (typeof aligned.height === 'number') {
      aligned.height = alignSizeToGrid(aligned.height);
    }
    if (typeof aligned.minWidth === 'number') {
      aligned.minWidth = alignSizeToGrid(aligned.minWidth);
    }
    if (typeof aligned.minHeight === 'number') {
      aligned.minHeight = alignSizeToGrid(aligned.minHeight);
    }
    if (typeof aligned.maxWidth === 'number') {
      aligned.maxWidth = alignSizeToGrid(aligned.maxWidth);
    }
    if (typeof aligned.maxHeight === 'number') {
      aligned.maxHeight = alignSizeToGrid(aligned.maxHeight);
    }

    // Align spacing values
    if (typeof aligned.padding === 'number') {
      aligned.padding = alignSpacingToGrid(aligned.padding);
    }
    if (typeof aligned.margin === 'number') {
      aligned.margin = alignSpacingToGrid(aligned.margin);
    }
    if (typeof aligned.paddingLeft === 'number') {
      aligned.paddingLeft = alignSpacingToGrid(aligned.paddingLeft);
    }
    if (typeof aligned.paddingRight === 'number') {
      aligned.paddingRight = alignSpacingToGrid(aligned.paddingRight);
    }
    if (typeof aligned.paddingTop === 'number') {
      aligned.paddingTop = alignSpacingToGrid(aligned.paddingTop);
    }
    if (typeof aligned.paddingBottom === 'number') {
      aligned.paddingBottom = alignSpacingToGrid(aligned.paddingBottom);
    }
    if (typeof aligned.marginLeft === 'number') {
      aligned.marginLeft = alignSpacingToGrid(aligned.marginLeft);
    }
    if (typeof aligned.marginRight === 'number') {
      aligned.marginRight = alignSpacingToGrid(aligned.marginRight);
    }
    if (typeof aligned.marginTop === 'number') {
      aligned.marginTop = alignSpacingToGrid(aligned.marginTop);
    }
    if (typeof aligned.marginBottom === 'number') {
      aligned.marginBottom = alignSpacingToGrid(aligned.marginBottom);
    }

    // Align gap values
    if (typeof aligned.gap === 'number') {
      aligned.gap = alignSpacingToGrid(aligned.gap);
    }

    return aligned as T;
  }, [styles]);
}

/**
 * Helper to create grid-aligned style objects
 */
export function gridStyle(styles: Record<string, any>): React.CSSProperties {
  const aligned: any = {};

  Object.entries(styles).forEach(([key, value]) => {
    if (typeof value === 'number') {
      if (['left', 'top', 'right', 'bottom'].includes(key)) {
        aligned[key] = `${alignToGrid(value)}px`;
      } else if (['width', 'height', 'minWidth', 'minHeight', 'maxWidth', 'maxHeight'].includes(key)) {
        aligned[key] = `${alignSizeToGrid(value)}px`;
      } else if (key.includes('padding') || key.includes('margin') || key === 'gap') {
        aligned[key] = `${alignSpacingToGrid(value)}px`;
      } else {
        aligned[key] = value;
      }
    } else {
      aligned[key] = value;
    }
  });

  return aligned;
}
