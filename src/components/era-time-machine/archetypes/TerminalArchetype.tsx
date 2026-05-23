"use client";

/**
 * TerminalArchetype — 1970 Terminal & ASCII
 *
 * Full-screen CRT. Phosphor green on black, scanlines, slight curvature,
 * screen-flicker, vignette. Era data renders as a man(1) page that types
 * itself out character-by-character. A bash prompt at the bottom accepts
 * commands: next, prev, jump <year>, list, exit.
 *
 * Lifecycle:
 *  - phase="entering" → CRT power-on (bright dot expands, scanlines warm)
 *  - phase="active"   → idle (cursor blinks, occasional flicker)
 *  - phase="exiting"  → CRT power-off (vertical collapse to white line)
 */

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { motion } from "framer-motion";
import type { EraSurfaceProps } from "../shared/EraSurface";
import { AVAILABLE_THEMES } from "@/data/portfolio-data";

const TYPE_SPEED_MS = 8;
const PROMPT_LABEL = "era@1970";

interface ManSection {
  heading: string;
  body: string[];
}

function buildManPage(era: EraSurfaceProps["era"]): ManSection[] {
  return [
    {
      heading: "NAME",
      body: [`${era.id}(1) — ${era.name.split(":")[1]?.trim() || era.name}`],
    },
    {
      heading: "ERA",
      body: [era.era],
    },
    {
      heading: "SYNOPSIS",
      body: [`era --select ${era.id} [--play]`],
    },
    {
      heading: "DESCRIPTION",
      body: wrap(era.description, 78),
    },
    {
      heading: "LESSON",
      body: wrap(`"${era.lesson}"`, 78),
    },
    {
      heading: "HERITAGE",
      body: wrap(era.heritage, 78),
    },
    {
      heading: "KEY ELEMENTS",
      body: era.keyElements.map((el) => `  * ${el}`),
    },
    {
      heading: "STYLE",
      body: [`  category   ${era.style}`],
    },
    {
      heading: "PALETTE",
      body: [
        `  primary    ${era.colors.primary}`,
        `  secondary  ${era.colors.secondary}`,
        `  accent     ${era.colors.accent}`,
        `  background ${era.colors.background}`,
        `  text       ${era.colors.text}`,
      ],
    },
    {
      heading: "TOKENS",
      body: [
        `  radius     ${era.designTokens.borderRadius}px`,
        `  shadow     ${era.designTokens.shadowStyle} @ ${era.designTokens.shadowIntensity}`,
        `  grid       ${era.designTokens.gridSize ?? "—"}px`,
        `  tracking   ${era.designTokens.letterSpacing}`,
        `  leading    ${era.designTokens.lineHeight}`,
        `  motion     ${era.designTokens.animationStyle}`,
      ],
    },
    {
      heading: "EFFECTS",
      body:
        era.designTokens.effects.length > 0
          ? era.designTokens.effects.map((e) => `  - ${e}`)
          : ["  (none)"],
    },
    {
      heading: "COMMANDS",
      body: [
        "  next                  step forward one era",
        "  prev                  step backward one era",
        "  jump <year>           jump directly to era id",
        "  list                  show every era",
        "  exit                  close time machine",
      ],
    },
  ];
}

function wrap(text: string, width: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    if ((cur + " " + w).trim().length > width) {
      lines.push(cur);
      cur = w;
    } else {
      cur = cur ? cur + " " + w : w;
    }
  }
  if (cur) lines.push(cur);
  return lines.length ? lines : [""];
}

const ASCII_BANNER = [
  "  __     _______  ______     ______ ",
  " /_ |   / ____ \\ |____  |   / __  / ",
  "  | |   | (__) |     / /   / / / /  ",
  "  | |   |  __  |    / /   / / / /   ",
  "  | |   | |  | |   / /   / /_/ /    ",
  "  |_|   |_|  |_|  /_/   /_____/     ",
];

