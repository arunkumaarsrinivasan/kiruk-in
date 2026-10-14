"use client";

import { useMemo, useState } from "react";
import { isProjectNda } from "@/data/project-media";
import { buildWorkDir, findDir, linkGlyph } from "../work-fs";
import type { DirNode, DocNode, FsNode, LinkNode } from "../work-fs";
import { monogram } from "../helpers";
import { DocBody } from "../DocBody";
import { useFocusProject } from "../use-focus-project";
import type { DesktopEra, DesktopProps, Project } from "../types";

const BEVEL = "inset 1px 1px 0 #f0f0f4, inset -1px -1px 0 #6a6a70";
const TITLE_DIMPLE = "repeating-linear-gradient(#7a7a82 0 1px, #4e4e54 1px 2px)";

/** 1991 — NeXTSTEP. Detached vertical menu, File Viewer shelf + column browser. */
export function NextDesktop({ era, projects, focusId }: DesktopProps) {
  const t = era.tokens;
  const root = useMemo(() => buildWorkDir(projects, era.id), [projects]);
  const [proj, setProj] = useState<DirNode | null>(null);
  const [file, setFile] = useState<FsNode | null>(null);

  const selectProject = (d: DirNode) => {
    setProj(d);
    // Preview the readme straight away so the third column is never blank.
    setFile(d.children.find((c) => c.kind === "doc") ?? null);
  };

  useFocusProject(focusId, (id) => { const d = findDir(root, [id]); if (d) selectProject(d); });

  return (
    <div className="relative h-full overflow-hidden" style={{ fontFamily: era.fontUi, background: t.wallpaper }}>
      {t.eraTint ? (
        <div className="pointer-events-none absolute inset-0" style={{ background: `radial-gradient(70% 60% at 45% 0%, ${t.eraTint}, transparent 55%)`, opacity: 0.16, mixBlendMode: "screen" }} />
      ) : null}

      {/* File Viewer — fills the workspace */}
      <div className="absolute bottom-2 left-2 right-2 top-2 flex flex-col sm:bottom-3 sm:left-3 sm:right-[112px] sm:top-3" style={{ background: t.surface, boxShadow: `${BEVEL}, 6px 6px 0 rgba(0,0,0,0.45)` }}>
        {/* dimpled title bar with working menu */}
        <div className="flex items-center gap-2 px-2 py-1" style={{ background: TITLE_DIMPLE }}>
          <span className="h-3 w-3" style={{ background: t.surface, boxShadow: BEVEL }} />
          <span className="text-[12px] font-bold tracking-wide" style={{ color: "#f4f4f6" }}>File Viewer — /Work{proj ? `/${proj.label}` : ""}</span>
          <div className="ml-auto flex items-center gap-1">
            <MenuBtn label="↰ Up" disabled={!proj && !file} onClick={() => (file ? setFile(null) : setProj(null))} t={t} />
            <MenuBtn label="⌂ Home" disabled={!proj && !file} onClick={() => { setProj(null); setFile(null); }} t={t} />
          </div>
        </div>

        {/* shelf — big path icons */}
        <div className="flex items-center gap-3 px-3 py-2" style={{ background: t.surfaceAlt, boxShadow: "inset 0 -1px 0 #6a6a70" }}>
          <ShelfIcon active={!proj} onClick={() => { setProj(null); setFile(null); }} glyph={<DiskGlyph />} label="Work" t={t} />
          {proj ? <span style={{ color: t.textMuted }}>▸</span> : null}
          {proj ? <ShelfIcon active={!file} onClick={() => setFile(null)} glyph={<span className="text-[18px] font-bold">{monogram(proj.project as Project)}</span>} label={proj.label} accent t={t} /> : null}
          {file ? <span style={{ color: t.textMuted }}>▸</span> : null}
          {file ? <ShelfIcon active onClick={() => undefined} glyph={<span className="text-[18px]">{file.kind === "link" ? linkGlyph((file as LinkNode).linkType) : "≡"}</span>} label={file.name} t={t} /> : null}
        </div>

        {/* columns */}
        <div
          className="grid min-h-0 flex-1 grid-cols-1 grid-rows-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,2fr)] sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,2fr)] sm:grid-rows-1"
          style={{ borderTop: "1px solid #6a6a70" }}
          onKeyDown={browseKeys}
        >
          <Column border>
            {root.children.map((d) => (
              <Row key={d.name} active={proj?.name === d.name} accent={t.accent} text={t.text} onClick={() => selectProject(d as DirNode)}>
                <span className="grid h-4 w-4 place-items-center text-[10px] font-bold" style={{ background: CATfor(d), color: "#fff", borderRadius: 1 }}>{monogram((d as DirNode).project as Project)}</span>
                <span className="flex-1 truncate">{(d as DirNode).label}</span>
                <span style={{ opacity: 0.5 }}>▸</span>
              </Row>
            ))}
          </Column>

          <Column border>
            {proj ? (
              proj.children.map((n) => (
                <Row key={n.name} active={file?.name === n.name} accent={t.accent} text={t.text} onClick={() => setFile(n)} onDouble={() => n.kind === "link" && globalThis.open((n as LinkNode).href, "_blank", "noopener")}>
                  <span className="w-4 text-center">{n.kind === "link" ? linkGlyph((n as LinkNode).linkType) : "≡"}</span>
                  <span className="flex-1 truncate">{n.name}</span>
                </Row>
              ))
            ) : (
              <div className="px-3 py-2 text-[12px]" style={{ color: t.textMuted }}>← select a project</div>
            )}
          </Column>

          <div className="min-h-0 overflow-y-auto" style={{ background: "#fff" }}>
            <Preview node={file} t={t} />
          </div>
        </div>

        {/* info line */}
        <div className="px-3 py-1 text-[11px]" style={{ background: t.surfaceAlt, boxShadow: "inset 0 1px 0 #6a6a70", color: t.textMuted }}>
          {proj ? `${proj.children.length} files in ${proj.label}` : `${root.children.length} projects`}
          {file ? ` · ${file.name}` : ""}
        </div>
      </div>

      {/* right-edge dock */}
      <div className="absolute right-0 top-0 z-[2] hidden h-full w-[104px] flex-col sm:flex items-center gap-2.5 overflow-y-auto px-2 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" style={{ background: "#1a1a1c", borderLeft: "2px solid #000" }}>
        <span className="text-[10px] font-bold uppercase tracking-[0.22em]" style={{ color: "#8a8a92" }}>Projects</span>
        {root.children.map((d) => {
          const p = (d as DirNode).project as Project;
          const on = proj?.name === d.name;
          const cat = CAT[p.category] ?? "#555";
          return (
            <button key={d.name} type="button" onClick={() => selectProject(d as DirNode)} title={(d as DirNode).label}
              className="group flex w-full flex-col items-center gap-1 transition-transform active:scale-95">
              <span className="relative grid h-[60px] w-[60px] place-items-center overflow-hidden text-xl font-bold"
                style={{ background: t.surfaceAlt, color: t.text, boxShadow: on ? `${BEVEL}, 0 0 0 2px ${t.accent}` : BEVEL }}>
                <span>{monogram(p)}</span>
                <span className="absolute inset-x-0 bottom-0 h-1.5" style={{ background: cat }} />
                {isProjectNda(p.id) ? <span className="absolute right-0 top-0 bg-black px-0.5 text-[7px] font-bold text-white">NDA</span> : null}
              </span>
              <span className="w-full truncate text-center text-[10px] leading-tight" style={{ color: on ? t.accent : "#c8c8ce" }}>{(d as DirNode).label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MenuBtn({ label, onClick, disabled, t }: { label: string; onClick: () => void; disabled?: boolean; t: DesktopEra["tokens"] }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} className="px-2 py-0.5 text-[11px] font-bold disabled:opacity-40"
      style={{ background: t.surface, color: t.text, boxShadow: BEVEL }}>
      {label}
    </button>
  );
}

const CAT: Record<string, string> = { ai: "#7b2fbe", web: "#1d6fb8", mobile: "#1f9e6b", design: "#c0497a" };
function CATfor(d: FsNode): string {
  return d.kind === "dir" ? CAT[d.project?.category ?? "other"] ?? "#555" : "#555";
}

function DiskGlyph() {
  return (
    <svg width="22" height="18" viewBox="0 0 22 18" aria-hidden>
      <rect x="1" y="1" width="20" height="14" rx="1" fill="#fff" stroke="#000" strokeWidth="1.2" />
      <rect x="4" y="4" width="14" height="3" fill="#000" />
      <path d="M4 11h14" stroke="#000" />
    </svg>
  );
}

function ShelfIcon({ glyph, label, active, accent, onClick, t }: { glyph: React.ReactNode; label: string; active?: boolean; accent?: boolean; onClick: () => void; t: DesktopEra["tokens"] }) {
  return (
    <button type="button" onClick={onClick} className="flex w-[60px] flex-col items-center gap-0.5">
      <span className="grid h-9 w-9 place-items-center" style={{ background: active ? t.accent : accent ? t.accent : t.surface, color: active || accent ? t.accentText : t.text, boxShadow: BEVEL }}>
        {glyph}
      </span>
      <span className="w-full truncate text-center text-[10px]" style={{ color: active ? t.accent : t.textMuted }}>{label}</span>
    </button>
  );
}

function Column({ children, border }: { children: React.ReactNode; border?: boolean }) {
  return (
    <div
      data-column
      className={`min-h-0 overflow-y-auto py-0.5 [scrollbar-width:thin] ${border ? "border-b border-[#6a6a70] sm:border-b-0 sm:border-r" : ""}`}
    >
      {children}
    </div>
  );
}

/** NeXT browser keys: ↑/↓ move within a column (and select), ←/→ hop between columns. */
function browseKeys(e: React.KeyboardEvent<HTMLDivElement>) {
  const cols = [...e.currentTarget.querySelectorAll<HTMLElement>("[data-column]")];
  const col = cols.findIndex((c) => c.contains(document.activeElement));
  if (col < 0) return;
  const rows = (i: number) => [...cols[i].querySelectorAll<HTMLButtonElement>("button")];
  if (e.key === "ArrowDown" || e.key === "ArrowUp") {
    const list = rows(col);
    const next = list[list.indexOf(document.activeElement as HTMLButtonElement) + (e.key === "ArrowDown" ? 1 : -1)];
    if (!next) return;
    e.preventDefault();
    next.focus();
    next.click();
  } else if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
    const target = cols[col + (e.key === "ArrowRight" ? 1 : -1)];
    if (!target) return;
    const list = rows(cols.indexOf(target));
    const next = list.find((b) => b.getAttribute("aria-current")) ?? list[0];
    if (!next) return;
    e.preventDefault();
    next.focus();
  }
}

function Row({ children, active, accent, text, onClick, onDouble }: { children: React.ReactNode; active: boolean; accent: string; text: string; onClick: () => void; onDouble?: () => void }) {
  return (
    <button type="button" onClick={onClick} onDoubleClick={onDouble} aria-current={active || undefined} className="flex w-full items-center gap-1.5 px-2 py-[5px] text-left text-[12px]" style={{ background: active ? accent : "transparent", color: active ? "#fff" : text }}>
      {children}
    </button>
  );
}

function Preview({ node, t }: { node: FsNode | null; t: DesktopEra["tokens"] }) {
  if (!node) return <div className="px-3 py-3 text-[12px]" style={{ color: t.textMuted }}>select a file to preview</div>;
  if (node.kind === "link") {
    return (
      <div className="flex flex-col items-start gap-2 px-3 py-3 text-[12px]" style={{ color: "#000" }}>
        <span className="text-2xl">{linkGlyph(node.linkType)}</span>
        <p className="font-bold">{node.label}</p>
        <p className="break-all" style={{ color: "#555" }}>{node.href}</p>
        <a href={node.href} target="_blank" rel="noopener noreferrer" className="px-3 py-1 text-[12px] font-bold" style={{ background: t.accent, color: t.accentText, boxShadow: BEVEL }}>Open ▸</a>
      </div>
    );
  }
  const doc = node as DocNode;
  return (
    <div className="max-w-[68ch] px-5 py-4">
      <p className="mb-2 border-b border-[#ccc] pb-1 text-[12px] font-bold" style={{ color: "#000" }}>{doc.name}</p>
      <DocBody lines={doc.lines} skin="classic" t={t} />
    </div>
  );
}
