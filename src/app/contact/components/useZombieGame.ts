"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface Zombie {
  id: string;
  x: number; // Position on screen (0-100%)
  y: number; // Position on screen (0-100%)
  type: 'walker' | 'runner' | 'boss';
  health: number;
  maxHealth: number;
  speed: number;
  size: number;
  isDead: boolean;
  deathAnimation?: number; // Animation progress 0-1
}

export interface Bullet {
  id: string;
  x: number; // Position on screen (0-100%)
  y: number; // Position on screen (0-100%)
  vx: number; // Velocity x
  vy: number; // Velocity y
  life: number; // Remaining lifetime
}

export interface PowerUp {
  id: string;
  x: number;
  y: number;
  type: 'time' | 'field' | 'ammo';
  life: number;
}

export interface DisappearingField {
  id: string;
  fieldName: 'name' | 'email' | 'message';
  disappearTime: number; // Time in seconds when it disappears
  isVisible: boolean;
}

export interface ZombieGameState {
  isPlaying: boolean;
  isPaused: boolean;
  isGameOver: boolean;
  isVictory: boolean;
  timeRemaining: number;
  zombies: Zombie[];
  bullets: Bullet[];
  powerUps: PowerUp[];
  disappearingFields: DisappearingField[];
  score: number;
  survivalTime: number;
  kills: number;
  combo: number;
  ammo: number;
  crosshairX: number;
  crosshairY: number;
  formFieldsVisible: {
    name: boolean;
    email: boolean;
    message: boolean;
  };
  lastKillTime: number;
  isPlayerActive: boolean; // Red Light, Green Light mechanic
  playerIdleTime: number; // Time since last activity
}

interface UseZombieGameProps {
  gameDuration?: number; // seconds
  onGameOver?: () => void;
  onVictory?: () => void;
  onFieldDisappear?: (fieldName: 'name' | 'email' | 'message') => void;
  onZombieKill?: (zombie: Zombie) => void;
  onPlayerActivity?: (isActive: boolean) => void;
}

const INITIAL_GAME_DURATION = 120; // 2 minutes

