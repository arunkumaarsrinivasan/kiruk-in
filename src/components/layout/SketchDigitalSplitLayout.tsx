'use client';

/**
 * SketchDigitalSplitLayout — Visual overlay split
 *
 * The screen is split with a fixed divider. The SAME content renders in BOTH halves:
 * - Left / Top half: the page content with `.sketch-mode` applied (handwritten, paper)
 * - Right / Bottom half: the page content in the current digital era style
 *
 * Each half is absolutely positioned and clipped by overflow:hidden to show only
 * its portion of the content. Both halves share scroll position so they stay in sync.
 *
 * Alignment guarantee:
 * - Both panes render the IDENTICAL React tree at the SAME width (100vw).
 * - Scroll sync uses direct scrollTop copy (not proportional) so content never
 *   drifts even when sketch-mode CSS changes line heights or font sizes.
 * - `checkAlignment()` measures the scrollHeight delta and warns in dev when the
 *   two panes differ by more than an acceptable threshold (default 32px).
 */

import React, { useRef, useCallback, useEffect, useState, useMemo, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLayoutMode } from '@/contexts/LayoutModeContext';
import { SIMPLE_GAME_NAV_CONTEXT_BAR_TOP_PX } from '@/components/layout/SimpleGameNav';

// ── Tear edge (paper ⟷ digital) — shared geometry for clip-path + overlay ─────
/** Enough points for a smooth hand-torn line without “electric” buzzing. */
const TEAR_STEPS = 80;

type TearPoint = { x: number; y: number };

function tinyHash(i: number, salt: number): number {
    return ((i * 92837111 + salt * 2654435761) >>> 0) % 1000;
}

/** Vertical split: slow fiber-following wander + sparse micro-notches (real paper). */
function verticalTearEdge(splitPercent: number, amplitude: number): TearPoint[] {
    const pts: TearPoint[] = [];
    for (let i = 0; i <= TEAR_STEPS; i++) {
        const y = (i / TEAR_STEPS) * 100;
        const u = i / TEAR_STEPS;
        const slow =
            Math.sin(u * Math.PI * 2.35 + 0.45) * 0.5 +
            Math.sin(u * Math.PI * 4.8 + 1.05) * 0.22 +
            Math.sin(u * Math.PI * 0.85 + 1.9) * 0.18;
        const notchEnv = 0.28 + 0.72 * Math.sin(u * Math.PI * 6.5 + 0.25) ** 2;
        const micro = Math.sin(u * Math.PI * 16 + 0.65) * 0.11 * notchEnv;
        const x = splitPercent + (slow + micro) * amplitude;
        pts.push({
            x: Math.min(86, Math.max(14, x)),
            y,
        });
    }
    return pts;
}

/** Horizontal split: same logic on the orthogonal axis. */
function horizontalTearEdge(splitPercent: number, amplitude: number): TearPoint[] {
    const pts: TearPoint[] = [];
    for (let i = 0; i <= TEAR_STEPS; i++) {
        const x = (i / TEAR_STEPS) * 100;
        const u = i / TEAR_STEPS;
        const slow =
            Math.sin(u * Math.PI * 2.4 + 0.4) * 0.5 +
            Math.sin(u * Math.PI * 4.9 + 0.95) * 0.22 +
            Math.sin(u * Math.PI * 0.9 + 1.75) * 0.18;
        const notchEnv = 0.28 + 0.72 * Math.sin(u * Math.PI * 6.4 + 0.3) ** 2;
        const micro = Math.sin(u * Math.PI * 15.5 + 0.55) * 0.11 * notchEnv;
        const y = splitPercent + (slow + micro) * amplitude;
        pts.push({
            x,
            y: Math.min(86, Math.max(14, y)),
        });
    }
    return pts;
}

/** Sparse indices along the tear for torn-off chips (deterministic). */
const CHIP_INDICES_VERTICAL = [9, 21, 33, 45, 57, 69];
const CHIP_INDICES_HORIZONTAL = [10, 22, 34, 46, 58, 70];

function paperChipPathVertical(p: TearPoint, i: number): string {
    const h = tinyHash(i, 11);
    const w = 0.14 + (h % 8) * 0.028;
    const v = 0.12 + ((h >> 3) % 7) * 0.022;
    const skew = ((h >> 6) % 11 - 5) * 0.018;
    const { x, y } = p;
    return `M ${x} ${y} L ${x - w} ${y - v * 0.45 + skew} L ${x - w * 1.02} ${y + v * 0.55 + skew * 0.5} L ${x - w * 0.2} ${y + v * 0.3} Z`;
}

