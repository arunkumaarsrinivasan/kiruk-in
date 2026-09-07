/** kebab-case slug from arbitrary text (matches the loader's slug expectations). */
export function slugify(input) {
  return String(input)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * The .gitignore has broad secret globs (**\/*key*, *token*, *secret*,
 * *password*). A slug containing these words would be silently untracked.
 */
const SECRET_WORDS = /(secret|key|token|password)/i;
export function warnIfIgnoredSlug(slug) {
  if (SECRET_WORDS.test(slug)) {
    console.warn(
      `⚠  slug "${slug}" matches a .gitignore secret glob (*secret*/*key*/*token*/*password*) — ` +
        `git will ignore this file. Rename the slug or adjust .gitignore.`,
    );
  }
}
