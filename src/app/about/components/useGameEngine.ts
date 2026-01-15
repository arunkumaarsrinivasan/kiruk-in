"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ObstacleType } from "./PixelObstacle";

export type CollectibleType = "coin" | "star" | "heart" | "coffee" | "book";

export interface GameObstacle {
  id: string;
  type: ObstacleType;
  x: number;
  width: number;
  height: number;
  passed: boolean;
}

export interface GameCollectible {
  id: string;
  type: CollectibleType;
  x: number;
  y: number;
  collected: boolean;
}

export interface GameState {
  isPlaying: boolean;
  isPaused: boolean;
  isGameOver: boolean;
  isLevelComplete: boolean;
  score: number;
  level: number;
  playerX: number;     // Player's horizontal position (0 = start, worldWidth = goal)
  playerY: number;     // Player's vertical position (0 = ground)
  isJumping: boolean;
  isDucking: boolean;
  canDoubleJump: boolean;
  hasDoubleJumped: boolean;
  obstacles: GameObstacle[];
  collectibles: GameCollectible[];
  speed: number;       // Player's movement speed based on age
  groundY: number;
  levelProgress: number; // 0 to 1 based on playerX
  combo: number;
  lives: number;
  isMovingLeft: boolean;
  isMovingRight: boolean;
  worldWidth: number;  // Total width of level
  activeCheckpoint: number | null; // Current checkpoint index (0, 1, 2) or null
  visitedCheckpoints: Set<number>; // Track which checkpoints have been visited
}

interface LifeEvent {
  id: string;
  year: number;
  title: string;
  tags?: string[];
  icon?: string;
}

type GameMode = 'god' | 'devil' | 'normal';

interface UseGameEngineProps {
  levels: { year: number; age: number }[];
  events?: LifeEvent[];  // Event data for story-based obstacles
  gameMode?: GameMode;  // Game mode for difficulty adjustment
  onLevelComplete?: (level: number) => void;
  onGameOver?: () => void;
  onCollect?: (type: CollectibleType, score: number) => void;
  worldWidth?: number;  // How far player needs to travel
}

