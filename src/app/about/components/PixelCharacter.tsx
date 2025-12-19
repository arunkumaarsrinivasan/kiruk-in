"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export type CharacterStage = "baby" | "toddler" | "child" | "teen" | "adult" | "professional";

interface PixelCharacterProps {
  stage: CharacterStage;
  action: "idle" | "crawl" | "walk" | "run" | "jump";
  isJumping?: boolean;
  direction?: "left" | "right";
  className?: string;
}

// Pixel art character sprites using CSS grid
const characterSprites: Record<CharacterStage, { width: number; height: number; pixels: string[][] }> = {
  baby: {
    width: 8,
    height: 8,
    pixels: [
      ["", "", "#FFD93D", "#FFD93D", "#FFD93D", "#FFD93D", "", ""],
      ["", "#FFD93D", "#FFE5B4", "#FFE5B4", "#FFE5B4", "#FFE5B4", "#FFD93D", ""],
      ["", "#FFE5B4", "#000", "#FFE5B4", "#FFE5B4", "#000", "#FFE5B4", ""],
      ["", "#FFE5B4", "#FFE5B4", "#FFE5B4", "#FFE5B4", "#FFE5B4", "#FFE5B4", ""],
      ["", "", "#FFE5B4", "#FF6B6B", "#FF6B6B", "#FFE5B4", "", ""],
      ["", "", "#87CEEB", "#87CEEB", "#87CEEB", "#87CEEB", "", ""],
      ["", "", "#87CEEB", "", "", "#87CEEB", "", ""],
      ["", "", "#FFE5B4", "", "", "#FFE5B4", "", ""],
    ],
  },
  toddler: {
    width: 10,
    height: 12,
    pixels: [
      ["", "", "", "#3D2914", "#3D2914", "#3D2914", "#3D2914", "", "", ""],
      ["", "", "#3D2914", "#3D2914", "#3D2914", "#3D2914", "#3D2914", "#3D2914", "", ""],
      ["", "", "#FFE5B4", "#FFE5B4", "#FFE5B4", "#FFE5B4", "#FFE5B4", "#FFE5B4", "", ""],
      ["", "#FFE5B4", "#000", "#FFE5B4", "#FFE5B4", "#FFE5B4", "#000", "#FFE5B4", "#FFE5B4", ""],
      ["", "", "#FFE5B4", "#FFE5B4", "#FFE5B4", "#FFE5B4", "#FFE5B4", "#FFE5B4", "", ""],
      ["", "", "#FFE5B4", "#FFE5B4", "#FF6B6B", "#FF6B6B", "#FFE5B4", "#FFE5B4", "", ""],
      ["", "", "", "#FF9F43", "#FF9F43", "#FF9F43", "#FF9F43", "", "", ""],
      ["", "", "#FF9F43", "#FF9F43", "#FF9F43", "#FF9F43", "#FF9F43", "#FF9F43", "", ""],
      ["", "#FFE5B4", "#FF9F43", "#FF9F43", "#FF9F43", "#FF9F43", "#FF9F43", "#FF9F43", "#FFE5B4", ""],
      ["", "", "", "#4169E1", "#4169E1", "#4169E1", "#4169E1", "", "", ""],
      ["", "", "", "#4169E1", "", "", "#4169E1", "", "", ""],
      ["", "", "", "#8B4513", "", "", "#8B4513", "", "", ""],
    ],
  },
  child: {
    width: 12,
    height: 16,
    pixels: [
      ["", "", "", "", "#3D2914", "#3D2914", "#3D2914", "#3D2914", "", "", "", ""],
      ["", "", "", "#3D2914", "#3D2914", "#3D2914", "#3D2914", "#3D2914", "#3D2914", "", "", ""],
      ["", "", "#3D2914", "#3D2914", "#3D2914", "#3D2914", "#3D2914", "#3D2914", "#3D2914", "#3D2914", "", ""],
      ["", "", "#FFE5B4", "#FFE5B4", "#FFE5B4", "#FFE5B4", "#FFE5B4", "#FFE5B4", "#FFE5B4", "#FFE5B4", "", ""],
      ["", "#FFE5B4", "#000", "#FFE5B4", "#FFE5B4", "#FFE5B4", "#FFE5B4", "#000", "#FFE5B4", "#FFE5B4", "#FFE5B4", ""],
      ["", "", "#FFE5B4", "#FFE5B4", "#FFE5B4", "#FFE5B4", "#FFE5B4", "#FFE5B4", "#FFE5B4", "#FFE5B4", "", ""],
      ["", "", "#FFE5B4", "#FFE5B4", "#FFE5B4", "#FF6B6B", "#FF6B6B", "#FFE5B4", "#FFE5B4", "#FFE5B4", "", ""],
      ["", "", "", "#FFE5B4", "#FFE5B4", "#FFE5B4", "#FFE5B4", "#FFE5B4", "#FFE5B4", "", "", ""],
      ["", "", "", "", "#2ECC71", "#2ECC71", "#2ECC71", "#2ECC71", "", "", "", ""],
      ["", "", "", "#2ECC71", "#2ECC71", "#2ECC71", "#2ECC71", "#2ECC71", "#2ECC71", "", "", ""],
      ["", "", "#FFE5B4", "#2ECC71", "#2ECC71", "#2ECC71", "#2ECC71", "#2ECC71", "#2ECC71", "#FFE5B4", "", ""],
      ["", "", "", "#2ECC71", "#2ECC71", "#2ECC71", "#2ECC71", "#2ECC71", "#2ECC71", "", "", ""],
      ["", "", "", "", "#3498DB", "#3498DB", "#3498DB", "#3498DB", "", "", "", ""],
      ["", "", "", "", "#3498DB", "", "", "#3498DB", "", "", "", ""],
      ["", "", "", "", "#3498DB", "", "", "#3498DB", "", "", "", ""],
      ["", "", "", "", "#1A1A2E", "", "", "#1A1A2E", "", "", "", ""],
    ],
  },
  teen: {
    width: 14,
    height: 20,
    pixels: [
      ["", "", "", "", "", "#1A1A2E", "#1A1A2E", "#1A1A2E", "#1A1A2E", "", "", "", "", ""],
      ["", "", "", "", "#1A1A2E", "#1A1A2E", "#1A1A2E", "#1A1A2E", "#1A1A2E", "#1A1A2E", "", "", "", ""],
      ["", "", "", "#1A1A2E", "#1A1A2E", "#1A1A2E", "#1A1A2E", "#1A1A2E", "#1A1A2E", "#1A1A2E", "#1A1A2E", "", "", ""],
      ["", "", "", "#FFE5B4", "#FFE5B4", "#FFE5B4", "#FFE5B4", "#FFE5B4", "#FFE5B4", "#FFE5B4", "#FFE5B4", "", "", ""],
      ["", "", "#FFE5B4", "#000", "#FFE5B4", "#FFE5B4", "#FFE5B4", "#FFE5B4", "#000", "#FFE5B4", "#FFE5B4", "#FFE5B4", "", ""],
      ["", "", "#FFE5B4", "#FFE5B4", "#FFE5B4", "#FFE5B4", "#FFE5B4", "#FFE5B4", "#FFE5B4", "#FFE5B4", "#FFE5B4", "#FFE5B4", "", ""],
      ["", "", "", "#FFE5B4", "#FFE5B4", "#FFE5B4", "#FF6B6B", "#FF6B6B", "#FFE5B4", "#FFE5B4", "#FFE5B4", "", "", ""],
      ["", "", "", "#FFE5B4", "#FFE5B4", "#FFE5B4", "#FFE5B4", "#FFE5B4", "#FFE5B4", "#FFE5B4", "#FFE5B4", "", "", ""],
      ["", "", "", "", "", "#9B59B6", "#9B59B6", "#9B59B6", "#9B59B6", "", "", "", "", ""],
      ["", "", "", "", "#9B59B6", "#9B59B6", "#9B59B6", "#9B59B6", "#9B59B6", "#9B59B6", "", "", "", ""],
      ["", "", "#FFE5B4", "#9B59B6", "#9B59B6", "#9B59B6", "#9B59B6", "#9B59B6", "#9B59B6", "#9B59B6", "#9B59B6", "#FFE5B4", "", ""],
      ["", "", "", "#9B59B6", "#9B59B6", "#9B59B6", "#9B59B6", "#9B59B6", "#9B59B6", "#9B59B6", "#9B59B6", "", "", ""],
      ["", "", "", "#9B59B6", "#9B59B6", "#9B59B6", "#9B59B6", "#9B59B6", "#9B59B6", "#9B59B6", "#9B59B6", "", "", ""],
      ["", "", "", "", "#1A1A2E", "#1A1A2E", "#1A1A2E", "#1A1A2E", "#1A1A2E", "#1A1A2E", "", "", "", ""],
      ["", "", "", "", "#1A1A2E", "#1A1A2E", "", "", "#1A1A2E", "#1A1A2E", "", "", "", ""],
      ["", "", "", "", "#1A1A2E", "#1A1A2E", "", "", "#1A1A2E", "#1A1A2E", "", "", "", ""],
      ["", "", "", "", "#1A1A2E", "#1A1A2E", "", "", "#1A1A2E", "#1A1A2E", "", "", "", ""],
      ["", "", "", "", "#1A1A2E", "#1A1A2E", "", "", "#1A1A2E", "#1A1A2E", "", "", "", ""],
      ["", "", "", "", "#fff", "#fff", "", "", "#fff", "#fff", "", "", "", ""],
      ["", "", "", "", "#fff", "#fff", "", "", "#fff", "#fff", "", "", "", ""],
    ],
  },
  adult: {
    width: 16,
    height: 24,
    pixels: [
      ["", "", "", "", "", "", "#1A1A2E", "#1A1A2E", "#1A1A2E", "#1A1A2E", "", "", "", "", "", ""],
      ["", "", "", "", "", "#1A1A2E", "#1A1A2E", "#1A1A2E", "#1A1A2E", "#1A1A2E", "#1A1A2E", "", "", "", "", ""],
      ["", "", "", "", "#1A1A2E", "#1A1A2E", "#1A1A2E", "#1A1A2E", "#1A1A2E", "#1A1A2E", "#1A1A2E", "#1A1A2E", "", "", "", ""],
      ["", "", "", "", "#FFE5B4", "#FFE5B4", "#FFE5B4", "#FFE5B4", "#FFE5B4", "#FFE5B4", "#FFE5B4", "#FFE5B4", "", "", "", ""],
      ["", "", "", "#FFE5B4", "#000", "#FFE5B4", "#FFE5B4", "#FFE5B4", "#FFE5B4", "#FFE5B4", "#000", "#FFE5B4", "#FFE5B4", "", "", ""],
      ["", "", "", "#FFE5B4", "#FFE5B4", "#FFE5B4", "#FFE5B4", "#FFE5B4", "#FFE5B4", "#FFE5B4", "#FFE5B4", "#FFE5B4", "#FFE5B4", "", "", ""],
      ["", "", "", "", "#FFE5B4", "#FFE5B4", "#FFE5B4", "#FF6B6B", "#FF6B6B", "#FFE5B4", "#FFE5B4", "#FFE5B4", "", "", "", ""],
      ["", "", "", "", "#FFE5B4", "#FFE5B4", "#FFE5B4", "#FFE5B4", "#FFE5B4", "#FFE5B4", "#FFE5B4", "#FFE5B4", "", "", "", ""],
      ["", "", "", "", "", "", "#E74C3C", "#E74C3C", "#E74C3C", "#E74C3C", "", "", "", "", "", ""],
      ["", "", "", "", "", "#E74C3C", "#E74C3C", "#E74C3C", "#E74C3C", "#E74C3C", "#E74C3C", "", "", "", "", ""],
      ["", "", "", "#FFE5B4", "#E74C3C", "#E74C3C", "#E74C3C", "#E74C3C", "#E74C3C", "#E74C3C", "#E74C3C", "#E74C3C", "#FFE5B4", "", "", ""],
      ["", "", "", "", "#E74C3C", "#E74C3C", "#E74C3C", "#E74C3C", "#E74C3C", "#E74C3C", "#E74C3C", "#E74C3C", "", "", "", ""],
      ["", "", "", "", "#E74C3C", "#E74C3C", "#E74C3C", "#E74C3C", "#E74C3C", "#E74C3C", "#E74C3C", "#E74C3C", "", "", "", ""],
      ["", "", "", "", "#E74C3C", "#E74C3C", "#E74C3C", "#E74C3C", "#E74C3C", "#E74C3C", "#E74C3C", "#E74C3C", "", "", "", ""],
      ["", "", "", "", "", "#1A1A2E", "#1A1A2E", "#1A1A2E", "#1A1A2E", "#1A1A2E", "#1A1A2E", "", "", "", "", ""],
      ["", "", "", "", "", "#1A1A2E", "#1A1A2E", "#1A1A2E", "#1A1A2E", "#1A1A2E", "#1A1A2E", "", "", "", "", ""],
      ["", "", "", "", "", "#1A1A2E", "#1A1A2E", "", "", "#1A1A2E", "#1A1A2E", "", "", "", "", ""],
      ["", "", "", "", "", "#1A1A2E", "#1A1A2E", "", "", "#1A1A2E", "#1A1A2E", "", "", "", "", ""],
      ["", "", "", "", "", "#1A1A2E", "#1A1A2E", "", "", "#1A1A2E", "#1A1A2E", "", "", "", "", ""],
      ["", "", "", "", "", "#1A1A2E", "#1A1A2E", "", "", "#1A1A2E", "#1A1A2E", "", "", "", "", ""],
      ["", "", "", "", "", "#1A1A2E", "#1A1A2E", "", "", "#1A1A2E", "#1A1A2E", "", "", "", "", ""],
      ["", "", "", "", "", "#1A1A2E", "#1A1A2E", "", "", "#1A1A2E", "#1A1A2E", "", "", "", "", ""],
      ["", "", "", "", "", "#2C3E50", "#2C3E50", "", "", "#2C3E50", "#2C3E50", "", "", "", "", ""],
      ["", "", "", "", "", "#2C3E50", "#2C3E50", "", "", "#2C3E50", "#2C3E50", "", "", "", "", ""],
    ],
  },
  professional: {
    width: 16,
    height: 24,
    pixels: [
      ["", "", "", "", "", "", "#1A1A2E", "#1A1A2E", "#1A1A2E", "#1A1A2E", "", "", "", "", "", ""],
      ["", "", "", "", "", "#1A1A2E", "#1A1A2E", "#1A1A2E", "#1A1A2E", "#1A1A2E", "#1A1A2E", "", "", "", "", ""],
      ["", "", "", "", "#1A1A2E", "#1A1A2E", "#1A1A2E", "#1A1A2E", "#1A1A2E", "#1A1A2E", "#1A1A2E", "#1A1A2E", "", "", "", ""],
      ["", "", "", "", "#FFE5B4", "#FFE5B4", "#FFE5B4", "#FFE5B4", "#FFE5B4", "#FFE5B4", "#FFE5B4", "#FFE5B4", "", "", "", ""],
      ["", "", "", "#FFE5B4", "#000", "#FFE5B4", "#FFE5B4", "#FFE5B4", "#FFE5B4", "#FFE5B4", "#000", "#FFE5B4", "#FFE5B4", "", "", ""],
      ["", "", "", "#FFE5B4", "#FFE5B4", "#FFE5B4", "#FFE5B4", "#FFE5B4", "#FFE5B4", "#FFE5B4", "#FFE5B4", "#FFE5B4", "#FFE5B4", "", "", ""],
      ["", "", "", "", "#FFE5B4", "#FFE5B4", "#FFE5B4", "#FF6B6B", "#FF6B6B", "#FFE5B4", "#FFE5B4", "#FFE5B4", "", "", "", ""],
      ["", "", "", "", "#FFE5B4", "#FFE5B4", "#FFE5B4", "#FFE5B4", "#FFE5B4", "#FFE5B4", "#FFE5B4", "#FFE5B4", "", "", "", ""],
      ["", "", "", "", "", "", "#2C3E50", "#2C3E50", "#2C3E50", "#2C3E50", "", "", "", "", "", ""],
      ["", "", "", "", "", "#2C3E50", "#2C3E50", "#fff", "#fff", "#2C3E50", "#2C3E50", "", "", "", "", ""],
      ["", "", "", "#FFE5B4", "#2C3E50", "#2C3E50", "#2C3E50", "#E74C3C", "#E74C3C", "#2C3E50", "#2C3E50", "#2C3E50", "#FFE5B4", "", "", ""],
      ["", "", "", "", "#2C3E50", "#2C3E50", "#2C3E50", "#2C3E50", "#2C3E50", "#2C3E50", "#2C3E50", "#2C3E50", "", "", "", ""],
      ["", "", "", "", "#2C3E50", "#2C3E50", "#2C3E50", "#2C3E50", "#2C3E50", "#2C3E50", "#2C3E50", "#2C3E50", "", "", "", ""],
      ["", "", "", "", "#2C3E50", "#2C3E50", "#2C3E50", "#2C3E50", "#2C3E50", "#2C3E50", "#2C3E50", "#2C3E50", "", "", "", ""],
      ["", "", "", "", "", "#1A1A2E", "#1A1A2E", "#1A1A2E", "#1A1A2E", "#1A1A2E", "#1A1A2E", "", "", "", "", ""],
      ["", "", "", "", "", "#1A1A2E", "#1A1A2E", "#1A1A2E", "#1A1A2E", "#1A1A2E", "#1A1A2E", "", "", "", "", ""],
      ["", "", "", "", "", "#1A1A2E", "#1A1A2E", "", "", "#1A1A2E", "#1A1A2E", "", "", "", "", ""],
      ["", "", "", "", "", "#1A1A2E", "#1A1A2E", "", "", "#1A1A2E", "#1A1A2E", "", "", "", "", ""],
      ["", "", "", "", "", "#1A1A2E", "#1A1A2E", "", "", "#1A1A2E", "#1A1A2E", "", "", "", "", ""],
      ["", "", "", "", "", "#1A1A2E", "#1A1A2E", "", "", "#1A1A2E", "#1A1A2E", "", "", "", "", ""],
      ["", "", "", "", "", "#1A1A2E", "#1A1A2E", "", "", "#1A1A2E", "#1A1A2E", "", "", "", "", ""],
      ["", "", "", "", "", "#1A1A2E", "#1A1A2E", "", "", "#1A1A2E", "#1A1A2E", "", "", "", "", ""],
      ["", "", "", "", "", "#1A1A2E", "#1A1A2E", "", "", "#1A1A2E", "#1A1A2E", "", "", "", "", ""],
      ["", "", "", "", "", "#1A1A2E", "#1A1A2E", "", "", "#1A1A2E", "#1A1A2E", "", "", "", "", ""],
    ],
  },
};

