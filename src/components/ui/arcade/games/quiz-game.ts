/**
 * Developer Quiz Game
 *
 * Answer questions about Arun to earn points!
 * Multiple choice questions about skills, experience, interests.
 * Each correct answer reveals more about the developer.
 */

import { BaseGridGame } from '../base-grid-game';
import type { BaseGameConfig } from '../base-grid-game';
import type { GridCell, GridSegment, GridFood } from '../types';

export interface QuizGameConfig extends BaseGameConfig {
  questionDuration: number;
  answersPerQuestion: number;
}

export const QUIZ_CONFIG: QuizGameConfig = {
  id: 'quiz',
  label: 'Know Me Quiz',
  description: 'How well do you know me? Answer questions to find out!',
  primaryColor: '#8b5cf6',
  secondaryColor: '#06b6d4',
  scoreLabel: 'Correct',
  questionDuration: 15000,
  answersPerQuestion: 4,
};

interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  funFact: string;
  category: 'work' | 'skills' | 'personal' | 'projects';
  icon: string;
}

// Questions about Arun
const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    question: 'Where do I currently work?',
    options: ['Google', 'HP Inc.', 'Microsoft', 'Amazon'],
    correct: 1,
    funFact: 'Been at HP since 2023, working on Print AI Observability!',
    category: 'work',
    icon: '🖨️',
  },
  {
    question: 'What role am I in?',
    options: ['Designer', 'SDE-1', 'Manager', 'DevOps'],
    correct: 1,
    funFact: 'Software Development Engineer - Full Stack focus!',
    category: 'work',
    icon: '💻',
  },
  {
    question: 'Which city am I based in?',
    options: ['Chennai', 'Delhi', 'Bangalore', 'Hyderabad'],
    correct: 2,
    funFact: 'Bangalore - the startup capital of India!',
    category: 'personal',
    icon: '📍',
  },
  {
    question: 'What framework powers this portfolio?',
    options: ['Vue.js', 'Angular', 'Next.js', 'Svelte'],
    correct: 2,
    funFact: 'Next.js 15 with React 19 - bleeding edge!',
    category: 'skills',
    icon: '⚛️',
  },
  {
    question: 'Which backend framework do I use at HP?',
    options: ['Django', 'Express', 'Spring Boot', 'Laravel'],
    correct: 2,
    funFact: 'Spring Boot with Java for enterprise-grade microservices!',
    category: 'skills',
    icon: '🌱',
  },
  {
    question: 'What AI topic am I working on?',
    options: ['Chatbots', 'Observability', 'Gaming AI', 'Robotics'],
    correct: 1,
    funFact: 'Print AI Observability - making printer AI smarter!',
    category: 'work',
    icon: '🤖',
  },
  {
    question: 'Which design system did I create?',
    options: ['Material UI', 'Squarebridge', 'Chakra UI', 'Ant Design'],
    correct: 1,
    funFact: 'Squarebridge - a complete design system for SNS Square!',
    category: 'projects',
    icon: '🎨',
  },
  {
    question: 'What cloud platform do I work with?',
    options: ['Azure', 'GCP', 'AWS', 'Digital Ocean'],
    correct: 2,
    funFact: 'AWS for cloud infrastructure and services!',
    category: 'skills',
    icon: '☁️',
  },
  {
    question: 'Which creative tool am I skilled in?',
    options: ['Canva', 'Figma', 'Sketch', 'InVision'],
    correct: 1,
    funFact: 'Figma wizard - from wireframes to pixel-perfect designs!',
    category: 'skills',
    icon: '🖌️',
  },
  {
    question: 'What was my college major?',
    options: ['IT', 'CSE', 'ECE', 'AI&ML'],
    correct: 1,
    funFact: 'B.Tech Computer Science Engineering!',
    category: 'personal',
    icon: '🎓',
  },
  {
    question: 'Which gamified app did I design?',
    options: ['Duolingo', 'PeopleGamez', 'Habitica', 'Fortnite'],
    correct: 1,
    funFact: 'PeopleGamez - gamified HR & recruitment platform!',
    category: 'projects',
    icon: '🎮',
  },
  {
    question: 'What motion design tool do I use?',
    options: ['Premiere Pro', 'After Effects', 'DaVinci', 'Final Cut'],
    correct: 1,
    funFact: 'After Effects for motion graphics and animations!',
    category: 'skills',
    icon: '🎬',
  },
];

export class QuizGame extends BaseGridGame {
  readonly id = QUIZ_CONFIG.id;
  readonly label = QUIZ_CONFIG.label;
  readonly description = QUIZ_CONFIG.description;

