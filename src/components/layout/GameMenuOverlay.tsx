'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useGameMode, GAME_MODES } from '@/contexts/GameModeContext';
import { cn, GRID_SIZE } from '@/lib/utils';
import { PAGE_GAMES } from '@/data/game-navigation-data';
import PixelIcon from '@/components/ui/PixelIcon';

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS - Using existing GRID_SIZE from utils
// ═══════════════════════════════════════════════════════════════════════════════

// Responsive tile size based on viewport
const getTileSize = () => {
  if (typeof window === 'undefined') return GRID_SIZE;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  // Scale tile to fit ~25 columns max on screen with padding
  const maxCols = 25;
  const maxRows = 15;
  const tileFromWidth = Math.floor((vw - 40) / maxCols);
  const tileFromHeight = Math.floor((vh - 160) / maxRows);
  return Math.max(GRID_SIZE, Math.min(tileFromWidth, tileFromHeight, GRID_SIZE * 2));
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAP DATA - Compact responsive maze
// ═══════════════════════════════════════════════════════════════════════════════

// W: Wall, .: Floor, P: Player Start
// 1-8: Doors to games (Home, About, Work, Case Studies, Progress, Map, Contact, Lab)
const MAP_LAYOUT = [
  "WWWWWWWWWWWWWWWWWWWWWWWWW",
  "W..1.......W.......2....W",
  "W..W..WWWWWW.WWWWWW..W..W",
  "W...........P.....W.....W",
  "WWWW..W.WWWWWWWWW.W..WWWW",
  "W..3........W........4..W",
  "W..W..WWWW..W..WWWW..W..W",
  "W.....W.....W.....W.....W",
  "WWWW..W..WWWWWWW..W..WWWW",
  "W..5........W........6..W",
  "W..W..WWWW..W..WWWW..W..W",
  "W.....W.....7.....W.....W",
  "W.....W.....8.....W.....W",
  "WWWWWWWWWWWWWWWWWWWWWWWWW",
];

// Precompute door tile positions from the map (1-8)
const DOOR_POSITIONS = (() => {
  const positions: Array<{ x: number; y: number; gameIndex: number }> = [];
  for (let y = 0; y < MAP_LAYOUT.length; y++) {
    const row = MAP_LAYOUT[y];
    for (let x = 0; x < row.length; x++) {
      const ch = row[x];
      if (/[1-8]/.test(ch)) {
        positions.push({ x, y, gameIndex: parseInt(ch, 10) - 1 });
      }
    }
  }
  return positions;
})();

// ═══════════════════════════════════════════════════════════════════════════════
// EYE DOOR COMPONENT - Kiruk signature style
// ═══════════════════════════════════════════════════════════════════════════════

const EyeDoor = ({ 
  game, 
  isUnlocked, 
  isCompleted,
  tileSize,
  isPlayerNear,
  isHovered,
}: { 
  game: typeof PAGE_GAMES[0];
  isUnlocked: boolean;
  isCompleted: boolean;
  tileSize: number;
  isPlayerNear: boolean;
  isHovered: boolean;
}) => {
  const isHighlighted = isPlayerNear || isHovered;

  return (
    <div className={cn(
      "absolute inset-0 flex items-center justify-center transition-all duration-300 group",
      isHighlighted && "scale-105 filter drop-shadow-[0_0_10px_var(--accent-color)]",
      isCompleted 
        ? "text-[var(--bg-main)]" 
        : isUnlocked 
          ? "text-[var(--accent-color)]" 
          : "text-[var(--text-muted)] opacity-40"
    )}>
      {/* Eye Container */}
      <div 
        className={cn(
          "relative flex items-center justify-center border-2 transition-all duration-300",
          isCompleted 
            ? "bg-[var(--accent-color)] border-[var(--accent-color)]" 
            : isUnlocked 
              ? "bg-[var(--bg-card)] border-[var(--accent-color)]" 
              : "bg-[var(--bg-main)] border-[var(--border-color)]"
        )}
        style={{ 
          width: tileSize - 4, 
          height: tileSize - 4,
          clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)', // Diamond/Eye shape
          boxShadow: isHighlighted ? '0 0 0 2px var(--accent-color)' : 'none',
        }}
      >
        {/* Pixel Icon pupil */}
        <motion.div
          className="text-center"
          animate={isPlayerNear ? { scale: [1, 1.15, 1] } : {}}
          transition={{ duration: 0.5, repeat: isPlayerNear ? Infinity : 0 }}
          style={{ width: tileSize * 0.45, height: tileSize * 0.45 }}
        >
          <PixelIcon name={game.icon} size={tileSize * 0.45} className="text-current" />
        </motion.div>
      </div>
      
      {/* Status indicator */}
      <div className={cn(
        "absolute -top-1 -right-1 w-2 h-2 border",
        isCompleted 
          ? "bg-green-500 border-green-400" 
          : isUnlocked 
            ? "bg-[var(--accent-color)] border-[var(--accent-color)]" 
            : "bg-[var(--text-muted)] border-[var(--border-color)]"
      )} />
      
      {/* Name chip */}
      <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 px-3.5 py-1 text-[10px] font-mono font-bold bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-main)] shadow-[2px_2px_0_0_var(--border-color)] z-20 whitespace-nowrap min-w-[96px] text-center">
        {game.title}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// HUD COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

