"use client";

/**
 * Web2CandyArchetype — 2003 era preview inside <EraTimeMachine>.
 *
 * Matches the landing: MyKiruk · A Social Profile. Navy nav bar with
 * BETA shine, profile photo gel block + Online Now LED, contact box,
 * mood selector, gel "Add as Friend" CTA, era data rendered as profile
 * sections (About / Interests / Details), small Top 4 friends grid +
 * comments preview.
 */

import React, { useEffect, useState } from "react";
import type { EraSurfaceProps } from "../shared/EraSurface";

// Palette — mirror Web2CandyHomePage
const SKY = "#6699cc";
const NAV_DEEP = "#003366";
const NAV_DEEP2 = "#002244";
const PAPER = "#ffffff";
const PAPER_DIM = "#f4f8ff";
const PANEL_HEAD = "#003366";
const INK = "#1a1a1a";
const INK_DIM = "#555566";
const LINK = "#0066cc";
const LINK_HOT = "#cc0066";
const ORANGE = "#ff6600";
const ORANGE_DEEP = "#cc4400";
const GREEN_ON = "#3ec43e";
const BORDER = "#003366";

const FONT_UI = "'Verdana', 'Geneva', 'Arial', sans-serif";
const FONT_DISPLAY = "'Arial Black', 'Verdana', sans-serif";
const FONT_MONO = "'Courier New', 'Lucida Console', monospace";

