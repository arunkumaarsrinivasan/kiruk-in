'use client';

import { motion } from 'framer-motion';
import { BombState } from './useBombDefusal';

interface BombInterfaceProps {
  bombState: BombState;
  onModuleClick: (moduleId: string) => void;
}

export function BombInterface({ bombState, onModuleClick }: BombInterfaceProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeColor = () => {
    if (bombState.timeRemaining < 60) return 'text-red-500';
    if (bombState.timeRemaining < 120) return 'text-orange-500';
    return 'text-green-500';
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto p-6">
      {/* Bomb Case */}
      <div className="bg-gradient-to-b from-gray-800 to-gray-900 border-4 border-gray-700 rounded-lg p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-gray-600">
          <div className="flex items-center gap-4">
            <div className="text-4xl">💣</div>
            <div>
              <h2 className="text-2xl font-bold text-white font-mono">BOMB DEFUSAL</h2>
              <p className="text-sm text-gray-400">Solve all modules to defuse</p>
            </div>
          </div>
          
          {/* Timer */}
          <div className="text-right">
            <div className={`text-3xl font-mono font-bold ${getTimeColor()}`}>
              {formatTime(bombState.timeRemaining)}
            </div>
            <div className="text-xs text-gray-400 mt-1">Time Remaining</div>
          </div>
        </div>

        {/* Strikes */}
        <div className="flex items-center gap-2 mb-6">
          <span className="text-white font-mono text-sm">Strikes:</span>
          {Array.from({ length: bombState.maxStrikes }).map((_, i) => (
            <div
              key={i}
              className={`w-8 h-8 rounded-full border-2 ${
                i < bombState.strikes
                  ? 'bg-red-600 border-red-400'
                  : 'bg-gray-700 border-gray-500'
              }`}
            />
          ))}
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {bombState.modules.map((module, index) => (
            <motion.button
              key={module.id}
              onClick={() => onModuleClick(module.id)}
              disabled={!module.isActive || module.isSolved}
              className={`
                relative p-4 rounded border-2 transition-all
                ${module.isSolved
                  ? 'bg-green-900 border-green-500 cursor-default'
                  : module.isActive
                  ? 'bg-yellow-900 border-yellow-500 hover:bg-yellow-800 cursor-pointer'
                  : 'bg-gray-800 border-gray-600 cursor-not-allowed opacity-50'
                }
              `}
              whileHover={module.isActive && !module.isSolved ? { scale: 1.05 } : {}}
              whileTap={module.isActive && !module.isSolved ? { scale: 0.95 } : {}}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white font-mono font-bold text-lg">
                    MODULE {index + 1}
                  </div>
                  <div className="text-gray-400 text-xs mt-1">
                    {module.type.toUpperCase()}
                  </div>
                </div>
                <div className="text-2xl">
                  {module.isSolved ? '✓' : module.isActive ? '⚡' : '○'}
                </div>
              </div>
              
              {module.isSolved && (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute inset-0 flex items-center justify-center bg-green-500/20"
                >
                  <span className="text-4xl">✓</span>
                </motion.div>
              )}
            </motion.button>
          ))}
        </div>

        {/* Progress */}
        <div className="bg-gray-800 rounded p-3">
          <div className="flex items-center justify-between text-sm text-gray-300 mb-2">
            <span>Progress</span>
            <span>{bombState.solvedModules} / {bombState.modules.length} modules solved</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <motion.div
              className="bg-green-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(bombState.solvedModules / bombState.modules.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
