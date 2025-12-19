'use client';

/**
 * FullPageGridArcade Component
 *
 * Renders the snake game directly on the portfolio's full-page grid.
 * The game overlays the existing content without blocking interaction.
 *
 * Features:
 * - Uses the entire viewport as the game grid
 * - Aligns with the 20px CSS grid pattern
 * - Non-blocking - page content remains interactive
 * - Snake segments render as filled grid cells
 */

import React, { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { GridGameEngine, GridCell, GameRenderState } from './types';
import { getGameEntry, getDefaultGameId } from './game-registry';
import { useGridGameLoop } from './use-grid-game-loop';
import { GRID_SIZE } from '@/lib/utils';

interface FullPageGridArcadeProps {
  /** Whether the game is active */
  isActive: boolean;
  /** Callback when game state changes */
  onScoreChange?: (score: number) => void;
  /** Game ID to load */
  gameId?: string;
}

export const FullPageGridArcade: React.FC<FullPageGridArcadeProps> = ({
  isActive,
  onScoreChange,
  gameId = getDefaultGameId(),
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [renderState, setRenderState] = useState<GameRenderState>({});
  const [gridDimensions, setGridDimensions] = useState({ cols: 0, rows: 0 });
  const [, forceUpdate] = useState({});

  // Calculate grid dimensions based on viewport
  useEffect(() => {
    const updateDimensions = () => {
      const cols = Math.floor(window.innerWidth / GRID_SIZE);
      const rows = Math.floor(window.innerHeight / GRID_SIZE);
      setGridDimensions({ cols, rows });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Create game engine instance
  const engine = useMemo<GridGameEngine | null>(() => {
    if (gridDimensions.cols === 0 || gridDimensions.rows === 0) return null;

    const entry = getGameEntry(gameId);
    if (!entry) return null;

    const newEngine = entry.createEngine();
    newEngine.init(gridDimensions.cols, gridDimensions.rows);
    return newEngine;
  }, [gameId, gridDimensions.cols, gridDimensions.rows]);

  // Reinitialize engine when dimensions change
  useEffect(() => {
    if (engine && gridDimensions.cols > 0 && gridDimensions.rows > 0) {
      engine.init(gridDimensions.cols, gridDimensions.rows);
      setRenderState(engine.renderState());
    }
  }, [engine, gridDimensions]);

  // Update render state on each frame
  const handleFrame = useCallback(() => {
    if (engine) {
      const state = engine.renderState();
      setRenderState(state);
      if (state.score !== undefined) {
        onScoreChange?.(state.score);
      }
    }
  }, [engine, onScoreChange]);

  // Run game loop
  useGridGameLoop({
    engine,
    isRunning: isActive,
    onFrame: handleFrame,
  });

  // Reset game when activated
  useEffect(() => {
    if (isActive && engine) {
      engine.reset();
      setRenderState(engine.renderState());
    }
  }, [isActive, engine]);

  // Convert pointer position to grid cell
  const pointerToCell = useCallback(
    (clientX: number, clientY: number): GridCell => {
      const x = Math.floor(clientX / GRID_SIZE);
      const y = Math.floor(clientY / GRID_SIZE);
      return { x, y };
    },
    []
  );

  // Handle pointer move on the entire document when game is active
  useEffect(() => {
    if (!isActive || !engine) return;

    const handlePointerMove = (e: PointerEvent) => {
      const cell = pointerToCell(e.clientX, e.clientY);
      engine.onPointerMove(cell);
      forceUpdate({});
    };

    const handlePointerLeave = () => {
      engine.onPointerLeave();
      forceUpdate({});
    };

    const handleClick = (e: MouseEvent) => {
      const cell = pointerToCell(e.clientX, e.clientY);
      engine.onClick(cell);
      forceUpdate({});
    };

    // Listen on document for full-page coverage
    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerleave', handlePointerLeave);
    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerleave', handlePointerLeave);
      document.removeEventListener('click', handleClick);
    };
  }, [isActive, engine, pointerToCell]);

  if (!isActive) return null;

  // Track occupied grid positions to prevent overlap
  const occupiedPositions = new Set<string>();
  const getOccupiedKey = (x: number, y: number) => `${x},${y}`;
  
  // Filter food items to prevent overlap
  const filteredFood = renderState.food?.filter(f => {
    const width = f.labelWidth || 1;
    // Check if any cell in this item's range is already occupied
    for (let dx = 0; dx < width; dx++) {
      if (occupiedPositions.has(getOccupiedKey(f.x + dx, f.y))) {
        return false; // Skip this item, position taken
      }
    }
    // Mark cells as occupied
    for (let dx = 0; dx < width; dx++) {
      occupiedPositions.add(getOccupiedKey(f.x + dx, f.y));
    }
    return true;
  }) || [];

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-10 pointer-events-none"
      aria-hidden="true"
    >
      {/* Render Food/Portfolio Items */}
      <AnimatePresence>
        {filteredFood.map((f, i) => {
          const cellWidth = f.labelWidth || 1;
          const width = cellWidth * GRID_SIZE;
          const hasLabel = f.label && f.labelWidth;
          
          return (
            <motion.div
              key={`food-${f.x}-${f.y}-${i}`}
              className={`absolute flex items-center ${hasLabel ? 'gap-1 px-1' : 'justify-center'} ${f.interactive ? 'cursor-pointer pointer-events-auto hover:brightness-110' : ''}`}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring' as const, damping: 20, stiffness: 400 }}
              style={{
                left: f.x * GRID_SIZE,
                top: f.y * GRID_SIZE,
                width: width,
                height: GRID_SIZE,
                backgroundColor: hasLabel ? f.color : (f.icon ? 'transparent' : f.color),
                borderRadius: '2px',
                fontSize: hasLabel ? '10px' : (f.icon ? `${GRID_SIZE - 4}px` : undefined),
                lineHeight: 1,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                zIndex: 15,
              }}
            >
              {f.icon && (
                <span style={{ 
                  filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.2))',
                  fontSize: hasLabel ? '12px' : undefined,
                  flexShrink: 0,
                }}>
                  {f.icon}
                </span>
              )}
              {hasLabel && (
                <span 
                  className="font-medium truncate"
                  style={{ 
                    color: '#fff',
                    textShadow: '0 1px 1px rgba(0,0,0,0.3)',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {f.label}
                </span>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Render Snake Segments */}
      {renderState.segments?.map((seg, i) => (
        <div
          key={`seg-${i}`}
          className="absolute"
          style={{
            left: seg.x * GRID_SIZE + 1,
            top: seg.y * GRID_SIZE + 1,
            width: GRID_SIZE - 2,
            height: GRID_SIZE - 2,
            backgroundColor: seg.color,
            opacity: seg.opacity,
            borderRadius: i === 0 ? '3px' : '2px',
            transform: i === 0 ? 'scale(1.05)' : 'scale(1)',
            transition: 'opacity 0.1s ease-out',
          }}
        />
      ))}
    </div>
  );
};

export default FullPageGridArcade;
