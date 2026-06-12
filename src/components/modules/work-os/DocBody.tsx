"use client";

import type { DesktopEra } from "./types";

export type DocSkin = "crt" | "classic" | "glossy" | "clean" | "glass";

interface Block {
  type: "title" | "heading" | "bullet" | "field" | "para" | "note" | "blank";
  text: string;
  key?: string;
  value?: string;
}

/** Parse the flat doc lines into structured blocks. */
function parse(lines: string[]): Block[] {
  const out: Block[] = [];
  lines.forEach((raw, i) => {
    const line = raw.replace(/\s+$/, "");
    const trimmed = line.trim();
    if (!trimmed) { out.push({ type: "blank", text: "" }); return; }
    if (i === 0) { out.push({ type: "title", text: trimmed }); return; }
    if (/^\[.*\]$/.test(trimmed)) { out.push({ type: "note", text: trimmed.replace(/^\[\s?|\s?\]$/g, "") }); return; }
    if (/^[-•]\s+/.test(trimmed)) { out.push({ type: "bullet", text: trimmed.replace(/^[-•]\s+/, "") }); return; }
    if (/:$/.test(trimmed)) { out.push({ type: "heading", text: trimmed.replace(/:$/, "") }); return; }
    const field = trimmed.match(/^([A-Za-z][\w ]*?):\s+(.+)$/);
    if (field) { out.push({ type: "field", text: trimmed, key: field[1], value: field[2] }); return; }
    out.push({ type: "para", text: trimmed });
  });
  return out;
}

interface DocBodyProps {
  readonly lines: string[];
  readonly skin: DocSkin;
  readonly t: DesktopEra["tokens"];
}

/** Renders a case-study doc with an era-specific visual skin. */
export function DocBody({ lines, skin, t }: DocBodyProps) {
  const blocks = parse(lines);
  if (skin === "crt") return <CrtSkin blocks={blocks} t={t} />;
  if (skin === "glossy") return <GlossySkin blocks={blocks} t={t} />;
  if (skin === "clean") return <CleanSkin blocks={blocks} t={t} />;
  if (skin === "glass") return <GlassSkin blocks={blocks} t={t} />;
  return <ClassicSkin blocks={blocks} t={t} />;
}

/* ── CRT (1970 terminal) — phosphor mono ────────────────────────────────── */
function CrtSkin({ blocks, t }: { blocks: Block[]; t: DesktopEra["tokens"] }) {
  return (
    <div className="text-[13px] leading-[1.7]" style={{ color: t.text, fontFamily: "var(--font-mono, monospace)" }}>
      {blocks.map((b, i) => {
        if (b.type === "blank") return <div key={i} className="h-2" />;
        if (b.type === "title") return <p key={i} className="font-bold" style={{ color: t.accent }}># {b.text}</p>;
        if (b.type === "heading") return <p key={i} className="mt-2 font-bold" style={{ color: t.accent }}>## {b.text}</p>;
        if (b.type === "bullet") return <p key={i}><span style={{ color: t.accent }}>-</span> {b.text}</p>;
        if (b.type === "note") return <p key={i} style={{ color: t.textMuted }}>{"// "}{b.text}</p>;
        if (b.type === "field") return <p key={i}><span style={{ color: t.textMuted }}>{b.key}:</span> {b.value}</p>;
        return <p key={i}>{b.text}</p>;
      })}
    </div>
  );
}

/* ── Classic (80s-00s system) — paper + system font ─────────────────────── */
function ClassicSkin({ blocks, t }: { blocks: Block[]; t: DesktopEra["tokens"] }) {
  return (
    <div className="text-[12px] leading-[1.55]" style={{ color: "#000" }}>
      {blocks.map((b, i) => {
        if (b.type === "blank") return <div key={i} className="h-1.5" />;
        if (b.type === "title") return <p key={i} className="mb-1 border-b-2 border-black pb-1 text-[15px] font-bold">{b.text}</p>;
        if (b.type === "heading") return <p key={i} className="mt-2 border-b border-[#808080] pb-0.5 text-[12px] font-bold uppercase tracking-wide">{b.text}</p>;
        if (b.type === "bullet") return <p key={i} className="flex gap-1.5"><span>▪</span><span>{b.text}</span></p>;
        if (b.type === "note") return <p key={i} className="my-1 inline-block border border-black px-1.5 py-0.5 text-[11px] font-bold">{b.text}</p>;
        if (b.type === "field") return <p key={i} className="flex gap-2"><span className="w-20 font-bold">{b.key}</span><span>{b.value}</span></p>;
        return <p key={i} className="my-1">{b.text}</p>;
      })}
    </div>
  );
}

