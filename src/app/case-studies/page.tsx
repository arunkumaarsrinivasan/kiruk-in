'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useAnalytics } from '@/hooks/useAnalytics';
import { GRID_SIZE } from '@/lib/utils';
import { GridBackground } from '@/components/ui/GridBackground';

// Lazy load heavy components
const CrosswordPuzzle = dynamic(() => import('./components/crossword-puzzle').then(mod => ({ default: mod.CrosswordPuzzle })), {
  loading: () => <div className="flex items-center justify-center min-h-[400px]"><div className="text-sm font-mono">Loading puzzle...</div></div>,
  ssr: false,
});

const ProjectFolders = dynamic(() => import('./components/project-folders').then(mod => ({ default: mod.ProjectFolders })), {
  loading: () => <div className="flex items-center justify-center min-h-[400px]"><div className="text-sm font-mono">Loading projects...</div></div>,
  ssr: false,
});

export default function CaseStudies() {
  const { trackPageView, trackInteraction } = useAnalytics();
  const [showFolders, setShowFolders] = useState(false);
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    trackPageView('/case-studies');
  }, [trackPageView]);

  const handlePuzzleComplete = () => {
    trackInteraction('crossword_completed', {});
    setShowFolders(true);
  };

  const handleFolderClick = (_folder: { id: string }) => {
    trackInteraction('project_folder_clicked', { folder: _folder.id });
  };

  const handleStartCrossword = useCallback(() => {
    setShowIntro(false);
    trackInteraction('crossword_started', {});
  }, [trackInteraction]);

  const handleSkip = useCallback(() => {
    setShowIntro(false);
    setShowFolders(true);
    trackInteraction('crossword_skipped', {});
  }, [trackInteraction]);

  return (
    <main 
      className="min-h-screen relative overflow-hidden"
      style={{
        backgroundColor: 'var(--bg-main)',
        imageRendering: 'pixelated' as any,
      }}
    >
      <GridBackground />
      {/* Grid Background - No dots, just grid lines */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(var(--border-color) 1px, transparent 1px),
            linear-gradient(90deg, var(--border-color) 1px, transparent 1px)
          `,
          backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
          opacity: 0.3,
          imageRendering: 'pixelated' as any,
        }}
      />
      
      {/* Scanlines effect for retro pixel feel */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-5"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)",
        }}
      />

      {/* Intro Screen */}
      <AnimatePresence mode="wait">
        {showIntro && (
          <motion.div
            className="fixed inset-0 z-20 flex items-center justify-center bg-black/95"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="max-w-2xl mx-auto px-8 text-center"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <motion.div 
                className="text-6xl mb-6"
                animate={{ rotate: [0, -5, 5, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
              >
                🧩
              </motion.div>
              <h1 className="text-4xl font-mono text-white mb-4">
                DESIGN PROJECTS CROSSWORD
              </h1>
              <h2 className="text-2xl font-mono mb-6" style={{ color: '#FFD93D' }}>
                SOLVE TO UNLOCK
              </h2>
              <div
                className="p-6 mb-6 text-left"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  border: '4px solid var(--border-color)',
                  boxShadow: '0 0 0 2px var(--bg-main), 4px 4px 0 var(--border-color)',
                }}
              >
                <p className="font-mono text-sm mb-4" style={{ color: 'var(--text-main)' }}>
                  Want to see my design projects? Solve the crossword puzzle!
                </p>
                <p className="font-mono text-sm mb-3" style={{ color: '#FFD93D' }}>
                  📝 Fill in the missing letters to unlock project folders.
                </p>
                <div
                  className="p-4 mb-3"
                  style={{
                    backgroundColor: 'rgba(107, 207, 127, 0.1)',
                    border: '2px solid #6BCF7F',
                  }}
                >
                  <p className="font-mono text-xs" style={{ color: '#6BCF7F' }}>
                    🎁 Unlock: Project folders with detailed case studies
                  </p>
                </div>
                <p className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
                  💡 Words intersect! Use hints if you get stuck.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <motion.button
                  onClick={handleStartCrossword}
                  className="px-8 py-4 font-mono text-lg border-2 font-bold"
                  style={{
                    backgroundColor: '#FFD93D',
                    borderColor: '#FFD93D',
                    color: '#000',
                    boxShadow: '0 0 0 2px var(--bg-main), 4px 4px 0 var(--border-color)',
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  🧩 SOLVE CROSSWORD
                </motion.button>
                <motion.button
                  onClick={handleSkip}
                  className="px-8 py-4 font-mono text-lg border-2 font-bold"
                  style={{
                    backgroundColor: 'transparent',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-main)',
                  }}
                  whileHover={{ scale: 1.05, backgroundColor: 'var(--bg-card)' }}
                  whileTap={{ scale: 0.95 }}
                >
                  ⏭️ SKIP TO CONTENT
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-4 lg:px-8 pt-28 pb-32">
        <AnimatePresence mode="wait">
          {!showIntro && !showFolders && (
            <motion.div
              key="crossword"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <CrosswordPuzzle onComplete={handlePuzzleComplete} />
            </motion.div>
          )}
          {!showIntro && showFolders && (
            <motion.div
              key="folders"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <ProjectFolders onFolderClick={handleFolderClick} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
