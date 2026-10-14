/**
 * 2026 type: Geist for everything you read on the page, Geist Mono for small
 * labels, Doto (a dot-matrix face) for the device's tiny screen.
 *
 * globals.css names Geist for the 2026 era but nothing loads it, so every
 * 2026 surface puts FONT_VARS_2026 on its root and FONT_STYLE_2026 re-points
 * the site font vars at the self-hosted files (the story box inherits them).
 */

import type { CSSProperties } from "react";
import { Doto, Geist, Geist_Mono } from "next/font/google";

const geist = Geist({ subsets: ["latin"], display: "swap", variable: "--font-2026-sans" });
const geistMono = Geist_Mono({ subsets: ["latin"], display: "swap", variable: "--font-2026-mono" });
const doto = Doto({ subsets: ["latin"], weight: "variable", display: "swap", variable: "--font-2026-dots" });

export const FONT_VARS_2026 = `${geist.variable} ${geistMono.variable} ${doto.variable}`;

export const SANS_2026 = "var(--font-2026-sans, 'Helvetica Neue'), 'Helvetica Neue', Arial, sans-serif";
export const MONO_2026 = "var(--font-2026-mono, ui-monospace), ui-monospace, 'SFMono-Regular', monospace";
export const DOTS_2026 = "var(--font-2026-dots, ui-monospace), ui-monospace, monospace";

export const FONT_STYLE_2026 = {
  "--font-main": SANS_2026,
  "--font-heading": SANS_2026,
} as CSSProperties;
