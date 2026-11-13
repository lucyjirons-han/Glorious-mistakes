'use client';

import { useState } from 'react';
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
                <span className="reaction__emoji" aria-hidden="true">
                  {reaction.emoji}
                </span>
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
              <span
                key={anim?.key ?? 0}
                className={`reaction__emoji${anim ? (anim.added ? ' is-popping' : ' is-wobbling') : ''}`}
                aria-hidden="true"
              >
                {reaction.emoji}
              </span>
              <span className="reaction__label">{reaction.label}</span>
              {countText}
              {pressed && (
                <span className="reaction__check" aria-hidden="true">
                  ✓
                </span>
              )}
              {anim?.added && (
                <span key={`burst-${anim.key}`} className="reaction__burst" aria-hidden="true">
                  <span>{reaction.emoji}</span>
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
