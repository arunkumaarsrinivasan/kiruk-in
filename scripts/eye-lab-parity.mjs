// Drives /lab/eye in headless Chrome: for each era, the TSL screen view, the
// GLSL reference on top, and their difference. Writes PNGs + a JSON summary.
// P1 gate: the TSL screen pass against the live GLSL one. Needs the dev server.
// usage: node scripts/eye-lab-parity.mjs <chrome> <outDir> <url> <mode: gpu|swiftshader> [forceWebGL 0|1]
//   e.g. node scripts/eye-lab-parity.mjs "C:\Program Files\Google\Chrome\Application\chrome.exe" %TEMP% http://localhost:3031/lab/eye gpu 0
// Then measure <outDir>/parity-*/<era>-diff.png: anything not black is a mismatch.
import { spawn } from "node:child_process";
import { writeFileSync, mkdtempSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const [chrome, outDir, url, mode = "gpu", forceGL = "0"] = process.argv.slice(2);
const profile = mkdtempSync(join(outDir, "lab-prof-"));
const shots = join(outDir, `parity-${mode}${forceGL === "1" ? "-gl" : ""}`);
mkdirSync(shots, { recursive: true });
const port = 9800 + Math.floor(Math.random() * 150);
const flags = [
  "--headless=new",
  `--user-data-dir=${profile}`,
  `--remote-debugging-port=${port}`,
  "--window-size=1280,720",
  "--enable-unsafe-webgpu",
  ...(mode === "swiftshader" ? ["--enable-unsafe-swiftshader", "--use-angle=swiftshader"] : ["--enable-gpu", "--use-angle=d3d11"]),
  "about:blank",
];
const proc = spawn(chrome, flags, { stdio: "ignore" });
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
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
  if (m.method === "Runtime.consoleAPICalled" && (m.params.type === "error" || m.params.type === "warning")) {
    logs.push(m.params.type + ": " + m.params.args.map((a) => a.value ?? a.description ?? "").join(" ").slice(0, 400));
  }
  if (m.method === "Runtime.exceptionThrown") logs.push("exception: " + (m.params.exceptionDetails.exception?.description ?? m.params.exceptionDetails.text).slice(0, 400));
});
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const ev = async (expr) => (await send("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true })).result?.result?.value;
const click = (text) => ev(`(() => { const el = [...document.querySelectorAll('button,label')].find(b => b.textContent.trim() === ${JSON.stringify(text)}); if (!el) return 'missing ${text}'; el.click(); return 'ok'; })()`);
const shot = async (name) => {
  const r = await send("Page.captureScreenshot", { format: "png", clip: { x: 0, y: 0, width: 960, height: 720, scale: 1 } });
  writeFileSync(join(shots, name + ".png"), Buffer.from(r.result.data, "base64"));
};
const hud = () => ev(`[...document.querySelectorAll('aside section')].find(s => s.innerText.startsWith('FRAME'))?.innerText.replace(/\\n+/g,' | ')`);

await send("Page.enable");
await send("Runtime.enable");
await send("Page.navigate", { url });
for (let i = 0; i < 80; i++) {
  await sleep(250);
  const h = await hud();
  if (h && h.includes("backend")) break;
}
const out = { hudStart: await hud() };
if (forceGL === "1") { await click("Force WebGL2 backend"); await sleep(2500); out.hudGL = await hud(); }
await click("Reduced motion");
await click("1×");
// the live GLSL screen has only the painted stand-in: compare like with like
await click("Real pages");
await sleep(500);

const eras = ["1970", "1981", "1991", "1995", "1997", "2000", "2003", "2009", "2013", "2026"];
for (const era of eras) {
  await click(era);
  await sleep(1800);
  await click("off");
  await click("screen");
  await sleep(600);
  await shot(`${era}-tsl`);
  await click("GLSL on top");
  await sleep(900);
  await shot(`${era}-glsl`);
  await click("difference");
  await sleep(700);
  await shot(`${era}-diff`);
  await click("off");
  await click("final");
  await sleep(500);
  await shot(`${era}-final`);
}
out.hudEnd = await hud();
out.logs = logs.slice(0, 40);
writeFileSync(join(shots, "summary.json"), JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 2));
ws.close();
proc.kill();