function digitalChipPathVertical(p: TearPoint, i: number): string {
    const h = tinyHash(i, 29);
    const w = 0.12 + (h % 9) * 0.026;
    const v = 0.1 + ((h >> 4) % 6) * 0.024;
    const j = ((h >> 8) % 9 - 4) * 0.015;
    const { x, y } = p;
    return `M ${x} ${y} L ${x + w * 0.95} ${y - v * 0.4 + j} L ${x + w} ${y + v * 0.15} L ${x + w * 0.35} ${y + v * 0.55} Z`;
}

function paperChipPathHorizontal(p: TearPoint, i: number): string {
    const h = tinyHash(i, 17);
    const w = 0.12 + (h % 8) * 0.024;
    const v = 0.14 + ((h >> 3) % 7) * 0.026;
    const skew = ((h >> 6) % 11 - 5) * 0.018;
    const { x, y } = p;
    return `M ${x} ${y} L ${x - w * 0.45 + skew} ${y - v} L ${x + w * 0.55 + skew * 0.5} ${y - v * 1.02} L ${x + w * 0.3} ${y - v * 0.22} Z`;
}

function digitalChipPathHorizontal(p: TearPoint, i: number): string {
    const h = tinyHash(i, 31);
    const w = 0.11 + (h % 9) * 0.025;
    const v = 0.12 + ((h >> 4) % 6) * 0.022;
    const j = ((h >> 8) % 9 - 4) * 0.014;
    const { x, y } = p;
    return `M ${x} ${y} L ${x - w * 0.35 + j} ${y + v * 0.95} L ${x + w * 0.2} ${y + v} L ${x + w * 0.55 + j} ${y + v * 0.38} Z`;
}

function collectChipPaths(
    edge: TearPoint[],
    indices: number[],
    paper: (p: TearPoint, i: number) => string,
    digital: (p: TearPoint, i: number) => string,
): { paperD: string; digitalD: string } {
    let paperD = '';
    let digitalD = '';
    for (const idx of indices) {
        if (idx >= edge.length) continue;
        const p = edge[idx];
        paperD += paper(p, idx);
        digitalD += digital(p, idx + 100);
    }
    return { paperD, digitalD };
}

function clipSketchLeftOfVerticalTear(edge: TearPoint[]): string {
    const inner = [...edge].reverse().map((p) => `${p.x}% ${p.y}%`).join(', ');
    return `polygon(0% 0%, 0% 100%, ${inner})`;
}

function clipDigitalRightOfVerticalTear(edge: TearPoint[]): string {
    const inner = edge.map((p) => `${p.x}% ${p.y}%`).join(', ');
    return `polygon(${inner}, 100% 100%, 100% 0%)`;
}

function clipSketchAboveHorizontalTear(edge: TearPoint[]): string {
    const last = edge.at(-1)!;
    const parts: string[] = ['0% 0%', '100% 0%', `${last.x}% ${last.y}%`];
    for (let i = edge.length - 2; i >= 0; i--) {
        parts.push(`${edge[i].x}% ${edge[i].y}%`);
    }
    parts.push('0% 0%');
    return `polygon(${parts.join(', ')})`;
}

function clipDigitalBelowHorizontalTear(edge: TearPoint[]): string {
    const last = edge.at(-1)!;
    const parts: string[] = ['0% 100%', '100% 100%', `${last.x}% ${last.y}%`];
    for (let i = edge.length - 2; i >= 0; i--) {
        parts.push(`${edge[i].x}% ${edge[i].y}%`);
    }
    parts.push('0% 100%');
    return `polygon(${parts.join(', ')})`;
}

function pointsToSvgPath(edge: TearPoint[]): string {
    if (edge.length === 0) return '';
    const [first, ...rest] = edge;
    return rest.reduce((acc, p) => `${acc} L ${p.x} ${p.y}`, `M ${first.x} ${first.y}`);
}

// ── Alignment checker ─────────────────────────────────────────────────────────
const ALIGNMENT_THRESHOLD_PX = 32; // warn if panes differ by more than this

