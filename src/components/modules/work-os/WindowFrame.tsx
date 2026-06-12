"use client";

import { motion, useDragControls } from "framer-motion";
import type { PointerEvent, ReactNode } from "react";
import type { DesktopEra } from "./types";

interface WindowFrameProps {
  readonly era: DesktopEra;
  readonly title: string;
  readonly z: number;
  readonly x: number;
  readonly y: number;
  readonly onClose: () => void;
  readonly onFocus: () => void;
  readonly dragConstraints: React.RefObject<HTMLElement | null>;
  readonly children: ReactNode;
}

/** Win95 beveled border (outset). */
const win95Outset =
  "inset -1px -1px 0 #000, inset 1px 1px 0 #fff, inset -2px -2px 0 #808080, inset 2px 2px 0 #dfdfdf";

export function WindowFrame({
  era,
  title,
  z,
  x,
  y,
  onClose,
  onFocus,
  dragConstraints,
  children,
}: WindowFrameProps) {
  const t = era.tokens;
  const chrome = era.chrome;
  const dragControls = useDragControls();

  const frameStyle: React.CSSProperties = {
    position: "absolute",
    left: x,
    top: y,
    zIndex: z,
    width: "min(440px, 86%)",
    maxHeight: "calc(100% - 96px)",
    background: t.surface,
    color: t.text,
    fontFamily: era.fontUi,
  };

  // chrome-specific frame decoration
  if (chrome === "bitmap") {
    frameStyle.border = `2px solid ${t.border}`;
    frameStyle.boxShadow = "4px 4px 0 rgba(0,0,0,0.4)";
  } else if (chrome === "win95") {
    frameStyle.boxShadow = win95Outset + ", 3px 3px 6px rgba(0,0,0,0.35)";
    frameStyle.padding = "2px";
  } else if (chrome === "aqua") {
    frameStyle.borderRadius = "10px";
    frameStyle.border = "1px solid rgba(0,0,0,0.25)";
    frameStyle.boxShadow = "0 18px 50px rgba(0,0,0,0.45)";
    frameStyle.overflow = "hidden";
  } else if (chrome === "flat") {
    frameStyle.border = `1px solid ${t.border}`;
    frameStyle.boxShadow = "0 16px 40px rgba(0,0,0,0.35)";
  } else if (chrome === "next") {
    frameStyle.border = "2px solid #0a0a0a";
    frameStyle.boxShadow =
      "inset 1px 1px 0 #e8e4da, inset -1px -1px 0 #8a867c, 6px 6px 0 rgba(0,0,0,0.45)";
  } else if (chrome === "xp") {
    frameStyle.border = `3px solid ${t.border}`;
    frameStyle.borderTop = "none";
    frameStyle.borderRadius = "8px 8px 2px 2px";
    frameStyle.boxShadow = "0 18px 46px rgba(0,0,0,0.4)";
    frameStyle.overflow = "hidden";
  } else if (chrome === "modern") {
    frameStyle.borderRadius = "12px";
    frameStyle.border = `1px solid ${t.border}`;
    frameStyle.boxShadow =
      "0 22px 60px rgba(0,0,0,0.35), 0 0 0 0.5px rgba(255,255,255,0.4) inset";
    (frameStyle as Record<string, string>).backdropFilter = "blur(28px) saturate(1.3)";
    frameStyle.overflow = "hidden";
  } else {
    // glass
    frameStyle.borderRadius = "16px";
    frameStyle.border = `1px solid ${t.border}`;
    frameStyle.boxShadow =
      "0 24px 70px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04) inset";
    (frameStyle as Record<string, string>).backdropFilter = "blur(22px)";
    frameStyle.overflow = "hidden";
  }

  return (
    <motion.div
      drag
      dragListener={false}
      dragControls={dragControls}
      dragMomentum={false}
      dragConstraints={dragConstraints}
      onPointerDown={onFocus}
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
      style={frameStyle}
      className="flex flex-col"
    >
      <TitleBar
        era={era}
        title={title}
        onClose={onClose}
        onStartDrag={(e) => dragControls.start(e)}
      />
      <div
        className="min-h-0 flex-1 overflow-y-auto"
        style={{ background: t.surface }}
      >
        {children}
      </div>
    </motion.div>
  );
}

/* ── Title bar variants ─────────────────────────────────────────────────── */

