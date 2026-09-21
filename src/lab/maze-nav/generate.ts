/**
 * generate(config) → { map, spawn, doors }
 *
 * Pure function of the config. Walls-as-cells ASCII like the old GameMenuOverlay:
 *   'W' wall · '.' floor · 'P' spawn · '1'..'5' doors.
 *
 * Three modes share a recursive-backtracker perfect maze, then diverge:
 *   quadrant — carve a central cross corridor, bias doors to the four corners.
 *   spaghetti — leave the perfect maze intact, spread doors across regions.
 *   braid     — knock down walls at dead ends to add loops (braidRate).
 *
 * Generation retries with a sub-seed until all five doors are reachable from
 * spawn; if every retry fails we force-carve corridors from spawn to each door
 * so a saved config is never a dead map.
 */

import { mulberry32, randInt, shuffle, type Rng } from "./prng";
import { DESTINATIONS, type MazeConfig, type MazeMode } from "./types";

export interface DoorPos {
  id: number;
  x: number;
  y: number;
}

export interface Maze {
  /** rows of single-char cells. */
  map: string[];
  spawn: { x: number; y: number };
  doors: DoorPos[];
}

const DIRS: ReadonlyArray<readonly [number, number]> = [
  [2, 0],
  [-2, 0],
  [0, 2],
  [0, -2],
];

function makeGrid(cols: number, rows: number): string[][] {
  return Array.from({ length: rows }, () => Array.from({ length: cols }, () => "W"));
}

/** Recursive backtracker on the odd-cell lattice. cols/rows must be odd. */
function perfectMaze(g: string[][], cols: number, rows: number, rng: Rng): void {
  const sx = 1;
  const sy = 1;
  g[sy][sx] = ".";
  const stack: Array<[number, number]> = [[sx, sy]];
  while (stack.length) {
    const [x, y] = stack[stack.length - 1];
    const dirs = shuffle([...DIRS], rng);
    let moved = false;
    for (const [dx, dy] of dirs) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx > 0 && nx < cols - 1 && ny > 0 && ny < rows - 1 && g[ny][nx] === "W") {
        g[ny][nx] = ".";
        g[y + dy / 2][x + dx / 2] = ".";
        stack.push([nx, ny]);
        moved = true;
        break;
      }
    }
    if (!moved) stack.pop();
  }
}

/** Carve a full cross corridor through the center — the quadrant signature. */
function carveCross(g: string[][], cols: number, rows: number): void {
  const cx = cols >> 1;
  const cy = rows >> 1;
  for (let x = 1; x < cols - 1; x++) g[cy][x] = ".";
  for (let y = 1; y < rows - 1; y++) g[y][cx] = ".";
}

/** Knock down walls at dead ends to create loops. */
function braid(g: string[][], cols: number, rows: number, rate: number, rng: Rng): void {
  for (let y = 1; y < rows - 1; y++) {
    for (let x = 1; x < cols - 1; x++) {
      if (g[y][x] !== ".") continue;
      // count floor neighbors
      let n = 0;
      const orth: Array<[number, number]> = [];
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx <= 0 || nx >= cols - 1 || ny <= 0 || ny >= rows - 1) continue;
        if (g[ny][nx] === ".") n++;
        else orth.push([nx, ny]);
      }
      if (n === 1 && orth.length && rng() < rate) {
        const [wx, wy] = orth[randInt(rng, orth.length)];
        g[wy][wx] = ".";
      }
    }
  }
}

function floorCells(g: string[][], cols: number, rows: number): Array<[number, number]> {
  const out: Array<[number, number]> = [];
  for (let y = 1; y < rows - 1; y++) {
    for (let x = 1; x < cols - 1; x++) {
      if (g[y][x] === ".") out.push([x, y]);
    }
  }
  return out;
}

