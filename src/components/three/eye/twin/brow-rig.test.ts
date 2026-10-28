import assert from "node:assert/strict";
import { test } from "node:test";
import { BrowRig, LID_FROM_AU, gazePose, type BrowInput } from "../rig/brow";
import { MARGIN_RADIUS, lidState, marginsAt } from "./margins";
import { getEraLook } from "../look";
import { GazeRig } from "../rig/gaze";

const IRIS = { x: 700, y: 450, r: 250 };

/** A frame of input: the pointer away, the eye at rest. */
function frame(now: number, o: Partial<BrowInput> = {}): BrowInput {
  return {
    dt: 1 / 60,
    now,
    reduce: false,
    calm: false,
    interactive: true,
    present: false,
    mouse: true,
    moveAt: -1e3,
    out: false,
    px: 0,
    py: 0,
    iris: IRIS,
    down: false,
    onIris: false,
    dragged: false,
    travel: null,
    cut: false,
    era: 1970,
    exiting: false,
    gaze: { x: 0, y: 0 },
    saccading: false,
    glare: 0,
    squint: 0,
    blink: 0,
    ...o,
  };
}

/** Runs `seconds` of frames, with `at(t)` overriding each; returns the node offsets seen. */
function run(rig: BrowRig, t0: number, seconds: number, at: (t: number) => Partial<BrowInput> = () => ({})) {
  const seen: { t: number; dy: number[]; dx: number[] }[] = [];
  for (let t = t0; t < t0 + seconds; t += 1 / 60) {
    const o = rig.update(frame(t, at(t)));
    seen.push({ t, dy: [0, 1, 2, 3, 4].map((i) => o[i * 4 + 1]), dx: [0, 1, 2, 3, 4].map((i) => o[i * 4]) });
  }
  return seen;
}

test("at rest, with nobody there, the brow does not move", () => {
  const rig = new BrowRig();
  const s = run(rig, 0, 3);
  for (const f of s) for (const v of [...f.dy, ...f.dx]) assert.ok(Math.abs(v) < 1e-6);
});

test("reduced motion holds the brow still, whatever happens", () => {
  const rig = new BrowRig();
  rig.express("delight");
  const s = run(rig, 0, 2, () => ({ reduce: true, present: true, moveAt: 0, down: true, onIris: true }));
  for (const f of s) for (const v of [...f.dy, ...f.dx]) assert.equal(v, 0);
});

test("a visitor coming back gets an eyebrow flash: both parts up within ~0.2 s, back down by 1.6 s", () => {
  const rig = new BrowRig();
  run(rig, 0, 1);
  const s = run(rig, 1, 2, (t) => ({ present: true, moveAt: 1, px: 100, py: 100 + 0 * t }));
  const peak = s.reduce((a, f) => (f.dy[2] > a.dy[2] ? f : a));
  assert.ok(peak.t - 1 < 0.35, `peak at ${(peak.t - 1).toFixed(2)} s`);
  assert.ok(peak.dy[2] > 0.9 && peak.dy[2] < 2.2, `arch ${peak.dy[2].toFixed(2)} mm`);
  assert.ok(peak.dy[0] > 0.6, `head ${peak.dy[0].toFixed(2)} mm`);
  const after = s.find((f) => f.t > 2.6)!;
  // (interest stays: the pointer is still here, far from the eye)
  assert.ok(after.dy[2] < 0.6, `still ${after.dy[2].toFixed(2)} mm at 1.6 s`);
});

test("a hand resting still on the mouse is not away: moving after 7 s is a small 'oh', not a greeting", () => {
  const after = (left: boolean) => {
    const rig = new BrowRig();
    const here = { present: true, px: 100, py: 100 };
    run(rig, 0, 7, (t) => ({ ...here, moveAt: 0, out: left && t > 3, present: !(left && t > 3) }));
    const s = run(rig, 7, 1.5, () => ({ present: true, moveAt: 7, px: 300, py: 120 }));
    return Math.max(...s.map((f) => f.dy[2]));
  };
  const stayed = after(false);
  const greeted = after(true);
  assert.ok(stayed > 0.3, `the "oh" shows: ${stayed.toFixed(2)} mm`);
  assert.ok(stayed < 0.6 * greeted, `"oh" ${stayed.toFixed(2)} mm against a greeting's ${greeted.toFixed(2)} mm`);
});

test("coming back into the window is a full greeting, however short the absence", () => {
  const rig = new BrowRig();
  run(rig, 0, 5, () => ({ present: true, moveAt: 0, px: 100, py: 100 }));
  run(rig, 5, 2, () => ({ present: false, out: true, moveAt: 0, px: 100, py: 100 }));
  const s = run(rig, 7, 1.5, () => ({ present: true, moveAt: 7, px: 400, py: 300 }));
  assert.ok(Math.max(...s.map((f) => f.dy[2])) > 1.1);
});

test("the flash travels: the tail peaks after the head", () => {
  const rig = new BrowRig();
  const s = run(rig, 0, 1.5, () => ({ present: true, moveAt: 0, px: 100, py: 100 }));
  const tPeak = (i: number) => s.reduce((a, f) => (f.dy[i] > a.dy[i] ? f : a)).t;
  assert.ok(tPeak(4) > tPeak(0), `head ${tPeak(0).toFixed(3)} tail ${tPeak(4).toFixed(3)}`);
});

