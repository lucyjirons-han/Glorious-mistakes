import type { Metadata } from 'next';
import { MineView } from './MineView';

export const metadata: Metadata = {
  title: 'My mistakes',
  description: 'Your personal collection of glorious mistakes and the lessons they taught you.',
};

export default function MinePage() {
  return <MineView />;
}
