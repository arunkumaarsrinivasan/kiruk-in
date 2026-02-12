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

interface EquipmentSlot {
  id: string;
  slotType: 'weapon' | 'armor' | 'accessory' | 'mount' | 'companion' | 'trinket';
  name: string;
  icon: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  description: string;
  bonus: string;
  equipped: boolean;
  source: string;
}

interface Achievement {
  id: string;
  name: string;
  icon: string;
  description: string;
  unlocked: boolean;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  date?: string;
  category: string;
}

const rarityColors: Record<string, { bg: string; border: string; text: string; glow: string }> = {
  common: { bg: '#37415110', border: '#6B7280', text: '#9CA3AF', glow: 'none' },
  uncommon: { bg: '#10B98110', border: '#10B981', text: '#34D399', glow: '0 0 10px #10B98130' },
  rare: { bg: '#3B82F610', border: '#3B82F6', text: '#60A5FA', glow: '0 0 15px #3B82F630' },
  epic: { bg: '#8B5CF610', border: '#8B5CF6', text: '#A78BFA', glow: '0 0 20px #8B5CF630' },
  legendary: { bg: '#F59E0B10', border: '#F59E0B', text: '#FBBF24', glow: '0 0 25px #F59E0B40' },
};

// ============================================================================
// EQUIPMENT GENERATION
// ============================================================================

function getEquipment(): EquipmentSlot[] {
  const trekStats = getTrekStats();
  const gameStats = getGameStats();
  const travelStats = getTravelStats();

  return [
    {
      id: 'weap-1',
      slotType: 'weapon',
      name: trekStats.totalTreks >= 10 ? 'Veteran\'s Trekking Pole' : 'Hiking Stick',
      icon: '🪝',
      rarity: trekStats.totalTreks >= 10 ? 'epic' : trekStats.totalTreks >= 5 ? 'rare' : 'uncommon',
      description: 'A well-worn trekking companion',
      bonus: `+${trekStats.totalTreks * 3} Endurance`,
      equipped: true,
      source: `${trekStats.totalTreks} treks completed`,
    },
    {
      id: 'armor-1',
      slotType: 'armor',
      name: travelStats.statesVisited >= 7 ? 'Explorer\'s Weathered Jacket' : 'Traveler\'s Coat',
      icon: '🧥',
      rarity: travelStats.statesVisited >= 7 ? 'epic' : 'rare',
      description: 'Worn across multiple states and terrains',
      bonus: `+${travelStats.statesVisited * 5} Wisdom`,
      equipped: true,
      source: `${travelStats.statesVisited} states explored`,
    },
    {
      id: 'acc-1',
      slotType: 'accessory',
      name: gameStats.completed >= 5 ? 'Champion\'s Controller' : 'Gamer\'s Pad',
      icon: '🎮',
      rarity: gameStats.completed >= 5 ? 'rare' : 'uncommon',
      description: 'Battle-tested gaming peripheral',
      bonus: `+${gameStats.completed * 8} Dexterity`,
      equipped: true,
      source: `${gameStats.completed} games mastered`,
    },
    {
      id: 'mount-1',
      slotType: 'mount',
      name: trekStats.highestElevation >= 4000 ? 'Mountain Goat Spirit' : 'Trail Runner\'s Boots',
      icon: trekStats.highestElevation >= 4000 ? '🐐' : '👟',
      rarity: trekStats.highestElevation >= 4000 ? 'legendary' : 'rare',
      description: 'Swift traversal of mountainous terrain',
      bonus: `+${Math.round(trekStats.highestElevation / 100)} Speed`,
      equipped: true,
      source: `Peak: ${trekStats.highestElevation}m elevation`,
    },
    {
      id: 'comp-1',
      slotType: 'companion',
      name: 'Indie Game Spirit',
      icon: '👾',
      rarity: games.filter(g => g.rating === 5).length >= 3 ? 'epic' : 'uncommon',
      description: 'A spectral companion born from countless hours in indie worlds',
      bonus: `+${games.filter(g => g.rating === 5).length * 10} Spirit`,
      equipped: true,
      source: `${games.filter(g => g.rating === 5).length} five-star games`,
    },
    {
      id: 'trin-1',
      slotType: 'trinket',
      name: 'Compass of Curiosity',
      icon: '🧭',
      rarity: travelStats.totalLocations >= 25 ? 'epic' : 'rare',
      description: 'Always points toward the next adventure',
      bonus: `+${travelStats.totalLocations * 2} Discovery`,
      equipped: true,
      source: `${travelStats.totalLocations} locations discovered`,
    },
  ];
}

