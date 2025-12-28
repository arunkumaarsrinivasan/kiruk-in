"use client";

import { motion } from "framer-motion";
import { WorkTarget } from "./useShootingGame";
import { useEffect, useState } from "react";

// Account for fixed container with pt-16 (64px padding-top)
const TOP_PADDING = 64; // pt-16 = 64px

interface PixelTargetProps {
  readonly target: WorkTarget;
}

export function PixelTarget({ target }: PixelTargetProps) {
  const [dimensions, setDimensions] = useState({ width: 640, height: 640 });
  
  // Calculate size based on target.radius to match hit detection
  // target.radius is in percentage, so diameter = radius * 2
  useEffect(() => {
    const updateSize = () => {
      const containerWidth = window.innerWidth;
      const containerHeight = window.innerHeight - TOP_PADDING;
      
      // Calculate target size based on radius percentage
      // target.radius is the hit detection radius in percentage
      // Visual target diameter should be radius * 2 to match hit detection
      // Use container width (not full viewport) to match hit detection calculations
      const targetDiameterPercent = target.radius * 2;
      const targetSizePx = (targetDiameterPercent / 100) * containerWidth;
      
      // Apply constraints to ensure it fits and looks good
      // Use container dimensions (already accounts for top padding)
      const availableHeight = containerHeight - 200; // Bottom space for info boxes
      const availableWidth = containerWidth - 100; // Side padding
      const maxSize = Math.min(availableHeight * 0.7, availableWidth * 0.5, 640);
      const minSize = 300; // Reduced min size to allow smaller targets
      
      // Use the calculated size but respect min/max constraints
      // Prioritize matching the hit detection radius
      const size = Math.max(minSize, Math.min(maxSize, targetSizePx));
      setDimensions({ width: size, height: size });
    };
    
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [target.radius]);
  
  const gridSize = 80;
  const center = gridSize / 2;
  const maxRadius = center - 2;
  
  // Color based on target type and hit progress
  const getColor = () => {
    if (target.hit) return "var(--text-muted)";
    if (target.type === 'boss') return "#FF0000";
    if (target.type === 'bonus') return "#00FF00";
    return "var(--text-main)";
  };
  
  const borderColor = getColor();
  const fillColor = target.hit ? "var(--bg-card)" : "var(--bg-main)";
  
  // Determine accent color based on target type
  let accentColor = "var(--accent-color)";
  if (target.type === 'boss') {
    accentColor = "#FF4444";
  } else if (target.type === 'bonus') {
    accentColor = "#44FF44";
  }
  
  // Draw 6 concentric circles (archery target style)
  const numRings = 6;
  const ringWidth = maxRadius / numRings;

  // Prepare intel data for circular positioning around target
  const work = target.workExperience;
  const achievements = work.metrics || [];
  const skills = work.skills || [];
  
  // Build intel items array - include role/title and data collected prominently
  const intelItems = [
    // Role/Title - show first
    {
      type: work.role || work.title || "Developer",
      data: [`${work.duration || work.period || "2023-2024"}`],
      icon: "👤",
      color: "var(--accent-color)",
      isSpecial: true,
    },
    // Data Collected - show second
    {
      type: "DATA COLLECTED",
      data: [`${target.hitCount}/${target.maxHits}`],
      icon: "📊",
      color: "#00FF00",
      isSpecial: true,
    },
    {
      type: "SKILLS",
      data: skills.slice(0, 2),
      icon: "⚡",
      color: "var(--accent-color)",
    },
    {
      type: "INSIGHTS",
      data: work.insights?.slice(0, 1) || ["Key Learning"],
      icon: "💡",
      color: "#00FF00",
    },
    {
      type: "LEARNINGS",
      data: work.learnings?.slice(0, 1) || ["Growth"],
      icon: "📚",
      color: "#FFFF00",
    },
    {
      type: "METRICS",
      data: achievements.slice(0, 1).map((a: any) => `${a.label}: ${a.value}`),
      icon: "📊",
      color: "#00FFFF",
    },
    {
      type: "TECH",
      data: work.technologies?.slice(0, 1) || skills.slice(0, 1),
      icon: "🔧",
      color: "#FF00FF",
    },
    {
      type: "IMPACT",
      data: achievements.slice(0, 1).map((a: any) => a.value) || ["High"],
      icon: "🎯",
      color: "#FF4444",
    },
  ].filter(item => item.data.length > 0);

  // Show intel progressively based on hit count
  const visibleIntelCount = Math.min(target.hitCount, intelItems.length);
  
  // Calculate positions in a circle around the target
  // Position intel items at different angles around the target circle
  // Use percentage coordinates relative to container center (50%, 50%)
  const getIntelPosition = (index: number, total: number) => {
    // Start from top (270 degrees) and distribute evenly
    const angleStep = (2 * Math.PI) / total;
    const angle = (index * angleStep) - (Math.PI / 2); // Start from top
    
    // Calculate radius based on actual visual target size
    // SVG viewBox is 80x80, maxRadius is 38, so visual radius is ~47.5% of container
    // Position intel items at 55% from center to be just outside the target circle
    // This accounts for the actual visual target size and ensures visibility
    const visualRadiusPercent = (maxRadius / gridSize) * 100; // ~47.5%
    const intelRadiusPercent = visualRadiusPercent + 8; // Add 8% padding outside target
    const xPercent = 50 + intelRadiusPercent * Math.cos(angle);
    const yPercent = 50 + intelRadiusPercent * Math.sin(angle);
    
    return { xPercent, yPercent, angle };
  };
  
  // Use target position from game state (x and y are percentages)
  // Target is positioned in the game area with intel items around it
  
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        left: `${target.x}%`,
        top: `${target.y}%`,
        transform: "translate(-50%, -50%)",
        width: dimensions.width,
        height: dimensions.height,
        imageRendering: "pixelated" as any,
        maxWidth: "90vw", // Full width available now
        maxHeight: "70vh",
        overflow: "visible", // Ensure intel items are not clipped
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
      {/* SVG Archery Target - Clean and centered */}
      <svg
        width={dimensions.width}
        height={dimensions.height}
        viewBox={`0 0 ${gridSize} ${gridSize}`}
        style={{ imageRendering: "pixelated" as any }}
        className="absolute inset-0"
      >
        {/* Draw 6 concentric circles with alternating colors */}
        {Array.from({ length: numRings }).map((_, ringIndex) => {
          const ringNum = numRings - ringIndex; // 6, 5, 4, 3, 2, 1 (outer to inner)
          const radius = maxRadius - (ringIndex * ringWidth);
          const isEven = ringNum % 2 === 0;
          const fill = isEven ? borderColor : fillColor;
          const stroke = borderColor;
          
          return (
            <circle
              key={`ring-${ringNum}`}
              cx={center}
              cy={center}
              r={radius}
              fill={fill}
              stroke={stroke}
              strokeWidth="2"
              style={{ 
                filter: 'none'
              }}
            />
          );
        })}
        
        {/* Center dot */}
        <circle
          cx={center}
          cy={center}
          r={ringWidth * 0.7}
          fill={accentColor}
          stroke={borderColor}
          strokeWidth="1.5"
        />
        
        {/* Crosshair lines - more visible */}
        <line
          x1={center}
          y1={center - maxRadius}
          x2={center}
          y2={center + maxRadius}
          stroke={borderColor}
          strokeWidth="1"
          opacity="0.4"
        />
        <line
          x1={center - maxRadius}
          y1={center}
          x2={center + maxRadius}
          y2={center}
          stroke={borderColor}
          strokeWidth="1"
          opacity="0.4"
        />
      </svg>
      
      {/* Ring Labels 1-6 - One label per ring, positioned clearly */}
      {!target.hit && Array.from({ length: numRings }).map((_, ringIndex) => {
        const ringNum = numRings - ringIndex; // 6, 5, 4, 3, 2, 1
        const radius = maxRadius - (ringIndex * ringWidth) - (ringWidth / 2);
        // Position label at top of each ring
        const labelX = center;
        const labelY = center - radius;
        
        return (
          <div
            key={`ring-${ringNum}-label`}
            className="absolute font-mono font-bold"
            style={{
              left: `${(labelX / gridSize) * 100}%`,
              top: `${(labelY / gridSize) * 100}%`,
              transform: "translate(-50%, -50%)",
              color: ringNum % 2 === 0 ? fillColor : borderColor,
              fontSize: ringNum <= 2 ? "14px" : "12px",
              pointerEvents: "none",
              fontWeight: "bold",
              zIndex: 10,
            }}
          >
            {ringNum}
          </div>
        );
      })}
      
      {/* Company name label - pixel art style */}
      {!target.hit && (
        <div
          className="absolute -top-12 left-1/2 transform -translate-x-1/2 whitespace-nowrap font-mono text-sm border px-2 py-1 z-10"
          style={{ 
            color: "var(--text-main)",
            backgroundColor: "var(--bg-card)",
            borderColor: "var(--border-color)",
            borderWidth: "var(--border-width)",
            boxShadow: "var(--shadow-offset-x) var(--shadow-offset-y) var(--shadow-blur) var(--shadow-color)",
          }}
        >
          {target.workExperience.company}
          {target.type === 'boss' && ' ⭐'}
          {target.type === 'bonus' && ' ✨'}
        </div>
      )}
      
      {/* Hit progress indicator */}
      {!target.hit && target.hitCount > 0 && (
        <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 w-24 z-10">
          <div className="h-1.5 border" style={{ borderColor: "var(--border-color)", backgroundColor: "var(--bg-card)" }}>
            <motion.div
              className="h-full"
              style={{ backgroundColor: "var(--text-main)" }}
              initial={{ width: 0 }}
              animate={{ width: `${(target.hitCount / target.maxHits) * 100}%` }}
            />
          </div>
          <div className="font-mono text-[10px] text-center mt-1" style={{ color: "var(--text-muted)" }}>
            {target.hitCount}/{target.maxHits}
          </div>
        </div>
      )}

      {/* Intel items positioned around the target circle */}
      {!target.hit && target.hitCount > 0 && visibleIntelCount > 0 && (
        <>
          {intelItems.slice(0, visibleIntelCount).map((item, idx) => {
            const position = getIntelPosition(idx, visibleIntelCount);
            const isSpecial = (item as any).isSpecial;
            
            return (
              <motion.div
                key={`intel-${item.type}-${idx}`}
                className="absolute pointer-events-none z-20"
                style={{
                  left: `${position.xPercent}%`,
                  top: `${position.yPercent}%`,
                  transform: "translate(-50%, -50%)",
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ 
                  delay: idx * 0.1,
                  duration: 0.3,
                  type: "spring",
                  stiffness: 200,
                }}
              >
                <div
                  className={`px-2 py-1.5 ${isSpecial ? 'min-w-[100px] max-w-[160px]' : 'min-w-[90px] max-w-[140px]'}`}
                  style={{
                    border: "1px solid var(--border-color)",
                    borderWidth: "var(--border-width)",
                    backgroundColor: "var(--bg-card)",
                    boxShadow: "var(--shadow-offset-x) var(--shadow-offset-y) var(--shadow-blur) var(--shadow-color)",
                  }}
                >
                  {/* Header */}
                  <div className="flex items-center gap-1 mb-1">
                    <span className={isSpecial ? "text-sm" : "text-xs"}>{item.icon}</span>
                    <div
                      className={`font-mono ${isSpecial ? 'text-[10px]' : 'text-[9px]'} uppercase font-bold leading-tight`}
                      style={{ color: item.color }}
                    >
                      {item.type}
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="space-y-0.5">
                    {item.data.slice(0, 1).map((dataItem: string, itemIdx: number) => (
                      <div
                        key={`${item.type}-data-${itemIdx}`}
                        className={`font-mono ${isSpecial ? 'text-[11px]' : 'text-[10px]'} leading-tight truncate font-semibold`}
                        style={{ color: "var(--text-main)" }}
                        title={dataItem}
                      >
                        {dataItem}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </>
      )}
      
      {/* HIT THE TARGET instruction - horizontal, below target */}
      {!target.hit && (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-4 z-10 whitespace-nowrap">
          <div className="font-mono text-sm text-center" style={{ color: "var(--text-main)" }}>
            🎯 HIT THE TARGET
          </div>
          <div className="font-mono text-xs text-center mt-1" style={{ color: "var(--text-muted)" }}>
            Each hit reveals more intel
          </div>
        </div>
      )}
      
      {/* Hit effect */}
      {target.hit && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 2, opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div
            className="font-mono text-3xl font-bold"
            style={{ color: "var(--accent-color)" }}
          >
            +{target.points}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