export const TerminalArchetype: React.FC<EraSurfaceProps> = ({
  era,
  phase,
  reduceMotion,
  onPrev,
  onNext,
  onSelect,
  onClose,
}) => {
  const manPage = useMemo(() => buildManPage(era), [era]);
  const flat = useMemo(
    () =>
      manPage
        .flatMap((s) => [`\n${s.heading}`, ...s.body.map((l) => `  ${l}`)])
        .join("\n"),
    [manPage],
  );

  const [typed, setTyped] = useState("");
  const [doneTyping, setDoneTyping] = useState(false);
  const [history, setHistory] = useState<string[]>([
    `$ man ${era.id}`,
  ]);
  const [input, setInput] = useState("");
  const [bootDone, setBootDone] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // ── Boot
  useEffect(() => {
    if (reduceMotion) {
      setBootDone(true);
      return;
    }
    const t = setTimeout(() => setBootDone(true), 520);
    return () => clearTimeout(t);
  }, [reduceMotion]);

  // ── Type out content on enter / era change
  useEffect(() => {
    setTyped("");
    setDoneTyping(false);
    if (reduceMotion) {
      setTyped(flat);
      setDoneTyping(true);
      return;
    }
    let i = 0;
    let raf: number | null = null;
    const tick = () => {
      i += Math.max(1, Math.floor(flat.length / 400));
      if (i >= flat.length) {
        setTyped(flat);
        setDoneTyping(true);
        return;
      }
      setTyped(flat.slice(0, i));
      raf = window.setTimeout(tick, TYPE_SPEED_MS);
    };
    raf = window.setTimeout(tick, 280);
    return () => {
      if (raf !== null) clearTimeout(raf);
    };
  }, [flat, reduceMotion]);

  // ── Keep scroll pinned to bottom while typing
  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [typed, history.length]);

  // ── Focus input when active and boot is done
  useEffect(() => {
    if (phase === "active" && doneTyping) {
      inputRef.current?.focus();
    }
  }, [phase, doneTyping]);

  const runCommand = useCallback(
    (raw: string) => {
      const cmd = raw.trim().toLowerCase();
      const newHistory = [...history, `${PROMPT_LABEL}:~$ ${raw}`];
      if (!cmd) {
        setHistory(newHistory);
        return;
      }
      if (cmd === "next") {
        setHistory([...newHistory, "→ next era"]);
        onNext();
        return;
      }
      if (cmd === "prev") {
        setHistory([...newHistory, "← previous era"]);
        onPrev();
        return;
      }
      if (cmd === "list") {
        setHistory([
          ...newHistory,
          AVAILABLE_THEMES.map((t) => t.id).join("  "),
        ]);
        return;
      }
      if (cmd === "exit" || cmd === "quit" || cmd === "close") {
        setHistory([...newHistory, "→ closing"]);
        onClose();
        return;
      }
      if (cmd === "clear" || cmd === "cls") {
        setHistory([]);
        return;
      }
      if (cmd.startsWith("jump")) {
        const arg = cmd.split(/\s+/)[1];
        const target = AVAILABLE_THEMES.find((t) => t.id === arg);
        if (target) {
          setHistory([...newHistory, `→ jumping to ${arg}`]);
          onSelect(target.id);
        } else {
          setHistory([
            ...newHistory,
            `era: '${arg ?? ""}' not found. try 'list'.`,
          ]);
        }
        return;
      }
      setHistory([
        ...newHistory,
        `era: ${cmd}: command not found. try 'next', 'prev', 'list', 'jump <year>', 'exit'.`,
      ]);
    },
    [history, onNext, onPrev, onSelect, onClose],
  );

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      runCommand(input);
      setInput("");
    }
  };

  // ── Crisp green + scanline atmosphere
  const phosphor = era.colors.primary || "#00ff41";
  const accent = era.colors.accent || phosphor;
  const bg = era.colors.background || "#000";

  return (
    <div
      className="absolute inset-0"
      style={{
        backgroundColor: bg,
        color: phosphor,
        fontFamily: era.fonts.primary,
        // CRT vignette
        backgroundImage: `radial-gradient(ellipse 90% 80% at 50% 50%, transparent 55%, rgba(0,0,0,0.55) 100%)`,
      }}
    >
      {/* Subtle bulge — gives CRT shape without distorting interactions */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 65% 45% at 50% 38%, rgba(0,255,65,0.04) 0%, transparent 70%)",
        }}
      />

      {/* Scanlines */}
      <ScanlineLayer accent={phosphor} reduceMotion={reduceMotion} />

      {/* Power-on flash + power-off collapse */}
      <PowerLayer phase={phase} reduceMotion={reduceMotion} accent={phosphor} />

      {/* Random flicker */}
      {!reduceMotion && phase === "active" && (
        <motion.div
          aria-hidden
          className="absolute inset-0 pointer-events-none mix-blend-screen"
          style={{ backgroundColor: phosphor, opacity: 0.02 }}
          animate={{ opacity: [0.02, 0.06, 0.02, 0.03, 0.02] }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
            times: [0, 0.18, 0.22, 0.6, 1],
          }}
        />
      )}

      {/* Top status line — like a tmux/screen bar */}
      <div
        className="absolute top-0 inset-x-0 z-10 flex items-center justify-between px-4 py-1.5 text-[10px] tracking-[0.2em] uppercase border-b"
        style={{
          color: `${phosphor}aa`,
          borderColor: `${phosphor}22`,
          backgroundColor: `${bg}cc`,
        }}
      >
        <span>tty1 · era-machine</span>
        <span style={{ color: accent }}>{era.id}</span>
        <span>{new Date().toUTCString().slice(5, 22)} GMT</span>
      </div>

      {/* Content frame */}
      <div
        ref={scrollRef}
        className="absolute inset-x-0 z-10 overflow-y-auto scrollbar-hide"
        style={{
          top: 28,
          bottom: 96, // reserve room for prompt + nav rail
          textShadow: bootDone
            ? `0 0 6px ${phosphor}99, 0 0 18px ${phosphor}55`
            : "none",
          opacity: bootDone ? 1 : 0,
          transition: "opacity 220ms ease-out",
        }}
      >
        <div className="max-w-4xl mx-auto px-5 md:px-10 pt-4 pb-8 font-mono text-[13px] leading-[1.55]">
          {/* ASCII banner of the year */}
          <pre
            className="text-[11px] leading-tight mb-4"
            style={{ color: accent }}
          >
            {ASCII_BANNER.map((line, i) => (
              <div key={i}>{line.replace(/1970/g, era.id)}</div>
            ))}
          </pre>

          {/* Man page (typewriter) */}
          <pre
            className="whitespace-pre-wrap break-words"
            style={{ color: phosphor }}
          >
            {typed}
            {!doneTyping && bootDone && <BlinkBlock color={phosphor} />}
          </pre>

          {/* Command history — shown after type-out completes */}
          {doneTyping && history.length > 0 && (
            <div className="mt-6 space-y-0.5">
              {history.map((line, i) => (
                <div key={i} className="whitespace-pre-wrap">
                  {line}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bash prompt */}
      <div
        className="absolute inset-x-0 z-20 flex items-center gap-2 px-5 md:px-10 py-3 font-mono text-[13px] border-t backdrop-blur-sm"
        style={{
          bottom: 56, // sits above era browser footer
          color: phosphor,
          borderColor: `${phosphor}22`,
          backgroundColor: `${bg}ee`,
          textShadow: `0 0 6px ${phosphor}80`,
        }}
      >
        <span style={{ color: accent }}>
          {PROMPT_LABEL}:<span style={{ color: phosphor }}>~</span>$
        </span>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          disabled={!doneTyping}
          aria-label="Terminal command input"
          placeholder={doneTyping ? "type 'next', 'list', 'jump 2003'…" : ""}
          className="flex-1 bg-transparent outline-none placeholder-current/30"
          style={{
            color: phosphor,
            caretColor: phosphor,
          }}
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
        />
        <BlinkBlock color={phosphor} />
      </div>
    </div>
  );
};

// ─── Subcomponents ────────────────────────────────────────────────────────

function BlinkBlock({ color }: { color: string }) {
  return (
    <motion.span
      aria-hidden
      className="inline-block w-2 h-4 align-middle ml-1"
      style={{ backgroundColor: color }}
      animate={{ opacity: [1, 1, 0, 0] }}
      transition={{
        duration: 0.9,
        repeat: Infinity,
        ease: "linear",
        times: [0, 0.5, 0.5, 1],
      }}
    />
  );
}

function ScanlineLayer({
  accent: _accent,
  reduceMotion,
}: {
  accent: string;
  reduceMotion: boolean;
}) {
  return (
    <>
      {/* Fine scanlines */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent 0px, transparent 2px, rgba(0,0,0,0.18) 2px, rgba(0,0,0,0.18) 3px)",
          mixBlendMode: "multiply",
        }}
      />
      {/* Travelling beam */}
      {!reduceMotion && (
        <motion.div
          aria-hidden
          className="absolute inset-x-0 pointer-events-none"
          style={{
            height: 120,
            background:
              "linear-gradient(180deg, transparent 0%, rgba(0,255,65,0.04) 40%, rgba(0,255,65,0.07) 50%, rgba(0,255,65,0.04) 60%, transparent 100%)",
          }}
          initial={{ y: "-100%" }}
          animate={{ y: "100vh" }}
          transition={{
            duration: 7.5,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      )}
    </>
  );
}

function PowerLayer({
  phase,
  reduceMotion,
  accent,
}: {
  phase: EraSurfaceProps["phase"];
  reduceMotion: boolean;
  accent: string;
}) {
  if (reduceMotion) return null;
  const isExit = phase === "exiting";
  const isEnter = phase === "entering";
  if (!isExit && !isEnter) return null;
  return (
    <div aria-hidden className="absolute inset-0 pointer-events-none z-30">
      {/* Vertical collapse white line for power-off */}
      {isExit && (
        <motion.div
          className="absolute inset-x-0 top-1/2 -translate-y-1/2"
          initial={{ height: "100%", backgroundColor: "rgba(0,0,0,1)" }}
          animate={{ height: "1.5px", backgroundColor: "#fff" }}
          transition={{ duration: 0.36, ease: [0.7, 0, 0.3, 1] }}
          style={{ boxShadow: "0 0 24px rgba(255,255,255,0.85)" }}
        />
      )}
      {/* Bright dot expanding for power-on */}
      {isEnter && (
        <>
          <motion.div
            className="absolute inset-0"
            initial={{ backgroundColor: "#000" }}
            animate={{ backgroundColor: "rgba(0,0,0,0)" }}
            transition={{ duration: 0.42, ease: "easeOut" }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
            initial={{ width: 0, height: 0, opacity: 0.9 }}
            animate={{ width: 2400, height: 2400, opacity: 0 }}
            transition={{ duration: 0.42, ease: "easeOut" }}
            style={{
              backgroundColor: accent,
              boxShadow: `0 0 80px ${accent}, 0 0 160px ${accent}`,
            }}
          />
        </>
      )}
    </div>
  );
}

export default TerminalArchetype;
