'use client';

import { CircleAlert, Mail, PartyPopper } from 'lucide-react';
import { useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { Icon, IconBadge } from './Icon';
import {
  NEWSLETTER_LIMITS,
  validateNewsletter,
  type NewsletterErrors,
  type NewsletterInput,
} from '@/lib/newsletter';

type Field = keyof NewsletterInput;
type Status = 'idle' | 'sending' | 'done' | 'failed';

const FIELDS: Field[] = ['firstName', 'email'];

/** The newsletter sign-up band shown at the bottom of every page (anchor: #newsletter). */
export function NewsletterSignup() {
  const [values, setValues] = useState<NewsletterInput>({ firstName: '', email: '' });
  const [errors, setErrors] = useState<NewsletterErrors>({});
  const [status, setStatus] = useState<Status>('idle');
  const [subscribedName, setSubscribedName] = useState('');
  const refs = {
    firstName: useRef<HTMLInputElement>(null),
    email: useRef<HTMLInputElement>(null),
  };

  const set = (key: Field, value: string) => {
    setValues((v) => ({ ...v, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
    if (status === 'failed') setStatus('idle');
  };

  const showErrors = (found: NewsletterErrors) => {
    setErrors(found);
    const firstInvalid = FIELDS.find((k) => found[k]);
    if (firstInvalid) refs[firstInvalid].current?.focus();
    return Boolean(firstInvalid);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (status === 'sending') return;
    if (showErrors(validateNewsletter(values))) return;

    setStatus('sending');
    try {
      const payload = { firstName: values.firstName.trim(), email: values.email.trim() };
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.status === 422) {
        const data = (await res.json()) as { errors?: NewsletterErrors };
        setStatus('idle');
        showErrors(data.errors ?? {});
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setSubscribedName(payload.firstName);
      setStatus('done');
    } catch {
      setStatus('failed');
    }
  };

  const fieldProps = (name: Field) => ({
    id: `newsletter-${name}`,
    name,
    value: values[name],
    maxLength: NEWSLETTER_LIMITS[name],
    required: true,
    'aria-required': true,
    'aria-invalid': errors[name] ? true : undefined,
    'aria-describedby': errors[name] ? `newsletter-${name}-error` : undefined,
    onChange: (e: ChangeEvent<HTMLInputElement>) => set(name, e.target.value),
  });

  const error = (name: Field) =>
    errors[name] ? (
      <p id={`newsletter-${name}-error`} className="field__error">
        <Icon icon={CircleAlert} size={16} className="field__error-icon" />
        {errors[name]}
      </p>
    ) : null;

  return (
    <section id="newsletter" className="newsletter" aria-labelledby="newsletter-title">
      <div className="container newsletter__inner">
        <div className="newsletter__intro">
          <IconBadge icon={Mail} tone="sun" size="lg" />
          <h2 id="newsletter-title" className="newsletter__title">
            Get the Glorious Mistakes newsletter
          </h2>
          <p className="newsletter__lead">
            A short, friendly email with fan-favourite stuff-ups and the lessons behind them.
            Unsubscribe any time.
          </p>
        </div>

        {status === 'done' ? (
          <div className="newsletter__done" role="status">
            <IconBadge icon={PartyPopper} tone="sage" size="md" />
            <p>
              <strong>Thanks, {subscribedName}!</strong> You’re on the list.
            </p>
          </div>
        ) : (
          <form className="newsletter__form" onSubmit={handleSubmit} noValidate>
            <div className="field">
              <label htmlFor="newsletter-firstName" className="field__label">
                First name
              </label>
              <input
                ref={refs.firstName}
                type="text"
                autoComplete="given-name"
                className="input"
                {...fieldProps('firstName')}
              />
              {error('firstName')}
            </div>

            <div className="field">
              <label htmlFor="newsletter-email" className="field__label">
                Email address
              </label>
              <input
                ref={refs.email}
                type="email"
                inputMode="email"
                autoComplete="email"
                spellCheck={false}
                className="input"
                {...fieldProps('email')}
              />
              {error('email')}
            </div>

            <button
              type="submit"
              className="btn btn--primary newsletter__submit"
              aria-disabled={status === 'sending' || undefined}
            >
              {status === 'sending' ? 'Subscribing…' : 'Subscribe'}
            </button>

            <p className="newsletter__note">Both fields are required.</p>

            {status === 'failed' && (
              <p className="field__error newsletter__failed" role="alert">
                <Icon icon={CircleAlert} size={16} className="field__error-icon" />
                Something went wrong on our end. Please try again in a moment.
              </p>
            )}
          </form>
        )}
      </div>
    </section>
  );
}
