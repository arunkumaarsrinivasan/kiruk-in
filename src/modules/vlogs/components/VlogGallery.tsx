'use client';

import { motion } from 'framer-motion';
import { SketchHeading } from '@/components/ui/sketch-elements';

type InstagramSpace = {
  id: string;
  emoji: string;
  label: string;
  handle: string;
  descriptor: string;
  url: string;
  gradient: string;
  tapeClass: string;
  accentClass: string;
  badge: string;
  highlights: { tag: string; note: string }[];
};

const instagramSpaces: InstagramSpace[] = [
  {
    id: 'personal',
    emoji: '✍️',
    label: 'Personal Documentation',
    handle: '@arunum.avan.seyalum',
    descriptor: 'How I collide with the world—crazy adventures, messy thoughts, and life documented without chasing trends.',
    url: 'https://www.instagram.com/arunum.avan.seyalum/',
    gradient: 'from-rose-50/90 via-white/95 to-purple-50/80',
    tapeClass: 'bg-amber-100/80 border-amber-300 text-amber-800',
    accentClass: 'text-rose-500',
    badge: 'live archive ↗',
    highlights: [
      { tag: 'Raw reflections', note: 'Unfiltered notes on how I understand the world around me.' },
      { tag: 'Off-work adventures', note: 'Trekking, spontaneous plans, and all the energy beyond laptops.' },
      { tag: 'No-filter diary', note: 'Documenting the day-to-day without trends—just the real me.' },
    ],
  },
  {
    id: 'kirukism',
    emoji: '🎨',
    label: 'Design Life · kiruk + ism',
    handle: '@kirukism',
    descriptor: 'Where my professional story will live—design philosophy, problem-solving journeys, and career updates coming online soon.',
    url: 'https://www.instagram.com/kirukism/',
    gradient: 'from-sky-50/90 via-white/95 to-emerald-50/80',
    tapeClass: 'bg-cyan-100/80 border-cyan-300 text-cyan-800',
    accentClass: 'text-sky-600',
    badge: 'launching soon',
    highlights: [
      { tag: 'Problem-solving logs', note: 'Walkthroughs of how I approach and untangle product challenges.' },
      { tag: 'Career updates', note: 'Milestones, learnings, and the evolving roadmap of my work life.' },
      { tag: 'Kirukism essays', note: 'Deep dives into the design ethos I am shaping—publishing soon.' },
    ],
  },
];

const floatingMarks = [
  { id: 'mark-1', label: 'document > polish', x: '10%', y: '5%', rotate: '-6deg' },
  { id: 'mark-2', label: 'kirukism ≈ craft + chaos', x: '78%', y: '18%', rotate: '8deg' },
  { id: 'mark-3', label: 'stay curious →', x: '12%', y: '78%', rotate: '-4deg' },
];

