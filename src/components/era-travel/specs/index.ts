/**
 * Blueprint spec registry — which wireframe draws for which (era, page).
 *
 * Home pages get one authored spec per era (Batch 2 fills the timeline).
 * Shared routes fall back to the generic spec until per-route specs land
 * (Batch 3). The grammar always comes from the target era, never the spec.
 */

import type { EraPageKey } from "@/components/era-shell/registry";
import {
  grammarForEra,
  type BlueprintSpec,
  type ResolvedSpec,
} from "../blueprint-types";
import { FALLBACK_SPEC } from "./fallback";
import { PAGE_SPECS } from "./routes";
import { TERMINAL_HOME_SPEC } from "./terminal";
import {
  DOC_HTML_HOME_SPEC,
  FRAMESET_HOME_SPEC,
  GEOCITIES_HOME_SPEC,
  XEROX_HOME_SPEC,
} from "./early";
import {
  FLASH_SPLASH_HOME_SPEC,
  IPHONE_SKEU_HOME_SPEC,
  PINBOARD_HOME_SPEC,
  WEB2_CANDY_HOME_SPEC,
} from "./web2";
import { PROMPT_UI_HOME_SPEC } from "./modern";

const ERA_HOME_SPECS: Record<string, BlueprintSpec> = {
  "1970": TERMINAL_HOME_SPEC,
  "1981": XEROX_HOME_SPEC,
  "1991": DOC_HTML_HOME_SPEC,
  "1995": GEOCITIES_HOME_SPEC,
  "1997": FRAMESET_HOME_SPEC,
  "2000": FLASH_SPLASH_HOME_SPEC,
  "2003": WEB2_CANDY_HOME_SPEC,
  "2009": IPHONE_SKEU_HOME_SPEC,
  "2013": PINBOARD_HOME_SPEC,
  "2026": PROMPT_UI_HOME_SPEC,
};

export function getBlueprintSpec(
  eraId: string,
  pageKey: EraPageKey,
): ResolvedSpec {
  const spec =
    pageKey === "home"
      ? (ERA_HOME_SPECS[eraId] ?? FALLBACK_SPEC)
      : (PAGE_SPECS[pageKey] ?? FALLBACK_SPEC);
  return { spec, grammar: grammarForEra(eraId) };
}
