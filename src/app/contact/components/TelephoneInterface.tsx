'use client';

import { motion, useReducedMotion } from 'framer-motion';

interface ContactInfo {
  label: string;
  value: string;
  icon: string;
  href: string;
}

interface TelephoneInterfaceProps {
  contacts: ContactInfo[];
}

function isExternal(href: string) {
  return href.startsWith('http://') || href.startsWith('https://');
}

export function TelephoneInterface({ contacts }: TelephoneInterfaceProps) {
  const reduce = useReducedMotion();

  return (
    <div className="space-y-4">
      <div className="mb-6 text-center">
        <div className="mb-2 text-4xl" aria-hidden>
          ☎️
        </div>
        <h2 className="mb-2 font-mono text-xl font-bold" style={{ color: 'var(--text-main)' }}>
          CONNECTION TERMINAL
        </h2>
        <p className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
          Open a channel — email, social, or the calendar
        </p>
      </div>

      <div className="space-y-3">
        {contacts.map((contact, index) => {
          const external = isExternal(contact.href);
          return (
            <motion.a
              key={contact.label}
              href={contact.href}
              target={external ? '_blank' : undefined}
              rel={external ? 'noopener noreferrer' : undefined}
              className="relative block w-full min-h-11 p-4 text-left font-mono text-sm"
              style={{
                backgroundColor: 'var(--bg-main)',
                border: '2px solid var(--border-color)',
                color: 'var(--text-main)',
              }}
              initial={reduce ? false : { x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: reduce ? 0 : index * 0.08 }}
              whileHover={reduce ? undefined : { x: 4 }}
              whileTap={reduce ? undefined : { scale: 0.98 }}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="text-2xl" aria-hidden>
                    {contact.icon}
                  </span>
                  <div className="min-w-0">
                    <div className="font-bold">{contact.label}</div>
                    <div className="truncate text-xs" style={{ color: 'var(--text-muted)' }}>
                      {contact.value}
                    </div>
                  </div>
                </div>
                <span className="shrink-0 text-xs" style={{ color: 'var(--text-muted)' }}>
                  {external ? 'open ↗' : 'open'}
                </span>
              </div>
            </motion.a>
          );
        })}
      </div>
    </div>
  );
}
