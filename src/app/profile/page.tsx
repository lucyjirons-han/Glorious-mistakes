import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/site';
import { ProfileEditorView } from './ProfileEditorView';

export const metadata: Metadata = pageMetadata({
  title: 'Your profile',
  description: 'Set up your public profile: a username, a short bio, a photo and links to your socials.',
  path: '/profile',
  noindex: true,
});

export default function ProfileEditorPage() {
  return <ProfileEditorView />;
}
