import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

/**
 * robots.txt. Everything may be crawled; /mine and /log are kept out of search results with
 * a noindex tag on the pages themselves (blocking them here would stop search engines from
 * seeing that tag).
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
