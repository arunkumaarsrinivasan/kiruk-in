'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { BombState } from './useBombDefusal';
import { useEffect, useState } from 'react';

interface FullScreenBombProps {
  bombState: BombState;
  onModuleClick: (moduleId: string) => void;
  onPause: () => void;
}

const GRID_SIZE = 20;
const PIXEL_SIZE = 4;

// Animated bomb sprite with ticking
const bombSprite = {
  width: 24,
  height: 24,
  pixels: [
    ['', '', '', '', '#FFD93D', '#FFD93D', '#FFD93D', '#FFD93D', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['', '', '', '#FFD93D', '#FF6B6B', '#FF6B6B', '#FF6B6B', '#FF6B6B', '#FFD93D', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['', '', '#FFD93D', '#FF6B6B', '#333', '#333', '#333', '#333', '#FF6B6B', '#FFD93D', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['', '#FFD93D', '#FF6B6B', '#333', '#000', '#000', '#000', '#000', '#333', '#FF6B6B', '#FFD93D', '', '', '', '', '', '', '', '', '', ''],
    ['#FFD93D', '#FF6B6B', '#333', '#000', '#FFD93D', '#FFD93D', '#FFD93D', '#000', '#333', '#FF6B6B', '#FFD93D', '', '', '', '', '', '', '', '', ''],
    ['#FFD93D', '#FF6B6B', '#333', '#000', '#FFD93D', '#FFD93D', '#FFD93D', '#000', '#333', '#FF6B6B', '#FFD93D', '', '', '', '', '', '', '', '', ''],
    ['#FFD93D', '#FF6B6B', '#333', '#000', '#000', '#000', '#000', '#000', '#333', '#FF6B6B', '#FFD93D', '', '', '', '', '', '', '', '', ''],
    ['', '#FFD93D', '#FF6B6B', '#333', '#333', '#333', '#333', '#333', '#FF6B6B', '#FFD93D', '', '', '', '', '', '', '', '', '', ''],
    ['', '', '#FFD93D', '#FF6B6B', '#FF6B6B', '#FF6B6B', '#FF6B6B', '#FF6B6B', '#FFD93D', '', '', '', '', '', '', '', '', '', '', ''],
    ['', '', '', '#FFD93D', '#FFD93D', '#FFD93D', '#FFD93D', '#FFD93D', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['', '', '', '', '#333', '#333', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['', '', '', '', '#333', '#333', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['', '', '', '', '#333', '#333', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['', '', '', '', '#333', '#333', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['', '', '', '', '#333', '#333', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['', '', '', '', '#333', '#333', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
  ],
};

// Contact method icons (pixel art)
const contactIcons: Record<string, string[][]> = {
  email: [
    ['', '', '#4D96FF', '#4D96FF', '#4D96FF', ''],
    ['', '#4D96FF', '#6BCF7F', '#6BCF7F', '#6BCF7F', '#4D96FF'],
    ['#4D96FF', '#6BCF7F', '#FFD93D', '#FFD93D', '#FFD93D', '#6BCF7F', '#4D96FF'],
    ['#4D96FF', '#6BCF7F', '#FFD93D', '#FF6B6B', '#FFD93D', '#6BCF7F', '#4D96FF'],
    ['#4D96FF', '#6BCF7F', '#FFD93D', '#FFD93D', '#FFD93D', '#6BCF7F', '#4D96FF'],
    ['', '#4D96FF', '#6BCF7F', '#6BCF7F', '#6BCF7F', '#4D96FF'],
    ['', '', '#4D96FF', '#4D96FF', '#4D96FF', ''],
  ],
  linkedin: [
    ['#0077B5', '#0077B5', '#0077B5', '#0077B5'],
    ['#0077B5', '#FFFFFF', '#0077B5', '#0077B5'],
    ['#0077B5', '#0077B5', '#FFFFFF', '#0077B5'],
    ['#0077B5', '#0077B5', '#0077B5', '#0077B5'],
  ],
  whatsapp: [
    ['', '', '#25D366', '#25D366', '#25D366', ''],
    ['', '#25D366', '#FFFFFF', '#FFFFFF', '#FFFFFF', '#25D366'],
    ['#25D366', '#FFFFFF', '#25D366', '#25D366', '#FFFFFF', '#25D366'],
    ['#25D366', '#FFFFFF', '#25D366', '#25D366', '#FFFFFF', '#25D366'],
    ['', '#25D366', '#FFFFFF', '#FFFFFF', '#FFFFFF', '#25D366'],
    ['', '', '#25D366', '#25D366', '#25D366', ''],
  ],
  instagram: [
    ['', '#E4405F', '#E4405F', '#E4405F', ''],
    ['#E4405F', '#FCAF45', '#E4405F', '#E4405F', '#E4405F'],
    ['#E4405F', '#E4405F', '#FCAF45', '#E4405F', '#E4405F'],
    ['#E4405F', '#E4405F', '#E4405F', '#FCAF45', '#E4405F'],
    ['', '#E4405F', '#E4405F', '#E4405F', ''],
  ],
};

function PixelSprite({ pixels, pixelSize = PIXEL_SIZE }: { pixels: string[][]; pixelSize?: number }) {
  return (
    <div
      className="grid"
      style={{
        gridTemplateColumns: `repeat(${pixels[0]?.length || 0}, ${pixelSize}px)`,
        gridTemplateRows: `repeat(${pixels.length}, ${pixelSize}px)`,
        imageRendering: 'pixelated',
      }}
    >
      {pixels.flat().map((color, idx) => (
        <div
          key={idx}
          style={{
            width: pixelSize,
            height: pixelSize,
            backgroundColor: color || 'transparent',
          }}
        />
      ))}
    </div>
  );
}

export function FullScreenBomb({ bombState, onModuleClick, onPause }: FullScreenBombProps) {
  const [tickAnimation, setTickAnimation] = useState(0);
  const [isTicking, setIsTicking] = useState(true);

  useEffect(() => {
    if (!bombState.isActive || bombState.isPaused) {
      setIsTicking(false);
      return;
    }
    
    setIsTicking(true);
    const interval = setInterval(() => {
      setTickAnimation(prev => (prev + 1) % 2);
    }, 500); // Tick every 500ms
    
    return () => clearInterval(interval);
  }, [bombState.isActive, bombState.isPaused]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeColor = () => {
    if (bombState.timeRemaining < 60) return '#FF6B6B';
    if (bombState.timeRemaining < 120) return '#FFD93D';
    return '#6BCF7F';
  };

  return (
    <div
      className="fixed inset-0 z-30"
      style={{
        backgroundColor: 'var(--bg-main)',
        imageRendering: 'pixelated',
      }}
    >
      {/* Grid Background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(var(--border-color) 1px, transparent 1px),
            linear-gradient(90deg, var(--border-color) 1px, transparent 1px)
          `,
          backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
        }}
      />

      {/* Scanlines */}
      <div
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)",
        }}
      />

      <div className="relative h-full flex flex-col">
        {/* Header Bar */}
        <div
          className="flex items-center justify-between p-4 border-b-4"
          style={{
            borderColor: 'var(--border-color)',
            backgroundColor: 'var(--bg-card)',
            boxShadow: '0 4px 0 var(--border-color)',
          }}
        >
          <div className="flex items-center gap-4">
            <motion.div
              animate={isTicking ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              <PixelSprite pixels={bombSprite.pixels} pixelSize={PIXEL_SIZE * 2} />
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold font-mono" style={{ color: 'var(--text-main)' }}>
                CONTACT BOMB DEFUSAL
              </h1>
              <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                Solve all modules to unlock contact form
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* Timer */}
            <div className="text-center">
              <motion.div
                className="text-4xl font-mono font-bold"
                style={{ color: getTimeColor() }}
                animate={bombState.timeRemaining < 60 ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 0.5, repeat: bombState.timeRemaining < 60 ? Infinity : 0 }}
              >
                {formatTime(bombState.timeRemaining)}
              </motion.div>
              <div className="text-xs font-mono mt-1" style={{ color: 'var(--text-muted)' }}>
                TIME REMAINING
              </div>
            </div>

            {/* Strikes */}
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm" style={{ color: 'var(--text-main)' }}>STRIKES:</span>
              {Array.from({ length: bombState.maxStrikes }).map((_, i) => (
                <motion.div
                  key={i}
                  className="w-10 h-10 border-2"
                  style={{
                    backgroundColor: i < bombState.strikes ? '#FF6B6B' : 'var(--bg-card)',
                    borderColor: i < bombState.strikes ? '#FF6B6B' : 'var(--border-color)',
                    boxShadow: 'inset 0 0 0 2px var(--bg-main)',
                  }}
                  animate={i < bombState.strikes ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.3 }}
                />
              ))}
            </div>

            {/* Pause Button */}
            <motion.button
              onClick={onPause}
              className="px-4 py-2 border-2 font-mono text-sm font-bold"
              style={{
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-main)',
                boxShadow: 'inset 0 0 0 1px var(--bg-main)',
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {bombState.isPaused ? '▶ RESUME' : '⏸ PAUSE'}
            </motion.button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-7xl mx-auto">
            {/* Modules Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {bombState.modules.map((module, index) => {
                const icon = contactIcons[module.type] || [];
                const isActive = module.isActive && !module.isSolved;
                const isSolved = module.isSolved;
                
                return (
                  <motion.button
                    key={module.id}
                    onClick={() => onModuleClick(module.id)}
                    disabled={!isActive}
                    className="relative p-6 border-2 transition-all font-mono"
                    style={{
                      backgroundColor: isSolved
                        ? '#6BCF7F'
                        : isActive
                        ? '#FFD93D'
                        : 'var(--bg-card)',
                      borderColor: isSolved
                        ? '#6BCF7F'
                        : isActive
                        ? '#FFD93D'
                        : 'var(--border-color)',
                      color: isSolved || isActive ? '#000' : 'var(--text-muted)',
                      boxShadow: isActive
                        ? '0 0 0 2px var(--bg-main), 6px 6px 0 var(--border-color)'
                        : 'inset 0 0 0 1px var(--bg-main)',
                      opacity: !isActive && !isSolved ? 0.5 : 1,
                      cursor: isActive ? 'pointer' : 'not-allowed',
                    }}
                    whileHover={isActive ? { scale: 1.05, y: -2 } : {}}
                    whileTap={isActive ? { scale: 0.95 } : {}}
                    animate={isActive ? { 
                      boxShadow: [
                        '0 0 0 2px var(--bg-main), 6px 6px 0 var(--border-color)',
                        '0 0 0 2px var(--bg-main), 8px 8px 0 var(--border-color)',
                        '0 0 0 2px var(--bg-main), 6px 6px 0 var(--border-color)',
                      ]
                    } : {}}
                    transition={{ duration: 1, repeat: isActive ? Infinity : 0 }}
                  >
                    <div className="text-center">
                      <div className="font-bold text-xl mb-2">
                        {module.contactInfo?.label?.toUpperCase() || module.type.toUpperCase()}
                      </div>
                      <div className="text-xs mb-4" style={{ color: isActive || isSolved ? '#000' : 'var(--text-muted)' }}>
                        MODULE {index + 1}
                      </div>
                      
                      {/* Pixel Icon */}
                      {icon.length > 0 && (
                        <div className="flex justify-center mb-4">
                          <PixelSprite pixels={icon} pixelSize={PIXEL_SIZE * 2} />
                        </div>
                      )}
                      
                      <div className="text-3xl">
                        {isSolved ? '✓' : isActive ? '⚡' : '○'}
                      </div>
                    </div>
                    
                    {isSolved && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute inset-0 flex items-center justify-center"
                        style={{ backgroundColor: 'rgba(107, 207, 127, 0.2)' }}
                      >
                        <span className="text-6xl">✓</span>
                      </motion.div>
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* Progress Bar */}
            <div
              className="p-4"
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '4px solid var(--border-color)',
                boxShadow: '0 0 0 2px var(--bg-main), 4px 4px 0 var(--border-color)',
              }}
            >
              <div className="flex items-center justify-between text-sm font-mono mb-2" style={{ color: 'var(--text-main)' }}>
                <span>PROGRESS</span>
                <span>{bombState.solvedModules} / {bombState.modules.length} MODULES SOLVED</span>
              </div>
              <div className="w-full h-4" style={{ backgroundColor: 'var(--bg-main)', border: '2px solid var(--border-color)' }}>
                <motion.div
                  className="h-full"
                  style={{ backgroundColor: '#6BCF7F' }}
                  initial={{ width: 0 }}
                  animate={{ width: `${(bombState.solvedModules / bombState.modules.length) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
