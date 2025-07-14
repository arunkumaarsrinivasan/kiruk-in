'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

interface VlogCardProps {
  vlog: {
    id: string;
    title: string;
    date: string;
    thumbnailUrl: string;
    category: string;
    excerpt: string;
  };
  index: number;
}

export const VlogCard: React.FC<VlogCardProps> = ({ vlog, index }) => {
  // Create deterministic rotation based on vlog.id to avoid hydration mismatch
  const getRotationFromId = (id: string): number => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      const char = id.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return ((hash % 400) / 100) - 2; // -2 to 2 degrees
  };
  
  const randomRotation = getRotationFromId(vlog.id);

  return (
    <motion.div
      className="relative group cursor-pointer"
      initial={{ opacity: 0, y: 20, rotate: randomRotation + 5 }}
      animate={{ opacity: 1, y: 0, rotate: randomRotation }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ scale: 1.05, rotate: 0, zIndex: 10 }}
    >
      <div className="bg-white border-2 border-dashed border-black rounded-2xl p-3 h-full flex flex-col shadow-lg transform hover:shadow-xl transition-all">
        <div className="relative mb-3">
          <div className="border-2 border-dashed border-gray-400 rounded-lg overflow-hidden">
            <Image
              src={vlog.thumbnailUrl}
              alt={vlog.title}
              width={400}
              height={225}
              className="object-cover w-full aspect-video"
            />
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="w-16 h-16 bg-white/90 border-2 border-dashed border-black rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-black" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        <div className="flex-grow">
          <span className="text-xs handwritten text-gray-600 bg-gray-100 border border-dashed border-gray-300 px-2 py-1 rounded-lg inline-block mb-2">
            {vlog.category}
          </span>
          <h3 className="sketch-font text-lg font-bold text-black mb-1">{vlog.title}</h3>
          <p className="handwritten text-sm text-gray-600">{vlog.excerpt}</p>
        </div>
        <p className="handwritten text-xs text-gray-400 mt-2 text-right">{vlog.date}</p>
        
        {/* Sketchy decorative elements */}
        <div className="absolute -top-1 -right-1 text-xs opacity-40 transform rotate-12">
          📎
        </div>
        <div className="absolute -bottom-1 -left-1 text-xs opacity-30 transform -rotate-12">
          ✏️
        </div>
      </div>
    </motion.div>
  );
};
