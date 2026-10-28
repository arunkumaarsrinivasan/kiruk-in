/**
 * Blinks, as a plain state machine with no three.js in it (the gaze has its
 * own, rig/gaze.ts).
 *
 * A blink snaps shut, holds, and opens more slowly (~300 ms in all); about one
 * in five comes as a quick double. The time between blinks is drawn around
 * the era's mean: reading and staring blink less, scanning more, about 15–20
 * a minute on average.
 *
 * R13: about one natural blink in seven is partial, the lid stopping at
 * 0.5–0.9 of the way down (incomplete blinks are common at a screen); and
 * every opening ends in a slow creep, the last tenth taking ~0.4 s more,
 * as the levator settles. A blink the stage asks for (a cut, an arrival) is
 * always whole.
 */

export function damp(current: number, target: number, lambda: number, dt: number) {
  return current + (target - current) * (1 - Math.exp(-lambda * dt));
}

const BLINK_CLOSE = 0.07;
const BLINK_HOLD = 0.04;
const BLINK_OPEN = 0.19;
export const BLINK_TOTAL = BLINK_CLOSE + BLINK_HOLD + BLINK_OPEN;
/** The opening's slow tail: the last tenth of the way, over this long. */
const BLINK_CREEP = 0.4;
const CREEP_FROM = 0.1;

/** How shut the lids are `t` s into a blink, 0..1; `depth` < 1 for a partial blink. */
export function blinkCurve(t: number, depth = 1): number {
  let v: number;
  if (t < BLINK_CLOSE) v = t / BLINK_CLOSE;
  else if (t < BLINK_CLOSE + BLINK_HOLD) v = 1;
  else if (t < BLINK_TOTAL) v = 1 - (t - BLINK_CLOSE - BLINK_HOLD) / BLINK_OPEN;
  else if (t < BLINK_TOTAL + BLINK_CREEP) {
    // the last tenth, eased out slowly
    const k = (t - BLINK_TOTAL) / BLINK_CREEP;
    return CREEP_FROM * (1 - k) * (1 - k) * depth;
  } else return 0;
  v = Math.min(1, Math.max(0, v));
  // (the main opening lands on the creep's start, so the two meet without a step)
  const s = v * v * (3 - 2 * v);
  const main = t < BLINK_CLOSE + BLINK_HOLD ? s : CREEP_FROM + (1 - CREEP_FROM) * s;
  return main * depth;
}

export class BlinkRig {
  private t = 99;
  private next = 2.5;
  private depth = 1;
  private doubleNext = false;
  /** Mean seconds between blinks. */
  every = 3.6;

  /** Starts a blink now. The lab's "blink" button and, later, era arrivals. */
  trigger() {
    this.t = 0;
    this.depth = 1;
  }

  /** Whether a blink is under way. */
  get active() {
    return this.t < BLINK_TOTAL + BLINK_CREEP;
  }

  update(dt: number, reduce: boolean, paused: boolean): number {
    if (reduce) return 0;
    if (!paused) {
      this.next -= dt;
      if (this.next <= 0) {
        this.t = 0;
        // (a double's second blink is always whole; otherwise one in seven stops part way)
        this.depth = !this.doubleNext && Math.random() < 0.15 ? 0.5 + Math.random() * 0.4 : 1;
        this.doubleNext = !this.doubleNext && Math.random() < 0.18;
        this.next = this.doubleNext
          ? BLINK_TOTAL + 0.11
          : Math.min(12, Math.max(0.8, -Math.log(1 - Math.random()) * this.every * 0.7 + this.every * 0.3));
      }
    }
    this.t += dt;
    return blinkCurve(this.t, this.depth);
  }
}
