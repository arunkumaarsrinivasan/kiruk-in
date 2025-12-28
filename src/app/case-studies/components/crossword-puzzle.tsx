'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PixelIcon } from '@/components/ui/PixelIcon';

type Cell = {
  letter: string | null;
  hintLetter: string | null; // Pre-filled hint letter
  isFilled: boolean;
  isActive: boolean;
  clueNumber?: number;
  isAcross?: boolean;
  isDown?: boolean;
  row: number;
  col: number;
};

type Clue = {
  number: number;
  direction: 'across' | 'down';
  text: string;
  answer: string;
  startRow: number;
  startCol: number;
  hintIndices?: number[]; // Which positions to show as hints
};

type CrosswordPuzzleProps = {
  onComplete: () => void;
};

// Redesigned crossword with proper intersecting words
// Words actually cross each other at shared letters
const crosswordData = {
  // 12x12 grid with proper intersections
  grid: [
    // Row 0: B E H A N C E (1-Across)
    ['B', 'E', 'H', 'A', 'N', 'C', 'E', null, null, null, null, null],
    // Row 1: Empty
    [null, null, null, null, null, null, null, null, null, null, null, null],
    // Row 2: P L A Y B O O K (2-Across)
    ['P', 'L', 'A', 'Y', 'B', 'O', 'O', 'K', null, null, null, null],
    // Row 3: Empty
    [null, null, null, null, null, null, null, null, null, null, null, null],
    // Row 4: G I T H U B (3-Across)
    ['G', 'I', 'T', 'H', 'U', 'B', null, null, null, null, null, null],
    // Row 5: Empty
    [null, null, null, null, null, null, null, null, null, null, null, null],
    // Row 6: C O D E P E N (4-Across)
    ['C', 'O', 'D', 'E', 'P', 'E', 'N', null, null, null, null, null],
    // Row 7: Empty
    [null, null, null, null, null, null, null, null, null, null, null, null],
    // Row 8: F I G M A (5-Across)
    ['F', 'I', 'G', 'M', 'A', null, null, null, null, null, null, null],
    // Row 9: Empty
    [null, null, null, null, null, null, null, null, null, null, null, null],
    // Row 10: Empty
    [null, null, null, null, null, null, null, null, null, null, null, null],
    // Row 11: Empty
    [null, null, null, null, null, null, null, null, null, null, null, null],
  ],
  clues: [
    // Across clues only
    { 
      number: 1, 
      direction: 'across' as const, 
      text: 'Adobe portfolio platform', 
      answer: 'BEHANCE', 
      startRow: 0, 
      startCol: 0,
      hintIndices: [0, 3, 6], // B, A, E
    },
    { 
      number: 2, 
      direction: 'across' as const, 
      text: 'Quick project snapshots platform', 
      answer: 'PLAYBOOK', 
      startRow: 2, 
      startCol: 0,
      hintIndices: [0, 4, 7], // P, B, K
    },
    { 
      number: 3, 
      direction: 'across' as const, 
      text: 'Code repository platform', 
      answer: 'GITHUB', 
      startRow: 4, 
      startCol: 0,
      hintIndices: [0, 3, 5], // G, H, B
    },
    { 
      number: 4, 
      direction: 'across' as const, 
      text: 'Frontend code playground', 
      answer: 'CODEPEN', 
      startRow: 6, 
      startCol: 0,
      hintIndices: [0, 3, 6], // C, E, N
    },
    { 
      number: 5, 
      direction: 'across' as const, 
      text: 'Design tool for prototypes', 
      answer: 'FIGMA', 
      startRow: 8, 
      startCol: 0,
      hintIndices: [0, 2, 4], // F, G, A
    },
  ],
};

