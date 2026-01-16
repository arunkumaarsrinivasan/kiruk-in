/**
 * Skill Pin Board Data
 * Constellation-based organization of skills with expertise levels
 */

export type ExpertiseLevel = 'expert' | 'advanced' | 'proficient' | 'learning';

export interface Skill {
  id: string;
  name: string;
  expertise: ExpertiseLevel;
  connections: string[]; // IDs of connected skills
}

export interface Constellation {
  id: string;
  westernName: string;
  description: string;
  color: string;
  skills: Skill[];
}

export const EXPERTISE_COLORS: Record<ExpertiseLevel, string> = {
  expert: '#ef4444', // Red
  advanced: '#3b82f6', // Blue
  proficient: '#22c55e', // Green
  learning: '#6b7280', // Grey
};

export const EXPERTISE_LABELS: Record<ExpertiseLevel, string> = {
  expert: 'Expert Level',
  advanced: 'Advanced',
  proficient: 'Proficient',
  learning: 'Learning',
};

// Skill definitions
const skills: Record<string, Skill> = {
  // Andromeda the Visionary
  'ui-ux': {
    id: 'ui-ux',
    name: 'UI/UX',
    expertise: 'expert',
    connections: ['user-research', 'prototyping', 'design-systems'],
  },
  'user-research': {
    id: 'user-research',
    name: 'User Research',
    expertise: 'advanced',
    connections: ['ui-ux', 'prototyping', 'branding'],
  },
  'prototyping': {
    id: 'prototyping',
    name: 'Prototyping',
    expertise: 'proficient',
    connections: ['ui-ux', 'user-research'],
  },
  'branding': {
    id: 'branding',
    name: 'Branding',
    expertise: 'advanced',
    connections: ['user-research'],
  },
  'accessibility': {
    id: 'accessibility',
    name: 'Accessibility',
    expertise: 'proficient',
    connections: ['ui-ux'],
  },
  'design-systems': {
    id: 'design-systems',
    name: 'design systems',
    expertise: 'learning',
    connections: ['ui-ux', 'figma'],
  },

  // Orion the Builder
  'react': {
    id: 'react',
    name: 'React',
    expertise: 'expert',
    connections: ['flutter', 'nextjs', 'threejs'],
  },
  'flutter': {
    id: 'flutter',
    name: 'Flutter',
    expertise: 'advanced',
    connections: ['react', 'gsap'],
  },
  'nextjs': {
    id: 'nextjs',
    name: 'Next.js',
    expertise: 'proficient',
    connections: ['react'],
  },
  'threejs': {
    id: 'threejs',
    name: 'Three.js',
    expertise: 'proficient',
    connections: ['react'],
  },
  'gsap': {
    id: 'gsap',
    name: 'GSAP',
    expertise: 'learning',
    connections: ['flutter'],
  },

  // Cassiopeia the Guide
  'design-leadership': {
    id: 'design-leadership',
    name: 'Design Leadership',
    expertise: 'expert',
    connections: ['mentoring', 'agile-scrum'],
  },
  'mentoring': {
    id: 'mentoring',
    name: 'Mentoring',
    expertise: 'advanced',
    connections: ['design-leadership', 'stakeholder-mgmt'],
  },
  'agile-scrum': {
    id: 'agile-scrum',
    name: 'Agile/scrum',
    expertise: 'proficient',
    connections: ['design-leadership', 'splunk', 'stakeholder-mgmt'],
  },
  'splunk': {
    id: 'splunk',
    name: 'Splunk',
    expertise: 'learning',
    connections: ['agile-scrum'],
  },
  'stakeholder-mgmt': {
    id: 'stakeholder-mgmt',
    name: 'Stakeholder Mgmt',
    expertise: 'proficient',
    connections: ['mentoring', 'agile-scrum'],
  },

  // Lyra the Creator
  'adobe-cc': {
    id: 'adobe-cc',
    name: 'Adobe CC',
    expertise: 'advanced',
    connections: ['figma', 'blender'],
  },
  'figma': {
    id: 'figma',
    name: 'Figma',
    expertise: 'expert',
    connections: ['adobe-cc', 'rive', 'spline-3d', 'blender', 'protopie', 'design-systems'],
  },
  'rive': {
    id: 'rive',
    name: 'Rive',
    expertise: 'proficient',
    connections: ['figma'],
  },
  'spline-3d': {
    id: 'spline-3d',
    name: 'spline 3D',
    expertise: 'learning',
    connections: ['figma'],
  },
  'blender': {
    id: 'blender',
    name: 'Blender',
    expertise: 'advanced',
    connections: ['figma', 'adobe-cc'],
  },
  'protopie': {
    id: 'protopie',
    name: 'Protopie',
    expertise: 'proficient',
    connections: ['figma'],
  },

  // Hercules the Scaler
  'docker': {
    id: 'docker',
    name: 'Docker',
    expertise: 'expert',
    connections: ['aws', 'nodejs', 'spring-boot'],
  },
  'aws': {
    id: 'aws',
    name: 'AWS',
    expertise: 'expert',
    connections: ['docker', 'postgresql'],
  },
  'nodejs': {
    id: 'nodejs',
    name: 'Node.js',
    expertise: 'advanced',
    connections: ['docker', 'spring-boot'],
  },
  'spring-boot': {
    id: 'spring-boot',
    name: 'Spring Boot',
    expertise: 'advanced',
    connections: ['docker', 'postgresql'],
  },
  'postgresql': {
    id: 'postgresql',
    name: 'PostgreSQL',
    expertise: 'proficient',
    connections: ['aws', 'spring-boot', 'supabase'],
  },
  'supabase': {
    id: 'supabase',
    name: 'Supabase',
    expertise: 'learning',
    connections: ['postgresql'],
  },
};