test("a press on the iris is a wince: the head goes down and toward the nose", () => {
  const rig = new BrowRig();
  const on = { present: true, moveAt: -10, px: IRIS.x, py: IRIS.y };
  run(rig, 0, 1, () => on);
  const s = run(rig, 1, 0.3, () => ({ ...on, down: true, onIris: true }));
  const low = s.reduce((a, f) => (f.dy[0] < a.dy[0] ? f : a));
  assert.ok(low.dy[0] < -0.5, `head dy ${low.dy[0].toFixed(2)}`);
  assert.ok(low.dx[0] < -0.4, `head dx ${low.dx[0].toFixed(2)}`);
  // (the tail is the slowest node, so it lags a quick wince)
  assert.ok(low.dy[4] < -0.2, `tail dy ${low.dy[4].toFixed(2)}`);
});

test("a press after a long still rest is a wince, not a greeting (the press reports a move in place)", () => {
  const rig = new BrowRig();
  const on = { present: true, moveAt: 0, px: IRIS.x, py: IRIS.y };
  run(rig, 0, 7, () => on);
  const s = run(rig, 7, 0.3, (t) => ({ ...on, moveAt: 7, down: true, onIris: true, dt: t < 7.02 ? 1 / 60 : 1 / 60 }));
  assert.ok(Math.max(...s.map((f) => f.dy[2])) < 0.6, `arch rose to ${Math.max(...s.map((f) => f.dy[2])).toFixed(2)} mm`);
  assert.ok(Math.min(...s.map((f) => f.dy[0])) < -0.3, "the head winced down");
});

test("going in is delight: the biggest lift", () => {
  const rig = new BrowRig();
  const s = run(rig, 0, 1, (t) => ({ exiting: t > 0.2 }));
  const peak = Math.max(...s.map((f) => f.dy[2]));
  assert.ok(peak > 1.8 && peak < 3.5, `arch ${peak.toFixed(2)} mm`);
});

test("scribbling confuses it: the inner brow rises while the head knits in", () => {
  const rig = new BrowRig();
  // back and forth across 3 R, five times a second
  const s = run(rig, 0, 2.5, (t) => ({
    present: true,
    moveAt: t,
    px: 200 + Math.sin(t * Math.PI * 2 * 2.5) * 750,
    py: 200,
  }));
  const info = rig.info();
  assert.ok(info.emotions.confused > 0.4, `confused ${info.emotions.confused.toFixed(2)}`);
  assert.ok(info.au[0] > 0.2 && info.au[2] > 0.3, `AU1 ${info.au[0].toFixed(2)} AU4 ${info.au[2].toFixed(2)}`);
  assert.ok(s.at(-1)!.dx[0] < -0.15, `head drawn in ${s.at(-1)!.dx[0].toFixed(2)}`);
});

test("a long, still rest on the iris turns warm: the tail softens down", () => {
  const rig = new BrowRig();
  run(rig, 0, 6, () => ({ present: true, moveAt: 0, px: IRIS.x + 20, py: IRIS.y }));
  const info = rig.info();
  assert.ok(info.emotions.warm > 0.5, `warm ${info.emotions.warm.toFixed(2)}`);
  assert.ok(info.nodes[4].dy < info.nodes[2].dy, "the tail sits lower than the arch");
});

test("hovering a moment is curious: the outer brow lifts more than the head", () => {
  const rig = new BrowRig();
  run(rig, 0, 2, () => ({ present: true, moveAt: 0, px: IRIS.x, py: IRIS.y }));
  const n = rig.info().nodes;
  assert.ok(n[3].dy > n[0].dy + 0.15, `outer ${n[3].dy.toFixed(2)} head ${n[0].dy.toFixed(2)}`);
});

test("a fast scrub strains, and stopping it is a relief", () => {
  const rig = new BrowRig();
  run(rig, 0, 1.5, (t) => ({ travel: t * 3 }));
  assert.ok(rig.info().emotions.strain > 0.4);
  const s = run(rig, 1.5, 2.5, () => ({ travel: null }));
  assert.ok(s.some((f) => f.dy[1] > 0.1), "a soft lift as it lets go");
});

test("the bones hold the chain together: nodes keep their order and stay within 4 mm", () => {
  const rig = new BrowRig();
  const emotions = ["delight", "flinch", "surprise", "wistful", "greet", "relief"] as const;
  emotions.forEach((e, i) => rig.express(e, 1, i * 0.15));
  run(rig, 0, 3, (t) => ({ squint: 1, blink: t % 1 < 0.3 ? 1 : 0, gaze: { x: Math.sin(t * 3), y: Math.cos(t * 2) } }));
  const info = rig.info();
  for (let i = 1; i < 5; i++) assert.ok(info.points[i][0] > info.points[i - 1][0], `node ${i} crossed its neighbour`);
  for (const n of info.nodes) assert.ok(Math.abs(n.dx) <= 4 && Math.abs(n.dy) <= 4.6);
});

// ---- the lids, the motor program, memory ----------------------------------

/** A dart from far to the iris over ~0.1 s, starting at t. */
const dart = (t0: number) => (t: number): Partial<BrowInput> => {
  const k = Math.min(1, Math.max(0, (t - t0) / 0.1));
  return { present: true, moveAt: t, px: 50 + (IRIS.x - 50) * k, py: 850 + (IRIS.y - 850) * k };
};

test("surprise lifts the upper lid off the iris and holds the blinks, then blinks once as it lets go", () => {
  const rig = new BrowRig();
  rig.update(frame(0));
  rig.express("surprise", 1, 0.01);
  let raise = 0;
  let held = false;
  let blinks = 0;
  for (let t = 0; t < 2; t += 1 / 60) {
    rig.update(frame(t));
    raise = Math.max(raise, rig.lids.raise);
    held ||= rig.holdBlinks;
    if (rig.blinkNow) blinks++;
  }
  // (AU5 at ~1: ~0.1 rad, ~1.3 mm at the apex; 0.17 over-acted, 2026-10-29)
  assert.ok(raise > LID_FROM_AU.raise * 0.7 && raise <= LID_FROM_AU.raise * 1.2 + 1e-9, `raise ${raise.toFixed(3)} rad`);
  assert.ok(held, "blinks held through the startle");
  assert.equal(blinks, 1);
});

