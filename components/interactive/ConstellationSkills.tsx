import React, { useState } from "react";

// Example skills data (replace with your real data)
const skills = [
  { name: "React", x: 120, y: 60, level: 5, projects: 8 },
  { name: "TypeScript", x: 200, y: 140, level: 4, projects: 6 },
  { name: "Figma", x: 60, y: 180, level: 4, projects: 5 },
  { name: "Node.js", x: 180, y: 220, level: 3, projects: 4 },
  { name: "AI/ML", x: 260, y: 100, level: 4, projects: 5 },
  { name: "UX Design", x: 40, y: 100, level: 5, projects: 7 },
  { name: "D3.js", x: 140, y: 250, level: 3, projects: 3 },
  { name: "Framer Motion", x: 250, y: 200, level: 2, projects: 2 },
  { name: "Storytelling", x: 20, y: 40, level: 5, projects: 9 },
];

const connections = [
  [0, 1], [0, 2], [1, 4], [2, 5], [3, 6], [4, 7], [5, 8], [1, 3], [2, 3], [6, 7], [7, 8]
];

const handwrittenFont = "font-left-hand";

export const ConstellationSkills: React.FC = () => {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="relative w-[480px] h-[420px] md:w-[600px] md:h-[520px] mx-auto">
      <svg width="100%" height="100%" viewBox="0 0 480 420" className="absolute left-0 top-0 z-0">
        {/* Draw lines */}
        {connections.map(([from, to], i) => {
          const a = skills[from], b = skills[to];
          return (
            <line
              key={`line-${skills[from].name}-${skills[to].name}`}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke="#b6d0ff"
              strokeWidth={2}
              strokeDasharray="4 3"
              opacity={0.7}
            />
          );
        })}
        {/* Draw stars */}
        {skills.map((skill, i) => (
          <g key={skill.name}>
            <circle
              cx={skill.x}
              cy={skill.y}
              r={hovered === i ? 16 : 12}
              fill="#fff"
              stroke="#3b82f6"
              strokeWidth={hovered === i ? 4 : 2}
              filter={hovered === i ? "url(#glow)" : ""}
              style={{ transition: "all 0.2s" }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            />
            <text
              x={skill.x + 20}
              y={skill.y + 6}
              className={handwrittenFont}
              fontSize={hovered === i ? 22 : 18}
              fill="#1e293b"
              style={{ pointerEvents: "none", fontFamily: 'Left Hand, cursive' }}
            >
              {skill.name}
            </text>
            {/* Tooltip */}
            {hovered === i && (
              <foreignObject x={Math.max(10, Math.min(skill.x - 40, 360))} y={Math.max(10, skill.y - 60)} width="140" height="60">
                <div className="bg-white/90 border border-blue-300 rounded-lg px-3 py-2 shadow-lg handwritten text-xs text-blue-900" style={{fontFamily: 'Left Hand, cursive'}}>
                  <div><b>{skill.name}</b></div>
                  <div>Level: {"\u2605".repeat(skill.level)}</div>
                  <div>Projects: {skill.projects}</div>
                </div>
              </foreignObject>
            )}
          </g>
        ))}
        {/* SVG filter for glow */}
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
      </svg>
    </div>
  );
};

export default ConstellationSkills;
