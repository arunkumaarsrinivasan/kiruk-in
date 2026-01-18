/**
 * Observatory Data - Single Source of Truth
 * 
 * All skill constellation and observatory configuration lives here.
 * To add/modify skills or experiences, edit this file only.
 * Components will automatically reflect changes.
 */

// ============================================
// TYPE DEFINITIONS
// ============================================

export type MasteryLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';
export type SkillContribution = 'learned' | 'applied' | 'mastered';

export interface JobSource {
    experienceId: string; // Links to Experience.id in portfolio-data.ts
    contribution: SkillContribution;
}

export interface SkillNode {
    id: string;
    name: string;
    masteryLevel: MasteryLevel;
    yearsOfExperience: number;
    constellationId: string;
    jobSources: JobSource[];
    connections: string[]; // Other skill IDs for constellation lines
    description?: string;
    firstUsedDate?: string; // ISO date string - when skill was first used (for timeline)
}

export interface ConstellationConfig {
    id: string;
    name: string;
    westernName: string;
    description: string;
    colorVar: string; // CSS variable name for constellation color
    skills: string[]; // Skill IDs belonging to this constellation
}

export interface GridDivision {
    value: number;
    label: string;
}

export interface MasteryLevelConfig {
    id: MasteryLevel;
    label: string;
    position: number; // Y position (0-100)
    starSize: number; // Pixel size of stars at this level
}

export interface ObservatoryGridConfig {
    xAxis: {
        label: string;
        maxYears: number;
        divisions: GridDivision[];
    };
    yAxis: {
        label: string;
        levels: MasteryLevelConfig[];
    };
    lineColors: {
        major: string;
        minor: string;
        constellation: string;
    };
}

// ============================================
// MASTERY LEVEL CONFIGURATION
// ============================================

export const MASTERY_LEVELS: MasteryLevelConfig[] = [
    { id: 'beginner', label: 'Beginner', position: 15, starSize: 8 },
    { id: 'intermediate', label: 'Intermediate', position: 38, starSize: 12 },
    { id: 'advanced', label: 'Advanced', position: 62, starSize: 16 },
    { id: 'expert', label: 'Expert', position: 85, starSize: 20 },
];

export const MASTERY_COLORS: Record<MasteryLevel, string> = {
    beginner: 'var(--text-muted)',
    intermediate: 'var(--text-main)',
    advanced: 'var(--accent-color)',
    expert: 'var(--theme-primary)',
};

// ============================================
// GRID CONFIGURATION
// ============================================

export const GRID_CONFIG: ObservatoryGridConfig = {
    xAxis: {
        label: 'Years of Experience',
        maxYears: 5,
        divisions: [
            { value: 0, label: '0' },
            { value: 20, label: '1' },
            { value: 40, label: '2' },
            { value: 60, label: '3' },
            { value: 80, label: '4' },
            { value: 100, label: '5+' },
        ],
    },
    yAxis: {
        label: 'Mastery Level',
        levels: MASTERY_LEVELS,
    },
    lineColors: {
        major: 'var(--border-color)',
        minor: 'var(--text-muted)',
        constellation: 'var(--accent-color)',
    },
};

// ============================================
// CONSTELLATION DEFINITIONS
// ============================================

