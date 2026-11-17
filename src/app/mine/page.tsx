import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/site';
import { MineView } from './MineView';

export const metadata: Metadata = pageMetadata({
  title: 'My mistakes',
  description: 'Your personal collection of glorious mistakes and the lessons they taught you.',
  path: '/mine',
  // Personal page: its contents live on each visitor's device, so there's nothing to index.
  noindex: true,
});

export default function MinePage() {
  return <MineView />;
}
