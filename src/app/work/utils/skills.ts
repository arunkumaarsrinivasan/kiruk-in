/**
 * Skill categorization utilities
 * Groups skills into expertise categories
 */

export type ExpertiseCategory =
  | 'ux'
  | 'frontend'
  | 'backend'
  | 'fullstack'
  | 'design-systems'
  | 'leadership';

export interface SkillCategory {
  id: ExpertiseCategory;
  name: string;
  keywords: string[];
  color: string;
}

export const EXPERTISE_CATEGORIES: SkillCategory[] = [
  {
    id: 'ux',
    name: 'UX Design',
    keywords: [
      'UX',
      'Design',
      'Figma',
      'Prototyping',
      'User Research',
      'UI/UX',
      'Interaction Design',
      'User Experience',
      'Wireframing',
    ],
    color: '#8B5CF6', // Purple
  },
  {
    id: 'frontend',
    name: 'Frontend Development',
    keywords: [
      'React',
      'Next.js',
      'TypeScript',
      'Flutter',
      'UI',
      'JavaScript',
      'HTML',
      'CSS',
      'Dart',
      'Frontend',
    ],
    color: '#3b82f6', // Blue
  },
  {
    id: 'backend',
    name: 'Backend Development',
    keywords: [
      'Spring Boot',
      'Node.js',
      'Java',
      'MongoDB',
      'Backend',
      'API',
      'Server',
      'Database',
      'Microservices',
    ],
    color: '#22c55e', // Green
  },
  {
    id: 'fullstack',
    name: 'Full Stack',
    keywords: ['Full Stack', 'Full-Stack', 'Fullstack'],
    color: '#F59E0B', // Orange
  },
  {
    id: 'design-systems',
    name: 'Design Systems',
    keywords: [
      'Design Systems',
      'Components',
      'Branding',
      'Design System',
      'UI Components',
    ],
    color: '#EC4899', // Pink
  },
  {
    id: 'leadership',
    name: 'Leadership/Management',
    keywords: [
      'Leadership',
      'Management',
      'Team',
      'Mentor',
      'Team Management',
      'Cross-functional',
    ],
    color: '#10B981', // Emerald
  },
];

/**
 * Categorize a skill into expertise groups
 */
export function categorizeSkill(skill: string): ExpertiseCategory[] {
  const lowerSkill = skill.toLowerCase();
  const categories: ExpertiseCategory[] = [];

  EXPERTISE_CATEGORIES.forEach((category) => {
    if (
      category.keywords.some((keyword) =>
        lowerSkill.includes(keyword.toLowerCase())
      )
    ) {
      categories.push(category.id);
    }
  });

  // If no match, default to frontend if it's a tech skill
  if (categories.length === 0) {
    const techKeywords = ['js', 'ts', 'html', 'css', 'api', 'web'];
    if (techKeywords.some((kw) => lowerSkill.includes(kw))) {
      categories.push('frontend');
    }
  }

  return categories.length > 0 ? categories : ['frontend'];
}

/**
 * Get primary category for a skill (first match)
 */
export function getPrimaryCategory(skill: string): ExpertiseCategory {
  const categories = categorizeSkill(skill);
  return categories[0] || 'frontend';
}

/**
 * Categorize all skills from work experience
 */
export function categorizeSkills(skills: string[]): Map<ExpertiseCategory, string[]> {
  const categorized = new Map<ExpertiseCategory, string[]>();

  EXPERTISE_CATEGORIES.forEach((cat) => {
    categorized.set(cat.id, []);
  });

  skills.forEach((skill) => {
    const categories = categorizeSkill(skill);
    categories.forEach((cat) => {
      const existing = categorized.get(cat) || [];
      if (!existing.includes(skill)) {
        existing.push(skill);
        categorized.set(cat, existing);
      }
    });
  });

  return categorized;
}

/**
 * Get expertise categories for a work experience
 */
export function getExperienceCategories(
  skills: string[],
  chartData?: Array<{ label: string; value: number; color: string }>
): ExpertiseCategory[] {
  const skillCategories = new Set<ExpertiseCategory>();

  // Categorize based on skills
  skills.forEach((skill) => {
    categorizeSkill(skill).forEach((cat) => skillCategories.add(cat));
  });

  // Also check chartData for additional context
  if (chartData) {
    chartData.forEach((chart) => {
      const lowerLabel = chart.label.toLowerCase();
      if (lowerLabel.includes('ux') || lowerLabel.includes('design')) {
        skillCategories.add('ux');
      }
      if (lowerLabel.includes('frontend') || lowerLabel.includes('ui')) {
        skillCategories.add('frontend');
      }
      if (lowerLabel.includes('backend') || lowerLabel.includes('engineering')) {
        skillCategories.add('backend');
      }
      if (lowerLabel.includes('leadership') || lowerLabel.includes('management')) {
        skillCategories.add('leadership');
      }
    });
  }

  return Array.from(skillCategories);
}

/**
 * Find shared skills between two work experiences
 */
export function findSharedSkills(
  skills1: string[],
  skills2: string[]
): string[] {
  return skills1.filter((skill) => skills2.includes(skill));
}
