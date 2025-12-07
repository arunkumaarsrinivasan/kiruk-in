import React from 'react';
import { motion, PanInfo } from 'framer-motion';

interface EnhancedHighlighterMarkProps {
  id: string;
  initialPosition: { x: number; y: number };
  color?: string;
  width?: number;
  onPositionChange?: (id: string, pos: { x: number; y: number }) => void;
  className?: string;
}

export const EnhancedHighlighterMark: React.FC<EnhancedHighlighterMarkProps> = ({
  id,
  initialPosition,
  color = '#000000',
  width = 100,
  onPositionChange,
  className = '',
}) => {
  const handleDragEnd = (event: any, info: PanInfo) => {
    onPositionChange?.(id, {
      x: initialPosition.x + info.offset.x,
      y: initialPosition.y + info.offset.y
    });
  };

  return (
    <motion.div
      className={`absolute cursor-move select-none ${className}`}
      initial={initialPosition}
      drag
      dragElastic={0}
      onDragEnd={handleDragEnd}
      whileHover={{ scale: 1.02 }}
      whileDrag={{ scale: 1.05, zIndex: 100 }}
    >
      <div 
        className="h-6 border border-[var(--border-color)] bg-transparent"
        style={{
          width: `${width}px`,
          backgroundImage: 'linear-gradient(45deg, var(--text-main) 25%, transparent 25%, transparent 50%, var(--text-main) 50%, var(--text-main) 75%, transparent 75%, transparent)',
          backgroundSize: '4px 4px',
          boxShadow: '4px 4px 0 var(--border-color)'
        }}
      />
    </motion.div>
  );
};
