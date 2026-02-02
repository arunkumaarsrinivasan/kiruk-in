"use client";

import { useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import SimpleGameNav from "./SimpleGameNav";
import DynamicContextBar from "./DynamicContextBar";
import AppLoader from "@/components/ui/app-loader";
import { getRandomGameId, getDefaultGameId, getGameEntry } from "@/components/ui/arcade/game-registry";
import TimeMachine from "@/components/ui/TimeMachine";
import { useMissionTracker } from "@/hooks/useMissionTracker";
import DetectiveStoryWrapper from "./DetectiveStoryWrapper";
import { HelpBot } from "@/components/ui/HelpBot";

interface LayoutClientShellProps {
  readonly children: React.ReactNode;
}

export default function LayoutClientShell({ children }: Readonly<LayoutClientShellProps>) {
  const pathname = usePathname();
  // Keep the global layout stable; only show the gamified header + grid on chosen pages.
  const arcadeEnabled = pathname === '/';
  
  // Game state lifted up for coordination between nav and arcade
  const [isGameActive, setIsGameActive] = useState(false);
  const [gameId, setGameId] = useState(getDefaultGameId());
  const [_score, setScore] = useState(0);
  
  // Mission tracking
  const { trackInteraction, trackScore } = useMissionTracker();
  
  const gameEntry = getGameEntry(gameId);
  const gameName = gameEntry?.label || 'Game';
  
  // Game icons based on game type - using pixel icons
  const gameIcons: Record<string, string> = {
    'snake': 'bolt',
    'painter': 'pen',
    'collector': 'sparkles',
    'avoider': 'eye-cross',
    'tetris': 'grid',
    'pipe': 'cog',
    'shooter': 'eye',
    'minesweeper': 'exclamation-triangle',
    'flappy': 'arrow-up',
    'timeline': 'clock',
    'quiz': 'question',
    'memory': 'bookmark',
  };
  const gameIcon = gameIcons[gameId] || 'play';
  
  const handleToggleGame = useCallback(() => {
    setIsGameActive(prev => !prev);
    if (!isGameActive) {
      setScore(0);
    }
    trackInteraction();
  }, [isGameActive, trackInteraction]);
  
  const _handleRandomGame = useCallback(() => {
    let newGameId = getRandomGameId();
    while (newGameId === gameId) {
      newGameId = getRandomGameId();
    }
    setGameId(newGameId);
    setScore(0);
    trackInteraction();
  }, [gameId, trackInteraction]);
  
  const _handleScoreChange = useCallback((newScore: number) => {
    setScore(newScore);
    trackScore(newScore);
  }, [trackScore]);

  return (
    <AppLoader enableLoader={true} loadingDuration={3500}>
      {/* Skip Links for Accessibility */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:text-sm focus:no-underline"
        tabIndex={1}
      >
        Skip to main content
      </a>
      <a 
        href="#navigation" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-30 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:text-sm focus:no-underline"
        tabIndex={2}
      >
        Skip to navigation
      </a>
      
      {/* Simplified Game Navigation */}
      <SimpleGameNav 
        isGameActive={arcadeEnabled ? isGameActive : false}
        currentGameId={gameId}
        currentGameName={gameName}
        currentGameIcon={gameIcon}
        onToggleGame={arcadeEnabled ? handleToggleGame : undefined}
      />
      
      {/* Dynamic Context Bar - shows page-specific timeline and shortcuts */}
      <DynamicContextBar />
      
      <DetectiveStoryWrapper>
        <main 
          id="main-content" 
          tabIndex={-1}
          style={{ 
            paddingTop: ['/about', '/work', '/progress'].includes(pathname) 
              ? '100px' // 60px (main nav) + 40px (context bar) = 100px
              : '60px'  // 60px (main nav only, no context bar)
          }}
        >
          {children}
        </main>
      </DetectiveStoryWrapper>
      
      {/* Help Bot - Available on all pages */}
      <HelpBot />
      
      {/* Time Machine - Era Switcher - Available on all pages except home */}
      {pathname !== '/' && <TimeMachine />}
    </AppLoader>
  );
}
