"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useDesignEra } from "@/contexts/DesignEraContext";

const DINO_FRAMES = [
  `
         ██████
        ████████
        ████████
        ███▄████
        ██████
        ██████
██      ██
███    ██████
 ████████████
   ████████
    ██  ██
    ██  ██
    ██   ██
`,
  `
         ██████
        ████████
        ████████
        ███▄████
        ██████
        ██████
██      ██
███    ██████
 ████████████
   ████████
    ██  ██
     ██  ██
      ██  ██
`,
];

function AnimatedDino() {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setFrame((prev) => (prev + 1) % DINO_FRAMES.length);
    }, 150);
    return () => clearInterval(interval);
  }, []);

  return (
    <pre
      className="text-[4px] md:text-[5px] leading-[4px] md:leading-[5px] font-mono font-black whitespace-pre px-6 md:px-12"
      style={{
        color: "var(--accent-color)",
        imageRendering: "pixelated",
      }}
    >
      {DINO_FRAMES[frame].replace(/^\n/, "")}
    </pre>
  );
}

const TICKER_ITEMS = [
  { text: "SEE MY WORK", href: "/work", icon: "✦" },
  { text: "VIEW MY JOURNEY", href: "/about", icon: "▲" },
  { text: "CHECK PROGRESS", href: "/progress", icon: "●" },
  {
    text: "INITIATE COLLAB",
    href: "mailto:arunkumaar.srinivasan@gmail.com",
    icon: "■",
  },
];

export default function EraFooter() {
  const { currentEra } = useDesignEra();
  const isModern = Number(currentEra.id) >= 2020;
  const isRetro = Number(currentEra.id) < 2000;

  return (
    <footer
      className="relative overflow-hidden py-12 md:py-20"
      data-cursor-zone="footer"
      style={{
        backgroundColor: "var(--bg-main)",
      }}
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {isModern && (
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-32 blur-3xl"
            animate={{
              opacity: [0.05, 0.15, 0.05],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            style={{
              backgroundColor: "var(--accent-color)",
            }}
          />
        )}
      </div>

      <div className="relative z-10 w-full flex flex-col gap-6">
        <div className="flex items-center justify-between px-6 md:px-12 max-w-[1600px] mx-auto w-full">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ opacity: [1, 0.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-2.5 h-2.5"
              style={{
                backgroundColor: "var(--accent-color)",
                borderRadius: isRetro ? 0 : "999px",
              }}
            />
            <span
              className="text-[10px] md:text-xs font-mono uppercase tracking-[0.2em]"
              style={{ color: "var(--text-muted)" }}
            >
              SYSTEM ONLINE
            </span>
          </div>
          <span
            className="text-[10px] md:text-xs font-mono uppercase tracking-[0.2em]"
            style={{ color: "var(--text-muted)" }}
          >
            {currentEra.id} · {currentEra.name.split(":")[0]}
          </span>
        </div>

        {/* Ticker Tape */}
        <div
          className="relative flex overflow-hidden border-y-2 py-6 md:py-8"
          style={{
            borderColor: "var(--border-color)",
            backgroundColor: "rgba(var(--accent-color-rgb), 0.03)",
          }}
        >
          <motion.div
            className="flex whitespace-nowrap items-center min-w-max"
            animate={{ x: ["0%", "-50%"] }}
            transition={{
              repeat: Infinity,
              ease: "linear",
              duration: 35, // Smooth horizontal scroll
            }}
          >
            {/* Render twice for seamless infinite loop */}
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex items-center">
                {TICKER_ITEMS.map((item, idx) => (
                  <React.Fragment key={`${i}-${idx}`}>
                    <Link
                      href={item.href}
                      className="px-6 md:px-10 group flex items-center gap-4 transition-transform hover:-translate-y-1 active:scale-95"
                    >
                      <span
                        className="text-lg md:text-xl"
                        style={{ color: "var(--accent-color)" }}
                      >
                        {item.icon}
                      </span>
                      <span
                        className="text-2xl md:text-4xl font-mono font-black uppercase tracking-[0.1em] transition-colors duration-300"
                        style={{
                          color: "var(--text-main)",
                          textShadow: isModern
                            ? "0 4px 24px rgba(var(--accent-color-rgb), 0.2)"
                            : "none",
                        }}
                      >
                        {item.text}
                      </span>
                    </Link>
                    <AnimatedDino />
                  </React.Fragment>
                ))}
              </div>
            ))}
          </motion.div>
        </div>

        <div className="text-center mt-2">
          <p
            className="text-[10px] md:text-xs font-mono uppercase tracking-[0.2em]"
            style={{ color: "var(--text-muted)" }}
          >
            © {new Date().getFullYear()} KIRUK · DATA-DRIVEN PORTFOLIO
          </p>
        </div>
      </div>
    </footer>
  );
}
