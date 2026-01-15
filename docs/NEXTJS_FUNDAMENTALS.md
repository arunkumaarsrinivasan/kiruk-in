# 📚 Next.js Fundamentals for Kiruk Portfolio

> A practical guide to Next.js concepts as they apply to this portfolio

---

## 📋 Table of Contents

1. [What is Next.js?](#what-is-nextjs)
2. [App Router Explained](#app-router-explained)
3. [Server vs Client Components](#server-vs-client-components)
4. [Routing in This Project](#routing-in-this-project)
5. [Layouts and Templates](#layouts-and-templates)
6. [Data Fetching](#data-fetching)
7. [API Routes](#api-routes)
8. [Context & State Management](#context--state-management)
9. [Styling](#styling)
10. [Common Patterns Used](#common-patterns-used)

---

## What is Next.js?

**Next.js** is a React framework that adds:

- **Server-Side Rendering (SSR)** - Render pages on the server for better SEO
- **Static Site Generation (SSG)** - Pre-build pages at build time
- **File-Based Routing** - Folders = routes, no router config needed
- **API Routes** - Build backend endpoints alongside frontend
- **Optimizations** - Automatic code splitting, image optimization, etc.

### This Project Uses

- **Next.js 15** with the App Router
- **React 19** (Server Components by default)
- **TypeScript** for type safety
- **Tailwind CSS** for styling

---

## App Router Explained

The **App Router** (introduced in Next.js 13) uses the `src/app/` directory.

### Basic Rules

| File/Folder | Purpose |
|-------------|---------|
| `page.tsx` | The page component for that route |
| `layout.tsx` | Wraps all child routes (persists across navigation) |
| `loading.tsx` | Loading UI while page loads |
| `error.tsx` | Error boundary for that route |
| `not-found.tsx` | 404 page |
| `route.ts` | API endpoint |
| `[slug]/` | Dynamic route segment |

### Example: This Project's Routes

```
src/app/
├── page.tsx              → /
├── layout.tsx            → Root layout (wraps everything)
├── globals.css           → Global styles
│
├── about/
│   └── page.tsx          → /about
│
├── work/
│   ├── page.tsx          → /work
│   └── [slug]/
│       └── page.tsx      → /work/project-name
│
├── case-studies/
│   ├── page.tsx          → /case-studies
│   └── [slug]/
│       └── page.tsx      → /case-studies/project-name
│
├── contact/
│   └── page.tsx          → /contact
│
├── arcade/
│   └── page.tsx          → /arcade
│
└── api/
    ├── contact/
    │   └── route.ts      → POST /api/contact
    └── analytics/
        └── route.ts      → POST /api/analytics
```

---

## Server vs Client Components

### Server Components (Default)

By default, all components in `app/` are **Server Components**.

```tsx
// This is a Server Component (no 'use client')
export default function AboutPage() {
  // ✅ Can access server-only resources
  // ✅ Can use async/await directly
  // ❌ Cannot use useState, useEffect
  // ❌ Cannot use event handlers
  // ❌ Cannot access browser APIs
  
  return <div>About content</div>;
}
```

**Benefits:**
- Zero JavaScript sent to browser
- Can access databases directly
- Better SEO (fully rendered HTML)

### Client Components

Add `'use client'` directive to make a component run in the browser.

```tsx
'use client';  // ← This makes it a Client Component

import { useState, useEffect } from 'react';

export default function InteractiveWidget() {
  // ✅ Can use hooks
  // ✅ Can use event handlers
  // ✅ Can access browser APIs
  // ❌ Cannot use async component
  
  const [count, setCount] = useState(0);
  
  return (
    <button onClick={() => setCount(c => c + 1)}>
      Clicked {count} times
    </button>
  );
}
```

### In This Project

Most components are Client Components because they need:

- **ThemeContext** (user preferences)
- **GameModeContext** (game state)
- **Animations** (Framer Motion)
- **Event handlers** (games, navigation)

```tsx
// src/components/layout/LayoutClientShell.tsx
'use client';  // ← Needed for interactivity

import { useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';
// ...

export default function LayoutClientShell({ children }) {
  const [isGameActive, setIsGameActive] = useState(false);
  // ...
}
```

### The Pattern: Server Layout, Client Shell

```tsx
// layout.tsx (Server Component)
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ThemeProvider>         {/* Client Component */}
          <GameModeProvider>    {/* Client Component */}
            <ClientShell>       {/* Client Component */}
              {children}        {/* Page content */}
            </ClientShell>
          </GameModeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

---

## Routing in This Project

### Static Routes

```
src/app/about/page.tsx     → /about
src/app/work/page.tsx      → /work
src/app/contact/page.tsx   → /contact
```

### Dynamic Routes

The `[slug]` folder creates a dynamic segment:

```
src/app/work/[slug]/page.tsx → /work/anything-here
```

```tsx
// src/app/work/[slug]/page.tsx
interface Props {
  params: { slug: string };
}

export default function WorkPage({ params }: Props) {
  // params.slug = "my-project" for /work/my-project
  return <div>Project: {params.slug}</div>;
}
```

### Navigation

Use the `Link` component (not `<a>`):

```tsx
import Link from 'next/link';

function Navigation() {
  return (
    <nav>
      <Link href="/">Home</Link>
      <Link href="/about">About</Link>
      <Link href="/work/my-project">Project</Link>
    </nav>
  );
}
```

For programmatic navigation:

```tsx
'use client';
import { useRouter } from 'next/navigation';

function Button() {
  const router = useRouter();
  
  return (
    <button onClick={() => router.push('/about')}>
      Go to About
    </button>
  );
}
```

---

## Layouts and Templates

### Layout (Persists)

The `layout.tsx` wraps child routes and **preserves state** across navigation.

```tsx
// src/app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>       {/* State preserved! */}
          <GameModeProvider>  {/* State preserved! */}
            {children}
          </GameModeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

When you navigate from `/about` to `/work`:
- Layout does NOT re-mount
- Context state is preserved
- Only `{children}` changes

### Nested Layouts

You can have layouts at any level:

```
src/app/
├── layout.tsx          ← Root layout (all pages)
├── work/
│   ├── layout.tsx      ← Work section layout
│   └── page.tsx
```

---

## Data Fetching

### Server-Side (Recommended for SEO)

```tsx
// This runs on the server
async function getData() {
  const res = await fetch('https://api.example.com/data');
  return res.json();
}

export default async function Page() {
  const data = await getData();  // Runs on server!
  
  return <div>{data.title}</div>;
}
```

### Client-Side (For Dynamic Data)

```tsx
'use client';
import { useState, useEffect } from 'react';

export default function Page() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(setData);
  }, []);
  
  if (!data) return <div>Loading...</div>;
  return <div>{data.title}</div>;
}
```

### In This Project: Static Data

Most data is **static** (in TypeScript files), not fetched:

```tsx
// Import static data directly
import { portfolioData } from '@/data/portfolio-data';
import { PAGE_GAMES } from '@/data/game-navigation-data';

function Page() {
  return <div>{portfolioData.personal.name}</div>;
}
```

This is efficient because:
- Data is bundled at build time
- No network request needed
- Type-safe with TypeScript

---

## API Routes

Create backend endpoints in `app/api/`:

```typescript
// src/app/api/contact/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Handle POST requests
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, message } = body;
    
    // Validate
    if (!email || !message) {
      return NextResponse.json(
        { error: 'Missing fields' },
        { status: 400 }
      );
    }
    
    // Save to database, send email, etc.
    // await supabase.from('contacts').insert({ name, email, message });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}

// Handle GET requests
export async function GET() {
  return NextResponse.json({ message: 'Contact API' });
}
```

### API Routes in This Project

```
src/app/api/
├── contact/route.ts      → Form submissions
├── analytics/route.ts    → Track page views
├── chat/route.ts         → AI chat endpoint
├── github/route.ts       → GitHub integration
└── portfolio-data/route.ts → Portfolio API
```

---

## Context & State Management

### React Context Pattern

This project uses **React Context** for global state:

```tsx
// 1. Create context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// 2. Create provider
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(defaultTheme);
  
  const value = { theme, setTheme };
  
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// 3. Create hook for easy access
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
```

### Contexts in This Project

| Context | Purpose | File |
|---------|---------|------|
| `ThemeProvider` | Theme/era switching, CSS vars | `ThemeContext.tsx` |
| `GameModeProvider` | Game progress, XP, mode | `GameModeContext.tsx` |
| `DesignEraProvider` | Era-specific state | `DesignEraContext.tsx` |
| `CursorProvider` | Custom cursor state | `CursorContext.tsx` |

### Using Contexts

```tsx
'use client';
import { useTheme } from '@/contexts/ThemeContext';
import { useGameMode } from '@/contexts/GameModeContext';

function MyComponent() {
  const { currentTheme, setTheme } = useTheme();
  const { progress, completeLevel } = useGameMode();
  
  return (
    <div>
      Current theme: {currentTheme.name}
      XP: {progress.totalXP}
    </div>
  );
}
```

### Persistence with localStorage

Contexts often sync with localStorage:

```tsx
// Load on mount
useEffect(() => {
  const saved = localStorage.getItem('portfolio-theme');
  if (saved) setTheme(saved);
}, []);

// Save on change
useEffect(() => {
  localStorage.setItem('portfolio-theme', currentTheme.id);
}, [currentTheme]);
```

---

## Styling

### Global Styles

`src/app/globals.css` contains:

- CSS custom properties (variables)
- Tailwind base styles
- Era-specific overrides
- Grid alignment utilities

```css
/* CSS Variables */
:root {
  --bg-main: #fdfbf7;
  --text-main: #1e293b;
  --accent-color: #0369a1;
  --grid-size: 20px;
}

/* Era-specific overrides */
body[data-era="1970"] {
  --bg-main: #000000;
  --text-main: #00ff00;
}

/* Grid alignment classes */
.grid-p-1 { padding: 20px; }
.grid-m-2 { margin: 40px; }
```

### Tailwind CSS

Used for utility classes:

```tsx
<div className="flex items-center gap-4 p-5 bg-white rounded-lg shadow-md">
  <span className="text-lg font-bold text-gray-900">Title</span>
</div>
```

### CSS Variables in Components

Components read CSS variables for theming:

```tsx
<div 
  style={{ 
    backgroundColor: 'var(--bg-main)',
    color: 'var(--text-main)',
  }}
>
  Theme-aware content
</div>
```

Or via Tailwind:

```tsx
<div className="bg-[var(--bg-main)] text-[var(--text-main)]">
  Theme-aware content
</div>
```

---

## Common Patterns Used

### 1. Dynamic Imports

Heavy components are loaded lazily:

```tsx
import dynamic from 'next/dynamic';

const NewspaperLayout = dynamic(
  () => import('@/components/layout/newspaper-layout'),
  {
    loading: () => <div>Loading...</div>,
    ssr: true,  // Keep SSR for SEO
  }
);
```

### 2. Path Aliases

`@/` maps to `src/`:

```tsx
// Instead of: import { useTheme } from '../../../contexts/ThemeContext';
import { useTheme } from '@/contexts/ThemeContext';
```

Configured in `tsconfig.json`:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### 3. Barrel Exports

`index.ts` files re-export modules:

```typescript
// src/components/ui/arcade/index.ts
export { GridArcade } from './GridArcade';
export { ArcadePlayButton } from './ArcadePlayButton';
export { useGridGameLoop } from './use-grid-game-loop';
// ...

// Usage:
import { GridArcade, ArcadePlayButton } from '@/components/ui/arcade';
```

### 4. Custom Hooks

Reusable logic extracted into hooks:

```tsx
// src/hooks/useMissionTracker.ts
export function useMissionTracker() {
  const { completeLevel, isLevelCompleted } = useGameMode();
  
  const trackInteraction = useCallback(() => {
    // Track logic
  }, []);
  
  return { trackInteraction };
}

// Usage in components:
const { trackInteraction } = useMissionTracker();
```

### 5. Conditional Rendering

```tsx
function Page() {
  const pathname = usePathname();
  const arcadeEnabled = pathname === '/' || pathname === '/lab';
  
  return (
    <>
      <Navigation />
      {arcadeEnabled && <GridArcade />}
      {pathname !== '/' && <TimeMachine />}
    </>
  );
}
```

---

## Key Next.js Features Used

| Feature | Where Used | Purpose |
|---------|------------|---------|
| App Router | `src/app/` | File-based routing |
| Server Components | `layout.tsx`, some pages | SEO, initial render |
| Client Components | Most UI | Interactivity |
| Dynamic Imports | Heavy components | Code splitting |
| API Routes | `api/` folder | Backend endpoints |
| Metadata | `layout.tsx` | SEO title, description |
| CSS Modules | Some components | Scoped styles |
| Path Aliases | Everywhere | Clean imports |

---

## Development Workflow

### Start Development

```bash
npm run dev
```

Opens at `http://localhost:3000`

### Build for Production

```bash
npm run build
npm run start
```

### Check for Errors

```bash
npm run lint
```

### File Changes

Next.js has **hot reloading**:
- Edit a file → Browser updates automatically
- No manual refresh needed

---

## Summary: How It All Connects

```
┌────────────────────────────────────────────────────────────────────┐
│                         Browser Request                             │
│                              │                                      │
│                              ▼                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                     Next.js Server                           │   │
│  │                              │                               │   │
│  │     ┌────────────────────────┼────────────────────────┐     │   │
│  │     │                        │                        │     │   │
│  │     ▼                        ▼                        ▼     │   │
│  │  layout.tsx              page.tsx              api/route.ts │   │
│  │  (Server)                (Server/Client)       (Server)      │   │
│  │     │                        │                               │   │
│  │     └────────────┬───────────┘                               │   │
│  │                  │                                           │   │
│  │                  ▼                                           │   │
│  │         Rendered HTML + JS                                   │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              │                                      │
│                              ▼                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                       Browser                                │   │
│  │                              │                               │   │
│  │     1. Display HTML (instant)                                │   │
│  │     2. Hydrate React (make interactive)                      │   │
│  │     3. Load Contexts (Theme, GameMode)                       │   │
│  │     4. Apply CSS Variables                                   │   │
│  │     5. Initialize Games                                      │   │
│  │                                                              │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
└────────────────────────────────────────────────────────────────────┘
```

---

## Further Reading

- [Next.js Documentation](https://nextjs.org/docs)
- [React 19 Server Components](https://react.dev/reference/rsc/server-components)
- [App Router Migration Guide](https://nextjs.org/docs/app/building-your-application/upgrading/app-router-migration)

---

Happy coding! 🚀
