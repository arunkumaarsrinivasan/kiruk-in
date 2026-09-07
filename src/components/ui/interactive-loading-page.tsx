'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';

interface InteractiveLoadingPageProps {
  onComplete?: () => void;
  duration?: number;
  showProgress?: boolean;
}

const InteractiveLoadingPage: React.FC<InteractiveLoadingPageProps> = ({
  onComplete,
  duration = 2000,
  showProgress = true
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [progress, setProgress] = useState(0);

  // A returning visitor already chose a year, so the wait belongs to that year
  // rather than to a white page — the theme fills in a tick after mount, and
  // the draw loop reads it off a ref so a late palette still lands mid-fill.
  const { currentTheme } = useTheme();
  const ground = currentTheme.colors.background;
  const fill = currentTheme.colors.primary || currentTheme.colors.accent;
  const label = currentTheme.colors.text;
  const fillRef = useRef(fill);
  fillRef.current = fill;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI displays
    const dpr = globalThis.devicePixelRatio || 1;
    
    const updateSize = () => {
      const width = globalThis.innerWidth;
      const height = globalThis.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      // setTransform, not scale: a resize used to multiply onto the last one.
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    
    updateSize();
    globalThis.addEventListener('resize', updateSize, { passive: true });

    const gridSize = 20; // Match CSS variable --surface-pattern-size
    // Calculate logical columns and rows based on CSS pixels
    const cols = Math.ceil(globalThis.innerWidth / gridSize);
    const rows = Math.ceil(globalThis.innerHeight / gridSize);
    const totalCells = cols * rows;
    
    const cells = Array.from({ length: totalCells }, (_, i) => ({
      col: i % cols,
      row: Math.floor(i / cols)
    }));

    // Shuffle cells for random filling
    for (let i = cells.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cells[i], cells[j]] = [cells[j], cells[i]];
    }

    let animationFrameId: number;
    const startTime = Date.now();

    const draw = () => {
      const elapsed = Date.now() - startTime;
      const currentProgress = Math.min(elapsed / duration, 1);
      setProgress(Math.round(currentProgress * 100));
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // A tint, not a slab: filled solid, the last frame was a full-screen
      // flood of the era's primary. This lands on the era's own ground, which
      // is what the page underneath is about to be.
      ctx.globalAlpha = 0.16;
      ctx.fillStyle = fillRef.current;

      const countToDraw = Math.floor(currentProgress * totalCells);
      
      for (let i = 0; i < countToDraw; i++) {
        const cell = cells[i];
        ctx.fillRect(cell.col * gridSize, cell.row * gridSize, gridSize, gridSize);
      }

      if (currentProgress < 1) {
        animationFrameId = requestAnimationFrame(draw);
      } else {
        // Animation done
        setTimeout(() => {
            setIsComplete(true);
        }, 200);
      }
    };

    animationFrameId = requestAnimationFrame(draw);

    return () => {
      globalThis.removeEventListener('resize', updateSize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [duration]);

  // Handle exit
  useEffect(() => {
    if (isComplete) {
        const timer = setTimeout(() => {
            onComplete?.();
        }, 500); // Wait for exit animation
        return () => clearTimeout(timer);
    }
  }, [isComplete, onComplete]);

  if (isComplete) {
      return (
        <motion.div
            className="fixed inset-0 z-50"
            style={{ background: ground }}
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
        />
      );
  }

  return (
    <div className="fixed inset-0 z-50" style={{ background: ground }}>
      <canvas 
        ref={canvasRef}
        className="absolute inset-0 z-10"
      />
      {showProgress && (
         <div
            className="absolute bottom-8 right-8 z-20 font-mono text-[11px] uppercase tracking-[0.24em]"
            style={{ color: label, opacity: 0.55, fontFamily: currentTheme.fonts.accent }}
         >
             {currentTheme.id} · {progress}%
         </div>
      )}
    </div>
  );
};

export default InteractiveLoadingPage;
