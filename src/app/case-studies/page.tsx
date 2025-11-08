'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useAnalytics } from '@/hooks/useAnalytics';

const boardPattern = {
  backgroundImage:
    'radial-gradient(circle at 1px 1px, rgba(148,163,184,0.25) 1px, transparent 0)',
  backgroundSize: '22px 22px'
};

export default function CaseStudies() {
  const { trackPageView, trackInteraction } = useAnalytics();
  const [showPrototype, setShowPrototype] = useState(false);

  const prototypeUrl = 'https://www.figma.com/design/VtitVweV3Pus9chSeKA0VX/Finalized-Screen---Square-Bridge?node-id=23022-56006';
  const prototypeEmbed = `https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(prototypeUrl)}`;

  useEffect(() => {
    trackPageView('/case-studies');
  }, [trackPageView]);

  const handleOpenPrototype = () => {
    setShowPrototype(true);
    trackInteraction('case_study_prototype_opened', { project: 'square-bridge' });
  };

  const handleClosePrototype = () => {
    setShowPrototype(false);
  };

  return (
    <main className="min-h-screen relative overflow-hidden" style={boardPattern}>
      <div className="absolute inset-0 pointer-events-none">
        <motion.span
          className="absolute top-16 right-24 text-5xl text-gray-400/40"
          animate={{ rotate: [0, 12, -10, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        >
          ✦
        </motion.span>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-32">
        {/* Hero sticky */}
        <motion.section
          className="relative max-w-3xl mx-auto border border-gray-200 shadow-lg bg-[#FFF3A9] px-10 py-12 text-center"
          initial={{ y: 28, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.45 }}
          style={{ borderRadius: '18px' }}
        >
          <span
            className="absolute -top-6 left-1/2 h-8 w-32 -translate-x-1/2 rotate-[-5deg] bg-yellow-200/80"
            style={{ clipPath: 'polygon(0 0, 100% 0, 96% 100%, 4% 100%)' }}
          />

          <div className="handwritten text-gray-900 space-y-5">
            <h1 className="text-4xl uppercase tracking-[0.35rem]">Case Study Board</h1>
            <p className="text-base leading-relaxed">
              I&apos;m curating the next round of deep dives. Until the wall is refreshed, you can explore full product breakdowns and workshop archives on Behance and my Playbook snapshots.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <motion.a
                href="https://www.behance.net/arunkusriniva"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-md bg-blue-500 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-600"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                🎨 Visit Behance
              </motion.a>
              <a
                href="https://playbook.com/arunkumaar"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
              >
                📓 View Playbook
              </a>
            </div>
          </div>
        </motion.section>

        <section className="mt-20 relative flex flex-col items-center gap-6 lg:items-end">
          <motion.button
            type="button"
            onClick={handleOpenPrototype}
            aria-label="Open the Square Bridge prototype"
            className="group relative w-full max-w-xs border border-slate-200 bg-white px-6 pb-7 pt-9 text-left shadow-[6px_8px_0_rgba(15,23,42,0.08)] focus:outline-none focus:ring-2 focus:ring-blue-400"
            style={{ borderRadius: '26px' }}
            initial={{ rotate: -4.5, y: 34, opacity: 0 }}
            animate={{ rotate: -4.5, y: 0, opacity: 1 }}
            whileHover={{ rotate: -2, translateY: -10 }}
            whileTap={{ rotate: -5.5, scale: 0.96 }}
          >
            <span
              className="absolute -top-4 left-1/2 h-6 w-16 -translate-x-1/2 rotate-[-4deg] bg-slate-200/70"
              style={{ clipPath: 'polygon(0 0, 100% 0, 90% 100%, 10% 100%)' }}
            />
            <span className="absolute right-5 top-5 text-slate-400 text-lg" aria-hidden>
              ×
            </span>
            <div className="space-y-3 handwritten text-gray-800">
              <span className="block text-sm">🧩 Square Bridge prototype</span>
              <p className="text-base leading-relaxed">
                Preview the capital matchmaking timeline, launch phases, and investor dashboards in the live Figma board.
              </p>
            </div>
            <div className="mt-4 inline-flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50/70 px-3 py-1.5 text-slate-600 transition group-hover:-translate-y-1 group-hover:border-blue-300 group-hover:text-blue-700 handwritten text-sm">
              <span role="img" aria-hidden>👆</span>
              Tap to explore
            </div>
          </motion.button>

          <Link
            href="/contact"
            className="handwritten text-sm text-gray-600 transition-colors hover:text-gray-900"
          >
            ✉️ Let&apos;s collaborate
          </Link>
        </section>
      </div>

      <AnimatePresence>
        {showPrototype && (
          <motion.div
            className="fixed inset-0 z-[120] flex items-center justify-center bg-gray-900/70 backdrop-blur-sm px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClosePrototype}
          >
            <motion.div
              className="relative w-full max-w-4xl border border-gray-200 bg-white shadow-2xl"
              style={{ borderRadius: '20px' }}
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 140, damping: 18 }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="px-8 pt-8 pb-6 space-y-4 handwritten text-gray-900">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.4em] text-gray-500">Interactive case study</p>
                    <h3 className="mt-2 text-3xl uppercase tracking-[0.35em]">Square Bridge Prototype</h3>
                  </div>
                  <motion.button
                    type="button"
                    onClick={handleClosePrototype}
                    className="rounded-md border border-gray-300 px-3 py-1 text-xs font-semibold text-gray-600 transition hover:bg-gray-100"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.96 }}
                  >
                    Close
                  </motion.button>
                </div>
                <p className="text-sm leading-relaxed text-gray-600">
                  Navigate through the investor intake, deal-room dashboards, and the narrative-led pitch canvas. Use the hotspots and motion cues inside Figma to explore the full journey.
                </p>
              </div>
              <div className="relative w-full overflow-hidden" style={{ paddingTop: '56.25%' }}>
                <iframe
                  src={prototypeEmbed}
                  title="Square Bridge Prototype"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full border-t border-gray-200"
                />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 px-8 py-4">
                <div className="text-xs text-gray-500 uppercase tracking-[0.35em]">
                  Tip: Press <span className="font-semibold">F</span> in the Figma viewer for full screen
                </div>
                <a
                  href={prototypeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-md bg-blue-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-600"
                >
                  Launch in Figma ↗
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}