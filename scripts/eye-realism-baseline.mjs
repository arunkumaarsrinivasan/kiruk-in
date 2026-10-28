// R0 baseline for the realism pass (docs/EYE_REALISM_PLAN.md): drives /lab/eye in headless
// Chrome and records, per era and per tier, what every later phase is measured against:
//   · the live eye's GPU ms (median of the lab's timer), the pupil (mm), the gaze;
//   · the share of the iris the reflected page covers (the lab's "spec" view);
//   · the lid margins (CPU twin) against the almond the era media assume (window.__eyeAlign);
//   · each layer's cost, by switching it off and on in one page (runs drift ±25 % apart);
//   · WGSL sizes and pipeline builds (async or SYNC), from a GPUDevice wrapper;
//   · clean shots at six poses × ten eras, and each era's medium at rest and half shut.
// Writes <outDir>/baseline.json, the shots, and contact sheets. Needs the dev server.
//
// usage: node scripts/eye-realism-baseline.mjs <chrome> <outDir> <baseUrl> [sessions]
//   sessions: comma list of live,see,t2,gl,share,poses,seeposes,reflect,iris (default: all but reflect and iris)
//   e.g. node scripts/eye-realism-baseline.mjs "C:\Program Files\Google\Chrome\Application\chrome.exe" %TEMP%\r0 http://localhost:3031

import { spawn } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import sharp from "sharp";

const [chrome, outArg, base, only] = process.argv.slice(2);
const outDir = resolve(outArg);
mkdirSync(outDir, { recursive: true });
const ERAS = ["1970", "1981", "1991", "1995", "1997", "2000", "2003", "2009", "2013", "2026"];
const LAYERS = ["room", "eyeball", "cornea", "lids", "lashes", "tears", "socket"];
const POSES = [
  { name: "front", gaze: [0, 0] },
  { name: "left", gaze: [-0.8, 0] },
  { name: "right", gaze: [0.8, 0] },
  { name: "up", gaze: [0, 0.8] },
  { name: "down", gaze: [0, -0.8] },
  { name: "half-blink", gaze: [0, 0], blink: 0.5 },
];
const W = 1440;
const H = 900;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const median = (a) => {
  const s = a.filter((x) => typeof x === "number" && Number.isFinite(x)).sort((x, y) => x - y);
  return s.length ? s[Math.floor(s.length / 2)] : null;
};
const round = (x, d = 2) => (typeof x === "number" ? Number(x.toFixed(d)) : x);

// Logs WGSL sizes and pipeline builds: a SYNC build freezes every tab (eye-tsl-craft).
const GPU_LOG = `(() => {
  const log = (window.__gpuLog = { modules: [], pipelines: [] });
  const P = globalThis.GPUDevice && GPUDevice.prototype;
  if (!P) return;
  const csm = P.createShaderModule;
  P.createShaderModule = function (d) { log.modules.push({ label: d.label || "", kb: (d.code ? d.code.length : 0) / 1024 }); return csm.call(this, d); };
  const crp = P.createRenderPipeline;
  P.createRenderPipeline = function (d) { const t = performance.now(); const r = crp.call(this, d); log.pipelines.push({ label: d.label || "", ms: performance.now() - t, sync: true }); return r; };
  const crpa = P.createRenderPipelineAsync;
  P.createRenderPipelineAsync = function (d) { const t = performance.now(); return crpa.call(this, d).then((r) => { log.pipelines.push({ label: d.label || "", ms: performance.now() - t, sync: false }); return r; }); };
})();`;

