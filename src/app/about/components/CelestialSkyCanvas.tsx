"use client";

import { motion } from "framer-motion";
import { useMemo, useRef, useEffect, useState } from "react";

interface CelestialSkyCanvasProps {
    levelProgress: number; // 0-1, progress within current level
    className?: string;
}

// Calculate position on full-screen arc (bottom-left → top-center → bottom-right)
function getFullScreenArcPosition(progress: number, width: number, height: number) {
    // Semi-circle arc that spans the full viewport
    // progress 0 = bottom-left, 0.5 = top-center, 1 = bottom-right
    const angle = Math.PI * progress; // 0 to PI (left to right)

    // Arc center at bottom-center of screen
    const centerX = width / 2;
    const centerY = height + 50; // Slightly below bottom edge

    // Radius to reach top of screen at peak
    const radiusX = width / 2 + 100; // Wider than screen
    const radiusY = height + 100; // Tall enough to go above screen

    const x = centerX - radiusX * Math.cos(angle);
    const y = centerY - radiusY * Math.sin(angle);

    return { x, y };
}

// ═══════════════════════════════════════════════════════════════════════════════
// SHADER-STYLE SUN - Canvas 2D with procedural effects
// ═══════════════════════════════════════════════════════════════════════════════

function ShaderSun({ progress, visible, screenWidth, screenHeight }: {
    progress: number;
    visible: boolean;
    screenWidth: number;
    screenHeight: number;
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const frameRef = useRef(0);
    const [time, setTime] = useState(0);

    const pos = getFullScreenArcPosition(progress * 0.35, screenWidth, screenHeight);

    // Animation loop for shader effects - slower for subtlety
    useEffect(() => {
        if (!visible) return;

        const animate = () => {
            setTime(t => t + 0.008); // Slower animation
            frameRef.current = requestAnimationFrame(animate);
        };
        frameRef.current = requestAnimationFrame(animate);

        return () => cancelAnimationFrame(frameRef.current);
    }, [visible]);

    // Draw sun with SUBTLE shader-like effects
    useEffect(() => {
        if (!visible || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const size = 300; // Larger canvas for softer glow spread
        const center = size / 2;
        const bodyRadius = 25; // Smaller sun body

        ctx.clearRect(0, 0, size, size);

        // Very soft outer atmospheric glow - blends with sky
        for (let i = 25; i > 0; i--) {
            const radius = bodyRadius + i * 5;
            // Very gentle alpha for atmospheric blending
            const alpha = 0.015 * (1 - i / 25) + Math.sin(time * 0.3 + i * 0.2) * 0.003;

            const gradient = ctx.createRadialGradient(center, center, bodyRadius * 0.5, center, center, radius);
            gradient.addColorStop(0, `rgba(255, 220, 150, ${alpha * 1.5})`);
            gradient.addColorStop(0.4, `rgba(255, 180, 100, ${alpha * 0.8})`);
            gradient.addColorStop(0.7, `rgba(255, 140, 80, ${alpha * 0.4})`);
            gradient.addColorStop(1, 'rgba(255, 100, 50, 0)');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(center, center, radius, 0, Math.PI * 2);
            ctx.fill();
        }

        // Subtle rays - much softer
        ctx.save();
        ctx.translate(center, center);
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2 + time * 0.15;
            const rayLength = 30 + Math.sin(time * 1.5 + i * 0.6) * 10;
            const rayWidth = 2 + Math.sin(time * 2 + i * 1.0) * 1;

            ctx.save();
            ctx.rotate(angle);

            const rayGradient = ctx.createLinearGradient(bodyRadius, 0, bodyRadius + rayLength, 0);
            rayGradient.addColorStop(0, 'rgba(255, 230, 160, 0.25)');
            rayGradient.addColorStop(0.5, 'rgba(255, 200, 120, 0.12)');
            rayGradient.addColorStop(1, 'rgba(255, 180, 100, 0)');

            ctx.fillStyle = rayGradient;
            ctx.beginPath();
            ctx.moveTo(bodyRadius, -rayWidth / 2);
            ctx.lineTo(bodyRadius + rayLength, 0);
            ctx.lineTo(bodyRadius, rayWidth / 2);
            ctx.closePath();
            ctx.fill();

            ctx.restore();
        }
        ctx.restore();

        // Main sun body - softer, more ethereal
        const bodyGradient = ctx.createRadialGradient(
            center - 5, center - 5, 0,
            center, center, bodyRadius
        );
        bodyGradient.addColorStop(0, 'rgba(255, 253, 245, 0.9)');
        bodyGradient.addColorStop(0.3, 'rgba(255, 240, 200, 0.85)');
        bodyGradient.addColorStop(0.6, 'rgba(255, 210, 150, 0.75)');
        bodyGradient.addColorStop(0.85, 'rgba(255, 180, 120, 0.6)');
        bodyGradient.addColorStop(1, 'rgba(255, 150, 100, 0.4)');

        ctx.fillStyle = bodyGradient;
        ctx.beginPath();
        ctx.arc(center, center, bodyRadius, 0, Math.PI * 2);
        ctx.fill();

        // Very subtle surface shimmer
        for (let i = 0; i < 3; i++) {
            const spotAngle = time * 0.08 + i * 2.1;
            const spotDist = 8 + Math.sin(i * 2.5) * 5;
            const spotX = center + Math.cos(spotAngle) * spotDist;
            const spotY = center + Math.sin(spotAngle) * spotDist;
            const spotSize = 2 + Math.sin(time + i) * 1;

            ctx.fillStyle = `rgba(255, 255, 220, ${0.15 + Math.sin(time + i) * 0.05})`;
            ctx.beginPath();
            ctx.arc(spotX, spotY, spotSize, 0, Math.PI * 2);
            ctx.fill();
        }

    }, [visible, time]);

    if (!visible) return null;

    return (
        <motion.div
            className="absolute pointer-events-none"
            style={{
                left: pos.x,
                top: pos.y,
                transform: "translate(-50%, -50%)",
                mixBlendMode: "screen", // Better sky blending
                filter: "blur(0.5px)", // Slight softening
            }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 0.85, scale: 1 }} // Reduced max opacity
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
        >
            <canvas
                ref={canvasRef}
                width={300}
                height={300}
                style={{ width: 180, height: 180 }} // Scaled down display
            />
        </motion.div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SHADER-STYLE MOON - Canvas 2D with procedural crater patterns - SUBTLE
// ═══════════════════════════════════════════════════════════════════════════════

function ShaderMoon({
    progress,
    visible,
    phase,
    screenWidth,
    screenHeight
}: {
    progress: number;
    visible: boolean;
    phase: "full" | "half" | "crescent";
    screenWidth: number;
    screenHeight: number;
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [time, setTime] = useState(0);
    const frameRef = useRef(0);

    // Moon appears in middle portion of arc (0.30 - 0.75 mapped to 0.3 - 0.7 of arc)
    const arcProgress = 0.3 + progress * 0.4;
    const pos = getFullScreenArcPosition(arcProgress, screenWidth, screenHeight);

    // Very subtle animation
    useEffect(() => {
        if (!visible) return;

        const animate = () => {
            setTime(t => t + 0.005); // Even slower for subtlety
            frameRef.current = requestAnimationFrame(animate);
        };
        frameRef.current = requestAnimationFrame(animate);

        return () => cancelAnimationFrame(frameRef.current);
    }, [visible]);

    // Draw moon with SUBTLE shader-like effects
    useEffect(() => {
        if (!visible || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const size = 200;
        const center = size / 2;
        const radius = 28; // Smaller moon

        ctx.clearRect(0, 0, size, size);

        // Very soft outer atmospheric glow - blends with night sky
        for (let i = 20; i > 0; i--) {
            const glowRadius = radius + i * 4;
            // Very gentle alpha for atmospheric blending
            const alpha = 0.008 * (1 - i / 20) + Math.sin(time * 0.3 + i * 0.15) * 0.002;

            const gradient = ctx.createRadialGradient(center, center, radius * 0.6, center, center, glowRadius);
            gradient.addColorStop(0, `rgba(200, 220, 255, ${alpha * 2})`);
            gradient.addColorStop(0.4, `rgba(180, 200, 245, ${alpha})`);
            gradient.addColorStop(0.7, `rgba(150, 175, 220, ${alpha * 0.5})`);
            gradient.addColorStop(1, 'rgba(130, 160, 200, 0)');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(center, center, glowRadius, 0, Math.PI * 2);
            ctx.fill();
        }

        // Moon base - softer, more ethereal
        const moonGradient = ctx.createRadialGradient(
            center - 5, center - 5, 0,
            center, center, radius
        );
        moonGradient.addColorStop(0, 'rgba(245, 248, 255, 0.85)');
        moonGradient.addColorStop(0.3, 'rgba(230, 235, 245, 0.8)');
        moonGradient.addColorStop(0.6, 'rgba(200, 210, 225, 0.7)');
        moonGradient.addColorStop(1, 'rgba(160, 175, 195, 0.5)');

        ctx.fillStyle = moonGradient;
        ctx.beginPath();
        ctx.arc(center, center, radius, 0, Math.PI * 2);
        ctx.fill();

        // Subtle procedural craters - softer
        const craters = [
            { x: -8, y: -6, r: 6, depth: 0.15 },
            { x: 9, y: -9, r: 4, depth: 0.1 },
            { x: -4, y: 11, r: 5, depth: 0.12 },
            { x: 6, y: 6, r: 3, depth: 0.08 },
        ];

        craters.forEach(crater => {
            const craterGradient = ctx.createRadialGradient(
                center + crater.x - 1, center + crater.y - 1, 0,
                center + crater.x, center + crater.y, crater.r
            );
            craterGradient.addColorStop(0, `rgba(150, 160, 175, ${crater.depth})`);
            craterGradient.addColorStop(0.6, `rgba(130, 140, 155, ${crater.depth * 0.4})`);
            craterGradient.addColorStop(1, 'rgba(110, 120, 135, 0)');

            ctx.fillStyle = craterGradient;
            ctx.beginPath();
            ctx.arc(center + crater.x, center + crater.y, crater.r, 0, Math.PI * 2);
            ctx.fill();
        });

        // Phase shadow overlay - softer edges
        if (phase === 'half' || phase === 'crescent') {
            ctx.save();
            ctx.beginPath();
            ctx.arc(center, center, radius, 0, Math.PI * 2);
            ctx.clip();

            const shadowWidth = phase === 'crescent' ? radius * 1.5 : radius * 0.9;
            const shadowGradient = ctx.createLinearGradient(
                center + radius - shadowWidth, center,
                center + radius, center
            );
            shadowGradient.addColorStop(0, 'rgba(0, 0, 20, 0)');
            shadowGradient.addColorStop(0.4, 'rgba(0, 0, 20, 0.5)');
            shadowGradient.addColorStop(1, 'rgba(0, 0, 20, 0.8)');

            ctx.fillStyle = shadowGradient;
            ctx.fillRect(center - radius, center - radius, radius * 2, radius * 2);
            ctx.restore();
        }

    }, [visible, time, phase]);

    if (!visible) return null;

    return (
        <motion.div
            className="absolute pointer-events-none"
            style={{
                left: pos.x,
                top: pos.y,
                transform: "translate(-50%, -50%)",
                mixBlendMode: "screen", // Better sky blending
                filter: "blur(0.3px)", // Subtle softening
            }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 0.75, scale: 1 }} // Reduced opacity
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
        >
            <canvas
                ref={canvasRef}
                width={200}
                height={200}
                style={{ width: 140, height: 140 }} // Scaled down
            />
        </motion.div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SHADER-STYLE STARS - Canvas 2D with procedural twinkling
// ═══════════════════════════════════════════════════════════════════════════════

function ShaderStars({
    visible,
    progress,
    screenWidth,
    screenHeight
}: {
    visible: boolean;
    progress: number;
    screenWidth: number;
    screenHeight: number;
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [time, setTime] = useState(0);
    const frameRef = useRef(0);

    // Stars spread across the arc path (0.65 - 1.0 of progress)
    const starProgress = (progress - 0.65) / 0.35; // 0 to 1 within star phase

    // Generate procedural star positions along the arc
    const stars = useMemo(() => {
        const result = [];
        const starCount = 25;

        for (let i = 0; i < starCount; i++) {
            // Distribute stars along the arc from 0.6 to 1.0
            const arcPos = 0.6 + (i / starCount) * 0.4;
            const pos = getFullScreenArcPosition(arcPos, screenWidth, screenHeight);

            // Add some random offset
            const offsetX = (Math.sin(i * 7.3) * 0.5 + 0.5 - 0.5) * 200;
            const offsetY = (Math.cos(i * 5.7) * 0.5 + 0.5 - 0.5) * 150 - 50;

            result.push({
                x: pos.x + offsetX,
                y: pos.y + offsetY,
                size: 2 + Math.abs(Math.sin(i * 3.14)) * 5,
                brightness: 0.5 + Math.abs(Math.cos(i * 2.71)) * 0.5,
                twinkleSpeed: 1 + Math.abs(Math.sin(i * 1.41)) * 2,
                twinkleOffset: i * 0.7,
                delay: i * 0.08,
            });
        }
        return result;
    }, [screenWidth, screenHeight]);

    // Animation loop
    useEffect(() => {
        if (!visible) return;

        const animate = () => {
            setTime(t => t + 0.03);
            frameRef.current = requestAnimationFrame(animate);
        };
        frameRef.current = requestAnimationFrame(animate);

        return () => cancelAnimationFrame(frameRef.current);
    }, [visible]);

    // Draw stars
    useEffect(() => {
        if (!visible || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, screenWidth, screenHeight);

        stars.forEach((star, idx) => {
            // Only show stars that should be visible based on progress
            const starRevealProgress = starProgress * stars.length;
            if (idx > starRevealProgress + 5) return;

            const appearAlpha = Math.min(1, (starRevealProgress - idx + 5) / 5);

            // Twinkling effect
            const twinkle = Math.sin(time * star.twinkleSpeed + star.twinkleOffset);
            const brightness = star.brightness * (0.7 + twinkle * 0.3) * appearAlpha;
            const size = star.size * (0.9 + twinkle * 0.1);

            // Star glow
            if (star.size > 4) {
                const glowGradient = ctx.createRadialGradient(
                    star.x, star.y, 0,
                    star.x, star.y, size * 4
                );
                glowGradient.addColorStop(0, `rgba(255, 255, 255, ${brightness * 0.4})`);
                glowGradient.addColorStop(0.5, `rgba(200, 220, 255, ${brightness * 0.15})`);
                glowGradient.addColorStop(1, 'rgba(150, 180, 255, 0)');

                ctx.fillStyle = glowGradient;
                ctx.beginPath();
                ctx.arc(star.x, star.y, size * 4, 0, Math.PI * 2);
                ctx.fill();
            }

            // Star core
            const coreGradient = ctx.createRadialGradient(
                star.x, star.y, 0,
                star.x, star.y, size
            );
            coreGradient.addColorStop(0, `rgba(255, 255, 255, ${brightness})`);
            coreGradient.addColorStop(0.5, `rgba(255, 250, 240, ${brightness * 0.8})`);
            coreGradient.addColorStop(1, `rgba(255, 245, 200, ${brightness * 0.3})`);

            ctx.fillStyle = coreGradient;
            ctx.beginPath();
            ctx.arc(star.x, star.y, size, 0, Math.PI * 2);
            ctx.fill();

            // Cross sparkle for larger stars
            if (star.size > 4 && brightness > 0.6) {
                ctx.strokeStyle = `rgba(255, 255, 255, ${brightness * 0.5})`;
                ctx.lineWidth = 1;

                const sparkleSize = size * 2;
                ctx.beginPath();
                ctx.moveTo(star.x - sparkleSize, star.y);
                ctx.lineTo(star.x + sparkleSize, star.y);
                ctx.moveTo(star.x, star.y - sparkleSize);
                ctx.lineTo(star.x, star.y + sparkleSize);
                ctx.stroke();
            }
        });

        // Constellation lines (connecting bright stars)
        const brightStars = stars.filter(s => s.size > 5);
        if (brightStars.length >= 2 && starProgress > 0.3) {
            ctx.strokeStyle = `rgba(255, 255, 255, ${Math.min(0.3, (starProgress - 0.3) * 0.5)})`;
            ctx.lineWidth = 1;
            ctx.setLineDash([5, 10]);

            ctx.beginPath();
            ctx.moveTo(brightStars[0].x, brightStars[0].y);
            for (let i = 1; i < Math.min(brightStars.length, 5); i++) {
                ctx.lineTo(brightStars[i].x, brightStars[i].y);
            }
            ctx.stroke();
            ctx.setLineDash([]);
        }

    }, [visible, time, stars, starProgress, screenWidth, screenHeight]);

    if (!visible) return null;

    return (
        <canvas
            ref={canvasRef}
            width={screenWidth}
            height={screenHeight}
            className="absolute inset-0 pointer-events-none"
            style={{ width: screenWidth, height: screenHeight }}
        />
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN CELESTIAL SKY CANVAS
// ═══════════════════════════════════════════════════════════════════════════════

export function CelestialSkyCanvas({
    levelProgress,
    className = "",
}: CelestialSkyCanvasProps) {
    const [dimensions, setDimensions] = useState({ width: 1200, height: 600 });

    // Get screen dimensions
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

    // Determine which celestial body to show based on level progress
    // 0-35%: Sun (sunrise to sunset)
    // 35-70%: Moon phases (full -> half -> crescent)
    // 70-100%: Stars constellation

    const showSun = levelProgress < 0.35;
    const showMoon = levelProgress >= 0.30 && levelProgress < 0.75;
    const showStars = levelProgress >= 0.65;

    // Sun progress within its phase (0-35% mapped to 0-1)
    const sunProgress = Math.min(1, levelProgress / 0.35);

    // Moon progress within its phase (30-75% mapped to 0-1)
    const moonProgress = levelProgress >= 0.30
        ? Math.min(1, (levelProgress - 0.30) / 0.45)
        : 0;

    // Determine moon phase
    const moonPhase: "full" | "half" | "crescent" =
        moonProgress < 0.33 ? "full" : moonProgress < 0.66 ? "half" : "crescent";

    // Enhanced sky gradient - smoother, darker tops for text readability
    const skyGradient = useMemo(() => {
        if (levelProgress < 0.15) {
            // Dawn - subtle warm colors, dark top
            return "linear-gradient(180deg, #0a0812 0%, #12101a 20%, #251525 35%, #4a2540 50%, #8b4560 65%, #c76555 80%, #e8a060 95%, #f5c080 100%)";
        } else if (levelProgress < 0.30) {
            // Sunrise - golden warmth, still readable top
            return "linear-gradient(180deg, #0c0a14 0%, #1a1422 18%, #2d1a35 32%, #5a3050 48%, #a05555 65%, #d88545 82%, #f5b565 100%)";
        } else if (levelProgress < 0.45) {
            // Day transition - darker purple/blue
            return "linear-gradient(180deg, #08080f 0%, #0f0a18 20%, #1a1530 38%, #352855 55%, #5a4075 72%, #7a5590 88%, #9a70a8 100%)";
        } else if (levelProgress < 0.60) {
            // Dusk - purple twilight
            return "linear-gradient(180deg, #050508 0%, #0a0a12 22%, #15122a 42%, #25204a 60%, #3a3065 78%, #504580 92%, #655595 100%)";
        } else if (levelProgress < 0.75) {
            // Twilight - deep blue purple
            return "linear-gradient(180deg, #030306 0%, #06060c 25%, #0c0a18 48%, #151228 68%, #1e1a3a 85%, #282548 100%)";
        } else if (levelProgress < 0.90) {
            // Night - very dark
            return "linear-gradient(180deg, #020204 0%, #040408 30%, #08080f 55%, #0c0a15 75%, #10101c 90%, #141422 100%)";
        } else {
            // Deep night - near black
            return "linear-gradient(180deg, #010103 0%, #030306 35%, #050508 60%, #08080c 82%, #0a0a10 100%)";
        }
    }, [levelProgress]);

    return (
        <div
            className={`absolute inset-0 overflow-hidden ${className}`}
            style={{
                background: skyGradient,
                transition: 'background 2s ease-in-out' // Slower, smoother transition
            }}
        >
            {/* Shader-style Sun */}
            <ShaderSun
                progress={sunProgress}
                visible={showSun}
                screenWidth={dimensions.width}
                screenHeight={dimensions.height}
            />

            {/* Shader-style Moon */}
            <ShaderMoon
                progress={moonProgress}
                visible={showMoon}
                phase={moonPhase}
                screenWidth={dimensions.width}
                screenHeight={dimensions.height}
            />

            {/* Shader-style Stars */}
            <ShaderStars
                visible={showStars}
                progress={levelProgress}
                screenWidth={dimensions.width}
                screenHeight={dimensions.height}
            />

            {/* Horizon glow - enhanced blending */}
            <div
                className="absolute bottom-0 left-0 right-0 pointer-events-none"
                style={{
                    height: levelProgress < 0.35 ? 200 : 100,
                    background: levelProgress < 0.25
                        ? "linear-gradient(180deg, transparent 0%, rgba(255,180,80,0.25) 50%, rgba(255,120,50,0.4) 100%)"
                        : levelProgress < 0.50
                            ? "linear-gradient(180deg, transparent 0%, rgba(180,80,150,0.15) 50%, rgba(100,50,120,0.25) 100%)"
                            : "linear-gradient(180deg, transparent 0%, rgba(20,20,40,0.2) 50%, rgba(10,10,25,0.4) 100%)",
                }}
            />

            {/* Atmospheric haze for depth */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: `radial-gradient(ellipse at 50% 150%, rgba(255,255,255,${levelProgress < 0.35 ? 0.05 : 0}) 0%, transparent 50%)`,
                }}
            />
        </div>
    );
}
