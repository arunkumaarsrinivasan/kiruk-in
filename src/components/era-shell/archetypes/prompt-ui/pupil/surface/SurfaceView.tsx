"use client";

/**
 * Renders a Surface from the pupil's own catalog, node by node. The engine
 * answers instantly; nodes come in on a short stagger so the composition
 * reads as it's built (none with reduced motion).
 *
 * Asking stays inside the pupil: every item, chip and follow-up asks the
 * next question. Real pages (a case study, a live site) are a separate,
 * quieter "open" link.
 */

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import type { Item, Node, Surface, Txt } from "@/lib/pupil/surface";
import { ContactNote } from "./ContactNote";

const isExternal = (href: string) => /^(https?:|mailto:)/.test(href);

function Go({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return isExternal(href) ? (
    <a className={className} href={href} target={href.startsWith("mailto:") ? undefined : "_blank"} rel="noopener noreferrer">
      {children}
    </a>
  ) : (
    <Link className={className} href={href}>
      {children}
    </Link>
  );
}

const T = ({ t }: { t?: Txt }) => (t ? <>{t.text}</> : null);

function ItemRow({ it, onAsk, when, onHoverRef }: { it: Item; onAsk: (q: string) => void; when?: Txt; onHoverRef?: (id: string | null) => void }) {
  const body = (
    <>
      {when ? <span className="r26-when">{when.text}</span> : null}
      <span className="r26-item-title">{it.title.text}</span>
      {it.note ? <span className="r26-item-note">{it.note.text}</span> : null}
    </>
  );
  return (
    <li className="r26-item" onPointerEnter={() => it.ref && onHoverRef?.(it.ref)} onPointerLeave={() => it.ref && onHoverRef?.(null)}>
      {it.ask ? (
        <button type="button" className="r26-item-main" onClick={() => onAsk(it.ask!)}>
          {body}
          <span className="r26-item-go" aria-hidden="true">
            →
          </span>
        </button>
      ) : (
        <div className="r26-item-main">{body}</div>
      )}
      {it.meta && !when ? <span className="r26-item-meta">{it.meta.text}</span> : null}
      {it.href ? (
        <Go href={it.href} className="r26-open">
          open<span className="r26-sr"> {it.title.text}</span>
        </Go>
      ) : null}
    </li>
  );
}

function NodeView({ n, onAsk, asked, onHoverRef }: { n: Node; onAsk: (q: string) => void; asked: string; onHoverRef?: (id: string | null) => void }) {
  switch (n.type) {
    case "text":
      return n.variant === "quote" ? (
        <blockquote className="r26-quote">
          <T t={n.text} />
        </blockquote>
      ) : (
        <p className={`r26-text r26-text-${n.variant ?? "body"}`}>
          <T t={n.text} />
        </p>
      );
    case "entity":
      return (
        <div className="r26-entity">
          <h3>
            <T t={n.title} />
          </h3>
          {n.subtitle ? (
            <p className="r26-entity-sub">
              <T t={n.subtitle} />
            </p>
          ) : null}
          {n.facts?.length ? (
            <dl className="r26-facts">
              {n.facts.map((f) => (
                <div key={f.label}>
                  <dt>{f.label}</dt>
                  <dd>{f.value.text}</dd>
                </div>
              ))}
            </dl>
          ) : null}
          {n.href || n.links?.length ? (
            <div className="r26-entity-links">
              {n.href ? (
                <Go href={n.href} className="r26-open">
                  Open the case
                </Go>
              ) : null}
              {(n.links ?? []).map((l) => (
                <Go key={l.href} href={l.href} className="r26-open">
                  {l.label}
                </Go>
              ))}
            </div>
          ) : null}
        </div>
      );
    case "list":
      return (
        <section className="r26-list">
          {n.label ? <h4>{n.label}</h4> : null}
          <ul>
            {n.items.map((it, i) => (
              <ItemRow key={(it.ref ?? it.title.src) + i} it={it} onAsk={onAsk} onHoverRef={onHoverRef} />
            ))}
          </ul>
        </section>
      );
    case "timeline":
      return (
        <section className="r26-list r26-timeline">
          {n.label ? <h4>{n.label}</h4> : null}
          <ol>
            {n.items.map((it, i) => (
              <ItemRow key={(it.ref ?? it.title.src) + i} it={it} when={it.when} onAsk={onAsk} onHoverRef={onHoverRef} />
            ))}
          </ol>
        </section>
      );
    case "facts":
      return (
        <dl className="r26-facts r26-facts-block">
          {n.items.map((f) => (
            <div key={f.label}>
              <dt>{f.label}</dt>
              <dd>{f.value.text}</dd>
            </div>
          ))}
        </dl>
      );
    case "chips":
      return (
        <div className="r26-chips">
          {n.label ? <span className="r26-chips-label">{n.label}</span> : null}
          {n.items.map((c) => (
            <button key={c.label.src + c.ask} type="button" onClick={() => onAsk(c.ask)}>
              {c.label.text}
            </button>
          ))}
        </div>
      );
    case "compare":
      return (
        <div className="r26-compare" role="table" aria-label={`${n.left.title.text} compared with ${n.right.title.text}`}>
          <div role="row" className="r26-compare-head">
            <span role="columnheader" />
            <span role="columnheader">{n.left.title.text}</span>
            <span role="columnheader">{n.right.title.text}</span>
          </div>
          {n.rows.map((r) => (
            <div role="row" key={r.label}>
              <span role="rowheader">{r.label}</span>
              <span role="cell">{r.a?.text ?? "–"}</span>
              <span role="cell">{r.b?.text ?? "–"}</span>
            </div>
          ))}
        </div>
      );
    case "compose":
      return (
        <section className="r26-list">
          <ul>
            {n.channels.map((it) => (
              <li key={it.title.src} className="r26-item">
                <Go href={it.href!} className="r26-item-main">
                  <span className="r26-item-title">{it.title.text}</span>
                  {it.note ? <span className="r26-item-note">{it.note.text}</span> : null}
                </Go>
              </li>
            ))}
          </ul>
          <ContactNote intent={n.intent} asked={asked} />
        </section>
      );
    case "links":
      return (
        <div className="r26-entity-links">
          {n.items.map((l) => (
            <Go key={l.href} href={l.href} className="r26-open">
              {l.label}
            </Go>
          ))}
        </div>
      );
    case "section":
      return (
        <h3 className="r26-section">
          <T t={n.title} />
        </h3>
      );
    case "next":
      return (
        <div className="r26-chips r26-next" aria-label="Ask next">
          {n.asks.map((a) => (
            <button key={a} type="button" onClick={() => onAsk(a)}>
              {a}
            </button>
          ))}
        </div>
      );
  }
}

export function SurfaceView({
  surface,
  onAsk,
  onClose,
  reduce,
  hideNext = false,
  autoFocus = true,
  onHoverRef,
}: {
  surface: Surface;
  onAsk: (q: string) => void;
  /** Without it there's no ×: in a thread the conversation ends from the composer. */
  onClose?: () => void;
  reduce: boolean;
  /** Follow-ups shown elsewhere (the composer's chips) instead of at the end. */
  hideNext?: boolean;
  /** Move focus to the answer's title. Off in a thread, so the ask box keeps it. */
  autoFocus?: boolean;
  /** Pointing at a thing in the answer lights its dot in the pupil. */
  onHoverRef?: (id: string | null) => void;
}) {
  const headRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (autoFocus) headRef.current?.focus({ preventScroll: true });
  }, [surface.id, autoFocus]);

  const nodes = hideNext ? surface.nodes.filter((n) => n.type !== "next") : surface.nodes;
  return (
    <section className="r26-surface" aria-labelledby={`r26-s-${surface.id}`} data-intent={surface.intent} onClick={(e) => e.stopPropagation()}>
      <header className="r26-surface-head">
        <h2 id={`r26-s-${surface.id}`} ref={headRef} tabIndex={-1}>
          {surface.title.text}
        </h2>
        {onClose ? (
          <button type="button" className="r26-close" onClick={onClose} aria-label="Close, back to the pupil">
            <span aria-hidden="true">×</span>
          </button>
        ) : null}
      </header>
      {surface.trace ? <p className="r26-trace">{surface.trace}</p> : null}
      {nodes.map((n, i) => (
        <div key={n.id} className="r26-node" style={reduce ? undefined : ({ "--i": i } as CSSProperties)}>
          <NodeView n={n} onAsk={onAsk} asked={surface.asked} onHoverRef={onHoverRef} />
        </div>
      ))}
      {surface.from.length ? (
        <div className="r26-from" aria-label="Where this came from" style={reduce ? undefined : ({ "--i": nodes.length } as CSSProperties)}>
          <span className="r26-chips-label">from</span>
          {surface.from.map((f) => (
            <button key={f.ref} type="button" onClick={() => onAsk(f.ask)} onPointerEnter={() => onHoverRef?.(f.ref)} onPointerLeave={() => onHoverRef?.(null)} onFocus={() => onHoverRef?.(f.ref)} onBlur={() => onHoverRef?.(null)} data-ref={f.ref}>
              {f.label.text}
            </button>
          ))}
        </div>
      ) : null}
    </section>
  );
}
