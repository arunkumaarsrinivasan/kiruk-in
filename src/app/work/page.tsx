'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useCallback } from 'react';
import { useShootingGame, WorkTarget } from './components/useShootingGame';
import { PixelTarget } from './components/PixelTarget';
import { SniperScope } from './components/SniperScope';
import { GameStats } from './components/GameStats';
import { LevelBackground } from './components/LevelBackground';
import { VisualShowcase } from './components/VisualShowcase';

// Shared handwritten font token
const handwrittenFont = 'handwritten';

const involvementEnhanced = [
  {
    title: 'Guest Lecturer & Workshop Conductor',
    description:
      'Delivered guest lectures and conducted workshops on UI/UX design for 60 students, sharing insights and practical knowledge and skill development in the field.',
    category: 'Education',
    icon: '👨‍🏫',
    color: '#3b82f6',
    impact: '60+ students trained'
  },
  {
    title: 'Tech Community Engagement',
    description:
      'Engaging in tech events and meetups across Bangalore during weekends, actively participating to stay updated with trends and connect with the tech community.',
    category: 'Community',
    icon: '🤝',
    color: '#8b5cf6',
    impact: 'Active community member'
  }
];

const workExperience = [
  {
    id: 'hp-design-engineer',
    title: 'Design Engineer',
    company: 'HP Inc.',
    location: 'Bengaluru',
    period: 'Aug 2023 - Present',
    duration: '2 yrs 5 mos',
    summary: 'Key contributor to HP Print AI’s launch of the industry’s first intelligent print experience.',
    projects: [
      {
        title: 'Print AI Workflows',
        role: 'Engineering',
        desc: 'Scalable email/webmail printing workflows using Spring Boot & Node.js.',
        tech: ['Spring Boot', 'Node.js', 'Java']
      },
      {
        title: 'Flutter Web UI',
        role: 'Mobile/UX',
        desc: 'Led end-to-end design & launch of mobile-first web UI, improving onboarding.',
        tech: ['Flutter', 'Dart', 'UX Design']
      },
      {
        title: 'Internal AI Stack',
        role: 'System Design',
        desc: 'Cohesive design system & branding for platform used by 500+ employees.',
        tech: ['Next.js', 'Figma', 'Branding']
      },
      {
        title: 'IoT Monitoring',
        role: 'DevOps',
        desc: 'Designed Splunk dashboards & managed 7+ cloud microservices.',
        tech: ['Splunk', 'Cloud', 'Microservices']
      }
    ],
    metrics: [
      { label: 'AI Stack Users', value: '500+' },
      { label: 'Accuracy Boost', value: '+35%' },
      { label: 'Microservices', value: '7+' }
    ],
    spotlight: {
      title: 'HP Print AI & AI Stack',
      summary: 'Industry’s first intelligent print experience & internal AI platform enabling text-to-image generation.',
      result: 'Improved onboarding',
      audience: 'Customers & Employees'
    },
    impactChart: { value: 90, color: '#22c55e', label: 'Innovation' },
    type: 'full-time',
    skills: ['Spring Boot', 'Node.js', 'TypeScript', 'Flutter', 'Next.js', 'Figma', 'Splunk', 'AI/ML'],
    skillsGained: ['Enterprise Architecture', 'Cross-functional Leadership', 'AI Integration', 'Design Systems'],
    chartData: [
      { label: 'Engineering', value: 85, color: '#22c55e' },
      { label: 'Design', value: 80, color: '#3b82f6' },
      { label: 'Product', value: 75, color: '#000000' }
    ]
  },
  {
    id: 'sns-product-designer',
    title: 'Product Designer',
    company: 'SNS Square',
    location: 'Remote',
    period: 'Nov 2023 - Aug 2024',
    duration: '10 mos',
    summary: 'Led end-to-end UX/UI design for Square bridge, a student recruitment platform.',
    projects: [
      {
        title: 'Square Bridge',
        role: 'UX Lead',
        desc: 'End-to-end platform design increasing engagement by 45%.',
        tech: ['UX Research', 'Prototyping']
      },
      {
        title: 'Design System',
        role: 'Architecture',
        desc: 'Unified system with 150+ UI screens for dashboards & portfolios.',
        tech: ['Figma', 'Components', 'UI']
      },
      {
        title: 'Team Leadership',
        role: 'Management',
        desc: 'Mentored 3+ designers ensuring 98% design-to-dev accuracy.',
        tech: ['Leadership', 'Handoff']
      }
    ],
    metrics: [
      { label: 'Engagement', value: '+45%' },
      { label: 'Screens', value: '150+' },
      { label: 'Handoff Acc.', value: '98%' }
    ],
    spotlight: {
      title: 'Square Bridge Platform',
      summary: 'Unified recruitment ecosystem connecting students and recruiters.',
      result: '40% faster discovery',
      audience: 'Recruiters & Students'
    },
    impactChart: { value: 92, color: '#8B5CF6', label: 'Design Impact' },
    type: 'freelance',
    skills: ['UX Research', 'UI Design', 'Figma', 'Design Systems', 'Team Management', 'Node.js', 'MongoDB'],
    skillsGained: ['Design Leadership', 'Team Management', 'User Research', 'Technical Handoff'],
    chartData: [
      { label: 'UX Research', value: 95, color: '#8B5CF6' },
      { label: 'UI Design', value: 93, color: '#EC4899' },
      { label: 'Leadership', value: 88, color: '#F59E0B' }
    ]
  },
  {
    id: 'peoplegamez-intern',
    title: 'Interaction Design Intern',
    company: 'PeopleGamez.com',
    location: 'Remote',
    period: 'Nov 2022 - Jan 2023',
    duration: '3 mos',
    summary: 'Designed gamified HR experiences and developed user flows.',
    projects: [
      {
        title: 'Gamified HR',
        role: 'Game Design',
        desc: 'Turned retention data into playful, trackable dashboards.',
        tech: ['Gamification', 'Dashboards']
      },
      {
        title: 'Game Assets',
        role: 'Visual Design',
        desc: 'Shipped 100+ game UI assets and mapped player journeys.',
        tech: ['UI Assets', 'User Flows']
      }
    ],
    metrics: [
      { label: 'Game Assets', value: '100+' },
      { label: 'Dashboards', value: 'Multiple' },
      { label: 'Prototyping', value: 'Rapid' }
    ],
    spotlight: {
      title: 'Gamified HR Tools',
      summary: 'Turning retention and performance data into playful, trackable dashboards.',
      result: 'Enhanced Engagement',
      audience: 'HR Teams'
    },
    impactChart: { value: 80, color: '#EC4899', label: 'Gamification' },
    type: 'internship',
    skills: ['Game Design', 'Interaction Design', 'User Flows', 'Prototyping', 'Figma'],
    skillsGained: ['Gamification', 'Rapid Prototyping', 'Asset Creation'],
    chartData: [
      { label: 'Game Design', value: 85, color: '#EC4899' },
      { label: 'Interaction', value: 83, color: '#8B5CF6' },
      { label: 'Prototyping', value: 80, color: '#10B981' }
    ]
  },
  {
    id: 'freelance-designer',
    title: 'Freelance Designer',
    company: 'Various Clients',
    location: 'Remote',
    period: '2020 - 2023',
    duration: '3 yrs',
    summary: 'Delivered branding, UI/UX, and creative design solutions.',
    projects: [
      {
        title: 'Brand Identity',
        role: 'Creative Dir.',
        desc: 'Branding & design solutions for studios and resorts.',
        tech: ['Branding', 'Identity']
      },
      {
        title: 'Cross-Platform',
        role: 'UI/UX',
        desc: 'End-to-end design for web, mobile, and print projects.',
        tech: ['Web', 'Mobile', 'Print']
      }
    ],
    metrics: [
      { label: 'Projects', value: 'Multiple' },
      { label: 'Clients', value: 'Diverse' },
      { label: 'Satisfaction', value: 'High' }
    ],
    spotlight: {
      title: 'Diverse Portfolio',
      summary: 'Branding, UI/UX, and creative design across web, mobile, and print.',
      result: 'Client Success',
      audience: 'Various Businesses'
    },
    impactChart: { value: 88, color: '#F59E0B', label: 'Versatility' },
    type: 'freelance',
    skills: ['Branding', 'UI/UX', 'Print Design', 'Web Design', 'Client Management'],
    skillsGained: ['Client Communication', 'Project Management', 'Versatile Design'],
    chartData: [
      { label: 'Branding', value: 90, color: '#F59E0B' },
      { label: 'UI/UX', value: 85, color: '#3b82f6' },
      { label: 'Print', value: 80, color: '#000000' }
    ]
  }
];

