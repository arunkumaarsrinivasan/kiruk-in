"use client";

import { useMemo } from "react";
import type { OSThemeConfig } from "@/data/os-theme-config";

interface OSTaskbarProps {
  theme: OSThemeConfig;
  width: number;
}

export function OSTaskbar({ theme, width }: OSTaskbarProps) {
  const { taskbar, id } = theme;

  const containerStyle: React.CSSProperties = {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: width + 800,
    height: taskbar.height,
    background: taskbar.background,
    display: "flex",
    alignItems: "center",
    fontFamily: taskbar.font,
    color: taskbar.textColor,
    zIndex: 5,
    overflow: "hidden",
  };

  return (
    <div style={containerStyle}>
      <TaskbarContent theme={theme} />
    </div>
  );
}

// ============================================================================
// Taskbar Content by Theme
// ============================================================================

function TaskbarContent({ theme }: { theme: OSThemeConfig }) {
  const { taskbar, id } = theme;

  // Windows 98 - Classic Start bar
  if (id === "win98") {
    return (
      <div style={{ display: "flex", alignItems: "center", width: "100%", height: "100%", padding: "0 4px" }}>
        <div style={{
          borderTop: "2px solid #dfdfdf",
          borderLeft: "2px solid #dfdfdf",
          borderRight: "2px solid #808080",
          borderBottom: "2px solid #808080",
          height: "100%",
          width: "100%",
          display: "flex",
          alignItems: "center",
          padding: "2px 4px",
          gap: 4,
        }}>
          <StartButton98 />
          <div style={{ width: 1, height: "80%", background: "#808080", marginLeft: 2, marginRight: 2 }} />
          <div style={{ flex: 1 }} />
          <div style={{ width: 1, height: "80%", background: "#808080" }} />
          <ClockDisplay font={taskbar.font} color="#000000" bg="#c0c0c0" style98 />
        </div>
      </div>
    );
  }

  // Windows XP - Luna taskbar
  if (id === "winxp") {
    return (
      <div style={{ display: "flex", alignItems: "center", width: "100%", height: "100%", padding: "0 4px" }}>
        <StartButtonXP />
        <div style={{ flex: 1, display: "flex", alignItems: "center", paddingLeft: 8 }}>
          <TaskbarItem label="📄 journey.doc" font={taskbar.font} color="#ffffff" />
        </div>
        <ClockDisplay font={taskbar.font} color="#ffffff" />
      </div>
    );
  }

  // Windows 7 - Translucent taskbar
  if (id === "win7") {
    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        width: "100%",
        height: "100%",
        padding: "0 6px",
        borderTop: "1px solid rgba(255,255,255,0.15)",
      }}>
        <div style={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          background: "radial-gradient(circle, #3498db 0%, #2980b9 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "18px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
          flexShrink: 0,
        }}>
          ⊞
        </div>
        <div style={{ flex: 1, display: "flex", alignItems: "center", paddingLeft: 8, gap: 2 }}>
          <TaskbarPinnedIcon icon="📁" active />
          <TaskbarPinnedIcon icon="🌐" />
          <TaskbarPinnedIcon icon="📝" />
        </div>
        <ClockDisplay font={taskbar.font} color="#ffffff" />
      </div>
    );
  }

  // macOS (all variants) - Dock
  if (id === "macos-yosemite" || id === "macos-monterey" || id === "macos-sonoma") {
    return <MacDock theme={theme} />;
  }

  // Ubuntu - GNOME dock
  if (id === "ubuntu") {
    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        gap: 6,
      }}>
        <DockIcon icon="📂" label="Files" />
        <DockIcon icon="🌐" label="Firefox" />
        <DockIcon icon="🖥️" label="Terminal" />
        <DockIcon icon="📝" label="Text Editor" />
        <DockIcon icon="⚙️" label="Settings" />
      </div>
    );
  }

  // iOS - Home indicator
  if (id === "ios") {
    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        backdropFilter: "blur(30px)",
        gap: 12,
        padding: "0 16px",
      }}>
        <DockIcon icon="📱" label="Phone" rounded />
        <DockIcon icon="💬" label="Messages" rounded />
        <DockIcon icon="🎵" label="Music" rounded />
        <DockIcon icon="🌐" label="Safari" rounded />
        <div style={{
          position: "absolute",
          bottom: 8,
          left: "50%",
          transform: "translateX(-50%)",
          width: 120,
          height: 5,
          borderRadius: 3,
          background: "rgba(0,0,0,0.2)",
        }} />
      </div>
    );
  }

  // Chrome OS - Shelf
  if (id === "chromeos") {
    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        gap: 8,
        borderTop: "1px solid #e0e0e0",
      }}>
        <DockIcon icon="🌐" label="Chrome" />
        <DockIcon icon="📁" label="Files" />
        <DockIcon icon="📧" label="Gmail" />
        <DockIcon icon="📄" label="Docs" />
        <div style={{ position: "absolute", right: 12, display: "flex", alignItems: "center", gap: 6, fontSize: "11px", color: "#5f6368" }}>
          <span>🔋</span>
          <span>Wi-Fi</span>
          <ClockDisplay font={taskbar.font} color="#5f6368" small />
        </div>
      </div>
    );
  }

  // VS Code - Status bar
  if (id === "vscode") {
    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        width: "100%",
        height: "100%",
        padding: "0 8px",
        fontSize: "12px",
        fontFamily: "'Consolas', 'Fira Code', monospace",
        gap: 12,
      }}>
        <span style={{ color: "#ffffff" }}>⎇ main</span>
        <span style={{ color: "#ffffff" }}>↻ 0</span>
        <span style={{ color: "#ffffff" }}>⚠ 0</span>
        <div style={{ flex: 1 }} />
        <span style={{ color: "#ffffff" }}>Ln 1, Col 1</span>
        <span style={{ color: "#ffffff" }}>Spaces: 2</span>
        <span style={{ color: "#ffffff" }}>UTF-8</span>
        <span style={{ color: "#ffffff" }}>TypeScript React</span>
      </div>
    );
  }

  // Spatial - Floating dock
  if (id === "spatial") {
    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        gap: 16,
        backdropFilter: "blur(40px)",
        borderTop: "1px solid rgba(255,255,255,0.06)",
      }}>
        <DockIcon icon="🏠" label="Home" glow />
        <DockIcon icon="⚡" label="Create" glow />
        <DockIcon icon="🔮" label="Explore" glow />
        <DockIcon icon="✨" label="AI" glow />
      </div>
    );
  }

  return null;
}

