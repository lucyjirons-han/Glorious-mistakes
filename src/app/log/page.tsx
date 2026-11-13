import type { Metadata } from 'next';
import { Suspense } from 'react';
import { LogView } from './LogView';

export const metadata: Metadata = {
  title: 'Log a mistake',
  description: 'Two questions, no judgement: what happened, and what did it teach you?',
};

export default function LogPage() {
  return (
    <Suspense fallback={<div className="container page" aria-busy="true" />}>
      <LogView />
    </Suspense>
  );
}
