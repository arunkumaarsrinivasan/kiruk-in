"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getChromeFamily, type ChromeFamily } from "@/data/era-chrome-config";

interface EraChromeOverlayProps {
  eraId: string;
  accentColor: string;
}

/**
 * Era-authentic atmospheric overlay. Six chrome families wrap the page in
 * fixed-position, pointer-events-none decoration matching the design era.
 */
export function EraChromeOverlay({ eraId, accentColor }: EraChromeOverlayProps) {
  const family = getChromeFamily(eraId);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={family}
        className="pointer-events-none fixed inset-0 z-[150]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        aria-hidden="true"
      >
        {renderFamily(family, accentColor)}
      </motion.div>
    </AnimatePresence>
  );
}

function renderFamily(family: ChromeFamily, accent: string) {
  switch (family) {
    case "crt":
      return <CrtChrome accent={accent} />;
    case "classic-windows":
      return <ClassicWindowsChrome accent={accent} />;
    case "web-era":
      return <WebEraChrome accent={accent} />;
    case "aqua-aero":
      return <AquaAeroChrome accent={accent} />;
    case "flat-material":
      return <FlatMaterialChrome />;
    case "glass-spatial":
      return <GlassSpatialChrome accent={accent} />;
    default:
      return null;
  }
}

/* ---------- CRT (1970) ---------- */
function CrtChrome({ accent }: { accent: string }) {
  return (
    <>
      {/* Scanlines */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `repeating-linear-gradient(0deg, rgba(0,0,0,0.18) 0px, rgba(0,0,0,0.18) 1px, transparent 1px, transparent 3px)`,
          opacity: 0.55,
          mixBlendMode: "multiply",
        }}
      />
      {/* Phosphor glow vignette */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 50% 50%, ${accent}05 0%, transparent 35%, rgba(0,0,0,0.55) 100%)`,
        }}
      />
      {/* Bezel corners */}
      <div className="absolute inset-4 rounded-[28px]" style={crtBezel(accent)} />
      {/* Subtle screen flicker */}
      <motion.div
        className="absolute inset-0"
        style={{ backgroundColor: accent, mixBlendMode: "screen" }}
        animate={{ opacity: [0.012, 0.025, 0.012] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
      />
    </>
  );
}

function crtBezel(accent: string): React.CSSProperties {
  return {
    boxShadow: `inset 0 0 60px rgba(0,0,0,0.6), inset 0 0 8px ${accent}40`,
  };
}

/* ---------- Classic Windows (1981-1997) ---------- */
function ClassicWindowsChrome({ accent }: { accent: string }) {
  return (
    <>
      {/* Pixel dither at edges */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(0,0,0,0.12) 1px, transparent 1px)`,
          backgroundSize: "4px 4px",
          opacity: 0.18,
          maskImage:
            "linear-gradient(180deg, rgba(0,0,0,0.4) 0%, transparent 12%, transparent 88%, rgba(0,0,0,0.4) 100%)",
          WebkitMaskImage:
            "linear-gradient(180deg, rgba(0,0,0,0.4) 0%, transparent 12%, transparent 88%, rgba(0,0,0,0.4) 100%)",
        }}
      />
      {/* Corner pixel-bevel marks */}
      <CornerPixels color={accent} />
    </>
  );
}

function CornerPixels({ color }: { color: string }) {
  const corners: Array<React.CSSProperties> = [
    { top: 8, left: 8 },
    { top: 8, right: 8 },
    { bottom: 8, left: 8 },
    { bottom: 8, right: 8 },
  ];
  return (
    <>
      {corners.map((pos, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            ...pos,
            width: 12,
            height: 12,
            boxShadow: `inset 2px 2px 0 ${color}, inset -2px -2px 0 rgba(0,0,0,0.25)`,
            opacity: 0.4,
          }}
        />
      ))}
    </>
  );
}

/* ---------- Early Web (2000-2003) ---------- */
function WebEraChrome({ accent }: { accent: string }) {
  return (
    <>
      {/* Browser-like top stripe */}
      <div
        className="absolute top-0 left-0 right-0 h-1.5"
        style={{
          background: `linear-gradient(180deg, ${accent}60 0%, transparent 100%)`,
          opacity: 0.5,
        }}
      />
      {/* Faint grain — "JPEG of a CRT" feel */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.6' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.35'/></svg>\")",
          backgroundSize: "160px 160px",
          opacity: 0.08,
          mixBlendMode: "multiply",
        }}
      />
    </>
  );
}

/* ---------- Aqua & Aero (2006-2010) ---------- */
function AquaAeroChrome({ accent }: { accent: string }) {
  return (
    <>
      {/* Glossy reflective top sheen */}
      <div
        className="absolute top-0 left-0 right-0 h-32"
        style={{
          background: `linear-gradient(180deg, ${accent}1c 0%, transparent 100%)`,
          mixBlendMode: "screen",
        }}
      />
      {/* Soft inner shadow */}
      <div
        className="absolute inset-0"
        style={{
          boxShadow: `inset 0 0 120px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.12)`,
        }}
      />
      {/* Subtle reflective sheen line near top */}
      <div
        className="absolute top-[44%] left-0 right-0 h-px"
        style={{
          background: `linear-gradient(90deg, transparent, ${accent}55, transparent)`,
          opacity: 0.5,
        }}
      />
    </>
  );
}

/* ---------- Flat & Material (2013-2018) ---------- */
function FlatMaterialChrome() {
  // Deliberately bare — the era's whole point was honest pixels.
  return (
    <div
      className="absolute inset-0"
      style={{
        boxShadow: `inset 0 0 0 1px rgba(0,0,0,0.04)`,
      }}
    />
  );
}

/* ---------- Glass & Spatial (2020-present) ---------- */
function GlassSpatialChrome({ accent }: { accent: string }) {
  return (
    <>
      {/* Soft ambient orbs — large radial gradients drifting slowly */}
      <motion.div
        className="absolute -top-[20%] -left-[10%] w-[55vw] h-[55vw] rounded-full"
        style={{
          background: `radial-gradient(circle, ${accent}1a 0%, transparent 60%)`,
          filter: "blur(40px)",
        }}
        animate={{ x: [0, 30, 0], y: [0, 20, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-[20%] -right-[10%] w-[60vw] h-[60vw] rounded-full"
        style={{
          background: `radial-gradient(circle, ${accent}14 0%, transparent 60%)`,
          filter: "blur(50px)",
        }}
        animate={{ x: [0, -30, 0], y: [0, -20, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Subtle vignette */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.15) 100%)`,
        }}
      />
    </>
  );
}

export default EraChromeOverlay;