/* ── Glossy (Web 2.0 / Aqua / Aero) — gel headings, rounded ─────────────── */
function GlossySkin({ blocks, t }: { blocks: Block[]; t: DesktopEra["tokens"] }) {
  return (
    <div className="text-[12px] leading-[1.6]" style={{ color: "#1a1a1a" }}>
      {blocks.map((b, i) => {
        if (b.type === "blank") return <div key={i} className="h-1.5" />;
        if (b.type === "title") return (
          <p key={i} className="mb-2 inline-block rounded-full px-3 py-1 text-[14px] font-bold text-white" style={{ background: `linear-gradient(180deg, color-mix(in srgb, ${t.accent} 70%, #fff), ${t.accent})`, boxShadow: "inset 0 1px 0 rgba(255,255,255,0.6), 0 2px 4px rgba(0,0,0,0.25)" }}>{b.text}</p>
        );
        if (b.type === "heading") return <p key={i} className="mt-2.5 flex items-center gap-1.5 text-[12px] font-bold" style={{ color: t.accent }}><span className="inline-block h-2 w-2 rounded-full" style={{ background: t.accent }} />{b.text}</p>;
        if (b.type === "bullet") return <p key={i} className="ml-1 flex gap-2"><span style={{ color: t.accent }}>›</span><span>{b.text}</span></p>;
        if (b.type === "note") return <p key={i} className="my-1 inline-block rounded-md px-2 py-0.5 text-[11px] font-semibold" style={{ background: `color-mix(in srgb, ${t.accent} 14%, transparent)`, color: t.accent }}>{b.text}</p>;
        if (b.type === "field") return <p key={i} className="flex gap-2"><span className="w-20 font-semibold" style={{ color: t.accent }}>{b.key}</span><span>{b.value}</span></p>;
        return <p key={i} className="my-1">{b.text}</p>;
      })}
    </div>
  );
}

/* ── Clean (flat / modern) — airy sans, uppercase headings ──────────────── */
function CleanSkin({ blocks, t }: { blocks: Block[]; t: DesktopEra["tokens"] }) {
  return (
    <div className="text-[12.5px] leading-[1.65]" style={{ color: t.text }}>
      {blocks.map((b, i) => {
        if (b.type === "blank") return <div key={i} className="h-2" />;
        if (b.type === "title") return <p key={i} className="text-[18px] font-semibold tracking-tight">{b.text}</p>;
        if (b.type === "heading") return <p key={i} className="mt-3 text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: t.accent }}>{b.text}</p>;
        if (b.type === "bullet") return <p key={i} className="flex gap-2"><span style={{ color: t.accent }}>—</span><span style={{ color: t.textMuted }}>{b.text}</span></p>;
        if (b.type === "note") return <p key={i} className="my-1.5 rounded-md px-2.5 py-1 text-[11px]" style={{ background: `color-mix(in srgb, ${t.accent} 10%, transparent)`, color: t.accent }}>{b.text}</p>;
        if (b.type === "field") return <p key={i} className="flex gap-2"><span className="w-20 text-[11px] uppercase tracking-wide" style={{ color: t.textMuted }}>{b.key}</span><span>{b.value}</span></p>;
        return <p key={i} className="my-1" style={{ color: t.textMuted }}>{b.text}</p>;
      })}
    </div>
  );
}

/* ── Glass (visionOS) — translucent, glowing accents ────────────────────── */
function GlassSkin({ blocks, t }: { blocks: Block[]; t: DesktopEra["tokens"] }) {
  return (
    <div className="text-[12.5px] leading-[1.7]" style={{ color: t.text }}>
      {blocks.map((b, i) => {
        if (b.type === "blank") return <div key={i} className="h-2" />;
        if (b.type === "title") return <p key={i} className="text-[18px] font-semibold" style={{ color: t.text, textShadow: `0 0 18px ${t.accent}55` }}>{b.text}</p>;
        if (b.type === "heading") return <p key={i} className="mt-3 text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: t.accent }}>{b.text}</p>;
        if (b.type === "bullet") return <p key={i} className="flex gap-2"><span style={{ color: t.accent }}>›</span><span>{b.text}</span></p>;
        if (b.type === "note") return <p key={i} className="my-1.5 inline-block rounded-full px-3 py-1 text-[11px]" style={{ background: "rgba(255,255,255,0.1)", color: t.accent }}>{b.text}</p>;
        if (b.type === "field") return <p key={i} className="flex gap-2"><span className="w-20 text-[11px] uppercase tracking-wide" style={{ color: t.textMuted }}>{b.key}</span><span>{b.value}</span></p>;
        return <p key={i} className="my-1" style={{ color: t.textMuted }}>{b.text}</p>;
      })}
    </div>
  );
}
