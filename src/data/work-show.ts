/**
 * How each work is shown, as data. One list, read by every surface that
 * presents the work: the 1970 tube plays the scene and dithers the pictures
 * onto its glass, and the markdown version (`/work/<id>/agent.md`) says in
 * words what the scene shows and links the same pictures.
 *
 * To give a work more life, add to its `media`: files live under
 * `public/work/<folder>/`. Nothing else has to change.
 */

/** The moving pictures the tube knows how to play (control-room/scenes.ts). */
export type SceneKind =
  | "chart"
  | "printer"
  | "tokens"
  | "van"
  | "chat"
  | "steps"
  | "bridge"
  | "game"
  | "match"
  | "sofa"
  | "keys"
  | "eye";

export interface WorkMedia {
  /** Path under `public/`. */
  src: string;
  /** What is in the picture, for anyone who cannot see it. */
  alt: string;
  caption: string;
}

export interface WorkShow {
  scene: SceneKind;
  /** What the scene shows and what the pointer does to it, in one sentence. */
  plays: string;
  media: WorkMedia[];
}

export const WORK_SHOW: Record<string, WorkShow> = {
  "spera-platform": {
    scene: "chart",
    plays: "A price chart draws itself candle by candle while a backtest runs under it; the pointer is a crosshair that reads the price.",
    media: [
      {
        src: "/work/spera/kept-sketch.webp",
        alt: "A loose pencil sketch of the Spera mark: a swallow in flight inside a circle.",
        caption: "The sketch that was kept: a swallow, a rising moon and a rocket in one shape.",
      },
      {
        src: "/work/spera/first-draft.webp",
        alt: "An early Spera landing page on a gold field, with the logo top left and a dark button top right.",
        caption: "The first draft of the site, before gold came to mean metered.",
      },
    ],
  },
  "hp-print-ai": {
    scene: "printer",
    plays: "A printer feeds a page line by line while its AI lamp thinks; the print head follows the pointer.",
    media: [],
  },
  "mudra-ai-stack": {
    scene: "tokens",
    plays: "A design system assembles itself tile by tile; tiles light as the pointer passes.",
    media: [],
  },
  "get-my-prints": {
    scene: "van",
    plays: "A delivery van carries a printout along a road to a door; the pointer drives the van.",
    media: [],
  },
  "hp-print-learn-center": {
    scene: "chat",
    plays: "A chat fills with worksheets sent to a parent, one bubble after another; the pointer picks a bubble.",
    media: [],
  },
  "hp-onboarding-app": {
    scene: "steps",
    plays: "A phone walks through sign-up, ticking each step; the pointer ticks a step itself.",
    media: [],
  },
  "square-bridge": {
    scene: "bridge",
    plays: "Three roles, student, recruiter and placement officer, pass profiles across one bridge; the pointer lights the role it is nearest.",
    media: [],
  },
  "peoplegamez-hr": {
    scene: "game",
    plays: "A small ball game keeps score; the paddle follows the pointer.",
    media: [],
  },
  "foodies-buddies": {
    scene: "match",
    plays: "Two plates drift together and a heart beats when they match; the pointer pulls them apart or together.",
    media: [],
  },
  desirable: {
    scene: "sofa",
    plays: "A piece of furniture is drawn with its measures and changes form; the pointer chooses the form.",
    media: [],
  },
  "prags-website": {
    scene: "keys",
    plays: "A keyboard plays a phrase and draws its wave; the pointer plays the key it is over.",
    media: [],
  },
  "portfolio-v3": {
    scene: "eye",
    plays: "An eye blinks and looks around; it follows the pointer.",
    media: [],
  },
};
