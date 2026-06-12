'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, type ReactNode } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CASE_STUDIES } from '../data';
import { useAnalytics } from '@/hooks/useAnalytics';

type Accent = {
  sticky: string;
  tape: string;
  tag: string;
  icon: string;
};

const accents: Record<string, Accent> = {
  placeholder: {
    sticky: 'bg-white',
    tape: 'bg-gray-200',
    tag: 'bg-gray-100 text-gray-700',
    icon: '✦'
  }
};

type BoardCardProps = {
  title: string;
  children: ReactNode;
  color: string;
  tapeColor: string;
  className?: string;
};

function BoardCard({ title, children, color, tapeColor, className }: BoardCardProps) {
  return (
    <motion.section
      className={`relative border border-gray-200 shadow-lg ${color} ${className ?? ''}`}
      style={{ borderRadius: '10px' }}
      initial={{ y: 18, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35 }}
    >
      <span
        className={`absolute -top-5 left-1/2 h-6 w-24 -translate-x-1/2 rotate-[-4deg] ${tapeColor} opacity-70`}
        style={{ clipPath: 'polygon(0 0, 100% 0, 95% 100%, 5% 100%)' }}
      />
      <div className="px-8 pt-8 pb-8 space-y-5">
        <h2 className="handwritten text-2xl uppercase tracking-[0.35em] text-gray-900">
          {title}
        </h2>
        {children}
      </div>
    </motion.section>
  );
}

const boardPattern = {
  backgroundImage:
    'radial-gradient(circle at 1px 1px, rgba(148,163,184,0.25) 1px, transparent 0)',
  backgroundSize: '22px 22px'
};

