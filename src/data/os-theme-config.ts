/**
 * OS Theme Configuration for About Page Journey
 *
 * Maps each life-event year to an era-appropriate operating system theme.
 * Components consume this config for desktop wallpaper, window chrome,
 * taskbar, and accent colors.
 */

export type OSThemeId =
  | "win98"
  | "winxp"
  | "win7"
  | "macos-yosemite"
  | "ubuntu"
  | "ios"
  | "chromeos"
  | "macos-monterey"
  | "vscode"
  | "macos-sonoma"
  | "spatial";

export interface WindowButtonStyle {
  shape: "square" | "circle";
  size: number;
  colors: { close: string; minimize: string; maximize: string };
  position: "right" | "left";
}

export interface WindowChromeStyle {
  titleBarBg: string;
  titleBarHeight: number;
  titleBarTextColor: string;
  titleBarFont: string;
  borderRadius: number;
  borderColor: string;
  borderWidth: number;
  buttons: WindowButtonStyle;
  /** Additional CSS for 3D/glass effects */
  extraStyles?: Record<string, string>;
}

export interface TaskbarStyle {
  height: number;
  background: string;
  position: "bottom" | "top";
  textColor: string;
  font: string;
  hasStartButton?: boolean;
  startButtonLabel?: string;
  startButtonBg?: string;
  hasDock?: boolean;
  hasStatusBar?: boolean;
}

export interface OSThemeConfig {
  id: OSThemeId;
  name: string;
  /** Year(s) this theme covers */
  years: number[];
  /** CSS gradient or color for the desktop wallpaper */
  wallpaper: string;
  /** Optional pattern overlay on wallpaper */
  wallpaperPattern?: string;
  windowChrome: WindowChromeStyle;
  taskbar: TaskbarStyle;
  accentColor: string;
  secondaryColor: string;
  textColor: string;
  mutedTextColor: string;
  cardBg: string;
  fontFamily: string;
  /** Decorative desktop icon labels */
  desktopIcons?: Array<{ icon: string; label: string }>;
}

// ============================================================================
// THEME DEFINITIONS
// ============================================================================

const win98: OSThemeConfig = {
  id: "win98",
  name: "Windows 98",
  years: [2001],
  wallpaper: "linear-gradient(180deg, #008080 0%, #008080 100%)",
  windowChrome: {
    titleBarBg: "linear-gradient(90deg, #000080 0%, #1084d0 100%)",
    titleBarHeight: 28,
    titleBarTextColor: "#ffffff",
    titleBarFont: "'MS Sans Serif', 'Tahoma', sans-serif",
    borderRadius: 0,
    borderColor: "#dfdfdf",
    borderWidth: 2,
    buttons: {
      shape: "square",
      size: 16,
      colors: { close: "#c0c0c0", minimize: "#c0c0c0", maximize: "#c0c0c0" },
      position: "right",
    },
    extraStyles: {
      borderTop: "2px solid #ffffff",
      borderLeft: "2px solid #ffffff",
      borderRight: "2px solid #808080",
      borderBottom: "2px solid #808080",
      boxShadow: "inset 1px 1px 0 #dfdfdf, inset -1px -1px 0 #808080, 2px 2px 0 #000000",
    },
  },
  taskbar: {
    height: 36,
    background: "#c0c0c0",
    position: "bottom",
    textColor: "#000000",
    font: "'MS Sans Serif', 'Tahoma', sans-serif",
    hasStartButton: true,
    startButtonLabel: "Start",
    startButtonBg: "#c0c0c0",
  },
  accentColor: "#000080",
  secondaryColor: "#008080",
  textColor: "#000000",
  mutedTextColor: "#808080",
  cardBg: "#c0c0c0",
  fontFamily: "'MS Sans Serif', 'Tahoma', sans-serif",
  desktopIcons: [
    { icon: "🖥️", label: "My Computer" },
    { icon: "🗑️", label: "Recycle Bin" },
    { icon: "📁", label: "My Documents" },
  ],
};

