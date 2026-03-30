'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useGameMode } from '@/contexts/GameModeContext';
import { cn, GRID_SIZE } from '@/lib/utils';
import { PAGE_GAMES } from '@/data/game-navigation-data';
import PixelIcon from '@/components/ui/PixelIcon';

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS - Using existing GRID_SIZE from utils
// ═══════════════════════════════════════════════════════════════════════════════

// Responsive tile size based on viewport - mobile-first approach
const getTileSize = () => {
  if (typeof globalThis === 'undefined') return GRID_SIZE;
  const vw = globalThis.innerWidth;
  const vh = globalThis.innerHeight;
  
  // Map dimensions
  const mapCols = MAP_LAYOUT[0].length;
  const mapRows = MAP_LAYOUT.length;
  
  // Calculate available space (accounting for header, padding, footer)
  const headerHeight = 60; // Header height
  const footerHeight = 50; // Footer height
  const padding = 16; // Padding on all sides
  const availableWidth = vw - (padding * 2);
  const availableHeight = vh - headerHeight - footerHeight - (padding * 2);
  
  // Calculate tile size to fit map in viewport
  const tileFromWidth = Math.floor(availableWidth / mapCols);
  const tileFromHeight = Math.floor(availableHeight / mapRows);
  
  // Use the smaller dimension to ensure map fits, but maintain minimum size
  const calculatedSize = Math.min(tileFromWidth, tileFromHeight);
  
  // Set minimum and maximum tile sizes
  const minTileSize = 12; // Minimum for very small screens
  const maxTileSize = 32; // Maximum for large screens
  
  return Math.max(minTileSize, Math.min(calculatedSize, maxTileSize));
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAP DATA - Compact responsive maze
// ═══════════════════════════════════════════════════════════════════════════════

// W: Wall, .: Floor, P: Player Start
// 1-5, 7-8: Doors to games (Home, About, Work, Case Studies, Progress, Contact, Blog)
// Position 6 (arcade) removed
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
  "W..5........W........7..W",
  "W..W..WWWW..W..WWWW..W..W",
  "W.....W.....8........W..W",
  "WWWWWWWWWWWWWWWWWWWWWWWWW",
];

// Filter PAGE_GAMES to exclude arcade and lab
const NAVIGATION_GAMES = PAGE_GAMES.filter(game => 
  game.id !== 'arcade' && game.id !== 'lab'
);

// Map position to game index (1-5, 7-8 map to filtered games)
// Position 6 (arcade) is removed
const POSITION_TO_GAME_INDEX: Record<number, number> = {
  1: 0, // home
  2: 1, // about
  3: 2, // work
  4: 3, // case-studies
  5: 4, // progress
  7: 5, // contact (keeping in original position)
  8: 6, // blog
};

// Precompute door tile positions from the map (1-5, 7-8)
const DOOR_POSITIONS = (() => {
  const positions: Array<{ x: number; y: number; gameIndex: number }> = [];
  for (let y = 0; y < MAP_LAYOUT.length; y++) {
    const row = MAP_LAYOUT[y];
    for (let x = 0; x < row.length; x++) {
      const ch = row[x];
      const position = parseInt(ch, 10);
      if ((position >= 1 && position <= 5) || position === 7 || position === 8) {
        const gameIndex = POSITION_TO_GAME_INDEX[position];
        if (gameIndex !== undefined) {
          positions.push({ x, y, gameIndex });
        }
      }
    }
  }
  return positions;
})();

// ═══════════════════════════════════════════════════════════════════════════════
// SIMPLIFIED NAME MAPPING
// ═══════════════════════════════════════════════════════════════════════════════

const getSimplifiedName = (gameId: string): string => {
  const nameMap: Record<string, string> = {
    'home': 'HOME',
    'about': 'ABOUT',
    'work': 'EXPERIENCE',
    'case-studies': 'CASE STUDY',
    'contact': 'CONTACT',
    'progress': 'PROGRESS',
    'blog': 'BLOG',
  };
  return nameMap[gameId] || gameId.toUpperCase();
};

// ═══════════════════════════════════════════════════════════════════════════════
// EYE DOOR COMPONENT - Kiruk signature style
// ═══════════════════════════════════════════════════════════════════════════════

