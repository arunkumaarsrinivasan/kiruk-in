"use client";

import { useEffect, useRef, useState } from "react";
import { isProjectNda } from "@/data/project-media";
import { WindowFrame } from "../WindowFrame";
import { buildWorkDir, linkGlyph } from "../work-fs";
import type { DirNode, DocNode, FsNode } from "../work-fs";
import { DocBody } from "../DocBody";
import type { DesktopEra, Project } from "../types";

interface MacWin {
  key: string;
  kind: "folder" | "doc";
  title: string;
  node: DirNode | DocNode;
  x: number;
  y: number;
  z: number;
}

/** 1984 — Macintosh System. Finder: open folders into windows, files into a viewer. */
export function BitmapDesktop({ era, projects }: { era: DesktopEra; projects: Project[] }) {
  const t = era.tokens;
  const stageRef = useRef<HTMLDivElement>(null);
  const work = useRef<DirNode>(buildWorkDir(projects, era.id));
  const [wins, setWins] = useState<MacWin[]>([]);
  const counter = useRef(0);
  const z = useRef(10);

  const addWin = (kind: MacWin["kind"], node: DirNode | DocNode) => {
    counter.current += 1;
    z.current += 1;
    const n = counter.current;
    setWins((w) => [
      ...w,
      { key: `w${n}`, kind, title: node.label, node, x: 44 + (n % 6) * 26, y: 30 + (n % 6) * 24, z: z.current },
    ]);
  };

  const openNode = (node: FsNode) => {
    if (node.kind === "dir") addWin("folder", node);
    else if (node.kind === "doc") addWin("doc", node);
    else globalThis.open(node.href, "_blank", "noopener,noreferrer");
  };

  const focus = (key: string) => {
    z.current += 1;
    setWins((w) => w.map((x) => (x.key === key ? { ...x, z: z.current } : x)));
  };
  const close = (key: string) => setWins((w) => w.filter((x) => x.key !== key));

  // open the Work disk on mount
  useEffect(() => {
    work.current = buildWorkDir(projects, era.id);
    setWins([{ key: "w0", kind: "folder", title: work.current.label, node: work.current, x: 40, y: 30, z: 10 }]);
    counter.current = 0;
    z.current = 10;
  }, [projects]);

  return (
    <div className="flex h-full flex-col" style={{ fontFamily: era.fontUi, color: "#000" }}>
      {/* menu bar */}
      <div className="flex items-center gap-4 px-3 py-1 text-[13px] font-bold" style={{ background: "#fff", borderBottom: "2px solid #000" }}>
        <span aria-hidden></span>
        {["File", "Edit", "View", "Special"].map((m) => (
          <span key={m}>{m}</span>
        ))}
        <span className="ml-auto font-normal">{era.brand}</span>
      </div>

      {/* desktop */}
      <div ref={stageRef} className="relative min-h-0 flex-1 overflow-hidden" style={{ background: t.wallpaper }}>
        {t.eraTint ? (
          <div className="pointer-events-none absolute inset-0" style={{ background: `radial-gradient(90% 70% at 82% 6%, ${t.eraTint}, transparent 60%)`, opacity: 0.14, mixBlendMode: "screen" }} />
        ) : null}

        {/* Work disk + Trash, top-right */}
        <div className="absolute right-3 top-3 z-[1] flex flex-col items-center gap-5">
          <button type="button" onClick={() => addWin("folder", work.current)} className="group flex w-[80px] flex-col items-center gap-0.5">
            <svg width="46" height="40" viewBox="0 0 46 40" aria-hidden>
              <rect x="5" y="5" width="36" height="28" rx="2" fill="#fff" stroke="#000" strokeWidth="1.5" />
              <rect x="10" y="10" width="26" height="6" fill="#000" />
              <path d="M10 23h26" stroke="#000" strokeWidth="1.5" />
            </svg>
            <span className="px-1 text-[11px] font-bold group-hover:bg-black group-hover:text-white">Work</span>
          </button>
          <div className="flex flex-col items-center gap-0.5">
            <svg width="34" height="36" viewBox="0 0 34 36" aria-hidden>
              <rect x="6" y="9" width="22" height="24" rx="2" fill="#fff" stroke="#000" strokeWidth="1.5" />
              <path d="M4 9h26M13 6h8M12 14v14M17 14v14M22 14v14" stroke="#000" strokeWidth="1.5" fill="none" />
            </svg>
            <span className="text-[11px]">Trash</span>
          </div>
        </div>

        {/* Finder + doc windows */}
        {wins.map((w) => (
          <WindowFrame
            key={w.key}
            era={era}
            title={w.kind === "folder" ? `📁 ${w.title}` : `📄 ${w.title}`}
            z={w.z}
            x={w.x}
            y={w.y}
            onClose={() => close(w.key)}
            onFocus={() => focus(w.key)}
            dragConstraints={stageRef}
          >
            {w.kind === "folder" ? (
              <FinderView dir={w.node as DirNode} onOpen={openNode} />
            ) : (
              <DocView doc={w.node as DocNode} t={t} />
            )}
          </WindowFrame>
        ))}
      </div>
    </div>
  );
}