async function open(query, vp = { w: W, h: H, dpr: 1, mobile: false }) {
  const profile = mkdtempSync(join(outDir, "prof-"));
  const port = 9400 + Math.floor(Math.random() * 500);
  const proc = spawn(
    chrome,
    ["--headless=new", `--user-data-dir=${profile}`, `--remote-debugging-port=${port}`, `--window-size=${vp.w},${vp.h}`, "--enable-unsafe-webgpu", "--enable-gpu", "about:blank"],
    { stdio: "ignore" },
  );
  let target;
  for (let i = 0; i < 200 && !target; i++) {
    await sleep(200);
    try {
      target = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find((t) => t.type === "page");
    } catch {}
  }
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((r) => ws.addEventListener("open", r));
  let id = 0;
  const pending = new Map();
  const logs = [];
  ws.addEventListener("message", (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) {
      pending.get(m.id)(m);
      pending.delete(m.id);
    }
    if (m.method === "Runtime.consoleAPICalled" && (m.params.type === "error" || m.params.type === "warning")) {
      const text = m.params.args.map((a) => a.value ?? a.description ?? "").join(" ");
      if (/wgsl|shader|pipeline|webgpu|error/i.test(text)) logs.push(`${m.params.type}: ${text.slice(0, 400)}`);
    }
    if (m.method === "Runtime.exceptionThrown") logs.push("exception: " + (m.params.exceptionDetails.exception?.description ?? m.params.exceptionDetails.text).slice(0, 400));
  });
  const send = (method, params = {}) =>
    new Promise((r) => {
      const i = ++id;
      pending.set(i, r);
      ws.send(JSON.stringify({ id: i, method, params }));
    });
  const ev = async (expr) => (await send("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true })).result?.result?.value;
  const click = (text) =>
    ev(`(() => { const el = [...document.querySelectorAll('button,label')].find(b => b.textContent.trim() === ${JSON.stringify(text)}); if (!el) return 'missing'; el.click(); return 'ok'; })()`);
  const slider = (label, value) =>
    ev(`(() => { const l = [...document.querySelectorAll('label')].find(x => x.textContent.trim().startsWith(${JSON.stringify(label)})); const el = l?.querySelector('input[type=range]'); if (!el) return 'missing'; Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(el, String(${value})); el.dispatchEvent(new Event('input', { bubbles: true })); return 'ok'; })()`);
  const key = (k) => ev(`window.dispatchEvent(new KeyboardEvent('keydown', { key: ${JSON.stringify(k)} }))`);
  const shot = async (file) => {
    await key("h");
    await sleep(250);
    await ev("document.querySelectorAll('nextjs-portal').forEach((e) => e.remove())");
    const r = await send("Page.captureScreenshot", { format: "png" });
    await key("h");
    const path = join(outDir, file);
    mkdirSync(join(path, ".."), { recursive: true });
    writeFileSync(path, Buffer.from(r.result.data, "base64"));
    return path;
  };
  await send("Page.enable");
  await send("Runtime.enable");
  await send("Page.addScriptToEvaluateOnNewDocument", { source: GPU_LOG });
  await send("Emulation.setDeviceMetricsOverride", { width: vp.w, height: vp.h, deviceScaleFactor: vp.dpr, mobile: vp.mobile });
  if (vp.mobile) await send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 });
  await send("Page.navigate", { url: `${base}/lab/eye${query}` });
  // up when the stage reports frames; warm when no pipeline has been built for 4 s
  const t0 = Date.now();
  for (let i = 0; i < 240; i++) {
    await sleep(250);
    if ((await ev("(window.__eyeLab?.current?.stats?.fps ?? 0) > 0")) === true) break;
  }
  let n = -1;
  let still = 0;
  while (still < 16 && Date.now() - t0 < 90000) {
    await sleep(250);
    const m = await ev("window.__gpuLog ? window.__gpuLog.pipelines.length : 0");
    still = m === n ? still + 1 : 0;
    n = m;
  }
  const upMs = Date.now() - t0;
  const close = () => {
    ws.close();
    proc.kill();
  };
  return { ev, click, slider, key, shot, close, logs, upMs };
}

const stage = (expr) => `window.__eyeLab.current.${expr}`;

async function gpuSamples(p, n = 8) {
  const ms = [];
  const fps = [];
  for (let i = 0; i < n; i++) {
    await sleep(520);
    const s = await p.ev(`JSON.stringify(${stage("stats")})`);
    const o = JSON.parse(s ?? "{}");
    ms.push(o.gpuMs);
    fps.push(o.fps);
  }
  return { gpuMs: round(median(ms)), fps: round(median(fps), 1) };
}

async function toEra(p, era, see) {
  await p.click(era);
  const idx = ERAS.indexOf(era);
  for (let i = 0; i < 60; i++) {
    await sleep(250);
    if (!see) break;
    const m = JSON.parse((await p.ev(`JSON.stringify(${stage("mediumInfo()")})`)) ?? "{}");
    if (m.cur === idx && !m.busy) break;
  }
}