/** Nearest floor cell to a target (Manhattan). */
function nearestFloor(g: string[][], cols: number, rows: number, tx: number, ty: number): [number, number] {
  let best: [number, number] = [1, 1];
  let bestD = Infinity;
  for (let y = 1; y < rows - 1; y++) {
    for (let x = 1; x < cols - 1; x++) {
      if (g[y][x] !== ".") continue;
      const d = Math.abs(x - tx) + Math.abs(y - ty);
      if (d < bestD) {
        bestD = d;
        best = [x, y];
      }
    }
  }
  return best;
}

function placeDoors(
  g: string[][],
  cols: number,
  rows: number,
  mode: MazeMode,
  rng: Rng,
): DoorPos[] {
  const cells = floorCells(g, cols, rows);
  const used = new Set<string>();
  const doors: DoorPos[] = [];

  const take = (x: number, y: number): boolean => {
    const key = `${x},${y}`;
    if (used.has(key) || g[y][x] !== ".") return false;
    used.add(key);
    return true;
  };

  if (mode === "quadrant") {
    // Four corners + one near the center cross.
    const targets: Array<[number, number]> = [
      [3, 3],
      [cols - 4, 3],
      [3, rows - 4],
      [cols - 4, rows - 4],
      [cols >> 1, rows >> 1],
    ];
    for (let i = 0; i < DESTINATIONS.length; i++) {
      const [tx, ty] = targets[i];
      let [x, y] = nearestFloor(g, cols, rows, tx, ty);
      // nudge to an unused cell if claimed
      let guard = 0;
      while (!take(x, y) && guard < 40) {
        const cand = cells[randInt(rng, cells.length)];
        x = cand[0];
        y = cand[1];
        guard++;
      }
      g[y][x] = String(i + 1);
      doors.push({ id: i + 1, x, y });
    }
    return doors;
  }

  // spaghetti / braid — divide into 5 vertical regions, one door each.
  for (let i = 0; i < DESTINATIONS.length; i++) {
    const band = Math.floor((i + 0.5) * (cols / DESTINATIONS.length));
    let x = Math.max(1, Math.min(cols - 2, band));
    let y = 1 + randInt(rng, rows - 2);
    // find nearest floor
    [x, y] = nearestFloor(g, cols, rows, x, y);
    let guard = 0;
    while (!take(x, y) && guard < 40) {
      const cand = cells[randInt(rng, cells.length)];
      x = cand[0];
      y = cand[1];
      guard++;
    }
    g[y][x] = String(i + 1);
    doors.push({ id: i + 1, x, y });
  }
  return doors;
}

function pickSpawn(
  g: string[][],
  cols: number,
  rows: number,
  bias: number,
  rng: Rng,
): { x: number; y: number } {
  if (bias <= 0) {
    // center, clamped to a floor cell
    const [x, y] = nearestFloor(g, cols, rows, cols >> 1, rows >> 1);
    return { x, y };
  }
  const cells = floorCells(g, cols, rows);
  if (!cells.length) return { x: 1, y: 1 };
  // bias > 0: pick a random floor cell, weighted toward center when bias is low.
  const cx = cols >> 1;
  const cy = rows >> 1;
  let best = cells[0];
  let bestScore = -Infinity;
  for (let i = 0; i < 8; i++) {
    const [x, y] = cells[randInt(rng, cells.length)];
    const dist = Math.abs(x - cx) + Math.abs(y - cy);
    // lower bias → prefer center; higher bias → accept farther cells
    const score = -dist + (rng() - 0.5) * bias * (cols + rows);
    if (score > bestScore) {
      bestScore = score;
      best = [x, y];
    }
  }
  return { x: best[0], y: best[1] };
}

/** BFS reachability from spawn over walkable cells. */
function reachable(
  g: string[][],
  cols: number,
  rows: number,
  spawn: { x: number; y: number },
  doors: DoorPos[],
): boolean {
  const walkable = (c: string) => c === "." || (c >= "1" && c <= "5") || c === "P";
  const seen = new Set<string>();
  const q: Array<[number, number]> = [[spawn.x, spawn.y]];
  seen.add(`${spawn.x},${spawn.y}`);
  while (q.length) {
    const [x, y] = q.shift()!;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue;
      const key = `${nx},${ny}`;
      if (seen.has(key)) continue;
      if (!walkable(g[ny][nx])) continue;
      seen.add(key);
      q.push([nx, ny]);
    }
  }
  return doors.every((d) => seen.has(`${d.x},${d.y}`));
}

