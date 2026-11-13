'use client';

import {
  ArrowLeft,
  Dices,
  Flag,
  Globe,
  Lightbulb,
  Link2,
  Lock,
  MapPinOff,
  Pencil,
  Trash2,
  VenetianMask,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { BeenThereButton } from '@/components/BeenThereButton';
import { EmptyState } from '@/components/EmptyState';
import { Icon, IconBadge } from '@/components/Icon';
import { MistakeCard, mistakeHref } from '@/components/MistakeCard';
import { ReactionBar } from '@/components/ReactionBar';
import { useToast } from '@/components/Toast';
import { hasReported, reportMistake } from '@/lib/community';
import { displayAuthor, formatDate, getCategory, getCringe, summarise } from '@/lib/constants';
import { useMistakes } from '@/lib/store';
import type { Mistake } from '@/lib/types';

const SITE = 'Glorious Mistakes';

/** Set by "Show me another" so the next entry's headline gets focus for screen readers. */
let focusHeadlineOnLoad = false;

/**
 * Entries people log live on their device, so the server can only give them a generic title.
 * This sets the real one, and puts it back if Next applies the server metadata afterwards.
 */
function usePageMeta(title: string | null, description?: string) {
  useLayoutEffect(() => {
    if (!title) return;
    const fullTitle = `${title} · ${SITE}`;
    const apply = () => {
      if (document.title !== fullTitle) document.title = fullTitle;
      const meta = document.querySelector('meta[name="description"]');
      if (description && meta && meta.getAttribute('content') !== description) {
        meta.setAttribute('content', description);
      }
    };
    apply();
    const observer = new MutationObserver(apply);
    observer.observe(document.head, { subtree: true, childList: true, characterData: true, attributes: true });
    // Layout-effect cleanup runs before the next page's title lands, so this never fights it.
    return () => observer.disconnect();
  }, [title, description]);
}

export function MistakeView({ id }: { id: string }) {
  const { ready, getMistake, publicFeed } = useMistakes();
  const router = useRouter();
  const deleting = useRef(false);
  const found = getMistake(id);
  // Private entries live only on their author's device, but never show one that isn't yours.
  const mistake = found && (found.mine || found.visibility === 'public') ? found : undefined;

  usePageMeta(
    !ready || deleting.current ? null : (mistake?.title ?? 'Mistake not found'),
    mistake ? summarise(mistake.whatHappened) : undefined,
  );

  if (!ready || deleting.current) {
    return (
      <div className="container page page--narrow" aria-busy="true">
        <div className="card card--skeleton" />
      </div>
    );
  }

  if (!mistake) return <MistakeNotFound />;

  const others = publicFeed.filter((m) => m.id !== mistake.id);
  const similar = others.filter((m) => m.category === mistake.category).slice(0, 3);
  const isPublic = mistake.visibility === 'public';

  const showAnother = () => {
    const pick = others[Math.floor(Math.random() * others.length)];
    focusHeadlineOnLoad = true;
    router.push(mistakeHref(pick.id));
  };

  return (
    <div className="container page page--narrow entry-page">
      <Link href={mistake.mine ? '/mine' : '/feed'} className="back-link">
        <Icon icon={ArrowLeft} size={18} /> {mistake.mine ? 'My mistakes' : 'Public feed'}
      </Link>

      {mistake.mine && (
        <AuthorControls
          mistake={mistake}
          onDeleted={() => {
            deleting.current = true;
            router.replace('/mine');
          }}
        />
      )}

      {/* 1–2. The entry and its author */}
      <EntryDetails mistake={mistake} />

      {/* 3. Reactions */}
      <section className="entry-section" aria-labelledby="reactions-title">
        <h2 id="reactions-title" className="entry-section__title">
          Reactions
        </h2>
        {mistake.mine && (
          <p className="entry-section__hint">
            {isPublic
              ? 'This is how other people have reacted to your mistake.'
              : 'Share this mistake to the feed and other people can react to it.'}
          </p>
        )}
        <ReactionBar mistake={mistake} />
      </section>

      {/* 4–5. Share and Show me another */}
      <section className="entry-section entry-share" aria-labelledby="share-title">
        <h2 id="share-title" className="sr-only">
          Share and explore
        </h2>
        {isPublic ? (
          <CopyLinkButton />
        ) : (
          <p className="entry-section__hint">
            <Icon icon={Lock} size={16} className="inline-icon" /> Private entries can&rsquo;t be shared. Make it public to
            get a link.
          </p>
        )}
        {others.length > 0 && (
          <button type="button" className="btn btn--accent" onClick={showAnother}>
            <Icon icon={Dices} size={18} /> Show me another
          </button>
        )}
      </section>

      {/* 6. More like this */}
      {similar.length > 0 && (
        <section className="entry-section" aria-labelledby="similar-title">
          <h2 id="similar-title" className="entry-section__title">
            More like this
          </h2>
          <div className="card-grid entry-similar">
            {similar.map((m) => (
              <MistakeCard key={m.id} mistake={m}>
                <BeenThereButton mistake={m} />
              </MistakeCard>
            ))}
          </div>
        </section>
      )}

      {/* 7. Call to action */}
      <section className="cta-band entry-cta" aria-labelledby="entry-cta-title">
        <h2 id="entry-cta-title" className="cta-band__title">
          Done something similar?
        </h2>
        <p>Two questions, zero judgement. Future you will thank you.</p>
        <Link href="/log" className="btn btn--accent btn--lg">
          Log yours
        </Link>
      </section>

      {/* 8. Report */}
      {!mistake.mine && <ReportLink mistakeId={mistake.id} />}
    </div>
  );
}

function EntryDetails({ mistake }: { mistake: Mistake }) {
  const category = getCategory(mistake.category);
  const cringe = getCringe(mistake.cringe);
  const headline = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!focusHeadlineOnLoad) return;
    focusHeadlineOnLoad = false;
    headline.current?.focus();
  }, []);

  return (
    <article className={`entry card--${mistake.category}`} aria-labelledby="entry-title">
      <div className="card__tags">
        <span className="tag tag--category">{category.label}</span>
        <span className="tag tag--cringe">
          <span className="sr-only">Cringe level: </span>
          {cringe.label}
        </span>
        <time className="entry__date" dateTime={mistake.createdAt}>
          {formatDate(mistake.createdAt)}
        </time>
      </div>

      <h1 id="entry-title" ref={headline} tabIndex={-1} className="entry__title">
        {mistake.title}
      </h1>

      <dl className="entry__body">
        <div className="entry__section">
          <dt>The mistake</dt>
          <dd>{mistake.whatHappened}</dd>
        </div>
        <div className="entry__section entry__section--lesson">
          <dt>
            <Icon icon={Lightbulb} size={14} className="card__dt-icon" />
            The lesson
          </dt>
          <dd>{mistake.lesson}</dd>
        </div>
      </dl>

      <AuthorLine mistake={mistake} />
    </article>
  );
}