test("a brisk move across the screen, beside the eye, is not a dart: no startle", () => {
  // the user's reported twitch (2026-10-28): ordinary moves toward the middle of
  // the screen lifted the brow +2 mm. A glide of 0.25 s from a corner to the far
  // side passes the iris ~1.5 R off its middle (a diagonal above it, a sweep below it).
  for (const [ax, ay, bx, by] of [
    [IRIS.x - 3 * IRIS.r, IRIS.y - 3.2 * IRIS.r, IRIS.x + 3 * IRIS.r, IRIS.y - 0.2 * IRIS.r],
    [IRIS.x - 3.2 * IRIS.r, IRIS.y + 1.5 * IRIS.r, IRIS.x + 3.2 * IRIS.r, IRIS.y + 1.5 * IRIS.r],
  ]) {
    const rig = new BrowRig();
    run(rig, 0, 2, () => ({ present: true, moveAt: 0, px: ax, py: ay }));
    let p = 0;
    for (let t = 2; t < 3.2; t += 1 / 60) {
      const f = Math.min(1, (t - 2) / 0.25);
      const k = f * f * f * (10 - 15 * f + 6 * f * f);
      rig.update(frame(t, { present: true, moveAt: t, px: ax + (bx - ax) * k, py: ay + (by - ay) * k }));
      const i = rig.info();
      p = Math.max(p, i.emotions.surprise, i.emotions.wary);
    }
    assert.ok(p < 0.05, `startled ${p.toFixed(2)} by a pass beside the eye`);
  }
});

test("a wince is a motor program: the lids tighten before the brow comes down", () => {
  const rig = new BrowRig();
  rig.update(frame(0));
  rig.express("flinch", 1, 0.01);
  let tLid = -1;
  let tBrow = -1;
  for (let t = 0; t < 0.6; t += 1 / 240) {
    rig.update({ ...frame(t), dt: 1 / 240 });
    if (tLid < 0 && rig.lids.tight > 0.4) tLid = t;
    if (tBrow < 0 && rig.au[2] > 0.4) tBrow = t;
  }
  assert.ok(tLid > 0 && tBrow > 0 && tLid < tBrow, `lids at ${tLid.toFixed(3)} s, brow at ${tBrow.toFixed(3)} s`);
});

test("a startle repeated fades, and the third is met with wariness, eyes wide", () => {
  const rig = new BrowRig();
  const peaks: number[] = [];
  let wary = 0;
  let raise = 0;
  for (const t0 of [0, 4, 8]) {
    // the pointer parked far away between darts
    run(rig, t0 - 0.0001 < 0 ? 0 : t0 - 2, t0 < 0.1 ? 0.0001 : 2, () => ({ present: true, moveAt: t0 - 2, px: 50, py: 850 }));
    let p = 0;
    for (let t = t0; t < t0 + 1.2; t += 1 / 60) {
      rig.update(frame(t, dart(t0)(t)));
      const i = rig.info();
      p = Math.max(p, i.emotions.surprise);
      wary = Math.max(wary, i.emotions.wary);
      if (t0 === 8) raise = Math.max(raise, rig.lids.raise);
    }
    peaks.push(p);
  }
  assert.ok(peaks[1] < peaks[0] * 0.8, `second startle ${peaks[1].toFixed(2)} after ${peaks[0].toFixed(2)}`);
  assert.ok(wary > 0.5, `wary ${wary.toFixed(2)}`);
  assert.ok(raise > LID_FROM_AU.raise * 0.47, `eyes wide ${raise.toFixed(3)} rad`);
});

test("three pokes that never go in are annoying: the head drives down and in, the outer brow stays up", () => {
  const rig = new BrowRig();
  const on = { present: true, moveAt: 0, px: IRIS.x, py: IRIS.y };
  run(rig, 0, 0.5, () => on);
  for (const t0 of [0.5, 2, 3.5]) {
    run(rig, t0, 0.3, () => ({ ...on, down: true, onIris: true }));
    run(rig, t0 + 0.3, 1.2, () => on);
  }
  const i = rig.info();
  assert.ok(i.emotions.annoyed > 0.4, `annoyed ${i.emotions.annoyed.toFixed(2)}`);
  assert.ok(i.nodes[0].dy < i.nodes[3].dy - 0.3, `a V: head ${i.nodes[0].dy.toFixed(2)}, outer ${i.nodes[3].dy.toFixed(2)}`);
});

test("after a poke, a cursor coming back toward the iris is braced for", () => {
  const rig = new BrowRig();
  const on = { present: true, moveAt: 0, px: IRIS.x, py: IRIS.y };
  run(rig, 0, 0.5, () => on);
  run(rig, 0.5, 0.3, () => ({ ...on, down: true, onIris: true }));
  // away, and settle
  run(rig, 0.8, 4, (t) => ({ present: true, moveAt: t, px: 60, py: 850 }));
  const calm = rig.info().au[5];
  // coming back, slowly enough not to startle
  let tight = 0;
  for (let t = 4.8; t < 6.3; t += 1 / 60) {
    const k = (t - 4.8) / 1.5;
    rig.update(frame(t, { present: true, moveAt: t, px: 60 + (IRIS.x - 60) * k, py: 850 + (IRIS.y + 300 - 850) * k }));
    tight = Math.max(tight, rig.info().au[5]);
  }
  assert.ok(tight > calm + 0.1, `AU7 ${calm.toFixed(2)} → ${tight.toFixed(2)}`);
});

