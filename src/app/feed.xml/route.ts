import { getNotebookEntries } from "@/lib/content/notebook";
import { SITE_URL, SITE_NAME } from "@/lib/site";

export const dynamic = "force-static";

interface FeedItem {
  url: string;
  title: string;
  excerpt: string;
  date: string;
  categories: string[];
}

function xmlEscape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function rfc822(date: string): string {
  const d = new Date(date);
  return Number.isNaN(d.getTime()) ? new Date(0).toUTCString() : d.toUTCString();
}

function collectItems(): FeedItem[] {
  return getNotebookEntries().map((p) => ({
    url: `${SITE_URL}${p.href}`,
    title: p.title,
    excerpt: p.excerpt,
    date: p.date,
    categories: [...p.domain, ...p.tags.filter((tag) => !p.domain.includes(tag))],
  }));
}

export function GET(): Response {
  const items = collectItems()
    .map((item) => {
      const categories = item.categories
        .map((c) => `<category>${xmlEscape(c)}</category>`)
        .join("");
      return [
        "<item>",
        `<title>${xmlEscape(item.title)}</title>`,
        `<link>${item.url}</link>`,
        `<guid isPermaLink="true">${item.url}</guid>`,
        item.date ? `<pubDate>${rfc822(item.date)}</pubDate>` : "",
        item.excerpt ? `<description>${xmlEscape(item.excerpt)}</description>` : "",
        categories,
        "</item>",
      ]
        .filter(Boolean)
        .join("");
    })
    .join("");

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    "<channel>",
    `<title>${xmlEscape(SITE_NAME)}</title>`,
    `<link>${SITE_URL}</link>`,
    `<description>Kiruk Studio notebook — pen-and-paper thinking through to shipped pixels.</description>`,
    "<language>en-IN</language>",
    `<atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>`,
    items,
    "</channel>",
    "</rss>",
  ].join("");

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