export default function CaseStudyPage() {
  // Call useParams at top level (required for hooks)
  const params = useParams();
  const { trackCaseStudyView } = useAnalytics();
  
  // Extract id immediately to avoid enumeration warnings
  // Direct property access without enumerating the params object
  const rawId = (params as { id?: string | string[] }).id;
  const caseStudyId = useMemo(() => {
    return typeof rawId === 'string' 
      ? rawId 
      : Array.isArray(rawId) 
        ? rawId[0] 
        : String(rawId || '');
  }, [rawId]);
  
  const caseStudy = CASE_STUDIES.find((study) => study.id === caseStudyId);

  useEffect(() => {
    if (caseStudy) trackCaseStudyView(caseStudy.id);
  }, [caseStudy, trackCaseStudyView]);

  const accent: Accent = caseStudy
    ? accents[caseStudy.id] ?? accents.placeholder
    : accents.placeholder;

  const gallery = useMemo(() => {
    if (!caseStudy) return [] as { src: string; label: string }[];

    const items: { src: string; label: string }[] = [];

    if (caseStudy.sketchImg) items.push({ src: caseStudy.sketchImg, label: 'Sketches' });

    caseStudy.ideation?.images?.forEach((img, index) =>
      items.push({ src: img, label: `Concept ${index + 1}` })
    );

    caseStudy.finalScreens?.images?.forEach((img, index) =>
      items.push({ src: img, label: `Final ${index + 1}` })
    );

    if (caseStudy.finalImg) items.push({ src: caseStudy.finalImg, label: 'Final Snapshot' });

    return items.slice(0, 6);
  }, [caseStudy]);

  if (!caseStudy) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={boardPattern}>
        <div className="text-center space-y-5">
          <h1 className="text-4xl magnetic-font">Case studies are coming soon</h1>
          <p className="handwritten text-base text-gray-600">
            I&apos;m refreshing this wall. In the meantime, browse the full archive on Behance or dive into the Playbook snapshots for process notes.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href="https://www.behance.net/arunkusriniva"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-none bg-blue-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-600"
            >
              🎨 Visit Behance
            </a>
            <a
              href="https://playbook.com/arunkumaar"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-none border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
            >
              📓 View Playbook
            </a>
          </div>
          <Link href="/case-studies" className="block text-sm text-blue-500 hover:underline handwritten">
            ← Back to Case Studies
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pb-24" style={boardPattern}>
      <div className="max-w-6xl mx-auto px-4 sm:px-4 lg:px-8 pt-24">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/case-studies"
            className="handwritten text-sm uppercase tracking-[0.35em] text-gray-500 hover:text-gray-800 transition"
          >
            ← Back to board
          </Link>
          <span className={`handwritten text-xs uppercase tracking-[0.4em] ${accent.tag} px-4 py-2 border border-gray-200`}>
            {caseStudy.steps.length} Chapters
          </span>
        </div>

        {/* Hero cluster */}
        <motion.div
          className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)]"
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className={`relative border border-gray-200 shadow-xl ${accent.sticky}`} style={{ borderRadius: '14px' }}>
            <span
              className={`absolute -top-5 left-12 h-8 w-28 rotate-[-6deg] ${accent.tape} opacity-80`}
              style={{ clipPath: 'polygon(0 0, 100% 0, 96% 100%, 4% 100%)' }}
            />
            <div className="px-8 pt-14 pb-12 space-y-5">
              <span className="handwritten text-sm uppercase tracking-[0.4em] text-gray-500 flex items-center gap-2">
                {accent.icon} Featured Project
              </span>
              <h1 className="handwritten text-5xl uppercase tracking-[0.35em] text-gray-900 leading-tight">
                {caseStudy.title}
              </h1>
              <p className="handwritten text-lg leading-relaxed text-gray-700 max-w-2xl">
                {caseStudy.summary}
              </p>
              {caseStudy.productDescription && (
                <p className="text-base text-gray-700 handwritten leading-relaxed">
                  {caseStudy.productDescription}
                </p>
              )}
              {caseStudy.technologies && (
                <div className="flex flex-wrap gap-3">
                  {caseStudy.technologies.map((tech) => (
                    <span
                      key={tech}
                      className={`handwritten text-xs uppercase tracking-[0.35em] px-3 py-1 border border-gray-200 rounded-none bg-white/60 text-gray-700`}
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {gallery.map((shot, index) => (
              <motion.figure
                key={`${shot.src}-${index}`}
                className="relative bg-white border border-gray-200 shadow-md"
                style={{ borderRadius: '12px' }}
                initial={{ rotate: index % 2 === 0 ? -3 : 3, opacity: 0 }}
                animate={{ rotate: index % 2 === 0 ? -3 : 3, opacity: 1 }}
                transition={{ delay: 0.25 + index * 0.08, type: 'spring', stiffness: 70 }}
              >
                <span
                  className={`absolute -top-3 left-1/2 h-4 w-16 -translate-x-1/2 ${accent.tape} opacity-70`}
                  style={{ clipPath: 'polygon(0 0, 100% 0, 95% 100%, 5% 100%)' }}
                />
                <Image
                  src={shot.src}
                  alt={shot.label}
                  width={320}
                  height={200}
                  className="h-32 w-full rounded-none object-cover"
                />
                <figcaption className="handwritten text-xs uppercase tracking-[0.35em] text-gray-600 px-4 py-3">
                  {shot.label}
                </figcaption>
              </motion.figure>
            ))}
          </div>
        </motion.div>

        {/* Process */}
        <BoardCard title="Process Trail" color="bg-white" tapeColor={accent.tape} className="mt-16">
          <div className="grid gap-4 md:grid-cols-5">
            {caseStudy.steps.map((step, index) => (
              <div key={step.label} className="relative border border-dashed border-gray-300 bg-white/70 px-4 py-4 text-center" style={{ borderRadius: '8px' }}>
                <span className="absolute -top-5 left-1/2 h-4 w-12 -translate-x-1/2 bg-gray-200/80" style={{ clipPath: 'polygon(0 0, 100% 0, 95% 100%, 5% 100%)' }} />
                <span className="handwritten text-xs uppercase tracking-[0.4em] text-gray-500">Chapter {index + 1}</span>
                <h3 className="handwritten mt-3 text-lg uppercase tracking-[0.3em] text-gray-800">{step.label}</h3>
                <p className="mt-2 text-sm text-gray-600 handwritten leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </BoardCard>

        {/* Identity */}
        {caseStudy.branding && (
          <div className="mt-14 grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
            <BoardCard title="Visual Language" color="bg-white" tapeColor={accent.tape}>
              <p className="handwritten text-gray-700 leading-relaxed mb-6">
                {caseStudy.branding.description}
              </p>
              <div className="flex flex-wrap gap-4">
                {caseStudy.branding.colors.map((color) => (
                  <div key={color} className="text-center">
                    <div
                      className="h-16 w-16 rounded-none border border-gray-200 shadow-sm"
                      style={{ backgroundColor: color }}
                    />
                    <span className="handwritten mt-2 block text-xs uppercase tracking-[0.3em] text-gray-600">
                      {color}
                    </span>
                  </div>
                ))}
              </div>
            </BoardCard>

            <BoardCard title="Type Stack" color="bg-white" tapeColor={accent.tape}>
              <div className="space-y-5">
                <div className="bg-gray-50 border border-gray-200 px-4 py-4" style={{ borderRadius: '6px' }}>
                  <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Primary</p>
                  <p className="mt-2 text-2xl" style={{ fontFamily: caseStudy.branding.typography.primary }}>
                    {caseStudy.branding.typography.primary}
                  </p>
                </div>
                <div className="bg-gray-50 border border-gray-200 px-4 py-4" style={{ borderRadius: '6px' }}>
                  <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Secondary</p>
                  <p className="mt-2 text-2xl" style={{ fontFamily: caseStudy.branding.typography.secondary }}>
                    {caseStudy.branding.typography.secondary}
                  </p>
                </div>
              </div>
            </BoardCard>
          </div>
        )}

        {/* Ideation */}
        {caseStudy.ideation && (
          <BoardCard title="Idea Lab" color="bg-white" tapeColor={accent.tape} className="mt-14">
            <p className="handwritten text-gray-700 leading-relaxed mb-6">{caseStudy.ideation.description}</p>
            {caseStudy.ideation.keyInsights && (
              <div className="grid gap-4 md:grid-cols-2">
                {caseStudy.ideation.keyInsights.map((insight) => (
                  <div key={insight} className="relative border border-gray-200 bg-yellow-50 px-4 py-4" style={{ borderRadius: '6px' }}>
                    <span className="absolute -top-3 right-4 text-yellow-500">✨</span>
                    <p className="handwritten text-sm leading-relaxed text-gray-700">{insight}</p>
                  </div>
                ))}
              </div>
            )}
          </BoardCard>
        )}

        {/* Final Screens */}
        {caseStudy.finalScreens && (
          <BoardCard title="Final State" color="bg-white" tapeColor={accent.tape} className="mt-14">
            <p className="handwritten text-gray-700 leading-relaxed mb-6">{caseStudy.finalScreens.description}</p>
            <div className="grid gap-4 md:grid-cols-3">
              {caseStudy.finalScreens.images.map((img, index) => (
                <figure key={img} className="relative">
                  <span className={`absolute -top-3 left-1/2 h-4 w-14 -translate-x-1/2 ${accent.tape} opacity-70`} style={{ clipPath: 'polygon(0 0, 100% 0, 95% 100%, 5% 100%)' }} />
                  <Image
                    src={img}
                    alt={`Final screen ${index + 1}`}
                    width={480}
                    height={320}
                    className="h-44 w-full rounded-none border border-gray-200 object-cover shadow-sm"
                  />
                </figure>
              ))}
            </div>
            {caseStudy.finalScreens.features && (
              <ul className="mt-6 grid gap-3 md:grid-cols-2">
                {caseStudy.finalScreens.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 handwritten text-sm text-gray-700">
                    <span className="mt-1">•</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            )}
          </BoardCard>
        )}

        {/* Results */}
        {caseStudy.results && (
          <BoardCard title="Impact" color="bg-white" tapeColor={accent.tape} className="mt-14">
            <div className="grid gap-4 md:grid-cols-3">
              {caseStudy.results.map((result) => (
                <div key={result.metric} className="border border-gray-200 bg-white/80 px-4 py-4 text-center" style={{ borderRadius: '8px' }}>
                  <p className="handwritten text-xs uppercase tracking-[0.3em] text-gray-500">{result.metric}</p>
                  <p className="handwritten mt-3 text-3xl uppercase tracking-[0.3em] text-gray-900">{result.value}</p>
                  {result.description && (
                    <p className="mt-3 text-sm text-gray-600 handwritten leading-relaxed">{result.description}</p>
                  )}
                </div>
              ))}
            </div>
          </BoardCard>
        )}

        {/* Resources */}
        {caseStudy.links && caseStudy.links.length > 0 && (
          <BoardCard title="Artifacts" color="bg-white" tapeColor={accent.tape} className="mt-14">
            <div className="flex flex-wrap gap-4">
              {caseStudy.links.map((link) => (
                <a
                  key={link.title}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 rounded-none border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <span>{link.icon ?? '🔗'}</span>
                  <span className="handwritten uppercase tracking-[0.35em]">{link.title}</span>
                </a>
              ))}
            </div>
          </BoardCard>
        )}

        {/* Figma Prototype */}
        {caseStudy.figmaEmbed && (
          <BoardCard title="Prototype" color="bg-white" tapeColor={accent.tape} className="mt-14">
            <div className="border border-gray-200 bg-white shadow-inner" style={{ borderRadius: '12px' }}>
              <div className="relative w-full overflow-hidden" style={{ paddingTop: '56.25%' }}>
                <iframe
                  src={caseStudy.figmaEmbed.embedUrl}
                  title={caseStudy.figmaEmbed.title}
                  allowFullScreen
                  className="absolute inset-0 h-full w-full"
                />
              </div>
              {caseStudy.figmaEmbed.description && (
                <p className="handwritten text-sm text-gray-600 px-4 py-4 leading-relaxed">
                  {caseStudy.figmaEmbed.description}
                </p>
              )}
            </div>
          </BoardCard>
        )}

        {/* CTA */}
        <div className="mt-16 flex flex-wrap items-center justify-between gap-4 rounded-none border border-dashed border-gray-400/60 bg-white/80 px-8 py-8 shadow-sm">
          <div>
            <h3 className="handwritten text-3xl uppercase tracking-[0.3em] text-gray-900">Thanks for exploring the board ✨</h3>
            <p className="handwritten mt-3 text-base text-gray-600">Want to add your ideas? Ping me and we&apos;ll co-create.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/case-studies"
              className="rounded-none border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
            >
              ← Board overview
            </Link>
            <Link
              href="/contact"
              className="rounded-none bg-blue-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-600"
            >
              ✉️ Collaborate
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
