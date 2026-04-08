'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useAnalytics } from '@/hooks/useAnalytics';
import { GridBackground } from '@/components/ui/GridBackground';
import { SplitCharacterCanvas, type CharacterSide } from '@/components/ui/SplitCharacter';

const ProjectFolders = dynamic(() => import('./components/project-folders').then(mod => ({ default: mod.ProjectFolders })), {
  loading: () => <div className="flex items-center justify-center min-h-[200px]"><div className="text-sm font-mono" style={{ color: 'var(--text-muted)' }}>Loading projects...</div></div>,
  ssr: false,
});

export default function CaseStudies() {
  const { trackPageView, trackInteraction } = useAnalytics();
  const [activeSide, setActiveSide] = useState<CharacterSide>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    trackPageView('/case-studies');
  }, [trackPageView]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(globalThis.innerWidth < 768 || 'ontouchstart' in globalThis);
    checkMobile();
    globalThis.addEventListener('resize', checkMobile, { passive: true });
    return () => globalThis.removeEventListener('resize', checkMobile);
  }, []);

  const handleFolderClick = (_folder: { id: string }) => {
    trackInteraction('project_folder_clicked', { folder: _folder.id });
  };

  const handleSideClick = useCallback((side: "designer" | "developer") => {
    setActiveSide(prev => prev === side ? null : side);
    trackInteraction('character_side_clicked', { side });
  }, [trackInteraction]);

  const sideLabel = activeSide === "designer"
    ? "Design Work"
    : activeSide === "developer"
      ? "Code Projects"
      : null;

  return (
    <main
      className="min-h-screen relative overflow-hidden"
      style={{ backgroundColor: 'var(--bg-main)' }}
    >
      <GridBackground />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-24">
        {/* Character hero + title */}
        <motion.div
          className="flex flex-col items-center mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <SplitCharacterCanvas
            className="w-full max-w-md"
            height={isMobile ? 280 : 360}
            activeSide={activeSide}
            onSideClick={handleSideClick}
          />

          <motion.h1
            className="font-mono text-2xl sm:text-3xl font-bold uppercase text-center mt-4"
            style={{ color: 'var(--accent-color)' }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Half Designer / Half Developer
          </motion.h1>

          {/* Active side indicator */}
          <AnimatePresence mode="wait">
            {sideLabel ? (
              <motion.p
                key={sideLabel}
                className="font-mono text-xs sm:text-sm text-center mt-2 px-4 py-1"
                style={{
                  color: 'var(--bg-main)',
                  backgroundColor: 'var(--accent-color)',
                }}
                initial={{ opacity: 0, y: 6, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.95 }}
                transition={{ duration: 0.25 }}
              >
                Showing: {sideLabel}
              </motion.p>
            ) : (
              <motion.p
                key="all"
                className="font-mono text-xs sm:text-sm text-center mt-2 max-w-lg"
                style={{ color: 'var(--text-muted)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                Explore my work across different platforms
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Project folders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <ProjectFolders
            onFolderClick={handleFolderClick}
            activeSide={activeSide}
          />
        </motion.div>
      </div>
    </main>
  );
}
