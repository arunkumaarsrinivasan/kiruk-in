'use client';

/**
 * GridArcade Component
 *
 * Main wrapper that combines the Play button and the full-page grid game.
 * The game renders directly on the portfolio's background grid.
 * Supports multiple games with sequential unlocking.
 */

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FullPageGridArcade } from './FullPageGridArcade';
import { getRandomGameId, getDefaultGameId, getGameEntry, getGameIds } from './game-registry';
import { GRID_SIZE, cn } from '@/lib/utils';
import { useGameMode } from '@/contexts/GameModeContext';

// ═══════════════════════════════════════════════════════════════════════════════
// GAME INSTRUCTIONS MODAL
// ═══════════════════════════════════════════════════════════════════════════════

interface GameInstructionsProps {
  gameId: string;
  isOpen: boolean;
  onStart: () => void;
  onClose: () => void;
}

const GAME_INSTRUCTIONS: Record<string, { 
  title: string; 
  icon: string; 
  goal: string; 
  howTo: string[];
  aboutMe: string;
  tip: string;
}> = {
  snake: {
    title: 'Snake Trail',
    icon: '🐍',
    goal: 'Chase the labels to learn about me! Each one reveals something interesting.',
    howTo: [
      'Move your cursor around the grid',
      'The snake follows your cursor',
      'Collect the floating labels',
      'Each label shows a fact about me',
    ],
    aboutMe: 'I\'m Arun - a Full-Stack Developer & Designer at HP Inc. I love creating playful experiences like this!',
    tip: 'Move slowly for precision, or fast for a challenge!',
  },
  painter: {
    title: 'Grid Painter',
    icon: '🎨',
    goal: 'Paint trails on the grid! Your brush reveals my color preferences and design style.',
    howTo: [
      'Move your cursor to paint',
      'Leave colorful trails behind',
      'Cover more area for higher scores',
      'Watch the colors fade like memories',
    ],
    aboutMe: 'Design is my language - from Figma prototypes to CSS gradients, I express ideas through color.',
    tip: 'Try painting patterns - spirals, waves, or your name!',
  },
  collector: {
    title: 'Grid Collector',
    icon: '✨',
    goal: 'Collect glowing items before they vanish! Each represents a skill or project.',
    howTo: [
      'Hover over glowing items to collect',
      'Items disappear after a few seconds',
      'Build combos by collecting quickly',
      'Each item shows my skills/projects',
    ],
    aboutMe: 'From Spring Boot to UX Research, I\'ve collected diverse skills over the years.',
    tip: 'Focus on clusters for maximum points!',
  },
  avoider: {
    title: 'Grid Avoider',
    icon: '⚡',
    goal: 'Dodge the falling obstacles! Survival represents my persistence in challenges.',
    howTo: [
      'Move cursor to avoid falling blocks',
      'Each block is a challenge I\'ve overcome',
      'Survive as long as possible',
      'Score increases with time',
    ],
    aboutMe: 'Every project has obstacles - deadlines, bugs, scope creep. I\'ve learned to navigate them all.',
    tip: 'Stay near the center for more escape routes!',
  },
  tetris: {
    title: 'Grid Tetris',
    icon: '🧱',
    goal: 'Stack blocks to clear lines! Each piece represents building something meaningful.',
    howTo: [
      'Move cursor left/right to position',
      'Cursor up to rotate piece',
      'Cursor down to drop faster',
      'Clear lines to score points',
    ],
    aboutMe: 'I build things piece by piece - whether it\'s code architecture or UI components.',
    tip: 'Plan ahead and watch for opportunities!',
  },
  pipe: {
    title: 'Pipe Dream',
    icon: '🔧',
    goal: 'Connect pipes before water flows! Like connecting ideas in a project.',
    howTo: [
      'Hover to place pipe segments',
      'Connect pipes before flow starts',
      'Water flows after a short delay',
      'Score for each pipe filled',
    ],
    aboutMe: 'Connecting systems is my thing - APIs, databases, user flows, it all needs to flow.',
    tip: 'Think ahead and create a long path!',
  },
  shooter: {
    title: 'Space Shooter',
    icon: '🚀',
    goal: 'Defend against bugs! Each enemy is a challenge to overcome.',
    howTo: [
      'Move cursor to control your ship',
      'Auto-fires at enemies',
      'Dodge enemy projectiles',
      'Clear waves for bonus points',
    ],
    aboutMe: 'Debugging is like space combat - identify targets and eliminate them systematically!',
    tip: 'Stay mobile and pick off enemies one by one!',
  },
  minesweeper: {
    title: 'Minesweeper',
    icon: '💣',
    goal: 'Reveal safe cells! Like carefully navigating complex codebases.',
    howTo: [
      'Hover to reveal cells',
      'Numbers show adjacent mines',
      'Avoid the mines!',
      'Clear all safe cells to win',
    ],
    aboutMe: 'Careful analysis before action - that\'s how I approach both code reviews and life decisions.',
    tip: 'Start from the edges and work inward!',
  },
  flappy: {
    title: 'Flappy Grid',
    icon: '🐦',
    goal: 'Fly through obstacles! Each gap is an opportunity to grow.',
    howTo: [
      'Move cursor up/down to control bird',
      'Navigate through pipe gaps',
      'Don\'t hit the pipes!',
      'Score for each pipe passed',
    ],
    aboutMe: 'Career growth is like flying - constant adjustment, avoiding obstacles, seizing openings.',
    tip: 'Smooth movements beat jerky reactions!',
  },
  // Portfolio-focused games
  timeline: {
    title: 'Timeline Trek',
    icon: '📅',
    goal: 'Journey through my career! Each milestone reveals a story from my path.',
    howTo: [
      'Move cursor left/right to travel through time',
      'Approach milestones to discover them',
      'Each milestone shows a year and story',
      'Collect all to complete the journey',
    ],
    aboutMe: 'From college to HP Inc. - every step taught me something valuable. Explore my journey!',
    tip: 'Take your time - there\'s a story at each stop!',
  },
  quiz: {
    title: 'Know Me Quiz',
    icon: '❓',
    goal: 'How well do you know me? Answer questions and learn fun facts!',
    howTo: [
      'Read each question carefully',
      'Click an answer before time runs out',
      'Correct answers reveal fun facts',
      'Wrong answers teach you something new',
    ],
    aboutMe: 'This quiz covers my work, skills, and personal interests. Let\'s see how much you learn!',
    tip: 'Every answer teaches you something about me!',
  },
  memory: {
    title: 'Skill Match',
    icon: '🧠',
    goal: 'Match pairs of my skills! Each match reveals what I can do with that skill.',
    howTo: [
      'Click cards to flip them',
      'Find matching skill pairs',
      'Each match shows skill details',
      'Complete all pairs to win',
    ],
    aboutMe: 'I\'ve developed skills across design, frontend, backend, and beyond. Match them all!',
    tip: 'Focus on remembering positions, not just icons!',
  },
};

