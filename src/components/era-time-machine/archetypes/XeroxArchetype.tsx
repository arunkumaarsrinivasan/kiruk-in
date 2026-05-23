"use client";

/**
 * XeroxArchetype — 1981 era preview inside <EraTimeMachine>.
 *
 * Full Xerox Star desktop: gray dot-pattern background, beveled bitmap
 * windows arranged as a multi-document workspace, navy title bars with
 * pixel mini-controls, sunken inner panels for swatches/tags, hard
 * black-on-white dot-leader metadata tables, beveled transport buttons.
 *
 * Same data the legacy overlay rendered (description, lesson, palette,
 * typography, elements, effects, tokens) — only the visual language
 * shifts to authentic 1981.
 */

import React, { useMemo, useState } from "react";
import { Pixelify_Sans } from "next/font/google";
import type { EraSurfaceProps } from "../shared/EraSurface";

const pixelify = Pixelify_Sans({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-pixelify-era",
});

// Palette
const GRAY = "#c0c0c0";
const GRAY_LIGHT = "#dcdcdc";
const HILITE = "#ffffff";
const SHADOW = "#808080";
const BLACK = "#000000";
const TITLE_BG = "#000080";
const TITLE_TEXT = "#ffffff";
const SELECTED = "#e6e6e6";

const FONT_STACK =
  "'Pixelify Sans', 'IBM Plex Sans', 'Helvetica', sans-serif";
const FONT_MONO = "'IBM Plex Mono', 'Courier New', monospace";

