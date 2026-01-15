# 🎮 Creating New Arcade Games - Step-by-Step Guide

> Complete tutorial for adding new mini-games to the Grid Arcade system

---

## 📋 Overview

The arcade system uses a **data-driven, class-based architecture**:

```
game-configs.ts     → Define settings (colors, speeds, etc.)
games/my-game.ts    → Game logic class extending BaseGridGame  
game-registry.ts    → Register game for use
games/index.ts      → Export game class
```

**Time to create a new game: ~15-30 minutes**

---

## 🚀 Quick Start

### Step 1: Copy the Template

```bash
# From project root
cp src/components/ui/arcade/games/_TEMPLATE.ts src/components/ui/arcade/games/my-game.ts
```

### Step 2: Define Your Config

Open `src/components/ui/arcade/game-configs.ts` and add:

```typescript
// ============ My Game Configuration ============
export interface MyGameConfig extends BaseGameConfig {
  // Add your custom settings
  targetCount: number;
  spawnRate: number;
  pointsPerTarget: number;
}

export const MY_GAME_CONFIG: MyGameConfig = {
  // Required base config
  id: 'mygame',
  label: 'My Awesome Game',
  description: 'Collect targets as fast as you can!',
  primaryColor: '#22c55e',       // Main game color
  secondaryColor: '#ef4444',     // Accent color
  scoreLabel: 'Targets',         // What score represents
  
  // Your custom settings
  targetCount: 5,
  spawnRate: 1000,
  pointsPerTarget: 10,
};

// Add to ALL_GAME_CONFIGS at the bottom:
export const ALL_GAME_CONFIGS = {
  // ...existing games
  mygame: MY_GAME_CONFIG,  // ← Add this line
} as const;

// Update the GameId type:
export type GameId = keyof typeof ALL_GAME_CONFIGS;
```

### Step 3: Implement Game Logic

Edit `src/components/ui/arcade/games/my-game.ts`:

```typescript
/**
 * My Awesome Game
 * 
 * Move cursor to collect spawning targets!
 */

import { BaseGridGame } from '../base-grid-game';
import type { GridCell, GridSegment, GridFood } from '../types';
import { MY_GAME_CONFIG, type MyGameConfig } from '../game-configs';

interface Target {
  cell: GridCell;
  spawnTime: number;
}

export class MyGame extends BaseGridGame {
  // Required: Identity from config
  readonly id = MY_GAME_CONFIG.id;
  readonly label = MY_GAME_CONFIG.label;
  readonly description = MY_GAME_CONFIG.description;

  // Game state
  private config: MyGameConfig;
  private targets: Target[] = [];
  private lastSpawnTime = 0;

  constructor(config: Partial<MyGameConfig> = {}) {
    super();
    this.config = { ...MY_GAME_CONFIG, ...config };
  }

  /**
   * Called when game starts/resets
   */
  protected onReset(): void {
    this.targets = [];
    this.lastSpawnTime = 0;
    this.setScore(0);
    this.spawnTarget();  // Start with one target
  }

  /**
   * Called every frame
   * @param dt - Delta time in milliseconds
   */
  protected onUpdate(dt: number): void {
    const now = Date.now();
    
    // Spawn new targets periodically
    if (now - this.lastSpawnTime > this.config.spawnRate) {
      if (this.targets.length < this.config.targetCount) {
        this.spawnTarget();
        this.lastSpawnTime = now;
      }
    }
    
    // Update status text
    this.setStatus(`${this.config.scoreLabel}: ${this.state.score}`);
  }

  /**
   * Called when cursor moves to a cell
   */
  protected onCursorMove(cell: GridCell): void {
    // Check if cursor hits any target
    const hitIndex = this.targets.findIndex(t => 
      t.cell.x === cell.x && t.cell.y === cell.y
    );
    
    if (hitIndex !== -1) {
      // Target collected!
      this.targets.splice(hitIndex, 1);
      this.addScore(this.config.pointsPerTarget);
      
      // Spawn replacement
      this.spawnTarget();
    }
  }

  /**
   * Return segments (trail, player indicator)
   */
  protected getSegments(): GridSegment[] {
    // Show cursor position as a segment
    if (!this.cursorCell) return [];
    
    return [{
      x: this.cursorCell.x,
      y: this.cursorCell.y,
      color: this.config.primaryColor,
      opacity: 0.8,
    }];
  }

  /**
   * Return targets to collect
   */
  protected getFood(): GridFood[] {
    return this.targets.map(target => ({
      x: target.cell.x,
      y: target.cell.y,
      color: this.config.secondaryColor,
    }));
  }

  // ============ Helper Methods ============

  private spawnTarget(): void {
    const occupied = new Set(
      this.targets.map(t => this.cellKey(t.cell))
    );
    
    const cell = this.getRandomEmptyCell(occupied);
    if (cell) {
      this.targets.push({
        cell,
        spawnTime: Date.now(),
      });
    }
  }
}

// Factory function (required for registry)
export function createMyGame(config?: Partial<MyGameConfig>) {
  return new MyGame(config);
}
```