const GameInstructions: React.FC<GameInstructionsProps> = ({ gameId, isOpen, onStart, onClose }) => {
  const instructions = GAME_INSTRUCTIONS[gameId] || GAME_INSTRUCTIONS.snake;
  
  if (!isOpen) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--bg-main)]/90 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="relative bg-[var(--bg-card)] border-2 border-[var(--border-color)] p-6 max-w-md w-full mx-4 shadow-[8px_8px_0_0_var(--border-color)]"
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-4 pb-4 border-b-2 border-[var(--border-color)]">
          <span className="text-4xl">{instructions.icon}</span>
          <div>
            <h2 className="text-xl font-mono font-bold text-[var(--text-main)] uppercase tracking-wider">
              {instructions.title}
            </h2>
            <p className="text-[10px] font-mono text-[var(--accent-color)] uppercase">
              Game Instructions
            </p>
          </div>
        </div>
        
        {/* Goal */}
        <div className="mb-4">
          <h3 className="text-[10px] font-mono text-[var(--text-muted)] uppercase mb-1">🎯 Goal</h3>
          <p className="text-sm font-mono text-[var(--text-main)]">{instructions.goal}</p>
        </div>
        
        {/* How to Play */}
        <div className="mb-4">
          <h3 className="text-[10px] font-mono text-[var(--text-muted)] uppercase mb-2">📋 How to Play</h3>
          <ul className="space-y-1">
            {instructions.howTo.map((step, i) => (
              <li key={i} className="flex items-start gap-2 text-sm font-mono text-[var(--text-main)]">
                <span className="text-[var(--accent-color)]">{i + 1}.</span>
                {step}
              </li>
            ))}
          </ul>
        </div>
        
        {/* About Me */}
        <div className="mb-4 p-3 bg-[var(--bg-main)] border border-[var(--border-color)]">
          <h3 className="text-[10px] font-mono text-[var(--accent-color)] uppercase mb-1">💡 About Me</h3>
          <p className="text-xs font-mono text-[var(--text-main)]">{instructions.aboutMe}</p>
        </div>
        
        {/* Tip */}
        <div className="mb-6 text-xs font-mono text-[var(--text-muted)] flex items-center gap-2">
          <span>💡</span>
          <span>{instructions.tip}</span>
        </div>
        
        {/* Actions */}
        <div className="flex gap-3">
          <motion.button
            onClick={onStart}
            className="flex-1 py-3 bg-[var(--accent-color)] text-[var(--bg-main)] font-mono font-bold uppercase tracking-wider text-sm border-2 border-[var(--accent-color)] hover:bg-[var(--bg-main)] hover:text-[var(--accent-color)] transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            ▶ Start Playing
          </motion.button>
          <motion.button
            onClick={onClose}
            className="px-4 py-3 bg-[var(--bg-card)] text-[var(--text-main)] font-mono font-bold uppercase tracking-wider text-sm border-2 border-[var(--border-color)] hover:bg-[var(--text-main)] hover:text-[var(--bg-main)] transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            ✕
          </motion.button>
        </div>
        
        {/* Keyboard hint */}
        <p className="text-center text-[8px] font-mono text-[var(--text-muted)] mt-3">
          Press SPACE to start • ESC to close
        </p>
      </motion.div>
    </motion.div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// GAME COMPLETE OVERLAY
