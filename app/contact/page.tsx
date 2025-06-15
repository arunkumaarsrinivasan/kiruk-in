'use client';

import ScribbleAnimation from '@/components/three/scribble-animation';
import { SketchHeading, SketchCard, SketchButton, SketchHighlight, StickyNote } from '@/components/ui/sketch-elements';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';

// Helper for draggable sticky notes
const DraggableSticky = ({ children, style, className, ...props }: any) => (
  <motion.div
    drag
    dragElastic={0.5}
    dragConstraints={{ left: -100, right: 100, top: -80, bottom: 80 }}
    whileTap={{ scale: 1.08, rotate: [0, 2, -2, 0] }}
    className={className}
    style={{ position: 'absolute', zIndex: 30, ...style }}
    {...props}
  >
    {children}
  </motion.div>
);

const STICKY_TIPS = [
  '✨ Pro tip: Add a doodle to your message!',
  '🖍️ Drag me!',
  '💡 Your ideas are welcome!',
  '🎨 Creativity starts here!',
  '🚀 Ready to launch your project?',
  '🤩 Don’t forget to smile!',
  '📝 Write from the heart!',
  '🌈 Make it colorful!',
];
const STICKY_COLORS = ['light', 'medium', 'dark', 'white'] as const;

type StickyNoteType = {
  id: string;
  tip: string;
  color: typeof STICKY_COLORS[number];
  x: number;
  y: number;
};

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  // Refactor tooltip state to support multiple tooltips
  const [showTooltip, setShowTooltip] = useState<{ email: boolean; linkedin: boolean; send: boolean }>({ email: false, linkedin: false, send: false });
  const [showErase, setShowErase] = useState(false);
  const [stickyNotes, setStickyNotes] = useState<StickyNoteType[]>(
    [
      { id: 'note-1', tip: STICKY_TIPS[0], color: 'light', x: 40, y: 120 },
      { id: 'note-2', tip: STICKY_TIPS[1], color: 'medium', x: 200, y: 220 }, // Use safe default for SSR
    ]
  );
  const [confettiBurst, setConfettiBurst] = useState(false);
  const confettiRef = useRef<HTMLDivElement>(null);

  // On mount, update the second note's x position if window is available
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setStickyNotes(notes =>
        notes.map((n, i) =>
          i === 1 ? { ...n, x: window.innerWidth - 200 } : n
        )
      );
    }
  }, []);

  // Helper to add a new sticky note
  const addStickyNote = () => {
    const tip = STICKY_TIPS[Math.floor(Math.random() * STICKY_TIPS.length)];
    const color = STICKY_COLORS[Math.floor(Math.random() * STICKY_COLORS.length)];
    const id = `note-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const width = typeof window !== 'undefined' ? window.innerWidth : 800;
    setStickyNotes(notes => [
      ...notes,
      {
        id,
        tip,
        color,
        x: 80 + Math.random() * (width - 300),
        y: 120 + Math.random() * 200,
      },
    ]);
  };
  // Helper to update sticky note position
  const moveStickyNote = (id: string, x: number, y: number) => {
    setStickyNotes(notes => notes.map(n => n.id === id ? { ...n, x, y } : n));
  };
  // Helper to remove sticky note
  const removeStickyNote = (id: string) => {
    setStickyNotes(notes => notes.filter(n => n.id !== id));
  };

  // Enhanced confetti burst
  const triggerConfetti = () => {
    setConfettiBurst(true);
    if (confettiRef.current) {
      confettiRef.current.innerHTML = '🎉';
      confettiRef.current.style.opacity = '1';
      confettiRef.current.style.transform = 'scale(1.5)';
      setTimeout(() => {
        if (confettiRef.current) {
          confettiRef.current.style.transform = 'translateY(-80px) scale(2)';
          confettiRef.current.style.opacity = '0';
        }
      }, 100);
      setTimeout(() => {
        if (confettiRef.current) confettiRef.current.innerHTML = '';
        setConfettiBurst(false);
      }, 1200);
    }
  };

  // Shake animation on invalid submit
  const [shakeForm, setShakeForm] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.name || !form.email || !form.message) {
      setError('Please fill in all fields.');
      setShakeForm(true);
      setTimeout(() => setShakeForm(false), 500);
      return;
    }
    setStatus('sending');
    setTimeout(() => {
      setStatus('success');
      setForm({ name: '', email: '', message: '' });
      triggerConfetti();
    }, 1200);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('arunkumaar.srinivasan@gmail.com');
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };
  const handleLinkedIn = () => {
    window.open('https://linkedin.com/in/arunkumaarsreenivasan/', '_blank');
  };

  // Sparkle effect for eraser
  const [showSparkle, setShowSparkle] = useState(false);
  const handleErase = () => {
    setShowErase(true);
    setShowSparkle(true);
    setTimeout(() => {
      setForm({ name: '', email: '', message: '' });
      setShowErase(false);
    }, 600);
    setTimeout(() => setShowSparkle(false), 700);
  };

  return (
    <main className="min-h-screen scrollable-content pt-16 notebook-bg">
      {/* Draggable sticky notes with fun tips */}
      {stickyNotes.map(note => (
        <DraggableSticky
          key={note.id}
          style={{ top: note.y, left: note.x }}
          drag
          dragMomentum={false}
          onDragEnd={(
            _e: unknown,
            info: { point: { x: number; y: number } }
          ) => moveStickyNote(note.id, info.point.x, info.point.y)}
        >
          <StickyNote color={note.color} className="w-32 h-20 flex items-center justify-center text-xs handwritten relative group">
            {note.tip}
            <button
              className="absolute top-1 right-1 text-xs opacity-40 group-hover:opacity-100 transition hover:text-red-500"
              onClick={() => removeStickyNote(note.id)}
              aria-label="Remove note"
              tabIndex={-1}
              type="button"
            >✖</button>
          </StickyNote>
        </DraggableSticky>
      ))}
      {/* Add Note Floating Button */}
      <motion.button
        className="fixed bottom-8 right-8 z-40 bg-yellow-200 border-2 border-yellow-400 rounded-full shadow-lg p-3 text-2xl hover:scale-110 active:scale-95 transition flex items-center justify-center"
        whileHover={{ rotate: 8, scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={addStickyNote}
        aria-label="Add sticky note"
        type="button"
      >
        {/* Hand-drawn plus icon SVG */}
        <svg
          width="32"
          height="32"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-7 h-7 text-black"
        >
          <path
            d="M16 6 Q15.5 15 16 26"
            stroke="currentColor"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M6 16 Q15 15.5 26 16"
            stroke="currentColor"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </motion.button>
      {/* Single viewport section */}
      <section className="relative min-h-screen flex flex-col">
        {/* Confetti doodle icon trigger */}
        <motion.div
          className="absolute left-8 top-8 text-3xl z-30 cursor-pointer select-none"
          animate={{ y: [0, -10, 0], rotate: [0, 8, -8, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          onClick={triggerConfetti}
          title="Click for confetti!"
        >
          🎊
        </motion.div>
        {/* Sparkle effect for eraser */}
        {showSparkle && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1.2 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed top-24 right-24 z-50 pointer-events-none text-5xl"
            style={{ filter: 'drop-shadow(0 0 8px #ffd700)' }}
          >
            ✨
          </motion.div>
        )}
        {/* Scribble Background */}
        <div className="absolute inset-0 opacity-10">
          <ScribbleAnimation className="w-full h-full" />
        </div>
        {/* Floating contact note */}
        <motion.div
          className="absolute top-16 right-8 hidden lg:block z-20"
          animate={{ 
            rotate: [0, 3, -3, 0],
            y: [0, -10, 10, 0] 
          }}
          transition={{ 
            duration: 8, 
            repeat: Infinity,
            ease: "easeInOut" 
          }}
        >
          <StickyNote color="medium" className="w-28 h-20">
            <div className="handwritten text-xs flex items-center gap-2">
              {/* Hand-drawn Contact icon */}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" style={{ filter: 'url(#roughen)' }}>
                <defs>
                  <filter id="roughen">
                    <feTurbulence baseFrequency="0.04" numOctaves="3" result="noise" seed="1" />
                    <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.8" />
                  </filter>
                </defs>
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z M9 9h6 M9 13h3" />
              </svg>
              Contact:
              <br />• Email (best)
              <br />• LinkedIn
            </div>
          </StickyNote>
        </motion.div>        
        <div className="relative flex flex-col justify-center max-w-5xl mx-auto px-4 sm:px-6 z-10 py-8 min-h-screen w-full">
          {/* Compact Header */}
          <motion.div 
            className="text-center mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >            <SketchHeading level={1} className="heading-primary-enhanced text-2xl sm:text-3xl mb-3">
              Let's{" "}
              <SketchHighlight color="dark">Create</SketchHighlight>
              {" "}Together
            </SketchHeading>
            <p className="body-text-secondary max-w-lg mx-auto">
              Have a project in mind? Let's start with a conversation.
            </p>
          </motion.div>

          {/* Main Content Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid md:grid-cols-2 gap-6 flex-1"
          >
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <SketchCard tilt="left" className={`h-full p-4 relative ${showErase ? 'animate-shake' : ''} ${shakeForm ? 'animate-shake' : ''}`}> {/* shake animation on erase/invalid */}
                <SketchHeading level={2} className="heading-secondary-enhanced text-lg mb-3">
                  Send a Message
                </SketchHeading>
                <form className="space-y-3" onSubmit={handleSubmit}>
                  <div>
                    <label htmlFor="contact-name" className="form-label-enhanced">
                      Name
                    </label>
                    <motion.input
                      id="contact-name"
                      name="name"
                      type="text"
                      className="w-full p-2 border-2 border-gray-300 rounded-lg form-input-enhanced text-focus-enhanced sketch-focus focus:border-gray-600 outline-none"
                      placeholder="Your name"
                      value={form.name}
                      onChange={handleChange}
                      disabled={status === 'sending'}
                      whileFocus={{ scale: 1.04, boxShadow: '0 0 0 2px #ffe066' }}
                      whileTap={{ scale: 1.02 }}
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-email" className="form-label-enhanced">
                      Email
                    </label>
                    <motion.input
                      id="contact-email"
                      name="email"
                      type="email"
                      className="w-full p-2 border-2 border-gray-300 rounded-lg form-input-enhanced text-focus-enhanced sketch-focus focus:border-gray-600 outline-none"
                      placeholder="your@email.com"
                      value={form.email}
                      onChange={handleChange}
                      disabled={status === 'sending'}
                      whileFocus={{ scale: 1.04, boxShadow: '0 0 0 2px #b2f0ff' }}
                      whileTap={{ scale: 1.02 }}
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-message" className="form-label-enhanced">
                      Message
                    </label>
                    <motion.textarea
                      id="contact-message"
                      name="message"
                      rows={3}
                      className="w-full p-2 border-2 border-gray-300 rounded-lg form-input-enhanced text-focus-enhanced sketch-focus focus:border-gray-600 outline-none resize-none"
                      placeholder="Tell me about your project..."
                      value={form.message}
                      onChange={handleChange}
                      disabled={status === 'sending'}
                      whileFocus={{ scale: 1.03, boxShadow: '0 0 0 2px #ffd6e0' }}
                      whileTap={{ scale: 1.01 }}
                    />
                  </div>
                  {/* Magic Eraser button */}
                  <motion.button
                    type="button"
                    className="absolute top-2 right-2 text-xs px-2 py-1 bg-white border rounded-full shadow handwritten flex items-center gap-1 hover:bg-pink-100 transition"
                    whileHover={{ scale: 1.1, rotate: -10 }}
                    onClick={handleErase}
                    aria-label="Clear form"
                  >
                    🧽 <span>Erase</span>
                  </motion.button>
                  {error && <div className="text-xs text-red-500 handwritten">{error}</div>}
                  {status === 'success' && <div className="text-xs text-green-600 handwritten">Thank you! I'll get back to you soon.</div>}
                  <div ref={confettiRef} style={{ position: 'absolute', left: '50%', top: '-2.5rem', transform: 'translateX(-50%)', fontSize: '2rem', pointerEvents: 'none', transition: 'all 1s cubic-bezier(.17,.67,.83,.67)', opacity: 0 }} />
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full relative"
                    onMouseEnter={() => setShowTooltip(s => ({ ...s, send: true }))}
                    onMouseLeave={() => setShowTooltip(s => ({ ...s, send: false }))}
                  >
                    <SketchButton
                      type="submit"
                      variant="primary"
                      className="w-full text-sm btn-primary-text relative overflow-hidden"
                      disabled={status === 'sending'}
                    >
                      {status === 'sending' ? 'Sending...' : 'Send Message 📧'}
                    </SketchButton>
                    <AnimatePresence>
                      {showTooltip.send && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute left-1/2 -top-10 -translate-x-1/2 bg-yellow-100 border border-yellow-300 px-3 py-1 rounded-lg shadow handwritten text-xs z-30"
                        >
                          🚀 Let's go!
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </form>
                {/* Extra floating doodle icons */} 
                <motion.div
                  className="absolute right-2 bottom-8 text-xl select-none"
                  animate={{ y: [0, 6, 0], rotate: [0, -8, 8, 0] }}
                  transition={{ duration: 5, repeat: Infinity }}
                  style={{ pointerEvents: 'none' }}
                >
                  🗒️
                </motion.div>
              </SketchCard>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="space-y-4"
            >
              {/* Direct Contact */}
              <SketchCard tilt="right" className="p-4">
                <SketchHeading level={3} className="heading-tertiary-enhanced text-base mb-3" underline={false}>
                  Direct Contact
                </SketchHeading>
                <div className="space-y-2">
                  <motion.div
                    className="flex items-center space-x-2 relative"
                    whileHover={{ scale: 1.05 }}
                    onMouseEnter={() => setShowTooltip(s => ({ ...s, email: true }))}
                    onMouseLeave={() => setShowTooltip(s => ({ ...s, email: false }))}
                  >
                    <span className="text-lg">📧</span>
                    <div>
                      <div className="body-text-primary text-xs font-bold">Email</div>
                      <div className="body-text-secondary text-xs flex items-center gap-2">
                        arunkumaar.srinivasan@gmail.com
                        <button
                          type="button"
                          className="ml-1 px-2 py-0.5 rounded bg-gray-100 border text-xs handwritten hover:bg-yellow-100 transition"
                          onClick={handleCopyEmail}
                          aria-label="Copy email"
                        >
                          {copied ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                    </div>
                    <AnimatePresence>
                      {showTooltip.email && (
                        <motion.div
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          className="absolute left-full top-0 ml-2 bg-yellow-100 border border-yellow-300 px-2 py-1 rounded-lg shadow handwritten text-xs z-30"
                        >
                          📋 Copy to clipboard!
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                  <motion.div
                    className="flex items-center space-x-2 relative"
                    whileHover={{ scale: 1.05 }}
                    onMouseEnter={() => setShowTooltip(s => ({ ...s, linkedin: true }))}
                    onMouseLeave={() => setShowTooltip(s => ({ ...s, linkedin: false }))}
                  >
                    <span className="text-lg">💼</span>
                    <div>
                      <div className="body-text-primary text-xs font-bold">LinkedIn</div>
                      <div className="body-text-secondary text-xs flex items-center gap-2">
                        /in/arunkumaarsreenivasan/
                        <button
                          type="button"
                          className="ml-1 px-2 py-0.5 rounded bg-blue-100 border text-xs handwritten hover:bg-blue-200 transition"
                          onClick={handleLinkedIn}
                          aria-label="Open LinkedIn"
                        >
                          Visit
                        </button>
                      </div>
                    </div>
                    <AnimatePresence>
                      {showTooltip.linkedin && (
                        <motion.div
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          className="absolute left-full top-0 ml-2 bg-blue-100 border border-blue-300 px-2 py-1 rounded-lg shadow handwritten text-xs z-30"
                        >
                          👋 Connect on LinkedIn!
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </div>
              </SketchCard>

              {/* What to Expect */}
              <SketchCard className="p-4">                <SketchHeading level={3} className="heading-tertiary-enhanced text-base mb-2" underline={false}>
                  What to Expect
                </SketchHeading>
                  <div className="space-y-1">
                  <div className="flex items-start space-x-2">
                    <span className="text-gray-800 text-sm">⚡</span>
                    <span className="handwritten text-xs text-gray-600">Quick response (24h)</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-gray-700 text-sm">🎯</span>
                    <span className="handwritten text-xs text-gray-600">Focused discussion</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-black text-sm">🚀</span>
                    <span className="handwritten text-xs text-gray-600">Clear next steps</span>
                  </div>
                </div>
              </SketchCard>

              {/* CTA */}
              <SketchCard className="p-4 text-center">
                <div className="handwritten text-lg mb-2">🤝</div>                <div className="handwritten text-gray-600 mb-3 text-xs">
                  Ready for a{" "}
                  <SketchHighlight color="muted">creative chat</SketchHighlight>?
                </div>
                <div className="flex gap-2 justify-center">
                  <SketchButton href="/work" variant="outline" className="text-xs px-3 py-1">
                    My Work
                  </SketchButton>
                  <SketchButton href="/about" variant="outline" className="text-xs px-3 py-1">
                    About Me
                  </SketchButton>
                </div>
              </SketchCard>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
