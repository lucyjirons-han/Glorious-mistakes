'use client';

import { Check, Hand } from 'lucide-react';
import { Icon, IconBadge } from './Icon';
import { useMistakes } from '@/lib/store';
import type { Mistake } from '@/lib/types';

/** The "been there" reaction. Your own posts show the count without a button. */
export function BeenThereButton({ mistake }: { mistake: Mistake }) {
  const { hasReacted, toggleBeenThere, beenThereCount } = useMistakes();
  const count = beenThereCount(mistake);
  const people = count === 1 ? 'person has' : 'people have';

  if (mistake.mine) {
    return (
      <p className="been-there been-there--static">
        <IconBadge icon={Hand} tone="sky" size="sm" className="been-there__icon" />
        <span className="been-there__count">{count}</span>
        <span>
          <span className="sr-only">{people} </span>been there
        </span>
      </p>
    );
  }

  const pressed = hasReacted(mistake.id);
  return (
    <button
      type="button"
      className={`been-there${pressed ? ' is-pressed' : ''}`}
      aria-pressed={pressed}
      onClick={() => toggleBeenThere(mistake.id)}
    >
      <IconBadge icon={Hand} tone="sky" size="sm" className="been-there__icon" />
      <span>Been there</span>
      <span className="been-there__count">
        {count}
        <span className="sr-only"> {count === 1 ? 'person' : 'people'}</span>
      </span>
      {pressed && <Icon icon={Check} size={16} className="been-there__check" />}
    </button>
  );
}
