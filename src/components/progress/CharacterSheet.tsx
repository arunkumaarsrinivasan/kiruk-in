'use client';

import { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getLifeProgress,
  lifeStats,
  getAge,
  getBookStats,
  getGameStats,
  getTravelStats,
  getTrekStats,
  treks,
  games,
  books,
  travelLocations,
} from '@/data/life-progress-data';

// ============================================================================
// CHARACTER CLASS SYSTEM
// ============================================================================

type CharacterClass = 'Explorer' | 'Scholar' | 'Gamer' | 'Adventurer';

interface CharacterStat {
  name: string;
  shortName: string;
  value: number;
  maxValue: number;
  color: string;
  icon: string;
  description: string;
}

function getCharacterClass(): { class: CharacterClass; title: string; description: string } {
  const trekStats = getTrekStats();
  const gameStats = getGameStats();
  const bookStats = getBookStats();
  const travelStats = getTravelStats();

  const scores = {
    Explorer: travelStats.totalLocations * 3 + travelStats.statesVisited * 5,
    Scholar: bookStats.total * 10 + bookStats.completed * 5,
    Gamer: gameStats.completed * 5 + gameStats.totalHours * 0.5,
    Adventurer: trekStats.totalTreks * 8 + trekStats.totalDistance * 0.3,
  };

  const topClass = (Object.entries(scores).sort(([, a], [, b]) => b - a)[0][0]) as CharacterClass;

  const titles: Record<CharacterClass, { title: string; description: string }> = {
    Explorer: { title: 'Wandering Explorer', description: 'Maps uncharted territories and discovers hidden paths' },
    Scholar: { title: 'Knowledge Seeker', description: 'Absorbs wisdom from ancient tomes and modern texts' },
    Gamer: { title: 'Digital Champion', description: 'Masters virtual realms and conquers digital challenges' },
    Adventurer: { title: 'Mountain Strider', description: 'Scales peaks and traverses wilderness trails' },
  };

  return { class: topClass, ...titles[topClass] };
}

function getCharacterLevel(): { level: number; xp: number; xpToNext: number; totalXp: number } {
  const trekStats = getTrekStats();
  const gameStats = getGameStats();
  const bookStats = getBookStats();
  const travelStats = getTravelStats();

  const totalXp =
    trekStats.totalTreks * 150 +
    trekStats.totalDistance * 5 +
    gameStats.completed * 100 +
    gameStats.totalHours * 2 +
    bookStats.completed * 200 +
    bookStats.reading * 50 +
    travelStats.totalLocations * 75 +
    travelStats.statesVisited * 100 +
    getAge(lifeStats.birthDate) * 50;

  // Level curve: each level needs progressively more XP
  let level = 1;
  let xpRemaining = totalXp;
  let xpForLevel = 500;

  while (xpRemaining >= xpForLevel) {
    xpRemaining -= xpForLevel;
    level++;
    xpForLevel = Math.floor(xpForLevel * 1.15);
  }

  return { level, xp: xpRemaining, xpToNext: xpForLevel, totalXp };
}

function getCharacterStats(): CharacterStat[] {
  const trekStats = getTrekStats();
  const gameStats = getGameStats();
  const bookStats = getBookStats();
  const travelStats = getTravelStats();

  const maxStat = 100;

  return [
    {
      name: 'Strength',
      shortName: 'STR',
      value: Math.min(maxStat, Math.round(trekStats.totalDistance * 0.8 + trekStats.totalTreks * 4)),
      maxValue: maxStat,
      color: '#EF4444',
      icon: '⚔️',
      description: `${trekStats.totalDistance}km trekked across ${trekStats.totalTreks} expeditions`,
    },
    {
      name: 'Dexterity',
      shortName: 'DEX',
      value: Math.min(maxStat, Math.round(gameStats.totalHours * 0.25 + gameStats.completed * 6)),
      maxValue: maxStat,
      color: '#F59E0B',
      icon: '🎮',
      description: `${gameStats.totalHours}h gaming, ${gameStats.completed} games mastered`,
    },
    {
      name: 'Intelligence',
      shortName: 'INT',
      value: Math.min(maxStat, Math.round(bookStats.total * 15 + bookStats.completed * 10)),
      maxValue: maxStat,
      color: '#3B82F6',
      icon: '📚',
      description: `${bookStats.total} books explored, ${bookStats.completed} completed`,
    },
    {
      name: 'Wisdom',
      shortName: 'WIS',
      value: Math.min(maxStat, Math.round(travelStats.totalLocations * 2.5 + travelStats.statesVisited * 5)),
      maxValue: maxStat,
      color: '#8B5CF6',
      icon: '🗺️',
      description: `${travelStats.totalLocations} locations, ${travelStats.statesVisited} states explored`,
    },
    {
      name: 'Spirit',
      shortName: 'SPR',
      value: Math.min(maxStat, Math.round(trekStats.highestElevation * 0.015 + trekStats.totalTreks * 3)),
      maxValue: maxStat,
      color: '#10B981',
      icon: '🏔️',
      description: `Peak elevation: ${trekStats.highestElevation}m, ${trekStats.totalTreks} summits`,
    },
    {
      name: 'Charisma',
      shortName: 'CHA',
      value: Math.min(maxStat, Math.round(getAge(lifeStats.birthDate) * 3 + travelStats.statesVisited * 3)),
      maxValue: maxStat,
      color: '#EC4899',
      icon: '✨',
      description: `${getAge(lifeStats.birthDate)} years of life experience`,
    },
  ];
}

