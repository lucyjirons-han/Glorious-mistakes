import { cache } from 'react';
import { FAQ_GROUPS } from '@/app/faq/questions';
import { getArticles } from './learn';
import { faqAnswerText, type SearchLink } from './search';

/**
 * The Learn articles and FAQ answers as search results. Runs on the server (articles are read
 * from disk); the layout hands them to the header's suggestions and the search page.
 */
export const getSearchLinks = cache(async (): Promise<{ articles: SearchLink[]; faqs: SearchLink[] }> => {
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

  return { articles, faqs };
});
