'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PixelEmote, EmoteType } from './PixelEmote';
import { PixelProgressBar } from './PixelProgressBar';

interface PixelSkillBadgeProps {
  name: string;
  level: number; // 1-10
  category: 'frontend' | 'backend' | 'design' | 'tools' | 'soft';
  yearsOfExperience?: number;
  className?: string;
  size?: 'sm' | 'md';
  showDetails?: boolean;
}

const categoryConfig: Record<string, { color: string; emote: EmoteType }> = {
  frontend: { color: '#2196F3', emote: 'code' },
  backend: { color: '#4CAF50', emote: 'rocket' },
  design: { color: '#E91E63', emote: 'paint' },
  tools: { color: '#FF9800', emote: 'zap' },
  soft: { color: '#9C27B0', emote: 'heart' },
};

/**
 * Interactive 8-bit skill badge with level indicator
 */
export function PixelSkillBadge({
  name,
  level,
  category,
  yearsOfExperience,
  className = '',
  size = 'md',
  showDetails = true,
}: Readonly<PixelSkillBadgeProps>) {
  const [isHovered, setIsHovered] = useState(false);
  const config = categoryConfig[category];

  const sizeClasses = {
    sm: 'px-2 py-1 text-[10px]',
    md: 'px-3 py-1.5 text-xs',
  };

  return (
    <motion.div
      className={`relative inline-block ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        className={`${sizeClasses[size]} font-mono font-bold uppercase tracking-wider cursor-pointer flex items-center gap-2`}
        style={{
          backgroundColor: isHovered ? config.color : 'var(--bg-main)',
          color: isHovered ? '#fff' : config.color,
          border: `2px solid ${config.color}`,
          imageRendering: 'pixelated',
        }}
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.98 }}
      >
        <PixelEmote 
          type={config.emote} 
          size={size === 'sm' ? 12 : 14} 
          animated={false}
          color={isHovered ? '#fff' : config.color}
        />
        <span>{name}</span>
        
        {/* Level dots */}
        <div className="flex gap-0.5 ml-1">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="w-1 h-2"
              style={{
                backgroundColor: i < level 
                  ? (isHovered ? '#fff' : config.color) 
                  : (isHovered ? 'rgba(255,255,255,0.3)' : 'var(--border-color)'),
              }}
            />
          ))}
        </div>
      </motion.div>

      {/* Hover tooltip with details */}
      <AnimatePresence>
        {isHovered && showDetails && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 top-full left-1/2 -translate-x-1/2 mt-2 w-48"
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '2px solid var(--border-color)',
              boxShadow: '4px 4px 0 rgba(0,0,0,0.1)',
            }}
          >
            <div className="p-2">
              <div className="flex items-center gap-2 mb-2">
                <PixelEmote type={config.emote} size={16} color={config.color} />
                <span 
                  className="text-xs font-mono font-bold"
                  style={{ color: 'var(--text-main)' }}
                >
                  {name}
                </span>
              </div>
              
              <PixelProgressBar 
                value={level} 
                max={10} 
                label="Proficiency"
                color={config.color}
                height={12}
              />
              
              {yearsOfExperience && (
                <div className="mt-2 flex justify-between text-[10px] font-mono">
                  <span style={{ color: 'var(--text-muted)' }}>Experience</span>
                  <span style={{ color: config.color }}>{yearsOfExperience}+ years</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default PixelSkillBadge;
