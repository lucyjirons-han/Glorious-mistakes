import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import type { ComponentType } from 'react';

/**
 * The Learn articles.
 *
 * Each article is one Markdown file in src/content/learn. The file name is the web address:
 * how-to-learn-from-your-mistakes.mdx is shown at /learn/how-to-learn-from-your-mistakes.
 * Each file starts with a `meta` block (title, summary and so on); see ArticleMeta below.
 *
 * To add an article, copy an existing file, rename it and change the words. It appears on
 * /learn, gets its own page and joins the sitemap automatically. Reading time is worked out
 * from the word count.
 *
 * This runs only while the site is built, so reading files from disk here is fine.
 */

export interface ArticleMeta {
  /** The headline, shown as the page's H1 and in search results. */
  title: string;
  /** One line for the card on /learn. */
  summary: string;
  /** The search result and link preview description (aim for 120–155 characters). */
  description: string;
  /** First published, as YYYY-MM-DD. */
  published: string;
  /** Last meaningful update, as YYYY-MM-DD. Leave out if never updated. */
  updated?: string;
  /** Slugs of other articles to suggest at the end. */
  related?: string[];
  /** Order on /learn: lower numbers come first. */
  order?: number;
}

export interface Article extends ArticleMeta {
  slug: string;
  readingMinutes: number;
}

const CONTENT_DIR = path.join(process.cwd(), 'src', 'content', 'learn');
const WORDS_PER_MINUTE = 220;

function slugs(): string[] {
  return readdirSync(CONTENT_DIR)
    .filter((file) => file.endsWith('.mdx'))
    .map((file) => file.replace(/\.mdx$/, ''));
}

/** Counts the words a reader actually reads: no meta block, link addresses or markup. */
function readingMinutes(source: string): number {
  const text = source
    .replace(/export const meta[\s\S]*?\n\};?\n/, ' ')
    .replace(/\]\([^)]*\)/g, ']')
    .replace(/[#*_>`[\]|-]/g, ' ');
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

async function loadModule(slug: string) {
  return (await import(`@/content/learn/${slug}.mdx`)) as {
    default: ComponentType;
    meta: ArticleMeta;
  };
}

export async function getArticles(): Promise<Article[]> {
  const articles = await Promise.all(slugs().map((slug) => getArticle(slug)));
  return articles
    .filter((a): a is Article => a !== null)
    .sort((a, b) => (a.order ?? 99) - (b.order ?? 99) || b.published.localeCompare(a.published));
}

export async function getArticle(slug: string): Promise<Article | null> {
  if (!slugs().includes(slug)) return null;
  const { meta } = await loadModule(slug);
  const source = readFileSync(path.join(CONTENT_DIR, `${slug}.mdx`), 'utf8');
  return { ...meta, slug, readingMinutes: readingMinutes(source) };
}

export async function getArticleBody(slug: string): Promise<ComponentType> {
  return (await loadModule(slug)).default;
}
