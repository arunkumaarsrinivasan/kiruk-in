'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { GRID_SIZE } from '@/lib/utils';
import { GridBackground } from '@/components/ui/GridBackground';
import { CrosswordPuzzle } from './components/crossword-puzzle';
import { ProjectFolders } from './components/project-folders';

export default function CaseStudies() {
  const { trackPageView, trackInteraction } = useAnalytics();
  const [showFolders, setShowFolders] = useState(false);

  useEffect(() => {
    trackPageView('/case-studies');
  }, [trackPageView]);

  const handlePuzzleComplete = () => {
    trackInteraction('crossword_completed', {});
    setShowFolders(true);
  };

  const handleFolderClick = (folder: any) => {
    trackInteraction('project_folder_clicked', { folder: folder.id });
  };

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

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-4 lg:px-8 pt-28 pb-32">
        <AnimatePresence mode="wait">
          {!showFolders ? (
            <motion.div
              key="crossword"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <CrosswordPuzzle onComplete={handlePuzzleComplete} />
            </motion.div>
          ) : (
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
