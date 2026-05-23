"use client";

/**
 * PinboardArchetype — 2013 era preview inside <EraTimeMachine>.
 *
 * Matches landing: iOS 7 flat pinboard. Small masonry of era pin cards
 * with hairline borders, vibrant accent dots, and 4 era-data pins that
 * flip to reveal the back. Toggle to mini-deck swipe view.
 */

import React, { useMemo, useState } from "react";
import type { EraSurfaceProps } from "../shared/EraSurface";
import { hideArchetypeTransport } from "../shared/eraChrome";

const BG = "#f2f2f7";
const CARD = "#ffffff";
const INK = "#16181f";
const INK_DIM = "#767b91";
const HAIRLINE = "#d9dbe2";
const IOS_BLUE = "#007aff";
const IOS_PINK = "#ff2d55";
const IOS_PURPLE = "#af52de";
const IOS_TEAL = "#5ac8fa";
const IOS_ORANGE = "#ff9500";
const IOS_GREEN = "#34c759";

const FONT_UI = "'Helvetica Neue', 'Helvetica', 'Inter', sans-serif";
const FONT_DISPLAY = "'Helvetica Neue', 'Helvetica', sans-serif";
const FONT_MONO = "'Menlo', 'Courier New', monospace";

export const PinboardArchetype: React.FC<EraSurfaceProps> = ({
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
  const [view, setView] = useState<"board" | "deck">("board");
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});
  const toggle = (id: string) =>
    setFlipped((f) => ({ ...f, [id]: !f[id] }));

  const palette = [
    ["primary", era.colors.primary],
    ["secondary", era.colors.secondary],
    ["accent", era.colors.accent],
    ["background", era.colors.background],
    ["text", era.colors.text],
  ] as const;

  const pins = useMemo(
    () => [
      {
        id: "intro",
        label: "ERA",
        title: era.name.split(":")[1]?.trim() || era.name,
        accent: IOS_BLUE,
        size: 200,
        front: (
          <Front>
            <div style={topLbl(IOS_BLUE)}>ERA {era.id}</div>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 17, fontWeight: 200, letterSpacing: -0.3, marginTop: 4 }}>
              {era.name.split(":")[1]?.trim() || era.name}
            </div>
            <div style={{ fontSize: 10, color: INK_DIM, marginTop: 4 }}>
              {era.style} · {era.era}
            </div>
          </Front>
        ),
        back: (
          <Back color={IOS_BLUE} label="ERA · OVERVIEW">
            <p style={pBack}>{era.description}</p>
            <blockquote
              style={{
                margin: "6px 0 0",
                padding: "6px 10px",
                borderLeft: `2px solid ${IOS_BLUE}`,
                fontFamily: FONT_DISPLAY,
                fontSize: 12,
                fontStyle: "italic",
                color: IOS_BLUE,
              }}
            >
              &ldquo;{era.lesson}&rdquo;
            </blockquote>
          </Back>
        ),
      },
      {
        id: "palette",
        label: "PALETTE",
        title: "Color plate",
        accent: IOS_PINK,
        size: 200,
        front: (
          <Front>
            <div style={topLbl(IOS_PINK)}>PALETTE</div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${palette.length}, 1fr)`,
                height: 40,
                border: `1px solid ${HAIRLINE}`,
                borderRadius: 6,
                overflow: "hidden",
                marginTop: 6,
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
                marginTop: 4,
              }}
            >
              {palette.map(([k]) => (
                <div key={k} style={{ textAlign: "center", textTransform: "uppercase" }}>
                  {k}
                </div>
              ))}
            </div>
          </Front>
        ),
        back: (
          <Back color={IOS_PINK} label="PALETTE · HEX">
            {palette.map(([k, v]) => (
              <div
                key={k}
                style={{
                  display: "grid",
                  gridTemplateColumns: "70px 1fr auto",
                  gap: 6,
                  padding: "2px 0",
                  borderBottom: `1px solid ${HAIRLINE}`,
                  fontSize: 10,
                }}
              >
                <span style={{ color: INK_DIM, letterSpacing: 0.5, textTransform: "uppercase" }}>{k}</span>
                <span style={{ fontFamily: FONT_MONO }}>{v.toUpperCase()}</span>
                <span
                  aria-hidden
                  style={{
                    width: 14,
                    height: 14,
                    background: v,
                    border: `1px solid ${HAIRLINE}`,
                    borderRadius: 3,
                  }}
                />
              </div>
            ))}
          </Back>
        ),
      },
      {
        id: "type",
        label: "TYPE",
        title: "Typography",
        accent: IOS_PURPLE,
        size: 220,
        front: (
          <Front>
            <div style={topLbl(IOS_PURPLE)}>TYPE</div>
            <div
              style={{
                fontFamily: era.fonts.primary,
                fontSize: 22,
                marginTop: 8,
                lineHeight: 1.1,
              }}
            >
              Aa Bb 0123
            </div>
            <div
              style={{
                fontFamily: era.fonts.secondary,
                fontSize: 11,
                marginTop: 6,
                color: INK_DIM,
              }}
            >
              The quick brown fox.
            </div>
          </Front>
        ),
        back: (
          <Back color={IOS_PURPLE} label="TYPE · STACK">
            <DataRow k="display" v={era.fonts.primary.split(",")[0].replaceAll('"', "")} />
            <DataRow k="body" v={era.fonts.secondary.split(",")[0].replaceAll('"', "")} />
            <DataRow k="accent" v={era.fonts.accent.split(",")[0].replaceAll('"', "")} />
          </Back>
        ),
      },
      {
        id: "tokens",
        label: "TOKENS",
        title: "Design tokens",
        accent: IOS_ORANGE,
        size: 200,
        front: (
          <Front>
            <div style={topLbl(IOS_ORANGE)}>TOKENS</div>
            <div
              style={{
                fontFamily: FONT_DISPLAY,
                fontSize: 28,
                fontWeight: 100,
                color: IOS_ORANGE,
                letterSpacing: -1,
                marginTop: 6,
              }}
            >
              {era.designTokens.borderRadius}
              <span style={{ fontSize: 14, color: INK_DIM, letterSpacing: 0 }}>px</span>
            </div>
            <div style={{ fontSize: 10, color: INK_DIM, marginTop: 2 }}>
              border radius
            </div>
            <div style={{ fontSize: 10, color: INK, marginTop: 8 }}>
              motion · <strong>{era.designTokens.animationStyle}</strong>
            </div>
            <div style={{ fontSize: 10, color: INK }}>
              shadow · <strong>{era.designTokens.shadowStyle}</strong>
            </div>
          </Front>
        ),
        back: (
          <Back color={IOS_ORANGE} label="TOKENS · DETAIL">
            <DataRow k="radius" v={`${era.designTokens.borderRadius}px`} />
            <DataRow k="shadow" v={String(era.designTokens.shadowStyle)} />
            <DataRow k="motion" v={era.designTokens.animationStyle} />
            <DataRow k="grid" v={era.designTokens.gridSize ? `${era.designTokens.gridSize}px` : "—"} />
            <DataRow k="tracking" v={String(era.designTokens.letterSpacing)} />
          </Back>
        ),
      },
      {
        id: "parts",
        label: "PARTS",
        title: "Key elements",
        accent: IOS_TEAL,
        size: 220,
        front: (
          <Front>
            <div style={topLbl(IOS_TEAL)}>PARTS</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 3, marginTop: 6 }}>
              {era.keyElements.slice(0, 4).map((el) => (
                <span
                  key={el}
                  style={{
                    padding: "1px 7px",
                    fontSize: 10,
                    color: IOS_TEAL,
                    border: `1px solid ${IOS_TEAL}`,
                    borderRadius: 999,
                  }}
                >
                  {el}
                </span>
              ))}
            </div>
          </Front>
        ),
        back: (
          <Back color={IOS_TEAL} label="PARTS · ALL">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
              {era.keyElements.map((el) => (
                <span
                  key={el}
                  style={{
                    padding: "1px 7px",
                    fontSize: 10,
                    color: IOS_TEAL,
                    border: `1px solid ${IOS_TEAL}`,
                    borderRadius: 999,
                  }}
                >
                  {el}
                </span>
              ))}
            </div>
          </Back>
        ),
      },
      {
        id: "lesson",
        label: "LESSON",
        title: "Era lesson",
        accent: IOS_GREEN,
        size: 200,
        front: (
          <Front>
            <div style={topLbl(IOS_GREEN)}>LESSON</div>
            <div
              style={{
                fontFamily: FONT_DISPLAY,
                fontSize: 14,
                fontStyle: "italic",
                color: IOS_GREEN,
                marginTop: 8,
                lineHeight: 1.4,
              }}
            >
              &ldquo;{era.lesson}&rdquo;
            </div>
          </Front>
        ),
        back: (
          <Back color={IOS_GREEN} label="LESSON · HERITAGE">
            <p style={pBack}>{era.heritage}</p>
          </Back>
        ),
      },
    ],
    [era, palette],
  );

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{ background: BG, color: INK, fontFamily: FONT_UI }}
    >
      <style jsx global>{`
        @keyframes kiruk-2013pv-card-in {
          0% { opacity: 0; transform: translateY(6px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .kiruk-2013pv-flip {
          position: relative;
          width: 100%;
          height: 100%;
          transform-style: preserve-3d;
          transition: transform 540ms cubic-bezier(0.4, 0.0, 0.2, 1);
        }
        .kiruk-2013pv-flip.flipped { transform: rotateY(180deg); }
        .kiruk-2013pv-face {
          position: absolute; inset: 0;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
        .kiruk-2013pv-back-face { transform: rotateY(180deg); }
      `}</style>

      <div style={{ position: "absolute", inset: 0, overflowY: "auto" }}>
        {/* Header */}
        <header
          style={{
            position: "sticky",
            top: 0,
            zIndex: 5,
            background: "rgba(242,242,247,0.86)",
            backdropFilter: "blur(14px) saturate(160%)",
            WebkitBackdropFilter: "blur(14px) saturate(160%)",
            borderBottom: `1px solid ${HAIRLINE}`,
            padding: "8px 14px",
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          <div
            aria-hidden
            style={{
              width: 22,
              height: 22,
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${IOS_BLUE} 0%, ${IOS_PURPLE} 100%)`,
            }}
          />
          <div>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 14, fontWeight: 200, letterSpacing: -0.3, lineHeight: 1 }}>
              kiruk · pinboard
            </div>
            {!hideTransport && (
              <div style={{ fontSize: 9, color: INK_DIM, letterSpacing: 0.3 }}>
                era {era.id} · disc {index + 1}/{total}
              </div>
            )}
          </div>
          <div
            style={{
              marginLeft: "auto",
              display: "flex",
              gap: 4,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                border: `1px solid ${HAIRLINE}`,
                borderRadius: 999,
                overflow: "hidden",
                background: CARD,
              }}
            >
              <Seg active={view === "board"} onClick={() => setView("board")}>📌 Board</Seg>
              <Seg active={view === "deck"} onClick={() => setView("deck")}>🃏 Deck</Seg>
            </div>
            {!hideTransport && (
              <>
                <NavBtn onClick={onPrev} disabled={!prevEra}>◂</NavBtn>
                <NavBtn onClick={onClose} primary>▶ Use</NavBtn>
                <NavBtn onClick={onNext} disabled={!nextEra}>▸</NavBtn>
              </>
            )}
          </div>
        </header>

        <div style={{ maxWidth: 760, margin: "12px auto 0", padding: "0 12px 20px" }}>
          {view === "board" ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: 8,
                alignItems: "start",
              }}
            >
              {[
                [pins[0], pins[3]], // col1
                [pins[1], pins[4]], // col2
                [pins[2], pins[5]], // col3
              ].map((col, ci) => (
                <div key={ci} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {col.map((p) => (
                    <PinCard
                      key={p.id}
                      pin={p}
                      flipped={!!flipped[p.id]}
                      onClick={() => toggle(p.id)}
                    />
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <DeckMini pins={pins} />
          )}

          <div
            style={{
              marginTop: 14,
              fontFamily: FONT_MONO,
              fontSize: 9,
              color: INK_DIM,
              textAlign: "center",
              letterSpacing: 0.3,
            }}
          >
            tap a pin · flips to back · toggle Deck for swipe view
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Pin parts ────────────────────────────────────────────────────────

interface PinDef {
  id: string;
  label: string;
  title: string;
  accent: string;
  size: number;
  front: React.ReactNode;
  back: React.ReactNode;
}

function PinCard({
  pin,
  flipped,
  onClick,
}: {
  pin: PinDef;
  flipped: boolean;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        position: "relative",
        height: pin.size,
        perspective: 1200,
        cursor: "pointer",
        animation: "kiruk-2013pv-card-in 280ms ease-out",
      }}
    >
      <div className={`kiruk-2013pv-flip ${flipped ? "flipped" : ""}`}>
        <div
          className="kiruk-2013pv-face"
          style={{
            background: CARD,
            border: `1px solid ${HAIRLINE}`,
            borderRadius: 10,
            overflow: "hidden",
          }}
        >
          <div
            aria-hidden
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              bottom: 0,
              width: 3,
              background: pin.accent,
            }}
          />
          <div style={{ paddingLeft: 4, height: "100%" }}>{pin.front}</div>
        </div>
        <div
          className="kiruk-2013pv-face kiruk-2013pv-back-face"
          style={{
            background: CARD,
            border: `1px solid ${pin.accent}55`,
            borderRadius: 10,
            overflow: "hidden",
          }}
        >
          {pin.back}
        </div>
      </div>
    </div>
  );
}

