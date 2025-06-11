import seedrandom from 'seedrandom';
import React, { useEffect, useState } from 'react';

interface WashiTapeProps {
  id: string;
  initialPosition: { x: number; y: number };
  color?: string;
  width?: number;
  onPositionChange?: (id: string, pos: { x: number; y: number }) => void;
  className?: string;
}

export const WashiTape: React.FC<WashiTapeProps> = ({
  id,
  initialPosition,
  color = '#fbbf24',
  width = 100,
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
      className={`absolute pointer-events-none ${className}`}
      style={{
        left: initialPosition.x,
        top: initialPosition.y,
        transform: `rotate(${rotation}deg)`,
        // ...existing styles
      }}
    >
      {/* ...existing code... */}
    </div>
  );
};