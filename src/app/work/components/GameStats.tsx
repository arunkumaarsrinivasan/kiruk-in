"use client";

import { motion } from "framer-motion";
import { ShootingGameState } from "./useShootingGame";

interface GameStatsProps {
  gameState: ShootingGameState;
}

export function GameStats({ gameState }: GameStatsProps) {
  return (
    <div
      className="fixed top-20 left-4 z-40 border-4 border-black bg-white shadow-[4px_4px_0_#000] p-4"
      style={{ minWidth: "200px" }}
    >
      {/* Score */}
      <div className="mb-4">
        <div className="font-mono text-xs text-gray-600 uppercase mb-1">
          Score
        </div>
        <div className="font-mono text-3xl font-bold text-black">
          {gameState.score.toLocaleString()}
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <div className="font-mono text-xs text-gray-600 uppercase mb-1">
            Hits
          </div>
          <div className="font-mono text-xl font-bold text-green-600">
            {gameState.hits}
          </div>
        </div>
        <div>
          <div className="font-mono text-xs text-gray-600 uppercase mb-1">
            Shots
          </div>
          <div className="font-mono text-xl font-bold text-black">
            {gameState.shots}
          </div>
        </div>
        <div>
          <div className="font-mono text-xs text-gray-600 uppercase mb-1">
            Accuracy
          </div>
          <div className="font-mono text-xl font-bold text-blue-600">
            {gameState.accuracy.toFixed(1)}%
          </div>
        </div>
        <div>
          <div className="font-mono text-xs text-gray-600 uppercase mb-1">
            Level
          </div>
          <div className="font-mono text-xl font-bold text-purple-600">
            {gameState.currentLevel}/{gameState.maxLevel}
          </div>
        </div>
      </div>
      
      {/* Combo */}
      {gameState.combo > 0 && (
        <motion.div
          className="mb-4 p-2 bg-yellow-400 border-2 border-black"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
        >
          <div className="font-mono text-xs text-black uppercase mb-1">
            Combo
          </div>
          <div className="font-mono text-2xl font-bold text-black">
            {gameState.combo}x
          </div>
          <div className="font-mono text-xs text-black">
            {gameState.multiplier.toFixed(1)}x Multiplier
          </div>
        </motion.div>
      )}
      
      {/* Time */}
      <div>
        <div className="font-mono text-xs text-gray-600 uppercase mb-1">
          Time Remaining
        </div>
        <div className="font-mono text-xl font-bold text-red-600">
          {Math.floor(gameState.timeRemaining / 60)}:
          {String(Math.floor(gameState.timeRemaining % 60)).padStart(2, "0")}
        </div>
      </div>
      
      {/* Power Bar */}
      {gameState.isCharging && (
        <div className="mt-4">
          <div className="font-mono text-xs text-gray-600 uppercase mb-1">
            Power
          </div>
          <div className="h-4 border-2 border-black bg-gray-200 relative overflow-hidden">
            <motion.div
              className="h-full bg-green-500"
              style={{ width: `${gameState.power * 100}%` }}
              initial={{ width: 0 }}
              animate={{ width: `${gameState.power * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