// ============================================================================
// ACHIEVEMENTS GENERATION
// ============================================================================

function getAchievements(): Achievement[] {
  const trekStats = getTrekStats();
  const gameStats = getGameStats();
  const bookStats = getBookStats();
  const travelStats = getTravelStats();

  return [
    {
      id: 'ach-1', name: 'First Blood', icon: '🗡️',
      description: 'Complete your first trek',
      unlocked: trekStats.totalTreks >= 1,
      rarity: 'common', category: 'Trekking',
    },
    {
      id: 'ach-2', name: 'Veteran Explorer', icon: '🏆',
      description: 'Complete 10+ treks',
      unlocked: trekStats.totalTreks >= 10,
      rarity: 'epic', category: 'Trekking',
    },
    {
      id: 'ach-3', name: 'Cloud Walker', icon: '☁️',
      description: 'Reach 4000m+ elevation',
      unlocked: trekStats.highestElevation >= 4000,
      rarity: 'legendary', category: 'Trekking',
    },
    {
      id: 'ach-4', name: 'Distance Runner', icon: '🏃',
      description: 'Trek 200km+ total distance',
      unlocked: trekStats.totalDistance >= 200,
      rarity: 'rare', category: 'Trekking',
    },
    {
      id: 'ach-5', name: 'Game Master', icon: '👑',
      description: 'Complete 5+ games',
      unlocked: gameStats.completed >= 5,
      rarity: 'rare', category: 'Gaming',
    },
    {
      id: 'ach-6', name: 'No-Life Gamer', icon: '🌙',
      description: 'Log 300+ gaming hours',
      unlocked: gameStats.totalHours >= 300,
      rarity: 'epic', category: 'Gaming',
    },
    {
      id: 'ach-7', name: 'Critic\'s Eye', icon: '⭐',
      description: 'Give 5 games a perfect rating',
      unlocked: games.filter(g => g.rating === 5).length >= 5,
      rarity: 'legendary', category: 'Gaming',
    },
    {
      id: 'ach-8', name: 'Page Turner', icon: '📖',
      description: 'Start reading books',
      unlocked: bookStats.total >= 1,
      rarity: 'common', category: 'Reading',
    },
    {
      id: 'ach-9', name: 'Cartographer', icon: '🗺️',
      description: 'Visit 20+ locations',
      unlocked: travelStats.totalLocations >= 20,
      rarity: 'rare', category: 'Travel',
    },
    {
      id: 'ach-10', name: 'State Collector', icon: '🏁',
      description: 'Visit 7+ states',
      unlocked: travelStats.statesVisited >= 7,
      rarity: 'epic', category: 'Travel',
    },
    {
      id: 'ach-11', name: 'Western Ghats Warrior', icon: '🌿',
      description: 'Complete treks in Karnataka Western Ghats',
      unlocked: treks.filter(t => t.region === 'Karnataka').length >= 5,
      rarity: 'rare', category: 'Trekking',
    },
    {
      id: 'ach-12', name: 'Himalayan Initiate', icon: '❄️',
      description: 'Complete your first Himalayan trek',
      unlocked: treks.some(t => t.elevation >= 3000),
      rarity: 'epic', category: 'Trekking',
    },
  ];
}

// ============================================================================
// EQUIPMENT SLOT COMPONENT
// ============================================================================

