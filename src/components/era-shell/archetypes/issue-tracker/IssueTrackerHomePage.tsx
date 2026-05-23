"use client";

/**
 * IssueTrackerHomePage — 2021 archetype: KIRUK · Sprint Board.
 *
 * 2021 was the breakout year for Linear — the keyboard-first issue
 * tracker that reshaped what SaaS UX could feel like. Dark indigo
 * surfaces, hairline borders, command-K palette, and the conviction
 * that every action should have a shortcut. This profile renders Arun
 * as a Linear workspace: each UX research artifact is an issue
 * (KIR-1..N), the Kanban board is the active sprint, and the right
 * rail is the issue detail panel.
 *
 * Paradigm versus prior eras:
 *   · 2018 block-editor = Notion-style nested pages
 *   · 2021 issue-tracker = LINEAR-STYLE KANBAN WORKFLOW with statuses,
 *     priorities, assignees, cycle progress, drag between columns
 *
 * Unique interactions:
 *   · Drag issues between Backlog / Todo / In Progress / Done columns
 *   · Command-K palette: fuzzy search · jump · assign · prioritize · close
 *   · Keyboard shortcuts: J/K navigate, ↵ open, X multi-select,
 *     A assign, P priority, C comment, / search
 *   · Inline issue edit (click title to rename)
 *   · Multi-select w/ Shift+click → bulk actions
 *   · Cycle progress bar tracks Done / Total live
 *   · View toggle: Board (kanban) · List · Triage (unassigned)
 *   · Quick-add issue (press C) inline at top of column
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

// ── Palette — Linear dark ────────────────────────────────────────────

const BG = "#08090a";
const SURF = "#16171a";
const SURF_2 = "#1d1e21";
const SURF_3 = "#26272c";
const INK = "#f7f7f8";
const INK_DIM = "#9095a0";
const INK_MUTE = "#6b7280";
const HAIRLINE = "#25262c";
const ACC = "#5e6ad2";        // Linear indigo
const ACC_DEEP = "#404aaa";
const MAGENTA = "#c476ee";
const RED = "#eb5757";
const ORANGE = "#fa8c16";
const YELLOW = "#f2c94c";
const GREEN = "#4cb782";
const BLUE = "#4287f5";
const GRAY = "#6b7280";

const FONT_UI = "'Inter', '-apple-system', 'system-ui', sans-serif";
const FONT_DISPLAY = "'Inter', '-apple-system', 'system-ui', sans-serif";
const FONT_MONO = "'JetBrains Mono', 'SFMono-Regular', 'Menlo', monospace";

// ── Issue model ──────────────────────────────────────────────────────

type Status = "backlog" | "todo" | "progress" | "done" | "canceled";
type Priority = "urgent" | "high" | "medium" | "low" | "none";

interface Issue {
  id: string;            // KIR-1
  title: string;
  artifact: string;      // which UX artifact this issue represents
  status: Status;
  priority: Priority;
  assignee: string;      // initials
  assigneeName: string;
  labels: string[];
  estimate?: number;     // points
  due?: string;          // dd MMM
  desc: string;
  subtasks?: Array<{ id: string; title: string; done: boolean }>;
  links?: PageId[];      // cross-issue links
  activity?: Array<{ ts: number; text: string }>;
}

type PageId = string; // alias for IDs

const STATUS_META: Record<Status, { label: string; color: string; icon: string }> = {
  backlog:  { label: "Backlog",     color: GRAY,   icon: "○" },
  todo:     { label: "Todo",        color: BLUE,   icon: "◔" },
  progress: { label: "In Progress", color: ORANGE, icon: "◑" },
  done:     { label: "Done",        color: GREEN,  icon: "●" },
  canceled: { label: "Canceled",    color: RED,    icon: "⊘" },
};

const PRIORITY_META: Record<Priority, { label: string; color: string; icon: string }> = {
  urgent: { label: "Urgent",      color: RED,    icon: "▰▰▰" },
  high:   { label: "High",        color: ORANGE, icon: "▰▰▱" },
  medium: { label: "Medium",      color: YELLOW, icon: "▰▱▱" },
  low:    { label: "Low",         color: BLUE,   icon: "▱▱▱" },
  none:   { label: "No priority", color: GRAY,   icon: "—" },
};

function buildIssues(): Issue[] {
  const nodes = buildTimeline();
  const now = Date.now();
  const d = 86_400_000;
  const h = 3_600_000;
  return [
    {
      id: "KIR-1",
      title: "Ship the thesis · why the bridge role exists",
      artifact: "WHY KIRUK · Thesis",
      status: "done",
      priority: "urgent",
      assignee: "AK",
      assigneeName: "Arun Kumaar",
      labels: ["thesis", "ux research", "bridge"],
      estimate: 5,
      due: "Mar 14",
      desc: `HOOK: ${WHY_KIRUK.hook}\n\nPAIN: ${WHY_KIRUK.pain}\n\nBRIDGE: ${WHY_KIRUK.bridge}\n\nTAGLINE: "${WHY_KIRUK.tagline}"`,
      subtasks: [
        { id: "s1-1", title: "Frame the pain in one line", done: true },
        { id: "s1-2", title: "Name the bridge (designer ↔ engineer)", done: true },
        { id: "s1-3", title: `Ship tagline: "${WHY_KIRUK.tagline.slice(0, 36)}…"`, done: true },
      ],
      links: ["KIR-2", "KIR-3"],
      activity: [
        { ts: now - d * 14, text: "AK · created from research outline" },
        { ts: now - d * 10, text: "AK · moved to In Progress" },
        { ts: now - d * 5, text: "AK · moved to Done · merged to disc" },
      ],
    },
    {
      id: "KIR-2",
      title: `Draw persona on the designer himself · ${PERSONA.identity.name}`,
      artifact: "PERSONA · Identity",
      status: "done",
      priority: "urgent",
      assignee: "AK",
      assigneeName: "Arun Kumaar",
      labels: ["persona", "ux research", "identity"],
      estimate: 5,
      due: "Mar 18",
      desc: `Frame the designer as the user under study.\n\nNAME: ${PERSONA.identity.name}\nROLE: ${PERSONA.identity.role}\nEMPLOYER: ${PERSONA.identity.org}\nLOCATION: ${PERSONA.identity.location}\nTYPE: Designer ↔ Engineer · bridge\n\nQUOTE: "${PERSONA.quote}"\n\nBACKGROUND: ${PERSONA.background}`,
      subtasks: [
        { id: "s2-1", title: `Identity table — name, role, employer, location`, done: true },
        { id: "s2-2", title: `Goals (${PERSONA.goals.length}) — ${PERSONA.goals[0]}, …`, done: true },
        { id: "s2-3", title: `Frustrations (${PERSONA.frustrations.length}) — ${PERSONA.frustrations[0]}, …`, done: true },
        { id: "s2-4", title: "Background paragraph", done: true },
        { id: "s2-5", title: "Pull quote", done: true },
      ],
      links: ["KIR-3", "KIR-1"],
      activity: [
        { ts: now - d * 12, text: "AK · created" },
        { ts: now - d * 8, text: "AK · added goals + frustrations" },
        { ts: now - d * 4, text: "AK · moved to Done" },
      ],
    },
    {
      id: "KIR-3",
      title: "Cross-cut Says + Does — prove the bridge claim",
      artifact: "EMPATHY MAP · Says ↔ Does",
      status: "done",
      priority: "high",
      assignee: "AK",
      assigneeName: "Arun Kumaar",
      labels: ["empathy map", "synthesis", "ux research"],
      estimate: 3,
      due: "Mar 22",
      desc: `Validate convergence between Says column and Does column.\n\nSAYS: "${EMPATHY_MAP.says.quote}"\nClaimed skills: ${EMPATHY_MAP.says.skills.join(", ")}\n\nDOES: tools in active rotation — ${EMPATHY_MAP.does.join(", ")}\n\nTHINKS: ${EMPATHY_MAP.thinks.join(" · ")}\n\nFEELS: ${EMPATHY_MAP.feels.join(" · ")}\n\nSYNTHESIS: Says and Does cross the same line — Figma + Blender on one side, Next.js + Spring Boot on the other. Two columns, opposite ends, same answer. Convergence is what makes the persona believable.`,
      subtasks: [
        { id: "s3-1", title: `Says quote + ${EMPATHY_MAP.says.skills.length} skills listed`, done: true },
        { id: "s3-2", title: `Thinks: ${EMPATHY_MAP.thinks.length} operating rules`, done: true },
        { id: "s3-3", title: `Does: ${EMPATHY_MAP.does.length} tools in rotation`, done: true },
        { id: "s3-4", title: `Feels: ${EMPATHY_MAP.feels.length} motivations`, done: true },
        { id: "s3-5", title: "Write synthesis paragraph", done: true },
      ],
      links: ["KIR-2", "KIR-12"],
      activity: [
        { ts: now - d * 5, text: "AK · created" },
        { ts: now - d * 3, text: "AK · moved to Done" },
      ],
    },
    {
      id: "KIR-4",
      title: `Plot lifeline — ${nodes.length} phases, ${nodes[nodes.length - 1].year} - ${nodes[0].year} years`,
      artifact: "JOURNEY MAP · Career lifeline",
      status: "progress",
      priority: "high",
      assignee: "AK",
      assigneeName: "Arun Kumaar",
      labels: ["journey map", "career", "lifeline"],
      estimate: 3,
      due: "Today",
      desc: `Render seven years as five phases.\n\n${nodes.map((n) => `${n.year} · ${n.phase} — ${n.position} @ ${n.org.split(" · ")[0]}`).join("\n")}\n\nPATTERN: design freelancing + engineering school ran in parallel for years. The bridge role only existed in a job title after the timelines collided.`,
      subtasks: [
        ...nodes.map((n, i) => ({
          id: `s4-${i + 1}`,
          title: `${n.year} · ${n.phase} — ${n.position}`,
          done: i < nodes.length - 2,
        })),
        { id: "s4-final", title: "Pattern paragraph + live-node indicator", done: false },
      ],
      links: ["KIR-2"],
      activity: [
        { ts: now - d * 2, text: "AK · created" },
        { ts: now - h * 6, text: "AK · moved to In Progress" },
      ],
    },
    {
      id: "KIR-5",
      title: `Receipts only · ${IMPACT_METRICS.length} cite-able figures`,
      artifact: "IMPACT METRICS · Outcomes",
      status: "progress",
      priority: "medium",
      assignee: "AK",
      assigneeName: "Arun Kumaar",
      labels: ["impact", "outcomes", "receipts"],
      estimate: 2,
      due: "Today",
      desc: `Output vs outcome — outcome only on this disc. Each figure must pair with a shipped surface before it lands here.\n\n${IMPACT_METRICS.slice(0, 6).map((m) => `${m.icon} ${m.value} — ${m.label}${m.context ? ` (${m.context})` : ""}`).join("\n")}`,
      subtasks: IMPACT_METRICS.slice(0, 5).map((m, i) => ({
        id: `s5-${i + 1}`,
        title: `${m.value} ${m.label} — pair w/ screenshot`,
        done: i < 2,
      })),
      links: ["KIR-6"],
      activity: [
        { ts: now - d * 1, text: "AK · created" },
        { ts: now - h * 2, text: "AK · moved to In Progress" },
      ],
    },
    {
      id: "KIR-6",
      title: `Card-sort ${CARD_SORTING.projects.length} works → ${CARD_SORTING.taxonomy.filter((t) => t !== "All").length} categories`,
      artifact: "CARD SORT · Selected Works",
      status: "todo",
      priority: "medium",
      assignee: "AK",
      assigneeName: "Arun Kumaar",
      labels: ["card sort", "works", "case studies"],
      estimate: 3,
      due: "Mar 30",
      desc: `Render selected works as plates.\n\nCATEGORIES: ${CARD_SORTING.taxonomy.filter((t) => t !== "All").join(" · ")}\n\nPROJECTS:\n${CARD_SORTING.projects.map((p, i) => `${["I", "II", "III", "IV"][i] ?? i + 1}. ${p.title} — ${p.category} · ${p.duration}`).join("\n")}\n\nEach card carries title, brief, duration, role, tech stack.`,
      subtasks: CARD_SORTING.projects.map((p, i) => ({
        id: `s6-${i + 1}`,
        title: `Plate ${["I", "II", "III", "IV"][i] ?? i + 1} · ${p.title}`,
        done: false,
      })),
      links: ["KIR-5"],
    },
    {
      id: "KIR-7",
      title: `Engagement protocol · rank ${USABILITY_TEST.channels.length} channels`,
      artifact: "USABILITY TEST · Channels",
      status: "todo",
      priority: "low",
      assignee: "AK",
      assigneeName: "Arun Kumaar",
      labels: ["contact", "channels", "usability test"],
      estimate: 2,
      due: "Apr 02",
      desc: `Task: ${USABILITY_TEST.task}. ${USABILITY_TEST.taskBody}\n\n${USABILITY_TEST.channels.map((c) => `${c.label} — ${c.value} · ${c.role}`).join("\n")}\n\nSUCCESS METRICS: ${USABILITY_TEST.successMetrics.join(" · ")}\n\nLatency before politeness — pick channel by question type, not etiquette.`,
      subtasks: USABILITY_TEST.channels.map((c, i) => ({
        id: `s7-${i + 1}`,
        title: `${c.label} row — ${c.role}`,
        done: false,
      })),
      links: ["KIR-2"],
    },
    {
      id: "KIR-8",
      title: "Heuristic eval pass on the disc itself",
      artifact: "USABILITY · Heuristic Eval",
      status: "backlog",
      priority: "low",
      assignee: "AK",
      assigneeName: "Arun Kumaar",
      labels: ["heuristic", "review", "ux research"],
      estimate: 2,
      desc: `Run Nielsen's 10 heuristics on the disc once all artifacts are shipped.\n\n1. Visibility of system status\n2. Match between system and real world\n3. User control and freedom\n4. Consistency and standards\n5. Error prevention\n6. Recognition rather than recall\n7. Flexibility and efficiency\n8. Aesthetic and minimalist design\n9. Help users recognize, diagnose, recover from errors\n10. Help and documentation\n\nTrack findings as sub-issues per heuristic.`,
      subtasks: [
        { id: "s8-1", title: "Heuristic 1 — Visibility", done: false },
        { id: "s8-2", title: "Heuristic 2 — Match real-world", done: false },
        { id: "s8-3", title: "Heuristic 3 — User control", done: false },
      ],
    },
    {
      id: "KIR-9",
      title: "A/B test the hero hook vs tagline",
      artifact: "USABILITY · A/B Test",
      status: "backlog",
      priority: "low",
      assignee: "AK",
      assigneeName: "Arun Kumaar",
      labels: ["experiment", "a/b", "hero"],
      estimate: 1,
      desc: `Test which hero copy converts better — the long-form hook or the short tagline.\n\nVARIANT A: "${WHY_KIRUK.tagline}"\nVARIANT B: "${WHY_KIRUK.hook}"\n\nMEASURE: scroll depth past hero · clicks on contact channel · time on disc.\n\nROLLOUT: 50/50 split for 14 days.`,
    },
    {
      id: "KIR-10",
      title: "Migrate disc to new subdomain — disc.kiruk.com",
      artifact: "Infra · Domain",
      status: "canceled",
      priority: "none",
      assignee: "AK",
      assigneeName: "Arun Kumaar",
      labels: ["infra", "domain"],
      desc: "Canceled — kiruk.com stays as the canonical address. Disc lives at root.",
      activity: [
        { ts: now - d * 18, text: "AK · created" },
        { ts: now - d * 16, text: "AK · moved to Canceled — root URL is fine" },
      ],
    },
    {
      id: "KIR-11",
      title: "Operating compass · 3 rules from EMPATHY · Thinks",
      artifact: "EMPATHY · Thinks · Manifesto",
      status: "todo",
      priority: "medium",
      assignee: "AK",
      assigneeName: "Arun Kumaar",
      labels: ["manifesto", "compass", "operating rules"],
      estimate: 1,
      due: "Apr 05",
      desc: `Three rules I keep returning to. Not aphorisms — filters that decide what gets a frame, what gets a route, what gets cut.\n\n${EMPATHY_MAP.thinks.map((t, i) => `${i + 1}. ${t}`).join("\n")}\n\nRender as its own page. Cross-link from @KIR-3 empathy map.`,
      subtasks: EMPATHY_MAP.thinks.map((t, i) => ({
        id: `s11-${i + 1}`,
        title: `Rule ${i + 1} — ${t}`,
        done: false,
      })),
      links: ["KIR-3"],
    },
    {
      id: "KIR-12",
      title: `Current bench — ${nodes[nodes.length - 1].position} @ ${nodes[nodes.length - 1].org.split(" · ")[0]}`,
      artifact: "PROFILE · Now",
      status: "done",
      priority: "high",
      assignee: "AK",
      assigneeName: "Arun Kumaar",
      labels: ["current", "bench", "live"],
      estimate: 2,
      due: "Mar 26",
      desc: `${nodes[nodes.length - 1].position} @ ${nodes[nodes.length - 1].org}.\n\nDETAIL: ${nodes[nodes.length - 1].detail}\n\nPHASE: ${nodes[nodes.length - 1].phase}\nYEAR: ${nodes[nodes.length - 1].year}\nSTATUS: ● live`,
      subtasks: [
        { id: "s12-1", title: "Confirm position + employer", done: true },
        { id: "s12-2", title: "Pull bench detail line", done: true },
        { id: "s12-3", title: "Mark live", done: true },
      ],
      activity: [
        { ts: now - d * 7, text: "AK · created" },
        { ts: now - d * 1, text: "AK · moved to Done" },
      ],
    },
  ];
}

const COLUMNS: Status[] = ["backlog", "todo", "progress", "done"];

// ── Hook ─────────────────────────────────────────────────────────────

function useIsMobile(breakpoint = 900): boolean {
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

export function IssueTrackerHomePage() {
  const { setLayoutMode } = useLayoutMode();
  useEffect(() => {
    setLayoutMode("full-digital");
  }, [setLayoutMode]);
  const isMobile = useIsMobile();

  const [issues, setIssues] = useState<Issue[]>(() => buildIssues());

  // Selection
  const [selectedId, setSelectedId] = useState<string>("KIR-1");
  const selected = issues.find((i) => i.id === selectedId) ?? issues[0];
  const [multiSel, setMultiSel] = useState<Set<string>>(new Set());

  // View mode — force list on mobile
  const [view, setView] = useState<"board" | "list" | "triage">("board");
  useEffect(() => {
    if (isMobile && view === "board") setView("list");
  }, [isMobile, view]);

  // Filter chips
  const [filter, setFilter] = useState<string | null>(null);

  // Sidebar collapse
  const [sideOpen, setSideOpen] = useState(!isMobile);
  useEffect(() => setSideOpen(!isMobile), [isMobile]);

  // Right rail (desktop) and mobile detail sheet
  const [railOpen, setRailOpen] = useState(true);
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);
  useEffect(() => {
    if (isMobile) setRailOpen(false);
    else setMobileDetailOpen(false);
  }, [isMobile]);
  useEffect(() => {
    if (!isMobile || !mobileDetailOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [isMobile, mobileDetailOpen]);
  const [mobileSideOpen, setMobileSideOpen] = useState(false);

  // Command palette
  const [cmdOpen, setCmdOpen] = useState(false);
  const [cmdQuery, setCmdQuery] = useState("");

  // Quick-add
  const [quickAdd, setQuickAdd] = useState<Status | null>(null);
  const [quickTitle, setQuickTitle] = useState("");

  // Inline title edit
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  // Toast
  const [toast, setToast] = useState<string | null>(null);
  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 1800);
    return () => window.clearTimeout(id);
  }, [toast]);

  // Drag state
  const dragRef = useRef<{ ids: string[] } | null>(null);

  // Per-issue comments (sessionStorage)
  type IssueComment = { id: string; author: string; body: string; ts: number };
  const [issueComments, setIssueComments] = useState<Record<string, IssueComment[]>>({});
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("kiruk-2021-comments");
      if (raw) setIssueComments(JSON.parse(raw) as Record<string, IssueComment[]>);
    } catch {/* noop */}
  }, []);
  useEffect(() => {
    try {
      sessionStorage.setItem("kiruk-2021-comments", JSON.stringify(issueComments));
    } catch {/* noop */}
  }, [issueComments]);
  const addIssueComment = useCallback(
    (issueId: string, body: string, author?: string) => {
      if (!body.trim()) return;
      setIssueComments((all) => ({
        ...all,
        [issueId]: [
          ...(all[issueId] ?? []),
          {
            id: `c-${Date.now()}`,
            author: (author ?? "guest").trim() || "guest",
            body: body.trim(),
            ts: Date.now(),
          },
        ],
      }));
    },
    [],
  );

  // Live activity feed (latest N moves / edits)
  type Action = { id: string; text: string; ts: number; author: string };
  const [activity, setActivity] = useState<Action[]>([]);
  const logAction = useCallback((text: string) => {
    setActivity((a) =>
      [
        { id: `a-${Date.now()}`, text, ts: Date.now(), author: "AK" },
        ...a,
      ].slice(0, 30),
    );
  }, []);

  // Cycle countdown — 14-day cycle, midpoint
  const cycleEnd = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d;
  }, []);
  const daysLeft = Math.max(0, Math.ceil((cycleEnd.getTime() - Date.now()) / 86400000));

  // Filtered view — match label or artifact substring (case-insensitive)
  const visible = useMemo(() => {
    if (!filter) return issues;
    const f = filter.toLowerCase();
    return issues.filter(
      (i) =>
        i.labels.some((l) => l.toLowerCase().includes(f)) ||
        i.artifact.toLowerCase().includes(f),
    );
  }, [issues, filter]);

  // Actions
  const moveTo = useCallback(
    (ids: string[], status: Status) => {
      setIssues((all) =>
        all.map((i) => (ids.includes(i.id) ? { ...i, status } : i)),
      );
      const label = STATUS_META[status].label;
      const summary =
        ids.length === 1
          ? `${ids[0]} → ${label}`
          : `${ids.length} issues → ${label}`;
      setToast(summary);
      logAction(summary);
    },
    [logAction],
  );

  const setPriority = useCallback(
    (ids: string[], priority: Priority) => {
      setIssues((all) =>
        all.map((i) => (ids.includes(i.id) ? { ...i, priority } : i)),
      );
      const summary = `${ids.length === 1 ? ids[0] : ids.length + " issues"} · priority → ${PRIORITY_META[priority].label}`;
      setToast(summary);
      logAction(summary);
    },
    [logAction],
  );

  // Add sub-issue to current issue
  const addSubtask = useCallback((issueId: string, title: string) => {
    if (!title.trim()) return;
    setIssues((all) =>
      all.map((i) => {
        if (i.id !== issueId) return i;
        const sub = i.subtasks ?? [];
        return {
          ...i,
          subtasks: [
            ...sub,
            { id: `${issueId}-st-${Date.now()}`, title: title.trim(), done: false },
          ],
        };
      }),
    );
    logAction(`${issueId} · added sub-issue "${title.slice(0, 24)}"`);
  }, [logAction]);

  const renameTitle = useCallback((id: string, title: string) => {
    setIssues((all) =>
      all.map((i) => (i.id === id ? { ...i, title } : i)),
    );
  }, []);

  const toggleSubtask = useCallback((issueId: string, taskId: string) => {
    setIssues((all) =>
      all.map((i) => {
        if (i.id !== issueId) return i;
        const subtasks = (i.subtasks ?? []).map((t) =>
          t.id === taskId ? { ...t, done: !t.done } : t,
        );
        return { ...i, subtasks };
      }),
    );
  }, []);

  const addIssue = useCallback(
    (status: Status, title: string) => {
      if (!title.trim()) return;
      const next = `KIR-${issues.length + 1}`;
      setIssues((all) => [
        ...all,
        {
          id: next,
          title: title.trim(),
          artifact: "Visitor submission",
          status,
          priority: "none",
          assignee: "GU",
          assigneeName: "Guest",
          labels: ["new"],
          desc: "",
        },
      ]);
      setQuickAdd(null);
      setQuickTitle("");
      setSelectedId(next);
      setToast(`✓ created ${next}`);
      logAction(`created ${next} · "${title.slice(0, 28)}"`);
    },
    [issues.length, logAction],
  );

  // Cycle stats
  const cycleStats = useMemo(() => {
    const total = issues.filter((i) => i.status !== "canceled").length;
    const done = issues.filter((i) => i.status === "done").length;
    const inProg = issues.filter((i) => i.status === "progress").length;
    const todo = issues.filter((i) => i.status === "todo").length;
    const back = issues.filter((i) => i.status === "backlog").length;
    return { total, done, inProg, todo, back, pct: total ? Math.round((done / total) * 100) : 0 };
  }, [issues]);

  // Keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      const isInput = tag === "INPUT" || tag === "TEXTAREA";
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCmdOpen(true);
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
        setMultiSel(new Set());
        setQuickAdd(null);
        setEditingId(null);
      }
      if (e.key.toLowerCase() === "j") {
        const idx = visible.findIndex((i) => i.id === selectedId);
        if (idx >= 0 && idx < visible.length - 1) {
          e.preventDefault();
          setSelectedId(visible[idx + 1].id);
        }
      }
      if (e.key.toLowerCase() === "k") {
        const idx = visible.findIndex((i) => i.id === selectedId);
        if (idx > 0) {
          e.preventDefault();
          setSelectedId(visible[idx - 1].id);
        }
      }
      if (e.key.toLowerCase() === "c" && !isInput) {
        e.preventDefault();
        setQuickAdd("todo");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [visible, selectedId]);

  // Track visit
  useEffect(() => {
    fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "page_view", path: "/era/2021" }),
    }).catch(() => {});
  }, []);

  return (
    <main
      id="kiruk-linear"
      style={{
        position: "relative",
        minHeight: "100vh",
        background: BG,
        color: INK,
        fontFamily: FONT_UI,
        paddingTop: 0,
        paddingBottom: 0,
      }}
    >
      <style jsx global>{`
        @keyframes kiruk-2021-fade {
          0% { opacity: 0; transform: translateY(4px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes kiruk-2021-modal-in {
          0% { opacity: 0; transform: scale(0.96); }
          100% { opacity: 1; transform: scale(1); }
        }
        #kiruk-linear *:focus-visible {
          outline: 2px solid ${ACC};
          outline-offset: 2px;
          border-radius: 4px;
        }
      `}</style>

      {/* TOP CHROME */}
      <header
        style={{
          position: "sticky",
          top: "calc(var(--simple-game-nav-bottom, 56px))",
          zIndex: 30,
          background: BG,
          borderBottom: `1px solid ${HAIRLINE}`,
          padding: "6px 14px",
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "auto 1fr auto",
          alignItems: "center",
          gap: 10,
          fontSize: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            type="button"
            onClick={() => (isMobile ? setMobileSideOpen((s) => !s) : setSideOpen((s) => !s))}
            title="Toggle sidebar"
            style={{
              width: 28,
              height: 28,
              background: "transparent",
              border: "none",
              color: INK_DIM,
              cursor: "pointer",
              borderRadius: 3,
              fontSize: 16,
            }}
          >
            ☰
          </button>
          <div
            aria-hidden
            style={{
              width: 20,
              height: 20,
              borderRadius: 4,
              background: `linear-gradient(135deg, ${ACC} 0%, ${MAGENTA} 100%)`,
            }}
          />
          <div style={{ fontSize: 13, fontWeight: 600 }}>
            KIRUK
          </div>
          {!isMobile && (
            <>
              <span style={{ color: INK_DIM }}>·</span>
              <span style={{ color: INK_DIM }}>
                <span style={{ color: INK }}>Cycle 14</span> · sprint board
              </span>
            </>
          )}
        </div>

        {/* View toggle */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            justifyContent: "center",
          }}
        >
          {!isMobile && (
            <Seg active={view === "board"} onClick={() => setView("board")}>▦ Board</Seg>
          )}
          <Seg active={view === "list"} onClick={() => setView("list")}>≡ List</Seg>
          <Seg active={view === "triage"} onClick={() => setView("triage")}>⚐ Triage</Seg>
        </div>

        <div style={{ display: "flex", gap: 6, alignItems: "center", justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={() => setCmdOpen(true)}
            title="Command palette · ⌘K or /"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "3px 10px",
              background: SURF,
              color: INK_DIM,
              border: `1px solid ${HAIRLINE}`,
              borderRadius: 6,
              fontFamily: FONT_UI,
              fontSize: 11,
              cursor: "pointer",
              minWidth: isMobile ? 0 : 160,
              flex: isMobile ? 1 : "none",
            }}
          >
            <span>🔍 {isMobile ? "Search" : "Search or command"}</span>
            {!isMobile && <Kbd>⌘K</Kbd>}
          </button>
          <button
            type="button"
            onClick={() => setQuickAdd("todo")}
            title="New issue · C"
            style={{
              padding: "3px 10px",
              background: ACC,
              color: "#fff",
              border: `1px solid ${ACC_DEEP}`,
              borderRadius: 6,
              fontFamily: FONT_UI,
              fontSize: 11,
              fontWeight: 500,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            + New issue <Kbd dark>C</Kbd>
          </button>
        </div>
      </header>

      {/* Cycle progress bar */}
      <div
        style={{
          padding: "6px 14px",
          background: SURF,
          borderBottom: `1px solid ${HAIRLINE}`,
          display: "flex",
          alignItems: "center",
          gap: 10,
          fontSize: 11,
          color: INK_DIM,
          flexWrap: isMobile ? "nowrap" : "wrap",
          overflowX: isMobile ? "auto" : "visible",
          whiteSpace: isMobile ? "nowrap" : "normal",
        }}
      >
        <span style={{ color: INK, fontWeight: 500 }}>
          Cycle 14
          <span style={{ color: INK_DIM, marginLeft: 4 }}>· Mar 14 → Mar 28</span>
          <span
            style={{
              marginLeft: 6,
              padding: "1px 6px",
              fontSize: 9,
              background: daysLeft <= 2 ? `${RED}22` : `${ACC}22`,
              color: daysLeft <= 2 ? RED : ACC,
              borderRadius: 999,
              fontFamily: FONT_MONO,
            }}
          >
            {daysLeft}d left
          </span>
        </span>
        <div
          style={{
            flex: 1,
            minWidth: 200,
            height: 6,
            background: SURF_3,
            borderRadius: 3,
            overflow: "hidden",
            position: "relative",
          }}
        >
          <div
            style={{
              width: `${cycleStats.pct}%`,
              height: "100%",
              background: `linear-gradient(90deg, ${ACC} 0%, ${MAGENTA} 100%)`,
              borderRadius: 3,
              transition: "width 320ms",
            }}
          />
        </div>
        <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: INK }}>
          {cycleStats.done}/{cycleStats.total} · {cycleStats.pct}%
        </span>
        <span style={{ color: GREEN }}>● {cycleStats.done} done</span>
        <span style={{ color: ORANGE }}>● {cycleStats.inProg} in progress</span>
        <span style={{ color: BLUE }}>● {cycleStats.todo} todo</span>
        <span style={{ color: GRAY }}>● {cycleStats.back} backlog</span>
      </div>

      {/* BODY */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile
            ? "1fr"
            : `${sideOpen ? 220 : 0}px 1fr ${railOpen ? 320 : 0}px`,
          minHeight: "calc(100vh - 130px)",
          alignItems: "stretch",
        }}
      >
        {/* SIDEBAR */}
        {sideOpen && !isMobile && (
          <aside
            style={{
              background: SURF,
              borderRight: `1px solid ${HAIRLINE}`,
              padding: "10px 6px",
              fontSize: 12,
              overflowY: "auto",
            }}
          >
            <SideHead label="Workspace" />
            <SideItem icon="📥" onClick={() => setFilter(null)} active={!filter}>
              Inbox
              <span style={{ marginLeft: "auto", color: INK_DIM, fontSize: 10 }}>{issues.length}</span>
            </SideItem>
            <SideItem icon="◉" onClick={() => setFilter(null)} active={!filter}>
              My issues
              <span style={{ marginLeft: "auto", color: INK_DIM, fontSize: 10 }}>{issues.length}</span>
            </SideItem>
            <SideItem icon="📊" onClick={() => setFilter(null)}>
              Active cycle
              <span style={{ marginLeft: "auto", color: INK_DIM, fontSize: 10 }}>{cycleStats.total - cycleStats.back}</span>
            </SideItem>

            <SideHead label="Filters" />
            {["thesis", "persona", "empathy map", "journey map", "impact", "card sort", "contact", "manifesto"].map((l) => (
              <SideItem
                key={l}
                icon={"#"}
                onClick={() => setFilter(filter === l ? null : l)}
                active={filter === l}
              >
                {l}
              </SideItem>
            ))}

            <SideHead label="Team" />
            <div style={{ padding: "4px 10px", display: "flex", alignItems: "center", gap: 6, color: INK_DIM, fontSize: 11 }}>
              <Avatar initials="AK" tint={ACC} />
              <span>Arun Kumaar</span>
              <span style={{ marginLeft: "auto", color: GREEN, fontSize: 9 }}>●</span>
            </div>
          </aside>
        )}

        {/* MAIN */}
        <section style={{ background: BG, overflow: "auto" }}>
          {view === "board" && (
            <BoardView
              issues={visible}
              selectedId={selectedId}
              multiSel={multiSel}
              quickAdd={quickAdd}
              quickTitle={quickTitle}
              editingId={editingId}
              editTitle={editTitle}
              onSelect={(id, shift) => {
                if (shift) {
                  setMultiSel((s) => {
                    const next = new Set(s);
                    if (next.has(id)) next.delete(id);
                    else next.add(id);
                    return next;
                  });
                } else {
                  setSelectedId(id);
                  setMultiSel(new Set());
                  if (isMobile) setMobileDetailOpen(true);
                  else setRailOpen(true);
                }
              }}
              onMove={(id, status) => moveTo([id], status)}
              onQuickAdd={(status) => {
                setQuickAdd(status);
                setQuickTitle("");
              }}
              onQuickAddCommit={(status) => {
                addIssue(status, quickTitle);
              }}
              onQuickAddChange={(t) => setQuickTitle(t)}
              onQuickAddCancel={() => {
                setQuickAdd(null);
                setQuickTitle("");
              }}
              onTitleEdit={(id) => {
                const issue = issues.find((i) => i.id === id);
                if (issue) {
                  setEditingId(id);
                  setEditTitle(issue.title);
                }
              }}
              onTitleChange={(t) => setEditTitle(t)}
              onTitleCommit={() => {
                if (editingId) renameTitle(editingId, editTitle.trim() || "Untitled");
                setEditingId(null);
              }}
              onDragStart={(id) => {
                const ids = multiSel.has(id) ? Array.from(multiSel) : [id];
                dragRef.current = { ids };
              }}
              onDragDrop={(status) => {
                const d = dragRef.current;
                if (!d) return;
                moveTo(d.ids, status);
                dragRef.current = null;
              }}
            />
          )}
          {view === "list" && (
            <ListView
              issues={visible}
              selectedId={selectedId}
              isMobile={isMobile}
              onSelect={(id) => {
                setSelectedId(id);
                if (isMobile) setMobileDetailOpen(true);
                else setRailOpen(true);
              }}
              onStatusChange={(id, st) => moveTo([id], st)}
            />
          )}
          {view === "triage" && (
            <TriageView
              issues={visible.filter((i) => i.priority === "none" || i.status === "backlog")}
              onAssign={(id) => moveTo([id], "todo")}
              onSelect={(id) => {
                setSelectedId(id);
                if (isMobile) setMobileDetailOpen(true);
                else setRailOpen(true);
              }}
            />
          )}
        </section>

        {/* RIGHT RAIL (desktop) */}
        {railOpen && !isMobile && (
          <aside
            style={{
              background: SURF,
              borderLeft: `1px solid ${HAIRLINE}`,
              padding: "12px 14px",
              fontSize: 12,
              overflowY: "auto",
              maxHeight: "calc(100vh - 130px)",
            }}
          >
            <IssueDetail
              issue={selected}
              comments={issueComments[selected.id] ?? []}
              onClose={() => setRailOpen(false)}
              onPriority={(p) => setPriority([selected.id], p)}
              onStatus={(s) => moveTo([selected.id], s)}
              onSubtaskToggle={(t) => toggleSubtask(selected.id, t)}
              onSubtaskAdd={(title) => addSubtask(selected.id, title)}
              onCommentAdd={(body, author) => addIssueComment(selected.id, body, author)}
              onLink={(id) => setSelectedId(id)}
            />
          </aside>
        )}
        {!railOpen && !isMobile && (
          <button
            type="button"
            onClick={() => setRailOpen(true)}
            title="Show issue detail"
            style={{
              position: "fixed",
              right: 0,
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 25,
              padding: "12px 6px",
              background: ACC,
              color: "#fff",
              border: `1px solid ${ACC_DEEP}`,
              borderRight: "none",
              borderRadius: "8px 0 0 8px",
              fontFamily: FONT_UI,
              fontSize: 11,
              fontWeight: 600,
              cursor: "pointer",
              writingMode: "vertical-rl",
              letterSpacing: 1,
              boxShadow: "-4px 0 12px rgba(0,0,0,0.4)",
            }}
          >
            ‹ {selected.id} · open
          </button>
        )}
      </div>

      {/* MOBILE SIDEBAR DRAWER */}
      {isMobile && mobileSideOpen && (
        <div
          onClick={() => setMobileSideOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 150,
            background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(4px)",
          }}
        >
          <aside
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: "min(260px, 80vw)",
              background: SURF,
              borderRight: `1px solid ${HAIRLINE}`,
              padding: "10px 6px",
              overflowY: "auto",
              animation: "kiruk-2021-fade 200ms ease-out",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 10px 8px" }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: INK }}>KIRUK</span>
              <button
                type="button"
                onClick={() => setMobileSideOpen(false)}
                style={{ background: "transparent", border: "none", color: INK_DIM, fontSize: 18, cursor: "pointer" }}
              >
                ✕
              </button>
            </div>
            <SideHead label="Workspace" />
            <SideItem icon="📥" onClick={() => { setFilter(null); setMobileSideOpen(false); }} active={!filter}>
              Inbox <span style={{ marginLeft: "auto", color: INK_DIM, fontSize: 10 }}>{issues.length}</span>
            </SideItem>
            <SideHead label="Filters" />
            {["thesis", "persona", "empathy map", "journey map", "impact", "card sort", "contact", "manifesto"].map((l) => (
              <SideItem
                key={l}
                icon="#"
                onClick={() => { setFilter(filter === l ? null : l); setMobileSideOpen(false); }}
                active={filter === l}
              >
                {l}
              </SideItem>
            ))}
            <SideHead label="Team" />
            <div style={{ padding: "4px 10px", display: "flex", alignItems: "center", gap: 6, color: INK_DIM, fontSize: 11 }}>
              <Avatar initials="AK" tint={ACC} />
              <span>Arun Kumaar</span>
              <span style={{ marginLeft: "auto", color: GREEN, fontSize: 9 }}>●</span>
            </div>
          </aside>
        </div>
      )}

      {/* MOBILE ISSUE DETAIL SHEET */}
      {isMobile && mobileDetailOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 160,
            background: BG,
            overflowY: "auto",
            animation: "kiruk-2021-fade 220ms ease-out",
          }}
        >
          <div
            style={{
              position: "sticky",
              top: 0,
              zIndex: 5,
              background: SURF,
              borderBottom: `1px solid ${HAIRLINE}`,
              padding: "10px 14px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <button
              type="button"
              onClick={() => setMobileDetailOpen(false)}
              style={{
                background: "transparent",
                border: `1px solid ${HAIRLINE}`,
                color: INK,
                padding: "4px 10px",
                borderRadius: 6,
                fontFamily: FONT_UI,
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              ‹ Back to board
            </button>
            <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: INK_DIM }}>
              {selected.id}
            </span>
          </div>
          <div style={{ padding: "14px 16px 80px" }}>
            <IssueDetail
              issue={selected}
              comments={issueComments[selected.id] ?? []}
              onClose={() => setMobileDetailOpen(false)}
              onPriority={(p) => setPriority([selected.id], p)}
              onStatus={(s) => moveTo([selected.id], s)}
              onSubtaskToggle={(t) => toggleSubtask(selected.id, t)}
              onSubtaskAdd={(title) => addSubtask(selected.id, title)}
              onCommentAdd={(body, author) => addIssueComment(selected.id, body, author)}
              onLink={(id) => setSelectedId(id)}
            />
          </div>
        </div>
      )}

      {/* COMMAND PALETTE */}
      {cmdOpen && (
        <CommandPalette
          query={cmdQuery}
          setQuery={setCmdQuery}
          issues={issues}
          selectedId={selectedId}
          onJump={(id) => {
            setSelectedId(id);
            setCmdOpen(false);
            setCmdQuery("");
          }}
          onStatus={(s) => {
            const target = multiSel.size > 0 ? Array.from(multiSel) : [selectedId];
            moveTo(target, s);
            setCmdOpen(false);
            setCmdQuery("");
          }}
          onPriority={(p) => {
            const target = multiSel.size > 0 ? Array.from(multiSel) : [selectedId];
            setPriority(target, p);
            setCmdOpen(false);
            setCmdQuery("");
          }}
          onClose={() => {
            setCmdOpen(false);
            setCmdQuery("");
          }}
        />
      )}

      {/* ACTIVITY FEED STRIP (live, last 5) */}
      {activity.length > 0 && (
        <div
          style={{
            position: "sticky",
            bottom: 0,
            zIndex: 22,
            background: SURF,
            borderTop: `1px solid ${HAIRLINE}`,
            padding: "5px 14px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontFamily: FONT_MONO,
            fontSize: 10,
            color: INK_DIM,
            overflowX: "auto",
            whiteSpace: "nowrap",
          }}
        >
          <span
            style={{
              fontFamily: FONT_UI,
              fontSize: 9,
              letterSpacing: 1,
              color: INK_DIM,
              textTransform: "uppercase",
              fontWeight: 600,
              flexShrink: 0,
            }}
          >
            ✱ Activity
          </span>
          {activity.slice(0, 5).map((a) => (
            <span
              key={a.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                color: INK_DIM,
                flexShrink: 0,
              }}
            >
              <Avatar initials={a.author} tint={ACC} />
              <span style={{ color: INK }}>{a.text}</span>
              <span style={{ color: INK_MUTE }}>· {Math.max(1, Math.floor((Date.now() - a.ts) / 1000))}s</span>
            </span>
          ))}
        </div>
      )}

      {/* TOAST */}
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
            background: "rgba(38, 39, 44, 0.95)",
            color: INK,
            border: `1px solid ${HAIRLINE}`,
            borderRadius: 8,
            fontFamily: FONT_UI,
            fontSize: 12,
            fontWeight: 500,
            boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
            pointerEvents: "none",
          }}
        >
          {toast}
        </div>
      )}
    </main>
  );
}

