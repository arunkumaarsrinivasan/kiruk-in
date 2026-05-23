"use client";

/**
 * GeocitiesArchetype — 1995 era preview inside <EraTimeMachine>.
 *
 * Starfield bg + neon-on-navy Comic Sans page. Transport rendered as the
 * era's typical "prev / index / next" web-ring text links. Era metadata
 * surfaced as a personal homepage about the era itself — palette as
 * coloured swatches, typography in real fonts, tokens as a DL, keywords
 * as glowing tags.
 */

import React, { useMemo } from "react";
import type { EraSurfaceProps } from "../shared/EraSurface";

const NAVY = "#000033";
const CREAM = "#ffff99";
const YELLOW = "#ffff00";
const MAGENTA = "#ff00ff";
const CYAN = "#00ffff";
const HOT_PINK = "#ff66cc";
const LIME = "#66ff66";

const FONT_COMIC = '"Comic Sans MS", "Comic Neue", Chalkboard, cursive';
const FONT_MONO = '"Courier New", Courier, monospace';

const COLORS = ["#ffffff", "#ffff99", "#00ffff", "#ff99ff"];

function makeStars(count: number) {
  return Array.from({ length: count }, (_, i) => {
    const seed = (i * 9301 + 49297) % 233280;
    const r = (n: number) => ((seed * n * 9301 + 49297) % 233280) / 233280;
    return {
      x: r(1) * 100,
      y: r(2) * 100,
      size: 1 + Math.floor(r(3) * 2.5),
      delay: r(4) * 6,
      duration: 1.6 + r(5) * 3.4,
      color: COLORS[i % COLORS.length],
    };
  });
}

