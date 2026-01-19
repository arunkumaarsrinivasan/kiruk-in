'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { ThemeConfig } from '@/data/portfolio-data';

interface NavigationControlsProps {
  eras: ThemeConfig[];
  currentEraId: string;
  selectedEraId: string | null;
  onPrevious: () => void;
  onNext: () => void;
  onJumpToDecade: (decade: string) => void;
}

// Get decade from year
const getDecade = (year: string): string => {
  const yearNum = Number.parseInt(year, 10);
  return `${Math.floor(yearNum / 10) * 10}s`;
};

export function NavigationControls({
  eras,
  currentEraId,
  selectedEraId,
  onPrevious,
  onNext,
  onJumpToDecade,
}: NavigationControlsProps) {
  const currentIndex = eras.findIndex((e) => e.id === currentEraId);
  const selectedIndex = selectedEraId
    ? eras.findIndex((e) => e.id === selectedEraId)
    : currentIndex;

  const canGoPrevious = selectedIndex > 0;
  const canGoNext = selectedIndex < eras.length - 1;

  // Get unique decades
  const decades = Array.from(
    new Set(eras.map((era) => getDecade(era.id)))
  ).sort();

  // Get first era of each decade
  const getFirstEraOfDecade = (decade: string): ThemeConfig | undefined => {
    return eras.find((era) => getDecade(era.id) === decade);
  };

  return (
    <div className="flex flex-col gap-3 lg:gap-4 p-3 lg:p-4 bg-[var(--bg-main)] border-t-2 border-[var(--border-color)] flex-shrink-0">
      {/* Position Indicator */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="font-mono text-[10px] lg:text-xs text-[var(--text-muted)]">
          Position:{' '}
          <span className="font-bold text-[var(--accent-color)]">
            {selectedIndex + 1} / {eras.length}
          </span>
        </div>
        <div className="font-mono text-[10px] lg:text-xs text-[var(--text-muted)]">
          {eras[selectedIndex]?.name.split(':')[0] || 'Unknown'}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center gap-2">
        <motion.button
          onClick={onPrevious}
          disabled={!canGoPrevious}
          className={cn(
            'flex-1 py-2 lg:py-3 px-3 lg:px-4 font-mono text-[10px] lg:text-xs font-bold uppercase border-2',
            'transition-all',
            canGoPrevious
              ? 'bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-main)] hover:border-[var(--accent-color)] hover:text-[var(--accent-color)]'
              : 'bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-muted)] opacity-50 cursor-not-allowed'
          )}
          whileHover={canGoPrevious ? { scale: 1.02 } : {}}
          whileTap={canGoPrevious ? { scale: 0.98 } : {}}
        >
          ← Previous
        </motion.button>

        <motion.button
          onClick={onNext}
          disabled={!canGoNext}
          className={cn(
            'flex-1 py-2 lg:py-3 px-3 lg:px-4 font-mono text-[10px] lg:text-xs font-bold uppercase border-2',
            'transition-all',
            canGoNext
              ? 'bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-main)] hover:border-[var(--accent-color)] hover:text-[var(--accent-color)]'
              : 'bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-muted)] opacity-50 cursor-not-allowed'
          )}
          whileHover={canGoNext ? { scale: 1.02 } : {}}
          whileTap={canGoNext ? { scale: 0.98 } : {}}
        >
          Next →
        </motion.button>
      </div>

      {/* Decade Jump Buttons */}
      <div>
        <div className="font-mono text-[9px] lg:text-[10px] text-[var(--text-muted)] uppercase mb-2">
          Jump to Decade
        </div>
        <div className="flex flex-wrap gap-1.5 lg:gap-2">
          {decades.map((decade) => {
            const firstEra = getFirstEraOfDecade(decade);
            const isCurrentDecade =
              firstEra &&
              getDecade(currentEraId) === getDecade(firstEra.id);

            return (
              <motion.button
                key={decade}
                onClick={() => onJumpToDecade(decade)}
                className={cn(
                  'px-2 lg:px-3 py-1 lg:py-1.5 font-mono text-[9px] lg:text-[10px] font-bold uppercase border-2',
                  'transition-all',
                  isCurrentDecade
                    ? 'bg-[var(--accent-color)] border-[var(--accent-color)] text-[var(--bg-main)]'
                    : 'bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-main)] hover:border-[var(--accent-color)]'
                )}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {decade}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
