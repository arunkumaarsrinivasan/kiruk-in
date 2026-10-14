"use client";

import { motion, useDragControls } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { PointerEvent, ReactNode } from "react";
import { isProjectNda } from "@/data/project-media";
import { buildWorkDir, linkGlyph } from "../work-fs";
import type { DirNode, DocNode, FsNode } from "../work-fs";
import { fitWindow, monogram } from "../helpers";
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

/** 2021 — Windows 11. Centered taskbar/Start, Mica acrylic File Explorer. */
export function Win11Desktop({ era, projects, focusId }: DesktopProps) {
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
    setWins([{ key: "explorer", kind: "explorer", title: "Work", x: 80, y: 24, z: 21 }]);
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
    setWins((w) => { const nz = bump(); return w.find((x) => x.key === "explorer") ? w.map((x) => (x.key === "explorer" ? { ...x, z: nz, title } : x)) : [...w, { key: "explorer", kind: "explorer", title, x: 80, y: 24, z: nz }]; });
  };
  const openDoc = (doc: DocNode) => { counter.current += 1; const n = counter.current; const nz = bump(); setWins((w) => [...w, { key: `doc${n}`, kind: "doc", doc, title: doc.name, x: 140 + (n % 5) * 26, y: 70 + (n % 5) * 24, z: nz }]); };
  const onOpen = (n: FsNode) => { if (n.kind === "dir") openExplorer([n.name]); else if (n.kind === "doc") openDoc(n); else globalThis.open(n.href, "_blank", "noopener,noreferrer"); };

  useFocusProject(focusId, (id) => openExplorer([id]));

  return (
    <div className="flex h-full flex-col" style={{ fontFamily: era.fontUi, color: t.text }}>
      <div ref={stageRef} className="relative min-h-0 flex-1 overflow-hidden" style={{ background: t.wallpaper }} onClick={() => setStartOpen(false)}>
        {wins.map((w) => (
          <Win11Window key={w.key} win={w} stageRef={stageRef} t={t} onClose={() => close(w.key)} onFocus={() => focus(w.key)}>
            {w.kind === "explorer" ? <ExplorerWin11 root={root.current} path={path} setPath={setPath} onOpen={onOpen} accent={t.accent} /> : <NotepadWin11 doc={w.doc as DocNode} t={t} />}
          </Win11Window>
        ))}

        {/* Start (centered) */}
        {startOpen ? (
          <div className="absolute bottom-14 left-1/2 z-40 w-[360px] -translate-x-1/2 rounded-2xl p-4" style={{ background: "rgba(243,245,250,0.92)", backdropFilter: "blur(28px)", border: "1px solid rgba(255,255,255,0.6)", boxShadow: "0 24px 60px rgba(0,0,0,0.45)" }} onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 rounded-full border border-[#cdd9e6] bg-white px-3 py-1.5 text-[13px] text-[#5a6470]">🔍 Search for apps, files…</div>
            <p className="mb-2 text-[12px] font-semibold" style={{ color: t.text }}>Pinned</p>
            <div className="grid grid-cols-4 gap-2">
              {root.current.children.map((d) => (
                <button key={d.name} type="button" onClick={() => { openExplorer([d.name]); setStartOpen(false); }} className="flex flex-col items-center gap-1 rounded-lg p-1.5 hover:bg-black/5">
                  <span className="grid h-10 w-10 place-items-center rounded-xl text-[15px] font-bold text-white" style={{ background: `linear-gradient(145deg, ${t.accent}, color-mix(in srgb, ${t.accent} 60%, #000))` }}>{monogram((d as DirNode).project as Project)}</span>
                  <span className="w-full truncate text-center text-[10px]" style={{ color: t.text }}>{(d as DirNode).label}</span>
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {/* centered taskbar */}
      <div className="relative z-30 flex items-center justify-center gap-2 py-1.5" style={{ background: "rgba(243,245,250,0.72)", backdropFilter: "blur(22px)", borderTop: "1px solid rgba(255,255,255,0.5)" }}>
        <button type="button" onClick={(e) => { e.stopPropagation(); setStartOpen((v) => !v); }} aria-label="Start" className="grid h-9 w-9 place-items-center rounded-md hover:bg-black/5">
          <span className="grid h-5 w-5 grid-cols-2 gap-[2px]">{[0, 1, 2, 3].map((i) => <span key={i} className="rounded-[1px]" style={{ background: "#2f7fd1" }} />)}</span>
        </button>
        {wins.map((w) => (
          <button key={w.key} type="button" onClick={() => focus(w.key)} title={w.title} className="grid h-9 w-9 place-items-center rounded-md text-[13px] font-bold hover:bg-black/5" style={{ borderBottom: "2px solid", borderColor: t.accent, color: t.text }}>
            {w.kind === "explorer" ? "🗀" : "📄"}
          </button>
        ))}
        <span className="ml-2 text-[11px] tabular-nums" style={{ color: t.text }}>{era.year}</span>
      </div>
    </div>
  );
}

function Win11Window({ win, stageRef, t, onClose, onFocus, children }: { win: Win; stageRef: React.RefObject<HTMLDivElement | null>; t: DesktopEra["tokens"]; onClose: () => void; onFocus: () => void; children: ReactNode }) {
  const controls = useDragControls();
  return (
    <motion.div
      drag dragListener={false} dragControls={controls} dragMomentum={false} dragConstraints={stageRef}
      onPointerDown={onFocus}
      className="absolute flex max-h-[90%] flex-col overflow-hidden"
      style={{ ...fitWindow(win.x, "clamp(470px, 40vw, 640px)"), top: win.y, zIndex: win.z, borderRadius: 10, border: "1px solid rgba(255,255,255,0.5)", boxShadow: "0 24px 60px rgba(0,0,0,0.45)", background: t.surfaceAlt, backdropFilter: "blur(24px)" }}
    >
      <div onPointerDown={(e: PointerEvent) => controls.start(e)} className="flex cursor-grab items-center gap-2 px-3 py-2 active:cursor-grabbing" style={{ background: t.titleBar }}>
        <span className="flex-1 truncate text-[12px] font-semibold" style={{ color: t.titleText }}>{win.title}</span>
        <span className="grid h-6 w-7 place-items-center rounded text-[11px] hover:bg-black/10">–</span>
        <span className="grid h-6 w-7 place-items-center rounded text-[10px] hover:bg-black/10">▢</span>
        <button type="button" aria-label="Close" onClick={onClose} className="grid h-6 w-7 place-items-center rounded text-[13px] hover:bg-[#e04545] hover:text-white">×</button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto bg-white/90">{children}</div>
    </motion.div>
  );
}

function ExplorerWin11({ root, path, setPath, onOpen, accent }: { root: DirNode; path: string[]; setPath: (p: string[]) => void; onOpen: (n: FsNode) => void; accent: string }) {
  const cur: DirNode = path.length ? ((root.children.find((c) => c.name === path[0]) as DirNode) ?? root) : root;
  const inProject = path.length > 0;
  return (
    <div className="flex flex-col" style={{ minHeight: 300 }}>
      {/* command bar */}
      <div className="flex items-center gap-2 px-3 py-1.5 text-[12px]" style={{ borderBottom: "1px solid #e5e9ef" }}>
        <button type="button" onClick={() => setPath([])} disabled={!inProject} className="grid h-7 w-7 place-items-center rounded-full hover:bg-black/5 disabled:opacity-40">←</button>
        <div className="flex flex-1 items-center gap-1 truncate rounded-md bg-[#f3f5fa] px-2 py-1">
          <button type="button" onClick={() => setPath([])} className="hover:underline">🗀 Work</button>
          {inProject ? <><span className="opacity-50">›</span><span className="font-semibold">{cur.label}</span></> : null}
        </div>
      </div>
      <div className="flex min-h-0 flex-1">
        {/* nav pane */}
        <div className="w-[124px] shrink-0 overflow-y-auto p-2 text-[12px]" style={{ borderRight: "1px solid #e5e9ef" }}>
          {["🏠 Home", "🖼 Gallery"].map((m) => <p key={m} className="rounded px-1.5 py-1 hover:bg-black/5">{m}</p>)}
          <button type="button" onClick={() => setPath([])} className="block w-full rounded px-1.5 py-1 text-left font-semibold hover:bg-black/5" style={{ color: inProject ? "#1a1a1a" : accent }}>🗀 Work</button>
          {root.children.slice(0, 6).map((d) => (
            <button key={d.name} type="button" onClick={() => setPath([d.name])} className="block w-full truncate rounded px-1.5 py-1 pl-4 text-left hover:bg-black/5" style={{ color: path[0] === d.name ? accent : "#3a4a5a" }}>{(d as DirNode).label}</button>
          ))}
        </div>
        {/* content */}
        <div className="min-h-0 flex-1 overflow-y-auto p-3">
          <div className="grid grid-cols-3 gap-2">
            {cur.children.map((n) => (
              <button key={n.name} type="button" onClick={() => onOpen(n)} className="group flex flex-col items-center gap-1 rounded-lg p-2 text-center hover:bg-[#eaf2fc]">
                <Win11Tile node={n} accent={accent} />
                <span className="line-clamp-2 text-[11px] leading-tight">{n.kind === "dir" ? (n as DirNode).label : n.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="px-3 py-1 text-[11px] text-[#5a6470]" style={{ borderTop: "1px solid #e5e9ef" }}>{cur.children.length} items</div>
    </div>
  );
}

function Win11Tile({ node, accent }: { node: FsNode; accent: string }) {
  if (node.kind === "dir") {
    const nda = isProjectNda((node.project as Project).id);
    return (
      <span className="relative">
        <svg width="48" height="38" viewBox="0 0 48 38" aria-hidden>
          <path d="M4 10c0-2 1-3 3-3h11l4 4h19c2 0 3 1 3 3v16c0 2-1 3-3 3H7c-2 0-3-1-3-3z" fill="#ffd16b" stroke="#e0a93a" strokeWidth="1" />
          <path d="M4 11c0-2 1-3 3-3h11l4 4H4z" fill="#ffe19a" />
        </svg>
        {nda ? <span className="absolute right-0 top-0 rounded bg-[#0067c0] px-0.5 text-[7px] font-bold text-white">NDA</span> : null}
      </span>
    );
  }
  if (node.kind === "link") return <span className="grid h-10 w-10 place-items-center rounded-lg bg-white text-[18px]" style={{ border: `2px solid ${accent}` }}>{linkGlyph(node.linkType)}</span>;
  return (
    <svg width="34" height="40" viewBox="0 0 34 40" aria-hidden>
      <path d="M5 4c0-1 1-2 2-2h13l9 9v25c0 1-1 2-2 2H7c-1 0-2-1-2-2z" fill="#fff" stroke="#cbd5e1" strokeWidth="1.3" />
      <path d="M20 2v9h9" fill="none" stroke="#cbd5e1" strokeWidth="1.3" />
      <path d="M10 18h14M10 23h14M10 28h9" stroke={accent} strokeWidth="1.3" />
    </svg>
  );
}

function NotepadWin11({ doc, t }: { doc: DocNode; t: DesktopEra["tokens"] }) {
  return (
    <div className="flex flex-col bg-white" style={{ minHeight: 200 }}>
      <div className="flex gap-3 px-3 py-1.5 text-[12px]" style={{ borderBottom: "1px solid #e5e9ef", color: t.accent }}>
        {["File", "Edit", "View"].map((m) => <span key={m}>{m}</span>)}
      </div>
      <div className="flex-1 overflow-auto p-4">
        <DocBody lines={doc.lines} skin="clean" t={t} />
      </div>
    </div>
  );
}
