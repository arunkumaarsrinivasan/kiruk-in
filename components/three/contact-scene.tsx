'use client';

import { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Sphere, Line, Text } from '@react-three/drei';
import * as THREE from 'three';

// Communication node that pulses and reacts to interaction
function CommNode({ 
  position, 
  mousePosition,
  label,
  color = '#333333'
}: {
  position: [number, number, number];
  mousePosition?: { x: number; y: number };
  label: string;
  color?: string;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const originalPosition = useMemo(() => new THREE.Vector3(...position), [position]);
  const [isHovered, setIsHovered] = useState(false);

  useFrame((state) => {
    if (!meshRef.current || !groupRef.current) return;

    const time = state.clock.elapsedTime;
    
    // Pulsing animation
    const pulseScale = 1 + Math.sin(time * 2 + position[0] * 5) * 0.2;
    meshRef.current.scale.setScalar(pulseScale);
    
    // Mouse interaction - grow when close
    if (mousePosition) {
      const mouseWorld = new THREE.Vector3(
        (mousePosition.x - 0.5) * 8,
        -(mousePosition.y - 0.5) * 6,
        0
      );
      
      const distance = groupRef.current.position.distanceTo(mouseWorld);
      const isNear = distance < 1.5;
      
      if (isNear !== isHovered) {
        setIsHovered(isNear);
      }
      
      if (isNear) {
        const attraction = mouseWorld.clone().sub(groupRef.current.position).normalize();
        groupRef.current.position.add(attraction.multiplyScalar(0.01));
      } else {
        // Return to original position
        const returnForce = originalPosition.clone().sub(groupRef.current.position);
        groupRef.current.position.add(returnForce.multiplyScalar(0.02));
      }
    }
    
    // Gentle rotation
    groupRef.current.rotation.y += 0.005;
  });

  return (
    <group ref={groupRef} position={position}>
      <Sphere ref={meshRef} args={[isHovered ? 0.15 : 0.1, 16, 16]}>
        <meshStandardMaterial 
          color={color}
          transparent 
          opacity={isHovered ? 0.9 : 0.7}
          emissive={color}
          emissiveIntensity={isHovered ? 0.3 : 0.1}
          roughness={0.2}
          metalness={0.8}
        />
      </Sphere>
      
      {isHovered && (
        <Text
          position={[0, 0.3, 0]}
          fontSize={0.1}
          color={color}
          anchorX="center"
          anchorY="middle"
        >
          {label}
        </Text>
      )}
    </group>
  );
}

// Network connections with data flow animation
function DataFlow({ 
  nodes, 
  mousePosition 
}: { 
  readonly nodes: readonly { readonly position: [number, number, number]; readonly label: string }[];
  readonly mousePosition?: { readonly x: number; readonly y: number };
}) {
  const flowRefs = useRef<(THREE.Group | null)[]>([]);

  const connections = useMemo(() => {
    interface ConnectionLine {
      points: THREE.Vector3[];
      index: number;
      opacity: number;
    }
    const lines: ConnectionLine[] = [];
    const center = new THREE.Vector3(0, 0, 0);
    
    // Connect all nodes to center (representing communication hub)
    nodes.forEach((node, index) => {
      const start = new THREE.Vector3(...node.position);
      const points = [];
      
      // Create flowing curve to center
      for (let i = 0; i <= 20; i++) {
        const t = i / 20;
        const point = start.clone().lerp(center, t);
        
        // Add some wave motion
        point.y += Math.sin(t * Math.PI) * 0.2;
        point.x += Math.cos(t * Math.PI * 2) * 0.1;
        
        points.push(point);
      }
      
      lines.push({
        points,
        index,
        opacity: 0.3 + Math.random() * 0.3
      });
    });
    
    return lines;
  }, [nodes]);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    flowRefs.current.forEach((ref, index) => {
      if (ref && ref.children[0]) {
        // Animate opacity for data flow effect
        const material = (ref.children[0] as any).material;
        if (material) {
          material.opacity = connections[index].opacity + Math.sin(time * 3 + index) * 0.2;
        }
      }
    });
  });

  return (
    <>
      {connections.map((connection, index) => (        <group key={index} ref={el => flowRefs.current[index] = el}>
          <Line
            points={connection.points}
            color="#333333"
            lineWidth={1.5}
            transparent
            opacity={connection.opacity}
          />
        </group>
      ))}
    </>
  );
}

