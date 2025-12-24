'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

interface SymbolsModuleProps {
  symbols: string[];
  correctSymbol: string;
  onSolve: () => void;
  onStrike: () => void;
}

export function SymbolsModule({ symbols, correctSymbol, onSolve, onStrike }: SymbolsModuleProps) {
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const [isSolved, setIsSolved] = useState(false);

  const handleSelectSymbol = (symbol: string) => {
    if (isSolved) return;
    
    setSelectedSymbol(symbol);
    
    if (symbol === correctSymbol) {
      setIsSolved(true);
      setTimeout(() => onSolve(), 500);
    } else {
      onStrike();
      setTimeout(() => setSelectedSymbol(null), 1000);
    }
  };

  return (
    <div className="bg-gray-900 border-4 border-gray-700 rounded-lg p-6">
      <h3 className="text-white font-mono text-xl mb-4 text-center">SYMBOLS MODULE</h3>
      
      <div className="grid grid-cols-3 gap-3">
        {symbols.map((symbol, index) => {
          const isSelected = selectedSymbol === symbol;
          const isCorrect = symbol === correctSymbol;
          
          return (
            <motion.button
              key={index}
              onClick={() => handleSelectSymbol(symbol)}
              disabled={isSolved}
              className={`
                aspect-square rounded border-2 text-4xl font-bold
                ${isSelected && isCorrect
                  ? 'bg-green-600 border-green-400 text-white'
                  : isSelected && !isCorrect
                  ? 'bg-red-600 border-red-400 text-white'
                  : 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700'
                }
                ${!isSolved ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}
              `}
              whileHover={!isSolved ? { scale: 1.05 } : {}}
              whileTap={!isSolved ? { scale: 0.95 } : {}}
            >
              {symbol}
            </motion.button>
          );
        })}
      </div>

      {isSolved && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-green-400 text-lg mt-4"
        >
          ✓ Correct symbol selected!
        </motion.div>
      )}

      <p className="text-gray-400 text-xs mt-4 text-center">
        Select the symbol that appears in the manual
      </p>
    </div>
  );
}
