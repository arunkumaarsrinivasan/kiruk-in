import { writeFileSync, mkdirSync, readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { DEFAULT_CONFIG, type MazeConfig } from "@/lab/maze-nav/types";

/**
 * Dev-only save for the maze-nav lab.
 *   GET  /api/lab/save      → list saved configs as JSON
 *   POST /api/lab/save      → write the posted config to src/lab/maze-nav/saved/
 *
 * Nothing in production imports from this route. It exists so "saving is
 * shipping the decision" — the saved JSON is what harvest reads later.
 */
export const runtime = "nodejs";

const SAVED_DIR = join(process.cwd(), "src", "lab", "maze-nav", "saved");

function isDev(): boolean {
  return process.env.NODE_ENV !== "production";
}

function safeSeed(s: unknown): string | null {
  if (typeof s !== "string" || !/^[a-z0-9-]{1,40}$/i.test(s)) return null;
  return s;
}

function readAll(): MazeConfig[] {
  if (!existsSync(SAVED_DIR)) return [];
  return readdirSync(SAVED_DIR)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .map((f) => {
      try {
        return JSON.parse(readFileSync(join(SAVED_DIR, f), "utf8")) as MazeConfig;
      } catch {
        return null;
      }
    })
    .filter((x): x is MazeConfig => Boolean(x));
}

export async function GET(): Promise<Response> {
  return Response.json({ configs: readAll() });
}

export async function POST(req: Request): Promise<Response> {
  if (!isDev()) {
    return Response.json({ error: "lab save is dev-only" }, { status: 403 });
  }
  const body = (await req.json().catch(() => null)) as Partial<MazeConfig> | null;
  if (!body || typeof body !== "object") {
    return Response.json({ error: "config object required" }, { status: 400 });
  }
  const seed = safeSeed(body.seed);
  if (!seed) {
    return Response.json({ error: "valid seed required" }, { status: 400 });
  }
  const config: MazeConfig = { ...DEFAULT_CONFIG, ...body, seed };
  mkdirSync(SAVED_DIR, { recursive: true });
  const path = join(SAVED_DIR, `${seed}.json`);
  writeFileSync(path, JSON.stringify(config, null, 2) + "\n", "utf8");
  return Response.json({ ok: true, path, seed });
}
