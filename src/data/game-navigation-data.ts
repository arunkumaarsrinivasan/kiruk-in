/**
 * Game Navigation Data System
 * 
 * Transforms the portfolio into a gamified experience where each page is a "game"
 * with levels, progress tracking, and unlockable content.
 * 
 * GAME MODES:
 * - GOD Mode: Everything unlocked, free exploration
 * - Devil Mode: Everything locked, unlock one level at a time in sequence
 * - Normal Mode: Story mode - all levels in current game unlocked, next game locked until current complete
 */

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type GameMode = 'god' | 'devil' | 'normal';

export interface GameLevel {
  id: string;
  name: string;
  description: string;
  xpReward: number;
  // Completion criteria - what action completes this level
  completionType: 'view' | 'scroll' | 'interact' | 'time' | 'score';
  completionTarget?: number; // e.g., scroll 80%, spend 30s, score 100
}

export interface PageGame {
  id: string;
  path: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  // Game-specific theming
  gameType: 'arcade' | 'runner' | 'shooter' | 'puzzle' | 'explorer' | 'builder' | 'collector';
  primaryColor: string;
  // Levels within this game/page
  levels: GameLevel[];
  // Unlock requirements
  requiredGameId?: string; // Must complete this game first
  requiredXP?: number; // Must have this much total XP
  // Order in the game menu
  order: number;
  // Shortcut key
  shortcut: string;
}

export interface GameProgress {
  completedLevels: Record<string, string[]>; // gameId -> levelIds[]
  currentGameId: string;
  totalXP: number;
  lastPlayedAt: string;
  gamesUnlocked: string[];
  achievements: string[];
}

