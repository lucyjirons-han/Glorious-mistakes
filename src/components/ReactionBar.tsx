'use client';

import { Check } from 'lucide-react';
import { useState } from 'react';
import { Icon, IconBadge } from './Icon';
import { REACTIONS } from '@/lib/community';
import { useMistakes } from '@/lib/store';
import type { Mistake, ReactionId } from '@/lib/types';

/**
 * The five preset reactions. People can give several different reactions, each once;
 * pressing one again takes it back. Your own entries show the counts without buttons.
 */
export function ReactionBar({ mistake }: { mistake: Mistake }) {
  const { hasReaction, toggleReaction, reactionCount } = useMistakes();
  // Changing `key` restarts the CSS animation, even on repeated clicks.
  const [animating, setAnimating] = useState<{ id: ReactionId; key: number; added: boolean } | null>(
    null,
  );

  return (
    <ul className="reactions">
      {REACTIONS.map((reaction) => {
        const count = reactionCount(mistake, reaction.id);
        const countText = (
          <span className="reaction__count">
            {count}
            <span className="sr-only"> {count === 1 ? 'reaction' : 'reactions'}</span>
          </span>
        );

        if (mistake.mine) {
          return (
            <li key={reaction.id}>
              <span className="reaction reaction--static">
                <IconBadge icon={reaction.icon} tone={reaction.tone} size="sm" className="reaction__icon" />
                <span className="reaction__label">{reaction.label}</span>
                {countText}
              </span>
            </li>
          );
        }

        const pressed = hasReaction(mistake.id, reaction.id);
        const anim = animating?.id === reaction.id ? animating : null;

        return (
          <li key={reaction.id}>
            <button
              type="button"
              className={`reaction${pressed ? ' is-pressed' : ''}`}
              aria-pressed={pressed}
              onClick={() => {
                toggleReaction(mistake.id, reaction.id);
                setAnimating({ id: reaction.id, key: Date.now(), added: !pressed });
              }}
            >
              <IconBadge
                key={anim?.key ?? 0}
                icon={reaction.icon}
                tone={reaction.tone}
                size="sm"
                className={`reaction__icon${anim ? (anim.added ? ' is-popping' : ' is-wobbling') : ''}`}
              />
              <span className="reaction__label">{reaction.label}</span>
              {countText}
              {pressed && (
                <Icon icon={Check} size={16} className="reaction__check" />
              )}
              {anim?.added && (
                <span key={`burst-${anim.key}`} className="reaction__burst" aria-hidden="true">
                  <span>+1</span>
                </span>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
