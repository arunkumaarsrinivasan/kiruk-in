"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useMemo } from "react";

interface JourneyStoryCardProps {
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
    levelProgress: number;
    totalEvents: number;
    currentEventIndex: number;
}

// Pixel-styled progress bar
function PixelProgressBar({ progress, color }: { progress: number; color: string }) {
    const totalBlocks = 16;
    const filledBlocks = Math.floor(progress * totalBlocks);

    return (
        <div className="flex gap-[2px]">
            {Array.from({ length: totalBlocks }).map((_, i) => (
                <div
                    key={i}
                    className="h-2 transition-colors duration-200"
                    style={{
                        width: "6px",
                        backgroundColor: i < filledBlocks ? color : "rgba(255,255,255,0.1)",
                    }}
                />
            ))}
        </div>
    );
}

// Mini timeline showing all events
function MiniTimeline({
    totalEvents,
    currentIndex,
    accentColor,
    onEventClick,
}: {
    totalEvents: number;
    currentIndex: number;
    accentColor: string;
    onEventClick?: (index: number) => void;
}) {
    return (
        <div className="flex items-center gap-1">
            {Array.from({ length: totalEvents }).map((_, i) => {
                const isActive = i === currentIndex;
                const isPast = i > currentIndex; // Events are reverse chronological

                return (
                    <button
                        key={i}
                        onClick={() => onEventClick?.(i)}
                        className="relative group transition-all duration-200"
                        style={{
                            width: isActive ? 12 : 6,
                            height: 6,
                            backgroundColor: isActive
                                ? accentColor
                                : isPast
                                    ? "rgba(255,255,255,0.15)"
                                    : "rgba(255,255,255,0.4)",
                            cursor: onEventClick ? "pointer" : "default",
                        }}
                        title={`Moment ${i + 1}`}
                    >
                        {/* Hover indicator */}
                        <div
                            className="absolute -top-1 left-1/2 -translate-x-1/2 w-0 h-0 
								group-hover:w-1 group-hover:h-1 transition-all duration-150"
                            style={{ backgroundColor: accentColor }}
                        />
                    </button>
                );
            })}
        </div>
    );
}

// Era badge with pixel styling
function EraPixelBadge({ age }: { age: number }) {
    const era = useMemo(() => {
        if (age <= 6) return { name: "Early Days", emoji: "🌱", color: "#22c55e" };
        if (age <= 12) return { name: "Discovery", emoji: "🧩", color: "#3b82f6" };
        if (age <= 17) return { name: "School", emoji: "📚", color: "#f59e0b" };
        if (age <= 22) return { name: "College", emoji: "🎓", color: "#8b5cf6" };
        return { name: "Pro", emoji: "💼", color: "#a855f7" };
    }, [age]);

    return (
        <div
            className="flex items-center gap-1.5 px-2 py-1"
            style={{
                background: `${era.color}15`,
                border: `1px solid ${era.color}40`,
            }}
        >
            <span className="text-sm">{era.emoji}</span>
            <span
                className="font-mono text-[10px] uppercase tracking-wide"
                style={{ color: era.color }}
            >
                {era.name}
            </span>
        </div>
    );
}

