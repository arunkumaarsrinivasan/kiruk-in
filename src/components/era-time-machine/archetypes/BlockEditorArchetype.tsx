"use client";

/**
 * BlockEditorArchetype — 2018 era preview inside <EraTimeMachine>.
 *
 * Matches landing: Notion-style block editor workspace. Compact 3-pane
 * shell: sidebar w/ era-as-pages, editor canvas w/ era-data blocks,
 * thin right rail w/ properties. Slash-command pill + a11y mini-bar.
 */

import React, { useMemo, useState } from "react";
import type { EraSurfaceProps } from "../shared/EraSurface";
import { hideArchetypeTransport } from "../shared/eraChrome";

const BG = "#ffffff";
const BG_DIM = "#fbfaf8";
const SIDE = "#f7f6f3";
const INK = "#37352f";
const INK_DIM = "#787774";
const HAIRLINE = "#ecebe9";
const HOVER = "#f2f1ee";
const ACC = "#2eaadc";
const GREEN = "#0f7b6c";
const YELLOW = "#dfab01";

const FONT_UI = "'Inter', 'Segoe UI', 'Helvetica Neue', sans-serif";
const FONT_DISPLAY = "'Inter', 'Segoe UI', 'Helvetica Neue', sans-serif";
const FONT_MONO = "'JetBrains Mono', 'SFMono-Regular', 'Menlo', monospace";

