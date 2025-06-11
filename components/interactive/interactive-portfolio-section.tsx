'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DraggableItem } from './draggable-notebook';
import ScribbleWorkspace, { EnhancedScribbleDragItem } from './scribble-workspace';
import { SketchHeading } from '../ui/sketch-elements';

// Type alias for compatibility
type ScribbleDragItem = EnhancedScribbleDragItem;

// Type definitions (keeping them simple for the backup)
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
  });

  const [achievements] = useState<Achievement[]>([
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
    }
  ]);
  const [showAchievements, setShowAchievements] = useState(false);
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
            UX Designer from Tamil Nadu who thinks differently about design and code
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
  // Action functions with full implementations
  const addProjectCard = useCallback(() => {
    const projects = [
      {
        id: 'ai-design-system',
        title: 'AI-Powered Design System',
        description: 'A design system that adapts and evolves using machine learning',
        tags: ['AI', 'Design Systems', 'Automation']
      },
      {
        id: 'scribble-wireframe',
        title: 'Scribble-to-Wireframe Tool',
        description: 'Converting hand-drawn sketches to digital wireframes using AI',
        tags: ['Computer Vision', 'UX Tools', 'Prototyping']
      },      {
        id: 'empathy-analytics',
        title: 'Empathy-Driven Analytics',
        description: 'User analytics that prioritize human emotion and context',
        tags: ['Analytics', 'Emotion AI', 'Ethics']
      },
      {
        id: 'voice-ui-dashboard',
        title: 'Voice UI Dashboard',
        description: 'Designing conversational interfaces for smart home control',
        tags: ['Voice UI', 'Smart Home', 'Accessibility']
      },
      {
        id: 'ar-portfolio-3d',
        title: 'AR Portfolio Showcase',
        description: 'Interactive 3D portfolio experience in augmented reality',
        tags: ['AR', 'WebXR', '3D Design']
      },
      {
        id: 'sustainable-ux',
        title: 'Sustainable UX Framework',
        description: 'Creating environmentally conscious design principles',
        tags: ['Sustainability', 'Green UX', 'Climate']
      },
      {
        id: 'micro-interactions',
        title: 'Micro-interaction Library',
        description: 'Delightful animations that enhance user experience',
        tags: ['Animation', 'Framer Motion', 'UX']
      }
    ];

    // Generate fresh randomness on each click
    const randomProject = projects[Math.floor(Math.random() * projects.length)];
    const randomColors = ['bg-blue-100 text-blue-800', 'bg-green-100 text-green-800', 'bg-purple-100 text-purple-800', 'bg-pink-100 text-pink-800', 'bg-yellow-100 text-yellow-800'];
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
      '💡 "Design is not just what it looks like - design is how it works" - Steve Jobs',
      '🎨 Currently learning: Advanced Framer Motion animations',
      '☕ Fun fact: I do my best thinking with a cup of Tamil chai',
      '🏔️ Recent adventure: Trekking in the Western Ghats',
      '🤖 Experimenting with: AI-generated design patterns',
      '📝 Reading: "The Design of Everyday Things" (again!)',
      '🎯 2024 Goal: Master AI-powered design workflows',
      '🌟 Favorite design tool: Still prefer pen and paper for ideation',
      '🚀 Dream project: Design interface for space exploration',
      '📱 Current obsession: Micro-interactions and delightful UX',
      '🎵 Design inspiration: Listening to Lo-fi while coding',
      '🌱 Growing: My own herb garden for fresh creativity',
      '🎮 Side project: Designing UI for indie game developers',
      '🔍 Research focus: User behavior in AR environments',
      '🎭 Weekend hobby: Sketching character designs',
      '🌈 Color theory: Exploring emotional impact of gradients',
      '📚 Next read: "Atomic Design" by Brad Frost',
      '🧠 Mental model: Design systems as living organisms'
    ];

    // Generate fresh randomness on each click
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
      { name: 'User Research', color: 'bg-pink-100 text-pink-800', icon: '🔍' },
      { name: 'Prototyping', color: 'bg-blue-100 text-blue-800', icon: '⚡' },
      { name: 'AI Integration', color: 'bg-purple-100 text-purple-800', icon: '🤖' },
      { name: 'Data Visualization', color: 'bg-green-100 text-green-800', icon: '📊' },
      { name: 'Design Systems', color: 'bg-yellow-100 text-yellow-800', icon: '🎯' },
      { name: 'Front-end Dev', color: 'bg-indigo-100 text-indigo-800', icon: '💻' },
      { name: 'Accessibility', color: 'bg-red-100 text-red-800', icon: '♿' },
      { name: 'Motion Design', color: 'bg-orange-100 text-orange-800', icon: '🎬' },
      { name: 'Typography', color: 'bg-gray-100 text-gray-800', icon: '✍️' },
      { name: 'Color Theory', color: 'bg-rose-100 text-rose-800', icon: '🌈' },
      { name: 'Voice UI Design', color: 'bg-cyan-100 text-cyan-800', icon: '🎤' },
      { name: 'AR/VR Design', color: 'bg-violet-100 text-violet-800', icon: '🥽' }
    ];

    // Generate fresh randomness on each click
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
          <SketchHeading level={3} className="text-lg mb-3">🎓 Interactive Resume</SketchHeading>
          <div className="space-y-3">
            <motion.div 
              className="bg-blue-50 p-2 rounded handwritten text-sm"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <strong>Education:</strong> B.Tech Computer Science
            </motion.div>
            <motion.div 
              className="bg-green-50 p-2 rounded handwritten text-sm"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <strong>Experience:</strong> 3+ years in UX Design
            </motion.div>
            <motion.div 
              className="bg-purple-50 p-2 rounded handwritten text-sm"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <strong>Specialization:</strong> AI-powered design workflows
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
        text: "Arun's AI-integrated designs revolutionized our user experience!",
        author: "Sarah Chen, Product Manager at TechCorp",
        rating: "⭐⭐⭐⭐⭐"
      },
      {
        text: "His unique approach to combining traditional design with AI is remarkable.",
        author: "Mike Rodriguez, CEO at DesignFlow",
        rating: "⭐⭐⭐⭐⭐"
      },
      {
        text: "The portfolio interaction itself shows his innovative thinking.",
        author: "Dr. Priya Sharma, UX Research Lead",
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
      interactionsCount: prev.interactionsCount + 1
    }));
  };

  return (
    <section className={`fixed inset-0 w-full h-full overflow-hidden bg-white notebook-bg ${className}`} style={{ zIndex: 1 }}>
      {/* ScribeCanvas overlay for freehand drawing (background) */}
      <ScribeCanvas />      {/* Tools and Analytics - Positioned Top Right to align with KIRUK logo */}
      <div className="absolute top-8 right-8 z-20">
        {/* Combined Tools and Analytics */}
        <div className="flex flex-col gap-3">
          {/* Interactive Portfolio Tools */}
          <div className="bg-white/95 backdrop-blur-sm border-2 border-black rounded-lg p-3 sketch-border shadow-lg">            <div className="flex items-center justify-center gap-2">
              {/* Project Card Button */}
              <motion.button
                onClick={addProjectCard}
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-lg rounded-full transition-all duration-200 flex items-center justify-center shadow-sm hover:shadow-md"
                title="Add Project Card"
              >
                💼
              </motion.button>

              {/* Personal Note Button */}
              <motion.button
                onClick={addPersonalNote}
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-lg rounded-full transition-all duration-200 flex items-center justify-center shadow-sm hover:shadow-md"
                title="Add Personal Note"
              >
                📝
              </motion.button>

              {/* Skill Bubble Button */}
              <motion.button
                onClick={addSkillBubble}
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-lg rounded-full transition-all duration-200 flex items-center justify-center shadow-sm hover:shadow-md"
                title="Add Skill Bubble"
              >
                🎯
              </motion.button>

              {/* Vertical Separator */}
              <div className="w-px h-6 bg-gray-300 mx-1"></div>

              {/* Resume Button */}
              <motion.button
                onClick={addInteractiveResume}
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-lg rounded-full transition-all duration-200 flex items-center justify-center shadow-sm hover:shadow-md"
                title="Add Resume"
              >
                🎓
              </motion.button>

              {/* Testimonial Button */}
              <motion.button
                onClick={addTestimonial}
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-lg rounded-full transition-all duration-200 flex items-center justify-center shadow-sm hover:shadow-md"
                title="Add Testimonial"
              >
                💬
              </motion.button>

              {/* Vertical Separator */}
              <div className="w-px h-6 bg-gray-300 mx-1"></div>

              {/* Scribble Element Button */}
              <motion.button
                onClick={addScribbleElement}
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-lg rounded-full transition-all duration-200 flex items-center justify-center shadow-sm hover:shadow-md"
                title="Add Scribble"
              >
                ✏️
              </motion.button>

              {/* Vertical Separator */}
              <div className="w-px h-6 bg-gray-300 mx-1"></div>

              {/* Achievements Button */}
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

              {/* Reset Button */}
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

          {/* Simple Live Analytics */}
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
      </div>      {/* Full-screen Interactive workspace */}
      <div className="absolute inset-0 top-0" style={{ zIndex: 0 }}>
        <div className="absolute inset-0">
          {/* Scribble layer (background) */}
          <div className="absolute inset-0" style={{ zIndex: 1 }}>
            <ScribbleWorkspace
              initialItems={scribbleItems}
              onItemsChange={setScribbleItems}
              showAddButton={false}
              className="w-full h-full"
            />
          </div>          {/* Notebook layer (foreground) - Simple direct rendering */}
          <div className="absolute inset-0" style={{ zIndex: 2 }}>
            {notebookItems.map((item) => (
              <motion.div
                key={item.id}
                className="absolute cursor-move"                style={{
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
              >                {item.type === 'sticky-note' ? (
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
      </div>

      {/* Instructions footer */}
      <div className="fixed bottom-16 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm border border-gray-300 rounded-lg px-4 py-2 z-30">
        <div className="text-center text-sm text-gray-700 handwritten">
          💡 <strong>Pro tip:</strong> Drag elements around and use the tools above to create your interactive portfolio!
        </div>
      </div>

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
