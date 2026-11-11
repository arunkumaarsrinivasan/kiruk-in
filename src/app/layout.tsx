import type { Metadata, Viewport } from "next";
import "@fontsource/architects-daughter/latin-400.css";
import "@fontsource/nothing-you-could-do/latin-400.css";
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
import { SHARE_IMAGE, SITE_URL } from "@/lib/site";
import { PROFILES, personJsonLd as buildPersonJsonLd } from "@/lib/identity";
import { TUBE_BOOT_CSS, TUBE_BOOT_SCRIPT } from "@/components/ui/loader/tube/boot";

const SITE_NAME = "Kiruk Studio — Arun Kumaar Sreenivasan";
const TITLE = "Arun Kumaar Sreenivasan — Design Engineer & Creative Developer";
const DESCRIPTION =
  "Arun Kumaar Sreenivasan (Kiruk) is a design engineer in Bengaluru, India: founding design engineer and design lead at Spera.bot, ex-HP Inc. AI UX, design systems, React, Three.js and WebGPU.";
const OG_IMAGE = `${SITE_URL}/images/dp.jpeg`;

const LAST_MODIFIED = "2026-11-04";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: "%s — Arun Kumaar Sreenivasan",
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
    "Arun Kumaar",
    "Three.js developer India",
    "freelance design engineer India",
    "design technologist India",
    "creative developer India",
    "product designer who codes",
    "freelance design consultant Bengaluru",
    "WebGPU developer",
    "creative developer Bengaluru",
    "Kiruk",
    "Kiruk Studio",
    "Kirukism",
    "Spera.bot designer",
    "HP Print AI",
    "design systems",
    "AI product design",
  ],
  authors: [
    { name: "Arun Kumaar Sreenivasan", url: SITE_URL },
    { name: "Kiruk", url: SITE_URL },
  ],
  creator: "Arun Kumaar Sreenivasan",
  publisher: "Kiruk Studio",
  category: "Design",
  alternates: {
    canonical: "/",
    types: {
      "application/rss+xml": `${SITE_URL}/feed.xml`,
    },
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: TITLE,
    description: DESCRIPTION,
    locale: "en_IN",
    images: [SHARE_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    creator: "@s_arunkumaar",
    site: "@s_arunkumaar",
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
  formatDetection: { telephone: false, email: false, address: false },
  other: {
    "last-modified": LAST_MODIFIED,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  interactiveWidget: "resizes-content",
};

const personJsonLd = buildPersonJsonLd(OG_IMAGE, DESCRIPTION);

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
      urlTemplate: `${SITE_URL}/notebook?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: "Kiruk Studio",
  url: SITE_URL,
  logo: OG_IMAGE,
  founder: { "@id": `${SITE_URL}/#person` },
  sameAs: PROFILES.map((p) => p.url),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-IN" suppressHydrationWarning={true} data-antigravity-check="verified">
      <head>
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
        <link rel="alternate" type="text/plain" href="/llms.txt" title="Plain-text summary of this site" />
        {/* the first-visit opening's first frame, before the app has loaded (loader/tube/boot.ts) */}
        {process.env.NEXT_PUBLIC_SPLASH_LOADER !== "false" && (
          <>
            <style dangerouslySetInnerHTML={{ __html: TUBE_BOOT_CSS }} />
            <script dangerouslySetInnerHTML={{ __html: TUBE_BOOT_SCRIPT }} />
          </>
        )}
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
