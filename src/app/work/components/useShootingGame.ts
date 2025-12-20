"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface WorkTarget {
  id: string;
  x: number; // Position on screen (0-100%)
  y: number; // Position on screen (0-100%)
  radius: number; // Size of target
  workExperience: any; // Work experience data
  hit: boolean;
  hitCount: number; // How many times this target has been hit (for progressive reveal)
  maxHits: number; // How many hits needed to fully reveal
  points: number;
  speed: number; // Movement speed for moving targets
  direction?: { x: number; y: number }; // Movement direction
  type: 'normal' | 'bonus' | 'boss'; // Target type for game mechanics
}

export interface ShootingGameState {
  isPlaying: boolean;
  isPaused: boolean;
  isGameOver: boolean;
  isLevelComplete: boolean;
  score: number;
  targets: WorkTarget[];
  shots: number;
  hits: number;
  accuracy: number;
  currentLevel: number;
  maxLevel: number;
  timeRemaining: number;
  crosshairX: number;
  crosshairY: number;
  power: number; // Shooting power/charge
  isCharging: boolean;
  isAiming: boolean; // For sniper scope sway
  combo: number;
  multiplier: number;
  bullets: Array<{ id: string; x: number; y: number; vx: number; vy: number; life: number }>; // Bullet physics
}

interface UseShootingGameProps {
  workExperiences: any[];
  onTargetHit?: (target: WorkTarget) => void;
  onLevelComplete?: () => void;
  gameDuration?: number; // seconds
}

