import { Illustration, type IllustrationProps } from './Illustration';

/** A paper plane mid-flight, trailing a loopy line. The plane drifts gently (see `.ill-drift`). */
export function PaperPlane({ className }: IllustrationProps) {
  return (
    <Illustration viewBox="14 16 216 140" className={className}>
      <path
        className="ill-wash ill-sky"
        d="M96 92c4-36 42-58 84-52c34 6 48 32 42 60c-6 30-40 46-76 42c-34-4-54-20-50-50z"
      />
      {/* Loopy trail */}
      <path
        className="ill-ln"
        strokeDasharray="12 6"
        d="M22 140c20-4 36-14 48-28c12-14 28-14 30-2c2 12-14 18-20 8c-6-10 8-22 22-28c12-6 22-10 30-16"
      />
      <g className="ill-drift">
        <g transform="rotate(-10 164 70)">
          <path className="ill-accent ill-lilac" d="M204 70L160 80L148 104z" />
          <path className="ill-paper" d="M198 62L128 38L152 72L140 96z" />
          <path
            className="ill-ln"
            d="M126 37c26 8 50 16 74 25M199 60c-20 12-40 24-60 37M138 98c4-8 8-16 13-26M128 40c8 10 16 22 24 32M152 72c14-3 30-7 46-10"
          />
        </g>
        <path className="ill-ln" d="M212 42q6-1 9 3M214 66q6 1 8 5" />
      </g>
      <path className="ill-ln" d="M112 30q-8-1-14 3M104 42q-6 0-10 2" />
    </Illustration>
  );
}
