import React, { useMemo } from 'react';
import { motion, PanInfo } from 'framer-motion';
import seedrandom from 'seedrandom';

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
  color = '#fbbf24',
  width = 100,
  onPositionChange,
  className = '',
}) => {
  // Create deterministic rotation based on id using useMemo to ensure consistency
  const rotation = useMemo(() => {
    const rng = seedrandom(id);
    return (rng() - 0.5) * 6; // -3 to +3 degrees
  }, [id]);

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
      dragElastic={0.1}
      onDragEnd={handleDragEnd}
      whileHover={{ scale: 1.02 }}
      whileDrag={{ scale: 1.05, zIndex: 100 }}
    >
      <div 
        className="h-4 opacity-60 rounded"
        style={{
          width: `${width}px`,
          background: `
            linear-gradient(90deg, 
              transparent 0%, 
              ${color}88 10%, 
              ${color}aa 50%, 
              ${color}88 90%, 
              transparent 100%
            )
          `,
          transform: `rotate(${rotation}deg)`,
          filter: 'blur(0.5px)'
        }}
      />
    </motion.div>
  );
};