const winxp: OSThemeConfig = {
  id: "winxp",
  name: "Windows XP",
  years: [2008],
  wallpaper: "linear-gradient(180deg, #245EDC 0%, #3A8BF5 30%, #87CEEB 60%, #78B944 75%, #5A9A32 100%)",
  windowChrome: {
    titleBarBg: "linear-gradient(180deg, #0058e6 0%, #3a8cf4 40%, #1565d8 100%)",
    titleBarHeight: 30,
    titleBarTextColor: "#ffffff",
    titleBarFont: "'Trebuchet MS', 'Tahoma', sans-serif",
    borderRadius: 8,
    borderColor: "#0055e5",
    borderWidth: 1,
    buttons: {
      shape: "circle",
      size: 20,
      colors: { close: "#e04343", minimize: "#3586e0", maximize: "#3586e0" },
      position: "right",
    },
    extraStyles: {
      boxShadow: "0 2px 10px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.3)",
    },
  },
  taskbar: {
    height: 38,
    background: "linear-gradient(180deg, #235ADB 0%, #1941A5 100%)",
    position: "bottom",
    textColor: "#ffffff",
    font: "'Trebuchet MS', 'Tahoma', sans-serif",
    hasStartButton: true,
    startButtonLabel: "start",
    startButtonBg: "linear-gradient(180deg, #3c8f3a 0%, #2d7b2a 100%)",
  },
  accentColor: "#0058e6",
  secondaryColor: "#3c8f3a",
  textColor: "#000000",
  mutedTextColor: "#555555",
  cardBg: "#ECE9D8",
  fontFamily: "'Trebuchet MS', 'Tahoma', sans-serif",
  desktopIcons: [
    { icon: "🖥️", label: "My Computer" },
    { icon: "🗑️", label: "Recycle Bin" },
    { icon: "🌐", label: "Internet Explorer" },
  ],
};

const win7: OSThemeConfig = {
  id: "win7",
  name: "Windows 7",
  years: [2014],
  wallpaper: "linear-gradient(180deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)",
  wallpaperPattern: "radial-gradient(ellipse at 50% 80%, rgba(52,152,219,0.15) 0%, transparent 60%)",
  windowChrome: {
    titleBarBg: "linear-gradient(180deg, rgba(185,209,234,0.85) 0%, rgba(164,195,228,0.75) 100%)",
    titleBarHeight: 32,
    titleBarTextColor: "#1a1a2e",
    titleBarFont: "'Segoe UI', sans-serif",
    borderRadius: 6,
    borderColor: "rgba(100,150,200,0.5)",
    borderWidth: 1,
    buttons: {
      shape: "square",
      size: 18,
      colors: { close: "#c42b1c", minimize: "rgba(185,209,234,0.6)", maximize: "rgba(185,209,234,0.6)" },
      position: "right",
    },
    extraStyles: {
      backdropFilter: "blur(20px)",
      boxShadow: "0 4px 20px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.4)",
    },
  },
  taskbar: {
    height: 44,
    background: "linear-gradient(180deg, rgba(30,60,110,0.9) 0%, rgba(20,40,80,0.95) 100%)",
    position: "bottom",
    textColor: "#ffffff",
    font: "'Segoe UI', sans-serif",
    hasStartButton: true,
    startButtonLabel: "",
    startButtonBg: "radial-gradient(circle, #3498db 0%, #2980b9 100%)",
  },
  accentColor: "#3498db",
  secondaryColor: "#2c3e50",
  textColor: "#1a1a2e",
  mutedTextColor: "#5a6a7a",
  cardBg: "rgba(240,245,255,0.92)",
  fontFamily: "'Segoe UI', sans-serif",
  desktopIcons: [
    { icon: "💻", label: "Computer" },
    { icon: "🗑️", label: "Recycle Bin" },
    { icon: "📁", label: "Libraries" },
  ],
};

