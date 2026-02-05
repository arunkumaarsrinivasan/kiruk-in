[![zread](https://img.shields.io/badge/Ask_Zread-_.svg?style=flat&color=00b0aa&labelColor=000000&logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTQuOTYxNTYgMS42MDAxSDIuMjQxNTZDMS44ODgxIDEuNjAwMSAxLjYwMTU2IDEuODg2NjQgMS42MDE1NiAyLjI0MDFWNC45NjAxQzEuNjAxNTYgNS4zMTM1NiAxLjg4ODEgNS42MDAxIDIuMjQxNTYgNS42MDAxSDQuOTYxNTZDNS4zMTUwMiA1LjYwMDEgNS42MDE1NiA1LjMxMzU2IDUuNjAxNTYgNC45NjAxVjIuMjQwMUM1LjYwMTU2IDEuODg2NjQgNS4zMTUwMiAxLjYwMDEgNC45NjE1NiAxLjYwMDFaIiBmaWxsPSIjZmZmIi8%2BCjxwYXRoIGQ9Ik00Ljk2MTU2IDEwLjM5OTlIMi4yNDE1NkMxLjg4ODEgMTAuMzk5OSAxLjYwMTU2IDEwLjY4NjQgMS42MDE1NiAxMS4wMzk5VjEzLjc1OTlDMS42MDE1NiAxNC4xMTM0IDEuODg4MSAxNC4zOTk5IDIuMjQxNTYgMTQuMzk5OUg0Ljk2MTU2QzUuMzE1MDIgMTQuMzk5OSA1LjYwMTU2IDE0LjExMzQgNS42MDE1NiAxMy43NTk5VjExLjAzOTlDNS42MDE1NiAxMC42ODY0IDUuMzE1MDIgMTAuMzk5OSA0Ljk2MTU2IDEwLjM5OTlaIiBmaWxsPSIjZmZmIi8%2BCjxwYXRoIGQ9Ik0xMy43NTg0IDEuNjAwMUgxMS4wMzg0QzEwLjY4NSAxLjYwMDEgMTAuMzk4NCAxLjg4NjY0IDEwLjM5ODQgMi4yNDAxVjQuOTYwMUMxMC4zOTg0IDUuMzEzNTYgMTAuNjg1IDUuNjAwMSAxMS4wMzg0IDUuNjAwMUgxMy43NTg0QzE0LjExMTkgNS42MDAxIDE0LjM5ODQgNS4zMTM1NiAxNC4zOTg0IDQuOTYwMVYyLjI0MDFDMTQuMzk4NCAxLjg4NjY0IDE0LjExMTkgMS42MDAxIDEzLjc1ODQgMS42MDAxWiIgZmlsbD0iI2ZmZiIvPgo8cGF0aCBkPSJNNCAxMkwxMiA0TDQgMTJaIiBmaWxsPSIjZmZmIi8%2BCjxwYXRoIGQ9Ik00IDEyTDEyIDQiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgo8L3N2Zz4K&logoColor=ffffff)](https://zread.ai/arunkumaarsrinivasan/kiruk-in)

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
