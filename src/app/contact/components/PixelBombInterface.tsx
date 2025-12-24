'use client';

import { motion } from 'framer-motion';
import { BombState } from './useBombDefusal';

interface PixelBombInterfaceProps {
  bombState: BombState;
  onModuleClick: (moduleId: string) => void;
}

const GRID_SIZE = 20;
const PIXEL_SIZE = 4;

// Pixel art bomb sprite
const bombSprite = {
  width: 16,
  height: 16,
  pixels: [
    ['', '', '', '#FFD93D', '#FFD93D', '#FFD93D', '#FFD93D', '', '', '', '', '', '', '', '', ''],
    ['', '', '#FFD93D', '#FF6B6B', '#FF6B6B', '#FF6B6B', '#FF6B6B', '#FFD93D', '', '', '', '', '', '', '', ''],
    ['', '#FFD93D', '#FF6B6B', '#333', '#333', '#333', '#333', '#FF6B6B', '#FFD93D', '', '', '', '', '', ''],
    ['#FFD93D', '#FF6B6B', '#333', '#000', '#000', '#000', '#000', '#333', '#FF6B6B', '#FFD93D', '', '', '', '', ''],
    ['#FFD93D', '#FF6B6B', '#333', '#000', '#FFD93D', '#FFD93D', '#000', '#333', '#FF6B6B', '#FFD93D', '', '', '', '', ''],
    ['#FFD93D', '#FF6B6B', '#333', '#000', '#FFD93D', '#FFD93D', '#000', '#333', '#FF6B6B', '#FFD93D', '', '', '', '', ''],
    ['#FFD93D', '#FF6B6B', '#333', '#000', '#000', '#000', '#000', '#333', '#FF6B6B', '#FFD93D', '', '', '', '', ''],
    ['', '#FFD93D', '#FF6B6B', '#333', '#333', '#333', '#333', '#FF6B6B', '#FFD93D', '', '', '', '', '', ''],
    ['', '', '#FFD93D', '#FF6B6B', '#FF6B6B', '#FF6B6B', '#FF6B6B', '#FFD93D', '', '', '', '', '', '', ''],
    ['', '', '', '#FFD93D', '#FFD93D', '#FFD93D', '#FFD93D', '', '', '', '', '', '', '', '', ''],
    ['', '', '', '', '#333', '#333', '', '', '', '', '', '', '', '', ''],
    ['', '', '', '', '#333', '#333', '', '', '', '', '', '', '', '', ''],
    ['', '', '', '', '#333', '#333', '', '', '', '', '', '', '', '', ''],
    ['', '', '', '', '#333', '#333', '', '', '', '', '', '', '', '', ''],
    ['', '', '', '', '#333', '#333', '', '', '', '', '', '', '', '', ''],
    ['', '', '', '', '#333', '#333', '', '', '', '', '', '', '', '', ''],
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

export function PixelBombInterface({ bombState, onModuleClick }: PixelBombInterfaceProps) {
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
      className="relative w-full"
      style={{
        backgroundColor: 'var(--bg-card)',
        border: '4px solid var(--border-color)',
        boxShadow: '0 0 0 2px var(--bg-main), 4px 4px 0 var(--border-color)',
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

      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4" style={{ borderBottom: '2px solid var(--border-color)' }}>
          <div className="flex items-center gap-4">
            <PixelSprite pixels={bombSprite.pixels} pixelSize={PIXEL_SIZE} />
            <div>
              <h2 className="text-2xl font-bold font-mono" style={{ color: 'var(--text-main)' }}>
                CONTACT BOMB
              </h2>
              <p className="text-sm font-mono" style={{ color: 'var(--text-muted)' }}>
                Solve modules to unlock contact form
              </p>
            </div>
          </div>
          
          {/* Timer */}
          <div className="text-right">
            <div
              className="text-3xl font-mono font-bold"
              style={{ color: getTimeColor() }}
            >
              {formatTime(bombState.timeRemaining)}
            </div>
            <div className="text-xs font-mono mt-1" style={{ color: 'var(--text-muted)' }}>
              Time Remaining
            </div>
          </div>
        </div>

        {/* Strikes */}
        <div className="flex items-center gap-2 mb-6">
          <span className="font-mono text-sm" style={{ color: 'var(--text-main)' }}>Strikes:</span>
          {Array.from({ length: bombState.maxStrikes }).map((_, i) => (
            <div
              key={i}
              className="w-8 h-8 border-2"
              style={{
                backgroundColor: i < bombState.strikes ? '#FF6B6B' : 'var(--bg-card)',
                borderColor: i < bombState.strikes ? '#FF6B6B' : 'var(--border-color)',
                boxShadow: 'inset 0 0 0 2px var(--bg-main)',
              }}
            />
          ))}
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {bombState.modules.map((module, index) => {
            const icon = contactIcons[module.type] || [];
            const isActive = module.isActive && !module.isSolved;
            const isSolved = module.isSolved;
            
            return (
              <motion.button
                key={module.id}
                onClick={() => onModuleClick(module.id)}
                disabled={!isActive}
                className="relative p-4 border-2 transition-all font-mono"
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
                    ? '0 0 0 2px var(--bg-main), 4px 4px 0 var(--border-color)'
                    : 'inset 0 0 0 1px var(--bg-main)',
                  opacity: !isActive && !isSolved ? 0.5 : 1,
                  cursor: isActive ? 'pointer' : 'not-allowed',
                }}
                whileHover={isActive ? { scale: 1.05 } : {}}
                whileTap={isActive ? { scale: 0.95 } : {}}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-lg mb-1">
                      {module.contactInfo.label.toUpperCase()}
                    </div>
                    <div className="text-xs" style={{ color: isActive || isSolved ? '#000' : 'var(--text-muted)' }}>
                      MODULE {index + 1}
                    </div>
                  </div>
                  <div className="text-2xl">
                    {isSolved ? '✓' : isActive ? '⚡' : '○'}
                  </div>
                </div>
                
                {/* Pixel Icon */}
                {icon.length > 0 && (
                  <div className="mt-2 flex justify-center">
                    <PixelSprite pixels={icon} pixelSize={3} />
                  </div>
                )}
                
                {isSolved && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute inset-0 flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(107, 207, 127, 0.2)' }}
                  >
                    <span className="text-4xl">✓</span>
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Progress */}
        <div className="p-3" style={{ backgroundColor: 'var(--bg-main)', border: '2px solid var(--border-color)' }}>
          <div className="flex items-center justify-between text-sm font-mono mb-2" style={{ color: 'var(--text-main)' }}>
            <span>Progress</span>
            <span>{bombState.solvedModules} / {bombState.modules.length} modules solved</span>
          </div>
          <div className="w-full h-2" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
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
  );
}
