'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  games,
  books,
  treks,
  travelLocations,
  getTrekStats,
  getGameStats,
  getBookStats,
  getTravelStats,
} from '@/data/life-progress-data';

// ============================================================================
// TYPES
// ============================================================================

interface Skill {
  id: string;
  name: string;
  icon: string;
  description: string;
  category: SkillCategory;
  unlocked: boolean;
  level: number; // 0-3 (locked, bronze, silver, gold)
  color: string;
  requirement: string;
}

type SkillCategory = 'exploration' | 'combat' | 'wisdom' | 'mastery' | 'endurance' | 'social';

const categoryMeta: Record<SkillCategory, { label: string; icon: string; color: string }> = {
  exploration: { label: 'Exploration', icon: '🗺️', color: '#06B6D4' },
  combat: { label: 'Combat', icon: '⚔️', color: '#EF4444' },
  wisdom: { label: 'Wisdom', icon: '📚', color: '#3B82F6' },
  mastery: { label: 'Mastery', icon: '🎮', color: '#8B5CF6' },
  endurance: { label: 'Endurance', icon: '🥾', color: '#F59E0B' },
  social: { label: 'Social', icon: '✨', color: '#EC4899' },
};

// ============================================================================
// SKILL GENERATION FROM LIFE DATA
// ============================================================================

