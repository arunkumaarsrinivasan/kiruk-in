"use client";

import { motion } from "framer-motion";
import { WorkTarget } from "./useShootingGame";
import { PixelIcon } from "@/components/ui/PixelIcon";

interface AdvancedSkillsVisualizationProps {
  target: WorkTarget | null;
  level: number;
}

export function AdvancedSkillsVisualization({ target, level }: AdvancedSkillsVisualizationProps) {
  if (!target) return null;
  
  const work = target.workExperience;
  
  return (
    <motion.div
      className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-40 border-2 p-4 max-w-4xl w-[90%]"
      style={{
        backgroundColor: "var(--bg-card)",
        borderColor: "var(--border-color)",
      }}
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center mb-4 border-b-2 pb-3" style={{ borderColor: "var(--border-color)" }}>
        <h3 className="font-mono text-lg font-bold mb-2 flex items-center justify-center gap-2" style={{ color: "var(--text-main)" }}>
          <PixelIcon name="flag-checkered" size={20} />
          LEVEL {level} COMPLETE
        </h3>
        <p className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>
          {work.company} · {work.title}
        </p>
      </div>
      
      {/* Skills Radar Chart - Grid Design */}
      {work.chartData && (
        <div className="mb-4">
          <h4 className="font-mono text-xs uppercase mb-3" style={{ color: "var(--text-muted)" }}>
            Skill Proficiency
          </h4>
          <div className="grid grid-cols-3 gap-2">
            {work.chartData.map((skill: any, idx: number) => (
              <div key={idx} className="border p-2" style={{ borderColor: "var(--border-color)", backgroundColor: "var(--bg-main)" }}>
                <div className="font-mono text-[10px] uppercase mb-1" style={{ color: "var(--text-muted)" }}>
                  {skill.label}
                </div>
                <div className="h-2 border relative overflow-hidden" style={{ borderColor: "var(--border-color)", backgroundColor: "var(--bg-card)" }}>
                  <motion.div
                    className="h-full"
                    style={{ 
                      width: `${skill.value}%`,
                      backgroundColor: skill.color || "var(--text-main)"
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${skill.value}%` }}
                    transition={{ delay: idx * 0.1, duration: 0.8 }}
                  />
                </div>
                <div className="font-mono text-[10px] mt-1 text-right" style={{ color: "var(--text-main)" }}>
                  {skill.value}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Skills Tags Grid */}
      {work.skills && (
        <div className="mb-4">
          <h4 className="font-mono text-xs uppercase mb-2" style={{ color: "var(--text-muted)" }}>
            Tech Stack
          </h4>
          <div className="flex flex-wrap gap-1">
            {work.skills.map((skill: string, idx: number) => (
              <motion.span
                key={idx}
                className="px-2 py-0.5 font-mono text-[10px] border"
                style={{
                  backgroundColor: "var(--bg-main)",
                  borderColor: "var(--border-color)",
                  color: "var(--text-main)",
                }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: idx * 0.03 }}
              >
                {skill}
              </motion.span>
            ))}
          </div>
        </div>
      )}
      
      {/* Impact Metrics - Grid Design */}
      {work.impactChart && (
        <div className="border p-3 mb-4" style={{ borderColor: "var(--border-color)", backgroundColor: "var(--bg-main)" }}>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-mono text-[10px] uppercase mb-1" style={{ color: "var(--text-muted)" }}>
                Impact Focus
              </div>
              <div className="font-mono text-sm font-bold" style={{ color: "var(--text-main)" }}>
                {work.impactChart.label}
              </div>
            </div>
            <div className="relative w-16 h-16">
              <svg width="64" height="64" className="transform -rotate-90">
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="var(--border-color)"
                  strokeWidth="2"
                  fill="none"
                  opacity="0.3"
                />
                <motion.circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke={work.impactChart.color || "var(--text-main)"}
                  strokeWidth="2"
                  fill="none"
                  strokeDasharray={175.9}
                  strokeDashoffset={175.9}
                  initial={{ strokeDashoffset: 175.9 }}
                  animate={{ 
                    strokeDashoffset: 175.9 - (work.impactChart.value / 100) * 175.9 
                  }}
                  transition={{ duration: 1, delay: 0.3 }}
                  strokeLinecap="square"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-mono text-sm font-bold" style={{ color: "var(--text-main)" }}>
                  {work.impactChart.value}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Skills Gained */}
      {work.skillsGained && (
        <div className="mt-3 pt-3 border-t" style={{ borderColor: "var(--border-color)" }}>
          <h4 className="font-mono text-xs uppercase mb-2" style={{ color: "var(--text-muted)" }}>
            Skills Gained
          </h4>
          <div className="flex flex-wrap gap-1">
            {work.skillsGained.map((skill: string, idx: number) => (
              <span
                key={idx}
                className="px-2 py-0.5 border font-mono text-[10px]"
                style={{
                  backgroundColor: "var(--bg-main)",
                  borderColor: "var(--border-color)",
                  color: "var(--text-main)",
                }}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

