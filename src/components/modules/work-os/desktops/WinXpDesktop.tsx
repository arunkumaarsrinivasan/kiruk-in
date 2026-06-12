"use client";

import { useEffect, useRef, useState } from "react";
import { isProjectNda } from "@/data/project-media";
import { WindowFrame } from "../WindowFrame";
import { buildWorkDir, linkGlyph } from "../work-fs";
import type { DirNode, DocNode, FsNode } from "../work-fs";
import { DocBody } from "../DocBody";
import type { DesktopEra, Project } from "../types";

interface Win {
  key: string;
  kind: "explorer" | "doc";
  doc?: DocNode;
  title: string;
  x: number;
  y: number;
  z: number;
}

/** 2001 — Windows XP Luna. Explorer (task pane + thumbnails) + Notepad. */
export function WinXpDesktop({ era, projects }: { era: DesktopEra; projects: Project[] }) {
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
    setWins([{ key: "explorer", kind: "explorer", title: "My Projects", x: 64, y: 22, z: 21 }]);
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
      const nz = bump();
      const cur = root.current;
      const title = toPath.length ? (cur.children.find((c) => c.name === toPath[0]) as DirNode)?.label ?? "My Projects" : "My Projects";
      if (w.find((x) => x.key === "explorer")) return w.map((x) => (x.key === "explorer" ? { ...x, z: nz, title } : x));
      return [...w, { key: "explorer", kind: "explorer", title, x: 64, y: 22, z: nz }];
    });
  };

  const openDoc = (doc: DocNode) => {
    counter.current += 1;
    const n = counter.current;
    const nz = bump();
    setWins((w) => [...w, { key: `doc${n}`, kind: "doc", doc, title: doc.name, x: 130 + (n % 5) * 26, y: 64 + (n % 5) * 24, z: nz }]);
  };

  const onOpen = (n: FsNode) => {
    if (n.kind === "dir") openExplorer([n.name]);
    else if (n.kind === "doc") openDoc(n);
    else globalThis.open(n.href, "_blank", "noopener,noreferrer");
  };

  const launch = (id: string) => { openExplorer([id]); setStartOpen(false); };

  return (
    <div className="flex h-full flex-col" style={{ fontFamily: era.fontUi, color: "#0a0a0a" }}>
      <div ref={stageRef} className="relative min-h-0 flex-1 overflow-hidden" style={{ background: t.wallpaper }} onClick={() => setStartOpen(false)}>
        <div className="absolute left-0 top-0 z-[1] flex flex-col gap-1 p-3">
          <button type="button" onClick={(e) => { e.stopPropagation(); openExplorer([]); }} className="group flex w-[84px] flex-col items-center gap-1 p-1 text-center">
            <svg width="42" height="38" viewBox="0 0 42 38" aria-hidden>
              <path d="M4 8h12l4 4h18v20H4z" fill="#f8d36b" stroke="#c79a2a" strokeWidth="1.2" />
              <path d="M4 8h12l4 4H4z" fill="#ffe7a0" />
            </svg>
            <span className="px-1 text-[11px] font-medium text-white group-hover:bg-[#1c4ba8]" style={{ textShadow: "0 1px 2px rgba(0,0,0,0.8)" }}>My Projects</span>
          </button>
        </div>

        {wins.map((w) => (
          <WindowFrame key={w.key} era={era} title={w.title} z={w.z} x={w.x} y={w.y} onClose={() => close(w.key)} onFocus={() => focus(w.key)} dragConstraints={stageRef}>
            {w.kind === "explorer" ? (
              <ExplorerXP root={root.current} path={path} setPath={setPath} onOpen={onOpen} accent={t.accent} />
            ) : (
              <NotepadXP doc={w.doc as DocNode} t={t} />
            )}
          </WindowFrame>
        ))}
      </div>

      {/* taskbar */}
      <div className="relative z-20 flex items-stretch" style={{ background: "linear-gradient(180deg, #3168d8 0%, #2459c8 8%, #245edb 90%, #1941a5 100%)", height: 34 }}>
        <button type="button" onClick={(e) => { e.stopPropagation(); setStartOpen((v) => !v); }} className="flex items-center gap-1.5 pl-3 pr-6 text-[15px] font-bold italic text-white" style={{ background: "linear-gradient(180deg, #5db553 0%, #3a9b32 50%, #2e8a28 100%)", borderRadius: "0 12px 12px 0", textShadow: "0 1px 2px rgba(0,0,0,0.5)" }}>
          <span className="not-italic">⊞</span> start
        </button>
        <div className="flex flex-1 items-center gap-1 px-2">
          {wins.map((w) => (
            <button key={w.key} type="button" onClick={() => focus(w.key)} className="truncate rounded px-2 py-1 text-left text-[12px] text-white" style={{ maxWidth: 160, background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.25)" }}>
              {w.kind === "explorer" ? "🗀 " : "📄 "}{w.title}
            </button>
          ))}
        </div>
        <span className="grid place-items-center px-3 text-[12px] text-white tabular-nums" style={{ background: "rgba(19,90,201,0.6)", borderLeft: "1px solid #4a86e8" }}>{era.year}</span>
      </div>

      {startOpen ? (
        <div className="absolute bottom-9 left-1 z-30 w-[340px] overflow-hidden rounded-t-lg" style={{ border: "1px solid #0a246a", boxShadow: "0 8px 30px rgba(0,0,0,0.5)" }} onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-2 px-3 py-2 text-[14px] font-bold text-white" style={{ background: "linear-gradient(180deg, #2a64d4, #1c4ba8)" }}>
            <span className="grid h-7 w-7 place-items-center rounded bg-white/25 text-base">☺</span>Arun · Work
          </div>
          <div className="flex" style={{ background: "#fff" }}>
            <div className="flex-1 py-1">
              <p className="px-3 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#0a246a]">Projects</p>
              <div className="max-h-[230px] overflow-y-auto">
                {root.current.children.map((d) => (
                  <button key={d.name} type="button" onClick={() => launch(d.name)} className="flex w-full items-center gap-2 px-3 py-1 text-left text-[13px] hover:bg-[#2a64d4] hover:text-white">
                    <span>🗀</span><span className="flex-1 truncate">{(d as DirNode).label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="w-[120px] py-1" style={{ background: "#d3e5fa" }}>
              <p className="px-2 py-0.5 text-[10px] font-bold uppercase text-[#0a246a]">Places</p>
              {["My Work", "My Links", "Behance", "GitHub"].map((m) => <div key={m} className="px-2 py-1 text-[12px] text-[#0a246a]">{m}</div>)}
            </div>
          </div>
          <div className="flex justify-end gap-3 px-3 py-1.5 text-[12px] text-white" style={{ background: "linear-gradient(180deg, #2a64d4, #1c4ba8)" }}>
            <span>⏻ Log Off</span><span>⏼ Turn Off</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}

/* ── XP Explorer: task pane + thumbnail tiles ───────────────────────────── */

function ExplorerXP({ root, path, setPath, onOpen, accent }: { root: DirNode; path: string[]; setPath: (p: string[]) => void; onOpen: (n: FsNode) => void; accent: string }) {
  const cur: DirNode = path.length ? ((root.children.find((c) => c.name === path[0]) as DirNode) ?? root) : root;
  const inProject = path.length > 0;

  return (
    <div className="flex flex-col bg-white" style={{ minHeight: 300 }}>
      {/* toolbar + address */}
      <div className="flex items-center gap-2 px-2 py-1 text-[12px]" style={{ background: "linear-gradient(#fbfbfb,#ece9d8)", borderBottom: "1px solid #aca899" }}>
        <button type="button" onClick={() => setPath([])} disabled={!inProject} className="rounded px-1.5 py-0.5 disabled:opacity-40 hover:bg-[#d8e4f8]">← Back</button>
        <button type="button" onClick={() => setPath([])} disabled={!inProject} className="rounded px-1.5 py-0.5 disabled:opacity-40 hover:bg-[#d8e4f8]">↑ Up</button>
        <span className="opacity-60">Address</span>
        <div className="flex-1 truncate rounded border border-[#7f9db9] bg-white px-2 py-0.5">📁 My Projects{inProject ? ` ▸ ${cur.label}` : ""}</div>
      </div>

      <div className="flex min-h-0 flex-1">
        {/* task pane */}
        <div className="w-[136px] shrink-0 space-y-2 p-2 text-[11px] text-white" style={{ background: "linear-gradient(160deg, #7aa3e6, #4a7fd4)" }}>
          <Panel title={inProject ? "File Tasks" : "Folder Tasks"}>
            {inProject ? <><Link>Open all files</Link><Link>Share this folder</Link></> : <><Link>View work</Link><Link>Add to favorites</Link></>}
          </Panel>
          <Panel title="Other Places">
            <button type="button" onClick={() => setPath([])} className="block w-full text-left hover:underline">🖥 My Projects</button>
            {root.children.slice(0, 5).map((d) => (
              <button key={d.name} type="button" onClick={() => setPath([d.name])} className="block w-full truncate text-left hover:underline">🗀 {(d as DirNode).label}</button>
            ))}
          </Panel>
          <Panel title="Details">
            <p className="font-bold">{inProject ? cur.label : "My Projects"}</p>
            <p className="opacity-90">{inProject ? `${cur.project?.category} · ${cur.children.length} files` : `${root.children.length} project folders`}</p>
          </Panel>
        </div>

        {/* thumbnail contents */}
        <div className="min-h-0 flex-1 overflow-y-auto p-2">
          <div className="grid grid-cols-3 gap-2">
            {cur.children.map((n) => (
              <button key={n.name} type="button" onClick={() => onOpen(n)} className="group flex flex-col items-center gap-1 rounded p-1.5 text-center hover:bg-[#e8f0fc]">
                <XpTile node={n} accent={accent} />
                <span className="line-clamp-2 text-[11px] leading-tight group-hover:bg-[#316ac5] group-hover:text-white">{n.kind === "dir" ? (n as DirNode).label : n.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-2 py-0.5 text-[11px]" style={{ background: "#ece9d8", borderTop: "1px solid #aca899" }}>{cur.children.length} object(s)</div>
    </div>
  );
}

function XpTile({ node, accent }: { node: FsNode; accent: string }) {
  if (node.kind === "dir") {
    const nda = isProjectNda((node.project as Project).id);
    return (
      <span className="relative">
        <svg width="46" height="40" viewBox="0 0 46 40" aria-hidden>
          <path d="M4 9h14l4 4h20v22H4z" fill="#f8d36b" stroke="#c79a2a" strokeWidth="1.2" />
          <path d="M4 9h14l4 4H4z" fill="#ffe7a0" />
        </svg>
        {nda ? <span className="absolute right-0 top-0 bg-[#0a246a] px-0.5 text-[7px] font-bold text-white">NDA</span> : null}
      </span>
    );
  }
  if (node.kind === "link") {
    return <span className="grid h-10 w-10 place-items-center rounded bg-white text-[18px]" style={{ border: `2px solid ${accent}` }}>{linkGlyph(node.linkType)}</span>;
  }
  return (
    <svg width="34" height="40" viewBox="0 0 34 40" aria-hidden>
      <path d="M5 2h16l8 8v28H5z" fill="#fff" stroke="#7f9db9" strokeWidth="1.4" />
      <path d="M21 2v8h8" fill="none" stroke="#7f9db9" strokeWidth="1.4" />
      <path d="M9 17h16M9 22h16M9 27h10" stroke="#4a7fd4" strokeWidth="1.3" />
    </svg>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded" style={{ background: "rgba(255,255,255,0.16)" }}>
      <p className="px-2 py-0.5 font-bold" style={{ background: "rgba(255,255,255,0.18)" }}>{title}</p>
      <div className="space-y-0.5 px-2 py-1">{children}</div>
    </div>
  );
}

function Link({ children }: { children: React.ReactNode }) {
  return <span className="block hover:underline">› {children}</span>;
}

function NotepadXP({ doc, t }: { doc: DocNode; t: DesktopEra["tokens"] }) {
  return (
    <div className="flex flex-col bg-white" style={{ minHeight: 200 }}>
      <div className="flex gap-3 px-2 py-0.5 text-[12px]" style={{ background: "#ece9d8", borderBottom: "1px solid #aca899" }}>
        {["File", "Edit", "Format", "View", "Help"].map((m) => <span key={m}>{m}</span>)}
      </div>
      <div className="flex-1 overflow-auto p-3">
        <DocBody lines={doc.lines} skin="glossy" t={t} />
      </div>
    </div>
  );
}
