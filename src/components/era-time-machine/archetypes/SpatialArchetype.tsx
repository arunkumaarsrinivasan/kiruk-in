"use client";

/**
 * SpatialArchetype — 2025 era preview inside <EraTimeMachine>.
 *
 * Mirrors the visual language of SpatialHomePage but compressed into a
 * single-screen browse view: volumetric backdrop, gradient hero year,
 * floating glass panels with era metadata (description, lesson, palette as
 * orbs, typography, key elements, effects). Parallax on cursor.
 */

import React, { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { EraSurfaceProps } from "../shared/EraSurface";

const PURPLE_FALLBACK = "#8b5cf6";
const BLUE_FALLBACK = "#3b82f6";
const TEAL_FALLBACK = "#14b8a6";
const TEXT_FALLBACK = "#f8fafc";

const FONT_DISPLAY = "'SF Pro Display', 'Geist', 'Inter', sans-serif";
const FONT_BODY = "'SF Pro Text', 'Inter', sans-serif";
const FONT_MONO = "'SF Mono', 'Geist Mono', monospace";

function useParallax() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setPos({ x, y });
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);
  return pos;
}

export const SpatialArchetype: React.FC<EraSurfaceProps> = ({
  era,
  prevEra,
  nextEra,
  index,
  total,
  phase,
  reduceMotion,
  onPrev,
  onNext,
  onCustomize,
  onClose,
}) => {
  const reduced = useReducedMotion() ?? reduceMotion;
  const { x, y } = useParallax();

  const primary = era.colors.primary || PURPLE_FALLBACK;
  const secondary = era.colors.secondary || BLUE_FALLBACK;
  const accent = era.colors.accent || TEAL_FALLBACK;
  const text = era.colors.text || TEXT_FALLBACK;
  const bg = era.colors.background || "#020617";

  const depth = (z: number) => ({
    x: reduced ? 0 : x * z,
    y: reduced ? 0 : y * z,
  });

  const swatches = useMemo(
    () =>
      [
        { key: "primary", color: primary, label: "primary" },
        { key: "secondary", color: secondary, label: "secondary" },
        { key: "accent", color: accent, label: "accent" },
        { key: "background", color: bg, label: "background" },
        { key: "text", color: text, label: "text" },
      ] as const,
    [primary, secondary, accent, bg, text],
  );

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{
        backgroundColor: bg,
        color: text,
        fontFamily: FONT_BODY,
      }}
    >
      {/* ── Atmospheric backdrop ────────────────────────────────────── */}
      <Atmosphere
        primary={primary}
        secondary={secondary}
        accent={accent}
        reduced={!!reduced}
      />

      {/* ── Top transport ───────────────────────────────────────────── */}
      <nav
        className="absolute top-0 inset-x-0 z-20 flex items-center justify-between px-4 md:px-6 py-3"
        style={{ pointerEvents: "auto" }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close era time machine"
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-[11px] uppercase tracking-[0.22em] backdrop-blur-md transition-colors"
          style={{
            borderColor: `${text}22`,
            color: text,
            backgroundColor: `${text}06`,
            fontFamily: FONT_MONO,
          }}
        >
          ✕ Close
        </button>

        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1">
          <span
            className="text-[10px] uppercase tracking-[0.32em]"
            style={{ color: `${text}55`, fontFamily: FONT_MONO }}
          >
            era · spatial
          </span>
        </div>

        <div className="flex items-center gap-2">
          <TransportButton
            label="Prev"
            arrow="‹"
            disabled={!prevEra}
            onClick={onPrev}
            text={text}
            accent={accent}
          />
          <div
            className="flex flex-col items-center justify-center min-w-[3.5rem] px-1"
            style={{ fontFamily: FONT_MONO }}
          >
            <span
              className="text-[11px] font-bold tabular-nums leading-none"
              style={{ color: accent }}
            >
              {era.id}
            </span>
            <span
              className="text-[9px] tabular-nums mt-0.5"
              style={{ color: `${text}45` }}
            >
              {index + 1}
              <span style={{ opacity: 0.45 }}>/{total}</span>
            </span>
          </div>
          <TransportButton
            label="Next"
            arrow="›"
            disabled={!nextEra}
            onClick={onNext}
            text={text}
            accent={accent}
          />
        </div>
      </nav>

      {/* ── Body ────────────────────────────────────────────────────── */}
      <div className="absolute inset-0 z-10 overflow-y-auto">
        <div className="min-h-full max-w-5xl mx-auto px-5 md:px-12 pt-20 pb-32 flex flex-col gap-6">
          {/* Hero */}
          <motion.section
            initial={reduced ? { opacity: 1 } : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.23, 1, 0.32, 1] }}
            className="relative text-center pt-4 pb-2"
            style={{
              transform: `translate3d(${depth(-12).x}px, ${depth(-12).y}px, 0)`,
            }}
          >
            <SignalChip accent={accent} text={text}>
              {era.era}
            </SignalChip>
            <h1
              className="mt-4 leading-[0.85] tracking-tight"
              style={{
                fontFamily: FONT_DISPLAY,
                fontWeight: 700,
                fontSize: "clamp(4.5rem, 14vw, 11rem)",
                letterSpacing: "-0.03em",
                background: `linear-gradient(180deg, ${text} 0%, ${text}b3 55%, ${accent} 100%)`,
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
                textShadow:
                  phase === "entering"
                    ? `0 0 60px ${accent}55`
                    : "none",
              }}
            >
              {era.id}
            </h1>
            <div
              className="mt-3 font-semibold"
              style={{
                fontSize: "clamp(1.1rem, 2.4vw, 1.75rem)",
                color: text,
                fontFamily: FONT_DISPLAY,
              }}
            >
              {era.name.split(":")[1]?.trim() || era.name}
            </div>
            <div
              className="mt-1.5 text-[10px] uppercase tracking-[0.32em]"
              style={{ color: `${text}55`, fontFamily: FONT_MONO }}
            >
              style · {era.style}
            </div>
          </motion.section>

          {/* Description panel */}
          <GlassPanel
            accent={primary}
            tx={depth(-8).x}
            ty={depth(-8).y}
            text={text}
            reduced={!!reduced}
          >
            <PanelTag id="01" title="description" text={text} />
            <p
              className="mt-3"
              style={{
                fontSize: "clamp(1rem, 1.6vw, 1.15rem)",
                color: `${text}d0`,
                lineHeight: 1.55,
              }}
            >
              {era.description}
            </p>
          </GlassPanel>

          {/* Lesson + heritage */}
          <GlassPanel
            accent={accent}
            tx={depth(-10).x}
            ty={depth(-10).y}
            text={text}
            reduced={!!reduced}
          >
            <PanelTag id="02" title="lesson · heritage" text={text} />
            <div
              className="mt-3 italic"
              style={{
                fontSize: "clamp(1.05rem, 1.8vw, 1.3rem)",
                color: accent,
                fontFamily: FONT_DISPLAY,
              }}
            >
              “{era.lesson}”
            </div>
            <div
              className="mt-2"
              style={{ color: `${text}90`, fontSize: 15, lineHeight: 1.5 }}
            >
              {era.heritage}
            </div>
          </GlassPanel>

          {/* Palette as floating orbs */}
          <GlassPanel
            accent={primary}
            tx={depth(-6).x}
            ty={depth(-6).y}
            text={text}
            reduced={!!reduced}
          >
            <PanelTag id="03" title="palette · 5 stops" text={text} />
            <div className="mt-4 flex flex-wrap justify-center gap-4 md:gap-6">
              {swatches.map((s, i) => (
                <PaletteOrb
                  key={s.key}
                  color={s.color}
                  label={s.label}
                  text={text}
                  delay={i * 0.06}
                  reduced={!!reduced}
                />
              ))}
            </div>
          </GlassPanel>

          {/* Typography */}
          <GlassPanel
            accent={secondary}
            tx={depth(-9).x}
            ty={depth(-9).y}
            text={text}
            reduced={!!reduced}
          >
            <PanelTag id="04" title="typography" text={text} />
            <div className="mt-3 space-y-3">
              <TypeRow
                role="DISPLAY"
                font={era.fonts.primary}
                text={text}
                size="clamp(1.5rem, 2.6vw, 2rem)"
              >
                Aa Bb Cc Dd 0123456789
              </TypeRow>
              <TypeRow
                role="BODY"
                font={era.fonts.secondary}
                text={text}
                size="1rem"
              >
                The quick brown fox jumps over the lazy dog.
              </TypeRow>
              <TypeRow
                role="UI"
                font={era.fonts.accent}
                text={text}
                size="0.875rem"
              >
                BUTTONS · LABELS · INPUTS · FORMS
              </TypeRow>
            </div>
          </GlassPanel>

          {/* Key elements + effects */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <GlassPanel
              accent={accent}
              tx={depth(-7).x}
              ty={depth(-7).y}
              text={text}
              reduced={!!reduced}
            >
              <PanelTag id="05" title="key elements" text={text} />
              <div className="mt-3 flex flex-wrap gap-1.5">
                {era.keyElements.map((el) => (
                  <Pill key={el} text={text}>
                    {el}
                  </Pill>
                ))}
              </div>
            </GlassPanel>

            <GlassPanel
              accent={secondary}
              tx={depth(-7).x}
              ty={depth(-7).y}
              text={text}
              reduced={!!reduced}
            >
              <PanelTag id="06" title="effects" text={text} />
              <div className="mt-3 flex flex-wrap gap-1.5">
                {era.designTokens.effects.length > 0 ? (
                  era.designTokens.effects.map((effect) => (
                    <Pill key={effect} text={text}>
                      {effect}
                    </Pill>
                  ))
                ) : (
                  <span style={{ color: `${text}55`, fontSize: 14 }}>
                    (no era-specific effects)
                  </span>
                )}
              </div>
            </GlassPanel>
          </div>

          {/* CTA row */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-2">
            <motion.button
              type="button"
              onClick={onCustomize}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border text-[12px] uppercase tracking-[0.22em] font-bold"
              style={{
                borderColor: accent,
                color: accent,
                backgroundColor: `${accent}10`,
                fontFamily: FONT_MONO,
                backdropFilter: "blur(12px)",
              }}
            >
              Customize · adapt this era
            </motion.button>
            <motion.button
              type="button"
              onClick={onClose}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-[12px] uppercase tracking-[0.22em] font-bold"
              style={{
                color: bg,
                backgroundColor: accent,
                fontFamily: FONT_MONO,
                boxShadow: `0 8px 30px ${accent}55`,
              }}
            >
              Use {era.id} →
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Subcomponents ────────────────────────────────────────────────────────

function Atmosphere({
  primary,
  secondary,
  accent,
  reduced,
}: {
  primary: string;
  secondary: string;
  accent: string;
  reduced: boolean;
}) {
  return (
    <>
      <div
        className="absolute inset-0"
        style={{
          background:
            `radial-gradient(ellipse 90% 70% at 20% 10%, ${primary}33, transparent 60%), ` +
            `radial-gradient(ellipse 90% 70% at 80% 20%, ${secondary}28, transparent 60%), ` +
            `radial-gradient(ellipse 90% 70% at 60% 90%, ${accent}22, transparent 60%)`,
          mixBlendMode: "screen",
        }}
      />
      {!reduced && (
        <>
          <DriftOrb color={primary} size={620} x="-12%" y="-8%" dx={28} dy={18} dur={22} />
          <DriftOrb color={secondary} size={520} x="68%" y="22%" dx={-22} dy={26} dur={28} />
          <DriftOrb color={accent} size={460} x="22%" y="70%" dx={22} dy={-18} dur={24} />
        </>
      )}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage:
            "radial-gradient(ellipse 70% 60% at 50% 50%, #000 30%, transparent 90%)",
        }}
      />
    </>
  );
}

