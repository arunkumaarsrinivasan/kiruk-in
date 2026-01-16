'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { WireframeCodeBlock } from '@/components/ui/wireframe/WireframeCodeBlock';
import { WireframePreviewCard } from '@/components/ui/wireframe/WireframePreviewCard';

/**
 * HeroWireframe Component
 * 
 * App/editor-style hero section with code editor + preview card layout.
 * Responsive grid: text left, visual panel right (stacks on mobile).
 */
export default function HeroWireframe() {
  // Real code snippet from portfolio - React component example
  const codeSnippet = `import { motion } from 'framer-motion';
import { WireframeCard } from '@/components/ui/wireframe';

export function PortfolioCard({ project }) {
  return (
    <WireframeCard
      header={<h3>{project.title}</h3>}
      badge={project.status}
    >
      <p>{project.description}</p>
      <div className="flex gap-2">
        {project.technologies.map(tech => (
          <span key={tech}>{tech}</span>
        ))}
      </div>
    </WireframeCard>
  );
}`;

  return (
    <section className="grid-mb-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-center">
        {/* Left Side: Text Content */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col gap-6"
        >
          {/* Headline */}
          <h1
            className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter"
            style={{
              fontFamily: 'var(--font-heading)',
              color: 'var(--text-main)',
            }}
          >
            Hey, I'm{' '}
            <span style={{ color: 'var(--accent-color)' }}>Arun</span>
          </h1>

          {/* Supporting Line */}
          <p
            className="text-lg md:text-xl font-medium leading-relaxed"
            style={{
              fontFamily: 'var(--font-body)',
              color: 'var(--text-main)',
            }}
          >
            I speak both <strong>design</strong> and <strong>code</strong> fluently,
            bridging the gap between creative vision and technical execution.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-4 grid-mt-2">
            <motion.a
              href="#work"
              className="px-6 py-3 border-2 font-mono font-bold uppercase text-sm cursor-pointer"
              style={{
                borderColor: 'var(--accent-color)',
                backgroundColor: 'var(--accent-color)',
                color: 'var(--bg-main)',
              }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              See My Work
            </motion.a>
            <motion.a
              href="/contact"
              className="px-6 py-3 border-2 font-mono font-bold uppercase text-sm cursor-pointer"
              style={{
                borderColor: 'var(--accent-color)',
                backgroundColor: 'transparent',
                color: 'var(--accent-color)',
              }}
              whileHover={{
                scale: 1.05,
                y: -2,
                backgroundColor: 'var(--accent-color)',
                color: 'var(--bg-main)',
              }}
              whileTap={{ scale: 0.95 }}
            >
              Contact Me
            </motion.a>
          </div>
        </motion.div>

        {/* Right Side: Code Editor + Preview Card */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative"
        >
          {/* Code Editor Panel */}
          <div className="grid-mb-4">
            {/* Fake Window Chrome */}
            <div
              className="flex items-center gap-2 grid-p-2 border-b rounded-t-[var(--wireframe-border-radius,12px)]"
              style={{
                borderColor: 'var(--wireframe-border-color, var(--border-color))',
                backgroundColor: 'transparent',
              }}
            >
              {/* Window Controls */}
              <div className="flex gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: '#ef4444' }}
                />
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: '#f59e0b' }}
                />
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: '#10b981' }}
                />
              </div>
              {/* Tab Name */}
              <span
                className="text-[10px] font-mono uppercase ml-4"
                style={{ color: 'var(--text-muted)' }}
              >
                PortfolioCard.tsx
              </span>
            </div>

            {/* Code Block */}
            <WireframeCodeBlock
              code={codeSnippet}
              language="typescript"
              showLineNumbers={true}
              copyable={false}
            />
          </div>

          {/* Preview Card - Overlapping Design */}
          <div className="relative" style={{ marginLeft: '2rem', marginTop: '-2rem' }}>
            <WireframePreviewCard
              title="Portfolio Project"
              badge="v3.0"
              badgeVariant="accent"
              overlap={true}
            >
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="aspect-square border"
                    style={{
                      borderColor: 'var(--wireframe-border-color, var(--border-color))',
                      backgroundColor: 'transparent',
                    }}
                  />
                ))}
              </div>
            </WireframePreviewCard>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
