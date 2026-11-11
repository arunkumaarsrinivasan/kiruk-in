import "server-only";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { cache } from "react";
import { markdownToMdxText } from "./read/escape";

/**
 * The skills this site is built with, read straight from `.claude/skills/eye-*`
 * so the page and the file an agent reads are the same text. Only the
 * project's own skills are published; anything else in that folder is
 * someone else's and stays out.
 */

const DIR = join(process.cwd(), ".claude", "skills");
const OWN = /^eye-/;
const SAFE_NAME = /^eye-[a-z0-9-]+$/;
export const SKILLS_PATH = "/skills";

export interface Skill {
  name: string;
  /** The skill's own one-line job, from its description. */
  summary: string;
  description: string;
  /** The SKILL.md body, without its frontmatter. */
  body: string;
  href: string;
}

function read(name: string): Skill | undefined {
  const file = join(DIR, name, "SKILL.md");
  if (!existsSync(file)) return undefined;
  const raw = readFileSync(file, "utf8").replace(/\r\n/g, "\n");
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  const head = m?.[1] ?? "";
  const body = m?.[2] ?? raw;
  const description = (head.match(/^description:\s*"?(.*?)"?\s*$/m)?.[1] ?? "").replace(/\\"/g, '"');
  const summary = description.split(/(?<=[.:])\s/)[0].replace(/[.:]$/, "");
  return { name, summary, description, body, href: `${SKILLS_PATH}/${name}` };
}

/** Cached per request: the Read directory and every rail ask for the list. */
export const getSkills = cache(function getSkills(): Skill[] {
  if (!existsSync(DIR)) return [];
  const out = readdirSync(DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory() && OWN.test(d.name))
    .map((d) => read(d.name))
    .filter((s): s is Skill => Boolean(s));
  // the hub first, then the rest by name
  return out.sort((a, b) => Number(b.name === "eye-loader-system") - Number(a.name === "eye-loader-system") || a.name.localeCompare(b.name));
});

/** Only a plain folder name: no slashes or dots can walk out of `.claude/skills/eye-*`. */
export function getSkill(name: string): Skill | undefined {
  return SAFE_NAME.test(name) ? read(name) : undefined;
}

/**
 * A skill's Markdown made safe for MDX: outside code fences, braces and
 * angle brackets are text, not JSX. Links to sibling skills become site links.
 */
export function skillToMdx(body: string): string {
  return markdownToMdxText(body, (line) =>
    line
      .replace(/\]\((?:\.\.\/)?(eye-[a-z-]+)(?:\/SKILL\.md)?\)/g, `](${SKILLS_PATH}/$1)`)
      .replace(/\]\((?!https?:|\/|#)[^)]*\)/g, "](#)"),
  );
}
