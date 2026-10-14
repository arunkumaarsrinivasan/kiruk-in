/**
 * Templated questions, generated from the graph so they grow with the data:
 * every project, role, trek, book and technology asked the ways people ask.
 * Seeded, so the set is the same on every run. About one in five uses a
 * one-letter typo in the name.
 */

import { getGraph, STOP_LINK, type Entity } from "../graph";
import type { MessyCase } from "./messy";

function rng(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

export function templated(): MessyCase[] {
  const g = getGraph();
  const r = rng(42);
  const pick = <T>(xs: T[]) => xs[Math.floor(r() * xs.length)];
  /** A name visitors would type: one of its strong aliases, sometimes with a typo. */
  // Only names that point at exactly this thing (an ambiguous name has no single right answer).
  const names = (e: Entity) => e.aliases.filter((a) => a.length >= 2 && !/^\d/.test(a) && !STOP_LINK.has(a) && (g.alias.get(a)?.length ?? 0) === 1);
  const nameOf = (e: Entity, typo = true) => {
    const options = names(e);
    let n = pick(options.length ? options : [e.name.toLowerCase()]);
    if (typo && r() < 0.2) {
      // drop one inner letter of a word of 5+ letters
      const ws = n.split(" ");
      const wi = ws.findIndex((w) => w.length >= 5);
      if (wi >= 0) {
        const w = ws[wi];
        const i = 1 + Math.floor(r() * (w.length - 2));
        ws[wi] = w.slice(0, i) + w.slice(i + 1);
        n = ws.join(" ");
      }
    }
    return n;
  };
  const out: MessyCase[] = [];
  const kind = (k: Parameters<typeof g.byKind.get>[0]) => g.byKind.get(k) ?? [];

  for (const p of kind("project")) {
    const n = () => nameOf(p);
    out.push([`tell me about ${n()}`, "describe", p.id]);
    out.push([`what is ${n()}`, "describe", p.id]);
    out.push([`${n()}`, "describe", p.id]);
    if (p.fields.stack) out.push([pick([`what tech stack did you use for ${n()}`, `what was ${n()} built with`, `stack for ${n()}`]), "facet", p.id]);
    if (p.fields.challenges) out.push([pick([`what was hard about ${n()}`, `challenges in ${n()}`, `biggest challenge on ${n()}`]), "facet", p.id]);
    if (p.fields.learnings) out.push([pick([`what did you learn from ${n()}`, `lessons from ${n()}`]), "facet", p.id]);
    if (p.fields.features) out.push([pick([`features of ${n()}`, `what are the features of ${n()}`]), "facet", p.id]);
    if (p.fields.role) out.push([pick([`what was your role in ${n()}`, `your role on ${n()}`]), "facet", p.id]);
    if (p.fields.when) out.push([pick([`when did you work on ${n()}`, `how long did ${n()} take`]), "facet", p.id]);
    if (p.fields.impact) out.push([`what was the impact of ${n()}`, "facet", p.id]);
  }

  for (const e of kind("role")) {
    const n = () => pick(names(e).filter((a) => !a.includes(",")));
    out.push([pick([`what did you do at ${n()}`, `your responsibilities at ${n()}`]), "facet", e.id]);
    out.push([pick([`when did you join ${n()}`, `how long were you at ${n()}`]), "facet", e.id]);
    if (e.fields.wins) out.push([`achievements at ${n()}`, "facet", e.id]);
    out.push([`tell me about your time at ${n()}`, "describe", e.id]);
  }

  for (const t of kind("trek")) {
    const n = () => nameOf(t);
    out.push([`${n()} trek`, "describe", t.id]);
    out.push([pick([`how high is ${n()}`, `elevation of ${n()}`]), "facet", t.id]);
    out.push([pick([`how far is the ${n()} trek`, `distance of ${n()}`]), "facet", t.id]);
  }

  for (const b of kind("book")) out.push([`who wrote ${nameOf(b)}`, "facet", b.id]);
  for (const gm of kind("game")) out.push([`${nameOf(gm)} game`, "describe", gm.id]);

  // technologies used by at least one project
  for (const t of kind("tech").filter((t) => t.rel.some((x) => x.startsWith("project:")) && names(t).length)) {
    const n = names(t)[0];
    out.push([pick([`which projects used ${n}`, `projects with ${n}`, `what did you build with ${n}`]), "list", t.id]);
    out.push([`how many projects used ${n}`, "count", t.id]);
  }

  // compare pairs of the same kind
  const projects = kind("project");
  const roles = kind("role");
  for (let i = 0; i < 14; i++) {
    const a = pick(projects);
    const b = pick(projects.filter((x) => x !== a));
    const an = nameOf(a, false);
    const bn = nameOf(b, false);
    out.push([pick([`${an} vs ${bn}`, `compare ${an} and ${bn}`]), "compare", `${a.id}|${b.id}`]);
  }
  for (let i = 0; i < 6; i++) {
    const a = pick(roles);
    const b = pick(roles.filter((x) => x !== a));
    const an = names(a).find((x) => !x.includes(","))!;
    const bn = names(b).find((x) => !x.includes(","))!;
    out.push([`${an} vs ${bn}`, "compare", `${a.id}|${b.id}`]);
  }

  // lists, counts, years
  const kindQs: [string, string][] = [
    ["show me your projects", "kind:project"],
    ["list your treks", "kind:trek"],
    ["what games do you play", "kind:game"],
    ["places you have visited", "kind:place"],
    ["what are your skills", "kind:skill"],
    ["what books are you reading", "kind:book"],
    ["companies you have worked at", "kind:role"],
  ];
  for (const [q, ref] of kindQs) out.push([q, "list", ref]);
  for (const k of ["projects", "treks", "places", "games", "books", "skills"]) out.push([`how many ${k}`, "count", `kind:${k === "places" ? "place" : k.slice(0, -1)}`]);
  for (const y of [2021, 2022, 2023, 2024, 2025, 2026]) {
    out.push([`what did you do in ${y}`, "timeline", ""]);
    out.push([`projects from ${y}`, "list", "kind:project"]);
  }
  for (const c of ["ai", "mobile", "web"]) out.push([`show me your ${c} projects`, "list", "kind:project"]);
  out.push(["highest trek you have done", "list", "kind:trek"]);
  out.push(["longest treks", "list", "kind:trek"]);

  return out;
}
