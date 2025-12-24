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
    gradient: 'bg-rose-50',
    tapeClass: 'bg-amber-100 border-black text-black',
    accentClass: 'text-black',
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
    gradient: 'bg-sky-50',
    tapeClass: 'bg-cyan-100 border-black text-black',
    accentClass: 'text-black',
    badge: 'launching soon',
    highlights: [
      { tag: 'Problem-solving logs', note: 'Walkthroughs of how I approach and untangle product challenges.' },
      { tag: 'Career updates', note: 'Milestones, learnings, and the evolving roadmap of my work life.' },
      { tag: 'Kirukism essays', note: 'Deep dives into the design ethos I am shaping—publishing soon.' },
    ],
  },
];

const floatingMarks = [
  { id: 'mark-1', label: 'document > polish', x: '10%', y: '5%' },
  { id: 'mark-2', label: 'kirukism ≈ craft + chaos', x: '78%', y: '18%' },
  { id: 'mark-3', label: 'stay curious →', x: '12%', y: '78%' },
];

export const VlogGallery = () => {
  return (
    <section className="relative overflow-hidden py-16 bg-white">
      {/* Grid Background */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:20px_20px]" />

      {floatingMarks.map((mark) => (
        <div
          key={mark.id}
          className="absolute hidden md:block font-mono text-xs uppercase tracking-widest bg-white border border-black px-2 py-1 shadow-none"
          style={{ left: mark.x, top: mark.y }}
        >
          {mark.label}
        </div>
      ))}

      <div className="relative mx-auto max-w-6xl px-4">
        <div className="text-center mb-16">
          <SketchHeading level={2} className="text-3xl md:text-4xl font-bold uppercase tracking-tighter inline-flex items-center gap-2">
            Two Instagram Spaces
          </SketchHeading>
          <p className="mt-4 font-mono text-sm uppercase tracking-widest text-slate-600 max-w-3xl mx-auto border-l border-black pl-4 text-left">
            Choose the lane you want to ride along with—the everyday documentation of my build-in-public life, or the crafted visual universe of Kirukism.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {instagramSpaces.map((space) => (
            <a
              key={space.id}
              href={space.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`group relative flex flex-col gap-4 border border-black ${space.gradient} p-8 shadow-none hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-200`}
            >
              <span
                className={`absolute -top-5 right-8 inline-flex items-center gap-2 border px-3 py-1 text-xs font-bold uppercase tracking-wider shadow-none ${space.tapeClass}`}
              >
                {space.badge}
              </span>

              <div className="flex items-center justify-between border-b border-black pb-4">
                <span className="uppercase tracking-[0.35em] text-xs font-bold">Instagram</span>
                <span className="text-2xl grayscale group-hover:grayscale-0 transition-all">{space.emoji}</span>
              </div>

              <div>
                <h3 className={`text-2xl font-black uppercase tracking-tight ${space.accentClass}`}>
                  {space.label}
                </h3>
                <p className="mt-3 font-mono text-sm leading-relaxed border-l border-black pl-3">
                  {space.descriptor}
                </p>
              </div>

              <div className="space-y-3">
                {space.highlights.map((highlight) => (
                  <div
                    key={`${space.id}-${highlight.tag}`}
                    className="flex items-start gap-3 border border-black bg-white px-4 py-3 hover:bg-black hover:text-white transition-colors group/item"
                  >
                    <span className="text-lg font-bold">✶</span>
                    <div>
                      <p className="font-bold uppercase text-xs tracking-wider mb-1">{highlight.tag}</p>
                      <p className="font-mono text-xs leading-snug opacity-80">{highlight.note}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-auto flex items-center justify-between pt-4 border-t border-black">
                <span className="inline-flex items-center gap-2 border border-black bg-black px-4 py-2 text-xs font-bold uppercase tracking-widest text-white hover:bg-white hover:text-black transition-colors">
                  {space.handle}
                  <span>↗</span>
                </span>
                <span className="text-xs font-mono uppercase tracking-wider">Tap to open</span>
              </div>
            </a>
          ))}
        </div>

        <div className="mt-16 flex flex-col items-center gap-4 text-center">
          <span className="font-mono text-xs uppercase tracking-widest bg-black text-white px-2 py-1">
            Personal stories are live · Kirukism loading
          </span>
          <div className="flex flex-wrap justify-center gap-3 text-xs uppercase tracking-[0.2em] font-bold">
            <span className="px-3 py-1 border border-black bg-white shadow-none">raw logs</span>
            <span className="px-3 py-1 border border-black bg-white shadow-none">design experiments</span>
            <span className="px-3 py-1 border border-black bg-white shadow-none">kiruk ethos</span>
            <span className="px-3 py-1 border border-black bg-white shadow-none">build in public</span>
          </div>
        </div>
      </div>
    </section>
  );
};
