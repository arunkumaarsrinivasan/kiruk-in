'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import type { ThemeConfig } from '@/data/portfolio-data';

interface HorizontalTimelineProps {
    eras: ThemeConfig[];
    selectedEraId: string | null;
    currentEraId: string;
    onSelectEra: (eraId: string) => void;
}

export function HorizontalTimeline({
    eras,
    selectedEraId,
    currentEraId,
    onSelectEra,
}: HorizontalTimelineProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const selectedIndex = selectedEraId
        ? eras.findIndex((e) => e.id === selectedEraId)
        : eras.findIndex((e) => e.id === currentEraId);

    // Auto-scroll to selected era
    useEffect(() => {
        if (!scrollRef.current || !selectedEraId) return;
        const el = scrollRef.current.querySelector(`[data-era-id="${selectedEraId}"]`);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }
    }, [selectedEraId]);

    return (
        <div className="flex-shrink-0 border-t-2 border-[var(--border-color)] bg-[var(--bg-card)]">
            {/* Selected era info strip — top */}
            <div className="flex items-center justify-between px-6 md:px-10 pt-3 pb-1">
                <span className="font-mono text-xs md:text-sm text-[var(--text-muted)] tracking-wide">
                    {selectedIndex + 1} / {eras.length} ERAS
                </span>
                {selectedEraId && (
                    <motion.span
                        key={selectedEraId}
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="font-mono text-sm md:text-base font-bold text-[var(--accent-color)] tracking-wide"
                    >
                        {eras[selectedIndex]?.id}: {eras[selectedIndex]?.name || ''}
                    </motion.span>
                )}
                <span className="font-mono text-xs md:text-sm text-[var(--text-muted)] tracking-wide">
                    1970 &rarr; 2025
                </span>
            </div>

            {/* Timeline line + markers */}
            <div
                ref={scrollRef}
                className="overflow-x-auto scrollbar-hide px-6 md:px-10 pt-3 pb-2"
            >
                <div className="flex items-center min-w-max">
                    {eras.map((era, index) => {
                        const isSelected = era.id === selectedEraId;
                        const isCurrent = era.id === currentEraId;
                        const isPast = index <= selectedIndex;

                        return (
                            <div
                                key={era.id}
                                className="flex items-center"
                                data-era-id={era.id}
                            >
                                {/* Connecting line segment */}
                                {index > 0 && (
                                    <div
                                        className="transition-colors duration-300"
                                        style={{
                                            width: 'clamp(28px, 4vw, 56px)',
                                            height: isPast ? '3px' : '2px',
                                            backgroundColor: isPast
                                                ? 'var(--accent-color)'
                                                : 'var(--border-color)',
                                        }}
                                    />
                                )}

                                {/* Era marker — column with dot + year label */}
                                <div className="flex flex-col items-center gap-1.5">
                                    <motion.button
                                        onClick={() => onSelectEra(era.id)}
                                        className="relative flex-shrink-0 rounded-full transition-all flex items-center justify-center"
                                        style={{
                                            width: isSelected ? 32 : isCurrent ? 24 : 18,
                                            height: isSelected ? 32 : isCurrent ? 24 : 18,
                                            backgroundColor: isSelected || isCurrent
                                                ? era.colors.accent
                                                : isPast
                                                    ? `${era.colors.accent}AA`
                                                    : `${era.colors.accent}55`,
                                            boxShadow: isSelected
                                                ? `0 0 16px ${era.colors.accent}90, 0 0 32px ${era.colors.accent}50`
                                                : isCurrent
                                                    ? `0 0 8px ${era.colors.accent}60`
                                                    : 'none',
                                            border: isCurrent && !isSelected
                                                ? '3px solid var(--text-main)'
                                                : isSelected
                                                    ? `3px solid ${era.colors.accent}`
                                                    : '2px solid transparent',
                                        }}
                                        whileHover={{ scale: 1.3 }}
                                        whileTap={{ scale: 0.9 }}
                                        aria-label={`${era.id}: ${era.name}`}
                                    >
                                        {/* Selected marker shows year */}
                                        {isSelected && (
                                            <span
                                                className="text-[9px] md:text-[10px] font-mono font-black"
                                                style={{ color: era.colors.background }}
                                            >
                                                {era.id.slice(-2)}
                                            </span>
                                        )}
                                    </motion.button>

                                    {/* Always-visible year label */}
                                    <span
                                        className="font-mono whitespace-nowrap transition-all duration-200"
                                        style={{
                                            fontSize: isSelected ? '11px' : '10px',
                                            fontWeight: isSelected || isCurrent ? 700 : 400,
                                            color: isSelected
                                                ? era.colors.accent
                                                : isCurrent
                                                    ? 'var(--text-main)'
                                                    : 'var(--text-muted)',
                                        }}
                                    >
                                        {era.id}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
