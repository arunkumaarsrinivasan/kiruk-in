"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useState, useEffect, useRef, useCallback } from "react";

interface Skill {
    id: string;
    name: string;
    level: "beginner" | "intermediate" | "advanced" | "expert";
    category: string;
}

interface PixelSkyGridProps {
    levelProgress: number; // 0-1, progress within current level
    className?: string;
    skills?: Skill[];
    onStarClick?: (skillId: string) => void;
    currentYear?: number;
}

// Grid configuration
const PIXEL_SIZE = 16;

// Simplified sky palettes - clean gradients
const getSkyColors = (progress: number) => {
    if (progress < 0.25) {
        // Dawn to Morning
        return {
            sky: ["#1a0f25", "#221530", "#2a1a3a", "#321f45"],
            horizon: ["#3a2550", "#452d5a", "#503565"],
        };
    } else if (progress < 0.50) {
        // Day
        return {
            sky: ["#12101f", "#181528", "#1e1a32", "#241f3c"],
            horizon: ["#2a2548", "#302a52", "#362f5c"],
        };
    } else if (progress < 0.75) {
        // Dusk
        return {
            sky: ["#0e0a18", "#120e20", "#161228", "#1a1630"],
            horizon: ["#1e1a38", "#221e42", "#26224c"],
        };
    } else {
        // Night
        return {
            sky: ["#06050a", "#08070e", "#0a0912", "#0c0b16"],
            horizon: ["#0e0d1a", "#100f1e", "#121122"],
        };
    }
};

// Parse hex to RGB
function hexToRgb(hex: string): [number, number, number] {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
        : [0, 0, 0];
}

// Calculate position on arc - TALLER arc (half horizontal screen)
function getArcPosition(progress: number, width: number, height: number) {
    const angle = Math.PI * progress;
    const centerX = width / 2;
    const centerY = height + 20;
    // Make arc height half the screen width for taller arc
    const radiusX = width * 0.45;
    const radiusY = width * 0.5; // Taller arc

    return {
        x: centerX - radiusX * Math.cos(angle),
        y: centerY - radiusY * Math.sin(angle),
    };
}

// Skill level colors
const LEVEL_COLORS: Record<string, { bg: string; glow: string }> = {
    beginner: { bg: "#666688", glow: "#666688" },
    intermediate: { bg: "#aaaacc", glow: "#aaaacc" },
    advanced: { bg: "#ffcc66", glow: "#ffcc66" },
    expert: { bg: "#ffffff", glow: "#ffff99" },
};

// Category colors
const CATEGORY_COLORS: Record<string, string> = {
    design: "#ff88cc",
    development: "#88ccff",
    leadership: "#ffcc88",
    tools: "#88ffcc",
    infrastructure: "#cc88ff",
    default: "#aaaacc",
};

