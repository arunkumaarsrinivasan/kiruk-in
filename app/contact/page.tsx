'use client';

import ScribbleAnimation from '@/components/three/scribble-animation';
import { SketchHeading, SketchCard, SketchButton, SketchHighlight, StickyNote } from '@/components/ui/sketch-elements';
import { motion } from 'framer-motion';

export default function Contact() {
  return (
    <main className="min-h-screen scrollable-content pt-16 notebook-bg">
      {/* Single viewport section */}
      <section className="relative min-h-screen flex flex-col">
        {/* Scribble Background */}
        <div className="absolute inset-0 opacity-10">
          <ScribbleAnimation className="w-full h-full" />
        </div>
        
        {/* Floating contact note */}
        <motion.div
          className="absolute top-16 right-8 hidden lg:block z-20"
          animate={{ 
            rotate: [0, 3, -3, 0],
            y: [0, -10, 10, 0] 
          }}
          transition={{ 
            duration: 8, 
            repeat: Infinity,
            ease: "easeInOut" 
          }}
        >
          <StickyNote color="medium" className="w-28 h-20">
            <div className="handwritten text-xs flex items-center gap-2">
              {/* Hand-drawn Contact icon */}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" style={{ filter: 'url(#roughen)' }}>
                <defs>
                  <filter id="roughen">
                    <feTurbulence baseFrequency="0.04" numOctaves="3" result="noise" seed="1" />
                    <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.8" />
                  </filter>
                </defs>
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z M9 9h6 M9 13h3" />
              </svg>
              Contact:
              <br />• Email (best)
              <br />• LinkedIn
            </div>
          </StickyNote>
        </motion.div>        
        <div className="relative flex flex-col justify-center max-w-5xl mx-auto px-4 sm:px-6 z-10 py-8 min-h-screen w-full">
          {/* Compact Header */}
          <motion.div 
            className="text-center mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >            <SketchHeading level={1} className="heading-primary-enhanced text-2xl sm:text-3xl mb-3">
              Let's{" "}
              <SketchHighlight color="dark">Create</SketchHighlight>
              {" "}Together
            </SketchHeading>
            <p className="body-text-secondary max-w-lg mx-auto">
              Have a project in mind? Let's start with a conversation.
            </p>
          </motion.div>

          {/* Main Content Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid md:grid-cols-2 gap-6 flex-1"
          >
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <SketchCard tilt="left" className="h-full p-4">                <SketchHeading level={2} className="heading-secondary-enhanced text-lg mb-3">
                  Send a Message
                </SketchHeading>
                  <form className="space-y-3">                  <div>
                    <label htmlFor="contact-name" className="form-label-enhanced">
                      Name
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      className="w-full p-2 border-2 border-gray-300 rounded-lg form-input-enhanced text-focus-enhanced sketch-focus focus:border-gray-600 outline-none"
                      placeholder="Your name"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="contact-email" className="form-label-enhanced">
                      Email
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      className="w-full p-2 border-2 border-gray-300 rounded-lg form-input-enhanced text-focus-enhanced sketch-focus focus:border-gray-600 outline-none"
                      placeholder="your@email.com"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="contact-message" className="form-label-enhanced">
                      Message
                    </label>
                    <textarea
                      id="contact-message"
                      rows={3}
                      className="w-full p-2 border-2 border-gray-300 rounded-lg form-input-enhanced text-focus-enhanced sketch-focus focus:border-gray-600 outline-none resize-none"
                      placeholder="Tell me about your project..."
                    />
                  </div>
                  
                  <SketchButton type="submit" variant="primary" className="w-full text-sm btn-primary-text">
                    Send Message 📧
                  </SketchButton>
                </form>
              </SketchCard>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="space-y-4"
            >
              {/* Direct Contact */}
              <SketchCard tilt="right" className="p-4">                <SketchHeading level={3} className="heading-tertiary-enhanced text-base mb-3" underline={false}>
                  Direct Contact
                </SketchHeading>
                
                <div className="space-y-2">
                  <motion.div
                    className="flex items-center space-x-2"
                    whileHover={{ scale: 1.02 }}
                  >                    <span className="text-lg">📧</span>                    <div>
                      <div className="body-text-primary text-xs font-bold">Email</div>
                      <div className="body-text-secondary text-xs">hello@kiruk.com</div>
                    </div>
                  </motion.div>
                  
                  <motion.div
                    className="flex items-center space-x-2"
                    whileHover={{ scale: 1.02 }}
                  >                    <span className="text-lg">💼</span>                    <div>
                      <div className="body-text-primary text-xs font-bold">LinkedIn</div>
                      <div className="body-text-secondary text-xs">/in/kiruk</div>
                    </div>
                  </motion.div>
                </div>
              </SketchCard>

              {/* What to Expect */}
              <SketchCard className="p-4">                <SketchHeading level={3} className="heading-tertiary-enhanced text-base mb-2" underline={false}>
                  What to Expect
                </SketchHeading>
                  <div className="space-y-1">
                  <div className="flex items-start space-x-2">
                    <span className="text-gray-800 text-sm">⚡</span>
                    <span className="handwritten text-xs text-gray-600">Quick response (24h)</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-gray-700 text-sm">🎯</span>
                    <span className="handwritten text-xs text-gray-600">Focused discussion</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-black text-sm">🚀</span>
                    <span className="handwritten text-xs text-gray-600">Clear next steps</span>
                  </div>
                </div>
              </SketchCard>

              {/* CTA */}
              <SketchCard className="p-4 text-center">
                <div className="handwritten text-lg mb-2">🤝</div>                <div className="handwritten text-gray-600 mb-3 text-xs">
                  Ready for a{" "}
                  <SketchHighlight color="muted">creative chat</SketchHighlight>?
                </div>
                <div className="flex gap-2 justify-center">
                  <SketchButton href="/work" variant="outline" className="text-xs px-3 py-1">
                    My Work
                  </SketchButton>
                  <SketchButton href="/about" variant="outline" className="text-xs px-3 py-1">
                    About Me
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
