'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface BlueprintGridProps {
    cellSize?: number;
    majorGridInterval?: number;
    showCursorGlow?: boolean;
    className?: string;
}

/**
 * Blueprint-style grid background with cursor integration
 * Grid lines that components can align to, with cursor proximity glow effect
 */
export function BlueprintGrid({
    cellSize = 8,
    majorGridInterval = 8, // Major line every 8 cells (64px)
    showCursorGlow = true,
    className = ''
}: BlueprintGridProps) {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!showCursorGlow) return;

        const handleMouseMove = (e: MouseEvent) => {
            setMousePos({ x: e.clientX, y: e.clientY });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [showCursorGlow]);

    const majorGridSize = cellSize * majorGridInterval;

    return (
        <div
            ref={containerRef}
            className={`fixed inset-0 pointer-events-none z-0 ${className}`}
            style={{ overflow: 'hidden' }}
        >
            {/* Base minor grid */}
            <div
                className="absolute inset-0"
                style={{
                    backgroundImage: `
            linear-gradient(var(--border-color) 1px, transparent 1px),
            linear-gradient(90deg, var(--border-color) 1px, transparent 1px)
          `,
                    backgroundSize: `${cellSize}px ${cellSize}px`,
                    opacity: 0.05
                }}
            />

            {/* Major grid lines */}
            <div
                className="absolute inset-0"
                style={{
                    backgroundImage: `
            linear-gradient(var(--accent-color) 1px, transparent 1px),
            linear-gradient(90deg, var(--accent-color) 1px, transparent 1px)
          `,
                    backgroundSize: `${majorGridSize}px ${majorGridSize}px`,
                    opacity: 0.08
                }}
            />

            {/* Edge measurement ticks - Top */}
            <div className="absolute top-0 left-0 right-0 h-4 flex">
                {Array.from({ length: Math.ceil(window.innerWidth / majorGridSize) + 1 }).map((_, i) => (
                    <div
                        key={`top-${i}`}
                        className="absolute flex flex-col items-center"
                        style={{ left: i * majorGridSize }}
                    >
                        <div
                            className="w-px h-3"
                            style={{ backgroundColor: 'var(--accent-color)', opacity: 0.3 }}
                        />
                        {i > 0 && i % 2 === 0 && (
                            <span
                                className="text-[8px] font-mono mt-0.5"
                                style={{ color: 'var(--accent-color)', opacity: 0.4 }}
                            >
                                {i * majorGridSize}
                            </span>
                        )}
                    </div>
                ))}
            </div>

            {/* Edge measurement ticks - Left */}
            <div className="absolute top-0 left-0 bottom-0 w-4 flex flex-col">
                {Array.from({ length: Math.ceil(window.innerHeight / majorGridSize) + 1 }).map((_, i) => (
                    <div
                        key={`left-${i}`}
                        className="absolute flex items-center"
                        style={{ top: i * majorGridSize }}
                    >
                        <div
                            className="h-px w-3"
                            style={{ backgroundColor: 'var(--accent-color)', opacity: 0.3 }}
                        />
                        {i > 0 && i % 2 === 0 && (
                            <span
                                className="text-[8px] font-mono ml-1"
                                style={{ color: 'var(--accent-color)', opacity: 0.4 }}
                            >
                                {i * majorGridSize}
                            </span>
                        )}
                    </div>
                ))}
            </div>

            {/* Cursor proximity glow */}
            {showCursorGlow && (
                <motion.div
                    className="absolute pointer-events-none"
                    style={{
                        width: 200,
                        height: 200,
                        borderRadius: '50%',
                        background: `radial-gradient(circle, rgba(var(--accent-color-rgb, 0, 255, 0), 0.08) 0%, transparent 70%)`,
                        transform: 'translate(-50%, -50%)',
                    }}
                    animate={{
                        left: mousePos.x,
                        top: mousePos.y,
                    }}
                    transition={{
                        type: 'spring',
                        damping: 30,
                        stiffness: 200,
                    }}
                />
            )}

            {/* Grid origin marker */}
            <div
                className="absolute top-0 left-0 w-6 h-6"
                style={{
                    borderRight: '1px solid var(--accent-color)',
                    borderBottom: '1px solid var(--accent-color)',
                    opacity: 0.3
                }}
            >
                <span
                    className="absolute top-1 left-1 text-[8px] font-mono"
                    style={{ color: 'var(--accent-color)', opacity: 0.6 }}
                >
                    0,0
                </span>
            </div>
        </div>
    );
}

export default BlueprintGrid;
