'use client';

import { BeenThereButton } from './BeenThereButton';
import { MistakeCard } from './MistakeCard';
import { revealOffset } from '@/lib/reveal';
import { useMistakes } from '@/lib/store';

/** The three most-related-to public mistakes, for the home page. */
export function FeedPreview() {
  const { publicFeed } = useMistakes();
  const top = [...publicFeed].sort((a, b) => b.baseBeenThere - a.baseBeenThere).slice(0, 3);

  return (
    // On the home page the cards rise in after the section heading (see RevealOnScroll).
    <div
      className="card-grid card-grid--favourites"
      data-reveal-stagger
      style={revealOffset(1)}
    >
      {top.map((m) => (
        <MistakeCard key={m.id} mistake={m}>
          <BeenThereButton mistake={m} />
        </MistakeCard>
      ))}
    </div>
  );
}
