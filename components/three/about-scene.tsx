'use client';

import { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Sphere, Line } from '@react-three/drei';
import * as THREE from 'three';

// Flowing organic shape that represents creativity
function CreativityOrb({ 
  position, 
  mousePosition,
  color = '#333333'
}: {
  position: [number, number, number];
  mousePosition?: { x: number; y: number };
  color?: string;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const originalPosition = useMemo(() => new THREE.Vector3(...position), [position]);

  useFrame((state) => {
    if (!meshRef.current) return;

    const time = state.clock.elapsedTime;
    
    // Organic flowing movement
    meshRef.current.position.x = originalPosition.x + Math.sin(time * 0.5 + position[0]) * 0.3;
    meshRef.current.position.y = originalPosition.y + Math.cos(time * 0.3 + position[1]) * 0.2;
    meshRef.current.position.z = originalPosition.z + Math.sin(time * 0.4 + position[2]) * 0.1;
    
    // Mouse interaction - gentle attraction
    if (mousePosition) {
      const mouseWorld = new THREE.Vector3(
        (mousePosition.x - 0.5) * 8,
        -(mousePosition.y - 0.5) * 6,
        0
      );
      
      const direction = mouseWorld.clone().sub(meshRef.current.position).normalize();
      const distance = meshRef.current.position.distanceTo(mouseWorld);
      const influence = Math.max(0, 1 - distance / 4) * 0.02;
      
      meshRef.current.position.add(direction.multiplyScalar(influence));
    }

    // Morphing scale based on movement
    const scale = 1 + Math.sin(time * 2 + position[0] * 3) * 0.3;
    meshRef.current.scale.setScalar(scale);
    
    // Gentle rotation
    meshRef.current.rotation.x += 0.002;
    meshRef.current.rotation.y += 0.003;
  });

  return (
    <Sphere ref={meshRef} position={position} args={[0.1, 12, 12]}>
      <meshStandardMaterial 
        color={color}
        transparent 
        opacity={0.6}
        emissive={color}
        emissiveIntensity={0.1}
        roughness={0.3}
        metalness={0.7}
      />
    </Sphere>
  );
}

// Flowing connections between creativity orbs
function CreativityFlow({ 
  orbs, 
  mousePosition 
}: { 
  orbs: [number, number, number][];
  mousePosition?: { x: number; y: number };
}) {
  const lineRefs = useRef<(THREE.Group | null)[]>([]);

  const connections = useMemo(() => {
    const lines = [];
    for (let i = 0; i < orbs.length - 1; i++) {
      const start = new THREE.Vector3(...orbs[i]);
      const end = new THREE.Vector3(...orbs[i + 1]);
      
      // Create curved path between orbs
      const mid = start.clone().lerp(end, 0.5);
      mid.y += (Math.random() - 0.5) * 0.5; // Add some curve
      
      const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
      const points = curve.getPoints(20);
      
      lines.push({
        points,
        opacity: 0.4 + Math.random() * 0.3
      });
    }
    return lines;
  }, [orbs]);

  useFrame((state) => {
    lineRefs.current.forEach((ref, index) => {
      if (ref) {
        // Animate line opacity
        const time = state.clock.elapsedTime;
        const opacity = connections[index].opacity + Math.sin(time + index) * 0.2;
        if (ref.children[0] && (ref.children[0] as any).material) {
          (ref.children[0] as any).material.opacity = Math.max(0.1, opacity);
        }
      }
    });
  });

  return (
    <>
      {connections.map((connection, index) => (
        <group key={index} ref={el => lineRefs.current[index] = el}>          <Line
            points={connection.points}
            color="#333333"
            lineWidth={2}
            transparent
            opacity={connection.opacity}
          />
        </group>
      ))}
    </>
  );
}

// Particle system for ambient creativity
function CreativityParticles({ mousePosition }: { mousePosition?: { x: number; y: number } }) {
  const particlesRef = useRef<THREE.Points>(null);
  
  const particles = useMemo(() => {
    const count = 50;
    const positions = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 6;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 4;
    }
    
    return positions;
  }, []);

  useFrame((state) => {
    if (!particlesRef.current) return;
    
    const time = state.clock.elapsedTime;
    const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
    
    for (let i = 0; i < positions.length; i += 3) {
      // Gentle floating motion
      positions[i + 1] += Math.sin(time + positions[i]) * 0.001;
      positions[i] += Math.cos(time + positions[i + 1]) * 0.0005;
    }
    
    particlesRef.current.geometry.attributes.position.needsUpdate = true;
    
    // Mouse interaction
    if (mousePosition) {
      particlesRef.current.rotation.x = (mousePosition.y - 0.5) * 0.2;
      particlesRef.current.rotation.y = (mousePosition.x - 0.5) * 0.2;
    }
  });  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.length / 3}
          array={particles}
          itemSize={3}
          args={[particles, 3]}
        />
      </bufferGeometry>      <pointsMaterial
        size={0.02}
        color="#333333"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

// Camera controller for About page
function AboutCameraController({ mousePosition }: { mousePosition?: { x: number; y: number } }) {
  const { camera } = useThree();
  
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    // Gentle camera drift
    const baseX = Math.sin(time * 0.1) * 0.5;
    const baseY = Math.cos(time * 0.15) * 0.3;
    const baseZ = 5 + Math.sin(time * 0.05) * 0.5;
    
    if (mousePosition) {
      camera.position.x = baseX + (mousePosition.x - 0.5) * 0.8;
      camera.position.y = baseY + (mousePosition.y - 0.5) * 0.6;
      camera.position.z = baseZ;
    } else {
      camera.position.x = baseX;
      camera.position.y = baseY;
      camera.position.z = baseZ;
    }
    
    camera.lookAt(0, 0, 0);
  });
  
  return null;
}

// Main About page Three.js scene
export default function AboutSceneAnimation({ 
  className = "",
  interactive = true 
}: { 
  className?: string;
  interactive?: boolean;
}) {
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | undefined>();
  
  // Generate creativity orb positions in a flowing pattern
  const creativityOrbs = useMemo(() => {
    const orbs: [number, number, number][] = [];
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const radius = 1.5 + Math.sin(i) * 0.5;
      orbs.push([
        Math.cos(angle) * radius,
        Math.sin(angle * 1.5) * 0.8,
        Math.sin(i) * 0.5
      ]);
    }
    return orbs;
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
      className={`w-full h-full ${className} ${interactive ? 'cursor-grab' : ''}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setMousePosition(undefined)}
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 60 }}
        style={{ background: 'transparent' }}
      >        <ambientLight intensity={0.3} />
        <pointLight position={[5, 5, 5]} intensity={0.4} color="#ffffff" />
        <pointLight position={[-5, -5, 3]} intensity={0.3} color="#cccccc" />
        <spotLight position={[0, 10, 0]} intensity={0.2} color="#888888" />
        
        {/* Creativity Orbs */}
        {creativityOrbs.map((position, index) => (
          <CreativityOrb
            key={index}
            position={position}            mousePosition={mousePosition}
            color={index % 2 === 0 ? '#333333' : '#666666'}
          />
        ))}
        
        {/* Flowing Connections */}
        <CreativityFlow orbs={creativityOrbs} mousePosition={mousePosition} />
        
        {/* Ambient Particles */}
        <CreativityParticles mousePosition={mousePosition} />
        
        {/* Camera Controller */}
        <AboutCameraController mousePosition={mousePosition} />
      </Canvas>
    </div>
  );
}
