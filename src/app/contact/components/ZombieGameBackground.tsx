'use client';

import { motion } from 'framer-motion';

interface ZombieGameBackgroundProps {
  children?: React.ReactNode;
}

export function ZombieGameBackground({ children }: ZombieGameBackgroundProps) {
  // Create prominent pixel grid pattern
  const pixelSize = 20; // pixels

  return (
    <div className="relative w-full h-full min-h-screen overflow-hidden" style={{ backgroundColor: '#0a0a0a' }}>
      {/* Pixel grid background */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `
            linear-gradient(#333 1px, transparent 1px),
            linear-gradient(90deg, #333 1px, transparent 1px)
          `,
          backgroundSize: `${pixelSize}px ${pixelSize}px`,
          imageRendering: 'pixelated' as any,
        }}
      />
      
      {/* Animated grid pulse */}
      <motion.div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(#444 1px, transparent 1px),
            linear-gradient(90deg, #444 1px, transparent 1px)
          `,
          backgroundSize: `${pixelSize}px ${pixelSize}px`,
          imageRendering: 'pixelated' as any,
        }}
        animate={{
          opacity: [0.1, 0.3, 0.1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      {/* Animated blood splatter effect */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="bloodPattern" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
              <circle cx="5" cy="5" r="0.5" fill="#8B0000" opacity="0.3" />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#bloodPattern)" />
        </svg>
      </motion.div>
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
