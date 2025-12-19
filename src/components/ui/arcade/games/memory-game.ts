/**
 * Memory Match Game
 *
 * Match pairs of skills and their icons!
 * Flip cards to find matching pairs and learn about skills.
 * Each match reveals information about that skill.
 */

import { BaseGridGame } from '../base-grid-game';
import type { BaseGameConfig } from '../base-grid-game';
import type { GridCell, GridSegment, GridFood } from '../types';

export interface MemoryGameConfig extends BaseGameConfig {
  flipDuration: number;
  cardRevealTime: number;
  gridCols: number;
  gridRows: number;
}

export const MEMORY_CONFIG: MemoryGameConfig = {
  id: 'memory',
  label: 'Skill Match',
  description: 'Match my skills! Flip cards to find pairs and learn about each skill.',
  primaryColor: '#ec4899',
  secondaryColor: '#8b5cf6',
  scoreLabel: 'Pairs',
  flipDuration: 1500,
  cardRevealTime: 500,
  gridCols: 4,
  gridRows: 4,
};

// Skills to match
const SKILL_PAIRS = [
  { icon: '⚛️', name: 'React', detail: 'Building UIs with React & Next.js' },
  { icon: '🌱', name: 'Spring', detail: 'Java backend with Spring Boot' },
  { icon: '☁️', name: 'AWS', detail: 'Cloud infrastructure & services' },
  { icon: '🎨', name: 'Figma', detail: 'UI/UX design & prototyping' },
  { icon: '🐍', name: 'Python', detail: 'Automation & data processing' },
  { icon: '📊', name: 'SQL', detail: 'Database design & queries' },
  { icon: '🎬', name: 'Motion', detail: 'After Effects animations' },
  { icon: '🎮', name: 'Games', detail: 'Unity & game design' },
];

interface Card {
  id: number;
  icon: string;
  name: string;
  detail: string;
  isFlipped: boolean;
  isMatched: boolean;
  x: number;
  y: number;
}

export class MemoryGame extends BaseGridGame {
  readonly id = MEMORY_CONFIG.id;
  readonly label = MEMORY_CONFIG.label;
  readonly description = MEMORY_CONFIG.description;

  private config: MemoryGameConfig;
  private cards: Card[] = [];
  private firstCard: Card | null = null;
  private secondCard: Card | null = null;
  private isChecking = false;
  private checkTimer = 0;
  private moves = 0;
  private matchedPairs = 0;
  private totalPairs = 0;
  private cursorPosition: GridCell = { x: 0, y: 0 };
  private lastMatchedSkill: string | null = null;
  private showingMatchInfo = false;
  private matchInfoTimer = 0;

  constructor(config: Partial<MemoryGameConfig> = {}) {
    super();
    this.config = { ...MEMORY_CONFIG, ...config };
  }

  protected onReset(): void {
    this.cards = [];
    this.firstCard = null;
    this.secondCard = null;
    this.isChecking = false;
    this.checkTimer = 0;
    this.moves = 0;
    this.matchedPairs = 0;
    this.lastMatchedSkill = null;
    this.showingMatchInfo = false;
    
    // Create card pairs
    const selectedSkills = SKILL_PAIRS.slice(0, 8); // 8 pairs = 16 cards
    this.totalPairs = selectedSkills.length;
    
    const cardData: { icon: string; name: string; detail: string }[] = [];
    for (const skill of selectedSkills) {
      cardData.push(skill, skill); // Add twice for pairs
    }
    
    // Shuffle
    for (let i = cardData.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cardData[i], cardData[j]] = [cardData[j], cardData[i]];
    }
    
    // Create cards with positions
    const cardWidth = 8;
    const cardHeight = 5;
    const startX = Math.floor((this.gridWidth - (4 * cardWidth + 3 * 2)) / 2);
    const startY = 8;
    
    cardData.forEach((data, index) => {
      const col = index % 4;
      const row = Math.floor(index / 4);
      this.cards.push({
        id: index,
        icon: data.icon,
        name: data.name,
        detail: data.detail,
        isFlipped: false,
        isMatched: false,
        x: startX + col * (cardWidth + 2),
        y: startY + row * (cardHeight + 2),
      });
    });
    
