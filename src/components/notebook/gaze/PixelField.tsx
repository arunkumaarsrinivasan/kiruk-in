"use client";

import { useEffect, useRef } from "react";
import { attachPointer, field, type FieldMode } from "./field";

const PHOS = [0, 255, 65];
const LIT = [57, 255, 20];
const GLOW = [210, 255, 180];
const SCLERA = [36, 210, 72];

type Box = { x0: number; y0: number; x1: number; y1: number; round: number };

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function smooth(t: number) {
  const x = clamp(t, 0, 1);
  return x * x * (3 - 2 * x);
}

/**
 * Circular pixel eyeball: rim, dim sclera, iris ring, pupil hole, catchlights.
 */
function eyeKind(dx: number, dy: number, lx: number, ly: number, tight: number) {
  const r = Math.hypot(dx, dy);
  if (r > 4.48) return 0;
  if (r > 3.62) return 2;
  const ix = dx - lx * 0.7;
  const iy = dy - ly * 0.7;
  const ir = Math.hypot(ix, iy);
  if (ir < 0.62 - tight * 0.06) return 0;
  if (Math.hypot(ix - 1.2, iy + 0.95) < 0.55) return 3;
  if (ir < 3.08) return 1;
  return 4;
}

function zoneBox(ox: number, oy: number): Box | null {
  const el = field.zoneEl;
  if (!el || field.zone === "void") return null;
  const r = el.getBoundingClientRect();
  return {
    x0: r.left - ox,
    y0: r.top - oy,
    x1: r.left - ox + r.width,
    y1: r.top - oy + r.height,
    round: field.zone === "lamp" ? 1 : 0,
  };
}

