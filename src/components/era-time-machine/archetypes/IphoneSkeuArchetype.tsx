"use client";

/**
 * IphoneSkeuArchetype — 2009 era preview inside <EraTimeMachine>.
 *
 * Matches landing: small iPhone OS 3 device frame with status bar,
 * home screen grid of 6 era-data app icons, dock w/ era nav buttons,
 * home button. Tap an app to see its era data inside the screen.
 */

import React, { useMemo, useState } from "react";
import type { EraSurfaceProps } from "../shared/EraSurface";
import { hideArchetypeTransport } from "../shared/eraChrome";

const DESK = "#1a1f2a";
const DESK_2 = "#0a0c14";
const BEZEL = "#0a0a0d";
const BEZEL_HI = "#3d4250";
const STATUS_BAR = "#181818";
const WALL_TOP = "#1f3a5c";
const WALL_BOT = "#04101e";
const INK = "#1a1a1a";
const INK_DIM = "#5b6470";
const MUTED = "#8e95a3";
const IOS_BLUE = "#007aff";
const GREEN = "#34c759";

const FONT_UI = "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif";
const FONT_DISPLAY = "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif";
const FONT_MONO = "'Menlo', 'Courier New', monospace";

export const IphoneSkeuArchetype: React.FC<EraSurfaceProps> = ({
  era,
  prevEra,
  nextEra,
  index,
  total,
  onPrev,
  onNext,
  onClose,
  embedMode,
}) => {
  const hideTransport = hideArchetypeTransport({ embedMode });
  type AppId = "palette" | "type" | "tokens" | "elements" | "heritage" | "lesson";
  const apps: Array<{ id: AppId; label: string; icon: string; bg: string }> = [
    { id: "palette",  label: "Palette",  icon: "🎨", bg: era.colors.primary },
    { id: "type",     label: "Type",     icon: "🅰",  bg: "#cc6600" },
    { id: "tokens",   label: "Tokens",   icon: "⚙",  bg: "#9933cc" },
    { id: "elements", label: "Parts",    icon: "▣",  bg: era.colors.accent },
    { id: "heritage", label: "Heritage", icon: "📜", bg: "#5fb8ff" },
    { id: "lesson",   label: "Lesson",   icon: "★",  bg: "#cc0066" },
  ];
  const [open, setOpen] = useState<AppId | null>(null);

  const time = useMemo(
    () => new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
    [],
  );

  const palette = [
    ["primary", era.colors.primary],
    ["secondary", era.colors.secondary],
    ["accent", era.colors.accent],
    ["background", era.colors.background],
    ["text", era.colors.text],
  ] as const;

  const tokens = era.designTokens;
  const tokenRows: Array<[string, string]> = [
    ["radius", `${tokens.borderRadius}px`],
    ["shadow", `${tokens.shadowStyle}`],
    ["grid", tokens.gridSize ? `${tokens.gridSize}px` : "—"],
    ["motion", tokens.animationStyle],
  ];

  const W = 240;
  const H = 380;

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{
        background:
          `radial-gradient(ellipse 80% 60% at 50% 30%, #2a2f3a 0%, ${DESK} 50%, ${DESK_2} 100%)`,
        color: "#fff",
        fontFamily: FONT_UI,
      }}
    >
      <style jsx global>{`
        @keyframes iskeu-pv-open {
          0%   { opacity: 0; transform: scale(0.86); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>

      <div
        style={{
          position: "absolute",
          inset: 0,
          overflowY: "auto",
          padding: "12px 16px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 10,
        }}
      >
        {/* Mode chips */}
        <div
          style={{
            display: "flex",
            gap: 5,
            color: "#cfd5e0",
            fontFamily: FONT_UI,
            fontSize: 10,
            letterSpacing: 1,
            textTransform: "uppercase",
          }}
        >
          <span
            style={{
              padding: "2px 8px",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.18)",
              borderRadius: 999,
              fontFamily: FONT_MONO,
              fontSize: 9,
            }}
          >
            kiruk OS · era {era.id} · {index + 1}/{total}
          </span>
        </div>

        {/* Device */}
        <div
          style={{
            position: "relative",
            width: W + 20,
            height: H + 80,
            padding: 10,
            background:
              `linear-gradient(180deg, ${BEZEL_HI} 0%, ${BEZEL} 14%, ${BEZEL} 86%, ${BEZEL_HI} 100%)`,
            borderRadius: 32,
            boxShadow:
              `0 14px 32px rgba(0,0,0,0.5), inset 0 2px 0 #515767, inset 0 -2px 0 #000`,
          }}
        >
          {/* Top */}
          <div
            style={{
              position: "absolute",
              top: 12,
              left: 0,
              right: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <span
              aria-hidden
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "radial-gradient(circle at 30% 30%, #2a2a2a 0%, #050505 100%)",
              }}
            />
            <span
              aria-hidden
              style={{
                width: 40,
                height: 4,
                borderRadius: 3,
                background: "linear-gradient(180deg, #000 0%, #1a1a1a 50%, #000 100%)",
              }}
            />
          </div>

          {/* Screen */}
          <div
            style={{
              position: "relative",
              width: W,
              height: H,
              marginTop: 28,
              background: "#000",
              overflow: "hidden",
              borderRadius: 3,
              boxShadow: "inset 0 0 0 1px #000",
            }}
          >
            {/* Status bar */}
            <div
              style={{
                background: STATUS_BAR,
                color: "#fff",
                padding: "2px 6px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontFamily: FONT_DISPLAY,
                fontSize: 9,
                fontWeight: 700,
                height: 18,
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                {[3, 4, 5, 5, 5].map((h, i) => (
                  <span
                    key={i}
                    style={{
                      width: 2,
                      height: h,
                      background: i < 4 ? "#fff" : "rgba(255,255,255,0.55)",
                    }}
                  />
                ))}
                <span style={{ marginLeft: 3, fontSize: 9 }}>3G</span>
              </span>
              <span>{time}</span>
              <span style={{ fontSize: 9 }}>96%</span>
            </div>

            {/* Body — home grid or app surface */}
            {open === null ? (
              <div
                style={{
                  position: "absolute",
                  inset: 18,
                  top: 26,
                  bottom: 18,
                  background:
                    `radial-gradient(ellipse 80% 60% at 50% 30%, #5fa8d8 0%, ${WALL_TOP} 60%, ${WALL_BOT} 100%)`,
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gridAutoRows: "min-content",
                  gap: 6,
                  padding: 10,
                  borderRadius: 3,
                }}
              >
                {apps.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => setOpen(a.id)}
                    title={a.label}
                    style={{
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 2,
                      color: "#fff",
                    }}
                  >
                    <div
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: 9,
                        background:
                          `radial-gradient(circle at 30% 25%, rgba(255,255,255,0.6) 0%, transparent 40%), linear-gradient(180deg, ${a.bg} 0%, ${darken(a.bg)} 100%)`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 22,
                        color: "#fff",
                        textShadow: "1px 1px 1px rgba(0,0,0,0.4)",
                        border: "1px solid rgba(0,0,0,0.3)",
                        boxShadow:
                          "inset 0 1px 1px rgba(255,255,255,0.4), 0 1px 3px rgba(0,0,0,0.4)",
                      }}
                    >
                      {a.icon}
                    </div>
                    <span
                      style={{
                        fontFamily: FONT_UI,
                        fontSize: 8,
                        color: "#fff",
                        textShadow: "0 1px 2px rgba(0,0,0,0.6)",
                      }}
                    >
                      {a.label}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div
                key={open}
                style={{
                  position: "absolute",
                  inset: 0,
                  top: 18,
                  background: "#e6e9ee",
                  display: "flex",
                  flexDirection: "column",
                  animation: "iskeu-pv-open 200ms cubic-bezier(0.2, 0.9, 0.3, 1.1)",
                }}
              >
                {/* App nav */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "auto 1fr auto",
                    padding: "4px 6px",
                    background: "linear-gradient(180deg, #b8c1cc 0%, #6c7480 100%)",
                    borderBottom: "1px solid #000",
                    color: "#fff",
                    boxShadow:
                      "inset 0 1px 0 rgba(255,255,255,0.18), inset 0 -1px 0 rgba(0,0,0,0.6)",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setOpen(null)}
                    style={{
                      padding: "1px 6px",
                      background: "rgba(255,255,255,0.15)",
                      color: "#fff",
                      border: "1px solid rgba(0,0,0,0.4)",
                      borderRadius: 3,
                      fontFamily: FONT_UI,
                      fontSize: 9,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    ◂ Home
                  </button>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontFamily: FONT_DISPLAY, fontSize: 11, fontWeight: 700, lineHeight: 1.1 }}>
                      {apps.find((a) => a.id === open)?.label}
                    </div>
                    <div style={{ fontSize: 8, letterSpacing: 1, opacity: 0.75 }}>
                      ERA {era.id}
                    </div>
                  </div>
                  <span style={{ width: 36 }} />
                </div>

                {/* Body per app */}
                <div style={{ flex: 1, overflowY: "auto", padding: 8, fontSize: 11, color: INK, fontFamily: FONT_UI }}>
                  {open === "palette" && (
                    <>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: `repeat(${palette.length}, 1fr)`,
                          height: 40,
                          border: "1px solid #b8c1cc",
                          borderRadius: 3,
                          overflow: "hidden",
                          marginBottom: 4,
                        }}
                      >
                        {palette.map(([k, v]) => (
                          <div key={k} title={`${k} ${v}`} style={{ backgroundColor: v }} />
                        ))}
                      </div>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: `repeat(${palette.length}, 1fr)`,
                          fontFamily: FONT_MONO,
                          fontSize: 8,
                          color: INK_DIM,
                        }}
                      >
                        {palette.map(([k]) => (
                          <div key={k} style={{ textAlign: "center", textTransform: "uppercase" }}>
                            {k}
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {open === "type" && (
                    <div>
                      <Specimen role="DISPLAY" font={era.fonts.primary} sample="Aa 01" size={20} />
                      <Specimen role="BODY" font={era.fonts.secondary} sample="The quick brown fox" size={11} />
                      <Specimen role="ACCENT" font={era.fonts.accent} sample="BUTTONS · LABELS" size={10} />
                    </div>
                  )}

                  {open === "tokens" && (
                    <table
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        fontFamily: FONT_MONO,
                        fontSize: 10,
                        background: "#fff",
                        border: "1px solid #b8c1cc",
                      }}
                    >
                      <tbody>
                        {tokenRows.map(([k, v], i) => (
                          <tr key={k} style={{ background: i % 2 === 0 ? "#f3f5f8" : "#fff" }}>
                            <td
                              style={{
                                padding: "3px 6px",
                                color: IOS_BLUE,
                                fontWeight: 700,
                                textTransform: "uppercase",
                                width: 70,
                              }}
                            >
                              {k}
                            </td>
                            <td style={{ padding: "3px 6px", color: INK }}>{v}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}

                  {open === "elements" && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {era.keyElements.map((el) => (
                        <span
                          key={el}
                          style={{
                            padding: "1px 6px",
                            background: "#fff",
                            border: "1px solid #b8c1cc",
                            borderRadius: 999,
                            fontSize: 10,
                            color: INK,
                          }}
                        >
                          ▸ {el}
                        </span>
                      ))}
                    </div>
                  )}

                  {open === "heritage" && (
                    <p style={{ margin: 0, fontSize: 11, color: INK, lineHeight: 1.45 }}>
                      {era.heritage}
                    </p>
                  )}

                  {open === "lesson" && (
                    <div
                      style={{
                        padding: "8px 10px",
                        background: "#fff",
                        border: "1px solid #b8c1cc",
                        borderRadius: 4,
                        fontFamily: FONT_DISPLAY,
                        fontStyle: "italic",
                        fontSize: 13,
                        color: IOS_BLUE,
                        lineHeight: 1.4,
                      }}
                    >
                      &ldquo;{era.lesson}&rdquo;
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Home button */}
          <div
            style={{
              position: "absolute",
              bottom: 10,
              left: 0,
              right: 0,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <button
              type="button"
              onClick={() => setOpen(null)}
              title="Home button"
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                background:
                  "radial-gradient(circle at 50% 35%, #4a4f5d 0%, #1a1d27 60%, #000 100%)",
                border: "1px solid #000",
                boxShadow:
                  "inset 0 2px 4px rgba(255,255,255,0.16), 0 2px 4px rgba(0,0,0,0.5)",
                cursor: "pointer",
                position: "relative",
              }}
            >
              <span
                aria-hidden
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  width: 12,
                  height: 12,
                  marginTop: -6,
                  marginLeft: -6,
                  borderRadius: 2,
                  border: "1.2px solid #8a8f9c",
                  boxSizing: "border-box",
                }}
              />
            </button>
          </div>
        </div>

        {/* Era nav row */}
        {!hideTransport && (
          <div style={{ display: "flex", gap: 5, marginTop: 4 }}>
            <NavBtn onClick={onPrev} disabled={!prevEra}>◂ Prev</NavBtn>
            <NavBtn onClick={onClose} primary>▶ Use Era {era.id}</NavBtn>
            <NavBtn onClick={onNext} disabled={!nextEra}>Next ▸</NavBtn>
          </div>
        )}
        <div
          style={{
            fontFamily: FONT_MONO,
            fontSize: 9,
            color: "rgba(255,255,255,0.5)",
            letterSpacing: 0.5,
            textAlign: "center",
          }}
        >
          tap any app · home button returns · skeuomorphic surfaces
        </div>
      </div>
    </div>
  );
};

function Specimen({
  role,
  font,
  sample,
  size,
}: {
  role: string;
  font: string;
  sample: string;
  size: number;
}) {
  const fontName = font.split(",")[0].replaceAll('"', "").trim();
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #b8c1cc",
        padding: "4px 6px",
        marginBottom: 4,
        borderRadius: 3,
      }}
    >
      <div
        style={{
          fontFamily: FONT_UI,
          fontSize: 8,
          letterSpacing: 1,
          color: IOS_BLUE,
          textTransform: "uppercase",
        }}
      >
        {role}
      </div>
      <div style={{ fontFamily: FONT_MONO, fontSize: 8, color: MUTED }}>{fontName}</div>
      <div style={{ fontFamily: font, fontSize: size, color: INK, lineHeight: 1.2, marginTop: 2 }}>
        {sample}
      </div>
    </div>
  );
}

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
        padding: "3px 9px",
        fontFamily: FONT_UI,
        fontSize: 10,
        fontWeight: 700,
        color: primary ? "#fff" : "#fff",
        background: primary
          ? `linear-gradient(180deg, ${IOS_BLUE} 0%, ${darken(IOS_BLUE)} 100%)`
          : "rgba(255,255,255,0.1)",
        border: primary ? `1px solid ${darken(IOS_BLUE)}` : "1px solid rgba(255,255,255,0.3)",
        borderRadius: 4,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.4 : 1,
        letterSpacing: 0.3,
        textShadow: primary ? "0 1px 0 rgba(0,0,0,0.35)" : "none",
        boxShadow: primary
          ? "inset 0 1px 0 rgba(255,255,255,0.3)"
          : "none",
      }}
    >
      {children}
    </button>
  );
}

function darken(hex: string): string {
  if (!hex.startsWith("#") || hex.length !== 7) return hex;
  const r = Math.max(0, parseInt(hex.slice(1, 3), 16) - 60);
  const g = Math.max(0, parseInt(hex.slice(3, 5), 16) - 60);
  const b = Math.max(0, parseInt(hex.slice(5, 7), 16) - 60);
  return `rgb(${r}, ${g}, ${b})`;
}

export default IphoneSkeuArchetype;
