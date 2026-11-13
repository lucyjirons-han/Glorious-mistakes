import type { Metadata } from 'next';
import { FeedView } from './FeedView';

export const metadata: Metadata = {
  title: 'Public feed',
  description: 'Real stuff-ups from real humans. React with “been there” when one hits close to home.',
};

export default function FeedPage() {
  return <FeedView />;
}
