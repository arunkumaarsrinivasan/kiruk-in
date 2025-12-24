'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

const GRID_SIZE = 20;
const PIXEL_SIZE = 4;

interface BaseModuleProps {
  onSolve: () => void;
  onStrike: () => void;
  contactInfo: {
    label: string;
    value: string;
    hint: string;
  };
}

// Email Module
export function EmailModule({ onSolve, onStrike, contactInfo }: BaseModuleProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isSolved, setIsSolved] = useState(false);

  const options = [
    'arunkumaar.srinivasan@gmail.com',
    'arun.kumar@gmail.com',
    'arunkumaar@gmail.com',
    'arunkumaar.s@gmail.com',
  ];

  const handleSelect = (index: number) => {
    if (isSolved) return;
    
    setSelectedIndex(index);
    
    if (index === 0) {
      setIsSolved(true);
      setTimeout(() => onSolve(), 500);
    } else {
      onStrike();
      setTimeout(() => setSelectedIndex(null), 1000);
    }
  };

  return (
    <div
      className="p-6"
      style={{
        backgroundColor: 'var(--bg-card)',
        border: '4px solid var(--border-color)',
        boxShadow: '0 0 0 2px var(--bg-main), 4px 4px 0 var(--border-color)',
      }}
    >
      <h3 className="text-xl font-mono font-bold mb-4 text-center" style={{ color: 'var(--text-main)' }}>
        EMAIL MODULE
      </h3>
      
      <div
        className="mb-4 p-3 text-sm font-mono"
        style={{
          backgroundColor: 'var(--bg-main)',
          border: '2px solid var(--border-color)',
          color: 'var(--text-muted)',
        }}
      >
        {contactInfo.hint}
      </div>
      
      <div className="space-y-2">
        {options.map((email, index) => {
          const isSelected = selectedIndex === index;
          const isCorrect = index === 0;
          
          return (
            <motion.button
              key={index}
              onClick={() => handleSelect(index)}
              disabled={isSolved}
              className="w-full p-3 border-2 font-mono text-sm text-left"
              style={{
                backgroundColor: isSelected && isCorrect
                  ? '#6BCF7F'
                  : isSelected && !isCorrect
                  ? '#FF6B6B'
                  : 'var(--bg-card)',
                borderColor: isSelected && isCorrect
                  ? '#6BCF7F'
                  : isSelected && !isCorrect
                  ? '#FF6B6B'
                  : 'var(--border-color)',
                color: isSelected ? '#000' : 'var(--text-main)',
                boxShadow: 'inset 0 0 0 1px var(--bg-main)',
                cursor: isSolved ? 'not-allowed' : 'pointer',
              }}
              whileHover={!isSolved ? { scale: 1.02 } : {}}
              whileTap={!isSolved ? { scale: 0.98 } : {}}
            >
              {email}
            </motion.button>
          );
        })}
      </div>

      {isSolved && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-lg font-mono mt-4"
          style={{ color: '#6BCF7F' }}
        >
          ✓ Email found: {contactInfo.value}
        </motion.div>
      )}
    </div>
  );
}

// LinkedIn Module
export function LinkedInModule({ onSolve, onStrike, contactInfo }: BaseModuleProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isSolved, setIsSolved] = useState(false);

  const options = [
    'linkedin.com/in/arunkumaarsreenivasan',
    'linkedin.com/in/arunkumaar',
    'linkedin.com/in/arun-kumar',
    'linkedin.com/in/arunkumaar-srinivasan',
  ];

  const handleSelect = (index: number) => {
    if (isSolved) return;
    
    setSelectedIndex(index);
    
    if (index === 0) {
      setIsSolved(true);
      setTimeout(() => onSolve(), 500);
    } else {
      onStrike();
      setTimeout(() => setSelectedIndex(null), 1000);
    }
  };

  return (
    <div
      className="p-6"
      style={{
        backgroundColor: 'var(--bg-card)',
        border: '4px solid var(--border-color)',
        boxShadow: '0 0 0 2px var(--bg-main), 4px 4px 0 var(--border-color)',
      }}
    >
      <h3 className="text-xl font-mono font-bold mb-4 text-center" style={{ color: 'var(--text-main)' }}>
        LINKEDIN MODULE
      </h3>
      
      <div
        className="mb-4 p-3 text-sm font-mono"
        style={{
          backgroundColor: 'var(--bg-main)',
          border: '2px solid var(--border-color)',
          color: 'var(--text-muted)',
        }}
      >
        {contactInfo.hint}
      </div>
      
      <div className="space-y-2">
        {options.map((url, index) => {
          const isSelected = selectedIndex === index;
          const isCorrect = index === 0;
          
          return (
            <motion.button
              key={index}
              onClick={() => handleSelect(index)}
              disabled={isSolved}
              className="w-full p-3 border-2 font-mono text-sm text-left"
              style={{
                backgroundColor: isSelected && isCorrect
                  ? '#6BCF7F'
                  : isSelected && !isCorrect
                  ? '#FF6B6B'
                  : 'var(--bg-card)',
                borderColor: isSelected && isCorrect
                  ? '#6BCF7F'
                  : isSelected && !isCorrect
                  ? '#FF6B6B'
                  : 'var(--border-color)',
                color: isSelected ? '#000' : 'var(--text-main)',
                boxShadow: 'inset 0 0 0 1px var(--bg-main)',
                cursor: isSolved ? 'not-allowed' : 'pointer',
              }}
              whileHover={!isSolved ? { scale: 1.02 } : {}}
              whileTap={!isSolved ? { scale: 0.98 } : {}}
            >
              {url}
            </motion.button>
          );
        })}
      </div>

      {isSolved && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-lg font-mono mt-4"
          style={{ color: '#6BCF7F' }}
        >
          ✓ LinkedIn found: {contactInfo.value}
        </motion.div>
      )}
    </div>
  );
}