// Pixel Sun component
function PixelSun({
    x,
    y,
    visible,
    progress
}: {
    x: number;
    y: number;
    visible: boolean;
    progress: number;
}) {
    if (!visible) return null;

    const scale = 0.8 + Math.sin(progress * Math.PI) * 0.3;
    const size = PIXEL_SIZE;

    // Sun pattern: 9x9
    const sunPattern = [
        [0, 0, 0, 0, 1, 0, 0, 0, 0],
        [0, 0, 0, 1, 2, 1, 0, 0, 0],
        [0, 0, 2, 2, 3, 2, 2, 0, 0],
        [0, 1, 2, 3, 4, 3, 2, 1, 0],
        [1, 2, 3, 4, 4, 4, 3, 2, 1],
        [0, 1, 2, 3, 4, 3, 2, 1, 0],
        [0, 0, 2, 2, 3, 2, 2, 0, 0],
        [0, 0, 0, 1, 2, 1, 0, 0, 0],
        [0, 0, 0, 0, 1, 0, 0, 0, 0],
    ];

    const colors: Record<number, string> = {
        0: "transparent",
        1: "#ff9944",
        2: "#ffbb55",
        3: "#ffdd77",
        4: "#fffef0",
    };

    return (
        <motion.div
            className="absolute pointer-events-none"
            style={{
                left: x,
                top: y,
                transform: "translate(-50%, -50%)",
            }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale }}
            transition={{ duration: 0.8 }}
        >
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(9, ${size}px)`,
                    gridTemplateRows: `repeat(9, ${size}px)`,
                }}
            >
                {sunPattern.flat().map((val, i) => (
                    <div
                        key={i}
                        style={{
                            width: size,
                            height: size,
                            backgroundColor: colors[val],
                        }}
                    />
                ))}
            </div>
        </motion.div>
    );
}

// Pixel Moon component with phases
function PixelMoon({
    x,
    y,
    visible,
    phase
}: {
    x: number;
    y: number;
    visible: boolean;
    phase: "full" | "half" | "crescent";
}) {
    if (!visible) return null;

    const size = PIXEL_SIZE;

    const moonPatterns = {
        full: [
            [0, 0, 0, 1, 1, 1, 0, 0, 0],
            [0, 0, 1, 2, 2, 2, 1, 0, 0],
            [0, 1, 2, 3, 2, 3, 2, 1, 0],
            [1, 2, 3, 3, 3, 2, 3, 2, 1],
            [1, 2, 2, 3, 3, 3, 2, 2, 1],
            [1, 2, 3, 2, 3, 3, 2, 2, 1],
            [0, 1, 2, 3, 2, 2, 2, 1, 0],
            [0, 0, 1, 2, 2, 2, 1, 0, 0],
            [0, 0, 0, 1, 1, 1, 0, 0, 0],
        ],
        half: [
            [0, 0, 0, 1, 1, 0, 0, 0, 0],
            [0, 0, 1, 2, 2, 0, 0, 0, 0],
            [0, 1, 2, 3, 2, 0, 0, 0, 0],
            [1, 2, 3, 3, 3, 0, 0, 0, 0],
            [1, 2, 2, 3, 3, 0, 0, 0, 0],
            [1, 2, 3, 2, 3, 0, 0, 0, 0],
            [0, 1, 2, 3, 2, 0, 0, 0, 0],
            [0, 0, 1, 2, 2, 0, 0, 0, 0],
            [0, 0, 0, 1, 1, 0, 0, 0, 0],
        ],
        crescent: [
            [0, 0, 0, 1, 0, 0, 0, 0, 0],
            [0, 0, 1, 2, 0, 0, 0, 0, 0],
            [0, 1, 2, 2, 0, 0, 0, 0, 0],
            [1, 2, 3, 2, 0, 0, 0, 0, 0],
            [1, 2, 2, 2, 0, 0, 0, 0, 0],
            [1, 2, 3, 2, 0, 0, 0, 0, 0],
            [0, 1, 2, 2, 0, 0, 0, 0, 0],
            [0, 0, 1, 2, 0, 0, 0, 0, 0],
            [0, 0, 0, 1, 0, 0, 0, 0, 0],
        ],
    };

    const colors: Record<number, string> = {
        0: "transparent",
        1: "#9090a0",
        2: "#c0c0d0",
        3: "#e8e8f0",
    };

    return (
        <motion.div
            className="absolute pointer-events-none"
            style={{
                left: x,
                top: y,
                transform: "translate(-50%, -50%)",
            }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 1 }}
        >
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(9, ${size}px)`,
                    gridTemplateRows: `repeat(9, ${size}px)`,
                }}
            >
                {moonPatterns[phase].flat().map((val, i) => (
                    <div
                        key={i}
                        style={{
                            width: size,
                            height: size,
                            backgroundColor: colors[val],
                        }}
                    />
                ))}
            </div>
        </motion.div>
    );
}

// Seeded random for consistent star positions
function seededRandom(seed: number) {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
}

// Star positioned in constellation
interface StarPosition {
    id: string;
    x: number;
    y: number;
    size: number;
    color: string;
    glowColor: string;
    skill: Skill;
}

