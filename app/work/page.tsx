'use client';

import ScribbleAnimation from '@/components/three/scribble-animation';
import { SketchHeading, SketchCard } from '@/components/ui/sketch-elements';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { useState, useRef } from 'react';
import { ConstellationSkills } from "@/components/interactive/ConstellationSkills";

// Font utility classes
const magneticFont = 'font-[MagneticDrawing,MagneticDrawingFallback,sans-serif]';
const handwrittenFont = 'handwritten';
const dataFont = 'font-mono tracking-tight';

// Simple BarChart for skills/tools
const BarChart = ({ data }: { data: { label: string; value: number; color: string }[] }) => (
  <div className="w-full flex flex-col gap-2 mt-2">
    {data.map((item, i) => (
      <div key={item.label} className="flex items-center gap-2">
        <span className={`text-xs ${handwrittenFont} w-20`}>{item.label}</span>
        <div className="flex-1 bg-gray-100 rounded-full h-3 relative">
          <motion.div
            className="h-3 rounded-full absolute left-0 top-0"
            style={{ background: item.color, width: `${item.value}%` }}
            initial={{ width: 0 }}
            animate={{ width: `${item.value}%` }}
            transition={{ duration: 1.2, delay: 0.2 + i * 0.1 }}
          />
        </div>
        <span className={`text-xs ${handwrittenFont} ml-2`}>{item.value}%</span>
      </div>
    ))}
  </div>
);

// Simple DonutChart for impact
const DonutChart = ({ value, color }: { value: number; color: string }) => {
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  return (
    <svg width="48" height="48" className="inline-block align-middle">
      <circle
        cx="24" cy="24" r={radius}
        stroke="#e5e7eb" strokeWidth="8" fill="none"
      />
      <motion.circle
        cx="24" cy="24" r={radius}
        stroke={color}
        strokeWidth="8" fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={circumference}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.2 }}
        strokeLinecap="round"
      />
      <text x="24" y="28" textAnchor="middle" className={`text-base fill-gray-700 ${handwrittenFont}`}>
        {value}%
      </text>
    </svg>
  );
};

// Interactive Sketch Pad Component
const InteractiveSketchPad = ({ 
  children, 
  className = "",
  sketches = [] 
}: { 
  children: React.ReactNode;
  className?: string;
  sketches?: Array<{ path: string; color: string; delay: number }>;
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-0 pointer-events-none">
        <svg 
          ref={svgRef}
          className="w-full h-full" 
          viewBox="0 0 400 300"
          style={{ filter: 'url(#pencil-texture)' }}
        >
          <defs>
            <filter id="pencil-texture">
              <feTurbulence baseFrequency="0.9" numOctaves="4" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.8" />
            </filter>
          </defs>
          {sketches.map((sketch) => (
            <motion.path
              key={sketch.path}
              d={sketch.path}
              stroke={sketch.color}
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.6 }}
              transition={{ 
                duration: 2,
                delay: sketch.delay,
                ease: "easeInOut"
              }}
            />
          ))}
        </svg>
      </div>
      {children}
    </div>
  );
};

