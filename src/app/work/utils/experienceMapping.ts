/**
 * Experience Mapping Utilities
 * Maps skills to work experiences based on technologies and creates timeline connections
 */

import { Experience } from '@/data/portfolio-data';
import { Skill } from './skillData';

// Map technology names from experiences to skill IDs
const technologyToSkillMap: Record<string, string[]> = {
  // Design & UX
  'Figma': ['figma'],
  'UI/UX Design': ['ui-ux'],
  'UX Research': ['user-research'],
  'Design Systems': ['design-systems'],
  'Prototyping': ['prototyping'],
  'User Testing': ['user-research', 'prototyping'],
  'Branding': ['branding'],
  'Adobe Creative Suite': ['adobe-cc'],
  'Adobe CC': ['adobe-cc'],
  'Web Design': ['ui-ux', 'branding'],
  'Mobile Design': ['ui-ux'],
  'Game Design': ['ui-ux', 'prototyping'],
  'Interaction Design': ['ui-ux', 'prototyping'],
  'User Flows': ['ui-ux', 'user-research'],
  
  // Frontend
  'React': ['react'],
  'Next.js': ['nextjs'],
  'Flutter': ['flutter'],
  'TypeScript': ['react', 'nextjs', 'nodejs'],
  'JavaScript': ['react', 'nextjs', 'nodejs'],
  
  // Backend
  'Node.js': ['nodejs'],
  'Spring Boot': ['spring-boot'],
  'Java': ['spring-boot'],
  'PostgreSQL': ['postgresql'],
  'MongoDB': ['postgresql'],
  
  // Cloud & DevOps
  'AWS': ['aws'],
  'Cloud Microservices': ['docker', 'aws'],
  'Docker': ['docker'],
  
  // Tools
  'Splunk': ['splunk'],
  'Spring Shell': ['spring-boot'],
  
  // 3D & Animation
  'Blender': ['blender'],
  'Rive': ['rive'],
  'spline 3D': ['spline-3d'],
  'Spline 3D': ['spline-3d'],
  'Protopie': ['protopie'],
  
  // Leadership
  'Design Leadership': ['design-leadership'],
  'Mentoring': ['mentoring'],
  'Agile/scrum': ['agile-scrum'],
  'Agile/Scrum': ['agile-scrum'],
  'Stakeholder Mgmt': ['stakeholder-mgmt'],
};

/**
 * Find skills that match an experience's technologies
 */
export function findSkillsForExperience(
  experience: Experience,
  allSkills: Skill[]
): Skill[] {
  const matchedSkills: Skill[] = [];
  const techLower = experience.technologies.map(t => t.toLowerCase());
  
  // Direct technology matching
  experience.technologies.forEach((tech) => {
    const skillIds = technologyToSkillMap[tech] || [];
    skillIds.forEach((skillId) => {
      const skill = allSkills.find(s => s.id === skillId);
      if (skill && !matchedSkills.find(s => s.id === skill.id)) {
        matchedSkills.push(skill);
      }
    });
  });
  
  // Fuzzy matching for partial matches
  allSkills.forEach((skill) => {
    if (matchedSkills.find(s => s.id === skill.id)) return;
    
    const skillNameLower = skill.name.toLowerCase();
    const skillIdNormalized = skill.id.replace(/-/g, ' ');
    
    techLower.forEach((tech) => {
      const normalizedTech = tech.toLowerCase().trim();
      
      // Check various matching patterns
      if (
        normalizedTech.includes(skillNameLower) ||
        skillNameLower.includes(normalizedTech) ||
        normalizedTech.includes(skillIdNormalized) ||
        skillIdNormalized.includes(normalizedTech) ||
        // Handle common variations
        (normalizedTech === 'figma' && skill.id === 'figma') ||
        (normalizedTech.includes('react') && skill.id === 'react') ||
        (normalizedTech.includes('node') && skill.id === 'nodejs') ||
        (normalizedTech.includes('spring') && skill.id === 'spring-boot') ||
        (normalizedTech.includes('aws') && skill.id === 'aws') ||
        (normalizedTech.includes('docker') && skill.id === 'docker') ||
        (normalizedTech.includes('flutter') && skill.id === 'flutter') ||
        (normalizedTech.includes('next') && skill.id === 'nextjs') ||
        (normalizedTech.includes('ui') && skill.id === 'ui-ux') ||
        (normalizedTech.includes('ux') && skill.id === 'ui-ux') ||
        (normalizedTech.includes('design') && (skill.id === 'ui-ux' || skill.id === 'design-systems')) ||
        (normalizedTech.includes('prototype') && skill.id === 'prototyping') ||
        (normalizedTech.includes('research') && skill.id === 'user-research') ||
        (normalizedTech.includes('brand') && skill.id === 'branding')
      ) {
        if (!matchedSkills.find(s => s.id === skill.id)) {
          matchedSkills.push(skill);
        }
      }
    });
  });
  
  return matchedSkills;
}

/**
 * Get all experiences connected to a skill
 */
export function findExperiencesForSkill(
  skill: Skill,
  experiences: Experience[]
): Experience[] {
  return experiences.filter((exp) => {
    const matchedSkills = findSkillsForExperience(exp, [skill]);
    return matchedSkills.some(s => s.id === skill.id);
  });
}

/**
 * Calculate timeline position for an experience (0-100%)
 */
export function calculateExperienceTimelinePosition(
  experience: Experience,
  allExperiences: Experience[]
): number {
  const dates = allExperiences.map(e => new Date(e.startDate).getTime());
  const minDate = Math.min(...dates);
  const maxDate = Math.max(...dates);
  const expDate = new Date(experience.startDate).getTime();
  
  if (maxDate === minDate) return 50;
  return ((expDate - minDate) / (maxDate - minDate)) * 100;
}

/**
 * Format experience period for display
 */
export function formatExperiencePeriod(experience: Experience): string {
  const start = new Date(experience.startDate);
  const startStr = start.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  
  if (experience.current) {
    return `${startStr} - Present`;
  }
  
  if (experience.endDate) {
    const end = new Date(experience.endDate);
    const endStr = end.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    return `${startStr} - ${endStr}`;
  }
  
  return startStr;
}