test("slipping slowly on and off the iris is met with scepticism, lids lowered; a scribble across it is not", () => {
  const slow = new BrowRig();
  // three slow passes onto the iris and off, 2.4 s each
  run(slow, 0, 7.2, (t) => {
    const k = (t % 2.4) / 2.4;
    return { present: true, moveAt: t, px: IRIS.x + 400 * Math.cos(k * Math.PI * 2), py: IRIS.y };
  });
  const s = slow.info();
  assert.ok(s.emotions.skeptical > 0.4, `skeptical ${s.emotions.skeptical.toFixed(2)}`);
  assert.ok(slow.lids.raise < -0.02, `lids ${slow.lids.raise.toFixed(3)} rad`);
  const scribble = new BrowRig();
  let most = 0;
  for (let t = 0; t < 4; t += 1 / 60) {
    scribble.update(frame(t, { present: true, moveAt: t, px: IRIS.x + Math.sin(t * Math.PI * 5) * 400, py: IRIS.y }));
    most = Math.max(most, scribble.info().emotions.skeptical);
  }
  assert.ok(most < 0.05, `a scribble read as scepticism: ${most.toFixed(2)}`);
});

test("a long stillness turns to boredom, lids a little heavy but never sleepy; a move lifts them at once", () => {
  const rig = new BrowRig();
  run(rig, 0, 25, () => ({ present: true, moveAt: 0, px: 100, py: 100 }));
  assert.ok(rig.info().emotions.bored < 0.05, "not before 30 s");
  run(rig, 25, 25, () => ({ present: true, moveAt: 0, px: 100, py: 100 }));
  assert.ok(rig.info().emotions.bored > 0.5);
  // (~0.7 mm at the apex at most: at 1.4 mm it read as sleepy)
  assert.ok(rig.lids.raise < -0.02 && rig.lids.raise > -0.065, `lids ${rig.lids.raise.toFixed(3)} rad`);
  run(rig, 50, 1, () => ({ present: true, moveAt: 50, px: 300, py: 200 }));
  assert.ok(rig.info().emotions.bored < 0.2);
});

// ---- the eras' moods (look.ts ERA_BROW, plan §7) ---------------------------

const MOOD_ERAS = ["1970", "1981", "1991", "1995", "1997", "2000", "2003", "2026"] as const;

/** How far the mood moves the brow (its most-moved node) against the same face without it, mm. */
function moodDelta(era: string, o: Partial<BrowInput> = {}, seconds = 6) {
  const on = new BrowRig();
  const off = new BrowRig();
  off.moods = false;
  const mood = getEraLook(era).browMood;
  run(on, 0, seconds, () => ({ mood, ...o }));
  run(off, 0, seconds, () => ({ mood, ...o }));
  const a = on.info().nodes;
  const b = off.info().nodes;
  return { most: Math.max(...a.map((n, i) => Math.hypot(n.dx - b[i].dx, n.dy - b[i].dy))), arch: a[2].dy - b[2].dy, tail: a[4].dy - b[4].dy, lids: on.lids.raise - off.lids.raise };
}

test("2003, a video call: warmth with attention, the tail softening", () => {
  const d = moodDelta("2003");
  assert.ok(d.tail < d.arch, `the tail sits under the arch: tail ${d.tail.toFixed(2)}, arch ${d.arch.toFixed(2)}`);
  assert.ok(d.most > 0.05 && d.most < 0.5, `${d.most.toFixed(2)} mm`);
});

test("2009 holds no expression (the posture is its own): only now and then a gentle flick", () => {
  assert.ok(moodDelta("2009").most < 0.02, "nothing held at rest");
  const rig = new BrowRig();
  const mood = getEraLook("2009").browMood;
  let n = 0;
  let was = 0;
  let most = 0;
  for (let t = 0; t < 40; t += 1 / 60) {
    const o = rig.update(frame(t, { mood, saccading: t % 0.8 < 0.05 }));
    const g = rig.info().emotions.greet;
    if (g > 0.05 && was <= 0.05) n++;
    was = g;
    most = Math.max(most, o[2 * 4 + 1]);
  }
  assert.ok(n >= 2 && n <= 4, `${n} flicks in 40 s (at most every ~10 s)`);
  assert.ok(most < 0.6, `gentler than 1995's: ${most.toFixed(2)} mm`);
});

test("2013, the selfie: up at the lens the brows lift with a hint of smile; at the screen they relax", () => {
  const lens = moodDelta("2013", { gaze: { x: 0, y: 0.45 } });
  const screen = moodDelta("2013", { gaze: { x: 0.04, y: 0.25 } });
  assert.ok(lens.arch > 0.1 && lens.most < 0.5, `at the lens: arch +${lens.arch.toFixed(2)} mm (most ${lens.most.toFixed(2)})`);
  assert.ok(screen.most < 0.03, `at the screen: ${screen.most.toFixed(2)} mm`);
});

test("2026, eye contact: looking at you the brow is up a little; following the cursor away it lets the contact go", () => {
  const at = moodDelta("2026", { gaze: { x: 0, y: 0 } });
  const away = moodDelta("2026", { gaze: { x: 0.7, y: 0.2 } });
  assert.ok(at.arch > 0.1 && at.most < 0.5, `at you: arch +${at.arch.toFixed(2)} mm (most ${at.most.toFixed(2)})`);
  assert.ok(at.lids > 0 && at.lids < 0.03, `the lids a touch open: ${at.lids.toFixed(3)} rad`);
  assert.ok(away.most < 0.03, `looking away: ${away.most.toFixed(2)} mm`);
});

