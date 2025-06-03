'use client';

import ScribbleAnimation from '@/components/three/scribble-animation';
import { SketchHeading, SketchCard, SketchButton, SketchHighlight, StickyNote, SketchDivider } from '@/components/ui/sketch-elements';
import { motion } from 'framer-motion';

export default function Contact() {
  return (
    <main className="pt-16 notebook-bg">
      {/* Hero Section with Scribble Background */}
      <section className="relative py-20 overflow-hidden">
        {/* Scribble Background */}
        <div className="absolute inset-0 opacity-15">
          <ScribbleAnimation className="w-full h-full" />
        </div>
        
        {/* Floating contact notes */}
        <motion.div
          className="absolute top-20 right-10 hidden lg:block"
          animate={{ 
            rotate: [0, 4, -4, 0],
            y: [0, -20, 20, 0] 
          }}
          transition={{ 
            duration: 10, 
            repeat: Infinity,
            ease: "easeInOut" 
          }}
        >
          <StickyNote color="green" className="w-40 h-32">
            <div className="handwritten text-xs">
              📞 Contact Methods:
              <br />• Email (best)
              <br />• LinkedIn
              <br />• Coffee chat ☕
            </div>
          </StickyNote>
        </motion.div>

        <motion.div
          className="absolute bottom-20 left-10 hidden lg:block"
          animate={{ 
            rotate: [0, -3, 3, 0],
            x: [0, 15, -15, 0] 
          }}
          transition={{ 
            duration: 8, 
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2 
          }}
        >
          <StickyNote color="pink" className="w-44 h-36">
            <div className="handwritten text-xs">
              💡 Great projects start with:
              <br />• Clear goals
              <br />• Open communication
              <br />• Mutual respect
              <br />• Shared vision
            </div>
          </StickyNote>
        </motion.div>
        
        <div className="relative max-w-4xl mx-auto px-6 sm:px-8 z-10">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <SketchHeading level={1} className="text-4xl sm:text-5xl mb-6">
              Let's{" "}
              <SketchHighlight color="yellow">Create</SketchHighlight>
              {" "}Together
            </SketchHeading>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="notebook-paper p-6 mx-auto max-w-2xl rounded-lg"
            >
              <p className="handwritten text-lg text-gray-600">
                Have a project in mind? Let's start with a conversation and see where our scribbles take us.
              </p>
            </motion.div>

            {/* Hand-drawn doodles */}
            <motion.div
              className="flex justify-center mt-8 space-x-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.8 }}
            >              <motion.div
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="handwritten text-2xl text-sketch-blue"
              >
                📧
              </motion.div>
              <motion.div
                animate={{ y: [0, -8, 8, 0] }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity, 
                  delay: 0.5,
                  ease: "easeInOut"
                }}
                className="handwritten text-2xl text-sketch-green"
              >
                💬
              </motion.div>
              <motion.div
                animate={{ rotate: [0, -12, 12, 0] }}
                transition={{ 
                  duration: 5, 
                  repeat: Infinity, 
                  delay: 1,
                  ease: "easeInOut"
                }}
                className="handwritten text-2xl text-sketch-purple"
              >
                🤝
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Main Contact Section */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6 sm:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <div className="grid md:grid-cols-2 gap-12">
              {/* Contact Form */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                <SketchCard tilt="left" className="h-full">
                  <SketchHeading level={2} className="text-2xl mb-6">
                    Send a Message
                  </SketchHeading>
                  
                  <form className="space-y-6">
                    <div>
                      <label htmlFor="name" className="block handwritten text-sm font-medium text-gray-700 mb-2">
                        Your Name ✏️
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg sketch-border focus:ring-2 focus:ring-sketch-blue focus:border-sketch-blue handwritten"
                        placeholder="What should I call you?"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block handwritten text-sm font-medium text-gray-700 mb-2">
                        Email Address 📧
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg sketch-border focus:ring-2 focus:ring-sketch-blue focus:border-sketch-blue handwritten"
                        placeholder="your@email.com"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="project" className="block handwritten text-sm font-medium text-gray-700 mb-2">
                        Project Type 🎨
                      </label>
                      <select
                        id="project"
                        name="project"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg sketch-border focus:ring-2 focus:ring-sketch-blue focus:border-sketch-blue handwritten"
                      >                        <option value="">What kind of magic are we making?</option>
                        <option value="ux-design">UX Design ✨</option>
                        <option value="ai-integration">AI Integration 🤖</option>
                        <option value="design-system">Design System 🎨</option>
                        <option value="consultation">Consultation 💭</option>
                        <option value="other">Other (tell me more!) 🚀</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="message" className="block handwritten text-sm font-medium text-gray-700 mb-2">
                        Your Vision 💭
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        rows={4}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg sketch-border focus:ring-2 focus:ring-sketch-blue focus:border-sketch-blue handwritten"
                        placeholder="Tell me about your project dreams..."
                      />
                    </div>
                    
                    <SketchButton type="submit" variant="primary" size="lg" className="w-full">
                      Send Message 🚀
                    </SketchButton>
                  </form>
                </SketchCard>
              </motion.div>
              
              {/* Contact Info */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 1 }}
                className="space-y-8"
              >
                <SketchCard tilt="right" className="h-full">
                  <SketchHeading level={3} className="text-xl mb-4">
                    Let's Connect! 🤝
                  </SketchHeading>
                  <div className="handwritten text-gray-600 mb-6">
                    I'm always excited to discuss new projects and opportunities. 
                    Whether you need UX design, AI integration, or just want to chat about design, 
                    I'd love to hear from you.
                  </div>
                  
                  <div className="space-y-6">
                    {[
                      { icon: "📧", label: "Email", value: "hello@kiruk.design", color: "text-sketch-blue" },
                      { icon: "💼", label: "LinkedIn", value: "/in/kiruk-design", color: "text-sketch-purple" },
                      { icon: "🐦", label: "Twitter", value: "@kiruk_design", color: "text-sketch-green" },
                    ].map((contact, index) => (
                      <motion.div
                        key={contact.label}
                        className="flex items-center space-x-4"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 1.2 + index * 0.1 }}
                      >
                        <div className="w-12 h-12 sketch-border bg-white rounded-full flex items-center justify-center text-2xl">
                          {contact.icon}
                        </div>
                        <div>
                          <p className={`handwritten font-medium ${contact.color}`}>{contact.label}</p>
                          <p className="handwritten text-gray-600 text-sm">{contact.value}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  
                  <div className="mt-8">
                    <StickyNote color="yellow" className="w-full">
                      <div className="handwritten text-xs">
                        ⏰ <strong>Response Time:</strong>
                        <br />
                        I typically respond within 24-48 hours. 
                        For urgent projects, just mention it!
                      </div>
                    </StickyNote>
                  </div>
                </SketchCard>
              </motion.div>
            </div>

            <SketchDivider className="my-20" />

            {/* Interactive Communication Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.5 }}
            >
              <SketchCard className="text-center">
                <SketchHeading level={2} className="text-2xl mb-6">
                  Interactive Communication Canvas
                </SketchHeading>
                
                <div className="relative h-80 rounded-xl overflow-hidden mb-6 notebook-paper">
                  <ScribbleAnimation className="w-full h-full opacity-60" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <StickyNote color="blue" className="max-w-md">
                      <div className="handwritten text-xs">
                        🎨 <strong>Creative Communication:</strong> Move your mouse above to create scribbles that represent 
                        our future creative collaboration!
                      </div>
                    </StickyNote>
                  </div>
                </div>
                
                <div className="handwritten text-lg text-gray-600 mb-6">
                  Every great project starts with a{" "}
                  <SketchHighlight color="yellow">conversation</SketchHighlight>
                  {" "}and a{" "}
                  <SketchHighlight color="blue">scribble</SketchHighlight>!
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <SketchButton href="/work" variant="outline">
                    See My Work
                  </SketchButton>
                  <SketchButton href="/about" variant="outline">
                    Learn About Me
                  </SketchButton>
                </div>              </SketchCard>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
