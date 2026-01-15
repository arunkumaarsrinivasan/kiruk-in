"use client";

import { motion, AnimatePresence } from "framer-motion";
import { WorkTarget } from "./useShootingGame";
import { PixelIcon } from "@/components/ui/PixelIcon";

interface ProgressiveRevealProps {
  target: WorkTarget | null;
  revealIndex: number;
  level: number;
}

export function ProgressiveReveal({ target, revealIndex, level: _level }: ProgressiveRevealProps) {
  if (!target) return null;
  
  const work = target.workExperience;
  
  // Progressive reveal based on hit count
  const reveals = [
    { type: "title", content: `${work.company} · ${work.title}` },
    { type: "summary", content: work.summary },
    { type: "metrics", content: work.metrics },
    { type: "projects", content: work.projects },
    { type: "skills", content: work.skills },
    { type: "impact", content: work.impactChart },
  ];
  
  const currentReveal = reveals[Math.min(revealIndex, reveals.length - 1)];
  
  return (
    <motion.div
      className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-40 border-2 p-3 max-w-2xl w-[85%]"
      style={{
        backgroundColor: "var(--bg-card)",
        borderColor: "var(--border-color)",
      }}
      initial={{ y: 50, opacity: 0, scale: 0.9 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: 50, opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3, type: "spring" }}
    >
      {/* Progress indicator */}
      <div className="flex items-center gap-2 mb-2">
        <div className="flex-1 h-1 border" style={{ borderColor: "var(--border-color)", backgroundColor: "var(--bg-main)" }}>
          <motion.div
            className="h-full"
            style={{ backgroundColor: "var(--text-main)" }}
            initial={{ width: 0 }}
            animate={{ width: `${((revealIndex + 1) / reveals.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <span className="font-mono text-[10px]" style={{ color: "var(--text-muted)" }}>
          {revealIndex + 1}/{reveals.length}
        </span>
      </div>
      
      <AnimatePresence mode="wait">
        <motion.div
          key={revealIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {currentReveal.type === "title" && (
            <div className="text-center">
              <div className="font-mono text-sm font-bold mb-1 flex items-center gap-2" style={{ color: "var(--text-main)" }}>
                <PixelIcon name="flag-checkered" size={16} />
                {currentReveal.content}
              </div>
              <div className="font-mono text-[10px]" style={{ color: "var(--text-muted)" }}>
                {work.period} · {work.location}
              </div>
            </div>
          )}
          
          {currentReveal.type === "summary" && (
            <div>
              <div className="font-mono text-[10px] uppercase mb-1" style={{ color: "var(--text-muted)" }}>
                Summary
              </div>
              <div className="font-mono text-xs leading-relaxed" style={{ color: "var(--text-main)" }}>
                {currentReveal.content}
              </div>
            </div>
          )}
          
          {currentReveal.type === "metrics" && currentReveal.content && (
            <div>
              <div className="font-mono text-[10px] uppercase mb-2" style={{ color: "var(--text-muted)" }}>
                Key Metrics
              </div>
              <div className="grid grid-cols-3 gap-1">
                {currentReveal.content.map((metric: any, idx: number) => (
                  <div key={idx} className="border p-1.5 text-center" style={{ borderColor: "var(--border-color)", backgroundColor: "var(--bg-main)" }}>
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
          
          {currentReveal.type === "projects" && currentReveal.content && (
            <div>
              <div className="font-mono text-[10px] uppercase mb-2" style={{ color: "var(--text-muted)" }}>
                Projects ({currentReveal.content.length})
              </div>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {currentReveal.content.slice(0, 2).map((project: any, idx: number) => (
                  <div key={idx} className="border p-1.5" style={{ borderColor: "var(--border-color)", backgroundColor: "var(--bg-main)" }}>
                    <div className="font-mono text-xs font-bold mb-0.5" style={{ color: "var(--text-main)" }}>
                      {project.title}
                    </div>
                    <div className="font-mono text-[10px]" style={{ color: "var(--text-muted)" }}>
                      {project.desc}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {currentReveal.type === "skills" && currentReveal.content && (
            <div>
              <div className="font-mono text-[10px] uppercase mb-2" style={{ color: "var(--text-muted)" }}>
                Tech Stack
              </div>
              <div className="flex flex-wrap gap-1">
                {currentReveal.content.slice(0, 8).map((skill: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-1.5 py-0.5 border font-mono text-[9px]"
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
          
          {currentReveal.type === "impact" && currentReveal.content && (
            <div className="text-center">
              <div className="font-mono text-[10px] uppercase mb-2" style={{ color: "var(--text-muted)" }}>
                Impact Focus
              </div>
              <div className="font-mono text-lg font-bold mb-1" style={{ color: "var(--text-main)" }}>
                {currentReveal.content.label}: {currentReveal.content.value}%
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
      
      {/* Hint */}
      <div className="text-center mt-2 pt-2 border-t" style={{ borderColor: "var(--border-color)" }}>
        <div className="font-mono text-[9px]" style={{ color: "var(--text-muted)" }}>
          {revealIndex < reveals.length - 1 ? "Shoot again to reveal more →" : "✓ All info revealed"}
        </div>
      </div>
    </motion.div>
  );
}

