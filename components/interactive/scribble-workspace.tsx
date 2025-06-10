'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, useDragControls, PanInfo } from 'framer-motion';

// Scribble-themed draggable components
export interface ScribbleDragItem {
  id: string;
  type: 'scribble-note' | 'paper-scrap' | 'tape-piece' | 'coffee-stain' | 'pencil-mark' | 'eraser-mark';
  position: { x: number; y: number };
  rotation?: number;
  content?: string;
  color?: string;
  size?: number;
}

// Paper scrap component
export const DraggablePaperScrap: React.FC<{
  id: string;
  initialPosition: { x: number; y: number };
  content: string;
  onPositionChange?: (id: string, position: { x: number; y: number }) => void;
  className?: string;
}> = ({ id, initialPosition, content, onPositionChange, className = '' }) => {
  const [isDragging, setIsDragging] = useState(false);
  const dragControls = useDragControls();

  const handleDragEnd = (event: any, info: PanInfo) => {
    setIsDragging(false);
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
      dragControls={dragControls}
      dragElastic={0.1}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={handleDragEnd}
      whileHover={{ scale: 1.02, rotate: (Math.random() - 0.5) * 2 }}
      whileDrag={{ 
        scale: 1.05, 
        rotate: (Math.random() - 0.5) * 5,
        zIndex: 100 
      }}
      style={{
        filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.1))'
      }}
    >
      <div 
        className="bg-white p-3 border-2 border-gray-300 rounded-sm transform"
        style={{
          transform: `rotate(${(Math.random() - 0.5) * 8}deg)`,
          clipPath: 'polygon(0% 0%, 95% 0%, 100% 90%, 85% 100%, 0% 95%)', // Torn paper effect
          background: `
            linear-gradient(45deg, transparent 8%, white 8%, white 12%, transparent 12%),
            linear-gradient(-45deg, transparent 8%, white 8%, white 12%, transparent 12%),
            white
          `,
          backgroundSize: '8px 8px, 8px 8px, 100% 100%'
        }}
      >
        <div className="handwritten text-sm text-gray-800 leading-relaxed">
          {content}
        </div>
      </div>
    </motion.div>
  );
};

// Tape piece component  
export const DraggableTape: React.FC<{
  id: string;
  initialPosition: { x: number; y: number };
  rotation?: number;
  onPositionChange?: (id: string, position: { x: number; y: number }) => void;
  className?: string;
}> = ({ id, initialPosition, rotation = 0, onPositionChange, className = '' }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnd = (event: any, info: PanInfo) => {
    setIsDragging(false);
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
      onDragStart={() => setIsDragging(true)}
      onDragEnd={handleDragEnd}
      whileHover={{ scale: 1.02 }}
      whileDrag={{ scale: 1.05, zIndex: 100 }}
    >
      <div 
        className="w-16 h-6 bg-yellow-100 border border-yellow-200 rounded-sm opacity-70"
        style={{
          transform: `rotate(${rotation}deg)`,
          background: `
            repeating-linear-gradient(
              90deg,
              rgba(255, 255, 0, 0.1),
              rgba(255, 255, 0, 0.1) 2px,
              rgba(255, 255, 0, 0.05) 2px,
              rgba(255, 255, 0, 0.05) 4px
            ),
            linear-gradient(to bottom, #fef3c7, #fde68a)
          `,
          boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)'
        }}
      />
    </motion.div>
  );
};

// Coffee stain component
export const DraggableCoffeeStain: React.FC<{
  id: string;
  initialPosition: { x: number; y: number };
  size?: number;
  onPositionChange?: (id: string, position: { x: number; y: number }) => void;
  className?: string;
}> = ({ id, initialPosition, size = 40, onPositionChange, className = '' }) => {
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
      whileHover={{ scale: 1.05 }}
      whileDrag={{ scale: 1.1, zIndex: 100 }}
    >
      <div 
        className="rounded-full opacity-20"
        style={{
          width: size,
          height: size,
          background: `
            radial-gradient(circle at 30% 30%, 
              rgba(139, 69, 19, 0.3) 0%, 
              rgba(139, 69, 19, 0.2) 40%, 
              rgba(139, 69, 19, 0.1) 70%, 
              transparent 100%
            )
          `,
          filter: 'blur(1px)'
        }}
      />
      {/* Ring stain effect */}
      <div 
        className="absolute top-1 left-1 rounded-full border border-amber-900 opacity-10"
        style={{
          width: size - 8,
          height: size - 8,
        }}
      />
    </motion.div>
  );
};

// Pencil mark/scribble component
export const DraggablePencilMark: React.FC<{
  id: string;
  initialPosition: { x: number; y: number };
  path: string;
  onPositionChange?: (id: string, position: { x: number; y: number }) => void;
  className?: string;
}> = ({ id, initialPosition, path, onPositionChange, className = '' }) => {
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
      whileHover={{ scale: 1.02 }}
      whileDrag={{ scale: 1.05, zIndex: 100 }}
    >
      <svg width="80" height="80" className="pointer-events-none">
        <defs>
          <filter id="pencil-texture">
            <feTurbulence baseFrequency="0.9" numOctaves="4" result="noise" seed="2" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.5" />
          </filter>
        </defs>
        <path
          d={path}
          stroke="#374151"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ filter: 'url(#pencil-texture)' }}
          opacity={0.7}
        />
      </svg>
    </motion.div>
  );
};

