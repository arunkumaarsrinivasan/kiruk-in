'use client';

import { motion } from 'framer-motion';

interface PixelCrosshairProps {
  x: number;
  y: number;
  pixelSize?: number;
}

export function PixelCrosshair({ x, y, pixelSize = 2 }: PixelCrosshairProps) {
  return (
    <motion.div
      className="fixed pointer-events-none z-50"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: 'translate(-50%, -50%)',
        width: pixelSize * 16,
        height: pixelSize * 16,
        imageRendering: 'pixelated' as any,
      }}
      animate={{
        scale: [1, 1.1, 1],
      }}
      transition={{
        duration: 0.5,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(16, ${pixelSize}px)`,
          gridTemplateRows: `repeat(16, ${pixelSize}px)`,
        }}
      >
        {Array.from({ length: 256 }).map((_, idx) => {
          const row = Math.floor(idx / 16);
          const col = idx % 16;
          const centerX = 7.5;
          const centerY = 7.5;
          
          // Draw crosshair pattern
          const isHorizontal = row >= 6 && row <= 9;
          const isVertical = col >= 6 && col <= 9;
          const isCenter = row >= 7 && row <= 8 && col >= 7 && col <= 8;
          const isOuter = (row === 0 || row === 15 || col === 0 || col === 15) && 
                         (row >= 6 && row <= 9 || col >= 6 && col <= 9);
          
          let color = 'transparent';
          if (isCenter) color = '#FF0000';
          else if (isHorizontal || isVertical) color = '#FFFFFF';
          else if (isOuter) color = '#FFFF00';
          
          return (
            <div
              key={idx}
              style={{
                width: pixelSize,
                height: pixelSize,
                backgroundColor: color,
              }}
            />
          );
        })}
      </div>
    </motion.div>
  );
}
