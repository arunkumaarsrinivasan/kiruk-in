"use client";

/**
 * PromptUIArchetype — 2026 era preview inside <EraTimeMachine>.
 *
 * Matches the 2026 home: black lids, a white page, one halftone pupil. The preview plays
 * one ask on a loop: a question is typed under the dot, the dot narrows,
 * then dilates into a dark lens holding the era's traits. Reduced motion
 * shows the open lens.
 */

import React, { useEffect, useState } from "react";
import type { EraSurfaceProps } from "../shared/EraSurface";
import { hideArchetypeTransport } from "../shared/eraChrome";

const ROOM = "#fafafa";
const INK = "#0b0b0b";
const MUTED = "#6b6863";
const LINE = "#e2dfda";
const LENS = "#ffffff";
const LENS_TEXT = "#0b0b0b";
const LENS_MUTED = "#6b6863";
const IVORY = "#0b0b0b";
/** A halftone pupil: a dot grid, masked so the dots read big in the middle. */
const DOTS = "radial-gradient(circle, #0b0b0b 1.6px, transparent 1.9px) 0 0 / 5px 5px";

const FONT_UI = "'Geist', 'Helvetica Neue', Arial, sans-serif";
const FONT_MONO = "'Geist Mono', ui-monospace, monospace";

const ASK = "what is 2026 about?";
/** Ticks of 120ms: typing, thinking, then the lens holds for a while. */
const TYPED_AT = ASK.length;
const THINK_AT = TYPED_AT + 4;
const OPEN_AT = THINK_AT + 3;
const LOOP_AT = OPEN_AT + 60;

export const PromptUIArchetype: React.FC<EraSurfaceProps> = ({
  era,
  prevEra,
  nextEra,
  index,
  total,
  reduceMotion,
  onPrev,
  onNext,
  onClose,
  embedMode,
}) => {
  const hideTransport = hideArchetypeTransport({ embedMode });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    setTick(0);
  }, [era]);

  useEffect(() => {
    if (reduceMotion) {
      setTick(OPEN_AT);
      return;
    }
    const t = window.setTimeout(() => setTick((x) => (x >= LOOP_AT ? 0 : x + 1)), 120);
    return () => window.clearTimeout(t);
  }, [tick, reduceMotion]);

  const open = tick >= OPEN_AT;
  const thinking = tick >= THINK_AT && !open;
  const typing = tick > 0 && tick < THINK_AT;
  const pupil = thinking ? 17 : typing ? 27 : 22;
  const word = open ? "" : thinking ? "thinking" : typing ? "listening" : "type to ask";

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: ROOM, color: INK, fontFamily: FONT_UI }}>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column" }}>
        <header style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderBottom: `1px solid ${LINE}` }}>
          <span aria-hidden style={{ width: 8, height: 8, borderRadius: "50%", background: DOTS }} />
          <span style={{ fontSize: 12.5, fontWeight: 500 }}>kiruk</span>
          <span style={{ color: MUTED, fontSize: 10, fontFamily: FONT_MONO }}>era {era.id}</span>
          <span style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
            {!hideTransport && (
              <>
                <NavBtn onClick={onPrev} disabled={!prevEra}>◂</NavBtn>
                <NavBtn onClick={onClose} primary>
                  ▶ Use
                </NavBtn>
                <NavBtn onClick={onNext} disabled={!nextEra}>▸</NavBtn>
              </>
            )}
          </span>
        </header>

        <div style={{ flex: 1, position: "relative", minHeight: 0 }}>
          {!open ? (
            <>
              <span
                aria-hidden
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "46%",
                  width: pupil * 2,
                  height: pupil * 2,
                  marginLeft: -pupil,
                  marginTop: -pupil,
                  borderRadius: "50%",
                  background: DOTS,
                  WebkitMaskImage: "radial-gradient(circle, #000 45%, transparent 72%)",
                  maskImage: "radial-gradient(circle, #000 45%, transparent 72%)",
                  transition: "width 300ms, height 300ms, margin 300ms",
                }}
              />
              <div style={{ position: "absolute", left: 0, right: 0, top: "calc(46% + 40px)", textAlign: "center" }}>
                <div style={{ fontSize: 11, minHeight: 14 }}>{typing || thinking ? ASK.slice(0, Math.min(tick, TYPED_AT)) : ""}</div>
                <div style={{ fontFamily: FONT_MONO, fontSize: 8.5, color: MUTED, marginTop: 4, letterSpacing: 0.6 }}>{word}</div>
              </div>
            </>
          ) : (
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
                width: "min(78%, 320px)",
                padding: "14px 16px",
                borderRadius: 18,
                background: LENS,
                color: LENS_TEXT,
                boxShadow: "0 0 0 1px rgba(255,255,255,0.08)",
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 500 }}>{era.name.replace(/^\d+:\s*/, "")}</div>
              <div style={{ fontSize: 9.5, color: "#dcd9d1", lineHeight: 1.5, marginTop: 6 }}>{era.lesson}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 10 }}>
                {era.keyElements.map((k) => (
                  <span key={k} style={{ fontSize: 8.5, padding: "3px 8px", border: `1px solid #34322d`, borderRadius: 999, color: LENS_TEXT }}>
                    {k}
                  </span>
                ))}
              </div>
              <div style={{ fontFamily: FONT_MONO, fontSize: 8, color: LENS_MUTED, marginTop: 10 }}>heard: 2026</div>
            </div>
          )}
        </div>

        <div style={{ padding: "3px 12px", borderTop: `1px solid ${LINE}`, fontFamily: FONT_MONO, fontSize: 9, color: MUTED, display: "flex", justifyContent: "space-between" }}>
          <span>one eye · type to ask · answers from real data</span>
          <span style={{ color: IVORY }}>
            2026 · pupil · {index + 1}/{total}
          </span>
        </div>
      </div>
    </div>
  );
};

function NavBtn({ children, onClick, disabled, primary }: { children: React.ReactNode; onClick: () => void; disabled?: boolean; primary?: boolean }) {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      style={{
        padding: "2px 8px",
        fontFamily: FONT_UI,
        fontSize: 10,
        fontWeight: 500,
        color: primary ? "#0e0e10" : INK,
        background: primary ? IVORY : "transparent",
        border: `1px solid ${primary ? "transparent" : LINE}`,
        borderRadius: 8,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.4 : 1,
      }}
    >
      {children}
    </button>
  );
}

export default PromptUIArchetype;
