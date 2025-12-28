'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PixelIcon } from '@/components/ui/PixelIcon';
import { useGameMode } from '@/contexts/GameModeContext';
import { useDesignEra } from '@/contexts/DesignEraContext';
import { PAGE_GAMES } from '@/data/game-navigation-data';
import { GridBackground } from '@/components/ui/GridBackground';
import { useResponsiveGrid } from '@/hooks/useResponsiveGrid';
import Link from 'next/link';

// Investigation sections data
const INVESTIGATION_SECTIONS = [
  {
    id: 'about',
    path: '/about',
    title: 'CASE FILE: ORIGIN',
    code: 'CF-001',
    icon: 'user',
    color: '#4ECDC4',
    description: 'Subject\'s background, timeline, and origin story. Trace the journey from student to creative technologist.',
    cluesFound: ['Biography', 'Timeline', 'Education', 'Career Path'],
    difficulty: 'EASY',
    estimatedTime: '5-10 min'
  },
  {
    id: 'work',
    path: '/work',
    title: 'EVIDENCE LOCKER',
    code: 'EL-002',
    icon: 'grid',
    color: '#FF6B6B',
    description: 'Collection of project artifacts and work samples. Examine each piece to understand capabilities.',
    cluesFound: ['Projects', 'Designs', 'Applications', 'Experiments'],
    difficulty: 'MEDIUM',
    estimatedTime: '10-15 min'
  },
  {
    id: 'case-studies',
    path: '/case-studies',
    title: 'DEEP INVESTIGATION',
    code: 'DI-003',
    icon: 'folder',
    color: '#9B59B6',
    description: 'Detailed case studies with full process documentation. Uncover the methodology behind each project.',
    cluesFound: ['Process', 'Challenges', 'Solutions', 'Outcomes'],
    difficulty: 'HARD',
    estimatedTime: '15-20 min'
  },
  {
    id: 'arcade',
    path: '/arcade',
    title: 'TRAINING GROUND',
    code: 'TG-004',
    icon: 'globe',
    color: '#1ABC9C',
    description: 'Interactive mini-games and experiments. Test your detective skills while learning about the subject.',
    cluesFound: ['Games', 'Interactions', 'Easter Eggs', 'Achievements'],
    difficulty: 'FUN',
    estimatedTime: '5-∞ min'
  },
  {
    id: 'contact',
    path: '/contact',
    title: 'FINAL TRANSMISSION',
    code: 'FT-005',
    icon: 'envelope',
    color: '#E74C3C',
    description: 'Secure communication channel. Complete the investigation by making contact with the subject.',
    cluesFound: ['Email', 'Social Links', 'Resume', 'Message Form'],
    difficulty: 'FINAL',
    estimatedTime: '3-5 min'
  },
];

