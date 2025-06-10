'use client';

import { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, Line } from '@react-three/drei';
import * as THREE from 'three';

// Floating AI nodes that react to mouse
function AINode({ position, mousePosition }: { 
  position: [number, number, number];
  mousePosition?: { x: number; y: number };
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const originalPosition = useMemo(() => new THREE.Vector3(...position), [position]);

  useFrame((state) => {
    if (!meshRef.current) return;

    // Floating animation
    const time = state.clock.elapsedTime;
    meshRef.current.position.y = originalPosition.y + Math.sin(time + position[0]) * 0.2;
    
    // Mouse interaction
    if (mousePosition) {
      const mouseInfluence = new THREE.Vector3(
        (mousePosition.x - 0.5) * 2,
        -(mousePosition.y - 0.5) * 2,
        0
      );
      
      const distance = originalPosition.distanceTo(mouseInfluence);
      const influence = Math.max(0, 1 - distance / 2) * 0.3;
      
      meshRef.current.position.x = originalPosition.x + mouseInfluence.x * influence;
      meshRef.current.position.z = originalPosition.z + mouseInfluence.z * influence;
    } else {
      meshRef.current.position.x = originalPosition.x;
      meshRef.current.position.z = originalPosition.z;
    }

    // Rotation
    meshRef.current.rotation.x += 0.01;
    meshRef.current.rotation.y += 0.01;
  });
  return (
    <Sphere ref={meshRef} position={position} args={[0.05, 8, 8]}>
      <meshStandardMaterial 
        color="#333333" 
        transparent 
        opacity={0.7}
        emissive="#333333"
        emissiveIntensity={0.2}
      />
    </Sphere>
  );
}

// Network connections between AI nodes
function NetworkConnections({ nodes, mousePosition }: { 
  nodes: [number, number, number][];
  mousePosition?: { x: number; y: number };
}) {
  const connections = useMemo(() => {
    const lines = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const distance = new THREE.Vector3(...nodes[i]).distanceTo(new THREE.Vector3(...nodes[j]));
        if (distance < 2) {
          lines.push({
            start: nodes[i],
            end: nodes[j],
            opacity: Math.max(0, 1 - distance / 2)
          });
        }
      }
    }
    return lines;
  }, [nodes]);

  return (
    <>      {connections.map((connection, index) => (
        <Line
          key={index}
          points={[
            new THREE.Vector3(...connection.start),
            new THREE.Vector3(...connection.end)
          ]}
          color="#333333"
          lineWidth={1}
          transparent
          opacity={connection.opacity * 0.3}
        />
      ))}
    </>
  );
}

// Main Work page Three.js scene
export default function WorkSceneAnimation({ 
  className = "",
  interactive = true 
}: { 
  className?: string;
  interactive?: boolean;
}) {
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | undefined>();
  
  // Generate AI node positions
  const aiNodes = useMemo(() => {
    const nodes: [number, number, number][] = [];
    for (let i = 0; i < 15; i++) {
      nodes.push([
        (Math.random() - 0.5) * 4,
        (Math.random() - 0.5) * 3,
        (Math.random() - 0.5) * 2
      ]);
    }
    return nodes;
  }, []);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive) return;
    
    const rect = event.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: (event.clientX - rect.left) / rect.width,
      y: (event.clientY - rect.top) / rect.height,
    });
  };

  return (
    <div 
      className={`w-full h-full ${className} ${interactive ? 'cursor-pointer' : ''}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setMousePosition(undefined)}
    >
      <Canvas
        camera={{ position: [0, 0, 6], fov: 50 }}
        style={{ background: 'transparent' }}      >
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={0.5} />
        <pointLight position={[-10, -10, 5]} intensity={0.3} color="#cccccc" />
        
        {/* AI Nodes */}
        {aiNodes.map((position, index) => (
          <AINode
            key={index}
            position={position}
            mousePosition={mousePosition}
          />
        ))}
        
        {/* Network Connections */}
        <NetworkConnections nodes={aiNodes} mousePosition={mousePosition} />
      </Canvas>
    </div>
  );
}
