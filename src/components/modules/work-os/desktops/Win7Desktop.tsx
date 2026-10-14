"use client";

import { motion, useDragControls } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { PointerEvent, ReactNode } from "react";
import { isProjectNda } from "@/data/project-media";
import { buildWorkDir, linkGlyph } from "../work-fs";
import type { DirNode, DocNode, FsNode } from "../work-fs";
import { fitWindow, label, monogram } from "../helpers";
import { DocBody } from "../DocBody";
import { useFocusProject } from "../use-focus-project";
import type { DesktopEra, DesktopProps, Project } from "../types";

interface Win {
  key: string;
  kind: "explorer" | "doc";
  doc?: DocNode;
  title: string;
  x: number;
  y: number;
  z: number;
}

/** 2009 — Windows 7. Aero glass Explorer + libraries + translucent superbar. */
export function Win7Desktop({ era, projects, focusId }: DesktopProps) {
  const t = era.tokens;
  const stageRef = useRef<HTMLDivElement>(null);
  const root = useRef<DirNode>(buildWorkDir(projects, era.id));
  const [wins, setWins] = useState<Win[]>([]);
  const [path, setPath] = useState<string[]>([]);
  const [startOpen, setStartOpen] = useState(false);
  const [peek, setPeek] = useState<string | null>(null);
  const counter = useRef(0);
  const z = useRef(20);

  useEffect(() => {
    root.current = buildWorkDir(projects, era.id);
    setWins([{ key: "explorer", kind: "explorer", title: "Work", x: 70, y: 22, z: 21 }]);
    setPath([]);
    counter.current = 0;
    z.current = 21;
  }, [projects]);

  const bump = () => (z.current += 1);
  const focus = (key: string) => { const nz = bump(); setWins((w) => w.map((x) => (x.key === key ? { ...x, z: nz } : x))); };
  const close = (key: string) => setWins((w) => w.filter((x) => x.key !== key));

  const openExplorer = (to: string[]) => {
    setPath(to);
    const title = to.length ? (root.current.children.find((c) => c.name === to[0]) as DirNode)?.label ?? "Work" : "Work";
    setWins((w) => { const nz = bump(); return w.find((x) => x.key === "explorer") ? w.map((x) => (x.key === "explorer" ? { ...x, z: nz, title } : x)) : [...w, { key: "explorer", kind: "explorer", title, x: 70, y: 22, z: nz }]; });
  };
  const openDoc = (doc: DocNode) => { counter.current += 1; const n = counter.current; const nz = bump(); setWins((w) => [...w, { key: `doc${n}`, kind: "doc", doc, title: doc.name, x: 130 + (n % 5) * 26, y: 64 + (n % 5) * 24, z: nz }]); };
  const onOpen = (n: FsNode) => { if (n.kind === "dir") openExplorer([n.name]); else if (n.kind === "doc") openDoc(n); else globalThis.open(n.href, "_blank", "noopener,noreferrer"); };

  useFocusProject(focusId, (id) => openExplorer([id]));

  return (
    <div className="flex h-full flex-col" style={{ fontFamily: era.fontUi, color: t.text }}>
      <div ref={stageRef} className="relative min-h-0 flex-1 overflow-hidden" style={{ background: t.wallpaper }} onClick={() => setStartOpen(false)}>
        {wins.map((w) => (
          <Win7Window key={w.key} win={w} stageRef={stageRef} t={t} onClose={() => close(w.key)} onFocus={() => focus(w.key)}>
            {w.kind === "explorer" ? <ExplorerWin7 root={root.current} path={path} setPath={setPath} onOpen={onOpen} accent={t.accent} /> : <WordPadView doc={w.doc as DocNode} t={t} />}
          </Win7Window>
        ))}
      </div>

      {/* superbar */}
      <div className="relative z-20 flex items-center gap-1.5 px-2" style={{ height: 44, background: "linear-gradient(180deg, rgba(30,50,80,0.85), rgba(10,25,50,0.92))", backdropFilter: "blur(10px)", borderTop: "1px solid rgba(255,255,255,0.25)" }}>
        {/* pearl start */}
        <button type="button" onClick={(e) => { e.stopPropagation(); setStartOpen((v) => !v); }} className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-[16px] text-white" style={{ background: "radial-gradient(circle at 50% 30%, #6db8ff, #1a6fd4 55%, #0a3f86)", boxShadow: "inset 0 1px 2px rgba(255,255,255,0.7), 0 0 10px rgba(40,140,255,0.7)" }} aria-label="Start">⊞</button>

        {/* pinned + running */}
        <div className="flex flex-1 items-center gap-1.5">
          {root.current.children.slice(0, 9).map((d) => {
            const open = wins.some((w) => w.kind === "explorer" && path[0] === d.name);
            return (
              <div key={d.name} className="relative" onMouseEnter={() => setPeek(d.name)} onMouseLeave={() => setPeek((p) => (p === d.name ? null : p))}>
                <button type="button" onClick={() => openExplorer([d.name])} title={(d as DirNode).label}
                  className="grid h-9 w-9 place-items-center rounded text-[13px] font-bold text-white transition-transform hover:scale-105"
                  style={{ background: open ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.25)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.3)" }}>
                  {monogram((d as DirNode).project as Project)}
                </button>
                {/* Aero Peek */}
                {peek === d.name ? (
                  <div className="absolute bottom-11 left-1/2 z-30 w-40 -translate-x-1/2 rounded p-2 text-[11px] text-white" style={{ background: "rgba(20,35,60,0.95)", border: "1px solid rgba(255,255,255,0.25)", boxShadow: "0 8px 24px rgba(0,0,0,0.5)" }}>
                    <p className="truncate font-semibold">{(d as DirNode).label}</p>
                    <p className="opacity-70">{(d as DirNode).project?.category} · click to open</p>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
        <span className="grid place-items-center rounded px-2 text-[11px] text-white tabular-nums" style={{ background: "rgba(255,255,255,0.1)" }}>{era.year}</span>
      </div>

      {startOpen ? (
        <div className="absolute bottom-11 left-1 z-30 w-[320px] overflow-hidden rounded-t-lg" style={{ background: "rgba(20,40,70,0.95)", backdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.25)" }} onClick={(e) => e.stopPropagation()}>
          <div className="flex">
            <div className="flex-1 bg-white/95 py-1">
              <p className="px-3 py-0.5 text-[10px] font-bold uppercase text-[#1a6fd4]">Projects</p>
              <div className="max-h-[230px] overflow-y-auto">
                {root.current.children.map((d) => (
                  <button key={d.name} type="button" onClick={() => { openExplorer([d.name]); setStartOpen(false); }} className="flex w-full items-center gap-2 px-3 py-1 text-left text-[13px] text-black hover:bg-[#cfe3fb]">
                    <span className="grid h-5 w-5 place-items-center rounded text-[10px] font-bold text-white" style={{ background: t.accent }}>{monogram((d as DirNode).project as Project)}</span>
                    <span className="flex-1 truncate">{(d as DirNode).label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="w-[110px] py-2 text-[12px] text-white">
              <p className="px-2 font-bold">Arun</p>
              {["Documents", "Work", "Pictures", "Computer"].map((m) => <div key={m} className="px-2 py-1 hover:bg-white/15">{m}</div>)}
            </div>
          </div>
          <div className="bg-white/95 px-2 py-1"><div className="rounded border border-[#9bb7d4] px-2 py-1 text-[12px] text-[#5a6470]">🔍 Search programs and files</div></div>
        </div>
      ) : null}
    </div>
  );
}

/* ── Aero glass window ──────────────────────────────────────────────────── */

function Win7Window({ win, stageRef, t, onClose, onFocus, children }: { win: Win; stageRef: React.RefObject<HTMLDivElement | null>; t: DesktopEra["tokens"]; onClose: () => void; onFocus: () => void; children: ReactNode }) {
  const controls = useDragControls();
  return (
    <motion.div
      drag dragListener={false} dragControls={controls} dragMomentum={false} dragConstraints={stageRef}
      onPointerDown={onFocus}
      className="absolute flex max-h-[90%] flex-col overflow-hidden"
      style={{ ...fitWindow(win.x, "clamp(460px, 40vw, 640px)"), top: win.y, zIndex: win.z, borderRadius: 8, border: "1px solid rgba(255,255,255,0.5)", boxShadow: "0 20px 50px rgba(0,0,0,0.5)" }}
    >
      <div onPointerDown={(e: PointerEvent) => controls.start(e)} className="flex cursor-grab items-center gap-2 px-3 py-1.5 active:cursor-grabbing" style={{ background: t.titleBar, backdropFilter: "blur(18px)", borderBottom: "1px solid rgba(255,255,255,0.4)" }}>
        <span className="flex-1 truncate text-[12px] font-semibold" style={{ color: t.titleText }}>{win.title}</span>
        <span className="grid h-4 w-6 place-items-center rounded-sm text-[10px]" style={{ background: "rgba(255,255,255,0.4)" }}>–</span>
        <span className="grid h-4 w-6 place-items-center rounded-sm text-[10px]" style={{ background: "rgba(255,255,255,0.4)" }}>▢</span>
        <button type="button" aria-label="Close" onClick={onClose} className="grid h-4 w-7 place-items-center rounded-sm text-[11px] font-bold text-white" style={{ background: "#e04545" }}>×</button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto" style={{ background: t.surfaceAlt }}>{children}</div>
    </motion.div>
  );
}

/* ── Explorer (nav pane + content) ──────────────────────────────────────── */

function ExplorerWin7({ root, path, setPath, onOpen, accent }: { root: DirNode; path: string[]; setPath: (p: string[]) => void; onOpen: (n: FsNode) => void; accent: string }) {
  const cur: DirNode = path.length ? ((root.children.find((c) => c.name === path[0]) as DirNode) ?? root) : root;
  const inProject = path.length > 0;

  return (
    <div className="flex flex-col bg-white" style={{ minHeight: 300 }}>
      {/* toolbar + breadcrumb */}
      <div className="flex items-center gap-1 px-2 py-1 text-[12px]" style={{ background: "linear-gradient(#f3f7fc,#e4edf7)", borderBottom: "1px solid #cdd9e6" }}>
        <button type="button" onClick={() => setPath([])} disabled={!inProject} className="grid h-5 w-5 place-items-center rounded-full text-white disabled:opacity-40" style={{ background: "#3a7fd0" }}>←</button>
        <div className="ml-1 flex flex-1 items-center gap-1 truncate rounded border border-[#9bb7d4] bg-white px-2 py-0.5">
          <button type="button" onClick={() => setPath([])} className="hover:underline">📚 Libraries</button>
          <span className="opacity-50">▸</span><button type="button" onClick={() => setPath([])} className="hover:underline">Work</button>
          {inProject ? <><span className="opacity-50">▸</span><span className="font-semibold">{cur.label}</span></> : null}
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        {/* nav pane */}
        <div className="w-[128px] shrink-0 overflow-y-auto p-2 text-[12px]" style={{ background: "linear-gradient(#eef3fa,#e2ebf6)", borderRight: "1px solid #cdd9e6" }}>
          <p className="font-bold text-[#5a6470]">★ Favorites</p>
          <p className="pl-2 text-[#3a4a5a]">Desktop</p>
          <p className="mt-1 font-bold text-[#5a6470]">📚 Libraries</p>
          <button type="button" onClick={() => setPath([])} className="block w-full pl-2 text-left font-semibold hover:underline" style={{ color: inProject ? "#1a1a1a" : accent }}>Work</button>
          {root.children.slice(0, 6).map((d) => (
            <button key={d.name} type="button" onClick={() => setPath([d.name])} className="block w-full truncate pl-4 text-left hover:underline" style={{ color: path[0] === d.name ? accent : "#3a4a5a" }}>{(d as DirNode).label}</button>
          ))}
        </div>

        {/* content */}
        <div className="min-h-0 flex-1 overflow-y-auto p-2">
          <div className="grid grid-cols-3 gap-2">
            {cur.children.map((n) => (
              <button key={n.name} type="button" onClick={() => onOpen(n)} className="group flex flex-col items-center gap-1 rounded p-1.5 text-center hover:bg-[#e3eefb]">
                <Win7Tile node={n} accent={accent} />
                <span className="line-clamp-2 text-[11px] leading-tight">{n.kind === "dir" ? (n as DirNode).label : n.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="px-2 py-0.5 text-[11px]" style={{ background: "#e4edf7", borderTop: "1px solid #cdd9e6" }}>{cur.children.length} items</div>
    </div>
  );
}

function Win7Tile({ node, accent }: { node: FsNode; accent: string }) {
  if (node.kind === "dir") {
    const nda = isProjectNda((node.project as Project).id);
    return (
      <span className="relative">
        <svg width="46" height="38" viewBox="0 0 46 38" aria-hidden>
          <path d="M4 9h13l4 4h21v20H4z" fill="#f5d06b" stroke="#ca9a2a" strokeWidth="1.1" />
          <path d="M4 9h13l4 4H4z" fill="#ffe9a6" />
        </svg>
        {nda ? <span className="absolute right-0 top-0 bg-[#1a6fd4] px-0.5 text-[7px] font-bold text-white">NDA</span> : null}
      </span>
    );
  }
  if (node.kind === "link") return <span className="grid h-9 w-9 place-items-center rounded bg-white text-[17px]" style={{ border: `2px solid ${accent}` }}>{linkGlyph(node.linkType)}</span>;
  return (
    <svg width="32" height="38" viewBox="0 0 32 38" aria-hidden>
      <path d="M5 2h15l8 8v26H5z" fill="#fff" stroke="#9bb7d4" strokeWidth="1.3" />
      <path d="M20 2v8h8" fill="none" stroke="#9bb7d4" strokeWidth="1.3" />
      <path d="M9 16h14M9 21h14M9 26h9" stroke="#3a7fd0" strokeWidth="1.2" />
    </svg>
  );
}

function WordPadView({ doc, t }: { doc: DocNode; t: DesktopEra["tokens"] }) {
  return (
    <div className="flex flex-col bg-white" style={{ minHeight: 200 }}>
      <div className="flex gap-3 px-3 py-1 text-[12px]" style={{ background: "linear-gradient(#f3f7fc,#e4edf7)", borderBottom: "1px solid #cdd9e6", color: t.accent }}>
        {["File", "Home", "View"].map((m) => <span key={m}>{m}</span>)}
      </div>
      <div className="flex-1 overflow-auto p-4">
        <DocBody lines={doc.lines} skin="glossy" t={t} />
      </div>
    </div>
  );
}
