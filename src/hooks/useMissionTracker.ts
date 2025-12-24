'use client';

import { useEffect, useCallback, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useGameMode } from '@/contexts/GameModeContext';
import { PAGE_GAMES, GameLevel } from '@/data/game-navigation-data';

interface MissionStats {
  scrollPercentage: number;
  timeSpent: number;
  interactions: number;
  score: number;
}

/**
 * Hook to track mission progress on the current page
 * Automatically completes levels based on user interactions
 */
export function useMissionTracker() {
  const pathname = usePathname();
  const { progress, completeLevel, isLevelCompleted } = useGameMode();
  const statsRef = useRef<MissionStats>({
    scrollPercentage: 0,
    timeSpent: 0,
    interactions: 0,
    score: 0,
  });
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const interactionCountRef = useRef(0);

  // Get current game/mission
  const currentGame = PAGE_GAMES.find(game => game.path === pathname);

  // Track scroll percentage
  useEffect(() => {
    if (!currentGame) return;

    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollPercentage = Math.round(
        ((scrollTop + windowHeight) / documentHeight) * 100
      );

      statsRef.current.scrollPercentage = scrollPercentage;

      // Check scroll-based levels
      currentGame.levels.forEach((level) => {
        if (
          level.completionType === 'scroll' &&
          level.completionTarget &&
          scrollPercentage >= level.completionTarget &&
          !isLevelCompleted(currentGame.id, level.id)
        ) {
          completeLevel(currentGame.id, level.id);
        }
      });

      // Clear existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // Debounce scroll completion check
      scrollTimeoutRef.current = setTimeout(() => {
        // Final check after scroll stops
      }, 500);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [currentGame, completeLevel, isLevelCompleted]);

  // Track time spent on page
  useEffect(() => {
    if (!currentGame) return;

    const startTime = Date.now();
    const interval = setInterval(() => {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      statsRef.current.timeSpent = timeSpent;

      // Check time-based levels
      currentGame.levels.forEach((level) => {
        if (
          level.completionType === 'time' &&
          level.completionTarget &&
          timeSpent >= level.completionTarget &&
          !isLevelCompleted(currentGame.id, level.id)
        ) {
          completeLevel(currentGame.id, level.id);
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentGame, completeLevel, isLevelCompleted]);

  // Track page view (immediate completion for 'view' type levels)
  useEffect(() => {
    if (!currentGame) return;

    // Complete 'view' type levels immediately
    currentGame.levels.forEach((level) => {
      if (
        level.completionType === 'view' &&
        !isLevelCompleted(currentGame.id, level.id)
      ) {
        completeLevel(currentGame.id, level.id);
      }
    });
  }, [currentGame, completeLevel, isLevelCompleted]);

  // Function to track interactions (to be called from components)
  const trackInteraction = useCallback(() => {
    if (!currentGame) return;

    interactionCountRef.current += 1;
    statsRef.current.interactions = interactionCountRef.current;

    // Check interaction-based levels
    currentGame.levels.forEach((level) => {
      if (
        level.completionType === 'interact' &&
        level.completionTarget &&
        interactionCountRef.current >= level.completionTarget &&
        !isLevelCompleted(currentGame.id, level.id)
      ) {
        completeLevel(currentGame.id, level.id);
      }
    });
  }, [currentGame, completeLevel, isLevelCompleted]);

  // Function to track score (for game-based levels)
  const trackScore = useCallback((score: number) => {
    if (!currentGame) return;

    statsRef.current.score = Math.max(statsRef.current.score, score);

    // Check score-based levels
    currentGame.levels.forEach((level) => {
      if (
        level.completionType === 'score' &&
        level.completionTarget &&
        score >= level.completionTarget &&
        !isLevelCompleted(currentGame.id, level.id)
      ) {
        completeLevel(currentGame.id, level.id);
      }
    });
  }, [currentGame, completeLevel, isLevelCompleted]);

  return {
    trackInteraction,
    trackScore,
    stats: statsRef.current,
  };
}
