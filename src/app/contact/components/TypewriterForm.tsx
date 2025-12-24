'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';

interface TypewriterFormProps {
  form: { name: string; email: string; message: string };
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  error: string | null;
  unlocked: {
    name: boolean;
    email: boolean;
    message: boolean;
  };
}

const GRID_SIZE = 20;
const PIXEL_SIZE = 3;

// Typewriter sprite
const typewriterSprite = {
  width: 40,
  height: 24,
  pixels: [
    // Simplified typewriter representation
    Array(40).fill('#333'),
    Array(40).fill('#333'),
    ['#333', ...Array(38).fill('#666'), '#333'],
    ['#333', '#666', ...Array(36).fill('#999'), '#666', '#333'],
    ['#333', '#666', '#999', ...Array(34).fill('#CCC'), '#999', '#666', '#333'],
    ['#333', '#666', '#999', '#CCC', ...Array(32).fill('#FFF'), '#CCC', '#999', '#666', '#333'],
    ['#333', '#666', '#999', '#CCC', ...Array(32).fill('#FFF'), '#CCC', '#999', '#666', '#333'],
    ['#333', '#666', '#999', '#CCC', ...Array(32).fill('#FFF'), '#CCC', '#999', '#666', '#333'],
    ['#333', '#666', '#999', '#CCC', ...Array(32).fill('#FFF'), '#CCC', '#999', '#666', '#333'],
    ['#333', '#666', '#999', '#CCC', ...Array(32).fill('#FFF'), '#CCC', '#999', '#666', '#333'],
    ['#333', '#666', '#999', '#CCC', ...Array(32).fill('#FFF'), '#CCC', '#999', '#666', '#333'],
    ['#333', '#666', '#999', '#CCC', ...Array(32).fill('#FFF'), '#CCC', '#999', '#666', '#333'],
    ['#333', '#666', '#999', '#CCC', ...Array(32).fill('#FFF'), '#CCC', '#999', '#666', '#333'],
    ['#333', '#666', '#999', '#CCC', ...Array(32).fill('#FFF'), '#CCC', '#999', '#666', '#333'],
    ['#333', '#666', '#999', '#CCC', ...Array(32).fill('#FFF'), '#CCC', '#999', '#666', '#333'],
    ['#333', '#666', '#999', '#CCC', ...Array(32).fill('#FFF'), '#CCC', '#999', '#666', '#333'],
    ['#333', '#666', '#999', '#CCC', ...Array(32).fill('#FFF'), '#CCC', '#999', '#666', '#333'],
    ['#333', '#666', '#999', '#CCC', ...Array(32).fill('#FFF'), '#CCC', '#999', '#666', '#333'],
    ['#333', '#666', '#999', '#CCC', ...Array(32).fill('#FFF'), '#CCC', '#999', '#666', '#333'],
    ['#333', '#666', '#999', '#CCC', ...Array(32).fill('#FFF'), '#CCC', '#999', '#666', '#333'],
    ['#333', '#666', '#999', '#CCC', ...Array(32).fill('#FFF'), '#CCC', '#999', '#666', '#333'],
    ['#333', '#666', '#999', '#CCC', ...Array(32).fill('#FFF'), '#CCC', '#999', '#666', '#333'],
    ['#333', '#666', ...Array(36).fill('#333'), '#666', '#333'],
    Array(40).fill('#333'),
  ],
};

function PixelSprite({ pixels, pixelSize = PIXEL_SIZE }: { pixels: string[][]; pixelSize?: number }) {
  return (
    <div
      className="grid"
      style={{
        gridTemplateColumns: `repeat(${pixels[0]?.length || 0}, ${pixelSize}px)`,
        gridTemplateRows: `repeat(${pixels.length}, ${pixelSize}px)`,
        imageRendering: 'pixelated',
      }}
    >
      {pixels.flat().map((color, idx) => (
        <div
          key={idx}
          style={{
            width: pixelSize,
            height: pixelSize,
            backgroundColor: color || 'transparent',
          }}
        />
      ))}
    </div>
  );
}

