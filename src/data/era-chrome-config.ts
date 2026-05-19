/**
 * Era chrome family — maps each era id to a visual "frame" treatment.
 *
 * Six families wrap the home page in era-authentic atmosphere without
 * restructuring the DOM. All chrome is rendered as fixed, pointer-events
 * none decoration so existing layout stays intact.
 */

export type ChromeFamily =
  | "crt"
  | "classic-windows"
  | "web-era"
  | "aqua-aero"
  | "flat-material"
  | "glass-spatial";

const ERA_TO_FAMILY: Record<string, ChromeFamily> = {
  "1970": "crt",
  "1981": "classic-windows",
  "1991": "classic-windows",
  "1993": "classic-windows",
  "1995": "classic-windows",
  "1997": "classic-windows",
  "2000": "web-era",
  "2003": "web-era",
  "2006": "aqua-aero",
  "2009": "aqua-aero",
  "2010": "aqua-aero",
  "2013": "flat-material",
  "2014": "flat-material",
  "2015": "flat-material",
  "2016": "flat-material",
  "2018": "flat-material",
  "2020": "glass-spatial",
  "2021": "glass-spatial",
  "2022": "glass-spatial",
  "2023": "glass-spatial",
  "2024": "glass-spatial",
  "2025": "glass-spatial",
};

export function getChromeFamily(eraId: string): ChromeFamily {
  return ERA_TO_FAMILY[eraId] ?? "flat-material";
}

export interface ChromeFamilyMeta {
  id: ChromeFamily;
  label: string;
  decade: string;
  description: string;
}

export const CHROME_FAMILY_META: Record<ChromeFamily, ChromeFamilyMeta> = {
  crt: {
    id: "crt",
    label: "CRT",
    decade: "1970s",
    description: "Phosphor glow, scanlines, curved bezel.",
  },
  "classic-windows": {
    id: "classic-windows",
    label: "Classic Windows",
    decade: "1980s–90s",
    description: "Pixel bevels, system fonts, dithered chrome.",
  },
  "web-era": {
    id: "web-era",
    label: "Early Web",
    decade: "1991–2003",
    description: "Beveled tables, web-safe grain, browser feel.",
  },
  "aqua-aero": {
    id: "aqua-aero",
    label: "Aqua & Aero",
    decade: "2003–2009",
    description: "Glossy gradients, soft reflections.",
  },
  "flat-material": {
    id: "flat-material",
    label: "Flat & Material",
    decade: "2010–2018",
    description: "Honest pixels, paper shadows.",
  },
  "glass-spatial": {
    id: "glass-spatial",
    label: "Glass & Spatial",
    decade: "2020–present",
    description: "Backdrop blur, depth, ambient parallax.",
  },
};
