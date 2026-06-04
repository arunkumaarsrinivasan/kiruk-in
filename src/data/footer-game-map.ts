import { getDefaultGameId, getGameEntry } from "@/components/ui/arcade/game-registry";

/** era id (year) → arcade game id. Unmapped eras fall back to the default. */
export const FOOTER_GAME_BY_ERA: Record<string, string> = {
  "1970": "snake",
  "1981": "minesweeper",
  "1991": "quiz",
  "1993": "timeline",
  "1995": "painter",
  "1997": "pipe",
  "2000": "flappy",
  "2003": "collector",
  "2006": "avoider",
  "2009": "memory",
  "2013": "tetris",
  "2018": "minesweeper",
  "2021": "tetris",
  "2023": "quiz",
  "2026": "painter",
};

/** Resolve a valid game id for an era (validates against the registry). */
export function getFooterGameId(eraId: string): string {
  const id = FOOTER_GAME_BY_ERA[eraId];
  if (id && getGameEntry(id)) return id;
  return getDefaultGameId();
}

/** Human label for the mapped game (falls back to id). */
export function getFooterGameLabel(gameId: string): string {
  return getGameEntry(gameId)?.label ?? gameId;
}
