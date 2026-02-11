"use client";

import { ReactNode, useMemo } from "react";
import { AnimatePresence } from "framer-motion";
import { OSDesktopBackground } from "./OSDesktopBackground";
import { OSTaskbar } from "./OSTaskbar";
import { JourneyStoryCard } from "./JourneyStoryCard";
import { getOSTheme } from "@/data/os-theme-config";

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
    allEvents = [],
    onNavigate,
}: CelestialLevelBackgroundProps) {
    const cameraOffset = Math.max(0, playerX - 400);

    // Get OS theme for current event year
    const osTheme = useMemo(() => getOSTheme(event?.year ?? 2001), [event?.year]);

    // Calculate previous and next events with wraparound navigation
    const previousEvent = useMemo(() => {
        if (!allEvents.length) return null;
        const previousIndex = _currentEventIndex <= 0
            ? allEvents.length - 1
            : _currentEventIndex - 1;
        return allEvents[previousIndex] || null;
    }, [allEvents, _currentEventIndex]);

    const nextEvent = useMemo(() => {
        if (!allEvents.length) return null;
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

    return (
        <div className={`relative w-full h-full overflow-hidden ${className}`}>
            {/* OS Desktop Background - replaces PixelSkyGrid */}
            <div className="absolute inset-0 z-0">
                <OSDesktopBackground theme={osTheme} />
            </div>

            {/* World Container - Scrolls with player */}
            <div
                className="absolute inset-0 z-10"
                style={{
                    transform: `translateX(${-cameraOffset}px)`,
                    transition: "transform 0.05s linear",
                }}
            >
                {/* OS Taskbar - replaces plain ground */}
                <OSTaskbar theme={osTheme} width={worldWidth} />

                {/* Path markers styled for the OS theme */}
                {[0.25, 0.5, 0.75].map((ratio) => (
                    <div
                        key={`marker-${ratio}`}
                        className="absolute"
                        style={{
                            bottom: osTheme.taskbar.height,
                            left: worldWidth * ratio - 2,
                        }}
                    >
                        <div
                            style={{
                                width: 4,
                                height: 16,
                                background: `linear-gradient(to top, ${osTheme.accentColor}, transparent)`,
                                opacity: 0.4,
                            }}
                        />
                    </div>
                ))}
            </div>

            {/* Journey Story Card - now themed as OS window */}
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
