'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { StickyNote, SketchCard, SketchHeading } from '../../ui/sketch-elements';

// Types for draggable items
export interface DraggableItem {
  id: string;
  type: 'sticky-note' | 'sketch-card' | 'photo' | 'doodle' | 'text-block' | 'sketch-element';
  content: React.ReactNode;
  position: { x: number; y: number };
  rotation?: number;
  scale?: number;
  color?: 'light' | 'medium' | 'dark' | 'white';
  size?: 'sm' | 'md' | 'lg';
  locked?: boolean;
  zIndex?: number;
}

interface DraggableNotebookProps {
  items: DraggableItem[];
  onItemsChange?: (items: DraggableItem[]) => void;
  allowEditing?: boolean;
  showControls?: boolean;
  className?: string;
  gridSnap?: boolean;
  bounds?: { left: number; right: number; top: number; bottom: number };
}

// Individual draggable item component
const DraggableNotebookItem: React.FC<{
  item: DraggableItem;
  onUpdate: (id: string, updates: Partial<DraggableItem>) => void;
  onDelete?: (id: string) => void;
  allowEditing?: boolean;
  gridSnap?: boolean;
  bounds?: { left: number; right: number; top: number; bottom: number };
  isSelected?: boolean;
  onSelect?: (id: string) => void;
}> = ({ 
  item, 
  onUpdate, 
  onDelete, 
  allowEditing = true, 
  gridSnap = false, 
  bounds,
  isSelected = false,
  onSelect
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const dragControls = useDragControls();
  const itemRef = useRef<HTMLDivElement>(null);

  const handleDragStart = () => {
    setIsDragging(true);
    onSelect?.(item.id);
  };

  // New drag handler for real-time updates
  const handleDrag = (event: any, info: any) => {
    // Real-time position updates during drag for smoother experience
    let newX = item.position.x + info.offset.x;
    let newY = item.position.y + info.offset.y;

    // Apply bounds if specified
    if (bounds && itemRef.current) {
      const rect = itemRef.current.getBoundingClientRect();
      newX = Math.max(bounds.left, Math.min(bounds.right - rect.width, newX));
      newY = Math.max(bounds.top, Math.min(bounds.bottom - rect.height, newY));
    }

    // Update position in real-time for smooth dragging
    onUpdate(item.id, { 
      position: { x: newX, y: newY }
    });
  };

  const handleDragEnd = (event: any, info: any) => {
    setIsDragging(false);
    
    // Apply grid snap if enabled (only at the end)
    if (gridSnap) {
      const gridSize = 20;
      const snappedX = Math.round(item.position.x / gridSize) * gridSize;
      const snappedY = Math.round(item.position.y / gridSize) * gridSize;
      
      onUpdate(item.id, { 
        position: { x: snappedX, y: snappedY }
      });
    }
    
    // Bring to front when moved
    onUpdate(item.id, { 
      zIndex: (item.zIndex ?? 0) + 1
    });
  };
  const handleRotate = () => {
    const newRotation = ((item.rotation ?? 0) + 15) % 360;
    onUpdate(item.id, { rotation: newRotation });
  };
  const handleSelect = () => {
    onSelect?.(item.id);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect?.(item.id);
    }
  };

  const handleResize = (direction: 'up' | 'down') => {
    const currentScale = item.scale ?? 1;
    const newScale = direction === 'up' 
      ? Math.min(currentScale + 0.1, 2) 
      : Math.max(currentScale - 0.1, 0.5);
    onUpdate(item.id, { scale: newScale });
  };

  const renderContent = () => {
    switch (item.type) {
      case 'sticky-note':
        return (
          <StickyNote 
            color={item.color} 
            size={item.size}
            className="w-full h-full cursor-move"
          >
            {item.content}
          </StickyNote>
        );
      
      case 'sketch-card':
        return (
          <SketchCard className="cursor-move p-4 min-w-[200px] min-h-[150px]">
            {item.content}
          </SketchCard>
        );
      
      case 'photo':
        return (
          <div className="cursor-move bg-white p-2 shadow-lg border-2 border-gray-200 rounded-sm transform rotate-1">
            <div className="bg-gray-100 aspect-square rounded-sm overflow-hidden">
              {item.content}
            </div>
            <div className="text-xs text-gray-500 mt-1 handwritten">Photo</div>
          </div>
        );
      
      case 'doodle':
        return (
          <div className="cursor-move p-2 bg-transparent">
            <svg 
              width="80" 
              height="80" 
              className="stroke-current text-gray-700"
              style={{ filter: 'url(#roughen)' }}
            >
              <defs>
                <filter id="roughen">
                  <feTurbulence baseFrequency="0.04" numOctaves="3" result="noise" seed="1" />
                  <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.8" />
                </filter>
              </defs>
              {item.content}
            </svg>
          </div>
        );
      
      case 'text-block':
        return (
          <div className="cursor-move bg-white/80 p-3 border border-gray-300 rounded-sm max-w-[250px]">
            <div className="handwritten text-sm text-gray-800">
              {item.content}
            </div>
          </div>
        );
      
      default:
        return (
          <div className="cursor-move p-2">
            {item.content}
          </div>
        );
    }
  };

  return (
    <motion.div
      ref={itemRef}
      className={`absolute select-none ${item.locked ? 'cursor-not-allowed' : ''}`}
      style={{
        x: item.position.x,
        y: item.position.y,
        rotate: item.rotation ?? 0,
        scale: item.scale ?? 1,
        zIndex: item.zIndex ?? 0,
      }}
      drag={allowEditing && !item.locked}
      dragControls={dragControls}
      dragElastic={0.1}
      dragMomentum={false}
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={handleSelect}
      onKeyDown={handleKeyDown}
      tabIndex={allowEditing && !item.locked ? 0 : -1}
      aria-label={`Draggable ${item.type} - ${typeof item.content === 'string' ? item.content : item.type + ' item'}`}
      whileHover={{ scale: (item.scale ?? 1) * 1.02 }}
      whileDrag={{ 
        scale: (item.scale ?? 1) * 1.05,
        rotate: (item.rotation ?? 0) + (Math.random() - 0.5) * 4,
        zIndex: 1000
      }}
      animate={{
        boxShadow: (() => {
          if (isDragging) return '0 8px 25px rgba(0,0,0,0.15)';
          if (isSelected) return '0 0 0 2px #000';
          return '0 2px 10px rgba(0,0,0,0.1)';
        })()
      }}
      transition={{ type: "spring", damping: 20, stiffness: 300 }}
    >
      {renderContent()}
      
      {/* Controls overlay - show on hover/selection */}
      <AnimatePresence>
        {allowEditing && (isHovered || isSelected) && !item.locked && (
          <motion.div
            className="absolute -top-2 -right-2 flex gap-1"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            {/* Rotate button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRotate();
              }}
              className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-xs hover:bg-gray-800 transition-colors"
              title="Rotate"
            >
              ↻
            </button>
            
            {/* Scale up button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleResize('up');
              }}
              className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-xs hover:bg-gray-800 transition-colors"
              title="Make larger"
            >
              +
            </button>
            
            {/* Scale down button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleResize('down');
              }}
              className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-xs hover:bg-gray-800 transition-colors"
              title="Make smaller"
            >
              −
            </button>
            
            {/* Delete button */}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(item.id);
                }}
                className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                title="Delete"
              >
                ×
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Locked indicator */}
      {item.locked && (
        <div className="absolute top-1 right-1 w-4 h-4 bg-gray-400 rounded-full flex items-center justify-center">
          <span className="text-white text-xs">🔒</span>
        </div>
      )}
    </motion.div>
  );
};

