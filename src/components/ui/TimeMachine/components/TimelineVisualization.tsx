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

// Get era-specific visual density (grid dots size) - smaller = more HD
const getVisualDensity = (gridSize: number | null): { dotSize: number; dotCount: number } => {
  if (!gridSize) return { dotSize: 2, dotCount: 8 }; // Modern - ultra fine
  if (gridSize >= 32) return { dotSize: 6, dotCount: 3 }; // 1970s-1990s - chunky
  if (gridSize >= 16) return { dotSize: 4, dotCount: 4 }; // 2000s - medium
  if (gridSize >= 8) return { dotSize: 3, dotCount: 5 }; // 2010s - finer
  return { dotSize: 2, dotCount: 6 }; // 2020s - HD
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
          TIME MACHINE
        </h3>
        <p className="font-mono text-[10px] lg:text-xs text-[var(--text-muted)] mt-1">
          {eras.length} Eras • {decades.length} Decades • 1970 → 2025
        </p>
      </div>

      {/* Scrollable Timeline */}
      <div
        ref={timelineRef}
        className="flex-1 overflow-y-auto scrollbar-hide p-3 lg:p-4"
      >
        <div className="relative">
          {/* Vertical Timeline Line - Gradient from chunky to refined */}
          <div
            className="absolute left-6 lg:left-8 top-0 bottom-0 w-0.5"
            style={{
              background: 'linear-gradient(180deg, var(--border-color) 0%, var(--accent-color) 50%, var(--border-color) 100%)',
            }}
          />

          {/* Era Markers */}
          <div className="relative space-y-4">
            {eras.map((era, index) => {
              const isCurrent = era.id === currentEraId;
              const isSelected = era.id === selectedEraId;
              const isHovered = era.id === hoveredEraId;
              const year = Number.parseInt(era.id, 10);

              // Get era-specific styling from designTokens
              const tokens = era.designTokens;
              const borderRadius = tokens?.borderRadius ?? 0;
              const gridSize = tokens?.gridSize;
              const density = getVisualDensity(gridSize);
              const shadowStyle = tokens?.shadowStyle ?? 'none';

              // Dynamic border radius for marker (evolves from 0 to fully round)
              const markerRadius = Math.min(50, borderRadius * 2); // Max 50% for circular

              return (
                <motion.div
                  key={era.id}
                  data-era-id={era.id}
                  className="relative flex items-center gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.02 }}
                >
                  {/* Timeline Marker with Era-specific styling */}
                  <div className="relative z-10 flex-shrink-0">
                    <motion.button
                      onClick={() => onSelectEra(era.id)}
                      onMouseEnter={() => handleEraHover(era.id)}
                      onMouseLeave={() => handleEraHover(null)}
                      className={cn(
                        'relative w-12 h-12 lg:w-14 lg:h-14 border-2 flex items-center justify-center overflow-hidden',
                        'transition-all font-mono font-black text-[10px] lg:text-xs',
                        isCurrent
                          ? 'border-[var(--accent-color)] text-[var(--bg-main)] scale-110'
                          : isSelected
                            ? 'border-[var(--accent-color)] text-[var(--accent-color)] scale-105'
                            : isHovered
                              ? 'border-[var(--text-main)] text-[var(--text-main)] scale-105'
                              : 'border-[var(--border-color)] text-[var(--text-muted)]'
                      )}
                      style={{
                        borderRadius: `${markerRadius}%`,
                        backgroundColor: isCurrent
                          ? era.colors.accent
                          : era.colors.background,
                        // Era-specific shadow
                        boxShadow: shadowStyle === 'glow' && (isCurrent || isHovered)
                          ? `0 0 15px ${era.colors.accent}60`
                          : shadowStyle === 'hard'
                            ? `3px 3px 0 ${era.colors.secondary}`
                            : 'none',
                      }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {/* Visual Density Grid - Shows grid evolution */}
                      <div
                        className="absolute inset-1 pointer-events-none opacity-30"
                        style={{
                          display: 'grid',
                          gridTemplateColumns: `repeat(${density.dotCount}, 1fr)`,
                          gridTemplateRows: `repeat(${density.dotCount}, 1fr)`,
                          gap: '2px',
                        }}
                      >
                        {Array.from({ length: density.dotCount * density.dotCount }).map((_, i) => (
                          <div
                            key={i}
                            style={{
                              width: `${density.dotSize}px`,
                              height: `${density.dotSize}px`,
                              backgroundColor: isCurrent
                                ? era.colors.background
                                : era.colors.text,
                              borderRadius: `${borderRadius > 8 ? 50 : 0}%`,
                              opacity: 0.4,
                            }}
                          />
                        ))}
                      </div>

                      {/* Year Label */}
                      <span
                        className="relative z-10"
                        style={{
                          color: isCurrent ? era.colors.background : era.colors.text,
                          fontFamily: era.fonts.accent,
                        }}
                      >
                        {year.toString().slice(-2)}
                      </span>

                      {/* Glow effect for current era */}
                      {isCurrent && (
                        <motion.div
                          className="absolute inset-0"
                          style={{
                            backgroundColor: era.colors.accent,
                            borderRadius: `${markerRadius}%`,
                          }}
                          animate={{ opacity: [0.3, 0.6, 0.3] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      )}
                    </motion.button>
                  </div>

                  {/* Era Info - With era-specific typography */}
                  <div className="flex-1 min-w-0">
                    <div
                      className={cn(
                        'text-[10px] lg:text-xs font-bold uppercase truncate',
                        isCurrent || isSelected
                          ? 'text-[var(--accent-color)]'
                          : 'text-[var(--text-main)]'
                      )}
                      style={{
                        fontFamily: era.fonts.primary,
                        letterSpacing: `${(tokens?.letterSpacing ?? 0) * 0.01}em`,
                      }}
                    >
                      {era.name.split(':')[1]?.trim() || era.name}
                    </div>
                    <div
                      className="text-[9px] lg:text-[10px] text-[var(--text-muted)] truncate"
                      style={{ fontFamily: era.fonts.secondary }}
                    >
                      {era.era}
                    </div>
                    {/* Design Token Indicator */}
                    <div className="flex gap-1 mt-1">
                      {gridSize && (
                        <span
                          className="text-[7px] px-1 py-0.5 rounded-sm"
                          style={{
                            backgroundColor: `${era.colors.text}15`,
                            color: era.colors.text,
                          }}
                        >
                          {gridSize}px
                        </span>
                      )}
                      <span
                        className="text-[7px] px-1 py-0.5"
                        style={{
                          backgroundColor: `${era.colors.text}15`,
                          color: era.colors.text,
                          borderRadius: `${Math.min(borderRadius, 4)}px`,
                        }}
                      >
                        r{borderRadius}
                      </span>
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