    this.updateStatus();
  }

  protected onUpdate(dt: number): void {
    // Handle match check timer
    if (this.isChecking) {
      this.checkTimer -= dt;
      if (this.checkTimer <= 0) {
        this.finishChecking();
      }
    }
    
    // Handle match info display
    if (this.showingMatchInfo) {
      this.matchInfoTimer -= dt;
      if (this.matchInfoTimer <= 0) {
        this.showingMatchInfo = false;
        this.lastMatchedSkill = null;
      }
    }
  }

  protected onCursorMove(cell: GridCell): void {
    this.cursorPosition = cell;
  }

  protected onCellClick(cell: GridCell): void {
    if (this.isChecking) return;
    
    const clickedCard = this.getCardAtCell(cell);
    if (!clickedCard || clickedCard.isFlipped || clickedCard.isMatched) return;
    
    // Flip the card
    clickedCard.isFlipped = true;
    
    if (!this.firstCard) {
      this.firstCard = clickedCard;
    } else if (!this.secondCard) {
      this.secondCard = clickedCard;
      this.moves++;
      this.checkForMatch();
    }
    
    this.updateStatus();
  }

  private getCardAtCell(cell: GridCell): Card | null {
    const cardWidth = 8;
    const cardHeight = 5;
    
    for (const card of this.cards) {
      if (cell.x >= card.x && cell.x < card.x + cardWidth &&
          cell.y >= card.y && cell.y < card.y + cardHeight) {
        return card;
      }
    }
    return null;
  }

  private checkForMatch(): void {
    if (!this.firstCard || !this.secondCard) return;
    
    this.isChecking = true;
    this.checkTimer = this.config.flipDuration;
    
    if (this.firstCard.name === this.secondCard.name) {
      // Match found!
      this.firstCard.isMatched = true;
      this.secondCard.isMatched = true;
      this.matchedPairs++;
      this.addScore(1);
      
      // Show skill info
      this.lastMatchedSkill = this.firstCard.detail;
      this.showingMatchInfo = true;
      this.matchInfoTimer = 3000;
    }
  }

  private finishChecking(): void {
    if (!this.firstCard || !this.secondCard) return;
    
    // If not matched, flip cards back
    if (!this.firstCard.isMatched) {
      this.firstCard.isFlipped = false;
    }
    if (!this.secondCard.isMatched) {
      this.secondCard.isFlipped = false;
    }
    
    this.firstCard = null;
    this.secondCard = null;
    this.isChecking = false;
    
    // Check win condition
    if (this.matchedPairs === this.totalPairs) {
      this.setStatus(`🎉 All matched in ${this.moves} moves! You know my skills!`);
    } else {
      this.updateStatus();
    }
  }

  protected getSegments(): GridSegment[] {
    const segments: GridSegment[] = [];
    
    // Title area decoration
    for (let x = 4; x < this.gridWidth - 4; x++) {
      segments.push({ x, y: 4, color: 'var(--accent-color)', opacity: 0.3 });
    }
    
    return segments;
  }

  protected getFood(): GridFood[] {
    const food: GridFood[] = [];
    const cardWidth = 8;
    const cardHeight = 5;
    
    // Title
    food.push({
      x: 4,
      y: 2,
      color: 'var(--accent-color)',
      icon: '🧠',
      label: `Skill Match | Pairs: ${this.matchedPairs}/${this.totalPairs} | Moves: ${this.moves}`,
      labelWidth: 35,
      interactive: false,
    });
    
    // Draw cards
    for (const card of this.cards) {
      const isHovered = this.isCardHovered(card);
      
      if (card.isMatched) {
        // Matched card - show with green
        food.push({
          x: card.x + 1,
          y: card.y + 1,
          color: '#22c55e',
          icon: card.icon,
          label: card.name,
          labelWidth: cardWidth - 2,
          interactive: false,
        });
      } else if (card.isFlipped) {
        // Flipped card - show content
        food.push({
          x: card.x + 1,
          y: card.y + 1,
          color: this.config.primaryColor,
          icon: card.icon,
          label: card.name,
          labelWidth: cardWidth - 2,
          interactive: false,
        });
      } else {
        // Face down card
        food.push({
          x: card.x + 1,
          y: card.y + 1,
          color: isHovered ? 'var(--accent-color)' : 'var(--text-muted)',
          icon: '❓',
          label: 'Click',
          labelWidth: cardWidth - 2,
          interactive: true,
        });
      }
      
      // Card border
      this.drawCardBorder(food, card, isHovered);
    }
    
    // Show matched skill info
    if (this.showingMatchInfo && this.lastMatchedSkill) {
      food.push({
        x: Math.floor(this.gridWidth / 2) - 15,
        y: this.gridHeight - 4,
        color: '#22c55e',
        icon: '✨',
        label: this.lastMatchedSkill,
        labelWidth: 30,
        interactive: false,
      });
    }
    
    return food;
  }

  private isCardHovered(card: Card): boolean {
    const cardWidth = 8;
    const cardHeight = 5;
    return this.cursorPosition.x >= card.x && this.cursorPosition.x < card.x + cardWidth &&
           this.cursorPosition.y >= card.y && this.cursorPosition.y < card.y + cardHeight;
  }

  private drawCardBorder(food: GridFood[], card: Card, isHovered: boolean): void {
    const cardWidth = 8;
    const cardHeight = 5;
    let borderColor = 'var(--border-color)';
    
    if (card.isMatched) {
      borderColor = '#22c55e';
    } else if (card.isFlipped) {
      borderColor = this.config.primaryColor;
    } else if (isHovered) {
      borderColor = 'var(--accent-color)';
    }
    
    // Top and bottom borders
    for (let x = card.x; x < card.x + cardWidth; x++) {
      food.push({
        x,
        y: card.y,
        color: borderColor,
        label: '─',
        labelWidth: 1,
        interactive: false,
      });
      food.push({
        x,
        y: card.y + cardHeight - 1,
        color: borderColor,
        label: '─',
        labelWidth: 1,
        interactive: false,
      });
    }
  }

  private updateStatus(): void {
    if (this.matchedPairs === this.totalPairs) {
      this.setStatus(`🎉 Complete! All ${this.totalPairs} skill pairs matched!`);
    } else if (this.firstCard && !this.secondCard) {
      this.setStatus(`${this.firstCard.icon} ${this.firstCard.name} - Find the match!`);
    } else {
      this.setStatus(`🃏 Click cards to flip | Find matching skill pairs`);
    }
  }
}

export function createMemoryGame(config?: Partial<MemoryGameConfig>) {
  return new MemoryGame(config);
}
