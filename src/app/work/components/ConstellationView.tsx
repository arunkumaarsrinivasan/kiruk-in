'use client';

import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { SkillStar } from './SkillStar';
import { ConnectionLine } from './ConnectionLine';
import { NodeDetailsModal } from './NodeDetailsModal';
import { ExperienceNode } from './ExperienceNode';
import { ExperienceDetailsModal } from './ExperienceDetailsModal';
import {
  CONSTELLATIONS,
  getAllSkills,
  getSkillConnections,
  calculateAllSkillPositions,
} from '../utils/skillData';
import {
  findExperiencesForSkill,
  calculateExperienceTimelinePosition,
} from '../utils/experienceMapping';
import { useExperience } from '@/hooks/usePortfolioData';
import { Experience } from '@/data/portfolio-data';

export function ConstellationView() {
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);
  const [hoveredSkillId, setHoveredSkillId] = useState<string | null>(null);
  const [selectedExperienceId, setSelectedExperienceId] = useState<string | null>(null);
  const [hoveredExperienceId, setHoveredExperienceId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showTimeline] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastTouchDistance = useRef<number | null>(null);

  // Load experiences
  const experiences = useExperience();

  // Calculate positions for all skills
  const skillPositions = useMemo(() => calculateAllSkillPositions(), []);

  // Get all skills
  const allSkills = useMemo(() => getAllSkills(), []);

  // Calculate experience positions (timeline along bottom)
  const experiencePositions = useMemo(() => {
    const positions = new Map<string, { x: number; y: number }>();
    experiences.forEach((exp) => {
      const timelineX = calculateExperienceTimelinePosition(exp, experiences);
      // Position experiences along the bottom (85% from top)
      positions.set(exp.id, { x: timelineX, y: 85 });
    });
    return positions;
  }, [experiences]);

  // Map skills to experiences
  const skillToExperiences = useMemo(() => {
    const map = new Map<string, Experience[]>();
    allSkills.forEach((skill) => {
      const relatedExps = findExperiencesForSkill(skill, experiences);
      if (relatedExps.length > 0) {
        map.set(skill.id, relatedExps);
      }
    });
    return map;
  }, [allSkills, experiences]);

  // Calculate connections between skills
  const skillConnections = useMemo(() => {
    const conns: Array<{
      from: string;
      to: string;
      type: 'skill-skill';
    }> = [];

    allSkills.forEach((skill) => {
      skill.connections.forEach((connectedId) => {
        // Avoid duplicate connections
        if (skill.id < connectedId) {
          conns.push({
            from: skill.id,
            to: connectedId,
            type: 'skill-skill',
          });
        }
      });
    });

    return conns;
  }, [allSkills]);

  // Timeline is separate - no connections to skills needed


  // Get selected skill
  const selectedSkill = useMemo(() => {
    if (!selectedSkillId) return null;
    return allSkills.find((skill) => skill.id === selectedSkillId) || null;
  }, [selectedSkillId, allSkills]);

  // Get related skills (connected skills)
  const relatedSkills = useMemo(() => {
    if (!selectedSkillId) return [];
    return getSkillConnections(selectedSkillId);
  }, [selectedSkillId]);

  // Determine hovered constellation
  const hoveredConstellationId = useMemo(() => {
    if (!hoveredSkillId) return null;
    const constellation = CONSTELLATIONS.find(c => 
      c.skills.some(s => s.id === hoveredSkillId)
    );
    return constellation?.id || null;
  }, [hoveredSkillId]);

  // Handle zoom with mouse wheel / trackpad
  const handleWheel = useCallback((e: WheelEvent) => {
    if (containerRef.current?.contains(e.target as Node)) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setZoom((prev) => Math.max(0.5, Math.min(3, prev + delta)));
    }
  }, []);

  // Handle touch pinch zoom
  const getTouchDistance = (touches: TouchList): number => {
    const touch1 = touches[0];
    const touch2 = touches[1];
    if (!touch1 || !touch2) return 0;
    const dx = touch2.clientX - touch1.clientX;
    const dy = touch2.clientY - touch1.clientY;
    return Math.hypot(dx, dy);
  };

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (e.touches.length === 2) {
      lastTouchDistance.current = getTouchDistance(e.touches);
    }
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (e.touches.length === 2 && lastTouchDistance.current !== null) {
      e.preventDefault();
      const currentDistance = getTouchDistance(e.touches);
      const scale = currentDistance / lastTouchDistance.current;
      setZoom((prev) => Math.max(0.5, Math.min(3, prev * scale)));
      lastTouchDistance.current = currentDistance;
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    lastTouchDistance.current = null;
  }, []);

  // Handle mouse drag for panning
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0 && !isDragging) { // Left mouse button
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  }, [pan, isDragging]);

  // Handle touch drag for panning
  const touchStartPos = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStartPan = useCallback((e: TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      touchStartPos.current = { x: touch.clientX - pan.x, y: touch.clientY - pan.y };
    }
  }, [pan]);

  const handleTouchMovePan = useCallback((e: TouchEvent) => {
    if (e.touches.length === 1 && touchStartPos.current) {
      e.preventDefault();
      const touch = e.touches[0];
      setPan({
        x: touch.clientX - touchStartPos.current.x,
        y: touch.clientY - touchStartPos.current.y,
      });
    }
  }, []);

  const handleTouchEndPan = useCallback(() => {
    touchStartPos.current = null;
  }, []);

  // Set up event listeners
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });
    container.addEventListener('touchstart', handleTouchStartPan, { passive: true });
    container.addEventListener('touchmove', handleTouchMovePan, { passive: false });
    container.addEventListener('touchend', handleTouchEndPan, { passive: true });

    return () => {
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('touchstart', handleTouchStartPan);
      container.removeEventListener('touchmove', handleTouchMovePan);
      container.removeEventListener('touchend', handleTouchEndPan);
    };
  }, [handleWheel, handleTouchStart, handleTouchMove, handleTouchEnd, handleTouchStartPan, handleTouchMovePan, handleTouchEndPan]);

  // Global mouse handlers for drag
  useEffect(() => {
    if (isDragging) {
      const handleGlobalMouseMove = (e: MouseEvent) => {
        setPan({
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y,
        });
      };
      const handleGlobalMouseUp = () => setIsDragging(false);
      
      globalThis.addEventListener('mousemove', handleGlobalMouseMove);
      globalThis.addEventListener('mouseup', handleGlobalMouseUp);
      
      return () => {
        globalThis.removeEventListener('mousemove', handleGlobalMouseMove);
        globalThis.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }
  }, [isDragging, dragStart]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden"
      style={{ backgroundColor: 'var(--bg-main)' }}
    >
      {/* Constellation Canvas */}
      <motion.div
        className="absolute inset-0"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: 'center center',
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
        onMouseDown={handleMouseDown}
      >
        {/* Connections */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ imageRendering: 'pixelated' as any }}
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {/* Skill to Skill connections */}
          {skillConnections.map((conn) => {
            const fromPos = skillPositions.get(conn.from);
            const toPos = skillPositions.get(conn.to);
            if (!fromPos || !toPos) return null;

            const isHighlighted =
              selectedSkillId === conn.from ||
              selectedSkillId === conn.to ||
              hoveredSkillId === conn.from ||
              hoveredSkillId === conn.to;

            return (
              <ConnectionLine
                key={`skill-${conn.from}-${conn.to}`}
                x1={fromPos.x}
                y1={fromPos.y}
                x2={toPos.x}
                y2={toPos.y}
                isHighlighted={isHighlighted}
              />
            );
          })}

          {/* Timeline horizontal line (subtle background) */}
          {showTimeline && (
            <line
              x1="0"
              y1="85"
              x2="100"
              y2="85"
              stroke="var(--border-color)"
              strokeWidth="0.5"
              opacity="0.3"
            />
          )}

          {/* Timeline is separate - no connections to skills */}

          {/* Constellation Labels */}
          {CONSTELLATIONS.map((constellation) => {
            // Calculate center of constellation
            const constellationSkills = constellation.skills;
            const positions = constellationSkills
              .map((skill) => skillPositions.get(skill.id))
              .filter((pos): pos is { x: number; y: number; constellationId: string } => pos !== undefined);

            if (positions.length === 0) return null;

            const centerX =
              positions.reduce((sum, pos) => sum + pos.x, 0) / positions.length;

            const ys = positions.map((p) => p.y);
            const maxY = Math.max(...ys);
            
            // Only show if this constellation is hovered
            const isHovered = hoveredConstellationId === constellation.id;
            const shouldShow = isHovered;

            if (!shouldShow) return null;

            return (
              <g key={constellation.id}>
                {/* Constellation name */}
                <motion.text
                  x={centerX}
                  y={maxY + 8} // Position below the lowest star
                  fontSize="2" // Small size in 0-100 coord system
                  fill={constellation.color}
                  textAnchor="middle"
                  fontFamily="monospace"
                  fontWeight="bold"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isHovered ? 1 : 0.8 }}
                  transition={{ delay: 0.1 }}
                >
                  {constellation.westernName}
                </motion.text>

                {/* Constellation description - only on hover */}
                {isHovered && (
                  <motion.text
                    x={centerX}
                    y={maxY + 11}
                    fontSize="1.5"
                    fill={constellation.color}
                    textAnchor="middle"
                    fontFamily="monospace"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.8 }}
                    transition={{ delay: 0.2 }}
                  >
                    {constellation.description}
                  </motion.text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Skill Stars */}
        {allSkills.map((skill) => {
          const pos = skillPositions.get(skill.id);
          if (!pos) return null;

          return (
            <SkillStar
              key={skill.id}
              skill={skill}
              x={pos.x}
              y={pos.y}
              isSelected={selectedSkillId === skill.id}
              isHighlighted={hoveredSkillId === skill.id}
              onClick={() => setSelectedSkillId(skill.id)}
              onHover={(isHovering) =>
                setHoveredSkillId(isHovering ? skill.id : null)
              }
            />
          );
        })}

        {/* Experience Nodes (Timeline) */}
        {showTimeline && experiences.map((experience) => {
          const pos = experiencePositions.get(experience.id);
          if (!pos) return null;

          return (
            <ExperienceNode
              key={experience.id}
              experience={experience}
              x={pos.x}
              y={pos.y}
              isHighlighted={
                selectedExperienceId === experience.id ||
                hoveredExperienceId === experience.id
              }
              onClick={() => setSelectedExperienceId(experience.id)}
              onHover={(isHovering) =>
                setHoveredExperienceId(isHovering ? experience.id : null)
              }
            />
          );
        })}
      </motion.div>


      {/* Skill Details Modal */}
      <NodeDetailsModal
        skill={selectedSkill}
        isOpen={selectedSkillId !== null}
        onClose={() => setSelectedSkillId(null)}
        relatedSkills={relatedSkills}
      />

      {/* Experience Details Modal */}
      <ExperienceDetailsModal
        experience={experiences.find(e => e.id === selectedExperienceId) || null}
        isOpen={selectedExperienceId !== null}
        onClose={() => setSelectedExperienceId(null)}
      />
    </div>
  );
}