const EyeDoor = ({ 
  game, 
  tileSize,
  isPlayerNear,
  isHovered,
}: { 
  game: typeof NAVIGATION_GAMES[0];
  tileSize: number;
  isPlayerNear: boolean;
  isHovered: boolean;
}) => {
  const isHighlighted = isPlayerNear || isHovered;
  const simplifiedName = getSimplifiedName(game.id);

  return (
    <div className={cn(
      "absolute inset-0 flex items-center justify-center transition-all duration-300 group",
      isHighlighted && "scale-105 filter drop-shadow-[0_0_10px_var(--accent-color)]"
    )}>
      {/* Door Container */}
      <div 
        className={cn(
          "relative flex items-center justify-center border-2 transition-all duration-300",
          "bg-[var(--bg-card)] border-[var(--accent-color)]"
        )}
        style={{ 
          width: tileSize - 4, 
          height: tileSize - 4,
          clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)', // Diamond/Eye shape
          boxShadow: isHighlighted ? '0 0 0 2px var(--accent-color)' : 'none',
        }}
      >
        {/* Pixel Icon */}
        <motion.div
          className="text-center"
          animate={isPlayerNear ? { scale: [1, 1.15, 1] } : {}}
          transition={{ duration: 0.5, repeat: isPlayerNear ? Infinity : 0 }}
          style={{ width: tileSize * 0.45, height: tileSize * 0.45 }}
        >
          <PixelIcon name={game.icon} size={tileSize * 0.45} className="text-[var(--accent-color)]" />
        </motion.div>
      </div>
      
      {/* Simplified Name Label */}
      <div className="absolute -bottom-6 sm:-bottom-7 left-1/2 -translate-x-1/2 px-1.5 sm:px-2 py-0.5 sm:py-1 text-[8px] sm:text-[10px] font-mono font-bold bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--accent-color)] shadow-[2px_2px_0_0_var(--border-color)] z-20 whitespace-nowrap text-center">
        {simplifiedName}
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
  position: _position,
  mapHeight: _mapHeight,
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
  } = useGameMode();
  
  const [playerPos, setPlayerPos] = useState({ x: 0, y: 0 });
  const [direction, setDirection] = useState<'up' | 'down' | 'left' | 'right'>('down');
  const [isMoving, setIsMoving] = useState(false);
  const [lastInteraction, setLastInteraction] = useState<string | null>(null);
  const [tileSize, setTileSize] = useState(GRID_SIZE);
  const [pendingNav, setPendingNav] = useState<typeof NAVIGATION_GAMES[number] | null>(null);
  const [hoveredDoor, setHoveredDoor] = useState<string | null>(null);
  const [mapScale, setMapScale] = useState(1);
  const [mapOffset, setMapOffset] = useState({ x: 0, y: 0 });

  const activeDoor = (() => {
    if (hoveredDoor) {
      const hovered = NAVIGATION_GAMES.find(g => g.id === hoveredDoor);
      if (hovered) {
        const doorPos = DOOR_POSITIONS.find(p => NAVIGATION_GAMES[p.gameIndex]?.id === hovered.id);
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

    let closest: { game: typeof NAVIGATION_GAMES[number]; x: number; y: number; isNear: boolean; dist: number } | null = null;
    for (const pos of DOOR_POSITIONS) {
      const game = NAVIGATION_GAMES[pos.gameIndex];
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
  
  // Handle responsive tile size and map scaling
  useEffect(() => {
    const updateTileSize = () => {
      const newTileSize = getTileSize();
      setTileSize(newTileSize);
      
      // Calculate if map needs scaling/centering
      const mapWidth = MAP_LAYOUT[0].length * newTileSize;
      const mapHeight = MAP_LAYOUT.length * newTileSize;
      const vw = globalThis.innerWidth;
      const vh = globalThis.innerHeight;
      const headerHeight = 60;
      const footerHeight = 50;
      const padding = 16;
      const availableWidth = vw - (padding * 2);
      const availableHeight = vh - headerHeight - footerHeight - (padding * 2);
      
      // Calculate scale to fit map in viewport (only scale down if needed)
      const scaleX = availableWidth / mapWidth;
      const scaleY = availableHeight / mapHeight;
      const scale = Math.min(scaleX, scaleY, 1); // Don't scale up, only down
      
      setMapScale(scale);
      
      // Center the map if it fits, otherwise allow scrolling
      if (scale < 1) {
        // Map is scaled down, center it
        const scaledWidth = mapWidth * scale;
        const scaledHeight = mapHeight * scale;
        const offsetX = (availableWidth - scaledWidth) / 2;
        const offsetY = (availableHeight - scaledHeight) / 2;
        setMapOffset({ x: offsetX, y: offsetY });
      } else {
        // Map fits without scaling, center it
        const offsetX = (availableWidth - mapWidth) / 2;
        const offsetY = (availableHeight - mapHeight) / 2;
        setMapOffset({ x: Math.max(0, offsetX), y: Math.max(0, offsetY) });
      }
    };
    
    updateTileSize();
    const resizeObserver = new ResizeObserver(updateTileSize);
    if (globalThis.document) {
      resizeObserver.observe(globalThis.document.body);
    }
    globalThis.addEventListener('resize', updateTileSize);
    return () => {
      globalThis.removeEventListener('resize', updateTileSize);
      resizeObserver.disconnect();
    };
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
      const doorPosition = parseInt(tile, 10);
      if ((doorPosition >= 1 && doorPosition <= 5) || doorPosition === 7) {
        const gameIndex = POSITION_TO_GAME_INDEX[doorPosition];
        if (gameIndex !== undefined) {
          const game = NAVIGATION_GAMES[gameIndex];
          if (game) {
            setPendingNav(game);
            const simplifiedName = getSimplifiedName(game.id);
            setLastInteraction(`Enter ${simplifiedName}? Press Enter to confirm, Esc to cancel.`);
            return prev;
          }
        }
      }

      return { x: newX, y: newY };
    });

    if (dx > 0) setDirection('right');
    if (dx < 0) setDirection('left');
    if (dy > 0) setDirection('down');
    if (dy < 0) setDirection('up');
  }, [isMoving, pendingNav]);

  // Keyboard Controls
  useEffect(() => {
    if (!isMenuOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Handle Enter key - check if near a door or if pendingNav is set
      if (e.key === 'Enter') {
        if (pendingNav) {
          // Confirm navigation - close menu first, then navigate
          const targetPath = pendingNav.path;
          closeMenu();
          setPendingNav(null);
          setLastInteraction(null);
          // Small delay to ensure menu closes before navigation
          setTimeout(() => {
            router.push(targetPath);
          }, 100);
          return;
        } else {
          // Check if player is near any door
          for (const pos of DOOR_POSITIONS) {
            const dx = Math.abs(playerPos.x - pos.x);
            const dy = Math.abs(playerPos.y - pos.y);
            if (dx <= 2 && dy <= 2) {
              const game = NAVIGATION_GAMES[pos.gameIndex];
              if (game) {
                setPendingNav(game);
                const simplifiedName = getSimplifiedName(game.id);
                setLastInteraction(`Enter ${simplifiedName}? Press Enter to confirm, Esc to cancel.`);
                return;
              }
            }
          }
        }
      }

      // Handle Escape key
      if (e.key === 'Escape') {
        if (pendingNav) {
          setPendingNav(null);
          setLastInteraction(null);
          return;
        } else {
          closeMenu();
          return;
        }
      }

      // Movement keys (only if not pending navigation)
      if (!pendingNav) {
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
        }
      }
    };

    globalThis.addEventListener('keydown', handleKeyDown);
    return () => globalThis.removeEventListener('keydown', handleKeyDown);
  }, [isMenuOpen, movePlayer, closeMenu, pendingNav, router, playerPos]);

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
          const doorPosition = parseInt(finalTile, 10);
          if ((doorPosition >= 1 && doorPosition <= 5) || doorPosition === 7) {
            const gameIndex = POSITION_TO_GAME_INDEX[doorPosition];
            if (gameIndex !== undefined) {
              const game = NAVIGATION_GAMES[gameIndex];
              if (game) {
                const targetPath = game.path;
                closeMenu();
                setTimeout(() => {
                  router.push(targetPath);
                }, 100);
              }
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
  }, [playerPos, isMoving, router, closeMenu]);
  
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
          {/* Simple Header */}
          <div className="absolute top-0 left-0 right-0 flex items-center justify-between py-2 sm:py-3 px-4 border-b-2 border-[var(--border-color)] bg-[var(--bg-card)] z-50">
            <div className="flex-1" /> {/* Spacer for centering */}
            <h1 className="text-xs sm:text-sm font-bold text-[var(--accent-color)] tracking-wider">
              NAVIGATION MAP
            </h1>
            <div className="flex-1 flex justify-end">
              <button
                onClick={() => {
                  router.push('/');
                  closeMenu();
                }}
                className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 border-2 border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--accent-color)] hover:text-[var(--bg-main)] transition-colors duration-150"
                aria-label="Go to home"
                title="Go to home"
              >
                <PixelIcon name="home" size={16} className="sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>

          {/* Door Info Panel */}
          {activeDoor && activeDoor.isNear && (
            <div className="absolute top-12 sm:top-16 left-1/2 -translate-x-1/2 z-[70] w-[min(280px,calc(100vw-32px))] sm:w-[min(320px,calc(100vw-32px))]">
              <div className="bg-[var(--bg-card)] border-2 border-[var(--accent-color)] shadow-[4px_4px_0_0_var(--border-color)] px-3 py-2 sm:px-4 sm:py-3">
                <div className="flex items-center gap-2 sm:gap-3">
                  <PixelIcon name={activeDoor.game.icon} size={18} className="text-[var(--accent-color)] sm:w-5 sm:h-5" />
                  <div className="text-[11px] sm:text-[12px] font-bold text-[var(--accent-color)] tracking-wide">
                    {getSimplifiedName(activeDoor.game.id)}
                  </div>
                </div>
                <div className="mt-1.5 sm:mt-2 text-[9px] sm:text-[10px] text-[var(--text-muted)]">
                  Press <span className="text-[var(--text-main)] font-bold">Enter</span> to open
                </div>
              </div>
            </div>
          )}

          {/* Game Area - Scrollable container for mobile */}
          <div className="flex-1 overflow-auto p-2 sm:p-4 pt-16 sm:pt-20">
            {/* Map Container Wrapper - Centers and scales map */}
            <div 
              className="relative mx-auto flex items-center justify-center min-h-full"
              style={{
                minWidth: mapWidth * mapScale,
                minHeight: mapHeight * mapScale,
                padding: `${mapOffset.y}px ${mapOffset.x}px`,
              }}
            >
              {/* Map Container as CSS grid */}
              <div 
                className="relative border-2 border-[var(--border-color)] bg-[var(--bg-card)] overflow-visible grid"
                style={{
                  width: mapWidth,
                  height: mapHeight,
                  transform: mapScale < 1 ? `scale(${mapScale})` : 'none',
                  transformOrigin: 'center center',
                  gridTemplateColumns: `repeat(${MAP_LAYOUT[0].length}, ${tileSize}px)`,
                  gridTemplateRows: `repeat(${MAP_LAYOUT.length}, ${tileSize}px)`,
                }}
              >
              {/* Render Map Tiles */}
              {MAP_LAYOUT.map((row, y) => (
                row.split('').map((tile, x) => {
                  const isWall = tile === 'W';
                  const doorPosition = parseInt(tile, 10);
                  const isDoor = (doorPosition >= 1 && doorPosition <= 5) || doorPosition === 7 || doorPosition === 8;
                  
                  let game = null;
                  let isPlayerNearDoor = false;
                  let isDoorHighlighted = false;
                  
                  if (isDoor) {
                    const position = parseInt(tile, 10);
                    const gameIndex = POSITION_TO_GAME_INDEX[position];
                    if (gameIndex !== undefined) {
                      game = NAVIGATION_GAMES[gameIndex];
                      if (game) {
                        isPlayerNearDoor = getPlayerNearDoor(x, y);
                        isDoorHighlighted = isPlayerNearDoor || hoveredDoor === game.id;
                      }
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
          </div>
          
          {/* Confirmation Prompt */}
          <AnimatePresence>
            {pendingNav && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-20 sm:bottom-24 left-1/2 -translate-x-1/2 bg-[var(--bg-card)] border-2 border-[var(--accent-color)] px-3 py-2 sm:px-4 sm:py-2 text-[var(--text-main)] text-xs font-mono z-50 shadow-[4px_4px_0_0_var(--border-color)] max-w-[calc(100vw-32px)]"
              >
                <div className="text-[var(--accent-color)] font-bold text-[11px] sm:text-xs">Enter {getSimplifiedName(pendingNav.id)}?</div>
                <div className="text-[9px] sm:text-[10px] text-[var(--text-muted)]">Press Enter to confirm, Esc to cancel.</div>
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
                className="absolute bottom-12 sm:bottom-16 left-1/2 -translate-x-1/2 bg-[var(--bg-card)] border-2 border-[var(--accent-color)] px-3 py-2 sm:px-4 sm:py-2 text-[var(--accent-color)] text-[10px] sm:text-xs font-mono z-50 shadow-[4px_4px_0_0_var(--border-color)] max-w-[calc(100vw-32px)] text-center"
              >
                {lastInteraction}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer Controls */}
          <div className="absolute bottom-0 left-0 right-0 py-2 sm:py-3 px-2 sm:px-4 text-center border-t-2 border-[var(--border-color)] bg-[var(--bg-card)]">
            <div className="text-[var(--text-muted)] text-[8px] sm:text-[10px] font-mono flex items-center justify-center gap-2 sm:gap-4 flex-wrap">
              <span className="hidden sm:inline">[W/A/S/D] MOVE</span>
              <span className="sm:hidden">[TAP] MOVE</span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline">[CLICK] AUTO-PATH</span>
              <span className="sm:hidden">[TAP] PATH</span>
              <span className="hidden sm:inline">•</span>
              <span>[ENTER] OPEN</span>
              <span className="hidden sm:inline">•</span>
              <span>[ESC] CLOSE</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GameMenuOverlay;
