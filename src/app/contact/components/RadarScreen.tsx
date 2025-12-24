'use client';

import { motion } from 'framer-motion';
import { Zombie } from './useZombieGame';

interface RadarScreenProps {
  zombies: Zombie[];
  width?: number;
  height?: number;
}

export function RadarScreen({ zombies, width = 400, height = 400 }: RadarScreenProps) {
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 2 - 20;

  // Convert zombie positions (0-100%) to radar coordinates
  const getRadarPosition = (zombie: Zombie) => {
    // Convert percentage to radar coordinates (center is 50%, 50%)
    const x = centerX + ((zombie.x - 50) / 50) * radius;
    const y = centerY + ((zombie.y - 50) / 50) * radius;
    return { x, y };
  };

  return (
    <div
      className="relative border-4 border-green-500 bg-black"
      style={{
        width,
        height,
        boxShadow: 'inset 0 0 20px #00ff00, 0 0 20px #00ff00',
        imageRendering: 'pixelated' as any,
      }}
    >
      {/* Radar sweep line */}
      <motion.div
        className="absolute origin-center"
        style={{
          left: centerX,
          top: centerY,
          width: 2,
          height: radius,
          backgroundColor: '#00ff00',
          opacity: 0.6,
          transformOrigin: 'top center',
        }}
        animate={{
          rotate: [0, 360],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      {/* Radar grid circles */}
      {[1, 2, 3].map((ring) => (
        <div
          key={ring}
          className="absolute border border-green-500 rounded-full"
          style={{
            left: centerX - (radius * ring) / 3,
            top: centerY - (radius * ring) / 3,
            width: (radius * ring * 2) / 3,
            height: (radius * ring * 2) / 3,
            opacity: 0.3,
          }}
        />
      ))}

      {/* Radar grid lines */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
        <div
          key={angle}
          className="absolute origin-top"
          style={{
            left: centerX,
            top: centerY,
            width: 2,
            height: radius,
            backgroundColor: '#00ff00',
            opacity: 0.2,
            transform: `rotate(${angle}deg)`,
            transformOrigin: 'top center',
          }}
        />
      ))}

      {/* Center dot */}
      <div
        className="absolute rounded-full bg-green-500"
        style={{
          left: centerX - 3,
          top: centerY - 3,
          width: 6,
          height: 6,
          boxShadow: '0 0 10px #00ff00',
        }}
      />

      {/* Zombie blips */}
      {zombies
        .filter((z) => !z.isDead)
        .map((zombie) => {
          const pos = getRadarPosition(zombie);
          const distance = Math.sqrt((zombie.x - 50) ** 2 + (zombie.y - 50) ** 2);
          const isClose = distance < 20; // Within 20% of center
          const blipSize = zombie.type === 'boss' ? 8 : zombie.type === 'runner' ? 6 : 4;
          const blipColor = isClose ? '#ff0000' : zombie.type === 'boss' ? '#ff8800' : '#ffff00';

          return (
            <motion.div
              key={zombie.id}
              className="absolute rounded-full"
              style={{
                left: pos.x - blipSize / 2,
                top: pos.y - blipSize / 2,
                width: blipSize,
                height: blipSize,
                backgroundColor: blipColor,
                boxShadow: `0 0 ${blipSize}px ${blipColor}`,
                zIndex: 10,
              }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.8, 1, 0.8],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          );
        })}

      {/* Radar label */}
      <div
        className="absolute bottom-2 left-2 font-mono text-xs text-green-500"
        style={{ textShadow: '0 0 5px #00ff00' }}
      >
        RADAR
      </div>
      <div
        className="absolute top-2 right-2 font-mono text-xs text-green-500"
        style={{ textShadow: '0 0 5px #00ff00' }}
      >
        {zombies.filter((z) => !z.isDead).length} CONTACTS
      </div>
    </div>
  );
}
