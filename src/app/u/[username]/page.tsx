import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProfilePage } from '@/lib/profiles-server';
import { profileHref, profileName } from '@/lib/profiles';
import { pageMetadata } from '@/lib/site';
import { ProfileView } from './ProfileView';

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const { username } = await params;
  const data = await getProfilePage(decodeURIComponent(username));
  if (!data) return { title: 'Profile not found', robots: { index: false, follow: true } };
  const { profile } = data;
  const name = profileName(profile);
  return pageMetadata({
    title: profile.displayName.trim() ? `${name} (@${profile.username})` : name,
    description: profile.bio.trim() || `${name}’s glorious mistakes and the lessons they taught.`,
    path: profileHref(profile.username),
    openGraph: { type: 'profile', username: profile.username },
  });
}

/** Public profiles. Private or missing ones are a 404, so nobody can tell which usernames exist. */
export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;
  const data = await getProfilePage(decodeURIComponent(username));
  if (!data) notFound();
  return <ProfileView key={data.profile.id} profile={data.profile} entries={data.entries} quizStyle={data.quizStyle} />;
}
