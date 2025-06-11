'use client';

import ScribbleAnimation from '@/components/three/scribble-animation';
import { SketchHeading, SketchHighlight } from '@/components/ui/sketch-elements';
import { useState } from 'react';
import { motion } from 'framer-motion';
import CASE_STUDIES from './data';
import BookCover from './components/book-cover';
import CaseStudyBook from './components/case-study-book';
import { CaseStudy } from './types';

export default function CaseStudies() {
  const [openBook, setOpenBook] = useState<string | null>(null);

  // Function to find the current case study
  const getCurrentStudy = (): CaseStudy | undefined => {
    return CASE_STUDIES.find(cs => cs.id === openBook);
  };
  
  // Function to handle book opening
  const handleOpenBook = (bookId: string) => {
    setOpenBook(bookId);
  };

  // Function to handle book closing
  const handleCloseBook = () => {
    setOpenBook(null);
  };

  return (
    <main className="min-h-screen scrollable-content pt-16 notebook-bg">
      <section className="relative min-h-screen flex flex-col">
        {/* Background animation */}
        <div className="absolute inset-0 opacity-10">
          <ScribbleAnimation className="w-full h-full" />
        </div>
          {/* Page header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center pt-12 pb-8 px-4"
        >
          <SketchHeading className="text-4xl md:text-5xl mb-4" level={1}>
            <span className="magnetic-drawing-heading">Case</span>{" "}
            <SketchHighlight color="dark">Studies</SketchHighlight>
          </SketchHeading>
          <p className="handwritten text-gray-600 max-w-3xl mx-auto text-lg leading-relaxed">
            Dive into my design adventures! Each book holds sketches, stories, and solutions. 
            Click to explore the journey from wild ideas to polished realities ✏️
          </p>
        </motion.div>
        
        {/* Book grid - shown when no book is selected */}
        {!openBook && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 py-8 px-4 max-w-7xl mx-auto"
          >
            {CASE_STUDIES.map((study, index) => (
              <motion.div
                key={study.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <BookCover 
                  study={study} 
                  onClick={() => handleOpenBook(study.id)} 
                />
              </motion.div>
            ))}
          </motion.div>
        )}
        
        {/* Book open view - shown when a book is selected */}
        {openBook && getCurrentStudy() && (
          <CaseStudyBook 
            study={getCurrentStudy()!} 
            onClose={handleCloseBook} 
          />
        )}
          {/* Bookshelf styling when books are displayed - black and white theme */}
        {!openBook && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-auto"
          >
            {/* Hand-drawn bookshelf */}
            <div className="w-full h-12 bg-gradient-to-b from-gray-200 to-gray-300 shadow-inner border-t-2 border-black relative">
              {/* Sketch-style shelf texture */}
              <div className="absolute inset-0 opacity-30">
                <div className="h-full w-full bg-gradient-to-r from-transparent via-black/5 to-transparent" />
              </div>
            </div>
            <div className="w-full h-4 bg-gradient-to-b from-gray-300 to-gray-400 border-t border-black/20" />
            
            {/* Hand-drawn shelf supports */}
            <div className="relative">
              <div className="absolute left-1/4 -top-4 w-2 h-4 bg-gray-400 transform -rotate-12 rounded-sm" />
              <div className="absolute right-1/4 -top-4 w-2 h-4 bg-gray-400 transform rotate-12 rounded-sm" />
            </div>
          </motion.div>
        )}
      </section>
    </main>
  );
}