export const XeroxArchetype: React.FC<EraSurfaceProps> = ({
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
  const stamp = useMemo(
    () =>
      new Date().toLocaleString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
    [],
  );

  const swatches = useMemo(
    () =>
      [
        { key: "primary", color: era.colors.primary },
        { key: "secondary", color: era.colors.secondary },
        { key: "accent", color: era.colors.accent },
        { key: "background", color: era.colors.background },
        { key: "text", color: era.colors.text },
      ] as const,
    [era],
  );

  const tokens = era.designTokens;
  const tokenRows: Array<[string, string]> = [
    ["RADIUS", `${tokens.borderRadius}PX`],
    ["SHADOW", `${tokens.shadowStyle.toUpperCase()} @ ${tokens.shadowIntensity}`],
    ["GRID", tokens.gridSize ? `${tokens.gridSize}PX` : "—"],
    ["TRACKING", `${tokens.letterSpacing}`],
    ["LEADING", `${tokens.lineHeight}`],
    ["MOTION", tokens.animationStyle.toUpperCase()],
  ];

  return (
    <div
      className={`${pixelify.className} absolute inset-0 overflow-hidden`}
      style={{
        backgroundColor: GRAY,
        backgroundImage:
          "repeating-radial-gradient(circle at 0 0, transparent 0, transparent 5px, rgba(0,0,0,0.08) 5px, rgba(0,0,0,0.08) 6px)",
        backgroundSize: "12px 12px",
        color: BLACK,
        fontFamily: FONT_STACK,
      }}
    >
      {/* ── Top desktop / transport bar ──────────────────────────────── */}
      <DesktopBar
        stamp={stamp}
        index={index}
        total={total}
        eraId={era.id}
        onPrev={onPrev}
        onNext={onNext}
        onClose={onClose}
        prevDisabled={!prevEra}
        nextDisabled={!nextEra}
      />

      {/* ── Scrollable body ─────────────────────────────────────────── */}
      <div className="absolute inset-0 z-0 overflow-y-auto" style={{ paddingTop: 88, paddingBottom: 80 }}>
        <div className="max-w-4xl mx-auto px-3 sm:px-6 flex flex-col gap-4">
          {/* ABOUT-19YY.DOC */}
          <BevelWindow
            title={`ABOUT-${era.id}.DOC`}
            subtitle={`${era.era.toLowerCase()}`}
            icon="◰"
          >
            <div className="px-4 py-4" style={{ backgroundColor: HILITE }}>
              <div
                style={{
                  fontSize: 11,
                  color: SHADOW,
                  fontFamily: FONT_MONO,
                  letterSpacing: 1,
                  marginBottom: 6,
                }}
              >
                DESIGN ERA · FILE-{era.id}
              </div>
              <div
                style={{
                  fontSize: "clamp(56px, 11vw, 110px)",
                  lineHeight: 0.9,
                  color: TITLE_BG,
                  fontWeight: 700,
                  letterSpacing: 2,
                }}
              >
                {era.id}
              </div>
              <div
                style={{
                  fontSize: "clamp(16px, 2.2vw, 22px)",
                  marginTop: 4,
                  color: BLACK,
                  fontWeight: 700,
                }}
              >
                {era.name.split(":")[1]?.trim() || era.name}
              </div>
              <div
                style={{
                  display: "inline-block",
                  marginTop: 8,
                  padding: "2px 10px",
                  backgroundColor: GRAY_LIGHT,
                  border: `1px solid ${BLACK}`,
                  fontFamily: FONT_MONO,
                  fontSize: 11,
                  letterSpacing: 1,
                  color: TITLE_BG,
                  textTransform: "uppercase",
                }}
              >
                STYLE · {era.style}
              </div>

              <DitherRule />

              <p
                style={{
                  fontSize: 13,
                  color: BLACK,
                  lineHeight: 1.55,
                  fontFamily: FONT_MONO,
                  letterSpacing: 0.3,
                  marginBottom: 10,
                }}
              >
                {era.description.toUpperCase()}
              </p>

              <div
                style={{
                  fontSize: 11,
                  color: SHADOW,
                  fontFamily: FONT_MONO,
                  letterSpacing: 1,
                  marginBottom: 2,
                }}
              >
                LESSON
              </div>
              <div
                style={{
                  borderLeft: `4px solid ${TITLE_BG}`,
                  paddingLeft: 8,
                  fontSize: 14,
                  color: BLACK,
                  fontFamily: FONT_MONO,
                  marginBottom: 10,
                  letterSpacing: 0.5,
                }}
              >
                “{era.lesson.toUpperCase()}”
              </div>

              <div
                style={{
                  fontSize: 11,
                  color: SHADOW,
                  fontFamily: FONT_MONO,
                  letterSpacing: 1,
                  marginBottom: 2,
                }}
              >
                HERITAGE
              </div>
              <p
                style={{
                  fontSize: 12,
                  color: BLACK,
                  lineHeight: 1.55,
                  fontFamily: FONT_MONO,
                  letterSpacing: 0.3,
                }}
              >
                {era.heritage.toUpperCase()}
              </p>
            </div>
          </BevelWindow>

          {/* PALETTE.DAT + TOKENS.DAT side-by-side on lg+ */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <BevelWindow title="PALETTE.DAT" subtitle="5 stops" icon="◑">
              <div className="px-4 py-3" style={{ backgroundColor: HILITE }}>
                <div
                  style={{
                    fontSize: 11,
                    color: SHADOW,
                    fontFamily: FONT_MONO,
                    letterSpacing: 1,
                    marginBottom: 8,
                  }}
                >
                  CLICK SWATCH TO COPY
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {swatches.map((s) => (
                    <PixelSwatch key={s.key} color={s.color} label={s.key} />
                  ))}
                </div>
              </div>
            </BevelWindow>

            <BevelWindow title="TOKENS.DAT" subtitle="design system" icon="▤">
              <div className="px-4 py-3" style={{ backgroundColor: HILITE }}>
                <div
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: 13,
                    color: BLACK,
                    lineHeight: 1.7,
                  }}
                >
                  {tokenRows.map(([k, v]) => (
                    <div key={k} style={{ display: "flex", gap: 6 }}>
                      <span
                        style={{
                          color: SHADOW,
                          width: 110,
                          letterSpacing: 1,
                        }}
                      >
                        {k.padEnd(10, ".")}
                      </span>
                      <span
                        style={{
                          color: TITLE_BG,
                          fontWeight: 700,
                          letterSpacing: 0.5,
                        }}
                      >
                        {v}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </BevelWindow>
          </div>

          {/* TYPOGRAPHY.DAT */}
          <BevelWindow title="TYPOGRAPHY.DAT" subtitle="display · body · ui" icon="A">
            <div
              className="px-4 py-3 flex flex-col gap-2"
              style={{ backgroundColor: HILITE }}
            >
              <TypeRow
                role="DISPLAY"
                font={era.fonts.primary}
                size={28}
                sample="Aa Bb Cc 0123456789"
              />
              <TypeRow
                role="BODY"
                font={era.fonts.secondary}
                size={16}
                sample="The quick brown fox jumps over the lazy dog."
              />
              <TypeRow
                role="UI"
                font={era.fonts.accent}
                size={13}
                sample="BUTTONS · LABELS · INPUTS · FORMS"
              />
            </div>
          </BevelWindow>

          {/* ELEMENTS.LST + EFFECTS.LST side-by-side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <BevelWindow title="ELEMENTS.LST" subtitle="key elements" icon="▦">
              <div className="px-4 py-3" style={{ backgroundColor: HILITE }}>
                <ul style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {era.keyElements.map((el) => (
                    <li
                      key={el}
                      style={{
                        display: "flex",
                        alignItems: "baseline",
                        gap: 6,
                        fontSize: 13,
                        color: BLACK,
                        fontFamily: FONT_MONO,
                        letterSpacing: 0.3,
                      }}
                    >
                      <span style={{ color: TITLE_BG }}>►</span>
                      <span>{el.toUpperCase()}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </BevelWindow>

            <BevelWindow title="EFFECTS.LST" subtitle="era-specific" icon="✶">
              <div className="px-4 py-3" style={{ backgroundColor: HILITE }}>
                {era.designTokens.effects.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {era.designTokens.effects.map((e) => (
                      <PixelTag key={e}>{e.toUpperCase()}</PixelTag>
                    ))}
                  </div>
                ) : (
                  <span style={{ color: SHADOW, fontSize: 13, fontFamily: FONT_MONO }}>
                    NO ERA-SPECIFIC EFFECTS REGISTERED
                  </span>
                )}
              </div>
            </BevelWindow>
          </div>

          {/* CTA row */}
          <div className="flex flex-wrap gap-2 justify-center mt-2">
            <PixelActionButton onClick={onCustomize}>
              CUSTOMIZE · ADAPT ERA
            </PixelActionButton>
            <PixelActionButton onClick={onClose} primary>
              USE {era.id} ▸
            </PixelActionButton>
          </div>
        </div>
      </div>

      {/* ── Status bar ──────────────────────────────────────────────── */}
      <StatusBar eraId={era.id} index={index} total={total} stamp={stamp} />
    </div>
  );
};

// ─── Top transport / desktop bar ─────────────────────────────────────────

function DesktopBar({
  stamp,
  index,
  total,
  eraId,
  onPrev,
  onNext,
  onClose,
  prevDisabled,
  nextDisabled,
}: {
  stamp: string;
  index: number;
  total: number;
  eraId: string;
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
  prevDisabled: boolean;
  nextDisabled: boolean;
}) {
  return (
    <div
      className="absolute inset-x-0 top-0 z-30"
      style={{ backgroundColor: GRAY }}
    >
      {/* Menu strip */}
      <div
        style={{
          padding: "4px 10px",
          borderTop: `2px solid ${HILITE}`,
          borderLeft: `2px solid ${HILITE}`,
          borderRight: `2px solid ${SHADOW}`,
          borderBottom: `2px solid ${SHADOW}`,
          backgroundColor: GRAY_LIGHT,
          fontFamily: FONT_MONO,
          fontSize: 11,
          color: BLACK,
          letterSpacing: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span>KIRUK ⌂ ERA-MACHINE · XEROX STAR / {eraId}</span>
        <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span>FILE</span>
          <span>EDIT</span>
          <span>VIEW</span>
          <span>HELP</span>
          <span style={{ color: SHADOW }}>· {stamp}</span>
        </span>
      </div>

      {/* Transport row */}
      <div
        style={{
          padding: "6px 10px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          backgroundColor: GRAY,
          borderBottom: `1px solid ${BLACK}`,
        }}
      >
        <PixelActionButton onClick={onClose} compact>
          ✕ CLOSE
        </PixelActionButton>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <PixelActionButton
            onClick={onPrev}
            disabled={prevDisabled}
            compact
          >
            ◂ PREV
          </PixelActionButton>
          <span
            style={{
              minWidth: 96,
              padding: "4px 8px",
              backgroundColor: TITLE_BG,
              color: TITLE_TEXT,
              border: `1px solid ${BLACK}`,
              fontFamily: FONT_MONO,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: 1,
              textAlign: "center",
            }}
          >
            ERA {eraId} · {index + 1}/{total}
          </span>
          <PixelActionButton
            onClick={onNext}
            disabled={nextDisabled}
            compact
          >
            NEXT ▸
          </PixelActionButton>
        </div>
      </div>
    </div>
  );
}

// ─── Beveled window frame ────────────────────────────────────────────────

function BevelWindow({
  title,
  subtitle,
  icon,
  children,
}: {
  title: string;
  subtitle?: string;
  icon?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        backgroundColor: GRAY,
        borderTop: `2px solid ${HILITE}`,
        borderLeft: `2px solid ${HILITE}`,
        borderRight: `2px solid ${SHADOW}`,
        borderBottom: `2px solid ${SHADOW}`,
        outline: `1px solid ${BLACK}`,
        boxShadow: `3px 3px 0 ${BLACK}`,
      }}
    >
      <div
        style={{
          backgroundColor: TITLE_BG,
          color: TITLE_TEXT,
          padding: "3px 6px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 6,
          borderBottom: `1px solid ${BLACK}`,
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {icon && (
            <span
              style={{
                display: "inline-block",
                width: 18,
                textAlign: "center",
                backgroundColor: GRAY,
                color: BLACK,
                border: `1px solid ${BLACK}`,
                fontSize: 11,
              }}
            >
              {icon}
            </span>
          )}
          <span
            style={{
              fontWeight: 700,
              letterSpacing: 1,
              fontSize: 12,
              fontFamily: FONT_MONO,
            }}
          >
            {title}
          </span>
          {subtitle && (
            <span
              style={{ fontSize: 11, opacity: 0.75, fontFamily: FONT_MONO }}
            >
              · {subtitle}
            </span>
          )}
        </span>
        <span style={{ display: "flex", gap: 2 }}>
          <MiniBtn>_</MiniBtn>
          <MiniBtn>□</MiniBtn>
          <MiniBtn>✕</MiniBtn>
        </span>
      </div>
      {children}
    </div>
  );
}

function MiniBtn({ children }: { children: React.ReactNode }) {
  return (
    <span
      aria-hidden
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 18,
        height: 16,
        backgroundColor: GRAY,
        color: BLACK,
        borderTop: `1px solid ${HILITE}`,
        borderLeft: `1px solid ${HILITE}`,
        borderRight: `1px solid ${SHADOW}`,
        borderBottom: `1px solid ${SHADOW}`,
        fontSize: 10,
        lineHeight: 1,
        fontFamily: FONT_MONO,
      }}
    >
      {children}
    </span>
  );
}

// ─── Pixel swatch (click-to-copy) ────────────────────────────────────────

function PixelSwatch({ color, label }: { color: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(color);
    } catch {
      /* noop */
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  };
  return (
    <button
      type="button"
      onClick={copy}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        gap: 4,
        backgroundColor: "transparent",
        border: "none",
        padding: 0,
        cursor: "pointer",
        textAlign: "center",
      }}
      aria-label={`Copy ${label} ${color}`}
    >
      <div
        style={{
          width: "100%",
          aspectRatio: "1",
          backgroundColor: color,
          border: `1px solid ${BLACK}`,
          boxShadow: `2px 2px 0 ${BLACK}`,
        }}
      />
      <span
        style={{
          fontSize: 9,
          color: SHADOW,
          fontFamily: FONT_MONO,
          letterSpacing: 1,
          textTransform: "uppercase",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: 9,
          color: BLACK,
          fontFamily: FONT_MONO,
          letterSpacing: 0.5,
        }}
      >
        {copied ? "COPIED" : color.toUpperCase()}
      </span>
    </button>
  );
}

// ─── Typography row ──────────────────────────────────────────────────────

function TypeRow({
  role,
  font,
  size,
  sample,
}: {
  role: string;
  font: string;
  size: number;
  sample: string;
}) {
  const fontName = font.split(",")[0].replaceAll('"', "").trim();
  return (
    <div
      style={{
        backgroundColor: SELECTED,
        borderTop: `2px solid ${SHADOW}`,
        borderLeft: `2px solid ${SHADOW}`,
        borderRight: `2px solid ${HILITE}`,
        borderBottom: `2px solid ${HILITE}`,
        outline: `1px solid ${BLACK}`,
        padding: "8px 10px",
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 4 }}>
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: TITLE_BG,
            fontFamily: FONT_MONO,
            letterSpacing: 1,
          }}
        >
          ◆ {role}
        </span>
        <span
          style={{ fontSize: 10, color: SHADOW, fontFamily: FONT_MONO }}
        >
          {fontName}
        </span>
      </div>
      <div
        style={{
          fontFamily: font,
          fontSize: size,
          color: BLACK,
          lineHeight: 1.3,
        }}
      >
        {sample}
      </div>
    </div>
  );
}

