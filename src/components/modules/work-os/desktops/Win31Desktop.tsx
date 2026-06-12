"use client";

import { motion, useDragControls } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import type { PointerEvent, ReactNode } from "react";
import { isProjectNda } from "@/data/project-media";
import { buildWorkDir, linkGlyph } from "../work-fs";
import type { DirNode, DocNode, FsNode } from "../work-fs";
import { monogram } from "../helpers";
import { DocBody } from "../DocBody";
import type { DesktopEra, Project } from "../types";

const OUTSET = "inset -1px -1px 0 #000, inset 1px 1px 0 #fff, inset -2px -2px 0 #808080, inset 2px 2px 0 #dfdfdf";
const INSET = "inset 1px 1px 0 #000, inset -1px -1px 0 #fff, inset 2px 2px 0 #808080, inset -2px -2px 0 #dfdfdf";

const CAT_COLOR: Record<string, string> = { ai: "#7b2fbe", web: "#1d6fb8", mobile: "#1f9e6b", design: "#c0497a" };

interface W31 {
  key: string;
  kind: "group" | "project" | "viewer";
  title: string;
  category?: string;
  dir?: DirNode;
  doc?: DocNode;
  x: number;
  y: number;
  w: number;
  z: number;
}

/** 1993 — Windows 3.1. Program Manager: groups → project windows → viewers. */
export function Win31Desktop({ era, projects }: { era: DesktopEra; projects: Project[] }) {
  const t = era.tokens;
  const clientRef = useRef<HTMLDivElement>(null);
  const root = useMemo(() => buildWorkDir(projects, era.id), [projects]);
  const groups = useMemo(() => {
    const map = new Map<string, DirNode[]>();
    root.children.forEach((d) => {
      const cat = (d as DirNode).project?.category ?? "other";
      map.set(cat, [...(map.get(cat) ?? []), d as DirNode]);
    });
    return [...map.entries()];
  }, [root]);

  const [wins, setWins] = useState<W31[]>([]);
  const counter = useRef(0);
  const z = useRef(10);

  useEffect(() => {
    let i = 0;
    setWins(
      groups.map(([cat]) => {
        const win: W31 = { key: `g-${cat}`, kind: "group", title: cat.toUpperCase(), category: cat, x: 16 + (i % 3) * 188, y: 14 + Math.floor(i / 3) * 150, w: 178, z: 10 + i };
        i += 1;
        return win;
      }),
    );
    z.current = 10 + groups.length;
    counter.current = 0;
  }, [groups]);

  const bump = () => (z.current += 1);
  const focus = (key: string) => { const nz = bump(); setWins((w) => w.map((x) => (x.key === key ? { ...x, z: nz } : x))); };
  const close = (key: string) => setWins((w) => w.filter((x) => x.key !== key));

  const add = (win: Omit<W31, "z" | "key"> & { key?: string }) => {
    counter.current += 1;
    const nz = bump();
    const key = win.key ?? `w${counter.current}`;
    setWins((w) => {
      if (w.find((x) => x.key === key)) return w.map((x) => (x.key === key ? { ...x, z: nz } : x));
      return [...w, { ...win, key, z: nz }];
    });
  };

  const openProject = (dir: DirNode) =>
    add({ key: `p-${dir.name}`, kind: "project", title: dir.label, dir, x: 90 + (counter.current % 5) * 26, y: 50 + (counter.current % 5) * 22, w: 232 });

  const openFile = (n: FsNode) => {
    if (n.kind === "link") return globalThis.open(n.href, "_blank", "noopener,noreferrer");
    if (n.kind === "doc") add({ key: `d-${n.name}-${counter.current}`, kind: "viewer", title: n.name, doc: n, x: 130 + (counter.current % 5) * 26, y: 70 + (counter.current % 5) * 22, w: 300 });
  };

  return (
    <div className="flex h-full flex-col" style={{ fontFamily: era.fontUi, color: "#000" }}>
      {/* Program Manager title + menu */}
      <div className="flex items-center gap-2 px-1.5 py-0.5" style={{ background: t.titleBar }}>
        <span className="grid h-4 w-4 place-items-center text-[10px]" style={{ background: "#c0c0c0", boxShadow: OUTSET }}>=</span>
        <span className="text-[13px] font-bold" style={{ color: t.titleText }}>Program Manager</span>
      </div>
      <div className="flex gap-4 px-2 py-0.5 text-[12px]" style={{ background: "#c0c0c0", boxShadow: "inset 0 -1px 0 #808080" }}>
        {["File", "Options", "Window", "Help"].map((m) => <span key={m}><u>{m[0]}</u>{m.slice(1)}</span>)}
      </div>

      {/* PM client area */}
      <div ref={clientRef} className="relative min-h-0 flex-1 overflow-hidden" style={{ background: "#04807f", boxShadow: INSET }}>
        {wins.map((w) => (
          <Win31Window key={w.key} win={w} clientRef={clientRef} onFocus={() => focus(w.key)} onClose={() => close(w.key)}>
            {w.kind === "group" ? (
              <GroupBody dirs={groups.find(([c]) => c === w.category)?.[1] ?? []} onOpen={openProject} />
            ) : w.kind === "project" ? (
              <ProjectBody dir={w.dir as DirNode} onOpen={openFile} />
            ) : (
              <ViewerBody doc={w.doc as DocNode} t={t} />
            )}
          </Win31Window>
        ))}
      </div>
    </div>
  );
}

