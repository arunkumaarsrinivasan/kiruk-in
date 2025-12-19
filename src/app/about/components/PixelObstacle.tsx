"use client";

import { motion } from "framer-motion";

export type ObstacleType = "rock" | "bush" | "box" | "cone" | "computer" | "coffee" | "book" | "cloud";

interface PixelObstacleProps {
  type: ObstacleType;
  className?: string;
  size?: "small" | "medium" | "large";
}

const obstacleSprites: Record<ObstacleType, { width: number; height: number; pixels: string[][] }> = {
  rock: {
    width: 8,
    height: 6,
    pixels: [
      ["", "", "#666", "#666", "#666", "#666", "", ""],
      ["", "#555", "#777", "#888", "#888", "#777", "#555", ""],
      ["#555", "#666", "#888", "#999", "#999", "#888", "#666", "#555"],
      ["#444", "#555", "#777", "#888", "#888", "#777", "#555", "#444"],
      ["#333", "#444", "#555", "#666", "#666", "#555", "#444", "#333"],
      ["", "#333", "#444", "#444", "#444", "#444", "#333", ""],
    ],
  },
  bush: {
    width: 10,
    height: 8,
    pixels: [
      ["", "", "", "#228B22", "#228B22", "#228B22", "#228B22", "", "", ""],
      ["", "", "#228B22", "#32CD32", "#32CD32", "#32CD32", "#32CD32", "#228B22", "", ""],
      ["", "#228B22", "#32CD32", "#90EE90", "#90EE90", "#90EE90", "#90CD32", "#32CD32", "#228B22", ""],
      ["#228B22", "#32CD32", "#90EE90", "#90EE90", "#fff", "#90EE90", "#90EE90", "#32CD32", "#228B22", ""],
      ["#228B22", "#32CD32", "#32CD32", "#90EE90", "#90EE90", "#90EE90", "#32CD32", "#32CD32", "#228B22", ""],
      ["", "#228B22", "#32CD32", "#32CD32", "#32CD32", "#32CD32", "#32CD32", "#228B22", "", ""],
      ["", "", "#228B22", "#228B22", "#228B22", "#228B22", "#228B22", "", "", ""],
      ["", "", "", "#8B4513", "#8B4513", "#8B4513", "#8B4513", "", "", ""],
    ],
  },
  box: {
    width: 8,
    height: 8,
    pixels: [
      ["#CD853F", "#CD853F", "#CD853F", "#CD853F", "#CD853F", "#CD853F", "#CD853F", "#CD853F"],
      ["#CD853F", "#DEB887", "#DEB887", "#000", "#000", "#DEB887", "#DEB887", "#8B4513"],
      ["#CD853F", "#DEB887", "#DEB887", "#DEB887", "#DEB887", "#DEB887", "#DEB887", "#8B4513"],
      ["#CD853F", "#DEB887", "#000", "#000", "#000", "#000", "#DEB887", "#8B4513"],
      ["#CD853F", "#DEB887", "#DEB887", "#DEB887", "#DEB887", "#DEB887", "#DEB887", "#8B4513"],
      ["#CD853F", "#DEB887", "#DEB887", "#000", "#000", "#DEB887", "#DEB887", "#8B4513"],
      ["#CD853F", "#DEB887", "#DEB887", "#DEB887", "#DEB887", "#DEB887", "#DEB887", "#8B4513"],
      ["#8B4513", "#8B4513", "#8B4513", "#8B4513", "#8B4513", "#8B4513", "#8B4513", "#8B4513"],
    ],
  },
  cone: {
    width: 8,
    height: 10,
    pixels: [
      ["", "", "", "#000", "#000", "", "", ""],
      ["", "", "", "#FF6600", "#FF6600", "", "", ""],
      ["", "", "#FF6600", "#FF8C00", "#FF8C00", "#FF6600", "", ""],
      ["", "", "#FF6600", "#fff", "#fff", "#FF6600", "", ""],
      ["", "#FF6600", "#FF8C00", "#FF8C00", "#FF8C00", "#FF8C00", "#FF6600", ""],
      ["", "#FF6600", "#fff", "#fff", "#fff", "#fff", "#FF6600", ""],
      ["#FF6600", "#FF8C00", "#FF8C00", "#FF8C00", "#FF8C00", "#FF8C00", "#FF8C00", "#FF6600"],
      ["#FF6600", "#fff", "#fff", "#fff", "#fff", "#fff", "#fff", "#FF6600"],
      ["#333", "#333", "#333", "#333", "#333", "#333", "#333", "#333"],
      ["#444", "#444", "#444", "#444", "#444", "#444", "#444", "#444"],
    ],
  },
  computer: {
    width: 12,
    height: 10,
    pixels: [
      ["#333", "#333", "#333", "#333", "#333", "#333", "#333", "#333", "#333", "#333", "#333", "#333"],
      ["#333", "#1a1a2e", "#1a1a2e", "#1a1a2e", "#1a1a2e", "#1a1a2e", "#1a1a2e", "#1a1a2e", "#1a1a2e", "#1a1a2e", "#1a1a2e", "#333"],
      ["#333", "#1a1a2e", "#00ff00", "#00ff00", "#1a1a2e", "#00ff00", "#1a1a2e", "#00ff00", "#00ff00", "#1a1a2e", "#1a1a2e", "#333"],
      ["#333", "#1a1a2e", "#00ff00", "#1a1a2e", "#1a1a2e", "#00ff00", "#1a1a2e", "#00ff00", "#1a1a2e", "#1a1a2e", "#1a1a2e", "#333"],
      ["#333", "#1a1a2e", "#00ff00", "#00ff00", "#1a1a2e", "#00ff00", "#1a1a2e", "#00ff00", "#00ff00", "#1a1a2e", "#1a1a2e", "#333"],
      ["#333", "#1a1a2e", "#1a1a2e", "#1a1a2e", "#1a1a2e", "#1a1a2e", "#1a1a2e", "#1a1a2e", "#1a1a2e", "#1a1a2e", "#1a1a2e", "#333"],
      ["#333", "#333", "#333", "#333", "#333", "#333", "#333", "#333", "#333", "#333", "#333", "#333"],
      ["", "", "", "", "#555", "#555", "#555", "#555", "", "", "", ""],
      ["", "", "", "#666", "#666", "#666", "#666", "#666", "#666", "", "", ""],
      ["", "", "#777", "#777", "#777", "#777", "#777", "#777", "#777", "#777", "", ""],
    ],
  },
  coffee: {
    width: 8,
    height: 10,
    pixels: [
      ["", "", "#aaa", "#aaa", "#aaa", "", "", ""],
      ["", "", "", "#aaa", "", "", "", ""],
      ["", "#fff", "#fff", "#fff", "#fff", "#fff", "#fff", ""],
      ["", "#fff", "#8B4513", "#8B4513", "#8B4513", "#8B4513", "#fff", "#DEB887"],
      ["", "#fff", "#A0522D", "#A0522D", "#A0522D", "#A0522D", "#fff", "#DEB887"],
      ["", "#fff", "#8B4513", "#8B4513", "#8B4513", "#8B4513", "#fff", "#DEB887"],
      ["", "#fff", "#A0522D", "#A0522D", "#A0522D", "#A0522D", "#fff", "#DEB887"],
      ["", "#fff", "#8B4513", "#8B4513", "#8B4513", "#8B4513", "#fff", ""],
      ["", "#fff", "#fff", "#fff", "#fff", "#fff", "#fff", ""],
      ["", "", "#eee", "#eee", "#eee", "#eee", "", ""],
    ],
  },
  book: {
    width: 10,
    height: 8,
    pixels: [
      ["", "#8B0000", "#8B0000", "#8B0000", "#8B0000", "#8B0000", "#8B0000", "#8B0000", "#8B0000", ""],
      ["#8B0000", "#CD5C5C", "#fff", "#fff", "#fff", "#fff", "#fff", "#fff", "#CD5C5C", "#8B0000"],
      ["#8B0000", "#CD5C5C", "#fff", "#333", "#333", "#333", "#333", "#fff", "#CD5C5C", "#8B0000"],
      ["#8B0000", "#CD5C5C", "#fff", "#fff", "#fff", "#fff", "#fff", "#fff", "#CD5C5C", "#8B0000"],
      ["#8B0000", "#CD5C5C", "#fff", "#333", "#333", "#333", "#fff", "#fff", "#CD5C5C", "#8B0000"],
      ["#8B0000", "#CD5C5C", "#fff", "#fff", "#fff", "#fff", "#fff", "#fff", "#CD5C5C", "#8B0000"],
      ["#8B0000", "#CD5C5C", "#CD5C5C", "#CD5C5C", "#CD5C5C", "#CD5C5C", "#CD5C5C", "#CD5C5C", "#CD5C5C", "#8B0000"],
      ["", "#8B0000", "#8B0000", "#8B0000", "#8B0000", "#8B0000", "#8B0000", "#8B0000", "#8B0000", ""],
    ],
  },
  cloud: {
    width: 12,
    height: 6,
    pixels: [
      ["", "", "", "#fff", "#fff", "#fff", "#fff", "", "", "", "", ""],
      ["", "", "#fff", "#fff", "#fff", "#fff", "#fff", "#fff", "#fff", "", "", ""],
      ["", "#fff", "#fff", "#fff", "#fff", "#fff", "#fff", "#fff", "#fff", "#fff", "", ""],
      ["#fff", "#fff", "#fff", "#fff", "#fff", "#fff", "#fff", "#fff", "#fff", "#fff", "#fff", ""],
      ["#fff", "#fff", "#fff", "#fff", "#fff", "#fff", "#fff", "#fff", "#fff", "#fff", "#fff", "#fff"],
      ["", "#eee", "#eee", "#eee", "#eee", "#eee", "#eee", "#eee", "#eee", "#eee", "#eee", ""],
    ],
  },
};

const sizeMultipliers = {
  small: 3,
  medium: 4,
  large: 5,
};

export function PixelObstacle({ type, className, size = "medium" }: PixelObstacleProps) {
  const sprite = obstacleSprites[type];
  const pixelSize = sizeMultipliers[size];

  return (
    <motion.div
      className={`relative ${className}`}
      style={{
        width: sprite.width * pixelSize,
        height: sprite.height * pixelSize,
        imageRendering: "pixelated",
      }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
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
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}

// Get obstacles based on year/theme
export function getObstaclesForLevel(year: number): ObstacleType[] {
  if (year <= 2008) return ["rock", "bush"];
  if (year <= 2014) return ["rock", "bush", "box"];
  if (year <= 2019) return ["box", "book", "cone"];
  if (year <= 2022) return ["computer", "coffee", "book"];
  return ["computer", "coffee", "cloud"];
}
