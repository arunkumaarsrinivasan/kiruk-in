'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
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

/**
 * ObservatoryView - Enhanced Skills Constellation
 * 
 * Features:
 * - Unified control panel with radar chart
 * - Stellarium-style timeline slider
 * - Click constellation to filter
 * - Journey log on right side
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

    // Get connection lines
    const connectionLines = useMemo(() => getConnectionLines(), [getConnectionLines]);

    // Filter skills by constellation AND timeline
    const filteredSkills = useMemo(() => {
        return skills.filter(skill => {
            // Constellation filter
            if (constellationFilter && skill.constellationId !== constellationFilter) return false;

            // Timeline filter
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

    return (
        <div className="w-full h-[calc(100vh-100px)] relative overflow-hidden flex" style={{ backgroundColor: 'var(--bg-main)' }}>

            {/* LEFT: Unified Control Panel (Desktop) */}
            {!isMobile && (
                <div
                    className="w-48 shrink-0 border-r-2 flex flex-col overflow-y-auto"
                    style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
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

            {/* CENTER: Star Map */}
            <div className="flex-1 flex flex-col relative">

                {/* Header */}
                <div className="h-10 px-4 flex items-center border-b-2" style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-color)' }}>
                    <span className="text-sm font-bold font-mono" style={{ color: 'var(--accent-color)' }}>★</span>
                    <span className="text-sm font-bold font-mono ml-2" style={{ color: 'var(--text-main)' }}>SKILLS OBSERVATORY</span>
                </div>

                {/* Star Map SVG */}
                <div className="flex-1 relative" style={{ backgroundColor: 'var(--bg-card)' }}>
                    <svg
                        className="absolute inset-0 w-full h-full"
                        viewBox="0 0 100 100"
                        preserveAspectRatio="xMidYMid meet"
                    >
                        {/* Outer frame */}
                        <rect x="2" y="2" width="96" height="96" fill="none" stroke="var(--border-color)" strokeWidth="0.2" opacity="0.3" />

                        {/* Concentric circles */}
                        {gridConfig.yAxis.levels.map((level, _i) => {
                            const r = maxRadius * (0.2 + (1 - level.position / 100) * 0.8);
                            return <circle key={level.id} cx={cx} cy={cy} r={r} fill="none" stroke="var(--border-color)" strokeWidth="0.1" opacity="0.3" />;
                        })}

                        {/* Outer circle */}
                        <circle cx={cx} cy={cy} r={maxRadius} fill="none" stroke="var(--accent-color)" strokeWidth="0.3" opacity="0.4" />

                        {/* Radial lines + Labels (clickable) */}
                        {CONSTELLATIONS.map((constellation, i) => {
                            const angle = (i * sectorAngle - 90) * (Math.PI / 180);
                            const midAngle = ((i * sectorAngle) + sectorAngle / 2 - 90) * (Math.PI / 180);
                            const isActive = constellationFilter === constellation.id;

                            return (
                                <g key={constellation.id}>
                                    <line
                                        x1={cx} y1={cy}
                                        x2={cx + Math.cos(angle) * maxRadius}
                                        y2={cy + Math.sin(angle) * maxRadius}
                                        stroke="var(--border-color)" strokeWidth="0.1" opacity="0.3"
                                    />
                                    <text
                                        x={cx + Math.cos(midAngle) * (maxRadius + 5)}
                                        y={cy + Math.sin(midAngle) * (maxRadius + 5)}
                                        fontSize="2.5"
                                        fill={isActive ? 'var(--accent-color)' : 'var(--text-muted)'}
                                        textAnchor="middle"
                                        dominantBaseline="middle"
                                        fontFamily="monospace"
                                        fontWeight={isActive ? 'bold' : 'normal'}
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => handleConstellationClick(constellation.id)}
                                    >
                                        {constellation.name.toUpperCase()}
                                    </text>
                                </g>
                            );
                        })}

                        {/* Connection lines */}
                        {connectionLines.map(line => {
                            const fromVisible = filteredSkills.some(s => s.id === line.from);
                            const toVisible = filteredSkills.some(s => s.id === line.to);
                            if (!fromVisible || !toVisible) return null;

                            const isHighlighted = hoveredSkillId === line.from || hoveredSkillId === line.to ||
                                selectedSkillId === line.from || selectedSkillId === line.to ||
                                highlightedSkillIds.includes(line.from) || highlightedSkillIds.includes(line.to);

                            return (
                                <line
                                    key={`${line.from}-${line.to}`}
                                    x1={line.fromPos.x} y1={line.fromPos.y}
                                    x2={line.toPos.x} y2={line.toPos.y}
                                    stroke={isHighlighted ? 'var(--accent-color)' : 'var(--border-color)'}
                                    strokeWidth={isHighlighted ? 0.25 : 0.1}
                                    opacity={isHighlighted ? 0.7 : 0.2}
                                />
                            );
                        })}

                        {/* Skill stars (squares) */}
                        {filteredSkills.map(skill => {
                            const isSelected = selectedSkillId === skill.id;
                            const isHovered = hoveredSkillId === skill.id;
                            const isHighlighted = highlightedSkillIds.includes(skill.id);
                            const shouldHighlight = isSelected || isHovered || isHighlighted;
                            const size = skill.size / 12;

                            return (
                                <g
                                    key={skill.id}
                                    transform={`translate(${skill.x}, ${skill.y})`}
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => handleSkillSelect(skill.id)}
                                    onMouseEnter={() => handleSkillHover(skill.id)}
                                    onMouseLeave={() => handleSkillHover(null)}
                                >
                                    {shouldHighlight && (
                                        <rect x={-size * 1.3} y={-size * 1.3} width={size * 2.6} height={size * 2.6}
                                            fill={skill.color} opacity={0.2} />
                                    )}
                                    <rect x={-size} y={-size} width={size * 2} height={size * 2}
                                        fill={skill.color}
                                        stroke={shouldHighlight ? 'var(--accent-color)' : 'transparent'}
                                        strokeWidth={0.2}
                                    />
                                    <text
                                        y={size + 2}
                                        fontSize="1.6"
                                        fill={shouldHighlight ? 'var(--text-main)' : 'var(--text-muted)'}
                                        textAnchor="middle"
                                        fontFamily="monospace"
                                        fontWeight={shouldHighlight ? 'bold' : 'normal'}
                                    >
                                        {skill.name}
                                    </text>
                                </g>
                            );
                        })}

                        {/* Center */}
                        <circle cx={cx} cy={cy} r="1" fill="var(--accent-color)" opacity="0.4" />
                    </svg>
                </div>

                {/* Timeline Slider (Bottom) */}
                <TimelineSlider
                    experiences={experiences}
                    currentDate={timelineDate}
                    onChange={setTimelineDate}
                    range={timelineRange}
                    onExperienceClick={handleExperienceSelect}
                    selectedExperienceId={selectedExperienceId}
                />
            </div>

            {/* RIGHT: Journey Log + Detail Panel (Desktop) */}
            {!isMobile && (
                <div
                    className="w-64 shrink-0 border-l-2 flex flex-col overflow-hidden"
                    style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
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
// JOURNEY LOG
// ============================================

function JourneyLog({
    experiences,
    selectedId,
    onSelect,
    currentDate,
}: {
    experiences: Experience[];
    selectedId: string | null;
    onSelect: (id: string) => void;
    currentDate: string;
}) {
    const sortedExps = [...experiences].sort((a, b) => b.startDate.localeCompare(a.startDate));

    return (
        <div className="p-3 font-mono text-xs">
            <div className="mb-3" style={{ color: 'var(--accent-color)' }}>📜 JOURNEY LOG</div>

            <div className="space-y-2">
                {sortedExps.map(exp => {
                    const isVisible = exp.startDate <= currentDate;
                    const isSelected = selectedId === exp.id;

                    return (
                        <button
                            key={exp.id}
                            className="w-full text-left p-2 border transition-all"
                            style={{
                                borderColor: isSelected ? 'var(--accent-color)' : 'var(--border-color)',
                                backgroundColor: isSelected ? 'var(--accent-color)' : 'transparent',
                                color: isSelected ? 'var(--bg-main)' : 'var(--text-main)',
                                opacity: isVisible ? 1 : 0.4,
                            }}
                            onClick={() => onSelect(exp.id)}
                            disabled={!isVisible}
                        >
                            <div className="font-bold truncate">{exp.company}</div>
                            <div className="text-[10px] truncate" style={{ color: isSelected ? 'var(--bg-main)' : 'var(--text-muted)' }}>
                                {exp.position}
                            </div>
                            <div className="text-[10px]" style={{ color: isSelected ? 'var(--bg-main)' : 'var(--text-muted)' }}>
                                {new Date(exp.startDate).getFullYear()}{exp.current ? ' - Present' : exp.endDate ? ` - ${new Date(exp.endDate).getFullYear()}` : ''}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

// ============================================
// DETAIL PANEL
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
    return (
        <div className="p-4 font-mono text-xs">
            <button className="mb-3" style={{ color: 'var(--text-muted)' }} onClick={onClose}>← Back</button>

            {skill && (
                <>
                    <div className="mb-3">
                        <div className="text-lg font-bold" style={{ color: 'var(--text-main)' }}>{skill.name}</div>
                        <div style={{ color: skill.color }}>{getMasteryStars(skill.masteryLevel)} • {skill.yearsOfExperience}y</div>
                    </div>
                    {skill.description && <p className="mb-3" style={{ color: 'var(--text-muted)' }}>{skill.description}</p>}

                    <div className="mb-3">
                        <div className="font-bold mb-1" style={{ color: 'var(--accent-color)' }}>▪ Journey</div>
                        <div className="space-y-1">
                            {(skillJobMap.get(skill.id)?.experiences ?? []).map(({ experience: exp, contribution }) => (
                                <button
                                    key={exp.id}
                                    className="w-full text-left p-2 border"
                                    style={{ borderColor: 'var(--border-color)' }}
                                    onClick={() => onExperienceClick(exp.id)}
                                >
                                    <span style={{ color: 'var(--text-main)' }}>{exp.company}</span>
                                    <span className="ml-2 px-1" style={{ backgroundColor: 'var(--accent-color)', color: 'var(--bg-main)' }}>{contribution}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}

            {experience && (
                <>
                    <div className="mb-3">
                        <div className="text-lg font-bold" style={{ color: 'var(--text-main)' }}>{experience.company}</div>
                        <div style={{ color: 'var(--text-muted)' }}>{experience.position}</div>
                    </div>
                    <p className="mb-3" style={{ color: 'var(--text-muted)' }}>{experience.description}</p>

                    <div>
                        <div className="font-bold mb-1" style={{ color: 'var(--accent-color)' }}>▪ Skills</div>
                        <div className="flex flex-wrap gap-1">
                            {(experienceSkillMap.get(experience.id)?.skills ?? []).map(({ skill: s, contribution }) => (
                                <button
                                    key={s.id}
                                    className="px-1 border"
                                    style={{ borderColor: s.color, color: s.color }}
                                    onClick={() => onSkillClick(s.id)}
                                >
                                    {contribution === 'mastered' ? '●' : contribution === 'applied' ? '◐' : '○'} {s.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

function getMasteryStars(level: string): string {
    const levels: Record<string, number> = { beginner: 1, intermediate: 2, advanced: 3, expert: 4 };
    const count = levels[level] ?? 1;
    return '★'.repeat(count) + '☆'.repeat(4 - count);
}

export default ObservatoryView;
