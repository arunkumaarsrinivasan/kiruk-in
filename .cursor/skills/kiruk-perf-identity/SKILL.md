---
name: kiruk-perf-identity
description: >-
  Keep kiruk.in era identity intact while making the site faster. Pause work
  that is not on screen; never strip loader, picker, cursor, or eye motion that
  the visitor can see. Use when optimizing performance, FPS, lag, jank, bundle
  size, RAF, Framer Motion, R3F, will-change, blur, fonts, AppLoader, splash,
  era picker, CustomCursor, KirukEye, MiniEye, time travel, ThemeContext, era
  registry, Observatory, About sky, SplitCharacter, or when tempted to unmount,
  next/dynamic, or gate looping animations. Triggers on: performance, slow,
  stuck, freeze, loading screen, era picker, cursor disappeared, eye blink,
  phosphor, identity, pause off-screen, chromeQuiet, data-era-picker-active,
  data-time-travel, data-era-swapping.
---

# Kiruk: pause off-screen, keep identity

`emil-performance` is generic. This repo overlays a hard law on top of it.

**Pause work that is not on screen. Do not strip era identity while it is on screen.**

A faster site that lost the loading room, the idle cursor, or the blinking eye is a failed pass. Quote from the owner: *Whatever we are trying to make, it should not break the existing part while making the changes in performance.*

Read [docs/PERF_IDENTITY.md](../../../docs/PERF_IDENTITY.md) before cutting motion. Incident log: [mistakes.md](mistakes.md).

## Identity (must still move)

| Surface | What "alive" means |
| --- | --- |
| Splash | `InteractiveLoadingPage` plays on returning visits (`kiruk-loading-seen` unset this session, theme already chosen) |
| First-visit picker | `ImmersiveEraLoadingPage` room, era eyes, confirm. Driven by `portfolio-theme-selected` |
| Custom cursor | Stays mounted. Idle = smaller / dimmer, not gone. Hide only for `useChromeQuiet()` |
| KirukEye blink | `looping = !reduce` in every `Eye*.tsx`. Idle gaze and MiniEye in the nav still blink |
| Live era homepage | The **current** era's character (CRT, type, particles) while that era is on screen |
| SketchInk faces | CSS family names `Architects Daughter` and `Nothing You Could Do` (latin-400.css, not `next/font` hashed names) |

## Cost you may cut

- The other 14 era homepages (`next/dynamic` in `era-shell/registry.tsx`)
- RAF, springs, CSS loops, WebGL, SVG SMIL behind overlays, off-screen, or `document.hidden`
- Site tree under the splash/picker (`AppLoader` already unmounts children while the overlay is open)
- `transition-all` / bare `transition`, unused fonts, seasoning `will-change`, moving `filter: blur()` above 20px
- React state every frame (About celestial: DOM refs, not `setState`)

Quiet flags on `<html>`: `data-era-picker-active`, `data-time-travel`, `data-module-open`. Theme FOUC lock: `data-era-swapping` for the **whole** travel, not a 120ms timeout.

## Forbidden shortcuts

- `next/dynamic(..., { ssr: false })` the splash or picker with no fallback, then unmount children → blank overlay
- Path gates that skip splash (`allowSplash` / "this route doesn't need a loader")
- Unmount `CustomCursor` after an idle timer
- `looping = live && !reduce` (kills MiniEye / picker blinks)
- Pausing picker-eye loops because the pointer stopped
- Dropping `data-time-travel` / `data-era-picker-active` when rewriting overlays
- Replacing sketch font CSS with `next/font` (canvas `measureText` needs the real family name)

## Workflow

1. Name the motion you are about to change. If it is in the identity table, **pause something else**.
2. Prefer: unmount off-screen, `IntersectionObserver`, `document.hidden`, `useChromeQuiet`, code-split **other** eras.
3. Do not "fix" jank by deleting Infinity loops, loader pages, or the cursor node.
4. Browser-check before you call it done (incognito first visit, returning splash, idle cursor, nav blink, time travel, `/notebook` handwriting). A screenshot of the homepage is not enough.

## Hot files

`app-loader.tsx`, `interactive-loading-page.tsx`, `immersive-era-loading-page.tsx`, `CustomCursor.tsx`, `src/components/brand/eyes/*`, `era-shell/registry.tsx`, `useChromeQuiet.ts`, `ThemeContext.tsx`, `TimeTravelOverlay.tsx`, `LayoutClientShell.tsx`, `useCelestialEngine.ts`, Observatory sky CSS, `SplitCharacter.tsx`, `src/app/layout.tsx` font imports.
