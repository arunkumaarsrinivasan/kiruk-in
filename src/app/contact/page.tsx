'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useCallback } from 'react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useTypingGame } from './components/useTypingGame';
import { TypingGameInterface } from './components/TypingGameInterface';
import { TelephoneInterface } from './components/TelephoneInterface';
import { GridBackground } from '@/components/ui/GridBackground';

// The summary text users need to type - short and simple
const TYPING_TEXT = "I'm Arun Kumaar, a creative technologist building digital experiences.";

// Contact info that gets unlocked
const CONTACT_INFO = {
  email: {
    label: 'Email',
    value: 'arunkumaar.srinivasan@gmail.com',
    icon: '📧',
    href: 'mailto:arunkumaar.srinivasan@gmail.com',
  },
  linkedin: {
    label: 'LinkedIn',
    value: '/in/arunkumaarsreenivasan',
    icon: '💼',
    href: 'https://linkedin.com/in/arunkumaarsreenivasan/',
  },
  instagram_personal: {
    label: 'Instagram (Personal)',
    value: '@arunum.avan.seyalum',
    icon: '📷',
    href: 'https://instagram.com/arunum.avan.seyalum',
  },
  instagram_pro: {
    label: 'Instagram (Professional)',
    value: '@kirukism',
    icon: '📸',
    href: 'https://instagram.com/kirukism',
  },
  github: {
    label: 'GitHub',
    value: '@arunkumaars',
    icon: '🐙',
    href: 'https://github.com/arunkumaars',
  },
  twitter: {
    label: 'X (Twitter)',
    value: '@kirukism',
    icon: '🐦',
    href: 'https://twitter.com/kirukism',
  },
};

