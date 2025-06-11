import seedrandom from 'seedrandom';
import React from 'react';

interface StickyArrowProps {
  id: string;
  initialPosition: { x: number; y: number };
  color?: string;
  width?: number;
  onPositionChange?: (id: string, pos: { x: number; y: number }) => void;
  className?: string;
}

export const StickyArrow: React.FC<StickyArrowProps> = ({
  id,
  initialPosition,
  color = '#f87171',
  width = 80,
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
      className={`sticky-arrow ${className}`}
      style={{
        position: 'absolute',
        left: initialPosition.x,
        top: initialPosition.y,
        width: `${width}px`,
        height: '2px',
        backgroundColor: color,
        transform: `rotate(${rotation}deg)`,
        transformOrigin: '0 50%',
        cursor: 'pointer',
      }}
      onMouseDown={(e) => {
        e.preventDefault();
        const offsetX = e.clientX - initialPosition.x;
        const offsetY = e.clientY - initialPosition.y;

        const handleMouseMove = (e: MouseEvent) => {
          const newX = e.clientX - offsetX;
          const newY = e.clientY - offsetY;
          onPositionChange?.(id, { x: newX, y: newY });
        };

        const handleMouseUp = () => {
          document.removeEventListener('mousemove', handleMouseMove);
          document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
      }}
    >
      {/* Arrowhead */}
      <div
        style={{
          position: 'absolute',
          right: '-10px',
          top: '-5px',
          width: '0',
          height: '0',
          borderTop: '5px solid transparent',
          borderBottom: '5px solid transparent',
          borderLeft: '10px solid',
          transform: `rotate(${rotation}deg)`,
        }}
      />
    </div>
  );
};