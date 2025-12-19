'use client';

/**
 * SimpleGameNav - Simplified Game Navigation Bar
 * 
 * A clean, minimal navigation with:
 * - Menu button (left)
 * - Current game info + XP for completing games
 * - Health bar that fills as you stay on page
 * 
 * Based on Teenage Engineering design language
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GRID_SIZE, cn } from '@/lib/utils';
import { useGameMode, PAGE_GAMES } from '@/contexts/GameModeContext';
import { GameMenuOverlay } from './GameMenuOverlay';

const TE_TIMING = {
  instant: 0.08,
  quick: 0.15,
};

// ═══════════════════════════════════════════════════════════════════════════════
// PIXEL ICON COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

const PixelIcon = ({ name, size = 16, className }: { name: string; size?: number; className?: string }) => {
  const ICON_PATHS: Record<string, string> = {
    'home': 'solid/home-solid.svg',
    'user': 'solid/user-solid.svg',
    'grid': 'solid/grid-solid.svg',
    'folder': 'solid/folder-solid.svg',
    'chart': 'solid/chart-line-solid.svg',
    'globe': 'solid/globe-solid.svg',
    'envelope': 'solid/envelope-solid.svg',
    'bars': 'solid/bars-solid.svg',
    'times': 'solid/times-solid.svg',
    'play': 'solid/play-solid.svg',
    'pause': 'solid/pause-solid.svg',
    'heart': 'solid/heart-solid.svg',
    'star': 'solid/star-solid.svg',
    'bolt': 'solid/bolt-solid.svg',
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

// ═══════════════════════════════════════════════════════════════════════════════
// HEALTH BAR - Fills as user stays on page
// ═══════════════════════════════════════════════════════════════════════════════

interface HealthBarProps {
  health: number; // 0-100
  maxHealth: number;
}

const HealthBar: React.FC<HealthBarProps> = ({ health, maxHealth }) => {
  const percentage = Math.min((health / maxHealth) * 100, 100);
  const segments = 10;
  const filledSegments = Math.floor((percentage / 100) * segments);
  
  return (
    <div className="flex items-center gap-2">
      {/* Heart icon */}
      <div className="flex items-center gap-1">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
        >
          <PixelIcon name="heart" size={14} className="text-[#ff6b6b]" />
        </motion.div>
      </div>
      
      {/* Segmented health bar */}
      <div className="flex gap-[2px]">
        {[...Array(segments)].map((_, i) => (
          <motion.div
            key={i}
            className="h-3 border border-[var(--border-color)]"
            style={{ width: GRID_SIZE * 0.6 }}
            initial={{ opacity: 0.3 }}
            animate={{
              backgroundColor: i < filledSegments 
                ? '#ff6b6b' 
                : 'var(--bg-card)',
              opacity: i < filledSegments ? 1 : 0.3,
            }}
            transition={{ duration: 0.3, delay: i * 0.02 }}
          />
        ))}
      </div>
      
      {/* Health value */}
      <span className="text-[10px] font-mono text-[var(--text-muted)] w-8">
        {Math.floor(percentage)}%
      </span>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// XP BAR - Fills as you complete games
// ═══════════════════════════════════════════════════════════════════════════════

interface XPBarProps {
  currentXP: number;
  totalXP: number;
  level: number;
}

const XPBar: React.FC<XPBarProps> = ({ currentXP, totalXP, level }) => {
  const percentage = totalXP > 0 ? Math.min((currentXP / totalXP) * 100, 100) : 0;
  
  return (
    <div className="flex items-center gap-2">
      {/* Star icon with level */}
      <div className="flex items-center gap-1">
        <PixelIcon name="star" size={14} className="text-[var(--accent-color)]" />
        <span className="text-[10px] font-mono font-bold text-[var(--accent-color)]">
          LV{level}
        </span>
      </div>
      
      {/* XP progress bar */}
      <div 
        className="h-3 bg-[var(--bg-card)] border border-[var(--border-color)] relative overflow-hidden"
        style={{ width: GRID_SIZE * 6 }}
      >
        <motion.div
          className="h-full bg-[var(--accent-color)]"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
        {/* Grid overlay */}
        <div className="absolute inset-0 flex pointer-events-none">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex-1 border-r border-[var(--bg-main)]/30 last:border-r-0" />
          ))}
        </div>
      </div>
      
      {/* XP values */}
      <span className="text-[10px] font-mono text-[var(--text-muted)]">
        {currentXP}<span className="opacity-50">/{totalXP}</span>
      </span>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// MENU BUTTON - Opens game navigation overlay
// ═══════════════════════════════════════════════════════════════════════════════

interface MenuButtonProps {
  onClick: () => void;
  isOpen: boolean;
  gamesCompleted: number;
  totalGames: number;
}