/* ── Finder icon grid ───────────────────────────────────────────────────── */

function FinderView({ dir, onOpen }: { dir: DirNode; onOpen: (n: FsNode) => void }) {
  return (
    <div className="px-2 py-1">
      <div className="mb-1 flex items-center justify-between border-b border-black px-1 pb-1 text-[11px]">
        <span>{dir.children.length} items</span>
        <span className="opacity-60">{dir.project ? dir.project.category : "Macintosh HD"}</span>
      </div>
      <div className="grid grid-cols-3 gap-1 py-1">
        {dir.children.map((n) => (
          <FinderIcon key={n.name} node={n} onOpen={() => onOpen(n)} />
        ))}
      </div>
    </div>
  );
}

function FinderIcon({ node, onOpen }: { node: FsNode; onOpen: () => void }) {
  const nda = node.kind === "dir" && node.project ? isProjectNda(node.project.id) : false;
  return (
    <button type="button" onClick={onOpen} className="group flex flex-col items-center gap-0.5 p-1 text-center">
      <span className="relative">
        <NodeGlyph node={node} />
        {nda ? <span className="absolute -right-1 -top-1 bg-black px-0.5 text-[7px] font-bold text-white">NDA</span> : null}
      </span>
      <span className="line-clamp-2 px-0.5 text-[10px] font-bold leading-tight group-hover:bg-black group-hover:text-white">
        {node.kind === "dir" ? node.label : node.name}
      </span>
    </button>
  );
}

function NodeGlyph({ node }: { node: FsNode }) {
  if (node.kind === "dir") {
    return (
      <svg width="38" height="32" viewBox="0 0 38 32" aria-hidden>
        <path d="M2 5h13l3 3h18v21H2z" fill="#fff" stroke="#000" strokeWidth="1.5" />
        <path d="M2 5h13l3 3H2z" fill="#fff" stroke="#000" strokeWidth="1.5" />
      </svg>
    );
  }
  if (node.kind === "link") {
    return (
      <span className="grid h-8 w-8 place-items-center border-2 border-black bg-white text-[15px]">{linkGlyph(node.linkType)}</span>
    );
  }
  // doc
  return (
    <svg width="30" height="36" viewBox="0 0 30 36" aria-hidden>
      <path d="M4 2h15l7 7v25H4z" fill="#fff" stroke="#000" strokeWidth="1.5" />
      <path d="M19 2v7h7" fill="none" stroke="#000" strokeWidth="1.5" />
      <path d="M8 15h14M8 20h14M8 25h9" stroke="#000" strokeWidth="1.2" />
    </svg>
  );
}

/* ── SimpleText doc viewer ──────────────────────────────────────────────── */

function DocView({ doc, t }: { doc: DocNode; t: DesktopEra["tokens"] }) {
  return (
    <div className="px-4 py-3" style={{ fontFamily: "'Geneva','Tahoma',sans-serif" }}>
      <p className="mb-2 border-b-2 border-black pb-1 text-[12px] font-bold" style={{ color: "#000" }}>
        {doc.name}
      </p>
      <DocBody lines={doc.lines} skin="classic" t={t} />
    </div>
  );
}
