"use client";

/**
 * SimpleGameNav — minimal bar: KIRUK.IN, ERA, Works → /portfolio, Menu (maze nav), clock.
 * Floated strip; compact after debounced scroll-down, expands on scroll-up / hover (delayed leave).
 * Game menu also: Shift+M.
 */

import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useLayoutEffect,
  useCallback,
} from "react";
import {
  motion,
  AnimatePresence,
  LayoutGroup,
  useReducedMotion,
} from "framer-motion";
import { useRouter, usePathname } from "next/navigation";
import { Press_Start_2P } from "next/font/google";
import { GRID_SIZE, cn } from "@/lib/utils";
import { useDesignEra } from "@/contexts/DesignEraContext";
import { useGameMode } from "@/contexts/GameModeContext";
import { AVAILABLE_THEMES, type ThemeConfig } from "@/data/portfolio-data";
import { GameMenuOverlay } from "./GameMenuOverlay";
import { CustomizationLab } from "@/components/ui/design-lab/CustomizationLab";

const fontPixelBrand = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  adjustFontFallback: true,
});

/** Layout sync: floated nav (`pt-3`) + bar + soft shadow clearance */
export const SIMPLE_GAME_NAV_FLOAT_TOP_PX = 12;
export const SIMPLE_GAME_NAV_BAR_HEIGHT_PX = GRID_SIZE * 3;
/** `DynamicContextBar` fixed `top` — directly under the nav bar box */
export const SIMPLE_GAME_NAV_CONTEXT_BAR_TOP_PX =
  SIMPLE_GAME_NAV_FLOAT_TOP_PX + SIMPLE_GAME_NAV_BAR_HEIGHT_PX;
/** `<main>` padding to clear nav + soft elevation + gap */
export const SIMPLE_GAME_NAV_CONTENT_OFFSET_PX =
  SIMPLE_GAME_NAV_FLOAT_TOP_PX + SIMPLE_GAME_NAV_BAR_HEIGHT_PX + 10;

/** Set on `document.documentElement` from SimpleGameNav (viewport px); fallback in consumers. */
export const SIMPLE_GAME_NAV_BOTTOM_CSS_VAR = "--simple-game-nav-bottom";

function navHaptic(kind: "tap" | "confirm" = "tap") {
  if (
    typeof navigator === "undefined" ||
    typeof navigator.vibrate !== "function"
  )
    return;
  if (globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches)
    return;
  if (kind === "confirm") navigator.vibrate([10, 6, 14]);
  else navigator.vibrate(11);
}

/** Stepped 0→1 easing: discrete plateaus (pixel/CRT feel, no spring overshoot). */
function pixelStepEase(steps: number): (t: number) => number {
  const n = Math.max(2, Math.round(steps));
  return (t: number) => Math.min(1, Math.floor(t * n) / n);
}

// ═══════════════════════════════════════════════════════════════════════════════
// GIANT EYE OVERLAY - Timeline of design eras
// ═══════════════════════════════════════════════════════════════════════════════

interface EyeTimelineOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  currentEraId: string;
  onEraSelect: (eraId: string) => void;
}

// TOKEN DIFF COMPUTATION
// ═══════════════════════════════════════════════════════════════════════════════

interface DiffEntry {
  label: string;
  oldValue: string;
  newValue: string;
  type: "color" | "font" | "token" | "effect";
}

function getShadowStyle(
  shadowType: ThemeConfig["designTokens"]["shadowStyle"],
  intensity: number,
  color: string,
): React.CSSProperties {
  const i = intensity / 100;
  switch (shadowType) {
    case "hard":
      return { boxShadow: `${4 * i}px ${4 * i}px 0px 0px ${color}` };
    case "soft":
      return { boxShadow: `0 ${4 * i}px ${16 * i}px rgba(0,0,0,${0.2 * i})` };
    case "glow":
      return {
        boxShadow: `0 0 ${20 * i}px ${color}40, 0 0 ${40 * i}px ${color}20`,
      };
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
      return {
        boxShadow: `inset 0 ${2 * i}px ${8 * i}px rgba(0,0,0,${0.3 * i})`,
      };
    default:
      return {};
  }
}

