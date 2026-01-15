'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, PanInfo, AnimatePresence } from 'framer-motion';
import seedrandom from 'seedrandom';
import { EnhancedHighlighterMark } from './EnhancedHighlighterMark';
import { snapPositionToGrid } from '@/lib/utils';

// Enhanced scribble-themed draggable components with new features
export interface EnhancedScribbleDragItem {
  id: string;
  type: 'scribble-note' | 'paper-scrap' | 'tape-piece' | 'coffee-stain' | 'pencil-mark' | 'eraser-mark' | 
        'ink-blot' | 'torn-photo' | 'paper-clip' | 'highlighter-mark' | 'sticky-arrow' | 'washi-tape' | 
        'polaroid' | 'doodle-line' | 'text-bubble';
  position: { x: number; y: number };
  rotation?: number;
  content?: string;
  color?: string;
  size?: number;
  opacity?: number;
  timestamp?: number;
  author?: string;
  velocity?: { x: number; y: number };
  isLocked?: boolean;
  layer?: number;
}

// Drawing path interface for enhanced canvas
interface DrawingPath {
  id: string;
  points: { x: number; y: number; pressure?: number }[];
  color: string;
  strokeWidth: number;
  tool: 'pen' | 'pencil' | 'highlighter' | 'eraser' | 'brush' | 'marker';
  timestamp: number;
}

// Voice command interface
interface VoiceCommand {
  command: string;
  action: () => void;
  description: string;
}

// Animation preset interface
interface AnimationPreset {
  id: string;
  name: string;
  description: string;
  animation: any;
}

// Collaboration cursor interface
interface CollaboratorCursor {
  id: string;
  name: string;
  position: { x: number; y: number };
  color: string;
  lastSeen: number;
}

const snapScribbleItems = (items: EnhancedScribbleDragItem[]) =>
  items.map(item => ({
    ...item,
    position: snapPositionToGrid(item.position)
  }));

const haveSameGridPositions = (
  current: EnhancedScribbleDragItem[],
  next: EnhancedScribbleDragItem[]
) => {
  if (current.length !== next.length) {
    return false;
  }

  for (let index = 0; index < current.length; index += 1) {
    const left = current[index];
    const right = next[index];

    if (left.id !== right.id) {
      return false;
    }

    if (
      left.position.x !== right.position.x ||
      left.position.y !== right.position.y
    ) {
      return false;
    }
  }

  return true;
};

// Helper function for deterministic randomness
function getDeterministicRandom(seed: string): () => number {
  return seedrandom(seed);
}

function getDeterministicValue(seed: string, min: number = 0, max: number = 1): number {
  const rng = getDeterministicRandom(seed);
  return rng() * (max - min) + min;
}

function getDeterministicIndex(seed: string, arrayLength: number): number {
  return Math.floor(getDeterministicValue(seed, 0, arrayLength));
}

// Enhanced Ink Blot component with physics
export const EnhancedInkBlot: React.FC<{
  id: string;
  initialPosition: { x: number; y: number };
  color?: string;
  size?: number;
  onPositionChange?: (id: string, position: { x: number; y: number }) => void;
  enablePhysics?: boolean;
  className?: string;
}> = ({ id, initialPosition, color: _color = '#000000', size = 35, onPositionChange, enablePhysics, className = '' }) => {
  const [_velocity, setVelocity] = useState({ x: 0, y: 0 });
  const [_isDragging, setIsDragging] = useState(false);

  const handleDragEnd = (event: any, info: PanInfo) => {
    setIsDragging(false);
    const newPosition = {
      x: initialPosition.x + info.offset.x,
      y: initialPosition.y + info.offset.y
    };
    
    if (enablePhysics) {
      setVelocity({ x: info.velocity.x * 0.1, y: info.velocity.y * 0.1 });
    }
    
    onPositionChange?.(id, newPosition);
  };

  return (
    <motion.div
      className={`absolute cursor-move select-none ${className}`}
      initial={initialPosition}
      drag
      dragElastic={0.1}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={handleDragEnd}
      whileHover={{ scale: 1.1 }}
      whileDrag={{ scale: 1.2, zIndex: 100 }}
    >
      <div 
        className="rounded-none bg-[var(--text-main)]"
        style={{
          width: size,
          height: size,
          clipPath: 'polygon(10% 20%, 90% 5%, 95% 80%, 85% 95%, 5% 85%)',
          backgroundColor: _color !== '#000000' ? _color : 'var(--text-main)'
        }}
      />
    </motion.div>
  );
};

