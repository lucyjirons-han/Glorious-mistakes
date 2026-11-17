import type { Metadata } from 'next';
import { ArrowLeft, Clock } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArticleCard } from '@/components/ArticleCard';
import { Icon } from '@/components/Icon';
import { formatDate } from '@/lib/constants';
import { getArticle, getArticleBody, getArticles } from '@/lib/learn';
import { jsonLd, pageMetadata, SITE_NAME, SITE_URL } from '@/lib/site';

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

// Every article is built ahead of time; any other /learn/... address is a 404.
export const dynamicParams = false;

export async function generateStaticParams() {
  return (await getArticles()).map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return {};
  return pageMetadata({
    title: article.title,
    description: article.description,
    path: `/learn/${slug}`,
    openGraph: {
      type: 'article',
      publishedTime: article.published,
      modifiedTime: article.updated ?? article.published,
    },
  });
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();

  const Body = await getArticleBody(slug);
  const all = await getArticles();
  const related = (article.related ?? [])
    .map((s) => all.find((a) => a.slug === s))
    .filter((a) => a !== undefined)
    .slice(0, 2);

  const url = `${SITE_URL}/learn/${slug}`;
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    datePublished: article.published,
    dateModified: article.updated ?? article.published,
    inLanguage: 'en-AU',
    image: `${SITE_URL}/opengraph-image`,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    url,
    author: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/icon.svg` },
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(structuredData)} />

      <article className="container page page--narrow article">
        <Link href="/learn" className="back-link">
          <Icon icon={ArrowLeft} size={18} /> All articles
        </Link>

        <header className="page-header article__header">
          <p className="eyebrow">Learn</p>
          <h1 className="page-header__title article__title">{article.title}</h1>
          <p className="article__meta">
            <span>
              <Icon icon={Clock} size={16} /> {article.readingMinutes} min read
            </span>
            <span aria-hidden="true">·</span>
            <time dateTime={article.updated ?? article.published}>
              {article.updated ? 'Updated ' : ''}
              {formatDate(article.updated ?? article.published)}
            </time>
          </p>
        </header>

        <div className="prose">
          <Body />
        </div>
      </article>

      {related.length > 0 && (
        <section className="article__related" aria-labelledby="related-title">
          <div className="container page--narrow">
            <h2 id="related-title" className="section__title section__title--sm">
              Keep reading
            </h2>
            <div className="card-grid article-grid">
              {related.map((a) => (
                <ArticleCard key={a.slug} article={a} headingLevel="h3" />
              ))}
            </div>
          </div>
        </section>
      )}
      <section className="section about__cta" aria-labelledby="article-cta">
        <div className="container">
          <div className="cta-band">
            <h2 id="article-cta" className="cta-band__title">
              Your turn. What did you stuff up lately?
            </h2>
            <p>Log it in two minutes. Keep it private, or share it for a few &ldquo;been there&rdquo;s.</p>
            <Link href="/log" className="btn btn--accent btn--lg">
              Log a mistake
            </Link>
          </div>
        </div>
      </section>

    </>
  );
}
