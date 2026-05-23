"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
} from "framer-motion";
import { AVAILABLE_THEMES, type ThemeConfig } from "@/data/portfolio-data";

export interface EyeTimelineOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  currentEraId: string;
  onEraSelect: (eraId: string) => void;
}

const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];

function motionForStyle(style: string): Record<string, number[]> {
  switch (style) {
    case "blink":
      return { opacity: [1, 0, 1] };
    case "pulse":
      return { scale: [1, 1.4, 1] };
    case "float":
      return { y: [-4, 4, -4] };
    case "glitch":
      return { x: [-2, 2, -1, 1, 0] };
    case "morph":
      return { scale: [1, 1.2, 1] };
    default:
      return {};
  }
}
const STAGGER_DELAY = 0.045;
const COLOR_KEYS = ["primary", "secondary", "accent", "background", "text"] as const;

function getShadowCSS(
  shadow: ThemeConfig["designTokens"]["shadowStyle"],
  intensity: number,
  color: string,
): React.CSSProperties {
  const i = intensity / 100;
  switch (shadow) {
    case "hard":
      return { boxShadow: `${4 * i}px ${4 * i}px 0 0 ${color}` };
    case "soft":
      return { boxShadow: `0 ${4 * i}px ${16 * i}px rgba(0,0,0,${0.2 * i})` };
    case "glow":
      return { boxShadow: `0 0 ${20 * i}px ${color}40, 0 0 ${40 * i}px ${color}20` };
    case "glass":
      return {
        boxShadow: `0 ${8 * i}px ${32 * i}px rgba(0,0,0,${0.3 * i}), inset 0 1px 0 rgba(255,255,255,0.1)`,
        backdropFilter: "blur(16px)",
      };
    case "neumorphic":
      return {
        boxShadow: `${6 * i}px ${6 * i}px ${12 * i}px rgba(0,0,0,0.3), -${6 * i}px -${6 * i}px ${12 * i}px rgba(255,255,255,0.05)`,
      };
    case "inset":
      return { boxShadow: `inset 0 ${2 * i}px ${8 * i}px rgba(0,0,0,${0.3 * i})` };
    default:
      return {};
  }
}

function fontName(f: string): string {
  return f.split(",")[0].replaceAll('"', "").trim();
}

function SectionDivider({ text, accent }: { text: string; accent: string }) {
  return (
    <div className="flex items-center gap-4 mb-5">
      <div className="h-px flex-1" style={{ backgroundColor: `${accent}18` }} />
      <span
        className="text-[9px] font-mono uppercase tracking-[0.3em] select-none"
        style={{ color: accent }}
      >
        {text}
      </span>
      <div className="h-px flex-1" style={{ backgroundColor: `${accent}18` }} />
    </div>
  );
}

function PaletteSwatch({
  color,
  label,
  textColor,
  radius,
}: {
  color: string;
  label: string;
  textColor: string;
  radius: number;
}) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(color);
    } catch {
      /* noop */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };
  return (
    <motion.button
      onClick={copy}
      className="group relative flex flex-col items-center gap-1.5"
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.12, ease: EASE_OUT }}
    >
      <div
        className="w-14 h-14 md:w-[4.5rem] md:h-[4.5rem] border-2 transition-shadow duration-200 group-hover:shadow-lg"
        style={{
          backgroundColor: color,
          borderColor: `${textColor}15`,
          borderRadius: `${Math.min(radius, 12)}px`,
        }}
      />
      <span
        className="text-[7px] font-mono uppercase tracking-widest"
        style={{ color: `${textColor}55` }}
      >
        {label}
      </span>
      <span
        className="text-[7px] font-mono"
        style={{ color: `${textColor}40` }}
      >
        {color.toUpperCase()}
      </span>
      <AnimatePresence>
        {copied && (
          <motion.span
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.12 }}
            className="absolute -top-6 px-2 py-0.5 text-[7px] font-mono font-bold"
            style={{
              backgroundColor: color,
              color: textColor,
              borderRadius: `${Math.min(radius, 8)}px`,
            }}
          >
            COPIED
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