const macosYosemite: OSThemeConfig = {
  id: "macos-yosemite",
  name: "macOS Yosemite",
  years: [2018],
  wallpaper: "linear-gradient(160deg, #1b4f72 0%, #2e86c1 30%, #85c1e9 60%, #d4e6f1 90%)",
  windowChrome: {
    titleBarBg: "linear-gradient(180deg, #ececec 0%, #d6d6d6 100%)",
    titleBarHeight: 28,
    titleBarTextColor: "#333333",
    titleBarFont: "-apple-system, 'Helvetica Neue', sans-serif",
    borderRadius: 10,
    borderColor: "#b0b0b0",
    borderWidth: 1,
    buttons: {
      shape: "circle",
      size: 12,
      colors: { close: "#ff5f57", minimize: "#febc2e", maximize: "#28c840" },
      position: "left",
    },
    extraStyles: {
      boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
    },
  },
  taskbar: {
    height: 56,
    background: "linear-gradient(180deg, rgba(240,240,240,0.7) 0%, rgba(220,220,220,0.85) 100%)",
    position: "bottom",
    textColor: "#333333",
    font: "-apple-system, 'Helvetica Neue', sans-serif",
    hasDock: true,
  },
  accentColor: "#007aff",
  secondaryColor: "#5856d6",
  textColor: "#1d1d1f",
  mutedTextColor: "#86868b",
  cardBg: "#f5f5f7",
  fontFamily: "-apple-system, 'Helvetica Neue', sans-serif",
  desktopIcons: [
    { icon: "💾", label: "Macintosh HD" },
  ],
};

const ubuntu: OSThemeConfig = {
  id: "ubuntu",
  name: "Ubuntu",
  years: [2019],
  wallpaper: "linear-gradient(135deg, #2c001e 0%, #5e2750 30%, #e95420 70%, #f0a500 100%)",
  windowChrome: {
    titleBarBg: "#2d2d2d",
    titleBarHeight: 36,
    titleBarTextColor: "#ffffff",
    titleBarFont: "'Ubuntu', 'Cantarell', sans-serif",
    borderRadius: 12,
    borderColor: "#3d3d3d",
    borderWidth: 1,
    buttons: {
      shape: "circle",
      size: 14,
      colors: { close: "#e95420", minimize: "#555555", maximize: "#555555" },
      position: "right",
    },
    extraStyles: {
      boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
    },
  },
  taskbar: {
    height: 48,
    background: "rgba(30,30,30,0.9)",
    position: "bottom",
    textColor: "#ffffff",
    font: "'Ubuntu', 'Cantarell', sans-serif",
    hasDock: true,
  },
  accentColor: "#e95420",
  secondaryColor: "#77216f",
  textColor: "#ffffff",
  mutedTextColor: "#999999",
  cardBg: "#3d3d3d",
  fontFamily: "'Ubuntu', 'Cantarell', sans-serif",
  desktopIcons: [
    { icon: "📂", label: "Files" },
    { icon: "🖥️", label: "Terminal" },
  ],
};

const ios: OSThemeConfig = {
  id: "ios",
  name: "iOS / iPadOS",
  years: [2020],
  wallpaper: "linear-gradient(135deg, #667eea 0%, #764ba2 30%, #f093fb 60%, #ffecd2 100%)",
  windowChrome: {
    titleBarBg: "rgba(255,255,255,0.72)",
    titleBarHeight: 24,
    titleBarTextColor: "#1d1d1f",
    titleBarFont: "-apple-system, 'SF Pro Display', sans-serif",
    borderRadius: 20,
    borderColor: "rgba(255,255,255,0.3)",
    borderWidth: 0,
    buttons: {
      shape: "circle",
      size: 6,
      colors: { close: "transparent", minimize: "transparent", maximize: "transparent" },
      position: "left",
    },
    extraStyles: {
      backdropFilter: "blur(40px) saturate(180%)",
      boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
    },
  },
  taskbar: {
    height: 80,
    background: "rgba(255,255,255,0.4)",
    position: "bottom",
    textColor: "#1d1d1f",
    font: "-apple-system, 'SF Pro Display', sans-serif",
    hasDock: true,
  },
  accentColor: "#007aff",
  secondaryColor: "#af52de",
  textColor: "#1d1d1f",
  mutedTextColor: "#8e8e93",
  cardBg: "rgba(255,255,255,0.72)",
  fontFamily: "-apple-system, 'SF Pro Display', sans-serif",
};

