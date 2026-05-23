"use client";

/**
 * IssueTrackerArchetype — 2021 era preview inside <EraTimeMachine>.
 *
 * Matches landing: Linear sprint board. Dark indigo theme, mini cycle
 * bar, 4 columns w/ era-data issues, cmd-K palette pill, era-nav
 * buttons in top chrome.
 */

import React, { useMemo, useState } from "react";
import type { EraSurfaceProps } from "../shared/EraSurface";
import { hideArchetypeTransport } from "../shared/eraChrome";

const BG = "#08090a";
const SURF = "#16171a";
const SURF_2 = "#1d1e21";
const SURF_3 = "#26272c";
const INK = "#f7f7f8";
const INK_DIM = "#9095a0";
const HAIRLINE = "#25262c";
const ACC = "#5e6ad2";
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

type Status = "backlog" | "todo" | "progress" | "done";

const STATUS: Record<Status, { label: string; color: string; icon: string }> = {
  backlog:  { label: "Backlog",     color: GRAY,   icon: "○" },
  todo:     { label: "Todo",        color: BLUE,   icon: "◔" },
  progress: { label: "In Progress", color: ORANGE, icon: "◑" },
  done:     { label: "Done",        color: GREEN,  icon: "●" },
};

export const IssueTrackerArchetype: React.FC<EraSurfaceProps> = ({
  era,
  prevEra,
  nextEra,
  index,
  total,
  onPrev,
  onNext,
  onClose,
  embedMode,
}) => {
  const hideTransport = hideArchetypeTransport({ embedMode });
  const issues = useMemo<
    Array<{
      id: string;
      title: string;
      status: Status;
      priority: string;
      pColor: string;
      labels: string[];
    }>
  >(
    () => [
      { id: "ERA-1", title: era.lesson, status: "done",     priority: "▰▰▰", pColor: RED,    labels: [era.style, "lesson"] },
      { id: "ERA-2", title: era.description.slice(0, 60) + "…", status: "done", priority: "▰▰▱", pColor: ORANGE, labels: ["overview"] },
      { id: "ERA-3", title: `Apply ${era.colors.primary} as primary surface`, status: "progress", priority: "▰▱▱", pColor: YELLOW, labels: ["palette"] },
      { id: "ERA-4", title: `Wire ${era.fonts.primary.split(",")[0].replaceAll('"', "")} display face`, status: "progress", priority: "▰▱▱", pColor: YELLOW, labels: ["type"] },
      { id: "ERA-5", title: `Set radius ${era.designTokens.borderRadius}px + motion ${era.designTokens.animationStyle}`, status: "todo", priority: "▱▱▱", pColor: BLUE, labels: ["tokens"] },
      { id: "ERA-6", title: `Render ${era.keyElements.length} key parts inline`, status: "todo", priority: "▱▱▱", pColor: BLUE, labels: ["parts"] },
      { id: "ERA-7", title: "Heritage paragraph", status: "backlog", priority: "—", pColor: GRAY, labels: ["heritage"] },
    ],
    [era],
  );

  const [selectedId, setSelectedId] = useState<string>("ERA-1");
  const selected = issues.find((i) => i.id === selectedId) ?? issues[0];
  const [cmdOpen, setCmdOpen] = useState(false);

  const done = issues.filter((i) => i.status === "done").length;
  const pct = Math.round((done / issues.length) * 100);

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{
        background: BG,
        color: INK,
        fontFamily: FONT_UI,
      }}
    >
      <style jsx global>{`
        @keyframes kiruk-2021pv-modal {
          0% { opacity: 0; transform: scale(0.96); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>

      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column" }}>
        {/* Top chrome */}
        <header
          style={{
            background: BG,
            borderBottom: `1px solid ${HAIRLINE}`,
            padding: "6px 12px",
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 11,
          }}
        >
          <div
            aria-hidden
            style={{
              width: 18,
              height: 18,
              borderRadius: 4,
              background: `linear-gradient(135deg, ${ACC} 0%, ${MAGENTA} 100%)`,
            }}
          />
          <span style={{ fontSize: 12, fontWeight: 600 }}>KIRUK</span>
          <span style={{ color: INK_DIM }}>· era {era.id} cycle</span>
          <span style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
            <button
              type="button"
              onClick={() => setCmdOpen(true)}
              style={{
                padding: "2px 8px",
                background: SURF,
                color: INK_DIM,
                border: `1px solid ${HAIRLINE}`,
                borderRadius: 4,
                fontFamily: FONT_UI,
                fontSize: 10,
                cursor: "pointer",
              }}
            >
              ⌘K
            </button>
            {!hideTransport && (
              <>
                <NavBtn onClick={onPrev} disabled={!prevEra}>◂</NavBtn>
                <NavBtn onClick={onClose} primary>▶ Use</NavBtn>
                <NavBtn onClick={onNext} disabled={!nextEra}>▸</NavBtn>
              </>
            )}
          </span>
        </header>

        {/* Cycle bar */}
        <div
          style={{
            padding: "5px 12px",
            background: SURF,
            borderBottom: `1px solid ${HAIRLINE}`,
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 10,
            color: INK_DIM,
            flexWrap: "wrap",
          }}
        >
          <span style={{ color: INK, fontWeight: 500 }}>Cycle 14</span>
          <div
            style={{
              flex: 1,
              minWidth: 100,
              height: 5,
              background: SURF_3,
              borderRadius: 3,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${pct}%`,
                height: "100%",
                background: `linear-gradient(90deg, ${ACC} 0%, ${MAGENTA} 100%)`,
                borderRadius: 3,
              }}
            />
          </div>
          <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: INK }}>
            {done}/{issues.length} · {pct}%
          </span>
        </div>

        {/* Body grid: board + rail */}
        <div
          style={{
            flex: 1,
            display: "grid",
            gridTemplateColumns: "1fr 220px",
            minHeight: 0,
            overflow: "hidden",
          }}
        >
          {/* Board */}
          <section
            style={{
              padding: 8,
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 6,
              overflowX: "auto",
              minHeight: 0,
            }}
          >
            {(Object.keys(STATUS) as Status[]).map((s) => {
              const meta = STATUS[s];
              const list = issues.filter((i) => i.status === s);
              return (
                <div
                  key={s}
                  style={{
                    background: SURF,
                    border: `1px solid ${HAIRLINE}`,
                    borderRadius: 6,
                    padding: 5,
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      padding: "2px 4px",
                      fontSize: 10,
                    }}
                  >
                    <span style={{ color: meta.color, fontSize: 12 }}>{meta.icon}</span>
                    <span style={{ fontWeight: 500 }}>{meta.label}</span>
                    <span style={{ marginLeft: "auto", color: INK_DIM, fontFamily: FONT_MONO }}>
                      {list.length}
                    </span>
                  </div>
                  {list.map((i) => (
                    <div
                      key={i.id}
                      onClick={() => setSelectedId(i.id)}
                      style={{
                        padding: 5,
                        background: SURF_2,
                        border: `1px solid ${selectedId === i.id ? ACC : HAIRLINE}`,
                        borderRadius: 4,
                        cursor: "pointer",
                        boxShadow: selectedId === i.id ? `0 0 0 1px ${ACC}33` : "none",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 3, marginBottom: 2 }}>
                        <span style={{ color: i.pColor, fontSize: 8, fontFamily: FONT_MONO, letterSpacing: -0.5 }}>
                          {i.priority}
                        </span>
                        <span style={{ fontFamily: FONT_MONO, fontSize: 8, color: INK_DIM }}>
                          {i.id}
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: 10,
                          color: INK,
                          fontWeight: 500,
                          lineHeight: 1.3,
                        }}
                      >
                        {i.title.length > 50 ? i.title.slice(0, 50) + "…" : i.title}
                      </div>
                      <div style={{ display: "flex", gap: 2, marginTop: 3, flexWrap: "wrap" }}>
                        {i.labels.slice(0, 2).map((l) => (
                          <span
                            key={l}
                            style={{
                              fontSize: 8,
                              padding: "0 4px",
                              background: SURF_3,
                              color: INK_DIM,
                              borderRadius: 2,
                            }}
                          >
                            {l}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </section>

          {/* Right rail */}
          <aside
            style={{
              background: SURF,
              borderLeft: `1px solid ${HAIRLINE}`,
              padding: 8,
              overflowY: "auto",
              fontSize: 11,
            }}
          >
            <div style={{ fontFamily: FONT_MONO, fontSize: 10, color: INK_DIM }}>
              {selected.id}
            </div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: INK,
                lineHeight: 1.3,
                margin: "2px 0 6px",
              }}
            >
              {selected.title}
            </div>
            <PRow k="Status">
              <span style={{ color: STATUS[selected.status].color, fontSize: 10 }}>
                {STATUS[selected.status].icon} {STATUS[selected.status].label}
              </span>
            </PRow>
            <PRow k="Priority">
              <span style={{ color: selected.pColor, fontFamily: FONT_MONO, fontSize: 9 }}>
                {selected.priority}
              </span>
            </PRow>
            <PRow k="Labels">
              <span style={{ fontSize: 10, color: INK_DIM }}>{selected.labels.join(", ")}</span>
            </PRow>
            <PRow k="Era">
              <span style={{ fontSize: 10, color: MAGENTA }}>{era.style}</span>
            </PRow>
            <PRow k="Disc">
              <span style={{ fontFamily: FONT_MONO, fontSize: 10 }}>{index + 1}/{total}</span>
            </PRow>

            <div
              style={{
                marginTop: 8,
                paddingTop: 6,
                borderTop: `1px solid ${HAIRLINE}`,
                fontSize: 9,
                color: INK_DIM,
                lineHeight: 1.5,
              }}
            >
              <div
                style={{
                  fontSize: 9,
                  letterSpacing: 1,
                  textTransform: "uppercase",
                  fontWeight: 600,
                  marginBottom: 3,
                }}
              >
                Keyboard
              </div>
              <Kbd>J K</Kbd> nav · <Kbd>↵</Kbd> open
              <br />
              <Kbd>⌘K</Kbd> palette · <Kbd>C</Kbd> new
            </div>
          </aside>
        </div>

        <div
          style={{
            padding: "3px 12px",
            borderTop: `1px solid ${HAIRLINE}`,
            background: SURF,
            fontFamily: FONT_MONO,
            fontSize: 9,
            color: INK_DIM,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <span>J K nav · ⌘K command · C new</span>
          <span style={{ color: ACC }}>2021 · sprint</span>
        </div>
      </div>

      {/* Command palette mini */}
      {cmdOpen && (
        <div
          onClick={() => setCmdOpen(false)}
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(6px)",
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-start",
            paddingTop: 50,
            zIndex: 10,
            animation: "kiruk-2021pv-modal 180ms ease-out",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: SURF,
              border: `1px solid ${HAIRLINE}`,
              borderRadius: 6,
              width: "min(320px, 90%)",
              boxShadow: "0 18px 40px rgba(0,0,0,0.6)",
            }}
          >
            <input
              autoFocus
              placeholder="Search issue, command…"
              style={{
                width: "100%",
                padding: "8px 12px",
                background: SURF,
                color: INK,
                border: "none",
                borderBottom: `1px solid ${HAIRLINE}`,
                fontFamily: FONT_UI,
                fontSize: 12,
                outline: "none",
                boxSizing: "border-box",
              }}
            />
            <div style={{ padding: 4, maxHeight: 200, overflowY: "auto" }}>
              {issues.map((i) => (
                <button
                  key={i.id}
                  type="button"
                  onClick={() => {
                    setSelectedId(i.id);
                    setCmdOpen(false);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    width: "100%",
                    padding: "4px 8px",
                    background: "transparent",
                    color: INK,
                    border: "none",
                    fontFamily: FONT_UI,
                    fontSize: 11,
                    cursor: "pointer",
                    textAlign: "left",
                    borderRadius: 3,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = SURF_2)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <span style={{ color: STATUS[i.status].color, fontSize: 11 }}>
                    {STATUS[i.status].icon}
                  </span>
                  <span style={{ fontFamily: FONT_MONO, fontSize: 9, color: INK_DIM }}>
                    {i.id}
                  </span>
                  <span style={{ flex: 1, fontSize: 11 }}>
                    {i.title.length > 36 ? i.title.slice(0, 36) + "…" : i.title}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function PRow({ k, children }: { k: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "60px 1fr",
        gap: 4,
        padding: "2px 0",
        fontSize: 10,
        alignItems: "center",
      }}
    >
      <span style={{ color: INK_DIM, fontSize: 9 }}>{k}</span>
      {children}
    </div>
  );
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
        fontWeight: 500,
        color: primary ? "#fff" : INK,
        background: primary ? ACC : SURF,
        border: `1px solid ${primary ? ACC : HAIRLINE}`,
        borderRadius: 4,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.4 : 1,
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
        fontSize: 8,
        color: INK_DIM,
        background: SURF_3,
        padding: "1px 4px",
        borderRadius: 2,
        border: `1px solid ${HAIRLINE}`,
        margin: "0 1px",
      }}
    >
      {children}
    </kbd>
  );
}

export default IssueTrackerArchetype;
