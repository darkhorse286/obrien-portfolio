import { getMarkdownContent } from '@/lib/markdown';

export default async function About() {
  const { contentHtml } = await getMarkdownContent('about.md');
  
  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <article 
        className="prose prose-lg max-w-none
          prose-headings:font-bold
          prose-h1:text-4xl prose-h1:mb-8
          prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:text-gray-900
          prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-6
          prose-strong:text-gray-900 prose-strong:font-semibold
          prose-a:text-blue-600 prose-a:underline prose-a:decoration-2 prose-a:underline-offset-2 hover:prose-a:text-blue-800
          prose-ul:my-6 prose-ul:space-y-2
          prose-li:text-gray-700 prose-li:leading-relaxed
          prose-hr:my-12 prose-hr:border-gray-300
          prose-em:text-gray-600 prose-em:not-italic"
        dangerouslySetInnerHTML={{ __html: contentHtml }}
      />
    </main>
  );
}