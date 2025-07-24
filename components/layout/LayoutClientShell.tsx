"use client";

import Navigation from "./navigation";
import AppLoader from "@/components/ui/app-loader";

interface LayoutClientShellProps {
  readonly children: React.ReactNode;
}

export default function LayoutClientShell({ children }: Readonly<LayoutClientShellProps>) {
  return (
    <AppLoader enableLoader={true} loadingDuration={3500}>
      <Navigation />
      {children}
    </AppLoader>
  );
}
