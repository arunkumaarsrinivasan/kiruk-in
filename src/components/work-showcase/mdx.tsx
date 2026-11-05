import type { ReactNode } from "react";
import type { SceneId } from "@/data/work-cases";
import { Spans, Trend } from "./charts";
import { ShowcaseScene } from "./ShowcaseScene";

/*
 * What a case's MDX is made of: a portfolio presentation, not a diary.
 *
 *   <Hero layout="single|pair|bento"> <Shot …>caption</Shot> … </Hero>
 *   <Metrics> <Lead/> <Trend/> <Spans/> <Stat/> <Meter/> </Metrics>
 *   <Iterations> <Iteration …>caption</Iteration> … </Iterations>
 *   <Facts role team platform stack when />
 *
 * Every number is one we stand behind (docs/resume/MASTER-CAREER.md).
 */

/* ── the work itself, from its best angle ───────────────── */

export function Hero({ layout = "single", children }: { layout?: "single" | "pair" | "bento"; children?: ReactNode }) {
  return (
    <div className="wp-hero" data-layout={layout}>
      {children}
    </div>
  );
}

export function Shot({
  scene,
  title,
  shot,
  shotAlt,
  link,
  linkLabel,
  children,
}: {
  scene: SceneId;
  title: string;
  shot?: string;
  shotAlt?: string;
  link?: string;
  linkLabel?: string;
  children?: ReactNode;
}) {
  return (
    <figure className="wp-shot">
      <div className="ws-ch__pic wp-shot__pic">
        <ShowcaseScene scene={scene} title={title} shot={shot ? { src: shot, alt: shotAlt ?? title } : undefined} />
      </div>
      <figcaption className="wp-shot__cap">
        <span className="wp-shot__title">{title}</span>
        {children ? <span className="wp-shot__note">{children}</span> : null}
        {link ? (
          <a className="ws-link wp-shot__link" href={link} target="_blank" rel="noopener noreferrer">
            {linkLabel ?? link} <span aria-hidden>↗</span>
          </a>
        ) : null}
      </figcaption>
    </figure>
  );
}

/* ── the numbers ────────────────────────────────────────── */

export function Metrics({ label = "Impact", children }: { label?: string; children?: ReactNode }) {
  return (
    <section className="wp-metrics" aria-label={label}>
      {children}
    </section>
  );
}

/** The one number the case leads with. Exactly one per case. */
export function Lead({ value, label }: { value: string; label: string }) {
  return (
    <div className="wp-lead">
      <p className="wp-lead__value">{value}</p>
      <p className="wp-lead__label">{label}</p>
    </div>
  );
}

export function Stat({ value, label, delta, dir }: { value: string; label: string; delta?: string; dir?: "up" | "down" }) {
  return (
    <div className="wp-stat">
      <p className="wp-stat__value">{value}</p>
      <p className="wp-stat__label">{label}</p>
      {delta ? (
        <p className="wp-stat__delta">
          <span aria-hidden>{dir === "down" ? "↓" : "↑"}</span> {delta}
        </p>
      ) : null}
    </div>
  );
}

/** One ratio against its limit: the track is a lighter step of the fill. */
export function Meter({ value, max = "100", label }: { value: string; max?: string; label: string }) {
  const v = Number(value);
  const m = Number(max);
  return (
    <div className="wp-meter">
      <p className="wp-stat__value">{value}%</p>
      <p className="wp-stat__label">{label}</p>
      <span className="wp-meter__track" role="meter" aria-valuenow={v} aria-valuemin={0} aria-valuemax={m} aria-label={label}>
        <span className="wp-meter__fill" style={{ width: `${(v / m) * 100}%` }} />
      </span>
    </div>
  );
}

export { Spans, Trend };

/* ── the best iterations ────────────────────────────────── */

export function Iterations({ label = "Iterations", children }: { label?: string; children?: ReactNode }) {
  return (
    <section className="wp-iter" aria-label={label}>
      <p className="ws-eyebrow">{label}</p>
      <ol className="wp-iter__strip">{children}</ol>
    </section>
  );
}

export function Iteration({
  tag,
  when,
  title,
  scene,
  shot,
  shotAlt,
  best,
  children,
}: {
  tag: string;
  when: string;
  title: string;
  scene: SceneId;
  shot?: string;
  shotAlt?: string;
  best?: boolean | string;
  children?: ReactNode;
}) {
  return (
    <li className="wp-iter__item" data-best={best ? true : undefined}>
      <div className="ws-ch__pic wp-iter__pic">
        <ShowcaseScene scene={scene} title={title} shot={shot ? { src: shot, alt: shotAlt ?? title } : undefined} still />
      </div>
      <p className="wp-iter__meta">
        <span className="wp-iter__tag">{tag}</span> {when}
      </p>
      <p className="wp-iter__title">{title}</p>
      {children ? <p className="wp-iter__note">{children}</p> : null}
    </li>
  );
}

/* ── the facts a reviewer scans for ─────────────────────── */

export function Facts({ role, team, platform, stack, when }: { role: string; team?: string; platform?: string; stack?: string; when?: string }) {
  const rows: [string, string | undefined][] = [
    ["Role", role],
    ["Team", team],
    ["Platform", platform],
    ["Stack", stack],
    ["When", when],
  ];
  return (
    <dl className="wp-facts">
      {rows
        .filter((r): r is [string, string] => !!r[1])
        .map(([k, v]) => (
          <div key={k}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
    </dl>
  );
}

export const WORK_MDX = { Hero, Shot, Metrics, Lead, Stat, Meter, Trend, Spans, Iterations, Iteration, Facts };