// Draggable Project Card Component
const DraggableProjectCard = ({ 
  project, 
  index,
  onClick
}: { 
  project: any;
  index: number;
  onClick: () => void;
}) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [10, -10]);
  const rotateY = useTransform(x, [-100, 100], [-10, 10]);
  const [isDragging, setIsDragging] = useState(false);

  return (
    <motion.div
      drag
      dragConstraints={{ left: -60, right: 60, top: -60, bottom: 60 }}
      style={{ x, y, rotateX, rotateY }}
      whileHover={{ scale: 1.025, boxShadow: '0 4px 24px 0 rgba(0,0,0,0.08)' }}
      whileTap={{ scale: 0.98 }}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={() => setIsDragging(false)}
      onClick={onClick}
      className={`cursor-pointer transition-shadow duration-200 ${isDragging ? 'z-50' : ''}`}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: index * 0.15, type: 'tween' }}
    >
      <InteractiveSketchPad 
        className="w-80 h-96"
        sketches={project.sketches}
      >
        <SketchCard className="w-full h-full p-6 backdrop-blur-sm bg-white/95 border-2 border-dashed border-gray-300 relative">
          {/* Torn paper effect */}
          <div className="absolute -top-1 left-4 w-8 h-6 bg-white border-l-2 border-r-2 border-gray-200 opacity-80 transform rotate-12"></div>
          {/* Project Icon/Sketch */}
          <div className="text-center mb-4">
            <div className="relative w-16 h-16 mx-auto mb-3">
              <motion.svg 
                className="w-full h-full"
                viewBox="0 0 64 64"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.2, delay: 0.3 + index * 0.2 }}
              >
                <motion.path
                  d={project.iconPath}
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ filter: 'url(#pencil-texture)' }}
                />
              </motion.svg>
            </div>
            <SketchHeading level={3} className="text-lg mb-2" underline={false}>
              {project.title}
            </SketchHeading>
          </div>
          {/* Handwritten Description */}
          <div className="handwritten text-sm text-gray-700 mb-4 leading-relaxed">
            {project.description}
          </div>
          {/* Impact Doodles */}
          <ul className="mb-4 space-y-1 pl-3 border-l-2 border-dashed border-green-200">
            {project.impacts.map((impact: string, i: number) => (
              <li key={impact} className="flex items-center gap-2 text-xs text-green-700">
                <span className="inline-block w-2 h-2 rounded-full bg-green-300"></span>
                <span>{impact}</span>
              </li>
            ))}
          </ul>
          {/* Sketchy Status Badge */}
          <div className="absolute bottom-4 right-4">
            <span
              className="px-3 py-1 border-2 border-dashed rounded-full handwritten text-xs bg-opacity-80"
              style={{ backgroundColor: project.statusColor }}
            >
              {project.status}
            </span>
          </div>
          {/* View Details CTA */}
          <div className="absolute bottom-4 left-4">
            <button
              className="px-3 py-1 bg-blue-50 border border-blue-200 rounded-full text-xs text-blue-700 font-semibold hover:bg-blue-100 transition"
              tabIndex={-1}
            >
              View Story
            </button>
          </div>
        </SketchCard>
      </InteractiveSketchPad>
    </motion.div>
  );
};

