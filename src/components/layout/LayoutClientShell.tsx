"use client";

import Navigation from "./navigation";
import AppLoader from "@/components/ui/app-loader";

interface LayoutClientShellProps {
  readonly children: React.ReactNode;
}

export default function LayoutClientShell({ children }: Readonly<LayoutClientShellProps>) {
  return (
    <AppLoader enableLoader={true} loadingDuration={3500}>
      {/* Skip Links for Accessibility */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:text-sm focus:no-underline"
        tabIndex={1}
      >
        Skip to main content
      </a>
      <a 
        href="#navigation" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-32 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:text-sm focus:no-underline"
        tabIndex={2}
      >
        Skip to navigation
      </a>
      <Navigation />
      <main id="main-content" tabIndex={-1}>
        {children}
      </main>
    </AppLoader>
  );
}
