"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { useSearchParams } from "next/navigation";
import { createPortal } from "react-dom";
import { Log } from "./Log";
import { Prompt } from "./Prompt";
import { Session } from "./Session";
import { PROTO_POSTS } from "./data";
import "./proto.css";

const NAMES = ["Session", "Log", "Prompt"] as const;

const DEFAULTS = {
  glow: 8,
  scan: 18,
  vignette: 55,
  speed: "1",
};

export function Harness({ fonts }: { fonts: string }) {
  const search = useSearchParams();
  const highlightRef = useRef<HTMLSpanElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const stageRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLInputElement>(null);
  const scanRef = useRef<HTMLInputElement>(null);
  const vignetteRef = useRef<HTMLInputElement>(null);
  const speedRef = useRef<HTMLSelectElement>(null);
  const glowOut = useRef<HTMLSpanElement>(null);
  const scanOut = useRef<HTMLSpanElement>(null);
  const vignetteOut = useRef<HTMLSpanElement>(null);
  const [index, setIndex] = useState(() => {
    const raw = parseInt(search.get("v") || "2", 10);
    return Number.isFinite(raw) ? Math.min(NAMES.length, Math.max(1, raw)) - 1 : 0;
  });
  const [tick, setTick] = useState(0);
  const [ready, setReady] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  const moveHighlight = useCallback(() => {
    const hl = highlightRef.current;
    const el = itemRefs.current[index];
    if (!hl || !el) return;
    hl.style.width = `${el.offsetWidth}px`;
    hl.style.transform = `translateX(${el.offsetLeft}px)`;
  }, [index]);

  useLayoutEffect(() => {
    moveHighlight();
  }, [moveHighlight, tick]);

  useEffect(() => {
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setReady(true)));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    window.addEventListener("resize", moveHighlight);
    return () => window.removeEventListener("resize", moveHighlight);
  }, [moveHighlight]);

  const mount = useCallback((i: number) => {
    setIndex(i);
    setTick((n) => n + 1);
    const url = new URL(window.location.href);
    url.searchParams.set("v", String(i + 1));
    history.replaceState(null, "", url);
  }, []);

  const replay = useCallback(() => {
    setTick((n) => n + 1);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || t.isContentEditable) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const num = parseInt(e.key, 10);
      if (num >= 1 && num <= NAMES.length) mount(num - 1);
      else if (e.key === "ArrowRight") mount((index + 1) % NAMES.length);
      else if (e.key === "ArrowLeft") mount((index - 1 + NAMES.length) % NAMES.length);
      else if (e.key === "r" || e.key === "R") replay();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, mount, replay]);

  const applyVars = () => {
    const root = stageRef.current;
    if (!root) return;
    const glow = glowRef.current?.value ?? String(DEFAULTS.glow);
    const scan = scanRef.current?.value ?? String(DEFAULTS.scan);
    const vignette = vignetteRef.current?.value ?? String(DEFAULTS.vignette);
    const speed = speedRef.current?.value ?? DEFAULTS.speed;
    root.style.setProperty("--proto-glow", glow);
    root.style.setProperty("--proto-scan", scan);
    root.style.setProperty("--proto-vignette", vignette);
    root.style.setProperty("--proto-speed", speed);
    if (glowOut.current) glowOut.current.textContent = glow;
    if (scanOut.current) scanOut.current.textContent = scan;
    if (vignetteOut.current) vignetteOut.current.textContent = vignette;
  };

  const copyConfig = async () => {
    const glow = glowRef.current?.value ?? String(DEFAULTS.glow);
    const scan = scanRef.current?.value ?? String(DEFAULTS.scan);
    const vignette = vignetteRef.current?.value ?? String(DEFAULTS.vignette);
    const speed = speedRef.current?.value ?? DEFAULTS.speed;
    const text = `glow: ${glow} · scan: ${scan} · vignette: ${vignette} · speed: ${speed}x`;
    await navigator.clipboard.writeText(text);
  };

  const variant = (() => {
    if (index === 1) return <Log posts={PROTO_POSTS} />;
    if (index === 2) return <Prompt posts={PROTO_POSTS} />;
    return <Session posts={PROTO_POSTS} />;
  })();

  if (!mounted) return null;

  return createPortal(
    <>
      <div
        ref={stageRef}
        className={`proto-stage era-blog-surface ${fonts}`}
        data-era-surface="1970"
        data-era-cursor="block"
        style={
          {
            "--proto-glow": DEFAULTS.glow,
            "--proto-scan": DEFAULTS.scan,
            "--proto-vignette": DEFAULTS.vignette,
            "--proto-speed": DEFAULTS.speed,
          } as CSSProperties
        }
      >
        <div key={`${index}-${tick}`}>{variant}</div>
      </div>

      <nav
        className="proto-picker"
        data-position="top"
        data-ready={ready ? "" : undefined}
        aria-label="Prototype variants"
      >
        <span ref={highlightRef} className="proto-picker-highlight" aria-hidden="true" />
        {NAMES.map((name, i) => (
          <button
            key={name}
            type="button"
            ref={(el) => {
              itemRefs.current[i] = el;
            }}
            className="proto-picker-item"
            data-active={i === index ? true : undefined}
            aria-current={i === index ? "true" : undefined}
            onClick={() => mount(i)}
          >
            {name}
          </button>
        ))}
        <span className="proto-picker-divider" aria-hidden="true" />
        <button
          type="button"
          className="proto-picker-item proto-picker-replay"
          aria-label="Replay animation (R)"
          onClick={replay}
        >
          ↻
        </button>
      </nav>

      <aside className="proto-controls" aria-label="Prototype controls">
        <label>
          Glow <span ref={glowOut}>{DEFAULTS.glow}</span>
          <input
            ref={glowRef}
            type="range"
            min={0}
            max={40}
            defaultValue={DEFAULTS.glow}
            onInput={applyVars}
          />
        </label>
        <label>
          Scan <span ref={scanOut}>{DEFAULTS.scan}</span>
          <input
            ref={scanRef}
            type="range"
            min={0}
            max={40}
            defaultValue={DEFAULTS.scan}
            onInput={applyVars}
          />
        </label>
        <label>
          Vignette <span ref={vignetteOut}>{DEFAULTS.vignette}</span>
          <input
            ref={vignetteRef}
            type="range"
            min={0}
            max={80}
            defaultValue={DEFAULTS.vignette}
            onInput={applyVars}
          />
        </label>
        <label>
          Speed
          <select ref={speedRef} defaultValue={DEFAULTS.speed} onChange={applyVars}>
            <option value="1">1x</option>
            <option value="0.5">0.5x</option>
            <option value="0.25">0.25x</option>
          </select>
        </label>
        <button type="button" onClick={copyConfig}>
          Copy values
        </button>
      </aside>
    </>,
    document.body,
  );
}