/** 2026's eyebrow flashes as the eye moves: `gaze(t)` over `seconds`, the onsets of a greeting seen. */
function meetings(gaze: (t: number) => { x: number; y: number }, seconds: number, o: Partial<BrowInput> = {}, moods = true) {
  const rig = new BrowRig();
  rig.moods = moods;
  const mood = getEraLook("2026").browMood;
  const at: number[] = [];
  let was = 0;
  let most = 0;
  for (let t = 0; t < seconds; t += 1 / 60) {
    const out = rig.update(frame(t, { mood, gaze: gaze(t), ...o }));
    const g = rig.info().emotions.greet;
    if (g > 0.05 && was <= 0.05) at.push(t);
    was = g;
    most = Math.max(most, out[2 * 4 + 1]);
  }
  return { at, most };
}
const AWAY = { x: 0.7, y: 0.3 };
const AT_YOU = { x: 0, y: 0 };

test("2026: meeting your eyes again flashes the brow, once the eye has landed on you", () => {
  // away for 2 s, then back at you
  const m = meetings((t) => (t < 2 ? AWAY : AT_YOU), 5);
  assert.equal(m.at.length, 1, `${m.at.length} flashes`);
  assert.ok(m.at[0] > 2.2 && m.at[0] < 2.5, `the flash ${(m.at[0] - 2).toFixed(2)} s after the eye lands`);
  // (a small flash: well under a visitor's greeting, ~1.4 mm)
  assert.ok(m.most > 0.3 && m.most < 0.9, `the arch tops out at ${m.most.toFixed(2)} mm`);
});

test("2026: a sweep across your eyes is not a meeting, nor a glance away, nor a phone, a poster or the moods off", () => {
  // the eye crossing the middle for a tenth of a second
  assert.equal(meetings((t) => (t > 2 && t < 2.1 ? AT_YOU : AWAY), 5).at.length, 0, "a sweep");
  // looking away for half a second, then back
  assert.equal(meetings((t) => (t > 2 && t < 2.5 ? AWAY : AT_YOU), 5).at.length, 0, "a glance away");
  const back = (t: number) => (t < 2 ? AWAY : AT_YOU);
  assert.equal(meetings(back, 5, { calm: true }).at.length, 0, "a phone");
  assert.equal(meetings(back, 5, { interactive: false }).at.length, 0, "a poster");
  assert.equal(meetings(back, 5, {}, false).at.length, 0, "moods off");
});

test("2026: meeting again and again flashes only now and then, at most every 12 s", () => {
  // away 1.5 s, back 1.5 s, for 40 s
  const m = meetings((t) => (t % 3 < 1.5 ? AWAY : AT_YOU), 40);
  assert.ok(m.at.length >= 2 && m.at.length <= 4, `${m.at.length} flashes in 40 s`);
  for (let i = 1; i < m.at.length; i++) assert.ok(m.at[i] - m.at[i - 1] >= 12 - 0.05, `two flashes ${(m.at[i] - m.at[i - 1]).toFixed(2)} s apart`);
});

test("2026 mirrors the visitor: what they make it feel comes 1.2 × as strong, the screen's glare does not", () => {
  const poke = (era: string) => {
    const rig = new BrowRig();
    const mood = getEraLook(era).browMood;
    run(rig, 0, 1, () => ({ mood }));
    let most = 0;
    let deep = 0;
    for (let t = 1; t < 2.5; t += 1 / 60) {
      const out = rig.update(frame(t, { mood, present: true, moveAt: 0, px: IRIS.x, py: IRIS.y, down: t < 1.3, onIris: true }));
      most = Math.max(most, rig.info().emotions.flinch);
      deep = Math.min(deep, out[1]);
    }
    return { most, deep };
  };
  const a = poke("2026");
  const b = poke("2009");
  assert.ok(Math.abs(a.most - 1.2) < 0.01 && Math.abs(b.most - 1) < 0.01, `the wince ${a.most.toFixed(2)} vs ${b.most.toFixed(2)}`);
  assert.ok(a.deep < b.deep - 0.05, `the head goes deeper: ${a.deep.toFixed(2)} vs ${b.deep.toFixed(2)} mm`);
  const glare = (era: string) => {
    const rig = new BrowRig();
    run(rig, 0, 4, () => ({ mood: getEraLook(era).browMood, glare: 1, gaze: AWAY }));
    return rig.info().emotions.focus;
  };
  assert.ok(Math.abs(glare("2026") - glare("2009")) < 0.01, "the glare's knit is the same in both");
});

test("batch 2 moods differ: 1995 alert, 1997 appraising (lids a hair lower), 2000 a stare (lids a touch wide under a lowered brow)", () => {
  const at = (era: string) => {
    const rig = new BrowRig();
    run(rig, 0, 6, () => ({ mood: getEraLook(era).browMood }));
    return { n: rig.info().nodes, lids: rig.lids.raise };
  };
  const a95 = at("1995");
  const a97 = at("1997");
  const a00 = at("2000");
  const a70 = at("1970");
  assert.ok(a95.n[2].dy > 0.1, `1995 lifts: ${a95.n[2].dy.toFixed(2)}`);
  assert.ok(a97.lids < -0.005, `1997's lids a hair lower: ${a97.lids.toFixed(3)} rad`);
  assert.ok(a97.n[3].dy > a97.n[0].dy, "1997's outer brow over its head");
  assert.ok(a00.n[0].dy < -0.1, `2000's head lowered: ${a00.n[0].dy.toFixed(2)}`);
  assert.ok(a00.lids > a70.lids + 0.01, `2000 stares where 1970 narrows: ${a00.lids.toFixed(3)} vs ${a70.lids.toFixed(3)}`);
});

