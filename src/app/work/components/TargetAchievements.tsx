"use client";

import { motion, AnimatePresence } from "framer-motion";
import { WorkTarget } from "./useShootingGame";

interface TargetAchievementsProps {
  target: WorkTarget;
  hitCount: number;
}

export function TargetAchievements({ target, hitCount }: TargetAchievementsProps) {
  if (!target || hitCount === 0) return null;
  
  const work = target.workExperience;
  const achievements = work.metrics || [];
  const skills = work.skills?.slice(0, 4) || [];
  
  // Position achievements around the target in a circle
  const radius = 180; // Distance from target center
  const angleStep = (2 * Math.PI) / Math.max(achievements.length + skills.length, 4);
  
  // Show achievements progressively based on hit count
  const visibleCount = Math.min(hitCount, achievements.length + skills.length);
  
  return (
    <div className="absolute pointer-events-none" style={{ left: `${target.x}%`, top: `${target.y}%`, transform: "translate(-50%, -50%)" }}>
      <AnimatePresence>
        {/* Achievements/Metrics */}
        {achievements.slice(0, visibleCount).map((achievement: any, idx: number) => {
          const angle = idx * angleStep;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          
          return (
            <motion.div
              key={`achievement-${idx}`}
              className="absolute"
              style={{
                left: `${x}px`,
                top: `${y}px`,
                transform: "translate(-50%, -50%)",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: idx * 0.05, duration: 0.2 }}
            >
              {/* Pixelated achievement card */}
              <div
                className="p-3 wireframe-border"
                style={{
                  borderWidth: "var(--border-width)",
                  borderColor: "var(--border-color)",
                  backgroundColor: "var(--bg-card)",
                  boxShadow: "var(--shadow-offset-x) var(--shadow-offset-y) var(--shadow-blur) var(--shadow-color)",
                  minWidth: "120px",
                  imageRendering: "pixelated" as any,
                  boxSizing: "border-box",
                }}
              >
                <div className="font-mono text-[10px] uppercase mb-1 text-center" style={{ color: "var(--text-muted)" }}>
                  {achievement.label}
                </div>
                <div className="font-mono text-xl font-bold text-center" style={{ color: "var(--text-main)" }}>
                  {achievement.value}
                </div>
                {/* Pixelated indicator */}
                <div className="flex justify-center gap-1 mt-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="w-2 h-2"
                      style={{
                        borderWidth: "var(--border-width)",
                        borderColor: "var(--border-color)",
                        backgroundColor: i <= idx + 1 ? "var(--accent-color)" : "transparent",
                      }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          );
        })}
        
        {/* Skills */}
        {skills.slice(0, Math.max(0, visibleCount - achievements.length)).map((skill: string, idx: number) => {
          const skillIdx = achievements.length + idx;
          const angle = skillIdx * angleStep;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          
          return (
            <motion.div
              key={`skill-${idx}`}
              className="absolute"
              style={{
                left: `${x}px`,
                top: `${y}px`,
                transform: "translate(-50%, -50%)",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: skillIdx * 0.05, duration: 0.2 }}
            >
              {/* Pixelated skill badge */}
              <div
                className="px-3 py-2 wireframe-border"
                style={{
                  borderWidth: "var(--border-width)",
                  borderColor: "var(--border-color)",
                  backgroundColor: "var(--bg-card)",
                  boxShadow: "var(--shadow-offset-x) var(--shadow-offset-y) var(--shadow-blur) var(--shadow-color)",
                  imageRendering: "pixelated" as any,
                }}
              >
                <div className="font-mono text-xs font-bold text-center whitespace-nowrap" style={{ color: "var(--text-main)" }}>
                  {skill}
                </div>
                {/* Pixelated skill indicator */}
                <div className="flex justify-center gap-0.5 mt-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-1.5 h-1.5"
                      style={{
                        borderWidth: "var(--border-width)",
                        borderColor: "var(--border-color)",
                        backgroundColor: i <= (idx + 1) * 2 ? "var(--text-main)" : "transparent",
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