// ============================================================================
// PIXEL CHARACTER AVATAR
// ============================================================================

function PixelCharacterAvatar({ characterClass, level }: { characterClass: CharacterClass; level: number }) {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setFrame(f => (f + 1) % 2);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  const classColors: Record<CharacterClass, { primary: string; secondary: string; accent: string }> = {
    Explorer: { primary: '#F59E0B', secondary: '#92400E', accent: '#FDE68A' },
    Scholar: { primary: '#3B82F6', secondary: '#1E3A8A', accent: '#93C5FD' },
    Gamer: { primary: '#8B5CF6', secondary: '#4C1D95', accent: '#C4B5FD' },
    Adventurer: { primary: '#10B981', secondary: '#064E3B', accent: '#6EE7B7' },
  };

  const colors = classColors[characterClass];
  const breatheOffset = frame === 0 ? 0 : -2;

  return (
    <div className="relative w-48 h-64 mx-auto">
      {/* Glow effect behind character */}
      <div
        className="absolute inset-0 blur-3xl opacity-30"
        style={{ backgroundColor: colors.primary }}
      />

      {/* Character SVG */}
      <svg
        viewBox="0 0 96 128"
        className="w-full h-full relative z-10"
        style={{ imageRendering: 'pixelated' }}
      >
        {/* Shadow */}
        <ellipse cx="48" cy="120" rx="20" ry="5" fill="rgba(0,0,0,0.3)" />

        {/* Feet */}
        <rect x="34" y={108 + breatheOffset} width="10" height="8" fill="#374151" />
        <rect x="52" y={108 + breatheOffset} width="10" height="8" fill="#374151" />

        {/* Legs */}
        <rect x="36" y={96 + breatheOffset} width="8" height="14" fill={colors.secondary} />
        <rect x="52" y={96 + breatheOffset} width="8" height="14" fill={colors.secondary} />

        {/* Body */}
        <rect x="30" y={64 + breatheOffset} width="36" height="34" rx="2" fill={colors.primary} />

        {/* Belt */}
        <rect x="30" y={92 + breatheOffset} width="36" height="6" fill={colors.secondary} />
        <rect x="44" y={92 + breatheOffset} width="8" height="6" fill={colors.accent} />

        {/* Arms */}
        <rect x={20 + (frame === 0 ? 0 : -2)} y={68 + breatheOffset} width="10" height="24" rx="2" fill={colors.primary} />
        <rect x={66 + (frame === 0 ? 0 : 2)} y={68 + breatheOffset} width="10" height="24" rx="2" fill={colors.primary} />

        {/* Hands */}
        <rect x={20 + (frame === 0 ? 0 : -2)} y={90 + breatheOffset} width="10" height="6" fill="#FDBF60" />
        <rect x={66 + (frame === 0 ? 0 : 2)} y={90 + breatheOffset} width="10" height="6" fill="#FDBF60" />

        {/* Chest emblem */}
        <rect x="42" y={72 + breatheOffset} width="12" height="12" fill={colors.accent} opacity={0.6} />
        <text
          x="48"
          y={82 + breatheOffset}
          textAnchor="middle"
          fontSize="8"
          fill={colors.secondary}
          fontFamily="monospace"
          fontWeight="bold"
        >
          {level}
        </text>

        {/* Neck */}
        <rect x="42" y={58 + breatheOffset} width="12" height="8" fill="#FDBF60" />

        {/* Head */}
        <rect x="34" y={36 + breatheOffset} width="28" height="24" rx="3" fill="#FDBF60" />

        {/* Hair */}
        <rect x="32" y={32 + breatheOffset} width="32" height="10" rx="2" fill="#4A4A4A" />
        <rect x="32" y={36 + breatheOffset} width="6" height="16" fill="#4A4A4A" />
        <rect x="58" y={36 + breatheOffset} width="6" height="16" fill="#4A4A4A" />

        {/* Eyes */}
        <rect x="40" y={44 + breatheOffset} width="4" height={frame === 0 ? 4 : 2} fill="#1F2937" />
        <rect x="52" y={44 + breatheOffset} width="4" height={frame === 0 ? 4 : 2} fill="#1F2937" />

        {/* Mouth */}
        <rect x="44" y={52 + breatheOffset} width="8" height="2" fill="#B45309" />

        {/* Class-specific hat/accessory */}
        {characterClass === 'Explorer' && (
          <>
            <rect x="30" y={28 + breatheOffset} width="36" height="6" fill="#92400E" />
            <rect x="36" y={22 + breatheOffset} width="24" height="8" fill="#92400E" />
          </>
        )}
        {characterClass === 'Scholar' && (
          <>
            <rect x="34" y={24 + breatheOffset} width="28" height="10" fill="#1E3A8A" />
            <rect x="44" y={18 + breatheOffset} width="8" height="8" fill="#FDE68A" />
          </>
        )}
        {characterClass === 'Gamer' && (
          <>
            <rect x="32" y={28 + breatheOffset} width="32" height="6" fill="#4C1D95" />
            <rect x="36" y={24 + breatheOffset} width="24" height="6" fill="#4C1D95" />
            <rect x="56" y={24 + breatheOffset} width="4" height="4" fill="#C4B5FD" />
          </>
        )}
        {characterClass === 'Adventurer' && (
          <>
            <rect x="30" y={28 + breatheOffset} width="36" height="6" fill="#064E3B" />
            <rect x="36" y={22 + breatheOffset} width="24" height="8" fill="#064E3B" />
            <rect x="44" y={18 + breatheOffset} width="8" height="6" fill="#10B981" />
          </>
        )}

        {/* Weapon/Item based on class */}
        {characterClass === 'Adventurer' && (
          <>
            {/* Hiking stick */}
            <rect x={14 + (frame === 0 ? 0 : -2)} y={60 + breatheOffset} width="3" height="50" fill="#92400E" />
            <rect x={13 + (frame === 0 ? 0 : -2)} y={58 + breatheOffset} width="5" height="4" fill="#6B7280" />
          </>
        )}
        {characterClass === 'Explorer' && (
          <>
            {/* Compass */}
            <circle cx={73 + (frame === 0 ? 0 : 2)} cy={84 + breatheOffset} r="6" fill="#6B7280" />
            <circle cx={73 + (frame === 0 ? 0 : 2)} cy={84 + breatheOffset} r="4" fill="#F3F4F6" />
            <line x1={73 + (frame === 0 ? 0 : 2)} y1={80 + breatheOffset} x2={73 + (frame === 0 ? 0 : 2)} y2={84 + breatheOffset} stroke="#EF4444" strokeWidth="1.5" />
          </>
        )}
        {characterClass === 'Scholar' && (
          <>
            {/* Book */}
            <rect x={68 + (frame === 0 ? 0 : 2)} y={80 + breatheOffset} width="10" height="12" fill="#3B82F6" />
            <rect x={69 + (frame === 0 ? 0 : 2)} y={81 + breatheOffset} width="8" height="10" fill="#DBEAFE" />
            <rect x={73 + (frame === 0 ? 0 : 2)} y={80 + breatheOffset} width="1" height="12" fill="#1E3A8A" />
          </>
        )}
        {characterClass === 'Gamer' && (
          <>
            {/* Controller */}
            <rect x={68 + (frame === 0 ? 0 : 2)} y={82 + breatheOffset} width="12" height="8" rx="2" fill="#4C1D95" />
            <rect x={70 + (frame === 0 ? 0 : 2)} y={84 + breatheOffset} width="2" height="2" fill="#C4B5FD" />
            <rect x={76 + (frame === 0 ? 0 : 2)} y={84 + breatheOffset} width="2" height="2" fill="#C4B5FD" />
          </>
        )}
      </svg>

      {/* Level badge */}
      <motion.div
        className="absolute -top-2 -right-2 w-12 h-12 flex items-center justify-center z-20"
        style={{
          background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
          border: `2px solid ${colors.accent}`,
          borderRadius: '50%',
          boxShadow: `0 0 20px ${colors.primary}60`,
        }}
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <span className="font-mono font-bold text-white text-sm">
          LV{level}
        </span>
      </motion.div>
    </div>
  );
}