// Enhanced Torn Photo component
export const EnhancedTornPhoto: React.FC<{
  id: string;
  initialPosition: { x: number; y: number };
  imageUrl?: string;
  caption?: string;
  onPositionChange?: (id: string, position: { x: number; y: number }) => void;
  className?: string;
}> = ({ id, initialPosition, imageUrl, caption, onPositionChange, className = '' }) => {
  const handleDragEnd = (event: any, info: PanInfo) => {
    onPositionChange?.(id, {
      x: initialPosition.x + info.offset.x,
      y: initialPosition.y + info.offset.y
    });
  };
  return (
    <motion.div
      className={`absolute cursor-move select-none ${className}`}
      initial={initialPosition}
      drag
      dragElastic={0.1}
      onDragEnd={handleDragEnd}
      whileHover={{ scale: 1.02, rotate: 0 }}
      whileDrag={{ scale: 1.05, zIndex: 100 }}
    >      <div
        className="bg-[var(--bg-card)] p-2 shadow-none border border-[var(--border-color)] transform"
        style={{
          transform: `rotate(0deg)`,
        }}
      >
        <div 
          className="w-32 h-24 bg-[var(--bg-secondary)] bg-cover bg-center border border-[var(--border-color)]"
          style={{ 
            backgroundImage: imageUrl ? `url(${imageUrl})` : 'linear-gradient(45deg, var(--bg-card), var(--bg-secondary))',
          }}
        />
        {caption && (
          <div className="mt-2 text-[10px] font-mono uppercase tracking-widest text-[var(--text-main)] text-center">
            {caption}
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Enhanced Paper Clip component
export const EnhancedPaperClip: React.FC<{
  id: string;
  initialPosition: { x: number; y: number };
  color?: string;
  onPositionChange?: (id: string, position: { x: number; y: number }) => void;
  className?: string;
}> = ({ id, initialPosition, color: _color = '#000000', onPositionChange, className = '' }) => {
  const handleDragEnd = (event: any, info: PanInfo) => {
    onPositionChange?.(id, {
      x: initialPosition.x + info.offset.x,
      y: initialPosition.y + info.offset.y
    });
  };

  return (
    <motion.div
      className={`absolute cursor-move select-none ${className}`}
      initial={initialPosition}
      drag
      dragElastic={0.1}
      onDragEnd={handleDragEnd}
      whileHover={{ scale: 1.1, rotate: 0 }}
      whileDrag={{ scale: 1.2, zIndex: 100 }}
    >
      <svg width="20" height="60" viewBox="0 0 20 60">
        <path
          d="M5,10 Q5,5 10,5 Q15,5 15,10 L15,35 Q15,45 10,45 Q5,45 5,35 L5,20 Q5,15 10,15 Q15,15 15,20 L15,25"
          stroke="var(--text-main)"
          strokeWidth="2"
          fill="none"
          strokeLinecap="square"
        />
      </svg>
    </motion.div>  );
};

// New Sticky Arrow component
export const StickyArrow: React.FC<{
  id: string;
  initialPosition: { x: number; y: number };
  direction?: 'up' | 'down' | 'left' | 'right';
  color?: string;
  onPositionChange?: (id: string, position: { x: number; y: number }) => void;
  className?: string;
}> = ({ id, initialPosition, direction = 'right', color: _color = '#000000', onPositionChange, className = '' }) => {
  const handleDragEnd = (event: any, info: PanInfo) => {
    onPositionChange?.(id, {
      x: initialPosition.x + info.offset.x,
      y: initialPosition.y + info.offset.y
    });
  };

  const arrows = {
    up: '↑',
    down: '↓',
    left: '←',
    right: '→'
  };

  return (
    <motion.div
      className={`absolute cursor-move select-none ${className}`}
      initial={initialPosition}
      drag
      dragElastic={0.1}
      onDragEnd={handleDragEnd}
      whileHover={{ scale: 1.1 }}
      whileDrag={{ scale: 1.2, zIndex: 100 }}
    >
      <div 
        className="w-12 h-12 rounded-none flex items-center justify-center text-2xl font-bold shadow-none border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-main)]"
        style={{
          transform: `rotate(0deg)`
        }}
      >
        {arrows[direction]}
      </div>
    </motion.div>
  );
};

// New Washi Tape component
export const WashiTape: React.FC<{
  id: string;
  initialPosition: { x: number; y: number };
  pattern?: 'dots' | 'stripes' | 'hearts' | 'stars';
  color?: string;
  length?: number;
  onPositionChange?: (id: string, position: { x: number; y: number }) => void;
  className?: string;
}> = ({ id, initialPosition, pattern = 'stripes', color: _color = '#000000', length = 80, onPositionChange, className = '' }) => {
  const handleDragEnd = (event: any, info: PanInfo) => {
    onPositionChange?.(id, {
      x: initialPosition.x + info.offset.x,
      y: initialPosition.y + info.offset.y
    });
  };

  const patterns = {
    dots: `radial-gradient(circle at 50% 50%, var(--text-main) 30%, transparent 30%)`,
    stripes: `repeating-linear-gradient(45deg, var(--text-main) 0px, var(--text-main) 3px, transparent 3px, transparent 6px)`,
    hearts: `url("data:image/svg+xml,%3Csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='12'%3E♥%3C/text%3E%3C/svg%3E")`,
    stars: `url("data:image/svg+xml,%3Csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='12'%3E★%3C/text%3E%3C/svg%3E")`
  };

  return (
    <motion.div
      className={`absolute cursor-move select-none ${className}`}
      initial={initialPosition}
      drag
      dragElastic={0.1}
      onDragEnd={handleDragEnd}
      whileHover={{ scale: 1.02 }}
      whileDrag={{ scale: 1.05, zIndex: 100 }}
    >      <div 
        className="h-8 opacity-100 rounded-none bg-[var(--bg-card)] border border-[var(--border-color)]"
        style={{
          width: length,
          backgroundImage: patterns[pattern],
          backgroundSize: '20px 20px',
          transform: `rotate(0deg)`,
          boxShadow: 'none'
        }}
      />
    </motion.div>
  );
};

// New Polaroid component
export const Polaroid: React.FC<{
  id: string;
  initialPosition: { x: number; y: number };
  imageUrl?: string;
  caption?: string;
  onPositionChange?: (id: string, position: { x: number; y: number }) => void;
  className?: string;
}> = ({ id, initialPosition, imageUrl, caption, onPositionChange, className = '' }) => {
  const handleDragEnd = (event: any, info: PanInfo) => {
    onPositionChange?.(id, {
      x: initialPosition.x + info.offset.x,
      y: initialPosition.y + info.offset.y
    });
  };

  return (
    <motion.div
      className={`absolute cursor-move select-none ${className}`}      initial={initialPosition}
      drag
      dragElastic={0.1}
      onDragEnd={handleDragEnd}
      whileHover={{ scale: 1.02, rotate: 0 }}
      whileDrag={{ scale: 1.05, zIndex: 100 }}
    >
      <div 
        className="bg-[var(--bg-card)] p-3 pb-8 shadow-none border border-[var(--border-color)] transform"        style={{
          transform: `rotate(0deg)`,
        }}
      >
        <div 
          className="w-28 h-28 bg-[var(--bg-secondary)] bg-cover bg-center border border-[var(--border-color)]"
          style={{ 
            backgroundImage: imageUrl ? `url(${imageUrl})` : 'linear-gradient(45deg, var(--bg-card), var(--bg-secondary))'
          }}
        />
        <div className="mt-2 text-[10px] font-mono uppercase tracking-widest text-[var(--text-main)] text-center">
          {caption || 'Untitled'}
        </div>
      </div>
    </motion.div>
  );
};

// DrawingCanvas component (update signature and usage)
export const DrawingCanvas: React.FC<{
  width: number;
  height: number;
  paths: DrawingPath[];
  onPathComplete?: (path: DrawingPath) => void;
  tool: 'pen' | 'pencil' | 'highlighter' | 'eraser' | 'brush' | 'marker';
  color: string;
  strokeWidth: number;
  isDrawing: boolean;
  onDrawingChange: (drawing: boolean) => void;
}> = ({ width: _width, height: _height, paths, onPathComplete, tool, color: _color, strokeWidth, isDrawing: _isDrawing, onDrawingChange }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentPath, setCurrentPath] = useState<DrawingPath | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [isLocalDrawing, setIsLocalDrawing] = useState(false);

  // Set canvas size on mount and window resize
  useEffect(() => {
    if (typeof globalThis === 'undefined') return;
    
    const updateCanvasSize = () => {
      setCanvasSize({
        width: globalThis.innerWidth,
        height: globalThis.innerHeight
      });
    };

    updateCanvasSize();
    globalThis.addEventListener('resize', updateCanvasSize);
    return () => globalThis.removeEventListener('resize', updateCanvasSize);
  }, []);
  const startDrawing = (e: React.MouseEvent) => {
    // Starting drawing...
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) {
      // No canvas rect found
      return;
    }
    
    setIsLocalDrawing(true);
    onDrawingChange(true);
    const newPath: DrawingPath = {
      id: `path-${Date.now()}`,
      points: [{ x: e.clientX - rect.left, y: e.clientY - rect.top }],
      color: tool === 'eraser' ? 'transparent' : _color,
      strokeWidth,
      tool,
      timestamp: Date.now()
    };
    
    // New path created
    setCurrentPath(newPath);
  };

  const continueDrawing = (e: React.MouseEvent) => {
    if (!isLocalDrawing || !currentPath) {
      // Not drawing or no current path
      return;
    }
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const updatedPath = {
      ...currentPath,
      points: [...currentPath.points, { x: e.clientX - rect.left, y: e.clientY - rect.top }]
    };
    
    // Continuing drawing
    setCurrentPath(updatedPath);
  };
  const stopDrawing = () => {
    // Stopping drawing...
    if (currentPath && currentPath.points.length > 1) {
      // Saving path
      onPathComplete?.(currentPath);
      setCurrentPath(null);
    } else {
      // Path not saved - too few points or no current path
    }
    setIsLocalDrawing(false);
    onDrawingChange(false);
  };

  // Draw paths on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || canvasSize.width === 0) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);
    
    // Draw completed paths from parent
    paths.forEach(path => {
      if (path.points.length < 2) return;
      
      ctx.beginPath();
      ctx.strokeStyle = path.color;
      ctx.lineWidth = path.strokeWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      if (path.tool === 'highlighter') {
        ctx.globalAlpha = 0.5;
        ctx.globalCompositeOperation = 'multiply';
      } else if (path.tool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
      } else {
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'source-over';
      }
      
      ctx.moveTo(path.points[0].x, path.points[0].y);
      path.points.forEach(point => {
        ctx.lineTo(point.x, point.y);
      });
      ctx.stroke();
    });
    
    // Draw current path
    if (currentPath && currentPath.points.length > 1) {
      ctx.beginPath();
      ctx.strokeStyle = currentPath.color;
      ctx.lineWidth = currentPath.strokeWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      if (currentPath.tool === 'highlighter') {
        ctx.globalAlpha = 0.5;
        ctx.globalCompositeOperation = 'multiply';
      } else {
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'source-over';
      }
      
      ctx.moveTo(currentPath.points[0].x, currentPath.points[0].y);
      currentPath.points.forEach(point => {
        ctx.lineTo(point.x, point.y);
      });
      ctx.stroke();
    }
  }, [paths, currentPath, canvasSize.width, canvasSize.height]);

  // Don't render until we have proper dimensions
  if (canvasSize.width === 0 || canvasSize.height === 0) {
    return null;
  }
  return (
    <canvas
      ref={canvasRef}
      width={canvasSize.width}
      height={canvasSize.height}
      className="absolute inset-0 pointer-events-auto"
      onMouseDown={startDrawing}
      onMouseMove={continueDrawing}
      onMouseUp={stopDrawing}
      onMouseLeave={stopDrawing}
      style={{ 
        zIndex: 10, 
        cursor: isLocalDrawing ? 'crosshair' : 'crosshair',
        background: 'transparent'
      }}
    />
  );
};