export default function Work() {
  const [showIntro, setShowIntro] = useState(true);
  const [selectedTarget, setSelectedTarget] = useState<WorkTarget | null>(null);
  const [revealIndex, setRevealIndex] = useState(0);

  const { gameState, startGame, togglePause } = useShootingGame({
    workExperiences: workExperience,
    onTargetHit: (target) => {
      // Progressive reveal - update target and reveal index
      setSelectedTarget(target);
      setRevealIndex(target.hitCount - 1); // Show current reveal based on hit count
    },
    onLevelComplete: () => {
      setSelectedTarget(null);
      setRevealIndex(0);
    },
    gameDuration: 300, // 5 minutes for all levels
  });

  const handleStartGame = useCallback(() => {
    setShowIntro(false);
    startGame();
  }, [startGame]);


  return (
    <main className="min-h-screen overflow-hidden" style={{ backgroundColor: "var(--bg-main)" }}>
      {/* Game Header */}
      <div className="fixed top-0 left-0 right-0 z-30 border-b-4 border-black p-3" style={{ backgroundColor: "var(--bg-card)" }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-mono" style={{ color: "var(--text-main)" }}>
              🎯 WORK EXPERIENCE ARCHERY
            </h1>
            {!showIntro && (
              <div className="flex items-center gap-2 font-mono text-sm">
                <span className="px-2 py-1 border-2 border-black" style={{ backgroundColor: "var(--bg-card)", color: "var(--accent-color)" }}>
                  LEVEL {gameState.currentLevel}
                </span>
              </div>
            )}
          </div>
          {!showIntro && (
            <div className="flex items-center gap-2">
              <button
                onClick={togglePause}
                className="px-3 py-1 font-mono text-sm border-2 border-black transition-colors hover:opacity-80"
                style={{ backgroundColor: "var(--bg-card)", color: "var(--text-main)" }}
              >
                {gameState.isPaused ? "▶ RESUME" : "⏸ PAUSE"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Intro Screen */}
      <AnimatePresence>
        {showIntro && (
          <motion.div
            className="fixed inset-0 z-20 flex items-center justify-center"
            style={{ backgroundColor: "var(--bg-main)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Grid background */}
            <div
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage: `
                  linear-gradient(var(--border-color) 1px, transparent 1px),
                  linear-gradient(90deg, var(--border-color) 1px, transparent 1px)
                `,
                backgroundSize: "20px 20px",
              }}
            />

            <div className="text-center max-w-2xl px-4 relative z-10">
              <motion.h1
                className="text-4xl md:text-6xl font-mono mb-4"
                style={{ color: "var(--text-main)" }}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                🎯 WORK EXPERIENCE ARCHERY
              </motion.h1>

              <motion.p
                className="text-lg font-mono mb-8"
                style={{ color: "var(--text-muted)" }}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                Shoot targets to discover my professional journey!
                <br />
                Each target represents a company I&apos;ve worked with.
                <br />
                <span style={{ color: "var(--accent-color)" }}>Aim and shoot</span> to learn about my experience.
              </motion.p>

              <motion.div
                className="flex flex-col items-center gap-4"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <button
                  onClick={handleStartGame}
                  className="px-8 py-4 font-mono text-2xl border-4 border-black transition-all hover:opacity-80 shadow-[4px_4px_0_#000]"
                  style={{
                    backgroundColor: "var(--bg-card)",
                    color: "var(--accent-color)",
                  }}
                >
                  ▶ START GAME
                </button>

                <div className="text-sm font-mono" style={{ color: "var(--text-muted)" }}>
                  Move mouse to aim | Click/Hold to charge | Release to shoot
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Area */}
      {!showIntro && gameState.targets.length > 0 && (
        <LevelBackground
          company={`Level ${gameState.currentLevel}`}
          location={`${gameState.targets.length} Targets`}
          level={gameState.currentLevel}
        >
          <div 
            className="fixed inset-0 pt-16" 
            style={{ 
              backgroundColor: "var(--bg-main)",
              cursor: "none" // Hide default cursor
            }}
          >
            {/* Targets - Multiple squares per level */}
            {gameState.targets.map((target) => (
              <PixelTarget key={target.id} target={target} />
            ))}

            {/* Sniper Scope with sway */}
            <SniperScope
              x={gameState.crosshairX}
              y={gameState.crosshairY}
              power={gameState.power}
              isCharging={gameState.isCharging}
              isAiming={gameState.isAiming}
            />
            
            {/* Bullet trails */}
            {gameState.bullets.map((bullet) => (
              <motion.div
                key={bullet.id}
                className="absolute pointer-events-none"
                style={{
                  left: `${bullet.x}%`,
                  top: `${bullet.y}%`,
                  transform: "translate(-50%, -50%)",
                  width: 4,
                  height: 4,
                  backgroundColor: "var(--text-main)",
                  borderRadius: "50%",
                  opacity: bullet.life / 0.3,
                }}
                animate={{
                  scale: [1, 0.5, 0],
                  opacity: [1, 0.5, 0],
                }}
                transition={{ duration: bullet.life }}
              />
            ))}

            {/* Game Stats */}
            <GameStats gameState={gameState} />

            {/* Visual Showcase - Visual representations instead of text */}
            {selectedTarget && selectedTarget.hitCount > 0 && (
              <VisualShowcase 
                target={selectedTarget} 
                revealIndex={revealIndex}
                level={gameState.currentLevel} 
              />
            )}

            {/* Level Complete Message */}
            {gameState.isLevelComplete && (
              <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="text-center border-4 border-black bg-white p-8 shadow-[8px_8px_0_#000]">
                  <h2 className="font-mono text-4xl font-bold text-black mb-4">
                    🎯 LEVEL {gameState.currentLevel} COMPLETE!
                  </h2>
                  <p className="font-mono text-lg text-gray-600 mb-4">
                    {gameState.currentLevel < gameState.maxLevel 
                      ? "Loading next level..." 
                      : "All levels completed! 🎉"}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Pause Overlay */}
            <AnimatePresence>
              {gameState.isPaused && (
                <motion.div
                  className="absolute inset-0 z-40 flex items-center justify-center"
                  style={{ backgroundColor: "rgba(0,0,0,0.9)" }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="text-center border-4 border-black bg-white p-8 shadow-[8px_8px_0_#000]">
                    <h2 className="text-4xl font-mono mb-4 text-black">
                      ⏸ PAUSED
                    </h2>
                    <button
                      onClick={togglePause}
                      className="px-6 py-3 font-mono text-xl border-4 border-black bg-green-500 text-white hover:bg-green-600 transition-colors"
                    >
                      ▶ RESUME
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Game Over Overlay */}
            <AnimatePresence>
              {gameState.isGameOver && (
                <motion.div
                  className="absolute inset-0 z-40 flex items-center justify-center"
                  style={{ backgroundColor: "rgba(0,0,0,0.9)" }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="text-center border-4 border-black bg-white p-8 shadow-[8px_8px_0_#000] max-w-lg">
                    <motion.h2
                      className="text-6xl font-mono mb-4 text-black"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                    >
                      🎉 GAME OVER
                    </motion.h2>
                    <p className="font-mono text-xl mb-2 text-black">
                      Final Score: {gameState.score.toLocaleString()}
                    </p>
                    <p className="font-mono text-sm mb-6 text-gray-600">
                      Accuracy: {gameState.accuracy.toFixed(1)}% | Hits: {gameState.hits}/{gameState.shots} | Levels: {gameState.currentLevel - 1}/{gameState.maxLevel}
                    </p>
                    <div className="flex gap-4 justify-center">
                      <button
                        onClick={() => {
                          setShowIntro(true);
                          setSelectedTarget(null);
                          setRevealIndex(0);
                        }}
                        className="px-6 py-3 font-mono text-xl border-4 border-black bg-yellow-400 text-black hover:bg-yellow-500 transition-colors"
                      >
                        🔄 MENU
                      </button>
                      <button
                        onClick={() => {
                          setSelectedTarget(null);
                          setRevealIndex(0);
                          startGame();
                        }}
                        className="px-6 py-3 font-mono text-xl border-4 border-black bg-green-500 text-white hover:bg-green-600 transition-colors"
                      >
                        ▶ PLAY AGAIN
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </LevelBackground>
      )}

    </main>
  );
}
