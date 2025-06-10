// InteractiveEye.tsx
'use client';

import React, { useRef, useEffect, useState, MouseEvent, TouchEvent } from 'react';
import { useRouter } from 'next/navigation';

interface InteractiveEyeProps {
  className?: string;
  size?: number; // diameter in px
  style?: React.CSSProperties;
  illuminati?: boolean; // new prop for triangle/illuminati style
}

const EYE_SIZE = 56;
const PUPIL_SIZE = 20;
const PUPIL_MOVE_RADIUS = 4; // max px pupil can move from center

const InteractiveEye: React.FC<InteractiveEyeProps> = ({ className = '', size = EYE_SIZE, style, illuminati = false }) => {
  const [pupil, setPupil] = useState({ x: 0, y: 0 });
  const eyeRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Track mouse/touch position relative to eye center
  useEffect(() => {
    function handleMove(e: MouseEvent | TouchEvent) {
      if (!eyeRef.current) return;
      const rect = eyeRef.current.getBoundingClientRect();
      let clientX = 0, clientY = 0;
      if ('touches' in e && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if ('clientX' in e) {
        clientX = e.clientX;
        clientY = e.clientY;
      }
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = clientX - centerX;
      const dy = clientY - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const maxDist = PUPIL_MOVE_RADIUS;
      let px = dx, py = dy;
      if (dist > maxDist) {
        const scale = maxDist / dist;
        px = dx * scale;
        py = dy * scale;
      }
      setPupil({ x: px, y: py });
    }
    function resetPupil() {
      setPupil({ x: 0, y: 0 });
    }
    // Use native event listeners for compatibility
    const onMouseMove = (e: Event) => handleMove(e as unknown as MouseEvent);
    const onTouchMove = (e: Event) => handleMove(e as unknown as TouchEvent);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('touchmove', onTouchMove);
    window.addEventListener('mouseout', resetPupil);
    window.addEventListener('touchend', resetPupil);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('mouseout', resetPupil);
      window.removeEventListener('touchend', resetPupil);
    };
  }, []);

  // Click/tap handler
  const handleClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    router.push('/interactive-demo');
  };

  return (
    <div
      ref={eyeRef}
      className={`$${illuminati ? '' : 'fixed top-6 right-6'} z-50 cursor-pointer select-none transition-transform hover:scale-105 active:scale-95 ${className}`}
      style={{ width: size, height: size, ...style }}
      onClick={handleClick}
      onTouchEnd={handleClick}
      aria-label="Go to Interactive Portfolio"
      tabIndex={0}
      role="button"
      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && handleClick(e as any)}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block' }}>
        {illuminati && (
          // Illuminati triangle, scribbled/doodled style
          <g>
            <polygon
              points={`${size/2},${size*0.08} ${size*0.92},${size*0.92} ${size*0.08},${size*0.92}`}
              fill="#fffbe7"
              stroke="#222"
              strokeWidth={3.2}
              style={{ filter: 'url(#scribble)' }}
            />
            {/* Doodle lines for triangle */}
            <polyline points={`${size*0.18},${size*0.88} ${size/2},${size*0.18} ${size*0.82},${size*0.88}`} fill="none" stroke="#aaa" strokeWidth={1.2} strokeDasharray="4 3" />
            <polyline points={`${size*0.22},${size*0.82} ${size/2},${size*0.28} ${size*0.78},${size*0.82}`} fill="none" stroke="#ccc" strokeWidth={0.8} strokeDasharray="2 4" />
          </g>
        )}
        {/* Eye outline */}
        <ellipse
          cx={size / 2}
          cy={size / 2}
          rx={size / 2 - 2}
          ry={size / 2.5}
          fill="#fff"
          stroke="#222"
          strokeWidth={2.5}
          style={illuminati ? { filter: 'url(#scribble)' } : {}}
        />
        {/* Eyelid accent */}
        <path
          d={`M${size * 0.12},${size * 0.5} Q${size / 2},${size * 0.08} ${size * 0.88},${size * 0.5}`}
          fill="none"
          stroke="#888"
          strokeWidth={1.2}
          strokeLinecap="round"
        />
        {/* Pupil (eyeball) */}
        <circle
          cx={size / 2 + pupil.x}
          cy={size / 2 + pupil.y}
          r={PUPIL_SIZE / 2}
          fill="#222"
          stroke="#111"
          strokeWidth={1.5}
        />
        {/* Eye highlight */}
        <ellipse
          cx={size / 2 + pupil.x - 4}
          cy={size / 2 + pupil.y - 4}
          rx={3}
          ry={2}
          fill="#fff"
          opacity={0.7}
        />
        {/* Scribble filter for doodle effect */}
        {illuminati && (
          <filter id="scribble">
            <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" result="turb" />
            <feDisplacementMap in2="turb" in="SourceGraphic" scale="2" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        )}
      </svg>
    </div>
  );
};

export default InteractiveEye;
