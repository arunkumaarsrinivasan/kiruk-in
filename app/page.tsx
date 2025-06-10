import HeroSection from '../components/layout/hero-section';
import InteractivePortfolioSection from '../components/interactive/interactive-portfolio-section';

export default function Home() {
  return (
    <main className="fixed inset-0 overflow-hidden">
      <HeroSection />
      <InteractivePortfolioSection className="absolute inset-0 top-0" />
    </main>
  );
}
