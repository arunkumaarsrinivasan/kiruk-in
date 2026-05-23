"use client";

/**
 * PromptUIArchetype — 2026 era preview inside <EraTimeMachine>.
 *
 * Matches landing: kiruk.build one-line generative UI. A chrome-less
 * full-canvas mini page that auto-assembles from prompts, plus a single
 * floating command bar at the bottom. Auto-replays on era change.
 */

import React, { useEffect, useState } from "react";
import type { EraSurfaceProps } from "../shared/EraSurface";

const BG = "#070809";
const BG_2 = "#0c0e10";
const PANEL = "rgba(255,255,255,0.04)";
const PANEL_2 = "rgba(255,255,255,0.07)";
const BORDER_SOFT = "rgba(255,255,255,0.09)";
const INK = "#e9f0ee";
const INK_DIM = "#94a39f";
const INK_MUTE = "#5f6e6a";
const LIME = "#a3e635";

const FONT_UI = "'Geist', 'Inter', sans-serif";
const FONT_MONO = "'Geist Mono', 'JetBrains Mono', monospace";

export const PromptUIArchetype: React.FC<EraSurfaceProps> = ({
  era,
  prevEra,
  nextEra,
  index,
  total,
  reduceMotion,
  onPrev,
  onNext,
  onCustomize,
  onClose,
}) => {
  const a = era.colors.primary;
  const b = era.colors.accent;

  // staged auto-build: 0 empty → 1 nav → 2 hero → 3 traits → 4 lesson
  const [tick, setTick] = useState(0);

  useEffect(() => {
    setTick(0);
  }, [era]);

  useEffect(() => {
    if (reduceMotion) {
      setTick(20);
      return;
    }
    if (tick >= 12) return;
    const t = window.setTimeout(() => setTick((x) => x + 1), 360);
    return () => window.clearTimeout(t);
  }, [tick, reduceMotion]);

  const built = Math.min(4, Math.max(0, tick - 1));
  const building = tick < 6;
  const promptText = `make a page about the ${era.id} era`;
  const typed = reduceMotion ? promptText : promptText.slice(0, Math.min(promptText.length, tick * 4));

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: BG, color: INK, fontFamily: FONT_UI }}>
      <style jsx global>{`
        @keyframes kbpv-scan { 0% { opacity: 0; transform: translateY(10px); filter: blur(5px); } 100% { opacity: 1; transform: translateY(0); filter: blur(0); } }
        @keyframes kbpv-dot { 0%,80%,100% { opacity: .25; } 40% { opacity: 1; } }
      `}</style>

      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column" }}>
        {/* Minimal chrome — just era-nav, no panels */}
        <header style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderBottom: `1px solid ${BORDER_SOFT}`, background: "rgba(7,8,9,0.7)" }}>
          <div aria-hidden style={{ width: 18, height: 18, borderRadius: 5, background: `conic-gradient(from 90deg, ${a}, ${b})`, boxShadow: `0 0 10px ${a}66` }} />
          <span style={{ fontSize: 12.5, fontWeight: 600 }}>kiruk.build</span>
          <span style={{ color: INK_MUTE, fontSize: 10, fontFamily: FONT_MONO }}>era {era.id}</span>
          <span style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
            <NavBtn onClick={onPrev} disabled={!prevEra}>◂</NavBtn>
            <NavBtn onClick={onCustomize}>⚙</NavBtn>
            <NavBtn onClick={onClose} primary a={a} b={b}>▶ Use</NavBtn>
            <NavBtn onClick={onNext} disabled={!nextEra}>▸</NavBtn>
          </span>
        </header>

        {/* Full canvas */}
        <div style={{ flex: 1, position: "relative", overflowY: "auto", minHeight: 0 }}>
          {built === 0 ? (
            <div style={{ height: "100%", display: "grid", placeItems: "center", color: INK_MUTE, fontSize: 10 }}>compiling…</div>
          ) : (
            <div style={{ paddingBottom: 56 }}>
              {built >= 1 && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", borderBottom: `1px solid ${BORDER_SOFT}`, background: "rgba(12,14,16,0.8)", animation: "kbpv-scan 320ms" }}>
                  <span style={{ width: 13, height: 13, borderRadius: 4, background: `conic-gradient(from 90deg, ${a}, ${b})` }} />
                  <span style={{ fontSize: 10.5, fontWeight: 700 }}>KIRUK</span>
                  <span style={{ marginLeft: "auto", padding: "2px 9px", background: `linear-gradient(135deg, ${a}, ${b})`, color: "#04201b", borderRadius: 5, fontSize: 8, fontWeight: 600 }}>Hire</span>
                </div>
              )}
              {built >= 2 && (
                <div style={{ padding: "18px 14px", animation: "kbpv-scan 320ms" }}>
                  <div style={{ fontSize: 7.5, fontFamily: FONT_MONO, color: a, letterSpacing: 1, textTransform: "uppercase", marginBottom: 5 }}>{era.style} · era {era.id}</div>
                  <div style={{ fontSize: 21, fontWeight: 700, letterSpacing: -0.7, lineHeight: 1.05 }}>{era.name.replace(/^\d+:\s*/, "")}</div>
                  <div style={{ fontSize: 9.5, color: INK_DIM, lineHeight: 1.5, marginTop: 6 }}>{era.description.slice(0, 120)}…</div>
                  <span style={{ display: "inline-block", marginTop: 10, padding: "6px 13px", background: `linear-gradient(135deg, ${a}, ${b})`, color: "#04201b", borderRadius: 7, fontSize: 9, fontWeight: 600 }}>View work →</span>
                </div>
              )}
              {built >= 3 && (
                <div style={{ padding: 13, borderTop: `1px solid ${BORDER_SOFT}`, animation: "kbpv-scan 320ms" }}>
                  <div style={{ fontSize: 7.5, fontFamily: FONT_MONO, color: a, textTransform: "uppercase", marginBottom: 6 }}>signature traits</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {era.keyElements.map((k) => (
                      <span key={k} style={{ fontSize: 8.5, padding: "2px 7px", background: PANEL_2, border: `1px solid ${BORDER_SOFT}`, borderRadius: 999, color: INK_DIM }}>{k}</span>
                    ))}
                  </div>
                </div>
              )}
              {built >= 4 && (
                <div style={{ padding: 13, borderTop: `1px solid ${BORDER_SOFT}`, animation: "kbpv-scan 320ms" }}>
                  <div style={{ fontSize: 7.5, fontFamily: FONT_MONO, color: b, textTransform: "uppercase", marginBottom: 4 }}>lesson</div>
                  <div style={{ fontSize: 10.5, color: INK, lineHeight: 1.5 }}>{era.lesson}</div>
                </div>
              )}
            </div>
          )}

          {/* Floating command bar */}
          <div style={{ position: "absolute", left: "50%", bottom: 10, transform: "translateX(-50%)", width: "calc(100% - 28px)" }}>
            {building && (
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 5 }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "2px 9px", background: BG_2, border: `1px solid ${BORDER_SOFT}`, borderRadius: 999, fontFamily: FONT_MONO, fontSize: 8.5, color: INK_DIM }}>
                  <Dots a={a} /> building…
                </span>
              </div>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: 5, background: BG_2, border: `1px solid ${a}44`, borderRadius: 12, boxShadow: `0 8px 30px rgba(0,0,0,0.5)` }}>
              <span style={{ display: "flex", alignItems: "center", gap: 4, padding: "0 8px", height: 26, background: `linear-gradient(135deg, ${a}, ${b})`, color: "#04201b", borderRadius: 8, fontSize: 9, fontWeight: 700 }}>✨</span>
              <span style={{ color: a, fontFamily: FONT_MONO, fontSize: 11 }}>❯</span>
              <span style={{ flex: 1, fontSize: 10, color: INK }}>
                {typed}
                {building && <span style={{ display: "inline-block", width: 5, height: 9, marginLeft: 1, background: a, transform: "translateY(1px)" }} />}
              </span>
              <span style={{ width: 26, height: 26, borderRadius: 8, display: "grid", placeItems: "center", background: `linear-gradient(135deg, ${a}, ${b})`, color: "#04201b", fontSize: 11 }}>↑</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: "3px 12px", borderTop: `1px solid ${BORDER_SOFT}`, background: "rgba(7,8,9,0.6)", fontFamily: FONT_MONO, fontSize: 9, color: INK_MUTE, display: "flex", justifyContent: "space-between" }}>
          <span>one prompt bar · live build · any colour/font/radius</span>
          <span style={{ color: a }}>2026 · prompt-ui · {index + 1}/{total}</span>
        </div>
      </div>
    </div>
  );
};

function NavBtn({ children, onClick, disabled, primary, a = LIME, b = LIME }: { children: React.ReactNode; onClick: () => void; disabled?: boolean; primary?: boolean; a?: string; b?: string }) {
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
        color: primary ? "#04201b" : INK,
        background: primary ? `linear-gradient(135deg, ${a}, ${b})` : PANEL_2,
        border: `1px solid ${primary ? "transparent" : BORDER_SOFT}`,
        borderRadius: 8,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.4 : 1,
      }}
    >
      {children}
    </button>
  );
}

function Dots({ a }: { a: string }) {
  return (
    <span style={{ display: "inline-flex", gap: 2 }}>
      {[0, 1, 2].map((i) => (
        <span key={i} style={{ width: 3, height: 3, borderRadius: "50%", background: a, display: "inline-block", animation: `kbpv-dot 1.1s ${i * 0.18}s infinite` }} />
      ))}
    </span>
  );
}

export default PromptUIArchetype;
