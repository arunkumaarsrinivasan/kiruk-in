/**
 * What a making-of entry can use in its MDX (content/making/*.mdx): the blog's
 * own element set (components/blog/MdxComponents), so prose reads like any
 * post, plus the few blocks a making-of needs. Everything is drawn in the
 * page's era tokens. Server components, except the live SVG marks.
 */
import Image from "next/image";
import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { mdxComponents } from "@/components/blog/MdxComponents";
import { AVAILABLE_THEMES } from "@/data/portfolio-data";
import { MAKING_PATH, getMakingNode } from "@/lib/content/making";
import { SvgMarks } from "./SvgMarks";

const BlogA = mdxComponents.a;

/**
 * A link to another entry says what it points to before you follow it: its
 * kind, when it was made, and its one-line summary. Any other link is the
 * blog's own.
 */
function A(props: ComponentPropsWithoutRef<"a">) {
  const { href = "", children } = props;
  const node = href.startsWith(`${MAKING_PATH}/`) ? getMakingNode(href.slice(MAKING_PATH.length + 1).split("#")[0]) : undefined;
  if (!node) return <BlogA {...props} />;
  return (
    <Link href={href} className="mk-ref">
      {children}
      <span className="mk-ref__tip" aria-hidden>
        <span className="mk-label">
          {node.kindLabel} · {node.made}
        </span>
        <span className="mk-ref__title">{node.title}</span>
        <span className="mk-ref__tldr">{node.tldr}</span>
      </span>
    </Link>
  );
}

/** A picture with a caption that says what to look at. `w`/`h` are the file's own pixels. */
function Figure({ src, alt, w, h, wide, children }: {
  src: string;
  alt: string;
  w: number;
  h: number;
  wide?: boolean;
  children?: ReactNode;
}) {
  return (
    <figure className={`mk-fig${wide ? " mk-wide" : ""}`}>
      <span className="mk-frame">
        <Image src={src} alt={alt} width={w} height={h} sizes={wide ? "(min-width: 1100px) 1040px, 100vw" : "(min-width: 800px) 760px, 100vw"} />
      </span>
      {children ? <figcaption>{children}</figcaption> : null}
    </figure>
  );
}

function Pair({ children }: { children: ReactNode }) {
  return <div className="mk-pair mk-wide">{children}</div>;
}

function Gens({ children }: { children: ReactNode }) {
  return <div className="mk-gens mk-wide">{children}</div>;
}

function Gen({ n, when, name, how, children }: { n: string; when: string; name: string; how: string; children: ReactNode }) {
  return (
    <div className="mk-gen">
      <div className="mk-label">
        {n} · {when}
      </div>
      <div className="mk-gen__name">{name}</div>
      <div className="mk-gen__how">{how}</div>
      <div className="mk-gen__body">{children}</div>
    </div>
  );
}

/** The reviewer's own words on a round. */
function Verdict({ on, children }: { on: string; children: ReactNode }) {
  return (
    <figure className="mk-verdict">
      <blockquote>{children}</blockquote>
      <figcaption>Arun, reviewing {on}</figcaption>
    </figure>
  );
}

/** A spec sheet from one string: "Globe | 12 mm; Cornea | R 7.8 mm". */
function Spec({ rows }: { rows: string }) {
  const list = rows.split(";").map((r) => r.split("|").map((p) => p.trim()));
  return (
    <dl className="mk-spec">
      {list.map(([k, v]) => (
        <div key={k} style={{ display: "contents" }}>
          <dt>{k}</dt>
          <dd>{v}</dd>
        </div>
      ))}
    </dl>
  );
}

/** The ten eras as they stand today, from the loader's own posters. */
function Eras() {
  return (
    <div className="mk-eras mk-wide">
      {AVAILABLE_THEMES.map((t) => (
        <figure key={t.id}>
          <span className="mk-frame">
            <Image src={`/eye/posters/${t.id}-wide.avif`} alt={`The loader eye in ${t.id}: ${t.name}`} width={1600} height={900} sizes="(min-width: 640px) 20vw, 50vw" />
          </span>
          <figcaption>{t.id}</figcaption>
        </figure>
      ))}
    </div>
  );
}

/**
 * The grid method: the photo and the render, each under a millimetre grid
 * centred on the iris. The iris (11.8 mm across) sets each picture's scale.
 */
const PANES = [
  { tag: "The photo, 1 mm grid", src: "/making/loader-eye/grid-yours.webp", alt: "Macro photograph of Arun's own eye under a one-millimetre grid", cx: 337, cy: 345, d: 217 },
  { tag: "The render, 1 mm grid", src: "/making/loader-eye/grid-ours.webp", alt: "The rendered eye under the same one-millimetre grid", cx: 320, cy: 362, d: 234 },
];
const PANE_W = 640;
const PANE_H = 594;

function GridStudy() {
  return (
    <div className="mk-pair mk-wide">
      {PANES.map((p) => {
        const mm = p.d / 11.8;
        const lines: ReactNode[] = [];
        for (let i = -20; i <= 20; i++) {
          const x = p.cx + i * mm;
          const y = p.cy + i * mm;
          const cls = i % 5 === 0 ? "g5" : "g1";
          if (x >= 0 && x <= PANE_W) lines.push(<line key={`v${i}`} className={cls} x1={x} y1={0} x2={x} y2={PANE_H} />);
          if (y >= 0 && y <= PANE_H) lines.push(<line key={`h${i}`} className={cls} x1={0} y1={y} x2={PANE_W} y2={y} />);
        }
        return (
          <figure key={p.tag} className="mk-fig">
            <span className="mk-frame mk-frame--grid">
              <Image src={p.src} alt={p.alt} width={PANE_W} height={PANE_H} sizes="(min-width: 700px) 500px, 100vw" />
              <svg viewBox={`0 0 ${PANE_W} ${PANE_H}`} preserveAspectRatio="none" aria-hidden>
                {lines}
                <circle className="gi" cx={p.cx} cy={p.cy} r={p.d / 2} />
                <line className="gx" x1={p.cx - 9} y1={p.cy} x2={p.cx + 9} y2={p.cy} />
                <line className="gx" x1={p.cx} y1={p.cy - 9} x2={p.cx} y2={p.cy + 9} />
              </svg>
            </span>
            <figcaption>{p.tag}</figcaption>
          </figure>
        );
      })}
    </div>
  );
}

function Cap({ children }: { children: ReactNode }) {
  return <div className="mk-cap">{children}</div>;
}

export const MAKING_MDX = {
  ...mdxComponents,
  a: A,
  Figure,
  Pair,
  Gens,
  Gen,
  Verdict,
  Spec,
  Eras,
  GridStudy,
  Cap,
  SvgMarks,
};
