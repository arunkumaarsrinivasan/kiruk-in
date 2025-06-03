import ScribbleAnimation from '@/components/three/simple-scribble';

export default function CaseStudies() {
  return (
    <main className="pt-16">
      {/* Hero Section with Project Showcase */}
      <section className="relative py-20 bg-gradient-to-br from-gray-50 to-white overflow-hidden">        {/* Three.js Project Visualization Background */}
        <div className="absolute inset-0 opacity-20">
          <ScribbleAnimation className="w-full h-full" />
        </div>
        
        <div className="relative max-w-6xl mx-auto px-6 sm:px-8 z-10">
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Case Studies
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Deep dives into my design process, from initial sketches to final implementations.
            </p>
          </div>
            {/* Interactive Project Showcase */}
          <div className="relative h-96 mb-20 rounded-xl overflow-hidden bg-gradient-to-br from-purple-50 via-blue-50 to-green-50">
            <ScribbleAnimation className="w-full h-full opacity-70" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center bg-white/90 backdrop-blur-sm p-8 rounded-lg shadow-lg max-w-lg">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Creative Scribbling Space</h2>
                <p className="text-gray-600 mb-4">
                  This interactive canvas represents my design process. Click and drag to create scribbles
                  that mirror how each project begins - with simple sketches and creative exploration.
                </p>
                <p className="text-sm text-gray-500">
                  Click and drag above to create your own design scribbles
                </p>
              </div>
            </div>
          </div>
          
          {/* Coming Soon */}
          <div className="text-center py-20">
            <div className="inline-block p-12 bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="w-32 h-32 bg-gray-100 rounded-xl mx-auto mb-6 flex items-center justify-center">
                <span className="text-gray-400 text-lg">📚</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Case Studies In Progress</h2>
              <p className="text-gray-600 mb-6 max-w-md">
                I'm documenting detailed case studies that showcase my design thinking process, 
                from problem discovery to solution validation.
              </p>
              <div className="text-left max-w-sm mx-auto">
                <h3 className="font-semibold text-gray-900 mb-2">What to expect:</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Problem definition & user research</li>
                  <li>• Sketching & ideation process</li>
                  <li>• AI-enhanced design decisions</li>
                  <li>• Prototyping & user testing</li>
                  <li>• Implementation & results</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
