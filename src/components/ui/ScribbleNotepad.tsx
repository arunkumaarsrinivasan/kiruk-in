'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

type QuickTemplate = {
  label: string;
  text: string;
};

type ScribbleNotepadProps = {
  className?: string;
  title?: string;
  subtitle?: string;
  accentEmoji?: string;
  storageKey?: string;
  placeholder?: string;
  maxLength?: number;
  quickTemplates?: QuickTemplate[];
};

const ScribbleNotepad: React.FC<ScribbleNotepadProps> = ({
  className = '',
  title = 'Notebook',
  subtitle = 'Type quick reminders or interview notes.',
  accentEmoji = '📝',
  storageKey = 'kiruk-notepad',
  placeholder = 'Jot your thoughts here...',
  maxLength = 600,
  quickTemplates,
}) => {
  const [note, setNote] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      const saved = window.localStorage.getItem(storageKey);
      if (saved) {
        setNote(saved);
      }
    } catch (error) {
      console.error('Unable to read notebook draft from storage', error);
    }
  }, [storageKey]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      if (note.trim().length === 0) {
        window.localStorage.removeItem(storageKey);
      } else {
        window.localStorage.setItem(storageKey, note);
      }
    } catch (error) {
      console.error('Unable to persist notebook draft', error);
    }
  }, [note, storageKey]);

  const handleClear = () => {
    setNote('');
  };

  const handleTemplateInsert = (templateText: string) => {
    setNote((prev) => {
      if (!prev) {
        return templateText;
      }
      const separator = prev.endsWith('\n') ? '' : '\n';
      return `${prev}${separator}${templateText}`;
    });
  };

  return (
    <div className={`relative ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative w-full max-w-2xl md:max-w-3xl rounded-3xl border-2 border-dashed border-yellow-300 bg-yellow-50/80 shadow-[4px_6px_0_rgba(0,0,0,0.08)] p-4"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-yellow-700 handwritten">{title}</p>
            <p className="text-[11px] text-yellow-800/90 handwritten leading-snug mt-1">{subtitle}</p>
          </div>
          <span className="text-xl select-none" aria-hidden="true">{accentEmoji}</span>
        </div>
        <div className="mt-3 rounded-2xl border border-yellow-200 bg-white p-3">
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder={placeholder}
            maxLength={maxLength}
            className="w-full h-48 resize-none border-0 outline-none handwritten text-[13px] leading-snug text-gray-800 bg-transparent"
            aria-label="Personal notes"
          />
        </div>
        {quickTemplates && quickTemplates.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-yellow-700 handwritten">
            <span className="pt-1">Quick add:</span>
            {quickTemplates.map((template) => (
              <button
                key={template.label}
                type="button"
                onClick={() => handleTemplateInsert(template.text)}
                className="px-2 py-1 rounded-full border border-yellow-400 bg-white/90 hover:bg-yellow-100 transition"
              >
                {template.label}
              </button>
            ))}
          </div>
        )}
        <div className="mt-3 flex items-center justify-between text-[11px] text-yellow-700 handwritten">
          <span>
            {maxLength ? `${note.length} / ${maxLength}` : note.length} chars saved locally
          </span>
          <button
            type="button"
            onClick={handleClear}
            className="px-2 py-1 rounded-full border border-yellow-400 bg-white/90 hover:bg-yellow-100 transition"
          >
            Clear
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ScribbleNotepad;
