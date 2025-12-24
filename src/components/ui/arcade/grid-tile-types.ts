/**
 * Grid Tile Types - Interactive Tile System
 * 
 * Defines 5 types of tiles that appear in the grid and what happens
 * when players interact with them. Each tile type has different
 * visual styles, rewards, and interaction patterns.
 * 
 * Tile Types:
 * 1. 🚀 PROJECT - Reveals a project/case study card
 * 2. 📖 STORY - Shows a personal story or journey snippet
 * 3. 🎯 SKILL - Displays a skill badge with proficiency
 * 4. 🧩 CHALLENGE - Mini-puzzle or riddle to solve
 * 5. ✨ FUN FACT - Random interesting fact about me
 */

export type TileType = 'project' | 'story' | 'skill' | 'challenge' | 'funfact';

export interface TileConfig {
  type: TileType;
  emoji: string;
  label: string;
  color: string;
  bgColor: string;
  description: string;
  pointValue: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic';
}

export const TILE_CONFIGS: Record<TileType, TileConfig> = {
  project: {
    type: 'project',
    emoji: '🚀',
    label: 'PROJECT',
    color: 'var(--accent-color)',
    bgColor: 'var(--bg-secondary)',
    description: 'Discover a project I\'ve built',
    pointValue: 50,
    rarity: 'uncommon',
  },
  story: {
    type: 'story',
    emoji: '📖',
    label: 'STORY',
    color: '#8B5CF6',
    bgColor: '#F3E8FF',
    description: 'A snippet from my journey',
    pointValue: 30,
    rarity: 'common',
  },
  skill: {
    type: 'skill',
    emoji: '🎯',
    label: 'SKILL',
    color: '#10B981',
    bgColor: '#D1FAE5',
    description: 'One of my superpowers',
    pointValue: 25,
    rarity: 'common',
  },
  challenge: {
    type: 'challenge',
    emoji: '🧩',
    label: 'PUZZLE',
    color: '#F59E0B',
    bgColor: '#FEF3C7',
    description: 'Solve this for bonus points!',
    pointValue: 100,
    rarity: 'rare',
  },
  funfact: {
    type: 'funfact',
    emoji: '✨',
    label: 'FUN FACT',
    color: '#EC4899',
    bgColor: '#FCE7F3',
    description: 'Something quirky about me',
    pointValue: 15,
    rarity: 'common',
  },
};

// Tile content data for each type - Now with richer portfolio info!

export interface ProjectTileContent {
  id: string;
  title: string;
  company: string;
  year: string;
  tags: string[];
  teaser: string;
  link?: string;
}

export const PROJECT_TILES: ProjectTileContent[] = [
  {
    id: 'hp-print-ai',
    title: 'HP Print AI Observability',
    company: 'HP Inc.',
    year: '2024',
    tags: ['AI/ML', 'Observability', 'Splunk'],
    teaser: 'Automated incident rituals with AI-powered dashboards',
    link: '/case-studies/hp-print-ai',
  },
  {
    id: 'squarebridge',
    title: 'Squarebridge Design System',
    company: 'SNS Square',
    year: '2023',
    tags: ['Design System', 'Figma', 'React'],
    teaser: '150+ screens unified into one cohesive system',
    link: '/case-studies/squarebridge',
  },
  {
    id: 'peoplegamez',
    title: 'PeopleGamez Culture Sim',
    company: 'PeopleGamez.com',
    year: '2022',
    tags: ['Gamification', 'HR Tech', 'Dashboards'],
    teaser: 'Making hiring playful and measurable',
    link: '/case-studies/peoplegamez',
  },
  {
    id: 'kiruk-portfolio',
    title: 'This Portfolio You\'re On',
    company: 'Personal',
    year: '2024',
    tags: ['Next.js', 'Framer Motion', 'Game Dev'],
    teaser: 'A playful experiment in portfolio design',
    link: '/',
  },
  {
    id: 'hp-workflows',
    title: 'Print AI Workflow Launchpad',
    company: 'HP Inc.',
    year: '2024',
    tags: ['Product', 'UX Writing', 'Launch'],
    teaser: 'Shipped workflow guides & onboarding microsites',
    link: '/case-studies/hp-workflows',
  },
];

