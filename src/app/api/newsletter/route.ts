import { NextResponse } from 'next/server';
import { validateNewsletter } from '@/lib/newsletter';

/**
 * Newsletter sign-ups.
 *
 * TODO: there's no mailing-list provider yet, so sign-ups are validated and then dropped.
 * Connect one (e.g. Buttondown, Mailchimp, ConvertKit) here before going live, and update the
 * FAQ answers about what we collect in src/app/faq/questions.ts.
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

  // Not logging the address itself: it's personal data.
  if (process.env.NODE_ENV !== 'production') {
    console.log('[newsletter] sign-up received (no provider connected yet)');
  }

  return NextResponse.json({ ok: true });
}
