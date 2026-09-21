"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef, useMemo, useCallback, memo } from "react";
import { OSWindowChrome } from "./OSWindowChrome";
import { getOSTheme } from "@/data/os-theme-config";
import type { OSThemeConfig } from "@/data/os-theme-config";

interface LifeEvent {
    id: string;
    year: number;
    age: number;
    title: string;
    description: string;
    location?: string;
    period?: string;
    details?: string;
    tags?: string[];
    icon?: string;
}

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
    previousEvent?: LifeEvent | null;
    nextEvent?: LifeEvent | null;
    onNavigate?: (index: number) => void;
    allEvents?: LifeEvent[];
    progressFillRef?: (el: HTMLDivElement | null) => void;
    progressLabelRef?: (el: HTMLSpanElement | null) => void;
}

const PROGRESS_TICKS = [0.25, 0.5, 0.75] as const;

// ============================================================================
// Timeline connector dots
// ============================================================================

const TimelineConnector = memo(function TimelineConnector({
    totalEvents,
    currentIndex,
    theme,
}: {
    totalEvents: number;
    currentIndex: number;
    theme: OSThemeConfig;
}) {
    return (
        <div className="flex items-center justify-center gap-1 py-2">
            {Array.from({ length: totalEvents }).map((_, i) => {
                const isActive = i === currentIndex;
                const isPast = i < currentIndex;

                return (
                    <div key={i} className="flex items-center">
                        <motion.div
                            initial={false}
                            animate={{ scale: isActive ? 1 : 0.7 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div
                                className="w-2.5 h-2.5 transition-all duration-300"
                                style={{
                                    borderRadius: theme.windowChrome.borderRadius > 0 ? "50%" : 0,
                                    backgroundColor: isActive
                                        ? theme.accentColor
                                        : isPast
                                            ? `color-mix(in srgb, ${theme.accentColor} 40%, transparent)`
                                            : `color-mix(in srgb, ${theme.mutedTextColor} 30%, transparent)`,
                                    border: isActive ? `2px solid ${theme.accentColor}` : "1px solid transparent",
                                }}
                            />
                        </motion.div>
                        {i < totalEvents - 1 && (
                            <div
                                className="w-3 h-px mx-0.5"
                                style={{
                                    backgroundColor: isPast
                                        ? `color-mix(in srgb, ${theme.accentColor} 30%, transparent)`
                                        : `color-mix(in srgb, ${theme.mutedTextColor} 15%, transparent)`,
                                }}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
});

// ============================================================================
// Expandable details section
// ============================================================================

const ExpandableDetails = memo(function ExpandableDetails({
    details,
    tags,
    isExpanded,
    onToggle,
    theme,
}: {
    details?: string;
    tags?: string[];
    isExpanded: boolean;
    onToggle: () => void;
    theme: OSThemeConfig;
}) {
    const hasContent = details || (tags && tags.length > 0);
    if (!hasContent) return null;

    return (
        <div className="mt-3">
            <button
                onClick={onToggle}
                className="flex items-center gap-2 text-xs uppercase tracking-wider transition-colors group"
                style={{
                    color: theme.accentColor,
                    fontFamily: theme.fontFamily,
                }}
            >
                <motion.span
                    animate={{ rotate: isExpanded ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    ▸
                </motion.span>
                <span className="group-hover:underline">
                    {isExpanded ? "Collapse" : "More details"}
                </span>
            </button>

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
                            {details && (
                                <div
                                    className="relative pl-3"
                                    style={{
                                        borderLeft: `2px solid color-mix(in srgb, ${theme.accentColor} 30%, transparent)`,
                                    }}
                                >
                                    <p
                                        className="text-sm leading-relaxed italic"
                                        style={{
                                            color: theme.textColor,
                                            opacity: 0.8,
                                            fontFamily: theme.fontFamily,
                                        }}
                                    >
                                        {details}
                                    </p>
                                </div>
                            )}

                            {tags && tags.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {tags.map((tag, index) => (
                                        <motion.span
                                            key={tag}
                                            className="inline-flex items-center gap-1.5 px-2 py-1 text-[10px] uppercase"
                                            style={{
                                                border: `1px solid color-mix(in srgb, ${theme.accentColor} 30%, transparent)`,
                                                color: theme.accentColor,
                                                borderRadius: Math.min(theme.windowChrome.borderRadius, 4),
                                                fontFamily: theme.fontFamily,
                                            }}
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 + 0.15, duration: 0.3 }}
                                        >
                                            <span
                                                className="w-1.5 h-1.5 flex-shrink-0"
                                                style={{
                                                    backgroundColor: theme.accentColor,
                                                    borderRadius: theme.windowChrome.borderRadius > 0 ? "50%" : 0,
                                                }}
                                            />
                                            {tag}
                                        </motion.span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
});

// ============================================================================
// Preview card for prev/next events
// ============================================================================

const PreviewCard = memo(function PreviewCard({
    event,
    position,
    onNavigate,
    targetIndex,
}: {
    event: LifeEvent;
    position: "previous" | "next";
    onNavigate?: (index: number) => void;
    targetIndex: number;
}) {
    const theme = useMemo(() => getOSTheme(event.year), [event.year]);

    return (
        <div
            className="relative h-full cursor-pointer transition-all duration-300 hover:opacity-70"
            onClick={() => onNavigate?.(targetIndex)}
        >
            <OSWindowChrome
                theme={theme}
                title={event.title}
            >
                <div style={{
                    padding: "12px",
                    minHeight: 300,
                    fontFamily: theme.fontFamily,
                }}>
                    {/* Year */}
                    <div
                        className="text-2xl font-bold tracking-tight mb-2"
                        style={{ color: theme.accentColor, opacity: 0.7 }}
                    >
                        {event.year}
                    </div>

                    {/* Title */}
                    <div className="flex items-start gap-2 mb-2">
                        {event.icon && <span className="text-lg">{event.icon}</span>}
                        <h3
                            className="text-sm font-bold leading-tight flex-1"
                            style={{ color: theme.textColor, opacity: 0.7 }}
                        >
                            {event.title}
                        </h3>
                    </div>

                    {/* Location */}
                    {event.location && (
                        <div
                            className="text-xs mb-2"
                            style={{ color: theme.mutedTextColor, fontFamily: theme.fontFamily }}
                        >
                            📍 {event.location}
                        </div>
                    )}

                    {/* Description */}
                    <p
                        className="text-xs leading-relaxed line-clamp-3"
                        style={{ color: theme.textColor, opacity: 0.5, fontFamily: theme.fontFamily }}
                    >
                        {event.description}
                    </p>

                    {/* Navigation hint */}
                    <div
                        className="absolute bottom-3 left-1/2 transform -translate-x-1/2 px-3 py-1 text-[9px] uppercase tracking-wider"
                        style={{
                            color: theme.accentColor,
                            opacity: 0.5,
                            fontFamily: theme.fontFamily,
                        }}
                    >
                        {position === "previous" ? "← PREVIOUS" : "NEXT →"}
                    </div>
                </div>
            </OSWindowChrome>
        </div>
    );
});

// ============================================================================
// Main Component
// ============================================================================

export function JourneyStoryCard({
    content,
    age: _age,
    year,
    isActive,
    levelProgress,
    totalEvents,
    currentEventIndex,
    previousEvent,
    nextEvent,
    onNavigate,
    allEvents = [],
    progressFillRef,
    progressLabelRef,
}: JourneyStoryCardProps) {
    const [displayedText, setDisplayedText] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [isExpanded, setIsExpanded] = useState(true);
    const currentCardRef = useRef<HTMLDivElement>(null);

    // Get OS theme for current year
    const theme = useMemo(() => getOSTheme(year), [year]);

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
        }, 18);

        return () => clearInterval(typeInterval);
    }, [isActive, content.description]);

    // Reset expanded state when event changes
    useEffect(() => {
        setIsExpanded(true);
    }, [currentEventIndex]);

    // Stable toggle for expandable details
    const handleToggleExpand = useCallback(() => setIsExpanded((prev) => !prev), []);

    // Memoize navigation indices to avoid recomputing on every render
    const previousIndex = useMemo(
        () => (previousEvent && allEvents.length > 0 ? allEvents.findIndex((e) => e.id === previousEvent.id) : -1),
        [previousEvent, allEvents]
    );
    const nextIndex = useMemo(
        () => (nextEvent && allEvents.length > 0 ? allEvents.findIndex((e) => e.id === nextEvent.id) : -1),
        [nextEvent, allEvents]
    );

    if (!isActive) return null;

    return (
        <motion.div
            className="fixed inset-0 z-40 pointer-events-none"
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100vh",
                width: "100vw",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
        >
            {/* Three-column layout */}
            <div
                className="flex items-center justify-center gap-4 pointer-events-none"
                style={{
                    width: "100%",
                    maxWidth: "100vw",
                    padding: "0 16px",
                }}
            >
                {/* Previous Year Card */}
                <motion.div
                    className="w-[280px] md:w-[320px] pointer-events-auto flex-shrink-0"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: previousEvent ? 0.4 : 0.2, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                >
                    {previousEvent ? (
                        <PreviewCard
                            event={previousEvent}
                            position="previous"
                            onNavigate={onNavigate}
                            targetIndex={previousIndex}
                        />
                    ) : (
                        <div
                            className="h-[400px] flex items-center justify-center opacity-30"
                            style={{
                                border: `1px solid color-mix(in srgb, ${theme.accentColor} 30%, transparent)`,
                                borderRadius: theme.windowChrome.borderRadius,
                            }}
                        >
                            <span className="text-xs" style={{ color: theme.accentColor, fontFamily: theme.fontFamily }}>
                                ...
                            </span>
                        </div>
                    )}
                </motion.div>

                {/* Current Year Card - OS Window */}
                <motion.div
                    ref={currentCardRef}
                    className="w-[95%] max-w-[600px] pointer-events-auto flex-shrink-0"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                >
                    <OSWindowChrome
                        theme={theme}
                        title={`${content.title} — ${theme.name}`}
                    >
                        {/* Window Content */}
                        <div style={{ fontFamily: theme.fontFamily }}>
                            {/* Header Row */}
                            <div
                                className="px-5 pt-4 pb-3 flex items-center justify-between gap-6"
                                style={{
                                    borderBottom: `1px solid color-mix(in srgb, ${theme.accentColor} 15%, transparent)`,
                                }}
                            >
                                <div className="flex items-center gap-4">
                                    <div>
                                        <div
                                            className="text-3xl font-bold tracking-tight"
                                            style={{ color: theme.accentColor }}
                                        >
                                            {year}
                                        </div>
                                        <div
                                            className="text-[10px] uppercase tracking-wider"
                                            style={{ color: theme.secondaryColor, opacity: 0.7 }}
                                        >
                                            Age {_age}
                                        </div>
                                    </div>
                                </div>

                                {/* OS name badge */}
                                <div
                                    className="text-[10px] uppercase tracking-wider px-2 py-1"
                                    style={{
                                        color: theme.accentColor,
                                        border: `1px solid color-mix(in srgb, ${theme.accentColor} 25%, transparent)`,
                                        borderRadius: Math.min(theme.windowChrome.borderRadius, 6),
                                    }}
                                >
                                    {theme.name}
                                </div>

                                {/* Memory indicator */}
                                <div className="flex flex-col items-center gap-1">
                                    <span
                                        className="text-[10px] uppercase tracking-wider"
                                        style={{ color: theme.mutedTextColor }}
                                    >
                                        Memory
                                    </span>
                                    <div className="flex items-center gap-1">
                                        <span
                                            className="text-sm font-bold"
                                            style={{ color: theme.accentColor }}
                                        >
                                            {currentEventIndex + 1}
                                        </span>
                                        <span
                                            className="text-xs"
                                            style={{ color: theme.mutedTextColor }}
                                        >
                                            / {totalEvents}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Timeline connector */}
                            <div className="px-5 flex justify-start">
                                <TimelineConnector
                                    totalEvents={totalEvents}
                                    currentIndex={currentEventIndex}
                                    theme={theme}
                                />
                            </div>

                            {/* Content Section */}
                            <div className="px-5 pb-4">
                                <div
                                    className="h-px mb-3"
                                    style={{ backgroundColor: `color-mix(in srgb, ${theme.accentColor} 10%, transparent)` }}
                                />

                                {/* Title */}
                                <h2
                                    className="text-lg font-bold mb-2 leading-snug flex items-center gap-2 text-left"
                                    style={{ color: theme.textColor }}
                                >
                                    {content.icon && <span className="text-xl">{content.icon}</span>}
                                    {content.title}
                                </h2>

                                {/* Location */}
                                {content.location && (
                                    <div
                                        className="flex items-center gap-2 mb-3 text-xs"
                                        style={{ color: theme.secondaryColor, opacity: 0.8 }}
                                    >
                                        <span>📍 {content.location}</span>
                                    </div>
                                )}

                                {/* Description with typewriter */}
                                <div className="relative mb-2 text-left">
                                    <p
                                        className="text-sm leading-relaxed"
                                        style={{ color: theme.textColor, opacity: 0.85 }}
                                    >
                                        {displayedText}
                                        {isTyping && (
                                            <motion.span
                                                className="inline-block ml-0.5 w-2 h-4 align-middle"
                                                style={{ backgroundColor: theme.accentColor }}
                                                animate={{ opacity: [1, 0] }}
                                                transition={{ duration: 0.5, repeat: Infinity }}
                                            />
                                        )}
                                    </p>
                                </div>

                                {/* Expandable details */}
                                <ExpandableDetails
                                    details={content.details}
                                    tags={content.tags}
                                    isExpanded={isExpanded}
                                    onToggle={handleToggleExpand}
                                    theme={theme}
                                />
                            </div>

                            {/* Footer with progress bar */}
                            <div
                                className="px-5 py-3 flex items-center justify-between"
                                style={{
                                    borderTop: `1px solid color-mix(in srgb, ${theme.accentColor} 15%, transparent)`,
                                    background: theme.id === "vscode"
                                        ? "#1e1e1e"
                                        : theme.id === "win98"
                                            ? "#c0c0c0"
                                            : `color-mix(in srgb, ${theme.cardBg} 90%, ${theme.accentColor} 10%)`,
                                }}
                            >
                                <span
                                    ref={progressLabelRef}
                                    className="text-[10px] uppercase tracking-wider"
                                    style={{ color: theme.accentColor }}
                                >
                                    {Math.round(levelProgress * 100)}%
                                </span>

                                <div className="flex-1 ml-4">
                                    <div
                                        className="h-1 w-full relative overflow-hidden"
                                        style={{
                                            backgroundColor: `color-mix(in srgb, ${theme.mutedTextColor} 20%, transparent)`,
                                            borderRadius: theme.windowChrome.borderRadius > 0 ? 2 : 0,
                                        }}
                                    >
                                        <div
                                            ref={progressFillRef}
                                            className="h-full"
                                            style={{
                                                width: `${levelProgress * 100}%`,
                                                backgroundColor: theme.accentColor,
                                                borderRadius: theme.windowChrome.borderRadius > 0 ? 2 : 0,
                                            }}
                                        />
                                        {PROGRESS_TICKS.map((tick) => (
                                            <div
                                                key={tick}
                                                className="absolute top-0 w-px h-1"
                                                style={{
                                                    left: `${tick * 100}%`,
                                                    backgroundColor: `color-mix(in srgb, ${theme.mutedTextColor} 30%, transparent)`,
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </OSWindowChrome>
                </motion.div>

                {/* Next Year Card */}
                <motion.div
                    className="w-[280px] md:w-[320px] pointer-events-auto flex-shrink-0"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: nextEvent ? 0.4 : 0.2, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                >
                    {nextEvent ? (
                        <PreviewCard
                            event={nextEvent}
                            position="next"
                            onNavigate={onNavigate}
                            targetIndex={nextIndex}
                        />
                    ) : (
                        <div
                            className="h-[400px] flex items-center justify-center opacity-30"
                            style={{
                                border: `1px solid color-mix(in srgb, ${theme.accentColor} 30%, transparent)`,
                                borderRadius: theme.windowChrome.borderRadius,
                            }}
                        >
                            <span className="text-xs" style={{ color: theme.accentColor, fontFamily: theme.fontFamily }}>
                                ...
                            </span>
                        </div>
                    )}
                </motion.div>
            </div>
        </motion.div>
    );
}
