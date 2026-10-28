/**
 * When the visitor last pressed something: a key, or a finger or button down.
 *
 * The eye builds its shaders behind the loader's opening, and each build is
 * one long task on the main thread (100–400 ms on a laptop, seconds on a
 * throttled phone). A key typed at the tube, or a tap on it, waits behind
 * whichever build is running, and the browser counts that wait against the
 * page (INP). Input comes in bursts, so the stage holds its covered frames,
 * the ones that build, while a burst is on (EyeStage, `INPUT_QUIET`): the
 * next key in the burst finds the thread free.
 */

let last = -1e9;

/** A key or press just arrived. */
export function noteInput() {
  last = performance.now() / 1000;
}

/** Seconds (performance clock) of the latest key or press. */
export function lastInputAt() {
  return last;
}
