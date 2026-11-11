"use client";

/**
 * The lineage map: entries as cards on one grid, wired to each other.
 *
 * Every edge between two cards on the map is drawn, so the map shows how the
 * neighbours relate to each other as well as to the entry. On an entry page
 * (`here` set) the entry's own card leads and its wires are the strong ones.
 * Pointing at any card lights its wires and dims what it does not touch.
 *
 * Wires never cross a card. All cards share one grid, so the gaps between
 * columns line up down the whole map: a wire leaves the bottom of the upper
 * card, runs along the gap under its row, drops through a column gap, runs
 * along the gap above the lower card's row and enters that card from the top.
 */

import Link from "next/link";
import { Fragment, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { LineageGroup, MakingEdge, MakingNode } from "@/lib/content/making";

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}
interface Wire {
  key: string;
  from: string;
  to: string;
  d: string;
  ends: [number, number][];
}

/** How far a wire runs from a row before it turns, and the radius of its corners. */
const LANE = 13;
const BEND = 6;

/** A path through `pts` with rounded corners. Every segment is horizontal or vertical. */
function roundedPath(pts: [number, number][]): string {
  const p = pts.filter((q, i) => i === 0 || q[0] !== pts[i - 1][0] || q[1] !== pts[i - 1][1]);
  let d = `M${p[0][0]} ${p[0][1]}`;
  for (let i = 1; i < p.length; i++) {
    const [x, y] = p[i];
    const next = p[i + 1];
    if (!next) {
      d += ` L${x} ${y}`;
      break;
    }
    const [px, py] = p[i - 1];
    const r = Math.min(BEND, Math.hypot(x - px, y - py) / 2, Math.hypot(next[0] - x, next[1] - y) / 2);
    const ax = x - Math.sign(x - px) * r;
    const ay = y - Math.sign(y - py) * r;
    const bx = x + Math.sign(next[0] - x) * r;
    const by = y + Math.sign(next[1] - y) * r;
    d += ` L${ax} ${ay} Q${x} ${y} ${bx} ${by}`;
  }
  return d;
}

export function MakingCard({ node, here, dim, lit, onPoint }: {
  node: MakingNode;
  here?: boolean;
  dim?: boolean;
  lit?: boolean;
  onPoint?: (slug: string | null) => void;
}) {
  const body = (
    <>
      {node.image ? <span className="mk-card__img" style={{ backgroundImage: `url(${node.image})` }} aria-hidden /> : null}
      <span className="mk-card__kind">{here ? "You are here" : node.kindLabel}</span>
      <span className="mk-card__title">{node.title}</span>
      <span className="mk-card__made">{node.made}</span>
    </>
  );
  const cls = `mk-card mk-card--${node.kind}${here ? " is-here" : ""}${dim ? " is-dim" : ""}${lit ? " is-lit" : ""}`;
  const point = {
    onPointerEnter: onPoint ? () => onPoint(node.slug) : undefined,
    onPointerLeave: onPoint ? () => onPoint(null) : undefined,
  };
  if (here) {
    return (
      <div className={cls} data-slug={node.slug} aria-current="page" {...point}>
        {body}
      </div>
    );
  }
  return (
    <Link
      href={node.href}
      className={cls}
      data-slug={node.slug}
      title={node.tldr}
      {...point}
      onFocus={onPoint ? () => onPoint(node.slug) : undefined}
      onBlur={onPoint ? () => onPoint(null) : undefined}
    >
      {body}
    </Link>
  );
}

