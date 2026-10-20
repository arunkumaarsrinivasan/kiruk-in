// Captures each era's real home page for the loader eye's screen: what the
// visitor's monitor shows, mirrored in the cornea, thrown on the skin. The
// site is driven like a returning visitor (era chosen, loader seen), so what
// comes back is the page as it ships, navbar and all. Needs the dev server.
//
// usage: npm run eye:screens -- [chrome] [baseUrl] [eras,comma,separated]
//   chrome defaults to $CHROME, then Chrome's usual Windows path
//
// Writes public/eye/screens/<era>.webp: 768 px wide (the screen pass's own
// width; the viewport is 1280 × 720, scaled 0.6), up to three viewports tall,
// so the reflection can scroll the page. Re-run it when a home page changes.

import { spawn } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import sharp from "sharp";

const ERAS = ["1970", "1981", "1991", "1995", "1997", "2000", "2003", "2009", "2013", "2026"];
const [
  chrome = process.env.CHROME ?? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  base = "http://localhost:3031",
  only,
] = process.argv.slice(2);
const eras = only ? only.split(",") : ERAS;
const W = 1280;
const H = 720;
const SCALE = 0.6;
const MAX_VIEWPORTS = 3;
const SETTLE_MS = 7000;
const outDir = join(process.cwd(), "public", "eye", "screens");
mkdirSync(outDir, { recursive: true });

const profile = mkdtempSync(join(tmpdir(), "eye-screens-"));
const port = 9500 + Math.floor(Math.random() * 400);
const proc = spawn(
  chrome,
  [
    "--headless=new",
    `--user-data-dir=${profile}`,
    `--remote-debugging-port=${port}`,
    `--window-size=${W},${H}`,
    "--hide-scrollbars",
    "--enable-unsafe-webgpu",
    "--enable-gpu",
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
const errors = [];
ws.addEventListener("message", (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) {
    pending.get(m.id)(m);
    pending.delete(m.id);
  }
  if (m.method === "Runtime.exceptionThrown") errors.push(m.params.exceptionDetails?.text);
});
const send = (method, params = {}) =>
  new Promise((r) => {
    const i = ++id;
    pending.set(i, r);
    ws.send(JSON.stringify({ id: i, method, params }));
  });
const evaluate = async (expression) =>
  (await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true })).result?.result?.value;

await send("Page.enable");
await send("Runtime.enable");
await send("Emulation.setDeviceMetricsOverride", { width: W, height: H, deviceScaleFactor: 1, mobile: false });
// the visitor has chosen an era and seen the loader: straight to the page
await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "no-preference" }] });

for (const era of eras) {
  const setup = `
    localStorage.setItem("portfolio-theme", ${JSON.stringify(era)});
    localStorage.setItem("portfolio-theme-selected", "true");
    sessionStorage.setItem("kiruk-loading-seen", "true");`;
  const { result } = await send("Page.addScriptToEvaluateOnNewDocument", { source: setup });
  await send("Page.navigate", { url: `${base}/` });
  await sleep(SETTLE_MS);
  await send("Page.removeScriptToEvaluateOnNewDocument", { identifier: result.identifier });
  await evaluate("window.scrollTo(0, 0)");
  await sleep(300);
  const pageH = Math.max(H, Math.min((await evaluate("document.documentElement.scrollHeight")) ?? H, H * MAX_VIEWPORTS));
  const shot = await send("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: true,
    clip: { x: 0, y: 0, width: W, height: pageH, scale: SCALE },
  });
  const png = Buffer.from(shot.result.data, "base64");
  const out = join(outDir, `${era}.webp`);
  const info = await sharp(png).resize(Math.round(W * SCALE)).webp({ quality: 80 }).toFile(out);
  console.log(`${era}: ${info.width}×${info.height}, ${(info.size / 1024).toFixed(0)} KB`);
}

if (errors.length) console.log("page errors:", errors.slice(0, 5));
ws.close();
proc.kill();
await sleep(300);
try {
  rmSync(profile, { recursive: true, force: true });
} catch {}
