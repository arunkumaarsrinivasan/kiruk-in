export default function StudioLayout({ children }: { children: React.ReactNode }) {
  // Pen-and-paper desk only — era isolation lives on `.studio-desk` in LayoutClientShell.
  return <div className="relative min-h-screen">{children}</div>
}
