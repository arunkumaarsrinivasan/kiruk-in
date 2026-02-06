"use client";

import { ReactNode, useMemo } from "react";
import { AnimatePresence } from "framer-motion";
import { PixelSkyGrid } from "./PixelSkyGrid";
import { JourneyStoryCard } from "./JourneyStoryCard";
import { CornerMarkers as WireframeCornerMarkers } from "@/components/ui/wireframe/MeasurementLines";
import { getEraConfig } from "@/data/timeline-era-config";

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
    allEvents?: LifeEvent[];
    onNavigate?: (index: number) => void;
}

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
    allEvents = [],
    onNavigate,
}: CelestialLevelBackgroundProps) {
    const cameraOffset = Math.max(0, playerX - 400);

    // Calculate previous and next events with wraparound navigation
    const previousEvent = useMemo(() => {
        if (!allEvents.length) return null;
        // Wraparound: if at index 0, go to last event
        const previousIndex = _currentEventIndex <= 0 
            ? allEvents.length - 1 
            : _currentEventIndex - 1;
        return allEvents[previousIndex] || null;
    }, [allEvents, _currentEventIndex]);

    const nextEvent = useMemo(() => {
        if (!allEvents.length) return null;
        // Wraparound: if at last index, go to first event
        const nextIndex = _currentEventIndex >= allEvents.length - 1 
            ? 0 
            : _currentEventIndex + 1;
        return allEvents[nextIndex] || null;
    }, [allEvents, _currentEventIndex]);

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

    const eraConfig = useMemo(() => getEraConfig(event?.age ?? 0), [event?.age]);

    return (
        <div className={`relative w-full h-full overflow-hidden ${className}`}>
            {/* Pixel Sky Grid - uses levelProgress for sun/moon/stars */}
            <div className="absolute inset-0 pt-16 z-0">
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
                className="absolute inset-0 z-10"
                style={{
                    transform: `translateX(${-cameraOffset}px)`,
                    transition: "transform 0.05s linear",
                }}
            >
                {/* Wireframe corner markers on world container */}
                <div className="absolute inset-0 pointer-events-none">
                    <WireframeCornerMarkers />
                </div>

                {/* Ground */}
                <div
                    className="absolute bottom-0 left-0 h-20"
                    style={{
                        width: worldWidth + 800,
                        background: "var(--bg-card)",
                        borderTop: "2px solid var(--border-color)",
                    }}
                />

                {/* Path markers - wireframe style matching design system era */}
                {[0.25, 0.5, 0.75].map((ratio) => (
                    <div
                        key={`marker-${ratio}`}
                        className="absolute bottom-20"
                        style={{ left: worldWidth * ratio - 4 }}
                    >
                        <div
                            className="border font-mono"
                            style={{
                                width: 8,
                                height: 24,
                                borderWidth: "var(--wireframe-outline-width, 1px)",
                                borderColor: "var(--wireframe-border-color, var(--border-color))",
                                borderStyle: eraConfig.lineStyle,
                                backgroundColor: "transparent",
                            }}
                        />
                    </div>
                ))}
            </div>

            {/* Journey Story Card - Horizontal three-column layout */}
            <AnimatePresence mode="wait">
                {storyContent && event && (
                    <JourneyStoryCard
                        key={event.id}
                        content={storyContent}
                        age={event.age}
                        year={event.year}
                        isActive={true}
                        levelProgress={levelProgress}
                        totalEvents={_totalEvents}
                        currentEventIndex={_currentEventIndex}
                        previousEvent={previousEvent}
                        nextEvent={nextEvent}
                        onNavigate={onNavigate}
                        allEvents={allEvents}
                    />
                )}
            </AnimatePresence>

            {children}
        </div>
    );
}
