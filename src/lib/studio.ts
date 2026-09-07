/**
 * Studio gate. The notebook author surface (`/studio`) and its write APIs
 * mutate the repo, so they exist only in development, or when
 * `ALLOW_STUDIO=1` is explicitly set. In production they 404.
 */
export function studioEnabled(): boolean {
  return process.env.NODE_ENV !== "production" || process.env.ALLOW_STUDIO === "1";
}
