'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CaseStudy } from '../types';
import { SketchHeading } from '@/components/ui/sketch-elements';

interface CaseStudyBookProps {
  readonly study: CaseStudy;
  readonly onClose: () => void;
}

export default function CaseStudyBook({ study, onClose }: CaseStudyBookProps) {
  const [currentPage, setCurrentPage] = React.useState(0);
  const [isFlipping, setIsFlipping] = React.useState(false);
  
  // Define book pages with content
  const pages = [
    { id: 'overview', title: 'Overview', icon: '📋' },
    { id: 'branding', title: 'Branding', icon: '🎨' },
    { id: 'colors', title: 'Colors', icon: '🌈' },
    { id: 'ideation', title: 'Ideation', icon: '💡' },
    { id: 'sketching', title: 'Sketching', icon: '✏️' },
    { id: 'wireframes', title: 'Wireframes', icon: '📐' },
    { id: 'final', title: 'Final Design', icon: '✨' },
    { id: 'figma', title: 'Prototype', icon: '🔗' },
  ];
  
  const goToPage = async (pageIndex: number) => {
    if (pageIndex === currentPage) return;
    
    setIsFlipping(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    setCurrentPage(pageIndex);
    setIsFlipping(false);
  };
  
  const nextPage = () => {
    if (currentPage < pages.length - 1) {
      goToPage(currentPage + 1);
    }
  };
  
  const prevPage = () => {
    if (currentPage > 0) {
      goToPage(currentPage - 1);
    }
  };

  const renderPageContent = () => {
    const currentPageId = pages[currentPage]?.id;
    
    switch (currentPageId) {      case 'overview':
        return (
          <div className="p-8 space-y-6">
            <div className="text-center mb-8">
              <SketchHeading level={1} className="text-3xl mb-4 architect-font">{study.title}</SketchHeading>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto handwritten leading-relaxed">{study.summary}</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-4 sketch-font">Process Overview</h3>
                <div className="space-y-3">
                  {study.steps.map((step, i) => (
                    <motion.div 
                      key={`step-${step.label}-${i}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-start gap-3 p-3 bg-gray-50 rounded-sm border border-black/10 sketch-border"
                    >
                      <span className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-sm flex items-center justify-center text-sm font-bold sketch-font">
                        {i + 1}
                      </span>
                      <div>
                        <h4 className="font-medium sketch-font">{step.label}</h4>
                        <p className="text-sm text-gray-600 handwritten">{step.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-4 sketch-font">Final Result</h3>
                <div className="bg-white p-4 rounded-sm shadow-sm sketch-border">
                  <img 
                    src={study.finalImg} 
                    alt={`${study.title} final design`}
                    className="w-full h-48 object-cover rounded-sm mb-4 border border-black/10"
                  />
                  <p className="text-gray-700 handwritten leading-relaxed">{study.productDescription}</p>
                </div>
                
                {study.technologies && (
                  <div className="mt-6">
                    <h4 className="font-medium mb-2 sketch-font">Technologies Used</h4>
                    <div className="flex flex-wrap gap-2">
                      {study.technologies.map((tech, i) => (
                        <span key={`tech-${tech}-${i}`} className="px-3 py-1 bg-gray-100 text-black rounded-sm text-sm sketch-font border border-black/20">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
          case 'branding':
        return (
          <div className="p-8 space-y-6">
            <SketchHeading level={2} className="text-center mb-6 architect-font">Brand Identity</SketchHeading>
            {study.branding && (
              <div className="space-y-8">
                <div className="bg-gray-50 p-6 rounded-sm sketch-border">
                  <p className="text-gray-700 leading-relaxed handwritten text-lg">{study.branding.description}</p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold mb-4 sketch-font">Typography</h3>
                    <div className="space-y-4">
                      <div className="p-4 bg-white rounded-sm sketch-border">
                        <p className="text-sm text-gray-500 mb-2 sketch-font">Primary Font</p>
                        <p className="text-2xl font-bold" style={{ fontFamily: study.branding.typography.primary }}>
                          {study.branding.typography.primary}
                        </p>
                      </div>
                      <div className="p-4 bg-white rounded-sm sketch-border">
                        <p className="text-sm text-gray-500 mb-2 sketch-font">Secondary Font</p>
                        <p className="text-2xl" style={{ fontFamily: study.branding.typography.secondary }}>
                          {study.branding.typography.secondary}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold mb-4 sketch-font">Brand Colors</h3>
                    <div className="grid grid-cols-3 gap-3">
                      {study.branding.colors.map((color, i) => (
                        <motion.div 
                          key={`color-${color}`}
                          whileHover={{ scale: 1.05 }}
                          className="aspect-square rounded-sm shadow-sm sketch-border flex flex-col items-center justify-end p-2"
                          style={{ backgroundColor: color }}
                        >
                          <span className="text-xs font-mono bg-white/90 px-2 py-1 rounded-sm sketch-font border border-black/20">
                            {color}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
          case 'colors':
        return (
          <div className="p-8 space-y-6">
            <SketchHeading level={2} className="text-center mb-6 architect-font">Color Theory</SketchHeading>
            {study.colorTheory && (
              <div className="space-y-8">
                <div className="text-center">
                  <div className="flex justify-center space-x-4 mb-6">
                    {study.colorTheory.palette.map((color, i) => (
                      <motion.div
                        key={`palette-${color}`}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="w-16 h-16 rounded-sm shadow-lg sketch-border"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="bg-white p-6 rounded-sm shadow-sm sketch-border">
                    <h3 className="text-xl font-semibold mb-4 sketch-font">Color Usage</h3>
                    <p className="text-gray-700 leading-relaxed handwritten">{study.colorTheory.description}</p>
                  </div>
                  
                  {study.colorTheory.psychology && (
                    <div className="bg-gray-50 p-6 rounded-sm sketch-border">
                      <h3 className="text-xl font-semibold mb-4 sketch-font">Color Psychology</h3>
                      <p className="text-gray-700 leading-relaxed handwritten">{study.colorTheory.psychology}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
          case 'ideation':
        return (
          <div className="p-8 space-y-6">
            <SketchHeading level={2} className="text-center mb-6 architect-font">Ideation Process</SketchHeading>
            {study.ideation && (
              <div className="space-y-8">
                <div className="bg-gray-50 p-6 rounded-sm sketch-border">
                  <p className="text-gray-700 leading-relaxed handwritten text-lg">{study.ideation.description}</p>
                </div>
                
                {study.ideation.keyInsights && (
                  <div>
                    <h3 className="text-xl font-semibold mb-4 sketch-font">Key Insights</h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      {study.ideation.keyInsights.map((insight, i) => (
                        <motion.div
                          key={`insight-${i}-${insight.substring(0, 20)}`}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.2 }}
                          className="bg-white p-4 rounded-sm shadow-sm sketch-border border-l-4 border-black"
                        >
                          <p className="text-sm text-gray-700 handwritten">{insight}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
                
                {study.ideation.images && study.ideation.images.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold mb-4 sketch-font">Ideation Artifacts</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {study.ideation.images.map((img, i) => (
                        <div key={`ideation-${img}`} className="bg-white p-3 rounded-sm shadow-sm sketch-border">
                          <img src={img} alt={`Ideation ${i+1}`} className="w-full h-40 object-cover rounded-sm border border-black/10" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
          case 'sketching':
        return (
          <div className="p-8 space-y-6">
            <SketchHeading level={2} className="text-center mb-6 architect-font">Sketching & Exploration</SketchHeading>
            {study.sketching && (
              <div className="space-y-8">
                <div className="bg-gray-50 p-6 rounded-sm sketch-border">
                  <p className="text-gray-700 leading-relaxed handwritten text-lg">{study.sketching.description}</p>
                  {study.sketching.iterations && (
                    <div className="mt-4 inline-flex items-center bg-white px-4 py-2 rounded-sm sketch-border">
                      <span className="text-sm font-medium sketch-font">{study.sketching.iterations} iterations</span>
                    </div>
                  )}
                </div>
                
                {study.sketching.images && study.sketching.images.length > 0 && (
                  <div className="grid md:grid-cols-2 gap-6">
                    {study.sketching.images.map((img, i) => (
                      <motion.div
                        key={`sketch-${img}`}
                        whileHover={{ scale: 1.02, rotate: 0 }}
                        className="bg-white p-4 rounded-sm shadow-sm sketch-border transform rotate-1 transition-transform"
                      >
                        <img src={img} alt={`Sketch ${i+1}`} className="w-full h-64 object-cover rounded-sm border border-black/10" />
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
          case 'wireframes':
        return (
          <div className="p-8 space-y-6">
            <SketchHeading level={2} className="text-center mb-6 architect-font">Wireframes & Structure</SketchHeading>
            {study.wireframes && (
              <div className="space-y-8">
                <div className="bg-gray-50 p-6 rounded-sm sketch-border">
                  <p className="text-gray-700 leading-relaxed handwritten text-lg">{study.wireframes.description}</p>
                  {study.wireframes.userFlow && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-2 sketch-font">User Flow:</h4>
                      <p className="text-sm text-gray-800 font-mono bg-white px-3 py-2 rounded-sm border border-black/20">{study.wireframes.userFlow}</p>
                    </div>
                  )}
                </div>
                
                {study.wireframes.images && study.wireframes.images.length > 0 && (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {study.wireframes.images.map((img, i) => (
                      <div key={`wireframe-${img}`} className="bg-white p-3 rounded-sm shadow-sm sketch-border">
                        <img src={img} alt={`Wireframe ${i+1}`} className="w-full h-48 object-contain rounded-sm border border-black/10" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
          case 'final':
        return (
          <div className="p-8 space-y-6">
            <SketchHeading level={2} className="text-center mb-6 architect-font">Final Design</SketchHeading>
            {study.finalScreens && (
              <div className="space-y-8">
                <div className="bg-gray-50 p-6 rounded-sm sketch-border">
                  <p className="text-gray-700 leading-relaxed handwritten text-lg">{study.finalScreens.description}</p>
                </div>
                
                {study.finalScreens.features && (
                  <div>
                    <h3 className="text-xl font-semibold mb-4 sketch-font">Key Features</h3>
                    <div className="grid md:grid-cols-2 gap-3">
                      {study.finalScreens.features.map((feature, i) => (
                        <div key={`feature-${i}-${feature.substring(0, 10)}`} className="flex items-center gap-2 p-3 bg-white rounded-sm sketch-border">
                          <span className="text-black text-lg">✓</span>
                          <span className="handwritten">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {study.finalScreens.images && study.finalScreens.images.length > 0 && (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {study.finalScreens.images.map((img, i) => (
                      <motion.div
                        key={`final-${img}`}
                        whileHover={{ scale: 1.02 }}
                        className="bg-white p-2 rounded-sm shadow-lg sketch-border"
                      >
                        <img src={img} alt={`Final design ${i+1}`} className="w-full h-64 object-cover rounded-sm border border-black/10" />
                      </motion.div>
                    ))}
                  </div>
                )}
                
                {study.results && (
                  <div>
                    <h3 className="text-xl font-semibold mb-4 sketch-font">Results & Metrics</h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      {study.results.map((result, i) => (
                        <div key={`result-${result.metric}`} className="text-center p-4 bg-white rounded-sm shadow-sm sketch-border">
                          <div className="text-2xl font-bold text-black mb-1 architect-font">{result.value}</div>
                          <div className="font-medium sketch-font">{result.metric}</div>
                          {result.description && (
                            <div className="text-sm text-gray-600 mt-1 handwritten">{result.description}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
          case 'figma':
        return (
          <div className="p-8 space-y-6">
            <SketchHeading level={2} className="text-center mb-6 architect-font">Interactive Prototype</SketchHeading>
            {study.figmaEmbed ? (
              <div className="space-y-6">
                <div className="text-center">
                  <p className="text-gray-600 max-w-2xl mx-auto handwritten text-lg leading-relaxed">{study.figmaEmbed.description}</p>
                </div>
                
                <div className="bg-white rounded-sm shadow-lg p-4 sketch-border">
                  <div className="relative w-full pb-16 h-96">
                    <iframe 
                      src={study.figmaEmbed.embedUrl} 
                      className="absolute inset-0 w-full h-full rounded-sm border border-black/20"
                      allowFullScreen
                      title={study.figmaEmbed.title}
                    />
                  </div>
                </div>
                
                {study.links && (
                  <div>
                    <h3 className="text-xl font-semibold mb-4 text-center sketch-font">Project Links</h3>
                    <div className="flex justify-center gap-4">
                      {study.links.map((link, i) => (
                        <motion.a
                          key={`link-${link.title}`}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-sm hover:bg-gray-800 transition-colors sketch-border sketch-font"
                        >
                          <span>{link.icon}</span>
                          <span>{link.title}</span>
                        </motion.a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 handwritten text-lg">Interactive prototype coming soon...</p>
              </div>
            )}
          </div>
        );
        
      default:
        return <div className="p-8 text-center">Page content loading...</div>;
    }
  };
  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.95, opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
    >
      <div className="relative w-full max-w-6xl h-full max-h-[90vh] flex flex-col">
        {/* Book header with sketch styling */}
        <div className="bg-white sketch-border-thick paper-texture">
          <div className="flex items-center justify-between p-4 border-b border-black/20">
            <div className="flex items-center gap-3">
              <motion.span 
                className="text-2xl"
                animate={{ rotate: [0, 3, -3, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                📖
              </motion.span>
              <h2 className="handwritten text-2xl text-black">{study.title}</h2>
            </div>
            <button
              onClick={onClose}
              className="handwritten text-2xl text-black hover:text-gray-600 transition-colors bg-gray-100 hover:bg-gray-200 w-10 h-10 rounded-sm border border-black/20 flex items-center justify-center sketch-border"
              aria-label="Close book"
            >
              ×
            </button>
          </div>
          
          {/* Page tabs with sketch styling */}
          <div className="flex overflow-x-auto px-4 pb-2 gap-1 bg-gray-50">
            {pages.map((page, index) => (
              <button
                key={page.id}
                onClick={() => goToPage(index)}
                className={`flex items-center gap-2 px-4 py-2 rounded-sm whitespace-nowrap transition-all sketch-font border ${
                  currentPage === index 
                    ? 'bg-white border-black/40 text-black shadow-sm' 
                    : 'bg-gray-100 border-black/20 text-gray-600 hover:bg-white hover:text-black'
                }`}
              >
                <span>{page.icon}</span>
                <span className="text-sm font-medium">{page.title}</span>
              </button>
            ))}
          </div>
        </div>        
        {/* Book content with paper texture */}
        <div className="flex-1 bg-white overflow-y-auto paper-texture">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, x: isFlipping ? 50 : 0 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isFlipping ? -50 : 0 }}
              transition={{ duration: 0.3 }}
              className="min-h-full"
            >
              {renderPageContent()}
            </motion.div>
          </AnimatePresence>
        </div>
        
        {/* Book footer with sketch navigation */}
        <div className="bg-white sketch-border paper-texture p-4 border-t border-black/20">
          <div className="flex justify-between items-center">
            <button
              onClick={prevPage}
              disabled={currentPage === 0}
              className={`flex items-center gap-2 px-4 py-2 rounded-sm transition-all sketch-font border ${
                currentPage === 0 
                  ? 'text-gray-400 cursor-not-allowed border-gray-200 bg-gray-50' 
                  : 'text-black hover:bg-gray-100 border-black/20 bg-white hover:border-black/40'
              }`}
            >
              <span>←</span>
              <span>Previous</span>
            </button>
            
            <div className="text-sm text-gray-600 handwritten bg-gray-100 px-3 py-1 rounded-sm border border-black/20">
              page {currentPage + 1} of {pages.length}
            </div>
            
            <button
              onClick={nextPage}
              disabled={currentPage === pages.length - 1}
              className={`flex items-center gap-2 px-4 py-2 rounded-sm transition-all sketch-font border ${
                currentPage === pages.length - 1 
                  ? 'text-gray-400 cursor-not-allowed border-gray-200 bg-gray-50' 
                  : 'text-black hover:bg-gray-100 border-black/20 bg-white hover:border-black/40'
              }`}
            >
              <span>Next</span>
              <span>→</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
