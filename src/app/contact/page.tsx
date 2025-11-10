'use client';

import CalScheduleEmbed from '@/components/ui/CalScheduleEmbed';
import { SketchHeading, SketchCard, SketchButton, SketchHighlight, StickyNote } from '@/components/ui/sketch-elements';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { useAnalytics } from '@/hooks/useAnalytics';

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
  '🧭 Share the problem you are solving.',
  '📆 Mention launch timelines or phases.',
  '🎯 What does success look like for you?',
  '🧑‍🤝‍🧑 Who will collaborate from your side?',
  '🖼️ Link any inspiration moodboards.',
  '💸 Budget ranges help tailor solutions.',
  '🧪 Tell me how you will measure impact.',
  '🌟 Dream features? Drop them in!',
];
const STICKY_COLORS = ['light', 'medium', 'dark', 'white'] as const;

const MOODS = [
  {
    id: 'chill',
    label: 'Chill Collaboration',
    icon: '🧊',
    description: 'We will keep it calm, thoughtful, and detail-oriented.',
    placeholder: 'Share your laid-back ideas and we will craft them together...'
  },
  {
    id: 'energetic',
    label: 'Energetic Sprint',
    icon: '⚡',
    description: 'Fast iterations, playful experiments, and high energy sessions.',
    placeholder: 'Pitch your most electric project vision here...'
  },
  {
    id: 'explorer',
    label: 'Exploration Mode',
    icon: '🧭',
    description: 'Perfect when you are still shaping the brief and want guided discovery.',
    placeholder: 'Describe the problem space and let us chart the path...'
  },
  {
    id: 'storyteller',
    label: 'Storyteller Vibes',
    icon: '📖',
    description: 'We will focus on narrative, emotion, and crafting memorable journeys.',
    placeholder: 'Tell me the story you want your users to experience...'
  },
] as const;

const PROJECT_SPARKS = [
  {
    id: 'spark-desk',
    title: 'Interactive Desk Tour',
    prompt: 'Let’s build a draggable workspace that reveals your process through playful doodles.',
    callout: 'Great for onboarding or portfolio storytelling.',
    icon: '🗂️'
  },
  {
    id: 'spark-companion',
    title: 'Tiny AI Companion',
    prompt: 'Imagine a hand-drawn assistant that guides visitors with helpful nudges.',
    callout: 'Ideal for support flows or product tours.',
    icon: '🤖'
  },
  {
    id: 'spark-ritual',
    title: 'Progress Ritual Tracker',
    prompt: 'Design a ritual board where users tick off milestones with satisfying animations.',
    callout: 'Blend habit loops with whimsical visuals.',
    icon: '🪄'
  },
  {
    id: 'spark-city',
    title: 'City Of Ideas',
    prompt: 'Transform your roadmap into a miniature city visitors can explore.',
    callout: 'Each building becomes a case study or launch note.',
    icon: '🏙️'
  }
] as const;

const PROJECT_TYPES = [
  {
    id: 'product',
    label: 'Product Experience',
    blurb: '— crafting immersive SaaS flows with thoughtful micro-interactions.'
  },
  {
    id: 'website',
    label: 'Website / Portfolio',
    blurb: 'to capture your story with a narrative-first, hand-drawn aesthetic.'
  },
  {
    id: 'brand',
    label: 'Brand & Identity',
    blurb: 'that blends strategy, visuals, and voice into one playful system.'
  },
  {
    id: 'consult',
    label: 'Design + Dev Consult',
    blurb: 'to audit flows, level up UX, or co-build new ideas with your team.'
  }
] as const;

const TIMELINES = [
  {
    id: 'fast',
    label: '2 – 4 Weeks',
    blurb: 'We are looking to move quickly and unlock tangible progress this month.'
  },
  {
    id: 'regular',
    label: '1 – 2 Months',
    blurb: 'We can make space for explorations while shipping steadily.'
  },
  {
    id: 'long',
    label: 'Quarterly',
    blurb: 'We are planning a multi-phase roadmap and want a long-term partner.'
  }
] as const;

