"use client";

/**
 * Read's pointer: the pixel arrow the 1970 work tube draws for itself, in the
 * era's colours. Light at rest, the era's accent over anything that opens,
 * the same way the tube's arrow takes its colour when it is on a target.
 *
 * It is the real cursor (an image handed to CSS `cursor`), so it never lags
 * the hand. The colours are read from the era's tokens and redrawn when the
 * era changes.
 */

import { useEffect, useRef } from "react";
import { ARROW } from "@/components/modules/work-os/control-room/pixel-icons";

/** Screen pixels per arrow pixel. */
const SCALE = 2;
const W = ARROW[0].length;
const H = ARROW.length;

/** The arrow as an SVG data URI: `#` cells in the edge colour, `o` cells in the fill. */
function arrowUrl(fill: string, edge: string): string {
  let rects = "";
  ARROW.forEach((row, y) => {
    for (let x = 0; x < row.length; ) {
      const ch = row[x];
      let run = 1;
      while (x + run < row.length && row[x + run] === ch) run++;
      if (ch !== ".") rects += `<rect x="${x}" y="${y}" width="${run}" height="1" fill="${ch === "#" ? edge : fill}"/>`;
      x += run;
    }
  });
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W * SCALE}" height="${H * SCALE}" viewBox="0 0 ${W} ${H}" shape-rendering="crispEdges">${rects}</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

export function ReadCursor() {
  const probe = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = probe.current;
    const surface = el?.closest<HTMLElement>("[data-era-surface]") ?? document.body;
    if (!el) return;

    /** A token as a colour the SVG can use on its own. */
    const colour = (token: string) => {
      el.style.color = `var(${token})`;
      return getComputedStyle(el).color;
    };
    const draw = () => {
      const edge = colour("--bg-main");
      surface.style.setProperty("--read-cursor", arrowUrl(colour("--text-main"), edge));
      surface.style.setProperty("--read-cursor-on", arrowUrl(colour("--read-accent"), edge));
      surface.setAttribute("data-read-cursor", "");
    };
    draw();

    // The era can change under the page: the surface's own era, or the site's.
    const mo = new MutationObserver(draw);
    mo.observe(surface, { attributes: true, attributeFilter: ["data-era-surface"] });
    mo.observe(document.body, { attributes: true, attributeFilter: ["data-era", "style"] });
    return () => {
      mo.disconnect();
      surface.removeAttribute("data-read-cursor");
      surface.style.removeProperty("--read-cursor");
      surface.style.removeProperty("--read-cursor-on");
    };
  }, []);

  return <span ref={probe} hidden aria-hidden />;
}