function computeTokenDiff(
  prevEra: ThemeConfig,
  nextEra: ThemeConfig,
): DiffEntry[] {
  const diffs: DiffEntry[] = [];

  // Colors
  const colorKeys = [
    "primary",
    "secondary",
    "accent",
    "background",
    "text",
  ] as const;
  for (const key of colorKeys) {
    if (prevEra.colors[key] !== nextEra.colors[key]) {
      diffs.push({
        label: `colors.${key}`,
        oldValue: prevEra.colors[key],
        newValue: nextEra.colors[key],
        type: "color",
      });
    }
  }

  // Fonts
  const fontKeys = ["primary", "secondary", "accent"] as const;
  const fontLabels = {
    primary: "font-display",
    secondary: "font-text",
    accent: "font-ui",
  };
  for (const key of fontKeys) {
    const prev = prevEra.fonts[key].split(",")[0].replace(/"/g, "").trim();
    const next = nextEra.fonts[key].split(",")[0].replace(/"/g, "").trim();
    if (prev !== next) {
      diffs.push({
        label: fontLabels[key],
        oldValue: prev,
        newValue: next,
        type: "font",
      });
    }
  }

  // Style
  if (prevEra.style !== nextEra.style) {
    diffs.push({
      label: "style",
      oldValue: prevEra.style,
      newValue: nextEra.style,
      type: "token",
    });
  }

  // Design tokens
  const pt = prevEra.designTokens;
  const nt = nextEra.designTokens;

  if (pt.borderRadius !== nt.borderRadius)
    diffs.push({
      label: "border-radius",
      oldValue: `${pt.borderRadius}px`,
      newValue: `${nt.borderRadius}px`,
      type: "token",
    });
  if (pt.shadowStyle !== nt.shadowStyle)
    diffs.push({
      label: "shadow-style",
      oldValue: pt.shadowStyle,
      newValue: nt.shadowStyle,
      type: "token",
    });
  if (pt.shadowIntensity !== nt.shadowIntensity)
    diffs.push({
      label: "shadow-intensity",
      oldValue: `${pt.shadowIntensity}%`,
      newValue: `${nt.shadowIntensity}%`,
      type: "token",
    });
  if ((pt.gridSize ?? 0) !== (nt.gridSize ?? 0))
    diffs.push({
      label: "grid-size",
      oldValue: pt.gridSize ? `${pt.gridSize}px` : "none",
      newValue: nt.gridSize ? `${nt.gridSize}px` : "none",
      type: "token",
    });
  if (pt.letterSpacing !== nt.letterSpacing)
    diffs.push({
      label: "letter-spacing",
      oldValue: `${pt.letterSpacing}`,
      newValue: `${nt.letterSpacing}`,
      type: "token",
    });
  if (pt.lineHeight !== nt.lineHeight)
    diffs.push({
      label: "line-height",
      oldValue: `${pt.lineHeight}`,
      newValue: `${nt.lineHeight}`,
      type: "token",
    });
  if (pt.animationStyle !== nt.animationStyle)
    diffs.push({
      label: "animation",
      oldValue: pt.animationStyle,
      newValue: nt.animationStyle,
      type: "token",
    });

  // Effects diff
  const prevEffects = new Set(pt.effects);
  const nextEffects = new Set(nt.effects);
  const added = nt.effects.filter((e) => !prevEffects.has(e));
  const removed = pt.effects.filter((e) => !nextEffects.has(e));
  if (added.length > 0)
    diffs.push({
      label: "effects-added",
      oldValue: "",
      newValue: added.join(", "),
      type: "effect",
    });
  if (removed.length > 0)
    diffs.push({
      label: "effects-removed",
      oldValue: removed.join(", "),
      newValue: "",
      type: "effect",
    });

  return diffs;
}

// ═══════════════════════════════════════════════════════════════════════════════
// COLOR SWATCH (click to copy)
// ═══════════════════════════════════════════════════════════════════════════════

function LabColorSwatch({
  color,
  label,
  borderRadius,
  labelColor = "var(--text-muted)",
  valueColor = "var(--text-main)",
  borderColor = "var(--border-color)",
}: {
  color: string;
  label: string;
  borderRadius: number;
  labelColor?: string;
  valueColor?: string;
  borderColor?: string;
}) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(color);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };
  return (
    <motion.button
      onClick={handleCopy}
      className="relative group flex flex-col items-center gap-1"
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
    >
      <div
        className="w-8 h-8 lg:w-10 lg:h-10 border-2 hover:border-[var(--accent-color)] transition-all"
        style={{
          backgroundColor: color,
          borderColor,
          borderRadius: `${Math.min(borderRadius, 4)}px`,
        }}
      />
      <span
        className="text-[7px] font-mono uppercase"
        style={{ color: labelColor }}
      >
        {label}
      </span>
      <span
        className="text-[6px] lg:text-[7px] font-mono"
        style={{ color: valueColor }}
      >
        {color.toUpperCase()}
      </span>
      <AnimatePresence>
        {copied && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute -top-5 px-1.5 py-0.5 text-[7px] font-mono bg-[var(--accent-color)] text-[var(--bg-main)]"
            style={{ borderRadius: `${borderRadius}px` }}
          >
            COPIED
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// EYE TIMELINE OVERLAY - Notebook Explorer
// ═══════════════════════════════════════════════════════════════════════════════

const EyeTimelineOverlay: React.FC<EyeTimelineOverlayProps> = ({
  isOpen,
  onClose,
  currentEraId,
  onEraSelect,
}) => {
  const [selectedEraId, setSelectedEraId] = useState<string>(currentEraId);
  const [showLab, setShowLab] = useState(false);
  const [turnDirection, setTurnDirection] = useState<1 | -1>(1);

  useEffect(() => {
    if (isOpen) {
      setSelectedEraId(currentEraId);
      setShowLab(false);
    }
  }, [isOpen, currentEraId]);

  const selectedIndex = AVAILABLE_THEMES.findIndex(
    (e) => e.id === selectedEraId,
  );
  const selectedEra = AVAILABLE_THEMES[selectedIndex] || AVAILABLE_THEMES[0];
  const previousEra =
    AVAILABLE_THEMES[Math.max(0, selectedIndex - 1)] || selectedEra;
  const nextEra =
    AVAILABLE_THEMES[
      Math.min(AVAILABLE_THEMES.length - 1, selectedIndex + 1)
    ] || selectedEra;

  const shadowCSS = useMemo(
    () =>
      getShadowStyle(
        selectedEra.designTokens.shadowStyle,
        selectedEra.designTokens.shadowIntensity,
        selectedEra.colors.accent,
      ),
    [selectedEra],
  );

  const selectEra = (newEraId: string, direction?: 1 | -1) => {
    if (newEraId !== selectedEraId) {
      const targetIndex = AVAILABLE_THEMES.findIndex((e) => e.id === newEraId);
      setTurnDirection(direction ?? (targetIndex >= selectedIndex ? 1 : -1));
      setSelectedEraId(newEraId);
      onEraSelect(newEraId);
    }
  };

  const navigatePrevious = () => {
    if (selectedIndex > 0) {
      selectEra(AVAILABLE_THEMES[selectedIndex - 1].id, -1);
    }
  };

  const navigateNext = () => {
    if (selectedIndex < AVAILABLE_THEMES.length - 1) {
      selectEra(AVAILABLE_THEMES[selectedIndex + 1].id, 1);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        navigatePrevious();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        navigateNext();
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    globalThis.addEventListener("keydown", handleKeyDown);
    return () => globalThis.removeEventListener("keydown", handleKeyDown);
  });

  const tokens = selectedEra.designTokens;
  const borderRadius = Math.min(tokens.borderRadius, 16);
  const colorKeys = [
    "primary",
    "secondary",
    "accent",
    "background",
    "text",
  ] as const;
  const typeRows = [
    { label: "Display", font: selectedEra.fonts.primary },
    { label: "Text", font: selectedEra.fonts.secondary },
    { label: "UI", font: selectedEra.fonts.accent },
  ];
  const notebookDiff = computeTokenDiff(previousEra, selectedEra).slice(0, 6);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[100] flex flex-col"
          style={{
            background:
              "linear-gradient(180deg, color-mix(in srgb, var(--bg-main) 92%, white 8%) 0%, var(--bg-main) 100%)",
          }}
        >
          <div className="flex items-center gap-3 px-4 md:px-6 py-3 border-b border-[var(--border-color)] bg-[var(--bg-card)]/90 backdrop-blur-sm flex-shrink-0">
            <motion.button
              onClick={onClose}
              className="px-3 py-1.5 font-mono text-xs border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:border-[var(--text-main)] transition-all flex-shrink-0"
              style={{ borderRadius: `${Math.min(borderRadius, 6)}px` }}
              whileTap={{ scale: 0.95 }}
            >
              × Close
            </motion.button>

            <div className="flex-1 min-w-0 flex items-center justify-center gap-2 md:gap-4">
              <motion.button
                onClick={navigatePrevious}
                disabled={selectedIndex === 0}
                className="px-2.5 py-1 font-mono text-xs border border-[var(--border-color)] flex-shrink-0 transition-opacity"
                style={{
                  borderRadius: `${Math.min(borderRadius, 6)}px`,
                  color: "var(--text-main)",
                  opacity: selectedIndex === 0 ? 0.2 : 1,
                }}
                whileHover={selectedIndex > 0 ? { scale: 1.06 } : {}}
                whileTap={selectedIndex > 0 ? { scale: 0.94 } : {}}
              >
                ←
              </motion.button>

              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedEraId + "-notebook-header"}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.16 }}
                  className="flex items-baseline justify-center gap-2.5 flex-wrap text-center min-w-0"
                >
                  <span
                    className="font-mono text-[10px] uppercase tracking-[0.25em]"
                    style={{ color: "var(--text-muted)" }}
                  >
                    design notebook
                  </span>
                  <span
                    className="font-mono text-lg md:text-xl font-black leading-none"
                    style={{
                      color: selectedEra.colors.accent,
                      fontFamily: selectedEra.fonts.primary,
                    }}
                  >
                    {selectedEra.id}
                  </span>
                  <span
                    className="font-mono text-[10px] truncate"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {selectedEra.name.split(":")[1]?.trim() || selectedEra.name}
                  </span>
                </motion.div>
              </AnimatePresence>

              <motion.button
                onClick={navigateNext}
                disabled={selectedIndex === AVAILABLE_THEMES.length - 1}
                className="px-2.5 py-1 font-mono text-xs border border-[var(--border-color)] flex-shrink-0 transition-opacity"
                style={{
                  borderRadius: `${Math.min(borderRadius, 6)}px`,
                  color: "var(--text-main)",
                  opacity:
                    selectedIndex === AVAILABLE_THEMES.length - 1 ? 0.2 : 1,
                }}
                whileHover={
                  selectedIndex < AVAILABLE_THEMES.length - 1
                    ? { scale: 1.06 }
                    : {}
                }
                whileTap={
                  selectedIndex < AVAILABLE_THEMES.length - 1
                    ? { scale: 0.94 }
                    : {}
                }
              >
                →
              </motion.button>
            </div>

            <div className="flex-shrink-0 text-right">
              <p
                className="font-mono text-[10px]"
                style={{ color: "var(--text-muted)" }}
              >
                {selectedIndex + 1}
                <span className="opacity-40">/{AVAILABLE_THEMES.length}</span>
              </p>
              <p
                className="font-mono text-[9px] font-bold"
                style={{ color: "var(--accent-color)" }}
              >
                live era
              </p>
            </div>
          </div>

          <div className="flex-1 overflow-hidden p-3 md:p-5 lg:p-6">
            <div
              className="h-full overflow-hidden border border-[var(--border-color)] shadow-[0_18px_60px_rgba(0,0,0,0.18)]"
              style={{
                borderRadius: `${Math.min(borderRadius + 8, 24)}px`,
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(250,248,243,0.98) 100%)",
              }}
            >
              <div className="flex h-full flex-col md:flex-row">
                <div
                  className="relative w-full md:w-1/2 border-b md:border-b-0 md:border-r border-[rgba(255,255,255,0.08)] overflow-hidden"
                  style={{ perspective: "1800px" }}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={selectedEraId + "-left-page"}
                      className="absolute inset-0 overflow-y-auto"
                      initial={{
                        opacity: 0,
                        rotateY: turnDirection > 0 ? -18 : 18,
                        x: turnDirection > 0 ? 40 : -40,
                        transformOrigin:
                          turnDirection > 0 ? "left center" : "right center",
                      }}
                      animate={{
                        opacity: 1,
                        rotateY: 0,
                        x: 0,
                        transformOrigin:
                          turnDirection > 0 ? "left center" : "right center",
                      }}
                      exit={{
                        opacity: 0,
                        rotateY: turnDirection > 0 ? 14 : -14,
                        x: turnDirection > 0 ? -24 : 24,
                        transformOrigin:
                          turnDirection > 0 ? "right center" : "left center",
                      }}
                      transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
                      style={{
                        transformStyle: "preserve-3d",
                        background:
                          "repeating-linear-gradient(180deg, rgba(18,18,18,0.02) 0px, rgba(18,18,18,0.02) 1px, transparent 1px, transparent 32px)",
                      }}
                    >
                      <motion.div
                        className="absolute inset-0"
                        animate={{
                          backgroundColor: selectedEra.colors.background,
                        }}
                        transition={{ duration: 0.45, ease: "easeInOut" }}
                        style={{ opacity: 0.96 }}
                      />

                      {tokens.gridSize && tokens.gridSize > 0 && (
                        <motion.div
                          className="absolute inset-0 pointer-events-none"
                          animate={{ opacity: tokens.gridOpacity * 0.28 }}
                          transition={{ duration: 0.45 }}
                          style={{
                            backgroundImage: `linear-gradient(${selectedEra.colors.text} 1px, transparent 1px), linear-gradient(90deg, ${selectedEra.colors.text} 1px, transparent 1px)`,
                            backgroundSize: `${tokens.gridSize}px ${tokens.gridSize}px`,
                          }}
                        />
                      )}

                      <div className="absolute left-5 top-0 bottom-0 w-px bg-[rgba(255,90,90,0.22)]" />

                      <div className="relative z-10 min-h-full px-8 md:px-10 py-8 md:py-10 flex flex-col gap-6">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p
                              className="font-mono text-[9px] uppercase tracking-[0.3em] mb-2"
                              style={{ color: selectedEra.colors.accent }}
                            >
                              Preview Spread
                            </p>
                            <AnimatePresence mode="wait">
                              <motion.p
                                key={selectedEraId + "-slug"}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.48 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.18 }}
                                className="font-mono text-[9px] uppercase tracking-[0.2em]"
                                style={{ color: selectedEra.colors.accent }}
                              >
                                {selectedEra.era}
                              </motion.p>
                            </AnimatePresence>
                          </div>
                          <span
                            className="px-2 py-1 text-[8px] font-mono uppercase border"
                            style={{
                              color: selectedEra.colors.text,
                              borderColor: `${selectedEra.colors.text}35`,
                              borderRadius: `${Math.min(borderRadius, 10)}px`,
                              backgroundColor: `${selectedEra.colors.text}08`,
                            }}
                          >
                            {selectedEra.style}
                          </span>
                        </div>

                        <AnimatePresence mode="wait">
                          <motion.h2
                            key={selectedEraId + "-title"}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.22 }}
                            className="font-bold leading-tight"
                            style={{
                              color: selectedEra.colors.text,
                              fontFamily: selectedEra.fonts.primary,
                              fontSize: "clamp(1.8rem, 4vw, 3.25rem)",
                              letterSpacing: `${tokens.letterSpacing * 0.01}em`,
                              lineHeight: tokens.lineHeight,
                            }}
                          >
                            Design System Lab
                          </motion.h2>
                        </AnimatePresence>

                        <AnimatePresence mode="wait">
                          <motion.p
                            key={selectedEraId + "-body"}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.78 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.22, delay: 0.04 }}
                            className="max-w-2xl"
                            style={{
                              color: selectedEra.colors.text,
                              fontFamily: selectedEra.fonts.secondary,
                              fontSize: "clamp(0.92rem, 1.5vw, 1.15rem)",
                              lineHeight: tokens.lineHeight,
                            }}
                          >
                            A notebook view of this era&apos;s visual language.
                            Every switch applies instantly, so you can read the
                            system like a chapter instead of scrubbing through a
                            slider.
                          </motion.p>
                        </AnimatePresence>

                        <div className="flex flex-wrap gap-2 items-center">
                          <motion.button
                            className="px-4 py-2 text-xs font-bold uppercase border-2"
                            animate={{
                              backgroundColor: selectedEra.colors.accent,
                              borderColor: selectedEra.colors.accent,
                              color: selectedEra.colors.background,
                              borderRadius: borderRadius,
                            }}
                            transition={{ duration: 0.45, ease: "easeInOut" }}
                            style={{
                              ...shadowCSS,
                              fontFamily: selectedEra.fonts.accent,
                            }}
                          >
                            Primary
                          </motion.button>

                          <motion.button
                            className="px-4 py-2 text-xs font-bold uppercase border-2"
                            animate={{
                              borderColor: selectedEra.colors.text,
                              color: selectedEra.colors.text,
                              borderRadius: borderRadius,
                              backgroundColor: "transparent",
                            }}
                            transition={{ duration: 0.45, ease: "easeInOut" }}
                            style={{ fontFamily: selectedEra.fonts.accent }}
                          >
                            Secondary
                          </motion.button>

                          <motion.span
                            className="px-2.5 py-1 text-[9px] font-bold uppercase"
                            animate={{
                              backgroundColor: selectedEra.colors.primary,
                              color: selectedEra.colors.background,
                              borderRadius: Math.min(borderRadius, 12),
                            }}
                            transition={{ duration: 0.45, ease: "easeInOut" }}
                            style={{ fontFamily: selectedEra.fonts.accent }}
                          >
                            Badge
                          </motion.span>

                          <motion.span
                            className="px-2.5 py-1 text-[9px] border"
                            animate={{
                              borderColor: `${selectedEra.colors.text}55`,
                              color: `${selectedEra.colors.text}88`,
                              borderRadius: Math.min(borderRadius, 8),
                            }}
                            transition={{ duration: 0.45, ease: "easeInOut" }}
                            style={{ fontFamily: selectedEra.fonts.secondary }}
                          >
                            #{selectedEra.id}
                          </motion.span>
                        </div>

                        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(240px,0.8fr)]">
                          <motion.div
                            className="p-5 border-2"
                            animate={{
                              borderColor: `${selectedEra.colors.text}22`,
                              backgroundColor: `${selectedEra.colors.text}08`,
                              borderRadius: borderRadius,
                            }}
                            transition={{ duration: 0.45, ease: "easeInOut" }}
                            style={shadowCSS}
                          >
                            <div
                              className="text-sm font-bold mb-2"
                              style={{
                                color: selectedEra.colors.text,
                                fontFamily: selectedEra.fonts.primary,
                              }}
                            >
                              Notebook Card
                            </div>
                            <div
                              className="text-xs opacity-75 mb-4"
                              style={{
                                color: selectedEra.colors.text,
                                fontFamily: selectedEra.fonts.secondary,
                                lineHeight: tokens.lineHeight,
                              }}
                            >
                              Components reshape with each era — typography,
                              radius, shadows, spacing, and motion all update as
                              one system.
                            </div>
                            <div className="space-y-2">
                              <motion.div
                                className="border-2 px-3 py-2.5"
                                animate={{
                                  borderColor: `${selectedEra.colors.text}28`,
                                  borderRadius: Math.min(borderRadius, 6),
                                }}
                                transition={{
                                  duration: 0.45,
                                  ease: "easeInOut",
                                }}
                                style={{
                                  backgroundColor: `${selectedEra.colors.text}05`,
                                }}
                              >
                                <span
                                  className="text-xs opacity-35"
                                  style={{
                                    color: selectedEra.colors.text,
                                    fontFamily: selectedEra.fonts.secondary,
                                  }}
                                >
                                  Notebook input placeholder text…
                                </span>
                              </motion.div>
                              <div className="flex flex-wrap gap-2">
                                {tokens.effects.slice(0, 3).map((effect, i) => (
                                  <span
                                    key={i}
                                    className="px-2 py-1 text-[8px] font-mono uppercase border"
                                    style={{
                                      borderColor: `${selectedEra.colors.text}30`,
                                      color: `${selectedEra.colors.text}75`,
                                      borderRadius: `${Math.min(borderRadius, 6)}px`,
                                    }}
                                  >
                                    {effect}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </motion.div>

                          <div className="flex flex-col gap-3">
                            <div
                              className="p-4 border"
                              style={{
                                borderColor: `${selectedEra.colors.text}20`,
                                borderRadius: `${Math.min(borderRadius, 12)}px`,
                                backgroundColor: `${selectedEra.colors.text}06`,
                              }}
                            >
                              <p
                                className="font-mono text-[8px] uppercase tracking-[0.18em] mb-2"
                                style={{ color: selectedEra.colors.accent }}
                              >
                                Era Notes
                              </p>
                              <div className="space-y-2">
                                {notebookDiff.length > 0 ? (
                                  notebookDiff.map((diff) => (
                                    <div
                                      key={diff.label}
                                      className="flex items-start justify-between gap-3 text-[10px]"
                                      style={{
                                        color: selectedEra.colors.text,
                                        fontFamily: selectedEra.fonts.secondary,
                                      }}
                                    >
                                      <span className="uppercase opacity-55">
                                        {diff.label}
                                      </span>
                                      <span className="text-right font-mono opacity-80">
                                        {diff.newValue || diff.oldValue}
                                      </span>
                                    </div>
                                  ))
                                ) : (
                                  <div
                                    className="text-[10px] opacity-70"
                                    style={{
                                      color: selectedEra.colors.text,
                                      fontFamily: selectedEra.fonts.secondary,
                                    }}
                                  >
                                    This chapter opens the notebook with the
                                    baseline visual language for the system.
                                  </div>
                                )}
                              </div>
                            </div>

                            <div
                              className="p-4 border"
                              style={{
                                borderColor: `${selectedEra.colors.text}20`,
                                borderRadius: `${Math.min(borderRadius, 12)}px`,
                                backgroundColor: `${selectedEra.colors.text}04`,
                              }}
                            >
                              <p
                                className="font-mono text-[8px] uppercase tracking-[0.18em] mb-2"
                                style={{ color: selectedEra.colors.accent }}
                              >
                                Nearby Chapters
                              </p>
                              <div
                                className="space-y-1.5 text-[10px]"
                                style={{
                                  color: selectedEra.colors.text,
                                  fontFamily: selectedEra.fonts.secondary,
                                }}
                              >
                                <div className="flex items-center justify-between gap-2 opacity-60">
                                  <span>Previous</span>
                                  <span className="font-mono">
                                    {selectedIndex > 0 ? previousEra.id : "—"}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between gap-2">
                                  <span>Current</span>
                                  <span
                                    className="font-mono font-bold"
                                    style={{ color: selectedEra.colors.accent }}
                                  >
                                    {selectedEra.id}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between gap-2 opacity-60">
                                  <span>Next</span>
                                  <span className="font-mono">
                                    {selectedIndex < AVAILABLE_THEMES.length - 1
                                      ? nextEra.id
                                      : "—"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>

                <div
                  className="relative w-full md:w-1/2 flex flex-col overflow-hidden border-t md:border-t-0 md:border-l border-[rgba(255,255,255,0.08)]"
                  style={{ perspective: "1800px" }}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={selectedEraId + "-right-page"}
                      className="absolute inset-0 flex flex-col overflow-hidden"
                      initial={{
                        opacity: 0,
                        rotateY: turnDirection > 0 ? 18 : -18,
                        x: turnDirection > 0 ? -40 : 40,
                        transformOrigin:
                          turnDirection > 0 ? "right center" : "left center",
                      }}
                      animate={{
                        opacity: 1,
                        rotateY: 0,
                        x: 0,
                        transformOrigin:
                          turnDirection > 0 ? "right center" : "left center",
                      }}
                      exit={{
                        opacity: 0,
                        rotateY: turnDirection > 0 ? -14 : 14,
                        x: turnDirection > 0 ? 24 : -24,
                        transformOrigin:
                          turnDirection > 0 ? "left center" : "right center",
                      }}
                      transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
                      style={{
                        transformStyle: "preserve-3d",
                        background:
                          "repeating-linear-gradient(180deg, rgba(18,18,18,0.02) 0px, rgba(18,18,18,0.02) 1px, transparent 1px, transparent 32px)",
                      }}
                    >
                      <motion.div
                        className="absolute inset-0"
                        animate={{
                          backgroundColor: selectedEra.colors.background,
                        }}
                        transition={{ duration: 0.45, ease: "easeInOut" }}
                        style={{ opacity: 0.96 }}
                      />

                      {tokens.gridSize && tokens.gridSize > 0 && (
                        <motion.div
                          className="absolute inset-0 pointer-events-none"
                          animate={{ opacity: tokens.gridOpacity * 0.18 }}
                          transition={{ duration: 0.45 }}
                          style={{
                            backgroundImage: `linear-gradient(${selectedEra.colors.text} 1px, transparent 1px), linear-gradient(90deg, ${selectedEra.colors.text} 1px, transparent 1px)`,
                            backgroundSize: `${tokens.gridSize}px ${tokens.gridSize}px`,
                          }}
                        />
                      )}

                      <div className="absolute left-5 top-0 bottom-0 w-px bg-[rgba(255,90,90,0.22)]" />

                      {showLab ? (
                        <div className="relative z-10 flex-1 overflow-hidden">
                          <CustomizationLab
                            era={selectedEra}
                            onClose={() => setShowLab(false)}
                          />
                        </div>
                      ) : (
                        <>
                          <div className="relative z-10 flex-1 overflow-y-auto scrollbar-hide px-8 md:px-10 py-8 md:py-10 space-y-5">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p
                                  className="font-mono text-[9px] uppercase tracking-[0.3em] mb-2"
                                  style={{ color: selectedEra.colors.accent }}
                                >
                                  Era Notebook
                                </p>
                                <AnimatePresence mode="wait">
                                  <motion.div
                                    key={selectedEraId + "-year-r"}
                                    initial={{ opacity: 0, x: -5 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.16 }}
                                  >
                                    <p
                                      className="font-mono font-black leading-none"
                                      style={{
                                        fontSize: "clamp(2rem, 3.5vw, 3rem)",
                                        color: selectedEra.colors.accent,
                                        fontFamily: selectedEra.fonts.primary,
                                      }}
                                    >
                                      {selectedEra.id}
                                    </p>
                                    <p
                                      className="mt-2 text-xs font-semibold"
                                      style={{
                                        color: selectedEra.colors.text,
                                        fontFamily: selectedEra.fonts.secondary,
                                      }}
                                    >
                                      {selectedEra.name.split(":")[1]?.trim() ||
                                        selectedEra.name}
                                    </p>
                                    <p
                                      className="mt-1 text-[10px] font-mono"
                                      style={{
                                        color: `${selectedEra.colors.text}88`,
                                      }}
                                    >
                                      {selectedEra.era}
                                    </p>
                                  </motion.div>
                                </AnimatePresence>
                              </div>

                              <span
                                className="px-2 py-1 text-[8px] font-mono uppercase border"
                                style={{
                                  color: selectedEra.colors.text,
                                  borderColor: `${selectedEra.colors.text}35`,
                                  borderRadius: `${Math.min(borderRadius, 10)}px`,
                                  backgroundColor: `${selectedEra.colors.text}08`,
                                }}
                              >
                                {selectedEra.style}
                              </span>
                            </div>

                            <div>
                              <p
                                className="font-mono text-[8px] uppercase mb-2 tracking-[0.12em]"
                                style={{
                                  color: selectedEra.colors.accent,
                                  opacity: 0.82,
                                }}
                              >
                                Palette
                              </p>
                              <div className="flex flex-wrap gap-2.5">
                                {colorKeys.map((key) => (
                                  <LabColorSwatch
                                    key={key}
                                    color={selectedEra.colors[key]}
                                    label={key}
                                    borderRadius={borderRadius}
                                    labelColor={`${selectedEra.colors.text}99`}
                                    valueColor={selectedEra.colors.text}
                                    borderColor={`${selectedEra.colors.text}35`}
                                  />
                                ))}
                              </div>
                            </div>

                            <div>
                              <p
                                className="font-mono text-[8px] uppercase mb-2 tracking-[0.12em]"
                                style={{
                                  color: selectedEra.colors.accent,
                                  opacity: 0.82,
                                }}
                              >
                                Typography
                              </p>
                              <div className="space-y-2">
                                {typeRows.map((item) => (
                                  <div
                                    key={item.label}
                                    className="flex items-center gap-2 px-3 py-2 border"
                                    style={{
                                      borderColor: `${selectedEra.colors.text}20`,
                                      backgroundColor: `${selectedEra.colors.text}06`,
                                      borderRadius: `${Math.min(borderRadius, 8)}px`,
                                    }}
                                  >
                                    <span
                                      className="text-[7px] font-mono uppercase w-10 flex-shrink-0"
                                      style={{
                                        color: `${selectedEra.colors.text}88`,
                                      }}
                                    >
                                      {item.label}
                                    </span>
                                    <span
                                      className="text-xs truncate"
                                      style={{
                                        fontFamily: item.font,
                                        color: selectedEra.colors.text,
                                      }}
                                    >
                                      {item.font
                                        .split(",")[0]
                                        .replace(/"/g, "")
                                        .trim()}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div>
                              <p
                                className="font-mono text-[8px] uppercase mb-2 tracking-[0.12em]"
                                style={{
                                  color: selectedEra.colors.accent,
                                  opacity: 0.82,
                                }}
                              >
                                Tokens
                              </p>
                              <div className="grid grid-cols-2 gap-2">
                                {[
                                  {
                                    label: "radius",
                                    value: `${tokens.borderRadius}px`,
                                  },
                                  {
                                    label: "shadow",
                                    value: `${tokens.shadowStyle} (${tokens.shadowIntensity}%)`,
                                  },
                                  {
                                    label: "grid",
                                    value: tokens.gridSize
                                      ? `${tokens.gridSize}px`
                                      : "none",
                                  },
                                  {
                                    label: "tracking",
                                    value: `${tokens.letterSpacing}`,
                                  },
                                  {
                                    label: "line-height",
                                    value: `${tokens.lineHeight}`,
                                  },
                                  {
                                    label: "animation",
                                    value: tokens.animationStyle,
                                  },
                                ].map((item) => (
                                  <div
                                    key={item.label}
                                    className="flex items-center justify-between px-2.5 py-2 border"
                                    style={{
                                      borderColor: `${selectedEra.colors.text}20`,
                                      backgroundColor: `${selectedEra.colors.text}06`,
                                      borderRadius: `${Math.min(borderRadius, 6)}px`,
                                    }}
                                  >
                                    <span
                                      className="text-[7px] font-mono uppercase"
                                      style={{
                                        color: `${selectedEra.colors.text}88`,
                                      }}
                                    >
                                      {item.label}
                                    </span>
                                    <span
                                      className="text-[8px] font-mono font-bold text-right"
                                      style={{ color: selectedEra.colors.text }}
                                    >
                                      {item.value}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div>
                              <p
                                className="font-mono text-[8px] uppercase mb-2 tracking-[0.12em]"
                                style={{
                                  color: selectedEra.colors.accent,
                                  opacity: 0.82,
                                }}
                              >
                                Era Index
                              </p>
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {AVAILABLE_THEMES.map((era, index) => {
                                  const isSelected = era.id === selectedEraId;
                                  return (
                                    <motion.button
                                      key={era.id}
                                      onClick={() =>
                                        selectEra(
                                          era.id,
                                          index >= selectedIndex ? 1 : -1,
                                        )
                                      }
                                      className="px-2.5 py-2 text-left border transition-all"
                                      style={{
                                        borderRadius: `${Math.min(borderRadius, 8)}px`,
                                        borderColor: isSelected
                                          ? era.colors.accent
                                          : `${selectedEra.colors.text}20`,
                                        backgroundColor: isSelected
                                          ? `${era.colors.accent}14`
                                          : `${selectedEra.colors.text}05`,
                                      }}
                                      whileHover={{ scale: 1.02 }}
                                      whileTap={{ scale: 0.98 }}
                                    >
                                      <div
                                        className="text-[10px] font-mono font-bold"
                                        style={{
                                          color: isSelected
                                            ? era.colors.accent
                                            : selectedEra.colors.text,
                                        }}
                                      >
                                        {era.id}
                                      </div>
                                      <div
                                        className="mt-1 text-[8px] truncate"
                                        style={{
                                          color: `${selectedEra.colors.text}88`,
                                        }}
                                      >
                                        {index + 1}.{" "}
                                        {era.name.split(":")[1]?.trim() ||
                                          era.name}
                                      </div>
                                    </motion.button>
                                  );
                                })}
                              </div>
                            </div>

                            {tokens.effects.length > 0 && (
                              <div>
                                <p
                                  className="font-mono text-[8px] uppercase mb-2 tracking-[0.12em]"
                                  style={{
                                    color: selectedEra.colors.accent,
                                    opacity: 0.82,
                                  }}
                                >
                                  Effects
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                  {tokens.effects.map((effect, i) => (
                                    <span
                                      key={i}
                                      className="px-2 py-1 text-[7px] font-mono uppercase border"
                                      style={{
                                        borderColor: `${selectedEra.colors.text}20`,
                                        backgroundColor: `${selectedEra.colors.text}06`,
                                        color: `${selectedEra.colors.text}88`,
                                        borderRadius: `${Math.min(borderRadius, 6)}px`,
                                      }}
                                    >
                                      {effect}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          <div
                            className="relative z-10 p-4 border-t flex-shrink-0"
                            style={{
                              borderColor: `${selectedEra.colors.text}18`,
                              backgroundColor: `${selectedEra.colors.text}04`,
                            }}
                          >
                            <div
                              className="flex items-center gap-2 mb-3 text-[9px] font-mono"
                              style={{ color: `${selectedEra.colors.text}88` }}
                            >
                              <kbd
                                className="px-1.5 py-0.5 border"
                                style={{
                                  borderColor: `${selectedEra.colors.text}22`,
                                  backgroundColor: `${selectedEra.colors.text}08`,
                                  color: selectedEra.colors.text,
                                }}
                              >
                                ←
                              </kbd>
                              <kbd
                                className="px-1.5 py-0.5 border"
                                style={{
                                  borderColor: `${selectedEra.colors.text}22`,
                                  backgroundColor: `${selectedEra.colors.text}08`,
                                  color: selectedEra.colors.text,
                                }}
                              >
                                →
                              </kbd>
                              <span>Switch chapter instantly</span>
                            </div>

                            <motion.button
                              onClick={() => setShowLab(true)}
                              className="w-full py-3 px-4 font-mono text-[10px] font-bold uppercase border-2 flex items-center justify-center gap-2 transition-all"
                              style={{
                                borderColor: selectedEra.colors.accent,
                                color: selectedEra.colors.accent,
                                borderRadius: `${Math.min(borderRadius, 8)}px`,
                                backgroundColor: `${selectedEra.colors.text}05`,
                              }}
                              whileHover={{
                                backgroundColor: selectedEra.colors.accent,
                                color: selectedEra.colors.background,
                              }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <span>🔬</span> Open Customization Lab
                            </motion.button>
                          </div>
                        </>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

function RetroNavClock({ compact }: { compact?: boolean }) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = globalThis.setInterval(() => setNow(new Date()), 30_000);
    return () => globalThis.clearInterval(id);
  }, []);
  if (!now) {
    return (
      <span className={cn("tabular-nums opacity-50", compact && "text-[9px]")}>
        --:--
      </span>
    );
  }
  return (
    <span className={cn("tabular-nums", compact && "text-[9px]")}>
      {now.toLocaleTimeString(undefined, {
        hour: "numeric",
        minute: "2-digit",
      })}
    </span>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN NAVIGATION COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

interface SimpleGameNavProps {
  isGameActive?: boolean;
  currentGameId?: string;
  currentGameName?: string;
  currentGameIcon?: string;
  onToggleGame?: () => void;
}

const SimpleGameNav: React.FC<SimpleGameNavProps> = ({
  isGameActive: _isGameActive = false,
  currentGameId: _currentGameId = "snake",
  currentGameName: _currentGameName = "SNAKE TRAIL",
  currentGameIcon: _currentGameIcon = "bolt",
  onToggleGame: _onToggleGame,
}) => {
  const { currentEra, currentEraId, setEra } = useDesignEra();
  const { toggleMenu, isMenuOpen } = useGameMode();
  const pathname = usePathname();
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);
  /** Compact from scroll only; expands immediately on scroll-up or near top. */
  const [scrollIntentCompact, setScrollIntentCompact] = useState(
    () => typeof globalThis !== "undefined" && globalThis.scrollY > 72,
  );
  const [navHovered, setNavHovered] = useState(false);
  const [navFocusWithin, setNavFocusWithin] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);
  const collapseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hoverLeaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const BAR_HEIGHT_FULL = GRID_SIZE * 3;
  const BAR_HEIGHT_COMPACT = GRID_SIZE * 2;
  const SCROLL_NEAR_TOP_PX = 56;
  const SCROLL_COMPACT_ELIGIBLE_PX = 72;
  const COLLAPSE_DEBOUNCE_MS = 600;
  const HOVER_LEAVE_DELAY_MS = 500;

  const router = useRouter();
  const handleEraSelect = (eraId: string) => {
    setEra(eraId);
  };

  const expanded =
    !scrollIntentCompact ||
    navHovered ||
    navFocusWithin ||
    isTimelineOpen ||
    isMenuOpen;
  const showFullStrip = expanded;
  const barHeightPx = showFullStrip ? BAR_HEIGHT_FULL : BAR_HEIGHT_COMPACT;

  const reduceMotion = useReducedMotion();
  const step = pixelStepEase(reduceMotion ? 4 : 10);
  const navTransition = reduceMotion
    ? {
        duration: 0.2,
        ease: [0.25, 0.1, 0.25, 1] as const,
        layout: { duration: 0.2, ease: [0.25, 0.1, 0.25, 1] as const },
      }
    : {
        type: "tween" as const,
        duration: 0.48,
        ease: step,
        layout: {
          type: "tween" as const,
          duration: 0.48,
          ease: pixelStepEase(12),
        },
      };
  const tapTransition = reduceMotion
    ? { duration: 0.12, ease: [0.25, 0.1, 0.25, 1] as const }
    : { type: "tween" as const, duration: 0.1, ease: pixelStepEase(5) };
  const trailPresenceTransition = reduceMotion
    ? { duration: 0.18 }
    : { duration: 0.4, ease: pixelStepEase(8) };

  const clearCollapseTimer = useCallback(() => {
    if (collapseTimerRef.current) {
      globalThis.clearTimeout(collapseTimerRef.current);
      collapseTimerRef.current = null;
    }
  }, []);

  const clearHoverLeaveTimer = useCallback(() => {
    if (hoverLeaveTimerRef.current) {
      globalThis.clearTimeout(hoverLeaveTimerRef.current);
      hoverLeaveTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const y = globalThis.scrollY;
      const dy = y - lastScrollY.current;
      lastScrollY.current = y;

      if (y < SCROLL_NEAR_TOP_PX) {
        clearCollapseTimer();
        setScrollIntentCompact(false);
        return;
      }

      if (dy < -1.5) {
        clearCollapseTimer();
        setScrollIntentCompact(false);
        return;
      }

      // Only collapse after scrolling down has paused (retimer on each downward tick).
      if (y > SCROLL_COMPACT_ELIGIBLE_PX && dy > 0.5) {
        clearCollapseTimer();
        collapseTimerRef.current = globalThis.setTimeout(() => {
          setScrollIntentCompact(true);
          collapseTimerRef.current = null;
        }, COLLAPSE_DEBOUNCE_MS);
      }
    };

    const boot = () => {
      const y = globalThis.scrollY;
      lastScrollY.current = y;
      if (y < SCROLL_NEAR_TOP_PX) {
        clearCollapseTimer();
        setScrollIntentCompact(false);
        return;
      }
      if (y > SCROLL_COMPACT_ELIGIBLE_PX) {
        clearCollapseTimer();
        collapseTimerRef.current = globalThis.setTimeout(() => {
          setScrollIntentCompact(true);
          collapseTimerRef.current = null;
        }, COLLAPSE_DEBOUNCE_MS);
      }
    };

    globalThis.addEventListener("scroll", onScroll, { passive: true });
    boot();

    return () => {
      clearCollapseTimer();
      globalThis.removeEventListener("scroll", onScroll);
    };
  }, [clearCollapseTimer]);

  useEffect(
    () => () => {
      clearCollapseTimer();
      clearHoverLeaveTimer();
    },
    [clearCollapseTimer, clearHoverLeaveTimer],
  );

  const publishNavBottom = useCallback(() => {
    const el = navRef.current;
    if (!el || typeof document === "undefined") return;
    const bottom = Math.ceil(el.getBoundingClientRect().bottom);
    document.documentElement.style.setProperty(
      SIMPLE_GAME_NAV_BOTTOM_CSS_VAR,
      `${bottom}px`,
    );
  }, []);

  useLayoutEffect(() => {
    publishNavBottom();
    const el = navRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => publishNavBottom());
    ro.observe(el);
    globalThis.addEventListener("resize", publishNavBottom);
    return () => {
      ro.disconnect();
      globalThis.removeEventListener("resize", publishNavBottom);
    };
  }, [publishNavBottom, barHeightPx, showFullStrip]);

  useEffect(() => {
    const el = navRef.current;
    if (!el) return;
    const onFocusIn = () => setNavFocusWithin(true);
    const onFocusOut = () => {
      requestAnimationFrame(() => {
        if (!el.contains(document.activeElement)) setNavFocusWithin(false);
      });
    };
    el.addEventListener("focusin", onFocusIn);
    el.addEventListener("focusout", onFocusOut);
    return () => {
      el.removeEventListener("focusin", onFocusIn);
      el.removeEventListener("focusout", onFocusOut);
    };
  }, []);

  const seg =
    "flex h-full shrink-0 touch-manipulation items-center justify-center border-r border-[var(--border-color)] px-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-main)] transition-colors duration-200 ease-out hover:bg-[color-mix(in_srgb,var(--text-main)_5%,var(--bg-card))] sm:px-3 sm:text-[11px] sm:tracking-[0.14em] [font-family:var(--font-main,ui-sans-serif,system-ui)]";
  const segFocus =
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-color)] focus-visible:ring-inset";

  const onPortfolioPath =
    pathname === "/portfolio" || pathname.startsWith("/portfolio/");

  const navShadow = useMemo(
    () =>
      `0 2px 14px color-mix(in srgb, var(--text-main) 7%, transparent), 0 1px 2px color-mix(in srgb, var(--text-main) 5%, transparent)`,
    [],
  );

  const borderRadiusPx = useMemo(() => {
    const t = currentEra.designTokens;
    return Math.min(t.borderRadius, showFullStrip ? 10 : 9);
  }, [currentEra, showFullStrip]);

  return (
    <>
      <header
        className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-3 pt-3 sm:px-4 sm:pt-3"
        role="banner"
      >
        <LayoutGroup id="simple-game-nav">
          <motion.div
            ref={navRef}
            id="navigation"
            layout
            className={cn(
              "pointer-events-auto box-border flex min-w-0 items-stretch overflow-hidden border border-[var(--border-color)] bg-[var(--bg-card)]/90 text-[var(--text-main)] backdrop-blur-md",
              showFullStrip
                ? "w-full max-w-6xl"
                : "w-fit max-w-[min(100%,calc(100vw-1.5rem))]",
            )}
            style={{ boxShadow: navShadow }}
            animate={{
              height: barHeightPx,
              borderRadius: borderRadiusPx,
            }}
            transition={navTransition}
            whileHover={
              reduceMotion ? undefined : !showFullStrip ? { y: -4 } : undefined
            }
            onMouseEnter={() => {
              clearHoverLeaveTimer();
              setNavHovered(true);
            }}
            onMouseLeave={() => {
              hoverLeaveTimerRef.current = globalThis.setTimeout(() => {
                setNavHovered(false);
                hoverLeaveTimerRef.current = null;
              }, HOVER_LEAVE_DELAY_MS);
            }}
          >
            <motion.button
              type="button"
              className={cn(
                seg,
                "normal-case tracking-normal",
                !showFullStrip && "border-r-0 px-4 sm:px-5",
                segFocus,
              )}
              transition={tapTransition}
              whileHover={
                reduceMotion ? undefined : showFullStrip ? { y: -2 } : undefined
              }
              whileTap={reduceMotion ? undefined : { scale: 0.98 }}
              onClick={() => {
                navHaptic("tap");
                router.push("/");
              }}
              aria-label="Home — KIRUK.IN"
            >
              <span
                className={cn(
                  fontPixelBrand.className,
                  "inline-block whitespace-nowrap leading-none tracking-tight [-webkit-font-smoothing:none] text-[8px] sm:text-[9px]",
                )}
              >
                KIRUK.IN
              </span>
            </motion.button>

            <AnimatePresence initial={false} mode="popLayout">
              {showFullStrip && (
                <motion.div
                  key="nav-trail"
                  layout
                  className="flex min-h-0 min-w-0 flex-1 items-stretch"
                  initial={reduceMotion ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={trailPresenceTransition}
                >
                  <motion.button
                    type="button"
                    className={cn(
                      seg,
                      "min-w-[3.75rem] flex-col gap-0.5 py-1 sm:min-w-[4.75rem]",
                      segFocus,
                    )}
                    transition={tapTransition}
                    whileHover={reduceMotion ? undefined : { y: -2 }}
                    whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                    onClick={() => {
                      navHaptic("tap");
                      setIsTimelineOpen(true);
                    }}
                    aria-label={`Design era: ${currentEra.name}. Open era timeline.`}
                  >
                    <span className="text-[8px] tracking-[0.2em] text-[var(--text-muted)] sm:text-[9px]">
                      ERA
                    </span>
                    <span className="text-[11px] font-semibold tabular-nums text-[var(--accent-color)] sm:text-xs">
                      {currentEraId}
                    </span>
                  </motion.button>

                  <div className="flex min-h-0 min-w-0 flex-1 items-center justify-center border-r border-[var(--border-color)] px-1.5 sm:px-2">
                    <span className="max-w-[5.5rem] truncate text-center text-[7px] font-semibold uppercase leading-tight tracking-[0.14em] text-[var(--text-muted)] sm:max-w-none sm:text-[8px] sm:tracking-[0.18em] md:text-[9px] [font-family:var(--font-main,ui-sans-serif,system-ui)]">
                      UX engineer
                    </span>
                  </div>

                  <motion.button
                    type="button"
                    className={cn(
                      seg,
                      onPortfolioPath &&
                        "bg-[color-mix(in_srgb,var(--accent-color)_10%,var(--bg-card))] text-[var(--accent-color)]",
                      segFocus,
                    )}
                    transition={tapTransition}
                    whileHover={reduceMotion ? undefined : { y: -2 }}
                    whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                    onClick={() => {
                      navHaptic("tap");
                      router.push("/portfolio");
                    }}
                    aria-label="See my work"
                  >
                    WORKS
                  </motion.button>

                  <motion.button
                    type="button"
                    className={cn(
                      seg,
                      "min-w-[3rem] px-2 sm:min-w-[3.5rem]",
                      segFocus,
                    )}
                    transition={tapTransition}
                    whileHover={reduceMotion ? undefined : { y: -2 }}
                    whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                    onClick={() => {
                      navHaptic("confirm");
                      toggleMenu();
                    }}
                    aria-label="Open gamified navigation menu"
                  >
                    MENU
                  </motion.button>

                  <motion.div
                    className={cn(
                      seg,
                      "min-w-[5.25rem] border-r-0 px-2 tabular-nums normal-case tracking-normal sm:min-w-[6rem] sm:px-3",
                    )}
                    aria-live="polite"
                    aria-atomic="true"
                  >
                    <RetroNavClock />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </LayoutGroup>
      </header>

      {/* Game Menu Overlay - Gamified Navigation */}
      <GameMenuOverlay />

      {/* Timeline Overlay */}
      <EyeTimelineOverlay
        isOpen={isTimelineOpen}
        onClose={() => setIsTimelineOpen(false)}
        currentEraId={currentEraId}
        onEraSelect={handleEraSelect}
      />
    </>
  );
};

export default SimpleGameNav;
