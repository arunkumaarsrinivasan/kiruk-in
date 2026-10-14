/**
 * Xerox Star 8010 (1981) — the 1-bit visual system shared by every 1981
 * surface: the home desktop, the about-story skin, the contact skin.
 *
 * The Star had two inks: black and white. Gray did not exist; it was faked
 * with stipple patterns, and selection was shown by inverting. Anything that
 * reaches for #c0c0c0 or a navy title bar is Windows 95, not Star.
 */

export const STAR = {
  ink: "#000000",
  paper: "#ffffff",
} as const;

/** Data-URI 1-bit patterns. Use with `image-rendering: pixelated`. */
const svg = (w: number, h: number, body: string) =>
  `url("data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}' shape-rendering='crispEdges'>${body}</svg>`,
  )}")`;

export const STIPPLE = {
  /** The desktop: one black dot in every 2×2 cell (25% gray). */
  desktop: svg(2, 2, "<rect width='2' height='2' fill='#fff'/><rect width='1' height='1' fill='#000'/>"),
  /** 50% checker — window header strips, disabled controls, "opened" icons. */
  half: svg(2, 2, "<rect width='2' height='2' fill='#fff'/><rect width='1' height='1' fill='#000'/><rect x='1' y='1' width='1' height='1' fill='#000'/>"),
  /** Sparse 12.5% dots — quiet fills behind tables or charts. */
  light: svg(4, 4, "<rect width='4' height='4' fill='#fff'/><rect width='1' height='1' fill='#000'/><rect x='2' y='2' width='1' height='1' fill='#000'/>"),
} as const;

export const STAR_FONT = {
  /** Window chrome, icon labels, function keys. */
  chrome: "'Pixelify Sans', 'Helvetica', sans-serif",
  /** Document bodies — the Star's whole point was that documents looked printed. */
  doc: "var(--font-star-doc, 'Source Serif 4'), 'Times New Roman', serif",
} as const;

/** Command buttons were the only rounded thing on the Star's screen. */
export const STAR_CMD_RADIUS = 4;

/**
 * The gray bevel desktop — the site's 1981 look (the home page). One bevel
 * recipe everywhere: 1px hilite top-left, 1px shadow bottom-right, a 1px
 * black edge outside; pressed is the same bevel inverted.
 */
export const BEVEL = {
  gray: "#c0c0c0",
  grayLight: "#dcdcdc",
  hilite: "#ffffff",
  shadow: "#808080",
  black: "#000000",
  titleBg: "#000080",
  titleText: "#ffffff",
  accent: "#0000aa",
  selected: "#e6e6e6",
  alert: "#aa0000",
  /** The desktop's dot pattern, over `gray`. */
  desktop:
    "repeating-radial-gradient(circle at 0 0, transparent 0, transparent 5px, rgba(0,0,0,0.08) 5px, rgba(0,0,0,0.08) 6px)",
  desktopSize: "12px 12px",
} as const;

/** Bevel as an inset box-shadow, so it never changes layout. */
export const bevel = (state: "raised" | "sunken" = "raised") =>
  state === "raised"
    ? `inset 1px 1px 0 ${BEVEL.hilite}, inset -1px -1px 0 ${BEVEL.shadow}`
    : `inset 1px 1px 0 ${BEVEL.shadow}, inset -1px -1px 0 ${BEVEL.hilite}`;
