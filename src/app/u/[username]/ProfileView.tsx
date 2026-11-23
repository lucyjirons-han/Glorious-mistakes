'use client';

import { Link2, NotebookPen, UserRoundPen } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo } from 'react';
import { BeenThereButton } from '@/components/BeenThereButton';
import { EmptyState } from '@/components/EmptyState';
import { Icon } from '@/components/Icon';
import { MistakeCard } from '@/components/MistakeCard';
import { ProfileCard } from '@/components/ProfileCard';
import { useToast } from '@/components/Toast';
import { useAuth } from '@/lib/auth';
import { profileName, type PublicProfile } from '@/lib/profiles';
import { useMistakes } from '@/lib/store';
import type { StyleId } from '@/lib/quiz';
import type { Mistake } from '@/lib/types';
import { ReportProfile } from './ReportProfile';

interface ProfileViewProps {
  profile: PublicProfile;
  /** Their signed public entries, loaded on the server. */
  entries: Mistake[];
  /** Their mistake style badge, when they show it. */
  quizStyle: StyleId | null;
}

export function ProfileView({ profile, entries: serverEntries, quizStyle }: ProfileViewProps) {
  const auth = useAuth();
  const { ready, getMine, loadCounts, beenThereCount } = useMistakes();
  const toast = useToast();
  const isOwner = auth.userId === profile.id;
  const name = profileName(profile);

  // On your own profile, show your entries as the store has them (edits, "that's you" counts),
  // and drop any you've since made private or anonymous.
  const entries = useMemo(
    () =>
      serverEntries
        .map((m) => {
          const own = getMine(m.id);
          return own ? { ...own, authorProfile: m.authorProfile } : m;
        })
        .filter((m) => m.visibility === 'public' && m.author.trim()),
    [serverEntries, getMine],
  );

  useEffect(() => {
    if (ready) loadCounts(entries);
  }, [ready, entries, loadCounts]);

  const beenThere = entries.reduce((sum, m) => sum + beenThereCount(m), 0);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast('Link copied. Go spread the joy.');
    } catch {
      toast('Couldn’t copy the link. You can copy it from the address bar instead.');
    }
  };

  return (
    <div className="container page profile-page">
      <ProfileCard profile={profile} headingId="profile-name" quizStyle={quizStyle}>
        {profile.showEntries && (
          <ul className="profile-stats" aria-label="Stats">
            <li>
              <strong>{entries.length}</strong> {entries.length === 1 ? 'mistake shared' : 'mistakes shared'}
            </li>
            <li>
              <strong>{ready ? beenThere : '…'}</strong> {beenThere === 1 ? 'person has' : 'people have'} been there
            </li>
          </ul>
        )}
        <div className="profile-card__actions">
          <button type="button" className="btn btn--secondary" onClick={() => void copyLink()}>
            <Icon icon={Link2} size={18} /> Copy profile link
          </button>
          {isOwner && (
            <Link href="/profile" className="btn">
              <Icon icon={UserRoundPen} size={18} /> Edit profile
            </Link>
          )}
        </div>
      </ProfileCard>

      {profile.showEntries && (
        <section className="profile-entries" aria-labelledby="profile-entries-title">
          <h2 id="profile-entries-title" className="profile-entries__title">
            {isOwner ? 'Your shared mistakes' : `${name}’s mistakes`}
          </h2>
          {entries.length > 0 ? (
            <div className="card-grid" data-reveal-each>
              {entries.map((m) => (
                <MistakeCard key={m.id} mistake={m}>
                  <BeenThereButton mistake={m} />
                </MistakeCard>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={NotebookPen}
              title={isOwner ? 'Nothing shared here yet' : 'No mistakes shared yet'}
              action={
                isOwner ? (
                  <Link href="/log" className="btn btn--primary">
                    Log a mistake
                  </Link>
                ) : undefined
              }
            >
              <p>
                {isOwner
                  ? 'Public entries with your name on them show up here. Anonymous ones never do.'
                  : 'Check back soon. Glorious stuff-ups take time.'}
              </p>
            </EmptyState>
          )}
        </section>
      )}

      {/* Nobody reports their own profile. Waits for the session so owners never see it flash. */}
      {auth.ready && !isOwner && auth.available && <ReportProfile profileId={profile.id} name={name} />}
    </div>
  );
}