// Expandable details section
function ExpandableDetails({
    details,
    tags,
    isExpanded,
    onToggle,
    accentColor,
    secondaryColor,
}: {
    details?: string;
    tags?: string[];
    isExpanded: boolean;
    onToggle: () => void;
    accentColor: string;
    secondaryColor: string;
}) {
    const hasContent = details || (tags && tags.length > 0);

    if (!hasContent) return null;

    return (
        <div className="mt-3">
            {/* Toggle button */}
            <button
                onClick={onToggle}
                className="flex items-center gap-2 font-mono text-xs transition-colors hover:opacity-80"
                style={{ color: accentColor }}
            >
                <motion.span
                    animate={{ rotate: isExpanded ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    ▸
                </motion.span>
                {isExpanded ? "Less" : "More details"}
            </button>

            {/* Expandable content */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                    >
                        <div className="pt-3 space-y-3">
                            {/* Details text */}
                            {details && (
                                <p
                                    className="text-sm leading-relaxed italic pl-3"
                                    style={{
                                        color: "rgba(255,255,255,0.7)",
                                        borderLeft: `2px solid ${accentColor}30`,
                                    }}
                                >
                                    "{details}"
                                </p>
                            )}

                            {/* Tags */}
                            {tags && tags.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {tags.map((tag, index) => (
                                        <span
                                            key={tag}
                                            className="inline-flex items-center gap-1 px-2 py-1 font-mono text-xs"
                                            style={{
                                                background: `${index % 2 === 0 ? accentColor : secondaryColor}15`,
                                                border: `1px solid ${index % 2 === 0 ? accentColor : secondaryColor}40`,
                                                color: index % 2 === 0 ? accentColor : secondaryColor,
                                            }}
                                        >
                                            <span className="text-[8px]">▪</span>
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export function JourneyStoryCard({
    content,
    age,
    year,
    isActive,
    levelProgress,
    totalEvents,
    currentEventIndex,
}: JourneyStoryCardProps) {
    const [displayedText, setDisplayedText] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    // Era-based colors
    const accentColor = useMemo(() => {
        if (age <= 6) return "#22c55e";
        if (age <= 12) return "#3b82f6";
        if (age <= 17) return "#f59e0b";
        if (age <= 22) return "#8b5cf6";
        return "#a855f7";
    }, [age]);

    const secondaryColor = useMemo(() => {
        if (age <= 6) return "#06b6d4";
        if (age <= 12) return "#ec4899";
        if (age <= 17) return "#ef4444";
        if (age <= 22) return "#14b8a6";
        return "#06b6d4";
    }, [age]);

    // Typewriter effect
    useEffect(() => {
        if (!isActive) {
            setDisplayedText("");
            setIsExpanded(false);
            return;
        }

        setIsTyping(true);
        let index = 0;
        const text = content.description;

        const typeInterval = setInterval(() => {
            if (index < text.length) {
                setDisplayedText(text.slice(0, index + 1));
                index++;
            } else {
                setIsTyping(false);
                clearInterval(typeInterval);
            }
        }, 20);

        return () => clearInterval(typeInterval);
    }, [isActive, content.description]);

    // Reset expanded state when event changes
    useEffect(() => {
        setIsExpanded(false);
    }, [currentEventIndex]);

    if (!isActive) return null;

    return (
        <AnimatePresence>
            <motion.div
                className="fixed bottom-16 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-xl"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 30 }}
                transition={{ duration: 0.4 }}
            >
                {/* Main Card */}
                <div
                    className="relative overflow-hidden"
                    style={{
                        background: "linear-gradient(135deg, rgba(12,12,20,0.97) 0%, rgba(20,16,32,0.97) 100%)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 40px ${accentColor}10`,
                        backdropFilter: "blur(16px)",
                    }}
                >
                    {/* Header */}
                    <div className="px-4 pt-4 pb-3 flex items-start justify-between">
                        {/* Year and Age */}
                        <div className="flex items-center gap-3">
                            <div className="font-mono">
                                <div
                                    className="text-2xl font-bold tracking-tight"
                                    style={{ color: accentColor }}
                                >
                                    {year}
                                </div>
                                <div className="text-xs opacity-50" style={{ color: secondaryColor }}>
                                    Age {age}
                                </div>
                            </div>
                            <EraPixelBadge age={age} />
                        </div>

                        {/* Mini Timeline */}
                        <MiniTimeline
                            totalEvents={totalEvents}
                            currentIndex={currentEventIndex}
                            accentColor={accentColor}
                        />
                    </div>

                    {/* Content */}
                    <div className="px-4 pb-3">
                        {/* Title */}
                        <h2
                            className="text-lg font-semibold mb-2 leading-snug"
                            style={{ color: "rgba(255,255,255,0.95)" }}
                        >
                            {content.icon && <span className="mr-1.5">{content.icon}</span>}
                            {content.title}
                        </h2>

                        {/* Location */}
                        {content.location && (
                            <p
                                className="text-xs mb-2 flex items-center gap-1.5"
                                style={{ color: secondaryColor, opacity: 0.7 }}
                            >
                                <span className="text-[10px]">📍</span>
                                {content.location}
                            </p>
                        )}

                        {/* Description with typewriter */}
                        <div
                            className="pl-3 mb-2"
                            style={{ borderLeft: `2px solid ${accentColor}50` }}
                        >
                            <p
                                className="text-sm leading-relaxed"
                                style={{ color: "rgba(255,255,255,0.8)" }}
                            >
                                {displayedText}
                                {isTyping && (
                                    <motion.span
                                        className="inline-block ml-0.5 w-0.5 h-4 align-middle"
                                        style={{ backgroundColor: accentColor }}
                                        animate={{ opacity: [1, 0] }}
                                        transition={{ duration: 0.4, repeat: Infinity }}
                                    />
                                )}
                            </p>
                        </div>

                        {/* Expandable details */}
                        <ExpandableDetails
                            details={content.details}
                            tags={content.tags}
                            isExpanded={isExpanded}
                            onToggle={() => setIsExpanded(!isExpanded)}
                            accentColor={accentColor}
                            secondaryColor={secondaryColor}
                        />
                    </div>

                    {/* Footer with progress */}
                    <div
                        className="px-4 py-2 flex items-center justify-between"
                        style={{
                            background: "rgba(0,0,0,0.3)",
                            borderTop: "1px solid rgba(255,255,255,0.05)",
                        }}
                    >
                        <PixelProgressBar progress={levelProgress} color={accentColor} />

                        <div
                            className="font-mono text-[10px] flex items-center gap-1.5"
                            style={{ color: "rgba(255,255,255,0.4)" }}
                        >
                            <span style={{ color: accentColor }}>{currentEventIndex + 1}</span>
                            <span>/</span>
                            <span>{totalEvents}</span>
                        </div>
                    </div>
                </div>

                {/* Minimal hint */}
                <div
                    className="mt-2 text-center font-mono text-[10px]"
                    style={{ color: "rgba(255,255,255,0.25)" }}
                >
                    ← → navigate • click "More details" to expand
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
