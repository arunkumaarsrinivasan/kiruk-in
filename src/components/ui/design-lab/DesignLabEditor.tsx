'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { ThemeConfig } from '@/data/portfolio-data';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface LabDesignTokens {
    colors: {
        primary: string;
        secondary: string;
        accent: string;
        background: string;
        text: string;
    };
    fonts: {
        primary: string;
        secondary: string;
        accent: string;
    };
    borderRadius: number;
    shadowEnabled: boolean;
    shadowIntensity: number;
    gridSize: number;
    gridOpacity: number;
    letterSpacing: number;
    lineHeight: number;
}

interface DesignLabEditorProps {
    era: ThemeConfig;
    onApply: (tokens: LabDesignTokens) => void;
    onClose: () => void;
}

// Font presets - More comprehensive list
const FONT_PRESETS = [
    { value: 'monospace', label: 'Mono' },
    { value: '"Space Grotesk", sans-serif', label: 'Space Grotesk' },
    { value: '"Courier New", monospace', label: 'Courier' },
    { value: 'system-ui, sans-serif', label: 'System UI' },
    { value: '"Inter", sans-serif', label: 'Inter' },
    { value: '"Roboto", sans-serif', label: 'Roboto' },
    { value: '"Roboto Mono", monospace', label: 'Roboto Mono' },
    { value: '"JetBrains Mono", monospace', label: 'JetBrains' },
    { value: '"Comic Sans MS", cursive', label: 'Comic Sans' },
    { value: '"Times New Roman", serif', label: 'Times' },
    { value: '"Georgia", serif', label: 'Georgia' },
    { value: '"Helvetica", sans-serif', label: 'Helvetica' },
    { value: '"Fira Code", monospace', label: 'Fira Code' },
    { value: '"Source Code Pro", monospace', label: 'Source Code' },
];

