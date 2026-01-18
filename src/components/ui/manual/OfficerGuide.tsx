'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HalfBodyCharacter } from '@/components/characters/HalfBodyCharacter';
import { SpeechBubble } from './SpeechBubble';
import { SectionCharacterConfig } from '@/data/section-characters';

// Officer character configuration
const OFFICER_CONFIG: SectionCharacterConfig = {
    sectionId: 'guide-officer',
    name: 'Officer Kiruk',
    description: 'Your guide through this portfolio',
    hatType: 'officer',
    hatColor: '#1A237E',
    costumeColors: {
        primary: '#1A237E',
        secondary: '#283593',
        accent: '#FFD700',
        skin: '#FDBF60',
        hair: '#4A4A4A',
    },
    personality: {
        eyeStyle: 'curious',
        mouthStyle: 'smile',
        blinkRate: 3500,
        idleAnimation: 'breathing',
    },
    props: {
        leftHand: 'badge',
        rightHand: 'notebook',
    },
    glowColor: 'rgba(255, 215, 0, 0.2)',
};

// FAQ questions and answers
const FAQ_ITEMS = [
    {
        question: "What is this page about?",
        answer: "This is Arun's portfolio - a creative developer who bridges design and code. Explore his skills, projects, and experience!"
    },
    {
        question: "What are your main skills?",
        answer: "Design systems, React/Next.js, AI-powered UX, mobile development with React Native, and bridging design with engineering."
    },
    {
        question: "How can I contact you?",
        answer: "Scroll to the Contact section or click the 'Make Contact' button. Email and LinkedIn are the fastest ways to reach out!"
    },
    {
        question: "What projects have you worked on?",
        answer: "Check out the Case Files section! Notable work includes design systems, AI products, and creative web experiences."
    },
    {
        question: "Why 'multiple hats'?",
        answer: "Arun wears Designer (creative vision), Developer (technical execution), and Bridge (connecting both worlds) hats!"
    }
];

// Contextual messages based on scroll sections
const SECTION_MESSAGES: Record<string, string[]> = {
    hero: [
        "Welcome! Click me for FAQ or scroll to explore.",
        "This dossier contains everything about KIRUK.",
    ],
    about: [
        "Subject profile loaded. Observe carefully.",
        "A design engineer with multiple capabilities.",
    ],
    skills: [
        "Technical proficiencies documented here.",
        "Hover over components for details.",
    ],
    experience: [
        "Mission logs from previous operations.",
        "Notable achievements marked with ⭐",
    ],
    projects: [
        "Case files ready for review.",
        "Each project tells a story.",
    ],
    contact: [
        "Ready to make contact?",
        "All communication channels active.",
    ],
    default: [
        "Click me to ask questions!",
        "The investigation continues.",
    ],
};

interface OfficerGuideProps {
    currentSection?: string;
    className?: string;
}

/**
 * Fixed sidebar officer character with FAQ chat panel
 * Click to open FAQ, responds to scroll position
 */
