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
import { AVAILABLE_THEMES, ThemeConfig } from '@/data/portfolio-data';
import dynamic from 'next/dynamic';
import { GameMenuOverlay } from './GameMenuOverlay';
import { getPageInfo } from '@/data/page-info';
import { getNextGame } from '@/data/game-navigation-data';
import type { LabDesignTokens } from '@/components/ui/TimeMachine/components/DesignLabEditor';

const SimpleGameNavEraOverlayContent = dynamic(
  () => import('./SimpleGameNavEraOverlayContent').then((m) => ({ default: m.SimpleGameNavEraOverlayContent })),
  { ssr: false }
);


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

const EyeTimelineOverlay: React.FC<EyeTimelineOverlayProps> = ({
  isOpen,
  onClose,
  currentEraId,
  onEraSelect
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [hoveredEra, setHoveredEra] = useState<string | null>(null);
  const [isLabEditorOpen, setIsLabEditorOpen] = useState(false);
  const _displayEraId = hoveredEra || currentEraId;

  // Get current era index
  const currentEraIndex = AVAILABLE_THEMES.findIndex(e => e.id === currentEraId);
  const currentEra = AVAILABLE_THEMES[currentEraIndex] || AVAILABLE_THEMES[0];

  // Navigation functions
  const navigatePrevious = () => {
    if (currentEraIndex > 0) {
      const prevEra = AVAILABLE_THEMES[currentEraIndex - 1];
      onEraSelect(prevEra.id);
    }
  };

  const navigateNext = () => {
    if (currentEraIndex < AVAILABLE_THEMES.length - 1) {
      const nextEra = AVAILABLE_THEMES[currentEraIndex + 1];
      onEraSelect(nextEra.id);
    }
  };

  const handleEraClick = (eraId: string) => {
    onEraSelect(eraId);
  };

  // Calculate timeline position for visualization
  const totalEras = AVAILABLE_THEMES.length;
  const getEraPosition = (era: ThemeConfig) => {
    const index = AVAILABLE_THEMES.findIndex(e => e.id === era.id);
    return (index / (totalEras - 1)) * 100;
  };

  // Stats calculations
  const _totalDecades = new Set(AVAILABLE_THEMES.map(e => `${Math.floor(parseInt(e.id) / 10) * 10}s`)).size;
  const currentDecade = `${Math.floor(parseInt(currentEraId) / 10) * 10}s`;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100] pointer-events-none"
          />

          {/* Full Screen Eye Container */}
          <div
            ref={overlayRef}
            className="fixed inset-0 z-[101] pointer-events-none"
          >
            {/* Design System Lab / Lab Editor */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-auto" style={{ paddingBottom: '180px', paddingTop: '80px' }}>
              <div className="w-full max-w-3xl h-full max-h-[550px] p-4">
                <SimpleGameNavEraOverlayContent
                  era={currentEra}
                  isLabEditorOpen={isLabEditorOpen}
                  onOpenLabEditor={() => setIsLabEditorOpen(true)}
                  onApply={(tokens: LabDesignTokens) => {
                    const root = document.documentElement;
                    root.style.setProperty('--bg-main', tokens.colors.background);
                    root.style.setProperty('--bg-card', tokens.colors.secondary);
                    root.style.setProperty('--text-main', tokens.colors.text);
                    root.style.setProperty('--text-muted', `${tokens.colors.text}99`);
                    root.style.setProperty('--accent-color', tokens.colors.accent);
                    root.style.setProperty('--border-color', `${tokens.colors.text}33`);
                    root.style.setProperty('--font-main', tokens.fonts.primary);
                    root.style.setProperty('--font-heading', tokens.fonts.secondary);
                    const customEra = {
                      id: 'custom',
                      name: 'Lab Design',
                      bgMain: tokens.colors.background,
                      bgCard: tokens.colors.secondary,
                      textMain: tokens.colors.text,
                      textMuted: `${tokens.colors.text}99`,
                      accentColor: tokens.colors.accent,
                      borderColor: `${tokens.colors.text}33`,
                      gridColor: tokens.colors.primary,
                      fontMain: tokens.fonts.primary,
                      fontHeading: tokens.fonts.secondary,
                      gridSize: 20,
                      gridOpacity: 50,
                    };
                    localStorage.setItem('kiruk-custom-era', JSON.stringify(customEra));
                    localStorage.setItem('portfolio-theme', 'custom');
                    document.body.setAttribute('data-era', 'custom');
                    setIsLabEditorOpen(false);
                  }}
                  onCloseLabEditor={() => setIsLabEditorOpen(false)}
                />
              </div>
            </div>

            {/* Top Left: Close Button */}
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="absolute top-4 left-4 w-12 h-12 border-2 border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-main)] flex items-center justify-center font-mono text-xl hover:bg-[var(--text-main)] hover:text-[var(--bg-main)] transition-colors pointer-events-auto z-50"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              ×
            </motion.button>

            {/* Redesigned Timeline Navigation - Bottom */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ delay: 0.2 }}
              className="absolute bottom-0 left-0 right-0 pointer-events-auto bg-[var(--bg-card)]/98 backdrop-blur-md border-t-2 border-[var(--border-color)] z-50"
            >
              {/* Wireframe-style Header with Instructions */}
              <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--border-color)]/50">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[var(--accent-color)] animate-pulse" />
                  <span className="text-[10px] font-mono uppercase text-[var(--text-muted)] tracking-wider">
                    {/* TIME_MACHINE.v1 */}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-mono text-[var(--text-muted)]">
                    ← → Navigate • Click to Select • Design System Preview Above
                  </span>
                  <span className="text-[10px] font-mono font-bold text-[var(--accent-color)]">
                    {currentEraIndex + 1}/{totalEras} ERAS
                  </span>
                </div>
              </div>

              {/* Timeline Slider with Year Labels */}
              <div className="px-4 pt-3 pb-2">
                {/* Year Range Labels */}
                <div className="flex justify-between mb-1">
                  <span className="text-[9px] font-mono text-[var(--text-muted)]">1970</span>
                  <span className="text-[9px] font-mono text-[var(--text-muted)]">1980</span>
                  <span className="text-[9px] font-mono text-[var(--text-muted)]">1990</span>
                  <span className="text-[9px] font-mono text-[var(--text-muted)]">2000</span>
                  <span className="text-[9px] font-mono text-[var(--text-muted)]">2010</span>
                  <span className="text-[9px] font-mono text-[var(--text-muted)]">2020</span>
                </div>

                {/* Timeline Bar */}
                <div className="relative h-3 bg-[var(--bg-main)] border border-[var(--border-color)] cursor-pointer">
                  {/* Progress Fill */}
                  <div
                    className="absolute top-0 left-0 h-full bg-[var(--accent-color)]/20 transition-all"
                    style={{ width: `${(currentEraIndex / (totalEras - 1)) * 100}%` }}
                  />
                  {/* Era Markers */}
                  {AVAILABLE_THEMES.map((era) => {
                    const position = getEraPosition(era);
                    const isActive = era.id === currentEraId;
                    const isHovered = era.id === hoveredEra;
                    return (
                      <motion.div
                        key={era.id}
                        className="absolute top-0 h-full cursor-pointer"
                        style={{
                          left: `${position}%`,
                          width: `${100 / totalEras}%`,
                        }}
                        onClick={() => handleEraClick(era.id)}
                        onMouseEnter={() => setHoveredEra(era.id)}
                        onMouseLeave={() => setHoveredEra(null)}
                      >
                        <div
                          className={cn(
                            'w-full h-full transition-all border-r border-[var(--border-color)]/30',
                            isActive ? 'bg-[var(--accent-color)]' : isHovered ? 'bg-[var(--text-main)]/40' : 'bg-transparent hover:bg-[var(--text-main)]/20'
                          )}
                        />
                      </motion.div>
                    );
                  })}
                  {/* Current Position Marker */}
                  <motion.div
                    className="absolute top-1/2 -translate-y-1/2 w-3 h-3 border-2 border-[var(--accent-color)] bg-[var(--bg-main)] z-10"
                    style={{ left: `calc(${(currentEraIndex / (totalEras - 1)) * 100}% - 6px)` }}
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>
              </div>

              {/* Current Era Info + Navigation */}
              <div className="flex items-center gap-4 px-4 pb-3">
                {/* Previous Button */}
                <motion.button
                  onClick={navigatePrevious}
                  disabled={currentEraIndex === 0}
                  className={cn(
                    'w-10 h-10 border-2 border-[var(--border-color)] bg-[var(--bg-main)] text-[var(--text-main)] flex items-center justify-center font-mono text-lg transition-all flex-shrink-0',
                    currentEraIndex === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-[var(--accent-color)] hover:text-[var(--bg-main)] hover:border-[var(--accent-color)]'
                  )}
                  whileHover={currentEraIndex > 0 ? { scale: 1.05 } : {}}
                  whileTap={currentEraIndex > 0 ? { scale: 0.95 } : {}}
                >
                  ←
                </motion.button>

                {/* Current Era Display */}
                <div className="flex-1 bg-[var(--bg-main)] border border-[var(--border-color)] p-3">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentEraId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-mono text-[var(--accent-color)] uppercase">{currentDecade}</span>
                          <span className="text-[9px] font-mono text-[var(--text-muted)]">{currentEra.style.toUpperCase()}</span>
                        </div>
                        <div className="font-mono font-bold text-sm text-[var(--text-main)]">
                          {currentEra.name}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[9px] font-mono text-[var(--text-muted)] uppercase">{currentEra.era}</div>
                        <div className="text-[10px] font-mono text-[var(--accent-color)]">
                          "{currentEra.lesson?.substring(0, 30)}..."
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Next Button */}
                <motion.button
                  onClick={navigateNext}
                  disabled={currentEraIndex === AVAILABLE_THEMES.length - 1}
                  className={cn(
                    'w-10 h-10 border-2 border-[var(--border-color)] bg-[var(--bg-main)] text-[var(--text-main)] flex items-center justify-center font-mono text-lg transition-all flex-shrink-0',
                    currentEraIndex === AVAILABLE_THEMES.length - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-[var(--accent-color)] hover:text-[var(--bg-main)] hover:border-[var(--accent-color)]'
                  )}
                  whileHover={currentEraIndex < AVAILABLE_THEMES.length - 1 ? { scale: 1.05 } : {}}
                  whileTap={currentEraIndex < AVAILABLE_THEMES.length - 1 ? { scale: 0.95 } : {}}
                >
                  →
                </motion.button>
              </div>
            </motion.div>

          </div>
        </>
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
