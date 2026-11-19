import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { validateNewsletter } from '@/lib/newsletter';

/**
 * Newsletter sign-ups.
 *
 * Until a mailing-list provider is connected, sign-ups are kept in Supabase's
 * `newsletter_signups` table via the `subscribe_newsletter` function (visitors can add to the
 * list but never read it). When a provider arrives (e.g. Buttondown, MailerLite), send
 * sign-ups there instead, import the table, empty it, and update the newsletter answers in
 * src/app/faq/questions.ts.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const { firstName, email } = (body ?? {}) as Record<string, unknown>;
  if (typeof firstName !== 'string' || typeof email !== 'string') {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const errors = validateNewsletter({ firstName, email });
  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ errors }, { status: 422 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    // Never log the address itself: it's personal data.
    console.error('[newsletter] Supabase is not configured, so the sign-up was not saved');
    return NextResponse.json({ error: 'Sign-ups are not available right now.' }, { status: 503 });
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const { error } = await supabase.rpc('subscribe_newsletter', {
    first_name: firstName.trim(),
    email: email.trim(),
  });
  if (error) {
    console.error('[newsletter] could not save the sign-up:', error.code, error.message);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
