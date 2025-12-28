'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef, useCallback } from 'react';
import { TypingGameState } from './useTypingGame';

interface TypingGameInterfaceProps {
  gameState: TypingGameState;
  onKeyPress: (key: string) => void;
  onStart: () => void;
  onReset: () => void;
}

export function TypingGameInterface({
  gameState,
  onKeyPress,
  onStart,
  onReset,
}: TypingGameInterfaceProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle keyboard input
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!gameState.isActive) return;
    if (gameState.isCompleted || gameState.isFailed) return;
    
    // Prevent default for most keys to avoid page scrolling
    if (e.key !== 'F5' && e.key !== 'F12' && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
    }

    onKeyPress(e.key);
  }, [gameState.isActive, gameState.isCompleted, gameState.isFailed, onKeyPress]);

  useEffect(() => {
    if (gameState.isActive) {
      window.addEventListener('keydown', handleKeyDown);
      containerRef.current?.focus();
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [gameState.isActive, handleKeyDown]);

  // Render the text with character highlighting
  const renderText = () => {
    const chars = gameState.targetText.split('');
    
    return chars.map((char, index) => {
      let status: 'pending' | 'correct' | 'incorrect' | 'current' = 'pending';
      
      if (index < gameState.currentIndex) {
        const typedChar = gameState.typedText[index];
        status = typedChar === char ? 'correct' : 'incorrect';
      } else if (index === gameState.currentIndex) {
        status = 'current';
      }

      return (
        <span
          key={index}
          className={`relative inline transition-all duration-75 ${
            status === 'pending' ? 'opacity-30' : ''
          } ${status === 'correct' ? 'opacity-100' : ''} ${
            status === 'incorrect' ? 'opacity-100' : ''
          }`}
          style={{
            color: status === 'correct' 
              ? '#6BCF7F' 
              : status === 'incorrect' 
                ? '#FF6B6B' 
                : status === 'current'
                  ? 'var(--text-main)'
                  : 'var(--text-muted)',
            textDecoration: status === 'incorrect' ? 'underline' : 'none',
            textUnderlineOffset: '4px',
            backgroundColor: status === 'current' ? 'rgba(255, 217, 61, 0.2)' : 'transparent',
            padding: status === 'current' ? '2px 1px' : '0',
            borderRadius: status === 'current' ? '2px' : '0',
          }}
        >
          {char === ' ' ? ' ' : char}
        </span>
      );
    });
  };

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      ref={containerRef}
      className="w-full max-w-4xl mx-auto"
      tabIndex={0}
      style={{ outline: 'none' }}
    >
      {/* Stats Bar */}
      <AnimatePresence>
        {gameState.isActive && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex items-center justify-center gap-8 mb-8"
          >
            {/* WPM */}
            <div className="text-center">
              <motion.div
                key={gameState.wpm}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                className="text-4xl font-mono font-bold"
                style={{ color: '#FFD93D' }}
              >
                {gameState.wpm}
              </motion.div>
              <div className="text-xs font-mono uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                WPM
              </div>
            </div>

            {/* CPS */}
            <div className="text-center">
              <motion.div
                key={gameState.cps}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                className="text-4xl font-mono font-bold"
                style={{ color: '#6BCF7F' }}
              >
                {gameState.cps}
              </motion.div>
              <div className="text-xs font-mono uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                CPS
              </div>
            </div>

            {/* Accuracy */}
            <div className="text-center">
              <motion.div
                key={gameState.accuracy}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                className="text-4xl font-mono font-bold"
                style={{ 
                  color: gameState.accuracy >= 90 
                    ? '#6BCF7F' 
                    : gameState.accuracy >= 75 
                      ? '#FFD93D' 
                      : '#FF6B6B' 
                }}
              >
                {gameState.accuracy}%
              </motion.div>
              <div className="text-xs font-mono uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                ACC
              </div>
            </div>

            {/* Time */}
            <div className="text-center">
              <div className="text-4xl font-mono font-bold" style={{ color: 'var(--text-main)' }}>
                {formatTime(gameState.timeElapsed)}
              </div>
              <div className="text-xs font-mono uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                TIME
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Typing Area */}
      <div
        className="relative p-8 rounded-lg"
        style={{
          backgroundColor: 'var(--bg-card)',
          border: '4px solid var(--border-color)',
          boxShadow: '0 0 0 2px var(--bg-main), 6px 6px 0 var(--border-color)',
        }}
      >
        {/* Grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(var(--border-color) 1px, transparent 1px),
              linear-gradient(90deg, var(--border-color) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px',
          }}
        />

        {/* Header */}
        <div className="relative text-center mb-8">
          <motion.div
            className="text-5xl mb-4"
            animate={{ 
              rotate: gameState.isActive && !gameState.isCompleted && !gameState.isFailed 
                ? [0, -5, 5, 0] 
                : 0 
            }}
            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
          >
            ⌨️
          </motion.div>
          <h2 className="text-2xl font-mono font-bold mb-2" style={{ color: 'var(--text-main)' }}>
            TYPEWRITER CHALLENGE
          </h2>
          <p className="text-sm font-mono" style={{ color: 'var(--text-muted)' }}>
            Type the text below to unlock my contact info
          </p>
        </div>

        {/* Progress Bar */}
        <div className="relative h-2 mb-8 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-main)' }}>
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{ backgroundColor: '#6BCF7F' }}
            initial={{ width: '0%' }}
            animate={{ 
              width: `${(gameState.currentIndex / gameState.targetText.length) * 100}%` 
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
        </div>

        {/* Text Display */}
        <div
          className="relative p-6 mb-8 text-xl font-mono leading-relaxed"
          style={{
            backgroundColor: 'var(--bg-main)',
            border: '2px solid var(--border-color)',
            minHeight: '120px',
            lineHeight: '2',
            letterSpacing: '0.05em',
            wordWrap: 'break-word',
            overflowWrap: 'break-word',
            whiteSpace: 'normal',
          }}
        >
          {gameState.isActive ? (
            <div style={{ wordWrap: 'break-word', overflowWrap: 'break-word', whiteSpace: 'normal' }}>
              {renderText()}
            </div>
          ) : (
            <span style={{ color: 'var(--text-muted)', opacity: 0.5, wordWrap: 'break-word', overflowWrap: 'break-word', whiteSpace: 'normal' }}>
              {gameState.targetText}
            </span>
          )}
        </div>

        {/* Start / Retry Button */}
        {!gameState.isActive && !gameState.isCompleted && !gameState.isFailed && (
          <motion.button
            onClick={onStart}
            className="w-full py-4 font-mono text-lg border-2 font-bold"
            style={{
              backgroundColor: '#FFD93D',
              borderColor: '#FFD93D',
              color: '#000',
              boxShadow: '0 0 0 2px var(--bg-main), 4px 4px 0 var(--border-color)',
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            ⌨️ START TYPING
          </motion.button>
        )}

        {gameState.isActive && !gameState.isCompleted && !gameState.isFailed && (
          <div className="text-center font-mono text-sm" style={{ color: 'var(--text-muted)' }}>
            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Start typing to begin... Focus on accuracy!
            </motion.p>
          </div>
        )}

        {/* Retry button for failed attempts */}
        {gameState.isFailed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <p className="font-mono text-lg mb-4" style={{ color: '#FF6B6B' }}>
              Accuracy too low! Need at least 70% accuracy to unlock.
            </p>
            <motion.button
              onClick={onReset}
              className="px-8 py-4 font-mono text-lg border-2 font-bold"
              style={{
                backgroundColor: '#FF6B6B',
                borderColor: '#FF6B6B',
                color: '#000',
                boxShadow: '0 0 0 2px var(--bg-main), 4px 4px 0 var(--border-color)',
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              🔄 TRY AGAIN
            </motion.button>
          </motion.div>
        )}
      </div>

      {/* Keyboard Hint */}
      {gameState.isActive && !gameState.isCompleted && !gameState.isFailed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 text-center"
        >
          <p className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
            ⌫ Backspace to correct • Keep typing to continue
          </p>
        </motion.div>
      )}
    </div>
  );
}