  private config: QuizGameConfig;
  private currentQuestion: QuizQuestion | null = null;
  private questionIndex = 0;
  private selectedOption: number | null = null;
  private questionTimer = 0;
  private showingResult = false;
  private resultTimer = 0;
  private isCorrect = false;
  private shuffledQuestions: QuizQuestion[] = [];
  private answeredCount = 0;
  private correctCount = 0;
  private cursorPosition: GridCell = { x: 0, y: 0 };

  constructor(config: Partial<QuizGameConfig> = {}) {
    super();
    this.config = { ...QUIZ_CONFIG, ...config };
  }

  protected onReset(): void {
    // Shuffle questions
    this.shuffledQuestions = [...QUIZ_QUESTIONS]
      .sort(() => Math.random() - 0.5)
      .slice(0, 8); // Show 8 random questions per game
    
    this.questionIndex = 0;
    this.answeredCount = 0;
    this.correctCount = 0;
    this.selectedOption = null;
    this.showingResult = false;
    this.resultTimer = 0;
    
    this.loadQuestion();
  }

  private loadQuestion(): void {
    if (this.questionIndex >= this.shuffledQuestions.length) {
      this.finishQuiz();
      return;
    }
    
    this.currentQuestion = this.shuffledQuestions[this.questionIndex];
    this.questionTimer = this.config.questionDuration;
    this.selectedOption = null;
    this.showingResult = false;
    this.updateStatus();
  }

  protected onUpdate(dt: number): void {
    if (this.showingResult) {
      this.resultTimer -= dt;
      if (this.resultTimer <= 0) {
        this.questionIndex++;
        this.loadQuestion();
      }
      return;
    }

    if (this.currentQuestion) {
      this.questionTimer -= dt;
      if (this.questionTimer <= 0) {
        // Time's up - count as wrong
        this.submitAnswer(-1);
      }
    }
  }

  protected onCursorMove(cell: GridCell): void {
    this.cursorPosition = cell;
  }

  protected onCellClick(cell: GridCell): void {
    if (this.showingResult || !this.currentQuestion) return;
    
    // Check which option was clicked
    const optionIndex = this.getOptionAtCell(cell);
    if (optionIndex !== null) {
      this.submitAnswer(optionIndex);
    }
  }

  private getOptionAtCell(cell: GridCell): number | null {
    const optionHeight = 4;
    const startY = 12;
    const optionWidth = Math.floor(this.gridWidth / 2) - 4;
    
    for (let i = 0; i < 4; i++) {
      const row = Math.floor(i / 2);
      const col = i % 2;
      const optX = col === 0 ? 4 : Math.floor(this.gridWidth / 2) + 2;
      const optY = startY + row * (optionHeight + 2);
      
      if (cell.x >= optX && cell.x < optX + optionWidth &&
          cell.y >= optY && cell.y < optY + optionHeight) {
        return i;
      }
    }
    return null;
  }

  private submitAnswer(optionIndex: number): void {
    if (!this.currentQuestion) return;
    
    this.selectedOption = optionIndex;
    this.isCorrect = optionIndex === this.currentQuestion.correct;
    this.showingResult = true;
    this.resultTimer = 3000;
    this.answeredCount++;
    
    if (this.isCorrect) {
      this.correctCount++;
      this.addScore(1);
    }
    
    this.updateStatus();
  }

  private finishQuiz(): void {
    const percentage = Math.round((this.correctCount / this.shuffledQuestions.length) * 100);
    let message: string;
    
    if (percentage >= 80) {
      message = '🏆 Amazing! You really know me well!';
    } else if (percentage >= 60) {
      message = '⭐ Great job! You learned a lot about me!';
    } else if (percentage >= 40) {
      message = '👍 Good try! Explore more to learn about me!';
    } else {
      message = '🎮 Keep playing to discover more about me!';
    }
    
    this.setStatus(`${message} Score: ${this.correctCount}/${this.shuffledQuestions.length}`);
    this.currentQuestion = null;
  }

  protected getSegments(): GridSegment[] {
    const segments: GridSegment[] = [];
    
    // Decorative border
    for (let x = 2; x < this.gridWidth - 2; x++) {
      segments.push({ x, y: 2, color: 'var(--accent-color)', opacity: 0.3 });
      segments.push({ x, y: this.gridHeight - 3, color: 'var(--accent-color)', opacity: 0.3 });
    }
    
    return segments;
  }

