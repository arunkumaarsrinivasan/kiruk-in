"use client";

/**
 * LifeWalk — a minimal side-scrolling walk through life moments, mirroring the
 * /about "Time Travel" concept: a little character strides a timeline; reaching
 * a milestone surfaces that moment. Walk with ← →, drag to scrub, or tap to
 * step. Reaching the end (or clicking) opens the full Time Travel. Reskins per
 * era via `palette`.
 *
 * One rAF loop, paused offscreen + under reduced-motion.
 */

import React, { useEffect, useRef, useState } from "react";
import type { GamePalette } from "./types";

export interface WalkMoment {
  year: number;
  icon: string;
  title: string;
  sub?: string;
}

const SPACING = 168;
const EDGE = SPACING * 0.7;

export function LifeWalk({
  palette,
  moments,
  onOpen,
  height = 220,
  className,
}: {
  palette: GamePalette;
  moments: WalkMoment[];
  onOpen: () => void;
  height?: number;
  className?: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const movedRef = useRef(false);
  const [current, setCurrent] = useState(0);
  const [reachedEnd, setReachedEnd] = useState(false);

  const worldW = EDGE * 2 + (moments.length - 1) * SPACING;

  const W = useRef({
    w: 600,
    h: height,
    charX: EDGE,
    camX: 0,
    keys: { l: false, r: false },
    drag: null as null | { startPx: number; startChar: number },
    legPhase: 0,
    moving: false,
    inView: true,
    reduced: false,
    raf: 0,
    last: 0,
    cur: 0,
  });

  // gating + reduced motion
  useEffect(() => {
    const S = W.current;
    S.reduced =
      globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => (S.inView = e.isIntersecting), {
      threshold: 0.15,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // resize (DPR)
  useEffect(() => {
    const cv = canvasRef.current;
    const wrap = wrapRef.current;
    if (!cv || !wrap) return;
    const fit = () => {
      const r = wrap.getBoundingClientRect();
      const dpr = Math.min(globalThis.devicePixelRatio || 1, 2);
      W.current.w = r.width;
      W.current.h = height;
      cv.width = Math.round(r.width * dpr);
      cv.height = Math.round(height * dpr);
      cv.style.width = `${r.width}px`;
      cv.style.height = `${height}px`;
      cv.getContext("2d")?.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [height]);

  // keyboard
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const set = (e: KeyboardEvent, v: boolean) => {
      if (e.key === "ArrowLeft" || e.key === "a") {
        W.current.keys.l = v;
        e.preventDefault();
      } else if (e.key === "ArrowRight" || e.key === "d") {
        W.current.keys.r = v;
        e.preventDefault();
      } else if (v && e.key === "Enter") {
        onOpen();
      }
    };
    const down = (e: KeyboardEvent) => set(e, true);
    const up = (e: KeyboardEvent) => set(e, false);
    const clear = () => {
      W.current.keys.l = false;
      W.current.keys.r = false;
    };
    el.addEventListener("keydown", down);
    // keyup/blur on window so a release after focus-loss still clears the key
    // (otherwise a held arrow would walk the character forever).
    window.addEventListener("keyup", up);
    window.addEventListener("blur", clear);
    return () => {
      el.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", clear);
    };
  }, [onOpen]);

  // loop
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const P = palette;
    const S = W.current;
    const momPts = moments.map((m, i) => ({ m, x: EDGE + i * SPACING }));

    const drawChar = (x: number, groundY: number, moving: boolean) => {
      const y = groundY;
      ctx.save();
      ctx.fillStyle = P.fg;
      if (P.glow) {
        ctx.shadowColor = P.bright;
        ctx.shadowBlur = P.glow;
      }
      ctx.fillRect(x - 6, y - 18, 12, 14); // body
      ctx.fillRect(x + 3, y - 24, 8, 8); // head
      ctx.save();
      ctx.fillStyle = P.bg;
      ctx.fillRect(x + 8, y - 22, 2, 2); // eye
      ctx.restore();
      const sw = moving && !S.reduced ? Math.sin(S.legPhase) * 4 : 0;
      ctx.fillRect(x - 5, y - 4, 4, 6 + sw); // legs
      ctx.fillRect(x + 1, y - 4, 4, 6 - sw);
      ctx.restore();
    };

    const loop = (t: number) => {
      S.raf = requestAnimationFrame(loop);
      const dt = Math.min(2, (t - (S.last || t)) / 16.67);
      S.last = t;
      const live = S.inView;
      if (!live) return; // paused offscreen — skip movement + repaint
      const { w, h } = S;
      const groundY = h - 30;

      // movement
      let vx = 0;
      if (S.keys.r) vx += 3.2;
      if (S.keys.l) vx -= 3.2;
      if (vx !== 0 && live) {
        S.charX = Math.max(20, Math.min(worldW - 20, S.charX + vx * dt));
        S.moving = true;
        S.legPhase += 0.32 * dt;
      } else {
        S.moving = false;
      }

      // camera follows
      const targetCam = Math.max(0, Math.min(worldW - w, S.charX - w * 0.4));
      S.camX += (targetCam - S.camX) * Math.min(1, 0.12 * dt);

      // current moment
      let nearest = 0;
      let best = Infinity;
      momPts.forEach((p, i) => {
        const d = Math.abs(p.x - S.charX);
        if (d < best) {
          best = d;
          nearest = i;
        }
      });
      if (nearest !== S.cur) {
        S.cur = nearest;
        setCurrent(nearest);
      }
      if (S.charX >= worldW - 24) setReachedEnd(true);

      // ── render ──
      ctx.clearRect(0, 0, w, h);

      // faint star dust (parallax)
      ctx.save();
      ctx.fillStyle = P.dim;
      for (let i = 0; i < 40; i++) {
        const sx = ((i * 53) % worldW) - S.camX * 0.4;
        const wrapped = ((sx % w) + w) % w;
        const sy = (i * 29) % (groundY - 16);
        ctx.globalAlpha = 0.2 + ((i * 7) % 5) * 0.06;
        ctx.fillRect(wrapped, sy + 6, 1, 1);
      }
      ctx.restore();

      // ground
      ctx.save();
      ctx.strokeStyle = P.dim;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 6]);
      ctx.beginPath();
      ctx.moveTo(0, groundY + 3);
      ctx.lineTo(w, groundY + 3);
      ctx.stroke();
      ctx.restore();

      // timeline progress fill
      ctx.save();
      ctx.strokeStyle = P.accent;
      ctx.globalAlpha = 0.5;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0 - S.camX + EDGE, groundY + 3);
      ctx.lineTo(S.charX - S.camX, groundY + 3);
      ctx.stroke();
      ctx.restore();

      // milestones
      momPts.forEach((p, i) => {
        const x = p.x - S.camX;
        if (x < -40 || x > w + 40) return;
        const on = i === S.cur;
        const passed = S.charX >= p.x - 4;
        ctx.save();
        ctx.strokeStyle = on ? P.bright : passed ? P.accent : P.dim;
        ctx.globalAlpha = on ? 1 : passed ? 0.85 : 0.5;
        ctx.lineWidth = on ? 1.5 : 1;
        ctx.beginPath();
        ctx.moveTo(x, groundY);
        ctx.lineTo(x, groundY - (on ? 34 : 22));
        ctx.stroke();
        // node dot
        ctx.fillStyle = on ? P.bright : passed ? P.accent : P.dim;
        if (P.glow && on) {
          ctx.shadowColor = P.bright;
          ctx.shadowBlur = 10;
        }
        ctx.beginPath();
        ctx.arc(x, groundY - (on ? 34 : 22), on ? 3 : 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        // year label
        ctx.save();
        ctx.font = `12px ${P.font}`;
        ctx.fillStyle = on ? P.bright : P.dim;
        ctx.globalAlpha = on ? 1 : 0.7;
        ctx.textAlign = "center";
        ctx.fillText(String(p.m.year), x, groundY - (on ? 40 : 28));
        ctx.restore();
      });

      drawChar(S.charX - S.camX, groundY, S.moving);

      if (P.scanlines) {
        ctx.save();
        ctx.globalAlpha = 0.06;
        ctx.fillStyle = P.fg;
        for (let y = 0; y < h; y += 3) ctx.fillRect(0, y, w, 1);
        ctx.restore();
      }
    };

    S.raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(S.raf);
  }, [palette, moments, worldW]);

  // drag-to-scrub
  const onDown = (e: React.PointerEvent) => {
    movedRef.current = false;
    W.current.drag = { startPx: e.clientX, startChar: W.current.charX };
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    const d = W.current.drag;
    if (!d) return;
    const dx = e.clientX - d.startPx;
    if (Math.abs(dx) > 4) movedRef.current = true;
    W.current.charX = Math.max(20, Math.min(worldW - 20, d.startChar + dx * 1.4));
    W.current.moving = true;
    W.current.legPhase += 0.2;
  };
  const onUp = () => {
    W.current.drag = null;
  };

  const cur = moments[current];

  return (
    <div
      ref={wrapRef}
      tabIndex={0}
      role="button"
      aria-label="About — walk the timeline; Enter or click to open About"
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerLeave={onUp}
      onClick={() => {
        // tap opens; a drag-scrub does not
        if (!movedRef.current) onOpen();
      }}
      className={`group/walk relative w-full cursor-pointer select-none overflow-hidden ${className ?? ""}`}
      style={{
        background: palette.bg,
        border: `2px solid ${palette.dim}`,
        fontFamily: palette.font,
      }}
    >
      {/* header */}
      <div
        className="flex items-center justify-between px-3 py-1.5 text-[13px] uppercase tracking-[0.16em]"
        style={{ color: palette.dim, borderBottom: `1px solid ${palette.dim}` }}
      >
        <span style={{ color: palette.bright }}>⊳ ABOUT.walk</span>
        <span className="opacity-70">
          ← → walk · drag to scrub · {current + 1}/{moments.length}
        </span>
      </div>

      <canvas ref={canvasRef} className="block w-full" style={{ height }} />

      {/* current moment card */}
      <div
        className="flex items-center gap-2 px-3 py-1.5 text-[13px]"
        style={{ color: palette.dim, borderTop: `1px solid ${palette.dim}`, minHeight: 38 }}
      >
        {cur && (
          <>
            <span className="text-base leading-none">{cur.icon}</span>
            <span style={{ color: palette.bright }}>
              {cur.year} · {cur.title}
            </span>
            {cur.sub && (
              <span className="min-w-0 truncate opacity-80" style={{ color: palette.fg }}>
                — {cur.sub}
              </span>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpen();
              }}
              className="ml-auto shrink-0 min-h-11 min-w-11 px-2 py-0.5 text-[12px] uppercase tracking-wider"
              style={{ color: palette.bright, border: `1px solid ${palette.dim}` }}
            >
              {reachedEnd ? "open ⤢" : "full ⤢"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default LifeWalk;