/**
 * The share of the iris disc the reflection covers, from a shot of the lab's
 * "spec" view (black wherever nothing is mirrored). The threshold is low on
 * purpose: 1970's green page and 1995's navy one are dim, and a bright-only
 * threshold read them as almost no page at all.
 */
async function pageShare(file, iris, threshold = 24) {
  const { data, info } = await sharp(file).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const r = iris.r * (5.9 / 6); // the limbus
  let inside = 0;
  let lit = 0;
  for (let y = Math.max(0, Math.floor(iris.y - r)); y < Math.min(info.height, Math.ceil(iris.y + r)); y++)
    for (let x = Math.max(0, Math.floor(iris.x - r)); x < Math.min(info.width, Math.ceil(iris.x + r)); x++) {
      if ((x - iris.x) ** 2 + (y - iris.y) ** 2 > r * r) continue;
      const i = (y * info.width + x) * 3;
      const l = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
      inside++;
      if (l > threshold) lit++;
    }
  return inside ? lit / inside : null;
}

function shaders(log) {
  const mods = log?.modules ?? [];
  const pipes = log?.pipelines ?? [];
  const largest = mods.reduce((m, x) => (x.kb > (m?.kb ?? 0) ? x : m), null);
  const slowest = pipes.reduce((m, x) => (x.ms > (m?.ms ?? 0) ? x : m), null);
  return {
    modules: mods.length,
    totalKb: round(mods.reduce((s, x) => s + x.kb, 0), 0),
    largest: largest && { label: largest.label, kb: round(largest.kb, 0) },
    pipelines: pipes.length,
    sync: pipes.filter((x) => x.sync).length,
    syncBuilds: pipes.filter((x) => x.sync).map((x) => ({ label: x.label, ms: round(x.ms, 1) })),
    slowest: slowest && { label: slowest.label, ms: round(slowest.ms, 0), sync: slowest.sync },
  };
}

const out = existsSync(join(outDir, "baseline.json")) ? JSON.parse(readFileSync(join(outDir, "baseline.json"), "utf8")) : {};
out.date = new Date().toISOString();
out.viewport = `${W}x${H}@1`;
const want = (s) => (!only && s !== "reflect" && s !== "iris") || (only ?? "").split(",").includes(s);
const save = () => writeFileSync(join(outDir, "baseline.json"), JSON.stringify(out, null, 2));

// ---- live, clean: per-era numbers, page share, alignment, layer costs --------
if (want("live")) {
  const p = await open("?tier=3");
  const res = { query: "?tier=3", upMs: p.upMs, info: await p.ev(`JSON.stringify(${stage("info")})`), eras: {}, layers: {} };
  res.adapter = await p.ev("(async () => { const a = await navigator.gpu?.requestAdapter(); return a?.info ? [a.info.vendor, a.info.architecture, a.info.description].filter(Boolean).join(' ') : null; })()");
  await p.click("Margin overlay");
  for (const era of ERAS) {
    await toEra(p, era, false);
    await sleep(4000); // the pupil re-dilates at ~1 mm/s
    const g = await gpuSamples(p);
    const pupilMm = await p.ev(stage("pupilMm()"));
    const gaze = JSON.parse((await p.ev(`JSON.stringify(${stage("gazeInfo()")})`)) ?? "null");
    const align = JSON.parse((await p.ev("JSON.stringify(window.__eyeAlign())")) ?? "null");
    await p.shot(`align/${era}.png`);
    const iris = JSON.parse(await p.ev(`JSON.stringify(${stage("irisAt()")})`));
    await p.click("spec");
    await sleep(700);
    const specFile = await p.shot(`spec/${era}.png`);
    await p.click("final");
    res.eras[era] = {
      ...g,
      pupilMm: round(pupilMm),
      gaze,
      pageShare: round(await pageShare(specFile, iris)),
      align: align && Object.fromEntries(Object.entries(align).map(([k, v]) => [k, round(v)])),
    };
    console.log("live", era, JSON.stringify(res.eras[era]));
  }
  // each layer's cost, at 1970: off/on alternated three times, in one page
  await p.click("Margin overlay");
  await toEra(p, "1970", false);
  await sleep(3000);
  for (const layer of LAYERS) {
    const on = [];
    const off = [];
    for (let k = 0; k < 3; k++) {
      await p.click(layer);
      await sleep(900);
      off.push((await gpuSamples(p, 3)).gpuMs);
      await p.click(layer);
      await sleep(900);
      on.push((await gpuSamples(p, 3)).gpuMs);
    }
    res.layers[layer] = { on: round(median(on)), off: round(median(off)), cost: round(median(on) - median(off)) };
    console.log("layer", layer, JSON.stringify(res.layers[layer]));
  }
  res.shaders = shaders(JSON.parse((await p.ev("JSON.stringify(window.__gpuLog)")) ?? "null"));
  res.logs = p.logs.slice(0, 30);
  p.close();
  out.live = res;
  save();
}

