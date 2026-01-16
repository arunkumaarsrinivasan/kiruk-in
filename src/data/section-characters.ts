// Section Characters Data - Data-driven configuration for 8-bit characters per section
// Each section has a unique character appearance with different hats, costumes, and personalities

export type HatType = 'none' | 'beret' | 'cap' | 'hardhat' | 'fedora' | 'headphones' | 'officer' | 'crown';

export type EyeStyle = 'normal' | 'focused' | 'curious' | 'excited' | 'wink' | 'closed';

export type MouthStyle = 'smile' | 'speaking' | 'thinking' | 'neutral' | 'grin' | 'surprised';

export type PropType = 
  | 'none'
  | 'pencil'
  | 'laptop'
  | 'badge'
  | 'paintbrush'
  | 'magnifying-glass'
  | 'coffee'
  | 'phone'
  | 'code-bracket'
  | 'briefcase'
  | 'notebook'
  | 'camera';

export interface CostumeColors {
  primary: string;      // Main shirt/jacket color
  secondary: string;    // Secondary color (collar, accents)
  accent: string;       // Small details
  skin: string;         // Skin tone
  hair: string;         // Hair color
}

export interface CharacterPersonality {
  eyeStyle: EyeStyle;
  mouthStyle: MouthStyle;
  blinkRate?: number;   // Blink animation interval in ms (default: 3000)
  idleAnimation?: 'breathing' | 'nodding' | 'waving' | 'none';
}

export interface CharacterProps {
  leftHand: PropType;
  rightHand: PropType;
}

export interface SectionCharacterConfig {
  sectionId: string;
  name: string;
  description: string;
  hatType: HatType;
  hatColor?: string;                // Override default hat color
  costumeColors: CostumeColors;
  personality: CharacterPersonality;
  props: CharacterProps;
  // Special effects
  glowColor?: string;               // Optional glow effect color
  particles?: 'sparkles' | 'code' | 'paint' | 'none';
}

// Default skin and hair colors (can be overridden per character)
const DEFAULT_SKIN = '#FDBF60';
const DEFAULT_HAIR = '#4A4A4A';

// Predefined costume color palettes
const COSTUMES = {
  designer: {
    primary: '#E91E63',     // Pink/magenta
    secondary: '#F8BBD9',
    accent: '#AD1457',
    skin: DEFAULT_SKIN,
    hair: DEFAULT_HAIR,
  },
  developer: {
    primary: '#2196F3',     // Blue
    secondary: '#1565C0',
    accent: '#0D47A1',
    skin: DEFAULT_SKIN,
    hair: DEFAULT_HAIR,
  },
  bridge: {
    primary: '#FF9800',     // Orange
    secondary: '#F57C00',
    accent: '#E65100',
    skin: DEFAULT_SKIN,
    hair: DEFAULT_HAIR,
  },
  professional: {
    primary: '#333333',     // Dark gray/black
    secondary: '#555555',
    accent: '#FFD700',
    skin: DEFAULT_SKIN,
    hair: DEFAULT_HAIR,
  },
  creative: {
    primary: '#9C27B0',     // Purple
    secondary: '#7B1FA2',
    accent: '#E1BEE7',
    skin: DEFAULT_SKIN,
    hair: DEFAULT_HAIR,
  },
  casual: {
    primary: '#4CAF50',     // Green
    secondary: '#388E3C',
    accent: '#81C784',
    skin: DEFAULT_SKIN,
    hair: DEFAULT_HAIR,
  },
  officer: {
    primary: '#1A237E',     // Navy blue
    secondary: '#283593',
    accent: '#FFD700',      // Gold accents
    skin: DEFAULT_SKIN,
    hair: DEFAULT_HAIR,
  },
};

