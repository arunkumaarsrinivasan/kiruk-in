"use client";

import { motion } from "framer-motion";
import { useMemo, useCallback, useEffect, useState } from "react";

interface PixelStoryBackgroundProps {
    age: number;
    year: number;
    levelProgress: number;
    className?: string;
}

// ==============================================
// PIXEL ART PALETTE BY ERA
// ==============================================
const ERA_PALETTES = {
    baby: {
        primary: "#ffb4d6",      // soft pink
        secondary: "#b4f0ff",    // baby blue
        accent: "#ffffa0",       // warm yellow
        dark: "#6a4c93",         // muted purple
        bg: ["#1a0f25", "#221530", "#2a1a3a"],
    },
    toddler: {
        primary: "#7fff7f",      // playful green
        secondary: "#ff7f7f",    // soft red
        accent: "#ffff7f",       // bright yellow
        dark: "#4a6741",         // forest green
        bg: ["#12101f", "#181528", "#1e1a32"],
    },
    child: {
        primary: "#64b5f6",      // sky blue
        secondary: "#ffb74d",    // warm orange
        accent: "#81c784",       // grass green
        dark: "#1565c0",         // deep blue
        bg: ["#0a1628", "#0f1e35", "#142640"],
    },
    teen: {
        primary: "#bb86fc",      // vibrant purple
        secondary: "#03dac6",    // teal
        accent: "#ffab00",       // amber
        dark: "#3700b3",         // deep purple
        bg: ["#0f0f1a", "#141425", "#1a1a30"],
    },
    adult: {
        primary: "#00e676",      // neon green
        secondary: "#f50057",    // hot pink
        accent: "#00bcd4",       // cyan
        dark: "#1b5e20",         // forest
        bg: ["#0a0a14", "#0f0f20", "#14142c"],
    },
    professional: {
        primary: "#22c55e",      // success green
        secondary: "#a855f7",    // purple
        accent: "#06b6d4",       // cyan
        dark: "#166534",         // dark green
        bg: ["#080812", "#0c0c1a", "#101022"],
    },
};

function getStageFromAge(age: number): keyof typeof ERA_PALETTES {
    if (age <= 2) return "baby";
    if (age <= 6) return "toddler";
    if (age <= 12) return "child";
    if (age <= 18) return "teen";
    if (age <= 22) return "adult";
    return "professional";
}

// ==============================================
// 8-BIT PIXEL SPRITE DEFINITIONS
// ==============================================

const PIXEL_SIZE = 4;

// Baby era sprites (0-2)
const BABY_SPRITES = {
    rattle: [
        [0, 0, 1, 1, 1, 0, 0],
        [0, 1, 2, 2, 2, 1, 0],
        [0, 1, 2, 3, 2, 1, 0],
        [0, 1, 2, 2, 2, 1, 0],
        [0, 0, 1, 1, 1, 0, 0],
        [0, 0, 0, 1, 0, 0, 0],
        [0, 0, 0, 1, 0, 0, 0],
        [0, 0, 0, 1, 0, 0, 0],
    ],
    heart: [
        [0, 1, 1, 0, 1, 1, 0],
        [1, 2, 2, 1, 2, 2, 1],
        [1, 2, 2, 2, 2, 2, 1],
        [0, 1, 2, 2, 2, 1, 0],
        [0, 0, 1, 2, 1, 0, 0],
        [0, 0, 0, 1, 0, 0, 0],
    ],
    star: [
        [0, 0, 0, 1, 0, 0, 0],
        [0, 0, 0, 1, 0, 0, 0],
        [0, 1, 1, 2, 1, 1, 0],
        [1, 1, 2, 3, 2, 1, 1],
        [0, 1, 1, 2, 1, 1, 0],
        [0, 0, 1, 0, 1, 0, 0],
        [0, 1, 0, 0, 0, 1, 0],
    ],
};