// Stunning RadarChart for skills/tools
const RadarChart = ({ data }: { data: { label: string; value: number; color: string }[] }) => {
  const numAxes = data.length;
  const radius = 70;
  const center = 90;
  const angleStep = (2 * Math.PI) / numAxes;
  // Calculate points for the radar shape
  const points = data.map((item, i) => {
    const angle = i * angleStep - Math.PI / 2;
    const r = radius * (item.value / 100);
    return [
      center + r * Math.cos(angle),
      center + r * Math.sin(angle)
    ];
  });
  // For axis lines
  const axisPoints = data.map((_, i) => {
    const angle = i * angleStep - Math.PI / 2;
    return [
      center + radius * Math.cos(angle),
      center + radius * Math.sin(angle)
    ];
  });
  // Animate the radar shape
  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0]},${p[1]}`).join(' ') + ' Z';
  return (
    <svg width="180" height="180" className="mx-auto mb-2">
      {/* Axes */}
      {axisPoints.map((p, i) => (
        <line
          key={`axis-${data[i].label}`}
          x1={center} y1={center} x2={p[0]} y2={p[1]}
          stroke="#d1d5db" strokeWidth="1" strokeDasharray="2 2"
        />
      ))}
      {/* Outer polygon */}
      <polygon
        points={axisPoints.map(p => p.join(",")).join(" ")}
        fill="#f3f4f6" stroke="#a3a3a3" strokeWidth="1.5" opacity="0.5"
      />
      {/* Animated radar shape */}
      <motion.path
        d={pathD}
        fill="#60a5fa33"
        stroke="#60a5fa"
        strokeWidth="2.5"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.2 }}
        style={{ filter: 'url(#pencil-texture)' }}
      />
      {/* Dots and labels */}
      {points.map((p, i) => (
        <g key={data[i].label}>
          <circle cx={p[0]} cy={p[1]} r="5" fill={data[i].color} stroke="#fff" strokeWidth="2" />
          <text
            x={axisPoints[i][0]}
            y={axisPoints[i][1]}
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-xs"
            style={{ fontFamily: 'Left Hand, cursive', fill: '#374151', pointerEvents: 'none', fontSize: 13 }}
            dx={((axisPoints[i][0] - center) * 0.18)}
            dy={((axisPoints[i][1] - center) * 0.18)}
          >
            {data[i].label}
          </text>
          <text
            x={p[0]}
            y={p[1] - 12}
            textAnchor="middle"
            className="text-xs"
            style={{ fontFamily: 'Left Hand, cursive', fill: '#2563eb', fontWeight: 700, fontSize: 12 }}
          >
            {data[i].value}%
          </text>
        </g>
      ))}
      <defs>
        <filter id="pencil-texture">
          <feTurbulence baseFrequency="0.9" numOctaves="4" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.8" />
        </filter>
      </defs>
    </svg>
  );
};

// Creative Project Data - Like scattered sketches on a desk
const creativeProjects = [
  {
    title: "AI Sketch Translator",
    description: "Turn my messy sketches into clean wireframes using computer vision magic ✨",
    status: "Live & Kicking",
    statusColor: "#d4f6d4",
    impacts: [
      "Saved 20+ hours per week",
      "Used by 500+ designers",
      "Featured in Design Weekly"
    ],
    iconPath: "M8 8 C8 8 16 2 32 8 C48 14 56 8 56 8 M8 32 Q16 20 32 32 Q48 44 56 32 M16 48 L32 40 L48 48",
    sketches: [
      { path: "M50 50 Q100 20 150 50 Q200 80 250 50", color: "#3b82f6", delay: 0.5 },
      { path: "M80 80 C120 60 160 100 200 80", color: "#ef4444", delay: 1.0 }
    ],
    tools: ["Python", "OpenCV", "React", "Figma API"],
    demoUrl: "/sketch-demo",
    story: "This project was born from my frustration with translating sketches to wireframes. I wanted to automate the process, making it faster and more accurate.",
    role: "Sole Creator",
  },
  {
    title: "Empathy Analytics Dashboard",
    description: "Because numbers should tell human stories, not just boring metrics 📊❤️",
    status: "Beta Testing",
    statusColor: "#fef3c7",
    impacts: [
      "40% better user retention",
      "Emotion detection at 87%",
      "Privacy-first approach"
    ],
    iconPath: "M32 16 C32 16 40 8 48 16 C48 24 32 40 32 40 C32 40 16 24 16 16 C24 8 32 16 32 16 Z",
    sketches: [
      { path: "M100 100 Q150 50 200 100 T300 100", color: "#8b5cf6", delay: 0.3 },
      { path: "M120 120 C160 100 180 140 220 120", color: "#06b6d4", delay: 0.8 }
    ],
    tools: ["D3.js", "Emotion AI", "React", "Firebase"],
    demoUrl: "/empathy-demo",
    story: "I wanted to create a dashboard that not only displays data but also conveys the emotions behind the numbers. This project combines my skills in AI and data visualization.",
    role: "Lead Developer",
  },
  {
    title: "Scribble-to-Component Tool",
    description: "Draw a button, get React code. Draw a card, get Tailwind magic. It's like coding with crayons! 🖍️",
    status: "Prototype",
    statusColor: "#fce7f3",
    impacts: [
      "10x faster prototyping",
      "90% code accuracy",
      "Zero design-dev handoff"
    ],
    iconPath: "M8 8 L56 8 L56 56 L8 56 Z M16 20 L24 20 M16 28 L40 28 M16 36 L32 36",
    sketches: [
      { path: "M60 60 Q120 40 180 60 Q240 80 300 60", color: "#10b981", delay: 0.7 },
      { path: "M90 90 C130 70 170 110 210 90", color: "#f59e0b", delay: 1.2 }
    ],
    tools: ["TensorFlow", "React", "Tailwind", "VS Code API"],
    demoUrl: "/scribble-demo",
    story: "This tool simplifies the design-to-development handoff. Draw any UI component, and it generates the corresponding code. It's a game-changer for rapid prototyping.",
    role: "Co-Creator",
  },
  {
    title: "Mood-Based Design System",
    description: "Colors and fonts that change based on user's emotional state. Design that feels, not just looks! 🎨",
    status: "Research Mode",
    statusColor: "#e0e7ff",
    impacts: [
      "25% better engagement",
      "Personalized UX for all",
      "Accessibility champion"
    ],
    iconPath: "M32 8 C40 8 48 16 48 24 C48 32 32 48 32 48 C32 48 16 32 16 24 C16 16 24 8 32 8 Z M32 20 C36 20 40 24 40 28",
    sketches: [
      { path: "M70 70 Q140 30 210 70 Q280 110 350 70", color: "#ec4899", delay: 0.4 },
      { path: "M100 100 C140 80 180 120 220 100", color: "#14b8a6", delay: 0.9 }
    ],
    tools: ["Emotion AI", "CSS Variables", "React", "WebGL"],
    demoUrl: "/mood-demo",
    story: "An experimental project that explores dynamic design systems. The colors and fonts adapt based on the user's emotions, creating a unique and engaging experience.",
    role: "Researcher & Developer",
  }
];

// Interactive Skills Constellation
const skillsConstellation = [
  { name: "React Wizardry", level: 95, x: 100, y: 80, color: "#61dafb", projects: 25 },
  { name: "Design Thinking", level: 92, x: 200, y: 60, color: "#ff6b6b", projects: 30 },
  { name: "AI Integration", level: 85, x: 150, y: 120, color: "#4ecdc4", projects: 12 },
  { name: "User Psychology", level: 88, x: 80, y: 150, color: "#ffe66d", projects: 18 },
  { name: "Creative Coding", level: 90, x: 220, y: 140, color: "#a8e6cf", projects: 22 },
  { name: "Empathy Engine", level: 94, x: 160, y: 40, color: "#ff8b94", projects: 28 },
];

export default function Work() {
  const [activeProject, setActiveProject] = useState<any>(null); // For overlay

  // --- Main creative layout ---
  return (
    <main className="min-h-screen pt-16 notebook-bg overflow-x-hidden">
      {/* Animated scribble background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <ScribbleAnimation className="w-full h-full" />
      </div>

      {/* Who I Am Panel */}
      <motion.div
        className="relative z-10 flex flex-col items-center mb-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <SketchHeading level={1} className={`magnetic-drawing-heading text-4xl md:text-5xl mb-2 ${magneticFont}`}>
          <span>My Work</span>
        </SketchHeading>
        <div className="max-w-2xl bg-white/80 border-2 border-dashed rounded-xl p-6 shadow-xl mb-4">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <img src="/images/portfolio/sketch-portfolio.svg" alt="My Sketch" className="w-24 h-24 rounded-full border-2 border-gray-300 bg-gray-100" />
            <div>
              <div className={`handwritten text-lg mb-2 ${handwrittenFont}`}>Hi, I'm Arun 👋</div>
              <div className={`text-base text-gray-700 mb-1 ${handwrittenFont}`}>A creative technologist blending design, code, and AI to build playful, human-centered digital experiences.</div>
              <div className={`text-sm text-gray-500 ${handwrittenFont}`}>Scroll down to see the story behind each project and the skills I gained along the way!</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Celestial Skills Constellation */}
      <section className="relative z-10 flex flex-col items-center mb-12">
        <div className="mb-4">
          <span className={`text-2xl md:text-3xl ${handwrittenFont} text-blue-700`}>My Skills as a Constellation</span>
        </div>
        <ConstellationSkills />
      </section>

      {/* --- Projects: Draggable, animated, sketchy cards scattered on a desk --- */}
      <div className="relative z-10 min-h-[70vh] flex flex-wrap justify-center gap-10 pb-24">
        {creativeProjects.map((project, i) => (
          <div key={project.title}>
            <DraggableProjectCard 
              project={project}
              index={i}
              onClick={() => setActiveProject(project)} // On click, open overlay
            />
            {/* Show skills gained for this project below the card */}
            <motion.div
              className="mt-2 flex flex-wrap gap-2 justify-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.2 }}
            >
              {project.tools.map((tool: string) => (
                <span key={tool} className="px-2 py-1 bg-gray-100 border border-dashed border-gray-300 rounded-full text-xs handwritten">
                  {tool}
                </span>
              ))}
            </motion.div>
          </div>
        ))}
        {/* Playful desk doodles */}
        <motion.div
          className="absolute left-10 bottom-10 opacity-60 pointer-events-none"
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 1.2, type: 'spring' }}
        >
          <svg width="120" height="60"><path d="M10 50 Q60 10 110 50" stroke="#f59e0b" strokeWidth="3" fill="none"/></svg>
        </motion.div>
        <motion.div
          className="absolute right-16 top-24 opacity-40 pointer-events-none"
          initial={{ scale: 0, rotate: 10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 1.5, type: 'spring' }}
        >
          <svg width="80" height="40"><path d="M10 30 Q40 5 70 30" stroke="#8b5cf6" strokeWidth="2" fill="none"/></svg>
        </motion.div>
      </div>

      {/* Resume Download Section (moved to top right as sticky note) */}
      <div className="sticky-note fixed top-24 right-8 z-30 flex flex-col items-center shadow-xl" style={{width: '220px', transform: 'rotate(-2deg)'}}>
        <div className="sticky-tape w-16 h-5 bg-yellow-200 rounded-b-lg mb-[-10px] shadow-md" style={{marginTop: '-18px'}}></div>
        <a
          href="/resume.pdf"
          download
          className="handwritten text-lg px-6 py-4 bg-yellow-100 border-2 border-yellow-400 rounded-xl font-bold text-center no-underline hover:bg-yellow-200 focus:ring-2 focus:ring-yellow-400 transition-all w-full block"
          style={{boxShadow: '0 8px 24px 0 rgba(0,0,0,0.10)', minHeight: '90px'}}
        >
          📎 Download My Updated Resume
        </a>
      </div>

      {/* Project Overlay: Story, Role, Skills Gained */}
      <AnimatePresence>
        {activeProject && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative bg-white rounded-2xl border-4 border-dashed border-gray-400 p-8 max-w-lg w-full shadow-2xl"
              initial={{ scale: 0.8, y: 40, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.8, y: 40, opacity: 0 }}
              transition={{ type: 'spring', duration: 0.5 }}
            >
              <button
                className="absolute top-3 right-3 text-2xl text-gray-400 hover:text-gray-700"
                onClick={() => setActiveProject(null)}
                aria-label="Close"
              >×</button>
              <div className="flex flex-col items-center mb-4">
                <motion.svg 
                  className="w-16 h-16 mb-2"
                  viewBox="0 0 64 64"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1 }}
                >
                  <motion.path
                    d={activeProject.iconPath}
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ filter: 'url(#pencil-texture)' }}
                  />
                </motion.svg>
                <SketchHeading level={2} className="mb-2 text-xl">
                  {activeProject.title}
                </SketchHeading>
                <div className={`handwritten text-base text-gray-700 mb-2 text-center ${handwrittenFont}`}>
                  {activeProject.description}
                </div>
              </div>
              <div className="mb-4">
                <div className={`font-bold mb-1 ${handwrittenFont}`}>Project Story</div>
                <div className={`text-sm text-gray-600 mb-2 ${handwrittenFont}`}>{activeProject.story ?? 'A creative journey blending design, code, and experimentation.'}</div>
                <div className={`font-bold mb-1 ${handwrittenFont}`}>My Role</div>
                <div className={`text-sm text-gray-600 mb-2 ${handwrittenFont}`}>{activeProject.role ?? 'Lead Designer & Developer'}</div>
                <div className={`font-bold mb-1 mt-2 ${handwrittenFont}`}>Skills & Tools Used</div>
                <RadarChart data={activeProject.tools.map((tool: string, i: number) => ({ label: tool, value: 80 - i * 10, color: '#60a5fa' }))} />
                <div className={`font-bold mb-1 mt-4 ${handwrittenFont}`}>Project Impact</div>
                <div className="flex items-center gap-4 mt-2">
                  <DonutChart value={activeProject.impacts.length * 25} color="#34d399" />
                  <ul className={`text-xs text-gray-700 list-disc pl-4 ${handwrittenFont}`}>
                    {activeProject.impacts.map((impact: string) => (
                      <li key={impact} className={handwrittenFont}>{impact}</li>
                    ))}
                  </ul>
                </div>
                <div className={`mt-3 text-xs text-gray-500 ${handwrittenFont}`}>Every project helped me grow: from {activeProject.tools[0]} to {activeProject.tools[activeProject.tools.length-1]}.</div>
              </div>
              {activeProject.demoUrl && (
                <a
                  href={activeProject.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-2 px-4 py-2 bg-blue-100 border border-blue-300 rounded-full text-blue-700 font-semibold hover:bg-blue-200 transition"
                >
                  View Live Demo
                </a>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