  protected getFood(): GridFood[] {
    const food: GridFood[] = [];
    
    if (!this.currentQuestion) {
      // Game over state
      food.push({
        x: Math.floor(this.gridWidth / 2) - 8,
        y: Math.floor(this.gridHeight / 2) - 2,
        color: '#22c55e',
        icon: '🏆',
        label: `Quiz Complete! ${this.correctCount}/${this.shuffledQuestions.length}`,
        labelWidth: 20,
        interactive: false,
      });
      return food;
    }
    
    // Timer bar
    const timerProgress = this.questionTimer / this.config.questionDuration;
    const timerWidth = Math.floor((this.gridWidth - 8) * timerProgress);
    food.push({
      x: 4,
      y: 4,
      color: timerProgress > 0.3 ? '#22c55e' : '#ef4444',
      label: ''.padEnd(timerWidth, '█'),
      labelWidth: timerWidth,
      interactive: false,
    });
    
    // Question number and category
    food.push({
      x: 4,
      y: 6,
      color: 'var(--text-muted)',
      icon: this.currentQuestion.icon,
      label: `Q${this.questionIndex + 1}/${this.shuffledQuestions.length}`,
      labelWidth: 8,
      interactive: false,
    });
    
    // Question text
    const questionLines = this.wrapText(this.currentQuestion.question, 40);
    questionLines.forEach((line, i) => {
      food.push({
        x: 4,
        y: 8 + i,
        color: 'var(--text-color)',
        label: line,
        labelWidth: Math.ceil(line.length / 1.5) + 1,
        interactive: false,
      });
    });
    
    // Options in 2x2 grid
    const optionLabels = ['A', 'B', 'C', 'D'];
    const startY = 12;
    const optionHeight = 3;
    
    for (let i = 0; i < this.currentQuestion.options.length; i++) {
      const row = Math.floor(i / 2);
      const col = i % 2;
      const optX = col === 0 ? 4 : Math.floor(this.gridWidth / 2) + 2;
      const optY = startY + row * (optionHeight + 2);
      
      let optColor = 'var(--text-color)';
      let optIcon = optionLabels[i];
      
      if (this.showingResult) {
        if (i === this.currentQuestion.correct) {
          optColor = '#22c55e';
          optIcon = '✓';
        } else if (i === this.selectedOption && !this.isCorrect) {
          optColor = '#ef4444';
          optIcon = '✗';
        }
      } else {
        // Highlight on hover
        const hoveredOption = this.getOptionAtCell(this.cursorPosition);
        if (hoveredOption === i) {
          optColor = 'var(--accent-color)';
        }
      }
      
      food.push({
        x: optX,
        y: optY,
        color: optColor,
        icon: optIcon,
        label: this.currentQuestion.options[i],
        labelWidth: Math.min(18, this.currentQuestion.options[i].length + 3),
        interactive: !this.showingResult,
      });
    }
    
    // Show fun fact after answering
    if (this.showingResult) {
      const factLines = this.wrapText(this.currentQuestion.funFact, 45);
      food.push({
        x: 4,
        y: startY + 10,
        color: this.isCorrect ? '#22c55e' : '#f97316',
        icon: this.isCorrect ? '💡' : '📚',
        label: this.isCorrect ? 'Fun Fact:' : 'Learn:',
        labelWidth: 10,
        interactive: false,
      });
      factLines.forEach((line, i) => {
        food.push({
          x: 4,
          y: startY + 12 + i,
          color: 'var(--text-muted)',
          label: line,
          labelWidth: Math.ceil(line.length / 1.5) + 1,
          interactive: false,
        });
      });
    }
    
    return food;
  }

  private wrapText(text: string, maxChars: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';
    
    for (const word of words) {
      if ((currentLine + ' ' + word).trim().length <= maxChars) {
        currentLine = (currentLine + ' ' + word).trim();
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    }
    if (currentLine) lines.push(currentLine);
    
    return lines;
  }

  private updateStatus(): void {
    if (!this.currentQuestion) return;
    
    if (this.showingResult) {
      this.setStatus(this.isCorrect ? '✅ Correct!' : `❌ Nope! It was: ${this.currentQuestion.options[this.currentQuestion.correct]}`);
    } else {
      const seconds = Math.ceil(this.questionTimer / 1000);
      this.setStatus(`⏱️ ${seconds}s | Click an answer | ${this.currentQuestion.icon} ${this.currentQuestion.category}`);
    }
  }
}

export function createQuizGame(config?: Partial<QuizGameConfig>) {
  return new QuizGame(config);
}
