'use client';

import ScribbleAnimation from '@/components/three/scribble-animation';
import { SketchHeading, SketchCard, SketchButton, SketchHighlight, StickyNote } from '@/components/ui/sketch-elements';
import { motion } from 'framer-motion';

export default function About() {
  return (
    <main className="min-h-screen scrollable-content pt-16 notebook-bg">
      {/* Hero Section with Scribble Background */}
      <section className="relative min-h-screen flex flex-col">
        {/* Scribble Background */}
        <div className="absolute inset-0 opacity-20">
          <ScribbleAnimation className="w-full h-full" />
        </div>
        
        {/* Floating sticky notes */}
        <motion.div
          className="absolute top-10 right-10 hidden lg:block"
          animate={{ rotate: [2, -2, 2] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          <StickyNote className="w-40 h-32">
            <div className="handwritten text-xs flex items-center gap-2">
              {/* Hand-drawn Home icon */}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" style={{ filter: 'url(#roughen)' }}>
                <defs>
                  <filter id="roughen">
                    <feTurbulence baseFrequency="0.04" numOctaves="3" result="noise" seed="1" />
                    <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.8" />
                  </filter>
                </defs>
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10" />
              </svg>
              "கற்பனை + Code = Magic"
              <br />
              <span className="text-gray-700">- Kiruk</span>
            </div>
          </StickyNote>
        </motion.div>

        <motion.div
          className="absolute bottom-10 left-10 hidden lg:block"
          animate={{ rotate: [-1, 1, -1] }}
          transition={{ duration: 5, repeat: Infinity, delay: 1 }}
        >
          <StickyNote color="light" className="w-36 h-28">
            <div className="handwritten text-xs flex items-center gap-2">
              {/* Hand-drawn About icon */}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" style={{ filter: 'url(#roughen)' }}>
                <defs>
                  <filter id="roughen">
                    <feTurbulence baseFrequency="0.04" numOctaves="3" result="noise" seed="1" />
                    <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.8" />
                  </filter>
                </defs>
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 3a4 4 0 100 8 4 4 0 000-8z" />
              </svg>
              📝 Adventures:
              <br />• Trek mountains
              <br />• Document life
              <br />• Code solutions
            </div>
          </StickyNote>
        </motion.div>        
        <div className="relative h-full flex flex-col justify-center max-w-6xl mx-auto px-6 sm:px-8 z-10">
          {/* Header */}
          <motion.div 
            className="text-center mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >            <SketchHeading level={1} className="heading-primary-enhanced text-3xl sm:text-4xl mb-4">
              About{" "}
              <SketchHighlight color="dark">Kiruk</SketchHighlight>
            </SketchHeading>            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="notebook-paper p-4 mx-auto max-w-2xl rounded-lg"
            >
              <p className="body-text-primary">
                A UX designer from Tamil Nadu who thinks differently about design and code.
                <br />
                Generalist by heart, specialist when needed. 🎨💻
              </p>
            </motion.div>
          </motion.div>

          {/* Main Content Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid lg:grid-cols-3 gap-6 mb-8"
          >
            {/* Philosophy */}
            <SketchCard tilt="left" className="h-full">              <SketchHeading level={2} className="heading-secondary-enhanced text-xl mb-3">
                The Philosophy
              </SketchHeading>
              <div className="body-text-secondary text-sm space-y-2">
                <p>
                  From Tamil Nadu hills, I bring unique perspective to design & dev. 
                  <SketchHighlight color="muted">"Kiruk"</SketchHighlight> is my approach.
                </p>
                <p>
                  <SketchHighlight color="gray">Generalist with big picture vision</SketchHighlight>, specialist when needed.
                </p>
              </div>
            </SketchCard>
            
            {/* What I Do */}
            <SketchCard tilt="right" className="h-full">              <SketchHeading level={3} className="heading-tertiary-enhanced text-lg mb-3" underline={false}>
                What I Love 💫
              </SketchHeading>
              <div className="space-y-2">
                {[
                  { icon: "🎨", text: "UX Design", color: "text-gray-800" },
                  { icon: "💻", text: "Frontend Dev", color: "text-gray-700" },
                  { icon: "🏔️", text: "Trekking", color: "text-gray-600" },
                  { icon: "📸", text: "Photography", color: "text-black" }
                ].map((skill, index) => (
                  <motion.div
                    key={skill.text}
                    className="flex items-center space-x-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                  >
                    <span className="text-lg">{skill.icon}</span>
                    <span className={`body-text-secondary text-sm ${skill.color}`}>{skill.text}</span>
                  </motion.div>
                ))}
              </div>
            </SketchCard>

            {/* Approach */}
            <SketchCard className="h-full">              <SketchHeading level={2} className="heading-secondary-enhanced text-xl mb-3">
                My Approach
              </SketchHeading>
              <div className="space-y-3">
                <motion.div
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1 }}
                >
                  <div className="handwritten text-2xl text-black mb-1">🧠</div>
                  <h4 className="handwritten text-sm font-bold text-gray-800 mb-1">Think Different</h4>
                  <p className="handwritten text-xs text-gray-600">
                    கிறுக் means thinking outside boundaries
                  </p>
                </motion.div>
                
                <motion.div
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.2 }}
                >
                  <div className="handwritten text-2xl text-gray-700 mb-1">⚡</div>
                  <h4 className="handwritten text-sm font-bold text-gray-800 mb-1">Build Fast</h4>
                  <p className="handwritten text-xs text-gray-600">
                    Prototype quickly, iterate constantly
                  </p>
                </motion.div>
              </div>
            </SketchCard>
          </motion.div>

          {/* Skills Row */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.0 }}
            className="mb-6"
          >
            <SketchCard>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="handwritten text-base font-bold text-gray-800 mb-2">🎨 Design Skills</h3>
                  <ul className="handwritten text-sm text-gray-600 space-y-1">
                    <li>• UX/UI Design • Design Systems • Prototyping</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="handwritten text-base font-bold text-gray-700 mb-2">💻 Coding Skills</h3>
                  <ul className="handwritten text-sm text-gray-600 space-y-1">
                    <li>• React/Next.js • TypeScript • UI Animation</li>
                  </ul>
                </div>
              </div>
            </SketchCard>
          </motion.div>

          {/* CTA */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.6 }}
          >
            <div className="flex gap-4 justify-center">
              <SketchButton href="/work" variant="primary">
                See My Work
              </SketchButton>
              <SketchButton href="/contact" variant="outline">
                Let's Connect
              </SketchButton>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