### Step 4: Export from Index

Add to `src/components/ui/arcade/games/index.ts`:

```typescript
// ...existing exports

// My Game
export { MyGame, createMyGame } from './my-game';
```

### Step 5: Register the Game

Edit `src/components/ui/arcade/game-registry.ts`:

```typescript
import {
  // ...existing imports
  createMyGame,           // ← Add this
} from './games';

export const GAME_REGISTRY: Record<string, GameRegistryEntry> = {
  // ...existing games
  
  mygame: {                                    // ← Add this block
    id: ALL_GAME_CONFIGS.mygame.id,
    label: ALL_GAME_CONFIGS.mygame.label,
    description: ALL_GAME_CONFIGS.mygame.description,
    createEngine: createMyGame,
  },
};
```

### Step 6: Test Your Game!

```bash
npm run dev
# Navigate to /lab or /arcade
# Your game should appear in the game selector!
```

---

## 🎯 Understanding BaseGridGame

The base class provides powerful utilities:

### Lifecycle Methods (Override These)

```typescript
// Called when game starts or resets
protected onReset(): void { }

// Called every animation frame with delta time (ms)
protected onUpdate(dt: number): void { }

// Called when cursor moves to new cell
protected onCursorMove(cell: GridCell): void { }

// Called for each cell cursor passes through (interpolated path)
protected onCursorPath(cell: GridCell): void { }

// Called when cursor leaves grid
protected onCursorLeave(): void { }

// Called on click/tap (for click-based games)
protected onCellClick(cell: GridCell): void { }

// Return array of segments to render
protected getSegments(): GridSegment[] { return []; }

// Return array of food/targets to render  
protected getFood(): GridFood[] { return []; }
```

### Available Utilities

```typescript
// Grid info
this.gridWidth   // Number of columns
this.gridHeight  // Number of rows

// Cursor state
this.cursorCell      // Current cursor position
this.lastCursorCell  // Previous cursor position
this.isPointerActive // Is cursor in grid?

// Grid helpers
this.clampToGrid(cell)           // Keep cell in bounds
this.isInBounds(cell)            // Check if cell valid
this.getRandomCell()             // Random cell in grid
this.getRandomEmptyCell(occupied) // Random cell not in set
this.cellKey(cell)               // "x,y" string for Set/Map
this.cellsEqual(a, b)            // Compare cells
this.interpolatePath(from, to)   // Get cells between points

// Score management
this.setScore(score)             // Set score directly
this.addScore(points)            // Add to score
this.setStatus(text)             // Update status text
this.endGame()                   // End the game
```

---

## 🎨 Game Types & Patterns

### Pattern 1: Cursor Chase (Snake, Painter)

Track cursor movement over time:

