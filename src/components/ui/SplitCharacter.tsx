"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useDesignEra } from "@/contexts/DesignEraContext";
import { useChromeQuiet } from "@/hooks/useChromeQuiet";

function parseColor(v: string): [number, number, number] {
  if (v.startsWith("#")) {
    const h = v.replace("#", "");
    if (h.length === 3)
      return [
        Number.parseInt(h[0] + h[0], 16),
        Number.parseInt(h[1] + h[1], 16),
        Number.parseInt(h[2] + h[2], 16),
      ];
    return [
      Number.parseInt(h.slice(0, 2), 16),
      Number.parseInt(h.slice(2, 4), 16),
      Number.parseInt(h.slice(4, 6), 16),
    ];
  }
  const m = v.match(/\d+/g);
  if (m && m.length >= 3) return [+m[0], +m[1], +m[2]];
  return [120, 120, 120];
}

function clamp(v: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, v));
}
function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}
const easeOut = (t: number) => 1 - (1 - t) ** 3;

export type CharacterSide = "designer" | "developer" | null;

interface EraProfile {
  name: string;
  warmGrad: [string, string];
  coolGrad: [string, string];
  glow: number;
  dashed: boolean;
  pixelSnap: boolean;
  scanlines: boolean;
  bloom: boolean;
  glassOverlay: boolean;
}

function resolveEraProfile(id: number): EraProfile {
  if (id < 2000)
    return {
      name: "RETRO",
      warmGrad: ["#d4a03c", "#aa7020"],
      coolGrad: ["#3ca0d4", "#2070aa"],
      glow: 0.06,
      dashed: true,
      pixelSnap: true,
      scanlines: true,
      bloom: false,
      glassOverlay: false,
    };
  if (id < 2020)
    return {
      name: "CLASSIC",
      warmGrad: ["#ffd4a8", "#ff9b6b"],
      coolGrad: ["#a8d8ff", "#6b8fff"],
      glow: 0.12,
      dashed: false,
      pixelSnap: false,
      scanlines: false,
      bloom: false,
      glassOverlay: false,
    };
  return {
    name: "MODERN",
    warmGrad: ["#ffe0c0", "#ffb080"],
    coolGrad: ["#c0e0ff", "#80b0ff"],
    glow: 0.22,
    dashed: false,
    pixelSnap: false,
    scanlines: false,
    bloom: true,
    glassOverlay: true,
  };
}

function snapToGrid(v: number): number {
  return Math.round(v / 2) * 2;
}

interface DrawCtx {
  ctx: CanvasRenderingContext2D;
  W: number;
  H: number;
  px: number;
  py: number;
  ar: number;
  ag: number;
  ab: number;
  accent: string;
  textMain: string;
  border: string;
  profile: EraProfile;
  elapsed: number;
  hoverIntensity: number;
  activeSide: CharacterSide;
  sideAnimT: number; // 0-1 smooth transition of side selection
}