export const BlockEditorArchetype: React.FC<EraSurfaceProps> = ({
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
  type PageId = "overview" | "palette" | "type" | "tokens" | "parts" | "heritage";
  const pages: Array<{ id: PageId; emoji: string; title: string }> = [
    { id: "overview", emoji: "📄", title: "Overview" },
    { id: "palette",  emoji: "🎨", title: "Palette" },
    { id: "type",     emoji: "🅰", title: "Typography" },
    { id: "tokens",   emoji: "⚙",  title: "Tokens" },
    { id: "parts",    emoji: "▣",  title: "Key parts" },
    { id: "heritage", emoji: "📜", title: "Heritage" },
  ];
  const [active, setActive] = useState<PageId>("overview");
  const cur = pages.find((p) => p.id === active)!;
  const [cmdOpen, setCmdOpen] = useState(false);

  const palette = useMemo(
    () =>
      [
        ["primary", era.colors.primary],
        ["secondary", era.colors.secondary],
        ["accent", era.colors.accent],
        ["background", era.colors.background],
        ["text", era.colors.text],
      ] as const,
    [era],
  );

  const tokens = era.designTokens;

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{
        background: BG,
        color: INK,
        fontFamily: FONT_UI,
      }}
    >
      <style jsx global>{`
        @keyframes kiruk-2018pv-fade {
          0% { opacity: 0; transform: translateY(3px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes kiruk-2018pv-modal {
          0% { opacity: 0; transform: scale(0.96); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>

      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column" }}>
        {/* Top chrome */}
        <header
          style={{
            background: BG,
            borderBottom: `1px solid ${HAIRLINE}`,
            padding: "5px 10px",
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 11,
          }}
        >
          <span style={{ color: INK_DIM, fontSize: 11 }}>
            KIRUK Workspace
            <span style={{ color: INK_DIM, margin: "0 4px" }}>/</span>
            <span style={{ color: INK, fontWeight: 500 }}>
              {cur.emoji} {cur.title}
            </span>
          </span>
          <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
            <button
              type="button"
              onClick={() => setCmdOpen(true)}
              style={{
                padding: "2px 8px",
                fontFamily: FONT_UI,
                fontSize: 10,
                color: INK,
                background: BG_DIM,
                border: `1px solid ${HAIRLINE}`,
                borderRadius: 4,
                cursor: "pointer",
              }}
            >
              🔍 Search · /
            </button>
            {!hideTransport && (
              <>
                <NavBtn onClick={onPrev} disabled={!prevEra}>◂</NavBtn>
                <NavBtn onClick={onClose} primary>▶ Use</NavBtn>
                <NavBtn onClick={onNext} disabled={!nextEra}>▸</NavBtn>
              </>
            )}
          </div>
        </header>

        {/* Body */}
        <div
          style={{
            flex: 1,
            display: "grid",
            gridTemplateColumns: "160px 1fr 150px",
            minHeight: 0,
            overflow: "hidden",
          }}
        >
          {/* Sidebar */}
          <aside
            style={{
              background: SIDE,
              borderRight: `1px solid ${HAIRLINE}`,
              padding: "8px 6px",
              overflowY: "auto",
            }}
          >
            <div
              style={{
                padding: "4px 8px",
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginBottom: 4,
              }}
            >
              <div
                aria-hidden
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 3,
                  background: `linear-gradient(135deg, ${ACC} 0%, #9065b0 100%)`,
                }}
              />
              <div style={{ fontSize: 11, fontWeight: 600 }}>Era {era.id}</div>
            </div>
            <div
              style={{
                padding: "0 8px 4px",
                fontSize: 9,
                letterSpacing: 1,
                color: INK_DIM,
                textTransform: "uppercase",
                fontWeight: 600,
              }}
            >
              Pages · {pages.length}
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {pages.map((p) => {
                const isA = p.id === active;
                return (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => setActive(p.id)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                        width: "100%",
                        padding: "3px 8px",
                        background: isA ? HOVER : "transparent",
                        border: "none",
                        color: INK,
                        fontFamily: FONT_UI,
                        fontSize: 11,
                        cursor: "pointer",
                        textAlign: "left",
                        borderRadius: 3,
                        fontWeight: isA ? 500 : 400,
                      }}
                    >
                      <span style={{ fontSize: 12, width: 14 }}>{p.emoji}</span>
                      <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {p.title}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </aside>

          {/* Canvas */}
          <section
            key={active}
            style={{
              padding: "16px 18px",
              overflowY: "auto",
              animation: "kiruk-2018pv-fade 240ms ease-out",
            }}
          >
            <h1
              style={{
                fontFamily: FONT_DISPLAY,
                fontSize: 22,
                fontWeight: 700,
                letterSpacing: -0.5,
                margin: "0 0 4px",
                lineHeight: 1.2,
              }}
            >
              {cur.emoji} {cur.title}
            </h1>
            <div style={{ display: "flex", gap: 4, marginBottom: 12 }}>
              <Tag>era {era.id}</Tag>
              <Tag>{era.style}</Tag>
            </div>

            {active === "overview" && (
              <>
                <Callout>{era.description}</Callout>
                <p style={p}>
                  <strong>Lesson:</strong> {era.lesson}
                </p>
              </>
            )}

            {active === "palette" && (
              <>
                <Callout>Five colors that compose this era's surfaces.</Callout>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${palette.length}, 1fr)`,
                    height: 36,
                    border: `1px solid ${HAIRLINE}`,
                    borderRadius: 4,
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

            {active === "type" && (
              <>
                <Callout>Three faces carry the era — display, body, accent.</Callout>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
                  <tbody>
                    <Row k="display" v={era.fonts.primary.split(",")[0].replaceAll('"', "")} />
                    <Row k="body" v={era.fonts.secondary.split(",")[0].replaceAll('"', "")} />
                    <Row k="accent" v={era.fonts.accent.split(",")[0].replaceAll('"', "")} />
                  </tbody>
                </table>
                <div style={{ marginTop: 10, fontFamily: era.fonts.primary, fontSize: 18 }}>
                  The quick brown fox.
                </div>
              </>
            )}

            {active === "tokens" && (
              <>
                <Callout>Variables that turn era from a style into a system.</Callout>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
                  <tbody>
                    <Row k="radius" v={`${tokens.borderRadius}px`} />
                    <Row k="shadow" v={tokens.shadowStyle} />
                    <Row k="grid" v={tokens.gridSize ? `${tokens.gridSize}px` : "—"} />
                    <Row k="tracking" v={String(tokens.letterSpacing)} />
                    <Row k="leading" v={String(tokens.lineHeight)} />
                    <Row k="motion" v={tokens.animationStyle} />
                  </tbody>
                </table>
              </>
            )}

            {active === "parts" && (
              <>
                <Callout>Surface vocabulary — components, affordances, effects.</Callout>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {era.keyElements.map((el) => (
                    <span
                      key={el}
                      style={{
                        fontSize: 10,
                        padding: "1px 7px",
                        background: HOVER,
                        color: INK,
                        borderRadius: 3,
                      }}
                    >
                      {el}
                    </span>
                  ))}
                </div>
                {era.designTokens.effects.length > 0 && (
                  <div
                    style={{
                      marginTop: 8,
                      padding: "5px 8px",
                      background: `${ACC}11`,
                      border: `1px dashed ${ACC}55`,
                      borderRadius: 4,
                      fontFamily: FONT_MONO,
                      fontSize: 10,
                      color: ACC,
                    }}
                  >
                    fx ▸ {era.designTokens.effects.join(" · ")}
                  </div>
                )}
              </>
            )}

            {active === "heritage" && (
              <>
                <Callout>What this era left behind.</Callout>
                <p style={p}>{era.heritage}</p>
                <blockquote
                  style={{
                    margin: "10px 0 0",
                    paddingLeft: 10,
                    borderLeft: `3px solid ${INK}`,
                    fontSize: 13,
                    fontStyle: "italic",
                  }}
                >
                  &ldquo;{era.lesson}&rdquo;
                </blockquote>
              </>
            )}
          </section>

          {/* Right rail */}
          <aside
            style={{
              background: BG_DIM,
              borderLeft: `1px solid ${HAIRLINE}`,
              padding: "10px 8px",
              fontSize: 10,
              overflowY: "auto",
            }}
          >
            <div
              style={{
                fontSize: 9,
                letterSpacing: 1,
                color: INK_DIM,
                textTransform: "uppercase",
                fontWeight: 600,
                marginBottom: 6,
              }}
            >
              Properties
            </div>
            <Prop k="Status" v="Live" color={GREEN} />
            <Prop k="Type" v={era.style} color={ACC} />
            <Prop k="Year" v={era.id} mono />
            <Prop k="Era" v={era.era} />
            <div style={{ marginTop: 8, paddingTop: 6, borderTop: `1px solid ${HAIRLINE}` }}>
              <div
                style={{
                  fontSize: 9,
                  letterSpacing: 1,
                  color: INK_DIM,
                  textTransform: "uppercase",
                  fontWeight: 600,
                  marginBottom: 4,
                }}
              >
                Tags
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                {era.keyElements.slice(0, 3).map((el) => (
                  <span
                    key={el}
                    style={{
                      fontSize: 9,
                      padding: "1px 5px",
                      background: HOVER,
                      borderRadius: 2,
                    }}
                  >
                    {el}
                  </span>
                ))}
              </div>
            </div>
            <div
              style={{
                marginTop: 10,
                paddingTop: 6,
                borderTop: `1px solid ${HAIRLINE}`,
                fontSize: 9,
                color: INK_DIM,
                lineHeight: 1.5,
              }}
            >
              <div
                style={{
                  fontSize: 9,
                  letterSpacing: 1,
                  color: INK_DIM,
                  textTransform: "uppercase",
                  fontWeight: 600,
                  marginBottom: 4,
                }}
              >
                Disc
              </div>
              {index + 1} of {total}
            </div>
          </aside>
        </div>

        {/* Footer pill */}
        <div
          style={{
            padding: "4px 10px",
            borderTop: `1px solid ${HAIRLINE}`,
            background: BG,
            fontFamily: FONT_MONO,
            fontSize: 9,
            color: INK_DIM,
            display: "flex",
            justifyContent: "space-between",
            letterSpacing: 0.3,
          }}
        >
          <span>↑ ↓ pages · / search · ⌘K command</span>
          <span style={{ color: ACC }}>2018 · workspace</span>
        </div>
      </div>

      {/* Command palette */}
      {cmdOpen && (
        <div
          onClick={() => setCmdOpen(false)}
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.35)",
            backdropFilter: "blur(6px)",
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-start",
            paddingTop: 60,
            zIndex: 10,
            animation: "kiruk-2018pv-modal 180ms ease-out",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: BG,
              border: `1px solid ${HAIRLINE}`,
              borderRadius: 8,
              width: "min(360px, 90%)",
              boxShadow: "0 20px 50px rgba(0,0,0,0.35)",
            }}
          >
            <input
              autoFocus
              placeholder="Search pages, jump…"
              style={{
                width: "100%",
                padding: "10px 14px",
                border: "none",
                borderBottom: `1px solid ${HAIRLINE}`,
                background: BG,
                color: INK,
                fontFamily: FONT_UI,
                fontSize: 13,
                outline: "none",
                boxSizing: "border-box",
              }}
            />
            <div style={{ maxHeight: 240, overflowY: "auto" }}>
              {pages.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setActive(p.id);
                    setCmdOpen(false);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    width: "100%",
                    padding: "6px 12px",
                    background: "transparent",
                    border: "none",
                    color: INK,
                    fontFamily: FONT_UI,
                    fontSize: 12,
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = HOVER)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <span style={{ fontSize: 14, width: 18 }}>{p.emoji}</span>
                  <span>{p.title}</span>
                </button>
              ))}
            </div>
            <div
              style={{
                padding: "4px 10px",
                background: HOVER,
                borderTop: `1px solid ${HAIRLINE}`,
                fontFamily: FONT_MONO,
                fontSize: 9,
                color: INK_DIM,
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span>↵ open</span>
              <span>Esc close</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const p: React.CSSProperties = {
  fontSize: 12,
  lineHeight: 1.55,
  color: INK,
  margin: "4px 0",
};

function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        padding: "8px 10px",
        background: HOVER,
        borderRadius: 4,
        fontSize: 11,
        lineHeight: 1.5,
        marginBottom: 10,
        color: INK,
      }}
    >
      <span style={{ marginRight: 4 }}>💡</span>
      {children}
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <tr>
      <td
        style={{
          width: 80,
          padding: "3px 6px",
          fontSize: 10,
          color: INK_DIM,
          fontWeight: 500,
          letterSpacing: 0.3,
          textTransform: "uppercase",
          borderBottom: `1px solid ${HAIRLINE}`,
        }}
      >
        {k}
      </td>
      <td
        style={{
          padding: "3px 6px",
          borderBottom: `1px solid ${HAIRLINE}`,
          fontFamily: FONT_MONO,
          fontSize: 10,
        }}
      >
        {v}
      </td>
    </tr>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        fontSize: 9,
        padding: "1px 6px",
        background: HOVER,
        color: INK_DIM,
        borderRadius: 2,
      }}
    >
      #{children}
    </span>
  );
}