export const Web2CandyArchetype: React.FC<EraSurfaceProps> = ({
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
  const [mood, setMood] = useState("🚀 shipping");
  const [friendStatus, setFriendStatus] = useState<"add" | "pending" | "friends">("add");
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

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{
        backgroundColor: SKY,
        color: INK,
        fontFamily: FONT_UI,
      }}
    >
      <style jsx global>{`
        @keyframes kiruk-2003pv-shine {
          0%   { transform: translateX(-120%) skewX(-20deg); }
          100% { transform: translateX(220%) skewX(-20deg); }
        }
        @keyframes kiruk-2003pv-online {
          0%, 60% { opacity: 1; }
          70%, 100% { opacity: 0.45; }
        }
      `}</style>

      <div
        style={{
          position: "absolute",
          inset: 0,
          overflowY: "auto",
        }}
      >
        {/* TOP NAV */}
        <header
          style={{
            background: `linear-gradient(180deg, ${NAV_DEEP} 0%, ${NAV_DEEP2} 100%)`,
            color: "#fff",
            padding: "5px 14px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            fontSize: 11,
            boxShadow: "0 2px 6px rgba(0,0,0,0.35)",
            borderBottom: "1px solid #000",
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                fontFamily: FONT_DISPLAY,
                fontSize: 15,
                letterSpacing: -0.3,
                color: "#fff",
                textShadow: "0 1px 0 #000",
              }}
            >
              My<span style={{ color: ORANGE }}>Kiruk</span>.com
            </span>
            <span
              style={{
                padding: "1px 5px",
                fontSize: 8,
                fontWeight: 700,
                letterSpacing: 1,
                color: "#fff",
                background: `linear-gradient(180deg, ${ORANGE} 0%, ${ORANGE_DEEP} 100%)`,
                border: "1px solid #993300",
                borderRadius: 3,
                boxShadow: "inset 0 1px 0 #ffd2a8",
                textShadow: "0 1px 0 rgba(0,0,0,0.3)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              BETA
              <span
                aria-hidden
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: 22,
                  height: "100%",
                  background:
                    "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)",
                  animation: "kiruk-2003pv-shine 3.2s linear infinite",
                }}
              />
            </span>
          </div>
          <nav style={{ display: "flex", gap: 10 }}>
            {["Home", "Browse", "Mail", "Blog", "Music"].map((n) => (
              <a key={n} style={{ color: "#fff", fontSize: 10, textDecoration: "none" }} href="#" onClick={(e) => e.preventDefault()}>
                {n}
              </a>
            ))}
          </nav>
          <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
            <Gel onClick={onCustomize}>⚙ Customize</Gel>
            <Gel primary onClick={onClose}>▶ Use Era {era.id}</Gel>
          </div>
        </header>

        <div
          style={{
            maxWidth: 920,
            margin: "10px auto 0",
            padding: "0 12px 16px",
          }}
        >
          {/* Name banner */}
          <div
            style={{
              background: PAPER,
              border: `2px solid ${BORDER}`,
              padding: "6px 10px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 4,
              boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
            }}
          >
            <div
              style={{
                fontFamily: FONT_DISPLAY,
                fontSize: 18,
                color: INK,
                letterSpacing: -0.3,
              }}
            >
              {era.name.split(":")[1]?.trim() || era.name}
            </div>
            <div style={{ fontFamily: FONT_MONO, fontSize: 10, color: INK_DIM }}>
              www.mykiruk.com/era-{era.id}
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "200px 1fr",
              gap: 10,
              marginTop: 8,
            }}
          >
            {/* Left col */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {/* Photo gel — uses era primary color */}
              <div
                style={{
                  background: PAPER,
                  border: `2px solid ${BORDER}`,
                  padding: 3,
                  boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    aspectRatio: "1 / 1",
                    background: `radial-gradient(circle at 30% 30%, ${era.colors.accent} 0%, ${era.colors.primary} 60%, #000 130%)`,
                    border: "1px solid #000",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: FONT_DISPLAY,
                    fontSize: 48,
                    color: "#fff",
                    textShadow: "2px 2px 0 rgba(0,0,0,0.4)",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <span style={{ position: "relative", zIndex: 2 }}>{era.id}</span>
                  <div
                    aria-hidden
                    style={{
                      position: "absolute",
                      inset: 0,
                      background:
                        "radial-gradient(ellipse 60% 30% at 30% 25%, rgba(255,255,255,0.45) 0%, transparent 70%)",
                    }}
                  />
                </div>
                <div
                  style={{
                    marginTop: 3,
                    fontSize: 10,
                    textAlign: "center",
                    color: INK_DIM,
                    fontStyle: "italic",
                  }}
                >
                  {era.style}
                </div>
              </div>

              {/* Online box */}
              <div
                style={{
                  background: PAPER,
                  border: `2px solid ${BORDER}`,
                  fontSize: 11,
                  boxShadow: "0 2px 4px rgba(0,0,0,0.18)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    padding: "3px 8px",
                    background: "#e6f3ff",
                    borderBottom: `1px solid ${BORDER}`,
                    fontWeight: 700,
                  }}
                >
                  <span
                    aria-hidden
                    style={{
                      width: 9,
                      height: 9,
                      borderRadius: "50%",
                      background: GREEN_ON,
                      boxShadow: `0 0 6px ${GREEN_ON}`,
                      animation: "kiruk-2003pv-online 1.6s ease-in-out infinite",
                    }}
                  />
                  <span style={{ color: "#1f6b1f" }}>Online Now!</span>
                </div>
                <div style={{ padding: "5px 8px", lineHeight: 1.5 }}>
                  <strong>Era:</strong> {era.era}
                  <br />
                  <strong>Disc:</strong> {index + 1} of {total}
                  <br />
                  <strong>Heritage:</strong>{" "}
                  <span style={{ color: LINK_HOT, fontStyle: "italic" }}>
                    {era.heritage.split(" ").slice(0, 4).join(" ")}…
                  </span>
                </div>
              </div>

              {/* Era-nav contact box */}
              <Panel heading="Contacting Era">
                <table style={{ width: "100%", fontSize: 11 }}>
                  <tbody>
                    <tr>
                      <td style={{ width: 16, padding: "2px 4px", color: ORANGE, textAlign: "center" }}>◂</td>
                      <td>
                        <button
                          type="button"
                          onClick={prevEra ? onPrev : undefined}
                          disabled={!prevEra}
                          style={linkBtn(!prevEra)}
                        >
                          Previous Era
                        </button>
                      </td>
                    </tr>
                    <tr>
                      <td style={{ width: 16, padding: "2px 4px", color: ORANGE, textAlign: "center" }}>▸</td>
                      <td>
                        <button
                          type="button"
                          onClick={nextEra ? onNext : undefined}
                          disabled={!nextEra}
                          style={linkBtn(!nextEra)}
                        >
                          Next Era
                        </button>
                      </td>
                    </tr>
                    <tr>
                      <td style={{ width: 16, padding: "2px 4px", color: ORANGE, textAlign: "center" }}>⚙</td>
                      <td>
                        <button type="button" onClick={onCustomize} style={linkBtn(false)}>
                          Customize Era
                        </button>
                      </td>
                    </tr>
                    <tr>
                      <td style={{ width: 16, padding: "2px 4px", color: ORANGE, textAlign: "center" }}>★</td>
                      <td>
                        <button type="button" onClick={onClose} style={linkBtn(false)}>
                          Use This Era
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </Panel>
            </div>

            {/* Right col */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {/* Name + headline banner */}
              <div
                style={{
                  background: `linear-gradient(180deg, ${NAV_DEEP} 0%, ${NAV_DEEP2} 100%)`,
                  color: "#fff",
                  padding: "8px 12px",
                  border: `2px solid ${BORDER}`,
                  boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
                }}
              >
                <div
                  style={{
                    fontFamily: FONT_DISPLAY,
                    fontSize: 22,
                    letterSpacing: -0.4,
                    textShadow: "1px 1px 0 rgba(0,0,0,0.3)",
                  }}
                >
                  Era {era.id}{" "}
                  <span style={{ color: ORANGE }}>·</span>{" "}
                  <span style={{ fontSize: 14, color: "#cfe3ff" }}>
                    &ldquo;{era.lesson.length > 40 ? era.lesson.slice(0, 40) + "…" : era.lesson}&rdquo;
                  </span>
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: "#cfe3ff",
                    marginTop: 4,
                    display: "flex",
                    gap: 10,
                    flexWrap: "wrap",
                  }}
                >
                  <span><strong>Style:</strong> {era.style}</span>
                  <span><strong>Era:</strong> {era.era}</span>
                </div>
              </div>

              {/* Mood + add friend */}
              <div
                style={{
                  background: PAPER,
                  border: `2px solid ${BORDER}`,
                  padding: "6px 10px",
                  display: "flex",
                  gap: 8,
                  alignItems: "center",
                  flexWrap: "wrap",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.18)",
                }}
              >
                <span
                  style={{
                    fontSize: 9,
                    letterSpacing: 1,
                    color: INK_DIM,
                    textTransform: "uppercase",
                    fontWeight: 700,
                  }}
                >
                  Mood:
                </span>
                <select
                  value={mood}
                  onChange={(e) => setMood(e.target.value)}
                  style={{
                    fontFamily: FONT_UI,
                    fontSize: 11,
                    padding: "2px 5px",
                    border: `1px solid ${BORDER}`,
                  }}
                >
                  <option>🚀 shipping</option>
                  <option>🎯 focused</option>
                  <option>🔬 curious</option>
                  <option>☕ caffeinated</option>
                </select>
                <button
                  type="button"
                  onClick={() =>
                    setFriendStatus((s) => (s === "add" ? "pending" : s === "pending" ? "friends" : "add"))
                  }
                  style={{
                    marginLeft: "auto",
                    padding: "4px 12px",
                    fontFamily: FONT_DISPLAY,
                    fontSize: 10,
                    letterSpacing: 1,
                    color: "#fff",
                    background:
                      friendStatus === "friends"
                        ? `linear-gradient(180deg, ${GREEN_ON} 0%, #1f6b1f 100%)`
                        : `linear-gradient(180deg, ${ORANGE} 0%, ${ORANGE_DEEP} 100%)`,
                    border: `1px solid ${friendStatus === "friends" ? "#1f6b1f" : "#993300"}`,
                    borderRadius: 3,
                    cursor: "pointer",
                    boxShadow:
                      "0 2px 4px rgba(0,0,0,0.3), inset 0 1px 0 #ffd2a8, inset 0 -1px 0 #993300",
                    textShadow: "0 1px 0 rgba(0,0,0,0.3)",
                    textTransform: "uppercase",
                  }}
                >
                  {friendStatus === "add"
                    ? "★ Add Era as Friend"
                    : friendStatus === "pending"
                      ? "⏳ Pending"
                      : "✓ Friends"}
                </button>
              </div>

              {/* About */}
              <Panel heading="About this Era">
                <p style={{ margin: "0 0 8px", fontSize: 12, color: INK, lineHeight: 1.55 }}>
                  {era.description}
                </p>
                <blockquote
                  style={{
                    margin: 0,
                    padding: "6px 10px",
                    background: PAPER_DIM,
                    borderLeft: `3px solid ${ORANGE}`,
                    fontSize: 12,
                    color: LINK,
                    fontStyle: "italic",
                  }}
                >
                  &ldquo;{era.lesson}&rdquo;
                </blockquote>
              </Panel>

              {/* Color plate as "Interests · General" */}
              <Panel heading="Era Interests">
                <Row label="General">
                  {era.heritage}
                </Row>
                <Row label="Music">
                  {era.fonts.primary.split(",")[0].replaceAll('"', "").trim()},{" "}
                  {era.fonts.secondary.split(",")[0].replaceAll('"', "").trim()},{" "}
                  {era.fonts.accent.split(",")[0].replaceAll('"', "").trim()}
                </Row>
                <Row label="Tokens">
                  {tokenRows.map((r) => `${r[0]} ${r[1]}`).join(" · ")}
                </Row>
                <Row label="Effects">
                  {era.designTokens.effects.length
                    ? era.designTokens.effects.join(", ")
                    : "—"}
                </Row>
              </Panel>

              {/* Palette plate */}
              <Panel heading="Era Color Plate">
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${palette.length}, 1fr)`,
                    height: 38,
                    border: `1px solid ${BORDER}`,
                  }}
                >
                  {palette.map(([k, v]) => (
                    <div
                      key={k}
                      title={`${k} ${v}`}
                      style={{ backgroundColor: v }}
                    />
                  ))}
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${palette.length}, 1fr)`,
                    fontFamily: FONT_MONO,
                    fontSize: 9,
                    color: INK_DIM,
                    marginTop: 3,
                  }}
                >
                  {palette.map(([k, v]) => (
                    <div key={k} style={{ textAlign: "center" }}>
                      <div style={{ color: NAV_DEEP, textTransform: "uppercase" }}>{k}</div>
                      <div>{v.toUpperCase()}</div>
                    </div>
                  ))}
                </div>
              </Panel>

              {/* Key elements as friends grid */}
              <Panel
                heading="Top Friends · Era Parts"
                headingRight={
                  <span style={{ fontSize: 9, color: "#cfe3ff" }}>
                    {era.keyElements.length} friends
                  </span>
                }
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: 5,
                  }}
                >
                  {era.keyElements.slice(0, 8).map((el, i) => (
                    <FriendTile
                      key={el}
                      label={el}
                      index={i}
                      hue={[era.colors.primary, era.colors.secondary, era.colors.accent][i % 3]}
                    />
                  ))}
                </div>
              </Panel>
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              marginTop: 12,
              padding: "6px 10px",
              background: NAV_DEEP,
              color: "#fff",
              fontSize: 9,
              textAlign: "center",
              border: `2px solid ${BORDER}`,
              letterSpacing: 0.5,
            }}
          >
            ©2003 MyKiruk.com · Era {era.id} · Best viewed in IE 6 · 1024×768 · valid XHTML + CSS
          </div>
        </div>
      </div>
    </div>
  );
};

