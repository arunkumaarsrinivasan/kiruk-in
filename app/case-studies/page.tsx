export default function CaseStudies() {
  return (
    <main className="pt-16">
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-6xl mx-auto px-6 sm:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Case Studies
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Deep dives into my design process, from initial sketches to final implementations.
            </p>
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
