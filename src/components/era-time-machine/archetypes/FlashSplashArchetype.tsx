"use client";

/**
 * FlashSplashArchetype — 2000 era preview inside <EraTimeMachine>.
 *
 * Matches the landing: KIRUK.COM — a Y2K Aqua desktop. Translucent
 * candy gradient, Aqua header w/ gel logo + search + hit counter, a
 * draggable browser-style window in the center holding era data, and
 * a bottom dock with Aqua candy icons. Drag the window by its title
 * bar to feel the era.
 */

import React, { useEffect, useRef, useState } from "react";
import type { EraSurfaceProps } from "../shared/EraSurface";
import { hideArchetypeTransport } from "../shared/eraChrome";

// Palette — mirror FlashSplashHomePage
const DESKTOP_BG_A = "#3aa6c4";
const DESKTOP_BG_B = "#7ec9da";
const DESKTOP_BG_C = "#ffe2a8";

const AQUA_HI = "#e6f3fb";
const AQUA = "#9fcfee";
const AQUA_DEEP = "#3a7fbf";
const AQUA_INK = "#0f3550";

const WINDOW_BG = "#fdfdff";
const WINDOW_BORDER = "#7a93a8";
const WINDOW_SHADOW = "0 14px 30px rgba(20,40,70,0.35), 0 4px 8px rgba(20,40,70,0.25)";

const TRAFFIC_RED = "#ff5f57";
const TRAFFIC_GREEN = "#28c840";

const INK = "#1a2a38";
const INK_DIM = "#516577";
const MUTED = "#8a9aab";
const ACCENT = "#0066cc";
const ACCENT_HOT = "#cc0066";

const FONT_UI = "'Trebuchet MS', 'Verdana', 'Helvetica Neue', sans-serif";
const FONT_DISPLAY = "'Helvetica Neue', 'Arial Black', 'Trebuchet MS', sans-serif";
const FONT_BODY = "'Verdana', 'Geneva', sans-serif";
const FONT_MONO = "'Courier New', Courier, monospace";

