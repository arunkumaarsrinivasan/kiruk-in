import type { Metadata, Viewport } from "next";
import "./globals.css";

import LayoutClientShell from "@/components/layout/LayoutClientShell";
import AnalyticsTracker from "@/components/analytics/AnalyticsTracker";
import { VercelAnalyticsLazy } from "@/components/analytics/VercelAnalyticsLazy";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { DesignEraProvider } from "@/contexts/DesignEraContext";
import { GameModeProvider } from "@/contexts/GameModeContext";
import { ContextBarProvider } from "@/contexts/ContextBarContext";
import { LayoutModeProvider } from "@/contexts/LayoutModeContext";
import { ModuleProvider } from "@/contexts/ModuleContext";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://kiruk.in");

const SITE_NAME = "Kiruk — Arun Kumaar Sreenivasan";
const TITLE = "Kiruk — Design Engineer & AI UX Designer in India";
const DESCRIPTION =
  "Portfolio of Arun Kumaar Sreenivasan (Kiruk), a Bengaluru-based design engineer crafting AI UX, design systems, and playful product experiences in India.";
const OG_IMAGE = `${SITE_URL}/images/dp.jpeg`;

const LAST_MODIFIED = "2026-05-19";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: "%s — Kiruk",
  },
  description: DESCRIPTION,
  applicationName: "Kiruk",
  generator: "Next.js",
  keywords: [
    "design engineer",
    "design engineer India",
    "design engineer Bengaluru",
    "AI UX designer",
    "UX designer India",
    "creative portfolio India",
    "product designer Bengaluru",
    "Figma React engineer",
    "Arun Kumaar Sreenivasan",
    "Kiruk",
    "Kirukism",
    "HP Print AI designer",
    "design systems",
    "AI product design",
  ],
  authors: [
    { name: "Arun Kumaar Sreenivasan", url: SITE_URL },
    { name: "Kiruk", url: SITE_URL },
  ],
  creator: "Arun Kumaar Sreenivasan",
  publisher: "Kiruk",
  category: "Design",
  alternates: {
    canonical: "/",
    types: {
      "application/rss+xml": `${SITE_URL}/api/blog/rss`,
    },
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: TITLE,
    description: DESCRIPTION,
    locale: "en_IN",
    // Image auto-injected by src/app/opengraph-image.tsx (1200x630)
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    creator: "@s_arunkumaar",
    site: "@s_arunkumaar",
    // Image auto-injected by src/app/twitter-image.tsx (falls back to opengraph-image)
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
  formatDetection: { telephone: false, email: false, address: false },
  other: {
    "last-modified": LAST_MODIFIED,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  interactiveWidget: "resizes-content",
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": `${SITE_URL}/#person`,
  name: "Arun Kumaar Sreenivasan",
  alternateName: ["Kiruk", "Arun Kumaar"],
  url: SITE_URL,
  image: OG_IMAGE,
  jobTitle: "Design Engineer & AI UX Designer",
  description: DESCRIPTION,
  worksFor: {
    "@type": "Organization",
    name: "HP Inc.",
    url: "https://www.hp.com",
  },
  address: {
    "@type": "PostalAddress",
    addressLocality: "Bengaluru",
    addressRegion: "Karnataka",
    addressCountry: "IN",
  },
  nationality: { "@type": "Country", name: "India" },
  knowsAbout: [
    "UX Design",
    "AI Product Design",
    "Design Systems",
    "Interaction Design",
    "Front-end Engineering",
    "Figma",
    "React",
    "Next.js",
    "Flutter",
    "Motion Design",
  ],
  knowsLanguage: ["English", "Tamil"],
  sameAs: [
    "https://www.linkedin.com/in/arunkumaarsreenivasan/",
    "https://github.com/arunkumaarsrinivasan",
    "https://www.behance.net/arunkusriniva",
    "https://www.instagram.com/arunum.avan.seyalum/",
    "https://x.com/s_arunkumaar",
  ],
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  url: SITE_URL,
  name: SITE_NAME,
  description: DESCRIPTION,
  inLanguage: "en-IN",
  publisher: { "@id": `${SITE_URL}/#person` },
  dateModified: LAST_MODIFIED,
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_URL}/blog?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: "Kiruk",
  url: SITE_URL,
  logo: OG_IMAGE,
  founder: { "@id": `${SITE_URL}/#person` },
  sameAs: [
    "https://www.linkedin.com/in/arunkumaarsreenivasan/",
    "https://www.instagram.com/arunum.avan.seyalum/",
    "https://x.com/s_arunkumaar",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-IN" suppressHydrationWarning={true} data-antigravity-check="verified">
      <head>
        <link rel="canonical" href={SITE_URL} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </head>
      <body
        className="antialiased"
        data-era="1970"
        suppressHydrationWarning={true}
      >
        {/* Simplified layout - prioritizing magnetic font usage */}
        <ThemeProvider>
          <DesignEraProvider>
            <GameModeProvider>
              <ContextBarProvider>
                <LayoutModeProvider>
                  <ModuleProvider>
                    <AnalyticsTracker />
                    <LayoutClientShell>
                      {children}
                    </LayoutClientShell>
                  </ModuleProvider>
                </LayoutModeProvider>
              </ContextBarProvider>
            </GameModeProvider>
          </DesignEraProvider>
        </ThemeProvider>
        {process.env.VERCEL ? <VercelAnalyticsLazy /> : null}
      </body>
    </html>
  );
}
