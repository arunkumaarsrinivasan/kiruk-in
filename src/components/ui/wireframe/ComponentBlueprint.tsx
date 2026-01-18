'use client';

import React, { useState, useRef, useEffect } from 'react';

interface ComponentBlueprintProps {
    title: string;
    description?: string;
    children: React.ReactNode;
    code?: string;
    componentType?: string;
    showRulers?: boolean;
    className?: string;
    /** Semantic label for top ruler (e.g., "5y experience") - defaults to width in px */
    rulerLabelTop?: string;
    /** Semantic label for left ruler (e.g., "Level 9/10") - defaults to height in px */
    rulerLabelLeft?: string;
}

/**
 * Tailwind CSS-inspired component with hover rulers extending to viewport edges
 * Shows semantic labels on rulers - highlights on hover
 */
export function ComponentBlueprint({
    title,
    description,
    children,
    code,
    componentType = 'component',
    showRulers = true,
    className = '',
    rulerLabelTop,
    rulerLabelLeft
}: ComponentBlueprintProps) {
    const [isHovered, setIsHovered] = useState(false);
    const [showCode, setShowCode] = useState(false);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (containerRef.current) {
            const resizeObserver = new ResizeObserver((entries) => {
                for (const entry of entries) {
                    setDimensions({
                        width: Math.round(entry.contentRect.width),
                        height: Math.round(entry.contentRect.height)
                    });
                }
            });
            resizeObserver.observe(containerRef.current);
            return () => resizeObserver.disconnect();
        }
    }, []);

    const cornerSize = 12;
    const rulerExtend = 32;

    return (
        <div
            className={`relative ${className}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => { setIsHovered(false); setShowCode(false); }}
            style={{
                // Reserve space for rulers
                margin: showRulers ? `${rulerExtend}px` : 0
            }}
        >
            {/* Blueprint label */}
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <span
                        className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 border"
                        style={{
                            borderColor: isHovered ? 'var(--accent-color)' : 'var(--border-color)',
                            color: isHovered ? 'var(--accent-color)' : 'var(--text-muted)',
                            backgroundColor: 'transparent',
                            transition: 'all 0.15s ease'
                        }}
                    >
                        {componentType}
                    </span>
                    <h3
                        className="text-sm font-mono font-bold uppercase tracking-wider"
                        style={{ color: isHovered ? 'var(--accent-color)' : 'var(--text-main)', transition: 'color 0.15s ease' }}
                    >
                        {title}
                    </h3>
                </div>
                {code && (
                    <button
                        onClick={() => setShowCode(!showCode)}
                        className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 border cursor-pointer"
                        style={{
                            borderColor: showCode ? 'var(--accent-color)' : 'var(--border-color)',
                            color: showCode ? 'var(--accent-color)' : 'var(--text-muted)',
                            backgroundColor: showCode ? 'rgba(var(--accent-color-rgb), 0.1)' : 'transparent'
                        }}
                    >
                        {'</>'}
                    </button>
                )}
            </div>

            {description && (
                <p className="text-xs font-mono mb-3" style={{ color: 'var(--text-muted)' }}>
                    {description}
                </p>
            )}

            {/* Component container */}
            <div
                ref={containerRef}
                className="relative border overflow-hidden"
                style={{
                    borderColor: isHovered ? 'var(--accent-color)' : 'var(--border-color)',
                    backgroundColor: isHovered ? 'rgba(var(--accent-color-rgb), 0.02)' : 'transparent',
                    boxShadow: isHovered ? '0 0 30px rgba(var(--accent-color-rgb), 0.15)' : 'none',
                    transition: 'all 0.15s ease'
                }}
            >
                {/* Corner markers - always visible but brighter on hover */}
                {[
                    { top: 0, left: 0 },
                    { top: 0, right: 0 },
                    { bottom: 0, left: 0 },
                    { bottom: 0, right: 0 }
                ].map((pos, i) => (
                    <div key={i} className="absolute pointer-events-none" style={pos}>
                        <div
                            className="absolute w-px"
                            style={{
                                height: cornerSize,
                                backgroundColor: 'var(--accent-color)',
                                opacity: isHovered ? 1 : 0.3,
                                transition: 'opacity 0.15s ease',
                                ...(pos.top !== undefined ? { top: 0 } : { bottom: 0 }),
                                ...(pos.left !== undefined ? { left: 0 } : { right: 0 })
                            }}
                        />
                        <div
                            className="absolute h-px"
                            style={{
                                width: cornerSize,
                                backgroundColor: 'var(--accent-color)',
                                opacity: isHovered ? 1 : 0.3,
                                transition: 'opacity 0.15s ease',
                                ...(pos.top !== undefined ? { top: 0 } : { bottom: 0 }),
                                ...(pos.left !== undefined ? { left: 0 } : { right: 0 })
                            }}
                        />
                    </div>
                ))}

                {/* Content */}
                <div className="relative z-10 p-4">
                    {children}
                </div>

                {/* Code preview overlay */}
                {code && showCode && (
                    <div
                        className="absolute inset-0 z-20 p-4 overflow-auto"
                        style={{ backgroundColor: 'rgba(0, 0, 0, 0.95)' }}
                    >
                        <pre className="text-xs font-mono leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--accent-color)' }}>
                            <code>{code}</code>
                        </pre>
                    </div>
                )}
            </div>

            {/* === FULL-SCREEN RULER TRACES ON HOVER === */}
            {showRulers && isHovered && (
                <>
                    {/* TOP TRACE - extends from component top to screen top */}
                    <div
                        className="fixed left-0 right-0 pointer-events-none z-50"
                        style={{ top: 0, height: '100vh' }}
                    >
                        {/* Vertical line from screen top to component */}
                        <div
                            className="absolute w-px"
                            style={{
                                left: containerRef.current?.getBoundingClientRect().left ?? 0,
                                top: 0,
                                height: containerRef.current?.getBoundingClientRect().top ?? 0,
                                backgroundColor: 'var(--accent-color)',
                                opacity: 0.3
                            }}
                        />
                        <div
                            className="absolute w-px"
                            style={{
                                left: (containerRef.current?.getBoundingClientRect().right ?? 0) - 1,
                                top: 0,
                                height: containerRef.current?.getBoundingClientRect().top ?? 0,
                                backgroundColor: 'var(--accent-color)',
                                opacity: 0.3
                            }}
                        />
                    </div>

                    {/* BOTTOM TRACE - extends from component bottom to screen bottom */}
                    <div
                        className="fixed left-0 right-0 pointer-events-none z-50"
                        style={{ top: 0, height: '100vh' }}
                    >
                        <div
                            className="absolute w-px"
                            style={{
                                left: containerRef.current?.getBoundingClientRect().left ?? 0,
                                top: containerRef.current?.getBoundingClientRect().bottom ?? 0,
                                bottom: 0,
                                height: `calc(100vh - ${containerRef.current?.getBoundingClientRect().bottom ?? 0}px)`,
                                backgroundColor: 'var(--accent-color)',
                                opacity: 0.3
                            }}
                        />
                        <div
                            className="absolute w-px"
                            style={{
                                left: (containerRef.current?.getBoundingClientRect().right ?? 0) - 1,
                                top: containerRef.current?.getBoundingClientRect().bottom ?? 0,
                                height: `calc(100vh - ${containerRef.current?.getBoundingClientRect().bottom ?? 0}px)`,
                                backgroundColor: 'var(--accent-color)',
                                opacity: 0.3
                            }}
                        />
                    </div>

                    {/* LEFT TRACE - extends from component left to screen left */}
                    <div
                        className="fixed top-0 bottom-0 pointer-events-none z-50"
                        style={{ left: 0, width: '100vw' }}
                    >
                        <div
                            className="absolute h-px"
                            style={{
                                top: containerRef.current?.getBoundingClientRect().top ?? 0,
                                left: 0,
                                width: containerRef.current?.getBoundingClientRect().left ?? 0,
                                backgroundColor: 'var(--accent-color)',
                                opacity: 0.3
                            }}
                        />
                        <div
                            className="absolute h-px"
                            style={{
                                top: (containerRef.current?.getBoundingClientRect().bottom ?? 0) - 1,
                                left: 0,
                                width: containerRef.current?.getBoundingClientRect().left ?? 0,
                                backgroundColor: 'var(--accent-color)',
                                opacity: 0.3
                            }}
                        />
                        {/* Left label */}
                        <div
                            className="absolute px-2 py-1"
                            style={{
                                top: ((containerRef.current?.getBoundingClientRect().top ?? 0) + (containerRef.current?.getBoundingClientRect().bottom ?? 0)) / 2,
                                left: 8,
                                transform: 'translateY(-50%)',
                                backgroundColor: 'var(--bg-main)'
                            }}
                        >
                            <span className="text-[9px] font-mono uppercase tracking-wider" style={{ color: 'var(--accent-color)' }}>
                                {rulerLabelLeft || `${dimensions.height}px`}
                            </span>
                        </div>
                    </div>

                    {/* RIGHT TRACE - extends from component right to screen right */}
                    <div
                        className="fixed top-0 bottom-0 pointer-events-none z-50"
                        style={{ left: 0, width: '100vw' }}
                    >
                        <div
                            className="absolute h-px"
                            style={{
                                top: containerRef.current?.getBoundingClientRect().top ?? 0,
                                left: containerRef.current?.getBoundingClientRect().right ?? 0,
                                right: 0,
                                width: `calc(100vw - ${containerRef.current?.getBoundingClientRect().right ?? 0}px)`,
                                backgroundColor: 'var(--accent-color)',
                                opacity: 0.3
                            }}
                        />
                        <div
                            className="absolute h-px"
                            style={{
                                top: (containerRef.current?.getBoundingClientRect().bottom ?? 0) - 1,
                                left: containerRef.current?.getBoundingClientRect().right ?? 0,
                                width: `calc(100vw - ${containerRef.current?.getBoundingClientRect().right ?? 0}px)`,
                                backgroundColor: 'var(--accent-color)',
                                opacity: 0.3
                            }}
                        />
                        {/* Right label */}
                        <div
                            className="absolute px-2 py-1"
                            style={{
                                top: ((containerRef.current?.getBoundingClientRect().top ?? 0) + (containerRef.current?.getBoundingClientRect().bottom ?? 0)) / 2,
                                right: 8,
                                transform: 'translateY(-50%)',
                                backgroundColor: 'var(--bg-main)'
                            }}
                        >
                            <span className="text-[9px] font-mono uppercase tracking-wider" style={{ color: 'var(--accent-color)' }}>
                                {rulerLabelTop || `${dimensions.width}px`}
                            </span>
                        </div>
                    </div>

                    {/* Component border highlight */}
                    <div
                        className="absolute inset-0 pointer-events-none border-2 z-40"
                        style={{ borderColor: 'var(--accent-color)' }}
                    />
                </>
            )}
        </div>
    );
}

export default ComponentBlueprint;
