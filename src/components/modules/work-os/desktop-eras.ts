import type { DesktopEra, DesktopId } from "./types";

/**
 * Curated, iconic OS desktops. Each stands in for a band of site eras so the
 * Work module can "time travel" desktops without 15 bespoke builds.
 */
export const DESKTOP_ERAS: DesktopEra[] = [
  {
    id: "term70",
    year: "1972",
    os: "UNIX · CRT",
    tagline: "No mouse. No windows. Just a cursor and your keystrokes.",
    covers: ["1970"],
    mode: "terminal",
    chrome: "bitmap",
    bar: "none",
    icon: "mono",
    fontUi: "var(--font-mono, 'JetBrains Mono', 'Courier New', monospace)",
    fontBody: "var(--font-mono, 'JetBrains Mono', 'Courier New', monospace)",
    brand: "kiruk@unix",
    tokens: {
      wallpaper: "#020402",
      surface: "#020402",
      surfaceAlt: "#031003",
      text: "#33ff66",
      textMuted: "#1f9c40",
      accent: "#7dff9e",
      accentText: "#020402",
      border: "#0c5a22",
      titleBar: "#020402",
      titleText: "#33ff66",
      iconLabel: "#33ff66",
    },
  },
  {
    id: "gui84",
    year: "1984",
    os: "Bitmap GUI",
    tagline: "Icons, folders, and the desktop metaphor — in glorious 1-bit.",
    covers: ["1981"],
    mode: "windowed",
    chrome: "bitmap",
    bar: "menubar",
    icon: "mono",
    fontUi: "'Chicago', 'Geneva', 'Tahoma', system-ui, sans-serif",
    fontBody: "'Geneva', 'Tahoma', system-ui, sans-serif",
    brand: "Macintosh HD",
    tokens: {
      wallpaper:
        "repeating-conic-gradient(#000 0% 25%, #fff 0% 50%) 0 0 / 3px 3px",
      surface: "#ffffff",
      surfaceAlt: "#dcdcdc",
      text: "#000000",
      textMuted: "#444444",
      accent: "#000000",
      accentText: "#ffffff",
      border: "#000000",
      titleBar:
        "repeating-linear-gradient(#000 0 1px, #fff 1px 2px)",
      titleText: "#000000",
      iconLabel: "#000000",
    },
  },
  {
    id: "next91",
    year: "1991",
    os: "NeXTSTEP",
    tagline: "Where the web was born — chiseled charcoal, the column browser, real depth.",
    covers: ["1991"],
    mode: "windowed",
    chrome: "next",
    bar: "dock",
    icon: "card",
    fontUi: "'Helvetica Neue', Helvetica, Arial, sans-serif",
    fontBody: "'Helvetica Neue', Helvetica, Arial, sans-serif",
    brand: "Workspace",
    tokens: {
      wallpaper:
        "repeating-linear-gradient(135deg, #38383a 0 3px, #313133 3px 6px)",
      surface: "#b8b8bc",
      surfaceAlt: "#cdcdd2",
      text: "#1a1a1c",
      textMuted: "#56565c",
      accent: "#3b5bdb",
      accentText: "#ffffff",
      border: "#0c0c0e",
      titleBar: "linear-gradient(#6a6a70, #3a3a40)",
      titleText: "#f4f4f6",
      iconLabel: "#f4f4f6",
    },
  },
  {
    id: "win31",
    year: "1993",
    os: "Windows 3.1",
    tagline: "Program Manager, program groups, and MDI windows inside windows.",
    covers: ["1993"],
    mode: "windowed",
    chrome: "win95",
    bar: "none",
    icon: "win",
    fontUi: "'Tahoma', 'MS Sans Serif', system-ui, sans-serif",
    fontBody: "'Tahoma', 'MS Sans Serif', system-ui, sans-serif",
    brand: "Program Manager",
    tokens: {
      wallpaper: "#04807f",
      surface: "#c0c0c0",
      surfaceAlt: "#dfdfdf",
      text: "#000000",
      textMuted: "#404040",
      accent: "#000080",
      accentText: "#ffffff",
      border: "#000000",
      titleBar: "#000080",
      titleText: "#ffffff",
      iconLabel: "#ffffff",
    },
  },
  {
    id: "win95",
    year: "1995",
    os: "Win 95",
    tagline: "Gray bevels, a Start button, and the taskbar that ate the world.",
    covers: ["1995"],
    mode: "windowed",
    chrome: "win95",
    bar: "taskbar",
    icon: "win",
    fontUi: "'Tahoma', 'MS Sans Serif', system-ui, sans-serif",
    fontBody: "'Tahoma', 'Segoe UI', system-ui, sans-serif",
    brand: "My Computer",
    tokens: {
      wallpaper: "#008080",
      surface: "#c0c0c0",
      surfaceAlt: "#dfdfdf",
      text: "#000000",
      textMuted: "#404040",
      accent: "#000080",
      accentText: "#ffffff",
      border: "#000000",
      titleBar: "linear-gradient(90deg, #000080, #1084d0)",
      titleText: "#ffffff",
      iconLabel: "#ffffff",
    },
  },
  {
    id: "macos8",
    year: "1997",
    os: "Mac OS 8",
    tagline: "Platinum 3D, pinstripe title bars, and window-shade roll-ups.",
    covers: ["1997"],
    mode: "windowed",
    chrome: "platinum",
    bar: "menubar",
    icon: "mono",
    fontUi: "'Charcoal', 'Geneva', 'Tahoma', system-ui, sans-serif",
    fontBody: "'Geneva', 'Tahoma', system-ui, sans-serif",
    brand: "Macintosh HD",
    tokens: {
      wallpaper: "#9a9a9a",
      surface: "#cccccc",
      surfaceAlt: "#dddddd",
      text: "#000000",
      textMuted: "#555555",
      accent: "#3355bb",
      accentText: "#ffffff",
      border: "#000000",
      titleBar: "repeating-linear-gradient(#cfcfcf 0 1px, #a8a8a8 1px 2px)",
      titleText: "#000000",
      iconLabel: "#000000",
    },
  },
  {
    id: "win2k",
    year: "2000",
    os: "Windows 2000",
    tagline: "Business gray, classic Start, and Explorer's blue Web View banner.",
    covers: ["2000"],
    mode: "windowed",
    chrome: "win95",
    bar: "none",
    icon: "win",
    fontUi: "'Tahoma', 'MS Sans Serif', system-ui, sans-serif",
    fontBody: "'Tahoma', 'MS Sans Serif', system-ui, sans-serif",
    brand: "Windows 2000 Professional",
    tokens: {
      wallpaper: "#3a6ea5",
      surface: "#d4d0c8",
      surfaceAlt: "#ece9e0",
      text: "#000000",
      textMuted: "#404040",
      accent: "#0a246a",
      accentText: "#ffffff",
      border: "#000000",
      titleBar: "linear-gradient(90deg, #0a246a, #3a6ea5)",
      titleText: "#ffffff",
      iconLabel: "#ffffff",
    },
  },
  {
    id: "winxp",
    year: "2003",
    os: "Windows XP",
    tagline: "Luna blue, a green Start orb, and Bliss rolling on forever.",
    covers: ["2003"],
    mode: "windowed",
    chrome: "xp",
    bar: "taskbar",
    icon: "win",
    fontUi: "'Tahoma', 'Segoe UI', system-ui, sans-serif",
    fontBody: "'Tahoma', 'Segoe UI', system-ui, sans-serif",
    brand: "My Documents",
    tokens: {
      wallpaper:
        "linear-gradient(180deg, #4b8ee0 0%, #7db4ec 42%, #6aa84f 56%, #4e8a3a 100%)",
      surface: "#ece9d8",
      surfaceAlt: "#f6f4ec",
      text: "#0a0a0a",
      textMuted: "#4a4a42",
      accent: "#2a5fd0",
      accentText: "#ffffff",
      border: "#0a246a",
      titleBar: "linear-gradient(180deg, #0058ee 0%, #3a93ff 8%, #2b7bea 40%, #1b66d6 90%)",
      titleText: "#ffffff",
      iconLabel: "#ffffff",
    },
  },
  {
    id: "aqua06",
    year: "2006",
    os: "Aqua OS X",
    tagline: "Glossy gel buttons, brushed metal, and a dock that bounces.",
    covers: ["2006"],
    mode: "windowed",
    chrome: "aqua",
    bar: "dock",
    icon: "glossy",
    fontUi: "'Lucida Grande', -apple-system, 'Helvetica Neue', sans-serif",
    fontBody: "'Lucida Grande', -apple-system, 'Helvetica Neue', sans-serif",
    brand: "Finder",
    tokens: {
      wallpaper:
        "radial-gradient(120% 120% at 50% 0%, #6db3f5 0%, #2f7fd1 38%, #14538f 100%)",
      surface: "#ececec",
      surfaceAlt: "#f7f7f7",
      text: "#1a1a1a",
      textMuted: "#5a5a5a",
      accent: "#2f7fd1",
      accentText: "#ffffff",
      border: "#9aa0a6",
      titleBar: "linear-gradient(#e8e8e8, #cfcfcf)",
      titleText: "#2a2a2a",
      iconLabel: "#ffffff",
    },
  },
  {
    id: "win7",
    year: "2009",
    os: "Windows 7",
    tagline: "Aero glass, a glowing pearl Start, and the translucent superbar.",
    covers: ["2009"],
    mode: "windowed",
    chrome: "aero",
    bar: "taskbar",
    icon: "glossy",
    fontUi: "'Segoe UI', 'Tahoma', system-ui, sans-serif",
    fontBody: "'Segoe UI', 'Tahoma', system-ui, sans-serif",
    brand: "Libraries",
    tokens: {
      wallpaper: "radial-gradient(130% 100% at 50% 0%, #2e6db4 0%, #1c4f8f 45%, #0e2f5c 100%)",
      surface: "#f0f4f9",
      surfaceAlt: "#ffffff",
      text: "#1a1a1a",
      textMuted: "#5a6470",
      accent: "#1a8cff",
      accentText: "#ffffff",
      border: "#9bb7d4",
      titleBar: "rgba(190,215,240,0.55)",
      titleText: "#15233a",
      iconLabel: "#ffffff",
    },
  },
  {
    id: "flat15",
    year: "2015",
    os: "Flat / Metro",
    tagline: "Gradients gone. Pure color, thin type, and live tiles.",
    covers: ["2013"],
    mode: "windowed",
    chrome: "flat",
    bar: "topbar",
    icon: "tile",
    fontUi: "'Segoe UI', system-ui, -apple-system, sans-serif",
    fontBody: "'Segoe UI', system-ui, -apple-system, sans-serif",
    brand: "Start",
    tokens: {
      wallpaper: "linear-gradient(135deg, #1f2937 0%, #111827 100%)",
      surface: "#ffffff",
      surfaceAlt: "#f3f4f6",
      text: "#111827",
      textMuted: "#6b7280",
      accent: "#2563eb",
      accentText: "#ffffff",
      border: "#e5e7eb",
      titleBar: "#2563eb",
      titleText: "#ffffff",
      iconLabel: "#f9fafb",
    },
  },
  {
    id: "modern18",
    year: "2020",
    os: "Big Sur",
    tagline: "Translucent vibrancy, pillowy corners, a floating centered dock.",
    covers: ["2018"],
    mode: "windowed",
    chrome: "modern",
    bar: "dock",
    icon: "glossy",
    fontUi: "-apple-system, 'SF Pro Text', 'Segoe UI', system-ui, sans-serif",
    fontBody: "-apple-system, 'SF Pro Text', 'Segoe UI', system-ui, sans-serif",
    brand: "Finder",
    tokens: {
      wallpaper:
        "linear-gradient(160deg, #5b7cfa 0%, #9a6bff 38%, #ff7eb3 78%, #ffb86c 100%)",
      surface: "rgba(255,255,255,0.78)",
      surfaceAlt: "rgba(255,255,255,0.6)",
      text: "#1c1c1e",
      textMuted: "#6b6b70",
      accent: "#0a84ff",
      accentText: "#ffffff",
      border: "rgba(0,0,0,0.12)",
      titleBar: "rgba(255,255,255,0.55)",
      titleText: "#1c1c1e",
      iconLabel: "#ffffff",
    },
  },
  {
    id: "win11",
    year: "2021",
    os: "Windows 11",
    tagline: "Centered taskbar, Mica acrylic, and pillowy rounded everything.",
    covers: ["2021"],
    mode: "windowed",
    chrome: "modern",
    bar: "taskbar",
    icon: "glossy",
    fontUi: "'Segoe UI Variable', 'Segoe UI', system-ui, sans-serif",
    fontBody: "'Segoe UI Variable', 'Segoe UI', system-ui, sans-serif",
    brand: "File Explorer",
    tokens: {
      wallpaper: "radial-gradient(120% 90% at 50% 38%, #2f6fb0 0%, #1c4a86 42%, #0f2c57 100%)",
      surface: "rgba(245,248,252,0.82)",
      surfaceAlt: "rgba(255,255,255,0.9)",
      text: "#1a1a1a",
      textMuted: "#5a6470",
      accent: "#0067c0",
      accentText: "#ffffff",
      border: "rgba(0,0,0,0.1)",
      titleBar: "rgba(250,250,252,0.7)",
      titleText: "#1a1a1a",
      iconLabel: "#ffffff",
    },
  },
  {
    id: "vision23",
    year: "2023",
    os: "Spatial OS",
    tagline: "Glass windows floating in depth — pinch, drag, and look to navigate.",
    covers: ["2023"],
    mode: "windowed",
    chrome: "glass",
    bar: "none",
    icon: "card",
    fontUi: "-apple-system, 'SF Pro Display', 'Inter', system-ui, sans-serif",
    fontBody: "-apple-system, 'SF Pro Text', 'Inter', system-ui, sans-serif",
    brand: "Spatial",
    tokens: {
      wallpaper: "radial-gradient(80% 60% at 30% 20%, #2a2a44 0%, #15151f 55%, #08080d 100%)",
      surface: "rgba(40,42,60,0.45)",
      surfaceAlt: "rgba(60,64,88,0.45)",
      text: "#f2f3fa",
      textMuted: "#a6aac4",
      accent: "#7fd0ff",
      accentText: "#08080d",
      border: "rgba(255,255,255,0.22)",
      titleBar: "rgba(255,255,255,0.06)",
      titleText: "#f2f3fa",
      iconLabel: "#f2f3fa",
    },
  },
  {
    id: "ai26",
    year: "2026",
    os: "AI-native",
    tagline: "Describe what you want. The desktop assembles itself.",
    covers: ["2023", "2026"],
    mode: "windowed",
    chrome: "glass",
    bar: "prompt",
    icon: "card",
    fontUi: "var(--font-heading, 'Inter', system-ui, sans-serif)",
    fontBody: "var(--font-main, 'Inter', system-ui, sans-serif)",
    brand: "kiruk.os",
    tokens: {
      wallpaper:
        "radial-gradient(60% 80% at 15% 10%, rgba(139,92,246,0.45), transparent 60%), radial-gradient(50% 70% at 85% 20%, rgba(34,211,238,0.35), transparent 60%), radial-gradient(60% 80% at 60% 100%, rgba(236,72,153,0.3), transparent 60%), #070912",
      surface: "rgba(20,24,40,0.62)",
      surfaceAlt: "rgba(40,46,72,0.55)",
      text: "#e8ecff",
      textMuted: "#9aa3c8",
      accent: "#a78bfa",
      accentText: "#0b0d18",
      border: "rgba(167,139,250,0.32)",
      titleBar: "rgba(255,255,255,0.05)",
      titleText: "#e8ecff",
      iconLabel: "#e8ecff",
    },
  },
];

