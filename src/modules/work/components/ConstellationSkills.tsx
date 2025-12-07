import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Constellation configurations with mythological themes - wide layout with better spacing
const constellations = [
  {
    name: "Design & Research",
    mythName: "Andromeda the Visionary",
    description: "Crafting user-centric experiences",
    color: "#EC4899", // Pink
    stars: [
      { name: "Product Design", x: 120, y: 80, brightness: 5, type: "supergiant", projects: 20 },
      { name: "UI/UX", x: 200, y: 120, brightness: 5, type: "supergiant", projects: 25 },
      { name: "User Research", x: 80, y: 150, brightness: 4, type: "giant", projects: 15 },
      { name: "Design Systems", x: 250, y: 80, brightness: 4, type: "giant", projects: 12 },
      { name: "Prototyping", x: 180, y: 180, brightness: 4, type: "main", projects: 18 },
      { name: "Accessibility", x: 280, y: 160, brightness: 3, type: "main", projects: 8 },
      { name: "Branding", x: 100, y: 220, brightness: 3, type: "dwarf", projects: 10 },
    ],
    connections: [[0, 1], [1, 3], [1, 4], [2, 4], [4, 5], [2, 6], [0, 2]]
  },
  {
    name: "Creative Tools",
    mythName: "Lyra the Creator",
    description: "Instruments of digital creation",
    color: "#8B5CF6", // Purple
    stars: [
      { name: "Figma", x: 150, y: 350, brightness: 5, type: "supergiant", projects: 30 },
      { name: "Adobe CC", x: 80, y: 400, brightness: 4, type: "giant", projects: 20 },
      { name: "Spline 3D", x: 220, y: 380, brightness: 4, type: "main", projects: 5 },
      { name: "Rive", x: 280, y: 340, brightness: 3, type: "dwarf", projects: 3 },
      { name: "Blender", x: 180, y: 450, brightness: 3, type: "main", projects: 4 },
      { name: "Protopie", x: 260, y: 420, brightness: 3, type: "dwarf", projects: 6 },
    ],
    connections: [[0, 1], [0, 2], [1, 4], [2, 3], [2, 5], [4, 5]]
  },
  {
    name: "Frontend Engineering",
    mythName: "Orion the Builder",
    description: "Architecting the visual web",
    color: "#3B82F6", // Blue
    stars: [
      { name: "React", x: 450, y: 100, brightness: 5, type: "supergiant", projects: 25 },
      { name: "TypeScript", x: 550, y: 80, brightness: 5, type: "giant", projects: 20 },
      { name: "Next.js", x: 400, y: 160, brightness: 4, type: "main", projects: 15 },
      { name: "Flutter", x: 600, y: 140, brightness: 4, type: "giant", projects: 10 },
      { name: "ThreeJS", x: 500, y: 200, brightness: 3, type: "main", projects: 5 },
      { name: "GSAP", x: 620, y: 220, brightness: 3, type: "dwarf", projects: 4 },
    ],
    connections: [[0, 1], [0, 2], [1, 3], [0, 4], [3, 5], [4, 5]]
  },
  {
    name: "Backend & Cloud",
    mythName: "Hercules the Scaler",
    description: "Powering robust infrastructure",
    color: "#10B981", // Green
    stars: [
      { name: "Node.js", x: 450, y: 350, brightness: 5, type: "supergiant", projects: 15 },
      { name: "Spring Boot", x: 550, y: 330, brightness: 4, type: "giant", projects: 8 },
      { name: "AWS", x: 400, y: 420, brightness: 5, type: "supergiant", projects: 12 },
      { name: "Docker", x: 500, y: 400, brightness: 4, type: "main", projects: 10 },
      { name: "PostgreSQL", x: 600, y: 380, brightness: 3, type: "main", projects: 8 },
      { name: "Supabase", x: 620, y: 450, brightness: 3, type: "dwarf", projects: 6 },
    ],
    connections: [[0, 1], [0, 2], [1, 4], [2, 3], [3, 4], [4, 5]]
  },
  {
    name: "AI & Leadership",
    mythName: "Cassiopeia the Guide",
    description: "Leading with intelligence",
    color: "#F59E0B", // Amber
    stars: [
      { name: "AI/LLMs", x: 800, y: 200, brightness: 5, type: "supergiant", projects: 8 },
      { name: "Design Leadership", x: 900, y: 150, brightness: 5, type: "giant", projects: 5 },
      { name: "Agile/Scrum", x: 850, y: 280, brightness: 4, type: "main", projects: 12 },
      { name: "Mentoring", x: 750, y: 250, brightness: 4, type: "main", projects: 10 },
      { name: "Splunk", x: 920, y: 250, brightness: 3, type: "dwarf", projects: 4 },
      { name: "Stakeholder Mgmt", x: 820, y: 350, brightness: 3, type: "main", projects: 15 },
    ],
    connections: [[0, 1], [0, 3], [1, 2], [2, 4], [2, 5], [3, 5]]
  }
];

