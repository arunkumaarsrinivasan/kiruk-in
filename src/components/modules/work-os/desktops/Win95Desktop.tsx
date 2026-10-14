"use client";

import { useEffect, useRef, useState } from "react";
import { isProjectNda } from "@/data/project-media";
import { WindowFrame } from "../WindowFrame";
import { buildWorkDir, linkGlyph } from "../work-fs";
import type { DirNode, DocNode, FsNode } from "../work-fs";
import { DocBody } from "../DocBody";
import { useFocusProject } from "../use-focus-project";
import type { DesktopEra, DesktopProps, Project } from "../types";

const OUTSET = "inset -1px -1px 0 #000, inset 1px 1px 0 #fff, inset -2px -2px 0 #808080, inset 2px 2px 0 #dfdfdf";
const INSET = "inset 1px 1px 0 #000, inset -1px -1px 0 #fff, inset 2px 2px 0 #808080, inset -2px -2px 0 #dfdfdf";

interface Win {
  key: string;
  kind: "explorer" | "doc";
  doc?: DocNode;
  title: string;
  x: number;
  y: number;
  z: number;
}

/** 1995 — Windows 95. Explorer (tree + contents) + Notepad viewer. */
export function Win95Desktop({ era, projects, focusId }: DesktopProps) {
  const t = era.tokens;
  const stageRef = useRef<HTMLDivElement>(null);
  const root = useRef<DirNode>(buildWorkDir(projects, era.id));
  const [wins, setWins] = useState<Win[]>([]);
  const [path, setPath] = useState<string[]>([]);
  const [startOpen, setStartOpen] = useState(false);
  const counter = useRef(0);
  const z = useRef(20);

  useEffect(() => {
    root.current = buildWorkDir(projects, era.id);
    setWins([{ key: "explorer", kind: "explorer", title: "Exploring — Work", x: 70, y: 24, z: 21 }]);
    setPath([]);
    counter.current = 0;
    z.current = 21;
  }, [projects]);

  const bump = () => (z.current += 1);
  const focus = (key: string) => { const nz = bump(); setWins((w) => w.map((x) => (x.key === key ? { ...x, z: nz } : x))); };
  const close = (key: string) => setWins((w) => w.filter((x) => x.key !== key));

  const openExplorer = (toPath: string[]) => {
    setPath(toPath);
    setWins((w) => {
      const has = w.find((x) => x.key === "explorer");
      const nz = bump();
      if (has) return w.map((x) => (x.key === "explorer" ? { ...x, z: nz } : x));
      return [...w, { key: "explorer", kind: "explorer", title: "Exploring — Work", x: 70, y: 24, z: nz }];
    });
  };

  const openDoc = (doc: DocNode) => {
    counter.current += 1;
    const n = counter.current;
    const nz = bump();
    setWins((w) => [...w, { key: `doc${n}`, kind: "doc", doc, title: doc.name, x: 120 + (n % 5) * 26, y: 60 + (n % 5) * 24, z: nz }]);
  };

  const onOpenNode = (n: FsNode) => {
    if (n.kind === "dir") openExplorer([n.name]);
    else if (n.kind === "doc") openDoc(n);
    else globalThis.open(n.href, "_blank", "noopener,noreferrer");
  };

  const launch = (id: string) => { openExplorer([id]); setStartOpen(false); };

  useFocusProject(focusId, (id) => openExplorer([id]));

  return (
    <div className="flex h-full flex-col" style={{ fontFamily: era.fontUi, color: "#000" }}>
      <div ref={stageRef} className="relative min-h-0 flex-1 overflow-hidden" style={{ background: t.wallpaper }} onClick={() => setStartOpen(false)}>
        {t.eraTint ? (
          <div className="pointer-events-none absolute inset-0" style={{ background: `radial-gradient(80% 70% at 12% 90%, ${t.eraTint}, transparent 55%)`, opacity: 0.2, mixBlendMode: "screen" }} />
        ) : null}

        {/* desktop icon: My Projects */}
        <div className="absolute left-0 top-0 z-[1] flex flex-col gap-1 p-3">
          <button type="button" onClick={(e) => { e.stopPropagation(); openExplorer([]); }} className="group flex w-[84px] flex-col items-center gap-1 p-1 text-center">
            <svg width="40" height="36" viewBox="0 0 40 36" aria-hidden>
              <rect x="6" y="4" width="28" height="20" rx="1" fill="#cfd8e6" stroke="#3a4a63" strokeWidth="1.5" />
              <rect x="9" y="7" width="22" height="14" fill="#1d6fb8" />
              <rect x="12" y="26" width="16" height="6" fill="#b8bcc4" stroke="#3a4a63" />
            </svg>
            <span className="px-1 text-[11px] font-medium text-white group-hover:bg-[#000080] group-focus-visible:bg-[#000080]" style={{ textShadow: "0 1px 2px rgba(0,0,0,0.7)" }}>My Projects</span>
          </button>
        </div>

        {/* windows */}
        {wins.map((w) => (
          <WindowFrame key={w.key} era={era} title={w.title} z={w.z} x={w.x} y={w.y} onClose={() => close(w.key)} onFocus={() => focus(w.key)} dragConstraints={stageRef}>
            {w.kind === "explorer" ? (
              <ExplorerView root={root.current} path={path} setPath={setPath} onOpen={onOpenNode} t={t} />
            ) : (
              <NotepadView doc={w.doc as DocNode} t={t} />
            )}
          </WindowFrame>
        ))}
      </div>

      {/* taskbar */}
      <div className="relative z-30 flex items-center gap-1.5 px-1 py-1" style={{ background: "#c0c0c0", boxShadow: "inset 0 1px 0 #fff, inset 0 2px 0 #dfdfdf" }}>
        <button type="button" onClick={(e) => { e.stopPropagation(); setStartOpen((v) => !v); }} className="flex items-center gap-1 px-2 py-0.5 text-[13px] font-bold" style={{ boxShadow: startOpen ? INSET : OUTSET, background: "#c0c0c0" }}>
          <span style={{ color: t.accent }}>⊞</span> Start
        </button>
        <div className="flex flex-1 gap-1 overflow-hidden">
          {wins.map((w) => (
            <button key={w.key} type="button" onClick={() => focus(w.key)} className="truncate px-2 py-0.5 text-left text-[12px]" style={{ maxWidth: 160, background: "#c0c0c0", boxShadow: INSET }}>
              {w.kind === "explorer" ? "🖿 " : "📄 "}{w.title}
            </button>
          ))}
        </div>
        <span className="px-2 py-0.5 text-[12px] tabular-nums" style={{ boxShadow: INSET }}>{era.year}</span>
      </div>

      {/* start menu */}
      {startOpen ? (
        <div className="absolute bottom-9 left-1 z-40 flex w-[300px]" style={{ background: "#c0c0c0", boxShadow: OUTSET }} onClick={(e) => e.stopPropagation()}>
          <div className="flex w-8 items-end justify-center pb-3" style={{ background: `linear-gradient(#000080, ${t.accent})`, color: "#fff" }}>
            <span className="rotate-180 text-[15px] font-bold tracking-widest [writing-mode:vertical-rl]">kiruk 95</span>
          </div>
          <div className="flex-1 py-1">
            <p className="px-3 pb-1 text-[11px] font-bold uppercase tracking-wide" style={{ color: "#404040" }}>Programs · Work</p>
            <div className="max-h-[260px] overflow-y-auto">
              {root.current.children.map((d) => (
                <button key={d.name} type="button" onClick={() => launch(d.name)} className="flex w-full items-center gap-2 px-3 py-1 text-left text-[13px] hover:bg-[#000080] hover:text-white">
                  <span>🖿</span>
                  <span className="flex-1 truncate">{(d as DirNode).label}</span>
                  {isProjectNda(((d as DirNode).project as Project).id) ? <span className="text-[10px] opacity-70">NDA</span> : null}
                </button>
              ))}
            </div>
            <div className="my-1 h-px" style={{ background: "#808080", boxShadow: "0 1px 0 #fff" }} />
            <button type="button" className="flex w-full items-center gap-2 px-3 py-1 text-left text-[13px] hover:bg-[#000080] hover:text-white"><span>⏻</span> Shut Down…</button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

/* ── Explorer (tree + contents) ─────────────────────────────────────────── */

function ExplorerView({ root, path, setPath, onOpen, t }: { root: DirNode; path: string[]; setPath: (p: string[]) => void; onOpen: (n: FsNode) => void; t: DesktopEra["tokens"] }) {
  const cur: DirNode = path.length ? ((root.children.find((c) => c.name === path[0]) as DirNode) ?? root) : root;
  const crumb = path.length ? `C:\\Work\\${cur.label}` : "C:\\Work";

  return (
    <div className="flex h-full flex-col bg-[#c0c0c0]" style={{ minHeight: 280 }}>
      {/* toolbar */}
      <div className="flex items-center gap-1 px-1 py-0.5" style={{ borderBottom: "1px solid #808080" }}>
        <button type="button" onClick={() => setPath([])} disabled={!path.length} className="px-2 py-0.5 text-[12px] disabled:opacity-40" style={{ boxShadow: OUTSET, background: "#c0c0c0" }}>↑ Up</button>
        <div className="ml-1 flex-1 truncate px-2 py-0.5 text-[12px]" style={{ background: "#fff", boxShadow: INSET }}>{crumb}</div>
      </div>

      <div className="flex min-h-0 flex-1">
        {/* tree pane */}
        <div className="w-[116px] shrink-0 overflow-y-auto p-1 text-[12px]" style={{ background: "#fff", boxShadow: INSET }}>
          <div className="flex items-center gap-1 font-bold"><span>🖥</span> Work</div>
          <div className="ml-2 border-l border-dotted border-[#808080] pl-2">
            {root.children.map((d) => {
              const on = path[0] === d.name;
              return (
                <button key={d.name} type="button" onClick={() => setPath([d.name])} className="flex w-full items-center gap-1 truncate py-0.5 text-left" style={{ background: on ? "#000080" : "transparent", color: on ? "#fff" : "#000" }}>
                  <span>🖿</span><span className="truncate">{(d as DirNode).label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* contents pane */}
        <div className="min-h-0 flex-1 overflow-y-auto p-1" style={{ background: "#fff", boxShadow: INSET }}>
          {cur.children.map((n) => (
            <button key={n.name} type="button" onClick={() => onOpen(n)} className="flex w-full items-center gap-2 px-1 py-0.5 text-left text-[12px] hover:bg-[#000080] hover:text-white">
              <span>{n.kind === "dir" ? "🖿" : n.kind === "link" ? linkGlyph(n.linkType) : "📄"}</span>
              <span className="flex-1 truncate">{n.kind === "dir" ? (n as DirNode).label : n.name}</span>
              <span className="text-[10px] opacity-50">{n.kind === "dir" ? "Folder" : n.kind === "link" ? "Shortcut" : "Document"}</span>
            </button>
          ))}
        </div>
      </div>

      {/* status bar */}
      <div className="px-2 py-0.5 text-[11px]" style={{ boxShadow: INSET, color: "#000" }}>{cur.children.length} object(s)</div>
    </div>
  );
}

/* ── Notepad doc viewer ─────────────────────────────────────────────────── */

function NotepadView({ doc, t }: { doc: DocNode; t: DesktopEra["tokens"] }) {
  return (
    <div className="flex flex-col bg-[#c0c0c0]" style={{ minHeight: 220 }}>
      <div className="flex gap-3 px-2 py-0.5 text-[12px]" style={{ borderBottom: "1px solid #808080" }}>
        {["File", "Edit", "Search", "Help"].map((m) => <span key={m}>{m}</span>)}
      </div>
      <div className="m-0.5 flex-1 overflow-auto p-2" style={{ background: "#fff", boxShadow: INSET }}>
        <DocBody lines={doc.lines} skin="classic" t={t} />
      </div>
    </div>
  );
}
