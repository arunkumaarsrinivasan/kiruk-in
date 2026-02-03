"use client";

import { motion } from "framer-motion";
import { ReactNode, useMemo } from "react";
import { CelestialSkyCanvas } from "./CelestialSkyCanvas";
import { TypewriterStory } from "./TypewriterStory";

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

    // Phase colors based on time of day (level progress)
    const phaseColor = useMemo(() => {
        if (levelProgress < 0.35) return "#FFC857"; // Sun phase - gold
        if (levelProgress < 0.70) return "#90CDF4"; // Moon phase - blue
        return "#FFD700"; // Stars phase - bright gold
    }, [levelProgress]);

    const groundGradient = useMemo(() => {
        if (levelProgress < 0.35) {
            // Sun phase - warm earth
            return "linear-gradient(180deg, rgba(139,90,43,0.9) 0%, rgba(101,67,33,1) 100%)";
        } else if (levelProgress < 0.70) {
            // Moon phase - cool night
            return "linear-gradient(180deg, rgba(30,40,60,0.95) 0%, rgba(20,30,45,1) 100%)";
        } else {
            // Stars phase - deep dark
            return "linear-gradient(180deg, rgba(15,15,30,0.98) 0%, rgba(10,10,20,1) 100%)";
        }
    }, [levelProgress]);

    return (
        <div
            className={`relative w-full h-full overflow-hidden ${className}`}
        >
            {/* Celestial Sky Canvas - positioned below navbar, uses levelProgress for sun/moon/stars */}
            <div className="absolute inset-0 pt-16">
                <CelestialSkyCanvas
                    levelProgress={levelProgress}
                    className="z-0"
                />
            </div>

            {/* Subtle grid overlay */}
            <div
                className="absolute inset-0 pointer-events-none z-10"
                style={{
                    backgroundImage: `
            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
          `,
                    backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
                }}
            />

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
                        borderTop: `2px solid ${phaseColor}40`,
                    }}
                >
                    {/* Ground texture */}
                    <div
                        className="absolute inset-0"
                        style={{
                            backgroundImage: `linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
                            backgroundSize: `${GRID_SIZE * 2}px ${GRID_SIZE}px`,
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
                                background: `linear-gradient(180deg, ${phaseColor}60, transparent)`,
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
                            style={{ background: `linear-gradient(180deg, ${phaseColor}, transparent)` }}
                        />
                    </div>
                </div>
            </div>

            {/* Typewriter Story - Center bottom floating */}
            {storyContent && event && (
                <TypewriterStory
                    content={storyContent}
                    age={event.age}
                    year={event.year}
                    isActive={true}
                    phaseColor={phaseColor}
                    levelProgress={levelProgress}
                />
            )}

            {children}
        </div>
    );
}
