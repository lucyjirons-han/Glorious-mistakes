'use client';

import { CalendarClock, CalendarPlus, CircleCheck, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Icon, IconBadge } from '@/components/Icon';
import { useToast } from '@/components/Toast';
import { loginHref } from '@/lib/login';
import {
  formatQuizDate,
  isRetakeDue,
  QUIZ_STYLES,
  retakeDate,
  styleHref,
  yourResultHref,
  type StyleId,
} from '@/lib/quiz';
import { retakeReminderFile, useQuizResults, type SavedQuizResult } from '@/lib/quiz-results';
import { SITE_URL } from '@/lib/site';

/**
 * Under a result: the visitor's own options. Guests are offered "save this and retake in three
 * months" (which needs an account); logged-in people see when to retake and their history.
 * Someone who opened a shared link gets an invitation to take the quiz.
 */
export function QuizResultPanel({ styleId, you }: { styleId: StyleId; you: boolean }) {
  const results = useQuizResults();

  if (!you) return <TakeTheQuiz />;
  if (!results.ready) return <div className="quiz-panel quiz-panel--loading" aria-busy="true" />;

  const latest = results.latest;
  if (!latest) return <TakeTheQuiz />;

  if (!results.accountsAvailable) {
    return (
      <section className="quiz-panel" aria-labelledby="quiz-panel-title">
        <h2 id="quiz-panel-title" className="quiz-panel__title">
          Kept on this device
        </h2>
        <p>Your result is saved in this browser. Retake the quiz any time to see if it shifts.</p>
        <div className="btn-row">
          <Link href="/quiz" className="btn btn--secondary">
            <Icon icon={RotateCcw} size={18} /> Retake the quiz
          </Link>
        </div>
      </section>
    );
  }

  if (!results.hasAccount) {
    return (
      <section className="quiz-panel quiz-panel--save" aria-labelledby="quiz-panel-title">
        <IconBadge icon={CalendarClock} tone="lilac" size="lg" />
        <h2 id="quiz-panel-title" className="quiz-panel__title">
          Save this and retake in three months to see if it shifts
        </h2>
        <p>
          Mistake styles change as you grow. Log in with Google to save your result, then come back in
          three months to see whether yours has moved. It&rsquo;s free, and your name stays off everything.
        </p>
        <div className="btn-row">
          <Link href={loginHref(yourResultHref(styleId))} className="btn btn--primary">
            Log in to save it
          </Link>
          <Link href="/quiz" className="btn btn--secondary">
            Retake now
          </Link>
        </div>
        <p className="quiz-panel__note">Until then, your result is kept on this device only.</p>
      </section>
    );
  }

  return <AccountPanel latest={latest} history={results.history} onRemove={results.remove} />;
}

function TakeTheQuiz() {
  return (
    <section className="quiz-panel" aria-labelledby="quiz-panel-title">
      <h2 id="quiz-panel-title" className="quiz-panel__title">
        What&rsquo;s your mistake style?
      </h2>
      <p>Seven quick questions about what you do after a stuff-up. About two minutes, no login needed.</p>
      <div className="btn-row">
        <Link href="/quiz" className="btn btn--primary">
          Take the quiz
        </Link>
      </div>
    </section>
  );
}

function AccountPanel({
  latest,
  history,
  onRemove,
}: {
  latest: { style: StyleId; takenAt: string };
  history: SavedQuizResult[];
  onRemove: (id: number) => Promise<void>;
}) {
  const toast = useToast();
  const [confirming, setConfirming] = useState<number | null>(null);
  const due = isRetakeDue(latest.takenAt);
  const retakeOn = retakeDate(latest.takenAt);
  const previous = history.find((r) => r.takenAt !== latest.takenAt && new Date(r.takenAt) < new Date(latest.takenAt));
  const name = QUIZ_STYLES[latest.style].name;

  const addReminder = () => {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(retakeReminderFile(retakeOn, `${SITE_URL}/quiz`));
    link.download = 'retake-mistake-style-quiz.ics';
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    toast('Reminder downloaded. Open it to add it to your calendar.');
  };

  const remove = async (id: number) => {
    try {
      await onRemove(id);
      setConfirming(null);
      toast('Removed that result');
    } catch {
      toast('We couldn’t remove that result. Please try again.');
    }
  };

  return (
    <section className="quiz-panel quiz-panel--saved" aria-labelledby="quiz-panel-title">
      <IconBadge icon={CircleCheck} tone="sage" size="lg" />
      <h2 id="quiz-panel-title" className="quiz-panel__title">
        {due ? 'Three months on. Has it shifted?' : 'Saved to your account'}
      </h2>
      {previous && (
        <p className="quiz-panel__shift">
          {previous.style === latest.style
            ? `Still ${name}, same as on ${formatQuizDate(previous.takenAt)}.`
            : `You’ve shifted from ${QUIZ_STYLES[previous.style].name} to ${name} since ${formatQuizDate(previous.takenAt)}.`}
        </p>
      )}
      <p>
        {due
          ? 'It’s been three months since your last result. Retake the quiz to see whether your style has moved.'
          : `Retake from ${formatQuizDate(retakeOn)} to see whether your style shifts.`}
      </p>
      <div className="btn-row">
        {due ? (
          <Link href="/quiz" className="btn btn--primary">
            <Icon icon={RotateCcw} size={18} /> Retake the quiz
          </Link>
        ) : (
          <>
            <button type="button" className="btn btn--primary" onClick={addReminder}>
              <Icon icon={CalendarPlus} size={18} /> Add a reminder to my calendar
            </button>
            <Link href="/quiz" className="btn btn--secondary">
              Retake now
            </Link>
          </>
        )}
      </div>

      {history.length > 0 && (
        <div className="quiz-history">
          <h3 className="quiz-history__title">Your mistake style over time</h3>
          <ol className="quiz-history__list">
            {history.map((r) => {
              const style = QUIZ_STYLES[r.style];
              return (
                <li key={r.id} className="quiz-history__item">
                  <IconBadge icon={style.icon} tone={style.tone} size="sm" />
                  <span className="quiz-history__date">{formatQuizDate(r.takenAt)}</span>
                  <Link href={styleHref(r.style)} className="quiz-history__style">
                    {style.name}
                  </Link>
                  {confirming === r.id ? (
                    <span className="quiz-history__confirm">
                      <span>Remove?</span>
                      <button type="button" className="btn btn--sm btn--danger" onClick={() => remove(r.id)}>
                        Yes<span className="sr-only">, remove the result from {formatQuizDate(r.takenAt)}</span>
                      </button>
                      {/* Focus lands on the safe choice, since the Remove button it replaces is gone. */}
                      <button
                        type="button"
                        className="btn btn--sm btn--secondary"
                        onClick={() => setConfirming(null)}
                        autoFocus
                      >
                        No
                      </button>
                    </span>
                  ) : (
                    <button
                      type="button"
                      className="btn btn--sm btn--ghost quiz-history__remove"
                      onClick={() => setConfirming(r.id)}
                    >
                      Remove<span className="sr-only"> the result from {formatQuizDate(r.takenAt)}</span>
                    </button>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </section>
  );
}
