"use client";

import { motion, useMotionValue, useSpring, useMotionTemplate } from "framer-motion";
import { useEffect, useState } from "react";

// Account for fixed container with pt-16 (64px padding-top)
const TOP_PADDING = 64; // pt-16 = 64px

interface PixelCursorProps {
  x: number; // Percentage
  y: number; // Percentage
  isCharging: boolean;
  power: number;
}

export function PixelCursor({ x, y, isCharging, power }: PixelCursorProps) {
  const [viewportY, setViewportY] = useState(0);
  
  useEffect(() => {
    const updateViewportY = () => {
      // Convert container y percentage to viewport y percentage
      // y is percentage of container height, convert to viewport percentage
      const containerHeight = window.innerHeight - TOP_PADDING;
      const calculatedY = containerHeight > 0 
        ? ((y / 100) * containerHeight + TOP_PADDING) / window.innerHeight * 100
        : y;
      setViewportY(calculatedY);
    };
    updateViewportY();
    window.addEventListener('resize', updateViewportY);
    return () => window.removeEventListener('resize', updateViewportY);
  }, [y]);
  
  const cursorX = useSpring(useMotionValue(x), { stiffness: 500, damping: 30 });
  const cursorY = useSpring(useMotionValue(viewportY), { stiffness: 500, damping: 30 });
  
  useEffect(() => {
    cursorX.set(x);
    cursorY.set(viewportY);
  }, [x, viewportY, cursorX, cursorY]);
  
  // Create reactive style strings
  const left = useMotionTemplate`${cursorX}%`;
  const top = useMotionTemplate`${cursorY}%`;
  
  const pixelSize = 4;
  
  // Pixelated crosshair pattern
  const crosshairPattern = [
    [0, 1, 1, 0],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [0, 1, 1, 0],
  ];
  
  // Charging pattern (expanded)
  const chargingPattern = isCharging ? [
    [1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 0, 1],
    [1, 0, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1],
  ] : crosshairPattern;
  
  const pattern = isCharging ? chargingPattern : crosshairPattern;
  const gridSize = pattern.length;
  const size = gridSize * pixelSize;
  
  return (
    <motion.div
      className="fixed pointer-events-none z-[60]"
      style={{
        left,
        top,
        transform: "translate(-50%, -50%)",
        cursor: "none",
      }}
      animate={{
        scale: isCharging ? 1 + power * 0.3 : 1,
      }}
    >
      {/* Pixelated cursor */}
      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${gridSize}, ${pixelSize}px)`,
          gridTemplateRows: `repeat(${gridSize}, ${pixelSize}px)`,
          imageRendering: "pixelated" as any,
        }}
      >
        {pattern.flat().map((pixel, idx) => (
          <div
            key={idx}
            style={{
              width: pixelSize,
              height: pixelSize,
              backgroundColor: pixel === 1 
                ? (isCharging ? "var(--accent-color)" : "var(--text-main)")
                : "transparent",
              border: pixel === 1 && !isCharging ? "1px solid var(--bg-main)" : "none",
            }}
          />
        ))}
      </div>
      
      {/* Power indicator ring when charging */}
      {isCharging && (
        <motion.div
          className="absolute"
          style={{
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            width: size + power * 20,
            height: size + power * 20,
            border: "2px solid var(--accent-color)",
            imageRendering: "pixelated" as any,
          }}
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
          }}
        />
      )}
    </motion.div>
  );
}