// Skill Star Constellation - Interactive stars showing skills
function SkillStarConstellation({
    visible,
    screenWidth,
    screenHeight,
    progress,
    skills,
    onStarClick,
    activeSkillId,
}: {
    visible: boolean;
    screenWidth: number;
    screenHeight: number;
    progress: number;
    skills: Skill[];
    onStarClick?: (skillId: string) => void;
    activeSkillId: string | null;
}) {
    const [twinkle, setTwinkle] = useState(0);

    useEffect(() => {
        if (!visible) return;
        const interval = setInterval(() => {
            setTwinkle(t => (t + 1) % 10);
        }, 400);
        return () => clearInterval(interval);
    }, [visible]);

    // Generate star positions in organic constellation pattern
    const starPositions = useMemo((): StarPosition[] => {
        if (skills.length === 0) return [];

        const result: StarPosition[] = [];

        // Create clusters based on skill categories
        const categoryPositions: Record<string, { cx: number; cy: number }> = {
            design: { cx: screenWidth * 0.2, cy: screenHeight * 0.15 },
            development: { cx: screenWidth * 0.5, cy: screenHeight * 0.12 },
            leadership: { cx: screenWidth * 0.8, cy: screenHeight * 0.18 },
            tools: { cx: screenWidth * 0.35, cy: screenHeight * 0.28 },
            infrastructure: { cx: screenWidth * 0.65, cy: screenHeight * 0.25 },
        };

        skills.forEach((skill, idx) => {
            const categoryPos = categoryPositions[skill.category] ||
                { cx: screenWidth * 0.5, cy: screenHeight * 0.2 };

            // Scatter within category cluster
            const seed = idx * 137;
            const angle = seededRandom(seed) * Math.PI * 2;
            const dist = 40 + seededRandom(seed + 1) * 80;

            const x = categoryPos.cx + Math.cos(angle) * dist;
            const y = categoryPos.cy + Math.sin(angle) * dist;

            // Clamp to visible area
            const clampedX = Math.max(80, Math.min(screenWidth - 80, x));
            const clampedY = Math.max(60, Math.min(screenHeight * 0.45, y));

            // Size based on mastery level
            const sizeMap = {
                beginner: PIXEL_SIZE * 0.5,
                intermediate: PIXEL_SIZE * 0.7,
                advanced: PIXEL_SIZE * 0.9,
                expert: PIXEL_SIZE * 1.1,
            };

            const levelColors = LEVEL_COLORS[skill.level] || LEVEL_COLORS.intermediate;

            result.push({
                id: skill.id,
                x: clampedX,
                y: clampedY,
                size: sizeMap[skill.level],
                color: levelColors.bg,
                glowColor: levelColors.glow,
                skill,
            });
        });

        return result;
    }, [skills, screenWidth, screenHeight]);

    // Generate connections between nearby stars
    const connections = useMemo(() => {
        if (starPositions.length < 2) return [];
        const lines: Array<{ from: StarPosition; to: StarPosition }> = [];

        for (let i = 0; i < starPositions.length; i++) {
            const star = starPositions[i];

            // Find nearby stars in same category to connect
            const nearby = starPositions
                .filter((s, j) => j !== i && s.skill.category === star.skill.category)
                .map(s => ({
                    star: s,
                    dist: Math.hypot(s.x - star.x, s.y - star.y),
                }))
                .sort((a, b) => a.dist - b.dist)
                .slice(0, 2);

            for (const n of nearby) {
                const exists = lines.some(
                    l => (l.from.id === star.id && l.to.id === n.star.id) ||
                        (l.from.id === n.star.id && l.to.id === star.id)
                );
                if (!exists && n.dist < 150) {
                    lines.push({ from: star, to: n.star });
                }
            }
        }

        return lines;
    }, [starPositions]);

    if (!visible || starPositions.length === 0) return null;

    // Stars reveal progressively after moon
    const revealProgress = Math.max(0, (progress - 0.75) / 0.25);

    return (
        <div className="absolute inset-0">
            {/* Connection lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {connections.map((conn, idx) => {
                    const fromIdx = starPositions.findIndex(s => s.id === conn.from.id);
                    const toIdx = starPositions.findIndex(s => s.id === conn.to.id);
                    const fromVisible = fromIdx / starPositions.length < revealProgress + 0.3;
                    const toVisible = toIdx / starPositions.length < revealProgress + 0.3;
                    if (!fromVisible || !toVisible) return null;

                    const isHighlighted = activeSkillId === conn.from.id || activeSkillId === conn.to.id;

                    return (
                        <motion.line
                            key={`conn-${idx}`}
                            x1={conn.from.x}
                            y1={conn.from.y}
                            x2={conn.to.x}
                            y2={conn.to.y}
                            stroke={isHighlighted
                                ? CATEGORY_COLORS[conn.from.skill.category] || CATEGORY_COLORS.default
                                : "#4a4a6a"}
                            strokeWidth={isHighlighted ? 2 : 1}
                            opacity={isHighlighted ? 0.8 : 0.25}
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: isHighlighted ? 0.8 : 0.25 }}
                            transition={{ duration: 1, delay: idx * 0.1 }}
                        />
                    );
                })}
            </svg>

            {/* Stars */}
            {starPositions.map((star, idx) => {
                const shouldShow = idx / starPositions.length < revealProgress + 0.3;
                const isTwinkling = (twinkle + idx) % 5 === 0;
                const isActive = activeSkillId === star.id;
                const isConnected = activeSkillId && connections.some(
                    c => (c.from.id === star.id && c.to.id === activeSkillId) ||
                        (c.to.id === star.id && c.from.id === activeSkillId)
                );

                return (
                    <motion.div
                        key={star.id}
                        className="absolute pointer-events-auto cursor-pointer"
                        style={{
                            left: star.x,
                            top: star.y,
                            transform: "translate(-50%, -50%)",
                        }}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{
                            opacity: shouldShow ? 1 : 0,
                            scale: shouldShow ? (isActive ? 1.8 : 1) : 0,
                        }}
                        whileHover={{ scale: 1.5 }}
                        transition={{ duration: 0.5, delay: idx * 0.06 }}
                        onClick={() => onStarClick?.(star.id)}
                    >
                        {/* Star glow */}
                        <div
                            style={{
                                width: star.size * 2,
                                height: star.size * 2,
                                borderRadius: "50%",
                                backgroundColor: isActive || isConnected
                                    ? star.glowColor
                                    : (isTwinkling ? star.glowColor : "transparent"),
                                opacity: isActive ? 0.6 : (isConnected ? 0.4 : 0.3),
                                filter: `blur(${star.size}px)`,
                                position: "absolute",
                                left: "50%",
                                top: "50%",
                                transform: "translate(-50%, -50%)",
                            }}
                        />
                        {/* Star core */}
                        <div
                            style={{
                                width: star.size,
                                height: star.size,
                                backgroundColor: isTwinkling
                                    ? "#ffffff"
                                    : star.color,
                                position: "relative",
                                zIndex: 1,
                            }}
                        />
                    </motion.div>
                );
            })}

            {/* Active skill tooltip */}
            <AnimatePresence>
                {activeSkillId && (() => {
                    const activeStar = starPositions.find(s => s.id === activeSkillId);
                    if (!activeStar) return null;

                    return (
                        <motion.div
                            key="skill-tooltip"
                            className="absolute pointer-events-none z-50"
                            style={{
                                left: activeStar.x,
                                top: activeStar.y + 30,
                                transform: "translateX(-50%)",
                            }}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div
                                className="px-3 py-2 rounded-lg text-center"
                                style={{
                                    backgroundColor: "var(--bg-card)",
                                    border: `2px solid ${CATEGORY_COLORS[activeStar.skill.category] || CATEGORY_COLORS.default}`,
                                    minWidth: "120px",
                                }}
                            >
                                <div
                                    className="font-mono text-sm font-bold"
                                    style={{ color: CATEGORY_COLORS[activeStar.skill.category] || CATEGORY_COLORS.default }}
                                >
                                    {activeStar.skill.name}
                                </div>
                                <div
                                    className="text-xs mt-1 capitalize"
                                    style={{ color: LEVEL_COLORS[activeStar.skill.level].bg }}
                                >
                                    {activeStar.skill.level}
                                </div>
                                <div
                                    className="text-xs mt-1 capitalize opacity-60"
                                    style={{ color: "var(--text-muted)" }}
                                >
                                    {activeStar.skill.category}
                                </div>
                            </div>
                        </motion.div>
                    );
                })()}
            </AnimatePresence>
        </div>
    );
}

