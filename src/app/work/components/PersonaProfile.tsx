"use client";

import { useState } from "react";
import { WorkTarget } from "./useShootingGame";

interface PersonaProfileProps {
  target: WorkTarget | null;
  hitCount: number;
}

// Persona data for each role
const personaData: Record<string, {
  characteristics: string[];
  pros: string[];
  cons: string[];
  avatar: string; // Emoji or icon
}> = {
  'hp-design-engineer': {
    characteristics: [
      'Tech-Design Hybrid',
      'Enterprise Focus',
      'AI Integration Expert',
      'Cross-functional Leader',
      'System Thinker'
    ],
    pros: [
      'Strong engineering + design balance',
      'Enterprise architecture experience',
      'AI/ML integration skills',
      'Scalable system design'
    ],
    cons: [
      'Can be too technical for pure design roles',
      'Less focus on visual aesthetics',
      'Enterprise constraints'
    ],
    avatar: '👨‍💻'
  },
  'sns-product-designer': {
    characteristics: [
      'UX Research Driven',
      'Design System Architect',
      'Team Leader',
      'User-Centric',
      'Prototyping Expert'
    ],
    pros: [
      'Strong UX research foundation',
      'Design system expertise',
      'Team management skills',
      'High design-to-dev accuracy'
    ],
    cons: [
      'Less hands-on coding',
      'Platform-specific experience',
      'Remote team challenges'
    ],
    avatar: '🎨'
  },
  'peoplegamez-intern': {
    characteristics: [
      'Gamification Specialist',
      'Rapid Prototyper',
      'Asset Creator',
      'Interaction Designer',
      'Data Visualizer'
    ],
    pros: [
      'Unique gamification expertise',
      'Fast prototyping',
      'Creative problem solving',
      'User engagement focus'
    ],
    cons: [
      'Limited enterprise experience',
      'Short-term projects',
      'Less strategic depth'
    ],
    avatar: '🎮'
  },
  'freelance-designer': {
    characteristics: [
      'Versatile Designer',
      'Client-Focused',
      'Multi-platform Expert',
      'Brand Strategist',
      'Independent Worker'
    ],
    pros: [
      'Diverse portfolio',
      'Client communication',
      'Versatile skill set',
      'Self-managed'
    ],
    cons: [
      'Less team collaboration',
      'Inconsistent workflow',
      'Limited enterprise exposure'
    ],
    avatar: '🖌️'
  }
};

