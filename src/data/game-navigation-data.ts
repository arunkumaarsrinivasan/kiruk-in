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
    name: 'MASTER DETECTIVE',
    icon: 'user',
    description: 'Everything unlocked. All evidence revealed. You are the master detective.',
    tagline: 'Omniscient Investigator',
  },
  devil: {
    id: 'devil',
    name: 'HARD MODE',
    icon: 'fire',
    description: 'Everything locked. Prove your detective skills, one clue at a time.',
    tagline: 'The Hard Way',
  },
  normal: {
    id: 'normal',
    name: 'DETECTIVE MODE',
    icon: 'user',
    description: 'Investigate the portfolio like a detective. Complete cases to unlock new evidence.',
    tagline: 'The Detective Path',
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE GAMES DATA
// ═══════════════════════════════════════════════════════════════════════════════

export const PAGE_GAMES: PageGame[] = [
  {
    id: 'home',
    path: '/',
    title: 'DETECTIVE HQ',
    subtitle: 'The Command Center',
    description: 'Your investigation begins here. Master the grid arcade to unlock clues and progress your case.',
    icon: 'home',
    gameType: 'arcade',
    primaryColor: 'var(--accent-color)',
    order: 1,
    shortcut: '1',
    levels: [
      {
        id: 'home-intro',
        name: 'Open Case',
        description: 'Arrive at detective headquarters',
        xpReward: 10,
        completionType: 'view',
      },
      {
        id: 'home-snake',
        name: 'Follow Trail',
        description: 'Follow the snake trail to find clues',
        xpReward: 25,
        completionType: 'score',
        completionTarget: 5,
      },
      {
        id: 'home-painter',
        name: 'Mark Evidence',
        description: 'Mark evidence with the grid painter',
        xpReward: 25,
        completionType: 'score',
        completionTarget: 20,
      },
      {
        id: 'home-collector',
        name: 'Collect Clues',
        description: 'Collect evidence items in the grid',
        xpReward: 25,
        completionType: 'score',
        completionTarget: 8,
      },
      {
        id: 'home-avoider',
        name: 'Avoid Threats',
        description: 'Survive obstacles for 15 seconds',
        xpReward: 25,
        completionType: 'time',
        completionTarget: 15,
      },
      {
        id: 'home-explorer',
        name: 'Explore Scene',
        description: 'Discover all interactive evidence',
        xpReward: 30,
        completionType: 'interact',
        completionTarget: 3,
      },
      {
        id: 'home-timetravel',
        name: 'Check Timeline',
        description: 'Investigate all design eras',
        xpReward: 30,
        completionType: 'interact',
        completionTarget: 3,
      },
      {
        id: 'home-highscore',
        name: 'Master Level',
        description: 'Reach 50 points in any training exercise',
        xpReward: 50,
        completionType: 'score',
        completionTarget: 50,
      },
      {
        id: 'home-master',
        name: 'Complete HQ',
        description: 'Complete all headquarters challenges',
        xpReward: 100,
        completionType: 'interact',
        completionTarget: 5,
      },
    ],
  },
  {
    id: 'about',
    path: '/about',
    title: 'CASE FILE: ORIGIN',
    subtitle: 'The Pursuit',
    description: 'Investigate the origin story. Run through the timeline, dodge obstacles, and collect evidence.',
    icon: 'user',
    gameType: 'runner',
    primaryColor: '#4ECDC4',
    order: 2,
    shortcut: '2',
    requiredGameId: 'home',
    levels: [
      {
        id: 'about-arrive',
        name: 'Open File',
        description: 'Access the origin case file',
        xpReward: 10,
        completionType: 'view',
      },
      {
        id: 'about-intro',
        name: 'Read Intro',
        description: 'Read the intro section',
        xpReward: 20,
        completionType: 'scroll',
        completionTarget: 10,
      },
      {
        id: 'about-journey',
        name: 'Analyze Timeline',
        description: 'Investigate the timeline',
        xpReward: 30,
        completionType: 'scroll',
        completionTarget: 30,
      },
      {
        id: 'about-skills',
        name: 'Check Skills',
        description: 'Access the skills database',
        xpReward: 25,
        completionType: 'scroll',
        completionTarget: 50,
      },
      {
        id: 'about-complete',
        name: 'Solve Case',
        description: 'Complete the origin investigation',
        xpReward: 50,
        completionType: 'scroll',
        completionTarget: 70,
      },
    ],
  },
  {
    id: 'work',
    path: '/work',
    title: 'EXPERIENCE ARENA',
    subtitle: 'The Target',
    description: 'Examine the experience arena. Target projects that interest you and gather clues.',
    icon: 'grid',
    gameType: 'shooter',
    primaryColor: '#FF6B6B',
    order: 3,
    shortcut: '3',
    requiredGameId: 'about',
    levels: [
      {
        id: 'work-enter',
        name: 'Enter Locker',
        description: 'Enter the experience arena',
        xpReward: 10,
        completionType: 'view',
      },
      {
        id: 'work-browse',
        name: 'Browse Catalog',
        description: 'Browse the evidence gallery',
        xpReward: 20,
        completionType: 'scroll',
        completionTarget: 15,
      },
      {
        id: 'work-click',
        name: 'Examine Evidence',
        description: 'Examine a piece of evidence',
        xpReward: 25,
        completionType: 'interact',
        completionTarget: 1,
      },
      {
        id: 'work-explore',
        name: 'Deep Dive',
        description: 'Examine 2 different pieces of evidence',
        xpReward: 40,
        completionType: 'interact',
        completionTarget: 2,
      },
      {
        id: 'work-collector',
        name: 'Master Evidence',
        description: 'Examine all main evidence',
        xpReward: 60,
        completionType: 'interact',
        completionTarget: 3,
      },
    ],
  },
  {
    id: 'case-studies',
    path: '/case-studies',
    title: 'DEEP INVESTIGATION',
    subtitle: 'The Puzzle',
    description: 'Solve the mystery of each case study. Piece together the evidence and uncover the full story.',
    icon: 'folder',
    gameType: 'puzzle',
    primaryColor: '#9B59B6',
    order: 4,
    shortcut: '4',
    requiredGameId: 'work',
    levels: [
      {
        id: 'cases-unlock',
        name: 'Unlock Files',
        description: 'Access the deep investigation files',
        xpReward: 10,
        completionType: 'view',
      },
      {
        id: 'cases-select',
        name: 'Select Case',
        description: 'Select a case file to investigate',
        xpReward: 20,
        completionType: 'interact',
        completionTarget: 1,
      },
      {
        id: 'cases-process',
        name: 'Process Evidence',
        description: 'Complete investigation of a case file',
        xpReward: 40,
        completionType: 'scroll',
        completionTarget: 60,
      },
      {
        id: 'cases-detective',
        name: 'Solve Cases',
        description: 'Solve 1 complete case file',
        xpReward: 60,
        completionType: 'interact',
        completionTarget: 1,
      },
    ],
  },
  {
    id: 'progress',
    path: '/progress',
    title: 'DETECTIVE SKILLS',
    subtitle: 'The Tracker',
    description: 'Build your detective skills. Level up your understanding and track your progress.',
    icon: 'chart',
    gameType: 'builder',
    primaryColor: '#F39C12',
    order: 5,
    shortcut: '5',
    requiredGameId: 'case-studies',
    levels: [
      {
        id: 'progress-enter',
        name: 'Open Log',
        description: 'Access the progress tracker',
        xpReward: 10,
        completionType: 'view',
      },
      {
        id: 'progress-goals',
        name: 'Check Goals',
        description: 'View current goals',
        xpReward: 20,
        completionType: 'scroll',
        completionTarget: 15,
      },
      {
        id: 'progress-timeline',
        name: 'Review Timeline',
        description: 'Explore the learning journey',
        xpReward: 30,
        completionType: 'scroll',
        completionTarget: 50,
      },
    ],
  },
  {
    id: 'contact',
    path: '/contact',
    title: 'FINAL TRANSMISSION',
    subtitle: 'The Contact',
    description: 'Complete your investigation. Send a message to close the case.',
    icon: 'envelope',
    gameType: 'collector',
    primaryColor: '#E74C3C',
    order: 6,
    shortcut: '6',
    requiredGameId: 'progress',
    levels: [
      {
        id: 'contact-find',
        name: 'Find Signal',
        description: 'Reach the contact page',
        xpReward: 10,
        completionType: 'view',
      },
      {
        id: 'contact-form',
        name: 'Compose Message',
        description: 'Start filling the contact form',
        xpReward: 20,
        completionType: 'interact',
        completionTarget: 1,
      },
      {
        id: 'contact-send',
        name: 'Send Transmission',
        description: 'Send a message',
        xpReward: 100,
        completionType: 'interact',
        completionTarget: 1,
      },
    ],
  },
  {
    id: 'blog',
    path: '/blog',
    title: 'KNOWLEDGE ARCHIVE',
    subtitle: 'The Library',
    description: 'Browse the knowledge archive. Read articles and insights across different domains.',
    icon: 'book',
    gameType: 'explorer',
    primaryColor: '#3498DB',
    order: 7,
    shortcut: '7',
    requiredGameId: 'contact',
    levels: [
      {
        id: 'blog-enter',
        name: 'Enter Archive',
        description: 'Access the knowledge archive',
        xpReward: 10,
        completionType: 'view',
      },
      {
        id: 'blog-browse',
        name: 'Browse Articles',
        description: 'Browse the article collection',
        xpReward: 20,
        completionType: 'scroll',
        completionTarget: 20,
      },
      {
        id: 'blog-read',
        name: 'Read Article',
        description: 'Read a complete article',
        xpReward: 30,
        completionType: 'interact',
        completionTarget: 1,
      },
      {
        id: 'blog-explore',
        name: 'Explore Domains',
        description: 'Filter articles by domain',
        xpReward: 25,
        completionType: 'interact',
        completionTarget: 1,
      },
      {
        id: 'blog-master',
        name: 'Master Archive',
        description: 'Read 3 different articles',
        xpReward: 60,
        completionType: 'interact',
        completionTarget: 3,
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

// Game type pixel icons for visual variety
export const GAME_TYPE_ICONS: Record<PageGame['gameType'], string> = {
  arcade: 'flag-checkered',
  runner: 'bolt',
  shooter: 'eye',
  puzzle: 'sparkles',
  explorer: 'globe',
  builder: 'chart',
  collector: 'trophy',
};
