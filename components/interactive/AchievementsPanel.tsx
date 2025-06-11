import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SketchHeading } from '../ui/sketch-elements';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
}

interface AchievementsPanelProps {
  show: boolean;
  onClose: () => void;
  achievements: Achievement[];
}

export const AchievementsPanel: React.FC<AchievementsPanelProps> = ({ show, onClose, achievements }) => (
  <AnimatePresence>
    {show && (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        onClick={onClose}
      >
        <motion.div
          className="bg-white border-2 border-black rounded-lg p-6 max-w-md w-full mx-4 sketch-border"
          onClick={e => e.stopPropagation()}
        >
          <SketchHeading level={2} className="text-xl mb-4 text-center">
            🏆 Achievements
          </SketchHeading>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {achievements.map((achievement) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`p-3 rounded-lg border-2 ${
                  achievement.unlocked
                    ? 'bg-green-50 border-green-200'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`text-2xl ${achievement.unlocked ? '' : 'grayscale'}`}>
                    {achievement.icon}
                  </span>
                  <div className="flex-1">
                    <div className={`font-bold ${achievement.unlocked ? 'text-green-800' : 'text-gray-500'}`}>{achievement.title}</div>
                    <div className={`text-sm ${achievement.unlocked ? 'text-green-600' : 'text-gray-400'}`}>{achievement.description}</div>
                  </div>
                  {achievement.unlocked && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-green-500 text-xl"
                    >
                      ✓
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
          <button
            onClick={onClose}
            className="w-full mt-4 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);
