'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useAnalytics } from '@/hooks/useAnalytics';
import { GridBackground } from '@/components/ui/GridBackground';
import { SplitCharacterCanvas, type CharacterSide } from '@/components/ui/SplitCharacter';

const ProjectShowcaseSlider = dynamic(
  () =>
    import('./project-showcase-slider').then((m) => ({
      default: m.ProjectShowcaseSlider,
    })),
  {
    loading: () => (
      <div className="flex min-h-[360px] items-center justify-center">
        <span className="text-sm font-mono" style={{ color: 'var(--text-muted)' }}>
          Loading projects…
        </span>
      </div>
    ),
    ssr: false,
  },
);

const ProjectFolders = dynamic(
  () => import('./project-folders').then((mod) => ({ default: mod.ProjectFolders })),
  {
    loading: () => (
      <div className="flex min-h-[120px] items-center justify-center">
        <span className="text-sm font-mono" style={{ color: 'var(--text-muted)' }}>
          Loading platforms…
        </span>
      </div>
    ),
    ssr: false,
  },
);

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

const SIDE_OPTIONS: { id: CharacterSide; label: string }[] = [
  { id: null, label: 'All work' },
  { id: 'designer', label: 'Design' },
  { id: 'developer', label: 'Code' },
];

export function CaseStudiesContent() {
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

  const setSide = useCallback(
    (side: CharacterSide) => {
      setActiveSide(side);
      if (side) trackInteraction('character_side_clicked', { side });
    },
    [trackInteraction],
  );

  const handleSideClick = useCallback(
    (side: 'designer' | 'developer') => {
      setSide(activeSide === side ? null : side);
    },
    [activeSide, setSide],
  );

  const sideLabel =
    activeSide === 'designer'
      ? 'Design work'
      : activeSide === 'developer'
        ? 'Code projects'
        : 'All platforms';

  return (
    <div className="relative min-h-full overflow-x-hidden">
      <GridBackground opacity={0.08} scanlinesOpacity={0} />

      <div className="relative z-10 mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        <motion.header
          className="mb-10 grid items-center gap-8 lg:grid-cols-[minmax(0,340px)_1fr] lg:gap-12"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: EASE_OUT }}
        >
          <div className="mx-auto w-full max-w-sm lg:max-w-none">
            <SplitCharacterCanvas
              className="w-full"
              height={isMobile ? 240 : 300}
              activeSide={activeSide}
              onSideClick={handleSideClick}
            />
          </div>

          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <p
              className="text-[11px] font-semibold uppercase tracking-[0.28em]"
              style={{ color: 'var(--accent-color)' }}
            >
              Work · deep dives & platforms
            </p>
            <h1
              className="mt-2 text-2xl font-bold uppercase sm:text-3xl lg:text-4xl"
              style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-main)' }}
            >
              Half designer / half developer
            </h1>
            <p className="mt-3 max-w-md text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              Tap a side of the character — or use the filters — to sort the showcase. Swipe through
              selected projects, then jump to external platforms for full case studies.
            </p>

            <div className="mt-5 flex flex-wrap justify-center gap-2 lg:justify-start">
              {SIDE_OPTIONS.map((opt) => {
                const on = activeSide === opt.id;
                return (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => setSide(opt.id)}
                    className="px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] transition-transform hover:-translate-y-0.5"
                    style={{
                      border: `1px solid ${on ? 'var(--accent-color)' : 'var(--border-color)'}`,
                      borderRadius: 'var(--era-radius-full, 999px)',
                      background: on
                        ? 'color-mix(in srgb, var(--accent-color) 14%, transparent)'
                        : 'transparent',
                      color: on ? 'var(--accent-color)' : 'var(--text-muted)',
                    }}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>

            <AnimatePresence mode="wait">
              <motion.p
                key={sideLabel}
                className="mt-4 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em]"
                style={{ color: 'var(--text-muted)' }}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
              >
                <span
                  className="inline-block h-1.5 w-1.5 rounded-full"
                  style={{ background: 'var(--accent-color)' }}
                />
                Showing: {sideLabel}
              </motion.p>
            </AnimatePresence>
          </div>
        </motion.header>

        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.12, ease: EASE_OUT }}
        >
          <ProjectShowcaseSlider activeSide={activeSide} />
        </motion.div>

        <motion.section
          aria-labelledby="platforms-heading"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: EASE_OUT }}
        >
          <div className="mb-6 border-t pt-10" style={{ borderColor: 'var(--border-color)' }}>
            <p
              className="text-[11px] font-semibold uppercase tracking-[0.28em]"
              style={{ color: 'var(--accent-color)' }}
            >
              Elsewhere
            </p>
            <h2
              id="platforms-heading"
              className="mt-1 text-lg font-bold sm:text-xl"
              style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-main)' }}
            >
              Find me on other platforms
            </h2>
            <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
              Figma decks, Behance process work, GitHub repos, and more.
            </p>
          </div>
          <ProjectFolders onFolderClick={handleFolderClick} activeSide={activeSide} />
        </motion.section>
      </div>
    </div>
  );
}