/** Force-carve an L corridor from spawn to a door (fallback). */
function forceConnect(
  g: string[][],
  cols: number,
  rows: number,
  spawn: { x: number; y: number },
  doors: DoorPos[],
): void {
  for (const d of doors) {
    let x = spawn.x;
    let y = spawn.y;
    // carve horizontally then vertically
    while (x !== d.x) {
      if (g[y][x] === "W") g[y][x] = ".";
      x += x < d.x ? 1 : -1;
    }
    while (y !== d.y) {
      if (g[y][x] === "W") g[y][x] = ".";
      y += y < d.y ? 1 : -1;
    }
    // restore door glyph if overwritten
    g[d.y][d.x] = String(d.id);
  }
}

export function generate(cfg: MazeConfig): Maze {
  const cols = Math.max(5, cfg.cols | 1); // force odd
  const rows = Math.max(5, cfg.rows | 1);

  let last: Maze | null = null;
  for (let attempt = 0; attempt < 8; attempt++) {
    const rng = mulberry32(`${cfg.seed}:${cfg.mode}:${attempt}`);
    const g = makeGrid(cols, rows);
    perfectMaze(g, cols, rows, rng);
    if (cfg.mode === "quadrant") carveCross(g, cols, rows);
    if (cfg.mode === "braid") braid(g, cols, rows, cfg.braidRate, rng);
    const doors = placeDoors(g, cols, rows, cfg.mode, rng);
    const spawn = pickSpawn(g, cols, rows, cfg.spawnBias, rng);
    g[spawn.y][spawn.x] = "P";
    last = { map: g.map((r) => r.join("")), spawn, doors };
    if (reachable(g, cols, rows, spawn, doors)) return last;
  }

  // fallback: force-connect the last attempt
  if (!last) {
    const g = makeGrid(cols, rows);
    g[1][1] = "P";
    last = { map: g.map((r) => r.join("")), spawn: { x: 1, y: 1 }, doors: [] };
  }
  const g = last.map.map((r) => r.split(""));
  forceConnect(g, cols, rows, last.spawn, last.doors);
  g[last.spawn.y][last.spawn.x] = "P";
  for (const d of last.doors) g[d.y][d.x] = String(d.id);
  return { map: g.map((r) => r.join("")), spawn: last.spawn, doors: last.doors };
}

/** BFS shortest path from start to end over walkable cells. Empty if none. */
export function bfsPath(
  map: string[],
  start: { x: number; y: number },
  end: { x: number; y: number },
): Array<{ x: number; y: number }> {
  const rows = map.length;
  const cols = map[0]?.length ?? 0;
  const walkable = (c: string) => c === "." || (c >= "1" && c <= "5") || c === "P";
  const seen = new Set<string>();
  const prev = new Map<string, string | null>();
  const q: Array<[number, number]> = [[start.x, start.y]];
  seen.add(`${start.x},${start.y}`);
  prev.set(`${start.x},${start.y}`, null);
  while (q.length) {
    const [x, y] = q.shift()!;
    if (x === end.x && y === end.y) break;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue;
      const key = `${nx},${ny}`;
      if (seen.has(key)) continue;
      if (!walkable(map[ny][nx])) continue;
      seen.add(key);
      prev.set(key, `${x},${y}`);
      q.push([nx, ny]);
    }
  }
  const endKey = `${end.x},${end.y}`;
  if (!prev.has(endKey)) return [];
  const path: Array<{ x: number; y: number }> = [];
  let cur: string | null = endKey;
  while (cur) {
    const [cx, cy] = cur.split(",").map(Number);
    path.push({ x: cx, y: cy });
    cur = prev.get(cur) ?? null;
  }
  return path.reverse();
}
