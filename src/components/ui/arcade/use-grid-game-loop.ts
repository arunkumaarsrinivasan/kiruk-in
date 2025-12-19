/**
 * useGridGameLoop Hook
 *
 * A custom hook that manages the game loop using requestAnimationFrame.
 * Provides consistent timing and frame updates for grid games.
 */

import { useEffect, useRef, useCallback } from 'react';
import type { GridGameEngine } from './types';

interface UseGridGameLoopOptions {
  /** The game engine to update */
  engine: GridGameEngine | null;
  /** Whether the game loop should be running */
  isRunning: boolean;
  /** Callback fired after each update with the current render state */
  onFrame?: () => void;
}

/**
 * Hook that runs a game loop using requestAnimationFrame.
 * Automatically handles start/stop based on isRunning prop.
 */
export function useGridGameLoop({
  engine,
  isRunning,
  onFrame,
}: UseGridGameLoopOptions): void {
  const lastTimeRef = useRef<number>(0);
  const frameIdRef = useRef<number | null>(null);

  const loop = useCallback(
    (timestamp: number) => {
      if (!engine) return;

      // Calculate delta time
      const dt = lastTimeRef.current ? timestamp - lastTimeRef.current : 16.67;
      lastTimeRef.current = timestamp;

      // Cap delta time to prevent huge jumps (e.g., when tab was inactive)
      const cappedDt = Math.min(dt, 100);

      // Update the game engine
      engine.update(cappedDt);

      // Notify subscriber
      onFrame?.();

      // Schedule next frame
      frameIdRef.current = requestAnimationFrame(loop);
    },
    [engine, onFrame]
  );

  useEffect(() => {
    if (isRunning && engine) {
      lastTimeRef.current = 0;
      frameIdRef.current = requestAnimationFrame(loop);
    }

    return () => {
      if (frameIdRef.current !== null) {
        cancelAnimationFrame(frameIdRef.current);
        frameIdRef.current = null;
      }
    };
  }, [isRunning, engine, loop]);
}

export default useGridGameLoop;