export function useGameEngine({
  levels,
  events,
  gameMode: _gameMode = 'normal',
  onLevelComplete,
  onGameOver,
  onCollect,
  worldWidth = 2000,  // Player needs to move 2000px to complete level
}: UseGameEngineProps) {
  const gameLoopRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const keysPressed = useRef<Set<string>>(new Set());
  
  const [gameState, setGameState] = useState<GameState>({
    isPlaying: false,
    isPaused: false,
    isGameOver: false,
    isLevelComplete: false,
    score: 0,
    level: 0,
    playerX: 0,
    playerY: 0,
    isJumping: false,
    isDucking: false,
    canDoubleJump: true,
    hasDoubleJumped: false,
    obstacles: [],
    collectibles: [],
    speed: 4,
    groundY: 0,
    levelProgress: 0,
    combo: 0,
    lives: 3,
    isMovingLeft: false,
    isMovingRight: false,
    worldWidth,
    activeCheckpoint: null,
    visitedCheckpoints: new Set(),
  });
  
  // Player physics
  const playerRef = useRef({
    x: 0,
    y: 0,
    velocityY: 0,
    isJumping: false,
    isDucking: false,
    hasDoubleJumped: false,
    width: 40,
    height: 60,
  });
  
  // Generated obstacles for current level
  const levelObstaclesRef = useRef<GameObstacle[]>([]);
  const levelCollectiblesRef = useRef<GameCollectible[]>([]);
  
  const GRAVITY = 1.2;
  const JUMP_FORCE = 18;
  const DOUBLE_JUMP_FORCE = 14;
  const GROUND_Y = 0;
  
  // Get speed based on age/level - player moves faster as they grow
  const getSpeedForLevel = useCallback((level: number) => {
    const age = levels[level]?.age || 0;
    if (age <= 7) return 3;   // Baby/Toddler - crawl/walk slowly
    if (age <= 13) return 5;  // Child - walk
    if (age <= 18) return 7;  // Teen - jog
    if (age <= 21) return 9;  // Young adult - run
    return 11;                // Professional - sprint
  }, [levels]);
  
  // Get story-based collectibles
  const getCollectiblesForEvent = (event?: LifeEvent): CollectibleType[] => {
    if (!event) return ["coin", "star", "coffee"];
    
    const title = event.title.toLowerCase();
    const tags = event.tags?.map(t => t.toLowerCase()) || [];
    
    if (title.includes("creative clan") || title.includes("joint family") || tags.some(t => t.includes("creative"))) {
      return ["coin", "star", "heart", "coffee"]; // Creative energy
    }
    if (title.includes("family studio") || tags.some(t => t.includes("crochet") || t.includes("calligraphy"))) {
      return ["coin", "star", "heart", "book"]; // Art supplies
    }
    if (title.includes("biryani") || title.includes("notebook") || tags.some(t => t.includes("biryani"))) {
      return ["coin", "star", "coffee", "book"]; // Food and learning
    }
    if (title.includes("freelance") || title.includes("poster") || title.includes("illustration")) {
      return ["coin", "star", "book", "coffee"]; // Creative work
    }
    if (title.includes("engineering") || title.includes("college")) {
      return ["coin", "star", "book", "coffee"]; // Study items
    }
    if (title.includes("campus") || title.includes("design lead")) {
      return ["coin", "star", "book", "coffee"]; // Leadership
    }
    if (title.includes("pandemic") || title.includes("game") || title.includes("playlab")) {
      return ["coin", "star", "heart", "coffee"]; // Fun and games
    }
    if (title.includes("design system") || title.includes("figma")) {
      return ["coin", "star", "book", "coffee"]; // Design tools
    }
    
    return ["coin", "star", "coffee"];
  };
  
  // Generate obstacles for a level
  const generateLevelContent = useCallback((level: number) => {
    const currentEvent = events?.[level];
    const obstacles: GameObstacle[] = []; // No obstacles
    const collectibles: GameCollectible[] = [];
    
    // Generate story-based collectibles
    const collectibleTypes = getCollectiblesForEvent(currentEvent);
    const collectibleCount = 5; // Keep some collectibles for gameplay
    
    for (let i = 0; i < collectibleCount; i++) {
      const type = collectibleTypes[Math.floor(Math.random() * collectibleTypes.length)];
      const x = (worldWidth / collectibleCount) * i + Math.random() * 100;
      const y = 40 + Math.random() * 80; // Varied heights
      
      collectibles.push({
        id: `collectible-${i}`,
        type,
        x,
        y,
        collected: false,
      });
    }
    
    levelObstaclesRef.current = obstacles;
    levelCollectiblesRef.current = collectibles;
    
    return { obstacles, collectibles };
  }, [events, worldWidth]);
  
  // Start game
  const startGame = useCallback(() => {
    playerRef.current = {
      x: 0,
      y: GROUND_Y,
      velocityY: 0,
      isJumping: false,
      isDucking: false,
      hasDoubleJumped: false,
      width: 40,
      height: 60,
    };
    
    const { obstacles, collectibles } = generateLevelContent(0);
    
    setGameState({
      isPlaying: true,
      isPaused: false,
      isGameOver: false,
      isLevelComplete: false,
      score: 0,
      level: 0,
      playerX: 0,
      playerY: GROUND_Y,
      isJumping: false,
      isDucking: false,
      canDoubleJump: true,
      hasDoubleJumped: false,
      obstacles,
      collectibles,
      speed: getSpeedForLevel(0),
      groundY: 0,
      levelProgress: 0,
      combo: 0,
      lives: 3,
      isMovingLeft: false,
      isMovingRight: false,
      worldWidth,
      activeCheckpoint: null,
      visitedCheckpoints: new Set(),
    });
    
    lastTimeRef.current = performance.now();
  }, [getSpeedForLevel, generateLevelContent, worldWidth]);
  
  // Jump - with double jump support
  const jump = useCallback(() => {
    if (!gameState.isPlaying || gameState.isPaused) return;
    
    // First jump from ground
    if (!playerRef.current.isJumping) {
      playerRef.current.velocityY = JUMP_FORCE;
      playerRef.current.isJumping = true;
      playerRef.current.hasDoubleJumped = false;
      setGameState((prev) => ({ ...prev, isJumping: true, hasDoubleJumped: false }));
    }
    // Double jump in air
    else if (!playerRef.current.hasDoubleJumped && gameState.canDoubleJump) {
      playerRef.current.velocityY = DOUBLE_JUMP_FORCE;
      playerRef.current.hasDoubleJumped = true;
      setGameState((prev) => ({ ...prev, hasDoubleJumped: true }));
    }
  }, [gameState.isPlaying, gameState.isPaused, gameState.canDoubleJump]);
  
  // Duck
  const duck = useCallback((isDucking: boolean) => {
    if (!gameState.isPlaying || gameState.isPaused) return;
    playerRef.current.isDucking = isDucking;
    playerRef.current.height = isDucking ? 30 : 60;
    setGameState((prev) => ({ ...prev, isDucking }));
  }, [gameState.isPlaying, gameState.isPaused]);
  
  // Move left/right
  const setMoving = useCallback((direction: 'left' | 'right' | 'none') => {
    setGameState((prev) => ({
      ...prev,
      isMovingLeft: direction === 'left',
      isMovingRight: direction === 'right',
    }));
  }, []);
  
  // Pause/Resume
  const togglePause = useCallback(() => {
    setGameState((prev) => ({ ...prev, isPaused: !prev.isPaused }));
  }, []);
  
  // Go to next level
  const nextLevel = useCallback(() => {
    const newLevel = gameState.level + 1;
    
    if (newLevel >= levels.length) {
      // Game complete!
      setGameState((prev) => ({
        ...prev,
        isPlaying: false,
        isGameOver: true,
        isLevelComplete: true,
      }));
      return;
    }
    
    playerRef.current = {
      x: 0,
      y: GROUND_Y,
      velocityY: 0,
      isJumping: false,
      isDucking: false,
      hasDoubleJumped: false,
      width: 40,
      height: 60,
    };
    
    const { obstacles, collectibles } = generateLevelContent(newLevel);
    
    setGameState((prev) => ({
      ...prev,
      level: newLevel,
      isLevelComplete: false,
      isPlaying: true,
      obstacles,
      collectibles,
      speed: getSpeedForLevel(newLevel),
      playerX: 0,
      playerY: GROUND_Y,
      levelProgress: 0,
      isJumping: false,
      isDucking: false,
      hasDoubleJumped: false,
      isMovingLeft: false,
      isMovingRight: false,
      combo: 0,
      activeCheckpoint: null,
      visitedCheckpoints: new Set(),
    }));
    
    lastTimeRef.current = performance.now();
  }, [gameState.level, levels.length, getSpeedForLevel, generateLevelContent]);
  
  // Go to specific level
  const goToLevel = useCallback((level: number) => {
    if (level < 0 || level >= levels.length) return;
    
    playerRef.current = {
      x: 0,
      y: GROUND_Y,
      velocityY: 0,
      isJumping: false,
      isDucking: false,
      hasDoubleJumped: false,
      width: 40,
      height: 60,
    };
    
    const { obstacles, collectibles } = generateLevelContent(level);
    
    setGameState({
      isPlaying: true,
      isPaused: false,
      isGameOver: false,
      isLevelComplete: false,
      score: level * 100,
      level: level,
      playerX: 0,
      playerY: GROUND_Y,
      isJumping: false,
      isDucking: false,
      canDoubleJump: true,
      hasDoubleJumped: false,
      obstacles,
      collectibles,
      speed: getSpeedForLevel(level),
      groundY: 0,
      levelProgress: 0,
      combo: 0,
      lives: 3,
      isMovingLeft: false,
      isMovingRight: false,
      worldWidth,
      activeCheckpoint: null,
      visitedCheckpoints: new Set(),
    });
    
    lastTimeRef.current = performance.now();
  }, [levels.length, getSpeedForLevel, generateLevelContent, worldWidth]);
  
  // Restart current level
  const restartLevel = useCallback(() => {
    goToLevel(gameState.level);
  }, [gameState.level, goToLevel]);

  
  // Check collision
  const checkCollision = useCallback((obstacle: GameObstacle, playerX: number): boolean => {
    const player = playerRef.current;
    const playerHeight = player.isDucking ? 30 : 60;
    
    // Player hitbox relative to world position
    const margin = 12;
    const playerLeft = playerX + margin;
    const playerRight = playerX + player.width - margin;
    const playerBottom = player.y + margin;
    const playerTop = player.y + playerHeight - margin;
    
    // Obstacle hitbox
    const obstacleLeft = obstacle.x;
    const obstacleRight = obstacle.x + obstacle.width;
    const obstacleBottom = 0;
    const obstacleTop = obstacle.height;
    
    // Check overlap
    const xOverlap = playerRight > obstacleLeft && playerLeft < obstacleRight;
    const yOverlap = playerTop > obstacleBottom && playerBottom < obstacleTop;
    
    return xOverlap && yOverlap;
  }, []);
  
  // Check collectible collision
  const checkCollectibleCollision = useCallback((collectible: GameCollectible, playerX: number): boolean => {
    const player = playerRef.current;
    const collectibleSize = 24;
    
    const playerLeft = playerX;
    const playerRight = playerX + player.width;
    const playerBottom = player.y;
    const playerTop = player.y + (player.isDucking ? 30 : 60);
    
    const collectibleLeft = collectible.x;
    const collectibleRight = collectible.x + collectibleSize;
    const collectibleBottom = collectible.y;
    const collectibleTop = collectible.y + collectibleSize;
    
    return (
      playerRight > collectibleLeft &&
      playerLeft < collectibleRight &&
      playerTop > collectibleBottom &&
      playerBottom < collectibleTop
    );
  }, []);
  
  // Game loop
  useEffect(() => {
    if (!gameState.isPlaying || gameState.isPaused || gameState.isLevelComplete) {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
      return;
    }
    
    const gameLoop = (timestamp: number) => {
      const deltaTime = Math.min((timestamp - lastTimeRef.current) / 16.67, 3);
      lastTimeRef.current = timestamp;
      
      // Handle horizontal movement - PLAYER CONTROLS PROGRESS
      let newX = playerRef.current.x;
      const speed = gameState.speed;
      
      if (gameState.isMovingRight) {
        newX += speed * deltaTime;
      }
      if (gameState.isMovingLeft) {
        newX -= speed * deltaTime;
      }
      
      // Clamp X position
      newX = Math.max(0, Math.min(newX, worldWidth));
      playerRef.current.x = newX;
      
      // Update player physics - gravity
      if (playerRef.current.isJumping) {
        playerRef.current.velocityY -= GRAVITY * deltaTime;
        playerRef.current.y += playerRef.current.velocityY * deltaTime;
      }
      
      // Ground collision
      if (playerRef.current.y <= GROUND_Y) {
        playerRef.current.y = GROUND_Y;
        playerRef.current.velocityY = 0;
        playerRef.current.isJumping = false;
        playerRef.current.hasDoubleJumped = false;
      }
      
      // Calculate progress based on player position
      const newProgress = newX / worldWidth;
      
      // Track checkpoints (at 25%, 50%, 75% of worldWidth) - no pause, just tracking
      const checkpointPositions = [
        worldWidth * 0.25,
        worldWidth * 0.5,
        worldWidth * 0.75,
      ];
      
      // Check if player reached a checkpoint (just for visual highlighting)
      for (let index = 0; index < checkpointPositions.length; index++) {
        const checkpointX = checkpointPositions[index];
        const distance = Math.abs(newX - checkpointX);
        const checkpointThreshold = 50; // 50px threshold to trigger checkpoint
        
        if (distance < checkpointThreshold && !gameState.visitedCheckpoints.has(index)) {
          // Mark checkpoint as visited for visual highlighting
          setGameState((prev) => ({
            ...prev,
            activeCheckpoint: index,
            visitedCheckpoints: new Set([...prev.visitedCheckpoints, index]),
          }));
        } else if (distance > checkpointThreshold + 100 && gameState.activeCheckpoint === index) {
          // Clear active checkpoint when player moves away
          setGameState((prev) => ({
            ...prev,
            activeCheckpoint: null,
          }));
        }
      }
      
      // No obstacle collisions - obstacles removed
      const collision = false;
      const scoreIncrease = 0;
      
      const updatedObstacles = gameState.obstacles; // No obstacles to update
      
      // Check collectibles
      let collectibleScore = 0;
      const updatedCollectibles = gameState.collectibles.map((collectible) => {
        if (!collectible.collected && checkCollectibleCollision(collectible, newX)) {
          const points = collectible.type === "star" ? 50 : collectible.type === "coffee" ? 25 : 10;
          collectibleScore += points;
          onCollect?.(collectible.type, points);
          return { ...collectible, collected: true };
        }
        return collectible;
      });
      
      // Check level complete - player reached the goal
      if (newProgress >= 1) {
        setGameState((prev) => ({
          ...prev,
          isLevelComplete: true,
          isPlaying: false,
          playerX: newX,
          playerY: playerRef.current.y,
          isJumping: playerRef.current.isJumping,
          obstacles: updatedObstacles,
          collectibles: updatedCollectibles.filter(c => !c.collected),
          score: prev.score + scoreIncrease + collectibleScore + 100, // Bonus for completing
          levelProgress: 1,
        }));
        onLevelComplete?.(gameState.level);
        return;
      }
      
      // Check game over
      if (collision) {
        setGameState((prev) => ({
          ...prev,
          isGameOver: true,
          isPlaying: false,
          playerX: newX,
          playerY: playerRef.current.y,
          isJumping: playerRef.current.isJumping,
          obstacles: updatedObstacles,
        }));
        onGameOver?.();
        return;
      }
      
      // Update state
      setGameState((prev) => ({
        ...prev,
        playerX: newX,
        playerY: playerRef.current.y,
        isJumping: playerRef.current.isJumping,
        isDucking: playerRef.current.isDucking,
        obstacles: updatedObstacles,
        collectibles: updatedCollectibles.filter(c => !c.collected),
        score: prev.score + scoreIncrease + collectibleScore,
        levelProgress: newProgress,
      }));
      
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };
    
    gameLoopRef.current = requestAnimationFrame(gameLoop);
    
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [
    gameState.isPlaying,
    gameState.isPaused,
    gameState.isLevelComplete,
    gameState.speed,
    gameState.obstacles,
    gameState.collectibles,
    gameState.isMovingLeft,
    gameState.isMovingRight,
    gameState.level,
    gameState.activeCheckpoint,
    gameState.visitedCheckpoints,
    worldWidth,
    checkCollision,
    checkCollectibleCollision,
    onLevelComplete,
    onGameOver,
    onCollect,
  ]);
  
  // Keyboard controls - LEFT/RIGHT movement
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (keysPressed.current.has(e.code)) return; // Prevent repeat
      keysPressed.current.add(e.code);
      
      // Jump
      if (e.code === "ArrowUp" || e.code === "KeyW") {
        e.preventDefault();
        if (gameState.isPlaying && !gameState.isPaused) {
          jump();
        }
      }
      
      // Space - Continue to next level or start game
      if (e.code === "Space" || e.code === "Enter") {
        e.preventDefault();
        if (gameState.isLevelComplete) {
          nextLevel();
        } else if (gameState.isGameOver) {
          restartLevel();
        } else if (!gameState.isPlaying) {
          startGame();
        }
      }
      
      // Move Right
      if (e.code === "ArrowRight" || e.code === "KeyD") {
        e.preventDefault();
        if (gameState.isPlaying && !gameState.isPaused) {
          setMoving('right');
        }
      }
      
      // Move Left
      if (e.code === "ArrowLeft" || e.code === "KeyA") {
        e.preventDefault();
        if (gameState.isPlaying && !gameState.isPaused) {
          setMoving('left');
        }
      }
      
      // Duck
      if (e.code === "ArrowDown" || e.code === "KeyS") {
        e.preventDefault();
        if (gameState.isPlaying && !gameState.isPaused) {
          duck(true);
        }
      }
      
      // Pause
      if (e.code === "Escape" || e.code === "KeyP") {
        if (gameState.isPlaying) {
          togglePause();
        }
      }
      
      // Restart
      if (e.code === "KeyR" && gameState.isGameOver) {
        restartLevel();
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.code);
      
      // Stop moving
      if (e.code === "ArrowRight" || e.code === "KeyD") {
        if (!keysPressed.current.has("ArrowLeft") && !keysPressed.current.has("KeyA")) {
          setMoving('none');
        } else {
          setMoving('left');
        }
      }
      if (e.code === "ArrowLeft" || e.code === "KeyA") {
        if (!keysPressed.current.has("ArrowRight") && !keysPressed.current.has("KeyD")) {
          setMoving('none');
        } else {
          setMoving('right');
        }
      }
      
      // Stop ducking
      if (e.code === "ArrowDown" || e.code === "KeyS") {
        duck(false);
      }
    };
    
    globalThis.addEventListener("keydown", handleKeyDown);
    globalThis.addEventListener("keyup", handleKeyUp);
    return () => {
      globalThis.removeEventListener("keydown", handleKeyDown);
      globalThis.removeEventListener("keyup", handleKeyUp);
    };
  }, [gameState.isPlaying, gameState.isPaused, gameState.isLevelComplete, gameState.isGameOver, jump, duck, setMoving, nextLevel, restartLevel, startGame, togglePause]);
  
  return {
    gameState,
    startGame,
    jump,
    duck,
    setMoving,
    togglePause,
    nextLevel,
    goToLevel,
    restartLevel,
  };
}
