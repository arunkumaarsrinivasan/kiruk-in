'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { ThemeConfig } from '@/data/portfolio-data';

interface TimelineVisualizationProps {
  eras: ThemeConfig[];
  currentEraId: string;
  selectedEraId: string | null;
  onSelectEra: (eraId: string) => void;
  onHoverEra: (eraId: string | null) => void;
}

// Group eras by decade
const getDecade = (year: string): string => {
  const yearNum = Number.parseInt(year, 10);
  return `${Math.floor(yearNum / 10) * 10}s`;
};

export function TimelineVisualization({
  eras,
  currentEraId,
  selectedEraId,
  onSelectEra,
  onHoverEra,
}: TimelineVisualizationProps) {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [hoveredEraId, setHoveredEraId] = useState<string | null>(null);

  // Scroll to current era when component mounts or current era changes
  useEffect(() => {
    if (timelineRef.current) {
      const currentIndex = eras.findIndex((e) => e.id === currentEraId);
      if (currentIndex >= 0) {
        const eraElement = timelineRef.current.querySelector(
          `[data-era-id="${currentEraId}"]`
        );
        if (eraElement) {
          eraElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }
  }, [currentEraId, eras]);

  // Group eras by decade
  const erasByDecade = eras.reduce((acc, era) => {
    const decade = getDecade(era.id);
    if (!acc[decade]) {
      acc[decade] = [];
    }
    acc[decade].push(era);
    return acc;
  }, {} as Record<string, ThemeConfig[]>);

  const decades = Object.keys(erasByDecade).sort();

  const handleEraHover = (eraId: string | null) => {
    setHoveredEraId(eraId);
    onHoverEra(eraId);
  };

  return (
    <div className="flex flex-col h-full bg-[var(--bg-card)]">
      {/* Header */}
      <div className="p-3 lg:p-4 border-b-2 border-[var(--border-color)] flex-shrink-0">
        <h3 className="font-mono text-xs lg:text-sm font-bold uppercase text-[var(--text-main)]">
          TIMELINE
        </h3>
        <p className="font-mono text-[10px] lg:text-xs text-[var(--text-muted)] mt-1">
          {eras.length} Eras • {decades.length} Decades
        </p>
      </div>

      {/* Scrollable Timeline */}
      <div
        ref={timelineRef}
        className="flex-1 overflow-y-auto scrollbar-hide p-3 lg:p-4"
      >
        <div className="relative">
          {/* Vertical Timeline Line */}
          <div
            className="absolute left-6 lg:left-8 top-0 bottom-0 w-0.5"
            style={{ backgroundColor: 'var(--border-color)' }}
          />

          {/* Era Markers */}
          <div className="relative space-y-6">
            {eras.map((era, index) => {
              const isCurrent = era.id === currentEraId;
              const isSelected = era.id === selectedEraId;
              const isHovered = era.id === hoveredEraId;
              const year = Number.parseInt(era.id, 10);

              return (
                <motion.div
                  key={era.id}
                  data-era-id={era.id}
                  className="relative flex items-center gap-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.02 }}
                >
                  {/* Timeline Marker */}
                  <div className="relative z-10 flex-shrink-0">
                    <motion.button
                      onClick={() => onSelectEra(era.id)}
                      onMouseEnter={() => handleEraHover(era.id)}
                      onMouseLeave={() => handleEraHover(null)}
                      className={cn(
                        'relative w-12 h-12 lg:w-16 lg:h-16 rounded-full border-2 flex items-center justify-center',
                        'transition-all font-mono font-black text-[10px] lg:text-xs',
                        isCurrent
                          ? 'bg-[var(--accent-color)] border-[var(--accent-color)] text-[var(--bg-main)] scale-110'
                          : isSelected
                            ? 'bg-[var(--bg-main)] border-[var(--accent-color)] text-[var(--accent-color)] scale-105'
                            : isHovered
                              ? 'bg-[var(--bg-main)] border-[var(--text-main)] text-[var(--text-main)] scale-105'
                              : 'bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-muted)]'
                      )}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {year}
                      {/* Glow effect for current era */}
                      {isCurrent && (
                        <motion.div
                          className="absolute inset-0 rounded-full bg-[var(--accent-color)]"
                          animate={{ opacity: [0.3, 0.6, 0.3] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      )}
                    </motion.button>
                  </div>

                  {/* Era Info */}
                  <div className="flex-1 min-w-0">
                    <div
                      className={cn(
                        'font-mono text-[10px] lg:text-xs font-bold uppercase truncate',
                        isCurrent || isSelected
                          ? 'text-[var(--accent-color)]'
                          : 'text-[var(--text-main)]'
                      )}
                    >
                      {era.name.split(':')[0]}
                    </div>
                    <div className="font-mono text-[9px] lg:text-[10px] text-[var(--text-muted)] truncate">
                      {era.era}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Current Era Indicator */}
      <div className="p-3 lg:p-4 border-t-2 border-[var(--border-color)] bg-[var(--bg-main)] flex-shrink-0">
        <div className="font-mono text-[10px] lg:text-xs text-[var(--text-muted)]">
          Current:{' '}
          <span className="font-bold text-[var(--accent-color)]">
            {eras.find((e) => e.id === currentEraId)?.name || currentEraId}
          </span>
        </div>
        <div className="font-mono text-[9px] lg:text-[10px] text-[var(--text-muted)] mt-1">
          {eras.findIndex((e) => e.id === currentEraId) + 1} / {eras.length}
        </div>
      </div>
    </div>
  );
}
