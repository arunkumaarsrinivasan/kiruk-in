"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface BombModule {
  id: string;
  type: 'email' | 'linkedin' | 'whatsapp' | 'instagram';
  isSolved: boolean;
  isActive: boolean;
  difficulty: number;
  config: any; // Module-specific configuration
  contactInfo: {
    label: string;
    value: string;
    hint: string;
  };
}

export interface BombState {
  isActive: boolean;
  isPaused: boolean;
  isDefused: boolean;
  isExploded: boolean;
  timeRemaining: number;
  modules: BombModule[];
  solvedModules: number;
  strikes: number;
  maxStrikes: number;
  contactFormUnlocked: {
    name: boolean;
    email: boolean;
    message: boolean;
  };
}

interface UseBombDefusalProps {
  gameDuration?: number; // seconds
  onDefused?: () => void;
  onExploded?: () => void;
  onModuleSolved?: (moduleId: string) => void;
  onStrike?: (strikes: number) => void;
}

const INITIAL_GAME_DURATION = 300; // 5 minutes
const MAX_STRIKES = 3;

// Contact information
const CONTACT_INFO = {
  email: {
    label: 'Email',
    value: 'arunkumaar.srinivasan@gmail.com',
    hint: 'My email starts with my first name and last name, followed by @gmail.com',
  },
  linkedin: {
    label: 'LinkedIn',
    value: 'linkedin.com/in/arunkumaarsreenivasan',
    hint: 'Find me on LinkedIn - my profile URL contains my full name',
  },
  whatsapp: {
    label: 'WhatsApp',
    value: '+91-XXXXXXXXXX', // Partial for privacy
    hint: 'WhatsApp me - my number starts with +91 (India country code)',
  },
  instagram: {
    label: 'Instagram',
    value: '@arunum.avan.seyalum', // Personal
    value2: '@kirukism', // Professional
    hint: 'Find my Instagram - personal: arunum.avan.seyalum, professional: kirukism',
  },
};

// Generate modules based on contact methods
function generateModules(): BombModule[] {
  const types: BombModule['type'][] = ['email', 'linkedin', 'whatsapp', 'instagram'];
  const modules: BombModule[] = [];
  
  types.forEach((type, i) => {
    modules.push({
      id: `module-${i}`,
      type,
      isSolved: false,
      isActive: i === 0, // First module is active
      difficulty: i + 1,
      config: generateModuleConfig(type),
      contactInfo: CONTACT_INFO[type],
    });
  });
  
  return modules;
}

function generateModuleConfig(type: BombModule['type']): any {
  switch (type) {
    case 'email':
      // Email puzzle - find the correct email from options
      const emailOptions = [
        'arunkumaar.srinivasan@gmail.com',
        'arun.kumar@gmail.com',
        'arunkumaar@gmail.com',
        'arunkumaar.s@gmail.com',
      ];
      return {
        options: emailOptions,
        correctIndex: 0,
        puzzle: 'Select the correct email address',
      };
    case 'linkedin':
      // LinkedIn puzzle - match the profile URL
      const linkedinOptions = [
        'linkedin.com/in/arunkumaarsreenivasan',
        'linkedin.com/in/arunkumaar',
        'linkedin.com/in/arun-kumar',
        'linkedin.com/in/arunkumaar-srinivasan',
      ];
      return {
        options: linkedinOptions,
        correctIndex: 0,
        puzzle: 'Find my LinkedIn profile URL',
      };
    case 'whatsapp':
      // WhatsApp puzzle - country code and format
      return {
        countryCode: '+91',
        format: 'XX-XXXXXXXXXX',
        puzzle: 'Enter the correct WhatsApp number format',
        correctAnswer: '+91',
      };
    case 'instagram':
      // Instagram puzzle - find the handle (personal or professional)
      const instagramOptions = ['@arunum.avan.seyalum', '@kirukism', '@arunkumaar', '@kiruk_in'];
      return {
        options: instagramOptions,
        correctIndices: [0, 1], // Both personal and professional are correct
        puzzle: 'Find my Instagram handle (personal or professional)',
      };
    default:
      return {};
  }
}