function checkAlignment(
    sketchPane: HTMLDivElement | null,
    digitalPane: HTMLDivElement | null,
): { aligned: boolean; delta: number } {
    if (!sketchPane || !digitalPane) return { aligned: true, delta: 0 };
    const delta = Math.abs(sketchPane.scrollHeight - digitalPane.scrollHeight);
    const aligned = delta <= ALIGNMENT_THRESHOLD_PX;

    if (process.env.NODE_ENV === 'development' && !aligned) {
        console.warn(
            `[SketchDigitalSplit] Pane height mismatch: sketch=${sketchPane.scrollHeight}px, ` +
            `digital=${digitalPane.scrollHeight}px, Δ=${delta}px. ` +
            'Sketch-mode CSS may be adding/removing height. Content will scroll in sync but visual elements may not line up at the split edge.',
        );
    }

    return { aligned, delta };
}

interface Props {
    children: React.ReactNode;
}

/** Same geometry as clip-path: soft tear line, depth, sparse paper + digital shards. */
const TearOverlayVertical = ({ edge, labelId }: { edge: TearPoint[]; labelId: string }) => {
    const pathD = pointsToSvgPath(edge);
    const { paperD, digitalD } = collectChipPaths(
        edge,
        CHIP_INDICES_VERTICAL,
        paperChipPathVertical,
        digitalChipPathVertical,
    );
    const id = labelId;
    return (
        <svg
            className="absolute inset-0 z-50 h-full w-full pointer-events-none"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden
        >
            <defs>
                <filter id={`${id}-tear-depth`} x="-8%" y="-4%" width="116%" height="108%">
                    <feGaussianBlur in="SourceAlpha" stdDeviation="0.35" result="blur" />
                    <feOffset dx="0.55" dy="0.08" in="blur" result="off" />
                    <feFlood floodColor="#1a1510" floodOpacity="0.28" result="fl" />
                    <feComposite in="fl" in2="off" operator="in" result="sh" />
                    <feMerge>
                        <feMergeNode in="sh" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
                <filter id={`${id}-chip-float`} x="-40%" y="-40%" width="180%" height="180%">
                    <feDropShadow dx="0.15" dy="0.2" stdDeviation="0.18" floodColor="#000" floodOpacity="0.22" />
                </filter>
                <filter id={`${id}-chip-digital`} x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow dx="0.25" dy="0" stdDeviation="0.15" floodColor="#000" floodOpacity="0.35" />
                </filter>
            </defs>
            {/* Paper casting soft shadow onto digital */}
            <path
                d={pathD}
                fill="none"
                stroke="#0d0b09"
                strokeWidth={1.15}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={0.12}
                vectorEffect="non-scaling-stroke"
                transform="translate(0.35 0)"
            />
            {/* Torn paper chips (sketch side) */}
            {paperD ? (
                <path
                    d={paperD}
                    fill="#ebe6dc"
                    stroke="#c9c2b4"
                    strokeWidth={0.08}
                    strokeLinejoin="round"
                    opacity={0.92}
                    filter={`url(#${id}-chip-float)`}
                />
            ) : null}
            {/* Glitch / broken digital shards */}
            {digitalD ? (
                <g filter={`url(#${id}-chip-digital)`}>
                    <path
                        d={digitalD}
                        fill="rgba(18,22,28,0.55)"
                        stroke="var(--accent-color, #5a6e7c)"
                        strokeWidth={0.07}
                        strokeLinejoin="round"
                        opacity={0.85}
                    />
                    <path d={digitalD} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={0.04} strokeLinejoin="round" />
                </g>
            ) : null}
            {/* Paper thickness + highlight (into sketch) */}
            <path
                d={pathD}
                fill="none"
                stroke="#fdfcfa"
                strokeWidth={0.42}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={0.55}
                vectorEffect="non-scaling-stroke"
                transform="translate(-0.2 0)"
            />
            <path
                d={pathD}
                fill="none"
                stroke="#e5dfd3"
                strokeWidth={0.22}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={0.65}
                vectorEffect="non-scaling-stroke"
                transform="translate(-0.08 0)"
            />
            {/* Main torn edge */}
            <path
                d={pathD}
                fill="none"
                stroke="#3a3834"
                strokeWidth={0.16}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={0.72}
                vectorEffect="non-scaling-stroke"
                filter={`url(#${id}-tear-depth)`}
            />
        </svg>
    );
};

