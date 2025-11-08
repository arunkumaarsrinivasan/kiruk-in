'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DraggableNotebook, DraggableItem } from './draggable-notebook';

// Quick interactive overlay that can be added to any page
export const InteractiveOverlay: React.FC<{
  isVisible?: boolean;
  onToggle?: (visible: boolean) => void;
  initialItems?: DraggableItem[];
  className?: string;
}> = ({ 
  isVisible = false, 
  onToggle,
  initialItems = [],
  className = '' 
}) => {
  const [items, setItems] = useState<DraggableItem[]>(initialItems);

  const quickItems: DraggableItem[] = [
    {
      id: 'quick-note-1',
      type: 'sticky-note',
      content: (
        <div className="handwritten text-sm">
          <div className="font-bold mb-1">💡 Quick Idea</div>
          <div>This is a draggable note!</div>
        </div>
      ),
      position: { x: 100, y: 100 },
      rotation: -3,
      color: 'medium',
      size: 'sm'
    },
    {
      id: 'quick-card-1',
      type: 'sketch-card',
      content: (
        <div className="text-center">
          <div className="text-2xl mb-2">🎨</div>
          <div className="handwritten text-sm">Drag me around!</div>
        </div>
      ),
      position: { x: 300, y: 150 },
      rotation: 2,
      scale: 0.8
    }
  ];

  const enableInteractiveMode = () => {
    setItems(quickItems);
    onToggle?.(true);
  };

  const disableInteractiveMode = () => {
    setItems([]);
    onToggle?.(false);
  };

  return (
    <>
      {/* Toggle button */}
      {!isVisible && (
        <motion.button
          onClick={enableInteractiveMode}
          className="fixed bottom-6 left-6 z-50 w-14 h-14 bg-blue-500 text-white rounded-full shadow-lg flex items-center justify-center text-2xl hover:bg-blue-600 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 1 }}
        >
          🎨
        </motion.button>
      )}

      {/* Interactive overlay */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            className={`fixed inset-0 z-40 ${className}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Background */}
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
            
            {/* Interactive area */}
            <div className="relative w-full h-full">
              <DraggableNotebook
                items={items}
                onItemsChange={setItems}
                allowEditing={true}
                showControls={true}
                className="w-full h-full"
              />
            </div>

            {/* Controls */}
            <div className="absolute top-4 right-4 flex gap-2">
              <button
                onClick={() => setItems([...items, ...quickItems.map(item => ({
                  ...item,
                  id: `${item.id}-${Date.now()}`,
                  position: { 
                    x: Math.random() * 300 + 50, 
                    y: Math.random() * 200 + 50 
                  }
                }))])}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
              >
                + Add More
              </button>
              <button
                onClick={disableInteractiveMode}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
              >
                Exit Interactive
              </button>
            </div>

            {/* Instructions */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-lg text-sm">
              Drag elements around • Use controls to modify • Click "Exit Interactive" when done
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// Hook for easy integration
export const useInteractiveMode = () => {
  const [isInteractive, setIsInteractive] = useState(false);

  const toggleInteractive = (visible?: boolean) => {
    setIsInteractive(visible !== undefined ? visible : !isInteractive);
  };

  return {
    isInteractive,
    toggleInteractive,
    InteractiveOverlay: (props: any) => (
      <InteractiveOverlay
        {...props}
        isVisible={isInteractive}
        onToggle={toggleInteractive}
      />
    )
  };
};

export default InteractiveOverlay;
