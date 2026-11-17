import type { Metadata } from 'next';
import Link from 'next/link';
import { ArticleCard } from '@/components/ArticleCard';
import { getArticles } from '@/lib/learn';
import { pageMetadata } from '@/lib/site';

export const metadata: Metadata = pageMetadata({
  title: 'Learn',
  description:
    'Short, friendly reads on getting over embarrassing moments, learning from your mistakes and the famous stuff-ups that changed the world.',
  path: '/learn',
});

export default async function LearnPage() {
  const articles = await getArticles();

  return (
    <>
      <div className="container page learn">
        <header className="page-header">
          <p className="eyebrow">Learn</p>
          <h1 className="page-header__title">Getting good at getting it wrong</h1>
          <p className="page-header__lead">
            Short, friendly reads about stuffing up, laughing it off and keeping the lesson. No
            lectures, promise.
          </p>
        </header>

        <div className="card-grid article-grid">
          {articles.map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </div>
      </div>

      <section className="section about__cta" aria-labelledby="learn-cta">
        <div className="container">
          <div className="cta-band">
            <h2 id="learn-cta" className="cta-band__title">
              Got a lesson of your own?
            </h2>
            <p>Two questions: what happened, and what did you take from it?</p>
            <Link href="/log" className="btn btn--accent btn--lg">
              Log a mistake
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
