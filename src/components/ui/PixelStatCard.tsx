'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { PixelEmote, EmoteType } from './PixelEmote';

interface PixelStatCardProps {
  label: string;
  value: string | number;
  emote?: EmoteType;
  subtext?: string;
  color?: string;
  className?: string;
  onClick?: () => void;
  delay?: number;
}

/**
 * Interactive 8-bit stat card for displaying metrics
 */
export function PixelStatCard({
  label,
  value,
  emote,
  subtext,
  color = 'var(--accent-color)',
  className = '',
  onClick,
  delay = 0,
}: Readonly<PixelStatCardProps>) {
  return (
    <motion.div
      className={`p-3 cursor-pointer group ${className}`}
      style={{
        backgroundColor: 'var(--bg-main)',
        border: '2px solid var(--border-color)',
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ 
        scale: 1.02, 
        y: -4,
        borderColor: color,
      }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
    >
      {/* Emote */}
      {emote && (
        <motion.div 
          className="mb-2"
          whileHover={{ scale: 1.2, rotate: 10 }}
        >
          <PixelEmote type={emote} size={24} color={color} />
        </motion.div>
      )}
      
      {/* Value */}
      <motion.div
        className="text-2xl font-mono font-black"
        style={{ color }}
        initial={{ scale: 0.5 }}
        animate={{ scale: 1 }}
        transition={{ delay: delay + 0.2, type: 'spring' }}
      >
        {value}
      </motion.div>
      
      {/* Label */}
      <div 
        className="text-[10px] font-mono font-bold uppercase tracking-wider mt-1"
        style={{ color: 'var(--text-muted)' }}
      >
        {label}
      </div>
      
      {/* Subtext */}
      {subtext && (
        <div 
          className="text-[10px] font-mono mt-1 opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ color: 'var(--text-main)' }}
        >
          {subtext}
        </div>
      )}
      
      {/* Corner decoration */}
      <div 
        className="absolute bottom-0 right-0 w-2 h-2 opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ backgroundColor: color }}
      />
    </motion.div>
  );
}

export default PixelStatCard;
