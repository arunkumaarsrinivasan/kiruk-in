'use client';

import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Box, Sphere, Line } from '@react-three/drei';
import * as THREE from 'three';

// Project showcase cube that displays case study information
function ProjectCube({ 
  position, 
  mousePosition,
  project,
  isActive = false
}: { 
  position: [number, number, number];
  mousePosition?: { x: number; y: number };
  project: { title: string; color: string; category: string };
  isActive?: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const originalPosition = useMemo(() => new THREE.Vector3(...position), [position]);

  useFrame((state) => {
    if (!meshRef.current || !groupRef.current) return;

    const time = state.clock.elapsedTime;
    
    // Floating animation
    groupRef.current.position.y = originalPosition.y + Math.sin(time + position[0] * 2) * 0.1;
    
    // Rotation based on activity
    if (isActive) {
      meshRef.current.rotation.x += 0.02;
      meshRef.current.rotation.y += 0.02;
      meshRef.current.rotation.z += 0.01;
    } else {
      meshRef.current.rotation.x += 0.005;
      meshRef.current.rotation.y += 0.005;
    }
    
    // Mouse interaction
    if (mousePosition) {
      const mouseWorld = new THREE.Vector3(
        (mousePosition.x - 0.5) * 6,
        -(mousePosition.y - 0.5) * 4,
        0
      );
      
      const distance = groupRef.current.position.distanceTo(mouseWorld);
      if (distance < 1.5) {
        const attraction = mouseWorld.clone().sub(groupRef.current.position).normalize();
        groupRef.current.position.add(attraction.multiplyScalar(0.01));
        
        // Scale up when close
        const scale = 1 + (1.5 - distance) * 0.3;
        meshRef.current.scale.setScalar(scale);
      } else {
        // Return to original position and scale
        const returnForce = originalPosition.clone().sub(groupRef.current.position);
        groupRef.current.position.add(returnForce.multiplyScalar(0.02));
        meshRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
      }
    }
  });

  return (
    <group ref={groupRef} position={position}>
      <Box ref={meshRef} args={[0.3, 0.3, 0.3]}>
        <meshStandardMaterial 
          color={project.color}
          transparent 
          opacity={isActive ? 0.9 : 0.7}
          emissive={project.color}
          emissiveIntensity={isActive ? 0.2 : 0.05}
          roughness={0.3}
          metalness={0.7}
        />
      </Box>
        {/* Small indicator spheres for different aspects of the project */}
      <Sphere position={[0.2, 0.2, 0.2]} args={[0.03, 8, 8]}>
        <meshStandardMaterial color="#888888" emissive="#888888" emissiveIntensity={0.3} />
      </Sphere>
      <Sphere position={[-0.2, 0.2, 0.2]} args={[0.03, 8, 8]}>
        <meshStandardMaterial color="#555555" emissive="#555555" emissiveIntensity={0.3} />
      </Sphere>
      <Sphere position={[0.2, -0.2, 0.2]} args={[0.03, 8, 8]}>
        <meshStandardMaterial color="#333333" emissive="#333333" emissiveIntensity={0.3} />
      </Sphere>
    </group>
  );
}

// Data visualization connections between projects
function ProjectConnections({ 
  projects, 
  mousePosition 
}: { 
  projects: { position: [number, number, number]; title: string; color: string; category: string }[];
  mousePosition?: { x: number; y: number };
}) {
  const connectionRefs = useRef<(THREE.Group | null)[]>([]);

  const connections = useMemo(() => {
    const lines = [];
    
    // Connect projects of similar categories
    for (let i = 0; i < projects.length; i++) {
      for (let j = i + 1; j < projects.length; j++) {
        const project1 = projects[i];
        const project2 = projects[j];
        
        // Connect if same category or close in space
        const pos1 = new THREE.Vector3(...project1.position);
        const pos2 = new THREE.Vector3(...project2.position);
        const distance = pos1.distanceTo(pos2);
        
        if (project1.category === project2.category || distance < 2) {
          lines.push({
            start: pos1,
            end: pos2,
            color: project1.category === project2.category ? project1.color : '#64748b',
            opacity: project1.category === project2.category ? 0.6 : 0.2,
            animated: project1.category === project2.category
          });
        }
      }
    }
    
    return lines;
  }, [projects]);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    connectionRefs.current.forEach((ref, index) => {
      if (ref && ref.children[0]) {
        const connection = connections[index];
        const material = (ref.children[0] as any).material;
        
        if (material && connection.animated) {
          // Animate opacity for category connections
          material.opacity = connection.opacity + Math.sin(time * 2 + index) * 0.2;
        }
      }
    });
  });

  return (
    <>
      {connections.map((connection, index) => (
        <group key={index} ref={el => connectionRefs.current[index] = el}>
          <Line
            points={[connection.start, connection.end]}
            color={connection.color}
            lineWidth={connection.animated ? 2 : 1}
            transparent
            opacity={connection.opacity}
          />
        </group>
      ))}
    </>
  );
}

// Floating category labels
function CategoryLabels({ 
  categories,
  mousePosition 
}: { 
  categories: { name: string; position: [number, number, number]; color: string }[];
  mousePosition?: { x: number; y: number };
}) {
  const labelRefs = useRef<(THREE.Group | null)[]>([]);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    labelRefs.current.forEach((ref, index) => {
      if (ref) {
        // Gentle floating motion
        ref.position.y = categories[index].position[1] + Math.sin(time + index) * 0.05;
        
        // Face camera
        ref.lookAt(state.camera.position);
      }
    });
  });

  return (
    <>
      {categories.map((category, index) => (
        <group key={index} ref={el => labelRefs.current[index] = el} position={category.position}>
          <Sphere args={[0.05, 8, 8]}>
            <meshStandardMaterial 
              color={category.color}
              emissive={category.color}
              emissiveIntensity={0.4}
              transparent
              opacity={0.8}
            />
          </Sphere>
        </group>
      ))}
    </>
  );
}

