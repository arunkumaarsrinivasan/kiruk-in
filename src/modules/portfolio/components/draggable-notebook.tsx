'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { StickyNote, SketchCard, SketchHeading } from '@/components/ui/sketch-elements';
import { useCursor } from '@/components/ui/CursorContext';
import { GRID_SIZE, snapPositionToGrid } from '@/lib/utils';

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

const formatItemsForGrid = (list: DraggableItem[], active: boolean) =>
  list.map(item => ({
    ...item,
    position: active ? snapPositionToGrid(item.position, GRID_SIZE) : item.position
  }));

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
  const dragOriginRef = useRef(item.position);
  const { setGrabCursor, setGrabbingCursor, setDroppingCursor, setEyeCursor } = useCursor();
  const snapPosition = useCallback(
    (position: { x: number; y: number }) => (gridSnap ? snapPositionToGrid(position, GRID_SIZE) : position),
    [gridSnap]
  );

  const handleDragStart = () => {
    dragOriginRef.current = item.position;
    setIsDragging(true);
    setGrabbingCursor();
    onSelect?.(item.id);
  };

  // New drag handler for real-time updates
  const handleDrag = (event: any, info: any) => {
    // Real-time position updates during drag for smoother experience
    const origin = dragOriginRef.current;
    let newX = origin.x + info.offset.x;
    let newY = origin.y + info.offset.y;

    // Apply bounds if specified
    if (bounds && itemRef.current) {
      const rect = itemRef.current.getBoundingClientRect();
      newX = Math.max(bounds.left, Math.min(bounds.right - rect.width, newX));
      newY = Math.max(bounds.top, Math.min(bounds.bottom - rect.height, newY));
    }

    // Update position in real-time for smooth dragging
    onUpdate(item.id, { 
      position: snapPosition({ x: newX, y: newY })
    });
  };

  const handleDragEnd = (event: any, info: any) => {
    setIsDragging(false);
    setDroppingCursor(); // Show dropping animation briefly
    
    // Brief dropping cursor before returning to eye
    setTimeout(() => {
      setEyeCursor();
    }, 150);
    
    // Apply grid snap if enabled (only at the end)
    const snappedPosition = snapPosition(item.position);

    // Snap to grid and bring to front when released
    onUpdate(item.id, { 
      position: snappedPosition,
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
          <div className="cursor-move bg-[var(--bg-card)] p-2 shadow-none border border-[var(--border-color)] rounded-none transform rotate-0">
            <div className="bg-[var(--bg-secondary)] aspect-square rounded-none overflow-hidden border border-[var(--border-color)]">
              {item.content}
            </div>
            <div className="text-[10px] text-[var(--text-main)] mt-1 font-mono uppercase tracking-widest">Photo</div>
          </div>
        );
      
      case 'doodle':
        return (
          <div className="cursor-move p-2 bg-transparent">
            <svg 
              width="80" 
              height="80" 
              className="stroke-current text-[var(--text-main)]"
            >
              {item.content}
            </svg>
          </div>
        );
      
      case 'text-block':
        return (
          <div className="cursor-move bg-[var(--bg-card)] p-3 border border-[var(--border-color)] shadow-none rounded-none max-w-[250px]">
            <div className="font-mono text-xs text-[var(--text-main)] uppercase leading-relaxed">
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
      onHoverStart={() => {
        setIsHovered(true);
        if (allowEditing && !item.locked) {
          setGrabCursor();
        }
      }}
      onHoverEnd={() => {
        setIsHovered(false);
        if (!isDragging) {
          setEyeCursor();
        }
      }}
      onClick={handleSelect}
      onKeyDown={handleKeyDown}
      tabIndex={allowEditing && !item.locked ? 0 : -1}
      aria-label={`Draggable ${item.type} - ${typeof item.content === 'string' ? item.content : item.type + ' item'}`}
      whileHover={{ scale: (item.scale ?? 1) * 1.02 }}
      whileDrag={{ 
        scale: (item.scale ?? 1) * 1.05,
        rotate: (item.rotation ?? 0),
        zIndex: 1000
      }}
      animate={{
        boxShadow: (() => {
          if (isDragging) return '8px 8px 0 var(--border-color)';
          if (isSelected) return '0 0 0 2px var(--border-color)';
          return 'none';
        })()
      }}
      transition={{ type: "spring", damping: 20, stiffness: 300 }}
    >
      {renderContent()}
      
      {/* Controls overlay - show on hover/selection */}
      <AnimatePresence>
        {allowEditing && (isHovered || isSelected) && !item.locked && (
          <motion.div
            className="absolute -top-5 -right-5 flex gap-1"
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
              className="w-6 h-6 bg-[var(--bg-card)] text-[var(--text-main)] border border-[var(--border-color)] flex items-center justify-center text-xs hover:bg-[var(--text-main)] hover:text-[var(--bg-main)] transition-colors"
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
              className="w-6 h-6 bg-[var(--bg-card)] text-[var(--text-main)] border border-[var(--border-color)] flex items-center justify-center text-xs hover:bg-[var(--text-main)] hover:text-[var(--bg-main)] transition-colors"
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
              className="w-6 h-6 bg-[var(--bg-card)] text-[var(--text-main)] border border-[var(--border-color)] flex items-center justify-center text-xs hover:bg-[var(--text-main)] hover:text-[var(--bg-main)] transition-colors"
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
                className="w-6 h-6 bg-[var(--text-main)] text-[var(--bg-main)] border border-[var(--border-color)] flex items-center justify-center text-xs hover:bg-[var(--bg-main)] hover:text-[var(--text-main)] transition-colors"
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
        <div className="absolute top-1 right-1 w-4 h-4 bg-[var(--text-main)] flex items-center justify-center border border-[var(--bg-main)]">
          <span className="text-[var(--bg-main)] text-[10px]">🔒</span>
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
  gridSnap = true,
  bounds
}) => {
  const [items, setItems] = useState<DraggableItem[]>(() => formatItemsForGrid(initialItems, gridSnap));
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const containerRef = useRef<HTMLElement>(null);
  const [isGridActive, setIsGridActive] = useState(gridSnap);

  const snapPosition = useCallback(
    (position: { x: number; y: number }, activeFlag?: boolean) => {
      const shouldSnap = activeFlag ?? isGridActive;
      return shouldSnap ? snapPositionToGrid(position, GRID_SIZE) : position;
    },
    [isGridActive]
  );

  const normalizeItems = useCallback(
    (list: DraggableItem[], activeFlag?: boolean) =>
      list.map(item => ({
        ...item,
        position: snapPosition(item.position, activeFlag)
      })),
    [snapPosition]
  );

  // Update items when props change
  useEffect(() => {
    setItems(normalizeItems(initialItems));
  }, [initialItems, normalizeItems]);

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
      position: snapPosition({ 
        x: Math.random() * 300 + 40, 
        y: Math.random() * 200 + 40 
      }),
      rotation: 0, // No rotation for wireframe
      scale: 1,
      zIndex: items.length
    };
    setItems(prev => [...prev, newItem]);
    setShowAddMenu(false);
  }, [items.length, snapPosition]);

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

  const toggleGridSnap = () => {
    setIsGridActive(prev => {
      const next = !prev;
      if (next) {
        setItems(current => normalizeItems(current, true));
      }
      return next;
    });
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
        className="w-full h-full bg-white relative"
        aria-label="Interactive notebook workspace"
        style={{
          backgroundImage: 'linear-gradient(#e5e5e5 1px, transparent 1px), linear-gradient(90deg, #e5e5e5 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}
      >
        
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
            gridSnap={isGridActive}
            bounds={bounds}
            isSelected={selectedItemId === item.id}
            onSelect={setSelectedItemId}
          />
        ))}
      </section>

      {/* Control panel */}
      {showControls && allowEditing && (
        <div className="absolute top-4 right-4 bg-white border border-black p-2 shadow-none">
          <div className="flex flex-col gap-2">
            {/* Add items button */}
            <button
              onClick={() => setShowAddMenu(!showAddMenu)}
              className="w-8 h-8 bg-black text-white border border-black flex items-center justify-center hover:bg-white hover:text-black transition-colors"
              title="Add items"
            >
              +
            </button>

            {/* Grid snap toggle */}
            <button
              onClick={toggleGridSnap}
              className={`w-8 h-8 flex items-center justify-center transition-colors border border-black ${
                isGridActive ? 'bg-black text-white' : 'bg-white text-black'
              }`}
              title="Toggle grid snap"
              aria-pressed={isGridActive}
            >
              ⊞
            </button>

            {/* Clear all button */}
            <button
              onClick={clearAll}
              className="w-8 h-8 bg-white text-black border border-black flex items-center justify-center hover:bg-black hover:text-white transition-colors"
              title="Clear all"
            >
              🗑
            </button>
          </div>

          {/* Add menu */}
          <AnimatePresence>
            {showAddMenu && (
              <motion.div
                className="absolute top-0 right-12 bg-white border border-black p-2 min-w-[200px] shadow-none"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
              >
                <div className="text-xs font-black uppercase tracking-widest mb-2 border-b border-black pb-1">Add Items:</div>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono uppercase">
                  <button
                    onClick={() => addItem('sticky-note', '📝 Quick note')}
                    className="p-2 bg-white hover:bg-black hover:text-white border border-black transition-colors"
                  >
                    Sticky Note
                  </button>
                  <button
                    onClick={() => addItem('sketch-card', <SketchHeading level={3}>Card</SketchHeading>)}
                    className="p-2 bg-white hover:bg-black hover:text-white border border-black transition-colors"
                  >
                    Sketch Card
                  </button>
                  <button
                    onClick={() => addItem('photo', <div className="w-full h-full bg-gray-100 border border-black" />)}
                    className="p-2 bg-white hover:bg-black hover:text-white border border-black transition-colors"
                  >
                    Photo
                  </button>
                  <button
                    onClick={() => addItem('doodle', <circle cx="40" cy="40" r="30" fill="none" stroke="currentColor" strokeWidth="2" />)}
                    className="p-2 bg-white hover:bg-black hover:text-white border border-black transition-colors"
                  >
                    Doodle
                  </button>
                  <button
                    onClick={() => addItem('text-block', 'This is a text block that you can move around!')}
                    className="p-2 bg-white hover:bg-black hover:text-white border border-black transition-colors col-span-2"
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
          <div className="text-center text-black font-mono uppercase tracking-widest">
            <div className="text-2xl mb-2">📝</div>
            <div className="text-lg mb-1 font-black">Your wireframe workspace</div>
            <div className="text-xs">Click the + button to add items and drag them around!</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DraggableNotebook;
