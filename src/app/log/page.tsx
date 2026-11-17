import type { Metadata } from 'next';
import { Suspense } from 'react';
import { pageMetadata } from '@/lib/site';
import { LogView } from './LogView';

export const metadata: Metadata = pageMetadata({
  title: 'Log a mistake',
  description: 'Two questions, no judgement: what happened, and what did it teach you?',
  path: '/log',
  // A form, not content: keep it out of search results.
  noindex: true,
});

export default function LogPage() {
  return (
    <Suspense fallback={<div className="container page" aria-busy="true" />}>
      <LogView />
    </Suspense>
  );
}
