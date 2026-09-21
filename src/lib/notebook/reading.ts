/**
 * How the public notebook inhabits a year.
 *
 * An Era is not a theme overlay. 1970 is a terminal you log into; later
 * years will be their own rooms (Alto, Mosaic, …). Until a year has a
 * grammar, it falls back to Era tokens on the timeless reading vessel.
 */

export type NotebookReadingGrammar = "terminal" | "tokens";

export function notebookReadingGrammar(eraId: string): NotebookReadingGrammar {
  if (eraId === "1970") return "terminal";
  return "tokens";
}
