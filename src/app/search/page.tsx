import type { Metadata } from 'next';
import { FAQ_GROUPS } from '@/app/faq/questions';
import { getArticles } from '@/lib/learn';
import { faqAnswerText, type SearchLink } from '@/lib/search';
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

  const articles: SearchLink[] = (await getArticles()).map((a) => ({
    href: `/learn/${a.slug}`,
    title: a.title,
    summary: a.summary,
    keywords: a.description,
  }));

  const faqs: SearchLink[] = FAQ_GROUPS.flatMap((group) =>
    group.questions.map((question) => {
      const answer = faqAnswerText(question.answer);
      return {
        href: `/faq#${question.id}`,
        title: question.question,
        summary: answer.length > 160 ? `${answer.slice(0, 157).trimEnd()}…` : answer,
        keywords: answer,
      };
    }),
  );

  // Keyed so a new search from the header starts afresh.
  return <SearchView key={initialQuery} initialQuery={initialQuery} articles={articles} faqs={faqs} />;
}
