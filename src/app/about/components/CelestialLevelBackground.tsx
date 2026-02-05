"use client";

import { motion } from "framer-motion";
import { ReactNode, useMemo } from "react";
import { PixelSkyGrid } from "./PixelSkyGrid";
import { JourneyStoryCard } from "./JourneyStoryCard";

interface Skill {
    id: string;
    name: string;
    level: "beginner" | "intermediate" | "advanced" | "expert";
    category: string;
}

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
    skills?: Skill[];
}

interface CelestialLevelBackgroundProps {
    year: number;
    title: string;
    description: string;
    children?: ReactNode;
    className?: string;
    playerX?: number;
    worldWidth?: number;
    event?: LifeEvent;
    levelProgress?: number;
    totalEvents: number;
    currentEventIndex: number;
    onStarClick?: (skillId: string) => void;
}

const GRID_SIZE = 20;

export function CelestialLevelBackground({
    year: _year,
    title: _title,
    description: _description,
    children,
    className,
    playerX = 0,
    worldWidth = 2000,
    event,
    levelProgress = 0,
    totalEvents: _totalEvents,
    currentEventIndex: _currentEventIndex,
    onStarClick,
}: CelestialLevelBackgroundProps) {
    const cameraOffset = Math.max(0, playerX - 400);

    // Story content
    const storyContent = useMemo(() => {
        if (!event) return null;

        return {
            title: event.title,
            subtitle: event.period || `${event.year}`,
            description: event.description,
            details: event.details,
            location: event.location,
            tags: event.tags,
            icon: event.icon,
        };
    }, [event]);

    const groundGradient = useMemo(() => {
        return "linear-gradient(180deg, var(--bg-card) 0%, var(--bg-main) 100%)";
    }, []);

    return (
        <div className={`relative w-full h-full overflow-hidden ${className}`}>
            {/* Pixel Sky Grid - uses levelProgress for sun/moon/stars */}
            <div className="absolute inset-0 pt-16">
                <PixelSkyGrid
                    levelProgress={levelProgress}
                    className="z-0"
                    skills={event?.skills || []}
                    onStarClick={onStarClick}
                    currentYear={event?.year}
                />
            </div>

            {/* World Container - Scrolls with player */}
            <div
                className="absolute inset-0 z-20"
                style={{
                    transform: `translateX(${-cameraOffset}px)`,
                    transition: "transform 0.05s linear",
                }}
            >
                {/* Ground */}
                <div
                    className="absolute bottom-0 left-0 h-20"
                    style={{
                        width: worldWidth + 800,
                        background: groundGradient,
                        borderTop: "2px solid var(--border-color)",
                    }}
                >
                    {/* Ground texture */}
                    <div
                        className="absolute inset-0"
                        style={{
                            backgroundImage: `linear-gradient(90deg, var(--border-color) 1px, transparent 1px)`,
                            backgroundSize: `${GRID_SIZE * 2}px ${GRID_SIZE}px`,
                            opacity: 0.3,
                        }}
                    />
                </div>

                {/* Simple path markers */}
                {[0.25, 0.5, 0.75].map((ratio, index) => (
                    <div
                        key={`marker-${index}`}
                        className="absolute bottom-20"
                        style={{ left: worldWidth * ratio - 2 }}
                    >
                        <div
                            className="w-1 h-8"
                            style={{
                                background: `linear-gradient(180deg, var(--accent-color), transparent)`,
                                opacity: 0.6,
                            }}
                        />
                    </div>
                ))}

                {/* Goal marker */}
                <div
                    className="absolute bottom-20"
                    style={{ left: worldWidth - 60 }}
                >
                    <div className="flex flex-col items-center">
                        <motion.div
                            className="text-2xl mb-2"
                            animate={{ y: [0, -5, 0], scale: [1, 1.1, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                        >
                            ✨
                        </motion.div>
                        <div
                            className="w-1 h-16"
                            style={{ background: `linear-gradient(180deg, var(--accent-color), transparent)` }}
                        />
                    </div>
                </div>
            </div>

            {/* Journey Story Card - Center bottom floating */}
            {storyContent && event && (
                <JourneyStoryCard
                    content={storyContent}
                    age={event.age}
                    year={event.year}
                    isActive={true}
                    levelProgress={levelProgress}
                    totalEvents={_totalEvents}
                    currentEventIndex={_currentEventIndex}
                />
            )}

            {children}
        </div>
    );
}
