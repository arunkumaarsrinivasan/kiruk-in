'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

const Navigation = () => {
  const pathname = usePathname();
  
  const navItems = [
    { href: '/', label: 'Home', emoji: '🏠' },
    { href: '/about', label: 'About', emoji: '👋' },
    { href: '/work', label: 'Work', emoji: '🎨' },
    { href: '/case-studies', label: 'Case Studies', emoji: '📚' },
    { href: '/contact', label: 'Contact', emoji: '💬' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b-2 sketch-border notebook-lines">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo with sketch style */}
          <Link href="/" className="flex items-center space-x-2 group">            <motion.div
              className="relative"
              whileHover={{ 
                scale: 1.1
              }}
              animate={{
                rotate: [0, -5, 5, 0]
              }}
              transition={{
                rotate: {
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                },
                scale: {
                  type: "spring",
                  stiffness: 300,
                  damping: 10
                }
              }}
            >
              <span className="text-2xl">✏️</span>
              {/* Hand-drawn circle around logo */}
              <motion.div
                className="absolute inset-0 w-8 h-8 border-2 border-sketch-blue rounded-full opacity-0 group-hover:opacity-70"
                initial={{ scale: 0, rotate: 0 }}
                whileHover={{ 
                  scale: 1.5, 
                  rotate: 360,
                  opacity: [0, 0.7, 0]
                }}
                transition={{ duration: 1 }}
                style={{
                  borderStyle: 'dashed',
                  transform: 'rotate(-5deg)'
                }}
              />
            </motion.div>
            <span className="handwritten font-bold text-xl text-gray-900">
              kiruk
            </span>
            {/* Underline scribble */}
            <motion.div
              className="absolute bottom-1 left-10 h-0.5 bg-sketch-blue opacity-0 group-hover:opacity-60"
              initial={{ width: 0 }}
              whileHover={{ width: 40 }}
              transition={{ duration: 0.3 }}
              style={{
                transform: 'rotate(-1deg)',
                borderRadius: '50%'
              }}
            />
          </Link>

          {/* Navigation Links with sketch style */}
          <div className="hidden md:flex space-x-1">
            {navItems.map((item, index) => (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Link
                  href={item.href}
                  className={`relative px-4 py-2 rounded-lg transition-all duration-300 handwritten text-sm font-medium group ${
                    pathname === item.href
                      ? 'text-sketch-blue bg-yellow-50 sketch-border'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <span className="inline-block mr-1 text-xs">
                    {item.emoji}
                  </span>
                  {item.label}
                  
                  {/* Hand-drawn active indicator */}
                  {pathname === item.href && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute -bottom-1 left-2 right-2 h-1 bg-sketch-blue opacity-60 rounded-full"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      style={{
                        transform: 'rotate(-0.5deg)',
                        background: 'linear-gradient(90deg, transparent, #3b82f6, transparent)'
                      }}
                    />
                  )}
                  
                  {/* Hover scribble effect */}
                  <motion.div
                    className="absolute inset-0 border-2 border-sketch-purple rounded-lg opacity-0 group-hover:opacity-30"
                    initial={{ scale: 0.8, rotate: 0 }}
                    whileHover={{ 
                      scale: 1,
                      rotate: [-1, 1, -1],
                      opacity: [0, 0.3, 0]
                    }}
                    transition={{ duration: 0.6 }}
                    style={{
                      borderStyle: 'dashed'
                    }}
                  />
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="text-gray-600 hover:text-gray-900">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
