/**
 * useObservatoryData Hook
 * 
 * Provides access to all observatory data with computed relationships
 * between skills and experiences.
 */

import { useMemo } from 'react';
import { useExperience } from './usePortfolioData';
import { Experience } from '@/data/portfolio-data';
import {
    SKILL_NODES,
    CONSTELLATIONS,
    GRID_CONFIG,
    PositionedSkillNode,
    SkillNode,
    ConstellationConfig,
    ObservatoryGridConfig,
    getPositionedSkillNodes,
    getSkillsForExperience,
    getExperienceIdsForSkill,
    getSkillContributionAtJob,
    SkillContribution,
} from '@/data/observatory-data';

export interface SkillJobMapping {
    skillId: string;
    experiences: Array<{
        experience: Experience;
        contribution: SkillContribution;
    }>;
}

export interface ExperienceSkillMapping {
    experienceId: string;
    skills: Array<{
        skill: PositionedSkillNode;
        contribution: SkillContribution;
    }>;
}

export interface ObservatoryData {
    // Core data
    skills: PositionedSkillNode[];
    constellations: ConstellationConfig[];
    gridConfig: ObservatoryGridConfig;
    experiences: Experience[];

    // Computed mappings
    skillJobMap: Map<string, SkillJobMapping>;
    experienceSkillMap: Map<string, ExperienceSkillMapping>;

    // Utility functions
    getSkillsByConstellation: (constellationId: string) => PositionedSkillNode[];
    getRelatedExperiences: (skillId: string) => Experience[];
    getRelatedSkills: (experienceId: string) => PositionedSkillNode[];
    getConnectionLines: () => Array<{ from: string; to: string; fromPos: { x: number; y: number }; toPos: { x: number; y: number } }>;
}

export function useObservatoryData(): ObservatoryData {
    const experiences = useExperience();

    // Get positioned skill nodes
    const skills = useMemo(() => getPositionedSkillNodes(), []);

    // Create skill -> experiences mapping
    const skillJobMap = useMemo(() => {
        const map = new Map<string, SkillJobMapping>();

        skills.forEach(skill => {
            const experienceIds = getExperienceIdsForSkill(skill.id);
            const relatedExperiences = experienceIds
                .map(expId => {
                    const experience = experiences.find(e => e.id === expId);
                    const contribution = getSkillContributionAtJob(skill.id, expId);
                    if (experience && contribution) {
                        return { experience, contribution };
                    }
                    return null;
                })
                .filter((item): item is { experience: Experience; contribution: SkillContribution } => item !== null);

            map.set(skill.id, {
                skillId: skill.id,
                experiences: relatedExperiences,
            });
        });

        return map;
    }, [skills, experiences]);

    // Create experience -> skills mapping
    const experienceSkillMap = useMemo(() => {
        const map = new Map<string, ExperienceSkillMapping>();

        experiences.forEach(experience => {
            const relatedSkillNodes = getSkillsForExperience(experience.id);
            const relatedSkills = relatedSkillNodes
                .map(skillNode => {
                    const positionedSkill = skills.find(s => s.id === skillNode.id);
                    const contribution = getSkillContributionAtJob(skillNode.id, experience.id);
                    if (positionedSkill && contribution) {
                        return { skill: positionedSkill, contribution };
                    }
                    return null;
                })
                .filter((item): item is { skill: PositionedSkillNode; contribution: SkillContribution } => item !== null);

            map.set(experience.id, {
                experienceId: experience.id,
                skills: relatedSkills,
            });
        });

        return map;
    }, [experiences, skills]);

    // Get skills by constellation
    const getSkillsByConstellation = useMemo(() => {
        return (constellationId: string): PositionedSkillNode[] => {
            return skills.filter(skill => skill.constellationId === constellationId);
        };
    }, [skills]);

    // Get related experiences for a skill
    const getRelatedExperiences = useMemo(() => {
        return (skillId: string): Experience[] => {
            const mapping = skillJobMap.get(skillId);
            return mapping?.experiences.map(e => e.experience) ?? [];
        };
    }, [skillJobMap]);

    // Get related skills for an experience
    const getRelatedSkills = useMemo(() => {
        return (experienceId: string): PositionedSkillNode[] => {
            const mapping = experienceSkillMap.get(experienceId);
            return mapping?.skills.map(s => s.skill) ?? [];
        };
    }, [experienceSkillMap]);

    // Calculate connection lines between skills
    const getConnectionLines = useMemo(() => {
        return () => {
            const lines: Array<{ from: string; to: string; fromPos: { x: number; y: number }; toPos: { x: number; y: number } }> = [];
            const processed = new Set<string>();

            skills.forEach(skill => {
                skill.connections.forEach(connectedId => {
                    const connectionKey = [skill.id, connectedId].sort().join('-');
                    if (processed.has(connectionKey)) return;
                    processed.add(connectionKey);

                    const connectedSkill = skills.find(s => s.id === connectedId);
                    if (connectedSkill) {
                        lines.push({
                            from: skill.id,
                            to: connectedId,
                            fromPos: { x: skill.x, y: skill.y },
                            toPos: { x: connectedSkill.x, y: connectedSkill.y },
                        });
                    }
                });
            });

            return lines;
        };
    }, [skills]);

    return {
        skills,
        constellations: CONSTELLATIONS,
        gridConfig: GRID_CONFIG,
        experiences,
        skillJobMap,
        experienceSkillMap,
        getSkillsByConstellation,
        getRelatedExperiences,
        getRelatedSkills,
        getConnectionLines,
    };
}

export default useObservatoryData;
