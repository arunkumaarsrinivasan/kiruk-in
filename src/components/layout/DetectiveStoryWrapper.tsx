'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameMode } from '@/contexts/GameModeContext';
import { getGameByPath, PAGE_GAMES } from '@/data/game-navigation-data';
import { PixelIcon } from '@/components/ui/PixelIcon';

interface DetectiveStoryWrapperProps {
  children: React.ReactNode;
}

interface StorySegment {
  id: string;
  title: string;
  dialogue: string[];
  clue?: string;
}

// Detective story segments for each page
const DETECTIVE_STORIES: Record<string, StorySegment> = {
  '/': {
    id: 'case-opening',
    title: 'The Case Begins',
    dialogue: [
      "You're a detective on a new case.",
      "A mysterious portfolio has appeared, and you need to investigate it.",
      "Start by exploring the command center to gather initial clues.",
      "Each page holds secrets that will help you solve the mystery.",
      "Your mission: Complete all levels and uncover the full story."
    ],
    clue: "Look for interactive elements - they might reveal hidden clues."
  },
  '/about': {
    id: 'origin-investigation',
    title: 'The Origin Investigation',
    dialogue: [
      "You've found the origin story.",
      "This is where the journey began.",
      "Run through the timeline to collect evidence.",
      "Each memory is a piece of the puzzle.",
      "Dodge obstacles and gather clues about the past."
    ],
    clue: "The timeline reveals the foundation of this mystery."
  },
  '/work': {
    id: 'arsenal-discovery',
    title: 'The Arsenal Discovery',
    dialogue: [
      "You've uncovered the arsenal of projects.",
      "Each project is a weapon in this investigation.",
      "Target what interests you and gather evidence.",
      "The projects hold key information.",
      "Explore them carefully - they're crucial to solving the case."
    ],
    clue: "Projects are evidence - examine them thoroughly."
  },
  '/case-studies': {
    id: 'deep-ops',
    title: 'Deep Operations',
    dialogue: [
      "You've entered the deep operations room.",
      "These are the detailed case files.",
      "Each case study is a puzzle piece.",
      "Solve them to understand the full picture.",
      "The process reveals the methodology behind the mystery."
    ],
    clue: "Case studies contain the most detailed evidence."
  },
  '/progress': {
    id: 'skill-tree',
    title: 'The Skill Tree',
    dialogue: [
      "You've discovered the skill tree.",
      "This shows the growth and development.",
      "Build your understanding of the progression.",
      "Level up as you uncover more evidence.",
      "The timeline shows how skills evolved."
    ],
    clue: "Skills are tools - understand them to solve the case."
  },
  '/arcade': {
    id: 'arcade-discovery',
    title: 'The Arcade Discovery',
    dialogue: [
      "You've found the arcade.",
      "These mini-games are training exercises.",
      "Complete them to sharpen your detective skills.",
      "Each game teaches you something new.",
      "Master them to unlock new abilities."
    ],
    clue: "Games are training - practice makes perfect."
  },
  '/contact': {
    id: 'transmission',
    title: 'The Transmission',
    dialogue: [
      "You've reached the transmission point.",
      "This is where you can send a message.",
      "Collect the courage to reach out.",
      "Send a signal to complete your investigation.",
      "Your mission is almost complete."
    ],
    clue: "Communication is the final piece of the puzzle."
  },
  '/lab': {
    id: 'lab-experiments',
    title: 'The Lab Experiments',
    dialogue: [
      "You've entered the experimental lab.",
      "These are interactive experiments.",
      "Play, explore, and experiment.",
      "Each experiment reveals new insights.",
      "Use them to enhance your detective skills."
    ],
    clue: "Experiments are tests - pass them to progress."
  }
};

