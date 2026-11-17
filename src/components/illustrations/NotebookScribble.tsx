import { Illustration, type IllustrationProps } from './Illustration';

/** A spiral notebook with a crossed-out scribble, and the pen that did it. */
export function NotebookScribble({ className }: IllustrationProps) {
  return (
    <Illustration viewBox="20 20 186 150" className={className}>
      <path
        className="ill-wash ill-lilac"
        d="M30 96c-2-36 30-62 72-62c42 0 72 22 70 60c-2 38-34 58-74 56c-40-2-66-20-68-54z"
      />
      <g transform="rotate(-6 95 92)">
        <path
          className="ill-accent ill-blush"
          d="M60 49c26-2 58-2 86 0c2 30 2 64 0 94c-28 2-58 2-86 0c-2-30-2-64 0-94z"
        />
        <path className="ill-paper" d="M54 44L140 43L141 138L53 139z" />
        <path
          className="ill-ln"
          d="M51 44c30-3 62-3 92-1M140 40c3 32 2 66 0 101M144 138c-30 3-62 3-93 0M54 142c-3-32-3-66-1-101"
        />
        {/* Spiral binding */}
        <path
          className="ill-ln"
          d="M59 56c-5-4-12-1-11 3c1 4 7 4 11 1M59 76c-5-4-12-1-11 3c1 4 7 4 11 1M59 96c-5-4-12-1-11 3c1 4 7 4 11 1M59 116c-5-4-12-1-11 3c1 4 7 4 11 1"
        />
        {/* Writing, then the bit that went wrong, scratched out */}
        <path className="ill-ln" d="M70 62c14-1 30-1 50 0M70 76c18-1 36-1 56 0M70 90c10-1 22-1 34 0" />
        <path className="ill-ln" d="M70 110c4-6 8 6 12 0s8 6 12 0s8 6 12 0s8 6 10 0" />
        <path className="ill-ln" d="M66 112l8-9l5 11l7-12l5 12l7-12l5 12l7-12l5 11l8-8" />
        <path className="ill-ln" d="M70 126c10-1 20-1 28 0" />
      </g>
      <g transform="rotate(28 158 96)">
        <path className="ill-accent ill-sun" d="M156 50c4-1 8-1 11 0l1 66c-4 1-8 1-12 0z" />
        <path className="ill-paper" d="M152 47c4-1 8-1 11 0l1 66l-6 12l-6-12z" />
        <path
          className="ill-ln"
          d="M150 48c5-2 10-2 15 0M152 46c-1 22-1 44 0 67M164 46c1 22 1 44 0 67M151 113c4 0 9 0 13 0M151 114l6 12l7-13M157 126v3M152 60c4 0 8 0 12 0M164 52c3 0 4 2 4 5l-1 16"
        />
      </g>
      <path className="ill-ln" d="M126 146q6 4 12 2M170 132q6 2 10-2M174 142q6 1 9-3M38 52q-6-6-4-14" />
    </Illustration>
  );
}
