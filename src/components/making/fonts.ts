/**
 * Type for /making: the notebook's reading faces, under the variable names its
 * 1970 skin reads (`.era-blog-surface[data-era-surface='1970']` in globals.css).
 * Every other era takes its fonts from the site's own tokens.
 */
import { IBM_Plex_Mono, VT323 } from "next/font/google";

const plex = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500", "700"], display: "swap", variable: "--font-blog-body" });
const vt = VT323({ subsets: ["latin"], weight: "400", display: "swap", variable: "--font-blog-display" });

export const MAKING_FONT_VARS = `${plex.variable} ${vt.variable}`;
