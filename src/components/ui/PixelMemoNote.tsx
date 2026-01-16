'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { PixelEmote, EmoteType } from './PixelEmote';

interface PixelMemoNoteProps {
  children: React.ReactNode;
  emote?: EmoteType;
  color?: 'yellow' | 'pink' | 'blue' | 'green' | 'orange' | 'purple';
  rotation?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

const colorMap = {
  yellow: { bg: '#FFF9C4', border: '#FBC02D', tape: '#FFE082' },
  pink: { bg: '#FCE4EC', border: '#F48FB1', tape: '#F8BBD9' },
  blue: { bg: '#E3F2FD', border: '#64B5F6', tape: '#90CAF9' },
  green: { bg: '#E8F5E9', border: '#81C784', tape: '#A5D6A7' },
  orange: { bg: '#FFF3E0', border: '#FFB74D', tape: '#FFCC80' },
  purple: { bg: '#F3E5F5', border: '#BA68C8', tape: '#CE93D8' },
};

/**
 * 8-bit style memo/sticky note with optional emote
 */
export function PixelMemoNote({
  children,
  emote,
  color = 'yellow',
  rotation = 0,
  className = '',
  size = 'md',
  animated = true,
}: Readonly<PixelMemoNoteProps>) {
  const colors = colorMap[color];
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-[10px]',
    md: 'px-3 py-2 text-xs',
    lg: 'px-4 py-3 text-sm',
  };

  return (
    <motion.div
      className={`relative inline-block ${className}`}
      initial={animated ? { scale: 0, rotate: rotation - 10 } : undefined}
      animate={animated ? { scale: 1, rotate: rotation } : undefined}
      whileHover={animated ? { scale: 1.05, rotate: rotation + 2 } : undefined}
      transition={{ type: 'spring', stiffness: 300, damping: 15 }}
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      {/* Tape at top */}
      <div 
        className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-4"
        style={{ 
          backgroundColor: colors.tape,
          opacity: 0.8,
          boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
        }}
      />
      
      {/* Note body */}
      <div
        className={`${sizeClasses[size]} font-mono relative`}
        style={{
          backgroundColor: colors.bg,
          border: `2px solid ${colors.border}`,
          boxShadow: '2px 2px 0 rgba(0,0,0,0.1)',
          imageRendering: 'pixelated',
        }}
      >
        {/* Pixel corner decoration */}
        <div 
          className="absolute bottom-0 right-0 w-3 h-3"
          style={{
            backgroundImage: `linear-gradient(135deg, transparent 50%, ${colors.border} 50%)`,
          }}
        />
        
        {/* Content with optional emote */}
        <div className="flex items-start gap-2">
          {emote && (
            <PixelEmote type={emote} size={size === 'sm' ? 14 : size === 'md' ? 18 : 22} />
          )}
          <div className="flex-1">{children}</div>
        </div>
      </div>
    </motion.div>
  );
}

export default PixelMemoNote;
