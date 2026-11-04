# SEO and AEO report: kiruk.in

4 November 2026. Covers what search engines and answer engines (ChatGPT, Google AI Mode, Perplexity) find when someone looks up Arun Kumaar Sreenivasan, what changed on the site, and what is still left to do off it.

## 1. Where things stood (baseline, 4 Nov 2026)

These searches ran through Firecrawl's web index with location set to India. Google personalises results and its ranking will differ a little, so read the positions as a rough guide. Run the same queries again 4–6 weeks after the deploy and compare.

| Query a person types | Where kiruk.in showed up | Who ranked instead |
|---|---|---|
| `Arun Kumaar Sreenivasan` | **Not in the top 10** | #1 a different Arun Kumar Sreenivasan (Cognizant, mechanical background), #2 another one (Qualcomm), #3 **your own Google Scholar** (spelled Srinivasan) |
| `Arun Kumar design engineer` | Not in the top 15 | LinkedIn profiles of other Arun Kumars; arunkumar.co.in (a different UX designer, Arun Kumar S, at Adobe) at #3 |
| `Arun Kumaar design engineer Spera` | Not in the top 10 | Other Arun Kumaars (GlobalFoundries, Birlasoft) |
| `design engineer from India portfolio` | Not in the top 15 | Search engines read this as mechanical/CAD design engineering |
| `Kiruk Studio design engineer Bengaluru` | **#6** | CAD job boards |
| `Three.js developer India portfolio` | Not in the top 15 | Bruno Simon, Awwwards, Upwork, tutorials |
| `site:kiruk.in` | **Only 4 pages indexed**: home, /roadmap, /work, one essay | /contact, /notebook, /progress missing |

What the AI answers showed (screenshots from ChatGPT and Google AI Mode):

- ChatGPT took your HP title from Peerlist ("Software Systems Engineer 1"), not from the site.
- It could not confirm that the director of Spero Spera Private Limited was the same person as the designer.
- Google listed your own Sona College Scholar profile as "another individual", because it spells the name Srinivasan.

### What was wrong on the site

1. **No page title had your name in it.** The home title was "Kiruk Studio — Design Engineer & AI UX Designer in India", and every other page ended in "— Kiruk Studio". Searching your name had nothing to match against the most important ranking signal.
2. **AI crawlers saw almost nothing.** GPTBot, ClaudeBot and PerplexityBot don't run JavaScript. In the raw HTML, /work had 403 characters of text, /contact had 231, and the About story was an empty box.
3. **There was no single page about you.** /about redirects to `/#about`, a story box that only appears after JavaScript runs, behind the loader. Entity-SEO guides call the missing piece an *entity home*: one plain page that every profile points to.
4. **Your facts disagreed across sites:** the HP title, Spera vs Spero Spera Private Limited, Sreenivasan vs Srinivasan.
5. **Three.js barely appeared.** It wasn't in the home skills list, wasn't in the schema's `knowsAbout`, and no page explained the 3D work.
6. **Structured data didn't match visible text.** The home FAQ existed only as JSON-LD, which Google asks site owners to avoid.

## 2. What the guidance says (sources)

- **Google, "AI features and your website"** (developers.google.com/search/docs/appearance/ai-features). No special markup or AI file is needed for AI Overviews or AI Mode. The page doesn't mention llms.txt. What it asks for:
  - important content available as text
  - structured data that matches the visible text on the page
  - a good page experience
  - images and video that support the text

  Eligibility is the same as normal Search: the page has to be indexed and snippet-eligible.
- **Entity SEO guides from 2026** (Digital Applied, "Entity SEO & Knowledge Graph Optimization Guide 2026"; Murat Ulusoy, "Entity SEO: Making a Person a Verifiable Brand"). What they agree on:
  - Make one *entity home* page with complete `Person` JSON-LD and a stable `@id`.
  - Link it two ways with about 7–10 strong profiles (`sameAs` from the site, a link back to the site from each profile).
  - State the same facts in the same words everywhere. "Schema without substance is a well-formatted, empty declaration" (Jason Barnard, quoted by Digital Applied): the page text has to back up the schema.
  - They also report that AI Overview citations mostly come from pages already in the top 10, so normal ranking still decides most of it.
- **"GEO: Generative Engine Optimization"** (Aggarwal et al., Princeton and IIT Delhi, arXiv 2311.09735). Adding specific statistics, quotations and cited sources raised how often generative engines cited a page, by up to about 40% in their tests. The new page is written that way: dated roles, numbers (500+ employees, 45%, 330+ commits) and named projects.

## 3. What changed on the site

Everything below reads from **`src/lib/identity.ts`**. Change a fact there and every surface updates.

