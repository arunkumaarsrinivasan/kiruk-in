"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

// Simplified game state for celestial journey (no obstacles, no jumping)
interface CelestialGameState {
    isPlaying: boolean;
    isPaused: boolean;
    isLevelComplete: boolean;
    level: number;
    playerX: number;
    isMovingLeft: boolean;
    isMovingRight: boolean;
    speed: number;
    worldWidth: number;
    levelProgress: number;
    activeCheckpoint: number | null;
    visitedCheckpoints: Set<number>;
}

interface LifeEvent {
    id: string;
    year: number;
    age: number;
    title: string;
    tags?: string[];
    icon?: string;
}

interface UseCelestialEngineProps {
    levels: { year: number; age: number }[];
    events?: LifeEvent[];
    onLevelComplete?: (level: number) => void;
    worldWidth?: number;
}

export function useCelestialEngine({
    levels,
    events,
    onLevelComplete,
    worldWidth = 2000,
}: UseCelestialEngineProps) {
    // Game state
    const [gameState, setGameState] = useState<CelestialGameState>({
        isPlaying: false,
        isPaused: false,
        isLevelComplete: false,
        level: 0,
        playerX: 50,
        isMovingLeft: false,
        isMovingRight: false,
        speed: 5,
        worldWidth,
        levelProgress: 0,
        activeCheckpoint: null,
        visitedCheckpoints: new Set(),
    });

    // Refs for animation loop
    const animationFrameRef = useRef<number | null>(null);
    const lastTimeRef = useRef<number>(0);
    const keysPressed = useRef<Set<string>>(new Set());

    // Checkpoint positions (relative to world width)
    const checkpointPositions = useMemo(
        () => [
            worldWidth * 0.25,
            worldWidth * 0.5,
            worldWidth * 0.75,
        ],
        [worldWidth]
    );

    // Start the game/journey
    const startGame = useCallback(() => {
        setGameState((prev) => ({
            ...prev,
            isPlaying: true,
            isPaused: false,
            isLevelComplete: false,
            playerX: 50,
            levelProgress: 0,
            activeCheckpoint: null,
            visitedCheckpoints: new Set(),
        }));
    }, []);

    // Toggle pause
    const togglePause = useCallback(() => {
        setGameState((prev) => ({
            ...prev,
            isPaused: !prev.isPaused,
        }));
    }, []);

    // Go to next level/event
    const nextLevel = useCallback(() => {
        if (gameState.level < levels.length - 1) {
            setGameState((prev) => ({
                ...prev,
                level: prev.level + 1,
                isLevelComplete: false,
                isPlaying: true,
                playerX: 50,
                levelProgress: 0,
                activeCheckpoint: null,
                visitedCheckpoints: new Set(),
            }));
        }
    }, [gameState.level, levels.length]);

    // Go to specific level
    const goToLevel = useCallback((levelIndex: number) => {
        if (levelIndex >= 0 && levelIndex < levels.length) {
            setGameState((prev) => ({
                ...prev,
                level: levelIndex,
                isPlaying: true,
                isPaused: false,
                isLevelComplete: false,
                playerX: 50,
                levelProgress: 0,
                activeCheckpoint: null,
                visitedCheckpoints: new Set(),
            }));
        }
    }, [levels.length]);

    // Set movement direction
    const setMoving = useCallback((direction: 'left' | 'right' | 'none') => {
        setGameState((prev) => ({
            ...prev,
            isMovingLeft: direction === 'left',
            isMovingRight: direction === 'right',
        }));
    }, []);

    // Main game loop - simplified, no physics needed
    const gameLoop = useCallback(
        (timestamp: number) => {
            if (!gameState.isPlaying || gameState.isPaused) {
                animationFrameRef.current = requestAnimationFrame(gameLoop);
                return;
            }

            const deltaTime = lastTimeRef.current ? (timestamp - lastTimeRef.current) / 16.67 : 1;
            lastTimeRef.current = timestamp;

            setGameState((prev) => {
                let newPlayerX = prev.playerX;
                const moveSpeed = prev.speed * deltaTime;

                // Handle left/right movement
                if (prev.isMovingRight) {
                    newPlayerX = Math.min(prev.worldWidth - 40, prev.playerX + moveSpeed);
                } else if (prev.isMovingLeft) {
                    newPlayerX = Math.max(50, prev.playerX - moveSpeed);
                }

                // Calculate level progress
                const progress = Math.max(0, Math.min(1, (newPlayerX - 50) / (prev.worldWidth - 90)));

                // Check which checkpoint is active
                let activeCheckpoint: number | null = null;
                const newVisited = new Set(prev.visitedCheckpoints);

                checkpointPositions.forEach((pos, index) => {
                    const distance = Math.abs(newPlayerX - pos);
                    if (distance < 100) {
                        activeCheckpoint = index;
                        newVisited.add(index);
                    }
                });

                // Check level completion
                const isComplete = newPlayerX >= prev.worldWidth - 60;

                if (isComplete && !prev.isLevelComplete) {
                    // Trigger level complete callback
                    setTimeout(() => {
                        onLevelComplete?.(prev.level);
                    }, 100);
                }

                return {
                    ...prev,
                    playerX: newPlayerX,
                    levelProgress: progress,
                    activeCheckpoint,
                    visitedCheckpoints: newVisited,
                    isLevelComplete: isComplete,
                    isPlaying: !isComplete,
                };
            });

            animationFrameRef.current = requestAnimationFrame(gameLoop);
        },
        [gameState.isPlaying, gameState.isPaused, checkpointPositions, onLevelComplete]
    );

    // Start game loop
    useEffect(() => {
        if (gameState.isPlaying && !gameState.isPaused) {
            animationFrameRef.current = requestAnimationFrame(gameLoop);
        }

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [gameState.isPlaying, gameState.isPaused, gameLoop]);

    // Keyboard controls - simplified (no jump)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (keysPressed.current.has(e.code)) return;
            keysPressed.current.add(e.code);

            // Pause
            if (e.code === "Escape") {
                togglePause();
                return;
            }

            if (gameState.isPaused) return;

            // Left/Right movement only
            if (e.code === "ArrowLeft" || e.code === "KeyA") {
                setMoving("left");
            } else if (e.code === "ArrowRight" || e.code === "KeyD") {
                setMoving("right");
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            keysPressed.current.delete(e.code);

            // Stop movement when key released
            if (
                (e.code === "ArrowLeft" || e.code === "KeyA") &&
                !keysPressed.current.has("ArrowRight") &&
                !keysPressed.current.has("KeyD")
            ) {
                setMoving("none");
            } else if (
                (e.code === "ArrowRight" || e.code === "KeyD") &&
                !keysPressed.current.has("ArrowLeft") &&
                !keysPressed.current.has("KeyA")
            ) {
                setMoving("none");
            }
        };

        globalThis.addEventListener("keydown", handleKeyDown);
        globalThis.addEventListener("keyup", handleKeyUp);

        return () => {
            globalThis.removeEventListener("keydown", handleKeyDown);
            globalThis.removeEventListener("keyup", handleKeyUp);
        };
    }, [gameState.isPaused, setMoving, togglePause]);

    return {
        gameState,
        startGame,
        togglePause,
        nextLevel,
        goToLevel,
        setMoving,
        events,
        levels,
    };
}