export const FlashSplashArchetype: React.FC<EraSurfaceProps> = ({
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
  type TabId = "intro" | "palette" | "type" | "tokens" | "elements" | "exit";
  const tabs: Array<{ id: TabId; num: string; tag: string; title: string; accent: string }> = [
    { id: "intro",    num: "01", tag: "INTRO",    title: "Welcome",            accent: ACCENT },
    { id: "palette",  num: "02", tag: "PALETTE",  title: "Color Plate",        accent: "#cc0099" },
    { id: "type",     num: "03", tag: "TYPE",     title: "Typography",         accent: "#009966" },
    { id: "tokens",   num: "04", tag: "TOKENS",   title: "Design Tokens",      accent: "#cc6600" },
    { id: "elements", num: "05", tag: "PARTS",    title: "Key Elements",       accent: "#9933cc" },
    { id: "exit",     num: "06", tag: "OUTRO",    title: "Heritage",           accent: ACCENT_HOT },
  ];
  const [tabIdx, setTabIdx] = useState(0);
  const tab = tabs[tabIdx];

  // Window position (draggable)
  const [pos, setPos] = useState({ x: 110, y: 70 });
  const dragRef = useRef<{ offsetX: number; offsetY: number } | null>(null);
  const beginDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    dragRef.current = {
      offsetX: e.clientX - pos.x,
      offsetY: e.clientY - pos.y,
    };
  };
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const d = dragRef.current;
      if (!d) return;
      setPos({
        x: Math.max(0, e.clientX - d.offsetX),
        y: Math.max(0, e.clientY - d.offsetY),
      });
    };
    const onUp = () => {
      dragRef.current = null;
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  // Hit counter
  const [hits] = useState(() => 13497 + Math.floor(Math.random() * 200));

  // Status ticker offset
  const [tk, setTk] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setTk((m) => (m + 1) % 200), 90);
    return () => window.clearInterval(id);
  }, []);

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
    ["tracking", String(tokens.letterSpacing)],
    ["leading", String(tokens.lineHeight)],
    ["motion", tokens.animationStyle],
  ];

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{ color: INK, fontFamily: FONT_UI }}
    >
      <style jsx global>{`
        @keyframes kiruk-2000pv-win-pop {
          0% { opacity: 0; transform: scale(0.96); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>

      {/* Candy desktop backdrop */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background:
            `radial-gradient(ellipse 80% 60% at 20% 10%, ${DESKTOP_BG_B} 0%, transparent 60%),` +
            `radial-gradient(ellipse 70% 60% at 90% 100%, ${DESKTOP_BG_C} 0%, transparent 65%),` +
            `linear-gradient(180deg, ${DESKTOP_BG_A} 0%, #1f5f80 100%)`,
          pointerEvents: "none",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent 0 2px, rgba(255,255,255,0.06) 2px 3px)",
        }}
      />

      {/* Header */}
      <header
        style={{
          position: "absolute",
          top: 12,
          left: 12,
          right: 12,
          zIndex: 5,
          display: "grid",
          gridTemplateColumns: "auto 1fr auto",
          alignItems: "center",
          gap: 12,
          padding: "6px 12px",
          background: `linear-gradient(180deg, ${AQUA_HI} 0%, ${AQUA} 60%, ${AQUA_DEEP} 100%)`,
          border: `1px solid ${AQUA_INK}`,
          borderRadius: 10,
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.9), inset 0 -1px 0 rgba(0,0,0,0.2), 0 6px 14px rgba(0,0,0,0.3)",
          color: AQUA_INK,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            aria-hidden
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              background:
                `radial-gradient(ellipse at 35% 30%, #fff 0%, #aee9ff 30%, #38a6e6 60%, #0a4a80 100%)`,
              border: `1px solid #04335a`,
              boxShadow:
                "inset 0 3px 6px rgba(255,255,255,0.85), inset 0 -2px 4px rgba(0,40,80,0.5), 0 1px 3px rgba(0,0,0,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: FONT_DISPLAY,
              fontSize: 16,
              fontWeight: 900,
              color: "#fff",
              textShadow: "0 1px 2px rgba(0,30,60,0.6)",
            }}
          >
            K
          </div>
          <div>
            <div
              style={{
                fontFamily: FONT_DISPLAY,
                fontSize: 15,
                fontWeight: 900,
                letterSpacing: -0.3,
                color: "#fff",
                textShadow: "0 1px 0 rgba(255,255,255,0.4)",
                lineHeight: 1,
              }}
            >
              KIRUK.COM
            </div>
            <div
              style={{
                fontFamily: FONT_UI,
                fontSize: 9,
                letterSpacing: 2,
                color: AQUA_INK,
                textTransform: "uppercase",
                fontStyle: "italic",
                marginTop: 1,
              }}
            >
              era {era.id} · disc {index + 1}/{total}
            </div>
          </div>
        </div>

        {/* Tabs as nav */}
        <div style={{ display: "flex", gap: 4, justifyContent: "center", flexWrap: "wrap" }}>
          {tabs.map((t, i) => (
            <AquaNav
              key={t.id}
              active={i === tabIdx}
              accent={t.accent}
              onClick={() => setTabIdx(i)}
            >
              {t.num} {t.tag}
            </AquaNav>
          ))}
        </div>

        {/* Hit counter */}
        <div style={{ textAlign: "right" }}>
          <div
            style={{
              fontFamily: FONT_MONO,
              fontSize: 8,
              color: AQUA_INK,
              letterSpacing: 1,
              textTransform: "uppercase",
            }}
          >
            visitor
          </div>
          <div
            style={{
              fontFamily: FONT_MONO,
              fontSize: 12,
              fontWeight: 700,
              padding: "1px 6px",
              background: "#001a36",
              color: "#39ff14",
              border: `1px solid #04335a`,
              borderRadius: 3,
              letterSpacing: 1,
              textShadow: "0 0 6px #39ff1488",
              boxShadow: "inset 0 1px 2px rgba(0,0,0,0.5)",
              display: "inline-block",
              marginTop: 2,
            }}
          >
            {String(hits).padStart(6, "0")}
          </div>
        </div>
      </header>

      {/* Floating draggable window */}
      <div
        style={{
          position: "absolute",
          left: pos.x,
          top: pos.y,
          width: 540,
          maxWidth: "calc(100% - 80px)",
          background: WINDOW_BG,
          border: `1px solid ${WINDOW_BORDER}`,
          borderRadius: 8,
          boxShadow: WINDOW_SHADOW,
          overflow: "hidden",
          animation: "kiruk-2000pv-win-pop 320ms cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <div
          onMouseDown={beginDrag}
          style={{
            padding: "5px 10px 5px 8px",
            background:
              `linear-gradient(180deg, ${AQUA_HI} 0%, #c9e3f2 30%, ${AQUA} 70%, ${AQUA_DEEP} 100%)`,
            borderBottom: `1px solid ${AQUA_INK}`,
            color: AQUA_INK,
            display: "grid",
            gridTemplateColumns: "auto 1fr auto",
            alignItems: "center",
            gap: 8,
            cursor: "grab",
            userSelect: "none",
          }}
        >
          {!hideTransport && (
            <div style={{ display: "flex", gap: 5 }}>
              <Light color={TRAFFIC_RED} symbol="×" onClick={onClose} title="Close" />
              <Light color={TRAFFIC_GREEN} symbol="+" onClick={onClose} title="Use this era" />
            </div>
          )}
          <div
            style={{
              fontFamily: FONT_DISPLAY,
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: 0.5,
              textAlign: "center",
              color: AQUA_INK,
              textShadow: "0 1px 0 rgba(255,255,255,0.6)",
            }}
          >
            {era.name.split(":")[1]?.trim() || era.name}
          </div>
          <div
            style={{
              fontFamily: FONT_UI,
              fontSize: 9,
              letterSpacing: 2,
              color: AQUA_INK,
              textTransform: "uppercase",
              fontWeight: 700,
              padding: "1px 6px",
              background: "rgba(255,255,255,0.55)",
              border: `1px solid ${AQUA_INK}66`,
              borderRadius: 999,
            }}
          >
            {tab.num} · {tab.tag}
          </div>
        </div>

        {/* Address bar */}
        <div
          style={{
            padding: "3px 10px",
            background: "#eef3f8",
            borderBottom: `1px solid ${WINDOW_BORDER}55`,
            fontFamily: FONT_MONO,
            fontSize: 10,
            color: INK_DIM,
            display: "flex",
            gap: 8,
          }}
        >
          <span style={{ color: ACCENT }}>http://</span>
          <span>kiruk.com/era/{era.id}/{tab.id}.html</span>
          <span style={{ marginLeft: "auto", color: MUTED }}>▼ Bookmarks ▾</span>
        </div>

        {/* Body */}
        <div
          style={{
            padding: "12px 14px 14px",
            fontFamily: FONT_BODY,
            fontSize: 12.5,
            color: INK,
            lineHeight: 1.55,
            background: `linear-gradient(180deg, ${WINDOW_BG} 0%, #f4f7fa 100%)`,
            maxHeight: 360,
            overflowY: "auto",
          }}
        >
          {tab.id === "intro" && (
            <>
              <p style={{ margin: "0 0 10px" }}>
                <strong style={{ color: ACCENT }}>Era {era.id}.</strong>{" "}
                {era.description}
              </p>
              <blockquote
                style={{
                  margin: "10px 0 0",
                  padding: "8px 12px",
                  background: `linear-gradient(135deg, #eef6ff 0%, #d6ebfc 100%)`,
                  border: `1px solid ${ACCENT}55`,
                  borderLeft: `3px solid ${ACCENT}`,
                  borderRadius: 6,
                  fontFamily: FONT_DISPLAY,
                  fontSize: 15,
                  fontStyle: "italic",
                  color: "#003d80",
                  lineHeight: 1.4,
                }}
              >
                &ldquo;{era.lesson}&rdquo;
              </blockquote>
            </>
          )}

          {tab.id === "palette" && (
            <>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: `repeat(${palette.length}, 1fr)`,
                  height: 52,
                  border: `1px solid ${WINDOW_BORDER}`,
                  borderRadius: 4,
                  overflow: "hidden",
                  marginBottom: 5,
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
                  fontSize: 10,
                  color: INK_DIM,
                }}
              >
                {palette.map(([k, v]) => (
                  <div key={k} style={{ textAlign: "center" }}>
                    <div style={{ color: ACCENT, textTransform: "uppercase" }}>{k}</div>
                    <div>{v.toUpperCase()}</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {tab.id === "type" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <Specimen role="DISPLAY" font={era.fonts.primary} sample="Aa Bb 0123" size={22} />
              <Specimen role="BODY" font={era.fonts.secondary} sample="The quick brown fox." size={12} />
              <Specimen role="ACCENT" font={era.fonts.accent} sample="BUTTONS · LABELS" size={11} />
              <Specimen role="HEADING" font={era.fonts.primary} sample="A Practitioner" size={16} italic />
            </div>
          )}

          {tab.id === "tokens" && (
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontFamily: FONT_MONO,
                fontSize: 11,
                border: `1px solid ${WINDOW_BORDER}`,
                borderRadius: 4,
                overflow: "hidden",
              }}
            >
              <tbody>
                {tokenRows.map(([k, v], i) => (
                  <tr key={k} style={{ background: i % 2 === 0 ? "#eef3f8" : "#fff" }}>
                    <td
                      style={{
                        padding: "4px 8px",
                        color: ACCENT,
                        letterSpacing: 1,
                        textTransform: "uppercase",
                        width: 90,
                        borderBottom: `1px solid ${WINDOW_BORDER}33`,
                      }}
                    >
                      {k}
                    </td>
                    <td
                      style={{
                        padding: "4px 8px",
                        color: INK,
                        borderBottom: `1px solid ${WINDOW_BORDER}33`,
                      }}
                    >
                      {v}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {tab.id === "elements" && (
            <>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 8 }}>
                {era.keyElements.map((el) => (
                  <span
                    key={el}
                    style={{
                      padding: "2px 8px",
                      background: `linear-gradient(180deg, #fff 0%, #eef6ff 100%)`,
                      border: `1px solid ${ACCENT}66`,
                      borderRadius: 999,
                      color: ACCENT,
                      fontSize: 11,
                      letterSpacing: 0.5,
                      fontWeight: 700,
                    }}
                  >
                    ▸ {el}
                  </span>
                ))}
              </div>
              {era.designTokens.effects.length > 0 && (
                <div
                  style={{
                    padding: "5px 9px",
                    border: `1px dashed ${ACCENT_HOT}66`,
                    borderRadius: 4,
                    fontFamily: FONT_MONO,
                    fontSize: 11,
                    color: ACCENT_HOT,
                  }}
                >
                  FX ▸ {era.designTokens.effects.join(" · ")}
                </div>
              )}
            </>
          )}

          {tab.id === "exit" && (
            <>
              <p style={{ margin: "0 0 10px", fontSize: 12.5, lineHeight: 1.55 }}>
                <span
                  style={{
                    fontFamily: FONT_UI,
                    fontSize: 9,
                    letterSpacing: 2,
                    color: ACCENT,
                    textTransform: "uppercase",
                    marginRight: 6,
                  }}
                >
                  Heritage
                </span>
                {era.heritage}
              </p>
              <div
                style={{
                  padding: "8px 12px",
                  background: `linear-gradient(135deg, #ffe6f0 0%, #ffd6e6 100%)`,
                  border: `1px solid ${ACCENT_HOT}55`,
                  borderLeft: `3px solid ${ACCENT_HOT}`,
                  borderRadius: 6,
                  fontFamily: FONT_DISPLAY,
                  fontStyle: "italic",
                  fontSize: 15,
                  color: "#660033",
                }}
              >
                &ldquo;{era.lesson}&rdquo;
              </div>
            </>
          )}
        </div>

        {/* Status foot */}
        <div
          style={{
            padding: "3px 10px",
            background: "#e3eaf1",
            borderTop: `1px solid ${WINDOW_BORDER}55`,
            fontFamily: FONT_MONO,
            fontSize: 9,
            color: MUTED,
            letterSpacing: 1,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <span>
            <span style={{ color: "#1a8a2a" }}>●</span> Done · drag the title bar to move
          </span>
          <span>56 kbps · 0 errors</span>
        </div>
      </div>

      {!hideTransport && (
        <div
          style={{
            position: "absolute",
            bottom: 70,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 6,
            display: "flex",
            gap: 6,
          }}
        >
          <AquaPill onClick={onPrev} disabled={!prevEra}>
            ◂ Prev Era
          </AquaPill>
          <AquaPill onClick={onClose} primary>
            ▶ Use Era {era.id}
          </AquaPill>
          <AquaPill onClick={onNext} disabled={!nextEra}>
            Next Era ▸
          </AquaPill>
        </div>
      )}

      {/* Dock */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          transform: "translateX(-50%)",
          bottom: 14,
          zIndex: 7,
          display: "flex",
          gap: 6,
          padding: "5px 12px",
          background:
            `linear-gradient(180deg, ${AQUA_HI}cc 0%, ${AQUA}cc 60%, ${AQUA_DEEP}cc 100%)`,
          border: `1px solid ${AQUA_INK}`,
          borderRadius: 14,
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.9), inset 0 -1px 0 rgba(0,0,0,0.2), 0 6px 16px rgba(0,0,0,0.4)",
        }}
      >
        {tabs.map((t, i) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTabIdx(i)}
            title={`${t.tag} — ${t.title}`}
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background:
                `radial-gradient(ellipse at 30% 25%, #fff 0%, ${t.accent}aa 35%, ${t.accent} 70%, ${darken(t.accent)} 100%)`,
              border: `1px solid ${AQUA_INK}`,
              boxShadow:
                "inset 0 3px 6px rgba(255,255,255,0.85), inset 0 -2px 4px rgba(0,0,0,0.35), 0 2px 3px rgba(0,0,0,0.3)",
              cursor: "pointer",
              fontFamily: FONT_DISPLAY,
              fontSize: 10,
              fontWeight: 900,
              color: "#fff",
              textShadow: "0 1px 2px rgba(0,0,0,0.6)",
              transform: i === tabIdx ? "scale(1.16)" : "scale(1)",
              transition: "transform 160ms",
            }}
          >
            {t.num}
          </button>
        ))}
      </div>

      {/* Status ticker */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 5,
          height: 18,
          overflow: "hidden",
          background: `linear-gradient(180deg, ${AQUA_DEEP} 0%, #1f4f7a 100%)`,
          borderTop: `1px solid ${AQUA_INK}`,
          color: "#fff",
          fontFamily: FONT_MONO,
          fontSize: 10,
        }}
      >
        <div
          style={{
            position: "absolute",
            whiteSpace: "nowrap",
            top: 3,
            left: -tk,
            transition: "left 90ms linear",
            letterSpacing: 1,
          }}
        >
          <span style={{ color: "#39ff14" }}>●</span> connected · 56 kbps · era {era.id} loaded · 0 errors · valid HTML 4.01 transitional · made with notepad and a 17-inch CRT ·{"  "}
        </div>
      </div>
    </div>
  );
};

