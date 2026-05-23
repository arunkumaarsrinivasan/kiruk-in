"use client";

/**
 * BlockEditorHomePage — 2018 archetype: KIRUK · A Workspace.
 *
 * In 2018 the dominant new pattern was the BLOCK-BASED EDITOR. Notion
 * went public in March 2018 and reshaped how people thought about
 * documents — every paragraph, list, toggle, image, database row is a
 * draggable block. Slash commands replaced toolbars. Pages nested
 * inside pages. This profile renders Arun as a Notion workspace:
 * each UX research artifact is a page in the sidebar, the editor
 * canvas renders that page's blocks, and the right rail holds page
 * properties (tags, status, type).
 *
 * 2018 was also the year a11y landed in browsers as a first-class
 * concern (prefers-color-scheme, prefers-reduced-motion). The
 * archetype foregrounds that with a visible a11y toolbar: motion,
 * font size and contrast all live controls.
 *
 * Paradigm versus prior eras:
 *   · 2009 iPhone-skeu = skeuomorphic apps in a device frame
 *   · 2013 pinboard    = flat masonry of flippable cards
 *   · 2018 block-editor = NESTED PAGES + DRAGGABLE BLOCKS + slash menu
 *
 * Unique interactions:
 *   · HTML5 drag-to-reorder blocks within a page
 *   · `/` opens slash command palette (insert block · jump to page)
 *   · Toggle blocks (▸ collapsed → ▾ expanded) for nested content
 *   · Inline @page-mentions cross-link UX artifacts (clickable jumps)
 *   · Page emoji picker + cover gradient picker
 *   · Right rail: page properties (status select, tag chips, date)
 *   · A11y toolbar: motion / font / contrast — applied live via CSS
 *   · Keyboard: ↑ ↓ pages · Cmd/Ctrl+K command palette · ? help
 */

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLayoutMode } from "@/contexts/LayoutModeContext";
import {
  WHY_KIRUK,
  PERSONA,
  EMPATHY_MAP,
  buildTimeline,
  IMPACT_METRICS,
  CARD_SORTING,
  USABILITY_TEST,
} from "../shared/landing-content";

// ── Palette — Notion 2018 white-paper + dark mode ────────────────────

const BG_LIGHT = "#ffffff";
const BG_DIM_LIGHT = "#fbfaf8";
const BG_DARK = "#191919";
const BG_DIM_DARK = "#202020";
const SIDE_LIGHT = "#f7f6f3";
const SIDE_DARK = "#202020";
const INK_LIGHT = "#37352f";
const INK_DARK = "#e8e6e3";
const INK_DIM_LIGHT = "#787774";
const INK_DIM_DARK = "#9a9a9a";
const HAIRLINE_LIGHT = "#ecebe9";
const HAIRLINE_DARK = "#2f2f2f";
const HOVER_LIGHT = "#f2f1ee";
const HOVER_DARK = "#2a2a2a";

const ACC = "#2eaadc"; // Notion blue
const RED = "#e03e3e";
const ORANGE = "#d9730d";
const YELLOW = "#dfab01";
const GREEN = "#0f7b6c";
const PURPLE = "#9065b0";
const PINK = "#ad1a72";
const BROWN = "#64473a";

const FONT_UI = "'Inter', 'Segoe UI', 'Helvetica Neue', sans-serif";
const FONT_DISPLAY = "'Inter', 'Segoe UI', 'Helvetica Neue', sans-serif";
const FONT_MONO = "'JetBrains Mono', 'SFMono-Regular', 'Menlo', 'Courier New', monospace";

// ── Page model ───────────────────────────────────────────────────────

type PageId =
  | "intro"
  | "persona"
  | "empathy"
  | "journey"
  | "impact"
  | "works"
  | "contact"
  | "compass"
  | "today";

type BlockKind =
  | "h1"
  | "h2"
  | "h3"
  | "p"
  | "quote"
  | "callout"
  | "toggle"
  | "bullet"
  | "numbered"
  | "todo"
  | "divider"
  | "code"
  | "data"
  | "columns";

interface BlockData {
  id: string;
  kind: BlockKind;
  // Optional payload — interpreted per kind
  text?: string;
  emoji?: string;
  items?: string[];
  body?: React.ReactNode;
  href?: PageId; // for @-mention sentinel
  toggleChildren?: BlockData[];
  language?: string;
}

interface Page {
  id: PageId;
  emoji: string;
  title: string;
  status: "Live" | "Draft" | "Archived";
  type: "Persona" | "Empathy Map" | "Journey Map" | "Impact" | "Card Sort" | "Usability Test" | "Manifesto" | "Today";
  cover: string; // gradient
  tags: string[];
  blocks: BlockData[];
}