// ─── Pixel tag ───────────────────────────────────────────────────────────

function PixelTag({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        display: "inline-block",
        fontSize: 11,
        padding: "1px 6px",
        color: BLACK,
        backgroundColor: GRAY_LIGHT,
        border: `1px solid ${BLACK}`,
        fontFamily: FONT_MONO,
        letterSpacing: 0.5,
      }}
    >
      {children}
    </span>
  );
}

// ─── Bevel action button ─────────────────────────────────────────────────

function PixelActionButton({
  children,
  onClick,
  disabled,
  primary,
  compact,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  primary?: boolean;
  compact?: boolean;
}) {
  const [pressed, setPressed] = useState(false);
  const bg = primary ? TITLE_BG : GRAY;
  const color = primary ? TITLE_TEXT : BLACK;
  const hi = primary ? "#3333aa" : HILITE;
  const sh = primary ? "#000044" : SHADOW;
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      onMouseDown={() => !disabled && setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      disabled={disabled}
      style={{
        padding: compact ? "3px 10px" : "5px 14px",
        backgroundColor: bg,
        color,
        borderTop: `2px solid ${pressed ? sh : hi}`,
        borderLeft: `2px solid ${pressed ? sh : hi}`,
        borderRight: `2px solid ${pressed ? hi : sh}`,
        borderBottom: `2px solid ${pressed ? hi : sh}`,
        outline: `1px solid ${BLACK}`,
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: 1,
        fontFamily: FONT_MONO,
        textTransform: "uppercase",
        opacity: disabled ? 0.4 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
        transform: pressed && !disabled ? "translate(1px, 1px)" : "none",
      }}
    >
      {children}
    </button>
  );
}