export default function NewspaperLayout() {
  const { mode, progress } = useGameMode();
  const { currentEra } = useDesignEra();
  const gridAlignment = useResponsiveGrid();
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);
  const [isStampAnimating, setIsStampAnimating] = useState(false);

  // Animate stamp on mount
  useEffect(() => {
    const timer = setTimeout(() => setIsStampAnimating(true), 500);
    return () => clearTimeout(timer);
  }, []);

  // Calculate investigation progress
  const investigationProgress = useMemo(() => {
    let totalLevels = 0;
    let completedLevels = 0;
    
    PAGE_GAMES.forEach(game => {
      totalLevels += game.levels.length;
      completedLevels += (progress.completedLevels[game.id] || []).length;
    });
    
    return Math.round((completedLevels / totalLevels) * 100);
  }, [progress.completedLevels]);

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div 
      className="min-h-screen bg-[var(--bg-main)] relative"
      style={{
        paddingLeft: `${gridAlignment.containerPaddingX}px`,
        paddingRight: `${gridAlignment.containerPaddingX}px`,
        paddingTop: `${gridAlignment.containerPaddingY}px`,
        paddingBottom: `${gridAlignment.containerPaddingY}px`,
      }}
    >
      {/* Grid Background */}
      <GridBackground 
        opacity={0.15} 
        scanlinesOpacity={0.03}
        offsetX={0}
        offsetY={0}
      />

      {/* Content Container */}
      <div 
        className="mx-auto relative z-10"
        style={{
          maxWidth: `${gridAlignment.maxContentWidth}px`,
        }}
      >
        {/* === DOCUMENT HEADER === */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="grid-mb-3 relative"
        >
          {/* Top Bar - Classification */}
          <div 
            className="flex items-center justify-between grid-p-1 border-2"
            style={{ 
              backgroundColor: 'var(--text-main)',
              borderColor: 'var(--border-color)'
            }}
          >
            <div className="flex items-center gap-2">
              <PixelIcon name="lock" size={16} className="text-[var(--bg-main)]" />
              <span 
                className="text-xs font-mono font-bold uppercase tracking-widest"
                style={{ color: 'var(--bg-main)' }}
              >
                CLASSIFIED DOCUMENT
              </span>
            </div>
            <span 
              className="text-xs font-mono"
              style={{ color: 'var(--bg-main)', opacity: 0.7 }}
            >
              REF: KIRUK-{today.getFullYear()}-001
            </span>
          </div>

          {/* Main Header */}
          <div 
            className="grid-p-3 border-2 border-t-0 relative overflow-hidden"
            style={{ 
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-color)'
            }}
          >
            {/* Paper texture overlay */}
            <div 
              className="absolute inset-0 opacity-5 pointer-events-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                backgroundSize: '150px 150px'
              }} 
            />

            {/* Confidential Stamp */}
            <AnimatePresence>
              {isStampAnimating && (
                <motion.div
                  initial={{ scale: 2, opacity: 0, rotate: -15 }}
                  animate={{ scale: 1, opacity: 0.15, rotate: -12 }}
                  transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                  className="absolute top-8 right-8 pointer-events-none hidden md:block"
                >
                  <div 
                    className="border-4 px-6 py-2 font-mono font-black text-2xl uppercase tracking-widest"
                    style={{ 
                      borderColor: '#DC2626',
                      color: '#DC2626',
                      transform: 'rotate(-12deg)'
                    }}
                  >
                    CONFIDENTIAL
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Document Title */}
            <div className="text-center grid-mb-2">
              <div 
                className="text-xs font-mono uppercase tracking-[0.3em] grid-mb-1"
                style={{ color: 'var(--text-muted)' }}
              >
                INVESTIGATION BRIEFING DOCUMENT
              </div>
              <h1 
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-mono font-black uppercase tracking-wide leading-tight"
                style={{ 
                  color: 'var(--text-main)',
                  fontFamily: currentEra.fonts.primary || 'monospace'
                }}
              >
                SUBJECT: <span style={{ color: 'var(--accent-color)' }}>KIRUK</span>
              </h1>
              <div 
                className="text-sm font-mono uppercase tracking-wider grid-mt-1"
                style={{ color: 'var(--text-muted)' }}
              >
                Identity Investigation File
              </div>
            </div>

            {/* Date & Classification */}
            <div className="flex flex-wrap justify-center items-center gap-4 text-xs font-mono uppercase">
              <span style={{ color: 'var(--text-muted)' }}>
                Date: {dateStr}
              </span>
              <span style={{ color: 'var(--accent-color)' }}>•</span>
              <span style={{ color: 'var(--text-muted)' }}>
                Status: {investigationProgress === 100 ? 'SOLVED' : 'OPEN'}
              </span>
              <span style={{ color: 'var(--accent-color)' }}>•</span>
              <span style={{ color: 'var(--text-muted)' }}>
                Progress: {investigationProgress}%
              </span>
            </div>
          </div>
        </motion.header>

        {/* === SUBJECT PROFILE BRIEF === */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid-mb-3"
        >
          <div 
            className="border-2 overflow-hidden"
            style={{ borderColor: 'var(--border-color)' }}
          >
            {/* Section Header */}
            <div 
              className="grid-p-1 flex items-center gap-2"
              style={{ backgroundColor: 'var(--accent-color)' }}
            >
              <PixelIcon name="user" size={20} className="text-[var(--bg-main)]" />
              <h2 
                className="text-sm font-mono font-bold uppercase tracking-wider"
                style={{ color: 'var(--bg-main)' }}
              >
                Subject Profile
              </h2>
            </div>

            {/* Profile Content */}
            <div 
              className="grid-p-2 grid grid-cols-1 md:grid-cols-3 grid-gap-2"
              style={{ backgroundColor: 'var(--bg-card)' }}
            >
              {/* Photo & Identity */}
              <div className="flex flex-col items-center text-center">
                <motion.div 
                  className="border-2 aspect-square w-32 h-32 flex items-center justify-center relative overflow-hidden group cursor-pointer grid-mb-1"
                  style={{
                    borderColor: 'var(--border-color)',
                    backgroundColor: 'var(--bg-main)'
                  }}
                  whileHover={{ scale: 1.02 }}
                >
                  <motion.img
                    src="/images/dp-8bit.jpg"
                    alt="Subject Photo"
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ imageRendering: 'pixelated' }}
                    initial={{ opacity: 1 }}
                    whileHover={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                  <motion.img
                    src="/images/dp.jpeg"
                    alt="Subject Photo Real"
                    className="absolute inset-0 w-full h-full object-cover"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.div>
                <div 
                  className="text-xs font-mono uppercase px-2 py-1 inline-block"
                  style={{ 
                    backgroundColor: 'var(--text-main)',
                    color: 'var(--bg-main)'
                  }}
                >
                  Subject Photo
                </div>
              </div>

              {/* Quick Facts */}
              <div className="md:col-span-2 grid-space-y-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <div 
                      className="text-[10px] font-mono uppercase tracking-wider"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      Full Name
                    </div>
                    <div 
                      className="text-lg font-mono font-bold"
                      style={{ color: 'var(--text-main)' }}
                    >
                      ARUN KUMAAR SREENIVASAN
                    </div>
                  </div>
                  <div>
                    <div 
                      className="text-[10px] font-mono uppercase tracking-wider"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      Alias
                    </div>
                    <div 
                      className="text-lg font-mono font-bold"
                      style={{ color: 'var(--accent-color)' }}
                    >
                      "KIRUK"
                    </div>
                  </div>
                  <div>
                    <div 
                      className="text-[10px] font-mono uppercase tracking-wider"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      Location
                    </div>
                    <div 
                      className="text-sm font-mono"
                      style={{ color: 'var(--text-main)' }}
                    >
                      📍 Bangalore, India
                    </div>
                  </div>
                  <div>
                    <div 
                      className="text-[10px] font-mono uppercase tracking-wider"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      Status
                    </div>
                    <div 
                      className="text-sm font-mono font-bold"
                      style={{ color: '#10B981' }}
                    >
                      🟢 AVAILABLE FOR HIRE
                    </div>
                  </div>
                </div>

                <div 
                  className="border-t pt-3 mt-3"
                  style={{ borderColor: 'var(--border-color)' }}
                >
                  <div 
                    className="text-[10px] font-mono uppercase tracking-wider grid-mb-1"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    Subject Description
                  </div>
                  <p 
                    className="text-sm font-mono leading-relaxed"
                    style={{ color: 'var(--text-main)' }}
                  >
                    Creative technologist who bridges <strong>design and development</strong>. 
                    Specializes in UX/UI design, full-stack development, and AI experience (AX) design. 
                    Known for transforming ideas from initial sketches to production-ready applications.
                    Helps teams go from <strong>0 → 1</strong> in product development.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* === YOUR MISSION === */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid-mb-3"
        >
          <div 
            className="border-2 overflow-hidden"
            style={{ borderColor: 'var(--border-color)' }}
          >
            {/* Section Header */}
            <div 
              className="grid-p-1 flex items-center gap-2"
              style={{ backgroundColor: '#DC2626' }}
            >
              <PixelIcon name="flag-checkered" size={20} className="text-white" />
              <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-white">
                Your Mission
              </h2>
            </div>

            {/* Mission Content */}
            <div 
              className="grid-p-2"
              style={{ backgroundColor: 'var(--bg-card)' }}
            >
              <div 
                className="text-lg font-mono font-bold grid-mb-1 text-center"
                style={{ color: 'var(--text-main)' }}
              >
                🕵️ ROLEPLAY: You are an Investigation Officer
              </div>
              
              <p 
                className="text-sm font-mono text-center leading-relaxed grid-mb-2"
                style={{ color: 'var(--text-main)' }}
              >
                Your objective is to investigate this portfolio and uncover everything about the subject.
                Navigate through each section, complete challenges, and piece together the full picture.
              </p>

              {/* Instructions Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 grid-gap-1">
                <div 
                  className="border-2 grid-p-1 text-center"
                  style={{ 
                    borderColor: 'var(--border-color)',
                    backgroundColor: 'var(--bg-main)'
                  }}
                >
                  <div className="text-2xl grid-mb-1">📂</div>
                  <div 
                    className="text-xs font-mono font-bold uppercase grid-mb-1"
                    style={{ color: 'var(--accent-color)' }}
                  >
                    Step 1: Explore
                  </div>
                  <p 
                    className="text-xs font-mono"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    Navigate to each section below to gather evidence and clues about the subject.
                  </p>
                </div>

                <div 
                  className="border-2 grid-p-1 text-center"
                  style={{ 
                    borderColor: 'var(--border-color)',
                    backgroundColor: 'var(--bg-main)'
                  }}
                >
                  <div className="text-2xl grid-mb-1">🎮</div>
                  <div 
                    className="text-xs font-mono font-bold uppercase grid-mb-1"
                    style={{ color: 'var(--accent-color)' }}
                  >
                    Step 2: Play Games
                  </div>
                  <p 
                    className="text-xs font-mono"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    Click the ▶ PLAY button (bottom-left) on any page to unlock mini-games and earn XP.
                  </p>
                </div>

                <div 
                  className="border-2 grid-p-1 text-center"
                  style={{ 
                    borderColor: 'var(--border-color)',
                    backgroundColor: 'var(--bg-main)'
                  }}
                >
                  <div className="text-2xl grid-mb-1">🏆</div>
                  <div 
                    className="text-xs font-mono font-bold uppercase grid-mb-1"
                    style={{ color: 'var(--accent-color)' }}
                  >
                    Step 3: Complete Case
                  </div>
                  <p 
                    className="text-xs font-mono"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    Complete all sections to unlock the full investigation report and close the case.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* === INVESTIGATION SECTIONS === */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid-mb-3"
        >
          <div 
            className="border-2 overflow-hidden"
            style={{ borderColor: 'var(--border-color)' }}
          >
            {/* Section Header */}
            <div 
              className="grid-p-1 flex items-center justify-between"
              style={{ backgroundColor: 'var(--text-main)' }}
            >
              <div className="flex items-center gap-2">
                <PixelIcon name="folder" size={20} className="text-[var(--bg-main)]" />
                <h2 
                  className="text-sm font-mono font-bold uppercase tracking-wider"
                  style={{ color: 'var(--bg-main)' }}
                >
                  Investigation Sections
                </h2>
              </div>
              <span 
                className="text-xs font-mono"
                style={{ color: 'var(--bg-main)', opacity: 0.7 }}
              >
                {INVESTIGATION_SECTIONS.length} SECTIONS
              </span>
            </div>

            {/* Sections Grid */}
            <div 
              className="grid-p-2"
              style={{ backgroundColor: 'var(--bg-card)' }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 grid-gap-1">
                {INVESTIGATION_SECTIONS.map((section, index) => {
                  const completedLevels = progress.completedLevels[section.id] || [];
                  const game = PAGE_GAMES.find(g => g.id === section.id);
                  const totalLevels = game?.levels.length || 1;
                  const progressPercent = Math.round((completedLevels.length / totalLevels) * 100);
                  const isComplete = progressPercent === 100;

                  return (
                    <motion.div
                      key={section.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                    >
                      <Link href={section.path}>
                        <motion.div
                          className="border-2 h-full cursor-pointer relative overflow-hidden"
                          style={{ 
                            borderColor: hoveredSection === section.id ? section.color : 'var(--border-color)',
                            backgroundColor: 'var(--bg-main)'
                          }}
                          onMouseEnter={() => setHoveredSection(section.id)}
                          onMouseLeave={() => setHoveredSection(null)}
                          whileHover={{ scale: 1.02, y: -4 }}
                          transition={{ duration: 0.2 }}
                        >
                          {/* Section Header */}
                          <div 
                            className="grid-p-1 flex items-center justify-between"
                            style={{ backgroundColor: section.color }}
                          >
                            <div className="flex items-center gap-2">
                              <PixelIcon name={section.icon} size={16} className="text-white" />
                              <span className="text-xs font-mono font-bold text-white uppercase">
                                {section.code}
                              </span>
                            </div>
                            <span className="text-[10px] font-mono text-white opacity-80">
                              {section.difficulty}
                            </span>
                          </div>

                          {/* Section Content */}
                          <div className="grid-p-1">
                            <h3 
                              className="text-sm font-mono font-bold uppercase grid-mb-1"
                              style={{ color: 'var(--text-main)' }}
                            >
                              {section.title}
                            </h3>
                            <p 
                              className="text-xs font-mono leading-relaxed grid-mb-1"
                              style={{ color: 'var(--text-muted)' }}
                            >
                              {section.description}
                            </p>

                            {/* Clues Preview */}
                            <div className="flex flex-wrap gap-1 grid-mb-1">
                              {section.cluesFound.slice(0, 3).map((clue, i) => (
                                <span 
                                  key={i}
                                  className="text-[10px] font-mono px-2 py-0.5"
                                  style={{ 
                                    backgroundColor: 'var(--bg-card)',
                                    color: 'var(--text-muted)'
                                  }}
                                >
                                  {clue}
                                </span>
                              ))}
                              {section.cluesFound.length > 3 && (
                                <span 
                                  className="text-[10px] font-mono px-2 py-0.5"
                                  style={{ 
                                    backgroundColor: section.color,
                                    color: 'white'
                                  }}
                                >
                                  +{section.cluesFound.length - 3}
                                </span>
                              )}
                            </div>

                            {/* Progress Bar */}
                            <div className="flex items-center gap-2">
                              <div 
                                className="flex-1 h-1 border"
                                style={{ 
                                  borderColor: 'var(--border-color)',
                                  backgroundColor: 'var(--bg-card)'
                                }}
                              >
                                <div 
                                  className="h-full transition-all duration-300"
                                  style={{ 
                                    width: `${progressPercent}%`,
                                    backgroundColor: isComplete ? '#10B981' : section.color
                                  }}
                                />
                              </div>
                              <span 
                                className="text-[10px] font-mono"
                                style={{ color: isComplete ? '#10B981' : 'var(--text-muted)' }}
                              >
                                {isComplete ? '✓' : `${progressPercent}%`}
                              </span>
                            </div>

                            {/* Time Estimate */}
                            <div 
                              className="text-[10px] font-mono mt-2 flex items-center gap-1"
                              style={{ color: 'var(--text-muted)' }}
                            >
                              <PixelIcon name="clock" size={12} className="opacity-50" />
                              Est. {section.estimatedTime}
                            </div>
                          </div>

                          {/* Hover Arrow */}
                          <motion.div
                            className="absolute bottom-3 right-3"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ 
                              opacity: hoveredSection === section.id ? 1 : 0,
                              x: hoveredSection === section.id ? 0 : -10
                            }}
                          >
                            <PixelIcon name="arrow-right" size={20} style={{ color: section.color }} />
                          </motion.div>
                        </motion.div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.section>

        {/* === QUICK CONTROLS === */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="grid-mb-3"
        >
          <div 
            className="border-2 overflow-hidden"
            style={{ borderColor: 'var(--border-color)' }}
          >
            <div 
              className="grid-p-1 flex items-center gap-2"
              style={{ backgroundColor: 'var(--accent-color)' }}
            >
              <PixelIcon name="cog" size={20} className="text-[var(--bg-main)]" />
              <h2 
                className="text-sm font-mono font-bold uppercase tracking-wider"
                style={{ color: 'var(--bg-main)' }}
              >
                Quick Guide
              </h2>
            </div>

            <div 
              className="grid-p-2 grid grid-cols-1 md:grid-cols-2 grid-gap-1"
              style={{ backgroundColor: 'var(--bg-card)' }}
            >
              {/* Keyboard Shortcuts */}
              <div 
                className="border-2 grid-p-1"
                style={{ 
                  borderColor: 'var(--border-color)',
                  backgroundColor: 'var(--bg-main)'
                }}
              >
                <h3 
                  className="text-xs font-mono font-bold uppercase grid-mb-1 flex items-center gap-1"
                  style={{ color: 'var(--text-main)' }}
                >
                  <PixelIcon name="code" size={14} /> Keyboard Shortcuts
                </h3>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <kbd 
                      className="px-2 py-0.5 border text-[10px]"
                      style={{ borderColor: 'var(--border-color)' }}
                    >1-7</kbd>
                    <span style={{ color: 'var(--text-muted)' }}>Navigate pages</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd 
                      className="px-2 py-0.5 border text-[10px]"
                      style={{ borderColor: 'var(--border-color)' }}
                    >G</kbd>
                    <span style={{ color: 'var(--text-muted)' }}>Open menu</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd 
                      className="px-2 py-0.5 border text-[10px]"
                      style={{ borderColor: 'var(--border-color)' }}
                    >?</kbd>
                    <span style={{ color: 'var(--text-muted)' }}>Help</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd 
                      className="px-2 py-0.5 border text-[10px]"
                      style={{ borderColor: 'var(--border-color)' }}
                    >ESC</kbd>
                    <span style={{ color: 'var(--text-muted)' }}>Close overlay</span>
                  </div>
                </div>
              </div>

              {/* Game Tips */}
              <div 
                className="border-2 grid-p-1"
                style={{ 
                  borderColor: 'var(--border-color)',
                  backgroundColor: 'var(--bg-main)'
                }}
              >
                <h3 
                  className="text-xs font-mono font-bold uppercase grid-mb-1 flex items-center gap-1"
                  style={{ color: 'var(--text-main)' }}
                >
                  <PixelIcon name="lightbulb" size={14} /> Tips
                </h3>
                <ul className="text-xs font-mono grid-space-y-1" style={{ color: 'var(--text-muted)' }}>
                  <li className="flex items-start gap-2">
                    <span style={{ color: 'var(--accent-color)' }}>•</span>
                    <span>Look for the <strong style={{ color: 'var(--text-main)' }}>▶ PLAY</strong> button on each page</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span style={{ color: 'var(--accent-color)' }}>•</span>
                    <span>Complete mini-games to reveal hidden information</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span style={{ color: 'var(--accent-color)' }}>•</span>
                    <span>Use the time machine slider to explore design eras</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </motion.section>

        {/* === SUBJECT SKILLS PREVIEW === */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="grid-mb-3"
        >
          <div 
            className="border-2 overflow-hidden"
            style={{ borderColor: 'var(--border-color)' }}
          >
            <div 
              className="grid-p-1 flex items-center gap-2"
              style={{ backgroundColor: 'var(--text-main)' }}
            >
              <PixelIcon name="bolt" size={20} className="text-[var(--bg-main)]" />
              <h2 
                className="text-sm font-mono font-bold uppercase tracking-wider"
                style={{ color: 'var(--bg-main)' }}
              >
                Subject Capabilities (Preview)
              </h2>
            </div>

            <div 
              className="grid-p-2 grid grid-cols-1 md:grid-cols-3 grid-gap-1"
              style={{ backgroundColor: 'var(--bg-card)' }}
            >
              <div 
                className="border-2 grid-p-1"
                style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-main)' }}
              >
                <div className="flex items-center gap-2 grid-mb-1">
                  <PixelIcon name="pen" size={20} className="text-[var(--accent-color)]" />
                  <span className="text-xs font-mono font-bold uppercase" style={{ color: 'var(--text-main)' }}>
                    Design
                  </span>
                </div>
                <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                  UX/UI • Design Systems • Figma • User Research • Information Architecture
                </p>
              </div>

              <div 
                className="border-2 grid-p-1"
                style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-main)' }}
              >
                <div className="flex items-center gap-2 grid-mb-1">
                  <PixelIcon name="code" size={20} className="text-[var(--accent-color)]" />
                  <span className="text-xs font-mono font-bold uppercase" style={{ color: 'var(--text-main)' }}>
                    Development
                  </span>
                </div>
                <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                  React • Next.js • TypeScript • Node.js • Spring Boot • AWS
                </p>
              </div>

              <div 
                className="border-2 grid-p-1"
                style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-main)' }}
              >
                <div className="flex items-center gap-2 grid-mb-1">
                  <PixelIcon name="robot" size={20} className="text-[var(--accent-color)]" />
                  <span className="text-xs font-mono font-bold uppercase" style={{ color: 'var(--text-main)' }}>
                    AI & Innovation
                  </span>
                </div>
                <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                  AI Experience (AX) Design • LLM Integration • Prompt Engineering
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* === FOOTER === */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="grid-pt-2 text-center"
        >
          <div 
            className="h-px w-full grid-mb-2"
            style={{ backgroundColor: 'var(--border-color)' }}
          />
          
          <p 
            className="text-xs font-mono uppercase tracking-wider grid-mb-1"
            style={{ color: 'var(--text-muted)' }}
          >
            Investigation File • KIRUK Identity Case • {today.getFullYear()}
          </p>
          
          <p 
            className="text-[10px] font-mono italic"
            style={{ color: 'var(--text-muted)', opacity: 0.7 }}
          >
            "Scribbles that turn into digital experiences"
          </p>

          <div className="flex justify-center items-center gap-4 grid-mt-2">
            <Link 
              href="/contact"
              className="text-xs font-mono uppercase tracking-wider hover:underline"
              style={{ color: 'var(--accent-color)' }}
            >
              Contact Subject
            </Link>
            <span style={{ color: 'var(--text-muted)' }}>•</span>
            <a 
              href="https://linkedin.com/in/arunkumaarsreenivasan/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono uppercase tracking-wider hover:underline"
              style={{ color: 'var(--accent-color)' }}
            >
              LinkedIn
            </a>
            <span style={{ color: 'var(--text-muted)' }}>•</span>
            <a 
              href="https://github.com/arunkumaarsrinivasan"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono uppercase tracking-wider hover:underline"
              style={{ color: 'var(--accent-color)' }}
            >
              GitHub
            </a>
          </div>
        </motion.footer>
      </div>
    </div>
  );
}
