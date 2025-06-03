import HeroSection from '../components/layout/hero-section';
import ScribbleAnimation from '../components/three/simple-scribble';

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
            <div className="grid md:grid-cols-3 gap-8">            <div className="relative group">
              {/* Mini Three.js Preview */}
              <div className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity duration-300 rounded-lg overflow-hidden">
                <ScribbleAnimation className="w-full h-full" />
              </div>
              <div className="relative text-center p-6 bg-white/80 backdrop-blur-sm rounded-lg">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  🎨
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Pen & Paper First</h3>
                <p className="text-gray-600">Every project starts with sketches and scribbles to capture raw ideas and concepts.</p>
              </div>
            </div>
              <div className="relative group">
              {/* Mini Three.js Preview */}
              <div className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity duration-300 rounded-lg overflow-hidden">
                <ScribbleAnimation className="w-full h-full" />
              </div>
              <div className="relative text-center p-6 bg-white/80 backdrop-blur-sm rounded-lg">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  🤖
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">AI-Enhanced Design</h3>
                <p className="text-gray-600">Leveraging artificial intelligence to optimize user flows and design patterns.</p>
              </div>
            </div>
              <div className="relative group">
              {/* Mini Three.js Preview */}
              <div className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity duration-300 rounded-lg overflow-hidden">
                <ScribbleAnimation className="w-full h-full" />
              </div>
              <div className="relative text-center p-6 bg-white/80 backdrop-blur-sm rounded-lg">
                <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  ✨
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Human-Centered UX</h3>
                <p className="text-gray-600">Creating digital experiences that feel natural and intuitive for real users.</p>
              </div>
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
      
      {/* Interactive CTA Section */}
      <section className="relative py-20 bg-gradient-to-br from-gray-900 to-gray-800 overflow-hidden">        {/* Three.js Interactive Background */}
        <div className="absolute inset-0 opacity-30">
          <ScribbleAnimation className="w-full h-full" />
        </div>
        
        <div className="relative max-w-4xl mx-auto px-6 sm:px-8 text-center z-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to Start Scribbling?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Let's transform your ideas from sketches to stunning digital experiences. 
            The best projects start with a simple conversation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/contact" 
              className="bg-white text-gray-900 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Get In Touch
            </a>
            <a 
              href="/work" 
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-gray-900 transition-colors"
            >
              View My Work
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
