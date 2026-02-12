'use client';

import { motion } from 'framer-motion';
import { useEffect, useState, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useAnalytics } from '@/hooks/useAnalytics';
import { GridBackground } from '@/components/ui/GridBackground';

const ProjectFolders = dynamic(() => import('./components/project-folders').then(mod => ({ default: mod.ProjectFolders })), {
  loading: () => <div className="flex items-center justify-center min-h-[400px]"><div className="text-sm font-mono">Loading projects...</div></div>,
  ssr: false,
});

export default function CaseStudies() {
  const { trackPageView, trackInteraction } = useAnalytics();
  const [torchEnabled, setTorchEnabled] = useState(true);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    trackPageView('/case-studies');
  }, [trackPageView]);

  // Detect mobile / touch device
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isMobile) setMousePos({ x: e.clientX, y: e.clientY });
  }, [isMobile]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (touch) setMousePos({ x: touch.clientX, y: touch.clientY });
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (touch) setMousePos({ x: touch.clientX, y: touch.clientY });
  }, []);

  useEffect(() => {
    setMousePos({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  }, []);

  const handleFolderClick = (_folder: { id: string }) => {
    trackInteraction('project_folder_clicked', { folder: _folder.id });
  };

  const toggleTorch = useCallback(() => {
    setTorchEnabled(prev => !prev);
    trackInteraction('torch_toggled', { enabled: !torchEnabled });
  }, [torchEnabled, trackInteraction]);

  // Smaller spotlight on mobile, larger on desktop
  const spotlightSize = isMobile ? 120 : 180;

  return (
    <main
      ref={containerRef}
      className="min-h-screen relative overflow-hidden"
      style={{
        backgroundColor: 'var(--bg-main)',
        imageRendering: 'pixelated' as any,
      }}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      onTouchStart={handleTouchStart}
    >
      <GridBackground />

      {/* Torch/Spotlight Overlay */}
      {torchEnabled && (
        <div
          className="fixed inset-0 z-30 pointer-events-none transition-opacity duration-500"
          style={{
            background: `radial-gradient(circle ${spotlightSize}px at ${mousePos.x}px ${mousePos.y}px, transparent 0%, rgba(0,0,0,0.15) 30%, rgba(0,0,0,0.6) 60%, rgba(0,0,0,0.92) 100%)`,
          }}
        />
      )}

      {/* Toggle Button — responsive positioning */}
      <motion.button
        type="button"
        onClick={toggleTorch}
        className="fixed top-24 right-3 sm:right-6 z-40 wireframe-border px-3 py-2 sm:px-4 sm:py-3 font-mono text-[10px] sm:text-xs uppercase flex items-center gap-1 sm:gap-2"
        style={{
          backgroundColor: torchEnabled ? 'var(--accent-color)' : 'var(--bg-card)',
          color: torchEnabled ? 'var(--bg-main)' : 'var(--text-main)',
          imageRendering: 'pixelated' as any,
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
      >
        {torchEnabled ? '🔦 LIGHTS ON' : '🔦 INVESTIGATE'}
      </motion.button>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-4 lg:px-8 pt-28 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <ProjectFolders onFolderClick={handleFolderClick} />
        </motion.div>
      </div>
    </main>
  );
}