export interface StoryTileContent {
  id: string;
  title: string;
  emoji: string;
  snippet: string;
  fullStory?: string;
}

export const STORY_TILES: StoryTileContent[] = [
  {
    id: 'family-feedback',
    title: 'The 30-Person Design Review',
    emoji: '🏡',
    snippet: 'Grew up in a creative family of 30. Every design got honest feedback over dinner.',
    fullStory: 'In my large Tamil family, creativity was the norm. Uncle was a filmmaker, cousins were artists, and everyone had an opinion. This taught me to seek feedback early and often.',
  },
  {
    id: 'biryani-qa',
    title: 'QA for Biryani',
    emoji: '📝',
    snippet: 'In middle school, I tested my uncle\'s ERP software. Payment? The best biryani in town.',
    fullStory: 'My uncle was building an ERP system and needed a young tester who wouldn\'t hold back. I found bugs, he made biryani. Fair trade.',
  },
  {
    id: 'pandemic-lab',
    title: 'The Pandemic Lab',
    emoji: '🧪',
    snippet: 'Lockdown = learning lab with my cousin. Mobile games, FigJam, motion graphics.',
    fullStory: 'When the world stopped, my cousin and I didn\'t. We taught ourselves game dev, animation, and design tools. Some of the best learning happened in those strange times.',
  },
  {
    id: 'workshop-host',
    title: 'Teaching 60+ Students',
    emoji: '🎓',
    snippet: 'Hosted design-meets-dev workshops. Best moment: seeing the lightbulb clicks.',
    fullStory: 'Nothing beats the feeling of helping someone understand a concept for the first time. I\'ve hosted workshops on UI/UX, design systems, and creative coding.',
  },
  {
    id: 'trek-creative',
    title: 'Mountains & Ideas',
    emoji: '🏔️',
    snippet: 'Trekking keeps my creative barometer steady. Best ideas come at altitude.',
    fullStory: 'There\'s something about being on a mountain trail that clears the mind. Some of my best creative solutions have come after a weekend trek.',
  },
  {
    id: 'hp-journey',
    title: 'Joining HP Print AI',
    emoji: '💼',
    snippet: 'From design lead to cloud engineer at HP. A full-stack evolution.',
    fullStory: 'Started as a designer, now building cloud microservices. HP taught me that the best engineers understand both user needs and system architecture.',
  },
  {
    id: 'ax-design',
    title: 'AX Design Discovery',
    emoji: '🤖',
    snippet: 'AI Experience Design - bridging AI systems with human-centered design.',
    fullStory: 'I realized my unique strength: making complex AI accessible. Not just building models, but crafting experiences around them.',
  },
  {
    id: 'sona-cultural',
    title: 'Leading Sona Cultural Design',
    emoji: '🎭',
    snippet: 'College cultural fest design lead. 1000+ attendees, endless posters.',
    fullStory: 'Led design for our college\'s biggest cultural fest. Learned to manage creative teams under pressure while maintaining quality.',
  },
];

export interface SkillTileContent {
  id: string;
  name: string;
  emoji: string;
  level: 'learning' | 'comfortable' | 'proficient' | 'expert';
  years: number;
  tools: string[];
}