function EraAtmosphere({ era }: { era: ThemeConfig }) {
  const { effects, gridSize, gridOpacity } = era.designTokens;
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 90% 55% at 50% 12%, ${era.colors.accent}14, transparent)`,
        }}
      />
      {gridSize && gridSize > 0 && (
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(${era.colors.text}08 1px, transparent 1px), linear-gradient(90deg, ${era.colors.text}08 1px, transparent 1px)`,
            backgroundSize: `${gridSize}px ${gridSize}px`,
            opacity: gridOpacity * 0.45,
          }}
        />
      )}
      {(effects.includes("scanlines") || effects.includes("crt-scanlines")) && (
        <div
          className="absolute inset-0"
          style={{
            background:
              "repeating-linear-gradient(0deg, transparent 0px, transparent 2px, rgba(0,0,0,0.05) 2px, rgba(0,0,0,0.05) 3px)",
          }}
        />
      )}
      {(effects.includes("phosphor-glow") || effects.includes("crt-glow")) && (
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse 60% 40% at 50% 40%, ${era.colors.accent}0c, transparent)`,
          }}
        />
      )}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at center, transparent 55%, ${era.colors.background} 100%)`,
        }}
      />
    </div>
  );
}

function Stagger({
  children,
  index,
  reduced,
}: {
  children: React.ReactNode;
  index: number;
  reduced: boolean | null;
}) {
  return (
    <motion.div
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * STAGGER_DELAY,
        duration: 0.28,
        ease: EASE_OUT,
      }}
    >
      {children}
    </motion.div>
  );
}

