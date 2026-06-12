"use client";

import { getProjectCoverLabel } from "@/data/project-media";

export type ProjectCategory = "ai" | "design" | "web" | "mobile";

const CATEGORY_META: Record<ProjectCategory, { label: string; hue: number }> = {
  ai: { label: "AI / ML", hue: 188 },
  design: { label: "Product Design", hue: 330 },
  web: { label: "Web / Frontend", hue: 218 },
  mobile: { label: "Mobile", hue: 152 },
};

function normalizeCategory(category: string): ProjectCategory {
  if (category === "ai" || category === "design" || category === "web" || category === "mobile") {
    return category;
  }
  return "web";
}

/** Stable 32-bit hash so every project gets a deterministic, unique cover. */
function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Up to two-letter monogram from the cover label. */
function monogram(name: string): string {
  const words = name.replace(/[^a-zA-Z0-9 ]/g, "").trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "·";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

function CategoryGlyph({ category, color }: { readonly category: ProjectCategory; readonly color: string }) {
  const common = {
    fill: "none",
    stroke: color,
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  if (category === "ai") {
    return (
      <g {...common}>
        <circle cx="9" cy="9" r="3.4" />
        <path d="M9 1.5v2M9 14.5v2M1.5 9h2M14.5 9h2M3.7 3.7l1.4 1.4M12.9 12.9l1.4 1.4M14.3 3.7l-1.4 1.4M5.1 12.9l-1.4 1.4" />
      </g>
    );
  }
  if (category === "design") {
    return (
      <g {...common}>
        <path d="M2.5 14.5c2-7 11-7 13 0" />
        <path d="M5 11l4-8 5 6" />
        <circle cx="14" cy="3" r="1.4" fill={color} stroke="none" />
      </g>
    );
  }
  if (category === "web") {
    return (
      <g {...common}>
        <rect x="2" y="3.5" width="14" height="11" rx="1.6" />
        <path d="M2 6.6h14" />
        <path d="M6.5 9.5l-1.8 1.6 1.8 1.6M11.5 9.5l1.8 1.6-1.8 1.6" strokeWidth="1.3" />
      </g>
    );
  }
  return (
    <g {...common}>
      <rect x="5" y="1.5" width="8" height="15" rx="2" />
      <path d="M8 14h2" />
    </g>
  );
}

/** Deterministic pattern layer — one of several, picked by the project hash. */
function PatternLayer({ variant, color }: { readonly variant: number; readonly color: string }) {
  const v = variant % 6;
  if (v === 0) {
    // concentric rings
    return (
      <g stroke={color} fill="none" strokeWidth="1">
        {[18, 34, 50, 66, 82, 98].map((r) => (
          <circle key={r} cx="330" cy="92" r={r} opacity={0.5 - r / 320} />
        ))}
      </g>
    );
  }
  if (v === 1) {
    // dot matrix
    return (
      <g fill={color}>
        {Array.from({ length: 7 }).map((_, row) =>
          Array.from({ length: 16 }).map((__, col) => (
            <circle
              key={`${row}-${col}`}
              cx={28 + col * 26}
              cy={26 + row * 22}
              r={1.6}
              opacity={0.18 + ((row + col) % 3) * 0.06}
            />
          )),
        )}
      </g>
    );
  }
  if (v === 2) {
    // diagonal bars
    return (
      <g stroke={color} strokeWidth="10" opacity="0.14">
        {Array.from({ length: 9 }).map((_, i) => (
          <line key={i} x1={-60 + i * 64} y1={200} x2={80 + i * 64} y2={-40} />
        ))}
      </g>
    );
  }
  if (v === 3) {
    // sine waves
    return (
      <g stroke={color} fill="none" strokeWidth="1.4">
        {[40, 70, 100, 130].map((y, i) => (
          <path
            key={y}
            d={`M0 ${y} C 70 ${y - 26}, 140 ${y + 26}, 210 ${y} S 350 ${y - 26}, 440 ${y}`}
            opacity={0.32 - i * 0.05}
          />
        ))}
      </g>
    );
  }
  if (v === 4) {
    // node circuit
    const nodes = [
      [60, 50],
      [150, 110],
      [240, 40],
      [320, 120],
      [110, 140],
      [380, 70],
    ];
    return (
      <g stroke={color} fill={color}>
        <g strokeWidth="1" opacity="0.3" fill="none">
          <path d="M60 50 L150 110 L240 40 L320 120 M150 110 L110 140 M320 120 L380 70" />
        </g>
        {nodes.map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r={2.6} opacity={0.55} />
        ))}
      </g>
    );
  }
  // fine grid
  return (
    <g stroke={color} strokeWidth="0.75" opacity="0.16">
      {Array.from({ length: 12 }).map((_, i) => (
        <line key={`v${i}`} x1={i * 38} y1={0} x2={i * 38} y2={184} />
      ))}
      {Array.from({ length: 6 }).map((_, i) => (
        <line key={`h${i}`} x1={0} y1={i * 36} x2={440} y2={i * 36} />
      ))}
    </g>
  );
}

