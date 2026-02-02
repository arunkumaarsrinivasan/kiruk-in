'use client';

/**
 * Co-Designer Character Component
 * 
 * An animated pixel art human face with expressions.
 * Shows different emotions through facial feature changes.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export type CharacterEmotion = 'neutral' | 'excited' | 'thinking' | 'celebrating' | 'guiding';

interface CoDesignerCharacterProps {
  emotion?: CharacterEmotion;
  size?: number;
  className?: string;
}

export function CoDesignerCharacter({ 
  emotion = 'neutral', 
  size = 48,
  className 
}: CoDesignerCharacterProps) {
  
  const faceSize = size;
  const eyeSize = size * 0.15;
  const eyeOffset = size * 0.2;
  
  // Face expression variants
  const getFaceVariant = (): any => {
    switch (emotion) {
      case 'excited':
        return {
          rotate: [0, -2, 2, 0],
          transition: { duration: 0.6, repeat: Infinity, repeatType: 'reverse' }
        };
      case 'thinking':
        return {
          rotate: [0, -3, 0],
          transition: { duration: 2.5, repeat: Infinity }
        };
      case 'celebrating':
        return {
          scale: [1, 1.05, 1],
          transition: { duration: 0.3, repeat: 2 }
        };
      case 'guiding':
        return {
          x: [0, 2, 0],
          transition: { duration: 1.8, repeat: Infinity }
        };
      default:
        return {};
    }
  };

  // Eye animations
  const getEyeAnimation = (): any => {
    if (emotion === 'excited') {
      return {
        scaleY: [1, 0.3, 1],
        transition: { duration: 0.3, repeat: Infinity, repeatDelay: 2 }
      };
    }
    if (emotion === 'thinking') {
      return {
        x: [-1, 1, -1],
        transition: { duration: 2, repeat: Infinity }
      };
    }
    return {};
  };

  // Mouth shapes based on emotion
  const getMouthPath = () => {
    const centerX = faceSize / 2;
    const mouthY = faceSize * 0.65;
    const mouthWidth = faceSize * 0.35;

    switch (emotion) {
      case 'excited':
      case 'celebrating':
        // Big smile
        return `M ${centerX - mouthWidth} ${mouthY} Q ${centerX} ${mouthY + mouthWidth * 0.8} ${centerX + mouthWidth} ${mouthY}`;
      case 'thinking':
        // Neutral/slight frown
        return `M ${centerX - mouthWidth * 0.6} ${mouthY} L ${centerX + mouthWidth * 0.6} ${mouthY}`;
      case 'guiding':
        // Gentle smile
        return `M ${centerX - mouthWidth * 0.8} ${mouthY} Q ${centerX} ${mouthY + mouthWidth * 0.4} ${centerX + mouthWidth * 0.8} ${mouthY}`;
      default:
        // Neutral smile
        return `M ${centerX - mouthWidth * 0.7} ${mouthY} Q ${centerX} ${mouthY + mouthWidth * 0.3} ${centerX + mouthWidth * 0.7} ${mouthY}`;
    }
  };

  return (
    <motion.div
      className={cn('relative inline-block', className)}
      style={{ width: faceSize, height: faceSize }}
      animate={getFaceVariant()}
    >
      <svg
        width={faceSize}
        height={faceSize}
        viewBox={`0 0 ${faceSize} ${faceSize}`}
        style={{ imageRendering: 'auto' }}
      >
        {/* Face outline */}
        <circle
          cx={faceSize / 2}
          cy={faceSize / 2}
          r={faceSize / 2 - 2}
          fill="var(--accent-color)"
          opacity="0.15"
          stroke="var(--accent-color)"
          strokeWidth="2"
        />

        {/* Eyes */}
        <motion.g animate={getEyeAnimation()}>
          {/* Left eye */}
          <motion.circle
            cx={faceSize / 2 - eyeOffset}
            cy={faceSize / 2 - eyeOffset * 0.4}
            r={eyeSize}
            fill="var(--accent-color)"
            animate={emotion === 'excited' ? { scaleY: [1, 0.2, 1] } : {}}
            transition={emotion === 'excited' ? { duration: 0.2, repeat: Infinity, repeatDelay: 2.5 } : {}}
          />
          
          {/* Right eye */}
          <motion.circle
            cx={faceSize / 2 + eyeOffset}
            cy={faceSize / 2 - eyeOffset * 0.4}
            r={eyeSize}
            fill="var(--accent-color)"
            animate={emotion === 'excited' ? { scaleY: [1, 0.2, 1] } : {}}
            transition={emotion === 'excited' ? { duration: 0.2, repeat: Infinity, repeatDelay: 2.5 } : {}}
          />
        </motion.g>

        {/* Eyebrows (for thinking) */}
        {emotion === 'thinking' && (
          <g opacity="0.8">
            <motion.line
              x1={faceSize / 2 - eyeOffset - eyeSize}
              y1={faceSize / 2 - eyeOffset * 0.8}
              x2={faceSize / 2 - eyeOffset + eyeSize}
              y2={faceSize / 2 - eyeOffset * 1.2}
              stroke="var(--accent-color)"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <motion.line
              x1={faceSize / 2 + eyeOffset - eyeSize}
              y1={faceSize / 2 - eyeOffset * 1.2}
              x2={faceSize / 2 + eyeOffset + eyeSize}
              y2={faceSize / 2 - eyeOffset * 0.8}
              stroke="var(--accent-color)"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </g>
        )}

        {/* Mouth */}
        <motion.path
          d={getMouthPath()}
          fill="none"
          stroke="var(--accent-color)"
          strokeWidth="2.5"
          strokeLinecap="round"
          animate={emotion === 'celebrating' ? {
            strokeWidth: [2.5, 3.5, 2.5]
          } : {}}
          transition={{ duration: 0.3, repeat: emotion === 'celebrating' ? 3 : 0 }}
        />
      </svg>

      {/* Sparkles for celebrating */}
      {emotion === 'celebrating' && (
        <>
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-[var(--accent-color)]"
              style={{
                top: `${25 + i * 20}%`,
                left: i % 2 === 0 ? '-8%' : '108%',
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, 0.8, 0],
                scale: [0, 1, 0],
                x: [0, (i % 2 === 0 ? -6 : 6)],
                y: [0, -8],
              }}
              transition={{
                duration: 0.5,
                delay: i * 0.15,
                repeat: 1,
              }}
            />
          ))}
        </>
      )}

      {/* Point indicator for guiding */}
      {emotion === 'guiding' && (
        <motion.div
          className="absolute top-1/2 -translate-y-1/2"
          style={{ left: '105%' }}
          initial={{ opacity: 0, x: 0 }}
          animate={{
            opacity: [0, 0.7, 0],
            x: [0, 6, 12],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        >
          <div className="w-0 h-0 border-t-[3px] border-b-[3px] border-l-[5px] border-transparent border-l-[var(--accent-color)]" />
        </motion.div>
      )}
    </motion.div>
  );
}
