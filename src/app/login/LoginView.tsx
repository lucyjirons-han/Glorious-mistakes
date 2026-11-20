'use client';

import { CircleAlert, Laptop, NotebookPen, ShieldCheck, UserRoundX } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { EmptyState } from '@/components/EmptyState';
import { Icon, IconBadge } from '@/components/Icon';
import { useToast } from '@/components/Toast';
import { displayName, useAuth } from '@/lib/auth';
import { LOGIN_PENDING_KEY } from '@/lib/login';

/** Errors Google sign-in sends back when the Google account already belongs to someone. */
const ALREADY_TAKEN = new Set(['identity_already_exists', 'email_exists', 'user_already_exists']);
/** Set once we've retried with a plain sign-in, so a failure can't loop. */
const RETRIED_KEY = 'glorious-mistakes:login-retried';

function session(key: string, value?: string | null): string | null {
  try {
    if (value === undefined) return window.sessionStorage.getItem(key);
    if (value === null) window.sessionStorage.removeItem(key);
    else window.sessionStorage.setItem(key, value);
  } catch {
    // Storage can be blocked; logging in still works, just without the welcome toast.
  }
  return null;
}

export function LoginView({ next }: { next: string }) {
  const auth = useAuth();
  const toast = useToast();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const finished = useRef(false);
  const { signInWithGoogle, ready, user, isAdmin, movedEntries, clearMovedEntries } = auth;

  const start = async (link = true) => {
    setBusy(true);
    setError('');
    const problem = await signInWithGoogle(next, { link });
    if (problem) {
      setBusy(false);
      setError(problem);
    }
  };

  // Coming back from Google with an error (in the query string or the #hash).
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const hash = new URLSearchParams(window.location.hash.slice(1));
    const code = query.get('error_code') ?? hash.get('error_code');
    const problem = query.get('error') ?? hash.get('error');
    if (!code && !problem) return;
    window.history.replaceState(null, '', `/login?next=${encodeURIComponent(next)}`);

    if (code && ALREADY_TAKEN.has(code) && !session(RETRIED_KEY)) {
      // They already have an account (from another device): log in to that one instead.
      // This browser's entries move across once they're back (see ../../lib/auth.tsx).
      session(RETRIED_KEY, '1');
      void start(false);
      return;
    }
    session(LOGIN_PENDING_KEY, null);
    session(RETRIED_KEY, null);
    setError(
      problem === 'access_denied'
        ? 'Google didn’t log you in. That’s fine: try again whenever you’re ready.'
        : 'Something went wrong logging in with Google. Please try again.',
    );
    // Runs once, on arrival.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Back from Google and logged in: say hello and carry on to where they were going. Admins go
  // straight to the admin page instead.
  useEffect(() => {
    if (!ready || !user || finished.current || !session(LOGIN_PENDING_KEY)) return;
    finished.current = true;
    session(LOGIN_PENDING_KEY, null);
    session(RETRIED_KEY, null);
    const moved =
      movedEntries > 0
        ? ` We moved ${movedEntries} ${movedEntries === 1 ? 'entry' : 'entries'} from this browser into your account.`
        : '';
    clearMovedEntries();
    toast(`You’re logged in. Welcome!${moved}`);
    router.replace(isAdmin ? '/admin' : next);
  }, [ready, user, isAdmin, movedEntries, clearMovedEntries, toast, router, next]);

  const header = (
    <header className="page-header">
      <p className="eyebrow">Your account</p>
      <h1 className="page-header__title">Log in</h1>
      <p className="page-header__lead">Keep your mistakes safe and see them on every device.</p>
    </header>
  );

  if (!auth.available) {
    return (
      <div className="container page">
        {header}
        <EmptyState icon={UserRoundX} title="Logging in isn’t available right now">
          <p>Your mistakes are saved on this device in the meantime.</p>
        </EmptyState>
      </div>
    );
  }

  if (ready && user && !session(LOGIN_PENDING_KEY)) {
    return (
      <div className="container page">
        {header}
        <EmptyState
          icon={ShieldCheck}
          tone="sage"
          title="You’re already logged in"
          action={
            <div className="button-row">
              <Link href="/mine" className="btn btn--primary">
                My mistakes
              </Link>
              <Link href="/settings" className="btn">
                Settings
              </Link>
            </div>
          }
        >
          <p>You&rsquo;re logged in as {displayName(auth.profile, user)}.</p>
        </EmptyState>
      </div>
    );
  }

  return (
    <div className="container page">
      {header}
      <section className="login-card" aria-labelledby="login-heading">
        <h2 id="login-heading" className="login-card__title">
          Log in or sign up with Google
        </h2>
        <ul className="login-card__points">
          <li>
            <IconBadge icon={NotebookPen} tone="lilac" />
            <span>Everything you&rsquo;ve logged on this device comes with you.</span>
          </li>
          <li>
            <IconBadge icon={Laptop} tone="sky" />
            <span>See your mistakes on your phone, laptop or anywhere else you log in.</span>
          </li>
          <li>
            <IconBadge icon={ShieldCheck} tone="sage" />
            <span>
              Nothing changes about what&rsquo;s public. Private entries stay private, and your name only
              shows on entries if you add it.
            </span>
          </li>
        </ul>

        {error && (
          <p id="login-error" className="field__error" role="alert">
            <Icon icon={CircleAlert} size={16} className="field__error-icon" />
            {error}
          </p>
        )}

        <button
          type="button"
          className="btn btn--google"
          onClick={() => void start()}
          disabled={busy || !ready}
          aria-describedby={error ? 'login-error' : undefined}
        >
          <GoogleLogo />
          {busy ? 'Taking you to Google…' : 'Continue with Google'}
        </button>

        <p className="login-card__note">
          We only use your name and email address from Google, and you can change them in Settings. Questions?
          See the <Link href="/faq">FAQ</Link>.
        </p>
      </section>
    </div>
  );
}

/** Google's "G" mark, in Google's own colours as their sign-in branding asks. */
function GoogleLogo() {
  return (
    <svg className="btn--google__logo" viewBox="0 0 48 48" width="20" height="20" aria-hidden="true" focusable="false">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}
