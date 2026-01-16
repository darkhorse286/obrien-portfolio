import { getMarkdownContent, getAllDemonstrations } from '@/lib/markdown';
import Link from 'next/link';
import type { Metadata } from 'next';

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}): Promise<Metadata> {
  const { slug } = await params;
  const { metadata } = await getMarkdownContent(`demonstrations/${slug}.md`);
  
  return {
    title: metadata.title || 'Demonstration',
    description: metadata.description || 'A demonstration of systematic engineering and architectural discipline.',
    openGraph: {
      title: `${metadata.title || 'Demonstration'} | O'Brien & Son`,
      description: metadata.description || 'A demonstration of systematic engineering and architectural discipline.',
      url: `https://www.obrienandson.com/demonstrations/${slug}`,
    },
  };
}

// Tell Next.js which pages to generate at build time
export async function generateStaticParams() {
  const demonstrations = getAllDemonstrations();
  return demonstrations.map((demo) => ({
    slug: demo.slug,
  }));
}

export default async function DemonstrationPage({ 
  params 
}: { 
  params: Promise<{ slug: string }>  // ← Changed: params is now a Promise
}) {
  // Await the params (Next.js 15+ requirement)
  const { slug } = await params;
  
  // Read the markdown file for this demonstration
  const { metadata, contentHtml } = await getMarkdownContent(
    `demonstrations/${slug}.md`
  );
  
  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      {/* Back button */}
      <Link 
        href="/demonstrations"
        className="text-blue-600 hover:text-blue-800 mb-6 inline-block"
      >
        ← Back to Demonstrations
      </Link>
      
      {/* Markdown content */}
      <article 
        className="markdown-content text-lg"
        dangerouslySetInnerHTML={{ __html: contentHtml }}
      />
      
      {/* Live demo link if available */}
      {metadata.demo && (
        <div className="mt-12 p-6 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600 mb-2">Live Demonstration:</p>
          <a 
            href={metadata.demo}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 font-semibold text-lg"
          >
            View Project ARES Demo ↗
          </a>
        </div>
      )}
    </main>
  );
}