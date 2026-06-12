"use client";

import { isProjectNda } from "@/data/project-media";
import type { DesktopEra, Project } from "./types";

interface ProjectCaseStudyProps {
  readonly project: Project;
  readonly era: DesktopEra;
}

/** Link types presented as desktop files — glyph, label, file extension. */
const LINK_FILE: Record<string, { label: string; ext: string; glyph: string }> = {
  live: { label: "Live site", ext: "url", glyph: "🌐" },
  demo: { label: "Demo", ext: "app", glyph: "▶" },
  figma: { label: "Figma", ext: "fig", glyph: "✎" },
  behance: { label: "Behance", ext: "gallery", glyph: "Bē" },
  github: { label: "Source", ext: "git", glyph: "⌥" },
};

function FileIcon({
  glyph,
  name,
  ext,
  href,
  t,
}: {
  glyph: string;
  name: string;
  ext: string;
  href?: string;
  t: DesktopEra["tokens"];
}) {
  const inner = (
    <>
      <span
        className="grid h-11 w-11 place-items-center text-[18px]"
        style={{
          background: href
            ? `color-mix(in srgb, ${t.accent} 16%, transparent)`
            : "transparent",
          border: `1px solid ${href ? t.accent : t.border}`,
          borderRadius: 8,
          color: href ? t.accent : t.textMuted,
        }}
      >
        {glyph}
      </span>
      <span className="w-full truncate text-center text-[10px] leading-tight" style={{ color: t.textMuted }}>
        {name}.<span style={{ color: href ? t.accent : t.textMuted }}>{ext}</span>
      </span>
    </>
  );

  if (!href) {
    return <div className="flex w-[64px] flex-col items-center gap-1">{inner}</div>;
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex w-[64px] flex-col items-center gap-1 outline-none transition-transform hover:-translate-y-0.5"
    >
      {inner}
    </a>
  );
}

/** Era-neutral case study body — palette comes from the surrounding window. */
export function ProjectCaseStudy({ project, era }: ProjectCaseStudyProps) {
  const t = era.tokens;
  const nda = isProjectNda(project.id);
  const links = Object.entries(project.links ?? {}).filter(
    ([, v]) => typeof v === "string" && v.length > 0,
  ) as [string, string][];

  return (
    <div
      className="flex flex-col gap-4 px-5 py-4 text-[13px] leading-relaxed"
      style={{ color: t.text, fontFamily: era.fontBody }}
    >
      {/* meta row */}
      <div className="flex flex-wrap items-center gap-2">
        <span
          className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.16em]"
          style={{ background: t.accent, color: t.accentText, borderRadius: 3 }}
        >
          {project.category}
        </span>
        <span className="text-[11px] uppercase tracking-[0.12em]" style={{ color: t.textMuted }}>
          {project.role}
        </span>
        <span style={{ color: t.textMuted }}>·</span>
        <span className="text-[11px] uppercase tracking-[0.12em]" style={{ color: t.textMuted }}>
          {project.timeline.duration}
        </span>
        {nda ? (
          <span
            className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
            style={{ border: `1px solid ${t.accent}`, color: t.accent, borderRadius: 3 }}
          >
            NDA
          </span>
        ) : null}
      </div>

      <p style={{ color: t.text }}>{project.longDescription ?? project.description}</p>

      {project.metrics?.impact ? (
        <div
          className="flex items-start gap-2 px-3 py-2"
          style={{
            background: `color-mix(in srgb, ${t.accent} 14%, transparent)`,
            border: `1px solid color-mix(in srgb, ${t.accent} 40%, transparent)`,
            borderRadius: 4,
          }}
        >
          <span style={{ color: t.accent }}>★</span>
          <span style={{ color: t.text }}>{project.metrics.impact}</span>
        </div>
      ) : null}

      {project.features?.length ? (
        <div>
          <p
            className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.18em]"
            style={{ color: t.textMuted }}
          >
            What I built
          </p>
          <ul className="flex flex-col gap-1">
            {project.features.slice(0, 5).map((f) => (
              <li key={f} className="flex gap-2" style={{ color: t.text }}>
                <span style={{ color: t.accent }}>›</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {project.technologies?.length ? (
        <div className="flex flex-wrap gap-1.5">
          {project.technologies.map((tech) => (
            <span
              key={tech}
              className="px-2 py-0.5 text-[10px] uppercase tracking-wide"
              style={{ border: `1px solid ${t.border}`, color: t.textMuted, borderRadius: 3 }}
            >
              {tech}
            </span>
          ))}
        </div>
      ) : null}

      {/* Files & links — rendered as desktop files */}
      <div>
        <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: t.textMuted }}>
          Files
        </p>
        <div className="flex flex-wrap gap-3">
          <FileIcon glyph="📄" name={project.id} ext="md" t={t} />
          {links.map(([k, href]) => {
            const meta = LINK_FILE[k] ?? { label: k, ext: "url", glyph: "🔗" };
            return <FileIcon key={k} glyph={meta.glyph} name={meta.label.toLowerCase().replace(/\s+/g, "-")} ext={meta.ext} href={href} t={t} />;
          })}
        </div>
        {links.length === 0 ? (
          <p className="mt-1.5 text-[11px]" style={{ color: t.textMuted }}>
            {nda ? "Case visuals withheld under NDA." : "Private build — links on request."}
          </p>
        ) : null}
      </div>
    </div>
  );
}
