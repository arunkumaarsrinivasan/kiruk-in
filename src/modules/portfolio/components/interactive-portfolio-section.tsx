'use client';

import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { DraggableItem } from './draggable-notebook';
import ScribbleWorkspace, { EnhancedScribbleDragItem } from './scribble-workspace';
import { SketchHeading } from '@/components/ui/sketch-elements';
import { useCursor } from '@/components/ui/CursorContext';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useDesignSystem } from '@/contexts/ThemeContext';

// Type alias for compatibility
type ScribbleDragItem = EnhancedScribbleDragItem;

// Type definitions
type InteractiveMode = 'notebook' | 'scribble' | 'mixed' | 'presentation' | 'collaboration';

interface InteractiveStats {
  itemsCreated: number;
  timeSpent: number;
  interactionsCount: number;
  achievementsUnlocked: string[];
  skillsExplored: string[];
  projectsViewed: string[];
}

interface ProjectLibraryEntry {
  id: string;
  title: string;
  description: string;
  tags: string[];
  company: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  condition: (stats: InteractiveStats) => boolean;
}

const PERSONAL_NOTE_LIBRARY = [
  '🏡 30-person creative family; feedback was dinner talk.',
  "📝 Middle school QA for my uncle's ERP in exchange for biryani.",
  '🎭 Led Sona cultural design crew with a playful voice.',
  '🧪 Pandemic lab with my cousin: mobile games, FigJam, motion lessons.',
  '🚀 HP Print AI launches meant prompt drills and shared dashboards.',
  '🎨 Squarebridge: 150 screens, async Loom tours, calmer recruiters.',
  '🎮 PeopleGamez internship taught gamified HR dashboards.',
  '🎓 Hosted workshops for 60+ students on design-meets-dev.',
  '🌈 Weekends split between kirukism sketches and tiny notes.',
  '🏔️ Trekking keeps the creative barometer steady; bring chai.',
  '🤝 Workshop-first collaborator; ideas stay on paper till the team nods.',
  '📮 Always up to trade notes on AI, systems, or travel.'
];

const SKILL_LIBRARY = [
  { name: 'Spring Boot Systems', color: 'bg-[var(--bg-secondary)] text-[var(--text-main)] border border-[var(--border-color)]', icon: '🍃' },
  { name: 'Node.js + TypeScript', color: 'bg-[var(--bg-secondary)] text-[var(--text-main)] border border-[var(--border-color)]', icon: '🟢' },
  { name: 'Next.js Storytelling', color: 'bg-[var(--bg-secondary)] text-[var(--text-main)] border border-[var(--border-color)]', icon: '⚡' },
  { name: 'UX Research Rituals', color: 'bg-[var(--bg-secondary)] text-[var(--text-main)] border border-[var(--border-color)]', icon: '🔍' },
  { name: 'Design Systems', color: 'bg-[var(--bg-secondary)] text-[var(--text-main)] border border-[var(--border-color)]', icon: '🎨' },
  { name: 'Observability (Splunk & Prometheus)', color: 'bg-[var(--bg-secondary)] text-[var(--text-main)] border border-[var(--border-color)]', icon: '📈' },
  { name: 'AI Facilitation', color: 'bg-[var(--bg-secondary)] text-[var(--text-main)] border border-[var(--border-color)]', icon: '🤖' },
  { name: 'Gamified Interaction', color: 'bg-[var(--bg-secondary)] text-[var(--text-main)] border border-[var(--border-color)]', icon: '🎮' },
  { name: 'Workshop Hosting', color: 'bg-[var(--bg-secondary)] text-[var(--text-main)] border border-[var(--border-color)]', icon: '📚' },
  { name: 'Mobile Product Loops', color: 'bg-[var(--bg-secondary)] text-[var(--text-main)] border border-[var(--border-color)]', icon: '📱' }
];

const TESTIMONIAL_LIBRARY = [
  {
    text: 'Arun mapped HP Print AI observability in days and aligned our stand-up dashboards.',
    author: 'Engineering Lead, HP Print AI',
    rating: '⭐⭐⭐⭐⭐'
  },
  {
    text: "Squarebridge's design system went from chaos to choreography; devs still cite his Looms.",
    author: 'Product Manager, SNS Square',
    rating: '⭐⭐⭐⭐⭐'
  },
  {
    text: 'His UI/UX workshop made design systems feel buildable for our students.',
    author: 'Faculty Coordinator, Sona College',
    rating: '⭐⭐⭐⭐⭐'
  },
  {
    text: 'PeopleGamez prototypes shipped faster because he co-created loops with product and engineering.',
    author: 'Founder, PeopleGamez.com',
    rating: '⭐⭐⭐⭐⭐'
  }
];

const PROJECT_LIBRARY: ProjectLibraryEntry[] = [
  {
    id: 'hp-print-ai-observability',
    title: 'HP Print AI Observability',
    description: 'Automated incident rituals with Splunk, prompt libraries, and live KPI dashboards for the Print IOT org.',
    tags: ['Observability', 'AI Ops', 'Automation'],
    company: 'HP Inc.'
  },
  {
    id: 'hp-print-ai-workflows',
    title: 'Print AI Workflow Launchpad',
    description: 'Shipped workflow guides, stakeholder tours, and onboarding microsites to unblock cross-continent launches.',
    tags: ['Product Enablement', 'UX Writing', 'Launch'],
    company: 'HP Inc.'
  },
  {
    id: 'squarebridge-design-system',
    title: 'Squarebridge Design System',
    description: 'Codified 150+ screens into a unified system with Loom walkthroughs so engineering could sprint in sync.',
    tags: ['Design System', 'E2E Solutions', 'Enterprise'],
    company: 'SNS Square'
  },
  {
    id: 'peoplegamez-culture-sim',
    title: 'PeopleGamez Culture Sim',
    description: 'Built gamified HR dashboards and scorecards to make hiring stories measurable and playful.',
    tags: ['Gamification', 'Dashboards', 'Product'],
    company: 'PeopleGamez.com'
  },
];

const INTRO_HIGH_LIGHTS = [
  {
    id: 'sketch',
    icon: '✍️',
    title: 'Notebook First',
    note: 'Every feature begins as a scribble in my Kiruk sketchbook.'
  },
  {
    id: 'collab',
    icon: '🗣️',
    title: 'Stakeholder Jam Sessions',
    note: 'Hosts tiny workshops to collect input, sketch together, and land on aligned stories.'
  },
  {
    id: 'process',
    icon: '🌀',
    title: 'Enjoy The Process',
    note: 'Gathers inputs early, iterates mid-flight, and celebrates the messy middle as much as launch day.'
  },
  {
    id: 'generalist',
    icon: '🛠️',
    title: 'Sketch-to-Service',
    note: 'Generalist builder who goes from notebook scamps to shipped services.'
  }
];

// Simple ScribeCanvas component
const ScribeCanvas: React.FC<{ className?: string }> = ({ className = '' }) => {
  return <canvas className={`absolute inset-0 pointer-events-none ${className}`} />;
};

// Wireframe Drag Icon Component
const ScribbledDragIcon: React.FC<{ className?: string; size?: number }> = ({ 
  className = '', 
  size = 20 
}) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      className={className}
    >
      <g fill="currentColor">
        <rect x="4" y="4" width="4" height="4" />
        <rect x="10" y="4" width="4" height="4" />
        <rect x="16" y="4" width="4" height="4" />
        
        <rect x="4" y="10" width="4" height="4" />
        <rect x="10" y="10" width="4" height="4" />
        <rect x="16" y="10" width="4" height="4" />
        
        <rect x="4" y="16" width="4" height="4" />
        <rect x="10" y="16" width="4" height="4" />
        <rect x="16" y="16" width="4" height="4" />
      </g>
    </svg>
  );
};

// Wireframe Move Icon for active dragging
const ScribbledMoveIcon: React.FC<{ className?: string; size?: number }> = ({ 
  className = '', 
  size = 24 
}) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      className={className}
    >
      <g fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12,2 L12,22" />
        <path d="M2,12 L22,12" />
        <rect x="10" y="10" width="4" height="4" fill="currentColor" />
        
        {/* Arrowheads */}
        <path d="M12,2 L9,5 M12,2 L15,5" />
        <path d="M12,22 L9,19 M12,22 L15,19" />
        <path d="M2,12 L5,9 M2,12 L5,15" />
        <path d="M22,12 L19,9 M22,12 L19,15" />
      </g>
    </svg>
  );
};

