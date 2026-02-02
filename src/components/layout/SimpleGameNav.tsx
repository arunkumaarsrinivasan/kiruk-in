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
import { GameMenuOverlay } from './GameMenuOverlay';
import { getPageInfo } from '@/data/page-info';
import { getNextGame } from '@/data/game-navigation-data';
import { DesignSystemLab } from '@/components/ui/TimeMachine/components/DesignSystemLab';
import { DesignLabEditor, type LabDesignTokens } from '@/components/ui/TimeMachine/components/DesignLabEditor';


// ═══════════════════════════════════════════════════════════════════════════════
// PIXEL EYE COMPONENT - Reusable eye with era-based styling
// ═══════════════════════════════════════════════════════════════════════════════

interface PixelEyeProps {
  size?: number;
  eraId?: string;
  onClick?: () => void;
  className?: string;
}

const PixelEye: React.FC<PixelEyeProps> = ({ size = 52, eraId, onClick, className }) => {
  const [pupilPos, setPupilPos] = useState({ x: 0, y: 0 });
  const [isBlinking, setIsBlinking] = useState(false);
  const eyeRef = useRef<HTMLDivElement>(null);

  const cols = 13;
  const rows = 9;
  const pixelSize = Math.floor(size / cols);

  // Get era colors for eyeball styling
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
      const maxMove = pixelSize * 2;
      const moveAmount = Math.min(distance / 10, maxMove);
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
    }, 3000);
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
      className={cn('relative cursor-pointer', className)}
      onClick={onClick}
      style={{ width: cols * pixelSize, height: rows * pixelSize }}
    >
      <div
        className="absolute inset-0 grid"
        style={{
          gridTemplateColumns: `repeat(${cols}, ${pixelSize}px)`,
          gridTemplateRows: `repeat(${rows}, ${pixelSize}px)`,
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
            marginLeft: -pixelSize,
            marginTop: -pixelSize,
          }}
          animate={{ x: pupilPos.x, y: pupilPos.y }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(2, ${pixelSize}px)`,
              gridTemplateRows: `repeat(2, ${pixelSize}px)`,
            }}
          >
            <div style={{ width: pixelSize, height: pixelSize, backgroundColor: pupilColor }} />
            <div style={{ width: pixelSize, height: pixelSize, backgroundColor: pupilColor }} />
            <div style={{ width: pixelSize, height: pixelSize, backgroundColor: pupilColor }} />
            <div />
          </div>
        </motion.div>
      )}
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
                {isLabEditorOpen ? (
                  <DesignLabEditor
                    era={currentEra}
                    onApply={(tokens: LabDesignTokens) => {
                      // Apply custom tokens to CSS variables
                      const root = document.documentElement;

                      // Set CSS variables directly
                      root.style.setProperty('--bg-main', tokens.colors.background);
                      root.style.setProperty('--bg-card', tokens.colors.secondary);
                      root.style.setProperty('--text-main', tokens.colors.text);
                      root.style.setProperty('--text-muted', `${tokens.colors.text}99`);
                      root.style.setProperty('--accent-color', tokens.colors.accent);
                      root.style.setProperty('--border-color', `${tokens.colors.text}33`);
                      root.style.setProperty('--font-main', tokens.fonts.primary);
                      root.style.setProperty('--font-heading', tokens.fonts.secondary);

                      // Save to localStorage for persistence
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

                      // Update body data attribute
                      document.body.setAttribute('data-era', 'custom');

                      console.log('✅ Applied custom design tokens:', tokens);
                      setIsLabEditorOpen(false);
                    }}
                    onClose={() => setIsLabEditorOpen(false)}
                  />
                ) : (
                  <DesignSystemLab
                    era={currentEra}
                    onOpenLabEditor={() => setIsLabEditorOpen(true)}
                  />
                )}
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
          {/* LEFT: Home Eye Logo + Timeline Era + Previous Button */}
          <div className="flex">
            {/* Home Button with Eye Logo */}
            <motion.button
              onClick={() => router.push('/')}
              className="flex items-center justify-center border-r border-b border-[var(--border-color)] bg-[var(--text-main)] hover:bg-[var(--accent-color)] transition-colors duration-150"
              style={{
                height: BAR_HEIGHT,
                width: BAR_HEIGHT,
                padding: '8px',
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Go to home"
            >
              <PixelEye size={36} eraId={currentEraId} />
            </motion.button>

            {/* Timeline Era Indicator - Opens Timeline */}
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

            {/* Previous Game Button */}
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

          {/* CENTER: Simple Title */}
          <motion.div
            className="flex-1 flex items-center justify-center px-2 sm:px-4 min-w-0"
          >
            <div className="text-xs sm:text-sm font-mono text-[var(--text-main)] uppercase tracking-wider text-center">
              {pageInfo.title}
            </div>
          </motion.div>

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
