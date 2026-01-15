# 📖 Kiruk Portfolio Documentation

Welcome to the documentation for the Kiruk Portfolio! This is a gamified, data-driven portfolio built with Next.js.

---

## 📚 Documentation Files

### Core Documents

| Document | Description |
|----------|-------------|
| [**ARCHITECTURE.md**](./ARCHITECTURE.md) | Complete architecture guide covering data-driven design, game system, themes, and how to make changes |
| [**C4_DIAGRAMS.md**](./C4_DIAGRAMS.md) | C4 architecture diagrams in PlantUML and Mermaid formats |
| [**NEXTJS_FUNDAMENTALS.md**](./NEXTJS_FUNDAMENTALS.md) | Next.js concepts as used in this project |
| [**CREATING_GAMES.md**](./CREATING_GAMES.md) | Step-by-step guide to adding new arcade games |

### Project Files

| Document | Location | Description |
|----------|----------|-------------|
| README.md | Root | Project overview and commands |
| GRID_ALIGNMENT_GUIDE.md | Root | 20px grid alignment system |
| MANUAL_CONTENT_SETUP.md | Root | Content setup instructions |

---

## 🗺️ Quick Navigation

### I want to...

| Goal | Go To |
|------|-------|
| Understand the overall architecture | [ARCHITECTURE.md](./ARCHITECTURE.md) |
| See visual diagrams | [C4_DIAGRAMS.md](./C4_DIAGRAMS.md) |
| Learn Next.js basics | [NEXTJS_FUNDAMENTALS.md](./NEXTJS_FUNDAMENTALS.md) |
| Create a new arcade game | [CREATING_GAMES.md](./CREATING_GAMES.md) |
| Add a new page | [ARCHITECTURE.md#adding-a-new-page](./ARCHITECTURE.md#adding-a-new-page) |
| Add a new theme | [ARCHITECTURE.md#adding-a-new-theme](./ARCHITECTURE.md#adding-a-new-theme) |
| Change portfolio content | [ARCHITECTURE.md#changing-portfolio-content](./ARCHITECTURE.md#changing-portfolio-content) |
| Understand the game system | [ARCHITECTURE.md#the-game-system](./ARCHITECTURE.md#the-game-system) |
| Understand theming | [ARCHITECTURE.md#theme-system-time-travel](./ARCHITECTURE.md#theme-system-time-travel) |

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         KIRUK PORTFOLIO                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   DATA LAYER          →    CONTEXT LAYER    →    UI LAYER           │
│   (src/data/)              (src/contexts/)       (src/components/)   │
│                                                                      │
│   portfolio-data.ts        ThemeContext          Layout components   │
│   design-systems.ts        GameModeContext       Arcade games        │
│   game-navigation.ts       DesignEraContext      UI primitives       │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📁 Key Directories

```
src/
├── app/          # Next.js routes & pages
├── components/   # Reusable UI components
│   ├── layout/   # Layout shells
│   └── ui/       # UI primitives + arcade
├── contexts/     # React context providers
├── data/         # Static data (THE DATA LAYER)
├── hooks/        # Custom React hooks
├── lib/          # Utilities & external services
└── types/        # TypeScript definitions
```

---

## 🎯 Key Concepts

### 1. Data-Driven Design

All content comes from TypeScript files in `src/data/`:

```typescript
// Don't hardcode
<h1>Arun's Portfolio</h1>

// Import from data
import { portfolioData } from '@/data/portfolio-data';
<h1>{portfolioData.personal.name}'s Portfolio</h1>
```

### 2. Theme System

20+ design eras from 1970-2025, switched via CSS variables:

```typescript
const { currentTheme, setTheme } = useTheme();
setTheme('1970');  // Green terminal look
setTheme('2025');  // Modern spatial design
```

### 3. Game System

Portfolio gamified as detective investigation:

```typescript
const { progress, completeLevel } = useGameMode();
completeLevel('about', 'about-intro');  // Earn XP
```

### 4. 20px Grid

Everything aligns to 20px grid:

```css
.grid-p-1 { padding: 20px; }
.grid-w-10 { width: 200px; }
```

---

## 🚀 Quick Commands

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run lint     # Check for errors
npm run start    # Serve production build
```

---

## 📞 Key Files to Know

| File | Purpose |
|------|---------|
| `src/data/portfolio-data.ts` | Personal info, projects, 20+ themes |
| `src/data/game-navigation-data.ts` | Page games, levels, XP rewards |
| `src/data/design-systems.ts` | Design tokens per theme |
| `src/contexts/ThemeContext.tsx` | Theme state & CSS variables |
| `src/contexts/GameModeContext.tsx` | Game progress & XP |
| `src/app/layout.tsx` | Root layout with providers |
| `src/components/layout/LayoutClientShell.tsx` | Main client wrapper |
| `src/components/ui/arcade/` | Mini-game system |

---

## 📝 Change Log

| Date | Change |
|------|--------|
| 2024-12-31 | Initial documentation created |

---

Happy exploring! 🎮✨
