export default function Work() {
  return (
    <main className="pt-16">
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-6xl mx-auto px-6 sm:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              My Work
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              A collection of projects where AI meets UX design, each one starting with a simple scribble.
            </p>
          </div>
          
          {/* Coming Soon */}
          <div className="text-center py-20">
            <div className="inline-block p-12 bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="w-32 h-32 bg-gray-100 rounded-xl mx-auto mb-6 flex items-center justify-center">
                <span className="text-gray-400 text-lg">🎨</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Portfolio Coming Soon</h2>
              <p className="text-gray-600 mb-6 max-w-md">
                I'm currently curating my best work and case studies. 
                Each project will showcase the journey from initial scribbles to final digital experiences.
              </p>
              <p className="text-sm text-gray-500">
                Expected launch: Coming Soon
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
