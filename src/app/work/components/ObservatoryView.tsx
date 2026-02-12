'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useObservatoryData } from '@/hooks/useObservatoryData';
import {
    CONSTELLATIONS,
    PositionedSkillNode,
    SkillContribution,
    getSkillFirstUsedDate,
    getTimelineRange,
    EXPERIENCE_DATES,
} from '@/data/observatory-data';
import { Experience } from '@/data/portfolio-data';
import { useContextBar } from '@/contexts/ContextBarContext';

// ============================================
// SVG STAR SHAPE GENERATOR
// ============================================

function starPath(cx: number, cy: number, outerR: number, innerR: number, points: number): string {
    const step = Math.PI / points;
    const path: string[] = [];
    for (let i = 0; i < 2 * points; i++) {
        const r = i % 2 === 0 ? outerR : innerR;
        const angle = i * step - Math.PI / 2;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        path.push(`${i === 0 ? 'M' : 'L'}${x},${y}`);
    }
    path.push('Z');
    return path.join(' ');
}

// Star points based on mastery
function getStarPoints(mastery: string): number {
    switch (mastery) {
        case 'expert': return 6;
        case 'advanced': return 5;
        case 'intermediate': return 4;
        default: return 4;
    }
}

// Constellation color map
const CONSTELLATION_COLORS: Record<string, string> = {
    andromeda: '#ef4444',
    orion: '#3b82f6',
    cassiopeia: '#f59e0b',
    lyra: '#8b5cf6',
    hercules: '#22c55e',
};

/**
 * ObservatoryView — Immersive Telescope Experience
 * 
 * Features:
 * - Deep-space telescope viewport with vignette & crosshair
 * - Glowing, twinkling star shapes for skills
 * - Nebula clouds behind constellation sectors
 * - Constellation lines with glow effects
 * - Ambient star dust particles & shooting stars
 * - Focus reticle on hover/select
 * - Timeline slider & journey log
 * - Mobile responsive with bottom sheet
 */
