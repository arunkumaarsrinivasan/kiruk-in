'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HalfBodyCharacter } from './HalfBodyCharacter';
import { useMousePosition } from '@/hooks/useMousePosition';
import {
  getCharacterBySectionId,
  defaultCharacter,
  SectionCharacterConfig,
} from '@/data/section-characters';

interface SectionCharacterProps {
  sectionId: string;
  className?: string;
  // Override character config if needed
  customConfig?: Partial<SectionCharacterConfig>;
  // Animation delay for entrance
  animationDelay?: number;
  // Whether to show the character
  isVisible?: boolean;
  // Positioning mode
  position?: 'center' | 'bottom-right';
}

/**
 * Section Character Component
 * Positions a half-body 8-bit character at the bottom center (or fixed right) of a section
 * with mouse-following head rotation and blinking animation
 */
export function SectionCharacter({
  sectionId,
  className = '',
  customConfig,
  animationDelay = 0,
  isVisible = true,
  position = 'center',
}: SectionCharacterProps) {
  const characterRef = useRef<HTMLDivElement>(null);
  const [isBlinking, setIsBlinking] = useState(false);
  const [isClient, setIsClient] = useState(false);

  const isFixed = position === 'bottom-right';

  // Ensure we're on the client side before animating
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Get character config for this section
  const baseConfig = getCharacterBySectionId(sectionId) || defaultCharacter;
  const config: SectionCharacterConfig = {
    ...baseConfig,
    ...customConfig,
  };

  // Mouse tracking for head rotation
  const { headRotation, eyeOffset } = useMousePosition(characterRef, {
    maxRotation: 25,
    maxEyeOffset: 4,
    smoothing: 0.12,
    enabled: isVisible,
  });

  // Blink animation
  const startBlink = useCallback(() => {
    setIsBlinking(true);
    setTimeout(() => setIsBlinking(false), 150);
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const blinkRate = config.personality.blinkRate || 3000;
    // Add some randomness to blink timing
    const getNextBlinkTime = () => blinkRate + Math.random() * 1000 - 500;

    let blinkTimeout: NodeJS.Timeout;

    const scheduleBlink = () => {
      blinkTimeout = setTimeout(() => {
        startBlink();
        scheduleBlink();
      }, getNextBlinkTime());
    };

    // Start blinking after initial delay
    const initialDelay = setTimeout(() => {
      scheduleBlink();
    }, 1000);

    return () => {
      clearTimeout(initialDelay);
      clearTimeout(blinkTimeout);
    };
  }, [isVisible, config.personality.blinkRate, startBlink]);

  // Idle animation based on personality
  const getIdleAnimation = () => {
    switch (config.personality.idleAnimation) {
      case 'breathing':
        return {
          y: [0, -3, 0],
        };
      case 'nodding':
        return {
          rotate: [0, 2, 0, -2, 0],
        };
      case 'waving':
        return {
          rotate: [0, 3, -3, 0],
        };
      default:
        return {};
    }
  };

  const idleAnim = getIdleAnimation();
  const hasIdleYAnimation = idleAnim.y !== undefined && Array.isArray(idleAnim.y);

  // Position styles
  const positionStyles = isFixed ? {
    position: 'fixed' as const,
    bottom: 0,
    right: '2vw',
    width: '15vw', // Slightly smaller for fixed position
    maxWidth: '180px',
    minWidth: '100px',
    pointerEvents: 'none' as const,
    zIndex: 50,
  } : {
    position: 'absolute' as const,
    bottom: 0,
    left: '50%',
    width: '18vw',
    maxWidth: '220px',
    minWidth: '120px',
    pointerEvents: 'none' as const,
    zIndex: 30,
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          ref={characterRef}
          className={`section-character-container ${className}`}
          initial={{ 
            opacity: isClient ? 0 : 1, 
            y: isClient ? 50 : 0, 
            scale: isClient ? 0.9 : 1, 
            x: isFixed ? 0 : '-50%' 
          }}
          animate={{ 
            opacity: 1, 
            y: idleAnim.y !== undefined ? idleAnim.y : 0,
            scale: 1,
            x: isFixed ? 0 : '-50%',
            rotate: idleAnim.rotate !== undefined ? idleAnim.rotate : 0,
          }}
          exit={{ 
            opacity: 0, 
            y: 30, 
            scale: 0.95, 
            x: isFixed ? 0 : '-50%' 
          }}
          transition={{
            opacity: { duration: isClient ? 0.4 : 0, delay: isClient ? animationDelay : 0 },
            y: hasIdleYAnimation ? {
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: isClient ? (animationDelay + 0.5) : 0,
            } : { duration: isClient ? 0.5 : 0, delay: isClient ? animationDelay : 0, ease: 'easeOut' },
            scale: { duration: isClient ? 0.4 : 0, delay: isClient ? animationDelay : 0 },
            rotate: idleAnim.rotate ? {
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: isClient ? (animationDelay + 0.5) : 0,
            } : undefined,
            x: { duration: 0 },
          }}
          style={positionStyles}
        >
          {/* Glow effect background */}
          {config.glowColor && (
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background: `radial-gradient(ellipse at center bottom, ${config.glowColor} 0%, transparent 70%)`,
                filter: 'blur(20px)',
                transform: 'translateY(20%)',
              }}
              animate={{
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          )}

          {/* Character SVG */}
          <div 
            className="relative w-full" 
            style={{ 
              aspectRatio: '200/280',
              minHeight: '100px',
              height: '100%'
            }}
          >
            <HalfBodyCharacter
              config={config}
              headRotation={headRotation}
              eyeOffset={eyeOffset}
              isBlinking={isBlinking}
            />
          </div>

          {/* Particle effects */}
          {config.particles && config.particles !== 'none' && (
            <ParticleEffect type={config.particles} />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Particle effects component
interface ParticleEffectProps {
  type: 'sparkles' | 'code' | 'paint';
}

function ParticleEffect({ type }: ParticleEffectProps) {
  const particles = Array.from({ length: 8 }, (_, i) => i);

  const getParticleStyle = (index: number) => {
    const baseDelay = index * 0.3;
    const xOffset = (index % 2 === 0 ? -1 : 1) * (20 + Math.random() * 40);

    switch (type) {
      case 'sparkles':
        return {
          content: '✨',
          x: xOffset,
          y: -(20 + index * 15),
          delay: baseDelay,
        };
      case 'code': {
        const codeChars = ['0', '1', '<', '>', '/', '{', '}', ';'];
        return {
          content: codeChars[index % codeChars.length],
          x: xOffset,
          y: -(15 + index * 12),
          delay: baseDelay,
          color: '#4FC3F7',
        };
      }
      case 'paint': {
        const colors = ['#E91E63', '#9C27B0', '#2196F3', '#4CAF50', '#FF9800'];
        return {
          content: '●',
          x: xOffset,
          y: -(10 + index * 10),
          delay: baseDelay,
          color: colors[index % colors.length],
        };
      }
      default:
        return { content: '', x: 0, y: 0, delay: 0 };
    }
  };

  return (
    <div className="absolute inset-0 overflow-visible pointer-events-none">
      {particles.map((i) => {
        const style = getParticleStyle(i);
        return (
          <motion.span
            key={i}
            className="absolute text-sm font-mono"
            style={{
              left: '50%',
              bottom: '70%',
              color: style.color || 'inherit',
            }}
            initial={{ opacity: 0, x: 0, y: 0 }}
            animate={{
              opacity: [0, 1, 0],
              x: style.x,
              y: style.y,
            }}
            transition={{
              duration: 2,
              delay: style.delay,
              repeat: Infinity,
              repeatDelay: 1,
              ease: 'easeOut',
            }}
          >
            {style.content}
          </motion.span>
        );
      })}
    </div>
  );
}

export default SectionCharacter;