test("1995's flick: the brow flicks as the eyes jump, at most every ~7 s; never on a phone, never with moods off", () => {
  const flicks = (o: Partial<BrowInput>, moods = true) => {
    const rig = new BrowRig();
    rig.moods = moods;
    const mood = getEraLook("1995").browMood;
    let n = 0;
    const at: number[] = [];
    let was = 0;
    for (let t = 0; t < 40; t += 1 / 60) {
      // a saccade starting every 0.8 s
      rig.update(frame(t, { mood, saccading: t % 0.8 < 0.05, ...o }));
      const g = rig.info().emotions.greet;
      if (g > 0.05 && was <= 0.05) {
        n++;
        at.push(t);
      }
      was = g;
    }
    return { n, gaps: at.slice(1).map((t, i) => t - at[i]) };
  };
  const desk = flicks({});
  assert.ok(desk.n >= 3 && desk.n <= 6, `${desk.n} flicks in 40 s`);
  for (const g of desk.gaps) assert.ok(g >= 7 * 0.85 - 0.05, `two flicks ${g.toFixed(2)} s apart`);
  assert.equal(flicks({ calm: true }).n, 0, "none on a phone");
  assert.equal(flicks({}, false).n, 0, "none with moods off");
  // and small: a flick lifts the arch well under a greeting
  const rig = new BrowRig();
  let most = 0;
  for (let t = 0; t < 12; t += 1 / 60) {
    const o = rig.update(frame(t, { mood: getEraLook("1995").browMood, saccading: t % 0.8 < 0.05 }));
    most = Math.max(most, o[2 * 4 + 1]);
  }
  assert.ok(most < 1, `a flick tops out at ${most.toFixed(2)} mm`);
});

test("each era's mood is subtle: a few tenths of a millimetre, the lids barely", () => {
  for (const era of MOOD_ERAS) {
    const rig = new BrowRig();
    run(rig, 0, 6, () => ({ mood: getEraLook(era).browMood }));
    const i = rig.info();
    const most = Math.max(...i.nodes.map((n) => Math.hypot(n.dx, n.dy)));
    assert.ok(most > 0.08, `${era}: the mood shows (${most.toFixed(2)} mm)`);
    assert.ok(most < 0.5, `${era}: the mood is subtle (${most.toFixed(2)} mm)`);
    assert.ok(Math.abs(rig.lids.raise) < 0.03, `${era}: lids ${rig.lids.raise.toFixed(3)} rad`);
  }
});

test("the moods differ: concentration in 1970, curiosity in 1981, wonder in 1991", () => {
  const at = (era: string) => {
    const rig = new BrowRig();
    run(rig, 0, 6, () => ({ mood: getEraLook(era).browMood }));
    return rig.info().nodes;
  };
  const n70 = at("1970");
  const n81 = at("1981");
  const n91 = at("1991");
  assert.ok(n70[0].dy < -0.08 && n70[0].dx < -0.05, "1970: the head knits down and in");
  assert.ok(n81[3].dy > n81[0].dy + 0.1, "1981: the outer brow sits above the head");
  assert.ok(n91[2].dy > n70[2].dy + 0.08, "1991: the arch lifts over 1970's");
});

test("a mood sits under what the visitor brings, and is back after it", () => {
  const rig = new BrowRig();
  const mood = getEraLook("1970").browMood;
  run(rig, 0, 5, () => ({ mood }));
  const rest = rig.info().nodes[2].dy;
  rig.express("surprise", 1, 5.01);
  const s = run(rig, 5, 3, () => ({ mood }));
  assert.ok(Math.max(...s.map((f) => f.dy[2])) > rest + 1, "the surprise plays over the concentration");
  assert.ok(Math.abs(s.at(-1)!.dy[2] - rest) < 0.08, "and the concentration is back");
});

test("a new era's mood settles behind the cut's shut lids, before they open", () => {
  const rig = new BrowRig();
  run(rig, 0, 5, () => ({ mood: getEraLook("1970").browMood }));
  // the cut: 0.5 s with the lids shut, the new era's look swapped in at once
  run(rig, 5, 0.5, () => ({ cut: true, era: 1981, mood: getEraLook("1981").browMood }));
  const i = rig.info();
  assert.ok(i.emotions.curious > 0.2, `1981's curiosity in place: ${i.emotions.curious.toFixed(2)}`);
  assert.ok(i.emotions.focus < 0.2, `1970's concentration gone: ${i.emotions.focus.toFixed(2)}`);
});

test("reduced motion holds the face still whatever the era's mood", () => {
  const rig = new BrowRig();
  const s = run(rig, 0, 3, () => ({ reduce: true, mood: getEraLook("1991").browMood }));
  for (const f of s) for (const v of [...f.dy, ...f.dx]) assert.equal(v, 0);
});

test("a poster is never bored, and the opening's wait does not count as idle", () => {
  const poster = new BrowRig();
  run(poster, 0, 40, () => ({ interactive: false }));
  assert.ok(poster.info().emotions.bored < 0.01);
  const loader = new BrowRig();
  run(loader, 0, 22, () => ({ interactive: false }));
  run(loader, 22, 5, () => ({ interactive: true }));
  assert.ok(loader.info().emotions.bored < 0.01, "opened 5 s ago: not bored");
});

test("whatever the face feels, the lids never cross (the margins twin at the lid muscles' extremes)", () => {
  const span = Array.from({ length: 61 }, (_, i) => -1 + (2 * i) / 60);
  for (const raise of [-LID_FROM_AU.droop - LID_FROM_AU.tightUpper, 0, LID_FROM_AU.raise * 1.2])
    for (const lower of [LID_FROM_AU.lowerMin, 1])
    for (const squint of [0, 0.5, 1])
      for (const gy of [-1, 0, 1])
        for (const blink of [0, 0.5, 1]) {
          const L = lidState({ tiltDeg: 2, squint, gaze: { x: 0.5, y: gy } });
          L.upper = Math.max(L.upper * 0.35, L.upper + raise);
          L.lower *= lower;
          for (const s of span) {
            const m = marginsAt(s, L, blink);
            assert.ok(m.up >= m.lo + 0.004 - 1e-12, `crossed: raise ${raise} squint ${squint} gaze ${gy} blink ${blink} s ${s}`);
          }
          // and a wide eye still closes to a seam in a blink
          if (blink === 1) for (const s of span) assert.ok((marginsAt(s, L, 1).up - marginsAt(s, L, 1).lo) * MARGIN_RADIUS < 0.25);
        }
});

