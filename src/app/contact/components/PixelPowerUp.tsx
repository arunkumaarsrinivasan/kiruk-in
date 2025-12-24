'use client';

import { motion } from 'framer-motion';
import { PowerUp } from './useZombieGame';

interface PixelPowerUpProps {
  powerUp: PowerUp;
  pixelSize?: number;
}

const powerUpSprites: Record<PowerUp['type'], { color: string; icon: string }> = {
  time: { color: '#00FF00', icon: '⏰' },
  field: { color: '#00BFFF', icon: '📝' },
  ammo: { color: '#FFD700', icon: '🔫' },
};

export function PixelPowerUp({ powerUp, pixelSize = 4 }: PixelPowerUpProps) {
  const sprite = powerUpSprites[powerUp.type];
  const size = 16;

  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        left: `${powerUp.x}%`,
        top: `${powerUp.y}%`,
        transform: 'translate(-50%, -50%)',
        width: size * pixelSize,
        height: size * pixelSize,
        imageRendering: 'pixelated' as any,
        zIndex: 12,
      }}
      animate={{
        y: [0, -5, 0],
        scale: [1, 1.1, 1],
        opacity: [1, 0.8, 1],
      }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      <div
        className="grid border-2"
        style={{
          gridTemplateColumns: `repeat(${size}, ${pixelSize}px)`,
          gridTemplateRows: `repeat(${size}, ${pixelSize}px)`,
          borderColor: sprite.color,
          backgroundColor: `${sprite.color}20`,
        }}
      >
        {/* Create a simple pixel pattern */}
        {Array.from({ length: size * size }).map((_, idx) => {
          const row = Math.floor(idx / size);
          const col = idx % size;
          const centerX = size / 2;
          const centerY = size / 2;
          const distance = Math.sqrt((row - centerY) ** 2 + (col - centerX) ** 2);
          const isBorder = distance < 3 && distance > 2;
          const isCenter = distance < 2;
          const color = isCenter ? sprite.color : isBorder ? sprite.color : 'transparent';
          
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
      {/* Icon overlay */}
      <div
        className="absolute inset-0 flex items-center justify-center text-lg"
        style={{ color: sprite.color }}
      >
        {sprite.icon}
      </div>
    </motion.div>
  );
}
