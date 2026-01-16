'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { PixelIcon } from '@/components/ui/PixelIcon';
import { Experience } from '@/data/portfolio-data';
import { formatExperiencePeriod } from '../utils/experienceMapping';
import { useState, useRef, useEffect } from 'react';

interface ExperienceDetailsModalProps {
  readonly experience: Experience | null;
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

export function ExperienceDetailsModal({
  experience,
  isOpen,
  onClose,
}: ExperienceDetailsModalProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Handle scroll progress
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || !isOpen) return;

    const updateScrollProgress = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const progress = scrollHeight > clientHeight 
        ? scrollTop / (scrollHeight - clientHeight) 
        : 0;
      setScrollProgress(Math.min(100, Math.max(0, progress * 100)));
    };

    container.addEventListener('scroll', updateScrollProgress);
    updateScrollProgress(); // Initial calculation

    return () => {
      container.removeEventListener('scroll', updateScrollProgress);
    };
  }, [isOpen]);

  if (!experience) return null;

  // Extract data for display
  const what = experience.position;
  const when = formatExperiencePeriod(experience);
  const how = experience.technologies || [];
  const where = `${experience.company}, ${experience.location}`;
  const why = experience.description;

  // Extract learnings, enhancements, and gains from achievements and responsibilities
  const learnt = experience.achievements?.slice(0, 5) || [];
  const enhanced = experience.responsibilities?.slice(0, 5) || [];
  const gained = experience.achievements?.slice(5, 10) || experience.achievements?.slice(0, 5) || [];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={onClose}
        >
          <motion.div
            className="max-w-5xl w-full max-h-[90vh] flex flex-col wireframe-border overflow-hidden"
            style={{
              borderWidth: 'var(--border-width)',
              borderColor: 'var(--border-color)',
              backgroundColor: 'var(--bg-card)',
              boxShadow:
                'var(--shadow-offset-x) var(--shadow-offset-y) var(--shadow-blur) var(--shadow-color)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              className="p-6 wireframe-border flex-shrink-0"
              style={{
                borderBottomWidth: 'var(--border-width)',
                borderColor: 'var(--border-color)',
                backgroundColor: 'var(--accent-color)',
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      backgroundColor: 'white',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <PixelIcon
                      name="star"
                      size={28}
                      style={{ color: 'var(--accent-color)' }}
                    />
                  </div>
                  <div>
                    <h3
                      className="font-mono text-3xl font-bold"
                      style={{ color: 'white' }}
                    >
                      {experience.position}
                    </h3>
                    <p
                      className="font-mono text-lg"
                      style={{ color: 'white', opacity: 0.9 }}
                    >
                      {experience.company}
                    </p>
                    <p
                      className="font-mono text-sm mt-1"
                      style={{ color: 'white', opacity: 0.8 }}
                    >
                      {experience.location} • {experience.type}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="px-4 py-2 font-mono text-sm wireframe-btn"
                  style={{
                    borderWidth: 'var(--border-width)',
                    borderColor: 'white',
                    backgroundColor: 'white',
                    color: 'var(--accent-color)',
                  }}
                >
                  CLOSE
                </button>
              </div>
            </div>

            {/* Content with Gamified Scrollbar */}
            <div className="relative flex-1 min-h-0 max-h-full">
              {/* Scroll Progress Indicator */}
              <div 
                className="absolute top-0 left-0 right-0 h-1 z-10 wireframe-border"
                style={{
                  borderBottomWidth: 'var(--border-width)',
                  borderColor: 'var(--border-color)',
                  backgroundColor: 'var(--bg-main)',
                }}
              >
                <div
                  className="h-full transition-all duration-150 ease-out"
                  style={{
                    width: `${scrollProgress}%`,
                    backgroundColor: 'var(--accent-color)',
                    boxShadow: '0 0 8px var(--accent-color)',
                  }}
                />
              </div>

              {/* Scrollable Content */}
              <div 
                ref={scrollContainerRef}
                className="p-6 space-y-6 overflow-y-auto flex-1 min-h-0 max-h-full gamified-scrollbar"
                style={{ paddingTop: 'calc(1.5rem + 4px)' }}
              >
              {/* Overview Section - What, When, Where */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* WHAT Section */}
                <div
                  className="wireframe-border p-4"
                  style={{
                    borderWidth: 'var(--border-width)',
                    borderColor: '#44FF44',
                    backgroundColor: 'var(--bg-main)',
                  }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">💼</span>
                    <h4 className="font-mono text-sm font-bold uppercase" style={{ color: '#44FF44' }}>
                      WHAT
                    </h4>
                  </div>
                  <p className="font-mono text-sm" style={{ color: 'var(--text-main)' }}>
                    {what}
                  </p>
                  {experience.responsibilities && experience.responsibilities.length > 0 && (
                    <ul className="mt-3 space-y-1">
                      {experience.responsibilities.map((resp, idx) => (
                        <li key={`resp-${idx}-${resp.substring(0, 20)}`} className="font-mono text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                          • {resp}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* WHEN Section */}
                <div
                  className="wireframe-border p-4"
                  style={{
                    borderWidth: 'var(--border-width)',
                    borderColor: '#FF4444',
                    backgroundColor: 'var(--bg-main)',
                  }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">📅</span>
                    <h4 className="font-mono text-sm font-bold uppercase" style={{ color: '#FF4444' }}>
                      WHEN
                    </h4>
                  </div>
                  <p className="font-mono text-sm" style={{ color: 'var(--text-main)' }}>
                    {when}
                  </p>
                  <p className="font-mono text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                    {experience.current ? 'Current Position' : 'Past Experience'}
                  </p>
                </div>

                {/* WHERE Section */}
                <div
                  className="wireframe-border p-4"
                  style={{
                    borderWidth: 'var(--border-width)',
                    borderColor: '#FFAA00',
                    backgroundColor: 'var(--bg-main)',
                  }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">📍</span>
                    <h4 className="font-mono text-sm font-bold uppercase" style={{ color: '#FFAA00' }}>
                      WHERE
                    </h4>
                  </div>
                  <p className="font-mono text-sm" style={{ color: 'var(--text-main)' }}>
                    {where}
                  </p>
                  <p className="font-mono text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                    {experience.type}
                  </p>
                </div>
              </div>

              {/* HOW Section */}
              <div
                className="wireframe-border p-4"
                style={{
                  borderWidth: 'var(--border-width)',
                  borderColor: '#4444FF',
                  backgroundColor: 'var(--bg-main)',
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">🔧</span>
                  <h4 className="font-mono text-sm font-bold uppercase" style={{ color: '#4444FF' }}>
                    HOW
                  </h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {how.map((tech, idx) => (
                    <span
                      key={`tech-${idx}-${tech}`}
                      className="px-2 py-1 font-mono text-xs wireframe-border"
                      style={{
                        borderWidth: 'var(--border-width)',
                        borderColor: '#4444FF',
                        backgroundColor: 'var(--bg-card)',
                        color: '#4444FF',
                      }}
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* WHY Section */}
              <div
                className="wireframe-border p-4"
                style={{
                  borderWidth: 'var(--border-width)',
                  borderColor: '#FF00FF',
                  backgroundColor: 'var(--bg-main)',
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">💡</span>
                  <h4 className="font-mono text-sm font-bold uppercase" style={{ color: '#FF00FF' }}>
                    WHY
                  </h4>
                </div>
                <p className="font-mono text-sm leading-relaxed" style={{ color: 'var(--text-main)' }}>
                  {why}
                </p>
              </div>

              {/* LEARNT, ENHANCED, GAINED Sections */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* LEARNT */}
                <div
                  className="wireframe-border p-4"
                  style={{
                    borderWidth: 'var(--border-width)',
                    borderColor: '#00FF00',
                    backgroundColor: 'var(--bg-main)',
                  }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">📚</span>
                    <h4 className="font-mono text-sm font-bold uppercase" style={{ color: '#00FF00' }}>
                      LEARNT
                    </h4>
                  </div>
                  <ul className="space-y-2">
                    {learnt.length > 0 ? (
                      learnt.map((item, idx) => (
                        <li key={`learnt-${idx}-${item.substring(0, 20)}`} className="font-mono text-xs leading-relaxed" style={{ color: 'var(--text-main)' }}>
                          • {item}
                        </li>
                      ))
                    ) : (
                      <li className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
                        Key learnings from this experience
                      </li>
                    )}
                  </ul>
                </div>

                {/* ENHANCED */}
                <div
                  className="wireframe-border p-4"
                  style={{
                    borderWidth: 'var(--border-width)',
                    borderColor: '#FFFF00',
                    backgroundColor: 'var(--bg-main)',
                  }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">⚡</span>
                    <h4 className="font-mono text-sm font-bold uppercase" style={{ color: '#FFFF00' }}>
                      ENHANCED
                    </h4>
                  </div>
                  <ul className="space-y-2">
                    {enhanced.length > 0 ? (
                      enhanced.map((item, idx) => (
                        <li key={`enhanced-${idx}-${item.substring(0, 20)}`} className="font-mono text-xs leading-relaxed" style={{ color: 'var(--text-main)' }}>
                          • {item}
                        </li>
                      ))
                    ) : (
                      <li className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
                        Skills and capabilities enhanced
                      </li>
                    )}
                  </ul>
                </div>

                {/* GAINED */}
                <div
                  className="wireframe-border p-4"
                  style={{
                    borderWidth: 'var(--border-width)',
                    borderColor: '#00FFFF',
                    backgroundColor: 'var(--bg-main)',
                  }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">🎯</span>
                    <h4 className="font-mono text-sm font-bold uppercase" style={{ color: '#00FFFF' }}>
                      GAINED
                    </h4>
                  </div>
                  <ul className="space-y-2">
                    {gained.length > 0 ? (
                      gained.map((item, idx) => (
                        <li key={`gained-${idx}-${item.substring(0, 20)}`} className="font-mono text-xs leading-relaxed" style={{ color: 'var(--text-main)' }}>
                          • {item}
                        </li>
                      ))
                    ) : (
                      <li className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
                        Achievements and gains
                      </li>
                    )}
                  </ul>
                </div>
              </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
