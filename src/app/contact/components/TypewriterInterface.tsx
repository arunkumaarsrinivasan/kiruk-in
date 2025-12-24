'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';

interface TypewriterInterfaceProps {
  message: string;
  onMessageChange: (message: string) => void;
  onKeyPress: (key: string) => void;
  onNameChange?: (name: string) => void;
  onEmailChange?: (email: string) => void;
  disabled?: boolean;
  fieldsVisible: {
    name: boolean;
    email: boolean;
    message: boolean;
  };
}

const KEYBOARD_LAYOUT = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
];

const SPECIAL_KEYS = [
  { key: 'SPACE', label: 'SPACE', width: 200 },
  { key: 'BACKSPACE', label: '⌫', width: 100 },
  { key: 'ENTER', label: 'ENTER', width: 100 },
];

export function TypewriterInterface({
  message,
  onMessageChange,
  onKeyPress,
  onNameChange,
  onEmailChange,
  disabled = false,
  fieldsVisible,
}: TypewriterInterfaceProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentField, setCurrentField] = useState<'name' | 'email' | 'message'>('name');
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (currentField === 'name' && nameRef.current) {
      nameRef.current.focus();
    } else if (currentField === 'email' && emailRef.current) {
      emailRef.current.focus();
    } else if (currentField === 'message' && messageRef.current) {
      messageRef.current.focus();
    }
  }, [currentField]);

  const handleKeyClick = (key: string) => {
    if (disabled) return;

    onKeyPress(key);

    if (key === 'BACKSPACE') {
      if (currentField === 'name') {
        const newName = name.slice(0, -1);
        setName(newName);
        onNameChange?.(newName);
      } else if (currentField === 'email') {
        const newEmail = email.slice(0, -1);
        setEmail(newEmail);
        onEmailChange?.(newEmail);
      } else {
        onMessageChange(message.slice(0, -1));
      }
    } else if (key === 'SPACE') {
      if (currentField === 'name') {
        const newName = name + ' ';
        setName(newName);
        onNameChange?.(newName);
      } else if (currentField === 'email') {
        const newEmail = email + ' ';
        setEmail(newEmail);
        onEmailChange?.(newEmail);
      } else {
        onMessageChange(message + ' ');
      }
    } else if (key === 'ENTER') {
      if (currentField === 'name' && fieldsVisible.email) {
        setCurrentField('email');
      } else if (currentField === 'email' && fieldsVisible.message) {
        setCurrentField('message');
      }
    } else {
      // Regular letter
      if (currentField === 'name') {
        const newName = name + key;
        setName(newName);
        onNameChange?.(newName);
      } else if (currentField === 'email') {
        const newEmail = email + key;
        setEmail(newEmail);
        onEmailChange?.(newEmail);
      } else {
        onMessageChange(message + key);
      }
    }
  };

  return (
    <div className="bg-gray-900 border-4 border-yellow-600 p-4 font-mono" style={{ imageRendering: 'pixelated' as any }}>
      {/* Typewriter display */}
      <div className="bg-black border-2 border-yellow-500 p-4 mb-4 min-h-[200px]">
        <div className="text-yellow-400 text-sm mb-2">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-green-400">TO:</span>
            <span>arunkumaar.srinivasan@gmail.com</span>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-green-400">FROM:</span>
            <AnimatePresence mode="wait">
              {currentField === 'name' ? (
                <motion.input
                  key="name"
                  ref={nameRef}
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    onNameChange?.(e.target.value);
                  }}
                  placeholder="Your name"
                  className="bg-transparent border-b border-yellow-500 text-yellow-400 outline-none flex-1"
                  disabled={disabled || !fieldsVisible.name}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
              ) : (
                <motion.span
                  key="name-display"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {name || '...'}
                </motion.span>
              )}
            </AnimatePresence>
            {!fieldsVisible.name && (
              <span className="text-red-500 text-xs">[FIELD LOST]</span>
            )}
          </div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-green-400">EMAIL:</span>
            <AnimatePresence mode="wait">
              {currentField === 'email' ? (
                <motion.input
                  key="email"
                  ref={emailRef}
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    onEmailChange?.(e.target.value);
                  }}
                  placeholder="your@email.com"
                  className="bg-transparent border-b border-yellow-500 text-yellow-400 outline-none flex-1"
                  disabled={disabled || !fieldsVisible.email}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
              ) : (
                <motion.span
                  key="email-display"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {email || '...'}
                </motion.span>
              )}
            </AnimatePresence>
            {!fieldsVisible.email && (
              <span className="text-red-500 text-xs">[FIELD LOST]</span>
            )}
          </div>
          <div className="mb-2">
            <div className="text-green-400 mb-1">MESSAGE:</div>
            <AnimatePresence mode="wait">
              {currentField === 'message' ? (
                <motion.textarea
                  key="message"
                  ref={messageRef}
                  value={message}
                  onChange={(e) => onMessageChange(e.target.value)}
                  placeholder="Type your urgent message..."
                  className="w-full bg-transparent border border-yellow-500 text-yellow-400 outline-none resize-none min-h-[100px] p-2"
                  disabled={disabled || !fieldsVisible.message}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
              ) : (
                <motion.div
                  key="message-display"
                  className="w-full border border-yellow-500 text-yellow-400 min-h-[100px] p-2 whitespace-pre-wrap"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {message || '...'}
                  {!fieldsVisible.message && (
                    <span className="text-red-500 text-xs block mt-2">[FIELD LOST]</span>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Typewriter keyboard */}
      <div className="space-y-2">
        {KEYBOARD_LAYOUT.map((row, rowIdx) => (
          <div key={rowIdx} className="flex gap-1 justify-center">
            {row.map((key) => (
              <motion.button
                key={key}
                onClick={() => handleKeyClick(key)}
                disabled={disabled}
                className="px-3 py-2 bg-gray-800 border-2 border-yellow-600 text-yellow-400 font-mono text-sm hover:bg-yellow-900 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                style={{ imageRendering: 'pixelated' as any }}
              >
                {key}
              </motion.button>
            ))}
          </div>
        ))}
        <div className="flex gap-1 justify-center">
          {SPECIAL_KEYS.map((special) => (
            <motion.button
              key={special.key}
              onClick={() => handleKeyClick(special.key)}
              disabled={disabled}
              className="px-4 py-2 bg-gray-800 border-2 border-yellow-600 text-yellow-400 font-mono text-sm hover:bg-yellow-900 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ width: special.width, imageRendering: 'pixelated' as any }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {special.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Field navigation */}
      <div className="mt-4 flex gap-2 justify-center">
        <motion.button
          onClick={() => setCurrentField('name')}
          disabled={!fieldsVisible.name || disabled}
          className={`px-3 py-1 border-2 font-mono text-xs ${
            currentField === 'name'
              ? 'border-yellow-400 bg-yellow-900 text-yellow-400'
              : 'border-gray-600 bg-gray-800 text-gray-400'
          } disabled:opacity-50`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          NAME
        </motion.button>
        <motion.button
          onClick={() => setCurrentField('email')}
          disabled={!fieldsVisible.email || disabled}
          className={`px-3 py-1 border-2 font-mono text-xs ${
            currentField === 'email'
              ? 'border-yellow-400 bg-yellow-900 text-yellow-400'
              : 'border-gray-600 bg-gray-800 text-gray-400'
          } disabled:opacity-50`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          EMAIL
        </motion.button>
        <motion.button
          onClick={() => setCurrentField('message')}
          disabled={!fieldsVisible.message || disabled}
          className={`px-3 py-1 border-2 font-mono text-xs ${
            currentField === 'message'
              ? 'border-yellow-400 bg-yellow-900 text-yellow-400'
              : 'border-gray-600 bg-gray-800 text-gray-400'
          } disabled:opacity-50`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          MESSAGE
        </motion.button>
      </div>
    </div>
  );
}