// Robust seeded random function for consistent results across SSR and client
// Uses a linear congruential generator for perfect consistency
const seededRandom = (seed: number) => {
  // Use a simple LCG algorithm that produces identical results everywhere
  const a = 1664525;
  const c = 1013904223;
  const m = Math.pow(2, 32);
  const value = (a * seed + c) % m;
  return value / m;
};

// Background constellation stars for atmosphere - hand-drawn style with deterministic positioning
const generateBackgroundStars = (count: number) => {
  const stars: Array<{
    id: string;
    x: number;
    y: number;
    size: number;
    opacity: number;
    twinkleDelay: number;
  }> = [];
  
  for (let i = 0; i < count; i++) {
    // Use progressive seeds to ensure different values for each property
    const baseSeed = i * 1000; // Larger increment for better distribution
    stars.push({
      id: `bg-star-${i}`,
      x: seededRandom(baseSeed + 1) * 960 + 20,
      y: seededRandom(baseSeed + 2) * 510 + 20,
      size: seededRandom(baseSeed + 3) * 1.5 + 0.5,
      opacity: seededRandom(baseSeed + 4) * 0.6 + 0.2,
      twinkleDelay: seededRandom(baseSeed + 5) * 4
    });
  }
  return stars;
};

const backgroundStars = generateBackgroundStars(40);