const chromeos: OSThemeConfig = {
  id: "chromeos",
  name: "Chrome OS",
  years: [2021],
  wallpaper: "linear-gradient(180deg, #e8f0fe 0%, #d2e3fc 40%, #a8c7fa 100%)",
  windowChrome: {
    titleBarBg: "#ffffff",
    titleBarHeight: 36,
    titleBarTextColor: "#202124",
    titleBarFont: "'Google Sans', 'Roboto', sans-serif",
    borderRadius: 12,
    borderColor: "#dadce0",
    borderWidth: 1,
    buttons: {
      shape: "circle",
      size: 12,
      colors: { close: "#5f6368", minimize: "#5f6368", maximize: "#5f6368" },
      position: "right",
    },
    extraStyles: {
      boxShadow: "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08)",
    },
  },
  taskbar: {
    height: 48,
    background: "rgba(255,255,255,0.9)",
    position: "bottom",
    textColor: "#202124",
    font: "'Google Sans', 'Roboto', sans-serif",
    hasDock: true,
  },
  accentColor: "#1a73e8",
  secondaryColor: "#34a853",
  textColor: "#202124",
  mutedTextColor: "#5f6368",
  cardBg: "#ffffff",
  fontFamily: "'Google Sans', 'Roboto', sans-serif",
  desktopIcons: [
    { icon: "🌐", label: "Chrome" },
    { icon: "📁", label: "Files" },
  ],
};

const macosMonterey: OSThemeConfig = {
  id: "macos-monterey",
  name: "macOS Monterey",
  years: [2022],
  wallpaper: "linear-gradient(135deg, #1a1a2e 0%, #3d1d6b 20%, #6929c4 40%, #be95ff 60%, #ff7eb6 80%, #ffb86c 100%)",
  windowChrome: {
    titleBarBg: "rgba(40,40,40,0.85)",
    titleBarHeight: 28,
    titleBarTextColor: "#e0e0e0",
    titleBarFont: "-apple-system, 'SF Pro Display', sans-serif",
    borderRadius: 10,
    borderColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    buttons: {
      shape: "circle",
      size: 12,
      colors: { close: "#ff5f57", minimize: "#febc2e", maximize: "#28c840" },
      position: "left",
    },
    extraStyles: {
      backdropFilter: "blur(20px)",
      boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
    },
  },
  taskbar: {
    height: 64,
    background: "rgba(30,30,30,0.6)",
    position: "bottom",
    textColor: "#ffffff",
    font: "-apple-system, 'SF Pro Display', sans-serif",
    hasDock: true,
  },
  accentColor: "#6929c4",
  secondaryColor: "#ff7eb6",
  textColor: "#f0f0f0",
  mutedTextColor: "#888888",
  cardBg: "rgba(40,40,40,0.85)",
  fontFamily: "-apple-system, 'SF Pro Display', sans-serif",
  desktopIcons: [
    { icon: "💾", label: "Macintosh HD" },
  ],
};

const vscode: OSThemeConfig = {
  id: "vscode",
  name: "VS Code",
  years: [2023],
  wallpaper: "#1e1e1e",
  windowChrome: {
    titleBarBg: "#323233",
    titleBarHeight: 34,
    titleBarTextColor: "#cccccc",
    titleBarFont: "'Consolas', 'Fira Code', monospace",
    borderRadius: 0,
    borderColor: "#3c3c3c",
    borderWidth: 1,
    buttons: {
      shape: "square",
      size: 14,
      colors: { close: "#c42b1c", minimize: "#3c3c3c", maximize: "#3c3c3c" },
      position: "right",
    },
    extraStyles: {
      boxShadow: "0 4px 16px rgba(0,0,0,0.6)",
    },
  },
  taskbar: {
    height: 28,
    background: "#007acc",
    position: "bottom",
    textColor: "#ffffff",
    font: "'Consolas', 'Fira Code', monospace",
    hasStatusBar: true,
  },
  accentColor: "#007acc",
  secondaryColor: "#4ec9b0",
  textColor: "#d4d4d4",
  mutedTextColor: "#808080",
  cardBg: "#252526",
  fontFamily: "'Consolas', 'Fira Code', monospace",
  desktopIcons: [
    { icon: "📄", label: "index.ts" },
    { icon: "📂", label: "src" },
    { icon: "⚙️", label: ".config" },
  ],
};

