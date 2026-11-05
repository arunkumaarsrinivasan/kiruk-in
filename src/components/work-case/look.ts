import type { CSSProperties } from "react";
import type { LookTokens, Theme } from "@/components/stageshow";

/**
 * How a case's product shots are drawn in an era.
 *
 * - `product-dark` / `product-light`: the product in its own colours (Spera
 *   is dark-first, so dark is its truth; light is its real light theme).
 * - `phosphor`: a 1970s vector display drawing the product in green light.
 *
 * Scenes never hard-code a colour: they read `--sp-*` (the product's own
 * roles) and the kit reads `--ss-*`. Both come from here.
 */
export type CaseLook = "product-dark" | "product-light" | "phosphor";

/** Spera's roles, verbatim from spera-v2 packages/design-tokens/tokens.css. */
const SPERA_DARK = {
  "--sp-bg": "#0a0a0a",
  "--sp-card": "#141414",
  "--sp-muted": "#1a1a1a",
  "--sp-hover": "#1f1f1f",
  "--sp-fg": "#fafafa",
  "--sp-fg-2": "rgba(250, 250, 250, 0.6)",
  "--sp-fg-3": "rgba(250, 250, 250, 0.39)",
  "--sp-fg-4": "rgba(250, 250, 250, 0.27)",
  "--sp-border": "rgba(255, 255, 255, 0.08)",
  "--sp-gold": "#FDC238",
  "--sp-gold-ink": "#FDC238",
  "--sp-gold-muted": "#FDC23825",
  "--sp-on-gold": "#0a0a0a",
  "--sp-buy": "#4ade80",
  "--sp-sell": "#f87171",
  "--sp-cond": "#a78bfa",
  "--sp-line": "#60a5fa",
};

const SPERA_LIGHT = {
  "--sp-bg": "#f7f7f7",
  "--sp-card": "#fafafa",
  "--sp-muted": "#f0f0f0",
  "--sp-hover": "#e9e9e9",
  "--sp-fg": "#161616",
  "--sp-fg-2": "#3a3a3a",
  "--sp-fg-3": "#5e5e5e",
  "--sp-fg-4": "#707070",
  "--sp-border": "rgba(22, 22, 22, 0.15)",
  "--sp-gold": "#FDC238",
  "--sp-gold-ink": "#8a5a00",
  "--sp-gold-muted": "#FDC23838",
  "--sp-on-gold": "#161616",
  "--sp-buy": "#037137",
  "--sp-sell": "#c41e10",
  "--sp-cond": "#7c3aed",
  "--sp-line": "#2563eb",
};

/** One phosphor, four intensities: the beam is the only colour a CRT has. */
const P = "51, 255, 102";
const PHOSPHOR = {
  "--sp-bg": "#020402",
  "--sp-card": "#031003",
  "--sp-muted": "#041804",
  "--sp-hover": "#062006",
  "--sp-fg": "#7dff9e",
  "--sp-fg-2": `rgba(${P}, 0.72)`,
  "--sp-fg-3": `rgba(${P}, 0.5)`,
  "--sp-fg-4": `rgba(${P}, 0.32)`,
  "--sp-border": `rgba(${P}, 0.35)`,
  "--sp-gold": "#b6ffc8",
  "--sp-gold-ink": "#d8ffe2",
  "--sp-gold-muted": `rgba(${P}, 0.18)`,
  "--sp-on-gold": "#020402",
  "--sp-buy": "#33ff66",
  "--sp-sell": "#33ff66",
  "--sp-cond": "#33ff66",
  "--sp-line": "#33ff66",
};

const ROLES: Record<CaseLook, Record<string, string>> = {
  "product-dark": SPERA_DARK,
  "product-light": SPERA_LIGHT,
  phosphor: PHOSPHOR,
};

/** The kit's own roles, mapped from the product's so windows and rows match. */
function kitTokens(r: Record<string, string>, look: CaseLook): LookTokens {
  return {
    "--ss-canvas": r["--sp-bg"],
    "--ss-well": r["--sp-bg"],
    "--ss-surface": r["--sp-card"],
    "--ss-raised": r["--sp-card"],
    "--ss-chrome": r["--sp-card"],
    "--ss-fill": r["--sp-muted"],
    "--ss-line": r["--sp-border"],
    "--ss-line-faint": r["--sp-border"],
    "--ss-text": r["--sp-fg-3"],
    "--ss-text-strong": r["--sp-fg"],
    "--ss-text-faint": r["--sp-fg-4"],
    "--ss-icon": r["--sp-fg-3"],
    "--ss-icon-faint": r["--sp-fg-4"],
    "--ss-accent": r["--sp-gold"],
    // Phosphor inherits the terminal's VT323; the product speaks Geist, as Spera does.
    "--ss-font": look === "phosphor" ? "inherit" : "var(--font-2026-sans, 'Geist'), system-ui, sans-serif",
    "--ss-mono": look === "phosphor" ? "inherit" : "var(--font-2026-mono, 'Geist Mono'), ui-monospace, monospace",
    ...(look === "phosphor"
      ? {
          "--ss-shadow-hero": `0 0 0 1px rgba(${P}, 0.45), 0 0 24px rgba(${P}, 0.12)`,
          "--ss-shadow-window": `0 0 0 1px rgba(${P}, 0.4)`,
          "--ss-shadow-satellite": `0 0 0 1px rgba(${P}, 0.5), 0 0 18px rgba(${P}, 0.15)`,
          "--ss-shadow-lift": `0 0 0 1px rgba(${P}, 0.7), 0 0 22px rgba(${P}, 0.25)`,
          "--ss-shadow-float": `0 0 0 1px rgba(${P}, 0.5)`,
        }
      : {}),
  };
}

export function stageTheme(look: CaseLook): Theme {
  return look === "product-light" ? "light" : "dark";
}

export function stageTokens(look: CaseLook): LookTokens {
  return kitTokens(ROLES[look], look);
}

/** The `--sp-*` roles as a style object, for the scene's root. */
export function sceneStyle(look: CaseLook): CSSProperties {
  return ROLES[look] as CSSProperties;
}
