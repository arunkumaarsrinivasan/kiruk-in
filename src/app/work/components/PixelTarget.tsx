"use client";

import { motion } from "framer-motion";
import { WorkTarget } from "./useShootingGame";

interface PixelTargetProps {
  target: WorkTarget;
  pixelSize?: number;
}

export function PixelTarget({ target, pixelSize = 4 }: PixelTargetProps) {
  // Pixel art target design matching grid system - square-based target
  const gridSize = 20; // 20x20 pixel grid
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
  
  // Draw concentric square rings (pixel art style)
  const rings = target.type === 'boss' ? 5 : 4;
  for (let ring = 0; ring < rings; ring++) {
    const ringSize = gridSize - ring * 4;
    const start = ring * 2;
    const end = gridSize - ring * 2;
    const color = ring % 2 === 0 ? borderColor : fillColor;
    
    // Draw square ring
    for (let y = start; y < end; y++) {
      for (let x = start; x < end; x++) {
        // Only draw border pixels
        if (y === start || y === end - 1 || x === start || x === end - 1) {
          pixels[y][x] = color;
        }
      }
    }
  }
  
  // Draw center crosshair (pixelated)
  for (let i = 0; i < gridSize; i++) {
    pixels[Math.floor(center)][i] = pixels[Math.floor(center)][i] || borderColor;
    pixels[i][Math.floor(center)] = pixels[i][Math.floor(center)] || borderColor;
  }
  
  // Draw center dot
  pixels[center][center] = borderColor;
  if (center > 0) pixels[center - 1][center] = borderColor;
  if (center < gridSize - 1) pixels[center + 1][center] = borderColor;
  if (center > 0) pixels[center][center - 1] = borderColor;
  if (center < gridSize - 1) pixels[center][center + 1] = borderColor;
  
  
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        left: `${target.x}%`,
        top: `${target.y}%`,
        transform: "translate(-50%, -50%)",
        width: gridSize * pixelSize,
        height: gridSize * pixelSize,
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
      
      {/* Pixel grid - matching design system */}
      <div
        className="grid border-2"
        style={{
          gridTemplateColumns: `repeat(${gridSize}, ${pixelSize}px)`,
          gridTemplateRows: `repeat(${gridSize}, ${pixelSize}px)`,
          imageRendering: "pixelated",
          borderColor: "var(--border-color)",
          backgroundColor: "var(--bg-card)",
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

