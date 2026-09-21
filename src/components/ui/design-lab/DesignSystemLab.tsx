"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { ThemeConfig } from "@/data/portfolio-data";
import { EraShaderCanvas } from "./EraShaderCanvas";

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface DesignSystemLabProps {
  era: ThemeConfig;
  onOpenLabEditor: () => void;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ERA EFFECT STYLES - Returns CSS for era-specific visual effects
// ═══════════════════════════════════════════════════════════════════════════════

function _getEraEffectStyles(
  effects: string[],
  _colors: ThemeConfig["colors"],
) {
  const styles: React.CSSProperties = {};

  // CRT/Terminal effects
  if (effects.includes("crt-scanlines")) {
    styles.backgroundImage = `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0, 0, 0, 0.15) 2px,
            rgba(0, 0, 0, 0.15) 4px
        )`;
  }

  return styles;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SHADOW STYLE GENERATOR
// ═══════════════════════════════════════════════════════════════════════════════

function getShadowStyle(
  shadowType: ThemeConfig["designTokens"]["shadowStyle"],
  intensity: number,
  color: string,
  _radius: number,
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
        boxShadow: `${6 * i}px ${6 * i}px ${12 * i}px rgba(0,0,0,0.3),
                            -${6 * i}px -${6 * i}px ${12 * i}px rgba(255,255,255,0.05)`,
      };
    case "inset":
      return {
        boxShadow: `inset 0 ${2 * i}px ${8 * i}px rgba(0,0,0,${0.3 * i})`,
      };
    default:
      return {};
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// COLOR SWATCH COMPONENT - Uses era-specific border radius
// ═══════════════════════════════════════════════════════════════════════════════

function ColorSwatch({
  color,
  label,
  isSmall = false,
  borderRadius = 0,
  shadowStyle,
}: {
  color: string;
  label: string;
  isSmall?: boolean;
  borderRadius?: number;
  shadowStyle?: React.CSSProperties;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(color);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <motion.button
      onClick={handleCopy}
      className={cn(
        "relative group flex flex-col items-center transition-all",
        isSmall ? "gap-1" : "gap-2",
      )}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <div
        className={cn(
          "border-2 border-[var(--border-color)] transition-all",
          "hover:border-[var(--accent-color)]",
          isSmall ? "w-8 h-8" : "w-12 h-12 lg:w-14 lg:h-14",
        )}
        style={{
          backgroundColor: color,
          borderRadius: `${Math.min(borderRadius, isSmall ? 4 : 8)}px`,
          ...shadowStyle,
        }}
      />
      <span
        className={cn(
          "font-mono uppercase",
          isSmall ? "text-[7px]" : "text-[8px] lg:text-[9px]",
        )}
        style={{ color: "var(--text-muted)" }}
      >
        {label}
      </span>
      <span
        className={cn(
          "font-mono",
          isSmall ? "text-[6px]" : "text-[7px] lg:text-[8px]",
        )}
        style={{ color: "var(--text-main)" }}
      >
        {color.toUpperCase()}
      </span>

      {/* Copy indicator */}
      <AnimatePresence>
        {copied && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute -top-6 px-2 py-1 text-[8px] font-mono bg-[var(--accent-color)] text-[var(--bg-main)]"
            style={{ borderRadius: `${borderRadius}px` }}
          >
            COPIED!
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ERA EFFECT LAYER - Renders era-specific visual effects
// ═══════════════════════════════════════════════════════════════════════════════

function EraEffectLayer({
  effects,
  colors,
  animationStyle,
}: {
  effects: string[];
  colors: ThemeConfig["colors"];
  animationStyle: ThemeConfig["designTokens"]["animationStyle"];
}) {
  return (
    <>
      {/* CRT Scanlines */}
      {effects.includes("crt-scanlines") && (
        <div
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            background:
              "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)",
          }}
        />
      )}

      {/* Phosphor Glow */}
      {effects.includes("phosphor-glow") && (
        <motion.div
          className="absolute inset-0 pointer-events-none z-5"
          animate={{ opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{
            background: `radial-gradient(ellipse at center, ${colors.primary}20 0%, transparent 70%)`,
          }}
        />
      )}

      {/* Frosted Glass */}
      {effects.includes("frosted-glass") && (
        <div
          className="absolute inset-0 pointer-events-none z-5"
          style={{
            backdropFilter: "blur(1px)",
            background: `linear-gradient(135deg, ${colors.primary}08 0%, transparent 50%, ${colors.secondary}08 100%)`,
          }}
        />
      )}

      {/* Aurora Glow */}
      {effects.includes("aurora-glow") && (
        <motion.div
          className="absolute inset-0 pointer-events-none z-5 opacity-30"
          animate={{
            background: [
              `linear-gradient(45deg, ${colors.primary}30 0%, ${colors.secondary}20 50%, ${colors.accent}30 100%)`,
              `linear-gradient(45deg, ${colors.secondary}30 0%, ${colors.accent}20 50%, ${colors.primary}30 100%)`,
              `linear-gradient(45deg, ${colors.accent}30 0%, ${colors.primary}20 50%, ${colors.secondary}30 100%)`,
            ],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
      )}

      {/* Gradient Mesh - Modern effect */}
      {effects.includes("gradient-mesh") && (
        <motion.div
          className="absolute inset-0 pointer-events-none z-5 opacity-40"
          style={{
            background: `
                            radial-gradient(at 20% 30%, ${colors.primary}40 0%, transparent 50%),
                            radial-gradient(at 80% 70%, ${colors.secondary}40 0%, transparent 50%),
                            radial-gradient(at 50% 50%, ${colors.accent}20 0%, transparent 70%)
                        `,
          }}
        />
      )}

      {/* Holographic Shimmer */}
      {effects.includes("holographic-shimmer") && (
        <motion.div
          className="absolute inset-0 pointer-events-none z-5 opacity-20"
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          style={{
            background: `conic-gradient(from 0deg, ${colors.primary}, ${colors.secondary}, ${colors.accent}, ${colors.primary})`,
            filter: "blur(20px)",
          }}
        />
      )}

      {/* Screen Flicker - Terminal effect */}
      {effects.includes("screen-flicker") && animationStyle === "blink" && (
        <motion.div
          className="absolute inset-0 pointer-events-none z-10"
          animate={{ opacity: [0, 0.02, 0, 0.01, 0] }}
          transition={{
            duration: 0.1,
            repeat: Infinity,
            repeatDelay: Math.random() * 5,
          }}
          style={{ background: "white" }}
        />
      )}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// DECORATIVE EYE ICON
// ═══════════════════════════════════════════════════════════════════════════════

function SmallEyeIcon({ accentColor }: { accentColor: string }) {
  return (
    <motion.div
      className="absolute top-2 right-2 opacity-40 z-20"
      animate={{ opacity: [0.3, 0.5, 0.3] }}
      transition={{ duration: 3, repeat: Infinity }}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle
          cx="12"
          cy="12"
          r="8"
          stroke={accentColor}
          strokeWidth="1.5"
          fill="none"
        />
        <circle cx="12" cy="12" r="3" fill={accentColor} />
        <circle cx="13" cy="11" r="1" fill="white" opacity="0.6" />
      </svg>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN DESIGN SYSTEM LAB COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export function DesignSystemLab({
  era,
  onOpenLabEditor: _onOpenLabEditor,
}: DesignSystemLabProps) {
  const colors = era.colors;
  const fonts = era.fonts;
  const tokens = era.designTokens;

  const previewBg = colors?.background ?? "#000000";
  const previewText = colors?.text ?? "#ffffff";
  const previewAccent = colors?.accent ?? colors?.primary ?? "#00ff88";

  // Compute shadow style (must be before conditional return)
  const shadowStyle = useMemo(
    () =>
      getShadowStyle(
        tokens?.shadowStyle ?? "none",
        tokens?.shadowIntensity ?? 50,
        previewAccent,
        tokens?.borderRadius ?? 0,
      ),
    [
      tokens?.shadowStyle,
      tokens?.shadowIntensity,
      tokens?.borderRadius,
      previewAccent,
    ],
  );

  // Grid configuration
  const gridSize = tokens?.gridSize ?? null;
  const gridOpacity = tokens?.gridOpacity ?? 0;
  const borderRadius = tokens?.borderRadius ?? 0;

  return (
    <div className="flex flex-col h-full">
      {/* Lab Container with Era Theme */}
      <div
        className="flex-1 relative overflow-hidden border-2 border-[var(--border-color)]"
        style={{
          backgroundColor: previewBg,
          borderRadius: `${Math.min(borderRadius, 16)}px`,
        }}
      >
        {/* Decorative Eye Icon */}
        <SmallEyeIcon accentColor={previewAccent} />

        {/* Era Effect Layer */}
        <EraEffectLayer
          effects={tokens?.effects ?? []}
          colors={colors}
          animationStyle={tokens?.animationStyle ?? "none"}
        />

        {/* Advanced Shader Effects - ASCII, dithering, scanlines, glow */}
        <EraShaderCanvas era={era} />

        {/* Dynamic Grid Pattern Overlay - Only show if gridSize is set (pre-2022 eras) */}
        {gridSize && gridSize > 0 && (
          <div
            className="absolute inset-0 pointer-events-none z-0"
            style={{
              opacity: gridOpacity,
              backgroundImage: `linear-gradient(${previewText} 1px, transparent 1px), linear-gradient(90deg, ${previewText} 1px, transparent 1px)`,
              backgroundSize: `${gridSize}px ${gridSize}px`,
            }}
          />
        )}

        <div className="relative h-full flex flex-col p-3 lg:p-4 gap-4 overflow-y-auto z-10">
          {/* ═══ SECTION: HOW YOUR SITE WILL LOOK ═══ */}
          <div>
            <div
              className="font-mono text-[9px] lg:text-[10px] uppercase mb-1 flex items-center gap-2"
              style={{
                color: previewAccent,
                letterSpacing: `${(tokens?.letterSpacing ?? 0) * 0.01}em`,
              }}
            >
              <span>◆</span> SITE PREVIEW
            </div>
          </div>

          {/* ═══ SECTION: COLOR PALETTE ═══ */}
          <div>
            <div
              className="font-mono text-[9px] lg:text-[10px] uppercase mb-1 flex items-center gap-2"
              style={{
                color: previewAccent,
                letterSpacing: `${(tokens?.letterSpacing ?? 0) * 0.01}em`,
              }}
            >
              <span>◆</span> COLOR PALETTE
            </div>

            <div className="flex flex-wrap gap-3 lg:gap-4">
              <ColorSwatch
                color={colors.primary}
                label="Primary"
                borderRadius={borderRadius}
                shadowStyle={shadowStyle}
              />
              <ColorSwatch
                color={colors.secondary}
                label="Secondary"
                borderRadius={borderRadius}
                shadowStyle={shadowStyle}
              />
              <ColorSwatch
                color={colors.accent}
                label="Accent"
                borderRadius={borderRadius}
                shadowStyle={shadowStyle}
              />
              <ColorSwatch
                color={colors.background}
                label="Bg"
                borderRadius={borderRadius}
                shadowStyle={shadowStyle}
              />
              <ColorSwatch
                color={colors.text}
                label="Text"
                borderRadius={borderRadius}
                shadowStyle={shadowStyle}
              />
            </div>
          </div>

          {/* ═══ SECTION: TYPOGRAPHY ═══ */}
          <div>
            <div
              className="font-mono text-[9px] lg:text-[10px] uppercase mb-1 flex items-center gap-2"
              style={{
                color: previewAccent,
                letterSpacing: `${(tokens?.letterSpacing ?? 0) * 0.01}em`,
              }}
            >
              <span>◆</span> TYPOGRAPHY
            </div>

            <div
              className="p-3 border border-opacity-20"
              style={{
                borderColor: previewText,
                backgroundColor: `${previewBg}CC`,
                borderRadius: `${borderRadius}px`,
                ...shadowStyle,
              }}
            >
              <h3
                className="text-lg lg:text-xl font-bold mb-1"
                style={{
                  color: previewText,
                  fontFamily: fonts.primary,
                  letterSpacing: `${(tokens?.letterSpacing ?? 0) * 0.01}em`,
                  lineHeight: tokens?.lineHeight ?? 1.5,
                  textShadow: tokens?.effects?.includes("text-shadow-glow")
                    ? `0 0 10px ${previewText}80`
                    : "none",
                }}
              >
                Heading Display
              </h3>
              <p
                className="text-xs lg:text-sm mb-2 opacity-80"
                style={{
                  color: previewText,
                  fontFamily: fonts.secondary,
                  lineHeight: tokens?.lineHeight ?? 1.5,
                }}
              >
                Body text in the secondary font. This showcases how readable
                content appears.
              </p>
              <span
                className="text-[10px] lg:text-xs font-bold uppercase"
                style={{ color: previewAccent, fontFamily: fonts.accent }}
              >
                Accent Label
              </span>
            </div>
            {/* Font Labels */}
            <div className="flex gap-2 mt-2 flex-wrap">
              {[
                { font: fonts.primary, label: "Display" },
                { font: fonts.secondary, label: "Text" },
                { font: fonts.accent, label: "UI" },
              ].map((item, i) => (
                <span
                  key={i}
                  className="text-[8px] px-2 py-1 border"
                  style={{
                    color: previewText,
                    borderColor: `${previewText}33`,
                    fontFamily: item.font,
                    borderRadius: `${Math.min(borderRadius, 4)}px`,
                  }}
                >
                  {item.label}: {item.font.split(",")[0].replace(/"/g, "")}
                </span>
              ))}
            </div>
          </div>

          {/* ═══ SECTION: COMPONENT SHOWCASE ═══ */}
          <div>
            <div
              className="font-mono text-[9px] lg:text-[10px] uppercase mb-1 flex items-center gap-2"
              style={{
                color: previewAccent,
                letterSpacing: `${(tokens?.letterSpacing ?? 0) * 0.01}em`,
              }}
            >
              <span>◆</span> UI COMPONENTS
            </div>

            <div className="flex flex-wrap gap-2 lg:gap-3">
              {/* Primary Button */}
              <motion.button
                className="px-3 lg:px-4 py-1.5 lg:py-2 text-[10px] lg:text-xs font-bold uppercase border-2 transition-all"
                style={{
                  backgroundColor: previewAccent,
                  borderColor: previewAccent,
                  color: previewBg,
                  fontFamily: fonts.accent,
                  borderRadius: `${borderRadius}px`,
                  ...shadowStyle,
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Primary
              </motion.button>

              {/* Secondary Button */}
              <button
                className="px-3 lg:px-4 py-1.5 lg:py-2 text-[10px] lg:text-xs font-bold uppercase border-2 transition-all"
                style={{
                  backgroundColor: "transparent",
                  borderColor: previewText,
                  color: previewText,
                  fontFamily: fonts.accent,
                  borderRadius: `${borderRadius}px`,
                }}
              >
                Secondary
              </button>

              {/* Badge */}
              <span
                className="px-2 py-1 text-[8px] lg:text-[9px] font-bold uppercase"
                style={{
                  backgroundColor: colors.primary,
                  color: previewBg,
                  fontFamily: fonts.accent,
                  borderRadius: `${Math.min(borderRadius, 12)}px`,
                }}
              >
                Badge
              </span>

              {/* Tag */}
              <span
                className="px-2 py-1 text-[8px] lg:text-[9px] border"
                style={{
                  borderColor: previewText,
                  color: previewText,
                  fontFamily: fonts.secondary,
                  borderRadius: `${Math.min(borderRadius, 8)}px`,
                }}
              >
                #tag
              </span>
            </div>

            {/* Mini Card */}
            <div
              className="mt-3 p-3 border-2"
              style={{
                borderColor: `${previewText}33`,
                backgroundColor: `${previewText}08`,
                borderRadius: `${borderRadius}px`,
                ...shadowStyle,
              }}
            >
              <div
                className="text-xs font-bold mb-1"
                style={{ color: previewText, fontFamily: fonts.primary }}
              >
                Card Title
              </div>
              <div
                className="text-[10px] opacity-70"
                style={{ color: previewText, fontFamily: fonts.secondary }}
              >
                A sample card component in this era&apos;s style.
              </div>
            </div>
          </div>

          {/* ═══ SECTION: DESIGN TOKENS INFO ═══ */}
          <div
            className="mt-auto pt-2 border-t"
            style={{ borderColor: `${previewText}22` }}
          >
            <div
              className="font-mono text-[9px] lg:text-[10px] uppercase mb-2 flex items-center gap-2"
              style={{
                color: previewAccent,
                letterSpacing: `${(tokens?.letterSpacing ?? 0) * 0.01}em`,
              }}
            >
              <span>◆</span> DESIGN TOKENS
            </div>
            <div className="flex justify-between items-center flex-wrap gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="px-2 py-0.5 text-[8px] font-mono uppercase"
                  style={{
                    backgroundColor: previewAccent,
                    color: previewBg,
                    borderRadius: `${Math.min(borderRadius, 4)}px`,
                  }}
                >
                  {era.style}
                </span>
                {gridSize && (
                  <span
                    className="text-[8px] font-mono"
                    style={{ color: `${previewText}88` }}
                  >
                    Grid: {gridSize}px
                  </span>
                )}
                <span
                  className="text-[8px] font-mono"
                  style={{ color: `${previewText}88` }}
                >
                  Radius: {borderRadius}px
                </span>
                <span
                  className="text-[8px] font-mono"
                  style={{ color: `${previewText}88` }}
                >
                  Shadow: {tokens?.shadowStyle ?? "none"}
                </span>
              </div>
            </div>
            {/* Effects Tags */}
            {tokens?.effects && tokens.effects.length > 0 && (
              <div className="flex gap-1 mt-2 flex-wrap">
                {tokens.effects.map((effect, i) => (
                  <span
                    key={i}
                    className="px-1.5 py-0.5 text-[7px] font-mono uppercase border"
                    style={{
                      borderColor: `${previewText}33`,
                      color: `${previewText}66`,
                      borderRadius: `${Math.min(borderRadius, 4)}px`,
                    }}
                  >
                    {effect}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DesignSystemLab;
