'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { GRID_SIZE } from '@/lib/utils';

// Teenage Engineering inspired timing
const TE_TIMING = {
  instant: 0.08,
  quick: 0.15,
};

// Minimal Pixel Eye Component - Pixelated oval with moving highlight
const PixelEye = ({ size = 100 }: { size?: number }) => {
  const [pupilPos, setPupilPos] = useState({ x: 0, y: 0 });
  const eyeRef = useRef<HTMLDivElement>(null);
  
  // Pixel grid settings
  const cols = 13;
  const rows = 9;
  const pixelSize = Math.floor(size / cols);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!eyeRef.current) return;
      
      const rect = eyeRef.current.getBoundingClientRect();
      const eyeCenterX = rect.left + rect.width / 2;
      const eyeCenterY = rect.top + rect.height / 2;
      
      const deltaX = e.clientX - eyeCenterX;
      const deltaY = e.clientY - eyeCenterY;
      const angle = Math.atan2(deltaY, deltaX);
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      
      // Limit movement within the eye
      const maxMove = pixelSize * 2.5;
      const moveAmount = Math.min(distance / 8, maxMove);
      
      setPupilPos({
        x: Math.cos(angle) * moveAmount,
        y: Math.sin(angle) * moveAmount,
      });
    };

    globalThis.addEventListener('mousemove', handleMouseMove);
    return () => globalThis.removeEventListener('mousemove', handleMouseMove);
  }, [pixelSize]);

  // Pixelated oval pattern (13x9 grid) - 1 = black pixel, 0 = transparent
  const eyePattern = [
    [0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0],
    [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0],
  ];

  return (
    <div 
      ref={eyeRef}
      className="relative"
      style={{ 
        width: cols * pixelSize, 
        height: rows * pixelSize,
      }}
    >
      {/* Pixelated black oval */}
      <div 
        className="absolute inset-0 grid"
        style={{ 
          gridTemplateColumns: `repeat(${cols}, ${pixelSize}px)`,
          gridTemplateRows: `repeat(${rows}, ${pixelSize}px)`,
        }}
      >
        {eyePattern.flat().map((pixel, i) => (
          <div 
            key={i} 
            style={{ 
              backgroundColor: pixel === 1 ? 'var(--text-main)' : 'transparent',
              width: pixelSize,
              height: pixelSize,
            }} 
          />
        ))}
      </div>
      
      {/* Moving eyeball - 3 big pixels in L shape */}
      <motion.div
        className="absolute"
        style={{
          left: '50%',
          top: '50%',
          marginLeft: -pixelSize,
          marginTop: -pixelSize,
        }}
        animate={{ x: pupilPos.x, y: pupilPos.y }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(2, ${pixelSize}px)`,
            gridTemplateRows: `repeat(2, ${pixelSize}px)`,
          }}
        >
          {/* Top-left pixel */}
          <div style={{ width: pixelSize, height: pixelSize, backgroundColor: 'var(--bg-main)' }} />
          {/* Top-right pixel */}
          <div style={{ width: pixelSize, height: pixelSize, backgroundColor: 'var(--bg-main)' }} />
          {/* Bottom-left pixel */}
          <div style={{ width: pixelSize, height: pixelSize, backgroundColor: 'var(--bg-main)' }} />
          {/* Bottom-right empty */}
          <div />
        </div>
      </motion.div>
    </div>
  );
};

const HeroSection = () => {
  const router = useRouter();

  const handleRedirectToAbout = () => {
    router.push('/about');
  };

  // Grid-aligned dimensions
  const HEADER_HEIGHT = GRID_SIZE * 3; // 60px to match other widgets

  return (
    <section className="relative h-full w-full notebook-bg overflow-hidden">
      {/* Hero section is now integrated into the top header bar */}
      {/* The header bar is rendered in LayoutClientShell */}
      
      {/* Hidden h1 for SEO */}
      <h1 className="sr-only">KIRUK - Arun kumaar Sreenivasan Portfolio</h1>
    </section>
  );
};

export default HeroSection;

// Export the header widget for use in the top bar
export const HeroHeaderWidget = () => {
  const router = useRouter();
  const [pupilPos, setPupilPos] = useState({ x: 0, y: 0 });
  const eyeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!eyeRef.current) return;
      const rect = eyeRef.current.getBoundingClientRect();
      const eyeCenterX = rect.left + rect.width / 2;
      const eyeCenterY = rect.top + rect.height / 2;
      const deltaX = e.clientX - eyeCenterX;
      const deltaY = e.clientY - eyeCenterY;
      const angle = Math.atan2(deltaY, deltaX);
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const maxMove = 6;
      const moveAmount = Math.min(distance / 10, maxMove);
      setPupilPos({
        x: Math.cos(angle) * moveAmount,
        y: Math.sin(angle) * moveAmount,
      });
    };
    globalThis.addEventListener('mousemove', handleMouseMove);
    return () => globalThis.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleRedirectToAbout = () => {
    router.push('/about');
  };

  const WIDGET_HEIGHT = GRID_SIZE * 3;
  const pixelSize = 4;

  return (
    <div className="flex items-center h-full">
      {/* Mini Pixel Eye */}
      <motion.div
        ref={eyeRef}
        className="relative flex items-center justify-center bg-[var(--bg-card)] border border-[var(--border-color)] cursor-pointer"
        style={{ width: WIDGET_HEIGHT, height: WIDGET_HEIGHT }}
        onClick={handleRedirectToAbout}
        whileHover={{ scale: 0.95 }}
        whileTap={{ scale: 0.9 }}
      >
        {/* Simple pixel eye */}
        <div className="relative" style={{ width: 36, height: 24 }}>
          <div 
            className="absolute inset-0 bg-[var(--text-main)]" 
            style={{ borderRadius: '50%' }}
          />
          <motion.div
            className="absolute bg-[var(--bg-main)]"
            style={{
              width: pixelSize * 2,
              height: pixelSize * 2,
              left: '50%',
              top: '50%',
              marginLeft: -pixelSize,
              marginTop: -pixelSize,
            }}
            animate={{ x: pupilPos.x, y: pupilPos.y }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          />
        </div>
      </motion.div>

      {/* Name widget */}
      <motion.div
        className="flex flex-col justify-center bg-[var(--bg-card)] border border-[var(--border-color)] px-3 cursor-pointer hover:bg-[var(--text-main)] hover:text-[var(--bg-main)] transition-colors"
        style={{ width: GRID_SIZE * 6, height: WIDGET_HEIGHT }}
        onClick={handleRedirectToAbout}
        whileHover={{ scale: 0.98 }}
        whileTap={{ scale: 0.95 }}
      >
        <span className="text-[10px] font-mono font-bold uppercase tracking-wide">
          Arun kumaar
        </span>
        <span className="text-[7px] font-mono opacity-60 uppercase tracking-wider">
          Creative Tech
        </span>
      </motion.div>
    </div>
  );
};
