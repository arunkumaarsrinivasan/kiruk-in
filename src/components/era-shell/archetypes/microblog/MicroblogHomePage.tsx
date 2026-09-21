"use client";

/**
 * MicroblogHomePage — 2006 archetype: kiruk.digg · Crowd-Ranked Profile.
 *
 * The web in 2006 wasn't only Twitter — Digg was peaking, Reddit was
 * young, and the dominant new pattern was the COMMUNITY-RANKED LINK
 * AGGREGATOR. A reverse-chronological feed (Twitter / MySpace) is one
 * shape; a list ranked by votes, with threaded comment debates beneath
 * each item, is a different shape entirely.
 *
 * This profile renders Arun as a Digg-style submission list: each row
 * is one fragment of the UX research on file ("Drew the persona on
 * myself.", "Empathy map says + does converged.", etc.). Visitors can
 * dig stories up or bury them down. Votes resort the list live and
 * persist in sessionStorage. Click a row to expand a threaded comment
 * debate beneath it.
 *
 * Paradigm versus prior eras:
 *   · 2003 MySpace = static profile page w/ sections + Top 8
 *   · 2006 Digg    = ranked submission list w/ votes + threaded debate
 *
 * Unique interactions:
 *   · ▲ dig / ▼ bury arrows — score updates live + persists in session
 *   · Sort tabs (Hot / Top / New) — different ranking algorithms
 *   · Click row → inline expand w/ threaded comments + Reply form
 *   · Comments persist per story (sessionStorage)
 *   · Submit Story form at foot — your story joins the list at #11
 *   · Category filter pills (UX · Career · Tools · Process · Personal)
 *   · Front-page "diggs in last 24h" counter increments as you vote
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
  ERA_BRAND,
  ERA_SUBJECT,
  buildTimeline,
  IMPACT_METRICS,
  CARD_SORTING,
  USABILITY_TEST,
} from "@/data/era-page-content";

// ── Palette — Digg 2006 ──────────────────────────────────────────────

const PAGE_BG = "#f6f6ef";              // newsprint cream
const PAGE_RULE = "#d8d8c8";
const HEAD_BG = "#ee7600";              // signature digg orange
const HEAD_BG_DEEP = "#cc5500";
const HEAD_BG_DARK = "#8a3a00";
const NAV_BAR = "#fdf0d5";              // pale cream nav strip
const CARD = "#ffffff";
const CARD_DIM = "#fafaf3";
const CARD_ALT = "#f0f0e0";
const INK = "#1a1a1a";
const INK_DIM = "#555555";
const MUTED = "#888888";
const LINK = "#1d428a";
const LINK_HOT = "#7a2580";              // visited
const BORDER = "#d8d8c8";
const VOTE_UP = "#5a9e1a";
const VOTE_UP_BG = "#e8f3d8";
const VOTE_DN = "#a93a1a";
const VOTE_DN_BG = "#f6dcd2";
const GOLD = "#d4a017";

const FONT_UI = "'Verdana', 'Geneva', 'Arial', sans-serif";
const FONT_DISPLAY = "'Verdana', 'Arial Black', sans-serif";
const FONT_MONO = "'Courier New', 'Lucida Console', monospace";

// ── Story model ──────────────────────────────────────────────────────

type Category = "ux" | "career" | "tools" | "process" | "personal";

const CATEGORIES: Array<{ id: Category; label: string; tint: string }> = [
  { id: "ux",       label: "UX Research",  tint: "#ee7600" },
  { id: "career",   label: "Career",       tint: "#1d428a" },
  { id: "tools",    label: "Tools",        tint: "#5a9e1a" },
  { id: "process",  label: "Process",      tint: "#7a2580" },
  { id: "personal", label: "Personal",     tint: "#a93a1a" },
];

interface Story {
  id: string;
  title: string;
  desc: string;
  artifact: string;    // which UX research artifact this story unpacks
  data?: () => React.ReactNode; // optional rich data block beneath desc
  tags: string[];
  by: string;
  ts: number;          // submitted-at
  baseDiggs: number;
  baseBuries: number;
  category: Category;
  seed?: { author: string; body: string; ts: number }[]; // seeded comments
}

function hAgo(ts: number): string {
  const sec = Math.floor((Date.now() - ts) / 1000);
  if (sec < 60) return `${sec}s ago`;
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`;
  return `${Math.floor(sec / 86400)}d ago`;
}

function buildSeedStories(): Story[] {
  const nodes = buildTimeline();
  const now = Date.now();
  const m = 60_000;
  const h = 3_600_000;
  const d = 86_400_000;
  return [
    // ── 1 · WHY_KIRUK · the bridge ──────────────────────────────────
    {
      id: "st-why",
      title: `${WHY_KIRUK.hook}`,
      desc: `${WHY_KIRUK.pain} ${WHY_KIRUK.bridge}`,
      artifact: "WHY KIRUK",
      tags: ["thesis", "bridge", "hook"],
      data: () => (
        <PullQuote>{WHY_KIRUK.tagline}</PullQuote>
      ),
      by: "kiruk",
      ts: now - 2 * h,
      baseDiggs: 412,
      baseBuries: 14,
      category: "ux",
      seed: [
        { author: "donnorman", body: "Collapsing strategy + design + code into one head is the move. Keep the seam visible.", ts: now - 1.5 * h },
        { author: "worrydream", body: "If the bridge is one person, the round-trip is one keystroke. That's the win.", ts: now - 1 * h },
      ],
    },

    // ── 2 · PERSONA · Identity ──────────────────────────────────────
    {
      id: "st-persona-id",
      title: `Drew the persona on myself: ${PERSONA.identity.name} · ${PERSONA.identity.role} @ ${PERSONA.identity.org}.`,
      desc: `A persona is normally fictional — a stand-in for an audience. I drew it on the designer instead. The whole site is one usability study with sample size N=1. Subject of the study is the designer himself.`,
      artifact: "PERSONA · Identity",
      tags: ["persona", "ux research", "meta"],
      data: () => (
        <DataTable>
          <DRow k="Name">{PERSONA.identity.name}</DRow>
          <DRow k="Role">{PERSONA.identity.role}</DRow>
          <DRow k="Employer">{PERSONA.identity.org}</DRow>
          <DRow k="Location">{PERSONA.identity.location}</DRow>
          <DRow k="Quote">&ldquo;{PERSONA.quote}&rdquo;</DRow>
        </DataTable>
      ),
      by: "kiruk",
      ts: now - 5 * h,
      baseDiggs: 358,
      baseBuries: 9,
      category: "ux",
      seed: [
        { author: "donnorman", body: "Running the artifact inward is the correct move. Keep the frustrations column honest.", ts: now - 4 * h },
      ],
    },

    // ── 3 · PERSONA · Frustrations as diagnostic ────────────────────
    {
      id: "st-persona-frust",
      title: `The frustrations column is the diagnostic. Every line is a friction a single-discipline person could tolerate.`,
      desc: `Goals tell you what someone is reaching for. Frustrations tell you why nobody else is reaching there. Mine name the exact seams a hybrid role exists to close.`,
      artifact: "PERSONA · Frustrations",
      tags: ["persona", "frustrations", "diagnostic"],
      data: () => (
        <SplitList
          aLabel="GOALS"
          aItems={[...PERSONA.goals]}
          aMarker="▸"
          bLabel="FRUSTRATIONS"
          bItems={[...PERSONA.frustrations]}
          bMarker="✕"
        />
      ),
      by: "kiruk",
      ts: now - 9 * h,
      baseDiggs: 304,
      baseBuries: 11,
      category: "ux",
      seed: [
        { author: "anon-1", body: "Siloed teams + slow handoffs + lost context — that's just the modern enterprise. You're describing the air.", ts: now - 7 * h },
        { author: "kiruk", body: "@anon-1 air is breathable. silos aren't. that's the difference the bridge role names.", ts: now - 6 * h },
      ],
    },

    // ── 4 · EMPATHY MAP · convergence ────────────────────────────────
    {
      id: "st-empathy",
      title: `Empathy Map · Says + Does converged. The claim is corroborated by the tools in rotation.`,
      desc: `Says: "${EMPATHY_MAP.says.quote}". Does: the stack actually crosses the design/engineering line every day. Two columns, same answer, opposite ends. That convergence is what makes the persona believable.`,
      artifact: "EMPATHY MAP",
      tags: ["empathy map", "synthesis", "method"],
      data: () => (
        <QuadGrid
          says={EMPATHY_MAP.says.quote}
          thinks={[...EMPATHY_MAP.thinks]}
          does={[...EMPATHY_MAP.does]}
          feels={[...EMPATHY_MAP.feels]}
        />
      ),
      by: "kiruk",
      ts: now - 12 * h,
      baseDiggs: 287,
      baseBuries: 16,
      category: "ux",
      seed: [
        { author: "figma", body: "Says + Does crossing the same line is exactly what we look for in interviews. Nice inversion.", ts: now - 10 * h },
        { author: "refactoring-ui", body: "Skills he claims + tools in rotation = the diff is zero. That's a believable empathy map.", ts: now - 9 * h },
      ],
    },

    // ── 5 · JOURNEY MAP · 5 phases ──────────────────────────────────
    {
      id: "st-journey",
      title: `Career as a Journey Map — 5 phases, 7 years, two parallel tracks under one timeline.`,
      desc: `${nodes[0].year} ${nodes[0].phase} → ${nodes[nodes.length - 1].year} ${nodes[nodes.length - 1].phase}. The gap between freelance design and the first intersection internship looks blank on paper. It wasn't. Engineering school ran underneath every gig.`,
      artifact: "JOURNEY MAP",
      tags: ["journey map", "career", "lifeline"],
      data: () => (
        <Lifeline nodes={nodes} />
      ),
      by: "kiruk",
      ts: now - 18 * h,
      baseDiggs: 247,
      baseBuries: 8,
      category: "career",
      seed: [
        { author: "sona", body: "Parallel-track students are usually the ones who ship hybrid roles later.", ts: now - 14 * h },
        { author: "hpprintai", body: "And we picked one up. ✓", ts: now - 13 * h },
      ],
    },

    // ── 6 · IMPACT TALLY · top metrics ──────────────────────────────
    {
      id: "st-impact",
      title: `Impact Tally · ${IMPACT_METRICS.length} cite-able figures. Output vs outcome — outcome only on this disc.`,
      desc: `In UX research, the impact phase separates output (slides, mocks, decks) from outcome (numbers that move a system someone uses). Each figure pairs with a shipped surface before it lands here.`,
      artifact: "IMPACT METRICS",
      tags: ["impact", "outcomes", "receipts"],
      data: () => (
        <MetricGrid metrics={IMPACT_METRICS.slice(0, 6)} />
      ),
      by: "kiruk",
      ts: now - 22 * h,
      baseDiggs: 219,
      baseBuries: 13,
      category: "process",
      seed: [
        { author: "worrydream", body: "Outcomes only. Vanity metrics belong on slides, not on personas.", ts: now - 20 * h },
      ],
    },

    // ── 7 · CARD SORT · 4 plates ────────────────────────────────────
    {
      id: "st-works",
      title: `Card Sort · ${CARD_SORTING.projects.length} shipped projects, sorted into ${CARD_SORTING.taxonomy.filter((t) => t !== "All").length} categories.`,
      desc: `Card sorting is a UX research method for finding the right taxonomy. Applied to the work: ${CARD_SORTING.taxonomy.filter((t) => t !== "All").join(" · ")}. Each card carries title, brief, duration, role and stack.`,
      artifact: "CARD SORT · Works",
      tags: ["card sort", "taxonomy", "works"],
      data: () => (
        <WorkGrid projects={[...CARD_SORTING.projects]} />
      ),
      by: "kiruk",
      ts: now - 1 * d,
      baseDiggs: 196,
      baseBuries: 11,
      category: "process",
      seed: [
        { author: "figma", body: `Loved ${CARD_SORTING.projects[0]?.title ?? "the first plate"} — single hand from frame to ship.`, ts: now - 22 * h },
      ],
    },

    // ── 8 · EMPATHY · Thinks compass ────────────────────────────────
    {
      id: "st-thinks",
      title: `My operating compass — what I actually think while shipping.`,
      desc: `Three rules I keep returning to. They're not aphorisms — they're the filters that decide what gets a frame, what gets a route, and what gets cut.`,
      artifact: "EMPATHY MAP · Thinks",
      tags: ["compass", "rules", "operating"],
      data: () => (
        <BulletPanel
          heading="THINKS · OPERATING COMPASS"
          items={[...EMPATHY_MAP.thinks]}
          marker="▸"
        />
      ),
      by: "kiruk",
      ts: now - 1.5 * d,
      baseDiggs: 174,
      baseBuries: 7,
      category: "personal",
      seed: [
        { author: "anon-2", body: "Ship fast, iterate faster — every startup engineer's tattoo. Bury.", ts: now - 1.2 * d },
        { author: "kiruk", body: "@anon-2 the third rule — user problems → solutions — is the one most engineers skip. that's why the line stays.", ts: now - 1.1 * d },
      ],
    },

    // ── 9 · USABILITY TEST · channel ranking ────────────────────────
    {
      id: "st-channels",
      title: `Usability Test for "contact me" — task: ${USABILITY_TEST.task.toLowerCase()}. ${USABILITY_TEST.channels.length} channels, ranked by question type.`,
      desc: `${USABILITY_TEST.taskBody} Pick the channel that fits the question, not the politest one. Latency before etiquette.`,
      artifact: "USABILITY TEST · Channels",
      tags: ["usability test", "contact", "channels"],
      data: () => (
        <>
          <ChannelTable channels={[...USABILITY_TEST.channels]} />
          <MetricsRow items={[...USABILITY_TEST.successMetrics]} />
        </>
      ),
      by: "kiruk",
      ts: now - 2 * d,
      baseDiggs: 138,
      baseBuries: 9,
      category: "process",
    },

    // ── 10 · TRAJECTORY · current bench ─────────────────────────────
    {
      id: "st-current",
      title: `Current bench — ${nodes[nodes.length - 1].position} @ ${nodes[nodes.length - 1].org.split(" · ")[0]}.`,
      desc: nodes[nodes.length - 1].detail,
      artifact: "PROFILE · Now",
      tags: ["current", "bench", "live"],
      data: () => (
        <NodeCard node={nodes[nodes.length - 1]} />
      ),
      by: "kiruk",
      ts: now - 3 * d,
      baseDiggs: 102,
      baseBuries: 4,
      category: "career",
      seed: [
        { author: "hpprintai", body: "Confirmed. Owns the design-system seed.", ts: now - 2.5 * d },
      ],
    },
  ];
}

// ── Sort modes ───────────────────────────────────────────────────────

type SortMode = "hot" | "top" | "new";

function score(
  story: Story,
  votes: Record<string, number>,
): number {
  // Score = diggs - buries + user vote delta. We track a single net delta per story.
  const delta = votes[story.id] ?? 0;
  return story.baseDiggs - story.baseBuries + delta;
}

function rank(stories: Story[], votes: Record<string, number>, mode: SortMode): Story[] {
  const arr = stories.slice();
  if (mode === "hot") {
    // Score weighted by inverse-age (newer + voted = hotter)
    arr.sort((a, b) => {
      const ageA = (Date.now() - a.ts) / 3_600_000 + 2;
      const ageB = (Date.now() - b.ts) / 3_600_000 + 2;
      return score(b, votes) / ageB - score(a, votes) / ageA;
    });
  } else if (mode === "top") {
    arr.sort((a, b) => score(b, votes) - score(a, votes));
  } else {
    arr.sort((a, b) => b.ts - a.ts);
  }
  return arr;
}

// ── Hook ─────────────────────────────────────────────────────────────

function useIsMobile(breakpoint = 768): boolean {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const check = () => setMobile(window.innerWidth < breakpoint);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [breakpoint]);
  return mobile;
}

// ── Main component ───────────────────────────────────────────────────

export function MicroblogHomePage() {
  const { setLayoutMode } = useLayoutMode();
  useEffect(() => {
    setLayoutMode("full-digital");
  }, [setLayoutMode]);
  const isMobile = useIsMobile();

  // Seed + user-submitted stories
  const seedStories = useMemo(buildSeedStories, []);
  const [userStories, setUserStories] = useState<Story[]>([]);
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("kiruk-2006-stories");
      if (raw) setUserStories(JSON.parse(raw) as Story[]);
    } catch {/* noop */}
  }, []);
  useEffect(() => {
    try {
      sessionStorage.setItem("kiruk-2006-stories", JSON.stringify(userStories));
    } catch {/* noop */}
  }, [userStories]);
  const stories = useMemo(() => [...userStories, ...seedStories], [userStories, seedStories]);

  // Vote state per story id — net delta (+N up, -N down). Persist.
  const [votes, setVotes] = useState<Record<string, number>>({});
  const [myVote, setMyVote] = useState<Record<string, 1 | -1>>({});
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("kiruk-2006-votes");
      if (raw) {
        const p = JSON.parse(raw) as { votes: Record<string, number>; mine: Record<string, 1 | -1> };
        setVotes(p.votes ?? {});
        setMyVote(p.mine ?? {});
      }
    } catch {/* noop */}
  }, []);
  useEffect(() => {
    try {
      sessionStorage.setItem("kiruk-2006-votes", JSON.stringify({ votes, mine: myVote }));
    } catch {/* noop */}
  }, [votes, myVote]);

  const dig = useCallback(
    (id: string) => {
      const prev = myVote[id];
      let delta = 1;
      if (prev === 1) delta = -1; // un-dig
      else if (prev === -1) delta = 2; // flip
      setVotes((v) => ({ ...v, [id]: (v[id] ?? 0) + delta }));
      setMyVote((m) => {
        const next = { ...m };
        if (prev === 1) delete next[id];
        else next[id] = 1;
        return next;
      });
    },
    [myVote],
  );
  const bury = useCallback(
    (id: string) => {
      const prev = myVote[id];
      let delta = -1;
      if (prev === -1) delta = 1; // un-bury
      else if (prev === 1) delta = -2; // flip
      setVotes((v) => ({ ...v, [id]: (v[id] ?? 0) + delta }));
      setMyVote((m) => {
        const next = { ...m };
        if (prev === -1) delete next[id];
        else next[id] = -1;
        return next;
      });
    },
    [myVote],
  );

  // Sort + filters
  const [sortMode, setSortMode] = useState<SortMode>("hot");
  const [catFilter, setCatFilter] = useState<Category | null>(null);
  const [authorFilter, setAuthorFilter] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [queryDraft, setQueryDraft] = useState("");
  const ranked = useMemo(() => {
    let pool = stories;
    if (catFilter) pool = pool.filter((s) => s.category === catFilter);
    if (authorFilter) pool = pool.filter((s) => s.by === authorFilter);
    if (query) {
      const q = query.toLowerCase();
      pool = pool.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.desc.toLowerCase().includes(q) ||
          s.artifact.toLowerCase().includes(q) ||
          s.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }
    return rank(pool, votes, sortMode);
  }, [stories, votes, sortMode, catFilter, authorFilter, query]);

  const clearAllFilters = () => {
    setCatFilter(null);
    setAuthorFilter(null);
    setQuery("");
    setQueryDraft("");
  };

  // Ephemeral toast
  const [toast, setToast] = useState<string | null>(null);
  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 2400);
    return () => window.clearTimeout(id);
  }, [toast]);

  // Submit form ref — for scroll-to
  const submitFormRef = useRef<HTMLDivElement | null>(null);
  const scrollToSubmit = () => {
    if (!submitFormRef.current) return;
    const y =
      submitFormRef.current.getBoundingClientRect().top + window.scrollY - 70;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  // Top ref — for scroll-to-top
  const topRef = useRef<HTMLDivElement | null>(null);
  const scrollTop = () => {
    if (!topRef.current) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const y = topRef.current.getBoundingClientRect().top + window.scrollY - 60;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  // Share
  const share = (storyId: string, title: string) => {
    const url = `${window.location.origin}${window.location.pathname}#story-${storyId}`;
    try {
      navigator.clipboard
        ?.writeText(url)
        .then(() => setToast(`📋 link copied · "${title.slice(0, 36)}…"`))
        .catch(() => setToast(`🔗 ${url}`));
    } catch {
      setToast(`🔗 ${url}`);
    }
  };

  // Comments (persist)
  type Comment = { id: string; author: string; body: string; ts: number };
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("kiruk-2006-comments");
      if (raw) setComments(JSON.parse(raw) as Record<string, Comment[]>);
    } catch {/* noop */}
  }, []);
  useEffect(() => {
    try {
      sessionStorage.setItem("kiruk-2006-comments", JSON.stringify(comments));
    } catch {/* noop */}
  }, [comments]);
  const addComment = (storyId: string, c: Comment) => {
    setComments((prev) => ({
      ...prev,
      [storyId]: [c, ...(prev[storyId] ?? [])],
    }));
  };

  // Expanded story
  const [openId, setOpenId] = useState<string | null>(null);

  // Saved (bookmarks) — sessionStorage
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("kiruk-2006-saved");
      if (raw) setSaved(JSON.parse(raw) as Record<string, boolean>);
    } catch {/* noop */}
  }, []);
  useEffect(() => {
    try {
      sessionStorage.setItem("kiruk-2006-saved", JSON.stringify(saved));
    } catch {/* noop */}
  }, [saved]);
  const toggleSaved = (id: string) =>
    setSaved((s) => {
      const next = { ...s };
      if (next[id]) delete next[id];
      else next[id] = true;
      return next;
    });

  // Submit story
  const [subTitle, setSubTitle] = useState("");
  const [subDesc, setSubDesc] = useState("");
  const [subCat, setSubCat] = useState<Category>("ux");
  const [subAuthor, setSubAuthor] = useState("");
  const canSubmit = subTitle.trim().length > 4 && subDesc.trim().length > 4;
  const submitStory = () => {
    if (!canSubmit) return;
    const id = `u-${Date.now()}`;
    const author = (subAuthor.trim() || "guest").toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 20) || "guest";
    setUserStories((prev) => [
      {
        id,
        title: subTitle.trim().slice(0, 140),
        desc: subDesc.trim().slice(0, 280),
        artifact: "VISITOR SUBMISSION",
        tags: ["visitor", subCat],
        by: author,
        ts: Date.now(),
        baseDiggs: 1,
        baseBuries: 0,
        category: subCat,
      },
      ...prev,
    ]);
    setSubTitle("");
    setSubDesc("");
    setSubAuthor("");
    setOpenId(id);
  };

  // Real visitor count
  const [views, setViews] = useState<number | null>(null);
  useEffect(() => {
    fetch("/api/visitors").then((r) => r.json()).then((d) => {
      if (typeof d?.count === "number") setViews(d.count);
    }).catch(() => {});
    fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "page_view", path: "/era/2006" }),
    }).catch(() => {});
  }, []);

  const totalDiggsToday = useMemo(
    () =>
      stories.reduce(
        (sum, s) => sum + (s.baseDiggs + (votes[s.id] ?? 0)),
        0,
      ),
    [stories, votes],
  );

  return (
    <div
      id="kiruk-digg-profile"
      style={{
        position: "relative",
        minHeight: "100vh",
        backgroundColor: PAGE_BG,
        color: INK,
        fontFamily: FONT_UI,
        paddingBottom: 30,
      }}
    >
      <style jsx global>{`
        @keyframes kiruk-2006-dig-pop {
          0% { transform: scale(1); }
          40% { transform: scale(1.5); }
          100% { transform: scale(1); }
        }
        @keyframes kiruk-2006-toast-in {
          0%   { opacity: 0; transform: translate(-50%, 12px); }
          100% { opacity: 1; transform: translate(-50%, 0); }
        }
        .digg-link {
          color: ${LINK};
          text-decoration: none;
        }
        .digg-link:hover { text-decoration: underline; }
      `}</style>

      {/* ── HEADER ─────────────────────────────────────────── */}
      <header
        ref={topRef}
        style={{
          background: `linear-gradient(180deg, ${HEAD_BG} 0%, ${HEAD_BG_DEEP} 100%)`,
          color: "#fff",
          borderBottom: `2px solid ${HEAD_BG_DARK}`,
          padding: "8px 14px",
          display: "grid",
          gridTemplateColumns: isMobile ? "auto 1fr" : "auto 1fr auto",
          alignItems: "center",
          gap: 12,
          boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            type="button"
            onClick={scrollTop}
            title="Back to top"
            style={{
              fontFamily: FONT_DISPLAY,
              fontSize: 30,
              fontWeight: 900,
              letterSpacing: -2,
              color: "#fff",
              textShadow: "0 2px 0 rgba(0,0,0,0.35)",
              lineHeight: 1,
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
          >
            digg
          </button>
          <span
            style={{
              fontSize: 11,
              color: "#fff8e8",
              letterSpacing: 1,
              borderLeft: "1px solid rgba(255,255,255,0.4)",
              paddingLeft: 8,
              fontStyle: "italic",
            }}
          >
            kiruk's profile · everything below is dug or buried by visitors
          </span>
        </div>
        {!isMobile && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setQuery(queryDraft.trim());
              if (queryDraft.trim()) setToast(`🔍 filtering by "${queryDraft.trim()}"`);
            }}
            style={{
              display: "flex",
              gap: 6,
              alignItems: "center",
              background: "#fff",
              border: "1px solid #6a2900",
              borderRadius: 3,
              padding: "2px 4px 2px 8px",
              justifySelf: "center",
              width: "min(360px, 100%)",
              boxShadow: "inset 0 1px 2px rgba(0,0,0,0.18)",
            }}
          >
            <span style={{ color: MUTED, fontSize: 12 }}>🔍</span>
            <input
              value={queryDraft}
              onChange={(e) => setQueryDraft(e.target.value)}
              placeholder="search title, desc, artifact, tag…"
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                fontFamily: FONT_UI,
                fontSize: 12,
                padding: "3px 4px",
                color: INK,
              }}
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setQueryDraft("");
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  color: MUTED,
                  cursor: "pointer",
                  fontSize: 12,
                  padding: "0 4px",
                }}
                title="Clear search"
              >
                ×
              </button>
            )}
            <button
              type="submit"
              style={{
                padding: "2px 10px",
                fontFamily: FONT_DISPLAY,
                fontSize: 10,
                fontWeight: 900,
                letterSpacing: 1,
                color: "#fff",
                background: `linear-gradient(180deg, ${HEAD_BG} 0%, ${HEAD_BG_DEEP} 100%)`,
                border: "1px solid #6a2900",
                borderRadius: 2,
                cursor: "pointer",
                textTransform: "uppercase",
              }}
            >
              Go
            </button>
          </form>
        )}
        <div style={{ display: "flex", gap: 6, alignItems: "center", justifySelf: "end" }}>
          <span style={{ fontSize: 10, color: "#fff8e8" }}>
            {views !== null ? `${views.toLocaleString()} views` : "—"}
          </span>
          <GelBtn onClick={() => setToast("sign in disabled · this is a profile demo")}>
            Sign In
          </GelBtn>
          <GelBtn primary onClick={scrollToSubmit}>
            Submit Story
          </GelBtn>
        </div>
      </header>

      {/* ── CATEGORY NAV ──────────────────────────────────── */}
      <nav
        style={{
          background: NAV_BAR,
          borderBottom: `1px solid ${BORDER}`,
          padding: "6px 14px",
          display: "flex",
          gap: 6,
          alignItems: "center",
          flexWrap: "wrap",
          fontFamily: FONT_UI,
          fontSize: 11,
          color: INK_DIM,
          boxShadow: "inset 0 -1px 0 rgba(0,0,0,0.06)",
        }}
      >
        <strong style={{ color: INK, marginRight: 6 }}>Categories:</strong>
        <CatPill
          active={catFilter === null}
          tint={HEAD_BG}
          onClick={() => setCatFilter(null)}
        >
          all
        </CatPill>
        {CATEGORIES.map((c) => (
          <CatPill
            key={c.id}
            active={catFilter === c.id}
            tint={c.tint}
            onClick={() => setCatFilter(c.id === catFilter ? null : c.id)}
          >
            {c.label.toLowerCase()}
          </CatPill>
        ))}
        <span style={{ marginLeft: "auto", fontSize: 10, color: MUTED }}>
          <strong style={{ color: HEAD_BG }}>
            {totalDiggsToday.toLocaleString()}
          </strong>{" "}
          diggs in last 24h
        </span>
      </nav>

      {/* ── BODY ─────────────────────────────────────────── */}
      <div
        style={{
          maxWidth: 980,
          margin: "12px auto 0",
          padding: isMobile ? "0 8px" : "0 14px",
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 240px",
          gap: 14,
          alignItems: "start",
        }}
      >
        {/* Left: sort tabs + story list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {/* Active filter banner */}
          {(catFilter || authorFilter || query) && (
            <div
              style={{
                display: "flex",
                gap: 6,
                alignItems: "center",
                background: "#fff8d0",
                border: `1px solid ${GOLD}88`,
                padding: "4px 10px",
                fontSize: 11,
                color: INK,
                flexWrap: "wrap",
              }}
            >
              <strong style={{ color: HEAD_BG_DEEP }}>filtering:</strong>
              {catFilter && (
                <Chip
                  label={`category · ${CATEGORIES.find((c) => c.id === catFilter)?.label}`}
                  onClear={() => setCatFilter(null)}
                />
              )}
              {authorFilter && (
                <Chip
                  label={`by · /${authorFilter}`}
                  onClear={() => setAuthorFilter(null)}
                />
              )}
              {query && (
                <Chip
                  label={`search · "${query}"`}
                  onClear={() => {
                    setQuery("");
                    setQueryDraft("");
                  }}
                />
              )}
              <span style={{ marginLeft: "auto", fontSize: 10, color: INK_DIM }}>
                {ranked.length} match{ranked.length === 1 ? "" : "es"}
              </span>
              <button
                type="button"
                onClick={clearAllFilters}
                style={{
                  fontSize: 10,
                  padding: "1px 6px",
                  background: "transparent",
                  border: `1px solid ${INK_DIM}66`,
                  borderRadius: 2,
                  cursor: "pointer",
                  color: INK_DIM,
                  fontFamily: FONT_UI,
                }}
              >
                clear all
              </button>
            </div>
          )}

          {/* Sort tabs */}
          <div
            style={{
              display: "flex",
              borderBottom: `2px solid ${HEAD_BG}`,
              gap: 0,
              alignItems: "flex-end",
            }}
          >
            {(["hot", "top", "new"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setSortMode(m)}
                style={{
                  padding: "5px 14px",
                  fontFamily: FONT_DISPLAY,
                  fontSize: 11,
                  fontWeight: 900,
                  letterSpacing: 1,
                  textTransform: "uppercase",
                  color: sortMode === m ? "#fff" : INK_DIM,
                  background:
                    sortMode === m
                      ? `linear-gradient(180deg, ${HEAD_BG} 0%, ${HEAD_BG_DEEP} 100%)`
                      : CARD,
                  border: `1px solid ${BORDER}`,
                  borderBottom: sortMode === m ? "none" : `1px solid ${BORDER}`,
                  borderTopLeftRadius: 3,
                  borderTopRightRadius: 3,
                  cursor: "pointer",
                  marginRight: 2,
                  textShadow: sortMode === m ? "0 1px 0 rgba(0,0,0,0.3)" : "none",
                }}
              >
                {m === "hot" ? "🔥 hot" : m === "top" ? "★ top" : "📌 new"}
              </button>
            ))}
            <span
              style={{
                marginLeft: "auto",
                padding: "5px 8px",
                fontSize: 10,
                color: INK_DIM,
              }}
            >
              showing <strong style={{ color: INK }}>{ranked.length}</strong>{" "}
              stor{ranked.length === 1 ? "y" : "ies"}
              {catFilter && (
                <>
                  {" "}in{" "}
                  <strong style={{ color: HEAD_BG }}>
                    {CATEGORIES.find((c) => c.id === catFilter)?.label}
                  </strong>
                </>
              )}
            </span>
          </div>

          {/* Stories */}
          <ol style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {ranked.map((s, i) => (
              <li key={s.id}>
                <StoryRow
                  story={s}
                  index={i + 1}
                  vote={myVote[s.id]}
                  score={score(s, votes)}
                  open={openId === s.id}
                  comments={comments[s.id] ?? []}
                  isEditorsPick={i === 0}
                  isSaved={!!saved[s.id]}
                  onDig={() => dig(s.id)}
                  onBury={() => bury(s.id)}
                  onSave={() => {
                    toggleSaved(s.id);
                    setToast(
                      saved[s.id] ? "★ removed from saved" : "★ saved for later",
                    );
                  }}
                  onToggle={() => setOpenId(openId === s.id ? null : s.id)}
                  onAddComment={(c) => addComment(s.id, c)}
                  onShare={() => share(s.id, s.title)}
                  onAuthorClick={() => {
                    setAuthorFilter(s.by);
                    setToast(`filtering by /${s.by}`);
                  }}
                />
              </li>
            ))}
            {ranked.length === 0 && (
              <li
                style={{
                  padding: 20,
                  textAlign: "center",
                  fontSize: 13,
                  color: INK_DIM,
                  background: CARD,
                  border: `1px solid ${BORDER}`,
                }}
              >
                No stories in this category yet. Submit one ↓
              </li>
            )}
          </ol>

          {/* Submit Story form */}
          <div ref={submitFormRef}>
            <SubmitForm
              title={subTitle}
              setTitle={setSubTitle}
              desc={subDesc}
              setDesc={setSubDesc}
              cat={subCat}
              setCat={setSubCat}
              author={subAuthor}
              setAuthor={setSubAuthor}
              canSubmit={canSubmit}
              onSubmit={() => {
                submitStory();
                setToast("✓ story submitted · score starts at 1");
              }}
            />
          </div>
        </div>

        {/* Right: sidebar */}
        {!isMobile && (
          <aside style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <SideCard heading="At-A-Glance">
              <SideRow k="profile">{PERSONA.identity.name}</SideRow>
              <SideRow k="role">{PERSONA.identity.role}</SideRow>
              <SideRow k="city">{PERSONA.identity.location}</SideRow>
              <SideRow k="motto">
                <em>{WHY_KIRUK.tagline}</em>
              </SideRow>
            </SideCard>

            <SideCard
              heading="Trending Categories"
              foot="click to filter the list"
            >
              {CATEGORIES.map((c) => {
                const n = stories.filter((s) => s.category === c.id).length;
                const active = catFilter === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCatFilter(active ? null : c.id)}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr auto",
                      width: "100%",
                      padding: "3px 4px",
                      background: active ? `${c.tint}22` : "transparent",
                      border: "none",
                      borderBottom: `1px dotted ${BORDER}88`,
                      cursor: "pointer",
                      textAlign: "left",
                      fontFamily: FONT_UI,
                      fontSize: 11,
                      borderLeft: active ? `2px solid ${c.tint}` : "2px solid transparent",
                    }}
                  >
                    <span style={{ color: c.tint, fontWeight: active ? 700 : 400 }}>
                      {c.label}
                    </span>
                    <span style={{ color: MUTED, fontSize: 10 }}>{n}</span>
                  </button>
                );
              })}
            </SideCard>

            {Object.keys(saved).length > 0 && (
              <SideCard heading={`Saved · ${Object.keys(saved).length}`} foot="persists for this session">
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {stories
                    .filter((s) => saved[s.id])
                    .map((s) => (
                      <li
                        key={s.id}
                        style={{
                          padding: "3px 0",
                          borderBottom: `1px dotted ${BORDER}`,
                          fontSize: 11,
                          lineHeight: 1.4,
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => setOpenId(s.id)}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: LINK,
                            textAlign: "left",
                            padding: 0,
                            cursor: "pointer",
                            textDecoration: "underline",
                            fontFamily: FONT_UI,
                            fontSize: 11,
                          }}
                        >
                          ★ {s.title.length > 52 ? s.title.slice(0, 52) + "…" : s.title}
                        </button>
                      </li>
                    ))}
                </ul>
              </SideCard>
            )}

            <SideCard heading="Top 5 · last 24h" foot="ranked by dig count">
              <ol style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {rank(stories, votes, "top").slice(0, 5).map((s, i) => (
                  <li
                    key={s.id}
                    style={{
                      padding: "4px 0",
                      borderBottom: `1px dotted ${BORDER}`,
                      fontSize: 11,
                      color: INK,
                      lineHeight: 1.4,
                    }}
                  >
                    <span
                      style={{
                        color: HEAD_BG,
                        fontWeight: 900,
                        fontFamily: FONT_DISPLAY,
                        marginRight: 4,
                      }}
                    >
                      {i + 1}.
                    </span>
                    <button
                      type="button"
                      onClick={() => setOpenId(s.id)}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: LINK,
                        textAlign: "left",
                        padding: 0,
                        cursor: "pointer",
                        fontFamily: FONT_UI,
                        fontSize: 11,
                        textDecoration: "underline",
                      }}
                    >
                      {s.title.length > 56 ? s.title.slice(0, 56) + "…" : s.title}
                    </button>
                    <div style={{ fontSize: 10, color: MUTED, marginTop: 1 }}>
                      <span style={{ color: VOTE_UP, fontWeight: 700 }}>
                        ▲ {score(s, votes)}
                      </span>{" "}
                      · {hAgo(s.ts)}
                    </div>
                  </li>
                ))}
              </ol>
            </SideCard>

            <SideCard heading="Active Diggers" foot="click to filter by handle">
              {([
                [ERA_SUBJECT.handle, ERA_SUBJECT.shortName, "#cc6600"],
                ["donnorman",  "Don Norman",    "#003366"],
                ["worrydream", "Bret Victor",   "#cc0066"],
                ["figma",      "Figma",         "#a259ff"],
                ["sona",       "Sona College",  "#9933cc"],
                ["hpprintai",  ERA_BRAND.employerDisplay, "#0066cc"],
              ] as const).map(([h, n, bg]) => {
                const active = authorFilter === h;
                const myCount = stories.filter((s) => s.by === h).length;
                const seedCommentCount = stories.reduce(
                  (sum, s) =>
                    sum + ((s.seed ?? []).filter((c) => c.author === h).length),
                  0,
                );
                const totalActions = myCount + seedCommentCount;
                if (totalActions === 0) return null;
                return (
                  <button
                    key={h}
                    type="button"
                    onClick={() => {
                      setAuthorFilter(active ? null : h);
                      setToast(active ? "cleared author filter" : `filtering by /${h}`);
                    }}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "26px 1fr auto",
                      gap: 6,
                      alignItems: "center",
                      padding: "3px 4px",
                      borderBottom: `1px dotted ${BORDER}`,
                      fontSize: 11,
                      background: active ? `${HEAD_BG}22` : "transparent",
                      border: "none",
                      borderLeft: active ? `2px solid ${HEAD_BG}` : "2px solid transparent",
                      width: "100%",
                      cursor: "pointer",
                      textAlign: "left",
                      fontFamily: FONT_UI,
                    }}
                  >
                    <div
                      aria-hidden
                      style={{
                        width: 26,
                        height: 26,
                        background: bg,
                        color: "#fff",
                        fontFamily: FONT_DISPLAY,
                        fontSize: 13,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 2,
                        textShadow: "1px 1px 0 rgba(0,0,0,0.4)",
                      }}
                    >
                      {n.charAt(0)}
                    </div>
                    <div>
                      <strong style={{ color: INK }}>{n}</strong>
                      <div style={{ fontSize: 9, color: LINK }}>/{h}</div>
                    </div>
                    <span style={{ fontSize: 9, color: MUTED }}>
                      {myCount > 0 && (
                        <span>
                          <strong style={{ color: HEAD_BG }}>{myCount}</strong>{" "}
                          post{myCount === 1 ? "" : "s"}
                        </span>
                      )}
                      {seedCommentCount > 0 && myCount === 0 && (
                        <span>
                          <strong style={{ color: VOTE_UP }}>{seedCommentCount}</strong>{" "}
                          comment{seedCommentCount === 1 ? "" : "s"}
                        </span>
                      )}
                    </span>
                  </button>
                );
              })}
            </SideCard>

            <div
              style={{
                fontSize: 10,
                color: INK_DIM,
                textAlign: "center",
                lineHeight: 1.5,
              }}
            >
              <FooterLink onClick={scrollTop}>About</FooterLink>
              {" · "}
              <FooterLink onClick={scrollToSubmit}>Submit</FooterLink>
              {" · "}
              <FooterLink onClick={clearAllFilters}>Reset</FooterLink>
              {" · "}
              <FooterLink onClick={() => setSortMode("top")}>All Time Top</FooterLink>
              <br />
              © 2006 digg · powered by the wisdom of the crowd
            </div>
          </aside>
        )}
      </div>

      {/* Toast portal */}
      {toast && (
        <div
          role="status"
          style={{
            position: "fixed",
            bottom: 18,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 100,
            padding: "8px 16px",
            background: `linear-gradient(180deg, ${HEAD_BG} 0%, ${HEAD_BG_DEEP} 100%)`,
            color: "#fff",
            border: "1px solid #6a2900",
            borderRadius: 3,
            fontFamily: FONT_UI,
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: 0.5,
            boxShadow: "0 6px 18px rgba(0,0,0,0.4)",
            textShadow: "0 1px 0 rgba(0,0,0,0.35)",
            animation: "kiruk-2006-toast-in 220ms ease-out",
            pointerEvents: "none",
          }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}

// ── Story row ────────────────────────────────────────────────────────

function StoryRow({
  story,
  index,
  vote,
  score: scoreVal,
  open,
  comments,
  isEditorsPick,
  isSaved,
  onDig,
  onBury,
  onSave,
  onToggle,
  onAddComment,
  onShare,
  onAuthorClick,
}: {
  story: Story;
  index: number;
  vote: 1 | -1 | undefined;
  score: number;
  open: boolean;
  comments: Array<{ id: string; author: string; body: string; ts: number }>;
  isEditorsPick: boolean;
  isSaved: boolean;
  onDig: () => void;
  onBury: () => void;
  onSave: () => void;
  onToggle: () => void;
  onAddComment: (c: { id: string; author: string; body: string; ts: number }) => void;
  onShare: () => void;
  onAuthorClick: () => void;
}) {
  const cat = CATEGORIES.find((c) => c.id === story.category)!;
  const allComments = useMemo(
    () => [...(comments ?? []), ...((story.seed ?? []) as Array<{ author: string; body: string; ts: number }>).map((s, i) => ({ id: `seed-${story.id}-${i}`, ...s }))],
    [comments, story.seed, story.id],
  );
  const [replyAuthor, setReplyAuthor] = useState("");
  const [replyBody, setReplyBody] = useState("");
  const [favPop, setFavPop] = useState(0);
  const submit = () => {
    if (!replyBody.trim()) return;
    onAddComment({
      id: `c-${Date.now()}`,
      author: replyAuthor.trim() || "anon",
      body: replyBody.trim(),
      ts: Date.now(),
    });
    setReplyBody("");
  };

  return (
    <article
      style={{
        background: CARD,
        border: `1px solid ${BORDER}`,
        borderLeft: `4px solid ${cat.tint}`,
        marginBottom: 8,
        boxShadow: isEditorsPick
          ? `0 0 0 1px ${GOLD}66, 0 1px 4px rgba(0,0,0,0.12)`
          : "0 1px 2px rgba(0,0,0,0.08)",
        position: "relative",
      }}
    >
      {isEditorsPick && (
        <span
          style={{
            position: "absolute",
            top: -8,
            left: 12,
            padding: "1px 8px",
            fontFamily: FONT_DISPLAY,
            fontSize: 9,
            fontWeight: 900,
            letterSpacing: 2,
            color: "#fff",
            background: `linear-gradient(180deg, ${GOLD} 0%, #8a6500 100%)`,
            border: "1px solid #5a4400",
            borderRadius: 2,
            textTransform: "uppercase",
            textShadow: "0 1px 0 rgba(0,0,0,0.4)",
            boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
            zIndex: 2,
          }}
        >
          ★ Editor's Pick
        </span>
      )}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "62px 1fr",
          gap: 10,
          padding: "10px 12px",
        }}
      >
        {/* Vote column */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
          }}
        >
          <button
            type="button"
            onClick={() => {
              onDig();
              setFavPop((p) => p + 1);
            }}
            title="Dig this story up"
            style={{
              width: 56,
              padding: "3px 0",
              fontFamily: FONT_DISPLAY,
              fontSize: 11,
              fontWeight: 900,
              letterSpacing: 1,
              color: vote === 1 ? "#fff" : VOTE_UP,
              background:
                vote === 1
                  ? `linear-gradient(180deg, ${VOTE_UP} 0%, #3a7610 100%)`
                  : VOTE_UP_BG,
              border: `1px solid ${VOTE_UP}88`,
              borderRadius: 3,
              cursor: "pointer",
              textShadow: vote === 1 ? "0 1px 0 rgba(0,0,0,0.3)" : "none",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.5)",
            }}
          >
            <span
              key={favPop}
              style={{
                display: "inline-block",
                animation: favPop > 0 ? "kiruk-2006-dig-pop 320ms ease-out" : "none",
              }}
            >
              ▲
            </span>{" "}
            dig
          </button>
          <div
            style={{
              fontFamily: FONT_DISPLAY,
              fontSize: 20,
              fontWeight: 900,
              color: scoreVal < 0 ? VOTE_DN : INK,
              letterSpacing: -0.5,
              lineHeight: 1,
              padding: "3px 0",
            }}
          >
            {scoreVal}
          </div>
          <button
            type="button"
            onClick={onBury}
            title="Bury this story down"
            style={{
              width: 56,
              padding: "3px 0",
              fontFamily: FONT_DISPLAY,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: 1,
              color: vote === -1 ? "#fff" : VOTE_DN,
              background:
                vote === -1
                  ? `linear-gradient(180deg, ${VOTE_DN} 0%, #6a2010 100%)`
                  : VOTE_DN_BG,
              border: `1px solid ${VOTE_DN}88`,
              borderRadius: 3,
              cursor: "pointer",
              textShadow: vote === -1 ? "0 1px 0 rgba(0,0,0,0.3)" : "none",
            }}
          >
            ▼ bury
          </button>
        </div>

        {/* Body */}
        <div>
          <button
            type="button"
            onClick={onToggle}
            style={{
              background: "transparent",
              border: "none",
              padding: 0,
              cursor: "pointer",
              textAlign: "left",
              color: LINK,
              fontFamily: FONT_DISPLAY,
              fontSize: 15,
              fontWeight: 700,
              lineHeight: 1.3,
              letterSpacing: -0.2,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
            onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
          >
            <span style={{ color: MUTED, fontFamily: FONT_DISPLAY, fontWeight: 900, marginRight: 4 }}>
              {index}.
            </span>
            {story.title}
          </button>
          <div
            style={{
              display: "flex",
              gap: 8,
              fontSize: 10,
              color: MUTED,
              marginTop: 4,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                padding: "1px 6px",
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: 1,
                color: "#fff",
                background: cat.tint,
                borderRadius: 2,
                textTransform: "uppercase",
                textShadow: "0 1px 0 rgba(0,0,0,0.3)",
              }}
            >
              {cat.label}
            </span>
            <span>
              submitted {hAgo(story.ts)} by{" "}
              <button
                type="button"
                onClick={onAuthorClick}
                style={{
                  background: "transparent",
                  border: "none",
                  color: LINK,
                  cursor: "pointer",
                  padding: 0,
                  fontFamily: FONT_UI,
                  fontSize: 10,
                  textDecoration: "underline",
                }}
                title={`Filter by /${story.by}`}
              >
                /{story.by}
              </button>
            </span>
            <span style={{ color: BORDER }}>·</span>
            <button
              type="button"
              onClick={onToggle}
              style={{
                background: "transparent",
                border: "none",
                color: LINK,
                cursor: "pointer",
                padding: 0,
                fontFamily: FONT_UI,
                fontSize: 10,
                textDecoration: "underline",
              }}
            >
              💬 {allComments.length} comment{allComments.length === 1 ? "" : "s"}{open ? " · close ▴" : " · open ▾"}
            </button>
            <span style={{ color: BORDER }}>·</span>
            <button
              type="button"
              onClick={onSave}
              title={isSaved ? "Remove from saved" : "Save to read later"}
              style={{
                background: "transparent",
                border: "none",
                color: isSaved ? GOLD : MUTED,
                cursor: "pointer",
                padding: 0,
                fontFamily: FONT_UI,
                fontSize: 10,
                fontWeight: isSaved ? 700 : 400,
                textDecoration: "underline",
              }}
            >
              {isSaved ? "★ saved" : "☆ save"}
            </button>
            <span style={{ color: BORDER }}>·</span>
            <button
              type="button"
              onClick={onShare}
              title="Copy link to this story"
              style={{
                background: "transparent",
                border: "none",
                color: LINK,
                cursor: "pointer",
                padding: 0,
                fontFamily: FONT_UI,
                fontSize: 10,
                textDecoration: "underline",
              }}
            >
              share
            </button>
            {vote && (
              <span
                style={{
                  marginLeft: "auto",
                  fontSize: 9,
                  color: vote === 1 ? VOTE_UP : VOTE_DN,
                  fontWeight: 700,
                  letterSpacing: 1,
                  textTransform: "uppercase",
                }}
              >
                you {vote === 1 ? "dug" : "buried"} this
              </span>
            )}
          </div>

          {/* Expanded panel */}
          {open && (
            <div
              style={{
                marginTop: 10,
                padding: "10px 12px",
                background: CARD_DIM,
                border: `1px solid ${BORDER}`,
                fontSize: 13,
                color: INK,
                lineHeight: 1.55,
              }}
            >
              {/* Series + tags */}
              <div
                style={{
                  display: "flex",
                  gap: 6,
                  alignItems: "center",
                  marginBottom: 6,
                  flexWrap: "wrap",
                }}
              >
                <span
                  style={{
                    fontFamily: FONT_DISPLAY,
                    fontSize: 9,
                    fontWeight: 900,
                    letterSpacing: 2,
                    padding: "1px 6px",
                    color: "#fff",
                    background: cat.tint,
                    borderRadius: 2,
                    textTransform: "uppercase",
                    textShadow: "0 1px 0 rgba(0,0,0,0.3)",
                  }}
                >
                  SERIES · {story.artifact}
                </span>
                {story.tags.map((t) => (
                  <span
                    key={t}
                    style={{
                      fontSize: 9,
                      fontFamily: FONT_UI,
                      color: cat.tint,
                      background: "#fff",
                      padding: "1px 5px",
                      border: `1px solid ${cat.tint}55`,
                      borderRadius: 2,
                      letterSpacing: 0.3,
                    }}
                  >
                    #{t}
                  </span>
                ))}
              </div>
              <p style={{ margin: 0 }}>{story.desc}</p>
              {story.data && story.data()}

              {/* Comments */}
              <div
                style={{
                  marginTop: 10,
                  paddingTop: 8,
                  borderTop: `1px dashed ${BORDER}`,
                }}
              >
                <div
                  style={{
                    fontFamily: FONT_DISPLAY,
                    fontSize: 10,
                    letterSpacing: 2,
                    color: HEAD_BG,
                    textTransform: "uppercase",
                    fontWeight: 900,
                    marginBottom: 5,
                  }}
                >
                  💬 {allComments.length} comment{allComments.length === 1 ? "" : "s"}
                </div>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {allComments.map((c) => (
                    <li
                      key={c.id}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "80px 1fr",
                        gap: 8,
                        padding: "4px 0",
                        borderBottom: `1px dotted ${BORDER}`,
                        fontSize: 12,
                      }}
                    >
                      <span style={{ color: LINK, fontWeight: 700 }}>
                        /{c.author}
                      </span>
                      <span>
                        {c.body}{" "}
                        <span style={{ color: MUTED, fontSize: 10 }}>· {hAgo(c.ts)}</span>
                      </span>
                    </li>
                  ))}
                  {allComments.length === 0 && (
                    <li
                      style={{
                        padding: "4px 0",
                        fontSize: 11,
                        color: MUTED,
                        fontStyle: "italic",
                      }}
                    >
                      No comments yet — be the first to weigh in.
                    </li>
                  )}
                </ul>

                {/* Reply form */}
                <div
                  style={{
                    marginTop: 8,
                    display: "grid",
                    gridTemplateColumns: "140px 1fr auto",
                    gap: 4,
                    alignItems: "stretch",
                  }}
                >
                  <input
                    value={replyAuthor}
                    onChange={(e) => setReplyAuthor(e.target.value)}
                    placeholder="your /handle"
                    style={{
                      padding: "3px 6px",
                      fontFamily: FONT_UI,
                      fontSize: 11,
                      border: `1px solid ${BORDER}`,
                      background: "#fff",
                      color: INK,
                      borderRadius: 2,
                    }}
                  />
                  <input
                    value={replyBody}
                    onChange={(e) => setReplyBody(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") submit();
                    }}
                    placeholder="add a comment…"
                    style={{
                      padding: "3px 6px",
                      fontFamily: FONT_UI,
                      fontSize: 11,
                      border: `1px solid ${BORDER}`,
                      background: "#fff",
                      color: INK,
                      borderRadius: 2,
                    }}
                  />
                  <button
                    type="button"
                    onClick={submit}
                    style={{
                      padding: "3px 12px",
                      fontFamily: FONT_DISPLAY,
                      fontSize: 10,
                      fontWeight: 900,
                      letterSpacing: 1,
                      color: "#fff",
                      background: `linear-gradient(180deg, ${HEAD_BG} 0%, ${HEAD_BG_DEEP} 100%)`,
                      border: "1px solid #6a2900",
                      borderRadius: 2,
                      cursor: "pointer",
                      textTransform: "uppercase",
                      textShadow: "0 1px 0 rgba(0,0,0,0.3)",
                    }}
                  >
                    reply
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

// ── Rich data blocks (used by story expanded panels) ─────────────────

function PullQuote({ children }: { children: React.ReactNode }) {
  return (
    <blockquote
      style={{
        margin: "8px 0 0",
        padding: "8px 12px",
        background: "#fff",
        borderLeft: `3px solid ${HEAD_BG}`,
        fontFamily: FONT_DISPLAY,
        fontSize: 14,
        fontStyle: "italic",
        color: LINK,
        lineHeight: 1.4,
      }}
    >
      &ldquo;{children}&rdquo;
    </blockquote>
  );
}

function DataTable({ children }: { children: React.ReactNode }) {
  return (
    <table
      style={{
        width: "100%",
        marginTop: 8,
        borderCollapse: "collapse",
        fontSize: 12,
        background: "#fff",
        border: `1px solid ${BORDER}`,
      }}
    >
      <tbody>{children}</tbody>
    </table>
  );
}

function DRow({ k, children }: { k: string; children: React.ReactNode }) {
  return (
    <tr>
      <td
        style={{
          width: 84,
          padding: "3px 8px",
          fontSize: 10,
          letterSpacing: 1,
          color: HEAD_BG_DEEP,
          fontWeight: 700,
          textTransform: "uppercase",
          background: CARD_DIM,
          borderBottom: `1px solid ${BORDER}77`,
          verticalAlign: "top",
        }}
      >
        {k}
      </td>
      <td
        style={{
          padding: "3px 8px",
          color: INK,
          fontSize: 12,
          borderBottom: `1px solid ${BORDER}77`,
        }}
      >
        {children}
      </td>
    </tr>
  );
}

function SplitList({
  aLabel,
  aItems,
  aMarker,
  bLabel,
  bItems,
  bMarker,
}: {
  aLabel: string;
  aItems: string[];
  aMarker: string;
  bLabel: string;
  bItems: string[];
  bMarker: string;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 8,
        marginTop: 8,
      }}
    >
      <BulletPanel heading={aLabel} items={aItems} marker={aMarker} />
      <BulletPanel heading={bLabel} items={bItems} marker={bMarker} tone="warn" />
    </div>
  );
}

