'use client';

import React from 'react';
import { GRID_SIZE, alignToGrid, alignSizeToGrid } from '@/lib/utils';

interface GridAlignedProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  /**
   * Grid multiplier for positioning (left/top)
   * e.g., x={2} means left: 40px (2 * 20px)
   */
  x?: number;
  y?: number;
  /**
   * Grid multiplier for sizing (width/height)
   * e.g., w={5} means width: 100px (5 * 20px)
   */
  w?: number;
  h?: number;
  /**
   * Grid multiplier for padding
   */
  p?: number;
  px?: number;
  py?: number;
  /**
   * Grid multiplier for margin
   */
  m?: number;
  mx?: number;
  my?: number;
  /**
   * Position type
   */
  position?: 'absolute' | 'fixed' | 'relative' | 'static';
}

/**
 * GridAligned component ensures all children align to the 20px grid
 * All positioning, sizing, and spacing values are multiples of 20px
 */
export function GridAligned({
  children,
  className = '',
  style = {},
  x,
  y,
  w,
  h,
  p,
  px,
  py,
  m,
  mx,
  my,
  position = 'relative',
}: GridAlignedProps) {
  const gridStyle: React.CSSProperties = {
    position,
    ...style,
  };

  // Apply grid-aligned positioning
  if (x !== undefined) {
    gridStyle.left = `${x * GRID_SIZE}px`;
  }
  if (y !== undefined) {
    gridStyle.top = `${y * GRID_SIZE}px`;
  }

  // Apply grid-aligned sizing
  if (w !== undefined) {
    gridStyle.width = `${w * GRID_SIZE}px`;
  }
  if (h !== undefined) {
    gridStyle.height = `${h * GRID_SIZE}px`;
  }

  // Apply grid-aligned padding
  if (p !== undefined) {
    gridStyle.padding = `${p * GRID_SIZE}px`;
  } else {
    if (px !== undefined) {
      gridStyle.paddingLeft = `${px * GRID_SIZE}px`;
      gridStyle.paddingRight = `${px * GRID_SIZE}px`;
    }
    if (py !== undefined) {
      gridStyle.paddingTop = `${py * GRID_SIZE}px`;
      gridStyle.paddingBottom = `${py * GRID_SIZE}px`;
    }
  }

  // Apply grid-aligned margin
  if (m !== undefined) {
    gridStyle.margin = `${m * GRID_SIZE}px`;
  } else {
    if (mx !== undefined) {
      gridStyle.marginLeft = `${mx * GRID_SIZE}px`;
      gridStyle.marginRight = `${mx * GRID_SIZE}px`;
    }
    if (my !== undefined) {
      gridStyle.marginTop = `${my * GRID_SIZE}px`;
      gridStyle.marginBottom = `${my * GRID_SIZE}px`;
    }
  }

  // If style has positioning values, align them to grid
  if (style.left !== undefined && typeof style.left === 'number') {
    gridStyle.left = `${alignToGrid(style.left)}px`;
  }
  if (style.top !== undefined && typeof style.top === 'number') {
    gridStyle.top = `${alignToGrid(style.top)}px`;
  }
  if (style.width !== undefined && typeof style.width === 'number') {
    gridStyle.width = `${alignSizeToGrid(style.width)}px`;
  }
  if (style.height !== undefined && typeof style.height === 'number') {
    gridStyle.height = `${alignSizeToGrid(style.height)}px`;
  }

  return (
    <div className={className} style={gridStyle}>
      {children}
    </div>
  );
}
