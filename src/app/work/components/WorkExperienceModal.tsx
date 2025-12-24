"use client";

import { motion, AnimatePresence } from "framer-motion";
import { WorkTarget } from "./useShootingGame";

interface WorkExperienceModalProps {
  target: WorkTarget | null;
  isOpen: boolean;
  onClose: () => void;
}

export function WorkExperienceModal({ target, isOpen, onClose }: WorkExperienceModalProps) {
  if (!target) return null;
  
  const work = target.workExperience;
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="max-w-2xl w-full max-h-[90vh] overflow-y-auto wireframe-border"
            style={{
              borderWidth: "var(--border-width)",
              borderColor: "var(--border-color)",
              backgroundColor: "var(--bg-card)",
              boxShadow: "var(--shadow-offset-x) var(--shadow-offset-y) var(--shadow-blur) var(--shadow-color)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 wireframe-border" style={{
              borderBottomWidth: "var(--border-width)",
              borderColor: "var(--border-color)",
              backgroundColor: "var(--accent-color)",
            }}>
              <div className="flex items-center gap-4">
                <div className="text-4xl">🎯</div>
                <div>
                  <h3 className="font-mono text-2xl font-bold" style={{ color: "var(--bg-main)" }}>
                    {work.title}
                  </h3>
                  <p className="font-mono text-sm" style={{ color: "var(--bg-main)", opacity: 0.8 }}>
                    {work.company} · {work.location}
                  </p>
                  <p className="font-mono text-xs mt-1" style={{ color: "var(--bg-main)", opacity: 0.8 }}>
                    {work.period} ({work.duration})
                  </p>
                </div>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-6">
              {/* Summary */}
              <div className="mb-6">
                <p className="font-mono text-base text-gray-800 leading-relaxed">
                  {work.summary}
                </p>
              </div>
              
              {/* Metrics */}
              {work.metrics && (
                <div className="grid grid-cols-3 gap-2 mb-6">
                  {work.metrics.map((metric: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3 text-center wireframe-border"
                      style={{
                        borderWidth: "var(--border-width)",
                        borderColor: "var(--border-color)",
                        backgroundColor: "var(--bg-main)",
                      }}
                    >
                      <p className="font-mono text-xl font-bold" style={{ color: "var(--text-main)" }}>
                        {metric.value}
                      </p>
                      <p className="font-mono text-xs uppercase" style={{ color: "var(--text-muted)" }}>
                        {metric.label}
                      </p>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Projects */}
              {work.projects && (
                <div className="mb-6">
                  <h4 className="font-mono text-sm font-bold uppercase mb-3" style={{ color: "var(--text-main)" }}>
                    Key Projects
                  </h4>
                  <div className="space-y-2">
                    {work.projects.map((project: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-3 wireframe-border"
                        style={{
                          borderWidth: "var(--border-width)",
                          borderColor: "var(--border-color)",
                          backgroundColor: "var(--bg-main)",
                        }}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h5 className="font-mono text-sm font-bold" style={{ color: "var(--text-main)" }}>
                            {project.title}
                          </h5>
                          <span className="font-mono text-xs uppercase" style={{ color: "var(--text-muted)" }}>
                            {project.role}
                          </span>
                        </div>
                        <p className="font-mono text-xs mb-2" style={{ color: "var(--text-main)" }}>
                          {project.desc}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {project.tech.map((tech: string, techIdx: number) => (
                            <span
                              key={techIdx}
                              className="px-2 py-1 font-mono text-xs"
                              style={{
                                backgroundColor: "var(--text-main)",
                                color: "var(--bg-main)",
                              }}
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Skills */}
              {work.skills && (
                <div className="mb-6">
                  <h4 className="font-mono text-sm font-bold uppercase mb-3" style={{ color: "var(--text-main)" }}>
                    Tech Stack
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {work.skills.map((skill: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-3 py-1 font-mono text-xs wireframe-border"
                        style={{
                          borderWidth: "var(--border-width)",
                          borderColor: "var(--border-color)",
                          backgroundColor: "var(--bg-main)",
                          color: "var(--text-main)",
                        }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Spotlight */}
              {work.spotlight && (
                <div className="p-4 wireframe-border" style={{
                  borderWidth: "var(--border-width)",
                  borderColor: "var(--border-color)",
                  backgroundColor: "var(--bg-main)",
                }}>
                  <h4 className="font-mono text-sm font-bold uppercase mb-2" style={{ color: "var(--text-main)" }}>
                    ⭐ Spotlight: {work.spotlight.title}
                  </h4>
                  <p className="font-mono text-xs mb-2" style={{ color: "var(--text-main)" }}>
                    {work.spotlight.summary}
                  </p>
                  <div className="flex gap-4 text-xs">
                    <span className="font-mono">
                      <strong>Result:</strong> {work.spotlight.result}
                    </span>
                    <span className="font-mono">
                      <strong>Audience:</strong> {work.spotlight.audience}
                    </span>
                  </div>
                </div>
              )}
            </div>
            
            {/* Footer */}
            <div className="p-4 flex justify-center" style={{ borderTopWidth: "var(--border-width)", borderColor: "var(--border-color)" }}>
              <button
                onClick={onClose}
                className="px-8 py-3 font-mono text-xl transition-all wireframe-btn"
                style={{
                  borderWidth: "var(--border-width)",
                  borderColor: "var(--border-color)",
                  backgroundColor: "var(--accent-color)",
                  color: "var(--bg-main)",
                  boxShadow: "var(--shadow-offset-x) var(--shadow-offset-y) var(--shadow-blur) var(--shadow-color)",
                }}
              >
                CONTINUE GAME ▶
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

