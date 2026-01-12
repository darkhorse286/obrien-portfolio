import { getMarkdownContent } from "@/lib/utils";
export default async function About(){
    const { contentHtml, metadata } = await getMarkdownContent('about.md');
    return (
        <div className="max-w-4xl mx-auto px-6 py-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">{metadata.title}</h1>
            <div
                className="prose prose-lg prose-blue mx-auto"
                dangerouslySetInnerHTML={{ __html: contentHtml }}
            />
        </div>
    );
}