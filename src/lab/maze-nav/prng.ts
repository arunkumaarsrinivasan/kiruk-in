/**
 * mulberry32 — seeded PRNG for the maze-nav generator.
 *
 * Every variation must be reproducible from the saved config, so the render
 * path never touches Math.random(). Callers pass the seed string; we hash it
 * to a 32-bit state so any string (including sub-seeds) is a valid seed.
 */

/** xfnv1a string → uint32 hash. */
export function hashSeed(str: string): number {
  let h = 0x811c9dc5 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

export type Rng = () => number;

/** mulberry32 from a string seed. */
export function mulberry32(seedStr: string): Rng {
  let a = hashSeed(seedStr);
  return function rng(): number {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Pick a random integer in [0, n) using the provided rng. */
export function randInt(rng: Rng, n: number): number {
  return Math.floor(rng() * n);
}

/** Fisher–Yates shuffle in place, seeded. */
export function shuffle<T>(arr: T[], rng: Rng): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = randInt(rng, i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
