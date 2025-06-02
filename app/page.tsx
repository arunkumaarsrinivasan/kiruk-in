import HeroSection from '../components/layout/hero-section';

export default function Home() {
  return (
    <main>
      <HeroSection />
      
      {/* Skills Preview Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              My Approach
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Combining the intuition of analog sketching with the precision of digital AI
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                🎨
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Pen & Paper First</h3>
              <p className="text-gray-600">Every project starts with sketches and scribbles to capture raw ideas and concepts.</p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                🤖
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">AI-Enhanced Design</h3>
              <p className="text-gray-600">Leveraging artificial intelligence to optimize user flows and design patterns.</p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                ✨
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Human-Centered UX</h3>
              <p className="text-gray-600">Creating digital experiences that feel natural and intuitive for real users.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Featured Work Teaser */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Featured Work
            </h2>
            <p className="text-lg text-gray-600">
              A glimpse into my latest projects
            </p>
          </div>
          
          <div className="text-center">
            <div className="inline-block p-8 bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="w-32 h-32 bg-gray-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <span className="text-gray-400 text-sm">Coming Soon</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Case Studies</h3>
              <p className="text-gray-600 mb-4">Detailed breakdowns of my design process</p>
              <a 
                href="/work" 
                className="inline-flex items-center text-gray-900 font-medium hover:underline"
              >
                View All Work →
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
