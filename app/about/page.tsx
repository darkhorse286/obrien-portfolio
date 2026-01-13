import { getMarkdownContent } from '@/lib/markdown';

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