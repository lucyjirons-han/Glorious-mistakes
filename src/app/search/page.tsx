import type { Metadata } from 'next';
import { getSearchLinks } from '@/lib/search-index';
import { pageMetadata } from '@/lib/site';
import { SearchView } from './SearchView';

export const metadata: Metadata = pageMetadata({
  title: 'Search',
  description: 'Search mistakes, lessons, Learn articles and FAQ answers on Glorious Mistakes.',
  path: '/search',
  noindex: true,
});

interface SearchPageProps {
  searchParams: Promise<{ q?: string | string[] }>;
}

/** The query is read here (/search?q=burnt+toast) so the page arrives with results in its HTML. */
export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const initialQuery = typeof q === 'string' ? q : '';
  const { articles, faqs } = await getSearchLinks();

  // Keyed so a new search from the header starts afresh.
  return <SearchView key={initialQuery} initialQuery={initialQuery} articles={articles} faqs={faqs} />;
}