// ============================================================================
// STAT BAR COMPONENT
// ============================================================================

function StatBar({ stat, delay }: { stat: CharacterStat; delay: number }) {
  const [hovered, setHovered] = useState(false);
  const percentage = (stat.value / stat.maxValue) * 100;

  // Generate dot markers for the stat bar
  const dots = Array.from({ length: 10 }, (_, i) => ({
    filled: percentage >= (i + 1) * 10,
    position: (i + 1) * 10,
  }));

  return (
    <motion.div
      className="group relative"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.4 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex items-center gap-3">
        {/* Icon & Label */}
        <div className="w-8 text-center text-lg">{stat.icon}</div>
        <div className="w-10">
          <span
            className="font-mono text-xs font-bold uppercase tracking-wider"
            style={{ color: stat.color }}
          >
            {stat.shortName}
          </span>
        </div>

        {/* Bar container */}
        <div className="flex-1 relative h-5">
          {/* Background */}
          <div
            className="absolute inset-0"
            style={{
              backgroundColor: 'var(--bg-main)',
              border: '1px solid var(--border-color)',
            }}
          />

          {/* Fill */}
          <motion.div
            className="absolute inset-y-0 left-0"
            style={{
              backgroundColor: stat.color,
              opacity: 0.8,
            }}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ delay: delay + 0.2, duration: 0.8, ease: 'easeOut' }}
          />

          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-y-0 left-0 w-full"
            style={{
              background: `linear-gradient(90deg, transparent 0%, ${stat.color}30 50%, transparent 100%)`,
              backgroundSize: '200% 100%',
            }}
            animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
            transition={{ repeat: Infinity, duration: 3, delay: delay + 1 }}
          />

          {/* Dot markers */}
          <div className="absolute inset-0 flex items-center">
            {dots.map((dot, i) => (
              <div
                key={i}
                className="absolute w-px h-full"
                style={{
                  left: `${dot.position}%`,
                  backgroundColor: 'var(--bg-card)',
                  opacity: 0.3,
                }}
              />
            ))}
          </div>
        </div>

        {/* Value */}
        <div className="w-12 text-right">
          <span
            className="font-mono text-sm font-bold"
            style={{ color: stat.color }}
          >
            {stat.value}
          </span>
        </div>
      </div>

      {/* Tooltip on hover */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            className="absolute left-12 -top-8 z-50 px-3 py-1.5 font-mono text-xs whitespace-nowrap"
            style={{
              backgroundColor: 'var(--bg-card)',
              border: `1px solid ${stat.color}`,
              color: 'var(--text-main)',
              boxShadow: `0 0 10px ${stat.color}40`,
            }}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
          >
            {stat.description}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ============================================================================
// XP BAR COMPONENT
// ============================================================================

function XPBar({ xp, xpToNext, level }: { xp: number; xpToNext: number; level: number }) {
  const percentage = (xp / xpToNext) * 100;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1">
        <span
          className="font-mono text-xs uppercase tracking-wider"
          style={{ color: 'var(--text-muted)' }}
        >
          LV {level}
        </span>
        <span
          className="font-mono text-xs"
          style={{ color: 'var(--accent-color)' }}
        >
          {xp} / {xpToNext} XP
        </span>
        <span
          className="font-mono text-xs uppercase tracking-wider"
          style={{ color: 'var(--text-muted)' }}
        >
          LV {level + 1}
        </span>
      </div>
      <div
        className="relative h-3 overflow-hidden"
        style={{
          backgroundColor: 'var(--bg-main)',
          border: '1px solid var(--border-color)',
        }}
      >
        <motion.div
          className="absolute inset-y-0 left-0"
          style={{
            background: 'linear-gradient(90deg, #F59E0B, #EF4444, #F59E0B)',
            backgroundSize: '200% 100%',
          }}
          initial={{ width: 0 }}
          animate={{
            width: `${percentage}%`,
            backgroundPosition: ['0% 0', '200% 0'],
          }}
          transition={{
            width: { duration: 1.2, ease: 'easeOut' },
            backgroundPosition: { repeat: Infinity, duration: 2 },
          }}
        />

        {/* Notch markers */}
        {[25, 50, 75].map(mark => (
          <div
            key={mark}
            className="absolute top-0 bottom-0 w-px"
            style={{
              left: `${mark}%`,
              backgroundColor: 'var(--border-color)',
              opacity: 0.5,
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// MAIN CHARACTER SHEET COMPONENT
// ============================================================================

export function CharacterSheet() {
  const characterClass = useMemo(() => getCharacterClass(), []);
  const levelData = useMemo(() => getCharacterLevel(), []);
  const stats = useMemo(() => getCharacterStats(), []);
  const lifeProgress = useMemo(() => getLifeProgress(), []);

  const [selectedStat, setSelectedStat] = useState<number | null>(null);

  // Calculate total stat points
  const totalStatPoints = stats.reduce((sum, s) => sum + s.value, 0);
  const maxStatPoints = stats.length * 100;

  return (
    <motion.div
      className="relative overflow-hidden"
      style={{
        backgroundColor: 'var(--bg-card)',
        border: 'var(--border-width) solid var(--border-color)',
      }}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Dark overlay pattern - game UI feel */}
      <div
        className="absolute inset-0 pointer-events-none opacity-5"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 50%, var(--accent-color) 0%, transparent 50%),
            radial-gradient(circle at 80% 50%, var(--accent-color) 0%, transparent 50%)
          `,
        }}
      />

      {/* Header Banner */}
      <div
        className="relative px-6 py-4"
        style={{
          borderBottom: '2px solid var(--border-color)',
          background: 'linear-gradient(90deg, var(--bg-main) 0%, var(--bg-card) 50%, var(--bg-main) 100%)',
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2
              className="text-3xl font-mono font-bold uppercase tracking-wider"
              style={{ color: 'var(--text-main)' }}
            >
              Character Sheet
            </h2>
            <p
              className="font-mono text-sm mt-1"
              style={{ color: 'var(--text-muted)' }}
            >
              The journey of a lifetime, gamified
            </p>
          </div>
          <div className="text-right">
            <div
              className="font-mono text-xs uppercase tracking-wider"
              style={{ color: 'var(--text-muted)' }}
            >
              Total Power
            </div>
            <motion.div
              className="text-3xl font-mono font-bold"
              style={{ color: 'var(--accent-color)' }}
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ repeat: Infinity, duration: 3 }}
            >
              {totalStatPoints}
              <span className="text-sm opacity-50">/{maxStatPoints}</span>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT: Character Info + Class */}
          <div className="space-y-6">
            {/* Character Name & Class */}
            <div
              className="p-4 text-center"
              style={{
                backgroundColor: 'var(--bg-main)',
                border: '1px solid var(--border-color)',
              }}
            >
              <motion.div
                className="font-mono text-xs uppercase tracking-widest mb-1"
                style={{ color: 'var(--accent-color)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {characterClass.class}
              </motion.div>
              <h3
                className="text-2xl font-mono font-bold"
                style={{ color: 'var(--text-main)' }}
              >
                Arun Kumar R
              </h3>
              <p
                className="font-mono text-sm mt-1"
                style={{ color: 'var(--text-muted)' }}
              >
                {characterClass.title}
              </p>
              <p
                className="font-mono text-xs mt-2 italic"
                style={{ color: 'var(--text-muted)' }}
              >
                &ldquo;{characterClass.description}&rdquo;
              </p>
            </div>

            {/* Character Avatar */}
            <div
              className="p-4"
              style={{
                backgroundColor: 'var(--bg-main)',
                border: '1px solid var(--border-color)',
              }}
            >
              <PixelCharacterAvatar
                characterClass={characterClass.class}
                level={levelData.level}
              />
            </div>

            {/* Quick Info */}
            <div
              className="p-4 space-y-3"
              style={{
                backgroundColor: 'var(--bg-main)',
                border: '1px solid var(--border-color)',
              }}
            >
              <InfoRow label="Age" value={`${getAge(lifeStats.birthDate)} years`} icon="🎂" />
              <InfoRow label="Origin" value={lifeStats.homeLocation} icon="🏠" />
              <InfoRow label="Base" value={lifeStats.currentLocation} icon="📍" />
              <InfoRow label="Days Active" value={lifeProgress.daysLived.toLocaleString()} icon="📅" />
              <InfoRow label="Life Progress" value={`${lifeProgress.percentage.toFixed(1)}%`} icon="⏳" />
            </div>
          </div>

          {/* CENTER: Stats */}
          <div className="space-y-6">
            {/* XP Bar */}
            <div
              className="p-4"
              style={{
                backgroundColor: 'var(--bg-main)',
                border: '1px solid var(--border-color)',
              }}
            >
              <div className="text-center mb-3">
                <span
                  className="font-mono text-xs uppercase tracking-widest"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Experience Points
                </span>
                <div
                  className="text-2xl font-mono font-bold"
                  style={{ color: 'var(--accent-color)' }}
                >
                  {levelData.totalXp.toLocaleString()} XP
                </div>
              </div>
              <XPBar xp={levelData.xp} xpToNext={levelData.xpToNext} level={levelData.level} />
            </div>

            {/* Core Stats */}
            <div
              className="p-4"
              style={{
                backgroundColor: 'var(--bg-main)',
                border: '1px solid var(--border-color)',
              }}
            >
              <h4
                className="font-mono text-sm uppercase tracking-wider mb-4 flex items-center gap-2"
                style={{ color: 'var(--text-main)' }}
              >
                <span>⚡</span> Core Attributes
              </h4>
              <div className="space-y-3">
                {stats.map((stat, i) => (
                  <StatBar key={stat.shortName} stat={stat} delay={0.1 * i} />
                ))}
              </div>
            </div>

            {/* Stat Radar (hexagon visual) */}
            <div
              className="p-4"
              style={{
                backgroundColor: 'var(--bg-main)',
                border: '1px solid var(--border-color)',
              }}
            >
              <h4
                className="font-mono text-sm uppercase tracking-wider mb-4 text-center"
                style={{ color: 'var(--text-main)' }}
              >
                Stat Radar
              </h4>
              <StatRadar stats={stats} />
            </div>
          </div>

          {/* RIGHT: Achievements & Milestones */}
          <div className="space-y-6">
            {/* Active Quests */}
            <div
              className="p-4"
              style={{
                backgroundColor: 'var(--bg-main)',
                border: '1px solid var(--border-color)',
              }}
            >
              <h4
                className="font-mono text-sm uppercase tracking-wider mb-4 flex items-center gap-2"
                style={{ color: 'var(--accent-color)' }}
              >
                <span>📜</span> Active Quests
              </h4>
              <div className="space-y-3">
                <QuestItem
                  title="Read 12 books this year"
                  progress={books.filter(b => b.status === 'completed').length}
                  total={12}
                  icon="📚"
                  xp={200}
                />
                <QuestItem
                  title="Complete 10 games"
                  progress={games.filter(g => g.status === 'completed').length}
                  total={10}
                  icon="🎮"
                  xp={150}
                />
                <QuestItem
                  title="Visit 10 states"
                  progress={getTravelStats().statesVisited}
                  total={10}
                  icon="🗺️"
                  xp={300}
                />
                <QuestItem
                  title="Trek 500km total"
                  progress={Math.round(getTrekStats().totalDistance)}
                  total={500}
                  icon="🥾"
                  xp={500}
                />
                <QuestItem
                  title="Reach 5000m elevation"
                  progress={getTrekStats().highestElevation}
                  total={5000}
                  icon="🏔️"
                  xp={400}
                />
              </div>
            </div>

            {/* Unlocked Titles */}
            <div
              className="p-4"
              style={{
                backgroundColor: 'var(--bg-main)',
                border: '1px solid var(--border-color)',
              }}
            >
              <h4
                className="font-mono text-sm uppercase tracking-wider mb-4 flex items-center gap-2"
                style={{ color: 'var(--accent-color)' }}
              >
                <span>🏅</span> Titles Earned
              </h4>
              <div className="flex flex-wrap gap-2">
                {getUnlockedTitles().map((title, i) => (
                  <motion.div
                    key={title.name}
                    className="px-3 py-1.5 font-mono text-xs"
                    style={{
                      backgroundColor: `${title.color}15`,
                      border: `1px solid ${title.color}40`,
                      color: title.color,
                    }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    whileHover={{ scale: 1.05, boxShadow: `0 0 10px ${title.color}30` }}
                  >
                    {title.icon} {title.name}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Recent Activity Log */}
            <div
              className="p-4"
              style={{
                backgroundColor: 'var(--bg-main)',
                border: '1px solid var(--border-color)',
              }}
            >
              <h4
                className="font-mono text-sm uppercase tracking-wider mb-4 flex items-center gap-2"
                style={{ color: 'var(--accent-color)' }}
              >
                <span>📋</span> Adventure Log
              </h4>
              <div className="space-y-2">
                {getRecentActivity().map((activity, i) => (
                  <motion.div
                    key={i}
                    className="flex items-center gap-2 font-mono text-xs"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + i * 0.08 }}
                  >
                    <span>{activity.icon}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{activity.date}</span>
                    <span style={{ color: 'var(--text-main)' }}>{activity.text}</span>
                    <span
                      className="ml-auto"
                      style={{ color: '#F59E0B' }}
                    >
                      +{activity.xp}xp
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================================
// STAT RADAR (HEXAGON)
// ============================================================================

function StatRadar({ stats }: { stats: CharacterStat[] }) {
  const center = 100;
  const radius = 80;
  const n = stats.length;

  const getPoint = (index: number, value: number) => {
    const angle = (Math.PI * 2 * index) / n - Math.PI / 2;
    const r = (value / 100) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  // Background hexagon rings
  const rings = [20, 40, 60, 80, 100];

  return (
    <svg viewBox="0 0 200 200" className="w-full max-w-[240px] mx-auto">
      {/* Grid rings */}
      {rings.map(ringValue => {
        const points = stats
          .map((_, i) => {
            const p = getPoint(i, ringValue);
            return `${p.x},${p.y}`;
          })
          .join(' ');
        return (
          <polygon
            key={ringValue}
            points={points}
            fill="none"
            stroke="var(--border-color)"
            strokeWidth="0.5"
            opacity={0.3}
          />
        );
      })}

      {/* Axis lines */}
      {stats.map((_, i) => {
        const p = getPoint(i, 100);
        return (
          <line
            key={i}
            x1={center}
            y1={center}
            x2={p.x}
            y2={p.y}
            stroke="var(--border-color)"
            strokeWidth="0.5"
            opacity={0.3}
          />
        );
      })}

      {/* Stat area fill */}
      <motion.polygon
        points={stats.map((s, i) => {
          const p = getPoint(i, s.value);
          return `${p.x},${p.y}`;
        }).join(' ')}
        fill="var(--accent-color)"
        fillOpacity={0.15}
        stroke="var(--accent-color)"
        strokeWidth="2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
      />

      {/* Stat points */}
      {stats.map((stat, i) => {
        const p = getPoint(i, stat.value);
        return (
          <motion.circle
            key={stat.shortName}
            cx={p.x}
            cy={p.y}
            r="4"
            fill={stat.color}
            stroke="var(--bg-card)"
            strokeWidth="2"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.6 + i * 0.1 }}
          />
        );
      })}

      {/* Labels */}
      {stats.map((stat, i) => {
        const p = getPoint(i, 115);
        return (
          <text
            key={stat.shortName}
            x={p.x}
            y={p.y}
            textAnchor="middle"
            dominantBaseline="central"
            className="font-mono"
            style={{ fontSize: '9px', fill: stat.color, fontWeight: 'bold' }}
          >
            {stat.shortName}
          </text>
        );
      })}
    </svg>
  );
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

function InfoRow({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-sm">{icon}</span>
        <span
          className="font-mono text-xs uppercase"
          style={{ color: 'var(--text-muted)' }}
        >
          {label}
        </span>
      </div>
      <span
        className="font-mono text-sm font-bold"
        style={{ color: 'var(--text-main)' }}
      >
        {value}
      </span>
    </div>
  );
}

function QuestItem({
  title,
  progress,
  total,
  icon,
  xp,
}: {
  title: string;
  progress: number;
  total: number;
  icon: string;
  xp: number;
}) {
  const percentage = Math.min(100, (progress / total) * 100);
  const isComplete = progress >= total;

  return (
    <div
      className="p-3"
      style={{
        backgroundColor: isComplete ? 'var(--accent-color)08' : 'var(--bg-card)',
        border: `1px solid ${isComplete ? 'var(--accent-color)' : 'var(--border-color)'}`,
        opacity: isComplete ? 0.8 : 1,
      }}
    >
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className="text-sm">{icon}</span>
          <span
            className="font-mono text-xs"
            style={{
              color: isComplete ? 'var(--accent-color)' : 'var(--text-main)',
              textDecoration: isComplete ? 'line-through' : 'none',
            }}
          >
            {title}
          </span>
        </div>
        <span
          className="font-mono text-xs"
          style={{ color: '#F59E0B' }}
        >
          {isComplete ? '✓' : `+${xp}xp`}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <div
          className="flex-1 h-1.5"
          style={{ backgroundColor: 'var(--border-color)' }}
        >
          <motion.div
            className="h-full"
            style={{
              backgroundColor: isComplete ? '#10B981' : 'var(--accent-color)',
            }}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.8, delay: 0.5 }}
          />
        </div>
        <span
          className="font-mono text-xs"
          style={{ color: 'var(--text-muted)' }}
        >
          {progress}/{total}
        </span>
      </div>
    </div>
  );
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getUnlockedTitles(): Array<{ name: string; icon: string; color: string }> {
  const titles: Array<{ name: string; icon: string; color: string; condition: boolean }> = [
    { name: 'First Steps', icon: '👶', color: '#10B981', condition: true },
    { name: 'Bookworm', icon: '📖', color: '#3B82F6', condition: books.length >= 1 },
    { name: 'Game On', icon: '🎯', color: '#8B5CF6', condition: games.filter(g => g.status === 'completed').length >= 1 },
    { name: 'Trail Blazer', icon: '🥾', color: '#F59E0B', condition: treks.length >= 5 },
    { name: 'Peak Hunter', icon: '🏔️', color: '#EF4444', condition: getTrekStats().highestElevation >= 3000 },
    { name: 'Wanderer', icon: '🌍', color: '#06B6D4', condition: getTravelStats().statesVisited >= 5 },
    { name: 'Indie Connoisseur', icon: '🎮', color: '#EC4899', condition: games.filter(g => g.status === 'completed').length >= 5 },
    { name: 'Endurance', icon: '⚡', color: '#F59E0B', condition: getTrekStats().totalDistance >= 200 },
    { name: 'Explorer X', icon: '🗺️', color: '#14B8A6', condition: travelLocations.length >= 20 },
    { name: 'Summit Seeker', icon: '⛰️', color: '#7C3AED', condition: getTrekStats().highestElevation >= 4000 },
    { name: 'Century Gamer', icon: '💯', color: '#F97316', condition: getGameStats().totalHours >= 100 },
  ];

  return titles.filter(t => t.condition).map(({ name, icon, color }) => ({ name, icon, color }));
}

function getRecentActivity(): Array<{ icon: string; date: string; text: string; xp: number }> {
  const activities: Array<{ icon: string; date: string; text: string; xp: number; sortDate: string }> = [];

  // Treks with dates
  treks.forEach(trek => {
    if (trek.date) {
      activities.push({
        icon: '🥾',
        date: trek.date,
        text: `Completed ${trek.name}`,
        xp: Math.round(trek.distance * 5 + trek.elevation * 0.02),
        sortDate: trek.date,
      });
    }
  });

  // Games completed
  games.filter(g => g.status === 'completed').forEach(game => {
    activities.push({
      icon: '🎮',
      date: '—',
      text: `Mastered ${game.title}`,
      xp: 100 + (game.hoursPlayed || 0) * 2,
      sortDate: '2024-01',
    });
  });

  // Books
  books.filter(b => b.startDate).forEach(book => {
    activities.push({
      icon: '📚',
      date: book.startDate!,
      text: `${book.status === 'reading' ? 'Reading' : 'Read'} ${book.title}`,
      xp: 50,
      sortDate: book.startDate!,
    });
  });

  return activities
    .sort((a, b) => b.sortDate.localeCompare(a.sortDate))
    .slice(0, 8);
}

export default CharacterSheet;
