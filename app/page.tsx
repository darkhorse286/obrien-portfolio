import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-[85vh]">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-amber-50 via-white to-gray-50 py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="mb-6">
            <span className="inline-block text-sm font-semibold text-amber-700 bg-amber-100 px-4 py-2 rounded-full mb-4">
              EST. 1986 — 40 YEARS OF BUILDING THINGS PROPERLY
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
            O'Brien & Son
          </h1>
          
          <p className="text-2xl md:text-3xl text-gray-700 mb-8 font-light leading-relaxed max-w-3xl">
            Where quality craftsmanship meets software architecture. A workshop for building 
            production systems with the same attention to detail that built our reputation 
            in exterior remodeling.
          </p>

          <div className="max-w-3xl mb-12">
            <p className="text-lg text-gray-600 leading-relaxed">
              In 1986, my mother founded O'Brien & Son to build quality into every project. 
              For four decades, that meant windows, siding, gutters, shutters, and lasting craftsmanship. Today, 
              the name continues, but the materials have changed. <strong className="text-gray-900">This 
              workshop is where backend architecture, security patterns, and production systems are 
              designed, built, and refined.</strong>
            </p>
          </div>

          <div className="flex gap-4 flex-wrap">
            <Link 
              href="/demonstrations" 
              className="bg-gray-900 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-700 transition shadow-lg inline-flex items-center gap-2"
            >
              View the Work
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link 
              href="/about" 
              className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-lg text-lg font-semibold hover:border-gray-900 hover:text-gray-900 transition"
            >
              The Story
            </Link>
          </div>
        </div>
      </div>

      {/* Workshop Principles */}
      <div className="bg-white py-16 border-y border-gray-200">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-12 text-center text-gray-900">
            Workshop Philosophy
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Security as Architecture</h3>
              <p className="text-gray-600">
                Authentication, authorization, and data protection are design decisions, not afterthoughts. 
                Built in from the foundation.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gray-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Backend-First Development</h3>
              <p className="text-gray-600">
                Business logic lives in services, not scattered across UI components. Complete APIs 
                before frontend work begins.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gray-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Time for Quality</h3>
              <p className="text-gray-600">
                Every hour in design saves five in refactoring. Proper upfront work prevents 
                architectural debt that cripples projects later.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Work */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Featured Work</h2>
          <Link 
            href="/demonstrations"
            className="text-gray-600 hover:text-gray-900 font-semibold inline-flex items-center gap-2"
          >
            View All
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>

        {/* Project ARES Showcase */}
        <div className="border-2 border-gray-200 rounded-xl overflow-hidden hover:border-gray-400 transition">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 border-b-2 border-gray-200">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="inline-block text-xs font-bold text-green-700 bg-green-100 px-3 py-1 rounded-full mb-3">
                  PRODUCTION
                </span>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Project ARES: Backend-First Architecture
                </h3>
                <p className="text-gray-600">
                  Multi-tenant athlete management platform · 100+ API endpoints · ASP.NET Core 8
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-8 bg-white">
            <div className="mb-6">
              <p className="text-lg text-gray-700 mb-4">
                <strong className="text-gray-900">The Challenge:</strong> Build a production-ready, 
                multi-tenant platform where business logic is complete at the API layer, making frontend 
                development a mechanical exercise rather than an architectural challenge.
              </p>
              <p className="text-gray-600">
                Written as a mathematical proof demonstrating systematic problem decomposition, 
                architectural discipline, and execution capability. Complete backend implementation 
                with zero refactoring required during UI development.
              </p>
            </div>

            <div className="flex gap-4">
              <Link 
                href="/demonstrations/project-ares"
                className="bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition"
              >
                Read the Full Demonstration
              </Link>
              <a 
                href="https://projectareslax-web-f6g3aqcsctfpgncw.centralus-01.azurewebsites.net/"
                target="_blank"
                rel="noopener noreferrer"
                className="border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:border-gray-900 hover:text-gray-900 transition inline-flex items-center gap-2"
              >
                Live Demo
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* In Progress Note */}
        <div className="mt-8 p-6 bg-amber-50 border-l-4 border-amber-400 rounded-r-lg">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-semibold text-amber-900 mb-1">Active Workshop</p>
              <p className="text-amber-800">
                This site is itself under active development. New demonstrations, refinements to existing 
                work, and additional architectural examples are added as they reach production quality.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* About/Contact CTA */}
      <div className="bg-gray-900 text-white py-16">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">
            The Same Standards. Different Materials.
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            O'Brien & Son built its reputation on quality that lasts. That commitment continues—now 
            applied to software architecture, security-conscious design, and production systems.
          </p>
          
          <div className="flex gap-4 justify-center flex-wrap">
            <Link 
              href="/about"
              className="bg-white text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              Read the Full Story
            </Link>
            <Link 
              href="/contact"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-gray-900 transition"
            >
              Start a Conversation
            </Link>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-700 text-sm text-gray-400">
            <p>
              <strong className="text-gray-200">Liam O'Brien</strong> — Senior Solutions Architect for Security
            </p>
            <p className="mt-2">
              Backend-first architecture · Security as design · Systems built to last
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}