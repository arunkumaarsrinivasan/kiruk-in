"use client";

/**
 * FramesetArchetype — 1997 era preview inside <EraTimeMachine>.
 *
 * Multimedia CD-ROM title (Encarta / Cinemania / Bookshelf vibe) matching
 * the landing FramesetHomePage. Beveled CD-ROM application window with
 * wine title bar, disc icon, toolbar (Back / Fwd / Home / Eject / Play),
 * left chapter tree (era artifacts), right article pane (palette swatch
 * plate + typography specimens + tokens table + key elements).
 */

import React, { useMemo, useState } from "react";
import type { EraSurfaceProps } from "../shared/EraSurface";

// Palette — match FramesetHomePage
const WINE = "#6b1f2e";
const WINE_DARK = "#4a1320";
const WINE_LIGHT = "#8a2d3e";
const PAPER = "#f5ecd7";
const PAPER_LIGHT = "#faf5e6";
const PAPER_DEEP = "#ebe0c6";
const INK = "#2a1f1a";
const INK_DIM = "#5c4a3b";
const MUTED = "#8c7a66";
const GOLD = "#b8941c";
const DESK = "#2a1f1a";

const FONT_BODY = "Georgia, 'Bookman Old Style', 'Times New Roman', serif";
const FONT_UI = "Verdana, Tahoma, 'Lucida Grande', sans-serif";
const FONT_MONO = "'Courier New', Courier, monospace";

