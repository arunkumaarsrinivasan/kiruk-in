/**
 * Read's home: the directory. A masthead that opens with pictures, then every
 * shelf laid out by what it has to show: an essay leads with its photograph,
 * the making-of is a grid of pictures, the work is led by its numbers, the
 * skills are a tree. The same in every era; the era only colours it.
 */
import Image from "next/image";
import Link from "next/link";
import { GraphStat, GraphTree } from "@/components/figures";
import type { ReadGroup, ReadPage, ReadShelf } from "@/lib/content/read/directory";
import { ReadShell, type RailGroup } from "./ReadShell";

const two = (n: number) => String(n).padStart(2, "0");
const pages = (n: number) => (n === 1 ? "1 page" : `${n} pages`);
const clip = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s);

function Pic({ src, sizes }: { src: string; sizes: string }) {
  return (
    <span className="read-pic">
      <Image src={src} alt="" fill sizes={sizes} />
    </span>
  );
}

/** A title that is the link, and reaches over its tile so the whole tile opens it. */
function Hit({ page, className }: { page: ReadPage; className?: string }) {
  if (!page.href) return <span className={className}>{page.title}</span>;
  return (
    <Link href={page.href} className={`read-hit${className ? ` ${className}` : ""}`}>
      {page.title}
    </Link>
  );
}

function Lead({ page, kind }: { page: ReadPage; kind: string }) {
  return (
    <article className="read-lead">
      {page.image ? <Pic src={page.image} sizes="(min-width: 60rem) 34rem, 100vw" /> : null}
      <div>
        <p className="read-kicker">Latest {kind.toLowerCase().replace(/s$/, "")}</p>
        <h3 className="read-lead__title">
          <Hit page={page} />
        </h3>
        {page.summary ? <p className="read-lead__sum">{page.summary}</p> : null}
        {page.meta ? (
          <p className="read-fact" style={{ marginTop: "0.9rem" }}>
            {page.meta}
          </p>
        ) : null}
        <span className="read-lead__go" aria-hidden>
          Read it →
        </span>
      </div>
    </article>
  );
}

function Tiles({ group }: { group: ReadGroup }) {
  return (
    <ul className="read-tiles">
      {group.pages.map((p, i) => (
        <li key={p.title}>
          {p.image ? (
            <Pic src={p.image} sizes={i === 0 ? "(min-width: 52rem) 30rem, 100vw" : "(min-width: 52rem) 15rem, 50vw"} />
          ) : (
            <span className="read-pic" style={{ aspectRatio: "3 / 2" }} />
          )}
          <h3 className="read-tile__title">
            <Hit page={p} />
          </h3>
          {p.summary ? <p className="read-tile__sum">{p.summary}</p> : null}
          {p.meta ? <p className="read-fact">{p.meta}</p> : null}
        </li>
      ))}
    </ul>
  );
}

function Stats({ group }: { group: ReadGroup }) {
  return (
    <ul className="read-stats">
      {group.pages.map((p) => (
        <li key={p.title}>
          {p.stat ? (
            <p style={{ margin: 0 }}>
              <span className="read-stat__value">{p.stat.value}</span>
              <span className="read-stat__label">{p.stat.label}</span>
            </p>
          ) : null}
          <h3 className="read-stat__title">
            <Hit page={p} />
          </h3>
          {p.summary ? <p className="read-stat__sum">{p.summary}</p> : null}
          {p.meta ? <p className="read-fact">{p.meta}</p> : null}
        </li>
      ))}
    </ul>
  );
}

function Rows({ group }: { group: ReadGroup }) {
  return (
    <ol className="read-rows">
      {group.pages.map((p) => (
        <li key={p.title} className="read-row">
          <h3 className="read-row__title">{p.href ? <Link href={p.href}>{p.title}</Link> : p.title}</h3>
          {p.meta ? <span className="read-fact">{p.meta}</span> : null}
          {p.summary ? <p className="read-row__sum">{p.summary}</p> : null}
        </li>
      ))}
    </ol>
  );
}

/** Every "links" group of a shelf, as one index: label on the left, titles beside it. */
function Index({ groups }: { groups: ReadGroup[] }) {
  return (
    <dl className="read-index">
      {groups.map((g, i) => (
        <div key={g.label ?? i} style={{ display: "contents" }}>
          <dt className="read-label">{g.label ?? "More"}</dt>
          <dd>
            <ul className="read-links">
              {g.pages.map((p) => (
                <li key={p.title} title={p.summary}>
                  {p.href ? <Link href={p.href}>{p.title}</Link> : <span>{p.title}</span>}
                </li>
              ))}
            </ul>
          </dd>
        </div>
      ))}
    </dl>
  );
}

