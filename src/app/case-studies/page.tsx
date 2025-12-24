'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { GRID_SIZE } from '@/lib/utils';

// Message types for chatbot
type ChatMessage = {
  id: string;
  type: 'bot' | 'user' | 'system';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
  choices?: Array<{
    text: string;
    action: () => void;
    icon?: string;
    points?: number;
  }>;
  project?: {
    type: 'behance' | 'playbook' | 'prototype';
    title: string;
    description: string;
    url?: string;
    embedUrl?: string;
  };
};

// Gamification types
type Achievement = {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: Date;
};

type GameStats = {
  points: number;
  projectsExplored: number;
  messagesExchanged: number;
  achievements: Achievement[];
  level: number;
};

// Story chapters for the RPG
type StoryChapter = {
  id: string;
  title: string;
  dialogue: string[];
  choices?: Array<{
    text: string;
    action: () => void;
    icon?: string;
    points?: number;
  }>;
  project?: {
    type: 'behance' | 'playbook' | 'prototype';
    title: string;
    description: string;
    url?: string;
    embedUrl?: string;
  };
};

export default function CaseStudies() {
  const { trackPageView, trackInteraction } = useAnalytics();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showPrototype, setShowPrototype] = useState(false);
  const [currentChapter, setCurrentChapter] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);
  
  // Gamification state
  const [gameStats, setGameStats] = useState<GameStats>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('caseStudiesGameStats');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return {
      points: 0,
      projectsExplored: 0,
      messagesExchanged: 0,
      achievements: [
        { id: 'first_message', title: 'First Contact', description: 'Sent your first message', icon: '👋', unlocked: false },
        { id: 'behance_explorer', title: 'Behance Explorer', description: 'Explored Behance portfolio', icon: '🎨', unlocked: false },
        { id: 'playbook_reader', title: 'Playbook Reader', description: 'Checked out Playbook', icon: '📓', unlocked: false },
        { id: 'prototype_tester', title: 'Prototype Tester', description: 'Opened Square Bridge prototype', icon: '🧩', unlocked: false },
        { id: 'conversation_master', title: 'Conversation Master', description: 'Exchanged 10+ messages', icon: '💬', unlocked: false },
        { id: 'all_projects', title: 'Complete Explorer', description: 'Explored all projects', icon: '🏆', unlocked: false },
      ],
      level: 1,
    };
  });
  const [showPointsAnimation, setShowPointsAnimation] = useState(false);
  const [pointsToShow, setPointsToShow] = useState(0);
  const [showAchievement, setShowAchievement] = useState<Achievement | null>(null);
  const [focusedChoiceIndex, setFocusedChoiceIndex] = useState<number | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);

  const prototypeUrl = 'https://www.figma.com/design/VtitVweV3Pus9chSeKA0VX/Finalized-Screen---Square-Bridge?node-id=23022-56006';
  const prototypeEmbed = `https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(prototypeUrl)}`;

  const storyChapters: StoryChapter[] = [
    {
      id: 'intro',
      title: 'The Journey Begins',
      dialogue: [
        "Welcome, traveler! 👋",
        "I'm Arun, and this is my design journey.",
        "Throughout my career, I've built products that solve real problems.",
        "Each project tells a story—of research, iteration, and impact.",
        "Let me show you what I've created..."
      ],
      choices: [
        {
          text: 'Explore Behance Portfolio',
          action: () => {
            trackInteraction('case_study_behance_clicked', {});
            window.open('https://www.behance.net/arunkusriniva', '_blank');
          },
          icon: '🎨',
          points: 25
        },
        {
          text: 'View Playbook',
          action: () => {
            trackInteraction('case_study_playbook_clicked', {});
            window.open('https://playbook.com/arunkumaar', '_blank');
          },
          icon: '📓',
          points: 25
        },
        {
          text: 'See Square Bridge Prototype',
          action: () => {
            setShowPrototype(true);
            trackInteraction('case_study_prototype_opened', { project: 'square-bridge' });
          },
          icon: '🧩',
          points: 25
        }
      ]
    },
    {
      id: 'behance',
      title: 'Behance Portfolio',
      dialogue: [
        "My Behance portfolio showcases detailed case studies.",
        "Each project includes the full design process:",
        "• Research and discovery",
        "• Ideation and sketching",
        "• Wireframing and prototyping",
        "• Final designs and iterations",
        "These are deep dives into how I think and work."
      ],
      project: {
        type: 'behance',
        title: 'Behance Portfolio',
        description: 'Detailed case studies with full design process documentation',
        url: 'https://www.behance.net/arunkusriniva'
      }
    },
    {
      id: 'playbook',
      title: 'Playbook Snapshots',
      dialogue: [
        "My Playbook contains quick snapshots of projects.",
        "These are condensed versions that highlight:",
        "• Key insights and decisions",
        "• Design principles applied",
        "• Impact and outcomes",
        "Perfect for a quick overview of my work."
      ],
      project: {
        type: 'playbook',
        title: 'Playbook',
        description: 'Quick snapshots and insights from my design projects',
        url: 'https://playbook.com/arunkumaar'
      }
    },
    {
      id: 'prototype',
      title: 'Square Bridge Prototype',
      dialogue: [
        "Square Bridge is a student portfolio and placement platform.",
        "This interactive prototype shows:",
        "• Student onboarding flows",
        "• Portfolio creation tools",
        "• Placement officer coordination",
        "• HR shortlisting dashboards",
        "Click to explore the live Figma prototype!"
      ],
      project: {
        type: 'prototype',
        title: 'Square Bridge Prototype',
        description: 'Interactive Figma prototype showcasing student portfolio builder and placement workflows',
        url: prototypeUrl,
        embedUrl: prototypeEmbed
      }
    }
  ];

  useEffect(() => {
    trackPageView('/case-studies');
  }, [trackPageView]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Typing animation utility
  const typeMessage = useCallback((text: string, onComplete?: () => void) => {
    setIsTyping(true);
    let currentIndex = 0;
    const displayedText = '';
    
    const typeInterval = setInterval(() => {
      if (currentIndex < text.length) {
        setMessages(prev => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];
          if (lastMessage && lastMessage.isTyping) {
            lastMessage.content = text.substring(0, currentIndex + 1);
            return [...newMessages];
          }
          return prev;
        });
        currentIndex++;
      } else {
        clearInterval(typeInterval);
        setIsTyping(false);
        setMessages(prev => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];
          if (lastMessage) {
            lastMessage.isTyping = false;
          }
          return [...newMessages];
        });
        onComplete?.();
      }
    }, 30); // Typing speed

    return () => clearInterval(typeInterval);
  }, []);

  // Save game stats to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('caseStudiesGameStats', JSON.stringify(gameStats));
    }
  }, [gameStats]);

  // Add points with animation
  const addPoints = useCallback((points: number, reason?: string) => {
    setGameStats(prev => {
      const newPoints = prev.points + points;
      const newLevel = Math.floor(newPoints / 100) + 1;
      return {
        ...prev,
        points: newPoints,
        level: newLevel,
      };
    });
    setPointsToShow(points);
    setShowPointsAnimation(true);
    setTimeout(() => setShowPointsAnimation(false), 2000);
  }, []);

  // Unlock achievement
  const unlockAchievement = useCallback((achievementId: string) => {
    setGameStats(prev => {
      const achievement = prev.achievements.find(a => a.id === achievementId);
      if (achievement && !achievement.unlocked) {
        const updated = prev.achievements.map(a => 
          a.id === achievementId 
            ? { ...a, unlocked: true, unlockedAt: new Date() }
            : a
        );
        setShowAchievement(achievement);
        setTimeout(() => setShowAchievement(null), 3000);
        addPoints(50); // Bonus points for achievement
        return { ...prev, achievements: updated };
      }
      return prev;
    });
  }, [addPoints]);

  // Add message to chat
  const addMessage = useCallback((message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: `msg-${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
    };
    setMessages(prev => {
      const updated = [...prev, newMessage];
      // Track messages for achievement
      if (updated.length === 1) {
        unlockAchievement('first_message');
      }
      if (updated.length >= 10) {
        unlockAchievement('conversation_master');
      }
      return updated;
    });
    setGameStats(prev => ({ ...prev, messagesExchanged: prev.messagesExchanged + 1 }));
    return newMessage;
  }, [unlockAchievement]);

  // Initialize chat with welcome message
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    
    const welcomeMessage = addMessage({
      type: 'bot',
      content: '',
      isTyping: true,
    });
    
    // Start typing animation
    setTimeout(() => {
      typeMessage("Welcome, traveler! 👋\n\nI'm Arun, and this is my design journey.\n\nThroughout my career, I've built products that solve real problems.\n\nEach project tells a story—of research, iteration, and impact.\n\nLet me show you what I've created...", () => {
        // After welcome message, show choices
        setTimeout(() => {
          addMessage({
            type: 'bot',
            content: 'What would you like to explore?',
            choices: storyChapters[0].choices,
          });
        }, 500);
      });
    }, 500);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  const handleChoice = (choice: NonNullable<StoryChapter['choices']>[0], messageId?: string) => {
    // Add user message
    addMessage({
      type: 'user',
      content: choice.text,
    });

    // Award points
    const points = choice.points || 10;
    addPoints(points, `Explored: ${choice.text}`);

    // Execute choice action
    choice.action();

    // Find the chapter based on choice and unlock achievements
    let nextChapter = currentChapter;
    if (choice.text.includes('Behance')) {
      nextChapter = 1;
      unlockAchievement('behance_explorer');
    } else if (choice.text.includes('Playbook')) {
      nextChapter = 2;
      unlockAchievement('playbook_reader');
    } else if (choice.text.includes('Square Bridge')) {
      nextChapter = 3;
      unlockAchievement('prototype_tester');
    }

    // Check if all projects explored
    setGameStats(prev => {
      const newExplored = prev.projectsExplored + 1;
      if (newExplored >= 3) {
        unlockAchievement('all_projects');
      }
      return { ...prev, projectsExplored: newExplored };
    });

    if (nextChapter < storyChapters.length) {
      setCurrentChapter(nextChapter);
      const chapter = storyChapters[nextChapter];
      
      // Add bot response with typing animation
      const botMessage = addMessage({
        type: 'bot',
        content: '',
        isTyping: true,
        project: chapter.project,
      });

      // Type out the dialogue
      const fullDialogue = chapter.dialogue.join('\n\n');
      setTimeout(() => {
        typeMessage(fullDialogue, () => {
          // Show project info if available
          if (chapter?.project) {
            setTimeout(() => {
              addMessage({
                type: 'bot',
                content: `Here's more about ${chapter.project!.title}:\n\n${chapter.project!.description}`,
                project: chapter.project!,
              });
            }, 500);
          }
        });
      }, 500);
    }
  };

  const handleUserMessage = (text: string) => {
    if (!text.trim()) return;

    // Add user message
    addMessage({
      type: 'user',
      content: text,
    });

    // Award points for sending a message
    addPoints(5, 'Message sent');

    // Simple response logic
    const lowerText = text.toLowerCase();
    if (lowerText.includes('behance') || lowerText.includes('portfolio')) {
      handleChoice({
        text: 'Explore Behance Portfolio',
        action: () => {
          trackInteraction('case_study_behance_clicked', {});
          window.open('https://www.behance.net/arunkusriniva', '_blank');
        },
        icon: '🎨',
        points: 25
      });
    } else if (lowerText.includes('playbook')) {
      handleChoice({
        text: 'View Playbook',
        action: () => {
          trackInteraction('case_study_playbook_clicked', {});
          window.open('https://playbook.com/arunkumaar', '_blank');
        },
        icon: '📓',
        points: 25
      });
    } else if (lowerText.includes('prototype') || lowerText.includes('square bridge')) {
      handleChoice({
        text: 'See Square Bridge Prototype',
        action: () => {
          setShowPrototype(true);
          trackInteraction('case_study_prototype_opened', { project: 'square-bridge' });
        },
        icon: '🧩',
        points: 25
      });
    } else if (lowerText.includes('hello') || lowerText.includes('hi') || lowerText.includes('hey')) {
      const botMessage = addMessage({
        type: 'bot',
        content: '',
        isTyping: true,
      });
      setTimeout(() => {
        typeMessage("Hello! 👋 I'm here to guide you through my design journey. You can ask me about:\n\n• My Behance portfolio\n• My Playbook snapshots\n• The Square Bridge prototype\n\nWhat interests you?", () => {});
      }, 500);
    } else if (lowerText.includes('help') || lowerText.includes('hint')) {
      const botMessage = addMessage({
        type: 'bot',
        content: '',
        isTyping: true,
      });
      setTimeout(() => {
        typeMessage("Here are some things you can do:\n\n🎯 **Explore Projects:**\n• Type 'behance' or 'portfolio' to see my detailed case studies\n• Type 'playbook' for quick project snapshots\n• Type 'prototype' or 'square bridge' to see an interactive demo\n\n💡 **Tips:**\n• Click the buttons for quick actions\n• Earn points by exploring different projects\n• Unlock achievements as you go!\n\nWhat would you like to explore?", () => {});
      }, 500);
    } else {
      const botMessage = addMessage({
        type: 'bot',
        content: '',
        isTyping: true,
      });
      setTimeout(() => {
        typeMessage("I'm not sure I understand. Try asking about:\n\n• Behance portfolio\n• Playbook\n• Square Bridge prototype\n\nOr type 'help' for more options! 💡", () => {});
      }, 500);
    }
  };

  const handleClosePrototype = () => {
    setShowPrototype(false);
  };

  return (
    <main 
      className="min-h-screen relative overflow-hidden"
      style={{
        backgroundColor: 'var(--bg-main)',
        imageRendering: 'pixelated' as any,
      }}
    >
      {/* Grid Background - No dots, just grid lines */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(var(--border-color) 1px, transparent 1px),
            linear-gradient(90deg, var(--border-color) 1px, transparent 1px)
          `,
          backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
          opacity: 0.3,
          imageRendering: 'pixelated' as any,
        }}
      />
      
      {/* Scanlines effect for retro pixel feel */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-5"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)",
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-4 lg:px-8 pt-28 pb-32">
        {/* Chatbot UI */}
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Chat Header with Gamification */}
          <motion.div
            className="wireframe-border p-4 mb-4"
            style={{
              backgroundColor: 'var(--bg-card)',
              imageRendering: 'pixelated' as any,
            }}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4">
                <div className="wireframe-border w-12 h-12 flex items-center justify-center text-2xl" style={{
                  backgroundColor: 'var(--accent-color)',
                  imageRendering: 'pixelated' as any,
                }}>
                  👨‍💻
                </div>
                <div>
                  <h1 className="font-mono text-xl font-bold uppercase tracking-wider" style={{ color: 'var(--accent-color)' }}>
                    Design Journey Chat
                  </h1>
                  <p className="font-mono text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                    Ask me about my projects
                  </p>
                </div>
              </div>
              
              {/* Game Stats */}
              <div className="flex items-center gap-4 flex-wrap">
                <div className="wireframe-border px-3 py-2" style={{
                  backgroundColor: 'var(--bg-main)',
                  imageRendering: 'pixelated' as any,
                }}>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">⭐</span>
                    <span className="font-mono text-sm font-bold" style={{ color: 'var(--accent-color)' }}>
                      {gameStats.points}
                    </span>
                  </div>
                </div>
                <div className="wireframe-border px-3 py-2" style={{
                  backgroundColor: 'var(--bg-main)',
                  imageRendering: 'pixelated' as any,
                }}>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">📊</span>
                    <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
                      Lv.{gameStats.level}
                    </span>
                  </div>
                </div>
                <div className="wireframe-border px-3 py-2" style={{
                  backgroundColor: 'var(--bg-main)',
                  imageRendering: 'pixelated' as any,
                }}>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🏆</span>
                    <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
                      {gameStats.achievements.filter(a => a.unlocked).length}/{gameStats.achievements.length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-4">
              <div className="wireframe-border p-1" style={{
                backgroundColor: 'var(--bg-main)',
                imageRendering: 'pixelated' as any,
              }}>
                <div 
                  className="h-2 transition-all duration-500"
                  style={{
                    width: `${(gameStats.points % 100)}%`,
                    backgroundColor: 'var(--accent-color)',
                    imageRendering: 'pixelated' as any,
                  }}
                />
              </div>
              <p className="font-mono text-xs mt-1 text-center" style={{ color: 'var(--text-muted)' }}>
                {100 - (gameStats.points % 100)} points to next level
              </p>
            </div>
          </motion.div>
          
          {/* Points Animation */}
          <AnimatePresence>
            {showPointsAnimation && (
              <motion.div
                className="fixed top-20 right-8 z-50 pointer-events-none"
                initial={{ opacity: 0, y: -20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -40, scale: 0.8 }}
                transition={{ duration: 0.5 }}
              >
                <div className="wireframe-border px-4 py-2" style={{
                  backgroundColor: 'var(--accent-color)',
                  color: 'var(--bg-main)',
                  imageRendering: 'pixelated' as any,
                }}>
                  <p className="font-mono text-lg font-bold">
                    +{pointsToShow} ⭐
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Achievement Unlocked */}
          <AnimatePresence>
            {showAchievement && (
              <motion.div
                className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              >
                <div className="wireframe-border p-6 text-center" style={{
                  backgroundColor: 'var(--bg-card)',
                  imageRendering: 'pixelated' as any,
                  minWidth: '300px',
                }}>
                  <div className="text-6xl mb-4">{showAchievement.icon}</div>
                  <h3 className="font-mono text-xl font-bold uppercase mb-2" style={{ color: 'var(--accent-color)' }}>
                    Achievement Unlocked!
                  </h3>
                  <p className="font-mono text-sm font-bold mb-1">{showAchievement.title}</p>
                  <p className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
                    {showAchievement.description}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Chat Messages Container */}
          <motion.div
            ref={chatContainerRef}
            className="wireframe-border p-4 mb-4"
            style={{
              backgroundColor: 'var(--bg-card)',
              imageRendering: 'pixelated' as any,
              minHeight: '400px',
              maxHeight: '600px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {messages.map((message) => (
              <motion.div
                key={message.id}
                className={`flex w-full ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div
                  className={`wireframe-border p-2.5 max-w-[75%] ${
                    message.type === 'user' 
                      ? 'rounded-tl-lg rounded-bl-lg' 
                      : 'rounded-tr-lg rounded-br-lg'
                  }`}
                  style={{
                    backgroundColor: message.type === 'user' 
                      ? 'var(--accent-color)' 
                      : 'var(--bg-main)',
                    color: message.type === 'user' 
                      ? 'var(--bg-main)' 
                      : 'var(--text-main)',
                    imageRendering: 'pixelated' as any,
                  }}
                >
                  {message.type === 'bot' && (
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-sm">👨‍💻</span>
                      <span className="font-mono text-xs" style={{ opacity: 0.7 }}>
                        Arun
                      </span>
                    </div>
                  )}
                  <p 
                    className="font-mono text-sm leading-normal whitespace-pre-wrap"
                    style={{ lineHeight: '1.0' }}
                  >
                    {message.content}
                    {message.isTyping && (
                      <motion.span
                        animate={{ opacity: [1, 0, 1] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                      >
                        {' '}▊
                      </motion.span>
                    )}
                  </p>
                  
                    {/* Choices as buttons with keyboard navigation */}
                    {message.choices && !message.isTyping && (
                      <div className="mt-3 space-y-2" role="group" aria-label="Action choices">
                        {message.choices.map((choice, index) => (
                          <motion.button
                            key={index}
                            type="button"
                            onClick={() => {
                              handleChoice(choice, message.id);
                              setFocusedChoiceIndex(null);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'ArrowDown' && index < message.choices!.length - 1) {
                                e.preventDefault();
                                setFocusedChoiceIndex(index + 1);
                                (e.currentTarget.nextElementSibling as HTMLElement)?.focus();
                              } else if (e.key === 'ArrowUp' && index > 0) {
                                e.preventDefault();
                                setFocusedChoiceIndex(index - 1);
                                (e.currentTarget.previousElementSibling as HTMLElement)?.focus();
                              } else if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                handleChoice(choice, message.id);
                                setFocusedChoiceIndex(null);
                              }
                            }}
                            className={`wireframe-border p-2 w-full text-left flex items-center justify-between gap-2 focus:outline-none ${
                              focusedChoiceIndex === index ? 'ring-2' : ''
                            }`}
                            style={{
                              backgroundColor: focusedChoiceIndex === index 
                                ? 'var(--accent-color)' 
                                : 'var(--bg-card)',
                              color: focusedChoiceIndex === index 
                                ? 'var(--bg-main)' 
                                : 'var(--text-main)',
                              imageRendering: 'pixelated' as any,
                              outline: focusedChoiceIndex === index ? '2px solid var(--accent-color)' : 'none',
                            }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            tabIndex={0}
                            aria-label={`${choice.text}. Press Enter to select. ${choice.points ? `Awards ${choice.points} points.` : ''}`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{choice.icon}</span>
                              <span className="font-mono text-xs">{choice.text}</span>
                            </div>
                            {choice.points && (
                              <span className="font-mono text-xs" style={{ opacity: 0.7 }}>
                                +{choice.points}⭐
                              </span>
                            )}
                          </motion.button>
                        ))}
                      </div>
                    )}

                  {/* Project info */}
                  {message.project && !message.isTyping && (
                    <div className="mt-3 pt-3 border-t" style={{ borderColor: 'var(--border-color)' }}>
                      <h4 className="font-mono text-xs font-bold uppercase mb-2" style={{ opacity: 0.8 }}>
                        {message.project.title}
                      </h4>
                      <p className="font-mono text-xs mb-2" style={{ opacity: 0.7 }}>
                        {message.project.description}
                      </p>
                      {message.project.type === 'prototype' && (
                        <motion.button
                          type="button"
                          onClick={() => setShowPrototype(true)}
                          className="wireframe-border px-3 py-1 font-mono text-xs uppercase"
                          style={{
                            backgroundColor: 'var(--accent-color)',
                            color: 'var(--bg-main)',
                            imageRendering: 'pixelated' as any,
                          }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Open
                        </motion.button>
                      )}
                      {(message.project.type === 'behance' || message.project.type === 'playbook') && message.project.url && (
                        <motion.a
                          href={message.project.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block wireframe-border px-3 py-1 font-mono text-xs uppercase"
                          style={{
                            backgroundColor: 'var(--accent-color)',
                            color: 'var(--bg-main)',
                            textDecoration: 'none',
                            imageRendering: 'pixelated' as any,
                          }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Visit →
                        </motion.a>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
            <div ref={messagesEndRef} />
          </motion.div>

          {/* Chat Input */}
          <ChatInput onSend={handleUserMessage} disabled={isTyping} />


          {/* Help & Achievements Buttons */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <motion.button
              type="button"
              onClick={() => setShowHelp(!showHelp)}
              className="wireframe-border px-4 py-2 font-mono text-xs uppercase"
              style={{
                backgroundColor: showHelp ? 'var(--accent-color)' : 'var(--bg-card)',
                color: showHelp ? 'var(--bg-main)' : 'var(--text-main)',
                imageRendering: 'pixelated' as any,
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Toggle help"
            >
              {showHelp ? '✕ Close Help' : '❓ Help'}
            </motion.button>
            <motion.button
              type="button"
              onClick={() => setShowAchievements(!showAchievements)}
              className="wireframe-border px-4 py-2 font-mono text-xs uppercase"
              style={{
                backgroundColor: showAchievements ? 'var(--accent-color)' : 'var(--bg-card)',
                color: showAchievements ? 'var(--bg-main)' : 'var(--text-main)',
                imageRendering: 'pixelated' as any,
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="View achievements"
            >
              🏆 Achievements ({gameStats.achievements.filter(a => a.unlocked).length}/{gameStats.achievements.length})
            </motion.button>
            <Link
              href="/contact"
              className="font-mono text-sm inline-block wireframe-border px-4 py-2"
              style={{
                color: 'var(--text-main)',
                textDecoration: 'none',
                imageRendering: 'pixelated' as any,
              }}
            >
              ✉️ Let&apos;s collaborate
            </Link>
          </div>

          {/* Help Panel */}
          <AnimatePresence>
            {showHelp && (
              <motion.div
                className="wireframe-border p-4 mt-4"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  imageRendering: 'pixelated' as any,
                }}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="font-mono text-sm font-bold uppercase mb-3" style={{ color: 'var(--accent-color)' }}>
                  How to Play
                </h3>
                <div className="space-y-2 font-mono text-xs" style={{ color: 'var(--text-main)' }}>
                  <p>• <strong>Type messages</strong> or click buttons to explore projects</p>
                  <p>• <strong>Earn points</strong> by exploring different projects (25 points each)</p>
                  <p>• <strong>Unlock achievements</strong> by completing actions</p>
                  <p>• <strong>Level up</strong> every 100 points</p>
                  <p>• <strong>Keyboard shortcuts:</strong></p>
                  <ul className="ml-4 mt-1 space-y-1">
                    <li>- Press <kbd className="wireframe-border px-1">/</kbd> to focus input</li>
                    <li>- Use <kbd className="wireframe-border px-1">↑↓</kbd> arrows to navigate choices</li>
                    <li>- Press <kbd className="wireframe-border px-1">Enter</kbd> to select</li>
                  </ul>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Achievements Panel */}
          <AnimatePresence>
            {showAchievements && (
              <motion.div
                className="wireframe-border p-4 mt-4"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  imageRendering: 'pixelated' as any,
                }}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="font-mono text-sm font-bold uppercase mb-3" style={{ color: 'var(--accent-color)' }}>
                  Achievements
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {gameStats.achievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className={`wireframe-border p-3 flex items-center gap-3 ${
                        achievement.unlocked ? '' : 'opacity-50'
                      }`}
                      style={{
                        backgroundColor: achievement.unlocked ? 'var(--bg-main)' : 'var(--bg-card)',
                        imageRendering: 'pixelated' as any,
                      }}
                    >
                      <span className="text-2xl">{achievement.icon}</span>
                      <div className="flex-1">
                        <p className="font-mono text-xs font-bold">
                          {achievement.title}
                          {achievement.unlocked && <span className="ml-2">✓</span>}
                        </p>
                        <p className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
                          {achievement.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Prototype Modal */}
      <AnimatePresence>
        {showPrototype && (
          <motion.div
            className="fixed inset-0 z-[120] flex items-center justify-center bg-gray-900/70 backdrop-blur-sm px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClosePrototype}
          >
            <motion.div
              className="relative w-full max-w-4xl wireframe-border bg-white shadow-2xl"
              style={{
                imageRendering: 'pixelated' as any,
              }}
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 140, damping: 18 }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="px-8 pt-8 pb-6 space-y-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-mono text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                      Interactive case study
                    </p>
                    <h3 className="mt-2 font-mono text-3xl uppercase tracking-wider font-bold" style={{ color: 'var(--accent-color)' }}>
                      Square Bridge Prototype
                    </h3>
                  </div>
                  <motion.button
                    type="button"
                    onClick={handleClosePrototype}
                    className="wireframe-border px-3 py-1 font-mono text-xs uppercase"
                    style={{
                      backgroundColor: 'var(--bg-card)',
                      color: 'var(--text-main)',
                      imageRendering: 'pixelated' as any,
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.96 }}
                  >
                    Close
                  </motion.button>
                </div>
                <p className="font-mono text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  Navigate through student onboarding, portfolio link creation, placement officer coordination, and HR shortlisting views. Use the hotspots and motion cues inside Figma to explore how hiring stays effortless.
                </p>
              </div>
              <div className="relative w-full overflow-hidden" style={{ paddingTop: '56.25%' }}>
                <iframe
                  src={prototypeEmbed}
                  title="Square Bridge Prototype"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full border-t"
                  style={{ borderColor: 'var(--border-color)' }}
                />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 border-t px-8 py-4" style={{ borderColor: 'var(--border-color)' }}>
                <div className="font-mono text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  Tip: Press <span className="font-bold">F</span> in the Figma viewer for full screen
                </div>
                <a
                  href={prototypeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 wireframe-border px-4 py-2 font-mono text-xs uppercase"
                  style={{
                    backgroundColor: 'var(--accent-color)',
                    color: 'var(--bg-main)',
                    textDecoration: 'none',
                    imageRendering: 'pixelated' as any,
                  }}
                >
                  Launch in Figma ↗
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

// Chat Input Component with accessibility
function ChatInput({ onSend, disabled }: { onSend: (text: string) => void; disabled: boolean }) {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSend(input.trim());
      setInput('');
      inputRef.current?.focus();
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Focus input with '/' key
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="wireframe-border p-4"
      style={{
        backgroundColor: 'var(--bg-card)',
        imageRendering: 'pixelated' as any,
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={disabled ? "Arun is typing..." : "Type your message... (Press '/' to focus)"}
          disabled={disabled}
          className="flex-1 wireframe-border p-3 font-mono text-sm bg-transparent outline-none focus:ring-2"
          style={{
            color: 'var(--text-main)',
            imageRendering: 'pixelated' as any,
          }}
          aria-label="Chat input. Type your message and press Enter to send."
          aria-describedby="input-hint"
        />
        <div id="input-hint" className="sr-only">
          Press Enter to send your message. Use arrow keys to navigate choice buttons. Press slash to focus input.
        </div>
        <motion.button
          type="submit"
          disabled={!input.trim() || disabled}
          className="wireframe-border px-6 py-3 font-mono text-xs uppercase disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: input.trim() && !disabled ? 'var(--accent-color)' : 'var(--bg-main)',
            color: input.trim() && !disabled ? 'var(--bg-main)' : 'var(--text-muted)',
            imageRendering: 'pixelated' as any,
          }}
          whileHover={input.trim() && !disabled ? { scale: 1.05 } : {}}
          whileTap={input.trim() && !disabled ? { scale: 0.95 } : {}}
        >
          Send →
        </motion.button>
      </div>
    </motion.form>
  );
}