export function PixelField({ mode }: { mode: FieldMode }) {
  const bloomRef = useRef<HTMLCanvasElement>(null);
  const eyeRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const bloomCv = bloomRef.current;
    const eyeCv = eyeRef.current;
    if (!bloomCv || !eyeCv) return;
    const bctx = bloomCv.getContext("2d", { alpha: true });
    const ectx = eyeCv.getContext("2d", { alpha: true });
    if (!bctx || !ectx) return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let W = 0;
    let H = 0;
    let ox = 0;
    let oy = 0;
    let cols = 0;
    let raf = 0;
    let blinkUntil = 0;
    let lx = 0;
    let ly = 0;
    let tight = 0;
    let spread = 0;
    let fadeSpread = 0;
    let liveEl: HTMLElement | null = null;
    let fadeEl: HTMLElement | null = null;
    let drawX = -1;
    let drawY = -1;
    let rx = 4.48;
    let ry = 4.48;
    let hasBox = false;
    let lastPaint = performance.now();
    let idleAge = 0;
    let stillX = -1;
    let stillY = -1;
    let flyOn = false;
    let flyAng = 0;
    let flyRad = 6;
    let flyStepAt = 0;
    let flyTrail = 0;
    let restUntil = 0;
    const box: Box = { x0: 0, y0: 0, x1: 0, y1: 0, round: 0 };

    const root = eyeCv.closest(".era-blog-surface") ?? eyeCv.parentElement;
    const num = (name: string, fallback: number) => {
      const raw = root ? getComputedStyle(root).getPropertyValue(name) : "";
      const n = parseFloat(raw);
      return Number.isFinite(n) ? n : fallback;
    };

    const resize = (cv: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
      cv.style.width = `${W}px`;
      cv.style.height = `${H}px`;
      const dpr = Math.min(devicePixelRatio || 1, 2);
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const size = () => {
      W = innerWidth;
      H = innerHeight;
      const b = eyeCv.getBoundingClientRect();
      ox = b.left;
      oy = b.top;
      resize(bloomCv, bctx);
      resize(eyeCv, ectx);
      const cell = Math.max(4, num("--proto-cell", 9));
      cols = Math.ceil(W / cell) + 2;
    };
    size();
    addEventListener("resize", size);
    const stop = attachPointer();
    const onEnter = () => {
      blinkUntil = performance.now() + 140;
    };
    document.addEventListener("notebook-eye-enter", onEnter);

    const plot = (
      ctx: CanvasRenderingContext2D,
      gx: number,
      gy: number,
      dx: number,
      dy: number,
      step: number,
      tile: number,
      rgb: number[],
      a: number,
    ) => {
      if (a <= 0.02) return;
      ctx.fillStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${a})`;
      ctx.fillRect(gx + dx * step - tile / 2, gy + dy * step - tile / 2, tile, tile);
    };

    const drawEye = (
      ctx: CanvasRenderingContext2D,
      gx: number,
      gy: number,
      step: number,
      tile: number,
      lookX: number,
      lookY: number,
      tightN: number,
      blink: boolean,
      alpha: number,
      erx: number,
      ery: number,
    ) => {
      const limX = Math.min(20, Math.ceil(Math.max(5, erx + 1)));
      const limY = Math.min(12, Math.ceil(Math.max(5, ery + 1)));
      for (let dy = -limY; dy <= limY; dy++) {
        for (let dx = -limX; dx <= limX; dx++) {
          const nx = erx > 0.2 ? (dx * 4.48) / erx : dx;
          const ny = ery > 0.2 ? (dy * 4.48) / ery : dy;
          if (blink) {
            if (Math.abs(ny) > 0.5) continue;
            if (Math.hypot(nx, ny) > 4.5) continue;
            plot(ctx, gx, gy, dx, dy, step, tile, LIT, 0.9 * alpha);
            continue;
          }
          const k = eyeKind(nx, ny, lookX, lookY, tightN);
          if (!k) continue;
          const rgb = k === 3 ? GLOW : k === 2 ? LIT : k === 1 ? PHOS : SCLERA;
          plot(ctx, gx, gy, dx, dy, step, tile, rgb, (k === 4 ? 0.95 : 1) * alpha);
        }
      }
    };

    const lerpBox = (target: Box, k: number) => {
      if (!hasBox) {
        box.x0 = target.x0;
        box.y0 = target.y0;
        box.x1 = target.x1;
        box.y1 = target.y1;
        box.round = target.round;
        hasBox = true;
        return;
      }
      box.x0 += (target.x0 - box.x0) * k;
      box.y0 += (target.y0 - box.y0) * k;
      box.x1 += (target.x1 - box.x1) * k;
      box.y1 += (target.y1 - box.y1) * k;
      box.round += (target.round - box.round) * k;
    };

    const paint = () => {
      const now = performance.now();
      const stage = eyeCv.getBoundingClientRect();
      ox = stage.left;
      oy = stage.top;
      const cell = Math.max(4, num("--proto-cell", 9));
      if (!cols) size();

      const mx = field.mx < 0 ? -1 : field.mx - ox;
      const my = field.my < 0 ? -1 : field.my - oy;
      const occupied = field.ring || (field.zone !== "void" && (mx >= 0 || field.snap));
      const instant = reduce || field.snap || !fine;
      const dt = Math.min(40, now - lastPaint);
      lastPaint = now;

      if (field.zoneEl !== liveEl) {
        if (liveEl && liveEl !== field.zoneEl) {
          fadeEl = liveEl;
          fadeSpread = spread;
        }
        liveEl = field.zoneEl;
      }
      if (!occupied && liveEl) {
        fadeEl = liveEl;
        fadeSpread = spread;
        liveEl = null;
      }

      const wantSpread = occupied ? 1 : 0;
      const boxK = instant ? 1 : field.zone === "lamp" ? 0.28 : 0.12;

      if (instant) {
        spread = wantSpread;
        fadeSpread = 0;
        if (!occupied) fadeEl = null;
      } else {
        const tau = wantSpread > spread ? (field.zone === "lamp" ? 120 : 200) : 150;
        const k = 1 - Math.exp(-dt / tau);
        spread += (wantSpread - spread) * k;
        if (spread < 0.008) spread = 0;
        if (spread > 0.992) spread = 1;
        fadeSpread += (0 - fadeSpread) * (1 - Math.exp(-dt / 150));
        if (fadeSpread < 0.02) {
          fadeSpread = 0;
          fadeEl = null;
        }
      }

      field.spread = field.zone === "lamp" ? Math.round(spread * 5) / 5 : spread;
      field.fadeEl = fadeEl;
      field.fadeSpread = fadeSpread;

      const target = zoneBox(ox, oy);
      if (target) lerpBox(target, boxK);
      else if (hasBox && mx >= 0) {
        const eye = cell * 4.48;
        lerpBox({ x0: mx - eye, y0: my - eye, x1: mx + eye, y1: my + eye, round: 1 }, boxK);
        if (spread < 0.02) hasBox = false;
      }

      let tx = mx;
      let ty = my;
      if (fine && mx >= 0 && !reduce && occupied && hasBox) {
        const cx = (box.x0 + box.x1) / 2;
        const cy = (box.y0 + box.y1) / 2;
        const pull = 0.16 * smooth(spread);
        tx = mx + (clamp(mx, box.x0, box.x1) - mx) * 0.22 + (cx - mx) * pull * 0.12;
        ty = my + (clamp(my, box.y0, box.y1) - my) * 0.28 + (cy - my) * pull * 0.12;
      }
      if (drawX < 0 || mx < 0 || instant) {
        drawX = tx;
        drawY = ty;
      } else {
        drawX += (tx - drawX) * (1 - Math.exp(-dt / 90));
        drawY += (ty - drawY) * (1 - Math.exp(-dt / 90));
      }

      const morph = field.zone === "lamp" ? 0 : smooth(spread);
      const wantRx = morph > 0.02 && hasBox ? clamp((box.x1 - box.x0) / (2 * cell), 2.4, 16) : 4.48;
      const wantRy = morph > 0.02 && hasBox ? clamp((box.y1 - box.y0) / (2 * cell), 2.1, 7) : 4.48;
      const stretchK = instant ? 1 : 1 - Math.exp(-dt / 220);
      rx += (wantRx - rx) * stretchK;
      ry += (wantRy - ry) * stretchK;

      const moved =
        stillX < 0 || mx < 0 || Math.abs(mx - stillX) > 2.2 || Math.abs(my - stillY) > 2.2;
      if (moved || occupied || instant) {
        stillX = mx;
        stillY = my;
        idleAge = 0;
        flyOn = false;
        flyTrail = 0;
      } else {
        idleAge += dt;
      }

      if (
        !flyOn &&
        !occupied &&
        !instant &&
        mx >= 0 &&
        idleAge > 1100 &&
        now > restUntil
      ) {
        flyOn = true;
        flyAng = Math.random() * Math.PI * 2;
        flyRad = 7.25;
        flyStepAt = now;
        flyTrail = 1;
      }

      if (flyOn) {
        if (now - flyStepAt >= 140) {
          flyStepAt = now;
          flyTrail = 1;
          if (Math.random() > 0.12) flyAng = (flyAng + Math.PI / 8) % (Math.PI * 2);
          if (flyRad > 5.05) flyRad -= 0.28;
          else {
            blinkUntil = now + 170;
            flyOn = false;
            flyTrail = 0;
            restUntil = now + 800 + Math.random() * 1000;
            idleAge = 0;
          }
        } else {
          flyTrail *= Math.exp(-dt / 80);
        }
      }

      bctx.clearRect(0, 0, W, H);
      ectx.clearRect(0, 0, W, H);

      if (fine && mx >= 0 && !reduce) {
        let lookTx = 0;
        let lookTy = 0;
        if (flyOn) {
          lookTx = clamp(Math.round(Math.cos(flyAng) * flyRad) / 6.5, -1, 1);
          lookTy = clamp(Math.round(Math.sin(flyAng) * flyRad) / 6.5, -1, 1);
          lx = lookTx;
          ly = lookTy;
        } else {
          if (field.attractX >= 0) {
            lookTx = clamp((field.attractX - field.mx) / 70, -1, 1);
            lookTy = clamp((field.attractY - field.my) / 70, -1, 1);
          } else {
            lookTx = clamp(field.vx * 22, -1, 1);
            lookTy = clamp(field.vy * 22, -1, 1);
          }
          lx += (lookTx - lx) * 0.08;
          ly += (lookTy - ly) * 0.08;
        }
        tight += ((field.zone === "lamp" ? 1 : 0) - tight) * 0.1;
        const blink = now < blinkUntil && Math.floor(now / 70) % 2 === 0;
        const lookX = clamp(lx, -1, 1);
        const lookY = clamp(ly, -1, 1);
        const gx = Math.round(drawX / cell) * cell;
        const gy = Math.round(drawY / cell) * cell;
        const step = cell;
        const tile = Math.max(1, cell - 0.5);
        if (field.ring) {
          // Hollow pixel ring only — empty center so text stays readable.
          for (let dy = -5; dy <= 5; dy++) {
            for (let dx = -5; dx <= 5; dx++) {
              const rr = Math.hypot(dx, dy);
              if (rr < 3.05 || rr > 4.05) continue;
              plot(
                ectx,
                gx,
                gy,
                dx,
                dy,
                step,
                tile,
                rr > 3.55 ? LIT : PHOS,
                rr > 3.55 ? 1 : 0.82,
              );
            }
          }
        } else {
        const eyeA = 1 - smooth(clamp((spread - 0.08) / 0.78, 0, 1));
        if (eyeA > 0.04) {
          drawEye(ectx, gx, gy, step, tile, lookX, lookY, tight, blink, eyeA, rx, ry);
          if (flyOn) {
            const fdx = Math.round(Math.cos(flyAng) * flyRad);
            const fdy = Math.round(Math.sin(flyAng) * flyRad);
            plot(ectx, gx, gy, fdx, fdy, step, tile, LIT, 0.95 * eyeA);
            const tdx = Math.round(Math.cos(flyAng - Math.PI / 8) * flyRad);
            const tdy = Math.round(Math.sin(flyAng - Math.PI / 8) * flyRad);
            if (flyTrail > 0.14 && (tdx !== fdx || tdy !== fdy)) {
              plot(ectx, gx, gy, tdx, tdy, step, tile, PHOS, 0.45 * flyTrail * eyeA);
            }
          }
        }
        }
      }

      raf = requestAnimationFrame(paint);
    };
    raf = requestAnimationFrame(paint);

    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("resize", size);
      document.removeEventListener("notebook-eye-enter", onEnter);
      stop();
    };
  }, [mode]);

  return (
    <>
      <canvas ref={bloomRef} className="px-field px-bloom" aria-hidden />
      <canvas ref={eyeRef} className="px-field px-eye" aria-hidden />
    </>
  );
}
