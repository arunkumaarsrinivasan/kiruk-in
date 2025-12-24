'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameMode, PAGE_GAMES } from '@/contexts/GameModeContext';
import { usePathname } from 'next/navigation';

interface CompletionNotification {
  gameId: string;
  levelId: string;
  levelName: string;
  xpReward: number;
  timestamp: number;
}

export function MissionCompletionNotification() {
  const pathname = usePathname();
  const { progress, getGameProgress } = useGameMode();
  const [notifications, setNotifications] = useState<CompletionNotification[]>([]);
  const previousProgressRef = React.useRef<typeof progress.completedLevels>({});
  const [hasShownMissionComplete, setHasShownMissionComplete] = React.useState(false);

  // Get current game
  const currentGame = PAGE_GAMES.find(game => game.path === pathname);

  useEffect(() => {
    if (!currentGame) return;

    const previousCompleted = previousProgressRef.current[currentGame.id] || [];
    const currentCompleted = progress.completedLevels[currentGame.id] || [];
    
    // Find newly completed levels
    const newlyCompleted = currentCompleted.filter(
      levelId => !previousCompleted.includes(levelId)
    );

    if (newlyCompleted.length > 0) {
      newlyCompleted.forEach(levelId => {
        const level = currentGame.levels.find(l => l.id === levelId);
        if (level) {
          setNotifications(prev => [
            ...prev,
            {
              gameId: currentGame.id,
              levelId: level.id,
              levelName: level.name,
              xpReward: level.xpReward,
              timestamp: Date.now(),
            },
          ]);
        }
      });
    }

    previousProgressRef.current = { ...progress.completedLevels };
  }, [progress, currentGame]);

  // Remove notifications after 3 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setNotifications(prev => {
        const now = Date.now();
        return prev.filter(n => now - n.timestamp < 3000);
      });
    }, 100);

    return () => clearInterval(timer);
  }, []);

  // Check for mission completion
  const gameProgress = currentGame ? getGameProgress(currentGame.id) : 0;
  const isMissionComplete = currentGame && gameProgress === 100 && !hasShownMissionComplete;

  // Reset mission complete flag when game changes
  useEffect(() => {
    if (currentGame && gameProgress === 100) {
      setHasShownMissionComplete(true);
    } else if (currentGame && gameProgress < 100) {
      setHasShownMissionComplete(false);
    }
  }, [currentGame, gameProgress]);

  return (
    <div className="fixed bottom-4 right-4 z-50 pointer-events-none space-y-2">
      <AnimatePresence>
        {/* Level Completion Notifications */}
        {notifications.map((notification) => (
          <motion.div
            key={`${notification.levelId}-${notification.timestamp}`}
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="pointer-events-auto bg-[var(--bg-card)] border-2 border-[var(--accent-color)] shadow-lg p-4 max-w-xs"
          >
            <div className="flex items-start gap-3">
              <div className="text-2xl">🎉</div>
              <div className="flex-1">
                <div className="text-xs font-mono text-[var(--text-muted)] uppercase mb-1">
                  LEVEL COMPLETE
                </div>
                <div className="text-sm font-mono font-bold text-[var(--text-main)] mb-1">
                  {notification.levelName}
                </div>
                <div className="text-xs font-mono text-[var(--accent-color)]">
                  +{notification.xpReward} XP
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {/* Mission Complete Notification */}
        {isMissionComplete && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="pointer-events-auto bg-[var(--accent-color)] border-2 border-[var(--accent-color)] shadow-lg p-4 max-w-xs"
          >
            <div className="flex items-start gap-3">
              <div className="text-2xl">🏆</div>
              <div className="flex-1">
                <div className="text-xs font-mono text-white uppercase mb-1">
                  MISSION COMPLETE
                </div>
                <div className="text-sm font-mono font-bold text-white mb-1">
                  {currentGame.title}
                </div>
                <div className="text-xs font-mono text-white/90">
                  All objectives completed!
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