function generateSkills(): Skill[] {
  const trekStats = getTrekStats();
  const gameStats = getGameStats();
  const bookStats = getBookStats();
  const travelStats = getTravelStats();

  const skills: Skill[] = [
    // EXPLORATION skills
    {
      id: 'exp-1', name: 'Pathfinder', icon: '🧭',
      description: 'Visit 5+ locations across the map',
      category: 'exploration', unlocked: travelStats.totalLocations >= 5,
      level: travelStats.totalLocations >= 30 ? 3 : travelStats.totalLocations >= 15 ? 2 : travelStats.totalLocations >= 5 ? 1 : 0,
      color: '#06B6D4', requirement: `${travelStats.totalLocations}/5 locations`,
    },
    {
      id: 'exp-2', name: 'State Hopper', icon: '🏁',
      description: 'Explore states beyond your homeland',
      category: 'exploration', unlocked: travelStats.statesVisited >= 3,
      level: travelStats.statesVisited >= 10 ? 3 : travelStats.statesVisited >= 6 ? 2 : travelStats.statesVisited >= 3 ? 1 : 0,
      color: '#06B6D4', requirement: `${travelStats.statesVisited}/3 states`,
    },
    {
      id: 'exp-3', name: 'Coastal Wanderer', icon: '🏖️',
      description: 'Visit coastal destinations',
      category: 'exploration',
      unlocked: travelLocations.some(l => ['Goa', 'Gokarna', 'Varkala', 'Karwar'].includes(l.name)),
      level: ['Goa', 'Gokarna', 'Varkala', 'Karwar'].filter(n => travelLocations.some(l => l.name === n)).length >= 3 ? 2 : 1,
      color: '#06B6D4', requirement: 'Visit coastal destinations',
    },
    {
      id: 'exp-4', name: 'Hill Station Expert', icon: '⛰️',
      description: 'Visit the famous hill stations',
      category: 'exploration',
      unlocked: travelLocations.some(l => ['Ooty', 'Kodaikanal', 'Munnar'].includes(l.name)),
      level: ['Ooty', 'Kodaikanal', 'Munnar', 'Yercaud'].filter(n => travelLocations.some(l => l.name === n)).length >= 3 ? 3 : 1,
      color: '#06B6D4', requirement: 'Visit hill stations',
    },

    // COMBAT (Trekking) skills
    {
      id: 'cmb-1', name: 'First Ascent', icon: '🥾',
      description: 'Complete your first trek',
      category: 'combat', unlocked: trekStats.totalTreks >= 1,
      level: trekStats.totalTreks >= 1 ? 1 : 0,
      color: '#EF4444', requirement: `${trekStats.totalTreks}/1 trek`,
    },
    {
      id: 'cmb-2', name: 'Ridge Runner', icon: '🏃',
      description: 'Complete 5+ treks',
      category: 'combat', unlocked: trekStats.totalTreks >= 5,
      level: trekStats.totalTreks >= 13 ? 3 : trekStats.totalTreks >= 8 ? 2 : trekStats.totalTreks >= 5 ? 1 : 0,
      color: '#EF4444', requirement: `${trekStats.totalTreks}/5 treks`,
    },
    {
      id: 'cmb-3', name: 'High Altitude', icon: '🗻',
      description: 'Reach 3000m+ elevation',
      category: 'combat', unlocked: trekStats.highestElevation >= 3000,
      level: trekStats.highestElevation >= 4500 ? 3 : trekStats.highestElevation >= 3500 ? 2 : trekStats.highestElevation >= 3000 ? 1 : 0,
      color: '#EF4444', requirement: `${trekStats.highestElevation}/3000m`,
    },
    {
      id: 'cmb-4', name: 'Marathon Trekker', icon: '🏅',
      description: 'Trek 100km+ total distance',
      category: 'combat', unlocked: trekStats.totalDistance >= 100,
      level: trekStats.totalDistance >= 300 ? 3 : trekStats.totalDistance >= 200 ? 2 : trekStats.totalDistance >= 100 ? 1 : 0,
      color: '#EF4444', requirement: `${trekStats.totalDistance}/100km`,
    },
    {
      id: 'cmb-5', name: 'Himalayan Spirit', icon: '❄️',
      description: 'Complete a Himalayan trek',
      category: 'combat',
      unlocked: treks.some(t => t.region === 'West Bengal' || t.region === 'Himachal Pradesh'),
      level: treks.filter(t => t.region === 'West Bengal' || t.region === 'Himachal Pradesh').length >= 2 ? 2 : 1,
      color: '#EF4444', requirement: 'Complete a Himalayan trek',
    },

    // WISDOM (Books) skills
    {
      id: 'wis-1', name: 'Bookworm', icon: '📖',
      description: 'Start reading regularly',
      category: 'wisdom', unlocked: bookStats.total >= 1,
      level: bookStats.total >= 10 ? 3 : bookStats.total >= 5 ? 2 : bookStats.total >= 1 ? 1 : 0,
      color: '#3B82F6', requirement: `${bookStats.total}/1 book`,
    },
    {
      id: 'wis-2', name: 'Active Reader', icon: '📚',
      description: 'Currently reading a book',
      category: 'wisdom', unlocked: bookStats.reading >= 1,
      level: bookStats.reading >= 3 ? 3 : bookStats.reading >= 2 ? 2 : bookStats.reading >= 1 ? 1 : 0,
      color: '#3B82F6', requirement: `${bookStats.reading} books in progress`,
    },
    {
      id: 'wis-3', name: 'Nature Scholar', icon: '🌿',
      description: 'Read nature-related books',
      category: 'wisdom',
      unlocked: books.some(b => b.genre === 'Nature'),
      level: books.filter(b => b.genre === 'Nature').length >= 3 ? 3 : 1,
      color: '#3B82F6', requirement: 'Read nature books',
    },
    {
      id: 'wis-4', name: 'Design Thinker', icon: '🎨',
      description: 'Read design books',
      category: 'wisdom',
      unlocked: books.some(b => b.genre === 'Design'),
      level: 1,
      color: '#3B82F6', requirement: 'Read design books',
    },

    // MASTERY (Gaming) skills
    {
      id: 'mas-1', name: 'Game On', icon: '🕹️',
      description: 'Complete your first game',
      category: 'mastery', unlocked: gameStats.completed >= 1,
      level: gameStats.completed >= 1 ? 1 : 0,
      color: '#8B5CF6', requirement: `${gameStats.completed}/1 game completed`,
    },
    {
      id: 'mas-2', name: 'Roguelike Master', icon: '☠️',
      description: 'Master roguelike games',
      category: 'mastery',
      unlocked: games.filter(g => g.genre === 'Roguelike' && g.status === 'completed').length >= 1,
      level: games.filter(g => g.genre === 'Roguelike' && g.status === 'completed').length >= 3 ? 3 : games.filter(g => g.genre === 'Roguelike' && g.status === 'completed').length >= 2 ? 2 : 1,
      color: '#8B5CF6', requirement: 'Complete roguelike games',
    },
    {
      id: 'mas-3', name: 'Metroidvania Pro', icon: '🦋',
      description: 'Master metroidvania games',
      category: 'mastery',
      unlocked: games.filter(g => g.genre === 'Metroidvania' && g.status === 'completed').length >= 1,
      level: games.filter(g => g.genre === 'Metroidvania' && g.status === 'completed').length >= 3 ? 3 : games.filter(g => g.genre === 'Metroidvania' && g.status === 'completed').length >= 2 ? 2 : 1,
      color: '#8B5CF6', requirement: 'Complete metroidvania games',
    },
    {
      id: 'mas-4', name: 'Century Club', icon: '💯',
      description: 'Accumulate 100+ gaming hours',
      category: 'mastery', unlocked: gameStats.totalHours >= 100,
      level: gameStats.totalHours >= 500 ? 3 : gameStats.totalHours >= 300 ? 2 : gameStats.totalHours >= 100 ? 1 : 0,
      color: '#8B5CF6', requirement: `${gameStats.totalHours}/100 hours`,
    },
    {
      id: 'mas-5', name: 'Perfectionist', icon: '⭐',
      description: 'Rate a game 5 stars',
      category: 'mastery',
      unlocked: games.some(g => g.rating === 5),
      level: games.filter(g => g.rating === 5).length >= 5 ? 3 : games.filter(g => g.rating === 5).length >= 3 ? 2 : 1,
      color: '#8B5CF6', requirement: `${games.filter(g => g.rating === 5).length} perfect games`,
    },

    // ENDURANCE skills
    {
      id: 'end-1', name: 'Iron Will', icon: '💪',
      description: 'Complete a hard difficulty trek',
      category: 'endurance',
      unlocked: treks.some(t => t.difficulty === 'hard'),
      level: treks.filter(t => t.difficulty === 'hard').length >= 3 ? 3 : treks.filter(t => t.difficulty === 'hard').length >= 2 ? 2 : 1,
      color: '#F59E0B', requirement: 'Complete hard treks',
    },
    {
      id: 'end-2', name: 'Multi-Day Warrior', icon: '⛺',
      description: 'Complete a multi-day trek',
      category: 'endurance',
      unlocked: treks.some(t => t.duration && !t.duration.includes('1 day') && !t.duration.includes('Half')),
      level: 2,
      color: '#F59E0B', requirement: 'Multi-day treks',
    },
    {
      id: 'end-3', name: 'Long Distance', icon: '🏃‍♂️',
      description: 'Complete a 20km+ trek in a day',
      category: 'endurance',
      unlocked: treks.some(t => t.distance >= 20),
      level: treks.filter(t => t.distance >= 20).length >= 3 ? 3 : 1,
      color: '#F59E0B', requirement: '20km+ single day trek',
    },

    // SOCIAL skills
    {
      id: 'soc-1', name: 'Kerala Explorer', icon: '🌴',
      description: 'Explore God\'s Own Country',
      category: 'social',
      unlocked: travelLocations.filter(l => l.region === 'Kerala').length >= 2,
      level: travelLocations.filter(l => l.region === 'Kerala').length >= 5 ? 3 : travelLocations.filter(l => l.region === 'Kerala').length >= 3 ? 2 : 1,
      color: '#EC4899', requirement: `${travelLocations.filter(l => l.region === 'Kerala').length} Kerala locations`,
    },
    {
      id: 'soc-2', name: 'Karnataka Native', icon: '🏛️',
      description: 'Explore Karnataka extensively',
      category: 'social',
      unlocked: travelLocations.filter(l => l.region === 'Karnataka').length >= 3,
      level: travelLocations.filter(l => l.region === 'Karnataka').length >= 8 ? 3 : travelLocations.filter(l => l.region === 'Karnataka').length >= 5 ? 2 : 1,
      color: '#EC4899', requirement: `${travelLocations.filter(l => l.region === 'Karnataka').length} Karnataka locations`,
    },
    {
      id: 'soc-3', name: 'Party Mode', icon: '🎉',
      description: 'Play party games',
      category: 'social',
      unlocked: games.some(g => g.genre === 'Party'),
      level: 1,
      color: '#EC4899', requirement: 'Party games played',
    },
  ];

  return skills;
}