function TitleBar({
  era,
  title,
  onClose,
  onStartDrag,
}: {
  era: DesktopEra;
  title: string;
  onClose: () => void;
  onStartDrag: (e: PointerEvent) => void;
}) {
  const t = era.tokens;
  const chrome = era.chrome;

  const common =
    "select-none flex items-center gap-2 px-2 cursor-grab active:cursor-grabbing touch-none";
  const drag = { onPointerDown: onStartDrag };

  if (chrome === "bitmap") {
    return (
      <div
        {...drag}
        className={`${common} justify-between py-1`}
        style={{ borderBottom: `2px solid ${t.border}`, background: t.surface }}
      >
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="grid h-3.5 w-3.5 place-items-center"
          style={{ border: `2px solid ${t.border}`, background: t.surface }}
        />
        <span
          className="flex-1 text-center text-[12px] font-bold tracking-wide"
          style={{
            color: t.titleText,
            // classic horizontal-line title fill behind the label is faked
            // with letter-spacing; keep it simple + legible here.
          }}
        >
          {title}
        </span>
        <span className="h-3.5 w-3.5" />
      </div>
    );
  }

  if (chrome === "win95") {
    return (
      <div
        {...drag}
        className={`${common} justify-between py-0.5`}
        style={{ background: t.titleBar }}
      >
        <span
          className="truncate px-1 text-[12px] font-bold"
          style={{ color: t.titleText }}
        >
          {title}
        </span>
        <div className="flex gap-0.5">
          {["–", "□"].map((g) => (
            <span
              key={g}
              className="grid h-4 w-4 place-items-center text-[10px] font-bold leading-none text-black"
              style={{ background: "#c0c0c0", boxShadow: win95Outset }}
            >
              {g}
            </span>
          ))}
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="grid h-4 w-4 place-items-center text-[10px] font-bold leading-none text-black"
            style={{ background: "#c0c0c0", boxShadow: win95Outset }}
          >
            ×
          </button>
        </div>
      </div>
    );
  }

  if (chrome === "aqua") {
    return (
      <div
        {...drag}
        className={`${common} py-1.5`}
        style={{ background: t.titleBar, borderBottom: "1px solid rgba(0,0,0,0.15)" }}
      >
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="h-3 w-3 rounded-full"
            style={{ background: "#ff5f57", boxShadow: "inset 0 0 0 0.5px rgba(0,0,0,0.2)" }}
          />
          <span className="h-3 w-3 rounded-full" style={{ background: "#febc2e" }} />
          <span className="h-3 w-3 rounded-full" style={{ background: "#28c840" }} />
        </div>
        <span
          className="flex-1 truncate text-center text-[12px] font-semibold"
          style={{ color: t.titleText }}
        >
          {title}
        </span>
        <span className="w-12" />
      </div>
    );
  }

  if (chrome === "flat") {
    return (
      <div {...drag} className={`${common} justify-between py-1.5`} style={{ background: t.titleBar }}>
        <span className="truncate px-1 text-[12px] font-semibold tracking-wide" style={{ color: t.titleText }}>
          {title}
        </span>
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="grid h-5 w-5 place-items-center text-[14px] leading-none transition-colors hover:bg-white/20"
          style={{ color: t.titleText }}
        >
          ×
        </button>
      </div>
    );
  }

  if (chrome === "next") {
    return (
      <div {...drag} className={`${common} justify-between py-1`} style={{ background: t.titleBar, borderBottom: "1px solid #0a0a0a" }}>
        <span className="h-3.5 w-3.5" />
        <span className="flex-1 truncate text-center text-[12px] font-bold" style={{ color: t.titleText }}>
          {title}
        </span>
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="grid h-3.5 w-3.5 place-items-center text-[10px] font-bold leading-none"
          style={{ background: "#cfcabd", color: "#0a0a0a", boxShadow: "inset 1px 1px 0 #fff, inset -1px -1px 0 #6f6b60" }}
        >
          ×
        </button>
      </div>
    );
  }

  if (chrome === "xp") {
    return (
      <div {...drag} className={`${common} justify-between py-1`} style={{ background: t.titleBar }}>
        <span className="truncate px-1 text-[12px] font-bold" style={{ color: t.titleText, textShadow: "0 1px 1px rgba(0,0,0,0.4)" }}>
          {title}
        </span>
        <div className="flex items-center gap-1">
          {["–", "▢"].map((g) => (
            <span key={g} className="grid h-4 w-4 place-items-center rounded-[3px] text-[9px] font-bold leading-none text-white" style={{ background: "rgba(255,255,255,0.25)", border: "1px solid rgba(255,255,255,0.6)" }}>
              {g}
            </span>
          ))}
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="grid h-4 w-4 place-items-center rounded-[3px] text-[11px] font-bold leading-none text-white"
            style={{ background: "#e1543b", border: "1px solid rgba(255,255,255,0.7)" }}
          >
            ×
          </button>
        </div>
      </div>
    );
  }

  if (chrome === "modern") {
    return (
      <div {...drag} className={`${common} py-2`} style={{ background: t.titleBar, borderBottom: `1px solid ${t.border}` }}>
        <div className="flex items-center gap-1.5">
          <button type="button" aria-label="Close" onClick={onClose} className="h-3 w-3 rounded-full" style={{ background: "#ff5f57" }} />
          <span className="h-3 w-3 rounded-full" style={{ background: "#febc2e" }} />
          <span className="h-3 w-3 rounded-full" style={{ background: "#28c840" }} />
        </div>
        <span className="flex-1 truncate text-center text-[12px] font-semibold" style={{ color: t.titleText }}>
          {title}
        </span>
        <span className="w-12" />
      </div>
    );
  }

  // glass
  return (
    <div
      {...drag}
      className={`${common} justify-between py-2`}
      style={{ background: t.titleBar, borderBottom: `1px solid ${t.border}` }}
    >
      <span className="flex items-center gap-2 px-1 text-[12px] font-semibold" style={{ color: t.titleText }}>
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: t.accent }} />
        {title}
      </span>
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="grid h-5 w-5 place-items-center rounded-full text-[13px] leading-none transition-colors hover:bg-white/10"
        style={{ color: t.titleText }}
      >
        ×
      </button>
    </div>
  );
}