export const CONSTELLATIONS: ConstellationConfig[] = [
    {
        id: 'andromeda',
        name: 'Design',
        westernName: 'Andromeda the Visionary',
        description: 'Crafting user-centric experiences',
        colorVar: '--constellation-design',
        skills: ['ui-ux', 'user-research', 'prototyping', 'branding', 'accessibility', 'design-systems'],
    },
    {
        id: 'orion',
        name: 'Development',
        westernName: 'Orion the Builder',
        description: 'Architecting the visual web',
        colorVar: '--constellation-dev',
        skills: ['react', 'flutter', 'nextjs', 'threejs', 'gsap'],
    },
    {
        id: 'cassiopeia',
        name: 'Leadership',
        westernName: 'Cassiopeia the Guide',
        description: 'Leading with Intelligence',
        colorVar: '--constellation-lead',
        skills: ['design-leadership', 'mentoring', 'agile-scrum', 'splunk', 'stakeholder-mgmt'],
    },
    {
        id: 'lyra',
        name: 'Tools',
        westernName: 'Lyra the Creator',
        description: 'Instruments of digital creation',
        colorVar: '--constellation-tools',
        skills: ['adobe-cc', 'figma', 'rive', 'spline-3d', 'blender', 'protopie'],
    },
    {
        id: 'hercules',
        name: 'Infrastructure',
        westernName: 'Hercules the Scaler',
        description: 'Powering robust infrastructure',
        colorVar: '--constellation-infra',
        skills: ['docker', 'aws', 'nodejs', 'spring-boot', 'postgresql', 'supabase'],
    },
];

// ============================================
// SKILL NODES - The Core Data
// ============================================

