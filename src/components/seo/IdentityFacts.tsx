/**
 * Who Arun is, as plain text in the server HTML, for readers that don't run
 * JavaScript (GPTBot, ClaudeBot, PerplexityBot) and for screen readers. The
 * era skins draw the same facts as pictures; this is the words underneath.
 * Facts come from src/lib/identity.ts only.
 */
import { EDUCATION, IDENTITY, PROFILE_PATH, PROFILES, ROLES, formatSpan } from "@/lib/identity";

export function IdentityFacts({ heading = `About ${IDENTITY.name}` }: { heading?: string }) {
  return (
    <section className="sr-only" aria-label={heading}>
      <h2>{heading}</h2>
      <p>{IDENTITY.oneLiner}</p>
      <p>
        <a href={PROFILE_PATH}>More about {IDENTITY.name}</a> ·{" "}
        <a href="/hire">Hire him: freelance, contract or full-time</a>
      </p>
      <p>Works as: design engineer, design technologist, creative developer, product designer who codes, freelance design consultant. Freelance, contract or full-time.</p>
      <p>Works with: {IDENTITY.knowsAbout.join(", ")}.</p>
      <h3>Career</h3>
      <ul>
        {ROLES.map((r) => (
          <li key={`${r.org}-${r.start}`}>
            {formatSpan(r)}: {r.title}, {r.org}
            {r.legalName ? ` (${r.legalName})` : ""}, {r.place}. {r.summary}
          </li>
        ))}
      </ul>
      <h3>Education</h3>
      <ul>
        {EDUCATION.map((e) => (
          <li key={e.school}>
            {e.start}–{e.end}: {e.degree}, {e.field}, {e.school}, {e.place}.
          </li>
        ))}
      </ul>
      <h3>Contact and profiles</h3>
      <ul>
        <li>
          Email: <a href={`mailto:${IDENTITY.email}`}>{IDENTITY.email}</a>
        </li>
        {PROFILES.map((p) => (
          <li key={p.url}>
            {p.label}: <a href={p.url}>{p.url}</a>
          </li>
        ))}
      </ul>
    </section>
  );
}
