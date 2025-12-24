'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GRID_SIZE, cn } from '@/lib/utils';
import { useGameMode, PAGE_GAMES, GAME_MODES } from '@/contexts/GameModeContext';
import { GameMenuOverlay } from './GameMenuOverlay';
import { TimeMachine } from '@/components/ui/TimeMachine';

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
    'clock': 'solid/clock-solid.svg',
    'angle-left': 'solid/angle-left-solid.svg',
    'angle-right': 'solid/angle-right-solid.svg',
    'angle-down': 'solid/angle-down-solid.svg',
    'gamepad': 'solid/gamepad-solid.svg',
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
// 3x3 GRID MENU BUTTON (Main navigation trigger)
// ═══════════════════════════════════════════════════════════════════════════════

const GridMenuButton = ({ onClick, isOpen }: { onClick: () => void; isOpen: boolean }) => {
  const { progress, completedGamesCount, totalGamesCount, currentXPPercentage } = useGameMode();
  const BAR_HEIGHT = GRID_SIZE * 3;
  const BUTTON_SIZE = GRID_SIZE * 3;
  
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
      style={{ width: BUTTON_SIZE, height: BAR_HEIGHT }}
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
      
      {/* Label */}
      <span className="text-[6px] font-mono uppercase tracking-wider mt-0.5">
        {isOpen ? 'CLOSE' : 'MENU'}
      </span>

      {/* Progress ring indicator */}
      {!isOpen && (
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 60 60"
        >
          <circle
            cx="30"
            cy="30"
            r="26"
            fill="none"
            stroke="var(--border-color)"
            strokeWidth="2"
            opacity="0.3"
          />
          <motion.circle
            cx="30"
            cy="30"
            r="26"
            fill="none"
            stroke="var(--accent-color)"
            strokeWidth="2"
            strokeLinecap="square"
            strokeDasharray={`${2 * Math.PI * 26}`}
            initial={{ strokeDashoffset: 2 * Math.PI * 26 }}
            animate={{ strokeDashoffset: 2 * Math.PI * 26 * (1 - currentXPPercentage / 100) }}
            transition={{ duration: 0.5 }}
            style={{ transformOrigin: 'center', transform: 'rotate(-90deg)' }}
          />
        </svg>
      )}

      {/* Tooltip */}
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-[var(--text-main)] text-[var(--bg-main)] text-[8px] font-mono opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
        <div>Game Menu</div>
        <div className="text-[var(--accent-color)]">{completedGamesCount}/{totalGamesCount} games • {progress.totalXP} XP</div>
      </div>
    </motion.button>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// CURRENT PAGE INDICATOR
// ═══════════════════════════════════════════════════════════════════════════════

const CurrentPageIndicator = () => {
  const pathname = usePathname();
  const { getGameProgress, isGameUnlocked } = useGameMode();
  
  // Find current game
  const currentGame = PAGE_GAMES.find(g => g.path === pathname);
  
  if (!currentGame) return null;
  
  const progress = getGameProgress(currentGame.id);
  const isComplete = progress === 100;
  
  const BAR_HEIGHT = GRID_SIZE * 3;
  
  return (
    <div 
      className="flex items-center gap-2 px-3 border-y border-r border-[var(--border-color)] bg-[var(--bg-card)]"
      style={{ height: BAR_HEIGHT }}
    >
      {/* Game icon */}
      <PixelIcon name={currentGame.icon} size={16} />
      
      {/* Game info */}
      <div className="flex flex-col">
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
          {currentGame.title}
        </span>
        <div className="flex items-center gap-1">
          <span className="text-[8px] font-mono text-[var(--text-muted)]">
            {currentGame.subtitle}
          </span>
          <span className={cn(
            'text-[7px] font-mono',
            isComplete ? 'text-green-500' : 'text-[var(--accent-color)]'
          )}>
            {progress}%
          </span>
        </div>
      </div>
      
      {/* Mini progress bar */}
      <div className="w-16 h-1.5 bg-[var(--border-color)] relative overflow-hidden">
        <motion.div
          className={cn('h-full', isComplete ? 'bg-green-500' : 'bg-[var(--accent-color)]')}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// GAME MODE INDICATOR (Shows current mode)
// ═══════════════════════════════════════════════════════════════════════════════

const GameModeIndicator = () => {
  const { mode } = useGameMode();
  const modeConfig = GAME_MODES[mode];
  const BAR_HEIGHT = GRID_SIZE * 3;
  
  return (
    <div 
      className="flex items-center gap-1.5 px-2 border-y border-r border-[var(--border-color)] bg-[var(--bg-card)]"
      style={{ height: BAR_HEIGHT }}
    >
      <span className="text-sm">{modeConfig.icon}</span>
      <div className="flex flex-col">
        <span className="text-[8px] font-mono font-bold uppercase tracking-wider">
          {modeConfig.name}
        </span>
        <span className="text-[6px] font-mono text-[var(--text-muted)]">
          {modeConfig.tagline}
        </span>
      </div>
    </div>
  );
};



// ═══════════════════════════════════════════════════════════════════════════════
// XP BAR
// ═══════════════════════════════════════════════════════════════════════════════

const XPBar = () => {
  const { progress, totalPossibleXP, currentXPPercentage } = useGameMode();
  const BAR_HEIGHT = GRID_SIZE * 3;
  
  return (
    <div 
      className="flex items-center gap-2 px-3 border-y border-[var(--border-color)] bg-[var(--bg-card)]"
      style={{ height: BAR_HEIGHT }}
    >
      <div className="flex flex-col">
        <span className="text-[7px] font-mono text-[var(--text-muted)] uppercase">XP</span>
        <span className="text-[10px] font-mono font-bold text-[var(--accent-color)]">
          {progress.totalXP}
        </span>
      </div>
      
      <div className="w-20 h-2 bg-[var(--border-color)] relative overflow-hidden">
        <motion.div
          className="h-full bg-[var(--accent-color)]"
          initial={{ width: 0 }}
          animate={{ width: `${currentXPPercentage}%` }}
          transition={{ duration: 0.5 }}
        />
        {/* Pixel segments */}
        <div className="absolute inset-0 flex">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex-1 border-r border-[var(--bg-card)]" />
          ))}
        </div>
      </div>
      
      <span className="text-[8px] font-mono text-[var(--text-muted)]">
        {currentXPPercentage}%
      </span>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN NAVIGATION COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

const Navigation = () => {
  const { isMenuOpen, toggleMenu, openMenu, closeMenu } = useGameMode();
  const BAR_HEIGHT = GRID_SIZE * 3;

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.altKey || e.metaKey) return;
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      // Number keys for quick navigation when menu is open
      if (isMenuOpen) {
        const num = parseInt(e.key);
        if (num >= 1 && num <= PAGE_GAMES.length) {
          // Navigation is handled in GameMenuOverlay
        }
      }
    };
    globalThis.addEventListener('keydown', handleKeyDown);
    return () => globalThis.removeEventListener('keydown', handleKeyDown);
  }, [isMenuOpen]);

  return (
    <>
      {/* Main Header Bar */}
      <header
        id="navigation"
        className="fixed top-0 left-0 right-0 z-50 flex"
        style={{ height: BAR_HEIGHT }}
        role="banner"
      >
        {/* LEFT: 3x3 Grid Menu Button */}
        <GridMenuButton onClick={toggleMenu} isOpen={isMenuOpen} />
        
        {/* Current Page Info */}
        <CurrentPageIndicator />
        
        {/* Spacer */}
        <div className="flex-1 border-y border-[var(--border-color)] bg-[var(--bg-main)]" />
        
        {/* RIGHT SECTION: XP + Mode */}
        <div className="flex">
          <XPBar />
          <GameModeIndicator />
        </div>
      </header>

      {/* Time Machine - Left side era switcher */}
      <TimeMachine />

      {/* Full Page Game Menu Overlay */}
      <GameMenuOverlay />
    </>
  );
};

export default Navigation;