export function TypewriterForm({
  form,
  onChange,
  onSubmit,
  isSubmitting,
  error,
  unlocked,
}: TypewriterFormProps) {
  const [typedText, setTypedText] = useState({ name: '', email: '', message: '' });
  const [paperScroll, setPaperScroll] = useState(0);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);

  // Sync typed text with form (instant for typewriter effect)
  useEffect(() => {
    setTypedText({
      name: form.name,
      email: form.email,
      message: form.message,
    });
  }, [form]);

  // Auto-scroll paper as content grows
  useEffect(() => {
    const messageLength = form.message.length;
    const scrollAmount = Math.floor(messageLength / 50) * 20; // Scroll every 50 chars
    setPaperScroll(scrollAmount);
  }, [form.message]);

  return (
    <div
      className="relative"
      style={{
        backgroundColor: 'var(--bg-card)',
        border: '4px solid var(--border-color)',
        boxShadow: '0 0 0 2px var(--bg-main), 6px 6px 0 var(--border-color)',
        imageRendering: 'pixelated',
      }}
    >
      {/* Grid Background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(var(--border-color) 1px, transparent 1px),
            linear-gradient(90deg, var(--border-color) 1px, transparent 1px)
          `,
          backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
        }}
      />

      <div className="relative p-8">
        {/* Typewriter Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <PixelSprite pixels={typewriterSprite.pixels} pixelSize={PIXEL_SIZE} />
            <div>
              <h2 className="text-2xl font-bold font-mono" style={{ color: 'var(--text-main)' }}>
                TYPEWRITER CONTACT FORM
              </h2>
              <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                Type your message - watch it print on paper
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          {/* Paper Roll Container */}
          <div
            className="relative overflow-hidden"
            style={{
              backgroundColor: '#F5F5DC',
              border: '4px solid var(--border-color)',
              boxShadow: 'inset 0 0 0 2px var(--bg-main)',
              minHeight: '400px',
            }}
          >
            {/* Paper texture */}
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `
                  repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.05) 2px, rgba(0,0,0,0.05) 4px)
                `,
              }}
            />

            {/* Scrollable content */}
            <motion.div
              className="p-8"
              animate={{ y: -paperScroll }}
              transition={{ type: 'spring', stiffness: 100 }}
            >
              {/* Letter Header */}
              <div className="mb-6 font-mono" style={{ color: '#333' }}>
                <div className="text-right mb-4">
                  <div>Date: {new Date().toLocaleDateString()}</div>
                </div>
                <div className="mb-4">
                  <div>To: Arun Kumaar Sreenivasan</div>
                  <div>Subject: Contact Form Submission</div>
                </div>
              </div>

              {/* Name Field */}
              <div className="mb-6">
                <div className="font-mono text-sm mb-2" style={{ color: '#333' }}>
                  Name {unlocked.name ? '✅' : '🔒'}:
                </div>
                {unlocked.name ? (
                  <div className="relative">
                    <input
                      ref={nameInputRef}
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={onChange}
                      disabled={!unlocked.name}
                      className="absolute inset-0 w-full h-full opacity-0 font-mono"
                      autoComplete="off"
                      autoFocus
                    />
                    <div className="font-mono pointer-events-none" style={{ color: '#000', minHeight: '24px' }}>
                      {typedText.name}
                      <motion.span
                        animate={{ opacity: [1, 0, 1] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                        style={{ color: '#000', marginLeft: '2px' }}
                      >
                        |
                      </motion.span>
                    </div>
                  </div>
                ) : (
                  <div className="font-mono opacity-50" style={{ color: '#666' }}>
                    [LOCKED - Solve Module 1]
                  </div>
                )}
              </div>

              {/* Email Field */}
              <div className="mb-6">
                <div className="font-mono text-sm mb-2" style={{ color: '#333' }}>
                  Email {unlocked.email ? '✅' : '🔒'}:
                </div>
                {unlocked.email ? (
                  <div className="relative">
                    <input
                      ref={emailInputRef}
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={onChange}
                      disabled={!unlocked.email}
                      className="absolute inset-0 w-full h-full opacity-0 font-mono"
                      autoComplete="off"
                    />
                    <div className="font-mono pointer-events-none" style={{ color: '#000', minHeight: '24px' }}>
                      {typedText.email}
                      <motion.span
                        animate={{ opacity: [1, 0, 1] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                        style={{ color: '#000', marginLeft: '2px' }}
                      >
                        |
                      </motion.span>
                    </div>
                  </div>
                ) : (
                  <div className="font-mono opacity-50" style={{ color: '#666' }}>
                    [LOCKED - Solve Module 2]
                  </div>
                )}
              </div>

              {/* Message Field */}
              <div className="mb-6">
                <div className="font-mono text-sm mb-2" style={{ color: '#333' }}>
                  Message {unlocked.message ? '✅' : '🔒'}:
                </div>
                {unlocked.message ? (
                  <div className="relative">
                    <textarea
                      ref={messageInputRef}
                      name="message"
                      value={form.message}
                      onChange={onChange}
                      disabled={!unlocked.message}
                      className="absolute inset-0 w-full h-full opacity-0 font-mono resize-none"
                      rows={10}
                    />
                    <div className="font-mono whitespace-pre-wrap pointer-events-none" style={{ color: '#000', lineHeight: '1.8', minHeight: '200px' }}>
                      {typedText.message}
                      <motion.span
                        animate={{ opacity: [1, 0, 1] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                        style={{ color: '#000', marginLeft: '2px' }}
                      >
                        |
                      </motion.span>
                    </div>
                  </div>
                ) : (
                  <div className="font-mono opacity-50" style={{ color: '#666' }}>
                    [LOCKED - Solve Module 3]
                  </div>
                )}
              </div>

              {/* Letter Footer */}
              <div className="mt-8 font-mono" style={{ color: '#333' }}>
                <div>Sincerely,</div>
                <div className="mt-4">{form.name || '[Your Name]'}</div>
              </div>
            </motion.div>

            {/* Paper roll edges */}
            <div
              className="absolute left-0 top-0 bottom-0 w-2"
              style={{
                background: 'linear-gradient(to right, rgba(0,0,0,0.1), transparent)',
              }}
            />
            <div
              className="absolute right-0 top-0 bottom-0 w-2"
              style={{
                background: 'linear-gradient(to left, rgba(0,0,0,0.1), transparent)',
              }}
            />
          </div>


          {error && (
            <div className="font-mono text-sm" role="alert" style={{ color: '#FF6B6B' }}>
              {error}
            </div>
          )}

          <motion.button
            type="submit"
            disabled={
              !unlocked.name ||
              !unlocked.email ||
              !unlocked.message ||
              isSubmitting
            }
            className="w-full py-4 font-mono text-lg border-2 font-bold"
            style={{
              backgroundColor: unlocked.name && unlocked.email && unlocked.message && !isSubmitting
                ? '#FF6B6B'
                : 'var(--bg-main)',
              borderColor: unlocked.name && unlocked.email && unlocked.message && !isSubmitting
                ? '#FF6B6B'
                : 'var(--border-color)',
              color: unlocked.name && unlocked.email && unlocked.message && !isSubmitting
                ? '#000'
                : 'var(--text-muted)',
              boxShadow: unlocked.name && unlocked.email && unlocked.message && !isSubmitting
                ? '0 0 0 2px var(--bg-main), 4px 4px 0 var(--border-color)'
                : 'inset 0 0 0 1px var(--bg-main)',
              cursor: unlocked.name && unlocked.email && unlocked.message && !isSubmitting
                ? 'pointer'
                : 'not-allowed',
              opacity: unlocked.name && unlocked.email && unlocked.message && !isSubmitting ? 1 : 0.5,
            }}
            whileHover={{ scale: unlocked.name && unlocked.email && unlocked.message && !isSubmitting ? 1.02 : 1 }}
            whileTap={{ scale: unlocked.name && unlocked.email && unlocked.message && !isSubmitting ? 0.98 : 1 }}
          >
            {isSubmitting ? 'SENDING...' : '💣 DEFUSE BOMB & SEND'}
          </motion.button>
        </form>
      </div>
    </div>
  );
}
