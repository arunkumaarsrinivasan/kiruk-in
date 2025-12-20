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
            className="bg-white max-w-2xl w-full border-4 border-black shadow-[8px_8px_0_#000] max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.8, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 50 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-yellow-400 border-b-4 border-black p-4">
              <div className="flex items-center gap-4">
                <div className="text-4xl">🎯</div>
                <div>
                  <h3 className="font-mono text-2xl font-bold text-black">
                    {work.title}
                  </h3>
                  <p className="font-mono text-sm text-black/60">
                    {work.company} · {work.location}
                  </p>
                  <p className="font-mono text-xs text-black/60 mt-1">
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
                      className="bg-gray-100 border-2 border-black p-3 text-center"
                    >
                      <p className="font-mono text-xl font-bold text-black">
                        {metric.value}
                      </p>
                      <p className="font-mono text-xs text-gray-600 uppercase">
                        {metric.label}
                      </p>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Projects */}
              {work.projects && (
                <div className="mb-6">
                  <h4 className="font-mono text-sm font-bold text-black uppercase mb-3">
                    Key Projects
                  </h4>
                  <div className="space-y-2">
                    {work.projects.map((project: any, idx: number) => (
                      <div
                        key={idx}
                        className="bg-gray-100 border-2 border-black p-3"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h5 className="font-mono text-sm font-bold text-black">
                            {project.title}
                          </h5>
                          <span className="font-mono text-xs text-gray-600 uppercase">
                            {project.role}
                          </span>
                        </div>
                        <p className="font-mono text-xs text-gray-700 mb-2">
                          {project.desc}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {project.tech.map((tech: string, techIdx: number) => (
                            <span
                              key={techIdx}
                              className="px-2 py-1 bg-black text-white font-mono text-xs"
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
                  <h4 className="font-mono text-sm font-bold text-black uppercase mb-3">
                    Tech Stack
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {work.skills.map((skill: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-gray-200 border-2 border-black text-black font-mono text-xs"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Spotlight */}
              {work.spotlight && (
                <div className="bg-yellow-100 border-2 border-black p-4">
                  <h4 className="font-mono text-sm font-bold text-black uppercase mb-2">
                    ⭐ Spotlight: {work.spotlight.title}
                  </h4>
                  <p className="font-mono text-xs text-gray-700 mb-2">
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
            <div className="border-t-4 border-black p-4 flex justify-center">
              <button
                onClick={onClose}
                className="px-8 py-3 bg-green-500 text-white font-mono text-xl border-4 border-black shadow-[4px_4px_0_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_#000] transition-all"
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