export default function DetectiveStoryWrapper({ children }: DetectiveStoryWrapperProps) {
  const pathname = usePathname();
  const { mode: _mode, setMode } = useGameMode();
  const [showStory, setShowStory] = useState(false); // Don't show by default
  const [storyDismissed, setStoryDismissed] = useState(false);
  const [_everythingRevealed, setEverythingRevealed] = useState(false);
  const [currentDialogueIndex, setCurrentDialogueIndex] = useState(0);

  // Don't show story overlay on home page - it uses hints overlay instead
  const isHomePage = pathname === '/';
  const currentStory = DETECTIVE_STORIES[pathname] || DETECTIVE_STORIES['/'];
  const currentGame = getGameByPath(pathname);

  // Check if everything is revealed first
  useEffect(() => {
    const revealed = localStorage.getItem('detective-everything-revealed') === 'true';
    if (revealed) {
      setEverythingRevealed(true);
      setMode('god');
      setShowStory(false);
      setStoryDismissed(true);
      return;
    }
    
    // Don't show story on home page
    if (isHomePage) {
      setShowStory(false);
      setStoryDismissed(true);
      return;
    }
    
    // Check if story was already dismissed for this page
    const dismissedKey = `detective-story-dismissed-${pathname}`;
    const wasDismissed = localStorage.getItem(dismissedKey) === 'true';
    if (wasDismissed) {
      setShowStory(false);
      setStoryDismissed(true);
    } else {
      // Show story on first visit to non-home pages
      setShowStory(true);
    }
  }, [pathname, setMode, isHomePage]);

  const handleSkip = useCallback(() => {
    setShowStory(false);
    setStoryDismissed(true);
    const dismissedKey = `detective-story-dismissed-${pathname}`;
    localStorage.setItem(dismissedKey, 'true');
  }, [pathname]);

  const handleRevealEverything = useCallback(() => {
    setEverythingRevealed(true);
    setMode('god');
    setShowStory(false);
    setStoryDismissed(true);
    localStorage.setItem('detective-everything-revealed', 'true');
    // Dismiss all stories
    PAGE_GAMES.forEach(game => {
      localStorage.setItem(`detective-story-dismissed-${game.path}`, 'true');
    });
  }, [setMode]);

  const handleNextDialogue = useCallback(() => {
    if (currentDialogueIndex < currentStory.dialogue.length - 1) {
      setCurrentDialogueIndex(prev => prev + 1);
    } else {
      handleSkip();
    }
  }, [currentDialogueIndex, currentStory.dialogue.length, handleSkip]);

  const handleSkipStory = useCallback(() => {
    handleSkip();
  }, [handleSkip]);

  // Auto-advance dialogue after 3 seconds
  useEffect(() => {
    if (showStory && !storyDismissed) {
      const timer = setTimeout(() => {
        if (currentDialogueIndex < currentStory.dialogue.length - 1) {
          setCurrentDialogueIndex(prev => prev + 1);
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showStory, storyDismissed, currentDialogueIndex, currentStory.dialogue.length]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showStory && !storyDismissed) {
        if (e.key === 'Escape') {
          handleSkip();
        } else if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleNextDialogue();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showStory, storyDismissed, handleSkip, handleNextDialogue]);

  return (
    <>
      {/* Story Overlay */}
      <AnimatePresence>
        {showStory && !storyDismissed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={handleSkipStory}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-2 border-amber-500/50 rounded-lg shadow-2xl max-w-2xl w-full p-8 relative"
            >
              {/* Detective Badge Icon */}
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                <div className="bg-amber-500 text-black rounded-full w-12 h-12 flex items-center justify-center shadow-lg">
                  <PixelIcon name="user" size={32} className="text-black" />
                </div>
              </div>

              {/* Title */}
              <h2 className="text-3xl font-bold text-amber-400 mb-2 text-center mt-4">
                {currentStory.title}
              </h2>

              {/* Game Info */}
              {currentGame && (
                <div className="text-center mb-6">
                  <p className="text-slate-400 text-sm">
                    Case File: <span className="text-amber-400 font-semibold">{currentGame.title}</span>
                  </p>
                  <p className="text-slate-500 text-xs mt-1">{currentGame.subtitle}</p>
                </div>
              )}

              {/* Dialogue */}
              <div className="space-y-4 mb-6 min-h-[200px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentDialogueIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-slate-800/50 rounded-lg p-6 border border-amber-500/20"
                  >
                    <p className="text-white text-lg leading-relaxed">
                      {currentStory.dialogue[currentDialogueIndex]}
                    </p>
                  </motion.div>
                </AnimatePresence>

                {/* Progress Dots */}
                <div className="flex justify-center gap-2 mt-4">
                  {currentStory.dialogue.map((_, index) => (
                    <div
                      key={index}
                      className={`h-2 rounded-full transition-all ${
                        index === currentDialogueIndex
                          ? 'w-8 bg-amber-500'
                          : index < currentDialogueIndex
                          ? 'w-2 bg-amber-500/50'
                          : 'w-2 bg-slate-600'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Clue */}
              {currentStory.clue && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mb-6">
                  <p className="text-amber-300 text-sm">
                    <span className="font-semibold">💡 Clue:</span> {currentStory.clue}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4 justify-center">
                <button
                  onClick={handleNextDialogue}
                  className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg transition-colors shadow-lg"
                >
                  {currentDialogueIndex < currentStory.dialogue.length - 1 ? 'Next' : 'Start Investigation'}
                </button>
                <button
                  onClick={handleSkip}
                  className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors border border-slate-600"
                >
                  Skip Story
                </button>
                <button
                  onClick={handleRevealEverything}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors shadow-lg"
                >
                  Reveal Everything
                </button>
              </div>

              {/* Instructions */}
              <p className="text-center text-slate-500 text-xs mt-4">
                Click outside or press Escape to skip
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className={showStory && !storyDismissed ? 'pointer-events-none opacity-50' : ''}>
        {children}
      </div>
    </>
  );
}
