"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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

export type CelestialLoopNodes = {
    world: HTMLElement | null;
    player: HTMLElement | null;
    bg: HTMLElement | null;
    progressFill: HTMLElement | null;
    progressLabel: HTMLElement | null;
};

function snapshot(s: CelestialGameState): CelestialGameState {
    return {
        ...s,
        visitedCheckpoints: new Set(s.visitedCheckpoints),
    };
}

export function useCelestialEngine({
    levels,
    events,
    onLevelComplete,
    worldWidth = 2000,
}: UseCelestialEngineProps) {
    const sim = useRef<CelestialGameState>({
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
    const [gameState, setGameState] = useState<CelestialGameState>(() =>
        snapshot(sim.current),
    );

    const nodes = useRef<CelestialLoopNodes>({
        world: null,
        player: null,
        bg: null,
        progressFill: null,
        progressLabel: null,
    });
    const animationFrameRef = useRef(0);
    const lastTimeRef = useRef(0);
    const keysPressed = useRef<Set<string>>(new Set());
    const onLevelCompleteRef = useRef(onLevelComplete);
    onLevelCompleteRef.current = onLevelComplete;

    const checkpointPositions = useMemo(
        () => [worldWidth * 0.25, worldWidth * 0.5, worldWidth * 0.75],
        [worldWidth],
    );

    const publish = useCallback(() => {
        setGameState(snapshot(sim.current));
    }, []);

    const paint = useCallback(() => {
        const s = sim.current;
        const n = nodes.current;
        const cam = Math.max(0, s.playerX - 120);
        const bgCam = Math.max(0, s.playerX - 400);
        if (n.world) n.world.style.transform = `translate3d(${-cam}px,0,0)`;
        if (n.bg) n.bg.style.transform = `translate3d(${-bgCam}px,0,0)`;
        if (n.player) {
            const sx = s.isMovingLeft ? -1 : 1;
            n.player.style.transform = `translate3d(${s.playerX}px,0,0) scaleX(${sx})`;
        }
        if (n.progressFill) n.progressFill.style.width = `${s.levelProgress * 100}%`;
        if (n.progressLabel) {
            n.progressLabel.textContent = `${Math.round(s.levelProgress * 100)}%`;
        }
    }, []);

    const loopRefs = useMemo(
        () => ({
            world: (el: HTMLDivElement | null) => {
                nodes.current.world = el;
                if (el) paint();
            },
            player: (el: HTMLDivElement | null) => {
                nodes.current.player = el;
                if (el) paint();
            },
            bg: (el: HTMLDivElement | null) => {
                nodes.current.bg = el;
                if (el) paint();
            },
            progressFill: (el: HTMLDivElement | null) => {
                nodes.current.progressFill = el;
                if (el) paint();
            },
            progressLabel: (el: HTMLSpanElement | null) => {
                nodes.current.progressLabel = el;
                if (el) paint();
            },
        }),
        [paint],
    );

    const stopLoop = useCallback(() => {
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = 0;
        }
        lastTimeRef.current = 0;
    }, []);

    const gameLoop = useCallback(
        (timestamp: number) => {
            const s = sim.current;
            if (!s.isPlaying || s.isPaused || document.hidden) {
                animationFrameRef.current = 0;
                lastTimeRef.current = 0;
                return;
            }

            const deltaTime = lastTimeRef.current
                ? (timestamp - lastTimeRef.current) / 16.67
                : 1;
            lastTimeRef.current = timestamp;

            let newPlayerX = s.playerX;
            const moveSpeed = s.speed * deltaTime;
            if (s.isMovingRight) {
                newPlayerX = Math.min(s.worldWidth - 40, s.playerX + moveSpeed);
            } else if (s.isMovingLeft) {
                newPlayerX = Math.max(50, s.playerX - moveSpeed);
            }

            s.playerX = newPlayerX;
            s.levelProgress = Math.max(
                0,
                Math.min(1, (newPlayerX - 50) / (s.worldWidth - 90)),
            );

            let activeCheckpoint: number | null = null;
            checkpointPositions.forEach((pos, index) => {
                if (Math.abs(newPlayerX - pos) < 100) {
                    activeCheckpoint = index;
                    s.visitedCheckpoints.add(index);
                }
            });

            const isComplete = newPlayerX >= s.worldWidth - 60;
            const checkpointChanged = activeCheckpoint !== s.activeCheckpoint;
            const justComplete = isComplete && !s.isLevelComplete;
            s.activeCheckpoint = activeCheckpoint;

            if (justComplete) {
                s.isLevelComplete = true;
                s.isPlaying = false;
            }

            paint();

            if (checkpointChanged || justComplete) {
                publish();
            }
            if (justComplete) {
                const level = s.level;
                window.setTimeout(() => onLevelCompleteRef.current?.(level), 100);
            }

            if (s.isPlaying && (s.isMovingLeft || s.isMovingRight)) {
                animationFrameRef.current = requestAnimationFrame(gameLoop);
            } else {
                animationFrameRef.current = 0;
                lastTimeRef.current = 0;
            }
        },
        [checkpointPositions, paint, publish],
    );

    const kick = useCallback(() => {
        const s = sim.current;
        if (
            animationFrameRef.current ||
            !s.isPlaying ||
            s.isPaused ||
            !(s.isMovingLeft || s.isMovingRight)
        ) {
            return;
        }
        lastTimeRef.current = 0;
        animationFrameRef.current = requestAnimationFrame(gameLoop);
    }, [gameLoop]);

    const startGame = useCallback(() => {
        const s = sim.current;
        s.isPlaying = true;
        s.isPaused = false;
        s.isLevelComplete = false;
        s.playerX = 50;
        s.levelProgress = 0;
        s.activeCheckpoint = null;
        s.visitedCheckpoints = new Set();
        s.isMovingLeft = false;
        s.isMovingRight = false;
        stopLoop();
        paint();
        publish();
    }, [paint, publish, stopLoop]);

    const togglePause = useCallback(() => {
        const s = sim.current;
        s.isPaused = !s.isPaused;
        if (s.isPaused) stopLoop();
        else kick();
        publish();
    }, [kick, publish, stopLoop]);

    const nextLevel = useCallback(() => {
        const s = sim.current;
        if (s.level >= levels.length - 1) return;
        s.level += 1;
        s.isPlaying = true;
        s.isPaused = false;
        s.isLevelComplete = false;
        s.playerX = 50;
        s.levelProgress = 0;
        s.activeCheckpoint = null;
        s.visitedCheckpoints = new Set();
        s.isMovingLeft = false;
        s.isMovingRight = false;
        stopLoop();
        paint();
        publish();
    }, [levels.length, paint, publish, stopLoop]);

    const goToLevel = useCallback(
        (levelIndex: number) => {
            if (levelIndex < 0 || levelIndex >= levels.length) return;
            const s = sim.current;
            s.level = levelIndex;
            s.isPlaying = true;
            s.isPaused = false;
            s.isLevelComplete = false;
            s.playerX = 50;
            s.levelProgress = 0;
            s.activeCheckpoint = null;
            s.visitedCheckpoints = new Set();
            s.isMovingLeft = false;
            s.isMovingRight = false;
            stopLoop();
            paint();
            publish();
        },
        [levels.length, paint, publish, stopLoop],
    );

    const setMoving = useCallback(
        (direction: "left" | "right" | "none") => {
            const s = sim.current;
            s.isMovingLeft = direction === "left";
            s.isMovingRight = direction === "right";
            publish();
            if (direction === "none") return;
            kick();
        },
        [kick, publish],
    );

    useEffect(() => {
        const onVis = () => {
            if (document.hidden) stopLoop();
            else kick();
        };
        document.addEventListener("visibilitychange", onVis);
        return () => {
            document.removeEventListener("visibilitychange", onVis);
            stopLoop();
        };
    }, [kick, stopLoop]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (keysPressed.current.has(e.code)) return;
            keysPressed.current.add(e.code);

            if (e.code === "Escape") {
                togglePause();
                return;
            }

            if (sim.current.isPaused) return;

            if (e.code === "ArrowLeft" || e.code === "KeyA") {
                setMoving("left");
            } else if (e.code === "ArrowRight" || e.code === "KeyD") {
                setMoving("right");
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            keysPressed.current.delete(e.code);

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
    }, [setMoving, togglePause]);

    return {
        gameState,
        startGame,
        togglePause,
        nextLevel,
        goToLevel,
        setMoving,
        loopRefs,
        events,
        levels,
    };
}