export const GeocitiesArchetype: React.FC<EraSurfaceProps> = ({
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
  const stars = useMemo(() => makeStars(90), []);
  const swatches = [
    ["primary", era.colors.primary],
    ["secondary", era.colors.secondary],
    ["accent", era.colors.accent],
    ["background", era.colors.background],
    ["text", era.colors.text],
  ] as const;
  const tokens = era.designTokens;

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{
        backgroundColor: NAVY,
        color: CREAM,
        fontFamily: FONT_COMIC,
      }}
    >
      <style jsx global>{`
        @keyframes kiruk-1995-pv-twinkle {
          0%, 100% { opacity: 0.25; transform: scale(1); }
          50%      { opacity: 1;    transform: scale(1.4); }
        }
        @keyframes kiruk-1995-pv-rainbow {
          0%   { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
      `}</style>

      {/* Starfield */}
      {stars.map((s, i) => (
        <span
          key={i}
          aria-hidden
          style={{
            position: "absolute",
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            borderRadius: "50%",
            backgroundColor: s.color,
            boxShadow: `0 0 ${s.size * 3}px ${s.color}`,
            animation: `kiruk-1995-pv-twinkle ${s.duration}s ease-in-out ${s.delay}s infinite`,
          }}
        />
      ))}

      <div
        style={{
          position: "absolute",
          inset: 0,
          overflowY: "auto",
          padding: "24px 18px 60px",
        }}
      >
        <div
          style={{
            maxWidth: 720,
            margin: "0 auto",
            textAlign: "center",
          }}
        >
          {/* Top web-ring style nav as prose */}
          <div
            style={{
              fontFamily: FONT_COMIC,
              fontSize: 13,
              color: CYAN,
              marginBottom: 18,
            }}
          >
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (prevEra) onPrev();
              }}
              style={{
                color: prevEra ? CYAN : "#555",
                textDecoration: prevEra ? "underline" : "none",
                marginRight: 12,
                pointerEvents: prevEra ? "auto" : "none",
              }}
            >
              ◂ Previous Era
            </a>
            <span style={{ color: HOT_PINK }}>
              era {era.id} · {index + 1}/{total}
            </span>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (nextEra) onNext();
              }}
              style={{
                color: nextEra ? CYAN : "#555",
                textDecoration: nextEra ? "underline" : "none",
                marginLeft: 12,
                pointerEvents: nextEra ? "auto" : "none",
              }}
            >
              Next Era ▸
            </a>
            <span style={{ marginLeft: 12 }}>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onClose();
                }}
                style={{ color: YELLOW, textDecoration: "underline" }}
              >
                ✕ Close
              </a>
            </span>
          </div>

          {/* Rainbow heading */}
          <h1
            style={{
              fontFamily: FONT_COMIC,
              fontSize: "clamp(48px, 11vw, 96px)",
              fontWeight: 700,
              margin: "0",
              lineHeight: 1.05,
              background: `linear-gradient(90deg, ${YELLOW}, ${MAGENTA}, ${CYAN}, ${LIME}, ${YELLOW})`,
              backgroundSize: "200% 100%",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              animation: "kiruk-1995-pv-rainbow 6s linear infinite",
              textShadow: `0 0 12px ${MAGENTA}66`,
            }}
          >
            {era.id}
          </h1>
          <div
            style={{
              fontFamily: FONT_COMIC,
              fontSize: 18,
              color: HOT_PINK,
              marginTop: 4,
            }}
          >
            ~*~ {era.name.split(":")[1]?.trim() || era.name} ~*~
          </div>
          <div
            style={{
              fontFamily: FONT_MONO,
              fontSize: 11,
              color: CYAN,
              marginTop: 6,
              letterSpacing: 1,
              textTransform: "uppercase",
            }}
          >
            {era.era}
          </div>

          <RainbowRule />

          {/* Description */}
          <p
            style={{
              fontFamily: FONT_COMIC,
              fontSize: 15,
              lineHeight: 1.55,
              color: CREAM,
              textAlign: "left",
              margin: "0 0 10px",
            }}
          >
            {era.description}
          </p>
          <blockquote
            style={{
              borderLeft: `3px solid ${LIME}`,
              paddingLeft: 10,
              fontStyle: "italic",
              color: YELLOW,
              textAlign: "left",
              margin: "0 0 10px",
            }}
          >
            “{era.lesson}”
          </blockquote>
          <p
            style={{
              fontFamily: FONT_COMIC,
              fontSize: 13,
              lineHeight: 1.5,
              color: CREAM,
              textAlign: "left",
              margin: "0 0 14px",
              opacity: 0.85,
            }}
          >
            <span style={{ color: HOT_PINK }}>Heritage: </span>
            {era.heritage}
          </p>

          <RainbowRule />

          {/* Palette */}
          <H>★ Palette ★</H>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: 10,
            }}
          >
            {swatches.map(([k, v]) => (
              <div
                key={k}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 3,
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    backgroundColor: v,
                    border: `1px solid ${MAGENTA}`,
                    boxShadow: `0 0 12px ${v}88`,
                  }}
                />
                <span style={{ fontFamily: FONT_COMIC, fontSize: 11, color: CYAN }}>
                  {k}
                </span>
                <code style={{ fontFamily: FONT_MONO, fontSize: 10, color: CREAM }}>
                  {v.toUpperCase()}
                </code>
              </div>
            ))}
          </div>

          <RainbowRule />

          {/* Typography */}
          <H>★ Typography ★</H>
          <div
            style={{
              textAlign: "left",
              fontFamily: FONT_COMIC,
              color: CREAM,
              fontSize: 13,
            }}
          >
            <TypeLine role="display" font={era.fonts.primary} sample="Aa Bb 0123" size={26} />
            <TypeLine role="body" font={era.fonts.secondary} sample="The quick brown fox." size={15} />
            <TypeLine role="ui" font={era.fonts.accent} sample="BUTTONS · LABELS" size={13} />
          </div>

          <RainbowRule />

          {/* Tokens */}
          <H>★ Tokens ★</H>
          <dl
            style={{
              textAlign: "left",
              display: "grid",
              gridTemplateColumns: "max-content 1fr",
              columnGap: 12,
              rowGap: 2,
              fontFamily: FONT_COMIC,
              fontSize: 13,
              color: CREAM,
            }}
          >
            <TokRow k="radius" v={`${tokens.borderRadius}px`} />
            <TokRow
              k="shadow"
              v={`${tokens.shadowStyle} @ ${tokens.shadowIntensity}`}
            />
            <TokRow k="grid" v={tokens.gridSize ? `${tokens.gridSize}px` : "—"} />
            <TokRow k="tracking" v={String(tokens.letterSpacing)} />
            <TokRow k="leading" v={String(tokens.lineHeight)} />
            <TokRow k="motion" v={tokens.animationStyle} />
          </dl>

          <RainbowRule />

          {/* Key elements */}
          <H>★ Key Elements ★</H>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 6,
              justifyContent: "center",
            }}
          >
            {era.keyElements.map((el) => (
              <Tag key={el}>{el}</Tag>
            ))}
          </div>

          {era.designTokens.effects.length > 0 && (
            <>
              <H>★ Effects ★</H>
              <div
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 13,
                  color: CYAN,
                }}
              >
                {era.designTokens.effects.join(" · ")}
              </div>
            </>
          )}

          <RainbowRule />

          {/* CTAs */}
          <div
            style={{
              display: "flex",
              gap: 10,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <SignBtn onClick={onCustomize}>✎ Customize this Era</SignBtn>
            <SignBtn onClick={onClose} primary>
              ✿ Use Era {era.id}
            </SignBtn>
          </div>

          <p
            style={{
              marginTop: 18,
              fontFamily: FONT_COMIC,
              fontSize: 12,
              color: HOT_PINK,
            }}
          >
            ★ Hand-coded since 1995 · ★ Best with Netscape Navigator ★
          </p>
        </div>
      </div>
    </div>
  );
};

