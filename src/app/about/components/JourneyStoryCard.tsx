"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { CornerMarkers as WireframeCornerMarkers } from "@/components/ui/wireframe/MeasurementLines";
import { useDesignEra } from "@/contexts/DesignEraContext";

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
}

/** Design-era accent (matches header/nav). Use for card colors so it matches the top bar. */
const ACCENT_MUTED = "color-mix(in srgb, var(--accent-color) 30%, transparent)";
const ACCENT_SOFT = "color-mix(in srgb, var(--accent-color) 20%, transparent)";
const ACCENT_MED = "color-mix(in srgb, var(--accent-color) 60%, transparent)";

// Animated wireframe lines that extend to viewport edges
function WireframeLines({
    isHovered,
    containerRef,
    accentColor,
}: {
    isHovered: boolean;
    containerRef: React.RefObject<HTMLDivElement | null>;
    accentColor: string;
}) {
    const [rect, setRect] = useState({ top: 0, bottom: 0, left: 0, right: 0 });

    useEffect(() => {
        if (containerRef.current) {
            const updateRect = () => {
                const r = containerRef.current?.getBoundingClientRect();
                if (r) {
                    setRect({ top: r.top, bottom: r.bottom, left: r.left, right: r.right });
                }
            };
            updateRect();
            window.addEventListener("resize", updateRect);
            window.addEventListener("scroll", updateRect);
            return () => {
                window.removeEventListener("resize", updateRect);
                window.removeEventListener("scroll", updateRect);
            };
        }
    }, [containerRef, isHovered]);

    if (!isHovered) return null;

    return (
        <>
            {/* Left vertical trace - extends to top and bottom of viewport */}
            <motion.div
                className="fixed w-px pointer-events-none z-50"
                style={{
                    left: rect.left,
                    top: 0,
                    height: rect.top,
                    backgroundColor: accentColor,
                }}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1, opacity: 0.4 }}
                exit={{ scaleY: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
            />
            <motion.div
                className="fixed w-px pointer-events-none z-50"
                style={{
                    left: rect.left,
                    top: rect.bottom,
                    height: `calc(100vh - ${rect.bottom}px)`,
                    backgroundColor: accentColor,
                }}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1, opacity: 0.4 }}
                exit={{ scaleY: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeOut", delay: 0.1 }}
            />

            {/* Right vertical trace */}
            <motion.div
                className="fixed w-px pointer-events-none z-50"
                style={{
                    left: rect.right - 1,
                    top: 0,
                    height: rect.top,
                    backgroundColor: accentColor,
                }}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1, opacity: 0.4 }}
                exit={{ scaleY: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
            />
            <motion.div
                className="fixed w-px pointer-events-none z-50"
                style={{
                    left: rect.right - 1,
                    top: rect.bottom,
                    height: `calc(100vh - ${rect.bottom}px)`,
                    backgroundColor: accentColor,
                }}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1, opacity: 0.4 }}
                exit={{ scaleY: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeOut", delay: 0.1 }}
            />

            {/* Top horizontal trace - extends to left and right of viewport */}
            <motion.div
                className="fixed h-px pointer-events-none z-50"
                style={{
                    top: rect.top,
                    left: 0,
                    width: rect.left,
                    backgroundColor: accentColor,
                }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1, opacity: 0.4 }}
                exit={{ scaleX: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeOut", delay: 0.05 }}
            />
            <motion.div
                className="fixed h-px pointer-events-none z-50"
                style={{
                    top: rect.top,
                    left: rect.right,
                    width: `calc(100vw - ${rect.right}px)`,
                    backgroundColor: accentColor,
                }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1, opacity: 0.4 }}
                exit={{ scaleX: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeOut", delay: 0.05 }}
            />

            {/* Bottom horizontal trace */}
            <motion.div
                className="fixed h-px pointer-events-none z-50"
                style={{
                    top: rect.bottom - 1,
                    left: 0,
                    width: rect.left,
                    backgroundColor: accentColor,
                }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1, opacity: 0.4 }}
                exit={{ scaleX: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeOut", delay: 0.15 }}
            />
            <motion.div
                className="fixed h-px pointer-events-none z-50"
                style={{
                    top: rect.bottom - 1,
                    left: rect.right,
                    width: `calc(100vw - ${rect.right}px)`,
                    backgroundColor: accentColor,
                }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1, opacity: 0.4 }}
                exit={{ scaleX: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeOut", delay: 0.15 }}
            />

            {/* Corner measurement labels */}
            <motion.div
                className="fixed px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider z-50"
                style={{
                    bottom: 8,
                    left: rect.left + 4,
                    backgroundColor: "var(--bg-main)",
                    color: accentColor,
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.25 }}
            >
                Journey
            </motion.div>
        </>
    );
}

// Timeline connector with animated pulse
function TimelineConnector({
    totalEvents,
    currentIndex,
    accentColor,
    secondaryColor,
}: {
    totalEvents: number;
    currentIndex: number;
    accentColor: string;
    secondaryColor: string;
}) {
    return (
        <div className="flex items-center justify-center gap-1 py-2">
            {Array.from({ length: totalEvents }).map((_, i) => {
                const isActive = i === currentIndex;
                const isPast = i > currentIndex; // Reverse chronological
                const isFuture = i < currentIndex;

                return (
                    <div key={i} className="flex items-center">
                        {/* Node */}
                        <motion.div
                            className="relative"
                            initial={false}
                            animate={{
                                scale: isActive ? 1 : 0.7,
                            }}
                            transition={{ duration: 0.3 }}
                        >
                            <div
                                className="w-3 h-3 border-2 transition-all duration-300"
                                style={{
                                    borderColor: isActive
                                        ? accentColor
                                        : isPast
                                            ? "rgba(255,255,255,0.2)"
                                            : secondaryColor,
                                    backgroundColor: isActive
                                        ? accentColor
                                        : isFuture
                                            ? `color-mix(in srgb, ${secondaryColor} 19%, transparent)`
                                            : "transparent",
                                }}
                            />
                            {isActive && (
                                <motion.div
                                    className="absolute inset-0 border-2"
                                    style={{ borderColor: accentColor }}
                                    animate={{
                                        scale: [1, 1.8, 1],
                                        opacity: [1, 0, 1],
                                    }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                />
                            )}
                        </motion.div>
                        {/* Connector line */}
                        {i < totalEvents - 1 && (
                            <div
                                className="w-4 h-px mx-0.5"
                                style={{
                                    backgroundColor:
                                        i >= currentIndex
                                            ? "rgba(255,255,255,0.15)"
                                            : accentColor,
                                    opacity: i >= currentIndex ? 1 : 0.5,
                                }}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

// Era badge with wireframe style - uses design era from timemachine
function _EraWireframeBadge({
    eraName,
    isHovered,
    accentColor,
    lineStyle = "solid",
}: {
    eraName: string;
    isHovered: boolean;
    accentColor: string;
    lineStyle?: "dotted" | "dashed" | "solid";
}) {
    return (
        <motion.div
            className="flex items-center gap-2 px-3 py-1 border font-mono text-[10px] uppercase tracking-widest"
            style={{
                borderColor: isHovered 
                    ? accentColor 
                    : `color-mix(in srgb, ${accentColor} 30%, transparent)`,
                borderStyle: lineStyle,
                color: accentColor,
                backgroundColor: isHovered 
                    ? `color-mix(in srgb, ${accentColor} 10%, transparent)` 
                    : "transparent",
            }}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.15 }}
        >
            <span>{eraName}</span>
        </motion.div>
    );
}

// Preview card for previous/next events - uses design era from timemachine
function PreviewCard({
    event,
    position,
    accentColor,
    secondaryColor,
    onNavigate,
    targetIndex,
    gridOpacity,
    lineStyle = "solid",
}: {
    event: LifeEvent;
    position: "previous" | "next";
    accentColor: string;
    secondaryColor: string;
    onNavigate?: (index: number) => void;
    targetIndex: number;
    gridOpacity: number;
    lineStyle?: "dotted" | "dashed" | "solid";
}) {
    const [isHovered, setIsHovered] = useState(false);
    
    // Use design era colors from timemachine
    const ACCENT = accentColor;
    const SECONDARY = secondaryColor;
    const GRID_OPACITY = gridOpacity;
    
    // Era-based background gradient using accent color
    const backgroundGradient = `linear-gradient(135deg, color-mix(in srgb, ${ACCENT} 8%, rgba(12,12,20,0.4)) 0%, color-mix(in srgb, ${SECONDARY} 5%, rgba(20,16,32,0.4)) 100%)`;

    return (
        <div
            className="relative h-full cursor-pointer"
            onClick={() => onNavigate?.(targetIndex)}
        >
            <motion.div
                className="relative overflow-hidden border min-h-[400px]"
                style={{
                    background: backgroundGradient,
                    borderColor: isHovered 
                        ? `color-mix(in srgb, ${ACCENT} 30%, transparent)` 
                        : `color-mix(in srgb, ${ACCENT} 10%, transparent)`,
                    borderStyle: lineStyle,
                    boxShadow: isHovered
                        ? `0 2px 8px rgba(0,0,0,0.2), 0 0 15px color-mix(in srgb, ${ACCENT} 3%, transparent)`
                        : `0 2px 6px rgba(0,0,0,0.15), 0 0 8px color-mix(in srgb, ${ACCENT} 2%, transparent)`,
                    backdropFilter: "blur(8px)",
                    transition: "border-color 0.3s, box-shadow 0.3s",
                }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.2 }}
            >
                {/* Era-based grid pattern */}
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        backgroundImage: `
                            linear-gradient(${ACCENT} 1px, transparent 1px),
                            linear-gradient(90deg, ${ACCENT} 1px, transparent 1px)
                        `,
                        backgroundSize: "20px 20px",
                        opacity: GRID_OPACITY * (isHovered ? 2 : 1),
                        transition: "opacity 0.3s",
                    }}
                />

                {/* Year label */}
                <div className="px-4 pt-4 pb-2 relative z-10">
                    <div className="flex items-center justify-between mb-2">
                        <div
                            className="text-2xl font-mono font-black tracking-tight"
                            style={{ color: `color-mix(in srgb, ${ACCENT} 60%, transparent)`, opacity: 0.7 }}
                        >
                            {event.year}
                        </div>
                        <div
                            className="text-[8px] font-mono uppercase tracking-wider px-2 py-1 border"
                            style={{
                                borderColor: `color-mix(in srgb, ${ACCENT} 20%, transparent)`,
                                borderStyle: lineStyle,
                                color: `color-mix(in srgb, ${ACCENT} 50%, transparent)`,
                                opacity: 0.6,
                            }}
                        >
                            {event.year}
                        </div>
                    </div>
                </div>

                {/* Content preview */}
                <div className="px-4 pb-4 relative z-10">
                    <div className="flex items-start gap-2 mb-2">
                        {event.icon && (
                            <span className="text-lg">{event.icon}</span>
                        )}
                        <h3
                            className="text-sm font-mono font-bold leading-tight flex-1"
                            style={{ color: "rgba(255,255,255,0.5)" }}
                        >
                            {event.title}
                        </h3>
                    </div>
                    {event.location && (
                        <div
                            className="text-xs font-mono mb-2"
                            style={{ color: `color-mix(in srgb, ${SECONDARY} 60%, transparent)`, opacity: 0.4 }}
                        >
                            📍 {event.location}
                        </div>
                    )}
                    <p
                        className="text-xs font-mono leading-relaxed line-clamp-3"
                        style={{ color: "rgba(255,255,255,0.35)" }}
                    >
                        {event.description}
                    </p>
                </div>

                {/* Navigation hint */}
                <div
                    className="absolute bottom-2 left-1/2 transform -translate-x-1/2 px-3 py-1 font-mono text-[9px] uppercase tracking-wider border relative z-10"
                    style={{
                        borderColor: `color-mix(in srgb, ${ACCENT} 15%, transparent)`,
                        borderStyle: lineStyle,
                        color: `color-mix(in srgb, ${ACCENT} 40%, transparent)`,
                        backgroundColor: `color-mix(in srgb, ${ACCENT} 2%, transparent)`,
                        opacity: 0.5,
                    }}
                >
                    {position === "previous" ? "← PREVIOUS" : "NEXT →"}
                </div>
            </motion.div>
        </div>
    );
}

// Horizontal wireframe connector lines between columns
function HorizontalConnector({
    leftRef,
    rightRef,
    accentColor,
}: {
    leftRef: React.RefObject<HTMLDivElement | null>;
    rightRef: React.RefObject<HTMLDivElement | null>;
    accentColor: string;
}) {
    const [leftRect, setLeftRect] = useState({ right: 0, top: 0, bottom: 0 });
    const [rightRect, setRightRect] = useState({ left: 0, top: 0, bottom: 0 });

    useEffect(() => {
        const updateRects = () => {
            if (leftRef.current) {
                const r = leftRef.current.getBoundingClientRect();
                setLeftRect({ right: r.right, top: r.top, bottom: r.bottom });
            }
            if (rightRef.current) {
                const r = rightRef.current.getBoundingClientRect();
                setRightRect({ left: r.left, top: r.top, bottom: r.bottom });
            }
        };

        updateRects();
        window.addEventListener("resize", updateRects);
        window.addEventListener("scroll", updateRects);

        return () => {
            window.removeEventListener("resize", updateRects);
            window.removeEventListener("scroll", updateRects);
        };
    }, [leftRef, rightRef]);

    const connectorTop = Math.max(leftRect.top, rightRect.top);
    const connectorBottom = Math.min(leftRect.bottom, rightRect.bottom);
    const connectorHeight = Math.max(0, connectorBottom - connectorTop);
    const connectorLeft = leftRect.right;
    const connectorWidth = Math.max(0, rightRect.left - leftRect.right);

    if (connectorWidth <= 0 || connectorHeight <= 0) return null;

    return (
        <>
            {/* Top horizontal line */}
            <motion.div
                className="fixed h-px pointer-events-none z-45"
                style={{
                    left: connectorLeft,
                    top: connectorTop,
                    width: connectorWidth,
                    backgroundColor: accentColor,
                    opacity: 0.3,
                }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
            />
            {/* Bottom horizontal line */}
            <motion.div
                className="fixed h-px pointer-events-none z-45"
                style={{
                    left: connectorLeft,
                    top: connectorBottom - 1,
                    width: connectorWidth,
                    backgroundColor: accentColor,
                    opacity: 0.3,
                }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
            />
        </>
    );
}

// Expandable details with wireframe aesthetic - uses design era from timemachine
function ExpandableDetails({
    details,
    tags,
    isExpanded,
    onToggle,
    accentColor,
    secondaryColor,
    lineStyle = "solid",
}: {
    details?: string;
    tags?: string[];
    isExpanded: boolean;
    onToggle: () => void;
    accentColor: string;
    secondaryColor: string;
    lineStyle?: "dotted" | "dashed" | "solid";
}) {
    const hasContent = details || (tags && tags.length > 0);
    if (!hasContent) return null;

    return (
        <div className="mt-4">
            <button
                onClick={onToggle}
                className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider transition-colors group"
                style={{ color: accentColor }}
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
                        <div className="pt-4 space-y-4">
                            {details && (
                                <div
                                    className="relative pl-4"
                                    style={{ 
                                        borderLeft: `2px solid color-mix(in srgb, ${accentColor} 25%, transparent)`,
                                        borderLeftStyle: lineStyle,
                                    }}
                                >
                                    {/* Wireframe quote marks */}
                                    <span
                                        className="absolute -left-1 -top-1 text-lg font-mono"
                                        style={{ color: accentColor, opacity: 0.5 }}
                                    >
                                        "
                                    </span>
                                    <p
                                        className="text-sm leading-relaxed italic"
                                        style={{ color: "rgba(255,255,255,0.75)" }}
                                    >
                                        {details}
                                    </p>
                                </div>
                            )}

                            {tags && tags.length > 0 && (
                                <div className="flex flex-wrap gap-2" style={{ minHeight: '24px' }}>
                                    {tags.map((tag, index) => {
                                        // Ensure secondary color tags are visible by mixing with accent color
                                        // This prevents very dark colors (like #0a3d0a) from being invisible
                                        const isEven = index % 2 === 0;
                                        const tagColor = isEven
                                            ? accentColor
                                            : `color-mix(in srgb, ${secondaryColor} 50%, ${accentColor} 50%)`;
                                        const tagBorderColor = isEven
                                            ? `color-mix(in srgb, ${accentColor} 31%, transparent)`
                                            : `color-mix(in srgb, ${tagColor} 50%, transparent)`;
                                        
                                        return (
                                            <motion.span
                                                key={tag}
                                                className="inline-flex items-center gap-1.5 px-2 py-1 font-mono text-[10px] uppercase border"
                                                style={{
                                                    borderColor: tagBorderColor,
                                                    borderStyle: lineStyle,
                                                    color: tagColor,
                                                    visibility: 'visible',
                                                    display: 'inline-flex',
                                                    opacity: 1,
                                                }}
                                                initial={{ opacity: 0, y: 8 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.05 + 0.15, duration: 0.3 }}
                                            >
                                                <span className="w-1.5 h-1.5 flex-shrink-0" style={{
                                                    backgroundColor: tagColor
                                                }} />
                                                {tag}
                                            </motion.span>
                                        );
                                    })}
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
    previousEvent,
    nextEvent,
    onNavigate,
    allEvents = [],
}: JourneyStoryCardProps) {
    const [displayedText, setDisplayedText] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [isExpanded, setIsExpanded] = useState(true);
    const [isHovered, setIsHovered] = useState(false);
    const previousCardRef = useRef<HTMLDivElement>(null);
    const currentCardRef = useRef<HTMLDivElement>(null);
    const nextCardRef = useRef<HTMLDivElement>(null);

    // Use design era colors from timemachine (e.g., "1970 ASCII")
    const { currentEra } = useDesignEra();
    
    const ACCENT_CSS = currentEra.colors.accent;
    const SECONDARY_CSS = currentEra.colors.secondary;
    const GRID_OPACITY = currentEra.designTokens.gridOpacity ?? 0.1;
    const LINE_STYLE = "solid" as const; // Design era uses solid lines

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

    // Reset expanded state when event changes - keep expanded by default
    useEffect(() => {
        setIsExpanded(true);
    }, [currentEventIndex]);

    // Calculate indices for navigation
    const previousIndex = previousEvent && allEvents.length > 0
        ? allEvents.findIndex(e => e.id === previousEvent.id)
        : -1;
    const nextIndex = nextEvent && allEvents.length > 0
        ? allEvents.findIndex(e => e.id === nextEvent.id)
        : -1;

    if (!isActive) return null;

    return (
        <motion.div 
            className="fixed inset-0 z-40 pointer-events-none"
            style={{ 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                width: '100vw'
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
        >
                {/* Flex container that groups all three cards together and centers them */}
                <div 
                    className="flex items-center justify-center gap-4 pointer-events-none"
                    style={{ 
                        width: '100%',
                        maxWidth: '100vw',
                        padding: '0 16px'
                    }}
                >
                    {/* Previous Year Card - Left of center */}
                    <motion.div
                        ref={previousCardRef}
                        className="w-[280px] md:w-[320px] pointer-events-auto flex-shrink-0"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: previousEvent ? 0.4 : 0.2, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                    >
                        {previousEvent ? (
                            <div className="transition-all duration-300 hover:opacity-70">
                                <PreviewCard
                                    event={previousEvent}
                                    position="previous"
                                    accentColor={ACCENT_CSS}
                                    secondaryColor={SECONDARY_CSS}
                                    onNavigate={onNavigate}
                                    targetIndex={previousIndex}
                                    gridOpacity={GRID_OPACITY}
                                    lineStyle={LINE_STYLE}
                                />
                            </div>
                        ) : (
                            <div 
                                className="h-[400px] flex items-center justify-center border opacity-30"
                                style={{ 
                                    borderColor: `color-mix(in srgb, ${ACCENT_CSS} 30%, transparent)`,
                                    borderStyle: LINE_STYLE,
                                }}
                            >
                                <span className="font-mono text-xs" style={{ color: ACCENT_CSS }}>
                                    ...
                                </span>
                            </div>
                        )}
                    </motion.div>

                    {/* Current Year Card - Center of the group */}
                    <motion.div
                        ref={currentCardRef}
                        className="w-[95%] max-w-[600px] pointer-events-auto flex-shrink-0"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                    >
                    {/* Wireframe lines extending to viewport - design-era accent to match header */}
                    <WireframeLines
                        isHovered={isHovered}
                        containerRef={currentCardRef}
                        accentColor={ACCENT_CSS}
                    />

                    {/* Main Card with blueprint aesthetic - uses era design system */}
                    <div
                        className="relative overflow-hidden border min-h-[400px]"
                        style={{
                            background: `linear-gradient(135deg, color-mix(in srgb, ${ACCENT_CSS} 12%, rgba(12,12,20,0.97)) 0%, color-mix(in srgb, ${SECONDARY_CSS} 8%, rgba(20,16,32,0.97)) 100%)`,
                            borderColor: isHovered 
                                ? ACCENT_CSS 
                                : `color-mix(in srgb, ${ACCENT_CSS} 30%, rgba(255,255,255,0.08))`,
                            borderStyle: LINE_STYLE,
                            boxShadow: isHovered
                                ? `0 8px 40px rgba(0,0,0,0.6), 0 0 60px color-mix(in srgb, ${ACCENT_CSS} 8%, transparent)`
                                : `0 8px 32px rgba(0,0,0,0.5), 0 0 40px color-mix(in srgb, ${ACCENT_CSS} 5%, transparent)`,
                            backdropFilter: "blur(16px)",
                            transition: "border-color 0.3s, box-shadow 0.3s",
                        }}
                        >
                            {/* Corner markers */}
                            <WireframeCornerMarkers />

                            {/* Internal grid pattern - era-based */}
                            <div
                                className="absolute inset-0 pointer-events-none"
                                style={{
                                    backgroundImage: `
                                        linear-gradient(${ACCENT_CSS} 1px, transparent 1px),
                                        linear-gradient(90deg, ${ACCENT_CSS} 1px, transparent 1px)
                                    `,
                                    backgroundSize: "20px 20px",
                                    opacity: GRID_OPACITY * (isHovered ? 2 : 1),
                                    transition: "opacity 0.3s",
                                    borderStyle: LINE_STYLE,
                                }}
                            />

                    {/* Header Row */}
                    <div className="relative px-5 pt-4 pb-3 flex items-center justify-between gap-6">
                        {/* Year and Age with wireframe styling */}
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                {/* Measurement line above year */}
                                <div
                                    className="absolute -top-2 left-0 right-0 h-px"
                                    style={{ backgroundColor: ACCENT_MUTED }}
                                />
                                <div
                                    className="text-3xl font-mono font-black tracking-tight text-center"
                                    style={{ color: ACCENT_CSS }}
                                >
                                    {year}
                                </div>
                                <div
                                    className="text-[10px] font-mono uppercase tracking-wider text-center"
                                    style={{ color: SECONDARY_CSS, opacity: 0.7 }}
                                >
                                    Age {age}
                                </div>
                            </div>
                        </div>

                        {/* Progress indicator */}
                        <div className="flex flex-col items-center gap-1">
                            <span
                                className="font-mono text-[10px] uppercase tracking-wider"
                                style={{ color: "rgba(255,255,255,0.4)" }}
                            >
                                Memory
                            </span>
                            <div className="flex items-center gap-1">
                                <span
                                    className="font-mono text-sm font-bold"
                                    style={{ color: ACCENT_CSS }}
                                >
                                    {currentEventIndex + 1}
                                </span>
                                <span
                                    className="font-mono text-xs"
                                    style={{ color: "rgba(255,255,255,0.3)" }}
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
                            accentColor={ACCENT_CSS}
                            secondaryColor={SECONDARY_CSS}
                        />
                    </div>

                    {/* Content Section */}
                    <div className="relative px-5 pb-4">
                        {/* Horizontal measurement line */}
                        <div
                            className="absolute top-0 left-5 right-5 h-px"
                            style={{ backgroundColor: ACCENT_SOFT }}
                        />

                        {/* Title */}
                        <h2
                            className="text-lg font-mono font-bold mt-3 mb-2 leading-snug flex items-center justify-start gap-2 text-left"
                            style={{ color: "rgba(255,255,255,0.95)" }}
                        >
                            {content.icon && (
                                <span className="text-xl">{content.icon}</span>
                            )}
                            {content.title}
                        </h2>

                        {/* Location with wireframe marker */}
                        {content.location && (
                            <div
                                className="flex items-center justify-start gap-2 mb-3 font-mono text-xs"
                                style={{ color: SECONDARY_CSS, opacity: 0.8 }}
                            >
                                <div
                                    className="w-2 h-2 border"
                                    style={{ 
                                        borderColor: SECONDARY_CSS,
                                        borderStyle: LINE_STYLE,
                                    }}
                                />
                                <span>📍 {content.location}</span>
                            </div>
                        )}

                        {/* Description with typewriter */}
                        <div className="relative mb-2 text-left">
                            {/* Accent line above text */}
                            <div
                                className="absolute -top-2 left-0 w-12 h-px"
                                style={{ backgroundColor: ACCENT_MED }}
                            />
                            <p
                                className="text-sm font-mono leading-relaxed"
                                style={{ color: "rgba(255,255,255,0.8)" }}
                            >
                                {displayedText}
                                {isTyping && (
                                    <motion.span
                                        className="inline-block ml-0.5 w-2 h-4 align-middle"
                                        style={{ backgroundColor: ACCENT_CSS }}
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
                            onToggle={() => setIsExpanded(!isExpanded)}
                            accentColor={ACCENT_CSS}
                            secondaryColor={SECONDARY_CSS}
                            lineStyle={LINE_STYLE}
                        />
                    </div>

                            {/* Footer with progress visualization */}
                            <div
                                className="relative px-5 py-3 flex items-center justify-between"
                                style={{
                                    background: "rgba(0,0,0,0.4)",
                                    borderTop: `1px solid ${ACCENT_SOFT}`,
                                }}
                            >
                                {/* Level progress percentage */}
                                <span
                                    className="font-mono text-[10px] uppercase tracking-wider"
                                    style={{ color: ACCENT_CSS }}
                                >
                                    {Math.round(levelProgress * 100)}%
                                </span>

                                {/* Progress bar with wireframe aesthetic */}
                                <div className="flex-1 ml-4">
                                    <div
                                        className="h-1 w-full relative overflow-hidden"
                                        style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
                                    >
                                        <motion.div
                                            className="h-full"
                                            style={{ backgroundColor: ACCENT_CSS }}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${levelProgress * 100}%` }}
                                            transition={{ duration: 0.5, ease: "easeOut" }}
                                        />
                                        {/* Tick marks */}
                                        {[0.25, 0.5, 0.75].map((tick) => (
                                            <div
                                                key={tick}
                                                className="absolute top-0 w-px h-1"
                                                style={{
                                                    left: `${tick * 100}%`,
                                                    backgroundColor: "rgba(255,255,255,0.3)",
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Next Year Card - Right of center */}
                    <motion.div
                        ref={nextCardRef}
                        className="w-[280px] md:w-[320px] pointer-events-auto flex-shrink-0"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: nextEvent ? 0.4 : 0.2, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                    >
                        {nextEvent ? (
                            <div className="transition-all duration-300 hover:opacity-70">
                                <PreviewCard
                                    event={nextEvent}
                                    position="next"
                                    accentColor={ACCENT_CSS}
                                    secondaryColor={SECONDARY_CSS}
                                    onNavigate={onNavigate}
                                    targetIndex={nextIndex}
                                    gridOpacity={GRID_OPACITY}
                                    lineStyle={LINE_STYLE}
                                />
                            </div>
                        ) : (
                            <div 
                                className="h-[400px] flex items-center justify-center border opacity-30"
                                style={{ 
                                    borderColor: `color-mix(in srgb, ${ACCENT_CSS} 30%, transparent)`,
                                    borderStyle: LINE_STYLE,
                                }}
                            >
                                <span className="font-mono text-xs" style={{ color: ACCENT_CSS }}>
                                    ...
                                </span>
                            </div>
                        )}
                    </motion.div>
                </div>

                {/* Horizontal wireframe connector lines */}
                {previousEvent && (
                    <HorizontalConnector
                        leftRef={previousCardRef}
                        rightRef={currentCardRef}
                        accentColor={ACCENT_CSS}
                    />
                )}
                {nextEvent && (
                    <HorizontalConnector
                        leftRef={currentCardRef}
                        rightRef={nextCardRef}
                        accentColor={ACCENT_CSS}
                    />
                )}
        </motion.div>
    );
}
