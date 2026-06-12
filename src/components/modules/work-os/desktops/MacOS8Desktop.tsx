"use client";

import { motion, useDragControls } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { PointerEvent, ReactNode } from "react";
import { isProjectNda } from "@/data/project-media";
import { buildWorkDir, linkGlyph } from "../work-fs";
import type { DirNode, DocNode, FsNode } from "../work-fs";
import { DocBody } from "../DocBody";
import type { DesktopEra, Project } from "../types";

const BEVEL = "inset 1px 1px 0 #fff, inset -1px -1px 0 #808080";

interface MacWin {
  key: string;
  kind: "folder" | "doc";
  title: string;
  node: DirNode | DocNode;
  x: number;
  y: number;
  z: number;
  collapsed?: boolean;
}

/** 1997 — Mac OS 8 Platinum. Finder folders, pinstripe title bars, window-shade. */
export function MacOS8Desktop({ era, projects }: { era: DesktopEra; projects: Project[] }) {
  const t = era.tokens;
  const stageRef = useRef<HTMLDivElement>(null);
  const work = useRef<DirNode>(buildWorkDir(projects, era.id));
  const [wins, setWins] = useState<MacWin[]>([]);
  const counter = useRef(0);
  const z = useRef(10);

  useEffect(() => {
    work.current = buildWorkDir(projects, era.id);
    setWins([{ key: "w0", kind: "folder", title: work.current.label, node: work.current, x: 40, y: 28, z: 10 }]);
    counter.current = 0;
    z.current = 10;
  }, [projects]);

  const add = (kind: MacWin["kind"], node: DirNode | DocNode) => {
    counter.current += 1;
    z.current += 1;
    const n = counter.current;
    setWins((w) => [...w, { key: `w${n}`, kind, title: node.label, node, x: 60 + (n % 6) * 26, y: 40 + (n % 6) * 24, z: z.current }]);
  };
  const openNode = (node: FsNode) => {
    if (node.kind === "dir") add("folder", node);
    else if (node.kind === "doc") add("doc", node);
    else globalThis.open(node.href, "_blank", "noopener,noreferrer");
  };
  const focus = (key: string) => { z.current += 1; setWins((w) => w.map((x) => (x.key === key ? { ...x, z: z.current } : x))); };
  const close = (key: string) => setWins((w) => w.filter((x) => x.key !== key));
  const toggleCollapse = (key: string) => setWins((w) => w.map((x) => (x.key === key ? { ...x, collapsed: !x.collapsed } : x)));

  return (
    <div className="flex h-full flex-col" style={{ fontFamily: era.fontUi, color: "#000" }}>
      {/* menu bar */}
      <div className="flex items-center gap-4 px-3 py-0.5 text-[13px]" style={{ background: "#fff", borderBottom: "1px solid #000" }}>
        <span aria-hidden></span>
        {["File", "Edit", "View", "Special"].map((m) => <span key={m}>{m}</span>)}
        <span className="ml-auto font-bold">{era.brand}</span>
      </div>

      <div ref={stageRef} className="relative min-h-0 flex-1 overflow-hidden" style={{ background: t.wallpaper }}>
        {/* hard disk + trash */}
        <div className="absolute right-3 top-3 z-[1] flex flex-col items-center gap-5">
          <button type="button" onClick={() => add("folder", work.current)} className="group flex w-[80px] flex-col items-center gap-0.5">
            <DiskGlyph />
            <span className="px-1 text-[11px] font-bold group-hover:bg-black group-hover:text-white">{era.brand}</span>
          </button>
          <div className="flex flex-col items-center gap-0.5">
            <TrashGlyph />
            <span className="text-[11px]">Trash</span>
          </div>
        </div>

        {wins.map((w) => (
          <MacWindow key={w.key} win={w} stageRef={stageRef} t={t} onClose={() => close(w.key)} onFocus={() => focus(w.key)} onCollapse={() => toggleCollapse(w.key)}>
            {w.kind === "folder" ? <FinderView dir={w.node as DirNode} onOpen={openNode} /> : <DocView doc={w.node as DocNode} t={t} />}
          </MacWindow>
        ))}
      </div>
    </div>
  );
}

/* ── Platinum window with window-shade collapse ─────────────────────────── */

