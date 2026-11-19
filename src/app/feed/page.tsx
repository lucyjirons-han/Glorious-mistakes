import type { Metadata } from 'next';
import { isCategoryId } from '@/lib/constants';
import { pageMetadata } from '@/lib/site';
import { FeedView } from './FeedView';

export const metadata: Metadata = pageMetadata({
  title: 'Public feed',
  description: 'Real stuff-ups from real humans. React with “been there” when one hits close to home.',
  path: '/feed',
});

interface FeedPageProps {
  searchParams: Promise<{ category?: string | string[] }>;
}

/**
 * The category is read here on the server (/feed?category=food), so the page arrives with the
 * feed already in the HTML. Reading it in the browser with useSearchParams() would make Next
 * pre-render only an empty placeholder.
 */
export default async function FeedPage({ searchParams }: FeedPageProps) {
  const { category } = await searchParams;
  const initialCategory = typeof category === 'string' && isCategoryId(category) ? category : 'all';
  // Keyed so following a link to another category (e.g. a card's category tag) starts afresh.
  return <FeedView key={initialCategory} initialCategory={initialCategory} />;
}
