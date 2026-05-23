"use client";

/**
 * DocHtmlArchetype — 1991 era preview inside <EraTimeMachine>.
 *
 * Single-column academic web document: Times New Roman on white, blue
 * underlined links, <hr> rules, definition lists for palette + tokens,
 * <table> for typography, <ul> for elements + effects, blockquote for
 * lesson. Transport is rendered as a navigation paragraph of inline
 * blue links — true to the era, where navigation was prose, not chrome.
 */

import React, { useMemo, useState } from "react";
import type { EraSurfaceProps } from "../shared/EraSurface";
import { hideArchetypeTransport } from "../shared/eraChrome";

const TEXT = "#000000";
const MUTED = "#444444";
const SOFT = "#777777";
const BG = "#ffffff";
const LINK = "#0000ee";
const VISITED = "#551a8b";

const FONT_SERIF =
  "'Times New Roman', 'Iowan Old Style', Georgia, serif";
const FONT_MONO = "'Courier New', 'Courier', monospace";

export const DocHtmlArchetype: React.FC<EraSurfaceProps> = ({
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
  const [hoverUrl, setHoverUrl] = useState("");
  const [visited, setVisited] = useState<Set<string>>(new Set());

  const visit = (k: string) =>
    setVisited((s) => {
      const n = new Set(s);
      n.add(k);
      return n;
    });

  const tokenRows = useMemo(() => {
    const t = era.designTokens;
    return [
      ["radius", `${t.borderRadius}px`],
      ["shadow", `${t.shadowStyle} @ ${t.shadowIntensity}`],
      ["grid", t.gridSize ? `${t.gridSize}px` : "—"],
      ["tracking", String(t.letterSpacing)],
      ["leading", String(t.lineHeight)],
      ["motion", t.animationStyle],
    ] as const;
  }, [era]);

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{
        backgroundColor: BG,
        color: TEXT,
        fontFamily: FONT_SERIF,
      }}
    >
      <div className="absolute inset-0 overflow-y-auto" style={{ paddingBottom: 36 }}>
        <article
          style={{
            maxWidth: 720,
            margin: "0 auto",
            padding: "32px 24px 80px",
            fontSize: 16,
            lineHeight: 1.6,
          }}
        >
          {/* Document header */}
          <p
            style={{
              fontFamily: FONT_MONO,
              fontSize: 11,
              color: SOFT,
              margin: 0,
              letterSpacing: 0.5,
            }}
          >
            kiruk-research.cern.ch / ERA-{era.id}.html
          </p>
          <h1
            style={{
              fontSize: "clamp(28px, 4.6vw, 44px)",
              fontWeight: 700,
              margin: "8px 0 4px",
              lineHeight: 1.1,
            }}
          >
            Era {era.id}: {era.name.split(":")[1]?.trim() || era.name}.
          </h1>
          <p
            style={{
              fontStyle: "italic",
              color: MUTED,
              margin: 0,
              fontSize: 16,
            }}
          >
            {era.era}.
          </p>

          {!hideTransport ? (
            <p
              style={{
                fontFamily: FONT_MONO,
                fontSize: 12,
                color: SOFT,
                margin: "10px 0 0",
              }}
            >
              <PNavLink
                href="prev"
                onClick={onPrev}
                disabled={!prevEra}
                visited={visited}
                visit={visit}
                setHoverUrl={setHoverUrl}
              >
                ◂ previous era
              </PNavLink>
              {" · "}
              <strong style={{ color: TEXT }}>
                {era.id} · entry {index + 1} of {total}
              </strong>
              {" · "}
              <PNavLink
                href="next"
                onClick={onNext}
                disabled={!nextEra}
                visited={visited}
                visit={visit}
                setHoverUrl={setHoverUrl}
              >
                next era ▸
              </PNavLink>
              {" · "}
              <PNavLink
                href="close"
                onClick={onClose}
                visited={visited}
                visit={visit}
                setHoverUrl={setHoverUrl}
              >
                close
              </PNavLink>
            </p>
          ) : (
            <p
              style={{
                fontFamily: FONT_MONO,
                fontSize: 12,
                color: SOFT,
                margin: "10px 0 0",
              }}
            >
              <strong style={{ color: TEXT }}>
                {era.id} · entry {index + 1} of {total}
              </strong>
            </p>
          )}

          <Rule />

          {/* Description */}
          <p style={{ margin: "0 0 12px", textAlign: "justify" }}>
            {era.description}
          </p>

          <blockquote
            style={{
              borderLeft: `3px solid ${TEXT}`,
              paddingLeft: 12,
              margin: "0 0 12px",
              fontStyle: "italic",
            }}
          >
            “{era.lesson}”
          </blockquote>

          <p style={{ margin: "0 0 12px", color: MUTED }}>
            <strong>Heritage. </strong>
            {era.heritage}
          </p>

          <Rule />

          {/* Palette */}
          <h2 style={h2}>1. Palette</h2>
          <dl style={dl}>
            {(
              [
                ["primary", era.colors.primary],
                ["secondary", era.colors.secondary],
                ["accent", era.colors.accent],
                ["background", era.colors.background],
                ["text", era.colors.text],
              ] as const
            ).map(([k, v]) => (
              <React.Fragment key={k}>
                <dt style={dt}>{k}</dt>
                <dd style={dd}>
                  <span
                    aria-hidden
                    style={{
                      display: "inline-block",
                      width: 12,
                      height: 12,
                      backgroundColor: v,
                      border: `1px solid ${TEXT}`,
                      verticalAlign: "middle",
                      marginRight: 6,
                    }}
                  />
                  <code style={{ fontFamily: FONT_MONO, fontSize: 13 }}>
                    {v.toUpperCase()}
                  </code>
                </dd>
              </React.Fragment>
            ))}
          </dl>

          {/* Typography */}
          <h2 style={h2}>2. Typography</h2>
          <table
            style={{
              borderCollapse: "collapse",
              width: "100%",
              fontSize: 14,
              marginTop: 4,
            }}
          >
            <thead>
              <tr>
                <th style={th}>role</th>
                <th style={th}>family</th>
                <th style={th}>sample</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={td}>display</td>
                <td style={{ ...td, fontFamily: FONT_MONO, fontSize: 12, color: MUTED }}>
                  {fontName(era.fonts.primary)}
                </td>
                <td style={{ ...td, fontFamily: era.fonts.primary, fontSize: 22 }}>
                  Aa Bb 0123
                </td>
              </tr>
              <tr>
                <td style={td}>body</td>
                <td style={{ ...td, fontFamily: FONT_MONO, fontSize: 12, color: MUTED }}>
                  {fontName(era.fonts.secondary)}
                </td>
                <td style={{ ...td, fontFamily: era.fonts.secondary, fontSize: 15 }}>
                  The quick brown fox.
                </td>
              </tr>
              <tr>
                <td style={td}>ui</td>
                <td style={{ ...td, fontFamily: FONT_MONO, fontSize: 12, color: MUTED }}>
                  {fontName(era.fonts.accent)}
                </td>
                <td style={{ ...td, fontFamily: era.fonts.accent, fontSize: 13 }}>
                  BUTTONS · LABELS
                </td>
              </tr>
            </tbody>
          </table>

          {/* Tokens */}
          <h2 style={h2}>3. Design tokens</h2>
          <dl style={dl}>
            {tokenRows.map(([k, v]) => (
              <React.Fragment key={k}>
                <dt style={dt}>{k}</dt>
                <dd style={{ ...dd, fontFamily: FONT_MONO, fontSize: 13 }}>
                  {v}
                </dd>
              </React.Fragment>
            ))}
          </dl>

          {/* Key elements */}
          <h2 style={h2}>4. Key elements</h2>
          <ul style={ul}>
            {era.keyElements.map((el) => (
              <li key={el}>{el}</li>
            ))}
          </ul>

          {/* Effects */}
          {era.designTokens.effects.length > 0 && (
            <>
              <h2 style={h2}>5. Effects</h2>
              <p
                style={{
                  margin: "0 0 12px",
                  fontFamily: FONT_MONO,
                  fontSize: 13,
                  color: MUTED,
                }}
              >
                {era.designTokens.effects.join(" · ")}
              </p>
            </>
          )}

          <Rule />

          {/* Action paragraph */}
          <p style={{ margin: 0 }}>
            <PNavLink
              href="use"
              onClick={onClose}
              visited={visited}
              visit={visit}
              setHoverUrl={setHoverUrl}
            >
              use era {era.id} ▸
            </PNavLink>
          </p>

          <Rule />

          {/* Footer */}
          <address
            style={{
              fontStyle: "normal",
              fontFamily: FONT_MONO,
              fontSize: 12,
              color: SOFT,
              lineHeight: 1.7,
            }}
          >
            <div>
              ERA-{era.id} record · entry {index + 1}/{total}.
            </div>
            <div>This page conforms to HTML 1.0.</div>
          </address>
        </article>
      </div>

      {/* NCSA-style status bar — pinned to overlay bottom */}
      <div
        style={{
          position: "absolute",
          insetInline: 0,
          bottom: 0,
          padding: "4px 12px",
          borderTop: `1px solid ${TEXT}`,
          backgroundColor: "#f0f0f0",
          fontFamily: FONT_MONO,
          fontSize: 12,
          color: TEXT,
          minHeight: 24,
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <span style={{ color: SOFT }}>NCSA Mosaic 1.0 ◂</span>
        <span style={{ flex: 1, color: hoverUrl ? TEXT : SOFT }}>
          {hoverUrl || "Document: Done."}
        </span>
        <span style={{ color: SOFT }}>era {era.id}</span>
      </div>
    </div>
  );
};

// ─── Inline styles ───────────────────────────────────────────────────────

const h2: React.CSSProperties = {
  fontSize: 22,
  fontWeight: 700,
  margin: "20px 0 8px",
  lineHeight: 1.25,
};

const dl: React.CSSProperties = {
  margin: "0 0 12px",
  display: "grid",
  gridTemplateColumns: "minmax(110px, max-content) 1fr",
  columnGap: 16,
  rowGap: 4,
};

const dt: React.CSSProperties = {
  fontWeight: 700,
};

const dd: React.CSSProperties = {
  margin: 0,
};

const ul: React.CSSProperties = {
  paddingLeft: 24,
  margin: "0 0 12px",
  listStyleType: "disc",
};

const th: React.CSSProperties = {
  borderBottom: `2px solid ${TEXT}`,
  textAlign: "left",
  padding: "4px 6px",
  fontWeight: 700,
};

const td: React.CSSProperties = {
  borderBottom: `1px solid ${MUTED}`,
  padding: "4px 6px",
  verticalAlign: "top",
};

function Rule() {
  return (
    <hr
      style={{
        border: "none",
        borderTop: `1px solid ${TEXT}`,
        height: 1,
        margin: "18px 0",
        backgroundColor: "transparent",
      }}
    />
  );
}

function fontName(f: string) {
  return f.split(",")[0].replaceAll('"', "").trim();
}

function PNavLink({
  href,
  children,
  onClick,
  disabled,
  visited,
  visit,
  setHoverUrl,
}: {
  href: string;
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  visited: Set<string>;
  visit: (k: string) => void;
  setHoverUrl: (s: string) => void;
}) {
  const isVisited = visited.has(href);
  return (
    <a
      href="#"
      onClick={(e) => {
        e.preventDefault();
        if (disabled) return;
        visit(href);
        onClick();
      }}
      onMouseEnter={() => !disabled && setHoverUrl(`era-machine://${href}`)}
      onMouseLeave={() => setHoverUrl("")}
      style={{
        color: disabled ? SOFT : isVisited ? VISITED : LINK,
        textDecoration: "underline",
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      {children}
    </a>
  );
}

export default DocHtmlArchetype;