function H({ children }: { children: React.ReactNode }) {
  return (
    <h2
      style={{
        fontFamily: FONT_COMIC,
        fontSize: 20,
        color: YELLOW,
        textShadow: `0 0 8px ${MAGENTA}, 0 0 14px ${MAGENTA}`,
        margin: "12px 0 8px",
        lineHeight: 1.2,
      }}
    >
      {children}
    </h2>
  );
}

function RainbowRule() {
  return (
    <div
      aria-hidden
      style={{
        height: 4,
        margin: "14px 0",
        background: `linear-gradient(90deg, ${MAGENTA}, ${YELLOW}, ${CYAN}, ${LIME}, ${HOT_PINK}, ${MAGENTA})`,
        backgroundSize: "200% 100%",
        animation: "kiruk-1995-pv-rainbow 6s linear infinite",
        boxShadow: `0 0 8px ${MAGENTA}88`,
      }}
    />
  );
}

function TypeLine({
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
    <div style={{ marginBottom: 6 }}>
      <div style={{ color: CYAN, fontFamily: FONT_COMIC, fontSize: 12 }}>
        ★ {role}{" "}
        <span style={{ color: HOT_PINK, fontFamily: FONT_MONO, fontSize: 11 }}>
          {fontName}
        </span>
      </div>
      <div style={{ fontFamily: font, fontSize: size, color: CREAM }}>
        {sample}
      </div>
    </div>
  );
}

function TokRow({ k, v }: { k: string; v: string }) {
  return (
    <>
      <dt style={{ color: YELLOW, fontWeight: 700 }}>{k}:</dt>
      <dd style={{ margin: 0, color: CREAM, fontFamily: FONT_MONO, fontSize: 12 }}>
        {v}
      </dd>
    </>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "3px 8px",
        fontFamily: FONT_COMIC,
        fontSize: 12,
        color: NAVY,
        backgroundColor: YELLOW,
        border: `1px solid ${MAGENTA}`,
        boxShadow: `0 0 8px ${YELLOW}66`,
      }}
    >
      {children}
    </span>
  );
}

function SignBtn({
  children,
  onClick,
  primary,
}: {
  children: React.ReactNode;
  onClick: () => void;
  primary?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "6px 14px",
        fontFamily: FONT_COMIC,
        fontSize: 14,
        color: primary ? NAVY : CYAN,
        backgroundColor: primary ? YELLOW : "transparent",
        border: `1px solid ${primary ? YELLOW : CYAN}`,
        cursor: "pointer",
        textShadow: primary ? "none" : `0 0 6px ${CYAN}88`,
      }}
    >
      {children}
    </button>
  );
}

export default GeocitiesArchetype;
