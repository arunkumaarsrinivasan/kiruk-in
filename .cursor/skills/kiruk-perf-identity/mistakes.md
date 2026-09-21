# Performance passes that stripped identity

These happened on kiruk.in. Do not repeat them. Full write-up: [docs/PERF_IDENTITY.md](../../../docs/PERF_IDENTITY.md).

## Wave 1 — blank loading screen

**Intent:** Stop the full site from running under a `visibility: hidden` loader.

**What shipped:** `next/dynamic` both loader pages with `ssr: false` and no fallback; unmount children while the overlay is open.

**What the visitor saw:** Empty overlay. The animation lived in the dynamically imported chunk, which had nothing to show on first paint.

**Fix:** Static-import `InteractiveLoadingPage` and `ImmersiveEraLoadingPage`. Keep unmounting **site children** during the overlay, not the overlay itself. Restore `readLoaderMode()` (`portfolio-theme-selected` → picker, else `kiruk-loading-seen` → splash).

## Wave 3 — dead eyes, vanished cursor

**Intent:** Stop logo gaze springs and cursor springs while idle / overlay.

**What shipped:** `looping = live && !reduce` on era eyes; unmount `CustomCursor` after 2.5s idle.

**What the visitor saw:** Navbar MiniEye stopped blinking. Idle pointer had no cursor. Picker eyes felt dead.

**Fix:** `looping = !reduce` always. Gaze may rest when idle or `chromeQuiet`. Cursor stays mounted; idle variant is scale 0.7 / opacity 0.35; hide only when `useChromeQuiet()`.

## Related (cost cuts that are allowed)

- Era registry: `next/dynamic` per homepage so first JS is one era, not fifteen.
- About sky: rAF writes DOM refs; do not `setState` every frame.
- Observatory: pause CSS / SMIL / shooting stars off-screen or `document.hidden`.
- `SplitCharacter`: stop rAF off-screen; do not reset `canvas.width` every frame.
- Fonts: latin-400.css for the two sketch faces; do not load unused Playpen on the critical path.
- `data-era-swapping`: hold through time-travel reveal and first picker confirm, not 120ms.
