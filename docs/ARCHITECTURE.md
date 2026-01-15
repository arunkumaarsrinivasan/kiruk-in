# 🏗️ Kiruk Portfolio Architecture - Complete Guide

> A comprehensive guide to understanding the data-driven, gamified portfolio built with Next.js

---

## 📖 Table of Contents

1. [Overview](#overview)
2. [Core Concepts](#core-concepts)
3. [Project Structure](#project-structure)
4. [Data-Driven Design System](#data-driven-design-system)
5. [The Game System](#the-game-system)
6. [Theme System (Time Travel)](#theme-system-time-travel)
7. [Component Architecture](#component-architecture)
8. [Next.js Fundamentals](#nextjs-fundamentals)
9. [How to Make Changes](#how-to-make-changes)
10. [Creating New Features](#creating-new-features)
11. [Grid Arcade Games](#grid-arcade-games)
12. [Best Practices](#best-practices)

---

## 🎯 Overview

This portfolio is a **gamified, data-driven web experience** that transforms a traditional portfolio into an interactive detective game. Key characteristics:

- **Data-Driven**: All content comes from centralized data files, not hardcoded in components
- **Theme-able**: 20+ design eras from 1970 to 2025, each with unique visual styles
- **Gamified**: XP system, levels, missions, and unlockable content
- **Grid-Based**: 20px × 20px alignment system with playable mini-games

### The Three Pillars

```
┌─────────────────────────────────────────────────────────────────────┐
│                         KIRUK PORTFOLIO                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   ┌──────────────┐    ┌──────────────┐    ┌──────────────┐          │
│   │    DATA      │    │   THEMES     │    │    GAMES     │          │
│   │   LAYER      │    │   SYSTEM     │    │   SYSTEM     │          │
│   ├──────────────┤    ├──────────────┤    ├──────────────┤          │
│   │ portfolio-   │    │ ThemeContext │    │ GameMode     │          │
│   │ data.ts      │    │              │    │ Context      │          │
│   │              │    │ design-      │    │              │          │
│   │ game-nav-    │    │ systems.ts   │    │ game-nav-    │          │
│   │ data.ts      │    │              │    │ data.ts      │          │
│   │              │    │ 20+ eras     │    │              │          │
│   │ help-bot-    │    │ definable    │    │ Mini-games   │          │
│   │ data.ts      │    │              │    │ arcade       │          │
│   └──────────────┘    └──────────────┘    └──────────────┘          │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🧠 Core Concepts

### 1. Data-Driven Philosophy

Instead of hardcoding content in components:

```tsx
// ❌ BAD: Hardcoded content
function AboutPage() {
  return <h1>Hi, I'm Arun</h1>;
}

// ✅ GOOD: Data-driven
import { portfolioData } from '@/data/portfolio-data';
function AboutPage() {
  return <h1>Hi, I'm {portfolioData.personal.name}</h1>;
}
```

### 2. Separation of Concerns

```
src/
├── data/           ← WHAT (content, configuration)
├── components/     ← HOW (rendering, interaction)
├── contexts/       ← STATE (global state management)
├── hooks/          ← BEHAVIOR (reusable logic)
└── lib/            ← UTILITIES (helpers, external services)
```

### 3. The Detective Metaphor

The entire portfolio is framed as a detective investigation:

| Portfolio Section | Detective Theme      | Game Type  |
|-------------------|---------------------|------------|
| Home              | Detective HQ        | Arcade     |
| About             | Case File: Origin   | Runner     |
| Work              | Evidence Locker     | Shooter    |
| Case Studies      | Deep Investigation  | Puzzle     |
| Progress          | Detective Skills    | Builder    |
| Arcade            | Training Ground     | Explorer   |
| Contact           | Final Transmission  | Collector  |

---

## 📁 Project Structure

```
kiruk-in/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # Root layout with providers
│   │   ├── page.tsx            # Home page
│   │   ├── globals.css         # Global styles & CSS variables
│   │   ├── about/              # About route
│   │   ├── work/               # Work route
│   │   ├── case-studies/       # Case studies route
│   │   ├── contact/            # Contact route
│   │   ├── arcade/             # Arcade route
│   │   └── api/                # API routes
│   │
│   ├── components/             # Shared components
│   │   ├── layout/             # Layout components
│   │   │   ├── LayoutClientShell.tsx  # Main client wrapper
│   │   │   ├── SimpleGameNav.tsx      # Game navigation
│   │   │   ├── newspaper-layout.tsx   # Home page layout
│   │   │   └── GameMenuOverlay.tsx    # Full-screen menu
│   │   ├── ui/                 # UI primitives
│   │   │   ├── arcade/         # 🎮 Grid arcade system
│   │   │   ├── HelpBot.tsx     # AI assistant
│   │   │   ├── TimeMachine.tsx # Era switcher
│   │   │   └── PixelIcon.tsx   # Icon component
│   │   └── themed/             # Theme-aware components
│   │
│   ├── contexts/               # React Contexts
│   │   ├── ThemeContext.tsx    # Theme/era management
│   │   ├── GameModeContext.tsx # Game state & progress
│   │   └── DesignEraContext.tsx
│   │
│   ├── data/                   # 📊 DATA LAYER (Key!)
│   │   ├── portfolio-data.ts   # Personal/project data
│   │   ├── design-systems.ts   # Theme tokens
│   │   ├── game-navigation-data.ts  # Game/level definitions
│   │   ├── help-bot-data.ts    # FAQ & help content
│   │   └── page-info.ts        # Page metadata
│   │
│   ├── hooks/                  # Custom hooks
│   │   ├── useMissionTracker.ts
│   │   ├── useGridAlignment.ts
│   │   └── useResponsiveGrid.ts
│   │
│   ├── lib/                    # Utilities & services
│   │   ├── utils.ts            # Grid utilities
│   │   ├── supabase.ts         # Database
│   │   └── arcjet.ts           # Security
│   │
│   ├── modules/                # Feature modules
│   │   ├── portfolio/
│   │   ├── work/
│   │   └── vlogs/
│   │
│   └── types/                  # TypeScript types
│       └── index.ts
│
├── public/                     # Static assets
│   ├── icons/                  # 448 pixel icons
│   └── images/
│
└── docs/                       # Documentation (you are here!)
```

---

## 🎨 Data-Driven Design System

### Overview

The design system has 3 style modes with 20+ era-specific variations:

```
┌─────────────────────────────────────────────────────────────────────┐
│                    DESIGN SYSTEM ARCHITECTURE                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   ┌────────────────────────────────────────────────────────────┐    │
│   │                    ThemeConfig (Era)                        │    │
│   │  id, name, colors, fonts, style: 'sketch'|'minimal'|'absurd'│    │
│   └────────────────────────────────────────────────────────────┘    │
│                              │                                       │
│                              ▼                                       │
│   ┌────────────────────────────────────────────────────────────┐    │
│   │                  DesignSystemTokens                         │    │
│   │  ┌──────────┐  ┌──────────┐  ┌──────────┐                  │    │
│   │  │ Surface  │  │  Cards   │  │Components│                  │    │
│   │  │ Tokens   │  │  Tokens  │  │  Tokens  │                  │    │
│   │  └──────────┘  └──────────┘  └──────────┘                  │    │
│   └────────────────────────────────────────────────────────────┘    │
│                              │                                       │
│                              ▼                                       │
│   ┌────────────────────────────────────────────────────────────┐    │
│   │                    CSS Variables                            │    │
│   │  --bg-main, --text-main, --accent-color, etc.              │    │
│   └────────────────────────────────────────────────────────────┘    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Key Files

#### 1. `src/data/portfolio-data.ts`

Contains all personal/portfolio data AND theme configurations:

```typescript
// Theme Configuration Interface
export interface ThemeConfig {
  id: string;           // e.g., '2025', '1970'
  name: string;         // Display name
  era: string;          // Era description
  description: string;  // Era philosophy
  lesson: string;       // Design lesson
  heritage: string;     // Legacy impact
  keyElements: string[];
  preview: string;      // Preview image path
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  fonts: {
    primary: string;
    secondary: string;
    accent: string;
  };
  style: 'sketch' | 'minimal' | 'absurd';  // Base style
}

// 20+ themes available
export const AVAILABLE_THEMES: ThemeConfig[] = [
  { id: '1970', name: 'Terminal & ASCII', style: 'minimal', ... },
  { id: '1995', name: 'GeoCities Wild Web', style: 'absurd', ... },
  { id: '2025', name: 'Spatial Web', style: 'sketch', ... },
  // ... 17 more themes
];
```

#### 2. `src/data/design-systems.ts`

Maps themes to design tokens:

```typescript
// Token categories
interface DesignSystemTokens {
  style: 'sketch' | 'minimal' | 'absurd';
  vars: {
    surface: SurfaceTokens;  // Background patterns
    cards: CardVariableTokens;  // Card styles
  };
  components: {
    cards: CardComponentTokens;
    stickyNotes: StickyNoteComponentTokens;
    buttons: ButtonComponentTokens;
    toolbar: ToolbarComponentTokens;
  };
}

// Three base systems
const sketchBase: DesignSystemTokens = { ... };   // Hand-drawn look
const minimalBase: DesignSystemTokens = { ... };  // Clean, modern
const absurdBase: DesignSystemTokens = { ... };   // Bold, chaotic

// Era-specific overrides
const ERA_OVERRIDES = {
  '1970': { /* terminal-specific overrides */ },
  '1995': { /* geocities-specific overrides */ },
  '2025': { /* spatial-specific overrides */ },
};

// Get tokens for any theme
export const getDesignSystemForTheme = (theme: ThemeConfig): DesignSystemTokens
```

#### 3. `src/contexts/ThemeContext.tsx`

Manages theme state and applies CSS variables:

```typescript
interface ThemeContextType {
  currentTheme: ThemeConfig;
  setTheme: (themeId: string) => void;
  availableThemes: ThemeConfig[];
  designSystem: DesignSystemTokens;
  showThemeSelector: boolean;
}

// Usage in components:
const { currentTheme, setTheme, designSystem } = useTheme();
```

### How Theming Works

1. **User selects an era** (via TimeMachine or theme selector)
2. **ThemeContext updates** `currentTheme`
3. **CSS variables get set** on `document.documentElement`
4. **Design tokens recalculate** via `getDesignSystemForTheme()`
5. **Components re-render** with new tokens

```tsx
// In ThemeContext.tsx - how CSS variables are applied
useEffect(() => {
  const root = document.documentElement;
  root.style.setProperty('--theme-primary', theme.colors.primary);
  root.style.setProperty('--bg-main', theme.colors.background);
  // ... etc
  document.body.setAttribute('data-era', theme.id);
  document.body.setAttribute('data-style', theme.style);
}, [currentTheme]);
```

---

## 🎮 The Game System

### Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                       GAME SYSTEM FLOW                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   ┌──────────────┐        ┌──────────────┐        ┌──────────────┐  │
│   │ PAGE_GAMES   │        │ GameMode     │        │ Mission      │  │
│   │ (data)       │◄──────►│ Context      │◄──────►│ Tracker      │  │
│   └──────────────┘        └──────────────┘        └──────────────┘  │
│          │                       │                        │          │
│          │                       │                        │          │
│          ▼                       ▼                        ▼          │
│   ┌──────────────────────────────────────────────────────────────┐  │
│   │                         UI LAYER                              │  │
│   │  ┌────────────┐  ┌────────────┐  ┌────────────┐              │  │
│   │  │ SimpleGame │  │ GameMenu   │  │ Progress   │              │  │
│   │  │ Nav        │  │ Overlay    │  │ Indicator  │              │  │
│   │  └────────────┘  └────────────┘  └────────────┘              │  │
│   └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Data Structure (`src/data/game-navigation-data.ts`)

```typescript
// Game Modes
export type GameMode = 'god' | 'devil' | 'normal';

// Each page is a "game"
export interface PageGame {
  id: string;           // 'home', 'about', 'work', etc.
  path: string;         // Route path
  title: string;        // Detective-themed title
  subtitle: string;
  description: string;
  icon: string;         // Pixel icon name
  gameType: 'arcade' | 'runner' | 'shooter' | 'puzzle' | 'explorer' | 'builder' | 'collector';
  primaryColor: string;
  levels: GameLevel[];  // Missions within this page
  requiredGameId?: string;  // Prerequisite
  requiredXP?: number;
  order: number;
  shortcut: string;     // Keyboard shortcut
}

// Each page has multiple levels/missions
export interface GameLevel {
  id: string;
  name: string;
  description: string;
  xpReward: number;
  completionType: 'view' | 'scroll' | 'interact' | 'time' | 'score';
  completionTarget?: number;
}

// Example: Home page game
const homeGame: PageGame = {
  id: 'home',
  path: '/',
  title: 'DETECTIVE HQ',
  levels: [
    { id: 'home-intro', name: 'Open Case', completionType: 'view', xpReward: 10 },
    { id: 'home-snake', name: 'Follow Trail', completionType: 'score', target: 5, xpReward: 25 },
    // ...more levels
  ]
};
```

### Progress Tracking (`src/contexts/GameModeContext.tsx`)

```typescript
interface GameProgress {
  completedLevels: Record<string, string[]>;  // gameId -> levelIds[]
  currentGameId: string;
  totalXP: number;
  lastPlayedAt: string;
  gamesUnlocked: string[];
  achievements: string[];
}

// Context provides:
interface GameModeContextType {
  mode: GameMode;
  progress: GameProgress;
  completeLevel: (gameId: string, levelId: string) => void;
  isGameUnlocked: (gameId: string) => boolean;
  isLevelUnlocked: (gameId: string, levelId: string) => boolean;
  getGameProgress: (gameId: string) => number;  // percentage
  totalPossibleXP: number;
  currentXPPercentage: number;
}
```

### Mission Auto-Tracking (`src/hooks/useMissionTracker.ts`)

Automatically tracks completion based on user actions:

```typescript
export function useMissionTracker() {
  // Tracks:
  // - Page views (completionType: 'view')
  // - Scroll percentage (completionType: 'scroll')
  // - Time spent (completionType: 'time')
  // - Interactions (completionType: 'interact')
  // - Game scores (completionType: 'score')

  return {
    trackInteraction,  // Call from components
    trackScore,        // Call when scores change
    stats,             // Current stats
  };
}
```

---

## ⏰ Theme System (Time Travel)

### How It Works

```
┌─────────────────────────────────────────────────────────────────────┐
│                      TIME MACHINE FLOW                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  1. User clicks era in TimeMachine                                   │
│     ┌──────────────────────────┐                                    │
│     │  1970 ● 1981 ● ... 2025  │                                    │
│     └──────────────────────────┘                                    │
│                   │                                                  │
│                   ▼                                                  │
│  2. setTheme(eraId) called                                          │
│     ┌──────────────────────────┐                                    │
│     │  ThemeContext.setTheme() │                                    │
│     └──────────────────────────┘                                    │
│                   │                                                  │
│                   ▼                                                  │
│  3. CSS Variables updated                                            │
│     ┌──────────────────────────────────────────────────────────┐    │
│     │  --bg-main: #000000                                       │    │
│     │  --text-main: #00ff00                                     │    │
│     │  --accent-color: #00ff00                                  │    │
│     │  document.body.dataset.era = '1970'                       │    │
│     │  document.body.dataset.style = 'minimal'                  │    │
│     └──────────────────────────────────────────────────────────┘    │
│                   │                                                  │
│                   ▼                                                  │
│  4. Components react to CSS variables                                │
│     ┌──────────────────────────────────────────────────────────┐    │
│     │  [All components re-render with new colors/fonts]         │    │
│     └──────────────────────────────────────────────────────────┘    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### CSS Variable System

In `globals.css`, styles respond to `data-era` attribute:

```css
/* Default (2025 Spatial) */
:root {
  --bg-main: #fdfbf7;
  --text-main: #1e293b;
  --accent-color: #0369a1;
}

/* 1970 Terminal override */
body[data-era="1970"] {
  --bg-main: #000000;
  --text-main: #00ff00;
  --accent-color: #00ff00;
  --font-main: 'Courier New', monospace;
}

/* 1995 GeoCities override */
body[data-era="1995"] {
  --bg-main: #0b0025;
  --text-main: #fdfd96;
  --accent-color: #ff00ff;
}
```

---

## 🧩 Component Architecture

### Layout Hierarchy

```
┌─────────────────────────────────────────────────────────────────────┐
│                         RootLayout                                   │
│  (layout.tsx - Server Component)                                     │
│  ├── ThemeProvider                                                   │
│  │   ├── DesignEraProvider                                          │
│  │   │   ├── GameModeProvider                                       │
│  │   │   │   ├── ThemeLayout                                        │
│  │   │   │   │   ├── CursorProvider                                 │
│  │   │   │   │   │   ├── CustomCursor                               │
│  │   │   │   │   │   ├── AnalyticsTracker                           │
│  │   │   │   │   │   ├── LayoutClientShell  ◄─── Main Client Shell  │
│  │   │   │   │   │   │   ├── SimpleGameNav                          │
│  │   │   │   │   │   │   ├── DetectiveStoryWrapper                  │
│  │   │   │   │   │   │   │   └── {children}  ◄─── Page Content      │
│  │   │   │   │   │   │   ├── MissionCompletionNotification          │
│  │   │   │   │   │   │   ├── HelpBot                                │
│  │   │   │   │   │   │   └── TimeMachine (when not home)            │
└─────────────────────────────────────────────────────────────────────┘
```

### Key Component Files

| Component | File | Purpose |
|-----------|------|---------|
| `LayoutClientShell` | `components/layout/LayoutClientShell.tsx` | Main client wrapper, game state coordination |
| `SimpleGameNav` | `components/layout/SimpleGameNav.tsx` | Top navigation with XP bar |
| `GameMenuOverlay` | `components/layout/GameMenuOverlay.tsx` | Full-screen game menu |
| `TimeMachine` | `components/ui/TimeMachine.tsx` | Era/theme selector |
| `HelpBot` | `components/ui/HelpBot.tsx` | AI assistant with FAQ |
| `GridArcade` | `components/ui/arcade/GridArcade.tsx` | Mini-games container |
| `NewspaperLayout` | `components/layout/newspaper-layout.tsx` | Home page layout |

---

## 📚 Next.js Fundamentals

### App Router Basics

```
src/app/
├── layout.tsx       # Root layout (server component)
├── page.tsx         # Home page (/)
├── globals.css      # Global styles
├── about/
│   └── page.tsx     # About page (/about)
├── work/
│   ├── page.tsx     # Work list (/work)
│   └── [slug]/
│       └── page.tsx # Dynamic work detail (/work/project-name)
└── api/
    └── contact/
        └── route.ts # API route (/api/contact)
```

### Server vs Client Components

```tsx
// SERVER COMPONENT (default) - Runs on server only
// Can't use hooks, event handlers, or browser APIs
export default function ServerPage() {
  return <div>Server rendered</div>;
}

// CLIENT COMPONENT - Runs on client
// Add 'use client' directive at top
'use client';
import { useState } from 'react';
export default function ClientPage() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

### Dynamic Imports

```tsx
// Lazy load heavy client components
import dynamic from 'next/dynamic';

const NewspaperLayout = dynamic(
  () => import('@/components/layout/newspaper-layout'),
  {
    loading: () => <div>Loading...</div>,
    ssr: true, // Keep SSR for SEO
  }
);
```

### Layouts and Routing

```tsx
// layout.tsx - Wraps all children
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ThemeProvider>
          <GameModeProvider>
            {children}  {/* Page content injected here */}
          </GameModeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### API Routes

```typescript
// src/app/api/contact/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json();
  // Handle form submission
  return NextResponse.json({ success: true });
}
```

---

## 🛠️ How to Make Changes

### Changing Portfolio Content

**File:** `src/data/portfolio-data.ts`

```typescript
// Modify personal info
export const portfolioData: PortfolioData = {
  personal: {
    name: 'KIRUK',
    title: 'Full-Stack Developer & Designer',
    // Change these values...
  },
  skills: [...],
  projects: [...],
};
```

### Adding a New Page

1. **Create route folder:**
```
src/app/new-page/page.tsx
```

2. **Add to game data:**
```typescript
// src/data/game-navigation-data.ts
export const PAGE_GAMES: PageGame[] = [
  // ... existing pages
  {
    id: 'new-page',
    path: '/new-page',
    title: 'NEW PAGE',
    levels: [...],
    order: 9,  // After existing pages
  }
];
```

3. **Add help content:**
```typescript
// src/data/help-bot-data.ts
export const PAGE_HELP_DATA: PageHelp[] = [
  // ... existing
  {
    path: '/new-page',
    title: 'New Page',
    instructions: [...],
  }
];
```

### Adding a New Theme

```typescript
// src/data/portfolio-data.ts
export const AVAILABLE_THEMES: ThemeConfig[] = [
  // ... existing themes
  {
    id: 'future',
    name: '2030: Holographic UI',
    era: 'Future Web',
    description: 'Holographic interfaces and neural design',
    colors: {
      primary: '#00ffff',
      secondary: '#ff00ff',
      accent: '#00ff00',
      background: '#0a0a0a',
      text: '#ffffff',
    },
    fonts: {
      primary: 'Inter',
      secondary: 'Space Grotesk',
      accent: 'Inter',
    },
    style: 'absurd',
    // ...other fields
  }
];
```

### Modifying Component Styles

Components use the design system tokens:

```tsx
const { designSystem } = useTheme();

// Use token classes
<div className={designSystem.components.cards.base}>
  <span className={designSystem.components.cards.tag}>Tag</span>
</div>
```

---

## 🎮 Grid Arcade Games

### System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                    ARCADE GAME ARCHITECTURE                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │                     GAME REGISTRY                            │   │
│   │   snake ──► SnakeGame                                        │   │
│   │   painter ──► PainterGame                                    │   │
│   │   collector ──► CollectorGame                                │   │
│   │   ... (12 total games)                                       │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                            │                                         │
│                            ▼                                         │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │                    BASE GRID GAME                            │   │
│   │   - Grid initialization                                      │   │
│   │   - Pointer event handling                                   │   │
│   │   - Path interpolation                                       │   │
│   │   - Score management                                         │   │
│   │   - Render state generation                                  │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                            │                                         │
│                            ▼                                         │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │                    GAME CONFIGS                              │   │
│   │   - Visual settings (colors)                                 │   │
│   │   - Gameplay parameters                                      │   │
│   │   - Score labels                                             │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Creating a New Game

**Step 1: Add Config (`game-configs.ts`)**

```typescript
export interface MyGameConfig extends BaseGameConfig {
  myCustomSetting: number;
}

export const MY_GAME_CONFIG: MyGameConfig = {
  id: 'mygame',
  label: 'My Game',
  description: 'Description here',
  primaryColor: 'var(--text-main)',
  secondaryColor: 'var(--accent-color)',
  scoreLabel: 'Points',
  myCustomSetting: 10,
};

// Add to ALL_GAME_CONFIGS
export const ALL_GAME_CONFIGS = {
  // ...existing
  mygame: MY_GAME_CONFIG,
};
```

**Step 2: Create Game Class (`games/my-game.ts`)**

```typescript
import { BaseGridGame } from '../base-grid-game';
import { MY_GAME_CONFIG } from '../game-configs';
import type { GridCell, GridSegment, GridFood } from '../types';

export class MyGame extends BaseGridGame {
  readonly id = MY_GAME_CONFIG.id;
  readonly label = MY_GAME_CONFIG.label;
  readonly description = MY_GAME_CONFIG.description;

  private config = MY_GAME_CONFIG;
  private gameData: GridCell[] = [];

  protected onReset(): void {
    this.gameData = [];
    this.setScore(0);
  }

  protected onUpdate(dt: number): void {
    // Game logic every frame
  }

  protected onCursorMove(cell: GridCell): void {
    // Handle cursor movement
  }

  protected getSegments(): GridSegment[] {
    return this.gameData.map(cell => ({
      x: cell.x,
      y: cell.y,
      color: this.config.primaryColor,
      opacity: 1,
    }));
  }

  protected getFood(): GridFood[] {
    return [];
  }
}

export function createMyGame() {
  return new MyGame();
}
```

**Step 3: Register Game (`game-registry.ts`)**

```typescript
import { createMyGame } from './games';

export const GAME_REGISTRY = {
  // ...existing
  mygame: {
    id: ALL_GAME_CONFIGS.mygame.id,
    label: ALL_GAME_CONFIGS.mygame.label,
    description: ALL_GAME_CONFIGS.mygame.description,
    createEngine: createMyGame,
  },
};
```

**Step 4: Export from Index (`games/index.ts`)**

```typescript
export { MyGame, createMyGame } from './my-game';
```

---

## ✅ Best Practices

### 1. Grid Alignment

Always use 20px multiples:

```tsx
// ✅ Good
<div style={{ width: '200px', padding: '20px' }}>

// Or use CSS classes
<div className="grid-w-10 grid-p-1">
```

### 2. Data-Driven Content

Never hardcode content:

```tsx
// ❌ Bad
<h1>About Me</h1>

// ✅ Good
import { portfolioData } from '@/data/portfolio-data';
<h1>About {portfolioData.personal.name}</h1>
```

### 3. Use Design Tokens

```tsx
const { designSystem } = useTheme();

// ❌ Bad
<div className="bg-white border rounded-lg">

// ✅ Good
<div className={designSystem.components.cards.base}>
```

### 4. Track Missions

```tsx
const { trackInteraction, trackScore } = useMissionTracker();

function handleClick() {
  trackInteraction();  // Track user interaction
}

function handleScore(newScore: number) {
  trackScore(newScore);  // Track score achievements
}
```

### 5. Theme-Aware Components

```tsx
const { currentTheme, designSystem } = useTheme();

// Adapt to current era
const isRetro = ['1970', '1981', '1991'].includes(currentTheme.id);
```

---

## 🚀 Quick Reference

### Common Commands

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run lint     # Check for errors
```

### Key Hooks

```tsx
useTheme()          // Theme state and functions
useGameMode()       // Game progress and mode
useMissionTracker() // Auto-track user actions
useDesignSystem()   // Get current design tokens
```

### Key Data Files

```
src/data/portfolio-data.ts      # Personal info, themes
src/data/design-systems.ts      # Design tokens
src/data/game-navigation-data.ts # Games & levels
src/data/help-bot-data.ts       # FAQ & help
```

### Key Context Providers

```tsx
<ThemeProvider>      // Theme switching
<GameModeProvider>   // Game state
<CursorProvider>     // Custom cursor
```

---

## 📞 Need Help?

- Check `src/data/help-bot-data.ts` for FAQ
- Review component source files for implementation details
- Use the in-app HelpBot for guidance

Happy coding! 🎮✨