// ── BoardView (kanban) ───────────────────────────────────────────────

function BoardView({
  issues,
  selectedId,
  multiSel,
  quickAdd,
  quickTitle,
  editingId,
  editTitle,
  onSelect,
  onMove,
  onQuickAdd,
  onQuickAddCommit,
  onQuickAddChange,
  onQuickAddCancel,
  onTitleEdit,
  onTitleChange,
  onTitleCommit,
  onDragStart,
  onDragDrop,
}: {
  issues: Issue[];
  selectedId: string;
  multiSel: Set<string>;
  quickAdd: Status | null;
  quickTitle: string;
  editingId: string | null;
  editTitle: string;
  onSelect: (id: string, shift: boolean) => void;
  onMove: (id: string, status: Status) => void;
  onQuickAdd: (status: Status) => void;
  onQuickAddCommit: (status: Status) => void;
  onQuickAddChange: (t: string) => void;
  onQuickAddCancel: () => void;
  onTitleEdit: (id: string) => void;
  onTitleChange: (t: string) => void;
  onTitleCommit: () => void;
  onDragStart: (id: string) => void;
  onDragDrop: (status: Status) => void;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, minmax(240px, 1fr))",
        gap: 8,
        padding: 12,
        minHeight: "100%",
        overflowX: "auto",
      }}
    >
      {COLUMNS.map((status) => {
        const meta = STATUS_META[status];
        const list = issues.filter((i) => i.status === status);
        return (
          <div
            key={status}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => onDragDrop(status)}
            style={{
              background: SURF,
              borderRadius: 8,
              border: `1px solid ${HAIRLINE}`,
              padding: 8,
              minHeight: 200,
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "2px 6px",
              }}
            >
              <span style={{ color: meta.color, fontSize: 14 }}>{meta.icon}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: INK }}>
                {meta.label}
              </span>
              <span style={{ marginLeft: "auto", fontSize: 10, color: INK_DIM, fontFamily: FONT_MONO }}>
                {list.length}
              </span>
              <button
                type="button"
                onClick={() => onQuickAdd(status)}
                title="Quick add"
                style={{
                  width: 18,
                  height: 18,
                  background: "transparent",
                  color: INK_DIM,
                  border: "none",
                  borderRadius: 3,
                  cursor: "pointer",
                  fontSize: 14,
                  padding: 0,
                  lineHeight: 1,
                }}
              >
                +
              </button>
            </div>

            {quickAdd === status && (
              <div
                style={{
                  padding: 8,
                  background: SURF_2,
                  border: `1px solid ${ACC}`,
                  borderRadius: 6,
                }}
              >
                <input
                  autoFocus
                  value={quickTitle}
                  onChange={(e) => onQuickAddChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") onQuickAddCommit(status);
                    if (e.key === "Escape") onQuickAddCancel();
                  }}
                  placeholder="Issue title…"
                  style={{
                    width: "100%",
                    padding: "4px 6px",
                    background: SURF,
                    color: INK,
                    border: `1px solid ${HAIRLINE}`,
                    borderRadius: 4,
                    fontFamily: FONT_UI,
                    fontSize: 12,
                    outline: "none",
                  }}
                />
                <div style={{ marginTop: 6, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 10, color: INK_DIM }}>↵ create · esc cancel</span>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button
                      type="button"
                      onClick={onQuickAddCancel}
                      style={btnStyle(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => onQuickAddCommit(status)}
                      style={btnStyle(true)}
                    >
                      Create
                    </button>
                  </div>
                </div>
              </div>
            )}

            {list.map((i) => (
              <IssueCard
                key={i.id}
                issue={i}
                selected={selectedId === i.id}
                multi={multiSel.has(i.id)}
                editing={editingId === i.id}
                editTitle={editTitle}
                onClick={(e) => onSelect(i.id, e.shiftKey)}
                onTitleEdit={() => onTitleEdit(i.id)}
                onTitleChange={onTitleChange}
                onTitleCommit={onTitleCommit}
                onDragStart={() => onDragStart(i.id)}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}

function IssueCard({
  issue,
  selected,
  multi,
  editing,
  editTitle,
  onClick,
  onTitleEdit,
  onTitleChange,
  onTitleCommit,
  onDragStart,
}: {
  issue: Issue;
  selected: boolean;
  multi: boolean;
  editing: boolean;
  editTitle: string;
  onClick: (e: React.MouseEvent) => void;
  onTitleEdit: () => void;
  onTitleChange: (t: string) => void;
  onTitleCommit: () => void;
  onDragStart: () => void;
}) {
  const meta = STATUS_META[issue.status];
  const p = PRIORITY_META[issue.priority];
  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "move";
        onDragStart();
      }}
      onClick={onClick}
      style={{
        padding: 8,
        background: SURF_2,
        border: `1px solid ${selected || multi ? ACC : HAIRLINE}`,
        borderRadius: 6,
        cursor: "pointer",
        boxShadow: selected ? `0 0 0 2px ${ACC}33` : "none",
        transition: "all 140ms",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
        <span style={{ color: p.color, fontSize: 9, fontFamily: FONT_MONO, letterSpacing: -0.5 }} title={p.label}>
          {p.icon}
        </span>
        <span style={{ color: meta.color, fontSize: 11 }}>{meta.icon}</span>
        <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: INK_MUTE }}>
          {issue.id}
        </span>
        <span style={{ marginLeft: "auto", display: "flex", gap: 4, alignItems: "center" }}>
          {issue.due && (
            <span
              style={{
                fontSize: 9,
                padding: "1px 5px",
                background: issue.due === "Today" ? `${ORANGE}22` : SURF_3,
                color: issue.due === "Today" ? ORANGE : INK_DIM,
                borderRadius: 3,
                fontFamily: FONT_MONO,
              }}
            >
              {issue.due}
            </span>
          )}
          <Avatar initials={issue.assignee} tint={ACC} />
        </span>
      </div>
      {editing ? (
        <input
          autoFocus
          value={editTitle}
          onChange={(e) => onTitleChange(e.target.value)}
          onBlur={onTitleCommit}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === "Escape") {
              (e.target as HTMLInputElement).blur();
            }
          }}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: "100%",
            padding: "2px 4px",
            background: SURF,
            color: INK,
            border: `1px solid ${ACC}`,
            borderRadius: 3,
            fontFamily: FONT_UI,
            fontSize: 13,
            fontWeight: 500,
            outline: "none",
          }}
        />
      ) : (
        <div
          onDoubleClick={(e) => {
            e.stopPropagation();
            onTitleEdit();
          }}
          style={{
            fontSize: 13,
            color: INK,
            lineHeight: 1.35,
            fontWeight: 500,
            wordBreak: "break-word",
          }}
        >
          {issue.title}
        </div>
      )}
      {issue.desc && (
        <div
          style={{
            fontSize: 11,
            color: INK_DIM,
            lineHeight: 1.4,
            marginTop: 4,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {issue.desc.split("\n").find((l) => l.trim()) ?? ""}
        </div>
      )}
      <div style={{ display: "flex", gap: 3, marginTop: 6, flexWrap: "wrap", alignItems: "center" }}>
        {issue.labels.slice(0, 2).map((l) => (
          <span
            key={l}
            style={{
              fontSize: 9,
              padding: "1px 6px",
              background: SURF_3,
              color: INK_DIM,
              borderRadius: 3,
              letterSpacing: 0.2,
            }}
          >
            {l}
          </span>
        ))}
        {(() => {
          const subs = issue.subtasks ?? [];
          if (subs.length === 0) return null;
          const done = subs.filter((s) => s.done).length;
          return (
            <span
              style={{
                fontSize: 9,
                fontFamily: FONT_MONO,
                color: done === subs.length ? GREEN : INK_DIM,
                display: "flex",
                alignItems: "center",
                gap: 3,
              }}
              title={`${done} of ${subs.length} sub-issues done`}
            >
              ☑ {done}/{subs.length}
            </span>
          );
        })()}
        {issue.estimate !== undefined && (
          <span
            style={{
              marginLeft: "auto",
              fontFamily: FONT_MONO,
              fontSize: 10,
              color: INK_DIM,
            }}
          >
            {issue.estimate}pt
          </span>
        )}
      </div>
    </div>
  );
}

