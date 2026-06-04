'use client';

import { useState, useEffect } from 'react';

const FIGMA_EMBED_URL =
  'https://embed.figma.com/deck/XnfXOP7nWMgUIWv9MbEK26/Arun-s-portfolio?node-id=1-655&embed-host=share';

/**
 * Deferred Figma iframe so the page title and copy can be the LCP;
 * iframe loads after first paint to avoid blocking RES.
 */
export function FigmaEmbed({ fill = false }: Readonly<{ fill?: boolean }>) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div
      className={`w-full bg-[var(--bg-main)] flex items-center justify-center ${
        fill ? "h-full min-h-[280px]" : "aspect-video min-h-[320px]"
      }`}
      style={{ borderColor: "var(--border-color)" }}
    >
      {mounted ? (
        <iframe
          title="Arun's portfolio presentation"
          src={FIGMA_EMBED_URL}
          className="h-full w-full"
          allowFullScreen
          loading="lazy"
        />
      ) : (
        <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
          Loading presentation…
        </span>
      )}
    </div>
  );
}