// Main draggable notebook component
export const DraggableNotebook: React.FC<DraggableNotebookProps> = ({
  items: initialItems,
  onItemsChange,
  allowEditing = true,
  showControls = true,
  className = '',
  gridSnap = false,
  bounds
}) => {
  const [items, setItems] = useState<DraggableItem[]>(initialItems);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const containerRef = useRef<HTMLElement>(null);

  // Update items when props change
  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  // Call onItemsChange only when items actually change, not during render
  useEffect(() => {
    if (onItemsChange) {
      onItemsChange(items);
    }
  }, [items, onItemsChange]);

  const updateItem = useCallback((id: string, updates: Partial<DraggableItem>) => {
    setItems(prev => {
      const newItems = prev.map(item => 
        item.id === id ? { ...item, ...updates } : item
      );
      return newItems;
    });
  }, []);

  const deleteItem = useCallback((id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
    setSelectedItemId(null);
  }, []);

  const addItem = useCallback((type: DraggableItem['type'], content: React.ReactNode) => {
    const newItem: DraggableItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      type,
      content,
      position: { 
        x: Math.random() * 300 + 50, 
        y: Math.random() * 200 + 50 
      },
      rotation: (Math.random() - 0.5) * 10, // Slight random rotation
      scale: 1,
      zIndex: items.length
    };
    setItems(prev => [...prev, newItem]);
    setShowAddMenu(false);
  }, [items.length]);

  const handleContainerClick = (e: React.MouseEvent) => {
    if (e.target === containerRef.current) {
      setSelectedItemId(null);
    }
  };

  const handleContainerKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setSelectedItemId(null);
    }
  };

  const clearAll = () => {
    setItems([]);
    setSelectedItemId(null);
  };

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      {/* Notebook background with subtle grid */}
      <section 
        ref={containerRef}
        className="w-full h-full bg-white notebook-bg relative"
        aria-label="Interactive notebook workspace"
        style={{
          backgroundImage: gridSnap 
            ? 'radial-gradient(circle, #ddd 1px, transparent 1px)' 
            : 'none',
          backgroundSize: gridSnap ? '20px 20px' : 'auto'
        }}
      >
        {/* Notebook holes */}
        <div className="absolute left-8 top-0 bottom-0 w-px bg-red-300 opacity-30" />
        
        {/* Invisible click handler for deselection */}
        <button
          className="absolute inset-0 w-full h-full bg-transparent border-0 cursor-default"
          onClick={handleContainerClick}
          onKeyDown={handleContainerKeyDown}
          aria-label="Click to deselect items or press Escape"
          style={{ zIndex: -1 }}
        />
        
        {/* Render all draggable items */}
        {items.map((item) => (
          <DraggableNotebookItem
            key={item.id}
            item={item}
            onUpdate={updateItem}
            onDelete={allowEditing ? deleteItem : undefined}
            allowEditing={allowEditing}
            gridSnap={gridSnap}
            bounds={bounds}
            isSelected={selectedItemId === item.id}
            onSelect={setSelectedItemId}
          />
        ))}
      </section>

      {/* Control panel */}
      {showControls && allowEditing && (
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm border-2 border-black rounded-lg p-2 sketch-border">
          <div className="flex flex-col gap-2">
            {/* Add items button */}
            <button
              onClick={() => setShowAddMenu(!showAddMenu)}
              className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors"
              title="Add items"
            >
              +
            </button>

            {/* Grid snap toggle */}
            <button
              onClick={() => {/* Grid snap toggle logic would go here */}}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                gridSnap ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
              }`}
              title="Toggle grid snap"
            >
              ⊞
            </button>

            {/* Clear all button */}
            <button
              onClick={clearAll}
              className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
              title="Clear all"
            >
              🗑
            </button>
          </div>

          {/* Add menu */}
          <AnimatePresence>
            {showAddMenu && (
              <motion.div
                className="absolute top-0 right-12 bg-white border-2 border-black rounded-lg p-2 min-w-[200px] sketch-border"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
              >
                <div className="text-xs font-bold mb-2 handwritten">Add Items:</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    onClick={() => addItem('sticky-note', '📝 Quick note')}
                    className="p-2 bg-yellow-100 hover:bg-yellow-200 rounded border border-yellow-300 transition-colors"
                  >
                    Sticky Note
                  </button>
                  <button
                    onClick={() => addItem('sketch-card', <SketchHeading level={3}>Card</SketchHeading>)}
                    className="p-2 bg-gray-100 hover:bg-gray-200 rounded border border-gray-300 transition-colors"
                  >
                    Sketch Card
                  </button>
                  <button
                    onClick={() => addItem('photo', <div className="w-full h-full bg-gradient-to-br from-blue-200 to-purple-200" />)}
                    className="p-2 bg-blue-100 hover:bg-blue-200 rounded border border-blue-300 transition-colors"
                  >
                    Photo
                  </button>
                  <button
                    onClick={() => addItem('doodle', <circle cx="40" cy="40" r="30" fill="none" stroke="currentColor" strokeWidth="2" />)}
                    className="p-2 bg-green-100 hover:bg-green-200 rounded border border-green-300 transition-colors"
                  >
                    Doodle
                  </button>
                  <button
                    onClick={() => addItem('text-block', 'This is a text block that you can move around!')}
                    className="p-2 bg-purple-100 hover:bg-purple-200 rounded border border-purple-300 transition-colors col-span-2"
                  >
                    Text Block
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Instructions */}
      {items.length === 0 && allowEditing && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center text-gray-500 handwritten">
            <div className="text-2xl mb-2">📝</div>
            <div className="text-lg mb-1">Your interactive notebook</div>
            <div className="text-sm">Click the + button to add items and drag them around!</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DraggableNotebook;
