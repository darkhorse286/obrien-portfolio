import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import remarkGfm from 'remark-gfm';
import { metadata } from '@/app/layout';

const contentDirectory = path.join(process.cwd(), 'content');

/* 
* Reads markdown file from content directory and returns its metadata and HTML content.
*/

export async function getMarkdownContent(filepath: string) {
    const fullPath = path.join(contentDirectory, filepath);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    // Parse frontmatter and content
    const {data, content} = matter(fileContents);

    // Convert markdown to HTML
    const processedContent = await remark()
        .use(remarkGfm)
        .use(html, { sanitize: false })
        .process(content);
    const contentHtml = processedContent
        .toString()
        .replace(/<table>/g, '<div class="table-wrapper"><table>')
        .replace(/<\/table>/g, '</table></div>');

    return{
        metadata:data,
        contentHtml,
    };
}

/*
* Lists all demonstration markdown files.
*/

export function getAllDemonstrations(){
    const demonstrationsDirectory = path.join(contentDirectory, 'demonstrations');

    // Check if directory exists
    if(!fs.existsSync(demonstrationsDirectory)){
        return [];
    }
    const fileNames = fs.readdirSync(demonstrationsDirectory);
    return fileNames
        .filter(fileName => fileName.endsWith('.md'))
        .map(fileName => {
            const slug = fileName.replace(/\.md$/, '');
            const fullPath = path.join(demonstrationsDirectory, fileName);
            const fileContents = fs.readFileSync(fullPath, 'utf8');
            const {data} = matter(fileContents);
            return {
                slug,
                metadata: data,
            };
        });
}