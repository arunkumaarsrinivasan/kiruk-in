// Drives /lab/eye in headless Chrome through a list of shots and saves each.
// The in-app browser pane renders no frames while the session window is
// hidden; this is the reliable way to look at the lab. Needs the dev server.
//
// usage: node scripts/eye-lab-shots.mjs <chrome> <outDir> <url> <shots.json> [gpu|swiftshader] [WxH]
//   a width under 500 emulates a phone (exact viewport, touch); SHOT_EXACT=1 makes any size exact;
//   SHOT_DPR=<n> (with an exact size) sets the device pixel ratio
//
// shots.json: [{ "name": "1970-final", "clicks": ["1970", "final"], "wait": 1500, "keys": ["h"] }, ...]
//   clicks — button/label text, clicked in order (exact text match)
//   keys   — keys pressed on the window after the clicks (e.g. "h" hides the panel)
//   sliders — { "gaze x": 0.9 } sets the lab slider whose label starts with that text
//   mouse  — [x, y] moves the pointer there (CSS px) before the shot
//   eval   — JS expressions (promises are awaited) evaluated after the wait; results land in summary.json
//   samples — with eval: how many times to sample it, 16 ms apart (default 1)
//   wait   — ms to let the stage settle before the shot
// Writes <outDir>/<name>.png and <outDir>/summary.json (HUD + console errors).

import { spawn } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const [chrome, outDir, url, shotsFile, mode = "gpu", size = "1280x720"] = process.argv.slice(2);
const [W, H] = size.split("x").map(Number);
mkdirSync(outDir, { recursive: true });
const shots = JSON.parse(readFileSync(shotsFile, "utf8"));
const profile = mkdtempSync(join(outDir, "prof-"));
const port = 9500 + Math.floor(Math.random() * 400);
const proc = spawn(
  chrome,
  [
    "--headless=new",
    `--user-data-dir=${profile}`,
    `--remote-debugging-port=${port}`,
    `--window-size=${W},${H}`,
    "--enable-unsafe-webgpu",
    ...(mode === "swiftshader" ? ["--enable-unsafe-swiftshader", "--use-angle=swiftshader"] : ["--enable-gpu"]),
    "about:blank",
  ],
  { stdio: "ignore" },
);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let target;
for (let i = 0; i < 60 && !target; i++) {
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
  if (m.method === "Runtime.consoleAPICalled" && m.params.type === "error") {
    logs.push("error: " + m.params.args.map((a) => a.value ?? a.description ?? "").join(" ").slice(0, 600));
  }
  if (m.method === "Runtime.exceptionThrown") {
    logs.push("exception: " + (m.params.exceptionDetails.exception?.description ?? m.params.exceptionDetails.text).slice(0, 600));
  }
});
const send = (method, params = {}) =>
  new Promise((r) => {
    const i = ++id;
    pending.set(i, r);
    ws.send(JSON.stringify({ id: i, method, params }));
  });
const ev = async (expr) =>
  (await send("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true })).result?.result?.value;
const click = (text) =>
  ev(`(() => { const el = [...document.querySelectorAll('button,label')].find(b => b.textContent.trim() === ${JSON.stringify(text)} || b.title === ${JSON.stringify(text)}); if (!el) return 'missing'; el.click(); return 'ok'; })()`);
const key = (k) => ev(`window.dispatchEvent(new KeyboardEvent('keydown', { key: ${JSON.stringify(k)} }))`);
const hud = () =>
  ev(`[...document.querySelectorAll('aside section')].find(s => s.innerText.startsWith('FRAME'))?.innerText.replace(/\\n+/g,' | ')`);

await send("Page.enable");
await send("Runtime.enable");
// a phone size (or SHOT_EXACT=1) gets an exact viewport, and a phone gets touch
if (W < 500 || process.env.SHOT_EXACT === "1") {
  await send("Emulation.setDeviceMetricsOverride", { width: W, height: H, deviceScaleFactor: Number(process.env.SHOT_DPR ?? 1), mobile: W < 500 });
  if (W < 500) await send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 });
}
await send("Page.navigate", { url });
for (let i = 0; i < 100; i++) {
  await sleep(250);
  const h = await hud();
  if (h && h.includes("backend")) break;
}
const summary = { hudStart: await hud(), shots: [] };
for (const s of shots) {
  const missing = [];
  for (const c of s.clicks ?? []) if ((await click(c)) === "missing") missing.push(c);
  for (const [label, value] of Object.entries(s.sliders ?? {})) {
    await ev(`(() => { const l = [...document.querySelectorAll('label')].find(x => x.textContent.trim().startsWith(${JSON.stringify(label)})); const el = l?.querySelector('input[type=range]'); if (!el) return; Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(el, String(${JSON.stringify(value)})); el.dispatchEvent(new Event('input', { bubbles: true })); })()`);
  }
  if (s.mouse) {
    for (let i = 0; i < 6; i++) {
      await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: s.mouse[0] + i, y: s.mouse[1] });
      await sleep(60);
    }
  }
  for (const k of s.keys ?? []) await key(k);
  await sleep(s.wait ?? 1200);
  // Next's dev-tools badge is not part of the page
  await send("Runtime.evaluate", { expression: "document.querySelectorAll('nextjs-portal').forEach((e) => e.remove())" });
  const r = await send("Page.captureScreenshot", { format: "png" });
  writeFileSync(join(outDir, s.name + ".png"), Buffer.from(r.result.data, "base64"));
  for (const k of s.keys ?? []) await key(k); // toggles (like "h") go back
  const evals = [];
  for (const expr of s.eval ?? []) {
    const series = [];
    for (let i = 0; i < (s.samples ?? 1); i++) {
      series.push(await ev(`(async () => { try { return JSON.stringify(await (${expr})); } catch (e) { return String(e); } })()`));
      if ((s.samples ?? 1) > 1) await sleep(16);
    }
    evals.push({ expr, values: series });
  }
  summary.shots.push({ name: s.name, missing, hud: await hud(), evals });
}
summary.logs = logs.slice(0, 40);
writeFileSync(join(outDir, "summary.json"), JSON.stringify(summary, null, 2));
console.log(JSON.stringify(summary, null, 2));
ws.close();
proc.kill();
