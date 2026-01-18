import dynamic from 'next/dynamic';

// Lazy load the wireframe manual layout since it's a heavy client component
const WireframeManualLayout = dynamic(
  () => import('@/components/layout/WireframeManualLayout'),
  {
    loading: () => (
      <div className="h-screen flex items-center justify-center bg-[var(--bg-main)]">
        <div className="text-sm font-mono" style={{ color: 'var(--accent-color)' }}>
          Loading dossier...
        </div>
      </div>
    ),
    ssr: true, // Keep SSR for SEO
  }
);

export default function Home() {
  return <WireframeManualLayout />;
}