export const SKILL_NODES: SkillNode[] = [
    // === ANDROMEDA: Design ===
    {
        id: 'ui-ux',
        name: 'UI/UX Design',
        masteryLevel: 'expert',
        yearsOfExperience: 5,
        constellationId: 'andromeda',
        jobSources: [
            { experienceId: 'hp-ux-designer', contribution: 'mastered' },
            { experienceId: 'sns-square-product-designer', contribution: 'applied' },
            { experienceId: 'peoplegamez-intern', contribution: 'applied' },
            { experienceId: 'freelance-general', contribution: 'learned' },
        ],
        connections: ['user-research', 'prototyping', 'design-systems'],
        description: 'End-to-end user experience and interface design',
    },
    {
        id: 'user-research',
        name: 'User Research',
        masteryLevel: 'advanced',
        yearsOfExperience: 4,
        constellationId: 'andromeda',
        jobSources: [
            { experienceId: 'hp-ux-designer', contribution: 'applied' },
            { experienceId: 'sns-square-product-designer', contribution: 'mastered' },
        ],
        connections: ['ui-ux', 'prototyping', 'branding'],
        description: 'Qualitative & quantitative analysis, personas, journey mapping',
    },
    {
        id: 'prototyping',
        name: 'Prototyping',
        masteryLevel: 'advanced',
        yearsOfExperience: 5,
        constellationId: 'andromeda',
        jobSources: [
            { experienceId: 'hp-ux-designer', contribution: 'applied' },
            { experienceId: 'sns-square-product-designer', contribution: 'applied' },
            { experienceId: 'peoplegamez-intern', contribution: 'learned' },
        ],
        connections: ['ui-ux', 'user-research', 'figma'],
        description: 'Interactive prototyping with Figma, Protopie, and Rive',
    },
    {
        id: 'branding',
        name: 'Branding',
        masteryLevel: 'advanced',
        yearsOfExperience: 5,
        constellationId: 'andromeda',
        jobSources: [
            { experienceId: 'freelance-general', contribution: 'mastered' },
        ],
        connections: ['user-research', 'adobe-cc'],
        description: 'Brand identity creation and illustration',
    },
    {
        id: 'accessibility',
        name: 'Accessibility',
        masteryLevel: 'intermediate',
        yearsOfExperience: 3,
        constellationId: 'andromeda',
        jobSources: [
            { experienceId: 'hp-ux-designer', contribution: 'applied' },
        ],
        connections: ['ui-ux'],
        description: 'WCAG compliance and inclusive design',
    },
    {
        id: 'design-systems',
        name: 'Design Systems',
        masteryLevel: 'advanced',
        yearsOfExperience: 4,
        constellationId: 'andromeda',
        jobSources: [
            { experienceId: 'hp-ux-designer', contribution: 'mastered' },
            { experienceId: 'sns-square-product-designer', contribution: 'applied' },
        ],
        connections: ['ui-ux', 'figma'],
        description: 'Creating cohesive design systems used by 500+ employees',
    },

    // === ORION: Development ===
    {
        id: 'react',
        name: 'React',
        masteryLevel: 'expert',
        yearsOfExperience: 4,
        constellationId: 'orion',
        jobSources: [
            { experienceId: 'hp-ux-designer', contribution: 'applied' },
            { experienceId: 'freelance-general', contribution: 'learned' },
        ],
        connections: ['nextjs', 'threejs', 'flutter'],
        description: 'Advanced React development with hooks and modern patterns',
    },
    {
        id: 'flutter',
        name: 'Flutter',
        masteryLevel: 'advanced',
        yearsOfExperience: 2,
        constellationId: 'orion',
        jobSources: [
            { experienceId: 'hp-ux-designer', contribution: 'mastered' },
        ],
        connections: ['react', 'gsap'],
        description: 'Mobile-first Flutter web UI development',
    },
    {
        id: 'nextjs',
        name: 'Next.js',
        masteryLevel: 'advanced',
        yearsOfExperience: 3,
        constellationId: 'orion',
        jobSources: [
            { experienceId: 'hp-ux-designer', contribution: 'applied' },
            { experienceId: 'freelance-general', contribution: 'learned' },
        ],
        connections: ['react', 'nodejs'],
        description: 'Full-stack Next.js with SSR, SSG, and API routes',
    },
    {
        id: 'threejs',
        name: 'Three.js',
        masteryLevel: 'intermediate',
        yearsOfExperience: 3,
        constellationId: 'orion',
        jobSources: [
            { experienceId: 'freelance-general', contribution: 'learned' },
        ],
        connections: ['react', 'gsap'],
        description: '3D graphics and animations',
    },
    {
        id: 'gsap',
        name: 'GSAP',
        masteryLevel: 'intermediate',
        yearsOfExperience: 3,
        constellationId: 'orion',
        jobSources: [
            { experienceId: 'freelance-general', contribution: 'learned' },
        ],
        connections: ['flutter', 'threejs'],
        description: 'Advanced animations with GSAP',
    },

    // === CASSIOPEIA: Leadership ===
    {
        id: 'design-leadership',
        name: 'Design Leadership',
        masteryLevel: 'expert',
        yearsOfExperience: 3,
        constellationId: 'cassiopeia',
        jobSources: [
            { experienceId: 'hp-ux-designer', contribution: 'mastered' },
            { experienceId: 'sns-square-product-designer', contribution: 'applied' },
        ],
        connections: ['mentoring', 'agile-scrum'],
        description: 'Leading design teams and driving vision',
    },
    {
        id: 'mentoring',
        name: 'Mentoring',
        masteryLevel: 'advanced',
        yearsOfExperience: 2,
        constellationId: 'cassiopeia',
        jobSources: [
            { experienceId: 'sns-square-product-designer', contribution: 'applied' },
        ],
        connections: ['design-leadership', 'stakeholder-mgmt'],
        description: 'Mentoring junior designers and developers',
    },
    {
        id: 'agile-scrum',
        name: 'Agile/Scrum',
        masteryLevel: 'advanced',
        yearsOfExperience: 3,
        constellationId: 'cassiopeia',
        jobSources: [
            { experienceId: 'hp-ux-designer', contribution: 'applied' },
            { experienceId: 'sns-square-product-designer', contribution: 'learned' },
        ],
        connections: ['design-leadership', 'stakeholder-mgmt', 'splunk'],
        description: 'Agile methodologies and sprint management',
    },
    {
        id: 'splunk',
        name: 'Splunk',
        masteryLevel: 'advanced',
        yearsOfExperience: 2,
        constellationId: 'cassiopeia',
        jobSources: [
            { experienceId: 'hp-ux-designer', contribution: 'mastered' },
        ],
        connections: ['agile-scrum'],
        description: 'Dashboards and log analysis for IoT devices',
    },
    {
        id: 'stakeholder-mgmt',
        name: 'Stakeholder Management',
        masteryLevel: 'advanced',
        yearsOfExperience: 3,
        constellationId: 'cassiopeia',
        jobSources: [
            { experienceId: 'hp-ux-designer', contribution: 'applied' },
            { experienceId: 'sns-square-product-designer', contribution: 'learned' },
        ],
        connections: ['mentoring', 'agile-scrum'],
        description: 'Cross-functional collaboration and communication',
    },

    // === LYRA: Tools ===
    {
        id: 'adobe-cc',
        name: 'Adobe CC',
        masteryLevel: 'advanced',
        yearsOfExperience: 5,
        constellationId: 'lyra',
        jobSources: [
            { experienceId: 'freelance-general', contribution: 'mastered' },
        ],
        connections: ['figma', 'blender', 'branding'],
        description: 'Adobe Creative Suite for design and creative work',
    },
    {
        id: 'figma',
        name: 'Figma',
        masteryLevel: 'expert',
        yearsOfExperience: 5,
        constellationId: 'lyra',
        jobSources: [
            { experienceId: 'hp-ux-designer', contribution: 'mastered' },
            { experienceId: 'sns-square-product-designer', contribution: 'mastered' },
            { experienceId: 'peoplegamez-intern', contribution: 'applied' },
            { experienceId: 'freelance-general', contribution: 'learned' },
        ],
        connections: ['adobe-cc', 'rive', 'spline-3d', 'blender', 'protopie', 'design-systems', 'prototyping'],
        description: 'Expert-level design, prototyping, and collaboration',
    },
    {
        id: 'rive',
        name: 'Rive',
        masteryLevel: 'intermediate',
        yearsOfExperience: 2,
        constellationId: 'lyra',
        jobSources: [
            { experienceId: 'freelance-general', contribution: 'learned' },
        ],
        connections: ['figma'],
        description: 'Interactive animations with Rive',
    },
    {
        id: 'spline-3d',
        name: 'Spline 3D',
        masteryLevel: 'beginner',
        yearsOfExperience: 1,
        constellationId: 'lyra',
        jobSources: [
            { experienceId: 'freelance-general', contribution: 'learned' },
        ],
        connections: ['figma', 'blender'],
        description: '3D design for web',
    },
    {
        id: 'blender',
        name: 'Blender',
        masteryLevel: 'intermediate',
        yearsOfExperience: 2,
        constellationId: 'lyra',
        jobSources: [
            { experienceId: 'freelance-general', contribution: 'learned' },
        ],
        connections: ['figma', 'adobe-cc', 'spline-3d'],
        description: '3D modeling and animation',
    },
    {
        id: 'protopie',
        name: 'Protopie',
        masteryLevel: 'intermediate',
        yearsOfExperience: 3,
        constellationId: 'lyra',
        jobSources: [
            { experienceId: 'hp-ux-designer', contribution: 'applied' },
        ],
        connections: ['figma'],
        description: 'Advanced interactive prototyping',
    },

    // === HERCULES: Infrastructure ===
    {
        id: 'docker',
        name: 'Docker',
        masteryLevel: 'advanced',
        yearsOfExperience: 2,
        constellationId: 'hercules',
        jobSources: [
            { experienceId: 'hp-ux-designer', contribution: 'applied' },
        ],
        connections: ['aws', 'nodejs', 'spring-boot'],
        description: 'Containerization and DevOps',
    },
    {
        id: 'aws',
        name: 'AWS',
        masteryLevel: 'advanced',
        yearsOfExperience: 2,
        constellationId: 'hercules',
        jobSources: [
            { experienceId: 'hp-ux-designer', contribution: 'applied' },
        ],
        connections: ['docker', 'postgresql'],
        description: 'Cloud services for microservices',
    },
    {
        id: 'nodejs',
        name: 'Node.js',
        masteryLevel: 'advanced',
        yearsOfExperience: 3,
        constellationId: 'hercules',
        jobSources: [
            { experienceId: 'hp-ux-designer', contribution: 'applied' },
            { experienceId: 'sns-square-product-designer', contribution: 'learned' },
        ],
        connections: ['docker', 'spring-boot', 'nextjs'],
        description: 'Scalable workflows and APIs',
    },
    {
        id: 'spring-boot',
        name: 'Spring Boot',
        masteryLevel: 'advanced',
        yearsOfExperience: 2,
        constellationId: 'hercules',
        jobSources: [
            { experienceId: 'hp-ux-designer', contribution: 'mastered' },
        ],
        connections: ['docker', 'postgresql', 'nodejs'],
        description: 'Java microservices and automation',
    },
    {
        id: 'postgresql',
        name: 'PostgreSQL',
        masteryLevel: 'intermediate',
        yearsOfExperience: 2,
        constellationId: 'hercules',
        jobSources: [
            { experienceId: 'hp-ux-designer', contribution: 'learned' },
        ],
        connections: ['aws', 'spring-boot', 'supabase'],
        description: 'Relational database management',
    },
    {
        id: 'supabase',
        name: 'Supabase',
        masteryLevel: 'beginner',
        yearsOfExperience: 1,
        constellationId: 'hercules',
        jobSources: [
            { experienceId: 'freelance-general', contribution: 'learned' },
        ],
        connections: ['postgresql'],
        description: 'Backend as a service',
    },
];

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Get a skill by ID
 */
