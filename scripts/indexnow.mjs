#!/usr/bin/env node
/**
 * Tell Bing, Yandex, Seznam and Naver (IndexNow) that kiruk.in changed.
 * Bing's index feeds ChatGPT search and Copilot, so this is the fastest way
 * to get new pages in front of them. Run after a deploy:
 *
 *   node scripts/indexnow.mjs            # every URL in the live sitemap
 *   node scripts/indexnow.mjs /work /    # just these paths
 *
 * The key file public/<KEY>.txt must be live at https://www.kiruk.in/<KEY>.txt.
 */
const HOST = "www.kiruk.in";
const KEY = "a80b4dd68080d758d0eed57a8229392c";
const ORIGIN = `https://${HOST}`;

async function sitemapUrls() {
  const xml = await (await fetch(`${ORIGIN}/sitemap.xml`)).text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

const args = process.argv.slice(2);
const urlList = args.length ? args.map((p) => new URL(p, ORIGIN).href) : await sitemapUrls();

const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `${ORIGIN}/${KEY}.txt`, urlList }),
});
console.log(`IndexNow: ${res.status} ${res.statusText} for ${urlList.length} URLs`);
if (res.status >= 300) console.log(await res.text());
