import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Constellation configurations with mythological themes - wide layout with better spacing
const constellations = [
  {
    name: "Frontend Constellation",
    mythName: "Orion the Developer",
    description: "The mighty hunter of user interfaces",
    color: "#3B82F6",
    stars: [
      { name: "React", x: 180, y: 120, brightness: 5, type: "supergiant", projects: 12 },
      { name: "TypeScript", x: 280, y: 100, brightness: 5, type: "giant", projects: 10 },
      { name: "Next.js", x: 150, y: 180, brightness: 4, type: "main", projects: 8 },
      { name: "Tailwind CSS", x: 250, y: 160, brightness: 4, type: "main", projects: 9 },
      { name: "Framer Motion", x: 320, y: 140, brightness: 3, type: "dwarf", projects: 6 },
    ],
    connections: [[0, 1], [1, 2], [2, 3], [0, 4], [1, 4]]
  },
  {
    name: "Design Constellation",
    mythName: "Andromeda the Creative",
    description: "The princess of visual storytelling",
    color: "#EC4899",
    stars: [
      { name: "UI/UX Design", x: 580, y: 110, brightness: 5, type: "supergiant", projects: 15 },
      { name: "Figma", x: 680, y: 100, brightness: 4, type: "giant", projects: 12 },
      { name: "Branding", x: 520, y: 170, brightness: 4, type: "main", projects: 8 },
      { name: "Prototyping", x: 620, y: 180, brightness: 3, type: "main", projects: 7 },
      { name: "Visual Design", x: 720, y: 150, brightness: 4, type: "giant", projects: 10 },
    ],
    connections: [[0, 1], [0, 2], [1, 4], [2, 3], [3, 4]]
  },
  {
    name: "Backend Constellation",
    mythName: "Hercules the Builder",
    description: "The strongest force in system architecture",
    color: "#10B981",
    stars: [
      { name: "Node.js", x: 200, y: 320, brightness: 4, type: "giant", projects: 8 },
      { name: "Python", x: 300, y: 350, brightness: 4, type: "giant", projects: 6 },
      { name: "AWS", x: 160, y: 380, brightness: 5, type: "supergiant", projects: 10 },
      { name: "Docker", x: 260, y: 400, brightness: 3, type: "main", projects: 5 },
      { name: "Databases", x: 340, y: 320, brightness: 3, type: "main", projects: 7 },
    ],
    connections: [[0, 1], [0, 2], [1, 4], [2, 3], [0, 4]]
  },
  {
    name: "AI/Data Constellation",
    mythName: "Cassiopeia the Wise",
    description: "The oracle of artificial intelligence",
    color: "#8B5CF6",
    stars: [
      { name: "Machine Learning", x: 600, y: 300, brightness: 5, type: "supergiant", projects: 5 },
      { name: "Data Analysis", x: 540, y: 340, brightness: 4, type: "giant", projects: 4 },
      { name: "AI Integration", x: 680, y: 340, brightness: 4, type: "giant", projects: 3 },
      { name: "Python ML", x: 620, y: 380, brightness: 3, type: "main", projects: 4 },
      { name: "TensorFlow", x: 720, y: 310, brightness: 3, type: "dwarf", projects: 2 },
    ],
    connections: [[0, 1], [0, 2], [1, 3], [2, 3], [0, 4]]
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
      x: seededRandom(baseSeed + 1) * 780 + 20,
      y: seededRandom(baseSeed + 2) * 420 + 20,
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
      {/* Hand-drawn notebook style background - wider */}
      <div className="relative bg-white/95 border-2 border-dashed border-gray-300 rounded-2xl p-8 shadow-lg">
        {/* Notebook spiral holes */}
        <div className="absolute left-8 top-0 bottom-0 flex flex-col justify-around py-8">
          {[...Array(12)].map((_, i) => (
            <div
              key={`spiral-hole-position-${i * 8.33}%`}
              className="w-4 h-4 rounded-full border-2 border-gray-300 bg-white shadow-inner"
            />
          ))}
        </div>

        {/* Header with hand-drawn style */}
        <div className="text-center mb-8 pl-16">
          <motion.h2 
            className={`text-3xl md:text-4xl font-bold text-gray-800 mb-2 handwritten`}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ fontFamily: 'Left Hand, cursive' }}
          >
            📌 My Skill Pin Board 📌
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
          
          {/* Toggle constellation names - hand-drawn button */}
          <motion.button
            onClick={() => setShowConstellationNames(!showConstellationNames)}
            className={`px-4 py-2 bg-blue-100 border-2 border-dashed border-blue-300 rounded-lg text-blue-700 hover:bg-blue-200 transition-all handwritten shadow-md`}
            whileHover={{ scale: 1.05, rotate: 1 }}
            whileTap={{ scale: 0.95 }}
            style={{ fontFamily: 'Left Hand, cursive' }}
          >
            {showConstellationNames ? '🌙 Hide Names' : '🌟 Show Names'}
          </motion.button>
        </div>

        {/* Constellation SVG with notebook grid background - wider layout */}
        <div className="relative pl-16">
          {/* Subtle notebook grid */}
          <div className="absolute inset-0 opacity-20">
            <svg width="100%" height="500" className="absolute inset-0">
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          <svg width="100%" height="500" className="overflow-visible relative" viewBox="0 0 820 480">
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
                case 0: // Orion (Frontend) - top left
                  labelX = centerX - 20;
                  labelY = centerY - 100;
                  break;
                case 1: // Andromeda (Design) - top right  
                  labelX = centerX + 20;
                  labelY = centerY - 100;
                  break;
                case 2: // Hercules (Backend) - bottom left
                  labelX = centerX - 20;
                  labelY = centerY + 100;
                  break;
                case 3: // Cassiopeia (AI) - bottom right
                  labelX = centerX + 20;
                  labelY = centerY + 100;
                  break;
                default:
                  labelX = centerX;
                  labelY = centerY > 240 ? centerY - 80 : centerY + 80;
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
                    if (tooltipX + tooltipWidth > 800) {
                      tooltipX = star.x - tooltipWidth - 25;
                    }
                    
                    // Adjust if going off top edge
                    if (tooltipY < 10) {
                      tooltipY = star.y + 30;
                    }
                    
                    // Adjust if going off bottom edge
                    if (tooltipY + tooltipHeight > 460) {
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
          <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-lg">
            <div className="w-4 h-4 bg-red-400 rounded-full border-2 border-gray-700"></div>
            <span className={`text-sm handwritten`} style={{ fontFamily: 'Left Hand, cursive' }}>📌 Expert Level</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="w-4 h-4 bg-blue-400 rounded-full border-2 border-gray-700"></div>
            <span className={`text-sm handwritten`} style={{ fontFamily: 'Left Hand, cursive' }}>📌 Advanced</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
            <div className="w-4 h-4 bg-green-400 rounded-full border-2 border-gray-700"></div>
            <span className={`text-sm handwritten`} style={{ fontFamily: 'Left Hand, cursive' }}>📌 Proficient</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="w-4 h-4 bg-gray-400 rounded-full border-2 border-gray-700"></div>
            <span className={`text-sm handwritten`} style={{ fontFamily: 'Left Hand, cursive' }}>📌 Learning</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ConstellationSkills;
