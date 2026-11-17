import type { Metadata } from 'next';
import { Suspense } from 'react';
import { pageMetadata } from '@/lib/site';
import { FeedView } from './FeedView';

export const metadata: Metadata = pageMetadata({
  title: 'Public feed',
  description: 'Real stuff-ups from real humans. React with “been there” when one hits close to home.',
  path: '/feed',
});

export default function FeedPage() {
  return (
    <Suspense fallback={<div className="container page" aria-busy="true" />}>
      <FeedView />
    </Suspense>
  );
}
