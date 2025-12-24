'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

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
      ctx.scale(dpr, dpr);
    };
    
    updateSize();
    globalThis.addEventListener('resize', updateSize);

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
      ctx.fillStyle = '#1a1a1a'; // Dark color for the pixels

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
            className="fixed inset-0 z-50 bg-[#1a1a1a]"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
        />
      );
  }

  return (
    <div className="fixed inset-0 z-50 bg-white">
      <div className="absolute inset-0 notebook-bg" />
      <canvas 
        ref={canvasRef}
        className="absolute inset-0 z-10"
      />
      {showProgress && (
         <div className="absolute bottom-8 right-8 z-20 font-mono text-xs text-gray-500 mix-blend-difference">
             {progress}%
         </div>
      )}
    </div>
  );
};

export default InteractiveLoadingPage;