| Change | Where | Why |
|---|---|---|
| New **entity home** at `/arun-kumaar-sreenivasan` | `src/app/arun-kumaar-sreenivasan/page.tsx` | One server-rendered page with your name in the URL, title and h1. Visible sections: quick facts, *What he does* (design engineer in India, Three.js / WebGPU, AI UX, design systems, each with evidence), dated career, education, selected work, a 9-question FAQ, profiles with `rel="me"`. Uses the active era's colours and fonts. ~8,000 characters of text without JavaScript. |
| Name-first titles | `layout.tsx`, work, notebook | Home: "Arun Kumaar Sreenivasan — Design Engineer, Bengaluru \| Kiruk" (60 chars). Other pages: "… — Arun Kumaar Sreenivasan". Work: "Design engineering work — Arun Kumaar Sreenivasan". |
| Shorter, factual descriptions | home, work, notebook | ~150 characters, so search results don't cut them off. Each names you, Bengaluru, Spera, HP, Three.js. |
| `Person` JSON-LD | `identity.ts` → `layout.tsx` | Adds: the Srinivasan spelling, `disambiguatingDescription`, dated jobs as `OrganizationRole` (Spera with legal name Spero Spera Private Limited, HP, PeopleGamez), Sona College in `alumniOf`, `hasOccupation`, email, WebGPU/WebGL/shaders in `knowsAbout`, Contra and Peerlist in `sameAs`. `mainEntityOfPage` now points at the entity home. |
| FAQ moved to where people can see it | entity home | The `FAQPage` schema now sits next to visible questions and answers, as Google asks. It was removed from home, where it was invisible. Adds "Is he a Three.js developer?" and "Is he the same person as Arun Kumar Sreenivasan?" |
| `/llms.txt` generated, not hand-written | `src/app/llms.txt/route.ts` | Built from the facts: quick facts, dated career, *What he does*, "Not to be confused with", page list (entity home first, marked as the page to cite). |
| `/about.md` (new) | `src/app/about.md/route.ts` | The whole story plus facts and FAQ as one markdown file for AI agents. |
| Text under the era skins for no-JS readers | `about-story/registry.tsx`, `seo/IdentityFacts.tsx` | The About box's server HTML now holds the full story (visually hidden, readable by screen readers and bots). Home, /work and /contact carry a hidden facts block with a link to the entity home. |
| h1 on every key page | work, contact | /work had the h1 "Work"; /contact had no h1. |
| Three.js and WebGPU in the visible stack | `era-page-content.ts` | The home empathy-map "DOES" list now shows them. |
| Sitemap | `sitemap.ts` | Entity home (priority 0.95) and `/about.md` added. |
| IndexNow | `scripts/indexnow.mjs`, `public/a80b…c.txt`, `npm run indexnow` | Tells Bing (which feeds ChatGPT search and Copilot) and Yandex about new pages within minutes, instead of waiting for a crawl. |

### Checked locally, reading the HTML as GPTBot

| Page | Text before (live) | After (local) | Title now |
|---|---|---|---|
| `/arun-kumaar-sreenivasan` | page didn't exist | 8,007 chars | Arun Kumaar Sreenivasan — Design Engineer, Bengaluru, India |
| `/` | 5,984 | 13,652 | Arun Kumaar Sreenivasan — Design Engineer, Bengaluru \| Kiruk |
| `/work` | 403 | 7,600 (includes the uncommitted showcase work) | Design engineering work — Arun Kumaar Sreenivasan |
| `/contact` | 231 | 2,371 | Contact — Arun Kumaar Sreenivasan |

Every JSON-LD block parses. TypeScript passes. The loader on `/` is unchanged.

## 4. What this can and can't do

- **"Arun Kumar" on its own:** realistically, no one site will rank #1 for this. Thousands of people share the name, and the results are full of film people, scientists and LinkedIn. The search engine has to *know which Arun Kumar the searcher means*. That is why the work focuses on:
  - owning the exact spelling "Arun Kumaar Sreenivasan"
  - catching the one-a misspelling in visible text
  - name + topic pairs: "Arun Kumar design engineer Bengaluru", "Arun Kumar Three.js", "Arun Kumar Spera"
- **"Design engineer from India":** search engines read this mostly as mechanical/CAD. The entity home has a section titled exactly "Design engineer in India" that defines the software meaning. Realistic goal: page 1 for "design engineer Bengaluru UX", "design engineer India React Figma".
- **"Three.js developer":** the field is crowded and global (Bruno Simon, Awwwards). The real lever is outside the site: post the loader eye to the three.js forum Showcase, Awwwards, X and Reddit r/threejs with a link to kiruk.in. Mentions and links from those communities are what rank in this niche, and the Digital Applied guide reports brand mentions correlate more strongly with AI visibility than backlinks do.

## 5. What you need to do (off the site)