function Light({
  color,
  symbol,
  title,
  onClick,
}: {
  color: string;
  symbol: string;
  title: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      title={title}
      style={{
        width: 14,
        height: 14,
        borderRadius: "50%",
        background:
          `radial-gradient(circle at 30% 30%, #fff 0%, ${color} 45%, ${darken(color)} 100%)`,
        border: `1px solid ${darken(color)}`,
        boxShadow:
          "inset 0 2px 2px rgba(255,255,255,0.7), inset 0 -1px 2px rgba(0,0,0,0.35)",
        cursor: "pointer",
        padding: 0,
        fontSize: 10,
        lineHeight: 1,
        color: "rgba(0,0,0,0.55)",
        fontFamily: FONT_DISPLAY,
        fontWeight: 700,
      }}
    >
      {symbol}
    </button>
  );
}

function AquaNav({
  children,
  onClick,
  active,
  accent,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active: boolean;
  accent: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "3px 8px",
        background: active
          ? `linear-gradient(180deg, ${accent}cc 0%, ${darken(accent)} 100%)`
          : `linear-gradient(180deg, ${AQUA_HI} 0%, ${AQUA} 60%, ${AQUA_DEEP} 100%)`,
        color: active ? "#fff" : AQUA_INK,
        border: `1px solid ${active ? darken(accent) : AQUA_INK}`,
        borderRadius: 6,
        fontFamily: FONT_DISPLAY,
        fontSize: 9,
        fontWeight: 900,
        letterSpacing: 1,
        cursor: "pointer",
        boxShadow: active
          ? `inset 0 1px 0 rgba(255,255,255,0.5), inset 0 -1px 0 rgba(0,0,0,0.3), 0 0 10px ${accent}66`
          : `inset 0 1px 0 rgba(255,255,255,0.9), inset 0 -1px 0 rgba(0,0,0,0.2)`,
        textTransform: "uppercase",
      }}
    >
      {children}
    </button>
  );
}

