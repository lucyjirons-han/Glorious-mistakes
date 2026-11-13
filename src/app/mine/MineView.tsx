'use client';

import Link from 'next/link';
import { useState } from 'react';
import { BeenThereButton } from '@/components/BeenThereButton';
import { EmptyState } from '@/components/EmptyState';
import { MistakeCard } from '@/components/MistakeCard';
import { useToast } from '@/components/Toast';
import { useMistakes } from '@/lib/store';
import type { Mistake, Visibility } from '@/lib/types';

type Filter = 'all' | Visibility;

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'public', label: '🌍 Shared' },
  { id: 'private', label: '🔒 Private' },
];

export function MineView() {
  const { ready, mine, beenThereCount } = useMistakes();
  const [filter, setFilter] = useState<Filter>('all');

  const header = (
    <header className="page-header page-header--split">
      <div>
        <p className="eyebrow">
          <span aria-hidden="true">📔</span> Your collection
        </p>
        <h1 className="page-header__title">My glorious mistakes</h1>
        <p className="page-header__lead">Every stuff-up, every lesson. Look how much you&rsquo;ve learned.</p>
      </div>
      <Link href="/log" className="btn btn--primary">
        <span aria-hidden="true">✍️</span> Log a mistake
      </Link>
    </header>
  );

  if (!ready) {
    return (
      <div className="container page" aria-busy="true">
        {header}
        <div className="card-grid">
          {[0, 1, 2].map((i) => (
            <div key={i} className="card card--skeleton" />
          ))}
        </div>
      </div>
    );
  }

  if (mine.length === 0) {
    return (
      <div className="container page">
        {header}
        <EmptyState
          emoji="🌱"
          title="A suspiciously perfect record"
          action={
            <Link href="/log" className="btn btn--primary btn--lg">
              Log your first mistake
            </Link>
          }
        >
          <p>No mistakes logged yet. We both know that can&rsquo;t be true.</p>
        </EmptyState>
      </div>
    );
  }

  const shared = mine.filter((m) => m.visibility === 'public');
  const stats = [
    { label: 'Mistakes logged', value: mine.length, emoji: '📝' },
    { label: 'Lessons learned', value: mine.length, emoji: '💡' },
    { label: 'Shared to the feed', value: shared.length, emoji: '🌍' },
    { label: '“Been there”s received', value: shared.reduce((n, m) => n + beenThereCount(m), 0), emoji: '🙋' },
  ];
  const visible = filter === 'all' ? mine : mine.filter((m) => m.visibility === filter);

  return (
    <div className="container page">
      {header}

      <section aria-labelledby="stats-title">
        <h2 id="stats-title" className="sr-only">
          Your stats
        </h2>
        <ul className="stats">
          {stats.map((s) => (
            <li key={s.label} className="stat">
              <span className="stat__emoji" aria-hidden="true">
                {s.emoji}
              </span>
              <span className="stat__value">{s.value}</span>
              <span className="stat__label">{s.label}</span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="entries-title">
        <div className="section__header section__header--compact">
          <h2 id="entries-title" className="section__title section__title--sm">
            Entries
          </h2>
          <div className="chip-group" role="group" aria-label="Show entries">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                className="chip"
                aria-pressed={filter === f.id}
                onClick={() => setFilter(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {visible.length > 0 ? (
          <div className="card-grid">
            {visible.map((m) => (
              <MistakeCard key={m.id} mistake={m}>
                <OwnerActions mistake={m} />
              </MistakeCard>
            ))}
          </div>
        ) : (
          <EmptyState emoji="🫥" title={filter === 'public' ? 'Nothing shared yet' : 'Nothing private yet'}>
            <p>Switch a mistake&rsquo;s visibility from its card.</p>
          </EmptyState>
        )}
      </section>
    </div>
  );
}

function OwnerActions({ mistake }: { mistake: Mistake }) {
  const { setVisibility, deleteMistake } = useMistakes();
  const toast = useToast();
  const [confirming, setConfirming] = useState(false);
  const isPublic = mistake.visibility === 'public';

  if (confirming) {
    return (
      <div className="confirm" role="group" aria-label={`Delete “${mistake.title}”?`}>
        <p className="confirm__text">Delete for good?</p>
        <button
          type="button"
          className="btn btn--danger btn--sm"
          onClick={() => {
            deleteMistake(mistake.id);
            toast('Mistake deleted. Poof! 💨');
          }}
        >
          Yes, delete
        </button>
        <button type="button" className="btn btn--ghost btn--sm" autoFocus onClick={() => setConfirming(false)}>
          Keep it
        </button>
      </div>
    );
  }

  return (
    <>
      {isPublic && <BeenThereButton mistake={mistake} />}
      <div className="owner-actions">
        <button
          type="button"
          className="btn btn--ghost btn--sm"
          onClick={() => {
            setVisibility(mistake.id, isPublic ? 'private' : 'public');
            toast(isPublic ? 'Now private 🔒' : 'Shared to the feed 🌍');
          }}
        >
          {isPublic ? 'Make private' : 'Share'}
          <span className="sr-only"> “{mistake.title}”</span>
        </button>
        <Link href={`/log?edit=${encodeURIComponent(mistake.id)}`} className="btn btn--ghost btn--sm">
          Edit<span className="sr-only"> “{mistake.title}”</span>
        </Link>
        <button type="button" className="btn btn--ghost btn--sm btn--danger-text" onClick={() => setConfirming(true)}>
          Delete<span className="sr-only"> “{mistake.title}”</span>
        </button>
      </div>
    </>
  );
}
