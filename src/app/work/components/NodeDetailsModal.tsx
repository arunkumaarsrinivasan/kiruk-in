'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { PixelIcon } from '@/components/ui/PixelIcon';
import { Skill, EXPERTISE_COLORS, EXPERTISE_LABELS, CONSTELLATIONS } from '../utils/skillData';

interface NodeDetailsModalProps {
  skill: Skill | null;
  isOpen: boolean;
  onClose: () => void;
  relatedSkills?: Skill[];
}

export function NodeDetailsModal({
  skill,
  isOpen,
  onClose,
  relatedSkills = [],
}: NodeDetailsModalProps) {
  if (!skill) return null;

  const constellation = CONSTELLATIONS.find((c) =>
    c.skills.some((s) => s.id === skill.id)
  );
  const expertiseColor = EXPERTISE_COLORS[skill.expertise];
  const expertiseLabel = EXPERTISE_LABELS[skill.expertise];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="max-w-2xl w-full max-h-[90vh] overflow-y-auto wireframe-border"
            style={{
              borderWidth: 'var(--border-width)',
              borderColor: 'var(--border-color)',
              backgroundColor: 'var(--bg-card)',
              boxShadow:
                'var(--shadow-offset-x) var(--shadow-offset-y) var(--shadow-blur) var(--shadow-color)',
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              className="p-4 wireframe-border"
              style={{
                borderBottomWidth: 'var(--border-width)',
                borderColor: 'var(--border-color)',
                backgroundColor: expertiseColor,
              }}
            >
              <div className="flex items-center gap-4">
                <div
                  style={{
                    width: 40,
                    height: 40,
                    backgroundColor: 'white',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <PixelIcon
                    name="star"
                    size={24}
                    style={{ color: expertiseColor }}
                  />
                </div>
                <div>
                  <h3
                    className="font-mono text-2xl font-bold"
                    style={{ color: 'white' }}
                  >
                    {skill.name}
                  </h3>
                  <p
                    className="font-mono text-sm"
                    style={{ color: 'white', opacity: 0.9 }}
                  >
                    {expertiseLabel}
                  </p>
                  {constellation && (
                    <p
                      className="font-mono text-xs mt-1"
                      style={{ color: 'white', opacity: 0.8 }}
                    >
                      {constellation.westernName}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Constellation Info */}
              {constellation && (
                <div className="mb-6">
                  <div
                    className="p-4 wireframe-border"
                    style={{
                      borderWidth: 'var(--border-width)',
                      borderColor: constellation.color,
                      backgroundColor: 'var(--bg-main)',
                    }}
                  >
                    <h4
                      className="font-mono text-sm font-bold uppercase mb-2"
                      style={{ color: constellation.color }}
                    >
                      Constellation: {constellation.westernName}
                    </h4>
                    <p
                      className="font-mono text-xs"
                      style={{ color: 'var(--text-main)' }}
                    >
                      {constellation.description}
                    </p>
                  </div>
                </div>
              )}

              {/* Expertise Level */}
              <div className="mb-6">
                <h4
                  className="font-mono text-sm font-bold uppercase mb-3"
                  style={{ color: 'var(--text-main)' }}
                >
                  Expertise Level
                </h4>
                <div
                  className="p-4 wireframe-border flex items-center gap-4"
                  style={{
                    borderWidth: 'var(--border-width)',
                    borderColor: 'var(--border-color)',
                    backgroundColor: 'var(--bg-main)',
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      backgroundColor: expertiseColor,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <PixelIcon name="star" size={20} style={{ color: 'white' }} />
                  </div>
                  <div>
                    <p
                      className="font-mono text-lg font-bold"
                      style={{ color: expertiseColor }}
                    >
                      {expertiseLabel}
                    </p>
                    <p
                      className="font-mono text-xs"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      Skill proficiency level
                    </p>
                  </div>
                </div>
              </div>

              {/* Related Skills */}
              {relatedSkills.length > 0 && (
                <div className="mb-6">
                  <h4
                    className="font-mono text-sm font-bold uppercase mb-3"
                    style={{ color: 'var(--text-main)' }}
                  >
                    Connected Skills
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {relatedSkills.map((related) => {
                      const relatedColor = EXPERTISE_COLORS[related.expertise];
                      return (
                        <div
                          key={related.id}
                          className="p-3 wireframe-border"
                          style={{
                            borderWidth: 'var(--border-width)',
                            borderColor: relatedColor,
                            backgroundColor: 'var(--bg-main)',
                          }}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <div
                              style={{
                                width: 16,
                                height: 16,
                                backgroundColor: relatedColor,
                                borderRadius: '50%',
                              }}
                            />
                            <p
                              className="font-mono text-sm font-bold"
                              style={{ color: 'var(--text-main)' }}
                            >
                              {related.name}
                            </p>
                          </div>
                          <p
                            className="font-mono text-xs"
                            style={{ color: 'var(--text-muted)' }}
                          >
                            {EXPERTISE_LABELS[related.expertise]}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div
              className="p-4 flex justify-center"
              style={{
                borderTopWidth: 'var(--border-width)',
                borderColor: 'var(--border-color)',
              }}
            >
              <button
                onClick={onClose}
                className="px-8 py-3 font-mono text-xl transition-all wireframe-btn"
                style={{
                  borderWidth: 'var(--border-width)',
                  borderColor: 'var(--border-color)',
                  backgroundColor: 'var(--accent-color)',
                  color: 'var(--bg-main)',
                  boxShadow:
                    'var(--shadow-offset-x) var(--shadow-offset-y) var(--shadow-blur) var(--shadow-color)',
                }}
              >
                CLOSE{' '}
                <PixelIcon
                  name="window-close"
                  size={20}
                  style={{ color: 'var(--bg-main)' }}
                />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