// Contrast checker helper
function getContrastRatio(hex1: string, hex2: string): number {
    const getLuminance = (hex: string) => {
        const rgb = parseInt(hex.slice(1), 16);
        const r = (rgb >> 16 & 0xff) / 255;
        const g = (rgb >> 8 & 0xff) / 255;
        const b = (rgb & 0xff) / 255;
        const [rL, gL, bL] = [r, g, b].map(c =>
            c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
        );
        return 0.2126 * rL + 0.7152 * gL + 0.0722 * bL;
    };
    const l1 = getLuminance(hex1);
    const l2 = getLuminance(hex2);
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

// ═══════════════════════════════════════════════════════════════════════════════
// COLOR PICKER FIELD
// ═══════════════════════════════════════════════════════════════════════════════

function ColorField({
    label,
    value,
    onChange
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
}) {
    return (
        <div className="flex items-center justify-between gap-2">
            <label className="text-[9px] font-mono uppercase text-[var(--text-muted)]">
                {label}
            </label>
            <div className="flex items-center gap-1">
                <input
                    type="color"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-6 h-6 cursor-pointer border-2 border-[var(--border-color)] bg-transparent"
                />
                <input
                    type="text"
                    value={value.toUpperCase()}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-16 px-1 py-0.5 text-[8px] font-mono bg-[var(--bg-main)] border border-[var(--border-color)] text-[var(--text-main)]"
                />
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
// FONT SELECTOR FIELD
// ═══════════════════════════════════════════════════════════════════════════════

function FontField({
    label,
    value,
    onChange
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
}) {
    return (
        <div className="flex items-center justify-between gap-2">
            <label className="text-[9px] font-mono uppercase text-[var(--text-muted)]">
                {label}
            </label>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="flex-1 max-w-[120px] px-1 py-0.5 text-[9px] font-mono bg-[var(--bg-main)] border border-[var(--border-color)] text-[var(--text-main)]"
                style={{ fontFamily: value }}
            >
                {FONT_PRESETS.map((font) => (
                    <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                        {font.label}
                    </option>
                ))}
            </select>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDER FIELD
// ═══════════════════════════════════════════════════════════════════════════════

function SliderField({
    label,
    value,
    min = 0,
    max = 100,
    onChange
}: {
    label: string;
    value: number;
    min?: number;
    max?: number;
    onChange: (v: number) => void;
}) {
    return (
        <div className="flex items-center justify-between gap-2">
            <label className="text-[9px] font-mono uppercase text-[var(--text-muted)]">
                {label}
            </label>
            <div className="flex items-center gap-2 flex-1 max-w-[140px]">
                <input
                    type="range"
                    min={min}
                    max={max}
                    value={value}
                    onChange={(e) => onChange(Number(e.target.value))}
                    className="flex-1 h-1 bg-[var(--border-color)] accent-[var(--accent-color)]"
                />
                <span className="text-[8px] font-mono text-[var(--text-main)] w-8 text-right">
                    {value}
                </span>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN DESIGN LAB EDITOR COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export function DesignLabEditor({ era, onApply, onClose }: DesignLabEditorProps) {
    // Initialize tokens from era
    const [tokens, setTokens] = useState<LabDesignTokens>({
        colors: { ...era.colors },
        fonts: { ...era.fonts },
        borderRadius: 0,
        shadowEnabled: true,
        shadowIntensity: 50,
        gridSize: 20,
        gridOpacity: 30,
        letterSpacing: 0,
        lineHeight: 150,
    });

    const [presetName, setPresetName] = useState('');
    const [savedPresets, setSavedPresets] = useState<Array<{ name: string; tokens: LabDesignTokens }>>([]);

    // Load saved presets
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const saved = localStorage.getItem('kiruk-design-lab-presets');
        if (saved) {
            try {
                setSavedPresets(JSON.parse(saved));
            } catch (e) {
                console.warn('Failed to load presets:', e);
            }
        }
    }, []);

    // Update color
    const updateColor = useCallback((key: keyof LabDesignTokens['colors'], value: string) => {
        setTokens(prev => ({
            ...prev,
            colors: { ...prev.colors, [key]: value }
        }));
    }, []);

    // Update font
    const updateFont = useCallback((key: keyof LabDesignTokens['fonts'], value: string) => {
        setTokens(prev => ({
            ...prev,
            fonts: { ...prev.fonts, [key]: value }
        }));
    }, []);

    // Reset to era defaults
    const handleReset = useCallback(() => {
        setTokens({
            colors: { ...era.colors },
            fonts: { ...era.fonts },
            borderRadius: 0,
            shadowEnabled: true,
            shadowIntensity: 50,
            gridSize: 20,
            gridOpacity: 30,
            letterSpacing: 0,
            lineHeight: 150,
        });
    }, [era]);

    // Save preset
    const handleSavePreset = useCallback(() => {
        if (!presetName.trim() || typeof window === 'undefined') return;
        const newPresets = [...savedPresets, { name: presetName, tokens }];
        setSavedPresets(newPresets);
        localStorage.setItem('kiruk-design-lab-presets', JSON.stringify(newPresets));
        setPresetName('');
    }, [presetName, tokens, savedPresets]);

    // Load preset
    const handleLoadPreset = useCallback((preset: { name: string; tokens: LabDesignTokens }) => {
        setTokens(preset.tokens);
    }, []);

    // Delete preset
    const handleDeletePreset = useCallback((index: number) => {
        const newPresets = savedPresets.filter((_, i) => i !== index);
        setSavedPresets(newPresets);
        if (typeof window !== 'undefined') {
            localStorage.setItem('kiruk-design-lab-presets', JSON.stringify(newPresets));
        }
    }, [savedPresets]);

    // Generate shadow style based on settings
    const shadowStyle = tokens.shadowEnabled
        ? `${Math.round(tokens.shadowIntensity / 10)}px ${Math.round(tokens.shadowIntensity / 10)}px 0px 0px ${tokens.colors.text}33`
        : 'none';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="flex flex-col h-full"
        >
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b-2 border-[var(--border-color)] bg-[var(--accent-color)]">
                <h3 className="font-mono text-xs font-bold uppercase text-[var(--bg-main)]">
                    🧪 DESIGN LAB
                </h3>
                <button
                    onClick={onClose}
                    className="font-mono text-xs font-bold text-[var(--bg-main)] hover:opacity-70"
                >
                    ✕
                </button>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                {/* Left: Controls */}
                <div className="w-full lg:w-1/2 p-3 space-y-4 overflow-y-auto border-b-2 lg:border-b-0 lg:border-r-2 border-[var(--border-color)]">

                    {/* Colors Section */}
                    <div>
                        <div className="font-mono text-[9px] uppercase text-[var(--accent-color)] mb-2 flex items-center gap-1">
                            <span>◆</span> COLORS
                        </div>
                        <div className="space-y-2 bg-[var(--bg-card)] p-2 border border-[var(--border-color)]">
                            <ColorField label="Primary" value={tokens.colors.primary} onChange={(v) => updateColor('primary', v)} />
                            <ColorField label="Secondary" value={tokens.colors.secondary} onChange={(v) => updateColor('secondary', v)} />
                            <ColorField label="Accent" value={tokens.colors.accent} onChange={(v) => updateColor('accent', v)} />
                            <ColorField label="Background" value={tokens.colors.background} onChange={(v) => updateColor('background', v)} />
                            <ColorField label="Text" value={tokens.colors.text} onChange={(v) => updateColor('text', v)} />
                        </div>
                    </div>

                    {/* Typography Section */}
                    <div>
                        <div className="font-mono text-[9px] uppercase text-[var(--accent-color)] mb-2 flex items-center gap-1">
                            <span>◆</span> TYPOGRAPHY
                        </div>
                        <div className="space-y-2 bg-[var(--bg-card)] p-2 border border-[var(--border-color)]">
                            <FontField label="Primary" value={tokens.fonts.primary} onChange={(v) => updateFont('primary', v)} />
                            <FontField label="Secondary" value={tokens.fonts.secondary} onChange={(v) => updateFont('secondary', v)} />
                            <FontField label="Accent" value={tokens.fonts.accent} onChange={(v) => updateFont('accent', v)} />
                        </div>
                    </div>

                    {/* Effects Section */}
                    <div>
                        <div className="font-mono text-[9px] uppercase text-[var(--accent-color)] mb-2 flex items-center gap-1">
                            <span>◆</span> EFFECTS
                        </div>
                        <div className="space-y-2 bg-[var(--bg-card)] p-2 border border-[var(--border-color)]">
                            <SliderField
                                label="Border Radius"
                                value={tokens.borderRadius}
                                max={24}
                                onChange={(v) => setTokens(prev => ({ ...prev, borderRadius: v }))}
                            />
                            <div className="flex items-center justify-between gap-2">
                                <label className="text-[9px] font-mono uppercase text-[var(--text-muted)]">Shadow</label>
                                <button
                                    onClick={() => setTokens(prev => ({ ...prev, shadowEnabled: !prev.shadowEnabled }))}
                                    className={cn(
                                        'px-2 py-0.5 text-[8px] font-mono border transition-all',
                                        tokens.shadowEnabled
                                            ? 'bg-[var(--accent-color)] text-[var(--bg-main)] border-[var(--accent-color)]'
                                            : 'border-[var(--border-color)] text-[var(--text-muted)]'
                                    )}
                                >
                                    {tokens.shadowEnabled ? 'ON' : 'OFF'}
                                </button>
                            </div>
                            {tokens.shadowEnabled && (
                                <SliderField
                                    label="Shadow Size"
                                    value={tokens.shadowIntensity}
                                    onChange={(v) => setTokens(prev => ({ ...prev, shadowIntensity: v }))}
                                />
                            )}
                        </div>
                    </div>

                    {/* Grid & Spacing Section */}
                    <div>
                        <div className="font-mono text-[9px] uppercase text-[var(--accent-color)] mb-2 flex items-center gap-1">
                            <span>◆</span> GRID & SPACING
                        </div>
                        <div className="space-y-2 bg-[var(--bg-card)] p-2 border border-[var(--border-color)]">
                            <SliderField
                                label="Grid Size"
                                value={tokens.gridSize}
                                min={8}
                                max={48}
                                onChange={(v) => setTokens(prev => ({ ...prev, gridSize: v }))}
                            />
                            <SliderField
                                label="Grid Opacity"
                                value={tokens.gridOpacity}
                                max={100}
                                onChange={(v) => setTokens(prev => ({ ...prev, gridOpacity: v }))}
                            />
                            <SliderField
                                label="Letter Spacing"
                                value={tokens.letterSpacing}
                                min={-5}
                                max={10}
                                onChange={(v) => setTokens(prev => ({ ...prev, letterSpacing: v }))}
                            />
                            <SliderField
                                label="Line Height"
                                value={tokens.lineHeight}
                                min={100}
                                max={200}
                                onChange={(v) => setTokens(prev => ({ ...prev, lineHeight: v }))}
                            />
                        </div>
                    </div>

                    {/* Contrast Checker */}
                    <div>
                        <div className="font-mono text-[9px] uppercase text-[var(--accent-color)] mb-2 flex items-center gap-1">
                            <span>◆</span> ACCESSIBILITY
                        </div>
                        <div className="bg-[var(--bg-card)] p-2 border border-[var(--border-color)]">
                            {(() => {
                                const ratio = getContrastRatio(tokens.colors.text, tokens.colors.background);
                                const rating = ratio >= 7 ? 'AAA' : ratio >= 4.5 ? 'AA' : ratio >= 3 ? 'A' : 'FAIL';
                                const ratingColor = ratio >= 4.5 ? 'text-green-500' : ratio >= 3 ? 'text-yellow-500' : 'text-red-500';
                                return (
                                    <div className="flex items-center justify-between">
                                        <span className="text-[9px] font-mono text-[var(--text-muted)]">Contrast Ratio</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-mono font-bold text-[var(--text-main)]">{ratio.toFixed(1)}:1</span>
                                            <span className={cn('text-[8px] font-mono font-bold px-1.5 py-0.5 border', ratingColor)}>{rating}</span>
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                    </div>

                    {/* Presets Section */}
                    <div>
                        <div className="font-mono text-[9px] uppercase text-[var(--accent-color)] mb-2 flex items-center gap-1">
                            <span>◆</span> PRESETS
                        </div>
                        <div className="bg-[var(--bg-card)] p-2 border border-[var(--border-color)]">
                            <div className="flex gap-1 mb-2">
                                <input
                                    type="text"
                                    value={presetName}
                                    onChange={(e) => setPresetName(e.target.value)}
                                    placeholder="Preset name..."
                                    className="flex-1 px-2 py-1 text-[9px] font-mono bg-[var(--bg-main)] border border-[var(--border-color)] text-[var(--text-main)]"
                                />
                                <button
                                    onClick={handleSavePreset}
                                    disabled={!presetName.trim()}
                                    className="px-2 py-1 text-[8px] font-mono bg-[var(--accent-color)] text-[var(--bg-main)] disabled:opacity-50"
                                >
                                    SAVE
                                </button>
                            </div>
                            {savedPresets.length > 0 && (
                                <div className="space-y-1 max-h-24 overflow-y-auto">
                                    {savedPresets.map((preset, i) => (
                                        <div key={i} className="flex items-center justify-between gap-1">
                                            <button
                                                onClick={() => handleLoadPreset(preset)}
                                                className="flex-1 text-left px-2 py-1 text-[8px] font-mono border border-[var(--border-color)] text-[var(--text-main)] hover:border-[var(--accent-color)]"
                                            >
                                                {preset.name}
                                            </button>
                                            <button
                                                onClick={() => handleDeletePreset(i)}
                                                className="px-1 text-[8px] text-[var(--text-muted)] hover:text-red-500"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right: Live Preview */}
                <div className="w-full lg:w-1/2 p-3 flex flex-col">
                    <div className="font-mono text-[9px] uppercase text-[var(--accent-color)] mb-2 flex items-center gap-1">
                        <span>◆</span> LIVE PREVIEW
                    </div>

                    <div
                        className="flex-1 border-2 border-[var(--border-color)] overflow-hidden"
                        style={{ backgroundColor: tokens.colors.background }}
                    >
                        <div className="p-3 h-full flex flex-col gap-3">
                            {/* Sample Heading */}
                            <h2
                                style={{
                                    color: tokens.colors.text,
                                    fontFamily: tokens.fonts.primary,
                                    fontSize: '18px',
                                    fontWeight: 'bold'
                                }}
                            >
                                Sample Heading
                            </h2>

                            {/* Sample Body */}
                            <p
                                style={{
                                    color: tokens.colors.text,
                                    fontFamily: tokens.fonts.secondary,
                                    fontSize: '12px',
                                    opacity: 0.8
                                }}
                            >
                                This is how body text will appear with your custom design tokens.
                            </p>

                            {/* Sample Buttons */}
                            <div className="flex gap-2 flex-wrap">
                                <button
                                    style={{
                                        backgroundColor: tokens.colors.accent,
                                        color: tokens.colors.background,
                                        fontFamily: tokens.fonts.accent,
                                        padding: '8px 16px',
                                        fontSize: '11px',
                                        fontWeight: 'bold',
                                        border: `2px solid ${tokens.colors.accent}`,
                                        borderRadius: `${tokens.borderRadius}px`,
                                        boxShadow: shadowStyle,
                                    }}
                                >
                                    Primary Button
                                </button>
                                <button
                                    style={{
                                        backgroundColor: 'transparent',
                                        color: tokens.colors.text,
                                        fontFamily: tokens.fonts.accent,
                                        padding: '8px 16px',
                                        fontSize: '11px',
                                        fontWeight: 'bold',
                                        border: `2px solid ${tokens.colors.text}`,
                                        borderRadius: `${tokens.borderRadius}px`,
                                    }}
                                >
                                    Secondary
                                </button>
                            </div>

                            {/* Sample Card */}
                            <div
                                style={{
                                    border: `2px solid ${tokens.colors.primary}33`,
                                    borderRadius: `${tokens.borderRadius}px`,
                                    padding: '12px',
                                    backgroundColor: `${tokens.colors.text}08`,
                                    boxShadow: tokens.shadowEnabled ? shadowStyle : 'none',
                                }}
                            >
                                <div
                                    style={{
                                        color: tokens.colors.primary,
                                        fontFamily: tokens.fonts.primary,
                                        fontSize: '12px',
                                        fontWeight: 'bold',
                                        marginBottom: '4px'
                                    }}
                                >
                                    Card Component
                                </div>
                                <div
                                    style={{
                                        color: tokens.colors.text,
                                        fontFamily: tokens.fonts.secondary,
                                        fontSize: '10px',
                                        opacity: 0.7
                                    }}
                                >
                                    Your custom card style preview.
                                </div>
                            </div>

                            {/* Color bar */}
                            <div className="flex gap-1 mt-auto">
                                {Object.values(tokens.colors).map((color, i) => (
                                    <div key={i} className="flex-1 h-3" style={{ backgroundColor: color }} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="flex gap-2 p-3 border-t-2 border-[var(--border-color)] bg-[var(--bg-main)]">
                <button
                    onClick={handleReset}
                    className="px-3 py-2 text-[10px] font-mono font-bold uppercase border-2 border-[var(--border-color)] text-[var(--text-main)] hover:border-[var(--text-main)] transition-all"
                >
                    Reset to Era
                </button>
                <button
                    onClick={() => onApply(tokens)}
                    className={cn(
                        'flex-1 py-2 text-[10px] font-mono font-bold uppercase',
                        'bg-[var(--accent-color)] text-[var(--bg-main)]',
                        'border-2 border-[var(--accent-color)]',
                        'hover:brightness-110 transition-all',
                        'shadow-[4px_4px_0px_0px_var(--border-color)]',
                        'hover:shadow-[2px_2px_0px_0px_var(--border-color)]',
                        'active:shadow-none active:translate-x-[2px] active:translate-y-[2px]'
                    )}
                >
                    Apply to Site →
                </button>
            </div>
        </motion.div>
    );
}

export default DesignLabEditor;