function linkBtn(disabled: boolean): React.CSSProperties {
  return {
    background: "transparent",
    border: "none",
    color: disabled ? INK_DIM : LINK,
    fontFamily: FONT_UI,
    fontSize: 11,
    padding: "1px 0",
    textDecoration: disabled ? "none" : "underline",
    cursor: disabled ? "not-allowed" : "pointer",
    textAlign: "left",
  };
}

function Gel({
  children,
  primary,
  onClick,
}: {
  children: React.ReactNode;
  primary?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "3px 10px",
        fontFamily: FONT_UI,
        fontSize: 10,
        fontWeight: 700,
        color: primary ? "#fff" : INK,
        background: primary
          ? `linear-gradient(180deg, ${ORANGE} 0%, ${ORANGE_DEEP} 100%)`
          : `linear-gradient(180deg, #ffffff 0%, #d8e6f5 100%)`,
        border: `1px solid ${primary ? "#993300" : BORDER}`,
        borderRadius: 3,
        cursor: "pointer",
        boxShadow: primary
          ? "inset 0 1px 0 #ffd2a8, inset 0 -1px 0 #993300, 0 1px 2px rgba(0,0,0,0.3)"
          : "inset 0 1px 0 #fff, 0 1px 2px rgba(0,0,0,0.18)",
        textShadow: primary ? "0 1px 0 rgba(0,0,0,0.3)" : "none",
      }}
    >
      {children}
    </button>
  );
}

