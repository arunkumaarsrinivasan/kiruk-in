'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Skill, EXPERTISE_COLORS, EXPERTISE_LABELS } from '../utils/skillData';

interface SkillStarProps {
  skill: Skill;
  x: number; // Position in percentage
  y: number; // Position in percentage
  isSelected?: boolean;
  isHighlighted?: boolean;
  onClick?: () => void;
  onHover?: (isHovering: boolean) => void;
}

export function SkillStar({
  skill,
  x,
  y,
  isSelected = false,
  isHighlighted = false,
  onClick,
  onHover,
}: SkillStarProps) {
  const [isHovered, setIsHovered] = useState(false);

  const color = EXPERTISE_COLORS[skill.expertise];
  const expertiseLabel = EXPERTISE_LABELS[skill.expertise];
  const shouldHighlight = isSelected || isHighlighted || isHovered;
  
  // Size based on expertise level
  const sizeMap = {
    expert: 12,
    advanced: 10,
    proficient: 8,
    learning: 6,
  };
  const starSize = sizeMap[skill.expertise];

  return (
    <motion.div
      className="absolute cursor-pointer"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: 'translate(-50%, -50%)',
        width: starSize,
        height: starSize,
        zIndex: shouldHighlight ? 20 : 10,
        imageRendering: 'pixelated' as any,
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: shouldHighlight ? 1 : 0.8,
        scale: shouldHighlight ? 1.3 : 1,
      }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
      onMouseEnter={() => {
        setIsHovered(true);
        onHover?.(true);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        onHover?.(false);
      }}
    >
      {/* Star/Pin shape - circular with expertise color */}
      <motion.div
        style={{
          width: starSize,
          height: starSize,
          backgroundColor: color,
          border: shouldHighlight
            ? `2px solid var(--accent-color)`
            : `1px solid ${color}`,
          borderRadius: '50%',
          position: 'relative',
        }}
        animate={{
          boxShadow: shouldHighlight
            ? [`0 0 ${starSize * 2}px ${color}`, `0 0 ${starSize * 3}px ${color}`, `0 0 ${starSize * 2}px ${color}`]
            : `0 0 ${starSize}px ${color}`,
        }}
        transition={{
          duration: 2,
          repeat: shouldHighlight ? Infinity : 0,
          ease: 'easeInOut',
        }}
      >
        {/* Star icon in center */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: starSize * 0.4,
            height: starSize * 0.4,
            backgroundColor: 'white',
            clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
          }}
        />
      </motion.div>

      {/* Label always visible */}
      <motion.div
        className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 pointer-events-none whitespace-nowrap"
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: shouldHighlight ? 1 : 0.9,
          y: 0,
        }}
        style={{
          backgroundColor: 'var(--bg-card)',
          border: shouldHighlight ? '2px solid var(--border-color)' : `1px solid ${color}`,
          padding: shouldHighlight ? '4px 8px' : '3px 6px',
          fontFamily: 'monospace',
          fontSize: shouldHighlight ? '11px' : '10px',
          color: shouldHighlight ? 'var(--text-main)' : color,
          zIndex: 30,
          textAlign: 'center',
          backdropFilter: 'blur(4px)',
        }}
      >
        <div style={{ 
          fontWeight: shouldHighlight ? 'bold' : '600',
          fontSize: shouldHighlight ? '11px' : '10px',
        }}>
          {skill.name}
        </div>
        {shouldHighlight && (
          <div style={{ fontSize: '8px', color: color, marginTop: '2px' }}>
            {expertiseLabel}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
