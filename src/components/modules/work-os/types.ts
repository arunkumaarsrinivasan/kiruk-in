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

/**
 * A full case (content/work/*.mdx) boiled down to plain data, so a desktop
 * that draws its own screen can show the case inside it.
 */
export interface WorkCaseDigest {
  slug: string;
  title: string;
  /** The project this case opens from, and the others folded into it. */
  project: string;
  also: string[];
  pitch: string;
  role: string;
  when: string;
  nda: boolean;
  headline: { value: string; label: string };
  links: { label: string; href: string; kind: string }[];
  shots: { title: string; note: string }[];
  lead?: { value: string; label: string };
  stats: { value: string; label: string; delta?: string }[];
  meters: { value: number; max: number; label: string }[];
  trend?: { label: string; values: number[]; ticks: string[]; peak?: string; note?: string };
  spans?: { label: string; from: string; to: string; rows: { name: string; from: string; to: string }[] };
  iterations: { tag: string; when: string; title: string; note: string; best: boolean }[];
  facts?: { role: string; team?: string; platform?: string; stack?: string; when?: string };
}

export interface DesktopProps {
  readonly era: DesktopEra;
  readonly projects: Project[];
  /** Project folder to open on boot (deep link). */
  readonly focusId?: string;
  /** The full cases, for a desktop that shows them itself. */
  readonly cases?: readonly WorkCaseDigest[];
}
