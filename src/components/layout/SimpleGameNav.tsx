'use client';

/**
 * SimpleGameNav - Clean Navigation with Eye Logo Timeline
 * 
 * Features:
 * - Clean minimal header
 * - Eye logo that opens timeline overlay
 * - Giant eye with design era timeline
 * - Era selection changes eyeball design and theme
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import { GRID_SIZE, cn } from '@/lib/utils';
import { useDesignEra } from '@/contexts/DesignEraContext';
import { useGameMode, PAGE_GAMES } from '@/contexts/GameModeContext';
import { AVAILABLE_THEMES, type ThemeConfig } from '@/data/portfolio-data';
import { GameMenuOverlay } from './GameMenuOverlay';
import { getPageInfo } from '@/data/page-info';
import { CustomizationLab } from '@/components/ui/TimeMachine/components/CustomizationLab';
import { getNextGame } from '@/data/game-navigation-data';


// ═══════════════════════════════════════════════════════════════════════════════
// BIG EYE COMPONENT - Large eyeball with cursor-following pupil and emotions
// ═══════════════════════════════════════════════════════════════════════════════

type EyeEmotion = 'neutral' | 'confused' | 'excited' | 'focused' | 'surprised' | 'sleepy' | 'wink';

interface BigEyeProps {
  size?: number;
  eraId?: string;
  onClick?: () => void;
  className?: string;
}

const BigEye: React.FC<BigEyeProps> = ({ size = 48, eraId, onClick, className }) => {
  const [pupilPos, setPupilPos] = useState({ x: 0, y: 0 });
  const [isBlinking, setIsBlinking] = useState(false);
  const [emotion, setEmotion] = useState<EyeEmotion>('neutral');
  const [eyeShape, setEyeShape] = useState({ width: 1, height: 1 }); // For excited/surprised states
  const eyeRef = useRef<HTMLDivElement>(null);
  const lastMousePos = useRef({ x: 0, y: 0, time: Date.now() });
  const speedHistory = useRef<number[]>([]);
  const hoverCheckTimeout = useRef<NodeJS.Timeout | null>(null);
  const emotionRef = useRef<EyeEmotion>('neutral');
  const confusedTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const surprisedTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const currentEra = AVAILABLE_THEMES.find(t => t.id === eraId) || AVAILABLE_THEMES[0];
  const eyeColor = currentEra.colors.text || 'var(--text-main)';
  const pupilColor = currentEra.colors.accent || 'var(--accent-color)';

  // Bigger movement range for visible cursor-following
  const pupilRadius = size * 0.15;
  const maxMove = size * 0.25;

  // Sync emotion ref with state
  useEffect(() => {
    emotionRef.current = emotion;
  }, [emotion]);

  // Check if hovering over interactive elements
  useEffect(() => {
    const checkHover = (e: MouseEvent) => {
      if (hoverCheckTimeout.current) {
        clearTimeout(hoverCheckTimeout.current);
      }
      
      hoverCheckTimeout.current = setTimeout(() => {
        const element = document.elementFromPoint(e.clientX, e.clientY);
        if (element) {
          const isInteractive = 
            element.tagName === 'BUTTON' ||
            element.tagName === 'A' ||
            element.getAttribute('role') === 'button' ||
            element.closest('button') !== null ||
            element.closest('a') !== null ||
            element.closest('[role="button"]') !== null;
          
          if (isInteractive && emotionRef.current !== 'excited' && emotionRef.current !== 'confused') {
            setEmotion('excited');
            setEyeShape({ width: 1.15, height: 1.1 });
          } else if (!isInteractive && emotionRef.current === 'excited') {
            setEmotion('neutral');
            setEyeShape({ width: 1, height: 1 });
          }
        }
      }, 50);
    };

    globalThis.addEventListener('mousemove', checkHover);
    return () => {
      globalThis.removeEventListener('mousemove', checkHover);
      if (hoverCheckTimeout.current) {
        clearTimeout(hoverCheckTimeout.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!eyeRef.current) return;
      
      const rect = eyeRef.current.getBoundingClientRect();
      const eyeCenterX = rect.left + rect.width / 2;
      const eyeCenterY = rect.top + rect.height / 2;
      const deltaX = e.clientX - eyeCenterX;
      const deltaY = e.clientY - eyeCenterY;
      const angle = Math.atan2(deltaY, deltaX);
      const distance = Math.hypot(deltaX, deltaY);
      
      // Calculate speed
      const now = Date.now();
      const timeDelta = now - lastMousePos.current.time;
      const mouseDeltaX = e.clientX - lastMousePos.current.x;
      const mouseDeltaY = e.clientY - lastMousePos.current.y;
      const mouseDistance = Math.hypot(mouseDeltaX, mouseDeltaY);
      const speed = timeDelta > 0 ? mouseDistance / timeDelta : 0;
      
      lastMousePos.current = { x: e.clientX, y: e.clientY, time: now };
      
      // Track speed history (last 5 movements)
      speedHistory.current.push(speed);
      if (speedHistory.current.length > 5) {
        speedHistory.current.shift();
      }
      
      const avgSpeed = speedHistory.current.length > 0 
        ? speedHistory.current.reduce((a, b) => a + b, 0) / speedHistory.current.length 
        : 0;
      const fastThreshold = 0.5; // pixels per millisecond
      
      // Always update pupil position, but adjust based on emotion
      let moveAmount = Math.min(distance / 8, maxMove);
      let newPupilPos = { x: 0, y: 0 };
      
      // Determine emotion based on speed
      if (avgSpeed > fastThreshold && emotionRef.current !== 'excited') {
        // Clear any existing confused timeout
        if (confusedTimeoutRef.current) {
          clearTimeout(confusedTimeoutRef.current);
        }
        
        if (emotionRef.current !== 'confused') {
          setEmotion('confused');
        }
        
        // Confused: pupil moves erratically
        const confusedOffset = {
          x: (Math.random() - 0.5) * maxMove * 0.3,
          y: (Math.random() - 0.5) * maxMove * 0.3,
        };
        moveAmount = Math.min(distance / 8, maxMove) + Math.abs(confusedOffset.x);
        newPupilPos = {
          x: Math.cos(angle) * moveAmount + confusedOffset.x,
          y: Math.sin(angle) * moveAmount + confusedOffset.y,
        };
        
        // Clear confused state after movement slows
        confusedTimeoutRef.current = setTimeout(() => {
          if (speedHistory.current.length > 0) {
            const currentAvg = speedHistory.current.reduce((a, b) => a + b, 0) / speedHistory.current.length;
            if (currentAvg < fastThreshold * 0.5 && emotionRef.current === 'confused') {
              setEmotion('neutral');
            }
          }
        }, 500);
      } else {
        // Normal or excited tracking
        if (emotionRef.current === 'excited') {
          moveAmount = Math.min(distance / 6, maxMove * 1.1);
        }
        
        newPupilPos = {
          x: Math.cos(angle) * moveAmount,
          y: Math.sin(angle) * moveAmount,
        };
        
        // Direction-based emotions (only when not confused)
        if (emotionRef.current !== 'confused' && emotionRef.current !== 'excited') {
          const absDeltaX = Math.abs(deltaX);
          const absDeltaY = Math.abs(deltaY);
          const isLookingRight = deltaX > size * 0.3;
          const isLookingLeft = deltaX < -size * 0.3;
          const isLookingUp = deltaY < -size * 0.3;
          
          if (emotionRef.current === 'neutral' || emotionRef.current === 'surprised') {
            // Subtle emotion hints based on direction
            if (isLookingRight && absDeltaX > absDeltaY) {
              // Slight excitement when looking right (like "oh, something interesting!")
              setEyeShape({ width: 1.05, height: 1 });
            } else if (isLookingLeft && absDeltaX > absDeltaY) {
              // Curious when looking left
              setEyeShape({ width: 1.05, height: 1 });
            } else if (isLookingUp && emotionRef.current !== 'surprised') {
              // Surprised when looking up
              if (surprisedTimeoutRef.current) {
                clearTimeout(surprisedTimeoutRef.current);
              }
              setEmotion('surprised');
              setEyeShape({ width: 1.1, height: 1.2 });
              surprisedTimeoutRef.current = setTimeout(() => {
                if (emotionRef.current === 'surprised') {
                  setEmotion('neutral');
                  setEyeShape({ width: 1, height: 1 });
                }
              }, 400);
            } else if (!isLookingUp && emotionRef.current === 'neutral') {
              setEyeShape({ width: 1, height: 1 });
            }
          }
        }
      }
      
      // Always update pupil position
      setPupilPos((prev) => {
        if (Math.abs(prev.x - newPupilPos.x) < 0.5 && Math.abs(prev.y - newPupilPos.y) < 0.5) return prev;
        return newPupilPos;
      });
    };
    
    globalThis.addEventListener('mousemove', handleMouseMove);
    return () => {
      globalThis.removeEventListener('mousemove', handleMouseMove);
      if (confusedTimeoutRef.current) {
        clearTimeout(confusedTimeoutRef.current);
      }
      if (surprisedTimeoutRef.current) {
        clearTimeout(surprisedTimeoutRef.current);
      }
    };
  }, [maxMove, size]);

  useEffect(() => {
    const blink = () => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 120);
    };
    const interval = setInterval(() => {
      if (Math.random() > 0.7 && emotionRef.current !== 'confused') blink();
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  // Render eye based on emotion
  const renderEye = () => {
    const baseRadiusX = (size / 2 - 2) * eyeShape.width;
    const baseRadiusY = (size / 2 - 2) * eyeShape.height;
    const irisRadiusX = size * 0.35 * eyeShape.width;
    const irisRadiusY = size * 0.35 * eyeShape.height;

    return (
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="overflow-visible"
      >
        {/* Eye outline (oval) - adjusts based on emotion */}
        <motion.ellipse
          cx={size / 2}
          cy={size / 2}
          rx={baseRadiusX}
          ry={baseRadiusY}
          fill="none"
          stroke={eyeColor}
          strokeWidth={emotion === 'excited' || emotion === 'surprised' ? 2.5 : 2}
          animate={{
            rx: baseRadiusX,
            ry: baseRadiusY,
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        />
        
        {/* Iris fill - soft background for pupil area */}
        {!isBlinking && (
          <motion.ellipse
            cx={size / 2}
            cy={size / 2}
            rx={irisRadiusX}
            ry={irisRadiusY}
            fill={eyeColor}
            fillOpacity={emotion === 'excited' ? 0.25 : 0.15}
            animate={{
              rx: irisRadiusX,
              ry: irisRadiusY,
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          />
        )}
        
        {/* Confused state: spinning/swirling effect */}
        {emotion === 'confused' && !isBlinking && (
          <motion.g
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
            style={{ transformOrigin: `${size / 2}px ${size / 2}px` }}
          >
            <circle
              cx={size / 2}
              cy={size / 2}
              r={pupilRadius * 0.3}
              fill={pupilColor}
              fillOpacity={0.3}
            />
          </motion.g>
        )}
        
        {/* Blink: horizontal line */}
        {isBlinking ? (
          <line
            x1={size * 0.2}
            y1={size / 2}
            x2={size * 0.8}
            y2={size / 2}
            stroke={eyeColor}
            strokeWidth={2}
            strokeLinecap="round"
          />
        ) : (
          <motion.g
            animate={{ 
              x: pupilPos.x, 
              y: pupilPos.y,
              scale: emotion === 'excited' ? 1.1 : emotion === 'surprised' ? 1.15 : 1,
            }}
            transition={{ 
              type: emotion === 'confused' ? 'tween' : 'spring', 
              stiffness: emotion === 'confused' ? 100 : 350, 
              damping: emotion === 'confused' ? 5 : 22,
              duration: emotion === 'confused' ? 0.1 : undefined,
            }}
            style={{ transformOrigin: `${size / 2}px ${size / 2}px` }}
          >
            {/* Pupil - big dark circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={pupilRadius}
              fill={pupilColor}
            />
            {/* Pupil highlight */}
            <circle
              cx={size / 2 + pupilRadius * 0.3}
              cy={size / 2 - pupilRadius * 0.3}
              r={pupilRadius * 0.25}
              fill="white"
              fillOpacity={emotion === 'excited' ? 0.7 : 0.5}
            />
            
            {/* Excited state: sparkle effect */}
            {emotion === 'excited' && (
              <>
                <circle
                  cx={size / 2 + pupilRadius * 0.8}
                  cy={size / 2 - pupilRadius * 0.8}
                  r={pupilRadius * 0.15}
                  fill={pupilColor}
                  fillOpacity={0.6}
                />
                <circle
                  cx={size / 2 - pupilRadius * 0.6}
                  cy={size / 2 + pupilRadius * 0.7}
                  r={pupilRadius * 0.12}
                  fill={pupilColor}
                  fillOpacity={0.5}
                />
              </>
            )}
            
            {/* Surprised state: wider pupil */}
            {emotion === 'surprised' && (
              <ellipse
                cx={size / 2}
                cy={size / 2}
                rx={pupilRadius * 1.2}
                ry={pupilRadius * 0.9}
                fill={pupilColor}
                fillOpacity={0.3}
              />
            )}
          </motion.g>
        )}
      </svg>
    );
  };

  return (
    <div
      ref={eyeRef}
      className={cn('relative cursor-pointer flex items-center justify-center', className)}
      onClick={onClick}
      style={{ width: size, height: size }}
      aria-hidden
    >
      {renderEye()}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// GIANT EYE OVERLAY - Timeline of design eras
// ═══════════════════════════════════════════════════════════════════════════════

interface EyeTimelineOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  currentEraId: string;
  onEraSelect: (eraId: string) => void;
}

// Get era-specific pupil design
const getEraPupilDesign = (eraId: string): number[][] => {
  const era = AVAILABLE_THEMES.find(t => t.id === eraId);
  if (!era) return [[1, 1], [1, 1]]; // Default 2x2 pupil

  // Different pupil patterns for different eras
  const year = parseInt(eraId);

  if (year < 1980) {
    // 1970s: Simple square (terminal style)
    return [[1, 1], [1, 1]];
  } else if (year < 1990) {
    // 1980s: Diamond shape
    return [[0, 1, 0], [1, 1, 1], [0, 1, 0]];
  } else if (year < 2000) {
    // 1990s: Circle approximation
    return [[0, 1, 1, 0], [1, 1, 1, 1], [1, 1, 1, 1], [0, 1, 1, 0]];
  } else if (year < 2010) {
    // 2000s: Rounded square
    return [[1, 1, 1], [1, 1, 1], [1, 1, 1]];
  } else if (year < 2020) {
    // 2010s: Modern circle
    return [[0, 1, 1, 1, 0], [1, 1, 1, 1, 1], [1, 1, 1, 1, 1], [1, 1, 1, 1, 1], [0, 1, 1, 1, 0]];
  } else {
    // 2020s+: Refined circle
    return [[0, 0, 1, 1, 0, 0], [0, 1, 1, 1, 1, 0], [1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1], [0, 1, 1, 1, 1, 0], [0, 0, 1, 1, 0, 0]];
  }
};

// Full-screen pixel eye with era-specific pupil
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const FullScreenPixelEye: React.FC<{ eraId: string; size: number }> = ({ eraId, size }) => {
  const [pupilPos, setPupilPos] = useState({ x: 0, y: 0 });
  const [isBlinking, setIsBlinking] = useState(false);
  const eyeRef = useRef<HTMLDivElement>(null);

  const cols = 13;
  const rows = 9;
  const pixelSize = Math.floor(size / cols);
  const pupilPattern = getEraPupilDesign(eraId);
  const pupilCols = pupilPattern[0]?.length || 2;
  const pupilRows = pupilPattern.length;
  const pupilPixelSize = Math.floor(pixelSize * 1.5);

  const currentEra = AVAILABLE_THEMES.find(t => t.id === eraId) || AVAILABLE_THEMES[0];
  const eyeColor = currentEra.colors.text || 'var(--text-main)';
  const pupilColor = currentEra.colors.accent || 'var(--accent-color)';

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!eyeRef.current) return;
      const rect = eyeRef.current.getBoundingClientRect();
      const eyeCenterX = rect.left + rect.width / 2;
      const eyeCenterY = rect.top + rect.height / 2;
      const deltaX = e.clientX - eyeCenterX;
      const deltaY = e.clientY - eyeCenterY;
      const angle = Math.atan2(deltaY, deltaX);
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const maxMove = pixelSize * 3;
      const moveAmount = Math.min(distance / 15, maxMove);
      setPupilPos((prev) => {
        const newX = Math.cos(angle) * moveAmount;
        const newY = Math.sin(angle) * moveAmount;
        // Only update if position actually changed to prevent unnecessary re-renders
        if (Math.abs(prev.x - newX) < 0.1 && Math.abs(prev.y - newY) < 0.1) {
          return prev;
        }
        return { x: newX, y: newY };
      });
    };
    globalThis.addEventListener('mousemove', handleMouseMove);
    return () => globalThis.removeEventListener('mousemove', handleMouseMove);
  }, [pixelSize]);

  useEffect(() => {
    const blink = () => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
    };
    const interval = setInterval(() => {
      if (Math.random() > 0.7) blink();
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const eyePattern = [
    [0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0],
    [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0],
  ];

  const blinkPattern = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  ];

  const currentPattern = isBlinking ? blinkPattern : eyePattern;

  return (
    <div
      ref={eyeRef}
      className="relative w-full h-full flex items-center justify-center"
      style={{ width: '100vw', height: '100vh' }}
    >
      <div
        className="absolute inset-0 grid"
        style={{
          gridTemplateColumns: `repeat(${cols}, ${pixelSize}px)`,
          gridTemplateRows: `repeat(${rows}, ${pixelSize}px)`,
          width: cols * pixelSize,
          height: rows * pixelSize,
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        {currentPattern.flat().map((pixel, i) => (
          <div
            key={i}
            style={{
              backgroundColor: pixel === 1 ? eyeColor : 'transparent',
              width: pixelSize,
              height: pixelSize,
            }}
          />
        ))}
      </div>

      {!isBlinking && (
        <motion.div
          className="absolute"
          style={{
            left: '50%',
            top: '50%',
            marginLeft: -(pupilCols * pupilPixelSize) / 2,
            marginTop: -(pupilRows * pupilPixelSize) / 2,
          }}
          animate={{ x: pupilPos.x, y: pupilPos.y }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${pupilCols}, ${pupilPixelSize}px)`,
              gridTemplateRows: `repeat(${pupilRows}, ${pupilPixelSize}px)`,
            }}
          >
            {pupilPattern.flat().map((pixel, i) => (
              <div
                key={i}
                style={{
                  width: pupilPixelSize,
                  height: pupilPixelSize,
                  backgroundColor: pixel === 1 ? pupilColor : 'transparent',
                }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// TOKEN DIFF COMPUTATION
// ═══════════════════════════════════════════════════════════════════════════════

interface DiffEntry {
  label: string;
  oldValue: string;
  newValue: string;
  type: 'color' | 'font' | 'token' | 'effect';
}

function getShadowStyle(
  shadowType: ThemeConfig['designTokens']['shadowStyle'],
  intensity: number,
  color: string,
): React.CSSProperties {
  const i = intensity / 100;
  switch (shadowType) {
    case 'hard': return { boxShadow: `${4 * i}px ${4 * i}px 0px 0px ${color}` };
    case 'soft': return { boxShadow: `0 ${4 * i}px ${16 * i}px rgba(0,0,0,${0.2 * i})` };
    case 'glow': return { boxShadow: `0 0 ${20 * i}px ${color}40, 0 0 ${40 * i}px ${color}20` };
    case 'glass': return { boxShadow: `0 ${8 * i}px ${32 * i}px rgba(0,0,0,${0.3 * i}), inset 0 1px 0 rgba(255,255,255,0.1)`, backdropFilter: 'blur(16px)' };
    case 'neumorphic': return { boxShadow: `${6 * i}px ${6 * i}px ${12 * i}px rgba(0,0,0,0.3), -${6 * i}px -${6 * i}px ${12 * i}px rgba(255,255,255,0.05)` };
    case 'inset': return { boxShadow: `inset 0 ${2 * i}px ${8 * i}px rgba(0,0,0,${0.3 * i})` };
    default: return {};
  }
}

function computeTokenDiff(prevEra: ThemeConfig, nextEra: ThemeConfig): DiffEntry[] {
  const diffs: DiffEntry[] = [];

  // Colors
  const colorKeys = ['primary', 'secondary', 'accent', 'background', 'text'] as const;
  for (const key of colorKeys) {
    if (prevEra.colors[key] !== nextEra.colors[key]) {
      diffs.push({ label: `colors.${key}`, oldValue: prevEra.colors[key], newValue: nextEra.colors[key], type: 'color' });
    }
  }

  // Fonts
  const fontKeys = ['primary', 'secondary', 'accent'] as const;
  const fontLabels = { primary: 'font-display', secondary: 'font-text', accent: 'font-ui' };
  for (const key of fontKeys) {
    const prev = prevEra.fonts[key].split(',')[0].replace(/"/g, '').trim();
    const next = nextEra.fonts[key].split(',')[0].replace(/"/g, '').trim();
    if (prev !== next) {
      diffs.push({ label: fontLabels[key], oldValue: prev, newValue: next, type: 'font' });
    }
  }

  // Style
  if (prevEra.style !== nextEra.style) {
    diffs.push({ label: 'style', oldValue: prevEra.style, newValue: nextEra.style, type: 'token' });
  }

  // Design tokens
  const pt = prevEra.designTokens;
  const nt = nextEra.designTokens;

  if (pt.borderRadius !== nt.borderRadius) diffs.push({ label: 'border-radius', oldValue: `${pt.borderRadius}px`, newValue: `${nt.borderRadius}px`, type: 'token' });
  if (pt.shadowStyle !== nt.shadowStyle) diffs.push({ label: 'shadow-style', oldValue: pt.shadowStyle, newValue: nt.shadowStyle, type: 'token' });
  if (pt.shadowIntensity !== nt.shadowIntensity) diffs.push({ label: 'shadow-intensity', oldValue: `${pt.shadowIntensity}%`, newValue: `${nt.shadowIntensity}%`, type: 'token' });
  if ((pt.gridSize ?? 0) !== (nt.gridSize ?? 0)) diffs.push({ label: 'grid-size', oldValue: pt.gridSize ? `${pt.gridSize}px` : 'none', newValue: nt.gridSize ? `${nt.gridSize}px` : 'none', type: 'token' });
  if (pt.letterSpacing !== nt.letterSpacing) diffs.push({ label: 'letter-spacing', oldValue: `${pt.letterSpacing}`, newValue: `${nt.letterSpacing}`, type: 'token' });
  if (pt.lineHeight !== nt.lineHeight) diffs.push({ label: 'line-height', oldValue: `${pt.lineHeight}`, newValue: `${nt.lineHeight}`, type: 'token' });
  if (pt.animationStyle !== nt.animationStyle) diffs.push({ label: 'animation', oldValue: pt.animationStyle, newValue: nt.animationStyle, type: 'token' });

  // Effects diff
  const prevEffects = new Set(pt.effects);
  const nextEffects = new Set(nt.effects);
  const added = nt.effects.filter(e => !prevEffects.has(e));
  const removed = pt.effects.filter(e => !nextEffects.has(e));
  if (added.length > 0) diffs.push({ label: 'effects-added', oldValue: '', newValue: added.join(', '), type: 'effect' });
  if (removed.length > 0) diffs.push({ label: 'effects-removed', oldValue: removed.join(', '), newValue: '', type: 'effect' });

  return diffs;
}

// ═══════════════════════════════════════════════════════════════════════════════
// COLOR SWATCH (click to copy)
// ═══════════════════════════════════════════════════════════════════════════════

function LabColorSwatch({ color, label, borderRadius }: { color: string; label: string; borderRadius: number }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(color);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };
  return (
    <motion.button onClick={handleCopy} className="relative group flex flex-col items-center gap-1" whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}>
      <div className="w-8 h-8 lg:w-10 lg:h-10 border-2 border-[var(--border-color)] hover:border-[var(--accent-color)] transition-all" style={{ backgroundColor: color, borderRadius: `${Math.min(borderRadius, 4)}px` }} />
      <span className="text-[7px] font-mono uppercase" style={{ color: 'var(--text-muted)' }}>{label}</span>
      <span className="text-[6px] lg:text-[7px] font-mono" style={{ color: 'var(--text-main)' }}>{color.toUpperCase()}</span>
      <AnimatePresence>
        {copied && (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute -top-5 px-1.5 py-0.5 text-[7px] font-mono bg-[var(--accent-color)] text-[var(--bg-main)]" style={{ borderRadius: `${borderRadius}px` }}>
            COPIED
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// EYE TIMELINE OVERLAY - Token Dashboard Explorer
// ═══════════════════════════════════════════════════════════════════════════════

const EyeTimelineOverlay: React.FC<EyeTimelineOverlayProps> = ({
  isOpen,
  onClose,
  currentEraId,
  onEraSelect
}) => {
  const [selectedEraId, setSelectedEraId] = useState<string>(currentEraId);
  const [previousEraId, setPreviousEraId] = useState<string | null>(null);
  const [rightPanelMode, setRightPanelMode] = useState<'preview' | 'lab'>('preview');

  // Sync selectedEraId when overlay opens or currentEraId changes
  useEffect(() => {
    if (isOpen) {
      setSelectedEraId(currentEraId);
      setPreviousEraId(null);
    }
  }, [isOpen, currentEraId]);

  // Get era objects
  const selectedIndex = AVAILABLE_THEMES.findIndex(e => e.id === selectedEraId);
  const selectedEra = AVAILABLE_THEMES[selectedIndex] || AVAILABLE_THEMES[0];
  const previousEra = previousEraId ? AVAILABLE_THEMES.find(e => e.id === previousEraId) || null : null;

  // Compute diff
  const tokenDiff = useMemo(() => {
    if (!previousEra) return [];
    return computeTokenDiff(previousEra, selectedEra);
  }, [previousEra, selectedEra]);

  // Shadow style for live preview
  const shadowCSS = useMemo(() =>
    getShadowStyle(selectedEra.designTokens.shadowStyle, selectedEra.designTokens.shadowIntensity, selectedEra.colors.accent),
    [selectedEra]
  );

  const setEraWithTracking = (newEraId: string) => {
    if (newEraId !== selectedEraId) {
      setPreviousEraId(selectedEraId);
      setSelectedEraId(newEraId);
    }
  };

  const navigatePrevious = () => {
    if (selectedIndex > 0) setEraWithTracking(AVAILABLE_THEMES[selectedIndex - 1].id);
  };

  const navigateNext = () => {
    if (selectedIndex < AVAILABLE_THEMES.length - 1) setEraWithTracking(AVAILABLE_THEMES[selectedIndex + 1].id);
  };

  const handleApplyEra = () => {
    if (selectedEraId !== currentEraId) onEraSelect(selectedEraId);
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); navigatePrevious(); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); navigateNext(); }
      else if (e.key === 'Enter') { e.preventDefault(); handleApplyEra(); }
      else if (e.key === 'Escape') { e.preventDefault(); onClose(); }
    };
    globalThis.addEventListener('keydown', handleKeyDown);
    return () => globalThis.removeEventListener('keydown', handleKeyDown);
  });

  const tokens = selectedEra.designTokens;
  const borderRadius = Math.min(tokens.borderRadius, 16);
  const colorKeys = ['primary', 'secondary', 'accent', 'background', 'text'] as const;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] flex flex-col"
          style={{ backgroundColor: 'var(--bg-main)' }}
        >
          {/* ═══ TOP BAR ═══ */}
          <div className="flex items-center justify-between px-4 md:px-6 py-2.5 border-b-2 border-[var(--border-color)] bg-[var(--bg-card)] flex-shrink-0">
            <motion.button
              onClick={onClose}
              className="px-3 py-1.5 font-mono text-xs border-2 border-[var(--border-color)] text-[var(--text-main)] hover:border-[var(--text-main)] transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              &times;
            </motion.button>
            <div className="text-center">
              <h1 className="font-mono text-[10px] md:text-xs font-bold uppercase tracking-[0.25em] text-[var(--accent-color)]">
                DESIGN SYSTEM LAB
              </h1>
              <p className="font-mono text-[8px] text-[var(--text-muted)] mt-0.5">
                {selectedEra.id} &middot; {selectedEra.era}
              </p>
            </div>
            <motion.button
              onClick={handleApplyEra}
              className="px-3 py-1.5 font-mono text-[9px] md:text-[10px] font-bold uppercase border-2 transition-all"
              style={{
                borderColor: selectedEra.id !== currentEraId ? 'var(--accent-color)' : 'var(--border-color)',
                color: selectedEra.id !== currentEraId ? 'var(--accent-color)' : 'var(--text-muted)',
              }}
              whileHover={selectedEra.id !== currentEraId ? { scale: 1.05 } : {}}
              whileTap={selectedEra.id !== currentEraId ? { scale: 0.95 } : {}}
            >
              {selectedEra.id !== currentEraId ? 'APPLY ERA' : 'ACTIVE'}
            </motion.button>
          </div>

          {/* ═══ MAIN CONTENT: TWO-PANEL LAB ═══ */}
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">

            {/* ═══ LEFT PANEL: TOKEN INSPECTOR ═══ */}
            <div className="lg:w-[42%] xl:w-[38%] border-b-2 lg:border-b-0 lg:border-r-2 border-[var(--border-color)] overflow-y-auto scrollbar-hide">
              <div className="p-4 md:p-5 space-y-5">
                {/* Era Header */}
                <div>
                  <div className="flex items-start justify-between mb-1">
                    <div className="text-3xl md:text-4xl font-black tracking-tight" style={{ color: selectedEra.colors.accent, fontFamily: selectedEra.fonts.primary }}>
                      {selectedEra.id}
                    </div>
                    <div className="flex items-center gap-1.5">
                      {selectedEra.id === currentEraId && (
                        <span className="px-1.5 py-0.5 text-[7px] font-mono font-bold uppercase bg-[var(--accent-color)] text-[var(--bg-main)]">ACTIVE</span>
                      )}
                      <span className="px-1.5 py-0.5 text-[7px] font-mono uppercase border border-[var(--border-color)] text-[var(--text-muted)]">{selectedEra.style}</span>
                    </div>
                  </div>
                  <div className="font-mono text-xs md:text-sm font-bold" style={{ color: 'var(--text-main)' }}>
                    {selectedEra.name.split(':')[1]?.trim() || selectedEra.name}
                  </div>
                  <div className="text-[9px] font-mono mt-0.5" style={{ color: 'var(--text-muted)' }}>{selectedEra.era}</div>
                </div>

                {/* Color Palette */}
                <div>
                  <div className="font-mono text-[9px] uppercase mb-2 flex items-center gap-2 tracking-[0.1em]" style={{ color: 'var(--accent-color)' }}>
                    <span>&#9670;</span> COLOR PALETTE
                  </div>
                  <div className="flex flex-wrap gap-2 lg:gap-3">
                    {colorKeys.map((key) => (
                      <LabColorSwatch key={key} color={selectedEra.colors[key]} label={key} borderRadius={borderRadius} />
                    ))}
                  </div>
                </div>

                {/* Typography */}
                <div>
                  <div className="font-mono text-[9px] uppercase mb-2 flex items-center gap-2 tracking-[0.1em]" style={{ color: 'var(--accent-color)' }}>
                    <span>&#9670;</span> TYPOGRAPHY
                  </div>
                  <div className="space-y-1.5">
                    {[
                      { label: 'Display', font: selectedEra.fonts.primary },
                      { label: 'Text', font: selectedEra.fonts.secondary },
                      { label: 'UI', font: selectedEra.fonts.accent },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center gap-2 px-2 py-1.5 border border-[var(--border-color)]" style={{ borderRadius: `${Math.min(borderRadius, 4)}px` }}>
                        <span className="text-[7px] font-mono uppercase w-10 flex-shrink-0" style={{ color: 'var(--text-muted)' }}>{item.label}</span>
                        <span className="text-xs truncate" style={{ fontFamily: item.font, color: 'var(--text-main)' }}>
                          {item.font.split(',')[0].replace(/"/g, '').trim()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Design Tokens */}
                <div>
                  <div className="font-mono text-[9px] uppercase mb-2 flex items-center gap-2 tracking-[0.1em]" style={{ color: 'var(--accent-color)' }}>
                    <span>&#9670;</span> DESIGN TOKENS
                  </div>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                    {[
                      { label: 'border-radius', value: `${tokens.borderRadius}px` },
                      { label: 'shadow', value: `${tokens.shadowStyle} (${tokens.shadowIntensity}%)` },
                      { label: 'grid', value: tokens.gridSize ? `${tokens.gridSize}px` : 'none' },
                      { label: 'grid-opacity', value: `${tokens.gridOpacity}` },
                      { label: 'letter-spacing', value: `${tokens.letterSpacing}` },
                      { label: 'line-height', value: `${tokens.lineHeight}` },
                      { label: 'animation', value: tokens.animationStyle },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between px-2 py-1 border border-[var(--border-color)]" style={{ borderRadius: `${Math.min(borderRadius, 3)}px` }}>
                        <span className="text-[7px] font-mono uppercase" style={{ color: 'var(--text-muted)' }}>{item.label}</span>
                        <span className="text-[8px] font-mono font-bold" style={{ color: 'var(--text-main)' }}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Effects */}
                {tokens.effects.length > 0 && (
                  <div>
                    <div className="font-mono text-[9px] uppercase mb-2 flex items-center gap-2 tracking-[0.1em]" style={{ color: 'var(--accent-color)' }}>
                      <span>&#9670;</span> EFFECTS
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {tokens.effects.map((effect, i) => (
                        <span key={i} className="px-1.5 py-0.5 text-[7px] font-mono uppercase border border-[var(--border-color)]" style={{ color: 'var(--text-muted)', borderRadius: `${Math.min(borderRadius, 4)}px` }}>
                          {effect}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Apply Button (mobile/left panel) */}
                <div className="pt-2">
                  {selectedEra.id !== currentEraId ? (
                    <motion.button
                      onClick={handleApplyEra}
                      className="w-full py-2 px-4 font-mono text-[10px] font-bold uppercase border-2 transition-all hover:brightness-110"
                      style={{ backgroundColor: 'var(--accent-color)', borderColor: 'var(--accent-color)', color: 'var(--bg-main)', borderRadius: `${borderRadius}px` }}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      Apply &ldquo;{selectedEra.name}&rdquo; &rarr;
                    </motion.button>
                  ) : (
                    <div className="w-full py-2 px-4 font-mono text-[9px] text-center border-2 border-dashed border-[var(--border-color)]" style={{ color: 'var(--text-muted)', borderRadius: `${borderRadius}px` }}>
                      Currently active era
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ═══ RIGHT PANEL: LIVE PREVIEW + CHANGE LOG / CUSTOMIZATION LAB ═══ */}
            <div className="flex-1 overflow-y-auto scrollbar-hide flex flex-col">
              {/* Panel Mode Toggle */}
              <div className="flex border-b-2 border-[var(--border-color)] px-4 md:px-5 flex-shrink-0">
                <button
                  onClick={() => setRightPanelMode('preview')}
                  className="px-3 py-2 font-mono text-[9px] uppercase transition-all flex items-center gap-1.5"
                  style={{
                    color: rightPanelMode === 'preview' ? 'var(--accent-color)' : 'var(--text-muted)',
                    borderBottom: rightPanelMode === 'preview' ? '2px solid var(--accent-color)' : '2px solid transparent',
                  }}
                >
                  <span>&#9670;</span> Live Preview
                </button>
                <button
                  onClick={() => setRightPanelMode('lab')}
                  className="px-3 py-2 font-mono text-[9px] uppercase transition-all flex items-center gap-1.5"
                  style={{
                    color: rightPanelMode === 'lab' ? 'var(--accent-color)' : 'var(--text-muted)',
                    borderBottom: rightPanelMode === 'lab' ? '2px solid var(--accent-color)' : '2px solid transparent',
                  }}
                >
                  <span>🔬</span> Customization Lab
                </button>
              </div>

              {rightPanelMode === 'lab' ? (
                <div className="flex-1">
                  <CustomizationLab era={selectedEra} onClose={() => setRightPanelMode('preview')} />
                </div>
              ) : (
              <div className="p-4 md:p-5 space-y-5">

                {/* Live Preview */}
                <div>
                  <div className="font-mono text-[9px] uppercase mb-2 flex items-center gap-2 tracking-[0.1em]" style={{ color: 'var(--accent-color)' }}>
                    <span>&#9670;</span> LIVE PREVIEW
                  </div>
                  <p className="text-[7px] font-mono mb-3" style={{ color: 'var(--text-muted)' }}>
                    Components morph in real-time as you switch eras
                  </p>

                  <motion.div
                    className="relative overflow-hidden border-2 p-4 md:p-5"
                    animate={{
                      borderColor: selectedEra.colors.accent,
                      borderRadius: borderRadius,
                      backgroundColor: selectedEra.colors.background,
                    }}
                    transition={{ duration: 0.6, ease: 'easeInOut' }}
                  >
                    {/* Grid overlay */}
                    <motion.div
                      className="absolute inset-0 pointer-events-none"
                      animate={{
                        opacity: tokens.gridSize && tokens.gridSize > 0 ? tokens.gridOpacity * 0.5 : 0,
                      }}
                      transition={{ duration: 0.6 }}
                      style={{
                        backgroundImage: `linear-gradient(${selectedEra.colors.text} 1px, transparent 1px), linear-gradient(90deg, ${selectedEra.colors.text} 1px, transparent 1px)`,
                        backgroundSize: `${tokens.gridSize || 20}px ${tokens.gridSize || 20}px`,
                      }}
                    />

                    <div className="relative z-10 space-y-3">
                      {/* Heading */}
                      <AnimatePresence mode="wait">
                        <motion.h3
                          key={`heading-${selectedEra.fonts.primary}`}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="text-lg lg:text-xl font-bold"
                          style={{
                            color: selectedEra.colors.text,
                            fontFamily: selectedEra.fonts.primary,
                            letterSpacing: `${tokens.letterSpacing * 0.01}em`,
                            lineHeight: tokens.lineHeight,
                          }}
                        >
                          Heading Display
                        </motion.h3>
                      </AnimatePresence>

                      {/* Body text */}
                      <AnimatePresence mode="wait">
                        <motion.p
                          key={`body-${selectedEra.fonts.secondary}`}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="text-xs lg:text-sm opacity-80"
                          style={{
                            color: selectedEra.colors.text,
                            fontFamily: selectedEra.fonts.secondary,
                            lineHeight: tokens.lineHeight,
                          }}
                        >
                          Body text showcasing this era&apos;s typography. Every design system tells a story through its choices.
                        </motion.p>
                      </AnimatePresence>

                      {/* Buttons + Badge row */}
                      <div className="flex flex-wrap gap-2 items-center">
                        <motion.button
                          className="px-3 py-1.5 text-[10px] font-bold uppercase border-2 transition-colors"
                          animate={{
                            backgroundColor: selectedEra.colors.accent,
                            borderColor: selectedEra.colors.accent,
                            color: selectedEra.colors.background,
                            borderRadius: borderRadius,
                          }}
                          transition={{ duration: 0.6, ease: 'easeInOut' }}
                          style={{ ...shadowCSS, fontFamily: selectedEra.fonts.accent }}
                        >
                          Primary
                        </motion.button>

                        <motion.button
                          className="px-3 py-1.5 text-[10px] font-bold uppercase border-2"
                          animate={{
                            borderColor: selectedEra.colors.text,
                            color: selectedEra.colors.text,
                            borderRadius: borderRadius,
                            backgroundColor: 'transparent',
                          }}
                          transition={{ duration: 0.6, ease: 'easeInOut' }}
                          style={{ fontFamily: selectedEra.fonts.accent }}
                        >
                          Secondary
                        </motion.button>

                        <motion.span
                          className="px-2 py-1 text-[8px] font-bold uppercase"
                          animate={{
                            backgroundColor: selectedEra.colors.primary,
                            color: selectedEra.colors.background,
                            borderRadius: Math.min(borderRadius, 12),
                          }}
                          transition={{ duration: 0.6, ease: 'easeInOut' }}
                          style={{ fontFamily: selectedEra.fonts.accent }}
                        >
                          Badge
                        </motion.span>

                        <motion.span
                          className="px-2 py-1 text-[8px] border"
                          animate={{
                            borderColor: selectedEra.colors.text,
                            color: selectedEra.colors.text,
                            borderRadius: Math.min(borderRadius, 8),
                          }}
                          transition={{ duration: 0.6, ease: 'easeInOut' }}
                          style={{ fontFamily: selectedEra.fonts.secondary }}
                        >
                          #tag
                        </motion.span>
                      </div>

                      {/* Mini Card */}
                      <motion.div
                        className="p-3 border-2"
                        animate={{
                          borderColor: `${selectedEra.colors.text}33`,
                          backgroundColor: `${selectedEra.colors.text}08`,
                          borderRadius: borderRadius,
                        }}
                        transition={{ duration: 0.6, ease: 'easeInOut' }}
                        style={shadowCSS}
                      >
                        <div className="text-xs font-bold mb-1" style={{ color: selectedEra.colors.text, fontFamily: selectedEra.fonts.primary }}>
                          Card Title
                        </div>
                        <div className="text-[10px] opacity-70" style={{ color: selectedEra.colors.text, fontFamily: selectedEra.fonts.secondary }}>
                          A sample card component styled for this era.
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>
                </div>

                {/* Change Log */}
                <div>
                  <div className="font-mono text-[9px] uppercase mb-2 flex items-center gap-2 tracking-[0.1em]" style={{ color: 'var(--accent-color)' }}>
                    <span>&#9670;</span> CHANGE LOG
                  </div>

                  {tokenDiff.length > 0 ? (
                    <div className="space-y-1">
                      <AnimatePresence mode="popLayout">
                        {tokenDiff.map((diff, i) => (
                          <motion.div
                            key={`${diff.label}-${i}`}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            transition={{ duration: 0.25, delay: i * 0.03 }}
                            className="flex items-center gap-2 px-2.5 py-1.5 border border-[var(--border-color)]"
                            style={{ borderRadius: `${Math.min(borderRadius, 4)}px` }}
                          >
                            {/* Diff type indicator */}
                            <span className="text-[7px] font-mono w-1.5 h-1.5 rounded-full flex-shrink-0" style={{
                              backgroundColor: diff.type === 'color' ? 'var(--accent-color)' :
                                diff.type === 'font' ? '#a78bfa' :
                                diff.type === 'effect' ? '#fbbf24' : 'var(--text-muted)',
                            }} />

                            {/* Label */}
                            <span className="text-[8px] font-mono font-bold flex-shrink-0 min-w-[80px]" style={{ color: 'var(--text-main)' }}>
                              {diff.label}
                            </span>

                            {/* Old value */}
                            {diff.type === 'color' && diff.oldValue ? (
                              <span className="flex items-center gap-1 text-[7px] font-mono" style={{ color: 'var(--text-muted)' }}>
                                <span className="w-2.5 h-2.5 inline-block border border-[var(--border-color)]" style={{ backgroundColor: diff.oldValue }} />
                                {diff.oldValue}
                              </span>
                            ) : (
                              <span className="text-[7px] font-mono" style={{ color: 'var(--text-muted)', textDecoration: diff.label === 'effects-removed' ? 'none' : undefined }}>
                                {diff.oldValue || (diff.label === 'effects-added' ? '' : '---')}
                              </span>
                            )}

                            {/* Arrow */}
                            <span className="text-[8px] font-mono flex-shrink-0" style={{ color: 'var(--accent-color)' }}>&rarr;</span>

                            {/* New value */}
                            {diff.type === 'color' && diff.newValue ? (
                              <span className="flex items-center gap-1 text-[7px] font-mono font-bold" style={{ color: 'var(--text-main)' }}>
                                <span className="w-2.5 h-2.5 inline-block border border-[var(--border-color)]" style={{ backgroundColor: diff.newValue }} />
                                {diff.newValue}
                              </span>
                            ) : (
                              <span className="text-[7px] font-mono font-bold" style={{
                                color: diff.label === 'effects-removed' ? 'var(--text-muted)' :
                                  diff.label === 'effects-added' ? 'var(--accent-color)' : 'var(--text-main)',
                              }}>
                                {diff.newValue || (diff.label === 'effects-removed' ? 'removed' : '---')}
                              </span>
                            )}
                          </motion.div>
                        ))}
                      </AnimatePresence>

                      <div className="text-[8px] font-mono pt-1" style={{ color: 'var(--text-muted)' }}>
                        {tokenDiff.length} token{tokenDiff.length !== 1 ? 's' : ''} changed from {previousEra?.id || '?'}
                      </div>
                    </div>
                  ) : (
                    <div className="px-3 py-4 border border-dashed border-[var(--border-color)] text-center" style={{ borderRadius: `${Math.min(borderRadius, 6)}px` }}>
                      <p className="text-[9px] font-mono" style={{ color: 'var(--text-muted)' }}>
                        Navigate between eras to see what changes
                      </p>
                      <p className="text-[8px] font-mono mt-1" style={{ color: 'var(--text-muted)' }}>
                        Use &larr; &rarr; keys or click timeline dots
                      </p>
                    </div>
                  )}
                </div>

                {/* Statement */}
                <div className="p-3 border border-[var(--border-color)] text-center" style={{ borderRadius: `${Math.min(borderRadius, 8)}px` }}>
                  <p className="font-mono text-[10px] font-bold" style={{ color: 'var(--text-main)' }}>
                    &ldquo;I design &amp; develop for every era.&rdquo;
                  </p>
                  <p className="font-mono text-[8px] mt-0.5 tracking-[0.05em]" style={{ color: 'var(--accent-color)' }}>
                    Whatever the interface. Anytime. Forever.
                  </p>
                </div>
              </div>
              )}
            </div>
          </div>

          {/* ═══ HORIZONTAL TIMELINE ═══ */}
          <div className="flex-shrink-0 border-t-2 border-[var(--border-color)] bg-[var(--bg-card)]">
            {/* Selected era info strip */}
            <div className="flex items-center justify-between px-6 md:px-10 pt-3 pb-1">
              <span className="font-mono text-xs md:text-sm text-[var(--text-muted)] tracking-wide">{selectedIndex + 1} / {AVAILABLE_THEMES.length} ERAS</span>
              <motion.span
                key={selectedEraId}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-mono text-sm md:text-base font-bold text-[var(--accent-color)] tracking-wide"
              >
                {selectedEra.id}: {selectedEra.name}
              </motion.span>
              <span className="font-mono text-xs md:text-sm text-[var(--text-muted)] tracking-wide">1970 &rarr; 2025</span>
            </div>

            {/* Timeline dots + year labels */}
            <div className="overflow-x-auto scrollbar-hide px-6 md:px-10 pt-3 pb-2">
              <div className="flex items-center min-w-max">
                {AVAILABLE_THEMES.map((era, index) => {
                  const isSelected = era.id === selectedEraId;
                  const isCurrent = era.id === currentEraId;
                  const isPast = index <= selectedIndex;
                  return (
                    <div key={era.id} className="flex items-center">
                      {index > 0 && (
                        <div className="transition-colors duration-300" style={{ width: 'clamp(28px, 4vw, 56px)', height: isPast ? '3px' : '2px', backgroundColor: isPast ? 'var(--accent-color)' : 'var(--border-color)' }} />
                      )}
                      <div className="flex flex-col items-center gap-1.5">
                        <motion.button
                          onClick={() => setEraWithTracking(era.id)}
                          className="relative flex-shrink-0 rounded-full transition-all flex items-center justify-center"
                          style={{
                            width: isSelected ? 32 : isCurrent ? 24 : 18,
                            height: isSelected ? 32 : isCurrent ? 24 : 18,
                            backgroundColor: isSelected || isCurrent
                              ? era.colors.accent
                              : isPast
                                ? `${era.colors.accent}AA`
                                : `${era.colors.accent}55`,
                            boxShadow: isSelected
                              ? `0 0 16px ${era.colors.accent}90, 0 0 32px ${era.colors.accent}50`
                              : isCurrent
                                ? `0 0 8px ${era.colors.accent}60`
                                : 'none',
                            border: isCurrent && !isSelected
                              ? '3px solid var(--text-main)'
                              : isSelected
                                ? `3px solid ${era.colors.accent}`
                                : '2px solid transparent',
                          }}
                          whileHover={{ scale: 1.3 }}
                          whileTap={{ scale: 0.9 }}
                          aria-label={`${era.id}: ${era.name}`}
                        >
                          {isSelected && (
                            <span className="text-[9px] md:text-[10px] font-mono font-black" style={{ color: era.colors.background }}>{era.id.slice(-2)}</span>
                          )}
                        </motion.button>
                        {/* Always-visible year label */}
                        <span
                          className="font-mono whitespace-nowrap transition-all duration-200"
                          style={{
                            fontSize: isSelected ? '11px' : '10px',
                            fontWeight: isSelected || isCurrent ? 700 : 400,
                            color: isSelected
                              ? era.colors.accent
                              : isCurrent
                                ? 'var(--text-main)'
                                : 'var(--text-muted)',
                          }}
                        >
                          {era.id}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ═══ KEYBOARD HINTS FOOTER ═══ */}
          <div className="flex items-center justify-center gap-5 md:gap-8 px-6 md:px-10 py-3 border-t-2 border-[var(--border-color)] bg-[var(--bg-main)] flex-shrink-0">
            <span className="font-mono text-xs md:text-sm text-[var(--text-muted)] flex items-center gap-2">
              <kbd className="px-2 py-1 text-[10px] md:text-xs border-2 border-[var(--border-color)] bg-[var(--bg-card)] rounded-sm">&larr;</kbd>
              <kbd className="px-2 py-1 text-[10px] md:text-xs border-2 border-[var(--border-color)] bg-[var(--bg-card)] rounded-sm">&rarr;</kbd>
              Navigate
            </span>
            <span className="hidden md:flex font-mono text-xs md:text-sm text-[var(--text-muted)] items-center gap-2">Click to Select</span>
            <span className="font-mono text-xs md:text-sm text-[var(--text-muted)] flex items-center gap-2">
              <kbd className="px-2 py-1 text-[10px] md:text-xs border-2 border-[var(--accent-color)] bg-[var(--bg-card)] text-[var(--accent-color)] rounded-sm">Enter</kbd>
              Apply
            </span>
            <span className="font-mono text-xs md:text-sm text-[var(--text-muted)] flex items-center gap-2">
              <kbd className="px-2 py-1 text-[10px] md:text-xs border-2 border-[var(--border-color)] bg-[var(--bg-card)] rounded-sm">Esc</kbd>
              Close
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN NAVIGATION COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

interface SimpleGameNavProps {
  isGameActive?: boolean;
  currentGameId?: string;
  currentGameName?: string;
  currentGameIcon?: string;
  onToggleGame?: () => void;
}

const SimpleGameNav: React.FC<SimpleGameNavProps> = ({
  isGameActive: _isGameActive = false,
  currentGameId: _currentGameId = 'snake',
  currentGameName: _currentGameName = 'SNAKE TRAIL',
  currentGameIcon: _currentGameIcon = 'bolt',
  onToggleGame: _onToggleGame,
}) => {
  const { currentEraId, setEra } = useDesignEra();
  const {
    toggleMenu,
  } = useGameMode();
  const pathname = usePathname();
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);

  const BAR_HEIGHT = GRID_SIZE * 3;

  const router = useRouter();
  const handleEraSelect = (eraId: string) => {
    setEra(eraId);
  };

  // Get current page game/mission
  const currentGame = useMemo(() => PAGE_GAMES.find(game => game.path === pathname), [pathname]);
  const pageInfo = useMemo(() => getPageInfo(pathname), [pathname]);

  // Get next/previous games (pages) for navigation
  const nextGame = useMemo(() => currentGame ? getNextGame(currentGame.id) : null, [currentGame]);
  const previousGame = useMemo(() => {
    if (!currentGame || currentGame.order <= 1) return null;
    return PAGE_GAMES.find(game => game.order === currentGame.order - 1) || null;
  }, [currentGame]);

  const hasNextGame = nextGame !== null;
  const hasPreviousGame = previousGame !== null;

  // Extract stable primitive values for dependencies - ensure they're always defined
  const currentGameId = currentGame?.id ?? null;
  const currentGameOrder = currentGame?.order ?? null;
  const nextGameId = nextGame?.id ?? null;
  const nextGamePath = nextGame?.path ?? null;
  const nextGameOrder = nextGame?.order ?? null;

  // Debug: Log navigation state (can be removed in production)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && pathname === '/about') {
      console.log('[SimpleGameNav] About page navigation state:', {
        pathname,
        currentGame: currentGameId,
        currentGameOrder,
        nextGame: nextGameId,
        nextGamePath,
        nextGameOrder,
        hasNextGame,
        allGames: PAGE_GAMES.map(g => ({ id: g.id, path: g.path, order: g.order })),
      });
    }
    // Using stable primitive values only - array size will always be constant
  }, [pathname, currentGameId, currentGameOrder, nextGameId, nextGamePath, nextGameOrder, hasNextGame]);

  return (
    <>
      {/* Enhanced Gaming Header */}
      <header
        id="navigation"
        className="fixed top-0 left-0 right-0 z-50 border-b-2 border-[var(--border-color)] bg-[var(--bg-card)]/95 backdrop-blur-md"
        style={{
          height: BAR_HEIGHT,
        }}
        role="banner"
      >
        {/* Top Row: Main Navigation */}
        <div className="flex items-center justify-between h-full" style={{ height: BAR_HEIGHT }}>
          {/* LEFT: Big Eye + Timeline Era + Previous Button */}
          <div className="flex">
            <motion.button
              onClick={() => router.push('/')}
              className="flex items-center justify-center border-r border-b border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--accent-color)]/20 hover:border-[var(--accent-color)] transition-colors duration-150 flex-shrink-0"
              style={{
                height: BAR_HEIGHT,
                width: BAR_HEIGHT,
                padding: '4px',
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Go to home"
            >
              <BigEye size={BAR_HEIGHT - 20} eraId={currentEraId} />
            </motion.button>

            <motion.button
              onClick={() => setIsTimelineOpen(true)}
              className="flex flex-col items-center justify-center border-r border-b border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--accent-color)] hover:text-[var(--bg-main)] transition-colors duration-150 group"
              style={{
                height: BAR_HEIGHT,
                minWidth: BAR_HEIGHT * 1.5,
                padding: '4px 12px',
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              aria-label="Open design era timeline"
            >
              <span className="text-[8px] font-mono text-[var(--text-muted)] group-hover:text-[var(--bg-main)] uppercase tracking-wider">ERA</span>
              <span className="text-sm font-mono font-bold text-[var(--accent-color)] group-hover:text-[var(--bg-main)]">{currentEraId}</span>
            </motion.button>

            {currentGame && (
              <motion.button
                onClick={() => {
                  if (previousGame) {
                    router.push(previousGame.path);
                  }
                }}
                disabled={!hasPreviousGame}
                className={cn(
                  'flex items-center justify-center border-r border-b border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-main)] hover:bg-[var(--text-main)] hover:text-[var(--bg-main)] transition-colors duration-150 font-mono text-lg',
                  !hasPreviousGame && 'opacity-30 cursor-not-allowed'
                )}
                style={{
                  height: BAR_HEIGHT,
                  width: BAR_HEIGHT,
                }}
                whileHover={hasPreviousGame ? { scale: 1.05 } : {}}
                whileTap={hasPreviousGame ? { scale: 0.95 } : {}}
                aria-label="Previous game"
              >
                ←
              </motion.button>
            )}
          </div>

          {/* CENTER: Page Title (hidden when HOME) */}
          <div className="flex-1 flex items-center justify-center px-2 sm:px-4 min-w-0">
            {pageInfo.title !== 'HOME' && (
              <div className="text-xs sm:text-sm font-mono text-[var(--text-main)] uppercase tracking-wider text-center truncate">
                {pageInfo.title}
              </div>
            )}
          </div>

          {/* RIGHT: Next Button + Menu Button */}
          <div className="flex">
            {/* Next Game Button */}
            {currentGame && (
              <motion.button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (nextGame) {
                    router.push(nextGame.path);
                  } else {
                    console.warn('[SimpleGameNav] No next game found for:', currentGame.id);
                  }
                }}
                disabled={!hasNextGame}
                className={cn(
                  'flex items-center justify-center border-l border-r border-b border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-main)] hover:bg-[var(--text-main)] hover:text-[var(--bg-main)] transition-colors duration-150 font-mono text-lg',
                  !hasNextGame && 'opacity-30 cursor-not-allowed'
                )}
                style={{
                  height: BAR_HEIGHT,
                  width: BAR_HEIGHT,
                }}
                whileHover={hasNextGame ? { scale: 1.05 } : {}}
                whileTap={hasNextGame ? { scale: 0.95 } : {}}
                aria-label={`Next game: ${nextGame?.title || 'None'}`}
                type="button"
              >
                →
              </motion.button>
            )}

            {/* Menu Button */}
            <motion.button
              onClick={toggleMenu}
              className="flex items-center justify-center border-l border-b border-[var(--border-color)] bg-[var(--text-main)] text-[var(--bg-main)] hover:bg-[var(--bg-card)] hover:text-[var(--text-main)] transition-colors duration-150 font-mono"
              style={{
                height: BAR_HEIGHT,
                width: BAR_HEIGHT,
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Toggle navigation menu"
            >
              <span className="text-[10px] font-mono uppercase">MENU</span>
            </motion.button>
          </div>
        </div>
      </header>

      {/* Game Menu Overlay - Gamified Navigation */}
      <GameMenuOverlay />

      {/* Timeline Overlay */}
      <EyeTimelineOverlay
        isOpen={isTimelineOpen}
        onClose={() => setIsTimelineOpen(false)}
        currentEraId={currentEraId}
        onEraSelect={handleEraSelect}
      />
    </>
  );
};

export default SimpleGameNav;