export const InteractivePortfolioSection: React.FC<{
  className?: string;
  sectionTitle?: string;
}> = ({ 
  className = '', 
  sectionTitle = 'Advanced Interactive Portfolio'
}) => {
  const { setGrabbingCursor, setDroppingCursor, setEyeCursor } = useCursor();
  const { trackPortfolioInteraction, trackInteraction } = useAnalytics();
  const designSystem = useDesignSystem();
  const stickyNoteBaseClass = designSystem.components.stickyNotes.base;
  const cardContainerClass = designSystem.components.cards.base;
  const cardTagClass = designSystem.components.cards.tag;
  const cardHeadingClass = designSystem.components.cards.heading;
  const primaryButtonClass = designSystem.components.buttons.primary;
  const toolbarBadgeClass = designSystem.components.toolbar.badge;
  const toolbarActiveBadgeClass = designSystem.components.toolbar.activeBadge;
  const toolbarIconClass = designSystem.components.toolbar.icon;
  
  const getStickyNoteColorClass = useCallback(
    (color?: string) => {
      const palette = designSystem.components.stickyNotes.palette;
      if (!color) {
        return palette.light;
      }

      const tone = color as keyof typeof palette;
      return palette[tone] ?? palette.light;
    },
    [designSystem]
  );

  // State management
  const [interactiveStats, setInteractiveStats] = useState<InteractiveStats>({
    itemsCreated: 0,
    timeSpent: 0,
    interactionsCount: 0,
    achievementsUnlocked: [],
    skillsExplored: [],
    projectsViewed: []
  });
  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: 'first-interaction',
      title: 'Getting Started',
      description: 'Created your first interactive item',
      icon: '🎯',
      unlocked: false,
      condition: (stats) => stats.itemsCreated >= 1
    },
    {
      id: 'portfolio-explorer',
      title: 'Portfolio Explorer',
      description: 'Viewed 3 different projects',
      icon: '🔍',
      unlocked: false,
      condition: (stats) => stats.projectsViewed.length >= 3
    },
    {
      id: 'skill-master',
      title: 'Skill Master',
      description: 'Explored 5 different skills',
      icon: '⭐',
      unlocked: false,
      condition: (stats) => stats.skillsExplored.length >= 5
    },
    {
      id: 'time-explorer',
      title: 'Time Explorer',
      description: 'Spent 2 minutes exploring the portfolio',
      icon: '⏰',
      unlocked: false,
      condition: (stats) => stats.timeSpent >= 120
    },
    {
      id: 'super-active',
      title: 'Super Active',
      description: 'Made 10 interactions',
      icon: '🚀',
      unlocked: false,
      condition: (stats) => stats.interactionsCount >= 10
    },
    {
      id: 'creator',
      title: 'Creator',
      description: 'Created 5 items',
      icon: '🎨',
      unlocked: false,
      condition: (stats) => stats.itemsCreated >= 5
    }
  ]);

  const [showAchievements, setShowAchievements] = useState(false);
  const [newlyUnlockedAchievements, setNewlyUnlockedAchievements] = useState<string[]>([]);

  // Time tracking effect
  // Auto-dismiss intro note after 10 seconds of visibility.
  useEffect(() => {
    const timer = setInterval(() => {
      setInteractiveStats(prev => ({
        ...prev,
        timeSpent: prev.timeSpent + 1
      }));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Extract achievement processing logic to reduce nesting
  const processAchievements = useCallback((prevAchievements: Achievement[]) => {
    let newlyUnlocked: string[] = [];
    
    const updatedAchievements = prevAchievements.map(achievement => {
      const shouldBeUnlocked = achievement.condition(interactiveStats);
      
      // Only add to newly unlocked if it wasn't unlocked before but should be now
      if (shouldBeUnlocked && !achievement.unlocked) {
        newlyUnlocked.push(achievement.id);
      }
      
      return {
        ...achievement,
        unlocked: shouldBeUnlocked
      };
    });
    
    // Update newly unlocked achievements only if there are new ones
    if (newlyUnlocked.length > 0) {
      setNewlyUnlockedAchievements(prev => {
        // Filter out any that are already in the notification list
        const uniqueNew = newlyUnlocked.filter(id => !prev.includes(id));
        return [...prev, ...uniqueNew];
      });
    }
    
    return updatedAchievements;
  }, [interactiveStats]);

  // Achievement checking effect
  useEffect(() => {
    setAchievements(processAchievements);
  }, [processAchievements]);

  // Remove achievement notifications after 3 seconds
  useEffect(() => {
    if (newlyUnlockedAchievements.length > 0) {
      const timer = setTimeout(() => {
        setNewlyUnlockedAchievements([]);
      }, 3000);
      
      return () => clearTimeout(timer);
    }  }, [newlyUnlockedAchievements]);

  const [notebookItems, setNotebookItems] = useState<DraggableItem[]>([
    {
      id: 'welcome-note',
      type: 'sticky-note',
      content: (
        <div className="font-mono text-xs uppercase tracking-wide">
          <div className="font-black mb-2 border-b border-[var(--border-color)] pb-1">👋 Hey, I'm Arun.</div>
          <div className="leading-relaxed">Grab a story badge—this desk is my wireframe workspace. "Kiruk" is Tamil for scribble and every idea starts on paper.</div>
          <div className="mt-2 font-bold">Badges show how sketches turn into shipped work.</div>
        </div>
      ),
      position: { x: 300, y: 100 },
      rotation: 0,
      color: 'white',
      size: 'md',
      zIndex: 100 // Base z-index for initial items
    },
    {
      id: 'about-card',
      type: 'sketch-card',
      content: (
        <div>
          <SketchHeading level={3} className="text-sm font-black uppercase tracking-widest mb-2 border-b border-[var(--border-color)] pb-1">About Me</SketchHeading>
          <div className="font-mono text-xs text-[var(--text-main)] leading-relaxed uppercase">
            Product-minded engineer and designer shipping end-to-end tools.
            <br /><br />
            Currently shaping HP Print AI and playful kirukism experiments.
            <br /><br />
            📍 Bengaluru · ✉️ arunkumaar.srinivasan@gmail.com
          </div>
        </div>
      ),
      position: { x: 150, y: 450 },
      rotation: 0,
      scale: 1,
      zIndex: 105 // Slightly higher than welcome note
    }
  ]);

  const [scribbleItems, setScribbleItems] = useState<ScribbleDragItem[]>([]);
  const [highlightedItems, setHighlightedItems] = useState<string[]>([]);
  const highlightTimeoutsRef = useRef<Record<string, number>>({});

  const [journeyStepsCompleted, setJourneyStepsCompleted] = useState<string[]>([]);
  const boardNoteMessage = 'Story badges guide the desk. Tap one to open a chapter and watch the green check mark what you have unlocked.';
  const [boardNote, setBoardNote] = useState(boardNoteMessage);
  const [boardMood, setBoardMood] = useState('🚀');

  const markJourneyStep = useCallback((stepId: string) => {
    setJourneyStepsCompleted(prev => (prev.includes(stepId) ? prev : [...prev, stepId]));
  }, []);

  const addNotebookItem = useCallback((item: DraggableItem) => {
    setNotebookItems(prev => {
      const newItems = [...prev, item];
      // Keep only the last 3 items to prevent clutter
      if (newItems.length > 3) {
        return newItems.slice(newItems.length - 3);
      }
      return newItems;
    });
    setHighlightedItems(prev => [...prev.filter(id => id !== item.id), item.id]);

    if (highlightTimeoutsRef.current[item.id]) {
      window.clearTimeout(highlightTimeoutsRef.current[item.id]);
    }

    highlightTimeoutsRef.current[item.id] = window.setTimeout(() => {
      setHighlightedItems(prev => prev.filter(id => id !== item.id));
      delete highlightTimeoutsRef.current[item.id];
    }, 3000);
  }, []);

  useEffect(() => {
    return () => {
      Object.values(highlightTimeoutsRef.current).forEach((timeoutId) => {
        window.clearTimeout(timeoutId);
      });
    };
  }, []);


  // Helper function to get the next available z-index (always on top)
  const getNextZIndex = useCallback(() => {
    const maxZIndex = Math.max(
      ...notebookItems.map(item => item.zIndex || 100),
      100 // minimum z-index
    );
    return maxZIndex + 10; // Add 10 to ensure new items are clearly on top
  }, [notebookItems]);

  // Action functions
  const addProjectCard = useCallback(() => {
    const randomProject = PROJECT_LIBRARY[Math.floor(Math.random() * PROJECT_LIBRARY.length)];

    const newItem: DraggableItem = {
      id: `project-${Date.now()}-${Math.random().toString(36).substring(2)}`,
      type: 'sketch-card',
      content: (
        <div className="max-w-sm space-y-3">
          <SketchHeading level={4} className={`${cardHeadingClass} mb-1`}>
            {randomProject.title}
          </SketchHeading>
          <div className="font-mono text-xs text-[var(--text-main)] uppercase leading-relaxed">
            {randomProject.description}
          </div>
          <div className="flex flex-wrap gap-1 mb-2">
            {randomProject.tags.slice(0, 3).map(tag => (
              <span key={tag} className={cardTagClass}>
                {tag}
              </span>
            ))}
          </div>
          <div className="text-[10px] text-[var(--text-main)] mb-2 font-mono uppercase">
            @ {randomProject.company}
          </div>
        </div>
      ),
      position: { 
        x: Math.random() * 400 + 350, 
        y: Math.random() * 200 + 100 
      },
      rotation: 0,
      scale: 1,
      zIndex: getNextZIndex() // Ensure new items appear on top
    };

    addNotebookItem(newItem);
    setInteractiveStats(prev => ({
      ...prev,
      itemsCreated: prev.itemsCreated + 1,
      interactionsCount: prev.interactionsCount + 1
    }));

    markJourneyStep('projects');
    
    // Track project card creation
    trackPortfolioInteraction('project_card_added', {
      projectId: randomProject.id,
      projectTitle: randomProject.title,
      company: randomProject.company
    });
  }, [cardHeadingClass, cardTagClass, markJourneyStep, primaryButtonClass, trackPortfolioInteraction]);

  const addPersonalNote = useCallback(() => {
    const randomNote = PERSONAL_NOTE_LIBRARY[Math.floor(Math.random() * PERSONAL_NOTE_LIBRARY.length)];
    // Wireframe style: only white
    const randomColor = 'white';

    const newItem: DraggableItem = {
      id: `note-${Date.now()}-${Math.random().toString(36).substring(2)}`,
      type: 'sticky-note',
      content: (
        <div className="font-mono text-xs uppercase leading-relaxed">
          {randomNote}
        </div>
      ),
      position: { 
        x: Math.random() * 350 + 400, 
        y: Math.random() * 250 + 50 
      },
      rotation: 0,
      color: randomColor as any,
      size: 'md',
      zIndex: getNextZIndex() // Ensure new items appear on top
    };

    addNotebookItem(newItem);
    setInteractiveStats(prev => ({
      ...prev,
      itemsCreated: prev.itemsCreated + 1,
      interactionsCount: prev.interactionsCount + 1
    }));
    
    markJourneyStep('notes');

    // Track personal note creation
    trackPortfolioInteraction('personal_note_added', {
      noteType: 'sticky_note'
    });
  }, [markJourneyStep, trackPortfolioInteraction]);

  const addSkillBubble = useCallback(() => {
    const randomSkill = SKILL_LIBRARY[Math.floor(Math.random() * SKILL_LIBRARY.length)];

    const newItem: DraggableItem = {
      id: `skill-${Date.now()}-${Math.random().toString(36).substring(2)}`,
      type: 'sticky-note',
      content: (
        <motion.div 
          className="text-center"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <div className="text-lg mb-1 grayscale">{randomSkill.icon}</div>
          <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-[var(--text-main)]">
            {randomSkill.name}
          </div>
        </motion.div>
      ),
      position: { 
        x: Math.random() * 400 + 350, 
        y: Math.random() * 300 + 150 
      },
      rotation: 0,
      color: 'white',
      size: 'sm',
      zIndex: getNextZIndex() // Ensure new items appear on top
    };

    addNotebookItem(newItem);
    setInteractiveStats(prev => ({
      ...prev,
      itemsCreated: prev.itemsCreated + 1,
      skillsExplored: [...new Set([...prev.skillsExplored, randomSkill.name])],
      interactionsCount: prev.interactionsCount + 1
    }));
    markJourneyStep('skills');
  }, [markJourneyStep]);

  const addInteractiveResume = useCallback(() => {
    const newItem: DraggableItem = {
      id: `resume-${Date.now()}`,
      type: 'sketch-card',
      content: (
        <div className="space-y-2 text-[11px] uppercase tracking-[0.16em] text-[var(--text-main)]">
          <p className="font-bold">HP Print AI · Engineering</p>
          <p className="text-[var(--text-muted)]">Node · Spring Boot · Next.js</p>
          <p>Squarebridge · Design Lead</p>
          <p className="text-[var(--text-muted)]">150 screens · Loom walkthroughs</p>
          <p>Workshops · 60+ students mentored</p>
        </div>
      ),
      position: {
        x: Math.random() * 320 + 420,
        y: Math.random() * 220 + 140
      },
      rotation: (Math.random() - 0.5) * 8,
      scale: 1,
      color: 'white',
      size: 'lg',
      zIndex: getNextZIndex()
    };

    addNotebookItem(newItem);
    setInteractiveStats(prev => ({
      ...prev,
      itemsCreated: prev.itemsCreated + 1,
      interactionsCount: prev.interactionsCount + 1
    }));
    markJourneyStep('resume');
  }, [markJourneyStep]);

  const addTestimonial = useCallback(() => {
    const randomTestimonial = TESTIMONIAL_LIBRARY[Math.floor(Math.random() * TESTIMONIAL_LIBRARY.length)];

    const newItem: DraggableItem = {
      id: `testimonial-${Date.now()}`,
      type: 'sticky-note',
      content: (
        <div className="font-mono text-xs uppercase leading-relaxed">
          <div className="mb-2">💬 "{randomTestimonial.text}"</div>
          <div className="text-[10px] text-[var(--text-main)] font-bold">- {randomTestimonial.author}</div>
          <div className="mt-1">{randomTestimonial.rating}</div>
        </div>
      ),
      position: {
        x: Math.random() * 300 + 450,
        y: Math.random() * 250 + 100
      },
      rotation: (Math.random() - 0.5) * 10,
      color: 'white',
      size: 'md',
      zIndex: getNextZIndex()
    };

    addNotebookItem(newItem);
    setInteractiveStats(prev => ({
      ...prev,
      itemsCreated: prev.itemsCreated + 1,
      interactionsCount: prev.interactionsCount + 1
    }));
    markJourneyStep('testimonials');
  }, [markJourneyStep]);

  const journeySteps = useMemo(
    () => [
      {
        id: 'projects',
        icon: '💼',
        title: 'Project Drops',
        description: 'Drop a quick case study card.',
        action: addProjectCard
      },
      {
        id: 'notes',
        icon: '📝',
        title: 'Personal Scribbles',
        description: 'Add a tiny note from my day-to-day.',
        action: addPersonalNote
      },
      {
        id: 'skills',
        icon: '🎯',
        title: 'Skill Bubbles',
        description: 'Show a stack bubble I rely on.',
        action: addSkillBubble
      },
      {
        id: 'resume',
        icon: '🎓',
        title: 'Mini Resume',
        description: 'Pin a mini resume snapshot.',
        action: addInteractiveResume
      },
      {
        id: 'testimonials',
        icon: '💬',
        title: 'Kind Words',
        description: 'Surface a short teammate quote.',
        action: addTestimonial
      }
    ],
    [
      addInteractiveResume,
      addPersonalNote,
      addProjectCard,
      addSkillBubble,
      addTestimonial
    ]
  );

  const journeyStoryMoments = useMemo(
    () => ({
      projects: {
        note: 'Quick peek at shipped case studies.',
        mood: '🛠️'
      },
      notes: {
        note: 'Tiny notes from daily craft.',
        mood: '📒'
      },
      skills: {
        note: 'Stacks and tools I lean on.',
        mood: '🧰'
      },
      resume: {
        note: 'Highlights from HP work to classrooms.',
        mood: '🎓'
      },
      testimonials: {
        note: 'Voices from teammates and students.',
        mood: '💬'
      }
    }),
    []
  );

  const mobileJourneySummary = useMemo(
    () =>
      journeySteps.map((step) => {
        const story = journeyStoryMoments[step.id as keyof typeof journeyStoryMoments];
        return {
          id: step.id,
          icon: step.icon,
          title: step.title,
          description: step.description,
          note: story?.note ?? ''
        };
      }),
    [journeySteps, journeyStoryMoments]
  );

  const mobileProjectSpotlight = useMemo(
    () => PROJECT_LIBRARY.slice(0, 3),
    []
  );
  const journeyProgress = journeySteps.length === 0
    ? 0
    : Math.min(1, journeyStepsCompleted.length / journeySteps.length);

  const journeyProgressWidth = journeyProgress > 0 ? journeyProgress * 100 : 8;

  const nextJourneyStep = journeySteps.find(
    (step) => !journeyStepsCompleted.includes(step.id)
  );

  useEffect(() => {
    if (journeyStepsCompleted.length === 0) {
      setBoardNote(boardNoteMessage);
      setBoardMood('🚀');
      return;
    }

    const lastUnlocked = journeyStepsCompleted[journeyStepsCompleted.length - 1];
    const story = journeyStoryMoments[lastUnlocked as keyof typeof journeyStoryMoments];
    if (story) {
      setBoardNote(story.note);
      setBoardMood(story.mood);
    }

    if (journeyStepsCompleted.length === journeySteps.length) {
      setBoardNote('All badges cleared—remix the desk or drop a doodle.');
      setBoardMood('🎉');
    }
  }, [journeyStepsCompleted, journeySteps.length, journeyStoryMoments]);

  const achievementsUnlockedCount = useMemo(
    () => achievements.filter((achievement) => achievement.unlocked).length,
    [achievements]
  );

  const clearWorkspace = () => {
    setNotebookItems([]);
    setScribbleItems([]);
    setJourneyStepsCompleted([]);
    setBoardNote(boardNoteMessage);
    setBoardMood('🚀');
    setHighlightedItems([]);
    Object.values(highlightTimeoutsRef.current).forEach((timeoutId) => {
      window.clearTimeout(timeoutId);
    });
    highlightTimeoutsRef.current = {};
    setInteractiveStats(prev => ({
      ...prev,
      itemsCreated: 0,
      timeSpent: 0,
      skillsExplored: [],
      projectsViewed: [],
      interactionsCount: prev.interactionsCount + 1
    }));
  };

  const [showIntro, setShowIntro] = useState(true);
  const [isIntroDocked, setIsIntroDocked] = useState(false);
  const [introPromptToClose, setIntroPromptToClose] = useState(false);
  const introHighlights = INTRO_HIGH_LIGHTS;
  const [activeHighlightIndex, setActiveHighlightIndex] = useState(0);
  const [introPosition, setIntroPosition] = useState({ x: 300, y: 200 });
  const [isDraggingIntro, setIsDraggingIntro] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [forceDesktopExperience, setForceDesktopExperience] = useState(false);
  const [showProjectSpotlight, setShowProjectSpotlight] = useState(false);
  const [projectSpotlightDismissed, setProjectSpotlightDismissed] = useState(false);
  const [projectSpotlightLayout, setProjectSpotlightLayout] = useState<{
    centerX: number;
    top: number;
    viewportWidth: number;
  } | null>(null);
  const projectSpotlightMetrics = useMemo(() => {
    if (!projectSpotlightLayout) {
      return null;
    }

    const messageWidth = 320;
    const minLeft = 16;
    const maxLeft = projectSpotlightLayout.viewportWidth - messageWidth - 16;
    const messageLeft = Math.min(Math.max(projectSpotlightLayout.centerX - messageWidth / 2, minLeft), maxLeft);
    const messageTop = Math.max(projectSpotlightLayout.top - 210, 24);
    const anchorX = projectSpotlightLayout.centerX - messageLeft;
    const anchorY = projectSpotlightLayout.top - messageTop;

    return {
      messageLeft,
      messageTop,
      anchorX,
      anchorY,
      messageWidth
    };
  }, [projectSpotlightLayout]);
  const projectSpotlightScribble = useMemo(() => {
    if (!projectSpotlightMetrics) {
      return null;
    }

    const svgHeight = Math.max(projectSpotlightMetrics.anchorY + 30, 110);
    const controlOffsetX = (projectSpotlightMetrics.anchorX - projectSpotlightMetrics.messageWidth / 2) * 0.4;
    const controlY = svgHeight * 0.45;
    const pathD = `M ${projectSpotlightMetrics.messageWidth / 2} 30 C ${projectSpotlightMetrics.messageWidth / 2 + controlOffsetX} ${controlY}, ${projectSpotlightMetrics.anchorX} ${controlY + 30}, ${projectSpotlightMetrics.anchorX} ${svgHeight - 10}`;
    const labelLeft = Math.min(
      Math.max(projectSpotlightMetrics.anchorX - 70, 12),
      projectSpotlightMetrics.messageWidth - 80
    );
    const labelBottom = Math.max(12, svgHeight - projectSpotlightMetrics.anchorY + 4);

    return {
      svgHeight,
      pathD,
      labelLeft,
      labelBottom
    };
  }, [projectSpotlightMetrics]);

  const activeHighlight = introHighlights.length > 0
    ? introHighlights[activeHighlightIndex % introHighlights.length]
    : null;

  useEffect(() => {
    if (!showIntro) {
      return;
    }

    setIntroPromptToClose(false);
    const timeout = window.setTimeout(() => {
      setIntroPromptToClose(true);
    }, 15000);
    return () => window.clearTimeout(timeout);
  }, [showIntro]);

  useEffect(() => {
    if (!showIntro || introHighlights.length === 0) {
      return;
    }

    const interval = window.setInterval(() => {
      setActiveHighlightIndex((previous) => (previous + 1) % introHighlights.length);
    }, 9000);

    return () => window.clearInterval(interval);
  }, [showIntro, introHighlights.length]);
  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (projectSpotlightDismissed) {
      return;
    }

    const timer = window.setTimeout(() => {
      setShowProjectSpotlight(true);
    }, 35000);

    return () => window.clearTimeout(timer);
  }, [projectSpotlightDismissed]);

  useEffect(() => {
    if (showIntro || projectSpotlightDismissed || showProjectSpotlight) {
      return;
    }

    const timer = window.setTimeout(() => {
      setShowProjectSpotlight(true);
    }, 4000);

    return () => window.clearTimeout(timer);
  }, [showIntro, projectSpotlightDismissed, showProjectSpotlight]);

  useEffect(() => {
    if (showProjectSpotlight) {
      trackInteraction('portfolio_project_spotlight_shown', {});
    }
  }, [showProjectSpotlight, trackInteraction]);

  useEffect(() => {
    if (!showProjectSpotlight) {
      setProjectSpotlightLayout(null);
      return;
    }

    const updateLayout = () => {
      const navLink = document.querySelector<HTMLAnchorElement>("#navigation a[href='/case-studies']");
      if (!navLink) {
        setProjectSpotlightLayout(null);
        return;
      }
      const rect = navLink.getBoundingClientRect();
      setProjectSpotlightLayout({
        centerX: rect.left + rect.width / 2,
        top: rect.top,
        viewportWidth: window.innerWidth
      });
    };

    updateLayout();
    window.addEventListener('resize', updateLayout);
    window.addEventListener('scroll', updateLayout, { passive: true });

    return () => {
      window.removeEventListener('resize', updateLayout);
      window.removeEventListener('scroll', updateLayout);
    };
  }, [showProjectSpotlight]);

  // Extract mouse move handler for intro dragging
  const createMouseMoveHandler = (offsetX: number, offsetY: number, rect: DOMRect) => {
    return (e: MouseEvent) => {
      // Calculate new position based on mouse position minus the initial offset
      let newX = e.clientX - offsetX;
      let newY = e.clientY - offsetY;

      // Get viewport dimensions and element dimensions
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const elementWidth = rect.width;
      const elementHeight = rect.height;

      // Apply boundaries to keep element within viewport
      newX = Math.max(0, Math.min(viewportWidth - elementWidth, newX));
      newY = Math.max(0, Math.min(viewportHeight - elementHeight, newY));

      setIntroPosition({
        x: newX,
        y: newY
      });
    };
  };

  // Extract mouse up handler for intro dragging
  const createMouseUpHandler = (handleMouseMove: (e: MouseEvent) => void) => {
    const mouseUpHandler = () => {
      setIsDraggingIntro(false);
      setDroppingCursor(); // Brief dropping animation
      setTimeout(() => setEyeCursor(), 150); // Then return to eye
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', mouseUpHandler);
    };
    return mouseUpHandler;
  };

  // Handle intro dragging
  const handleIntroMouseDown = (e: React.MouseEvent) => {
    setIsDraggingIntro(true);
    setGrabbingCursor();
    
    // Get the current element bounds
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    const handleMouseMove = createMouseMoveHandler(offsetX, offsetY, rect);
    const handleMouseUp = createMouseUpHandler(handleMouseMove);

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    // Prevent default to avoid text selection
    e.preventDefault();
  };

  // Extract drag end handler to reduce nesting
  const handleItemDragEnd = useCallback((item: DraggableItem, event: any, info: any) => {
    // Use the point from info which gives us the final position
    const newX = info.point.x;
    const newY = info.point.y;
    
    // Get the maximum z-index to ensure this item comes to front
    const maxZIndex = Math.max(
      ...notebookItems.map(i => i.zIndex || 100),
      100
    );
    
    // Update position and bring to front when moved
    const newItems = notebookItems.map(i => 
      i.id === item.id 
        ? { 
            ...i, 
            position: { x: newX, y: newY },
            zIndex: maxZIndex + 10 // Ensure this item is clearly on top
          }
        : i
    );
    setNotebookItems(newItems);
  }, [notebookItems]);

  // Extract achievement notification rendering to reduce nesting
  const renderAchievementNotification = useCallback((achievementId: string, index: number) => {
    const achievement = achievements.find(a => a.id === achievementId);
    if (!achievement) return null;

    return (
      <motion.div
        key={`${achievementId}-${index}`}
        initial={{ opacity: 0, y: isMobile ? -40 : 60, scale: 0.85, rotate: isMobile ? 0 : -3 }}
        animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
        exit={{ opacity: 0, y: isMobile ? -40 : -60, scale: 0.85, rotate: isMobile ? 0 : 3 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className={`fixed z-40 pointer-events-auto ${
          isMobile
            ? 'top-4 left-1/2 -translate-x-1/2 w-[90%] max-w-xs'
            : 'bottom-25 right-4 w-80'
        }`}
        style={{
          marginBottom: isMobile ? '0px' : `${index * 96}px`,
          marginTop: isMobile ? `${index * 72}px` : '0px'
        }}
      >
        <motion.div
          className="relative overflow-hidden border border-[var(--border-color)] shadow-none bg-[var(--bg-card)]"
          whileHover={{ scale: 1.02, rotate: isMobile ? 0 : 1 }}
        >
          <div className="relative p-4 flex items-start gap-3">
            <motion.div
              className="text-3xl grayscale"
              animate={{ rotate: [0, -12, 12, 0], scale: [1, 1.15, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              {achievement.icon}
            </motion.div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-black text-[var(--text-main)] uppercase tracking-widest">Achievement</h4>
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 12 }}
                  className="px-2 py-0.5 text-[9px] bg-[var(--text-main)] text-[var(--bg-main)] border border-[var(--border-color)] uppercase tracking-wide font-bold"
                >
                  New Badge
                </motion.span>
              </div>
              <div className="flex items-center gap-2 text-[var(--text-main)] font-bold text-sm uppercase tracking-tight">
                <span>{achievement.title}</span>
                <motion.span
                  className="text-[var(--text-main)]"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
                >
                  ✓
                </motion.span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] font-mono leading-snug">
                {achievement.description}
              </p>
              <motion.div
                className="mt-2 flex items-center gap-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <span className="flex items-center gap-1 text-[10px] text-[var(--text-muted)] font-mono uppercase">
                  <span role="img" aria-label="confetti">🎉</span>
                  Added to shelf
                </span>
                <motion.button
                  onClick={() => setShowAchievements(true)}
                  className="text-[10px] px-2 py-0.5 border border-[var(--border-color)] text-[var(--text-main)] bg-[var(--bg-card)] hover:bg-[var(--text-main)] hover:text-[var(--bg-main)] transition-colors font-mono uppercase tracking-wide"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  View all
                </motion.button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  }, [achievements, isMobile]);

  // Extract achievement panel item rendering to reduce nesting
  const renderAchievementPanelItem = useCallback((achievement: Achievement) => {
    const isUnlocked = achievement.unlocked;

    return (
      <motion.div
        key={achievement.id}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ type: 'spring', stiffness: 120, damping: 14 }}
        className={`relative overflow-hidden rounded-none border px-4 py-4 shadow-none backdrop-blur-sm ${
          isUnlocked
            ? 'bg-[var(--bg-secondary)] border-[var(--border-color)]'
            : 'bg-[var(--bg-muted)] border-[var(--border-color)]'
        }`}
      >
        <div className="relative flex items-start gap-4">
          <motion.div
            className={`flex h-12 w-12 items-center justify-center rounded-none border ${
              isUnlocked ? 'border-[var(--border-color)] bg-[var(--bg-card)]' : 'border-[var(--border-color)] bg-[var(--bg-card)]'
            } text-2xl`}
            animate={isUnlocked ? { rotate: [0, -8, 8, 0] } : {}}
            transition={{ duration: 4, repeat: isUnlocked ? Infinity : 0, ease: 'easeInOut', repeatDelay: 1 }}
          >
            {achievement.icon}
          </motion.div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <h4 className={`text-lg font-semibold handwritten ${isUnlocked ? 'text-[var(--text-main)]' : 'text-[var(--text-muted)]'}`}>
                {achievement.title}
              </h4>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-none uppercase tracking-wide handwritten ${
                  isUnlocked ? 'bg-[var(--text-main)] text-[var(--bg-main)]' : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)]'
                }`}
              >
                {isUnlocked ? 'Unlocked' : 'In Progress'}
              </span>
            </div>
            <p className={`text-sm leading-snug handwritten ${isUnlocked ? 'text-[var(--text-secondary)]' : 'text-[var(--text-muted)]'}`}>
              {achievement.description}
            </p>
            {!isUnlocked && (
              <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] handwritten">
                <span role="img" aria-label="hint">💡</span>
                Keep exploring the desk to unlock this badge.
              </div>
            )}
          </div>
          {isUnlocked && (
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 180, damping: 12 }}
              className="text-[var(--text-main)] text-2xl"
            >
              ✓
            </motion.div>
          )}
        </div>
        {isUnlocked && (
          <motion.div
            className="absolute -bottom-5 right-4 text-3xl"
            animate={{ y: [0, -6, 0], rotate: [0, 4, -4, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            ✨
          </motion.div>
        )}
      </motion.div>
    );
  }, []);

  // Extract event handlers to reduce inline functions
  const handleStopPropagation = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  const handleCloseAchievements = useCallback(() => {
    setShowAchievements(false);
  }, []);

  const handleCloseIntro = useCallback(() => {
    setShowIntro(false);
    setIsIntroDocked(true);
  }, []);

  const handleRestoreIntro = useCallback(() => {
    setIsIntroDocked(false);
    setShowIntro(true);
  }, []);

  useEffect(() => {
    if (!showIntro) {
      return;
    }

    const timer = window.setTimeout(() => {
      handleCloseIntro();
    }, 5000);

    return () => window.clearTimeout(timer);
  }, [showIntro, handleCloseIntro]);

  const toggleAchievements = useCallback(() => {
    setShowAchievements(!showAchievements);
  }, [showAchievements]);

  const handleLaunchInteractive = useCallback(() => {
    setForceDesktopExperience(true);
    trackInteraction('portfolio_mobile_launch_desktop', {});
  }, [trackInteraction]);

  const handleReturnToSummary = useCallback(() => {
    setForceDesktopExperience(false);
    trackInteraction('portfolio_mobile_back_to_summary', {});
  }, [trackInteraction]);

  const handleDismissProjectSpotlight = useCallback(() => {
    setShowProjectSpotlight(false);
    setProjectSpotlightDismissed(true);
    trackInteraction('portfolio_project_spotlight_dismiss', {});
  }, [trackInteraction]);

  const handleProjectSpotlightNavigate = useCallback(
    (destination: string) => {
      setShowProjectSpotlight(false);
      setProjectSpotlightDismissed(true);
      trackInteraction('portfolio_project_spotlight_navigate', { destination });
    },
    [trackInteraction]
  );

  const shouldRenderDesktopExperience = !isMobile || forceDesktopExperience;


  if (!shouldRenderDesktopExperience) {
    return (
      <section
        className={`relative w-full min-h-screen bg-[var(--bg-main)] overflow-hidden ${className}`}
      >
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_right,var(--border-color)_1px,transparent_1px),linear-gradient(to_bottom,var(--border-color)_1px,transparent_1px)] bg-[size:20px_20px] opacity-10" />
        <div className="relative z-10 px-4 py-8 space-y-5">
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-4 shadow-none">
            <SketchHeading level={2} className="text-lg mb-3 uppercase tracking-widest">
              {sectionTitle}
            </SketchHeading>
            <div className="flex items-center gap-3">
              <div className="text-3xl">👋</div>
              <div>
                <h2 className="text-xl font-bold text-[var(--text-main)] uppercase tracking-tight">
                  Arun Kumaar Srinivasan
                </h2>
                <p className="font-mono text-xs text-[var(--text-secondary)] uppercase tracking-wider">
                  SDE 1 @ HP Inc · Bengaluru & Remote
                </p>
              </div>
            </div>
            <p className="font-mono text-xs text-[var(--text-secondary)] leading-relaxed mt-4 border-l border-[var(--border-color)] pl-3">
              This pocket view lists key projects, skills, and goals. Tap below to open the draggable desk.
            </p>
            <div className="mt-4 flex justify-center">
              <p className="font-mono text-xs text-[var(--text-main)] leading-snug text-center bg-[var(--bg-secondary)] border border-[var(--border-color)] px-4 py-2 shadow-none">
                To see every draggable note, hop onto a wider screen and launch the full desk.
              </p>
            </div>
          </div>

          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-4 shadow-none">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--text-main)] border-b border-[var(--border-color)] pb-2 mb-3">
              Desk Snapshot
            </h3>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="border-r border-[var(--border-color)] last:border-r-0">
                <div className="text-lg font-black text-[var(--text-main)]">
                  {notebookItems.length}
                </div>
                <div className="text-[10px] text-[var(--text-secondary)] font-mono uppercase tracking-wide">
                  Cards
                </div>
              </div>
              <div className="border-r border-[var(--border-color)] last:border-r-0">
                <div className="text-lg font-black text-[var(--text-main)]">
                  {journeySteps.length}
                </div>
                <div className="text-[10px] text-[var(--text-secondary)] font-mono uppercase tracking-wide">
                  Badges
                </div>
              </div>
              <div>
                <div className="text-lg font-black text-[var(--text-main)]">
                  {achievementsUnlockedCount}
                </div>
                <div className="text-[10px] text-[var(--text-secondary)] font-mono uppercase tracking-wide">
                  Goals
                </div>
              </div>
            </div>
            <p className="font-mono text-[10px] text-[var(--text-secondary)] leading-snug mt-3 pt-2 border-t border-[var(--border-color)]">
              Ready for the full desk? Launch it to move notes and unlock badges.
            </p>
          </div>

          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-4 shadow-none">
            <div className="flex items-center gap-2 mb-3 border-b border-[var(--border-color)] pb-2">
              <span className="text-xl">🧭</span>
              <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--text-main)]">
                Explore Highlights
              </h3>
            </div>
            <div className="space-y-3">
              {mobileJourneySummary.map((entry) => (
                <div
                  key={entry.id}
                  className="border border-[var(--border-color)] bg-[var(--bg-card)] px-3 py-2.5.5 hover:bg-[var(--text-main)] hover:text-[var(--bg-main)] transition-colors group"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl grayscale group-hover:grayscale-0">{entry.icon}</span>
                    <div className="flex-1">
                      <p className="font-bold text-xs uppercase tracking-wide group-hover:text-[var(--bg-main)]">
                        {entry.title}
                      </p>
                      <p className="font-mono text-[10px] text-[var(--text-secondary)] leading-snug mt-0.5 group-hover:text-[var(--bg-main)] opacity-80">
                        {entry.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-4 shadow-none">
            <div className="flex items-center gap-2 mb-3 border-b border-[var(--border-color)] pb-2">
              <span className="text-xl">🚀</span>
              <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--text-main)]">
                Project Spotlights
              </h3>
            </div>
            <div className="space-y-3">
              {mobileProjectSpotlight.map((project) => (
                <div
                  key={project.id}
                  className="border border-[var(--border-color)] bg-[var(--bg-card)] px-3 py-2.5.5 hover:translate-x-1 transition-transform"
                >
                  <p className="font-bold text-xs uppercase tracking-wide text-[var(--text-main)]">
                    {project.title}
                  </p>
                  <p className="font-mono text-[10px] text-[var(--text-secondary)] leading-snug mt-1">
                    {project.description}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {project.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 border border-[var(--border-color)] bg-[var(--text-main)] text-[var(--bg-main)] text-[9px] uppercase tracking-wide font-bold"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <p className="font-mono text-[9px] text-[var(--text-muted)] mt-1 uppercase tracking-wider">
                    @ {project.company}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <motion.button
            onClick={handleLaunchInteractive}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="w-full px-4 py-3 bg-[var(--text-main)] text-[var(--bg-main)] font-bold text-xs uppercase tracking-widest shadow-none border border-[var(--border-color)] hover:bg-[var(--bg-main)] hover:text-[var(--text-main)] transition-colors"
          >
            Launch Interactive Desk
          </motion.button>
          <p className="text-center font-mono text-[10px] text-[var(--text-muted)] uppercase tracking-wide">
            Prefer the lighter view? Stay here.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className={`fixed inset-0 w-full h-full overflow-hidden bg-[var(--bg-main)] notebook-bg ${className}`} style={{ zIndex: 1 }}>
      {isMobile && forceDesktopExperience && (
        <div className="absolute top-4 left-4 z-40">
          <button
            onClick={handleReturnToSummary}
            className="px-3 py-1.5 rounded-none bg-[var(--bg-card)]/90 border border-[var(--border-color)] text-xs text-[var(--text-secondary)] handwritten shadow-none"
          >
            Back to mobile view
          </button>
        </div>
      )}
      {isMobile && forceDesktopExperience && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-40 w-[90%] max-w-sm">
          <div className="bg-[var(--bg-card)]/95 border border-dashed border-[var(--border-color)] rounded-none px-4 py-3 shadow-none">
            <p className="handwritten text-xs text-[var(--text-secondary)] text-center leading-snug">
              Heads up: this interactive desk feels best on a larger screen where every draggable note and badge is easier to explore.
            </p>
          </div>
        </div>
      )}
      <ScribeCanvas />
      
      {/* Movable Personal Intro */}
      <AnimatePresence>
        {showIntro && (
        <motion.div
          className={`absolute z-30 ${isMobile ? 'cursor-default' : 'cursor-move'}`}
          style={{
            left: isMobile ? '50%' : introPosition.x,
            top: isMobile ? '10%' : introPosition.y,
            transform: isMobile ? 'translateX(-50%)' : 'none',
            zIndex: isDraggingIntro ? 1000 : 30
          }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          onMouseDown={isMobile ? undefined : handleIntroMouseDown}
          whileHover={isMobile ? {} : { scale: 1.01 }}
        >
            <div className={`bg-[var(--bg-card)] border border-[var(--border-color)] p-4 shadow-none relative select-none ${isMobile ? 'max-w-xs mx-2' : 'max-w-md'}`}>
            {/* Drag handle - only show on desktop */}
            {!isMobile && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-12 h-6 bg-[var(--text-main)] flex items-center justify-center cursor-grab active:cursor-grabbing border border-[var(--border-color)]">
                <ScribbledDragIcon size={16} className="text-[var(--bg-main)]" />
              </div>
            )}
            
            {/* Close button */}
            <button
              onClick={handleCloseIntro}
              className="absolute -top-3 -right-3 w-8 h-8 bg-[var(--text-main)] text-[var(--bg-main)] border border-[var(--bg-main)] flex items-center justify-center text-lg font-bold transition-colors duration-200 shadow-none hover:bg-[var(--bg-main)] hover:text-[var(--text-main)] hover:border-[var(--border-color)]"
              title="Close intro"
            >
              ×
            </button>


            {activeHighlight && (
              <motion.div
                key={activeHighlight.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] p-3 shadow-none flex items-start gap-3"
              >
                <span className="text-2xl grayscale">{activeHighlight.icon}</span>
                <div>
                  <p className="text-sm font-bold text-[var(--text-main)] uppercase tracking-wide">
                    {activeHighlight.title}
                  </p>
                  <p className="font-mono text-xs text-[var(--text-secondary)] leading-snug mt-1">
                    {activeHighlight.note}
                  </p>
                </div>
              </motion.div>
            )}

            <div className="text-center">
              <motion.div whileHover={{ scale: 1.03 }} className={`inline-flex items-center gap-1 px-3 py-2 border font-mono text-[10px] uppercase tracking-wider shadow-none ${
                introPromptToClose
                  ? 'bg-[var(--notepad-bg)] border-[var(--border-color)] text-[var(--notepad-text)]'
                  : 'bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-main)]'
              }`}>
                {introPromptToClose
                  ? '👋 Ready? Tap the X to tuck this away.'
                  : '✨ Interactive portfolio ahead — move notes, unlock badges. ✨'}
              </motion.div>
            </div>
          </div>
        </motion.div>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {isIntroDocked && !showIntro && (
          <motion.button
            type="button"
            onClick={handleRestoreIntro}
            className="absolute z-40"
            style={{
              bottom: isMobile ? '88px' : '32px',
              left: isMobile ? '16px' : '32px'
            }}
            initial={{ opacity: 0, scale: 0.7, rotate: -6 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.7, rotate: -6 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            whileHover={{ scale: 1.05, rotate: 2 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Reopen intro notebook"
          >
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showProjectSpotlight && (
          <motion.aside
            key="project-spotlight"
            className="absolute z-60 pointer-events-auto"
            style={{
              bottom: isMobile
                ? 'calc(152px + env(safe-area-inset-bottom, 0px))'
                : '144px',
              left: isMobile ? '16px' : '32px',
              right: 'auto'
            }}
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.92 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
          >
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Journey Command Center - Mobile (Unified) */}
      {isMobile && (
        <div
          className="absolute z-20 px-4 w-full"
          style={{
            top: '16px',
            left: '50%',
            transform: 'translateX(-50%)',
            maxWidth: '19rem',
            width: 'calc(100% - 2rem)',
            maxHeight: 'calc(100vh - 2rem)',
            overflowY: 'auto'
          }}
        >
          <div className="flex flex-col gap-3 pointer-events-auto pr-1">
            <motion.div
              className="bg-[var(--bg-card)]/95 backdrop-blur-md border border-[var(--border-color)] rounded-none p-3 sketch-border shadow-none"
              style={{ width: '100%' }}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-main)] handwritten">Kiruk Desk Board</h3>
                  <p className="text-[11px] text-[var(--text-secondary)] handwritten leading-snug mt-1">
                    Kiruk is Tamil for scribble. This desk is just my paper notebook brought on screen.
                  </p>
                  <p className="text-[11px] text-[var(--text-secondary)] handwritten leading-snug mt-1">
                    {nextJourneyStep
                      ? `Tap a story badge to unlock "${nextJourneyStep.title}".`
                      : 'Everything is unlocked — remix the desk!'}
                  </p>
                </div>
                <motion.span
                  className="text-2xl"
                  animate={{ rotate: [0, -5, 5, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', repeatDelay: 4 }}
                >
                  📎
                </motion.span>
              </div>
              <div className="mt-2">
                <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)] handwritten">
                  <span>Progress</span>
                  <span>{Math.round(journeyProgress * 100)}%</span>
                </div>
                <div className="mt-1 h-1.5 rounded-none bg-[var(--bg-secondary)] border border-[var(--border-color)] overflow-hidden">
                  <motion.div
                    className="h-full bg-[var(--text-main)]"
                    initial={{ width: 0 }}
                    animate={{ width: `${journeyProgressWidth}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                  />
                </div>
              </div>
              <div className="mt-2 grid grid-cols-3 gap-1.5">
                {journeySteps.map((step) => {
                  const isComplete = journeyStepsCompleted.includes(step.id);
                  const isNextUp = !isComplete && nextJourneyStep?.id === step.id;
                  return (
                    <motion.button
                      key={step.id}
                      onClick={() => {
                        step.action();
                        trackInteraction('portfolio_journey_step', { stepId: step.id });
                      }}
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.95 }}
                      aria-pressed={isComplete}
                      className={`relative flex flex-col items-center justify-center gap-1 px-2 py-2 rounded-none border text-center transition-all duration-200 shadow-sm ${
                        isComplete
                          ? 'bg-[var(--bg-secondary)] border-[var(--border-color)]'
                          : isNextUp
                          ? 'bg-[var(--bg-secondary)]/70 border-[var(--border-color)] shadow-none'
                          : 'bg-[var(--bg-card)]/80 border-[var(--border-color)] hover:border-[var(--text-main)] hover:bg-[var(--bg-secondary)]'
                      }`}
                    >
                      <motion.div
                        className={`relative flex items-center justify-center w-9 h-9 rounded-none border ${
                          isComplete
                            ? 'border-[var(--border-color)] bg-[var(--bg-secondary)]'
                            : isNextUp
                            ? 'border-[var(--border-color)] bg-[var(--bg-card)] shadow-none'
                            : 'border-[var(--border-color)] bg-[var(--bg-card)]'
                        }`}
                        animate={
                          isComplete
                            ? { scale: 1 }
                            : isNextUp
                            ? { scale: [1, 1.12, 1], rotate: [0, 2, -2, 0] }
                            : { scale: [1, 1.04, 1], rotate: [0, 1.2, -1.2, 0] }
                        }
                        transition={{ duration: 2.4, repeat: isComplete ? 0 : Infinity, ease: 'easeInOut' }}
                      >
                        <span className="text-lg">{step.icon}</span>
                        {isComplete && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-none bg-[var(--text-main)] text-[10px] font-semibold text-[var(--bg-main)]"
                          >
                            ✓
                          </motion.span>
                        )}
                        {isNextUp && (
                          <motion.span
                            className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-sm text-[var(--text-main)]"
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: [0, 1, 0.6, 1], y: [-4, -8, -6, -8] }}
                            transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
                          >
                            ✨
                          </motion.span>
                        )}
                      </motion.div>
                      <span className="text-[11px] text-[var(--text-main)] handwritten leading-tight">
                        {step.title}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
              <div className="mt-2">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={boardNote}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-start gap-2 rounded-none border border-dashed border-[var(--border-color)] bg-[var(--bg-card)]/80 px-2.5.5 py-2 shadow-inner"
                  >
                    <span className="text-xl">{boardMood}</span>
                    <p className="text-[11px] text-[var(--text-secondary)] handwritten leading-snug">{boardNote}</p>
                  </motion.div>
                </AnimatePresence>
              </div>
              <div className="mt-2 flex items-center justify-between gap-2">
                <motion.button
                  onClick={toggleAchievements}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 px-2 py-1.5 rounded-none border border-[var(--border-color)] bg-[var(--bg-card)] text-[10px] text-[var(--text-main)] handwritten hover:border-[var(--text-main)] hover:text-[var(--text-main)] transition-colors"
                >
                  Goals
                  {achievementsUnlockedCount > 0 && (
                    <span className="ml-1 inline-flex items-center justify-center rounded-none bg-[var(--text-main)] text-[var(--bg-main)] text-[9px] px-1">
                      {achievementsUnlockedCount}
                    </span>
                  )}
                </motion.button>
                <motion.button
                  onClick={clearWorkspace}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-2 py-1.5 rounded-none border border-[var(--border-color)] bg-[var(--text-main)] text-[var(--bg-main)] text-[10px] handwritten hover:bg-[var(--text-main)] transition-colors flex items-center gap-1"
                >
                  <span role="img" aria-label="Reset desk">🧹</span>
                  Reset
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      )}



      {/* Desktop - Top Right Gamified Toolbar */}
      {!isMobile && (
        <motion.div
          className="fixed top-4 right-4 z-40 flex flex-col items-end gap-2 pointer-events-auto"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {/* The Gamified Bar */}
          <div className="relative flex items-center gap-1 p-2 bg-[var(--bg-card)] border border-[var(--border-color)] shadow-none">
            
            {/* Progress Line Background */}
            <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] z-0">
               <motion.div 
                 className="h-full bg-[var(--text-main)]"
                 initial={{ width: 0 }}
                 animate={{ width: `${journeyProgressWidth}%` }}
                 transition={{ duration: 0.6 }}
               />
            </div>

            {journeySteps.map((step, index) => {
              const isComplete = journeyStepsCompleted.includes(step.id);
              const isNextUp = !isComplete && nextJourneyStep?.id === step.id;
              
              return (
                <div key={step.id} className="relative z-10 group">
                  <motion.button
                    onClick={() => {
                      step.action();
                      trackInteraction('portfolio_journey_step', { stepId: step.id });
                    }}
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    className={`relative flex items-center justify-center w-8 h-8 transition-all duration-300 ${toolbarBadgeClass} ${
                      isComplete ? toolbarActiveBadgeClass : ''
                    } ${isNextUp ? 'ring-2 ring-[var(--text-main)]' : ''} ${
                      !isComplete && !isNextUp ? 'opacity-70' : ''
                    }`}
                  >
                    <span className={`text-lg relative z-10 grayscale group-hover:grayscale-0 ${toolbarIconClass}`}>
                      {step.icon}
                    </span>
                  </motion.button>
                  
                  {/* Tooltip */}
                  <div className="absolute top-full right-0 mt-3 w-48 p-2 bg-[var(--text-main)] text-[var(--bg-main)] text-xs font-mono uppercase tracking-wide opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 text-right border border-[var(--bg-main)] shadow-none">
                    <div className="font-bold text-[var(--bg-main)]">{step.title}</div>
                    <div className="text-[10px] text-[var(--bg-secondary)] leading-tight">{step.description}</div>
                  </div>
                </div>
              );
            })}

            <div className="w-px h-6 bg-[var(--bg-secondary)] mx-1" />

            {/* Extra Actions */}
            <div className="flex items-center gap-1 pl-1 relative z-10">
               <motion.button
                onClick={toggleAchievements}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-9 h-9 flex items-center justify-center rounded-none bg-[var(--notepad-bg)] border border-[var(--notepad-border)] text-[var(--notepad-text)] hover:border-[var(--notepad-border)] transition-colors"
                title="Achievements"
              >
                🏆
                {achievementsUnlockedCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-none bg-[var(--text-main)] text-[9px] font-bold text-[var(--bg-main)] border border-[var(--bg-main)]">
                    {achievementsUnlockedCount}
                  </span>
                )}
              </motion.button>

              <motion.button
                onClick={clearWorkspace}
                whileHover={{ scale: 1.1, rotate: 15 }}
                whileTap={{ scale: 0.9 }}
                className="w-9 h-9 flex items-center justify-center rounded-none bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-muted)] hover:bg-[var(--bg-secondary)] hover:border-[var(--border-color)] hover:text-[var(--text-main)] transition-colors"
                title="Reset Desk"
              >
                🧹
              </motion.button>
            </div>
          </div>

          {/* Mood/Note Bubble */}
          <AnimatePresence mode="wait">
            <motion.div
              key={boardNote}
              initial={{ opacity: 0, x: 20, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 10, scale: 0.9 }}
              className="bg-[var(--bg-card)]/90 backdrop-blur-sm border border-[var(--border-color)] rounded-none px-3 py-2 shadow-sm max-w-xs text-right"
            >
              <div className="flex items-center justify-end gap-2">
                <p className="text-[11px] text-[var(--text-secondary)] handwritten leading-snug">{boardNote}</p>
                <span className="text-lg">{boardMood}</span>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      )}

      {/* Interactive workspace */}
      <div className="absolute inset-0 top-0" style={{ zIndex: 0 }}>
        <div className="absolute inset-0">
          <div className="absolute inset-0" style={{ zIndex: 1 }}>
            <ScribbleWorkspace
              initialItems={scribbleItems}
              onItemsChange={setScribbleItems}
              showAddButton={false}
              className="w-full h-full"
            />
          </div>
            <div className="absolute inset-0" style={{ zIndex: 2 }}>
            {notebookItems.map((item) => {
              const baseZIndex = item.zIndex ?? 100;
              const isHighlighted = highlightedItems.includes(item.id);
              const computedZIndex = isHighlighted ? baseZIndex + 200 : baseZIndex;

              return (
                <motion.div
                  key={item.id}
                  className={`absolute group ${isMobile ? 'cursor-default' : 'cursor-move'} transition-[box-shadow] duration-300 ease-out`}
                  style={{
                    transform: `rotate(${item.rotation ?? 0}deg) scale(${item.scale ?? 1})`,
                    zIndex: computedZIndex
                  }}
                initial={
                  item.id === 'welcome-note' || item.id === 'about-card'
                    ? { opacity: 0, x: item.position.x, y: item.position.y }
                    : { x: item.position.x, y: item.position.y }
                }
                animate={{
                  opacity: 1
                }}
                drag={!isMobile}
                dragMomentum={false}
                dragElastic={0.1}
                dragConstraints={{
                  left: 0,
                  right: (typeof window !== 'undefined' ? window.innerWidth : 800) - 200,
                  top: 0,
                  bottom: (typeof window !== 'undefined' ? window.innerHeight : 600) - 150
                }}
                onDragEnd={(event, info) => handleItemDragEnd(item, event, info)}
                whileHover={isMobile ? {} : { scale: (item.scale ?? 1) * 1.01 }}
                whileDrag={isMobile ? {} : { 
                  scale: (item.scale ?? 1) * 1.02, 
                  zIndex: 1000,
                  rotate: (item.rotation ?? 0) + (Math.random() - 0.5) * 2,
                  boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                }}
                transition={{
                  type: "spring", 
                  damping: 25, 
                  stiffness: 200,
                  ...(item.id === 'welcome-note' || item.id === 'about-card' 
                    ? {
                        duration: 1,
                        delay: item.id === 'welcome-note' ? 0.5 : 1,
                        ease: "easeOut"
                      }
                    : {})
                }}
              >
                <AnimatePresence>
                  {isHighlighted && (
                    <motion.span
                      className="absolute -inset-2.5 rounded-none pointer-events-none shadow-none"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 0.35, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.02 }}
                      transition={{ duration: 0.35, ease: 'easeOut' }}
                      style={{ zIndex: -1, background: 'transparent' }}
                    />
                  )}
                </AnimatePresence>
                {/* Drag indicator overlay when dragging */}
                {!isMobile && (
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    initial={{ opacity: 0 }}
                    whileDrag={{ opacity: 1 }}
                    style={{ zIndex: 10 }}
                  >
                    <div className="bg-[var(--bg-card)]/90 rounded-none p-2 border border-dashed border-[var(--border-color)]">
                      <ScribbledMoveIcon size={20} className="text-[var(--text-main)]" />
                    </div>
                  </motion.div>
                )}
                
                {item.type === 'sticky-note' ? (
                  <div className={`relative ${stickyNoteBaseClass} ${
                    isMobile ? 'min-w-[120px] min-h-[80px] text-sm' : 'min-w-[150px] min-h-[100px]'
                  } ${getStickyNoteColorClass(item.color)}`}>
                    {!isMobile && (
                      <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <ScribbledDragIcon size={12} className="text-[var(--text-muted)]" />
                      </div>
                    )}
                    {item.content}
                  </div>
                ) : (
                  <div className={`relative ${cardContainerClass} ${
                    isMobile ? 'min-w-[160px] min-h-[120px] text-sm' : 'min-w-[200px] min-h-[150px]'
                  }`}>
                    {!isMobile && (
                      <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <ScribbledDragIcon size={14} className="text-[var(--text-secondary)]" />
                      </div>
                    )}
                    {item.content}
                  </div>
                )}
                </motion.div>
              );
            })}
          </div>
        </div>      </div>      {/* Achievement Notifications */}
      <AnimatePresence>
        {newlyUnlockedAchievements.map((achievementId, index) => 
          renderAchievementNotification(achievementId, index)
        )}
      </AnimatePresence>

      {/* Achievements Panel */}
      <AnimatePresence>
        {showAchievements && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={handleCloseAchievements}
          >
            <motion.div
              className={`bg-[var(--bg-card)] border border-[var(--border-color)] rounded-none p-4 sketch-border ${
                isMobile ? 'max-w-xs w-full mx-2 max-h-96' : 'max-w-md w-full mx-4'
              }`}
              onClick={handleStopPropagation}
            >
              <SketchHeading level={2} className={`${isMobile ? 'text-lg' : 'text-xl'} mb-4 text-center`}>
                🏆 Achievements
              </SketchHeading>
              <div className={`space-y-3 overflow-y-auto ${isMobile ? 'max-h-48' : 'max-h-64'}`}>
                {achievements.map(renderAchievementPanelItem)}
              </div>
              <button
                onClick={handleCloseAchievements}
                className={`w-full mt-4 px-4 py-2 bg-[var(--text-main)] text-[var(--bg-main)] rounded-none hover:bg-[var(--text-main)] transition-colors ${
                  isMobile ? 'text-sm' : ''
                }`}
              >
                Close
              </button>
            </motion.div>
          </motion.div>        )}
      </AnimatePresence>

    </section>
  );
};

export default InteractivePortfolioSection;
