/**
 * Unified Data Layer - Single Entry Point
 * 
 * All portfolio data is accessible from this single file.
 * This architecture enables:
 * 1. Easy migration to CMS/database
 * 2. Single source of truth for all content
 * 3. Type-safe access across the codebase
 * 
 * To migrate to a CMS or API:
 * 1. Replace static exports with async fetchers
 * 2. Update hooks in src/hooks to use the fetchers
 * 3. Add caching layer as needed
 */

// ============================================
// CORE DATA EXPORTS
// ============================================

// Portfolio: Personal info, projects, experience, skills
export {
    portfolioData,
    AVAILABLE_THEMES,
    type PortfolioData,
    type PersonalInfo,
    type Project,
    type Experience,
    type Education,
    type Skill,
    type Certification,
    type BlogPost,
    type Testimonial,
    type ContactInfo,
    type SocialLinks,
    type ThemeConfig,
} from './portfolio-data';

// Observatory: Skills constellation visualization
export {
    SKILL_NODES,
    CONSTELLATIONS,
    MASTERY_LEVELS,
    MASTERY_COLORS,
    GRID_CONFIG,
    EXPERIENCE_DATES,
    getSkillById,
    getSkillsByConstellation,
    getConstellationById,
    getMasteryConfig,
    calculateXPosition,
    calculateYPosition,
    getPositionedSkillNodes,
    getExperienceIdsForSkill,
    getSkillsForExperience,
    getSkillContributionAtJob,
    getSkillFirstUsedDate,
    getSkillsAtDate,
    getTimelineRange,
    getExperienceTimeline,
    type SkillNode,
    type ConstellationConfig,
    type MasteryLevel,
    type SkillContribution,
    type JobSource,
    type PositionedSkillNode,
    type ObservatoryGridConfig,
} from './observatory-data';

// Game Navigation: Gamification system
export {
    PAGE_GAMES,
    GAME_MODES,
    GAME_TYPE_ICONS,
    getGameById,
    getGameByPath,
    getGameProgress,
    isGameUnlocked,
    isLevelUnlocked,
    getNextGame,
    getTotalXP,
    createInitialProgress,
    type GameMode,
    type GameLevel,
    type PageGame,
    type GameProgress,
    type GameModeConfig,
} from './game-navigation-data';

// Design Systems: Theme tokens and styling
export {
    getDesignSystemForTheme,
    type DesignSystemTokens,
} from './design-systems';

// Page Info: Page metadata and descriptions
export {
    PAGE_INFO,
    getPageInfo,
    type PageInfo,
} from './page-info';

// Help Bot: FAQ and contextual help
export {
    FAQ_DATA,
    PAGE_HELP_DATA,
    getPageHelp,
    getFAQByCategory,
    searchFAQ,
    type FAQItem,
    type PageHelp,
} from './help-bot-data';

// Personal Knowledge Base
export * from './personal-knowledge-base';

// Timeline Era: About page journey design system (age-based phases)
export {
  ERA_CONFIG,
  getEraConfig,
  getEraConfigByPhase,
  getTimelinePhase,
  getEraColors,
  getEraColorsByPhase,
  type EraConfig,
  type LineStyle,
} from './timeline-era-config';

// ============================================
// DATA LAYER CONFIGURATION
// ============================================

export interface DataLayerConfig {
    version: string;
    lastUpdated: string;
    sources: {
        name: string;
        type: 'static' | 'api' | 'cms';
        endpoint?: string;
    }[];
}

/**
 * Get current data layer configuration.
 * Use this to understand data sources and plan migrations.
 */
export const getDataLayerConfig = (): DataLayerConfig => ({
    version: '1.0.0',
    lastUpdated: '2026-01-18',
    sources: [
        { name: 'portfolio-data', type: 'static' },
        { name: 'observatory-data', type: 'static' },
        { name: 'game-navigation-data', type: 'static' },
        { name: 'design-systems', type: 'static' },
        { name: 'page-info', type: 'static' },
        { name: 'help-bot-data', type: 'static' },
        { name: 'personal-knowledge-base', type: 'static' },
    ],
});

/**
 * Future: Replace with API fetcher
 * 
 * Example migration:
 * ```ts
 * export const fetchPortfolioData = async () => {
 *   const response = await fetch('/api/portfolio');
 *   return response.json() as Promise<PortfolioData>;
 * };
 * ```
 */
