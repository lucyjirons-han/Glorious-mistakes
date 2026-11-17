import { Illustration, type IllustrationProps } from './Illustration';

/** A waving hand saying "hi!". From the original style reference. */
export function WavingHand({ className }: IllustrationProps) {
  return (
    <Illustration viewBox="478 40 162 180" className={className}>
      <path
        className="ill-wash ill-sky"
        d="M486 140c0-44 34-74 76-70c40 4 64 34 60 76c-4 38-36 60-74 58c-36-2-62-26-62-64z"
      />
      <g transform="rotate(14 552 150)">
        <path
          className="ill-accent ill-sun"
          transform="translate(6 5)"
          d="M526 160V98a6.5 6.5 0 0 1 13 0V88a6.5 6.5 0 0 1 13 0V90a6.5 6.5 0 0 1 13 0V102a6.5 6.5 0 0 1 13 0V165a26 26 0 0 1-52 0z"
        />
        <path
          className="ill-accent ill-sage"
          d="M538 190c10 2 22 2 33 0l1 17c-11 2-23 2-34 0z"
        />
        <path className="ill-ln" d="M535 188c-1 6-1 11 0 16c11 2 23 2 34 0c1-6 1-11 0-17" />
        <path
          className="ill-paper"
          d="M526 160V98a6.5 6.5 0 0 1 13 0V88a6.5 6.5 0 0 1 13 0V90a6.5 6.5 0 0 1 13 0V102a6.5 6.5 0 0 1 13 0V165a26 26 0 0 1-52 0z"
        />
        <path
          className="ill-ln ill-paper"
          d="M527 150c-6-6-12-11-17-17c-5-7 4-14 10-8c3 3 5 6 8 9"
        />
        <path
          className="ill-ln"
          d="M526 162c-1-22-1-44 0-64c1-9 12-9 13 0c1 9 0 18 0 27M539 124c-1-12-1-24 0-36c1-9 12-9 13 0c1 12 0 24 0 37M552 124c0-12-1-23 0-34c1-9 12-9 13 0c1 12 1 24 0 35M565 126c0-8-1-16 0-24c1-9 12-9 13 0c2 22 1 42 0 63c-1 16-12 27-26 27c-15 0-26-10-26-28"
        />
      </g>
      <path
        className="ill-ln"
        d="M508 92q-9 13-5 28M496 86q-12 18-7 40M606 108q9 12 7 26M618 102q13 18 10 40"
      />
      <path
        className="ill-ln ill-paper"
        d="M596 52c10-2 20-2 28 0c10 3 10 20 0 23c-6 1-12 1-17 1l-8 8l1-8c-3 0-5-1-7-2c-9-4-8-19 3-22"
      />
      <text className="ill-text" x="609" y="68" textAnchor="middle">
        hi!
      </text>
    </Illustration>
  );
}
