import { Illustration, type IllustrationProps } from './Illustration';

/** A microwave flinging a boiled egg across the room. From the original style reference. */
export function MicrowaveEgg({ className }: IllustrationProps) {
  return (
    <Illustration viewBox="40 46 182 170" className={className}>
      <path
        className="ill-wash ill-lilac"
        d="M52 112c10-30 60-34 100-28c36 4 62 18 58 52c-4 34-40 50-84 48c-44-2-86-26-74-72z"
      />
      <g transform="rotate(-6 130 140)">
        <path className="ill-paper" d="M61 98L201 97L201 180L60 181z" />
        <path
          className="ill-accent ill-sage"
          d="M77 113c28-3 60-2 88 1c2 18 1 40-2 58c-28 3-58 2-86-1c-2-20-2-40 0-58z"
        />
        <path
          className="ill-ln"
          d="M58 98c30-4 100-3 146-1M201 94c3 28 2 60-1 88M204 180c-40 3-104 3-148-1M60 184c-3-30-2-60 1-90"
        />
        <path
          className="ill-ln"
          d="M71 108c30-3 60-3 90 0c3 20 2 42 0 60c-30 3-60 2-90 0c-2-20-3-40 0-61"
        />
        <path
          className="ill-ln"
          d="M176 120c0-7 10-7 10 0c0 7-10 7-10 1M176 139c0-7 10-7 10 0c0 7-10 6-10 0M174 157c5-1 9-1 13 0M76 183l-1 7M186 182l1 7"
        />
        <path
          className="ill-ln ill-paper"
          d="M94 140c-6-10 2-18 10-16c2-10 16-12 20-2c10-4 18 6 12 14c8 8 0 18-10 16c-4 8-16 8-20 0c-10 2-18-4-12-12z"
        />
        <circle className="ill-sun" cx="118" cy="140" r="7" />
        <path className="ill-ln" d="M109 138c0-10 15-10 15 0c0 10-15 9-15-1" />
        <path className="ill-ln" d="M118 88q-6-16-20-20M142 86q4-16 18-22M130 84q1-10-1-18" />
        <circle className="ill-sun" cx="96" cy="67" r="4" />
        <path className="ill-ln" d="M91 66c0-6 9-6 9 0c0 6-9 5-9-1" />
        <circle className="ill-sun" cx="165" cy="63" r="5" />
        <path className="ill-ln" d="M158 62c0-8 11-8 11 0c0 7-11 7-11-1" />
        <path className="ill-ln ill-paper" d="M120 60q8-11 16 0l-3 3-3-3-2 3-3-3-2 3z" />
      </g>
      <path
        className="ill-ln"
        d="M192 84q4-5 0-10q-4-5 0-10M84 208q6 4 12 0M166 202q6 4 12 0M58 76v11M52 82h12"
      />
    </Illustration>
  );
}
