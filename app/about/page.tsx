export default function About() {
  return (
    <main className="pt-16">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-4xl mx-auto px-6 sm:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              About Kiruk
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The story behind the scribbles and the designer who believes in the power of pen, paper, and artificial intelligence.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6 sm:px-8">
          <div className="prose prose-lg max-w-none">
            <div className="grid md:grid-cols-2 gap-12 items-start mb-16">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">The Philosophy</h2>
                <p className="text-gray-600 mb-4">
                  In a world increasingly dominated by digital interfaces, I believe the best user experiences still begin with the most analog of tools: a pen and paper.
                </p>
                <p className="text-gray-600 mb-4">
                  "Kiruk" means scribble in my native language, and it perfectly captures my design philosophy. Every great digital product starts with rough sketches, quick ideations, and the free-flowing creativity that only comes from putting pen to paper.
                </p>
                <p className="text-gray-600">
                  But I don't stop at traditional methods. I leverage AI to enhance, optimize, and scale these human-centered insights into exceptional digital experiences.
                </p>
              </div>
              
              <div className="bg-gray-50 p-8 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">My Toolkit</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">✏️</span>
                    <span className="text-gray-700">Pen & Paper Sketching</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">🎨</span>
                    <span className="text-gray-700">Figma & Design Systems</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">🤖</span>
                    <span className="text-gray-700">AI-Powered Design Tools</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">📊</span>
                    <span className="text-gray-700">User Research & Analytics</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">⚡</span>
                    <span className="text-gray-700">Rapid Prototyping</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-16">
              <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">My Process</h2>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🔍</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Research & Discovery</h3>
                  <p className="text-gray-600 text-sm">Understanding users, business goals, and technical constraints through empathy and analysis.</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">✏️</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Sketch & Ideate</h3>
                  <p className="text-gray-600 text-sm">Rapid ideation through sketching, wireframing, and exploring multiple solution paths.</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🚀</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">AI-Enhanced Design</h3>
                  <p className="text-gray-600 text-sm">Using AI tools to optimize designs, generate variations, and validate user experience decisions.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