test("a wince narrows the eye toward slits (the reference's fury row), a surprise opens it", () => {
  const opening = (feel: "flinch" | "surprise" | null) => {
    const rig = new BrowRig();
    if (feel) rig.hold(feel, 1);
    run(rig, 0, 1);
    const L = lidState({ tiltDeg: 2, squint: rig.lids.tight });
    L.upper = Math.max(L.upper * 0.35, L.upper + rig.lids.raise);
    L.lower *= rig.lids.lower;
    const m = marginsAt(0, L);
    return (Math.sin(m.up) - Math.sin(m.lo)) * MARGIN_RADIUS;
  };
  const rest = opening(null);
  const wince = opening("flinch");
  const wide = opening("surprise");
  assert.ok(wince < rest * 0.5, `wince ${wince.toFixed(2)} mm of ${rest.toFixed(2)}`);
  assert.ok(wince > 1, `still open: ${wince.toFixed(2)} mm`);
  assert.ok(wide > rest + 1.5, `surprise ${wide.toFixed(2)} mm`);
});

test("no NaN on a zero or huge frame", () => {
  const rig = new BrowRig();
  for (const dt of [0, 0, 5, 1 / 60]) {
    const o = rig.update(frame(1, { dt, present: true, moveAt: 1, px: 10, py: 10 }));
    for (const v of o) assert.ok(Number.isFinite(v));
  }
});

test("only a real era change is greeted: the cut director's flicker for a press is not", () => {
  const rig = new BrowRig();
  run(rig, 0, 1);
  // busy for a moment, the era unchanged (a sign's press)
  const s1 = run(rig, 1, 1.5, (t) => ({ cut: t < 1.1 }));
  assert.ok(Math.max(...s1.map((f) => f.dy[2])) < 0.05, "no greeting for a flicker");
  // a cut to a new era, then the lids open on it
  const s2 = run(rig, 2.5, 1.5, (t) => ({ cut: t < 2.9, era: t < 2.6 ? 1970 : 1981 }));
  assert.ok(Math.max(...s2.map((f) => f.dy[2])) > 0.4, "a small greeting for a new era");
});

// ---- the eye leads, the brow follows (the user, 2026-10-28) ---------------------

/** The brow after the gaze has rested at (x, y) a while: per node dy and dx, mm. */
function browAtGaze(x: number, y: number) {
  const rig = new BrowRig();
  run(rig, 0, 3, () => ({ gaze: { x, y } }));
  return rig.info().nodes;
}

test("each direction the eye looks gives the brow its own shape", () => {
  const up = browAtGaze(0, 1);
  const upNose = browAtGaze(-0.71, 0.71);
  const upTemple = browAtGaze(0.71, 0.71);
  const nose = browAtGaze(-1, 0);
  const temple = browAtGaze(1, 0);
  const down = browAtGaze(0, -1);
  const downTemple = browAtGaze(0.71, -0.71);
  assert.ok(up[2].dy > 0.8, `up: the arch lifts ${up[2].dy.toFixed(2)} mm`);
  assert.ok(upNose[0].dy > upNose[3].dy + 0.4, `up and toward the nose: the inner brow leads (${upNose[0].dy.toFixed(2)} vs ${upNose[3].dy.toFixed(2)})`);
  assert.ok(upTemple[3].dy > upTemple[0].dy + 0.5, `up and toward the temple: the outer brow leads (${upTemple[3].dy.toFixed(2)} vs ${upTemple[0].dy.toFixed(2)})`);
  assert.ok(nose[0].dx < -0.25 && nose[0].dy < -0.1, "toward the nose: the head knits down and in");
  assert.ok(temple[4].dy > 0.3, "toward the temple: the tail lifts");
  assert.ok(down[4].dy < -0.4 && down[2].dy < -0.15, "down: the brow settles, the tail most");
  assert.ok(downTemple[4].dy < down[4].dy, "down and toward the temple: the tail falls most");
});

test("at the centre the gaze gives the brow nothing; an ordinary look already gives much of the shape, which keeps growing to the edge", () => {
  for (const n of browAtGaze(0, 0)) assert.ok(Math.abs(n.dy) < 1e-3 && Math.abs(n.dx) < 1e-3);
  // (fixation's drift stays in the dead zone)
  assert.ok(Math.abs(browAtGaze(0, 0.03)[2].dy) < 0.01, "drift leaves it alone");
  const at = [0.15, 0.33, 0.5, 0.75, 1].map((r) => browAtGaze(0, r)[2].dy);
  const full = at[4];
  assert.ok(at[0] > 0.2 * full, `a small look (0.15) lifts ${at[0].toFixed(2)} of ${full.toFixed(2)} mm`);
  assert.ok(at[1] > 0.45 * full && at[1] < 0.75 * full, `a third of the way lifts ${at[1].toFixed(2)} of ${full.toFixed(2)} mm`);
  for (let i = 1; i < at.length; i++) assert.ok(at[i] > at[i - 1] + 0.02, `still growing: ${at.map((v) => v.toFixed(2)).join(" ")}`);
});

