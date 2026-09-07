import { mkdirSync, existsSync, writeFileSync, appendFileSync } from "node:fs";
import { dirname } from "node:path";

export function ensureDir(dir) {
  mkdirSync(dir, { recursive: true });
}

/** Write a new file; refuse to clobber an existing one. Always LF. */
export function writeNew(file, content) {
  if (existsSync(file)) {
    throw new Error(`refusing to overwrite existing file: ${file}`);
  }
  ensureDir(dirname(file));
  writeFileSync(file, content, "utf8");
}

/** Append a line to a file, creating it (with optional header) if absent. */
export function appendLine(file, line, header = "") {
  ensureDir(dirname(file));
  if (!existsSync(file) && header) {
    writeFileSync(file, `${header}\n`, "utf8");
  }
  appendFileSync(file, `${line}\n`, "utf8");
}

/** Read the first CLI argument (after `--`), or exit with usage. */
export function requireArg(usage) {
  const arg = process.argv.slice(2).join(" ").trim();
  if (!arg) {
    console.error(`usage: ${usage}`);
    process.exit(1);
  }
  return arg;
}
