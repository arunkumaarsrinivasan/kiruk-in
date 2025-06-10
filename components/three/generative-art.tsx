'use client';

import { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Line, Sphere, Box } from '@react-three/drei';
import * as THREE from 'three';

// Flowing particle system for creative energy
function FlowingParticles({ 
  count = 50,
  speed = 0.5,
  color = '#000000'
}: {
  count?: number;
  speed?: number;
  color?: string;
}){
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      temp.push({
        position: new THREE.Vector3(
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 2
        ),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * speed,
          (Math.random() - 0.5) * speed,
          (Math.random() - 0.5) * speed * 0.1
        ),
        scale: Math.random() * 0.5 + 0.1,
        life: Math.random()
      });
    }
    return temp;
  }, [count, speed]);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state) => {
    if (!meshRef.current) return;

    particles.forEach((particle, i) => {
      // Update position
      particle.position.add(particle.velocity);
      
      // Add some wave motion
      particle.position.y += Math.sin(state.clock.elapsedTime * 2 + i) * 0.01;
      particle.position.x += Math.cos(state.clock.elapsedTime * 1.5 + i) * 0.005;
      
      // Bounce off boundaries
      if (Math.abs(particle.position.x) > 5) particle.velocity.x *= -0.8;
      if (Math.abs(particle.position.y) > 5) particle.velocity.y *= -0.8;
      if (Math.abs(particle.position.z) > 1) particle.velocity.z *= -0.8;
      
      // Update life cycle
      particle.life += 0.01;
      if (particle.life > 1) {
        particle.life = 0;
        particle.position.set(
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 2
        );
      }
      
      // Apply transform to instance
      dummy.position.copy(particle.position);
      dummy.scale.setScalar(particle.scale * Math.sin(particle.life * Math.PI));
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[0.02, 8, 6]} />
      <meshBasicMaterial color={color} transparent opacity={0.6} />
    </instancedMesh>
  );
}

// Generative line art that creates organic patterns
function GenerativeLines({ 
  side = 'left',
  intensity = 1 
}: {
  side?: 'left' | 'right';
  intensity?: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const lines = useMemo(() => {
    const lineCount = 8;
    return Array.from({ length: lineCount }, (_, i) => {
      const points = [];
      const segments = 50;
      const radius = 2 + Math.random() * 2;
      const offset = (i / lineCount) * Math.PI * 2;
      
      for (let j = 0; j <= segments; j++) {
        const t = j / segments;
        const angle = t * Math.PI * 4 + offset;
        const spiralRadius = radius * (1 - t * 0.7);
        
        // Add noise for organic feel
        const noise = (Math.sin(t * 20 + i) + Math.cos(t * 15 + i * 2)) * 0.3;
        
        points.push(new THREE.Vector3(
          Math.cos(angle) * spiralRadius + noise * Math.sin(t * 10),
          Math.sin(angle) * spiralRadius + noise * Math.cos(t * 8),
          Math.sin(t * Math.PI * 2 + i) * 0.5
        ));
      }
        return {
        points,
        color: side === 'left' ? '#000000' : '#666666',
        opacity: 0.3 + Math.random() * 0.3,
        speed: 0.5 + Math.random() * 1.5
      };
    });
  }, [side]);

  useFrame((state) => {
    if (!groupRef.current) return;
    
    groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    groupRef.current.position.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.5;
    groupRef.current.position.y = Math.cos(state.clock.elapsedTime * 0.4) * 0.3;
    
    // Scale based on intensity
    groupRef.current.scale.setScalar(0.5 + intensity * 0.5);
  });

  return (
    <group ref={groupRef} position={side === 'left' ? [-2, 0, 0] : [2, 0, 0]}>
      {lines.map((line, i) => (
        <Line
          key={`gen-line-${side}-${i}`}
          points={line.points}
          color={line.color}
          lineWidth={2}
          transparent
          opacity={line.opacity * intensity}
        />
      ))}
    </group>
  );
}

// Floating code/design elements
function FloatingElements({ 
  type = 'code',
  crossBleedIntensity = 0 
}: {
  type?: 'code' | 'design';
  crossBleedIntensity?: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  
  const elements = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => ({
      position: new THREE.Vector3(
        (Math.random() - 0.5) * 4,
        (Math.random() - 0.5) * 4,
        (Math.random() - 0.5) * 1
      ),
      rotation: Math.random() * Math.PI * 2,
      scale: 0.5 + Math.random() * 0.5,
      speed: 0.5 + Math.random() * 1,
      phase: Math.random() * Math.PI * 2
    }));
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    
    groupRef.current.children.forEach((child, i) => {
      const element = elements[i];
      child.position.y = element.position.y + Math.sin(state.clock.elapsedTime * element.speed + element.phase) * 0.5;
      child.rotation.z = element.rotation + state.clock.elapsedTime * 0.2;
      
      // Cross-bleed effect - move towards opposite side
      if (crossBleedIntensity > 0) {
        const targetX = type === 'code' ? 2 : -2;
        child.position.x = THREE.MathUtils.lerp(element.position.x, targetX, crossBleedIntensity * 0.3);
      } else {
        child.position.x = element.position.x;
      }
    });
  });

  return (
    <group ref={groupRef}>
      {elements.map((element, i) => (        <group key={`floating-${type}-${i}`} position={element.position}>
          <Box args={[0.1, 0.1, 0.02]} scale={element.scale}>
            <meshBasicMaterial 
              color={type === 'code' ? '#000000' : '#666666'} 
              transparent 
              opacity={0.4}
            />
          </Box>
        </group>
      ))}
    </group>
  );
}

