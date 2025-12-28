'use client';

/**
 * Help Bot Component - Co-Officer Character
 * 
 * A pixelated character that stays on screen as a companion.
 * Shows up to cheer and celebrate achievements, acts as a co-officer.
 * Can be clicked to open chat for help.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { PixelIcon } from './PixelIcon';
import { cn, GRID_SIZE } from '@/lib/utils';
import { useGameMode } from '@/contexts/GameModeContext';
import { FAQ_DATA, getPageHelp, searchFAQ, type FAQItem } from '@/data/help-bot-data';
import { getGameById } from '@/data/game-navigation-data';

interface Message {
  id: string;
  type: 'bot' | 'user';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

interface SpeechBubble {
  id: string;
  message: string;
  duration?: number;
}

// Character emotion states (for animations)
type CharacterEmotion = 'happy' | 'celebrate' | 'excited' | 'wink' | 'thinking' | 'proud';

const CELEBRATION_MESSAGES = [
  "🎉 Amazing work!",
  "🌟 Excellent!",
  "✨ Outstanding!",
  "🏆 Fantastic!",
  "💪 Great job!",
  "🎯 Perfect!",
  "🚀 Incredible!",
  "⭐ Brilliant!",
];

const getRandomCelebration = (): string => {
  return CELEBRATION_MESSAGES[Math.floor(Math.random() * CELEBRATION_MESSAGES.length)];
};

export function HelpBot() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [showFAQ, setShowFAQ] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<FAQItem['category'] | 'all'>('all');
  const [speechBubble, setSpeechBubble] = useState<SpeechBubble | null>(null);
  const [characterEmotion, setCharacterEmotion] = useState<CharacterEmotion>('happy');
  const [isCelebrating, setIsCelebrating] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { progress, completedGamesCount, totalGamesCount, currentXPPercentage, getGameProgress } = useGameMode();

  // Track previous progress to detect achievements
  const prevProgressRef = useRef(progress);
  const prevCompletedGamesRef = useRef(completedGamesCount);
  const lastCelebrationRef = useRef<string>('');

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      // Small delay to ensure DOM has updated
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 100);
    }
  }, [messages]);


  // Initialize with welcome message
  useEffect(() => {
    if (isChatOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        id: 'welcome',
        type: 'bot',
        content: `👋 Hey Detective! I'm your co-officer here to help!\n\nI can help with:\n• FAQ and questions\n• Page instructions\n• Navigation tips\n\nWhat do you need?`,
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [isChatOpen, messages.length]);

  // Idle animations - occasional emotion changes
  useEffect(() => {
    if (isCelebrating) return;
    
    // Occasional emotion changes
    const emotionInterval = setInterval(() => {
      if (Math.random() > 0.7 && characterEmotion === 'happy') {
        const emotions: CharacterEmotion[] = ['wink', 'excited', 'proud'];
        const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
        setCharacterEmotion(randomEmotion);
        setTimeout(() => setCharacterEmotion('happy'), 2000);
      }
    }, 5000);

    return () => {
      clearInterval(emotionInterval);
    };
  }, [isCelebrating, characterEmotion]);

  // Detect achievements and celebrate
  useEffect(() => {
    const prevProgress = prevProgressRef.current;
    const prevCompleted = prevCompletedGamesRef.current;

    // Check for new game completion
    if (completedGamesCount > prevCompleted) {
      const allGameIds = Object.keys(progress.completedLevels);
      for (const gameId of allGameIds) {
        const gameData = getGameById(gameId);
        if (gameData) {
          const completedLevels = progress.completedLevels[gameId] || [];
          const prevCompletedLevels = prevProgress.completedLevels[gameId] || [];
          
          if (completedLevels.length === gameData.levels.length && 
              prevCompletedLevels.length < gameData.levels.length) {
            const celebrationId = `game-${gameId}-${Date.now()}`;
            if (celebrationId !== lastCelebrationRef.current) {
              celebrateAchievement({
                title: `${gameData.title} Complete!`,
                message: `${getRandomCelebration()} You completed "${gameData.title}"!`,
              });
              lastCelebrationRef.current = celebrationId;
            }
            break;
          }
        }
      }
    }

    // Check for XP milestones
    const xpMilestones = [100, 250, 500, 750, 1000, 1500, 2000];
    const currentXP = progress.totalXP;
    const prevXP = prevProgress.totalXP;
    
    for (const milestone of xpMilestones) {
      if (currentXP >= milestone && prevXP < milestone) {
        const celebrationId = `xp-${milestone}-${Date.now()}`;
        if (celebrationId !== lastCelebrationRef.current) {
          celebrateAchievement({
            title: `${milestone} XP Milestone!`,
            message: `${getRandomCelebration()} You reached ${milestone} XP!`,
          });
          lastCelebrationRef.current = celebrationId;
        }
        break;
      }
    }

    // Check for percentage milestones
    const percentageMilestones = [25, 50, 75, 100];
    for (const milestone of percentageMilestones) {
      const prevPercent = prevProgress.totalXP > 0 
        ? Math.round((prevProgress.totalXP / (progress.totalXP || 1)) * 100)
        : 0;
      if (currentXPPercentage >= milestone && prevPercent < milestone) {
        const celebrationId = `percent-${milestone}-${Date.now()}`;
        if (celebrationId !== lastCelebrationRef.current) {
          celebrateAchievement({
            title: `${milestone}% Complete!`,
            message: `${getRandomCelebration()} You're ${milestone}% done!`,
          });
          lastCelebrationRef.current = celebrationId;
        }
        break;
      }
    }

    prevProgressRef.current = progress;
    prevCompletedGamesRef.current = completedGamesCount;
  }, [progress, completedGamesCount, currentXPPercentage]);

  const celebrateAchievement = useCallback((achievement: { title: string; message: string }) => {
    setIsCelebrating(true);
    setCharacterEmotion('celebrate');
    
    // Show speech bubble
    setSpeechBubble({
      id: `bubble-${Date.now()}`,
      message: achievement.message,
      duration: 4000,
    });

    // Add to chat if open
    if (isChatOpen) {
      const celebrationMessage: Message = {
        id: `celebration-${Date.now()}`,
        type: 'bot',
        content: `🎉 **${achievement.title}**\n\n${achievement.message}`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, celebrationMessage]);
    }

    // Return to happy after celebration
    setTimeout(() => {
      setCharacterEmotion('happy');
      setIsCelebrating(false);
    }, 3000);
  }, [isChatOpen]);

  const addMessage = useCallback((content: string, type: 'bot' | 'user' = 'user') => {
    const message: Message = {
      id: `msg-${Date.now()}-${Math.random()}`,
      type,
      content,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, message]);
    return message;
  }, []);

  const typeMessage = useCallback((content: string, onComplete?: () => void) => {
    const message: Message = {
      id: `msg-${Date.now()}-${Math.random()}`,
      type: 'bot',
      content: '',
      timestamp: new Date(),
      isTyping: true,
    };
    setMessages(prev => [...prev, message]);

    let index = 0;
    const typingInterval = setInterval(() => {
      if (index < content.length) {
        setMessages(prev => {
          const updated = [...prev];
          const lastMsg = updated[updated.length - 1];
          if (lastMsg && lastMsg.isTyping) {
            lastMsg.content = content.slice(0, index + 1);
            lastMsg.isTyping = index < content.length - 1;
          }
          return updated;
        });
        // Scroll during typing every few characters
        if (index % 10 === 0) {
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
          }, 50);
        }
        index++;
      } else {
        clearInterval(typingInterval);
        // Final scroll when typing completes
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }, 100);
        if (onComplete) onComplete();
      }
    }, 20);
  }, []);

  const handleOptionSelect = useCallback((optionId: string) => {
    setSelectedOption(optionId);
    
    // Add visual feedback
    setTimeout(() => setSelectedOption(null), 300);

    switch (optionId) {
      case 'faq':
        addMessage('Show FAQ', 'user');
        setShowFAQ(true);
        typeMessage('Here are some frequently asked questions. Click on any question to see the answer!');
        break;

      case 'page-help':
        addMessage('Page Help', 'user');
        const pageHelp = getPageHelp(pathname);
        if (pageHelp) {
          const helpText = `📄 **${pageHelp.title}**\n\n${pageHelp.description}\n\n**Instructions:**\n${pageHelp.instructions.map(i => `• ${i}`).join('\n')}\n\n**Tips:**\n${pageHelp.tips.map(t => `💡 ${t}`).join('\n')}`;
          typeMessage(helpText);
        } else {
          typeMessage('I don\'t have specific help for this page yet, but feel free to explore!');
        }
        break;

      case 'navigation':
        addMessage('Navigation Tips', 'user');
        typeMessage('To navigate:\n• Press "M" or click the 3x3 grid menu button (top-left)\n• Use number keys (1-8) when menu is open\n• Check each page\'s help for shortcuts');
        break;

      case 'progress':
        addMessage('Check Progress', 'user');
        const currentGame = getGameById(progress.currentGameId);
        const gameProgress = getGameProgress(progress.currentGameId);
        typeMessage(`📊 **Your Progress:**\n\n• Total XP: ${progress.totalXP}\n• Progress: ${currentXPPercentage}%\n• Games Completed: ${completedGamesCount}/${totalGamesCount}\n${currentGame ? `• Current Game: ${currentGame.title} (${gameProgress}% complete)` : ''}\n\nKeep exploring!`);
        break;

      case 'achievements':
        addMessage('Achievements', 'user');
        typeMessage(`🏆 **Your Achievements:**\n\n• Games Completed: ${completedGamesCount}/${totalGamesCount}\n• XP Milestone: ${progress.totalXP} XP\n• Progress: ${currentXPPercentage}%\n\nKeep exploring to unlock more achievements!`);
        break;

      case 'quick-tips':
        addMessage('Quick Tips', 'user');
        typeMessage(`💡 **Quick Tips:**\n\n• Press "M" to open the menu\n• Use number keys (1-8) for quick navigation\n• Complete levels to earn XP\n• Switch design eras with the Time Machine\n• Explore each page to unlock achievements!`);
        break;
    }
  }, [pathname, progress, completedGamesCount, totalGamesCount, currentXPPercentage, getGameProgress, addMessage, typeMessage]);

  const handleFAQClick = useCallback((faq: FAQItem) => {
    typeMessage(`**${faq.question}**\n\n${faq.answer}`);
    setShowFAQ(false);
  }, [typeMessage]);

  const handleCharacterClick = useCallback(() => {
    setIsChatOpen(true);
    setCharacterEmotion('excited');
    setTimeout(() => setCharacterEmotion('happy'), 1000);
  }, []);

  const filteredFAQ = currentCategory === 'all' 
    ? FAQ_DATA 
    : FAQ_DATA.filter(faq => faq.category === currentCategory);

  return (
    <>
      {/* Character - Always Visible */}
      <motion.div
        className="fixed bottom-4 right-4 z-40 cursor-pointer"
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ 
          opacity: 1, 
          scale: isCelebrating ? [1, 1.2, 1] : 1,
          y: isCelebrating ? [0, -10, 0] : 0,
        }}
        transition={{
          opacity: { duration: 0.5 },
          scale: { duration: 0.3, repeat: isCelebrating ? 2 : 0 },
          y: { duration: 0.3, repeat: isCelebrating ? 2 : 0 },
        }}
        onClick={handleCharacterClick}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Speech Bubble */}
        <AnimatePresence>
          {speechBubble && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.8 }}
              className={cn(
                'absolute bottom-full right-0 mb-2',
                'px-3 py-2 max-w-[200px]',
                'bg-[var(--bg-card)]',
                'text-xs font-mono text-[var(--text-main)]',
                'shadow-lg'
              )}
              style={{ imageRendering: 'pixelated' as any }}
            >
              {speechBubble.message}
              <div className="absolute bottom-0 right-4 translate-y-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-[var(--border-color)]" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Co-Officer Icon */}
        <motion.div
          className="relative"
          animate={
            isCelebrating
              ? { scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }
              : {}
          }
          transition={{ duration: 0.3, repeat: isCelebrating ? 2 : 0 }}
        >
          <PixelIcon 
            name="user" 
            size={48}
            className="text-[var(--accent-color)]"
          />
        </motion.div>

        {/* Name Badge */}
        <div className={cn(
          'absolute -top-6 left-1/2 -translate-x-1/2',
          'px-2 py-1 text-[8px] font-mono uppercase',
          'bg-[var(--accent-color)] text-[var(--bg-main)]',
          'border border-[var(--bg-main)]',
          'whitespace-nowrap'
        )}>
          Co-Officer
        </div>
      </motion.div>

      {/* Chat Window */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-4 right-4 z-50 w-96 max-w-[calc(100vw-2rem)] h-[calc(100vh-2rem)]"
          >
            <div className={cn(
              'h-full flex flex-col',
              'bg-[var(--bg-card)]',
              'shadow-lg'
            )}>
              {/* Header */}
              <div className={cn(
                'flex items-center justify-between p-3',
                'border-b border-[var(--border-color)]',
                'bg-[var(--accent-color)] text-[var(--bg-main)]'
              )}>
                <div className="flex items-center gap-2">
                  <PixelIcon 
                    name="user" 
                    size={24}
                    className="text-[var(--bg-main)]"
                  />
                  <div>
                    <div className="text-sm font-mono font-bold uppercase">Co-Officer</div>
                    <div className="text-[10px] font-mono opacity-80">Your Helper</div>
                  </div>
                </div>
                <button
                  onClick={() => setIsChatOpen(false)}
                  className="hover:opacity-70 transition-opacity"
                  aria-label="Close chat"
                >
                  <PixelIcon name="times" size={16} />
                </button>
              </div>

              {/* Messages Area */}
              <div className="flex-1 min-h-[150px] overflow-y-auto p-4 space-y-3 bg-[var(--bg-main)]">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-center">
                    <div className="text-sm font-mono text-[var(--text-main)] opacity-50">
                      Select an action to get started!
                    </div>
                  </div>
                ) : (
                  <AnimatePresence>
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={cn(
                          'flex',
                          message.type === 'user' ? 'justify-end' : 'justify-start'
                        )}
                      >
                        <div
                          className={cn(
                            'max-w-[80%] p-3',
                            'border border-[var(--border-color)]',
                            message.type === 'user'
                              ? 'bg-[var(--accent-color)] text-[var(--bg-main)]'
                              : 'bg-[var(--bg-card)] text-[var(--text-main)]'
                          )}
                        >
                          <div className="text-sm font-mono whitespace-pre-wrap">
                            {message.content}
                          </div>
                          {message.isTyping && (
                            <span className="inline-block w-2 h-2 bg-current ml-1 animate-pulse">▋</span>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* FAQ Toggle */}
              <div className="border-t border-[var(--border-color)] p-2 flex-shrink-0">
                <button
                  onClick={() => setShowFAQ(!showFAQ)}
                  className={cn(
                    'w-full px-3 py-2 text-xs font-mono uppercase',
                    'border border-[var(--border-color)]',
                    'bg-[var(--bg-card)] hover:bg-[var(--accent-color)] hover:text-[var(--bg-main)]',
                    'transition-colors'
                  )}
                >
                  {showFAQ ? 'Hide' : 'Show'} FAQ
                </button>
              </div>

              {/* FAQ Panel */}
              <AnimatePresence>
                {showFAQ && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-[var(--border-color)] overflow-hidden flex-shrink-0"
                  >
                    <div className="p-3 bg-[var(--bg-main)] max-h-24 overflow-y-auto">
                      <div className="flex gap-1 mb-2 flex-wrap">
                        {(['all', 'general', 'navigation', 'games', 'achievements', 'technical'] as const).map((cat) => (
                          <button
                            key={cat}
                            onClick={() => setCurrentCategory(cat)}
                            className={cn(
                              'px-2 py-1 text-[10px] font-mono uppercase',
                              'border border-[var(--border-color)]',
                              currentCategory === cat
                                ? 'bg-[var(--accent-color)] text-[var(--bg-main)]'
                                : 'bg-[var(--bg-card)] hover:bg-[var(--text-main)] hover:text-[var(--bg-main)]',
                              'transition-colors'
                            )}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                      <div className="space-y-1">
                        {filteredFAQ.map((faq) => (
                          <button
                            key={faq.id}
                            onClick={() => handleFAQClick(faq)}
                            className={cn(
                              'w-full text-left p-2 text-xs font-mono',
                              'border border-[var(--border-color)]',
                              'bg-[var(--bg-card)] hover:bg-[var(--accent-color)] hover:text-[var(--bg-main)]',
                              'transition-colors'
                            )}
                          >
                            {faq.question}
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Gamified Action Options */}
              <div className="border-t border-[var(--border-color)] p-3 bg-[var(--bg-main)] flex-shrink-0">
                <div className="text-xs font-mono uppercase mb-2 text-[var(--text-main)] opacity-70">
                  Select Action:
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'faq', label: '📋 FAQ', emoji: '📋', color: 'blue' },
                    { id: 'page-help', label: '📄 Page Help', emoji: '📄', color: 'green' },
                    { id: 'navigation', label: '🧭 Navigation', emoji: '🧭', color: 'purple' },
                    { id: 'progress', label: '📊 Progress', emoji: '📊', color: 'orange' },
                    { id: 'achievements', label: '🏆 Achievements', emoji: '🏆', color: 'yellow' },
                    { id: 'quick-tips', label: '💡 Quick Tips', emoji: '💡', color: 'pink' },
                  ].map((option) => (
                    <motion.button
                      key={option.id}
                      onClick={() => handleOptionSelect(option.id)}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95, y: 0 }}
                      className={cn(
                        'relative p-3 text-left',
                        'border border-[var(--border-color)]',
                        'bg-[var(--bg-card)]',
                        'font-mono text-xs uppercase',
                        'transition-all duration-200',
                        'shadow-sm',
                        selectedOption === option.id
                          ? 'bg-[var(--accent-color)] text-[var(--bg-main)] shadow-md scale-95'
                          : 'text-[var(--text-main)] hover:bg-[var(--accent-color)] hover:text-[var(--bg-main)] hover:shadow-md'
                      )}
                      style={{ imageRendering: 'pixelated' as any }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">{option.emoji}</span>
                        <span className="font-bold">{option.label.replace(/^[^\s]+\s/, '')}</span>
                      </div>
                      {selectedOption === option.id && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-1 -right-1 w-3 h-3 bg-[var(--bg-main)] border border-[var(--border-color)]"
                        />
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
