import type { MetadataRoute } from 'next';
import { getArticles } from '@/lib/learn';
import { getExampleMistakes } from '@/lib/examples';
import { SITE_URL } from '@/lib/site';

/**
 * The sitemap at /sitemap.xml. Learn articles are added automatically.
 * /mine and /log are left out on purpose: they're personal pages marked noindex.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [articles, examples] = await Promise.all([getArticles(), getExampleMistakes()]);

  const pages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/feed`, changeFrequency: 'daily', priority: 0.8 },
    { url: `${SITE_URL}/learn`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/faq`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/about`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/guidelines`, changeFrequency: 'yearly', priority: 0.4 },
  ];

  const articlePages: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${SITE_URL}/learn/${a.slug}`,
    lastModified: a.updated ?? a.published,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  const mistakePages: MetadataRoute.Sitemap = examples.map((m) => ({
    url: `${SITE_URL}/mistakes/${encodeURIComponent(m.id)}`,
    changeFrequency: 'yearly',
    priority: 0.3,
  }));

  return [...pages, ...articlePages, ...mistakePages];
}
