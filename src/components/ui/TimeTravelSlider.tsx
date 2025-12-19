'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDesignEra } from '@/contexts/DesignEraContext';
import { cn, GRID_SIZE } from '@/lib/utils';

/**
 * TimeTravelSlider - Grid-based Era Selector
 * 
 * Matches the site's Teenage Engineering-inspired grid system:
 * - Uses GRID_SIZE (20px) for all measurements
 * - Rectangular tiles with borders
 * - Hover scale effects
 * - Mono font throughout
 * - Collapsible to save space
 */

const TE_TIMING = {
  instant: 0.08,
  quick: 0.15,
};

const TimeTravelSlider: React.FC = () => {
  const { eras, currentEra, currentEraId, setEra } = useDesignEra();
  const [sliderIndex, setSliderIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync slider with era
  useEffect(() => {
    if (!eras.length) return;
    const activeIndex = Math.max(0, eras.findIndex((theme) => theme.id === currentEraId));
    setSliderIndex(activeIndex === -1 ? 0 : activeIndex);
  }, [eras, currentEraId]);

  // Keyboard navigation when expanded
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        navigateEra(-1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        navigateEra(1);
      } else if (e.key === 'Escape' && isExpanded) {
        setIsExpanded(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sliderIndex, eras, isExpanded]);

  const navigateEra = useCallback((direction: number) => {
    const newIndex = Math.max(0, Math.min(eras.length - 1, sliderIndex + direction));
    const nextEra = eras[newIndex];
    if (nextEra && newIndex !== sliderIndex) {
      setSliderIndex(newIndex);
      setEra(nextEra.id);
    }
  }, [sliderIndex, eras, setEra]);

  const handleTickClick = (index: number) => {
    const nextEra = eras[index];
    if (nextEra) {
      setSliderIndex(index);
      setEra(nextEra.id);
    }
  };

  if (!mounted || !eras.length) {
    return null;
  }

  const eraName = currentEra.name?.split(': ')[1] ?? currentEra.name ?? 'Era';

  // Grid-aligned dimensions
  const BAR_HEIGHT = GRID_SIZE * 3; // 60px - matches header
  const COLLAPSED_WIDTH = GRID_SIZE * 8; // 160px
  const ERA_TILE_WIDTH = GRID_SIZE * 2.5; // 50px per era tile
  const CONTROL_WIDTH = GRID_SIZE * 2; // 40px for nav buttons

  return (
    <div
      className="fixed bottom-0 left-1/2 z-[9999] pointer-events-auto"
      style={{ transform: 'translateX(-50%)' }}
    >
      <AnimatePresence mode="wait">
        {!isExpanded ? (
          /* Collapsed State - Single Tile */
          <motion.div
            key="collapsed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: TE_TIMING.quick }}
            className="flex"
          >
            {/* Previous Era Button */}
            <motion.button
              className={cn(
                'flex items-center justify-center',
                'bg-[var(--bg-card)] text-[var(--text-main)]',
                'border border-[var(--border-color)]',
                'cursor-pointer select-none',
                'hover:bg-[var(--text-main)] hover:text-[var(--bg-main)]',
                'transition-colors duration-100'
              )}
              style={{ width: CONTROL_WIDTH, height: BAR_HEIGHT }}
              onClick={() => navigateEra(-1)}
              disabled={sliderIndex === 0}
              whileHover={{ scale: 0.95 }}
              whileTap={{ scale: 0.9 }}
              transition={{ duration: TE_TIMING.instant }}
              aria-label="Previous era"
            >
              <span className="text-lg font-mono">◀</span>
            </motion.button>

            {/* Main Era Display - Clickable to expand */}
            <motion.button
              className={cn(
                'flex flex-col items-center justify-center',
                'bg-[var(--text-main)] text-[var(--bg-main)]',
                'border border-[var(--border-color)]',
                'cursor-pointer select-none',
                'hover:bg-[var(--accent-color)]',
                'transition-colors duration-100'
              )}
              style={{ width: COLLAPSED_WIDTH, height: BAR_HEIGHT }}
              onClick={() => setIsExpanded(true)}
              whileHover={{ scale: 0.98 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: TE_TIMING.instant }}
              aria-label="Expand timeline"
              aria-expanded={isExpanded}
            >
              {/* Index indicator */}
              <span className="absolute top-1 left-2 text-[7px] font-mono opacity-50">
                {String(sliderIndex + 1).padStart(2, '0')}/{String(eras.length).padStart(2, '0')}
              </span>
              
              {/* Era Year */}
              <AnimatePresence mode="wait">
                <motion.span
                  key={currentEraId}
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="text-2xl font-mono font-bold"
                >
                  {currentEraId}
                </motion.span>
              </AnimatePresence>
              
              {/* Era Name */}
              <AnimatePresence mode="wait">
                <motion.span
                  key={eraName}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-[8px] font-mono uppercase tracking-wider mt-0.5 opacity-70"
                >
                  {eraName.slice(0, 12)}
                </motion.span>
              </AnimatePresence>

              {/* Expand hint */}
              <span className="absolute bottom-1 text-[6px] font-mono opacity-40">
                ▲ EXPAND
              </span>
            </motion.button>

            {/* Next Era Button */}
            <motion.button
              className={cn(
                'flex items-center justify-center',
                'bg-[var(--bg-card)] text-[var(--text-main)]',
                'border border-[var(--border-color)]',
                'cursor-pointer select-none',
                'hover:bg-[var(--text-main)] hover:text-[var(--bg-main)]',
                'transition-colors duration-100'
              )}
              style={{ width: CONTROL_WIDTH, height: BAR_HEIGHT }}
              onClick={() => navigateEra(1)}
              disabled={sliderIndex === eras.length - 1}
              whileHover={{ scale: 0.95 }}
              whileTap={{ scale: 0.9 }}
              transition={{ duration: TE_TIMING.instant }}
              aria-label="Next era"
            >
              <span className="text-lg font-mono">▶</span>
            </motion.button>
          </motion.div>
        ) : (
          /* Expanded State - Full Timeline Grid */
          <motion.div
            key="expanded"
            initial={{ opacity: 0, y: 20, scaleX: 0.8 }}
            animate={{ opacity: 1, y: 0, scaleX: 1 }}
            exit={{ opacity: 0, y: 10, scaleX: 0.8 }}
            transition={{ duration: TE_TIMING.quick }}
            className="flex"
          >
            {/* Collapse Button */}
            <motion.button
              className={cn(
                'flex flex-col items-center justify-center',
                'bg-[var(--bg-card)] text-[var(--text-main)]',
                'border border-[var(--border-color)]',
                'cursor-pointer select-none',
                'hover:bg-[var(--text-main)] hover:text-[var(--bg-main)]',
                'transition-colors duration-100'
              )}
              style={{ width: CONTROL_WIDTH, height: BAR_HEIGHT }}
              onClick={() => setIsExpanded(false)}
              whileHover={{ scale: 0.95 }}
              whileTap={{ scale: 0.9 }}
              transition={{ duration: TE_TIMING.instant }}
              aria-label="Collapse timeline"
            >
              <span className="text-lg font-mono">▼</span>
              <span className="text-[6px] font-mono mt-0.5 opacity-50">ESC</span>
            </motion.button>

            {/* Era Tiles */}
            <div className="flex">
              {eras.map((era, index) => {
                const isActive = era.id === currentEraId;
                const isPast = index < sliderIndex;
                
                return (
                  <motion.button
                    key={era.id}
                    onClick={() => handleTickClick(index)}
                    className={cn(
                      'relative flex flex-col items-center justify-center',
                      'border border-[var(--border-color)]',
                      'cursor-pointer select-none',
                      'transition-colors duration-100',
                      isActive 
                        ? 'bg-[var(--text-main)] text-[var(--bg-main)]' 
                        : isPast
                          ? 'bg-[var(--accent-color)]/20 text-[var(--text-main)] hover:bg-[var(--text-main)] hover:text-[var(--bg-main)]'
                          : 'bg-[var(--bg-card)] text-[var(--text-muted)] hover:bg-[var(--text-main)] hover:text-[var(--bg-main)]'
                    )}
                    style={{ width: ERA_TILE_WIDTH, height: BAR_HEIGHT }}
                    whileHover={{ scale: 0.95 }}
                    whileTap={{ scale: 0.9 }}
                    transition={{ duration: TE_TIMING.instant }}
                    aria-label={`${era.id}: ${era.name}`}
                    aria-current={isActive ? 'true' : undefined}
                  >
                    {/* Index */}
                    <span className="absolute top-0.5 left-1 text-[6px] font-mono opacity-40">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    
                    {/* Year */}
                    <span 
                      className="font-mono font-bold"
                      style={{ fontSize: isActive ? 14 : 11 }}
                    >
                      {era.id}
                    </span>
                    
                    {/* Progress dot */}
                    {isPast && !isActive && (
                      <span className="absolute bottom-1 text-[8px]">●</span>
                    )}
                    {isActive && (
                      <motion.span 
                        className="absolute bottom-1 text-[8px]"
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 0.6, repeat: Infinity }}
                      >
                        ◆
                      </motion.span>
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* Current Era Info Panel */}
            <div 
              className="flex flex-col justify-center bg-[var(--bg-card)] border border-[var(--border-color)] px-3"
              style={{ width: GRID_SIZE * 6, height: BAR_HEIGHT }}
            >
              <span className="text-[7px] font-mono uppercase tracking-wider text-[var(--text-muted)]">
                CURRENT ERA
              </span>
              <AnimatePresence mode="wait">
                <motion.span
                  key={eraName}
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 5 }}
                  className="text-[10px] font-mono text-[var(--text-main)] leading-tight mt-0.5"
                >
                  {eraName}
                </motion.span>
              </AnimatePresence>
              <span className="text-[7px] font-mono text-[var(--text-muted)] mt-1">
                ← → to navigate
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TimeTravelSlider;
