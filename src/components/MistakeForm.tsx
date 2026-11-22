'use client';

import { CircleAlert, Globe, Handshake, Lock, PenLine, VenetianMask } from 'lucide-react';
import Link from 'next/link';
import { useRef, useState, type FormEvent } from 'react';
import { Avatar } from './Avatar';
import { Icon, IconBadge } from './Icon';
import { useAuth } from '@/lib/auth';
import { readJSON, writeJSON } from '@/lib/community';
import { CATEGORIES, CRINGE_LEVELS, LIMITS } from '@/lib/constants';
import { avatarSrc, profileName } from '@/lib/profiles';
import type { MistakeInput } from '@/lib/types';

type TextField = 'title' | 'whatHappened' | 'lesson';
type Errors = Partial<Record<TextField, string>>;

/** How a shared entry is signed: with the profile name, anonymously, or with any other name. */
type AuthorMode = 'profile' | 'anonymous' | 'custom';

/** The last way they signed a new entry, so the next one starts the same. */
const AUTHOR_MODE_KEY = 'glorious-mistakes:author-mode:v1';

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
  const { user, publicProfile } = useAuth();
  const ownName = publicProfile ? profileName(publicProfile) : '';
  const [values, setValues] = useState<MistakeInput>(initial ?? EMPTY);
  const [authorMode, setAuthorMode] = useState<AuthorMode>(() => {
    if (initial) {
      const author = initial.author.trim();
      if (!author) return 'anonymous';
      return ownName && author === ownName ? 'profile' : 'custom';
    }
    const last = readJSON<AuthorMode | null>(AUTHOR_MODE_KEY, null);
    if (last === 'profile') return ownName ? 'profile' : 'anonymous';
    return last === 'custom' ? 'custom' : 'anonymous';
  });
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
    // Without a profile there's just the name box, which is "custom" (blank means Anonymous).
    const mode: AuthorMode = ownName ? authorMode : 'custom';
    const author = mode === 'profile' ? ownName : mode === 'anonymous' ? '' : values.author;
    if (!initial && values.visibility === 'public') writeJSON(AUTHOR_MODE_KEY, mode);
    onSubmit({ ...values, author });
  };

  /** "Links to your profile" only when the profile is public and lists entries. */
  const profileLinked = !!publicProfile?.isPublic && !!publicProfile.showEntries;

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
        <Icon icon={CircleAlert} size={16} className="field__error-icon" />
        {errors[name]}
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
              <label key={c.id} className={`choice choice--chip tint--${c.id}`}>
                <input
                  type="radio"
                  name="category"
                  value={c.id}
                  checked={values.category === c.id}
                  onChange={() => set('category', c.id)}
                />
                <span>{c.label}</span>
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
                  <IconBadge icon={c.icon} tone="neutral" className="choice__icon" />
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
                <IconBadge icon={Lock} tone="lilac" className="choice__icon" />
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
                <IconBadge icon={Globe} tone="sky" className="choice__icon" />
                <strong>Share to the feed</strong>
                <span className="choice__desc">Others can say &ldquo;been there&rdquo;.</span>
              </span>
            </label>
          </div>
        </fieldset>

        {values.visibility === 'public' && (
          <p className="field__hint">
            <Icon icon={Handshake} size={16} className="inline-icon" /> Laugh with, not at: please don&rsquo;t name anyone else
            or share private details.{' '}
            <a href="/guidelines" target="_blank" rel="noopener">
              Community guidelines
            </a>
          </p>
        )}

        {values.visibility === 'public' && ownName && (
          <fieldset className="field">
            <legend className="field__label">Post as</legend>
            <div className="choice-grid choice-grid--author">
              <label className="choice choice--card">
                <input
                  type="radio"
                  name="author-mode"
                  value="profile"
                  checked={authorMode === 'profile'}
                  onChange={() => setAuthorMode('profile')}
                />
                <span>
                  <Avatar src={avatarSrc(publicProfile!)} name={ownName} className="choice__icon" />
                  <strong className="choice__name">{ownName}</strong>
                  <span className="choice__desc">
                    {profileLinked ? 'Your profile name. Links to your profile.' : 'Your profile name.'}
                  </span>
                </span>
              </label>
              <label className="choice choice--card">
                <input
                  type="radio"
                  name="author-mode"
                  value="anonymous"
                  checked={authorMode === 'anonymous'}
                  onChange={() => setAuthorMode('anonymous')}
                />
                <span>
                  <IconBadge icon={VenetianMask} tone="neutral" className="choice__icon" />
                  <strong>Anonymous</strong>
                  <span className="choice__desc">No name, and no link to your profile.</span>
                </span>
              </label>
              <label className="choice choice--card">
                <input
                  type="radio"
                  name="author-mode"
                  value="custom"
                  checked={authorMode === 'custom'}
                  onChange={() => setAuthorMode('custom')}
                />
                <span>
                  <IconBadge icon={PenLine} tone="blush" className="choice__icon" />
                  <strong>Another name</strong>
                  <span className="choice__desc">A nickname, just for this one.</span>
                </span>
              </label>
            </div>
          </fieldset>
        )}

        {values.visibility === 'public' && (!ownName || authorMode === 'custom') && (
          <div className="field">
            <label htmlFor="field-author" className="field__label">
              {ownName ? 'Name for this entry' : 'Name on the feed'} <span className="field__optional">(optional)</span>
            </label>
            <p id="field-author-hint" className="field__hint">
              Leave blank to post as Anonymous.
              {ownName && profileLinked && ' Named entries link to your profile.'}
              {!ownName && user && (
                <>
                  {' '}
                  Or <Link href="/profile">set up a profile</Link> to post under your profile name with one click.
                </>
              )}
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