export function ObservatoryView() {
    const {
        skills,
        gridConfig,
        skillJobMap,
        experienceSkillMap,
        experiences,
        getConnectionLines,
    } = useObservatoryData();

    const { setWorkExperienceHandler } = useContextBar();

    // Core state
    const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);
    const [hoveredSkillId, setHoveredSkillId] = useState<string | null>(null);
    const [selectedExperienceId, setSelectedExperienceId] = useState<string | null>(null);
    const [constellationFilter, setConstellationFilter] = useState<string | null>(null);

    // Timeline state
    const timelineRange = useMemo(() => getTimelineRange(), []);
    const [timelineDate, setTimelineDate] = useState<string>(timelineRange.end);

    // Mobile state
    const [isMobile, setIsMobile] = useState(false);
    const [showMobilePanel, setShowMobilePanel] = useState(false);

    // Shooting star state
    const [shootingStar, setShootingStar] = useState<{ x: number; y: number; angle: number; key: number } | null>(null);
    const shootingStarRef = useRef(0);

    // Exploration stats
    const [stats, setStats] = useState({
        skillsExplored: new Set<string>(),
        constellationsVisited: new Set<string>(),
        logsReviewed: 0,
        startTime: Date.now(),
    });

    // Detect mobile
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Shooting star interval
    useEffect(() => {
        const interval = setInterval(() => {
            const x = 5 + Math.random() * 40;
            const y = 5 + Math.random() * 30;
            const angle = 20 + Math.random() * 30;
            shootingStarRef.current += 1;
            setShootingStar({ x, y, angle, key: shootingStarRef.current });
            setTimeout(() => setShootingStar(null), 1500);
        }, 8000 + Math.random() * 12000);
        return () => clearInterval(interval);
    }, []);

    // Get connection lines
    const connectionLines = useMemo(() => getConnectionLines(), [getConnectionLines]);

    // Filter skills by constellation AND timeline
    const filteredSkills = useMemo(() => {
        return skills.filter(skill => {
            if (constellationFilter && skill.constellationId !== constellationFilter) return false;
            const firstUsed = getSkillFirstUsedDate(skill);
            if (firstUsed > timelineDate) return false;
            return true;
        });
    }, [skills, constellationFilter, timelineDate]);

    // Calculate constellation skill counts for radar
    const constellationCounts = useMemo(() => {
        const counts: Record<string, { total: number; visible: number }> = {};
        CONSTELLATIONS.forEach(c => {
            counts[c.id] = {
                total: skills.filter(s => s.constellationId === c.id).length,
                visible: filteredSkills.filter(s => s.constellationId === c.id).length,
            };
        });
        return counts;
    }, [skills, filteredSkills]);

    // Highlighted skills when experience selected
    const highlightedSkillIds = useMemo(() => {
        if (!selectedExperienceId) return [];
        const mapping = experienceSkillMap.get(selectedExperienceId);
        return mapping?.skills.map(s => s.skill.id) ?? [];
    }, [selectedExperienceId, experienceSkillMap]);

    // Generate background star dust (static tiny dots)
    const starDust = useMemo(() => {
        const dust: Array<{ x: number; y: number; size: number; opacity: number; delay: number }> = [];
        for (let i = 0; i < 120; i++) {
            dust.push({
                x: 2 + Math.random() * 96,
                y: 2 + Math.random() * 96,
                size: 0.05 + Math.random() * 0.15,
                opacity: 0.15 + Math.random() * 0.4,
                delay: Math.random() * 5,
            });
        }
        return dust;
    }, []);

    // Handlers
    const handleSkillSelect = useCallback((skillId: string) => {
        setSelectedSkillId(prev => prev === skillId ? null : skillId);
        setSelectedExperienceId(null);

        const skill = skills.find(s => s.id === skillId);
        if (skill) {
            setStats(prev => ({
                ...prev,
                skillsExplored: new Set([...prev.skillsExplored, skillId]),
                constellationsVisited: new Set([...prev.constellationsVisited, skill.constellationId]),
            }));
        }

        if (isMobile) setShowMobilePanel(true);
    }, [skills, isMobile]);

    const handleSkillHover = useCallback((skillId: string | null) => {
        setHoveredSkillId(skillId);
    }, []);

    const handleExperienceSelect = useCallback((experienceId: string) => {
        setSelectedExperienceId(prev => prev === experienceId ? null : experienceId);
        setSelectedSkillId(null);
        setStats(prev => ({ ...prev, logsReviewed: prev.logsReviewed + 1 }));

        if (isMobile) setShowMobilePanel(true);
    }, [isMobile]);

    // Register handler with context bar
    useEffect(() => {
        if (setWorkExperienceHandler) {
            setWorkExperienceHandler(handleExperienceSelect);
        }
    }, [handleExperienceSelect, setWorkExperienceHandler]);

    const handleConstellationClick = useCallback((constellationId: string) => {
        setConstellationFilter(prev => prev === constellationId ? null : constellationId);
    }, []);

    const closePanel = useCallback(() => {
        setSelectedSkillId(null);
        setSelectedExperienceId(null);
        if (isMobile) setShowMobilePanel(false);
    }, [isMobile]);

    // Grid config
    const cx = 50, cy = 50, maxRadius = 40;
    const sectorAngle = 360 / CONSTELLATIONS.length;

    const selectedSkill = selectedSkillId ? skills.find(s => s.id === selectedSkillId) : null;
    const selectedExperience = selectedExperienceId ? experiences.find(e => e.id === selectedExperienceId) : null;
    const isDetailOpen = selectedSkillId !== null || selectedExperienceId !== null;

    // Focus target for telescope reticle
    const focusTarget = hoveredSkillId
        ? skills.find(s => s.id === hoveredSkillId)
        : selectedSkill;

    return (
        <div className="w-full h-[calc(100vh-100px)] relative overflow-hidden flex" style={{ backgroundColor: 'var(--bg-main)' }}>

            {/* LEFT: Unified Control Panel (Desktop) */}
            {!isMobile && (
                <div
                    className="w-48 shrink-0 flex flex-col overflow-y-auto"
                    style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRightWidth: '2px', borderRightStyle: 'solid' }}
                >
                    <ControlPanel
                        constellationCounts={constellationCounts}
                        activeConstellation={constellationFilter}
                        onConstellationClick={handleConstellationClick}
                        stats={stats}
                        hoveredSkill={hoveredSkillId ? skills.find(s => s.id === hoveredSkillId) : null}
                        totalSkills={skills.length}
                    />
                </div>
            )}

            {/* CENTER: Telescope Viewport */}
            <div className="flex-1 flex flex-col relative">

                {/* Header Bar */}
                <div className="h-10 px-4 flex items-center justify-between border-b-2" style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-color)' }}>
                    <div className="flex items-center">
                        <span className="text-sm font-bold font-mono" style={{ color: 'var(--accent-color)' }}>🔭</span>
                        <span className="text-sm font-bold font-mono ml-2" style={{ color: 'var(--text-main)' }}>TELESCOPE VIEWPORT</span>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
                        <span>{filteredSkills.length} stars visible</span>
                        <span>•</span>
                        <span>{CONSTELLATIONS.length} constellations</span>
                        {constellationFilter && (
                            <>
                                <span>•</span>
                                <button
                                    className="underline"
                                    style={{ color: 'var(--accent-color)' }}
                                    onClick={() => setConstellationFilter(null)}
                                >
                                    Clear filter
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Star Map SVG — Telescope viewport */}
                <div className="flex-1 relative telescope-viewport">
                    <svg
                        className="absolute inset-0 w-full h-full"
                        viewBox="0 0 100 100"
                        preserveAspectRatio="xMidYMid meet"
                    >
                        <defs>
                            {/* Star glow filter */}
                            <filter id="star-glow" x="-100%" y="-100%" width="300%" height="300%">
                                <feGaussianBlur stdDeviation="0.4" result="glow" />
                                <feMerge>
                                    <feMergeNode in="glow" />
                                    <feMergeNode in="glow" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>

                            {/* Intense glow for selected/expert */}
                            <filter id="star-glow-intense" x="-100%" y="-100%" width="300%" height="300%">
                                <feGaussianBlur stdDeviation="0.8" result="glow" />
                                <feMerge>
                                    <feMergeNode in="glow" />
                                    <feMergeNode in="glow" />
                                    <feMergeNode in="glow" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>

                            {/* Constellation line glow */}
                            <filter id="line-glow" x="-20%" y="-20%" width="140%" height="140%">
                                <feGaussianBlur stdDeviation="0.15" result="glow" />
                                <feMerge>
                                    <feMergeNode in="glow" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>

                            {/* Nebula gradients for each constellation sector */}
                            {CONSTELLATIONS.map((constellation, i) => {
                                const midAngle = ((i * sectorAngle) + sectorAngle / 2 - 90) * (Math.PI / 180);
                                const nebX = cx + Math.cos(midAngle) * (maxRadius * 0.55);
                                const nebY = cy + Math.sin(midAngle) * (maxRadius * 0.55);
                                const color = CONSTELLATION_COLORS[constellation.id] || '#ffffff';
                                return (
                                    <radialGradient key={`nebula-${constellation.id}`} id={`nebula-${constellation.id}`}
                                        cx={nebX} cy={nebY} r={maxRadius * 0.4}
                                        gradientUnits="userSpaceOnUse"
                                    >
                                        <stop offset="0%" stopColor={color} stopOpacity="0.06" />
                                        <stop offset="50%" stopColor={color} stopOpacity="0.02" />
                                        <stop offset="100%" stopColor={color} stopOpacity="0" />
                                    </radialGradient>
                                );
                            })}

                            {/* Reticle focus ring gradient */}
                            <radialGradient id="focus-ring-gradient">
                                <stop offset="0%" stopColor="var(--accent-color)" stopOpacity="0" />
                                <stop offset="70%" stopColor="var(--accent-color)" stopOpacity="0" />
                                <stop offset="85%" stopColor="var(--accent-color)" stopOpacity="0.15" />
                                <stop offset="100%" stopColor="var(--accent-color)" stopOpacity="0" />
                            </radialGradient>
                        </defs>

                        {/* ── Deep space background ── */}
                        <rect x="0" y="0" width="100" height="100" fill="#05080f" />

                        {/* Nebula clouds behind constellations */}
                        {CONSTELLATIONS.map((constellation, i) => {
                            const midAngle = ((i * sectorAngle) + sectorAngle / 2 - 90) * (Math.PI / 180);
                            const nebX = cx + Math.cos(midAngle) * (maxRadius * 0.55);
                            const nebY = cy + Math.sin(midAngle) * (maxRadius * 0.55);
                            const isActive = !constellationFilter || constellationFilter === constellation.id;
                            return (
                                <circle
                                    key={`nebula-cloud-${constellation.id}`}
                                    cx={nebX} cy={nebY}
                                    r={maxRadius * 0.4}
                                    fill={`url(#nebula-${constellation.id})`}
                                    opacity={isActive ? 1 : 0.3}
                                    style={{ transition: 'opacity 0.5s ease' }}
                                />
                            );
                        })}

                        {/* ── Star dust (tiny background stars) ── */}
                        {starDust.map((dust, i) => (
                            <circle
                                key={`dust-${i}`}
                                cx={dust.x} cy={dust.y}
                                r={dust.size}
                                fill="#ffffff"
                                opacity={dust.opacity}
                                className={`star-twinkle-${(i % 5) + 1}`}
                            />
                        ))}

                        {/* ── Concentric orbit rings ── */}
                        {gridConfig.yAxis.levels.map((level) => {
                            const r = maxRadius * (0.2 + (1 - level.position / 100) * 0.8);
                            return (
                                <circle
                                    key={level.id}
                                    cx={cx} cy={cy} r={r}
                                    fill="none"
                                    stroke="rgba(255,255,255,0.08)"
                                    strokeWidth="0.15"
                                    strokeDasharray="0.5 1"
                                />
                            );
                        })}

                        {/* Outer telescope lens ring */}
                        <circle cx={cx} cy={cy} r={maxRadius} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="0.3" />
                        <circle cx={cx} cy={cy} r={maxRadius + 1} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.15" />

                        {/* ── Radial sector lines + Constellation Labels ── */}
                        {CONSTELLATIONS.map((constellation, i) => {
                            const angle = (i * sectorAngle - 90) * (Math.PI / 180);
                            const midAngle = ((i * sectorAngle) + sectorAngle / 2 - 90) * (Math.PI / 180);
                            const isActive = constellationFilter === constellation.id;
                            const color = CONSTELLATION_COLORS[constellation.id] || '#888';

                            return (
                                <g key={constellation.id}>
                                    {/* Sector divider line */}
                                    <line
                                        x1={cx} y1={cy}
                                        x2={cx + Math.cos(angle) * maxRadius}
                                        y2={cy + Math.sin(angle) * maxRadius}
                                        stroke="rgba(255,255,255,0.06)"
                                        strokeWidth="0.1"
                                        strokeDasharray="1 1.5"
                                    />

                                    {/* Constellation label with icon */}
                                    <text
                                        x={cx + Math.cos(midAngle) * (maxRadius + 4.5)}
                                        y={cy + Math.sin(midAngle) * (maxRadius + 4.5)}
                                        fontSize="2.2"
                                        fill={isActive ? color : 'rgba(255,255,255,0.45)'}
                                        textAnchor="middle"
                                        dominantBaseline="middle"
                                        fontFamily="monospace"
                                        fontWeight={isActive ? 'bold' : 'normal'}
                                        style={{ cursor: 'pointer', letterSpacing: '0.05em' }}
                                        onClick={() => handleConstellationClick(constellation.id)}
                                    >
                                        {constellation.name.toUpperCase()}
                                    </text>

                                    {/* Small colored dot by label */}
                                    <circle
                                        cx={cx + Math.cos(midAngle) * (maxRadius + 2.5)}
                                        cy={cy + Math.sin(midAngle) * (maxRadius + 2.5)}
                                        r="0.4"
                                        fill={color}
                                        opacity={isActive ? 1 : 0.5}
                                    />
                                </g>
                            );
                        })}

                        {/* ── Constellation connection lines ── */}
                        {connectionLines.map(line => {
                            const fromSkill = filteredSkills.find(s => s.id === line.from);
                            const toSkill = filteredSkills.find(s => s.id === line.to);
                            if (!fromSkill || !toSkill) return null;

                            const isHighlighted = hoveredSkillId === line.from || hoveredSkillId === line.to ||
                                selectedSkillId === line.from || selectedSkillId === line.to ||
                                highlightedSkillIds.includes(line.from) || highlightedSkillIds.includes(line.to);

                            // Use constellation color for the line
                            const lineColor = CONSTELLATION_COLORS[fromSkill.constellationId] || '#ffffff';

                            return (
                                <line
                                    key={`${line.from}-${line.to}`}
                                    x1={line.fromPos.x} y1={line.fromPos.y}
                                    x2={line.toPos.x} y2={line.toPos.y}
                                    stroke={isHighlighted ? lineColor : 'rgba(255,255,255,0.15)'}
                                    strokeWidth={isHighlighted ? 0.2 : 0.1}
                                    opacity={isHighlighted ? 0.8 : 0.35}
                                    strokeDasharray={isHighlighted ? 'none' : '0.5 0.8'}
                                    filter={isHighlighted ? 'url(#line-glow)' : undefined}
                                    style={{ transition: 'all 0.3s ease' }}
                                />
                            );
                        })}

                        {/* ── Skill Stars ── */}
                        {filteredSkills.map((skill, idx) => {
                            const isSelected = selectedSkillId === skill.id;
                            const isHovered = hoveredSkillId === skill.id;
                            const isHighlighted = highlightedSkillIds.includes(skill.id);
                            const shouldHighlight = isSelected || isHovered || isHighlighted;
                            const isExpert = skill.masteryLevel === 'expert';

                            // Star size based on mastery
                            const baseSize = { beginner: 0.6, intermediate: 0.8, advanced: 1.0, expert: 1.3 }[skill.masteryLevel] || 0.7;
                            const size = shouldHighlight ? baseSize * 1.3 : baseSize;
                            const points = getStarPoints(skill.masteryLevel);
                            const constellationColor = CONSTELLATION_COLORS[skill.constellationId] || '#ffffff';

                            // Twinkle class varies per star
                            const twinkleClass = isExpert
                                ? 'star-expert'
                                : `star-twinkle-${(idx % 5) + 1}`;

                            return (
                                <g
                                    key={skill.id}
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => handleSkillSelect(skill.id)}
                                    onMouseEnter={() => handleSkillHover(skill.id)}
                                    onMouseLeave={() => handleSkillHover(null)}
                                    className={twinkleClass}
                                >
                                    {/* Outer glow bloom */}
                                    {shouldHighlight && (
                                        <circle
                                            cx={skill.x} cy={skill.y}
                                            r={size * 3}
                                            fill={constellationColor}
                                            opacity={0.08}
                                        />
                                    )}

                                    {/* Star shape */}
                                    <path
                                        d={starPath(skill.x, skill.y, size, size * 0.45, points)}
                                        fill={constellationColor}
                                        opacity={shouldHighlight ? 1 : (isExpert ? 0.95 : 0.75)}
                                        filter={shouldHighlight ? 'url(#star-glow-intense)' : (isExpert ? 'url(#star-glow)' : undefined)}
                                        style={{ transition: 'opacity 0.3s ease' }}
                                    />

                                    {/* Inner bright core */}
                                    <circle
                                        cx={skill.x} cy={skill.y}
                                        r={size * 0.25}
                                        fill="#ffffff"
                                        opacity={shouldHighlight ? 0.9 : 0.6}
                                    />

                                    {/* Label */}
                                    <text
                                        x={skill.x}
                                        y={skill.y + size + 1.8}
                                        fontSize="1.5"
                                        fill={shouldHighlight ? '#ffffff' : 'rgba(255,255,255,0.5)'}
                                        textAnchor="middle"
                                        fontFamily="monospace"
                                        fontWeight={shouldHighlight ? 'bold' : 'normal'}
                                        style={{ transition: 'fill 0.3s ease', textShadow: shouldHighlight ? '0 0 3px rgba(0,0,0,0.8)' : undefined }}
                                    >
                                        {skill.name}
                                    </text>

                                    {/* Mastery indicator dots beneath label */}
                                    {shouldHighlight && (
                                        <g>
                                            {Array.from({ length: 4 }).map((_, di) => {
                                                const filled = di < { beginner: 1, intermediate: 2, advanced: 3, expert: 4 }[skill.masteryLevel];
                                                return (
                                                    <circle
                                                        key={di}
                                                        cx={skill.x - 1.2 + di * 0.8}
                                                        cy={skill.y + size + 3.2}
                                                        r={0.25}
                                                        fill={filled ? constellationColor : 'rgba(255,255,255,0.2)'}
                                                    />
                                                );
                                            })}
                                        </g>
                                    )}
                                </g>
                            );
                        })}

                        {/* ── Telescope Center Reticle ── */}
                        <g opacity="0.25">
                            {/* Center crosshair */}
                            <line x1={cx - 2} y1={cy} x2={cx - 0.8} y2={cy} stroke="#ffffff" strokeWidth="0.08" />
                            <line x1={cx + 0.8} y1={cy} x2={cx + 2} y2={cy} stroke="#ffffff" strokeWidth="0.08" />
                            <line x1={cx} y1={cy - 2} x2={cx} y2={cy - 0.8} stroke="#ffffff" strokeWidth="0.08" />
                            <line x1={cx} y1={cy + 0.8} x2={cx} y2={cy + 2} stroke="#ffffff" strokeWidth="0.08" />
                            <circle cx={cx} cy={cy} r="0.3" fill="none" stroke="#ffffff" strokeWidth="0.06" />
                        </g>

                        {/* ── Focus Reticle (follows hovered/selected star) ── */}
                        {focusTarget && (
                            <g>
                                {/* Outer focus ring */}
                                <circle
                                    cx={focusTarget.x} cy={focusTarget.y}
                                    r="3.5"
                                    fill="none"
                                    stroke={CONSTELLATION_COLORS[focusTarget.constellationId] || '#ffffff'}
                                    strokeWidth="0.08"
                                    strokeDasharray="0.8 0.6"
                                    opacity="0.5"
                                >
                                    <animateTransform
                                        attributeName="transform"
                                        type="rotate"
                                        from={`0 ${focusTarget.x} ${focusTarget.y}`}
                                        to={`360 ${focusTarget.x} ${focusTarget.y}`}
                                        dur="20s"
                                        repeatCount="indefinite"
                                    />
                                </circle>

                                {/* Inner focus ring */}
                                <circle
                                    cx={focusTarget.x} cy={focusTarget.y}
                                    r="2.5"
                                    fill="none"
                                    stroke={CONSTELLATION_COLORS[focusTarget.constellationId] || '#ffffff'}
                                    strokeWidth="0.06"
                                    opacity="0.3"
                                >
                                    <animateTransform
                                        attributeName="transform"
                                        type="rotate"
                                        from={`360 ${focusTarget.x} ${focusTarget.y}`}
                                        to={`0 ${focusTarget.x} ${focusTarget.y}`}
                                        dur="15s"
                                        repeatCount="indefinite"
                                    />
                                </circle>

                                {/* Small crosshair ticks on focus */}
                                {[0, 90, 180, 270].map(deg => {
                                    const rad = deg * (Math.PI / 180);
                                    return (
                                        <line
                                            key={deg}
                                            x1={focusTarget.x + Math.cos(rad) * 2.8}
                                            y1={focusTarget.y + Math.sin(rad) * 2.8}
                                            x2={focusTarget.x + Math.cos(rad) * 3.3}
                                            y2={focusTarget.y + Math.sin(rad) * 3.3}
                                            stroke={CONSTELLATION_COLORS[focusTarget.constellationId] || '#ffffff'}
                                            strokeWidth="0.08"
                                            opacity="0.5"
                                        />
                                    );
                                })}
                            </g>
                        )}

                        {/* ── Shooting Star ── */}
                        {shootingStar && (
                            <g key={shootingStar.key}>
                                <line
                                    x1={shootingStar.x} y1={shootingStar.y}
                                    x2={shootingStar.x + 8} y2={shootingStar.y + 4}
                                    stroke="url(#shootingStarGrad)"
                                    strokeWidth="0.15"
                                    opacity="0.8"
                                >
                                    <animate attributeName="x1" from={`${shootingStar.x}`} to={`${shootingStar.x + 25}`} dur="1.2s" fill="freeze" />
                                    <animate attributeName="y1" from={`${shootingStar.y}`} to={`${shootingStar.y + 12}`} dur="1.2s" fill="freeze" />
                                    <animate attributeName="x2" from={`${shootingStar.x + 8}`} to={`${shootingStar.x + 30}`} dur="1.2s" fill="freeze" />
                                    <animate attributeName="y2" from={`${shootingStar.y + 4}`} to={`${shootingStar.y + 14}`} dur="1.2s" fill="freeze" />
                                    <animate attributeName="opacity" from="0.8" to="0" dur="1.2s" fill="freeze" />
                                </line>
                            </g>
                        )}

                        {/* Shooting star gradient */}
                        <defs>
                            <linearGradient id="shootingStarGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
                                <stop offset="40%" stopColor="#ffffff" stopOpacity="0.8" />
                                <stop offset="100%" stopColor="#ffffff" stopOpacity="1" />
                            </linearGradient>
                        </defs>
                    </svg>

                    {/* Telescope corner brackets (HTML overlay) */}
                    <div className="absolute top-3 left-3 w-5 h-5 pointer-events-none" style={{ borderTop: '1px solid rgba(255,255,255,0.15)', borderLeft: '1px solid rgba(255,255,255,0.15)' }} />
                    <div className="absolute top-3 right-3 w-5 h-5 pointer-events-none" style={{ borderTop: '1px solid rgba(255,255,255,0.15)', borderRight: '1px solid rgba(255,255,255,0.15)' }} />
                    <div className="absolute bottom-3 left-3 w-5 h-5 pointer-events-none" style={{ borderBottom: '1px solid rgba(255,255,255,0.15)', borderLeft: '1px solid rgba(255,255,255,0.15)' }} />
                    <div className="absolute bottom-3 right-3 w-5 h-5 pointer-events-none" style={{ borderBottom: '1px solid rgba(255,255,255,0.15)', borderRight: '1px solid rgba(255,255,255,0.15)' }} />

                    {/* Top-left viewport HUD */}
                    <div className="absolute top-4 left-6 font-mono text-[10px] pointer-events-none z-10" style={{ color: 'rgba(255,255,255,0.3)' }}>
                        <div>FOV 120°</div>
                        <div>MAG {filteredSkills.length > 20 ? '6.5' : '4.0'}</div>
                    </div>

                    {/* Bottom-right coordinate display */}
                    {focusTarget && (
                        <motion.div
                            className="absolute bottom-4 right-6 font-mono text-[10px] pointer-events-none z-10 text-right"
                            style={{ color: 'rgba(255,255,255,0.35)' }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            key={focusTarget.id}
                        >
                            <div style={{ color: CONSTELLATION_COLORS[focusTarget.constellationId] }}>{focusTarget.name}</div>
                            <div>RA {focusTarget.x.toFixed(1)}° DEC {focusTarget.y.toFixed(1)}°</div>
                            <div>{focusTarget.masteryLevel.toUpperCase()} • {focusTarget.yearsOfExperience}y</div>
                        </motion.div>
                    )}
                </div>

                {/* Timeline Slider (Bottom) */}
                <div className="border-t-2" style={{ borderColor: 'var(--border-color)' }}>
                    <TimelineSlider
                        experiences={experiences}
                        currentDate={timelineDate}
                        onChange={setTimelineDate}
                        range={timelineRange}
                        onExperienceClick={handleExperienceSelect}
                        selectedExperienceId={selectedExperienceId}
                    />
                </div>
            </div>

            {/* RIGHT: Journey Log + Detail Panel (Desktop) */}
            {!isMobile && (
                <div
                    className="w-72 shrink-0 flex flex-col overflow-hidden"
                    style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', borderLeftWidth: '2px', borderLeftStyle: 'solid' }}
                >
                    <AnimatePresence mode="wait">
                        {isDetailOpen ? (
                            <motion.div
                                key="detail"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="flex-1 overflow-y-auto"
                            >
                                <DetailPanel
                                    skill={selectedSkill}
                                    experience={selectedExperience}
                                    skillJobMap={skillJobMap}
                                    experienceSkillMap={experienceSkillMap}
                                    onSkillClick={handleSkillSelect}
                                    onExperienceClick={handleExperienceSelect}
                                    onClose={closePanel}
                                />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="journey"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex-1 overflow-y-auto"
                            >
                                <JourneyLog
                                    experiences={experiences}
                                    experienceSkillMap={experienceSkillMap}
                                    selectedId={selectedExperienceId}
                                    onSelect={handleExperienceSelect}
                                    currentDate={timelineDate}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}

            {/* Mobile: Bottom Sheet */}
            {isMobile && (
                <>
                    {/* Mobile FAB */}
                    <button
                        className="fixed bottom-20 right-4 z-30 w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
                        style={{ backgroundColor: 'var(--accent-color)', color: 'var(--bg-main)' }}
                        onClick={() => setShowMobilePanel(true)}
                    >
                        ☰
                    </button>

                    {/* Mobile Bottom Sheet */}
                    <AnimatePresence>
                        {showMobilePanel && (
                            <motion.div
                                className="fixed inset-x-0 bottom-0 z-40 rounded-t-xl max-h-[70vh] overflow-y-auto"
                                style={{ backgroundColor: 'var(--bg-card)' }}
                                initial={{ y: '100%' }}
                                animate={{ y: 0 }}
                                exit={{ y: '100%' }}
                                transition={{ type: 'spring', damping: 25 }}
                            >
                                <div className="flex justify-center p-2">
                                    <div className="w-12 h-1 rounded-full bg-gray-400" />
                                </div>
                                <button
                                    className="absolute top-2 right-4 text-lg"
                                    style={{ color: 'var(--text-muted)' }}
                                    onClick={() => setShowMobilePanel(false)}
                                >
                                    ✕
                                </button>

                                {isDetailOpen ? (
                                    <DetailPanel
                                        skill={selectedSkill}
                                        experience={selectedExperience}
                                        skillJobMap={skillJobMap}
                                        experienceSkillMap={experienceSkillMap}
                                        onSkillClick={handleSkillSelect}
                                        onExperienceClick={handleExperienceSelect}
                                        onClose={closePanel}
                                    />
                                ) : (
                                    <div className="p-4">
                                        <ControlPanel
                                            constellationCounts={constellationCounts}
                                            activeConstellation={constellationFilter}
                                            onConstellationClick={handleConstellationClick}
                                            stats={stats}
                                            hoveredSkill={null}
                                            totalSkills={skills.length}
                                        />
                                        <div className="border-t my-4" style={{ borderColor: 'var(--border-color)' }} />
                                        <JourneyLog
                                            experiences={experiences}
                                            experienceSkillMap={experienceSkillMap}
                                            selectedId={selectedExperienceId}
                                            onSelect={(id) => { handleExperienceSelect(id); }}
                                            currentDate={timelineDate}
                                        />
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </>
            )}
        </div>
    );
}

// ============================================
// CONTROL PANEL (Unified Instruments)
// ============================================

function ControlPanel({
    onConstellationClick,
    stats,
    hoveredSkill,
    totalSkills,
}: {
    constellationCounts?: Record<string, { total: number; visible: number }>;
    activeConstellation?: string | null;
    onConstellationClick: (id: string) => void;
    stats: { skillsExplored: Set<string>; constellationsVisited: Set<string>; logsReviewed: number; startTime: number };
    hoveredSkill: PositionedSkillNode | null | undefined;
    totalSkills: number;
}) {
    const [elapsed, setElapsed] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => setElapsed(Math.floor((Date.now() - stats.startTime) / 1000)), 1000);
        return () => clearInterval(interval);
    }, [stats.startTime]);

    const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
    const explorationPercent = Math.round((stats.skillsExplored.size / totalSkills) * 100);

    return (
        <div className="p-3 font-mono text-xs flex flex-col gap-3">
            {/* Header */}
            <div className="text-center border-b pb-2" style={{ borderColor: 'var(--border-color)' }}>
                <div className="text-sm font-bold" style={{ color: 'var(--accent-color)' }}>★ OBSERVATORY</div>
                <div style={{ color: 'var(--text-muted)' }}>Instruments Panel</div>
            </div>

            {/* ASTROLABE - Skills Explored (Circular Progress) */}
            <div className="border p-2" style={{ borderColor: 'var(--border-color)' }}>
                <div className="text-center mb-1" style={{ color: 'var(--accent-color)' }}>◎ ASTROLABE</div>
                <div className="text-center text-[10px] mb-2" style={{ color: 'var(--text-muted)' }}>Skills Charted</div>
                <svg viewBox="0 0 50 50" className="w-full h-16">
                    {/* Outer decorative ring */}
                    <circle cx="25" cy="25" r="22" fill="none" stroke="var(--border-color)" strokeWidth="0.5" />
                    {/* Background circle */}
                    <circle cx="25" cy="25" r="18" fill="none" stroke="var(--border-color)" strokeWidth="2" />
                    {/* Progress arc */}
                    <circle
                        cx="25" cy="25" r="18"
                        fill="none"
                        stroke="var(--accent-color)"
                        strokeWidth="2"
                        strokeDasharray={`${explorationPercent * 1.13} 113`}
                        strokeLinecap="round"
                        transform="rotate(-90 25 25)"
                    />
                    {/* Inner dial marks */}
                    {Array.from({ length: 12 }).map((_, i) => {
                        const angle = (i * 30 - 90) * (Math.PI / 180);
                        return (
                            <line key={i}
                                x1={25 + Math.cos(angle) * 14}
                                y1={25 + Math.sin(angle) * 14}
                                x2={25 + Math.cos(angle) * 16}
                                y2={25 + Math.sin(angle) * 16}
                                stroke="var(--text-muted)" strokeWidth="0.3"
                            />
                        );
                    })}
                    {/* Center display */}
                    <text x="25" y="23" textAnchor="middle" fontSize="8" fill="var(--text-main)" fontFamily="monospace" fontWeight="bold">
                        {stats.skillsExplored.size}
                    </text>
                    <text x="25" y="30" textAnchor="middle" fontSize="4" fill="var(--text-muted)" fontFamily="monospace">
                        / {totalSkills}
                    </text>
                </svg>
            </div>

            {/* QUADRANT - Sectors Mapped (Pentagon Radar) */}
            <div className="border p-2" style={{ borderColor: 'var(--border-color)' }}>
                <div className="text-center mb-1" style={{ color: 'var(--accent-color)' }}>◢ QUADRANT</div>
                <div className="text-center text-[10px] mb-2" style={{ color: 'var(--text-muted)' }}>Sectors Mapped</div>
                <svg viewBox="0 0 100 80" className="w-full h-20">
                    {/* Pentagon grid */}
                    {[0.3, 0.6, 1].map((scale, i) => (
                        <polygon key={i}
                            points={CONSTELLATIONS.map((_, j) => {
                                const angle = (j * 72 - 90) * (Math.PI / 180);
                                const r = 30 * scale;
                                return `${50 + Math.cos(angle) * r},${40 + Math.sin(angle) * r}`;
                            }).join(' ')}
                            fill="none" stroke="var(--border-color)" strokeWidth="0.5" opacity={0.4}
                        />
                    ))}
                    {/* Filled radar based on visited */}
                    <polygon
                        points={CONSTELLATIONS.map((c, j) => {
                            const angle = (j * 72 - 90) * (Math.PI / 180);
                            const visited = stats.constellationsVisited.has(c.id);
                            const r = visited ? 30 : 5;
                            return `${50 + Math.cos(angle) * r},${40 + Math.sin(angle) * r}`;
                        }).join(' ')}
                        fill="var(--accent-color)" opacity="0.3"
                        stroke="var(--accent-color)" strokeWidth="1"
                    />
                    {/* Labels */}
                    {CONSTELLATIONS.map((c, j) => {
                        const angle = (j * 72 - 90) * (Math.PI / 180);
                        const visited = stats.constellationsVisited.has(c.id);
                        return (
                            <text key={c.id}
                                x={50 + Math.cos(angle) * 38}
                                y={40 + Math.sin(angle) * 38}
                                fontSize="4" textAnchor="middle" dominantBaseline="middle"
                                fill={visited ? 'var(--accent-color)' : 'var(--text-muted)'}
                                fontFamily="monospace"
                                style={{ cursor: 'pointer' }}
                                onClick={() => onConstellationClick(c.id)}
                            >
                                {c.name.slice(0, 3)}
                            </text>
                        );
                    })}
                </svg>
                <div className="text-center" style={{ color: 'var(--text-main)' }}>
                    {stats.constellationsVisited.size} / {CONSTELLATIONS.length}
                </div>
            </div>

            {/* SUNDIAL - Time Observing */}
            <div className="border p-2" style={{ borderColor: 'var(--border-color)' }}>
                <div className="text-center mb-1" style={{ color: 'var(--accent-color)' }}>☉ SUNDIAL</div>
                <div className="text-center text-[10px] mb-2" style={{ color: 'var(--text-muted)' }}>Time Observing</div>
                <svg viewBox="0 0 60 40" className="w-full h-12">
                    {/* Sundial base */}
                    <ellipse cx="30" cy="35" rx="25" ry="4" fill="var(--border-color)" opacity="0.3" />
                    {/* Sundial face */}
                    <path d="M 5 35 Q 30 5 55 35" fill="none" stroke="var(--border-color)" strokeWidth="0.5" />
                    {/* Hour marks */}
                    {Array.from({ length: 7 }).map((_, i) => {
                        const t = i / 6;
                        const x = 5 + t * 50;
                        const y = 35 - Math.sin(t * Math.PI) * 20;
                        return <circle key={i} cx={x} cy={y} r="1" fill="var(--text-muted)" />;
                    })}
                    {/* Shadow (based on elapsed time) */}
                    <line x1="30" y1="35" x2={30 + Math.cos(-Math.PI / 2 + (elapsed % 3600) / 3600 * Math.PI) * 15}
                        y2={35 + Math.sin(-Math.PI / 2 + (elapsed % 3600) / 3600 * Math.PI) * 15}
                        stroke="var(--accent-color)" strokeWidth="1.5"
                    />
                </svg>
                <div className="text-center text-lg font-bold" style={{ color: 'var(--text-main)' }}>
                    {formatTime(elapsed)}
                </div>
            </div>

            {/* CALENDAR - Logs Reviewed */}
            <div className="border p-2" style={{ borderColor: 'var(--border-color)' }}>
                <div className="text-center mb-1" style={{ color: 'var(--accent-color)' }}>☾ CALENDAR</div>
                <div className="text-center text-[10px] mb-2" style={{ color: 'var(--text-muted)' }}>Logs Reviewed</div>
                <div className="flex justify-center gap-1">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i}
                            className="w-6 h-8 border flex items-center justify-center text-sm"
                            style={{
                                borderColor: 'var(--border-color)',
                                backgroundColor: i <= stats.logsReviewed ? 'var(--accent-color)' : 'transparent',
                                color: i <= stats.logsReviewed ? 'var(--bg-main)' : 'var(--text-muted)',
                            }}>
                            {i <= stats.logsReviewed ? '✓' : i}
                        </div>
                    ))}
                </div>
                <div className="text-center mt-1" style={{ color: 'var(--text-main)' }}>
                    {stats.logsReviewed} / 4
                </div>
            </div>

            {/* EQUATORIUM - Current Focus */}
            {hoveredSkill && (
                <motion.div
                    className="border p-2"
                    style={{ borderColor: 'var(--accent-color)' }}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                >
                    <div className="text-center mb-1" style={{ color: 'var(--accent-color)' }}>⊛ EQUATORIUM</div>
                    <div className="text-center text-[10px] mb-1" style={{ color: 'var(--text-muted)' }}>Current Focus</div>
                    <div className="text-center font-bold" style={{ color: 'var(--text-main)' }}>{hoveredSkill.name}</div>
                    <div className="text-center" style={{ color: hoveredSkill.color }}>{getMasteryStars(hoveredSkill.masteryLevel)}</div>
                    <div className="text-center text-[10px]" style={{ color: 'var(--text-muted)' }}>{hoveredSkill.yearsOfExperience}y exp</div>
                </motion.div>
            )}
        </div>
    );
}

