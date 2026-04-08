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

const defaultSiteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(defaultSiteUrl),
  title: "Kiruk | AI + UX Designer Portfolio",
  description: "Portfolio of an AI-driven UX designer who believes in the power of pen and paper. Showcasing the intersection of artificial intelligence and user experience design.",
  keywords: "AI, UX Design, Portfolio, User Experience, Artificial Intelligence, Design Thinking",
  authors: [{ name: "Kiruk" }],
  openGraph: {
    title: "Kiruk | AI + UX Designer Portfolio",
    description: "Scribbles that turn into digital experiences",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Avoids extra mobile tap delay when the virtual keyboard / widgets resize the layout
  interactiveWidget: "resizes-content",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true} data-antigravity-check="verified">
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
                  <AnalyticsTracker />
                  <LayoutClientShell>
                    {children}
                  </LayoutClientShell>
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

