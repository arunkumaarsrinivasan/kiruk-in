"use client";

/**
 * MazeNav — the playable maze view, staged in a phone frame under a fake
 * KIRUK bar so the texture is judged at ship size.
 *
 * Movement mirrors the old GameMenuOverlay:
 *   - WASD / arrows: one tile. Stepping onto a door sets pendingNav (stay put).
 *   - Enter: confirm pendingNav (or open the nearest door within proximity).
 *   - Esc: cancel pendingNav, then (again) close.
 *   - Click/tap a floor tile: BFS auto-path.
 *   - Click/tap a door tile: BFS to the tile, then auto-open on arrival.
 *   - On-screen D-pad mirrors WASD for touch.
 *
 * A visually hidden link list keeps the menu usable without walking — the maze
 * is the spatial layer, not the only path to a destination.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { bfsPath, generate, type Maze } from "./generate";
import { DESTINATIONS, type MazeConfig } from "./types";
import { EyeDoor, PlayerCharacter } from "./pieces";

type Dir = "up" | "down" | "left" | "right";

const DEST_BY_ID = new Map(DESTINATIONS.map((d) => [d.id, d]));

export interface MazeNavHandle {
  /** Re-roll the seed (used by the harness Shuffle button). */
  shuffle: () => void;
}

function isWalkable(c: string): boolean {
  return c === "." || (c >= "1" && c <= "5") || c === "P";
}

function isDoor(c: string): boolean {
  return c >= "1" && c <= "5";
}

