'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface PixelProgressBarProps {
  value: number; // 0-100 or 0-10
  max?: number;
  label?: string;
  showValue?: boolean;
  color?: string;
  height?: number;
  className?: string;
  animated?: boolean;
  delay?: number;
}

/**
 * 8-bit style animated progress bar
 */
export function PixelProgressBar({
  value,
  max = 100,
  label,
  showValue = true,
  color = 'var(--accent-color)',
  height = 16,
  className = '',
  animated = true,
  delay = 0,
}: Readonly<PixelProgressBarProps>) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const displayValue = max === 10 ? value : Math.round(percentage);

  return (
    <div className={`w-full ${className}`}>
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-1">
          {label && (
            <span 
              className="text-[10px] font-mono font-bold uppercase tracking-wider"
              style={{ color: 'var(--text-muted)' }}
            >
              {label}
            </span>
          )}
          {showValue && (
            <span 
              className="text-[10px] font-mono font-bold"
              style={{ color }}
            >
              {displayValue}{max === 10 ? '/10' : '%'}
            </span>
          )}
        </div>
      )}
      
      <div 
        className="relative overflow-hidden"
        style={{ 
          height,
          backgroundColor: 'var(--bg-main)',
          border: '2px solid var(--border-color)',
          imageRendering: 'pixelated',
        }}
      >
        {/* Grid pattern overlay */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'linear-gradient(90deg, transparent 50%, var(--border-color) 50%)',
            backgroundSize: `${height}px 100%`,
          }}
        />
        
        {/* Progress fill */}
        <motion.div
          className="absolute inset-y-0 left-0"
          style={{ backgroundColor: color }}
          initial={animated ? { width: 0 } : undefined}
          animate={{ width: `${percentage}%` }}
          transition={{ 
            duration: animated ? 0.8 : 0, 
            delay,
            ease: [0.4, 0, 0.2, 1] 
          }}
        >
          {/* Shine effect */}
          <div 
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.3) 0%, transparent 50%, rgba(0,0,0,0.1) 100%)',
            }}
          />
        </motion.div>

        {/* Pixel blocks for 8-bit feel */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(90deg, transparent ${height - 2}px, rgba(0,0,0,0.05) ${height - 2}px),
              linear-gradient(180deg, transparent ${(height - 4) / 2}px, rgba(0,0,0,0.03) ${(height - 4) / 2}px)
            `,
            backgroundSize: `${height}px 100%, 100% ${(height - 4) / 2}px`,
          }}
        />
      </div>
    </div>
  );
}

export default PixelProgressBar;
