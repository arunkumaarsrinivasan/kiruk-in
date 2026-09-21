"use client";

import { forwardRef, useEffect, type ReactNode } from "react";
import { attachPointer, field, type FieldMode } from "./field";

export function Pix({ file, size, className }: { file: string; size: number; className?: string }) {
  return (
    <span
      className={className}
      style={{
        width: size,
        height: size,
        backgroundColor: "currentColor",
        WebkitMaskImage: `url(/icons/${file})`,
        maskImage: `url(/icons/${file})`,
        WebkitMaskSize: "100%",
        maskSize: "100%",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
      }}
    />
  );
}

export const GazeTitle = forwardRef<HTMLSpanElement, { children: ReactNode; className?: string }>(
  function GazeTitle({ children, className }, ref) {
    return (
      <span ref={ref} data-zone="title" className={`gaze-title${className ? ` ${className}` : ""}`}>
        <span className="gaze-base">{children}</span>
        <span className="gaze-ink" aria-hidden>
          <span>{children}</span>
        </span>
      </span>
    );
  },
);

export function GazeHit({
  children,
  className,
  regular,
  solid,
  as: Tag = "span",
}: {
  children: ReactNode;
  className?: string;
  regular: string;
  solid: string;
  as?: "span" | "div";
}) {
  return (
    <Tag className={`gaze-hit${className ? ` ${className}` : ""}`}>
      <span className="gaze-lamp" data-zone="lamp" data-icon={solid} aria-hidden>
        <Pix file={regular} size={24} className="gaze-pix gaze-pix-lo" />
        <Pix file={solid} size={24} className="gaze-pix gaze-pix-hi" />
      </span>
      {children}
    </Tag>
  );
}

function writeSpread(el: HTMLElement | null, spread: number, ox: number, oy: number, radOverride?: number) {
  if (!el) return;
  const r = el.getBoundingClientRect();
  const zone = el.getAttribute("data-zone");
  const s = Math.max(0, Math.min(1, spread));

  if (zone === "lamp") {
    const rad = r.width / 2;
    const q = Math.round(s * 5) / 5;
    el.style.setProperty("--spread", `${q}`);
    el.style.setProperty("--ox", "50%");
    el.style.setProperty("--oy", "50%");
    el.style.setProperty("--rad", `${rad}px`);
    el.style.setProperty("--reach", `${q * rad}px`);
    return;
  }

  const x = Number.isFinite(ox) ? ox : r.width / 2;
  const y = Number.isFinite(oy) ? oy : r.height / 2;
  const rad =
    radOverride ?? Math.max(12, Math.hypot(Math.max(x, r.width - x), Math.max(y, r.height - y)) + 12);
  el.style.setProperty("--spread", `${Math.round(s * 1000) / 1000}`);
  el.style.setProperty("--ox", `${x}px`);
  el.style.setProperty("--oy", `${y}px`);
  el.style.setProperty("--rad", `${rad}px`);
  el.style.setProperty("--reach", `${s * rad}px`);
}

function clearSpread(el: HTMLElement | null) {
  if (!el) return;
  el.removeAttribute("data-gaze");
  el.removeAttribute("data-mode");
  el.removeAttribute("data-zone-live");
  el.removeAttribute("data-live");
  el.style.removeProperty("--spread");
  el.style.removeProperty("--ox");
  el.style.removeProperty("--oy");
  el.style.removeProperty("--rad");
  el.style.removeProperty("--reach");
  el.style.removeProperty("--scan-t");
  el.style.removeProperty("--scan-b");
}

export function GazeSync({ mode }: { mode: FieldMode }) {
  useEffect(() => {
    const stop = attachPointer();
    let raf = 0;
    let prevTitle: HTMLElement | null = null;
    let prevHit: HTMLElement | null = null;
    let prevZone: HTMLElement | null = null;
    let prevFade: HTMLElement | null = null;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    const tick = () => {
      const title = field.zone === "title" ? field.title : null;
      if (prevTitle && prevTitle !== title && prevTitle !== field.zoneEl && prevTitle !== field.fadeEl) {
        prevTitle.removeAttribute("data-gaze");
        prevTitle.removeAttribute("data-mode");
      }
      prevTitle = title;
      if (title) {
        title.setAttribute("data-gaze", "");
        title.setAttribute("data-mode", mode);
      }

      const hit = field.zone === "lamp" ? (field.lamp?.closest(".gaze-hit") as HTMLElement | null) : null;
      if (prevHit && prevHit !== hit) prevHit.removeAttribute("data-live");
      prevHit = hit;
      if (hit && fine) hit.setAttribute("data-live", "");
      else hit?.removeAttribute("data-live");

      const zoneEl = field.zone !== "void" ? field.zoneEl : null;
      if (prevZone && prevZone !== zoneEl && prevZone !== field.fadeEl) {
        prevZone.removeAttribute("data-zone-live");
      }
      prevZone = zoneEl;
      if (zoneEl) zoneEl.setAttribute("data-zone-live", "");

      if (prevFade && prevFade !== field.fadeEl && prevFade !== zoneEl) {
        prevFade.removeAttribute("data-zone-live");
        if (prevFade !== title) {
          prevFade.style.removeProperty("--spread");
          prevFade.style.removeProperty("--ox");
          prevFade.style.removeProperty("--oy");
          prevFade.style.removeProperty("--rad");
          prevFade.style.removeProperty("--reach");
        }
      }
      prevFade = field.fadeEl;

      const mx = field.mx;
      const my = field.my;
      if (zoneEl) {
        const b = zoneEl.getBoundingClientRect();
        const ox = mx < 0 ? b.width / 2 : mx - b.left;
        const oy = my < 0 ? b.height / 2 : my - b.top;
        writeSpread(zoneEl, field.spread, ox, oy);
      }

      if (field.fadeEl && field.fadeEl !== zoneEl) {
        const b = field.fadeEl.getBoundingClientRect();
        writeSpread(
          field.fadeEl,
          field.fadeSpread,
          mx < 0 ? b.width / 2 : mx - b.left,
          my < 0 ? b.height / 2 : my - b.top,
        );
        if (field.fadeSpread > 0.02) field.fadeEl.setAttribute("data-zone-live", "");
        else field.fadeEl.removeAttribute("data-zone-live");
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      clearSpread(prevTitle);
      prevHit?.removeAttribute("data-live");
      prevZone?.removeAttribute("data-zone-live");
      clearSpread(prevFade);
      stop();
    };
  }, [mode]);

  return null;
}
