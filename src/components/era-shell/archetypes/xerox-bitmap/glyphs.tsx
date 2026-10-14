"use client";

/**
 * Star pictograms — 56×56, drawn on whole pixels with 2px ink so they stay
 * crisp at 1:1. Three states, exactly as the Star drew them:
 *   plain     black ink on paper
 *   inverted  selected: paper ink on a black field
 *   ghost     opened: the fills go to 50% stipple, the object is "elsewhere"
 */

import { useId, type ReactNode } from "react";
import { STAR } from "./star";

export type GlyphName =
  | "cover"
  | "about"
  | "empathy"
  | "impact"
  | "folder"
  | "drawer"
  | "basket"
  | "desktop"
  | "book"
  | "doc";

interface GlyphProps {
  name: GlyphName;
  inverted?: boolean;
  ghost?: boolean;
  size?: number;
}

export function StarGlyph({ name, inverted = false, ghost = false, size = 56 }: GlyphProps) {
  const pid = `star-ghost-${useId().replace(/:/g, "")}`;
  const ink = inverted ? STAR.paper : STAR.ink;
  const field = inverted ? STAR.ink : STAR.paper;
  const fill = ghost ? `url(#${pid})` : field;
  const line = { fill: "none", stroke: ink, strokeWidth: 2 } as const;
  const body = { fill, stroke: ink, strokeWidth: 2 } as const;
  const bar = (x: number, y: number, w: number, h: number) => <rect x={x} y={y} width={w} height={h} fill={ink} />;

  const page = (inner: ReactNode) => (
    <>
      <path d="M12 4H36L46 14V52H12Z" {...body} />
      <path d="M36 4V14H46" {...line} />
      {inner}
    </>
  );

  const art: Record<GlyphName, ReactNode> = {
    cover: page(
      <>
        {bar(17, 19, 20, 6)}
        {bar(17, 30, 24, 2)}
        {bar(17, 35, 24, 2)}
        {bar(17, 40, 24, 2)}
        {bar(17, 45, 14, 2)}
      </>,
    ),
    about: page(
      <>
        <circle cx="29" cy="25" r="5" {...line} />
        <path d="M19 42V39C19 35 23 33 29 33C35 33 39 35 39 39V42" {...line} />
        {bar(17, 45, 24, 2)}
      </>,
    ),
    empathy: page(
      <>
        <rect x="17" y="19" width="24" height="28" {...line} />
        {bar(28, 19, 2, 28)}
        {bar(17, 32, 24, 2)}
      </>,
    ),
    impact: page(
      <>
        {bar(17, 45, 24, 2)}
        {bar(18, 37, 5, 8)}
        {bar(25, 29, 5, 16)}
        {bar(32, 21, 5, 24)}
      </>,
    ),
    doc: page(
      <>
        {bar(17, 22, 24, 2)}
        {bar(17, 28, 24, 2)}
        {bar(17, 34, 24, 2)}
        {bar(17, 40, 16, 2)}
      </>,
    ),
    folder: (
      <>
        <path d="M6 12H22L26 16H50V48H6Z" {...body} />
        <path d="M6 21H50" {...line} />
      </>
    ),
    drawer: (
      <>
        <rect x="8" y="5" width="40" height="46" {...body} />
        <rect x="13" y="10" width="30" height="17" {...line} />
        <rect x="13" y="31" width="30" height="15" {...line} />
        {bar(23, 16, 10, 4)}
        {bar(23, 36, 10, 4)}
      </>
    ),
    basket: (
      <>
        <rect x="16" y="9" width="24" height="22" {...body} />
        <path d="M16 9L28 19L40 9" {...line} />
        <path d="M5 28H51L47 48H9Z" {...body} />
        {bar(19, 31, 2, 15)}
        {bar(27, 31, 2, 15)}
        {bar(35, 31, 2, 15)}
      </>
    ),
    desktop: (
      <>
        <rect x="6" y="7" width="44" height="32" {...body} />
        <rect x="11" y="12" width="8" height="10" {...line} />
        <rect x="24" y="12" width="8" height="10" {...line} />
        {bar(22, 41, 12, 4)}
        {bar(14, 46, 28, 3)}
      </>
    ),
    book: (
      <>
        <path d="M28 13L7 9V43L28 47Z" {...body} />
        <path d="M28 13L49 9V43L28 47Z" {...body} />
        {bar(12, 18, 11, 2)}
        {bar(12, 24, 11, 2)}
        {bar(12, 30, 11, 2)}
        {bar(33, 18, 11, 2)}
        {bar(33, 24, 11, 2)}
        {bar(33, 30, 11, 2)}
      </>
    ),
  };

  return (
    <svg width={size} height={size} viewBox="0 0 56 56" shapeRendering="crispEdges" aria-hidden focusable="false">
      {ghost && (
        <defs>
          <pattern id={pid} width="2" height="2" patternUnits="userSpaceOnUse">
            <rect width="2" height="2" fill={STAR.paper} />
            <rect width="1" height="1" fill={STAR.ink} />
            <rect x="1" y="1" width="1" height="1" fill={STAR.ink} />
          </pattern>
        </defs>
      )}
      {art[name]}
    </svg>
  );
}