/* ── MDI window ─────────────────────────────────────────────────────────── */

function Win31Window({ win, clientRef, onFocus, onClose, children }: { win: W31; clientRef: React.RefObject<HTMLDivElement | null>; onFocus: () => void; onClose: () => void; children: ReactNode }) {
  const controls = useDragControls();
  return (
    <motion.div
      drag
      dragListener={false}
      dragControls={controls}
      dragMomentum={false}
      dragConstraints={clientRef}
      onPointerDown={onFocus}
      className="absolute flex max-h-[88%] flex-col"
      style={{ left: win.x, top: win.y, width: win.w, zIndex: win.z, background: "#c0c0c0", boxShadow: `${OUTSET}, 2px 2px 5px rgba(0,0,0,0.4)`, padding: 2 }}
    >
      <div
        onPointerDown={(e: PointerEvent) => controls.start(e)}
        className="flex cursor-grab items-center gap-1 px-1 py-0.5 active:cursor-grabbing"
        style={{ background: win.kind === "group" ? "#808080" : "#000080" }}
      >
        <span className="grid h-3.5 w-3.5 place-items-center text-[9px] leading-none" style={{ background: "#c0c0c0", boxShadow: OUTSET }}>=</span>
        <span className="flex-1 truncate text-[12px] font-bold text-white">{win.title}</span>
        <button type="button" aria-label="Close" onClick={onClose} className="grid h-3.5 w-3.5 place-items-center text-[9px] font-bold leading-none text-black" style={{ background: "#c0c0c0", boxShadow: OUTSET }}>×</button>
      </div>
      <div className="min-h-0 flex-1 overflow-auto" style={{ background: win.kind === "group" ? "#c0c0c0" : "#fff", boxShadow: INSET }}>
        {children}
      </div>
    </motion.div>
  );
}

/* ── Bodies ─────────────────────────────────────────────────────────────── */

function PmIcon({ glyph, color, label, onOpen, nda }: { glyph: string; color: string; label: string; onOpen: () => void; nda?: boolean }) {
  return (
    <button type="button" onClick={onOpen} className="group flex w-[64px] flex-col items-center gap-0.5 p-1 text-center">
      <span className="relative grid h-9 w-9 place-items-center text-[15px] font-bold text-white" style={{ background: color, boxShadow: "inset 1px 1px 0 rgba(255,255,255,0.5), inset -1px -1px 0 rgba(0,0,0,0.4)", borderRadius: 2 }}>
        {glyph}
        {nda ? <span className="absolute -right-1 -top-1 bg-black px-0.5 text-[7px] font-bold text-white">N</span> : null}
      </span>
      <span className="line-clamp-2 text-[10px] leading-tight group-hover:bg-[#000080] group-hover:text-white">{label}</span>
    </button>
  );
}

function GroupBody({ dirs, onOpen }: { dirs: DirNode[]; onOpen: (d: DirNode) => void }) {
  return (
    <div className="flex flex-wrap content-start gap-1 p-1.5">
      {dirs.map((d) => (
        <PmIcon key={d.name} glyph={monogram(d.project as Project)} color={CAT_COLOR[d.project?.category ?? "other"] ?? "#555"} label={d.label} nda={isProjectNda((d.project as Project).id)} onOpen={() => onOpen(d)} />
      ))}
    </div>
  );
}

function ProjectBody({ dir, onOpen }: { dir: DirNode; onOpen: (n: FsNode) => void }) {
  return (
    <div className="flex flex-wrap content-start gap-1 p-1.5">
      {dir.children.map((n) => (
        <PmIcon
          key={n.name}
          glyph={n.kind === "link" ? linkGlyph(n.linkType) : "≡"}
          color={n.kind === "link" ? "#1d6fb8" : "#9a8a30"}
          label={n.name}
          onOpen={() => onOpen(n)}
        />
      ))}
    </div>
  );
}

function ViewerBody({ doc, t }: { doc: DocNode; t: DesktopEra["tokens"] }) {
  return (
    <div className="p-2">
      <p className="mb-1 border-b border-[#808080] pb-1 text-[12px] font-bold" style={{ color: "#000080" }}>{doc.name}</p>
      <DocBody lines={doc.lines} skin="classic" t={t} />
    </div>
  );
}
