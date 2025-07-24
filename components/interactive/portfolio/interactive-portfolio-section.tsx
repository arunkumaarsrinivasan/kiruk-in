'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DraggableItem } from './draggable-notebook';
import ScribbleWorkspace, { EnhancedScribbleDragItem } from './scribble-workspace';
import { SketchHeading } from '../../ui/sketch-elements';
import ScribblePad from './scribble-pad';
import { useCursor } from '../../ui/CursorContext';

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

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  condition: (stats: InteractiveStats) => boolean;
}

// Simple ScribeCanvas component
const ScribeCanvas: React.FC<{ className?: string }> = ({ className = '' }) => {
  return <canvas className={`absolute inset-0 pointer-events-none ${className}`} />;
};

// Scribbled Drag Icon Component
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
      style={{ filter: 'drop-shadow(1px 1px 1px rgba(0,0,0,0.1))' }}
    >
      {/* Hand-drawn style drag dots */}
      <g fill="currentColor" opacity="0.8">
        {/* Top row dots - slightly wobbly */}
        <circle cx="6.2" cy="6.1" r="1.8" />
        <circle cx="11.9" cy="5.8" r="1.7" />
        <circle cx="17.8" cy="6.3" r="1.9" />
        
        {/* Middle row dots */}
        <circle cx="6.1" cy="11.8" r="1.9" />
        <circle cx="12.2" cy="12.1" r="1.8" />
        <circle cx="17.7" cy="11.7" r="1.8" />
        
        {/* Bottom row dots */}
        <circle cx="5.9" cy="17.9" r="1.7" />
        <circle cx="11.8" cy="18.2" r="1.9" />
        <circle cx="18.1" cy="17.8" r="1.8" />
      </g>
      
      {/* Scribbled outline effect */}
      <g fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.3">
        <path d="M4,4 Q6,3 8,4 Q10,5 8,6 Q6,7 4,6 Q2,5 4,4" />
        <path d="M16,4 Q18,3 20,4 Q22,5 20,6 Q18,7 16,6 Q14,5 16,4" />
        <path d="M4,16 Q6,15 8,16 Q10,17 8,18 Q6,19 4,18 Q2,17 4,16" />
        <path d="M16,16 Q18,15 20,16 Q22,17 20,18 Q18,19 16,18 Q14,17 16,16" />
      </g>
    </svg>
  );
};

