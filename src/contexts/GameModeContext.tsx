'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  GameMode,
  GameProgress,
  PageGame,
  GameLevel,
  PAGE_GAMES,
  GAME_MODES,
  createInitialProgress,
  getGameById,
  getGameProgress,
  isGameUnlocked,
  isLevelUnlocked,
  getNextGame,
} from '@/data/game-navigation-data';

// ═══════════════════════════════════════════════════════════════════════════════
// CONTEXT TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface GameModeContextType {
  // Current state
  mode: GameMode;
  progress: GameProgress;
  isMenuOpen: boolean;
  
  // Mode actions
  setMode: (mode: GameMode) => void;
  
  // Menu actions
  openMenu: () => void;
  closeMenu: () => void;
  toggleMenu: () => void;
  
  // Progress actions
  completeLevel: (gameId: string, levelId: string) => void;
  resetProgress: () => void;
  
  // Progress queries
  isGameUnlocked: (gameId: string) => boolean;
  isLevelUnlocked: (gameId: string, levelId: string) => boolean;
  getGameProgress: (gameId: string) => number;
  isLevelCompleted: (gameId: string, levelId: string) => boolean;
  
  // XP and stats
  totalPossibleXP: number;
  currentXPPercentage: number;
  completedGamesCount: number;
  totalGamesCount: number;
}

const GameModeContext = createContext<GameModeContextType | null>(null);

// ═══════════════════════════════════════════════════════════════════════════════
// LOCAL STORAGE KEYS
// ═══════════════════════════════════════════════════════════════════════════════

const STORAGE_KEYS = {
  mode: 'kiruk-game-mode',
  progress: 'kiruk-game-progress',
};

