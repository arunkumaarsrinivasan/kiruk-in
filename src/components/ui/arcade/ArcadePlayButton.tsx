'use client';

/**
 * ArcadePlayButton Component
 * 
 * The main "Play" control for the portfolio experience.
 * Transformed from a debug-style HUD into a friendly, gamified interface.
 * 
 * Features:
 * - Clear, accessible labels with tooltips
 * - Progress tracking with meaningful feedback
 * - Mini-tutorial for first-time visitors
 * - Playful microcopy that feels like a game UI
 */

import React, { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, GRID_SIZE } from '@/lib/utils';
import { getGameEntry, getGameIds } from './game-registry';
import { getPageInfo } from '@/data/page-info';
import { PlayerArchetypeSelector } from './PlayerArchetypeSelector';
import { PixelIcon } from '@/components/ui/PixelIcon';


// Compact animated hints for each game type
const GameHint = ({ gameId, isActive }: { gameId: string; isActive: boolean }) => {
  if (!isActive) {
    return (
      <motion.span 
        className="text-xl"
        animate={{ x: [-2, 2, -2], scale: [1, 1.1, 1] }}
        transition={{ duration: 0.8, repeat: Infinity }}
      >
        ▶
      </motion.span>
    );
  }

  switch (gameId) {
    case 'snake':
      return (
        <div className="flex gap-[2px]">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 bg-current"
              animate={{ x: [0, 4, 4, 0], opacity: [1, 0.7, 0.5, 0.3][i] || 1 }}
              transition={{ duration: 1, delay: i * 0.1, repeat: Infinity }}
            />
          ))}
        </div>
      );
    case 'collector':
      return (
        <motion.span 
          className="text-sm"
          animate={{ scale: [1, 0, 1], opacity: [1, 0, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          ◇
        </motion.span>
      );
    case 'painter':
      return (
        <div className="flex gap-[1px]">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1 h-1 rounded-full bg-current"
              animate={{ opacity: [0, 1, 0], scale: [0, 1, 0.5] }}
              transition={{ duration: 1.5, delay: i * 0.2, repeat: Infinity }}
            />
          ))}
        </div>
      );
    case 'avoider':
      return (
        <motion.span 
          className="text-sm"
          animate={{ y: [0, 4, 0] }}
          transition={{ duration: 0.8, repeat: Infinity }}
        >
          ↓
        </motion.span>
      );
    default:
      return (
        <motion.span 
          className="text-sm"
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          ⟳
        </motion.span>
      );
  }
};

// Mini progress bar visualization with tooltip
const MiniProgressBar = ({ value, max, label, tooltip }: { value: number; max: number; label: string; tooltip: string }) => {
  const percentage = Math.min((value / max) * 100, 100);
  return (
    <div className="flex items-center gap-1 w-full group relative">
      <span className="text-[6px] font-mono opacity-50 w-8">{label}</span>
      <div className="flex-1 h-[3px] bg-[var(--bg-card)] border border-[var(--border-color)]">
        <motion.div
          className="h-full bg-[var(--accent-color)]"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
      <span className="text-[6px] font-mono w-6 text-right">{value}</span>
      {/* Tooltip */}
      <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-[var(--text-main)] text-[var(--bg-main)] text-[7px] font-mono opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
        {tooltip}
      </div>
    </div>
  );
};

// Animated stat counter - not currently used but available for future
// const StatCounter = ({ value, label, icon }: { value: number; label: string; icon: string }) => (
//   <div className="flex flex-col items-center justify-center">
//     <span className="text-[8px] font-mono opacity-50">{icon}</span>
//     <motion.span 
//       className="text-[10px] font-mono font-bold"
//       key={value}
//       initial={{ scale: 1.2, opacity: 0 }}
//       animate={{ scale: 1, opacity: 1 }}
//     >
//       {value}
//     </motion.span>
//     <span className="text-[5px] font-mono opacity-40 uppercase">{label}</span>
//   </div>
// );

// Stat labels with clear meanings
const STAT_LABELS = {
  score: { short: 'SCORE', full: 'Points earned this session' },
  plays: { short: 'PLAYS', full: 'Games played today' },
  high: { short: 'BEST', full: 'Your personal best score' },
  streak: { short: 'STREAK', full: 'Consecutive good runs' },
};

interface ArcadePlayButtonProps {
  isActive: boolean;
  onToggle: () => void;
  onRandomGame: () => void;
  gameId: string;
  score?: number;
  className?: string;
}

const TE_TIMING = {
  instant: 0.08,
  quick: 0.15,
};