// Toddler era sprites (3-6)
const TODDLER_SPRITES = {
    block: [
        [1, 1, 1, 1, 1, 1],
        [1, 2, 2, 2, 2, 1],
        [1, 2, 3, 3, 2, 1],
        [1, 2, 3, 3, 2, 1],
        [1, 2, 2, 2, 2, 1],
        [1, 1, 1, 1, 1, 1],
    ],
    crayon: [
        [0, 0, 1, 1, 0, 0],
        [0, 1, 2, 2, 1, 0],
        [1, 2, 2, 2, 2, 1],
        [1, 2, 2, 2, 2, 1],
        [1, 2, 2, 2, 2, 1],
        [1, 2, 2, 2, 2, 1],
        [1, 1, 1, 1, 1, 1],
    ],
    ball: [
        [0, 0, 1, 1, 1, 0, 0],
        [0, 1, 2, 2, 2, 1, 0],
        [1, 2, 3, 2, 2, 2, 1],
        [1, 2, 2, 2, 2, 2, 1],
        [1, 2, 2, 2, 2, 2, 1],
        [0, 1, 2, 2, 2, 1, 0],
        [0, 0, 1, 1, 1, 0, 0],
    ],
};

// Child era sprites (7-12)
const CHILD_SPRITES = {
    book: [
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 2, 2, 2, 2, 2, 2, 1],
        [1, 2, 3, 3, 3, 3, 2, 1],
        [1, 2, 3, 3, 3, 3, 2, 1],
        [1, 2, 3, 3, 3, 3, 2, 1],
        [1, 2, 2, 2, 2, 2, 2, 1],
        [1, 1, 1, 1, 1, 1, 1, 1],
    ],
    gameboy: [
        [1, 1, 1, 1, 1, 1],
        [1, 2, 2, 2, 2, 1],
        [1, 2, 3, 3, 2, 1],
        [1, 2, 3, 3, 2, 1],
        [1, 2, 2, 2, 2, 1],
        [1, 0, 0, 0, 0, 1],
        [1, 4, 0, 4, 4, 1],
        [1, 1, 1, 1, 1, 1],
    ],
    pencil: [
        [0, 0, 0, 1, 0],
        [0, 0, 1, 2, 1],
        [0, 1, 2, 2, 1],
        [1, 2, 2, 2, 1],
        [1, 2, 2, 2, 1],
        [1, 2, 2, 2, 1],
        [1, 2, 2, 2, 1],
        [1, 3, 3, 3, 1],
    ],
};

// Teen era sprites (13-18)
const TEEN_SPRITES = {
    laptop: [
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 2, 2, 2, 2, 2, 2, 2, 2, 1],
        [1, 2, 3, 3, 3, 3, 3, 3, 2, 1],
        [1, 2, 3, 4, 3, 3, 4, 3, 2, 1],
        [1, 2, 3, 3, 3, 3, 3, 3, 2, 1],
        [1, 2, 2, 2, 2, 2, 2, 2, 2, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    ],
    headphones: [
        [0, 0, 1, 1, 1, 1, 1, 0, 0],
        [0, 1, 0, 0, 0, 0, 0, 1, 0],
        [1, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 1],
        [2, 2, 0, 0, 0, 0, 0, 2, 2],
        [2, 3, 2, 0, 0, 0, 2, 3, 2],
        [2, 2, 0, 0, 0, 0, 0, 2, 2],
    ],
    code: [
        [1, 0, 0, 0, 0, 0, 0, 1],
        [1, 1, 0, 0, 0, 0, 1, 1],
        [0, 1, 1, 0, 0, 1, 1, 0],
        [0, 0, 1, 1, 1, 1, 0, 0],
        [0, 1, 1, 0, 0, 1, 1, 0],
        [1, 1, 0, 0, 0, 0, 1, 1],
        [1, 0, 0, 0, 0, 0, 0, 1],
    ],
};

// Adult era sprites (19-22)
const ADULT_SPRITES = {
    diploma: [
        [1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 2, 2, 2, 2, 2, 2, 2, 1],
        [1, 2, 3, 3, 3, 3, 3, 2, 1],
        [1, 2, 3, 3, 3, 3, 3, 2, 1],
        [1, 2, 2, 2, 2, 2, 2, 2, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1],
        [0, 0, 0, 4, 4, 4, 0, 0, 0],
        [0, 0, 0, 0, 4, 0, 0, 0, 0],
    ],
    coffee: [
        [0, 0, 1, 1, 1, 0, 0],
        [0, 1, 2, 2, 2, 1, 0],
        [1, 2, 3, 3, 3, 2, 1],
        [1, 2, 3, 3, 3, 2, 1],
        [1, 2, 2, 2, 2, 2, 1],
        [0, 1, 1, 1, 1, 1, 0],
        [0, 0, 1, 1, 1, 0, 0],
    ],
    brush: [
        [0, 0, 0, 1, 1, 0],
        [0, 0, 1, 2, 2, 1],
        [0, 1, 2, 2, 2, 1],
        [0, 1, 2, 2, 2, 1],
        [0, 1, 1, 1, 1, 1],
        [0, 0, 3, 3, 3, 0],
        [0, 0, 3, 3, 3, 0],
        [0, 0, 3, 3, 3, 0],
    ],
};

