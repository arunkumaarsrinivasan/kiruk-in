'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { ThemeConfig } from '@/data/portfolio-data';
import { EraShaderCanvas } from './EraShaderCanvas';

// ═══════════════════════════════════════════════════════════════════════════════
// SHADOW STYLE GENERATOR (moved from DesignSystemLab)
// ═══════════════════════════════════════════════════════════════════════════════

function getShadowStyle(
    shadowType: ThemeConfig['designTokens']['shadowStyle'],
    intensity: number,
    color: string,
): React.CSSProperties {
    const i = intensity / 100;
    switch (shadowType) {
        case 'hard':
            return { boxShadow: `${4 * i}px ${4 * i}px 0px 0px ${color}` };
        case 'soft':
            return { boxShadow: `0 ${4 * i}px ${16 * i}px rgba(0,0,0,${0.2 * i})` };
        case 'glow':
            return { boxShadow: `0 0 ${20 * i}px ${color}40, 0 0 ${40 * i}px ${color}20` };
        case 'glass':
            return {
                boxShadow: `0 ${8 * i}px ${32 * i}px rgba(0,0,0,${0.3 * i}), inset 0 1px 0 rgba(255,255,255,0.1)`,
                backdropFilter: 'blur(16px)',
            };
        case 'neumorphic':
            return {
                boxShadow: `${6 * i}px ${6 * i}px ${12 * i}px rgba(0,0,0,0.3), -${6 * i}px -${6 * i}px ${12 * i}px rgba(255,255,255,0.05)`
            };
        case 'inset':
            return { boxShadow: `inset 0 ${2 * i}px ${8 * i}px rgba(0,0,0,${0.3 * i})` };
        default:
            return {};
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ERA STORY CARD — Center narrative card
// ═══════════════════════════════════════════════════════════════════════════════

interface EraStoryCardProps {
    era: ThemeConfig | null;
    currentEraId: string;
    onApply: () => void;
}

export function EraStoryCard({ era, currentEraId, onApply }: EraStoryCardProps) {
    const [displayedText, setDisplayedText] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    // Typewriter effect — resets on era change
    useEffect(() => {
        if (!era) { setDisplayedText(''); return; }
        setIsTyping(true);
        setDisplayedText('');
        let index = 0;
        const text = era.description;
        const typeInterval = setInterval(() => {
            if (index < text.length) {
                setDisplayedText(text.slice(0, index + 1));
                index++;
            } else {
                setIsTyping(false);
                clearInterval(typeInterval);
            }
        }, 22);
        return () => clearInterval(typeInterval);
    }, [era?.id, era?.description]);

    if (!era) {
        return (
            <div className="flex items-center justify-center h-[400px] border-2 border-dashed border-[var(--border-color)]">
                <span className="font-mono text-sm text-[var(--text-muted)]">Select an era to begin</span>
            </div>
        );
    }

    const isCurrentEra = era.id === currentEraId;
    const tokens = era.designTokens;
    const borderRadius = Math.min(tokens?.borderRadius ?? 0, 16);
    const shadow = getShadowStyle(tokens?.shadowStyle ?? 'none', tokens?.shadowIntensity ?? 50, era.colors.accent);
    const colorKeys = ['primary', 'secondary', 'accent', 'background', 'text'] as const;

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={era.id}
                initial={{ opacity: 0, y: 20, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.97 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="relative overflow-hidden border-2"
                style={{
                    borderColor: era.colors.accent,
                    borderRadius: `${borderRadius}px`,
                    backgroundColor: era.colors.background,
                    ...shadow,
                }}
            >
                {/* Era shader effects as background */}
                <div className="absolute inset-0 opacity-40 pointer-events-none z-0">
                    <EraShaderCanvas era={era} />
                </div>

                {/* Grid overlay for eras that have grids */}
                {tokens?.gridSize && tokens.gridSize > 0 && (
                    <div
                        className="absolute inset-0 pointer-events-none z-0"
                        style={{
                            opacity: (tokens.gridOpacity ?? 0) * 0.5,
                            backgroundImage: `linear-gradient(${era.colors.text} 1px, transparent 1px), linear-gradient(90deg, ${era.colors.text} 1px, transparent 1px)`,
                            backgroundSize: `${tokens.gridSize}px ${tokens.gridSize}px`,
                        }}
                    />
                )}

                {/* Card content */}
                <div className="relative z-10 p-5 md:p-6 max-h-[65vh] overflow-y-auto scrollbar-hide">

                    {/* Header: Year + Era Period */}
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <div
                                className="text-4xl md:text-5xl font-black tracking-tight"
                                style={{ color: era.colors.accent, fontFamily: era.fonts.primary }}
                            >
                                {era.id}
                            </div>
                            <div
                                className="text-[10px] font-mono uppercase tracking-[0.15em] mt-1"
                                style={{ color: `${era.colors.text}99` }}
                            >
                                {era.era}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {isCurrentEra && (
                                <span
                                    className="px-2 py-0.5 text-[8px] font-mono font-bold uppercase"
                                    style={{ backgroundColor: era.colors.accent, color: era.colors.background }}
                                >
                                    ACTIVE
                                </span>
                            )}
                            <span
                                className="px-2 py-0.5 text-[8px] font-mono uppercase border"
                                style={{ borderColor: `${era.colors.text}33`, color: `${era.colors.text}88` }}
                            >
                                {era.style}
                            </span>
                        </div>
                    </div>

                    {/* Era Name */}
                    <h2
                        className="text-xl md:text-2xl font-bold mb-4"
                        style={{
                            color: era.colors.text,
                            fontFamily: era.fonts.primary,
                            letterSpacing: `${(tokens?.letterSpacing ?? 0) * 0.01}em`,
                        }}
                    >
                        {era.name.split(':')[1]?.trim() || era.name}
                    </h2>

                    {/* Description with typewriter effect */}
                    <div className="mb-5">
                        <p
                            className="text-sm md:text-base leading-relaxed"
                            style={{
                                color: era.colors.text,
                                fontFamily: era.fonts.secondary,
                                lineHeight: tokens?.lineHeight ?? 1.6,
                            }}
                        >
                            {displayedText}
                            {isTyping && (
                                <motion.span
                                    className="inline-block ml-0.5"
                                    animate={{ opacity: [1, 0] }}
                                    transition={{ duration: 0.6, repeat: Infinity }}
                                    style={{ color: era.colors.accent }}
                                >
                                    |
                                </motion.span>
                            )}
                        </p>
                    </div>

                    {/* Design Lesson — highlighted quote box */}
                    {era.lesson && (
                        <div
                            className="mb-4 p-3 border-l-4"
                            style={{
                                borderLeftColor: era.colors.accent,
                                backgroundColor: `${era.colors.accent}0A`,
                                borderRadius: `0 ${Math.min(borderRadius, 4)}px ${Math.min(borderRadius, 4)}px 0`,
                            }}
                        >
                            <div
                                className="text-[8px] font-mono uppercase tracking-[0.15em] mb-1"
                                style={{ color: era.colors.accent }}
                            >
                                Design Lesson
                            </div>
                            <p
                                className="text-xs md:text-sm italic leading-relaxed"
                                style={{ color: era.colors.text, fontFamily: era.fonts.secondary }}
                            >
                                &ldquo;{era.lesson}&rdquo;
                            </p>
                        </div>
                    )}

                    {/* Heritage / Legacy */}
                    {era.heritage && (
                        <div className="mb-4">
                            <div
                                className="text-[8px] font-mono uppercase tracking-[0.15em] mb-1"
                                style={{ color: era.colors.accent }}
                            >
                                Legacy
                            </div>
                            <p
                                className="text-[11px] md:text-xs leading-relaxed"
                                style={{ color: `${era.colors.text}BB`, fontFamily: era.fonts.secondary }}
                            >
                                {era.heritage}
                            </p>
                        </div>
                    )}

                    {/* Compact Color Palette */}
                    <div className="flex items-center gap-3 mb-4">
                        <span
                            className="text-[8px] font-mono uppercase tracking-[0.1em]"
                            style={{ color: `${era.colors.text}66` }}
                        >
                            Palette
                        </span>
                        <div className="flex items-center gap-1.5">
                            {colorKeys.map((key) => (
                                <div
                                    key={key}
                                    className="w-5 h-5 border flex-shrink-0"
                                    style={{
                                        backgroundColor: era.colors[key],
                                        borderColor: `${era.colors.text}22`,
                                        borderRadius: `${Math.min(tokens?.borderRadius ?? 0, 4)}px`,
                                    }}
                                    title={`${key}: ${era.colors[key]}`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Key Elements as tags */}
                    {era.keyElements && era.keyElements.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-5">
                            {era.keyElements.map((element, index) => (
                                <span
                                    key={index}
                                    className="px-2 py-0.5 text-[8px] md:text-[9px] font-mono border"
                                    style={{
                                        borderColor: `${era.colors.text}22`,
                                        color: `${era.colors.text}CC`,
                                        borderRadius: `${Math.min(tokens?.borderRadius ?? 0, 4)}px`,
                                    }}
                                >
                                    {element}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Arun's statement block */}
                    <div
                        className="mb-5 p-3 border text-center"
                        style={{
                            borderColor: `${era.colors.accent}30`,
                            borderRadius: `${Math.min(borderRadius, 8)}px`,
                            backgroundColor: `${era.colors.accent}08`,
                        }}
                    >
                        <p
                            className="font-mono text-[11px] md:text-xs font-bold"
                            style={{ color: era.colors.text }}
                        >
                            &ldquo;I design &amp; develop for this era.&rdquo;
                        </p>
                        <p
                            className="font-mono text-[9px] md:text-[10px] mt-1 tracking-[0.05em]"
                            style={{ color: era.colors.accent }}
                        >
                            Whatever the interface. Anytime. Forever.
                        </p>
                    </div>

                    {/* Apply Button */}
                    {!isCurrentEra ? (
                        <motion.button
                            onClick={onApply}
                            className={cn(
                                'w-full py-2.5 md:py-3 px-4 font-mono text-[10px] md:text-xs font-bold uppercase',
                                'border-2 transition-all',
                                'hover:brightness-110',
                            )}
                            style={{
                                backgroundColor: era.colors.accent,
                                borderColor: era.colors.accent,
                                color: era.colors.background,
                                borderRadius: `${borderRadius}px`,
                            }}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                        >
                            Apply &ldquo;{era.name}&rdquo; to My Site &rarr;
                        </motion.button>
                    ) : (
                        <div
                            className="w-full py-2 px-4 font-mono text-[10px] text-center border-2 border-dashed"
                            style={{
                                borderColor: `${era.colors.text}33`,
                                color: `${era.colors.text}88`,
                                borderRadius: `${borderRadius}px`,
                            }}
                        >
                            This era is currently active on your site
                        </div>
                    )}
                </div>
            </motion.div>
        </AnimatePresence>
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ERA PREVIEW CARD — Side cards for previous/next
// ═══════════════════════════════════════════════════════════════════════════════

interface EraPreviewCardProps {
    era: ThemeConfig | null;
    position: 'previous' | 'next';
    onClick: () => void;
}

export function EraPreviewCard({ era, position, onClick }: EraPreviewCardProps) {
    if (!era) {
        return (
            <div className="h-[400px] flex items-center justify-center opacity-20 border border-dashed border-[var(--border-color)] rounded-sm">
                <span className="font-mono text-[10px] text-[var(--text-muted)] text-center px-4">
                    {position === 'previous' ? 'Beginning of time' : 'End of timeline'}
                </span>
            </div>
        );
    }

    const tokens = era.designTokens;
    const borderRadius = Math.min(tokens?.borderRadius ?? 0, 12);

    return (
        <motion.div
            className="cursor-pointer opacity-40 hover:opacity-70 transition-opacity duration-300"
            onClick={onClick}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
        >
            <div
                className="relative overflow-hidden p-4 border-2 h-[400px] flex flex-col"
                style={{
                    borderColor: `${era.colors.accent}66`,
                    borderRadius: `${borderRadius}px`,
                    backgroundColor: era.colors.background,
                }}
            >
                {/* Grid overlay */}
                {tokens?.gridSize && tokens.gridSize > 0 && (
                    <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                            opacity: (tokens.gridOpacity ?? 0) * 0.3,
                            backgroundImage: `linear-gradient(${era.colors.text} 1px, transparent 1px), linear-gradient(90deg, ${era.colors.text} 1px, transparent 1px)`,
                            backgroundSize: `${tokens.gridSize}px ${tokens.gridSize}px`,
                        }}
                    />
                )}

                <div className="relative z-10 flex flex-col h-full">
                    {/* Year */}
                    <div
                        className="text-3xl font-bold tracking-tight"
                        style={{ color: era.colors.accent, fontFamily: era.fonts.primary }}
                    >
                        {era.id}
                    </div>

                    {/* Era Name */}
                    <div
                        className="text-xs font-mono font-bold mt-2 uppercase"
                        style={{ color: era.colors.text, fontFamily: era.fonts.primary }}
                    >
                        {era.name.split(':')[1]?.trim() || era.name}
                    </div>

                    {/* Era Period */}
                    <div
                        className="text-[9px] font-mono mt-0.5"
                        style={{ color: `${era.colors.text}66` }}
                    >
                        {era.era}
                    </div>

                    {/* Mini description */}
                    <p
                        className="text-[10px] mt-3 leading-relaxed line-clamp-3"
                        style={{ color: `${era.colors.text}88`, fontFamily: era.fonts.secondary }}
                    >
                        {era.description}
                    </p>

                    {/* Mini palette */}
                    <div className="flex gap-1 mt-3">
                        {(['primary', 'secondary', 'accent'] as const).map((key) => (
                            <div
                                key={key}
                                className="w-4 h-4"
                                style={{
                                    backgroundColor: era.colors[key],
                                    borderRadius: `${Math.min(tokens?.borderRadius ?? 0, 2)}px`,
                                }}
                            />
                        ))}
                    </div>

                    {/* Navigation hint */}
                    <div className="mt-auto pt-4 text-center">
                        <span
                            className="font-mono text-[9px] uppercase tracking-wider"
                            style={{ color: era.colors.accent }}
                        >
                            {position === 'previous' ? '\u2190 PREVIOUS' : 'NEXT \u2192'}
                        </span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
