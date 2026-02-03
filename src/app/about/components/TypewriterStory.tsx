"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useMemo } from "react";

interface TypewriterStoryProps {
    content: {
        title: string;
        subtitle: string;
        description: string;
        details?: string;
        location?: string;
        tags?: string[];
        icon?: string;
    };
    age: number;
    year: number;
    isActive: boolean;
    phaseColor: string;
    levelProgress: number;
}

// Year-based design trends - UI/UX aesthetic of each era
function getYearDesignTrend(year: number) {
    if (year <= 2004) {
        // Early 2000s - Windows XP, Geocities, early web
        return {
            name: "Y2K Digital",
            bgGradient: "linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
            borderStyle: "3px ridge #4a90d9",
            fontFamily: "'Courier New', 'Lucida Console', monospace",
            titleFont: "'Trebuchet MS', 'Comic Sans MS', sans-serif",
            accentColor: "#00ff00",
            secondaryColor: "#4a90d9",
            textShadow: "0 0 10px rgba(0,255,0,0.5)",
            boxShadow: "inset 2px 2px 5px rgba(255,255,255,0.1), inset -2px -2px 5px rgba(0,0,0,0.5), 0 0 20px rgba(74,144,217,0.3)",
            scanlines: true,
            crtEffect: true,
            windowButtons: true,
            typeSpeed: 45,
            cursorStyle: "█",
            decorStyle: "retro-windows",
        };
    } else if (year <= 2008) {
        // Mid 2000s - Web 2.0, glossy, gradients, reflections
        return {
            name: "Web 2.0 Glossy",
            bgGradient: "linear-gradient(180deg, #2c3e50 0%, #34495e 40%, #2c3e50 100%)",
            borderStyle: "2px solid rgba(255,255,255,0.2)",
            fontFamily: "'Lucida Grande', 'Segoe UI', Tahoma, sans-serif",
            titleFont: "'Myriad Pro', 'Helvetica Neue', Arial, sans-serif",
            accentColor: "#3498db",
            secondaryColor: "#2ecc71",
            textShadow: "0 1px 2px rgba(0,0,0,0.5)",
            boxShadow: "0 4px 15px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.3)",
            scanlines: false,
            crtEffect: false,
            windowButtons: false,
            typeSpeed: 35,
            cursorStyle: "|",
            decorStyle: "glossy-badge",
        };
    } else if (year <= 2012) {
        // Late 2000s/Early 2010s - Skeuomorphism, iOS leather, shadows
        return {
            name: "Skeuomorphic",
            bgGradient: "linear-gradient(180deg, #3a3a3a 0%, #2a2a2a 20%, #1a1a1a 100%)",
            borderStyle: "1px solid rgba(255,255,255,0.15)",
            fontFamily: "'Helvetica Neue', 'SF Pro Text', system-ui, sans-serif",
            titleFont: "'Georgia', 'Times New Roman', serif",
            accentColor: "#f39c12",
            secondaryColor: "#e74c3c",
            textShadow: "0 1px 1px rgba(0,0,0,0.8)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1), 0 1px 3px rgba(0,0,0,0.3)",
            scanlines: false,
            crtEffect: false,
            windowButtons: false,
            typeSpeed: 30,
            cursorStyle: "▌",
            decorStyle: "leather-texture",
        };
    } else if (year <= 2017) {
        // Mid 2010s - Flat design, Material Design
        return {
            name: "Flat Design",
            bgGradient: "linear-gradient(135deg, #1e1e2f 0%, #252537 100%)",
            borderStyle: "none",
            fontFamily: "'Roboto', 'Segoe UI', system-ui, sans-serif",
            titleFont: "'Roboto', 'Montserrat', sans-serif",
            accentColor: "#00bcd4",
            secondaryColor: "#ff5722",
            textShadow: "none",
            boxShadow: "0 2px 10px rgba(0,0,0,0.3), 0 8px 40px rgba(0,0,0,0.2)",
            scanlines: false,
            crtEffect: false,
            windowButtons: false,
            typeSpeed: 28,
            cursorStyle: "_",
            decorStyle: "material-fab",
        };
    } else if (year <= 2021) {
        // Late 2010s - Brutalism, bold typography
        return {
            name: "Neo-Brutalist",
            bgGradient: "linear-gradient(180deg, #0d0d0d 0%, #1a1a1a 100%)",
            borderStyle: "3px solid #ffffff",
            fontFamily: "'Space Mono', 'JetBrains Mono', monospace",
            titleFont: "'Inter', 'Archivo Black', sans-serif",
            accentColor: "#ffff00",
            secondaryColor: "#ff00ff",
            textShadow: "2px 2px 0 rgba(255,0,255,0.5)",
            boxShadow: "8px 8px 0 #ffffff",
            scanlines: false,
            crtEffect: false,
            windowButtons: false,
            typeSpeed: 22,
            cursorStyle: "▎",
            decorStyle: "brutalist-block",
        };
    } else {
        // 2022+ - Glassmorphism, Bento, AI-age
        return {
            name: "Glass Bento",
            bgGradient: "linear-gradient(135deg, rgba(20,20,35,0.95) 0%, rgba(30,25,45,0.98) 100%)",
            borderStyle: "1px solid rgba(255,255,255,0.1)",
            fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif",
            titleFont: "'Plus Jakarta Sans', 'Inter', sans-serif",
            accentColor: "#a855f7",
            secondaryColor: "#06b6d4",
            textShadow: "0 0 30px rgba(168,85,247,0.3)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(255,255,255,0.05)",
            scanlines: false,
            crtEffect: false,
            windowButtons: false,
            typeSpeed: 18,
            cursorStyle: "▍",
            decorStyle: "glass-orb",
        };
    }
}