// Professional era sprites (23+)
const PROFESSIONAL_SPRITES = {
    rocket: [
        [0, 0, 0, 1, 0, 0, 0],
        [0, 0, 1, 2, 1, 0, 0],
        [0, 1, 2, 3, 2, 1, 0],
        [0, 1, 2, 2, 2, 1, 0],
        [1, 1, 2, 2, 2, 1, 1],
        [1, 1, 2, 2, 2, 1, 1],
        [0, 1, 2, 2, 2, 1, 0],
        [0, 4, 0, 4, 0, 4, 0],
        [4, 0, 4, 0, 4, 0, 4],
    ],
    crown: [
        [0, 1, 0, 1, 0, 1, 0],
        [0, 1, 0, 1, 0, 1, 0],
        [1, 1, 1, 1, 1, 1, 1],
        [1, 2, 2, 2, 2, 2, 1],
        [1, 2, 3, 2, 3, 2, 1],
        [1, 2, 2, 2, 2, 2, 1],
        [1, 1, 1, 1, 1, 1, 1],
    ],
    chip: [
        [0, 1, 0, 1, 0, 1, 0, 1, 0],
        [1, 2, 2, 2, 2, 2, 2, 2, 1],
        [0, 2, 3, 3, 3, 3, 3, 2, 0],
        [1, 2, 3, 4, 3, 4, 3, 2, 1],
        [0, 2, 3, 3, 3, 3, 3, 2, 0],
        [1, 2, 3, 4, 3, 4, 3, 2, 1],
        [0, 2, 3, 3, 3, 3, 3, 2, 0],
        [1, 2, 2, 2, 2, 2, 2, 2, 1],
        [0, 1, 0, 1, 0, 1, 0, 1, 0],
    ],
};

// Get sprites for an era
function getSpritesForStage(stage: keyof typeof ERA_PALETTES) {
    switch (stage) {
        case "baby": return Object.values(BABY_SPRITES);
        case "toddler": return Object.values(TODDLER_SPRITES);
        case "child": return Object.values(CHILD_SPRITES);
        case "teen": return Object.values(TEEN_SPRITES);
        case "adult": return Object.values(ADULT_SPRITES);
        case "professional": return Object.values(PROFESSIONAL_SPRITES);
    }
}

