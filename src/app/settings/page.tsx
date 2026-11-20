import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/site';
import { SettingsView } from './SettingsView';

export const metadata: Metadata = pageMetadata({
  title: 'Settings',
  description: 'Change your name, email address and newsletter settings.',
  path: '/settings',
  noindex: true,
});

export default function SettingsPage() {
  return <SettingsView />;
}
