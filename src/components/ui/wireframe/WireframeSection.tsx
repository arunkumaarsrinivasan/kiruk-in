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
            {/* Border lines extending to viewport edges */}

            {/* Top border - extends full width */}
            <div
                className="absolute top-0 left-0 right-0 h-px pointer-events-none"
                style={{ backgroundColor: 'var(--accent-color)', opacity: 0.15 }}
            />

            {/* Bottom border - extends full width */}
            <div
                className="absolute bottom-0 left-0 right-0 h-px pointer-events-none"
                style={{ backgroundColor: 'var(--accent-color)', opacity: 0.15 }}
            />

            {/* Left border - extends full height */}
            <div
                className="absolute top-0 bottom-0 left-6 w-px pointer-events-none"
                style={{ backgroundColor: 'var(--accent-color)', opacity: 0.15 }}
            />

            {/* Right border - extends full height */}
            <div
                className="absolute top-0 bottom-0 right-6 w-px pointer-events-none"
                style={{ backgroundColor: 'var(--accent-color)', opacity: 0.15 }}
            />

            {/* Corner accents - solid color */}
            {/* Top-left */}
            <div className="absolute top-0 left-6 pointer-events-none">
                <div className="w-px h-6" style={{ backgroundColor: 'var(--accent-color)' }} />
                <div className="absolute top-0 left-0 w-6 h-px" style={{ backgroundColor: 'var(--accent-color)' }} />
            </div>

            {/* Top-right */}
            <div className="absolute top-0 right-6 pointer-events-none">
                <div className="w-px h-6" style={{ backgroundColor: 'var(--accent-color)' }} />
                <div className="absolute top-0 right-0 w-6 h-px" style={{ backgroundColor: 'var(--accent-color)' }} />
            </div>

            {/* Bottom-left */}
            <div className="absolute bottom-0 left-6 pointer-events-none">
                <div className="w-px h-6" style={{ backgroundColor: 'var(--accent-color)' }} />
                <div className="absolute bottom-0 left-0 w-6 h-px" style={{ backgroundColor: 'var(--accent-color)' }} />
            </div>

            {/* Bottom-right */}
            <div className="absolute bottom-0 right-6 pointer-events-none">
                <div className="w-px h-6" style={{ backgroundColor: 'var(--accent-color)' }} />
                <div className="absolute bottom-0 right-0 w-6 h-px" style={{ backgroundColor: 'var(--accent-color)' }} />
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
                    <div className="mb-8 pl-8">
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
                        {/* Underline with measurement marks - extends full viewport width */}
                        <div className="relative mt-4" style={{ height: '12px' }}>
                            {/* Horizontal line extending full viewport width */}
                            <div
                                className="absolute h-px pointer-events-none"
                                style={{ 
                                    backgroundColor: 'var(--accent-color)',
                                    left: 'calc(50% - 50vw)',
                                    width: '100vw',
                                    top: '50%',
                                    transform: 'translateY(-50%)'
                                }}
                            />
                            {/* Left end marker (crosshair) - at viewport left edge */}
                            <div
                                className="absolute pointer-events-none"
                                style={{
                                    left: 'calc(50% - 50vw)',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    width: '1px',
                                    height: '12px',
                                    backgroundColor: 'var(--accent-color)'
                                }}
                            />
                            {/* Right end marker (crosshair) - at viewport right edge */}
                            <div
                                className="absolute pointer-events-none"
                                style={{
                                    left: 'calc(50% + 50vw - 1px)',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    width: '1px',
                                    height: '12px',
                                    backgroundColor: 'var(--accent-color)'
                                }}
                            />
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
