import type { Metadata, Viewport } from "next";
import "./globals.css";

import LayoutClientShell from "@/components/layout/LayoutClientShell";
import CustomCursor from "@/components/ui/CustomCursor";
import { CursorProvider } from "@/components/ui/CursorContext";
import AnalyticsTracker from "@/components/analytics/AnalyticsTracker";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { DesignEraProvider } from "@/contexts/DesignEraContext";
import { GameModeProvider } from "@/contexts/GameModeContext";
import ThemeLayout from "@/components/layout/ThemeLayout";

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
    <html lang="en">
      <body className="antialiased">
        {/* Simplified layout - prioritizing magnetic font usage */}
        <ThemeProvider>
          <DesignEraProvider>
            <GameModeProvider>
              <ThemeLayout>
                <CursorProvider>
                  <CustomCursor />
                  <AnalyticsTracker />
                  <LayoutClientShell>
                    {children}
                  </LayoutClientShell>
                </CursorProvider>
              </ThemeLayout>
            </GameModeProvider>
          </DesignEraProvider>
        </ThemeProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
