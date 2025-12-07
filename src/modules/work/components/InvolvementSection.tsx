'use client';

import { motion } from 'framer-motion';
import { WireframeCard, SketchHeading } from '@/components/ui/sketch-elements';

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
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: index * 0.08 }}
  >
    <WireframeCard className="bg-white h-full">
      <div className="p-4 flex flex-col h-full relative">
        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-black" />
        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-black" />
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-black" />
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-black" />

        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-start gap-3">
            <span
              className="flex h-8 w-8 items-center justify-center border border-black text-xl bg-gray-50"
            >
              {item.icon}
            </span>
            <div>
              <span className="inline-block px-2 py-0.5 border border-black text-[10px] uppercase tracking-[0.2em] text-gray-600 handwritten mb-1">
                {item.category}
              </span>
              <h3 className="text-lg font-bold text-black handwritten">{item.title}</h3>
            </div>
          </div>
        </div>
        
        <p className="flex-1 text-sm leading-relaxed text-gray-800 handwritten mb-6">{item.description}</p>
        
        <div className="mt-auto pt-4 border-t border-gray-200 flex items-center justify-between">
          <span className="text-xs text-gray-500 handwritten uppercase tracking-wider">Impact</span>
          <span className="px-2 py-1 border border-black text-xs font-bold text-black handwritten bg-gray-50">
            {item.impact}
          </span>
        </div>
      </div>
    </WireframeCard>
  </motion.div>
);

export const InvolvementSection = ({ involvementData }: InvolvementSectionProps) => (
  <section className="relative z-10 mx-auto mb-24 max-w-6xl px-4">
    <motion.div {...fadeUp(0.05)}>
      <div className="text-center mb-12">
        <SketchHeading level={2} className="text-3xl md:text-4xl mb-4 text-center">
          Community Involvement
        </SketchHeading>
        <motion.p className="mx-auto mt-3 max-w-2xl text-base text-gray-600 handwritten" {...fadeUp(0.2)}>
          A few snapshots of how Arun keeps sharing, teaching, and building momentum with the community.
        </motion.p>
        
        <motion.div className="mt-8 flex flex-wrap justify-center gap-4" {...fadeUp(0.28)}>
          {statChips.map((chip) => (
            <div
              key={chip.label}
              className="group relative flex min-w-[190px] flex-col gap-1 border border-black bg-white px-4 py-4 text-left transition-all hover:shadow-none"
            >
              {/* Wireframe corners for chips */}
              <div className="absolute -top-px -left-px w-1.5 h-1.5 border-t border-l border-black" />
              <div className="absolute -top-px -right-px w-1.5 h-1.5 border-t border-r border-black" />
              <div className="absolute -bottom-px -left-px w-1.5 h-1.5 border-b border-l border-black" />
              <div className="absolute -bottom-px -right-px w-1.5 h-1.5 border-b border-r border-black" />

              <span className="text-xl mb-1" aria-hidden>{chip.icon}</span>
              <span className="text-2xl font-bold text-black handwritten">{chip.value}</span>
              <span className="text-sm font-semibold text-gray-800 handwritten uppercase tracking-wider">{chip.label}</span>
              <span className="text-[10px] text-gray-500 handwritten mt-1 border-t border-gray-200 pt-1">{chip.caption}</span>
            </div>
          ))}
        </motion.div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 mb-16">
        {involvementData.map((item, index) => (
          <InvolvementCard key={item.title} item={item} index={index} />
        ))}
      </div>

      <motion.div className="mt-16" {...fadeUp(0.4)}>
        <WireframeCard className="bg-white max-w-3xl mx-auto">
          <div className="p-8 text-center relative">
             {/* Wireframe accents */}
            <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-black" />
            <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-black" />
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-black" />
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-black" />

            <h3 className="text-2xl font-bold text-black handwritten mb-4">Let us build something together</h3>
            <p className="mx-auto mb-6 max-w-xl text-sm text-gray-600 handwritten leading-relaxed">
              Ping Arun if you want to co-host, mentor, or sketch AI-driven journeys with your crew.
            </p>
            
            <div className="mb-8 flex flex-wrap justify-center gap-3 text-sm text-black handwritten">
              {collabPills.map((pill) => (
                <span key={pill.text} className="inline-flex items-center gap-2 border border-gray-300 bg-gray-50 px-4 py-2 uppercase tracking-wider text-xs">
                  <span aria-hidden>{pill.icon}</span>
                  {pill.text}
                </span>
              ))}
            </div>
            
            <motion.a
              href="/contact"
              className="inline-flex items-center gap-2 border border-black bg-black text-white px-8 py-3 text-sm font-bold handwritten hover:bg-white hover:text-black transition-colors uppercase tracking-widest"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Say hello
              <span className="text-base">→</span>
            </motion.a>
          </div>
        </WireframeCard>
      </motion.div>
    </motion.div>
  </section>
);

export default InvolvementSection;
