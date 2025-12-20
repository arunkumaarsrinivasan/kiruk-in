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
      <h3 className="font-mono text-sm font-bold text-black uppercase mb-4">
        📊 Skills Dashboard
      </h3>
      
      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="bg-gray-100 border-2 border-black p-2 text-center">
          <div className="font-mono text-xs text-gray-600 uppercase mb-1">
            Companies
          </div>
          <div className="font-mono text-xl font-bold text-black">
            {hitExperiences.length}
          </div>
        </div>
        <div className="bg-gray-100 border-2 border-black p-2 text-center">
          <div className="font-mono text-xs text-gray-600 uppercase mb-1">
            Projects
          </div>
          <div className="font-mono text-xl font-bold text-black">
            {totalProjects}
          </div>
        </div>
      </div>
      
      {/* Top Skills */}
      {sortedSkills.length > 0 && (
        <div className="mb-4">
          <h4 className="font-mono text-xs text-gray-600 uppercase mb-2">
            Top Skills Discovered
          </h4>
          <div className="space-y-2">
            {sortedSkills.map(([skill, count], idx) => (
              <div key={skill} className="relative">
                <div className="font-mono text-xs text-black mb-1">
                  {skill}
                </div>
                <div className="h-3 border-2 border-black bg-gray-200 relative overflow-hidden">
                  <motion.div
                    className="h-full bg-blue-500"
                    style={{ width: `${(count / sortedSkills[0][1]) * 100}%` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${(count / sortedSkills[0][1]) * 100}%` }}
                    transition={{ delay: idx * 0.1, duration: 0.5 }}
                  />
                </div>
                <div className="font-mono text-xs text-gray-600 mt-1">
                  Used in {count} {count === 1 ? "role" : "roles"}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Progress Indicator */}
      <div className="mt-4 pt-4 border-t-2 border-black">
        <div className="font-mono text-xs text-gray-600 uppercase mb-2">
          Discovery Progress
        </div>
        <div className="h-4 border-2 border-black bg-gray-200 relative overflow-hidden">
          <motion.div
            className="h-full bg-green-500"
            style={{
              width: `${(hitExperiences.length / workExperiences.length) * 100}%`,
            }}
            initial={{ width: 0 }}
            animate={{
              width: `${(hitExperiences.length / workExperiences.length) * 100}%`,
            }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <div className="font-mono text-xs text-black mt-1 text-center">
          {hitExperiences.length} / {workExperiences.length} Companies
        </div>
      </div>
    </div>
  );
}

