"use client";

import { ReactNode } from "react";
import type { OSThemeConfig, OSThemeId } from "@/data/os-theme-config";

interface OSWindowChromeProps {
  theme: OSThemeConfig;
  title: string;
  children: ReactNode;
  className?: string;
}

// ============================================================================
// Window Button Renderers
// ============================================================================

function Win98Buttons() {
  const btnBase: React.CSSProperties = {
    width: 16,
    height: 14,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "10px",
    fontFamily: "'Marlett', sans-serif",
    fontWeight: "bold",
    background: "#c0c0c0",
    borderTop: "1px solid #ffffff",
    borderLeft: "1px solid #ffffff",
    borderRight: "1px solid #808080",
    borderBottom: "1px solid #808080",
    lineHeight: 1,
    color: "#000000",
  };
  return (
    <div style={{ display: "flex", gap: 2 }}>
      <div style={btnBase}>_</div>
      <div style={btnBase}>□</div>
      <div style={btnBase}>×</div>
    </div>
  );
}

function WinXPButtons() {
  const btnBase: React.CSSProperties = {
    width: 20,
    height: 20,
    borderRadius: 4,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "11px",
    fontWeight: "bold",
    color: "#ffffff",
    border: "1px solid rgba(0,0,0,0.3)",
  };
  return (
    <div style={{ display: "flex", gap: 2 }}>
      <div style={{ ...btnBase, background: "linear-gradient(180deg, #3a8cf4 0%, #2a6ed4 100%)" }}>_</div>
      <div style={{ ...btnBase, background: "linear-gradient(180deg, #3a8cf4 0%, #2a6ed4 100%)" }}>□</div>
      <div style={{ ...btnBase, background: "linear-gradient(180deg, #e08050 0%, #c04040 100%)" }}>×</div>
    </div>
  );
}

function Win7Buttons() {
  const btnBase: React.CSSProperties = {
    width: 28,
    height: 20,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    color: "#333",
    background: "rgba(255,255,255,0.3)",
    borderRadius: 0,
    border: "none",
    transition: "background 0.15s",
  };
  return (
    <div style={{ display: "flex", gap: 0 }}>
      <div style={btnBase}>─</div>
      <div style={btnBase}>□</div>
      <div style={{ ...btnBase, color: "#333", borderRadius: "0 0 0 0" }}>×</div>
    </div>
  );
}

function MacTrafficLights({ size = 12, dark = false }: { size?: number; dark?: boolean }) {
  const colors = dark
    ? { close: "#ff5f57", minimize: "#febc2e", maximize: "#28c840" }
    : { close: "#ff5f57", minimize: "#febc2e", maximize: "#28c840" };

  const dotStyle = (color: string): React.CSSProperties => ({
    width: size,
    height: size,
    borderRadius: "50%",
    background: color,
    border: `0.5px solid rgba(0,0,0,0.12)`,
  });

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <div style={dotStyle(colors.close)} />
      <div style={dotStyle(colors.minimize)} />
      <div style={dotStyle(colors.maximize)} />
    </div>
  );
}

function UbuntuButtons() {
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#e95420", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "9px", color: "#fff" }}>×</div>
      <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#555", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "9px", color: "#aaa" }}>–</div>
      <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#555", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "9px", color: "#aaa" }}>+</div>
    </div>
  );
}

function IOSGrabber() {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "8px 0 4px" }}>
      <div style={{ width: 36, height: 5, borderRadius: 3, background: "rgba(0,0,0,0.15)" }} />
    </div>
  );
}

function VSCodeTabs({ title }: { title: string }) {
  return (
    <div style={{ display: "flex", alignItems: "stretch", gap: 0, height: "100%" }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "0 12px",
        background: "#1e1e1e",
        borderBottom: "1px solid #007acc",
        fontSize: "12px",
        color: "#cccccc",
        fontFamily: "'Consolas', 'Fira Code', monospace",
      }}>
        <span style={{ color: "#519aba" }}>📄</span>
        <span>{title}.tsx</span>
        <span style={{ color: "#666", marginLeft: 4, fontSize: "10px", cursor: "pointer" }}>×</span>
      </div>
      <div style={{
        display: "flex",
        alignItems: "center",
        padding: "0 12px",
        background: "#2d2d2d",
        fontSize: "12px",
        color: "#888",
        fontFamily: "'Consolas', 'Fira Code', monospace",
      }}>
        README.md
      </div>
    </div>
  );
}

function SpatialHandle() {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "6px 0 2px" }}>
      <div style={{
        width: 40,
        height: 4,
        borderRadius: 2,
        background: "linear-gradient(90deg, rgba(124,124,255,0.3), rgba(199,125,255,0.3))",
      }} />
    </div>
  );
}

