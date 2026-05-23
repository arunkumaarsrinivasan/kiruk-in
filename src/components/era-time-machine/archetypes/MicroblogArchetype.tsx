"use client";

/**
 * MicroblogArchetype — 2006 era preview inside <EraTimeMachine>.
 *
 * Matches landing: kiruk.digg — Digg-style link aggregator. Orange
 * header w/ logo + search, sort tabs (Hot/Top/New), 3 story rows with
 * vote arrows and inline score, one row expanded to show a tiny
 * comment thread, sidebar with Top stories + era nav buttons.
 */

import React, { useMemo, useState } from "react";
import type { EraSurfaceProps } from "../shared/EraSurface";

// Palette mirror
const PAGE_BG = "#f6f6ef";
const HEAD_BG = "#ee7600";
const HEAD_BG_DEEP = "#cc5500";
const NAV_BAR = "#fdf0d5";
const CARD = "#ffffff";
const CARD_DIM = "#fafaf3";
const INK = "#1a1a1a";
const INK_DIM = "#555555";
const MUTED = "#888888";
const LINK = "#1d428a";
const BORDER = "#d8d8c8";
const VOTE_UP = "#5a9e1a";
const VOTE_UP_BG = "#e8f3d8";
const VOTE_DN = "#a93a1a";
const VOTE_DN_BG = "#f6dcd2";

const FONT_UI = "'Verdana', 'Geneva', 'Arial', sans-serif";
const FONT_DISPLAY = "'Verdana', 'Arial Black', sans-serif";