// Main Enhanced Scribble Workspace Component
const ScribbleWorkspace: React.FC<{
  className?: string;
  initialItems?: EnhancedScribbleDragItem[];
  onItemsChange?: (items: EnhancedScribbleDragItem[]) => void;
  showAddButton?: boolean;
  enablePhysics?: boolean;
  enableCollaboration?: boolean;
  enableVoiceCommands?: boolean;
  enableDrawing?: boolean;
  enableGestures?: boolean;
  theme?: 'light' | 'dark' | 'sepia' | 'neon';
  showMinimap?: boolean;
  // External drawing tool controls
  externalDrawingTool?: 'pen' | 'pencil' | 'highlighter' | 'eraser' | 'brush' | 'marker';
  externalDrawingColor?: string;
  externalStrokeWidth?: number;
}> = ({ 
  className = '', 
  initialItems = [], 
  onItemsChange,
  showAddButton = true,
  enablePhysics = false,
  enableCollaboration = false,
  enableVoiceCommands = false,
  enableDrawing = false,
  enableGestures = false,
  theme = 'light',
  showMinimap: _showMinimap = false,
  externalDrawingTool,
  externalDrawingColor,
  externalStrokeWidth
}) => {
  const [items, setItems] = useState<EnhancedScribbleDragItem[]>(() => snapScribbleItems(initialItems));
  const [showMenu, setShowMenu] = useState(false);
  const [showAdvancedMenu, setShowAdvancedMenu] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [collaborators, setCollaborators] = useState<CollaboratorCursor[]>([]);
  const [drawingPaths, setDrawingPaths] = useState<DrawingPath[]>([]);
  const [currentTheme, setTheme] = useState<'light' | 'dark' | 'sepia' | 'neon'>(theme);
  
  // Use external drawing tool settings if provided, otherwise use internal state
  const [selectedTool, setSelectedTool] = useState<'pen' | 'pencil' | 'highlighter' | 'eraser' | 'brush' | 'marker'>('pen');
  const [selectedColor, setSelectedColor] = useState('#333333');
  const [strokeWidth, setStrokeWidth] = useState(3);
  
  // Use external settings when available
  const activeDrawingTool = externalDrawingTool || selectedTool;
  const activeDrawingColor = externalDrawingColor || selectedColor;
  const activeStrokeWidth = externalStrokeWidth || strokeWidth;
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [viewportPosition] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [animationPresets] = useState<AnimationPreset[]>([
    { id: 'bounce', name: 'Bounce', description: 'Bouncy animation', animation: { scale: [1, 1.2, 1], transition: { duration: 0.5 } } },
    { id: 'shake', name: 'Shake', description: 'Shake animation', animation: { x: [0, -10, 10, -10, 10, 0], transition: { duration: 0.6 } } },
    { id: 'spin', name: 'Spin', description: 'Spinning animation', animation: { rotate: [0, 360], transition: { duration: 1 } } },
    { id: 'pulse', name: 'Pulse', description: 'Pulsing animation', animation: { scale: [1, 1.1, 1], opacity: [1, 0.8, 1], transition: { duration: 0.8, repeat: Infinity } } }
  ]);

  const workspaceRef = useRef<HTMLDivElement>(null);

  const addItem = useCallback((type: EnhancedScribbleDragItem['type']) => {
    const newItem: EnhancedScribbleDragItem = {
      id: `scribble-${Date.now()}-${getDeterministicValue(`item-id-${Date.now()}`, 0, 1).toString().substring(2, 11)}`,
      type,
      position: snapPositionToGrid({ 
        x: getDeterministicValue(`item-x-${type}-${Date.now()}`, 50, 450), 
        y: getDeterministicValue(`item-y-${type}-${Date.now()}`, 50, 350) 
      }),
      rotation: getDeterministicValue(`item-rotation-${type}-${Date.now()}`, -15, 15),
      content: type === 'paper-scrap' ? 'Your note here...' : 
               type === 'text-bubble' ? 'Speech bubble text' : undefined,
      size: type === 'coffee-stain' ? getDeterministicValue(`item-size-${Date.now()}`, 30, 60) : 
            type === 'ink-blot' ? getDeterministicValue(`item-size-${Date.now()}`, 20, 60) : undefined,
      color: type === 'highlighter-mark' ? ['#fbbf24', '#10b981', '#f59e0b', '#ec4899'][getDeterministicIndex(`item-color-${Date.now()}`, 4)] : 
             type === 'sticky-arrow' ? ['#f59e0b', '#ef4444', '#3b82f6', '#10b981'][getDeterministicIndex(`item-color-${Date.now()}`, 4)] :
             type === 'washi-tape' ? ['#ec4899', '#8b5cf6', '#06b6d4', '#84cc16'][getDeterministicIndex(`item-color-${Date.now()}`, 4)] : undefined,
      author: enableCollaboration ? 'You' : undefined,
      timestamp: Date.now(),
      layer: items.length
    };

    setItems(prev => [...prev, newItem]);
    setShowMenu(false);
    setShowAdvancedMenu(false);
  }, [items, enableCollaboration]);

  // Voice recognition effect
  useEffect(() => {
    if (!enableVoiceCommands || !isListening) return;

    // Voice commands setup - moved inside useEffect to avoid dependency issues
    const voiceCommands: VoiceCommand[] = [
      { command: 'add note', action: () => addItem('paper-scrap'), description: 'Add a new paper scrap note' },
      { command: 'add photo', action: () => addItem('polaroid'), description: 'Add a polaroid photo' },
      { command: 'add arrow', action: () => addItem('sticky-arrow'), description: 'Add a sticky arrow' },
      { command: 'clear workspace', action: () => setItems([]), description: 'Clear all items' },
      { command: 'enable physics', action: () => {/* Toggle physics */}, description: 'Enable physics simulation' },
      { command: 'zoom in', action: () => setZoom(prev => Math.min(prev * 1.2, 3)), description: 'Zoom in' },
      { command: 'zoom out', action: () => setZoom(prev => Math.max(prev / 1.2, 0.5)), description: 'Zoom out' },
      { command: 'select all', action: () => setSelectedItems(items.map(item => item.id)), description: 'Select all items' }
    ];

    let recognition: any;    try {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      if (!SpeechRecognition) return;
      
      recognition = new SpeechRecognition();

      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const lastResult = event.results[event.results.length - 1];
        const transcript = lastResult[0].transcript.toLowerCase().trim();
        
        const matchedCommand = voiceCommands.find(cmd => 
          transcript.includes(cmd.command)
        );
        
        if (matchedCommand) {
          matchedCommand.action();
        }
      };

      recognition.start();
    } catch (error) {
      console.warn('Speech recognition not available:', error);
    }

    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, [isListening, enableVoiceCommands, items, addItem, setItems, setZoom, setSelectedItems]);

  // Simulated collaboration effect
  useEffect(() => {
    if (!enableCollaboration) return;

    const interval = setInterval(() => {
      const collaboratorNames = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve'];
      const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57'];
      
      // Simulate cursor movement
      setCollaborators(prev => {        const updated = prev.map((collaborator) => ({
          ...collaborator,
          position: {
            x: collaborator.position.x + getDeterministicValue(`${collaborator.id}-move-x-${Date.now()}`, -50, 50),
            y: collaborator.position.y + getDeterministicValue(`${collaborator.id}-move-y-${Date.now()}`, -50, 50)
          },
          lastSeen: Date.now()
        }));        // Occasionally add new collaborators
        if (getDeterministicValue(`collab-spawn-${Math.floor(Date.now() / 10000)}`, 0, 1) < 0.1 && updated.length < 3) {
          const nameIndex = Math.floor(getDeterministicValue(`collab-name-${Date.now()}`, 0, collaboratorNames.length));
          const colorIndex = Math.floor(getDeterministicValue(`collab-color-${Date.now()}`, 0, colors.length));
          const randomName = collaboratorNames[nameIndex];
          const randomColor = colors[colorIndex];
          updated.push({
            id: `collab-${Date.now()}`,
            name: randomName,
            position: { 
              x: getDeterministicValue(`collab-x-${Date.now()}`, 0, 800), 
              y: getDeterministicValue(`collab-y-${Date.now()}`, 0, 600) 
            },
            color: randomColor,
            lastSeen: Date.now()
          });
        }

        return updated.filter(c => Date.now() - c.lastSeen < 30000); // Remove old cursors
      });      // Occasionally add collaborative items
      if (getDeterministicValue(`collab-item-spawn-${Math.floor(Date.now() / 5000)}`, 0, 1) < 0.2) {
        const collabIndex = Math.floor(getDeterministicValue(`collab-item-name-${Date.now()}`, 0, collaboratorNames.length));
        const randomCollaborator = collaboratorNames[collabIndex];
        const collaborativeItem: EnhancedScribbleDragItem = {
          id: `collab-${Date.now()}-${getDeterministicValue(`collab-item-id-${Date.now()}`, 0, 1).toString().substring(2, 11)}`,
          type: 'paper-scrap',
          position: snapPositionToGrid({ 
            x: getDeterministicValue(`collab-item-x-${Date.now()}`, 50, 450), 
            y: getDeterministicValue(`collab-item-y-${Date.now()}`, 50, 350) 
          }),
          rotation: getDeterministicValue(`collab-item-rotation-${Date.now()}`, -15, 15),
          content: `💭 ${randomCollaborator}: ${['Great idea!', 'Love this!', 'What about...?', 'Interesting perspective'][getDeterministicIndex(`collab-comment-${Date.now()}`, 4)]}`,
          author: randomCollaborator,
          timestamp: Date.now()
        };
        
        setItems(prev => [...prev, collaborativeItem]);
      }
    }, 5000); // Every 5 seconds

    return () => clearInterval(interval);
  }, [enableCollaboration]);

  // Gesture recognition effect
  useEffect(() => {
    if (!enableGestures) return;

    const handleKeydown = (e: KeyboardEvent) => {
      // Multi-select with Ctrl/Cmd
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault();
        setSelectedItems(items.map(item => item.id));
      }
      
      // Delete selected items
      if (e.key === 'Delete' || e.key === 'Backspace') {
        setItems(prev => prev.filter(item => !selectedItems.includes(item.id)));
        setSelectedItems([]);
      }
      
      // Zoom controls
      if ((e.ctrlKey || e.metaKey) && e.key === '=') {
        e.preventDefault();
        setZoom(prev => Math.min(prev * 1.2, 3));
      }
      if ((e.ctrlKey || e.metaKey) && e.key === '-') {
        e.preventDefault();
        setZoom(prev => Math.max(prev / 1.2, 0.5));
      }
    };

    globalThis.addEventListener('keydown', handleKeydown);
    return () => globalThis.removeEventListener('keydown', handleKeydown);
  }, [enableGestures, selectedItems, items]);

  // Update items when props change without re-snapping identical data
  useEffect(() => {
    setItems(prev => {
      if (initialItems === prev) {
        return prev;
      }

      const snapped = snapScribbleItems(initialItems);
      return haveSameGridPositions(prev, snapped) ? prev : snapped;
    });
  }, [initialItems]);

  // Call onItemsChange when items change
  useEffect(() => {
    if (onItemsChange) {
      onItemsChange(items);
    }
  }, [items, onItemsChange]);

  const updateItemPosition = useCallback((id: string, position: { x: number; y: number }) => {
    const snapped = snapPositionToGrid(position);
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, position: snapped } : item
    ));
  }, []);

  const applyAnimationToSelected = (_preset: AnimationPreset) => {
    // This would trigger animations on selected items
    // Implementation would depend on the animation system used
    // Applying animation to selected items
  };

  const exportWorkspace = () => {
    const workspaceData = {
      items,
      drawingPaths,
      viewportPosition,
      zoom,
      timestamp: Date.now(),
      theme,
      version: '2.0'
    };
    
    const dataStr = JSON.stringify(workspaceData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `enhanced-scribble-workspace-${new Date().toISOString().slice(0, 10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const renderItem = (item: EnhancedScribbleDragItem) => {
    const commonProps = {
      id: item.id,
      initialPosition: item.position,
      onPositionChange: updateItemPosition,
      enablePhysics,
      className: selectedItems.includes(item.id) ? 'ring-2 ring-blue-400' : ''
    };

    switch (item.type) {
      case 'ink-blot':
        return (
          <EnhancedInkBlot
            key={item.id}
            {...commonProps}
            color={item.color}
            size={item.size}
          />
        );
      case 'torn-photo':
        return (
          <EnhancedTornPhoto
            key={item.id}
            {...commonProps}
            imageUrl="/images/portfolio/sketch-portfolio.svg"
            caption="Memory"
          />
        );
      case 'paper-clip':
        return (
          <EnhancedPaperClip
            key={item.id}
            {...commonProps}
            color={item.color}
          />
        );
      case 'highlighter-mark':
        return (
          <EnhancedHighlighterMark
            key={item.id}
            {...commonProps}
            color={item.color}
            width={100}
          />
        );
      case 'sticky-arrow':
        return (        <StickyArrow
            key={item.id}
            {...commonProps}
            direction={['up', 'down', 'left', 'right'][getDeterministicIndex(`arrow-direction-${item.id}`, 4)] as any}
            color={item.color}
          />
        );
      case 'washi-tape':
        return (
          <WashiTape
            key={item.id}
            {...commonProps}
            pattern={['dots', 'stripes', 'hearts', 'stars'][getDeterministicIndex(`tape-pattern-${item.id}`, 4)] as any}
            color={item.color}
            length={getDeterministicValue(`tape-length-${item.id}`, 60, 120)}
          />
        );
      case 'polaroid':
        return (
          <Polaroid
            key={item.id}
            {...commonProps}
            imageUrl="/images/demo-avatar.svg"
            caption={item.content || 'Snapshot'}
          />        );
      case 'coffee-stain':
        return (
          <motion.div
            key={item.id}
            className="absolute cursor-move select-none"
            initial={item.position}
            drag
            dragElastic={0.1}
            onDragEnd={(event: any, info: any) => {
              updateItemPosition(item.id, {
                x: item.position.x + info.offset.x,
                y: item.position.y + info.offset.y
              });
            }}
            whileHover={{ scale: 1.05 }}
            whileDrag={{ scale: 1.1, zIndex: 100 }}
          >            <div 
              className="rounded-none border border-[var(--border-color)]"
              style={{
                width: `${item.size || 40}px`,
                height: `${item.size || 40}px`,
                background: 'transparent',
              }}
            />
          </motion.div>
        );
      case 'tape-piece':
        return (
          <motion.div
            key={item.id}
            className="absolute cursor-move select-none"
            initial={item.position}
            drag
            dragElastic={0.1}
            onDragEnd={(event: any, info: any) => {
              updateItemPosition(item.id, {
                x: item.position.x + info.offset.x,
                y: item.position.y + info.offset.y
              });
            }}
            whileHover={{ scale: 1.02 }}
            whileDrag={{ scale: 1.05, zIndex: 100 }}
          >            <div 
              className="bg-[var(--bg-card)] opacity-100 rounded-none border border-[var(--border-color)]"
              style={{
                width: "80px",
                height: "20px",
                transform: `rotate(${item.rotation || 0}deg)`,
                background: `repeating-linear-gradient(45deg, var(--text-main) 0px, var(--text-main) 1px, transparent 1px, transparent 4px)`,
                boxShadow: '2px 2px 0 var(--border-color)'
              }}
            />
          </motion.div>
        );
      case 'pencil-mark':
        return (
          <motion.div
            key={item.id}
            className="absolute cursor-move select-none"
            initial={item.position}
            drag
            dragElastic={0.1}
            onDragEnd={(event: any, info: any) => {
              updateItemPosition(item.id, {
                x: item.position.x + info.offset.x,
                y: item.position.y + info.offset.y
              });
            }}
            whileHover={{ scale: 1.02 }}
            whileDrag={{ scale: 1.05, zIndex: 100 }}
          >
            <svg width="60" height="30" viewBox="0 0 60 30">
              <path
                d="M10,10 Q20,5 30,15 T50,20"
                stroke="var(--text-main)"
                strokeWidth="2"
                fill="none"
                strokeLinecap="square"
              />
            </svg>
          </motion.div>
        );      case 'eraser-mark':
        return (
          <motion.div
            key={item.id}
            className="absolute cursor-move select-none"
            initial={item.position}
            drag
            dragElastic={0.1}
            onDragEnd={(event: any, info: any) => {
              updateItemPosition(item.id, {
                x: item.position.x + info.offset.x,
                y: item.position.y + info.offset.y
              });
            }}
            whileHover={{ scale: 1.02 }}
            whileDrag={{ scale: 1.05, zIndex: 100 }}
          >
            <div 
              className="bg-[var(--bg-card)] opacity-100 rounded-none border border-[var(--border-color)]"
              style={{
                width: "60px",
                height: "15px",
                transform: `rotate(0deg)`,
              }}
            />
          </motion.div>
        );
      default:
        return null;
    }
  };

  const themeClasses = {
    light: 'bg-[var(--bg-main)] text-[var(--text-main)]',
    dark: 'bg-black text-white',
    sepia: 'bg-[#f4ecd8] text-[#5b4636]',
    neon: 'bg-black text-[#0ff]'
  };

  return (
    <div 
      ref={workspaceRef}
      className={`relative w-full h-full overflow-hidden ${themeClasses[theme]} ${className}`}
      style={{ 
        transform: `scale(${zoom}) translate(${viewportPosition.x}px, ${viewportPosition.y}px)`,
        backgroundImage: 'linear-gradient(var(--border-color) 1px, transparent 1px), linear-gradient(90deg, var(--border-color) 1px, transparent 1px)',
        backgroundSize: '20px 20px'
      }}
    >      {/* Drawing Canvas - High z-index to be above other elements */}
      {enableDrawing && (
        <div className="absolute inset-0" style={{ zIndex: 10 }}>
          <DrawingCanvas
            width={0}
            height={0}
            paths={drawingPaths} // <-- pass shared paths
            onPathComplete={path => setDrawingPaths(prev => [...prev, path])}
            tool={activeDrawingTool}
            color={activeDrawingColor}
            strokeWidth={activeStrokeWidth}
            isDrawing={isDrawing}
            onDrawingChange={setIsDrawing}
          />
        </div>
      )}

      {/* Render all items */}
      <div style={{ zIndex: 2 }}>
        {items.map(renderItem)}
      </div>

      {/* Collaboration cursors */}
      {enableCollaboration && collaborators.map(collaborator => (
        <motion.div
          key={collaborator.id}
          className="absolute pointer-events-none z-50"
          style={{
            left: collaborator.position.x,
            top: collaborator.position.y,
            color: collaborator.color
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="flex items-center">
            <div 
              className="w-3 h-3 rounded-none border border-[var(--border-color)]"
              style={{ backgroundColor: collaborator.color }}
            />
            <div className="ml-2 bg-[var(--text-main)] text-[var(--bg-main)] px-2 py-1 rounded-none text-xs font-mono uppercase">
              {collaborator.name}
            </div>
          </div>
        </motion.div>
      ))}

      {/* Enhanced control panel */}
      {showAddButton && (
        <div className="absolute top-4 right-4 z-50 flex flex-col gap-2">
          {/* Main controls row */}
          <div className="flex gap-2">
            <motion.button
              onClick={() => setShowMenu(!showMenu)}
              className="w-12 h-12 bg-[var(--bg-card)] text-[var(--text-main)] border border-[var(--border-color)] flex items-center justify-center text-xl hover:bg-[var(--text-main)] hover:text-[var(--bg-main)] transition-colors shadow-none"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              +
            </motion.button>

            <motion.button
              onClick={() => setShowAdvancedMenu(!showAdvancedMenu)}
              className="w-12 h-12 bg-[var(--bg-card)] text-[var(--text-main)] border border-[var(--border-color)] flex items-center justify-center text-lg hover:bg-[var(--text-main)] hover:text-[var(--bg-main)] transition-colors shadow-none"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              ⚡
            </motion.button>

            <motion.button
              onClick={() => setShowSettingsMenu(!showSettingsMenu)}
              className="w-12 h-12 bg-[var(--bg-card)] text-[var(--text-main)] border border-[var(--border-color)] flex items-center justify-center text-lg hover:bg-[var(--text-main)] hover:text-[var(--bg-main)] transition-colors shadow-none"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              ⚙️
            </motion.button>
          </div>

          {/* Secondary controls row */}
          <div className="flex gap-2">
            {enableVoiceCommands && (
              <motion.button
                onClick={() => setIsListening(!isListening)}
                className={`w-10 h-8 ${isListening ? 'bg-[var(--text-main)] text-[var(--bg-main)]' : 'bg-[var(--bg-card)] text-[var(--text-main)]'} border border-[var(--border-color)] flex items-center justify-center text-sm hover:opacity-90 transition-colors shadow-none`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                🎤
              </motion.button>
            )}

            <motion.button
              onClick={exportWorkspace}
              className="w-8 h-8 bg-[var(--bg-card)] text-[var(--text-main)] border border-[var(--border-color)] flex items-center justify-center text-sm hover:bg-[var(--text-main)] hover:text-[var(--bg-main)] transition-colors shadow-none"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              💾
            </motion.button>

            <motion.button
              onClick={() => setItems([])}
              className="w-8 h-8 bg-[var(--bg-card)] text-[var(--text-main)] border border-[var(--border-color)] flex items-center justify-center text-sm hover:bg-[var(--text-main)] hover:text-[var(--bg-main)] transition-colors shadow-none"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              🗑️
            </motion.button>
          </div>

          {/* Basic items menu */}
          <AnimatePresence>
            {showMenu && (
              <motion.div
                className="absolute top-16 right-0 bg-[var(--bg-card)] border border-[var(--border-color)] p-4 min-w-[260px] shadow-none"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="text-sm font-black uppercase tracking-widest mb-3 border-b border-[var(--border-color)] pb-1">Basic Items:</div>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono uppercase">
                  <button onClick={() => addItem('paper-scrap')} className="p-2 bg-[var(--bg-card)] hover:bg-[var(--text-main)] hover:text-[var(--bg-main)] border border-[var(--border-color)] text-left transition-colors">
                    📄 Note
                  </button>
                  <button onClick={() => addItem('tape-piece')} className="p-2 bg-[var(--bg-card)] hover:bg-[var(--text-main)] hover:text-[var(--bg-main)] border border-[var(--border-color)] text-left transition-colors">
                    📏 Tape
                  </button>
                  <button onClick={() => addItem('coffee-stain')} className="p-2 bg-[var(--bg-card)] hover:bg-[var(--text-main)] hover:text-[var(--bg-main)] border border-[var(--border-color)] text-left transition-colors">
                    ☕ Stain
                  </button>
                  <button onClick={() => addItem('pencil-mark')} className="p-2 bg-[var(--bg-card)] hover:bg-[var(--text-main)] hover:text-[var(--bg-main)] border border-[var(--border-color)] text-left transition-colors">
                    ✏️ Pencil
                  </button>
                  <button onClick={() => addItem('eraser-mark')} className="p-2 bg-[var(--bg-card)] hover:bg-[var(--text-main)] hover:text-[var(--bg-main)] border border-[var(--border-color)] text-left transition-colors">
                    🧽 Eraser
                  </button>
                  <button onClick={() => addItem('polaroid')} className="p-2 bg-[var(--bg-card)] hover:bg-[var(--text-main)] hover:text-[var(--bg-main)] border border-[var(--border-color)] text-left transition-colors">
                    📷 Photo
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Advanced items menu */}
          <AnimatePresence>
            {showAdvancedMenu && (
              <motion.div
                className="absolute top-16 right-0 bg-[var(--bg-card)] border border-[var(--border-color)] p-4 min-w-[280px] shadow-none"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="text-sm font-black uppercase tracking-widest mb-3 border-b border-[var(--border-color)] pb-1">Advanced Items:</div>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono uppercase mb-4">
                  <button onClick={() => addItem('ink-blot')} className="p-2 bg-[var(--bg-card)] hover:bg-[var(--text-main)] hover:text-[var(--bg-main)] border border-[var(--border-color)] text-left transition-colors">
                    🖋️ Ink Blot
                  </button>
                  <button onClick={() => addItem('torn-photo')} className="p-2 bg-[var(--bg-card)] hover:bg-[var(--text-main)] hover:text-[var(--bg-main)] border border-[var(--border-color)] text-left transition-colors">
                    🖼️ Torn Photo
                  </button>
                  <button onClick={() => addItem('paper-clip')} className="p-2 bg-[var(--bg-card)] hover:bg-[var(--text-main)] hover:text-[var(--bg-main)] border border-[var(--border-color)] text-left transition-colors">
                    📎 Paper Clip
                  </button>
                  <button onClick={() => addItem('highlighter-mark')} className="p-2 bg-[var(--bg-card)] hover:bg-[var(--text-main)] hover:text-[var(--bg-main)] border border-[var(--border-color)] text-left transition-colors">
                    🖍️ Highlighter
                  </button>
                  <button onClick={() => addItem('sticky-arrow')} className="p-2 bg-[var(--bg-card)] hover:bg-[var(--text-main)] hover:text-[var(--bg-main)] border border-[var(--border-color)] text-left transition-colors">
                    ➡️ Arrow
                  </button>
                  <button onClick={() => addItem('washi-tape')} className="p-2 bg-[var(--bg-card)] hover:bg-[var(--text-main)] hover:text-[var(--bg-main)] border border-[var(--border-color)] text-left transition-colors">
                    🎀 Washi Tape
                  </button>
                </div>
                
                {/* Animation presets */}
                <div className="border-t border-[var(--border-color)] pt-3">
                  <div className="text-xs font-black uppercase tracking-widest mb-2">Animation Presets:</div>
                  <div className="grid grid-cols-2 gap-1">
                    {animationPresets.map(preset => (
                      <button
                        key={preset.id}
                        onClick={() => applyAnimationToSelected(preset)}
                        className="px-2 py-1 bg-[var(--bg-card)] hover:bg-[var(--text-main)] hover:text-[var(--bg-main)] border border-[var(--border-color)] text-xs font-mono uppercase transition-colors disabled:opacity-50"
                        disabled={selectedItems.length === 0}
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Settings menu */}
          <AnimatePresence>
            {showSettingsMenu && (
              <motion.div
                className="absolute top-16 right-0 bg-[var(--bg-card)] border border-[var(--border-color)] p-4 min-w-[300px] shadow-none"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="text-sm font-black uppercase tracking-widest mb-3 border-b border-[var(--border-color)] pb-1">Workspace Settings:</div>
                
                {/* Drawing tools */}
                {enableDrawing && (
                  <div className="mb-4">
                    <div className="text-xs font-bold mb-2 font-mono uppercase">Drawing Tools:</div>
                    <div className="flex gap-1 mb-2 flex-wrap">
                      {(['pen', 'pencil', 'highlighter', 'eraser', 'brush', 'marker'] as const).map(tool => (
                        <button
                          key={tool}
                          onClick={() => setSelectedTool(tool)}
                          className={`px-2.5 py-1 border border-[var(--border-color)] text-xs font-mono uppercase ${
                            selectedTool === tool 
                              ? 'bg-[var(--text-main)] text-[var(--bg-main)]' 
                              : 'bg-[var(--bg-card)] hover:bg-[var(--text-main)] hover:text-[var(--bg-main)]'
                          }`}
                        >
                          {tool}
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={selectedColor}
                        onChange={(e) => setSelectedColor(e.target.value)}
                        className="w-8 h-8 border border-[var(--border-color)]"
                      />
                      <input
                        type="range"
                        min="1"
                        max="20"
                        value={strokeWidth}
                        onChange={(e) => setStrokeWidth(Number(e.target.value))}
                        className="flex-1 accent-[var(--text-main)]"
                      />
                    </div>
                  </div>
                )}

                {/* Physics toggle */}
                {enablePhysics && (
                  <div className="mb-4">
                    <div className="text-xs font-bold mb-2 font-mono uppercase">Physics:</div>
                    <button
                      onClick={() => {/* Toggle physics */}}
                      className="px-3 py-1 bg-[var(--bg-card)] hover:bg-[var(--text-main)] hover:text-[var(--bg-main)] border border-[var(--border-color)] text-xs font-mono uppercase transition-colors"
                    >
                      {`Enable Physics`}
                    </button>
                  </div>
                )}

                {/* Collaboration settings */}
                {enableCollaboration && (
                  <div className="mb-4">
                    <div className="text-xs font-bold mb-2 font-mono uppercase">Collaboration:</div>
                    <button
                      onClick={() => {/* Toggle collaboration */}}
                      className="px-3 py-1 bg-[var(--bg-card)] hover:bg-[var(--text-main)] hover:text-[var(--bg-main)] border border-[var(--border-color)] text-xs font-mono uppercase transition-colors"
                    >
                      {`Enable Collaboration`}
                    </button>
                  </div>
                )}

                {/* Theme selector */}
                <div>
                  <div className="text-xs font-bold mb-2 font-mono uppercase">Theme:</div>
                  <div className="flex gap-2 flex-wrap">
                    {(['light', 'dark', 'sepia', 'neon'] as const).map(t => (
                      <button
                        key={t}
                        onClick={() => setTheme(t)}                        className={`px-3 py-1 border border-[var(--border-color)] text-xs font-mono uppercase transition-colors ${
                          currentTheme === t 
                            ? 'bg-[var(--text-main)] text-[var(--bg-main)]' 
                            : 'bg-[var(--bg-card)] hover:bg-[var(--text-main)] hover:text-[var(--bg-main)]'
                        }`}
                      >
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default ScribbleWorkspace;
