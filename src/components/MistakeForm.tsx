'use client';

import { useRef, useState, type FormEvent } from 'react';
import { CATEGORIES, CRINGE_LEVELS, LIMITS } from '@/lib/constants';
import type { MistakeInput } from '@/lib/types';

type TextField = 'title' | 'whatHappened' | 'lesson';
type Errors = Partial<Record<TextField, string>>;

const EMPTY: MistakeInput = {
  title: '',
  whatHappened: '',
  lesson: '',
  category: 'work',
  cringe: 3,
  visibility: 'private',
  author: '',
};

interface MistakeFormProps {
  initial?: MistakeInput;
  submitLabel: string;
  onSubmit: (input: MistakeInput) => void;
  onCancel?: () => void;
}

function validate(values: MistakeInput): Errors {
  const errors: Errors = {};
  if (!values.title.trim()) errors.title = 'Give your mistake a headline, even a short one.';
  if (!values.whatHappened.trim()) errors.whatHappened = 'Tell us what happened (a sentence is fine).';
  if (!values.lesson.trim()) errors.lesson = "What did you take from it? That's the glorious bit.";
  return errors;
}

export function MistakeForm({ initial, submitLabel, onSubmit, onCancel }: MistakeFormProps) {
  const [values, setValues] = useState<MistakeInput>(initial ?? EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const refs = {
    title: useRef<HTMLInputElement>(null),
    whatHappened: useRef<HTMLTextAreaElement>(null),
    lesson: useRef<HTMLTextAreaElement>(null),
  };

  const set = <K extends keyof MistakeInput>(key: K, value: MistakeInput[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
    if (key in errors) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    const firstInvalid = (['title', 'whatHappened', 'lesson'] as const).find((k) => found[k]);
    if (firstInvalid) {
      refs[firstInvalid].current?.focus();
      return;
    }
    onSubmit(values);
  };

  const fieldProps = (name: TextField) => ({
    id: `field-${name}`,
    name,
    value: values[name],
    maxLength: LIMITS[name],
    required: true,
    'aria-invalid': errors[name] ? true : undefined,
    'aria-describedby': `field-${name}-hint${errors[name] ? ` field-${name}-error` : ''}`,
  });

  const counter = (name: TextField) => (
    <span className="field__count" aria-hidden="true">
      {values[name].length}/{LIMITS[name]}
    </span>
  );

  const error = (name: TextField) =>
    errors[name] ? (
      <p id={`field-${name}-error`} className="field__error">
        <span aria-hidden="true">⚠️</span> {errors[name]}
      </p>
    ) : null;

  return (
    <form className="mistake-form" onSubmit={handleSubmit} noValidate>
      {/* Step 1 */}
      <section className="form-step" aria-labelledby="step-what">
        <h2 id="step-what" className="form-step__title">
          <span className="form-step__num" aria-hidden="true">1</span> What happened?
        </h2>

        <div className="field">
          <label htmlFor="field-title" className="field__label">
            Headline
          </label>
          <p id="field-title-hint" className="field__hint">
            Sum it up like a tabloid would.
          </p>
          <input
            ref={refs.title}
            type="text"
            className="input"
            placeholder="e.g. Replied-all with a very private opinion"
            autoComplete="off"
            onChange={(e) => set('title', e.target.value)}
            {...fieldProps('title')}
          />
          <div className="field__footer">
            {error('title')}
            {counter('title')}
          </div>
        </div>

        <div className="field">
          <label htmlFor="field-whatHappened" className="field__label">
            The story
          </label>
          <p id="field-whatHappened-hint" className="field__hint">
            Set the scene. Dramatic re-enactments welcome.
          </p>
          <textarea
            ref={refs.whatHappened}
            className="input input--textarea"
            rows={4}
            placeholder="It was a normal Tuesday until…"
            onChange={(e) => set('whatHappened', e.target.value)}
            {...fieldProps('whatHappened')}
          />
          <div className="field__footer">
            {error('whatHappened')}
            {counter('whatHappened')}
          </div>
        </div>

        <fieldset className="field">
          <legend className="field__label">Category</legend>
          <div className="choice-grid choice-grid--chips">
            {CATEGORIES.map((c) => (
              <label key={c.id} className="choice choice--chip">
                <input
                  type="radio"
                  name="category"
                  value={c.id}
                  checked={values.category === c.id}
                  onChange={() => set('category', c.id)}
                />
                <span>
                  <span aria-hidden="true">{c.emoji}</span> {c.label}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="field">
          <legend className="field__label">Cringe-o-meter</legend>
          <div className="choice-grid choice-grid--cringe">
            {CRINGE_LEVELS.map((c) => (
              <label key={c.level} className="choice choice--cringe">
                <input
                  type="radio"
                  name="cringe"
                  value={c.level}
                  checked={values.cringe === c.level}
                  onChange={() => set('cringe', c.level)}
                />
                <span>
                  <span className="choice__emoji" aria-hidden="true">
                    {c.emoji}
                  </span>
                  {c.label}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      </section>

      {/* Step 2 */}
      <section className="form-step form-step--lesson" aria-labelledby="step-lesson">
        <h2 id="step-lesson" className="form-step__title">
          <span className="form-step__num" aria-hidden="true">2</span> What did it teach you?
        </h2>
        <div className="field">
          <label htmlFor="field-lesson" className="field__label">
            The lesson
          </label>
          <p id="field-lesson-hint" className="field__hint">
            Big or small, wise or ridiculous. &ldquo;Never again&rdquo; counts.
          </p>
          <textarea
            ref={refs.lesson}
            className="input input--textarea"
            rows={3}
            placeholder="Next time I'll…"
            onChange={(e) => set('lesson', e.target.value)}
            {...fieldProps('lesson')}
          />
          <div className="field__footer">
            {error('lesson')}
            {counter('lesson')}
          </div>
        </div>
      </section>

      {/* Step 3 */}
      <section className="form-step" aria-labelledby="step-share">
        <h2 id="step-share" className="form-step__title">
          <span className="form-step__num" aria-hidden="true">3</span> Keep it or share it?
        </h2>
        <fieldset className="field">
          <legend className="sr-only">Who can see this mistake</legend>
          <div className="choice-grid choice-grid--visibility">
            <label className="choice choice--card">
              <input
                type="radio"
                name="visibility"
                value="private"
                checked={values.visibility === 'private'}
                onChange={() => set('visibility', 'private')}
              />
              <span>
                <span className="choice__emoji" aria-hidden="true">🔒</span>
                <strong>Keep it private</strong>
                <span className="choice__desc">Just for me. A personal reflection.</span>
              </span>
            </label>
            <label className="choice choice--card">
              <input
                type="radio"
                name="visibility"
                value="public"
                checked={values.visibility === 'public'}
                onChange={() => set('visibility', 'public')}
              />
              <span>
                <span className="choice__emoji" aria-hidden="true">🌍</span>
                <strong>Share to the feed</strong>
                <span className="choice__desc">Others can say &ldquo;been there&rdquo;.</span>
              </span>
            </label>
          </div>
        </fieldset>

        {values.visibility === 'public' && (
          <div className="field">
            <label htmlFor="field-author" className="field__label">
              Name on the feed <span className="field__optional">(optional)</span>
            </label>
            <p id="field-author-hint" className="field__hint">
              Leave blank to post as Anonymous.
            </p>
            <input
              id="field-author"
              name="author"
              type="text"
              className="input"
              placeholder="Anonymous"
              autoComplete="nickname"
              maxLength={LIMITS.author}
              aria-describedby="field-author-hint"
              value={values.author}
              onChange={(e) => set('author', e.target.value)}
            />
          </div>
        )}
      </section>

      <div className="form-actions">
        {onCancel && (
          <button type="button" className="btn btn--ghost" onClick={onCancel}>
            Cancel
          </button>
        )}
        <button type="submit" className="btn btn--primary btn--lg">
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
