'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { GridBackground } from '@/components/ui/GridBackground';
import { useResponsiveGrid } from '@/hooks/useResponsiveGrid';
import { ComponentBlueprint } from '@/components/ui/wireframe/ComponentBlueprint';
import { WireframeSection } from '@/components/ui/wireframe/WireframeSection';
import { portfolioData } from '@/data/portfolio-data';
import { useDesignEra } from '@/contexts/DesignEraContext';
import { HeroWithHatSwitching } from '@/components/sections/HeroWithHatSwitching';
import Image from 'next/image';
import Link from 'next/link';

// Section IDs for scroll tracking
const SECTIONS = ['hero', 'about', 'skills', 'experience', 'projects', 'contact'] as const;
type SectionId = typeof SECTIONS[number];

/**
 * WireframeLayout - Clean wireframe aesthetic with Tailwind-style corner rulers
 * No binding holes or guidebook styling - pure wireframe blueprint aesthetic
 */
export default function WireframeManualLayout() {
    const gridAlignment = useResponsiveGrid();
    const { currentEra } = useDesignEra();
    const [currentSection, setCurrentSection] = useState<SectionId>('hero');
    const [isClient, setIsClient] = useState(false);
    const sectionRefs = useRef<Map<SectionId, HTMLElement>>(new Map());

    useEffect(() => {
        setIsClient(true);
    }, []);

    // Scroll spy for tracking current section
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const id = entry.target.id as SectionId;
                        if (SECTIONS.includes(id)) {
                            setCurrentSection(id);
                        }
                    }
                });
            },
            { threshold: 0.3 }
        );

        sectionRefs.current.forEach((element) => {
            observer.observe(element);
        });

        return () => observer.disconnect();
    }, []);

    const setSectionRef = useCallback((id: SectionId) => (el: HTMLElement | null) => {
        if (el) {
            sectionRefs.current.set(id, el);
        }
    }, []);

    const today = new Date();

    return (
        <div className="relative min-h-screen bg-[var(--bg-main)]">
            {/* Blueprint Grid Background */}
            <div className="fixed inset-0 z-0">
                <GridBackground
                    opacity={0.1}
                    scanlinesOpacity={0.02}
                />
            </div>

            {/* Main Content */}
            <main
                className="relative z-10 mx-auto"
                style={{
                    maxWidth: `${gridAlignment.maxContentWidth}px`,
                    width: '100%',
                }}
            >
                {/* Header Bar */}
                <motion.header
                    className="sticky top-0 z-40 border-b-2"
                    style={{
                        backgroundColor: 'var(--bg-main)',
                        borderColor: 'var(--border-color)'
                    }}
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="flex items-center justify-between px-6 py-3">
                        <div className="flex items-center gap-4">
                            <span
                                className="text-xs font-mono font-bold uppercase tracking-widest"
                                style={{ color: 'var(--accent-color)' }}
                            >
                                KIRUK
                            </span>
                            <span
                                className="text-[10px] font-mono uppercase"
                                style={{ color: 'var(--text-muted)' }}
                            >
                                Design Engineer
                            </span>
                        </div>

                        {/* Section navigation */}
                        <nav className="hidden md:flex items-center gap-4">
                            {SECTIONS.map((section, index) => (
                                <a
                                    key={section}
                                    href={`#${section}`}
                                    className="text-[10px] font-mono uppercase tracking-wider transition-colors"
                                    style={{
                                        color: currentSection === section
                                            ? 'var(--accent-color)'
                                            : 'var(--text-muted)'
                                    }}
                                >
                                    {String(index + 1).padStart(2, '0')}
                                </a>
                            ))}
                        </nav>
                    </div>
                </motion.header>

                {/* === HERO WITH HAT SWITCHING === */}
                <HeroWithHatSwitching
                    sectionRef={setSectionRef('hero')}
                    currentEra={currentEra}
                    isClient={isClient}
                />

                {/* === ABOUT/PROFILE - PERSONA FORMAT === */}
                <WireframeSection
                    id="about"
                    title="Persona"
                    subtitle="User profile analysis"
                >
                    <div ref={setSectionRef('about')} className="space-y-6">
                        {/* Persona Header */}
                        <ComponentBlueprint
                            title="Identity"
                            componentType="persona"
                            rulerLabelTop="Design Engineer"
                            rulerLabelLeft="@ HP Inc"
                        >
                            <div className="flex gap-6">
                                <div
                                    className="w-24 h-24 border-2 overflow-hidden flex-shrink-0"
                                    style={{ borderColor: 'var(--accent-color)' }}
                                >
                                    <Image
                                        src="/images/dp-8bit.jpg"
                                        alt="Profile Photo"
                                        width={96}
                                        height={96}
                                        className="w-full h-full object-cover"
                                        style={{ imageRendering: 'pixelated' }}
                                    />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span
                                            className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 border"
                                            style={{ borderColor: 'var(--accent-color)', color: 'var(--accent-color)' }}
                                        >
                                            👤 Persona
                                        </span>
                                    </div>
                                    <h3
                                        className="text-xl font-mono font-bold"
                                        style={{ color: 'var(--text-main)' }}
                                    >
                                        {portfolioData.personal.fullName}
                                    </h3>
                                    <p
                                        className="text-sm font-mono uppercase tracking-wider"
                                        style={{ color: 'var(--accent-color)' }}
                                    >
                                        {portfolioData.personal.title}
                                    </p>
                                    <p
                                        className="text-xs font-mono mt-2"
                                        style={{ color: 'var(--text-muted)' }}
                                    >
                                        📍 {portfolioData.personal.location}
                                    </p>
                                </div>
                            </div>
                        </ComponentBlueprint>

                        {/* Goals & Frustrations Grid */}
                        <div className="grid md:grid-cols-2 gap-4">
                            <ComponentBlueprint
                                title="Goals"
                                componentType="goals"
                                rulerLabelTop="What I strive for"
                                rulerLabelLeft="Objectives"
                            >
                                <ul className="space-y-2 text-sm font-mono">
                                    <li className="flex items-start gap-2" style={{ color: 'var(--text-main)' }}>
                                        <span style={{ color: 'var(--accent-color)' }}>→</span>
                                        Ship user-centered products fast
                                    </li>
                                    <li className="flex items-start gap-2" style={{ color: 'var(--text-main)' }}>
                                        <span style={{ color: 'var(--accent-color)' }}>→</span>
                                        Bridge the design-engineering gap
                                    </li>
                                    <li className="flex items-start gap-2" style={{ color: 'var(--text-main)' }}>
                                        <span style={{ color: 'var(--accent-color)' }}>→</span>
                                        Build scalable design systems
                                    </li>
                                </ul>
                            </ComponentBlueprint>

                            <ComponentBlueprint
                                title="Frustrations"
                                componentType="frustrations"
                                rulerLabelTop="Pain points I solve"
                                rulerLabelLeft="Challenges"
                            >
                                <ul className="space-y-2 text-sm font-mono">
                                    <li className="flex items-start gap-2" style={{ color: 'var(--text-main)' }}>
                                        <span style={{ color: '#E91E63' }}>✕</span>
                                        Siloed design and dev teams
                                    </li>
                                    <li className="flex items-start gap-2" style={{ color: 'var(--text-main)' }}>
                                        <span style={{ color: '#E91E63' }}>✕</span>
                                        Slow design-to-prod handoffs
                                    </li>
                                    <li className="flex items-start gap-2" style={{ color: 'var(--text-main)' }}>
                                        <span style={{ color: '#E91E63' }}>✕</span>
                                        Lost context in translation
                                    </li>
                                </ul>
                            </ComponentBlueprint>
                        </div>

                        {/* Quote */}
                        <div
                            className="border-l-4 pl-4 py-2"
                            style={{ borderColor: 'var(--accent-color)' }}
                        >
                            <p
                                className="text-lg font-mono italic"
                                style={{ color: 'var(--text-main)' }}
                            >
                                "{portfolioData.personal.tagline}"
                            </p>
                        </div>

                        {/* Background */}
                        <ComponentBlueprint
                            title="Background"
                            componentType="bio"
                            rulerLabelTop="Context"
                            rulerLabelLeft="Story"
                        >
                            <p
                                className="text-sm font-mono leading-relaxed"
                                style={{ color: 'var(--text-main)' }}
                            >
                                {portfolioData.personal.bio}
                            </p>
                        </ComponentBlueprint>
                    </div>
                </WireframeSection>

                {/* === SKILLS - EMPATHY MAP FORMAT === */}
                <WireframeSection
                    id="skills"
                    title="Empathy Map"
                    subtitle="Understanding my capabilities"
                >
                    <div ref={setSectionRef('skills')} className="space-y-6">
                        {/* Empathy Map Header */}
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-lg">🧠</span>
                            <span
                                className="text-[10px] font-mono uppercase tracking-widest px-2 py-1 border"
                                style={{ borderColor: 'var(--accent-color)', color: 'var(--accent-color)' }}
                            >
                                Empathy Map
                            </span>
                        </div>

                        {/* 4-Quadrant Grid */}
                        <div className="grid md:grid-cols-2 gap-4">
                            {/* SAYS - Skills I claim */}
                            <ComponentBlueprint
                                title="Says"
                                componentType="says"
                                rulerLabelTop="Skills I claim"
                                rulerLabelLeft="Expertise"
                            >
                                <div className="space-y-3">
                                    <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                                        "I can bridge design and development..."
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {portfolioData.skills.filter(s => s.category === 'design').slice(0, 4).map(skill => (
                                            <span
                                                key={skill.id}
                                                className="text-[10px] font-mono px-2 py-1 border"
                                                style={{ borderColor: 'var(--accent-color)', color: 'var(--accent-color)' }}
                                            >
                                                {skill.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </ComponentBlueprint>

                            {/* THINKS - Design Philosophy */}
                            <ComponentBlueprint
                                title="Thinks"
                                componentType="thinks"
                                rulerLabelTop="Philosophy"
                                rulerLabelLeft="Mindset"
                            >
                                <ul className="space-y-2 text-sm font-mono">
                                    <li className="flex items-start gap-2" style={{ color: 'var(--text-main)' }}>
                                        <span style={{ color: 'var(--accent-color)' }}>💡</span>
                                        Design is engineering
                                    </li>
                                    <li className="flex items-start gap-2" style={{ color: 'var(--text-main)' }}>
                                        <span style={{ color: 'var(--accent-color)' }}>💡</span>
                                        Ship fast, iterate faster
                                    </li>
                                    <li className="flex items-start gap-2" style={{ color: 'var(--text-main)' }}>
                                        <span style={{ color: 'var(--accent-color)' }}>💡</span>
                                        User problems → Solutions
                                    </li>
                                </ul>
                            </ComponentBlueprint>

                            {/* DOES - Technologies */}
                            <ComponentBlueprint
                                title="Does"
                                componentType="does"
                                rulerLabelTop="Technologies"
                                rulerLabelLeft="Stack"
                            >
                                <div className="space-y-3">
                                    <div className="flex flex-wrap gap-2">
                                        {portfolioData.skills.filter(s => s.category === 'frontend' || s.category === 'backend').slice(0, 6).map(skill => (
                                            <div
                                                key={skill.id}
                                                className="flex items-center gap-1 text-xs font-mono px-2 py-1 border"
                                                style={{ borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
                                            >
                                                <span>{skill.icon}</span>
                                                {skill.name}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </ComponentBlueprint>

                            {/* FEELS - Passions */}
                            <ComponentBlueprint
                                title="Feels"
                                componentType="feels"
                                rulerLabelTop="Passions"
                                rulerLabelLeft="Motivations"
                            >
                                <ul className="space-y-2 text-sm font-mono">
                                    <li className="flex items-start gap-2" style={{ color: 'var(--text-main)' }}>
                                        <span>✨</span>
                                        Passionate about craft & details
                                    </li>
                                    <li className="flex items-start gap-2" style={{ color: 'var(--text-main)' }}>
                                        <span>🎮</span>
                                        Excited by gamified experiences
                                    </li>
                                    <li className="flex items-start gap-2" style={{ color: 'var(--text-main)' }}>
                                        <span>🤖</span>
                                        Curious about AI integration
                                    </li>
                                </ul>
                            </ComponentBlueprint>
                        </div>

                        {/* Tools Row */}
                        <div className="flex flex-wrap gap-2 pt-4">
                            {portfolioData.skills.filter(s => s.category === 'tools').slice(0, 6).map(skill => (
                                <span
                                    key={skill.id}
                                    className="text-[10px] font-mono px-2 py-1 border"
                                    style={{ borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}
                                >
                                    {skill.icon} {skill.name}
                                </span>
                            ))}
                        </div>
                    </div>
                </WireframeSection>

                {/* === EXPERIENCE - JOURNEY MAP FORMAT === */}
                <WireframeSection
                    id="experience"
                    title="Journey Map"
                    subtitle="Career progression timeline"
                >
                    <div ref={setSectionRef('experience')} className="space-y-6">
                        {/* Journey Map Header */}
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-lg">🗺️</span>
                            <span
                                className="text-[10px] font-mono uppercase tracking-widest px-2 py-1 border"
                                style={{ borderColor: 'var(--accent-color)', color: 'var(--accent-color)' }}
                            >
                                Journey Map
                            </span>
                        </div>

                        {/* Timeline Phases */}
                        <div className="flex items-center justify-between mb-6 overflow-x-auto pb-2">
                            {['Discovery', 'Growth', 'Mastery', 'Current'].map((phase, i) => (
                                <div key={phase} className="flex items-center">
                                    <div className="text-center px-4">
                                        <div
                                            className="w-4 h-4 border-2 rounded-full mx-auto mb-1"
                                            style={{
                                                borderColor: 'var(--accent-color)',
                                                backgroundColor: i === 3 ? 'var(--accent-color)' : 'transparent'
                                            }}
                                        />
                                        <span
                                            className="text-[10px] font-mono uppercase tracking-wider"
                                            style={{ color: i === 3 ? 'var(--accent-color)' : 'var(--text-muted)' }}
                                        >
                                            {phase}
                                        </span>
                                    </div>
                                    {i < 3 && (
                                        <div
                                            className="h-px w-12 md:w-20"
                                            style={{ backgroundColor: 'var(--border-color)' }}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Experience Cards */}
                        <div className="space-y-4">
                            {portfolioData.experience.map((exp, index) => (
                                <div key={exp.id} className="relative">
                                    {/* Timeline connector */}
                                    {index < portfolioData.experience.length - 1 && (
                                        <div
                                            className="absolute left-4 top-12 w-px h-full"
                                            style={{ backgroundColor: 'var(--border-color)' }}
                                        />
                                    )}
                                    <ComponentBlueprint
                                        title={exp.position}
                                        componentType={exp.current ? 'current-stage' : 'past-stage'}
                                        description={`${exp.company} • ${exp.location}`}
                                        rulerLabelTop={`${exp.startDate} → ${exp.endDate || 'Present'}`}
                                        rulerLabelLeft={`@ ${exp.company}`}
                                    >
                                        <div className="space-y-3">
                                            {/* Phase Indicator */}
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-8 h-8 border-2 rounded-full flex items-center justify-center flex-shrink-0"
                                                    style={{
                                                        borderColor: exp.current ? 'var(--accent-color)' : 'var(--border-color)',
                                                        backgroundColor: exp.current ? 'var(--accent-color)' : 'transparent'
                                                    }}
                                                >
                                                    <span
                                                        className="text-xs font-mono font-bold"
                                                        style={{ color: exp.current ? 'var(--bg-main)' : 'var(--text-muted)' }}
                                                    >
                                                        {index + 1}
                                                    </span>
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span
                                                            className="text-xs font-mono"
                                                            style={{ color: 'var(--text-muted)' }}
                                                        >
                                                            {exp.startDate} → {exp.endDate || 'Present'}
                                                        </span>
                                                        {exp.current && (
                                                            <span
                                                                className="px-2 py-0.5 text-[10px] uppercase"
                                                                style={{
                                                                    backgroundColor: 'var(--accent-color)',
                                                                    color: 'var(--bg-main)'
                                                                }}
                                                            >
                                                                Current
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Actions/Description */}
                                            <p
                                                className="text-sm font-mono pl-11"
                                                style={{ color: 'var(--text-main)' }}
                                            >
                                                {exp.description}
                                            </p>

                                            {/* Touchpoints (Technologies) */}
                                            <div className="flex flex-wrap gap-2 pl-11">
                                                {exp.technologies.slice(0, 5).map((tech) => (
                                                    <span
                                                        key={tech}
                                                        className="text-[10px] font-mono px-2 py-1 border"
                                                        style={{
                                                            borderColor: 'var(--border-color)',
                                                            color: 'var(--text-muted)'
                                                        }}
                                                    >
                                                        {tech}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </ComponentBlueprint>
                                </div>
                            ))}
                        </div>
                    </div>
                </WireframeSection>

                {/* === PROJECTS - CARD SORTING FORMAT === */}
                <WireframeSection
                    id="projects"
                    title="Card Sorting"
                    subtitle="Information architecture"
                >
                    <div ref={setSectionRef('projects')} className="space-y-6">
                        {/* Card Sorting Header */}
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-lg">🗂️</span>
                            <span
                                className="text-[10px] font-mono uppercase tracking-widest px-2 py-1 border"
                                style={{ borderColor: 'var(--accent-color)', color: 'var(--accent-color)' }}
                            >
                                Card Sorting
                            </span>
                        </div>

                        {/* Category Tabs */}
                        <div className="flex flex-wrap gap-2 mb-4">
                            {['All', 'Web', 'Mobile', 'Design', 'AI'].map((cat, i) => (
                                <button
                                    key={cat}
                                    className="px-3 py-1 border text-xs font-mono uppercase tracking-wider cursor-pointer"
                                    style={{
                                        borderColor: i === 0 ? 'var(--accent-color)' : 'var(--border-color)',
                                        color: i === 0 ? 'var(--accent-color)' : 'var(--text-muted)',
                                        backgroundColor: i === 0 ? 'rgba(var(--accent-color-rgb), 0.1)' : 'transparent'
                                    }}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        {/* Sorted Cards Grid */}
                        <div className="grid md:grid-cols-2 gap-6">
                            {portfolioData.projects.slice(0, 4).map((project) => (
                                <ComponentBlueprint
                                    key={project.id}
                                    title={project.title}
                                    componentType={project.category}
                                    rulerLabelTop={project.timeline.duration}
                                    rulerLabelLeft={project.role}
                                >
                                    <div className="space-y-3">
                                        {/* Hierarchy indicator */}
                                        <div className="flex items-center gap-2 mb-2">
                                            <span
                                                className="text-[10px] font-mono uppercase px-2 py-0.5 border"
                                                style={{ borderColor: 'var(--accent-color)', color: 'var(--accent-color)' }}
                                            >
                                                {project.category}
                                            </span>
                                        </div>
                                        <p
                                            className="text-sm font-mono"
                                            style={{ color: 'var(--text-main)' }}
                                        >
                                            {project.description}
                                        </p>
                                        {/* Taxonomy tags */}
                                        <div className="flex flex-wrap gap-2">
                                            {project.technologies.slice(0, 4).map((tech) => (
                                                <span
                                                    key={tech}
                                                    className="text-[10px] font-mono px-2 py-1 border"
                                                    style={{
                                                        borderColor: 'var(--border-color)',
                                                        color: 'var(--text-muted)'
                                                    }}
                                                >
                                                    {tech}
                                                </span>
                                            ))}
                                        </div>
                                        <Link
                                            href={`/case-studies/${project.id}`}
                                            className="inline-block text-xs font-mono uppercase tracking-wider transition-colors"
                                            style={{ color: 'var(--accent-color)' }}
                                        >
                                            Open Card →
                                        </Link>
                                    </div>
                                </ComponentBlueprint>
                            ))}
                        </div>
                    </div>
                </WireframeSection>

                {/* === CONTACT - USABILITY TEST FORMAT === */}
                <WireframeSection
                    id="contact"
                    title="Usability Test"
                    subtitle="Test the connection"
                    className="pb-20"
                >
                    <div ref={setSectionRef('contact')} className="space-y-6">
                        {/* Usability Test Header */}
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-lg">🧪</span>
                            <span
                                className="text-[10px] font-mono uppercase tracking-widest px-2 py-1 border"
                                style={{ borderColor: 'var(--accent-color)', color: 'var(--accent-color)' }}
                            >
                                Usability Test
                            </span>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            {/* Test Scenario */}
                            <ComponentBlueprint
                                title="Test Scenario"
                                componentType="task"
                                rulerLabelTop="Objective"
                                rulerLabelLeft="Task"
                            >
                                <div className="space-y-4">
                                    <div
                                        className="border-l-4 pl-3 py-2"
                                        style={{ borderColor: 'var(--accent-color)' }}
                                    >
                                        <p
                                            className="text-sm font-mono font-bold"
                                            style={{ color: 'var(--text-main)' }}
                                        >
                                            Task: Initiate collaboration
                                        </p>
                                        <p
                                            className="text-xs font-mono mt-1"
                                            style={{ color: 'var(--text-muted)' }}
                                        >
                                            Use any channel below to start a conversation
                                        </p>
                                    </div>

                                    {/* Success Metrics */}
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-mono uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                                            Success Metrics
                                        </p>
                                        <div className="flex items-center gap-2" style={{ color: 'var(--text-main)' }}>
                                            <span style={{ color: 'var(--accent-color)' }}>✓</span>
                                            <span className="text-xs font-mono">Response Time: &lt; 24 hours</span>
                                        </div>
                                        <div className="flex items-center gap-2" style={{ color: 'var(--text-main)' }}>
                                            <span style={{ color: 'var(--accent-color)' }}>✓</span>
                                            <span className="text-xs font-mono">Status: {portfolioData.contact.availability.toUpperCase()}</span>
                                        </div>
                                        <div className="flex items-center gap-2" style={{ color: 'var(--text-main)' }}>
                                            <span style={{ color: 'var(--accent-color)' }}>✓</span>
                                            <span className="text-xs font-mono">Timezone: {portfolioData.contact.timezone}</span>
                                        </div>
                                    </div>
                                </div>
                            </ComponentBlueprint>

                            {/* Test Channels */}
                            <ComponentBlueprint
                                title="Test Channels"
                                componentType="channels"
                                rulerLabelTop="Contact Methods"
                                rulerLabelLeft="Options"
                            >
                                <div className="space-y-4">
                                    <a
                                        href={`mailto:${portfolioData.contact.email}`}
                                        className="flex items-center gap-3 p-3 border group transition-all"
                                        style={{ borderColor: 'var(--border-color)' }}
                                    >
                                        <span className="text-xl">📧</span>
                                        <div>
                                            <span
                                                className="text-xs font-mono block group-hover:underline"
                                                style={{ color: 'var(--accent-color)' }}
                                            >
                                                {portfolioData.contact.email}
                                            </span>
                                            <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>Primary channel</span>
                                        </div>
                                    </a>
                                    <a
                                        href={portfolioData.social.linkedin}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 p-3 border group transition-all"
                                        style={{ borderColor: 'var(--border-color)' }}
                                    >
                                        <span className="text-xl">💼</span>
                                        <div>
                                            <span
                                                className="text-xs font-mono block group-hover:underline"
                                                style={{ color: 'var(--accent-color)' }}
                                            >
                                                LinkedIn
                                            </span>
                                            <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>Professional network</span>
                                        </div>
                                    </a>
                                    <a
                                        href={portfolioData.social.github}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 p-3 border group transition-all"
                                        style={{ borderColor: 'var(--border-color)' }}
                                    >
                                        <span className="text-xl">🐙</span>
                                        <div>
                                            <span
                                                className="text-xs font-mono block group-hover:underline"
                                                style={{ color: 'var(--accent-color)' }}
                                            >
                                                GitHub
                                            </span>
                                            <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>Code collaboration</span>
                                        </div>
                                    </a>
                                </div>
                            </ComponentBlueprint>
                        </div>

                        {/* Run Test CTA */}
                        <div className="flex justify-center pt-4">
                            <a
                                href={`mailto:${portfolioData.contact.email}`}
                                className="px-6 py-3 border-2 font-mono font-bold uppercase text-sm transition-all"
                                style={{
                                    borderColor: 'var(--accent-color)',
                                    backgroundColor: 'var(--accent-color)',
                                    color: 'var(--bg-main)'
                                }}
                            >
                                🧪 Run Test →
                            </a>
                        </div>
                    </div>
                </WireframeSection>

                {/* Footer */}
                <footer
                    className="border-t-2 px-6 py-8"
                    style={{ borderColor: 'var(--border-color)' }}
                >
                    <div className="flex items-center justify-between">
                        <p
                            className="text-xs font-mono"
                            style={{ color: 'var(--text-muted)' }}
                        >
                            © {today.getFullYear()} KIRUK
                        </p>
                        <p
                            className="text-xs font-mono"
                            style={{ color: 'var(--accent-color)' }}
                        >
                            Built with precision
                        </p>
                    </div>
                </footer>
            </main>
        </div>
    );
}