const StatsHUD = ({ 
  mode, 
  level, 
  xp, 
  totalXP, 
  progress,
  onModeChange,
  completedGames,
  totalGames,
}: { 
  mode: string; 
  level: number; 
  xp: number; 
  totalXP: number; 
  progress: number;
  onModeChange: () => void;
  completedGames: number;
  totalGames: number;
}) => {
  const modeConfig = GAME_MODES[mode as keyof typeof GAME_MODES];
  
  return (
    <div className="absolute top-0 left-0 right-0 flex flex-wrap justify-between items-stretch z-50 font-mono text-[10px] border-b-2 border-[var(--border-color)] bg-[var(--bg-main)]">
      {/* Left: Player Stats */}
      <div className="flex items-center gap-2 px-3 py-2 border-r-2 border-[var(--border-color)] bg-[var(--bg-card)]">
        <div className="flex flex-col">
          <span className="text-[8px] text-[var(--text-muted)]">LEVEL</span>
          <span className="text-lg font-bold text-[var(--accent-color)] leading-none">{level}</span>
        </div>
        <div className="w-px h-8 bg-[var(--border-color)]" />
        <div className="flex flex-col">
          <span className="text-[8px] text-[var(--text-muted)]">XP</span>
          <span className="text-[var(--text-main)] leading-none">{xp}<span className="text-[var(--text-muted)]">/{totalXP}</span></span>
          <div className="w-20 h-1.5 bg-[var(--bg-main)] border border-[var(--border-color)] mt-1">
            <div 
              className="h-full bg-[var(--accent-color)] transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Center: Title & Controls */}
      <div className="flex-1 flex items-center justify-center gap-4 px-4 py-2">
        <h1 className="text-sm font-bold text-[var(--accent-color)] tracking-wider">
          ◆ EXPLORATION MAP ◆
        </h1>
      </div>

      {/* Right: Mode & Progress */}
      <div className="flex items-center">
        {/* Games Progress */}
        <div className="flex items-center gap-2 px-3 py-2 border-l-2 border-[var(--border-color)] bg-[var(--bg-card)]">
          <span className="text-[8px] text-[var(--text-muted)]">CLEARED</span>
          <span className="text-[var(--accent-color)] font-bold">{completedGames}/{totalGames}</span>
        </div>
        
        {/* Mode Selector */}
        <button 
          onClick={onModeChange}
          className="flex items-center gap-2 px-3 py-2 border-l-2 border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--accent-color)] hover:text-[var(--bg-main)] transition-colors cursor-pointer"
        >
          <span className="text-lg">{modeConfig?.icon}</span>
          <div className="flex flex-col text-left">
            <span className="text-[8px] text-[var(--text-muted)]">MODE</span>
            <span className="text-[10px] font-bold leading-none">{modeConfig?.name}</span>
          </div>
        </button>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// PLAYER CHARACTER COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

const PlayerCharacter = ({ 
  direction, 
  tileSize,
  position,
  mapHeight,
}: { 
  direction: 'up' | 'down' | 'left' | 'right';
  tileSize: number;
  position: { x: number; y: number };
  mapHeight: number;
}) => {
  return (
    <div className="w-full h-full flex items-center justify-center relative">
      {/* "ME" Label pinned inside tile to prevent overflow */}
      <div 
        className="absolute left-1/2 -translate-x-1/2 top-1 px-1 py-0.5 text-[6px] font-bold font-mono whitespace-nowrap z-20 border"
        style={{
          backgroundColor: 'var(--accent-color)',
          color: 'var(--bg-main)',
          borderColor: 'var(--bg-main)',
        }}
      >
        ME
      </div>
      
      {/* Player Body - Eye Style */}
      <div 
        className="relative border-2 border-[var(--bg-main)] bg-[var(--accent-color)]"
        style={{ 
          width: tileSize * 0.7, 
          height: tileSize * 0.7,
          clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)', // Diamond shape
          boxShadow: '0 0 10px var(--accent-color), 0 0 20px var(--accent-color)',
        }}
      >
        {/* Pupil - Direction Indicator */}
        <motion.div
          className="absolute bg-[var(--bg-main)]"
          style={{ 
            width: tileSize * 0.15,
            height: tileSize * 0.15,
            borderRadius: '50%',
          }}
          animate={{
            top: direction === 'up' ? '15%' : direction === 'down' ? '55%' : '35%',
            left: direction === 'left' ? '15%' : direction === 'right' ? '55%' : '35%',
          }}
          transition={{ type: "tween", duration: 0.1 }}
        />
      </div>
      
      {/* Glow effect */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, var(--accent-color) 0%, transparent 70%)',
          opacity: 0.3,
        }}
      />
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN GAME OVERLAY COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export const GameMenuOverlay = () => {
  const router = useRouter();
  const { 
    isMenuOpen, 
    closeMenu, 
    mode,
    setMode,
    progress, 
    totalPossibleXP, 
    currentXPPercentage,
    isGameUnlocked,
    getGameProgress,
    completedGamesCount,
    totalGamesCount,
  } = useGameMode();
  
  const [playerPos, setPlayerPos] = useState({ x: 0, y: 0 });
  const [direction, setDirection] = useState<'up' | 'down' | 'left' | 'right'>('down');
  const [isMoving, setIsMoving] = useState(false);
  const [lastInteraction, setLastInteraction] = useState<string | null>(null);
  const [tileSize, setTileSize] = useState(GRID_SIZE);
  const [pendingNav, setPendingNav] = useState<typeof PAGE_GAMES[number] | null>(null);
  const [hoveredDoor, setHoveredDoor] = useState<string | null>(null);

  const activeDoor = (() => {
    if (hoveredDoor) {
      const hovered = PAGE_GAMES.find(g => g.id === hoveredDoor);
      if (hovered) {
        const doorPos = DOOR_POSITIONS.find(p => PAGE_GAMES[p.gameIndex]?.id === hovered.id);
        return {
          game: hovered,
          x: doorPos?.x ?? -1,
          y: doorPos?.y ?? -1,
          isNear: doorPos
            ? Math.abs(playerPos.x - doorPos.x) <= 2 && Math.abs(playerPos.y - doorPos.y) <= 2
            : false,
        };
      }
    }

    let closest: { game: typeof PAGE_GAMES[number]; x: number; y: number; isNear: boolean; dist: number } | null = null;
    for (const pos of DOOR_POSITIONS) {
      const game = PAGE_GAMES[pos.gameIndex];
      if (!game) continue;
      const dx = Math.abs(playerPos.x - pos.x);
      const dy = Math.abs(playerPos.y - pos.y);
      const isNear = dx <= 2 && dy <= 2;
      if (!isNear) continue;
      const dist = dx + dy;
      if (!closest || dist < closest.dist) {
        closest = { game, x: pos.x, y: pos.y, isNear, dist };
      }
    }
    return closest ? { game: closest.game, x: closest.x, y: closest.y, isNear: true } : null;
  })();
  
  // Handle responsive tile size
  useEffect(() => {
    const updateTileSize = () => {
      setTileSize(getTileSize());
    };
    updateTileSize();
    window.addEventListener('resize', updateTileSize);
    return () => window.removeEventListener('resize', updateTileSize);
  }, []);
  
  // Initialize player position
  useEffect(() => {
    if (isMenuOpen) {
      for (let y = 0; y < MAP_LAYOUT.length; y++) {
        const row = MAP_LAYOUT[y];
        const x = row.indexOf('P');
        if (x !== -1) {
          setPlayerPos({ x, y });
          break;
        }
      }
      setLastInteraction(null);
      setPendingNav(null);
      setHoveredDoor(null);
    }
  }, [isMenuOpen]);

  // Mode cycling
  const cycleMode = useCallback(() => {
    const modes: Array<'god' | 'devil' | 'normal'> = ['normal', 'god', 'devil'];
    const currentIndex = modes.indexOf(mode as any);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    setMode(nextMode);
  }, [mode, setMode]);

  // Check if player is near a door
  const getPlayerNearDoor = useCallback((doorX: number, doorY: number) => {
    const dx = Math.abs(playerPos.x - doorX);
    const dy = Math.abs(playerPos.y - doorY);
    return dx <= 2 && dy <= 2;
  }, [playerPos]);

  // Movement Logic
  const movePlayer = useCallback((dx: number, dy: number) => {
    if (isMoving || pendingNav) return;

    setPlayerPos(prev => {
      const newX = prev.x + dx;
      const newY = prev.y + dy;

      if (newY < 0 || newY >= MAP_LAYOUT.length || newX < 0 || newX >= MAP_LAYOUT[0].length) {
        return prev;
      }

      const tile = MAP_LAYOUT[newY][newX];
      if (tile === 'W') return prev;

      // Door interaction
      if (/[1-7]/.test(tile)) {
        const gameIndex = parseInt(tile) - 1;
        const game = PAGE_GAMES[gameIndex];
        if (game && isGameUnlocked(game.id)) {
          setPendingNav(game);
          setLastInteraction(`Enter ${game.title}? Press Enter to confirm, Esc to cancel.`);
          return prev;
        } else if (game) {
          setLastInteraction(`🔒 ${game.title} is locked!`);
          setTimeout(() => setLastInteraction(null), 1500);
          return prev;
        }
      }

      return { x: newX, y: newY };
    });

    if (dx > 0) setDirection('right');
    if (dx < 0) setDirection('left');
    if (dy > 0) setDirection('down');
    if (dy < 0) setDirection('up');
  }, [isMoving, pendingNav, isGameUnlocked]);

  // Keyboard Controls
  useEffect(() => {
    if (!isMenuOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (pendingNav) {
        if (e.key === 'Enter') {
          setLastInteraction(`Entering ${pendingNav.title}...`);
          router.push(pendingNav.path);
          closeMenu();
          setPendingNav(null);
          return;
        }
        if (e.key === 'Escape') {
          setPendingNav(null);
          setLastInteraction(null);
          return;
        }
      }

      switch (e.key) {
        case 'ArrowUp': case 'w': case 'W':
          movePlayer(0, -1);
          break;
        case 'ArrowDown': case 's': case 'S':
          movePlayer(0, 1);
          break;
        case 'ArrowLeft': case 'a': case 'A':
          movePlayer(-1, 0);
          break;
        case 'ArrowRight': case 'd': case 'D':
          movePlayer(1, 0);
          break;
        case 'Escape':
          closeMenu();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMenuOpen, movePlayer, closeMenu, pendingNav, router]);

  // Click/Touch Movement with BFS pathfinding
  const handleTileClick = useCallback((targetX: number, targetY: number) => {
    if (isMoving) return;
    
    const targetTile = MAP_LAYOUT[targetY][targetX];
    if (targetTile === 'W') return;

    const start = playerPos;
    const end = { x: targetX, y: targetY };
    
    const queue = [{ pos: start, path: [] as {x: number, y: number}[] }];
    const visited = new Set<string>();
    visited.add(`${start.x},${start.y}`);

    let path: {x: number, y: number}[] = [];

    while (queue.length > 0) {
      const { pos, path: currPath } = queue.shift()!;
      
      if (pos.x === end.x && pos.y === end.y) {
        path = currPath;
        break;
      }

      const neighbors = [
        { x: pos.x + 1, y: pos.y },
        { x: pos.x - 1, y: pos.y },
        { x: pos.x, y: pos.y + 1 },
        { x: pos.x, y: pos.y - 1 },
      ];

      for (const n of neighbors) {
        if (n.y >= 0 && n.y < MAP_LAYOUT.length && n.x >= 0 && n.x < MAP_LAYOUT[0].length) {
          const tile = MAP_LAYOUT[n.y][n.x];
          if (tile !== 'W' && !visited.has(`${n.x},${n.y}`)) {
            visited.add(`${n.x},${n.y}`);
            queue.push({ pos: n, path: [...currPath, n] });
          }
        }
      }
    }

    if (path.length > 0) {
      setIsMoving(true);
      let step = 0;
      const interval = setInterval(() => {
        if (step >= path.length) {
          clearInterval(interval);
          setIsMoving(false);
          
          const finalTile = MAP_LAYOUT[end.y][end.x];
          if (/[1-7]/.test(finalTile)) {
            const gameIndex = parseInt(finalTile) - 1;
            const game = PAGE_GAMES[gameIndex];
            if (game && isGameUnlocked(game.id)) {
              setLastInteraction(`Entering ${game.title}...`);
              setTimeout(() => {
                router.push(game.path);
                closeMenu();
              }, 400);
            } else if (game) {
              setLastInteraction(`🔒 ${game.title} is locked!`);
              setTimeout(() => setLastInteraction(null), 1500);
            }
          }
          return;
        }
        
        const nextPos = path[step];
        const prevPos = step === 0 ? playerPos : path[step - 1];
        
        if (nextPos.x > prevPos.x) setDirection('right');
        else if (nextPos.x < prevPos.x) setDirection('left');
        else if (nextPos.y > prevPos.y) setDirection('down');
        else if (nextPos.y < prevPos.y) setDirection('up');
        
        setPlayerPos(nextPos);
        step++;
      }, 80);
    }
  }, [playerPos, isMoving, router, closeMenu, isGameUnlocked]);

  const currentLevel = Math.floor(progress.totalXP / 100) + 1;
  
  // Map dimensions
  const mapWidth = MAP_LAYOUT[0].length * tileSize;
  const mapHeight = MAP_LAYOUT.length * tileSize;

  return (
    <AnimatePresence>
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-[var(--bg-main)] flex flex-col overflow-hidden font-mono"
        >
          {/* HUD */}
          <StatsHUD 
            mode={mode}
            level={currentLevel}
            xp={progress.totalXP}
            totalXP={totalPossibleXP}
            progress={currentXPPercentage}
            onModeChange={cycleMode}
            completedGames={completedGamesCount}
            totalGames={totalGamesCount}
          />

          {/* Door Info Panel (avoids tooltip collisions) */}
          {activeDoor && (() => {
            const isUnlocked = isGameUnlocked(activeDoor.game.id);
            const isCompleted = getGameProgress(activeDoor.game.id) === 100;
            return (
              <div className="absolute top-16 left-1/2 -translate-x-1/2 z-[70] w-[min(520px,calc(100vw-32px))]">
                <div className="bg-[var(--bg-card)] border-2 border-[var(--border-color)] shadow-[4px_4px_0_0_var(--border-color)] px-4 py-3">
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 mt-0.5">
                      <PixelIcon name={activeDoor.game.icon} size={22} className="text-[var(--accent-color)]" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="text-[12px] font-bold text-[var(--accent-color)] tracking-wide">{activeDoor.game.title}</div>
                        <div className="text-[10px] text-[var(--text-muted)]">{activeDoor.game.subtitle}</div>
                      </div>
                      <div className="mt-2 text-[11px] leading-snug text-[var(--text-main)] opacity-90">
                        {activeDoor.game.description}
                      </div>
                      <div className="mt-2 flex items-center gap-3 flex-wrap text-[10px]">
                        <span className={cn(
                          "px-2 py-0.5 border",
                          isCompleted
                            ? "border-green-400 text-green-400"
                            : isUnlocked
                              ? "border-[var(--accent-color)] text-[var(--accent-color)]"
                              : "border-[var(--border-color)] text-[var(--text-muted)]"
                        )}>
                          {isCompleted ? '✓ CLEARED' : isUnlocked ? '◆ UNLOCKED' : '✕ LOCKED'}
                        </span>
                        {isUnlocked && activeDoor.isNear && (
                          <span className="text-[var(--text-muted)]">Press <span className="text-[var(--text-main)]">Enter</span> to open</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Game Area */}
          <div className="flex-1 flex items-center justify-center p-4 pt-16 overflow-auto">
            {/* Map Container as CSS grid to prevent overflow issues */}
            <div 
              className="relative border-2 border-[var(--border-color)] bg-[var(--bg-card)] overflow-visible grid"
              style={{
                width: mapWidth,
                height: mapHeight,
                gridTemplateColumns: `repeat(${MAP_LAYOUT[0].length}, ${tileSize}px)`,
                gridTemplateRows: `repeat(${MAP_LAYOUT.length}, ${tileSize}px)`,
              }}
            >
              {/* Render Map Tiles */}
              {MAP_LAYOUT.map((row, y) => (
                row.split('').map((tile, x) => {
                  const isWall = tile === 'W';
                  const isDoor = /[1-7]/.test(tile);
                  
                  let game = null;
                  let isUnlocked = false;
                  let isCompleted = false;
                  let isPlayerNearDoor = false;
                  let isDoorHighlighted = false;
                  
                  if (isDoor) {
                    const index = parseInt(tile) - 1;
                    game = PAGE_GAMES[index];
                    if (game) {
                      isUnlocked = isGameUnlocked(game.id);
                      isCompleted = getGameProgress(game.id) === 100;
                      isPlayerNearDoor = getPlayerNearDoor(x, y);
                      isDoorHighlighted = isPlayerNearDoor || hoveredDoor === game.id;
                    }
                  }

                  return (
                    <div
                      key={`${x}-${y}`}
                      onClick={() => !isWall && handleTileClick(x, y)}
                      onMouseEnter={() => {
                        if (isDoor && game) setHoveredDoor(game.id);
                      }}
                      onMouseLeave={() => {
                        setHoveredDoor(null);
                      }}
                      className={cn(
                        "relative group",
                        isDoorHighlighted && "z-40",
                        isWall ? "cursor-default" : "cursor-pointer hover:brightness-110"
                      )}
                      style={{
                        gridColumnStart: x + 1,
                        gridRowStart: y + 1,
                      }}
                    >
                      {/* Wall */}
                      {isWall && (
                        <div 
                          className="absolute inset-0 bg-[var(--border-color)]"
                          style={{
                            boxShadow: 'inset 2px 2px 0 var(--bg-card), inset -2px -2px 0 var(--bg-main)',
                          }}
                        />
                      )}
                      
                      {/* Door */}
                      {isDoor && game && (
                        <EyeDoor
                          game={game}
                          isUnlocked={isUnlocked}
                          isCompleted={isCompleted}
                          tileSize={tileSize}
                          isPlayerNear={isPlayerNearDoor}
                          isHovered={hoveredDoor === game.id}
                        />
                      )}
                    </div>
                  );
                })
              ))}

              {/* Player Character anchored to grid cell */}
              <motion.div
                layout
                className="relative z-30 pointer-events-none"
                style={{
                  gridColumnStart: playerPos.x + 1,
                  gridRowStart: playerPos.y + 1,
                  width: tileSize,
                  height: tileSize,
                }}
                transition={{ type: "tween", ease: "linear", duration: 0.08 }}
              >
                <PlayerCharacter 
                  direction={direction} 
                  tileSize={tileSize}
                  position={playerPos}
                  mapHeight={mapHeight}
                />
              </motion.div>
            </div>
          </div>
          
            {/* Confirmation Prompt */}
            <AnimatePresence>
              {pendingNav && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-[var(--bg-card)] border-2 border-[var(--accent-color)] px-4 py-2 text-[var(--text-main)] text-xs font-mono z-50 shadow-[4px_4px_0_0_var(--border-color)]"
                >
                  <div className="text-[var(--accent-color)] font-bold">Enter {pendingNav.title}?</div>
                  <div className="text-[10px] text-[var(--text-muted)]">Press Enter to confirm, Esc to cancel.</div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Interaction Feedback */}
          <AnimatePresence>
            {lastInteraction && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-[var(--bg-card)] border-2 border-[var(--accent-color)] px-4 py-2 text-[var(--accent-color)] text-xs font-mono z-50 shadow-[4px_4px_0_0_var(--border-color)]"
              >
                {lastInteraction}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer Controls */}
          <div className="py-3 px-4 text-center border-t-2 border-[var(--border-color)] bg-[var(--bg-card)]">
            <div className="text-[var(--text-muted)] text-[10px] font-mono flex items-center justify-center gap-4 flex-wrap">
              <span>[W/A/S/D] MOVE</span>
              <span>•</span>
              <span>[CLICK] AUTO-PATH</span>
              <span>•</span>
              <span>[ENTER] CONFIRM DOOR</span>
              <span>•</span>
              <span>[ESC] CANCEL</span>
              <span>•</span>
              <span>[ESC] CLOSE</span>
              <span>•</span>
              <span className="text-[var(--accent-color)]">◆ = DOOR</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GameMenuOverlay;