// Main Pixel Sky Grid Component
export function PixelSkyGrid({
    levelProgress,
    className = "",
    skills = [],
    onStarClick,
    currentYear,
}: PixelSkyGridProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [dimensions, setDimensions] = useState({ width: 1200, height: 600 });
    const [activeSkillId, setActiveSkillId] = useState<string | null>(null);

    useEffect(() => {
        const updateDimensions = () => {
            setDimensions({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };

        updateDimensions();
        window.addEventListener('resize', updateDimensions);
        return () => window.removeEventListener('resize', updateDimensions);
    }, []);

    const skyColors = useMemo(() => getSkyColors(levelProgress), [levelProgress]);

    // Draw clean pixel sky on canvas
    const drawSky = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const { width, height } = dimensions;
        const cols = Math.ceil(width / PIXEL_SIZE);
        const rows = Math.ceil(height / PIXEL_SIZE);

        ctx.clearRect(0, 0, width, height);

        // Draw each pixel row - clean gradient
        for (let row = 0; row < rows; row++) {
            const rowRatio = row / rows;

            let colorIndex: number;
            let palette: string[];

            if (rowRatio < 0.6) {
                colorIndex = Math.floor((rowRatio / 0.6) * skyColors.sky.length);
                palette = skyColors.sky;
            } else {
                colorIndex = Math.floor(((rowRatio - 0.6) / 0.4) * skyColors.horizon.length);
                palette = skyColors.horizon;
            }

            colorIndex = Math.min(colorIndex, palette.length - 1);
            const baseColor = hexToRgb(palette[colorIndex]);

            for (let col = 0; col < cols; col++) {
                // Subtle dithering
                const dither = ((row + col) % 2 === 0) ? 3 : -3;
                const r = Math.max(0, Math.min(255, baseColor[0] + dither));
                const g = Math.max(0, Math.min(255, baseColor[1] + dither));
                const b = Math.max(0, Math.min(255, baseColor[2] + dither));

                ctx.fillStyle = `rgb(${r},${g},${b})`;
                ctx.fillRect(col * PIXEL_SIZE, row * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
            }
        }
    }, [dimensions, skyColors]);

    useEffect(() => {
        drawSky();
    }, [drawSky]);

    // Celestial body visibility - Stars appear AFTER moon disappears
    const showSun = levelProgress < 0.35;
    const showMoon = levelProgress >= 0.30 && levelProgress < 0.75;
    const showStars = levelProgress >= 0.75; // Stars only after moon disappears

    // Sun position
    const sunProgress = Math.min(1, levelProgress / 0.35);
    const sunPos = getArcPosition(sunProgress * 0.35, dimensions.width, dimensions.height);

    // Moon position and phase
    const moonProgress = levelProgress >= 0.30
        ? Math.min(1, (levelProgress - 0.30) / 0.45)
        : 0;
    const moonArcProgress = 0.3 + moonProgress * 0.4;
    const moonPos = getArcPosition(moonArcProgress, dimensions.width, dimensions.height);
    const moonPhase: "full" | "half" | "crescent" =
        moonProgress < 0.33 ? "full" : moonProgress < 0.66 ? "half" : "crescent";

    const handleStarClick = (skillId: string) => {
        setActiveSkillId(prev => prev === skillId ? null : skillId);
        onStarClick?.(skillId);
    };

    return (
        <div className={`absolute inset-0 overflow-hidden ${className}`}>
            {/* Canvas-based pixel sky */}
            <canvas
                ref={canvasRef}
                width={dimensions.width}
                height={dimensions.height}
                className="absolute inset-0"
                style={{ width: dimensions.width, height: dimensions.height }}
            />

            {/* Pixel Sun */}
            <PixelSun
                x={sunPos.x}
                y={sunPos.y}
                visible={showSun}
                progress={sunProgress}
            />

            {/* Pixel Moon */}
            <AnimatePresence>
                {showMoon && (
                    <PixelMoon
                        x={moonPos.x}
                        y={moonPos.y}
                        visible={showMoon}
                        phase={moonPhase}
                    />
                )}
            </AnimatePresence>

            {/* Interactive Skill Stars - Appear after moon */}
            <SkillStarConstellation
                visible={showStars}
                screenWidth={dimensions.width}
                screenHeight={dimensions.height}
                progress={levelProgress}
                skills={skills}
                onStarClick={handleStarClick}
                activeSkillId={activeSkillId}
            />

            {/* Current Year indicator */}
            {currentYear && (
                <div
                    className="absolute top-4 right-4 font-mono text-sm px-3 py-1"
                    style={{
                        backgroundColor: "var(--bg-card)",
                        border: "1px solid var(--border-color)",
                        color: "var(--accent-color)",
                    }}
                >
                    {currentYear}
                </div>
            )}
        </div>
    );
}