export const EyeTimelineOverlay: React.FC<EyeTimelineOverlayProps> = ({
  isOpen,
  onClose,
  currentEraId,
  onEraSelect,
}) => {
  const [selectedEraId, setSelectedEraId] = useState(currentEraId);
  const scrollRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (isOpen) {
      setSelectedEraId(currentEraId);
    }
  }, [isOpen, currentEraId]);

  const selectedIndex = AVAILABLE_THEMES.findIndex(
    (e) => e.id === selectedEraId,
  );
  const era = AVAILABLE_THEMES[selectedIndex] || AVAILABLE_THEMES[0];
  const prevEra = selectedIndex > 0 ? AVAILABLE_THEMES[selectedIndex - 1] : null;
  const nextEra =
    selectedIndex < AVAILABLE_THEMES.length - 1
      ? AVAILABLE_THEMES[selectedIndex + 1]
      : null;
  const tokens = era.designTokens;
  const r = Math.min(tokens.borderRadius, 20);

  const shadow = useMemo(
    () =>
      getShadowCSS(
        tokens.shadowStyle,
        tokens.shadowIntensity,
        era.colors.accent,
      ),
    [tokens.shadowStyle, tokens.shadowIntensity, era.colors.accent],
  );

  const selectEra = useCallback(
    (id: string) => {
      if (id !== selectedEraId) {
        setSelectedEraId(id);
        onEraSelect(id);
        scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    [selectedEraId, onEraSelect],
  );

  const goPrev = useCallback(() => {
    if (selectedIndex > 0)
      selectEra(AVAILABLE_THEMES[selectedIndex - 1].id);
  }, [selectedIndex, selectEra]);

  const goNext = useCallback(() => {
    if (selectedIndex < AVAILABLE_THEMES.length - 1)
      selectEra(AVAILABLE_THEMES[selectedIndex + 1].id);
  }, [selectedIndex, selectEra]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    globalThis.addEventListener("keydown", onKey);
    return () => globalThis.removeEventListener("keydown", onKey);
  }, [isOpen, goPrev, goNext, onClose]);

  useEffect(() => {
    if (!timelineRef.current) return;
    const dot = timelineRef.current.querySelector(
      '[data-era-active="true"]',
    ) as HTMLElement | null;
    dot?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [selectedEraId]);

  const typeRows = [
    {
      role: "DISPLAY",
      font: era.fonts.primary,
      sample: "Aa Bb Cc Dd 0123456789",
      cls: "text-2xl md:text-3xl",
    },
    {
      role: "BODY",
      font: era.fonts.secondary,
      sample: "The quick brown fox jumps over the lazy dog.",
      cls: "text-base",
    },
    {
      role: "UI",
      font: era.fonts.accent,
      sample: "BUTTONS · LABELS · INPUTS · FORMS",
      cls: "text-sm",
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: EASE_OUT }}
          className="fixed inset-0 z-[100] flex flex-col"
        >
          {/* ─── Background ─── */}
          <motion.div
            className="absolute inset-0 z-0"
            animate={{ backgroundColor: era.colors.background }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
          <EraAtmosphere era={era} />

          {/* ─── Top bar ─── */}
          <nav
            className="relative z-20 flex items-center justify-between px-4 md:px-6 py-2.5 flex-shrink-0"
            style={{ backgroundColor: `${era.colors.background}88` }}
          >
            <motion.button
              onClick={onClose}
              className="px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider border backdrop-blur-sm"
              style={{
                borderColor: `${era.colors.text}20`,
                color: era.colors.text,
                borderRadius: `${Math.min(r, 6)}px`,
                backgroundColor: `${era.colors.text}06`,
              }}
              whileTap={{ scale: 0.96 }}
              transition={{ duration: 0.1 }}
            >
              ✕ Close
            </motion.button>

            <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1">
              <span
                className="font-mono text-[8px] uppercase tracking-[0.3em]"
                style={{ color: `${era.colors.text}40` }}
              >
                Era
              </span>
            </div>

            <div
              className="flex items-center gap-1 sm:gap-2"
              title="You can also use arrow keys to change era"
            >
              <motion.button
                type="button"
                onClick={goPrev}
                disabled={!prevEra}
                aria-label={
                  prevEra
                    ? `Previous era: ${prevEra.name}`
                    : "Already at the first era"
                }
                className="flex items-center justify-center gap-1 sm:gap-1.5 min-h-10 min-w-10 sm:min-w-[5.25rem] px-2 sm:px-3 font-mono text-[9px] sm:text-[10px] font-bold uppercase tracking-wider border transition-opacity disabled:opacity-35 disabled:cursor-not-allowed disabled:pointer-events-none"
                style={{
                  borderColor: `${era.colors.text}22`,
                  color: era.colors.text,
                  borderRadius: `${Math.min(r, 8)}px`,
                  backgroundColor: `${era.colors.text}08`,
                }}
                whileHover={prevEra ? { backgroundColor: `${era.colors.text}12` } : undefined}
                whileTap={prevEra ? { scale: 0.96 } : undefined}
                transition={{ duration: 0.12 }}
              >
                <span className="text-base leading-none" aria-hidden>
                  ‹
                </span>
                <span className="hidden sm:inline">Prev</span>
              </motion.button>

              <div className="flex flex-col items-center justify-center min-w-[3rem] sm:min-w-[4.5rem] px-1">
                <span
                  className="font-mono text-[10px] sm:text-[11px] tabular-nums font-bold leading-none"
                  style={{ color: era.colors.accent }}
                >
                  {era.id}
                </span>
                <span
                  className="font-mono text-[8px] tabular-nums mt-0.5"
                  style={{ color: `${era.colors.text}45` }}
                >
                  {selectedIndex + 1}
                  <span style={{ opacity: 0.45 }}>/{AVAILABLE_THEMES.length}</span>
                </span>
              </div>

              <motion.button
                type="button"
                onClick={goNext}
                disabled={!nextEra}
                aria-label={
                  nextEra
                    ? `Next era: ${nextEra.name}`
                    : "Already at the latest era"
                }
                className="flex items-center justify-center gap-1 sm:gap-1.5 min-h-10 min-w-10 sm:min-w-[5.25rem] px-2 sm:px-3 font-mono text-[9px] sm:text-[10px] font-bold uppercase tracking-wider border transition-opacity disabled:opacity-35 disabled:cursor-not-allowed disabled:pointer-events-none"
                style={{
                  borderColor: `${era.colors.text}22`,
                  color: era.colors.text,
                  borderRadius: `${Math.min(r, 8)}px`,
                  backgroundColor: `${era.colors.text}08`,
                }}
                whileHover={nextEra ? { backgroundColor: `${era.colors.text}12` } : undefined}
                whileTap={nextEra ? { scale: 0.96 } : undefined}
                transition={{ duration: 0.12 }}
              >
                <span className="hidden sm:inline">Next</span>
                <span className="text-base leading-none" aria-hidden>
                  ›
                </span>
              </motion.button>
            </div>
          </nav>

          {/* ─── Main content ─── */}
          <div
            ref={scrollRef}
            className="relative z-10 flex-1 overflow-y-auto scrollbar-hide"
          >
            <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={selectedEraId}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="max-w-4xl mx-auto px-5 md:px-12 pb-28"
                >
                  {/* ────── HERO ────── */}
                  <Stagger index={0} reduced={reduced}>
                    <div className="pt-6 md:pt-10 pb-6 md:pb-10 text-center">
                      <p
                        className="font-mono text-[9px] uppercase tracking-[0.35em] mb-3"
                        style={{ color: `${era.colors.text}40` }}
                      >
                        Design Era
                      </p>
                      <h1
                        className="font-black leading-[0.85] tracking-tight"
                        style={{
                          fontSize: "clamp(5rem, 15vw, 11rem)",
                          color: era.colors.accent,
                          fontFamily: era.fonts.primary,
                          textShadow:
                            tokens.shadowStyle === "glow"
                              ? `0 0 60px ${era.colors.accent}30`
                              : "none",
                        }}
                      >
                        {era.id}
                      </h1>
                      <h2
                        className="mt-2 font-semibold"
                        style={{
                          fontSize: "clamp(1rem, 2.5vw, 1.5rem)",
                          color: era.colors.text,
                          fontFamily: era.fonts.secondary,
                          letterSpacing: `${tokens.letterSpacing * 0.01}em`,
                        }}
                      >
                        {era.name.split(":")[1]?.trim() || era.name}
                      </h2>
                      <p
                        className="mt-1.5 text-[10px] font-mono uppercase tracking-[0.2em]"
                        style={{ color: `${era.colors.text}40` }}
                      >
                        {era.era}
                      </p>
                      <div className="flex justify-center gap-2 mt-4">
                        <span
                          className="px-2.5 py-1 text-[8px] font-mono uppercase tracking-wider border"
                          style={{
                            borderColor: `${era.colors.accent}35`,
                            color: era.colors.accent,
                            borderRadius: `${Math.min(r, 8)}px`,
                            backgroundColor: `${era.colors.accent}0c`,
                          }}
                        >
                          {era.style}
                        </span>
                      </div>
                    </div>
                  </Stagger>

                  {/* ────── DESCRIPTION ────── */}
                  <Stagger index={1} reduced={reduced}>
                    <p
                      className="text-center text-sm md:text-base max-w-2xl mx-auto mb-10 md:mb-14"
                      style={{
                        color: `${era.colors.text}88`,
                        fontFamily: era.fonts.secondary,
                        lineHeight: tokens.lineHeight,
                      }}
                    >
                      {era.description}
                    </p>
                  </Stagger>

                  {/* ────── PALETTE ────── */}
                  <Stagger index={2} reduced={reduced}>
                    <section className="mb-10 md:mb-14">
                      <SectionDivider
                        text="Palette"
                        accent={era.colors.accent}
                      />
                      <div className="flex flex-wrap justify-center gap-4 md:gap-6">
                        {COLOR_KEYS.map((key) => (
                          <PaletteSwatch
                            key={key}
                            color={era.colors[key]}
                            label={key}
                            textColor={era.colors.text}
                            radius={r}
                          />
                        ))}
                      </div>
                    </section>
                  </Stagger>

                  {/* ────── TYPOGRAPHY ────── */}
                  <Stagger index={3} reduced={reduced}>
                    <section className="mb-10 md:mb-14">
                      <SectionDivider
                        text="Typography"
                        accent={era.colors.accent}
                      />
                      <div className="space-y-4">
                        {typeRows.map((row) => (
                          <div
                            key={row.role}
                            className="p-4 md:p-5 border"
                            style={{
                              borderColor: `${era.colors.text}10`,
                              borderRadius: `${Math.min(r, 12)}px`,
                              backgroundColor: `${era.colors.text}04`,
                            }}
                          >
                            <div className="flex items-baseline gap-2.5 mb-2">
                              <span
                                className="text-[7px] font-mono uppercase tracking-[0.2em]"
                                style={{ color: era.colors.accent }}
                              >
                                {row.role}
                              </span>
                              <span
                                className="text-[8px] font-mono"
                                style={{ color: `${era.colors.text}45` }}
                              >
                                {fontName(row.font)}
                              </span>
                            </div>
                            <p
                              className={row.cls}
                              style={{
                                fontFamily: row.font,
                                color: era.colors.text,
                                lineHeight: tokens.lineHeight,
                                letterSpacing: `${tokens.letterSpacing * 0.01}em`,
                              }}
                            >
                              {row.sample}
                            </p>
                          </div>
                        ))}
                      </div>
                    </section>
                  </Stagger>

                  {/* ────── LIVE COMPONENTS ────── */}
                  <Stagger index={4} reduced={reduced}>
                    <section className="mb-10 md:mb-14">
                      <SectionDivider
                        text="Components"
                        accent={era.colors.accent}
                      />
                      <div
                        className="p-5 md:p-7 border"
                        style={{
                          borderColor: `${era.colors.text}10`,
                          borderRadius: `${Math.min(r + 4, 16)}px`,
                          backgroundColor: `${era.colors.text}03`,
                        }}
                      >
                        <div className="flex flex-wrap gap-3 mb-5">
                          <span
                            className="px-5 py-2.5 text-xs font-bold uppercase border-2 inline-block"
                            style={{
                              backgroundColor: era.colors.accent,
                              borderColor: era.colors.accent,
                              color: era.colors.background,
                              borderRadius: `${r}px`,
                              fontFamily: era.fonts.accent,
                              ...shadow,
                            }}
                          >
                            Primary
                          </span>
                          <span
                            className="px-5 py-2.5 text-xs font-bold uppercase border-2 inline-block"
                            style={{
                              borderColor: era.colors.text,
                              color: era.colors.text,
                              borderRadius: `${r}px`,
                              fontFamily: era.fonts.accent,
                              backgroundColor: "transparent",
                            }}
                          >
                            Secondary
                          </span>
                          <span
                            className="px-3 py-1.5 text-[9px] font-bold uppercase inline-block"
                            style={{
                              backgroundColor: era.colors.primary,
                              color: era.colors.background,
                              borderRadius: `${Math.min(r, 12)}px`,
                              fontFamily: era.fonts.accent,
                            }}
                          >
                            Badge
                          </span>
                          <span
                            className="px-3 py-1.5 text-[9px] border inline-block"
                            style={{
                              borderColor: `${era.colors.text}40`,
                              color: `${era.colors.text}80`,
                              borderRadius: `${Math.min(r, 8)}px`,
                              fontFamily: era.fonts.secondary,
                            }}
                          >
                            #{era.id}
                          </span>
                        </div>

                        <div
                          className="p-4 border-2 mb-4"
                          style={{
                            borderColor: `${era.colors.text}15`,
                            borderRadius: `${r}px`,
                            backgroundColor: `${era.colors.text}05`,
                            ...shadow,
                          }}
                        >
                          <div
                            className="text-sm font-bold mb-1.5"
                            style={{
                              color: era.colors.text,
                              fontFamily: era.fonts.primary,
                            }}
                          >
                            Card Component
                          </div>
                          <div
                            className="text-xs"
                            style={{
                              color: `${era.colors.text}aa`,
                              fontFamily: era.fonts.secondary,
                              lineHeight: tokens.lineHeight,
                            }}
                          >
                            Every component adapts to the era&apos;s visual
                            language — radius, shadow, typography, and spacing
                            all shift together.
                          </div>
                        </div>

                        <div
                          className="border-2 px-3 py-2.5"
                          style={{
                            borderColor: `${era.colors.text}18`,
                            borderRadius: `${Math.min(r, 6)}px`,
                            backgroundColor: `${era.colors.text}04`,
                          }}
                        >
                          <span
                            className="text-xs"
                            style={{
                              color: `${era.colors.text}35`,
                              fontFamily: era.fonts.secondary,
                            }}
                          >
                            Input placeholder text…
                          </span>
                        </div>
                      </div>
                    </section>
                  </Stagger>

                  {/* ────── DESIGN TOKENS ────── */}
                  <Stagger index={5} reduced={reduced}>
                    <section className="mb-10 md:mb-14">
                      <SectionDivider
                        text="Design Tokens"
                        accent={era.colors.accent}
                      />
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {/* Radius */}
                        <TokenCell
                          textColor={era.colors.text}
                          accent={era.colors.accent}
                          r={r}
                          label="Radius"
                          value={`${tokens.borderRadius}px`}
                        >
                          <div
                            className="w-12 h-12 border-2"
                            style={{
                              borderColor: era.colors.accent,
                              borderRadius: `${tokens.borderRadius}px`,
                            }}
                          />
                        </TokenCell>

                        {/* Shadow */}
                        <TokenCell
                          textColor={era.colors.text}
                          accent={era.colors.accent}
                          r={r}
                          label="Shadow"
                          value={tokens.shadowStyle}
                        >
                          <div
                            className="w-12 h-9 border"
                            style={{
                              borderColor: `${era.colors.text}18`,
                              borderRadius: `${Math.min(tokens.borderRadius, 8)}px`,
                              backgroundColor: `${era.colors.text}10`,
                              ...shadow,
                            }}
                          />
                        </TokenCell>

                        {/* Grid */}
                        <TokenCell
                          textColor={era.colors.text}
                          accent={era.colors.accent}
                          r={r}
                          label="Grid"
                          value={tokens.gridSize ? `${tokens.gridSize}px` : "none"}
                        >
                          <div
                            className="w-12 h-12"
                            style={{
                              backgroundImage: tokens.gridSize
                                ? `linear-gradient(${era.colors.accent}30 1px, transparent 1px), linear-gradient(90deg, ${era.colors.accent}30 1px, transparent 1px)`
                                : "none",
                              backgroundSize: tokens.gridSize
                                ? `${Math.min(tokens.gridSize, 12)}px ${Math.min(tokens.gridSize, 12)}px`
                                : "none",
                              backgroundColor: `${era.colors.text}06`,
                              borderRadius: `${Math.min(r, 6)}px`,
                            }}
                          />
                        </TokenCell>

                        {/* Tracking */}
                        <TokenCell
                          textColor={era.colors.text}
                          accent={era.colors.accent}
                          r={r}
                          label="Tracking"
                          value={`${tokens.letterSpacing}`}
                        >
                          <span
                            className="text-lg font-bold"
                            style={{
                              color: era.colors.accent,
                              letterSpacing: `${tokens.letterSpacing * 0.04}em`,
                              fontFamily: era.fonts.primary,
                            }}
                          >
                            Aa
                          </span>
                        </TokenCell>

                        {/* Line Height */}
                        <TokenCell
                          textColor={era.colors.text}
                          accent={era.colors.accent}
                          r={r}
                          label="Leading"
                          value={`${tokens.lineHeight}`}
                        >
                          <div
                            className="text-[9px] font-mono text-center"
                            style={{
                              color: `${era.colors.text}55`,
                              lineHeight: tokens.lineHeight,
                            }}
                          >
                            Line&nbsp;1
                            <br />
                            Line&nbsp;2
                            <br />
                            Line&nbsp;3
                          </div>
                        </TokenCell>

                        {/* Animation */}
                        <TokenCell
                          textColor={era.colors.text}
                          accent={era.colors.accent}
                          r={r}
                          label="Motion"
                          value={tokens.animationStyle}
                        >
                          <motion.div
                            className="w-3 h-3"
                            style={{
                              backgroundColor: era.colors.accent,
                              borderRadius:
                                tokens.animationStyle === "morph"
                                  ? "50%"
                                  : `${Math.min(r, 4)}px`,
                            }}
                            animate={motionForStyle(tokens.animationStyle)}
                            transition={{
                              repeat: Infinity,
                              duration: 1.5,
                              ease: "easeInOut",
                            }}
                          />
                        </TokenCell>
                      </div>
                    </section>
                  </Stagger>

                  {/* ────── EFFECTS ────── */}
                  {tokens.effects.length > 0 && (
                    <Stagger index={6} reduced={reduced}>
                      <section className="mb-10 md:mb-14">
                        <SectionDivider
                          text="Effects"
                          accent={era.colors.accent}
                        />
                        <div className="flex flex-wrap justify-center gap-2">
                          {tokens.effects.map((effect) => (
                            <span
                              key={effect}
                              className="px-3 py-1.5 text-[8px] font-mono uppercase tracking-wider border"
                              style={{
                                borderColor: `${era.colors.text}15`,
                                color: `${era.colors.text}65`,
                                borderRadius: `${Math.min(r, 8)}px`,
                                backgroundColor: `${era.colors.text}05`,
                              }}
                            >
                              {effect}
                            </span>
                          ))}
                        </div>
                      </section>
                    </Stagger>
                  )}

                  {/* ────── LESSON ────── */}
                  <Stagger index={7} reduced={reduced}>
                    <section className="mb-10 md:mb-14">
                      <div
                        className="p-6 md:p-8 border text-center"
                        style={{
                          borderColor: `${era.colors.accent}18`,
                          borderRadius: `${Math.min(r + 4, 16)}px`,
                          backgroundColor: `${era.colors.accent}08`,
                        }}
                      >
                        <p
                          className="text-[8px] font-mono uppercase tracking-[0.3em] mb-3"
                          style={{ color: era.colors.accent }}
                        >
                          Lesson
                        </p>
                        <p
                          className="text-sm md:text-base italic max-w-lg mx-auto"
                          style={{
                            color: era.colors.text,
                            fontFamily: era.fonts.secondary,
                            lineHeight: tokens.lineHeight,
                          }}
                        >
                          &ldquo;{era.lesson}&rdquo;
                        </p>
                      </div>
                    </section>
                  </Stagger>

                  {/* ────── KEY ELEMENTS ────── */}
                  <Stagger index={8} reduced={reduced}>
                    <section className="mb-6">
                      <SectionDivider
                        text="Key Elements"
                        accent={era.colors.accent}
                      />
                      <div className="flex flex-wrap justify-center gap-2">
                        {era.keyElements.map((el) => (
                          <span
                            key={el}
                            className="px-3 py-2 text-[9px] font-mono border"
                            style={{
                              borderColor: `${era.colors.text}12`,
                              color: `${era.colors.text}75`,
                              borderRadius: `${Math.min(r, 8)}px`,
                              backgroundColor: `${era.colors.text}04`,
                            }}
                          >
                            {el}
                          </span>
                        ))}
                      </div>
                    </section>
                  </Stagger>
                </motion.div>
              </AnimatePresence>
          </div>

          {/* ─── Bottom nav ─── */}
          <div
            className="relative z-20 border-t flex-shrink-0 backdrop-blur-md"
            style={{
              borderColor: `${era.colors.text}0c`,
              backgroundColor: `${era.colors.background}dd`,
            }}
          >
            <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 px-4 md:px-6 py-2.5">
              <div
                ref={timelineRef}
                role="tablist"
                aria-label="Jump to a design era"
                className="flex-1 flex items-center gap-1.5 overflow-x-auto scrollbar-hide py-1 -mx-1 px-1 scroll-px-3 snap-x snap-mandatory"
              >
                {AVAILABLE_THEMES.map((t) => {
                  const active = t.id === selectedEraId;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      data-era-active={active}
                      onClick={() => selectEra(t.id)}
                      title={t.name}
                      aria-label={`${t.name}${active ? ", current" : ""}`}
                      className="flex-shrink-0 snap-center min-h-10 min-w-10 px-2.5 sm:px-3 font-mono text-[10px] sm:text-[11px] font-bold tabular-nums border-2 transition-[color,background-color,border-color,transform] duration-150 hover:brightness-110 active:scale-[0.97]"
                      style={{
                        borderRadius: `${Math.min(r, 8)}px`,
                        borderColor: active
                          ? era.colors.accent
                          : `${era.colors.text}18`,
                        backgroundColor: active
                          ? era.colors.accent
                          : `${era.colors.text}06`,
                        color: active
                          ? era.colors.background
                          : `${era.colors.text}70`,
                        boxShadow: active
                          ? `0 0 0 1px ${era.colors.accent}40, 0 2px 10px ${era.colors.accent}22`
                          : undefined,
                      }}
                    >
                      {t.id}
                    </button>
                  );
                })}
              </div>

              <span
                className="text-[8px] font-mono uppercase tracking-wider hidden sm:block flex-shrink-0 sm:text-right sm:max-w-[5.5rem]"
                style={{ color: `${era.colors.text}38` }}
              >
                Tap a year · keys ← →
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

function TokenCell({
  children,
  textColor,
  accent,
  r,
  label,
  value,
}: {
  children: React.ReactNode;
  textColor: string;
  accent: string;
  r: number;
  label: string;
  value: string;
}) {
  return (
    <div
      className="p-4 border flex flex-col items-center gap-2.5"
      style={{
        borderColor: `${textColor}0c`,
        backgroundColor: `${textColor}03`,
        borderRadius: `${Math.min(r, 12)}px`,
      }}
    >
      <div className="h-12 flex items-center justify-center">{children}</div>
      <span
        className="text-[7px] font-mono uppercase tracking-wide"
        style={{ color: `${textColor}55` }}
      >
        {label}
      </span>
      <span
        className="text-[9px] font-mono font-bold"
        style={{ color: accent }}
      >
        {value}
      </span>
    </div>
  );
}
