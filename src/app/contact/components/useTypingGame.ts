"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface TypingGameState {
  isActive: boolean;
  isCompleted: boolean;
  isFailed: boolean;
  targetText: string;
  typedText: string;
  currentIndex: number;
  errors: number;
  startTime: number | null;
  endTime: number | null;
  wpm: number;
  cps: number; // characters per second
  accuracy: number;
  timeElapsed: number;
}

interface UseTypingGameProps {
  targetText: string;
  minAccuracy?: number; // Minimum accuracy to pass (default 90%)
  onComplete?: (stats: { wpm: number; cps: number; accuracy: number; time: number }) => void;
  onFail?: () => void;
}

const DEFAULT_MIN_ACCURACY = 85;

export function useTypingGame({
  targetText,
  minAccuracy = DEFAULT_MIN_ACCURACY,
  onComplete,
  onFail,
}: UseTypingGameProps) {
  const timerRef = useRef<number | null>(null);
  
  const [gameState, setGameState] = useState<TypingGameState>({
    isActive: false,
    isCompleted: false,
    isFailed: false,
    targetText,
    typedText: "",
    currentIndex: 0,
    errors: 0,
    startTime: null,
    endTime: null,
    wpm: 0,
    cps: 0,
    accuracy: 100,
    timeElapsed: 0,
  });

  // Update target text if it changes
  useEffect(() => {
    setGameState(prev => ({
      ...prev,
      targetText,
    }));
  }, [targetText]);

  // Timer for elapsed time and live WPM calculation
  useEffect(() => {
    if (gameState.isActive && gameState.startTime && !gameState.isCompleted && !gameState.isFailed) {
      timerRef.current = window.setInterval(() => {
        setGameState(prev => {
          const elapsed = (Date.now() - (prev.startTime || Date.now())) / 1000;
          const minutes = elapsed / 60;
          const wordsTyped = prev.typedText.length / 5; // Standard: 5 chars = 1 word
          const currentWpm = minutes > 0 ? Math.round(wordsTyped / minutes) : 0;
          const currentCps = elapsed > 0 ? Math.round((prev.typedText.length / elapsed) * 10) / 10 : 0;
          
          return {
            ...prev,
            timeElapsed: elapsed,
            wpm: currentWpm,
            cps: currentCps,
          };
        });
      }, 100);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [gameState.isActive, gameState.startTime, gameState.isCompleted, gameState.isFailed]);

  // Start the game
  const startGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      isActive: true,
      isCompleted: false,
      isFailed: false,
      typedText: "",
      currentIndex: 0,
      errors: 0,
      startTime: null,
      endTime: null,
      wpm: 0,
      cps: 0,
      accuracy: 100,
      timeElapsed: 0,
    }));
  }, []);

  // Handle key press
  const handleKeyPress = useCallback((key: string) => {
    setGameState(prev => {
      if (!prev.isActive || prev.isCompleted || prev.isFailed) {
        return prev;
      }

      // Start timer on first keypress
      const startTime = prev.startTime || Date.now();
      
      // Get expected character
      const expectedChar = prev.targetText[prev.currentIndex];
      
      // Handle backspace
      if (key === "Backspace") {
        if (prev.currentIndex > 0) {
          return {
            ...prev,
            startTime,
            typedText: prev.typedText.slice(0, -1),
            currentIndex: prev.currentIndex - 1,
          };
        }
        return { ...prev, startTime };
      }

      // Ignore other special keys
      if (key.length > 1 && key !== "Backspace") {
        return { ...prev, startTime };
      }

      // Check if correct
      const isCorrect = key === expectedChar;
      const newErrors = isCorrect ? prev.errors : prev.errors + 1;
      const newTypedText = prev.typedText + key;
      const newIndex = prev.currentIndex + 1;
      
      // Calculate accuracy
      const totalAttempts = newIndex;
      const correctChars = totalAttempts - newErrors;
      const newAccuracy = totalAttempts > 0 ? Math.round((correctChars / totalAttempts) * 100) : 100;

      // Check if completed
      const isCompleted = newIndex >= prev.targetText.length;
      
      if (isCompleted) {
        const endTime = Date.now();
        const elapsed = (endTime - startTime) / 1000;
        const minutes = elapsed / 60;
        const wordsTyped = newTypedText.length / 5;
        const finalWpm = minutes > 0 ? Math.round(wordsTyped / minutes) : 0;
        const finalCps = elapsed > 0 ? Math.round((newTypedText.length / elapsed) * 10) / 10 : 0;
        
        // Check if passed
        if (newAccuracy >= minAccuracy) {
          onComplete?.({ wpm: finalWpm, cps: finalCps, accuracy: newAccuracy, time: elapsed });
          return {
            ...prev,
            startTime,
            endTime,
            typedText: newTypedText,
            currentIndex: newIndex,
            errors: newErrors,
            accuracy: newAccuracy,
            isCompleted: true,
            wpm: finalWpm,
            cps: finalCps,
            timeElapsed: elapsed,
          };
        } else {
          onFail?.();
          return {
            ...prev,
            startTime,
            endTime,
            typedText: newTypedText,
            currentIndex: newIndex,
            errors: newErrors,
            accuracy: newAccuracy,
            isFailed: true,
            wpm: finalWpm,
            cps: finalCps,
            timeElapsed: elapsed,
          };
        }
      }

      return {
        ...prev,
        startTime,
        typedText: newTypedText,
        currentIndex: newIndex,
        errors: newErrors,
        accuracy: newAccuracy,
      };
    });
  }, [minAccuracy, onComplete, onFail]);

  // Reset the game
  const resetGame = useCallback(() => {
    setGameState({
      isActive: false,
      isCompleted: false,
      isFailed: false,
      targetText,
      typedText: "",
      currentIndex: 0,
      errors: 0,
      startTime: null,
      endTime: null,
      wpm: 0,
      cps: 0,
      accuracy: 100,
      timeElapsed: 0,
    });
  }, [targetText]);

  return {
    gameState,
    startGame,
    handleKeyPress,
    resetGame,
  };
}