function DriftOrb({
  color,
  size,
  x,
  y,
  dx,
  dy,
  dur,
}: {
  color: string;
  size: number;
  x: string;
  y: string;
  dx: number;
  dy: number;
  dur: number;
}) {
  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: size,
        height: size,
        left: x,
        top: y,
        background: `radial-gradient(circle, ${color}aa 0%, ${color}33 35%, transparent 70%)`,
        filter: "blur(60px)",
        mixBlendMode: "screen",
        opacity: 0.55,
      }}
      animate={{ x: [0, dx, 0], y: [0, dy, 0] }}
      transition={{ duration: dur, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

function GlassPanel({
  accent,
  tx,
  ty,
  text,
  reduced,
  children,
}: {
  accent: string;
  tx: number;
  ty: number;
  text: string;
  reduced: boolean;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={reduced ? { opacity: 1 } : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      className="relative rounded-[24px] border p-5 sm:p-6"
      style={{
        transform: `translate3d(${tx}px, ${ty}px, 0)`,
        borderColor: `${text}1a`,
        backgroundColor: `${text}05`,
        backdropFilter: "blur(22px) saturate(160%)",
        WebkitBackdropFilter: "blur(22px) saturate(160%)",
        boxShadow: `0 24px 80px rgba(0,0,0,0.45), 0 0 0 1px ${text}06 inset, 0 1px 0 ${text}10 inset`,
      }}
    >
      <div
        aria-hidden
        className="absolute -inset-px rounded-[24px] pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 80% 60% at 20% 0%, ${accent}33, transparent 60%)`,
          mixBlendMode: "screen",
        }}
      />
      {children}
    </motion.div>
  );
}

function PanelTag({
  id,
  title,
  text,
}: {
  id: string;
  title: string;
  text: string;
}) {
  return (
    <div className="flex items-baseline gap-3">
      <span
        className="text-[11px] tabular-nums"
        style={{
          color: `${text}55`,
          fontFamily: FONT_MONO,
          letterSpacing: "0.2em",
        }}
      >
        {id}
      </span>
      <span
        className="text-[11px] uppercase"
        style={{
          color: `${text}55`,
          fontFamily: FONT_MONO,
          letterSpacing: "0.25em",
        }}
      >
        {title}
      </span>
    </div>
  );
}

function SignalChip({
  accent,
  text,
  children,
}: {
  accent: string;
  text: string;
  children: React.ReactNode;
}) {
  void text;
  return (
    <span
      className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[11px]"
      style={{
        borderColor: `${accent}66`,
        backgroundColor: `${accent}14`,
        color: accent,
        fontFamily: FONT_MONO,
        letterSpacing: "0.25em",
        textTransform: "uppercase",
        backdropFilter: "blur(12px)",
      }}
    >
      <motion.span
        animate={{ opacity: [1, 0.35, 1] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        style={{
          display: "inline-block",
          width: 6,
          height: 6,
          borderRadius: 6,
          background: accent,
          boxShadow: `0 0 12px ${accent}`,
        }}
      />
      {children}
    </span>
  );
}

function PaletteOrb({
  color,
  label,
  text,
  delay,
  reduced,
}: {
  color: string;
  label: string;
  text: string;
  delay: number;
  reduced: boolean;
}) {
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
      className="group relative flex flex-col items-center gap-2"
      aria-label={`Copy ${label} ${color}`}
    >
      <motion.div
        className="rounded-full"
        style={{
          width: 72,
          height: 72,
          background: `radial-gradient(circle at 35% 30%, ${color}, ${color}99 60%, ${color}33 100%)`,
          boxShadow: `0 0 32px ${color}66, 0 0 0 1px ${text}1a`,
        }}
        initial={reduced ? { scale: 1 } : { scale: 0.8, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay, duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
        whileHover={{ scale: 1.08 }}
      />
      <span
        className="text-[10px] uppercase"
        style={{
          color: `${text}66`,
          fontFamily: FONT_MONO,
          letterSpacing: "0.22em",
        }}
      >
        {label}
      </span>
      <span
        className="text-[10px] tabular-nums"
        style={{ color: `${text}55`, fontFamily: FONT_MONO }}
      >
        {color.toUpperCase()}
      </span>
      {copied && (
        <motion.span
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="absolute -top-7 px-2 py-0.5 rounded-full text-[10px] font-bold"
          style={{
            backgroundColor: color,
            color: text,
            fontFamily: FONT_MONO,
          }}
        >
          COPIED
        </motion.span>
      )}
    </button>
  );
}

function TypeRow({
  role,
  font,
  text,
  size,
  children,
}: {
  role: string;
  font: string;
  text: string;
  size: string;
  children: React.ReactNode;
}) {
  const fontName = font.split(",")[0].replaceAll('"', "").trim();
  return (
    <div
      className="rounded-xl border p-3"
      style={{
        borderColor: `${text}10`,
        backgroundColor: `${text}03`,
      }}
    >
      <div className="flex items-baseline gap-2 mb-1">
        <span
          className="text-[10px] uppercase"
          style={{
            color: `${text}55`,
            fontFamily: FONT_MONO,
            letterSpacing: "0.22em",
          }}
        >
          {role}
        </span>
        <span
          className="text-[10px]"
          style={{ color: `${text}40`, fontFamily: FONT_MONO }}
        >
          {fontName}
        </span>
      </div>
      <p
        style={{
          fontFamily: font,
          color: text,
          fontSize: size,
          lineHeight: 1.4,
        }}
      >
        {children}
      </p>
    </div>
  );
}

function Pill({
  children,
  text,
}: {
  children: React.ReactNode;
  text: string;
}) {
  return (
    <span
      className="px-3 py-1.5 text-[12px] rounded-full border"
      style={{
        borderColor: `${text}18`,
        backgroundColor: `${text}05`,
        color: `${text}b5`,
        fontFamily: FONT_MONO,
        letterSpacing: "0.02em",
      }}
    >
      {children}
    </span>
  );
}

function TransportButton({
  label,
  arrow,
  disabled,
  onClick,
  text,
  accent,
}: {
  label: string;
  arrow: string;
  disabled: boolean;
  onClick: () => void;
  text: string;
  accent: string;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      whileTap={disabled ? undefined : { scale: 0.96 }}
      whileHover={
        disabled
          ? undefined
          : { backgroundColor: `${accent}18`, borderColor: `${accent}66` }
      }
      transition={{ duration: 0.12 }}
      className="flex items-center gap-1 min-h-9 px-3 rounded-full border text-[11px] uppercase tracking-wider font-bold transition-opacity disabled:opacity-35 disabled:cursor-not-allowed"
      style={{
        borderColor: `${text}22`,
        color: text,
        backgroundColor: `${text}06`,
        fontFamily: FONT_MONO,
      }}
      aria-label={label}
    >
      <span className="text-base leading-none">{arrow === "‹" ? arrow : ""}</span>
      <span className="hidden sm:inline">{label}</span>
      <span className="text-base leading-none">{arrow === "›" ? arrow : ""}</span>
    </motion.button>
  );
}

export default SpatialArchetype;
