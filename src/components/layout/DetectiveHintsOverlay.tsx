'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameMode } from '@/contexts/GameModeContext';
import { PixelIcon } from '@/components/ui/PixelIcon';

interface Clue {
  id: string;
  element: string; // CSS selector or data attribute
  hint: string;
  position: { x: number; y: number };
  connections?: string[]; // IDs of connected clues
}

interface DetectiveHintsOverlayProps {
  children: React.ReactNode;
}

// Clue positions and connections - these will be positioned relative to detective board elements
const NEWSPAPER_CLUES: Clue[] = [
  {
    id: 'clue-1',
    element: '[data-clue="location"]',
    hint: '📍 Location: Bangalore - Where the investigation begins. This is the origin point.',
    position: { x: 10, y: 5 },
    connections: ['clue-2', 'clue-3']
  },
  {
    id: 'clue-2',
    element: '[data-clue="name"]',
    hint: '🕵️ Subject: The person of interest. This is the central figure in the investigation.',
    position: { x: 50, y: 15 },
    connections: ['clue-1', 'clue-4', 'clue-5']
  },
  {
    id: 'clue-3',
    element: '[data-clue="note"]',
    hint: '📝 Case Notes: Initial observations about the subject. Read carefully.',
    position: { x: 10, y: 18 },
    connections: ['clue-1', 'clue-4']
  },
  {
    id: 'clue-4',
    element: '[data-clue="skill"]',
    hint: '⚡ Capabilities: The tools and skills possessed. Connect this to understand capabilities.',
    position: { x: 35, y: 20 },
    connections: ['clue-2', 'clue-3', 'clue-6']
  },
  {
    id: 'clue-5',
    element: '[data-clue="contact"]',
    hint: '📧 Contact Info: The final transmission point. This is where you can reach out.',
    position: { x: 65, y: 8 },
    connections: ['clue-2', 'clue-7']
  },
  {
    id: 'clue-6',
    element: '[data-clue="note"]',
    hint: '🎯 Interests: Personal details that reveal more about the subject.',
    position: { x: 35, y: 33 },
    connections: ['clue-4', 'clue-8']
  },
  {
    id: 'clue-7',
    element: '[data-clue="document"]',
    hint: '🗺️ Investigation Path: The route to continue your investigation. Follow these paths.',
    position: { x: 65, y: 23 },
    connections: ['clue-5', 'clue-8']
  },
  {
    id: 'clue-8',
    element: '[data-clue="note"]',
    hint: '🎯 Mission: Your objective. Complete all levels to solve the case.',
    position: { x: 35, y: 45 },
    connections: ['clue-6', 'clue-7']
  }
];