function BulletPanel({
  heading,
  items,
  marker,
  tone,
}: {
  heading: string;
  items: string[];
  marker: string;
  tone?: "warn";
}) {
  const accent = tone === "warn" ? VOTE_DN : VOTE_UP;
  return (
    <div
      style={{
        background: "#fff",
        border: `1px solid ${BORDER}`,
        borderTop: `3px solid ${accent}`,
        padding: "6px 10px",
      }}
    >
      <div
        style={{
          fontFamily: FONT_DISPLAY,
          fontSize: 10,
          letterSpacing: 2,
          color: accent,
          textTransform: "uppercase",
          fontWeight: 700,
          marginBottom: 4,
        }}
      >
        {heading}
      </div>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {items.map((it) => (
          <li
            key={it}
            style={{
              display: "flex",
              gap: 5,
              fontSize: 12,
              color: INK,
              marginBottom: 2,
            }}
          >
            <span style={{ color: accent }}>{marker}</span>
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function QuadGrid({
  says,
  thinks,
  does,
  feels,
}: {
  says: string;
  thinks: string[];
  does: string[];
  feels: string[];
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 6,
        marginTop: 8,
      }}
    >
      <Quad head="Says" tint={HEAD_BG}>
        <em>&ldquo;{says}&rdquo;</em>
      </Quad>
      <Quad head="Thinks" tint={LINK}>
        {thinks.map((t) => (
          <div key={t}>· {t}</div>
        ))}
      </Quad>
      <Quad head="Does" tint={VOTE_UP}>
        {does.join(" · ")}
      </Quad>
      <Quad head="Feels" tint={LINK_HOT}>
        {feels.map((f) => (
          <div key={f}>· {f}</div>
        ))}
      </Quad>
    </div>
  );
}

function Quad({
  head,
  tint,
  children,
}: {
  head: string;
  tint: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: "#fff",
        border: `1px solid ${BORDER}`,
        borderTop: `3px solid ${tint}`,
        padding: "6px 8px",
        fontSize: 12,
        color: INK,
        lineHeight: 1.5,
      }}
    >
      <div
        style={{
          fontFamily: FONT_DISPLAY,
          fontSize: 11,
          fontWeight: 900,
          color: tint,
          letterSpacing: 0.5,
          marginBottom: 3,
        }}
      >
        {head}
      </div>
      {children}
    </div>
  );
}

function Lifeline({
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
    <ol style={{ listStyle: "none", padding: 0, margin: "8px 0 0" }}>
      {nodes.map((n) => (
        <li
          key={n.year}
          style={{
            display: "grid",
            gridTemplateColumns: "62px 1fr",
            gap: 10,
            padding: "5px 8px",
            background: "#fff",
            border: `1px solid ${BORDER}`,
            borderLeft: `3px solid ${n.live ? HEAD_BG : VOTE_UP}`,
            marginBottom: 4,
          }}
        >
          <div
            style={{
              fontFamily: FONT_DISPLAY,
              fontSize: 18,
              fontWeight: 900,
              color: n.live ? HEAD_BG : INK,
              lineHeight: 1,
            }}
          >
            {n.year}
          </div>
          <div>
            <div
              style={{
                fontSize: 9,
                letterSpacing: 1.5,
                color: MUTED,
                textTransform: "uppercase",
                fontWeight: 700,
              }}
            >
              {n.phase}
              {n.live && (
                <span style={{ color: HEAD_BG, marginLeft: 6 }}>● live</span>
              )}
            </div>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 13, fontWeight: 700, color: INK }}>
              {n.position}
            </div>
            <div style={{ fontSize: 11, color: LINK, fontStyle: "italic" }}>
              @ {n.org}
            </div>
            <div style={{ fontSize: 11, color: INK_DIM, marginTop: 2, lineHeight: 1.4 }}>
              {n.detail}
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}

function NodeCard({
  node,
}: {
  node: {
    year: string;
    phase: string;
    position: string;
    org: string;
    detail: string;
    live?: boolean;
  };
}) {
  return (
    <div
      style={{
        marginTop: 8,
        padding: "8px 12px",
        background: "#fff",
        border: `1px solid ${BORDER}`,
        borderLeft: `4px solid ${HEAD_BG}`,
      }}
    >
      <div
        style={{
          fontSize: 9,
          letterSpacing: 2,
          color: HEAD_BG_DEEP,
          textTransform: "uppercase",
          fontWeight: 700,
        }}
      >
        {node.year} · {node.phase}
        {node.live && <span style={{ color: HEAD_BG, marginLeft: 6 }}>● live</span>}
      </div>
      <div style={{ fontFamily: FONT_DISPLAY, fontSize: 14, color: INK, fontWeight: 700, marginTop: 2 }}>
        {node.position}
      </div>
      <div style={{ fontSize: 11, color: LINK, fontStyle: "italic" }}>
        @ {node.org}
      </div>
      <p style={{ margin: "4px 0 0", fontSize: 12, color: INK, lineHeight: 1.5 }}>
        {node.detail}
      </p>
    </div>
  );
}

function MetricGrid({
  metrics,
}: {
  metrics: Array<{ id: string; icon: string; value: string; label: string; context?: string }>;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
        gap: 6,
        marginTop: 8,
      }}
    >
      {metrics.map((m) => (
        <div
          key={m.id}
          style={{
            padding: "6px 8px",
            background: "#fff",
            border: `1px solid ${BORDER}`,
            borderTop: `3px solid ${HEAD_BG}`,
          }}
        >
          <div style={{ fontSize: 13, color: HEAD_BG }}>{m.icon}</div>
          <div
            style={{
              fontFamily: FONT_DISPLAY,
              fontSize: 18,
              fontWeight: 900,
              color: HEAD_BG_DEEP,
              letterSpacing: -0.5,
              lineHeight: 1,
              margin: "2px 0",
            }}
          >
            {m.value}
          </div>
          <div
            style={{
              fontSize: 10,
              letterSpacing: 0.5,
              color: INK,
              textTransform: "uppercase",
              fontWeight: 700,
            }}
          >
            {m.label}
          </div>
          {m.context && (
            <div style={{ fontSize: 10, color: INK_DIM, fontStyle: "italic" }}>
              {m.context}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function WorkGrid({
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
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 6,
        marginTop: 8,
      }}
    >
      {projects.map((p, i) => {
        const tint = ["#ee7600", "#1d428a", "#5a9e1a", "#7a2580"][i % 4];
        return (
          <a
            key={p.id}
            href={`/case-studies#${p.id}`}
            style={{
              display: "block",
              padding: "6px 8px",
              background: "#fff",
              border: `1px solid ${BORDER}`,
              borderLeft: `3px solid ${tint}`,
              color: INK,
              textDecoration: "none",
            }}
          >
            <div
              style={{
                fontSize: 9,
                letterSpacing: 1.5,
                color: tint,
                textTransform: "uppercase",
                fontWeight: 700,
              }}
            >
              Plate {["I", "II", "III", "IV"][i]} · {p.category} · {p.duration}
            </div>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 13, color: INK, fontWeight: 700, marginTop: 1 }}>
              {p.title}
            </div>
            <p style={{ margin: 0, fontSize: 11, color: INK_DIM, lineHeight: 1.4 }}>
              {p.description}
            </p>
            <div style={{ fontFamily: FONT_MONO, fontSize: 9, color: tint, marginTop: 3 }}>
              ▸ {p.technologies.join(" · ")}
            </div>
          </a>
        );
      })}
    </div>
  );
}

function ChannelTable({
  channels,
}: {
  channels: Array<{ label: string; role: string; value: string; href: string }>;
}) {
  return (
    <table
      style={{
        width: "100%",
        marginTop: 8,
        borderCollapse: "collapse",
        fontSize: 12,
        background: "#fff",
        border: `1px solid ${BORDER}`,
      }}
    >
      <tbody>
        {channels.map((c) => (
          <tr key={c.label}>
            <td
              style={{
                width: 84,
                padding: "3px 8px",
                fontSize: 10,
                letterSpacing: 1,
                color: HEAD_BG_DEEP,
                fontWeight: 700,
                textTransform: "uppercase",
                background: CARD_DIM,
                borderBottom: `1px solid ${BORDER}77`,
              }}
            >
              {c.label}
            </td>
            <td
              style={{
                padding: "3px 8px",
                borderBottom: `1px solid ${BORDER}77`,
              }}
            >
              <a
                href={c.href}
                target={c.href.startsWith("http") ? "_blank" : undefined}
                rel={c.href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="digg-link"
              >
                {c.value}
              </a>
              <span style={{ marginLeft: 6, color: INK_DIM, fontStyle: "italic", fontSize: 10 }}>
                {c.role}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function MetricsRow({ items }: { items: string[] }) {
  return (
    <div
      style={{
        marginTop: 6,
        padding: "5px 9px",
        background: "#fff",
        border: `1px dashed ${VOTE_UP}66`,
        fontFamily: FONT_MONO,
        fontSize: 11,
        color: VOTE_UP,
      }}
    >
      success metrics ▸ {items.join(" · ")}
    </div>
  );
}

// ── Submit form ──────────────────────────────────────────────────────

function SubmitForm({
  title,
  setTitle,
  desc,
  setDesc,
  cat,
  setCat,
  author,
  setAuthor,
  canSubmit,
  onSubmit,
}: {
  title: string;
  setTitle: (v: string) => void;
  desc: string;
  setDesc: (v: string) => void;
  cat: Category;
  setCat: (c: Category) => void;
  author: string;
  setAuthor: (v: string) => void;
  canSubmit: boolean;
  onSubmit: () => void;
}) {
  return (
    <section
      style={{
        background: CARD,
        border: `1px solid ${BORDER}`,
        borderTop: `3px solid ${HEAD_BG}`,
        padding: "10px 12px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
        marginTop: 6,
      }}
    >
      <div
        style={{
          fontFamily: FONT_DISPLAY,
          fontSize: 13,
          fontWeight: 900,
          color: HEAD_BG_DEEP,
          letterSpacing: -0.3,
          marginBottom: 6,
        }}
      >
        ＋ Submit a New Story
      </div>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value.slice(0, 140))}
        placeholder="Headline (what's the story?)"
        style={{
          width: "100%",
          padding: "5px 8px",
          fontFamily: FONT_UI,
          fontSize: 13,
          color: INK,
          border: `1px solid ${BORDER}`,
          background: "#fff",
          borderRadius: 2,
          boxSizing: "border-box",
          marginBottom: 5,
        }}
      />
      <textarea
        value={desc}
        onChange={(e) => setDesc(e.target.value.slice(0, 280))}
        rows={2}
        placeholder="Why does this matter? (short description shown when readers expand)"
        style={{
          width: "100%",
          padding: "5px 8px",
          fontFamily: FONT_UI,
          fontSize: 12,
          color: INK,
          border: `1px solid ${BORDER}`,
          background: "#fff",
          borderRadius: 2,
          boxSizing: "border-box",
          marginBottom: 5,
          resize: "vertical",
        }}
      />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "auto 1fr auto auto",
          gap: 6,
          alignItems: "center",
        }}
      >
        <span style={{ fontSize: 10, color: INK_DIM }}>category:</span>
        <select
          value={cat}
          onChange={(e) => setCat(e.target.value as Category)}
          style={{
            padding: "3px 6px",
            fontFamily: FONT_UI,
            fontSize: 11,
            border: `1px solid ${BORDER}`,
            background: "#fff",
            color: INK,
            borderRadius: 2,
            justifySelf: "start",
          }}
        >
          {CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
        <input
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="/handle"
          style={{
            padding: "3px 6px",
            fontFamily: FONT_UI,
            fontSize: 11,
            border: `1px solid ${BORDER}`,
            background: "#fff",
            color: INK,
            borderRadius: 2,
            width: 110,
          }}
        />
        <button
          type="button"
          onClick={onSubmit}
          disabled={!canSubmit}
          style={{
            padding: "5px 14px",
            fontFamily: FONT_DISPLAY,
            fontSize: 11,
            fontWeight: 900,
            letterSpacing: 1,
            color: "#fff",
            background: canSubmit
              ? `linear-gradient(180deg, ${HEAD_BG} 0%, ${HEAD_BG_DEEP} 100%)`
              : `linear-gradient(180deg, #cccccc 0%, #999999 100%)`,
            border: `1px solid ${canSubmit ? "#6a2900" : "#666"}`,
            borderRadius: 2,
            cursor: canSubmit ? "pointer" : "not-allowed",
            textTransform: "uppercase",
            textShadow: "0 1px 0 rgba(0,0,0,0.3)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.4)",
          }}
        >
          submit story
        </button>
      </div>
      <div style={{ marginTop: 5, fontSize: 10, color: MUTED }}>
        your story joins the list immediately. it starts at 1 dig. persists this session.
      </div>
    </section>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────

function Chip({
  label,
  onClear,
}: {
  label: string;
  onClear: () => void;
}) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "1px 4px 1px 8px",
        background: "#fff",
        border: `1px solid ${HEAD_BG}88`,
        borderRadius: 999,
        fontSize: 10,
        color: HEAD_BG_DEEP,
        fontWeight: 700,
      }}
    >
      {label}
      <button
        type="button"
        onClick={onClear}
        title="Remove filter"
        style={{
          width: 14,
          height: 14,
          background: HEAD_BG,
          color: "#fff",
          border: "none",
          borderRadius: "50%",
          fontSize: 10,
          fontWeight: 900,
          lineHeight: 1,
          cursor: "pointer",
          padding: 0,
        }}
      >
        ×
      </button>
    </span>
  );
}

function FooterLink({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        background: "transparent",
        border: "none",
        color: LINK,
        cursor: "pointer",
        padding: 0,
        fontFamily: FONT_UI,
        fontSize: 10,
        textDecoration: "underline",
      }}
    >
      {children}
    </button>
  );
}

function GelBtn({
  children,
  primary,
  onClick,
}: {
  children: React.ReactNode;
  primary?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "3px 10px",
        fontFamily: FONT_UI,
        fontSize: 11,
        fontWeight: 700,
        color: primary ? HEAD_BG_DEEP : INK,
        background: primary
          ? `linear-gradient(180deg, #fff8e8 0%, #ffe0b8 100%)`
          : `linear-gradient(180deg, #ffffff 0%, #f0f0e0 100%)`,
        border: "1px solid #6a2900",
        borderRadius: 3,
        cursor: "pointer",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.7), 0 1px 1px rgba(0,0,0,0.2)",
      }}
    >
      {children}
    </button>
  );
}

