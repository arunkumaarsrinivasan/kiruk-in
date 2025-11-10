'use client';

import { motion } from 'framer-motion';

interface InvolvementItem {
  title: string;
  description: string;
  category: string;
  icon: string;
  color: string;
  impact: string;
}

interface InvolvementSectionProps {
  involvementData: InvolvementItem[];
}

const statChips = [
  { icon: '📚', value: '60+', label: 'students taught', caption: 'UI/UX sprints and critiques' },
  { icon: '🧭', value: '2+', label: 'years active', caption: 'Campus and community circles' },
  { icon: '✨', value: '∞', label: 'micro experiments', caption: 'Meetups, AMAs, prototype jams' }
];

const collabPills = [
  { icon: '🎤', text: 'Guest workshop' },
  { icon: '🧠', text: 'Mentor hour' },
  { icon: '🔗', text: 'Community collab' }
];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, delay }
});

const InvolvementCard = ({ item, index }: { item: InvolvementItem; index: number }) => (
  <motion.article
    className="group relative flex h-full flex-col gap-4 rounded-3xl border border-gray-200 bg-white/90 p-6 shadow-[0_10px_0_rgba(15,23,42,0.08)] transition-transform duration-300"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: index * 0.08 }}
    whileHover={{ y: -6 }}
  >
    <span
      className="pointer-events-none absolute -top-4 left-12 inline-block h-6 w-16 rounded-full bg-yellow-200/70 shadow"
      style={{ transform: 'rotate(-5deg)' }}
      aria-hidden
    />
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-start gap-3">
        <span
          className="flex h-11 w-11 items-center justify-center rounded-2xl border border-gray-200 text-xl"
          style={{ backgroundColor: `${item.color}18`, borderColor: `${item.color}40`, color: item.color }}
        >
          {item.icon}
        </span>
        <div>
          <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-gray-500 handwritten">
            {item.category}
          </span>
          <h3 className="mt-2 text-lg font-bold text-gray-800 handwritten">{item.title}</h3>
        </div>
      </div>
      <span className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-gray-500 handwritten">
        {item.impact}
      </span>
    </div>
    <p className="flex-1 text-sm leading-relaxed text-gray-600 handwritten">{item.description}</p>
    <div className="flex items-center justify-between border-t border-dashed border-gray-200 pt-3 text-xs text-gray-500 handwritten">
      <span className="flex items-center gap-2">
        <span className="inline-flex h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} aria-hidden />
        Keeps the circle active
      </span>
      <span className="flex items-center gap-2 uppercase tracking-[0.22em] text-gray-400">
        Trace
        <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
      </span>
    </div>
  </motion.article>
);

export const InvolvementSection = ({ involvementData }: InvolvementSectionProps) => (
  <section className="relative z-10 mx-auto mb-24 max-w-6xl px-4">
    <motion.div {...fadeUp(0.05)}>
      <div className="text-center">
        <motion.h2 className="magnetic-font text-3xl text-gray-800 md:text-4xl" {...fadeUp(0.12)}>
          🤝 Community Involvement
        </motion.h2>
        <motion.p className="mx-auto mt-3 max-w-2xl text-base text-gray-600 handwritten" {...fadeUp(0.2)}>
          A few snapshots of how Arun keeps sharing, teaching, and building momentum with the community.
        </motion.p>
        <motion.div className="mt-6 flex flex-wrap justify-center gap-4" {...fadeUp(0.28)}>
          {statChips.map((chip) => (
            <motion.div
              key={chip.label}
              className="group relative flex min-w-[190px] flex-col gap-1 rounded-2xl border border-gray-200 bg-white px-5 py-4 text-left shadow-sm transition-transform duration-300"
              whileHover={{ y: -4 }}
            >
              <span className="text-xl" aria-hidden>{chip.icon}</span>
              <span className="text-2xl font-bold text-gray-800 handwritten">{chip.value}</span>
              <span className="text-sm font-semibold text-gray-700 handwritten">{chip.label}</span>
              <span className="text-[12px] text-gray-500 handwritten">{chip.caption}</span>
              <span className="absolute inset-x-5 bottom-2 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </motion.div>
          ))}
        </motion.div>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {involvementData.map((item, index) => (
          <InvolvementCard key={item.title} item={item} index={index} />
        ))}
      </div>

      <motion.div className="mt-16 flex justify-center" {...fadeUp(0.4)}>
        <div className="relative w-full max-w-3xl rounded-3xl border-2 border-dashed border-blue-200 bg-blue-50/70 p-6 text-center shadow-[0_14px_0_rgba(37,99,235,0.12)]">
          <span className="absolute -top-4 left-1/2 h-6 w-20 -translate-x-1/2 rotate-2 rounded-full bg-yellow-200/80 shadow" aria-hidden />
          <h3 className="text-2xl font-bold text-gray-800 handwritten">Let us build something together</h3>
          <p className="mx-auto mt-3 max-w-xl text-sm text-gray-600 handwritten">
            Ping Arun if you want to co-host, mentor, or sketch AI-driven journeys with your crew.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3 text-sm text-blue-600 handwritten">
            {collabPills.map((pill) => (
              <span key={pill.text} className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/90 px-4 py-2 shadow-sm">
                <span aria-hidden>{pill.icon}</span>
                {pill.text}
              </span>
            ))}
          </div>
          <motion.a
            href="/contact"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-blue-500 px-6 py-2 text-sm font-semibold text-white handwritten shadow transition-transform focus:outline-none focus:ring-2 focus:ring-blue-300 hover:bg-blue-600"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
          >
            Say hello
            <span className="text-base">→</span>
          </motion.a>
        </div>
      </motion.div>
    </motion.div>
  </section>
);

export default InvolvementSection;
