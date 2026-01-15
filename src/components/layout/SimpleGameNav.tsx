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

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import { GRID_SIZE, cn } from '@/lib/utils';
import { useDesignEra } from '@/contexts/DesignEraContext';
import { useGameMode, PAGE_GAMES, GAME_TYPE_ICONS } from '@/contexts/GameModeContext';
import { PixelIcon } from '@/components/ui/PixelIcon';
import { AVAILABLE_THEMES, ThemeConfig } from '@/data/portfolio-data';
import { GameMenuOverlay } from './GameMenuOverlay';
import { getPageInfo } from '@/data/page-info';
import { getNextGame } from '@/data/game-navigation-data';


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
      setPupilPos({
        x: Math.cos(angle) * moveAmount,
        y: Math.sin(angle) * moveAmount,
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
      setPupilPos({
        x: Math.cos(angle) * moveAmount,
        y: Math.sin(angle) * moveAmount,
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
  const displayEraId = hoveredEra || currentEraId;

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
  const totalDecades = new Set(AVAILABLE_THEMES.map(e => `${Math.floor(parseInt(e.id) / 10) * 10}s`)).size;
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
            {/* Full Screen Eye - Positioned to leave space for minimal timeline */}
            <div className="absolute inset-0 flex items-center justify-center" style={{ paddingBottom: '120px' }}>
              <FullScreenPixelEye eraId={displayEraId} size={typeof globalThis !== 'undefined' ? Math.min(globalThis.innerWidth, globalThis.innerHeight) * 0.8 : 600} />
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

            {/* Top Right: Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="absolute top-4 right-4 pointer-events-auto bg-[var(--bg-card)]/95 backdrop-blur-md border-2 border-[var(--border-color)] p-4 z-50"
            >
              <div className="space-y-2">
                <div className="text-xs font-mono text-[var(--text-muted)] uppercase">Stats</div>
                <div className="text-sm font-mono font-bold text-[var(--text-main)]">
                  {currentEraIndex + 1} / {totalEras}
                </div>
                <div className="text-xs font-mono text-[var(--text-muted)]">
                  {totalDecades} Decades
                </div>
                <div className="text-xs font-mono text-[var(--accent-color)]">
                  {currentDecade}
                </div>
              </div>
            </motion.div>

            {/* Top Right: Chips - Below Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="absolute top-4 right-4 pointer-events-auto bg-[var(--bg-card)]/95 backdrop-blur-md border-2 border-[var(--border-color)] p-4 z-50 max-w-xs"
              style={{ marginTop: '120px' }}
            >
              <div className="text-xs font-mono text-[var(--text-muted)] uppercase mb-2">Key Elements</div>
              <div className="flex flex-wrap gap-1.5">
                {currentEra.keyElements && currentEra.keyElements.map((element, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 text-[10px] font-mono uppercase border border-[var(--accent-color)] text-[var(--accent-color)] bg-[var(--accent-color)]/10"
                  >
                    {element}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Minimal Playable Timeline - Bottom */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ delay: 0.2 }}
              className="absolute bottom-0 left-0 right-0 pointer-events-auto bg-[var(--bg-card)]/95 backdrop-blur-md border-t-2 border-[var(--border-color)] p-4 z-50"
            >
              {/* Timeline Visualization Bar - Clickable */}
              <div className="relative h-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] mb-4 cursor-pointer">
                {AVAILABLE_THEMES.map((era) => {
                  const position = getEraPosition(era);
                  const isActive = era.id === currentEraId;
                  return (
                    <motion.div
                      key={era.id}
                      className="absolute top-0 h-full cursor-pointer group"
                      style={{
                        left: `${position}%`,
                        width: `${100 / totalEras}%`,
                      }}
                      onClick={() => handleEraClick(era.id)}
                      onMouseEnter={() => setHoveredEra(era.id)}
                      onMouseLeave={() => setHoveredEra(null)}
                      whileHover={{ scaleY: 1.8 }}
                    >
                      <div
                        className={cn(
                          'w-full h-full transition-colors',
                          isActive ? 'bg-[var(--accent-color)]' : 'bg-[var(--text-muted)]/50 group-hover:bg-[var(--text-muted)]'
                        )}
                      />
                      {/* Era label on hover */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-[var(--bg-card)] border border-[var(--border-color)] text-[10px] font-mono text-[var(--text-main)] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        {era.id}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
              
              {/* Minimal Era Info with Navigation */}
              <div className="flex items-center justify-between gap-4">
                {/* Previous Button */}
                <motion.button
                  onClick={navigatePrevious}
                  disabled={currentEraIndex === 0}
                  className={cn(
                    'w-10 h-10 border-2 border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-main)] flex items-center justify-center font-mono text-lg hover:bg-[var(--text-main)] hover:text-[var(--bg-main)] transition-colors flex-shrink-0',
                    currentEraIndex === 0 && 'opacity-30 cursor-not-allowed'
                  )}
                  whileHover={currentEraIndex > 0 ? { scale: 1.1 } : {}}
                  whileTap={currentEraIndex > 0 ? { scale: 0.9 } : {}}
                >
                  ←
                </motion.button>

                {/* Current Era Info - Minimal */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentEraId}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="flex-1 text-center cursor-pointer"
                    onClick={() => {
                      // Cycle through eras on click
                      if (currentEraIndex < AVAILABLE_THEMES.length - 1) {
                        navigateNext();
                      } else {
                        onEraSelect(AVAILABLE_THEMES[0].id);
                      }
                    }}
                  >
                    <div className="text-xs font-mono text-[var(--text-muted)] uppercase mb-1">
                      {currentDecade}
                    </div>
                    <div className="font-mono font-bold text-base text-[var(--text-main)] mb-1">
                      {currentEra.name}
                    </div>
                    <div className="text-xs font-mono text-[var(--text-muted)]">
                      {currentEra.era}
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Next Button */}
                <motion.button
                  onClick={navigateNext}
                  disabled={currentEraIndex === AVAILABLE_THEMES.length - 1}
                  className={cn(
                    'w-10 h-10 border-2 border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-main)] flex items-center justify-center font-mono text-lg hover:bg-[var(--text-main)] hover:text-[var(--bg-main)] transition-colors flex-shrink-0',
                    currentEraIndex === AVAILABLE_THEMES.length - 1 && 'opacity-30 cursor-not-allowed'
                  )}
                  whileHover={currentEraIndex < AVAILABLE_THEMES.length - 1 ? { scale: 1.1 } : {}}
                  whileTap={currentEraIndex < AVAILABLE_THEMES.length - 1 ? { scale: 0.9 } : {}}
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
    progress, 
    getGameProgress, 
    isLevelCompleted,
    totalPossibleXP,
    currentXPPercentage,
  } = useGameMode();
  const pathname = usePathname();
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);
  const [showMissionDetails, setShowMissionDetails] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  const BAR_HEIGHT = GRID_SIZE * 3;

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const router = useRouter();
  const handleEraSelect = (eraId: string) => {
    setEra(eraId);
  };

  // Get current page game/mission
  const currentGame = PAGE_GAMES.find(game => game.path === pathname);
  const pageInfo = getPageInfo(pathname);
  const gameProgress = currentGame ? getGameProgress(currentGame.id) : 0;
  const completedLevels = currentGame ? (progress.completedLevels[currentGame.id] || []) : [];
  const totalLevels = currentGame ? currentGame.levels.length : 0;
  const gameTypeIcon = currentGame ? GAME_TYPE_ICONS[currentGame.gameType] : 'flag-checkered';

  // Calculate current level index (first incomplete level, or last completed + 1)
  const currentLevelIndex = currentGame
    ? currentGame.levels.findIndex(level => !completedLevels.includes(level.id))
    : -1;
  const effectiveLevelIndex = currentLevelIndex >= 0 ? currentLevelIndex : totalLevels - 1;
  const _currentLevel = currentGame && effectiveLevelIndex >= 0 && effectiveLevelIndex < totalLevels
    ? currentGame.levels[effectiveLevelIndex]
    : null;

  // Get next/previous games (pages) for navigation
  const nextGame = currentGame ? getNextGame(currentGame.id) : null;
  const previousGame = currentGame && currentGame.order > 1
    ? PAGE_GAMES.find(game => game.order === currentGame.order - 1)
    : null;
  
  const hasNextGame = nextGame !== null;
  const hasPreviousGame = previousGame !== null;

  return (
    <>
      {/* Enhanced Gaming Header */}
      <header
        id="navigation"
        className="fixed top-0 left-0 right-0 z-50 border-b-2 border-[var(--border-color)] bg-[var(--bg-card)]/95 backdrop-blur-md"
        style={{ 
          height: BAR_HEIGHT * 2,
        }}
        role="banner"
      >
        {/* Top Row: Main Navigation */}
        <div className="flex items-center justify-between h-full" style={{ height: BAR_HEIGHT }}>
          {/* LEFT: Eye Logo + Previous Button (merged) */}
          <div className="flex">
            <motion.button
              onClick={() => setIsTimelineOpen(true)}
              className="flex items-center justify-center border-r border-b border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--text-main)] hover:text-[var(--bg-main)] transition-colors duration-150"
              style={{ 
                height: BAR_HEIGHT,
                width: BAR_HEIGHT,
                padding: '8px',
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Open design era timeline"
            >
              <PixelEye size={36} eraId={currentEraId} />
            </motion.button>
            
            {/* Previous Game Button - Merged with Eye Logo */}
            {currentGame && (
              <motion.button
                onClick={() => {
                  if (previousGame) {
                    router.push(previousGame.path);
                  }
                }}
                disabled={!hasPreviousGame}
                className={cn(
                  'flex items-center justify-center border-l border-r border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-main)] hover:bg-[var(--text-main)] hover:text-[var(--bg-main)] transition-colors duration-150 font-mono text-lg',
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

          {/* CENTER: Mission Info */}
          <motion.div
            className="flex-1 flex items-center justify-center gap-2 sm:gap-3 px-2 sm:px-4 min-w-0"
            onHoverStart={() => setShowMissionDetails(true)}
            onHoverEnd={() => setShowMissionDetails(false)}
          >
            {currentGame ? (
              <>
                <PixelIcon name={gameTypeIcon} size={24} className="flex-shrink-0" />
                <div className="flex flex-col items-center min-w-0">
                  <div className="text-[10px] sm:text-xs font-mono text-[var(--text-muted)] uppercase tracking-wider truncate w-full text-center">
                    MISSION: {currentGame.title}
                  </div>
                  <div className="text-[9px] sm:text-[10px] font-mono text-[var(--accent-color)] truncate w-full text-center">
                    {currentGame.subtitle}
                  </div>
                </div>
                <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                  <div className="text-[10px] sm:text-xs font-mono text-[var(--text-main)]">
                    {completedLevels.length}/{totalLevels}
                  </div>
                  <div className="w-12 sm:w-20 h-1.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] relative overflow-hidden">
                    <motion.div
                      className="absolute inset-y-0 left-0 bg-[var(--accent-color)]"
                      initial={{ width: 0 }}
                      animate={{ width: `${gameProgress}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <span className="text-lg sm:text-xl flex-shrink-0">📍</span>
                <div className="flex flex-col items-center min-w-0">
                  <div className="text-[10px] sm:text-xs font-mono text-[var(--text-muted)] uppercase tracking-wider truncate w-full text-center">
                    {pageInfo.title}
                  </div>
                  <div className="text-[9px] sm:text-[10px] font-mono text-[var(--text-muted)] truncate w-full text-center hidden sm:block">
                    {pageInfo.description}
                  </div>
                </div>
              </>
            )}
          </motion.div>

          {/* RIGHT: Next Button + XP Display + Menu Button (merged) */}
          <div className="flex">
            {/* Next Game Button - Merged with XP Display */}
            {currentGame && (
              <motion.button
                onClick={() => {
                  if (nextGame) {
                    router.push(nextGame.path);
                  }
                }}
                disabled={!hasNextGame}
                className={cn(
                  'flex items-center justify-center border-l border-r border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-main)] hover:bg-[var(--text-main)] hover:text-[var(--bg-main)] transition-colors duration-150 font-mono text-lg',
                  !hasNextGame && 'opacity-30 cursor-not-allowed'
                )}
                style={{ 
                  height: BAR_HEIGHT,
                  width: BAR_HEIGHT,
                }}
                whileHover={hasNextGame ? { scale: 1.05 } : {}}
                whileTap={hasNextGame ? { scale: 0.95 } : {}}
                aria-label="Next game"
              >
                →
              </motion.button>
            )}

            {/* XP Display - Hidden on very small screens */}
            <div className="hidden sm:flex flex-col items-end justify-center px-2 border-r border-b border-[var(--border-color)] bg-[var(--bg-card)]"
              style={{ height: BAR_HEIGHT }}
            >
              <div className="text-[10px] font-mono text-[var(--text-muted)] uppercase">XP</div>
              <div className="text-xs font-mono font-bold text-[var(--accent-color)]">
                {progress.totalXP}/{totalPossibleXP}
              </div>
              <div className="w-16 h-1 bg-[var(--bg-secondary)] border border-[var(--border-color)] relative overflow-hidden">
                <motion.div
                  className="absolute inset-y-0 left-0 bg-[var(--accent-color)]"
                  initial={{ width: 0 }}
                  animate={{ width: `${currentXPPercentage}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
            
            {/* Menu Button */}
            <motion.button
              onClick={toggleMenu}
              className="flex items-center justify-center border-l border-b border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--text-main)] hover:text-[var(--bg-main)] transition-colors duration-150"
              style={{ 
                height: BAR_HEIGHT,
                width: BAR_HEIGHT,
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Toggle navigation menu"
            >
              <span className="text-lg font-mono">☰</span>
            </motion.button>
          </div>
        </div>

        {/* Bottom Row: Mission Checklist */}
        {currentGame && (
          <motion.div
            className="flex items-center gap-1 sm:gap-2 px-1 sm:px-2 border-t border-[var(--border-color)] bg-[var(--bg-secondary)]/50"
            style={{ height: BAR_HEIGHT }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: showMissionDetails ? 1 : 0.7, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="text-[9px] sm:text-[10px] font-mono text-[var(--text-muted)] uppercase flex-shrink-0 hidden sm:block">
              OBJECTIVES:
            </div>
            <div className="flex-1 flex items-center gap-1 sm:gap-1.5 overflow-x-auto scrollbar-hide">
              {currentGame.levels.slice(0, isMobile ? 3 : 5).map((level, idx) => {
                const isCompleted = isLevelCompleted(currentGame.id, level.id);
                return (
                  <motion.div
                    key={level.id}
                    className={cn(
                      "flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 border text-[8px] sm:text-[9px] font-mono whitespace-nowrap flex-shrink-0",
                      isCompleted
                        ? "bg-[var(--accent-color)]/20 border-[var(--accent-color)] text-[var(--accent-color)]"
                        : "bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-muted)]"
                    )}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <span>{isCompleted ? '✓' : '○'}</span>
                    <span className="truncate max-w-[60px] sm:max-w-[80px]">{level.name}</span>
                  </motion.div>
                );
              })}
              {currentGame.levels.length > (isMobile ? 3 : 5) && (
                <div className="text-[8px] sm:text-[9px] font-mono text-[var(--text-muted)] px-1 sm:px-2">
                  +{currentGame.levels.length - (isMobile ? 3 : 5)} more
                </div>
              )}
            </div>
            <div className="text-[9px] sm:text-[10px] font-mono text-[var(--accent-color)] flex-shrink-0">
              {gameProgress}%
            </div>
          </motion.div>
        )}
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