export interface GameModeConfig {
  id: GameMode;
  name: string;
  icon: string;
  description: string;
  tagline: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// GAME MODE CONFIGURATIONS
// ═══════════════════════════════════════════════════════════════════════════════

export const GAME_MODES: Record<GameMode, GameModeConfig> = {
  god: {
    id: 'god',
    name: 'GOD MODE',
    icon: '⚡',
    description: 'Everything unlocked. Explore freely like a divine being.',
    tagline: 'Omniscient Explorer',
  },
  devil: {
    id: 'devil',
    name: 'DEVIL MODE',
    icon: '🔥',
    description: 'Everything locked. Prove your worth, one level at a time.',
    tagline: 'The Hard Way',
  },
  normal: {
    id: 'normal',
    name: 'STORY MODE',
    icon: '📖',
    description: 'Journey through my portfolio like an adventure. Complete games to unlock new chapters.',
    tagline: 'The Narrative Path',
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE GAMES DATA
// ═══════════════════════════════════════════════════════════════════════════════

export const PAGE_GAMES: PageGame[] = [
  {
    id: 'home',
    path: '/',
    title: 'HOME BASE',
    subtitle: 'The Command Center',
    description: 'Your starting point. Master the grid arcade to unlock the portfolio.',
    icon: 'home',
    gameType: 'arcade',
    primaryColor: 'var(--accent-color)',
    order: 1,
    shortcut: '1',
    levels: [
      {
        id: 'home-intro',
        name: 'First Contact',
        description: 'Land on the home page',
        xpReward: 10,
        completionType: 'view',
      },
      {
        id: 'home-snake',
        name: 'Snake Charmer',
        description: 'Play Snake Trail game',
        xpReward: 25,
        completionType: 'score',
        completionTarget: 10,
      },
      {
        id: 'home-painter',
        name: 'Digital Artist',
        description: 'Paint with Grid Painter',
        xpReward: 25,
        completionType: 'score',
        completionTarget: 50,
      },
      {
        id: 'home-collector',
        name: 'Treasure Hunter',
        description: 'Collect items in Grid Collector',
        xpReward: 25,
        completionType: 'score',
        completionTarget: 15,
      },
      {
        id: 'home-avoider',
        name: 'Dodge Master',
        description: 'Survive Grid Avoider for 30 seconds',
        xpReward: 25,
        completionType: 'time',
        completionTarget: 30,
      },
      {
        id: 'home-explorer',
        name: 'Grid Explorer',
        description: 'Discover all interactive tiles',
        xpReward: 30,
        completionType: 'interact',
        completionTarget: 5,
      },
      {
        id: 'home-timetravel',
        name: 'Time Traveler',
        description: 'Try all design eras',
        xpReward: 30,
        completionType: 'interact',
        completionTarget: 5,
      },
      {
        id: 'home-highscore',
        name: 'High Scorer',
        description: 'Reach 100 points in any game',
        xpReward: 50,
        completionType: 'score',
        completionTarget: 100,
      },
      {
        id: 'home-master',
        name: 'Arcade Master',
        description: 'Complete all home challenges',
        xpReward: 100,
        completionType: 'interact',
        completionTarget: 8,
      },
    ],
  },
  {
    id: 'about',
    path: '/about',
    title: 'ORIGIN STORY',
    subtitle: 'The Runner',
    description: 'Run through my journey. Dodge obstacles, collect memories.',
    icon: 'user',
    gameType: 'runner',
    primaryColor: '#4ECDC4',
    order: 2,
    shortcut: '2',
    requiredGameId: 'home',
    levels: [
      {
        id: 'about-arrive',
        name: 'New Chapter',
        description: 'Enter the About page',
        xpReward: 10,
        completionType: 'view',
      },
      {
        id: 'about-intro',
        name: 'First Impressions',
        description: 'Read the intro section',
        xpReward: 20,
        completionType: 'scroll',
        completionTarget: 20,
      },
      {
        id: 'about-journey',
        name: 'The Journey',
        description: 'Scroll through my timeline',
        xpReward: 30,
        completionType: 'scroll',
        completionTarget: 50,
      },
      {
        id: 'about-skills',
        name: 'Skill Tree',
        description: 'Discover my skills section',
        xpReward: 25,
        completionType: 'scroll',
        completionTarget: 70,
      },
      {
        id: 'about-complete',
        name: 'Story Complete',
        description: 'Read the full origin story',
        xpReward: 50,
        completionType: 'scroll',
        completionTarget: 95,
      },
    ],
  },
  {
    id: 'work',
    path: '/work',
    title: 'ARSENAL',
    subtitle: 'The Shooter',
    description: 'Shoot through projects. Target what interests you.',
    icon: 'grid',
    gameType: 'shooter',
    primaryColor: '#FF6B6B',
    order: 3,
    shortcut: '3',
    requiredGameId: 'about',
    levels: [
      {
        id: 'work-enter',
        name: 'Armory Access',
        description: 'Enter the work section',
        xpReward: 10,
        completionType: 'view',
      },
      {
        id: 'work-browse',
        name: 'Window Shopping',
        description: 'Browse the project gallery',
        xpReward: 20,
        completionType: 'scroll',
        completionTarget: 30,
      },
      {
        id: 'work-click',
        name: 'First Hit',
        description: 'Click on a project card',
        xpReward: 25,
        completionType: 'interact',
        completionTarget: 1,
      },
      {
        id: 'work-explore',
        name: 'Deep Dive',
        description: 'Explore 3 different projects',
        xpReward: 40,
        completionType: 'interact',
        completionTarget: 3,
      },
      {
        id: 'work-collector',
        name: 'Project Collector',
        description: 'View all main projects',
        xpReward: 60,
        completionType: 'interact',
        completionTarget: 5,
      },
    ],
  },
  {
    id: 'case-studies',
    path: '/case-studies',
    title: 'DEEP OPS',
    subtitle: 'The Puzzle',
    description: 'Solve the puzzle of each case study. Piece together the process.',
    icon: 'folder',
    gameType: 'puzzle',
    primaryColor: '#9B59B6',
    order: 4,
    shortcut: '4',
    requiredGameId: 'work',
    levels: [
      {
        id: 'cases-unlock',
        name: 'Case Files',
        description: 'Access the case studies',
        xpReward: 10,
        completionType: 'view',
      },
      {
        id: 'cases-select',
        name: 'Case Selected',
        description: 'Choose a case study to explore',
        xpReward: 20,
        completionType: 'interact',
        completionTarget: 1,
      },
      {
        id: 'cases-process',
        name: 'Process Uncovered',
        description: 'Read through a full case study',
        xpReward: 40,
        completionType: 'scroll',
        completionTarget: 90,
      },
      {
        id: 'cases-detective',
        name: 'Design Detective',
        description: 'Complete 2 case studies',
        xpReward: 60,
        completionType: 'interact',
        completionTarget: 2,
      },
    ],
  },
  {
    id: 'progress',
    path: '/progress',
    title: 'SKILL TREE',
    subtitle: 'The Builder',
    description: 'Build your understanding of my growth. Level up with me.',
    icon: 'chart',
    gameType: 'builder',
    primaryColor: '#F39C12',
    order: 5,
    shortcut: '5',
    requiredGameId: 'case-studies',
    levels: [
      {
        id: 'progress-enter',
        name: 'Growth Log',
        description: 'Access the progress tracker',
        xpReward: 10,
        completionType: 'view',
      },
      {
        id: 'progress-goals',
        name: 'Goal Seeker',
        description: 'View current goals',
        xpReward: 20,
        completionType: 'scroll',
        completionTarget: 30,
      },
      {
        id: 'progress-timeline',
        name: 'Timeline Walker',
        description: 'Explore the learning journey',
        xpReward: 30,
        completionType: 'scroll',
        completionTarget: 70,
      },
    ],
  },
  {
    id: 'map',
    path: '/map',
    title: 'WORLD MAP',
    subtitle: 'The Explorer',
    description: 'Navigate the portfolio universe. Discover hidden paths.',
    icon: 'globe',
    gameType: 'explorer',
    primaryColor: '#1ABC9C',
    order: 6,
    shortcut: '6',
    requiredGameId: 'progress',
    levels: [
      {
        id: 'map-discover',
        name: 'Cartographer',
        description: 'View the site map',
        xpReward: 10,
        completionType: 'view',
      },
      {
        id: 'map-navigate',
        name: 'Navigator',
        description: 'Use the map to visit a page',
        xpReward: 25,
        completionType: 'interact',
        completionTarget: 1,
      },
      {
        id: 'map-explore',
        name: 'Full Coverage',
        description: 'Visit all mapped locations',
        xpReward: 50,
        completionType: 'interact',
        completionTarget: 7,
      },
    ],
  },
  {
    id: 'contact',
    path: '/contact',
    title: 'TRANSMIT',
    subtitle: 'The Collector',
    description: 'Collect the courage to reach out. Send a signal.',
    icon: 'envelope',
    gameType: 'collector',
    primaryColor: '#E74C3C',
    order: 7,
    shortcut: '7',
    requiredGameId: 'map',
    levels: [
      {
        id: 'contact-find',
        name: 'Signal Found',
        description: 'Reach the contact page',
        xpReward: 10,
        completionType: 'view',
      },
      {
        id: 'contact-form',
        name: 'Message Composed',
        description: 'Start filling the contact form',
        xpReward: 20,
        completionType: 'interact',
        completionTarget: 1,
      },
      {
        id: 'contact-send',
        name: 'Transmission Sent',
        description: 'Send a message',
        xpReward: 100,
        completionType: 'interact',
        completionTarget: 1,
      },
    ],
  },
  {
    id: 'lab',
    path: '/lab',
    title: 'LAB',
    subtitle: 'The Arcade',
    description: 'Interactive games and experiments. Play, explore, experiment.',
    icon: 'grid',
    gameType: 'arcade',
    primaryColor: '#9B59B6',
    order: 8,
    shortcut: '8',
    levels: [
      {
        id: 'lab-enter',
        name: 'Lab Access',
        description: 'Enter the lab',
        xpReward: 10,
        completionType: 'view',
      },
      {
        id: 'lab-play',
        name: 'First Experiment',
        description: 'Play a game',
        xpReward: 20,
        completionType: 'interact',
        completionTarget: 1,
      },
      {
        id: 'lab-explore',
        name: 'Lab Explorer',
        description: 'Try 3 different games',
        xpReward: 40,
        completionType: 'interact',
        completionTarget: 3,
      },
      {
        id: 'lab-master',
        name: 'Lab Master',
        description: 'Play all available games',
        xpReward: 100,
        completionType: 'interact',
        completionTarget: 5,
      },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

export const getGameById = (id: string): PageGame | undefined => {
  return PAGE_GAMES.find(game => game.id === id);
};

export const getGameByPath = (path: string): PageGame | undefined => {
  return PAGE_GAMES.find(game => game.path === path);
};

export const getGameProgress = (gameId: string, progress: GameProgress): number => {
  const game = getGameById(gameId);
  if (!game) return 0;
  const completedLevels = progress.completedLevels[gameId] || [];
  return Math.round((completedLevels.length / game.levels.length) * 100);
};

export const isGameUnlocked = (gameId: string, progress: GameProgress, mode: GameMode): boolean => {
  // GOD mode: everything unlocked
  if (mode === 'god') return true;
  
  // Home is always unlocked
  const game = getGameById(gameId);
  if (!game || game.id === 'home') return true;
  
  // Check if explicitly unlocked
  if (progress.gamesUnlocked.includes(gameId)) return true;
  
  // Devil mode: must complete ALL previous games' levels
  if (mode === 'devil') {
    const previousGames = PAGE_GAMES.filter(g => g.order < game.order);
    return previousGames.every(prevGame => {
      const completedLevels = progress.completedLevels[prevGame.id] || [];
      return completedLevels.length === prevGame.levels.length;
    });
  }
  
  // Normal mode: previous game must be complete
  if (mode === 'normal' && game.requiredGameId) {
    const requiredGame = getGameById(game.requiredGameId);
    if (requiredGame) {
      const completedLevels = progress.completedLevels[requiredGame.id] || [];
      return completedLevels.length >= Math.ceil(requiredGame.levels.length * 0.5); // 50% to unlock next
    }
  }
  
  return false;
};

export const isLevelUnlocked = (
  gameId: string, 
  levelId: string, 
  progress: GameProgress, 
  mode: GameMode
): boolean => {
  // GOD mode: everything unlocked
  if (mode === 'god') return true;
  
  // Game must be unlocked first
  if (!isGameUnlocked(gameId, progress, mode)) return false;
  
  const game = getGameById(gameId);
  if (!game) return false;
  
  const levelIndex = game.levels.findIndex(l => l.id === levelId);
  if (levelIndex === -1) return false;
  
  // First level always unlocked if game is unlocked
  if (levelIndex === 0) return true;
  
  // Normal mode: all levels in current game are unlocked
  if (mode === 'normal') return true;
  
  // Devil mode: previous level must be completed
  if (mode === 'devil') {
    const previousLevel = game.levels[levelIndex - 1];
    const completedLevels = progress.completedLevels[gameId] || [];
    return completedLevels.includes(previousLevel.id);
  }
  
  return true;
};

export const getNextGame = (currentGameId: string): PageGame | undefined => {
  const currentGame = getGameById(currentGameId);
  if (!currentGame) return undefined;
  return PAGE_GAMES.find(game => game.order === currentGame.order + 1);
};

export const getTotalXP = (): number => {
  return PAGE_GAMES.reduce((total, game) => {
    return total + game.levels.reduce((sum, level) => sum + level.xpReward, 0);
  }, 0);
};

export const createInitialProgress = (): GameProgress => ({
  completedLevels: {},
  currentGameId: 'home',
  totalXP: 0,
  lastPlayedAt: new Date().toISOString(),
  gamesUnlocked: ['home'],
  achievements: [],
});

// Game type icons/emojis for visual variety
export const GAME_TYPE_EMOJIS: Record<PageGame['gameType'], string> = {
  arcade: '🎮',
  runner: '🏃',
  shooter: '🎯',
  puzzle: '🧩',
  explorer: '🗺️',
  builder: '🏗️',
  collector: '💎',
};
