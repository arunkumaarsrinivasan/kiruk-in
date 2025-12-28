'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

interface ContactInfo {
  label: string;
  value: string;
  icon: string;
  href: string;
}

interface TelephoneInterfaceProps {
  contacts: ContactInfo[];
}

export function TelephoneInterface({ contacts }: TelephoneInterfaceProps) {
  const [dialing, setDialing] = useState<string | null>(null);
  const [connected, setConnected] = useState<string | null>(null);

  const handleDial = (contact: ContactInfo) => {
    if (connected === contact.label) return;
    
    setDialing(contact.label);
    
    // Simulate dialing animation
    setTimeout(() => {
      setDialing(null);
      setConnected(contact.label);
      
      // Open the link after connection animation
      setTimeout(() => {
        window.open(contact.href, '_blank', 'noopener,noreferrer');
      }, 500);
    }, 1000);
  };

  return (
    <div className="space-y-4">
      {/* Telephone Header */}
      <div className="text-center mb-6">
        <div className="text-4xl mb-2">☎️</div>
        <h3 className="text-xl font-mono font-bold mb-2" style={{ color: 'var(--text-main)' }}>
          CONNECTION TERMINAL
        </h3>
        <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
          Press buttons to establish connection
        </p>
      </div>

      {/* Contact Buttons - Telephone Style */}
      <div className="space-y-3">
        {contacts.map((contact, index) => {
          const isDialing = dialing === contact.label;
          const isConnected = connected === contact.label;
          
          return (
            <motion.button
              key={contact.label}
              onClick={() => handleDial(contact)}
              disabled={isDialing || isConnected}
              className="w-full p-4 font-mono text-sm text-left relative"
              style={{
                backgroundColor: isConnected 
                  ? '#6BCF7F' 
                  : isDialing 
                    ? '#FFD93D' 
                    : 'var(--bg-main)',
                border: '2px solid var(--border-color)',
                color: isConnected || isDialing ? '#000' : 'var(--text-main)',
                cursor: isDialing || isConnected ? 'default' : 'pointer',
              }}
              initial={{ x: -20, opacity: 0 }}
              animate={{ 
                x: 0, 
                opacity: 1,
                scale: isDialing ? 1.05 : 1,
              }}
              transition={{ 
                delay: index * 0.1,
                scale: { duration: 0.2 }
              }}
              whileHover={!isDialing && !isConnected ? { 
                scale: 1.02, 
                x: 4,
                borderColor: '#FFD93D',
              } : {}}
              whileTap={!isDialing && !isConnected ? { scale: 0.98 } : {}}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{contact.icon}</span>
                  <div>
                    <div className="font-bold" style={{ 
                      color: isConnected || isDialing ? '#000' : 'var(--text-main)' 
                    }}>
                      {contact.label}
                    </div>
                    <div className="text-xs" style={{ 
                      color: isConnected || isDialing ? 'rgba(0,0,0,0.7)' : 'var(--text-muted)' 
                    }}>
                      {contact.value}
                    </div>
                  </div>
                </div>
                
                {/* Status Indicator */}
                <div className="flex items-center gap-2">
                  {isDialing && (
                    <motion.div
                      className="flex gap-1"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                    >
                      <span className="text-xs">DIALING...</span>
                    </motion.div>
                  )}
                  {isConnected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-lg"
                    >
                      ✓
                    </motion.div>
                  )}
                  {!isDialing && !isConnected && (
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      [PRESS]
                    </div>
                  )}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Connection Status */}
      {connected && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 text-center font-mono text-xs"
          style={{
            backgroundColor: 'rgba(107, 207, 127, 0.2)',
            border: '2px solid #6BCF7F',
            color: '#6BCF7F',
          }}
        >
          ✓ Connection established! Opening link...
        </motion.div>
      )}
    </div>
  );
}
