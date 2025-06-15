'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface DraggableComponentProps {
  children: React.ReactNode;
  initialPosition?: { x: number; y: number };
  initialSize?: { width: number; height: number };
  initialRotation?: number;
  className?: string;
  onRemove?: () => void;
  isRemovable?: boolean;
  title?: string;
}

export const DraggableComponent: React.FC<DraggableComponentProps> = ({
  children,
  initialPosition = { x: 100, y: 100 },
  initialSize = { width: 300, height: 200 },
  initialRotation = 0,
  className = '',
  onRemove,
  isRemovable = true,
  title = 'Component'
}) => {
  const [position, setPosition] = useState(initialPosition);
  const [size, setSize] = useState(initialSize);
  const [rotation, setRotation] = useState(initialRotation);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [showControls, setShowControls] = useState(false);
  
  const componentRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const resizeStartRef = useRef({ width: 0, height: 0, mouseX: 0, mouseY: 0 });
  const rotateStartRef = useRef({ rotation: 0, centerX: 0, centerY: 0 });

  // Handle dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isResizing || isRotating) return;
    
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
    e.preventDefault();
  };

  // Handle resizing
  const handleResizeMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true);
    resizeStartRef.current = {
      width: size.width,
      height: size.height,
      mouseX: e.clientX,
      mouseY: e.clientY
    };
    e.stopPropagation();
    e.preventDefault();
  };

  // Handle rotation
  const handleRotateMouseDown = (e: React.MouseEvent) => {
    if (!componentRef.current) return;
    
    setIsRotating(true);
    const rect = componentRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    rotateStartRef.current = {
      rotation,
      centerX,
      centerY
    };
    e.stopPropagation();
    e.preventDefault();
  };

  // Mouse move handler
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragStartRef.current.x,
          y: e.clientY - dragStartRef.current.y
        });
      } else if (isResizing) {
        const deltaX = e.clientX - resizeStartRef.current.mouseX;
        const deltaY = e.clientY - resizeStartRef.current.mouseY;
        
        setSize({
          width: Math.max(200, resizeStartRef.current.width + deltaX),
          height: Math.max(150, resizeStartRef.current.height + deltaY)
        });
      } else if (isRotating) {
        const { centerX, centerY } = rotateStartRef.current;
        const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
        const degrees = (angle * 180) / Math.PI;
        setRotation(degrees);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
      setIsRotating(false);
    };

    if (isDragging || isResizing || isRotating) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, isRotating, rotation]);

  return (
    <motion.div
      ref={componentRef}
      className={`absolute select-none ${className}`}
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        transform: `rotate(${rotation}deg)`,
        zIndex: isDragging || isResizing || isRotating ? 1000 : 10
      }}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {/* Control buttons */}
      {showControls && (
        <div className="absolute -top-8 right-0 flex gap-1 z-20">
          {/* Rotate handle */}
          <button
            onMouseDown={handleRotateMouseDown}
            className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-blue-600 cursor-grab active:cursor-grabbing"
            title="Rotate"
          >
            ↻
          </button>
          
          {/* Remove button */}
          {isRemovable && onRemove && (
            <button
              onClick={onRemove}
              className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
              title="Remove"
            >
              ×
            </button>
          )}
        </div>
      )}      {/* Main content */}
      <div
        className="w-full h-full relative border-2 border-dashed border-gray-300 rounded-lg cursor-move hover:border-gray-400 transition-colors"
        onMouseDown={handleMouseDown}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
          }
        }}
      >
        {/* Title bar */}
        <div className="absolute -top-6 left-0 text-xs text-gray-600 bg-white px-2 py-1 rounded border">
          {title}
        </div>
        
        {/* Content */}
        <div className="w-full h-full overflow-hidden">
          {children}
        </div>
          {/* Resize handle */}
        {showControls && (
          <button
            onMouseDown={handleResizeMouseDown}
            className="absolute bottom-0 right-0 w-4 h-4 bg-gray-400 cursor-se-resize hover:bg-gray-600 rounded-tl-lg border-0 p-0"
            title="Resize"
            type="button"
          >            <div className="absolute bottom-1 right-1 w-1 h-1 bg-white rounded-full"></div>
            <div className="absolute bottom-1 right-2 w-1 h-1 bg-white rounded-full"></div>
            <div className="absolute bottom-2 right-1 w-1 h-1 bg-white rounded-full"></div>
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default DraggableComponent;