// ── ListView ─────────────────────────────────────────────────────────

function ListView({
  issues,
  selectedId,
  isMobile,
  onSelect,
  onStatusChange,
}: {
  issues: Issue[];
  selectedId: string;
  isMobile: boolean;
  onSelect: (id: string) => void;
  onStatusChange: (id: string, st: Status) => void;
}) {
  if (isMobile) {
    // Group by status, render as compact tappable rows.
    return (
      <div style={{ padding: "8px 10px 16px", display: "flex", flexDirection: "column", gap: 14 }}>
        {COLUMNS.map((status) => {
          const meta = STATUS_META[status];
          const list = issues.filter((i) => i.status === status);
          if (list.length === 0) return null;
          return (
            <div key={status}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "2px 2px 6px" }}>
                <span style={{ color: meta.color, fontSize: 14 }}>{meta.icon}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: INK }}>{meta.label}</span>
                <span style={{ fontSize: 10, color: INK_DIM, fontFamily: FONT_MONO }}>{list.length}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {list.map((i) => {
                  const p = PRIORITY_META[i.priority];
                  const subs = i.subtasks ?? [];
                  const done = subs.filter((s) => s.done).length;
                  return (
                    <button
                      key={i.id}
                      type="button"
                      onClick={() => onSelect(i.id)}
                      style={{
                        textAlign: "left",
                        display: "flex",
                        flexDirection: "column",
                        gap: 5,
                        padding: "10px 12px",
                        background: selectedId === i.id ? `${ACC}1f` : SURF,
                        border: `1px solid ${selectedId === i.id ? ACC : HAIRLINE}`,
                        borderRadius: 8,
                        cursor: "pointer",
                        width: "100%",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                        <span style={{ color: p.color, fontSize: 9, fontFamily: FONT_MONO }} title={p.label}>{p.icon}</span>
                        <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: INK_MUTE }}>{i.id}</span>
                        {i.due && (
                          <span style={{ fontSize: 9, padding: "1px 5px", background: i.due === "Today" ? `${ORANGE}22` : SURF_3, color: i.due === "Today" ? ORANGE : INK_DIM, borderRadius: 3, fontFamily: FONT_MONO }}>{i.due}</span>
                        )}
                        <span style={{ marginLeft: "auto" }}><Avatar initials={i.assignee} tint={ACC} /></span>
                      </div>
                      <div style={{ fontSize: 14, color: INK, fontWeight: 500, lineHeight: 1.35 }}>{i.title}</div>
                      <div style={{ fontSize: 11, color: INK_DIM }}>{i.artifact}</div>
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", alignItems: "center" }}>
                        {i.labels.slice(0, 3).map((l) => (
                          <span key={l} style={{ fontSize: 9, padding: "1px 6px", background: SURF_3, color: INK_DIM, borderRadius: 3 }}>{l}</span>
                        ))}
                        {subs.length > 0 && (
                          <span style={{ marginLeft: "auto", fontSize: 10, fontFamily: FONT_MONO, color: done === subs.length ? GREEN : INK_DIM }}>☑ {done}/{subs.length}</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
        {issues.length === 0 && (
          <div style={{ padding: 20, textAlign: "center", color: INK_DIM, fontSize: 12 }}>No issues match this filter.</div>
        )}
      </div>
    );
  }
  return (
    <div style={{ padding: 12 }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
        <thead>
          <tr style={{ color: INK_DIM, fontSize: 10, letterSpacing: 0.5, textTransform: "uppercase" }}>
            <TH>Status</TH>
            <TH>Pri</TH>
            <TH>ID</TH>
            <TH>Title</TH>
            <TH>Artifact</TH>
            <TH>Labels</TH>
            <TH>Est.</TH>
            <TH>Due</TH>
            <TH>Assignee</TH>
          </tr>
        </thead>
        <tbody>
          {issues.map((i) => {
            const meta = STATUS_META[i.status];
            const p = PRIORITY_META[i.priority];
            const isSel = selectedId === i.id;
            return (
              <tr
                key={i.id}
                onClick={() => onSelect(i.id)}
                style={{
                  cursor: "pointer",
                  background: isSel ? `${ACC}22` : "transparent",
                }}
              >
                <TD>
                  <select
                    value={i.status}
                    onChange={(e) => onStatusChange(i.id, e.target.value as Status)}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      background: "transparent",
                      color: meta.color,
                      border: "none",
                      fontFamily: FONT_UI,
                      fontSize: 11,
                      cursor: "pointer",
                      outline: "none",
                    }}
                  >
                    {(Object.keys(STATUS_META) as Status[]).map((s) => (
                      <option key={s} value={s} style={{ background: SURF, color: INK }}>
                        {STATUS_META[s].icon} {STATUS_META[s].label}
                      </option>
                    ))}
                  </select>
                </TD>
                <TD>
                  <span style={{ color: p.color, fontFamily: FONT_MONO, fontSize: 10 }}>{p.icon}</span>
                </TD>
                <TD mono>{i.id}</TD>
                <TD bold>{i.title}</TD>
                <TD dim>{i.artifact}</TD>
                <TD dim>{i.labels.join(", ")}</TD>
                <TD mono>{i.estimate ?? "—"}</TD>
                <TD mono>{i.due ?? "—"}</TD>
                <TD>
                  <Avatar initials={i.assignee} tint={ACC} />
                </TD>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function TH({ children }: { children: React.ReactNode }) {
  return (
    <th
      style={{
        padding: "8px 6px",
        textAlign: "left",
        borderBottom: `1px solid ${HAIRLINE}`,
        fontWeight: 500,
      }}
    >
      {children}
    </th>
  );
}

function TD({
  children,
  mono,
  bold,
  dim,
}: {
  children: React.ReactNode;
  mono?: boolean;
  bold?: boolean;
  dim?: boolean;
}) {
  return (
    <td
      style={{
        padding: "6px 6px",
        borderBottom: `1px solid ${HAIRLINE}`,
        fontFamily: mono ? FONT_MONO : FONT_UI,
        fontSize: mono ? 11 : 12,
        color: dim ? INK_DIM : INK,
        fontWeight: bold ? 500 : 400,
      }}
    >
      {children}
    </td>
  );
}

// ── TriageView ───────────────────────────────────────────────────────

function TriageView({
  issues,
  onAssign,
  onSelect,
}: {
  issues: Issue[];
  onAssign: (id: string) => void;
  onSelect: (id: string) => void;
}) {
  return (
    <div style={{ padding: 16 }}>
      <div
        style={{
          fontSize: 13,
          color: INK_DIM,
          marginBottom: 10,
        }}
      >
        <strong style={{ color: INK }}>Triage queue</strong> · {issues.length} unassigned or no-priority
      </div>
      {issues.length === 0 && (
        <div
          style={{
            padding: 20,
            textAlign: "center",
            background: SURF,
            borderRadius: 8,
            border: `1px solid ${HAIRLINE}`,
            color: INK_DIM,
            fontSize: 12,
          }}
        >
          Triage queue is empty.
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {issues.map((i) => (
          <div
            key={i.id}
            onClick={() => onSelect(i.id)}
            style={{
              display: "grid",
              gridTemplateColumns: "60px 1fr auto",
              gap: 8,
              padding: "8px 10px",
              background: SURF,
              border: `1px solid ${HAIRLINE}`,
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: INK_DIM }}>
              {i.id}
            </span>
            <div>
              <div style={{ fontSize: 13, color: INK, fontWeight: 500 }}>{i.title}</div>
              <div style={{ fontSize: 10, color: INK_DIM, marginTop: 2 }}>
                {i.artifact} · {i.labels.join(", ")}
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onAssign(i.id);
              }}
              style={btnStyle(true)}
            >
              → Todo
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Issue detail (right rail) ────────────────────────────────────────

function IssueDetail({
  issue,
  comments,
  onClose,
  onPriority,
  onStatus,
  onSubtaskToggle,
  onSubtaskAdd,
  onCommentAdd,
  onLink,
}: {
  issue: Issue;
  comments: Array<{ id: string; author: string; body: string; ts: number }>;
  onClose: () => void;
  onPriority: (p: Priority) => void;
  onStatus: (s: Status) => void;
  onSubtaskToggle: (taskId: string) => void;
  onSubtaskAdd: (title: string) => void;
  onCommentAdd: (body: string, author?: string) => void;
  onLink: (id: string) => void;
}) {
  const [subDraft, setSubDraft] = useState("");
  const [cmtAuthor, setCmtAuthor] = useState("");
  const [cmtBody, setCmtBody] = useState("");
  const meta = STATUS_META[issue.status];
  const p = PRIORITY_META[issue.priority];
  return (
    <div style={{ animation: "kiruk-2021-fade 220ms ease-out" }}>
      {/* Head row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 10,
        }}
      >
        <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: INK_DIM }}>
          {issue.id}
        </span>
        <button
          type="button"
          onClick={onClose}
          title="Close panel"
          style={{
            width: 22,
            height: 22,
            background: "transparent",
            color: INK_DIM,
            border: "none",
            cursor: "pointer",
            fontSize: 14,
          }}
        >
          ›
        </button>
      </div>
      <h2
        style={{
          fontFamily: FONT_DISPLAY,
          fontSize: 16,
          fontWeight: 500,
          color: INK,
          margin: "0 0 8px",
          lineHeight: 1.35,
        }}
      >
        {issue.title}
      </h2>

      {/* Properties */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
        <PropRow label="Status">
          <select
            value={issue.status}
            onChange={(e) => onStatus(e.target.value as Status)}
            style={selectStyle(meta.color)}
          >
            {(Object.keys(STATUS_META) as Status[]).map((s) => (
              <option key={s} value={s} style={{ background: SURF, color: INK }}>
                {STATUS_META[s].icon} {STATUS_META[s].label}
              </option>
            ))}
          </select>
        </PropRow>
        <PropRow label="Priority">
          <select
            value={issue.priority}
            onChange={(e) => onPriority(e.target.value as Priority)}
            style={selectStyle(p.color)}
          >
            {(Object.keys(PRIORITY_META) as Priority[]).map((pr) => (
              <option key={pr} value={pr} style={{ background: SURF, color: INK }}>
                {PRIORITY_META[pr].label}
              </option>
            ))}
          </select>
        </PropRow>
        <PropRow label="Assignee">
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <Avatar initials={issue.assignee} tint={ACC} />
            <span style={{ fontSize: 12 }}>{issue.assigneeName}</span>
          </div>
        </PropRow>
        <PropRow label="Labels">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
            {issue.labels.map((l) => (
              <span
                key={l}
                style={{
                  fontSize: 10,
                  padding: "1px 6px",
                  background: SURF_3,
                  color: INK_DIM,
                  borderRadius: 3,
                }}
              >
                {l}
              </span>
            ))}
          </div>
        </PropRow>
        {issue.estimate !== undefined && (
          <PropRow label="Estimate">
            <span style={{ fontFamily: FONT_MONO, fontSize: 12 }}>{issue.estimate} points</span>
          </PropRow>
        )}
        {issue.due && (
          <PropRow label="Due">
            <span style={{ fontFamily: FONT_MONO, fontSize: 12 }}>{issue.due}</span>
          </PropRow>
        )}
        <PropRow label="Artifact">
          <span style={{ fontSize: 11, color: MAGENTA }}>{issue.artifact}</span>
        </PropRow>
      </div>

      {/* Description */}
      <div style={{ marginBottom: 12 }}>
        <div
          style={{
            fontSize: 10,
            letterSpacing: 1,
            color: INK_DIM,
            textTransform: "uppercase",
            fontWeight: 600,
            marginBottom: 4,
          }}
        >
          Description
        </div>
        <p
          style={{
            fontSize: 12,
            lineHeight: 1.6,
            color: INK,
            margin: 0,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {issue.desc || <span style={{ color: INK_DIM, fontStyle: "italic" }}>No description</span>}
        </p>
      </div>

      {/* Sub-issues */}
      <div style={{ marginBottom: 12 }}>
        <div
          style={{
            fontSize: 10,
            letterSpacing: 1,
            color: INK_DIM,
            textTransform: "uppercase",
            fontWeight: 600,
            marginBottom: 4,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <span>
            Sub-issues · {(issue.subtasks ?? []).filter((t) => t.done).length}/
            {(issue.subtasks ?? []).length}
          </span>
          {(issue.subtasks?.length ?? 0) > 0 && (
            <span style={{ color: GREEN }}>
              {Math.round(
                ((issue.subtasks ?? []).filter((t) => t.done).length /
                  (issue.subtasks ?? []).length) *
                  100,
              )}
              %
            </span>
          )}
        </div>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {(issue.subtasks ?? []).map((t) => (
            <li
              key={t.id}
              style={{
                display: "flex",
                gap: 6,
                alignItems: "flex-start",
                padding: "3px 0",
                fontSize: 12,
              }}
            >
              <button
                type="button"
                onClick={() => onSubtaskToggle(t.id)}
                style={{
                  width: 14,
                  height: 14,
                  marginTop: 2,
                  flexShrink: 0,
                  borderRadius: 3,
                  border: `1.5px solid ${t.done ? GREEN : INK_DIM}`,
                  background: t.done ? GREEN : "transparent",
                  color: "#fff",
                  fontSize: 9,
                  lineHeight: 1,
                  padding: 0,
                  cursor: "pointer",
                }}
              >
                {t.done ? "✓" : ""}
              </button>
              <span
                style={{
                  color: t.done ? INK_DIM : INK,
                  textDecoration: t.done ? "line-through" : "none",
                }}
              >
                {t.title}
              </span>
            </li>
          ))}
        </ul>
        {/* Inline add sub-issue */}
        <div
          style={{
            display: "flex",
            gap: 4,
            marginTop: 5,
            alignItems: "center",
          }}
        >
          <span style={{ width: 14, color: INK_DIM, fontSize: 14, marginTop: 2 }}>+</span>
          <input
            value={subDraft}
            onChange={(e) => setSubDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onSubtaskAdd(subDraft);
                setSubDraft("");
              }
            }}
            placeholder="Add sub-issue · ↵"
            style={{
              flex: 1,
              padding: "3px 6px",
              background: SURF_2,
              color: INK,
              border: `1px solid ${HAIRLINE}`,
              borderRadius: 3,
              fontFamily: FONT_UI,
              fontSize: 11,
              outline: "none",
            }}
          />
        </div>
      </div>

      {/* Comments */}
      <div style={{ marginBottom: 12 }}>
        <div
          style={{
            fontSize: 10,
            letterSpacing: 1,
            color: INK_DIM,
            textTransform: "uppercase",
            fontWeight: 600,
            marginBottom: 5,
          }}
        >
          Comments · {comments.length}
        </div>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {comments.length === 0 && (
            <li
              style={{
                fontSize: 11,
                color: INK_DIM,
                fontStyle: "italic",
                padding: "3px 0",
              }}
            >
              No comments yet — be the first to weigh in.
            </li>
          )}
          {comments.map((c) => (
            <li
              key={c.id}
              style={{
                padding: "5px 0",
                borderBottom: `1px solid ${HAIRLINE}`,
                fontSize: 12,
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: 5,
                  alignItems: "center",
                  fontSize: 10,
                  color: INK_DIM,
                  marginBottom: 2,
                }}
              >
                <Avatar initials={c.author.slice(0, 2).toUpperCase()} tint={MAGENTA} />
                <strong style={{ color: ACC }}>/{c.author}</strong>
                <span>· {Math.max(1, Math.floor((Date.now() - c.ts) / 60000))}m ago</span>
              </div>
              <div style={{ color: INK, lineHeight: 1.45 }}>{c.body}</div>
            </li>
          ))}
        </ul>
        {/* Add comment form */}
        <div
          style={{
            marginTop: 6,
            display: "grid",
            gridTemplateColumns: "70px 1fr auto",
            gap: 4,
          }}
        >
          <input
            value={cmtAuthor}
            onChange={(e) => setCmtAuthor(e.target.value)}
            placeholder="/you"
            style={{
              padding: "3px 6px",
              background: SURF_2,
              color: INK,
              border: `1px solid ${HAIRLINE}`,
              borderRadius: 3,
              fontFamily: FONT_UI,
              fontSize: 11,
              outline: "none",
            }}
          />
          <input
            value={cmtBody}
            onChange={(e) => setCmtBody(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onCommentAdd(cmtBody, cmtAuthor);
                setCmtBody("");
              }
            }}
            placeholder="Leave a comment · ↵"
            style={{
              padding: "3px 6px",
              background: SURF_2,
              color: INK,
              border: `1px solid ${HAIRLINE}`,
              borderRadius: 3,
              fontFamily: FONT_UI,
              fontSize: 11,
              outline: "none",
            }}
          />
          <button
            type="button"
            onClick={() => {
              onCommentAdd(cmtBody, cmtAuthor);
              setCmtBody("");
            }}
            style={btnStyle(true)}
          >
            Send
          </button>
        </div>
      </div>

      {/* Links */}
      {issue.links && issue.links.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <div
            style={{
              fontSize: 10,
              letterSpacing: 1,
              color: INK_DIM,
              textTransform: "uppercase",
              fontWeight: 600,
              marginBottom: 4,
            }}
          >
            Relations · {issue.links.length}
          </div>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {issue.links.map((id) => (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => onLink(id)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: ACC,
                    fontFamily: FONT_MONO,
                    fontSize: 11,
                    cursor: "pointer",
                    padding: "2px 0",
                    display: "block",
                    textAlign: "left",
                  }}
                >
                  ↗ {id}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Activity */}
      {issue.activity && issue.activity.length > 0 && (
        <div>
          <div
            style={{
              fontSize: 10,
              letterSpacing: 1,
              color: INK_DIM,
              textTransform: "uppercase",
              fontWeight: 600,
              marginBottom: 4,
            }}
          >
            Activity · {issue.activity.length}
          </div>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {issue.activity.map((a, i) => (
              <li
                key={i}
                style={{
                  display: "flex",
                  gap: 6,
                  padding: "3px 0",
                  fontSize: 11,
                  color: INK_DIM,
                }}
              >
                <span style={{ color: INK_DIM }}>·</span>
                <span style={{ flex: 1 }}>{a.text}</span>
                <span style={{ fontFamily: FONT_MONO, fontSize: 10 }}>
                  {Math.floor((Date.now() - a.ts) / 86400000)}d ago
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function PropRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "80px 1fr",
        gap: 6,
        padding: "3px 0",
        alignItems: "center",
        fontSize: 12,
      }}
    >
      <span style={{ color: INK_DIM, fontSize: 11 }}>{label}</span>
      {children}
    </div>
  );
}

function selectStyle(color: string): React.CSSProperties {
  return {
    background: "transparent",
    color,
    border: `1px solid ${HAIRLINE}`,
    borderRadius: 4,
    padding: "2px 6px",
    fontFamily: FONT_UI,
    fontSize: 11,
    cursor: "pointer",
    outline: "none",
    width: "fit-content",
  };
}

// ── CommandPalette ───────────────────────────────────────────────────

function CommandPalette({
  query,
  setQuery,
  issues,
  selectedId,
  onJump,
  onStatus,
  onPriority,
  onClose,
}: {
  query: string;
  setQuery: (s: string) => void;
  issues: Issue[];
  selectedId: string;
  onJump: (id: string) => void;
  onStatus: (s: Status) => void;
  onPriority: (p: Priority) => void;
  onClose: () => void;
}) {
  const q = query.trim().toLowerCase();
  const filtered = useMemo(
    () =>
      !q
        ? issues
        : issues.filter(
            (i) =>
              i.title.toLowerCase().includes(q) ||
              i.id.toLowerCase().includes(q) ||
              i.artifact.toLowerCase().includes(q) ||
              i.labels.some((l) => l.toLowerCase().includes(q)),
          ),
    [q, issues],
  );
  const statusActions = (Object.keys(STATUS_META) as Status[]).filter((s) =>
    !q ? true : STATUS_META[s].label.toLowerCase().includes(q),
  );
  const priActions = (Object.keys(PRIORITY_META) as Priority[]).filter((p) =>
    !q ? true : PRIORITY_META[p].label.toLowerCase().includes(q),
  );
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(8px)",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        paddingTop: 80,
        padding: "80px 16px 16px",
        animation: "kiruk-2021-modal-in 180ms ease-out",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: SURF,
          color: INK,
          border: `1px solid ${HAIRLINE}`,
          borderRadius: 10,
          width: "min(560px, 100%)",
          boxShadow: "0 24px 60px rgba(0,0,0,0.6)",
          overflow: "hidden",
        }}
      >
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type a command or search…"
          style={{
            width: "100%",
            padding: "14px 18px",
            background: SURF,
            color: INK,
            border: "none",
            borderBottom: `1px solid ${HAIRLINE}`,
            fontFamily: FONT_UI,
            fontSize: 15,
            outline: "none",
            boxSizing: "border-box",
          }}
        />
        <div style={{ maxHeight: 400, overflowY: "auto" }}>
          {filtered.length > 0 && (
            <CmdSection title="Jump to issue">
              {filtered.slice(0, 8).map((i) => {
                const meta = STATUS_META[i.status];
                const p = PRIORITY_META[i.priority];
                return (
                  <CmdRow
                    key={i.id}
                    onClick={() => onJump(i.id)}
                    left={
                      <>
                        <span style={{ color: p.color, fontSize: 10, fontFamily: FONT_MONO, marginRight: 6 }}>
                          {p.icon}
                        </span>
                        <span style={{ color: meta.color, marginRight: 6 }}>{meta.icon}</span>
                        <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: INK_DIM, marginRight: 6 }}>
                          {i.id}
                        </span>
                        <span>{i.title}</span>
                      </>
                    }
                    right={
                      <>
                        {i.id === selectedId && (
                          <span style={{ color: ACC, fontSize: 10 }}>● current</span>
                        )}
                      </>
                    }
                  />
                );
              })}
            </CmdSection>
          )}
          <CmdSection title="Change status">
            {statusActions.map((s) => (
              <CmdRow
                key={s}
                onClick={() => onStatus(s)}
                left={
                  <>
                    <span style={{ color: STATUS_META[s].color, marginRight: 6 }}>
                      {STATUS_META[s].icon}
                    </span>
                    Set status to {STATUS_META[s].label}
                  </>
                }
                right={<Kbd>S {s.charAt(0).toUpperCase()}</Kbd>}
              />
            ))}
          </CmdSection>
          <CmdSection title="Change priority">
            {priActions.map((p) => (
              <CmdRow
                key={p}
                onClick={() => onPriority(p)}
                left={
                  <>
                    <span style={{ color: PRIORITY_META[p].color, marginRight: 6, fontFamily: FONT_MONO, fontSize: 10 }}>
                      {PRIORITY_META[p].icon}
                    </span>
                    Set priority to {PRIORITY_META[p].label}
                  </>
                }
              />
            ))}
          </CmdSection>
        </div>
        <div
          style={{
            padding: "6px 14px",
            background: SURF_2,
            borderTop: `1px solid ${HAIRLINE}`,
            fontFamily: FONT_MONO,
            fontSize: 10,
            color: INK_DIM,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <span>↑ ↓ navigate · ↵ select</span>
          <span>Esc to close</span>
        </div>
      </div>
    </div>
  );
}

function CmdSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div
        style={{
          padding: "6px 14px 4px",
          fontSize: 9,
          letterSpacing: 1.5,
          color: INK_DIM,
          textTransform: "uppercase",
          fontWeight: 600,
        }}
      >
        {title}
      </div>
      {children}
      <div style={{ borderTop: `1px solid ${HAIRLINE}`, margin: "4px 0" }} />
    </div>
  );
}

function CmdRow({
  left,
  right,
  onClick,
}: {
  left: React.ReactNode;
  right?: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        width: "100%",
        padding: "5px 14px",
        background: "transparent",
        border: "none",
        color: INK,
        fontFamily: FONT_UI,
        fontSize: 13,
        cursor: "pointer",
        textAlign: "left",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = SURF_2)}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <span style={{ flex: 1, display: "flex", alignItems: "center" }}>{left}</span>
      {right && <span style={{ color: INK_DIM, fontSize: 10 }}>{right}</span>}
    </button>
  );
}

// ── Tiny components ──────────────────────────────────────────────────

function SideHead({ label }: { label: string }) {
  return (
    <div
      style={{
        padding: "10px 10px 4px",
        fontSize: 9,
        letterSpacing: 1.5,
        color: INK_DIM,
        textTransform: "uppercase",
        fontWeight: 600,
      }}
    >
      {label}
    </div>
  );
}

function SideItem({
  icon,
  active,
  onClick,
  children,
}: {
  icon: string;
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        width: "100%",
        padding: "3px 10px",
        background: active ? SURF_2 : "transparent",
        border: "none",
        color: active ? INK : INK_DIM,
        fontFamily: FONT_UI,
        fontSize: 12,
        cursor: "pointer",
        textAlign: "left",
        borderRadius: 4,
      }}
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.style.background = SURF_2;
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.background = "transparent";
      }}
    >
      <span style={{ width: 14, color: INK_DIM, fontSize: 12 }}>{icon}</span>
      {children}
    </button>
  );
}

function Seg({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "3px 10px",
        background: active ? SURF_2 : "transparent",
        color: active ? INK : INK_DIM,
        border: `1px solid ${active ? HAIRLINE : "transparent"}`,
        borderRadius: 5,
        fontFamily: FONT_UI,
        fontSize: 11,
        fontWeight: active ? 500 : 400,
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

function Avatar({ initials, tint }: { initials: string; tint: string }) {
  return (
    <span
      aria-hidden
      style={{
        width: 18,
        height: 18,
        borderRadius: "50%",
        background: `linear-gradient(135deg, ${tint} 0%, ${darken(tint)} 100%)`,
        color: "#fff",
        fontSize: 9,
        fontFamily: FONT_DISPLAY,
        fontWeight: 600,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        letterSpacing: -0.3,
      }}
    >
      {initials}
    </span>
  );
}

function Kbd({ children, dark }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <kbd
      style={{
        fontFamily: FONT_MONO,
        fontSize: 9,
        color: dark ? "#fff" : INK_DIM,
        background: dark ? "rgba(0,0,0,0.3)" : SURF_3,
        padding: "1px 5px",
        borderRadius: 3,
        border: dark ? "1px solid rgba(255,255,255,0.2)" : `1px solid ${HAIRLINE}`,
      }}
    >
      {children}
    </kbd>
  );
}

function btnStyle(primary: boolean): React.CSSProperties {
  return {
    padding: "3px 10px",
    background: primary ? ACC : "transparent",
    color: primary ? "#fff" : INK_DIM,
    border: `1px solid ${primary ? ACC_DEEP : HAIRLINE}`,
    borderRadius: 4,
    fontFamily: FONT_UI,
    fontSize: 11,
    fontWeight: 500,
    cursor: "pointer",
  };
}

function darken(hex: string): string {
  if (!hex.startsWith("#") || hex.length !== 7) return hex;
  const r = Math.max(0, parseInt(hex.slice(1, 3), 16) - 50);
  const g = Math.max(0, parseInt(hex.slice(3, 5), 16) - 50);
  const b = Math.max(0, parseInt(hex.slice(5, 7), 16) - 50);
  return `rgb(${r}, ${g}, ${b})`;
}

export default IssueTrackerHomePage;
