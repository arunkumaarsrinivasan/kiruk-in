'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { SketchHeading } from '@/components/ui/sketch-elements';

export default function InteractiveDemo() {
  return (
    <main className="min-h-screen scrollable-content pt-16 notebook-bg">
      {/* Overlay InteractiveEye on the page title, right side */}
      <section className="relative py-12 bg-white">
        <div className="max-w-6xl mx-auto px-6 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <SketchHeading level={1} className="text-4xl sm:text-5xl mb-6">
              Interactive Portfolio Demo
            </SketchHeading>
            <div className="handwritten text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Experience the future of portfolio interaction - drag, drop, and rearrange elements
              just like you would in a physical notebook!
            </div>

            {/* Demo mode selector */}
            <div className="flex justify-center mb-8">
              <div className="bg-white border-2 border-black rounded-lg p-1 sketch-border">
                <div className="flex gap-1">
                  {[
                    { mode: 'portfolio', label: '🎨 Full Portfolio', desc: 'Complete interactive experience' },
                    { mode: 'notebook', label: '📝 Notebook Only', desc: 'Clean notebook interface' },
                    { mode: 'scribble', label: '✏️ Scribble Only', desc: 'Messy desk experience' }
                  ].map(({ mode, label, desc }) => (
                    <button
                      key={mode}
                      onClick={() => {}}
                      className={`px-4 py-2 rounded text-sm transition-all ${
                        'bg-transparent text-gray-700 hover:bg-gray-100'
                      }`}
                      title={desc}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Feature highlights */}
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {[
                {
                  icon: '🖱️',
                  title: 'Drag & Drop',
                  description: 'Move any element around the canvas naturally'
                },
                {
                  icon: '🔄',
                  title: 'Rotate & Scale',
                  description: 'Resize and rotate items just like physical objects'
                },
                {
                  icon: '📱',
                  title: 'Touch Friendly',
                  description: 'Works perfectly on both desktop and mobile devices'
                }
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="text-3xl mb-3">{feature.icon}</div>
                  <div className="font-bold text-lg mb-2 handwritten">{feature.title}</div>
                  <div className="text-sm text-gray-600">{feature.description}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Instructions Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <SketchHeading level={2} className="text-3xl mb-8">
              How to Use
            </SketchHeading>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-lg border-2 border-gray-200 sketch-border">
                <div className="text-2xl mb-4">🖱️</div>
                <div className="font-bold text-lg mb-2 handwritten">Desktop</div>
                <ul className="text-left text-sm space-y-2 text-gray-700">
                  <li>• <strong>Click & drag</strong> to move items</li>
                  <li>• <strong>Hover</strong> to see controls</li>
                  <li>• <strong>Click buttons</strong> to rotate/resize</li>
                  <li>• <strong>Right panel</strong> for adding new items</li>
                </ul>
              </div>

              <div className="bg-white p-6 rounded-lg border-2 border-gray-200 sketch-border">
                <div className="text-2xl mb-4">📱</div>
                <div className="font-bold text-lg mb-2 handwritten">Mobile</div>
                <ul className="text-left text-sm space-y-2 text-gray-700">
                  <li>• <strong>Touch & drag</strong> to move items</li>
                  <li>• <strong>Tap</strong> to select and see controls</li>
                  <li>• <strong>Pinch</strong> to zoom (coming soon)</li>
                  <li>• <strong>Add button</strong> for new items</li>
                </ul>
              </div>
            </div>

            <div className="mt-8 p-6 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
              <div className="text-lg font-bold mb-2 handwritten">💡 Pro Tips</div>
              <div className="text-sm text-gray-700 max-w-2xl mx-auto">
                Try switching between different modes to see how the same content can feel completely different.
                The "Mixed" mode combines both notebook cleanliness with scribble creativity for the ultimate experience!
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
