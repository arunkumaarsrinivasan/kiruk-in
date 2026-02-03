"use client";

import { motion } from "framer-motion";

interface CelestialChipProps {
    phase: "sun" | "moon" | "stars";
    year: number;
    title: string;
    icon?: string;
    isActive?: boolean;
    onClick?: () => void;
    className?: string;
}

// Phase-specific styling
const phaseStyles = {
    sun: {
        gradient: "linear-gradient(135deg, #FF6B35 0%, #FFC857 100%)",
        border: "#FF9500",
        glow: "rgba(255,150,50,0.4)",
        icon: "☀️",
        label: "Origins",
    },
    moon: {
        gradient: "linear-gradient(135deg, #4A5568 0%, #90CDF4 100%)",
        border: "#718096",
        glow: "rgba(144,205,244,0.3)",
        icon: "🌙",
        label: "Journey",
    },
    stars: {
        gradient: "linear-gradient(135deg, #805AD5 0%, #1A202C 100%)",
        border: "#9F7AEA",
        glow: "rgba(159,122,234,0.4)",
        icon: "⭐",
        label: "Milestones",
    },
};

export function CelestialChip({
    phase,
    year,
    title,
    icon,
    isActive = false,
    onClick,
    className = "",
}: CelestialChipProps) {
    const style = phaseStyles[phase];

    return (
        <motion.button
            onClick={onClick}
            className={`
        relative flex items-center gap-2 px-3 py-2 
        font-mono text-xs rounded-sm
        transition-all duration-300
        border-2 cursor-pointer
        ${className}
      `}
            style={{
                background: isActive ? style.gradient : "var(--bg-card)",
                borderColor: isActive ? style.border : "var(--border-color)",
                boxShadow: isActive ? `0 0 20px ${style.glow}` : "none",
                color: isActive ? "#fff" : "var(--text-main)",
            }}
            whileHover={{
                scale: 1.02,
                boxShadow: `0 0 15px ${style.glow}`,
            }}
            whileTap={{ scale: 0.98 }}
        >
            {/* Phase icon */}
            <span className="text-base">{icon || style.icon}</span>

            {/* Year badge */}
            <span
                className="font-bold"
                style={{ color: isActive ? "#fff" : "var(--accent-color)" }}
            >
                {year}
            </span>

            {/* Title (truncated) */}
            <span
                className="hidden sm:inline max-w-[120px] truncate opacity-80"
                title={title}
            >
                {title}
            </span>

            {/* Active indicator glow */}
            {isActive && (
                <motion.div
                    className="absolute inset-0 rounded-sm pointer-events-none"
                    style={{
                        border: `2px solid ${style.border}`,
                    }}
                    animate={{
                        opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />
            )}
        </motion.button>
    );
}

// Phase indicator for the timeline header
interface PhaseIndicatorProps {
    phase: "sun" | "moon" | "stars";
    progress: number; // 0-1 within this phase
    isActive: boolean;
    onClick?: () => void;
}

export function PhaseIndicator({
    phase,
    progress,
    isActive,
    onClick,
}: PhaseIndicatorProps) {
    const style = phaseStyles[phase];

    return (
        <motion.button
            onClick={onClick}
            className={`
        relative flex flex-col items-center gap-1 px-4 py-2
        cursor-pointer transition-all duration-300
      `}
            style={{
                opacity: isActive ? 1 : 0.5,
            }}
            whileHover={{ opacity: 1, scale: 1.05 }}
        >
            {/* Phase icon with glow */}
            <div
                className="relative text-2xl"
                style={{
                    filter: isActive ? `drop-shadow(0 0 8px ${style.glow})` : "none",
                }}
            >
                {style.icon}
            </div>

            {/* Phase label */}
            <span
                className="font-mono text-[10px] uppercase tracking-wider"
                style={{ color: isActive ? "var(--accent-color)" : "var(--text-muted)" }}
            >
                {style.label}
            </span>

            {/* Progress bar */}
            <div
                className="w-12 h-1 rounded-full overflow-hidden"
                style={{ background: "var(--bg-main)" }}
            >
                <motion.div
                    className="h-full rounded-full"
                    style={{ background: style.gradient }}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress * 100}%` }}
                    transition={{ duration: 0.3 }}
                />
            </div>
        </motion.button>
    );
}

// Horizontal timeline of chips
interface CelestialTimelineProps {
    events: Array<{
        id: string;
        year: number;
        title: string;
        phase: "sun" | "moon" | "stars";
        icon?: string;
    }>;
    currentIndex: number;
    onSelect: (index: number) => void;
}

export function CelestialTimeline({
    events,
    currentIndex,
    onSelect,
}: CelestialTimelineProps) {
    return (
        <div className="flex items-center gap-1 overflow-x-auto py-2 px-4 scrollbar-hide">
            {events.map((event, index) => (
                <CelestialChip
                    key={event.id}
                    phase={event.phase}
                    year={event.year}
                    title={event.title}
                    icon={event.icon}
                    isActive={index === currentIndex}
                    onClick={() => onSelect(index)}
                />
            ))}
        </div>
    );
}
