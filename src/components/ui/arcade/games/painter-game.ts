/**
 * Grid Painter Game
 *
 * Paint colorful trails that fade over time.
 * Uses BaseGridGame for common functionality.
 */

import { BaseGridGame } from '../base-grid-game';
import { PAINTER_CONFIG, type PainterGameConfig } from '../game-configs';
import type { GridCell, GridSegment, GridFood } from '../types';

interface PaintedCell {
  x: number;
  y: number;
  color: string;
  opacity: number;
  timestamp: number;
}

export class PainterGame extends BaseGridGame {
  readonly id = PAINTER_CONFIG.id;
  readonly label = PAINTER_CONFIG.label;
  readonly description = PAINTER_CONFIG.description;

  private config: PainterGameConfig;
  private paintedCells: Map<string, PaintedCell> = new Map();
  private colorIndex = 0;

  constructor(config: Partial<PainterGameConfig> = {}) {
    super();
    this.config = { ...PAINTER_CONFIG, ...config };
  }

  protected onReset(): void {
    this.paintedCells.clear();
    this.colorIndex = 0;
    this.updateStatus();
  }

  protected onUpdate(dt: number): void {
    const now = Date.now();
    const { fadeTime, minOpacity } = this.config;

    // Update opacity and remove faded cells
    for (const [key, cell] of this.paintedCells) {
      const age = now - cell.timestamp;
      const fadeProgress = Math.min(age / fadeTime, 1);
      cell.opacity = 1 - fadeProgress * (1 - minOpacity);

      if (cell.opacity <= minOpacity) {
        this.paintedCells.delete(key);
      }
    }

    this.updateStatus();
  }

  protected onCursorPath(cell: GridCell): void {
    this.paintCell(cell);
  }

  protected onCursorLeave(): void {
    // Cycle color when pointer leaves
    this.colorIndex = (this.colorIndex + 1) % this.config.palette.length;
  }

  protected getSegments(): GridSegment[] {
    return Array.from(this.paintedCells.values()).map(cell => ({
      x: cell.x,
      y: cell.y,
      color: cell.color,
      opacity: cell.opacity,
    }));
  }

  protected getFood(): GridFood[] {
    return [];
  }

  private paintCell(cell: GridCell): void {
    const key = this.cellKey(cell);
    const isNew = !this.paintedCells.has(key);

    this.paintedCells.set(key, {
      x: cell.x,
      y: cell.y,
      color: this.config.palette[this.colorIndex],
      opacity: 1,
      timestamp: Date.now(),
    });

    if (isNew) {
      this.addScore(1);
      // Cycle colors periodically
      if (this.state.score % this.config.colorCycleInterval === 0) {
        this.colorIndex = (this.colorIndex + 1) % this.config.palette.length;
      }
    }
  }

  private updateStatus(): void {
    this.setStatus(`${this.config.scoreLabel}: ${this.state.score}`);
  }
}

export function createPainterGame(config?: Partial<PainterGameConfig>) {
  return new PainterGame(config);
}
