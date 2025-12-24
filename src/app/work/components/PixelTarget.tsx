"use client";

import { motion } from "framer-motion";
import { WorkTarget } from "./useShootingGame";

interface PixelTargetProps {
  target: WorkTarget;
  pixelSize?: number;
}

export function PixelTarget({ target, pixelSize = 6 }: PixelTargetProps) {
  // Bigger, more pixelated target - 32x32 pixel grid for better visibility
  const gridSize = 32; // Larger grid for bigger target
  const pixels: string[][] = [];
  
  // Initialize grid
  for (let y = 0; y < gridSize; y++) {
    pixels[y] = [];
    for (let x = 0; x < gridSize; x++) {
      pixels[y][x] = "";
    }
  }
  
  const center = gridSize / 2;
  
  // Color based on target type and hit progress
  const getColor = () => {
    if (target.hit) return "var(--text-muted)";
    if (target.type === 'boss') return "#FF0000"; // Red for boss
    if (target.type === 'bonus') return "#00FF00"; // Green for bonus
    return "var(--text-main)"; // Normal
  };
  
  const borderColor = getColor();
  const fillColor = target.hit ? "var(--bg-card)" : "var(--bg-main)";
  const accentColor = target.type === 'boss' ? "#FF4444" : target.type === 'bonus' ? "#44FF44" : "var(--accent-color)";
  
  // Draw thicker concentric square rings (pixel art style) - more visible
  const rings = target.type === 'boss' ? 6 : 5;
  for (let ring = 0; ring < rings; ring++) {
    const ringSize = gridSize - ring * 5;
    const start = ring * 2.5;
    const end = gridSize - ring * 2.5;
    const color = ring % 2 === 0 ? borderColor : fillColor;
    
    // Draw square ring with thicker borders
    for (let y = Math.floor(start); y < Math.ceil(end); y++) {
      for (let x = Math.floor(start); x < Math.ceil(end); x++) {
        // Draw border pixels (thicker borders)
        const isBorder = y <= Math.floor(start) + 1 || y >= Math.ceil(end) - 2 || 
                        x <= Math.floor(start) + 1 || x >= Math.ceil(end) - 2;
        if (isBorder) {
          pixels[y][x] = color;
        }
      }
    }
  }
  
  // Draw center crosshair (pixelated, thicker)
  const crosshairThickness = 2;
  for (let i = 0; i < gridSize; i++) {
    for (let t = 0; t < crosshairThickness; t++) {
      if (Math.floor(center) + t < gridSize) {
        pixels[Math.floor(center) + t][i] = pixels[Math.floor(center) + t][i] || borderColor;
        pixels[i][Math.floor(center) + t] = pixels[i][Math.floor(center) + t] || borderColor;
      }
    }
  }
  
  // Draw center dot (bigger)
  const dotSize = 3;
  for (let dy = -Math.floor(dotSize/2); dy <= Math.floor(dotSize/2); dy++) {
    for (let dx = -Math.floor(dotSize/2); dx <= Math.floor(dotSize/2); dx++) {
      const y = Math.floor(center) + dy;
      const x = Math.floor(center) + dx;
      if (y >= 0 && y < gridSize && x >= 0 && x < gridSize) {
        pixels[y][x] = accentColor;
      }
    }
  }
  
  
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        left: `${target.x}%`,
        top: `${target.y}%`,
        transform: "translate(-50%, -50%)",
        width: gridSize * pixelSize,
        height: gridSize * pixelSize,
        imageRendering: "pixelated" as any,
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ 
        scale: target.hit ? 1.5 : 1,
        opacity: target.hit ? 0 : 1,
        rotate: target.hit ? 180 : 0,
      }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Company name label - pixel art style */}
      {!target.hit && (
        <div
          className="absolute -top-10 left-1/2 transform -translate-x-1/2 whitespace-nowrap font-mono text-xs border px-1.5 py-0.5"
          style={{ 
            color: "var(--text-main)",
            backgroundColor: "var(--bg-card)",
            borderColor: "var(--border-color)",
          }}
        >
          {target.workExperience.company}
          {target.type === 'boss' && ' ⭐'}
          {target.type === 'bonus' && ' ✨'}
        </div>
      )}
      
      {/* Hit progress indicator */}
      {!target.hit && target.hitCount > 0 && (
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-16">
          <div className="h-1 border" style={{ borderColor: "var(--border-color)", backgroundColor: "var(--bg-card)" }}>
            <motion.div
              className="h-full"
              style={{ backgroundColor: "var(--text-main)" }}
              initial={{ width: 0 }}
              animate={{ width: `${(target.hitCount / target.maxHits) * 100}%` }}
            />
          </div>
          <div className="font-mono text-[9px] text-center mt-0.5" style={{ color: "var(--text-muted)" }}>
            {target.hitCount}/{target.maxHits}
          </div>
        </div>
      )}
      
      {/* Pixel grid - matching design system with stronger borders */}
      <div
        className="grid border-4"
        style={{
          gridTemplateColumns: `repeat(${gridSize}, ${pixelSize}px)`,
          gridTemplateRows: `repeat(${gridSize}, ${pixelSize}px)`,
          imageRendering: "pixelated" as any,
          borderColor: "var(--border-color)",
          backgroundColor: "var(--bg-card)",
          boxShadow: "0 0 0 2px var(--bg-main), 4px 4px 0 var(--border-color)",
        }}
      >
        {pixels.flat().map((color, idx) => (
          <div
            key={idx}
            style={{
              width: pixelSize,
              height: pixelSize,
              backgroundColor: color || "transparent",
            }}
          />
        ))}
      </div>
      
      {/* Hit effect */}
      {target.hit && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 2, opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div
            className="font-mono text-2xl font-bold"
            style={{ color: "var(--accent-color)" }}
          >
            +{target.points}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