function MacWindow({ win, stageRef, t, onClose, onFocus, onCollapse, children }: { win: MacWin; stageRef: React.RefObject<HTMLDivElement | null>; t: DesktopEra["tokens"]; onClose: () => void; onFocus: () => void; onCollapse: () => void; children: ReactNode }) {
  const controls = useDragControls();
  return (
    <motion.div
      drag dragListener={false} dragControls={controls} dragMomentum={false} dragConstraints={stageRef}
      onPointerDown={onFocus}
      className="absolute flex max-h-[88%] flex-col"
      style={{ left: win.x, top: win.y, width: 268, zIndex: win.z, background: t.surface, border: "1px solid #000", boxShadow: `${BEVEL}, 3px 3px 0 rgba(0,0,0,0.35)` }}
    >
      {/* pinstripe title bar */}
      <div onPointerDown={(e: PointerEvent) => controls.start(e)} className="flex cursor-grab items-center gap-1.5 px-1.5 py-1 active:cursor-grabbing" style={{ background: t.titleBar, borderBottom: "1px solid #808080" }}>
        <button type="button" aria-label="Close" onClick={onClose} className="h-3.5 w-3.5" style={{ background: t.surfaceAlt, boxShadow: BEVEL }} />
        <span className="flex-1 truncate px-2 text-center text-[12px] font-bold" style={{ background: t.surface, boxShadow: "inset 0 0 0 1px #fff" }}>{win.kind === "folder" ? `📁 ${win.title}` : `📄 ${win.title}`}</span>
        <button type="button" aria-label="Collapse" onClick={onCollapse} className="grid h-3.5 w-3.5 place-items-center text-[8px] leading-none" style={{ background: t.surfaceAlt, boxShadow: BEVEL }}>{win.collapsed ? "▢" : "▬"}</button>
        <span className="h-3.5 w-3.5" style={{ background: t.surfaceAlt, boxShadow: BEVEL }} />
      </div>
      {!win.collapsed ? <div className="min-h-0 flex-1 overflow-y-auto" style={{ background: t.surface }}>{children}</div> : null}
    </motion.div>
  );
}

/* ── Finder icon view ───────────────────────────────────────────────────── */

function FinderView({ dir, onOpen }: { dir: DirNode; onOpen: (n: FsNode) => void }) {
  return (
    <div>
      <div className="flex items-center justify-between border-b border-[#808080] px-2 py-0.5 text-[11px]" style={{ background: "#ddd" }}>
        <span>{dir.children.length} items</span>
        <span className="opacity-60">{dir.project ? dir.project.category : "Macintosh HD"}</span>
      </div>
      <div className="grid grid-cols-3 gap-1 p-2">
        {dir.children.map((n) => (
          <button key={n.name} type="button" onClick={() => onOpen(n)} className="group flex flex-col items-center gap-0.5 p-1 text-center">
            <span className="relative"><NodeGlyph node={n} />{n.kind === "dir" && n.project && isProjectNda(n.project.id) ? <span className="absolute -right-1 -top-1 bg-black px-0.5 text-[7px] font-bold text-white">NDA</span> : null}</span>
            <span className="line-clamp-2 px-0.5 text-[10px] font-bold leading-tight group-hover:bg-black group-hover:text-white">{n.kind === "dir" ? (n as DirNode).label : n.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function NodeGlyph({ node }: { node: FsNode }) {
  if (node.kind === "dir") return (
    <svg width="38" height="32" viewBox="0 0 38 32" aria-hidden>
      <path d="M2 5h13l3 3h18v21H2z" fill="#9fd0f0" stroke="#2a5a7a" strokeWidth="1.3" />
      <path d="M2 5h13l3 3H2z" fill="#c2e4fb" stroke="#2a5a7a" strokeWidth="1.3" />
    </svg>
  );
  if (node.kind === "link") return <span className="grid h-8 w-8 place-items-center border border-[#808080] bg-white text-[15px]" style={{ boxShadow: BEVEL }}>{linkGlyph(node.linkType)}</span>;
  return (
    <svg width="30" height="36" viewBox="0 0 30 36" aria-hidden>
      <path d="M4 2h15l7 7v25H4z" fill="#fff" stroke="#808080" strokeWidth="1.3" />
      <path d="M19 2v7h7" fill="none" stroke="#808080" strokeWidth="1.3" />
      <path d="M8 15h14M8 20h14M8 25h9" stroke="#3355bb" strokeWidth="1.2" />
    </svg>
  );
}

function DocView({ doc, t }: { doc: DocNode; t: DesktopEra["tokens"] }) {
  return (
    <div className="px-3 py-2" style={{ fontFamily: "'Geneva','Tahoma',sans-serif" }}>
      <p className="mb-1.5 border-b border-[#808080] pb-1 text-[12px] font-bold">{doc.name}</p>
      <DocBody lines={doc.lines} skin="classic" t={t} />
    </div>
  );
}

function DiskGlyph() {
  return (
    <svg width="46" height="40" viewBox="0 0 46 40" aria-hidden>
      <rect x="5" y="5" width="36" height="28" rx="2" fill="#dcdcdc" stroke="#000" strokeWidth="1.4" />
      <rect x="10" y="10" width="26" height="7" fill="#3355bb" />
      <path d="M10 24h26" stroke="#808080" strokeWidth="1.4" />
    </svg>
  );
}

function TrashGlyph() {
  return (
    <svg width="32" height="36" viewBox="0 0 32 36" aria-hidden>
      <rect x="6" y="9" width="20" height="23" rx="2" fill="#dcdcdc" stroke="#000" strokeWidth="1.4" />
      <path d="M4 9h24M12 6h8M11 14v13M16 14v13M21 14v13" stroke="#000" strokeWidth="1.3" fill="none" />
    </svg>
  );
}
