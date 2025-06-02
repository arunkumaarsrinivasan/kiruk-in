'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import * as THREE from 'three';

// Component for animated scribble lines
function ScribbleLine({ points, color = '#374151', lineWidth = 2 }: {
  points: THREE.Vector3[];
  color?: string;
  lineWidth?: number;
}) {
  const materialRef = useRef<THREE.LineBasicMaterial>(null);

  useFrame((state) => {
    if (materialRef.current) {
      // Subtle animation for the scribble
      materialRef.current.opacity = 0.7 + Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
    }
  });

  return (
    <Line
      points={points}
      color={color}
      lineWidth={lineWidth}
      transparent
    >
      <lineBasicMaterial ref={materialRef} />
    </Line>
  );
}

// Multiple scribble lines to create a sketchy effect
function ScribbleLines() {
  const scribbles = useMemo(() => {
    const lines = [];
    
    // Create multiple curved lines that look like hand-drawn sketches
    for (let i = 0; i < 8; i++) {
      const points: THREE.Vector3[] = [];
      const baseX = (Math.random() - 0.5) * 4;
      const baseY = (Math.random() - 0.5) * 3;
      
      // Create a curved line with some randomness (like hand drawing)
      for (let j = 0; j <= 20; j++) {
        const t = j / 20;
        const x = baseX + Math.cos(t * Math.PI * 2) * (1 + Math.random() * 0.5);
        const y = baseY + Math.sin(t * Math.PI * 2) * (1 + Math.random() * 0.5);
        const z = (Math.random() - 0.5) * 0.5;
        
        // Add some jitter to make it look hand-drawn
        points.push(new THREE.Vector3(
          x + (Math.random() - 0.5) * 0.1,
          y + (Math.random() - 0.5) * 0.1,
          z
        ));
      }
      
      lines.push({
        points,
        color: `hsl(${220 + i * 10}, 20%, ${40 + i * 5}%)`,
        lineWidth: 1 + Math.random(),
      });
    }
    
    return lines;
  }, []);

  return (
    <>
      {scribbles.map((scribble, index) => (
        <ScribbleLine
          key={index}
          points={scribble.points}
          color={scribble.color}
          lineWidth={scribble.lineWidth}
        />
      ))}
    </>
  );
}

// Camera controller for subtle movement
function CameraController() {
  const { camera } = useThree();
  
  useFrame((state) => {
    // Gentle camera movement
    camera.position.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.5;
    camera.position.y = Math.cos(state.clock.elapsedTime * 0.3) * 0.3;
    camera.lookAt(0, 0, 0);
  });
  
  return null;
}

// Main Three.js scene component
export default function ScribbleAnimation({ className = "" }: { className?: string }) {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={0.3} />
        <ScribbleLines />
        <CameraController />
      </Canvas>
    </div>
  );
}
