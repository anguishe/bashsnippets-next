import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export interface FaqItem {
  question: string;
  answer: string;
}

export interface HowToStep {
  name: string;
  text: string;
}

export interface SnippetFrontmatter {
  title?: string;
  description?: string;
  slug?: string;
  tags?: string[];
  quickAnswer?: string;
  faq?: FaqItem[];
  howToSteps?: HowToStep[];
  author?: string;
  datePublished?: string;
  dateModified?: string;
}

const SNIPPETS_DIR = path.join(process.cwd(), 'src/content/snippets');

function stripMarkdownForWordCount(content: string): string {
  return content
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]+`/g, ' ')
    .replace(/[#*_>\[\]()!|-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function getSnippetWordCount(slug: string): number {
  const filePath = path.join(SNIPPETS_DIR, `${slug}.mdx`);

  if (!fs.existsSync(filePath)) {
    return 0;
  }

  const raw = fs.readFileSync(filePath, 'utf8');
  const { content } = matter(raw);
  const text = stripMarkdownForWordCount(content);

  if (!text) {
    return 0;
  }

  return text.split(/\s+/).filter(Boolean).length;
}

export function loadSnippetFrontmatter(slug: string): SnippetFrontmatter {
  const filePath = path.join(SNIPPETS_DIR, `${slug}.mdx`);

  if (!fs.existsSync(filePath)) {
    return {};
  }

  const raw = fs.readFileSync(filePath, 'utf8');
  const { data } = matter(raw);

  return {
    title: typeof data.title === 'string' ? data.title : undefined,
    description:
      typeof data.description === 'string' ? data.description : undefined,
    slug: typeof data.slug === 'string' ? data.slug : undefined,
    tags: Array.isArray(data.tags)
      ? data.tags.filter((tag): tag is string => typeof tag === 'string')
      : undefined,
    quickAnswer:
      typeof data.quickAnswer === 'string' ? data.quickAnswer : undefined,
    faq: Array.isArray(data.faq)
      ? data.faq.filter(
          (item): item is FaqItem =>
            typeof item === 'object' &&
            item !== null &&
            typeof item.question === 'string' &&
            typeof item.answer === 'string',
        )
      : undefined,
    howToSteps: Array.isArray(data.howToSteps)
      ? data.howToSteps.filter(
          (step): step is HowToStep =>
            typeof step === 'object' &&
            step !== null &&
            typeof step.name === 'string' &&
            typeof step.text === 'string',
        )
      : undefined,
    author: typeof data.author === 'string' ? data.author : undefined,
    datePublished:
      typeof data.datePublished === 'string' ? data.datePublished : undefined,
    dateModified:
      typeof data.dateModified === 'string' ? data.dateModified : undefined,
  };
}
