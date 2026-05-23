"use client";

/**
 * AiNativeArchetype — 2023 era preview inside <EraTimeMachine>.
 *
 * Matches landing: kiruk.ai conversational portfolio. Aurora backdrop,
 * a mini chat thread with a streaming answer about the era, a lens pill,
 * suggestion chips, and era-nav buttons in the top chrome.
 */

import React, { useEffect, useMemo, useState } from "react";
import type { EraSurfaceProps } from "../shared/EraSurface";

const BG = "#0c0a1d";
const PANEL = "rgba(255,255,255,0.05)";
const PANEL_2 = "rgba(255,255,255,0.08)";
const BORDER = "rgba(168,85,247,0.25)";
const BORDER_SOFT = "rgba(255,255,255,0.09)";
const INK = "#f1f5f9";
const INK_DIM = "#b3a9d9";
const INK_MUTE = "#7d7499";
const PURPLE = "#a855f7";
const CYAN = "#06b6d4";
const PINK = "#f472b6";

const FONT_DISPLAY = "'Clash Display', 'Space Grotesk', sans-serif";
const FONT_UI = "'General Sans', 'DM Sans', 'Inter', sans-serif";
const FONT_MONO = "'Geist Mono', 'JetBrains Mono', monospace";

export const AiNativeArchetype: React.FC<EraSurfaceProps> = ({
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
  // Mini streamed answer about the era.
  const answer = useMemo(
    () =>
      `${era.name.replace(/^\d+:\s*/, "")} — ${era.description.slice(0, 150)}${era.description.length > 150 ? "…" : ""}`,
    [era],
  );
  const reasoning = useMemo(
    () => [
      "Parsing query → era brief",
      `Retrieving artifact: ${era.style}`,
      `Loading ${era.keyElements.length} signature traits`,
    ],
    [era],
  );

  const [shown, setShown] = useState("");
  const [phase, setPhase] = useState<"thinking" | "streaming" | "done">("thinking");

  // Reset + stream whenever era changes.
  useEffect(() => {
    setShown("");
    setPhase("thinking");
    if (reduceMotion) {
      setShown(answer);
      setPhase("done");
      return;
    }
    const t = window.setTimeout(() => setPhase("streaming"), 700);
    return () => window.clearTimeout(t);
  }, [answer, reduceMotion]);

  useEffect(() => {
    if (phase !== "streaming") return;
    if (shown.length >= answer.length) {
      setPhase("done");
      return;
    }
    const t = window.setTimeout(
      () => setShown(answer.slice(0, Math.min(answer.length, shown.length + 3))),
      18,
    );
    return () => window.clearTimeout(t);
  }, [phase, shown, answer]);

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{ background: BG, color: INK, fontFamily: FONT_UI }}
    >
      <style jsx global>{`
        @keyframes kai-pv-aur1 { 0%,100% { transform: translate(-8%,-6%) scale(1);} 50% { transform: translate(8%,6%) scale(1.2);} }
        @keyframes kai-pv-aur2 { 0%,100% { transform: translate(8%,4%) scale(1.1);} 50% { transform: translate(-6%,-8%) scale(0.95);} }
        @keyframes kai-pv-blink { 0%,49%{opacity:1;} 50%,100%{opacity:0;} }
        @keyframes kai-pv-dot { 0%,80%,100%{opacity:.25;transform:translateY(0);} 40%{opacity:1;transform:translateY(-3px);} }
        @keyframes kai-pv-up { 0%{opacity:0;transform:translateY(6px);} 100%{opacity:1;transform:translateY(0);} }
      `}</style>

      {/* Aurora */}
      <div aria-hidden style={{ position: "absolute", inset: 0, zIndex: 0, overflow: "hidden" }}>
        <Blob color={PURPLE} top="-14%" left="-8%" size={360} anim="kai-pv-aur1 20s ease-in-out infinite" />
        <Blob color={CYAN} top="30%" left="58%" size={320} anim="kai-pv-aur2 24s ease-in-out infinite" />
        <Blob color={PINK} top="58%" left="6%" size={300} anim="kai-pv-aur1 26s ease-in-out infinite" />
      </div>

      <div style={{ position: "absolute", inset: 0, zIndex: 1, display: "flex", flexDirection: "column" }}>
        {/* Top chrome */}
        <header
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 12px",
            borderBottom: `1px solid ${BORDER_SOFT}`,
            background: "rgba(12,10,29,0.6)",
            backdropFilter: "blur(10px)",
          }}
        >
          <div
            aria-hidden
            style={{
              width: 20,
              height: 20,
              borderRadius: 6,
              background: `conic-gradient(from 140deg, ${PURPLE}, ${CYAN}, ${PINK}, ${PURPLE})`,
              boxShadow: `0 0 12px ${PURPLE}66`,
            }}
          />
          <span style={{ fontFamily: FONT_DISPLAY, fontSize: 13, fontWeight: 600 }}>
            kiruk<span style={{ color: PURPLE }}>.ai</span>
          </span>
          <span style={{ color: INK_MUTE, fontSize: 10 }}>· era {era.id}</span>

          <span style={{ marginLeft: "auto", display: "flex", gap: 4, alignItems: "center" }}>
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                padding: "2px 8px",
                background: PANEL,
                border: `1px solid ${PINK}55`,
                borderRadius: 999,
                fontSize: 10,
              }}
            >
              <span style={{ color: PINK }}>✦</span> Designer
            </span>
            <NavBtn onClick={onPrev} disabled={!prevEra}>◂</NavBtn>
            <NavBtn onClick={onCustomize}>⚙</NavBtn>
            <NavBtn onClick={onClose} primary>▶ Use</NavBtn>
            <NavBtn onClick={onNext} disabled={!nextEra}>▸</NavBtn>
          </span>
        </header>

        {/* Thread */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 14px", minHeight: 0 }}>
          <div style={{ maxWidth: 460, margin: "0 auto", display: "flex", flexDirection: "column", gap: 14 }}>
            {/* User bubble */}
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <div
                style={{
                  maxWidth: "80%",
                  padding: "8px 12px",
                  background: `linear-gradient(135deg, ${PURPLE}, ${PINK})`,
                  color: "#fff",
                  borderRadius: "14px 14px 4px 14px",
                  fontSize: 12.5,
                  lineHeight: 1.45,
                }}
              >
                What defined the {era.id} era?
              </div>
            </div>

            {/* AI bubble */}
            <div style={{ display: "flex", gap: 9 }}>
              <div
                aria-hidden
                style={{
                  width: 24,
                  height: 24,
                  flexShrink: 0,
                  borderRadius: 8,
                  background: `conic-gradient(from 120deg, ${PURPLE}, ${CYAN}, ${PINK}, ${PURPLE})`,
                  boxShadow: `0 0 10px ${PURPLE}55`,
                  marginTop: 2,
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                {/* Reasoning */}
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "3px 9px",
                    background: PANEL,
                    border: `1px solid ${BORDER_SOFT}`,
                    borderRadius: 999,
                    fontSize: 10.5,
                    color: INK_DIM,
                    marginBottom: 8,
                  }}
                >
                  {phase === "thinking" ? (
                    <span style={{ display: "inline-flex", gap: 3 }}>
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          style={{
                            width: 4,
                            height: 4,
                            borderRadius: "50%",
                            background: PURPLE,
                            display: "inline-block",
                            animation: `kai-pv-dot 1.2s ${i * 0.16}s infinite`,
                          }}
                        />
                      ))}
                    </span>
                  ) : (
                    <span style={{ color: CYAN }}>✶</span>
                  )}
                  {phase === "thinking" ? "Thinking…" : "Retrieved 1 artifact"}
                </div>

                {phase === "thinking" && (
                  <ol style={{ listStyle: "none", margin: "0 0 0 2px", padding: 0, display: "flex", flexDirection: "column", gap: 5 }}>
                    {reasoning.map((s, i) => (
                      <li
                        key={i}
                        style={{
                          display: "flex",
                          gap: 7,
                          fontSize: 11,
                          color: INK_MUTE,
                          animation: `kai-pv-up 280ms ${i * 0.18}s both`,
                        }}
                      >
                        <span style={{ color: PURPLE, fontFamily: FONT_MONO, fontSize: 9 }}>{String(i + 1).padStart(2, "0")}</span>
                        {s}
                      </li>
                    ))}
                  </ol>
                )}

                {phase !== "thinking" && (
                  <div style={{ fontSize: 13, lineHeight: 1.6, color: INK }}>
                    {shown}
                    {phase === "streaming" && (
                      <span
                        aria-hidden
                        style={{
                          display: "inline-block",
                          width: 7,
                          height: 14,
                          marginLeft: 2,
                          transform: "translateY(2px)",
                          background: PURPLE,
                          borderRadius: 2,
                          animation: "kai-pv-blink 1s step-end infinite",
                        }}
                      />
                    )}
                  </div>
                )}

                {/* Era trait card (after stream) */}
                {phase === "done" && (
                  <div
                    style={{
                      marginTop: 12,
                      background: PANEL,
                      border: `1px solid ${BORDER}`,
                      borderRadius: 12,
                      padding: 11,
                      animation: "kai-pv-up 320ms ease-out",
                    }}
                  >
                    <div style={{ fontSize: 9.5, letterSpacing: 1, textTransform: "uppercase", color: INK_MUTE, marginBottom: 8, display: "flex", alignItems: "center", gap: 5 }}>
                      <span style={{ color: CYAN }}>◆</span> Signature traits
                      <span style={{ marginLeft: "auto", fontFamily: FONT_MONO, color: PURPLE }}>generated</span>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                      {era.keyElements.map((k) => (
                        <span
                          key={k}
                          style={{
                            fontSize: 10.5,
                            padding: "3px 9px",
                            background: PANEL_2,
                            border: `1px solid ${BORDER_SOFT}`,
                            borderRadius: 999,
                            color: INK_DIM,
                          }}
                        >
                          {k}
                        </span>
                      ))}
                    </div>
                    <div style={{ marginTop: 9, fontSize: 11, color: INK_MUTE, lineHeight: 1.5, borderTop: `1px solid ${BORDER_SOFT}`, paddingTop: 8 }}>
                      <span style={{ color: PINK }}>Lesson · </span>{era.lesson}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Composer mock */}
        <div style={{ padding: "8px 14px 12px", background: "linear-gradient(to top, rgba(12,10,29,0.95) 60%, transparent)" }}>
          <div style={{ maxWidth: 460, margin: "0 auto" }}>
            <div style={{ display: "flex", gap: 6, marginBottom: 7, flexWrap: "wrap" }}>
              {["Who is Arun?", "Show his work", "Reach him"].map((s) => (
                <span
                  key={s}
                  style={{
                    padding: "4px 9px",
                    background: PANEL,
                    border: `1px solid ${BORDER_SOFT}`,
                    borderRadius: 999,
                    color: INK_DIM,
                    fontSize: 10.5,
                  }}
                >
                  {s}
                </span>
              ))}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "7px 8px 7px 12px",
                background: "rgba(20,17,46,0.85)",
                border: `1px solid ${BORDER}`,
                borderRadius: 14,
                boxShadow: `0 0 24px ${PURPLE}1f`,
              }}
            >
              <span style={{ flex: 1, fontSize: 12, color: INK_MUTE }}>Ask kiruk.ai anything about Arun…</span>
              <span
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 10,
                  display: "grid",
                  placeItems: "center",
                  background: `linear-gradient(135deg, ${PURPLE}, ${PINK})`,
                  color: "#fff",
                  fontSize: 13,
                  boxShadow: `0 0 14px ${PURPLE}66`,
                }}
              >
                ↑
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "3px 12px",
            borderTop: `1px solid ${BORDER_SOFT}`,
            background: "rgba(12,10,29,0.6)",
            fontFamily: FONT_MONO,
            fontSize: 9,
            color: INK_MUTE,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <span>streaming · reasoning · lens switch</span>
          <span style={{ color: PURPLE }}>
            2023 · ai-native · {index + 1}/{total}
          </span>
        </div>
      </div>
    </div>
  );
};

function NavBtn({
  children,
  onClick,
  disabled,
  primary,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  primary?: boolean;
}) {
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
        color: primary ? "#fff" : INK,
        background: primary ? `linear-gradient(135deg, ${PURPLE}, ${PINK})` : PANEL,
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

function Blob({
  color,
  top,
  left,
  size,
  anim,
}: {
  color: string;
  top: string;
  left: string;
  size: number;
  anim: string;
}) {
  return (
    <div
      style={{
        position: "absolute",
        top,
        left,
        width: size,
        height: size,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${color}55 0%, ${color}00 68%)`,
        filter: "blur(30px)",
        animation: anim,
        willChange: "transform",
      }}
    />
  );
}

export default AiNativeArchetype;
