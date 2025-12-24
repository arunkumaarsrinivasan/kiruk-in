"use client";
import React, { useEffect, useRef, useState } from 'react';
import { GRID_SIZE, snapToGrid } from '@/lib/utils';

const CustomCursor: React.FC = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Hide default cursor globally
    const style = document.createElement('style');
    style.innerHTML = `
      * {
        cursor: none !important;
      }
    `;
    style.id = 'custom-cursor-style';
    document.head.appendChild(style);

    const moveCursor = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseEnter = () => setIsVisible(true);
    const handleMouseLeave = () => setIsVisible(false);

    document.addEventListener('mousemove', moveCursor);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mousemove', moveCursor);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
      const existingStyle = document.getElementById('custom-cursor-style');
      if (existingStyle) existingStyle.remove();
    };
  }, [isVisible]);

  useEffect(() => {
    let frame: number;
    const animate = () => {
      // Calculate target position (snapped to grid cell center)
      const targetX = snapToGrid(mouseRef.current.x, GRID_SIZE, 'center');
      const targetY = snapToGrid(mouseRef.current.y, GRID_SIZE, 'center');

      setPosition(prev => {
        // Smooth movement to the snapped position
        const lerpFactor = 0.3;
        const newX = prev.x + (targetX - prev.x) * lerpFactor;
        const newY = prev.y + (targetY - prev.y) * lerpFactor;
        
        return { x: newX, y: newY };
      });

      frame = requestAnimationFrame(animate);
    };
    
    animate();
    return () => cancelAnimationFrame(frame);
  }, []);

  if (!isVisible) return null;

  return (
    <div
      ref={cursorRef}
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        width: '20px',
        height: '20px',
        backgroundColor: 'rgba(0, 0, 0, 0.8)', 
        border: '1px solid rgba(255, 255, 255, 0.5)',
        pointerEvents: 'none',
        zIndex: 9999,
        transform: `translate(${position.x}px, ${position.y}px) translate(-50%, -50%)`,
        transition: 'width 0.2s, height 0.2s, background-color 0.2s',
      }}
      className="custom-cursor flex items-center justify-center"
    >
      <div style={{ width: '2px', height: '2px', backgroundColor: 'white', borderRadius: '50%' }} />
    </div>
  );
};

export default CustomCursor;
