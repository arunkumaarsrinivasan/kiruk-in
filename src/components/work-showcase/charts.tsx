"use client";

import { useId, useState } from "react";

/*
 * The two charts a case's metrics use. One hue each (the era's ink), the
 * point of the story in full ink and the rest a lighter step of it; text
 * never wears the mark colour; every mark has a hover tooltip and the whole
 * chart a table for screen readers.
 */

const list = (s: string) => s.split(",").map((x) => x.trim());

/* ── Trend: columns over time, one of them the point ─────── */

export function Trend({ label, values, ticks, peak, note }: { label: string; values: string; ticks: string; peak?: string; note?: string }) {
  const v = list(values).map(Number);
  const t = list(ticks);
  const [hover, setHover] = useState<number | null>(null);
  const id = useId();
  const W = 480;
  const H = 180;
  const top = 18;
  const base = H - 26;
  const max = Math.ceil(Math.max(...v) / 50) * 50;
  const slot = W / v.length;
  const bar = Math.min(24, slot * 0.56);
  const y = (n: number) => base - ((base - top) * n) / max;
  const peakAt = peak ? t.indexOf(peak) : v.indexOf(Math.max(...v));
  const show = hover ?? peakAt;

  return (
    <figure className="wp-chart wp-trend">
      <figcaption id={id} className="wp-chart__label">
        {label}
      </figcaption>
      <div className="wp-chart__plot">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-labelledby={id} onPointerLeave={() => setHover(null)}>
          {[0, max / 2, max].map((g) => (
            <g key={g}>
              <line className="wp-grid" x1={0} x2={W} y1={y(g)} y2={y(g)} />
              {g > 0 ? (
                <text className="wp-tick" x={0} y={y(g) - 4}>
                  {g}
                </text>
              ) : null}
            </g>
          ))}
          {v.map((n, i) => {
            const x = slot * i + (slot - bar) / 2;
            const h = base - y(n);
            const r = Math.min(4, h / 2);
            // Rounded at the data end, square on the baseline
            const d = `M${x},${base} V${base - h + r} Q${x},${base - h} ${x + r},${base - h} H${x + bar - r} Q${x + bar},${base - h} ${x + bar},${base - h + r} V${base} Z`;
            return (
              <g key={t[i]}>
                <path className="wp-col" data-on={i === peakAt || i === hover || undefined} d={d} />
                <text className="wp-tick" x={x + bar / 2} y={H - 8} textAnchor="middle">
                  {t[i]}
                </text>
                <rect
                  className="wp-hit"
                  x={slot * i}
                  y={0}
                  width={slot}
                  height={H}
                  tabIndex={0}
                  aria-label={`${t[i]}: ${n}`}
                  onPointerEnter={() => setHover(i)}
                  onFocus={() => setHover(i)}
                  onBlur={() => setHover(null)}
                />
              </g>
            );
          })}
        </svg>
        {show >= 0 ? (
          <span className="wp-tip" style={{ left: `${((slot * show + slot / 2) / W) * 100}%`, top: `${(y(v[show]) / H) * 100}%` }} aria-hidden>
            <b>{v[show]}</b> {t[show]}
          </span>
        ) : null}
      </div>
      {note ? <p className="wp-chart__note">{note}</p> : null}
      <table className="sr-only">
        <caption>{label}</caption>
        <tbody>
          {v.map((n, i) => (
            <tr key={t[i]}>
              <th scope="row">{t[i]}</th>
              <td>{n}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}

/* ── Spans: when each piece ran, on one time axis ────────── */

export function Spans({ label, rows, from, to }: { label: string; rows: string; from: string; to: string }) {
  // rows: "Name | 2023-02 | 2026-02; Name | …"
  const items = rows.split(";").map((r) => {
    const [name, start, end] = r.split("|").map((x) => x.trim());
    return { name, start, end };
  });
  const [hover, setHover] = useState<number | null>(null);
  const id = useId();
  const t = (d: string) => {
    const [yy, mm] = d.split("-").map(Number);
    return yy + (mm - 1) / 12;
  };
  const a = t(from);
  const b = t(to);
  const pct = (d: string) => ((t(d) - a) / (b - a)) * 100;
  const years: number[] = [];
  for (let yy = Math.ceil(a); yy <= Math.floor(b); yy++) years.push(yy);
  const fmt = (d: string) => new Date(`${d}-01T00:00:00Z`).toLocaleDateString("en-GB", { month: "short", year: "numeric", timeZone: "UTC" });

  return (
    <figure className="wp-chart wp-spans" onPointerLeave={() => setHover(null)}>
      <figcaption id={id} className="wp-chart__label">
        {label}
      </figcaption>
      <div className="wp-spans__plot" role="img" aria-labelledby={id}>
        {years.map((yy) => (
          <span key={yy} className="wp-spans__year" style={{ left: `calc(var(--wp-name-w) + (100% - var(--wp-name-w)) * ${pct(`${yy}-01`) / 100})` }}>
            {yy}
          </span>
        ))}
        {items.map((it, i) => (
          <div key={it.name} className="wp-spans__row">
            <span className="wp-spans__name">{it.name}</span>
            <span className="wp-spans__track">
              <span
                className="wp-spans__bar"
                data-on={hover === i || undefined}
                style={{ left: `${pct(it.start)}%`, width: `${pct(it.end) - pct(it.start)}%` }}
                tabIndex={0}
                aria-label={`${it.name}: ${fmt(it.start)} to ${fmt(it.end)}`}
                onPointerEnter={() => setHover(i)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
              />
              {hover === i ? (
                <span className="wp-tip wp-tip--row" style={{ left: `${(pct(it.start) + pct(it.end)) / 2}%` }} aria-hidden>
                  {fmt(it.start)} – {fmt(it.end)}
                </span>
              ) : null}
            </span>
          </div>
        ))}
      </div>
      <table className="sr-only">
        <caption>{label}</caption>
        <tbody>
          {items.map((it) => (
            <tr key={it.name}>
              <th scope="row">{it.name}</th>
              <td>
                {fmt(it.start)} – {fmt(it.end)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
