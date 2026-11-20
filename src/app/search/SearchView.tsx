'use client';

import { ArrowRight, Search, SearchX } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { BeenThereButton } from '@/components/BeenThereButton';
import { EmptyState } from '@/components/EmptyState';
import { Icon } from '@/components/Icon';
import { MistakeCard } from '@/components/MistakeCard';
import { getCategory } from '@/lib/constants';
import { matches, searchTerms, SITE_PAGES, type SearchLink } from '@/lib/search';
import { useMistakes } from '@/lib/store';
import type { Mistake } from '@/lib/types';

interface SearchViewProps {
  initialQuery: string;
  articles: SearchLink[];
  faqs: SearchLink[];
}

export function SearchView({ initialQuery, articles, faqs }: SearchViewProps) {
  const { ready, mine, publicFeed } = useMistakes();
  const [query, setQueryState] = useState(initialQuery);

  // Keep the address in step (/search?q=…) so results can be shared or revisited.
  const setQuery = (next: string) => {
    setQueryState(next);
    const url = new URL(window.location.href);
    if (next.trim()) url.searchParams.set('q', next);
    else url.searchParams.delete('q');
    window.history.replaceState(null, '', url);
  };

  const terms = useMemo(() => searchTerms(query), [query]);

  const results = useMemo(() => {
    // The visitor's own entries (private ones too) come first, then the public feed.
    const seen = new Set<string>();
    const entries: Mistake[] = [];
    for (const m of [...(ready ? mine : []), ...publicFeed]) {
      if (seen.has(m.id)) continue;
      seen.add(m.id);
      if (matches(terms, m.title, m.whatHappened, m.lesson, getCategory(m.category).label)) entries.push(m);
    }
    const find = (links: SearchLink[]) =>
      links.filter((l) => matches(terms, l.title, l.summary, l.keywords));
    return { entries, articles: find(articles), faqs: find(faqs), pages: find(SITE_PAGES) };
  }, [terms, ready, mine, publicFeed, articles, faqs]);

  const total =
    results.entries.length + results.articles.length + results.faqs.length + results.pages.length;

  return (
    <div className="container page search">
      <header className="page-header">
        <p className="eyebrow">Search</p>
        <h1 className="page-header__title">Find a stuff-up</h1>
        <p className="page-header__lead">
          Search mistakes and lessons, Learn articles and answers to common questions.
        </p>
      </header>

      <form className="toolbar" role="search" onSubmit={(e) => e.preventDefault()}>
        <div className="field field--inline toolbar__search">
          <label htmlFor="search-page-input" className="sr-only">
            Search the site
          </label>
          <Icon icon={Search} size={18} className="toolbar__search-icon" />
          <input
            id="search-page-input"
            type="search"
            className="input"
            placeholder="Try “oven”, “email” or “lesson”…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus={!initialQuery}
          />
        </div>
      </form>

      {terms.length === 0 ? (
        <p className="results-count">Type a word or two to start searching.</p>
      ) : (
        <p className="results-count" aria-live="polite">
          {total === 1 ? '1 result' : `${total} results`} for “{query.trim()}”
        </p>
      )}

      {terms.length > 0 && total === 0 && (
        <EmptyState
          icon={SearchX}
          title="Nothing matches that… yet"
          action={
            <Link href="/feed" className="btn btn--primary">
              Browse the public feed
            </Link>
          }
        >
          <p>Try a shorter word, or check the spelling. Even searches can be glorious mistakes.</p>
        </EmptyState>
      )}

      {results.entries.length > 0 && (
        <section className="search__group" aria-labelledby="search-mistakes">
          <h2 id="search-mistakes" className="section__title section__title--sm">
            Mistakes <span className="search__count">({results.entries.length})</span>
          </h2>
          <div className="card-grid">
            {results.entries.map((m) => (
              <MistakeCard key={m.id} mistake={m}>
                {m.visibility === 'public' && <BeenThereButton mistake={m} />}
              </MistakeCard>
            ))}
          </div>
        </section>
      )}

      <LinkGroup id="search-articles" title="Learn articles" links={results.articles} />
      <LinkGroup id="search-faqs" title="FAQ" links={results.faqs} />
      <LinkGroup id="search-pages" title="Pages" links={results.pages} />
    </div>
  );
}

function LinkGroup({ id, title, links }: { id: string; title: string; links: SearchLink[] }) {
  if (links.length === 0) return null;
  return (
    <section className="search__group" aria-labelledby={id}>
      <h2 id={id} className="section__title section__title--sm">
        {title} <span className="search__count">({links.length})</span>
      </h2>
      <ul className="search__links">
        {links.map((link) => (
          <li key={link.href} className="search__link-item">
            <Link href={link.href} className="search__link">
              <span className="search__link-title">
                {link.title}
                <Icon icon={ArrowRight} size={18} className="search__link-arrow" />
              </span>
              <span className="search__link-summary">{link.summary}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
