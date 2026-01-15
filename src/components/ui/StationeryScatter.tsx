'use client';

import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

// Types of stationery items
type ItemType = 'polaroid' | 'ticket' | 'sticky-note' | 'tape' | 'clip' | 'stamp' | 'pencil' | 'eraser' | 'ruler' | 'coffee-stain' | 'crumpled-paper';

interface StationeryItemProps {
  id: string;
  type: ItemType;
  x: number; // Percentage 0-100
  y: number; // Percentage 0-100
  rotation: number;
  scale?: number;
  content?: string | React.ReactNode;
  zIndex?: number;
  color?: string;
}

const items: StationeryItemProps[] = [
  { id: '1', type: 'sticky-note', x: 5, y: 15, rotation: -5, content: 'Urgent', zIndex: 10, color: 'bg-yellow-200' },
  { id: '2', type: 'polaroid', x: 85, y: 10, rotation: 8, content: 'Idea', zIndex: 5 },
  { id: '3', type: 'ticket', x: 10, y: 60, rotation: 15, content: 'ADMIT ONE', zIndex: 8 },
  { id: '4', type: 'tape', x: 50, y: 5, rotation: -2, zIndex: 20 },
  { id: '5', type: 'clip', x: 90, y: 80, rotation: 45, zIndex: 15 },
  { id: '6', type: 'stamp', x: 80, y: 40, rotation: -10, content: 'APPROVED', zIndex: 6 },
  { id: '7', type: 'sticky-note', x: 15, y: 85, rotation: 3, content: 'Call Mom', zIndex: 9, color: 'bg-pink-200' },
  { id: '8', type: 'tape', x: 20, y: 20, rotation: 45, zIndex: 21 },
  { id: '9', type: 'pencil', x: 60, y: 70, rotation: 30, zIndex: 12 },
  { id: '10', type: 'eraser', x: 70, y: 65, rotation: -15, zIndex: 11 },
  { id: '11', type: 'ruler', x: 30, y: 90, rotation: 5, zIndex: 7 },
  { id: '12', type: 'coffee-stain', x: 40, y: 40, rotation: 0, zIndex: 1 },
  { id: '13', type: 'crumpled-paper', x: 5, y: 40, rotation: 120, zIndex: 13 },
  { id: '14', type: 'sticky-note', x: 92, y: 25, rotation: -8, content: 'TODO', zIndex: 10, color: 'bg-blue-200' },
];

const Polaroid = ({ content }: { content?: React.ReactNode }) => (
  <div className="bg-white p-3 pb-8 shadow-xl transform transition-transform border border-gray-200 w-32 h-40 flex flex-col items-center justify-center rotate-1">
    <div className="bg-gray-100 w-full h-24 mb-2 overflow-hidden flex items-center justify-center text-gray-400 text-xs relative group">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 opacity-50"></div>
      <div className="w-8 h-8 rounded-none bg-gray-300 group-hover:scale-110 transition-transform duration-500"></div>
    </div>
    <div className="handwritten text-center text-gray-600 text-sm font-medium">{content}</div>
  </div>
);

const Ticket = ({ content }: { content?: React.ReactNode }) => (
  <div className="bg-[#f4e4bc] border border-dashed border-[#d4c49c] p-4 shadow-md w-32 relative flex items-center justify-center overflow-hidden">
    <div className="absolute left-[-8px] top-1/2 -translate-x-1/2 w-4 h-4 bg-white rounded-none border-r border-[#d4c49c]"></div>
    <div className="absolute right-[-8px] top-1/2 translate-x-1/2 w-4 h-4 bg-white rounded-none border-l border-[#d4c49c]"></div>
    <div className="flex flex-col items-center">
        <span className="font-mono font-bold text-[#8c7b50] text-[10px] tracking-widest mb-1">CINEMA</span>
        <span className="font-mono font-black text-[#5c4b20] text-lg tracking-widest border-t border-b border-[#d4c49c] py-1">{content}</span>
        <span className="font-mono text-[#8c7b50] text-[8px] mt-1">No. 04823</span>
    </div>
  </div>
);

const StickyNote = ({ content, color = 'bg-yellow-200' }: { content?: React.ReactNode, color?: string }) => (
  <div className={`${color} p-4 shadow-lg w-28 h-28 flex items-center justify-center relative`}>
    <div className="handwritten text-gray-800 text-center leading-tight text-lg">{content}</div>
    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-4 bg-white/30 rotate-1 backdrop-blur-sm"></div>
    <div className="absolute bottom-0 right-0 w-4 h-4 bg-black/5 transform skew-x-12"></div>
  </div>
);

const Tape = () => (
  <div className="w-24 h-8 bg-white/40 rotate-3 shadow-sm backdrop-blur-[2px] border-l border-r border-white/60"></div>
);

const Clip = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 drop-shadow-md">
    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
  </svg>
);

const Stamp = ({ content }: { content?: React.ReactNode }) => (
  <div className="border-4 border-red-600 text-red-600 font-bold uppercase p-2 rounded-none opacity-90 transform -rotate-12 text-xs tracking-widest border-double mix-blend-multiply">
    {content}
  </div>
);

