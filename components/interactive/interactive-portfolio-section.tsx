'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DraggableItem } from './draggable-notebook';
import ScribbleWorkspace, { EnhancedScribbleDragItem } from './scribble-workspace';
import { SketchHeading } from '../ui/sketch-elements';

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

export const InteractivePortfolioSection: React.FC<{
  className?: string;
  sectionTitle?: string;
}> = ({ 
  className = '', 
  sectionTitle = 'Advanced Interactive Portfolio'
}) => {
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
  }, []);  // Achievement checking effect
  useEffect(() => {
    setAchievements(prevAchievements => {
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
    });
  }, [interactiveStats]);

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
          <div className="font-bold mb-1">👋 Welcome!</div>
          <div>Drag me around to explore this interactive portfolio section</div>
        </div>
      ),
      position: { x: 100, y: 150 },
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
            Perfectionist and versatile generalist excelling in end-to-end development and design, dedicated to crafting exceptional user experiences and visually striking designs. 
            <br /><br />
            📍 Bangalore | 📧 arunkumaar.srinivasan@gmail.com 
          </div>
        </div>
      ),
      position: { x: 350, y: 100 },
      rotation: 2,
      scale: 1
    }
  ]);

  const [scribbleItems, setScribbleItems] = useState<ScribbleDragItem[]>([
    {
      id: 'coffee-1',
      type: 'coffee-stain',
      position: { x: 150, y: 200 },
      size: 45
    },
    {
      id: 'tape-1',
      type: 'tape-piece',
      position: { x: 300, y: 50 },
      rotation: 25
    }
  ]);

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
        x: Math.random() * 400 + 50, 
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
        x: Math.random() * 350 + 50, 
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
        x: Math.random() * 400 + 100, 
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
        x: Math.random() * 350 + 50, 
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
        x: Math.random() * 300 + 100, 
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
    const scribbleTypes = ['coffee-stain', 'tape-piece', 'pencil-mark'];
    const randomType = scribbleTypes[Math.floor(Math.random() * scribbleTypes.length)];
    
    const newScribbleItem: ScribbleDragItem = {
      id: `scribble-${Date.now()}`,
      type: randomType as any,
      position: { 
        x: Math.random() * (window.innerWidth - 100) + 50, 
        y: Math.random() * (window.innerHeight - 200) + 100 
      },
      ...(randomType === 'coffee-stain' && { size: Math.random() * 30 + 20 }),
      ...(randomType === 'tape-piece' && { rotation: Math.random() * 60 - 30 })
    };

    setScribbleItems(prev => [...prev, newScribbleItem]);
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
  const [introPosition, setIntroPosition] = useState({ x: 50, y: 50 });
  const [isDraggingIntro, setIsDraggingIntro] = useState(false);

  // Handle intro dragging
  const handleIntroMouseDown = (e: React.MouseEvent) => {
    setIsDraggingIntro(true);
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    const handleMouseMove = (e: MouseEvent) => {
      setIntroPosition({
        x: e.clientX - offsetX,
        y: e.clientY - offsetY
      });
    };

    const handleMouseUp = () => {
      setIsDraggingIntro(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <section className={`fixed inset-0 w-full h-full overflow-hidden bg-white notebook-bg ${className}`} style={{ zIndex: 1 }}>
      <ScribeCanvas />
      
      {/* Movable Personal Intro */}
      {showIntro && (
        <motion.div
          className="absolute z-30 cursor-move"
          style={{
            left: introPosition.x,
            top: introPosition.y,
            zIndex: isDraggingIntro ? 1000 : 30
          }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          onMouseDown={handleIntroMouseDown}
          whileHover={{ scale: 1.02 }}
        >
          <div className="bg-gradient-to-r from-blue-50 to-indigo-100 border-4 border-dashed border-blue-300 rounded-2xl p-4 shadow-xl relative max-w-md select-none">
            {/* Drag handle */}
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-8 h-4 bg-blue-300 rounded-b-lg flex items-center justify-center cursor-grab active:cursor-grabbing">
              <div className="w-4 h-1 bg-blue-500 rounded-full"></div>
            </div>
            
            {/* Close button */}
            <button
              onClick={() => setShowIntro(false)}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold transition-colors duration-200 shadow-lg"
              title="Close intro"
            >
              ×
            </button>

            <div className="flex items-center gap-3 mb-3">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
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
              whileHover={{ scale: 1.05 }}
            >
              <div className="handwritten text-xs text-gray-600 bg-white/90 px-3 py-2 rounded-full border border-dashed border-gray-300">
                ✨ Interactive portfolio ahead! ✨
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
      
      {/* Tools and Analytics */}
      <div className="absolute top-8 right-8 z-20">
        <div className="flex flex-col gap-3">
          <div className="bg-white/95 backdrop-blur-sm border-2 border-black rounded-lg p-3 sketch-border shadow-lg">
            <div className="flex items-center justify-center gap-2">
              <motion.button
                onClick={addProjectCard}
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-lg rounded-full transition-all duration-200 flex items-center justify-center shadow-sm hover:shadow-md"
                title="Add Project Card"
              >
                💼
              </motion.button>
              <motion.button
                onClick={addPersonalNote}
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-lg rounded-full transition-all duration-200 flex items-center justify-center shadow-sm hover:shadow-md"
                title="Add Personal Note"
              >
                📝
              </motion.button>
              <motion.button
                onClick={addSkillBubble}
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-lg rounded-full transition-all duration-200 flex items-center justify-center shadow-sm hover:shadow-md"
                title="Add Skill Bubble"
              >
                🎯
              </motion.button>
              <div className="w-px h-6 bg-gray-300 mx-1"></div>
              <motion.button
                onClick={addInteractiveResume}
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-lg rounded-full transition-all duration-200 flex items-center justify-center shadow-sm hover:shadow-md"
                title="Add Resume"
              >
                🎓
              </motion.button>
              <motion.button
                onClick={addTestimonial}
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-lg rounded-full transition-all duration-200 flex items-center justify-center shadow-sm hover:shadow-md"
                title="Add Testimonial"
              >
                💬
              </motion.button>
              <div className="w-px h-6 bg-gray-300 mx-1"></div>
              <motion.button
                onClick={addScribbleElement}
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-lg rounded-full transition-all duration-200 flex items-center justify-center shadow-sm hover:shadow-md"
                title="Add Scribble"
              >
                ✏️
              </motion.button>
              <div className="w-px h-6 bg-gray-300 mx-1"></div>
              <motion.button
                onClick={() => setShowAchievements(!showAchievements)}
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-lg rounded-full transition-all duration-200 flex items-center justify-center shadow-sm hover:shadow-md relative"
                title="Achievements"
              >
                🏆
                {achievements.filter(a => a.unlocked).length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {achievements.filter(a => a.unlocked).length}
                  </span>
                )}
              </motion.button>
              <motion.button
                onClick={clearWorkspace}
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-lg rounded-full transition-all duration-200 flex items-center justify-center shadow-sm hover:shadow-md"
                title="Reset Workspace"
              >
                🗑️
              </motion.button>
            </div>
          </div>

          <div className="bg-white/95 backdrop-blur-sm border-2 border-black rounded-lg p-3 sketch-border shadow-lg">
            <div className="text-center mb-1">
              <h3 className="text-xs font-semibold text-gray-700 handwritten">📈 Live Analytics</h3>
            </div>
            <div className="flex items-center justify-center gap-4 text-xs handwritten">
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
                className="absolute cursor-move"
                style={{
                  left: item.position.x,
                  top: item.position.y,
                  transform: `rotate(${item.rotation ?? 0}deg) scale(${item.scale ?? 1})`,
                  zIndex: 100
                }}
                drag
                dragMomentum={false}
                onDragEnd={(event, info) => {
                  const newItems = notebookItems.map(i => 
                    i.id === item.id 
                      ? { ...i, position: { x: item.position.x + info.offset.x, y: item.position.y + info.offset.y } }
                      : i
                  );
                  setNotebookItems(newItems);
                }}
                whileHover={{ scale: (item.scale ?? 1) * 1.02 }}
                whileDrag={{ scale: (item.scale ?? 1) * 1.05, zIndex: 1000 }}
              >
                {item.type === 'sticky-note' ? (
                  <div className={`p-3 rounded-lg shadow-lg border-2 border-gray-300 min-w-[150px] min-h-[100px] ${
                    getStickyNoteColorClass(item.color)
                  }`}>
                    {item.content}
                  </div>
                ) : (
                  <div className="p-4 bg-white rounded-lg shadow-lg border-2 border-black min-w-[200px] min-h-[150px] sketch-border">
                    {item.content}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>      {/* Instructions footer */}
      <div className="fixed bottom-16 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm border border-gray-300 rounded-lg px-4 py-2 z-30">
        <div className="text-center text-sm text-gray-700 handwritten">
          💡 <strong>Pro tip:</strong> Drag elements around and use the tools above to create your interactive portfolio!
        </div>
      </div>      {/* Achievement Notifications */}
      <AnimatePresence>
        {newlyUnlockedAchievements.map((achievementId, index) => {
          const achievement = achievements.find(a => a.id === achievementId);
          if (!achievement) return null;
          
          return (
            <motion.div
              key={`${achievementId}-${index}`}
              initial={{ opacity: 0, y: 50, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -50, scale: 0.8 }}
              className="fixed bottom-32 right-8 bg-green-500 text-white rounded-lg p-4 shadow-lg z-40"
              style={{ marginBottom: `${index * 80}px` }}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{achievement.icon}</span>
                <div>
                  <div className="font-bold">Achievement Unlocked!</div>
                  <div className="text-sm">{achievement.title}</div>
                  <div className="text-xs opacity-90">{achievement.description}</div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Achievements Panel */}
      <AnimatePresence>
        {showAchievements && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowAchievements(false)}
          >
            <motion.div
              className="bg-white border-2 border-black rounded-lg p-6 max-w-md w-full mx-4 sketch-border"
              onClick={(e) => e.stopPropagation()}
            >
              <SketchHeading level={2} className="text-xl mb-4 text-center">
                🏆 Achievements
              </SketchHeading>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {achievements.map((achievement) => (
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
                ))}
              </div>
              <button
                onClick={() => setShowAchievements(false)}
                className="w-full mt-4 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default InteractivePortfolioSection;