function buildPages(): Page[] {
  const nodes = buildTimeline();
  return [
    {
      id: "intro",
      emoji: "📄",
      title: "Welcome · A workspace about one designer",
      status: "Live",
      type: "Manifesto",
      cover: "linear-gradient(135deg, #6e95d6 0%, #2eaadc 100%)",
      tags: ["thesis", "meta", "ux research"],
      blocks: [
        {
          id: "b-h",
          kind: "h1",
          text: "A workspace about one designer.",
        },
        {
          id: "b-callout",
          kind: "callout",
          emoji: "🪞",
          text:
            "Every page in this workspace is a UX research artifact applied inward. The user being studied is the designer himself. Drag blocks to rearrange. Press / for the command menu. Mention pages with @.",
        },
        {
          id: "b-hook",
          kind: "p",
          text: WHY_KIRUK.hook,
        },
        {
          id: "b-pain",
          kind: "p",
          text: `${WHY_KIRUK.pain} ${WHY_KIRUK.bridge}`,
        },
        {
          id: "b-quote",
          kind: "quote",
          text: WHY_KIRUK.tagline,
        },
        { id: "b-div", kind: "divider" },
        {
          id: "b-h2",
          kind: "h2",
          text: "Read order",
        },
        {
          id: "b-list",
          kind: "numbered",
          items: [
            "Persona — who the subject is",
            "Empathy Map — how he works",
            "Journey Map — how he got here",
            "Impact — what the work moved",
            "Selected Works — what shipped",
            "Contact — how to start",
          ],
        },
        {
          id: "b-toggle-faq",
          kind: "toggle",
          text: "Why a workspace, not a portfolio?",
          toggleChildren: [
            {
              id: "b-toggle-p",
              kind: "p",
              text:
                "A portfolio markets a designer. A workspace shows how he thinks. The block format lets the visitor reorder, fork, and read in any sequence — same way the designer himself uses the tool every day.",
            },
          ],
        },
      ],
    },
    {
      id: "persona",
      emoji: "🧍",
      title: "Persona · Subject of the study",
      status: "Live",
      type: "Persona",
      cover: "linear-gradient(135deg, #ec668a 0%, #ad1a72 100%)",
      tags: ["persona", "identity"],
      blocks: [
        { id: "p-h", kind: "h1", text: "Persona · Subject of the study" },
        {
          id: "p-callout",
          kind: "callout",
          emoji: "🔎",
          text:
            "A persona is normally fictional — a stand-in for a real user. Drawn on the designer himself, every entry becomes diagnostic.",
        },
        { id: "p-h2", kind: "h2", text: "Fact sheet" },
        {
          id: "p-data",
          kind: "data",
          body: (
            <DataTable
              rows={[
                ["Name", PERSONA.identity.name],
                ["Role", PERSONA.identity.role],
                ["Employer", PERSONA.identity.org],
                ["Location", PERSONA.identity.location],
                ["Born", "Salem, Tamil Nadu · 2001"],
                ["Type", "Designer ↔ Engineer · bridge"],
              ]}
            />
          ),
        },
        { id: "p-h3", kind: "h3", text: "On the record" },
        { id: "p-quote", kind: "quote", text: PERSONA.quote },
        {
          id: "p-cols",
          kind: "columns",
          body: (
            <TwoCol
              left={{ head: "GOALS", color: GREEN, items: [...PERSONA.goals], marker: "▸" }}
              right={{ head: "FRUSTRATIONS", color: RED, items: [...PERSONA.frustrations], marker: "✕" }}
            />
          ),
        },
        { id: "p-h3b", kind: "h3", text: "Background" },
        { id: "p-bg", kind: "p", text: PERSONA.background },
        {
          id: "p-toggle",
          kind: "toggle",
          text: "What this means",
          toggleChildren: [
            {
              id: "p-toggle-p",
              kind: "p",
              text:
                "The frustrations column is the diagnostic clue. Every line is a friction a single-discipline practitioner could tolerate. He refused to. The bridge role is the engine that refusal turned into.",
            },
          ],
        },
      ],
    },
    {
      id: "empathy",
      emoji: "🧭",
      title: "Empathy Map · How he works",
      status: "Live",
      type: "Empathy Map",
      cover: "linear-gradient(135deg, #b298dc 0%, #9065b0 100%)",
      tags: ["empathy map", "synthesis"],
      blocks: [
        { id: "e-h", kind: "h1", text: "Empathy Map · Says · Thinks · Does · Feels" },
        {
          id: "e-callout",
          kind: "callout",
          emoji: "🔁",
          text:
            "Four columns of the same person, cross-cut. The trick is to read across the seam — do Says and Does tell the same story?",
        },
        {
          id: "e-grid",
          kind: "data",
          body: (
            <Quad4
              says={EMPATHY_MAP.says.quote}
              skills={EMPATHY_MAP.says.skills.join(" · ")}
              thinks={[...EMPATHY_MAP.thinks]}
              does={[...EMPATHY_MAP.does]}
              feels={[...EMPATHY_MAP.feels]}
            />
          ),
        },
        { id: "e-h2", kind: "h2", text: "Synthesis" },
        {
          id: "e-p",
          kind: "p",
          text:
            "Says and Does agree. He claims the bridge role; the tools in rotation cross the same line. That convergence is what makes the persona believable.",
        },
        {
          id: "e-mention",
          kind: "p",
          text: "@compass holds the operating rules in finer detail.",
        },
      ],
    },
    {
      id: "compass",
      emoji: "🧮",
      title: "Compass · Operating rules",
      status: "Live",
      type: "Manifesto",
      cover: "linear-gradient(135deg, #6abfd6 0%, #0f7b6c 100%)",
      tags: ["compass", "operating rules"],
      blocks: [
        { id: "c-h", kind: "h1", text: "Operating compass" },
        {
          id: "c-callout",
          kind: "callout",
          emoji: "🎯",
          text:
            "Three rules the work keeps returning to. Not aphorisms — filters that decide what gets a frame, what gets a route, what gets cut.",
        },
        {
          id: "c-bullets",
          kind: "bullet",
          items: [...EMPATHY_MAP.thinks],
        },
        { id: "c-h2", kind: "h2", text: "Today" },
        {
          id: "c-todo",
          kind: "todo",
          items: [
            "ship persona page",
            "wire empathy quadrants",
            "publish journey map",
            "review contact channels",
          ],
        },
      ],
    },
    {
      id: "journey",
      emoji: "🗺",
      title: "Journey Map · Career lifeline",
      status: "Live",
      type: "Journey Map",
      cover: "linear-gradient(135deg, #f5b478 0%, #d9730d 100%)",
      tags: ["journey map", "career"],
      blocks: [
        { id: "j-h", kind: "h1", text: "Career lifeline · 2018 → now" },
        {
          id: "j-callout",
          kind: "callout",
          emoji: "↗",
          text:
            "Seven years rendered as five phases. Read as one ramp — design and engineering ran in parallel for most of the way.",
        },
        {
          id: "j-grid",
          kind: "data",
          body: <Timeline nodes={nodes} />,
        },
        { id: "j-h2", kind: "h2", text: "Pattern" },
        {
          id: "j-p",
          kind: "p",
          text:
            "Linear on paper, parallel in practice. The bridge role only existed in a job title after the timelines collided.",
        },
      ],
    },
    {
      id: "impact",
      emoji: "📊",
      title: "Impact · By the numbers",
      status: "Live",
      type: "Impact",
      cover: "linear-gradient(135deg, #74cc91 0%, #0f7b6c 100%)",
      tags: ["impact", "outcomes"],
      blocks: [
        { id: "i-h", kind: "h1", text: "Impact · By the numbers" },
        {
          id: "i-callout",
          kind: "callout",
          emoji: "🧾",
          text:
            "Outcomes only. Each figure pairs with a shipped surface before it lands here. Receipts, not slides.",
        },
        {
          id: "i-data",
          kind: "data",
          body: <Metrics metrics={IMPACT_METRICS.slice(0, 8)} />,
        },
      ],
    },
    {
      id: "works",
      emoji: "🗂",
      title: "Selected Works · Plates I-IV",
      status: "Live",
      type: "Card Sort",
      cover: "linear-gradient(135deg, #91c8e8 0%, #2eaadc 100%)",
      tags: ["works", "case studies"],
      blocks: [
        { id: "w-h", kind: "h1", text: "Selected Works" },
        {
          id: "w-callout",
          kind: "callout",
          emoji: "🖼",
          text:
            "Four shipped projects, sorted by category. Each card carries title, brief, duration, role and stack.",
        },
        {
          id: "w-data",
          kind: "data",
          body: <Works projects={[...CARD_SORTING.projects]} />,
        },
      ],
    },
    {
      id: "contact",
      emoji: "✉",
      title: "Contact · Engagement protocol",
      status: "Live",
      type: "Usability Test",
      cover: "linear-gradient(135deg, #f8b1c2 0%, #ad1a72 100%)",
      tags: ["contact", "channels"],
      blocks: [
        { id: "co-h", kind: "h1", text: "Engagement protocol" },
        {
          id: "co-callout",
          kind: "callout",
          emoji: "📥",
          text:
            "Four channels ranked by question type. Latency before politeness.",
        },
        {
          id: "co-data",
          kind: "data",
          body: <Channels channels={[...USABILITY_TEST.channels]} success={[...USABILITY_TEST.successMetrics]} />,
        },
      ],
    },
    {
      id: "today",
      emoji: "📅",
      title: "Today · Daily standup",
      status: "Draft",
      type: "Today",
      cover: "linear-gradient(135deg, #ffd866 0%, #dfab01 100%)",
      tags: ["today", "standup"],
      blocks: [
        { id: "t-h", kind: "h1", text: "Standup · " + new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" }) },
        {
          id: "t-callout",
          kind: "callout",
          emoji: "🌤",
          text: "Yesterday, today, blockers — the three-line standup format applied to this disc's build.",
        },
        { id: "t-h2", kind: "h2", text: "Yesterday" },
        {
          id: "t-bul1",
          kind: "bullet",
          items: ["Shipped @persona", "Wired @empathy quad", "Tested @impact tiles"],
        },
        { id: "t-h2b", kind: "h2", text: "Today" },
        {
          id: "t-bul2",
          kind: "bullet",
          items: ["Polish @journey timeline", "Add @contact channels", "Write @intro callout"],
        },
        { id: "t-h2c", kind: "h2", text: "Blockers" },
        {
          id: "t-bul3",
          kind: "bullet",
          items: ["none · ship before the next era loads"],
        },
      ],
    },
  ];
}

// ── Shared block helpers ─────────────────────────────────────────────

function DataTable({ rows }: { rows: Array<[string, string]> }) {
  return (
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
      <tbody>
        {rows.map(([k, v], i) => (
          <tr key={k}>
            <td
              style={{
                width: 130,
                padding: "5px 8px",
                color: "var(--km-ink-dim)",
                borderBottom: `1px solid var(--km-hairline)`,
                fontWeight: 500,
                fontSize: 13,
              }}
            >
              {k}
            </td>
            <td
              style={{
                padding: "5px 8px",
                borderBottom: `1px solid var(--km-hairline)`,
              }}
            >
              {v}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function TwoCol({
  left,
  right,
}: {
  left: { head: string; color: string; items: string[]; marker: string };
  right: { head: string; color: string; items: string[]; marker: string };
}) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
      {[left, right].map((col, ci) => (
        <div
          key={ci}
          style={{
            padding: "10px 12px",
            border: `1px solid var(--km-hairline)`,
            borderRadius: 6,
            background: "var(--km-bg-dim)",
          }}
        >
          <div
            style={{
              fontFamily: FONT_DISPLAY,
              fontSize: 10,
              letterSpacing: 1.5,
              color: col.color,
              textTransform: "uppercase",
              fontWeight: 600,
              marginBottom: 5,
            }}
          >
            {col.head}
          </div>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {col.items.map((it) => (
              <li
                key={it}
                style={{
                  display: "flex",
                  gap: 6,
                  fontSize: 13,
                  marginBottom: 3,
                }}
              >
                <span style={{ color: col.color }}>{col.marker}</span>
                <span>{it}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function Quad4({
  says,
  skills,
  thinks,
  does,
  feels,
}: {
  says: string;
  skills: string;
  thinks: string[];
  does: string[];
  feels: string[];
}) {
  const quads = [
    { head: "Says", color: ACC, body: <><em>&ldquo;{says}&rdquo;</em><div style={{ color: "var(--km-ink-dim)", marginTop: 4, fontSize: 12 }}>{skills}</div></> },
    { head: "Thinks", color: PURPLE, body: thinks.map((t) => <div key={t}>· {t}</div>) },
    { head: "Does", color: ORANGE, body: does.join(" · ") },
    { head: "Feels", color: GREEN, body: feels.map((f) => <div key={f}>· {f}</div>) },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
      {quads.map((q) => (
        <div
          key={q.head}
          style={{
            padding: "10px 12px",
            border: `1px solid var(--km-hairline)`,
            borderRadius: 6,
            background: "var(--km-bg-dim)",
          }}
        >
          <div
            style={{
              fontFamily: FONT_DISPLAY,
              fontSize: 11,
              fontWeight: 600,
              color: q.color,
              marginBottom: 4,
            }}
          >
            {q.head}
          </div>
          <div style={{ fontSize: 13, lineHeight: 1.5 }}>{q.body}</div>
        </div>
      ))}
    </div>
  );
}

function Timeline({
  nodes,
}: {
  nodes: Array<{
    year: string;
    phase: string;
    position: string;
    org: string;
    detail: string;
    live?: boolean;
  }>;
}) {
  return (
    <ol style={{ listStyle: "none", padding: 0, margin: 0 }}>
      {nodes.map((n) => (
        <li
          key={n.year}
          style={{
            display: "grid",
            gridTemplateColumns: "70px 1fr",
            gap: 12,
            padding: "8px 0",
            borderBottom: `1px solid var(--km-hairline)`,
          }}
        >
          <div
            style={{
              fontFamily: FONT_DISPLAY,
              fontSize: 22,
              fontWeight: 600,
              color: n.live ? RED : "var(--km-ink)",
              lineHeight: 1,
              letterSpacing: -0.5,
            }}
          >
            {n.year}
          </div>
          <div>
            <div
              style={{
                fontSize: 11,
                color: "var(--km-ink-dim)",
                letterSpacing: 0.5,
                textTransform: "uppercase",
                fontWeight: 500,
              }}
            >
              {n.phase}
              {n.live && (
                <span style={{ color: RED, marginLeft: 6 }}>● live</span>
              )}
            </div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{n.position}</div>
            <div style={{ fontSize: 12, color: ACC, fontStyle: "italic" }}>
              @ {n.org}
            </div>
            <div style={{ fontSize: 12, color: "var(--km-ink-dim)", marginTop: 2, lineHeight: 1.5 }}>
              {n.detail}
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}

function Metrics({
  metrics,
}: {
  metrics: Array<{ id: string; icon: string; value: string; label: string; context?: string }>;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
        gap: 10,
      }}
    >
      {metrics.map((m) => (
        <div
          key={m.id}
          style={{
            padding: "10px 12px",
            border: `1px solid var(--km-hairline)`,
            borderRadius: 6,
            background: "var(--km-bg-dim)",
          }}
        >
          <div style={{ fontSize: 16, color: GREEN }}>{m.icon}</div>
          <div
            style={{
              fontFamily: FONT_DISPLAY,
              fontSize: 22,
              fontWeight: 600,
              letterSpacing: -0.5,
              marginTop: 2,
            }}
          >
            {m.value}
          </div>
          <div
            style={{
              fontSize: 11,
              letterSpacing: 0.5,
              color: "var(--km-ink-dim)",
              textTransform: "uppercase",
              fontWeight: 500,
              marginTop: 2,
            }}
          >
            {m.label}
          </div>
          {m.context && (
            <div style={{ fontSize: 11, color: "var(--km-ink-dim)", fontStyle: "italic", marginTop: 2 }}>
              {m.context}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function Works({
  projects,
}: {
  projects: Array<{
    id: string;
    title: string;
    category: string;
    description: string;
    technologies: readonly string[];
    duration: string;
  }>;
}) {
  return (
    <ol style={{ listStyle: "none", padding: 0, margin: 0 }}>
      {projects.map((p, i) => (
        <li
          key={p.id}
          style={{
            display: "grid",
            gridTemplateColumns: "60px 1fr",
            gap: 12,
            padding: "10px 0",
            borderBottom: `1px solid var(--km-hairline)`,
          }}
        >
          <div
            style={{
              width: 50,
              height: 50,
              borderRadius: 6,
              background: `linear-gradient(135deg, ${[ACC, PURPLE, ORANGE, GREEN][i % 4]} 0%, ${darken([ACC, PURPLE, ORANGE, GREEN][i % 4])} 100%)`,
              color: "#fff",
              fontFamily: FONT_DISPLAY,
              fontSize: 18,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {["🖼", "📱", "🤖", "🧰"][i] ?? "▢"}
          </div>
          <div>
            <div style={{ fontSize: 10, letterSpacing: 0.5, color: "var(--km-ink-dim)", textTransform: "uppercase", fontWeight: 500 }}>
              {p.category} · {p.duration}
            </div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{p.title}</div>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--km-ink-dim)", lineHeight: 1.45 }}>
              {p.description}
            </p>
            <div style={{ fontFamily: FONT_MONO, fontSize: 10, color: ACC, marginTop: 3 }}>
              {p.technologies.join(" · ")}
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}

function Channels({
  channels,
  success,
}: {
  channels: Array<{ label: string; role: string; value: string; href: string }>;
  success: string[];
}) {
  return (
    <>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <tbody>
          {channels.map((c) => (
            <tr key={c.label}>
              <td
                style={{
                  width: 110,
                  padding: "6px 8px",
                  color: "var(--km-ink-dim)",
                  fontWeight: 500,
                  fontSize: 12,
                  borderBottom: `1px solid var(--km-hairline)`,
                }}
              >
                {c.label}
              </td>
              <td style={{ padding: "6px 8px", borderBottom: `1px solid var(--km-hairline)` }}>
                <a
                  href={c.href}
                  target={c.href.startsWith("http") ? "_blank" : undefined}
                  rel={c.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  style={{ color: ACC, textDecoration: "none" }}
                >
                  {c.value}
                </a>
                <div style={{ fontSize: 11, color: "var(--km-ink-dim)", fontStyle: "italic" }}>
                  {c.role}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div
        style={{
          marginTop: 8,
          padding: "6px 10px",
          fontSize: 11,
          color: GREEN,
          background: "var(--km-bg-dim)",
          border: `1px dashed ${GREEN}55`,
          borderRadius: 6,
          fontFamily: FONT_MONO,
        }}
      >
        success metrics ▸ {success.join(" · ")}
      </div>
    </>
  );
}

function darken(hex: string): string {
  if (!hex.startsWith("#") || hex.length !== 7) return hex;
  const r = Math.max(0, parseInt(hex.slice(1, 3), 16) - 60);
  const g = Math.max(0, parseInt(hex.slice(3, 5), 16) - 60);
  const b = Math.max(0, parseInt(hex.slice(5, 7), 16) - 60);
  return `rgb(${r}, ${g}, ${b})`;
}

// ── Hook ─────────────────────────────────────────────────────────────

function useIsMobile(breakpoint = 768): boolean {
  const [m, setM] = useState(false);
  useEffect(() => {
    const c = () => setM(window.innerWidth < breakpoint);
    c();
    window.addEventListener("resize", c);
    return () => window.removeEventListener("resize", c);
  }, [breakpoint]);
  return m;
}

// ── Main component ───────────────────────────────────────────────────

export function BlockEditorHomePage() {
  const { setLayoutMode } = useLayoutMode();
  useEffect(() => {
    setLayoutMode("full-digital");
  }, [setLayoutMode]);
  const isMobile = useIsMobile();

  const initialPages = useMemo(buildPages, []);
  const [pages, setPages] = useState<Page[]>(initialPages);
  const [activeId, setActiveId] = useState<PageId>("intro");
  const active = pages.find((p) => p.id === activeId) ?? pages[0];

  // Theme
  const [theme, setTheme] = useState<"light" | "dark">("light");
  // A11y prefs
  const [fontScale, setFontScale] = useState(1);
  const [highContrast, setHighContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Sidebar collapse
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  useEffect(() => setSidebarOpen(!isMobile), [isMobile]);

  // Right rail
  const [railOpen, setRailOpen] = useState(true);

  // Toggle block expanded state
  const [toggleOpen, setToggleOpen] = useState<Record<string, boolean>>({});

  // TODO block checked state (persist)
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("kiruk-2018-checked");
      if (raw) setChecked(JSON.parse(raw) as Record<string, boolean>);
    } catch {/* noop */}
  }, []);
  useEffect(() => {
    try {
      sessionStorage.setItem("kiruk-2018-checked", JSON.stringify(checked));
    } catch {/* noop */}
  }, [checked]);

  // Slash command palette
  const [cmdOpen, setCmdOpen] = useState(false);
  const [cmdQuery, setCmdQuery] = useState("");

  // Selected block (for highlight)
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);

  // Block drag-reorder
  const dragRef = useRef<{ blockId: string } | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const moveBlock = useCallback(
    (fromId: string, toId: string) => {
      setPages((all) =>
        all.map((pg) => {
          if (pg.id !== activeId) return pg;
          const blocks = pg.blocks.slice();
          const from = blocks.findIndex((b) => b.id === fromId);
          const to = blocks.findIndex((b) => b.id === toId);
          if (from < 0 || to < 0) return pg;
          const [moved] = blocks.splice(from, 1);
          blocks.splice(to, 0, moved);
          return { ...pg, blocks };
        }),
      );
    },
    [activeId],
  );

  // Inline block comments (sessionStorage)
  type CommentItem = { id: string; author: string; body: string; ts: number };
  const [comments, setComments] = useState<Record<string, CommentItem[]>>({});
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("kiruk-2018-comments");
      if (raw) setComments(JSON.parse(raw) as Record<string, CommentItem[]>);
    } catch {/* noop */}
  }, []);
  useEffect(() => {
    try {
      sessionStorage.setItem("kiruk-2018-comments", JSON.stringify(comments));
    } catch {/* noop */}
  }, [comments]);
  const [commentOpenFor, setCommentOpenFor] = useState<string | null>(null);
  const addComment = useCallback((blockId: string, body: string, author?: string) => {
    if (!body.trim()) return;
    setComments((cs) => ({
      ...cs,
      [blockId]: [
        ...(cs[blockId] ?? []),
        {
          id: `c-${Date.now()}`,
          author: (author ?? "guest").trim() || "guest",
          body: body.trim(),
          ts: Date.now(),
        },
      ],
    }));
  }, []);
  const totalComments = useMemo(
    () => Object.values(comments).reduce((s, arr) => s + arr.length, 0),
    [comments],
  );

  // Insert block at end of active page
  const insertBlock = useCallback(
    (kind: BlockKind) => {
      const newId = `nb-${Date.now()}`;
      const sample: Record<BlockKind, Partial<BlockData>> = {
        h1: { text: "Untitled heading" },
        h2: { text: "Untitled subheading" },
        h3: { text: "Untitled section" },
        p: { text: "Type / for commands. Use @ to mention another page." },
        quote: { text: "A pull quote lives here." },
        callout: { emoji: "💡", text: "New callout. Edit this thought." },
        toggle: { text: "Toggle me", toggleChildren: [{ id: `${newId}-c`, kind: "p", text: "Hidden content." }] },
        bullet: { items: ["First item", "Second item"] },
        numbered: { items: ["Step one", "Step two"] },
        todo: { items: ["To do item one", "To do item two"] },
        divider: {},
        code: { text: "// hello world", language: "ts" },
        data: { body: <em>Custom data block</em> },
        columns: { body: <em>Two-column block</em> },
      };
      setPages((all) =>
        all.map((pg) => {
          if (pg.id !== activeId) return pg;
          return {
            ...pg,
            blocks: [...pg.blocks, { id: newId, kind, ...sample[kind] }],
          };
        }),
      );
      // Scroll into view + select
      setSelectedBlock(newId);
      setToast(`▢ inserted ${kind} block`);
    },
    [activeId],
  );

  // Toast
  const [toast, setToast] = useState<string | null>(null);
  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 1800);
    return () => window.clearTimeout(id);
  }, [toast]);

  // Emoji picker for active page
  const [emojiOpen, setEmojiOpen] = useState(false);
  const setActiveEmoji = useCallback(
    (emoji: string) => {
      setPages((all) =>
        all.map((pg) => (pg.id === activeId ? { ...pg, emoji } : pg)),
      );
      setEmojiOpen(false);
    },
    [activeId],
  );

  // New page action
  const newPage = useCallback(() => {
    const id = `np-${Date.now()}` as PageId;
    const fresh: Page = {
      id,
      emoji: "📝",
      title: "Untitled",
      status: "Draft",
      type: "Manifesto",
      cover: `linear-gradient(135deg, #b298dc 0%, #2eaadc 100%)`,
      tags: ["draft"],
      blocks: [
        { id: `${id}-h`, kind: "h1", text: "Untitled" },
        { id: `${id}-p`, kind: "p", text: "Start writing. Press / for commands." },
      ],
    };
    setPages((p) => [...p, fresh]);
    setActiveId(id);
    setToast("📝 new page created");
  }, []);

  // Backlinks — for active page, find pages whose blocks mention @activeId
  const backlinks = useMemo(() => {
    const out: Page[] = [];
    for (const p of pages) {
      if (p.id === activeId) continue;
      const has = p.blocks.some(
        (b) =>
          (b.text?.toLowerCase().includes(`@${activeId}`) ?? false) ||
          (b.items?.some((it) => it.toLowerCase().includes(`@${activeId}`)) ?? false),
      );
      if (has) out.push(p);
    }
    return out;
  }, [pages, activeId]);

  // Page nav
  const jumpTo = useCallback((id: PageId) => {
    setActiveId(id);
    setCmdOpen(false);
    setCmdQuery("");
  }, []);

  // Keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = (e.target as HTMLElement | null)?.tagName;
      const isInput = t === "INPUT" || t === "TEXTAREA";
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCmdOpen((o) => !o);
        return;
      }
      if (isInput) return;
      if (e.key === "/") {
        e.preventDefault();
        setCmdOpen(true);
        return;
      }
      if (e.key === "Escape") {
        setCmdOpen(false);
        setSelectedBlock(null);
      }
      if (e.key === "ArrowDown" && !cmdOpen) {
        const idx = pages.findIndex((p) => p.id === activeId);
        if (idx < pages.length - 1) {
          e.preventDefault();
          setActiveId(pages[idx + 1].id);
        }
      }
      if (e.key === "ArrowUp" && !cmdOpen) {
        const idx = pages.findIndex((p) => p.id === activeId);
        if (idx > 0) {
          e.preventDefault();
          setActiveId(pages[idx - 1].id);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pages, activeId, cmdOpen]);

  // Track visit
  useEffect(() => {
    fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "page_view", path: "/era/2018" }),
    }).catch(() => {});
  }, []);

  // CSS vars + theme colors
  const isDark = theme === "dark";
  const bg = isDark ? BG_DARK : BG_LIGHT;
  const bgDim = isDark ? BG_DIM_DARK : BG_DIM_LIGHT;
  const side = isDark ? SIDE_DARK : SIDE_LIGHT;
  const ink = highContrast
    ? isDark ? "#ffffff" : "#000000"
    : isDark ? INK_DARK : INK_LIGHT;
  const inkDim = isDark ? INK_DIM_DARK : INK_DIM_LIGHT;
  const hairline = highContrast
    ? isDark ? "#666" : "#999"
    : isDark ? HAIRLINE_DARK : HAIRLINE_LIGHT;
  const hover = isDark ? HOVER_DARK : HOVER_LIGHT;
  const card = bg;

  return (
    <main
      id="kiruk-block-editor"
      style={{
        position: "relative",
        minHeight: "100vh",
        background: bg,
        color: ink,
        fontFamily: FONT_UI,
        fontSize: 16,
        paddingTop: 0,
        // expose vars to nested helpers
        ["--km-bg" as string]: bg,
        ["--km-bg-dim" as string]: bgDim,
        ["--km-ink" as string]: ink,
        ["--km-ink-dim" as string]: inkDim,
        ["--km-hairline" as string]: hairline,
        ["--km-hover" as string]: hover,
      }}
    >
      <style jsx global>{`
        @keyframes kiruk-2018-fade-in {
          0%   { opacity: 0; transform: translateY(4px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes kiruk-2018-modal-in {
          0%   { opacity: 0; transform: scale(0.96); }
          100% { opacity: 1; transform: scale(1); }
        }
        #kiruk-block-editor *:focus-visible {
          outline: 2px solid ${ACC};
          outline-offset: 2px;
          border-radius: 4px;
        }
      `}</style>

      {/* ── TOP CHROME ────────────────────────────────────── */}
      <header
        style={{
          position: "sticky",
          top: "calc(var(--simple-game-nav-bottom, 56px))",
          zIndex: 30,
          background: bg,
          borderBottom: `1px solid ${hairline}`,
          padding: "5px 12px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          fontSize: 13,
        }}
      >
        <button
          type="button"
          onClick={() => setSidebarOpen((s) => !s)}
          title="Toggle sidebar"
          style={{
            width: 28,
            height: 28,
            borderRadius: 4,
            background: "transparent",
            color: inkDim,
            border: "none",
            fontSize: 13,
            cursor: "pointer",
            padding: 0,
          }}
        >
          ☰
        </button>
        <div style={{ color: inkDim, fontSize: 12 }}>
          KIRUK Workspace
          <span style={{ color: inkDim, margin: "0 5px" }}>/</span>
          <span style={{ color: ink, fontWeight: 500 }}>
            {active.emoji} {active.title.split(" · ")[0]}
          </span>
        </div>
        <a
          href="#kiruk-content"
          style={{
            marginLeft: "auto",
            color: ACC,
            fontSize: 11,
            textDecoration: "none",
            border: `1px solid ${hairline}`,
            padding: "2px 8px",
            borderRadius: 4,
          }}
          onClick={(e) => e.preventDefault()}
        >
          Skip to content
        </a>
        <A11yToolbar
          fontScale={fontScale}
          setFontScale={setFontScale}
          highContrast={highContrast}
          setHighContrast={setHighContrast}
          reducedMotion={reducedMotion}
          setReducedMotion={setReducedMotion}
          theme={theme}
          setTheme={setTheme}
          inkDim={inkDim}
          hairline={hairline}
          ink={ink}
        />
        <button
          type="button"
          onClick={() => setCmdOpen(true)}
          title="Open command palette (Cmd/Ctrl+K · /)"
          style={{
            padding: "3px 10px",
            border: `1px solid ${hairline}`,
            borderRadius: 6,
            background: bgDim,
            color: ink,
            fontFamily: FONT_UI,
            fontSize: 11,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          🔍 Search · /
          <kbd
            style={{
              fontFamily: FONT_MONO,
              fontSize: 9,
              color: inkDim,
              background: hairline,
              padding: "0 4px",
              borderRadius: 3,
            }}
          >
            ⌘K
          </kbd>
        </button>
      </header>

      {/* ── BODY ─────────────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile
            ? "1fr"
            : `${sidebarOpen ? 240 : 0}px 1fr ${railOpen ? 260 : 0}px`,
          minHeight: "calc(100vh - 100px)",
          alignItems: "stretch",
        }}
      >
        {/* Sidebar */}
        {sidebarOpen && !isMobile && (
          <aside
            style={{
              background: side,
              borderRight: `1px solid ${hairline}`,
              padding: "10px 8px",
              fontSize: 13,
              overflowY: "auto",
            }}
          >
            <div
              style={{
                padding: "6px 10px",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <div
                aria-hidden
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 4,
                  background: `linear-gradient(135deg, ${ACC} 0%, ${PURPLE} 100%)`,
                }}
              />
              <div>
                <div style={{ fontWeight: 600, lineHeight: 1.1 }}>
                  KIRUK
                </div>
                <div style={{ fontSize: 10, color: inkDim }}>
                  Personal workspace
                </div>
              </div>
            </div>
            <SideButton inkDim={inkDim} onClick={() => setCmdOpen(true)}>
              🔍 Search…
            </SideButton>
            <SideButton inkDim={inkDim} onClick={() => jumpTo("today")}>
              📅 Today
            </SideButton>
            <SideButton inkDim={inkDim}>
              📥 Inbox
            </SideButton>
            <div
              style={{
                marginTop: 10,
                padding: "0 10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span
                style={{
                  fontSize: 10,
                  letterSpacing: 1,
                  color: inkDim,
                  textTransform: "uppercase",
                  fontWeight: 600,
                }}
              >
                Pages · {pages.length}
              </span>
              <button
                type="button"
                onClick={newPage}
                title="New page"
                style={{
                  width: 18,
                  height: 18,
                  background: "transparent",
                  border: "none",
                  color: inkDim,
                  fontSize: 14,
                  cursor: "pointer",
                  padding: 0,
                  borderRadius: 3,
                  lineHeight: 1,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = hover;
                  e.currentTarget.style.color = ink;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = inkDim;
                }}
              >
                +
              </button>
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: "2px 0 0" }}>
              {pages.map((p) => {
                const isActive = p.id === activeId;
                return (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => jumpTo(p.id)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        width: "100%",
                        padding: "4px 10px",
                        background: isActive ? hover : "transparent",
                        border: "none",
                        color: ink,
                        fontFamily: FONT_UI,
                        fontSize: 13,
                        cursor: "pointer",
                        textAlign: "left",
                        borderRadius: 4,
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) e.currentTarget.style.background = hover;
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) e.currentTarget.style.background = "transparent";
                      }}
                    >
                      <span style={{ fontSize: 14, width: 18 }}>{p.emoji}</span>
                      <span
                        style={{
                          flex: 1,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          fontWeight: isActive ? 500 : 400,
                        }}
                      >
                        {p.title.split(" · ")[0]}
                      </span>
                      {p.status === "Draft" && (
                        <span
                          style={{
                            fontSize: 9,
                            color: YELLOW,
                            background: `${YELLOW}22`,
                            padding: "0 4px",
                            borderRadius: 2,
                            letterSpacing: 0.3,
                          }}
                        >
                          DRAFT
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </aside>
        )}

        {/* Editor canvas */}
        <section
          id="kiruk-content"
          tabIndex={-1}
          style={{
            position: "relative",
            padding: 0,
            background: bg,
            color: ink,
            overflowY: "auto",
          }}
        >
          {/* Cover */}
          <div
            style={{
              height: 130,
              background: active.cover,
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: -22,
                paddingLeft: isMobile ? 18 : 80,
              }}
            >
              <button
                type="button"
                onClick={() => setEmojiOpen((o) => !o)}
                title="Change page emoji"
                style={{
                  display: "inline-block",
                  width: 56,
                  height: 56,
                  borderRadius: 8,
                  background: bg,
                  border: `2px solid ${bg}`,
                  fontSize: 36,
                  textAlign: "center",
                  lineHeight: "52px",
                  boxShadow: "0 6px 16px rgba(0,0,0,0.25)",
                  cursor: "pointer",
                  padding: 0,
                  position: "relative",
                }}
              >
                {active.emoji}
              </button>
              {emojiOpen && (
                <EmojiPicker
                  onPick={setActiveEmoji}
                  onClose={() => setEmojiOpen(false)}
                  card={card}
                  hairline={hairline}
                  hover={hover}
                  ink={ink}
                  inkDim={inkDim}
                />
              )}
            </div>
          </div>

          <article
            key={active.id}
            style={{
              maxWidth: 740,
              margin: "40px auto 30px",
              padding: isMobile ? "0 18px" : "0 80px",
              animation: reducedMotion ? "none" : "kiruk-2018-fade-in 320ms ease-out",
              zoom: fontScale,
            } as React.CSSProperties}
          >
            {/* Title row */}
            <div style={{ marginBottom: 6 }}>
              <h1
                style={{
                  fontFamily: FONT_DISPLAY,
                  fontSize: 40,
                  fontWeight: 700,
                  letterSpacing: -1,
                  margin: 0,
                  lineHeight: 1.15,
                  color: ink,
                }}
              >
                {active.title}
              </h1>
              <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                {active.tags.map((t) => (
                  <span
                    key={t}
                    style={{
                      fontSize: 11,
                      padding: "1px 8px",
                      background: hover,
                      color: inkDim,
                      borderRadius: 3,
                    }}
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 18 }}>
              {active.blocks.map((b) => (
                <Block
                  key={b.id}
                  block={b}
                  selected={selectedBlock === b.id}
                  toggleOpen={toggleOpen}
                  checked={checked}
                  pages={pages}
                  ink={ink}
                  inkDim={inkDim}
                  hairline={hairline}
                  hover={hover}
                  commentCount={comments[b.id]?.length ?? 0}
                  commentOpen={commentOpenFor === b.id}
                  commentThread={comments[b.id] ?? []}
                  dropTarget={dropTargetId === b.id}
                  onSelect={() => setSelectedBlock(b.id)}
                  onToggle={(id) => setToggleOpen((t) => ({ ...t, [id]: !t[id] }))}
                  onCheck={(id) => setChecked((c) => ({ ...c, [id]: !c[id] }))}
                  onMention={(href) => jumpTo(href as PageId)}
                  onCommentToggle={() =>
                    setCommentOpenFor((c) => (c === b.id ? null : b.id))
                  }
                  onCommentAdd={(body, author) => addComment(b.id, body, author)}
                  onCommentClose={() => setCommentOpenFor(null)}
                  onDragStart={(id) => {
                    dragRef.current = { blockId: id };
                  }}
                  onDragEnter={(id) => {
                    const d = dragRef.current;
                    if (!d || d.blockId === id) return;
                    setDropTargetId(id);
                  }}
                  onDragLeave={(id) => {
                    setDropTargetId((cur) => (cur === id ? null : cur));
                  }}
                  onDropOver={(id) => {
                    const d = dragRef.current;
                    setDropTargetId(null);
                    if (!d || d.blockId === id) return;
                    moveBlock(d.blockId, id);
                    dragRef.current = null;
                  }}
                />
              ))}
            </div>

            {/* + add block hint */}
            <button
              type="button"
              onClick={() => setCmdOpen(true)}
              style={{
                marginTop: 12,
                width: "100%",
                padding: "8px 12px",
                background: "transparent",
                border: `1px dashed ${hairline}`,
                color: inkDim,
                borderRadius: 6,
                fontFamily: FONT_UI,
                fontSize: 12,
                cursor: "pointer",
                textAlign: "left",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = hover)}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              + Click anywhere · or press / · or ⌘K to add a block / jump page
            </button>
          </article>
        </section>

        {/* Right rail: properties */}
        {railOpen && !isMobile && (
          <aside
            style={{
              background: bgDim,
              borderLeft: `1px solid ${hairline}`,
              padding: "16px 14px",
              fontSize: 12,
              overflowY: "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  letterSpacing: 1,
                  color: inkDim,
                  textTransform: "uppercase",
                  fontWeight: 600,
                }}
              >
                Properties
              </div>
              <button
                type="button"
                onClick={() => setRailOpen(false)}
                title="Hide properties"
                style={{
                  background: "transparent",
                  border: "none",
                  color: inkDim,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                ›
              </button>
            </div>
            <PropRow k="Status" v={active.status} pill color={statusColor(active.status)} />
            <PropRow k="Type" v={active.type} pill color={ACC} />
            <PropRow k="Emoji" v={active.emoji} />
            <PropRow k="Page ID" v={active.id} mono />
            <PropRow k="Word count" v={String(estimateWords(active))} mono />
            <PropRow k="Blocks" v={String(active.blocks.length)} mono />
            <PropRow k="Comments" v={String(totalComments)} mono />
            <div
              style={{
                marginTop: 10,
                paddingTop: 8,
                borderTop: `1px solid ${hairline}`,
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  letterSpacing: 1,
                  color: inkDim,
                  textTransform: "uppercase",
                  fontWeight: 600,
                  marginBottom: 5,
                }}
              >
                Tags
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {active.tags.map((t) => (
                  <span
                    key={t}
                    style={{
                      fontSize: 11,
                      padding: "2px 8px",
                      background: hover,
                      color: ink,
                      borderRadius: 3,
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
            {/* Backlinks */}
            <div
              style={{
                marginTop: 14,
                paddingTop: 10,
                borderTop: `1px solid ${hairline}`,
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  letterSpacing: 1,
                  color: inkDim,
                  textTransform: "uppercase",
                  fontWeight: 600,
                  marginBottom: 5,
                }}
              >
                Backlinks · {backlinks.length}
              </div>
              {backlinks.length === 0 ? (
                <div style={{ fontSize: 10, color: inkDim, fontStyle: "italic" }}>
                  no pages link here yet — mention with @{activeId}
                </div>
              ) : (
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {backlinks.map((bp) => (
                    <li key={bp.id} style={{ marginBottom: 2 }}>
                      <button
                        type="button"
                        onClick={() => jumpTo(bp.id)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                          width: "100%",
                          padding: "3px 6px",
                          background: "transparent",
                          border: "none",
                          color: ACC,
                          fontFamily: FONT_UI,
                          fontSize: 11,
                          cursor: "pointer",
                          textAlign: "left",
                          borderRadius: 3,
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = hover)}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <span style={{ fontSize: 12, width: 16 }}>{bp.emoji}</span>
                        <span style={{ color: ink, fontWeight: 500 }}>
                          ↩ {bp.title.split(" · ")[0]}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div
              style={{
                marginTop: 14,
                paddingTop: 10,
                borderTop: `1px solid ${hairline}`,
                fontSize: 10,
                color: inkDim,
                letterSpacing: 0.5,
                lineHeight: 1.6,
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  letterSpacing: 1,
                  color: inkDim,
                  textTransform: "uppercase",
                  fontWeight: 600,
                  marginBottom: 5,
                }}
              >
                Keyboard
              </div>
              <Kbd>↑ ↓</Kbd> page · <Kbd>/</Kbd> menu · <Kbd>⌘K</Kbd> search · <Kbd>Esc</Kbd> close
            </div>
          </aside>
        )}
        {!railOpen && !isMobile && (
          <button
            type="button"
            onClick={() => setRailOpen(true)}
            title="Show properties"
            style={{
              position: "fixed",
              right: 6,
              top: 80,
              zIndex: 25,
              padding: "4px 8px",
              background: bg,
              border: `1px solid ${hairline}`,
              borderRadius: 4,
              color: inkDim,
              fontSize: 11,
              cursor: "pointer",
            }}
          >
            ‹ Props
          </button>
        )}
      </div>

      {/* Command palette */}
      {cmdOpen && (
        <CommandPalette
          query={cmdQuery}
          setQuery={setCmdQuery}
          pages={pages}
          ink={ink}
          inkDim={inkDim}
          bg={bg}
          hairline={hairline}
          hover={hover}
          onJump={(id) => jumpTo(id as PageId)}
          onInsert={(kind) => {
            insertBlock(kind);
            setCmdOpen(false);
            setCmdQuery("");
          }}
          onClose={() => {
            setCmdOpen(false);
            setCmdQuery("");
          }}
        />
      )}

      {/* Toast */}
      {toast && (
        <div
          role="status"
          style={{
            position: "fixed",
            left: "50%",
            bottom: 24,
            transform: "translateX(-50%)",
            zIndex: 200,
            padding: "8px 14px",
            background: theme === "dark" ? "rgba(255,255,255,0.92)" : "rgba(20,20,30,0.92)",
            color: theme === "dark" ? "#1a1a1a" : "#fff",
            borderRadius: 999,
            fontFamily: FONT_UI,
            fontSize: 12,
            fontWeight: 500,
            boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            pointerEvents: "none",
          }}
        >
          {toast}
        </div>
      )}
    </main>
  );
}

function statusColor(s: Page["status"]): string {
  return s === "Live" ? GREEN : s === "Draft" ? YELLOW : INK_DIM_LIGHT;
}

function estimateWords(p: Page): number {
  return p.blocks.reduce((sum, b) => {
    if (b.text) return sum + b.text.split(/\s+/).length;
    if (b.items) return sum + b.items.join(" ").split(/\s+/).length;
    return sum;
  }, 0);
}

// ── Block renderer ───────────────────────────────────────────────────

function Block({
  block,
  selected,
  toggleOpen,
  checked,
  pages,
  ink,
  inkDim,
  hairline,
  hover,
  commentCount,
  commentOpen,
  commentThread,
  dropTarget,
  onSelect,
  onToggle,
  onCheck,
  onMention,
  onCommentToggle,
  onCommentAdd,
  onCommentClose,
  onDragStart,
  onDragEnter,
  onDragLeave,
  onDropOver,
}: {
  block: BlockData;
  selected: boolean;
  toggleOpen: Record<string, boolean>;
  checked: Record<string, boolean>;
  pages: Page[];
  ink: string;
  inkDim: string;
  hairline: string;
  hover: string;
  commentCount: number;
  commentOpen: boolean;
  commentThread: Array<{ id: string; author: string; body: string; ts: number }>;
  dropTarget: boolean;
  onSelect: () => void;
  onToggle: (id: string) => void;
  onCheck: (id: string) => void;
  onMention: (id: string) => void;
  onCommentToggle: () => void;
  onCommentAdd: (body: string, author?: string) => void;
  onCommentClose: () => void;
  onDragStart: (id: string) => void;
  onDragEnter: (id: string) => void;
  onDragLeave: (id: string) => void;
  onDropOver: (id: string) => void;
}) {
  const [hovering, setHovering] = useState(false);
  return (
    <div
      style={{ position: "relative" }}
    >
      {/* Drop indicator line */}
      {dropTarget && (
        <div
          aria-hidden
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: -2,
            height: 3,
            background: ACC,
            borderRadius: 2,
            boxShadow: `0 0 6px ${ACC}88`,
            pointerEvents: "none",
            zIndex: 2,
          }}
        />
      )}
      <div
        draggable
        onDragStart={(e) => {
          e.dataTransfer.effectAllowed = "move";
          onDragStart(block.id);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          onDragEnter(block.id);
        }}
        onDragLeave={() => onDragLeave(block.id)}
        onDrop={() => onDropOver(block.id)}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        onClick={onSelect}
        style={{
          position: "relative",
          padding: "2px 0 2px 56px",
          marginBottom: 2,
          background: selected ? `${ACC}11` : "transparent",
          borderRadius: 4,
          transition: "background 120ms",
        }}
      >
        {/* Left rail: drag handle + comment button (always reachable) */}
        <span
          aria-hidden
          style={{
            position: "absolute",
            left: 4,
            top: 4,
            display: "flex",
            gap: 4,
            alignItems: "center",
            opacity: hovering || commentCount > 0 || commentOpen ? 1 : 0,
            transition: "opacity 120ms",
          }}
        >
          <span
            style={{
              color: inkDim,
              fontSize: 13,
              cursor: "grab",
              userSelect: "none",
              padding: "0 2px",
            }}
            title="Drag to reorder"
          >
            ⋮⋮
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onCommentToggle();
            }}
            title={commentCount > 0 ? `${commentCount} comment${commentCount === 1 ? "" : "s"}` : "Comment"}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 2,
              height: 20,
              padding: commentCount > 0 ? "0 6px" : "0 3px",
              background: commentOpen ? ACC : commentCount > 0 ? `${ACC}22` : "transparent",
              color: commentOpen ? "#fff" : commentCount > 0 ? ACC : inkDim,
              border: `1px solid ${commentOpen ? ACC : commentCount > 0 ? `${ACC}55` : hairline}`,
              borderRadius: 999,
              cursor: "pointer",
              fontSize: 11,
              fontFamily: FONT_UI,
              fontWeight: 500,
              lineHeight: 1,
            }}
          >
            <span style={{ fontSize: 11 }}>💬</span>
            {commentCount > 0 && (
              <span style={{ fontSize: 10 }}>{commentCount}</span>
            )}
          </button>
        </span>

        {renderInner(block, {
          toggleOpen,
          checked,
          pages,
          ink,
          inkDim,
          hairline,
          hover,
          onToggle,
          onCheck,
          onMention,
        })}
      </div>

      {/* Inline comment thread */}
      {commentOpen && (
        <CommentThread
          thread={commentThread}
          onAdd={onCommentAdd}
          onClose={onCommentClose}
          ink={ink}
          inkDim={inkDim}
          hairline={hairline}
          hover={hover}
        />
      )}
    </div>
  );
}

function CommentThread({
  thread,
  onAdd,
  onClose,
  ink,
  inkDim,
  hairline,
  hover,
}: {
  thread: Array<{ id: string; author: string; body: string; ts: number }>;
  onAdd: (body: string, author?: string) => void;
  onClose: () => void;
  ink: string;
  inkDim: string;
  hairline: string;
  hover: string;
}) {
  const [body, setBody] = useState("");
  const [author, setAuthor] = useState("");
  const submit = () => {
    if (!body.trim()) return;
    onAdd(body, author);
    setBody("");
  };
  return (
    <div
      style={{
        marginLeft: 20,
        marginTop: 4,
        marginBottom: 8,
        padding: "8px 10px",
        background: hover,
        border: `1px solid ${hairline}`,
        borderLeft: `3px solid ${ACC}`,
        borderRadius: 6,
        fontSize: 12,
        animation: "kiruk-2018-fade-in 200ms ease-out",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 4,
        }}
      >
        <span
          style={{
            fontSize: 9,
            letterSpacing: 1,
            color: inkDim,
            textTransform: "uppercase",
            fontWeight: 600,
          }}
        >
          💬 Thread · {thread.length}
        </span>
        <button
          type="button"
          onClick={onClose}
          style={{
            background: "transparent",
            border: "none",
            color: inkDim,
            cursor: "pointer",
            padding: 0,
            fontSize: 14,
            lineHeight: 1,
          }}
          title="Close thread"
        >
          ×
        </button>
      </div>
      {thread.length === 0 ? (
        <div style={{ fontSize: 11, color: inkDim, fontStyle: "italic", marginBottom: 6 }}>
          No comments yet — be the first to note this block.
        </div>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: "0 0 6px" }}>
          {thread.map((c) => (
            <li
              key={c.id}
              style={{
                padding: "5px 0",
                borderBottom: `1px solid ${hairline}`,
                fontSize: 12,
                color: ink,
              }}
            >
              <div style={{ fontSize: 10, color: inkDim, marginBottom: 2 }}>
                <strong style={{ color: ACC }}>/{c.author}</strong> ·{" "}
                {Math.floor((Date.now() - c.ts) / 60000)}m ago
              </div>
              <div style={{ lineHeight: 1.45 }}>{c.body}</div>
            </li>
          ))}
        </ul>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "100px 1fr auto", gap: 4 }}>
        <input
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="/handle"
          style={{
            padding: "3px 6px",
            fontFamily: FONT_UI,
            fontSize: 11,
            border: `1px solid ${hairline}`,
            background: "var(--km-bg)",
            color: ink,
            borderRadius: 3,
            outline: "none",
          }}
        />
        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
          }}
          placeholder="Add a comment…"
          style={{
            padding: "3px 6px",
            fontFamily: FONT_UI,
            fontSize: 11,
            border: `1px solid ${hairline}`,
            background: "var(--km-bg)",
            color: ink,
            borderRadius: 3,
            outline: "none",
          }}
        />
        <button
          type="button"
          onClick={submit}
          style={{
            padding: "3px 10px",
            fontFamily: FONT_UI,
            fontSize: 10,
            fontWeight: 500,
            color: "#fff",
            background: ACC,
            border: "none",
            borderRadius: 3,
            cursor: "pointer",
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}

function renderInner(
  block: BlockData,
  ctx: {
    toggleOpen: Record<string, boolean>;
    checked: Record<string, boolean>;
    pages: Page[];
    ink: string;
    inkDim: string;
    hairline: string;
    hover: string;
    onToggle: (id: string) => void;
    onCheck: (id: string) => void;
    onMention: (id: string) => void;
  },
): React.ReactNode {
  switch (block.kind) {
    case "h1":
      return (
        <h2
          style={{
            fontFamily: FONT_DISPLAY,
            fontSize: 28,
            fontWeight: 700,
            margin: "24px 0 6px",
            lineHeight: 1.2,
            letterSpacing: -0.5,
            color: ctx.ink,
          }}
        >
          {block.text}
        </h2>
      );
    case "h2":
      return (
        <h3
          style={{
            fontFamily: FONT_DISPLAY,
            fontSize: 20,
            fontWeight: 600,
            margin: "18px 0 4px",
            lineHeight: 1.25,
            letterSpacing: -0.3,
            color: ctx.ink,
          }}
        >
          {block.text}
        </h3>
      );
    case "h3":
      return (
        <h4
          style={{
            fontFamily: FONT_DISPLAY,
            fontSize: 16,
            fontWeight: 600,
            margin: "12px 0 2px",
            color: ctx.ink,
          }}
        >
          {block.text}
        </h4>
      );
    case "p":
      return (
        <p
          style={{
            fontSize: 15,
            lineHeight: 1.6,
            color: ctx.ink,
            margin: "3px 0",
          }}
        >
          {renderMentions(block.text ?? "", ctx)}
        </p>
      );
    case "quote":
      return (
        <blockquote
          style={{
            margin: "8px 0",
            paddingLeft: 14,
            borderLeft: `3px solid ${ctx.ink}`,
            fontSize: 16,
            lineHeight: 1.55,
            color: ctx.ink,
            fontStyle: "italic",
          }}
        >
          {block.text}
        </blockquote>
      );
    case "callout":
      return (
        <div
          style={{
            display: "flex",
            gap: 10,
            padding: "10px 14px",
            background: ctx.hover,
            borderRadius: 6,
            margin: "8px 0",
            fontSize: 14,
            lineHeight: 1.55,
          }}
        >
          <span style={{ fontSize: 18, lineHeight: 1.2 }} aria-hidden>
            {block.emoji ?? "💡"}
          </span>
          <span>{block.text}</span>
        </div>
      );
    case "toggle": {
      const open = !!ctx.toggleOpen[block.id];
      return (
        <div style={{ margin: "4px 0" }}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              ctx.onToggle(block.id);
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "transparent",
              border: "none",
              color: ctx.ink,
              fontFamily: FONT_UI,
              fontSize: 15,
              cursor: "pointer",
              padding: 0,
              fontWeight: 500,
            }}
          >
            <span
              aria-hidden
              style={{
                display: "inline-block",
                transition: "transform 180ms",
                transform: open ? "rotate(90deg)" : "rotate(0deg)",
                color: ctx.inkDim,
                fontSize: 11,
              }}
            >
              ▸
            </span>
            {block.text}
          </button>
          {open && block.toggleChildren && (
            <div style={{ paddingLeft: 20, marginTop: 4 }}>
              {block.toggleChildren.map((c) => (
                <div key={c.id}>{renderInner(c, ctx)}</div>
              ))}
            </div>
          )}
        </div>
      );
    }
    case "bullet":
      return (
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: "4px 0",
            fontSize: 15,
            lineHeight: 1.55,
          }}
        >
          {block.items?.map((it) => (
            <li key={it} style={{ display: "flex", gap: 8 }}>
              <span style={{ color: ctx.inkDim, marginTop: 2 }}>•</span>
              <span>{renderMentions(it, ctx)}</span>
            </li>
          ))}
        </ul>
      );
    case "numbered":
      return (
        <ol
          style={{
            listStyle: "decimal",
            paddingLeft: 22,
            margin: "4px 0",
            fontSize: 15,
            lineHeight: 1.55,
          }}
        >
          {block.items?.map((it) => (
            <li key={it} style={{ marginBottom: 2 }}>
              {renderMentions(it, ctx)}
            </li>
          ))}
        </ol>
      );
    case "todo":
      return (
        <ul style={{ listStyle: "none", padding: 0, margin: "4px 0", fontSize: 15, lineHeight: 1.55 }}>
          {block.items?.map((it, i) => {
            const id = `${block.id}-${i}`;
            const ck = !!ctx.checked[id];
            return (
              <li
                key={id}
                style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 2 }}
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    ctx.onCheck(id);
                  }}
                  style={{
                    width: 16,
                    height: 16,
                    marginTop: 3,
                    borderRadius: 3,
                    border: `1.5px solid ${ck ? ACC : ctx.inkDim}`,
                    background: ck ? ACC : "transparent",
                    color: "#fff",
                    fontSize: 11,
                    lineHeight: 1,
                    padding: 0,
                    cursor: "pointer",
                    flexShrink: 0,
                  }}
                  aria-checked={ck}
                  role="checkbox"
                >
                  {ck ? "✓" : ""}
                </button>
                <span
                  style={{
                    textDecoration: ck ? "line-through" : "none",
                    color: ck ? ctx.inkDim : ctx.ink,
                  }}
                >
                  {it}
                </span>
              </li>
            );
          })}
        </ul>
      );
    case "divider":
      return (
        <hr
          style={{
            border: "none",
            borderTop: `1px solid ${ctx.hairline}`,
            margin: "14px 0",
          }}
        />
      );
    case "data":
      return <div style={{ margin: "6px 0" }}>{block.body}</div>;
    case "columns":
      return <div style={{ margin: "6px 0" }}>{block.body}</div>;
    default:
      return null;
  }
}

function renderMentions(
  text: string,
  ctx: { pages: Page[]; onMention: (id: string) => void },
): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const re = /@([a-z0-9-]+)/gi;
  let last = 0;
  let i = 0;
  for (const m of text.matchAll(re)) {
    if (m.index! > last) parts.push(text.slice(last, m.index));
    const slug = m[1].toLowerCase();
    const page = ctx.pages.find((p) => p.id === slug);
    if (page) {
      parts.push(
        <button
          key={`m-${i++}`}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            ctx.onMention(page.id);
          }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 3,
            background: `${ACC}1a`,
            color: ACC,
            border: "none",
            padding: "0 5px",
            borderRadius: 3,
            fontFamily: FONT_UI,
            fontSize: "inherit",
            cursor: "pointer",
          }}
        >
          {page.emoji} {page.title.split(" · ")[0]}
        </button>,
      );
    } else {
      parts.push(<span key={`m-${i++}`}>{m[0]}</span>);
    }
    last = m.index! + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

// ── Side button ──────────────────────────────────────────────────────

function SideButton({
  children,
  onClick,
  inkDim,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  inkDim: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        width: "100%",
        padding: "4px 10px",
        background: "transparent",
        border: "none",
        color: inkDim,
        fontFamily: FONT_UI,
        fontSize: 12,
        cursor: "pointer",
        textAlign: "left",
        borderRadius: 4,
      }}
    >
      {children}
    </button>
  );
}

// ── Property row ─────────────────────────────────────────────────────

function PropRow({
  k,
  v,
  pill,
  color,
  mono,
}: {
  k: string;
  v: string;
  pill?: boolean;
  color?: string;
  mono?: boolean;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "80px 1fr",
        gap: 8,
        padding: "5px 0",
        fontSize: 12,
        alignItems: "center",
      }}
    >
      <span style={{ color: "var(--km-ink-dim)", fontSize: 11 }}>{k}</span>
      {pill ? (
        <span
          style={{
            display: "inline-block",
            padding: "1px 8px",
            background: `${color ?? "#999"}22`,
            color: color ?? "#999",
            borderRadius: 3,
            fontSize: 11,
            fontWeight: 500,
            width: "fit-content",
          }}
        >
          {v}
        </span>
      ) : (
        <span style={{ color: "var(--km-ink)", fontFamily: mono ? FONT_MONO : FONT_UI, fontSize: mono ? 11 : 12 }}>
          {v}
        </span>
      )}
    </div>
  );
}

// ── A11y toolbar ─────────────────────────────────────────────────────

function A11yToolbar({
  fontScale,
  setFontScale,
  highContrast,
  setHighContrast,
  reducedMotion,
  setReducedMotion,
  theme,
  setTheme,
  inkDim,
  hairline,
  ink,
}: {
  fontScale: number;
  setFontScale: (n: number) => void;
  highContrast: boolean;
  setHighContrast: (b: boolean) => void;
  reducedMotion: boolean;
  setReducedMotion: (b: boolean) => void;
  theme: "light" | "dark";
  setTheme: (t: "light" | "dark") => void;
  inkDim: string;
  hairline: string;
  ink: string;
}) {
  return (
    <div
      role="toolbar"
      aria-label="Accessibility controls"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        padding: "1px 4px",
        border: `1px solid ${hairline}`,
        borderRadius: 6,
      }}
    >
      <ToolBtn
        title="Decrease font"
        ink={ink}
        onClick={() => setFontScale(Math.max(0.85, fontScale - 0.05))}
      >
        A−
      </ToolBtn>
      <span style={{ fontSize: 10, color: inkDim, fontFamily: FONT_MONO, minWidth: 28, textAlign: "center" }}>
        {Math.round(fontScale * 100)}%
      </span>
      <ToolBtn
        title="Increase font"
        ink={ink}
        onClick={() => setFontScale(Math.min(1.4, fontScale + 0.05))}
      >
        A+
      </ToolBtn>
      <ToolBtn
        title="High contrast"
        ink={ink}
        active={highContrast}
        onClick={() => setHighContrast(!highContrast)}
      >
        ◐
      </ToolBtn>
      <ToolBtn
        title="Reduced motion"
        ink={ink}
        active={reducedMotion}
        onClick={() => setReducedMotion(!reducedMotion)}
      >
        ◴
      </ToolBtn>
      <ToolBtn
        title={`Switch to ${theme === "light" ? "dark" : "light"}`}
        ink={ink}
        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      >
        {theme === "light" ? "🌙" : "☀"}
      </ToolBtn>
    </div>
  );
}

function ToolBtn({
  children,
  onClick,
  title,
  active,
  ink,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title: string;
  active?: boolean;
  ink: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      aria-pressed={active}
      style={{
        width: 26,
        height: 22,
        background: active ? `${ACC}22` : "transparent",
        color: active ? ACC : ink,
        border: "none",
        borderRadius: 4,
        cursor: "pointer",
        fontSize: 11,
        fontFamily: FONT_UI,
        padding: 0,
      }}
    >
      {children}
    </button>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd
      style={{
        fontFamily: FONT_MONO,
        fontSize: 9,
        color: "var(--km-ink)",
        background: "var(--km-hairline)",
        padding: "1px 5px",
        borderRadius: 3,
        margin: "0 2px",
      }}
    >
      {children}
    </kbd>
  );
}

// ── Command Palette ──────────────────────────────────────────────────

// ── Emoji picker popover ─────────────────────────────────────────────

const EMOJI_GRID = [
  "📄", "🧍", "🧭", "🧮", "🗺", "📊", "🗂", "✉", "📅", "🪞",
  "💡", "🎯", "✨", "🔥", "📌", "🧠", "🎨", "📝", "🛠", "🚀",
  "🌱", "📖", "🎬", "🎵", "📷", "🧪", "🏗", "📦", "🔍", "⚙",
];

function EmojiPicker({
  onPick,
  onClose,
  card,
  hairline,
  hover,
  ink,
  inkDim,
}: {
  onPick: (e: string) => void;
  onClose: () => void;
  card: string;
  hairline: string;
  hover: string;
  ink: string;
  inkDim: string;
}) {
  useEffect(() => {
    const onAny = (e: MouseEvent) => {
      const tgt = e.target as HTMLElement;
      if (!tgt.closest("[data-km-emoji-picker]")) onClose();
    };
    // Defer to avoid catching the open click
    const t = window.setTimeout(() => {
      window.addEventListener("click", onAny);
    }, 0);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("click", onAny);
    };
  }, [onClose]);
  return (
    <div
      data-km-emoji-picker
      style={{
        position: "absolute",
        top: 70,
        left: 0,
        zIndex: 60,
        width: 260,
        background: card,
        border: `1px solid ${hairline}`,
        borderRadius: 10,
        boxShadow: "0 14px 32px rgba(0,0,0,0.3)",
        padding: 8,
      }}
    >
      <div
        style={{
          fontSize: 10,
          letterSpacing: 1.5,
          color: inkDim,
          textTransform: "uppercase",
          fontWeight: 600,
          padding: "2px 4px 6px",
        }}
      >
        Pick an emoji
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(8, 1fr)",
          gap: 2,
        }}
      >
        {EMOJI_GRID.map((e) => (
          <button
            key={e}
            type="button"
            onClick={() => onPick(e)}
            style={{
              width: 28,
              height: 28,
              background: "transparent",
              border: "none",
              cursor: "pointer",
              fontSize: 18,
              borderRadius: 5,
              padding: 0,
              color: ink,
            }}
            onMouseEnter={(ev) => (ev.currentTarget.style.background = hover)}
            onMouseLeave={(ev) => (ev.currentTarget.style.background = "transparent")}
          >
            {e}
          </button>
        ))}
      </div>
    </div>
  );
}

const INSERT_OPTIONS: Array<{ kind: BlockKind; label: string; emoji: string }> = [
  { kind: "h1",       label: "Heading 1",     emoji: "𝐇₁" },
  { kind: "h2",       label: "Heading 2",     emoji: "𝐇₂" },
  { kind: "h3",       label: "Heading 3",     emoji: "𝐇₃" },
  { kind: "p",        label: "Paragraph",     emoji: "¶"  },
  { kind: "quote",    label: "Quote",         emoji: "❝"  },
  { kind: "callout",  label: "Callout",       emoji: "💡" },
  { kind: "toggle",   label: "Toggle",        emoji: "▸"  },
  { kind: "bullet",   label: "Bulleted list", emoji: "•"  },
  { kind: "numbered", label: "Numbered list", emoji: "1." },
  { kind: "todo",     label: "To-do",         emoji: "☐"  },
  { kind: "divider",  label: "Divider",       emoji: "—"  },
];

function CommandPalette({
  query,
  setQuery,
  pages,
  ink,
  inkDim,
  bg,
  hairline,
  hover,
  onJump,
  onInsert,
  onClose,
}: {
  query: string;
  setQuery: (s: string) => void;
  pages: Page[];
  ink: string;
  inkDim: string;
  bg: string;
  hairline: string;
  hover: string;
  onJump: (id: string) => void;
  onInsert: (kind: BlockKind) => void;
  onClose: () => void;
}) {
  const q = query.trim().toLowerCase();
  const filteredPages = useMemo(
    () =>
      !q
        ? pages
        : pages.filter(
            (p) =>
              p.title.toLowerCase().includes(q) ||
              p.id.toLowerCase().includes(q) ||
              p.tags.some((t) => t.toLowerCase().includes(q)),
          ),
    [q, pages],
  );
  const filteredInserts = useMemo(
    () =>
      !q
        ? INSERT_OPTIONS
        : INSERT_OPTIONS.filter(
            (i) => i.label.toLowerCase().includes(q) || i.kind.includes(q),
          ),
    [q],
  );
  const filtered = filteredPages; // back-compat alias for unchanged code below
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "rgba(0,0,0,0.35)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        paddingTop: 80,
        padding: "80px 16px 16px",
        animation: "kiruk-2018-modal-in 180ms ease-out",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: bg,
          color: ink,
          border: `1px solid ${hairline}`,
          borderRadius: 10,
          width: "min(540px, 100%)",
          boxShadow: "0 24px 60px rgba(0,0,0,0.35)",
          overflow: "hidden",
        }}
      >
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search pages, jump, insert block…"
          style={{
            width: "100%",
            padding: "12px 16px",
            border: "none",
            borderBottom: `1px solid ${hairline}`,
            background: bg,
            color: ink,
            fontFamily: FONT_UI,
            fontSize: 15,
            outline: "none",
            boxSizing: "border-box",
          }}
        />
        <div style={{ maxHeight: 360, overflowY: "auto" }}>
          {/* Insert section */}
          {filteredInserts.length > 0 && (
            <>
              <div
                style={{
                  padding: "6px 14px 4px",
                  fontSize: 9,
                  letterSpacing: 1.5,
                  color: inkDim,
                  textTransform: "uppercase",
                  fontWeight: 600,
                }}
              >
                Insert block on current page
              </div>
              {filteredInserts.map((opt) => (
                <button
                  key={opt.kind}
                  type="button"
                  onClick={() => onInsert(opt.kind)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    width: "100%",
                    padding: "6px 14px",
                    background: "transparent",
                    border: "none",
                    color: ink,
                    fontFamily: FONT_UI,
                    fontSize: 13,
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = hover)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <span
                    style={{
                      width: 20,
                      textAlign: "center",
                      fontFamily: FONT_MONO,
                      fontSize: 12,
                      color: inkDim,
                    }}
                  >
                    {opt.emoji}
                  </span>
                  <span style={{ flex: 1 }}>{opt.label}</span>
                  <span style={{ fontSize: 9, color: inkDim, letterSpacing: 0.3 }}>
                    BLOCK
                  </span>
                </button>
              ))}
              <div
                style={{
                  borderTop: `1px solid ${hairline}`,
                  margin: "4px 0",
                }}
              />
            </>
          )}

          <div
            style={{
              padding: "6px 14px 4px",
              fontSize: 9,
              letterSpacing: 1.5,
              color: inkDim,
              textTransform: "uppercase",
              fontWeight: 600,
            }}
          >
            Jump to page
          </div>
          {filtered.length === 0 ? (
            <div
              style={{
                padding: 16,
                color: inkDim,
                fontSize: 13,
                fontStyle: "italic",
                textAlign: "center",
              }}
            >
              No pages match "{query}"
            </div>
          ) : (
            filtered.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => onJump(p.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  width: "100%",
                  padding: "8px 14px",
                  background: "transparent",
                  border: "none",
                  color: ink,
                  fontFamily: FONT_UI,
                  fontSize: 13,
                  cursor: "pointer",
                  textAlign: "left",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = hover)}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <span style={{ fontSize: 16, width: 20 }}>{p.emoji}</span>
                <span style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500 }}>{p.title}</div>
                  <div style={{ fontSize: 10, color: inkDim, letterSpacing: 0.3 }}>
                    {p.type} · {p.tags.join(" · ")}
                  </div>
                </span>
                <span
                  style={{
                    fontSize: 9,
                    color: inkDim,
                    background: hover,
                    padding: "1px 6px",
                    borderRadius: 3,
                  }}
                >
                  {p.status}
                </span>
              </button>
            ))
          )}
        </div>
        <div
          style={{
            padding: "6px 14px",
            background: hover,
            borderTop: `1px solid ${hairline}`,
            fontFamily: FONT_MONO,
            fontSize: 10,
            color: inkDim,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <span>↑ ↓ navigate · ↵ open</span>
          <span>Esc to close</span>
        </div>
      </div>
    </div>
  );
}

export default BlockEditorHomePage;