// Minimal section icon - shows one at a time on the right
function SectionIcon({
    section,
    isActive,
    onClick,
}: {
    section: "chapter" | "story" | "moments";
    isActive: boolean;
    onClick: () => void;
}) {
    const config = {
        chapter: { icon: "☀️", color: "#FFC857" },
        story: { icon: "🌙", color: "#90CDF4" },
        moments: { icon: "⭐", color: "#FFD700" },
    };

    const { icon, color } = config[section];

    return (
        <motion.button
            onClick={onClick}
            className="relative p-2 rounded-lg transition-all"
            style={{
                background: isActive ? `${color}20` : "transparent",
                border: isActive ? `1px solid ${color}40` : "1px solid transparent",
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
        >
            <motion.span
                className="text-lg block"
                animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 1.5, repeat: Infinity }}
                style={{ opacity: isActive ? 1 : 0.4 }}
            >
                {icon}
            </motion.span>
        </motion.button>
    );
}

// Chip component for moments/tags
function MomentChip({
    text,
    index,
    designTrend,
    accentColor,
}: {
    text: string;
    index: number;
    designTrend: ReturnType<typeof getYearDesignTrend>;
    accentColor: string;
}) {
    return (
        <motion.span
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm"
            style={{
                background: `linear-gradient(135deg, ${accentColor}20 0%, ${accentColor}10 100%)`,
                border: `1px solid ${accentColor}50`,
                borderRadius: designTrend.decorStyle === "brutalist-block" ? "0" : "9999px",
                color: accentColor,
                fontFamily: designTrend.fontFamily,
                boxShadow: designTrend.decorStyle === "brutalist-block"
                    ? `2px 2px 0 ${accentColor}`
                    : `0 2px 8px ${accentColor}20`,
            }}
            initial={{ opacity: 0, scale: 0.8, x: -20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
        >
            <span>✦</span>
            {text}
        </motion.span>
    );
}

export function TypewriterStory({
    content,
    age,
    year,
    isActive,
    phaseColor,
    levelProgress,
}: TypewriterStoryProps) {
    const [displayedText, setDisplayedText] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [showCursor, setShowCursor] = useState(true);
    const [currentSection, setCurrentSection] = useState<"chapter" | "story" | "moments">("chapter");

    const designTrend = useMemo(() => getYearDesignTrend(year), [year]);

    // Content for each section
    const sectionContent = useMemo(() => ({
        chapter: `${content.icon || "📖"} ${content.title}`,
        story: content.description,
        moments: content.tags || [],
    }), [content]);

    // Text to type based on section
    const textToType = useMemo(() => {
        if (currentSection === "moments") return ""; // Moments section shows chips, not typed text
        return sectionContent[currentSection] as string;
    }, [sectionContent, currentSection]);

    // Typewriter effect
    useEffect(() => {
        if (!isActive || currentSection === "moments") {
            if (currentSection !== "moments") setDisplayedText("");
            return;
        }

        setIsTyping(true);
        setDisplayedText("");
        let index = 0;
        const text = textToType;

        const typeInterval = setInterval(() => {
            if (index < text.length) {
                setDisplayedText(text.slice(0, index + 1));
                index++;
            } else {
                setIsTyping(false);
                clearInterval(typeInterval);
            }
        }, designTrend.typeSpeed);

        return () => clearInterval(typeInterval);
    }, [isActive, textToType, designTrend.typeSpeed, currentSection]);

    // Cursor blink effect
    useEffect(() => {
        const blinkInterval = setInterval(() => {
            setShowCursor((prev) => !prev);
        }, 500);
        return () => clearInterval(blinkInterval);
    }, []);

    // Auto-progress through sections based on level progress
    useEffect(() => {
        if (levelProgress < 0.33) {
            setCurrentSection("chapter");
        } else if (levelProgress < 0.66) {
            setCurrentSection("story");
        } else {
            setCurrentSection("moments");
        }
    }, [levelProgress]);

    const handleSectionChange = (section: "chapter" | "story" | "moments") => {
        setCurrentSection(section);
    };

    if (!isActive) return null;

    // Era-specific decorations
    const renderEraDecoration = () => {
        if (designTrend.windowButtons) {
            // Windows XP style title bar
            return (
                <div className="absolute top-0 left-0 right-0 h-8 flex items-center justify-between px-2"
                    style={{
                        background: "linear-gradient(180deg, #0a246a 0%, #0a246a 40%, #0a246a 100%)",
                        borderBottom: "1px solid rgba(255,255,255,0.2)",
                    }}
                >
                    <span className="text-white text-xs font-bold" style={{ fontFamily: "Tahoma, sans-serif" }}>
                        📁 Life Journey - {year}
                    </span>
                    <div className="flex gap-1">
                        <div className="w-4 h-4 rounded-sm" style={{ background: "linear-gradient(180deg, #3dc939 0%, #2ca020 100%)" }}>
                            <span className="text-[8px] text-white flex items-center justify-center h-full">_</span>
                        </div>
                        <div className="w-4 h-4 rounded-sm" style={{ background: "linear-gradient(180deg, #f0f0f0 0%, #c0c0c0 100%)" }}>
                            <span className="text-[8px] text-gray-700 flex items-center justify-center h-full">□</span>
                        </div>
                        <div className="w-4 h-4 rounded-sm" style={{ background: "linear-gradient(180deg, #e04343 0%, #b02020 100%)" }}>
                            <span className="text-[8px] text-white flex items-center justify-center h-full">×</span>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    // CRT scanlines effect
    const renderScanlines = () => {
        if (!designTrend.scanlines) return null;
        return (
            <div
                className="absolute inset-0 pointer-events-none z-50 opacity-10"
                style={{
                    background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)",
                }}
            />
        );
    };

    return (
        <AnimatePresence>
            <motion.div
                className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-2xl"
                initial={{ opacity: 0, y: 80, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 40, scale: 0.95 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
            >
                {/* Main Display Card */}
                <div
                    className="relative overflow-hidden"
                    style={{
                        background: designTrend.bgGradient,
                        border: designTrend.borderStyle,
                        borderRadius: designTrend.decorStyle === "brutalist-block" ? "0" : "16px",
                        boxShadow: designTrend.boxShadow,
                        backdropFilter: designTrend.decorStyle === "glass-orb" ? "blur(20px)" : "none",
                        paddingTop: designTrend.windowButtons ? "40px" : "0",
                        minHeight: "280px",
                    }}
                >
                    {/* Era decoration */}
                    {renderEraDecoration()}
                    {renderScanlines()}

                    {/* Top Bar - Year/Age on left, Era badge on right */}
                    <div className="flex items-center justify-between px-6 pt-5 pb-4">
                        {/* Year & Age Badge */}
                        <div className="flex items-center gap-3">
                            <motion.div
                                className="font-bold"
                                style={{
                                    fontFamily: designTrend.titleFont,
                                    color: designTrend.accentColor,
                                    textShadow: designTrend.textShadow,
                                }}
                            >
                                <span className="text-2xl">{year}</span>
                                <span className="ml-2 text-sm opacity-70">Age {age}</span>
                            </motion.div>
                        </div>

                        {/* Era Badge */}
                        <div
                            className="px-3 py-1 text-xs uppercase tracking-widest"
                            style={{
                                background: "rgba(0,0,0,0.5)",
                                border: "1px solid rgba(255,255,255,0.2)",
                                borderRadius: "9999px",
                                color: designTrend.secondaryColor,
                                fontFamily: designTrend.fontFamily,
                            }}
                        >
                            {designTrend.name}
                        </div>
                    </div>

                    {/* Section Navigation - Minimal icons on the right side */}
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-20">
                        {(["chapter", "story", "moments"] as const).map((section) => (
                            <SectionIcon
                                key={section}
                                section={section}
                                isActive={currentSection === section}
                                onClick={() => handleSectionChange(section)}
                            />
                        ))}
                    </div>

                    {/* Content area - Main display */}
                    <div className="px-8 py-6 pr-16 min-h-[180px]">
                        <AnimatePresence mode="wait">
                            {currentSection === "chapter" && (
                                <motion.div
                                    key="chapter-content"
                                    initial={{ opacity: 0, x: -30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 30 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {/* Title display */}
                                    <h2
                                        className="text-2xl md:text-3xl font-bold mb-4 leading-tight"
                                        style={{
                                            fontFamily: designTrend.titleFont,
                                            color: phaseColor,
                                            textShadow: designTrend.textShadow,
                                        }}
                                    >
                                        {displayedText}
                                        {isTyping && (
                                            <motion.span
                                                className="inline-block ml-1"
                                                style={{ color: designTrend.accentColor, opacity: showCursor ? 1 : 0 }}
                                            >
                                                {designTrend.cursorStyle}
                                            </motion.span>
                                        )}
                                    </h2>
                                    {content.location && (
                                        <p
                                            className="text-sm opacity-70 flex items-center gap-2"
                                            style={{ fontFamily: designTrend.fontFamily, color: designTrend.secondaryColor }}
                                        >
                                            <span>📍</span> {content.location}
                                        </p>
                                    )}
                                </motion.div>
                            )}

                            {currentSection === "story" && (
                                <motion.div
                                    key="story-content"
                                    initial={{ opacity: 0, x: -30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 30 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {/* Story writing style */}
                                    <div
                                        className="relative pl-6"
                                        style={{
                                            borderLeft: `3px solid ${designTrend.accentColor}40`,
                                        }}
                                    >
                                        <p
                                            className="text-lg md:text-xl leading-relaxed"
                                            style={{
                                                fontFamily: designTrend.fontFamily,
                                                color: "rgba(255,255,255,0.95)",
                                                textShadow: designTrend.textShadow,
                                            }}
                                        >
                                            {displayedText}
                                            {isTyping && (
                                                <motion.span
                                                    className="inline-block ml-0.5"
                                                    style={{ color: designTrend.accentColor, opacity: showCursor ? 1 : 0 }}
                                                >
                                                    {designTrend.cursorStyle}
                                                </motion.span>
                                            )}
                                        </p>
                                    </div>
                                    {/* Typing indicator */}
                                    {isTyping && (
                                        <div className="flex gap-1 mt-4 ml-6">
                                            {[0, 1, 2].map((i) => (
                                                <motion.div
                                                    key={i}
                                                    className="w-2 h-2 rounded-full"
                                                    style={{ backgroundColor: designTrend.accentColor }}
                                                    animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                                                    transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {currentSection === "moments" && (
                                <motion.div
                                    key="moments-content"
                                    initial={{ opacity: 0, x: -30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 30 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {/* Moments/Tags as chips */}
                                    <h3
                                        className="text-sm uppercase tracking-widest mb-4 opacity-60"
                                        style={{ fontFamily: designTrend.fontFamily, color: designTrend.accentColor }}
                                    >
                                        Key Moments & Learnings
                                    </h3>
                                    <div className="flex flex-wrap gap-3">
                                        {(sectionContent.moments as string[]).map((tag, index) => (
                                            <MomentChip
                                                key={tag}
                                                text={tag}
                                                index={index}
                                                designTrend={designTrend}
                                                accentColor={index % 2 === 0 ? designTrend.accentColor : designTrend.secondaryColor}
                                            />
                                        ))}
                                    </div>
                                    {content.details && (
                                        <motion.p
                                            className="mt-6 text-sm opacity-70 italic"
                                            style={{ fontFamily: designTrend.fontFamily }}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 0.7 }}
                                            transition={{ delay: 0.5 }}
                                        >
                                            &quot;{content.details}&quot;
                                        </motion.p>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Progress bar at bottom */}
                    <div className="h-1.5" style={{ backgroundColor: "rgba(255,255,255,0.05)" }}>
                        <motion.div
                            className="h-full"
                            style={{
                                background: `linear-gradient(90deg, ${designTrend.accentColor}, ${designTrend.secondaryColor})`,
                            }}
                            initial={{ width: 0 }}
                            animate={{ width: `${levelProgress * 100}%` }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                        />
                    </div>
                </div>

                {/* Keyboard hint */}
                <motion.div
                    className="mt-3 text-center text-xs opacity-40"
                    style={{ fontFamily: designTrend.fontFamily }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.4 }}
                    transition={{ delay: 1 }}
                >
                    ← → Move through time • Click icons to explore sections
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
