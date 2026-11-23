'use client';

import { ArrowRight, Shapes } from 'lucide-react';
import Link from 'next/link';
import { Icon, IconBadge } from './Icon';
import { formatQuizDate, isRetakeDue, QUIZ_STYLES, retakeDate, yourResultHref } from '@/lib/quiz';
import { useQuizResults } from '@/lib/quiz-results';

/**
 * A strip on "My mistakes" about the mistake style quiz: an invitation to take it, the visitor's
 * current style, or (for accounts, three months on) a nudge to retake it and see if it's shifted.
 */
export function QuizStyleNudge() {
  const results = useQuizResults();
  if (!results.ready) return null;
  const latest = results.latest;

  if (!latest) {
    return (
      <aside className="quiz-nudge" aria-label="Mistake style quiz">
        <IconBadge icon={Shapes} tone="lilac" />
        <p className="quiz-nudge__text">
          <strong>What&rsquo;s your mistake style?</strong> Seven quick questions about what you do after a stuff-up.
        </p>
        <Link href="/quiz" className="btn btn--sm btn--secondary">
          Take the quiz <Icon icon={ArrowRight} size={16} />
        </Link>
      </aside>
    );
  }

  const style = QUIZ_STYLES[latest.style];
  const due = results.hasAccount && isRetakeDue(latest.takenAt);

  return (
    <aside className="quiz-nudge" aria-label="Your mistake style">
      <IconBadge icon={style.icon} tone={style.tone} />
      <p className="quiz-nudge__text">
        {due ? (
          <>
            <strong>Three months on. Has your mistake style shifted?</strong> Last time you were {style.name}.
          </>
        ) : (
          <>
            <strong>Your mistake style: {style.name}.</strong>{' '}
            {results.hasAccount
              ? `Retake from ${formatQuizDate(retakeDate(latest.takenAt))} to see if it shifts.`
              : style.tagline}
          </>
        )}
      </p>
      <Link href={due ? '/quiz' : yourResultHref(latest.style)} className="btn btn--sm btn--secondary">
        {due ? 'Retake the quiz' : 'See your result'} <Icon icon={ArrowRight} size={16} />
      </Link>
    </aside>
  );
}
