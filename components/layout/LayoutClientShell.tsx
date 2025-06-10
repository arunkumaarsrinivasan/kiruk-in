"use client";

import Navigation from "./navigation";

export default function LayoutClientShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navigation />
      {children}
    </>
  );
}