const COLLAB_STYLES = [
  {
    id: 'jam',
    label: 'Jam Sessions',
    blurb: 'I imagine weekly workshops, Figma live-jams, and co-creation rituals.'
  },
  {
    id: 'async',
    label: 'Asynchronous',
    blurb: 'We value thoughtful async updates, Loom walkthroughs, and whiteboard notes.'
  },
  {
    id: 'hybrid',
    label: 'Hybrid Rhythm',
    blurb: 'Let’s mix live strategy calls with async experiments to keep momentum.'
  }
] as const;

const CHECKLIST_ITEMS = [
  { id: 'brief', label: 'Project summary deck or document' },
  { id: 'timeline', label: 'Preferred kickoff or launch timeline' },
  { id: 'stakeholders', label: 'Primary stakeholders & decision makers' },
  { id: 'budget', label: 'Budget range or constraints' },
  { id: 'assets', label: 'Existing brand or product assets' },
  { id: 'metrics', label: 'Success metrics you care about most' },
] as const;

const CAL_FLOATING_LINK = process.env.NEXT_PUBLIC_CAL_FLOATING
  ?? process.env.NEXT_PUBLIC_CAL_EVENT_30
  ?? 'arun-kumaar-sreenivasan-uihrg5/30min';

const CAL_EVENTS = [
  {
    id: '15',
    label: '15 min Quick Catch-up',
    description: 'Great for intros, rapid questions, or gut-checks.',
    slug: process.env.NEXT_PUBLIC_CAL_EVENT_15 ?? 'arun-kumaar-sreenivasan-uihrg5/15min',
  },
  {
    id: '30',
    label: '30 min Deep Dive',
    description: 'Perfect when you want to explore ideas or scope a project.',
    slug: process.env.NEXT_PUBLIC_CAL_EVENT_30 ?? 'arun-kumaar-sreenivasan-uihrg5/30min',
  },
];

type StickyNoteType = {
  id: string;
  tip: string;
  color: typeof STICKY_COLORS[number];
  x: number;
  y: number;
};

type MoodOption = typeof MOODS[number];
type ProjectSpark = typeof PROJECT_SPARKS[number];
type ProjectTypeOption = typeof PROJECT_TYPES[number];
type TimelineOption = typeof TIMELINES[number];
type CollabStyleOption = typeof COLLAB_STYLES[number];
type ChecklistItem = typeof CHECKLIST_ITEMS[number];

