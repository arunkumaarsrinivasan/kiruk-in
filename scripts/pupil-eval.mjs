#!/usr/bin/env node
/**
 * Pupil eval: does the 2026 pupil understand questions, and does every line
 * it says trace back to the site's data?
 *
 *   npm run pupil:eval              all suites
 *   npm run pupil:eval -- --show    print every miss
 *   npm run pupil:eval -- --held    include the held-out messy split
 *
 * Suites
 *   messy      hand-written, frozen questions (src/lib/pupil/eval/messy.ts),
 *              60% dev / 40% held out, split by index
 *   templated  generated from the graph: entity × facet × alias, filters,
 *              compares, counts, years, with one-letter typos
 *   grounding  every text in every composed surface plucks back to its src
 *   chips      every chip / next-ask parses back to an answer
 *   count      distinct grounded answers (unique src lists)
 */

import { createRequire } from "node:module";
import path from "node:path";

const root = process.cwd().split(path.sep).join("/");
const require = createRequire(root + "/package.json");
const { createJiti } = require("jiti");
const jiti = createJiti(root + "/package.json", { alias: { "@": root + "/src" } });

const args = new Set(process.argv.slice(2));
const SHOW = args.has("--show");
const HELD = args.has("--held");

const { parse } = await jiti.import(root + "/src/lib/pupil/parse.ts");
const { MESSY } = await jiti.import(root + "/src/lib/pupil/eval/messy.ts");
const { MESSY2, FOLLOWUPS } = await jiti.import(root + "/src/lib/pupil/eval/messy2.ts");
const { templated } = await jiti.import(root + "/src/lib/pupil/eval/templated.ts");
let engine = null;
try {
  engine = await jiti.import(root + "/src/lib/pupil/engine.ts");
} catch (e) {
  if (!String(e?.message).includes("Cannot find")) throw e;
}

/** Parse intents as the eval names them. */
const AS = { story: "describe", about: "describe", search: "unknown" };
const intentOf = (p) => AS[p.intent] ?? p.intent;

function refOf(p) {
  if (p.intent === "compare") return p.entities.map((e) => e.id);
  if (p.intent === "list" || p.intent === "count") return [p.filters.tech?.id ?? `kind:${p.filters.kind}`];
  return p.entities[0] ? [p.entities[0].id] : [];
}

function judge(q, want, wantRef, alsoSafe = [], prev) {
  const p = parse(q, prev);
  const got = intentOf(p);
  const refs = refOf(p);
  const refOk =
    !wantRef ||
    (wantRef.includes("|") ? wantRef.split("|").every((r) => refs.includes(r)) : refs[0] === wantRef || (got === "list" && refs.includes(wantRef)));
  const exact = got === want && refOk;
  const decline = got === "decline" || got === "unknown";
  const safe = exact || (alsoSafe.includes(got) && (refOk || !wantRef)) || (want === "decline" && decline) || (want === "unknown" && decline);
  return { q, want, wantRef, got, refs, exact, safe };
}

function report(name, rows, { exactMin, safeMin }) {
  const exact = rows.filter((r) => r.exact).length;
  const safe = rows.filter((r) => r.safe).length;
  const pe = (100 * exact) / rows.length;
  const ps = (100 * safe) / rows.length;
  const pass = pe >= exactMin && (safeMin === undefined || ps >= safeMin);
  console.log(`${pass ? "PASS" : "FAIL"}  ${name.padEnd(18)} exact ${exact}/${rows.length} (${pe.toFixed(1)}%)  safe ${safe}/${rows.length} (${ps.toFixed(1)}%)   needs exact ≥${exactMin}%${safeMin ? `, safe ≥${safeMin}%` : ""}`);
  if (SHOW) for (const r of rows.filter((r) => !r.exact)) console.log(`      ${r.safe ? "~" : "✗"} ${JSON.stringify(r.q)} want ${r.want} ${r.wantRef || ""} got ${r.got} ${r.refs.join("|")}`);
  return pass;
}

let ok = true;

const dev = [];
const held = [];
MESSY.forEach((c, i) => (i % 5 < 3 ? dev : held).push(c));
ok = report("messy · dev", dev.map((c) => judge(...c)), { exactMin: 85, safeMin: 97 }) && ok;
if (HELD) ok = report("messy · held-out", held.map((c) => judge(...c)), { exactMin: 85, safeMin: 97 }) && ok;

// Round 2 (third person, judging, yes/no, firsts/lasts): same 60/40 split.
const dev2 = [];
const held2 = [];
MESSY2.forEach((c, i) => (i % 5 < 3 ? dev2 : held2).push(c));
ok = report("messy2 · dev", dev2.map((c) => judge(...c)), { exactMin: 85, safeMin: 97 }) && ok;
if (HELD) ok = report("messy2 · held-out", held2.map((c) => judge(...c)), { exactMin: 85, safeMin: 97 }) && ok;

if (engine) {
  const rows = FOLLOWUPS.map(([first, q, want, ref]) => {
    const s = engine.ask(first);
    const entity = s.ref?.startsWith("describe:") ? s.ref.slice(9) : undefined;
    return judge(q, want, ref, [], { exists: true, entity });
  });
  ok = report("follow-ups", rows, { exactMin: 85 }) && ok;
}

const tcases = templated();
ok = report("templated", tcases.map((c) => judge(...c)), { exactMin: 97 }) && ok;

if (engine) {
  const r = engine.selfCheck([...MESSY.map((c) => c[0]), ...MESSY2.map((c) => c[0]), ...tcases.map((c) => c[0])]);
  const gpass = r.violations.length === 0 && r.denied.length === 0;
  console.log(`${gpass ? "PASS" : "FAIL"}  grounding          ${r.texts} texts checked, ${r.violations.length} src violations, ${r.denied.length} deny-list hits`);
  if (SHOW || !gpass) for (const v of [...r.violations, ...r.denied].slice(0, 30)) console.log("      ✗ " + v);
  const cpass = r.chipMisses.length === 0;
  console.log(`${cpass ? "PASS" : "FAIL"}  chips              ${r.chips} chips round-tripped, ${r.chipMisses.length} lead nowhere`);
  if (SHOW || !cpass) for (const v of r.chipMisses.slice(0, 30)) console.log("      ✗ " + v);
  // The starter chips on the home must land where they say.
  const starters = [
    ["Show me your work", "list"],
    ["Is he good?", "evaluate"],
    ["How do I reach you?", "contact"],
  ];
  const sMiss = starters.filter(([q, intent]) => {
    const s = engine.ask(q);
    return s.intent !== intent || s.title.src.startsWith("curated-q:");
  });
  const spass = sMiss.length === 0;
  console.log(`${spass ? "PASS" : "FAIL"}  starters           ${starters.length - sMiss.length}/${starters.length} land on their intent`);
  for (const [q] of sMiss) console.log("      ✗ " + q + " → " + engine.ask(q).intent + " " + engine.ask(q).title.src);
  ok = ok && spass;
  const n = engine.countDistinct();
  const npass = n >= 1000;
  console.log(`${npass ? "PASS" : "FAIL"}  count              ${n} distinct grounded answers (needs ≥1000)`);
  ok = ok && gpass && cpass && npass;
} else {
  console.log("SKIP  grounding / chips / count  (engine.ts not built yet)");
}

process.exit(ok ? 0 : 1);
