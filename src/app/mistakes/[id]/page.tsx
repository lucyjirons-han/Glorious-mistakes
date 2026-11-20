import type { Metadata } from 'next';
import { summarise } from '@/lib/constants';
import { getExampleMistakes } from '@/lib/examples';
import { pageMetadata } from '@/lib/site';
import { MistakeView } from './MistakeView';

interface MistakePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: MistakePageProps): Promise<Metadata> {
  const { id } = await params;
  const mistake = (await getExampleMistakes()).find((m) => m.id === decodeURIComponent(id));

  // Only the examples are looked up on the server; other entries load in the browser.
  // MistakeView updates the title and description once the entry has loaded.
  if (!mistake) {
    return {
      title: 'A glorious mistake',
      description: 'A stuff-up, the lesson it taught, and a few people saying “been there”.',
    };
  }

  return pageMetadata({
    title: mistake.title,
    description: summarise(mistake.whatHappened),
    path: `/mistakes/${encodeURIComponent(mistake.id)}`,
    openGraph: { type: 'article' },
  });
}

/** Example entries are pre-rendered; entries people log render on request. */
export async function generateStaticParams() {
  return (await getExampleMistakes()).map((m) => ({ id: m.id }));
}

export default async function MistakePage({ params }: MistakePageProps) {
  const { id } = await params;
  const decoded = decodeURIComponent(id);
  // Keyed so moving between entries starts each page fresh (copy status, confirm step…).
  return <MistakeView key={decoded} id={decoded} />;
}