// Floating message particles
function MessageParticles({ mousePosition }: { mousePosition?: { x: number; y: number } }) {
  const particlesRef = useRef<THREE.Points>(null);
  
  const particles = useMemo(() => {
    const count = 30;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      // Spread particles around the scene
      positions[i * 3] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 3;
      
      // Green color variations
      colors[i * 3] = 0.1; // R
      colors[i * 3 + 1] = 0.7 + Math.random() * 0.3; // G
      colors[i * 3 + 2] = 0.5; // B
    }
    
    return { positions, colors };
  }, []);

  useFrame((state) => {
    if (!particlesRef.current) return;
    
    const time = state.clock.elapsedTime;
    const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
    
    for (let i = 0; i < positions.length; i += 3) {
      // Floating motion
      positions[i + 1] += Math.sin(time + positions[i]) * 0.002;
      positions[i] += Math.cos(time * 0.5 + positions[i + 1]) * 0.001;
      
      // Boundary wrapping
      if (positions[i + 1] > 3) positions[i + 1] = -3;
      if (positions[i] > 4) positions[i] = -4;
    }
    
    particlesRef.current.geometry.attributes.position.needsUpdate = true;
    
    // Mouse influence
    if (mousePosition) {
      particlesRef.current.rotation.x = (mousePosition.y - 0.5) * 0.1;
      particlesRef.current.rotation.z = (mousePosition.x - 0.5) * 0.1;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[particles.positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[particles.colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        vertexColors
        transparent
        opacity={0.7}
        sizeAttenuation
      />
    </points>
  );
}

// Camera controller for Contact page
function ContactCameraController({ mousePosition }: { mousePosition?: { x: number; y: number } }) {
  const { camera } = useThree();
  
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    // Slow orbital movement
    const radius = 5;
    const baseX = Math.cos(time * 0.1) * 0.5;
    const baseY = Math.sin(time * 0.05) * 0.3;
    
    if (mousePosition) {
      camera.position.x = baseX + (mousePosition.x - 0.5) * 1.2;
      camera.position.y = baseY + (mousePosition.y - 0.5) * 0.8;
      camera.position.z = radius + (mousePosition.y - 0.5) * 0.5;
    } else {
      camera.position.x = baseX;
      camera.position.y = baseY;
      camera.position.z = radius;
    }
    
    camera.lookAt(0, 0, 0);
  });
  
  return null;
}

// Main Contact page Three.js scene
export default function ContactSceneAnimation({ 
  className = "",
  interactive = true 
}: { 
  className?: string;
  interactive?: boolean;
}) {
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | undefined>();
    // Communication nodes representing different contact methods
  const commNodes = useMemo(() => [
    { position: [2, 1, 0] as [number, number, number], label: 'Email', color: '#333333' },
    { position: [-2, 1, 0] as [number, number, number], label: 'LinkedIn', color: '#666666' },
    { position: [0, -1.5, 1] as [number, number, number], label: 'Twitter', color: '#999999' },
    { position: [1.5, -0.5, -1] as [number, number, number], label: 'GitHub', color: '#222222' },
    { position: [-1.5, -0.5, -1] as [number, number, number], label: 'Portfolio', color: '#555555' },
  ], []);

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
        camera={{ position: [0, 0, 5], fov: 50 }}
        style={{ background: 'transparent' }}      >
        <ambientLight intensity={0.4} />
        <pointLight position={[5, 5, 5]} intensity={0.5} color="#ffffff" />
        <pointLight position={[-5, -5, 3]} intensity={0.3} color="#cccccc" />
        
        {/* Communication Nodes */}
        {commNodes.map((node, index) => (
          <CommNode
            key={index}
            position={node.position}
            label={node.label}
            color={node.color}
            mousePosition={mousePosition}
          />
        ))}
        
        {/* Data Flow Network */}
        <DataFlow nodes={commNodes} mousePosition={mousePosition} />
        
        {/* Message Particles */}
        <MessageParticles mousePosition={mousePosition} />
        
        {/* Camera Controller */}
        <ContactCameraController mousePosition={mousePosition} />
      </Canvas>
    </div>
  );
}
