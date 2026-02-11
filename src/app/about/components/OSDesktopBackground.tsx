"use client";

import { useMemo } from "react";
import type { OSThemeConfig } from "@/data/os-theme-config";

interface OSDesktopBackgroundProps {
  theme: OSThemeConfig;
  className?: string;
}

export function OSDesktopBackground({ theme, className = "" }: OSDesktopBackgroundProps) {
  const icons = useMemo(() => theme.desktopIcons || [], [theme.desktopIcons]);

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {/* Wallpaper */}
      <div
        className="absolute inset-0"
        style={{ background: theme.wallpaper }}
      />

      {/* Wallpaper pattern overlay */}
      {theme.wallpaperPattern && (
        <div
          className="absolute inset-0"
          style={{ background: theme.wallpaperPattern }}
        />
      )}

      {/* Desktop Icons */}
      {icons.length > 0 && (
        <div
          className="absolute top-20 left-4 flex flex-col gap-6 pointer-events-none z-5"
          style={{ fontFamily: theme.fontFamily }}
        >
          {icons.map((icon, i) => (
            <DesktopIcon
              key={i}
              icon={icon.icon}
              label={icon.label}
              themeId={theme.id}
              textColor={theme.id === "win98" || theme.id === "winxp" || theme.id === "chromeos"
                ? "#ffffff"
                : theme.mutedTextColor}
            />
          ))}
        </div>
      )}

      {/* OS-specific decorative elements */}
      <OSDecoration themeId={theme.id} />
    </div>
  );
}

// ============================================================================
// Desktop Icon
// ============================================================================

function DesktopIcon({
  icon,
  label,
  themeId,
  textColor,
}: {
  icon: string;
  label: string;
  themeId: string;
  textColor: string;
}) {
  // Win98/XP style: icon stacked above label with text shadow
  const isWindows = themeId === "win98" || themeId === "winxp" || themeId === "win7";
  const fontSize = isWindows ? "11px" : "10px";
  const iconSize = isWindows ? "28px" : "24px";

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 2,
      width: 64,
      opacity: 0.6,
    }}>
      <span style={{ fontSize: iconSize, lineHeight: 1 }}>{icon}</span>
      <span style={{
        fontSize,
        color: textColor,
        textAlign: "center",
        lineHeight: 1.2,
        textShadow: isWindows ? "1px 1px 2px rgba(0,0,0,0.8)" : "none",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        maxWidth: "100%",
      }}>
        {label}
      </span>
    </div>
  );
}

// ============================================================================
// OS-specific decorations
// ============================================================================

function OSDecoration({ themeId }: { themeId: string }) {
  switch (themeId) {
    case "win98":
      // Subtle grid lines like CRT scanlines
      return (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)",
            opacity: 0.5,
          }}
        />
      );

    case "winxp":
      // Soft cloud-like gradient on top
      return (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at 60% 20%, rgba(255,255,255,0.08) 0%, transparent 50%)",
          }}
        />
      );

    case "win7":
      // Aurora-like subtle bottom glow
      return (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at 50% 100%, rgba(52,152,219,0.1) 0%, transparent 60%)",
          }}
        />
      );

    case "ios":
      // Soft animated gradient mesh
      return (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at 20% 80%, rgba(102,126,234,0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(240,147,251,0.1) 0%, transparent 50%)",
          }}
        />
      );

    case "vscode":
      // Code-like background pattern (faint line numbers on the left)
      return (
        <div
          className="absolute top-20 left-8 bottom-8 pointer-events-none"
          style={{ opacity: 0.08 }}
        >
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              style={{
                fontFamily: "'Consolas', 'Fira Code', monospace",
                fontSize: "12px",
                color: "#808080",
                lineHeight: "20px",
              }}
            >
              {i + 1}
            </div>
          ))}
        </div>
      );

    case "spatial":
      // Floating particle dots
      return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 12 }).map((_, i) => {
            const left = 10 + (i * 37) % 80;
            const top = 15 + (i * 53) % 70;
            const size = 2 + (i % 3);
            return (
              <div
                key={i}
                className="absolute rounded-full"
                style={{
                  left: `${left}%`,
                  top: `${top}%`,
                  width: size,
                  height: size,
                  background: `rgba(${120 + (i * 20) % 80}, ${120 + (i * 15) % 80}, 255, ${0.1 + (i % 4) * 0.05})`,
                }}
              />
            );
          })}
        </div>
      );

    default:
      return null;
  }
}