function EquipmentSlotCard({ slot, index }: { slot: EquipmentSlot; index: number }) {
  const [hovered, setHovered] = useState(false);
  const colors = rarityColors[slot.rarity];

  const slotLabels: Record<string, string> = {
    weapon: 'Weapon',
    armor: 'Armor',
    accessory: 'Accessory',
    mount: 'Mount',
    companion: 'Companion',
    trinket: 'Trinket',
  };

  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <motion.div
        className="p-4 cursor-pointer"
        style={{
          backgroundColor: colors.bg,
          border: `2px solid ${colors.border}`,
          boxShadow: hovered ? colors.glow : 'none',
          transition: 'all 0.3s ease',
        }}
        whileHover={{ scale: 1.02, y: -2 }}
      >
        {/* Slot type label */}
        <div
          className="font-mono text-xs uppercase tracking-wider mb-2"
          style={{ color: 'var(--text-muted)' }}
        >
          {slotLabels[slot.slotType]}
        </div>

        <div className="flex items-center gap-3">
          {/* Icon */}
          <div
            className="w-12 h-12 flex items-center justify-center text-2xl"
            style={{
              backgroundColor: 'var(--bg-main)',
              border: `1px solid ${colors.border}`,
            }}
          >
            {slot.icon}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div
              className="font-mono text-sm font-bold truncate"
              style={{ color: colors.text }}
            >
              {slot.name}
            </div>
            <div
              className="font-mono text-xs mt-0.5"
              style={{ color: '#10B981' }}
            >
              {slot.bonus}
            </div>
            <div
              className="font-mono text-xs mt-0.5 capitalize"
              style={{ color: colors.text, opacity: 0.7 }}
            >
              {slot.rarity}
            </div>
          </div>
        </div>

        {/* Rarity shine effect for legendary */}
        {slot.rarity === 'legendary' && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `linear-gradient(135deg, transparent 30%, ${colors.border}10 50%, transparent 70%)`,
              backgroundSize: '200% 200%',
            }}
            animate={{
              backgroundPosition: ['200% 200%', '-200% -200%'],
            }}
            transition={{ repeat: Infinity, duration: 3 }}
          />
        )}
      </motion.div>

      {/* Hover tooltip */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            className="absolute z-50 p-3 w-56 left-1/2 -translate-x-1/2"
            style={{
              backgroundColor: 'var(--bg-card)',
              border: `1px solid ${colors.border}`,
              boxShadow: colors.glow,
              top: '100%',
              marginTop: '8px',
            }}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
          >
            <p className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
              {slot.description}
            </p>
            <p className="font-mono text-xs mt-2" style={{ color: colors.text }}>
              📋 {slot.source}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ============================================================================
// ACHIEVEMENT BADGE
// ============================================================================

function AchievementBadge({ achievement, index }: { achievement: Achievement; index: number }) {
  const [hovered, setHovered] = useState(false);
  const colors = rarityColors[achievement.rarity];

  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ delay: index * 0.05, type: 'spring', stiffness: 200 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <motion.div
        className="w-16 h-16 flex items-center justify-center cursor-pointer relative"
        style={{
          backgroundColor: achievement.unlocked ? colors.bg : 'var(--bg-main)',
          border: `2px solid ${achievement.unlocked ? colors.border : 'var(--border-color)'}`,
          opacity: achievement.unlocked ? 1 : 0.3,
          boxShadow: achievement.unlocked && hovered ? colors.glow : 'none',
        }}
        whileHover={achievement.unlocked ? { scale: 1.15, rotate: 5 } : {}}
      >
        <span className="text-2xl">
          {achievement.unlocked ? achievement.icon : '❓'}
        </span>

        {/* Legendary sparkle */}
        {achievement.unlocked && achievement.rarity === 'legendary' && (
          <motion.div
            className="absolute -top-1 -right-1 text-xs"
            animate={{ rotate: [0, 360] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
          >
            ✨
          </motion.div>
        )}
      </motion.div>

      {/* Tooltip */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            className="absolute z-50 p-3 w-48 left-1/2 -translate-x-1/2"
            style={{
              backgroundColor: 'var(--bg-card)',
              border: `1px solid ${achievement.unlocked ? colors.border : 'var(--border-color)'}`,
              boxShadow: achievement.unlocked ? colors.glow : 'none',
              top: '100%',
              marginTop: '8px',
            }}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
          >
            <div
              className="font-mono text-sm font-bold"
              style={{ color: achievement.unlocked ? colors.text : 'var(--text-muted)' }}
            >
              {achievement.unlocked ? achievement.name : '???'}
            </div>
            <p
              className="font-mono text-xs mt-1"
              style={{ color: 'var(--text-muted)' }}
            >
              {achievement.description}
            </p>
            <div className="flex items-center justify-between mt-2">
              <span
                className="font-mono text-xs capitalize"
                style={{ color: colors.text }}
              >
                {achievement.rarity}
              </span>
              <span
                className="font-mono text-xs"
                style={{ color: 'var(--text-muted)' }}
              >
                {achievement.category}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function EquipmentAndAchievements() {
  const equipment = useMemo(() => getEquipment(), []);
  const achievements = useMemo(() => getAchievements(), []);

  const unlockedAchievements = achievements.filter(a => a.unlocked).length;
  const legendaryCount = achievements.filter(a => a.unlocked && a.rarity === 'legendary').length;
  const epicCount = achievements.filter(a => a.unlocked && a.rarity === 'epic').length;

  return (
    <div className="space-y-8">
      {/* Equipment Section */}
      <motion.div
        className="relative overflow-hidden"
        style={{
          backgroundColor: 'var(--bg-card)',
          border: 'var(--border-width) solid var(--border-color)',
        }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <div
          className="px-6 py-4"
          style={{
            borderBottom: '2px solid var(--border-color)',
            background: 'linear-gradient(90deg, var(--bg-main) 0%, var(--bg-card) 50%, var(--bg-main) 100%)',
          }}
        >
          <h2
            className="text-2xl font-mono font-bold uppercase tracking-wider"
            style={{ color: 'var(--text-main)' }}
          >
            🛡️ Equipment
          </h2>
          <p
            className="font-mono text-sm mt-1"
            style={{ color: 'var(--text-muted)' }}
          >
            Gear earned through real-life adventures
          </p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {equipment.map((slot, i) => (
              <EquipmentSlotCard key={slot.id} slot={slot} index={i} />
            ))}
          </div>
        </div>
      </motion.div>

      {/* Achievements Section */}
      <motion.div
        className="relative overflow-hidden"
        style={{
          backgroundColor: 'var(--bg-card)',
          border: 'var(--border-width) solid var(--border-color)',
        }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
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
                🏆 Achievements
              </h2>
              <p
                className="font-mono text-sm mt-1"
                style={{ color: 'var(--text-muted)' }}
              >
                Milestones unlocked along the way
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span
                className="font-mono text-lg font-bold"
                style={{ color: 'var(--accent-color)' }}
              >
                {unlockedAchievements}/{achievements.length}
              </span>
              {legendaryCount > 0 && (
                <span className="font-mono text-xs" style={{ color: '#F59E0B' }}>
                  ⭐{legendaryCount} Legendary
                </span>
              )}
              {epicCount > 0 && (
                <span className="font-mono text-xs" style={{ color: '#8B5CF6' }}>
                  💎{epicCount} Epic
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Achievement progress bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
                Achievement Progress
              </span>
              <span className="font-mono text-xs" style={{ color: 'var(--accent-color)' }}>
                {Math.round((unlockedAchievements / achievements.length) * 100)}%
              </span>
            </div>
            <div className="h-3" style={{ backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)' }}>
              <motion.div
                className="h-full"
                style={{
                  background: 'linear-gradient(90deg, #10B981, #3B82F6, #8B5CF6, #F59E0B)',
                }}
                initial={{ width: 0 }}
                animate={{ width: `${(unlockedAchievements / achievements.length) * 100}%` }}
                transition={{ duration: 1.2, delay: 0.5 }}
              />
            </div>
          </div>

          {/* Achievement badges grid */}
          <div className="flex flex-wrap gap-3 justify-center">
            {achievements.map((achievement, i) => (
              <AchievementBadge key={achievement.id} achievement={achievement} index={i} />
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default EquipmentAndAchievements;
