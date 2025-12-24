'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { BombModule } from './useBombDefusal';
import { EmailModule, LinkedInModule, WhatsAppModule, InstagramModule } from './ContactModules';

interface ModuleModalProps {
  module: BombModule | null;
  isOpen: boolean;
  onClose: () => void;
  onSolve: () => void;
  onStrike: () => void;
}

export function ModuleModal({ module, isOpen, onClose, onSolve, onStrike }: ModuleModalProps) {
  if (!module) return null;

  const renderModule = () => {
    switch (module.type) {
      case 'email':
        return (
          <EmailModule
            onSolve={onSolve}
            onStrike={onStrike}
            contactInfo={module.contactInfo}
          />
        );
      case 'linkedin':
        return (
          <LinkedInModule
            onSolve={onSolve}
            onStrike={onStrike}
            contactInfo={module.contactInfo}
          />
        );
      case 'whatsapp':
        return (
          <WhatsAppModule
            onSolve={onSolve}
            onStrike={onStrike}
            contactInfo={module.contactInfo}
          />
        );
      case 'instagram':
        return (
          <InstagramModule
            onSolve={onSolve}
            onStrike={onStrike}
            contactInfo={module.contactInfo}
          />
        );
      default:
        return <div style={{ color: 'var(--text-main)' }}>Unknown module type</div>;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="max-w-2xl w-full pointer-events-auto relative"
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '4px solid var(--border-color)',
                boxShadow: '0 0 0 2px var(--bg-main), 8px 8px 0 var(--border-color)',
              }}
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-2xl font-mono"
                style={{ color: 'var(--text-muted)' }}
              >
                ×
              </button>
              {renderModule()}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