export function useShootingGame({
  workExperiences,
  onTargetHit,
  onLevelComplete,
  gameDuration = 120, // 2 minutes default
}: UseShootingGameProps) {
  const gameLoopRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const crosshairRef = useRef<{ x: number; y: number }>({ x: 50, y: 50 });
  const chargeStartTimeRef = useRef<number | null>(null);
  
  const [gameState, setGameState] = useState<ShootingGameState>({
    isPlaying: false,
    isPaused: false,
    isGameOver: false,
    isLevelComplete: false,
    score: 0,
    targets: [],
    shots: 0,
    hits: 0,
    accuracy: 0,
    currentLevel: 1,
    maxLevel: workExperiences.length,
    timeRemaining: gameDuration,
    crosshairX: 50,
    crosshairY: 50,
    power: 0,
    isCharging: false,
    isAiming: false,
    combo: 0,
    multiplier: 1,
    bullets: [],
  });

  // Generate single target per level (one company at a time - sniper game style)
  const generateTargets = useCallback((level: number = 1): WorkTarget[] => {
    const workIndex = level - 1;
    if (workIndex >= workExperiences.length) {
      return []; // All levels completed
    }
    
    const work = workExperiences[workIndex];
    
    // Single target in center - sniper style
    return [{
      id: `target-${work.id}-level-${level}`,
      x: 50, // Center
      y: 50, // Center
      radius: 60, // Larger target for sniper game
      workExperience: work,
      hit: false,
      hitCount: 0,
      maxHits: 5, // 5 hits to fully reveal
      points: 100 * level,
      speed: 0,
      direction: undefined,
      type: 'normal',
    }];
  }, [workExperiences]);

  // Start game
  const startGame = useCallback(() => {
    const targets = generateTargets(1);
    
    setGameState({
      isPlaying: true,
      isPaused: false,
      isGameOver: false,
      isLevelComplete: false,
      score: 0,
      targets,
      shots: 0,
      hits: 0,
      accuracy: 0,
      currentLevel: 1,
      maxLevel: workExperiences.length,
      timeRemaining: gameDuration,
      crosshairX: 50,
      crosshairY: 50,
      power: 0,
      isCharging: false,
      isAiming: false,
      combo: 0,
      multiplier: 1,
      bullets: [],
    });
    
    lastTimeRef.current = performance.now();
  }, [generateTargets, gameDuration, workExperiences.length]);

  // Pause/Resume
  const togglePause = useCallback(() => {
    setGameState((prev) => ({ ...prev, isPaused: !prev.isPaused }));
  }, []);

  // Update crosshair position
  const updateCrosshair = useCallback((x: number, y: number) => {
    crosshairRef.current = { x, y };
    setGameState((prev) => ({ 
      ...prev, 
      crosshairX: x, 
      crosshairY: y,
      isAiming: true, // Set aiming when mouse moves
    }));
  }, []);

  // Start charging shot
  const startCharge = useCallback(() => {
    if (!gameState.isPlaying || gameState.isPaused) return;
    chargeStartTimeRef.current = performance.now();
    setGameState((prev) => ({ ...prev, isCharging: true, isAiming: true }));
  }, [gameState.isPlaying, gameState.isPaused]);

  // Shoot with physics
  const shoot = useCallback(() => {
    if (!gameState.isPlaying || gameState.isPaused) return;
    
    const chargeTime = chargeStartTimeRef.current 
      ? (performance.now() - chargeStartTimeRef.current) / 1000 
      : 0;
    chargeStartTimeRef.current = null;
    
    const power = Math.min(1, chargeTime / 2); // Max charge at 2 seconds
    const shotRadiusPixels = 15 + power * 25; // Smaller, more precise for sniper
    const shotRadius = typeof window !== 'undefined' ? (shotRadiusPixels / window.innerWidth) * 100 : 2;
    
    // Create bullet with physics
    const bulletId = `bullet-${Date.now()}-${Math.random()}`;
    const bulletSpeed = 0.5 + power * 0.3; // Bullet speed based on power
    const bullet = {
      id: bulletId,
      x: gameState.crosshairX,
      y: gameState.crosshairY,
      vx: 0, // Bullet travels straight (sniper precision)
      vy: 0,
      life: 0.3, // Bullet lifetime in seconds
    };
    
    setGameState((prev) => {
      let hitTarget: WorkTarget | null = null;
      let newCombo = prev.combo;
      let newMultiplier = prev.multiplier;
      
      // Check if shot hits any target
      const updatedTargets = prev.targets.map((target) => {
        // Calculate distance from crosshair to target center (both in percentage)
        const dx = prev.crosshairX - target.x;
        const dy = prev.crosshairY - target.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Convert target radius from pixels to percentage
        const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1920;
        const targetSizePx = 80; // gridSize (20) * pixelSize (4)
        const targetRadiusPercent = (targetSizePx / screenWidth) * 100;
        
        // shotRadius is already in percentage
        if (distance <= shotRadius + targetRadiusPercent) {
          // Increment hit count for progressive reveal
          const newHitCount = target.hitCount + 1;
          const isFullyHit = newHitCount >= target.maxHits;
          
          if (!hitTarget) {
            hitTarget = target;
            newCombo += 1;
            newMultiplier = Math.min(3, 1 + newCombo * 0.1);
          }
          
          // Trigger callback for each hit (progressive reveal)
          onTargetHit?.({ ...target, hitCount: newHitCount });
          
          return { 
            ...target, 
            hitCount: newHitCount,
            hit: isFullyHit,
          };
        }
        
        return target;
      });
      
      const newShots = prev.shots + 1;
      const newHits = hitTarget ? prev.hits + 1 : prev.hits;
      const newAccuracy = (newHits / newShots) * 100;
      
      // Calculate score
      const basePoints = hitTarget ? hitTarget.points : 0;
      const comboBonus = hitTarget ? (newCombo - 1) * 10 : 0;
      const powerBonus = hitTarget ? Math.floor(power * 50) : 0;
      const newScore = prev.score + Math.floor((basePoints + comboBonus + powerBonus) * newMultiplier);
      
      // Check if all targets fully hit - level complete
      const allTargetsHit = updatedTargets.length > 0 && updatedTargets.every((t) => t.hit);
      if (allTargetsHit) {
        // Level complete - move to next level after delay
        const nextLevel = prev.currentLevel + 1;
        if (nextLevel <= workExperiences.length) {
          setTimeout(() => {
            const newTargets = generateTargets(nextLevel);
            setGameState((current) => ({
              ...current,
              targets: newTargets,
              currentLevel: nextLevel,
              isLevelComplete: false,
              isPlaying: true,
              combo: 0,
              multiplier: 1,
            }));
            onLevelComplete?.();
          }, 2000); // 2 second delay before next level
        } else {
          // All levels completed
          setGameState((prev) => ({
            ...prev,
            isGameOver: true,
            isPlaying: false,
            isLevelComplete: false,
          }));
        }
        
        return {
          ...prev,
          isLevelComplete: true,
          isPlaying: false,
          shots: newShots,
          hits: newHits,
          accuracy: newAccuracy,
          score: newScore,
          combo: 0,
          multiplier: 1,
          isCharging: false,
          power: 0,
        };
      }
      
      // If a target was hit, trigger callback immediately
      if (hitTarget) {
        onTargetHit?.(hitTarget);
      }
      
      return {
        ...prev,
        targets: updatedTargets,
        shots: newShots,
        hits: newHits,
        accuracy: newAccuracy,
        score: newScore,
        combo: hitTarget ? newCombo : 0,
        multiplier: hitTarget ? newMultiplier : 1,
        isCharging: false,
        isAiming: false,
        power: 0,
        bullets: [...prev.bullets, bullet], // Add bullet
      };
    });
  }, [gameState.isPlaying, gameState.isPaused, gameState.crosshairX, gameState.crosshairY, generateTargets, onTargetHit]);

  // Game loop
  useEffect(() => {
    if (!gameState.isPlaying || gameState.isPaused || gameState.isGameOver || gameState.isLevelComplete) {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
      return;
    }

    const gameLoop = (timestamp: number) => {
      const deltaTime = Math.min((timestamp - lastTimeRef.current) / 1000, 0.1);
      lastTimeRef.current = timestamp;
      
      setGameState((prev) => {
        // Update time remaining
        const newTimeRemaining = Math.max(0, prev.timeRemaining - deltaTime);
        
        // Update charging power
        let newPower = prev.power;
        if (prev.isCharging && chargeStartTimeRef.current) {
          const chargeTime = (timestamp - chargeStartTimeRef.current) / 1000;
          newPower = Math.min(1, chargeTime / 2);
        }
        
        // Update bullet physics
        const updatedBullets = prev.bullets
          .map((bullet) => ({
            ...bullet,
            x: bullet.x + bullet.vx * deltaTime * 100,
            y: bullet.y + bullet.vy * deltaTime * 100,
            life: bullet.life - deltaTime,
          }))
          .filter((bullet) => bullet.life > 0);
        
        // Targets are stationary - no movement needed
        const updatedTargets = prev.targets;
        
        // Check game over
        if (newTimeRemaining <= 0) {
          return {
            ...prev,
            isGameOver: true,
            isPlaying: false,
            timeRemaining: 0,
            targets: updatedTargets,
            power: newPower,
          };
        }
        
        return {
          ...prev,
          timeRemaining: newTimeRemaining,
          targets: updatedTargets,
          power: newPower,
          bullets: updatedBullets,
        };
      });
      
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };
    
    gameLoopRef.current = requestAnimationFrame(gameLoop);
    
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState.isPlaying, gameState.isPaused, gameState.isGameOver, gameState.isLevelComplete, generateTargets, workExperiences.length]);

  // Mouse/touch controls with subtle random movement when inside target
  useEffect(() => {
    if (!gameState.isPlaying) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      let x = (e.clientX / window.innerWidth) * 100;
      let y = (e.clientY / window.innerHeight) * 100;
      
      // Check if cursor is inside any target
      const target = gameState.targets.find(t => !t.hit);
      if (target) {
        const dx = x - target.x;
        const dy = y - target.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // If inside target radius, add very subtle random movement
        const targetRadiusPercent = (target.radius / window.innerWidth) * 100;
        if (distance < targetRadiusPercent) {
          // Very minor random offset: max 0.3% in any direction
          const randomOffsetX = (Math.random() - 0.5) * 0.3;
          const randomOffsetY = (Math.random() - 0.5) * 0.3;
          x += randomOffsetX;
          y += randomOffsetY;
        }
      }
      
      updateCrosshair(x, y);
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        let x = (e.touches[0].clientX / window.innerWidth) * 100;
        let y = (e.touches[0].clientY / window.innerHeight) * 100;
        
        // Check if cursor is inside any target
        const target = gameState.targets.find(t => !t.hit);
        if (target) {
          const dx = x - target.x;
          const dy = y - target.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // If inside target radius, add very subtle random movement
          const targetRadiusPercent = (target.radius / window.innerWidth) * 100;
          if (distance < targetRadiusPercent) {
            const randomOffsetX = (Math.random() - 0.5) * 0.3;
            const randomOffsetY = (Math.random() - 0.5) * 0.3;
            x += randomOffsetX;
            y += randomOffsetY;
          }
        }
        
        updateCrosshair(x, y);
      }
    };
    
    const handleMouseDown = () => {
      startCharge();
    };
    
    const handleMouseUp = () => {
      shoot();
      setGameState((prev) => ({ ...prev, isAiming: false }));
    };
    
    const handleTouchStart = () => {
      startCharge();
    };
    
    const handleTouchEnd = () => {
      shoot();
      setGameState((prev) => ({ ...prev, isAiming: false }));
    };
    
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchend", handleTouchEnd);
    
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [gameState.isPlaying, gameState.targets, updateCrosshair, startCharge, shoot]);

  // Keyboard controls
  useEffect(() => {
    if (!gameState.isPlaying) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        startCharge();
      } else if (e.code === "Escape" || e.code === "KeyP") {
        togglePause();
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        shoot();
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [gameState.isPlaying, startCharge, shoot, togglePause]);

  return {
    gameState,
    startGame,
    togglePause,
    shoot,
    startCharge,
    updateCrosshair,
  };
}

