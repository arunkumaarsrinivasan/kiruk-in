import type { CSSProperties } from "react";
import type { FooterPaletteHints } from "@/data/footer-data";

export interface FooterPanelChrome {
  footerClass: string;
  gameShellClass: string;
  canvasClass: string;
  footerStyle: CSSProperties;
  gameShellStyle: CSSProperties;
  showAscii: boolean;
  showBadges: boolean;
  badgeStyle: "chips" | "arcade" | "none";
  scanlines: boolean;
  phosphorPulse: boolean;
}

export function getFooterPanelChrome(
  palette: FooterPaletteHints,
): FooterPanelChrome {
  const base: FooterPanelChrome = {
    footerClass: "",
    gameShellClass: "",
    canvasClass: "",
    footerStyle: {},
    gameShellStyle: {},
    showAscii: false,
    showBadges: false,
    badgeStyle: "none",
    scanlines: false,
    phosphorPulse: false,
  };

  switch (palette.panelStyle) {
    case "terminal":
      return {
        ...base,
        footerClass: "footer-panel--terminal",
        gameShellClass: "footer-game-shell--terminal",
        canvasClass: "footer-game-canvas--terminal",
        footerStyle: {
          boxShadow: palette.glow
            ? "0 0 24px color-mix(in srgb, var(--accent-color) 35%, transparent), inset 0 0 40px color-mix(in srgb, var(--accent-color) 6%, transparent)"
            : undefined,
          borderRadius: 0,
        },
        gameShellStyle: {
          borderRadius: 0,
          boxShadow: "inset 0 0 12px color-mix(in srgb, var(--accent-color) 20%, transparent)",
        },
        showAscii: true,
        showBadges: true,
        badgeStyle: "arcade",
        scanlines: true,
        phosphorPulse: true,
      };
    case "pixel":
      return {
        ...base,
        footerClass: "footer-panel--pixel",
        gameShellClass: "footer-game-shell--pixel",
        canvasClass: "footer-game-canvas--pixel",
        footerStyle: {
          borderRadius: "var(--era-radius-sm, 2px)",
        },
        gameShellStyle: {
          borderRadius: "var(--era-radius-sm, 2px)",
          boxShadow:
            "inset 2px 2px 0 color-mix(in srgb, var(--text-main) 25%, transparent), inset -2px -2px 0 color-mix(in srgb, var(--bg-main) 40%, transparent)",
        },
        showAscii: true,
        showBadges: true,
        badgeStyle: "arcade",
        scanlines: false,
        phosphorPulse: false,
      };
    case "flat":
      return {
        ...base,
        footerClass: "footer-panel--flat",
        gameShellClass: "footer-game-shell--flat",
        canvasClass: "footer-game-canvas--flat",
        footerStyle: {
          borderRadius: "var(--era-radius-md, 6px)",
        },
        gameShellStyle: {
          borderRadius: "var(--era-radius-md, 6px)",
        },
        showAscii: false,
        showBadges: false,
        badgeStyle: "none",
      };
    case "glass":
    default:
      return {
        ...base,
        footerClass: "footer-panel--glass",
        gameShellClass: "footer-game-shell--glass",
        canvasClass: "footer-game-canvas--glass",
        footerStyle: {
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          background:
            "color-mix(in srgb, var(--bg-card) 82%, transparent)",
          borderRadius: "var(--era-radius-lg, 12px)",
        },
        gameShellStyle: {
          borderRadius: "var(--era-radius-lg, 12px)",
          background:
            "linear-gradient(135deg, color-mix(in srgb, var(--accent-color) 8%, transparent), color-mix(in srgb, var(--theme-secondary, var(--bg-card)) 12%, transparent))",
        },
        showAscii: false,
        showBadges: true,
        badgeStyle: "chips",
      };
  }
}