function DeckMini({ pins }: { pins: PinDef[] }) {
  const [idx, setIdx] = useState(0);
  const cur = pins[idx];
  if (!cur) {
    return (
      <div
        style={{
          padding: "30px 16px",
          textAlign: "center",
          background: CARD,
          border: `1px solid ${HAIRLINE}`,
          borderRadius: 12,
        }}
      >
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 16, fontWeight: 300 }}>End of deck</div>
        <button
          type="button"
          onClick={() => setIdx(0)}
          style={{
            marginTop: 10,
            padding: "5px 14px",
            fontFamily: FONT_DISPLAY,
            fontSize: 11,
            color: "#fff",
            background: IOS_BLUE,
            border: "none",
            borderRadius: 999,
            cursor: "pointer",
          }}
        >
          ↻ reset
        </button>
      </div>
    );
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
      <div style={{ display: "flex", gap: 3 }}>
        {pins.map((p, i) => (
          <span
            key={p.id}
            style={{
              width: i === idx ? 14 : 5,
              height: 5,
              borderRadius: 3,
              background: i === idx ? p.accent : HAIRLINE,
              transition: "width 240ms",
            }}
          />
        ))}
      </div>
      <div
        style={{
          width: "min(300px, 100%)",
          height: 240,
          background: CARD,
          border: `2px solid ${cur.accent}`,
          borderRadius: 12,
          overflow: "hidden",
          position: "relative",
          boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
        }}
      >
        <div
          aria-hidden
          style={{ position: "absolute", top: 0, left: 0, width: 4, bottom: 0, background: cur.accent }}
        />
        <div style={{ paddingLeft: 4, height: "100%" }}>{cur.front}</div>
      </div>
      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
        <NavBtn onClick={() => setIdx((i) => i + 1)}>✕ skip</NavBtn>
        <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: INK_DIM }}>
          {idx + 1}/{pins.length}
        </span>
        <NavBtn onClick={() => setIdx((i) => i + 1)} primary>
          📌 pin
        </NavBtn>
      </div>
    </div>
  );
}

