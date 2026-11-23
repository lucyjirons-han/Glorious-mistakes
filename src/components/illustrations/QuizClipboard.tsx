import { Illustration, type IllustrationProps } from './Illustration';

/** A clipboard quiz: one box ticked, one crossed, one still deciding, and the pencil doing it. */
export function QuizClipboard({ className }: IllustrationProps) {
  return (
    <Illustration viewBox="24 14 196 196" className={className}>
      <path
        className="ill-wash ill-lilac"
        d="M36 116c-4-48 32-86 84-86c50 0 88 30 86 80c-2 50-38 82-88 80c-48-2-78-28-82-74z"
      />
      <g transform="rotate(-7 118 116)">
        {/* Board, with its offset accent */}
        <path
          className="ill-accent ill-sky"
          d="M78 52c34-2 68-1 100 2c2 48 2 96 0 144c-34 2-68 2-102 0c-3-48-3-96 2-146z"
        />
        <path className="ill-paper" d="M70 44c34-2 68-1 100 2c2 48 2 96 0 144c-34 2-68 2-102 0c-3-48-3-96 2-146z" />
        <path
          className="ill-ln"
          d="M66 46c36-4 72-3 106 0M171 42c3 50 2 100-1 150M174 190c-36 3-72 3-108 0M68 194c-4-50-4-100 0-150"
        />
        {/* Clip */}
        <path className="ill-accent ill-sun" d="M101 35c12-1 25-1 36 0l2 16c-13 1-27 1-40 0z" />
        <path className="ill-ln" d="M99 36c13-2 27-2 40 0l2 16c-14 2-29 2-43 0zM111 34c1-9 15-9 17 0" />
        {/* Three questions: ticked, crossed, undecided */}
        <path
          className="ill-ln"
          d="M83 72c6-1 12-1 18 1c1 5 1 10 0 15c-6 1-12 1-18 0c-1-5-1-11 0-16zM83 104c6-1 12-1 18 1c1 5 1 10 0 15c-6 1-12 1-18 0c-1-5-1-11 0-16zM83 136c6-1 12-1 18 1c1 5 1 10 0 15c-6 1-12 1-18 0c-1-5-1-11 0-16z"
        />
        <path className="ill-ln" d="M85 79l6 7c5-11 11-19 20-26" />
        <path className="ill-ln" d="M86 107l13 12M99 106l-12 13" />
        <path
          className="ill-ln"
          d="M112 78c14-1 30-1 44 1M112 86c10 0 20 0 28-1M112 110c14-1 30 0 46 0M112 118c8 0 16 0 24 0M112 142c14 0 28-1 42 0M112 150c10 1 20 0 30-1"
        />
        <path className="ill-ln" d="M84 172c8-5 14 5 22 0s14 5 22 0s14 5 20 0" />
      </g>
      {/* Pencil, with its eraser nearly worn down */}
      <g transform="rotate(32 184 132)">
        <path className="ill-accent ill-sun" d="M181 92c4-1 8-1 11 0l1 66c-4 1-8 1-12 0z" />
        <path className="ill-paper" d="M177 89c4-1 8-1 11 0l1 66l-6 12l-6-12z" />
        <path className="ill-accent ill-blush" d="M177 80c4-1 8-1 11 0l0 9c-4 1-7 1-11 0z" />
        <path
          className="ill-ln"
          d="M175 90c5-2 10-2 15 0M177 88c-1 22-1 44 0 67M189 88c1 22 1 44 0 67M176 155c4 0 9 0 13 0M176 156l6 12l7-13M182 168v3M176 80c4-2 9-2 13 0M177 79v10M188 79v10"
        />
      </g>
      {/* Motion marks and the one sparkle */}
      <path className="ill-ln" d="M206 182q8 2 12-4M200 194q8 1 12-4M46 70q-6-8-4-18M38 92q-8-4-10-12M196 34v12M190 40h12" />
    </Illustration>
  );
}