// ==============================================
// PIXEL SPRITE RENDERER
// ==============================================
function PixelSprite({
    sprite,
    palette,
    x,
    y,
    scale = 1,
    opacity = 1,
    animate = false,
    delay = 0,
}: {
    sprite: number[][];
    palette: typeof ERA_PALETTES[keyof typeof ERA_PALETTES];
    x: number;
    y: number;
    scale?: number;
    opacity?: number;
    animate?: boolean;
    delay?: number;
}) {
    const colors: Record<number, string> = {
        0: "transparent",
        1: palette.dark,
        2: palette.primary,
        3: palette.secondary,
        4: palette.accent,
    };

    const size = PIXEL_SIZE * scale;

    return (
        <motion.div
            className="absolute pointer-events-none"
            style={{
                left: x,
                top: y,
            }}
            initial={animate ? { opacity: 0, y: 10, scale: 0.8 } : undefined}
            animate={animate ? {
                opacity: opacity,
                y: [0, -5, 0],
                scale: 1,
            } : { opacity }}
            transition={animate ? {
                opacity: { duration: 0.5, delay },
                y: { duration: 3 + Math.random() * 2, repeat: Infinity, ease: "easeInOut", delay },
                scale: { duration: 0.3, delay },
            } : undefined}
        >
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${sprite[0].length}, ${size}px)`,
                    gridTemplateRows: `repeat(${sprite.length}, ${size}px)`,
                    imageRendering: "pixelated",
                }}
            >
                {sprite.flat().map((val, i) => (
                    <div
                        key={i}
                        style={{
                            width: size,
                            height: size,
                            backgroundColor: colors[val] || "transparent",
                        }}
                    />
                ))}
            </div>
        </motion.div>
    );
}

// ==============================================
// DECORATIVE FLOATING PIXELS
// ==============================================
function FloatingPixels({
    palette,
    count = 20,
    progress,
}: {
    palette: typeof ERA_PALETTES[keyof typeof ERA_PALETTES];
    count?: number;
    progress: number;
}) {
    const pixels = useMemo(() => {
        return Array.from({ length: count }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 70,
            size: 2 + Math.random() * 6,
            color: [palette.primary, palette.secondary, palette.accent][i % 3],
            delay: Math.random() * 5,
            duration: 4 + Math.random() * 4,
        }));
    }, [palette, count]);

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {pixels.map((pixel) => (
                <motion.div
                    key={pixel.id}
                    className="absolute"
                    style={{
                        left: `${pixel.x}%`,
                        top: `${pixel.y}%`,
                        width: pixel.size,
                        height: pixel.size,
                        backgroundColor: pixel.color,
                        opacity: 0.3 + progress * 0.2,
                    }}
                    animate={{
                        y: [0, -20, 0],
                        opacity: [0.2, 0.5, 0.2],
                    }}
                    transition={{
                        duration: pixel.duration,
                        delay: pixel.delay,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />
            ))}
        </div>
    );
}

// ==============================================
// PIXEL GRID LINES (MATRIX STYLE)
// ==============================================
function PixelGridLines({
    palette,
    progress,
}: {
    palette: typeof ERA_PALETTES[keyof typeof ERA_PALETTES];
    progress: number;
}) {
    const gridOpacity = 0.05 + progress * 0.05;

    return (
        <div
            className="absolute inset-0 pointer-events-none"
            style={{
                backgroundImage: `
                    linear-gradient(${palette.primary}10 1px, transparent 1px),
                    linear-gradient(90deg, ${palette.primary}10 1px, transparent 1px)
                `,
                backgroundSize: "32px 32px",
                opacity: gridOpacity,
            }}
        />
    );
}

// ==============================================
// GROUND SCENERY (BUILDINGS, TREES, ETC.)
// ==============================================
function GroundScenery({
    stage,
    palette,
    worldWidth,
}: {
    stage: keyof typeof ERA_PALETTES;
    palette: typeof ERA_PALETTES[keyof typeof ERA_PALETTES];
    worldWidth: number;
}) {
    const elements = useMemo(() => {
        const count = Math.ceil(worldWidth / 150);
        return Array.from({ length: count }, (_, i) => {
            const seed = i * 137.5;
            return {
                id: i,
                x: 50 + i * 150 + (Math.sin(seed) * 30),
                type: i % 3,
                height: 40 + (Math.sin(seed * 2) + 1) * 30,
                width: 20 + (Math.cos(seed) + 1) * 15,
            };
        });
    }, [worldWidth]);

    const renderElement = useCallback((el: typeof elements[0]) => {
        const baseStyle = {
            position: "absolute" as const,
            bottom: 0,
            left: el.x,
            imageRendering: "pixelated" as const,
        };

        // Different elements based on stage
        if (stage === "baby" || stage === "toddler") {
            // Rounded house/toy block
            return (
                <div key={el.id} style={{ ...baseStyle }}>
                    <div
                        style={{
                            width: el.width,
                            height: el.height,
                            backgroundColor: palette.primary,
                            opacity: 0.3,
                            border: `2px solid ${palette.dark}40`,
                        }}
                    >
                        {/* Window */}
                        <div
                            style={{
                                width: el.width * 0.4,
                                height: el.width * 0.4,
                                backgroundColor: palette.accent,
                                opacity: 0.5,
                                margin: "auto",
                                marginTop: el.height * 0.2,
                            }}
                        />
                    </div>
                </div>
            );
        }

        if (stage === "child") {
            // School building
            return (
                <div key={el.id} style={{ ...baseStyle }}>
                    <div
                        style={{
                            width: el.width * 1.5,
                            height: el.height * 1.2,
                            backgroundColor: palette.primary,
                            opacity: 0.25,
                            border: `2px solid ${palette.dark}30`,
                        }}
                    >
                        {/* Windows grid */}
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(3, 1fr)",
                                gridTemplateRows: "repeat(2, 1fr)",
                                gap: 2,
                                padding: 4,
                                height: "80%",
                            }}
                        >
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div
                                    key={i}
                                    style={{
                                        backgroundColor: i % 2 === 0 ? palette.accent : palette.secondary,
                                        opacity: 0.4,
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            );
        }

        if (stage === "teen") {
            // Tech tower / antenna
            return (
                <div key={el.id} style={{ ...baseStyle }}>
                    <div className="flex flex-col items-center">
                        <motion.div
                            style={{
                                width: 4,
                                height: 4,
                                backgroundColor: palette.accent,
                                borderRadius: "50%",
                            }}
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 1, repeat: Infinity }}
                        />
                        <div
                            style={{
                                width: 2,
                                height: el.height,
                                backgroundColor: palette.primary,
                                opacity: 0.3,
                            }}
                        />
                    </div>
                </div>
            );
        }

        // Adult/Professional - Modern buildings
        return (
            <div key={el.id} style={{ ...baseStyle }}>
                <div
                    style={{
                        width: el.width,
                        height: el.height * 1.5,
                        backgroundColor: palette.primary,
                        opacity: 0.2,
                        border: `1px solid ${palette.accent}30`,
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                        padding: 2,
                    }}
                >
                    {Array.from({ length: Math.floor(el.height / 10) }).map((_, i) => (
                        <motion.div
                            key={i}
                            style={{
                                height: 4,
                                backgroundColor: palette.accent,
                                opacity: 0.3,
                            }}
                            animate={{ opacity: [0.2, 0.4, 0.2] }}
                            transition={{ duration: 2, delay: i * 0.2, repeat: Infinity }}
                        />
                    ))}
                </div>
            </div>
        );
    }, [stage, palette]);

    return (
        <div className="absolute bottom-0 left-0 right-0 h-40 overflow-visible">
            {elements.map(renderElement)}
        </div>
    );
}

// ==============================================
// STORY SYMBOLS - LARGE DECORATIVE SPRITES
// ==============================================
function StorySymbols({
    stage,
    palette,
    progress,
}: {
    stage: keyof typeof ERA_PALETTES;
    palette: typeof ERA_PALETTES[keyof typeof ERA_PALETTES];
    progress: number;
}) {
    const sprites = getSpritesForStage(stage);
    const [dimensions, setDimensions] = useState({ width: 1200, height: 600 });

    useEffect(() => {
        const updateDimensions = () => {
            setDimensions({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };
        updateDimensions();
        window.addEventListener("resize", updateDimensions, { passive: true });
        return () => window.removeEventListener("resize", updateDimensions);
    }, []);

    const positions = useMemo(() => {
        return sprites.map((sprite, i) => {
            const seed = i * 73 + progress * 10;
            return {
                sprite,
                x: dimensions.width * 0.1 + (i * dimensions.width * 0.25) + Math.sin(seed) * 50,
                y: dimensions.height * 0.1 + Math.cos(seed) * 30 + i * 15,
                scale: 1.5 + Math.sin(i) * 0.5,
                delay: i * 0.3,
            };
        });
    }, [sprites, dimensions, progress]);

    return (
        <div className="absolute inset-0 pointer-events-none z-5">
            {positions.map((pos, i) => (
                <PixelSprite
                    key={i}
                    sprite={pos.sprite}
                    palette={palette}
                    x={pos.x}
                    y={pos.y}
                    scale={pos.scale}
                    opacity={0.4 + progress * 0.3}
                    animate
                    delay={pos.delay}
                />
            ))}
        </div>
    );
}

// ==============================================
// PARALLAX MOUNTAIN LAYERS
// ==============================================
function ParallaxMountains({
    palette,
    progress,
}: {
    palette: typeof ERA_PALETTES[keyof typeof ERA_PALETTES];
    progress: number;
}) {
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* Far mountains */}
            <div
                className="absolute bottom-0 left-0 right-0 h-40"
                style={{
                    background: `linear-gradient(180deg, 
                        transparent 0%, 
                        ${palette.dark}15 30%, 
                        ${palette.dark}25 100%
                    )`,
                    clipPath: "polygon(0% 100%, 0% 60%, 5% 55%, 15% 70%, 25% 45%, 35% 65%, 45% 40%, 55% 55%, 65% 35%, 75% 50%, 85% 40%, 95% 55%, 100% 45%, 100% 100%)",
                    transform: `translateX(${-progress * 20}px)`,
                    transition: "transform 0.3s ease-out",
                }}
            />

            {/* Mid mountains */}
            <div
                className="absolute bottom-0 left-0 right-0 h-32"
                style={{
                    background: `linear-gradient(180deg, 
                        transparent 0%, 
                        ${palette.primary}10 40%, 
                        ${palette.primary}20 100%
                    )`,
                    clipPath: "polygon(0% 100%, 0% 70%, 10% 55%, 20% 65%, 30% 50%, 40% 60%, 50% 45%, 60% 55%, 70% 40%, 80% 55%, 90% 50%, 100% 60%, 100% 100%)",
                    transform: `translateX(${-progress * 40}px)`,
                    transition: "transform 0.3s ease-out",
                }}
            />
        </div>
    );
}

// ==============================================
// SCANLINE OVERLAY
// ==============================================
function ScanlineOverlay({
    palette,
    intensity = 0.03,
}: {
    palette: typeof ERA_PALETTES[keyof typeof ERA_PALETTES];
    intensity?: number;
}) {
    return (
        <div
            className="absolute inset-0 pointer-events-none"
            style={{
                backgroundImage: `repeating-linear-gradient(
                    0deg,
                    transparent,
                    transparent 2px,
                    ${palette.dark}${Math.round(intensity * 255).toString(16).padStart(2, '0')} 2px,
                    ${palette.dark}${Math.round(intensity * 255).toString(16).padStart(2, '0')} 4px
                )`,
                opacity: 0.5,
            }}
        />
    );
}

// ==============================================
// DITHERING PATTERN FOR RETRO FEEL
// ==============================================
function DitheringPattern({
    palette,
}: {
    palette: typeof ERA_PALETTES[keyof typeof ERA_PALETTES];
}) {
    return (
        <div
            className="absolute inset-0 pointer-events-none mix-blend-overlay"
            style={{
                backgroundImage: `
                    radial-gradient(circle at 25% 25%, ${palette.primary}08 0%, transparent 50%),
                    radial-gradient(circle at 75% 75%, ${palette.secondary}08 0%, transparent 50%),
                    radial-gradient(circle at 50% 10%, ${palette.accent}05 0%, transparent 40%)
                `,
                opacity: 0.8,
            }}
        />
    );
}

// ==============================================
// MAIN COMPONENT
// ==============================================
export function PixelStoryBackground({
    age,
    year,
    levelProgress,
    className = "",
}: PixelStoryBackgroundProps) {
    const stage = getStageFromAge(age);
    const palette = ERA_PALETTES[stage];

    return (
        <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
            {/* Subtle overlay gradient that blends with PixelSkyGrid */}
            <div
                className="absolute inset-0"
                style={{
                    background: `linear-gradient(180deg, 
                        transparent 0%, 
                        ${palette.bg[1]}20 30%,
                        ${palette.bg[2]}40 70%,
                        ${palette.bg[2]}60 100%
                    )`,
                }}
            />

            {/* Dithering pattern for retro depth */}
            <DitheringPattern palette={palette} />

            {/* Pixel grid lines */}
            <PixelGridLines palette={palette} progress={levelProgress} />

            {/* Scanline overlay for CRT effect */}
            <ScanlineOverlay palette={palette} intensity={0.02} />

            {/* Parallax mountains */}
            <ParallaxMountains palette={palette} progress={levelProgress} />

            {/* Floating decorative pixels */}
            <FloatingPixels palette={palette} count={30} progress={levelProgress} />

            {/* Story symbols - Large pixel sprites */}
            <StorySymbols stage={stage} palette={palette} progress={levelProgress} />

            {/* Ground scenery elements */}
            <GroundScenery stage={stage} palette={palette} worldWidth={2000} />

            {/* Vignette effect */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: `radial-gradient(ellipse at center, 
                        transparent 40%, 
                        ${palette.bg[0]}60 100%
                    )`,
                }}
            />

            {/* Era indicator with pixel border */}
            <div
                className="absolute top-24 left-4 font-mono text-xs z-10"
                style={{ color: palette.accent }}
            >
                <div
                    className="flex items-center gap-2 px-2 py-1"
                    style={{
                        backgroundColor: `${palette.bg[0]}80`,
                        border: `2px solid ${palette.primary}40`,
                    }}
                >
                    <div
                        style={{
                            width: 8,
                            height: 8,
                            backgroundColor: palette.primary,
                        }}
                    />
                    <span className="opacity-60">{year}</span>
                </div>
            </div>
        </div>
    );
}