export const FramesetArchetype: React.FC<EraSurfaceProps> = ({
  era,
  prevEra,
  nextEra,
  index,
  total,
  onPrev,
  onNext,
  onCustomize,
  onClose,
}) => {
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
  const tokenRows: Array<[string, string]> = [
    ["radius", `${tokens.borderRadius}px`],
    ["shadow", `${tokens.shadowStyle} @ ${tokens.shadowIntensity}`],
    ["grid", tokens.gridSize ? `${tokens.gridSize}px` : "—"],
    ["tracking", String(tokens.letterSpacing)],
    ["leading", String(tokens.lineHeight)],
    ["motion", tokens.animationStyle],
  ];

  type ChapterId = "preface" | "signal" | "type" | "tokens" | "elements" | "heritage";
  const chapters: Array<{ id: ChapterId; num: string; title: string }> = [
    { id: "preface", num: "I", title: "Preface" },
    { id: "signal", num: "II", title: "Palette · Color Plate" },
    { id: "type", num: "III", title: "Typography · Specimens" },
    { id: "tokens", num: "IV", title: "Design Tokens" },
    { id: "elements", num: "V", title: "Key Elements" },
    { id: "heritage", num: "VI", title: "Heritage" },
  ];
  const [active, setActive] = useState<ChapterId>("preface");
  const activeIdx = chapters.findIndex((c) => c.id === active);

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{ backgroundColor: DESK, color: INK, fontFamily: FONT_UI }}
    >
      {/* Desktop wood-grain noise */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='2'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.4'/></svg>\")",
          opacity: 0.12,
          mixBlendMode: "overlay",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 85% 80% at 50% 50%, transparent 55%, rgba(0,0,0,0.45) 100%)",
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          overflowY: "auto",
          padding: 16,
        }}
      >
        {/* CD-ROM application window */}
        <div
          style={{
            maxWidth: 960,
            margin: "0 auto",
            backgroundColor: PAPER,
            border: `2px solid ${WINE_DARK}`,
            boxShadow:
              "inset 1px 1px 0 #fff8e1, inset -2px -2px 0 #b08a4a, 0 8px 32px rgba(0,0,0,0.55), 0 0 0 1px #000",
          }}
        >
          {/* ── Title bar ──────────────────────────────────────── */}
          <header
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "6px 10px",
              background: `linear-gradient(180deg, ${WINE_LIGHT} 0%, ${WINE} 55%, ${WINE_DARK} 100%)`,
              borderBottom: `2px solid ${WINE_DARK}`,
              color: PAPER,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <DiscIcon />
              <div>
                <div
                  style={{
                    fontFamily: FONT_BODY,
                    fontSize: 14,
                    letterSpacing: 0.5,
                    lineHeight: 1.1,
                    fontWeight: 700,
                  }}
                >
                  KIRUK · A Practitioner Profile
                </div>
                <div
                  style={{
                    fontFamily: FONT_UI,
                    fontSize: 9,
                    letterSpacing: 2,
                    color: GOLD,
                    textTransform: "uppercase",
                    marginTop: 1,
                  }}
                >
                  CD-ROM · Era {era.id} · Disc {index + 1} of {total}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              <WinBtn label="_" />
              <WinBtn label="□" />
              <WinBtn label="✕" onClick={onClose} />
            </div>
          </header>

          {/* ── Toolbar ────────────────────────────────────────── */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              padding: "5px 8px",
              backgroundColor: PAPER_DEEP,
              borderBottom: `1px solid ${WINE_DARK}66`,
            }}
          >
            <ChromeBtn onClick={onPrev} disabled={!prevEra} title="Previous disc">
              ◂ Back
            </ChromeBtn>
            <ChromeBtn onClick={onNext} disabled={!nextEra} title="Next disc">
              Forward ▸
            </ChromeBtn>
            <ChromeBtn onClick={() => setActive("preface")} title="Home chapter">
              ⌂ Home
            </ChromeBtn>
            <ChromeBtn onClick={onCustomize} title="Customize era">
              ⚙ Customize
            </ChromeBtn>
            <div style={{ flex: 1 }} />
            <ChromeBtn onClick={onClose} title="Use this era" primary>
              ▶ Use Era {era.id}
            </ChromeBtn>
          </div>

          {/* ── Two-pane body ──────────────────────────────────── */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "210px 1fr",
              minHeight: 360,
              backgroundColor: PAPER,
            }}
          >
            {/* Chapter tree */}
            <aside
              style={{
                backgroundColor: PAPER_LIGHT,
                borderRight: `1px solid ${WINE_DARK}55`,
                padding: "10px 8px",
              }}
            >
              <div
                style={{
                  fontFamily: FONT_UI,
                  fontSize: 9,
                  letterSpacing: 2,
                  color: WINE,
                  textTransform: "uppercase",
                  marginBottom: 6,
                  borderBottom: `1px solid ${WINE_DARK}44`,
                  paddingBottom: 4,
                }}
              >
                ▾ Contents
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {chapters.map((c) => {
                  const on = c.id === active;
                  return (
                    <li key={c.id}>
                      <button
                        type="button"
                        onClick={() => setActive(c.id)}
                        style={{
                          display: "flex",
                          width: "100%",
                          gap: 6,
                          padding: "4px 6px",
                          fontFamily: FONT_BODY,
                          fontSize: 12,
                          textAlign: "left",
                          color: on ? PAPER : INK,
                          backgroundColor: on ? WINE : "transparent",
                          border: "none",
                          cursor: "pointer",
                          lineHeight: 1.3,
                        }}
                      >
                        <span
                          style={{
                            fontFamily: FONT_UI,
                            fontSize: 9,
                            color: on ? GOLD : MUTED,
                            minWidth: 16,
                          }}
                        >
                          {c.num}.
                        </span>
                        <span>{c.title}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>

              <div
                style={{
                  marginTop: 14,
                  fontFamily: FONT_UI,
                  fontSize: 9,
                  letterSpacing: 2,
                  color: WINE,
                  textTransform: "uppercase",
                  borderBottom: `1px solid ${WINE_DARK}44`,
                  paddingBottom: 4,
                  marginBottom: 6,
                }}
              >
                ▾ Era Index
              </div>
              <div
                style={{
                  fontFamily: FONT_BODY,
                  fontSize: 11,
                  color: INK_DIM,
                  lineHeight: 1.55,
                }}
              >
                <div>
                  <strong style={{ color: INK }}>Era:</strong> {era.era}
                </div>
                <div>
                  <strong style={{ color: INK }}>Style:</strong> {era.style}
                </div>
                <div>
                  <strong style={{ color: INK }}>Year:</strong> {era.id}
                </div>
              </div>
            </aside>

            {/* Article */}
            <article
              style={{
                padding: "16px 22px 18px",
                fontFamily: FONT_BODY,
                color: INK,
                lineHeight: 1.55,
                fontSize: 13,
              }}
            >
              <div
                style={{
                  fontFamily: FONT_UI,
                  fontSize: 9,
                  letterSpacing: 3,
                  color: GOLD,
                  textTransform: "uppercase",
                }}
              >
                Chapter {chapters[activeIdx]?.num} · Era {era.id}
              </div>
              <h1
                style={{
                  fontFamily: FONT_BODY,
                  fontSize: 26,
                  lineHeight: 1.1,
                  margin: "2px 0 4px",
                  color: WINE_DARK,
                  fontWeight: 700,
                  letterSpacing: 0.3,
                }}
              >
                {era.name.split(":")[1]?.trim() || era.name}
              </h1>
              <div
                style={{
                  fontFamily: FONT_UI,
                  fontSize: 10,
                  letterSpacing: 1,
                  color: MUTED,
                  textTransform: "uppercase",
                  marginBottom: 12,
                  paddingBottom: 6,
                  borderBottom: `1px solid ${WINE_DARK}33`,
                }}
              >
                {chapters[activeIdx]?.title}
              </div>

              {active === "preface" && (
                <>
                  <p style={{ margin: "0 0 10px" }}>
                    <FirstLetter>{era.id.charAt(0)}</FirstLetter>
                    {era.description}
                  </p>
                  <PullQuote>{era.lesson}</PullQuote>
                  <Beat>SEE ALSO</Beat>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {chapters
                      .filter((c) => c.id !== "preface")
                      .map((c) => (
                        <SeeAlsoBtn key={c.id} onClick={() => setActive(c.id)}>
                          {c.num}. {c.title}
                        </SeeAlsoBtn>
                      ))}
                  </div>
                </>
              )}

              {active === "signal" && (
                <>
                  <p style={{ margin: "0 0 10px" }}>
                    Each disc opens on a calibrated color plate. The five
                    swatches below are the master palette pressed into this
                    era's surfaces.
                  </p>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: `repeat(${palette.length}, 1fr)`,
                      height: 56,
                      border: `1px solid ${WINE_DARK}55`,
                      marginBottom: 6,
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
                        <div style={{ color: WINE, textTransform: "uppercase" }}>{k}</div>
                        <div>{v.toUpperCase()}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {active === "type" && (
                <>
                  <p style={{ margin: "0 0 10px" }}>
                    Three faces carry the era. Display sets the headline,
                    body carries narrative, accent labels the controls.
                  </p>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 8,
                    }}
                  >
                    <Specimen role="DISPLAY" font={era.fonts.primary} sample="Aa Bb 0123" size={28} />
                    <Specimen role="BODY" font={era.fonts.secondary} sample="The quick brown fox." size={14} />
                    <Specimen role="ACCENT" font={era.fonts.accent} sample="BUTTONS · LABELS" size={12} />
                    <Specimen role="HEADING" font={era.fonts.primary} sample="A Practitioner" size={18} italic />
                  </div>
                </>
              )}

              {active === "tokens" && (
                <>
                  <p style={{ margin: "0 0 10px" }}>
                    The variables that turn an era from a style into a
                    system. Radius, shadow, grid, tracking, leading and
                    motion compose every surface on the disc.
                  </p>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      fontFamily: FONT_MONO,
                      fontSize: 12,
                      border: `1px solid ${WINE_DARK}55`,
                    }}
                  >
                    <tbody>
                      {tokenRows.map(([k, v], i) => (
                        <tr
                          key={k}
                          style={{
                            backgroundColor: i % 2 === 0 ? PAPER_LIGHT : PAPER_DEEP,
                          }}
                        >
                          <td
                            style={{
                              padding: "5px 10px",
                              color: WINE,
                              letterSpacing: 1,
                              textTransform: "uppercase",
                              width: 110,
                              borderBottom: `1px solid ${WINE_DARK}33`,
                            }}
                          >
                            {k}
                          </td>
                          <td
                            style={{
                              padding: "5px 10px",
                              color: INK,
                              borderBottom: `1px solid ${WINE_DARK}33`,
                            }}
                          >
                            {v}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}

              {active === "elements" && (
                <>
                  <p style={{ margin: "0 0 10px" }}>
                    Surface vocabulary — the recurring components,
                    affordances and effects you'll see when this era takes
                    over the site.
                  </p>
                  <Beat>COMPONENTS</Beat>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {era.keyElements.map((el) => (
                      <span
                        key={el}
                        style={{
                          padding: "3px 9px",
                          backgroundColor: PAPER_LIGHT,
                          border: `1px solid ${WINE_DARK}55`,
                          color: WINE_DARK,
                          fontFamily: FONT_UI,
                          fontSize: 11,
                        }}
                      >
                        ▸ {el}
                      </span>
                    ))}
                  </div>
                  {era.designTokens.effects.length > 0 && (
                    <>
                      <Beat>EFFECTS</Beat>
                      <div
                        style={{
                          fontFamily: FONT_MONO,
                          fontSize: 12,
                          color: GOLD,
                          letterSpacing: 0.5,
                        }}
                      >
                        {era.designTokens.effects.join(" · ")}
                      </div>
                    </>
                  )}
                </>
              )}

              {active === "heritage" && (
                <>
                  <p style={{ margin: "0 0 10px" }}>
                    <FirstLetter>H</FirstLetter>
                    {era.heritage}
                  </p>
                  <SideNote heading="THE LESSON">{era.lesson}</SideNote>
                </>
              )}
            </article>
          </div>

          {/* ── Status bar ─────────────────────────────────────── */}
          <footer
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "4px 10px",
              backgroundColor: PAPER_DEEP,
              borderTop: `1px solid ${WINE_DARK}55`,
              fontFamily: FONT_UI,
              fontSize: 10,
              color: INK_DIM,
              letterSpacing: 1,
            }}
          >
            <span>
              Chapter {activeIdx + 1} of {chapters.length} · Disc {index + 1} of {total}
            </span>
            <span style={{ color: WINE_DARK }}>
              ●●●●● TRACK 01 · 44.1 kHz
            </span>
            <span style={{ color: GOLD, textTransform: "uppercase" }}>
              © Kiruk Press · 1997
            </span>
          </footer>
        </div>
      </div>
    </div>
  );
};

// ── small helpers ────────────────────────────────────────────────────────

function DiscIcon() {
  return (
    <div
      aria-hidden
      style={{
        width: 26,
        height: 26,
        borderRadius: "50%",
        background:
          "radial-gradient(circle at 35% 35%, #fff 0%, #e6c98a 18%, #b88a3a 45%, #6b4a1a 90%)",
        border: "1px solid #3a2510",
        position: "relative",
        boxShadow: "0 0 0 1px #fff5d4 inset",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: "40% 40%",
          backgroundColor: WINE_DARK,
          borderRadius: "50%",
          border: "1px solid #1a0a05",
        }}
      />
    </div>
  );
}

function WinBtn({ label, onClick }: { label: string; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: 18,
        height: 16,
        fontFamily: FONT_UI,
        fontSize: 10,
        lineHeight: 1,
        color: INK,
        backgroundColor: PAPER_DEEP,
        border: "1px solid #000",
        boxShadow: "inset 1px 1px 0 #fff, inset -1px -1px 0 #6b4a1a",
        cursor: onClick ? "pointer" : "default",
      }}
    >
      {label}
    </button>
  );
}

