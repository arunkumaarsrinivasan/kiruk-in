"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useMemo } from "react";
import type { CharacterStage } from "./PixelCharacter";

interface ThoughtBubbleProps {
    stage: CharacterStage;
    isActive: boolean;
    className?: string;
}

// Thought content varies by life stage
const thoughtsByStage: Record<CharacterStage, string[]> = {
    baby: ["🍼", "⭐", "🎈", "🧸", "😴", "🌟", "🎀"],
    toddler: ["🖍️", "🎨", "🌈", "🚀", "🦋", "🎵", "✨", "Why?"],
    child: ["🎮", "📚", "🏀", "🎵", "💡", "🤔", "Cool!", "Games!"],
    teen: ["</code>", "🎧", "🎨", "💻", "🎬", "Create!", "Why not?", "🤖"],
    adult: ["Design", "💡", "Ship it!", "🎯", "UX", "✨", "🚀", "Build"],
    professional: ["@kirukism", "Design ✨", "Process", "🎯", "Ship!", "Create", "💡", "Build"],
};

// Doodle/sketch elements for creative thoughts
const doodleElements = [
    "○—○—○",
    "◇ → ◇",
    "[ □ ]",
    "∿∿∿",
    "⌘ + Z",
    "F12",
];

export function ThoughtBubble({ stage, isActive, className = "" }: ThoughtBubbleProps) {
    const [currentThought, setCurrentThought] = useState("");
    const [isVisible, setIsVisible] = useState(false);

    const thoughts = useMemo(() => {
        const stageThoughts = [...thoughtsByStage[stage]];
        // Add some universal doodles for creative stages
        if (["teen", "adult", "professional"].includes(stage)) {
            stageThoughts.push(...doodleElements.slice(0, 3));
        }
        return stageThoughts;
    }, [stage]);

    // Cycle through thoughts periodically
    useEffect(() => {
        if (!isActive) {
            setIsVisible(false);
            return;
        }

        const showThought = () => {
            const randomThought = thoughts[Math.floor(Math.random() * thoughts.length)];
            setCurrentThought(randomThought);
            setIsVisible(true);

            // Hide after a few seconds
            setTimeout(() => {
                setIsVisible(false);
            }, 2500);
        };

        // Initial delay before first thought
        const initialDelay = setTimeout(() => {
            showThought();
        }, 1500);

        // Regular interval for thoughts
        const interval = setInterval(() => {
            showThought();
        }, 6000 + Math.random() * 4000);

        return () => {
            clearTimeout(initialDelay);
            clearInterval(interval);
        };
    }, [isActive, thoughts]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    className={`absolute pointer-events-none z-50 ${className}`}
                    initial={{ opacity: 0, scale: 0, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.5, y: -5 }}
                    transition={{ type: "spring", stiffness: 500, damping: 25 }}
                >
                    <div
                        className="relative px-4 py-2 font-mono text-sm whitespace-nowrap"
                        style={{
                            background: "rgba(255, 255, 255, 0.98)",
                            border: "3px solid #1a1a2e",
                            borderRadius: "16px 16px 16px 4px",
                            boxShadow: "4px 4px 0px rgba(26, 26, 46, 0.3)",
                            color: "#1a1a2e",
                        }}
                    >
                        {currentThought}

                        {/* Bubble pointer */}
                        <svg
                            className="absolute -bottom-3 left-2"
                            width="16"
                            height="12"
                            viewBox="0 0 16 12"
                            fill="none"
                        >
                            <path
                                d="M0 0 L8 12 L4 0"
                                fill="rgba(255, 255, 255, 0.98)"
                            />
                            <path
                                d="M0 0 L8 11"
                                stroke="#1a1a2e"
                                strokeWidth="3"
                            />
                        </svg>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// Floating decorative thought doodles for the environment
export function FloatingThoughts({ stage, isPlaying }: { stage: CharacterStage; isPlaying: boolean }) {
    const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; content: string; delay: number }>>([]);

    useEffect(() => {
        if (!isPlaying) {
            setParticles([]);
            return;
        }

        const thoughts = thoughtsByStage[stage];
        const newParticles = Array.from({ length: 5 }, (_, i) => ({
            id: i,
            x: 10 + Math.random() * 80,
            y: 10 + Math.random() * 60,
            content: thoughts[Math.floor(Math.random() * thoughts.length)],
            delay: i * 0.5,
        }));

        setParticles(newParticles);
    }, [stage, isPlaying]);

    if (!isPlaying) return null;

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-5">
            {particles.map((particle) => (
                <motion.div
                    key={particle.id}
                    className="absolute font-mono text-xl opacity-20"
                    style={{
                        left: `${particle.x}%`,
                        top: `${particle.y}%`,
                        color: "var(--text-muted)",
                    }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{
                        opacity: [0.1, 0.25, 0.1],
                        y: [-10, -30, -50],
                        x: [0, 5, -5, 0],
                    }}
                    transition={{
                        duration: 8,
                        delay: particle.delay,
                        repeat: Infinity,
                        repeatType: "loop",
                    }}
                >
                    {particle.content}
                </motion.div>
            ))}
        </div>
    );
}
