"use client";

import { ShootingGameState, WorkTarget } from "./useShootingGame";

interface GameStatsProps {
  gameState: ShootingGameState;
  currentTarget?: WorkTarget | null;
}

export function GameStats({ gameState, currentTarget }: GameStatsProps) {
  const currentWork = currentTarget?.workExperience || gameState.targets[0]?.workExperience;
  
  return (
    <div
      className="absolute z-40 border border-[var(--border-color)] bg-[var(--bg-card)] grid-p-1"
      style={{ 
        width: "200px", // 10 * 20px
        bottom: "20px", // 1 * 20px
        left: "20px",   // 1 * 20px
      }}
    >
      {/* Grid background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(var(--border-color) 1px, transparent 1px),
            linear-gradient(90deg, var(--border-color) 1px, transparent 1px)
          `,
          backgroundSize: "20px 20px",
        }}
      />
      {/* Compact Stats Grid */}
      <div className="relative grid grid-cols-2 gap-2 mb-2">
        <div>
          <div className="font-mono text-[9px] text-[var(--text-muted)] uppercase mb-0.5">
            Level
          </div>
          <div className="font-mono text-base font-bold text-[var(--text-main)]">
            {gameState.currentLevel}/{gameState.maxLevel}
          </div>
        </div>
        <div>
          <div className="font-mono text-[9px] text-[var(--text-muted)] uppercase mb-0.5">
            Progress
          </div>
          <div className="font-mono text-base font-bold text-[var(--accent-color)]">
            {gameState.targets[0]?.hitCount || 0}/{gameState.targets[0]?.maxHits || 5}
          </div>
        </div>
        <div>
          <div className="font-mono text-[9px] text-[var(--text-muted)] uppercase mb-0.5">
            Score
          </div>
          <div className="font-mono text-base font-bold text-[var(--text-main)]">
            {gameState.score.toLocaleString()}
          </div>
        </div>
        <div>
          <div className="font-mono text-[9px] text-[var(--text-muted)] uppercase mb-0.5">
            Accuracy
          </div>
          <div className="font-mono text-base font-bold text-[var(--accent-color)]">
            {gameState.accuracy.toFixed(0)}%
          </div>
        </div>
      </div>
      
      {/* Time */}
      <div className="relative pt-2 border-t border-[var(--border-color)]">
        <div className="font-mono text-[9px] text-[var(--text-muted)] uppercase mb-0.5">
          Time
        </div>
        <div className="font-mono text-sm font-bold text-[var(--text-main)]">
          {Math.floor(gameState.timeRemaining / 60)}:
          {String(Math.floor(gameState.timeRemaining % 60)).padStart(2, "0")}
        </div>
      </div>
      
      {/* Combo - Compact */}
      {gameState.combo > 0 && (
        <div className="relative mt-2 pt-2 border-t border-[var(--border-color)]">
          <div className="font-mono text-[9px] text-[var(--text-muted)] uppercase mb-0.5">
            Combo
          </div>
          <div className="font-mono text-sm font-bold text-[var(--accent-color)]">
            {gameState.combo}x
          </div>
        </div>
      )}
      
      {/* Power Bar - Compact */}
      {gameState.isCharging && (
        <div className="relative mt-2 pt-2 border-t border-[var(--border-color)]">
          <div className="font-mono text-[9px] text-[var(--text-muted)] uppercase mb-0.5">
            Power
          </div>
          <div className="h-2 border border-[var(--border-color)] bg-[var(--bg-main)] relative overflow-hidden">
            <div
              className="h-full bg-[var(--accent-color)]"
              style={{ width: `${gameState.power * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