// Enhanced Scribbled Move Icon for active dragging
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
      style={{ filter: 'drop-shadow(2px 2px 2px rgba(0,0,0,0.2))' }}
    >
      {/* Hand-drawn move arrows */}
      <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        {/* Up arrow */}
        <path d="M12,3 L12,8 M9,5 Q11,3 12,3 Q13,3 15,5" opacity="0.9" />
        {/* Down arrow */}
        <path d="M12,21 L12,16 M9,19 Q11,21 12,21 Q13,21 15,19" opacity="0.9" />
        {/* Left arrow */}
        <path d="M3,12 L8,12 M5,9 Q3,11 3,12 Q3,13 5,15" opacity="0.9" />
        {/* Right arrow */}
        <path d="M21,12 L16,12 M19,9 Q21,11 21,12 Q21,13 19,15" opacity="0.9" />
      </g>
      
      {/* Central scribbled circle */}
      <g fill="currentColor" opacity="0.6">
        <circle cx="12.1" cy="11.9" r="2.2" />
      </g>
      
      {/* Wobbly decorative lines */}
      <g fill="none" stroke="currentColor" strokeWidth="1" opacity="0.4">
        <path d="M8,8 Q10,6 12,8 Q14,10 16,8" />
        <path d="M8,16 Q10,18 12,16 Q14,14 16,16" />
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
  
  // Helper function for sticky note color
  const getStickyNoteColorClass = (color?: string) => {
    switch (color) {
      case 'light': return 'bg-yellow-100';
      case 'medium': return 'bg-yellow-200';
      case 'white': return 'bg-white';
      default: return 'bg-yellow-50';
    }
  };

  // State management
  const [interactiveStats, setInteractiveStats] = useState<InteractiveStats>({
    itemsCreated: 0,
    timeSpent: 0,
    interactionsCount: 0,
    achievementsUnlocked: [],
    skillsExplored: [],
    projectsViewed: []
  });  const [achievements, setAchievements] = useState<Achievement[]>([
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
    }  ]);

  const [showAchievements, setShowAchievements] = useState(false);
  const [newlyUnlockedAchievements, setNewlyUnlockedAchievements] = useState<string[]>([]);

  // Time tracking effect
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
        <div className="handwritten text-sm">
          <div className="font-bold mb-1">👋 Welcome to my Portfolio!</div>
          <div>Interact with elements to discover my journey as an AX Designer, developer, and creative problem-solver</div>
        </div>
      ),
      position: { x: 300, y: 100 },
      rotation: -3,
      color: 'medium',
      size: 'md'
    },
    {
      id: 'about-card',
      type: 'sketch-card',
      content: (
        <div>
          <SketchHeading level={3} className="text-lg mb-2">About Me</SketchHeading>
          <div className="handwritten text-sm text-gray-700">
            AX Designer with expertise in AI/ML, UX design, and full-stack development. I create seamless experiences that bridge artificial intelligence with human-centered design principles. 
            <br /><br />
            📍 Bangalore | 📧 arunkumaar.srinivasan@gmail.com 
          </div>
        </div>
      ),
      position: { x: 150, y: 450 },
      rotation: 2,
      scale: 1
    }
  ]);

  const [scribbleItems, setScribbleItems] = useState<ScribbleDragItem[]>([]);

  // Action functions
  const addProjectCard = useCallback(() => {
    const projects = [
      {
        id: 'cloud-microservices',
        title: 'Cloud Microservices Engineering',
        description: 'Specialized in microservice reliability using Splunk, Spring Boot, AWS SQS, SNS, DynamoDB, and Prometheus',
        tags: ['AWS', 'Spring Boot', 'Microservices'],
        company: 'HP Inc'
      },
      {
        id: 'end-to-end-design',
        title: 'End-to-End Design Leadership',
        description: 'Led comprehensive design initiatives encompassing branding, UX research, and UI design across various platforms',
        tags: ['UX Research', 'Branding', 'UI Design'],
        company: 'SNS Square'
      },
      {
        id: 'crypto-dashboard',
        title: 'Cryptocurrency Bot Dashboard',
        description: 'Managed complete branding and website design with user-friendly dashboard for streamlined user management',
        tags: ['Branding', 'Dashboard', 'Analytics'],
        company: 'Spera'
      },
      {
        id: 'hr-game-design',
        title: 'HR Engagement Game Design',
        description: 'Crafted engaging game experiences for HR stakeholders with user flows and interaction designs',
        tags: ['Game Design', 'User Flows', 'HR Tech'],
        company: 'PeopleGamez.com'
      },
      {
        id: 'ngo-cms-platform',
        title: 'NGO Website & CMS Platform',
        description: 'Developed website with integrated payment functionality and content management system for streamlined donations',
        tags: ['CMS', 'Payment Integration', 'NGO'],
        company: 'Life Savers NGO'
      },
      {
        id: 'ui-ux-workshops',
        title: 'UI/UX Design Workshops',
        description: 'Delivered guest lectures and conducted workshops for 60+ students, sharing practical design knowledge',
        tags: ['Education', 'Workshops', 'UI/UX'],
        company: 'Academia'
      }
    ];

    const randomProject = projects[Math.floor(Math.random() * projects.length)];
    const randomColors = ['bg-blue-100 text-blue-800', 'bg-green-100 text-green-800', 'bg-purple-100 text-purple-800'];
    const randomColorClass = randomColors[Math.floor(Math.random() * randomColors.length)];

    const newItem: DraggableItem = {
      id: `project-${Date.now()}-${Math.random().toString(36).substring(2)}`,
      type: 'sketch-card',
      content: (
        <div className="max-w-sm">
          <SketchHeading level={4} className="text-base mb-2">{randomProject.title}</SketchHeading>
          <div className="handwritten text-sm text-gray-600 mb-3">
            {randomProject.description}
          </div>
          <div className="flex flex-wrap gap-1 mb-2">
            {randomProject.tags.slice(0, 3).map(tag => (
              <span key={tag} className={`px-2 py-1 rounded-full text-xs ${randomColorClass}`}>
                {tag}
              </span>
            ))}
          </div>
          <div className="text-xs text-gray-600 mb-2 handwritten">
            @ {randomProject.company}
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setInteractiveStats(prev => ({
                ...prev,
                projectsViewed: [...new Set([...prev.projectsViewed, randomProject.id])],
                interactionsCount: prev.interactionsCount + 1
              }));
            }}
            className="text-xs bg-gray-800 text-white px-3 py-1 rounded hover:bg-gray-700 transition-colors"
          >
            View Details
          </motion.button>
        </div>
      ),
      position: { 
        x: Math.random() * 400 + 350, 
        y: Math.random() * 200 + 100 
      },
      rotation: (Math.random() - 0.5) * 8,
      scale: 1
    };

    setNotebookItems(prev => [...prev, newItem]);
    setInteractiveStats(prev => ({
      ...prev,
      itemsCreated: prev.itemsCreated + 1,
      interactionsCount: prev.interactionsCount + 1
    }));
  }, []);

  const addPersonalNote = useCallback(() => {
    const notes = [
      '☁️ SDE 1 @ HP Inc - Working with AWS, Spring Boot & Microservices',
      '🎨 Freelance Design Lead @ SNS Square - End-to-end design initiatives',
      '🚀 Passionate about AWS Cloud Services & DevOps',
      '🎯 Spring Boot MicroServices specialist',
      '🎨 UX/UI Design & Branding expert',
      '🛠️ Prototyping & Dev handoff pro',
      '📱 Web & Mobile Development enthusiast',
      '🔍 Design Strategy & UX Research focused',
      '🎮 Game Design hobbyist',
      '🎵 Ask me about my music playlist!',
      '🤝 Why I love Collaboration',
      '🏔️ Trekking >>>>> Party (always!)',
      '🏓 Table Tennis enthusiast',
      '😊 Always Happy to Connect!',
      '🎓 B.E Computer Science & Engineering (8.9 CGPA)',
      '📍 Bangalore (Hybrid) based',
      '💡 Delivered UI/UX workshops for 60+ students',
      '🌟 Perfectionist and versatile generalist'
    ];

    const randomNote = notes[Math.floor(Math.random() * notes.length)];
    const stickyColors = ['light', 'medium', 'white', 'pink', 'blue', 'green'];
    const randomColor = stickyColors[Math.floor(Math.random() * stickyColors.length)];

    const newItem: DraggableItem = {
      id: `note-${Date.now()}-${Math.random().toString(36).substring(2)}`,
      type: 'sticky-note',
      content: (
        <div className="handwritten text-sm">
          {randomNote}
        </div>
      ),
      position: { 
        x: Math.random() * 350 + 400, 
        y: Math.random() * 250 + 50 
      },
      rotation: (Math.random() - 0.5) * 15,
      color: randomColor as any,
      size: 'md'
    };

    setNotebookItems(prev => [...prev, newItem]);
    setInteractiveStats(prev => ({
      ...prev,
      itemsCreated: prev.itemsCreated + 1,
      interactionsCount: prev.interactionsCount + 1
    }));
  }, []);

  const addSkillBubble = useCallback(() => {
    const skills = [
      { name: 'AWS Cloud Services', color: 'bg-orange-100 text-orange-800', icon: '☁️' },
      { name: 'Spring Boot', color: 'bg-green-100 text-green-800', icon: '🍃' },
      { name: 'Microservices', color: 'bg-blue-100 text-blue-800', icon: '🔧' },
      { name: 'UX/UI Design', color: 'bg-purple-100 text-purple-800', icon: '🎨' },
      { name: 'Branding & Visual Design', color: 'bg-pink-100 text-pink-800', icon: '🎯' },
      { name: 'Prototyping', color: 'bg-indigo-100 text-indigo-800', icon: '⚡' },
      { name: 'Web Development', color: 'bg-cyan-100 text-cyan-800', icon: '💻' },
      { name: 'Mobile Development', color: 'bg-teal-100 text-teal-800', icon: '📱' },
      { name: 'Design Strategy', color: 'bg-yellow-100 text-yellow-800', icon: '🎯' },
      { name: 'UX Research', color: 'bg-red-100 text-red-800', icon: '🔍' },
      { name: 'Game Design', color: 'bg-violet-100 text-violet-800', icon: '🎮' },
      { name: 'DynamoDB', color: 'bg-gray-100 text-gray-800', icon: '🗄️' },
      { name: 'Prometheus', color: 'bg-rose-100 text-rose-800', icon: '📊' },
      { name: 'Splunk', color: 'bg-emerald-100 text-emerald-800', icon: '📈' }
    ];

    const randomSkill = skills[Math.floor(Math.random() * skills.length)];

    const newItem: DraggableItem = {
      id: `skill-${Date.now()}-${Math.random().toString(36).substring(2)}`,
      type: 'sticky-note',
      content: (
        <motion.div 
          className="text-center"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <div className="text-lg mb-1">{randomSkill.icon}</div>
          <div className={`handwritten text-sm font-bold ${randomSkill.color.split(' ')[1]}`}>
            {randomSkill.name}
          </div>
        </motion.div>
      ),
      position: { 
        x: Math.random() * 400 + 350, 
        y: Math.random() * 300 + 150 
      },
      rotation: (Math.random() - 0.5) * 10,
      color: 'white',
      size: 'sm'
    };

    setNotebookItems(prev => [...prev, newItem]);
    setInteractiveStats(prev => ({
      ...prev,
      itemsCreated: prev.itemsCreated + 1,
      skillsExplored: [...new Set([...prev.skillsExplored, randomSkill.name])],
      interactionsCount: prev.interactionsCount + 1
    }));
  }, []);

  const addInteractiveResume = useCallback(() => {
    const newItem: DraggableItem = {
      id: `resume-${Date.now()}`,
      type: 'sketch-card',
      content: (
        <div>
          <SketchHeading level={3} className="text-lg mb-3">🎓 Professional Summary</SketchHeading>
          <div className="space-y-3">
            <motion.div 
              className="bg-blue-50 p-2 rounded handwritten text-sm"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <strong>Current:</strong> SDE 1 @ HP Inc (Feb 2023 - Present)
            </motion.div>
            <motion.div 
              className="bg-green-50 p-2 rounded handwritten text-sm"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <strong>Education:</strong> B.E Computer Science & Engineering (8.9 CGPA)
            </motion.div>
            <motion.div 
              className="bg-purple-50 p-2 rounded handwritten text-sm"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <strong>Specialization:</strong> AWS Cloud Services & Microservices
            </motion.div>
            <motion.div 
              className="bg-pink-50 p-2 rounded handwritten text-sm"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <strong>Design Focus:</strong> End-to-end UX/UI & Branding
            </motion.div>
          </div>
        </div>
      ),
      position: { 
        x: Math.random() * 350 + 400, 
        y: Math.random() * 200 + 150 
      },
      rotation: (Math.random() - 0.5) * 6,
      scale: 1
    };

    setNotebookItems(prev => [...prev, newItem]);
    setInteractiveStats(prev => ({
      ...prev,
      itemsCreated: prev.itemsCreated + 1,
      interactionsCount: prev.interactionsCount + 1
    }));
  }, []);

  const addTestimonial = useCallback(() => {
    const testimonials = [
      {
        text: "Arun's cloud engineering expertise has significantly improved our microservice reliability!",
        author: "Team Lead, HP Inc WPP Connectivity",
        rating: "⭐⭐⭐⭐⭐"
      },
      {
        text: "His end-to-end design approach and developer handoff process is exceptional.",
        author: "Project Manager, SNS Square",
        rating: "⭐⭐⭐⭐⭐"
      },
      {
        text: "Students loved his UI/UX workshops - practical knowledge with real-world insights!",
        author: "Academic Coordinator, Design Workshop",
        rating: "⭐⭐⭐⭐⭐"
      },
      {
        text: "Perfect blend of technical expertise and design thinking. Rare combination!",
        author: "CTO, Tech Startup",
        rating: "⭐⭐⭐⭐⭐"
      }
    ];

    const randomTestimonial = testimonials[Math.floor(Math.random() * testimonials.length)];
    
    const newItem: DraggableItem = {
      id: `testimonial-${Date.now()}`,
      type: 'sticky-note',
      content: (
        <div className="handwritten text-sm">
          <div className="mb-2">💬 "{randomTestimonial.text}"</div>
          <div className="text-xs text-gray-600">- {randomTestimonial.author}</div>
          <div className="mt-1">{randomTestimonial.rating}</div>
        </div>
      ),
      position: { 
        x: Math.random() * 300 + 450, 
        y: Math.random() * 250 + 100 
      },
      rotation: (Math.random() - 0.5) * 12,
      color: 'light',
      size: 'md'
    };

    setNotebookItems(prev => [...prev, newItem]);
    setInteractiveStats(prev => ({
      ...prev,
      itemsCreated: prev.itemsCreated + 1,
      interactionsCount: prev.interactionsCount + 1
    }));
  }, []);
  const addScribbleElement = useCallback(() => {
    setShowScribblePad(true);
  }, []);
  const handleScribbleInsert = useCallback((scribbleData: string) => {
    const newNote: DraggableItem = {
      id: `scribble-note-${Date.now()}`,
      type: 'sketch-element',
      content: (
        <div className="w-full h-full flex items-center justify-center p-2">
          <img 
            src={scribbleData} 
            alt="Hand-drawn scribble" 
            className="max-w-full max-h-full object-contain"
          />
        </div>
      ),
      position: { 
        x: Math.random() * (window.innerWidth - 250) + 50, 
        y: Math.random() * (window.innerHeight - 200) + 100 
      },
      rotation: Math.random() * 10 - 5,
      scale: 1,
      color: 'white',
      size: 'lg'
    };

    setNotebookItems(prev => [...prev, newNote]);
    setInteractiveStats(prev => ({
      ...prev,
      itemsCreated: prev.itemsCreated + 1,
      interactionsCount: prev.interactionsCount + 1
    }));
  }, []);
  const clearWorkspace = () => {
    setNotebookItems([]);
    setScribbleItems([]);
    setInteractiveStats(prev => ({
      ...prev,
      itemsCreated: 0,
      timeSpent: 0,
      skillsExplored: [],
      projectsViewed: [],
      interactionsCount: prev.interactionsCount + 1
    }));
  };  const [showIntro, setShowIntro] = useState(true);
  const [introPosition, setIntroPosition] = useState({ x: 300, y: 200 });
  const [isDraggingIntro, setIsDraggingIntro] = useState(false);
  const [showScribblePad, setShowScribblePad] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
    
    // Update position and bring to front when moved
    const newItems = notebookItems.map(i => 
      i.id === item.id 
        ? { 
            ...i, 
            position: { x: newX, y: newY },
            zIndex: (i.zIndex ?? 100) + 1 
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
        initial={{ opacity: 0, y: isMobile ? -30 : 50, scale: 0.8, rotate: isMobile ? 0 : -5 }}
        animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
        exit={{ opacity: 0, y: isMobile ? -30 : -50, scale: 0.8, rotate: isMobile ? 0 : 5 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={`fixed bg-gradient-to-br from-yellow-100 to-yellow-200 border-4 border-dashed border-yellow-400 rounded-2xl shadow-xl z-40 transition-transform duration-300 ${
          isMobile 
            ? 'top-4 left-1/2 transform -translate-x-1/2 p-3 max-w-xs mx-2' 
            : 'bottom-32 right-8 p-4 transform rotate-1 hover:rotate-0'
        }`}
        style={{ 
          marginBottom: isMobile ? '0px' : `${index * 90}px`,
          marginTop: isMobile ? `${index * 80}px` : '0px'
        }}
        whileHover={{ scale: isMobile ? 1.01 : 1.02 }}
      >
        <div className={`flex items-center ${isMobile ? 'gap-2' : 'gap-3'}`}>
          <motion.span 
            className={`${isMobile ? 'text-2xl' : 'text-3xl'} flex-shrink-0`}
            animate={{ 
              rotate: [0, 10, -10, 0],
              scale: [1, 1.2, 1]
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity, 
              ease: "easeInOut",
              repeatDelay: 1
            }}
          >
            {achievement.icon}
          </motion.span>
          <div className="flex-1 min-w-0">
            <div className={`font-bold text-gray-800 ${isMobile ? 'text-sm' : 'text-lg'}`} style={{ fontFamily: 'Left Hand, cursive' }}>
              Achievement Unlocked! 🎉
            </div>
            <div className={`text-gray-700 font-semibold ${isMobile ? 'text-sm' : 'text-base'}`} style={{ fontFamily: 'Left Hand, cursive' }}>
              {achievement.title}
            </div>
            <div className={`text-gray-600 opacity-90 ${isMobile ? 'text-xs' : 'text-sm'}`} style={{ fontFamily: 'Left Hand, cursive' }}>
              {achievement.description}
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-400 rounded-full animate-pulse"></div>
        <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-yellow-300 rounded-full"></div>
      </motion.div>
    );
  }, [achievements, isMobile]);

  // Extract achievement panel item rendering to reduce nesting
  const renderAchievementPanelItem = useCallback((achievement: Achievement) => (
    <motion.div
      key={achievement.id}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`p-3 rounded-lg border-2 ${
        achievement.unlocked 
          ? 'bg-green-50 border-green-200' 
          : 'bg-gray-50 border-gray-200'
      }`}
    >
      <div className="flex items-center gap-3">
        <span className={`text-2xl ${achievement.unlocked ? '' : 'grayscale'}`}>
          {achievement.icon}
        </span>
        <div className="flex-1">
          <div className={`font-bold ${achievement.unlocked ? 'text-green-800' : 'text-gray-500'}`}>
            {achievement.title}
          </div>
          <div className={`text-sm ${achievement.unlocked ? 'text-green-600' : 'text-gray-400'}`}>
            {achievement.description}
          </div>
        </div>
        {achievement.unlocked && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-green-500 text-xl"
          >
            ✓
          </motion.div>
        )}
      </div>
    </motion.div>
  ), []);

  // Extract event handlers to reduce inline functions
  const handleStopPropagation = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  const handleCloseAchievements = useCallback(() => {
    setShowAchievements(false);
  }, []);

  const handleCloseIntro = useCallback(() => {
    setShowIntro(false);
  }, []);

  const toggleAchievements = useCallback(() => {
    setShowAchievements(!showAchievements);
  }, [showAchievements]);


  return (
    <section className={`fixed inset-0 w-full h-full overflow-hidden bg-white notebook-bg ${className}`} style={{ zIndex: 1 }}>
      <ScribeCanvas />
      
      {/* Movable Personal Intro */}
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
          <div className={`bg-gradient-to-r from-blue-50 to-indigo-100 border-4 border-dashed border-blue-300 rounded-2xl p-4 shadow-xl relative select-none ${isMobile ? 'max-w-xs mx-2' : 'max-w-md'}`}>
            {/* Drag handle - only show on desktop */}
            {!isMobile && (
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-10 h-6 bg-blue-300 rounded-b-lg flex items-center justify-center cursor-grab active:cursor-grabbing border-2 border-blue-400">
                <ScribbledDragIcon size={16} className="text-blue-700" />
              </div>
            )}
            
            {/* Close button */}
            <button
              onClick={handleCloseIntro}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold transition-colors duration-200 shadow-lg"
              title="Close intro"
            >
              ×
            </button>

            <div className="flex items-center gap-3 mb-3">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", repeatDelay: 2 }}
                className="text-3xl"
              >
                👋
              </motion.div>              <div>                <h2 className="text-xl font-bold text-gray-800" style={{ fontFamily: 'Left Hand, cursive' }}>
                  Hey! I'm Arun
                </h2>
                <div className="handwritten text-sm text-blue-600">
                  SDE 1 @ HP Inc | Designer & Developer
                </div>
              </div>
            </div>

            <div className="handwritten text-gray-700 text-sm mb-3">
              <p>
                🚀 Full-stack developer who loves crafting delightful experiences. 
                When not coding, you'll find me trekking 🥾 or playing ping pong 🏓
              </p>
            </div>

            <div className="grid grid-cols-4 gap-2 mb-3">
              <div className="bg-white/80 rounded-lg p-2 text-center text-xs">
                <div className="text-lg">⚡</div>
                <div>Dev</div>
              </div>
              <div className="bg-white/80 rounded-lg p-2 text-center text-xs">
                <div className="text-lg">🎨</div>
                <div>Design</div>
              </div>
              <div className="bg-white/80 rounded-lg p-2 text-center text-xs">
                <div className="text-lg">☁️</div>
                <div>AWS</div>
              </div>
              <div className="bg-white/80 rounded-lg p-2 text-center text-xs">
                <div className="text-lg">🏔️</div>
                <div>Trek</div>
              </div>
            </div>

            <motion.div
              className="text-center"
              whileHover={{ scale: 1.02 }}
            >
              <div className="handwritten text-xs text-gray-600 bg-white/90 px-3 py-2 rounded-full border border-dashed border-gray-300">
                ✨ Interactive portfolio ahead! ✨
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
      
      {/* Tools and Analytics */}
      <div className={`absolute z-20 ${isMobile ? 'top-4 left-4 right-4' : 'top-8 right-8'}`}>
        <div className="flex flex-col gap-3">
          {/* Toolbar with Labels */}
          <div className="bg-white/95 backdrop-blur-sm border-2 border-black rounded-lg p-3 sketch-border shadow-lg">
            <div className="text-center mb-2">
              <h3 className="text-xs font-semibold text-gray-700 handwritten">🎨 Creative Tools</h3>
            </div>
            {isMobile ? (
              /* Mobile: Grid layout with labels */
              <div className="grid grid-cols-3 gap-2">
                <motion.button
                  onClick={addProjectCard}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex flex-col items-center p-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-all duration-200 shadow-sm"
                >
                  <span className="text-lg">💼</span>
                  <span className="text-xs text-gray-600">Project</span>
                </motion.button>
                <motion.button
                  onClick={addPersonalNote}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex flex-col items-center p-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-all duration-200 shadow-sm"
                >
                  <span className="text-lg">📝</span>
                  <span className="text-xs text-gray-600">Note</span>
                </motion.button>
                <motion.button
                  onClick={addSkillBubble}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex flex-col items-center p-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-all duration-200 shadow-sm"
                >
                  <span className="text-lg">🎯</span>
                  <span className="text-xs text-gray-600">Skill</span>
                </motion.button>
                <motion.button
                  onClick={addInteractiveResume}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex flex-col items-center p-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-all duration-200 shadow-sm"
                >
                  <span className="text-lg">🎓</span>
                  <span className="text-xs text-gray-600">Resume</span>
                </motion.button>
                <motion.button
                  onClick={addTestimonial}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex flex-col items-center p-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-all duration-200 shadow-sm"
                >
                  <span className="text-lg">💬</span>
                  <span className="text-xs text-gray-600">Review</span>
                </motion.button>
                <motion.button
                  onClick={addScribbleElement}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex flex-col items-center p-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-all duration-200 shadow-sm"
                >
                  <span className="text-lg">✏️</span>
                  <span className="text-xs text-gray-600">Draw</span>
                </motion.button>
              </div>
            ) : (
              /* Desktop: Row layout with hover labels */
              <div className="flex items-center justify-center gap-2">
                <motion.button
                  onClick={addProjectCard}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative group w-10 h-10 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-lg rounded-full transition-all duration-200 flex items-center justify-center shadow-sm hover:shadow-md"
                  title="Add Project Card"
                >
                  💼
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Project
                  </div>
                </motion.button>
                <motion.button
                  onClick={addPersonalNote}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative group w-10 h-10 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-lg rounded-full transition-all duration-200 flex items-center justify-center shadow-sm hover:shadow-md"
                  title="Add Personal Note"
                >
                  📝
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Note
                  </div>
                </motion.button>
                <motion.button
                  onClick={addSkillBubble}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative group w-10 h-10 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-lg rounded-full transition-all duration-200 flex items-center justify-center shadow-sm hover:shadow-md"
                  title="Add Skill Bubble"
                >
                  🎯
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Skill
                  </div>
                </motion.button>
                <div className="w-px h-6 bg-gray-300 mx-1"></div>
                <motion.button
                  onClick={addInteractiveResume}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative group w-10 h-10 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-lg rounded-full transition-all duration-200 flex items-center justify-center shadow-sm hover:shadow-md"
                  title="Add Resume"
                >
                  🎓
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Resume
                  </div>
                </motion.button>
                <motion.button
                  onClick={addTestimonial}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative group w-10 h-10 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-lg rounded-full transition-all duration-200 flex items-center justify-center shadow-sm hover:shadow-md"
                  title="Add Testimonial"
                >
                  💬
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Testimonial
                  </div>
                </motion.button>
                <div className="w-px h-6 bg-gray-300 mx-1"></div>
                <motion.button
                  onClick={addScribbleElement}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative group w-10 h-10 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-lg rounded-full transition-all duration-200 flex items-center justify-center shadow-sm hover:shadow-md"
                  title="Add Scribble"
                >
                  ✏️
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Draw
                  </div>
                </motion.button>
                <div className="w-px h-6 bg-gray-300 mx-1"></div>
                <motion.button
                  onClick={toggleAchievements}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative group w-10 h-10 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-lg rounded-full transition-all duration-200 flex items-center justify-center shadow-sm hover:shadow-md"
                  title="Achievements"
                >
                  🏆
                  {achievements.filter(a => a.unlocked).length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      {achievements.filter(a => a.unlocked).length}
                    </span>
                  )}
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Goals
                  </div>
                </motion.button>
                <motion.button
                  onClick={clearWorkspace}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative group w-10 h-10 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-lg rounded-full transition-all duration-200 flex items-center justify-center shadow-sm hover:shadow-md"
                  title="Reset Workspace"
                >
                  🗑️
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Clear
                  </div>
                </motion.button>
              </div>
            )}
            
            {/* Action buttons row for mobile */}
            {isMobile && (
              <div className="flex justify-center gap-2 mt-3 pt-2 border-t border-gray-200">
                <motion.button
                  onClick={toggleAchievements}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex flex-col items-center p-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-all duration-200 shadow-sm relative"
                >
                  <span className="text-lg">🏆</span>
                  <span className="text-xs text-gray-600">Goals</span>
                  {achievements.filter(a => a.unlocked).length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      {achievements.filter(a => a.unlocked).length}
                    </span>
                  )}
                </motion.button>
                <motion.button
                  onClick={clearWorkspace}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex flex-col items-center p-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-all duration-200 shadow-sm"
                >
                  <span className="text-lg">🗑️</span>
                  <span className="text-xs text-gray-600">Clear</span>
                </motion.button>
              </div>
            )}
          </div>

          {/* Analytics Panel */}
          <div className="bg-white/95 backdrop-blur-sm border-2 border-black rounded-lg p-3 sketch-border shadow-lg">
            <div className="text-center mb-1">
              <h3 className="text-xs font-semibold text-gray-700 handwritten">📈 Live Analytics</h3>
            </div>
            <div className={`flex items-center justify-center text-xs handwritten ${isMobile ? 'grid grid-cols-2 gap-2' : 'gap-4'}`}>
              <div className="text-center">
                <div className="font-bold text-blue-800">{interactiveStats.itemsCreated}</div>
                <div className="text-gray-600">Items</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-green-800">
                  {Math.floor(interactiveStats.timeSpent / 60)}:{(interactiveStats.timeSpent % 60).toString().padStart(2, '0')}
                </div>
                <div className="text-gray-600">Time</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-purple-800">{interactiveStats.interactionsCount}</div>
                <div className="text-gray-600">Clicks</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-orange-800">
                  {achievements.filter(a => a.unlocked).length}/{achievements.length}
                </div>
                <div className="text-gray-600">Goals</div>
              </div>
            </div>
          </div>
        </div>
      </div>

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
            {notebookItems.map((item) => (
              <motion.div
                key={item.id}
                className={`absolute group ${isMobile ? 'cursor-default' : 'cursor-move'}`}
                style={{
                  transform: `rotate(${item.rotation ?? 0}deg) scale(${item.scale ?? 1})`,
                  zIndex: item.zIndex ?? 100
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
                {/* Drag indicator overlay when dragging */}
                {!isMobile && (
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    initial={{ opacity: 0 }}
                    whileDrag={{ opacity: 1 }}
                    style={{ zIndex: 10 }}
                  >
                    <div className="bg-white/90 rounded-full p-2 border-2 border-dashed border-indigo-400">
                      <ScribbledMoveIcon size={20} className="text-indigo-600" />
                    </div>
                  </motion.div>
                )}
                
                {item.type === 'sticky-note' ? (
                  <div className={`relative p-3 rounded-lg shadow-lg border-2 border-gray-300 ${
                    isMobile ? 'min-w-[120px] min-h-[80px] text-sm' : 'min-w-[150px] min-h-[100px]'
                  } ${getStickyNoteColorClass(item.color)}`}>
                    {!isMobile && (
                      <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <ScribbledDragIcon size={12} className="text-gray-500" />
                      </div>
                    )}
                    {item.content}
                  </div>
                ) : (
                  <div className={`relative p-4 bg-white rounded-lg shadow-lg border-2 border-black sketch-border ${
                    isMobile ? 'min-w-[160px] min-h-[120px] text-sm' : 'min-w-[200px] min-h-[150px]'
                  }`}>
                    {!isMobile && (
                      <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <ScribbledDragIcon size={14} className="text-gray-600" />
                      </div>
                    )}
                    {item.content}
                  </div>
                )}
              </motion.div>
            ))}
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
              className={`bg-white border-2 border-black rounded-lg p-6 sketch-border ${
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
                className={`w-full mt-4 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors ${
                  isMobile ? 'text-sm' : ''
                }`}
              >
                Close
              </button>
            </motion.div>
          </motion.div>        )}
      </AnimatePresence>

      {/* Scribble Pad Modal */}
      <ScribblePad
        isOpen={showScribblePad}
        onClose={() => setShowScribblePad(false)}
        onInsert={handleScribbleInsert}
      />
    </section>
  );
};

export default InteractivePortfolioSection;