export function MazeNav({
  config,
  onClose,
}: {
  config: MazeConfig;
  onClose: () => void;
}) {
  const maze: Maze = useMemo(() => generate(config), [config]);
  const { map, spawn, doors } = maze;

  const stageRef = useRef<HTMLDivElement>(null);
  const [stageSize, setStageSize] = useState({ w: 390, h: 780 });
  const [player, setPlayer] = useState(spawn);
  const [direction, setDirection] = useState<Dir>("down");
  const [pending, setPending] = useState<number | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const walkingRef = useRef<number | null>(null);

  // Reset player when the map changes.
  useEffect(() => {
    setPlayer(spawn);
    setPending(null);
    setHint(null);
    setDirection("down");
  }, [map, spawn]);

  // Measure the stage to compute tile size.
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const update = () => {
      const r = el.getBoundingClientRect();
      setStageSize({ w: r.width, h: r.height });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const cols = map[0]?.length ?? 0;
  const rows = map.length;
  // Map area = stage minus the fake bar (44px) and footer (28px).
  const mapW = stageSize.w - 16;
  const mapH = stageSize.h - 44 - 28 - 16;
  const tileSize = useMemo(() => {
    const fit = Math.floor(Math.min(mapW / cols, mapH / rows));
    return Math.max(10, Math.min(config.tileSize, fit));
  }, [mapW, mapH, cols, rows, config.tileSize]);

  const navigate = useCallback((id: number) => {
    const dest = DEST_BY_ID.get(id);
    if (!dest) return;
    // In the lab we don't actually route; close the stage so the user stays in the harness.
    setHint(`→ ${dest.label} · ${dest.href}`);
  }, []);

  // Nearest door within proximity radius (Chebyshev).
  const nearestDoor = useCallback((x: number, y: number) => {
    let best: { id: number; dist: number } | null = null;
    for (const d of doors) {
      const dist = Math.max(Math.abs(d.x - x), Math.abs(d.y - y));
      if (dist <= config.proximityRadius && (!best || dist < best.dist)) {
        best = { id: d.id, dist };
      }
    }
    return best?.id ?? null;
  }, [doors, config.proximityRadius]);

  const tryMove = useCallback((dx: number, dy: number) => {
    if (walkingRef.current) return;
    setPlayer((prev) => {
      const nx = prev.x + dx;
      const ny = prev.y + dy;
      if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) return prev;
      const c = map[ny][nx];
      if (c === "W") return prev;
      if (dx > 0) setDirection("right");
      else if (dx < 0) setDirection("left");
      else if (dy > 0) setDirection("down");
      else setDirection("up");
      if (isDoor(c)) {
        setPending(Number(c));
        setHint(`Enter ${DEST_BY_ID.get(Number(c))?.label}? Press Enter to open.`);
        return prev;
      }
      setPending(null);
      return { x: nx, y: ny };
    });
  }, [cols, rows, map]);

  const stopWalk = useCallback(() => {
    if (walkingRef.current) {
      clearInterval(walkingRef.current);
      walkingRef.current = null;
    }
  }, []);

  const walkPath = useCallback((path: Array<{ x: number; y: number }>, onArrive?: () => void) => {
    stopWalk();
    if (path.length === 0) {
      onArrive?.();
      return;
    }
    let step = 0;
    walkingRef.current = window.setInterval(() => {
      if (step >= path.length) {
        stopWalk();
        onArrive?.();
        return;
      }
      const next = path[step];
      setPlayer((prev) => {
        if (next.x > prev.x) setDirection("right");
        else if (next.x < prev.x) setDirection("left");
        else if (next.y > prev.y) setDirection("down");
        else if (next.y < prev.y) setDirection("up");
        return next;
      });
      step++;
    }, config.pathStepMs);
  }, [config.pathStepMs, stopWalk]);

  const handleTileClick = useCallback((x: number, y: number) => {
    if (walkingRef.current) return;
    const c = map[y]?.[x];
    if (!isWalkable(c)) return;
    const path = bfsPath(map, player, { x, y });
    if (path.length === 0) return;
    if (isDoor(c)) {
      // pathfind to the tile, then auto-open
      walkPath(path, () => {
        setPlayer({ x, y });
        navigate(Number(c));
      });
    } else {
      walkPath(path);
    }
  }, [map, player, walkPath, navigate]);

  // Keyboard.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        if (pending != null) {
          navigate(pending);
          setPending(null);
          setHint(null);
          return;
        }
        const near = nearestDoor(player.x, player.y);
        if (near != null) {
          navigate(near);
          setHint(null);
        }
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        if (pending != null) {
          setPending(null);
          setHint(null);
          return;
        }
        onClose();
        return;
      }
      if (pending != null) return;
      switch (e.key) {
        case "ArrowUp":
        case "w":
        case "W":
          e.preventDefault();
          tryMove(0, -1);
          break;
        case "ArrowDown":
        case "s":
        case "S":
          e.preventDefault();
          tryMove(0, 1);
          break;
        case "ArrowLeft":
        case "a":
        case "A":
          e.preventDefault();
          tryMove(-1, 0);
          break;
        case "ArrowRight":
        case "d":
        case "D":
          e.preventDefault();
          tryMove(1, 0);
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [tryMove, pending, player, nearestDoor, navigate, onClose]);

  useEffect(() => () => stopWalk(), [stopWalk]);

  const activeDoorId = useMemo(() => {
    if (pending != null) return pending;
    return nearestDoor(player.x, player.y);
  }, [pending, nearestDoor, player]);

  return (
    <div
      className="relative flex flex-col"
      style={{
        width: 390,
        height: 844,
        maxWidth: "100vw",
        maxHeight: "100vh",
        background: "var(--bg-main)",
        fontFamily: "var(--font-main, ui-monospace, Menlo, monospace)",
        color: "var(--text-main)",
      }}
    >
      {/* Fake KIRUK bar — judges the maze under the real header height. */}
      <div
        className="flex items-center justify-between border-b-2 px-3"
        style={{
          height: 44,
          borderColor: "var(--border-color)",
          background: "var(--nav-surface)",
        }}
      >
        <span className="text-[11px] font-bold tracking-wider" style={{ color: "var(--accent-color)" }}>
          ◉ KIRUK®
        </span>
        <span className="text-[9px] font-mono uppercase tracking-[0.18em]" style={{ color: "var(--nav-text-muted)" }}>
          NAVIGATION MAP
        </span>
        <button
          onClick={onClose}
          className="border-2 px-1.5 text-[10px] font-mono"
          style={{ borderColor: "var(--border-color)", color: "var(--text-main)" }}
          aria-label="Close menu"
        >
          ✕
        </button>
      </div>

      {/* Map stage. */}
      <div
        ref={stageRef}
        className="relative flex flex-1 items-center justify-center overflow-hidden"
        style={{ padding: 8 }}
      >
        <div
          className="relative grid"
          style={{
            width: cols * tileSize,
            height: rows * tileSize,
            gridTemplateColumns: `repeat(${cols}, ${tileSize}px)`,
            gridTemplateRows: `repeat(${rows}, ${tileSize}px)`,
            border: `2px solid var(--border-color)`,
            background: "var(--bg-card)",
          }}
        >
          {map.map((row, y) =>
            row.split("").map((cell, x) => {
              const isWall = cell === "W";
              const doorDest = isDoor(cell) ? DEST_BY_ID.get(Number(cell)) : null;
              const isDoorHighlighted = doorDest ? activeDoorId === doorDest.id : false;
              return (
                <div
                  key={`${x}-${y}`}
                  onClick={() => !isWall && handleTileClick(x, y)}
                  className={cn("relative", isWall ? "cursor-default" : "cursor-pointer")}
                  style={{
                    gridColumnStart: x + 1,
                    gridRowStart: y + 1,
                  }}
                >
                  {isWall && (
                    <div
                      className="absolute inset-0"
                      style={{
                        background: "var(--border-color)",
                        boxShadow: `inset ${config.wallBevel}px ${config.wallBevel}px 0 var(--bg-card), inset -${config.wallBevel}px -${config.wallBevel}px 0 var(--bg-main)`,
                      }}
                    />
                  )}
                  {!isWall && (
                    <div
                      className="absolute"
                      style={{
                        inset: config.corridorInset,
                        background: "var(--nav-surface)",
                      }}
                    />
                  )}
                  {doorDest && (
                    <EyeDoor
                      dest={doorDest}
                      tileSize={tileSize}
                      highlighted={isDoorHighlighted}
                      glow={config.doorGlow}
                      labelScale={config.labelScale}
                    />
                  )}
                </div>
              );
            }),
          )}

          {/* Player token anchored to its grid cell. */}
          <motion.div
            className="pointer-events-none"
            style={{
              gridColumnStart: player.x + 1,
              gridRowStart: player.y + 1,
              width: tileSize,
              height: tileSize,
              zIndex: 30,
            }}
            transition={{ type: "tween", ease: "linear", duration: config.pathStepMs / 1000 }}
          >
            <PlayerCharacter tileSize={tileSize} direction={direction} scale={config.playerScale} />
          </motion.div>
        </div>

        {/* Proximity / pending prompt. */}
        <AnimatePresence>
          {hint && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="absolute bottom-2 left-1/2 -translate-x-1/2 border-2 px-2 py-1 text-[10px] font-mono"
              style={{
                maxWidth: 360,
                background: "var(--bg-card)",
                borderColor: "var(--accent-color)",
                color: "var(--accent-color)",
                boxShadow: "4px 4px 0 0 var(--border-color)",
              }}
            >
              {hint}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer controls. */}
      <div
        className="flex items-center justify-between border-t-2 px-2"
        style={{ height: 28, borderColor: "var(--border-color)", background: "var(--bg-card)" }}
      >
        <span className="text-[8px] font-mono uppercase" style={{ color: "var(--text-muted)" }}>
          [WASD] · [TAP] · [ENTER] · [ESC]
        </span>
        {config.showDpad ? (
          <div className="flex items-center gap-1">
            {(["up", "left", "down", "right"] as Dir[]).map((d) => (
              <button
                key={d}
                onClick={() => {
                  if (d === "up") tryMove(0, -1);
                  if (d === "down") tryMove(0, 1);
                  if (d === "left") tryMove(-1, 0);
                  if (d === "right") tryMove(1, 0);
                }}
                className="flex h-5 w-5 items-center justify-center border text-[9px] font-mono"
                style={{ borderColor: "var(--border-color)", color: "var(--text-main)" }}
                aria-label={`Move ${d}`}
              >
                {d === "up" ? "▲" : d === "down" ? "▼" : d === "left" ? "◀" : "▶"}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {/* Visually hidden link list — the maze is the spatial layer, not the only path. */}
      <nav className="sr-only" aria-label="Site">
        {DESTINATIONS.map((d) => (
          <Link key={d.id} href={d.href}>
            {d.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