const BY_ID: Record<DesktopId, DesktopEra> = DESKTOP_ERAS.reduce(
  (acc, d) => ({ ...acc, [d.id]: d }),
  {} as Record<DesktopId, DesktopEra>,
);

export function getDesktop(id: DesktopId): DesktopEra {
  return BY_ID[id];
}

function relLum(hex: string): number {
  let h = hex.replace("#", "").trim();
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  if (h.length < 6) return 0.5;
  const r = Number.parseInt(h.slice(0, 2), 16) / 255;
  const g = Number.parseInt(h.slice(2, 4), 16) / 255;
  const b = Number.parseInt(h.slice(4, 6), 16) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Blend the live site-era accent into a desktop's OS chrome: keep the OS
 * structure (gray Win95, glossy Aqua…) but adopt the era's accent so sibling
 * eras inside one band (1995 vs 2003) feel distinct and cohesive with the rest
 * of the site. `accent` should be the live `--accent-color` CSS value so the
 * desktop matches exactly what the rest of the site is showing.
 */
export function blendDesktop(id: DesktopId, accent?: string): DesktopEra {
  const base = BY_ID[id];
  const a = (accent || "").trim();
  if (!a) return base;
  const accentText = relLum(a) > 0.6 ? "#0a0a0a" : "#ffffff";
  return {
    ...base,
    tokens: { ...base.tokens, accent: a, accentText, eraTint: a },
  };
}

/** Map any of the 15 site era ids → nearest curated desktop. */
export function nearestDesktopId(eraId: string): DesktopId {
  const hit = DESKTOP_ERAS.find((d) => d.covers.includes(eraId));
  if (hit) return hit.id;
  // Fall back by year proximity.
  const year = Number.parseInt(eraId, 10);
  if (Number.isNaN(year)) return "ai26";
  if (year <= 1975) return "term70";
  if (year < 1990) return "gui84";
  if (year < 1993) return "next91";
  if (year < 1995) return "win31";
  if (year < 1997) return "win95";
  if (year < 2000) return "macos8";
  if (year < 2001) return "win2k";
  if (year < 2006) return "winxp";
  if (year < 2009) return "aqua06";
  if (year < 2013) return "win7";
  if (year < 2018) return "flat15";
  if (year < 2021) return "modern18";
  if (year < 2023) return "win11";
  if (year < 2026) return "vision23";
  return "ai26";
}