function Prop({
  k,
  v,
  color,
  mono,
}: {
  k: string;
  v: string;
  color?: string;
  mono?: boolean;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "60px 1fr",
        gap: 4,
        padding: "3px 0",
        fontSize: 10,
        alignItems: "center",
      }}
    >
      <span style={{ color: INK_DIM, fontSize: 9 }}>{k}</span>
      {color ? (
        <span
          style={{
            display: "inline-block",
            padding: "0 6px",
            background: `${color}22`,
            color,
            borderRadius: 2,
            fontSize: 9,
            fontWeight: 500,
            width: "fit-content",
          }}
        >
          {v}
        </span>
      ) : (
        <span style={{ color: INK, fontFamily: mono ? FONT_MONO : FONT_UI, fontSize: mono ? 9 : 10 }}>
          {v}
        </span>
      )}
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
        padding: "2px 8px",
        fontFamily: FONT_UI,
        fontSize: 10,
        fontWeight: 500,
        color: primary ? "#fff" : INK,
        background: primary ? ACC : BG,
        border: `1px solid ${primary ? ACC : HAIRLINE}`,
        borderRadius: 4,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.4 : 1,
        letterSpacing: 0.3,
      }}
    >
      {children}
    </button>
  );
}

export default BlockEditorArchetype;