const AVATAR_TINTS = ['#C3B8E6', '#D0E8C6', '#B0D3D0', '#F6D5D8'];

function AuthorLine({ mistake }: { mistake: Mistake }) {
  const name = displayAuthor(mistake);
  const anonymous = !mistake.author.trim();
  const tint = AVATAR_TINTS[[...name].reduce((n, ch) => n + ch.codePointAt(0)!, 0) % AVATAR_TINTS.length];

  return (
    <p className="author-line">
      <span
        className={`avatar${anonymous ? ' avatar--anonymous' : ''}`}
        style={anonymous ? undefined : { background: tint }}
        aria-hidden="true"
      >
        {anonymous ? <Icon icon={VenetianMask} size={22} /> : [...name][0].toUpperCase()}
      </span>
      <span>
        <span className="author-line__label">
          {mistake.mine && mistake.visibility === 'private' ? 'Written by' : 'Shared by'}
        </span>{' '}
        <span className="author-line__name">{name}</span>
        {mistake.mine && <span className="author-line__you"> (that&rsquo;s you)</span>}
      </span>
    </p>
  );
}

function AuthorControls({ mistake, onDeleted }: { mistake: Mistake; onDeleted: () => void }) {
  const { setVisibility, deleteMistake } = useMistakes();
  const toast = useToast();
  const [confirming, setConfirming] = useState(false);
  const deleteButton = useRef<HTMLButtonElement>(null);
  const returnFocus = useRef(false);
  const isPublic = mistake.visibility === 'public';

  useEffect(() => {
    if (!confirming && returnFocus.current) {
      returnFocus.current = false;
      deleteButton.current?.focus();
    }
  }, [confirming]);

  if (confirming) {
    return (
      <section className="author-panel author-panel--confirm" aria-labelledby="confirm-title">
        <h2 id="confirm-title" className="author-panel__title">
          <IconBadge icon={Trash2} tone="white" size="sm" className="heading-icon" /> Delete this mistake for good?
        </h2>
        <p>It&rsquo;ll be gone from your collection and the feed. This can&rsquo;t be undone.</p>
        <div className="btn-row">
          <button
            type="button"
            className="btn btn--danger"
            onClick={() => {
              onDeleted();
              deleteMistake(mistake.id);
              toast('Mistake deleted. Poof!');
            }}
          >
            Yes, delete it
          </button>
          <button
            type="button"
            className="btn btn--ghost"
            autoFocus
            onClick={() => {
              returnFocus.current = true;
              setConfirming(false);
            }}
          >
            Keep it
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="author-panel" aria-labelledby="author-panel-title">
      <h2 id="author-panel-title" className="author-panel__title">
        <IconBadge icon={isPublic ? Globe : Lock} tone={isPublic ? 'sky' : 'lilac'} size="sm" className="heading-icon" />{' '}
        {isPublic ? 'Your mistake is on the public feed' : 'Private: only you can see this'}
      </h2>
      <div className="author-panel__actions">
        <button
          type="button"
          role="switch"
          aria-checked={isPublic}
          className="switch"
          onClick={() => {
            setVisibility(mistake.id, isPublic ? 'private' : 'public');
            toast(isPublic ? 'Now private' : 'Shared to the feed');
          }}
        >
          <span className="switch__track" aria-hidden="true">
            <span className="switch__thumb" />
          </span>
          <span>Public</span>
        </button>
        <Link
          href={`/log?edit=${encodeURIComponent(mistake.id)}&from=entry`}
          className="btn btn--ghost btn--sm"
        >
          <Icon icon={Pencil} size={16} /> Edit
        </Link>
        <button
          ref={deleteButton}
          type="button"
          className="btn btn--ghost btn--sm btn--danger-text"
          onClick={() => setConfirming(true)}
        >
          <Icon icon={Trash2} size={16} /> Delete
        </button>
      </div>
    </section>
  );
}

function CopyLinkButton() {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Older browsers, or clipboard access blocked: fall back to a hidden text field.
      const field = document.createElement('textarea');
      field.value = url;
      field.setAttribute('readonly', '');
      field.style.position = 'fixed';
      field.style.opacity = '0';
      document.body.appendChild(field);
      field.select();
      document.execCommand('copy');
      field.remove();
    }
    setCopied(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="copy-link">
      <button type="button" className="btn btn--secondary" onClick={copy}>
        <Icon icon={Link2} size={18} /> Copy link
      </button>
      <span className="copy-link__status" role="status">
        {copied ? 'Link copied! Go spread the joy.' : ''}
      </span>
    </div>
  );
}

