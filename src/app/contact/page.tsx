'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useCallback } from 'react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useBombDefusal } from './components/useBombDefusal';
import { FullScreenBomb } from './components/FullScreenBomb';
import { TypewriterForm } from './components/TypewriterForm';
import { ModuleModal } from './components/ModuleModal';

export default function Contact() {
  const { trackContactSubmission, trackInteraction } = useAnalytics();
  const [showIntro, setShowIntro] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const {
    bombState,
    startBomb,
    togglePause,
    solveModule,
    addStrike,
    defuseBomb,
    resetBomb,
  } = useBombDefusal({
    gameDuration: 300, // 5 minutes
    onDefused: () => {
      trackInteraction('bomb_defused');
      // Don't set submitted here - only after form submission
    },
    onExploded: () => {
      trackInteraction('bomb_exploded');
    },
    onModuleSolved: (moduleId) => {
      trackInteraction('module_solved', { moduleId });
      setSelectedModule(null);
    },
    onStrike: (strikes) => {
      trackInteraction('bomb_strike', { strikes });
    },
  });

  const handleStartGame = useCallback(() => {
    setShowIntro(false);
    startBomb();
    trackInteraction('bomb_game_start');
  }, [startBomb, trackInteraction]);

  const handleModuleClick = useCallback((moduleId: string) => {
    const bombModule = bombState.modules.find(m => m.id === moduleId);
    if (bombModule && bombModule.isActive && !bombModule.isSolved) {
      setSelectedModule(moduleId);
      trackInteraction('module_opened', { moduleId });
    }
  }, [bombState.modules, trackInteraction]);

  const handleModuleSolve = useCallback(() => {
    if (selectedModule) {
      solveModule(selectedModule);
    }
  }, [selectedModule, solveModule]);

  const handleModuleStrike = useCallback(() => {
    addStrike();
  }, [addStrike]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.name || !form.email || !form.message) {
      setError('Please complete all unlocked fields!');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      // Defuse the bomb and mark as submitted on successful submission
      defuseBomb();
      setSubmitted(true);
      trackContactSubmission();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleRestart = () => {
    resetBomb();
    setForm({ name: '', email: '', message: '' });
    setError(null);
    setSubmitted(false);
    setShowIntro(true);
    setSelectedModule(null);
  };

  const activeBombModule = selectedModule
    ? bombState.modules.find(m => m.id === selectedModule) ?? null
    : null;

  return (
    <main
      className="min-h-screen pt-16 pb-20 relative"
      style={{
        backgroundColor: 'var(--bg-main)',
        imageRendering: 'pixelated',
      }}
    >
      {/* Grid Background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(var(--border-color) 1px, transparent 1px),
            linear-gradient(90deg, var(--border-color) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px',
        }}
      />
      {/* Intro Screen */}
      <AnimatePresence>
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
              <div className="text-6xl mb-6">💣</div>
              <h1 className="text-4xl font-mono text-white mb-4">
                BOMB DEFUSAL
              </h1>
              <h2 className="text-2xl font-mono text-yellow-400 mb-6">
                CONTACT TO SURVIVE
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
                  You have a bomb with multiple modules that need to be defused.
                  Solve each module to unlock contact form fields.
                </p>
                <p className="font-mono text-sm mb-4" style={{ color: '#FFD93D' }}>
                  ⚠️ Rules:
                </p>
                <ul className="font-mono text-sm space-y-2 mb-4" style={{ color: 'var(--text-main)' }}>
                  <li>• Solve modules in order (they unlock sequentially)</li>
                  <li>• Each module reveals my contact information</li>
                  <li>• You have 3 strikes before the bomb explodes</li>
                  <li>• Complete all modules to unlock the contact form</li>
                  <li>• Submit the form to successfully defuse the bomb</li>
                </ul>
                <div
                  className="p-4 mb-4"
                  style={{
                    backgroundColor: 'rgba(255, 217, 61, 0.1)',
                    border: '2px solid #FFD93D',
                  }}
                >
                  <p className="font-mono text-sm font-bold mb-2" style={{ color: '#FFD93D' }}>
                    🎮 HOW TO PLAY:
                  </p>
                  <ul className="font-mono text-xs space-y-1" style={{ color: '#FFD93D' }}>
                    <li>1. Click on an active (yellow) module to open it</li>
                    <li>2. Find my contact info using the hints</li>
                    <li>3. Each solved module unlocks a contact form field</li>
                    <li>4. Complete all modules and submit the form</li>
                  </ul>
                </div>
                <p className="font-mono text-sm" style={{ color: '#6BCF7F' }}>
                  ✅ Defuse the bomb to contact me!
                </p>
              </div>
              <motion.button
                onClick={handleStartGame}
                className="px-8 py-4 font-mono text-lg border-2 font-bold"
                style={{
                  backgroundColor: '#FF6B6B',
                  borderColor: '#FF6B6B',
                  color: '#000',
                  boxShadow: '0 0 0 2px var(--bg-main), 4px 4px 0 var(--border-color)',
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                🚨 START DEFUSAL
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Exploded Screen */}
      <AnimatePresence>
        {bombState.isExploded && !showIntro && (
          <motion.div
            className="fixed inset-0 z-40 flex items-center justify-center bg-black/95"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="max-w-2xl mx-auto px-8 text-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <div className="text-8xl mb-4">💥</div>
              <h1 className="text-5xl font-mono mb-4" style={{ color: '#FF6B6B' }}>
                BOOM!
              </h1>
              <p className="font-mono text-lg mb-6" style={{ color: 'var(--text-main)' }}>
                The bomb exploded! Too many strikes or time ran out.
              </p>
              <motion.button
                onClick={handleRestart}
                className="px-8 py-4 font-mono text-lg border-2 font-bold"
                style={{
                  backgroundColor: '#FF6B6B',
                  borderColor: '#FF6B6B',
                  color: '#000',
                  boxShadow: '0 0 0 2px var(--bg-main), 4px 4px 0 var(--border-color)',
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                🔄 TRY AGAIN
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Screen */}
      <AnimatePresence>
        {submitted && bombState.isDefused && (
          <motion.div
            className="fixed inset-0 z-40 flex items-center justify-center bg-black/95"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="max-w-2xl mx-auto px-8 text-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <div className="text-8xl mb-4">🎉</div>
              <h1 className="text-5xl font-mono mb-4" style={{ color: '#6BCF7F' }}>
                BOMB DEFUSED!
              </h1>
              <p className="font-mono text-lg mb-6" style={{ color: 'var(--text-main)' }}>
                Congratulations! You successfully defused the bomb and your message has been sent.
                I'll get back to you soon!
              </p>
              <div
                className="p-6 mb-6"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  border: '4px solid #6BCF7F',
                  boxShadow: '0 0 0 2px var(--bg-main), 4px 4px 0 var(--border-color)',
                }}
              >
                <h3 className="font-mono text-xl mb-4" style={{ color: '#6BCF7F' }}>Contact Information</h3>
                <div className="text-left space-y-2 font-mono text-sm" style={{ color: 'var(--text-main)' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Email:</span>{' '}
                    <a href="mailto:arunkumaar.srinivasan@gmail.com" style={{ color: '#FFD93D' }} className="hover:underline">
                      arunkumaar.srinivasan@gmail.com
                    </a>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>LinkedIn:</span>{' '}
                    <a href="https://linkedin.com/in/arunkumaarsreenivasan/" target="_blank" rel="noopener noreferrer" style={{ color: '#FFD93D' }} className="hover:underline">
                      /in/arunkumaarsreenivasan/
                    </a>
                  </div>
                </div>
              </div>
              <motion.button
                onClick={handleRestart}
                className="px-8 py-4 font-mono text-lg border-2 font-bold"
                style={{
                  backgroundColor: '#6BCF7F',
                  borderColor: '#6BCF7F',
                  color: '#000',
                  boxShadow: '0 0 0 2px var(--bg-main), 4px 4px 0 var(--border-color)',
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                🔄 PLAY AGAIN
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full Screen Bomb Interface */}
      {!showIntro && !bombState.isExploded && !submitted && !bombState.isDefused && !bombState.modules.every(m => m.isSolved) && (
        <FullScreenBomb
          bombState={bombState}
          onModuleClick={handleModuleClick}
          onPause={togglePause}
        />
      )}

      {/* Contact Form & Cal.com (shown when all modules solved, but bomb not yet defused) */}
      {!showIntro && !bombState.isExploded && !submitted && !bombState.isDefused && bombState.modules.every(m => m.isSolved) && (
        <div className="fixed inset-0 z-40 overflow-auto" style={{ backgroundColor: 'var(--bg-main)' }}>
          {/* Grid Background */}
          <div
            className="fixed inset-0 pointer-events-none opacity-20"
            style={{
              backgroundImage: `
                linear-gradient(var(--border-color) 1px, transparent 1px),
                linear-gradient(90deg, var(--border-color) 1px, transparent 1px)
              `,
              backgroundSize: '20px 20px',
            }}
          />
          
          <div className="relative max-w-7xl mx-auto px-4 py-8 z-10">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Left: Typewriter Form */}
              <div>
                <TypewriterForm
                  form={form}
                  onChange={handleChange}
                  onSubmit={handleSubmit}
                  isSubmitting={isSubmitting}
                  error={error}
                  unlocked={bombState.contactFormUnlocked}
                />
              </div>

              {/* Right: Cal.com & Contact Links */}
              <div className="space-y-6">
                {/* Cal.com Embed */}
                <div
                  className="p-6"
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    border: '4px solid var(--border-color)',
                    boxShadow: '0 0 0 2px var(--bg-main), 4px 4px 0 var(--border-color)',
                  }}
                >
                  <h3 className="text-xl font-mono font-bold mb-4" style={{ color: 'var(--text-main)' }}>
                    📅 SCHEDULE A MEETING
                  </h3>
                  <div
                    className="w-full rounded"
                    style={{
                      minHeight: '600px',
                      border: '2px solid var(--border-color)',
                      overflow: 'hidden',
                    }}
                  >
                    <iframe
                      src="https://cal.com/arunkumaar"
                      width="100%"
                      height="600"
                      frameBorder="0"
                      style={{
                        backgroundColor: 'var(--bg-card)',
                      }}
                      title="Schedule a meeting"
                    />
                  </div>
                </div>

                {/* Contact Links */}
                <div
                  className="p-6"
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    border: '4px solid var(--border-color)',
                    boxShadow: '0 0 0 2px var(--bg-main), 4px 4px 0 var(--border-color)',
                  }}
                >
                  <h3 className="text-xl font-mono font-bold mb-4" style={{ color: 'var(--text-main)' }}>
                    📞 CONTACT LINKS
                  </h3>
                  <div className="space-y-3 font-mono text-sm">
                    <motion.a
                      href="mailto:arunkumaar.srinivasan@gmail.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-3 border-2"
                      style={{
                        backgroundColor: 'var(--bg-main)',
                        borderColor: 'var(--border-color)',
                        color: 'var(--text-main)',
                        boxShadow: 'inset 0 0 0 1px var(--bg-card)',
                      }}
                      whileHover={{ scale: 1.02, x: 4 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      📧 Email: arunkumaar.srinivasan@gmail.com
                    </motion.a>
                    <motion.a
                      href="https://linkedin.com/in/arunkumaarsreenivasan/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-3 border-2"
                      style={{
                        backgroundColor: 'var(--bg-main)',
                        borderColor: 'var(--border-color)',
                        color: 'var(--text-main)',
                        boxShadow: 'inset 0 0 0 1px var(--bg-card)',
                      }}
                      whileHover={{ scale: 1.02, x: 4 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      💼 LinkedIn: /in/arunkumaarsreenivasan/
                    </motion.a>
                    <motion.a
                      href="https://instagram.com/arunum.avan.seyalum"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-3 border-2"
                      style={{
                        backgroundColor: 'var(--bg-main)',
                        borderColor: 'var(--border-color)',
                        color: 'var(--text-main)',
                        boxShadow: 'inset 0 0 0 1px var(--bg-card)',
                      }}
                      whileHover={{ scale: 1.02, x: 4 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      📷 Instagram: @arunum.avan.seyalum (Personal)
                    </motion.a>
                    <motion.a
                      href="https://instagram.com/kirukism"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-3 border-2"
                      style={{
                        backgroundColor: 'var(--bg-main)',
                        borderColor: 'var(--border-color)',
                        color: 'var(--text-main)',
                        boxShadow: 'inset 0 0 0 1px var(--bg-card)',
                      }}
                      whileHover={{ scale: 1.02, x: 4 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      📷 Instagram: @kirukism (Professional)
                    </motion.a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Module Modal */}
      <ModuleModal
        module={activeBombModule}
        isOpen={!!selectedModule}
        onClose={() => setSelectedModule(null)}
        onSolve={handleModuleSolve}
        onStrike={handleModuleStrike}
      />
    </main>
  );
}