// ============================================================================
// Sub-components
// ============================================================================

function StartButton98() {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 4,
      padding: "2px 6px",
      background: "#c0c0c0",
      borderTop: "2px solid #dfdfdf",
      borderLeft: "2px solid #dfdfdf",
      borderRight: "2px solid #808080",
      borderBottom: "2px solid #808080",
      fontSize: "12px",
      fontWeight: "bold",
      fontFamily: "'MS Sans Serif', 'Tahoma', sans-serif",
      cursor: "default",
      flexShrink: 0,
    }}>
      <span style={{ fontSize: "14px" }}>⊞</span>
      <span>Start</span>
    </div>
  );
}

function StartButtonXP() {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 4,
      padding: "4px 10px",
      background: "linear-gradient(180deg, #3c8f3a 0%, #2d7b2a 50%, #276f25 100%)",
      borderRadius: "0 8px 8px 0",
      fontSize: "13px",
      fontWeight: "bold",
      fontFamily: "'Trebuchet MS', 'Tahoma', sans-serif",
      color: "#ffffff",
      cursor: "default",
      flexShrink: 0,
      textShadow: "0 1px 1px rgba(0,0,0,0.3)",
      height: "80%",
    }}>
      <span style={{ fontSize: "16px" }}>⊞</span>
      <span style={{ fontStyle: "italic" }}>start</span>
    </div>
  );
}

function TaskbarItem({ label, font, color }: { label: string; font: string; color: string }) {
  return (
    <div style={{
      padding: "2px 8px",
      fontSize: "12px",
      fontFamily: font,
      color,
      background: "rgba(255,255,255,0.1)",
      borderRadius: 2,
    }}>
      {label}
    </div>
  );
}

function TaskbarPinnedIcon({ icon, active }: { icon: string; active?: boolean }) {
  return (
    <div style={{
      width: 36,
      height: 36,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "18px",
      background: active ? "rgba(255,255,255,0.15)" : "transparent",
      borderRadius: 4,
      borderBottom: active ? "2px solid #3498db" : "2px solid transparent",
    }}>
      {icon}
    </div>
  );
}

function DockIcon({
  icon,
  label,
  rounded,
  glow,
}: {
  icon: string;
  label: string;
  rounded?: boolean;
  glow?: boolean;
}) {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 2,
    }}>
      <div style={{
        width: 36,
        height: 36,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "20px",
        borderRadius: rounded ? 10 : 8,
        background: glow ? "rgba(124,124,255,0.1)" : "rgba(255,255,255,0.08)",
        boxShadow: glow ? "0 0 10px rgba(124,124,255,0.1)" : "none",
      }}>
        {icon}
      </div>
    </div>
  );
}

function ClockDisplay({
  font,
  color,
  bg,
  style98,
  small,
}: {
  font: string;
  color: string;
  bg?: string;
  style98?: boolean;
  small?: boolean;
}) {
  const time = useMemo(() => {
    const now = new Date();
    const h = now.getHours();
    const m = now.getMinutes().toString().padStart(2, "0");
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    return `${h12}:${m} ${ampm}`;
  }, []);

  const clockStyle: React.CSSProperties = {
    fontSize: small ? "11px" : "12px",
    fontFamily: font,
    color,
    padding: style98 ? "2px 8px" : "0 8px",
    background: style98 ? bg : "transparent",
    whiteSpace: "nowrap",
  };

  if (style98) {
    clockStyle.borderTop = "1px solid #808080";
    clockStyle.borderLeft = "1px solid #808080";
    clockStyle.borderRight = "1px solid #ffffff";
    clockStyle.borderBottom = "1px solid #ffffff";
  }

  return <div style={clockStyle}>{time}</div>;
}

function MacDock({ theme }: { theme: OSThemeConfig }) {
  const isDark = theme.id === "macos-monterey" || theme.id === "macos-sonoma";

  return (
    <div style={{
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "center",
      width: "100%",
      height: "100%",
      paddingBottom: 4,
    }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        padding: "4px 8px",
        background: isDark ? "rgba(40,40,40,0.7)" : "rgba(240,240,240,0.7)",
        backdropFilter: "blur(20px)",
        borderRadius: 16,
        border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
      }}>
        <DockIcon icon="📁" label="Finder" rounded />
        <DockIcon icon="🌐" label="Safari" rounded />
        <DockIcon icon="📧" label="Mail" rounded />
        <DockIcon icon="🗒️" label="Notes" rounded />
        <DockIcon icon="⚙️" label="Settings" rounded />
        <DockIcon icon="🖥️" label="Terminal" rounded />
      </div>
    </div>
  );
}
