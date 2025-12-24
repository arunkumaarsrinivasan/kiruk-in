'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

interface AnimatedPortraitProps {
  dialogue: string[];
  currentDialogueIndex: number;
  onDialogueComplete?: () => void;
}

// Complex dithered portrait - head to shoulder
// Using ASCII art patterns with dithering for depth and detail
const portraitPixels: string[][] = [
  // Top of head - hair
  [' ', ' ', ' ', ' ', '░', '░', '░', '░', '░', '░', '░', '░', '░', '░', '░', '░', '░', '░', '░', '░', '░', '░', '░', ' ', ' ', ' ', ' '],
  [' ', ' ', ' ', '░', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '░', ' ', ' ', ' '],
  [' ', ' ', '░', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '░', ' ', ' '],
  // Forehead with dithering
  [' ', '░', '▓', '▓', '▓', '░', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '░', '▓', '▓', '▓', '▓', '░', ' '],
  ['░', '▓', '▓', '░', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '░', '▓', '▓', '▓', '░'],
  // Eyes area with dithering
  ['░', '▓', '▓', '▓', '▓', '▓', '▓', '░', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '░', '▓', '▓', '▓', '▓', '▓', '▓', '░'],
  ['░', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '░'],
  // Nose area with shading
  ['░', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '░', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '░', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '░'],
  ['░', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '░'],
  // Mouth area
  ['░', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '░'],
  ['░', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '░'],
  // Chin with dithering
  ['░', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '░'],
  [' ', '░', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '░', ' '],
  // Neck with shading
  [' ', ' ', '░', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '░', ' ', ' ', ' '],
  [' ', ' ', '░', '▓', '▓', '░', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '░', '▓', '▓', '░', ' ', ' ', ' '],
  // Shoulders with dithering
  [' ', ' ', ' ', '░', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '░', ' ', ' ', ' ', ' '],
  [' ', ' ', ' ', ' ', '░', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '░', ' ', ' ', ' ', ' ', ' '],
];

// Eye positions (row, col) - left and right (adjusted for new layout)
const leftEyePos = { row: 5, col: 9 };
const rightEyePos = { row: 5, col: 17 };

// Mouth positions
const mouthStartPos = { row: 9, col: 11 };
const mouthEndPos = { row: 9, col: 15 };

export function AnimatedPortrait({ dialogue, currentDialogueIndex, onDialogueComplete }: AnimatedPortraitProps) {
  const [isBlinking, setIsBlinking] = useState(false);
  const [mouthFrame, setMouthFrame] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Blinking animation
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
    }, 3000 + Math.random() * 2000);

    return () => clearInterval(blinkInterval);
  }, []);

  // Speaking animation
  useEffect(() => {
    if (isSpeaking) {
      const speakInterval = setInterval(() => {
        setMouthFrame(prev => (prev + 1) % 3);
      }, 200);
      return () => clearInterval(speakInterval);
    } else {
      setMouthFrame(0);
    }
  }, [isSpeaking]);

  // Trigger speaking when dialogue changes
  useEffect(() => {
    setIsSpeaking(true);
    const timer = setTimeout(() => {
      setIsSpeaking(false);
      if (currentDialogueIndex === dialogue.length - 1 && onDialogueComplete) {
        setTimeout(() => onDialogueComplete(), 500);
      }
    }, dialogue[currentDialogueIndex]?.length * 50 || 2000);
    return () => clearTimeout(timer);
  }, [currentDialogueIndex, dialogue, onDialogueComplete]);

  const getPixelColor = (char: string): string => {
    switch (char) {
      case '▓': return 'var(--text-main)';
      case '░': return 'var(--text-muted)';
      case ' ': return 'transparent';
      default: return 'transparent';
    }
  };

  const renderEyes = (row: number, col: number, isLeft: boolean) => {
    if (row === leftEyePos.row && (col === leftEyePos.col || col === leftEyePos.col + 1) ||
        row === rightEyePos.row && (col === rightEyePos.col || col === rightEyePos.col + 1)) {
      if (isBlinking) {
        return '─';
      }
      return isLeft ? '◉' : '◉';
    }
    return null;
  };

  const renderMouth = (row: number, col: number) => {
    if (row === mouthStartPos.row && col >= mouthStartPos.col && col <= mouthEndPos.col) {
      if (!isSpeaking) {
        return '─';
      }
      // Animated mouth shapes
      const mouthShapes = ['─', '═', '╌'];
      return mouthShapes[mouthFrame];
    }
    return null;
  };

  return (
    <div className="relative">
      <div
        className="font-mono text-xs leading-none select-none"
        style={{
          color: 'var(--text-main)',
          fontFamily: 'monospace',
          imageRendering: 'pixelated' as any,
          lineHeight: '1',
        }}
      >
        {portraitPixels.map((row, rowIndex) => (
          <div key={rowIndex} className="flex">
            {row.map((char, colIndex) => {
              const eyeChar = renderEyes(rowIndex, colIndex, colIndex < 13);
              const mouthChar = renderMouth(rowIndex, colIndex);
              
              if (eyeChar) {
                return (
                  <motion.span
                    key={`${rowIndex}-${colIndex}`}
                    style={{ color: 'var(--accent-color)' }}
                    animate={isBlinking ? { opacity: 0 } : { opacity: 1 }}
                    transition={{ duration: 0.15 }}
                  >
                    {eyeChar}
                  </motion.span>
                );
              }
              
              if (mouthChar) {
                return (
                  <motion.span
                    key={`${rowIndex}-${colIndex}`}
                    style={{ color: 'var(--accent-color)' }}
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 0.2, repeat: isSpeaking ? Infinity : 0 }}
                  >
                    {mouthChar}
                  </motion.span>
                );
              }
              
              return (
                <span
                  key={`${rowIndex}-${colIndex}`}
                  style={{ color: getPixelColor(char) }}
                >
                  {char}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
