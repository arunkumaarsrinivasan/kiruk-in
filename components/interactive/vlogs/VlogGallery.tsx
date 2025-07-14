'use client';

import { useState } from 'react';
import { VlogCard } from './VlogCard';
import { SketchHeading, SketchButton } from '../../ui/sketch-elements';

const allVlogs = [
  // Tech Meetups
  { id: 'tech-1', title: 'React India 2025 Highlights', date: 'June 20, 2025', thumbnailUrl: '/images/vlogs/thumbnails/tech-1.jpg', category: 'Tech Meetups', excerpt: 'My key takeaways from the biggest React conference in India.' },
  { id: 'tech-2', title: 'AI in Frontend Development', date: 'May 15, 2025', thumbnailUrl: '/images/vlogs/thumbnails/tech-2.jpg', category: 'Tech Meetups', excerpt: 'A talk I gave at the local JS meetup about generative AI.' },
  
  // Treks
  { id: 'trek-1', title: 'Nandi Hills Sunrise', date: 'July 05, 2025', thumbnailUrl: '/images/vlogs/thumbnails/trek-1.jpg', category: 'Treks', excerpt: 'An early morning ride and trek to catch the stunning sunrise.' },
  { id: 'trek-2', title: 'Savandurga Monsoon Trek', date: 'June 28, 2025', thumbnailUrl: '/images/vlogs/thumbnails/trek-2.jpg', category: 'Treks', excerpt: 'Navigating the slippery slopes of Savandurga during the monsoon.' },

  // Daily Vlogs
  { id: 'daily-1', title: 'A Day in My Life as a Dev', date: 'July 10, 2025', thumbnailUrl: '/images/vlogs/thumbnails/daily-1.jpg', category: 'Daily Vlogs', excerpt: 'From morning coffee to late-night coding sessions.' },
  { id: 'daily-2', title: 'My Desk Setup Tour 2025', date: 'July 01, 2025', thumbnailUrl: '/images/vlogs/thumbnails/daily-2.jpg', category: 'Daily Vlogs', excerpt: 'A detailed look at my productivity and creative space.' },

  // Creative
  { id: 'creative-1', title: 'Building My Portfolio with Three.js', date: 'June 25, 2025', thumbnailUrl: '/images/vlogs/thumbnails/creative-1.jpg', category: 'Creative', excerpt: 'The process of creating the 3D elements for this website.' },

  // Travel
  { id: 'travel-1', title: 'Exploring Hampi', date: 'May 05, 2025', thumbnailUrl: '/images/vlogs/thumbnails/travel-1.jpg', category: 'Travel', excerpt: 'A journey through the ruins of the Vijayanagara Empire.' },
];

const categories = ['All', 'Tech Meetups', 'Treks', 'Daily Vlogs', 'Creative', 'Travel'];

export const VlogGallery = () => {
  const [filter, setFilter] = useState('All');

  const filteredVlogs = filter === 'All' 
    ? allVlogs 
    : allVlogs.filter(vlog => vlog.category === filter);

  return (
    <div className="py-16 md:py-24 relative">
      {/* Sketchy decorative elements */}
      <div className="absolute top-8 left-8 text-2xl opacity-30 transform rotate-12">
        📝
      </div>
      <div className="absolute top-12 right-16 text-xl opacity-25 transform -rotate-6">
        ✨
      </div>
      <div className="absolute bottom-16 left-24 text-lg opacity-20 transform rotate-45">
        📚
      </div>
      
      <div className="text-center mb-8 md:mb-12">
        <SketchHeading level={2} className="text-3xl md:text-4xl sketch-font text-black border-b-2 border-dashed border-black pb-2 inline-block">
          My Stories & Vlogs
        </SketchHeading>
        <p className="handwritten text-lg text-gray-600 mt-4 max-w-2xl mx-auto">
          A collection of my adventures, thoughts, and creative explorations. 
          Follow along for a glimpse into my life beyond the code.
        </p>
        
        {/* Hand-drawn underline */}
        <div className="mt-2 flex justify-center">
          <svg width="200" height="8" className="opacity-60">
            <path d="M10,4 Q50,1 100,3 T190,4" stroke="#666" strokeWidth="2" fill="none" strokeLinecap="round"/>
          </svg>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-8 md:mb-12">
        {categories.map(category => (
          <SketchButton
            key={category}
            onClick={() => setFilter(category)}
            variant={filter === category ? 'primary' : 'secondary'}
            className={`transform hover:scale-105 ${filter === category ? 'shadow-lg' : ''}`}
          >
            {category}
          </SketchButton>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative">
        {/* Washi tape decorations */}
        <div className="absolute -top-4 left-1/4 w-16 h-8 bg-yellow-200 border border-dashed border-yellow-400 rounded transform rotate-12 opacity-60"></div>
        <div className="absolute -top-2 right-1/3 w-12 h-6 bg-pink-200 border border-dashed border-pink-400 rounded transform -rotate-6 opacity-50"></div>
        
        {filteredVlogs.map((vlog, index) => (
          <VlogCard key={vlog.id} vlog={vlog} index={index} />
        ))}
      </div>

      {filteredVlogs.length === 0 && (
        <div className="text-center py-16 border-2 border-dashed border-gray-300 rounded-2xl bg-gray-50">
          <p className="sketch-font text-2xl text-gray-500 mb-2">No vlogs in this category yet!</p>
          <p className="handwritten text-lg text-gray-600">Check back soon for new stories.</p>
          <div className="mt-4 text-4xl opacity-30">📱</div>
        </div>
      )}
    </div>
  );
};
