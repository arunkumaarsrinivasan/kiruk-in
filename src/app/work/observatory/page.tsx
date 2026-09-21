'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { PixelIcon } from '@/components/ui/PixelIcon';
import { GridBackground } from '@/components/ui/GridBackground';
import { SiteCrumbs } from '@/components/layout/SiteCrumbs';
import { useContextBar } from '@/contexts/ContextBarContext';
import { useExperience } from '@/hooks/usePortfolioData';

const ObservatoryView = dynamic(
  () =>
    import('../components/ObservatoryView').then(
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

export default function WorkObservatoryPage() {
  const [showIntro, setShowIntro] = useState(true);
  const { setWorkData } = useContextBar();
  const experiencesData = useExperience();

  useEffect(() => {
    if (!experiencesData || experiencesData.length === 0) return;

    const experiences = experiencesData.map((exp) => ({
      id: exp.id,
      company: exp.company,
      start: exp.startDate,
      end: exp.endDate,
      current: exp.current,
    }));

    const currentExp = experiencesData.find((e) => e.current);

    setWorkData({
      experiences,
      currentExperienceId: currentExp?.id || experiencesData[0]?.id,
    });
  }, [experiencesData, setWorkData]);

  return (
    <div
      className="relative min-h-0 overflow-hidden"
      style={{
        backgroundColor: 'var(--bg-main)',
        height: 'calc(100dvh - var(--simple-game-nav-bottom, 64px))',
        marginTop: 'var(--simple-game-nav-bottom, 64px)',
      }}
    >
      <div
        className="absolute inset-x-0 top-0 z-30 border-b-4 border-black p-3"
        style={{ backgroundColor: 'var(--bg-card)' }}
      >
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-1">
            <SiteCrumbs
              items={[
                { href: '/work', label: 'Work' },
                { label: 'Observatory' },
              ]}
            />
            <h1
              className="flex items-center gap-2 font-mono text-xl"
              style={{ color: 'var(--text-main)' }}
            >
              <PixelIcon name="star" size={20} /> SKILLS OBSERVATORY
            </h1>
          </div>
          <Link
            href="/work"
            className="site-chrome-link inline-flex min-h-11 items-center font-mono text-sm"
            style={{ color: 'var(--text-muted)' }}
          >
            ← Work
          </Link>
        </div>
      </div>

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

            <div className="text-center max-w-2xl px-4 relative z-10 pt-28">
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
                Look through the telescope and discover my skills as stars
              </motion.p>

              <motion.p
                className="text-base font-mono mb-8"
                style={{ color: 'var(--text-muted)' }}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                Each <span style={{ color: 'var(--accent-color)' }}>star</span> is a skill — brighter stars mean higher mastery.
                <br />
                Skills form <span style={{ color: 'var(--accent-color)' }}>constellations</span> across Design, Development, Leadership, Tools & Infrastructure.
                <br />
                Focus a star and press Enter, or use the list. Click to explore the journey.
              </motion.p>

              <motion.div
                className="flex flex-col items-center gap-4"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <button
                  onClick={() => setShowIntro(false)}
                  className="px-8 py-4 font-mono text-xl transition-opacity hover:opacity-80 wireframe-btn"
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
                  Tab to a star, then Enter • Click jobs to expand • Filter by constellation
                </div>
                <Link
                  href="/"
                  className="site-chrome-link inline-flex min-h-11 items-center font-mono text-sm"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Home
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!showIntro && (
        <div className="h-full pt-28">
          <ObservatoryView />
        </div>
      )}
    </div>
  );
}