function AquaPill({
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
        padding: "5px 14px",
        background: primary
          ? `linear-gradient(180deg, #b8ddff 0%, ${AQUA_DEEP} 60%, #0a4a80 100%)`
          : `linear-gradient(180deg, ${AQUA_HI} 0%, ${AQUA} 60%, ${AQUA_DEEP} 100%)`,
        color: primary ? "#fff" : AQUA_INK,
        border: `1px solid ${AQUA_INK}`,
        borderRadius: 999,
        fontFamily: FONT_DISPLAY,
        fontSize: 11,
        fontWeight: 900,
        letterSpacing: 1,
        textTransform: "uppercase",
        cursor: disabled ? "not-allowed" : "pointer",
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.9), inset 0 -1px 0 rgba(0,0,0,0.2), 0 2px 4px rgba(0,0,0,0.25)",
        opacity: disabled ? 0.4 : 1,
        textShadow: primary ? "0 1px 1px rgba(0,30,60,0.5)" : "none",
      }}
    >
      {children}
    </button>
  );
}

function Specimen({
  role,
  font,
  sample,
  size,
  italic,
}: {
  role: string;
  font: string;
  sample: string;
  size: number;
  italic?: boolean;
}) {
  const fontName = font.split(",")[0].replaceAll('"', "").trim();
  return (
    <div
      style={{
        background: `linear-gradient(180deg, #fff 0%, #eef6ff 100%)`,
        border: `1px solid ${ACCENT}55`,
        borderRadius: 5,
        padding: 8,
      }}
    >
      <div
        style={{
          fontFamily: FONT_UI,
          fontSize: 9,
          letterSpacing: 2,
          color: ACCENT,
          textTransform: "uppercase",
          marginBottom: 2,
          fontWeight: 700,
        }}
      >
        {role}
      </div>
      <div style={{ fontFamily: FONT_MONO, fontSize: 9, color: INK_DIM, marginBottom: 4 }}>
        {fontName}
      </div>
      <div
        style={{
          fontFamily: font,
          fontStyle: italic ? "italic" : "normal",
          fontSize: size,
          color: INK,
          lineHeight: 1.3,
        }}
      >
        {sample}
      </div>
    </div>
  );
}

function darken(hex: string): string {
  if (!hex.startsWith("#") || hex.length !== 7) return hex;
  const r = Math.max(0, parseInt(hex.slice(1, 3), 16) - 60);
  const g = Math.max(0, parseInt(hex.slice(3, 5), 16) - 60);
  const b = Math.max(0, parseInt(hex.slice(5, 7), 16) - 60);
  return `rgb(${r}, ${g}, ${b})`;
}

export default FlashSplashArchetype;
