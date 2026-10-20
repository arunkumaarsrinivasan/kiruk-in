// Real-time headless check of the loader: poster first, live eye crossfades in.
// Logs when the poster, the canvas and the live eye (wrapper opacity 1) arrive,
// then saves a screenshot. Uses SwiftShader, so timings are a software-GPU floor.
// The in-app browser pane renders no frames while the session window is hidden;
// this is the reliable check. Needs the dev server running.
// usage: node scripts/eye-loader-check.mjs <chromePath> <outDir> <url> [width] [height] [waitMs]
//   e.g. node scripts/eye-loader-check.mjs "C:\Program Files\Google\Chrome\Application\chrome.exe" %TEMP% http://localhost:3031/?eye=tsl
import { spawn } from "node:child_process";
import { writeFileSync, mkdtempSync } from "node:fs";
import { join } from "node:path";

const [chrome, outDir, url, w = "1280", h = "800", waitMs = "12000"] = process.argv.slice(2);
const profile = mkdtempSync(join(outDir, "cdp-prof-"));
const port = 9300 + Math.floor(Math.random() * 500);
const proc = spawn(chrome, [
  "--headless=new",
  "--enable-unsafe-swiftshader",
  "--use-angle=swiftshader",
  `--user-data-dir=${profile}`,
  `--remote-debugging-port=${port}`,
  `--window-size=${w},${h}`,
  "about:blank",
], { stdio: "ignore" });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let target;
for (let i = 0; i < 50 && !target; i++) {
  await sleep(200);
  try {
    const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
    target = list.find((t) => t.type === "page");
  } catch {}
}
if (!target) { console.log("no target"); proc.kill(); process.exit(1); }

const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener("open", r));
let id = 0;
const pending = new Map();
ws.addEventListener("message", (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
});
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const evaluate = async (expr) => (await send("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true })).result?.result?.value;

await send("Page.enable");
await send("Runtime.enable");
await send("Page.navigate", { url });

const probe = `(() => {
  const c = document.querySelector('canvas');
  const wrap = c?.parentElement?.parentElement?.parentElement;
  const img = document.querySelector('img[src*="/eye/posters/"]');
  return JSON.stringify({ canvas: c ? c.width + 'x' + c.height : null, opacity: wrap?.style.opacity ?? null, poster: !!img });
})()`;

const t0 = Date.now();
let last = "";
const log = [];
while (Date.now() - t0 < Number(waitMs)) {
  const v = await evaluate(probe);
  if (v !== last) { log.push(`${Date.now() - t0}ms ${v}`); last = v; }
  await sleep(150);
}
console.log(log.join("\n"));
const shot = await send("Page.captureScreenshot", { format: "png" });
writeFileSync(join(outDir, `cdp-${w}x${h}.png`), Buffer.from(shot.result.data, "base64"));
ws.close();
proc.kill();
