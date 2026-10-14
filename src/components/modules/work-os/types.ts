import type { portfolioData } from "@/data/portfolio-data";

export type Project = (typeof portfolioData.projects)[number];

export type DesktopId =
  | "term70"
  | "gui84"
  | "next91"
  | "win95"
  | "macos8"
  | "win2k"
  | "winxp"
  | "win7"
  | "flat15"
  | "ai26";

export type ChromeStyle =
  | "bitmap"
  | "next"
  | "win95"
  | "xp"
  | "aqua"
  | "flat"
  | "modern"
  | "platinum"
  | "aero"
  | "glass";
export type BarStyle = "none" | "menubar" | "taskbar" | "dock" | "topbar" | "prompt";

export interface DesktopTokens {
  /** CSS background for the wallpaper layer. */
  wallpaper: string;
  /** Window / panel surface. */
  surface: string;
  surfaceAlt: string;
  text: string;
  textMuted: string;
  accent: string;
  accentText: string;
  border: string;
  titleBar: string;
  titleText: string;
  /** Desktop-icon label color (sits on wallpaper). */
  iconLabel: string;
  /** Live era accent blended over the OS wallpaper as a subtle tint. */
  eraTint?: string;
}

export interface DesktopEra {
  id: DesktopId;
  /** Display year on the dial. */
  year: string;
  /** Short OS name. */
  os: string;
  /** One-line flavor. */
  tagline: string;
  /** Which AVAILABLE_THEMES era ids this desktop stands in for. */
  covers: string[];
  mode: "terminal" | "windowed";
  chrome: ChromeStyle;
  bar: BarStyle;
  /** Desktop-icon visual language. */
  icon: "mono" | "win" | "glossy" | "tile" | "card";
  fontUi: string;
  fontBody: string;
  tokens: DesktopTokens;
  /** Branding shown in the bar / boot. */
  brand: string;
}

export interface WindowState {
  /** unique instance key */
  key: string;
  projectId: string;
  z: number;
  /** initial offset (px) so cascaded windows stagger */
  x: number;
  y: number;
  minimized?: boolean;
}

export interface DesktopProps {
  readonly era: DesktopEra;
  readonly projects: Project[];
  /** Project folder to open on boot (deep link). */
  readonly focusId?: string;
}