These matter as much as the code. The answer engines got your title wrong because of Peerlist, not because of kiruk.in.

**After the deploy, the same day:**
1. Google Search Console: submit `https://www.kiruk.in/sitemap.xml`, then use URL Inspection → *Request indexing* on `/arun-kumaar-sreenivasan`, `/`, `/work`, `/contact`, `/notebook`.
2. Bing Webmaster Tools: add the site (it can import from Search Console) and submit the sitemap. Then run `npm run indexnow`.
3. Check the schema with the Rich Results Test and validator.schema.org on `/arun-kumaar-sreenivasan`.

**Profiles, this week.** Paste the same bio everywhere and link to `https://www.kiruk.in/arun-kumaar-sreenivasan`:

> Design engineer in Bengaluru, India. Co-founder, director and founding design engineer of Spera.bot (Spero Spera Private Limited). Previously Software Systems Engineer (UX Design Engineering) at HP Inc, 2023–2026. AI UX, design systems, React and Three.js. kiruk.in

| Profile | What to change |
|---|---|
| LinkedIn | Headline and About as above. Experience: HP "Software Systems Engineer (UX Design Engineering)", Aug 2023 – Feb 2026; Spera, Feb 2026 – now, with the company set to Spero Spera Private Limited if it has a page. Website → entity home. |
| Peerlist | Fix "Software Systems Engineer 1" to the same title; end date Feb 2026; add Spera. ChatGPT quoted this profile. |
| Contra | Replace "Creative Developer" with the bio; keep the kiruk.in link. |
| Google Scholar | Change the display name to "Arun Kumaar Sreenivasan (Srinivasan)", update the affiliation, add the homepage URL. |
| GitHub | Name "Arun Kumaar Sreenivasan", bio as above, website → entity home. Pin the kiruk.in repo if it's public. |
| Behance, X, Instagram, DEV.to | Same one-line bio and link. |
| spera.bot | Add `Organization` JSON-LD with `legalName: "Spero Spera Private Limited"` and a `founder` pointing to `https://www.kiruk.in/#person`. Put your name on an About/team page that links to kiruk.in. |

**Optional, bigger levers:**
- **Wikidata item.** The guides call it the most underused entity signal. Only create one with real references (the company register entry, Scholar, the HP or Spera pages); Wikidata deletes self-promotional items without sources.
- **Write about the eye.** One article (DEV.to or your notebook) on "Building a realistic human eye in Three.js TSL on WebGPU, in a Web Worker", linking to kiruk.in. This is the strongest single move for "Three.js developer", and the GEO paper's findings favour detailed, specific write-ups.
- **Ask Spera, Sona College or PeopleGamez** to link your name to kiruk.in anywhere they list you.

## 6. How to measure

- **Search Console → Performance → Queries**, filtered to queries containing "arun", "kumaar", "kiruk", "three.js". Check monthly. Also check **Pages → Indexed**: aim for every sitemap URL indexed within 2–4 weeks.
- **Re-run the baseline table** in section 1 in 4–6 weeks.
- **Ask the answer engines** "Who is Arun Kumaar Sreenivasan?" in ChatGPT, Google AI Mode, Perplexity and Claude, and check four things:
  - HP title and dates
  - Spera named as Spero Spera Private Limited
  - Sona College
  - whether kiruk.in is cited
- Answer engines refresh at different speeds: Perplexity in days, ChatGPT search when Bing recrawls, model memory only at the next training run.

## 7. Known gaps left

- **`/notebook`** still has ~850 characters of text without JavaScript; the essay list is drawn client-side. The essays themselves are fine: each has an `agent.md`.
- **The loader opening** also plays on the entity home on a first visit. Someone arriving from a search result for your name watches the opening before seeing the facts. Bots aren't affected. It's a design call: skipping the opening on `/arun-kumaar-sreenivasan` would make it a faster landing page.
- **The About story** calls the Spera role "co-founder and Design Lead"; the facts call it "Founding Design Engineer". Pick one wording for everywhere.
- **The Peerlist URL** in `sameAs` (`peerlist.io/arunkumaars`) couldn't be opened during the audit (it blocks bots). Confirm it's yours.

## 8. Hiring keywords: freelance, contract and full-time (added 4 Nov 2026)

Goal: show up when an employer, recruiter or business searches for a role, not your name:

- design engineer
- design technologist
- creative developer
- product designer who codes
- freelance design consultant for creative work

### Who ranks today (Firecrawl, India)