export function getSkillById(id: string): SkillNode | undefined {
    return SKILL_NODES.find(skill => skill.id === id);
}

/**
 * Get all skills for a constellation
 */
export function getSkillsByConstellation(constellationId: string): SkillNode[] {
    return SKILL_NODES.filter(skill => skill.constellationId === constellationId);
}

/**
 * Get constellation config by ID
 */
export function getConstellationById(id: string): ConstellationConfig | undefined {
    return CONSTELLATIONS.find(c => c.id === id);
}

/**
 * Get mastery level config
 */
export function getMasteryConfig(level: MasteryLevel): MasteryLevelConfig {
    return MASTERY_LEVELS.find(m => m.id === level) ?? MASTERY_LEVELS[0];
}

/**
 * Calculate X position based on years of experience
 */
export function calculateXPosition(yearsOfExperience: number): number {
    const maxYears = GRID_CONFIG.xAxis.maxYears;
    return Math.min(100, (yearsOfExperience / maxYears) * 100);
}

/**
 * Calculate Y position based on mastery level
 */
export function calculateYPosition(masteryLevel: MasteryLevel): number {
    const levelConfig = getMasteryConfig(masteryLevel);
    return levelConfig.position;
}

/**
 * Get positioned skill nodes (with x, y coordinates)
 */
