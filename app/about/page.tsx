'use client';

import ScribbleAnimation from '@/components/three/scribble-animation';
import { SketchHeading, SketchCard, SketchButton, SketchHighlight, StickyNote, SketchDivider } from '@/components/ui/sketch-elements';
import { motion } from 'framer-motion';

export default function About() {
  return (
    <main className="pt-16 notebook-bg">
      {/* Hero Section with Scribble Background */}
      <section className="relative py-20 overflow-hidden">
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
            <div className="handwritten text-xs">
              "கற்பனை + Code = Magic"
              <br />
              <span className="text-sketch-blue">- Kiruk</span>
            </div>
          </StickyNote>
        </motion.div>

        <motion.div
          className="absolute bottom-10 left-10 hidden lg:block"
          animate={{ rotate: [-1, 1, -1] }}
          transition={{ duration: 5, repeat: Infinity, delay: 1 }}
        >
          <StickyNote color="blue" className="w-36 h-28">
            <div className="handwritten text-xs">
              📝 Adventures:
              <br />• Trek mountains 🏔️
              <br />• Document life 📸
              <br />• Code solutions 💻
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
              About{" "}
              <SketchHighlight color="yellow">Kiruk</SketchHighlight>
            </SketchHeading>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="notebook-paper p-6 mx-auto max-w-2xl rounded-lg"
            >
              <p className="handwritten text-lg text-gray-600">
                கிறுக் - A mad scribbler from Tamil Nadu who thinks differently about design and code.
                <br />
                Generalist by heart, specialist when needed. 🎨💻
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6 sm:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="grid md:grid-cols-2 gap-8 items-start mb-16">
              <SketchCard tilt="left" className="h-full">
                <SketchHeading level={2} className="text-2xl mb-4">
                  The Philosophy
                </SketchHeading>
                <div className="handwritten space-y-4 text-gray-600">
                  <p>
                    From the hills of Tamil Nadu, I bring a unique perspective to design and development. 
                    <SketchHighlight color="pink">"Kiruk"</SketchHighlight> isn't just my name - it's my approach.
                  </p>
                  <p>
                    I believe great digital experiences come from understanding both the art of design and the craft of code. 
                    I'm a <SketchHighlight color="blue">generalist who can see the big picture</SketchHighlight>, yet dive deep as a specialist when needed.
                  </p>
                  <p>
                    When I'm not designing or coding, you'll find me trekking mountains 🏔️, documenting life through my lens 📸, or planning my next adventure.
                  </p>
                </div>
              </SketchCard>
              
              <SketchCard tilt="right" className="h-full">
                <SketchHeading level={3} className="text-lg mb-4" underline={false}>
                  What I Love Doing 💫
                </SketchHeading>                <div className="space-y-4">
                  {[
                    { icon: "🎨", text: "Designing User Experiences", color: "text-sketch-purple" },
                    { icon: "💻", text: "Coding Solutions", color: "text-sketch-blue" },
                    { icon: "🏔️", text: "Trekking Adventures", color: "text-sketch-green" },
                    { icon: "📸", text: "Life Documentation", color: "text-sketch-orange" },
                    { icon: "🚀", text: "Creative Problem Solving", color: "text-sketch-red" }
                  ].map((skill, index) => (
                    <motion.div
                      key={skill.text}
                      className="flex items-center space-x-3"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                    >
                      <span className="text-2xl">{skill.icon}</span>
                      <span className={`handwritten ${skill.color}`}>{skill.text}</span>
                    </motion.div>
                  ))}
                </div>
              </SketchCard>
            </div>

            <SketchDivider />

            {/* My Approach */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="mt-16"
            >
              <SketchCard className="text-center">
                <SketchHeading level={2} className="text-3xl mb-6">
                  My Approach
                </SketchHeading>
                
                <div className="grid md:grid-cols-3 gap-8 mt-8">
                  <motion.div
                    className="text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1 }}
                  >
                    <div className="handwritten text-4xl text-sketch-orange mb-3">🧠</div>
                    <h4 className="handwritten text-lg font-bold text-gray-800 mb-2">Think Different</h4>
                    <p className="handwritten text-sm text-gray-600">
                      கிறுக் means thinking outside conventional boundaries
                    </p>
                  </motion.div>
                  
                  <motion.div
                    className="text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1.2 }}
                  >
                    <div className="handwritten text-4xl text-sketch-blue mb-3">⚡</div>
                    <h4 className="handwritten text-lg font-bold text-gray-800 mb-2">Build Fast</h4>
                    <p className="handwritten text-sm text-gray-600">
                      Prototype quickly, iterate constantly, learn continuously
                    </p>
                  </motion.div>
                  
                  <motion.div
                    className="text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1.4 }}
                  >
                    <div className="handwritten text-4xl text-sketch-green mb-3">🌟</div>
                    <h4 className="handwritten text-lg font-bold text-gray-800 mb-2">Stay Curious</h4>
                    <p className="handwritten text-sm text-gray-600">
                      Always exploring, whether it's code, design, or mountain trails
                    </p>
                  </motion.div>
                </div>
              </SketchCard>
            </motion.div>

            {/* Skills Grid */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.0 }}
              className="mt-16"
            >
              <SketchCard>
                <SketchHeading level={2} className="text-2xl mb-8 text-center">
                  Generalist + Specialist
                </SketchHeading>
                
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="handwritten text-lg font-bold text-sketch-purple mb-4">🎨 Design Skills</h3>
                    <ul className="handwritten text-gray-600 space-y-2">
                      <li>• UX/UI Design</li>
                      <li>• Design Systems</li>
                      <li>• User Research</li>
                      <li>• Prototyping</li>
                      <li>• Visual Design</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="handwritten text-lg font-bold text-sketch-blue mb-4">💻 Coding Skills</h3>
                    <ul className="handwritten text-gray-600 space-y-2">
                      <li>• Frontend Development</li>
                      <li>• React/Next.js</li>
                      <li>• TypeScript/JavaScript</li>
                      <li>• UI Animation</li>
                      <li>• API Integration</li>
                    </ul>
                  </div>
                </div>
              </SketchCard>
            </motion.div>

            {/* CTA Section */}
            <motion.div
              className="text-center mt-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.6 }}
            >
              <div className="handwritten text-lg text-gray-600 mb-6">
                Want to collaborate on something amazing?
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <SketchButton href="/work" variant="primary">
                  See My Work
                </SketchButton>
                <SketchButton href="/contact" variant="outline">
                  Let's Connect
                </SketchButton>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
