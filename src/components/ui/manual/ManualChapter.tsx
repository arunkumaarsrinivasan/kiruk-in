'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { BindingHoles } from './BindingHoles';

interface ManualChapterProps {
    number: number;
    title: string;
    subtitle?: string;
    children: React.ReactNode;
    showBindingHoles?: boolean;
    variant?: 'default' | 'challenge' | 'diagram';
    className?: string;
}

/**
 * Manual-styled chapter section wrapper
 * Features binding holes, chapter numbers, and instructional styling
 */
export function ManualChapter({
    number,
    title,
    subtitle,
    children,
    showBindingHoles = true,
    variant = 'default',
    className = ''
}: ManualChapterProps) {
    const formattedNumber = number.toString().padStart(2, '0');

    const variantStyles = {
        default: {
            headerBg: 'transparent',
            headerBorder: 'var(--border-color)',
            accent: 'var(--accent-color)'
        },
        challenge: {
            headerBg: 'var(--accent-color)',
            headerBorder: 'var(--accent-color)',
            accent: 'var(--accent-color)'
        },
        diagram: {
            headerBg: 'transparent',
            headerBorder: 'var(--text-muted)',
            accent: 'var(--text-muted)'
        }
    };

    const style = variantStyles[variant];

    return (
        <motion.section
            className={`relative py-12 ${className}`}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
        >
            {/* Binding holes */}
            {showBindingHoles && (
                <BindingHoles count={3} side="left" />
            )}

            {/* Chapter header */}
            <div
                className="relative mb-8 pl-8 border-l-4"
                style={{ borderColor: style.accent }}
            >
                {/* Chapter number */}
                <motion.div
                    className="absolute -left-[42px] top-0 w-10 h-10 flex items-center justify-center border-2"
                    style={{
                        borderColor: style.accent,
                        backgroundColor: 'var(--bg-main)'
                    }}
                    whileHover={{ scale: 1.05 }}
                >
                    <span
                        className="text-lg font-mono font-black"
                        style={{ color: style.accent }}
                    >
                        {formattedNumber}
                    </span>
                </motion.div>

                {/* Title area */}
                <div className="pl-2">
                    <h2
                        className="text-2xl md:text-3xl font-mono font-black uppercase tracking-wide"
                        style={{ color: 'var(--text-main)' }}
                    >
                        {title}
                    </h2>

                    {subtitle && (
                        <p
                            className="text-sm font-mono mt-1 uppercase tracking-wider"
                            style={{ color: 'var(--text-muted)' }}
                        >
                            {subtitle}
                        </p>
                    )}
                </div>

                {/* Decorative line extending right */}
                <div
                    className="absolute top-5 left-full w-[100vw] h-px opacity-20"
                    style={{ backgroundColor: style.accent }}
                />
            </div>

            {/* Chapter content */}
            <div className="relative pl-8">
                {children}
            </div>

            {/* Chapter footer line */}
            <div
                className="mt-12 h-px opacity-30"
                style={{ backgroundColor: 'var(--border-color)' }}
            />
        </motion.section>
    );
}

/**
 * Challenge callout box - Heavenly Bodies inspired
 */
interface ChallengeBoxProps {
    title?: string;
    items: string[];
    className?: string;
}

export function ChallengeBox({
    title = 'CHALLENGES',
    items,
    className = ''
}: ChallengeBoxProps) {
    return (
        <motion.div
            className={`relative border-2 p-6 ${className}`}
            style={{
                borderColor: 'var(--accent-color)',
                backgroundColor: 'transparent'
            }}
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
        >
            {/* Header */}
            <div
                className="absolute -top-3 left-4 px-2 font-mono font-bold text-sm uppercase tracking-wider"
                style={{
                    backgroundColor: 'var(--bg-main)',
                    color: 'var(--accent-color)'
                }}
            >
                {title}
            </div>

            {/* Challenge items */}
            <ul className="space-y-3">
                {items.map((item, index) => (
                    <motion.li
                        key={index}
                        className="flex items-start gap-3"
                        initial={{ opacity: 0, x: 10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                    >
                        {/* Checkbox */}
                        <div
                            className="w-4 h-4 border-2 mt-0.5 flex-shrink-0"
                            style={{ borderColor: 'var(--border-color)' }}
                        />

                        <span
                            className="text-sm font-mono"
                            style={{ color: 'var(--text-main)' }}
                        >
                            {item}
                        </span>
                    </motion.li>
                ))}
            </ul>
        </motion.div>
    );
}

/**
 * Diagram annotation for technical illustrations
 */
interface DiagramLabelProps {
    label: string;
    description?: string;
    position?: { x: string; y: string };
    direction?: 'left' | 'right' | 'up' | 'down';
    className?: string;
}

export function DiagramLabel({
    label,
    description,
    position = { x: '0', y: '0' },
    direction = 'right',
    className = ''
}: DiagramLabelProps) {
    const lineStyles = {
        left: 'right-full mr-2 w-8 h-px top-1/2',
        right: 'left-full ml-2 w-8 h-px top-1/2',
        up: 'bottom-full mb-2 h-8 w-px left-1/2',
        down: 'top-full mt-2 h-8 w-px left-1/2'
    };

    return (
        <div
            className={`absolute ${className}`}
            style={{ left: position.x, top: position.y }}
        >
            {/* Leader line */}
            <div
                className={`absolute ${lineStyles[direction]}`}
                style={{ backgroundColor: 'var(--text-muted)' }}
            />

            {/* Label */}
            <div className="relative">
                <span
                    className="text-xs font-mono font-bold uppercase"
                    style={{ color: 'var(--text-main)' }}
                >
                    {label}
                </span>

                {description && (
                    <p
                        className="text-[10px] font-mono mt-0.5"
                        style={{ color: 'var(--text-muted)' }}
                    >
                        {description}
                    </p>
                )}
            </div>
        </div>
    );
}

export default ManualChapter;