export interface PositionedSkillNode extends SkillNode {
    x: number;
    y: number;
    size: number;
    color: string;
}

export function getPositionedSkillNodes(): PositionedSkillNode[] {
    const cx = 50; // Center X
    const cy = 50; // Center Y
    const maxRadius = 42; // Matches grid
    const numSectors = CONSTELLATIONS.length;
    const sectorAngle = 360 / numSectors;

    // Group skills by constellation to distribute within sectors
    const skillsByConstellation = new Map<string, SkillNode[]>();
    CONSTELLATIONS.forEach(c => skillsByConstellation.set(c.id, []));

    SKILL_NODES.forEach(skill => {
        const list = skillsByConstellation.get(skill.constellationId);
        if (list) list.push(skill);
    });

    return SKILL_NODES.map(skill => {
        // Get constellation index for sector angle
        const constellationIndex = CONSTELLATIONS.findIndex(c => c.id === skill.constellationId);
        const constellationSkills = skillsByConstellation.get(skill.constellationId) || [];
        const indexInConstellation = constellationSkills.findIndex(s => s.id === skill.id);

        // Calculate base angle (center of constellation sector)
        const baseAngle = (constellationIndex * sectorAngle - 90); // -90 to start from top

        // Spread skills within the sector based on their index
        const spreadAngle = (sectorAngle * 0.7); // Use 70% of sector width
        const angleOffset = constellationSkills.length > 1
            ? (indexInConstellation / (constellationSkills.length - 1) - 0.5) * spreadAngle
            : 0;

        const finalAngle = (baseAngle + sectorAngle / 2 + angleOffset) * (Math.PI / 180);

        // Calculate radius based on mastery level (expert = inner, beginner = outer)
        const masteryPosition = getMasteryConfig(skill.masteryLevel).position;
        const normalizedRadius = 1 - (masteryPosition / 100);
        const radius = maxRadius * (0.2 + normalizedRadius * 0.75);

        // Add small jitter for visual interest
        const jitterAngle = (skill.id.charCodeAt(0) % 10 - 5) * 0.02;
        const jitterRadius = (skill.id.charCodeAt(1) % 10 - 5) * 0.5;

        // Convert polar to cartesian (positions as percentage 0-100)
        const x = cx + Math.cos(finalAngle + jitterAngle) * (radius + jitterRadius);
        const y = cy + Math.sin(finalAngle + jitterAngle) * (radius + jitterRadius);

        return {
            ...skill,
            x, // Absolute position (0-100)
            y, // Absolute position (0-100)
            size: getMasteryConfig(skill.masteryLevel).starSize,
            color: MASTERY_COLORS[skill.masteryLevel],
        };
    });
}