// ============================================================================
// SKILL CARD
// ============================================================================

function SkillCard({ skill, index }: { skill: Skill; index: number }) {
  const [isHovered, setIsHovered] = useState(false);
  const levelColors = ['#374151', '#CD7F32', '#C0C0C0', '#FFD700'];
  const levelNames = ['Locked', 'Bronze', 'Silver', 'Gold'];

  return (
    <motion.div
      className="relative cursor-pointer"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.03, duration: 0.3 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.05, y: -4 }}
    >
      <div
        className="p-3 text-center relative overflow-hidden"
        style={{
          backgroundColor: skill.unlocked ? `${skill.color}10` : 'var(--bg-main)',
          border: `2px solid ${skill.unlocked ? skill.color : 'var(--border-color)'}`,
          opacity: skill.unlocked ? 1 : 0.4,
          boxShadow: skill.unlocked && isHovered ? `0 0 20px ${skill.color}30` : 'none',
          transition: 'all 0.3s ease',
        }}
      >
        {/* Level indicator */}
        {skill.unlocked && (
          <div
            className="absolute top-1 right-1 w-4 h-4 flex items-center justify-center"
            style={{
              backgroundColor: levelColors[skill.level],
              fontSize: '8px',
              color: skill.level >= 2 ? '#000' : '#fff',
              fontWeight: 'bold',
              fontFamily: 'monospace',
            }}
          >
            {skill.level}
          </div>
        )}

        {/* Icon */}
        <div className="text-2xl mb-1">
          {skill.unlocked ? skill.icon : '🔒'}
        </div>

        {/* Name */}
        <div
          className="font-mono text-xs font-bold truncate"
          style={{
            color: skill.unlocked ? 'var(--text-main)' : 'var(--text-muted)',
          }}
        >
          {skill.name}
        </div>

        {/* Lock overlay shimmer */}
        {!skill.unlocked && (
          <div
            className="absolute inset-0"
            style={{
              background: 'repeating-linear-gradient(45deg, transparent, transparent 5px, var(--border-color) 5px, var(--border-color) 6px)',
              opacity: 0.1,
            }}
          />
        )}
      </div>

      {/* Tooltip */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            className="absolute z-50 p-3 w-52 left-1/2 -translate-x-1/2"
            style={{
              backgroundColor: 'var(--bg-card)',
              border: `1px solid ${skill.color}`,
              boxShadow: `0 4px 20px ${skill.color}20`,
              top: '100%',
              marginTop: '8px',
            }}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{skill.icon}</span>
              <div>
                <div
                  className="font-mono text-sm font-bold"
                  style={{ color: 'var(--text-main)' }}
                >
                  {skill.name}
                </div>
                {skill.unlocked && (
                  <div
                    className="font-mono text-xs"
                    style={{ color: levelColors[skill.level] }}
                  >
                    {levelNames[skill.level]}
                  </div>
                )}
              </div>
            </div>
            <p
              className="font-mono text-xs mb-2"
              style={{ color: 'var(--text-muted)' }}
            >
              {skill.description}
            </p>
            <div
              className="font-mono text-xs"
              style={{ color: skill.unlocked ? skill.color : 'var(--text-muted)' }}
            >
              {skill.requirement}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ============================================================================
// MAIN SKILL TREE COMPONENT
// ============================================================================

export function SkillTree() {
  const skills = useMemo(() => generateSkills(), []);
  const [activeCategory, setActiveCategory] = useState<SkillCategory | 'all'>('all');

  const filteredSkills = activeCategory === 'all'
    ? skills
    : skills.filter(s => s.category === activeCategory);

  const unlockedCount = skills.filter(s => s.unlocked).length;
  const totalCount = skills.length;
  const goldCount = skills.filter(s => s.level >= 3).length;
  const silverCount = skills.filter(s => s.level >= 2).length;

  const categories = Object.entries(categoryMeta).map(([key, meta]) => {
    const catSkills = skills.filter(s => s.category === key);
    const catUnlocked = catSkills.filter(s => s.unlocked).length;
    return { key, ...meta, unlocked: catUnlocked, total: catSkills.length };
  });

  return (
    <motion.div
      className="relative overflow-hidden"
      style={{
        backgroundColor: 'var(--bg-card)',
        border: 'var(--border-width) solid var(--border-color)',
      }}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      {/* Header */}
      <div
        className="px-6 py-4"
        style={{
          borderBottom: '2px solid var(--border-color)',
          background: 'linear-gradient(90deg, var(--bg-main) 0%, var(--bg-card) 50%, var(--bg-main) 100%)',
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2
              className="text-2xl font-mono font-bold uppercase tracking-wider"
              style={{ color: 'var(--text-main)' }}
            >
              ⚡ Skill Tree
            </h2>
            <p
              className="font-mono text-sm mt-1"
              style={{ color: 'var(--text-muted)' }}
            >
              Abilities unlocked through life experiences
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div
                className="text-xl font-mono font-bold"
                style={{ color: 'var(--accent-color)' }}
              >
                {unlockedCount}/{totalCount}
              </div>
              <div
                className="text-xs font-mono uppercase"
                style={{ color: 'var(--text-muted)' }}
              >
                Unlocked
              </div>
            </div>
            <div className="flex gap-2">
              <span className="text-xs font-mono" style={{ color: '#FFD700' }}>🥇{goldCount}</span>
              <span className="text-xs font-mono" style={{ color: '#C0C0C0' }}>🥈{silverCount}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Category filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setActiveCategory('all')}
            className="px-3 py-1.5 font-mono text-xs uppercase transition-all"
            style={{
              backgroundColor: activeCategory === 'all' ? 'var(--accent-color)' : 'transparent',
              color: activeCategory === 'all' ? 'white' : 'var(--text-muted)',
              border: '1px solid var(--border-color)',
            }}
          >
            All ({unlockedCount}/{totalCount})
          </button>
          {categories.map(cat => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key as SkillCategory)}
              className="px-3 py-1.5 font-mono text-xs uppercase transition-all"
              style={{
                backgroundColor: activeCategory === cat.key ? cat.color : 'transparent',
                color: activeCategory === cat.key ? 'white' : 'var(--text-muted)',
                border: `1px solid ${activeCategory === cat.key ? cat.color : 'var(--border-color)'}`,
              }}
            >
              {cat.icon} {cat.label} ({cat.unlocked}/{cat.total})
            </button>
          ))}
        </div>

        {/* Skills Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-3">
          <AnimatePresence mode="popLayout">
            {filteredSkills.map((skill, i) => (
              <SkillCard key={skill.id} skill={skill} index={i} />
            ))}
          </AnimatePresence>
        </div>

        {/* Category progress bars */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-4">
          {categories.map(cat => (
            <div
              key={cat.key}
              className="p-3"
              style={{
                backgroundColor: 'var(--bg-main)',
                border: '1px solid var(--border-color)',
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-bold" style={{ color: cat.color }}>
                  {cat.icon} {cat.label}
                </span>
                <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
                  {cat.unlocked}/{cat.total}
                </span>
              </div>
              <div className="h-2" style={{ backgroundColor: 'var(--border-color)' }}>
                <motion.div
                  className="h-full"
                  style={{ backgroundColor: cat.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${(cat.unlocked / cat.total) * 100}%` }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default SkillTree;
