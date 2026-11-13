import type { ReactNode } from 'react';
import { displayAuthor, formatDate, getCategory, getCringe } from '@/lib/constants';
import type { Mistake } from '@/lib/types';

interface MistakeCardProps {
  mistake: Mistake;
  /** Actions shown in the card footer (reaction button, edit controls, …). */
  children?: ReactNode;
}

export function MistakeCard({ mistake, children }: MistakeCardProps) {
  const category = getCategory(mistake.category);
  const cringe = getCringe(mistake.cringe);
  const titleId = `mistake-${mistake.id}-title`;

  return (
    <article className={`card card--${mistake.category}`} aria-labelledby={titleId}>
      <div className="card__tags">
        <span className="tag tag--category">
          <span aria-hidden="true">{category.emoji}</span> {category.label}
        </span>
        <span className="tag tag--cringe">
          <span aria-hidden="true">{cringe.emoji}</span>
          <span className="sr-only">Cringe level: </span>
          {cringe.label}
        </span>
        {mistake.mine && (
          <span className={`tag tag--${mistake.visibility}`}>
            <span aria-hidden="true">{mistake.visibility === 'private' ? '🔒' : '🌍'}</span>{' '}
            {mistake.visibility === 'private' ? 'Private' : 'Shared'}
          </span>
        )}
      </div>

      <h3 id={titleId} className="card__title">
        {mistake.title}
      </h3>

      <dl className="card__body">
        <div className="card__section">
          <dt>What happened</dt>
          <dd>{mistake.whatHappened}</dd>
        </div>
        <div className="card__section card__section--lesson">
          <dt>
            <span aria-hidden="true">💡</span> What it taught me
          </dt>
          <dd>{mistake.lesson}</dd>
        </div>
      </dl>

      <footer className="card__footer">
        <p className="card__meta">
          <span className="card__author">
            {mistake.mine ? 'You' : displayAuthor(mistake)}
          </span>
          <span aria-hidden="true"> · </span>
          <time dateTime={mistake.createdAt}>{formatDate(mistake.createdAt)}</time>
        </p>
        {children && <div className="card__actions">{children}</div>}
      </footer>
    </article>
  );
}