// ---- live through each era's medium: cost per era at T3, T2 and on WebGL2 ----
for (const [name, query] of [
  ["see", "?tier=3&see=1"],
  ["t2", "?tier=2&see=1"],
  ["gl", "?tier=1&gl=1&see=1"],
]) {
  if (!want(name)) continue;
  const p = await open(query);
  const res = { query, upMs: p.upMs, info: await p.ev(`JSON.stringify(${stage("info")})`), eras: {} };
  for (const era of ERAS) {
    await toEra(p, era, true);
    await sleep(3000);
    res.eras[era] = { ...(await gpuSamples(p)), pupilMm: round(await p.ev(stage("pupilMm()"))) };
    console.log(name, era, JSON.stringify(res.eras[era]));
  }
  res.shaders = shaders(JSON.parse((await p.ev("JSON.stringify(window.__gpuLog)")) ?? "null"));
  res.logs = p.logs.slice(0, 30);
  p.close();
  out[name] = res;
  save();
}

// ---- the page's share of the iris, at rest (reduced motion: the gaze and pupil hold) ----
if (want("share")) {
  const p = await open("?tier=3&reduce=1");
  const res = { query: "?tier=3&reduce=1", eras: {} };
  await p.click("spec");
  for (const era of ERAS) {
    await toEra(p, era, false);
    await sleep(1500);
    const iris = JSON.parse(await p.ev(`JSON.stringify(${stage("irisAt()")})`));
    const file = await p.shot(`share/${era}.png`);
    res.eras[era] = { pageShare: round(await pageShare(file, iris)), pupilMm: round(await p.ev(stage("pupilMm()"))), iris };
    console.log("share", era, JSON.stringify(res.eras[era]));
  }
  res.shaders = shaders(JSON.parse((await p.ev("JSON.stringify(window.__gpuLog)")) ?? "null"));
  p.close();
  out.share = res;
  save();
}

// ---- shots: clean poses, and each medium at rest and half shut (reduced motion: still) ----
async function poseShots(name, query, poses, see) {
  const p = await open(query);
  await p.click("Hold gaze");
  const files = {};
  for (const era of ERAS) {
    await toEra(p, era, see);
    await sleep(see ? 1500 : 900);
    for (const pose of poses) {
      await p.slider("gaze x", pose.gaze[0]);
      await p.slider("gaze y", pose.gaze[1]);
      if (pose.blink !== undefined) {
        await p.click("Hold lids");
        await p.slider("blink", pose.blink);
      }
      await sleep(900);
      files[`${era}/${pose.name}`] = await p.shot(`${name}/${era}-${pose.name}.png`);
      if (pose.blink !== undefined) await p.click("Hold lids");
    }
    console.log(name, era);
  }
  out[name] = { query, upMs: p.upMs, logs: p.logs.slice(0, 30) };
  p.close();
  save();
  return files;
}

async function sheet(files, cols, file, tile = [288, 180]) {
  const keys = Object.keys(files);
  const rows = Math.ceil(keys.length / cols);
  const comps = [];
  for (let i = 0; i < keys.length; i++) {
    const img = await sharp(files[keys[i]]).resize(tile[0], tile[1]).png().toBuffer();
    const left = (i % cols) * tile[0];
    const top = Math.floor(i / cols) * (tile[1] + 18);
    comps.push({ input: img, left, top: top + 18 });
    const label = Buffer.from(`<svg width="${tile[0]}" height="18"><text x="4" y="13" font-family="monospace" font-size="12" fill="#ddd">${keys[i]}</text></svg>`);
    comps.push({ input: label, left, top });
  }
  await sharp({ create: { width: cols * tile[0], height: rows * (tile[1] + 18), channels: 3, background: "#0b0b0d" } })
    .composite(comps)
    .png()
    .toFile(join(outDir, file));
}

