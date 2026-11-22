'use client';

import { useState } from 'react';

const AVATAR_TINTS = ['#C3B8E6', '#D0E8C6', '#B0D3D0', '#F6D5D8'];

/** A pastel picked from the name, so the same person always gets the same colour. */
export function tintFor(name: string): string {
  return AVATAR_TINTS[[...name].reduce((n, ch) => n + ch.codePointAt(0)!, 0) % AVATAR_TINTS.length];
}

interface AvatarProps {
  /** The picture, or null for initials. */
  src: string | null;
  /** Used for the initial and the colour behind it. */
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

/**
 * A round profile picture, or the first letter of the name on a pastel circle. Falls back to the
 * letter if the picture won't load. Decorative: the name is always written next to it.
 */
export function Avatar({ src, name, size = 'md', className }: AvatarProps) {
  const [failed, setFailed] = useState<string | null>(null);
  const showPhoto = !!src && failed !== src;
  const letter = ([...name.replace(/^@/, '').trim()][0] ?? '?').toUpperCase();
  const classes = `avatar avatar--${size}${showPhoto ? ' avatar--photo' : ''}${className ? ` ${className}` : ''}`;

  return (
    <span className={classes} style={showPhoto ? undefined : { background: tintFor(name) }} aria-hidden="true">
      {showPhoto ? (
        // A plain img: avatars are small, and come from Google or Supabase Storage.
        <img
          src={src}
          alt=""
          className="avatar__img"
          referrerPolicy="no-referrer"
          loading="lazy"
          decoding="async"
          onError={() => setFailed(src)}
        />
      ) : (
        letter
      )}
    </span>
  );
}
