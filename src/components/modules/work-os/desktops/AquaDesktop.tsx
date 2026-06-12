"use client";

import { useMemo, useState } from "react";
import { isProjectNda } from "@/data/project-media";
import { buildWorkDir, linkGlyph } from "../work-fs";
import type { DirNode, DocNode, FsNode, LinkNode } from "../work-fs";
import { label, monogram } from "../helpers";
import { DocBody } from "../DocBody";
import type { DesktopEra, Project } from "../types";

/** 2006 — Mac OS X Aqua. Finder column view + sidebar + Quick Look. */
export function AquaDesktop({ era, projects }: { era: DesktopEra; projects: Project[] }) {
  const t = era.tokens;
  const root = useMemo(() => buildWorkDir(projects, era.id), [projects]);
  const [proj, setProj] = useState<DirNode | null>(null);
  const [file, setFile] = useState<FsNode | null>(null);
  const [quick, setQuick] = useState<DocNode | null>(null);

  const pick = (d: DirNode) => { setProj(d); setFile(null); };
  const openFile = (n: FsNode) => {
    if (n.kind === "link") globalThis.open(n.href, "_blank", "noopener,noreferrer");
    else if (n.kind === "doc") setQuick(n);
  };

  return (
    <div className="relative flex h-full flex-col" style={{ fontFamily: era.fontUi }}>
      {/* menu bar */}
      <div className="z-20 flex items-center gap-4 px-4 py-1 text-[13px]" style={{ background: "rgba(255,255,255,0.55)", backdropFilter: "blur(14px)", borderBottom: "1px solid rgba(0,0,0,0.12)", color: "#1a1a1a" }}>
        <span aria-hidden></span>
        <span className="font-bold">Finder</span>
        {["File", "Edit", "View", "Go"].map((m) => <span key={m}>{m}</span>)}
        <span className="ml-auto tabular-nums">{era.brand} · {era.year}</span>
      </div>

      <div className="relative min-h-0 flex-1 overflow-hidden" style={{ background: t.wallpaper }}>
        {/* Finder window */}
        <div className="absolute left-4 right-4 top-4 bottom-[88px] flex flex-col overflow-hidden rounded-[10px]" style={{ border: "1px solid rgba(0,0,0,0.3)", boxShadow: "0 20px 60px rgba(0,0,0,0.45)", background: "#ececec" }}>
          {/* title bar */}
          <div className="flex items-center gap-2 px-3 py-1.5" style={{ background: "linear-gradient(#e8e8e8,#cfcfcf)", borderBottom: "1px solid rgba(0,0,0,0.18)" }}>
            <span className="h-3 w-3 rounded-full" style={{ background: "#ff5f57" }} />
            <span className="h-3 w-3 rounded-full" style={{ background: "#febc2e" }} />
            <span className="h-3 w-3 rounded-full" style={{ background: "#28c840" }} />
            <span className="flex-1 text-center text-[13px] font-semibold" style={{ color: "#2a2a2a" }}>{proj ? proj.label : "Work"}</span>
            <span className="text-[11px]" style={{ color: "#6a6a6a" }}>Column view</span>
          </div>

          <div className="flex min-h-0 flex-1">
            {/* sidebar */}
            <div className="w-[128px] shrink-0 overflow-y-auto p-2 text-[12px]" style={{ background: "linear-gradient(#dfe6ef,#cfd9e6)", borderRight: "1px solid #b3bdca" }}>
              <p className="px-1 pb-1 text-[9px] font-bold uppercase tracking-wider" style={{ color: "#7a8494" }}>Places</p>
              <button type="button" onClick={() => { setProj(null); setFile(null); }} className="mb-1 flex w-full items-center gap-1.5 rounded px-1.5 py-0.5 text-left" style={{ background: proj ? "transparent" : "#3b74e0", color: proj ? "#1a1a1a" : "#fff" }}>💼 Work</button>
              <p className="px-1 pb-1 pt-1 text-[9px] font-bold uppercase tracking-wider" style={{ color: "#7a8494" }}>Projects</p>
              {root.children.map((d) => {
                const on = proj?.name === d.name;
                return (
                  <button key={d.name} type="button" onClick={() => pick(d as DirNode)} className="flex w-full items-center gap-1.5 truncate rounded px-1.5 py-0.5 text-left" style={{ background: on ? "#3b74e0" : "transparent", color: on ? "#fff" : "#1a1a1a" }}>
                    <span className="grid h-4 w-4 shrink-0 place-items-center rounded text-[9px] font-bold text-white" style={{ background: t.accent }}>{monogram((d as DirNode).project as Project)}</span>
                    <span className="truncate">{(d as DirNode).label}</span>
                  </button>
                );
              })}
            </div>

            {/* column browser */}
            <div className="grid min-h-0 flex-1 grid-cols-3 bg-white">
              <AquaCol border>
                {root.children.map((d) => (
                  <AquaRow key={d.name} active={proj?.name === d.name} onClick={() => pick(d as DirNode)}>
                    <span className="grid h-4 w-4 place-items-center rounded text-[9px] font-bold text-white" style={{ background: t.accent }}>{monogram((d as DirNode).project as Project)}</span>
                    <span className="flex-1 truncate">{(d as DirNode).label}</span>
                    <span className="opacity-50">›</span>
                  </AquaRow>
                ))}
              </AquaCol>
              <AquaCol border>
                {proj ? proj.children.map((n) => (
                  <AquaRow key={n.name} active={file?.name === n.name} onClick={() => setFile(n)} onDouble={() => openFile(n)}>
                    <span className="w-4 text-center">{n.kind === "link" ? linkGlyph((n as LinkNode).linkType) : "📄"}</span>
                    <span className="flex-1 truncate">{n.name}</span>
                  </AquaRow>
                )) : <Hint>Select a project</Hint>}
              </AquaCol>
              <div className="min-h-0 overflow-y-auto">
                <AquaPreview node={file} accent={t.accent} onQuickLook={(d) => setQuick(d)} />
              </div>
            </div>
          </div>
        </div>

        {/* dock */}
        <div className="pointer-events-none absolute inset-x-0 bottom-2 z-10 flex justify-center">
          <div className="pointer-events-auto flex items-end gap-1.5 px-3 py-1.5" style={{ background: "rgba(255,255,255,0.32)", border: "1px solid rgba(255,255,255,0.6)", borderRadius: 20, backdropFilter: "blur(12px)", boxShadow: "0 10px 30px rgba(0,0,0,0.35)" }}>
            {root.children.slice(0, 10).map((d) => {
              const on = proj?.name === d.name;
              return (
                <button key={d.name} type="button" onClick={() => pick(d as DirNode)} title={label((d as DirNode).project as Project)} className="grid h-12 w-12 origin-bottom place-items-center text-lg font-extrabold transition-transform duration-150 hover:-translate-y-3 hover:scale-[1.45]"
                  style={{
                    background: `linear-gradient(180deg, color-mix(in srgb, ${t.accent} 58%, #fff) 0%, ${t.accent} 52%, color-mix(in srgb, ${t.accent} 78%, #000) 100%)`,
                    color: t.accentText,
                    borderRadius: 12,
                    boxShadow: `inset 0 1px 0 rgba(255,255,255,0.9), 0 0 0 1px rgba(0,0,0,0.15), 0 3px 8px rgba(0,0,0,0.45)${on ? ", 0 0 0 2px #fff" : ""}`,
                    textShadow: t.accentText === "#ffffff" ? "0 1px 2px rgba(0,0,0,0.45)" : "none",
                  }}>
                  {monogram((d as DirNode).project as Project)}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Look */}
      {quick ? (
        <div className="absolute inset-0 z-30 grid place-items-center p-6" style={{ background: "rgba(0,0,0,0.5)" }} onClick={() => setQuick(null)}>
          <div className="flex max-h-[84%] w-[min(540px,92%)] flex-col overflow-hidden rounded-xl" style={{ background: "rgba(245,245,245,0.96)", boxShadow: "0 30px 80px rgba(0,0,0,0.6)" }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 px-4 py-2" style={{ background: "linear-gradient(#3a3a3a,#2a2a2a)", color: "#fff" }}>
              <button type="button" onClick={() => setQuick(null)} aria-label="Close" className="h-3 w-3 rounded-full" style={{ background: "#ff5f57" }} />
              <span className="flex-1 text-center text-[13px] font-semibold">{quick.name}</span>
              <span className="w-3" />
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-5">
              <DocBody lines={quick.lines} skin="glossy" t={t} />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function AquaCol({ children, border }: { children: React.ReactNode; border?: boolean }) {
  return <div className="min-h-0 overflow-y-auto py-1" style={border ? { borderRight: "1px solid #d4d4d4" } : undefined}>{children}</div>;
}

function AquaRow({ children, active, onClick, onDouble }: { children: React.ReactNode; active: boolean; onClick: () => void; onDouble?: () => void }) {
  return (
    <button type="button" onClick={onClick} onDoubleClick={onDouble} className="flex w-full items-center gap-2 px-2 py-1 text-left text-[12px]" style={{ background: active ? "#3b74e0" : "transparent", color: active ? "#fff" : "#1a1a1a" }}>
      {children}
    </button>
  );
}

function Hint({ children }: { children: React.ReactNode }) {
  return <div className="px-2 py-2 text-[12px]" style={{ color: "#9a9a9a" }}>{children}</div>;
}

function AquaPreview({ node, accent, onQuickLook }: { node: FsNode | null; accent: string; onQuickLook: (d: DocNode) => void }) {
  if (!node) return <div className="grid h-full place-items-center px-3 text-center text-[12px]" style={{ color: "#9a9a9a" }}>Select a file<br />to preview</div>;
  if (node.kind === "link") {
    return (
      <div className="flex flex-col items-center gap-2 px-3 py-5 text-center text-[12px]">
        <span className="text-4xl">{linkGlyph(node.linkType)}</span>
        <p className="font-semibold">{node.label}</p>
        <p className="break-all text-[11px]" style={{ color: "#888" }}>{node.href}</p>
        <a href={node.href} target="_blank" rel="noopener noreferrer" className="rounded-full px-4 py-1 text-[12px] font-semibold text-white" style={{ background: accent }}>Open ↗</a>
      </div>
    );
  }
  const doc = node as DocNode;
  return (
    <div className="flex h-full flex-col px-3 py-3">
      <p className="mb-2 text-center text-[12px] font-semibold" style={{ color: "#333" }}>{doc.name}</p>
      <pre className="min-h-0 flex-1 overflow-y-auto whitespace-pre-wrap text-[11px] leading-[1.5]" style={{ color: "#333" }}>{doc.lines.slice(0, 12).join("\n")}</pre>
      <button type="button" onClick={() => onQuickLook(doc)} className="mt-2 rounded-full py-1 text-[12px] font-semibold text-white" style={{ background: accent }}>Quick Look ⎋</button>
    </div>
  );
}
