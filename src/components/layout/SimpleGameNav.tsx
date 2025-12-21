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
import Link from 'next/link';
import { GRID_SIZE, cn } from '@/lib/utils';
import { useDesignEra, DesignEra } from '@/contexts/DesignEraContext';
import { useGameMode } from '@/contexts/GameModeContext';
import { AVAILABLE_THEMES, ThemeConfig } from '@/data/portfolio-data';
import { GameMenuOverlay } from './GameMenuOverlay';

const TE_TIMING = {
  instant: 0.08,
  quick: 0.15,
};

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
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
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
const getEraPupilDesign = (eraId: string): string[][] => {
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
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
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
  const [scrollIndex, setScrollIndex] = useState(0);
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
              <FullScreenPixelEye eraId={displayEraId} size={typeof window !== 'undefined' ? Math.min(window.innerWidth, window.innerHeight) * 0.8 : 600} />
            </div>

            {/* Top Left: Stats */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="absolute top-4 left-4 pointer-events-auto bg-[var(--bg-card)]/95 backdrop-blur-md border-2 border-[var(--border-color)] p-4 z-50"
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

            {/* Top Right: Chips */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="absolute top-4 right-4 pointer-events-auto bg-[var(--bg-card)]/95 backdrop-blur-md border-2 border-[var(--border-color)] p-4 z-50 max-w-xs"
              style={{ marginTop: '80px' }}
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

            {/* Close Button - Top Right */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="absolute top-4 right-4 w-12 h-12 border-2 border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-main)] flex items-center justify-center font-mono text-xl hover:bg-[var(--text-main)] hover:text-[var(--bg-main)] transition-colors pointer-events-auto z-50"
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
            >
              ×
            </motion.button>
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
  isGameActive = false,
  currentGameId = 'snake',
  currentGameName = 'SNAKE TRAIL',
  currentGameIcon = '🐍',
  onToggleGame,
}) => {
  const { currentEraId, setEra } = useDesignEra();
  const { toggleMenu } = useGameMode();
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);
  
  const BAR_HEIGHT = GRID_SIZE * 3;

  const handleEraSelect = (eraId: string) => {
    setEra(eraId as DesignEra);
  };

  return (
    <>
      {/* Clean Minimal Header */}
      <header
        id="navigation"
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between"
        style={{ 
          height: BAR_HEIGHT,
          paddingLeft: '20px',
          paddingRight: '20px',
        }}
        role="banner"
      >
        {/* LEFT: Menu Button */}
        <motion.button
          onClick={toggleMenu}
          className="flex items-center justify-center border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--text-main)] hover:text-[var(--bg-main)] transition-colors duration-150"
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

        {/* CENTER: Eye Logo */}
        <motion.button
          onClick={() => setIsTimelineOpen(true)}
          className="flex items-center justify-center border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--text-main)] hover:text-[var(--bg-main)] transition-colors duration-150"
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

        {/* RIGHT: Spacer for balance */}
        <div style={{ width: BAR_HEIGHT }} />
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