export function OfficerGuide({
    currentSection = 'hero',
    className = ''
}: OfficerGuideProps) {
    const [messageIndex, setMessageIndex] = useState(0);
    const [isBlinking, setIsBlinking] = useState(false);
    const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });
    const [headRotation, setHeadRotation] = useState(0);
    const [showBubble, setShowBubble] = useState(true);
    const [showFAQ, setShowFAQ] = useState(false);
    const [selectedFAQ, setSelectedFAQ] = useState<number | null>(null);

    const messages = useMemo(() => {
        return SECTION_MESSAGES[currentSection] || SECTION_MESSAGES.default;
    }, [currentSection]);

    // Cycle through messages (only when FAQ is closed)
    useEffect(() => {
        if (showFAQ) return;

        const interval = setInterval(() => {
            setMessageIndex((prev) => (prev + 1) % messages.length);
            setShowBubble(false);
            setTimeout(() => setShowBubble(true), 300);
        }, 6000);

        return () => clearInterval(interval);
    }, [messages, showFAQ]);

    useEffect(() => {
        setMessageIndex(0);
        setShowBubble(false);
        setTimeout(() => setShowBubble(true), 500);
    }, [currentSection]);

    useEffect(() => {
        const blinkInterval = setInterval(() => {
            setIsBlinking(true);
            setTimeout(() => setIsBlinking(false), 150);
        }, OFFICER_CONFIG.personality.blinkRate || 3500);
        return () => clearInterval(blinkInterval);
    }, []);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const x = (e.clientX / window.innerWidth - 0.5) * 4;
            const y = (e.clientY / window.innerHeight - 0.5) * 3;
            setEyeOffset({ x: Math.max(-2, Math.min(2, x)), y: Math.max(-2, Math.min(2, y)) });
            setHeadRotation(x * 2);
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const handleCharacterClick = () => {
        setShowFAQ(!showFAQ);
        setSelectedFAQ(null);
    };

    const handleFAQClick = (index: number) => {
        setSelectedFAQ(selectedFAQ === index ? null : index);
    };

    return (
        <motion.div
            className={`fixed right-4 bottom-4 z-50 flex flex-col items-end gap-2 ${className}`}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1, duration: 0.6 }}
        >
            {/* FAQ Panel */}
            <AnimatePresence>
                {showFAQ && (
                    <motion.div
                        className="w-72 border-2 overflow-hidden"
                        style={{
                            backgroundColor: 'var(--bg-card)',
                            borderColor: 'var(--accent-color)'
                        }}
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                    >
                        {/* Header */}
                        <div
                            className="px-3 py-2 flex items-center justify-between"
                            style={{ backgroundColor: 'var(--accent-color)' }}
                        >
                            <span
                                className="text-xs font-mono font-bold uppercase"
                                style={{ color: 'var(--bg-main)' }}
                            >
                                FAQ - Ask Officer Kiruk
                            </span>
                            <button
                                onClick={() => setShowFAQ(false)}
                                className="text-sm font-bold cursor-pointer"
                                style={{ color: 'var(--bg-main)' }}
                            >
                                ×
                            </button>
                        </div>

                        {/* Questions */}
                        <div className="max-h-64 overflow-y-auto">
                            {FAQ_ITEMS.map((item, index) => (
                                <div key={index}>
                                    <button
                                        onClick={() => handleFAQClick(index)}
                                        className="w-full text-left px-3 py-2 text-xs font-mono cursor-pointer transition-colors hover:bg-[rgba(var(--accent-color-rgb),0.1)]"
                                        style={{
                                            color: selectedFAQ === index ? 'var(--accent-color)' : 'var(--text-main)',
                                            borderBottom: '1px solid var(--border-color)'
                                        }}
                                    >
                                        {selectedFAQ === index ? '▼' : '▶'} {item.question}
                                    </button>

                                    <AnimatePresence>
                                        {selectedFAQ === index && (
                                            <motion.div
                                                className="px-4 py-2 text-xs font-mono"
                                                style={{
                                                    backgroundColor: 'rgba(var(--accent-color-rgb),0.05)',
                                                    color: 'var(--text-muted)'
                                                }}
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                            >
                                                💬 {item.answer}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Speech bubble (hidden when FAQ is open) */}
            <AnimatePresence mode="wait">
                {showBubble && !showFAQ && (
                    <SpeechBubble
                        key={`${currentSection}-${messageIndex}`}
                        message={messages[messageIndex]}
                        position="right"
                        variant="default"
                        isVisible={showBubble}
                    />
                )}
            </AnimatePresence>

            {/* Character container */}
            <motion.div
                className="relative w-32 h-44 cursor-pointer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCharacterClick}
            >
                <div
                    className="absolute inset-0 rounded-lg blur-xl opacity-30"
                    style={{ backgroundColor: OFFICER_CONFIG.glowColor }}
                />
                <HalfBodyCharacter
                    config={OFFICER_CONFIG}
                    headRotation={headRotation}
                    eyeOffset={eyeOffset}
                    isBlinking={isBlinking}
                    className="relative z-10"
                />
                <div
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-1 text-[9px] font-mono font-bold uppercase tracking-wider border"
                    style={{
                        backgroundColor: 'var(--bg-main)',
                        borderColor: 'var(--accent-color)',
                        color: 'var(--accent-color)'
                    }}
                >
                    {showFAQ ? 'Close FAQ' : 'Officer Kiruk'}
                </div>
            </motion.div>

            <motion.p
                className="text-[9px] font-mono uppercase tracking-wider"
                style={{ color: 'var(--text-muted)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                transition={{ delay: 3 }}
            >
                {showFAQ ? 'Select a question' : 'Click for FAQ'}
            </motion.p>
        </motion.div>
    );
}

/**
 * Compact version for mobile/inline use
 */
export function OfficerGuideMini({
    message,
    className = ''
}: {
    message: string;
    className?: string;
}) {
    return (
        <div className={`flex items-center gap-3 ${className}`}>
            <div
                className="w-10 h-10 rounded-full border-2 overflow-hidden flex items-center justify-center"
                style={{
                    borderColor: 'var(--accent-color)',
                    backgroundColor: 'var(--bg-card)'
                }}
            >
                <span className="text-lg">👮</span>
            </div>
            <div
                className="flex-1 px-3 py-2 border-l-2 text-sm font-mono"
                style={{
                    borderColor: 'var(--accent-color)',
                    color: 'var(--text-muted)'
                }}
            >
                {message}
            </div>
        </div>
    );
}

export default OfficerGuide;