const TearOverlayHorizontal = ({ edge, labelId }: { edge: TearPoint[]; labelId: string }) => {
    const pathD = pointsToSvgPath(edge);
    const { paperD, digitalD } = collectChipPaths(
        edge,
        CHIP_INDICES_HORIZONTAL,
        paperChipPathHorizontal,
        digitalChipPathHorizontal,
    );
    const id = labelId;
    return (
        <svg
            className="absolute inset-0 z-50 h-full w-full pointer-events-none"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden
        >
            <defs>
                <filter id={`${id}-tear-depth-h`} x="-4%" y="-8%" width="108%" height="116%">
                    <feGaussianBlur in="SourceAlpha" stdDeviation="0.35" result="blur" />
                    <feOffset dx="0.1" dy="0.55" in="blur" result="off" />
                    <feFlood floodColor="#1a1510" floodOpacity="0.28" result="flh" />
                    <feComposite in="flh" in2="off" operator="in" result="sh" />
                    <feMerge>
                        <feMergeNode in="sh" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
                <filter id={`${id}-chip-float-h`} x="-40%" y="-40%" width="180%" height="180%">
                    <feDropShadow dx="0.12" dy="0.18" stdDeviation="0.16" floodColor="#000" floodOpacity="0.2" />
                </filter>
                <filter id={`${id}-chip-digital-h`} x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow dx="0.2" dy="0.2" stdDeviation="0.14" floodColor="#000" floodOpacity="0.32" />
                </filter>
            </defs>
            <path
                d={pathD}
                fill="none"
                stroke="#0d0b09"
                strokeWidth={1.1}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={0.11}
                vectorEffect="non-scaling-stroke"
                transform="translate(0 0.32)"
            />
            {paperD ? (
                <path
                    d={paperD}
                    fill="#ebe6dc"
                    stroke="#c9c2b4"
                    strokeWidth={0.08}
                    strokeLinejoin="round"
                    opacity={0.92}
                    filter={`url(#${id}-chip-float-h)`}
                />
            ) : null}
            {digitalD ? (
                <g filter={`url(#${id}-chip-digital-h)`}>
                    <path
                        d={digitalD}
                        fill="rgba(18,22,28,0.55)"
                        stroke="var(--accent-color, #5a6e7c)"
                        strokeWidth={0.07}
                        strokeLinejoin="round"
                        opacity={0.85}
                    />
                    <path d={digitalD} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={0.04} strokeLinejoin="round" />
                </g>
            ) : null}
            <path
                d={pathD}
                fill="none"
                stroke="#fdfcfa"
                strokeWidth={0.42}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={0.55}
                vectorEffect="non-scaling-stroke"
                transform="translate(0 -0.18)"
            />
            <path
                d={pathD}
                fill="none"
                stroke="#e5dfd3"
                strokeWidth={0.22}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={0.65}
                vectorEffect="non-scaling-stroke"
                transform="translate(0 -0.07)"
            />
            <path
                d={pathD}
                fill="none"
                stroke="#3a3834"
                strokeWidth={0.16}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={0.72}
                vectorEffect="non-scaling-stroke"
                filter={`url(#${id}-tear-depth-h)`}
            />
        </svg>
    );
};

const pageVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
};

const SPLIT = 50; // divider position in percent

// // ── Alignment indicator (dev-only) ───────────────────────────────────────────
// const AlignmentBadge = ({ delta, aligned }: { delta: number; aligned: boolean }) => {
//     if (process.env.NODE_ENV !== 'development') return null;
//     return (
//         <div
//             style={{
//                 position: 'fixed',
//                 bottom: 8,
//                 left: '50%',
//                 transform: 'translateX(-50%)',
//                 zIndex: 9999,
//                 padding: '3px 10px',
//                 fontSize: '10px',
//                 fontFamily: 'monospace',
//                 background: aligned ? 'rgba(0,200,100,0.85)' : 'rgba(220,50,50,0.85)',
//                 color: '#fff',
//                 borderRadius: 3,
//                 pointerEvents: 'none',
//                 whiteSpace: 'nowrap',
//                 letterSpacing: '0.05em',
//             }}
//         >
//             {aligned
//                 ? `✓ Panes aligned (Δ${delta}px)`
//                 : `⚠ Pane height mismatch Δ${delta}px`}
//         </div>
//     );
// };

