'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameMode, PAGE_GAMES } from '@/contexts/GameModeContext';
import { usePathname } from 'next/navigation';
import { PixelIcon } from '@/components/ui/PixelIcon';

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
      setNotifications((prev) => {
        if (prev.length === 0) return prev;
        const now = Date.now();
        const filtered = prev.filter(n => now - n.timestamp < 3000);
        // Only update if something was actually removed
        if (filtered.length === prev.length) {
          return prev;
        }
        return filtered;
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
            className="pointer-events-auto wireframe-border p-4 max-w-xs"
            style={{
              imageRendering: 'pixelated' as any,
              backgroundColor: 'var(--bg-card)',
            }}
          >
            <div className="flex items-start gap-3">
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 0.6,
                  repeat: 1,
                  ease: 'easeInOut'
                }}
                className="flex-shrink-0"
              >
                <PixelIcon 
                  name="sparkles" 
                  size={32} 
                  className="text-[var(--accent-color)]"
                  style={{ imageRendering: 'pixelated' as any }}
                />
              </motion.div>
              <div className="flex-1">
                <div className="text-xs font-mono text-[var(--text-muted)] uppercase mb-1 tracking-wider">
                  LEVEL COMPLETE
                </div>
                <div className="text-sm font-mono font-bold text-[var(--text-main)] mb-1">
                  {notification.levelName}
                </div>
                <div className="flex items-center gap-1">
                  <PixelIcon 
                    name="bolt" 
                    size={12} 
                    className="text-[var(--accent-color)]"
                    style={{ imageRendering: 'pixelated' as any }}
                  />
                  <div className="text-xs font-mono text-[var(--accent-color)] font-bold">
                    +{notification.xpReward} XP
                  </div>
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
            className="pointer-events-auto wireframe-border p-4 max-w-xs"
            style={{
              imageRendering: 'pixelated' as any,
              backgroundColor: 'var(--accent-color)',
              borderColor: 'var(--accent-color)',
            }}
          >
            <div className="flex items-start gap-3">
              <motion.div
                animate={{ 
                  scale: [1, 1.3, 1],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{ 
                  duration: 0.8,
                  repeat: 2,
                  ease: 'easeInOut'
                }}
                className="flex-shrink-0"
              >
                <PixelIcon 
                  name="trophy" 
                  size={36} 
                  className="text-white"
                  style={{ imageRendering: 'pixelated' as any }}
                />
              </motion.div>
              <div className="flex-1">
                <div className="text-xs font-mono text-white uppercase mb-1 tracking-wider font-bold">
                  MISSION COMPLETE
                </div>
                <div className="text-sm font-mono font-bold text-white mb-1">
                  {currentGame.title}
                </div>
                <div className="flex items-center gap-1">
                  <PixelIcon 
                    name="check-circle" 
                    size={12} 
                    className="text-white"
                    style={{ imageRendering: 'pixelated' as any }}
                  />
                  <div className="text-xs font-mono text-white/95">
                    All objectives completed!
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
