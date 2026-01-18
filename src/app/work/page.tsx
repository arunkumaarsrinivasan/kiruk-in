'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import { PixelIcon } from '@/components/ui/PixelIcon';
import { GridBackground } from '@/components/ui/GridBackground';
import '@/app/work/styles/observatory.css';

// Lazy load observatory view
const ObservatoryView = dynamic(
  () =>
    import('./components/ObservatoryView').then(
      (mod) => ({ default: mod.ObservatoryView })
    ),
  {
    ssr: false,
    loading: () => (
      <div
        className="min-h-screen flex items-center justify-center font-mono"
        style={{ color: 'var(--text-muted)' }}
      >
        Loading Observatory...
      </div>
    ),
  }
);

export default function Work() {
  const [showIntro, setShowIntro] = useState(true);

  return (
    <main
      className="min-h-screen overflow-hidden relative"
      style={{ backgroundColor: 'var(--bg-main)' }}
    >
      {/* Header */}
      <div
        className="fixed top-0 left-0 right-0 z-30 border-b-4 border-black p-3"
        style={{ backgroundColor: 'var(--bg-card)' }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1
              className="text-xl font-mono flex items-center gap-2"
              style={{ color: 'var(--text-main)' }}
            >
              <PixelIcon name="star" size={20} /> SKILLS OBSERVATORY
            </h1>
          </div>
        </div>
      </div>

      {/* Intro Screen */}
      <AnimatePresence>
        {showIntro && (
          <motion.div
            className="fixed inset-0 z-20 flex items-center justify-center"
            style={{ backgroundColor: 'var(--bg-main)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <GridBackground opacity={0.3} />

            <div className="text-center max-w-2xl px-4 relative z-10">
              <motion.h1
                className="text-4xl md:text-5xl font-mono mb-4 flex items-center justify-center gap-3"
                style={{ color: 'var(--text-main)' }}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <PixelIcon name="star" size={48} className="md:hidden" />
                <PixelIcon name="star" size={56} className="hidden md:inline" />
                SKILLS OBSERVATORY
              </motion.h1>

              <motion.p
                className="text-lg font-mono mb-4"
                style={{ color: 'var(--text-main)' }}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Explore my professional journey through the stars
              </motion.p>

              <motion.p
                className="text-base font-mono mb-8"
                style={{ color: 'var(--text-muted)' }}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                Each star represents a skill plotted by{' '}
                <span style={{ color: 'var(--accent-color)' }}>years of experience</span>
                {' '}and{' '}
                <span style={{ color: 'var(--accent-color)' }}>mastery level</span>.
                <br />
                Hover over stars to discover where each skill was learned.
                <br />
                Click on jobs to see the skills I used there.
              </motion.p>

              <motion.div
                className="flex flex-col items-center gap-4"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <button
                  onClick={() => setShowIntro(false)}
                  className="px-8 py-4 font-mono text-xl transition-all hover:opacity-80 wireframe-btn"
                  style={{
                    borderWidth: 'var(--border-width)',
                    borderColor: 'var(--border-color)',
                    boxShadow:
                      'var(--shadow-offset-x) var(--shadow-offset-y) var(--shadow-blur) var(--shadow-color)',
                  }}
                >
                  <PixelIcon name="play" size={24} /> ENTER OBSERVATORY
                </button>

                <div
                  className="text-sm font-mono"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Hover stars for details • Click jobs to expand • Filter by constellation
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Observatory View */}
      {!showIntro && (
        <div className="pt-16">
          <ObservatoryView />
        </div>
      )}
    </main>
  );
}