function ReportLink({ mistakeId }: { mistakeId: string }) {
  const [reported, setReported] = useState(false);
  const message = useRef<HTMLParagraphElement>(null);
  const justReported = useRef(false);

  useEffect(() => setReported(hasReported(mistakeId)), [mistakeId]);

  useEffect(() => {
    if (reported && justReported.current) message.current?.focus();
  }, [reported]);

  return (
    <div className="report">
      <p ref={message} className="report__thanks" role="status" tabIndex={-1}>
        {reported ? 'Thanks, we’ll take a look.' : ''}
      </p>
      {!reported && (
        <button
          type="button"
          className="report__link"
          onClick={async () => {
            await reportMistake(mistakeId);
            justReported.current = true;
            setReported(true);
          }}
        >
          <Icon icon={Flag} size={14} /> Report this entry
        </button>
      )}
    </div>
  );
}

function MistakeNotFound() {
  return (
    <div className="container page page--narrow">
      <EmptyState
        icon={MapPinOff}
        title="This mistake has wandered off"
        action={
          <Link href="/feed" className="btn btn--primary">
            Back to the feed
          </Link>
        }
      >
        <p>
          We couldn&rsquo;t find that entry. It may have been deleted or made private, or the link
          has a typo. Which would be a glorious mistake in itself.
        </p>
      </EmptyState>
    </div>
  );
}