export const ArcadePlayButton: React.FC<ArcadePlayButtonProps> = ({
  isActive,
  onToggle,
  onRandomGame,
  gameId,
  score = 0,
  className,
}) => {
  const pathname = usePathname();
  const gameEntry = getGameEntry(gameId);
  const gameName = gameEntry?.label || 'Game';
  const pageInfo = getPageInfo(pathname);
  const gameIds = getGameIds();
  const currentGameIndex = gameIds.indexOf(gameId);
  
  // Collapsible state
  const [isExpanded, setIsExpanded] = useState(true);
  
  // Session stats tracking
  const [sessionStats, setSessionStats] = useState({
    gamesPlayed: 0,
    highScore: 0,
    totalScore: 0,
    streak: 0,
  });
  
  // Track game sessions
  useEffect(() => {
    if (isActive) {
      setSessionStats(prev => ({
        ...prev,
        gamesPlayed: prev.gamesPlayed + 1,
      }));
    }
  }, [isActive]);
  
  // Track high score
  useEffect(() => {
    if (score > sessionStats.highScore) {
      setSessionStats(prev => ({ ...prev, highScore: score }));
    }
    if (!isActive && score > 0) {
      setSessionStats(prev => ({ 
        ...prev, 
        totalScore: prev.totalScore + score,
        streak: score > 50 ? prev.streak + 1 : 0,
      }));
    }
  }, [score, isActive, sessionStats.highScore]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.altKey || e.metaKey) return;
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      if (e.key === ' ') {
        e.preventDefault();
        onToggle();
      }
      if (e.key === 'r' || e.key === 'R') {
        onRandomGame();
      }
      if (e.key === 'g' || e.key === 'G') {
        setIsExpanded(prev => !prev);
      }
    };
    globalThis.addEventListener('keydown', handleKeyDown);
    return () => globalThis.removeEventListener('keydown', handleKeyDown);
  }, [onToggle, onRandomGame]);

  const BAR_HEIGHT = GRID_SIZE * 3;

  // Get mission text based on game state - friendly, action-oriented
  const getMissionText = () => {
    if (!isActive) {
      return pageInfo.hint || 'Press PLAY to explore the grid';
    }
    switch (gameId) {
      case 'snake': return '🐍 Chase the labels! Each one reveals something about me.';
      case 'collector': return '✨ Hover to collect! Build combos for bonus discoveries.';
      case 'painter': return '🎨 Leave your mark! Paint trails as you explore.';
      case 'avoider': return '⚡ Stay sharp! Dodge obstacles to keep your streak.';
      default: return '🎮 Move your cursor to play. What will you discover?';
    }
  };

  // First-time visitor check
  const [showTutorial, setShowTutorial] = useState(false);
  useEffect(() => {
    const hasPlayed = localStorage.getItem('hasPlayedArcade');
    if (!hasPlayed && isActive) {
      setShowTutorial(true);
      const timer = setTimeout(() => {
        setShowTutorial(false);
        localStorage.setItem('hasPlayedArcade', 'true');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isActive]);

  return (
    <div 
      className={cn(
        'fixed z-[55] top-0 flex items-center justify-center pointer-events-auto',
        className
      )}
      style={{
        left: GRID_SIZE * 7,
        right: GRID_SIZE * 26.5, // Adjusted for collapse button
        height: BAR_HEIGHT,
      }}
    >
      {/* Tutorial Overlay for first-time players */}
      <AnimatePresence>
        {showTutorial && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute -bottom-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-[var(--text-main)] text-[var(--bg-main)] border-2 border-[var(--bg-main)] shadow-lg whitespace-nowrap"
          >
            <div className="flex items-center gap-2">
              <motion.span 
                className="text-xl"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                👆
              </motion.span>
              <div>
                <p className="text-[10px] font-mono font-bold">Welcome, player!</p>
                <p className="text-[8px] font-mono opacity-80">Move your cursor around the grid to play</p>
              </div>
            </div>
            {/* Arrow pointing up */}
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-b-[8px] border-transparent border-b-[var(--text-main)]" />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {isExpanded ? (
          /* ════════════════════════════════════════════════════════════════
             EXPANDED VIEW - Full arcade controls with clear labels
             ════════════════════════════════════════════════════════════════ */
          <motion.div
            key="expanded"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: TE_TIMING.quick }}
            className="flex items-center"
          >
            {/* Player Archetype Selector */}
            <PlayerArchetypeSelector compact className="mr-1" />

            {/* Play/Stop Button - Clear labeling */}
            <motion.button
              className={cn(
                'relative flex flex-col items-center justify-center group',
                'border border-[var(--border-color)]',
                'cursor-pointer select-none',
                isActive 
                  ? 'bg-[var(--accent-color)] text-[var(--bg-main)]' 
                  : 'bg-[var(--bg-card)] text-[var(--text-main)] hover:bg-[var(--text-main)] hover:text-[var(--bg-main)]',
                'transition-colors duration-100'
              )}
              style={{ width: BAR_HEIGHT, height: BAR_HEIGHT }}
              onClick={onToggle}
              whileHover={{ scale: 0.95 }}
              whileTap={{ scale: 0.9 }}
              transition={{ duration: TE_TIMING.instant }}
              aria-label={isActive ? 'Stop exploring' : 'Start exploring'}
            >
              {/* Keyboard hint */}
              <span className="absolute top-0.5 left-1 text-[6px] font-mono opacity-40">␣</span>
              <motion.div 
                animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 0.5, repeat: isActive ? Infinity : 0 }}
              >
                <PixelIcon name={isActive ? 'pause' : 'play'} size={20} />
              </motion.div>
              <span className="text-[7px] font-mono opacity-80">
                {isActive ? 'PAUSE' : 'PLAY'}
              </span>
              {/* Tooltip */}
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-[var(--text-main)] text-[var(--bg-main)] text-[7px] font-mono opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                Spacebar to {isActive ? 'pause' : 'play'}
              </div>
            </motion.button>

            {/* Game Info + Score - Clearer layout */}
            <div className="flex flex-col">
              {/* Game Name with hint */}
              <div 
                className="flex items-center justify-center bg-[var(--text-main)] text-[var(--bg-main)] border border-[var(--border-color)] px-2 group relative"
                style={{ width: GRID_SIZE * 5, height: BAR_HEIGHT / 2 }}
              >
                <AnimatePresence mode="wait">
                  <motion.span
                    key={gameName}
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="text-[9px] font-mono uppercase tracking-wider font-bold"
                  >
                    {gameName}
                  </motion.span>
                </AnimatePresence>
                {/* Game tooltip */}
                <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-[var(--bg-card)] text-[var(--text-main)] text-[7px] font-mono opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 border border-[var(--border-color)]">
                  Current game mode
                </div>
              </div>

              {/* Score - Clear label */}
              <div 
                className={cn(
                  "flex items-center justify-between border border-[var(--border-color)] px-2 group relative",
                  "bg-[var(--bg-card)] text-[var(--text-main)]"
                )}
                style={{ width: GRID_SIZE * 5, height: BAR_HEIGHT / 2 }}
              >
                <span className="text-[6px] font-mono opacity-50">SCORE</span>
                <motion.span 
                  className="text-[11px] font-mono font-bold tracking-wider"
                  animate={isActive && score > 0 ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 0.2 }}
                >
                  {score}
                </motion.span>
                {/* Score tooltip */}
                <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-[var(--bg-card)] text-[var(--text-main)] text-[7px] font-mono opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 border border-[var(--border-color)]">
                  Points earned this run
                </div>
              </div>
            </div>

            {/* Session Stats Panel - Clear tooltips */}
            <div
              className="flex flex-col justify-center bg-[var(--bg-card)] text-[var(--text-main)] border border-[var(--border-color)] px-1.5"
              style={{ width: GRID_SIZE * 4.5, height: BAR_HEIGHT }}
            >
              <MiniProgressBar 
                value={score} 
                max={Math.max(sessionStats.highScore, 100)} 
                label={STAT_LABELS.score.short}
                tooltip={STAT_LABELS.score.full}
              />
              <MiniProgressBar 
                value={sessionStats.gamesPlayed} 
                max={10} 
                label={STAT_LABELS.plays.short}
                tooltip={STAT_LABELS.plays.full}
              />
              <div className="flex justify-between mt-0.5 text-[6px] font-mono">
                <span className="opacity-60" title={STAT_LABELS.high.full}>
                  {STAT_LABELS.high.short}: {sessionStats.highScore}
                </span>
                <span className="opacity-60" title={STAT_LABELS.streak.full}>
                  🔥 {sessionStats.streak}
                </span>
              </div>
            </div>

            {/* Visual Hint + Page Description - Clearer instructions */}
            <div
              className="flex items-center bg-[var(--bg-card)] text-[var(--text-main)] border border-[var(--border-color)] overflow-hidden"
              style={{ width: GRID_SIZE * 8, height: BAR_HEIGHT }}
            >
              {/* Animated Visual Hint */}
              <div 
                className="flex items-center justify-center border-r border-[var(--border-color)]"
                style={{ width: GRID_SIZE * 2, height: '100%' }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={gameId + String(isActive)}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.15 }}
                  >
                    <GameHint gameId={gameId} isActive={isActive} />
                  </motion.div>
                </AnimatePresence>
              </div>
              
              {/* Page Description - Friendly copy */}
              <div className="flex-1 flex flex-col items-start justify-center px-2">
                <span className="text-[6px] font-mono uppercase tracking-wider opacity-50">
                  {isActive ? <><PixelIcon name="flag-checkered" size={8} className="inline-block" /> MISSION</> : <><PixelIcon name="location" size={8} className="inline-block" /> THIS PAGE</>}
                </span>
                <AnimatePresence mode="wait">
                  <motion.span 
                    key={isActive ? getMissionText() : pageInfo.description}
                    initial={{ opacity: 0, y: 3 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -3 }}
                    className="text-[8px] leading-tight font-mono mt-0.5"
                  >
                    {isActive ? getMissionText() : pageInfo.description}
                  </motion.span>
                </AnimatePresence>
              </div>
            </div>

            {/* Random Game Button - Friendly label */}
            <motion.button
              className={cn(
                'relative flex flex-col items-center justify-center group',
                'bg-[var(--bg-card)] text-[var(--text-main)]',
                'border border-[var(--border-color)]',
                'cursor-pointer select-none',
                'hover:bg-[var(--text-main)] hover:text-[var(--bg-main)]',
                'transition-colors duration-100'
              )}
              style={{ width: GRID_SIZE * 2.5, height: BAR_HEIGHT }}
              onClick={onRandomGame}
              whileHover={{ scale: 0.95 }}
              whileTap={{ scale: 0.9 }}
              transition={{ duration: TE_TIMING.instant }}
              aria-label="Try a different game"
            >
              <span className="absolute top-0.5 left-1 text-[6px] font-mono opacity-40">R</span>
              <motion.div
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.3 }}
              >
                <PixelIcon name="shuffle" size={18} />
              </motion.div>
              <span className="text-[5px] font-mono opacity-70">SHUFFLE</span>
              {/* Tooltip */}
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-[var(--text-main)] text-[var(--bg-main)] text-[7px] font-mono opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                Try another game (R)
              </div>
            </motion.button>
          </motion.div>
        ) : (
          /* ════════════════════════════════════════════════════════════════
             COLLAPSED VIEW - Minimal play button with score
             ════════════════════════════════════════════════════════════════ */
          <motion.div
            key="collapsed"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: TE_TIMING.quick }}
            className="flex items-center"
          >
            {/* Mini Play Button - Friendly compact view */}
            <motion.button
              className={cn(
                'relative flex items-center justify-center gap-2 group',
                'border border-[var(--border-color)]',
                'cursor-pointer select-none px-3',
                isActive 
                  ? 'bg-[var(--accent-color)] text-[var(--bg-main)]' 
                  : 'bg-[var(--bg-card)] text-[var(--text-main)] hover:bg-[var(--text-main)] hover:text-[var(--bg-main)]',
                'transition-colors duration-100'
              )}
              style={{ height: BAR_HEIGHT }}
              onClick={onToggle}
              whileHover={{ scale: 0.98 }}
              whileTap={{ scale: 0.95 }}
            >
              <PixelIcon name={isActive ? 'pause' : 'play'} size={16} />
              <div className="flex flex-col items-start">
                <span className="text-[8px] font-mono font-bold">{gameName}</span>
                <span className="text-[10px] font-mono">Score: {score}</span>
              </div>
              {isActive && (
                <motion.div
                  className="w-2 h-2 rounded-full bg-current"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                />
              )}
              {/* Tooltip */}
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-[var(--text-main)] text-[var(--bg-main)] text-[7px] font-mono opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                {isActive ? 'Pause game' : 'Start exploring'}
              </div>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapse/Expand Toggle - Clear labels */}
      <motion.button
        className={cn(
          'relative flex flex-col items-center justify-center group',
          'bg-[var(--bg-card)] text-[var(--text-main)]',
          'border border-[var(--border-color)]',
          'cursor-pointer select-none',
          'hover:bg-[var(--text-main)] hover:text-[var(--bg-main)]',
          'transition-colors duration-100'
        )}
        style={{ width: GRID_SIZE * 2, height: BAR_HEIGHT }}
        onClick={() => setIsExpanded(prev => !prev)}
        whileHover={{ scale: 0.95 }}
        whileTap={{ scale: 0.9 }}
        transition={{ duration: TE_TIMING.instant }}
        aria-label={isExpanded ? "Minimize game bar" : "Show game bar"}
      >
        <span className="absolute top-0.5 left-1 text-[6px] font-mono opacity-40">G</span>
        <motion.div
          initial={false}
          animate={{ scale: isExpanded ? 1 : 1.1 }}
          transition={{ duration: TE_TIMING.quick }}
        >
          <PixelIcon name={isExpanded ? 'times' : 'play'} size={16} />
        </motion.div>
        <span className="text-[5px] font-mono opacity-70">
          {isExpanded ? 'LESS' : 'MORE'}
        </span>
        {/* Tooltip */}
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-[var(--text-main)] text-[var(--bg-main)] text-[7px] font-mono opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
          {isExpanded ? 'Minimize (G)' : 'Show controls (G)'}
        </div>
      </motion.button>
    </div>
  );
};

export default ArcadePlayButton;
