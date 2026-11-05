import { renderMdx, type MdxComponentScope } from "@/lib/content";
import { getWorkCases } from "@/lib/content/work";
import { WORK_MDX } from "./mdx";
import "./showcase.css";

/**
 * The three cases from content/work/*.mdx, under the era desktop, each as a
 * portfolio presentation: the work from its best angle, its numbers, its
 * best iterations, its facts. The structure is the same in every era; the
 * era tints it through the site's variables and the shaders in showcase.css.
 */
export async function Showcase() {
  const cases = getWorkCases();
  const bodies = await Promise.all(cases.map((c) => renderMdx(c.body, WORK_MDX as unknown as MdxComponentScope)));

  return (
    <>
      <div className="ws">
        {cases.map((c, i) => {
          const f = c.frontmatter;
          const [main, ...rest] = f.links;
          return (
            <article key={c.slug} id={c.slug} className="ws-case" data-sector={f.sector} aria-labelledby={`${c.slug}-title`}>
              <header className="ws-case__head">
                <p className="ws-eyebrow">
                  {String(i + 1).padStart(2, "0")} · {f.role} · {f.when}
                </p>
                <h3 id={`${c.slug}-title`} className="ws-case__title">
                  {f.title}
                </h3>
                <p className="ws-case__pitch">{f.pitch}</p>
                <div className="ws-case__links">
                  <a className="ws-button" href={main.href} target="_blank" rel="noopener noreferrer">
                    {main.label} <span aria-hidden>↗</span>
                  </a>
                  {rest.map((l) => (
                    <a key={l.href} className="ws-link" href={l.href} target="_blank" rel="noopener noreferrer">
                      {l.label} <span aria-hidden>↗</span>
                    </a>
                  ))}
                </div>
                {f.nda ? <p className="ws-nda">Internal screens are under HP&apos;s NDA, so the pictures are drawn, not captured.</p> : null}
              </header>
              <div className="wp-body">{bodies[i]}</div>
            </article>
          );
        })}
      </div>
    </>
  );
}
