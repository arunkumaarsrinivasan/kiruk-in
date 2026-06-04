"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getGameEntry } from "@/components/ui/arcade/game-registry";
import { useGridGameLoop } from "@/components/ui/arcade/use-grid-game-loop";
import type { GridGameEngine } from "@/components/ui/arcade/types";

const COLS = 30;
const ROWS = 10;

function readCssVar(name: string, fallback: string): string {
  if (typeof document === "undefined") return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

export interface FooterGameProps {
  gameId: string;
  height?: number;
  className?: string;
  canvasClassName?: string;
  pixelated?: boolean;
  scanlines?: boolean;
  /** Bump to force engine reset without changing game id */
  resetNonce?: number;
  onGameOver?: (score: number | undefined) => void;
}

export function FooterGame({
  gameId,
  height = 160,
  className,
  canvasClassName,
  pixelated = false,
  scanlines = false,
  resetNonce = 0,
  onGameOver,
}: FooterGameProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [engine, setEngine] = useState<GridGameEngine | null>(null);
  const [inView, setInView] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [hud, setHud] = useState<{
    status?: string;
    score?: number;
    isGameOver?: boolean;
    isPaused?: boolean;
  }>({});
  const cell = useRef(16);
  const gameOverFired = useRef(false);

  useEffect(() => {
    const entry = getGameEntry(gameId);
    if (!entry) return;
    const e = entry.createEngine();
    e.init(COLS, ROWS);
    gameOverFired.current = false;
    setEngine(e);
    return () => {
      try {
        e.reset();
      } catch {
        /* noop */
      }
    };
  }, [gameId, resetNonce]);

  useEffect(() => {
    setReduced(
      globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false,
    );
    const mq = globalThis.matchMedia?.("(prefers-reduced-motion: reduce)");
    const onChange = () =>
      setReduced(mq?.matches ?? false);
    mq?.addEventListener("change", onChange);
    return () => mq?.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([en]) => setInView(en.isIntersecting),
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const cv = canvasRef.current;
    const wrap = wrapRef.current;
    if (!cv || !wrap) return;

    const fit = () => {
      const w = wrap.getBoundingClientRect().width;
      const dpr = Math.min(globalThis.devicePixelRatio || 1, 2);
      cell.current = Math.max(8, Math.floor(w / COLS));
      cv.width = Math.round(COLS * cell.current * dpr);
      cv.height = Math.round(ROWS * cell.current * dpr);
      cv.style.width = `${COLS * cell.current}px`;
      cv.style.height = `${ROWS * cell.current}px`;
      const ctx = cv.getContext("2d");
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, []);

  const drawGrid = useCallback(
    (ctx: CanvasRenderingContext2D, c: number, w: number, h: number) => {
      const border = readCssVar("--border-color", "rgba(128,128,128,0.25)");
      ctx.strokeStyle = border;
      ctx.globalAlpha = 0.35;
      ctx.lineWidth = 1;
      for (let x = 0; x <= COLS; x++) {
        ctx.beginPath();
        ctx.moveTo(x * c + 0.5, 0);
        ctx.lineTo(x * c + 0.5, h);
        ctx.stroke();
      }
      for (let y = 0; y <= ROWS; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * c + 0.5);
        ctx.lineTo(w, y * c + 0.5);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    },
    [],
  );

  const draw = useMemo(
    () => () => {
      const cv = canvasRef.current;
      const e = engine;
      if (!cv || !e) return;
      const ctx = cv.getContext("2d");
      if (!ctx) return;

      const c = cell.current;
      const w = COLS * c;
      const h = ROWS * c;
      const accent = readCssVar("--accent-color", "#39ff14");
      const bg = readCssVar("--bg-main", "#000");

      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);
      drawGrid(ctx, c, w, h);

      const s = e.renderState();

      for (const seg of s.segments ?? []) {
        ctx.globalAlpha = seg.opacity ?? 1;
        ctx.fillStyle = seg.color || accent;
        ctx.fillRect(seg.x * c + 1, seg.y * c + 1, c - 2, c - 2);
      }
      ctx.globalAlpha = 1;

      for (const f of s.food ?? []) {
        ctx.fillStyle = f.color || accent;
        if (f.icon) {
          ctx.font = `${Math.max(10, c - 2)}px var(--font-main, monospace)`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(f.icon, f.x * c + c / 2, f.y * c + c / 2);
        } else if (f.label) {
          ctx.font = `${Math.floor(c * 0.65)}px var(--font-main, monospace)`;
          ctx.textAlign = "left";
          ctx.textBaseline = "middle";
          const span = f.labelWidth ?? 1;
          ctx.fillText(f.label, f.x * c + 2, f.y * c + c / 2, span * c - 4);
        } else {
          ctx.beginPath();
          ctx.arc(f.x * c + c / 2, f.y * c + c / 2, c / 2 - 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      if (s.isGameOver) {
        ctx.fillStyle = "color-mix(in srgb, var(--bg-main) 72%, transparent)";
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = accent;
        ctx.font = `bold ${Math.floor(c * 0.9)}px var(--font-main, monospace)`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("GAME OVER", w / 2, h / 2 - c);
        if (typeof s.score === "number") {
          ctx.font = `${Math.floor(c * 0.55)}px var(--font-main, monospace)`;
          ctx.fillText(`score ${s.score}`, w / 2, h / 2 + c * 0.5);
        }
        if (!gameOverFired.current) {
          gameOverFired.current = true;
          onGameOver?.(s.score);
        }
      } else {
        gameOverFired.current = false;
      }

      setHud((prev) => {
        const next = {
          status: s.statusText,
          score: s.score,
          isGameOver: s.isGameOver,
          isPaused: s.isPaused,
        };
        if (
          prev.status === next.status &&
          prev.score === next.score &&
          prev.isGameOver === next.isGameOver &&
          prev.isPaused === next.isPaused
        ) {
          return prev;
        }
        return next;
      });
    },
    [engine, drawGrid, onGameOver],
  );

  useGridGameLoop({
    engine,
    isRunning: !!engine && inView && !reduced && !hud.isPaused,
    onFrame: draw,
  });

  useEffect(() => {
    if (engine) draw();
  }, [engine, draw]);

  const toCell = (e: React.PointerEvent) => {
    const r = canvasRef.current!.getBoundingClientRect();
    const c = cell.current;
    return {
      x: Math.max(0, Math.min(COLS - 1, Math.floor((e.clientX - r.left) / c))),
      y: Math.max(0, Math.min(ROWS - 1, Math.floor((e.clientY - r.top) / c))),
    };
  };

  const entry = getGameEntry(gameId);
  const statusLabel =
    hud.isGameOver
      ? "game over"
      : hud.isPaused
        ? "paused"
        : hud.status ?? entry?.label ?? gameId;

  return (
    <div
      ref={wrapRef}
      data-footer-game={gameId}
      data-footer-game-state={
        hud.isGameOver ? "over" : hud.isPaused ? "paused" : inView && !reduced ? "live" : "idle"
      }
      className={`relative w-full overflow-hidden touch-none select-none ${className ?? ""}`}
      style={{ height, minHeight: height }}
      onPointerMove={(e) => engine?.onPointerMove(toCell(e))}
      onPointerLeave={() => engine?.onPointerLeave()}
      onPointerDown={(e) => {
        e.preventDefault();
        engine?.onClick(toCell(e));
        draw();
      }}
      role="application"
      aria-label={`${entry?.label ?? gameId} arcade mini-game`}
    >
      <canvas
        ref={canvasRef}
        className={`mx-auto block ${pixelated ? "image-rendering-pixelated" : ""} ${canvasClassName ?? ""}`}
        style={
          pixelated
            ? { imageRendering: "pixelated" }
            : undefined
        }
      />

      {scanlines ? (
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.35) 2px, rgba(0,0,0,0.35) 4px)",
          }}
          aria-hidden
        />
      ) : null}

      <div
        className="pointer-events-none absolute bottom-1 left-2 right-2 flex items-end justify-between gap-2 text-[10px] uppercase tracking-[0.16em]"
        style={{ color: "var(--text-muted)" }}
      >
        <span style={{ color: hud.isGameOver ? "var(--accent-color)" : undefined }}>
          {statusLabel}
        </span>
        {typeof hud.score === "number" ? (
          <span className="tabular-nums">score · {hud.score}</span>
        ) : null}
      </div>
    </div>
  );
}

export default FooterGame;
