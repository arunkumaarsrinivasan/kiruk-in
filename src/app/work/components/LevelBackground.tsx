"use client";

import { motion } from "framer-motion";
import { ShootingGameState } from "./useShootingGame";

interface LevelBackgroundProps {
  company: string;
  location: string;
  level: number;
  children: React.ReactNode;
  gameState?: ShootingGameState;
}

export function LevelBackground({ company, location, level, children, gameState }: LevelBackgroundProps) {
  // Calculate target progress (hitCount / maxHits for current target)
  const targetProgress = gameState && gameState.targets.length > 0
    ? gameState.targets[0].hitCount / gameState.targets[0].maxHits
    : 0;
  
  // Calculate overall game progress (levels completed / total levels)
  const overallProgress = gameState
    ? (gameState.currentLevel - 1 + targetProgress) / gameState.maxLevel
    : 0;

  const GRID_SIZE = 20; // Match design system
  
  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Stronger Grid background - pixelated style */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(var(--border-color) 1px, transparent 1px),
            linear-gradient(90deg, var(--border-color) 1px, transparent 1px)
          `,
          backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
          opacity: 0.4,
          imageRendering: "pixelated" as any,
        }}
      />
      
      {/* Scanlines effect for retro pixel feel */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-5"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)",
        }}
      />
      
      {/* Level info banner - positioned to avoid collisions */}
      <motion.div
        className="absolute top-24 right-4 z-30 px-4 py-2 pointer-events-none wireframe-border"
        style={{
          borderWidth: "var(--border-width)",
          borderColor: "var(--border-color)",
          backgroundColor: "var(--bg-card)",
          boxShadow: "var(--shadow-offset-x) var(--shadow-offset-y) var(--shadow-blur) var(--shadow-color)",
        }}
        initial={{ x: 50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center">
          <div className="font-mono text-xs uppercase mb-1" style={{ color: "var(--text-muted)" }}>
            Level {level}
          </div>
          <div className="font-mono text-lg font-bold" style={{ color: "var(--text-main)" }}>
            {company}
          </div>
          <div className="font-mono text-[10px]" style={{ color: "var(--text-muted)" }}>
            📍 {location}
          </div>
        </div>
      </motion.div>
      
      {/* Gaming-style Progress Bar - positioned at top center to avoid collisions */}
      {gameState && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-20 pointer-events-none max-w-2xl w-[calc(100%-2rem)] px-4">
          {/* Target Progress Bar */}
          <div className="mb-2">
            <div className="h-4 relative overflow-hidden wireframe-border" style={{
              borderWidth: "var(--border-width)",
              borderColor: "var(--border-color)",
              backgroundColor: "var(--bg-main)",
              boxShadow: "var(--shadow-offset-x) var(--shadow-offset-y) var(--shadow-blur) var(--shadow-color)",
            }}>
              {/* Animated progress fill */}
              <motion.div
                className="h-full bg-gradient-to-r from-green-500 via-yellow-400 to-green-500"
                style={{ 
                  width: `${targetProgress * 100}%`,
                  backgroundSize: "200% 100%",
                }}
                initial={{ width: 0 }}
                animate={{ 
                  width: `${targetProgress * 100}%`,
                  backgroundPosition: ["0% 0%", "100% 0%"],
                }}
                transition={{ 
                  width: { duration: 0.3, ease: "easeOut" },
                }}
              >
              </motion.div>
              {/* Progress percentage overlay */}
              {targetProgress > 0.1 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-mono text-xs font-bold" style={{ color: "var(--bg-main)" }}>
                    {Math.round(targetProgress * 100)}%
                  </span>
                </div>
              )}
            </div>
            {/* Progress labels */}
            <div className="flex justify-between mt-1.5 font-mono text-xs font-bold" style={{ color: "var(--text-muted)" }}>
              <span className="flex items-center gap-1.5">
                <span className="text-green-500 text-sm">●</span>
                <span>START</span>
              </span>
              <span className="text-yellow-400 px-2 py-0.5 border border-yellow-400/30 bg-yellow-400/10">
                TARGET: {gameState.targets[0]?.hitCount || 0}/{gameState.targets[0]?.maxHits || 9}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-xl leading-none">🏁</span>
                <span>GOAL</span>
              </span>
            </div>
          </div>
          
          {/* Overall Game Progress Bar */}
          <div className="mt-2">
            <div className="h-2.5 border border-gray-700 bg-gray-800/50 relative overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                style={{ width: `${overallProgress * 100}%` }}
                initial={{ width: 0 }}
                animate={{ width: `${overallProgress * 100}%` }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              />
            </div>
            <div className="flex justify-between mt-1 font-mono text-[9px] opacity-70" style={{ color: "var(--text-muted)" }}>
              <span>LEVEL {gameState.currentLevel}</span>
              <span className="font-bold">{Math.round(overallProgress * 100)}% COMPLETE</span>
              <span>LEVEL {gameState.maxLevel}</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Goal Marker - Static flag at bottom right */}
      {gameState && (
        <div
          className="absolute bottom-16 right-4 z-20 pointer-events-none"
        >
          <div className="flex flex-col items-center">
            <div className="text-4xl mb-2">
              🏁
            </div>
            <div 
              className="px-3 py-1 font-mono text-xs font-bold wireframe-border"
              style={{
                borderWidth: "var(--border-width)",
                borderColor: "var(--border-color)",
                backgroundColor: "var(--accent-color)",
                color: "var(--bg-main)",
                boxShadow: "var(--shadow-offset-x) var(--shadow-offset-y) var(--shadow-blur) var(--shadow-color)",
              }}
            >
              GOAL
            </div>
            <div
              className="w-1 h-12 mt-1"
              style={{ backgroundColor: "var(--accent-color)", opacity: 0.7 }}
            />
          </div>
        </div>
      )}
      
      {/* Content */}
      {children}
    </div>
  );
}