if (want("poses")) await sheet(await poseShots("poses", "?tier=3&reduce=1", POSES, false), POSES.length, "sheet-poses.png");
if (want("seeposes"))
  await sheet(await poseShots("seeposes", "?tier=3&reduce=1&see=1", [POSES[0], POSES[5]], true), 4, "sheet-media.png");
if (want("live")) {
  const files = Object.fromEntries(ERAS.map((e) => [e, join(outDir, "align", `${e}.png`)]));
  await sheet(files, 5, "sheet-align.png", [432, 270]);
}

// ---- the reflection per era: as built, ~60 % of the iris, and the key interface
// framed at the device's aspect; through each era's medium, desktop and phone.
// Writes reflect/<era>-<variant>-<desktop|phone>.png and sheet-reflect-<batch>.png.
if (want("reflect")) {
  // the page's share of the iris after R1 (docs/EYE_REALISM_PLAN.md), so ~60 % is a size, not a guess
  const SHARE = { 1970: 0.45, 1981: 0.67, 1991: 0.6, 1995: 0.49, 1997: 0.63, 2000: 0.58, 2003: 0.68, 2009: 0.59, 2013: 0.76, 2026: 0.71 };
  const variants = (era, key) => [
    { name: "built", hold: null },
    { name: "60", hold: { scale: +Math.sqrt(0.6 / SHARE[era]).toFixed(3) } },
    { name: "key", hold: { frame: key[era] } },
  ];
  const crops = {};
  for (const [dev, vp, cw, ch] of [
    ["desktop", { w: W, h: H, dpr: 1, mobile: false }, 700, 460],
    ["phone", { w: 390, h: 844, dpr: 2, mobile: true }, 360, 250],
  ]) {
    const p = await open("?tier=3&reduce=1&see=1", vp);
    const key = JSON.parse((await p.ev("JSON.stringify(window.__eyeReflectKey ?? null)")) ?? "null");
    for (const era of ERAS) {
      await toEra(p, era, true);
      await sleep(1800);
      for (const v of variants(era, key)) {
        await p.ev(`${stage("holdReflection")}(${JSON.stringify(v.hold)})`);
        await sleep(1100);
        const file = await p.shot(`reflect/${era}-${v.name}-${dev}.png`);
        const iris = JSON.parse(await p.ev(`JSON.stringify(${stage("irisAt()")})`));
        crops[`${era}/${v.name}/${dev}`] = { file, iris, dpr: vp.dpr, cw, ch };
      }
      await p.ev(`${stage("holdReflection")}(null)`);
      console.log("reflect", dev, era);
    }
    out[`reflect-${dev}`] = { logs: p.logs.slice(0, 30) };
    p.close();
  }
  // one sheet per batch of three eras: desktop as built, ~60 %, key; then the phone's
  const tile = [420, 276];
  const label = (v) => (v === "60" ? "~60%" : v === "key" ? "key interface" : "as built");
  for (const [b, eras] of [
    [1, ["1970", "1981", "1991"]],
    [2, ["1995", "1997", "2000"]],
    [3, ["2003", "2009", "2013"]],
    [4, ["2026"]],
  ]) {
    const files = {};
    for (const era of eras)
      for (const dev of ["desktop", "phone"])
        for (const v of ["built", "60", "key"]) {
          const c = crops[`${era}/${v}/${dev}`];
          if (!c) continue;
          const m = await sharp(c.file).metadata();
          const w = Math.round(c.cw * c.dpr);
          const hh = Math.round(c.ch * c.dpr);
          const left = Math.max(0, Math.min(m.width - w, Math.round(c.iris.x * c.dpr - w / 2)));
          const top = Math.max(0, Math.min(m.height - hh, Math.round(c.iris.y * c.dpr - hh / 2)));
          const crop = join(outDir, "reflect", `crop-${era}-${v}-${dev}.png`);
          await sharp(c.file).extract({ left, top, width: w, height: hh }).png().toFile(crop);
          files[`${era} · ${dev} · ${label(v)}`] = crop;
        }
    await sheet(files, 6, `sheet-reflect-${b}.png`, tile);
  }
}