function Front({ children }: { children: React.ReactNode }) {
  return <div style={{ padding: 10, height: "100%", display: "flex", flexDirection: "column" }}>{children}</div>;
}

function Back({
  color,
  label,
  children,
}: {
  color: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ padding: 10, height: "100%", overflowY: "auto" }}>
      <div
        style={{
          fontFamily: FONT_DISPLAY,
          fontSize: 8,
          letterSpacing: 1.5,
          color,
          textTransform: "uppercase",
          fontWeight: 500,
          marginBottom: 4,
        }}
      >
        {label} · back
      </div>
      {children}
    </div>
  );
}

function DataRow({ k, v }: { k: string; v: string }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "70px 1fr",
        gap: 6,
        padding: "2px 0",
        borderBottom: `1px solid ${HAIRLINE}`,
        fontSize: 10,
      }}
    >
      <span style={{ color: INK_DIM, fontSize: 9, letterSpacing: 0.5, textTransform: "uppercase" }}>{k}</span>
      <span>{v}</span>
    </div>
  );
}

function topLbl(color: string): React.CSSProperties {
  return {
    fontFamily: FONT_DISPLAY,
    fontSize: 9,
    letterSpacing: 1.5,
    color,
    textTransform: "uppercase",
    fontWeight: 500,
  };
}

const pBack: React.CSSProperties = {
  margin: "2px 0 0",
  fontSize: 11,
  lineHeight: 1.45,
  color: INK,
};

function Seg({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "2px 10px",
        fontFamily: FONT_UI,
        fontSize: 10,
        fontWeight: 500,
        color: active ? "#fff" : INK,
        background: active ? IOS_BLUE : "transparent",
        border: "none",
        cursor: "pointer",
        letterSpacing: 0.3,
      }}
    >
      {children}
    </button>
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
        padding: "2px 8px",
        fontFamily: FONT_UI,
        fontSize: 10,
        fontWeight: 500,
        color: primary ? "#fff" : INK,
        background: primary ? IOS_BLUE : CARD,
        border: `1px solid ${primary ? IOS_BLUE : HAIRLINE}`,
        borderRadius: 999,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.4 : 1,
        letterSpacing: 0.3,
      }}
    >
      {children}
    </button>
  );
}

export default PinboardArchetype;