/** The skills as a tree: the hub, and the skills it routes to. */
function SkillTree({ group }: { group: ReadGroup }) {
  const [hub, ...rest] = group.pages;
  if (!hub) return null;
  return (
    <GraphTree
      title="SKILLS"
      nodes={[
        {
          label: hub.title,
          meta: "the hub: read first",
          accent: true,
          children: rest.map((p) => ({ label: p.title, meta: clip(p.summary ?? "", 46) })),
        },
      ]}
    />
  );
}

function Shelf({ shelf, n }: { shelf: ReadShelf; n: number }) {
  const index = shelf.groups.filter((g) => g.as === "links");
  return (
    <section className="read-shelf" aria-labelledby={shelf.id} data-blueprint={`shelf-${shelf.id}`}>
      <header className="read-shelf__head">
        <div>
          <p className="read-kicker">
            {two(n)} · {shelf.kind}
          </p>
          <h2 id={shelf.id} className="read-shelf__title">
            {shelf.title}
          </h2>
        </div>
        <div>
          <p className="read-shelf__blurb">{shelf.blurb}</p>
          <p className="read-fact read-shelf__note">
            {pages(shelf.count)}
            {shelf.note ? ` · ${shelf.note}` : ""}
            {shelf.href ? (
              <>
                {" · "}
                <Link href={shelf.href}>{shelf.hrefLabel}</Link>
              </>
            ) : null}
          </p>
        </div>
      </header>

      {shelf.groups.map((g, i) => {
        if (g.as === "links") return null;
        return (
          <div key={g.label ?? i} className="read-group">
            {g.as === "lead" ? <Lead page={g.pages[0]} kind={shelf.kind} /> : null}
            {g.as === "tiles" ? <Tiles group={g} /> : null}
            {g.as === "figures" ? <Stats group={g} /> : null}
            {g.as === "rows" ? (
              <>
                {g.label ? <h3 className="read-label read-group__label">{g.label}</h3> : null}
                <Rows group={g} />
              </>
            ) : null}
          </div>
        );
      })}

      {index.length && shelf.id === "skills" ? (
        <>
          <SkillTree group={index[0]} />
          <Index groups={[{ ...index[0], label: "Open one" }]} />
        </>
      ) : null}
      {index.length && shelf.id !== "skills" ? <Index groups={index} /> : null}
    </section>
  );
}

export function ReadHome({ shelves, all, featured, query }: {
  /** The shelves to show: all of them, or what a search left. */
  shelves: ReadShelf[];
  /** Every shelf, for the rail and the counts. */
  all: ReadShelf[];
  /** The pictures that open the page. */
  featured: (ReadPage & { shelf: string })[];
  query: string;
}) {
  const total = all.reduce((n, s) => n + s.count, 0);
  const found = shelves.reduce((n, s) => n + s.count, 0);
  const rail: RailGroup[] = [
    { label: "Read", items: [{ label: "Read", href: "/notebook", current: true }] },
    { label: "Shelves", items: all.map((s) => ({ label: s.title, href: `/notebook#${s.id}`, n: String(s.count) })) },
  ];

  return (
    <ReadShell rail={rail}>
      <header data-blueprint="header">
        <p className="read-kicker">Kiruk · {pages(total)} to read</p>
        <h1 className="read-title">Read</h1>
        <p className="read-pitch">What I think, how this site was made, the work in words, and the rules I build with.</p>

        {query ? null : (
          <>
            <ul className="read-strip">
              {featured.map((p) => (
                <li key={p.href}>
                  {p.image ? <Pic src={p.image} sizes="(min-width: 60rem) 12rem, 33vw" /> : null}
                  <Hit page={p} className="read-strip__title" />
                  <p className="read-fact">{p.shelf}</p>
                </li>
              ))}
            </ul>
            <GraphStat title="ON THE SHELVES" items={all.map((s, i) => ({ value: s.count, label: s.title.toLowerCase(), accent: i === 1 }))} />
          </>
        )}

        <form className="read-find" action="/notebook" method="get" role="search" data-blueprint="search">
          <label htmlFor="read-q">Find</label>
          <input id="read-q" name="q" type="search" defaultValue={query} autoComplete="off" placeholder="blink, Spera, grid" />
        </form>
        <ul className="read-meta" aria-live="polite">
          {query ? (
            <>
              <li>
                {found === 0 ? "Nothing" : pages(found)} for “{query}”
              </li>
              <li>
                <Link href="/notebook">Show everything</Link>
              </li>
            </>
          ) : (
            <>
              <li>
                <a href="/feed.xml">Feed</a>
              </li>
              <li>
                <a href="/llms.txt">For assistants</a>
              </li>
            </>
          )}
        </ul>
      </header>

      {shelves.length === 0 ? (
        <p className="read-empty">No page mentions “{query}”. Try a shorter word, or clear the search to see every shelf.</p>
      ) : null}

      {shelves.map((shelf) => (
        <Shelf key={shelf.id} shelf={shelf} n={all.findIndex((s) => s.id === shelf.id) + 1} />
      ))}
    </ReadShell>
  );
}