export function CrosswordPuzzle({ onComplete }: CrosswordPuzzleProps) {
  const [grid, setGrid] = useState<Cell[][]>(() => {
    // Initialize grid with empty cells and hint letters
    const rows = 12;
    const cols = 12;
    const initialGrid: Cell[][] = [];
    
    for (let row = 0; row < rows; row++) {
      initialGrid[row] = [];
      for (let col = 0; col < cols; col++) {
        const letter = crosswordData.grid[row]?.[col] || null;
        initialGrid[row][col] = {
          letter: null,
          hintLetter: null,
          isFilled: letter !== null,
          isActive: false,
          row,
          col,
        };
      }
    }
    
    // Mark clue numbers and set hint letters
    crosswordData.clues.forEach((clue) => {
      if (initialGrid[clue.startRow]?.[clue.startCol]) {
        initialGrid[clue.startRow][clue.startCol].clueNumber = clue.number;
        initialGrid[clue.startRow][clue.startCol].isAcross = true; // All clues are across now
        initialGrid[clue.startRow][clue.startCol].isDown = false;
        
        // Set hint letters (pre-fill about half)
        if (clue.hintIndices) {
          clue.hintIndices.forEach((index) => {
            let hintRow = clue.startRow;
            let hintCol = clue.startCol;
            
            if (clue.direction === 'across') {
              hintCol += index;
            } else {
              hintRow += index;
            }
            
            if (initialGrid[hintRow]?.[hintCol] && initialGrid[hintRow][hintCol].isFilled) {
              initialGrid[hintRow][hintCol].hintLetter = clue.answer[index];
              initialGrid[hintRow][hintCol].letter = clue.answer[index]; // Pre-fill hints
            }
          });
        }
      }
    });
    
    return initialGrid;
  });

  const [activeClue, setActiveClue] = useState<Clue | null>(crosswordData.clues[0]);
  const [_activeDirection, setActiveDirection] = useState<'across' | 'down'>('across');
  const [isComplete, setIsComplete] = useState(false);
  const [revealedClues, setRevealedClues] = useState<Set<string>>(new Set());
  const [activeCell, setActiveCell] = useState<{ row: number; col: number } | null>(null);
  const cellRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  // Get current answer from grid
  const getCurrentAnswer = useCallback((clue: Clue) => {
    let answer = '';
    for (let i = 0; i < clue.answer.length; i++) {
      let row = clue.startRow;
      let col = clue.startCol;
      
      if (clue.direction === 'across') {
        col += i;
      } else {
        row += i;
      }
      
      const cell = grid[row]?.[col];
      if (cell && cell.letter) {
        answer += cell.letter;
      } else {
        answer += ' ';
      }
    }
    return answer.trim();
  }, [grid]);

  // Check if puzzle is complete
  const checkCompletion = useCallback(() => {
    if (isComplete) return; // Already completed
    
    let allCorrect = true;
    
    // Check each clue's answer (only across clues)
    const acrossClues = crosswordData.clues.filter(c => c.direction === 'across');
    
    for (const clue of acrossClues) {
      let currentAnswer = '';
      for (let i = 0; i < clue.answer.length; i++) {
        let row = clue.startRow;
        let col = clue.startCol;
        
        if (clue.direction === 'across') {
          col += i;
        } else {
          row += i;
        }
        
        const cell = grid[row]?.[col];
        if (cell && cell.letter) {
          currentAnswer += cell.letter;
        } else {
          allCorrect = false;
          break;
        }
      }
      
      if (!allCorrect || currentAnswer !== clue.answer) {
        allCorrect = false;
        break;
      }
    }
    
    if (allCorrect) {
      setIsComplete(true);
      setTimeout(() => {
        onComplete();
      }, 1500);
    }
  }, [grid, isComplete, onComplete]);

  // Handle cell input
  const handleCellInput = (row: number, col: number, value: string) => {
    if (!grid[row]?.[col] || !grid[row][col].isFilled) return;
    
    const upperValue = value.toUpperCase().slice(0, 1);
    if (!upperValue) return; // Don't process empty input
    
    const newGrid = grid.map(r => r.map(cell => ({ ...cell })));
    const currentCell = newGrid[row][col];
    
    // If cell already has a letter (hint or user-entered) and it matches what was typed, skip to next
    if (currentCell.letter && currentCell.letter === upperValue) {
      // Same letter typed, skip to next empty cell
      moveToNextEmptyCell(row, col, activeClue);
      return;
    }
    
    // Update the cell with the new letter
    currentCell.letter = upperValue;
    setGrid(newGrid);
    
    // Move to next empty cell (skip filled ones)
    moveToNextEmptyCell(row, col, activeClue);
    
    // Check completion
    checkCompletion();
  };

  // Move to next empty cell in the active clue (skip cells that already have letters)
  const moveToNextEmptyCell = (currentRow: number, currentCol: number, clue: Clue | null) => {
    if (!clue) return;
    
    const direction = clue.direction;
    let currentIndex = -1;
    
    // Find current position in clue
    for (let i = 0; i < clue.answer.length; i++) {
      let clueRow = clue.startRow;
      let clueCol = clue.startCol;
      
      if (direction === 'across') {
        clueCol += i;
      } else {
        clueRow += i;
      }
      
      if (clueRow === currentRow && clueCol === currentCol) {
        currentIndex = i;
        break;
      }
    }
    
    if (currentIndex < 0) return;
    
    // Find next empty cell (skip cells that already have letters - hint or user-entered)
    for (let i = currentIndex + 1; i < clue.answer.length; i++) {
      let nextRow = clue.startRow;
      let nextCol = clue.startCol;
      
      if (direction === 'across') {
        nextCol += i;
      } else {
        nextRow += i;
      }
      
      const nextCell = grid[nextRow]?.[nextCol];
      // Move to next cell that doesn't have a letter (empty cell)
      if (nextCell && nextCell.isFilled && !nextCell.letter) {
        setTimeout(() => {
          const nextCellKey = `${nextRow}-${nextCol}`;
          cellRefs.current[nextCellKey]?.focus();
          setActiveCell({ row: nextRow, col: nextCol });
        }, 50);
        return;
      }
    }
    
    // If all remaining cells are filled, focus stays on current cell
  };

  // Handle cell key down (navigation)
  const handleCellKeyDown = (row: number, col: number, e: React.KeyboardEvent) => {
    if (!activeClue) return;
    
    const direction = activeClue.direction;
    let currentIndex = -1;
    
    // Find current position in clue
    for (let i = 0; i < activeClue.answer.length; i++) {
      let clueRow = activeClue.startRow;
      let clueCol = activeClue.startCol;
      
      if (direction === 'across') {
        clueCol += i;
      } else {
        clueRow += i;
      }
      
      if (clueRow === row && clueCol === col) {
        currentIndex = i;
        break;
      }
    }
    
    if (currentIndex < 0) return;
    
    // Arrow key navigation
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const nextIndex = e.key === 'ArrowRight' 
        ? Math.min(currentIndex + 1, activeClue.answer.length - 1)
        : Math.max(currentIndex - 1, 0);
      
      let nextRow = activeClue.startRow;
      let nextCol = activeClue.startCol;
      
      if (direction === 'across') {
        nextCol += nextIndex;
      } else {
        nextRow += nextIndex;
      }
      
      const nextCellKey = `${nextRow}-${nextCol}`;
      cellRefs.current[nextCellKey]?.focus();
      setActiveCell({ row: nextRow, col: nextCol });
    } else if (e.key === 'Backspace' || e.key === 'Delete') {
      e.preventDefault();
      const newGrid = grid.map(r => r.map(cell => ({ ...cell })));
      if (newGrid[row][col] && !newGrid[row][col].hintLetter) {
        newGrid[row][col].letter = null;
      } else if (newGrid[row][col] && newGrid[row][col].hintLetter) {
        newGrid[row][col].letter = newGrid[row][col].hintLetter;
      }
      setGrid(newGrid);
      
      // Move to previous cell
      if (currentIndex > 0) {
        const prevIndex = currentIndex - 1;
        let prevRow = activeClue.startRow;
        let prevCol = activeClue.startCol;
        
        if (direction === 'across') {
          prevCol += prevIndex;
        } else {
          prevRow += prevIndex;
        }
        
        setTimeout(() => {
          const prevCellKey = `${prevRow}-${prevCol}`;
          cellRefs.current[prevCellKey]?.focus();
          setActiveCell({ row: prevRow, col: prevCol });
        }, 50);
      }
    }
  };

  // Show hint for current clue
  const showHint = () => {
    if (!activeClue) return;
    
    const newGrid = grid.map(row => row.map(cell => ({ ...cell })));
    const direction = activeClue.direction;
    
    // Find first empty cell and fill it with correct letter
    for (let i = 0; i < activeClue.answer.length; i++) {
      let row = activeClue.startRow;
      let col = activeClue.startCol;
      
      if (direction === 'across') {
        col += i;
      } else {
        row += i;
      }
      
      const cell = newGrid[row]?.[col];
      if (cell && cell.isFilled && !cell.letter) {
        cell.letter = activeClue.answer[i];
        setGrid(newGrid);
        
        // Focus on the next empty cell
        for (let j = i + 1; j < activeClue.answer.length; j++) {
          let nextRow = activeClue.startRow;
          let nextCol = activeClue.startCol;
          
          if (direction === 'across') {
            nextCol += j;
          } else {
            nextRow += j;
          }
          
          const nextCell = newGrid[nextRow]?.[nextCol];
          if (nextCell && nextCell.isFilled && !nextCell.letter) {
            setTimeout(() => {
              const nextCellKey = `${nextRow}-${nextCol}`;
              cellRefs.current[nextCellKey]?.focus();
              setActiveCell({ row: nextRow, col: nextCol });
            }, 50);
            break;
          }
        }
        break;
      }
    }
    
    checkCompletion();
  };

  // Reveal entire clue
  const revealClue = () => {
    if (!activeClue) return;
    
    const clueKey = `${activeClue.number}-${activeClue.direction}`;
    if (revealedClues.has(clueKey)) return;
    
    const newGrid = grid.map(row => row.map(cell => ({ ...cell })));
    const direction = activeClue.direction;
    
    // Fill all cells with correct letters
    for (let i = 0; i < activeClue.answer.length; i++) {
      let row = activeClue.startRow;
      let col = activeClue.startCol;
      
      if (direction === 'across') {
        col += i;
      } else {
        row += i;
      }
      
      if (newGrid[row]?.[col] && newGrid[row][col].isFilled) {
        newGrid[row][col].letter = activeClue.answer[i];
      }
    }
    
    setGrid(newGrid);
    setRevealedClues(prev => new Set([...prev, clueKey]));
    checkCompletion();
  };

  // Select clue
  const selectClue = (clue: Clue) => {
    setActiveClue(clue);
    setActiveDirection(clue.direction);
    
    // Focus on first empty cell of the clue (skip pre-filled hint letters)
    for (let i = 0; i < clue.answer.length; i++) {
      let row = clue.startRow;
      let col = clue.startCol;
      
      if (clue.direction === 'across') {
        col += i;
      } else {
        row += i;
      }
      
      const cell = grid[row]?.[col];
      // Find first cell that doesn't have a user-entered letter (even if it has a hint)
      if (cell && cell.isFilled && !cell.letter) {
        const cellKey = `${row}-${col}`;
        setTimeout(() => {
          cellRefs.current[cellKey]?.focus();
          setActiveCell({ row, col });
        }, 50);
        return;
      }
    }
    
    // If all cells are filled, focus on first cell
    const firstCellKey = `${clue.startRow}-${clue.startCol}`;
    setTimeout(() => {
      cellRefs.current[firstCellKey]?.focus();
      setActiveCell({ row: clue.startRow, col: clue.startCol });
    }, 50);
  };

  // Clear current answer
  const clearAnswer = () => {
    if (!activeClue) return;
    
    const newGrid = grid.map(row => row.map(cell => ({ ...cell })));
    const direction = activeClue.direction;
    
    for (let i = 0; i < activeClue.answer.length; i++) {
      let row = activeClue.startRow;
      let col = activeClue.startCol;
      
      if (direction === 'across') {
        col += i;
      } else {
        row += i;
      }
      
      if (newGrid[row]?.[col] && newGrid[row][col].isFilled) {
        // Don't clear hint letters
        if (!newGrid[row][col].hintLetter) {
          newGrid[row][col].letter = null;
        } else {
          newGrid[row][col].letter = newGrid[row][col].hintLetter;
        }
      }
    }
    
    setGrid(newGrid);
    
    // Focus on first cell
    const firstCellKey = `${activeClue.startRow}-${activeClue.startCol}`;
    setTimeout(() => {
      cellRefs.current[firstCellKey]?.focus();
      setActiveCell({ row: activeClue.startRow, col: activeClue.startCol });
    }, 50);
  };

  // Check completion on grid change
  useEffect(() => {
    checkCompletion();
  }, [grid, checkCompletion]);

  // All clues are across now (commented out unused variable)
  // const allClues = crosswordData.clues.filter(c => c.direction === 'across');

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        className="wireframe-border p-6 mb-6"
        style={{
          backgroundColor: 'var(--bg-card)',
          imageRendering: 'pixelated' as any,
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="font-mono text-2xl font-bold uppercase mb-2" style={{ color: 'var(--accent-color)' }}>
          Design Projects Crossword
        </h2>
        <p className="font-mono text-sm" style={{ color: 'var(--text-muted)' }}>
          Fill in the missing letters to unlock the project folders. Words intersect!
        </p>
      </motion.div>

      <div className="grid grid-cols-1 gap-6">
        {/* Crossword Grid */}
        <div>
          <motion.div
            className="wireframe-border p-4"
            style={{
              backgroundColor: 'var(--bg-card)',
              imageRendering: 'pixelated' as any,
            }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            {/* Render each clue with its word below */}
            {crosswordData.clues.map((clue) => {
              const isActive = activeClue?.number === clue.number;
              const currentAnswer = getCurrentAnswer(clue);
              const isAnswered = currentAnswer === clue.answer;
              
              return (
                <div
                  key={`clue-${clue.number}`}
                  className="mb-6"
                >
                  <motion.button
                    type="button"
                    onClick={() => selectClue(clue)}
                    className={`wireframe-border p-3 w-full text-left mb-3 ${
                      isActive ? 'ring-2' : ''
                    }`}
                    style={{
                      backgroundColor: isActive 
                        ? 'var(--accent-color)' 
                        : isAnswered 
                          ? 'var(--bg-main)' 
                          : 'var(--bg-card)',
                      color: isActive 
                        ? 'var(--bg-main)' 
                        : 'var(--text-main)',
                      imageRendering: 'pixelated' as any,
                      outline: isActive ? '2px solid var(--accent-color)' : 'none',
                    }}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm">
                        <span className="font-bold">{clue.number}.</span> {clue.text}
                      </span>
                      <div className="flex items-center gap-2">
                        {isAnswered && <span className="text-sm">✓</span>}
                        {revealedClues.has(`${clue.number}-${clue.direction}`) && <span className="text-sm">🔓</span>}
                      </div>
                    </div>
                  </motion.button>
                  
                  {/* Crossword cells for this clue */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: clue.answer.length }).map((_, i) => {
                      const cellRow = clue.startRow;
                      const cellCol = clue.startCol + i;
                      const cell = grid[cellRow]?.[cellCol];
                      const cellKey = `${cellRow}-${cellCol}`;
                      const isFocused = activeCell?.row === cellRow && activeCell?.col === cellCol;
                      const isActiveCell = activeClue && 
                        clue.number === activeClue.number &&
                        i >= 0 && i < clue.answer.length;
                      
                      if (!cell || !cell.isFilled) return null;
                      
                      return (
                        <div
                          key={cellKey}
                          className={`
                            relative flex items-center justify-center
                            wireframe-border
                            ${isActiveCell ? 'ring-1' : ''}
                            ${isFocused ? 'ring-2' : ''}
                          `}
                          style={{
                            width: '56px',
                            height: '56px',
                            backgroundColor: isFocused
                              ? 'var(--accent-color)'
                              : isActiveCell 
                                ? 'var(--bg-card)' 
                                : cell.letter 
                                  ? 'var(--bg-main)'
                                  : 'var(--bg-card)',
                            color: isFocused
                              ? 'var(--bg-main)'
                              : isActiveCell 
                                ? 'var(--text-main)' 
                                : cell.hintLetter && !cell.letter
                                  ? 'var(--text-muted)'
                                  : 'var(--text-main)',
                            imageRendering: 'pixelated' as any,
                            outline: isFocused 
                              ? '3px solid var(--accent-color)' 
                              : isActiveCell
                                ? '2px solid var(--accent-color)'
                                : 'none',
                            boxShadow: isFocused 
                              ? '0 0 0 2px var(--accent-color), 0 0 12px var(--accent-color)' 
                              : 'none',
                            opacity: cell.hintLetter && !cell.letter ? 0.6 : 1,
                            transform: isFocused ? 'scale(1.05)' : 'scale(1)',
                            transition: 'all 0.2s ease',
                          }}
                          onClick={() => {
                            setActiveCell({ row: cellRow, col: cellCol });
                            setActiveClue(clue);
                            setActiveDirection(clue.direction);
                            cellRefs.current[cellKey]?.focus();
                          }}
                        >
                          <input
                            ref={(el) => {
                              cellRefs.current[cellKey] = el;
                            }}
                            type="text"
                            value={cell.letter || ''}
                            onChange={(e) => handleCellInput(cellRow, cellCol, e.target.value)}
                            onKeyDown={(e) => handleCellKeyDown(cellRow, cellCol, e)}
                            onFocus={() => setActiveCell({ row: cellRow, col: cellCol })}
                            className="w-full h-full text-center font-mono font-bold bg-transparent border-none outline-none cursor-pointer"
                            style={{
                              fontSize: '24px',
                              color: isFocused
                                ? 'var(--bg-main)'
                                : cell.hintLetter && !cell.letter
                                  ? 'var(--text-muted)'
                                  : 'var(--text-main)',
                              imageRendering: 'pixelated' as any,
                            }}
                            maxLength={1}
                            autoComplete="off"
                            spellCheck={false}
                          />
                          {!cell.letter && cell.hintLetter && (
                            <span 
                              className="absolute inset-0 flex items-center justify-center font-mono font-bold pointer-events-none"
                              style={{ 
                                fontSize: '24px',
                                color: 'var(--text-muted)',
                                opacity: 0.4,
                              }}
                            >
                              {cell.hintLetter}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </motion.div>

          {/* Controls */}
          <motion.div
            className="wireframe-border p-4 mt-4"
            style={{
              backgroundColor: 'var(--bg-card)',
              imageRendering: 'pixelated' as any,
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="space-y-3">
              <div>
                <p className="font-mono text-xs uppercase mb-2" style={{ color: 'var(--text-muted)' }}>
                  {activeClue?.number}. {activeClue?.direction.toUpperCase()}: {activeClue?.text}
                </p>
                <p className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
                  Click on cells to type. Use arrow keys to navigate between cells.
                </p>
              </div>
              
              <div className="flex items-center gap-2 flex-wrap">
                <motion.button
                  type="button"
                  onClick={showHint}
                  className="wireframe-border px-4 py-2 font-mono text-xs uppercase"
                  style={{
                    backgroundColor: 'var(--bg-main)',
                    color: 'var(--text-main)',
                    imageRendering: 'pixelated' as any,
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  💡 Hint
                </motion.button>
                <motion.button
                  type="button"
                  onClick={revealClue}
                  className="wireframe-border px-4 py-2 font-mono text-xs uppercase"
                  style={{
                    backgroundColor: 'var(--bg-main)',
                    color: 'var(--text-main)',
                    imageRendering: 'pixelated' as any,
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={revealedClues.has(`${activeClue?.number}-${activeClue?.direction}`)}
                >
                  🔓 Reveal
                </motion.button>
                <motion.button
                  type="button"
                  onClick={clearAnswer}
                  className="wireframe-border px-4 py-2 font-mono text-xs uppercase"
                  style={{
                    backgroundColor: 'var(--bg-main)',
                    color: 'var(--text-main)',
                    imageRendering: 'pixelated' as any,
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Clear
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>

      </div>

      {/* Completion Message */}
      <AnimatePresence>
        {isComplete && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="wireframe-border p-8 text-center max-w-md mx-4"
              style={{
                backgroundColor: 'var(--bg-card)',
                imageRendering: 'pixelated' as any,
              }}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
            >
              <div className="mb-4 flex items-center justify-center">
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0]
                  }}
                  transition={{ 
                    duration: 0.6,
                    repeat: Infinity,
                    repeatDelay: 0.5
                  }}
                >
                  <PixelIcon name="trophy" size={80} className="text-current" style={{ color: 'var(--accent-color)' }} />
                </motion.div>
              </div>
              <h3 className="font-mono text-2xl font-bold uppercase mb-2" style={{ color: 'var(--accent-color)' }}>
                Puzzle Complete!
              </h3>
              <p className="font-mono text-sm" style={{ color: 'var(--text-muted)' }}>
                Unlocking project folders...
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
