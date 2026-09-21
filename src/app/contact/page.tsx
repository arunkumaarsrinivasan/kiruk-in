'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { TelephoneInterface } from './components/TelephoneInterface';
import { GridBackground } from '@/components/ui/GridBackground';
import { SiteCrumbs } from '@/components/layout/SiteCrumbs';

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
  const reduce = useReducedMotion();

  return (
    <div
      className="relative min-h-screen pb-20"
      style={{
        backgroundColor: 'var(--bg-main)',
        paddingTop: 'var(--simple-game-nav-bottom, 4.5rem)',
      }}
    >
      <GridBackground opacity={0.2} />

      <div className="relative z-10 mx-auto max-w-4xl px-4 pb-8 pt-8">
        <div data-blueprint="crumbs">
          <SiteCrumbs className="mb-6" items={[{ label: "Contact" }]} />
        </div>
        <motion.header
          data-blueprint="header"
          className="mb-8 text-center"
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduce ? 0 : 0.35, ease: 'easeOut' }}
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
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduce ? 0 : 0.4, delay: reduce ? 0 : 0.08, ease: 'easeOut' }}
        >
          <div
            data-blueprint="phone"
            className="p-6"
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '2px solid var(--border-color)',
            }}
          >
            <TelephoneInterface contacts={Object.values(CONTACT_INFO)} />
          </div>

          <div
            data-blueprint="channels"
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
    </div>
  );
}
