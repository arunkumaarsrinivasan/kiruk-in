import React, { useEffect, useRef } from 'react';
import seedrandom from 'seedrandom';

interface EnhancedInkBlotProps {
  id: string;
  initialPosition: { x: number; y: number };
  color?: string;
  size?: number;
  onPositionChange?: (id: string, pos: { x: number; y: number }) => void;
  className?: string;
}

export const EnhancedInkBlot: React.FC<EnhancedInkBlotProps> = ({
  id,
  initialPosition,
  color = '#2d3748',
  size = 50,
  onPositionChange,
  className = '',
}) => {
  const inkBlotRef = useRef<HTMLDivElement>(null);

  function getDeterministicRotation(id: string) {
    const rng = seedrandom(id);
    return rng() * 6 - 3; // -3 to +3 degrees
  }
  const rotation = getDeterministicRotation(id);

  useEffect(() => {
    if (inkBlotRef.current) {
      const handleMouseMove = (e: MouseEvent) => {
        const { clientX, clientY } = e;
        const { innerWidth, innerHeight } = window;
        const x = ((clientX / innerWidth) * 100) | 0;
        const y = ((clientY / innerHeight) * 100) | 0;
        onPositionChange?.(id, { x, y });
      };

      window.addEventListener('mousemove', handleMouseMove);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
      };
    }
  }, [id, onPositionChange]);

  return (
    <div
      ref={inkBlotRef}
      className={`absolute pointer-events-none ${className}`}
      style={{
        left: `${initialPosition.x}%`,
        top: `${initialPosition.y}%`,
        transform: `rotate(${rotation}deg)`,
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: color,
        borderRadius: '50%',
        transition: 'transform 0.3s ease',
      }}
    >
      {/* Additional content or children can be added here */}
    </div>
  );
};