import type { ThemeConfig } from "@/data/portfolio-data";
import { getFooterGameId } from "@/data/footer-game-map";
import { getGameEntry } from "@/components/ui/arcade/game-registry";

export interface FooterEraFlavor {
  /** Short quest / mission name shown in the arcade chrome */
  questName: string;
  /** One-line era-native hook above the board */
  tagline: string;
  /** How to play in this era's voice */
  controlHint: string;
  /** Shown when the engine reports game over */
  winLine: string;
}

const FLAVOR_BY_ERA: Record<string, FooterEraFlavor> = {
  "1970": {
    questName: "PHOSPHOR TRAIL",
    tagline: "Feed the cursor serpent before the CRT burns in.",
    controlHint: "Move pointer — snake follows · click to respawn",
    winLine: "SESSION HALTED — type RESET or scroll up for mainframe.",
  },
  "1981": {
    questName: "BITMAP SWEEP",
    tagline: "Clear the beveled grid without tripping a pixel mine.",
    controlHint: "Click cells to reveal · flag with long-press mindset",
    winLine: "WINDOW CLOSED — reopen from the title bar (footer).",
  },
  "1991": {
    questName: "HYPERTEXT ORAL",
    tagline: "Answer like it is 1991: blue links, zero chrome, pure document.",
    controlHint: "Click the correct link-cell · follow the underlined truth",
    winLine: "END OF DOCUMENT — thanks for visiting this node.",
  },
  "1993": {
    questName: "MOSAIC TIMELINE",
    tagline: "Navigate the history stack before Netscape times out.",
    controlHint: "Trace the timeline tiles · click to lock an era hop",
    winLine: "CONNECTION RESET — dial up again from the footer dock.",
  },
  "1995": {
    questName: "GEO PAINT STORM",
    tagline: "Under construction forever — leave neon trails on the guestbook grid.",
    controlHint: "Paint with pointer · mash cells for sparkle combos",
    winLine: "SITE COUNTER +1 — best viewed in Netscape, obviously.",
  },
  "1997": {
    questName: "FRAME ROUTER",
    tagline: "Pipe the signal through nested frames before the layout collapses.",
    controlHint: "Click to rotate · connect inlet to outlet",
    winLine: "FRAMES UNLOADED — no <noframes> fallback required.",
  },
  "2000": {
    questName: "FLASH SURVIVAL",
    tagline: "Flap through the splash intro — skip intro is a lie.",
    controlHint: "Click / tap to boost · dodge the loading bar",
    winLine: "YOU WIN — insert coin for portfolio v2.",
  },
  "2003": {
    questName: "WEB2 COLLECT-A-THON",
    tagline: "Hoover glossy badges before the skeuomorphic shine fades.",
    controlHint: "Sweep the grid · chain pickups for combo XP",
    winLine: "ACHIEVEMENT UNLOCKED — friend request pending.",
  },
  "2006": {
    questName: "STATUS FIREHOSE",
    tagline: "Dodge the microblog blast radius — 140 chars of danger.",
    controlHint: "Move fast · don't get @-mentioned into a wall",
    winLine: "TRENDING #1 — log off, touch grass, email Kiruk.",
  },
  "2009": {
    questName: "SKEUO MEMORY",
    tagline: "Flip the linen cards — find pairs before the home button wears out.",
    controlHint: "Click two cells · match portfolio glyphs",
    winLine: "GAME CENTER HIGH SCORE — screenshot for posterity.",
  },
  "2013": {
    questName: "PINBOARD STACK",
    tagline: "Snap flat tiles into columns — Pinterest your way to victory.",
    controlHint: "Click to rotate piece · hard-drop with rhythm",
    winLine: "BOARD CLEARED — pin this footer to your moodboard.",
  },
  "2018": {
    questName: "BLOCK MINE SWEEP",
    tagline: "Structured grid blocks hide intent — reveal without breaking the layout.",
    controlHint: "Click to probe · read the numbers like a design critique",
    winLine: "ALL BLOCKS PUBLISHED — ship to production.",
  },
  "2021": {
    questName: "SPRINT COLUMN",
    tagline: "Stack issues, clear the sprint, zero carry-over guilt.",
    controlHint: "Tetris the backlog · one ticket per cell",
    winLine: "VELOCITY MAXED — retro scheduled for morale.",
  },
  "2023": {
    questName: "PROMPT QUIZ",
    tagline: "Conversational Q&A — the model already knows your favorite font.",
    controlHint: "Pick answers on-grid · hallucinations not included",
    winLine: "ALIGNMENT OK — human-in-the-loop still required.",
  },
  "2026": {
    questName: "GENERATIVE PAINT",
    tagline: "Paint the UI into existence — tokens optional, vibes mandatory.",
    controlHint: "Brush the grid · watch the system dream in accent color",
    winLine: "RENDER COMPLETE — export to Figma (emotionally).",
  },
};

const DEFAULT_FLAVOR: FooterEraFlavor = {
  questName: "ARCADE DOCK",
  tagline: "Play the era-native mini-game before you leave the timeline.",
  controlHint: "Move pointer · click cells · chase the high score",
  winLine: "RUN COMPLETE — scroll up or switch era to play another.",
};

export function getFooterEraFlavor(era: ThemeConfig): FooterEraFlavor & {
  gameId: string;
  gameLabel: string;
  gameDescription: string;
} {
  const gameId = getFooterGameId(era.id);
  const entry = getGameEntry(gameId);
  const base = FLAVOR_BY_ERA[era.id] ?? DEFAULT_FLAVOR;

  return {
    ...base,
    gameId,
    gameLabel: entry?.label ?? gameId,
    gameDescription: entry?.description ?? "",
  };
}
