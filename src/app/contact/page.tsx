'use client';

import { motion } from 'framer-motion';
import { TelephoneInterface } from './components/TelephoneInterface';
import { GridBackground } from '@/components/ui/GridBackground';

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
  return (
    <main
      className="relative min-h-screen pb-20 pt-16"
      style={{ backgroundColor: 'var(--bg-main)' }}
    >
      <GridBackground opacity={0.2} />

      <div className="relative z-10 mx-auto max-w-4xl px-4 pb-8 pt-8">
        <motion.header
          className="mb-8 text-center"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        >
          <h1
            className="mb-2 font-mono text-3xl font-bold sm:text-4xl"
            style={{ color: 'var(--text-main)' }}
          >
            Contact
          </h1>
          <p className="font-mono text-sm" style={{ color: 'var(--text-muted)' }}>
            Social links, email, and meeting scheduler
          </p>
        </motion.header>

        <motion.div
          className="mb-8 grid gap-6 md:grid-cols-2"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08, ease: 'easeOut' }}
        >
          <div
            className="p-6"
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '2px solid var(--border-color)',
            }}
          >
            <TelephoneInterface contacts={Object.values(CONTACT_INFO)} />
          </div>

          <div
            className="p-6"
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '2px solid var(--border-color)',
            }}
          >
            <h2
              className="mb-4 font-mono text-xl font-bold"
              style={{ color: 'var(--text-main)' }}
            >
              📅 Schedule a meeting
            </h2>
            <div
              className="w-full overflow-hidden rounded"
              style={{
                border: '1px solid var(--border-color)',
                minHeight: '700px',
              }}
            >
              <iframe
                src="https://cal.com/arun-kumaar-sreenivasan-uihrg5"
                width="100%"
                height="700"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  border: 'none',
                }}
                title="Schedule a meeting"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
