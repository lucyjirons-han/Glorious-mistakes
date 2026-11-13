import { Globe, Lightbulb, Lock } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { displayAuthor, formatDate, getCategory, getCringe } from '@/lib/constants';
import type { Mistake } from '@/lib/types';
import { Icon, IconBadge } from './Icon';

interface MistakeCardProps {
  mistake: Mistake;
  /** Actions shown in the card footer (reaction button, edit controls, …). */
  children?: ReactNode;
}

export function mistakeHref(id: string): string {
  return `/mistakes/${encodeURIComponent(id)}`;
}

export function MistakeCard({ mistake, children }: MistakeCardProps) {
  const category = getCategory(mistake.category);
  const cringe = getCringe(mistake.cringe);
  const titleId = `mistake-${mistake.id}-title`;

  return (
    <article className={`card card--${mistake.category}`} aria-labelledby={titleId}>
      <div className="card__tags">
        <span className="tag tag--category">
          <IconBadge icon={category.icon} tone="white" size="sm" className="tag__icon" />
          {category.label}
        </span>
        <span className="tag tag--cringe">
          <span className="sr-only">Cringe level: </span>
          {cringe.label}
        </span>
        {mistake.mine && (
          <span className={`tag tag--${mistake.visibility}`}>
            <Icon icon={mistake.visibility === 'private' ? Lock : Globe} size={14} />
            {mistake.visibility === 'private' ? 'Private' : 'Shared'}
          </span>
        )}
      </div>

      <h3 id={titleId} className="card__title">
        {/* The link stretches over the whole card, so clicking anywhere opens the entry. */}
        <Link href={mistakeHref(mistake.id)} className="card__link">
          {mistake.title}
        </Link>
      </h3>

      <dl className="card__body">
        <div className="card__section">
          <dt>What happened</dt>
          <dd>{mistake.whatHappened}</dd>
        </div>
        <div className="card__section card__section--lesson">
          <dt>
            <Icon icon={Lightbulb} size={14} className="card__dt-icon" />
            What it taught me
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
