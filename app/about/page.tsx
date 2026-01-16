import { getMarkdownContent } from '@/lib/markdown';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "About",
  description: "The O'Brien & Son story - from exterior remodeling to software architecture. 40 years of building things properly, now applied to production systems.",
  openGraph: {
    title: "About | O'Brien & Son",
    description: "The O'Brien & Son story - from exterior remodeling to software architecture.",
    url: "https://www.obrienandson.com/about",
  },
};

export default async function About() {
  const { contentHtml } = await getMarkdownContent('about.md');
  
  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <article 
        className="markdown-content text-lg"
        dangerouslySetInnerHTML={{ __html: contentHtml }}
      />
    </main>
  );
}