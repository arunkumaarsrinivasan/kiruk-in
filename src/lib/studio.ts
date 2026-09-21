/**
 * Desk gate. The handwritten author desk (`/desk`) and its write APIs
 * mutate the repo, so they exist only in development, or when
 * `ALLOW_BLOGISM=1` / `ALLOW_STUDIO=1` is explicitly set. In production they 404.
 *
 * `/api/studio/*` stays the internal write surface.
 */
export function deskEnabled(): boolean {
  return (
    process.env.NODE_ENV !== "production" ||
    process.env.ALLOW_BLOGISM === "1" ||
    process.env.ALLOW_STUDIO === "1"
  );
}

/** @deprecated Use deskEnabled */
export function blogismEnabled(): boolean {
  return deskEnabled();
}

/** Alias for write APIs that still live under `/api/studio`. */
export function studioEnabled(): boolean {
  return deskEnabled();
}
