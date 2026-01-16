'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { PixelIcon } from '@/components/ui/PixelIcon';
import { useGameMode } from '@/contexts/GameModeContext';
import { useDesignEra } from '@/contexts/DesignEraContext';
import { PAGE_GAMES, GAME_TYPE_ICONS } from '@/data/game-navigation-data';
import { usePathname } from 'next/navigation';
import { GridBackground } from '@/components/ui/GridBackground';
import { useResponsiveGrid } from '@/hooks/useResponsiveGrid';
import Link from 'next/link';
import { portfolioData } from '@/data/portfolio-data';
import { FixedCharacterHelper } from './FixedCharacterHelper';
import { SectionCharacter } from '@/components/characters';
import { PixelEmote } from '@/components/ui/PixelEmote';
import { PixelMemoNote } from '@/components/ui/PixelMemoNote';
import { PixelSkillBadge } from '@/components/ui/PixelSkillBadge';
import { PixelStatCard } from '@/components/ui/PixelStatCard';

export default function NewspaperLayout() {
  const { progress, mode } = useGameMode();
  const { currentEra } = useDesignEra();
  const gridAlignment = useResponsiveGrid();
  const pathname = usePathname();
  const [_isStampAnimating, setIsStampAnimating] = useState(false);
  const [expandedExperiences, setExpandedExperiences] = useState<Set<string>>(new Set());
  const [activeHat, setActiveHat] = useState<'designer' | 'developer' | 'bridge' | null>(null);
  const [isBridgeHovered, setIsBridgeHovered] = useState(false);
  const [pixels, setPixels] = useState<Array<{ id: number; x: number; y: number; angle: number; color: string }>>([]);
  const [isClient, setIsClient] = useState(false);
  
  // Check if bridge is active (super powered mode)
  const isSuperPowered = activeHat === 'bridge';
  
  // Check if we're in content mode (non-gamified)
  const isContentMode = mode === 'god';

  // Ensure we're on the client side before animating
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Convert hex color to rgba
  const hexToRgba = (hex: string, alpha: number) => {
    const r = Number.parseInt(hex.slice(1, 3), 16);
    const g = Number.parseInt(hex.slice(3, 5), 16);
    const b = Number.parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  // Toggle experience expansion
  const toggleExperience = (id: string) => {
    setExpandedExperiences(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Highlight keywords in text with era-specific colors
  const highlightText = (text: string) => {
    const keywords = [
      'HP Print AI', 'intelligent print', 'email/webmail printing', 'Flutter', 'Spring Boot', 'Node.js', 'TypeScript',
      'design system', 'AI Stack', 'text-to-image', 'Splunk', 'microservices', 'COE BOT', 'Spring Shell',
      'Square bridge', 'student recruitment', '200+ candidates', '45%', '150+ UI screens', '98%', '40%', '35%',
      'gamified HR', '100+ game assets', 'performance dashboards', 'rapid prototyping',
      'branding', 'UI/UX', 'web applications', 'digital experiences'
    ];
    
    const accentColor = currentEra.colors.accent;
    const highlightBg = hexToRgba(accentColor, 0.2);
    
    let highlighted = text;
    keywords.forEach(keyword => {
      // Simple case-insensitive replacement
      const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(${escapedKeyword})`, 'gi');
      highlighted = highlighted.replace(regex, (match) => {
        return `<span style="background-color: ${highlightBg}; padding: 2px 4px; border-radius: 2px; font-weight: bold; color: ${accentColor};">${match}</span>`;
      });
    });
    return highlighted;
  };

  // Animate stamp on mount
  useEffect(() => {
    const timer = setTimeout(() => setIsStampAnimating(true), 500);
    return () => clearTimeout(timer);
  }, []);

  // Handle bridge hat click - only emit pixels when selecting, not unselecting
  const handleBridgeClick = () => {
    const wasBridgeActive = activeHat === 'bridge';
    const newIsActive = !wasBridgeActive;
    
    if (newIsActive) {
      // Only emit pixels when activating bridge
      setActiveHat('bridge');
      
      // Emit pixels from the character
      const newPixels: Array<{ id: number; x: number; y: number; angle: number; color: string }> = [];
      const colors = [currentEra.colors.accent, '#FFD700', '#FF6B6B', '#4ECDC4', '#FFA500'];
      
      // Reduced number of pixels and more subtle animation
      for (let i = 0; i < 20; i++) {
        newPixels.push({
          id: Date.now() + i,
          x: 50, // Start from center of character (50% of container)
          y: 50,
          angle: (Math.PI * 2 * i) / 20 + Math.random() * 0.3,
          color: colors[Math.floor(Math.random() * colors.length)]
        });
      }
      
      setPixels(newPixels);
      
      // Clean up pixels after animation
      setTimeout(() => {
        setPixels([]);
      }, 1200);
    } else {
      // Just unselect without effects
      setActiveHat(null);
      setPixels([]);
    }
  };

  // Calculate investigation progress
  const _investigationProgress = useMemo(() => {
    let totalLevels = 0;
    let completedLevels = 0;
    
    PAGE_GAMES.forEach(game => {
      totalLevels += game.levels.length;
      completedLevels += (progress.completedLevels[game.id] || []).length;
    });
    
    return Math.round((completedLevels / totalLevels) * 100);
  }, [progress.completedLevels]);

  const today = new Date();
  const formatMonthYear = (value: string) => {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return value;
    }
    return parsed.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  return (
    <div 
      className="snap-scroll-container bg-[var(--bg-main)] relative"
    >
      {/* Grid Background - Behind everything, extends with content */}
      <div 
        className="absolute inset-0 z-0" 
        style={{ 
          minHeight: '100%',
          height: '100%',
          width: '100%',
        }}
      >
        <div style={{ minHeight: '100%', height: '100%', width: '100%' }}>
          <GridBackground 
            opacity={0.15} 
            scanlinesOpacity={0.03}
            offsetX={0}
            offsetY={0}
          />
        </div>
      </div>

      {/* Content Container */}
      <div 
        className="mx-auto relative z-10 w-full"
        style={{
          maxWidth: `${gridAlignment.maxContentWidth}px`,
          width: '100%',
          minHeight: '100%',
        }}
      >
        {/* === HEADER SECTION (Snap) === */}
        <div className="snap-section">
          <div className="snap-section-content" style={{ padding: '40px' }}>
            {/* === DOCUMENT HEADER === */}
            <motion.header
              initial={isClient ? { opacity: 0, y: -20 } : { opacity: 1, y: 0 }}
              animate={{ opacity: 1, y: 0 }}
              transition={isClient ? { duration: 0.6 } : { duration: 0 }}
              className="grid-mb-3 relative"
            >
            {/* Top Bar - Classification (hidden in content mode) */}
            {!isContentMode && (
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
            )}

          {/* 8-Bit Figure with Multiple Hats - Designer & Developer Bridge */}
            <div
              className="border-2 grid-p-4 grid-mb-2 relative overflow-hidden"
              style={{ 
                borderColor: 'var(--accent-color)',
                backgroundColor: 'var(--bg-main)',
                opacity: 1,
                transform: 'translateY(0)',
              }}
            >
              {/* Animated background grid pattern */}
              <div 
                className="absolute inset-0 opacity-5 pointer-events-none"
                style={{
                  backgroundImage: `
                    linear-gradient(var(--accent-color) 1px, transparent 1px),
                    linear-gradient(90deg, var(--accent-color) 1px, transparent 1px)
                  `,
                  backgroundSize: '8px 8px'
                }}
              />

              {/* Main Content - Centered Column Layout */}
              <div className="relative z-10 flex flex-col items-center justify-center gap-6 py-6">
                
                {/* Introduction - Above Figure */}
                <div className="flex flex-col items-center gap-4 max-w-lg text-center mb-2">
                  <motion.h2 
                    className="text-4xl md:text-5xl font-mono font-black uppercase mb-2"
                    style={{ color: 'var(--accent-color)' }}
                    initial={isClient ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={isClient ? { delay: 0.2 } : { duration: 0 }}
                  >
                    Hey, I'm Arun
                  </motion.h2>
                </div>
                
                {/* 8-Bit Character with Hats */}
                <div className="relative">
                  {/* Character and Hats Container */}
                  <div className="relative flex items-center justify-center">
                    
                    {/* Pixel particles emitter */}
                    <AnimatePresence>
                      {pixels.map((pixel) => (
                        <motion.div
                          key={pixel.id}
                          className="absolute pointer-events-none"
                          style={{
                            left: '50%',
                            top: '50%',
                            width: '8px',
                            height: '8px',
                            backgroundColor: pixel.color,
                            imageRendering: 'pixelated',
                            zIndex: 20,
                          }}
                          initial={{ 
                            x: 0, 
                            y: 0, 
                            opacity: 1,
                            scale: 1,
                          }}
                      animate={{
                        x: Math.cos(pixel.angle) * 80,
                        y: Math.sin(pixel.angle) * 80,
                        opacity: [1, 0.8, 0],
                        scale: [1, 1.2, 0.3],
                      }}
                      exit={{ opacity: 0 }}
                      transition={{
                        duration: 1.0,
                        ease: 'easeOut',
                      }}
                        />
                      ))}
                    </AnimatePresence>
                    
                    {/* 8-Bit Character Body with Integrated Hat */}
                    <motion.div
                      animate={{ 
                        y: [0, -4, 0],
                        scale: isSuperPowered ? [1, 1.03, 1] : 1,
                        filter: isSuperPowered ? `brightness(1.15) drop-shadow(0 0 8px ${currentEra.colors.accent})` : 'none'
                      }}
                      transition={{ 
                        duration: isSuperPowered ? 1.5 : 2,
                        repeat: Infinity, 
                        ease: "easeInOut" 
                      }}
                    >
                      <svg 
                        width="160" 
                        height="200" 
                        viewBox="0 0 120 170" 
                        style={{ imageRendering: 'pixelated' }}
                        className="drop-shadow-xl"
                      >
                        {/* === HATS (rendered first, behind hair sides) === */}
                        
                        {/* Designer Hat - Artist Beret */}
                        <AnimatePresence>
                          {activeHat === 'designer' && (
                            <motion.g
                              initial={{ y: -30, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              exit={{ y: -20, opacity: 0 }}
                              transition={{ type: 'spring', damping: 12, stiffness: 150 }}
                            >
                              {/* Beret main body - sits on top of head */}
                              <rect x="32" y="18" width="56" height="8" fill="#E91E63" />
                              <rect x="36" y="10" width="48" height="12" fill="#E91E63" />
                              <rect x="40" y="4" width="40" height="10" fill="#E91E63" />
                              <rect x="44" y="0" width="32" height="8" fill="#E91E63" />
                              {/* Beret puff on side */}
                              <rect x="72" y="2" width="16" height="12" fill="#E91E63" />
                              <rect x="80" y="6" width="12" height="8" fill="#E91E63" />
                              {/* Highlight */}
                              <rect x="48" y="6" width="8" height="4" fill="#F48FB1" />
                              <rect x="44" y="10" width="4" height="4" fill="#F48FB1" />
                            </motion.g>
                          )}
                        </AnimatePresence>

                        {/* Developer Hat - Baseball Cap */}
                        <AnimatePresence>
                          {activeHat === 'developer' && (
                            <motion.g
                              initial={{ y: -30, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              exit={{ y: -20, opacity: 0 }}
                              transition={{ type: 'spring', damping: 12, stiffness: 150 }}
                            >
                              {/* Cap crown */}
                              <rect x="32" y="16" width="56" height="10" fill="#2196F3" />
                              <rect x="36" y="8" width="48" height="12" fill="#2196F3" />
                              <rect x="40" y="4" width="40" height="8" fill="#2196F3" />
                              {/* Cap brim - extends forward */}
                              <rect x="24" y="22" width="40" height="6" fill="#1565C0" />
                              <rect x="20" y="24" width="8" height="4" fill="#1565C0" />
                              {/* Cap button on top */}
                              <rect x="56" y="2" width="8" height="4" fill="#1565C0" />
                              {/* Code symbol on cap */}
                              <text x="60" y="18" fontSize="10" fill="white" textAnchor="middle" fontFamily="monospace" fontWeight="bold">&lt;/&gt;</text>
                            </motion.g>
                          )}
                        </AnimatePresence>

                        {/* Bridge Hat - Hard Hat / Construction */}
                        <AnimatePresence>
                          {activeHat === 'bridge' && (
                            <motion.g
                              initial={{ y: -30, opacity: 0 }}
                              animate={{ 
                                y: 0, 
                                opacity: 1,
                              }}
                              exit={{ y: -20, opacity: 0 }}
                              transition={{ 
                                type: 'spring', 
                                damping: 12, 
                                stiffness: 150,
                              }}
                            >
                              {/* Hard hat dome - golden when super powered */}
                              <rect 
                                x="28" 
                                y="18" 
                                width="64" 
                                height="8" 
                                fill={isSuperPowered ? '#FFD700' : currentEra.colors.accent}
                              />
                              <rect 
                                x="32" 
                                y="10" 
                                width="56" 
                                height="12" 
                                fill={isSuperPowered ? '#FFB84D' : currentEra.colors.accent}
                              />
                              <rect 
                                x="36" 
                                y="4" 
                                width="48" 
                                height="10" 
                                fill={isSuperPowered ? '#FFD700' : currentEra.colors.accent}
                              />
                              <rect 
                                x="44" 
                                y="0" 
                                width="32" 
                                height="8" 
                                fill={isSuperPowered ? '#FFB84D' : currentEra.colors.accent}
                              />
                              {/* Hard hat brim */}
                              <rect 
                                x="24" 
                                y="22" 
                                width="72" 
                                height="4" 
                                fill={isSuperPowered ? '#FFD700' : currentEra.colors.accent}
                              />
                              {/* Reflective stripe - slightly brighter when super powered */}
                              <rect 
                                x="32" 
                                y="14" 
                                width="56" 
                                height="4" 
                                fill="white" 
                                opacity={isSuperPowered ? 0.6 : 0.4}
                              />
                              {/* Center logo/icon - lightning bolt when super powered */}
                              {isSuperPowered ? (
                                <>
                                  <rect x="56" y="4" width="8" height="12" fill="#FFF" opacity="0.9" />
                                  <rect x="58" y="6" width="4" height="4" fill="#FFD700" />
                                  <rect x="60" y="10" width="4" height="4" fill="#FFD700" />
                                </>
                              ) : (
                                <rect x="56" y="6" width="8" height="8" fill="white" opacity="0.3" />
                              )}
                            </motion.g>
                          )}
                        </AnimatePresence>
                        
                        {/* === HEAD === */}
                        <rect x="36" y="30" width="48" height="48" fill="#FDBF60" />
                        <rect x="32" y="34" width="8" height="40" fill="#FDBF60" />
                        <rect x="80" y="34" width="8" height="40" fill="#FDBF60" />
                        
                        {/* === HAIR === */}
                        {/* Hair - full hair when no hat */}
                        {!activeHat && (
                          <>
                            <rect x="36" y="26" width="48" height="12" fill="#4A4A4A" />
                            <rect x="32" y="30" width="8" height="8" fill="#4A4A4A" />
                            <rect x="80" y="30" width="8" height="8" fill="#4A4A4A" />
                          </>
                        )}
                        {/* Hair visible on sides when wearing hat */}
                        {activeHat && (
                          <>
                            {/* Side hair/sideburns still visible */}
                            <rect x="32" y="34" width="6" height="12" fill="#4A4A4A" />
                            <rect x="82" y="34" width="6" height="12" fill="#4A4A4A" />
                            {/* Little bit of hair peeking from under hat */}
                            <rect x="36" y="26" width="8" height="4" fill="#4A4A4A" />
                            <rect x="76" y="26" width="8" height="4" fill="#4A4A4A" />
                          </>
                        )}
                        
                        {/* === FACE === */}
                        {/* Eyes */}
                        <rect x="44" y="46" width="8" height="8" fill="#2D2D2D" />
                        <rect x="68" y="46" width="8" height="8" fill="#2D2D2D" />
                        <rect x="46" y="48" width="4" height="4" fill="white" />
                        <rect x="70" y="48" width="4" height="4" fill="white" />
                        
                        {/* Smile */}
                        <rect x="48" y="62" width="24" height="4" fill="#2D2D2D" />
                        <rect x="44" y="58" width="4" height="4" fill="#2D2D2D" />
                        <rect x="72" y="58" width="4" height="4" fill="#2D2D2D" />
                        
                        {/* === BODY === */}
                        {/* Subtle glow effect when super powered */}
                        {isSuperPowered && (
                          <rect x="30" y="76" width="60" height="52" fill={currentEra.colors.accent} opacity="0.1" />
                        )}
                        <rect 
                          x="32" 
                          y="78" 
                          width="56" 
                          height="48" 
                          fill={isSuperPowered ? '#FFB84D' : '#333333'}
                        />
                        <rect 
                          x="28" 
                          y="82" 
                          width="8" 
                          height="40" 
                          fill={isSuperPowered ? '#FFA500' : '#333333'}
                        />
                        <rect 
                          x="84" 
                          y="82" 
                          width="8" 
                          height="40" 
                          fill={isSuperPowered ? '#FFA500' : '#333333'}
                        />
                        
                        {/* Arms */}
                        <rect x="16" y="82" width="16" height="12" fill="#FDBF60" />
                        <rect x="88" y="82" width="16" height="12" fill="#FDBF60" />
                        
                        {/* Hands */}
                        <rect x="8" y="90" width="12" height="12" fill="#FDBF60" />
                        <rect x="100" y="90" width="12" height="12" fill="#FDBF60" />
                        
                        {/* Pencil in left hand */}
                        <rect x="4" y="86" width="4" height="20" fill="#FFD700" />
                        <rect x="4" y="82" width="4" height="4" fill="#E91E63" />
                        <rect x="4" y="106" width="4" height="4" fill="#FDBF60" />
                        
                        {/* Code bracket in right hand */}
                        <text x="108" y="102" fontSize="14" fill="#2196F3" fontFamily="monospace" fontWeight="bold">&lt;/&gt;</text>
                        
                        {/* Legs */}
                        <rect x="36" y="126" width="20" height="32" fill="#4A5568" />
                        <rect x="64" y="126" width="20" height="32" fill="#4A5568" />
                        
                        {/* Shoes */}
                        <rect x="32" y="154" width="24" height="8" fill="#2D2D2D" />
                        <rect x="64" y="154" width="24" height="8" fill="#2D2D2D" />
                      </svg>
                    </motion.div>
                  </div>
                </div>

                {/* Role Description - Below Figure */}
                <div className="flex flex-col items-center gap-4 max-w-lg text-center">
                  <div>
                  <motion.h3 
                    className="text-2xl md:text-3xl font-mono font-black uppercase mb-2"
                    style={{ color: 'var(--text-main)' }}
                    initial={isClient ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={isClient ? { delay: 0.4 } : { duration: 0 }}
                  >
                    WEARING MULTIPLE HATS
                  </motion.h3>
                  <motion.p 
                    className="text-sm font-mono leading-relaxed"
                    style={{ color: 'var(--text-muted)' }}
                    initial={isClient ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={isClient ? { delay: 0.5 } : { duration: 0 }}
                  >
                    I speak both design and code fluently, bridging the gap between creative vision and technical execution.
                  </motion.p>
                  </div>

                  {/* Clickable Hat Instruction */}
                  <motion.p
                    className="text-[10px] font-mono uppercase tracking-wider"
                    style={{ color: 'var(--text-muted)' }}
                    initial={isClient ? { opacity: 0 } : { opacity: 1 }}
                    animate={{ opacity: 1 }}
                    transition={isClient ? { delay: 0.6 } : { duration: 0 }}
                  >
                    Click a hat to try it on
                  </motion.p>

                  {/* Clickable Role Tags */}
                  <div className="flex flex-wrap justify-center gap-3">
                    <motion.button
                      className="flex items-center gap-2 px-4 py-3 border-2 cursor-pointer"
                      style={{ 
                        borderColor: activeHat === 'designer' ? '#E91E63' : 'var(--border-color)',
                        backgroundColor: activeHat === 'designer' ? 'rgba(233, 30, 99, 0.2)' : 'rgba(233, 30, 99, 0.05)',
                        boxShadow: activeHat === 'designer' ? '0 0 15px rgba(233, 30, 99, 0.3)' : 'none'
                      }}
                      initial={isClient ? { opacity: 0, scale: 0.8 } : { opacity: 1, scale: 1 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={isClient ? { delay: 0.6 } : { duration: 0 }}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setActiveHat(activeHat === 'designer' ? null : 'designer');
                        setPixels([]); // Clear any pixels when switching hats
                      }}
                    >
                      {/* Mini Beret Icon */}
                      <svg width="24" height="16" viewBox="0 0 48 32" style={{ imageRendering: 'pixelated' }}>
                        <rect x="8" y="20" width="32" height="8" fill="#E91E63" />
                        <rect x="12" y="12" width="24" height="12" fill="#E91E63" />
                        <rect x="16" y="8" width="16" height="8" fill="#E91E63" />
                        <rect x="20" y="4" width="8" height="8" fill="#E91E63" />
                      </svg>
                      <span className="text-xs font-mono font-bold uppercase" style={{ color: '#E91E63' }}>
                        Designer
                      </span>
                      {activeHat === 'designer' && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="text-xs"
                        >
                          ✓
                        </motion.span>
                      )}
                    </motion.button>

                    <motion.button
                      className="flex items-center gap-2 px-4 py-3 border-2 cursor-pointer"
                      style={{ 
                        borderColor: activeHat === 'bridge' ? (isSuperPowered ? '#FFD700' : currentEra.colors.accent) : 'var(--border-color)',
                        backgroundColor: activeHat === 'bridge' ? hexToRgba(isSuperPowered ? '#FFD700' : currentEra.colors.accent, 0.2) : hexToRgba(currentEra.colors.accent, 0.05),
                        boxShadow: activeHat === 'bridge' ? `0 0 15px ${hexToRgba(isSuperPowered ? '#FFD700' : currentEra.colors.accent, isSuperPowered ? 0.6 : 0.3)}` : 'none'
                      }}
                      initial={isClient ? { opacity: 0, scale: 0.8 } : { opacity: 1, scale: 1 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={isClient ? { delay: 0.7 } : { duration: 0 }}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleBridgeClick}
                      onMouseEnter={() => setIsBridgeHovered(true)}
                      onMouseLeave={() => setIsBridgeHovered(false)}
                    >
                      {/* Mini Hard Hat Icon */}
                      <svg width="28" height="18" viewBox="0 0 56 36" style={{ imageRendering: 'pixelated' }}>
                        <rect x="8" y="24" width="40" height="8" fill={isSuperPowered ? '#FFD700' : currentEra.colors.accent} />
                        <rect x="12" y="16" width="32" height="12" fill={isSuperPowered ? '#FFA500' : currentEra.colors.accent} />
                        <rect x="16" y="8" width="24" height="12" fill={isSuperPowered ? '#FFD700' : currentEra.colors.accent} />
                        <rect x="20" y="4" width="16" height="8" fill={isSuperPowered ? '#FFA500' : currentEra.colors.accent} />
                      </svg>
                      <span className="text-xs font-mono font-bold uppercase" style={{ color: isSuperPowered ? '#FFD700' : currentEra.colors.accent }}>
                        {isBridgeHovered ? 'KIRUK' : 'Bridge'}
                      </span>
                      {activeHat === 'bridge' && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="text-xs"
                          style={{ color: isSuperPowered ? '#FFD700' : currentEra.colors.accent }}
                        >
                          {isSuperPowered ? '⚡' : '✓'}
                        </motion.span>
                      )}
                    </motion.button>

                    <motion.button
                      className="flex items-center gap-2 px-4 py-3 border-2 cursor-pointer"
                      style={{ 
                        borderColor: activeHat === 'developer' ? '#2196F3' : 'var(--border-color)',
                        backgroundColor: activeHat === 'developer' ? 'rgba(33, 150, 243, 0.2)' : 'rgba(33, 150, 243, 0.05)',
                        boxShadow: activeHat === 'developer' ? '0 0 15px rgba(33, 150, 243, 0.3)' : 'none'
                      }}
                      initial={isClient ? { opacity: 0, scale: 0.8 } : { opacity: 1, scale: 1 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={isClient ? { delay: 0.8 } : { duration: 0 }}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setActiveHat(activeHat === 'developer' ? null : 'developer');
                        setPixels([]); // Clear any pixels when switching hats
                      }}
                    >
                      {/* Mini Baseball Cap Icon */}
                      <svg width="24" height="16" viewBox="0 0 48 32" style={{ imageRendering: 'pixelated' }}>
                        <rect x="8" y="20" width="32" height="8" fill="#2196F3" />
                        <rect x="4" y="16" width="40" height="8" fill="#2196F3" />
                        <rect x="8" y="12" width="32" height="8" fill="#2196F3" />
                        <rect x="12" y="8" width="24" height="8" fill="#2196F3" />
                        <rect x="4" y="24" width="20" height="4" fill="#1565C0" />
                      </svg>
                      <span className="text-xs font-mono font-bold uppercase" style={{ color: '#2196F3' }}>
                        Developer
                      </span>
                      {activeHat === 'developer' && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="text-xs"
                        >
                          ✓
                        </motion.span>
                      )}
                    </motion.button>
                  </div>

                  {/* Call-to-Action Buttons */}
                  <motion.div 
                    className="flex flex-wrap justify-center gap-3 mt-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                  >
                    <motion.a
                      href="#work"
                      className="px-6 py-3 border-2 font-mono font-bold uppercase text-sm cursor-pointer"
                      style={{ 
                        backgroundColor: 'var(--accent-color)',
                        color: 'var(--bg-main)'
                      }}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      See My Work
                    </motion.a>
                    <motion.a
                      href="/contact"
                      className="px-6 py-3 border-2 font-mono font-bold uppercase text-sm cursor-pointer"
                      style={{ 
                        borderColor: 'var(--accent-color)',
                        backgroundColor: 'transparent',
                        color: 'var(--accent-color)'
                      }}
                      whileHover={{ scale: 1.05, y: -2, backgroundColor: 'var(--accent-color)', color: 'var(--bg-main)' }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Contact Me
                    </motion.a>
                  </motion.div>
                </div>
              </div>
            </div>
        </motion.header>
          </div>
        </div>

        {/* === SUBJECT PROFILE BRIEF === */}
        <motion.section
          id="subject-profile"
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
                  <motion.div
                    className="absolute inset-0"
                    initial={{ opacity: 1 }}
                    whileHover={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Image
                      src="/images/dp-8bit.jpg"
                      alt="Subject Photo"
                      fill
                      className="object-cover"
                      style={{ imageRendering: 'pixelated' }}
                      sizes="128px"
                      priority
                    />
                  </motion.div>
                  <motion.div
                    className="absolute inset-0"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Image
                      src="/images/dp.jpeg"
                      alt="Subject Photo Real"
                      fill
                      className="object-cover"
                      sizes="128px"
                    />
                  </motion.div>
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

        {/* === WORK EXPERIENCE === */}
        <motion.section
          id="work-experience"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="grid-mb-3"
        >
          <div 
            className="border-2 overflow-hidden relative"
            style={{ borderColor: 'var(--border-color)' }}
          >
            {/* Header with gradient accent */}
            <div 
              className="grid-p-1 flex items-center gap-2 relative overflow-hidden"
              style={{ backgroundColor: currentEra.colors.accent }}
            >
              <div 
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.1) 10px, rgba(0,0,0,0.1) 20px)`
                }}
              />
              <PixelIcon name="grid" size={20} className="text-white relative z-10" />
              <h2 className="text-sm font-mono font-black uppercase tracking-wider text-white relative z-10">
                Work Experience
              </h2>
            </div>

            {/* Timeline-style layout */}
            <div 
              className="grid-p-4 relative"
              style={{ backgroundColor: 'var(--bg-card)' }}
            >
              {/* Vertical timeline line */}
              <div 
                className="hidden md:block absolute left-10 top-0 bottom-0 w-0.5"
                style={{ backgroundColor: 'var(--border-color)', opacity: 0.3 }}
              />

              <div className="grid-space-y-4">
                {portfolioData.experience.map((role, index) => {
                  const isExpanded = expandedExperiences.has(role.id);
                  return (
                    <motion.div
                      key={role.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                      className="relative"
                    >
                      {/* Timeline dot */}
                      <div className="hidden md:flex absolute left-8 top-6">
                        <div 
                          className="w-4 h-4 border-2 rounded-full relative z-10"
                          style={{ 
                            backgroundColor: role.current ? currentEra.colors.accent : 'var(--bg-card)',
                            borderColor: role.current ? currentEra.colors.accent : 'var(--border-color)'
                          }}
                        >
                          {role.current && (
                            <motion.div
                              className="absolute inset-0 rounded-full"
                              style={{ backgroundColor: currentEra.colors.accent }}
                              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            />
                          )}
                        </div>
                      </div>

                      {/* Experience card */}
                      <div 
                        className="md:ml-14 border-2 relative group overflow-hidden"
                        style={{ 
                          borderColor: role.current ? currentEra.colors.accent : 'var(--border-color)',
                          backgroundColor: 'var(--bg-main)'
                        }}
                      >
                        {/* Hover effect gradient */}
                        <motion.div
                          className="absolute inset-0 opacity-0 group-hover:opacity-5 pointer-events-none"
                          style={{ 
                            background: `linear-gradient(135deg, ${currentEra.colors.accent} 0%, transparent 100%)`
                          }}
                          whileHover={{ opacity: 0.1 }}
                        />

                        {/* Collapsible Header */}
                        <motion.button
                          onClick={() => toggleExperience(role.id)}
                          className="w-full grid-p-4 flex items-start justify-between gap-4 cursor-pointer hover:opacity-90 transition-opacity"
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3 grid-mb-2">
                              <div className="flex-1 min-w-0">
                                <div 
                                  className="text-xs font-mono font-bold uppercase tracking-wider grid-mb-1"
                                  style={{ color: role.current ? currentEra.colors.accent : 'var(--text-muted)' }}
                                >
                                  {role.company.toUpperCase()}
                                </div>
                                <div 
                                  className="text-lg font-mono font-black"
                                  style={{ color: 'var(--text-main)' }}
                                >
                                  {role.position}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2 flex-shrink-0">
                            <div className="flex items-center gap-2">
                              <span 
                                className="text-[10px] font-mono font-black uppercase px-3 py-1.5 border-2"
                                style={{ 
                                  borderColor: role.current ? currentEra.colors.accent : 'var(--border-color)',
                                  backgroundColor: role.current ? currentEra.colors.accent : 'transparent',
                                  color: role.current ? currentEra.colors.background : currentEra.colors.accent
                                }}
                              >
                                {role.current ? '● CURRENT' : 'PAST'}
                              </span>
                              <motion.div
                                animate={{ rotate: isExpanded ? 180 : 0 }}
                                transition={{ duration: 0.3 }}
                                className="text-xl flex-shrink-0"
                                style={{ color: currentEra.colors.accent }}
                              >
                                ▼
                              </motion.div>
                            </div>
                            <div 
                              className="text-[10px] font-mono uppercase"
                              style={{ color: 'var(--text-muted)' }}
                            >
                              {formatMonthYear(role.startDate)} → {role.current ? 'NOW' : formatMonthYear(role.endDate || '')}
                            </div>
                          </div>
                        </motion.button>

                        {/* Collapsible Content */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden"
                            >
                              <div className="grid-p-4 pt-0 border-t" style={{ borderColor: 'var(--border-color)' }}>
                                {/* Description with highlights */}
                                <div className="grid-mb-4">
                                  <div 
                                    className="text-[10px] font-mono font-bold uppercase tracking-wider grid-mb-2"
                                    style={{ color: 'var(--text-muted)' }}
                                  >
                                    OVERVIEW
                                  </div>
                                  <p 
                                    className="text-sm font-mono leading-relaxed"
                                    style={{ color: 'var(--text-main)' }}
                                    dangerouslySetInnerHTML={{ __html: highlightText(role.description) }}
                                  />
                                </div>

                                {/* Responsibilities */}
                                {role.responsibilities && role.responsibilities.length > 0 && (
                                  <div className="grid-mb-4">
                                    <div 
                                      className="text-[10px] font-mono font-bold uppercase tracking-wider grid-mb-2"
                                      style={{ color: 'var(--text-muted)' }}
                                    >
                                      KEY RESPONSIBILITIES
                                    </div>
                                    <div className="grid-space-y-2.5">
                                      {role.responsibilities.map((responsibility) => (
                                        <div key={`${role.id}-resp-${responsibility}`} className="flex items-start gap-3">
                                          <span 
                                            className="text-sm mt-0.5 flex-shrink-0"
                                            style={{ color: currentEra.colors.accent }}
                                          >
                                            →
                                          </span>
                                          <span 
                                            className="text-xs font-mono leading-relaxed flex-1"
                                            style={{ color: 'var(--text-main)' }}
                                            dangerouslySetInnerHTML={{ __html: highlightText(responsibility) }}
                                          />
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Achievements with checkmarks and highlights */}
                                <div className="grid-mb-4">
                                  <div 
                                    className="text-[10px] font-mono font-bold uppercase tracking-wider grid-mb-2"
                                    style={{ color: 'var(--text-muted)' }}
                                  >
                                    KEY ACHIEVEMENTS
                                  </div>
                                  <div className="grid-space-y-2.5">
                                    {role.achievements.map((achievement) => (
                                      <div key={`${role.id}-${achievement}`} className="flex items-start gap-3">
                                        <span 
                                          className="text-base mt-0.5 flex-shrink-0"
                                          style={{ color: currentEra.colors.accent }}
                                        >
                                          ✓
                                        </span>
                                        <span 
                                          className="text-xs font-mono leading-relaxed flex-1"
                                          style={{ color: 'var(--text-main)' }}
                                          dangerouslySetInnerHTML={{ __html: highlightText(achievement) }}
                                        />
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Tech stack as highlighted badges */}
                                <div>
                                  <div 
                                    className="text-[10px] font-mono font-bold uppercase tracking-wider grid-mb-3"
                                    style={{ color: 'var(--text-muted)' }}
                                  >
                                    TECHNOLOGIES & SKILLS
                                  </div>
                                  <div className="flex flex-wrap gap-2">
                                    {role.technologies.map((tech, techIndex) => (
                                      <motion.span
                                        key={tech}
                                        whileHover={{ scale: 1.1, y: -2 }}
                                        className="text-[10px] font-mono font-bold uppercase px-3 py-1.5 border-2 relative"
                                        style={{ 
                                          borderColor: currentEra.colors.accent,
                                          backgroundColor: techIndex % 2 === 0 ? hexToRgba(currentEra.colors.accent, 0.1) : 'transparent',
                                          color: currentEra.colors.accent
                                        }}
                                      >
                                        {tech}
                                      </motion.span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.section>

        {/* === CASE STUDIES === */}
        <motion.section
          id="case-studies"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid-mb-3"
        >
          <div 
            className="border-2 overflow-hidden relative"
            style={{ borderColor: 'var(--border-color)' }}
          >
            {/* Header with diagonal pattern */}
            <div 
              className="grid-p-1 flex items-center gap-2 relative overflow-hidden"
              style={{ backgroundColor: '#9B59B6' }}
            >
              <div 
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: `repeating-linear-gradient(-45deg, transparent, transparent 8px, rgba(255,255,255,0.1) 8px, rgba(255,255,255,0.1) 16px)`
                }}
              />
              <PixelIcon name="folder" size={20} className="text-white relative z-10" />
              <h2 className="text-sm font-mono font-black uppercase tracking-wider text-white relative z-10">
                Case Studies
              </h2>
            </div>

            {/* Magazine-style grid with varied card sizes */}
            <div 
              className="grid-p-3"
              style={{ backgroundColor: 'var(--bg-card)' }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {portfolioData.projects.map((project, index) => {
                  const isLarge = index === 0; // First card is larger
                  return (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                      whileHover={{ y: -4 }}
                      className={`group relative ${isLarge ? 'md:col-span-2' : ''}`}
                    >
                      {/* Project card with layered design */}
                      <div 
                        className="border-2 grid-p-4 relative overflow-hidden h-full"
                        style={{ 
                          borderColor: '#9B59B6',
                          backgroundColor: 'var(--bg-main)'
                        }}
                      >
                        {/* Animated background gradient on hover */}
                        <motion.div
                          className="absolute inset-0 opacity-0 group-hover:opacity-5 pointer-events-none"
                          style={{ 
                            background: `linear-gradient(135deg, #9B59B6 0%, transparent 70%)`
                          }}
                          whileHover={{ opacity: 0.1 }}
                        />

                        {/* Project number badge */}
                        <div className="absolute top-4 right-4">
                          <div 
                            className="w-12 h-12 border-2 flex items-center justify-center font-mono font-black text-xl"
                            style={{ 
                              borderColor: '#9B59B6',
                              backgroundColor: 'rgba(155, 89, 182, 0.1)',
                              color: '#9B59B6'
                            }}
                          >
                            {String(index + 1).padStart(2, '0')}
                          </div>
                        </div>

                        {/* Header section */}
                        <div className="grid-mb-3 pr-16">
                          <div 
                            className="text-[10px] font-mono font-bold uppercase tracking-widest grid-mb-1"
                            style={{ color: '#9B59B6' }}
                          >
                            CASE STUDY #{String(index + 1).padStart(2, '0')}
                          </div>
                          <h3 
                            className={`font-mono font-black uppercase leading-tight ${isLarge ? 'text-2xl' : 'text-xl'}`}
                            style={{ color: 'var(--text-main)' }}
                          >
                            {project.title}
                          </h3>
                          <div className="flex items-center gap-2 grid-mt-2">
                            <span 
                              className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 border-2"
                              style={{ 
                                borderColor: project.status === 'completed' ? '#10B981' : '#F59E0B',
                                backgroundColor: project.status === 'completed' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                                color: project.status === 'completed' ? '#10B981' : '#F59E0B'
                              }}
                            >
                              {project.status.toUpperCase().replace('-', ' ')}
                            </span>
                            {project.metrics?.impact && (
                              <span 
                                className="text-[10px] font-mono uppercase"
                                style={{ color: 'var(--text-muted)' }}
                              >
                                Impact: {project.metrics.impact}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Description */}
                        <p 
                          className={`font-mono leading-relaxed grid-mb-4 ${isLarge ? 'text-sm' : 'text-xs'}`}
                          style={{ color: 'var(--text-main)' }}
                        >
                          {project.description}
                        </p>

                        {/* Features as visual list */}
                        <div className="grid-mb-4">
                          <div 
                            className="text-[10px] font-mono font-bold uppercase tracking-wider grid-mb-2"
                            style={{ color: 'var(--text-muted)' }}
                          >
                            KEY FEATURES
                          </div>
                          <div className={`grid gap-2 ${isLarge ? 'grid-cols-2' : 'grid-cols-1'}`}>
                            {project.features.map((feature, featIndex) => (
                              <motion.div
                                key={`${project.id}-${feature}`}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 + index * 0.1 + featIndex * 0.05 }}
                                className="flex items-start gap-2"
                              >
                                <div 
                                  className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                                  style={{ backgroundColor: '#9B59B6' }}
                                />
                                <span 
                                  className="text-xs font-mono leading-relaxed"
                                  style={{ color: 'var(--text-main)' }}
                                >
                                  {feature}
                                </span>
                              </motion.div>
                            ))}
                          </div>
                        </div>

                        {/* Tech stack as connected chain */}
                        <div className="flex flex-wrap items-center gap-2">
                          <div 
                            className="text-[10px] font-mono font-bold uppercase tracking-wider"
                            style={{ color: 'var(--text-muted)' }}
                          >
                            STACK:
                          </div>
                          {project.technologies.map((tech, techIndex) => (
                            <React.Fragment key={tech}>
                              <motion.span
                                whileHover={{ scale: 1.15, y: -2 }}
                                className="text-[10px] font-mono font-bold uppercase px-2 py-1 border-2"
                                style={{ 
                                  borderColor: '#9B59B6',
                                  backgroundColor: techIndex % 2 === 0 ? 'rgba(155, 89, 182, 0.1)' : 'transparent',
                                  color: '#9B59B6'
                                }}
                              >
                                {tech}
                              </motion.span>
                              {techIndex < project.technologies.length - 1 && (
                                <span 
                                  className="text-[10px] font-mono"
                                  style={{ color: 'var(--text-muted)' }}
                                >
                                  +
                                </span>
                              )}
                            </React.Fragment>
                          ))}
                        </div>

                        {/* Category badge */}
                        <div className="absolute bottom-4 right-4">
                          <div 
                            className="text-[8px] font-mono font-black uppercase px-2 py-1 border"
                            style={{ 
                              borderColor: 'var(--border-color)',
                              backgroundColor: 'var(--bg-card)',
                              color: 'var(--text-muted)'
                            }}
                          >
                            {project.category.toUpperCase()}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.section>

        {/* === CONTACT === */}
        <motion.section
          id="contact"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="grid-mb-3"
        >
          <div 
            className="border-2 overflow-hidden relative"
            style={{ borderColor: 'var(--border-color)' }}
          >
            {/* Header with wave pattern */}
            <div 
              className="grid-p-1 flex items-center gap-2 relative overflow-hidden"
              style={{ backgroundColor: '#1ABC9C' }}
            >
              <div 
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0)`,
                  backgroundSize: '20px 20px'
                }}
              />
              <PixelIcon name="envelope" size={20} className="text-white relative z-10" />
              <h2 className="text-sm font-mono font-black uppercase tracking-wider text-white relative z-10">
                Contact
              </h2>
            </div>

            {/* Interactive contact card layout */}
            <div 
              className="grid-p-4"
              style={{ backgroundColor: 'var(--bg-card)' }}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Primary Contact Card - Email */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  whileHover={{ scale: 1.02, y: -4 }}
                  className="md:col-span-2 border-2 grid-p-4 relative overflow-hidden group"
                  style={{ 
                    borderColor: '#1ABC9C',
                    backgroundColor: 'var(--bg-main)'
                  }}
                >
                  {/* Animated background */}
                  <motion.div
                    className="absolute inset-0 opacity-0 group-hover:opacity-5 pointer-events-none"
                    style={{ 
                      background: `linear-gradient(135deg, #1ABC9C 0%, transparent 70%)`
                    }}
                    whileHover={{ opacity: 0.1 }}
                  />

                  {/* Email section */}
                  <div className="relative z-10">
                    <div 
                      className="text-[10px] font-mono font-bold uppercase tracking-widest grid-mb-2"
                      style={{ color: '#1ABC9C' }}
                    >
                      PRIMARY CONTACT
                    </div>
                    <motion.a
                      href={`mailto:${portfolioData.contact.email}`}
                      whileHover={{ x: 4 }}
                      className="flex items-center gap-3 group/email"
                    >
                      <div 
                        className="w-16 h-16 border-2 flex items-center justify-center text-2xl"
                        style={{ 
                          borderColor: '#1ABC9C',
                          backgroundColor: 'rgba(26, 188, 156, 0.1)'
                        }}
                      >
                        ✉
                      </div>
                      <div className="flex-1">
                        <div 
                          className="text-xs font-mono uppercase grid-mb-1"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          EMAIL ADDRESS
                        </div>
                        <div 
                          className="text-lg font-mono font-black break-all"
                          style={{ color: 'var(--text-main)' }}
                        >
                          {portfolioData.contact.email}
                        </div>
                      </div>
                      <div 
                        className="text-xl opacity-0 group-hover/email:opacity-100 transition-opacity"
                        style={{ color: '#1ABC9C' }}
                      >
                        →
                      </div>
                    </motion.a>

                    {/* Availability badge */}
                    <div className="flex items-center gap-2 grid-mt-4">
                      <div 
                        className="w-2 h-2 rounded-full animate-pulse"
                        style={{ backgroundColor: '#10B981' }}
                      />
                      <span 
                        className="text-xs font-mono font-bold uppercase"
                        style={{ color: '#10B981' }}
                      >
                        {portfolioData.contact.availability.toUpperCase().replace('-', ' ')} FOR NEW PROJECTS
                      </span>
                    </div>

                    {/* Preferred contact method */}
                    <div className="grid-mt-3 pt-3 border-t" style={{ borderColor: 'var(--border-color)' }}>
                      <div 
                        className="text-[10px] font-mono uppercase grid-mb-1"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        PREFERRED METHOD
                      </div>
                      <div 
                        className="text-sm font-mono font-bold uppercase"
                        style={{ color: 'var(--text-main)' }}
                      >
                        {portfolioData.contact.preferredContact === 'email' ? '📧 EMAIL' : portfolioData.contact.preferredContact.toUpperCase()}
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Info Cards Grid */}
                <div className="grid grid-cols-1 gap-3">
                  {/* Location Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    whileHover={{ scale: 1.05, y: -2 }}
                    className="border-2 grid-p-3 relative overflow-hidden group"
                    style={{ 
                      borderColor: '#1ABC9C',
                      backgroundColor: 'var(--bg-main)'
                    }}
                  >
                    <div 
                      className="text-[10px] font-mono font-bold uppercase tracking-wider grid-mb-2"
                      style={{ color: '#1ABC9C' }}
                    >
                      📍 LOCATION
                    </div>
                    <div 
                      className="text-sm font-mono font-bold"
                      style={{ color: 'var(--text-main)' }}
                    >
                      {portfolioData.contact.location}
                    </div>
                  </motion.div>

                  {/* Response Time Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    whileHover={{ scale: 1.05, y: -2 }}
                    className="border-2 grid-p-3 relative overflow-hidden group"
                    style={{ 
                      borderColor: '#1ABC9C',
                      backgroundColor: 'var(--bg-main)'
                    }}
                  >
                    <div 
                      className="text-[10px] font-mono font-bold uppercase tracking-wider grid-mb-2"
                      style={{ color: '#1ABC9C' }}
                    >
                      ⏱ RESPONSE TIME
                    </div>
                    <div 
                      className="text-sm font-mono font-bold"
                      style={{ color: 'var(--text-main)' }}
                    >
                      {portfolioData.contact.responseTime}
                    </div>
                  </motion.div>

                  {/* Timezone Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    whileHover={{ scale: 1.05, y: -2 }}
                    className="border-2 grid-p-3 relative overflow-hidden group"
                    style={{ 
                      borderColor: '#1ABC9C',
                      backgroundColor: 'var(--bg-main)'
                    }}
                  >
                    <div 
                      className="text-[10px] font-mono font-bold uppercase tracking-wider grid-mb-2"
                      style={{ color: '#1ABC9C' }}
                    >
                      🌐 TIMEZONE
                    </div>
                    <div 
                      className="text-sm font-mono font-bold"
                      style={{ color: 'var(--text-main)' }}
                    >
                      {portfolioData.contact.timezone}
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Social Links Section */}
              <div className="grid-mt-4 pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
                <div 
                  className="text-[10px] font-mono font-bold uppercase tracking-wider grid-mb-3 text-center"
                  style={{ color: 'var(--text-muted)' }}
                >
                  CONNECT ON SOCIAL
                </div>
                <div className="flex flex-wrap justify-center gap-3">
                  {portfolioData.social.linkedin && (
                    <motion.a
                      href={portfolioData.social.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.1, y: -4 }}
                      whileTap={{ scale: 0.95 }}
                      className="border-2 grid-p-3 flex items-center gap-3 group/social"
                      style={{ 
                        borderColor: '#1ABC9C',
                        backgroundColor: 'var(--bg-main)'
                      }}
                    >
                      <div 
                        className="w-10 h-10 border-2 flex items-center justify-center text-lg"
                        style={{ 
                          borderColor: '#1ABC9C',
                          backgroundColor: 'rgba(26, 188, 156, 0.1)'
                        }}
                      >
                        in
                      </div>
                      <span 
                        className="text-xs font-mono font-bold uppercase"
                        style={{ color: 'var(--text-main)' }}
                      >
                        LINKEDIN
                      </span>
                      <span 
                        className="text-sm opacity-0 group-hover/social:opacity-100 transition-opacity"
                        style={{ color: '#1ABC9C' }}
                      >
                        →
                      </span>
                    </motion.a>
                  )}
                  {portfolioData.social.github && (
                    <motion.a
                      href={portfolioData.social.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.1, y: -4 }}
                      whileTap={{ scale: 0.95 }}
                      className="border-2 grid-p-3 flex items-center gap-3 group/social"
                      style={{ 
                        borderColor: '#1ABC9C',
                        backgroundColor: 'var(--bg-main)'
                      }}
                    >
                      <div 
                        className="w-10 h-10 border-2 flex items-center justify-center"
                        style={{ 
                          borderColor: '#1ABC9C',
                          backgroundColor: 'rgba(26, 188, 156, 0.1)'
                        }}
                      >
                        <PixelIcon name="code" size={20} style={{ color: '#1ABC9C' }} />
                      </div>
                      <span 
                        className="text-xs font-mono font-bold uppercase"
                        style={{ color: 'var(--text-main)' }}
                      >
                        GITHUB
                      </span>
                      <span 
                        className="text-sm opacity-0 group-hover/social:opacity-100 transition-opacity"
                        style={{ color: '#1ABC9C' }}
                      >
                        →
                      </span>
                    </motion.a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* === YOUR MISSION === (Hidden in content mode) */}
        {!isContentMode && (
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
                    <div className="text-2xl grid-mb-1">🎯</div>
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
        )}

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
      
      {/* Fixed Bottom Right Character */}
      <FixedCharacterHelper />
    </div>
  );
}