export const MicroblogArchetype: React.FC<EraSurfaceProps> = ({
  era,
  prevEra,
  nextEra,
  index,
  total,
  onPrev,
  onNext,
  onCustomize,
  onClose,
}) => {
  const [sort, setSort] = useState<"hot" | "top" | "new">("hot");
  const [openIdx, setOpenIdx] = useState<number>(0);
  const [votes, setVotes] = useState<Record<number, 1 | -1 | undefined>>({});

  const baseStories = useMemo(
    () => [
      {
        title: `${era.lesson}`,
        desc: era.description,
        cat: "Heritage",
        catTint: HEAD_BG,
        diggs: 412,
        when: "3h ago",
        seed: [
          { author: "donnorman", body: "Running the artifact inward is correct." },
          { author: "worrydream", body: "A portfolio should think back at you." },
        ],
      },
      {
        title: `${era.style.toUpperCase()} — palette + tokens, all in one disc.`,
        desc: `Colors ${era.colors.primary} / ${era.colors.secondary} / ${era.colors.accent}. Tokens radius ${era.designTokens.borderRadius}px, motion ${era.designTokens.animationStyle}.`,
        cat: "Tokens",
        catTint: "#5a9e1a",
        diggs: 318,
        when: "8h ago",
        seed: [
          { author: "figma", body: "Tight palette. Frame-first thinking." },
        ],
      },
      {
        title: `Key parts of era ${era.id}: ${era.keyElements.slice(0, 3).join(", ")}…`,
        desc: era.keyElements.join(" · "),
        cat: "Parts",
        catTint: "#1d428a",
        diggs: 196,
        when: "16h ago",
        seed: [],
      },
    ],
    [era],
  );

  const score = (i: number) => baseStories[i].diggs + (votes[i] === 1 ? 1 : votes[i] === -1 ? -1 : 0);
  const ranked = useMemo(() => {
    const idx = baseStories.map((_, i) => i);
    if (sort === "top") idx.sort((a, b) => score(b) - score(a));
    else if (sort === "new") idx.sort((a, b) => b - a);
    return idx;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort, votes, baseStories]);

  const dig = (i: number) =>
    setVotes((v) => ({ ...v, [i]: v[i] === 1 ? undefined : 1 }));
  const bury = (i: number) =>
    setVotes((v) => ({ ...v, [i]: v[i] === -1 ? undefined : -1 }));

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{ backgroundColor: PAGE_BG, color: INK, fontFamily: FONT_UI }}
    >
      <style jsx global>{`
        @keyframes kiruk-2006pv-pop {
          0% { transform: scale(1); }
          40% { transform: scale(1.4); }
          100% { transform: scale(1); }
        }
      `}</style>
      <div style={{ position: "absolute", inset: 0, overflowY: "auto" }}>
        {/* Header */}
        <header
          style={{
            background: `linear-gradient(180deg, ${HEAD_BG} 0%, ${HEAD_BG_DEEP} 100%)`,
            color: "#fff",
            padding: "6px 14px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            borderBottom: "2px solid #8a3a00",
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontFamily: FONT_DISPLAY,
              fontSize: 22,
              fontWeight: 900,
              letterSpacing: -1.5,
              textShadow: "0 1px 0 rgba(0,0,0,0.35)",
            }}
          >
            digg
          </span>
          <span
            style={{
              fontSize: 10,
              color: "#fff8e8",
              fontStyle: "italic",
              letterSpacing: 0.5,
              borderLeft: "1px solid rgba(255,255,255,0.4)",
              paddingLeft: 6,
            }}
          >
            era {era.id} · disc {index + 1}/{total}
          </span>
          <span style={{ marginLeft: "auto", display: "flex", gap: 5 }}>
            <NavBtn onClick={onPrev} disabled={!prevEra}>◂ Prev</NavBtn>
            <NavBtn onClick={onCustomize}>⚙ Customize</NavBtn>
            <NavBtn onClick={onClose} primary>▶ Use Era</NavBtn>
            <NavBtn onClick={onNext} disabled={!nextEra}>Next ▸</NavBtn>
          </span>
        </header>

        {/* Cat bar */}
        <nav
          style={{
            background: NAV_BAR,
            borderBottom: `1px solid ${BORDER}`,
            padding: "4px 14px",
            fontSize: 10,
            color: INK_DIM,
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          <strong style={{ color: INK }}>Categories:</strong>
          {["all", "ux research", "career", "tools", "process"].map((c) => (
            <span
              key={c}
              style={{
                padding: "1px 6px",
                fontSize: 10,
                color: c === "all" ? "#fff" : HEAD_BG,
                background: c === "all" ? HEAD_BG : "#fff",
                border: `1px solid ${HEAD_BG}88`,
                borderRadius: 999,
                fontWeight: 700,
              }}
            >
              {c}
            </span>
          ))}
        </nav>

        <div
          style={{
            maxWidth: 760,
            margin: "10px auto 0",
            padding: "0 14px",
            display: "grid",
            gridTemplateColumns: "1fr 200px",
            gap: 10,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {/* Sort tabs */}
            <div
              style={{
                display: "flex",
                borderBottom: `2px solid ${HEAD_BG}`,
                gap: 0,
              }}
            >
              {(["hot", "top", "new"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setSort(m)}
                  style={{
                    padding: "3px 12px",
                    fontFamily: FONT_DISPLAY,
                    fontSize: 10,
                    fontWeight: 900,
                    letterSpacing: 1,
                    textTransform: "uppercase",
                    color: sort === m ? "#fff" : INK_DIM,
                    background:
                      sort === m
                        ? `linear-gradient(180deg, ${HEAD_BG} 0%, ${HEAD_BG_DEEP} 100%)`
                        : CARD,
                    border: `1px solid ${BORDER}`,
                    borderBottom: sort === m ? "none" : `1px solid ${BORDER}`,
                    borderTopLeftRadius: 2,
                    borderTopRightRadius: 2,
                    cursor: "pointer",
                    marginRight: 2,
                    textShadow: sort === m ? "0 1px 0 rgba(0,0,0,0.3)" : "none",
                  }}
                >
                  {m === "hot" ? "🔥 hot" : m === "top" ? "★ top" : "📌 new"}
                </button>
              ))}
            </div>

            {/* Stories */}
            <ol style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {ranked.map((i, pos) => {
                const s = baseStories[i];
                const myVote = votes[i];
                return (
                  <li key={i}>
                    <article
                      style={{
                        background: CARD,
                        border: `1px solid ${BORDER}`,
                        borderLeft: `3px solid ${s.catTint}`,
                        marginBottom: 6,
                        boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
                      }}
                    >
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "50px 1fr",
                          gap: 8,
                          padding: "8px 10px",
                        }}
                      >
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
                            onClick={() => dig(i)}
                            style={voteBtn(
                              myVote === 1,
                              VOTE_UP,
                              VOTE_UP_BG,
                              "▲ dig",
                            )}
                          >
                            ▲
                          </button>
                          <div
                            style={{
                              fontFamily: FONT_DISPLAY,
                              fontSize: 16,
                              fontWeight: 900,
                              color: score(i) < 0 ? VOTE_DN : INK,
                              letterSpacing: -0.5,
                              lineHeight: 1,
                              padding: "1px 0",
                            }}
                          >
                            {score(i)}
                          </div>
                          <button
                            type="button"
                            onClick={() => bury(i)}
                            style={voteBtn(myVote === -1, VOTE_DN, VOTE_DN_BG, "▼ bury")}
                          >
                            ▼
                          </button>
                        </div>
                        <div>
                          <button
                            type="button"
                            onClick={() => setOpenIdx(openIdx === i ? -1 : i)}
                            style={{
                              background: "transparent",
                              border: "none",
                              padding: 0,
                              textAlign: "left",
                              cursor: "pointer",
                              color: LINK,
                              fontFamily: FONT_DISPLAY,
                              fontSize: 13,
                              fontWeight: 700,
                              lineHeight: 1.3,
                            }}
                          >
                            <span style={{ color: MUTED, marginRight: 4, fontWeight: 900 }}>
                              {pos + 1}.
                            </span>
                            {s.title}
                          </button>
                          <div
                            style={{
                              fontSize: 9,
                              color: MUTED,
                              marginTop: 3,
                              display: "flex",
                              gap: 6,
                              flexWrap: "wrap",
                              alignItems: "center",
                            }}
                          >
                            <span
                              style={{
                                padding: "0 5px",
                                fontSize: 9,
                                color: "#fff",
                                background: s.catTint,
                                borderRadius: 2,
                                fontWeight: 700,
                                letterSpacing: 0.5,
                                textShadow: "0 1px 0 rgba(0,0,0,0.3)",
                              }}
                            >
                              {s.cat}
                            </span>
                            <span>by /kiruk · {s.when}</span>
                            <span style={{ color: BORDER }}>·</span>
                            <span style={{ color: LINK }}>
                              💬 {s.seed.length} comment{s.seed.length === 1 ? "" : "s"}
                            </span>
                          </div>

                          {/* Expanded */}
                          {openIdx === i && (
                            <div
                              style={{
                                marginTop: 6,
                                padding: "6px 10px",
                                background: CARD_DIM,
                                border: `1px solid ${BORDER}`,
                                fontSize: 11,
                                color: INK,
                                lineHeight: 1.5,
                              }}
                            >
                              <p style={{ margin: 0 }}>{s.desc}</p>
                              {s.seed.length > 0 && (
                                <div
                                  style={{
                                    marginTop: 6,
                                    paddingTop: 5,
                                    borderTop: `1px dashed ${BORDER}`,
                                  }}
                                >
                                  <div
                                    style={{
                                      fontFamily: FONT_DISPLAY,
                                      fontSize: 9,
                                      letterSpacing: 1.5,
                                      color: HEAD_BG,
                                      textTransform: "uppercase",
                                      fontWeight: 900,
                                      marginBottom: 3,
                                    }}
                                  >
                                    {s.seed.length} comment{s.seed.length === 1 ? "" : "s"}
                                  </div>
                                  <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                                    {s.seed.map((c, j) => (
                                      <li
                                        key={j}
                                        style={{
                                          display: "grid",
                                          gridTemplateColumns: "70px 1fr",
                                          gap: 6,
                                          padding: "2px 0",
                                          borderBottom: `1px dotted ${BORDER}`,
                                          fontSize: 10,
                                        }}
                                      >
                                        <span style={{ color: LINK, fontWeight: 700 }}>
                                          /{c.author}
                                        </span>
                                        <span>{c.body}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </article>
                  </li>
                );
              })}
            </ol>
          </div>

          {/* Sidebar */}
          <aside style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <SideCard heading="At-A-Glance">
              <SideRow k="era">{era.era}</SideRow>
              <SideRow k="style">{era.style}</SideRow>
              <SideRow k="year">{era.id}</SideRow>
              <SideRow k="palette">
                {[era.colors.primary, era.colors.secondary, era.colors.accent]
                  .map((c) => c.toUpperCase())
                  .join(" · ")}
              </SideRow>
            </SideCard>
            <SideCard heading="Top 3 · last 24h" foot="ranked by dig count">
              <ol style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {baseStories.map((_, i) => i)
                  .sort((a, b) => score(b) - score(a))
                  .map((i, k) => (
                    <li
                      key={i}
                      style={{
                        padding: "3px 0",
                        borderBottom: `1px dotted ${BORDER}`,
                        fontSize: 10,
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
                        {k + 1}.
                      </span>
                      <span style={{ color: LINK, textDecoration: "underline" }}>
                        {baseStories[i].title.slice(0, 46)}…
                      </span>
                      <div style={{ fontSize: 9, color: MUTED, marginTop: 1 }}>
                        <span style={{ color: VOTE_UP, fontWeight: 700 }}>
                          ▲ {score(i)}
                        </span>
                      </div>
                    </li>
                  ))}
              </ol>
            </SideCard>
          </aside>
        </div>

        <div
          style={{
            marginTop: 12,
            padding: "5px 14px",
            fontSize: 9,
            color: INK_DIM,
            textAlign: "center",
            letterSpacing: 0.5,
          }}
        >
          © 2006 digg · powered by the wisdom of the crowd
        </div>
      </div>
    </div>
  );
};

function voteBtn(active: boolean, c: string, bg: string, _label: string): React.CSSProperties {
  return {
    width: 44,
    padding: "2px 0",
    fontFamily: FONT_DISPLAY,
    fontSize: 10,
    fontWeight: 900,
    letterSpacing: 0.5,
    color: active ? "#fff" : c,
    background: active ? `linear-gradient(180deg, ${c} 0%, ${darken(c)} 100%)` : bg,
    border: `1px solid ${c}88`,
    borderRadius: 2,
    cursor: "pointer",
    textShadow: active ? "0 1px 0 rgba(0,0,0,0.3)" : "none",
  };
}

function NavBtn({
  children,
  onClick,
  disabled,
  primary,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  primary?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      style={{
        padding: "2px 8px",
        fontFamily: FONT_UI,
        fontSize: 10,
        fontWeight: 700,
        color: primary ? HEAD_BG_DEEP : "#fff",
        background: primary
          ? `linear-gradient(180deg, #fff8e8 0%, #ffe0b8 100%)`
          : "rgba(255,255,255,0.18)",
        border: `1px solid ${primary ? "#6a2900" : "rgba(255,255,255,0.45)"}`,
        borderRadius: 2,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.4 : 1,
        letterSpacing: 0.4,
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
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "3px 8px",
          background: `linear-gradient(180deg, ${HEAD_BG} 0%, ${HEAD_BG_DEEP} 100%)`,
          color: "#fff",
          fontFamily: FONT_DISPLAY,
          fontSize: 10,
          fontWeight: 900,
          letterSpacing: 1,
          textTransform: "uppercase",
          textShadow: "0 1px 0 rgba(0,0,0,0.3)",
        }}
      >
        {heading}
      </div>
      <div style={{ padding: "5px 8px" }}>{children}</div>
      {foot && (
        <div
          style={{
            padding: "2px 8px",
            background: CARD_DIM,
            borderTop: `1px dotted ${BORDER}`,
            fontSize: 9,
            color: MUTED,
            fontStyle: "italic",
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
        gridTemplateColumns: "52px 1fr",
        gap: 4,
        padding: "2px 0",
        fontSize: 10,
        borderBottom: `1px dotted ${BORDER}88`,
      }}
    >
      <span style={{ color: MUTED }}>{k}</span>
      <span style={{ color: INK }}>{children}</span>
    </div>
  );
}

function darken(hex: string): string {
  if (!hex.startsWith("#") || hex.length !== 7) return hex;
  const r = Math.max(0, parseInt(hex.slice(1, 3), 16) - 50);
  const g = Math.max(0, parseInt(hex.slice(3, 5), 16) - 50);
  const b = Math.max(0, parseInt(hex.slice(5, 7), 16) - 50);
  return `rgb(${r}, ${g}, ${b})`;
}

export default MicroblogArchetype;
