'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

interface Wire {
  id: string;
  color: string;
}

interface WiresModuleProps {
  wires: Wire[];
  correctWireIndex: number;
  onSolve: () => void;
  onStrike: () => void;
}

const colorClasses: Record<string, string> = {
  red: 'bg-red-600 border-red-400',
  blue: 'bg-blue-600 border-blue-400',
  yellow: 'bg-yellow-500 border-yellow-300',
  green: 'bg-green-600 border-green-400',
  white: 'bg-white border-gray-300',
  black: 'bg-gray-900 border-gray-700',
};

export function WiresModule({ wires, correctWireIndex, onSolve, onStrike }: WiresModuleProps) {
  const [cutWires, setCutWires] = useState<Set<string>>(new Set());
  const [isSolved, setIsSolved] = useState(false);

  const handleCutWire = (wireId: string, index: number) => {
    if (isSolved || cutWires.has(wireId)) return;

    const newCutWires = new Set(cutWires);
    newCutWires.add(wireId);
    setCutWires(newCutWires);

    if (index === correctWireIndex) {
      setIsSolved(true);
      setTimeout(() => onSolve(), 500);
    } else {
      onStrike();
    }
  };

  // Use the provided correctWireIndex from config
  const correctIndex = correctWireIndex;

  return (
    <div className="bg-gray-900 border-4 border-gray-700 rounded-lg p-6">
      <h3 className="text-white font-mono text-xl mb-4 text-center">WIRES MODULE</h3>
      
      <div className="space-y-3">
        {wires.map((wire, index) => {
          const isCut = cutWires.has(wire.id);
          const isCorrect = index === correctIndex;
          
          return (
            <motion.button
              key={wire.id}
              onClick={() => handleCutWire(wire.id, index)}
              disabled={isCut || isSolved}
              className={`
                w-full h-12 rounded border-2 relative overflow-hidden
                ${isCut
                  ? 'bg-gray-800 border-gray-600'
                  : colorClasses[wire.color] || 'bg-gray-600'
                }
                ${!isCut && !isSolved ? 'hover:opacity-80 cursor-pointer' : 'cursor-not-allowed'}
              `}
              whileHover={!isCut && !isSolved ? { scale: 1.02 } : {}}
              whileTap={!isCut && !isSolved ? { scale: 0.98 } : {}}
            >
              {isCut && (
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  className="absolute inset-0 bg-black/50 flex items-center justify-center"
                >
                  <span className="text-white font-bold">CUT</span>
                </motion.div>
              )}
              {isSolved && isCorrect && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 bg-green-500/30 flex items-center justify-center"
                >
                  <span className="text-2xl">✓</span>
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>

      <p className="text-gray-400 text-xs mt-4 text-center">
        Cut the correct wire based on the rules
      </p>
    </div>
  );
}