// WhatsApp Module
export function WhatsAppModule({ onSolve, onStrike, contactInfo }: BaseModuleProps) {
  const [input, setInput] = useState('');
  const [isSolved, setIsSolved] = useState(false);

  const handleSubmit = () => {
    if (isSolved) return;
    
    if (input.trim() === '+91') {
      setIsSolved(true);
      setTimeout(() => onSolve(), 500);
    } else {
      onStrike();
      setInput('');
    }
  };

  return (
    <div
      className="p-6"
      style={{
        backgroundColor: 'var(--bg-card)',
        border: '4px solid var(--border-color)',
        boxShadow: '0 0 0 2px var(--bg-main), 4px 4px 0 var(--border-color)',
      }}
    >
      <h3 className="text-xl font-mono font-bold mb-4 text-center" style={{ color: 'var(--text-main)' }}>
        WHATSAPP MODULE
      </h3>
      
      <div
        className="mb-4 p-3 text-sm font-mono"
        style={{
          backgroundColor: 'var(--bg-main)',
          border: '2px solid var(--border-color)',
          color: 'var(--text-muted)',
        }}
      >
        {contactInfo.hint}
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-mono mb-2" style={{ color: 'var(--text-main)' }}>
            Enter country code:
          </label>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
            disabled={isSolved}
            className="w-full p-3 border-2 font-mono"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-main)',
              boxShadow: 'inset 0 0 0 1px var(--bg-main)',
            }}
            placeholder="+XX"
          />
        </div>
        
        <motion.button
          onClick={handleSubmit}
          disabled={isSolved || !input}
          className="w-full p-3 border-2 font-mono font-bold"
          style={{
            backgroundColor: isSolved ? '#6BCF7F' : 'var(--bg-card)',
            borderColor: isSolved ? '#6BCF7F' : 'var(--border-color)',
            color: isSolved ? '#000' : 'var(--text-main)',
            boxShadow: 'inset 0 0 0 1px var(--bg-main)',
            cursor: isSolved || !input ? 'not-allowed' : 'pointer',
          }}
          whileHover={!isSolved && input ? { scale: 1.02 } : {}}
          whileTap={!isSolved && input ? { scale: 0.98 } : {}}
        >
          {isSolved ? '✓ SOLVED' : 'SUBMIT'}
        </motion.button>
      </div>

      {isSolved && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-lg font-mono mt-4"
          style={{ color: '#6BCF7F' }}
        >
          ✓ Country code correct: {input}
        </motion.div>
      )}
    </div>
  );
}

// Instagram Module
export function InstagramModule({ onSolve, onStrike, contactInfo }: BaseModuleProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isSolved, setIsSolved] = useState(false);

  const options = ['@arunum.avan.seyalum', '@kirukism', '@arunkumaar', '@kiruk_in'];

  const handleSelect = (index: number) => {
    if (isSolved) return;
    
    setSelectedIndex(index);
    
    // Both index 0 (personal) and 1 (professional) are correct
    if (index === 0 || index === 1) {
      setIsSolved(true);
      setTimeout(() => onSolve(), 500);
    } else {
      onStrike();
      setTimeout(() => setSelectedIndex(null), 1000);
    }
  };

  return (
    <div
      className="p-6"
      style={{
        backgroundColor: 'var(--bg-card)',
        border: '4px solid var(--border-color)',
        boxShadow: '0 0 0 2px var(--bg-main), 4px 4px 0 var(--border-color)',
      }}
    >
      <h3 className="text-xl font-mono font-bold mb-4 text-center" style={{ color: 'var(--text-main)' }}>
        INSTAGRAM MODULE
      </h3>
      
      <div
        className="mb-4 p-3 text-sm font-mono"
        style={{
          backgroundColor: 'var(--bg-main)',
          border: '2px solid var(--border-color)',
          color: 'var(--text-muted)',
        }}
      >
        {contactInfo.hint}
      </div>
      
      <div className="space-y-2">
        {options.map((handle, index) => {
          const isSelected = selectedIndex === index;
          const isCorrect = index === 0;
          
          return (
            <motion.button
              key={index}
              onClick={() => handleSelect(index)}
              disabled={isSolved}
              className="w-full p-3 border-2 font-mono text-sm text-left"
              style={{
                backgroundColor: isSelected && isCorrect
                  ? '#6BCF7F'
                  : isSelected && !isCorrect
                  ? '#FF6B6B'
                  : 'var(--bg-card)',
                borderColor: isSelected && isCorrect
                  ? '#6BCF7F'
                  : isSelected && !isCorrect
                  ? '#FF6B6B'
                  : 'var(--border-color)',
                color: isSelected ? '#000' : 'var(--text-main)',
                boxShadow: 'inset 0 0 0 1px var(--bg-main)',
                cursor: isSolved ? 'not-allowed' : 'pointer',
              }}
              whileHover={!isSolved ? { scale: 1.02 } : {}}
              whileTap={!isSolved ? { scale: 0.98 } : {}}
            >
              {handle}
            </motion.button>
          );
        })}
      </div>

      {isSolved && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-lg font-mono mt-4"
          style={{ color: '#6BCF7F' }}
        >
          ✓ Instagram found: {selectedIndex === 0 ? '@arunum.avan.seyalum (Personal)' : '@kirukism (Professional)'}
        </motion.div>
      )}
    </div>
  );
}