| Query | What owns the first page |
|---|---|
| `freelance design engineer India hire` | Freelancer.in, Indeed, Upwork, LinkedIn Jobs, Naukri, Glassdoor. All read as **mechanical** design engineering. |
| `creative developer India portfolio freelance` | Awwwards "Freelance portfolios" collection, Reddit, Upwork, Dribbble, Twine. One personal site: prashantsani.com. |
| `design technologist India` | LinkedIn Jobs, Glassdoor, Indeed Design's article "What is a design technologist?", designtechnologist.club |
| `product designer who codes Bangalore` | Job posts (Sarvam AI, Atomicwork), Indeed, Naukri, Upwork's Bengaluru product designer list, The Manifest |

**What this means:** for hiring searches, Google shows mostly **marketplaces, job boards and lists**, and few personal sites. Ranking for these takes two moves at once:

1. **Your own page that answers each role by name** (built, below). It ranks for the longer versions people actually type: "freelance creative developer Bengaluru", "design technologist India Three.js", "hire product designer who codes India".
2. **A strong profile on the platforms that own the first page**, each linking back to `/hire`. The marketplace profile ranks; your site collects the visit.

For answer engines, a question like "best freelance creative developer in India" gets answered from those same lists and directories. Being listed on them is the AEO move.

### Built on the site

| Change | Where |
|---|---|
| New **`/hire`** page. Title "Hire a Design Engineer & Creative Developer in India \| Kiruk". The h1 names the roles. | `src/app/hire/page.tsx` |
| **Roles I work in:** design engineer, design technologist, creative developer, product designer who codes, freelance design consultant. Each has a one-line definition plus your evidence, so an answer engine can quote "what is X" and "who does X" from the same block. | `src/lib/hire.ts` |
| **Ways to work together:** freelance projects, contract/part-time, full-time roles | same |
| **Services** (8) as `OfferCatalog` → `Service` schema, offered by your `Person`, with area served India and worldwide | same |
| **Proof** list with numbers; **How I work**; 7 hiring FAQs with matching `FAQPage` schema | same |
| `Person` schema: `hasOccupation` lists all five roles; `makesOffer` points at the services | `src/lib/identity.ts` |
| Home title: "Arun Kumaar Sreenivasan — Design Engineer & Creative Developer" | `layout.tsx` |
| Contact title: "Contact & hire"; role keywords added | contact layout, `layout.tsx` |
| "Works as …" line on home, /work, /contact and the profile page. Links to /hire from the profile, /work and the hidden facts blocks. /hire in the sitemap (0.9) and in `llms.txt` / `about.md` as a "Hire him" section. | various |

Checked locally as GPTBot: /hire has 6,813 characters of text, 7 JSON-LD types, 8 services and 7 FAQs. All five role terms appear in the text of home, /hire and the profile page.

### Profiles to set up or fix (these own the hiring first page)

Use the same headline everywhere and link to `https://www.kiruk.in/hire`:

> **Design Engineer & Creative Developer — product designer who codes. Freelance, contract or full-time. Bengaluru, India.**

| Platform | Why | What to do |
|---|---|---|
| **LinkedIn** | Ranks for every role query; recruiters search it first | Headline as above. Turn on **Open to work** (recruiters only, if you don't want the public badge) for Design Engineer, Design Technologist, Creative Developer, Product Designer. Add a **Services** page (UX design, web design, front-end, design consulting). Featured: /hire and the eye. |
| **Upwork** | Its "hire … in Bengaluru" lists rank on page 1 | Profile titled "Design Engineer & Creative Developer (Three.js, React, Figma)". Portfolio: Spera, PRAGS, kiruk.in. |
| **Contra** | Already indexed for you; freelancer-friendly, no fees | Rename "Creative Developer" to the headline; add services and rates. |
| **Awwwards** | Owns "creative developer portfolio" and its "Freelance portfolios" collection | Make a profile and submit kiruk.in for an honourable mention; the eye is the kind of site they feature. |
| **Peerlist** | Indexed and quoted by ChatGPT | Fix the HP title; set "Available for: freelance, full-time". |
| **Wellfound (AngelList), Cutshort, Naukri** | Indian startup and full-time hiring | Profile with the same headline, if you want full-time leads. |
| **Behance, Dribbble** | Design hiring searches; Dribbble's hire tags | "Available for hire" on; projects link to /work. |
| **three.js forum Showcase, r/threejs, DEV.to** | Gets you into "Three.js developer" answers | Post the eye with a short write-up linking to kiruk.in. |

### Realistic expectations

- Bare head terms ("design engineer", "creative developer") are global and job-board heavy. Page 1 there isn't realistic within months.
- Achievable goals in 2–3 months, once indexed and with the profiles linking back:
  - page 1 for **role + India/Bengaluru + freelance/hire** variants
  - your name appearing in AI answers to "freelance creative developer in Bengaluru" and "design technologist India Three.js"
- Track in Search Console: filter queries containing `hire`, `freelance`, `creative developer`, `design technologist`, `design engineer`, and watch /hire's impressions.
