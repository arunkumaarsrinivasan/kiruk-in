"use client";

import { motion, AnimatePresence } from "framer-motion";
import { WorkTarget } from "./useShootingGame";
import { useEffect, useState } from "react";

interface TargetAchievementsProps {
  target: WorkTarget;
  hitCount: number;
}

export function TargetAchievements({ target, hitCount }: TargetAchievementsProps) {
  const [radius, setRadius] = useState(280);
  
  // Calculate responsive radius based on viewport
  useEffect(() => {
    const updateRadius = () => {
      const vh = window.innerHeight;
      const vw = window.innerWidth;
      const availableHeight = vh - 64 - 200;
      const availableWidth = vw - 100;
      const maxSize = Math.min(availableHeight * 0.7, availableWidth * 0.5);
      const minSize = 400;
      const targetSize = Math.max(minSize, Math.min(maxSize, 640));
      // Radius should be proportional to target size
      setRadius(targetSize * 0.45);
    };
    
    updateRadius();
    window.addEventListener('resize', updateRadius);
    return () => window.removeEventListener('resize', updateRadius);
  }, []);
  
  if (!target) return null;
  
  const work = target.workExperience;
  const achievements = work.metrics || [];
  const skills = work.skills || [];
  
  // Create 9 information boxes with different types
  const infoBoxes = [
    {
      type: "SKILLS",
      data: skills.slice(0, 3),
      icon: "⚡",
      color: "var(--accent-color)",
    },
    {
      type: "INSIGHTS",
      data: work.insights?.slice(0, 2) || ["Key Learning", "Best Practice"],
      icon: "💡",
      color: "#00FF00",
    },
    {
      type: "LEARNINGS",
      data: work.learnings?.slice(0, 2) || ["Growth", "Experience"],
      icon: "📚",
      color: "#FFFF00",
    },
    {
      type: "METRICS",
      data: achievements.slice(0, 2).map((a: any) => `${a.label}: ${a.value}`),
      icon: "📊",
      color: "#00FFFF",
    },
    {
      type: "TECH",
      data: work.technologies?.slice(0, 2) || skills.slice(0, 2),
      icon: "🔧",
      color: "#FF00FF",
    },
    {
      type: "IMPACT",
      data: achievements.slice(0, 1).map((a: any) => a.value) || ["High"],
      icon: "🎯",
      color: "#FF4444",
    },
    {
      type: "ROLE",
      data: [work.role || work.title || "Developer"],
      icon: "👤",
      color: "var(--text-main)",
    },
    {
      type: "DURATION",
      data: [work.duration || work.period || "2023-2024"],
      icon: "⏱️",
      color: "#FFAA00",
    },
    {
      type: "TEAM",
      data: [work.teamSize || "Solo"],
      icon: "👥",
      color: "#00AAFF",
    },
  ];
  
  // Position 9 boxes in a 3x3 grid around the target, centered
  const positions = [
    // Top row
    { angle: -Math.PI / 2, label: "top" }, // Top center
    { angle: -Math.PI / 2 + Math.PI / 4, label: "top-right" }, // Top right
    { angle: -Math.PI / 2 - Math.PI / 4, label: "top-left" }, // Top left
    // Middle row
    { angle: 0, label: "right" }, // Right
    { angle: Math.PI, label: "left" }, // Left
    // Bottom row
    { angle: Math.PI / 2, label: "bottom" }, // Bottom center
    { angle: Math.PI / 2 + Math.PI / 4, label: "bottom-right" }, // Bottom right
    { angle: Math.PI / 2 - Math.PI / 4, label: "bottom-left" }, // Bottom left
    // Center (slightly offset)
    { angle: Math.PI / 3, label: "center-right" }, // Center right
  ];
  
  // Show boxes progressively based on hit count
  const visibleCount = Math.min(hitCount, infoBoxes.length);
  
  return (
    <div 
      className="absolute pointer-events-none" 
      style={{ 
        left: `${target.x}%`, 
        top: `${target.y}%`, 
        transform: "translate(-50%, -50%)",
      }}
    >
      <AnimatePresence>
        {infoBoxes.slice(0, visibleCount).map((box, idx) => {
          const pos = positions[idx];
          const x = Math.cos(pos.angle) * radius;
          const y = Math.sin(pos.angle) * radius;
          
          return (
            <motion.div
              key={`info-box-${idx}`}
              className="absolute"
              style={{
                left: `${x}px`,
                top: `${y}px`,
                transform: "translate(-50%, -50%)",
              }}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ delay: idx * 0.1, duration: 0.3 }}
            >
              {/* Information box */}
              <div
                className="p-3 wireframe-border"
                style={{
                  borderWidth: "var(--border-width)",
                  borderColor: "var(--border-color)",
                  backgroundColor: "var(--bg-card)",
                  boxShadow: "var(--shadow-offset-x) var(--shadow-offset-y) var(--shadow-blur) var(--shadow-color)",
                  minWidth: "140px",
                  maxWidth: "180px",
                  width: "auto",
                  imageRendering: "pixelated" as any,
                  boxSizing: "border-box",
                  zIndex: 20,
                }}
              >
                {/* Header */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{box.icon}</span>
                  <div className="font-mono text-[10px] uppercase font-bold" style={{ color: box.color }}>
                    {box.type}
                  </div>
                </div>
                
                {/* Content */}
                <div className="space-y-1">
                  {box.data.map((item: string, itemIdx: number) => (
                    <div
                      key={itemIdx}
                      className="font-mono text-xs text-center"
                      style={{ color: "var(--text-main)" }}
                    >
                      {item}
                    </div>
                  ))}
                </div>
                
                {/* Progress indicator */}
                <div className="flex justify-center gap-1 mt-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="w-2 h-2"
                      style={{
                        borderWidth: "var(--border-width)",
                        borderColor: "var(--border-color)",
                        backgroundColor: i <= idx + 1 ? box.color : "transparent",
                      }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