```typescript
private trail: GridCell[] = [];

protected onCursorPath(cell: GridCell): void {
  this.trail.push({ ...cell });
  if (this.trail.length > this.maxLength) {
    this.trail.shift();
  }
}

protected getSegments(): GridSegment[] {
  return this.trail.map((cell, i) => ({
    x: cell.x,
    y: cell.y,
    color: this.config.primaryColor,
    opacity: (i + 1) / this.trail.length,
  }));
}
```

### Pattern 2: Collect Items (Collector)

Spawn items, detect cursor collision:

```typescript
private items: GridCell[] = [];

protected onUpdate(dt: number): void {
  // Spawn logic
  if (this.items.length < this.maxItems) {
    this.spawnItem();
  }
}

protected onCursorMove(cell: GridCell): void {
  const hit = this.items.findIndex(item => 
    this.cellsEqual(item, cell)
  );
  if (hit !== -1) {
    this.items.splice(hit, 1);
    this.addScore(10);
  }
}
```

### Pattern 3: Avoid Obstacles (Avoider, Flappy)

Move obstacles, detect collision:

```typescript
private obstacles: { x: number; y: number }[] = [];

protected onUpdate(dt: number): void {
  // Move obstacles
  this.obstacles.forEach(obs => {
    obs.y += this.speed * dt;
  });
  
  // Remove off-screen
  this.obstacles = this.obstacles.filter(o => o.y < this.gridHeight);
  
  // Check collision
  if (this.cursorCell) {
    const hit = this.obstacles.some(obs => 
      this.cellsEqual(obs, this.cursorCell)
    );
    if (hit) this.endGame();
  }
}
```

### Pattern 4: Click-Based (Minesweeper)

Handle discrete clicks:

```typescript
private revealed: Set<string> = new Set();

protected onCellClick(cell: GridCell): void {
  const key = this.cellKey(cell);
  if (this.revealed.has(key)) return;
  
  this.revealed.add(key);
  if (this.isMine(cell)) {
    this.endGame();
  } else {
    this.addScore(10);
  }
}
```

### Pattern 5: Falling Pieces (Tetris)

Gravity and piece management:

```typescript
private piece: { cells: GridCell[]; color: string };
private landed: Map<string, string> = new Map();
private lastDrop = 0;

protected onUpdate(dt: number): void {
  const now = Date.now();
  if (now - this.lastDrop > this.dropInterval) {
    this.movePieceDown();
    this.lastDrop = now;
  }
}

private movePieceDown(): void {
  const canMove = this.piece.cells.every(c => {
    const below = { x: c.x, y: c.y + 1 };
    return this.isInBounds(below) && !this.landed.has(this.cellKey(below));
  });
  
  if (canMove) {
    this.piece.cells.forEach(c => c.y++);
  } else {
    this.landPiece();
    this.spawnNewPiece();
  }
}
```

---

## 🎨 Rendering Types

### GridSegment

```typescript
interface GridSegment {
  x: number;      // Cell column
  y: number;      // Cell row
  color: string;  // Fill color
  opacity: number; // 0-1 opacity
}
```

Use for: trails, snake body, player, filled areas

### GridFood

```typescript
interface GridFood {
  x: number;      // Cell column
  y: number;      // Cell row
  color: string;  // Fill color
}
```

Use for: collectibles, targets, power-ups

---

## 📝 Complete Example: Reaction Game