const macosSonoma: OSThemeConfig = {
  id: "macos-sonoma",
  name: "macOS Sonoma",
  years: [2024],
  wallpaper: "linear-gradient(135deg, #1a1a2e 0%, #e67e22 25%, #f39c12 40%, #f9e547 55%, #76d7c4 70%, #2980b9 100%)",
  windowChrome: {
    titleBarBg: "rgba(30,30,30,0.72)",
    titleBarHeight: 28,
    titleBarTextColor: "#e0e0e0",
    titleBarFont: "-apple-system, 'SF Pro Display', sans-serif",
    borderRadius: 12,
    borderColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    buttons: {
      shape: "circle",
      size: 12,
      colors: { close: "#ff5f57", minimize: "#febc2e", maximize: "#28c840" },
      position: "left",
    },
    extraStyles: {
      backdropFilter: "blur(30px) saturate(150%)",
      boxShadow: "0 8px 40px rgba(0,0,0,0.4)",
    },
  },
  taskbar: {
    height: 64,
    background: "rgba(30,30,30,0.5)",
    position: "bottom",
    textColor: "#ffffff",
    font: "-apple-system, 'SF Pro Display', sans-serif",
    hasDock: true,
  },
  accentColor: "#ff9f0a",
  secondaryColor: "#30d158",
  textColor: "#f0f0f0",
  mutedTextColor: "#888888",
  cardBg: "rgba(30,30,30,0.72)",
  fontFamily: "-apple-system, 'SF Pro Display', sans-serif",
};

const spatial: OSThemeConfig = {
  id: "spatial",
  name: "Spatial UI",
  years: [2025],
  wallpaper: "linear-gradient(135deg, #0a0a1a 0%, #101030 30%, #1a1a40 60%, #0d0d20 100%)",
  wallpaperPattern: "radial-gradient(ellipse at 30% 40%, rgba(100,100,255,0.08) 0%, transparent 50%), radial-gradient(ellipse at 70% 60%, rgba(200,100,255,0.06) 0%, transparent 50%)",
  windowChrome: {
    titleBarBg: "rgba(255,255,255,0.05)",
    titleBarHeight: 20,
    titleBarTextColor: "rgba(255,255,255,0.7)",
    titleBarFont: "'Inter', 'SF Pro Display', sans-serif",
    borderRadius: 24,
    borderColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    buttons: {
      shape: "circle",
      size: 8,
      colors: { close: "rgba(255,255,255,0.2)", minimize: "rgba(255,255,255,0.1)", maximize: "rgba(255,255,255,0.1)" },
      position: "left",
    },
    extraStyles: {
      backdropFilter: "blur(60px) saturate(150%)",
      boxShadow: "0 8px 60px rgba(100,100,255,0.1), inset 0 0.5px 0 rgba(255,255,255,0.1)",
      background: "rgba(255,255,255,0.03)",
    },
  },
  taskbar: {
    height: 56,
    background: "rgba(255,255,255,0.04)",
    position: "bottom",
    textColor: "rgba(255,255,255,0.7)",
    font: "'Inter', 'SF Pro Display', sans-serif",
    hasDock: true,
  },
  accentColor: "#7c7cff",
  secondaryColor: "#c77dff",
  textColor: "rgba(255,255,255,0.9)",
  mutedTextColor: "rgba(255,255,255,0.4)",
  cardBg: "rgba(255,255,255,0.05)",
  fontFamily: "'Inter', 'SF Pro Display', sans-serif",
};

// ============================================================================
// THEME REGISTRY
// ============================================================================

export const OS_THEMES: OSThemeConfig[] = [
  win98,
  winxp,
  win7,
  macosYosemite,
  ubuntu,
  ios,
  chromeos,
  macosMonterey,
  vscode,
  macosSonoma,
  spatial,
];

/** Get OS theme config for a given year */
export function getOSTheme(year: number): OSThemeConfig {
  const theme = OS_THEMES.find((t) => t.years.includes(year));
  if (theme) return theme;

  // Fallback: find closest year
  let closest = OS_THEMES[0];
  let minDist = Infinity;
  for (const t of OS_THEMES) {
    for (const y of t.years) {
      const dist = Math.abs(y - year);
      if (dist < minDist) {
        minDist = dist;
        closest = t;
      }
    }
  }
  return closest;
}

/** Get OS theme by ID */
export function getOSThemeById(id: OSThemeId): OSThemeConfig {
  return OS_THEMES.find((t) => t.id === id) || OS_THEMES[0];
}
