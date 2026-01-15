"use client";

import { motion } from "framer-motion";
import { WorkTarget } from "./useShootingGame";

interface VisualShowcaseProps {
  target: WorkTarget | null;
  revealIndex: number;
  level: number;
}

export function VisualShowcase({ target, revealIndex, level: _level }: VisualShowcaseProps) {
  if (!target) return null;
  
  const work = target.workExperience;
  const reveals = [
    { type: "title", visual: true },
    { type: "metrics", visual: true },
    { type: "skills", visual: true },
    { type: "projects", visual: true },
    { type: "impact", visual: true },
  ];
  
  const currentReveal = reveals[Math.min(revealIndex, reveals.length - 1)];
  
  return (
    <motion.div
      className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-40 p-4 max-w-3xl w-[90%] wireframe-border"
      style={{
        borderWidth: "var(--border-width)",
        borderColor: "var(--border-color)",
        backgroundColor: "var(--bg-card)",
        boxShadow: "var(--shadow-offset-x) var(--shadow-offset-y) var(--shadow-blur) var(--shadow-color)",
        imageRendering: "pixelated" as any,
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Progress bar */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex-1 h-1.5 border" style={{ borderColor: "var(--border-color)", backgroundColor: "var(--bg-main)" }}>
          <motion.div
            className="h-full"
            style={{ backgroundColor: "var(--text-main)" }}
            initial={{ width: 0 }}
            animate={{ width: `${((revealIndex + 1) / reveals.length) * 100}%` }}
          />
        </div>
        <span className="font-mono text-[10px]" style={{ color: "var(--text-muted)" }}>
          {revealIndex + 1}/{reveals.length}
        </span>
      </div>
      
      <div key={revealIndex}>
        {/* Title Visual */}
        {currentReveal.type === "title" && (
          <div className="text-center">
            <div className="font-mono text-lg font-bold mb-2" style={{ color: "var(--text-main)" }}>
              {work.company}
            </div>
            <div className="font-mono text-xs mb-3" style={{ color: "var(--text-muted)" }}>
              {work.title} · {work.period}
            </div>
            {/* Visual timeline bar */}
            <div className="h-2 border" style={{ borderColor: "var(--border-color)", backgroundColor: "var(--bg-main)" }}>
              <motion.div
                className="h-full"
                style={{ backgroundColor: "var(--text-main)" }}
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 1 }}
              />
            </div>
          </div>
        )}
        
        {/* Metrics Visual - Bar Chart */}
        {currentReveal.type === "metrics" && work.metrics && (
          <div>
            <div className="font-mono text-xs uppercase mb-3 text-center" style={{ color: "var(--text-muted)" }}>
              Key Achievements
            </div>
            <div className="grid grid-cols-3 gap-2">
              {work.metrics.map((metric: any, idx: number) => (
                <div key={idx} className="flex flex-col items-center">
                  <div className="w-full h-16 border mb-1 flex items-end justify-center" style={{ borderColor: "var(--border-color)", backgroundColor: "var(--bg-main)" }}>
                    <motion.div
                      className="w-full"
                      style={{ 
                        height: `${60 + idx * 10}%`,
                        backgroundColor: "var(--text-main)",
                      }}
                      initial={{ height: 0 }}
                      animate={{ height: `${60 + idx * 10}%` }}
                      transition={{ delay: idx * 0.1, duration: 0.6 }}
                    />
                  </div>
                  <div className="font-mono text-sm font-bold" style={{ color: "var(--text-main)" }}>
                    {metric.value}
                  </div>
                  <div className="font-mono text-[9px] uppercase" style={{ color: "var(--text-muted)" }}>
                    {metric.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Skills Visual - Radar/Spider Chart */}
        {currentReveal.type === "skills" && work.chartData && (
          <div>
            <div className="font-mono text-xs uppercase mb-3 text-center" style={{ color: "var(--text-muted)" }}>
              Skill Proficiency
            </div>
            <div className="grid grid-cols-3 gap-2">
              {work.chartData.map((skill: any, idx: number) => (
                <div key={idx} className="relative">
                  <div className="font-mono text-[10px] uppercase mb-1 text-center" style={{ color: "var(--text-muted)" }}>
                    {skill.label}
                  </div>
                  {/* Circular progress */}
                  <div className="relative w-16 h-16 mx-auto">
                    <svg width="64" height="64" className="transform -rotate-90">
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        stroke="var(--border-color)"
                        strokeWidth="3"
                        fill="none"
                        opacity="0.2"
                      />
                      <motion.circle
                        cx="32"
                        cy="32"
                        r="28"
                        stroke={skill.color || "var(--text-main)"}
                        strokeWidth="3"
                        fill="none"
                        strokeDasharray={175.9}
                        strokeDashoffset={175.9}
                        initial={{ strokeDashoffset: 175.9 }}
                        animate={{ strokeDashoffset: 175.9 - (skill.value / 100) * 175.9 }}
                        transition={{ delay: idx * 0.1, duration: 0.8 }}
                        strokeLinecap="square"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="font-mono text-xs font-bold" style={{ color: "var(--text-main)" }}>
                        {skill.value}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Projects Visual - Card Grid */}
        {currentReveal.type === "projects" && work.projects && (
          <div>
            <div className="font-mono text-xs uppercase mb-3 text-center" style={{ color: "var(--text-muted)" }}>
              Projects ({work.projects.length})
            </div>
            <div className="grid grid-cols-2 gap-2">
              {work.projects.slice(0, 4).map((project: any, idx: number) => (
                <motion.div
                  key={idx}
                  className="border p-2"
                  style={{ borderColor: "var(--border-color)", backgroundColor: "var(--bg-main)" }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <div className="flex items-start justify-between mb-1">
                    <div className="font-mono text-xs font-bold" style={{ color: "var(--text-main)" }}>
                      {project.title}
                    </div>
                    <div className="w-2 h-2 border" style={{ borderColor: "var(--border-color)", backgroundColor: "var(--text-main)" }} />
                  </div>
                  {/* Visual tech stack indicators */}
                  <div className="flex gap-1 mt-1">
                    {project.tech.slice(0, 3).map((tech: string, techIdx: number) => (
                      <div
                        key={techIdx}
                        className="w-1 h-4 border"
                        style={{ 
                          borderColor: "var(--border-color)",
                          backgroundColor: "var(--text-main)",
                          opacity: 0.6 + techIdx * 0.2,
                        }}
                      />
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
        
        {/* Impact Visual - Large Donut */}
        {currentReveal.type === "impact" && work.impactChart && (
          <div className="text-center">
            <div className="font-mono text-xs uppercase mb-3" style={{ color: "var(--text-muted)" }}>
              Impact Focus
            </div>
            <div className="relative w-32 h-32 mx-auto">
              <svg width="128" height="128" className="transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="var(--border-color)"
                  strokeWidth="4"
                  fill="none"
                  opacity="0.2"
                />
                <motion.circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke={work.impactChart.color || "var(--text-main)"}
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray={351.8}
                  strokeDashoffset={351.8}
                  initial={{ strokeDashoffset: 351.8 }}
                  animate={{ strokeDashoffset: 351.8 - (work.impactChart.value / 100) * 351.8 }}
                  transition={{ duration: 1.2 }}
                  strokeLinecap="square"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-mono text-2xl font-bold" style={{ color: "var(--text-main)" }}>
                  {work.impactChart.value}%
                </span>
                <span className="font-mono text-[10px] uppercase" style={{ color: "var(--text-muted)" }}>
                  {work.impactChart.label}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Hint - Pixelated style */}
      <div className="text-center mt-3 pt-2" style={{ borderTopWidth: "var(--border-width)", borderColor: "var(--border-color)" }}>
        <div className="font-mono text-[10px] uppercase" style={{ color: "var(--text-muted)" }}>
          {revealIndex < reveals.length - 1 ? "Shoot again to reveal more →" : "✓ Complete"}
        </div>
      </div>
    </motion.div>
  );
}

