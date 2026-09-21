/**
 * Era → navigation game registry.
 *
 * Each era gets its own minimal game that IS the mobile menu, with its own
 * navigation method. Add a new era by dropping a game file and adding a line
 * here. Unknown eras fall back to a clean era-token list so the menu always
 * works.
 */

import type { EraNavGame } from "./types";
import { ListFallback } from "./games/ListFallback";

import { Terminal1970 } from "./games/Terminal1970";
import { Xerox1981 } from "./games/Xerox1981";
import { Web1991 } from "./games/Web1991";
import { Mosaic1993 } from "./games/Mosaic1993";
import { Geocities1995 } from "./games/Geocities1995";
import { Frames1997 } from "./games/Frames1997";
import { ZenGarden2000 } from "./games/ZenGarden2000";
import { Web2003 } from "./games/Web2003";
import { Apple2006 } from "./games/Apple2006";
import { Iphone2009 } from "./games/Iphone2009";
import { Ios7Flat2013 } from "./games/Ios7Flat2013";
import { A11y2018 } from "./games/A11y2018";
import { MaterialYou2021 } from "./games/MaterialYou2021";
import { AiNative2023 } from "./games/AiNative2023";
import { Generative2026 } from "./games/Generative2026";

const REGISTRY: Record<string, EraNavGame> = {
  "1970": Terminal1970,
  "1981": Xerox1981,
  "1991": Web1991,
  "1993": Mosaic1993,
  "1995": Geocities1995,
  "1997": Frames1997,
  "2000": ZenGarden2000,
  "2003": Web2003,
  "2006": Apple2006,
  "2009": Iphone2009,
  "2013": Ios7Flat2013,
  "2018": A11y2018,
  "2021": MaterialYou2021,
  "2023": AiNative2023,
  "2026": Generative2026,
};

export function getEraNavGame(eraId: string): EraNavGame {
  return REGISTRY[eraId] ?? ListFallback;
}
