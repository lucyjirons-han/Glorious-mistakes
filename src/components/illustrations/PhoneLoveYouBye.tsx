import { Illustration, type IllustrationProps } from './Illustration';

/** A phone mid-call with the boss, saying "love you, bye!". From the original style reference. */
export function PhoneLoveYouBye({ className }: IllustrationProps) {
  return (
    <Illustration viewBox="258 34 174 194" className={className}>
      <path
        className="ill-wash ill-blush"
        d="M276 150c-6-40 20-80 66-78c44 2 66 30 62 72c-4 40-34 62-70 60c-34-2-54-22-58-54z"
      />
      <g transform="rotate(8 340 150)">
        <path
          className="ill-accent ill-lilac"
          d="M318 108c18-3 40-3 58 0c3 30 3 68 0 98c-18 3-40 3-58 0c-3-30-3-68 0-98z"
        />
        <path
          className="ill-paper"
          d="M322 99c12-1 26-1 38 0c7 0 11 4 11 11c1 26 1 54 0 80c0 7-4 11-11 11c-12 1-26 1-38 0c-7 0-11-4-11-11c-1-26-1-54 0-80c0-7 4-11 11-11z"
        />
        <path
          className="ill-ln"
          d="M321 98c12-2 28-2 40 0c8 1 11 5 11 12c2 26 2 54 0 80c0 8-4 12-12 12c-12 2-28 2-40 0c-7-1-10-5-10-12c-2-26-2-54 0-80c0-7 4-11 13-13"
        />
        <path className="ill-ln" d="M333 109c5-1 11-1 16 0" />
        <circle className="ill-accent ill-sage" cx="343" cy="134" r="11" />
        <path className="ill-ln" d="M330 132c0-15 22-15 22 0c0 15-22 14-22-2" />
        <text className="ill-text" x="341" y="163" textAnchor="middle">
          Boss
        </text>
        <circle className="ill-blush" cx="342" cy="186" r="8" />
        <path className="ill-ln" d="M333 184c0-11 16-11 16 0c0 10-16 10-16-1" />
      </g>
      <g transform="rotate(-5 326 60)">
        <path
          className="ill-sun"
          d="M289 50c28-1 58-1 84 0c10 0 15 7 15 15s-5 15-15 15c-28 1-56 1-84 0c-10 0-15-7-15-15s5-15 15-15z"
        />
        <path
          className="ill-paper"
          d="M284 45c28-1 58-1 84 0c10 0 15 7 15 15s-5 15-15 15c-28 1-56 1-84 0c-10 0-15-7-15-15s5-15 15-15z"
        />
        <path
          className="ill-ln"
          d="M284 44c28-2 58-2 84 0c20 2 20 30 0 32c-10 1-22 1-32 1l-10 12l-3-12c-14 0-28 0-40-1c-20-2-20-30 2-32"
        />
        <text className="ill-text" x="326" y="65" textAnchor="middle">
          love you, bye!
        </text>
      </g>
      <path
        className="ill-ln ill-blush"
        transform="translate(404 94) rotate(14) scale(1.1)"
        d="M0 4c-6-5-9-9-6-12c2-2 5-1 6 1c1-2 4-3 6-1c3 3 0 7-6 12z"
      />
      <path
        className="ill-ln"
        transform="translate(416 66) rotate(-12) scale(0.75)"
        d="M0 4c-6-5-9-9-6-12c2-2 5-1 6 1c1-2 4-3 6-1c3 3 0 7-6 12z"
      />
      <path className="ill-ln" d="M282 118q-6 4 0 9q6 5 0 10" />
    </Illustration>
  );
}