// ═══════════════════════════════════════════════════════════════════════════════
// PROVIDER COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export function GameModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<GameMode>('normal');
  const [progress, setProgress] = useState<GameProgress>(createInitialProgress);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Calculate total possible XP
  const totalPossibleXP = PAGE_GAMES.reduce(
    (total, game) => total + game.levels.reduce((sum, level) => sum + level.xpReward, 0),
    0
  );

  // Current XP percentage
  const currentXPPercentage = totalPossibleXP > 0 
    ? Math.round((progress.totalXP / totalPossibleXP) * 100) 
    : 0;

  // Count completed games
  const completedGamesCount = PAGE_GAMES.filter(game => {
    const completed = progress.completedLevels[game.id] || [];
    return completed.length === game.levels.length;
  }).length;

  const totalGamesCount = PAGE_GAMES.length;

  // ═══════════════════════════════════════════════════════════════════════════
  // HYDRATION - Load from localStorage
  // ═══════════════════════════════════════════════════════════════════════════

  useEffect(() => {
    try {
      const savedMode = localStorage.getItem(STORAGE_KEYS.mode);
      if (savedMode && ['god', 'devil', 'normal'].includes(savedMode)) {
        setModeState(savedMode as GameMode);
      }

      const savedProgress = localStorage.getItem(STORAGE_KEYS.progress);
      if (savedProgress) {
        const parsed = JSON.parse(savedProgress);
        setProgress({
          ...createInitialProgress(),
          ...parsed,
        });
      }
    } catch (e) {
      console.warn('Failed to load game state from localStorage:', e);
    }
    setIsHydrated(true);
  }, []);

  // ═══════════════════════════════════════════════════════════════════════════
  // PERSISTENCE - Save to localStorage
  // ═══════════════════════════════════════════════════════════════════════════

  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem(STORAGE_KEYS.mode, mode);
  }, [mode, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem(STORAGE_KEYS.progress, JSON.stringify(progress));
  }, [progress, isHydrated]);

  // ═══════════════════════════════════════════════════════════════════════════
  // ACTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  const setMode = useCallback((newMode: GameMode) => {
    setModeState(newMode);
  }, []);

  const openMenu = useCallback(() => setIsMenuOpen(true), []);
  const closeMenu = useCallback(() => setIsMenuOpen(false), []);
  const toggleMenu = useCallback(() => setIsMenuOpen(prev => !prev), []);

  const completeLevel = useCallback((gameId: string, levelId: string) => {
    setProgress(prev => {
      const game = getGameById(gameId);
      if (!game) return prev;

      const level = game.levels.find(l => l.id === levelId);
      if (!level) return prev;

      const currentCompleted = prev.completedLevels[gameId] || [];
      
      // Already completed
      if (currentCompleted.includes(levelId)) return prev;

      const newCompleted = [...currentCompleted, levelId];
      const newXP = prev.totalXP + level.xpReward;

      // Check if game is now complete, unlock next
      const gameComplete = newCompleted.length === game.levels.length;
      let newGamesUnlocked = [...prev.gamesUnlocked];
      
      if (gameComplete) {
        const nextGame = getNextGame(gameId);
        if (nextGame && !newGamesUnlocked.includes(nextGame.id)) {
          newGamesUnlocked.push(nextGame.id);
        }
      }

      return {
        ...prev,
        completedLevels: {
          ...prev.completedLevels,
          [gameId]: newCompleted,
        },
        totalXP: newXP,
        lastPlayedAt: new Date().toISOString(),
        gamesUnlocked: newGamesUnlocked,
        currentGameId: gameComplete && getNextGame(gameId) ? getNextGame(gameId)!.id : gameId,
      };
    });
  }, []);

  const resetProgress = useCallback(() => {
    setProgress(createInitialProgress());
  }, []);

  // ═══════════════════════════════════════════════════════════════════════════
  // QUERIES
  // ═══════════════════════════════════════════════════════════════════════════

  const checkGameUnlocked = useCallback(
    (gameId: string) => isGameUnlocked(gameId, progress, mode),
    [progress, mode]
  );

  const checkLevelUnlocked = useCallback(
    (gameId: string, levelId: string) => isLevelUnlocked(gameId, levelId, progress, mode),
    [progress, mode]
  );

  const checkGameProgress = useCallback(
    (gameId: string) => getGameProgress(gameId, progress),
    [progress]
  );

  const isLevelCompleted = useCallback(
    (gameId: string, levelId: string) => {
      const completed = progress.completedLevels[gameId] || [];
      return completed.includes(levelId);
    },
    [progress]
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // KEYBOARD SHORTCUTS
  // ═══════════════════════════════════════════════════════════════════════════

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape closes menu
      if (e.key === 'Escape' && isMenuOpen) {
        closeMenu();
        return;
      }

      // M toggles menu
      if ((e.key === 'm' || e.key === 'M') && !e.metaKey && !e.ctrlKey) {
        toggleMenu();
        return;
      }
    };

    globalThis.addEventListener('keydown', handleKeyDown);
    return () => globalThis.removeEventListener('keydown', handleKeyDown);
  }, [isMenuOpen, closeMenu, toggleMenu]);

  // ═══════════════════════════════════════════════════════════════════════════
  // CONTEXT VALUE
  // ═══════════════════════════════════════════════════════════════════════════

  const value: GameModeContextType = {
    mode,
    progress,
    isMenuOpen,
    setMode,
    openMenu,
    closeMenu,
    toggleMenu,
    completeLevel,
    resetProgress,
    isGameUnlocked: checkGameUnlocked,
    isLevelUnlocked: checkLevelUnlocked,
    getGameProgress: checkGameProgress,
    isLevelCompleted,
    totalPossibleXP,
    currentXPPercentage,
    completedGamesCount,
    totalGamesCount,
  };

  return (
    <GameModeContext.Provider value={value}>
      {children}
    </GameModeContext.Provider>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// HOOK
// ═══════════════════════════════════════════════════════════════════════════════

export function useGameMode(): GameModeContextType {
  const context = useContext(GameModeContext);
  if (!context) {
    throw new Error('useGameMode must be used within a GameModeProvider');
  }
  return context;
}

// Re-export data types for convenience
export type { GameMode, GameProgress, PageGame, GameLevel };
export { PAGE_GAMES, GAME_MODES, GAME_TYPE_EMOJIS } from '@/data/game-navigation-data';