export default function DetectiveHintsOverlay({ children }: DetectiveHintsOverlayProps) {
  const { mode, setMode } = useGameMode();
  const [showHints, setShowHints] = useState(false);
  const [activeClue, setActiveClue] = useState<string | null>(null);
  const [everythingRevealed, setEverythingRevealed] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [cluePositions, setCluePositions] = useState<Record<string, { x: number; y: number }>>({});
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate actual positions of clue elements
  useEffect(() => {
    const calculatePositions = () => {
      const positions: Record<string, { x: number; y: number }> = {};
      const container = containerRef.current;
      if (!container) return;

      NEWSPAPER_CLUES.forEach((clue) => {
        try {
          const element = container.querySelector(clue.element);
          if (element) {
            const rect = element.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();
            const x = ((rect.left + rect.width / 2 - containerRect.left) / containerRect.width) * 100;
            const y = ((rect.top + rect.height / 2 - containerRect.top) / containerRect.height) * 100;
            positions[clue.id] = { x, y };
          } else {
            // Fallback to percentage-based positioning
            positions[clue.id] = clue.position;
          }
        } catch (_e) {
          // Fallback to percentage-based positioning
          positions[clue.id] = clue.position;
        }
      });

      setCluePositions(positions);
    };

    calculatePositions();
    window.addEventListener('resize', calculatePositions);
    const timer = setTimeout(calculatePositions, 500); // Delay to ensure DOM is ready

    return () => {
      window.removeEventListener('resize', calculatePositions);
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    const revealed = localStorage.getItem('detective-everything-revealed') === 'true';
    if (revealed) {
      setEverythingRevealed(true);
      setMode('god');
    }
    
    // Show initial guide popup after page loads
    const guideShown = localStorage.getItem('detective-guide-shown') === 'true';
    if (!guideShown && !revealed) {
      const guideTimer = setTimeout(() => {
        setShowGuide(true);
      }, 1000); // Show after 1 second of page load
      return () => clearTimeout(guideTimer);
    }
  }, [setMode]);

  useEffect(() => {
    const revealed = localStorage.getItem('detective-everything-revealed') === 'true';
    
    // Show hints after guide is dismissed (only on first visit)
    if (!showGuide) {
      const hintsShown = localStorage.getItem('detective-hints-shown') === 'true';
      const guideShown = localStorage.getItem('detective-guide-shown') === 'true';
      
      // Only show hints if guide was just shown (user dismissed it) and hints haven't been shown yet
      if (!hintsShown && !revealed && guideShown) {
        const timer = setTimeout(() => {
          setShowHints(true);
          localStorage.setItem('detective-hints-shown', 'true');
        }, 1500); // Show hints 1.5 seconds after guide is dismissed
        
        return () => clearTimeout(timer);
      }
    }
  }, [showGuide]);

  const handleRevealEverything = () => {
    setEverythingRevealed(true);
    setShowHints(false);
    setMode('god');
    localStorage.setItem('detective-everything-revealed', 'true');
  };

  const handleSkipHints = () => {
    setShowHints(false);
    localStorage.setItem('detective-hints-shown', 'true');
  };

  const handleCloseGuide = () => {
    setShowGuide(false);
    localStorage.setItem('detective-guide-shown', 'true');
    // Hints will be shown via useEffect when showGuide becomes false
  };

  // Don't show hints if everything is revealed or in god mode
  if (everythingRevealed || mode === 'god') {
    return <>{children}</>;
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Initial Guide Popup */}
      <AnimatePresence>
        {showGuide && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={handleCloseGuide}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-2 border-amber-500/50 rounded-lg shadow-2xl p-8 max-w-2xl w-full relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={handleCloseGuide}
                className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
                aria-label="Close guide"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Header */}
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-amber-500/20 rounded-lg">
                  <PixelIcon name="user" size={48} className="text-amber-400" />
                </div>
                <div>
                  <h2 className="text-amber-400 font-bold text-2xl font-mono uppercase tracking-wider">
                    INVESTIGATION FILE
                  </h2>
                  <p className="text-slate-400 text-sm font-mono mt-1">
                    CASE: KIRUK IDENTITY INVESTIGATION
                  </p>
                </div>
              </div>

              {/* Content */}
              <div className="space-y-4 mb-6">
                <div className="bg-slate-800/50 border border-amber-500/30 rounded p-4">
                  <h3 className="text-amber-300 font-semibold text-lg font-mono mb-2 flex items-center gap-2">
                    <span>🕵️</span> WHO
                  </h3>
                  <p className="text-white text-sm font-mono leading-relaxed">
                    <strong className="text-amber-400">ARUN KUMAAR SREENIVASAN</strong> - Also known as <strong className="text-amber-400">"KIRUK"</strong>
                  </p>
                  <p className="text-slate-300 text-sm font-mono mt-2">
                    A creative technologist who bridges design and development.
                  </p>
                </div>

                <div className="bg-slate-800/50 border border-amber-500/30 rounded p-4">
                  <h3 className="text-amber-300 font-semibold text-lg font-mono mb-2 flex items-center gap-2">
                    <span>🎯</span> WHAT
                  </h3>
                  <ul className="text-white text-sm font-mono space-y-2 list-disc list-inside text-slate-300">
                    <li>Creates exceptional UX/UI designs</li>
                    <li>Builds full-stack applications</li>
                    <li>Specializes in AI Experience (AX) Design</li>
                    <li>Works with cloud technologies and microservices</li>
                  </ul>
                </div>

                <div className="bg-slate-800/50 border border-amber-500/30 rounded p-4">
                  <h3 className="text-amber-300 font-semibold text-lg font-mono mb-2 flex items-center gap-2">
                    <span>🗺️</span> HOW TO NAVIGATE
                  </h3>
                  <p className="text-white text-sm font-mono leading-relaxed text-slate-300">
                    This website is designed as an <strong className="text-amber-400">interactive investigation</strong>. Explore different sections to uncover clues about the subject. Look for <span className="text-amber-400">amber dots</span> that connect related information. Each page reveals more about the case.
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleCloseGuide}
                  className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white text-sm font-semibold rounded transition-colors font-mono uppercase tracking-wider"
                >
                  Begin Investigation
                </button>
                <button
                  onClick={() => {
                    handleCloseGuide();
                    handleRevealEverything();
                  }}
                  className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded transition-colors font-mono uppercase tracking-wider"
                >
                  Reveal All
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subtle hint indicators - dots on newspaper elements */}
      <div className="absolute inset-0 pointer-events-none z-10">
        {NEWSPAPER_CLUES.map((clue) => {
          const connectedClues = clue.connections?.map(connId => 
            NEWSPAPER_CLUES.find(c => c.id === connId)
          ).filter(Boolean) as Clue[] || [];
          
          const position = cluePositions[clue.id] || clue.position;

          return (
            <React.Fragment key={clue.id}>
              {/* Connecting lines */}
              {connectedClues.map((connectedClue) => {
                const connectedPosition = cluePositions[connectedClue.id] || connectedClue.position;
                return (
                  <svg
                    key={`${clue.id}-${connectedClue.id}`}
                    className="absolute inset-0 pointer-events-none"
                    style={{ zIndex: 1 }}
                  >
                    <motion.line
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ 
                        pathLength: showHints ? 1 : 0, 
                        opacity: showHints ? 0.15 : 0 
                      }}
                      transition={{ duration: 1.5, delay: 0.8 }}
                      x1={`${position.x}%`}
                      y1={`${position.y}%`}
                      x2={`${connectedPosition.x}%`}
                      y2={`${connectedPosition.y}%`}
                      stroke="var(--accent-color)"
                      strokeWidth="1.5"
                      strokeDasharray="4,4"
                    />
                  </svg>
                );
              })}

              {/* Clue dot indicator */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: showHints ? 1 : 0,
                  opacity: showHints ? 0.7 : 0
                }}
                whileHover={{ scale: 1.3, opacity: 1 }}
                className="absolute pointer-events-auto cursor-pointer"
                style={{
                  left: `${position.x}%`,
                  top: `${position.y}%`,
                  transform: 'translate(-50%, -50%)',
                  zIndex: 20
                }}
                onClick={() => setActiveClue(activeClue === clue.id ? null : clue.id)}
              >
                <div className="relative">
                  <div className="w-3 h-3 bg-amber-500 rounded-full border-2 border-amber-600 shadow-lg" />
                  <motion.div 
                    className="absolute inset-0 w-3 h-3 bg-amber-500 rounded-full"
                    animate={{ 
                      scale: [1, 1.5, 1],
                      opacity: [0.7, 0, 0.7]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                </div>
              </motion.div>
            </React.Fragment>
          );
        })}
      </div>

      {/* Hint tooltip */}
      <AnimatePresence>
        {activeClue && showHints && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-[9999] pointer-events-none"
          >
            <div className="bg-slate-900/95 border-2 border-amber-500/50 rounded-lg p-4 max-w-md shadow-2xl">
              <p className="text-amber-300 text-sm font-mono">
                {NEWSPAPER_CLUES.find(c => c.id === activeClue)?.hint}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Initial hint notification */}
      <AnimatePresence>
        {showHints && !activeClue && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed bottom-6 right-6 z-[9998]"
          >
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-2 border-amber-500/50 rounded-lg shadow-2xl p-6 max-w-sm">
              <div className="flex items-center gap-3 mb-4">
                <PixelIcon name="user" size={32} className="text-amber-400" />
                <div>
                  <h3 className="text-amber-400 font-bold text-lg font-mono">DETECTIVE MODE</h3>
                  <p className="text-slate-400 text-xs">Investigation in progress</p>
                </div>
              </div>
              <p className="text-white text-sm mb-4 font-mono">
                Look for <span className="text-amber-400">amber dots</span> on the newspaper. 
                They connect clues that will help you solve the case.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleSkipHints}
                  className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-semibold rounded transition-colors"
                >
                  Skip Hints
                </button>
                <button
                  onClick={handleRevealEverything}
                  className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded transition-colors"
                >
                  Reveal All
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {children}
    </div>
  );
}
