'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

const HeroSection = () => {
  const router = useRouter();

  const handleRedirectToAbout = () => {
    router.push('/about');
  };

  return (
    <section className="relative h-full w-full notebook-bg overflow-hidden">
      {/* Minimal Identity Overlay */}
      <motion.div
        className="absolute top-8 left-8 z-20"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
      >
        <div className="text-lg text-[var(--text-main)]">
          <h1 className="sketch-font text-6xl mb-2 font-bold kiruk-title sr-only">KIRUK - Arun kumaar Sreenivasan Portfolio</h1>
          <div className="sketch-font text-6xl mb-2 font-bold kiruk-title" aria-hidden="true">KIRUK</div>
          <div className="handwritten text-xl font-bold uppercase tracking-widest">Arun kumaar Sreenivasan</div>
          <div className="handwritten text-sm text-[var(--text-muted)] mt-1 uppercase">Full-Stack Developer & Designer</div>
          <div className="handwritten text-sm text-[var(--text-muted)] uppercase">📍 Bangalore</div>
        </div>
      </motion.div>

      {/* Floating Elements - Wireframe Style */}
      <motion.div
        className="absolute top-16 right-16 hidden lg:block cursor-pointer"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleRedirectToAbout}
      >
        <div className="wireframe-btn text-xl">
          SDE 1
        </div>
      </motion.div>

      <motion.div
        className="absolute bottom-16 left-16 hidden lg:block cursor-pointer"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleRedirectToAbout}
      >
        <div className="wireframe-btn-secondary text-lg">
          AWS + Spring Boot
        </div>
      </motion.div>

      <motion.div
        className="absolute top-1/2 right-8 hidden lg:block cursor-pointer"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleRedirectToAbout}
      >
        <div className="wireframe-btn text-base">
          UX/UI + Dev
        </div>
      </motion.div>

      {/* Adventure spirit indicators - Now clickable */}
      <motion.div
        className="absolute top-1/3 left-8 hidden lg:block cursor-pointer"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleRedirectToAbout}
      >
        <div className="wireframe-btn-secondary text-sm">
          Trekking {'>'} Party
        </div>
      </motion.div>

      <motion.div
        className="absolute bottom-1/3 right-1/3 hidden lg:block cursor-pointer"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleRedirectToAbout}
      >
        <div className="wireframe-btn text-sm">
          Table Tennis Pro
        </div>
      </motion.div>

      {/* Additional professional elements - Now clickable */}
      <motion.div
        className="absolute top-1/4 right-1/4 hidden lg:block cursor-pointer"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleRedirectToAbout}
      >
        <div className="wireframe-btn-secondary text-xs">
          AWS Expert
        </div>
      </motion.div>

      <motion.div
        className="absolute bottom-1/4 left-1/4 hidden lg:block cursor-pointer"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleRedirectToAbout}
      >
        <div className="wireframe-btn text-xs">
          Music Lover
        </div>
      </motion.div>

      <motion.div
        className="absolute top-2.5/3 left-1/3 hidden lg:block cursor-pointer"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleRedirectToAbout}
      >
        <div className="wireframe-btn-secondary text-xs">
          Collaboration
        </div>
      </motion.div>

    </section>
  );
};

export default HeroSection;