// Eraser mark component
export const DraggableEraserMark: React.FC<{
  id: string;
  initialPosition: { x: number; y: number };
  onPositionChange?: (id: string, position: { x: number; y: number }) => void;
  className?: string;
}> = ({ id, initialPosition, onPositionChange, className = '' }) => {
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
      whileHover={{ scale: 1.02 }}
      whileDrag={{ scale: 1.05, zIndex: 100 }}
    >
      <div 
        className="w-12 h-6 rounded-lg opacity-30"
        style={{
          background: `
            repeating-linear-gradient(
              45deg,
              rgba(255, 255, 255, 0.8),
              rgba(255, 255, 255, 0.8) 2px,
              rgba(240, 240, 240, 0.6) 2px,
              rgba(240, 240, 240, 0.6) 4px
            )
          `,
          border: '1px solid rgba(200, 200, 200, 0.3)',
          filter: 'blur(0.5px)'
        }}
      />
    </motion.div>
  );
};

// Scribble workspace component that combines everything
export const ScribbleWorkspace: React.FC<{
  className?: string;
  initialItems?: ScribbleDragItem[];
  onItemsChange?: (items: ScribbleDragItem[]) => void;
  showAddButton?: boolean;
}> = ({ 
  className = '', 
  initialItems = [], 
  onItemsChange,
  showAddButton = true 
}) => {  const [items, setItems] = useState<ScribbleDragItem[]>(initialItems);
  const [showMenu, setShowMenu] = useState(false);
  const workspaceRef = useRef<HTMLDivElement>(null);

  // Update items when props change
  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  // Call onItemsChange only when items actually change, not during render
  useEffect(() => {
    if (onItemsChange) {
      onItemsChange(items);
    }
  }, [items, onItemsChange]);  const updateItemPosition = useCallback((id: string, position: { x: number; y: number }) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, position } : item
    ));
  }, []);

  const addItem = (type: ScribbleDragItem['type']) => {
    const newItem: ScribbleDragItem = {
      id: `scribble-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      type,
      position: { 
        x: Math.random() * 400 + 50, 
        y: Math.random() * 300 + 50 
      },
      rotation: (Math.random() - 0.5) * 30,
      content: type === 'scribble-note' ? 'Your note here...' : undefined,
      size: type === 'coffee-stain' ? Math.random() * 30 + 30 : undefined
    };    setItems(prev => [...prev, newItem]);
    setShowMenu(false);
  };
  const renderItem = (item: ScribbleDragItem) => {
    const commonProps = {
      id: item.id,
      initialPosition: item.position,
      onPositionChange: updateItemPosition
    };

    switch (item.type) {
      case 'paper-scrap':
        return (
          <DraggablePaperScrap
            key={item.id}
            {...commonProps}
            content={item.content || 'Paper scrap'}
          />
        );
      case 'tape-piece':
        return (
          <DraggableTape
            key={item.id}
            {...commonProps}
            rotation={item.rotation}
          />
        );
      case 'coffee-stain':
        return (
          <DraggableCoffeeStain
            key={item.id}
            {...commonProps}
            size={item.size}
          />
        );
      case 'pencil-mark':
        return (
          <DraggablePencilMark
            key={item.id}
            {...commonProps}
            path="M10,10 Q20,5 30,15 T50,20 Q60,25 70,15"
          />
        );
      case 'eraser-mark':
        return (
          <DraggableEraserMark
            key={item.id}
            {...commonProps}
          />
        );
      default:
        return null;
    }
  };
  return (
    <div 
      ref={workspaceRef}
      className={`relative w-full h-full overflow-hidden bg-white notebook-bg ${className}`}
    >
      {/* Render all items */}
      {items.map(renderItem)}

      {/* Add button */}
      {showAddButton && (
        <div className="absolute top-4 right-4">
          <motion.button
            onClick={() => setShowMenu(!showMenu)}
            className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center text-xl hover:bg-gray-800 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            +
          </motion.button>

          {/* Add menu */}
          {showMenu && (
            <motion.div
              className="absolute top-16 right-0 bg-white border-2 border-black rounded-lg p-3 min-w-[200px] sketch-border"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="text-sm font-bold mb-3 handwritten">Add Scribble Items:</div>
              <div className="grid grid-cols-1 gap-2 text-sm">
                <button
                  onClick={() => addItem('paper-scrap')}
                  className="p-2 bg-gray-100 hover:bg-gray-200 rounded text-left transition-colors"
                >
                  📄 Paper Scrap
                </button>
                <button
                  onClick={() => addItem('tape-piece')}
                  className="p-2 bg-yellow-100 hover:bg-yellow-200 rounded text-left transition-colors"
                >
                  📏 Tape Piece
                </button>
                <button
                  onClick={() => addItem('coffee-stain')}
                  className="p-2 bg-amber-100 hover:bg-amber-200 rounded text-left transition-colors"
                >
                  ☕ Coffee Stain
                </button>
                <button
                  onClick={() => addItem('pencil-mark')}
                  className="p-2 bg-gray-100 hover:bg-gray-200 rounded text-left transition-colors"
                >
                  ✏️ Pencil Mark
                </button>
                <button
                  onClick={() => addItem('eraser-mark')}
                  className="p-2 bg-gray-100 hover:bg-gray-200 rounded text-left transition-colors"
                >
                  🧽 Eraser Mark
                </button>
              </div>
            </motion.div>
          )}
        </div>
      )}      {/* Instructions when empty */}
      {items.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center text-gray-500 handwritten">
            <div className="text-3xl mb-3">✏️</div>
            <div className="text-lg mb-2">Interactive Scribble Workspace</div>
            <div className="text-sm">Add notebook-style elements and drag them around!</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScribbleWorkspace;
