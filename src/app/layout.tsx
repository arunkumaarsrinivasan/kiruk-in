import type { Metadata, Viewport } from "next";
import "./globals.css";

import LayoutClientShell from "@/components/layout/LayoutClientShell";
import AnalyticsTracker from "@/components/analytics/AnalyticsTracker";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { DesignEraProvider } from "@/contexts/DesignEraContext";
import { GameModeProvider } from "@/contexts/GameModeContext";
import { ContextBarProvider } from "@/contexts/ContextBarContext";
import { LayoutModeProvider } from "@/contexts/LayoutModeContext";

export const metadata: Metadata = {
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
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}