// Gamified Skill Bars Component
function GamifiedSkillBars({ skills, chartData }: { skills: string[]; chartData?: Array<{ label: string; value: number; color: string }> }) {
  // Use chartData if available, otherwise create from skills
  const skillData = chartData || skills.map((skill, idx) => ({
    label: skill,
    value: 70 + (idx * 5), // Default values
    color: '#000000'
  }));
  
  return (
      <div className="relative border border-[var(--border-color)] bg-[var(--bg-card)] p-2" style={{ imageRendering: "pixelated" as any }}>
        <div className="font-mono text-[10px] uppercase mb-2 text-center text-[var(--text-muted)] border-b border-[var(--border-color)] pb-1">
          Skill Stats
        </div>
      <div className="space-y-2">
        {skillData.map((skill, idx) => (
          <div
            key={idx}
            className="space-y-1"
          >
            <div className="flex items-center justify-between mb-0.5">
              <span className="font-mono text-[9px] font-bold text-[var(--text-main)] uppercase">
                {skill.label}
              </span>
              <span className="font-mono text-[9px] font-bold text-[var(--text-main)]">
                {skill.value}%
              </span>
            </div>
            {/* Pixelated progress bar */}
            <div className="h-3 border border-[var(--border-color)] bg-[var(--bg-main)] relative overflow-hidden" style={{ imageRendering: "pixelated" as any }}>
              <div
                className="h-full border-r border-[var(--border-color)]"
                style={{
                  backgroundColor: skill.color || "var(--accent-color)",
                  width: `${skill.value}%`,
                }}
              />
              {/* Pixelated fill pattern */}
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: `repeating-linear-gradient(
                    45deg,
                    transparent,
                    transparent 2px,
                    rgba(0,0,0,0.1) 2px,
                    rgba(0,0,0,0.1) 4px
                  )`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Detailed Skills Grid Component
function DetailedSkillsGrid({ skills }: { skills: string[] }) {
  return (
    <div 
      className="p-2 wireframe-border" 
      style={{ 
        imageRendering: "pixelated" as any,
        borderWidth: "var(--border-width)",
        borderColor: "var(--border-color)",
        backgroundColor: "var(--bg-main)",
      }}
    >
      <div 
        className="font-mono text-[10px] uppercase mb-2 text-center pb-1"
        style={{
          color: "var(--text-muted)",
          borderBottomWidth: "var(--border-width)",
          borderColor: "var(--border-color)",
        }}
      >
        Tech Stack
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {skills.map((skill, idx) => (
          <div
            key={idx}
            className="px-2 py-1 text-center wireframe-border"
            style={{
              borderWidth: "var(--border-width)",
              borderColor: "var(--border-color)",
              backgroundColor: "var(--bg-card)",
            }}
          >
            <span className="font-mono text-[9px]" style={{ color: "var(--text-main)" }}>{skill}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PersonaProfile({ target, hitCount }: PersonaProfileProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!target || hitCount === 0) return null;
  
  const work = target.workExperience;
  const persona = personaData[work.id] || personaData['freelance-designer'];
  
  // Show content progressively based on hit count
  const showAvatar = hitCount >= 1;
  const showCharacteristics = hitCount >= 2;
  const showRadar = hitCount >= 3;
  const showPros = hitCount >= 4;
  const showCons = hitCount >= 5;
  
  return (
    <div
      className="fixed grid-right-1 grid-bottom-1 z-40 border border-[var(--border-color)] bg-[var(--bg-card)]"
      style={{
        imageRendering: "pixelated" as any,
        maxWidth: isExpanded ? "400px" : "200px", // 20 * 20px or 10 * 20px
        width: isExpanded ? "400px" : "200px",    // 20 * 20px or 10 * 20px
        backgroundColor: "var(--bg-card)",
      }}
    >
      {/* Grid background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(var(--border-color) 1px, transparent 1px),
            linear-gradient(90deg, var(--border-color) 1px, transparent 1px)
          `,
          backgroundSize: "20px 20px",
        }}
      />
      {/* Compact Header - Always Visible */}
      <div 
        className="relative grid-p-1 border-b border-[var(--border-color)] cursor-pointer hover:bg-[var(--bg-main)]/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          {showAvatar && (
            <div className="border border-[var(--border-color)] bg-[var(--bg-main)] p-1" style={{ imageRendering: "pixelated" as any }}>
              <span className="text-2xl">{persona.avatar}</span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-mono text-sm font-bold text-[var(--text-main)] truncate">
              {work.company}
            </h3>
            <p className="font-mono text-[10px] text-[var(--text-muted)] truncate">
              {work.title}
            </p>
          </div>
          <div className="font-mono text-xs text-[var(--text-muted)]">
            {isExpanded ? "▲" : "▼"}
          </div>
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="font-mono text-[9px] text-[var(--text-muted)]">
            {hitCount}/5
          </div>
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 border border-[var(--border-color)]"
                style={{
                  backgroundColor: i <= hitCount ? "var(--accent-color)" : "transparent",
                }}
              />
            ))}
          </div>
        </div>
      </div>
      
      {/* Expandable Content */}
      {isExpanded && (
        <div className="overflow-hidden">
            <div className="p-3 space-y-3 max-h-[60vh] overflow-y-auto">
              {/* Basic Info */}
              <div className="relative border border-[var(--border-color)] bg-[var(--bg-main)]/30 p-2">
                <p className="font-mono text-[10px] text-[var(--text-muted)] mb-1">
                  {work.period} · {work.location}
                </p>
                <p className="font-mono text-[9px] text-[var(--text-muted)]">
                  {work.summary}
                </p>
              </div>
              
              {/* Characteristics */}
              {showCharacteristics && (
                <div
                  className="relative border border-[var(--border-color)] bg-[var(--bg-main)]/30 p-2"
                  style={{ imageRendering: "pixelated" as any }}
                >
                  <h3 className="font-mono text-[10px] font-bold text-[var(--text-main)] uppercase mb-2">
                    Traits
                  </h3>
                  <div className="grid grid-cols-2 gap-1.5">
                    {persona.characteristics.map((char, idx) => (
                      <div
                        key={idx}
                        className="border border-[var(--border-color)] bg-[var(--bg-card)] px-2 py-1.5 font-mono text-[9px] text-center text-[var(--text-main)]"
                      >
                        {char}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Gamified Skill Stats */}
              {showRadar && (
                <GamifiedSkillBars 
                  skills={work.skills || []} 
                  chartData={work.chartData}
                />
              )}
              
              {/* Detailed Tech Stack */}
              {work.skills && work.skills.length > 0 && (
                <DetailedSkillsGrid skills={work.skills} />
              )}
              
              {/* Pros & Cons Side by Side */}
              {(showPros || showCons) && (
                <div className="grid grid-cols-2 gap-2">
                  {showPros && (
                    <div
                      className="relative border border-[var(--border-color)] bg-[var(--bg-main)]/30 p-2"
                      style={{ imageRendering: "pixelated" as any }}
                    >
                      <h3 className="font-mono text-[10px] font-bold text-[var(--text-main)] uppercase mb-2 border-b border-[var(--border-color)] pb-1">
                        Strengths
                      </h3>
                      <ul className="space-y-1.5">
                        {persona.pros.map((pro, idx) => (
                          <li
                            key={idx}
                            className="font-mono text-[9px] text-[var(--text-main)] flex items-start gap-1"
                          >
                            <span className="text-[var(--accent-color)] font-bold">+</span>
                            <span>{pro}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {showCons && (
                    <div
                      className="relative border border-[var(--border-color)] bg-[var(--bg-main)]/30 p-2"
                      style={{ imageRendering: "pixelated" as any }}
                    >
                      <h3 className="font-mono text-[10px] font-bold text-[var(--text-main)] uppercase mb-2 border-b border-[var(--border-color)] pb-1">
                        Weaknesses
                      </h3>
                      <ul className="space-y-1.5">
                        {persona.cons.map((con, idx) => (
                          <li
                            key={idx}
                            className="font-mono text-[9px] text-[var(--text-muted)] flex items-start gap-1"
                          >
                            <span className="text-[var(--text-muted)] font-bold">-</span>
                            <span>{con}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
              
              {/* Achievements */}
              {work.metrics && (
                <div
                  className="relative border border-[var(--border-color)] bg-[var(--bg-main)]/30 p-2"
                  style={{ imageRendering: "pixelated" as any }}
                >
                  <h3 className="font-mono text-[10px] font-bold text-[var(--text-main)] uppercase mb-2">
                    Achievements
                  </h3>
                  <div className="grid grid-cols-3 gap-1.5">
                    {work.metrics.map((metric: any, idx: number) => (
                      <div
                        key={idx}
                        className="border border-[var(--border-color)] bg-[var(--bg-card)] p-2 text-center"
                      >
                        <div className="font-mono text-base font-bold text-[var(--text-main)] mb-0.5">
                          {metric.value}
                        </div>
                        <div className="font-mono text-[8px] text-[var(--text-muted)] uppercase leading-tight">
                          {metric.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Skills Gained */}
              {work.skillsGained && work.skillsGained.length > 0 && (
                <div
                  className="relative border border-[var(--border-color)] bg-[var(--bg-main)]/30 p-2"
                >
                  <h3 className="font-mono text-[10px] font-bold text-[var(--text-main)] uppercase mb-1.5">
                    Skills Gained
                  </h3>
                  <div className="flex flex-wrap gap-1">
                    {work.skillsGained.map((skill: string, idx: number) => (
                      <span
                        key={idx}
                        className="border border-[var(--border-color)] bg-[var(--bg-card)] px-1.5 py-0.5 font-mono text-[8px] text-[var(--text-main)]"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
        </div>
      )}
    </div>
  );
}