export const CONSTELLATIONS: Constellation[] = [
  {
    id: 'andromeda',
    westernName: 'Andromeda the Visionary',
    description: 'Crafting user-centric experiences',
    color: '#ef4444', // Red
    skills: [
      skills['ui-ux'],
      skills['user-research'],
      skills['prototyping'],
      skills['branding'],
      skills['accessibility'],
      skills['design-systems'],
    ],
  },
  {
    id: 'orion',
    westernName: 'Orion the Builder',
    description: 'Architecting the visual web',
    color: '#3b82f6', // Blue
    skills: [
      skills['react'],
      skills['flutter'],
      skills['nextjs'],
      skills['threejs'],
      skills['gsap'],
    ],
  },
  {
    id: 'cassiopeia',
    westernName: 'Cassiopeia the Guide',
    description: 'Leading with Intelligence',
    color: '#f59e0b', // Orange
    skills: [
      skills['design-leadership'],
      skills['mentoring'],
      skills['agile-scrum'],
      skills['splunk'],
      skills['stakeholder-mgmt'],
    ],
  },
  {
    id: 'lyra',
    westernName: 'Lyra the Creator',
    description: 'instruments of digital creation',
    color: '#8b5cf6', // Purple
    skills: [
      skills['adobe-cc'],
      skills['figma'],
      skills['rive'],
      skills['spline-3d'],
      skills['blender'],
      skills['protopie'],
    ],
  },
  {
    id: 'hercules',
    westernName: 'Hercules the Scaler',
    description: 'Powering robust infrastructure',
    color: '#22c55e', // Green
    skills: [
      skills['docker'],
      skills['aws'],
      skills['nodejs'],
      skills['spring-boot'],
      skills['postgresql'],
      skills['supabase'],
    ],
  },
];

/**
 * Get all skills from all constellations
 */
export function getAllSkills(): Skill[] {
  return CONSTELLATIONS.flatMap((constellation) => constellation.skills);
}

/**
 * Get skill by ID
 */
export function getSkillById(id: string): Skill | undefined {
  return getAllSkills().find((skill) => skill.id === id);
}

/**
 * Get connections for a skill
 */
export function getSkillConnections(skillId: string): Skill[] {
  const skill = getSkillById(skillId);
  if (!skill) return [];
  
  return skill.connections
    .map((id) => getSkillById(id))
    .filter((s): s is Skill => s !== undefined);
}

/**
 * Calculate positions for skills within a constellation
 * Returns a map of skill ID to {x, y} coordinates (in percentage)
 */
export function calculateConstellationPositions(
  constellation: Constellation,
  centerX: number,
  centerY: number,
  radius: number
): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>();
  const skills = constellation.skills;
  const angleStep = (Math.PI * 2) / skills.length;

  skills.forEach((skill, index) => {
    const angle = angleStep * index;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    positions.set(skill.id, { x, y });
  });

  return positions;
}

/**
 * Calculate all skill positions for all constellations
 * Distributes constellations across the canvas
 */
export function calculateAllSkillPositions(): Map<string, { x: number; y: number; constellationId: string }> {
  const allPositions = new Map<string, { x: number; y: number; constellationId: string }>();
  
  // Distribute constellations in a more organic pattern
  // Position them to avoid overlap and create visual interest
  const constellationCenters = [
    { x: 20, y: 25 },   // Andromeda - top left
    { x: 50, y: 20 },   // Orion - top center
    { x: 80, y: 30 },   // Cassiopeia - top right
    { x: 25, y: 70 },   // Lyra - bottom left
    { x: 75, y: 75 },   // Hercules - bottom right
  ];
  
  const radius = 10; // radius for skills within constellation

  CONSTELLATIONS.forEach((constellation, index) => {
    const center = constellationCenters[index] || { x: 50, y: 50 };
    const centerX = center.x;
    const centerY = center.y;

    const positions = calculateConstellationPositions(
      constellation,
      centerX,
      centerY,
      radius
    );

    positions.forEach((pos, skillId) => {
      allPositions.set(skillId, {
        ...pos,
        constellationId: constellation.id,
      });
    });
  });

  return allPositions;
}