function ChromeBtn({
  children,
  onClick,
  disabled,
  title,
  primary,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  title?: string;
  primary?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      title={title}
      style={{
        padding: "4px 10px",
        fontFamily: FONT_UI,
        fontSize: 11,
        color: primary ? PAPER : INK,
        backgroundColor: primary ? WINE : PAPER_LIGHT,
        border: `1px solid ${WINE_DARK}`,
        boxShadow: primary
          ? "inset 1px 1px 0 #c8536a, inset -1px -1px 0 #2a0810"
          : "inset 1px 1px 0 #fff, inset -1px -1px 0 #b08a4a",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.4 : 1,
        letterSpacing: 0.3,
      }}
    >
      {children}
    </button>
  );
}

function FirstLetter({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        fontFamily: FONT_BODY,
        float: "left",
        fontSize: 40,
        lineHeight: 0.85,
        padding: "4px 6px 0 0",
        color: WINE_DARK,
        fontWeight: 700,
      }}
    >
      {children}
    </span>
  );
}

function Beat({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily: FONT_UI,
        fontSize: 10,
        letterSpacing: 3,
        color: WINE,
        textTransform: "uppercase",
        margin: "12px 0 6px",
        paddingBottom: 3,
        borderBottom: `1px solid ${WINE_DARK}33`,
      }}
    >
      {children}
    </div>
  );
}