export const SKILL_TILES: SkillTileContent[] = [
  {
    id: 'react-next',
    name: 'React & Next.js',
    emoji: '⚡',
    level: 'proficient',
    years: 3,
    tools: ['React', 'Next.js', 'TypeScript', 'Framer Motion'],
  },
  {
    id: 'design-systems',
    name: 'Design Systems',
    emoji: '🎨',
    level: 'expert',
    years: 4,
    tools: ['Figma', 'Storybook', 'Tokens', 'Documentation'],
  },
  {
    id: 'ux-research',
    name: 'UX Research',
    emoji: '🔍',
    level: 'proficient',
    years: 3,
    tools: ['User Interviews', 'Usability Testing', 'Journey Mapping'],
  },
  {
    id: 'ai-facilitation',
    name: 'AI Facilitation',
    emoji: '🤖',
    level: 'comfortable',
    years: 2,
    tools: ['Prompt Engineering', 'LLM Integration', 'AI Tools'],
  },
  {
    id: 'backend-dev',
    name: 'Backend Development',
    emoji: '🔧',
    level: 'comfortable',
    years: 2,
    tools: ['Node.js', 'Spring Boot', 'PostgreSQL', 'APIs'],
  },
  {
    id: 'observability',
    name: 'Observability',
    emoji: '📊',
    level: 'proficient',
    years: 2,
    tools: ['Splunk', 'Prometheus', 'Grafana', 'APM'],
  },
  {
    id: 'spring-boot',
    name: 'Spring Boot',
    emoji: '🍃',
    level: 'proficient',
    years: 2,
    tools: ['Java', 'Spring Boot', 'Microservices', 'REST APIs'],
  },
  {
    id: 'aws-cloud',
    name: 'AWS Cloud',
    emoji: '☁️',
    level: 'comfortable',
    years: 2,
    tools: ['SQS', 'SNS', 'DynamoDB', 'Lambda'],
  },
  {
    id: 'gamification',
    name: 'Gamification Design',
    emoji: '🎮',
    level: 'proficient',
    years: 3,
    tools: ['Game Mechanics', 'Progression Systems', 'Engagement Loops'],
  },
];

export interface ChallengeTileContent {
  id: string;
  question: string;
  emoji: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  bonusPoints: number;
}

export const CHALLENGE_TILES: ChallengeTileContent[] = [
  {
    id: 'design-principle',
    question: 'What\'s the most important rule in design?',
    emoji: '🎨',
    options: ['Make it pretty', 'Solve the problem', 'Use lots of colors', 'Copy Dribbble'],
    correctIndex: 1,
    explanation: 'Design is problem-solving. Pretty comes after useful.',
    bonusPoints: 100,
  },
  {
    id: 'accessibility',
    question: 'Why is accessibility important?',
    emoji: '♿',
    options: ['Legal requirement', 'It\'s nice to have', 'Everyone deserves access', 'Performance boost'],
    correctIndex: 2,
    explanation: 'Accessibility ensures everyone can use what we build. It\'s about inclusion.',
    bonusPoints: 100,
  },
  {
    id: 'code-smell',
    question: 'What\'s a "code smell"?',
    emoji: '🐛',
    options: ['When your code literally smells', 'A hint that something might be wrong', 'A new programming language', 'A bug'],
    correctIndex: 1,
    explanation: 'Code smells are indicators of deeper problems in code structure.',
    bonusPoints: 100,
  },
  {
    id: 'kiruk-meaning',
    question: 'What does "Kiruk" mean in Tamil?',
    emoji: '✍️',
    options: ['Hello', 'Scribble', 'Design', 'Computer'],
    correctIndex: 1,
    explanation: 'Kiruk means scribble! Every great idea starts as a scribble in my notebook.',
    bonusPoints: 100,
  },
  {
    id: 'arun-location',
    question: 'Where is Arun currently based?',
    emoji: '📍',
    options: ['Chennai', 'Bangalore', 'Mumbai', 'Delhi'],
    correctIndex: 1,
    explanation: 'I\'m based in Bangalore, India - the tech hub!',
    bonusPoints: 100,
  },
];

export interface FunFactTileContent {
  id: string;
  fact: string;
  emoji: string;
  category: 'personal' | 'work' | 'random';
}