// Section character configurations
export const sectionCharacters: SectionCharacterConfig[] = [
  {
    sectionId: 'header',
    name: 'Intro Arun',
    description: 'The creative professional ready to make an impression',
    hatType: 'beret',
    hatColor: '#E91E63',
    costumeColors: COSTUMES.designer,
    personality: {
      eyeStyle: 'excited',
      mouthStyle: 'grin',
      blinkRate: 4000,
      idleAnimation: 'waving',
    },
    props: {
      leftHand: 'pencil',
      rightHand: 'code-bracket',
    },
    particles: 'sparkles',
  },
  {
    sectionId: 'subject-profile',
    name: 'Professional Arun',
    description: 'The polished professional presenting credentials',
    hatType: 'fedora',
    hatColor: '#333333',
    costumeColors: COSTUMES.professional,
    personality: {
      eyeStyle: 'normal',
      mouthStyle: 'smile',
      blinkRate: 3000,
      idleAnimation: 'breathing',
    },
    props: {
      leftHand: 'badge',
      rightHand: 'briefcase',
    },
    glowColor: 'rgba(255, 215, 0, 0.3)',
  },
  {
    sectionId: 'work-experience',
    name: 'Developer Arun',
    description: 'The focused engineer deep in code',
    hatType: 'headphones',
    hatColor: '#2196F3',
    costumeColors: COSTUMES.developer,
    personality: {
      eyeStyle: 'focused',
      mouthStyle: 'thinking',
      blinkRate: 5000,
      idleAnimation: 'nodding',
    },
    props: {
      leftHand: 'coffee',
      rightHand: 'laptop',
    },
    particles: 'code',
  },
  {
    sectionId: 'case-studies',
    name: 'Creative Arun',
    description: 'The artist showcasing masterpieces',
    hatType: 'beret',
    hatColor: '#9C27B0',
    costumeColors: COSTUMES.creative,
    personality: {
      eyeStyle: 'curious',
      mouthStyle: 'smile',
      blinkRate: 3500,
      idleAnimation: 'waving',
    },
    props: {
      leftHand: 'paintbrush',
      rightHand: 'notebook',
    },
    particles: 'paint',
  },
  {
    sectionId: 'contact',
    name: 'Officer Arun',
    description: 'The investigator inviting you to explore more',
    hatType: 'officer',
    hatColor: '#1A237E',
    costumeColors: COSTUMES.officer,
    personality: {
      eyeStyle: 'wink',
      mouthStyle: 'grin',
      blinkRate: 4000,
      idleAnimation: 'nodding',
    },
    props: {
      leftHand: 'magnifying-glass',
      rightHand: 'badge',
    },
    glowColor: 'rgba(255, 215, 0, 0.4)',
  },
];

// Helper function to get character config by section ID
export function getCharacterBySectionId(sectionId: string): SectionCharacterConfig | undefined {
  return sectionCharacters.find(char => char.sectionId === sectionId);
}

// Helper function to get all section IDs
export function getAllSectionIds(): string[] {
  return sectionCharacters.map(char => char.sectionId);
}

// Default character config (fallback)
export const defaultCharacter: SectionCharacterConfig = {
  sectionId: 'default',
  name: 'Default Arun',
  description: 'The versatile professional',
  hatType: 'none',
  costumeColors: COSTUMES.casual,
  personality: {
    eyeStyle: 'normal',
    mouthStyle: 'smile',
    blinkRate: 3000,
    idleAnimation: 'breathing',
  },
  props: {
    leftHand: 'none',
    rightHand: 'none',
  },
};

// Hat configuration for rendering
export const hatConfigs: Record<HatType, { name: string; baseColor: string }> = {
  none: { name: 'No Hat', baseColor: 'transparent' },
  beret: { name: 'Artist Beret', baseColor: '#E91E63' },
  cap: { name: 'Baseball Cap', baseColor: '#2196F3' },
  hardhat: { name: 'Hard Hat', baseColor: '#FF9800' },
  fedora: { name: 'Fedora', baseColor: '#333333' },
  headphones: { name: 'Headphones', baseColor: '#2196F3' },
  officer: { name: 'Officer Cap', baseColor: '#1A237E' },
  crown: { name: 'Crown', baseColor: '#FFD700' },
};

// Prop configuration for rendering
export const propConfigs: Record<PropType, { name: string; emoji: string }> = {
  none: { name: 'Nothing', emoji: '' },
  pencil: { name: 'Pencil', emoji: '✏️' },
  laptop: { name: 'Laptop', emoji: '💻' },
  badge: { name: 'ID Badge', emoji: '🪪' },
  paintbrush: { name: 'Paintbrush', emoji: '🖌️' },
  'magnifying-glass': { name: 'Magnifying Glass', emoji: '🔍' },
  coffee: { name: 'Coffee', emoji: '☕' },
  phone: { name: 'Phone', emoji: '📱' },
  'code-bracket': { name: 'Code', emoji: '</>' },
  briefcase: { name: 'Briefcase', emoji: '💼' },
  notebook: { name: 'Notebook', emoji: '📓' },
  camera: { name: 'Camera', emoji: '📷' },
};
