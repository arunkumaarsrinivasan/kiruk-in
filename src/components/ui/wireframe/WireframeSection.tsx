'use client';

import React, { ReactNode } from 'react';

interface WireframeSectionProps {
    id?: string;
    title?: string;
    subtitle?: string;
    children: ReactNode;
    className?: string;
}

/**
 * Clean wireframe section with Tailwind CSS-style corner rulers
 * No entry animations - instant render
 */
export function WireframeSection({
    id,
    title,
    subtitle,
    children,
    className = ''
}: WireframeSectionProps) {
    const cornerSize = 24;
    const rulerExtend = 40;

    return (
        <section
            id={id}
            className={`relative py-16 px-6 ${className}`}
        >
            {/* Corner rulers extending outward */}

            {/* Top-left corner */}
            <div className="absolute top-0 left-0 pointer-events-none">
                {/* Vertical line extending up */}
                <div
                    className="absolute left-6 w-px"
                    style={{
                        top: -rulerExtend,
                        height: rulerExtend + cornerSize,
                        backgroundColor: 'var(--accent-color)',
                        opacity: 0.4
                    }}
                />
                {/* Horizontal line extending left */}
                <div
                    className="absolute top-0 h-px"
                    style={{
                        left: -rulerExtend + 24,
                        width: rulerExtend + cornerSize,
                        backgroundColor: 'var(--accent-color)',
                        opacity: 0.4
                    }}
                />
                {/* Corner bracket */}
                <div className="absolute top-0 left-6">
                    <div className="w-px h-6" style={{ backgroundColor: 'var(--accent-color)' }} />
                    <div className="absolute top-0 left-0 w-6 h-px" style={{ backgroundColor: 'var(--accent-color)' }} />
                </div>
            </div>

            {/* Top-right corner */}
            <div className="absolute top-0 right-0 pointer-events-none">
                <div
                    className="absolute right-6 w-px"
                    style={{
                        top: -rulerExtend,
                        height: rulerExtend + cornerSize,
                        backgroundColor: 'var(--accent-color)',
                        opacity: 0.4
                    }}
                />
                <div
                    className="absolute top-0 h-px"
                    style={{
                        right: -rulerExtend + 24,
                        width: rulerExtend + cornerSize,
                        backgroundColor: 'var(--accent-color)',
                        opacity: 0.4
                    }}
                />
                <div className="absolute top-0 right-6">
                    <div className="w-px h-6" style={{ backgroundColor: 'var(--accent-color)' }} />
                    <div className="absolute top-0 right-0 w-6 h-px" style={{ backgroundColor: 'var(--accent-color)' }} />
                </div>
            </div>

            {/* Bottom-left corner */}
            <div className="absolute bottom-0 left-0 pointer-events-none">
                <div
                    className="absolute left-6 w-px"
                    style={{
                        bottom: -rulerExtend,
                        height: rulerExtend + cornerSize,
                        backgroundColor: 'var(--accent-color)',
                        opacity: 0.4
                    }}
                />
                <div
                    className="absolute bottom-0 h-px"
                    style={{
                        left: -rulerExtend + 24,
                        width: rulerExtend + cornerSize,
                        backgroundColor: 'var(--accent-color)',
                        opacity: 0.4
                    }}
                />
                <div className="absolute bottom-0 left-6">
                    <div className="w-px h-6" style={{ backgroundColor: 'var(--accent-color)' }} />
                    <div className="absolute bottom-0 left-0 w-6 h-px" style={{ backgroundColor: 'var(--accent-color)' }} />
                </div>
            </div>

            {/* Bottom-right corner */}
            <div className="absolute bottom-0 right-0 pointer-events-none">
                <div
                    className="absolute right-6 w-px"
                    style={{
                        bottom: -rulerExtend,
                        height: rulerExtend + cornerSize,
                        backgroundColor: 'var(--accent-color)',
                        opacity: 0.4
                    }}
                />
                <div
                    className="absolute bottom-0 h-px"
                    style={{
                        right: -rulerExtend + 24,
                        width: rulerExtend + cornerSize,
                        backgroundColor: 'var(--accent-color)',
                        opacity: 0.4
                    }}
                />
                <div className="absolute bottom-0 right-6">
                    <div className="w-px h-6" style={{ backgroundColor: 'var(--accent-color)' }} />
                    <div className="absolute bottom-0 right-0 w-6 h-px" style={{ backgroundColor: 'var(--accent-color)' }} />
                </div>
            </div>

            {/* Edge ruler labels */}
            <div
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-8 text-[9px] font-mono uppercase tracking-wider"
                style={{ color: 'var(--accent-color)', opacity: 0.5, writingMode: 'vertical-rl', transform: 'rotate(180deg) translateY(50%)' }}
            >
                {id?.toUpperCase()}
            </div>

            {/* Content wrapper */}
            <div className="relative z-10">
                {/* Section header */}
                {title && (
                    <div className="mb-8">
                        <h2
                            className="text-3xl md:text-4xl font-mono font-black uppercase tracking-tight"
                            style={{ color: 'var(--text-main)' }}
                        >
                            {title}
                        </h2>
                        {subtitle && (
                            <p
                                className="text-sm font-mono mt-2"
                                style={{ color: 'var(--text-muted)' }}
                            >
                                {subtitle}
                            </p>
                        )}
                        {/* Underline with measurement marks */}
                        <div className="flex items-center gap-2 mt-4">
                            <div
                                className="h-px flex-1"
                                style={{ backgroundColor: 'var(--border-color)' }}
                            />
                            <span
                                className="text-[9px] font-mono"
                                style={{ color: 'var(--text-muted)' }}
                            >
                                100%
                            </span>
                        </div>
                    </div>
                )}

                {/* Children content */}
                {children}
            </div>
        </section>
    );
}

export default WireframeSection;
