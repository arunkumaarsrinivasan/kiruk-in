'use client';

import ScribbleAnimation from '@/components/three/scribble-animation';
import { SketchHeading, SketchCard, SketchButton, SketchHighlight, StickyNote } from '@/components/ui/sketch-elements';
import { motion } from 'framer-motion';

export default function Work() {
  const featuredProjects = [
    {
      title: "AI-Powered Design System",
      description: "A design system that adapts and evolves using machine learning",
      status: "In Progress",
      // Replace emoji with hand-drawn icon
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" style={{ filter: 'url(#roughen)' }}>
          <defs>
            <filter id="roughen">
              <feTurbulence baseFrequency="0.04" numOctaves="3" result="noise" seed="1" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.8" />
            </filter>
          </defs>
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10" />
        </svg>
      ),
      color: "gray",
      tags: ["AI", "Design Systems", "Automation"]
    },
    {
      title: "Scribble-to-Wireframe Tool",
      description: "Converting hand-drawn sketches to digital wireframes using AI",
      status: "Research Phase",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" style={{ filter: 'url(#roughen)' }}>
          <defs>
            <filter id="roughen">
              <feTurbulence baseFrequency="0.04" numOctaves="3" result="noise" seed="1" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.8" />
            </filter>
          </defs>
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 3a4 4 0 100 8 4 4 0 000-8z" />
        </svg>
      ),
      color: "dark",
      tags: ["Computer Vision", "UX Tools", "Prototyping"]
    },
    {
      title: "Empathy-Driven Analytics",
      description: "User analytics that prioritize human emotion and context",
      status: "Concept",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" style={{ filter: 'url(#roughen)' }}>
          <defs>
            <filter id="roughen">
              <feTurbulence baseFrequency="0.04" numOctaves="3" result="noise" seed="1" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.8" />
            </filter>
          </defs>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ),
      color: "light",
      tags: ["Analytics", "Emotion AI", "Ethics"]
    }
  ];  return (
    <main className="min-h-screen scrollable-content pt-16 notebook-bg">
      {/* Hero Section with Scribble Background */}      <section className="relative min-h-screen flex flex-col">
        {/* Scribble Background */}
        <div className="absolute inset-0 opacity-15">
          <ScribbleAnimation className="w-full h-full" />
        </div>
        
        {/* Floating project ideas */}
        <motion.div
          className="absolute top-20 right-10 hidden lg:block"
          animate={{ 
            rotate: [0, 3, -3, 0],
            y: [0, -15, 15, 0] 
          }}
          transition={{ 
            duration: 12, 
            repeat: Infinity,
            ease: "easeInOut" 
          }}
        >
          <StickyNote color="light" className="w-44 h-36">
            <div className="handwritten text-xs">
              🚀 Project Ideas:
              <br />• AI sketch reader
              <br />• Emotion-based UX
              <br />• Voice-to-wireframe
              <br />• Predictive design
            </div>
          </StickyNote>
        </motion.div>

        <motion.div
          className="absolute bottom-32 left-10 hidden lg:block"
          animate={{ 
            rotate: [0, -2, 2, 0],
            x: [0, 10, -10, 0] 
          }}
          transition={{ 
            duration: 8, 
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2 
          }}
        >
          <StickyNote color="medium" className="w-40 h-32">
            <div className="handwritten text-xs">
              💡 "The best UX feels invisible"
              <br />
              <span className="text-gray-700">- Every great designer</span>
            </div>
          </StickyNote>
        </motion.div>        
        <div className="relative h-full flex flex-col justify-center max-w-6xl mx-auto px-6 sm:px-8 z-10">
          {/* Header */}
          <motion.div 
            className="text-center mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}          >            <SketchHeading level={1} className="heading-primary-extra-heavy text-3xl sm:text-4xl mb-4">
              My{" "}
              <SketchHighlight color="dark">Work</SketchHighlight>
            </SketchHeading>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="notebook-paper p-4 mx-auto max-w-2xl rounded-lg"            >
              <p className="body-text-secondary text-base text-gray-600">
                A collection of projects where AI meets UX design, each one starting with a simple scribble.
              </p>
            </motion.div>
          </motion.div>

          {/* Featured Projects Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mb-8"
          >
            <div className="grid md:grid-cols-3 gap-6">
              {featuredProjects.map((project, index) => (
                <motion.div
                  key={project.title}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1 + index * 0.2 }}
                >
                  <SketchCard 
                    tilt={index % 2 === 0 ? 'left' : 'right'} 
                    className="h-full relative overflow-hidden p-4"
                  >
                    {/* Project status badge */}
                    <div className="absolute top-2 right-2">
                      <StickyNote 
                        color={project.color as any} 
                        className="w-16 h-12 text-xs"
                      >
                        <div className="handwritten text-[8px]">
                          {project.status}
                        </div>
                      </StickyNote>
                    </div>                    <div className="text-center mb-3">
                      <div className="text-2xl mb-2">{project.icon}</div>                      <SketchHeading level={3} className="heading-tertiary-enhanced text-base mb-2" underline={false}>
                        {project.title}
                      </SketchHeading>
                    </div>

                    <div className="body-text-secondary text-gray-600 text-xs mb-3">
                      {project.description}
                    </div>

                    <div className="flex flex-wrap gap-1 mb-3">
                      {project.tags.slice(0, 2).map((tag) => (
                        <span 
                          key={tag}
                          className="sketch-tag handwritten text-[10px] px-1 py-0.5 rounded border border-gray-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="text-center">
                      <SketchButton size="sm" variant="outline" disabled>
                        Coming Soon
                      </SketchButton>
                    </div>
                  </SketchCard>
                </motion.div>
              ))}
            </div>
          </motion.div>          {/* Portfolio Status */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 2 }}
            className="text-center"
          >
            <SketchCard className="max-w-3xl mx-auto p-6">
              <div className="text-center">                <div className="handwritten text-3xl mb-3">🎨</div>                <SketchHeading level={2} className="heading-secondary-extra-heavy text-xl mb-3">
                  Portfolio Under Construction
                </SketchHeading>
                <div className="body-text-secondary text-gray-600 mb-4 text-sm space-y-1"><p>
                    Curating my best work and case studies. Each project will showcase the journey from{" "}
                    <SketchHighlight color="muted">scribbles</SketchHighlight>
                    {" "}to{" "}
                    <SketchHighlight color="dark">digital experiences</SketchHighlight>.
                  </p>
                </div>
                
                <div className="flex gap-4 justify-center">
                  <SketchButton href="/about" variant="primary">
                    Learn About Me
                  </SketchButton>
                  <SketchButton href="/contact" variant="outline">
                    Let's Work Together
                  </SketchButton>
                  <SketchButton href="/interactive-demo" variant="outline">
                    Try Interactive Demo
                  </SketchButton>
                </div>
              </div>
            </SketchCard>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