export default function Contact() {
  const { trackContactSubmission, trackInteraction } = useAnalytics();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  // Refactor tooltip state to support multiple tooltips
  const [showTooltip, setShowTooltip] = useState<{ email: boolean; linkedin: boolean; send: boolean; phone: boolean }>({ email: false, linkedin: false, send: false, phone: false });
  const [showErase, setShowErase] = useState(false);
  const [stickyNotes, setStickyNotes] = useState<StickyNoteType[]>(
    [
      { id: 'note-1', tip: STICKY_TIPS[0], color: 'light', x: 40, y: 120 },
      { id: 'note-2', tip: STICKY_TIPS[1], color: 'medium', x: 220, y: 140 },
    ]
  );
  const [activeMood, setActiveMood] = useState<MoodOption>(MOODS[0]);
  const [currentSpark, setCurrentSpark] = useState<ProjectSpark>(PROJECT_SPARKS[0]);
  const [projectType, setProjectType] = useState<ProjectTypeOption>(PROJECT_TYPES[0]);
  const [timeline, setTimeline] = useState<TimelineOption>(TIMELINES[1]);
  const [collabStyle, setCollabStyle] = useState<CollabStyleOption>(COLLAB_STYLES[2]);
  const [checklistState, setChecklistState] = useState<Record<ChecklistItem['id'], boolean>>(() => {
    return CHECKLIST_ITEMS.reduce((acc, item) => {
      acc[item.id] = false;
      return acc;
    }, {} as Record<ChecklistItem['id'], boolean>);
  });
  const [messageTouched, setMessageTouched] = useState(false);
  const [showConversationStarter, setShowConversationStarter] = useState(true);
  const confettiRef = useRef<HTMLDivElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const mailOptionsRef = useRef<HTMLDivElement>(null);
  const [mailDraft, setMailDraft] = useState<{ subject: string; body: string } | null>(null);
  const [showMailOptions, setShowMailOptions] = useState(false);

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

  // Helper to update sticky note position
  const moveStickyNote = (id: string, x: number, y: number) => {
    setStickyNotes(notes => notes.map(n => n.id === id ? { ...n, x, y } : n));
  };
  // Helper to remove sticky note
  const removeStickyNote = (id: string) => {
    setStickyNotes(notes => notes.filter(n => n.id !== id));
  };

  const handleMoodSelect = (mood: MoodOption) => {
    setActiveMood(mood);
    trackInteraction('contact_vibe_selected', { moodId: mood.id });
  };

  const handleSparkRefresh = () => {
    const available = PROJECT_SPARKS.filter(spark => spark.id !== currentSpark.id);
    const nextSpark = available[Math.floor(Math.random() * available.length)] || PROJECT_SPARKS[0];
    setCurrentSpark(nextSpark);
    trackInteraction('contact_idea_spark_refresh', { sparkId: nextSpark.id });
  };

  const handleProjectTypeSelect = (option: ProjectTypeOption) => {
    setProjectType(option);
    trackInteraction('contact_project_type_select', { projectType: option.id });
  };

  const handleTimelineSelect = (option: TimelineOption) => {
    setTimeline(option);
    trackInteraction('contact_timeline_select', { timeline: option.id });
  };

  const handleCollabSelect = (option: CollabStyleOption) => {
    setCollabStyle(option);
    trackInteraction('contact_collab_style_select', { collabStyle: option.id });
  };

  const toggleChecklistItem = (item: ChecklistItem) => {
    setChecklistState(prev => {
      const updated = { ...prev, [item.id]: !prev[item.id] };
      trackInteraction('contact_checklist_toggle', { itemId: item.id, value: updated[item.id] });
      return updated;
    });
  };

  const checklistCompleted = Object.values(checklistState).filter(Boolean).length;

  const conversationPreview = `Hi Arun! I'm exploring a ${projectType.label.toLowerCase()} project ${projectType.blurb}
${timeline.blurb}
${collabStyle.blurb}
Looking forward to hearing how we can collaborate.`;

  const handleApplyTemplate = () => {
    const templateText = conversationPreview.trim();
    setForm(prev => {
      const shouldAppend = messageTouched && prev.message.trim().length > 0;
      const base = shouldAppend ? prev.message.trimEnd() : '';
      const nextMessage = shouldAppend ? `${base}

${templateText}` : templateText;
      return { ...prev, message: nextMessage };
    });
    setMessageTouched(true);
    trackInteraction('contact_template_apply', {
      projectType: projectType.id,
      timeline: timeline.id,
      collabStyle: collabStyle.id,
    });
  };

  const handlePastePreview = () => {
    const templateText = conversationPreview.trim();
    setForm(prev => ({ ...prev, message: templateText }));
    setMessageTouched(true);
    messageRef.current?.focus();
    trackInteraction('contact_template_paste', {
      projectType: projectType.id,
      timeline: timeline.id,
      collabStyle: collabStyle.id,
    });
  };

  const MESSAGE_GOAL = 220;
  const messageLength = form.message.trim().length;
  const wordsCount = form.message.trim().length ? form.message.trim().split(/\s+/).length : 0;
  const progressRatio = Math.min(1, messageLength / MESSAGE_GOAL);
  const progressPercent = Math.round(progressRatio * 100);
  const progressWidth = progressPercent === 0 ? 4 : progressPercent;
  const guidanceMessage = progressPercent < 35
    ? 'A little more context helps me craft a sharper reply.'
    : progressPercent < 90
      ? 'Nice! Add any links or outcomes and we are good to go.'
      : 'Strong brief! Ready when you are.';

  // Enhanced confetti burst
  // Enhanced confetti burst
  const triggerConfetti = () => {
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
      }, 1200);
    }
  };
  // Shake animation on invalid submit
  const [shakeForm, setShakeForm] = useState(false);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.name || !form.email || !form.message) {
      setError('Please fill in all fields.');
      setShakeForm(true);
      setTimeout(() => setShakeForm(false), 500);
      return;
    }

    const subject = `Project conversation with ${form.name}`;
    const summary = [
      `Project focus: ${projectType.label}`,
      `Timeline: ${timeline.label}`,
      `Collaboration style: ${collabStyle.label}`,
    ].join('\n');

    const body = `Hi Arun,\n\n${form.message}\n\n---\nContact details\nName: ${form.name}\nEmail: ${form.email}\n\nQuick context\n${summary}\n\nSent via kiruk.in contact page.`;

    setMailDraft({ subject, body });
    setShowMailOptions(true);
    trackInteraction('contact_mail_options_ready', {
      hasName: !!form.name,
      hasEmail: !!form.email,
      messageLength: form.message.length,
    });

    setTimeout(() => {
      mailOptionsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 120);
  };

  const openMailProvider = (provider: 'gmail' | 'outlook' | 'other') => {
    if (!mailDraft) return;

    const to = 'arunkumaar.srinivasan@gmail.com';
    const encodedTo = encodeURIComponent(to);
    const encodedSubject = encodeURIComponent(mailDraft.subject);
    const encodedBody = encodeURIComponent(mailDraft.body);

    let url: string;
    if (provider === 'gmail') {
      url = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodedTo}&su=${encodedSubject}&body=${encodedBody}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    } else if (provider === 'outlook') {
      url = `https://outlook.office.com/mail/deeplink/compose?to=${encodedTo}&subject=${encodedSubject}&body=${encodedBody}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      url = `mailto:${to}?subject=${encodedSubject}&body=${encodedBody}`;
      window.location.href = url;
    }

    triggerConfetti();
    trackContactSubmission();
    trackInteraction('contact_mail_launch', { provider });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(null);
    if (e.target.name === 'message' && !messageTouched) {
      setMessageTouched(true);
    }
  };

  const handleCopyEmail = async () => {
    const email = 'arunkumaar.srinivasan@gmail.com';
    
    try {
      // Try modern clipboard API first
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(email);
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      } else {
        // Fallback for older browsers or non-secure contexts
        console.warn('Clipboard API not available, showing email for manual copy');
        alert(`Please copy this email manually: ${email}`);
      }
    } catch (err) {
      console.warn('Clipboard access failed:', err);
      // Show the email in an alert as fallback
      alert(`Please copy this email manually: ${email}`);
    }
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
    setMessageTouched(false);
    setShowMailOptions(false);
    setMailDraft(null);
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
      {/* Single viewport section */}
      <section className="relative min-h-screen pb-28 flex flex-col">
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
        <div className="relative flex flex-col justify-center max-w-5xl mx-auto px-4 sm:px-6 z-10 py-8 pb-24 min-h-screen w-full">
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
              <SketchCard tilt="left" className={`p-3 relative ${showErase ? 'animate-shake' : ''} ${shakeForm ? 'animate-shake' : ''}`}> {/* shake animation on erase/invalid */}
                <SketchHeading level={2} className="heading-secondary-enhanced text-lg mb-3">
                  Send a Message
                </SketchHeading>
                <form className="space-y-2" onSubmit={handleSubmit} noValidate>
                  <div>
                    <label htmlFor="contact-name" className="form-label-enhanced">
                      Name <span className="text-red-500" aria-label="required">*</span>
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
                      required
                      aria-required="true"
                      aria-invalid={error && !form.name ? 'true' : 'false'}
                      aria-describedby={error && !form.name ? 'name-error' : undefined}
                      whileFocus={{ scale: 1.04, boxShadow: '0 0 0 2px #ffe066' }}
                      whileTap={{ scale: 1.02 }}
                    />
                    {error && !form.name && (
                      <div id="name-error" className="text-xs text-red-500 handwritten mt-1" role="alert">
                        Name is required
                      </div>
                    )}
                  </div>
                  <div>
                    <label htmlFor="contact-email" className="form-label-enhanced">
                      Email <span className="text-red-500" aria-label="required">*</span>
                    </label>
                    <motion.input
                      id="contact-email"
                      name="email"
                      type="email"
                      className="w-full p-2 border-2 border-gray-300 rounded-lg form-input-enhanced text-focus-enhanced sketch-focus focus:border-black outline-none"
                      placeholder="your@email.com"
                      value={form.email}
                      onChange={handleChange}
                      disabled={status === 'sending'}
                      required
                      aria-required="true"
                      aria-invalid={error && !form.email ? 'true' : 'false'}
                      aria-describedby={error && !form.email ? 'email-error' : undefined}
                      whileFocus={{ scale: 1.04, boxShadow: '0 0 0 2px #b2f0ff' }}
                      whileTap={{ scale: 1.02 }}
                    />
                    {error && !form.email && (
                      <div id="email-error" className="text-xs text-red-500 handwritten mt-1" role="alert">
                        Email is required
                      </div>
                    )}
                  </div>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl bg-white/60 p-3 mt-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="handwritten text-xs text-gray-600">Conversation Starter</span>
                      <div className="flex items-center gap-2">
                        <motion.button
                          type="button"
                          onClick={handleApplyTemplate}
                          className="px-2 py-1 border border-gray-300 rounded-lg text-[11px] handwritten bg-white hover:bg-yellow-100 transition"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.96 }}
                        >
                          ✍️ Use template
                        </motion.button>
                        <motion.button
                          type="button"
                          onClick={() => setShowConversationStarter(prev => !prev)}
                          className="px-2 py-1 border border-gray-300 rounded-lg text-[11px] handwritten bg-white hover:bg-gray-100 transition"
                          whileHover={{ scale: 1.04 }}
                          whileTap={{ scale: 0.95 }}
                          aria-expanded={showConversationStarter}
                        >
                          {showConversationStarter ? 'Hide options' : 'Customize'}
                        </motion.button>
                      </div>
                    </div>
                    {!showConversationStarter && (
                      <div className="mt-2 flex items-center justify-between gap-2 text-[11px] text-gray-500 handwritten">
                        <span>{projectType.label} · {timeline.label} · {collabStyle.label}</span>
                        <motion.button
                          type="button"
                          onClick={handlePastePreview}
                          className="px-2 py-0.5 border border-gray-300 rounded-lg text-[10px] bg-white hover:bg-yellow-100 transition"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Paste below
                        </motion.button>
                      </div>
                    )}
                    <AnimatePresence initial={false}>
                      {showConversationStarter && (
                        <motion.div
                          key="conversation-settings"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-3 space-y-3">
                            <div>
                              <span className="block text-[11px] uppercase tracking-[0.12em] text-gray-500 handwritten">Project focus</span>
                              <div className="mt-1 flex flex-wrap gap-2">
                                {PROJECT_TYPES.map(option => {
                                  const active = projectType.id === option.id;
                                  return (
                                    <motion.button
                                      key={option.id}
                                      type="button"
                                      onClick={() => handleProjectTypeSelect(option)}
                                      className={`px-2.5 py-1.5 rounded-lg border-2 text-xs handwritten transition ${
                                        active ? 'bg-indigo-100 border-indigo-400 text-indigo-800' : 'bg-white border-gray-200 hover:border-gray-400 text-gray-700'
                                      }`}
                                      whileTap={{ scale: 0.95 }}
                                      whileHover={{ scale: 1.03 }}
                                      aria-pressed={active}
                                    >
                                      {option.label}
                                    </motion.button>
                                  );
                                })}
                              </div>
                            </div>
                            <div>
                              <span className="block text-[11px] uppercase tracking-[0.12em] text-gray-500 handwritten">Timeline</span>
                              <div className="mt-1 flex flex-wrap gap-2">
                                {TIMELINES.map(option => {
                                  const active = timeline.id === option.id;
                                  return (
                                    <motion.button
                                      key={option.id}
                                      type="button"
                                      onClick={() => handleTimelineSelect(option)}
                                      className={`px-2.5 py-1.5 rounded-lg border-2 text-xs handwritten transition ${
                                        active ? 'bg-green-100 border-green-400 text-green-800' : 'bg-white border-gray-200 hover:border-gray-400 text-gray-700'
                                      }`}
                                      whileTap={{ scale: 0.95 }}
                                      whileHover={{ scale: 1.03 }}
                                      aria-pressed={active}
                                    >
                                      {option.label}
                                    </motion.button>
                                  );
                                })}
                              </div>
                            </div>
                            <div>
                              <span className="block text-[11px] uppercase tracking-[0.12em] text-gray-500 handwritten">Collaboration style</span>
                              <div className="mt-1 flex flex-wrap gap-2">
                                {COLLAB_STYLES.map(option => {
                                  const active = collabStyle.id === option.id;
                                  return (
                                    <motion.button
                                      key={option.id}
                                      type="button"
                                      onClick={() => handleCollabSelect(option)}
                                      className={`px-2.5 py-1.5 rounded-lg border-2 text-xs handwritten transition ${
                                        active ? 'bg-purple-100 border-purple-400 text-purple-800' : 'bg-white border-gray-200 hover:border-gray-400 text-gray-700'
                                      }`}
                                      whileTap={{ scale: 0.95 }}
                                      whileHover={{ scale: 1.03 }}
                                      aria-pressed={active}
                                    >
                                      {option.label}
                                    </motion.button>
                                  );
                                })}
                              </div>
                            </div>
                            <div className="bg-gray-50/80 border border-dashed border-gray-300 rounded-lg p-3 text-xs handwritten text-gray-600 leading-snug">
                              <div className="flex items-center justify-between gap-2 mb-2 text-[11px] uppercase tracking-[0.12em] text-gray-500">
                                <span className="text-[10px]">Generated brief</span>
                                <motion.button
                                  type="button"
                                  onClick={handlePastePreview}
                                  className="px-2 py-0.5 border border-gray-300 rounded-lg text-[10px] bg-white hover:bg-yellow-100 transition"
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  Paste below
                                </motion.button>
                              </div>
                              <div className="space-y-1">
                                {conversationPreview.split('\n').map((line, idx) => (
                                  <p key={idx} className="mb-1 last:mb-0">{line}</p>
                                ))}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <div>
                    <label htmlFor="contact-message" className="form-label-enhanced">
                      Message <span className="text-red-500" aria-label="required">*</span>
                    </label>
                    <motion.textarea
                      id="contact-message"
                      name="message"
                      rows={3}
                      className="w-full p-2 border-2 border-gray-300 rounded-lg form-input-enhanced text-focus-enhanced sketch-focus focus:border-gray-600 outline-none resize-none"
                      placeholder={activeMood.placeholder}
                      value={form.message}
                      ref={messageRef}
                      onChange={handleChange}
                      disabled={status === 'sending'}
                      required
                      aria-required="true"
                      aria-invalid={error && !form.message ? 'true' : 'false'}
                      aria-describedby={error && !form.message ? 'message-error' : undefined}
                      whileFocus={{ scale: 1.03, boxShadow: '0 0 0 2px #ffd6e0' }}
                      whileTap={{ scale: 1.01 }}
                    />
                    {error && !form.message && (
                      <div id="message-error" className="text-xs text-red-500 handwritten mt-1" role="alert">
                        Message is required
                      </div>
                    )}
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-[11px] text-gray-500 handwritten">
                        <span>{wordsCount} words · {messageLength} chars</span>
                        <span>{guidanceMessage}</span>
                      </div>
                      <div className="mt-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-indigo-400"
                          initial={false}
                          animate={{ width: `${progressWidth}%` }}
                          transition={{ type: 'spring', stiffness: 160, damping: 20 }}
                        />
                      </div>
                    </div>
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
                  {error && (
                    <div className="text-xs text-red-500 handwritten" role="alert" aria-live="polite">
                      {error}
                    </div>
                  )}
                  {showMailOptions && mailDraft && (
                    <div className="text-xs text-indigo-700 handwritten" role="alert" aria-live="polite">
                      Choose your email app below to send the draft.
                    </div>
                  )}
                  <div ref={confettiRef} style={{ position: 'absolute', left: '50%', top: '-2.5rem', transform: 'translateX(-50%)', fontSize: '2rem', pointerEvents: 'none', transition: 'all 1s cubic-bezier(.17,.67,.83,.67)', opacity: 0 }} aria-hidden="true" />
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
                      className="w-full text-sm btn-primary-text relative overflow-hidden focus-enhanced"
                      disabled={status === 'sending'}
                      aria-describedby={status === 'sending' ? 'sending-status' : undefined}
                    >
                      {status === 'sending' ? 'Sending...' : 'Send Message 📧'}
                      {status === 'sending' && (
                        <span id="sending-status" className="sr-only">
                          Form is being submitted, please wait
                        </span>
                      )}
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
                <AnimatePresence>
                  {showMailOptions && mailDraft && (
                    <motion.div
                      key="mail-options"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 12 }}
                      transition={{ duration: 0.25 }}
                      className="mt-4 border-2 border-dashed border-gray-300 rounded-xl bg-white/70 p-4 space-y-3"
                      ref={mailOptionsRef}
                    >
                      <div className="flex items-center justify-between">
                        <span className="handwritten text-sm text-gray-700">Send this draft with your favorite email app.</span>
                        <motion.button
                          type="button"
                          onClick={() => { setShowMailOptions(false); setMailDraft(null); }}
                          className="px-3 py-1 border border-gray-300 rounded-lg text-[11px] handwritten bg-white hover:bg-gray-100 transition"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Close
                        </motion.button>
                      </div>
                      <div className="grid sm:grid-cols-3 gap-3">
                        <motion.button
                          type="button"
                          onClick={() => openMailProvider('gmail')}
                          className="px-3 py-2 border-2 border-amber-300 rounded-xl bg-amber-50 handwritten text-sm text-gray-800 hover:bg-amber-100 transition text-left"
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.96 }}
                        >
                          📧 Open in Gmail
                        </motion.button>
                        <motion.button
                          type="button"
                          onClick={() => openMailProvider('outlook')}
                          className="px-3 py-2 border-2 border-sky-300 rounded-xl bg-sky-50 handwritten text-sm text-gray-800 hover:bg-sky-100 transition text-left"
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.96 }}
                        >
                          💼 Open in Outlook
                        </motion.button>
                        <motion.button
                          type="button"
                          onClick={() => openMailProvider('other')}
                          className="px-3 py-2 border-2 border-gray-300 rounded-xl bg-white handwritten text-sm text-gray-800 hover:bg-gray-100 transition text-left"
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.96 }}
                        >
                          ✉️ Other email apps
                        </motion.button>
                      </div>
                      <div className="bg-white border border-dashed border-gray-200 rounded-lg p-3">
                        <div className="handwritten text-xs text-gray-600 leading-snug select-text">
                          {mailDraft.body.split('\n').map((line, idx) => (
                            <p key={idx}>{line || ' '}</p>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
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
              <SketchCard tilt="left" className="p-3 mt-4">
                <SketchHeading level={2} className="heading-secondary-enhanced text-lg mb-3">
                  Book A Call
                </SketchHeading>
                <p className="handwritten text-xs text-gray-600 mb-4">
                  Grab a quick 15 minute intro or dive deeper for 30 minutes. Pick what suits you and we will jam.
                </p>
                <CalScheduleEmbed events={CAL_EVENTS} primaryColor="#000000" theme="light" />
              </SketchCard>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="space-y-4 pb-16"
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
                        <span className="mr-2">arunkumaar.srinivasan@gmail.com</span>
                        <span>
                          <button
                            type="button"
                            className="px-2 py-0.5 rounded bg-gray-100 border text-xs handwritten hover:bg-yellow-100 transition"
                            onClick={handleCopyEmail}
                            aria-label="Copy email"
                          >
                            {copied ? 'Copied!' : 'Copy'}
                          </button>
                        </span>
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
                    onMouseEnter={() => setShowTooltip(s => ({ ...s, phone: true }))}
                    onMouseLeave={() => setShowTooltip(s => ({ ...s, phone: false }))}
                  >
                    <span className="text-lg">📞</span>
                    <div>
                      <div className="body-text-primary text-xs font-bold">Phone / WhatsApp</div>
                      <div className="body-text-secondary text-xs flex items-center gap-2">
                        <span className="mr-2">+91 94865 82579</span>
                        <div className="flex gap-1">
                          <button
                            type="button"
                            className="px-2 py-0.5 rounded bg-green-100 border text-xs handwritten hover:bg-green-200 transition"
                            onClick={() => {
                              trackInteraction('contact_phone_call_click');
                              window.location.href = 'tel:+919486582579';
                            }}
                            aria-label="Call Arun"
                          >
                            Call
                          </button>
                          <button
                            type="button"
                            className="px-2 py-0.5 rounded bg-emerald-100 border text-xs handwritten hover:bg-emerald-200 transition"
                            onClick={() => {
                              trackInteraction('contact_whatsapp_click');
                              window.open('https://wa.me/919486582579', '_blank');
                            }}
                            aria-label="WhatsApp Arun"
                          >
                            WhatsApp
                          </button>
                        </div>
                      </div>
                    </div>
                    <AnimatePresence>
                      {showTooltip.phone && (
                        <motion.div
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          className="absolute left-full top-0 ml-2 bg-green-100 border border-green-300 px-2 py-1 rounded-lg shadow handwritten text-xs z-30"
                        >
                          📱 Call or ping me anytime!
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
                        <span>/in/arunkumaarsreenivasan/</span>
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

              {/* Vibe Selector */}
              <SketchCard className="p-4">
                <SketchHeading level={3} className="heading-tertiary-enhanced text-base mb-2" underline={false}>
                  Pick The Vibe
                </SketchHeading>
                <div className="grid grid-cols-2 gap-2">
                  {MOODS.map(mood => {
                    const isActive = activeMood.id === mood.id;
                    return (
                      <motion.button
                        key={mood.id}
                        type="button"
                        onClick={() => handleMoodSelect(mood)}
                        className={`px-3 py-2 border-2 rounded-xl text-left handwritten text-xs flex flex-col gap-1 transition shadow-sm focus:outline-none ${
                          isActive ? 'bg-yellow-100 border-yellow-400' : 'bg-white border-gray-300 hover:border-gray-500'
                        }`}
                        whileHover={{ rotate: isActive ? 0 : 1, scale: isActive ? 1.02 : 1.04 }}
                        whileTap={{ scale: 0.97 }}
                        aria-pressed={isActive}
                      >
                        <span className="flex items-center gap-2 text-sm">
                          <span className="text-base">{mood.icon}</span>
                          <span className="font-semibold text-gray-700">{mood.label}</span>
                        </span>
                        <span className="text-gray-600 leading-snug">{mood.description}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </SketchCard>

              {/* Idea Spark Generator */}
              <SketchCard className="p-4 relative overflow-hidden">
                <SketchHeading level={3} className="heading-tertiary-enhanced text-base mb-3" underline={false}>
                  Idea Spark Generator
                </SketchHeading>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSpark.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4 }}
                    className="bg-white/80 border border-dashed border-gray-300 rounded-xl p-3 handwritten text-xs text-gray-700 flex flex-col gap-2"
                  >
                    <div className="flex items-center gap-2 text-sm text-gray-800 font-semibold">
                      <span>{currentSpark.icon}</span>
                      <span>{currentSpark.title}</span>
                    </div>
                    <p className="leading-snug">{currentSpark.prompt}</p>
                    <p className="text-gray-500">{currentSpark.callout}</p>
                  </motion.div>
                </AnimatePresence>
                <motion.button
                  type="button"
                  onClick={handleSparkRefresh}
                  className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-purple-100 border border-purple-300 rounded-lg handwritten text-xs text-purple-700 hover:bg-purple-200 transition"
                  whileHover={{ scale: 1.05, rotate: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  🔄 New Spark
                </motion.button>
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

              {/* Collaboration Checklist */}
              <SketchCard className="p-4">
                <SketchHeading level={3} className="heading-tertiary-enhanced text-base mb-2" underline={false}>
                  Collaboration Checklist
                </SketchHeading>
                <p className="handwritten text-xs text-gray-600 mb-3">
                  Toggle what you already have ready. I will tailor my reply around the gaps.
                </p>
                <div className="space-y-2">
                  {CHECKLIST_ITEMS.map(item => {
                    const isChecked = checklistState[item.id];
                    return (
                      <motion.button
                        key={item.id}
                        type="button"
                        onClick={() => toggleChecklistItem(item)}
                        className={`w-full flex items-center justify-between px-3 py-2 border-2 rounded-xl text-left handwritten text-xs transition ${
                          isChecked ? 'bg-green-100 border-green-400 text-green-800' : 'bg-white border-gray-300 hover:border-gray-500 text-gray-700'
                        }`}
                        whileTap={{ scale: 0.97 }}
                        whileHover={{ scale: 1.02 }}
                        aria-pressed={isChecked}
                      >
                        <span className="flex items-center gap-2">
                          <span className="text-base">{isChecked ? '✅' : '⬜'}</span>
                          <span>{item.label}</span>
                        </span>
                        <span className="text-[11px] text-gray-500">
                          {isChecked ? 'Ready' : 'Need it'}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
                <div className="mt-3 text-center text-xs text-gray-600 handwritten">
                  {checklistCompleted === 0
                    ? 'No worries if nothing is ready yet. I can help you shape everything.'
                    : `${checklistCompleted} item${checklistCompleted > 1 ? 's' : ''} ready · ${CHECKLIST_ITEMS.length - checklistCompleted} to explore together.`}
                </div>
              </SketchCard>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
