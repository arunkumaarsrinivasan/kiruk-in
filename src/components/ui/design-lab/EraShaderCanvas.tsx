'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { ThemeConfig } from '@/data/portfolio-data';

interface EraShaderCanvasProps {
    era: ThemeConfig;
    className?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SHADER EFFECT CONFIGURATION PER ERA
// ═══════════════════════════════════════════════════════════════════════════════

interface ShaderEffectConfig {
    glitch: boolean;
    dithering: boolean;
    ditheringAlgorithm: 'floyd-steinberg' | 'atkinson' | 'ordered' | 'none';
    colorPalette: string[];
    scanlines: boolean;
    scanlineDensity: number;
    bloom: boolean;
    bloomIntensity: number;
    crtCurvature: boolean;
    curvatureAmount: number;
    vignette: boolean;
    vignetteIntensity: number;
    chromaticAberration: boolean;
    phosphorGlow: boolean;
    phosphorColor: string;
    screenFlicker: boolean;
}

const getShaderEffectsForEra = (eraId: string): ShaderEffectConfig => {
    const baseConfig: ShaderEffectConfig = {
        glitch: false,
        dithering: false,
        ditheringAlgorithm: 'none',
        colorPalette: [],
        scanlines: false,
        scanlineDensity: 0,
        bloom: false,
        bloomIntensity: 0,
        crtCurvature: false,
        curvatureAmount: 0,
        vignette: false,
        vignetteIntensity: 0,
        chromaticAberration: false,
        phosphorGlow: false,
        phosphorColor: '#00ff00',
        screenFlicker: false,
    };

    switch (eraId) {
        case '1970':
            return {
                ...baseConfig,
                glitch: true,
                scanlines: true,
                scanlineDensity: 2,
                bloom: true,
                bloomIntensity: 0.4,
                vignette: true,
                vignetteIntensity: 0.2,
                phosphorGlow: true,
                phosphorColor: '#33ff33',
            };

        case '1981':
            return {
                ...baseConfig,
                dithering: true,
                ditheringAlgorithm: 'ordered',
                colorPalette: ['#000000', '#ffffff', '#808080', '#c0c0c0'],
                scanlines: true,
                scanlineDensity: 3,
            };

        case '1991':
        case '1993':
            return {
                ...baseConfig,
                dithering: true,
                ditheringAlgorithm: 'atkinson',
                colorPalette: ['#000000', '#ffffff', '#0000ee', '#551a8b'],
                scanlines: true,
                scanlineDensity: 4,
                bloom: true,
                bloomIntensity: 0.3,
            };

        case '1995':
        case '1997':
            return {
                ...baseConfig,
                dithering: true,
                ditheringAlgorithm: 'floyd-steinberg',
                colorPalette: ['#000033', '#ff00ff', '#ffff00', '#00ffff', '#ffffff'],
                bloom: true,
                bloomIntensity: 0.6,
                chromaticAberration: true,
            };

        case '2020':
        case '2021':
        case '2022':
        case '2023':
        case '2024':
            return {
                ...baseConfig,
                bloom: true,
                bloomIntensity: 0.2,
                chromaticAberration: false,
            };

        default:
            return baseConfig;
    }
};

// ═══════════════════════════════════════════════════════════════════════════════
// GLITCH EFFECT - Minimal visual distortion
// ═══════════════════════════════════════════════════════════════════════════════

function GlitchEffect({ color, intensity = 0.3 }: { color: string; intensity?: number }) {
    return (
        <motion.div
            className="absolute inset-0 pointer-events-none"
            animate={{
                opacity: [0, intensity * 0.5, 0, intensity * 0.3, 0],
                x: [0, -2, 0, 2, 0],
            }}
            transition={{
                duration: 0.15,
                repeat: Infinity,
                repeatDelay: 3 + Math.random() * 5,
            }}
            style={{
                background: `linear-gradient(90deg, ${color}10 0%, transparent 50%, ${color}10 100%)`,
                mixBlendMode: 'overlay',
            }}
        />
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCANLINES EFFECT - CRT monitor simulation
// ═══════════════════════════════════════════════════════════════════════════════

function ScanlinesEffect({ density = 2, opacity = 0.1 }: { density?: number; opacity?: number }) {
    return (
        <div
            className="absolute inset-0 pointer-events-none"
            style={{
                background: `repeating-linear-gradient(
          0deg,
          transparent,
          transparent ${density}px,
          rgba(0, 0, 0, ${opacity}) ${density}px,
          rgba(0, 0, 0, ${opacity}) ${density * 2}px
        )`,
            }}
        />
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PHOSPHOR GLOW EFFECT - Terminal screen glow
// ═══════════════════════════════════════════════════════════════════════════════

function PhosphorGlowEffect({ color, intensity = 0.5 }: { color: string; intensity?: number }) {
    return (
        <motion.div
            className="absolute inset-0 pointer-events-none"
            animate={{ opacity: [intensity * 0.5, intensity, intensity * 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            style={{
                background: `radial-gradient(ellipse at center, ${color}30 0%, transparent 70%)`,
                filter: `blur(20px)`,
            }}
        />
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN FLICKER EFFECT - Random brightness variations
// ═══════════════════════════════════════════════════════════════════════════════

function ScreenFlickerEffect() {
    return (
        <motion.div
            className="absolute inset-0 pointer-events-none bg-white"
            animate={{ opacity: [0, 0.02, 0, 0.01, 0] }}
            transition={{
                duration: 0.1,
                repeat: Infinity,
                repeatDelay: Math.random() * 5 + 2
            }}
        />
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CRT CURVATURE EFFECT - Barrel distortion simulation
// ═══════════════════════════════════════════════════════════════════════════════

function CRTCurvatureEffect({ children, amount = 0.02 }: { children: React.ReactNode; amount?: number }) {
    return (
        <div
            className="relative w-full h-full overflow-hidden"
            style={{
                // CSS barrel distortion approximation
                borderRadius: `${amount * 1000}px / ${amount * 500}px`,
                transform: `perspective(1000px) rotateX(${amount * 2}deg)`,
                boxShadow: `inset 0 0 100px rgba(0,0,0,0.3)`,
            }}
        >
            {children}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VIGNETTE EFFECT - Edge darkening
// ═══════════════════════════════════════════════════════════════════════════════

function VignetteEffect({ intensity = 0.5 }: { intensity?: number }) {
    return (
        <div
            className="absolute inset-0 pointer-events-none"
            style={{
                background: `radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,${intensity}) 100%)`,
            }}
        />
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
// DITHERING EFFECT - Floyd-Steinberg/Atkinson style patterns
// ═══════════════════════════════════════════════════════════════════════════════

function DitheringPatternEffect({
    algorithm = 'ordered',
    primaryColor,
    secondaryColor
}: {
    algorithm: 'floyd-steinberg' | 'atkinson' | 'ordered' | 'none';
    primaryColor: string;
    secondaryColor: string;
}) {
    const patternStyle = useMemo(() => {
        switch (algorithm) {
            case 'ordered':
                // Bayer matrix dithering pattern
                return {
                    backgroundImage: `
            linear-gradient(45deg, ${primaryColor}22 25%, transparent 25%),
            linear-gradient(-45deg, ${primaryColor}22 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, ${secondaryColor}22 75%),
            linear-gradient(-45deg, transparent 75%, ${secondaryColor}22 75%)
          `,
                    backgroundSize: '4px 4px',
                    backgroundPosition: '0 0, 0 2px, 2px -2px, -2px 0px',
                };
            case 'floyd-steinberg':
            case 'atkinson':
                // Error diffusion approximation with noise pattern
                return {
                    backgroundImage: `
            radial-gradient(circle at 1px 1px, ${primaryColor}15 1px, transparent 1px),
            radial-gradient(circle at 3px 3px, ${secondaryColor}10 1px, transparent 1px)
          `,
                    backgroundSize: '4px 4px',
                };
            default:
                return {};
        }
    }, [algorithm, primaryColor, secondaryColor]);

    if (algorithm === 'none') return null;

    return (
        <div
            className="absolute inset-0 pointer-events-none opacity-60"
            style={patternStyle}
        />
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CHROMATIC ABERRATION EFFECT - RGB channel separation
// ═══════════════════════════════════════════════════════════════════════════════

function ChromaticAberrationEffect() {
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div
                className="absolute inset-0"
                style={{
                    boxShadow: 'inset -2px 0 0 rgba(255,0,0,0.1), inset 2px 0 0 rgba(0,255,255,0.1)',
                }}
            />
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
// BLOOM EFFECT - Glow bleeding from bright areas
// ═══════════════════════════════════════════════════════════════════════════════

function BloomEffect({ intensity = 0.5, color }: { intensity?: number; color: string }) {
    return (
        <div
            className="absolute inset-0 pointer-events-none"
            style={{
                boxShadow: `inset 0 0 ${60 * intensity}px ${color}20, inset 0 0 ${120 * intensity}px ${color}10`,
                filter: `blur(${intensity * 2}px)`,
            }}
        />
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN ERA SHADER CANVAS COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export function EraShaderCanvas({ era, className = '' }: EraShaderCanvasProps) {
    const config = useMemo(() => getShaderEffectsForEra(era.id), [era.id]);
    const accentColor = era.colors?.accent ?? era.colors?.primary ?? '#00ff88';
    const textColor = era.colors?.text ?? '#ffffff';

    // If no effects are enabled, don't render anything
    const hasEffects = config.glitch || config.dithering || config.scanlines ||
        config.bloom || config.phosphorGlow || config.screenFlicker ||
        config.vignette || config.chromaticAberration;

    if (!hasEffects) return null;

    const content = (
        <>
            {/* Dithering Pattern */}
            {config.dithering && (
                <DitheringPatternEffect
                    algorithm={config.ditheringAlgorithm}
                    primaryColor={textColor}
                    secondaryColor={accentColor}
                />
            )}

            {/* Glitch Effect */}
            {config.glitch && (
                <GlitchEffect color={accentColor} intensity={0.3} />
            )}

            {/* Phosphor Glow */}
            {config.phosphorGlow && (
                <PhosphorGlowEffect color={config.phosphorColor} intensity={0.5} />
            )}

            {/* Bloom */}
            {config.bloom && (
                <BloomEffect intensity={config.bloomIntensity} color={accentColor} />
            )}

            {/* Scanlines */}
            {config.scanlines && (
                <ScanlinesEffect density={config.scanlineDensity} opacity={0.08} />
            )}

            {/* Screen Flicker */}
            {config.screenFlicker && <ScreenFlickerEffect />}

            {/* Chromatic Aberration */}
            {config.chromaticAberration && <ChromaticAberrationEffect />}

            {/* Vignette */}
            {config.vignette && (
                <VignetteEffect intensity={config.vignetteIntensity} />
            )}
        </>
    );

    // Apply CRT curvature if enabled
    if (config.crtCurvature) {
        return (
            <div className={`absolute inset-0 pointer-events-none z-0 ${className}`}>
                <CRTCurvatureEffect amount={config.curvatureAmount}>
                    {content}
                </CRTCurvatureEffect>
            </div>
        );
    }

    return (
        <div className={`absolute inset-0 pointer-events-none z-0 ${className}`}>
            {content}
        </div>
    );
}

export default EraShaderCanvas;