const SketchDigitalSplitLayout: React.FC<Props> = ({ children }) => {
    const { effectiveLayoutMode: layoutMode } = useLayoutMode();
    const sketchPaneRef = useRef<HTMLDivElement>(null);
    const digitalPaneRef = useRef<HTMLDivElement>(null);
    const isSyncing = useRef(false);

    // Dynamic nav height — measured so the split container always sits exactly below the header
    // IMPORTANT: Target the fixed SimpleGameNav (#navigation), NOT any inner sticky header
    /** Distance from viewport top to start split panes (flush under #navigation). */
    const [navStackBottom, setNavStackBottom] = useState(
        SIMPLE_GAME_NAV_CONTEXT_BAR_TOP_PX,
    );
    const navMeasureRaf = useRef(0);
    useEffect(() => {
        const nav = document.querySelector('#navigation') as HTMLElement | null;
        if (!nav) return;
        const measure = () => {
            cancelAnimationFrame(navMeasureRaf.current);
            navMeasureRaf.current = requestAnimationFrame(() => {
                navMeasureRaf.current = 0;
                const bottom = Math.round(nav.getBoundingClientRect().bottom);
                setNavStackBottom(bottom);
            });
        };
        const ro = new ResizeObserver(() => measure());
        ro.observe(nav);
        measure();
        globalThis.addEventListener('resize', measure, { passive: true });
        return () => {
            ro.disconnect();
            globalThis.removeEventListener('resize', measure);
            cancelAnimationFrame(navMeasureRaf.current);
        };
    }, []);

    // Run alignment check after mount and whenever layoutMode changes
    useEffect(() => {
        if (layoutMode !== 'split-side' && layoutMode !== 'split-top') return;

        // Give the browser a frame to finish painting before measuring
        const id = requestAnimationFrame(() => {
            checkAlignment(sketchPaneRef.current, digitalPaneRef.current);
        });
        return () => cancelAnimationFrame(id);
    }, [layoutMode, children]);

    /**
     * syncScroll — copies scrollTop directly from source to target.
     *
     * Why NOT proportional mapping?
     * Both panes render the IDENTICAL React tree at the SAME pixel width. The only
     * difference is CSS theming (.sketch-mode). If sketch-mode changes font sizes or
     * line heights the two scrollHeights will differ — proportional mapping would then
     * cause content to drift so that e.g. the hero section appears at a different
     * vertical position in each pane at the divider edge.
     *
     * Direct copy keeps the panes pixel-locked. If sketch CSS does add/remove height,
     * checkAlignment() will warn us in the console and show the dev badge.
     */
    const syncScroll = useCallback((source: 'sketch' | 'digital') => {
        if (isSyncing.current) return;
        isSyncing.current = true;

        const src = source === 'sketch' ? sketchPaneRef.current : digitalPaneRef.current;
        const tgt = source === 'sketch' ? digitalPaneRef.current : sketchPaneRef.current;

        if (src && tgt) {
            // Direct pixel copy — keeps both panes at the same absolute scroll offset.
            tgt.scrollTop = src.scrollTop;
        }

        requestAnimationFrame(() => { isSyncing.current = false; });
    }, []);

    const tearUid = useId().replaceAll(':', '');

    const verticalTearEdgeMemo = useMemo(() => verticalTearEdge(SPLIT, 1.05), []);
    const horizontalTearEdgeMemo = useMemo(() => horizontalTearEdge(SPLIT, 0.98), []);

    const clipSketchVertical = useMemo(
        () => clipSketchLeftOfVerticalTear(verticalTearEdgeMemo),
        [verticalTearEdgeMemo],
    );
    const clipDigitalVertical = useMemo(
        () => clipDigitalRightOfVerticalTear(verticalTearEdgeMemo),
        [verticalTearEdgeMemo],
    );
    const clipSketchHorizontal = useMemo(
        () => clipSketchAboveHorizontalTear(horizontalTearEdgeMemo),
        [horizontalTearEdgeMemo],
    );
    const clipDigitalHorizontal = useMemo(
        () => clipDigitalBelowHorizontalTear(horizontalTearEdgeMemo),
        [horizontalTearEdgeMemo],
    );

    // ── FULL DIGITAL (default, no wrapper needed) ─────────────────────────────
    if (layoutMode === 'full-digital') {
        return <>{children}</>;
    }

    // ── FULL SKETCH ───────────────────────────────────────────────────────────
    if (layoutMode === 'full-sketch') {
        return (
            <AnimatePresence mode="wait">
                <motion.div
                    key="full-sketch"
                    className="sketch-mode"
                    variants={pageVariants}
                    initial="initial" animate="animate" exit="exit"
                    transition={{ duration: 0.4 }}
                >
                    {children}
                </motion.div>
            </AnimatePresence>
        );
    }

    // ── SPLIT SIDE (left = sketch, right = digital) ───────────────────────────
    // Both panes are position:absolute, same full-viewport width.
    // Sketch / digital regions share a complementary jagged tear edge (not a straight cut).
    // They scroll together via direct scrollTop copy.
    if (layoutMode === 'split-side') {
        return (
            <>
                {/* Match sketch (paper) vs digital behind the floated nav — panes start at navStackBottom */}
                <div
                    aria-hidden
                    className="pointer-events-none fixed inset-x-0 top-0 z-40"
                    style={{
                        height: navStackBottom,
                        background: `linear-gradient(90deg, #f5f3ee ${SPLIT}%, var(--bg-main) ${SPLIT}%)`,
                    }}
                />
            <AnimatePresence mode="wait">
                <motion.div
                    key="split-side"
                    style={{
                        position: 'fixed',
                        top: navStackBottom,
                        left: 0, right: 0, bottom: 0,
                        overflow: 'hidden',
                    }}
                    variants={pageVariants}
                    initial="initial" animate="animate" exit="exit"
                    transition={{ duration: 0.4 }}
                >
                    {/* SKETCH PANE — left half */}
                    <div
                        ref={sketchPaneRef}
                        className="sketch-mode"
                        onScroll={() => syncScroll('sketch')}
                        style={{
                            position: 'absolute',
                            top: 0, left: 0, bottom: 0,
                            width: '100%',            // full viewport width — same as digital pane
                            overflowY: 'auto',
                            overflowX: 'hidden',
                            clipPath: clipSketchVertical,
                            WebkitClipPath: clipSketchVertical,
                        }}
                    >
                        {children}
                    </div>

                    {/* DIGITAL PANE — right half */}
                    <div
                        ref={digitalPaneRef}
                        onScroll={() => syncScroll('digital')}
                        style={{
                            position: 'absolute',
                            top: 0, left: 0, bottom: 0,
                            width: '100%',            // full viewport width — same as sketch pane
                            overflowY: 'auto',
                            overflowX: 'hidden',
                            backgroundColor: 'var(--bg-main)',
                            clipPath: clipDigitalVertical,
                            WebkitClipPath: clipDigitalVertical,
                        }}
                    >
                        {children}
                    </div>

                    <TearOverlayVertical edge={verticalTearEdgeMemo} labelId={tearUid} />

                    {/* Dev-only alignment indicator */}
                    {/* <AlignmentBadge {...alignmentState} /> */}
                </motion.div>
            </AnimatePresence>
            </>
        );
    }

    // ── SPLIT TOP (top = sketch, bottom = digital) ────────────────────────────
    if (layoutMode === 'split-top') {
        return (
            <>
                <div
                    aria-hidden
                    className="pointer-events-none fixed inset-x-0 top-0 z-40"
                    style={{
                        height: navStackBottom,
                        background: `linear-gradient(180deg, #f5f3ee ${SPLIT}%, var(--bg-main) ${SPLIT}%)`,
                    }}
                />
            <AnimatePresence mode="wait">
                <motion.div
                    key="split-top"
                    style={{
                        position: 'fixed',
                        top: navStackBottom,
                        left: 0, right: 0, bottom: 0,
                        overflow: 'hidden',
                    }}
                    variants={pageVariants}
                    initial="initial" animate="animate" exit="exit"
                    transition={{ duration: 0.4 }}
                >
                    {/* SKETCH PANE — top half */}
                    <div
                        ref={sketchPaneRef}
                        className="sketch-mode"
                        onScroll={() => syncScroll('sketch')}
                        style={{
                            position: 'absolute',
                            top: 0, left: 0, right: 0, bottom: 0,
                            overflowY: 'auto',
                            overflowX: 'hidden',
                            clipPath: clipSketchHorizontal,
                            WebkitClipPath: clipSketchHorizontal,
                        }}
                    >
                        {children}
                    </div>

                    {/* DIGITAL PANE — bottom half */}
                    <div
                        ref={digitalPaneRef}
                        onScroll={() => syncScroll('digital')}
                        style={{
                            position: 'absolute',
                            top: 0, left: 0, right: 0, bottom: 0,
                            overflowY: 'auto',
                            overflowX: 'hidden',
                            backgroundColor: 'var(--bg-main)',
                            clipPath: clipDigitalHorizontal,
                            WebkitClipPath: clipDigitalHorizontal,
                        }}
                    >
                        {children}
                    </div>

                    <TearOverlayHorizontal edge={horizontalTearEdgeMemo} labelId={tearUid} />

                    {/* Dev-only alignment indicator
                    <AlignmentBadge {...alignmentState} /> */}
                </motion.div>
            </AnimatePresence>
            </>
        );
    }

    return <>{children}</>;
};

export default SketchDigitalSplitLayout;
