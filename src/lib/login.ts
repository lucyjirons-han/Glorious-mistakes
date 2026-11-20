/** Login helpers shared by server pages and the client (./auth.tsx). */

/** Set just before going to Google, so the login page knows to finish up when we come back. */
export const LOGIN_PENDING_KEY = 'glorious-mistakes:login-pending';

/** Where to go after logging in: only same-site paths, so the page can't send people elsewhere. */
export function safeNext(next: string | null | undefined): string {
  return next && next.startsWith('/') && !next.startsWith('//') && !next.startsWith('/\\') ? next : '/mine';
}

/** The login page, coming back to `next` afterwards. */
export function loginHref(next: string): string {
  return `/login?next=${encodeURIComponent(next === '/login' ? '/mine' : next)}`;
}