export function useZombieGame({
  gameDuration = INITIAL_GAME_DURATION,
  onGameOver,
  onVictory,
  onFieldDisappear,
  onZombieKill,
  onPlayerActivity,
}: UseZombieGameProps) {
  const gameLoopRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const zombieSpawnTimerRef = useRef<number>(0);
  
  const [gameState, setGameState] = useState<ZombieGameState>({
    isPlaying: false,
    isPaused: false,
    isGameOver: false,
    isVictory: false,
    timeRemaining: gameDuration,
    zombies: [],
    bullets: [],
    powerUps: [],
    disappearingFields: [],
    score: 0,
    survivalTime: 0,
    kills: 0,
    combo: 0,
    ammo: 50,
    crosshairX: 50,
    crosshairY: 50,
    formFieldsVisible: {
      name: true,
      email: true,
      message: true,
    },
    lastKillTime: 0,
    isPlayerActive: true,
    playerIdleTime: 0,
  });

  // Generate disappearing fields with staggered disappear times
  const generateDisappearingFields = useCallback((): DisappearingField[] => {
    const fieldOrder: Array<'name' | 'email' | 'message'> = ['name', 'email', 'message'];
    const disappearIntervals = [90, 60, 30]; // Fields disappear at 90s, 60s, 30s remaining
    
    return fieldOrder.map((fieldName, index) => ({
      id: `field-${fieldName}`,
      fieldName,
      disappearTime: disappearIntervals[index],
      isVisible: true,
    }));
  }, []);

  // Spawn a zombie (away from center where form is)
  const spawnZombie = useCallback((): Zombie => {
    const types: Array<'walker' | 'runner' | 'boss'> = ['walker', 'runner', 'boss'];
    // More walkers, fewer bosses
    const typeWeights = [0.6, 0.3, 0.1]; // walker, runner, boss
    const rand = Math.random();
    let type: 'walker' | 'runner' | 'boss' = 'walker';
    if (rand < typeWeights[0]) type = 'walker';
    else if (rand < typeWeights[0] + typeWeights[1]) type = 'runner';
    else type = 'boss';
    
    const zombieConfig = {
      walker: { health: 1, speed: 0.5, size: 40 },
      runner: { health: 2, speed: 1.5, size: 35 },
      boss: { health: 5, speed: 0.8, size: 60 },
    };
    
    const config = zombieConfig[type];
    const maxHealth = config.health;
    
    // Spawn zombies away from center (form is at 50%, 50%)
    // Spawn in corners or edges
    let x: number, y: number;
    const spawnArea = Math.random();
    if (spawnArea < 0.25) {
      // Top edge
      x = Math.random() * 100;
      y = Math.random() * 20;
    } else if (spawnArea < 0.5) {
      // Right edge
      x = 80 + Math.random() * 20;
      y = Math.random() * 100;
    } else if (spawnArea < 0.75) {
      // Bottom edge
      x = Math.random() * 100;
      y = 80 + Math.random() * 20;
    } else {
      // Left edge
      x = Math.random() * 20;
      y = Math.random() * 100;
    }
    
    return {
      id: `zombie-${Date.now()}-${Math.random()}`,
      x,
      y,
      type,
      health: config.health,
      maxHealth,
      speed: config.speed,
      size: config.size,
      isDead: false,
    };
  }, []);

  // Start game
  const startGame = useCallback(() => {
    const disappearingFields = generateDisappearingFields();
    
    setGameState({
      isPlaying: true,
      isPaused: false,
      isGameOver: false,
      isVictory: false,
      timeRemaining: gameDuration,
      zombies: [],
      bullets: [],
      powerUps: [],
      disappearingFields,
      score: 0,
      survivalTime: 0,
      kills: 0,
      combo: 0,
      ammo: 50,
      crosshairX: 50,
      crosshairY: 50,
      formFieldsVisible: {
        name: true,
        email: true,
        message: true,
      },
      lastKillTime: 0,
      isPlayerActive: true,
      playerIdleTime: 0,
    });
    
    lastTimeRef.current = performance.now();
    zombieSpawnTimerRef.current = 0;
  }, [gameDuration, generateDisappearingFields]);

  // Pause/Resume
  const togglePause = useCallback(() => {
    setGameState((prev) => ({ ...prev, isPaused: !prev.isPaused }));
  }, []);

  // Update crosshair position
  const updateCrosshair = useCallback((x: number, y: number) => {
    setGameState((prev) => ({ ...prev, crosshairX: x, crosshairY: y }));
  }, []);

  // Shoot at position
  const shoot = useCallback((x: number, y: number) => {
    if (!gameState.isPlaying || gameState.isPaused || gameState.ammo <= 0) return;

    setGameState((prev) => {
      if (prev.ammo <= 0) return prev;

      // Calculate direction from center to click position
      const centerX = 50;
      const centerY = 50;
      const dx = x - centerX;
      const dy = y - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance === 0) return prev;

      const speed = 15; // units per second
      const vx = (dx / distance) * speed;
      const vy = (dy / distance) * speed;

      const bullet: Bullet = {
        id: `bullet-${Date.now()}-${Math.random()}`,
        x: centerX,
        y: centerY,
        vx,
        vy,
        life: 2, // 2 seconds lifetime
      };

      return {
        ...prev,
        bullets: [...prev.bullets, bullet],
        ammo: prev.ammo - 1,
      };
    });
  }, [gameState.isPlaying, gameState.isPaused]);

  // Kill zombie (called when clicked or hit by bullet)
  const killZombie = useCallback((zombieId: string) => {
    setGameState((prev) => {
      const zombie = prev.zombies.find(z => z.id === zombieId);
      if (!zombie || zombie.isDead) return prev;

      const now = performance.now() / 1000;
      const timeSinceLastKill = now - prev.lastKillTime;
      const newCombo = timeSinceLastKill < 2 ? prev.combo + 1 : 1; // Combo resets after 2s
      
      const points = zombie.type === 'boss' ? 50 : zombie.type === 'runner' ? 20 : 10;
      const comboBonus = newCombo > 1 ? (newCombo - 1) * 5 : 0;
      const timeBonus = zombie.type === 'boss' ? 5 : zombie.type === 'runner' ? 2 : 1;

      // Spawn power-up sometimes
      const newPowerUps = [...prev.powerUps];
      if (Math.random() < 0.3) { // 30% chance
        const powerUpType = Math.random() < 0.5 ? 'time' : Math.random() < 0.7 ? 'field' : 'ammo';
        newPowerUps.push({
          id: `powerup-${Date.now()}-${Math.random()}`,
          x: zombie.x,
          y: zombie.y,
          type: powerUpType,
          life: 5, // 5 seconds to collect
        });
      }

      onZombieKill?.(zombie);

      return {
        ...prev,
        zombies: prev.zombies.map(z => 
          z.id === zombieId 
            ? { ...z, isDead: true, health: 0, deathAnimation: 0 }
            : z
        ),
        score: prev.score + points + comboBonus,
        kills: prev.kills + 1,
        combo: newCombo,
        timeRemaining: Math.min(gameDuration, prev.timeRemaining + timeBonus),
        powerUps: newPowerUps,
        lastKillTime: now,
      };
    });
  }, [gameDuration, onZombieKill]);

  // Check field visibility based on time
  const updateFieldVisibility = useCallback((timeRemaining: number) => {
    setGameState((prev) => {
      const newFieldsVisible = { ...prev.formFieldsVisible };
      let hasChanged = false;
      
      prev.disappearingFields.forEach((field) => {
        if (timeRemaining <= field.disappearTime && prev.formFieldsVisible[field.fieldName]) {
          newFieldsVisible[field.fieldName] = false;
          hasChanged = true;
          onFieldDisappear?.(field.fieldName);
        }
      });
      
      if (hasChanged) {
        return { ...prev, formFieldsVisible: newFieldsVisible };
      }
      return prev;
    });
  }, [onFieldDisappear]);

  // Game loop
  useEffect(() => {
    if (!gameState.isPlaying || gameState.isPaused || gameState.isGameOver || gameState.isVictory) {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
      return;
    }
    
    const gameLoop = (timestamp: number) => {
      const deltaTime = Math.min((timestamp - lastTimeRef.current) / 1000, 0.1); // Cap at 100ms
      lastTimeRef.current = timestamp;
      
      setGameState((prev) => {
        // Update timer
        let newTimeRemaining = Math.max(0, prev.timeRemaining - deltaTime);
        const newSurvivalTime = prev.survivalTime + deltaTime;
        
        // Red Light, Green Light: Update player activity tracking
        const newPlayerIdleTime = prev.isPlayerActive ? 0 : prev.playerIdleTime + deltaTime;
        const IDLE_THRESHOLD = 0.5; // 0.5 seconds of inactivity = red light
        const newIsPlayerActive = newPlayerIdleTime < IDLE_THRESHOLD;
        
        // Check if time ran out
        if (newTimeRemaining <= 0 && !prev.isGameOver) {
          onGameOver?.();
          return { ...prev, isGameOver: true, timeRemaining: 0 };
        }
        
        // Update field visibility
        updateFieldVisibility(newTimeRemaining);
        
        // Spawn zombies (more frequent as time runs out)
        zombieSpawnTimerRef.current += deltaTime;
        const spawnInterval = Math.max(2, 5 - (gameDuration - newTimeRemaining) / 30); // Spawn faster as time runs out
        const newZombies = [...prev.zombies];
        
        if (zombieSpawnTimerRef.current >= spawnInterval) {
          zombieSpawnTimerRef.current = 0;
          if (newZombies.length < 15) { // Max 15 zombies
            newZombies.push(spawnZombie());
          }
        }
        
        // Update bullet positions and check collisions
        const updatedBullets = prev.bullets
          .map((bullet) => {
            const newX = bullet.x + bullet.vx * deltaTime;
            const newY = bullet.y + bullet.vy * deltaTime;
            const newLife = bullet.life - deltaTime;

            // Check collision with zombies
            let hitZombie: Zombie | null = null;
            const bulletRadius = 1; // 1% of screen

            for (const zombie of newZombies) {
              if (zombie.isDead) continue;
              
              const dx = newX - zombie.x;
              const dy = newY - zombie.y;
              const distance = Math.sqrt(dx * dx + dy * dy);
              const zombieRadius = (zombie.size / 100) * 2; // Convert size to percentage radius

              if (distance < bulletRadius + zombieRadius) {
                hitZombie = zombie;
                break;
              }
            }

            if (hitZombie) {
              // Damage zombie
              const updatedZombie = newZombies.find(z => z.id === hitZombie!.id);
              if (updatedZombie) {
                updatedZombie.health -= 1;
                if (updatedZombie.health <= 0) {
                  // Kill zombie
                  setTimeout(() => killZombie(updatedZombie.id), 0);
                }
              }
              return null; // Remove bullet
            }

            if (newLife <= 0 || newX < 0 || newX > 100 || newY < 0 || newY > 100) {
              return null; // Remove bullet
            }

            return {
              ...bullet,
              x: newX,
              y: newY,
              life: newLife,
            };
          })
          .filter((b): b is Bullet => b !== null);

        // Update power-ups and check collection
        let collectedPowerUp: PowerUp | null = null;
        let powerUpEffect: { type: 'time' | 'field' | 'ammo'; field?: 'name' | 'email' | 'message' } | null = null;
        
        const updatedPowerUps = prev.powerUps
          .map((powerUp) => {
            const newLife = powerUp.life - deltaTime;
            if (newLife <= 0) return null;

            // Check if collected (near center/form)
            const centerX = 50;
            const centerY = 50;
            const dx = powerUp.x - centerX;
            const dy = powerUp.y - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 5) {
              collectedPowerUp = powerUp;
              if (powerUp.type === 'field') {
                const fields = ['name', 'email', 'message'] as const;
                const randomField = fields[Math.floor(Math.random() * fields.length)];
                powerUpEffect = { type: powerUp.type, field: randomField };
              } else {
                powerUpEffect = { type: powerUp.type };
              }
              return null; // Remove power-up
            }

            return { ...powerUp, life: newLife };
          })
          .filter((p): p is PowerUp => p !== null);

        // Move zombies towards center (where form is)
        // Red Light, Green Light: Zombies only move when player is NOT active (red light)
        const updatedZombies = newZombies
          .map((zombie) => {
            // Update death animation
            if (zombie.isDead) {
              const newDeathAnim = (zombie.deathAnimation || 0) + deltaTime * 2; // 0.5s animation
              if (newDeathAnim >= 1) {
                return null; // Remove fully animated zombie
              }
              return { ...zombie, deathAnimation: newDeathAnim };
            }

            // GREEN LIGHT: Player is active, zombies freeze
            if (newIsPlayerActive) {
              return zombie; // Don't move
            }

            // RED LIGHT: Player is idle, zombies move (faster when idle longer)
            const centerX = 50;
            const centerY = 50;
            const dx = centerX - zombie.x;
            const dy = centerY - zombie.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 0) {
              // Speed multiplier increases with idle time (up to 3x speed)
              const speedMultiplier = Math.min(3, 1 + (newPlayerIdleTime / 2));
              const moveX = (dx / distance) * zombie.speed * deltaTime * 10 * speedMultiplier;
              const moveY = (dy / distance) * zombie.speed * deltaTime * 10 * speedMultiplier;
              
              return {
                ...zombie,
                x: Math.max(0, Math.min(100, zombie.x + moveX)),
                y: Math.max(0, Math.min(100, zombie.y + moveY)),
              };
            }
            
            return zombie;
          })
          .filter((z): z is Zombie => z !== null);

        // Check if zombie reached form (game over condition)
        const zombieReachedForm = updatedZombies.some((zombie) => {
          if (zombie.isDead) return false;
          const centerX = 50;
          const centerY = 50;
          const dx = centerX - zombie.x;
          const dy = centerY - zombie.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          return distance < 3; // 3% of screen - zombie reached form
        });

        if (zombieReachedForm && !prev.isGameOver) {
          onGameOver?.();
          return { ...prev, isGameOver: true };
        }
        
        // Apply power-up effects
        let finalTimeRemaining = newTimeRemaining;
        let finalAmmo = prev.ammo;
        let finalFieldsVisible = prev.formFieldsVisible;
        
        if (powerUpEffect) {
          const effect = powerUpEffect as { type: 'time' | 'field' | 'ammo'; field?: 'name' | 'email' | 'message' };
          if (effect.type === 'time') {
            finalTimeRemaining = Math.min(gameDuration, newTimeRemaining + 10);
          } else if (effect.type === 'field' && effect.field) {
            if (!prev.formFieldsVisible[effect.field]) {
              finalFieldsVisible = { ...prev.formFieldsVisible, [effect.field]: true };
            }
          } else if (effect.type === 'ammo') {
            finalAmmo = prev.ammo + 20;
          }
        }
        
        return {
          ...prev,
          timeRemaining: finalTimeRemaining,
          survivalTime: newSurvivalTime,
          zombies: updatedZombies,
          bullets: updatedBullets,
          powerUps: updatedPowerUps,
          isPlayerActive: newIsPlayerActive,
          playerIdleTime: newPlayerIdleTime,
          ammo: finalAmmo,
          formFieldsVisible: finalFieldsVisible,
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
  }, [gameState.isPlaying, gameState.isPaused, gameState.isGameOver, gameState.isVictory, gameDuration, updateFieldVisibility, onGameOver, killZombie]);

  // Victory condition (form submitted successfully)
  const triggerVictory = useCallback(() => {
    setGameState((prev) => {
      if (!prev.isVictory && !prev.isGameOver) {
        onVictory?.();
        return { ...prev, isVictory: true, isPlaying: false };
      }
      return prev;
    });
  }, [onVictory]);

  // Reset game
  const resetGame = useCallback(() => {
    setGameState({
      isPlaying: false,
      isPaused: false,
      isGameOver: false,
      isVictory: false,
      timeRemaining: gameDuration,
      zombies: [],
      bullets: [],
      powerUps: [],
      disappearingFields: [],
      score: 0,
      survivalTime: 0,
      kills: 0,
      combo: 0,
      ammo: 50,
      crosshairX: 50,
      crosshairY: 50,
      formFieldsVisible: {
        name: true,
        email: true,
        message: true,
      },
      lastKillTime: 0,
      isPlayerActive: true,
      playerIdleTime: 0,
    });
  }, [gameDuration]);

  // Track player activity (Red Light, Green Light)
  const setPlayerActive = useCallback((isActive: boolean) => {
    setGameState((prev) => {
      if (prev.isPlayerActive !== isActive) {
        onPlayerActivity?.(isActive);
        return { ...prev, isPlayerActive: isActive, playerIdleTime: isActive ? 0 : prev.playerIdleTime };
      }
      return prev;
    });
  }, [onPlayerActivity]);

  return {
    gameState,
    startGame,
    togglePause,
    triggerVictory,
    resetGame,
    shoot,
    killZombie,
    updateCrosshair,
    setPlayerActive,
  };
}
