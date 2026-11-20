'use client';

import { CircleHelp, Lightbulb, LogIn, PartyPopper } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { EmptyState } from '@/components/EmptyState';
import { Icon, IconBadge } from '@/components/Icon';
import { MistakeForm } from '@/components/MistakeForm';
import { useToast } from '@/components/Toast';
import { useAuth } from '@/lib/auth';
import { CELEBRATIONS } from '@/lib/constants';
import { loginHref } from '@/lib/login';
import { useMistakes } from '@/lib/store';
import type { Mistake, MistakeInput } from '@/lib/types';

const CONFETTI_COLOURS = ['#C3B8E6', '#D0E8C6', '#B0D3D0', '#F6D5D8', '#F5C842'];

export function LogView() {
  const params = useSearchParams();
  const editId = params.get('edit');
  // Editing can start from the entry's own page; send people back there afterwards.
  const returnTo =
    editId && params.get('from') === 'entry' ? `/mistakes/${encodeURIComponent(editId)}` : '/mine';
  const router = useRouter();
  const toast = useToast();
  const auth = useAuth();
  const { ready, getMine, addMistake, updateMistake } = useMistakes();
  const [logged, setLogged] = useState<{ mistake: Mistake; message: string } | null>(null);
  const [formKey, setFormKey] = useState(0);

  if (editId) {
    if (!ready) return <div className="container page" aria-busy="true" />;
    const existing = getMine(editId);
    if (!existing) {
      return (
        <div className="container page page--narrow">
          <EmptyState
            icon={CircleHelp}
            title="We couldn't find that mistake"
            action={
              <Link href="/mine" className="btn btn--primary">
                Back to my mistakes
              </Link>
            }
          >
            <p>It may have been deleted, or it was saved on another device.</p>
          </EmptyState>
        </div>
      );
    }
    return (
      <div className="container page page--narrow">
        <header className="page-header">
          <p className="eyebrow">
            Editing
          </p>
          <h1 className="page-header__title">Polish your mistake</h1>
          <p className="page-header__lead">Hindsight is 20/20. Tweak away.</p>
        </header>
        <MistakeForm
          initial={existing}
          submitLabel="Save changes"
          onCancel={() => router.push(returnTo)}
          onSubmit={(input) => {
            updateMistake(existing.id, input);
            toast('Changes saved');
            router.push(returnTo);
          }}
        />
      </div>
    );
  }

  // New entries need a logged-in account (row level security insists on it too). Editing an
  // older entry logged before that rule stays open. Without Supabase there's no way to log in,
  // so the device-storage fallback still lets people log.
  if (auth.available && !logged) {
    if (!auth.ready) return <div className="container page" aria-busy="true" />;
    if (!auth.user) {
      return (
        <div className="container page page--narrow">
          <header className="page-header">
            <p className="eyebrow">New entry</p>
            <h1 className="page-header__title">Log a glorious mistake</h1>
          </header>
          <EmptyState
            icon={LogIn}
            title="Log in to log a mistake"
            action={
              <Link href={loginHref('/log')} className="btn btn--primary">
                Log in with Google
              </Link>
            }
          >
            <p>
              It takes a few seconds, and it means your mistakes are safe in your account and on every
              device. Your name stays off your entries unless you choose to add it.
            </p>
          </EmptyState>
        </div>
      );
    }
  }

  const handleCreate = (input: MistakeInput) => {
    const mistake = addMistake(input);
    const message = CELEBRATIONS[Math.floor(Math.random() * CELEBRATIONS.length)];
    setLogged({ mistake, message });
  };

  return (
    <div className="container page page--narrow">
      {logged ? (
        <Celebration
          mistake={logged.mistake}
          message={logged.message}
          onAnother={() => {
            setLogged(null);
            setFormKey((k) => k + 1);
          }}
        />
      ) : (
        <>
          <header className="page-header">
            <p className="eyebrow">
              New entry
            </p>
            <h1 className="page-header__title">Log a glorious mistake</h1>
            <p className="page-header__lead">
              Two questions, zero judgement. What happened, and what did you take from it?
            </p>
          </header>
          <MistakeForm key={formKey} submitLabel="Log my mistake" onSubmit={handleCreate} />
        </>
      )}
    </div>
  );
}

function Celebration({
  mistake,
  message,
  onAnother,
}: {
  mistake: Mistake;
  message: string;
  onAnother: () => void;
}) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    window.scrollTo({ top: 0 });
    headingRef.current?.focus({ preventScroll: true });
  }, []);
  const isPublic = mistake.visibility === 'public';

  return (
    <section className="celebration" aria-labelledby="celebration-title">
      <div className="confetti" aria-hidden="true">
        {Array.from({ length: 24 }, (_, i) => (
          <span
            key={i}
            style={{
              left: `${(i * 37) % 100}%`,
              background: CONFETTI_COLOURS[i % CONFETTI_COLOURS.length],
              animationDelay: `${(i % 8) * 0.12}s`,
              transform: `rotate(${i * 29}deg)`,
            }}
          />
        ))}
      </div>
      <IconBadge icon={PartyPopper} tone="sun" size="xl" className="celebration__icon" />
      <h1 id="celebration-title" ref={headingRef} tabIndex={-1} className="celebration__title">
        {message}
      </h1>
      <p className="celebration__text">
        {isPublic
          ? 'It’s live on the public feed. Watch the “been there”s roll in.'
          : 'Saved privately, just for you. Future you says thanks.'}
      </p>
      <blockquote className="celebration__lesson">
        <Icon icon={Lightbulb} size={18} className="inline-icon" /> {mistake.lesson}
      </blockquote>
      <div className="btn-row btn-row--center">
        <button type="button" className="btn btn--primary" onClick={onAnother}>
          Log another
        </button>
        <Link href="/mine" className="btn btn--secondary">
          My mistakes
        </Link>
        {isPublic && (
          <Link href="/feed" className="btn btn--ghost">
            View the feed
          </Link>
        )}
      </div>
    </section>
  );
}
