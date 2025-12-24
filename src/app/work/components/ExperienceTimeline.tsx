"use client";

import { motion } from "framer-motion";
import { ShootingGameState, WorkTarget } from "./useShootingGame";

interface ExperienceTimelineProps {
  workExperiences: any[];
  gameState: ShootingGameState;
  currentTarget?: WorkTarget | null;
}

export function ExperienceTimeline({ 
  workExperiences, 
  gameState, 
  currentTarget 
}: ExperienceTimelineProps) {
  // Calculate progress for each experience
  const getExperienceProgress = (index: number) => {
    const levelIndex = index + 1;
    
    if (levelIndex < gameState.currentLevel) {
      return 1; // Completed
    } else if (levelIndex === gameState.currentLevel) {
      const target = gameState.targets[0];
      if (target && target.workExperience.id === workExperiences[index].id) {
        return target.hitCount / target.maxHits;
      }
      return 0;
    } else {
      return 0; // Locked
    }
  };

  const getExperienceStatus = (index: number) => {
    const levelIndex = index + 1;
    
    if (levelIndex < gameState.currentLevel) {
      return 'completed';
    } else if (levelIndex === gameState.currentLevel) {
      const target = gameState.targets[0];
      if (target && target.hit) {
        return 'completed';
      }
      return 'active';
    } else {
      return 'locked';
    }
  };

  // Extract year from period string
  const getYearFromPeriod = (period: string) => {
    const yearMatch = period.match(/\d{4}/);
    if (yearMatch) {
      const startYear = yearMatch[0];
      if (period.includes('Present')) {
        return `${startYear} - Present`;
      }
      const endYearMatch = period.match(/\d{4}/g);
      if (endYearMatch && endYearMatch.length > 1) {
        return `${endYearMatch[0]} - ${endYearMatch[1]}`;
      }
      return startYear;
    }
    return '';
  };

  const GRID_SIZE = 20; // Match design system grid size
  const SEGMENT_HEIGHT = GRID_SIZE * 3; // 3 grid units = 60px

  return (
    <div 
      className="absolute z-30 pointer-events-none w-full left-0"
      style={{
        top: "130px", // Right after progress bars/objectives section (header ~64px + progress bars ~109px, no gap)
      }}
    >
      <div className="relative w-full">
        {/* Year labels above segments */}
        <div className="flex w-full mb-1">
          {workExperiences.map((experience, index) => {
            const status = getExperienceStatus(index);
            const isLocked = status === 'locked';
            const yearText = getYearFromPeriod(experience.period);
            
            return (
              <div
                key={`year-${experience.id}`}
                className="flex-1 text-center"
              >
                <div
                  className="font-mono text-[9px] font-bold"
                  style={{
                    color: "var(--accent-color)",
                    opacity: isLocked ? 0.4 : 1,
                    imageRendering: "pixelated" as any,
                  }}
                >
                  {yearText}
                </div>
                {/* Segment number */}
                <div
                  className="font-mono text-[8px] mt-0.5"
                  style={{
                    color: "var(--text-muted)",
                    opacity: isLocked ? 0.4 : 1,
                  }}
                >
                  {index + 1}
                </div>
              </div>
            );
          })}
        </div>

        {/* Segmented Progress Bar */}
        <div className="relative w-full" style={{ height: `${SEGMENT_HEIGHT}px` }}>
          <div className="flex h-full w-full">
            {workExperiences.map((experience, index) => {
              const status = getExperienceStatus(index);
              const progress = getExperienceProgress(index);
              const isActive = status === 'active';
              const isCompleted = status === 'completed';
              const isLocked = status === 'locked';
              
              return (
                <motion.div
                  key={experience.id}
                  className="relative flex-1 border-r-2 border-black"
                  style={{
                    borderColor: "var(--border-color)",
                    imageRendering: "pixelated" as any,
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  {/* Segment background */}
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundColor: isCompleted 
                        ? "var(--accent-color)" 
                        : isLocked 
                        ? "var(--bg-main)" 
                        : "var(--bg-card)",
                      opacity: isLocked ? 0.3 : 1,
                      imageRendering: "pixelated" as any,
                    }}
                  >
                    {/* Grid pattern */}
                    {!isCompleted && (
                      <div
                        className="absolute inset-0 opacity-20"
                        style={{
                          backgroundImage: `
                            linear-gradient(var(--accent-color) 1px, transparent 1px),
                            linear-gradient(90deg, var(--accent-color) 1px, transparent 1px)
                          `,
                          backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
                          imageRendering: "pixelated" as any,
                        }}
                      />
                    )}

                    {/* Progress fill for active segment */}
                    {isActive && progress > 0 && (
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 border-t-2 border-black"
                        style={{
                          backgroundColor: "var(--accent-color)",
                          imageRendering: "pixelated" as any,
                        }}
                        initial={{ height: 0 }}
                        animate={{ height: `${progress * 100}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    )}
                  </div>

                  {/* Segment content */}
                  <div className="relative h-full flex flex-col items-center justify-center px-2">
                    {/* Status indicator */}
                    <div className="mb-1">
                      {isCompleted ? (
                        <motion.div
                          className="font-mono text-xl font-bold"
                          style={{ color: "var(--bg-main)" }}
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: "spring", stiffness: 200 }}
                        >
                          ✓
                        </motion.div>
                      ) : isActive ? (
                        <motion.div
                          className="font-mono text-lg"
                          style={{ color: "var(--accent-color)" }}
                          animate={{ 
                            scale: [1, 1.2, 1],
                          }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          ●
                        </motion.div>
                      ) : (
                        <div className="font-mono text-lg" style={{ opacity: 0.3 }}>
                            ○
                        </div>
                      )}
                    </div>

                    {/* Company name */}
                    <div
                      className="font-mono text-[9px] sm:text-[10px] font-bold uppercase text-center leading-tight"
                      style={{
                        color: isActive 
                          ? "var(--accent-color)" 
                          : isCompleted 
                          ? "var(--bg-main)" 
                          : "var(--text-muted)",
                        opacity: isLocked ? 0.5 : 1,
                        imageRendering: "pixelated" as any,
                      }}
                      title={experience.company}
                    >
                      {experience.company}
                    </div>

                    {/* Progress percentage for active */}
                    {isActive && progress > 0 && (
                      <motion.div
                        className="font-mono text-[8px] mt-0.5"
                        style={{ color: "var(--accent-color)" }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        {Math.round(progress * 100)}%
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