```typescript
/**
 * Reaction Game
 * 
 * Targets appear and disappear. React fast to click them!
 */

import { BaseGridGame } from '../base-grid-game';
import type { GridCell, GridSegment, GridFood } from '../types';

interface ReactionGameConfig {
  id: string;
  label: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  scoreLabel: string;
  targetDuration: number;  // How long target stays
  spawnDelay: number;      // Delay between spawns
}

const CONFIG: ReactionGameConfig = {
  id: 'reaction',
  label: 'Quick Reaction',
  description: 'Click targets before they disappear!',
  primaryColor: '#22c55e',
  secondaryColor: '#fbbf24',
  scoreLabel: 'Reactions',
  targetDuration: 1500,
  spawnDelay: 500,
};

interface Target {
  cell: GridCell;
  spawnTime: number;
}

export class ReactionGame extends BaseGridGame {
  readonly id = CONFIG.id;
  readonly label = CONFIG.label;
  readonly description = CONFIG.description;

  private target: Target | null = null;
  private lastSpawn = 0;
  private misses = 0;

  protected onReset(): void {
    this.target = null;
    this.lastSpawn = 0;
    this.misses = 0;
    this.setScore(0);
  }

  protected onUpdate(dt: number): void {
    const now = Date.now();

    if (this.target) {
      // Check if target expired
      if (now - this.target.spawnTime > CONFIG.targetDuration) {
        this.misses++;
        this.target = null;
        
        if (this.misses >= 3) {
          this.setStatus('Game Over! Too slow...');
          this.endGame();
          return;
        }
      }
    } else {
      // Spawn new target after delay
      if (now - this.lastSpawn > CONFIG.spawnDelay) {
        this.spawnTarget();
        this.lastSpawn = now;
      }
    }

    this.setStatus(`${CONFIG.scoreLabel}: ${this.state.score} | Misses: ${this.misses}/3`);
  }

  protected onCellClick(cell: GridCell): void {
    if (!this.target) return;

    if (this.cellsEqual(cell, this.target.cell)) {
      // Hit!
      const reactionTime = Date.now() - this.target.spawnTime;
      const bonus = Math.max(1, Math.floor((CONFIG.targetDuration - reactionTime) / 100));
      this.addScore(10 + bonus);
      this.target = null;
    }
  }

  protected getSegments(): GridSegment[] {
    return [];
  }

  protected getFood(): GridFood[] {
    if (!this.target) return [];
    
    // Calculate fade based on remaining time
    const elapsed = Date.now() - this.target.spawnTime;
    const remaining = 1 - (elapsed / CONFIG.targetDuration);
    
    return [{
      x: this.target.cell.x,
      y: this.target.cell.y,
      color: remaining > 0.3 ? CONFIG.primaryColor : CONFIG.secondaryColor,
    }];
  }

  private spawnTarget(): void {
    this.target = {
      cell: this.getRandomCell(),
      spawnTime: Date.now(),
    };
  }
}

export function createReactionGame() {
  return new ReactionGame();
}
```

---

## ✅ Checklist

Before submitting your new game:

- [ ] Config added to `game-configs.ts`
- [ ] Config added to `ALL_GAME_CONFIGS` object
- [ ] Game class created in `games/` folder
- [ ] Factory function exported (`createMyGame`)
- [ ] Game exported from `games/index.ts`
- [ ] Game registered in `game-registry.ts`
- [ ] Game tested in browser
- [ ] No TypeScript errors (`npm run lint`)
- [ ] Game has clear win/lose conditions
- [ ] Status text is informative

---

## 🎮 Available Games Reference

| Game | Type | Pattern | Key Mechanic |
|------|------|---------|--------------|
| Snake | Trail | Cursor chase | Grow on collect |
| Painter | Trail | Cursor chase | Fading cells |
| Collector | Collect | Item spawn | Time-limited items |
| Avoider | Avoid | Falling obstacles | Survival time |
| Tetris | Falling | Piece physics | Line clearing |
| Pipe | Connect | Click to build | Flow timing |
| Shooter | Action | Auto-fire | Enemy waves |
| Minesweeper | Puzzle | Click reveal | Hidden mines |
| Flappy | Avoid | Side-scroll | Gap navigation |
| Timeline | Story | Side-scroll | Story milestones |
| Quiz | Trivia | Click answer | Knowledge test |
| Memory | Puzzle | Card matching | Pattern recall |

---

Happy game creating! 🎮
