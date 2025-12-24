'use client';

import { motion } from 'framer-motion';
import { Zombie } from './useZombieGame';

interface PixelZombieProps {
  zombie: Zombie;
  pixelSize?: number;
}

// Pixel art zombie sprites
const zombieSprites: Record<Zombie['type'], { width: number; height: number; pixels: string[][] }> = {
  walker: {
    width: 12,
    height: 16,
    pixels: [
      ['', '', '', '#8B4513', '#8B4513', '#8B4513', '#8B4513', '', '', '', '', ''],
      ['', '', '#8B4513', '#654321', '#654321', '#654321', '#654321', '#8B4513', '', '', '', ''],
      ['', '#8B4513', '#654321', '#000000', '#FF0000', '#FF0000', '#000000', '#654321', '#8B4513', '', '', ''],
      ['', '#8B4513', '#654321', '#000000', '#FFFFFF', '#FFFFFF', '#000000', '#654321', '#8B4513', '', '', ''],
      ['', '#8B4513', '#654321', '#000000', '#FF0000', '#FF0000', '#000000', '#654321', '#8B4513', '', '', ''],
      ['', '', '#8B4513', '#654321', '#654321', '#654321', '#654321', '#8B4513', '', '', '', ''],
      ['', '', '#8B4513', '#8B4513', '#8B4513', '#8B4513', '#8B4513', '#8B4513', '', '', '', ''],
      ['', '', '', '#8B4513', '#228B22', '#228B22', '#8B4513', '', '', '', '', ''],
      ['', '', '#8B4513', '#228B22', '#228B22', '#228B22', '#228B22', '#8B4513', '', '', '', ''],
      ['', '#8B4513', '#228B22', '#228B22', '#228B22', '#228B22', '#228B22', '#228B22', '#8B4513', '', '', ''],
      ['', '#8B4513', '#228B22', '#228B22', '#228B22', '#228B22', '#228B22', '#228B22', '#8B4513', '', '', ''],
      ['', '', '#8B4513', '#654321', '#654321', '#654321', '#654321', '#8B4513', '', '', '', ''],
      ['', '', '', '#8B4513', '#654321', '#654321', '#8B4513', '', '', '', '', ''],
      ['', '', '', '', '#8B4513', '#8B4513', '', '', '', '', '', ''],
      ['', '', '', '', '#8B4513', '#8B4513', '', '', '', '', '', ''],
      ['', '', '', '', '#8B4513', '#8B4513', '', '', '', '', '', ''],
    ],
  },
  runner: {
    width: 10,
    height: 14,
    pixels: [
      ['', '', '#8B4513', '#8B4513', '#8B4513', '#8B4513', '', '', '', ''],
      ['', '#8B4513', '#654321', '#654321', '#654321', '#654321', '#8B4513', '', '', ''],
      ['#8B4513', '#654321', '#000000', '#FF0000', '#FF0000', '#000000', '#654321', '#8B4513', '', ''],
      ['#8B4513', '#654321', '#000000', '#FFFFFF', '#FFFFFF', '#000000', '#654321', '#8B4513', '', ''],
      ['#8B4513', '#654321', '#000000', '#FF0000', '#FF0000', '#000000', '#654321', '#8B4513', '', ''],
      ['', '#8B4513', '#654321', '#654321', '#654321', '#654321', '#8B4513', '', '', ''],
      ['', '', '#8B4513', '#8B4513', '#8B4513', '#8B4513', '', '', '', ''],
      ['', '', '', '#8B4513', '#228B22', '#8B4513', '', '', '', ''],
      ['', '', '#8B4513', '#228B22', '#228B22', '#228B22', '#8B4513', '', '', ''],
      ['', '#8B4513', '#228B22', '#228B22', '#228B22', '#228B22', '#8B4513', '', '', ''],
      ['', '#8B4513', '#228B22', '#228B22', '#228B22', '#228B22', '#8B4513', '', '', ''],
      ['', '', '#8B4513', '#654321', '#654321', '#8B4513', '', '', '', ''],
      ['', '', '', '#8B4513', '#8B4513', '', '', '', '', ''],
      ['', '', '', '#8B4513', '#8B4513', '', '', '', '', ''],
    ],
  },
  boss: {
    width: 16,
    height: 20,
    pixels: [
      ['', '', '', '', '#8B4513', '#8B4513', '#8B4513', '#8B4513', '#8B4513', '#8B4513', '', '', '', '', '', ''],
      ['', '', '', '#8B4513', '#654321', '#654321', '#654321', '#654321', '#654321', '#654321', '#8B4513', '', '', '', '', ''],
      ['', '', '#8B4513', '#654321', '#000000', '#FF0000', '#FF0000', '#FF0000', '#FF0000', '#000000', '#654321', '#8B4513', '', '', '', ''],
      ['', '#8B4513', '#654321', '#000000', '#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF', '#000000', '#654321', '#8B4513', '', '', ''],
      ['', '#8B4513', '#654321', '#000000', '#FF0000', '#FF0000', '#FF0000', '#FF0000', '#FF0000', '#FF0000', '#000000', '#654321', '#8B4513', '', '', ''],
      ['', '', '#8B4513', '#654321', '#654321', '#654321', '#654321', '#654321', '#654321', '#654321', '#654321', '#8B4513', '', '', '', ''],
      ['', '', '', '#8B4513', '#8B4513', '#8B4513', '#8B4513', '#8B4513', '#8B4513', '#8B4513', '#8B4513', '', '', '', '', ''],
      ['', '', '', '', '#8B4513', '#228B22', '#228B22', '#228B22', '#228B22', '#8B4513', '', '', '', '', '', ''],
      ['', '', '', '#8B4513', '#228B22', '#228B22', '#228B22', '#228B22', '#228B22', '#228B22', '#8B4513', '', '', '', '', ''],
      ['', '', '#8B4513', '#228B22', '#228B22', '#228B22', '#228B22', '#228B22', '#228B22', '#228B22', '#228B22', '#8B4513', '', '', '', ''],
      ['', '#8B4513', '#228B22', '#228B22', '#228B22', '#228B22', '#228B22', '#228B22', '#228B22', '#228B22', '#228B22', '#228B22', '#8B4513', '', '', ''],
      ['', '#8B4513', '#228B22', '#228B22', '#228B22', '#228B22', '#228B22', '#228B22', '#228B22', '#228B22', '#228B22', '#228B22', '#8B4513', '', '', ''],
      ['', '', '#8B4513', '#654321', '#654321', '#654321', '#654321', '#654321', '#654321', '#654321', '#654321', '#8B4513', '', '', '', ''],
      ['', '', '', '#8B4513', '#654321', '#654321', '#654321', '#654321', '#654321', '#654321', '#8B4513', '', '', '', '', ''],
      ['', '', '', '', '#8B4513', '#654321', '#654321', '#654321', '#654321', '#8B4513', '', '', '', '', '', ''],
      ['', '', '', '', '', '#8B4513', '#8B4513', '#8B4513', '#8B4513', '', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '#8B4513', '#8B4513', '#8B4513', '#8B4513', '', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '#8B4513', '#8B4513', '#8B4513', '#8B4513', '', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '#8B4513', '#8B4513', '#8B4513', '#8B4513', '', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '#8B4513', '#8B4513', '#8B4513', '#8B4513', '', '', '', '', '', '', '', ''],
    ],
  },
};

