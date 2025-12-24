'use client';

import { motion } from 'framer-motion';

interface TrafficLightProps {
  isPlayerActive: boolean;
  idleTime: number;
}

export function TrafficLight({ isPlayerActive, idleTime }: TrafficLightProps) {
  // Green light = player active (safe, zombies frozen)
  // Red light = player idle (danger, zombies moving)
  
  const redIntensity = isPlayerActive ? 0.3 : Math.min(1, 0.5 + idleTime);
  const greenIntensity = isPlayerActive ? 1 : 0.3;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="text-xs font-mono text-yellow-400 mb-1">
        {isPlayerActive ? '🟢 GREEN LIGHT' : '🔴 RED LIGHT'}
      </div>
      <div className="relative w-16 h-32 border-4 border-gray-700 bg-black" style={{ imageRendering: 'pixelated' as any }}>
        {/* Red light */}
        <motion.div
          className="absolute top-2 left-1/2 transform -translate-x-1/2 w-10 h-10 rounded-full border-2 border-gray-600"
          style={{
            backgroundColor: `rgba(255, 0, 0, ${redIntensity})`,
            boxShadow: redIntensity > 0.5 ? `0 0 20px rgba(255, 0, 0, ${redIntensity})` : 'none',
          }}
          animate={{
            opacity: redIntensity,
            scale: isPlayerActive ? 0.8 : [1, 1.1, 1],
          }}
          transition={{
            duration: 0.5,
            repeat: isPlayerActive ? 0 : Infinity,
          }}
        />
        
        {/* Yellow light (warning) */}
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full border-2 border-gray-600"
          style={{
            backgroundColor: `rgba(255, 255, 0, ${isPlayerActive ? 0.3 : 0.6})`,
            boxShadow: !isPlayerActive ? `0 0 15px rgba(255, 255, 0, 0.6)` : 'none',
          }}
          animate={{
            opacity: isPlayerActive ? 0.3 : [0.6, 0.8, 0.6],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
          }}
        />
        
        {/* Green light */}
        <motion.div
          className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-10 h-10 rounded-full border-2 border-gray-600"
          style={{
            backgroundColor: `rgba(0, 255, 0, ${greenIntensity})`,
            boxShadow: greenIntensity > 0.5 ? `0 0 20px rgba(0, 255, 0, ${greenIntensity})` : 'none',
          }}
          animate={{
            opacity: greenIntensity,
            scale: isPlayerActive ? [1, 1.1, 1] : 0.8,
          }}
          transition={{
            duration: 0.5,
            repeat: isPlayerActive ? Infinity : 0,
          }}
        />
      </div>
      <div className="text-xs font-mono text-center">
        {isPlayerActive ? (
          <span className="text-green-400">ZOMBIES FROZEN</span>
        ) : (
          <motion.span
            className="text-red-400"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          >
            ZOMBIES MOVING!
            <br />
            <span className="text-xs">Type to freeze them!</span>
          </motion.span>
        )}
      </div>
    </div>
  );
}
