'use client';

import { motion } from 'framer-motion';
import { Experience } from '@/data/portfolio-data';

interface ExperienceNodeProps {
  experience: Experience;
  x: number; // Position in percentage (timeline)
  y: number; // Position in percentage (vertical)
  isHighlighted?: boolean;
  onClick?: () => void;
  onHover?: (isHovering: boolean) => void;
}

export function ExperienceNode({
  experience,
  x,
  y,
  isHighlighted = false,
  onClick,
  onHover,
}: ExperienceNodeProps) {
  const formatPeriod = () => {
    const start = new Date(experience.startDate);
    const startStr = start.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    
    if (experience.current) {
      return `${startStr} - Present`;
    }
    
    if (experience.endDate) {
      const end = new Date(experience.endDate);
      const endStr = end.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      return `${startStr} - ${endStr}`;
    }
    
    return startStr;
  };

  return (
    <motion.div
      className="absolute cursor-pointer"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: 'translate(-50%, -50%)',
        zIndex: isHighlighted ? 25 : 15,
      }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{
        opacity: 1,
        scale: 1,
      }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
      onMouseEnter={() => onHover?.(true)}
      onMouseLeave={() => onHover?.(false)}
    >
      {/* Pill-shaped experience node - similar to objectives */}
      <motion.div
        className="flex items-center gap-0.5 px-1.5 py-0.5 border font-mono whitespace-nowrap flex-shrink-0"
        style={{
          borderWidth: 'var(--border-width)',
          borderColor: isHighlighted ? 'var(--accent-color)' : 'var(--border-color)',
          backgroundColor: isHighlighted 
            ? 'var(--accent-color)/20' 
            : 'var(--bg-card)',
          color: isHighlighted ? 'var(--accent-color)' : 'var(--text-muted)',
          fontSize: '9px',
          boxShadow: isHighlighted
            ? 'var(--shadow-offset-x) var(--shadow-offset-y) var(--shadow-blur) var(--shadow-color)'
            : 'none',
          imageRendering: 'pixelated' as any,
        }}
        animate={{
          scale: isHighlighted ? 1.05 : 1,
        }}
        transition={{ duration: 0.2 }}
      >
        <span style={{ fontSize: '8px' }}>{isHighlighted ? '✓' : '○'}</span>
        <span className="truncate max-w-[80px]">{experience.position}</span>
      </motion.div>
    </motion.div>
  );
}
