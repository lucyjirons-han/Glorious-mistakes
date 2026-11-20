'use client';

import { CircleAlert, LogIn, LogOut, UserRoundX } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { EmptyState } from '@/components/EmptyState';
import { Icon } from '@/components/Icon';
import { useToast } from '@/components/Toast';
import { PROFILE_LIMITS, useAuth } from '@/lib/auth';
import { loginHref } from '@/lib/login';
import { NEWSLETTER_LIMITS } from '@/lib/newsletter';
import { getSupabase } from '@/lib/supabase';

interface Values {
  firstName: string;
  lastName: string;
  email: string;
  newsletter: boolean;
}

type Errors = Partial<Record<'firstName' | 'lastName' | 'email', string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(values: Values): Errors {
  const errors: Errors = {};
  const firstName = values.firstName.trim();
  if (firstName.length > PROFILE_LIMITS.firstName) {
    errors.firstName = `Keep it to ${PROFILE_LIMITS.firstName} characters or fewer.`;
  } else if (values.newsletter && !firstName) {
    errors.firstName = 'Add your first name to get the newsletter (we use it to say hello).';
  }
  if (values.lastName.trim().length > PROFILE_LIMITS.lastName) {
    errors.lastName = `Keep it to ${PROFILE_LIMITS.lastName} characters or fewer.`;
  }
  const email = values.email.trim();
  if (!email) errors.email = 'Enter your email address.';
  else if (email.length > NEWSLETTER_LIMITS.email || !EMAIL_PATTERN.test(email))
    errors.email = 'That doesn’t look like an email address. Check for typos, like name@example.com.';
  return errors;
}

export function SettingsView() {
  const auth = useAuth();

  const header = (
    <header className="page-header">
      <p className="eyebrow">Your account</p>
      <h1 className="page-header__title">Settings</h1>
      <p className="page-header__lead">Your name, email address and newsletter, all in one place.</p>
    </header>
  );

  if (!auth.available) {
    return (
      <div className="container page">
        {header}
        <EmptyState icon={UserRoundX} title="Accounts aren’t available right now">
          <p>Your mistakes are saved on this device in the meantime.</p>
        </EmptyState>
      </div>
    );
  }

  if (!auth.ready) {
    return (
      <div className="container page">
        {header}
        <div className="card card--skeleton" aria-busy="true" />
      </div>
    );
  }

  if (!auth.user) {
    return (
      <div className="container page">
        {header}
        <EmptyState
          icon={LogIn}
          title="Log in to change your settings"
          action={
            <Link href={loginHref('/settings')} className="btn btn--primary">
              Log in
            </Link>
          }
        >
          <p>Settings belong to your account. Log in with Google and they&rsquo;ll be right here.</p>
        </EmptyState>
      </div>
    );
  }

  return (
    <div className="container page">
      {header}
      {/* Keyed on the account so the form starts fresh if someone else logs in. */}
      <SettingsForm key={auth.user.id} />
    </div>
  );
}

