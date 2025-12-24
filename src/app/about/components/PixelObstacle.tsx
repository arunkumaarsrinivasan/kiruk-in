"use client";

import { motion } from "framer-motion";

export type ObstacleType = 
  | "rock" | "bush" | "box" | "cone" | "computer" | "coffee" | "book" | "cloud"
  | "crochet" | "notebook" | "biryani" | "chai" | "paintbrush" | "calligraphy" 
  | "poster" | "sketchbook" | "laptop" | "phone" | "gamepad" | "design-tool";

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
  crochet: {
    width: 8,
    height: 10,
    pixels: [
      ["", "", "#FF69B4", "#FF69B4", "#FF69B4", "", "", ""],
      ["", "#FF69B4", "#FFB6C1", "#FFB6C1", "#FFB6C1", "#FF69B4", "", ""],
      ["#FF69B4", "#FFB6C1", "#FFC0CB", "#FFC0CB", "#FFC0CB", "#FFB6C1", "#FF69B4", ""],
      ["#8B4513", "#8B4513", "#8B4513", "#8B4513", "#8B4513", "#8B4513", "#8B4513", ""],
      ["", "#8B4513", "#654321", "#654321", "#654321", "#8B4513", "", ""],
      ["", "", "#654321", "#654321", "#654321", "", "", ""],
      ["", "", "#654321", "#654321", "#654321", "", "", ""],
      ["", "", "#654321", "#654321", "#654321", "", "", ""],
      ["", "", "#654321", "#654321", "#654321", "", "", ""],
      ["", "", "#8B4513", "#8B4513", "#8B4513", "", "", ""],
    ],
  },
  notebook: {
    width: 10,
    height: 12,
    pixels: [
      ["#FFF", "#FFF", "#FFF", "#FFF", "#FFF", "#FFF", "#FFF", "#FFF", "#FFF", "#FFF"],
      ["#FFF", "#000", "#000", "#000", "#000", "#000", "#000", "#000", "#000", "#FFF"],
      ["#FFF", "#000", "#FFF", "#FFF", "#FFF", "#FFF", "#FFF", "#FFF", "#000", "#FFF"],
      ["#FFF", "#000", "#FFF", "#333", "#333", "#333", "#FFF", "#FFF", "#000", "#FFF"],
      ["#FFF", "#000", "#FFF", "#FFF", "#FFF", "#FFF", "#FFF", "#FFF", "#000", "#FFF"],
      ["#FFF", "#000", "#FFF", "#333", "#333", "#333", "#FFF", "#FFF", "#000", "#FFF"],
      ["#FFF", "#000", "#FFF", "#FFF", "#FFF", "#FFF", "#FFF", "#FFF", "#000", "#FFF"],
      ["#FFF", "#000", "#FFF", "#333", "#333", "#333", "#FFF", "#FFF", "#000", "#FFF"],
      ["#FFF", "#000", "#000", "#000", "#000", "#000", "#000", "#000", "#000", "#FFF"],
      ["#8B4513", "#8B4513", "#8B4513", "#8B4513", "#8B4513", "#8B4513", "#8B4513", "#8B4513", "#8B4513", "#8B4513"],
      ["#654321", "#654321", "#654321", "#654321", "#654321", "#654321", "#654321", "#654321", "#654321", "#654321"],
      ["#8B4513", "#8B4513", "#8B4513", "#8B4513", "#8B4513", "#8B4513", "#8B4513", "#8B4513", "#8B4513", "#8B4513"],
    ],
  },
  biryani: {
    width: 10,
    height: 8,
    pixels: [
      ["", "", "#FFD700", "#FFD700", "#FFD700", "#FFD700", "#FFD700", "", "", ""],
      ["", "#FF8C00", "#FFA500", "#FFA500", "#FFA500", "#FFA500", "#FF8C00", "", ""],
      ["#8B4513", "#FF8C00", "#FFA500", "#FFD700", "#FFD700", "#FFA500", "#FF8C00", "#8B4513", ""],
      ["#8B4513", "#FF8C00", "#FFA500", "#FFA500", "#FFA500", "#FFA500", "#FF8C00", "#8B4513", ""],
      ["#8B4513", "#654321", "#8B4513", "#8B4513", "#8B4513", "#8B4513", "#654321", "#8B4513", ""],
      ["#654321", "#8B4513", "#654321", "#654321", "#654321", "#654321", "#8B4513", "#654321", ""],
      ["#8B4513", "#654321", "#8B4513", "#8B4513", "#8B4513", "#8B4513", "#654321", "#8B4513", ""],
      ["", "#8B4513", "#654321", "#654321", "#654321", "#654321", "#8B4513", "", ""],
    ],
  },
  chai: {
    width: 8,
    height: 10,
    pixels: [
      ["", "", "#8B4513", "#8B4513", "#8B4513", "", "", ""],
      ["", "#8B4513", "#FFF", "#FFF", "#FFF", "#8B4513", "", ""],
      ["#8B4513", "#FFF", "#FFD700", "#FFD700", "#FFD700", "#FFF", "#8B4513", ""],
      ["#8B4513", "#FFF", "#FFD700", "#FFA500", "#FFD700", "#FFF", "#8B4513", ""],
      ["#8B4513", "#FFF", "#FFD700", "#FFD700", "#FFD700", "#FFF", "#8B4513", ""],
      ["#8B4513", "#FFF", "#FFF", "#FFF", "#FFF", "#FFF", "#8B4513", ""],
      ["#8B4513", "#654321", "#654321", "#654321", "#654321", "#654321", "#8B4513", ""],
      ["", "#8B4513", "#654321", "#654321", "#654321", "#8B4513", "", ""],
      ["", "", "#8B4513", "#654321", "#8B4513", "", "", ""],
      ["", "", "", "#8B4513", "", "", "", ""],
    ],
  },
  paintbrush: {
    width: 10,
    height: 8,
    pixels: [
      ["", "", "", "#8B4513", "#8B4513", "#8B4513", "", "", "", ""],
      ["", "", "#8B4513", "#654321", "#654321", "#654321", "#8B4513", "", "", ""],
      ["", "#8B4513", "#654321", "#8B4513", "#8B4513", "#8B4513", "#654321", "#8B4513", "", ""],
      ["#FF69B4", "#FFB6C1", "#FFC0CB", "#FFC0CB", "#FFC0CB", "#FFC0CB", "#FFB6C1", "#FF69B4", "", ""],
      ["#FF69B4", "#FFB6C1", "#FFC0CB", "#FFC0CB", "#FFC0CB", "#FFC0CB", "#FFB6C1", "#FF69B4", "", ""],
      ["#FF69B4", "#FFB6C1", "#FFC0CB", "#FFC0CB", "#FFC0CB", "#FFC0CB", "#FFB6C1", "#FF69B4", "", ""],
      ["", "#FF69B4", "#FFB6C1", "#FFC0CB", "#FFC0CB", "#FFC0CB", "#FFB6C1", "#FF69B4", "", ""],
      ["", "", "#FF69B4", "#FFB6C1", "#FFC0CB", "#FFB6C1", "#FF69B4", "", "", ""],
    ],
  },
  calligraphy: {
    width: 10,
    height: 8,
    pixels: [
      ["", "", "#8B4513", "#8B4513", "#8B4513", "#8B4513", "", "", "", ""],
      ["", "#8B4513", "#654321", "#654321", "#654321", "#654321", "#8B4513", "", "", ""],
      ["#8B4513", "#654321", "#000", "#000", "#000", "#000", "#654321", "#8B4513", "", ""],
      ["#8B4513", "#654321", "#000", "#333", "#333", "#000", "#654321", "#8B4513", "", ""],
      ["#8B4513", "#654321", "#000", "#000", "#000", "#000", "#654321", "#8B4513", "", ""],
      ["#8B4513", "#654321", "#000", "#333", "#333", "#000", "#654321", "#8B4513", "", ""],
      ["", "#8B4513", "#654321", "#654321", "#654321", "#654321", "#8B4513", "", "", ""],
      ["", "", "#8B4513", "#8B4513", "#8B4513", "#8B4513", "", "", "", ""],
    ],
  },
  poster: {
    width: 12,
    height: 10,
    pixels: [
      ["#FFF", "#FFF", "#FFF", "#FFF", "#FFF", "#FFF", "#FFF", "#FFF", "#FFF", "#FFF", "#FFF", "#FFF"],
      ["#FFF", "#FF6B6B", "#FF6B6B", "#FF6B6B", "#FF6B6B", "#FF6B6B", "#FF6B6B", "#FF6B6B", "#FF6B6B", "#FF6B6B", "#FF6B6B", "#FFF"],
      ["#FFF", "#FF6B6B", "#FFD93D", "#FFD93D", "#FFD93D", "#FFD93D", "#FFD93D", "#FFD93D", "#FFD93D", "#FFD93D", "#FF6B6B", "#FFF"],
      ["#FFF", "#FF6B6B", "#FFD93D", "#6BCF7F", "#6BCF7F", "#6BCF7F", "#6BCF7F", "#6BCF7F", "#6BCF7F", "#FFD93D", "#FF6B6B", "#FFF"],
      ["#FFF", "#FF6B6B", "#FFD93D", "#6BCF7F", "#4D96FF", "#4D96FF", "#4D96FF", "#4D96FF", "#6BCF7F", "#FFD93D", "#FF6B6B", "#FFF"],
      ["#FFF", "#FF6B6B", "#FFD93D", "#6BCF7F", "#4D96FF", "#4D96FF", "#4D96FF", "#6BCF7F", "#FFD93D", "#FF6B6B", "#FFF"],
      ["#FFF", "#FF6B6B", "#FFD93D", "#6BCF7F", "#6BCF7F", "#6BCF7F", "#6BCF7F", "#FFD93D", "#FF6B6B", "#FFF"],
      ["#FFF", "#FF6B6B", "#FFD93D", "#FFD93D", "#FFD93D", "#FFD93D", "#FFD93D", "#FF6B6B", "#FFF"],
      ["#FFF", "#FF6B6B", "#FF6B6B", "#FF6B6B", "#FF6B6B", "#FF6B6B", "#FF6B6B", "#FF6B6B", "#FF6B6B", "#FF6B6B", "#FF6B6B", "#FFF"],
      ["#8B4513", "#8B4513", "#8B4513", "#8B4513", "#8B4513", "#8B4513", "#8B4513", "#8B4513", "#8B4513", "#8B4513", "#8B4513", "#8B4513"],
    ],
  },
  sketchbook: {
    width: 10,
    height: 8,
    pixels: [
      ["#FFF", "#FFF", "#FFF", "#FFF", "#FFF", "#FFF", "#FFF", "#FFF", "#FFF", "#FFF"],
      ["#FFF", "#000", "#000", "#000", "#000", "#000", "#000", "#000", "#000", "#FFF"],
      ["#FFF", "#000", "#FFD700", "#FFD700", "#FFD700", "#FFD700", "#FFD700", "#000", "#FFF"],
      ["#FFF", "#000", "#FFD700", "#FFA500", "#FFA500", "#FFA500", "#FFD700", "#000", "#FFF"],
      ["#FFF", "#000", "#FFD700", "#FFD700", "#FFD700", "#FFD700", "#FFD700", "#000", "#FFF"],
      ["#FFF", "#000", "#000", "#000", "#000", "#000", "#000", "#000", "#000", "#FFF"],
      ["#8B4513", "#8B4513", "#8B4513", "#8B4513", "#8B4513", "#8B4513", "#8B4513", "#8B4513", "#8B4513", "#8B4513"],
      ["#654321", "#654321", "#654321", "#654321", "#654321", "#654321", "#654321", "#654321", "#654321", "#654321"],
    ],
  },
  laptop: {
    width: 14,
    height: 10,
    pixels: [
      ["#333", "#333", "#333", "#333", "#333", "#333", "#333", "#333", "#333", "#333", "#333", "#333", "#333", "#333"],
      ["#333", "#1a1a2e", "#1a1a2e", "#1a1a2e", "#1a1a2e", "#1a1a2e", "#1a1a2e", "#1a1a2e", "#1a1a2e", "#1a1a2e", "#1a1a2e", "#1a1a2e", "#1a1a2e", "#333"],
      ["#333", "#1a1a2e", "#00ff00", "#00ff00", "#1a1a2e", "#00ff00", "#1a1a2e", "#00ff00", "#00ff00", "#1a1a2e", "#1a1a2e", "#00ff00", "#1a1a2e", "#333"],
      ["#333", "#1a1a2e", "#00ff00", "#1a1a2e", "#1a1a2e", "#00ff00", "#1a1a2e", "#00ff00", "#1a1a2e", "#1a1a2e", "#1a1a2e", "#00ff00", "#1a1a2e", "#333"],
      ["#333", "#1a1a2e", "#00ff00", "#00ff00", "#1a1a2e", "#00ff00", "#1a1a2e", "#00ff00", "#00ff00", "#1a1a2e", "#1a1a2e", "#00ff00", "#1a1a2e", "#333"],
      ["#333", "#1a1a2e", "#1a1a2e", "#1a1a2e", "#1a1a2e", "#1a1a2e", "#1a1a2e", "#1a1a2e", "#1a1a2e", "#1a1a2e", "#1a1a2e", "#1a1a2e", "#1a1a2e", "#333"],
      ["#333", "#333", "#333", "#333", "#333", "#333", "#333", "#333", "#333", "#333", "#333", "#333", "#333", "#333"],
      ["", "", "", "", "#555", "#555", "#555", "#555", "#555", "#555", "", "", "", ""],
      ["", "", "", "#666", "#666", "#666", "#666", "#666", "#666", "#666", "#666", "", "", ""],
      ["", "", "#777", "#777", "#777", "#777", "#777", "#777", "#777", "#777", "#777", "#777", "", ""],
    ],
  },
  phone: {
    width: 6,
    height: 10,
    pixels: [
      ["#333", "#333", "#333", "#333", "#333", "#333"],
      ["#333", "#1a1a2e", "#1a1a2e", "#1a1a2e", "#1a1a2e", "#333"],
      ["#333", "#1a1a2e", "#00ff00", "#00ff00", "#1a1a2e", "#333"],
      ["#333", "#1a1a2e", "#00ff00", "#00ff00", "#1a1a2e", "#333"],
      ["#333", "#1a1a2e", "#00ff00", "#00ff00", "#1a1a2e", "#333"],
      ["#333", "#1a1a2e", "#1a1a2e", "#1a1a2e", "#1a1a2e", "#333"],
      ["#333", "#1a1a2e", "#1a1a2e", "#1a1a2e", "#1a1a2e", "#333"],
      ["#333", "#333", "#333", "#333", "#333", "#333"],
      ["", "", "#555", "#555", "", ""],
      ["", "", "#666", "#666", "", ""],
    ],
  },
  gamepad: {
    width: 12,
    height: 8,
    pixels: [
      ["", "", "#333", "#333", "#333", "#333", "#333", "#333", "", "", "", ""],
      ["", "#333", "#1a1a2e", "#1a1a2e", "#1a1a2e", "#1a1a2e", "#1a1a2e", "#1a1a2e", "#333", "", "", ""],
      ["#333", "#1a1a2e", "#00ff00", "#1a1a2e", "#1a1a2e", "#1a1a2e", "#1a1a2e", "#00ff00", "#1a1a2e", "#333", "", ""],
      ["#333", "#1a1a2e", "#1a1a2e", "#00ff00", "#1a1a2e", "#1a1a2e", "#00ff00", "#1a1a2e", "#1a1a2e", "#333", "", ""],
      ["#333", "#1a1a2e", "#1a1a2e", "#1a1a2e", "#00ff00", "#00ff00", "#1a1a2e", "#1a1a2e", "#1a1a2e", "#333", "", ""],
      ["#333", "#1a1a2e", "#1a1a2e", "#1a1a2e", "#1a1a2e", "#1a1a2e", "#1a1a2e", "#1a1a2e", "#1a1a2e", "#333", "", ""],
      ["", "#333", "#1a1a2e", "#1a1a2e", "#1a1a2e", "#1a1a2e", "#1a1a2e", "#1a1a2e", "#333", "", "", ""],
      ["", "", "#333", "#333", "#333", "#333", "#333", "#333", "", "", "", ""],
    ],
  },
  "design-tool": {
    width: 10,
    height: 8,
    pixels: [
      ["", "", "#4D96FF", "#4D96FF", "#4D96FF", "#4D96FF", "", "", "", ""],
      ["", "#4D96FF", "#6BCF7F", "#6BCF7F", "#6BCF7F", "#6BCF7F", "#4D96FF", "", "", ""],
      ["#4D96FF", "#6BCF7F", "#FFD93D", "#FFD93D", "#FFD93D", "#FFD93D", "#6BCF7F", "#4D96FF", "", ""],
      ["#4D96FF", "#6BCF7F", "#FFD93D", "#FF6B6B", "#FF6B6B", "#FFD93D", "#6BCF7F", "#4D96FF", "", ""],
      ["#4D96FF", "#6BCF7F", "#FFD93D", "#FFD93D", "#FFD93D", "#FFD93D", "#6BCF7F", "#4D96FF", "", ""],
      ["", "#4D96FF", "#6BCF7F", "#6BCF7F", "#6BCF7F", "#6BCF7F", "#4D96FF", "", "", ""],
      ["", "", "#4D96FF", "#4D96FF", "#4D96FF", "#4D96FF", "", "", "", ""],
      ["", "", "", "#333", "#333", "#333", "", "", "", ""],
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

// Get obstacles based on event story/theme
export function getObstaclesForLevel(year: number, eventTitle?: string, tags?: string[]): ObstacleType[] {
  // Match obstacles to story themes
  if (eventTitle?.toLowerCase().includes("creative clan") || eventTitle?.toLowerCase().includes("joint family")) {
    return ["crochet", "paintbrush", "calligraphy", "chai"];
  }
  if (eventTitle?.toLowerCase().includes("family studio") || eventTitle?.toLowerCase().includes("playground")) {
    return ["crochet", "paintbrush", "calligraphy", "chai", "book"];
  }
  if (eventTitle?.toLowerCase().includes("scribble") || eventTitle?.toLowerCase().includes("notebook") || eventTitle?.toLowerCase().includes("biryani")) {
    return ["notebook", "biryani", "chai", "book"];
  }
  if (eventTitle?.toLowerCase().includes("freelance") || eventTitle?.toLowerCase().includes("poster") || eventTitle?.toLowerCase().includes("illustration")) {
    return ["poster", "sketchbook", "paintbrush", "book"];
  }
  if (eventTitle?.toLowerCase().includes("engineering") || eventTitle?.toLowerCase().includes("college")) {
    return ["laptop", "notebook", "book", "coffee"];
  }
  if (eventTitle?.toLowerCase().includes("campus") || eventTitle?.toLowerCase().includes("creative lead")) {
    return ["laptop", "design-tool", "poster", "coffee"];
  }
  if (eventTitle?.toLowerCase().includes("pandemic") || eventTitle?.toLowerCase().includes("game") || eventTitle?.toLowerCase().includes("playlab")) {
    return ["gamepad", "phone", "laptop", "design-tool"];
  }
  if (eventTitle?.toLowerCase().includes("design system") || eventTitle?.toLowerCase().includes("figma")) {
    return ["design-tool", "laptop", "computer", "coffee"];
  }
  
  // Fallback to year-based if no match
  if (year <= 2008) return ["crochet", "paintbrush", "chai"];
  if (year <= 2014) return ["notebook", "biryani", "chai", "book"];
  if (year <= 2019) return ["poster", "sketchbook", "book", "coffee"];
  if (year <= 2022) return ["laptop", "design-tool", "computer", "coffee"];
  return ["laptop", "phone", "gamepad", "design-tool"];
}
