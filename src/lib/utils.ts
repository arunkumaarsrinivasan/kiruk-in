import { twMerge } from 'tailwind-merge';
import clsx, { ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Grid utilities shared across interactive components
export const GRID_SIZE = 20;
export type GridSnapMode = 'edge' | 'center';

export function snapToGrid(value: number, gridSize: number = GRID_SIZE, mode: GridSnapMode = 'edge') {
  const offset = mode === 'center' ? gridSize / 2 : 0;
  return Math.round((value - offset) / gridSize) * gridSize + offset;
}

export function snapPositionToGrid(
  position: { x: number; y: number },
  gridSize: number = GRID_SIZE,
  mode: GridSnapMode = 'edge'
) {
  return {
    x: snapToGrid(position.x, gridSize, mode),
    y: snapToGrid(position.y, gridSize, mode)
  };
}

// Animation utilities
export const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
};

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.5, ease: "easeOut" }
};

// Three.js utilities
export function generateScribblePoints(count: number, baseX: number, baseY: number) {
  const points = [];
  for (let i = 0; i <= count; i++) {
    const t = i / count;
    const x = baseX + Math.cos(t * Math.PI * 2) * (1 + Math.random() * 0.5);
    const y = baseY + Math.sin(t * Math.PI * 2) * (1 + Math.random() * 0.5);
    const z = (Math.random() - 0.5) * 0.5;
    
    // Add jitter to make it look hand-drawn
    points.push({
      x: x + (Math.random() - 0.5) * 0.1,
      y: y + (Math.random() - 0.5) * 0.1,
      z: z
    });
  }
  return points;
}

// Form validation
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateContactForm(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!data.name || data.name.trim().length < 2) {
    errors.push("Name must be at least 2 characters long");
  }
  
  if (!data.email || !validateEmail(data.email)) {
    errors.push("Please enter a valid email address");
  }
  
  if (!data.message || data.message.trim().length < 10) {
    errors.push("Message must be at least 10 characters long");
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}
