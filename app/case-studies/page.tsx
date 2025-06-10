'use client';

import ScribbleAnimation from '@/components/three/scribble-animation';
import { SketchHeading, SketchCard, SketchButton, SketchHighlight, StickyNote } from '@/components/ui/sketch-elements';
import { motion } from 'framer-motion';

export default function CaseStudies() {
  return (
    <main className="min-h-screen scrollable-content pt-16 notebook-bg">
      {/* Single viewport section */}
      <section className="relative min-h-screen flex flex-col">
        {/* Scribble Background */}
        <div className="absolute inset-0 opacity-10">
          <ScribbleAnimation className="w-full h-full" />
        </div>
        
        {/* Floating note */}
        <motion.div
          className="absolute top-16 right-8 hidden lg:block z-20"
          animate={{ 
            rotate: [0, 4, -4, 0],
            y: [0, -12, 12, 0] 
          }}
          transition={{ 
            duration: 10, 
            repeat: Infinity,
            ease: "easeInOut" 
          }}
        >
          <StickyNote color="light" className="w-32 h-24">
            <div className="handwritten text-xs flex items-center gap-2">
              {/* Hand-drawn Studies icon */}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" style={{ filter: 'url(#roughen)' }}>
                <defs>
                  <filter id="roughen">
                    <feTurbulence baseFrequency="0.04" numOctaves="3" result="noise" seed="1" />
                    <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.8" />
                  </filter>
                </defs>
                <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
              </svg>
              Case Studies:
              <br />• In Progress
              <br />• Coming Soon
              <br />• Stay Tuned!
            </div>
          </StickyNote>
        </motion.div>
        
        <div className="relative h-full flex flex-col justify-center max-w-5xl mx-auto px-4 sm:px-6 z-10">
          {/* Header */}
          <motion.div 
            className="text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >            <SketchHeading level={1} className="heading-primary-enhanced text-2xl sm:text-3xl mb-3">
              CASE{" "}
              <SketchHighlight color="dark">Studies</SketchHighlight>
            </SketchHeading>
            <p className="body-text-primary text-sm text-gray-600 max-w-lg mx-auto">
              Deep dives into my design process, from initial sketches to final implementations.
            </p>
          </motion.div>

          {/* Main Content Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid md:grid-cols-2 gap-6 flex-1"
          >
            {/* Interactive Scribble Canvas */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <SketchCard tilt="left" className="h-full p-4">                <SketchHeading level={2} className="heading-secondary-enhanced text-lg mb-3">
                  Creative Process Canvas
                </SketchHeading>
                
                <div className="relative h-48 rounded-lg overflow-hidden bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 mb-3">
                  <ScribbleAnimation className="w-full h-full opacity-70" />
                  <div className="absolute bottom-2 left-2 right-2">                    <div className="body-text-secondary text-xs text-gray-600 bg-white/90 p-2 rounded">
                      Click and drag to create scribbles that mirror how each project begins
                    </div>
                  </div>
                </div>                  <p className="body-text-primary text-xs text-gray-600">
                  This interactive canvas represents my design thinking process - 
                  every great idea starts with a{" "}
                  <SketchHighlight color="muted">simple scribble</SketchHighlight>.
                </p>
              </SketchCard>
            </motion.div>

            {/* Case Studies Status */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="space-y-4"
            >
              {/* Coming Soon Card */}
              <SketchCard tilt="right" className="p-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg mx-auto mb-3 flex items-center justify-center">
                    <span className="text-2xl">📚</span>
                  </div>                  <SketchHeading level={3} className="heading-tertiary-enhanced text-base mb-2" underline={false}>
                    Case Studies In Progress
                  </SketchHeading>
                  <p className="body-text-primary text-xs text-gray-600 mb-3">
                    Documenting detailed case studies that showcase my design thinking process.
                  </p>
                </div>
              </SketchCard>

              {/* What to Expect */}
              <SketchCard className="p-4">                <SketchHeading level={3} className="heading-tertiary-enhanced text-sm mb-2" underline={false}>
                  What to Expect:
                </SketchHeading>
                  <div className="space-y-1">                  <div className="flex items-start space-x-2">
                    <span className="text-gray-800 text-xs">•</span>
                    <span className="body-text-secondary text-xs text-gray-600">Problem definition & user research</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-gray-700 text-xs">•</span>
                    <span className="body-text-secondary text-xs text-gray-600">Sketching & ideation process</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-gray-600 text-xs">•</span>
                    <span className="body-text-secondary text-xs text-gray-600">AI-enhanced design decisions</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-black text-xs">•</span>
                    <span className="body-text-secondary text-xs text-gray-600">Prototyping & user testing</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-gray-500 text-xs">•</span>
                    <span className="body-text-secondary text-xs text-gray-600">Implementation & results</span>
                  </div>
                </div>
              </SketchCard>

              {/* CTA */}
              <SketchCard className="p-4 text-center">
                <div className="body-text-primary text-lg mb-2">🚀</div>                <div className="body-text-secondary text-gray-600 mb-3 text-xs">
                  Interested in my process? Check out my{" "}
                  <SketchHighlight color="dark">current work</SketchHighlight>!
                </div>
                <div className="flex gap-2 justify-center">                  <SketchButton href="/work" variant="primary" className="btn-primary-text text-xs px-3 py-1">
                    View Work
                  </SketchButton>
                  <SketchButton href="/contact" variant="outline" className="btn-secondary-text text-xs px-3 py-1">
                    Let's Talk
                  </SketchButton>
                </div>
              </SketchCard>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