export function LineageMap({ groups, here, edges }: {
  groups: LineageGroup[];
  /** The entry this map belongs to. Leave out on the hub. */
  here?: MakingNode;
  /** Every edge between cards on this map. */
  edges: MakingEdge[];
}) {
  const root = useRef<HTMLDivElement>(null);
  const [wires, setWires] = useState<Wire[]>([]);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [point, setPoint] = useState<string | null>(null);

  const touches = useCallback(
    (slug: string) => {
      const out = new Set<string>();
      for (const e of edges) {
        if (e.from === slug) out.add(e.to);
        if (e.to === slug) out.add(e.from);
      }
      return out;
    },
    [edges],
  );

  const measure = useCallback(() => {
    const el = root.current;
    const grid = el?.querySelector<HTMLElement>(".mk-map__grid");
    if (!el || !grid) return;
    const r0 = el.getBoundingClientRect();
    const gap = parseFloat(getComputedStyle(grid).columnGap) || 16;
    const boxes = new Map<string, Box>();
    el.querySelectorAll<HTMLElement>("[data-slug]").forEach((c) => {
      const r = c.getBoundingClientRect();
      boxes.set(c.dataset.slug as string, { x: r.left - r0.left, y: r.top - r0.top, w: r.width, h: r.height });
    });

    const next: Wire[] = [];
    for (const e of edges) {
      const p = boxes.get(e.from);
      const q = boxes.get(e.to);
      if (!p || !q) continue;
      // Draw from the upper card to the lower one; in one row, from left to right.
      const [a, b] = p.y < q.y - 1 || (Math.abs(p.y - q.y) <= 1 && p.x <= q.x) ? [p, q] : [q, p];
      const ax = Math.round(a.x + a.w / 2);
      const bx = Math.round(b.x + b.w / 2);
      const under = Math.round(a.y + a.h + LANE);
      let pts: [number, number][];
      let ends: [number, number][];
      if (Math.abs(a.y - b.y) <= 1) {
        // Same row: dip under it and come back up.
        pts = [[ax, a.y + a.h], [ax, under], [bx, under], [bx, b.y + b.h]];
        ends = [[ax, a.y + a.h], [bx, b.y + b.h]];
      } else {
        const over = Math.round(b.y - LANE);
        const gutter = Math.round(b.x - gap / 2);
        pts = [[ax, a.y + a.h], [ax, under], [gutter, under], [gutter, over], [bx, over], [bx, b.y]];
        ends = [[ax, a.y + a.h], [bx, b.y]];
      }
      next.push({ key: `${e.from}>${e.to}>${e.rel}`, from: e.from, to: e.to, d: roundedPath(pts), ends });
    }
    setSize({ w: r0.width, h: r0.height });
    setWires(next);
  }, [edges]);

  useIsoLayoutEffect(() => {
    measure();
    const el = root.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [measure]);

  const near = point ? touches(point) : null;
  const cardState = (slug: string) => ({
    lit: Boolean(near && near.has(slug)),
    dim: Boolean(near && !near.has(slug) && point !== slug),
  });

  return (
    <div ref={root} className={`mk-map${point ? " is-pointing" : ""}`}>
      <svg className="mk-map__wires" width={size.w} height={size.h} viewBox={`0 0 ${size.w || 1} ${size.h || 1}`} aria-hidden>
        {wires.map((w) => {
          const lit = point === w.from || point === w.to;
          const main = here && (w.from === here.slug || w.to === here.slug);
          return (
            <g key={w.key} className={`mk-wire${main ? " mk-wire--main" : ""}${lit ? " is-lit" : ""}`}>
              <path d={w.d} />
              {w.ends.map(([x, y]) => (
                <circle key={`${x},${y}`} cx={x} cy={y} r={2.5} />
              ))}
            </g>
          );
        })}
      </svg>
      <div className="mk-map__grid">
        {here ? (
          <div className="mk-map__here">
            <MakingCard node={here} here onPoint={setPoint} />
          </div>
        ) : null}
        {groups.map((g) => (
          <Fragment key={g.label}>
            <h3 className="mk-label mk-map__label">{g.label}</h3>
            {g.nodes.map((n) => (
              <MakingCard key={n.slug} node={n} onPoint={setPoint} {...cardState(n.slug)} />
            ))}
          </Fragment>
        ))}
      </div>
    </div>
  );
}
