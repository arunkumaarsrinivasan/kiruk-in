import dynamic from 'next/dynamic';

// Lazy load the newspaper layout since it's a heavy client component
const NewspaperLayout = dynamic(() => import('@/components/layout/newspaper-layout'), {
  loading: () => (
    <div className="h-full flex items-center justify-center">
      <div className="text-sm font-mono">Loading...</div>
    </div>
  ),
  ssr: true, // Keep SSR for SEO
});

export default function Home() {
  // Note: This is wrapped by LayoutClientShell's <main> with paddingTop: 120px
  // So we use calc(100vh - 120px) to account for the header
  return <NewspaperLayout />;
}