// ============================================
// TIMELINE SLIDER
// ============================================

function TimelineSlider({
    experiences,
    currentDate,
    onChange,
    range,
    onExperienceClick,
    selectedExperienceId,
}: {
    experiences: Experience[];
    currentDate: string;
    onChange: (date: string) => void;
    range: { start: string; end: string };
    onExperienceClick: (id: string) => void;
    selectedExperienceId: string | null;
}) {
    const startYear = parseInt(range.start.slice(0, 4));
    const endYear = parseInt(range.end.slice(0, 4));
    const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);

    const dateToPercent = (date: string) => {
        const start = new Date(range.start).getTime();
        const end = new Date(range.end).getTime();
        const current = new Date(date).getTime();
        return ((current - start) / (end - start)) * 100;
    };

    const percentToDate = (percent: number) => {
        const start = new Date(range.start).getTime();
        const end = new Date(range.end).getTime();
        const time = start + (percent / 100) * (end - start);
        return new Date(time).toISOString().split('T')[0];
    };

    const currentPercent = dateToPercent(currentDate);

    return (
        <div
            className="border-t-2 p-3 font-mono text-xs"
            style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-color)' }}
        >
            {/* Timeline Header */}
            <div className="flex items-center gap-2 mb-2">
                <span style={{ color: 'var(--accent-color)' }}>◆</span>
                <span style={{ color: 'var(--text-main)' }}>EXPERIENCE TIMELINE</span>
            </div>

            {/* Experience Blocks with Labels */}
            <div className="relative h-16 mb-2">
                {/* Year grid lines */}
                <div className="absolute inset-0 flex">
                    {years.map((year) => (
                        <div key={year} className="flex-1 border-l" style={{ borderColor: 'var(--border-color)', opacity: 0.3 }}>
                            <span className="text-[9px] ml-1" style={{ color: 'var(--text-muted)' }}>{year}</span>
                        </div>
                    ))}
                    <div className="absolute right-0 text-[9px]" style={{ color: 'var(--accent-color)' }}>NOW</div>
                </div>

                {/* Experience blocks with labels */}
                {experiences.map((exp, idx) => {
                    const dates = EXPERIENCE_DATES[exp.id];
                    if (!dates) return null;
                    const left = dateToPercent(dates.start);
                    const right = dates.end ? dateToPercent(dates.end) : 100;
                    const isSelected = selectedExperienceId === exp.id;
                    const topOffset = 16 + (idx % 2) * 22; // Stagger rows

                    return (
                        <div
                            key={exp.id}
                            className="absolute rounded cursor-pointer transition-all overflow-hidden"
                            style={{
                                left: `${left}%`,
                                width: `${Math.max(right - left, 8)}%`,
                                top: `${topOffset}px`,
                                height: '20px',
                                backgroundColor: isSelected ? 'var(--accent-color)' : 'var(--bg-card)',
                                border: `1px solid ${isSelected ? 'var(--accent-color)' : 'var(--border-color)'}`,
                            }}
                            onClick={() => onExperienceClick(exp.id)}
                        >
                            <div className="px-1 truncate" style={{
                                color: isSelected ? 'var(--bg-main)' : 'var(--text-main)',
                                fontSize: '9px',
                                lineHeight: '10px',
                            }}>
                                <div className="font-bold truncate">{exp.company}</div>
                                <div className="truncate" style={{
                                    color: isSelected ? 'var(--bg-main)' : 'var(--text-muted)',
                                    fontSize: '8px',
                                }}>{exp.position.split(' ')[0]}</div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Slider Track */}
            <div className="relative h-2 rounded" style={{ backgroundColor: 'var(--bg-card)' }}>
                {/* Progress fill */}
                <div
                    className="absolute h-full rounded-l"
                    style={{
                        width: `${currentPercent}%`,
                        backgroundColor: 'var(--accent-color)',
                        opacity: 0.3,
                    }}
                />

                {/* Slider input */}
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={currentPercent}
                    onChange={(e) => onChange(percentToDate(parseFloat(e.target.value)))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />

                {/* Slider thumb */}
                <div
                    className="absolute w-4 h-4 rounded-full -top-1 -ml-2 pointer-events-none shadow-lg"
                    style={{
                        left: `${currentPercent}%`,
                        backgroundColor: 'var(--accent-color)',
                        border: '2px solid var(--bg-main)',
                    }}
                />
            </div>
        </div>
    );
}

// ============================================
// JOURNEY LOG — Star Captain's Log
// ============================================

const TYPE_ICONS: Record<string, string> = {
    'full-time': '◆',
    internship: '◇',
    freelance: '○',
    contract: '▣',
    'part-time': '▤',
};

function JourneyLog({
    experiences,
    experienceSkillMap,
    selectedId,
    onSelect,
    currentDate,
}: {
    experiences: Experience[];
    experienceSkillMap: Map<string, { experienceId: string; skills: Array<{ skill: PositionedSkillNode; contribution: SkillContribution }> }>;
    selectedId: string | null;
    onSelect: (id: string) => void;
    currentDate: string;
}) {
    const sortedExps = [...experiences].sort((a, b) => b.startDate.localeCompare(a.startDate));

    return (
        <div className="p-3 font-mono text-xs">
            {/* Header */}
            <div className="flex items-center gap-2 mb-1 pb-2 border-b" style={{ borderColor: 'var(--border-color)' }}>
                <span style={{ color: 'var(--accent-color)' }}>📜</span>
                <span className="font-bold text-[11px]" style={{ color: 'var(--text-main)' }}>CAPTAIN&apos;S LOG</span>
                <span className="ml-auto text-[9px]" style={{ color: 'var(--text-muted)' }}>{sortedExps.length} entries</span>
            </div>

            {/* Timeline */}
            <div className="relative mt-3">
                {/* Vertical line */}
                <div
                    className="absolute left-[7px] top-0 bottom-0 w-px"
                    style={{ backgroundColor: 'var(--border-color)' }}
                />

                <div className="space-y-1">
                    {sortedExps.map((exp, idx) => {
                        const isVisible = exp.startDate <= currentDate;
                        const isSelected = selectedId === exp.id;
                        const isCurrent = exp.current;
                        const skills = experienceSkillMap.get(exp.id)?.skills ?? [];
                        const masteredCount = skills.filter(s => s.contribution === 'mastered').length;
                        const appliedCount = skills.filter(s => s.contribution === 'applied').length;
                        const learnedCount = skills.filter(s => s.contribution === 'learned').length;

                        // Build date string
                        const startYear = new Date(exp.startDate).getFullYear();
                        const startMonth = new Date(exp.startDate).toLocaleString('en', { month: 'short' });
                        const endStr = isCurrent ? 'Now' : exp.endDate
                            ? `${new Date(exp.endDate).toLocaleString('en', { month: 'short' })} ${new Date(exp.endDate).getFullYear()}`
                            : '';

                        // Unique constellation colors used at this job
                        const constellationIds = [...new Set(skills.map(s => s.skill.constellationId))];

                        return (
                            <motion.div
                                key={exp.id}
                                className="relative pl-6 cursor-pointer group"
                                onClick={() => isVisible && onSelect(exp.id)}
                                initial={false}
                                animate={{ opacity: isVisible ? 1 : 0.35 }}
                            >
                                {/* Timeline dot */}
                                <div className="absolute left-0 top-3 z-10">
                                    {isCurrent ? (
                                        <div className="relative">
                                            <div
                                                className="w-[15px] h-[15px] rounded-full"
                                                style={{
                                                    backgroundColor: 'var(--accent-color)',
                                                    boxShadow: '0 0 6px var(--accent-color)',
                                                }}
                                            />
                                            <div
                                                className="absolute inset-0 w-[15px] h-[15px] rounded-full animate-ping"
                                                style={{
                                                    backgroundColor: 'var(--accent-color)',
                                                    opacity: 0.3,
                                                }}
                                            />
                                        </div>
                                    ) : (
                                        <div
                                            className="w-[15px] h-[15px] rounded-full border-2 transition-colors"
                                            style={{
                                                borderColor: isSelected ? 'var(--accent-color)' : 'var(--border-color)',
                                                backgroundColor: isSelected ? 'var(--accent-color)' : 'var(--bg-card)',
                                            }}
                                        />
                                    )}
                                </div>

                                {/* Card */}
                                <div
                                    className="p-2.5 rounded-sm border transition-all"
                                    style={{
                                        borderColor: isSelected ? 'var(--accent-color)' : 'var(--border-color)',
                                        backgroundColor: isSelected ? 'color-mix(in srgb, var(--accent-color) 8%, var(--bg-card))' : 'var(--bg-card)',
                                        borderWidth: isSelected ? '2px' : '1px',
                                    }}
                                >
                                    {/* Top row: Type icon + Company + Current badge */}
                                    <div className="flex items-start gap-1.5 mb-1">
                                        <span className="text-[10px]" style={{ color: 'var(--accent-color)' }}>
                                            {TYPE_ICONS[exp.type] || '◆'}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-bold truncate leading-tight" style={{ color: 'var(--text-main)' }}>
                                                {exp.company}
                                            </div>
                                            <div className="text-[10px] truncate leading-tight" style={{ color: 'var(--text-muted)' }}>
                                                {exp.position}
                                            </div>
                                        </div>
                                        {isCurrent && (
                                            <span
                                                className="shrink-0 text-[8px] px-1.5 py-0.5 rounded-sm font-bold uppercase tracking-wider"
                                                style={{
                                                    backgroundColor: 'var(--accent-color)',
                                                    color: 'var(--bg-main)',
                                                }}
                                            >
                                                Active
                                            </span>
                                        )}
                                    </div>

                                    {/* Date range */}
                                    <div className="text-[9px] mb-2" style={{ color: 'var(--text-muted)' }}>
                                        {startMonth} {startYear} → {endStr}
                                        {exp.location && <span className="ml-1">• {exp.location}</span>}
                                    </div>

                                    {/* Skill contribution breakdown bar */}
                                    {skills.length > 0 && (
                                        <div className="mb-2">
                                            <div className="flex items-center gap-1 mb-1">
                                                <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
                                                    {skills.length} skills
                                                </span>
                                                {/* Constellation color dots */}
                                                <div className="flex gap-0.5 ml-auto">
                                                    {constellationIds.map(cid => (
                                                        <div
                                                            key={cid}
                                                            className="w-1.5 h-1.5 rounded-full"
                                                            style={{ backgroundColor: CONSTELLATION_COLORS[cid] || '#888' }}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                            {/* Stacked bar */}
                                            <div className="flex h-1.5 rounded-full overflow-hidden gap-px" style={{ backgroundColor: 'var(--border-color)' }}>
                                                {masteredCount > 0 && (
                                                    <div
                                                        className="h-full rounded-full"
                                                        style={{
                                                            width: `${(masteredCount / skills.length) * 100}%`,
                                                            backgroundColor: 'var(--accent-color)',
                                                        }}
                                                        title={`${masteredCount} mastered`}
                                                    />
                                                )}
                                                {appliedCount > 0 && (
                                                    <div
                                                        className="h-full rounded-full"
                                                        style={{
                                                            width: `${(appliedCount / skills.length) * 100}%`,
                                                            backgroundColor: 'var(--text-main)',
                                                            opacity: 0.5,
                                                        }}
                                                        title={`${appliedCount} applied`}
                                                    />
                                                )}
                                                {learnedCount > 0 && (
                                                    <div
                                                        className="h-full rounded-full"
                                                        style={{
                                                            width: `${(learnedCount / skills.length) * 100}%`,
                                                            backgroundColor: 'var(--text-muted)',
                                                            opacity: 0.4,
                                                        }}
                                                        title={`${learnedCount} learned`}
                                                    />
                                                )}
                                            </div>
                                            <div className="flex text-[8px] mt-0.5 gap-2" style={{ color: 'var(--text-muted)' }}>
                                                {masteredCount > 0 && <span>● {masteredCount} mastered</span>}
                                                {appliedCount > 0 && <span>◐ {appliedCount} applied</span>}
                                                {learnedCount > 0 && <span>○ {learnedCount} learned</span>}
                                            </div>
                                        </div>
                                    )}

                                    {/* Key achievement preview */}
                                    {exp.achievements.length > 0 && (
                                        <div className="text-[9px] leading-relaxed line-clamp-2" style={{ color: 'var(--text-muted)' }}>
                                            <span style={{ color: 'var(--accent-color)' }}>★</span>{' '}
                                            {exp.achievements[0]}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Legend */}
            <div className="mt-3 pt-2 border-t flex flex-wrap gap-x-3 gap-y-1 text-[8px]" style={{ borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}>
                <span>◆ Full-time</span>
                <span>◇ Internship</span>
                <span>○ Freelance</span>
            </div>
        </div>
    );
}

// ============================================
// DETAIL PANEL — Deep-dive View
// ============================================

function DetailPanel({
    skill,
    experience,
    skillJobMap,
    experienceSkillMap,
    onSkillClick,
    onExperienceClick,
    onClose,
}: {
    skill: PositionedSkillNode | null | undefined;
    experience: Experience | null | undefined;
    skillJobMap: Map<string, { skillId: string; experiences: Array<{ experience: Experience; contribution: SkillContribution }> }>;
    experienceSkillMap: Map<string, { experienceId: string; skills: Array<{ skill: PositionedSkillNode; contribution: SkillContribution }> }>;
    onSkillClick: (id: string) => void;
    onExperienceClick: (id: string) => void;
    onClose: () => void;
}) {
    const constellationName = skill
        ? CONSTELLATIONS.find(c => c.id === skill.constellationId)?.name
        : null;
    const constellationColor = skill
        ? CONSTELLATION_COLORS[skill.constellationId] || '#888'
        : 'var(--accent-color)';

    return (
        <div className="font-mono text-xs">
            {/* Header bar */}
            <div
                className="sticky top-0 z-10 px-3 py-2 flex items-center gap-2 border-b"
                style={{
                    backgroundColor: 'var(--bg-card)',
                    borderColor: 'var(--border-color)',
                }}
            >
                <button
                    className="text-[10px] px-1.5 py-0.5 border rounded-sm transition-colors hover:border-[var(--accent-color)]"
                    style={{ color: 'var(--text-muted)', borderColor: 'var(--border-color)' }}
                    onClick={onClose}
                >
                    ← Back
                </button>
                <span className="text-[10px] ml-auto" style={{ color: 'var(--text-muted)' }}>
                    {skill ? 'SKILL DETAIL' : 'MISSION LOG'}
                </span>
            </div>

            <div className="p-3">
                {/* ── SKILL DETAIL VIEW ── */}
                {skill && (
                    <div>
                        {/* Skill header with constellation badge */}
                        <div className="mb-3">
                            <div className="flex items-start gap-2 mb-1.5">
                                <div className="flex-1">
                                    <div className="text-base font-bold leading-tight" style={{ color: 'var(--text-main)' }}>
                                        {skill.name}
                                    </div>
                                    {skill.description && (
                                        <div className="text-[10px] mt-0.5 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                                            {skill.description}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Constellation + Mastery row */}
                            <div className="flex items-center gap-2 flex-wrap">
                                <span
                                    className="text-[9px] px-1.5 py-0.5 rounded-sm font-bold uppercase tracking-wider border"
                                    style={{
                                        borderColor: constellationColor,
                                        color: constellationColor,
                                    }}
                                >
                                    {constellationName}
                                </span>
                                <span
                                    className="text-[9px] px-1.5 py-0.5 rounded-sm font-bold uppercase tracking-wider"
                                    style={{
                                        backgroundColor: constellationColor,
                                        color: '#000',
                                    }}
                                >
                                    {skill.masteryLevel}
                                </span>
                                <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                                    {skill.yearsOfExperience}y experience
                                </span>
                            </div>
                        </div>

                        {/* Mastery progress bar */}
                        <div className="mb-4">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-[9px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Mastery</span>
                                <span className="text-[10px] font-bold" style={{ color: constellationColor }}>
                                    {getMasteryStars(skill.masteryLevel)}
                                </span>
                            </div>
                            <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--border-color)' }}>
                                <motion.div
                                    className="h-full rounded-full"
                                    style={{ backgroundColor: constellationColor }}
                                    initial={{ width: 0 }}
                                    animate={{
                                        width: `${({ beginner: 25, intermediate: 50, advanced: 75, expert: 100 }[skill.masteryLevel] ?? 25)}%`
                                    }}
                                    transition={{ duration: 0.6, ease: 'easeOut' }}
                                />
                            </div>
                            <div className="flex justify-between text-[8px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                                <span>Beginner</span>
                                <span>Expert</span>
                            </div>
                        </div>

                        {/* Journey through jobs */}
                        <div className="mb-3">
                            <div className="flex items-center gap-1.5 mb-2 pb-1 border-b" style={{ borderColor: 'var(--border-color)' }}>
                                <span style={{ color: 'var(--accent-color)' }}>▸</span>
                                <span className="font-bold uppercase tracking-wider text-[10px]" style={{ color: 'var(--text-main)' }}>
                                    Skill Journey
                                </span>
                            </div>

                            {/* Mini vertical timeline */}
                            <div className="relative">
                                <div
                                    className="absolute left-[5px] top-2 bottom-2 w-px"
                                    style={{ backgroundColor: constellationColor, opacity: 0.3 }}
                                />
                                <div className="space-y-2">
                                    {(skillJobMap.get(skill.id)?.experiences ?? []).map(({ experience: exp, contribution }) => {
                                        const isCurrent = exp.current;
                                        return (
                                            <button
                                                key={exp.id}
                                                className="relative w-full text-left pl-5 py-1.5 pr-2 border rounded-sm transition-all hover:border-[var(--accent-color)] group"
                                                style={{ borderColor: 'var(--border-color)' }}
                                                onClick={() => onExperienceClick(exp.id)}
                                            >
                                                {/* Dot on timeline */}
                                                <div
                                                    className="absolute left-[2px] top-1/2 -translate-y-1/2 w-[7px] h-[7px] rounded-full"
                                                    style={{
                                                        backgroundColor: contribution === 'mastered' ? constellationColor
                                                            : contribution === 'applied' ? 'var(--text-main)'
                                                            : 'var(--text-muted)',
                                                        boxShadow: contribution === 'mastered' ? `0 0 4px ${constellationColor}` : undefined,
                                                    }}
                                                />

                                                <div className="flex items-start justify-between gap-1">
                                                    <div className="min-w-0">
                                                        <div className="font-bold truncate text-[10px] group-hover:text-[var(--accent-color)] transition-colors" style={{ color: 'var(--text-main)' }}>
                                                            {exp.company}
                                                        </div>
                                                        <div className="text-[9px] truncate" style={{ color: 'var(--text-muted)' }}>
                                                            {exp.position}
                                                        </div>
                                                    </div>
                                                    <span
                                                        className="shrink-0 text-[8px] px-1 py-0.5 rounded-sm font-bold uppercase tracking-wider"
                                                        style={{
                                                            backgroundColor: contribution === 'mastered'
                                                                ? constellationColor
                                                                : 'transparent',
                                                            color: contribution === 'mastered'
                                                                ? '#000'
                                                                : 'var(--text-muted)',
                                                            border: contribution === 'mastered'
                                                                ? 'none'
                                                                : '1px solid var(--border-color)',
                                                        }}
                                                    >
                                                        {contribution}
                                                    </span>
                                                </div>
                                                {isCurrent && (
                                                    <div className="text-[8px] mt-0.5" style={{ color: 'var(--accent-color)' }}>
                                                        ● Currently active
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Connected skills */}
                        {skill.connections.length > 0 && (
                            <div>
                                <div className="flex items-center gap-1.5 mb-2 pb-1 border-b" style={{ borderColor: 'var(--border-color)' }}>
                                    <span style={{ color: 'var(--accent-color)' }}>⟡</span>
                                    <span className="font-bold uppercase tracking-wider text-[10px]" style={{ color: 'var(--text-main)' }}>
                                        Connected Stars
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                    {skill.connections.map(connId => {
                                        const connColor = CONSTELLATION_COLORS[
                                            CONSTELLATIONS.find(c => c.skills.includes(connId))?.id || ''
                                        ] || 'var(--text-muted)';
                                        // Find the name from SKILL_NODES would require import, so use connId display
                                        return (
                                            <button
                                                key={connId}
                                                onClick={() => onSkillClick(connId)}
                                                className="text-[9px] px-1.5 py-0.5 border rounded-sm transition-colors hover:border-[var(--accent-color)]"
                                                style={{
                                                    borderColor: connColor,
                                                    color: connColor,
                                                    opacity: 0.8,
                                                }}
                                            >
                                                {connId.replace(/-/g, ' ')}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ── EXPERIENCE DETAIL VIEW ── */}
                {experience && (
                    <div>
                        {/* Experience header */}
                        <div className="mb-3">
                            <div className="flex items-start justify-between gap-2 mb-1">
                                <div>
                                    <div className="text-base font-bold leading-tight" style={{ color: 'var(--text-main)' }}>
                                        {experience.company}
                                    </div>
                                    <div className="text-[11px]" style={{ color: 'var(--accent-color)' }}>
                                        {experience.position}
                                    </div>
                                </div>
                                {experience.current && (
                                    <span
                                        className="shrink-0 text-[8px] px-1.5 py-0.5 rounded-sm font-bold uppercase tracking-wider"
                                        style={{
                                            backgroundColor: 'var(--accent-color)',
                                            color: 'var(--bg-main)',
                                        }}
                                    >
                                        Active
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2 text-[9px] flex-wrap" style={{ color: 'var(--text-muted)' }}>
                                <span>{TYPE_ICONS[experience.type] || '◆'} {experience.type}</span>
                                <span>•</span>
                                <span>{experience.location}</span>
                                <span>•</span>
                                <span>
                                    {new Date(experience.startDate).toLocaleString('en', { month: 'short', year: 'numeric' })}
                                    {' → '}
                                    {experience.current ? 'Present' : experience.endDate
                                        ? new Date(experience.endDate).toLocaleString('en', { month: 'short', year: 'numeric' })
                                        : ''}
                                </span>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="mb-3 text-[10px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                            {experience.description}
                        </div>

                        {/* Key Achievements */}
                        {experience.achievements.length > 0 && (
                            <div className="mb-3">
                                <div className="flex items-center gap-1.5 mb-2 pb-1 border-b" style={{ borderColor: 'var(--border-color)' }}>
                                    <span style={{ color: 'var(--accent-color)' }}>★</span>
                                    <span className="font-bold uppercase tracking-wider text-[10px]" style={{ color: 'var(--text-main)' }}>
                                        Key Achievements
                                    </span>
                                    <span className="ml-auto text-[9px]" style={{ color: 'var(--text-muted)' }}>
                                        {experience.achievements.length}
                                    </span>
                                </div>
                                <div className="space-y-1.5">
                                    {experience.achievements.map((ach, i) => (
                                        <div key={i} className="flex gap-1.5 text-[10px] leading-relaxed">
                                            <span className="shrink-0 mt-0.5" style={{ color: 'var(--accent-color)' }}>▸</span>
                                            <span style={{ color: 'var(--text-main)' }}>{ach}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Responsibilities */}
                        {experience.responsibilities.length > 0 && (
                            <div className="mb-3">
                                <div className="flex items-center gap-1.5 mb-2 pb-1 border-b" style={{ borderColor: 'var(--border-color)' }}>
                                    <span style={{ color: 'var(--accent-color)' }}>◎</span>
                                    <span className="font-bold uppercase tracking-wider text-[10px]" style={{ color: 'var(--text-main)' }}>
                                        Responsibilities
                                    </span>
                                </div>
                                <div className="space-y-1">
                                    {experience.responsibilities.map((resp, i) => (
                                        <div key={i} className="flex gap-1.5 text-[10px] leading-relaxed">
                                            <span className="shrink-0 text-[9px] w-3 text-right" style={{ color: 'var(--text-muted)' }}>
                                                {String(i + 1).padStart(2, '0')}
                                            </span>
                                            <span style={{ color: 'var(--text-muted)' }}>{resp}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Skills constellation breakdown */}
                        {(() => {
                            const expSkills = experienceSkillMap.get(experience.id)?.skills ?? [];
                            if (expSkills.length === 0) return null;

                            // Group by constellation
                            const grouped = new Map<string, Array<{ skill: PositionedSkillNode; contribution: SkillContribution }>>();
                            expSkills.forEach(s => {
                                const cid = s.skill.constellationId;
                                if (!grouped.has(cid)) grouped.set(cid, []);
                                grouped.get(cid)!.push(s);
                            });

                            return (
                                <div className="mb-3">
                                    <div className="flex items-center gap-1.5 mb-2 pb-1 border-b" style={{ borderColor: 'var(--border-color)' }}>
                                        <span style={{ color: 'var(--accent-color)' }}>⟡</span>
                                        <span className="font-bold uppercase tracking-wider text-[10px]" style={{ color: 'var(--text-main)' }}>
                                            Skills Gained
                                        </span>
                                        <span className="ml-auto text-[9px]" style={{ color: 'var(--text-muted)' }}>
                                            {expSkills.length} total
                                        </span>
                                    </div>

                                    <div className="space-y-2">
                                        {Array.from(grouped.entries()).map(([cid, skills]) => {
                                            const cName = CONSTELLATIONS.find(c => c.id === cid)?.name || cid;
                                            const cColor = CONSTELLATION_COLORS[cid] || '#888';
                                            return (
                                                <div key={cid}>
                                                    <div className="flex items-center gap-1 mb-1">
                                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cColor }} />
                                                        <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: cColor }}>
                                                            {cName}
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-wrap gap-1 pl-3">
                                                        {skills.map(({ skill: s, contribution }) => (
                                                            <button
                                                                key={s.id}
                                                                onClick={() => onSkillClick(s.id)}
                                                                className="text-[9px] px-1.5 py-0.5 border rounded-sm transition-all hover:border-[var(--accent-color)] flex items-center gap-1"
                                                                style={{
                                                                    borderColor: contribution === 'mastered' ? cColor : 'var(--border-color)',
                                                                    color: contribution === 'mastered' ? cColor : 'var(--text-main)',
                                                                }}
                                                            >
                                                                <span className="text-[8px]">
                                                                    {contribution === 'mastered' ? '●' : contribution === 'applied' ? '◐' : '○'}
                                                                </span>
                                                                {s.name}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Tech stack */}
                        {experience.technologies.length > 0 && (
                            <div>
                                <div className="flex items-center gap-1.5 mb-2 pb-1 border-b" style={{ borderColor: 'var(--border-color)' }}>
                                    <span style={{ color: 'var(--accent-color)' }}>⚙</span>
                                    <span className="font-bold uppercase tracking-wider text-[10px]" style={{ color: 'var(--text-main)' }}>
                                        Tech Stack
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                    {experience.technologies.map(tech => (
                                        <span
                                            key={tech}
                                            className="text-[9px] px-1.5 py-0.5 border rounded-sm"
                                            style={{
                                                borderColor: 'var(--border-color)',
                                                color: 'var(--text-muted)',
                                            }}
                                        >
                                            {tech}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

function getMasteryStars(level: string): string {
    const levels: Record<string, number> = { beginner: 1, intermediate: 2, advanced: 3, expert: 4 };
    const count = levels[level] ?? 1;
    return '★'.repeat(count) + '☆'.repeat(4 - count);
}

export default ObservatoryView;