export interface ProjectCategoryCoverProps {
  readonly projectId: string;
  readonly title: string;
  readonly category: string;
}

/**
 * Generative cover art — a unique, on-brand visual per project derived from its
 * id (signature hue + pattern) and category (label + glyph). No two cards repeat.
 */
export function ProjectCategoryCover({ projectId, title, category }: ProjectCategoryCoverProps) {
  const kind = normalizeCategory(category);
  const meta = CATEGORY_META[kind];
  const name = getProjectCoverLabel(projectId, title);
  const h = hashString(projectId);

  // Per-project signature hue, nudged toward the category family for cohesion.
  const hue = (meta.hue + ((h % 48) - 24) + 360) % 360;
  const accent = `hsl(${hue} 85% 64%)`;
  const accentSoft = `hsl(${hue} 70% 58%)`;
  const deep = `hsl(${hue} 60% 12%)`;
  const deeper = `hsl(${(hue + 18) % 360} 55% 7%)`;
  const gid = `pcg-${projectId.replace(/[^a-z0-9]/gi, "")}`;

  return (
    <div className="absolute inset-0 overflow-hidden">
      <svg
        viewBox="0 0 440 184"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
        aria-hidden
      >
        <defs>
          <linearGradient id={`${gid}-bg`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={deep} />
            <stop offset="55%" stopColor={deeper} />
            <stop offset="100%" stopColor="#05070b" />
          </linearGradient>
          <radialGradient id={`${gid}-glow`} cx="78%" cy="22%" r="80%">
            <stop offset="0%" stopColor={accentSoft} stopOpacity="0.45" />
            <stop offset="55%" stopColor={accentSoft} stopOpacity="0.08" />
            <stop offset="100%" stopColor={accentSoft} stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`${gid}-fade`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="55%" stopColor="#05070b" stopOpacity="0" />
            <stop offset="100%" stopColor="#05070b" stopOpacity="0.85" />
          </linearGradient>
        </defs>

        <rect width="440" height="184" fill={`url(#${gid}-bg)`} />
        <rect width="440" height="184" fill={`url(#${gid}-glow)`} />
        <PatternLayer variant={h} color={accent} />

        {/* monogram watermark */}
        <text
          x="30"
          y="150"
          fontSize="120"
          fontWeight="800"
          fontFamily="var(--font-heading), monospace"
          fill={accent}
          opacity="0.12"
          letterSpacing="-4"
        >
          {monogram(name)}
        </text>

        <rect width="440" height="184" fill={`url(#${gid}-fade)`} />
      </svg>

      {/* category glyph + label, top-right */}
      <div className="absolute right-4 top-4 flex items-center gap-1.5">
        <svg width="18" height="18" viewBox="0 0 18 18">
          <CategoryGlyph category={kind} color={accent} />
        </svg>
        <span
          className="text-[9px] font-bold uppercase tracking-[0.22em]"
          style={{ color: accent }}
        >
          {meta.label}
        </span>
      </div>

      {/* project name, bottom-left */}
      <p
        className="absolute bottom-3 left-4 right-4 truncate text-[13px] font-bold uppercase tracking-[0.14em]"
        style={{ color: "rgba(255,255,255,0.92)", fontFamily: "var(--font-heading)" }}
      >
        {name}
      </p>
    </div>
  );
}

export function isRasterThumbnail(src: string): boolean {
  return /\.(jpe?g|png|webp|gif|avif)(\?|$)/i.test(src);
}
