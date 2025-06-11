import React, { useEffect, useRef } from 'react';
import seedrandom from 'seedrandom';

interface EnhancedTornPhotoProps {
  id: string;
  initialPosition: { x: number; y: number };
  color?: string;
  width?: number;
  onPositionChange?: (id: string, pos: { x: number; y: number }) => void;
  className?: string;
}

export const EnhancedTornPhoto: React.FC<EnhancedTornPhotoProps> = ({
  id,
  initialPosition,
  color = '#fff',
  width = 120,
  onPositionChange,
  className = '',
}) => {
  const photoRef = useRef<HTMLDivElement>(null);

  function getDeterministicRotation(id: string) {
    const rng = seedrandom(id);
    return rng() * 6 - 3; // -3 to +3 degrees
  }
  const rotation = getDeterministicRotation(id);

  useEffect(() => {
    if (photoRef.current) {
      photoRef.current.style.transform = `rotate(${rotation}deg)`;
    }
  }, [rotation]);

  return (
    <div
      ref={photoRef}
      className={`torn-photo ${className}`}
      style={{
        position: 'absolute',
        left: initialPosition.x,
        top: initialPosition.y,
        width: `${width}px`,
        height: 'auto',
        transform: `rotate(${rotation}deg)`,
        cursor: 'pointer',
        userSelect: 'none',
        touchAction: 'none',
      }}
      onMouseDown={(e) => {
        e.preventDefault();
        const offsetX = e.clientX - initialPosition.x;
        const offsetY = e.clientY - initialPosition.y;

        const handleMouseMove = (moveEvent: MouseEvent) => {
          moveEvent.preventDefault();
          const newX = moveEvent.clientX - offsetX;
          const newY = moveEvent.clientY - offsetY;
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
      {/* Photo content goes here */}
    </div>
  );
};