export const VlogGallery = () => {
  return (
    <section className="relative overflow-hidden py-20">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,_rgba(244,114,182,0.14),transparent_55%),repeating-linear-gradient(180deg,rgba(15,23,42,0.04),rgba(15,23,42,0.04)_1px,transparent_1px,transparent_42px)]" />

      {floatingMarks.map((mark) => (
        <motion.span
          key={mark.id}
          className="absolute hidden md:block handwritten text-sm text-gray-500"
          style={{ left: mark.x, top: mark.y, rotate: mark.rotate }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 0.5, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {mark.label}
        </motion.span>
      ))}

      <div className="relative mx-auto max-w-6xl px-6">
        <div className="text-center">
          <SketchHeading level={2} className="text-3xl md:text-4xl sketch-font text-black inline-flex items-center gap-2">
            Two Instagram Spaces
          </SketchHeading>
          <motion.p
            className="mt-5 handwritten text-lg text-slate-600 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Choose the lane you want to ride along with&mdash;the everyday documentation of my build-in-public life, or the crafted visual universe of Kirukism.
          </motion.p>
        </div>

        <motion.div
          className="mt-14 grid gap-10 md:grid-cols-2"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={{
            hidden: { opacity: 0, y: 24 },
            visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.15, delayChildren: 0.2 } },
          }}
        >
          {instagramSpaces.map((space) => (
            <motion.a
              key={space.id}
              href={space.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`group relative isolate flex h-full flex-col gap-6 rounded-3xl border-2 border-dashed border-slate-800/80 bg-gradient-to-br ${space.gradient} p-10 shadow-[8px_10px_0px_rgba(15,23,42,0.18)] transition-transform`}
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              whileHover={{ translateY: -8, rotate: space.id === 'personal' ? -1.2 : 1.2 }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.span
                className={`absolute -top-4 right-10 inline-flex items-center gap-2 rounded-full border border-dashed px-3 py-1 text-xs handwritten ${space.tapeClass}`}
                initial={{ rotate: space.id === 'personal' ? -4 : 6 }}
                animate={{ rotate: space.id === 'personal' ? -6 : 8 }}
                transition={{ repeat: Infinity, repeatType: 'mirror', duration: 6 }}
              >
                {space.badge}
              </motion.span>

              <div className="flex items-center justify-between">
                <span className="uppercase tracking-[0.35em] text-sm text-slate-500">Instagram</span>
                <span className="text-2xl" aria-hidden>{space.emoji}</span>
              </div>

              <div>
                <h3 className={`sketch-font text-[1.9rem] leading-tight text-slate-900 ${space.accentClass}`}>
                  {space.label}
                </h3>
                <p className="mt-3 handwritten text-base text-slate-700 leading-relaxed">
                  {space.descriptor}
                </p>
              </div>

              <div className="space-y-3">
                {space.highlights.map((highlight) => (
                  <motion.div
                    key={`${space.id}-${highlight.tag}`}
                    className="flex items-start gap-3 rounded-xl border border-dashed border-slate-300/80 bg-white/70 px-4 py-3 backdrop-blur-sm transition-colors group-hover:border-slate-400/90"
                    whileHover={{ scale: 1.02 }}
                  >
                    <span className="text-lg" aria-hidden>✶</span>
                    <div>
                      <p className="sketch-font text-sm text-slate-800">{highlight.tag}</p>
                      <p className="handwritten text-sm text-slate-600 leading-snug">{highlight.note}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-auto flex items-center justify-between pt-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-900 bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-colors group-hover:bg-transparent group-hover:text-slate-900">
                  {space.handle}
                  <motion.span
                    aria-hidden
                    initial={{ x: 0 }}
                    animate={{ x: [0, 4, 0] }}
                    transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
                  >
                    ↗
                  </motion.span>
                </span>
                <span className="text-sm handwritten text-slate-500">Tap to open the feed</span>
              </div>

              <motion.span
                className="pointer-events-none absolute -bottom-4 left-0 text-4xl text-slate-300/70"
                initial={{ rotate: -6 }}
                animate={{ rotate: space.id === 'personal' ? -8 : 6 }}
                transition={{ repeat: Infinity, duration: 8, repeatType: 'mirror' }}
              >
                📷
              </motion.span>
            </motion.a>
          ))}
        </motion.div>

        <motion.div
          className="mt-16 flex flex-col items-center gap-4 text-center"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <span className="sketch-font text-base text-slate-700">Personal stories are already live; the Kirukism workspace is warming up—both stay true to notebook honesty.</span>
          <div className="flex flex-wrap justify-center gap-3 text-xs uppercase tracking-[0.3em] text-slate-500">
            <span className="px-3 py-1 border border-dashed border-slate-300 rounded-full">raw logs</span>
            <span className="px-3 py-1 border border-dashed border-slate-300 rounded-full">design experiments</span>
            <span className="px-3 py-1 border border-dashed border-slate-300 rounded-full">kiruk ethos</span>
            <span className="px-3 py-1 border border-dashed border-slate-300 rounded-full">build in public</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};