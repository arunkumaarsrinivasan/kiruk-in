# Performance vs era identity

Kiruk.in is a time-travel portfolio. Speed matters. The eras, the loading room, the blinking logo, and the custom cursor **are** the product.

Law:

> Pause work that is not on screen. Do not strip era identity while it is on screen.

Owner constraint after a bad pass:

> Whatever we are trying to make, it should not break the existing part while making the changes in performance.

Agents: also load `.cursor/skills/kiruk-perf-identity/SKILL.md`. Generic UI speed advice lives in the `emil-performance` skill; this doc wins when the two conflict.

---

## Why this exists

A site-wide performance pass (Waves 1–6, 2026) cut real cost: one era homepage in the first JS graph instead of fifteen, About sky no longer `setState` every frame, Observatory stars sleep off-screen, unused Playpen off the CSSOM.

Two of those waves also deleted identity:

| Wave | Shortcut | What broke |
| --- | --- | --- |
| 1 | `next/dynamic` both loaders, `ssr: false`, no fallback; unmount children | Blank loading overlay. The animation never appeared. |
| 3 | Gate eye `Infinity` loops on `live`; unmount `CustomCursor` after 2.5s idle | Nav / picker eyes stopped blinking. Idle pointer had no cursor. |

`visibility: hidden` still runs JS. The right fix is to stop **background** work (the site under the overlay, the 14 other eras, off-screen RAF). The wrong fix is to stop **the thing the visitor is looking at**.

---

## What must stay alive

| Surface | Files | Alive means |
| --- | --- | --- |
| Returning-visit splash | `src/components/ui/interactive-loading-page.tsx`, `app-loader.tsx` | Full splash animation. Mode = theme already chosen and `kiruk-loading-seen` unset this session. |
| First-visit era picker | `src/components/ui/immersive-era-loading-page.tsx` | Room, era eyes, confirm. Mode = `portfolio-theme-selected` not `true`. |
| Custom cursor | `src/components/ui/CustomCursor.tsx` | Node stays mounted. Idle = scale ~0.7 / opacity ~0.35. Hidden only while `useChromeQuiet()`. |
| Logo / MiniEye blink | `src/components/brand/eyes/Eye*.tsx` | `looping = !reduce`. Idle gaze may rest. Phosphor blinks do not. |
| Current era homepage | `src/components/era-shell/registry.tsx` + that era's page | Character of the **visible** era stays. Other eras may be code-split. |
| Sketch handwriting | `src/app/layout.tsx` | Load `@fontsource/architects-daughter/latin-400.css` and `nothing-you-could-do/latin-400.css`. Canvas `measureText` uses those family names. Do not switch to `next/font` hashed names. |

---

## What you may pause or drop

- Site React tree while splash or picker is open (`AppLoader` unmounts `children` when `overlayOpen`).
- Unused era homepages via `next/dynamic` in the registry.
- rAF / Framer springs / CSS `animation-play-state` / SVG `pauseAnimations()` when off-screen, behind a fullscreen overlay, or `document.hidden`.
- Per-frame React state (About `useCelestialEngine`: write DOM from refs).
- `transition-all` and Tailwind bare `transition`.
- Seasoning `will-change` on cards that are not animating.
- Moving `filter: blur()` above 20px (glass `backdrop-filter` may stay).
- Fonts that no TSX references (Playpen was unused).

Quiet signal: `useChromeQuiet()` reads `document.hidden` and `<html>` attrs `data-era-picker-active`, `data-time-travel`, `data-module-open`. Time-travel FOUC lock: `data-era-swapping` from mid-swap until the overlay hides, including first picker confirm. Do not release it on a 120ms timer.

---

## Forbidden shortcuts

```ts
// BAD — blank splash
const InteractiveLoadingPage = dynamic(() => import('...'), { ssr: false });

// BAD — MiniEye dies in the nav
const looping = live && !reduce;

// BAD — cursor vanishes after idle
if (idle) return null;

// BAD — SketchInk measures the wrong face
const print = Architects_Daughter({ subsets: ['latin'] });
```

```ts
// GOOD — overlay chrome is static; background site may unmount
import InteractiveLoadingPage from '@/components/ui/interactive-loading-page';
{overlayOpen ? null : children}

// GOOD — blinks respect reduced motion only
const looping = !reduce;

// GOOD — idle is a visual, not an unmount
// custom cursor: scale 0.7, opacity 0.35; hide iff chromeQuiet
```

Do not add path allowlists that skip the splash. Do not drop `data-time-travel` when rewriting `TimeTravelOverlay`.

---

## Verify (required)

A still screenshot of Home is not verification. After any performance change that touches motion, loaders, cursor, eyes, fonts, or theme swap:

1. Incognito / cleared `localStorage`: era picker room, eyes blink, confirm enters the site.
2. New session, theme already saved: splash animation plays, then home.
3. Sit still on home: custom cursor remains (dimmer is fine).
4. Navbar / logo MiniEye still blinks.
5. Time travel: overlay runs; era tokens do not flash mid-swap.
6. `/notebook`: handwriting still looks like Architects Daughter / Nothing You Could Do.

If any of those died, revert the identity cut and pause a background loop instead.

---

## File map

| Concern | Where |
| --- | --- |
| Loader mode + overlay unmount | `src/components/ui/app-loader.tsx` |
| Shell flags / duration | `src/components/layout/LayoutClientShell.tsx` |
| Quiet hook | `src/hooks/useChromeQuiet.ts` |
| Travel + swap attrs | `src/components/layout/TimeTravelOverlay.tsx` |
| Token writes + swap lock | `src/contexts/ThemeContext.tsx` |
| Era code-split | `src/components/era-shell/registry.tsx` |
| About sky | `src/app/about/components/useCelestialEngine.ts` |
| Observatory pause | Observatory view + `observatory.css` |
| Split text canvas | `src/components/ui/SplitCharacter.tsx` |
| Sketch faces | `src/app/layout.tsx` |

---

## Related

- Skill: `.cursor/skills/kiruk-perf-identity/SKILL.md`
- Incident log: `.cursor/skills/kiruk-perf-identity/mistakes.md`
- Rules: `.cursor/rules/kiruk-perf-identity.mdc`, `kiruk-perf-hotspots.mdc`
- Generic speed patterns: `emil-performance` skill (do not apply it here without this overlay)
