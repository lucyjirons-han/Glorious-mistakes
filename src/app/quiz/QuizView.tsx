'use client';

import { CircleAlert, Clock, Lightbulb, UserRound } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Icon } from '@/components/Icon';
import { QuizClipboard } from '@/components/illustrations';
import {
  formatQuizDate,
  QUIZ_QUESTIONS,
  QUIZ_STYLES,
  QUIZ_VERSION,
  scoreAnswers,
  yourResultHref,
  type StyleId,
} from '@/lib/quiz';
import { useQuizResults } from '@/lib/quiz-results';

const TOTAL = QUIZ_QUESTIONS.length;

export function QuizView() {
  const router = useRouter();
  const results = useQuizResults();
  const [step, setStep] = useState<'intro' | number>('intro');
  const [answers, setAnswers] = useState<(StyleId | null)[]>(() => QUIZ_QUESTIONS.map(() => null));
  const [error, setError] = useState(false);
  const [saving, setSaving] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstAnswerRef = useRef<HTMLInputElement>(null);

  // Each new question (and going back) moves focus to the question, so screen readers read it.
  useEffect(() => {
    if (step !== 'intro') headingRef.current?.focus();
  }, [step]);

  if (step === 'intro') {
    const last = results.ready ? results.latest : null;
    return (
      <div className="container page page--narrow">
        <header className="page-header">
          <p className="eyebrow">The mistake style quiz</p>
          <h1 className="page-header__title">What&rsquo;s your mistake style?</h1>
          <p className="page-header__lead">
            Seven quick questions about what you do after a stuff-up. No right answers, just honest ones.
          </p>
        </header>

        <section className="quiz-intro" aria-labelledby="quiz-intro-title">
          <h2 id="quiz-intro-title" className="sr-only">
            About the quiz
          </h2>
          <QuizClipboard className="quiz-intro__art" />
          <div className="quiz-intro__body">
            <ul className="quiz-intro__facts">
              <li>
                <Icon icon={Clock} size={18} /> About two minutes
              </li>
              <li>
                <Icon icon={UserRound} size={18} /> Open to everyone, no login needed
              </li>
              <li>
                <Icon icon={Lightbulb} size={18} /> You&rsquo;ll get a strength, a growth edge and a mistake worth logging
              </li>
            </ul>
            <div className="btn-row">
              <button type="button" className="btn btn--primary btn--lg" onClick={() => setStep(0)}>
                Start the quiz
              </button>
            </div>
            {last && (
              <p className="quiz-intro__last">
                Last time ({formatQuizDate(last.takenAt)}) you were {QUIZ_STYLES[last.style].name}.{' '}
                <Link href={yourResultHref(last.style)}>See that result</Link>
              </p>
            )}
          </div>
        </section>
      </div>
    );
  }

  const index = step;
  const question = QUIZ_QUESTIONS[index];
  const chosen = answers[index];
  const isLast = index === TOTAL - 1;

  const choose = (style: StyleId) => {
    setAnswers((prev) => prev.map((a, i) => (i === index ? style : a)));
    setError(false);
  };

  const goBack = () => {
    setError(false);
    setStep(index === 0 ? 'intro' : index - 1);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!chosen) {
      setError(true);
      firstAnswerRef.current?.focus();
      return;
    }
    if (!isLast) {
      setStep(index + 1);
      return;
    }
    setSaving(true);
    const { style, scores } = scoreAnswers(answers as StyleId[]);
    await results.record({ style, scores, version: QUIZ_VERSION, takenAt: new Date().toISOString() });
    router.push(yourResultHref(style));
  };

  return (
    <div className="container page page--narrow">
      <form className="quiz-question" onSubmit={handleSubmit} noValidate>
        <div className="quiz-progress">
          <p className="quiz-progress__label">
            Question {index + 1} of {TOTAL}
          </p>
          <div className="quiz-progress__bar" aria-hidden="true">
            <span style={{ width: `${((index + 1) / TOTAL) * 100}%` }} />
          </div>
        </div>

        <fieldset className="quiz-question__fieldset" aria-describedby={error ? 'quiz-error' : undefined}>
          <legend className="quiz-question__legend">
            <h1 ref={headingRef} tabIndex={-1} className="quiz-question__title">
              {question.question}
            </h1>
          </legend>
          {/* Keyed so each question gets fresh answers, not the last one's selected style fading out. */}
          <div key={question.id} className="choice-grid quiz-answers">
            {question.answers.map((answer, i) => (
              <label key={answer.style} className="choice choice--answer">
                <input
                  ref={i === 0 ? firstAnswerRef : undefined}
                  type="radio"
                  name={question.id}
                  value={answer.style}
                  checked={chosen === answer.style}
                  onChange={() => choose(answer.style)}
                  aria-invalid={error ? true : undefined}
                />
                <span>{answer.text}</span>
              </label>
            ))}
          </div>
          {error && (
            <p id="quiz-error" className="field__error">
              <Icon icon={CircleAlert} size={16} className="field__error-icon" />
              Pick the answer that sounds most like you. Close enough counts.
            </p>
          )}
        </fieldset>

        <div className="btn-row quiz-question__actions">
          <button type="button" className="btn btn--secondary" onClick={goBack} disabled={saving}>
            Back
          </button>
          <button type="submit" className="btn btn--primary" disabled={saving} aria-busy={saving || undefined}>
            {isLast ? (saving ? 'Working it out…' : 'See my style') : 'Next'}
          </button>
        </div>
      </form>
    </div>
  );
}