const Pencil = () => (
  <div className="w-64 h-4 bg-yellow-400 rounded-none shadow-xl relative flex items-center filter drop-shadow-lg">
    <div className="absolute left-0 w-0 h-0 border-t-[8px] border-t-transparent border-r-[20px] border-r-[#f0d090] border-b-[8px] border-b-transparent"></div>
    <div className="absolute left-[-20px] w-0 h-0 border-t-[8px] border-t-transparent border-r-[20px] border-r-gray-800 border-b-[8px] border-b-transparent scale-50 origin-right"></div>
    <div className="w-full h-full bg-yellow-400 border-t border-b border-yellow-500 flex items-center justify-center">
        <span className="text-[8px] font-bold text-yellow-700 tracking-widest uppercase">Ticonderoga</span>
    </div>
    <div className="absolute right-0 w-8 h-4 bg-pink-400 rounded-none border-l-4 border-gray-300"></div>
  </div>
);

const Eraser = () => (
  <div className="w-16 h-8 bg-white border border-gray-200 shadow-xl rounded-none relative overflow-hidden transform skew-x-6 flex">
    <div className="w-1/2 h-full bg-blue-500 border-r border-blue-600"></div>
    <div className="w-1/2 h-full bg-white flex items-center justify-center">
        <span className="text-[6px] font-bold text-gray-300 rotate-180">ERASER</span>
    </div>
  </div>
);

const Ruler = () => (
  <div className="w-80 h-12 bg-[#f0e68c]/90 backdrop-blur-sm border border-[#dkh070] shadow-lg flex items-end px-2 pb-1 space-x-[14px] overflow-hidden rounded-none">
     {Array.from({ length: 15 }).map((_, i) => (
        <div key={i} className="h-4 w-px bg-gray-500 relative flex flex-col justify-end items-center">
            {i % 5 === 0 && <div className="absolute bottom-4 text-[10px] font-mono text-gray-600">{i}</div>}
            <div className={`w-px bg-gray-600 ${i % 5 === 0 ? 'h-6' : 'h-3'}`}></div>
        </div>
     ))}
  </div>
);

const CoffeeStain = () => (
    <svg width="140" height="140" viewBox="0 0 100 100" className="opacity-30 mix-blend-multiply pointer-events-none">
        <path d="M50,10 A40,40 0 1,0 50,90 A40,40 0 1,0 50,10 M50,15 A35,35 0 1,1 50,85 A35,35 0 1,1 50,15" fill="#8B4513" />
    </svg>
);

const CrumpledPaper = () => (
    <div className="w-16 h-16 bg-white rounded-none shadow-md border border-gray-200 flex items-center justify-center overflow-hidden relative">
        <div className="absolute inset-0 bg-gray-100 opacity-50" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0% 100%)' }}></div>
        <svg viewBox="0 0 100 100" className="w-full h-full opacity-20">
            <path d="M10,10 Q30,50 10,90 T90,90 T90,10" fill="none" stroke="black" strokeWidth="1" />
            <path d="M20,20 L80,80 M80,20 L20,80" stroke="black" strokeWidth="1" />
        </svg>
    </div>
);

export default function StationeryScatter() {
  const [mounted, setMounted] = useState(false);
  const { scrollY } = useScroll();
  
  // Parallax effects
  const y1 = useTransform(scrollY, [0, 1000], [0, 150]);
  const y2 = useTransform(scrollY, [0, 1000], [0, -100]);
  const y3 = useTransform(scrollY, [0, 1000], [0, 50]);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const renderItem = (item: StationeryItemProps) => {
    let Component;
    switch (item.type) {
      case 'polaroid': Component = Polaroid; break;
      case 'ticket': Component = Ticket; break;
      case 'sticky-note': Component = StickyNote; break;
      case 'tape': Component = Tape; break;
      case 'clip': Component = Clip; break;
      case 'stamp': Component = Stamp; break;
      case 'pencil': Component = Pencil; break;
      case 'eraser': Component = Eraser; break;
      case 'ruler': Component = Ruler; break;
      case 'coffee-stain': Component = CoffeeStain; break;
      case 'crumpled-paper': Component = CrumpledPaper; break;
      default: Component = StickyNote;
    }

    // Varied parallax based on item ID
    const idNum = parseInt(item.id);
    let y = y1;
    if (idNum % 3 === 1) y = y2;
    if (idNum % 3 === 2) y = y3;
    
    return (
      <motion.div
        key={item.id}
        className="absolute pointer-events-auto cursor-grab active:cursor-grabbing touch-none"
        style={{
          left: `${item.x}%`,
          top: `${item.y}%`,
          zIndex: item.zIndex,
          y,
        }}
        initial={{ rotate: item.rotation, scale: 0.8, opacity: 0 }}
        animate={{ rotate: item.rotation, scale: 1, opacity: 1 }}
        transition={{ 
            duration: 0.8, 
            delay: idNum * 0.05,
            type: "spring",
            stiffness: 50
        }}
        drag
        dragMomentum={true}
        dragElastic={0.1}
        dragConstraints={{ left: -200, right: 200, top: -200, bottom: 200 }}
        whileHover={{ scale: 1.05, zIndex: 50, rotate: item.rotation + 5 }}
        whileDrag={{ scale: 1.1, zIndex: 100, cursor: 'grabbing', rotate: item.rotation - 5 }}
        whileTap={{ scale: 0.95 }}
      >
        <Component content={item.content} color={item.color} />
      </motion.div>
    );
  };

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
      {items.map(renderItem)}
    </div>
  );
}
