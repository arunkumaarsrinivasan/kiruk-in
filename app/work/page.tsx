'use client';

import ScribbleAnimation from '@/components/three/scribble-animation';
import { SketchHeading, SketchCard, SketchButton, SketchArrow, SketchHighlight, StickyNote, SketchDivider } from '@/components/ui/sketch-elements';
import { motion } from 'framer-motion';

export default function Work() {
  const featuredProjects = [
    {
      title: "AI-Powered Design System",
      description: "A design system that adapts and evolves using machine learning",
      status: "In Progress",
      emoji: "🤖",
      color: "blue",
      tags: ["AI", "Design Systems", "Automation"]
    },
    {
      title: "Scribble-to-Wireframe Tool",
      description: "Converting hand-drawn sketches to digital wireframes using AI",
      status: "Research Phase",
      emoji: "✏️",
      color: "orange",
      tags: ["Computer Vision", "UX Tools", "Prototyping"]
    },
    {
      title: "Empathy-Driven Analytics",
      description: "User analytics that prioritize human emotion and context",
      status: "Concept",
      emoji: "❤️",
      color: "pink",
      tags: ["Analytics", "Emotion AI", "Ethics"]
    }
  ];

  return (
    <main className="pt-16 notebook-bg">
      {/* Hero Section with Scribble Background */}
      <section className="relative py-20 overflow-hidden">
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
          <StickyNote color="yellow" className="w-44 h-36">
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
          <StickyNote color="blue" className="w-40 h-32">
            <div className="handwritten text-xs">
              💡 "The best UX feels invisible"
              <br />
              <span className="text-sketch-purple">- Every great designer</span>
            </div>
          </StickyNote>
        </motion.div>
        
        <div className="relative max-w-6xl mx-auto px-6 sm:px-8 z-10">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <SketchHeading level={1} className="text-4xl sm:text-5xl mb-6">
              My{" "}
              <SketchHighlight color="yellow">Work</SketchHighlight>
            </SketchHeading>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="notebook-paper p-6 mx-auto max-w-2xl rounded-lg"
            >
              <p className="handwritten text-lg text-gray-600">
                A collection of projects where AI meets UX design, each one starting with a simple scribble.
              </p>
            </motion.div>

            {/* Hand-drawn doodles around title */}
            <motion.div
              className="absolute -top-8 left-1/2 transform -translate-x-1/2 hidden sm:block"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 1 }}
            >
              <div className="handwritten text-2xl text-sketch-purple transform -rotate-12">
                ⭐ Featured Work
              </div>            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Work Section */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6 sm:px-8">
          {/* Interactive Portfolio Showcase */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="relative mb-20"
          >
            <SketchCard className="p-8 text-center">
              <div className="relative h-64 rounded-xl overflow-hidden mb-6">
                <ScribbleAnimation className="w-full h-full opacity-40" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="notebook-paper p-6 rounded-lg shadow-lg max-w-md">
                    <SketchHeading level={2} className="text-xl mb-4" underline={false}>
                      Interactive Scribble Portfolio
                    </SketchHeading>
                    <p className="handwritten text-gray-600 mb-4 text-sm">
                      Explore my work through interactive scribbling. Move your mouse to create trails that represent 
                      the creative process behind each project.
                    </p>
                    <div className="flex justify-center">
                      <SketchArrow direction="up" className="w-6 h-6" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="handwritten text-sm text-sketch-blue">
                ✨ Move your mouse above to see the magic happen
              </div>
            </SketchCard>
          </motion.div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6 sm:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <div className="text-center mb-16">
              <SketchHeading level={2} className="text-3xl mb-4">
                Featured Projects
              </SketchHeading>
              <div className="handwritten text-lg text-gray-600">
                Where creativity meets technology
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {featuredProjects.map((project, index) => (
                <motion.div
                  key={project.title}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1 + index * 0.2 }}
                >
                  <SketchCard 
                    tilt={index % 2 === 0 ? 'left' : 'right'} 
                    className="h-full relative overflow-hidden"
                  >
                    {/* Project status badge */}
                    <div className="absolute top-4 right-4">
                      <StickyNote 
                        color={project.color as any} 
                        className="w-20 h-16 text-xs"
                      >
                        <div className="handwritten text-[10px]">
                          {project.status}
                        </div>
                      </StickyNote>
                    </div>

                    <div className="text-center mb-4">
                      <div className="text-4xl mb-3">{project.emoji}</div>
                      <SketchHeading level={3} className="text-xl mb-3" underline={false}>
                        {project.title}
                      </SketchHeading>
                    </div>

                    <div className="handwritten text-gray-600 text-sm mb-6">
                      {project.description}
                    </div>

                    <div className="flex flex-wrap gap-2 mb-6">
                      {project.tags.map((tag) => (
                        <span 
                          key={tag}
                          className="sketch-tag handwritten text-xs px-2 py-1 rounded-lg border-2 border-gray-300"
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

            <SketchDivider className="my-20" />

            {/* Portfolio Status */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 2 }}
              className="text-center"
            >
              <SketchCard className="max-w-2xl mx-auto">
                <div className="text-center">
                  <div className="handwritten text-6xl mb-6">🎨</div>
                  <SketchHeading level={2} className="text-2xl mb-4">
                    Portfolio Under Construction
                  </SketchHeading>
                  <div className="handwritten text-gray-600 mb-6 space-y-2">
                    <p>
                      I'm currently curating my best work and case studies.
                    </p>
                    <p>
                      Each project will showcase the journey from{" "}
                      <SketchHighlight color="yellow">initial scribbles</SketchHighlight>
                      {" "}to{" "}
                      <SketchHighlight color="blue">final digital experiences</SketchHighlight>.
                    </p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                    <SketchButton href="/about" variant="primary">
                      Learn About Me
                    </SketchButton>
                    <SketchButton href="/contact" variant="outline">
                      Let's Work Together
                    </SketchButton>
                  </div>

                  {/* Hand-drawn arrow with note */}
                  <motion.div
                    className="flex justify-center mt-8"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 2.5 }}
                  >
                    <div className="text-center">
                      <SketchArrow direction="down" className="w-6 h-8 mx-auto mb-2" />
                      <div className="handwritten text-xs text-sketch-purple">
                        Check back soon for updates!
                      </div>
                    </div>
                  </motion.div>                </div>
              </SketchCard>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
