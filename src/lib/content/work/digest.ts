import "server-only";
import type { WorkCaseDigest } from "@/components/modules/work-os/types";
import { getWorkCases } from "./index";

/**
 * The cases as plain data. A case's MDX body is a handful of leaf tags
 * (components/work-showcase/mdx.tsx); this reads their attributes and text so
 * a desktop that draws its own screen, like the 1970 tube, can show the same
 * numbers without rendering the MDX.
 */

const TAG = /<(Shot|Lead|Trend|Spans|Stat|Meter|Iteration|Facts)\b([^>]*?)(?:\/>|>([\s\S]*?)<\/\1>)/g;
const ATTR = /([A-Za-z][\w-]*)(?:="([^"]*)")?/g;

function attrs(raw: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const m of raw.matchAll(ATTR)) out[m[1]] = m[2] ?? "true";
  return out;
}

const clean = (s: string | undefined) => (s ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
const list = (s: string | undefined) => (s ?? "").split(",").map((v) => v.trim()).filter(Boolean);

export function getWorkCaseDigests(): WorkCaseDigest[] {
  return getWorkCases().map((entry) => {
    const f = entry.frontmatter;
    const digest: WorkCaseDigest = {
      slug: entry.slug,
      title: f.title,
      project: f.project,
      also: f.also ?? [],
      pitch: f.pitch,
      role: f.role,
      when: f.when,
      nda: f.nda,
      headline: f.headline,
      links: f.links,
      shots: [],
      stats: [],
      meters: [],
      iterations: [],
    };

    for (const m of entry.body.matchAll(TAG)) {
      const a = attrs(m[2] ?? "");
      const text = clean(m[3]);
      switch (m[1]) {
        case "Shot":
          digest.shots.push({ title: a.title ?? "", note: text });
          break;
        case "Lead":
          digest.lead = { value: a.value ?? "", label: a.label ?? "" };
          break;
        case "Stat":
          digest.stats.push({ value: a.value ?? "", label: a.label ?? "", delta: a.delta });
          break;
        case "Meter":
          digest.meters.push({ value: Number(a.value) || 0, max: Number(a.max) || 100, label: a.label ?? "" });
          break;
        case "Trend":
          digest.trend = {
            label: a.label ?? "",
            values: list(a.values).map(Number),
            ticks: list(a.ticks),
            peak: a.peak,
            note: a.note,
          };
          break;
        case "Spans":
          digest.spans = {
            label: a.label ?? "",
            from: a.from ?? "",
            to: a.to ?? "",
            rows: (a.rows ?? "")
              .split(";")
              .map((row) => row.split("|").map((v) => v.trim()))
              .filter((row) => row.length === 3)
              .map(([name, from, to]) => ({ name, from, to })),
          };
          break;
        case "Iteration":
          digest.iterations.push({
            tag: a.tag ?? "",
            when: a.when ?? "",
            title: a.title ?? "",
            note: text,
            best: "best" in a,
          });
          break;
        case "Facts":
          digest.facts = { role: a.role ?? "", team: a.team, platform: a.platform, stack: a.stack, when: a.when };
          break;
        default:
      }
    }
    return digest;
  });
}
