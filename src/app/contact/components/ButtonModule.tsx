'use client';

import { motion } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';

interface ButtonModuleProps {
  color: string;
  text: string;
  batteryCount: number;
  hasCAR: boolean;
  hasFRK: boolean;
  onSolve: () => void;
  onStrike: () => void;
}

const colorClasses: Record<string, string> = {
  red: 'bg-red-600 border-red-400',
  blue: 'bg-blue-600 border-blue-400',
  yellow: 'bg-yellow-500 border-yellow-300',
  white: 'bg-white border-gray-300',
};

export function ButtonModule({
  color,
  text,
  batteryCount,
  hasCAR,
  hasFRK,
  onSolve,
  onStrike,
}: ButtonModuleProps) {
  const [isHolding, setIsHolding] = useState(false);
  const [holdTime, setHoldTime] = useState(0);
  const [isSolved, setIsSolved] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isHolding && !isSolved) {
      interval = setInterval(() => {
        setHoldTime(prev => prev + 0.1);
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isHolding, isSolved]);

  // Determine if button should be held or pressed based on Keep Talking rules
  const shouldHold = useCallback(() => {
    // Rule 1: If button is blue and says "ABORT", hold and release on 4
    if (color === 'blue' && text === 'ABORT') {
      return { hold: true, releaseTime: 4 };
    }
    
    // Rule 2: If more than 1 battery and says "DETONATE", press immediately
    if (batteryCount > 1 && text === 'DETONATE') {
      return { hold: false, releaseTime: 0 };
    }
    
    // Rule 3: If button is white and has CAR indicator, hold and release on 3
    if (color === 'white' && hasCAR) {
      return { hold: true, releaseTime: 3 };
    }
    
    // Rule 4: If more than 2 batteries and has FRK indicator, press immediately
    if (batteryCount > 2 && hasFRK) {
      return { hold: false, releaseTime: 0 };
    }
    
    // Rule 5: If button is yellow, hold and release on 5
    if (color === 'yellow') {
      return { hold: true, releaseTime: 5 };
    }
    
    // Rule 6: If button is red and says "HOLD", press immediately
    if (color === 'red' && text === 'HOLD') {
      return { hold: false, releaseTime: 0 };
    }
    
    // Default: hold and release on 5
    return { hold: true, releaseTime: 5 };
  }, [color, text, batteryCount, hasCAR, hasFRK]);

  const handlePress = () => {
    if (isSolved) return;
    
    const rule = shouldHold();
    
    if (!rule.hold) {
      // Press immediately
      setIsSolved(true);
      setTimeout(() => onSolve(), 500);
    } else {
      // Start holding
      setIsHolding(true);
      setHoldTime(0);
    }
  };

  const handleRelease = () => {
    if (!isHolding || isSolved) return;
    
    const rule = shouldHold();
    const targetTime = rule.releaseTime;
    const tolerance = 0.3; // 0.3 second tolerance
    
    if (Math.abs(holdTime - targetTime) <= tolerance) {
      setIsSolved(true);
      setTimeout(() => onSolve(), 500);
    } else {
      onStrike();
      setIsHolding(false);
      setHoldTime(0);
    }
  };

  return (
    <div className="bg-gray-900 border-4 border-gray-700 rounded-lg p-6">
      <h3 className="text-white font-mono text-xl mb-4 text-center">BUTTON MODULE</h3>
      
      <div className="space-y-4">
        {/* Indicators */}
        <div className="flex items-center justify-center gap-4 text-sm text-gray-300">
          <div className="flex items-center gap-1">
            <span>🔋</span>
            <span>{batteryCount}</span>
          </div>
          {hasCAR && <div className="px-2 py-1 bg-blue-900 rounded">CAR</div>}
          {hasFRK && <div className="px-2 py-1 bg-purple-900 rounded">FRK</div>}
        </div>

        {/* Button */}
        <div className="flex justify-center">
          <motion.button
            onMouseDown={handlePress}
            onMouseUp={handleRelease}
            onTouchStart={handlePress}
            onTouchEnd={handleRelease}
            disabled={isSolved}
            className={`
              w-32 h-32 rounded-full border-4 font-mono font-bold text-white text-lg
              ${colorClasses[color] || 'bg-gray-600'}
              ${isHolding ? 'ring-4 ring-yellow-400' : ''}
              ${!isSolved ? 'cursor-pointer active:scale-95' : 'cursor-not-allowed opacity-50'}
            `}
            animate={isHolding ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 0.5, repeat: isHolding ? Infinity : 0 }}
          >
            {text}
          </motion.button>
        </div>

        {/* Hold Timer */}
        {isHolding && (
          <div className="text-center">
            <div className="text-yellow-400 font-mono text-2xl font-bold">
              {holdTime.toFixed(1)}s
            </div>
            <div className="text-gray-400 text-xs mt-1">
              Hold and release at the correct time
            </div>
          </div>
        )}

        {isSolved && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center text-green-400 text-2xl"
          >
            ✓ SOLVED
          </motion.div>
        )}
      </div>
    </div>
  );
}