// Neural network-style connections
function NeuralConnections({ 
  intensity = 1 
}: {
  intensity?: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  
  const nodes = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      position: new THREE.Vector3(
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 1
      ),
      connections: Array.from({ length: 2 + Math.floor(Math.random() * 3) }, () => 
        Math.floor(Math.random() * 12)
      ).filter(idx => idx !== i)
    }));
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    
    groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    groupRef.current.scale.setScalar(0.8 + intensity * 0.4);
  });

  return (
    <group ref={groupRef}>      {/* Nodes */}
      {nodes.map((node, i) => (
        <Sphere key={`node-${i}`} args={[0.05]} position={node.position}>
          <meshBasicMaterial color="#333333" transparent opacity={0.8 * intensity} />
        </Sphere>
      ))}
      
      {/* Connections */}
      {nodes.map((node, i) => 
        node.connections.map((targetIdx, j) => {
          if (targetIdx >= nodes.length || targetIdx === i) return null;
          
          return (
            <Line
              key={`connection-${i}-${j}`}
              points={[node.position, nodes[targetIdx].position]}
              color="#333333"
              lineWidth={1}
              transparent
              opacity={0.3 * intensity}
            />
          );
        })
      )}
    </group>
  );
}

// Main generative art canvas
export default function GenerativeArt({ 
  side = 'both',
  crossBleedIntensity = 0,
  className = ""
}: {
  side?: 'left' | 'right' | 'both';
  crossBleedIntensity?: number;
  className?: string;
}) {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.5} />
          {/* Flowing particles */}
        <FlowingParticles 
          count={30} 
          speed={0.3}
          color={side === 'right' ? '#666666' : '#000000'}
        />
        
        {/* Generative line patterns */}
        {(side === 'left' || side === 'both') && (
          <GenerativeLines side="left" intensity={1 + crossBleedIntensity} />
        )}
        {(side === 'right' || side === 'both') && (
          <GenerativeLines side="right" intensity={1 + crossBleedIntensity} />
        )}
        
        {/* Floating elements */}
        {(side === 'left' || side === 'both') && (
          <FloatingElements type="code" crossBleedIntensity={crossBleedIntensity} />
        )}
        {(side === 'right' || side === 'both') && (
          <FloatingElements type="design" crossBleedIntensity={crossBleedIntensity} />
        )}
        
        {/* Neural connections for the center */}
        <NeuralConnections intensity={0.5 + crossBleedIntensity * 0.5} />
      </Canvas>
    </div>
  );
}

// Specialized version for developer side
export function DeveloperGenerativeArt({ 
  intensity = 1,
  className = ""
}: {
  intensity?: number;
  className?: string;
}) {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.3} />
          {/* Grid-based particle system */}
        <FlowingParticles count={20} speed={0.2} color="#000000" />
        
        {/* Structured generative lines */}
        <GenerativeLines side="left" intensity={intensity} />
        
        {/* Code-like floating elements */}
        <FloatingElements type="code" crossBleedIntensity={0} />
      </Canvas>
    </div>
  );
}

// Specialized version for designer side
export function DesignerGenerativeArt({ 
  intensity = 1,
  className = ""
}: {
  intensity?: number;
  className?: string;
}) {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.4} />
          {/* Organic particle system */}
        <FlowingParticles count={25} speed={0.4} color="#666666" />
        
        {/* Organic generative lines */}
        <GenerativeLines side="right" intensity={intensity} />
        
        {/* Design-like floating elements */}
        <FloatingElements type="design" crossBleedIntensity={0} />
      </Canvas>
    </div>
  );
}
