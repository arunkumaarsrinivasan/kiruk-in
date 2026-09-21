"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { useNotebookEraOptional } from "./NotebookEraContext";
import { NotebookLink } from "./NotebookLink";

type Section = { id: string; title: string };

function headingTitle(el: HTMLElement) {
  return (el.textContent || "").replace(/\s+/g, " ").trim();
}

function tickVars(index: number, passed: number, count: number) {
  if (count <= 1) return { scale: 1, opacity: 1 };
  const at = passed * (count - 1);
  const dist = Math.abs(index - at);
  const scale = Math.max(0.28, 1 - dist * 0.36);
  const opacity = Math.max(0.16, 1 - dist * 0.4);
  return { scale, opacity };
}

function scrollY() {
  return window.scrollY || document.documentElement.scrollTop || 0;
}

function collectSections(root: Element): { sections: Section[]; nodes: HTMLElement[] } {
  const nodes = [...root.querySelectorAll<HTMLElement>("h2[id]")];
  const sections = nodes
    .map((el) => ({ id: el.id, title: headingTitle(el) }))
    .filter((s) => s.id && s.title);
  return { sections, nodes };
}

async function writeClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  }
}

export function NotebookProgress({ agentMarkdown }: { agentMarkdown: string }) {
  const eraId = useNotebookEraOptional()?.eraId ?? "1970";
  const [sections, setSections] = useState<Section[]>([]);
  const [active, setActive] = useState("");
  const [passed, setPassed] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMd, setCopiedMd] = useState(false);
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    let io: IntersectionObserver | null = null;
    let nodes: HTMLElement[] = [];
    let alive = true;
    let retry = 0;
    let retryId = 0;

    const measure = (list: HTMLElement[]) => {
      const first = list[0];
      const last = list[list.length - 1];
      const y = scrollY();
      setShowTop(y > 280);
      if (!first || !last) return;
      const start = first.getBoundingClientRect().top + y - 120;
      const end = last.getBoundingClientRect().top + y - 120;
      const t = end <= start ? 1 : Math.min(1, Math.max(0, (y - start) / (end - start)));
      setPassed(t);
    };

    const bind = () => {
      if (!alive) return false;
      const root = document.querySelector("article");
      if (!root) return false;

      const next = collectSections(root);
      // Still measure scroll for "top" even when there are no section headings.
      if (next.sections.length === 0) {
        nodes = [];
        setSections([]);
        measure([]);
        return true;
      }

      io?.disconnect();
      nodes = next.nodes;
      setSections(next.sections);
      setActive((prev) => (next.sections.some((s) => s.id === prev) ? prev : next.sections[0]?.id ?? ""));

      io = new IntersectionObserver(
        (entries) => {
          const visible = entries
            .filter((e) => e.isIntersecting)
            .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
          const id = visible[0]?.target.id;
          if (id) setActive(id);
        },
        { rootMargin: "0px 0px -62% 0px", threshold: 0.08 },
      );
      nodes.forEach((el) => io?.observe(el));
      measure(nodes);
      return true;
    };

    const tryBind = () => {
      if (bind()) return;
      if (retry >= 12) return;
      retry += 1;
      retryId = window.setTimeout(tryBind, 50 * retry);
    };

    tryBind();

    const onScroll = () => measure(nodes);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      alive = false;
      window.clearTimeout(retryId);
      io?.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [eraId]);

  const jump = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    setActive(id);
  };

  const share = async () => {
    if (!(await writeClipboard(window.location.href))) return;
    setCopiedLink(true);
    window.setTimeout(() => setCopiedLink(false), 1600);
  };

  const copyAgentMd = async () => {
    if (!(await writeClipboard(agentMarkdown))) return;
    setCopiedMd(true);
    window.setTimeout(() => setCopiedMd(false), 1800);
  };

  const toTop = () => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  };

  const activeIndex = Math.max(0, sections.findIndex((s) => s.id === active));

  return (
    <>
      {sections.length > 0 ? (
        <nav className="era-toc" aria-label="On this page" data-gaze-ignore>
          <ol className="era-toc-rail">
            {sections.map((section, i) => {
              const { scale, opacity } = tickVars(i, passed, sections.length);
              const now = i === activeIndex;
              return (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="era-toc-tick"
                    data-state={now ? "now" : i < activeIndex ? "done" : "next"}
                    aria-current={now ? "true" : undefined}
                    aria-label={section.title}
                    style={
                      {
                        "--rail-scale": scale,
                        "--rail-opacity": opacity,
                      } as CSSProperties
                    }
                    onClick={(e) => {
                      e.preventDefault();
                      jump(section.id);
                    }}
                  >
                    <span className="era-toc-bar" aria-hidden />
                    <span className="era-toc-name">{section.title}</span>
                  </a>
                </li>
              );
            })}
          </ol>
        </nav>
      ) : null}

      <div className="era-toc-acts" data-gaze-ignore>
        <NotebookLink
          href="/notebook"
          className="era-toc-act era-toc-back"
          aria-label="All notebook pages"
        >
          ← all pages
        </NotebookLink>
        <button type="button" className="era-toc-act era-toc-share" onClick={share}>
          {copiedLink ? "copied" : "share"}
        </button>
        <button
          type="button"
          className="era-toc-act era-toc-top"
          onClick={toTop}
          disabled={!showTop}
          aria-label="Back to top"
        >
          top
        </button>
        <button
          type="button"
          className="era-toc-act era-toc-md"
          onClick={copyAgentMd}
          title="Copy Markdown for Claude, ChatGPT, Cursor, Perplexity"
          aria-label="Copy agent Markdown"
        >
          {copiedMd ? "copied" : "agent.md"}
        </button>
      </div>
    </>
  );
}
