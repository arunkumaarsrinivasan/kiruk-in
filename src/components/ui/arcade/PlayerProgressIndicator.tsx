'use client';

/**
 * PlayerProgressIndicator Component
 * 
 * Shows the player's exploration progress with:
 * - Current level and title
 * - XP/Points earned
 * - Tiles explored count
 * - Progress bar to next level
 * 
 * This provides meaningful feedback and gamified sense of progression.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, GRID_SIZE } from '@/lib/utils';
import { calculateProgress, type PlayerProgress } from './grid-tile-types';

// Pixel Icon component
const PixelIcon = ({ name, size = 16, className }: { name: string; size?: number; className?: string }) => {
  const ICON_PATHS: Record<string, string> = {
    'trophy': 'solid/trophy-solid.svg',
    'star': 'solid/star-solid.svg',
    'chart': 'solid/chart-line-solid.svg',
  };
  
  const iconPath = ICON_PATHS[name];
  if (!iconPath) return <span className="font-mono" style={{ fontSize: size }}>?</span>;

  return (
    <span
      className={cn('inline-block', className)}
      style={{
        width: size,
        height: size,
        backgroundColor: 'currentColor',
        WebkitMaskImage: `url(/icons/${iconPath})`,
        WebkitMaskSize: 'contain',
        WebkitMaskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center',
        maskImage: `url(/icons/${iconPath})`,
        maskSize: 'contain',
        maskRepeat: 'no-repeat',
        maskPosition: 'center',
      }}
    />
  );
};

interface PlayerProgressIndicatorProps {
  tilesExplored?: number;
  totalPoints?: number;
  className?: string;
  compact?: boolean;
}

export const PlayerProgressIndicator: React.FC<PlayerProgressIndicatorProps> = ({
  tilesExplored: propTiles,
  totalPoints: propPoints,
  className,
  compact = false,
}) => {
  // Use localStorage to persist progress
  const [progress, setProgress] = useState<PlayerProgress>({
    tilesExplored: 0,
    totalPoints: 0,
    level: 1,
    title: 'Curious Visitor',
    nextLevelAt: 5,
  });
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [prevLevel, setPrevLevel] = useState(1);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('playerProgress');
    if (stored) {
      try {
        const { tilesExplored, totalPoints } = JSON.parse(stored);
        const newProgress = calculateProgress(tilesExplored, totalPoints);
        setProgress(newProgress);
        setPrevLevel(newProgress.level);
      } catch {
        // Ignore parse errors
      }
    }
  }, []);

  // Update when props change
  useEffect(() => {
    if (propTiles !== undefined || propPoints !== undefined) {
      const tiles = propTiles ?? progress.tilesExplored;
      const points = propPoints ?? progress.totalPoints;
      
      const newProgress = calculateProgress(tiles, points);
      
      // Check for level up
      if (newProgress.level > prevLevel) {
        setShowLevelUp(true);
        setTimeout(() => setShowLevelUp(false), 3000);
        setPrevLevel(newProgress.level);
      }
      
      setProgress(newProgress);
      
      // Save to localStorage
      localStorage.setItem('playerProgress', JSON.stringify({
        tilesExplored: tiles,
        totalPoints: points,
      }));
    }
  }, [propTiles, propPoints, prevLevel, progress.tilesExplored, progress.totalPoints]);

  const progressToNextLevel = progress.nextLevelAt > progress.tilesExplored
    ? ((progress.tilesExplored) / progress.nextLevelAt) * 100
    : 100;

  const BAR_HEIGHT = GRID_SIZE * 3;

  if (compact) {
    return (
      <div className={cn('flex items-center gap-1', className)}>
        {/* Level badge */}
        <div 
          className="flex items-center justify-center bg-[var(--accent-color)] text-[var(--bg-main)] px-2 py-1 font-mono text-[10px] font-bold"
          title={`Level ${progress.level}: ${progress.title}`}
        >
          LV{progress.level}
        </div>
        {/* Points */}
        <div 
          className="flex items-center gap-1 bg-[var(--bg-card)] border border-[var(--border-color)] px-2 py-1"
          title={`${progress.totalPoints} points earned`}
        >
          <span className="text-[10px]">⭐</span>
          <span className="font-mono text-[10px] font-bold">{progress.totalPoints}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('relative', className)}>
      {/* Main Progress Panel */}
      <div 
        className="flex items-center bg-[var(--bg-card)] border border-[var(--border-color)]"
        style={{ height: BAR_HEIGHT }}
      >
        {/* Level Badge */}
        <div 
          className="flex flex-col items-center justify-center bg-[var(--accent-color)] text-[var(--bg-main)] px-2 h-full group relative"
          style={{ width: GRID_SIZE * 2.5 }}
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <PixelIcon name="trophy" size={16} />
          </motion.div>
          <span className="font-mono text-[12px] font-black">LV{progress.level}</span>
          {/* Tooltip */}
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-[var(--text-main)] text-[var(--bg-main)] text-[8px] font-mono opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 text-center">
            <div className="font-bold">{progress.title}</div>
            <div className="opacity-70">{progress.tilesExplored} tiles explored</div>
          </div>
        </div>

        {/* Progress Info */}
        <div className="flex-1 flex flex-col justify-center px-2 h-full">
          {/* Title & Points */}
          <div className="flex items-center justify-between">
            <span className="font-mono text-[9px] font-bold uppercase tracking-tight text-[var(--text-main)]">
              {progress.title}
            </span>
            <div className="flex items-center gap-1">
              <span className="text-[10px]">⭐</span>
              <motion.span 
                className="font-mono text-[10px] font-bold text-[var(--accent-color)]"
                key={progress.totalPoints}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
              >
                {progress.totalPoints}
              </motion.span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-1 relative">
            <div className="flex items-center justify-between text-[6px] font-mono opacity-50 mb-0.5">
              <span>NEXT LEVEL</span>
              <span>{progress.tilesExplored}/{progress.nextLevelAt} tiles</span>
            </div>
            <div className="h-[4px] bg-[var(--bg-main)] border border-[var(--border-color)] overflow-hidden">
              <motion.div
                className="h-full bg-[var(--accent-color)]"
                initial={{ width: 0 }}
                animate={{ width: `${progressToNextLevel}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
          </div>
        </div>

        {/* Stats Mini Display */}
        <div 
          className="flex flex-col items-center justify-center border-l border-[var(--border-color)] px-2 h-full"
          style={{ width: GRID_SIZE * 2.5 }}
        >
          <div className="flex items-center gap-1">
            <span className="text-[10px]">🎯</span>
            <span className="font-mono text-[11px] font-bold">{progress.tilesExplored}</span>
          </div>
          <span className="font-mono text-[6px] opacity-50">EXPLORED</span>
        </div>
      </div>

      {/* Level Up Celebration */}
      <AnimatePresence>
        {showLevelUp && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
            className="absolute -top-16 left-1/2 -translate-x-1/2 z-50"
          >
            <div className="px-4 py-2 bg-[var(--accent-color)] text-[var(--bg-main)] border-2 border-[var(--bg-main)] shadow-lg">
              <div className="flex items-center gap-2">
                <motion.span 
                  className="text-2xl"
                  animate={{ rotate: [0, -15, 15, 0], scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.5, repeat: 2 }}
                >
                  🎉
                </motion.span>
                <div>
                  <p className="font-mono text-[11px] font-bold uppercase">Level Up!</p>
                  <p className="font-mono text-[9px] opacity-80">
                    You&apos;re now a {progress.title}
                  </p>
                </div>
                <motion.span 
                  className="text-2xl"
                  animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.5, repeat: 2 }}
                >
                  🎉
                </motion.span>
              </div>
            </div>
            {/* Arrow pointing down */}
            <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-t-[10px] border-transparent border-t-[var(--accent-color)] mx-auto" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PlayerProgressIndicator;

// Hook to update progress from anywhere
export const usePlayerProgress = () => {
  const [progress, setProgress] = useState<PlayerProgress>({
    tilesExplored: 0,
    totalPoints: 0,
    level: 1,
    title: 'Curious Visitor',
    nextLevelAt: 5,
  });

  useEffect(() => {
    const stored = localStorage.getItem('playerProgress');
    if (stored) {
      try {
        const { tilesExplored, totalPoints } = JSON.parse(stored);
        setProgress(calculateProgress(tilesExplored, totalPoints));
      } catch {
        // Ignore
      }
    }
  }, []);

  const addPoints = (points: number) => {
    const newTotal = progress.totalPoints + points;
    const newProgress = calculateProgress(progress.tilesExplored, newTotal);
    setProgress(newProgress);
    localStorage.setItem('playerProgress', JSON.stringify({
      tilesExplored: progress.tilesExplored,
      totalPoints: newTotal,
    }));
    return newProgress;
  };

  const exploreTile = (points: number = 10) => {
    const newTiles = progress.tilesExplored + 1;
    const newTotal = progress.totalPoints + points;
    const newProgress = calculateProgress(newTiles, newTotal);
    setProgress(newProgress);
    localStorage.setItem('playerProgress', JSON.stringify({
      tilesExplored: newTiles,
      totalPoints: newTotal,
    }));
    return newProgress;
  };

  const resetProgress = () => {
    const newProgress = calculateProgress(0, 0);
    setProgress(newProgress);
    localStorage.removeItem('playerProgress');
    return newProgress;
  };

  return { progress, addPoints, exploreTile, resetProgress };
};
