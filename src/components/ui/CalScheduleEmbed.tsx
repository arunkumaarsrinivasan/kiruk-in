"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";

type CalEventOption = {
  id: string;
  label: string;
  description: string;
  slug: string;
};

type CalScheduleEmbedProps = {
  events: CalEventOption[];
  primaryColor?: string;
  theme?: 'light' | 'dark';
};

const buildEmbedUrl = (slug: string, primaryColor?: string, theme: 'light' | 'dark' = 'light') => {
  const base = `https://app.cal.com/${slug}`;
  const params = new URLSearchParams({ embedType: "inline", layout: "month_view", theme });
  if (primaryColor) {
    params.set("primaryColor", primaryColor.replace("#", ""));
  }
  return `${base}?${params.toString()}`;
};

export default function CalScheduleEmbed({ events, primaryColor, theme = 'light' }: CalScheduleEmbedProps) {
  const [activeEvent, setActiveEvent] = useState(() => events[0]);
  const embedUrl = useMemo(
    () => buildEmbedUrl(activeEvent.slug, primaryColor, theme),
    [activeEvent.slug, primaryColor, theme]
  );
  const slugConfigured = !/(your|sample)-cal-handle/gi.test(activeEvent.slug);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {events.map((event) => {
          const isActive = event.id === activeEvent.id;
          return (
            <motion.button
              key={event.id}
              type="button"
              onClick={() => setActiveEvent(event)}
              className={`px-3 py-1.5 border rounded-none handwritten text-xs transition focus:outline-none ${
                isActive
                  ? "bg-yellow-100 border-yellow-400 text-yellow-900"
                  : "bg-white border-gray-300 text-gray-700 hover:border-gray-500"
              }`}
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.04 }}
              aria-pressed={isActive}
            >
              <span className="flex flex-col text-left">
                <span className="font-semibold text-sm">{event.label}</span>
                <span className="text-[11px] leading-tight text-gray-600">{event.description}</span>
              </span>
            </motion.button>
          );
        })}
      </div>
      <div className="rounded-none border border-dashed border-gray-300 bg-white/70 overflow-hidden min-h-[420px]">
        {slugConfigured ? (
          <iframe
            key={activeEvent.id}
            src={embedUrl}
            title={`${activeEvent.label} scheduling`}
            className="w-full h-[420px]"
            loading="lazy"
            allowFullScreen
            style={{ background: '#ffffff' }}
          />
        ) : (
          <div className="flex items-center justify-center h-full px-4 text-center text-xs text-gray-600 handwritten">
            Update the Cal.com slug for this event to show the live scheduler.
          </div>
        )}
      </div>
    </div>
  );
}