export const FUNFACT_TILES: FunFactTileContent[] = [
  {
    id: 'kiruk-meaning',
    fact: '"Kiruk" means "scribble" in Tamil. Every great idea starts as a scribble!',
    emoji: '✍️',
    category: 'personal',
  },
  {
    id: 'chai-fuel',
    fact: 'I run on filter coffee. 3 cups minimum to hit peak creativity.',
    emoji: '☕',
    category: 'personal',
  },
  {
    id: 'notebook-count',
    fact: 'I\'ve filled 20+ notebooks with sketches, wireframes, and random ideas.',
    emoji: '📓',
    category: 'work',
  },
  {
    id: 'first-website',
    fact: 'My first website was a gaming blog in 2010. It had a visitor counter and everything.',
    emoji: '🎮',
    category: 'personal',
  },
  {
    id: 'meeting-doodles',
    fact: 'I doodle in every meeting. It helps me focus, not zone out.',
    emoji: '🖊️',
    category: 'work',
  },
  {
    id: 'trek-count',
    fact: 'I\'ve done 15+ treks in the Western Ghats. Next goal: Himalayas.',
    emoji: '⛰️',
    category: 'personal',
  },
  {
    id: 'keyboard',
    fact: 'I use a mechanical keyboard with Cherry MX Browns. The click is therapy.',
    emoji: '⌨️',
    category: 'random',
  },
  {
    id: 'design-tool',
    fact: 'Figma is my daily driver, but pen & paper is where ideas are born.',
    emoji: '✏️',
    category: 'work',
  },
  {
    id: 'hp-role',
    fact: 'At HP, I work on Print AI observability - making printers smarter!',
    emoji: '🖨️',
    category: 'work',
  },
  {
    id: 'workshops',
    fact: 'I\'ve taught 60+ students in design workshops. Teaching is my second love.',
    emoji: '👨‍🏫',
    category: 'work',
  },
  {
    id: 'tt-player',
    fact: 'Table tennis enthusiast - quick reflexes help in both ping pong and debugging!',
    emoji: '🏓',
    category: 'personal',
  },
  {
    id: 'versatile',
    fact: 'I call myself a versatile generalist - design, code, and everything in between.',
    emoji: '🎯',
    category: 'work',
  },
  {
    id: 'collab-lover',
    fact: 'I prefer trekking over parties. Nature > networking events.',
    emoji: '🌲',
    category: 'personal',
  },
  {
    id: 'bengaluru',
    fact: 'Based in Bangalore, open to hybrid work. Coffee meetups welcome!',
    emoji: '🏙️',
    category: 'personal',
  },
];

// Helper to get random content for each tile type
export function getRandomTileContent(type: TileType): unknown {
  switch (type) {
    case 'project':
      return PROJECT_TILES[Math.floor(Math.random() * PROJECT_TILES.length)];
    case 'story':
      return STORY_TILES[Math.floor(Math.random() * STORY_TILES.length)];
    case 'skill':
      return SKILL_TILES[Math.floor(Math.random() * SKILL_TILES.length)];
    case 'challenge':
      return CHALLENGE_TILES[Math.floor(Math.random() * CHALLENGE_TILES.length)];
    case 'funfact':
      return FUNFACT_TILES[Math.floor(Math.random() * FUNFACT_TILES.length)];
    default:
      return null;
  }
}

// Weighted random tile type selection (common types appear more often)
export function getRandomTileType(): TileType {
  const weights: Record<TileType, number> = {
    funfact: 30,     // Common
    story: 25,       // Common
    skill: 25,       // Common  
    project: 15,     // Uncommon
    challenge: 5,    // Rare
  };
  
  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  let random = Math.random() * total;
  
  for (const [type, weight] of Object.entries(weights)) {
    random -= weight;
    if (random <= 0) {
      return type as TileType;
    }
  }
  
  return 'funfact'; // Fallback
}

// Level system based on tiles explored
export interface PlayerProgress {
  tilesExplored: number;
  totalPoints: number;
  level: number;
  title: string;
  nextLevelAt: number;
}

export function calculateProgress(tilesExplored: number, totalPoints: number): PlayerProgress {
  const levels = [
    { level: 1, title: 'Curious Visitor', minTiles: 0 },
    { level: 2, title: 'Active Explorer', minTiles: 5 },
    { level: 3, title: 'Dedicated Researcher', minTiles: 10 },
    { level: 4, title: 'Portfolio Enthusiast', minTiles: 20 },
    { level: 5, title: 'True Fan', minTiles: 35 },
    { level: 6, title: 'Honorary Collaborator', minTiles: 50 },
  ];

  let currentLevel = levels[0];
  let nextLevelAt = levels[1]?.minTiles || 999;

  for (let i = levels.length - 1; i >= 0; i--) {
    if (tilesExplored >= levels[i].minTiles) {
      currentLevel = levels[i];
      nextLevelAt = levels[i + 1]?.minTiles || 999;
      break;
    }
  }

  return {
    tilesExplored,
    totalPoints,
    level: currentLevel.level,
    title: currentLevel.title,
    nextLevelAt,
  };
}
