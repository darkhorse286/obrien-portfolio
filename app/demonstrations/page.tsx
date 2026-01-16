import { getAllDemonstrations } from '@/lib/markdown';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Demonstrations",
  description: "Production-quality engineering demonstrations written in QED format. Backend-first architecture, security patterns, and systematic problem-solving.",
  openGraph: {
    title: "Demonstrations | O'Brien & Son",
    description: "Production-quality engineering demonstrations written in QED format.",
    url: "https://www.obrienandson.com/demonstrations",
  },
};

export default function Demonstrations(){
    const demonstrations = getAllDemonstrations();
    return(
        <main className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold mb-4">Demonstrations</h1>
      
      <p className="text-xl text-gray-600 mb-12">
        Production-quality engineering applied to interesting problems. Each demonstration 
        is written in QED (mathematical proof) format to show systematic thinking and 
        architectural discipline.
      </p>

      <div className="space-y-8">
        {demonstrations.map((demo) => (
          <article 
            key={demo.slug} 
            className="border border-gray-200 rounded-lg p-8 hover:border-gray-400 transition"
          >
            <h2 className="text-2xl font-bold mb-2">
              {demo.metadata.title}
            </h2>
            
            {demo.metadata.description && (
              <p className="text-gray-600 mb-4">
                {demo.metadata.description}
              </p>
            )}

            <div className="flex gap-4 text-sm text-gray-500 mb-6">
              {demo.metadata.date && <span>📅 {demo.metadata.date}</span>}
              {demo.metadata.tech && <span>⚙️ {demo.metadata.tech}</span>}
            </div>

            <div className="flex gap-4">
              <Link 
                href={`/demonstrations/${demo.slug}`}
                className="bg-gray-900 text-white px-6 py-2 rounded hover:bg-gray-700 transition"
              >
                Read the Proof →
              </Link>
              
              {demo.metadata.demo && (
                <a 
                  href={demo.metadata.demo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border border-gray-900 text-gray-900 px-6 py-2 rounded hover:bg-gray-50 transition"
                >
                  View Live Demo ↗
                </a>
              )}
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}