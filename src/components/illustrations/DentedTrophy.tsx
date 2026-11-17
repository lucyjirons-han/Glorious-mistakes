import { Illustration, type IllustrationProps } from './Illustration';

/** A trophy with a dent in its side, still wobbling proudly on its base. */
export function DentedTrophy({ className }: IllustrationProps) {
  return (
    <Illustration viewBox="30 30 200 230" className={className}>
      <path
        className="ill-wash ill-blush"
        d="M44 150c-6-60 34-110 92-108c58 2 86 46 82 104c-4 60-44 96-96 92c-52-4-74-34-78-88z"
      />
      <g transform="rotate(-5 130 140)">
        {/* Cup */}
        <path
          className="ill-paper"
          d="M78 62c34-4 70-4 104 0c0 14-1 26-4 36c-7 2-12 6-13 11c3 4 6 8 6 12c-4 14-12 24-25 29c-10 4-22 4-32 0c-26-14-36-48-36-88z"
        />
        <path
          className="ill-accent ill-sun"
          d="M86 70c30-3 58-3 88 0c-1 10-2 18-4 25c-7 3-11 7-11 12c3 4 5 8 5 12c-4 14-12 23-24 30c-9 4-20 4-29 0c-23-13-24-44-25-79z"
        />
        <path className="ill-ln" d="M74 61c36-5 76-5 112 1M80 70c32 3 66 3 100-1" />
        <path className="ill-ln" d="M78 58c-1 44 10 78 38 92" />
        {/* Right side, with the dent */}
        <path className="ill-ln" d="M182 60c0 14-1 26-4 36c-7 2-12 6-13 11c3 4 6 8 6 12c-4 14-12 24-26 31" />
        <path className="ill-ln" d="M171 101c-3 1-5 3-6 5M170 114c-2 2-4 3-7 3" />
        <path className="ill-ln" d="M114 150c10 4 22 4 32-1" />
        {/* Engraved star */}
        <path className="ill-ln" d="M130 86l4 10l10 1l-8 6l3 10l-9-6l-9 6l3-10l-8-7l10 0z" />
        {/* Handles */}
        <path className="ill-ln" d="M80 76c-22-4-30 10-24 22c5 12 18 16 30 16" />
        <path className="ill-ln" d="M180 76c22-6 32 8 26 20c-5 12-16 18-28 18" />
        {/* Stem */}
        <path className="ill-ln" d="M120 152c2 12 2 24-2 36M142 151c-2 12-2 24 2 37M116 166c10 2 20 2 30 0" />
        {/* Base */}
        <path
          className="ill-accent ill-lilac"
          d="M96 196c26-3 54-3 80 0l4 38c-30 3-58 3-88 0z"
        />
        <path className="ill-paper" d="M90 190c26-3 54-3 80 0l4 38c-30 3-58 3-88 0z" />
        <path
          className="ill-ln"
          d="M86 189c30-4 60-4 88 1M172 186c3 14 4 28 3 43M178 228c-32 4-64 4-94 0M88 232c-2-14-1-28 2-44"
        />
        <path
          className="ill-ln"
          d="M108 204c14-1 30-1 44 0c1 6 1 10 0 14c-14 1-30 1-44 0c-1-4-1-8 0-14"
        />
      </g>
      {/* Wobble marks and the one sparkle */}
      <path
        className="ill-ln"
        d="M70 248q10 6 20 2M168 250q10 4 18-2M52 120q-8 10-6 24M40 114q-10 14-8 32M210 40v12M204 46h12"
      />
    </Illustration>
  );
}