function PullQuote({ children }: { children: React.ReactNode }) {
  return (
    <blockquote
      style={{
        borderLeft: `3px solid ${GOLD}`,
        margin: "10px 0",
        padding: "6px 12px",
        fontFamily: FONT_BODY,
        fontStyle: "italic",
        fontSize: 16,
        color: WINE_DARK,
        lineHeight: 1.35,
        backgroundColor: PAPER_LIGHT,
      }}
    >
      &ldquo;{children}&rdquo;
    </blockquote>
  );
}

function SideNote({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <aside
      style={{
        float: "right",
        width: 170,
        margin: "4px 0 8px 12px",
        padding: 10,
        backgroundColor: PAPER_LIGHT,
        border: `1px solid ${WINE_DARK}55`,
        borderLeft: `3px solid ${GOLD}`,
      }}
    >
      <div
        style={{
          fontFamily: FONT_UI,
          fontSize: 9,
          letterSpacing: 2,
          color: WINE,
          textTransform: "uppercase",
          marginBottom: 4,
        }}
      >
        {heading}
      </div>
      <div style={{ fontFamily: FONT_BODY, fontSize: 11, lineHeight: 1.45, color: INK_DIM }}>
        {children}
      </div>
    </aside>
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
        backgroundColor: PAPER_LIGHT,
        border: `1px solid ${WINE_DARK}55`,
        padding: 10,
      }}
    >
      <div
        style={{
          fontFamily: FONT_UI,
          fontSize: 9,
          letterSpacing: 2,
          color: WINE,
          textTransform: "uppercase",
          marginBottom: 2,
        }}
      >
        {role}
      </div>
      <div style={{ fontFamily: FONT_MONO, fontSize: 9, color: MUTED, marginBottom: 6 }}>
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

function SeeAlsoBtn({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "3px 8px",
        fontFamily: FONT_UI,
        fontSize: 11,
        color: WINE,
        backgroundColor: PAPER_LIGHT,
        border: `1px solid ${WINE_DARK}55`,
        cursor: "pointer",
        textDecoration: "underline",
      }}
    >
      → {children}
    </button>
  );
}

export default FramesetArchetype;
