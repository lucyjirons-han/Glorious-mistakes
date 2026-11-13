'use client';

import { Hand, Search, SearchX } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { BeenThereButton } from '@/components/BeenThereButton';
import { CategoryFilter } from '@/components/CategoryFilter';
import { EmptyState } from '@/components/EmptyState';
import { Icon } from '@/components/Icon';
import { MistakeCard } from '@/components/MistakeCard';
import { useMistakes } from '@/lib/store';
import type { CategoryId } from '@/lib/types';

type Sort = 'newest' | 'relatable' | 'cringe';

export function FeedView() {
  const { publicFeed, beenThereCount } = useMistakes();
  const [category, setCategory] = useState<CategoryId | 'all'>('all');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<Sort>('newest');

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = publicFeed.filter(
      (m) =>
        (category === 'all' || m.category === category) &&
        (!q || [m.title, m.whatHappened, m.lesson].some((t) => t.toLowerCase().includes(q))),
    );
    if (sort === 'relatable') return [...filtered].sort((a, b) => beenThereCount(b) - beenThereCount(a));
    if (sort === 'cringe') return [...filtered].sort((a, b) => b.cringe - a.cringe);
    return filtered;
  }, [publicFeed, category, query, sort, beenThereCount]);

  return (
    <div className="container page">
      <header className="page-header">
        <p className="eyebrow">
          Public feed
        </p>
        <h1 className="page-header__title">Everyone stuffs up</h1>
        <p className="page-header__lead">
          Real mistakes from real humans. Tap <strong className="nowrap"><Icon icon={Hand} size={18} className="inline-icon" /> Been there</strong> when one hits a little
          too close to home.
        </p>
      </header>

      <section className="toolbar" aria-label="Search and filter">
        <div className="toolbar__row">
          <div className="field field--inline toolbar__search">
            <label htmlFor="feed-search" className="sr-only">
              Search mistakes
            </label>
            <Icon icon={Search} size={18} className="toolbar__search-icon" />
            <input
              id="feed-search"
              type="search"
              className="input"
              placeholder="Search mistakes and lessons…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="field field--inline">
            <label htmlFor="feed-sort" className="toolbar__label">
              Sort by
            </label>
            <select
              id="feed-sort"
              className="input input--select"
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
            >
              <option value="newest">Newest</option>
              <option value="relatable">Most relatable</option>
              <option value="cringe">Most cringe</option>
            </select>
          </div>
        </div>
        <CategoryFilter value={category} onChange={setCategory} />
      </section>

      <p className="results-count" aria-live="polite">
        {results.length === 1 ? '1 glorious mistake' : `${results.length} glorious mistakes`}
      </p>

      {results.length > 0 ? (
        <div className="card-grid">
          {results.map((m) => (
            <MistakeCard key={m.id} mistake={m}>
              <BeenThereButton mistake={m} />
            </MistakeCard>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={SearchX}
          title="No mistakes match that… yet"
          action={
            <Link href="/log" className="btn btn--primary">
              Be the first to share one
            </Link>
          }
        >
          <p>Try a different search or category.</p>
        </EmptyState>
      )}
    </div>
  );
}
