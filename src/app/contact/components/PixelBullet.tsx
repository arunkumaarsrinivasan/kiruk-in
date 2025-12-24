'use client';

import { motion } from 'framer-motion';
import { Bullet } from './useZombieGame';

interface PixelBulletProps {
  bullet: Bullet;
  pixelSize?: number;
}

export function PixelBullet({ bullet, pixelSize = 3 }: PixelBulletProps) {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        left: `${bullet.x}%`,
        top: `${bullet.y}%`,
        transform: 'translate(-50%, -50%)',
        width: pixelSize * 4,
        height: pixelSize * 4,
        imageRendering: 'pixelated' as any,
        zIndex: 15,
      }}
      initial={{ opacity: 1, scale: 1 }}
      animate={{ opacity: [1, 0.8, 1], scale: [1, 1.2, 1] }}
      transition={{ duration: 0.1, repeat: Infinity }}
    >
      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(4, ${pixelSize}px)`,
          gridTemplateRows: `repeat(4, ${pixelSize}px)`,
        }}
      >
        {/* Pixel bullet - yellow/orange square */}
        {Array.from({ length: 16 }).map((_, idx) => {
          const row = Math.floor(idx / 4);
          const col = idx % 4;
          // Create a small cross pattern
          const isCenter = (row === 1 || row === 2) && (col === 1 || col === 2);
          const color = isCenter ? '#FFD700' : '#FFA500';
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
