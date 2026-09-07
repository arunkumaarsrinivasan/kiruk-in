/**
 * Frontmatter parser — a tiny, owned YAML-subset reader.
 *
 * We do NOT pull a YAML dependency: our frontmatter is intentionally flat and
 * predictable (scalars, inline arrays, and block lists). Hand-rolling keeps the
 * setup dependency-light and is plenty for content authoring. Anything fancier
 * than the grammar below is a content error worth surfacing, not silently
 * coercing.
 *
 * Supported grammar (between the leading/trailing `---` fences):
 *   key: scalar                 → string | number | boolean
 *   key: [a, b, c]              → string[]
 *   key:                        → string[]  (block list)
 *     - a
 *     - b
 *   # comment lines and blank lines are ignored
 *   "quoted scalars" preserve their literal text (colons, brackets, #).
 */

export interface ParsedFrontmatter {
  data: Record<string, unknown>;
  /** Source with the frontmatter block removed (leading newline trimmed). */
  body: string;
}

const FENCE = /^---\s*$/;

/** Split a raw file into its frontmatter block and body. */
export function parseFrontmatter(raw: string): ParsedFrontmatter {
  const normalized = raw.replace(/\r\n/g, "\n");
  const lines = normalized.split("\n");

  // Frontmatter must be the very first non-empty content.
  if (!FENCE.test(lines[0] ?? "")) {
    return { data: {}, body: normalized };
  }

  let end = -1;
  for (let i = 1; i < lines.length; i++) {
    if (FENCE.test(lines[i])) {
      end = i;
      break;
    }
  }
  if (end === -1) {
    // Unterminated frontmatter is a content error — fail loud rather than
    // silently returning empty data (which would surface as a confusing
    // "missing title" downstream). The loader prefixes this with the path.
    throw new Error("unterminated frontmatter — missing closing '---' fence");
  }

  const block = lines.slice(1, end);
  const body = lines.slice(end + 1).join("\n").replace(/^\n+/, "");
  return { data: parseBlock(block), body };
}

function parseBlock(block: string[]): Record<string, unknown> {
  const data: Record<string, unknown> = {};

  for (let i = 0; i < block.length; i++) {
    const line = block[i];
    if (!line.trim() || line.trim().startsWith("#")) continue;

    // Block-list items are consumed by their owning key below; a stray "- x"
    // at top level is ignored.
    if (/^\s*-\s+/.test(line)) continue;

    const colon = line.indexOf(":");
    if (colon === -1) continue;

    const key = line.slice(0, colon).trim();
    const rest = line.slice(colon + 1).trim();

    if (rest === "") {
      // Nested map: indented `key: value` lines under this key.
      const nested: Record<string, unknown> = {};
      let j = i + 1;
      let sawNested = false;
      while (j < block.length) {
        const child = block[j];
        if (!child.trim() || child.trim().startsWith("#")) {
          j++;
          continue;
        }
        // Block list under this key.
        if (/^\s+-\s+/.test(child)) break;
        const nestMatch = child.match(/^(\s+)([A-Za-z0-9_-]+)\s*:\s*(.*)$/);
        if (!nestMatch || nestMatch[1].length < 2) break;
        nested[nestMatch[2]] = coerceValue(nestMatch[3].trim());
        sawNested = true;
        j++;
      }
      if (sawNested) {
        data[key] = nested;
        i = j - 1;
        continue;
      }
      // Possible block list on the following indented "- " lines.
      const items: string[] = [];
      j = i + 1;
      while (j < block.length && /^\s*-\s+/.test(block[j])) {
        items.push(coerceScalar(block[j].replace(/^\s*-\s+/, "").trim()) as string);
        j++;
      }
      data[key] = items;
      i = j - 1;
      continue;
    }

    data[key] = coerceValue(rest);
  }

  return data;
}

function coerceValue(value: string): unknown {
  // Inline array: [a, b, c]
  if (value.startsWith("[") && value.endsWith("]")) {
    const inner = value.slice(1, -1).trim();
    if (!inner) return [];
    return splitTopLevel(inner).map((v) => coerceScalar(v.trim()));
  }
  return coerceScalar(value);
}

/** Split on commas that are not inside quotes. */
function splitTopLevel(input: string): string[] {
  const out: string[] = [];
  let cur = "";
  let quote: '"' | "'" | null = null;
  for (const ch of input) {
    if (quote) {
      if (ch === quote) quote = null;
      else cur += ch;
    } else if (ch === '"' || ch === "'") {
      quote = ch;
    } else if (ch === ",") {
      out.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  if (cur.trim()) out.push(cur);
  return out;
}

function coerceScalar(value: string): unknown {
  // Quoted → literal string (strip the quotes).
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  if (value === "true") return true;
  if (value === "false") return false;
  if (value !== "" && !Number.isNaN(Number(value)) && /^-?\d/.test(value)) {
    return Number(value);
  }
  return value;
}