test("the shape changes smoothly as the eye sweeps round: no jump between directions", () => {
  const dy = [0, 0, 0, 0, 0];
  const dx = [0, 0, 0, 0, 0];
  let last: number[] | null = null;
  for (let a = 0; a <= 360; a += 2) {
    gazePose(Math.cos((a * Math.PI) / 180), Math.sin((a * Math.PI) / 180), dy, dx);
    if (last) for (let i = 0; i < 5; i++) assert.ok(Math.abs(dy[i] - last[i]) < 0.1, `a jump of ${(dy[i] - last[i]).toFixed(2)} mm at ${a}°`);
    last = [...dy];
  }
});

test("the eye leads and the brow follows: after a look up, the brow starts once the saccade lands and catches up within half a second", () => {
  const rig = new BrowRig();
  run(rig, 0, 1);
  // the eye jumps up: 40 ms of saccade, then it is there
  const s = run(rig, 1, 1.2, (t) => ({ gaze: { x: 0, y: t < 1.04 ? (t - 1) / 0.04 : 1 }, saccading: t < 1.04 }));
  const final = s.at(-1)!.dy[2];
  const at = (ms: number) => s.find((f) => f.t >= 1 + ms / 1000)!.dy[2];
  assert.ok(at(100) < 0.1 * final, `still waiting at 100 ms: ${at(100).toFixed(2)} of ${final.toFixed(2)}`);
  assert.ok(at(500) > 0.6 * final, `most of the way by 500 ms: ${at(500).toFixed(2)} of ${final.toFixed(2)}`);
});

test("following the cursor round the eye, the brow follows the gaze all the way round", () => {
  const rig = new BrowRig();
  const seen: { a: number; arch: number; head: number; tail: number }[] = [];
  for (let t = 0; t < 8; t += 1 / 60) {
    const a = (t / 4) * Math.PI * 2;
    rig.update(frame(t, { gaze: { x: Math.cos(a), y: Math.sin(a) } }));
    const n = rig.info().nodes;
    if (t > 4) seen.push({ a: ((a * 180) / Math.PI) % 360, arch: n[2].dy, head: n[0].dy, tail: n[4].dy });
  }
  const top = seen.filter((f) => f.a > 60 && f.a < 120);
  const bottom = seen.filter((f) => f.a > 240 && f.a < 300);
  const avg = (xs: number[]) => xs.reduce((p, q) => p + q, 0) / xs.length;
  assert.ok(avg(top.map((f) => f.arch)) > avg(bottom.map((f) => f.arch)) + 0.8, "higher while the eye is up than while it is down");
});

test("wired as the stage wires it, the brow follows an eye that follows the cursor (pursuit is not a saccade)", () => {
  // The stage once passed the gaze rig's `busy`, true all through pursuit:
  // with a cursor there the brow waited for a landing that never came, and
  // never heard where the eye looked.
  const look = getEraLook("2026");
  const gaze = new GazeRig(look.gazePattern, look.restGaze, look.gaze);
  const rig = new BrowRig();
  let t = 0;
  let pursuit = 0;
  let frames = 0;
  const follow = (x: number, y: number, seconds: number) => {
    for (const end = t + seconds; t < end; t += 1 / 60) {
      // (a hand on a mouse is never quite still)
      const g = gaze.update(1 / 60, { x: x + 0.02 * Math.cos(t * 3), y: y + 0.02 * Math.sin(t * 3) }, false);
      rig.update(frame(t, { gaze: { x: g.x, y: g.y }, saccading: gaze.saccading, mood: look.browMood }));
      if (gaze.phase === "pursuit") pursuit++;
      frames++;
    }
    return rig.info().nodes.map((n) => n.dy);
  };
  const upNose = follow(-0.85, 0.85, 2.5);
  assert.ok(pursuit > frames / 2, `mostly pursuit: ${pursuit} of ${frames} frames`);
  assert.ok(upNose[0] > 0.7 && upNose[0] > upNose[4], `top-left: the inner brow leads, ${upNose.map((v) => v.toFixed(2)).join(" ")}`);
  const down = follow(0, -0.9, 2.5);
  assert.ok(down[4] < -0.3, `bottom: the brow settles, the tail most, ${down.map((v) => v.toFixed(2)).join(" ")}`);
});

test("a cursor passing slowly across the eye is the gaze's to answer, not curiosity; stopping on the iris is", () => {
  // across the iris at ~0.5 R/s (an ordinary slow sweep): no hovering, no hesitation
  const pass = new BrowRig();
  let most = 0;
  for (let t = 0; t < 6; t += 1 / 60) {
    pass.update(frame(t, { present: true, moveAt: t, px: IRIS.x, py: IRIS.y - 1.5 * IRIS.r + (t / 6) * 3 * IRIS.r }));
    most = Math.max(most, pass.info().emotions.curious);
  }
  assert.ok(most < 0.1, `passing: curious ${most.toFixed(2)}`);
  // resting on it
  const rest = new BrowRig();
  run(rest, 0, 2.5, () => ({ present: true, moveAt: 0, px: IRIS.x + 10, py: IRIS.y }));
  assert.ok(rest.info().emotions.curious > 0.5, `resting: curious ${rest.info().emotions.curious.toFixed(2)}`);
});

test("a cursor riding along the iris's edge, flickering on and off it, is not scepticism", () => {
  const rig = new BrowRig();
  let most = 0;
  for (let t = 0; t < 6; t += 1 / 60) {
    // along the rim, the distance wobbling either side of the edge every ~0.15 s
    const d = IRIS.r * (1 + 0.04 * Math.sin(t * 40));
    rig.update(frame(t, { present: true, moveAt: t, px: IRIS.x + d * Math.cos(t * 0.5), py: IRIS.y + d * Math.sin(t * 0.5) }));
    most = Math.max(most, rig.info().emotions.skeptical);
  }
  assert.ok(most < 0.1, `sceptical ${most.toFixed(2)}`);
});
