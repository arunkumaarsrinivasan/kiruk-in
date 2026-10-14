"use client";

/**
 * Era → navigation game registry.
 *
 * Each era gets its own minimal game that IS the mobile menu, with its own
 * navigation method. Add a new era by dropping a game file and adding a line
 * here. Unknown eras fall back to a clean era-token list so the menu always
 * works.
 *
 * Games are separate chunks. The menu shell stays in the nav; a game
 * downloads the first time that era's menu opens.
 */

import dynamic from "next/dynamic";
import type { EraNavGame } from "./types";
import { ListFallback } from "./games/ListFallback";

function game(
  load: () => Promise<{ [key: string]: EraNavGame }>,
  name: string,
): EraNavGame {
  return dynamic(
    () => load().then((m) => ({ default: m[name] })),
    { loading: () => null },
  );
}

const REGISTRY: Record<string, EraNavGame> = {
  "1970": game(() => import("./games/Terminal1970"), "Terminal1970"),
  "1981": game(() => import("./games/Xerox1981"), "Xerox1981"),
  "1991": game(() => import("./games/Web1991"), "Web1991"),
  "1995": game(() => import("./games/Geocities1995"), "Geocities1995"),
  "1997": game(() => import("./games/Frames1997"), "Frames1997"),
  "2000": game(() => import("./games/Search2000"), "Search2000"),
  "2003": game(() => import("./games/Web2003"), "Web2003"),
  "2009": game(() => import("./games/Iphone2009"), "Iphone2009"),
  "2013": game(() => import("./games/Ios7Flat2013"), "Ios7Flat2013"),
  "2026": game(() => import("./games/Generative2026"), "Generative2026"),
};

export function getEraNavGame(eraId: string): EraNavGame {
  return REGISTRY[eraId] ?? ListFallback;
}
