"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { GridBackground } from "@/components/ui/GridBackground";
import { useResponsiveGrid } from "@/hooks/useResponsiveGrid";
import { ComponentBlueprint } from "@/components/ui/wireframe/ComponentBlueprint";
import { WireframeSection } from "@/components/ui/wireframe/WireframeSection";
import { portfolioData } from "@/data/portfolio-data";
import { useDesignEra } from "@/contexts/DesignEraContext";
import { useLayoutMode } from "@/contexts/LayoutModeContext";
import { HeroWithHatSwitching } from "@/components/sections/HeroWithHatSwitching";
import EraFooter from "@/components/sections/EraFooter";
import Image from "next/image";
import Link from "next/link";

// Section IDs for scroll tracking
const SECTIONS = [
  "hero",
  "about",
  "skills",
  "experience",
  "projects",
  "contact",
] as const;
type SectionId = (typeof SECTIONS)[number];

/**
 * WireframeLayout - Clean wireframe aesthetic with Tailwind-style corner rulers
 * No binding holes or guidebook styling - pure wireframe blueprint aesthetic
 */
export default function WireframeManualLayout() {
  const gridAlignment = useResponsiveGrid();
  const { currentEra } = useDesignEra();
  const { isSplitMode } = useLayoutMode();
  const [currentSection, setCurrentSection] = useState<SectionId>("hero");
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
      { threshold: 0.3 },
    );

    sectionRefs.current.forEach((element) => {
      observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  const setSectionRef = useCallback(
    (id: SectionId) => (el: HTMLElement | null) => {
      if (el) {
        sectionRefs.current.set(id, el);
      }
    },
    [],
  );

  return (
    <div className="relative min-h-screen bg-[var(--bg-main)]">
      {/* Blueprint Grid Background */}
      <div className="fixed inset-0 z-0">
        <GridBackground opacity={0.1} scanlinesOpacity={0.02} />
      </div>

      {/* Main Content */}
      <main
        className="relative z-10 mx-auto"
        style={{
          maxWidth: `${gridAlignment.maxContentWidth}px`,
          width: "100%",
        }}
      >
        {/* Inner header — hidden in sketch/digital split (SimpleGameNav is the only top bar). */}
        {isSplitMode ? null : (
          <motion.header
            className="sticky top-0 z-40 border-b-2"
            data-cursor-zone="inner-nav"
            style={{
              backgroundColor: "var(--bg-main)",
              borderColor: "var(--border-color)",
              height: "44px",
              minHeight: "44px",
              maxHeight: "44px",
              overflow: "hidden",
            }}
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-between px-6 py-3">
              <div className="flex items-center gap-4">
                <span
                  className="text-xs font-mono font-bold uppercase tracking-widest"
                  style={{ color: "var(--accent-color)" }}
                >
                  KIRUK
                </span>
                <span
                  className="text-[10px] font-mono"
                  style={{ color: "var(--text-muted)" }}
                >
                  UX design engineer
                </span>
              </div>

              <nav className="hidden md:flex items-center gap-4">
                {SECTIONS.map((section, index) => (
                  <a
                    key={section}
                    href={`#${section}`}
                    data-cursor-chat="nav-section"
                    className="text-[10px] font-mono uppercase tracking-wider transition-colors"
                    style={{
                      color:
                        currentSection === section
                          ? "var(--accent-color)"
                          : "var(--text-muted)",
                    }}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </a>
                ))}
              </nav>
            </div>
          </motion.header>
        )}

        {/* === HERO WITH HAT SWITCHING === */}
        <HeroWithHatSwitching
          sectionRef={setSectionRef("hero")}
          currentEra={currentEra}
          isClient={isClient}
        />

        {/* === WHY UX DESIGN ENGINEER === */}
        <div data-cursor-zone="why-ux-design-engineer">
          <WireframeSection
            id="why-ux-design-engineer"
            title="Why Kiruk"
            subtitle={portfolioData.whyUXDesignEngineer.hook}
          >
            <div className="max-w-2xl mx-auto space-y-6">
              {/* Pain Points Grid */}
              <div className="grid md:grid-cols-2 gap-3 mb-4">
                <div
                  className="border p-3 flex flex-col justify-center h-24"
                  style={{ borderColor: "var(--border-color)" }}
                >
                  <div className="h-4 flex items-center mb-2">
                    <div
                      className="text-[10px] font-mono uppercase tracking-wider leading-none"
                      style={{ color: "var(--text-muted)" }}
                    >
                      ⚡ Handoff Friction
                    </div>
                  </div>
                  <div className="h-8 flex items-center">
                    <p
                      className="text-xs font-mono leading-tight"
                      style={{ color: "var(--text-main)" }}
                    >
                      Great ideas stall when design and engineering split the
                      work.
                    </p>
                  </div>
                </div>
                <div
                  className="border p-3 flex flex-col justify-center h-24"
                  style={{ borderColor: "var(--border-color)" }}
                >
                  <div className="h-4 flex items-center mb-2">
                    <div
                      className="text-[10px] font-mono uppercase tracking-wider leading-none"
                      style={{ color: "var(--text-muted)" }}
                    >
                      📊 What Teams Need
                    </div>
                  </div>
                  <div className="h-8 flex items-center">
                    <p
                      className="text-xs font-mono leading-tight"
                      style={{ color: "var(--text-main)" }}
                    >
                      A designer who can also ship production-ready UI.
                    </p>
                  </div>
                </div>
              </div>

              {/* The Bridge */}
              <div
                className="border-2 p-4 flex flex-col justify-center h-32"
                style={{
                  borderColor: "var(--accent-color)",
                  backgroundColor: "rgba(var(--accent-color-rgb), 0.05)",
                }}
              >
                <div className="h-8 flex items-center gap-2 mb-2">
                  <span className="text-lg">🌉</span>
                  <span
                    className="text-[10px] font-mono uppercase tracking-widest font-bold leading-none"
                    style={{ color: "var(--accent-color)" }}
                  >
                    The Bridge
                  </span>
                </div>
                <div className="h-6 flex items-center">
                  <p
                    className="text-sm font-mono font-bold leading-none"
                    style={{ color: "var(--text-main)" }}
                  >
                    I design, prototype, and build—so the vision survives to
                    launch.
                  </p>
                </div>
                <div className="h-5 flex items-center mt-1">
                  <p
                    className="text-xs font-mono leading-none"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Research → Interaction → Production
                  </p>
                </div>
              </div>
            </div>
          </WireframeSection>
        </div>

        {/* === ABOUT/PROFILE - PERSONA FORMAT === */}
        <div data-cursor-zone="about">
          <WireframeSection
            id="about"
            title="Persona"
            subtitle="User profile analysis"
          >
            <div ref={setSectionRef("about")} className="space-y-6">
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
                    style={{ borderColor: "var(--accent-color)" }}
                  >
                    <Image
                      src="/images/dp-8bit.jpg"
                      alt="Profile Photo"
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                      style={{ imageRendering: "pixelated" }}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="h-4 flex items-center mb-1">
                      <span
                        className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 border leading-none"
                        style={{
                          borderColor: "var(--accent-color)",
                          color: "var(--accent-color)",
                        }}
                      >
                        👤 Persona
                      </span>
                    </div>
                    <div className="h-8 flex items-center">
                      <h3
                        className="text-xl font-mono font-bold leading-none"
                        style={{ color: "var(--text-main)" }}
                      >
                        {portfolioData.personal.fullName}
                      </h3>
                    </div>
                    <div className="h-6 flex items-center">
                      <p
                        className="text-sm font-mono uppercase tracking-wider leading-none"
                        style={{ color: "var(--accent-color)" }}
                      >
                        {portfolioData.personal.title}
                      </p>
                    </div>
                    <div className="h-5 flex items-center mt-2">
                      <p
                        className="text-xs font-mono leading-none"
                        style={{ color: "var(--text-muted)" }}
                      >
                        📍 {portfolioData.personal.location}
                      </p>
                    </div>
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
                    <li
                      className="h-5 flex items-center gap-2"
                      style={{ color: "var(--text-main)" }}
                    >
                      <span style={{ color: "var(--accent-color)" }}>→</span>
                      <span className="leading-none">
                        Ship user-centered products fast
                      </span>
                    </li>
                    <li
                      className="h-5 flex items-center gap-2"
                      style={{ color: "var(--text-main)" }}
                    >
                      <span style={{ color: "var(--accent-color)" }}>→</span>
                      <span className="leading-none">
                        Bridge the design-engineering gap
                      </span>
                    </li>
                    <li
                      className="h-5 flex items-center gap-2"
                      style={{ color: "var(--text-main)" }}
                    >
                      <span style={{ color: "var(--accent-color)" }}>→</span>
                      <span className="leading-none">
                        Build scalable design systems
                      </span>
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
                    <li
                      className="h-5 flex items-center gap-2"
                      style={{ color: "var(--text-main)" }}
                    >
                      <span style={{ color: "#E91E63" }}>✕</span>
                      <span className="leading-none">
                        Siloed design and dev teams
                      </span>
                    </li>
                    <li
                      className="h-5 flex items-center gap-2"
                      style={{ color: "var(--text-main)" }}
                    >
                      <span style={{ color: "#E91E63" }}>✕</span>
                      <span className="leading-none">
                        Slow design-to-prod handoffs
                      </span>
                    </li>
                    <li
                      className="h-5 flex items-center gap-2"
                      style={{ color: "var(--text-main)" }}
                    >
                      <span style={{ color: "#E91E63" }}>✕</span>
                      <span className="leading-none">
                        Lost context in translation
                      </span>
                    </li>
                  </ul>
                </ComponentBlueprint>
              </div>

              {/* Quote */}
              <div
                className="border-l-4 pl-4 py-2"
                style={{ borderColor: "var(--accent-color)" }}
              >
                <div className="min-h-[48px] flex items-center">
                  <p
                    className="text-lg font-mono italic"
                    style={{ color: "var(--text-main)" }}
                  >
                    "{portfolioData.personal.tagline}"
                  </p>
                </div>
              </div>

              {/* Background */}
              <ComponentBlueprint
                title="Background"
                componentType="bio"
                rulerLabelTop="Context"
                rulerLabelLeft="Story"
              >
                <div className="min-h-[96px]">
                  <p
                    className="text-sm font-mono leading-relaxed"
                    style={{ color: "var(--text-main)" }}
                  >
                    {portfolioData.personal.bio}
                  </p>
                </div>
              </ComponentBlueprint>
            </div>
          </WireframeSection>
        </div>

        {/* === SKILLS - EMPATHY MAP FORMAT === */}
        <div data-cursor-zone="skills">
          <WireframeSection
            id="skills"
            title="Empathy Map"
            subtitle="Understanding my capabilities"
          >
            <div ref={setSectionRef("skills")} className="space-y-6">
              {/* Empathy Map Header */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg">🧠</span>
                <span
                  className="text-[10px] font-mono uppercase tracking-widest px-2 py-1 border"
                  style={{
                    borderColor: "var(--accent-color)",
                    color: "var(--accent-color)",
                  }}
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
                    <div className="h-4 flex items-center">
                      <p
                        className="text-xs font-mono leading-none"
                        style={{ color: "var(--text-muted)" }}
                      >
                        "I can bridge design and development..."
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {portfolioData.skills
                        .filter((s) => s.category === "design")
                        .slice(0, 4)
                        .map((skill) => (
                          <span
                            key={skill.id}
                            className="text-[10px] font-mono px-2 py-1 border"
                            style={{
                              borderColor: "var(--accent-color)",
                              color: "var(--accent-color)",
                            }}
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
                    <li
                      className="h-5 flex items-center gap-2"
                      style={{ color: "var(--text-main)" }}
                    >
                      <span style={{ color: "var(--accent-color)" }}>💡</span>
                      <span className="leading-none">
                        Design is engineering
                      </span>
                    </li>
                    <li
                      className="h-5 flex items-center gap-2"
                      style={{ color: "var(--text-main)" }}
                    >
                      <span style={{ color: "var(--accent-color)" }}>💡</span>
                      <span className="leading-none">
                        Ship fast, iterate faster
                      </span>
                    </li>
                    <li
                      className="h-5 flex items-center gap-2"
                      style={{ color: "var(--text-main)" }}
                    >
                      <span style={{ color: "var(--accent-color)" }}>💡</span>
                      <span className="leading-none">
                        User problems → Solutions
                      </span>
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
                  <div className="flex flex-wrap gap-2">
                    {/* Priority skills: nextjs, figma, blender, mongodb, splunk */}
                    {portfolioData.skills
                      .filter(
                        (s) =>
                          s.id === "nextjs" ||
                          s.id === "figma" ||
                          s.id === "blender" ||
                          s.id === "splunk",
                      )
                      .map((skill) => (
                        <span
                          key={skill.id}
                          className="text-[10px] font-mono px-2 py-1 border"
                          style={{
                            borderColor: "var(--border-color)",
                            color: "var(--text-muted)",
                          }}
                        >
                          {skill.icon} {skill.name}
                        </span>
                      ))}
                    {/* MongoDB */}
                    <span
                      className="text-[10px] font-mono px-2 py-1 border"
                      style={{
                        borderColor: "var(--border-color)",
                        color: "var(--text-muted)",
                      }}
                    >
                      🍃 MongoDB
                    </span>
                    {/* Other relevant skills */}
                    {portfolioData.skills
                      .filter(
                        (s) =>
                          (s.category === "tools" ||
                            s.category === "frontend" ||
                            s.category === "backend") &&
                          s.id !== "nextjs" &&
                          s.id !== "figma" &&
                          s.id !== "blender" &&
                          s.id !== "splunk",
                      )
                      .slice(0, 8)
                      .map((skill) => (
                        <span
                          key={skill.id}
                          className="text-[10px] font-mono px-2 py-1 border"
                          style={{
                            borderColor: "var(--border-color)",
                            color: "var(--text-muted)",
                          }}
                        >
                          {skill.icon} {skill.name}
                        </span>
                      ))}
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
                    <li
                      className="h-5 flex items-center gap-2"
                      style={{ color: "var(--text-main)" }}
                    >
                      <span>✨</span>
                      <span className="leading-none">
                        Passionate about craft & details
                      </span>
                    </li>
                    <li
                      className="h-5 flex items-center gap-2"
                      style={{ color: "var(--text-main)" }}
                    >
                      <span>🎮</span>
                      <span className="leading-none">
                        Excited by gamified experiences
                      </span>
                    </li>
                    <li
                      className="h-5 flex items-center gap-2"
                      style={{ color: "var(--text-main)" }}
                    >
                      <span>🤖</span>
                      <span className="leading-none">
                        Curious about AI integration
                      </span>
                    </li>
                  </ul>
                </ComponentBlueprint>
              </div>
            </div>
          </WireframeSection>
        </div>

        {/* === EXPERIENCE - JOURNEY MAP FORMAT === */}
        <div data-cursor-zone="experience">
          <WireframeSection
            id="experience"
            title="Journey Map"
            subtitle="Career progression timeline"
          >
            <div ref={setSectionRef("experience")} className="space-y-6">
              {/* Journey Map Header */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg">🗺️</span>
                <span
                  className="text-[10px] font-mono uppercase tracking-widest px-2 py-1 border"
                  style={{
                    borderColor: "var(--accent-color)",
                    color: "var(--accent-color)",
                  }}
                >
                  Journey Map
                </span>
              </div>

              {/* Timeline Phases */}
              <div className="flex items-center justify-between mb-6 overflow-x-auto pb-2">
                {["Discovery", "Growth", "Mastery", "Current"].map(
                  (phase, i) => (
                    <div key={phase} className="flex items-center">
                      <div className="text-center px-4">
                        <div
                          className="w-4 h-4 border-2 rounded-full mx-auto mb-1"
                          style={{
                            borderColor: "var(--accent-color)",
                            backgroundColor:
                              i === 3 ? "var(--accent-color)" : "transparent",
                          }}
                        />
                        <span
                          className="text-[10px] font-mono uppercase tracking-wider"
                          style={{
                            color:
                              i === 3
                                ? "var(--accent-color)"
                                : "var(--text-muted)",
                          }}
                        >
                          {phase}
                        </span>
                      </div>
                      {i < 3 && (
                        <div
                          className="h-px w-12 md:w-20"
                          style={{ backgroundColor: "var(--border-color)" }}
                        />
                      )}
                    </div>
                  ),
                )}
              </div>

              {/* Experience Cards */}
              <div className="space-y-4">
                {portfolioData.experience.map((exp, index) => (
                  <div key={exp.id} className="relative">
                    {/* Timeline connector */}
                    {index < portfolioData.experience.length - 1 && (
                      <div
                        className="absolute left-4 top-12 w-px h-full"
                        style={{ backgroundColor: "var(--border-color)" }}
                      />
                    )}
                    <ComponentBlueprint
                      title={exp.position}
                      componentType={
                        exp.current ? "current-stage" : "past-stage"
                      }
                      description={`${exp.company} • ${exp.location}`}
                      rulerLabelTop={`${exp.startDate} → ${exp.endDate || "Present"}`}
                      rulerLabelLeft={`@ ${exp.company}`}
                    >
                      <div className="space-y-3">
                        {/* Phase Indicator */}
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 border-2 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{
                              borderColor: exp.current
                                ? "var(--accent-color)"
                                : "var(--border-color)",
                              backgroundColor: exp.current
                                ? "var(--accent-color)"
                                : "transparent",
                            }}
                          >
                            <span
                              className="text-xs font-mono font-bold"
                              style={{
                                color: exp.current
                                  ? "var(--bg-main)"
                                  : "var(--text-muted)",
                              }}
                            >
                              {index + 1}
                            </span>
                          </div>
                          <div className="h-6 flex items-center">
                            <div className="flex items-center gap-2">
                              <span
                                className="text-xs font-mono leading-none"
                                style={{ color: "var(--text-muted)" }}
                              >
                                {exp.startDate} → {exp.endDate || "Present"}
                              </span>
                              {exp.current && (
                                <span
                                  className="px-2 py-0.5 text-[10px] uppercase leading-none"
                                  style={{
                                    backgroundColor: "var(--accent-color)",
                                    color: "var(--bg-main)",
                                  }}
                                >
                                  Current
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Actions/Description */}
                        <div className="h-10 flex items-center pl-11 mb-2">
                          <p
                            className="text-sm font-mono leading-tight"
                            style={{ color: "var(--text-main)" }}
                          >
                            {exp.description}
                          </p>
                        </div>

                        {/* Touchpoints (Technologies) */}
                        <div className="h-8 flex flex-wrap items-center gap-2 pl-11">
                          {exp.technologies.slice(0, 5).map((tech) => (
                            <span
                              key={tech}
                              className="text-[10px] font-mono px-2 py-1 border leading-none"
                              style={{
                                borderColor: "var(--border-color)",
                                color: "var(--text-muted)",
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
        </div>

        {/* === RESULTS & IMPACT === */}
        <div data-cursor-zone="impact">
          <WireframeSection
            id="impact"
            title="Results & Impact"
            subtitle="Quantified outcomes"
          >
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
              {portfolioData.impactMetrics.map((metric, index) => (
                <ComponentBlueprint
                  key={metric.id}
                  title={metric.label}
                  componentType={metric.category}
                  hideTitleInHeader={true}
                >
                  <div className="flex flex-col items-center space-y-3 text-center h-full">
                    {/* Title - positioned right under the badge */}
                    <div className="h-5 flex items-center -mt-2">
                      <h3
                        className="text-sm font-mono font-bold uppercase tracking-wider flex-shrink-0 leading-none"
                        style={{ color: "var(--text-main)" }}
                      >
                        {metric.label}
                      </h3>
                    </div>

                    {/* Icon */}
                    <div className="h-8 flex items-center">
                      <span className="text-2xl flex-shrink-0 leading-none">
                        {metric.icon}
                      </span>
                    </div>

                    {/* Value */}
                    <div className="h-10 flex items-center">
                      <div
                        className="text-3xl font-mono font-black flex-shrink-0 leading-none"
                        style={{ color: "var(--accent-color)" }}
                      >
                        {metric.value}
                      </div>
                    </div>

                    {/* Context */}
                    {metric.context && (
                      <div className="h-4 flex items-center mt-1">
                        <p
                          className="text-[10px] font-mono flex-shrink-0 leading-none"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {metric.context}
                        </p>
                      </div>
                    )}

                    {/* Progress bar visualization */}
                    <div
                      className="h-1 w-full mx-auto mt-auto"
                      style={{ backgroundColor: "var(--border-color)" }}
                    >
                      <div
                        className="h-full transition-all duration-500"
                        style={{
                          backgroundColor: "var(--accent-color)",
                          width: `${(index + 1) * 25}%`,
                        }}
                      />
                    </div>
                  </div>
                </ComponentBlueprint>
              ))}
            </div>
          </WireframeSection>
        </div>

        {/* === PROJECTS - CARD SORTING FORMAT === */}
        <div data-cursor-zone="projects">
          <WireframeSection
            id="projects"
            title="Card Sorting"
            subtitle="Information architecture"
          >
            <div ref={setSectionRef("projects")} className="space-y-6">
              {/* Card Sorting Header */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg">🗂️</span>
                <span
                  className="text-[10px] font-mono uppercase tracking-widest px-2 py-1 border"
                  style={{
                    borderColor: "var(--accent-color)",
                    color: "var(--accent-color)",
                  }}
                >
                  Card Sorting
                </span>
              </div>

              {/* Category Tabs */}
              <div className="flex flex-wrap gap-2 mb-4">
                {["All", "Web", "Mobile", "Design", "AI"].map((cat, i) => (
                  <button
                    key={cat}
                    className="px-3 py-1 border text-xs font-mono uppercase tracking-wider cursor-pointer"
                    style={{
                      borderColor:
                        i === 0 ? "var(--accent-color)" : "var(--border-color)",
                      color:
                        i === 0 ? "var(--accent-color)" : "var(--text-muted)",
                      backgroundColor:
                        i === 0
                          ? "rgba(var(--accent-color-rgb), 0.1)"
                          : "transparent",
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
                      <div className="h-5 flex items-center mb-2">
                        <span
                          className="text-[10px] font-mono uppercase px-2 py-0.5 border leading-none"
                          style={{
                            borderColor: "var(--accent-color)",
                            color: "var(--accent-color)",
                          }}
                        >
                          {project.category}
                        </span>
                      </div>
                      <div className="h-10 flex items-center">
                        <p
                          className="text-sm font-mono leading-tight"
                          style={{ color: "var(--text-main)" }}
                        >
                          {project.description}
                        </p>
                      </div>
                      {/* Taxonomy tags */}
                      <div className="h-8 flex flex-wrap items-center gap-2">
                        {project.technologies.slice(0, 4).map((tech) => (
                          <span
                            key={tech}
                            className="text-[10px] font-mono px-2 py-1 border"
                            style={{
                              borderColor: "var(--border-color)",
                              color: "var(--text-muted)",
                            }}
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                      <div className="h-6 flex items-center">
                        <Link
                          href="/portfolio"
                          data-cursor-chat="card-open"
                          className="inline-block text-xs font-mono uppercase tracking-wider transition-colors leading-none"
                          style={{ color: "var(--accent-color)" }}
                        >
                          Open Card →
                        </Link>
                      </div>
                    </div>
                  </ComponentBlueprint>
                ))}
              </div>
            </div>
          </WireframeSection>
        </div>

        {/* === CONTACT - USABILITY TEST FORMAT === */}
        <div data-cursor-zone="contact">
          <WireframeSection
            id="contact"
            title="Usability Test"
            subtitle="Test the connection"
            className="pb-20"
          >
            <div ref={setSectionRef("contact")} className="space-y-6">
              {/* Usability Test Header */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg">🧪</span>
                <span
                  className="text-[10px] font-mono uppercase tracking-widest px-2 py-1 border"
                  style={{
                    borderColor: "var(--accent-color)",
                    color: "var(--accent-color)",
                  }}
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
                      style={{ borderColor: "var(--accent-color)" }}
                    >
                      <p
                        className="text-sm font-mono font-bold"
                        style={{ color: "var(--text-main)" }}
                      >
                        Task: Initiate collaboration
                      </p>
                      <p
                        className="text-xs font-mono mt-1"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Use any channel below to start a conversation
                      </p>
                    </div>

                    {/* Success Metrics */}
                    <div className="space-y-2">
                      <p
                        className="text-[10px] font-mono uppercase tracking-wider"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Success Metrics
                      </p>
                      <div
                        className="flex items-center gap-2"
                        style={{ color: "var(--text-main)" }}
                      >
                        <span style={{ color: "var(--accent-color)" }}>✓</span>
                        <span className="text-xs font-mono">
                          Response Time: &lt; 24 hours
                        </span>
                      </div>
                      <div
                        className="flex items-center gap-2"
                        style={{ color: "var(--text-main)" }}
                      >
                        <span style={{ color: "var(--accent-color)" }}>✓</span>
                        <span className="text-xs font-mono">
                          Status:{" "}
                          {portfolioData.contact.availability.toUpperCase()}
                        </span>
                      </div>
                      <div
                        className="flex items-center gap-2"
                        style={{ color: "var(--text-main)" }}
                      >
                        <span style={{ color: "var(--accent-color)" }}>✓</span>
                        <span className="text-xs font-mono">
                          Timezone: {portfolioData.contact.timezone}
                        </span>
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
                      data-cursor-chat="link-email"
                      className="flex items-center gap-3 p-3 border group transition-all"
                      style={{ borderColor: "var(--border-color)" }}
                    >
                      <span className="text-xl">📧</span>
                      <div>
                        <span
                          className="text-xs font-mono block group-hover:underline"
                          style={{ color: "var(--accent-color)" }}
                        >
                          {portfolioData.contact.email}
                        </span>
                        <span
                          className="text-[10px] font-mono"
                          style={{ color: "var(--text-muted)" }}
                        >
                          Primary channel
                        </span>
                      </div>
                    </a>
                    <a
                      href={portfolioData.social.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-cursor-chat="link-linkedin"
                      className="flex items-center gap-3 p-3 border group transition-all"
                      style={{ borderColor: "var(--border-color)" }}
                    >
                      <span className="text-xl">💼</span>
                      <div>
                        <span
                          className="text-xs font-mono block group-hover:underline"
                          style={{ color: "var(--accent-color)" }}
                        >
                          LinkedIn
                        </span>
                        <span
                          className="text-[10px] font-mono"
                          style={{ color: "var(--text-muted)" }}
                        >
                          Professional network
                        </span>
                      </div>
                    </a>
                    <a
                      href="tel:+919486582579"
                      data-cursor-chat="link-phone"
                      className="flex items-center gap-3 p-3 border group transition-all"
                      style={{ borderColor: "var(--border-color)" }}
                    >
                      <span className="text-xl">📞</span>
                      <div>
                        <span
                          className="text-xs font-mono block group-hover:underline"
                          style={{ color: "var(--accent-color)" }}
                        >
                          +91 94865 82579
                        </span>
                        <span
                          className="text-[10px] font-mono"
                          style={{ color: "var(--text-muted)" }}
                        >
                          Call only if it&apos;s urgent
                        </span>
                      </div>
                    </a>
                  </div>
                </ComponentBlueprint>
              </div>

              {/* Run Test CTA */}
              <div className="flex justify-center pt-4">
                <a
                  href={`mailto:${portfolioData.contact.email}`}
                  data-cursor-chat="cta-run-test"
                  className="px-6 py-3 border-2 font-mono font-bold uppercase text-sm transition-all"
                  style={{
                    borderColor: "var(--accent-color)",
                    backgroundColor: "var(--accent-color)",
                    color: "var(--bg-main)",
                  }}
                >
                  🧪 Run Test →
                </a>
              </div>
            </div>
          </WireframeSection>
        </div>

        <EraFooter />
      </main>
    </div>
  );
}