// ═══════════════════════════════════════════════════════════════════════════════

interface GameCompleteProps {
  gameId: string;
  score: number;
  isOpen: boolean;
  onNextGame: () => void;
  onReplay: () => void;
  onClose: () => void;
  hasNextGame: boolean;
}

const GameComplete: React.FC<GameCompleteProps> = ({ 
  gameId, 
  score, 
  isOpen, 
  onNextGame, 
  onReplay, 
  onClose,
  hasNextGame,
}) => {
  const instructions = GAME_INSTRUCTIONS[gameId] || GAME_INSTRUCTIONS.snake;
  
  if (!isOpen) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--bg-main)]/90 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="relative bg-[var(--bg-card)] border-2 border-[var(--accent-color)] p-6 max-w-sm w-full mx-4 shadow-[8px_8px_0_0_var(--accent-color)]"
      >
        {/* Celebration */}
        <div className="text-center mb-4">
          <motion.div
            className="text-5xl mb-2"
            animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
            transition={{ duration: 0.5, repeat: 2 }}
          >
            🎉
          </motion.div>
          <h2 className="text-xl font-mono font-bold text-[var(--accent-color)] uppercase tracking-wider">
            Game Complete!
          </h2>
          <p className="text-sm font-mono text-[var(--text-main)] mt-1">
            {instructions.title} cleared
          </p>
        </div>
        
        {/* Score */}
        <div className="text-center mb-6 py-4 bg-[var(--bg-main)] border border-[var(--border-color)]">
          <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase">Your Score</p>
          <p className="text-3xl font-mono font-bold text-[var(--text-main)]">{score}</p>
          <p className="text-[10px] font-mono text-[var(--accent-color)] uppercase mt-1">+{score} XP earned!</p>
        </div>
        
        {/* Actions */}
        <div className="space-y-2">
          {hasNextGame && (
            <motion.button
              onClick={onNextGame}
              className="w-full py-3 bg-[var(--accent-color)] text-[var(--bg-main)] font-mono font-bold uppercase tracking-wider text-sm border-2 border-[var(--accent-color)] hover:bg-[var(--bg-main)] hover:text-[var(--accent-color)] transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              ▶ Next Game
            </motion.button>
          )}
          <motion.button
            onClick={onReplay}
            className="w-full py-3 bg-[var(--bg-card)] text-[var(--text-main)] font-mono font-bold uppercase tracking-wider text-sm border-2 border-[var(--border-color)] hover:bg-[var(--text-main)] hover:text-[var(--bg-main)] transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            ↺ Play Again
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// MINIMAL FLOATING PLAY BUTTON (replaces complex ArcadePlayButton)
// ═══════════════════════════════════════════════════════════════════════════════

