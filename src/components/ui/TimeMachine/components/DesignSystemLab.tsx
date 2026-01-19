'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { ThemeConfig } from '@/data/portfolio-data';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface DesignSystemLabProps {
    era: ThemeConfig;
    onOpenLabEditor: () => void;
}

// ═══════════════════════════════════════════════════════════════════════════════
// COLOR SWATCH COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

function ColorSwatch({
    color,
    label,
    isSmall = false
}: {
    color: string;
    label: string;
    isSmall?: boolean;
}) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(color);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    return (
        <motion.button
            onClick={handleCopy}
            className={cn(
                'relative group flex flex-col items-center transition-all',
                isSmall ? 'gap-1' : 'gap-2'
            )}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
        >
            <div
                className={cn(
                    'border-2 border-[var(--border-color)] transition-all',
                    'hover:border-[var(--accent-color)] hover:shadow-lg',
                    isSmall ? 'w-8 h-8' : 'w-12 h-12 lg:w-14 lg:h-14'
                )}
                style={{ backgroundColor: color }}
            />
            <span className={cn(
                'font-mono uppercase',
                isSmall ? 'text-[7px]' : 'text-[8px] lg:text-[9px]'
            )} style={{ color: 'var(--text-muted)' }}>
                {label}
            </span>
            <span className={cn(
                'font-mono',
                isSmall ? 'text-[6px]' : 'text-[7px] lg:text-[8px]'
            )} style={{ color: 'var(--text-main)' }}>
                {color.toUpperCase()}
            </span>

            {/* Copy indicator */}
            <AnimatePresence>
                {copied && (
                    <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="absolute -top-6 px-2 py-1 text-[8px] font-mono bg-[var(--accent-color)] text-[var(--bg-main)]"
                    >
                        COPIED!
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.button>
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
// DECORATIVE EYE ICON
// ═══════════════════════════════════════════════════════════════════════════════

function SmallEyeIcon({ accentColor }: { accentColor: string }) {
    return (
        <motion.div
            className="absolute top-2 right-2 opacity-40"
            animate={{
                opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 3, repeat: Infinity }}
        >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="8" stroke={accentColor} strokeWidth="1.5" fill="none" />
                <circle cx="12" cy="12" r="3" fill={accentColor} />
                <circle cx="13" cy="11" r="1" fill="white" opacity="0.6" />
            </svg>
        </motion.div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN DESIGN SYSTEM LAB COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export function DesignSystemLab({ era, onOpenLabEditor }: DesignSystemLabProps) {
    const colors = era.colors;
    const fonts = era.fonts;

    const previewBg = colors?.background ?? '#000000';
    const previewText = colors?.text ?? '#ffffff';
    const previewAccent = colors?.accent ?? colors?.primary ?? '#00ff88';

    return (
        <div className="flex flex-col h-full">
            {/* Lab Container with Era Theme */}
            <div
                className="flex-1 relative overflow-hidden border-2 border-[var(--border-color)]"
                style={{ backgroundColor: previewBg }}
            >
                {/* Decorative Eye Icon */}
                <SmallEyeIcon accentColor={previewAccent} />

                {/* Grid Pattern Overlay */}
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        opacity: 0.08,
                        backgroundImage: `linear-gradient(${previewText} 1px, transparent 1px), linear-gradient(90deg, ${previewText} 1px, transparent 1px)`,
                        backgroundSize: '16px 16px',
                    }}
                />

                <div className="relative h-full flex flex-col p-3 lg:p-4 gap-4 overflow-y-auto">

                    {/* ═══ SECTION: COLOR PALETTE ═══ */}
                    <div>
                        <div
                            className="font-mono text-[9px] lg:text-[10px] uppercase mb-2 flex items-center gap-2"
                            style={{ color: previewAccent }}
                        >
                            <span>◆</span> COLOR PALETTE
                        </div>
                        <div className="flex flex-wrap gap-3 lg:gap-4">
                            <ColorSwatch color={colors.primary} label="Primary" />
                            <ColorSwatch color={colors.secondary} label="Secondary" />
                            <ColorSwatch color={colors.accent} label="Accent" />
                            <ColorSwatch color={colors.background} label="Bg" />
                            <ColorSwatch color={colors.text} label="Text" />
                        </div>
                    </div>

                    {/* ═══ SECTION: TYPOGRAPHY ═══ */}
                    <div>
                        <div
                            className="font-mono text-[9px] lg:text-[10px] uppercase mb-2 flex items-center gap-2"
                            style={{ color: previewAccent }}
                        >
                            <span>◆</span> TYPOGRAPHY
                        </div>
                        <div
                            className="p-3 border border-opacity-20"
                            style={{
                                borderColor: previewText,
                                backgroundColor: `${previewBg}CC`
                            }}
                        >
                            <h3
                                className="text-lg lg:text-xl font-bold mb-1"
                                style={{ color: previewText, fontFamily: fonts.primary }}
                            >
                                Heading Text
                            </h3>
                            <p
                                className="text-xs lg:text-sm mb-2 opacity-80"
                                style={{ color: previewText, fontFamily: fonts.secondary }}
                            >
                                Body text in the secondary font. This showcases how readable content appears.
                            </p>
                            <span
                                className="text-[10px] lg:text-xs font-bold uppercase"
                                style={{ color: previewAccent, fontFamily: fonts.accent }}
                            >
                                Accent Label
                            </span>
                        </div>
                        <div className="flex gap-2 mt-2 flex-wrap">
                            {[fonts.primary, fonts.secondary, fonts.accent].map((font, i) => (
                                <span
                                    key={i}
                                    className="text-[8px] px-2 py-1 border"
                                    style={{
                                        color: previewText,
                                        borderColor: `${previewText}33`,
                                        fontFamily: font
                                    }}
                                >
                                    {font.split(',')[0].replace(/"/g, '')}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* ═══ SECTION: COMPONENT SHOWCASE ═══ */}
                    <div>
                        <div
                            className="font-mono text-[9px] lg:text-[10px] uppercase mb-2 flex items-center gap-2"
                            style={{ color: previewAccent }}
                        >
                            <span>◆</span> COMPONENTS
                        </div>
                        <div className="flex flex-wrap gap-2 lg:gap-3">
                            {/* Primary Button */}
                            <button
                                className="px-3 lg:px-4 py-1.5 lg:py-2 text-[10px] lg:text-xs font-bold uppercase border-2 transition-all"
                                style={{
                                    backgroundColor: previewAccent,
                                    borderColor: previewAccent,
                                    color: previewBg,
                                    fontFamily: fonts.accent,
                                }}
                            >
                                Primary
                            </button>

                            {/* Secondary Button */}
                            <button
                                className="px-3 lg:px-4 py-1.5 lg:py-2 text-[10px] lg:text-xs font-bold uppercase border-2 transition-all"
                                style={{
                                    backgroundColor: 'transparent',
                                    borderColor: previewText,
                                    color: previewText,
                                    fontFamily: fonts.accent,
                                }}
                            >
                                Secondary
                            </button>

                            {/* Badge */}
                            <span
                                className="px-2 py-1 text-[8px] lg:text-[9px] font-bold uppercase"
                                style={{
                                    backgroundColor: colors.primary,
                                    color: previewBg,
                                    fontFamily: fonts.accent,
                                }}
                            >
                                Badge
                            </span>

                            {/* Tag */}
                            <span
                                className="px-2 py-1 text-[8px] lg:text-[9px] border"
                                style={{
                                    borderColor: previewText,
                                    color: previewText,
                                    fontFamily: fonts.secondary,
                                }}
                            >
                                #tag
                            </span>
                        </div>

                        {/* Mini Card */}
                        <div
                            className="mt-3 p-3 border-2"
                            style={{
                                borderColor: `${previewText}33`,
                                backgroundColor: `${previewText}08`,
                            }}
                        >
                            <div
                                className="text-xs font-bold mb-1"
                                style={{ color: previewText, fontFamily: fonts.primary }}
                            >
                                Card Title
                            </div>
                            <div
                                className="text-[10px] opacity-70"
                                style={{ color: previewText, fontFamily: fonts.secondary }}
                            >
                                A sample card component in this era's style.
                            </div>
                        </div>
                    </div>

                    {/* ═══ SECTION: STYLE INFO ═══ */}
                    <div className="mt-auto pt-2 border-t" style={{ borderColor: `${previewText}22` }}>
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <span
                                    className="px-2 py-0.5 text-[8px] font-mono uppercase"
                                    style={{
                                        backgroundColor: previewAccent,
                                        color: previewBg
                                    }}
                                >
                                    {era.style}
                                </span>
                                <span
                                    className="text-[8px] font-mono"
                                    style={{ color: `${previewText}88` }}
                                >
                                    {era.era}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Open Lab Editor Button */}
            <motion.button
                onClick={onOpenLabEditor}
                className={cn(
                    'w-full py-2 lg:py-3 font-mono text-[10px] lg:text-xs font-bold uppercase',
                    'border-2 border-dashed border-[var(--accent-color)]',
                    'text-[var(--accent-color)] hover:bg-[var(--accent-color)] hover:text-[var(--bg-main)]',
                    'transition-all flex items-center justify-center gap-2'
                )}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
            >
                <span>🧪</span> OPEN DESIGN LAB
            </motion.button>
        </div>
    );
}

export default DesignSystemLab;