export default function Contact() {
  const { trackInteraction } = useAnalytics();
  const [showIntro, setShowIntro] = useState(true);
  const [completedStats, setCompletedStats] = useState<{
    wpm: number;
    cps: number;
    accuracy: number;
    time: number;
  } | null>(null);

  const {
    gameState,
    startGame,
    handleKeyPress,
    resetGame,
  } = useTypingGame({
    targetText: TYPING_TEXT,
    minAccuracy: 70,
    onComplete: (stats) => {
      setCompletedStats(stats);
      trackInteraction('typing_game_completed', stats);
    },
    onFail: () => {
      trackInteraction('typing_game_failed');
    },
  });

  const handleStartGame = useCallback(() => {
    setShowIntro(false);
    startGame();
    trackInteraction('typing_game_start');
  }, [startGame, trackInteraction]);

  const handleRestart = useCallback(() => {
    resetGame();
    setCompletedStats(null);
    setShowIntro(true);
  }, [resetGame]);

  const handleRetry = useCallback(() => {
    resetGame();
    startGame();
  }, [resetGame, startGame]);

  return (
    <main
      className="min-h-screen pt-16 pb-20 relative"
      style={{
        backgroundColor: 'var(--bg-main)',
      }}
    >
      <GridBackground opacity={0.2} />
      
      {/* Intro Screen */}
      <AnimatePresence mode="wait">
        {showIntro && (
          <motion.div
            className="fixed inset-0 z-20 flex items-center justify-center bg-black/95"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="max-w-2xl mx-auto px-8 text-center"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <motion.div 
                className="text-6xl mb-6"
                animate={{ rotate: [0, -5, 5, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
              >
                ⌨️
              </motion.div>
              <h1 className="text-4xl font-mono text-white mb-4">
                TYPEWRITER CHALLENGE
              </h1>
              <h2 className="text-2xl font-mono mb-6" style={{ color: '#FFD93D' }}>
                TYPE TO UNLOCK
              </h2>
              <div
                className="p-6 mb-6 text-left"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  border: '4px solid var(--border-color)',
                  boxShadow: '0 0 0 2px var(--bg-main), 4px 4px 0 var(--border-color)',
                }}
              >
                <p className="font-mono text-sm mb-4" style={{ color: 'var(--text-main)' }}>
                  Want to contact me? First, prove your typing skills!
                </p>
                <p className="font-mono text-sm mb-4" style={{ color: '#FFD93D' }}>
                  📋 Challenge:
                </p>
                <ul className="font-mono text-sm space-y-2 mb-4" style={{ color: 'var(--text-main)' }}>
                  <li>• Type the displayed text as fast and accurately as possible</li>
                  <li>• Maintain at least 70% accuracy to unlock</li>
                  <li>• Watch your WPM (words per minute) climb!</li>
                </ul>
                <div
                  className="p-4 mb-4"
                  style={{
                    backgroundColor: 'rgba(107, 207, 127, 0.1)',
                    border: '2px solid #6BCF7F',
                  }}
                >
                  <p className="font-mono text-sm font-bold mb-2" style={{ color: '#6BCF7F' }}>
                    🎁 REWARDS:
                  </p>
                  <ul className="font-mono text-xs space-y-1" style={{ color: '#6BCF7F' }}>
                    <li>✓ All my social media links unlocked</li>
                    <li>✓ Direct contact information revealed</li>
                    <li>✓ Schedule a meeting link</li>
                    <li>✓ Bragging rights for your WPM score!</li>
                  </ul>
                </div>
                <div
                  className="p-4"
                  style={{
                    backgroundColor: 'rgba(255, 217, 61, 0.1)',
                    border: '2px solid #FFD93D',
                  }}
                >
                  <p className="font-mono text-xs" style={{ color: '#FFD93D' }}>
                    💡 The text you'll type is a short intro about me - just one sentence!
                  </p>
                </div>
              </div>
              <motion.button
                onClick={handleStartGame}
                className="px-8 py-4 font-mono text-lg border-2 font-bold"
                style={{
                  backgroundColor: '#FFD93D',
                  borderColor: '#FFD93D',
                  color: '#000',
                  boxShadow: '0 0 0 2px var(--bg-main), 4px 4px 0 var(--border-color)',
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                ⌨️ START CHALLENGE
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Typing Game */}
      <AnimatePresence mode="wait">
        {!showIntro && !gameState.isCompleted && (
          <motion.div
            className="fixed inset-0 z-20 flex items-center justify-center bg-black/95 overflow-auto py-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <TypingGameInterface
              gameState={gameState}
              onKeyPress={handleKeyPress}
              onStart={startGame}
              onReset={handleRetry}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Screen */}
      <AnimatePresence>
        {gameState.isCompleted && completedStats && (
          <motion.div
            className="fixed inset-0 z-40 overflow-auto"
            style={{ backgroundColor: 'var(--bg-main)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 z-0">
              <GridBackground opacity={0.2} />
            </div>
            
            <div className="relative max-w-4xl mx-auto px-4 py-8 z-10">
              {/* Success Header */}
              <motion.div
                className="text-center mb-12"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <motion.div
                  className="text-8xl mb-4"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
                >
                  🎉
                </motion.div>
                <h1 className="text-4xl font-mono font-bold mb-4" style={{ color: '#6BCF7F' }}>
                  CHALLENGE COMPLETE!
                </h1>
                <p className="font-mono text-lg" style={{ color: 'var(--text-main)' }}>
                  Impressive typing! Here's your reward.
                </p>
              </motion.div>

              {/* Stats Card */}
              <motion.div
                className="mb-8 p-6"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  border: '2px solid #FFD93D',
                }}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <h3 className="text-xl font-mono font-bold mb-6 text-center" style={{ color: '#FFD93D' }}>
                  📊 YOUR STATS
                </h3>
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div
                    className="p-4"
                    style={{
                      backgroundColor: 'var(--bg-main)',
                      border: '1px solid var(--border-color)',
                    }}
                  >
                    <div className="text-3xl font-mono font-bold" style={{ color: '#FFD93D' }}>
                      {completedStats.wpm}
                    </div>
                    <div className="text-xs font-mono uppercase" style={{ color: 'var(--text-muted)' }}>
                      WPM
                    </div>
                  </div>
                  <div
                    className="p-4"
                    style={{
                      backgroundColor: 'var(--bg-main)',
                      border: '1px solid var(--border-color)',
                    }}
                  >
                    <div className="text-3xl font-mono font-bold" style={{ color: '#6BCF7F' }}>
                      {completedStats.cps}
                    </div>
                    <div className="text-xs font-mono uppercase" style={{ color: 'var(--text-muted)' }}>
                      CPS
                    </div>
                  </div>
                  <div
                    className="p-4"
                    style={{
                      backgroundColor: 'var(--bg-main)',
                      border: '1px solid var(--border-color)',
                    }}
                  >
                    <div className="text-3xl font-mono font-bold" style={{ color: '#6BCF7F' }}>
                      {completedStats.accuracy}%
                    </div>
                    <div className="text-xs font-mono uppercase" style={{ color: 'var(--text-muted)' }}>
                      Accuracy
                    </div>
                  </div>
                  <div
                    className="p-4"
                    style={{
                      backgroundColor: 'var(--bg-main)',
                      border: '1px solid var(--border-color)',
                    }}
                  >
                    <div className="text-3xl font-mono font-bold" style={{ color: 'var(--text-main)' }}>
                      {completedStats.time.toFixed(1)}s
                    </div>
                    <div className="text-xs font-mono uppercase" style={{ color: 'var(--text-muted)' }}>
                      Time
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Contact Info Grid */}
              <motion.div
                className="grid md:grid-cols-2 gap-6 mb-8"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                {/* Social Links - Telephone Interface */}
                <div
                  className="p-6"
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    border: '2px solid var(--border-color)',
                  }}
                >
                  <TelephoneInterface contacts={Object.values(CONTACT_INFO)} />
                </div>

                {/* Cal.com Embed */}
                <div
                  className="p-6"
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    border: '2px solid var(--border-color)',
                  }}
                >
                  <h3 className="text-xl font-mono font-bold mb-4" style={{ color: 'var(--text-main)' }}>
                    📅 SCHEDULE A MEETING
                  </h3>
                  <div
                    className="w-full rounded overflow-hidden"
                    style={{
                      border: '1px solid var(--border-color)',
                      minHeight: '400px',
                    }}
                  >
                    <iframe
                      src="https://cal.com/arun-kumaar-sreenivasan-uihrg5"
                      width="100%"
                      height="400"
                      style={{
                        backgroundColor: 'var(--bg-card)',
                        border: 'none',
                      }}
                      title="Schedule a meeting"
                    />
                  </div>
                </div>
              </motion.div>

              {/* Play Again Button */}
              <motion.div
                className="text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                <motion.button
                  onClick={handleRestart}
                  className="px-8 py-4 font-mono text-lg border-2 font-bold"
                  style={{
                    backgroundColor: 'transparent',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-main)',
                  }}
                  whileHover={{ 
                    scale: 1.05,
                    backgroundColor: 'var(--bg-card)',
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  🔄 PLAY AGAIN (Beat your score!)
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}



