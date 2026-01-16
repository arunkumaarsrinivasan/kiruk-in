'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import { PixelIcon } from '@/components/ui/PixelIcon';
import { GridBackground } from '@/components/ui/GridBackground';

// Lazy load constellation view
const ConstellationView = dynamic(
  () =>
    import('./components/ConstellationView').then(
      (mod) => ({ default: mod.ConstellationView })
    ),
  {
    ssr: false,
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
              <PixelIcon name="star" size={20} /> MY SKILL PIN BOARD
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
                className="text-4xl md:text-6xl font-mono mb-4 flex items-center justify-center gap-3"
                style={{ color: 'var(--text-main)' }}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <PixelIcon name="star" size={48} className="md:hidden" />
                <PixelIcon name="star" size={64} className="hidden md:inline" />
                STARGAZING THROUGH MY EXPERTISE
              </motion.h1>

              <motion.p
                className="text-lg font-mono mb-4"
                style={{ color: 'var(--text-main)' }}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Explore the celestial map of my skills!
              </motion.p>

              <motion.p
                className="text-base font-mono mb-8"
                style={{ color: 'var(--text-muted)' }}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                where each constellation tells a story of expertise and growth.
                <br />
                Navigate the cosmos of my expertise • Hover over pins to discover their power.
                <br />
                <span style={{ color: 'var(--accent-color)' }}>
                  Click stars to discover details
                </span>
              </motion.p>

              <motion.div
                className="flex flex-col items-center gap-4"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <button
                  onClick={() => setShowIntro(false)}
                  className="px-8 py-4 font-mono text-2xl transition-all hover:opacity-80 wireframe-btn"
                  style={{
                    borderWidth: 'var(--border-width)',
                    borderColor: 'var(--border-color)',
                    boxShadow:
                      'var(--shadow-offset-x) var(--shadow-offset-y) var(--shadow-blur) var(--shadow-color)',
                  }}
                >
                  <PixelIcon name="play" size={24} /> EXPLORE CONSTELLATION
                </button>

                <div
                  className="text-sm font-mono"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Drag to pan | Scroll to zoom | Click stars for details
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Constellation View */}
      {!showIntro && (
        <div className="pt-16">
          <ConstellationView />
        </div>
      )}
    </main>
  );
}
