"use client";

import { motion } from "framer-motion";
import { ShootingGameState } from "./useShootingGame";

interface SkillsVisualizationProps {
  gameState: ShootingGameState;
  workExperiences: any[];
}

export function SkillsVisualization({ gameState, workExperiences }: SkillsVisualizationProps) {
  // Collect all skills from hit work experiences
  const hitExperiences = workExperiences.filter((work) =>
    gameState.targets.some((target) => target.workExperience.id === work.id && target.hit)
  );
  
  // Aggregate skills
  const skillCounts: Record<string, number> = {};
  hitExperiences.forEach((work) => {
    if (work.skills) {
      work.skills.forEach((skill: string) => {
        skillCounts[skill] = (skillCounts[skill] || 0) + 1;
      });
    }
  });
  
  // Sort by frequency
  const sortedSkills = Object.entries(skillCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10); // Top 10
  
  // Calculate total projects
  const totalProjects = hitExperiences.reduce((sum, work) => sum + (work.projects?.length || 0), 0);
  
  // Calculate total metrics
  const totalMetrics = hitExperiences.reduce((sum, work) => sum + (work.metrics?.length || 0), 0);
  
  return (
    <div
      className="fixed top-20 right-4 z-40 border-4 border-black bg-white shadow-[4px_4px_0_#000] p-4"
      style={{ minWidth: "250px", maxHeight: "calc(100vh - 120px)", overflowY: "auto" }}
    >
      <h3 className="font-mono text-sm font-bold uppercase mb-4" style={{ color: "var(--text-main)" }}>
        📊 Skills Dashboard
      </h3>
      
      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="p-2 text-center wireframe-border" style={{
          borderWidth: "var(--border-width)",
          borderColor: "var(--border-color)",
          backgroundColor: "var(--bg-main)",
        }}>
          <div className="font-mono text-xs uppercase mb-1" style={{ color: "var(--text-muted)" }}>
            Companies
          </div>
          <div className="font-mono text-xl font-bold" style={{ color: "var(--text-main)" }}>
            {hitExperiences.length}
          </div>
        </div>
        <div className="p-2 text-center wireframe-border" style={{
          borderWidth: "var(--border-width)",
          borderColor: "var(--border-color)",
          backgroundColor: "var(--bg-main)",
        }}>
          <div className="font-mono text-xs uppercase mb-1" style={{ color: "var(--text-muted)" }}>
            Projects
          </div>
          <div className="font-mono text-xl font-bold" style={{ color: "var(--text-main)" }}>
            {totalProjects}
          </div>
        </div>
      </div>
      
      {/* Top Skills */}
      {sortedSkills.length > 0 && (
        <div className="mb-4">
          <h4 className="font-mono text-xs uppercase mb-2" style={{ color: "var(--text-muted)" }}>
            Top Skills Discovered
          </h4>
          <div className="space-y-2">
            {sortedSkills.map(([skill, count], idx) => (
              <div key={skill} className="relative">
                <div className="font-mono text-xs mb-1" style={{ color: "var(--text-main)" }}>
                  {skill}
                </div>
                <div className="h-3 relative overflow-hidden wireframe-border" style={{
                  borderWidth: "var(--border-width)",
                  borderColor: "var(--border-color)",
                  backgroundColor: "var(--bg-main)",
                }}>
                  <motion.div
                    className="h-full"
                    style={{ 
                      width: `${(count / sortedSkills[0][1]) * 100}%`,
                      backgroundColor: "var(--accent-color)",
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${(count / sortedSkills[0][1]) * 100}%` }}
                    transition={{ delay: idx * 0.1, duration: 0.5 }}
                  />
                </div>
                <div className="font-mono text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                  Used in {count} {count === 1 ? "role" : "roles"}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Progress Indicator */}
      <div className="mt-4 pt-4" style={{ borderTopWidth: "var(--border-width)", borderColor: "var(--border-color)" }}>
        <div className="font-mono text-xs uppercase mb-2" style={{ color: "var(--text-muted)" }}>
          Discovery Progress
        </div>
        <div className="h-4 relative overflow-hidden wireframe-border" style={{
          borderWidth: "var(--border-width)",
          borderColor: "var(--border-color)",
          backgroundColor: "var(--bg-main)",
        }}>
          <motion.div
            className="h-full"
            style={{
              width: `${(hitExperiences.length / workExperiences.length) * 100}%`,
              backgroundColor: "var(--accent-color)",
            }}
            initial={{ width: 0 }}
            animate={{
              width: `${(hitExperiences.length / workExperiences.length) * 100}%`,
            }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <div className="font-mono text-xs mt-1 text-center" style={{ color: "var(--text-main)" }}>
          {hitExperiences.length} / {workExperiences.length} Companies
        </div>
      </div>
    </div>
  );
}