// ============================================================================
// Title Bar Renderers by Theme
// ============================================================================

function TitleBar({ theme, title }: { theme: OSThemeConfig; title: string }) {
  const { windowChrome, id } = theme;
  const isButtonsLeft = windowChrome.buttons.position === "left";

  const titleBarStyle: React.CSSProperties = {
    height: windowChrome.titleBarHeight,
    background: windowChrome.titleBarBg,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 10px",
    color: windowChrome.titleBarTextColor,
    fontFamily: windowChrome.titleBarFont,
    fontSize: id === "vscode" ? "12px" : "13px",
    fontWeight: id === "win98" ? "bold" : "normal",
    borderTopLeftRadius: windowChrome.borderRadius,
    borderTopRightRadius: windowChrome.borderRadius,
    userSelect: "none",
    flexShrink: 0,
  };

  // Special renderers for certain themes
  if (id === "ios") {
    return <IOSGrabber />;
  }

  if (id === "spatial") {
    return <SpatialHandle />;
  }

  if (id === "vscode") {
    return (
      <div style={{ ...titleBarStyle, padding: 0, gap: 0, justifyContent: "flex-start" }}>
        <div style={{ display: "flex", alignItems: "center", padding: "0 8px", gap: 8, flexShrink: 0 }}>
          <span style={{ fontSize: "12px", color: "#007acc" }}>⬡</span>
        </div>
        <div style={{ flex: 1, display: "flex", alignItems: "stretch", height: "100%", overflow: "hidden" }}>
          <VSCodeTabs title={title.split(" ")[0] || "journey"} />
        </div>
        <div style={{ display: "flex", gap: 0, padding: "0 4px" }}>
          <div style={{ width: 30, height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#ccc", fontSize: "13px" }}>─</div>
          <div style={{ width: 30, height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#ccc", fontSize: "13px" }}>□</div>
          <div style={{ width: 30, height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#ccc", fontSize: "13px" }}>×</div>
        </div>
      </div>
    );
  }

  const renderButtons = () => {
    switch (id as OSThemeId) {
      case "win98": return <Win98Buttons />;
      case "winxp": return <WinXPButtons />;
      case "win7": return <Win7Buttons />;
      case "macos-yosemite": return <MacTrafficLights size={12} />;
      case "ubuntu": return <UbuntuButtons />;
      case "macos-monterey": return <MacTrafficLights size={12} dark />;
      case "macos-sonoma": return <MacTrafficLights size={12} dark />;
      case "chromeos":
        return (
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ width: 12, height: 12, borderRadius: "50%", border: "1px solid #dadce0" }} />
            <div style={{ width: 12, height: 12, borderRadius: "50%", border: "1px solid #dadce0" }} />
            <div style={{ width: 12, height: 12, borderRadius: "50%", border: "1px solid #dadce0" }} />
          </div>
        );
      default: return null;
    }
  };

  const titleText = (
    <span style={{
      flex: 1,
      textAlign: isButtonsLeft ? "center" : "left",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      paddingLeft: isButtonsLeft ? 0 : 4,
    }}>
      {(id === "win98" || id === "winxp") && (
        <span style={{ marginRight: 4, fontSize: "12px" }}>📄</span>
      )}
      {title}
    </span>
  );

  return (
    <div style={titleBarStyle}>
      {isButtonsLeft ? (
        <>
          {renderButtons()}
          {titleText}
        </>
      ) : (
        <>
          {titleText}
          {renderButtons()}
        </>
      )}
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function OSWindowChrome({ theme, title, children, className }: OSWindowChromeProps) {
  const { windowChrome, cardBg, id } = theme;

  const windowStyle: React.CSSProperties = {
    borderRadius: windowChrome.borderRadius,
    border: `${windowChrome.borderWidth}px solid ${windowChrome.borderColor}`,
    background: cardBg,
    overflow: "hidden",
    fontFamily: theme.fontFamily,
    ...(windowChrome.extraStyles || {}),
  };

  // Win98 needs special 3D border treatment
  if (id === "win98") {
    windowStyle.borderTop = "2px solid #dfdfdf";
    windowStyle.borderLeft = "2px solid #dfdfdf";
    windowStyle.borderRight = "2px solid #808080";
    windowStyle.borderBottom = "2px solid #808080";
    windowStyle.boxShadow = "2px 2px 0 #000000";
  }

  return (
    <div className={className} style={windowStyle}>
      <TitleBar theme={theme} title={title} />
      <div style={{ position: "relative" }}>
        {children}
      </div>
    </div>
  );
}