export function useBombDefusal({
  gameDuration = INITIAL_GAME_DURATION,
  onDefused,
  onExploded,
  onModuleSolved,
  onStrike,
}: UseBombDefusalProps) {
  const gameLoopRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  
  const [bombState, setBombState] = useState<BombState>({
    isActive: false,
    isPaused: false,
    isDefused: false,
    isExploded: false,
    timeRemaining: gameDuration,
    modules: generateModules(),
    solvedModules: 0,
    strikes: 0,
    maxStrikes: MAX_STRIKES,
    contactFormUnlocked: {
      name: false,
      email: false,
      message: false,
    },
  });

  // Unlock contact form fields as modules are solved
  useEffect(() => {
    const solvedCount = bombState.solvedModules;
    setBombState(prev => ({
      ...prev,
      contactFormUnlocked: {
        name: solvedCount >= 1,
        email: solvedCount >= 2,
        message: solvedCount >= 3,
      },
    }));
  }, [bombState.solvedModules]);

  // Start the bomb
  const startBomb = useCallback(() => {
    setBombState(prev => ({
      ...prev,
      isActive: true,
      isPaused: false,
      timeRemaining: gameDuration,
    }));
  }, [gameDuration]);

  // Pause/Resume
  const togglePause = useCallback(() => {
    setBombState(prev => ({
      ...prev,
      isPaused: !prev.isPaused,
    }));
  }, []);

  // Solve a module
  const solveModule = useCallback((moduleId: string) => {
    setBombState(prev => {
      const updatedModules = prev.modules.map(m => {
        if (m.id === moduleId) {
          return { ...m, isSolved: true, isActive: false };
        }
        return m;
      });

      // Activate next unsolved module
      const nextModule = updatedModules.find(m => !m.isSolved && !m.isActive);
      if (nextModule) {
        nextModule.isActive = true;
      }

      const solvedCount = updatedModules.filter(m => m.isSolved).length;
      onModuleSolved?.(moduleId);

      return {
        ...prev,
        modules: updatedModules,
        solvedModules: solvedCount,
      };
    });
  }, [onModuleSolved]);

  // Add a strike
  const addStrike = useCallback(() => {
    setBombState(prev => {
      const newStrikes = prev.strikes + 1;
      onStrike?.(newStrikes);
      
      if (newStrikes >= prev.maxStrikes) {
        // Explode!
        onExploded?.();
        return {
          ...prev,
          strikes: newStrikes,
          isExploded: true,
          isActive: false,
        };
      }
      
      return {
        ...prev,
        strikes: newStrikes,
      };
    });
  }, [onStrike, onExploded]);

  // Defuse the bomb (all modules solved)
  const defuseBomb = useCallback(() => {
    setBombState(prev => {
      if (prev.modules.every(m => m.isSolved)) {
        onDefused?.();
        return {
          ...prev,
          isDefused: true,
          isActive: false,
        };
      }
      return prev;
    });
  }, [onDefused]);

  // Reset bomb
  const resetBomb = useCallback(() => {
    setBombState({
      isActive: false,
      isPaused: false,
      isDefused: false,
      isExploded: false,
      timeRemaining: gameDuration,
      modules: generateModules(),
      solvedModules: 0,
      strikes: 0,
      maxStrikes: MAX_STRIKES,
      contactFormUnlocked: {
        name: false,
        email: false,
        message: false,
      },
    });
  }, [gameDuration]);

  // Game loop
  useEffect(() => {
    if (!bombState.isActive || bombState.isPaused || bombState.isDefused || bombState.isExploded) {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
      return;
    }
    
    const gameLoop = (timestamp: number) => {
      const deltaTime = Math.min((timestamp - lastTimeRef.current) / 1000, 0.1);
      lastTimeRef.current = timestamp;
      
      setBombState(prev => {
        const newTimeRemaining = Math.max(0, prev.timeRemaining - deltaTime);
        
        // Check if time ran out
        if (newTimeRemaining <= 0 && !prev.isExploded) {
          onExploded?.();
          return {
            ...prev,
            timeRemaining: 0,
            isExploded: true,
            isActive: false,
          };
        }
        
        // Don't auto-defuse - the bomb should keep ticking until form is submitted
        // The form will call defuseBomb() when submitted
        
        return {
          ...prev,
          timeRemaining: newTimeRemaining,
        };
      });
      
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };
    
    gameLoopRef.current = requestAnimationFrame(gameLoop);
    
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [bombState.isActive, bombState.isPaused, bombState.isDefused, bombState.isExploded, onExploded, defuseBomb]);

  return {
    bombState,
    startBomb,
    togglePause,
    solveModule,
    addStrike,
    defuseBomb,
    resetBomb,
  };
}
