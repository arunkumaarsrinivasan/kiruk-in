'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import * as THREE from 'three';

// Simple scribble trail that follows mouse movement
function MouseScribbleTrail({ 
  trail,
  opacity = 0.7
}: {
  readonly trail: THREE.Vector3[];
  readonly opacity?: number;
}) {
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
}: { 
  readonly className?: string;
}) {  const [scribbleTrails, setScribbleTrails] = useState<Array<{ id: string; points: THREE.Vector3[] }>>([]);
  const [currentTrail, setCurrentTrail] = useState<THREE.Vector3[]>([]);
  const [isMouseInside, setIsMouseInside] = useState(false);
  const [isTouching, setIsTouching] = useState(false);
  const lastPositionRef = useRef<THREE.Vector3 | null>(null);
  const trailIdRef = useRef<string>(`trail-${Date.now()}`);
  const smoothingFactorRef = useRef(0.25); // For smooth interpolation
    // Convert screen coordinates to 3D world coordinates
  const screenToWorld = useCallback((screenX: number, screenY: number, containerRect: DOMRect) => {
    // Normalize to -1 to 1 range
    const x = ((screenX - containerRect.left) / containerRect.width) * 2 - 1;
    const y = -((screenY - containerRect.top) / containerRect.height) * 2 + 1;
    
    // Scale to match the camera's view
    const aspect = containerRect.width / containerRect.height;
    const fov = 50;
    const distance = 5; // Camera Z position
    
    // Calculate the visible area at the camera's distance
    const vFOV = (fov * Math.PI) / 180;
    const height = 2 * Math.tan(vFOV / 2) * distance;
    const width = height * aspect;
    
    return new THREE.Vector3(
      (x * width) / 2,
      (y * height) / 2,
      0
    );
  }, []);  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const worldPos = screenToWorld(event.clientX, event.clientY, rect);

    if (isMouseInside || isTouching) {
      // Smooth interpolation between points for fluid scribbling
      if (lastPositionRef.current) {
        // Calculate distance for adaptive smoothing
        const distance = lastPositionRef.current.distanceTo(worldPos);
        const adaptiveSmoothness = Math.min(0.4, Math.max(0.1, distance * 0.5));
        
        const smoothedPos = new THREE.Vector3().lerpVectors(
          lastPositionRef.current,
          worldPos,
          adaptiveSmoothness
        );
        
        // Only add point if there's enough movement to avoid clustering
        if (distance > 0.02) {
          setCurrentTrail(prev => {
            const newTrail = [...prev, smoothedPos];
            // Limit trail length for performance and visual appeal
            return newTrail.length > 80 ? newTrail.slice(-80) : newTrail;
          });
        }
      } else {
        // First point in the trail
        setCurrentTrail([worldPos]);
      }
      
      lastPositionRef.current = worldPos;
    }
  }, [isMouseInside, isTouching, screenToWorld]);
  const handleMouseEnter = useCallback(() => {
    setIsMouseInside(true);
    // Start a new trail
    trailIdRef.current = `trail-${Date.now()}-${Math.random()}`;
    setCurrentTrail([]);
    lastPositionRef.current = null;
  }, []);
  const handleMouseLeave = useCallback(() => {
    setIsMouseInside(false);
    
    // Save the current trail if it has enough points
    if (currentTrail.length > 5) {
      const newTrail = {
        id: trailIdRef.current,
        points: currentTrail
      };
      setScribbleTrails(prev => [...prev, newTrail].slice(-8)); // Keep last 8 trails
    }
    
    setCurrentTrail([]);
    lastPositionRef.current = null;
  }, [currentTrail]);

  // Touch event handlers for mobile support
  const handleTouchStart = useCallback((event: React.TouchEvent<HTMLDivElement>) => {
    event.preventDefault(); // Prevent scrolling
    setIsTouching(true);
    // Start a new trail
    trailIdRef.current = `trail-${Date.now()}-${Math.random()}`;
    setCurrentTrail([]);
    lastPositionRef.current = null;
  }, []);

  const handleTouchMove = useCallback((event: React.TouchEvent<HTMLDivElement>) => {
    event.preventDefault(); // Prevent scrolling
    
    if (isTouching && event.touches.length > 0) {
      const touch = event.touches[0];
      const rect = event.currentTarget.getBoundingClientRect();
      const worldPos = screenToWorld(touch.clientX, touch.clientY, rect);

      // Smooth interpolation between points for fluid scribbling
      if (lastPositionRef.current) {
        // Calculate distance for adaptive smoothing
        const distance = lastPositionRef.current.distanceTo(worldPos);
        const adaptiveSmoothness = Math.min(0.4, Math.max(0.1, distance * 0.5));
        
        const smoothedPos = new THREE.Vector3().lerpVectors(
          lastPositionRef.current,
          worldPos,
          adaptiveSmoothness
        );
        
        // Only add point if there's enough movement to avoid clustering
        if (distance > 0.02) {
          setCurrentTrail(prev => {
            const newTrail = [...prev, smoothedPos];
            // Limit trail length for performance and visual appeal
            return newTrail.length > 80 ? newTrail.slice(-80) : newTrail;
          });
        }
      } else {
        // First point in the trail
        setCurrentTrail([worldPos]);
      }
      
      lastPositionRef.current = worldPos;
    }
  }, [isTouching, screenToWorld]);

  const handleTouchEnd = useCallback((event: React.TouchEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsTouching(false);
    
    // Save the current trail if it has enough points
    if (currentTrail.length > 5) {
      const newTrail = {
        id: trailIdRef.current,
        points: currentTrail
      };
      setScribbleTrails(prev => [...prev, newTrail].slice(-8)); // Keep last 8 trails
    }
    
    setCurrentTrail([]);
    lastPositionRef.current = null;
  }, [currentTrail]);
  // Clean up old trails periodically and update smoothing
  useEffect(() => {
    const interval = setInterval(() => {
      setScribbleTrails(prev => prev.length > 5 ? prev.slice(-5) : prev);
      // Adjust smoothing based on trail length for more natural movement
      if (currentTrail.length > 10) {
        smoothingFactorRef.current = 0.08; // Smoother for longer trails
      } else {
        smoothingFactorRef.current = 0.15; // More responsive for short trails
      }
    }, 2000);
    
    return () => clearInterval(interval);
  }, [currentTrail.length]);  return (
    <div 
      className={`w-full h-full ${className} cursor-crosshair touch-none scribble-area`}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    ><Canvas
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