interface FloatingPlayButtonProps {
  isActive: boolean;
  onToggle: () => void;
  onRandomGame: () => void;
  gameId: string;
  score: number;
}

const FloatingPlayButton: React.FC<FloatingPlayButtonProps> = ({
  isActive,
  onToggle,
  onRandomGame,
  gameId,
  score,
}) => {
  const gameEntry = getGameEntry(gameId);
  const gameName = gameEntry?.label || 'Game';
  const gameIcon = GAME_INSTRUCTIONS[gameId]?.icon || '🎮';
  
  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2">
      {/* Main Play/Pause Button */}
      <motion.button
        onClick={onToggle}
        className={cn(
          'flex items-center gap-2 px-4 py-3',
          'border-2 border-[var(--border-color)]',
          'font-mono text-sm uppercase tracking-wider',
          'transition-colors duration-150',
          isActive 
            ? 'bg-[var(--accent-color)] text-[var(--bg-main)] border-[var(--accent-color)]'
            : 'bg-[var(--bg-card)] text-[var(--text-main)] hover:bg-[var(--text-main)] hover:text-[var(--bg-main)]'
        )}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <span className="text-lg">{isActive ? '⏸' : '▶'}</span>
        <span>{isActive ? 'PAUSE' : 'PLAY'}</span>
      </motion.button>
      
      {/* Game Info (when active) */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="flex items-center gap-2 px-3 py-2 bg-[var(--bg-card)] border-2 border-[var(--border-color)]"
          >
            <span className="text-lg">{gameIcon}</span>
            <div>
              <p className="text-[10px] font-mono text-[var(--text-main)] font-bold uppercase">{gameName}</p>
              <p className="text-[10px] font-mono text-[var(--accent-color)]">Score: {score}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Shuffle Button */}
      <motion.button
        onClick={onRandomGame}
        className="flex items-center justify-center w-10 h-10 bg-[var(--bg-card)] border-2 border-[var(--border-color)] text-[var(--text-main)] hover:bg-[var(--text-main)] hover:text-[var(--bg-main)] transition-colors"
        whileHover={{ scale: 1.05, rotate: 180 }}
        whileTap={{ scale: 0.95 }}
        title="Try another game"
      >
        🔀
      </motion.button>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

interface GridArcadeProps {
  /** Default game to load (defaults to 'snake') */
  defaultGameId?: string;
}

export const GridArcade: React.FC<GridArcadeProps> = ({
  defaultGameId = getDefaultGameId(),
}) => {
  const { completeLevel } = useGameMode();
  const [isActive, setIsActive] = useState(false);
  const [score, setScore] = useState(0);
  const [gameId, setGameId] = useState(defaultGameId);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [hasShownInstructions, setHasShownInstructions] = useState<Record<string, boolean>>({});
  
  const gameIds = getGameIds();
  const currentGameIndex = gameIds.indexOf(gameId);
  const hasNextGame = currentGameIndex < gameIds.length - 1;

  // Show instructions before first play of each game
  const handleToggle = useCallback(() => {
    if (!isActive && !hasShownInstructions[gameId]) {
      setShowInstructions(true);
    } else {
      setIsActive((prev) => !prev);
      if (!isActive) {
        setScore(0);
      }
    }
  }, [isActive, gameId, hasShownInstructions]);
  
  const handleStartFromInstructions = useCallback(() => {
    setShowInstructions(false);
    setHasShownInstructions(prev => ({ ...prev, [gameId]: true }));
    setIsActive(true);
    setScore(0);
  }, [gameId]);

  const handleRandomGame = useCallback(() => {
    let newGameId = getRandomGameId();
    while (newGameId === gameId) {
      newGameId = getRandomGameId();
    }
    setGameId(newGameId);
    setScore(0);
    setIsActive(false);
    
    // Show instructions for new game if not shown before
    if (!hasShownInstructions[newGameId]) {
      setShowInstructions(true);
    }
  }, [gameId, hasShownInstructions]);
  
  const handleNextGame = useCallback(() => {
    if (hasNextGame) {
      const nextGameId = gameIds[currentGameIndex + 1];
      setGameId(nextGameId);
      setScore(0);
      setShowComplete(false);
      setIsActive(false);
      
      // Show instructions for next game
      if (!hasShownInstructions[nextGameId]) {
        setShowInstructions(true);
      }
    }
  }, [hasNextGame, gameIds, currentGameIndex, hasShownInstructions]);
  
  const handleReplay = useCallback(() => {
    setShowComplete(false);
    setScore(0);
    setIsActive(true);
  }, []);

  const handleScoreChange = useCallback((newScore: number) => {
    setScore(newScore);
    
    // Complete game when score threshold reached
    if (newScore >= 50 && isActive) {
      // Award XP based on game
      completeLevel('home', `home-${gameId}`);
    }
  }, [isActive, gameId, completeLevel]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.altKey || e.metaKey) return;
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      if (e.key === ' ') {
        e.preventDefault();
        if (showInstructions) {
          handleStartFromInstructions();
        } else {
          handleToggle();
        }
      }
      if (e.key === 'Escape') {
        if (showInstructions) setShowInstructions(false);
        if (showComplete) setShowComplete(false);
        if (isActive) setIsActive(false);
      }
      if (e.key === 'r' || e.key === 'R') {
        handleRandomGame();
      }
    };
    globalThis.addEventListener('keydown', handleKeyDown);
    return () => globalThis.removeEventListener('keydown', handleKeyDown);
  }, [handleToggle, handleRandomGame, showInstructions, showComplete, isActive, handleStartFromInstructions]);

  return (
    <>
      {/* Floating Play Button */}
      <FloatingPlayButton 
        isActive={isActive} 
        onToggle={handleToggle}
        onRandomGame={handleRandomGame}
        gameId={gameId}
        score={score}
      />
      
      {/* Instructions Modal */}
      <AnimatePresence>
        {showInstructions && (
          <GameInstructions
            gameId={gameId}
            isOpen={showInstructions}
            onStart={handleStartFromInstructions}
            onClose={() => setShowInstructions(false)}
          />
        )}
      </AnimatePresence>
      
      {/* Game Complete Modal */}
      <AnimatePresence>
        {showComplete && (
          <GameComplete
            gameId={gameId}
            score={score}
            isOpen={showComplete}
            onNextGame={handleNextGame}
            onReplay={handleReplay}
            onClose={() => setShowComplete(false)}
            hasNextGame={hasNextGame}
          />
        )}
      </AnimatePresence>
      
      {/* The Game Itself */}
      <FullPageGridArcade
        isActive={isActive}
        gameId={gameId}
        onScoreChange={handleScoreChange}
      />
    </>
  );
};

export default GridArcade;
