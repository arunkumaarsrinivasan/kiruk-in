'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { BindingHoles } from './BindingHoles';

interface ManualBookLayoutProps {
    leftPage: React.ReactNode;
    rightPage: React.ReactNode;
    leftPageNumber?: number;
    rightPageNumber?: number;
    chapterTitle?: string;
    className?: string;
}

/**
 * Heavenly Bodies-style two-page manual book spread
 * Left page has binding holes on RIGHT side, right page has them on LEFT side
 * Responsive: two-page on desktop, single stacked on mobile
 */
export function ManualBookLayout({
    leftPage,
    rightPage,
    leftPageNumber = 1,
    rightPageNumber = 2,
    chapterTitle,
    className = ''
}: ManualBookLayoutProps) {
    return (
        <div className={`w-full ${className}`}>
            {/* Desktop: Two-page spread */}
            <div className="hidden md:flex justify-center items-stretch gap-0">
                {/* Left Page */}
                <motion.div
                    className="relative flex-1 max-w-[600px] min-h-[600px] border-2 border-r-0"
                    style={{
                        borderColor: 'var(--border-color)',
                        backgroundColor: 'var(--bg-card)'
                    }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {/* Binding holes on RIGHT side (inside edge) */}
                    <BindingHoles count={5} side="right" />

                    {/* Page content */}
                    <div className="p-8 pr-12">
                        {leftPage}
                    </div>

                    {/* Page number - bottom left */}
                    <div
                        className="absolute bottom-4 left-6 text-xs font-mono"
                        style={{ color: 'var(--text-muted)' }}
                    >
                        {leftPageNumber}
                    </div>

                    {/* Paper texture overlay */}
                    <div
                        className="absolute inset-0 pointer-events-none opacity-[0.02]"
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noise)'/%3E%3C/svg%3E")`
                        }}
                    />
                </motion.div>

                {/* Center Binding Spine */}
                <div
                    className="w-4 flex flex-col justify-around items-center py-8 relative"
                    style={{ backgroundColor: 'var(--bg-main)' }}
                >
                    {/* Metal ring holes */}
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div
                            key={i}
                            className="w-3 h-3 rounded-full border-2 relative"
                            style={{
                                borderColor: 'var(--text-muted)',
                                backgroundColor: 'var(--bg-main)'
                            }}
                        >
                            {/* Ring shine */}
                            <div
                                className="absolute inset-0.5 rounded-full opacity-30"
                                style={{
                                    background: 'linear-gradient(135deg, rgba(255,255,255,0.5) 0%, transparent 50%)'
                                }}
                            />
                        </div>
                    ))}

                    {/* Spine shadow */}
                    <div
                        className="absolute inset-y-0 left-0 w-1"
                        style={{
                            background: 'linear-gradient(to right, rgba(0,0,0,0.1), transparent)'
                        }}
                    />
                    <div
                        className="absolute inset-y-0 right-0 w-1"
                        style={{
                            background: 'linear-gradient(to left, rgba(0,0,0,0.1), transparent)'
                        }}
                    />
                </div>

                {/* Right Page */}
                <motion.div
                    className="relative flex-1 max-w-[600px] min-h-[600px] border-2 border-l-0"
                    style={{
                        borderColor: 'var(--border-color)',
                        backgroundColor: 'var(--bg-card)'
                    }}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    {/* Binding holes on LEFT side (inside edge) */}
                    <BindingHoles count={5} side="left" />

                    {/* Chapter title header */}
                    {chapterTitle && (
                        <div
                            className="absolute top-4 right-6 text-[10px] font-mono uppercase tracking-widest"
                            style={{ color: 'var(--text-muted)' }}
                        >
                            {chapterTitle}
                        </div>
                    )}

                    {/* Page content */}
                    <div className="p-8 pl-12">
                        {rightPage}
                    </div>

                    {/* Page number - bottom right */}
                    <div
                        className="absolute bottom-4 right-6 text-xs font-mono"
                        style={{ color: 'var(--text-muted)' }}
                    >
                        {rightPageNumber}
                    </div>

                    {/* Paper texture overlay */}
                    <div
                        className="absolute inset-0 pointer-events-none opacity-[0.02]"
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noise)'/%3E%3C/svg%3E")`
                        }}
                    />
                </motion.div>
            </div>

            {/* Mobile: Single stacked pages */}
            <div className="md:hidden flex flex-col gap-4">
                {/* Left page content */}
                <motion.div
                    className="relative border-2 min-h-[400px]"
                    style={{
                        borderColor: 'var(--border-color)',
                        backgroundColor: 'var(--bg-card)'
                    }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="p-6">
                        {leftPage}
                    </div>
                    <div
                        className="absolute bottom-3 left-4 text-xs font-mono"
                        style={{ color: 'var(--text-muted)' }}
                    >
                        {leftPageNumber}
                    </div>
                </motion.div>

                {/* Right page content */}
                <motion.div
                    className="relative border-2 min-h-[400px]"
                    style={{
                        borderColor: 'var(--border-color)',
                        backgroundColor: 'var(--bg-card)'
                    }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    {chapterTitle && (
                        <div
                            className="absolute top-3 right-4 text-[10px] font-mono uppercase tracking-widest"
                            style={{ color: 'var(--text-muted)' }}
                        >
                            {chapterTitle}
                        </div>
                    )}
                    <div className="p-6">
                        {rightPage}
                    </div>
                    <div
                        className="absolute bottom-3 right-4 text-xs font-mono"
                        style={{ color: 'var(--text-muted)' }}
                    >
                        {rightPageNumber}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

/**
 * Single manual page for sections that don't need two-page spread
 */
export function ManualPage({
    children,
    pageNumber,
    bindingSide = 'left',
    className = ''
}: {
    children: React.ReactNode;
    pageNumber?: number;
    bindingSide?: 'left' | 'right';
    className?: string;
}) {
    return (
        <motion.div
            className={`relative border-2 min-h-[400px] ${className}`}
            style={{
                borderColor: 'var(--border-color)',
                backgroundColor: 'var(--bg-card)'
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <BindingHoles count={4} side={bindingSide} />

            <div className={`p-8 ${bindingSide === 'left' ? 'pl-12' : 'pr-12'}`}>
                {children}
            </div>

            {pageNumber && (
                <div
                    className={`absolute bottom-4 ${bindingSide === 'left' ? 'right-6' : 'left-6'} text-xs font-mono`}
                    style={{ color: 'var(--text-muted)' }}
                >
                    {pageNumber}
                </div>
            )}
        </motion.div>
    );
}

export default ManualBookLayout;
