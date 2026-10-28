---
name: eye-share-card
description: "Keep the site's link-preview card (og:image / twitter:image) in step with the loader eye's eras. The card is the eye cut into one vertical band per era, baked from the wide posters by scripts/og-card.tsx into public/og/share.jpg. Load at the end of ANY era work (an era added, removed, reordered or redesigned, a medium or look change, posters or home-page screens recaptured) and whenever link previews, OG tags, the share card, or the name/role on it change. Triggers on: share card, link preview, og:image, opengraph, twitter card, social preview, unfurl, WhatsApp/Discord/X preview, og:card, SHARE_IMAGE, posters recaptured, new era, era removed, era reorder."
---

# Share card: the eye's eras, one band each

Shared links show one picture of the concept: the same eye seen through every era's screen, left to right in `ERA_MEDIA` order, with the user's name, role and `kiruk.in`. It's cut from the loader's real posters, so it's only as current as they are.

## The pipeline
```
ERA_MEDIA (src/components/three/eye/post/era-medium.ts)     era list and order, parsed as text
public/eye/posters/<era>-wide.avif (1600×900)               one per era (eye-light-optics → Posters)
      │  scripts/og-card.tsx: scale to 1200 wide, crop 630, cut band i from poster i
      ▼
Satori card (next/og): years along the top, name + role bottom-left, kiruk.in bottom-right
      │  PNG → sharp JPEG q84 4:4:4
      ▼
public/og/share.jpg  +  scripts/og-card.stamp.json (eras, poster hashes, script hash)
      │
SHARE_IMAGE (src/lib/site.ts) → `images` on every `openGraph` → Next copies it to twitter
```
Notebook posts bake their own card (`src/app/notebook/[slug]/opengraph-image.tsx`) and are out of scope here.

## When eras change: the loop (do it, don't ask)
1. **Check:** `npm run og:card -- --check`. Exit 1 means the eras, a poster or the script changed since the last bake. Run it at the end of every era change, even one that "only touched the shader": a medium change means recaptured posters.
2. **Posters first.** The bake fails, naming the era, if an era in `ERA_MEDIA` has no `<era>-wide.avif`. Capture posters (eye-light-optics) only once the user has signed the era's look off. Until then, say the card is stale. Never bake a card from posters the user hasn't approved.
3. **Bake:** `npm run og:card`.
4. **Look once** (one Read of `public/og/share.jpg`; see lean-iteration rules). Judge it against the bar below.
5. **Tune the knobs, rebake,** at most two rounds. Then report what changed, with the image.
6. **Update this skill** with any new knob value, failure or gotcha you hit, in the same change. That's how this skill improves.

Run the loop without asking: it keeps the card true to eras the user already approved. **A change to the composition** (layout, text, typeface, what the card shows) is a design change. Propose it and wait for sign-off.

## The bar
- Every band reads as its own era at thumbnail size (about 400 px wide in a chat app). A band that's only flat skin with no texture fails.
- The middle bands cross the iris, and the cornea's page is visible in at least two of them.
- The brow is in frame across the top. Text never covers the pupil.
- Name, role and years stay legible over every band, the brightest included (1981 dots, 2013 tiles).
- 1200×630, JPEG, under 300 KB (WhatsApp drops big previews; it's about 150 KB today).

## Knobs (all in scripts/og-card.tsx)
| Knob | Now | Use when |
|---|---|---|
| `TOP` | 30 | Eye too high or low. Raise it to move the eye up and leave room under the lid for text. |
| `ZOOM[era]` | 1970: 1.1 | An era's frame carries a bezel or margin (1970 CRT), so its band shows glass, not face. |
| global zoom | 1 (none) | Avoid it. Above 1, more bands cross the eye but the brow leaves the frame (tried 1.14: rejected). |
| `GAP` | 2 px | Seams vanish or shout. |
| bottom gradient | 0.92 → 0.62 → 0, 300 px | Text unreadable over a bright band. |
| year label size | 15 px, spacing 3 | With more than ~14 eras the bands get under 90 px: drop to 13 px and spacing 2. |

With more eras the bands get narrower automatically (`BAND = 1200 / ERAS.length`). Past about 16, the bands stop reading. Propose a different composition instead, such as two rows or only the signed-off eras.

## Gotchas that already cost a broken preview
- **Satori fails silently.** A `<div>` with more than one child and no `display: flex` throws while the image is streaming. The route still answers 200 `image/png` with **0 bytes**, and every platform shows no card. This took the live site's previews down. Always open the baked file.
- Satori can't read **variable fonts** (`Cannot read properties of undefined (reading '256')`), AVIF or WebP. Static Stack Sans instances live in `src/assets/fonts/og/`, made with fontTools (command in the script header). Posters are decoded by sharp, never by Satori.
- **A child `openGraph` replaces the parent's, image included.** A file-convention `opengraph-image` only covers its own segment. Any new layout or page that sets `openGraph` must add `images: [SHARE_IMAGE]`, or that page loses its preview.
- `kiruk.in` 308s to `www.kiruk.in`. `metadataBase` makes the image URL absolute on `www`, which is right.
- Platforms cache cards by URL. After a deploy, re-scrape with Facebook's Sharing Debugger (also refreshes WhatsApp). For Discord or X, share with `?v=N` to see the new card at once.

## Verify (after deploy, or on the dev server)
```bash
curl -sS -A "Discordbot/2.0" https://www.kiruk.in/work | grep -o '<meta[^>]*\(og:image"\|twitter:image"\|twitter:card\)[^>]*>'
```
```bash
curl -sS -o /dev/null -w "%{http_code} %{content_type} %{size_download}\n" -A "WhatsApp/2.23" https://www.kiruk.in/og/share.jpg
```
Expect `summary_large_image`, an absolute `https://www.kiruk.in/og/share.jpg`, and `200 image/jpeg` with a non-zero size. Check every route that sets `openGraph`.