export function PixelZombie({ zombie, pixelSize = 4 }: PixelZombieProps) {
  const sprite = zombieSprites[zombie.type];
  const size = zombie.size;
  const scale = size / (sprite.width * pixelSize);
  
  // Death animation
  if (zombie.isDead && zombie.deathAnimation !== undefined) {
    const deathProgress = zombie.deathAnimation;
    return (
      <motion.div
        className="absolute pointer-events-none"
        style={{
          left: `${zombie.x}%`,
          top: `${zombie.y}%`,
          transform: 'translate(-50%, -50%)',
          width: sprite.width * pixelSize * scale * (1 - deathProgress * 0.5),
          height: sprite.height * pixelSize * scale * (1 - deathProgress * 0.5),
          imageRendering: 'pixelated' as any,
          zIndex: 10,
          opacity: 1 - deathProgress,
        }}
        animate={{
          rotate: [0, 180, 360],
          scale: [1, 0.5, 0],
        }}
        transition={{
          duration: 0.5,
        }}
      >
        {/* Explosion effect */}
        <div
          className="absolute inset-0 grid"
          style={{
            gridTemplateColumns: `repeat(${sprite.width}, ${pixelSize * scale}px)`,
            gridTemplateRows: `repeat(${sprite.height}, ${pixelSize * scale}px)`,
          }}
        >
          {sprite.pixels.flat().map((color, idx) => {
            const explosionColor = deathProgress > 0.5 ? '#FFD700' : '#FF4500';
            return (
              <div
                key={idx}
                style={{
                  width: pixelSize * scale,
                  height: pixelSize * scale,
                  backgroundColor: color ? explosionColor : 'transparent',
                  opacity: deathProgress,
                }}
              />
            );
          })}
        </div>
      </motion.div>
    );
  }
  
  return (
    <motion.div
      className="absolute cursor-pointer"
      style={{
        left: `${zombie.x}%`,
        top: `${zombie.y}%`,
        transform: 'translate(-50%, -50%)',
        width: sprite.width * pixelSize * scale,
        height: sprite.height * pixelSize * scale,
        imageRendering: 'pixelated' as any,
        zIndex: 10,
      }}
      animate={{
        y: [0, -2, 0],
      }}
      transition={{
        duration: 0.5,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      whileHover={{
        scale: 1.1,
      }}
      whileTap={{
        scale: 0.9,
      }}
    >
      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${sprite.width}, ${pixelSize * scale}px)`,
          gridTemplateRows: `repeat(${sprite.height}, ${pixelSize * scale}px)`,
        }}
      >
        {sprite.pixels.flat().map((color, idx) => (
          <div
            key={idx}
            style={{
              width: pixelSize * scale,
              height: pixelSize * scale,
              backgroundColor: color || 'transparent',
            }}
          />
        ))}
      </div>
      
      {/* Health bar for boss zombies */}
      {zombie.type === 'boss' && zombie.health < 5 && (
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-12 h-1 border border-black bg-red-900">
          <motion.div
            className="h-full bg-red-500"
            initial={{ width: '100%' }}
            animate={{ width: `${(zombie.health / 5) * 100}%` }}
          />
        </div>
      )}
    </motion.div>
  );
}
