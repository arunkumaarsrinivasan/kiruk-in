'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SpeechBubbleProps {
    message: string;
    position?: 'left' | 'right' | 'top' | 'bottom';
    variant?: 'default' | 'thought' | 'shout';
    isVisible?: boolean;
    className?: string;
}

/**
 * Comic-style speech bubble for officer character narration
 * Supports different positions and styles
 */
export function SpeechBubble({
    message,
    position = 'left',
    variant = 'default',
    isVisible = true,
    className = ''
}: SpeechBubbleProps) {
    const tailPosition = {
        left: 'right-0 translate-x-full top-1/2 -translate-y-1/2',
        right: 'left-0 -translate-x-full top-1/2 -translate-y-1/2',
        top: 'bottom-0 translate-y-full left-1/2 -translate-x-1/2',
        bottom: 'top-0 -translate-y-full left-1/2 -translate-x-1/2'
    };

    const tailRotation = {
        left: 'rotate-0',
        right: 'rotate-180',
        top: 'rotate-90',
        bottom: '-rotate-90'
    };

    const bubbleStyles = {
        default: {
            border: 'var(--border-color)',
            bg: 'var(--bg-card)',
            text: 'var(--text-main)'
        },
        thought: {
            border: 'var(--border-color)',
            bg: 'var(--bg-card)',
            text: 'var(--text-muted)'
        },
        shout: {
            border: 'var(--accent-color)',
            bg: 'var(--accent-color)',
            text: 'var(--bg-main)'
        }
    };

    const style = bubbleStyles[variant];

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    className={`relative inline-block ${className}`}
                    initial={{ opacity: 0, scale: 0.8, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: 10 }}
                    transition={{
                        type: 'spring',
                        damping: 15,
                        stiffness: 300
                    }}
                >
                    {/* Main bubble */}
                    <div
                        className={`relative px-4 py-3 border-2 max-w-xs ${variant === 'thought' ? 'rounded-[20px]' : 'rounded-lg'
                            }`}
                        style={{
                            borderColor: style.border,
                            backgroundColor: style.bg,
                            color: style.text
                        }}
                    >
                        <p className="text-sm font-mono leading-relaxed m-0">
                            {message}
                        </p>

                        {/* Pixel corner accents */}
                        <div
                            className="absolute -top-1 -left-1 w-2 h-2"
                            style={{ backgroundColor: style.border }}
                        />
                        <div
                            className="absolute -top-1 -right-1 w-2 h-2"
                            style={{ backgroundColor: style.border }}
                        />
                        <div
                            className="absolute -bottom-1 -left-1 w-2 h-2"
                            style={{ backgroundColor: style.border }}
                        />
                        <div
                            className="absolute -bottom-1 -right-1 w-2 h-2"
                            style={{ backgroundColor: style.border }}
                        />
                    </div>

                    {/* Speech tail */}
                    {variant !== 'thought' && (
                        <div className={`absolute ${tailPosition[position]} ${tailRotation[position]}`}>
                            <svg
                                width="16"
                                height="12"
                                viewBox="0 0 16 12"
                                style={{ imageRendering: 'pixelated' }}
                            >
                                {/* Pixelated tail */}
                                <rect x="0" y="4" width="4" height="4" fill={style.border} />
                                <rect x="4" y="4" width="4" height="4" fill={style.bg} />
                                <rect x="4" y="0" width="4" height="4" fill={style.border} />
                                <rect x="4" y="8" width="4" height="4" fill={style.border} />
                                <rect x="8" y="4" width="4" height="4" fill={style.border} />
                                <rect x="12" y="4" width="4" height="4" fill={style.border} />
                            </svg>
                        </div>
                    )}

                    {/* Thought bubble dots for thought variant */}
                    {variant === 'thought' && (
                        <div className={`absolute ${tailPosition[position]}`}>
                            <div className="flex gap-1" style={{ transform: position === 'left' ? 'translateX(4px)' : 'translateX(-4px)' }}>
                                <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: style.border }}
                                />
                                <div
                                    className="w-2 h-2 rounded-full mt-1"
                                    style={{ backgroundColor: style.border }}
                                />
                                <div
                                    className="w-1 h-1 rounded-full mt-2"
                                    style={{ backgroundColor: style.border }}
                                />
                            </div>
                        </div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default SpeechBubble;
