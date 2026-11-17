import { Clock } from 'lucide-react';
import Link from 'next/link';
import type { Article } from '@/lib/learn';
import { Icon } from './Icon';

interface ArticleCardProps {
  article: Pick<Article, 'slug' | 'title' | 'summary' | 'readingMinutes'>;
  /** The heading level that fits where the card sits on the page. */
  headingLevel?: 'h2' | 'h3';
}

/** A Learn article on the index page and in "Keep reading". The whole card is clickable. */
export function ArticleCard({ article, headingLevel: Heading = 'h2' }: ArticleCardProps) {
  return (
    <article className="card article-card">
      <Heading className="card__title article-card__title">
        <Link href={`/learn/${article.slug}`} className="card__link">
          {article.title}
        </Link>
      </Heading>
      <p className="article-card__summary">{article.summary}</p>
      <p className="article-card__meta">
        <Icon icon={Clock} size={16} /> {article.readingMinutes} min read
      </p>
    </article>
  );
}
