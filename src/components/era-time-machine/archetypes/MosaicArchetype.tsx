"use client";

/**
 * MosaicArchetype — 1993 era preview inside <EraTimeMachine>.
 *
 * Full Mosaic browser chrome: title bar, menu bar, toolbar (Back/Fwd/Home/
 * Reload/Open…), location bar, marquee strip, beveled hero banner, tables
 * for palette + tokens + typography + elements + effects. Transport bar
 * doubles as fake browser nav (Prev → Back, Next → Fwd, Close → Quit).
 */

import React, { useMemo, useState } from "react";
import type { EraSurfaceProps } from "../shared/EraSurface";
import { hideArchetypeTransport } from "../shared/eraChrome";

const GRAY = "#c0c0c0";
const GRAY_LIGHT = "#dcdcdc";
const HILITE = "#ffffff";
const SHADOW = "#808080";
const BLACK = "#000000";
const HOT = "#ff0000";
const NAVY = "#000080";

const FONT_BODY = "Arial, Helvetica, sans-serif";
const FONT_HEAD = '"Arial Black", Impact, Arial, sans-serif';
const FONT_MONO = '"Courier New", Courier, monospace';

const TICKER = [
  "★ NEW ★ ERA-MACHINE is now ONLINE",
  "Browse 22 design eras · Mosaic 2.0 best",
  "Click Prev / Next to time-travel — your modem will hold up",
];

