"use client";

import { motion, AnimatePresence } from "framer-motion";
import { WorkTarget } from "./useShootingGame";

interface DetailsPanelProps {
  target: WorkTarget | null;
  hitCount: number;
}

export function DetailsPanel({ target, hitCount }: DetailsPanelProps) {
  if (!target) return null;

  const work = target.workExperience;
  const achievements = work.metrics || [];
  const skills = work.skills || [];

  // Create info boxes with different types
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

  // Show boxes progressively based on hit count
  const visibleCount = Math.min(hitCount, infoBoxes.length);

  return (
    <div
      className="absolute right-0 top-16 bottom-0 w-80 z-30 overflow-y-auto"
      style={{
        backgroundColor: "var(--bg-card)",
        borderLeft: "2px solid var(--border-color)",
      }}
    >
      {/* Header */}
      <div
        className="sticky top-0 p-4 border-b-2"
        style={{
          backgroundColor: "var(--bg-card)",
          borderColor: "var(--border-color)",
        }}
      >
        <div className="font-mono text-xs uppercase mb-1" style={{ color: "var(--text-muted)" }}>
          Target Intel
        </div>
        <div className="font-mono text-lg font-bold" style={{ color: "var(--text-main)" }}>
          {work.company}
        </div>
        <div className="font-mono text-xs" style={{ color: "var(--accent-color)" }}>
          {work.title || work.role}
        </div>
        
        {/* Progress bar */}
        <div className="mt-3">
          <div className="flex justify-between mb-1">
            <span className="font-mono text-[10px]" style={{ color: "var(--text-muted)" }}>
              DATA COLLECTED
            </span>
            <span className="font-mono text-[10px] font-bold" style={{ color: "var(--accent-color)" }}>
              {hitCount}/{target.maxHits}
            </span>
          </div>
          <div
            className="h-2"
            style={{
              backgroundColor: "var(--bg-main)",
              border: "1px solid var(--border-color)",
            }}
          >
            <motion.div
              className="h-full"
              style={{ backgroundColor: "var(--accent-color)" }}
              initial={{ width: 0 }}
              animate={{ width: `${(hitCount / target.maxHits) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>

      {/* Info boxes grid */}
      <div className="p-4 space-y-3">
        <AnimatePresence>
          {infoBoxes.slice(0, visibleCount).map((box, idx) => (
            <motion.div
              key={`info-box-${idx}`}
              className="p-3"
              style={{
                border: "1px solid var(--border-color)",
                backgroundColor: "var(--bg-main)",
              }}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: idx * 0.05, duration: 0.2 }}
            >
              {/* Header */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-base">{box.icon}</span>
                <div
                  className="font-mono text-[10px] uppercase font-bold"
                  style={{ color: box.color }}
                >
                  {box.type}
                </div>
              </div>

              {/* Content */}
              <div className="space-y-1">
                {box.data.map((item: string, itemIdx: number) => (
                  <div
                    key={itemIdx}
                    className="font-mono text-xs"
                    style={{ color: "var(--text-main)" }}
                  >
                    {item}
                  </div>
                ))}
              </div>

              {/* Progress dots */}
              <div className="flex gap-1 mt-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5"
                    style={{
                      border: "1px solid var(--border-color)",
                      backgroundColor: i <= idx + 1 ? box.color : "transparent",
                    }}
                  />
                ))}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Empty state */}
        {visibleCount === 0 && (
          <div className="text-center py-8">
            <div className="font-mono text-sm mb-2" style={{ color: "var(--text-muted)" }}>
              🎯 HIT THE TARGET
            </div>
            <div className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>
              Each hit reveals more intel
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
