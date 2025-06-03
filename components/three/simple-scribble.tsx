'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import * as THREE from 'three';

// Simple scribble trail that follows mouse movement
function MouseScribbleTrail({ 
  trail,
  opacity = 0.7
}: Readonly<{
  trail: THREE.Vector3[];
  opacity?: number;
}>) {
  const materialRef = useRef<THREE.LineBasicMaterial>(null);

  useFrame(() => {
    if (materialRef.current && trail.length > 0) {
      // Gradually fade out the trail
      materialRef.current.opacity = Math.max(0.1, materialRef.current.opacity - 0.008);
    }
  });

  if (trail.length < 2) return null;

  return (
    <Line
      points={trail}
      color="#374151"
      lineWidth={3}
      transparent
    >
      <lineBasicMaterial ref={materialRef} opacity={opacity} />
    </Line>
  );
}

// Main scribble animation component
export default function ScribbleAnimation({ 
  className = "" 
}: Readonly<{ 
  className?: string;
}>) {
  const [scribbleTrails, setScribbleTrails] = useState<Array<{ id: string; points: THREE.Vector3[] }>>([]);
  const [currentTrail, setCurrentTrail] = useState<THREE.Vector3[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isTouching, setIsTouching] = useState(false);
  const trailIdRef = useRef<string>(`trail-${Date.now()}`);
  
  // Convert screen coordinates to 3D world coordinates
  const screenToWorld = useCallback((screenX: number, screenY: number, containerRect: DOMRect) => {
    const x = ((screenX - containerRect.left) / containerRect.width) * 4 - 2;
    const y = (1 - (screenY - containerRect.top) / containerRect.height) * 3 - 1.5;
    return new THREE.Vector3(x, y, 0);
  }, []);

  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const worldPos = screenToWorld(event.clientX, event.clientY, rect);

    if (isDrawing || isTouching) {
      setCurrentTrail(prev => {
        const newTrail = [...prev, worldPos];
        // Limit trail length to prevent performance issues
        return newTrail.length > 50 ? newTrail.slice(-50) : newTrail;
      });
    }
  }, [isDrawing, isTouching, screenToWorld]);

  const handleMouseDown = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const worldPos = screenToWorld(event.clientX, event.clientY, rect);
    
    setIsDrawing(true);
    setCurrentTrail([worldPos]);
    trailIdRef.current = `trail-${Date.now()}-${Math.random()}`;
  }, [screenToWorld]);

  const handleMouseUp = useCallback(() => {
    if ((isDrawing || isTouching) && currentTrail.length > 1) {
      const newTrail = {
        id: trailIdRef.current,
        points: currentTrail
      };
      setScribbleTrails(prev => [...prev, newTrail].slice(-5)); // Keep only last 5 trails
    }
    setIsDrawing(false);
    setCurrentTrail([]);
  }, [isDrawing, isTouching, currentTrail]);

  const handleMouseLeave = useCallback(() => {
    if ((isDrawing || isTouching) && currentTrail.length > 1) {
      const newTrail = {
        id: trailIdRef.current,
        points: currentTrail
      };
      setScribbleTrails(prev => [...prev, newTrail].slice(-5));
    }
    setIsDrawing(false);
    setCurrentTrail([]);
  }, [isDrawing, isTouching, currentTrail]);

  // Touch event handlers for mobile support
  const handleTouchStart = useCallback((event: React.TouchEvent<HTMLDivElement>) => {
    event.preventDefault(); // Prevent scrolling
    
    if (event.touches.length > 0) {
      const touch = event.touches[0];
      const rect = event.currentTarget.getBoundingClientRect();
      const worldPos = screenToWorld(touch.clientX, touch.clientY, rect);
      
      setIsTouching(true);
      setCurrentTrail([worldPos]);
      trailIdRef.current = `trail-${Date.now()}-${Math.random()}`;
    }
  }, [screenToWorld]);

  const handleTouchMove = useCallback((event: React.TouchEvent<HTMLDivElement>) => {
    event.preventDefault(); // Prevent scrolling
    
    if (isTouching && event.touches.length > 0) {
      const touch = event.touches[0];
      const rect = event.currentTarget.getBoundingClientRect();
      const worldPos = screenToWorld(touch.clientX, touch.clientY, rect);

      setCurrentTrail(prev => {
        const newTrail = [...prev, worldPos];
        // Limit trail length to prevent performance issues
        return newTrail.length > 50 ? newTrail.slice(-50) : newTrail;
      });
    }
  }, [isTouching, screenToWorld]);

  const handleTouchEnd = useCallback((event: React.TouchEvent<HTMLDivElement>) => {
    event.preventDefault();
    
    if (isTouching && currentTrail.length > 1) {
      const newTrail = {
        id: trailIdRef.current,
        points: currentTrail
      };
      setScribbleTrails(prev => [...prev, newTrail].slice(-5)); // Keep only last 5 trails
    }
    setIsTouching(false);
    setCurrentTrail([]);
  }, [isTouching, currentTrail]);

  // Clean up old trails periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setScribbleTrails(prev => prev.length > 3 ? prev.slice(-3) : prev);
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);
  return (
    <div 
      className={`w-full h-full ${className} cursor-crosshair touch-none scribble-area`}
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        style={{ background: 'transparent' }}
      >
        {/* Render existing scribble trails */}
        {scribbleTrails.map((trail) => (
          <MouseScribbleTrail 
            key={trail.id} 
            trail={trail.points} 
            opacity={0.4} 
          />
        ))}
        
        {/* Render current drawing trail */}
        {currentTrail.length > 1 && (
          <MouseScribbleTrail 
            trail={currentTrail} 
            opacity={0.8} 
          />
        )}
      </Canvas>
    </div>
  );
}