export const MosaicArchetype: React.FC<EraSurfaceProps> = ({
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
  const [status, setStatus] = useState("Document: Done.");
  const stamp = useMemo(
    () =>
      new Date().toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "2-digit",
        year: "numeric",
      }),
    [],
  );
  const url = `http://kiruk-research.cern.ch/eras/${era.id}.html`;

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{
        backgroundColor: GRAY,
        color: BLACK,
        fontFamily: FONT_BODY,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          overflow: "auto",
          padding: "16px",
        }}
      >
        <div
          style={{
            maxWidth: 960,
            margin: "0 auto",
            backgroundColor: GRAY,
            borderTop: `2px solid ${HILITE}`,
            borderLeft: `2px solid ${HILITE}`,
            borderRight: `2px solid ${SHADOW}`,
            borderBottom: `2px solid ${SHADOW}`,
            outline: `1px solid ${BLACK}`,
            boxShadow: `3px 3px 0 ${BLACK}`,
          }}
        >
          {/* Title bar */}
          <div
            style={{
              backgroundColor: NAVY,
              color: HILITE,
              padding: "3px 8px",
              fontFamily: FONT_MONO,
              fontSize: 12,
              fontWeight: 700,
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>
              NCSA Mosaic — Era {era.id}: {era.name.split(":")[1]?.trim() || era.name}
            </span>
            <span style={{ display: "flex", gap: 2 }}>
              <ChromeBtn>_</ChromeBtn>
              <ChromeBtn>□</ChromeBtn>
              <ChromeBtn>✕</ChromeBtn>
            </span>
          </div>

          {/* Menu */}
          <div
            style={{
              padding: "2px 8px",
              fontSize: 12,
              backgroundColor: GRAY,
              borderBottom: `1px solid ${SHADOW}`,
              display: "flex",
              gap: 14,
            }}
          >
            {["File", "Edit", "Options", "Navigate", "Help"].map((m) => (
              <span key={m} style={{ cursor: "default" }}>
                <u>{m[0]}</u>
                {m.slice(1)}
              </span>
            ))}
            <span style={{ marginLeft: "auto", color: SHADOW }}>{stamp}</span>
          </div>

          {/* Toolbar */}
          <div
            style={{
              padding: "6px 8px",
              backgroundColor: GRAY,
              borderBottom: `1px solid ${SHADOW}`,
              display: "flex",
              gap: 4,
              flexWrap: "wrap",
            }}
          >
            {!hideTransport && (
              <>
                <ToolbarBtn onClick={onPrev} disabled={!prevEra} title="Previous era">
                  ◂ Back
                </ToolbarBtn>
                <ToolbarBtn onClick={onNext} disabled={!nextEra} title="Next era">
                  Fwd ▸
                </ToolbarBtn>
                <ToolbarBtn onClick={onClose} title="Close (Quit)">
                  ✕ Quit
                </ToolbarBtn>
              </>
            )}
            <div
              style={{
                marginLeft: "auto",
                fontFamily: FONT_MONO,
                fontSize: 12,
                color: BLACK,
                display: "flex",
                alignItems: "center",
              }}
            >
              {index + 1}/{total}
            </div>
          </div>

          {/* Location */}
          <div
            style={{
              padding: "4px 8px",
              backgroundColor: GRAY,
              borderBottom: `2px solid ${SHADOW}`,
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 12,
              fontFamily: FONT_MONO,
            }}
          >
            <span style={{ color: BLACK }}>Document URL:</span>
            <input
              readOnly
              value={url}
              style={{
                flex: 1,
                backgroundColor: HILITE,
                border: `2px solid ${SHADOW}`,
                borderTopColor: SHADOW,
                borderLeftColor: SHADOW,
                borderRightColor: HILITE,
                borderBottomColor: HILITE,
                padding: "2px 4px",
                fontFamily: FONT_MONO,
                fontSize: 12,
              }}
            />
          </div>

          {/* Content */}
          <div
            style={{
              backgroundColor: HILITE,
              padding: "10px 16px 28px",
              color: BLACK,
            }}
          >
            {/* Marquee */}
            <div
              style={{
                backgroundColor: HOT,
                color: HILITE,
                padding: "4px 0",
                fontWeight: 700,
                fontFamily: FONT_HEAD,
                fontSize: 13,
                overflow: "hidden",
                border: `2px solid ${BLACK}`,
                marginBottom: 12,
              }}
            >
              <Marquee items={TICKER} />
            </div>

            {/* Hero banner */}
            <div
              style={{
                textAlign: "center",
                padding: "14px 0",
                background:
                  "linear-gradient(180deg, #4040c0 0%, #0000aa 100%)",
                color: HILITE,
                border: `2px solid ${BLACK}`,
                boxShadow: `2px 2px 0 ${BLACK}`,
                marginBottom: 14,
              }}
            >
              <div
                style={{
                  fontFamily: FONT_HEAD,
                  fontSize: "clamp(48px, 9vw, 88px)",
                  lineHeight: 1,
                  letterSpacing: 2,
                  textShadow: "3px 3px 0 #000",
                }}
              >
                {era.id}
              </div>
              <div
                style={{
                  fontFamily: FONT_BODY,
                  fontSize: 16,
                  marginTop: 4,
                  fontWeight: 700,
                }}
              >
                {era.name.split(":")[1]?.trim() || era.name}
              </div>
              <div
                style={{
                  fontFamily: FONT_BODY,
                  fontSize: 12,
                  marginTop: 2,
                  fontStyle: "italic",
                }}
              >
                {era.era}
              </div>
              <span
                style={{
                  display: "inline-block",
                  marginTop: 8,
                  backgroundColor: "#ffff00",
                  color: HOT,
                  padding: "1px 8px",
                  fontFamily: FONT_MONO,
                  fontSize: 12,
                  fontWeight: 700,
                  border: `2px solid ${BLACK}`,
                  letterSpacing: 1,
                }}
              >
                ★ now showing ★
              </span>
            </div>

            <p style={{ fontSize: 15, lineHeight: 1.55, margin: "0 0 10px" }}>
              {era.description}
            </p>

            <p
              style={{
                borderLeft: `3px solid ${NAVY}`,
                paddingLeft: 10,
                fontStyle: "italic",
                color: NAVY,
                margin: "0 0 10px",
              }}
            >
              “{era.lesson}”
            </p>

            <p style={{ fontSize: 13, color: BLACK, margin: "0 0 14px" }}>
              <b>Heritage. </b>
              {era.heritage}
            </p>

            <BeveledRule />

            {/* Palette */}
            <H>1. Palette</H>
            <table style={tbl}>
              <tbody>
                {(
                  [
                    ["primary", era.colors.primary],
                    ["secondary", era.colors.secondary],
                    ["accent", era.colors.accent],
                    ["background", era.colors.background],
                    ["text", era.colors.text],
                  ] as const
                ).map(([k, v]) => (
                  <tr key={k}>
                    <td style={{ ...td, fontWeight: 700, backgroundColor: GRAY_LIGHT, width: 120 }}>
                      {k}
                    </td>
                    <td style={td}>
                      <span
                        aria-hidden
                        style={{
                          display: "inline-block",
                          width: 16,
                          height: 16,
                          backgroundColor: v,
                          border: `1px solid ${BLACK}`,
                          verticalAlign: "middle",
                          marginRight: 6,
                          boxShadow: `1px 1px 0 ${BLACK}`,
                        }}
                      />
                      <code style={{ fontFamily: FONT_MONO }}>{v.toUpperCase()}</code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Typography */}
            <H>2. Typography</H>
            <table style={{ ...tbl, width: "100%" }}>
              <thead>
                <tr>
                  <th style={th}>role</th>
                  <th style={th}>family</th>
                  <th style={th}>sample</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={td}>display</td>
                  <td style={{ ...td, fontFamily: FONT_MONO, fontSize: 12 }}>
                    {fontName(era.fonts.primary)}
                  </td>
                  <td style={{ ...td, fontFamily: era.fonts.primary, fontSize: 22 }}>
                    Aa Bb 0123
                  </td>
                </tr>
                <tr>
                  <td style={td}>body</td>
                  <td style={{ ...td, fontFamily: FONT_MONO, fontSize: 12 }}>
                    {fontName(era.fonts.secondary)}
                  </td>
                  <td style={{ ...td, fontFamily: era.fonts.secondary, fontSize: 14 }}>
                    The quick brown fox.
                  </td>
                </tr>
                <tr>
                  <td style={td}>ui</td>
                  <td style={{ ...td, fontFamily: FONT_MONO, fontSize: 12 }}>
                    {fontName(era.fonts.accent)}
                  </td>
                  <td style={{ ...td, fontFamily: era.fonts.accent, fontSize: 13 }}>
                    BUTTONS · LABELS
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Tokens */}
            <H>3. Design tokens</H>
            <table style={tbl}>
              <tbody>
                <TokRow k="radius" v={`${era.designTokens.borderRadius}px`} />
                <TokRow
                  k="shadow"
                  v={`${era.designTokens.shadowStyle} @ ${era.designTokens.shadowIntensity}`}
                />
                <TokRow
                  k="grid"
                  v={era.designTokens.gridSize ? `${era.designTokens.gridSize}px` : "—"}
                />
                <TokRow k="tracking" v={String(era.designTokens.letterSpacing)} />
                <TokRow k="leading" v={String(era.designTokens.lineHeight)} />
                <TokRow k="motion" v={era.designTokens.animationStyle} />
              </tbody>
            </table>

            {/* Key elements */}
            <H>4. Key elements</H>
            <ul style={ul}>
              {era.keyElements.map((el) => (
                <li key={el}>{el}</li>
              ))}
            </ul>

            {/* Effects */}
            {era.designTokens.effects.length > 0 && (
              <>
                <H>5. Effects</H>
                <p style={{ fontFamily: FONT_MONO, fontSize: 13, color: BLACK, margin: 0 }}>
                  {era.designTokens.effects.join(" · ")}
                </p>
              </>
            )}

            <BeveledRule />

            {/* CTAs */}
            {!hideTransport && (
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  justifyContent: "center",
                  marginTop: 8,
                }}
              >
                <BevelBtn onClick={onClose} primary>
                  Use Era {era.id} ▸
                </BevelBtn>
              </div>
            )}

            <p
              style={{
                textAlign: "center",
                fontSize: 11,
                color: BLACK,
                marginTop: 14,
                fontFamily: FONT_BODY,
              }}
            >
              © 1993 Kiruk Research · Best viewed in NCSA Mosaic 2.0+
            </p>
          </div>

          {/* Status bar */}
          <div
            style={{
              backgroundColor: GRAY_LIGHT,
              borderTop: `2px solid ${HILITE}`,
              borderLeft: `2px solid ${HILITE}`,
              borderRight: `2px solid ${SHADOW}`,
              borderBottom: `2px solid ${SHADOW}`,
              padding: "3px 8px",
              fontSize: 11,
              fontFamily: FONT_MONO,
              color: BLACK,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
            onMouseEnter={() => setStatus(url)}
            onMouseLeave={() => setStatus("Document: Done.")}
          >
            <span>{status}</span>
            <span style={{ color: SHADOW }}>
              ERA {era.id} · 28.8k · idle
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const tbl: React.CSSProperties = {
  borderCollapse: "collapse",
  border: `2px solid ${SHADOW}`,
  marginBottom: 12,
  fontSize: 14,
};

const th: React.CSSProperties = {
  border: `1px solid ${SHADOW}`,
  borderBottom: `2px solid ${BLACK}`,
  padding: "4px 6px",
  textAlign: "left",
  backgroundColor: GRAY_LIGHT,
};

const td: React.CSSProperties = {
  border: `1px solid ${SHADOW}`,
  padding: "4px 6px",
  verticalAlign: "top",
};

const ul: React.CSSProperties = {
  paddingLeft: 22,
  margin: "0 0 12px",
};

function TokRow({ k, v }: { k: string; v: string }) {
  return (
    <tr>
      <td style={{ ...td, fontWeight: 700, backgroundColor: GRAY_LIGHT, width: 120 }}>
        {k}
      </td>
      <td style={{ ...td, fontFamily: FONT_MONO }}>{v}</td>
    </tr>
  );
}

function H({ children }: { children: React.ReactNode }) {
  return (
    <h2
      style={{
        fontFamily: FONT_HEAD,
        fontSize: 18,
        color: NAVY,
        margin: "14px 0 6px",
      }}
    >
      {children}
    </h2>
  );
}

function BeveledRule() {
  return (
    <div
      aria-hidden
      style={{
        height: 0,
        borderTop: `1px solid ${SHADOW}`,
        borderBottom: `1px solid ${HILITE}`,
        margin: "16px 0",
      }}
    />
  );
}

function ChromeBtn({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 16,
        height: 14,
        backgroundColor: GRAY,
        color: BLACK,
        borderTop: `1px solid ${HILITE}`,
        borderLeft: `1px solid ${HILITE}`,
        borderRight: `1px solid ${SHADOW}`,
        borderBottom: `1px solid ${SHADOW}`,
        fontFamily: FONT_MONO,
        fontSize: 10,
      }}
    >
      {children}
    </span>
  );
}

function ToolbarBtn({
  children,
  onClick,
  disabled,
  title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  title?: string;
}) {
  const [pressed, setPressed] = useState(false);
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      onMouseDown={() => !disabled && setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      title={title}
      style={{
        padding: "3px 8px",
        backgroundColor: GRAY,
        color: BLACK,
        borderTop: `2px solid ${pressed ? SHADOW : HILITE}`,
        borderLeft: `2px solid ${pressed ? SHADOW : HILITE}`,
        borderRight: `2px solid ${pressed ? HILITE : SHADOW}`,
        borderBottom: `2px solid ${pressed ? HILITE : SHADOW}`,
        outline: `1px solid ${BLACK}`,
        fontFamily: FONT_BODY,
        fontSize: 12,
        fontWeight: 700,
        opacity: disabled ? 0.45 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
        transform: pressed && !disabled ? "translate(1px, 1px)" : "none",
      }}
    >
      {children}
    </button>
  );
}

function BevelBtn({
  children,
  onClick,
  primary,
}: {
  children: React.ReactNode;
  onClick: () => void;
  primary?: boolean;
}) {
  const [pressed, setPressed] = useState(false);
  const bg = primary ? NAVY : GRAY;
  const color = primary ? HILITE : BLACK;
  const hi = primary ? "#3333aa" : HILITE;
  const sh = primary ? "#000044" : SHADOW;
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      style={{
        padding: "5px 16px",
        backgroundColor: bg,
        color,
        borderTop: `2px solid ${pressed ? sh : hi}`,
        borderLeft: `2px solid ${pressed ? sh : hi}`,
        borderRight: `2px solid ${pressed ? hi : sh}`,
        borderBottom: `2px solid ${pressed ? hi : sh}`,
        outline: `1px solid ${BLACK}`,
        fontFamily: FONT_BODY,
        fontSize: 12,
        fontWeight: 700,
        cursor: "pointer",
        transform: pressed ? "translate(1px, 1px)" : "none",
      }}
    >
      {children}
    </button>
  );
}

function Marquee({ items }: { items: readonly string[] }) {
  const joined = items.join("   ✦   ");
  return (
    <div
      style={{
        whiteSpace: "nowrap",
        display: "inline-block",
        paddingLeft: "100%",
        animation: "kiruk-1993-marquee-pv 26s linear infinite",
      }}
    >
      <style jsx global>{`
        @keyframes kiruk-1993-marquee-pv {
          from { transform: translateX(0); }
          to   { transform: translateX(-100%); }
        }
      `}</style>
      {joined}   ✦   {joined}
    </div>
  );
}

function fontName(f: string) {
  return f.split(",")[0].replaceAll('"', "").trim();
}

export default MosaicArchetype;
