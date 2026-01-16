'use client';

import React from 'react';
import { GridBackground } from '@/components/ui/GridBackground';

interface SiteShellProps {
  readonly children: React.ReactNode;
}

/**
 * SiteShell Component
 * 
 * Adds wireframe outline layer on top of existing pixel/grid background.
 * Uses a layered approach:
 * 1. Base: Existing GridBackground (pixel/grid pattern)
 * 2. Overlay: Wireframe outline container (thin border, transparent fill)
 * 3. Diagonal stripe texture overlay (very subtle)
 */
export default function SiteShell({ children }: SiteShellProps) {
  return (
    <div className="relative min-h-screen w-full">
      {/* Base Layer: Existing pixel/grid background - PRESERVED */}
      <GridBackground 
        opacity={0.15} 
        scanlinesOpacity={0.03}
        offsetX={0}
        offsetY={0}
      />

      {/* Wireframe Outline Container Layer */}
      <div 
        className="relative mx-auto w-full"
        style={{
          maxWidth: 'var(--wireframe-max-width, 1280px)',
          padding: 'var(--grid-size, 20px)',
        }}
      >
        {/* Subtle diagonal stripe overlay */}
        <div
          className="pointer-events-none absolute inset-0 rounded-[var(--wireframe-border-radius,12px)]"
          style={{
            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0, 0, 0, 0.03) 10px, rgba(0, 0, 0, 0.03) 20px)',
            opacity: 'var(--wireframe-stripe-opacity, 0.03)',
            zIndex: 0,
          }}
        />

        {/* Main content container with outline border */}
        <div
          className="relative rounded-[var(--wireframe-border-radius,12px)]"
          style={{
            border: 'var(--wireframe-outline-width, 1px) solid var(--wireframe-border-color, var(--border-color))',
            backgroundColor: 'transparent', // Transparent fill so pixel/grid shows through
            boxShadow: 'var(--wireframe-shadow, 0 4px 6px -1px rgba(0, 0, 0, 0.05))',
            padding: 'var(--grid-size, 20px)',
            minHeight: 'calc(100vh - 40px)',
            zIndex: 1,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
