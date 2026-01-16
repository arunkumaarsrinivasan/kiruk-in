'use client';

import { motion } from 'framer-motion';

interface ConnectionLineProps {
  x1: number; // Start X in percentage
  y1: number; // Start Y in percentage
  x2: number; // End X in percentage
  y2: number; // End Y in percentage
  isHighlighted?: boolean;
  sharedSkills?: string[];
  pixelated?: boolean;
}

export function ConnectionLine({
  x1,
  y1,
  x2,
  y2,
  isHighlighted = false,
  sharedSkills = [],
  pixelated = true,
}: ConnectionLineProps) {
  const strokeColor = isHighlighted
    ? 'var(--accent-color)'
    : 'var(--border-color)';
  const strokeWidth = isHighlighted ? 2 : 1;
  const opacity = isHighlighted ? 0.8 : 0.3;

  return (
    <g>
      <motion.line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
        style={{ vectorEffect: 'non-scaling-stroke' }}
      />
      {sharedSkills.length > 0 && isHighlighted && (
        <motion.text
          x={(x1 + x2) / 2}
          y={(y1 + y2) / 2 - 10}
          fontSize="10"
          fill={strokeColor}
          textAnchor="middle"
          fontFamily="monospace"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {sharedSkills.length} skill{sharedSkills.length > 1 ? 's' : ''}
        </motion.text>
      )}
    </g>
  );
}
