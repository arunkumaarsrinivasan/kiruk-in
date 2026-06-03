"use client";

/**
 * Module content bodies (About / Work / Contact / Blog / Progress). Era-token
 * themed, semantic, one source each. Pulls from the shared landing-content
 * artifacts + portfolioData so modules and the legacy routes share copy. Each
 * offers an "open full experience" deep-link to its surviving route.
 */

import React from "react";
import Link from "next/link";
import { PERSONA, USABILITY_TEST, CARD_SORTING } from "@/components/era-shell/archetypes/shared/landing-content";

function Shell({
  eyebrow,
  title,
  children,
  route,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
  route?: string;
}) {
  return (
    <div
      className="mx-auto flex h-full w-full max-w-3xl flex-col gap-6 px-6 py-10 sm:px-10"
      style={{ fontFamily: "var(--font-main)", color: "var(--text-main)" }}
    >
      <header className="flex flex-col gap-1.5">
        <span
          className="text-[11px] font-semibold uppercase tracking-[0.28em]"
          style={{ color: "var(--accent-color)" }}
        >
          {eyebrow}
        </span>
        <h2
          className="text-3xl font-bold leading-tight sm:text-4xl"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {title}
        </h2>
      </header>
      {children}
      {route && (
        <Link
          href={route}
          className="mt-auto inline-flex w-fit items-center gap-1.5 rounded-[var(--era-radius-md)] border px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition-transform hover:-translate-y-0.5"
          style={{
            borderColor: "var(--border-color)",
            color: "var(--accent-color)",
            background:
              "color-mix(in srgb, var(--accent-color) 8%, transparent)",
          }}
        >
          Open full experience ↗
        </Link>
      )}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="text-[11px] font-semibold uppercase tracking-[0.22em]"
      style={{ color: "var(--accent-color)" }}
    >
      {children}
    </span>
  );
}

function Chips({ items }: { items: readonly string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((it) => (
        <span
          key={it}
          className="rounded-[var(--era-radius-sm)] border px-2.5 py-1 text-xs"
          style={{
            borderColor: "var(--border-color)",
            background:
              "color-mix(in srgb, var(--accent-color) 8%, transparent)",
          }}
        >
          {it}
        </span>
      ))}
    </div>
  );
}

export function AboutContent() {
  return (
    <Shell eyebrow="Persona · who is Arun" title={PERSONA.identity.name} route="/about">
      <p
        className="text-[15px] leading-relaxed"
        style={{ lineHeight: "var(--era-line-height,1.6)" }}
      >
        {PERSONA.background}
      </p>
      <blockquote
        className="border-l-2 pl-3 text-[15px] italic"
        style={{ borderColor: "var(--accent-color)" }}
      >
        “{PERSONA.quote}”
      </blockquote>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label>Goals</Label>
          <ul className="flex flex-col gap-1 text-sm">
            {PERSONA.goals.map((g) => (
              <li key={g}>· {g}</li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col gap-2">
          <Label>Frustrations</Label>
          <ul className="flex flex-col gap-1 text-sm">
            {PERSONA.frustrations.map((f) => (
              <li key={f}>· {f}</li>
            ))}
          </ul>
        </div>
      </div>
    </Shell>
  );
}

export function ContactContent() {
  return (
    <Shell eyebrow="Usability test · start a session" title="Get in touch" route="/contact">
      <p className="text-[15px]" style={{ color: "var(--text-muted)" }}>
        {USABILITY_TEST.taskBody}
      </p>
      <div className="flex flex-col gap-2">
        <Label>Success metrics</Label>
        <Chips items={USABILITY_TEST.successMetrics} />
      </div>
      <div className="flex flex-col gap-2">
        <Label>Channels</Label>
        <div className="grid gap-2 sm:grid-cols-2">
          {USABILITY_TEST.channels.map((c) => (
            <a
              key={c.label}
              href={c.href}
              className="flex flex-col gap-0.5 rounded-[var(--era-radius-md)] border px-3 py-2 transition-transform hover:-translate-y-0.5"
              style={{ borderColor: "var(--border-color)", background: "var(--bg-card)" }}
            >
              <span className="text-sm font-semibold">{c.label}</span>
              <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                {c.role}
              </span>
              <span className="truncate text-xs" style={{ color: "var(--accent-color)" }}>
                {c.value}
              </span>
            </a>
          ))}
        </div>
      </div>
    </Shell>
  );
}

export function WorkContent() {
  return (
    <Shell eyebrow="Card sorting · selected work" title="Work" route="/work">
      <p className="text-[15px]" style={{ color: "var(--text-muted)" }}>
        A fuller "work world" lands soon. For now, a sorted set of recent
        projects.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {CARD_SORTING.projects.map((p) => (
          <div
            key={p.id}
            data-project-folder={p.id}
            className="flex flex-col gap-1.5 rounded-[var(--era-radius-md)] border p-3"
            style={{ borderColor: "var(--border-color)", background: "var(--bg-card)" }}
          >
            <span className="text-sm font-semibold">{p.title}</span>
            <span className="text-[11px] uppercase tracking-[0.16em]" style={{ color: "var(--accent-color)" }}>
              {p.category} · {p.role}
            </span>
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              {p.description}
            </span>
            <Chips items={p.technologies} />
          </div>
        ))}
      </div>
    </Shell>
  );
}

export function BlogContent() {
  return (
    <Shell eyebrow="Process journal" title="Blog" route="/blog">
      <p
        className="text-[15px] leading-relaxed"
        style={{ lineHeight: "var(--era-line-height,1.6)" }}
      >
        Long-form notes on design engineering, gamified UX, and building across
        eras. Open the full journal to read every entry.
      </p>
    </Shell>
  );
}

export function ProgressContent() {
  return (
    <Shell eyebrow="Stats · life roadmap" title="Progress" route="/progress">
      <p
        className="text-[15px] leading-relaxed"
        style={{ lineHeight: "var(--era-line-height,1.6)" }}
      >
        Skill trees, monthly goals, and the long game — tracked like an RPG.
        Open the full board to explore the map.
      </p>
    </Shell>
  );
}
