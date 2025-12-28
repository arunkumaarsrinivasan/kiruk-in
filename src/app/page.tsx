import dynamic from 'next/dynamic';

// Lazy load the newspaper layout since it's a heavy client component
const NewspaperLayout = dynamic(() => import('@/components/layout/newspaper-layout'), {
  loading: () => (
    <main className="min-h-screen overflow-y-auto flex items-center justify-center">
      <div className="text-sm font-mono">Loading...</div>
    </main>
  ),
  ssr: true, // Keep SSR for SEO
});

export default function Home() {
  return (
    <main className="min-h-screen overflow-y-auto">
      <NewspaperLayout />
    </main>
  );
}
