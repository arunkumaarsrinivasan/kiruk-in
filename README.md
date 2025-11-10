## Overview

Personal portfolio built with Next.js App Router, Tailwind CSS, and Framer Motion. The project has been restructured around a `src` directory to better separate shared primitives from feature-specific modules.

## Project Layout

```
src/
	app/                   Next.js routes, API handlers, layouts
	assets/                Local fonts, images, and rich media
	components/            Shared UI and layout building blocks
	contexts/              React context providers
	data/                  Static data sets and content helpers
	hooks/                 Reusable React hooks
	lib/                   External service clients and utility helpers
	modules/               Feature-oriented modules (e.g., work, portfolio, vlogs)
	styles/                Global and feature styles
	types/                 Global TypeScript definitions
```

Feature areas such as Work, Portfolio, and Vlogs now live under `src/modules/<feature>` with co-located components, data, and barrel exports. Shared UI (buttons, sketch elements, layout shells) remains under `src/components` while business logic and integrations (Supabase, Arcjet) sit in `src/lib`.

## Commands

- `npm run dev` – start the Next.js dev server
- `npm run lint` – run ESLint over the full codebase
- `npm run build` – generate a production build
- `npm run start` – serve the production build locally

## Notable Modules

- `@/modules/work` – constellation skills visualization and involvement stories surfaced on `/work`
- `@/modules/portfolio` – draggable notebook, scribble workspace, and supporting types for the interactive portfolio landing experience
- `@/modules/vlogs` – gallery components highlighting Instagram timelines and vlog cards

Shared components (navigation, hero sections, themed layouts) continue to live under `@/components`, while data-fetching hooks and analytics helpers are consolidated in `@/hooks` and `@/lib` respectively.

## Data & Services

- Arcjet protection for APIs and forms: `@/lib/arcjet`
- Supabase admin utilities: `@/lib/supabase`
- Static portfolio metadata: `@/data/portfolio-data`

## Next Steps

- Continue migrating legacy components into feature modules
- Trim remaining lint warnings (notably `any` usage and `<img>` elements)
- Add integration tests around critical API routes (contact, analytics)