export const ConstellationSkills: React.FC = () => {
  const [hoveredConstellation, setHoveredConstellation] = useState<number | null>(null);
  const [hoveredStar, setHoveredStar] = useState<{ constellation: number; star: number } | null>(null);
  const [showConstellationNames, setShowConstellationNames] = useState(true);

  // Get pin size based on brightness and type - notebook pin style
  const getPinSize = (brightness: number, type: string, isHovered: boolean) => {
    let baseSize: number;
    if (type === 'supergiant') {
      baseSize = 8;
    } else if (type === 'giant') {
      baseSize = 7;
    } else if (type === 'main') {
      baseSize = 6;
    } else {
      baseSize = 5;
    }
    
    const brightnessMultiplier = brightness / 5;
    const hoverMultiplier = isHovered ? 1.2 : 1;
    return baseSize * brightnessMultiplier * hoverMultiplier;
  };

  // Get pin color - more muted for notebook style
  const getPinColor = (type: string, constellationColor: string, isHovered: boolean) => {
    if (isHovered) return "#6366F1"; // Indigo when hovered to match your theme
    
    switch (type) {
      case 'supergiant': return "#EF4444"; // Red
      case 'giant': return "#3B82F6"; // Blue
      case 'main': return "#10B981"; // Green
      case 'dwarf': return "#6B7280"; // Gray
      default: return constellationColor;
    }
  };

  // Create pin SVG shape - notebook pin style
  const createPinShape = (x: number, y: number, size: number, color: string, isHovered: boolean) => {
    const headRadius = size;
    const pinLength = size * 2;
    const rotation = isHovered ? 15 : 0;
    
    return (
      <g transform={`rotate(${rotation} ${x} ${y})`}>
        {/* Pin shaft */}
        <line
          x1={x}
          y1={y}
          x2={x}
          y2={y + pinLength}
          stroke="#6B7280"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* Pin head (circular) */}
        <circle
          cx={x}
          cy={y}
          r={headRadius}
          fill={color}
          stroke="#374151"
          strokeWidth="1.5"
        />
        {/* Pin reflection */}
        <circle
          cx={x - headRadius * 0.3}
          cy={y - headRadius * 0.3}
          r={headRadius * 0.2}
          fill="rgba(255, 255, 255, 0.7)"
        />
      </g>
    );
  };

  return (
    <div className="relative w-full max-w-7xl mx-auto overflow-visible">
      {/* Clean wireframe container - no notebook styles */}
      <div className="relative bg-white p-4 md:p-8">
        
        {/* Header with hand-drawn style */}
        <div className="text-center mb-8 pl-0 md:pl-16">
          <motion.h2 
            className={`text-3xl md:text-4xl font-bold text-black mb-2 handwritten`}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ fontFamily: 'Left Hand, cursive' }}
          >
            My Skill Pin Board
          </motion.h2>
          <motion.p 
            className={`text-lg text-gray-600 mb-4 handwritten`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            style={{ fontFamily: 'Left Hand, cursive' }}
          >
            Navigate the cosmos of my expertise • Hover over pins to discover their power
          </motion.p>
          
          {/* Toggle constellation names - wireframe button */}
          <motion.button
            onClick={() => setShowConstellationNames(!showConstellationNames)}
            className={`px-5 py-2 bg-white border border-black text-black hover:bg-gray-50 transition-all handwritten`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{ fontFamily: 'Left Hand, cursive' }}
          >
            {showConstellationNames ? 'Hide Names' : 'Show Names'}
          </motion.button>
        </div>

        {/* Constellation SVG with simple grid background */}
        <div className="relative pl-0 md:pl-16">
          {/* Subtle technical grid */}
          <div className="absolute inset-0 opacity-10">
            <svg width="100%" height="600" className="absolute inset-0">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#000" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          <svg width="100%" height="600" className="overflow-visible relative" viewBox="0 0 1000 550">
            {/* Background stars - more subtle */}
            {backgroundStars.map((star) => (
              <motion.circle
                key={star.id}
                cx={star.x}
                cy={star.y}
                r={star.size}
                fill="#D1D5DB"
                opacity={star.opacity * 0.5}
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: [star.opacity * 0.5, star.opacity * 0.2, star.opacity * 0.5],
                }}
                transition={{
                  duration: 3 + star.twinkleDelay,
                  repeat: Infinity,
                  delay: star.twinkleDelay
                }}
              />
            ))}

            {/* Constellation connections - hand-drawn style */}
            {constellations.map((constellation, constIndex) => (
              <g key={`connections-${constellation.name}`}>
                {constellation.connections.map(([from, to], lineIndex) => {
                  const starA = constellation.stars[from];
                  const starB = constellation.stars[to];
                  const isHighlighted = hoveredConstellation === constIndex;
                  
                  return (
                    <motion.line
                      key={`line-${constIndex}-${lineIndex}`}
                      x1={starA.x}
                      y1={starA.y}
                      x2={starB.x}
                      y2={starB.y}
                      stroke={constellation.color}
                      strokeWidth={isHighlighted ? 2 : 1}
                      strokeDasharray="3 2"
                      opacity={isHighlighted ? 0.8 : 0.4}
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: isHighlighted ? 0.8 : 0.4 }}
                      transition={{ delay: constIndex * 0.3 + lineIndex * 0.1, duration: 0.6 }}
                    />
                  );
                })}
              </g>
            ))}

            {/* Pins - notebook pin style */}
            {constellations.map((constellation, constIndex) => (
              <g key={`pins-${constellation.name}`}>
                {constellation.stars.map((star, starIndex) => {
                  const isStarHovered = hoveredStar?.constellation === constIndex && hoveredStar?.star === starIndex;
                  const isConstellationHovered = hoveredConstellation === constIndex;
                  const pinSize = getPinSize(star.brightness, star.type, isStarHovered);
                  const pinColor = getPinColor(star.type, constellation.color, isStarHovered);
                  
                  return (
                    <g key={`pin-${constIndex}-${starIndex}`}>
                      {/* Pin shape */}
                      <motion.g
                        style={{ cursor: 'pointer' }}
                        onMouseEnter={() => {
                          setHoveredConstellation(constIndex);
                          setHoveredStar({ constellation: constIndex, star: starIndex });
                        }}
                        onMouseLeave={() => {
                          setHoveredConstellation(null);
                          setHoveredStar(null);
                        }}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: constIndex * 0.3 + starIndex * 0.1 }}
                        whileHover={{ scale: 1.15 }}
                      >
                        {createPinShape(star.x, star.y, pinSize, pinColor, isStarHovered)}
                      </motion.g>

                      {/* Pin name label - improved positioning with better spacing */}
                      <motion.text
                        x={star.x + (star.x > 410 ? -20 : 20)}
                        y={star.y - pinSize - 15}
                        textAnchor={star.x > 410 ? "end" : "start"}
                        className={`text-sm font-bold handwritten`}
                        fill={isStarHovered ? "#6366F1" : "#374151"}
                        opacity={isStarHovered || isConstellationHovered ? 1 : 0.8}
                        style={{ pointerEvents: 'none', fontFamily: 'Left Hand, cursive' }}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: isStarHovered || isConstellationHovered ? 1 : 0.8, y: 0 }}
                        transition={{ delay: constIndex * 0.3 + starIndex * 0.1 + 0.5 }}
                      >
                        {star.name}
                      </motion.text>
                    </g>
                  );
                })}
              </g>
            ))}

            {/* Constellation names and descriptions - fixed positioning to prevent overlaps */}
            {showConstellationNames && constellations.map((constellation, constIndex) => {
              const centerX = constellation.stars.reduce((sum, star) => sum + star.x, 0) / constellation.stars.length;
              const centerY = constellation.stars.reduce((sum, star) => sum + star.y, 0) / constellation.stars.length;
              const isHighlighted = hoveredConstellation === constIndex;
              
              // Fixed positioning for each constellation to prevent overlaps
              let labelX, labelY;
              switch (constIndex) {
                case 0: // Design & Research - Top Left
                  labelX = centerX;
                  labelY = centerY - 80;
                  break;
                case 1: // Creative Tools - Bottom Left
                  labelX = centerX;
                  labelY = centerY + 80;
                  break;
                case 2: // Frontend - Top Center
                  labelX = centerX;
                  labelY = centerY - 80;
                  break;
                case 3: // Backend - Bottom Center
                  labelX = centerX;
                  labelY = centerY + 80;
                  break;
                case 4: // AI & Leadership - Right
                  labelX = centerX;
                  labelY = centerY - 80;
                  break;
                default:
                  labelX = centerX;
                  labelY = centerY > 275 ? centerY - 80 : centerY + 80;
              }
              
              return (
                <motion.g
                  key={`label-${constellation.name}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: constIndex * 0.5 + 1 }}
                >
                  {/* Hand-drawn label background */}
                  <rect
                    x={labelX - 80}
                    y={labelY - 25}
                    width="160"
                    height="50"
                    fill="rgba(255, 255, 255, 0.95)"
                    stroke={constellation.color}
                    strokeWidth={isHighlighted ? 2 : 1}
                    strokeDasharray="2 1"
                    rx="8"
                    opacity={isHighlighted ? 1 : 0.9}
                    transform={`rotate(${seededRandom(constIndex * 1000 + 100) * 4 - 2} ${labelX} ${labelY})`}
                  />
                  
                  {/* Myth name */}
                  <text
                    x={labelX}
                    y={labelY - 5}
                    textAnchor="middle"
                    className={`text-sm font-bold handwritten`}
                    fill={constellation.color}
                    style={{ fontFamily: 'Left Hand, cursive' }}
                  >
                    {constellation.mythName}
                  </text>
                  
                  {/* Description */}
                  <text
                    x={labelX}
                    y={labelY + 15}
                    textAnchor="middle"
                    className={`text-xs handwritten`}
                    fill="#6B7280"
                    opacity="0.9"
                    style={{ fontFamily: 'Left Hand, cursive' }}
                  >
                    {constellation.description}
                  </text>
                </motion.g>
              );
            })}

            {/* Detailed tooltip for hovered pin - improved positioning for wide layout */}
            <AnimatePresence>
              {hoveredStar && (
                <motion.g
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                >
                  {(() => {
                    const constellation = constellations[hoveredStar.constellation];
                    const star = constellation.stars[hoveredStar.star];
                    
                    // Smart tooltip positioning for wider layout
                    const tooltipWidth = 160;
                    const tooltipHeight = 65;
                    let tooltipX = star.x + 25;
                    let tooltipY = star.y - tooltipHeight - 15;
                    
                    // Adjust if going off right edge
                    if (tooltipX + tooltipWidth > 980) {
                      tooltipX = star.x - tooltipWidth - 25;
                    }
                    
                    // Adjust if going off top edge
                    if (tooltipY < 10) {
                      tooltipY = star.y + 30;
                    }
                    
                    // Adjust if going off bottom edge
                    if (tooltipY + tooltipHeight > 540) {
                      tooltipY = star.y - tooltipHeight - 15;
                    }
                    
                    return (
                      <>
                        {/* Hand-drawn tooltip background */}
                        <rect
                          x={tooltipX}
                          y={tooltipY}
                          width={tooltipWidth}
                          height={tooltipHeight}
                          fill="rgba(255, 255, 255, 0.98)"
                          stroke="#6366F1"
                          strokeWidth="2"
                          strokeDasharray="3 1"
                          rx="10"
                          transform={`rotate(${seededRandom(hoveredStar.constellation * 10000 + hoveredStar.star * 1000 + 500) * 3 - 1.5} ${tooltipX + tooltipWidth/2} ${tooltipY + tooltipHeight/2})`}
                        />
                        
                        {/* Pin name */}
                        <text
                          x={tooltipX + tooltipWidth/2}
                          y={tooltipY + 20}
                          textAnchor="middle"
                          className={`text-sm font-bold handwritten`}
                          fill="#6366F1"
                          style={{ fontFamily: 'Left Hand, cursive' }}
                        >
                          📌 {star.name}
                        </text>
                        
                        {/* Pin type and brightness */}
                        <text
                          x={tooltipX + tooltipWidth/2}
                          y={tooltipY + 38}
                          textAnchor="middle"
                          className={`text-xs handwritten`}
                          fill="#374151"
                          style={{ fontFamily: 'Left Hand, cursive' }}
                        >
                          {star.type} • ⭐{star.brightness}/5
                        </text>
                        
                        {/* Projects count */}
                        <text
                          x={tooltipX + tooltipWidth/2}
                          y={tooltipY + 55}
                          textAnchor="middle"
                          className={`text-xs handwritten`}
                          fill="#6B7280"
                          style={{ fontFamily: 'Left Hand, cursive' }}
                        >
                          {star.projects} projects completed
                        </text>
                      </>
                    );
                  })()}
                </motion.g>
              )}
            </AnimatePresence>

            {/* Hand-drawn filters */}
            <defs>
              <filter id="paperTexture" x="0%" y="0%" width="100%" height="100%">
                <feTurbulence baseFrequency="0.04" numOctaves="5" result="noise"/>
                <feColorMatrix in="noise" type="saturate" values="0"/>
                <feComponentTransfer>
                  <feFuncA type="discrete" tableValues="0.5 .6 .7 .8 .9 1"/>
                </feComponentTransfer>
              </filter>
            </defs>
          </svg>
        </div>

        {/* Hand-drawn legend - updated for pins */}
        <motion.div 
          className="mt-8 flex flex-wrap justify-center gap-4 text-gray-700 pl-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2 }}
        >
          <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-none">
            <div className="w-4 h-4 bg-red-400 rounded-none border border-gray-700"></div>
            <span className={`text-sm handwritten`} style={{ fontFamily: 'Left Hand, cursive' }}>📌 Expert Level</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-none">
            <div className="w-4 h-4 bg-blue-400 rounded-none border border-gray-700"></div>
            <span className={`text-sm handwritten`} style={{ fontFamily: 'Left Hand, cursive' }}>📌 Advanced</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-none">
            <div className="w-4 h-4 bg-green-400 rounded-none border border-gray-700"></div>
            <span className={`text-sm handwritten`} style={{ fontFamily: 'Left Hand, cursive' }}>📌 Proficient</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-none">
            <div className="w-4 h-4 bg-gray-400 rounded-none border border-gray-700"></div>
            <span className={`text-sm handwritten`} style={{ fontFamily: 'Left Hand, cursive' }}>📌 Learning</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ConstellationSkills;
