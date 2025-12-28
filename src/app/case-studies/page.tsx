'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
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