function drawSplitCharacter(
  d: DrawCtx,
  cx: number,
  cy: number,
  R: number
) {
  const { ctx, px, py, profile, accent, border, elapsed, hoverIntensity, activeSide, sideAnimT } = d;
  const s = (v: number) => (profile.pixelSnap ? snapToGrid(v) : v);

  const headCx = s(cx);
  const headCy = s(cy);

  // Dim factor for inactive side
  const warmAlpha = activeSide === "developer" ? lerp(1, 0.35, sideAnimT) : 1;
  const coolAlpha = activeSide === "designer" ? lerp(1, 0.35, sideAnimT) : 1;

  // Active side glow
  if (activeSide === "designer" && sideAnimT > 0.1) {
    ctx.save();
    ctx.shadowColor = profile.warmGrad[0];
    ctx.shadowBlur = 24 * sideAnimT;
    ctx.beginPath();
    ctx.arc(headCx - R * 0.3, headCy, R * 0.8, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0,0,0,0)";
    ctx.fill();
    ctx.restore();
  }
  if (activeSide === "developer" && sideAnimT > 0.1) {
    ctx.save();
    ctx.shadowColor = profile.coolGrad[0];
    ctx.shadowBlur = 24 * sideAnimT;
    ctx.beginPath();
    ctx.arc(headCx + R * 0.3, headCy, R * 0.8, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0,0,0,0)";
    ctx.fill();
    ctx.restore();
  }

  if (profile.bloom) {
    ctx.save();
    ctx.shadowColor = accent;
    ctx.shadowBlur = 30 + hoverIntensity * 20;
    ctx.beginPath();
    ctx.arc(headCx, headCy, R + 8, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0,0,0,0)";
    ctx.fill();
    ctx.restore();
  }

  // Head left half
  ctx.save();
  ctx.beginPath();
  ctx.arc(headCx, headCy, R, 0, Math.PI * 2);
  ctx.clip();

  ctx.globalAlpha = warmAlpha;
  const warmG = ctx.createLinearGradient(headCx - R, headCy - R, headCx, headCy + R);
  warmG.addColorStop(0, profile.warmGrad[0]);
  warmG.addColorStop(1, profile.warmGrad[1]);
  ctx.fillStyle = warmG;
  ctx.fillRect(headCx - R, headCy - R, R, R * 2);

  ctx.globalAlpha = coolAlpha;
  const coolG = ctx.createLinearGradient(headCx, headCy - R, headCx + R, headCy + R);
  coolG.addColorStop(0, profile.coolGrad[0]);
  coolG.addColorStop(1, profile.coolGrad[1]);
  ctx.fillStyle = coolG;
  ctx.fillRect(headCx, headCy - R, R, R * 2);

  ctx.globalAlpha = 1;
  if (profile.glassOverlay) {
    const glass = ctx.createLinearGradient(headCx, headCy - R, headCx + R, headCy);
    glass.addColorStop(0, "rgba(255,255,255,0.18)");
    glass.addColorStop(0.5, "rgba(255,255,255,0.04)");
    glass.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = glass;
    ctx.fillRect(headCx, headCy - R, R, R * 2);
  }
  ctx.restore();

  ctx.strokeStyle = accent;
  ctx.lineWidth = profile.pixelSnap ? 2 : 1.5;
  if (profile.dashed) ctx.setLineDash([4, 5]);
  ctx.beginPath();
  ctx.arc(headCx, headCy, R, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  const splitPulse = 0.6 + 0.4 * Math.sin(elapsed * 1.8);
  ctx.save();
  ctx.shadowColor = accent;
  ctx.shadowBlur = 12 * splitPulse + hoverIntensity * 8;
  ctx.strokeStyle = accent;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(headCx, headCy - R + 4);
  ctx.lineTo(headCx, headCy + R - 4);
  ctx.stroke();
  ctx.restore();

  const eyeOx = px * 5;
  const eyeOy = py * 3;

  const blinkCycle = elapsed % 4;
  const isBlinking = blinkCycle > 3.85 && blinkCycle < 4;

  // Left eye (designer)
  const lEyeX = s(headCx - R * 0.3 + eyeOx);
  const lEyeY = s(headCy - R * 0.12 + eyeOy);
  const eyeR = R * 0.16;

  ctx.globalAlpha = warmAlpha;
  if (isBlinking) {
    ctx.strokeStyle = "#2a1a00";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(lEyeX - eyeR, lEyeY);
    ctx.lineTo(lEyeX + eyeR, lEyeY);
    ctx.stroke();
  } else {
    ctx.fillStyle = "#2a1a00";
    ctx.beginPath();
    ctx.arc(lEyeX, lEyeY, eyeR, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#d4903c";
    ctx.beginPath();
    ctx.arc(lEyeX, lEyeY, eyeR * 0.7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#1a0a00";
    ctx.beginPath();
    ctx.arc(lEyeX + px * 2.5, lEyeY + py * 1.5, eyeR * 0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.beginPath();
    ctx.arc(lEyeX - eyeR * 0.2, lEyeY - eyeR * 0.25, eyeR * 0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.25)";
    ctx.lineWidth = 1;
    const chR = eyeR * 0.5;
    ctx.beginPath();
    ctx.moveTo(lEyeX - chR, lEyeY);
    ctx.lineTo(lEyeX + chR, lEyeY);
    ctx.moveTo(lEyeX, lEyeY - chR);
    ctx.lineTo(lEyeX, lEyeY + chR);
    ctx.stroke();
  }

  // Right eye (developer terminal)
  const rEyeX = s(headCx + R * 0.3 + eyeOx);
  const rEyeY = s(headCy - R * 0.12 + eyeOy);
  const termW = R * 0.32;
  const termH = R * 0.24;

  ctx.globalAlpha = coolAlpha;
  if (isBlinking) {
    ctx.strokeStyle = "#40e0d0";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(rEyeX - termW / 2, rEyeY);
    ctx.lineTo(rEyeX + termW / 2, rEyeY);
    ctx.stroke();
  } else {
    ctx.fillStyle = "#0a1a2a";
    ctx.beginPath();
    ctx.roundRect(rEyeX - termW / 2, rEyeY - termH / 2, termW, termH, profile.pixelSnap ? 0 : 3);
    ctx.fill();
    ctx.fillStyle = "#1a3a5a";
    ctx.beginPath();
    ctx.roundRect(rEyeX - termW / 2 + 2, rEyeY - termH / 2 + 2, termW - 4, termH - 4, profile.pixelSnap ? 0 : 2);
    ctx.fill();

    const cursorOn = Math.floor(elapsed * 2.5) % 2 === 0;
    ctx.fillStyle = "#40e0d0";
    ctx.font = `${Math.round(termH * 0.55)}px monospace`;
    ctx.textBaseline = "middle";
    ctx.fillText(">_", rEyeX - termW / 4 + px * 1, rEyeY + py * 0.5);
    if (cursorOn) {
      const cursorX = rEyeX + termW / 4 - 2 + px * 1;
      ctx.fillRect(cursorX, rEyeY - termH * 0.18, 2, termH * 0.4);
    }
  }
  ctx.globalAlpha = 1;

  // Eyebrows
  ctx.globalAlpha = warmAlpha;
  ctx.strokeStyle = profile.warmGrad[1];
  ctx.lineWidth = profile.pixelSnap ? 2 : 1.8;
  ctx.beginPath();
  ctx.moveTo(headCx - R * 0.55, headCy - R * 0.32);
  ctx.quadraticCurveTo(headCx - R * 0.3, headCy - R * 0.42, headCx - R * 0.12, headCy - R * 0.34);
  ctx.stroke();

  ctx.globalAlpha = coolAlpha;
  ctx.strokeStyle = profile.coolGrad[1];
  ctx.lineWidth = profile.pixelSnap ? 2 : 1.5;
  ctx.beginPath();
  ctx.moveTo(headCx + R * 0.12, headCy - R * 0.36);
  ctx.lineTo(headCx + R * 0.52, headCy - R * 0.36);
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Nose
  ctx.strokeStyle = "rgba(80,50,20,0.4)";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(headCx - R * 0.06, headCy + R * 0.12);
  ctx.lineTo(headCx - R * 0.02, headCy + R * 0.22);
  ctx.stroke();

  // Mouth left (organic)
  ctx.globalAlpha = warmAlpha;
  ctx.strokeStyle = profile.warmGrad[1];
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(headCx - R * 0.15, headCy + R * 0.38, R * 0.12, Math.PI + 0.3, -0.3);
  ctx.stroke();

  // Mouth right (code)
  ctx.globalAlpha = coolAlpha;
  ctx.fillStyle = profile.coolGrad[1];
  ctx.font = `bold ${Math.round(R * 0.16)}px monospace`;
  ctx.textBaseline = "middle";
  ctx.fillText(">_", headCx + R * 0.08, headCy + R * 0.38);
  ctx.globalAlpha = 1;

  // Hair left (warm strokes)
  ctx.globalAlpha = warmAlpha;
  ctx.strokeStyle = profile.warmGrad[0];
  ctx.lineWidth = profile.pixelSnap ? 3 : 2;
  for (let i = 0; i < 5; i++) {
    const angle = -0.4 - i * 0.22;
    const len = R * (0.3 + i * 0.08);
    ctx.beginPath();
    ctx.moveTo(headCx - R * 0.1, headCy - R * 0.85);
    ctx.quadraticCurveTo(
      headCx - R * 0.4 - i * 6,
      headCy - R * 1.1 + i * 3,
      headCx - R * 0.2 + Math.cos(angle) * len,
      headCy - R * 0.9 + Math.sin(angle) * len
    );
    ctx.stroke();
  }

  // Hair right (cool lines)
  ctx.globalAlpha = coolAlpha;
  ctx.strokeStyle = profile.coolGrad[0];
  ctx.lineWidth = profile.pixelSnap ? 2 : 1.5;
  for (let i = 0; i < 5; i++) {
    const startY = headCy - R * 0.95 + i * (R * 0.08);
    ctx.beginPath();
    ctx.moveTo(headCx + R * 0.05, startY);
    ctx.lineTo(headCx + R * 0.5 + i * 4, startY - R * 0.1 + i * 5);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Neck
  const neckW = R * 0.4;
  const neckH = R * 0.3;
  const neckTop = headCy + R - 2;
  ctx.fillStyle = border;
  ctx.fillRect(headCx - neckW / 2, neckTop, neckW, neckH);

  // Shoulders
  const shoulderW = R * 2.2;
  const shoulderH = R * 0.9;
  const shoulderTop = neckTop + neckH - 4;
  ctx.beginPath();
  ctx.moveTo(headCx - shoulderW / 2, shoulderTop + shoulderH);
  ctx.lineTo(headCx - shoulderW * 0.38, shoulderTop);
  ctx.lineTo(headCx + shoulderW * 0.38, shoulderTop);
  ctx.lineTo(headCx + shoulderW / 2, shoulderTop + shoulderH);
  ctx.closePath();
  const bodyG = ctx.createLinearGradient(headCx - shoulderW / 2, shoulderTop, headCx + shoulderW / 2, shoulderTop);
  bodyG.addColorStop(0, profile.warmGrad[1] + "40");
  bodyG.addColorStop(0.48, profile.warmGrad[0] + "20");
  bodyG.addColorStop(0.52, profile.coolGrad[0] + "20");
  bodyG.addColorStop(1, profile.coolGrad[1] + "40");
  ctx.fillStyle = bodyG;
  ctx.fill();
  ctx.strokeStyle = border;
  ctx.lineWidth = 1;
  ctx.stroke();

  // Center split line on body
  ctx.save();
  ctx.shadowColor = accent;
  ctx.shadowBlur = 8 * splitPulse;
  ctx.strokeStyle = accent;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(headCx, shoulderTop);
  ctx.lineTo(headCx, shoulderTop + shoulderH);
  ctx.stroke();
  ctx.restore();

  // Chest icons
  ctx.globalAlpha = warmAlpha;
  ctx.font = `bold ${Math.round(R * 0.14)}px monospace`;
  ctx.fillStyle = profile.warmGrad[0] + "80";
  ctx.textBaseline = "middle";
  ctx.fillText("✎", headCx - shoulderW * 0.22, shoulderTop + shoulderH * 0.45);
  ctx.globalAlpha = coolAlpha;
  ctx.fillStyle = profile.coolGrad[0] + "80";
  ctx.fillText("{}", headCx + shoulderW * 0.14, shoulderTop + shoulderH * 0.45);
  ctx.globalAlpha = 1;
}

interface SplitCharacterCanvasProps {
  readonly className?: string;
  readonly height?: number;
  readonly activeSide?: CharacterSide;
  readonly onSideClick?: (side: "designer" | "developer") => void;
}

export function SplitCharacterCanvas({
  className = "",
  height = 420,
  activeSide = null,
  onSideClick,
}: SplitCharacterCanvasProps) {
  const { currentEra } = useDesignEra();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const pointer = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  const rafRef = useRef<number | null>(null);
  const t0 = useRef(0);
  const revealRef = useRef(0);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const inViewRef = useRef(false);
  const hoverRef = useRef(0);
  const sideAnimRef = useRef(0);
  const prevSideRef = useRef<CharacterSide>(null);

  const [canvasW, setCanvasW] = useState(600);
  const quiet = useChromeQuiet();

  const reducedMotion =
    typeof globalThis !== "undefined" &&
    typeof globalThis.matchMedia === "function" &&
    globalThis.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setCanvasW(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Reset side animation when side changes
  useEffect(() => {
    if (activeSide !== prevSideRef.current) {
      sideAnimRef.current = activeSide ? 0 : 1; // animate in or out
      prevSideRef.current = activeSide;
    }
  }, [activeSide]);

  const drawScene = useCallback(
    (timeMs: number) => {
      const canvas = canvasRef.current;
      if (!canvas || canvasW < 10) return;

      const dpr = Math.min(globalThis.devicePixelRatio || 1, 2);
      const W = canvasW;
      const H = height;
      if (!t0.current) t0.current = timeMs;
      const elapsed = (timeMs - t0.current) / 1000;

      if (inViewRef.current && revealRef.current < 1) {
        revealRef.current = Math.min(1, revealRef.current + 0.018);
      }
      const reveal = easeOut(revealRef.current);

      // Animate side selection smoothly
      const sideTarget = activeSide ? 1 : 0;
      sideAnimRef.current += (sideTarget - sideAnimRef.current) * 0.08;
      const sideAnimT = sideAnimRef.current;

      const hoverSmooth = hoverRef.current;

      const bw = Math.round(W * dpr);
      const bh = Math.round(H * dpr);
      if (canvas.width !== bw || canvas.height !== bh) {
        canvas.width = bw;
        canvas.height = bh;
        canvas.style.width = `${W}px`;
        canvas.style.height = `${H}px`;
      }

      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      const cs = getComputedStyle(canvas);
      const accent = cs.getPropertyValue("--accent-color").trim() || "#39ff14";
      const textMain = cs.color || "#e5e5e5";
      const border = cs.getPropertyValue("--border-color").trim() || "#2a2a2a";
      const [ar, ag, ab] = parseColor(accent);
      const profile = resolveEraProfile(Number(currentEra.id));

      pointer.current.x += (pointer.current.tx - pointer.current.x) * 0.06;
      pointer.current.y += (pointer.current.ty - pointer.current.y) * 0.06;

      const charCx = W * 0.5;
      const charCy = H * 0.42;

      const headR = clamp(Math.min(W, H) * 0.18, 50, 90);

      // Idle floating animation
      const breathe = reducedMotion ? 0 : Math.sin(elapsed * 1.2) * 3;
      const sway = reducedMotion ? 0 : Math.sin(elapsed * 0.7) * 1.5;

      ctx.save();
      const charScale = lerp(0.88, 1, reveal) + hoverSmooth * 0.03;
      ctx.globalAlpha = clamp(reveal * 1.5 - 0.2, 0, 1);
      ctx.translate(charCx + sway, charCy + breathe);
      ctx.scale(charScale, charScale);
      ctx.translate(-charCx, -charCy);

      const d: DrawCtx = {
        ctx, W, H,
        px: pointer.current.x,
        py: pointer.current.y,
        ar, ag, ab, accent, textMain, border, profile, elapsed,
        hoverIntensity: hoverSmooth,
        activeSide,
        sideAnimT,
      };

      drawSplitCharacter(d, charCx, charCy, headR);
      ctx.restore();

      // Labels
      ctx.globalAlpha = clamp(reveal * 1.5 - 0.4, 0, 1);
      ctx.font = "bold 9px monospace";
      ctx.textBaseline = "middle";
      const labelY = charCy - headR - 22 + breathe;

      const warmLabelAlpha = activeSide === "developer" ? lerp(1, 0.3, sideAnimT) : activeSide === "designer" ? lerp(1, 1, sideAnimT) : 1;
      const coolLabelAlpha = activeSide === "designer" ? lerp(1, 0.3, sideAnimT) : activeSide === "developer" ? lerp(1, 1, sideAnimT) : 1;

      ctx.globalAlpha = clamp(reveal * 1.5 - 0.4, 0, 1) * warmLabelAlpha;
      ctx.fillStyle = profile.warmGrad[0];
      ctx.fillText("DESIGNER", charCx - headR * 2 + sway, labelY);

      ctx.globalAlpha = clamp(reveal * 1.5 - 0.4, 0, 1) * coolLabelAlpha;
      ctx.fillStyle = profile.coolGrad[0];
      ctx.fillText("DEVELOPER", charCx + headR * 0.9 + sway, labelY);

      // Hint text when no side selected
      if (!activeSide && sideAnimT < 0.1) {
        ctx.globalAlpha = clamp(reveal - 0.6, 0, 0.5);
        ctx.font = "8px monospace";
        ctx.fillStyle = textMain;
        ctx.textAlign = "center";
        const hintY = charCy + headR * 2.8 + breathe;
        ctx.fillText("← click a side to filter →", charCx, hintY);
        ctx.textAlign = "left";
      }

      ctx.globalAlpha = 1;
    },
    [canvasW, height, currentEra.id, reducedMotion, activeSide]
  );

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    let inView = true;
    inViewRef.current = true;
    let running = false;

    const stop = () => {
      running = false;
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      drawScene(performance.now());
    };

    const tick = (ts: number) => {
      if (!running) return;
      drawScene(ts);
      if (running) rafRef.current = requestAnimationFrame(tick);
    };

    const start = () => {
      if (running || quiet || document.hidden || !inView) return;
      running = true;
      rafRef.current = requestAnimationFrame(tick);
    };

    observerRef.current = new IntersectionObserver(
      ([e]) => {
        inView = e.isIntersecting;
        inViewRef.current = inView;
        if (inView) start();
        else stop();
      },
      { threshold: 0.15 },
    );
    observerRef.current.observe(wrap);

    const onVis = () => {
      if (document.hidden) stop();
      else start();
    };
    document.addEventListener("visibilitychange", onVis);
    drawScene(performance.now());
    start();

    return () => {
      stop();
      observerRef.current?.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [drawScene, quiet]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
      pointer.current.tx = clamp(((e.clientX - rect.left) / rect.width) * 2 - 1, -1, 1);
      pointer.current.ty = clamp(((e.clientY - rect.top) / rect.height) * 2 - 1, -1, 1);
      hoverRef.current = 1;
    },
    []
  );

  const handleMouseLeave = useCallback(() => {
    pointer.current.tx = 0;
    pointer.current.ty = 0;
    hoverRef.current = 0;
  }, []);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!onSideClick) return;
      const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
      const xRatio = (e.clientX - rect.left) / rect.width;
      onSideClick(xRatio < 0.5 ? "designer" : "developer");
    },
    [onSideClick]
  );

  return (
    <div ref={wrapRef} className={className}>
      <canvas
        ref={canvasRef}
        className="block w-full"
        style={{ color: "var(--text-main)", cursor: onSideClick ? "pointer" : "default" }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        aria-label="Half designer, half developer character — click a side to filter projects"
      />
    </div>
  );
}