const MenuButton: React.FC<MenuButtonProps> = ({ onClick, isOpen, gamesCompleted, totalGames }) => {
  const BAR_HEIGHT = GRID_SIZE * 3;
  
  return (
    <motion.button
      onClick={onClick}
      className={cn(
        'relative flex flex-col items-center justify-center group',
        'border-2 border-[var(--border-color)]',
        'transition-all duration-150',
        isOpen
          ? 'bg-[var(--accent-color)] text-[var(--bg-main)] border-[var(--accent-color)]'
          : 'bg-[var(--bg-card)] text-[var(--text-main)] hover:bg-[var(--text-main)] hover:text-[var(--bg-main)] hover:border-[var(--text-main)]'
      )}
      style={{ width: GRID_SIZE * 3, height: BAR_HEIGHT }}
      whileHover={{ scale: 0.95 }}
      whileTap={{ scale: 0.9 }}
      aria-label="Open game menu"
      aria-expanded={isOpen}
    >
      {/* Keyboard hint */}
      <span className="absolute top-0.5 left-1 text-[6px] font-mono opacity-40">M</span>
      
      {/* 3x3 Grid Icon */}
      <div className="grid grid-cols-3 gap-0.5" style={{ width: 18, height: 18 }}>
        {[...Array(9)].map((_, i) => (
          <motion.div
            key={i}
            className={cn(
              'w-1.5 h-1.5',
              isOpen ? 'bg-[var(--bg-main)]' : 'bg-current'
            )}
            initial={false}
            animate={isOpen ? { scale: [1, 0.8, 1], rotate: 45 } : { scale: 1, rotate: 0 }}
            transition={{ delay: i * 0.02, duration: 0.2 }}
          />
        ))}
      </div>
      
      {/* Label with progress */}
      <div className="flex items-center gap-1 mt-0.5">
        <span className="text-[6px] font-mono uppercase tracking-wider">
          {isOpen ? 'CLOSE' : 'MENU'}
        </span>
        {!isOpen && (
          <span className="text-[6px] font-mono opacity-60">
            {gamesCompleted}/{totalGames}
          </span>
        )}
      </div>
    </motion.button>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// CURRENT GAME BADGE - Shows what game you're on
// ═══════════════════════════════════════════════════════════════════════════════

interface CurrentGameBadgeProps {
  gameName: string;
  gameIcon: string;
  isPlaying: boolean;
  onPlay: () => void;
}

const CurrentGameBadge: React.FC<CurrentGameBadgeProps> = ({ gameName, gameIcon, isPlaying, onPlay }) => {
  const BAR_HEIGHT = GRID_SIZE * 3;
  
  return (
    <motion.button
      onClick={onPlay}
      className={cn(
        'flex items-center gap-2 px-3 border-y border-r border-[var(--border-color)]',
        isPlaying 
          ? 'bg-[var(--accent-color)] text-[var(--bg-main)]' 
          : 'bg-[var(--bg-card)] text-[var(--text-main)] hover:bg-[var(--text-main)] hover:text-[var(--bg-main)]',
        'transition-colors duration-150 group'
      )}
      style={{ height: BAR_HEIGHT }}
      whileHover={{ scale: 0.98 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Play/Pause icon */}
      <motion.div
        animate={isPlaying ? { scale: [1, 1.1, 1] } : {}}
        transition={{ duration: 0.5, repeat: isPlaying ? Infinity : 0 }}
      >
        <PixelIcon name={isPlaying ? 'pause' : 'play'} size={14} />
      </motion.div>
      
      {/* Game name */}
      <div className="flex flex-col">
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
          {gameName}
        </span>
        <span className="text-[7px] font-mono opacity-70 uppercase">
          {isPlaying ? 'PLAYING' : 'PRESS TO PLAY'}
        </span>
      </div>
      
      {/* Game icon */}
      <span className="text-lg opacity-80">{gameIcon}</span>
    </motion.button>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// GOD MODE TOGGLE - Quick access to unlock all
// ═══════════════════════════════════════════════════════════════════════════════

interface ModeSelectorProps {
  currentMode: string;
  onModeChange: (mode: 'normal' | 'god' | 'devil') => void;
}

const ModeSelector: React.FC<ModeSelectorProps> = ({ currentMode, onModeChange }) => {
  const BAR_HEIGHT = GRID_SIZE * 3;
  
  const modes = [
    { id: 'normal', icon: '📖', label: 'STORY' },
    { id: 'god', icon: '⚡', label: 'GOD' },
  ];
  
  const currentModeData = modes.find(m => m.id === currentMode) || modes[0];
  
  return (
    <motion.button
      onClick={() => {
        const nextMode = currentMode === 'normal' ? 'god' : 'normal';
        onModeChange(nextMode as 'normal' | 'god');
      }}
      className={cn(
        'flex items-center gap-1.5 px-2 border-y border-r border-[var(--border-color)]',
        'bg-[var(--bg-card)] text-[var(--text-main)]',
        'hover:bg-[var(--text-main)] hover:text-[var(--bg-main)]',
        'transition-colors duration-150'
      )}
      style={{ height: BAR_HEIGHT }}
      whileHover={{ scale: 0.98 }}
      whileTap={{ scale: 0.95 }}
      title={currentMode === 'god' ? 'All games unlocked' : 'Story mode - complete games to unlock'}
    >
      <motion.span 
        className="text-sm"
        animate={{ rotate: currentMode === 'god' ? [0, 10, -10, 0] : 0 }}
        transition={{ duration: 0.5, repeat: currentMode === 'god' ? Infinity : 0 }}
      >
        {currentModeData.icon}
      </motion.span>
      <span className="text-[8px] font-mono font-bold uppercase">
        {currentModeData.label}
      </span>
    </motion.button>
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
  const { 
    isMenuOpen, 
    toggleMenu, 
    mode, 
    setMode,
    progress, 
    totalPossibleXP, 
    completedGamesCount, 
    totalGamesCount,
  } = useGameMode();
  
  const BAR_HEIGHT = GRID_SIZE * 3;
  
  // Health system - fills as you stay on page
  const [health, setHealth] = useState(0);
  const maxHealth = 100;
  
  // Health regeneration over time
  useEffect(() => {
    const interval = setInterval(() => {
      setHealth(prev => Math.min(prev + 1, maxHealth));
    }, 1000); // +1 health per second
    
    return () => clearInterval(interval);
  }, []);
  
  // Calculate level from XP
  const level = Math.floor(progress.totalXP / 100) + 1;
  
  // Mission messages based on game
  const missionMessages: Record<string, string> = {
    snake: 'Chase the labels! Each one reveals something about me.',
    painter: 'Paint trails on the grid! Express your creativity.',
    collector: 'Collect glowing items before they vanish!',
    avoider: 'Dodge the falling obstacles to survive!',
  };
  const mission = missionMessages[currentGameId] || 'Move your cursor to play and discover!';

  return (
    <>
      {/* Main Header Bar */}
      <header
        id="navigation"
        className="fixed top-0 left-0 right-0 z-50 flex items-stretch"
        style={{ height: BAR_HEIGHT }}
        role="banner"
      >
        {/* LEFT: Menu Button */}
        <MenuButton 
          onClick={toggleMenu} 
          isOpen={isMenuOpen}
          gamesCompleted={completedGamesCount}
          totalGames={totalGamesCount}
        />
        
        {/* Current Game Badge - only show when game is available */}
        {onToggleGame && (
          <CurrentGameBadge 
            gameName={currentGameName}
            gameIcon={currentGameIcon}
            isPlaying={isGameActive}
            onPlay={onToggleGame}
          />
        )}
        
        {/* Spacer with grid pattern */}
        <div className="flex-1 border-y border-[var(--border-color)] bg-[var(--bg-main)] flex items-center justify-center">
          {/* Mission hint */}
          <AnimatePresence mode="wait">
            {isGameActive ? (
              <motion.div
                key="playing"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="text-[10px] font-mono text-[var(--text-muted)] text-center px-4"
              >
                <span className="text-[var(--accent-color)]">🎯 MISSION:</span>{' '}
                {mission}
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="text-[10px] font-mono text-[var(--text-muted)] text-center px-4"
              >
                <span className="text-[var(--text-main)]">👋</span>{' '}
                Welcome! Press PLAY to explore my portfolio through games.
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* RIGHT SECTION: Health + XP + Mode */}
        <div className="flex items-center border-y border-[var(--border-color)] bg-[var(--bg-card)]">
          {/* Health Bar */}
          <div 
            className="flex items-center px-3 border-r border-[var(--border-color)]"
            style={{ height: BAR_HEIGHT }}
          >
            <HealthBar health={health} maxHealth={maxHealth} />
          </div>
          
          {/* XP Bar */}
          <div 
            className="flex items-center px-3 border-r border-[var(--border-color)]"
            style={{ height: BAR_HEIGHT }}
          >
            <XPBar 
              currentXP={progress.totalXP} 
              totalXP={totalPossibleXP}
              level={level}
            />
          </div>
          
          {/* Mode Selector */}
          <ModeSelector 
            currentMode={mode} 
            onModeChange={setMode}
          />
        </div>
      </header>

      {/* Full Page Game Menu Overlay */}
      <GameMenuOverlay />
    </>
  );
};

export default SimpleGameNav;
