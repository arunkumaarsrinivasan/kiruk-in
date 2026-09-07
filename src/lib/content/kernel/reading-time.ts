import readingTimeOf from "reading-time";

/**
 * Kiruk OS — reading-time estimate for an MDX body.
 *
 * A shared kernel util (any surface can use it). Operates on the raw MDX body;
 * embedded JSX/component markup is a negligible overcount at typical post
 * lengths. Returns the humanized `text` (e.g. "3 min read") plus raw figures.
 */
export function readingTime(body: string): {
  text: string;
  minutes: number;
  words: number;
} {
  const stats = readingTimeOf(body);
  return { text: stats.text, minutes: stats.minutes, words: stats.words };
}