// ---- R2, the iris relief, with the iris filling the frame (?box=iris): each era
// as the iris and in clay, the lab's iris views, a pupil sweep, side views,
// shimmer, its cost at T3 and T2 and at the loader's framing, T1 on WebGL2, and
// every era through its medium. Writes iris/*.png, sheet-iris-*.png and the
// numbers under out.iris.
if (want("iris")) {
  // through the panel: the lab re-applies it every second, over any direct uniform write
  const IRIS_VIEWS = ["iris", "clay", "occlusion", "steps", "layers"];
  const mode = async (p, r2, view) => {
    void r2; // (R2 is the only iris since its sign-off; the argument stays for the shot names)
    await p.click(`iris·${IRIS_VIEWS[view]}`);
    await sleep(450);
  };
  /** A crop at 2×: the collarette and the ciliary zone, right of the pupil. */
  const crop2x = async (file, name, iris, dpr = 1) => {
    const m = await sharp(file).metadata();
    const w = Math.round(iris.r * 0.75 * dpr);
    const h = Math.round(iris.r * 0.5 * dpr);
    const left = Math.max(0, Math.min(m.width - w, Math.round((iris.x + iris.r * 0.62) * dpr - w / 2)));
    const top = Math.max(0, Math.min(m.height - h, Math.round(iris.y * dpr - h / 2)));
    const outFile = join(outDir, "iris", `crop-${name}.png`);
    await sharp(file).extract({ left, top, width: w, height: h }).resize(w * 2, h * 2, { kernel: "nearest" }).png().toFile(outFile);
    return outFile;
  };
  const parts = (process.env.IRIS_PARTS ?? "looks,t2,t1,media").split(",");
  const res = out.iris ?? {};
  const keep = () => {
    out.iris = res;
    save();
  };
  /** The iris on screen; waits out a remount (another editor's hot reload drops the stage). */
  const irisOf = async (p, era, see) => {
    for (let i = 0; i < 120; i++) {
      const v = await p.ev(`JSON.stringify(window.__eyeLab?.current?.irisAt?.() ?? null)`);
      const o = v ? JSON.parse(v) : null;
      if (o) return o;
      await sleep(500);
      if (i === 40) await toEra(p, era, see);
    }
    throw new Error("the stage never came back");
  };
  const looks = {};
  const crops = {};
  const views = {};
  if (parts.includes("looks")) {
    const p = await open("?tier=3&reduce=1&box=iris");
    await p.click("Hold gaze");
    let iris = null;
    for (const era of ERAS) {
      await toEra(p, era, false);
      await sleep(1600);
      iris = await irisOf(p, era, false);
      for (const [k, r2, v] of [
        ["r2", 1, 0],
        ["clay", 1, 1],
      ]) {
        await mode(p, r2, v);
        const f = await p.shot(`iris/${era}-${k}.png`);
        looks[`${era} · ${k}`] = f;
        if (["1970", "1991", "2003", "2013", "2026"].includes(era)) crops[`${era} · ${k}`] = await crop2x(f, `${era}-${k}`, iris);
      }
      console.log("iris", era);
    }
    // the debug views and the pupil, at 1991 (the smallest pupil: the most iris)
    await toEra(p, "1991", false);
    await sleep(1500);
    for (const [k, v] of [
      ["clay", 1],
      ["occlusion", 2],
      ["steps", 3],
      ["layers", 4],
    ]) {
      await mode(p, 1, v);
      views[`1991 · ${k}`] = await p.shot(`iris/view-${k}.png`);
    }
    await mode(p, 1, 0);
    await p.click("Hold pupil");
    for (const pu of [0.2, 0.34, 0.6, 0.85]) {
      await p.slider("pupil", pu);
      for (const [k, r2] of [
        ["r2", 1],
      ]) {
        await mode(p, r2, 0);
        await sleep(500);
        views[`pupil ${pu} · ${k}`] = await p.shot(`iris/pupil-${pu}-${k}.png`);
      }
    }
    await p.slider("pupil", 0.34);
    // the view from the side: R2's depth shifts under the threads
    for (const [g, x] of [
      ["left", -0.8],
      ["right", 0.8],
    ]) {
      await p.slider("gaze x", x);
      for (const [k, r2] of [
        ["r2", 1],
      ]) {
        await mode(p, r2, 0);
        await sleep(700);
        const f = await p.shot(`iris/gaze-${g}-${k}.png`);
        const at = JSON.parse(await p.ev(`JSON.stringify(${stage("irisAt()")})`));
        views[`gaze ${g} · ${k}`] = await crop2x(f, `gaze-${g}-${k}`, at);
      }
    }
    await p.slider("gaze x", 0);
    // shimmer: nothing in the iris may change at rest (lens off: its grain steps at 12 Hz)
    await p.click("Era lens");
    await mode(p, 1, 0);
    await sleep(1500);
    iris = await irisOf(p, "1991", false);
    const diff = async (f1, f2) => {
      const A = await sharp(f1).removeAlpha().raw().toBuffer({ resolveWithObject: true });
      const B = await sharp(f2).removeAlpha().raw().toBuffer();
      let n = 0;
      let sum = 0;
      let big = 0;
      const r = iris.r * 0.95;
      for (let y = Math.floor(iris.y - r); y < iris.y + r; y++)
        for (let x = Math.floor(iris.x - r); x < iris.x + r; x++) {
          if ((x - iris.x) ** 2 + (y - iris.y) ** 2 > r * r || x < 0 || y < 0 || x >= A.info.width || y >= A.info.height) continue;
          const i = (y * A.info.width + x) * 3;
          const d = Math.max(Math.abs(A.data[i] - B[i]), Math.abs(A.data[i + 1] - B[i + 1]), Math.abs(A.data[i + 2] - B[i + 2]));
          sum += d;
          n++;
          if (d > 8) big++;
        }
      return { meanDiff: round(sum / n, 3), over8: round(big / n, 5) };
    };
    res.shimmer = {};
    for (const [k, r2] of [
      ["r2", 1],
    ]) {
      await mode(p, r2, 0);
      await sleep(1200);
      const a = await p.shot(`iris/rest-${k}-a.png`);
      await sleep(1600);
      const b = await p.shot(`iris/rest-${k}-b.png`);
      res.shimmer[k] = await diff(a, b);
    }
    await p.click("Era lens");
    // the cost, A/B in one page with the iris filling the frame (runs drift ±25 % apart)
    res.gpuT3 = [];
    for (let k = 0; k < 3; k++)
      for (const r2 of [1]) {
        await mode(p, r2, 0);
        res.gpuT3.push({ r2, ...(await gpuSamples(p, 6)) });
      }
    res.sceneT3 = { 0: [], 1: [] };
    for (let k = 0; k < 3; k++)
      for (const r2 of [1]) {
        await mode(p, r2, 0);
        await sleep(800);
        const xs = [];
        for (let i = 0; i < 6; i++) {
          await sleep(560);
          const ps = JSON.parse((await p.ev(`JSON.stringify(${stage("stats.passes")})`)) ?? "[]");
          const sc = ps.find((x) => x.label.startsWith("Scene"));
          if (sc) xs.push(sc.ms);
        }
        res.sceneT3[r2].push(round(median(xs)));
      }
    res.passesT3 = {};
    for (const r2 of [1]) {
      await mode(p, r2, 0);
      await sleep(2000);
      res.passesT3[r2] = JSON.parse((await p.ev(`JSON.stringify(${stage("stats.passes")})`)) ?? "null");
    }
    // what an era change's bake costs: its passes show once, inside one
    // half-second reading (a mean over its frames, so × the frames in it)
    res.bake = {};
    for (const era of ["2003", "1991"]) {
      await p.click(era);
      for (let i = 0; i < 16; i++) {
        await sleep(150);
        const s = JSON.parse((await p.ev(`JSON.stringify({ passes: ${stage("stats.passes")}, fps: ${stage("stats.fps")} })`)) ?? "{}");
        for (const x of s.passes ?? [])
          if (x.label.startsWith("IrisBake")) res.bake[x.label] = Math.max(res.bake[x.label] ?? 0, round(x.ms * Math.max(1, (s.fps ?? 0) * 0.5), 2));
      }
    }
    res.shadersT3 = shaders(JSON.parse((await p.ev("JSON.stringify(window.__gpuLog)")) ?? "null"));
    res.logsT3 = p.logs.slice(0, 30);
    p.close();
    keep();
  }
  // T2: the march's middle tier, A/B
  if (parts.includes("t2")) {
    const p = await open("?tier=2&reduce=1&box=iris");
    await p.click("Hold gaze");
    await toEra(p, "1991", false);
    await sleep(1500);
    res.gpuT2 = [];
    for (let k = 0; k < 3; k++)
      for (const r2 of [1]) {
        await mode(p, r2, 0);
        res.gpuT2.push({ r2, ...(await gpuSamples(p, 6)) });
      }
    views["T2 · r2"] = await p.shot("iris/t2-r2.png");
    res.logsT2 = p.logs.slice(0, 30);
    p.close();
    keep();
  }
  // T1 on WebGL2: the single parallax step on the two layers
  if (parts.includes("t1")) {
    const p = await open("?tier=1&gl=1&reduce=1&box=iris");
    await p.click("Hold gaze");
    await toEra(p, "1991", false);
    await sleep(1500);
    for (const [k, r2] of [
      ["r2", 1],
    ]) {
      await mode(p, r2, 0);
      views[`T1 WebGL2 · ${k}`] = await p.shot(`iris/t1gl-${k}.png`);
    }
    res.logsT1 = p.logs.slice(0, 30);
    p.close();
    keep();
  }
  // through each era's medium, at the loader's own framing, and on a phone
  const media = {};
  for (const [dev, vp] of parts.includes("media")
    ? [
        ["desktop", { w: W, h: H, dpr: 1, mobile: false }],
        ["phone", { w: 390, h: 844, dpr: 2, mobile: true }],
      ]
    : []) {
    const p = await open("?tier=3&reduce=1&see=1", vp);
    for (const era of ERAS) {
      await toEra(p, era, true);
      await sleep(1800);
      const iris = await irisOf(p, era, true);
      for (const [k, r2] of [
        ["r2", 1],
      ]) {
        await mode(p, r2, 0);
        await sleep(500);
        const f = await p.shot(`iris/media-${dev}-${era}-${k}.png`);
        const m = await sharp(f).metadata();
        const s = vp.dpr;
        const w = Math.round(Math.min(m.width, iris.r * 3.2 * s));
        const h = Math.round(Math.min(m.height, iris.r * 2.4 * s));
        const left = Math.max(0, Math.min(m.width - w, Math.round(iris.x * s - w / 2)));
        const top = Math.max(0, Math.min(m.height - h, Math.round(iris.y * s - h / 2)));
        const c = join(outDir, "iris", `media-crop-${dev}-${era}-${k}.png`);
        await sharp(f).extract({ left, top, width: w, height: h }).png().toFile(c);
        media[`${era} · ${dev} · ${k}`] = c;
      }
      console.log("iris media", dev, era);
    }
    // the cost at the loader's own framing, through 1991's medium: the scene pass, A/B
    if (dev === "desktop") {
      await toEra(p, "1991", true);
      await sleep(1500);
      res.sceneLoader = { 0: [], 1: [] };
      for (let k = 0; k < 3; k++)
        for (const r2 of [1]) {
          await mode(p, r2, 0);
          await sleep(800);
          const xs = [];
          for (let i = 0; i < 6; i++) {
            await sleep(560);
            const ps = JSON.parse((await p.ev(`JSON.stringify(${stage("stats.passes")})`)) ?? "[]");
            const sc = ps.find((x) => x.label.startsWith("Scene"));
            if (sc) xs.push(sc.ms);
          }
          res.sceneLoader[r2].push(round(median(xs)));
        }
    }
    res[`logs-${dev}`] = p.logs.slice(0, 30);
    p.close();
    keep();
  }
  keep();
  if (Object.keys(looks).length) await sheet(looks, 6, "sheet-iris-looks.png", [480, 300]);
  if (Object.keys(crops).length) await sheet(crops, 3, "sheet-iris-crops.png", [540, 360]);
  if (Object.keys(views).length) await sheet(views, 4, "sheet-iris-views.png", [480, 300]);
  for (const [b, eras] of [
    [1, ["1970", "1981", "1991"]],
    [2, ["1995", "1997", "2000"]],
    [3, ["2003", "2009", "2013"]],
    [4, ["2026"]],
  ]) {
    const files = {};
    for (const era of eras)
      for (const dev of ["desktop", "phone"])
        for (const k of ["r2"]) if (media[`${era} · ${dev} · ${k}`]) files[`${era} · ${dev} · ${k}`] = media[`${era} · ${dev} · ${k}`];
    if (Object.keys(files).length) await sheet(files, 4, `sheet-iris-media-${b}.png`, [420, 300]);
  }
}

save();
console.log(JSON.stringify(out, null, 2));
