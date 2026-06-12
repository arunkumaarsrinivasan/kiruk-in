'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLayoutMode } from '@/contexts/LayoutModeContext';

// Helper function for hex to rgba
function hexToRgba(hex: string, alpha: number): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

type HatType = 'designer' | 'developer' | 'bridge';

interface PixelParticle {
    id: number;
    color: string;
    angle: number;
}

interface HeroWithHatSwitchingProps {
    sectionRef: (el: HTMLElement | null) => void;
    currentEra: { colors: { accent: string } };
    isClient: boolean;
}

/**
 * Hero section with interactive hat-switching 8-bit character
 * Clean wireframe style with corner rulers, no binding holes
 */
export function HeroWithHatSwitching({
    sectionRef,
    currentEra,
    isClient
}: HeroWithHatSwitchingProps) {
    const { layoutMode, setLayoutMode } = useLayoutMode();
    // Matches default home layout (developer → full digital)
    const [activeHat, setActiveHat] = useState<HatType>('developer');
    const [pixels, setPixels] = useState<PixelParticle[]>([]);
    const [bridgeClickCount, setBridgeClickCount] = useState(0);
    const [isSuperPowered, setIsSuperPowered] = useState(false);
    const [isBridgeHovered, setIsBridgeHovered] = useState(false);

    useEffect(() => {
        if (layoutMode === 'full-sketch') {
            setActiveHat('designer');
        } else if (layoutMode === 'full-digital') {
            setActiveHat('developer');
        } else if (layoutMode === 'split-side' || layoutMode === 'split-top') {
            setActiveHat('bridge');
        }
    }, [layoutMode]);

    // Bridge / KIRUK: half split layout; triple-click while on bridge unlocks super power
    const handleBridgeClick = useCallback(() => {
        if (activeHat !== 'bridge') {
            setActiveHat('bridge');
            setLayoutMode('split-side');
            setBridgeClickCount(0);
            setPixels([]);
            return;
        }

        const newCount = bridgeClickCount + 1;
        setBridgeClickCount(newCount);

        if (newCount >= 3 && !isSuperPowered) {
            setIsSuperPowered(true);
            const newPixels: PixelParticle[] = [];
            for (let i = 0; i < 20; i++) {
                newPixels.push({
                    id: Date.now() + i,
                    color: ['#FFD700', '#FFA500', currentEra.colors.accent][Math.floor(Math.random() * 3)],
                    angle: (Math.PI * 2 * i) / 20 + Math.random() * 0.5,
                });
            }
            setPixels(newPixels);
            setTimeout(() => setPixels([]), 1000);
        } else {
            setPixels([]);
        }
    }, [activeHat, bridgeClickCount, currentEra.colors.accent, isSuperPowered, setLayoutMode]);

    const cornerSize = 24;

    return (
        <section
            id="hero"
            ref={sectionRef}
            data-cursor-zone="hero"
            className="relative min-h-[90vh] flex items-center py-16 px-6"
        >
            {/* Corner rulers - Top Left */}
            <div className="absolute top-0 left-0 pointer-events-none">
                <div className="absolute top-0 left-6 w-px" style={{ height: cornerSize, backgroundColor: 'var(--accent-color)' }} />
                <div className="absolute top-0 left-6 h-px" style={{ width: cornerSize, backgroundColor: 'var(--accent-color)' }} />
            </div>
            {/* Corner rulers - Top Right */}
            <div className="absolute top-0 right-0 pointer-events-none">
                <div className="absolute top-0 right-6 w-px" style={{ height: cornerSize, backgroundColor: 'var(--accent-color)' }} />
                <div className="absolute top-0 right-6 h-px" style={{ width: cornerSize, backgroundColor: 'var(--accent-color)' }} />
            </div>

            <div className="w-full max-w-5xl mx-auto">
                <div
                    className="border-2 p-6 md:p-8 relative overflow-hidden"
                    style={{
                        borderColor: 'var(--accent-color)',
                        backgroundColor: 'var(--bg-main)',
                    }}
                >
                    {/* Grid pattern */}
                    <div
                        className="absolute inset-0 opacity-5 pointer-events-none"
                        style={{
                            backgroundImage: `
                                linear-gradient(var(--accent-color) 1px, transparent 1px),
                                linear-gradient(90deg, var(--accent-color) 1px, transparent 1px)
                            `,
                            backgroundSize: '8px 8px'
                        }}
                    />

                    {/* Content */}
                    <div className="relative z-10 flex flex-col items-center gap-6 py-4">

                        {/* Introduction */}
                        <div className="flex flex-col items-center justify-center w-full gap-2 text-center">
                            <motion.h1
                                className="font-mono uppercase leading-none"
                                style={{ color: 'var(--accent-color)' }}
                                initial={isClient ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={isClient ? { delay: 0.2 } : { duration: 0 }}
                            >
                                <span className="block text-4xl md:text-5xl font-black">
                                    Hey, I&apos;m Arun
                                </span>
                                <span
                                    className="block text-sm md:text-base font-bold tracking-[0.2em] mt-3"
                                    style={{ color: 'var(--text-main)' }}
                                >
                                    Design Engineer &amp; AI UX Designer in Bengaluru, India
                                </span>
                            </motion.h1>
                        </div>

                        {/* 8-Bit Character with Hats */}
                        <div className="relative">
                            {/* Pixel particles */}
                            <AnimatePresence>
                                {pixels.map((pixel) => (
                                    <motion.div
                                        key={pixel.id}
                                        className="absolute pointer-events-none"
                                        style={{
                                            left: '50%',
                                            top: '50%',
                                            width: '8px',
                                            height: '8px',
                                            backgroundColor: pixel.color,
                                            imageRendering: 'pixelated',
                                            zIndex: 20,
                                        }}
                                        initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                                        animate={{
                                            x: Math.cos(pixel.angle) * 80,
                                            y: Math.sin(pixel.angle) * 80,
                                            opacity: [1, 0.8, 0],
                                            scale: [1, 1.2, 0.3],
                                        }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 1.0, ease: 'easeOut' }}
                                    />
                                ))}
                            </AnimatePresence>

                            {/* Character SVG */}
                            <motion.div
                                animate={{
                                    y: [0, -4, 0],
                                    scale: isSuperPowered ? [1, 1.03, 1] : 1,
                                    filter: isSuperPowered ? `brightness(1.15) drop-shadow(0 0 8px ${currentEra.colors.accent})` : 'none'
                                }}
                                transition={{
                                    duration: isSuperPowered ? 1.5 : 2,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                            >
                                <svg
                                    width="160"
                                    height="200"
                                    viewBox="0 0 120 170"
                                    style={{ imageRendering: 'pixelated' }}
                                    className="drop-shadow-xl"
                                >
                                    {/* Designer Hat - Beret */}
                                    <AnimatePresence>
                                        {activeHat === 'designer' && (
                                            <motion.g
                                                initial={{ y: -30, opacity: 0 }}
                                                animate={{ y: 0, opacity: 1 }}
                                                exit={{ y: -20, opacity: 0 }}
                                                transition={{ type: 'spring', damping: 12, stiffness: 150 }}
                                            >
                                                <rect x="32" y="18" width="56" height="8" fill="#E91E63" />
                                                <rect x="36" y="10" width="48" height="12" fill="#E91E63" />
                                                <rect x="40" y="4" width="40" height="10" fill="#E91E63" />
                                                <rect x="44" y="0" width="32" height="8" fill="#E91E63" />
                                                <rect x="72" y="2" width="16" height="12" fill="#E91E63" />
                                                <rect x="80" y="6" width="12" height="8" fill="#E91E63" />
                                                <rect x="48" y="6" width="8" height="4" fill="#F48FB1" />
                                            </motion.g>
                                        )}
                                    </AnimatePresence>

                                    {/* Developer Hat - Baseball Cap */}
                                    <AnimatePresence>
                                        {activeHat === 'developer' && (
                                            <motion.g
                                                initial={{ y: -30, opacity: 0 }}
                                                animate={{ y: 0, opacity: 1 }}
                                                exit={{ y: -20, opacity: 0 }}
                                                transition={{ type: 'spring', damping: 12, stiffness: 150 }}
                                            >
                                                <rect x="32" y="16" width="56" height="10" fill="#2196F3" />
                                                <rect x="36" y="8" width="48" height="12" fill="#2196F3" />
                                                <rect x="40" y="4" width="40" height="8" fill="#2196F3" />
                                                <rect x="24" y="22" width="40" height="6" fill="#1565C0" />
                                                <rect x="20" y="24" width="8" height="4" fill="#1565C0" />
                                                <rect x="56" y="2" width="8" height="4" fill="#1565C0" />
                                                <text x="60" y="18" fontSize="10" fill="white" textAnchor="middle" fontFamily="monospace" fontWeight="bold">&lt;/&gt;</text>
                                            </motion.g>
                                        )}
                                    </AnimatePresence>

                                    {/* Bridge Hat - Hard Hat */}
                                    <AnimatePresence>
                                        {activeHat === 'bridge' && (
                                            <motion.g
                                                initial={{ y: -30, opacity: 0 }}
                                                animate={{ y: 0, opacity: 1 }}
                                                exit={{ y: -20, opacity: 0 }}
                                                transition={{ type: 'spring', damping: 12, stiffness: 150 }}
                                            >
                                                <rect x="28" y="18" width="64" height="8" fill={isSuperPowered ? '#FFD700' : currentEra.colors.accent} />
                                                <rect x="32" y="10" width="56" height="12" fill={isSuperPowered ? '#FFB84D' : currentEra.colors.accent} />
                                                <rect x="36" y="4" width="48" height="10" fill={isSuperPowered ? '#FFD700' : currentEra.colors.accent} />
                                                <rect x="44" y="0" width="32" height="8" fill={isSuperPowered ? '#FFB84D' : currentEra.colors.accent} />
                                                <rect x="24" y="22" width="72" height="4" fill={isSuperPowered ? '#FFD700' : currentEra.colors.accent} />
                                                <rect x="32" y="14" width="56" height="4" fill="white" opacity={isSuperPowered ? 0.6 : 0.4} />
                                                {isSuperPowered && (
                                                    <>
                                                        <rect x="56" y="4" width="8" height="12" fill="#FFF" opacity="0.9" />
                                                        <rect x="58" y="6" width="4" height="4" fill="#FFD700" />
                                                        <rect x="60" y="10" width="4" height="4" fill="#FFD700" />
                                                    </>
                                                )}
                                            </motion.g>
                                        )}
                                    </AnimatePresence>

                                    {/* Head */}
                                    <rect x="36" y="30" width="48" height="48" fill="#FDBF60" />
                                    <rect x="32" y="34" width="8" height="40" fill="#FDBF60" />
                                    <rect x="80" y="34" width="8" height="40" fill="#FDBF60" />

                                    {/* Hair */}
                                    {activeHat && (
                                        <>
                                            <rect x="32" y="34" width="6" height="12" fill="#4A4A4A" />
                                            <rect x="82" y="34" width="6" height="12" fill="#4A4A4A" />
                                            <rect x="36" y="26" width="8" height="4" fill="#4A4A4A" />
                                            <rect x="76" y="26" width="8" height="4" fill="#4A4A4A" />
                                        </>
                                    )}

                                    {/* Eyes */}
                                    <rect x="44" y="46" width="8" height="8" fill="#2D2D2D" />
                                    <rect x="68" y="46" width="8" height="8" fill="#2D2D2D" />
                                    <rect x="46" y="48" width="4" height="4" fill="white" />
                                    <rect x="70" y="48" width="4" height="4" fill="white" />

                                    {/* Smile */}
                                    <rect x="48" y="62" width="24" height="4" fill="#2D2D2D" />
                                    <rect x="44" y="58" width="4" height="4" fill="#2D2D2D" />
                                    <rect x="72" y="58" width="4" height="4" fill="#2D2D2D" />

                                    {/* Body */}
                                    {isSuperPowered && (
                                        <rect x="30" y="76" width="60" height="52" fill={currentEra.colors.accent} opacity="0.1" />
                                    )}
                                    <rect x="32" y="78" width="56" height="48" fill={isSuperPowered ? '#FFB84D' : '#333333'} />
                                    <rect x="28" y="82" width="8" height="40" fill={isSuperPowered ? '#FFA500' : '#333333'} />
                                    <rect x="84" y="82" width="8" height="40" fill={isSuperPowered ? '#FFA500' : '#333333'} />

                                    {/* Arms */}
                                    <rect x="16" y="82" width="16" height="12" fill="#FDBF60" />
                                    <rect x="88" y="82" width="16" height="12" fill="#FDBF60" />

                                    {/* Hands */}
                                    <rect x="8" y="90" width="12" height="12" fill="#FDBF60" />
                                    <rect x="100" y="90" width="12" height="12" fill="#FDBF60" />

                                    {/* Pencil in left hand */}
                                    <rect x="4" y="86" width="4" height="20" fill="#FFD700" />
                                    <rect x="4" y="82" width="4" height="4" fill="#E91E63" />
                                    <rect x="4" y="106" width="4" height="4" fill="#FDBF60" />

                                    {/* Code bracket in right hand */}
                                    <text x="108" y="102" fontSize="14" fill="#2196F3" fontFamily="monospace" fontWeight="bold">&lt;/&gt;</text>

                                    {/* Legs */}
                                    <rect x="36" y="126" width="20" height="32" fill="#4A5568" />
                                    <rect x="64" y="126" width="20" height="32" fill="#4A5568" />

                                    {/* Shoes */}
                                    <rect x="32" y="154" width="24" height="8" fill="#2D2D2D" />
                                    <rect x="64" y="154" width="24" height="8" fill="#2D2D2D" />
                                </svg>
                            </motion.div>
                        </div>

                        <div className="h-6 flex items-center justify-center">
                            <motion.p
                                className="text-[10px] font-mono uppercase tracking-wider leading-none"
                                style={{ color: 'var(--text-muted)' }}
                                initial={isClient ? { opacity: 0 } : { opacity: 1 }}
                                animate={{ opacity: 1 }}
                                transition={isClient ? { delay: 0.6 } : { duration: 0 }}
                            >
                                Tap a hat to explore the mix
                            </motion.p>
                        </div>

                        {/* Role Description */}
                        <div className="flex flex-col items-center gap-4 max-w-lg text-center">
                            {/* Hat Selection Buttons */}
                            <div className="flex flex-wrap justify-center gap-3">
                                {/* Designer Button */}
                                <motion.button
                                    className="flex items-center justify-center gap-2 px-4 h-12 border-2 cursor-pointer"
                                    data-cursor-chat="hat-designer"
                                    style={{
                                        borderColor: activeHat === 'designer' ? '#E91E63' : 'var(--border-color)',
                                        backgroundColor: activeHat === 'designer' ? 'rgba(233, 30, 99, 0.2)' : 'rgba(233, 30, 99, 0.05)',
                                        boxShadow: activeHat === 'designer' ? '0 0 15px rgba(233, 30, 99, 0.3)' : 'none'
                                    }}
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => {
                                        setActiveHat('designer');
                                        setLayoutMode('full-sketch');
                                        setBridgeClickCount(0);
                                        setIsSuperPowered(false);
                                        setPixels([]);
                                    }}
                                >
                                    <svg width="24" height="16" viewBox="0 0 48 32" style={{ imageRendering: 'pixelated' }}>
                                        <rect x="8" y="20" width="32" height="8" fill="#E91E63" />
                                        <rect x="12" y="12" width="24" height="12" fill="#E91E63" />
                                        <rect x="16" y="8" width="16" height="8" fill="#E91E63" />
                                        <rect x="20" y="4" width="8" height="8" fill="#E91E63" />
                                    </svg>
                                    <span className="text-xs font-mono font-bold uppercase" style={{ color: '#E91E63' }}>
                                        Designer
                                    </span>
                                    {activeHat === 'designer' && <span className="text-xs">✓</span>}
                                </motion.button>

                                {/* Bridge Button */}
                                <motion.button
                                    className="flex items-center justify-center gap-2 px-4 h-12 border-2 cursor-pointer"
                                    data-cursor-chat="hat-bridge"
                                    style={{
                                        borderColor: activeHat === 'bridge' ? (isSuperPowered ? '#FFD700' : currentEra.colors.accent) : 'var(--border-color)',
                                        backgroundColor: activeHat === 'bridge' ? hexToRgba(isSuperPowered ? '#FFD700' : currentEra.colors.accent, 0.2) : hexToRgba(currentEra.colors.accent, 0.05),
                                        boxShadow: activeHat === 'bridge' ? `0 0 15px ${hexToRgba(isSuperPowered ? '#FFD700' : currentEra.colors.accent, isSuperPowered ? 0.6 : 0.3)}` : 'none'
                                    }}
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleBridgeClick}
                                    onMouseEnter={() => setIsBridgeHovered(true)}
                                    onMouseLeave={() => setIsBridgeHovered(false)}
                                >
                                    <svg width="28" height="18" viewBox="0 0 56 36" style={{ imageRendering: 'pixelated' }}>
                                        <rect x="8" y="24" width="40" height="8" fill={isSuperPowered ? '#FFD700' : currentEra.colors.accent} />
                                        <rect x="12" y="16" width="32" height="12" fill={isSuperPowered ? '#FFA500' : currentEra.colors.accent} />
                                        <rect x="16" y="8" width="24" height="12" fill={isSuperPowered ? '#FFD700' : currentEra.colors.accent} />
                                        <rect x="20" y="4" width="16" height="8" fill={isSuperPowered ? '#FFA500' : currentEra.colors.accent} />
                                    </svg>
                                    <span className="text-xs font-mono font-bold uppercase" style={{ color: isSuperPowered ? '#FFD700' : currentEra.colors.accent }}>
                                        {isBridgeHovered ? 'KIRUK' : 'Bridge'}
                                    </span>
                                    {activeHat === 'bridge' && (
                                        <span className="text-xs" style={{ color: isSuperPowered ? '#FFD700' : currentEra.colors.accent }}>
                                            {isSuperPowered ? '⚡' : '✓'}
                                        </span>
                                    )}
                                </motion.button>

                                {/* Developer Button */}
                                <motion.button
                                    className="flex items-center justify-center gap-2 px-4 h-12 border-2 cursor-pointer"
                                    data-cursor-chat="hat-developer"
                                    style={{
                                        borderColor: activeHat === 'developer' ? '#2196F3' : 'var(--border-color)',
                                        backgroundColor: activeHat === 'developer' ? 'rgba(33, 150, 243, 0.2)' : 'rgba(33, 150, 243, 0.05)',
                                        boxShadow: activeHat === 'developer' ? '0 0 15px rgba(33, 150, 243, 0.3)' : 'none'
                                    }}
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => {
                                        setActiveHat('developer');
                                        setLayoutMode('full-digital');
                                        setBridgeClickCount(0);
                                        setIsSuperPowered(false);
                                        setPixels([]);
                                    }}
                                >
                                    <svg width="24" height="16" viewBox="0 0 48 32" style={{ imageRendering: 'pixelated' }}>
                                        <rect x="8" y="20" width="32" height="8" fill="#2196F3" />
                                        <rect x="4" y="16" width="40" height="8" fill="#2196F3" />
                                        <rect x="8" y="12" width="32" height="8" fill="#2196F3" />
                                        <rect x="12" y="8" width="24" height="8" fill="#2196F3" />
                                        <rect x="4" y="24" width="20" height="4" fill="#1565C0" />
                                    </svg>
                                    <span className="text-xs font-mono font-bold uppercase" style={{ color: '#2196F3' }}>
                                        Developer
                                    </span>
                                    {activeHat === 'developer' && <span className="text-xs">✓</span>}
                                </motion.button>
                            </div>

                            <div className="h-10 md:h-12 flex items-center justify-center">
                                <motion.h3
                                    className="text-2xl md:text-3xl font-mono font-black uppercase leading-none"
                                    style={{ color: 'var(--text-main)' }}
                                    initial={isClient ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={isClient ? { delay: 0.4 } : { duration: 0 }}
                                >
                                    DESIGNER WHO SHIPS
                                </motion.h3>
                            </div>
                            <div className="min-h-16 flex items-center justify-center">
                                <motion.p
                                    className="text-sm font-mono leading-relaxed"
                                    style={{ color: 'var(--text-muted)' }}
                                    initial={isClient ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={isClient ? { delay: 0.5 } : { duration: 0 }}
                                >
                                    I blend product design and front-end engineering for{' '}
                                    <a
                                        href="https://www.hp.com/us-en/printers/ai-printers.html"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="underline decoration-dotted underline-offset-2"
                                        style={{ color: 'var(--accent-color)' }}
                                    >
                                        HP Print AI
                                    </a>
                                    {' '}and selective freelance clients — usable, accessible experiences without translation loss. Built with{' '}
                                    <a
                                        href="https://react.dev"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="underline decoration-dotted underline-offset-2"
                                        style={{ color: 'var(--accent-color)' }}
                                    >
                                        React
                                    </a>
                                    {' '}and{' '}
                                    <a
                                        href="https://www.figma.com"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="underline decoration-dotted underline-offset-2"
                                        style={{ color: 'var(--accent-color)' }}
                                    >
                                        Figma
                                    </a>.
                                </motion.p>
                            </div>

                            {/* CTA Buttons */}
                            <motion.div
                                className="flex flex-wrap justify-center gap-3 mt-4"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.9 }}
                            >
                                <motion.a
                                    href="/portfolio"
                                    data-cursor-chat="cta-work"
                                    className="flex items-center justify-center px-6 h-12 border-2 font-mono font-bold uppercase text-sm cursor-pointer"
                                    style={{
                                        backgroundColor: 'var(--accent-color)',
                                        color: 'var(--bg-main)'
                                    }}
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    See My Work
                                </motion.a>
                                <motion.a
                                    href="#contact"
                                    data-cursor-chat="cta-contact"
                                    className="flex items-center justify-center px-6 h-12 border-2 font-mono font-bold uppercase text-sm cursor-pointer"
                                    style={{
                                        borderColor: 'var(--accent-color)',
                                        backgroundColor: 'transparent',
                                        color: 'var(--accent-color)'
                                    }}
                                    whileHover={{ scale: 1.05, y: -2, backgroundColor: 'var(--accent-color)', color: 'var(--bg-main)' }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Contact Me
                                </motion.a>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default HeroWithHatSwitching;
