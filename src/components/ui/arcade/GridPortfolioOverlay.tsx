'use client';

/**
 * GridPortfolioOverlay Component
 * 
 * Displays interactive portfolio information cards on the grid
 * when no game is active. Each card aligns to the 20px grid
 * and reveals information about skills, projects, and personal stories.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GRID_SIZE } from '@/lib/utils';
import { 
  PROJECT_TILES, 
  SKILL_TILES, 
  STORY_TILES, 
  FUNFACT_TILES,
  type ProjectTileContent,
  type SkillTileContent,
  type StoryTileContent,
  type FunFactTileContent,
} from './grid-tile-types';
import { PixelIcon } from '@/components/ui/PixelIcon';

// Helper function to map emoji to pixel icon name
const emojiToIconName = (emoji: string): string => {
  const emojiMap: Record<string, string> = {
    '🎯': 'flag-checkered',
    '📍': 'location',
    '🚀': 'plane',
    '📖': 'book-heart',
    '🧩': 'cog',
    '✨': 'sparkles',
    '🎨': 'pencil-ruler',
    '🔧': 'cog',
    '💼': 'wallet',
    '🌊': 'sparkles',
    '📝': 'pen',
    '🧠': 'face-thinking',
    '🎓': 'crown',
    '🏔️': 'location',
    '🤖': 'robot',
    '🎭': 'themes',
    '⚡': 'bolt',
    '🔍': 'search',
    '📊': 'chart',
    '🍃': 'seedlings',
    '☁️': 'cloud',
    '🎮': 'trophy',
    '✍️': 'pen',
    '☕': 'star',
    '📓': 'book-heart',
    '🖊️': 'pen-nib',
    '⛰️': 'location',
    '⌨️': 'code',
    '✏️': 'pencil',
    '🖨️': 'print',
    '👨‍🏫': 'user',
    '🏓': 'trophy',
    '🌲': 'seedlings',
    '🏙️': 'globe',
    '❓': 'question',
  };
  return emojiMap[emoji] || 'star';
};

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface GridCard {
  id: string;
  type: 'intro' | 'skill' | 'project' | 'story' | 'funfact' | 'contact' | 'nav';
  x: number; // grid units
  y: number; // grid units
  width: number; // grid units
  height: number; // grid units
  content: IntroContent | SkillTileContent | ProjectTileContent | StoryTileContent | FunFactTileContent | ContactContent | NavContent;
}

interface IntroContent {
  name: string;
  role: string;
  tagline: string;
  location: string;
}

interface ContactContent {
  type: 'contact';
  items: Array<{ icon: string; label: string; link: string }>;
}

interface NavContent {
  type: 'nav';
  label: string;
  path: string;
  icon: string;
  description: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CARD COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

const IntroCard: React.FC<{ content: IntroContent }> = ({ content }) => (
  <div className="h-full flex flex-col justify-center p-4">
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <p className="text-[10px] font-mono text-[var(--accent-color)] uppercase tracking-widest mb-1">
        Hello, I'm
      </p>
      <h1 className="text-2xl md:text-3xl font-mono font-bold text-[var(--text-main)] leading-tight">
        {content.name}
      </h1>
      <p className="text-sm font-mono text-[var(--text-main)] mt-1">
        {content.role}
      </p>
      <p className="text-xs font-mono text-[var(--text-muted)] mt-2">
        {content.tagline}
      </p>
      <div className="flex items-center gap-1 mt-3 text-[10px] font-mono text-[var(--text-muted)]">
        <PixelIcon name="location" size={12} />
        <span>{content.location}</span>
      </div>
    </motion.div>
  </div>
);

const SkillCard: React.FC<{ content: SkillTileContent; index: number }> = ({ content, index }) => {
  const levelColors = {
    learning: 'bg-blue-500',
    comfortable: 'bg-green-500',
    proficient: 'bg-purple-500',
    expert: 'bg-yellow-500',
  };
  const levelPercent = { learning: 25, comfortable: 50, proficient: 75, expert: 95 };
  
  return (
    <motion.div
      className="h-full p-2 flex flex-col"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
    >
      <div className="flex items-center gap-2 mb-1">
        <PixelIcon name={emojiToIconName(content.emoji)} size={18} />
        <span className="text-[10px] font-mono font-bold text-[var(--text-main)] uppercase truncate">
          {content.name}
        </span>
      </div>
      <div className="h-1 w-full bg-[var(--bg-main)] rounded-full overflow-hidden mt-auto">
        <motion.div
          className={`h-full ${levelColors[content.level]}`}
          initial={{ width: 0 }}
          animate={{ width: `${levelPercent[content.level]}%` }}
          transition={{ delay: index * 0.05 + 0.3, duration: 0.5 }}
        />
      </div>
      <p className="text-[8px] font-mono text-[var(--text-muted)] mt-1">
        {content.years}+ years • {content.level}
      </p>
    </motion.div>
  );
};

const ProjectCard: React.FC<{ content: ProjectTileContent; index: number }> = ({ content, index }) => (
  <motion.a
    href={content.link || '#'}
    className="h-full p-3 flex flex-col hover:bg-[var(--accent-color)]/10 transition-colors group"
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.1 }}
  >
    <div className="flex items-start justify-between mb-1">
      <span className="text-lg">🚀</span>
      <span className="text-[8px] font-mono text-[var(--accent-color)]">{content.year}</span>
    </div>
    <h3 className="text-xs font-mono font-bold text-[var(--text-main)] group-hover:text-[var(--accent-color)] transition-colors line-clamp-2">
      {content.title}
    </h3>
    <p className="text-[10px] font-mono text-[var(--text-muted)] mt-1">{content.company}</p>
    <div className="flex flex-wrap gap-1 mt-auto pt-2">
      {content.tags.slice(0, 2).map((tag) => (
        <span key={tag} className="text-[8px] font-mono px-1 py-0.5 bg-[var(--bg-main)] text-[var(--text-muted)] border border-[var(--border-color)]">
          {tag}
        </span>
      ))}
    </div>
  </motion.a>
);

const StoryCard: React.FC<{ content: StoryTileContent; index: number }> = ({ content, index }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <motion.div
      className="h-full p-3 flex flex-col cursor-pointer hover:bg-[var(--accent-color)]/5 transition-colors"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="flex items-center gap-2 mb-2">
        <PixelIcon name={emojiToIconName(content.emoji)} size={20} />
        <h3 className="text-xs font-mono font-bold text-[var(--text-main)] line-clamp-1">
          {content.title}
        </h3>
      </div>
      <p className="text-[10px] font-mono text-[var(--text-muted)] leading-relaxed flex-1">
        {isExpanded && content.fullStory ? content.fullStory : content.snippet}
      </p>
      {content.fullStory && (
        <p className="text-[8px] font-mono text-[var(--accent-color)] mt-2">
          {isExpanded ? '↑ collapse' : '↓ read more'}
        </p>
      )}
    </motion.div>
  );
};

const FunFactCard: React.FC<{ content: FunFactTileContent; index: number }> = ({ content, index }) => (
  <motion.div
    className="h-full p-2 flex items-center gap-2 bg-[var(--accent-color)]/5"
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: index * 0.05, type: 'spring' }}
  >
    <span className="flex-shrink-0"><PixelIcon name={emojiToIconName(content.emoji)} size={20} /></span>
    <p className="text-[10px] font-mono text-[var(--text-main)] leading-tight line-clamp-3">
      {content.fact}
    </p>
  </motion.div>
);

const ContactCard: React.FC<{ content: ContactContent }> = ({ content }) => (
  <div className="h-full p-3 flex flex-col">
    <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider mb-2">
      Let's Connect
    </p>
    <div className="flex flex-wrap gap-2">
      {content.items.map((item) => (
        <motion.a
          key={item.label}
          href={item.link}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 px-2 py-1 bg-[var(--bg-main)] border border-[var(--border-color)] hover:border-[var(--accent-color)] hover:text-[var(--accent-color)] transition-colors text-[var(--text-main)]"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span>{item.icon}</span>
          <span className="text-[10px] font-mono">{item.label}</span>
        </motion.a>
      ))}
    </div>
  </div>
);

const NavCard: React.FC<{ content: NavContent; index: number }> = ({ content, index }) => (
  <motion.a
    href={content.path}
    className="h-full p-2 flex flex-col justify-center items-center text-center hover:bg-[var(--accent-color)] hover:text-[var(--bg-main)] transition-all group border-2 border-transparent hover:border-[var(--accent-color)]"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
  >
    <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">{content.icon}</span>
    <span className="text-xs font-mono font-bold uppercase">{content.label}</span>
    <span className="text-[8px] font-mono text-[var(--text-muted)] group-hover:text-[var(--bg-main)]/70 mt-1 line-clamp-2">
      {content.description}
    </span>
  </motion.a>
);

// ═══════════════════════════════════════════════════════════════════════════════
// GRID LAYOUT CALCULATOR
// ═══════════════════════════════════════════════════════════════════════════════

function calculateGridLayout(viewportWidth: number, viewportHeight: number): GridCard[] {
  const cols = Math.floor(viewportWidth / GRID_SIZE);
  const rows = Math.floor(viewportHeight / GRID_SIZE);
  
  // Calculate safe zones - avoid top nav (4 grid units) and bottom play button (4 grid units)
  const topOffset = 5; // Nav height + padding
  const bottomOffset = 5;
  const leftOffset = 6; // TimeMachine area
  const rightOffset = 2;
  
  const usableWidth = cols - leftOffset - rightOffset;
  const usableHeight = rows - topOffset - bottomOffset;
  
  // Calculate responsive card sizes
  const isLarge = viewportWidth >= 1200;
  const isMedium = viewportWidth >= 768;
  
  const cards: GridCard[] = [];
  
  // Intro Card (larger, top-left area)
  const introWidth = isLarge ? 16 : isMedium ? 14 : 12;
  const introHeight = isLarge ? 8 : 6;
  cards.push({
    id: 'intro',
    type: 'intro',
    x: leftOffset,
    y: topOffset,
    width: introWidth,
    height: introHeight,
    content: {
      name: 'Arun Kumar',
      role: 'Full-Stack Developer & Designer',
      tagline: 'Building playful experiences at the intersection of code and design',
      location: 'Bangalore, India',
    } as IntroContent,
  });
  
  // Skill Cards Row (beside intro)
  const skillStartX = leftOffset + introWidth + 1;
  const skillWidth = 8;
  const skillHeight = 4;
  const skillsToShow = SKILL_TILES.slice(0, Math.min(4, Math.floor((cols - skillStartX - rightOffset) / (skillWidth + 1))));
  
  skillsToShow.forEach((skill, i) => {
    if (skillStartX + i * (skillWidth + 1) + skillWidth <= cols - rightOffset) {
      cards.push({
        id: `skill-${skill.id}`,
        type: 'skill',
        x: skillStartX + i * (skillWidth + 1),
        y: topOffset,
        width: skillWidth,
        height: skillHeight,
        content: skill,
      });
    }
  });
  
  // More Skills Row (below first skills)
  const moreSkillsY = topOffset + skillHeight + 1;
  const moreSkills = SKILL_TILES.slice(4, 8);
  moreSkills.forEach((skill, i) => {
    if (skillStartX + i * (skillWidth + 1) + skillWidth <= cols - rightOffset) {
      cards.push({
        id: `skill-${skill.id}`,
        type: 'skill',
        x: skillStartX + i * (skillWidth + 1),
        y: moreSkillsY,
        width: skillWidth,
        height: skillHeight,
        content: skill,
      });
    }
  });
  
  // Project Cards Row
  const projectY = topOffset + introHeight + 1;
  const projectWidth = isLarge ? 14 : 12;
  const projectHeight = 7;
  const projectsToShow = PROJECT_TILES.slice(0, 3);
  
  projectsToShow.forEach((project, i) => {
    if (leftOffset + i * (projectWidth + 1) + projectWidth <= cols - rightOffset) {
      cards.push({
        id: `project-${project.id}`,
        type: 'project',
        x: leftOffset + i * (projectWidth + 1),
        y: projectY,
        width: projectWidth,
        height: projectHeight,
        content: project,
      });
    }
  });
  
  // Story Cards
  const storyY = projectY + projectHeight + 1;
  const storyWidth = isLarge ? 18 : 14;
  const storyHeight = 5;
  
  if (storyY + storyHeight < rows - bottomOffset) {
    STORY_TILES.slice(0, 2).forEach((story, i) => {
      cards.push({
        id: `story-${story.id}`,
        type: 'story',
        x: leftOffset + i * (storyWidth + 1),
        y: storyY,
        width: storyWidth,
        height: storyHeight,
        content: story,
      });
    });
  }
  
  // Fun Facts (scattered at bottom)
  const funFactY = storyY + storyHeight + 1;
  const funFactWidth = 10;
  const funFactHeight = 3;
  
  if (funFactY + funFactHeight < rows - bottomOffset) {
    FUNFACT_TILES.slice(0, 5).forEach((fact, i) => {
      if (leftOffset + i * (funFactWidth + 1) + funFactWidth <= cols - rightOffset) {
        cards.push({
          id: `funfact-${fact.id}`,
          type: 'funfact',
          x: leftOffset + i * (funFactWidth + 1),
          y: funFactY,
          width: funFactWidth,
          height: funFactHeight,
          content: fact,
        });
      }
    });
  }
  
  // Navigation Cards (right side, if space)
  const navItems: NavContent[] = [
    { type: 'nav', label: 'Work', path: '/work', icon: '💼', description: 'My professional journey' },
    { type: 'nav', label: 'About', path: '/about', icon: '👤', description: 'Get to know me' },
    { type: 'nav', label: 'Case Studies', path: '/case-studies', icon: '📚', description: 'Deep dives' },
    { type: 'nav', label: 'Contact', path: '/contact', icon: '✉️', description: 'Let\'s talk' },
  ];
  
  const navWidth = 6;
  const navHeight = 5;
  const navX = cols - rightOffset - navWidth;
  
  navItems.forEach((nav, i) => {
    const navY = topOffset + skillHeight + 1 + i * (navHeight + 1);
    if (navY + navHeight < rows - bottomOffset) {
      cards.push({
        id: `nav-${nav.label}`,
        type: 'nav',
        x: navX,
        y: navY,
        width: navWidth,
        height: navHeight,
        content: nav,
      });
    }
  });
  
  // Contact Card (bottom right)
  if (usableHeight > 20) {
    cards.push({
      id: 'contact',
      type: 'contact',
      x: cols - rightOffset - 12,
      y: rows - bottomOffset - 4,
      width: 12,
      height: 4,
      content: {
        type: 'contact',
        items: [
          { icon: '📧', label: 'Email', link: 'mailto:hello@kiruk.in' },
          { icon: '💼', label: 'LinkedIn', link: 'https://linkedin.com/in/arunkumaarsreenivasan' },
          { icon: '🐙', label: 'GitHub', link: 'https://github.com/kiruk' },
        ],
      } as ContactContent,
    });
  }
  
  return cards;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export const GridPortfolioOverlay: React.FC = () => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: globalThis.innerWidth,
        height: globalThis.innerHeight,
      });
    };
    
    updateDimensions();
    globalThis.addEventListener('resize', updateDimensions);
    
    // Delay visibility for smooth entrance
    const timer = setTimeout(() => setIsVisible(true), 100);
    
    return () => {
      globalThis.removeEventListener('resize', updateDimensions);
      clearTimeout(timer);
    };
  }, []);
  
  const cards = useMemo(() => {
    if (dimensions.width === 0) return [];
    return calculateGridLayout(dimensions.width, dimensions.height);
  }, [dimensions]);
  
  if (!isVisible || dimensions.width === 0) return null;
  
  return (
    <div className="fixed inset-0 z-5 pointer-events-none">
      <AnimatePresence>
        {cards.map((card, index) => (
          <motion.div
            key={card.id}
            className="absolute pointer-events-auto bg-[var(--bg-card)] border border-[var(--border-color)] overflow-hidden"
            style={{
              left: card.x * GRID_SIZE,
              top: card.y * GRID_SIZE,
              width: card.width * GRID_SIZE,
              height: card.height * GRID_SIZE,
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ delay: index * 0.03, duration: 0.3 }}
          >
            {card.type === 'intro' && <IntroCard content={card.content as IntroContent} />}
            {card.type === 'skill' && <SkillCard content={card.content as SkillTileContent} index={index} />}
            {card.type === 'project' && <ProjectCard content={card.content as ProjectTileContent} index={index} />}
            {card.type === 'story' && <StoryCard content={card.content as StoryTileContent} index={index} />}
            {card.type === 'funfact' && <FunFactCard content={card.content as FunFactTileContent} index={index} />}
            {card.type === 'contact' && <ContactCard content={card.content as ContactContent} />}
            {card.type === 'nav' && <NavCard content={card.content as NavContent} index={index} />}
          </motion.div>
        ))}
      </AnimatePresence>
      
      {/* Hint to play games */}
      <motion.div
        className="fixed bottom-20 left-1/2 -translate-x-1/2 pointer-events-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        <div className="px-4 py-2 bg-[var(--bg-card)] border-2 border-dashed border-[var(--border-color)] text-center">
          <p className="text-[10px] font-mono text-[var(--text-muted)]">
            👾 Press <kbd className="px-1 py-0.5 bg-[var(--bg-main)] border border-[var(--border-color)] text-[var(--accent-color)]">PLAY</kbd> to explore through games
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default GridPortfolioOverlay;
