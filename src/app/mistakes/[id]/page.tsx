import type { Metadata } from 'next';
import { summarise } from '@/lib/constants';
import { SEED_MISTAKES } from '@/lib/seed';
import { MistakeView } from './MistakeView';

interface MistakePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: MistakePageProps): Promise<Metadata> {
  const { id } = await params;
  const mistake = SEED_MISTAKES.find((m) => m.id === decodeURIComponent(id));

  // Entries people log are saved on their own device, so the server can't see them.
  // MistakeView updates the title and description once the entry has loaded.
  if (!mistake) {
    return {
      title: 'A glorious mistake',
      description: 'A stuff-up, the lesson it taught, and a few people saying “been there”.',
    };
  }

  return {
    title: mistake.title,
    description: summarise(mistake.whatHappened),
    openGraph: { title: mistake.title, description: summarise(mistake.whatHappened) },
  };
}

export function generateStaticParams() {
  return SEED_MISTAKES.map((m) => ({ id: m.id }));
}

export default async function MistakePage({ params }: MistakePageProps) {
  const { id } = await params;
  const decoded = decodeURIComponent(id);
  // Keyed so moving between entries starts each page fresh (copy status, confirm step…).
  return <MistakeView key={decoded} id={decoded} />;
}
