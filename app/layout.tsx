import type { Metadata } from "next";
import { Geist, Geist_Mono, Kalam, Caveat, Architects_Daughter } from "next/font/google";
import "./globals.css";
import LayoutClientShell from "../components/layout/LayoutClientShell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const kalam = Kalam({
  variable: "--font-kalam",
  subsets: ["latin"],
  weight: ["300", "400", "700"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const architectsDaughter = Architects_Daughter({
  variable: "--font-architects-daughter",
  subsets: ["latin"],
  weight: ["400"],
});

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${kalam.variable} ${caveat.variable} ${architectsDaughter.variable} antialiased`}
      >
        <LayoutClientShell>
          {children}
        </LayoutClientShell>
      </body>
    </html>
  );
}