function Panel({
  heading,
  headingRight,
  children,
}: {
  heading: string;
  headingRight?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section
      style={{
        background: PAPER,
        border: `2px solid ${BORDER}`,
        boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
      }}
    >
      <div
        style={{
          padding: "3px 10px",
          background: PANEL_HEAD,
          color: "#fff",
          fontFamily: FONT_DISPLAY,
          fontSize: 11,
          letterSpacing: 0.5,
          textTransform: "uppercase",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: `1px solid ${BORDER}`,
        }}
      >
        <span>{heading}</span>
        {headingRight}
      </div>
      <div style={{ padding: 8 }}>{children}</div>
    </section>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "78px 1fr",
        gap: 6,
        padding: "2px 0",
        borderBottom: `1px dotted ${BORDER}44`,
      }}
    >
      <span
        style={{
          fontFamily: FONT_DISPLAY,
          fontSize: 10,
          color: NAV_DEEP,
          fontWeight: 700,
        }}
      >
        {label}:
      </span>
      <span style={{ fontSize: 11, color: INK }}>{children}</span>
    </div>
  );
}

function FriendTile({
  label,
  index,
  hue,
}: {
  label: string;
  index: number;
  hue: string;
}) {
  return (
    <div
      style={{
        background: PAPER,
        border: `1px solid ${BORDER}`,
        padding: 3,
        textAlign: "center",
        boxShadow: "0 1px 2px rgba(0,0,0,0.18)",
      }}
    >
      <div
        style={{
          width: "100%",
          aspectRatio: "1 / 1",
          background:
            `radial-gradient(circle at 30% 30%, ${hue} 0%, ${hue}aa 60%, #000 130%)`,
          border: "1px solid #000",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: FONT_DISPLAY,
          fontSize: 18,
          color: "#fff",
          textShadow: "1px 1px 0 rgba(0,0,0,0.5)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <span style={{ position: "relative", zIndex: 2 }}>
          {label.charAt(0).toUpperCase()}
        </span>
        <span
          aria-hidden
          style={{
            position: "absolute",
            top: 1,
            left: 2,
            fontFamily: FONT_DISPLAY,
            fontSize: 8,
            color: "#fff",
            background: "rgba(0,0,0,0.4)",
            padding: "0 3px",
            borderRadius: 2,
            letterSpacing: 1,
          }}
        >
          #{index + 1}
        </span>
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 60% 30% at 30% 25%, rgba(255,255,255,0.45) 0%, transparent 70%)",
          }}
        />
      </div>
      <div
        style={{
          fontFamily: FONT_UI,
          fontSize: 9,
          color: LINK,
          fontWeight: 700,
          marginTop: 2,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {label}
      </div>
    </div>
  );
}

export default Web2CandyArchetype;