/**
 * Get all experience IDs that a skill is associated with
 */
export function getExperienceIdsForSkill(skillId: string): string[] {
    const skill = getSkillById(skillId);
    if (!skill) return [];
    return skill.jobSources.map(js => js.experienceId);
}

/**
 * Get all skills learned/used at a specific experience
 */
export function getSkillsForExperience(experienceId: string): SkillNode[] {
    return SKILL_NODES.filter(skill =>
        skill.jobSources.some(js => js.experienceId === experienceId)
    );
}

/**
 * Get contribution level for a skill at a specific job
 */
export function getSkillContributionAtJob(skillId: string, experienceId: string): SkillContribution | null {
    const skill = getSkillById(skillId);
    if (!skill) return null;
    const jobSource = skill.jobSources.find(js => js.experienceId === experienceId);
    return jobSource?.contribution ?? null;
}

// ============================================
// TIMELINE UTILITIES
// ============================================

/**
 * Experience start dates for timeline calculations
 * Maps experienceId to start date
 */
export const EXPERIENCE_DATES: Record<string, { start: string; end?: string }> = {
    'freelance-general': { start: '2020-01-01', end: '2023-12-31' },
    'peoplegamez-intern': { start: '2022-11-01', end: '2023-01-31' },
    'sns-square-product-designer': { start: '2023-02-01', end: '2023-07-31' },
    'hp-ux-designer': { start: '2023-08-01' }, // Current
};

/**
 * Get the earliest date a skill was used based on job sources
 */
export function getSkillFirstUsedDate(skill: SkillNode): string {
    if (skill.firstUsedDate) return skill.firstUsedDate;

    let earliestDate: string | null = null;

    for (const jobSource of skill.jobSources) {
        const expDates = EXPERIENCE_DATES[jobSource.experienceId];
        if (expDates) {
            if (!earliestDate || expDates.start < earliestDate) {
                earliestDate = expDates.start;
            }
        }
    }

    return earliestDate ?? '2020-01-01'; // Default to 2020 if no date found
}

/**
 * Get all skills visible at a specific point in time
 */
export function getSkillsAtDate(targetDate: string): SkillNode[] {
    return SKILL_NODES.filter(skill => {
        const firstUsed = getSkillFirstUsedDate(skill);
        return firstUsed <= targetDate;
    });
}

/**
 * Get timeline range (earliest to latest experience)
 */
export function getTimelineRange(): { start: string; end: string } {
    const dates = Object.values(EXPERIENCE_DATES);
    const starts = dates.map(d => d.start).sort();
    return {
        start: starts[0] ?? '2020-01-01',
        end: new Date().toISOString().split('T')[0], // Today
    };
}

/**
 * Get experiences sorted by date for journey timeline
 */
export function getExperienceTimeline(): Array<{ id: string; start: string; end?: string }> {
    return Object.entries(EXPERIENCE_DATES)
        .map(([id, dates]) => ({ id, ...dates }))
        .sort((a, b) => a.start.localeCompare(b.start));
}