export function PixelCharacter({ stage, action, isJumping, direction = "right", className }: PixelCharacterProps) {
  const [frame, setFrame] = useState(0);
  const sprite = characterSprites[stage];
  const pixelSize = stage === "baby" ? 4 : stage === "toddler" ? 3 : stage === "child" ? 3 : stage === "teen" ? 2.5 : 2.5;
  
  // Animation for walking/running
  useEffect(() => {
    if (action === "idle") return;
    
    const interval = setInterval(() => {
      setFrame((prev) => (prev + 1) % 2);
    }, action === "run" ? 100 : action === "crawl" ? 300 : 200);
    
    return () => clearInterval(interval);
  }, [action]);

  return (
    <motion.div
      className={`relative ${className}`}
      style={{
        width: sprite.width * pixelSize,
        height: sprite.height * pixelSize,
        transform: direction === "left" ? "scaleX(-1)" : "scaleX(1)",
        imageRendering: "pixelated",
      }}
      animate={{
        y: isJumping ? -40 : 0,
        rotate: action === "crawl" ? [0, -5, 0, 5, 0] : 0,
        scaleY: action === "jump" && !isJumping ? 0.8 : 1,
      }}
      transition={{
        y: { type: "spring", stiffness: 300, damping: 15 },
        rotate: { duration: 0.5, repeat: Infinity },
      }}
    >
      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${sprite.width}, ${pixelSize}px)`,
          gridTemplateRows: `repeat(${sprite.height}, ${pixelSize}px)`,
        }}
      >
        {sprite.pixels.flat().map((color, idx) => (
          <div
            key={idx}
            style={{
              width: pixelSize,
              height: pixelSize,
              backgroundColor: color || "transparent",
              // Slight animation offset for legs when walking
              transform: 
                action !== "idle" && 
                idx >= sprite.pixels.flat().length - sprite.width * 4 &&
                frame === 1
                  ? "translateY(-1px)"
                  : "none",
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}

export function getStageFromAge(age: number): CharacterStage {
  if (age <= 2) return "baby";
  if (age <= 7) return "toddler";
  if (age <= 13) return "child";
  if (age <= 18) return "teen";
  if (age <= 21) return "adult";
  return "professional";
}

export function getActionFromAge(age: number): "crawl" | "walk" | "run" {
  if (age <= 2) return "crawl";
  if (age <= 13) return "walk";
  return "run";
}
