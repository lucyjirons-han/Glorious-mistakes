import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/site';
import { QuizView } from './QuizView';

export const metadata: Metadata = pageMetadata({
  title: 'What’s your mistake style?',
  description:
    'Seven quick questions about what you do after a stuff-up. Find your mistake style, its strength and growth edge, and the next mistake worth logging.',
  path: '/quiz',
});

export default function QuizPage() {
  return <QuizView />;
}
