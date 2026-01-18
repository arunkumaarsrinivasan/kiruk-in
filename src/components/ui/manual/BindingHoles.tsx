'use client';

import React from 'react';

interface BindingHolesProps {
    count?: number;
    side?: 'left' | 'right';
    className?: string;
}

/**
 * Decorative binding holes for manual/notebook aesthetic
 * Creates punch-hole effect like a physical notebook
 */
export function BindingHoles({
    count = 3,
    side = 'left',
    className = ''
}: BindingHolesProps) {
    return (
        <div
            className={`absolute top-0 bottom-0 flex flex-col justify-around py-8 z-10 ${side === 'left' ? 'left-0 -translate-x-1/2' : 'right-0 translate-x-1/2'
                } ${className}`}
        >
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="relative">
                    {/* Outer ring */}
                    <div
                        className="w-6 h-6 rounded-full border-2"
                        style={{
                            borderColor: 'var(--border-color)',
                            backgroundColor: 'var(--bg-main)'
                        }}
                    />
                    {/* Inner hole */}
                    <div
                        className="absolute inset-1 rounded-full"
                        style={{
                            backgroundColor: 'var(--bg-main)',
                            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
                        }}
                    />
                    {/* Metal ring effect */}
                    <div
                        className="absolute inset-0 rounded-full border"
                        style={{
                            borderColor: 'var(--text-muted)',
                            opacity: 0.3
                        }}
                    />
                </div>
            ))}
        </div>
    );
}

export default BindingHoles;