function SettingsForm() {
  const { user, profile, saveProfile, signOut } = useAuth();
  const toast = useToast();
  const supabase = getSupabase()!;

  const saved = useRef<Values>({
    firstName: profile?.firstName ?? '',
    lastName: profile?.lastName ?? '',
    email: user?.email ?? '',
    newsletter: false,
  });
  const [values, setValues] = useState<Values>(saved.current);
  const [errors, setErrors] = useState<Errors>({});
  const [newsletterLoaded, setNewsletterLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const refs = {
    firstName: useRef<HTMLInputElement>(null),
    lastName: useRef<HTMLInputElement>(null),
    email: useRef<HTMLInputElement>(null),
  };

  useEffect(() => {
    let cancelled = false;
    supabase.rpc('my_newsletter_subscription').then(({ data, error }) => {
      if (cancelled) return;
      if (error) console.error('Glorious Mistakes: couldn’t check your newsletter setting', error);
      const subscribed = !error && data === true;
      saved.current = { ...saved.current, newsletter: subscribed };
      setValues((v) => ({ ...v, newsletter: subscribed }));
      setNewsletterLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, [supabase]);

  const set = <K extends keyof Values>(key: K, value: Values[K]) => setValues((v) => ({ ...v, [key]: value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    const firstInvalid = (['firstName', 'lastName', 'email'] as const).find((k) => found[k]);
    if (firstInvalid) {
      refs[firstInvalid].current?.focus();
      return;
    }

    const next: Values = {
      ...values,
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      email: values.email.trim(),
    };
    const before = saved.current;
    const nameChanged = next.firstName !== before.firstName || next.lastName !== before.lastName;
    const emailChanged = next.email.toLowerCase() !== before.email.toLowerCase();
    // Re-save the subscription when the first name changes too, so the list greets them properly.
    const newsletterChanged =
      newsletterLoaded && (next.newsletter !== before.newsletter || (next.newsletter && next.firstName !== before.firstName));

    if (!nameChanged && !emailChanged && !newsletterChanged) {
      toast('Nothing to save: everything’s up to date.');
      return;
    }

    setBusy(true);
    const done: string[] = [];
    const failed: string[] = [];

    if (nameChanged) {
      try {
        await saveProfile({ firstName: next.firstName, lastName: next.lastName });
        saved.current = { ...saved.current, firstName: next.firstName, lastName: next.lastName };
        done.push('Saved your name.');
      } catch (error) {
        console.error('Glorious Mistakes: couldn’t save your name', error);
        failed.push('your name');
      }
    }

    if (newsletterChanged) {
      const { error } = await supabase.rpc('set_my_newsletter_subscription', {
        subscribed: next.newsletter,
        first_name: next.firstName,
      });
      if (error) {
        console.error('Glorious Mistakes: couldn’t change your newsletter setting', error.code, error.message);
        failed.push('your newsletter setting');
      } else {
        if (next.newsletter !== saved.current.newsletter) {
          done.push(next.newsletter ? 'You’re on the newsletter list.' : 'You’re off the newsletter list.');
        }
        saved.current = { ...saved.current, newsletter: next.newsletter };
      }
    }

    if (emailChanged) {
      const { error } = await supabase.auth.updateUser(
        { email: next.email },
        { emailRedirectTo: `${window.location.origin}/settings` },
      );
      if (error) {
        console.error('Glorious Mistakes: couldn’t change your email address', error.code, error.message);
        setErrors({
          email:
            error.code === 'email_exists'
              ? 'That email address already belongs to another account.'
              : 'We couldn’t change your email address just now. Please try again later.',
        });
        failed.push('your email address');
      } else {
        // Nothing changes until they click the link in the confirmation email.
        setValues((v) => ({ ...v, email: before.email }));
        done.push('Check your inbox to confirm your new email address.');
      }
    }

    setBusy(false);
    toast(failed.length ? `Sorry, we couldn’t save ${failed.join(' or ')}. ${done.join(' ')}`.trim() : done.join(' '));
  };

  const describedBy = (key: keyof Errors, hint?: boolean) =>
    [hint ? `settings-${key}-hint` : '', errors[key] ? `settings-${key}-error` : ''].filter(Boolean).join(' ') ||
    undefined;

  const errorFor = (key: keyof Errors) =>
    errors[key] && (
      <p id={`settings-${key}-error`} className="field__error">
        <Icon icon={CircleAlert} size={16} className="field__error-icon" />
        {errors[key]}
      </p>
    );

  return (
    <>
      <form className="settings-form" onSubmit={handleSubmit} noValidate>
        <fieldset className="settings-form__group" aria-describedby="settings-name-hint">
          <legend>Your name</legend>
          <p id="settings-name-hint" className="field__hint">
            Just for your account and the newsletter. It doesn&rsquo;t appear on your entries; each entry has its own
            display name.
          </p>
          <div className="settings-form__names">
            <div className="field">
              <label htmlFor="settings-firstName" className="field__label">
                First name
              </label>
              <input
                ref={refs.firstName}
                id="settings-firstName"
                className="input"
                autoComplete="given-name"
                value={values.firstName}
                onChange={(e) => set('firstName', e.target.value)}
                aria-invalid={errors.firstName ? true : undefined}
                aria-describedby={describedBy('firstName')}
              />
              {errorFor('firstName')}
            </div>
            <div className="field">
              <label htmlFor="settings-lastName" className="field__label">
                Last name
              </label>
              <input
                ref={refs.lastName}
                id="settings-lastName"
                className="input"
                autoComplete="family-name"
                value={values.lastName}
                onChange={(e) => set('lastName', e.target.value)}
                aria-invalid={errors.lastName ? true : undefined}
                aria-describedby={describedBy('lastName')}
              />
              {errorFor('lastName')}
            </div>
          </div>
        </fieldset>

        <fieldset className="settings-form__group">
          <legend>Email address</legend>
          <div className="field">
            <label htmlFor="settings-email" className="field__label">
              Email
            </label>
            <p id="settings-email-hint" className="field__hint">
              To change it, we&rsquo;ll send a confirmation link to your new address (and a heads-up to the old one).
              You&rsquo;ll still log in with Google.
            </p>
            <input
              ref={refs.email}
              id="settings-email"
              type="email"
              className="input"
              autoComplete="email"
              value={values.email}
              onChange={(e) => set('email', e.target.value)}
              aria-invalid={errors.email ? true : undefined}
              aria-describedby={describedBy('email', true)}
            />
            {errorFor('email')}
          </div>
          {user?.new_email && (
            <p className="settings-form__pending">
              Waiting for you to confirm <strong>{user.new_email}</strong>. Check that inbox for the link.
            </p>
          )}
        </fieldset>

        <fieldset className="settings-form__group">
          <legend>Newsletter</legend>
          <p id="settings-newsletter-hint" className="field__hint">
            A short, friendly email now and then: new stories, lessons and the odd glorious stuff-up. Sent to the email
            address above.
          </p>
          <div>
            <button
              type="button"
              role="switch"
              aria-checked={values.newsletter}
              aria-describedby="settings-newsletter-hint"
              className="switch"
              disabled={!newsletterLoaded}
              onClick={() => set('newsletter', !values.newsletter)}
            >
              <span className="switch__track" aria-hidden="true">
                <span className="switch__thumb" />
              </span>
              <span>Send me the newsletter</span>
            </button>
          </div>
        </fieldset>

        <div className="settings-form__actions">
          <button type="submit" className="btn btn--primary" disabled={busy}>
            {busy ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </form>

      <section className="settings-account" aria-label="Log out">
        <p>Logging out keeps your mistakes safe in your account. Log back in any time to see them.</p>
        <button
          type="button"
          className="btn"
          onClick={async () => {
            await signOut();
            toast('You’re logged out. Log back in to see your mistakes.');
          }}
        >
          <Icon icon={LogOut} size={18} />
          Log out
        </button>
      </section>
    </>
  );
}
