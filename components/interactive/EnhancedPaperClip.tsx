import React from 'react';
import seedrandom from 'seedrandom';

interface EnhancedPaperClipProps {
  id: string;
  initialPosition: { x: number; y: number };
  color?: string;
  width?: number;
  onPositionChange?: (id: string, pos: { x: number; y: number }) => void;
  className?: string;
}

export const EnhancedPaperClip: React.FC<EnhancedPaperClipProps> = ({
  id,
  initialPosition,
  color = '#aaa',
  width = 60,
  onPositionChange,
  className = '',
}) => {
  function getDeterministicRotation(id: string) {
    const rng = seedrandom(id);
    return rng() * 6 - 3; // -3 to +3 degrees
  }
  const rotation = getDeterministicRotation(id);

  return (
    <div
      className={`paper-clip ${className}`}
      style={{
        position: 'absolute',
        left: initialPosition.x,
        top: initialPosition.y,
        width: `${width}px`,
        height: 'auto',
        color,
        transform: `rotate(${rotation}deg)`,
      }}
      onMouseMove={(e) => {
        if (onPositionChange) {
          onPositionChange(id, { x: e.clientX, y: e.clientY });
        }
      }}
    >
      {/* ...existing code... */}
    </div>
  );
};