function CatPill({
  children,
  active,
  tint,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  tint: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "2px 8px",
        fontFamily: FONT_UI,
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: 0.5,
        color: active ? "#fff" : tint,
        background: active ? tint : "#fff",
        border: `1px solid ${tint}88`,
        borderRadius: 999,
        cursor: "pointer",
        boxShadow: active ? "inset 0 1px 0 rgba(255,255,255,0.3)" : "0 1px 1px rgba(0,0,0,0.1)",
        textShadow: active ? "0 1px 0 rgba(0,0,0,0.3)" : "none",
      }}
    >
      {children}
    </button>
  );
}

function SideCard({
  heading,
  foot,
  children,
}: {
  heading: string;
  foot?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      style={{
        background: CARD,
        border: `1px solid ${BORDER}`,
        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "4px 10px",
          background: `linear-gradient(180deg, ${HEAD_BG} 0%, ${HEAD_BG_DEEP} 100%)`,
          color: "#fff",
          fontFamily: FONT_DISPLAY,
          fontSize: 11,
          fontWeight: 900,
          letterSpacing: 0.5,
          textTransform: "uppercase",
          textShadow: "0 1px 0 rgba(0,0,0,0.3)",
        }}
      >
        {heading}
      </div>
      <div style={{ padding: "6px 8px" }}>{children}</div>
      {foot && (
        <div
          style={{
            padding: "3px 10px",
            fontSize: 10,
            color: MUTED,
            fontStyle: "italic",
            borderTop: `1px dotted ${BORDER}`,
            background: CARD_DIM,
          }}
        >
          {foot}
        </div>
      )}
    </section>
  );
}

function SideRow({
  k,
  children,
}: {
  k: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "60px 1fr",
        gap: 4,
        padding: "2px 0",
        fontSize: 11,
        borderBottom: `1px dotted ${BORDER}88`,
      }}
    >
      <span style={{ color: MUTED, letterSpacing: 0.3 }}>{k}</span>
      <span style={{ color: INK }}>{children}</span>
    </div>
  );
}

export default MicroblogHomePage;
