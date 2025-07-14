'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

interface InvolvementItem {
  title: string;
  description: string;
  category: string;
  icon: string;
  color: string;
  impact: string;
}

interface InvolvementCardProps {
  item: InvolvementItem;
  index: number;
}

export const InvolvementCard = ({ item, index }: InvolvementCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div
      className="group relative bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 overflow-hidden h-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: -4 }}
    >
      {/* Background gradient overlay */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300"
        style={{ 
          background: `linear-gradient(135deg, ${item.color}20, transparent)` 
        }}
      />

      {/* Header section with icon and category */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <motion.div
            className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm border-2"
            style={{ 
              backgroundColor: `${item.color}08`, 
              borderColor: `${item.color}20`
            }}
            whileHover={{ scale: 1.1, rotate: 10 }}
            transition={{ duration: 0.2 }}
          >
            <span className="text-2xl">{item.icon}</span>
          </motion.div>
          
          <div>
            <motion.div 
              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold handwritten mb-2"
              style={{ 
                backgroundColor: `${item.color}15`,
                color: item.color
              }}
              whileHover={{ scale: 1.05 }}
            >
              {item.category}
            </motion.div>
          </div>
        </div>

        {/* Impact indicator */}
        <motion.div 
          className="text-right"
          animate={{ scale: isHovered ? 1.05 : 1 }}
          transition={{ duration: 0.2 }}
        >
          <div className="text-xs text-gray-400 handwritten mb-1">Impact</div>
          <div 
            className="text-sm font-bold handwritten"
            style={{ color: item.color }}
          >
            {item.impact}
          </div>
        </motion.div>
      </div>

      {/* Title */}
      <motion.h3 
        className="text-lg font-bold text-gray-800 handwritten mb-3 leading-tight"
        animate={{ color: isHovered ? item.color : '#1f2937' }}
        transition={{ duration: 0.2 }}
      >
        {item.title}
      </motion.h3>

      {/* Description */}
      <p className="text-gray-600 text-sm leading-relaxed handwritten mb-4">
        {item.description}
      </p>

      {/* Bottom section with engagement metrics */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <motion.div 
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: item.color }}
            animate={{ scale: isHovered ? [1, 1.3, 1] : 1 }}
            transition={{ duration: 0.3, repeat: isHovered ? Infinity : 0 }}
          />
          <span className="text-xs text-gray-500 handwritten">
            Active involvement
          </span>
        </div>
      </div>

      {/* Decorative element */}
      <motion.div
        className="absolute bottom-3 right-3 text-lg opacity-10 group-hover:opacity-30 transition-opacity"
        animate={{ rotate: isHovered ? 360 : 0 }}
        transition={{ duration: 0.5 }}
      >
        ✨
      </motion.div>

      {/* Side accent */}
      <motion.div
        className="absolute left-0 top-0 w-1 h-full rounded-r-full"
        style={{ backgroundColor: item.color }}
        initial={{ scaleY: 0 }}
        animate={{ scaleY: isHovered ? 1 : 0.3 }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
};

interface InvolvementSectionProps {
  involvementData: InvolvementItem[];
}

export const InvolvementSection = ({ involvementData }: InvolvementSectionProps) => {
  return (
    <section className="relative z-10 max-w-6xl mx-auto px-4 mb-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        {/* Section Header */}
        <div className="text-center mb-12">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold text-gray-800 handwritten mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            🤝 Community Involvement
          </motion.h2>
          
          <motion.p 
            className="text-gray-600 text-lg handwritten max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Passionate about sharing knowledge and building connections in the tech community
          </motion.p>

          {/* Stats overview */}
          <motion.div 
            className="flex items-center justify-center gap-8 mt-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 handwritten">60+</div>
              <div className="text-xs text-gray-500 handwritten">Students Taught</div>
            </div>
            <div className="w-px h-8 bg-gray-200" />
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 handwritten">2+</div>
              <div className="text-xs text-gray-500 handwritten">Years Active</div>
            </div>
            <div className="w-px h-8 bg-gray-200" />
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 handwritten">∞</div>
              <div className="text-xs text-gray-500 handwritten">Impact Created</div>
            </div>
          </motion.div>
        </div>

        {/* Cards Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {involvementData.map((item, index) => (
            <InvolvementCard key={item.title} item={item} index={index} />
          ))}
        </div>

        {/* Call to action */}
        <motion.div 
          className="text-center mt-12 mb-20 relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100 shadow-sm">
            <div className="text-2xl mb-3">🚀</div>
            <h3 className="text-lg font-bold text-gray-800 handwritten mb-2">
              Let's Collaborate!
            </h3>
            <p className="text-gray-600 text-sm handwritten mb-4">
              Interested in workshops, mentoring, or community events? Let's connect and make an impact together.
            </p>
            <motion.button
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-full text-sm font-semibold handwritten transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Get in Touch
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default InvolvementSection;