// Environment particles for depth
function StudyParticles({ mousePosition }: { mousePosition?: { x: number; y: number } }) {
  const particlesRef = useRef<THREE.Points>(null);
  
  const particles = useMemo(() => {
    const count = 40;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 6;
        // Multi-colored particles
      const colorIndex = Math.floor(Math.random() * 3);
      if (colorIndex === 0) {
        colors[i * 3] = 0.2; colors[i * 3 + 1] = 0.2; colors[i * 3 + 2] = 0.2; // Dark gray
      } else if (colorIndex === 1) {
        colors[i * 3] = 0.5; colors[i * 3 + 1] = 0.5; colors[i * 3 + 2] = 0.5; // Medium gray
      } else {
        colors[i * 3] = 0.8; colors[i * 3 + 1] = 0.8; colors[i * 3 + 2] = 0.8; // Light gray
      }
    }
    
    return { positions, colors };
  }, []);

  useFrame((state) => {
    if (!particlesRef.current) return;
    
    const time = state.clock.elapsedTime;
    const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
    
    for (let i = 0; i < positions.length; i += 3) {
      positions[i + 1] += Math.sin(time * 0.5 + positions[i]) * 0.001;
      positions[i] += Math.cos(time * 0.3 + positions[i + 1]) * 0.0008;
      positions[i + 2] += Math.sin(time * 0.4 + i) * 0.0005;
    }
    
    particlesRef.current.geometry.attributes.position.needsUpdate = true;
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
        size={0.02}
        vertexColors
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

// Camera controller for Case Studies page
function CaseStudyCameraController({ mousePosition }: { mousePosition?: { x: number; y: number } }) {
  const { camera } = useThree();
  
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    // Orbital camera movement
    const radius = 6;
    const baseAngle = time * 0.1;
    const baseX = Math.cos(baseAngle) * 0.8;
    const baseY = Math.sin(time * 0.05) * 0.4;
    const baseZ = radius + Math.sin(time * 0.08) * 0.5;
    
    if (mousePosition) {
      camera.position.x = baseX + (mousePosition.x - 0.5) * 1.5;
      camera.position.y = baseY + (mousePosition.y - 0.5) * 1;
      camera.position.z = baseZ + (mousePosition.y - 0.5) * 0.8;
    } else {
      camera.position.x = baseX;
      camera.position.y = baseY;
      camera.position.z = baseZ;
    }
    
    camera.lookAt(0, 0, 0);
  });
  
  return null;
}

// Main Case Studies page Three.js scene
export default function CaseStudySceneAnimation({ 
  className = "",
  interactive = true 
}: { 
  className?: string;
  interactive?: boolean;
}) {
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | undefined>();
  const [activeProject, setActiveProject] = useState<number>(0);
    // Sample case study projects
  const projects = useMemo(() => [
    { position: [0, 0, 0] as [number, number, number], title: 'AI Design Tool', color: '#333333', category: 'AI/UX' },
    { position: [2, 1, -1] as [number, number, number], title: 'Healthcare App', color: '#666666', category: 'Mobile' },
    { position: [-2, 1, 1] as [number, number, number], title: 'Data Viz Dashboard', color: '#000000', category: 'Web' },
    { position: [1, -1.5, 0] as [number, number, number], title: 'AR Experience', color: '#999999', category: 'AR/VR' },
    { position: [-1.5, -1, -1] as [number, number, number], title: 'Design System', color: '#222222', category: 'System' },
    { position: [0, 2, 1] as [number, number, number], title: 'ML Platform', color: '#333333', category: 'AI/UX' },
  ], []);
  const categories = useMemo(() => [
    { name: 'AI/UX', position: [3, 2, 0] as [number, number, number], color: '#333333' },
    { name: 'Mobile', position: [3, 0, 0] as [number, number, number], color: '#666666' },
    { name: 'Web', position: [-3, 2, 0] as [number, number, number], color: '#000000' },
    { name: 'AR/VR', position: [0, -3, 0] as [number, number, number], color: '#999999' },
  ], []);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive) return;
    
    const rect = event.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: (event.clientX - rect.left) / rect.width,
      y: (event.clientY - rect.top) / rect.height,
    });
  };  // Auto-rotate active project with useEffect
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveProject((prev) => (prev + 1) % projects.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [projects.length]);

  return (
    <div 
      className={`w-full h-full ${className} ${interactive ? 'cursor-grab active:cursor-grabbing' : ''}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setMousePosition(undefined)}
    >
      <Canvas
        camera={{ position: [0, 0, 6], fov: 55 }}
        style={{ background: 'transparent' }}      >
        <ambientLight intensity={0.3} />
        <pointLight position={[5, 5, 5]} intensity={0.6} color="#ffffff" />
        <pointLight position={[-5, -5, 3]} intensity={0.4} color="#cccccc" />
        <spotLight position={[0, 8, 0]} intensity={0.3} color="#888888" />
        
        {/* Project Cubes */}
        {projects.map((project, index) => (
          <ProjectCube
            key={index}
            position={project.position}
            project={project}
            isActive={index === activeProject}
            mousePosition={mousePosition}
          />
        ))}
        
        {/* Project Connections */}
        <ProjectConnections projects={projects} mousePosition={mousePosition} />
        
        {/* Category Labels */}
        <CategoryLabels categories={categories} mousePosition={mousePosition} />
        
        {/* Environment Particles */}
        <StudyParticles mousePosition={mousePosition} />
        
        {/* Camera Controller */}
        <CaseStudyCameraController mousePosition={mousePosition} />
      </Canvas>
    </div>
  );
}