// ─── Status bar (bottom) ─────────────────────────────────────────────────

function StatusBar({
  eraId,
  index,
  total,
  stamp,
}: {
  eraId: string;
  index: number;
  total: number;
  stamp: string;
}) {
  return (
    <div
      className="absolute inset-x-0 bottom-0 z-30"
      style={{
        backgroundColor: GRAY_LIGHT,
        borderTop: `2px solid ${SHADOW}`,
        borderLeft: `2px solid ${SHADOW}`,
        borderRight: `2px solid ${HILITE}`,
        borderBottom: `2px solid ${HILITE}`,
        outline: `1px solid ${BLACK}`,
        padding: "4px 10px",
        fontSize: 11,
        fontFamily: FONT_MONO,
        color: BLACK,
        letterSpacing: 1,
        display: "grid",
        gridTemplateColumns: "1fr auto auto auto",
        gap: 16,
      }}
    >
      <span>STATUS · READY · ERA {eraId} LOADED</span>
      <span>FREE 32K</span>
      <span>
        FILES {index + 1}/{total}
      </span>
      <span>· {stamp}</span>
    </div>
  );
}

// ─── Dither rule ─────────────────────────────────────────────────────────

function DitherRule() {
  return (
    <div
      style={{
        height: 4,
        margin: "10px 0",
        backgroundImage:
          "repeating-linear-gradient(90deg, #000 0, #000 2px, transparent 2px, transparent 4px)",
        opacity: 0.6,
      }}
    />
  );
}

export default XeroxArchetype;
