'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface MeasurementLinesProps {
    label?: string;
    value?: string;
    direction?: 'horizontal' | 'vertical';
    position?: 'top' | 'bottom' | 'left' | 'right';
    extend?: boolean;
    showMarkers?: boolean;
    className?: string;
}

/**
 * Blueprint-style measurement lines with labels
 * Creates technical drawing annotation effect
 */
export function MeasurementLines({
    label,
    value,
    direction = 'horizontal',
    position = 'top',
    extend = true,
    showMarkers = true,
    className = ''
}: MeasurementLinesProps) {
    const isHorizontal = direction === 'horizontal';

    return (
        <div
            className={`absolute pointer-events-none ${position === 'top' ? '-top-6 left-0 right-0' :
                    position === 'bottom' ? '-bottom-6 left-0 right-0' :
                        position === 'left' ? 'top-0 bottom-0 -left-6' :
                            'top-0 bottom-0 -right-6'
                } ${className}`}
        >
            {/* Main measurement line */}
            <motion.div
                className={`absolute ${isHorizontal
                        ? 'h-px left-0 right-0 top-1/2'
                        : 'w-px top-0 bottom-0 left-1/2'
                    }`}
                style={{
                    backgroundColor: 'var(--accent-color)',
                    opacity: 0.6
                }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
            />

            {/* Extension lines beyond container */}
            {extend && (
                <>
                    <div
                        className={`absolute ${isHorizontal
                                ? 'h-px -left-[50vw] w-[50vw] top-1/2'
                                : 'w-px -top-[50vh] h-[50vh] left-1/2'
                            }`}
                        style={{
                            backgroundColor: 'var(--border-color)',
                            opacity: 0.15
                        }}
                    />
                    <div
                        className={`absolute ${isHorizontal
                                ? 'h-px -right-[50vw] w-[50vw] top-1/2'
                                : 'w-px -bottom-[50vh] h-[50vh] left-1/2'
                            }`}
                        style={{
                            backgroundColor: 'var(--border-color)',
                            opacity: 0.15
                        }}
                    />
                </>
            )}

            {/* End markers */}
            {showMarkers && (
                <>
                    <div
                        className={`absolute ${isHorizontal
                                ? 'left-0 top-1/2 -translate-y-1/2 w-px h-3'
                                : 'top-0 left-1/2 -translate-x-1/2 h-px w-3'
                            }`}
                        style={{ backgroundColor: 'var(--accent-color)' }}
                    />
                    <div
                        className={`absolute ${isHorizontal
                                ? 'right-0 top-1/2 -translate-y-1/2 w-px h-3'
                                : 'bottom-0 left-1/2 -translate-x-1/2 h-px w-3'
                            }`}
                        style={{ backgroundColor: 'var(--accent-color)' }}
                    />
                </>
            )}

            {/* Label */}
            {(label || value) && (
                <motion.div
                    className={`absolute ${isHorizontal
                            ? 'left-1/2 -translate-x-1/2 -top-4'
                            : 'top-1/2 -translate-y-1/2 -left-2 -translate-x-full'
                        } whitespace-nowrap`}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.3 }}
                >
                    <span
                        className="text-[10px] font-mono uppercase tracking-wider px-1"
                        style={{
                            color: 'var(--accent-color)',
                            backgroundColor: 'var(--bg-main)'
                        }}
                    >
                        {label && <span className="opacity-60">{label}: </span>}
                        {value}
                    </span>
                </motion.div>
            )}
        </div>
    );
}

/**
 * Corner measurement markers for component blueprints
 */
export function CornerMarkers({ className = '' }: { className?: string }) {
    const cornerSize = 12;

    return (
        <div className={`absolute inset-0 pointer-events-none ${className}`}>
            {/* Top-left corner */}
            <div className="absolute top-0 left-0">
                <div
                    className="absolute top-0 left-0 w-px"
                    style={{ height: cornerSize, backgroundColor: 'var(--accent-color)' }}
                />
                <div
                    className="absolute top-0 left-0 h-px"
                    style={{ width: cornerSize, backgroundColor: 'var(--accent-color)' }}
                />
            </div>

            {/* Top-right corner */}
            <div className="absolute top-0 right-0">
                <div
                    className="absolute top-0 right-0 w-px"
                    style={{ height: cornerSize, backgroundColor: 'var(--accent-color)' }}
                />
                <div
                    className="absolute top-0 right-0 h-px"
                    style={{ width: cornerSize, backgroundColor: 'var(--accent-color)' }}
                />
            </div>

            {/* Bottom-left corner */}
            <div className="absolute bottom-0 left-0">
                <div
                    className="absolute bottom-0 left-0 w-px"
                    style={{ height: cornerSize, backgroundColor: 'var(--accent-color)' }}
                />
                <div
                    className="absolute bottom-0 left-0 h-px"
                    style={{ width: cornerSize, backgroundColor: 'var(--accent-color)' }}
                />
            </div>

            {/* Bottom-right corner */}
            <div className="absolute bottom-0 right-0">
                <div
                    className="absolute bottom-0 right-0 w-px"
                    style={{ height: cornerSize, backgroundColor: 'var(--accent-color)' }}
                />
                <div
                    className="absolute bottom-0 right-0 h-px"
                    style={{ width: cornerSize, backgroundColor: 'var(--accent-color)' }}
                />
            </div>
        </div>
    );
}

export default MeasurementLines;
