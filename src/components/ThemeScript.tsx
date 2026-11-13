'use client';

import { THEME_SCRIPT } from '@/lib/theme';

/**
 * Sets light or dark mode before the page appears (see lib/theme.ts).
 *
 * In the server-rendered HTML this is a normal script, so the browser runs it straight away.
 * When React renders it in the browser (hydration, Fast Refresh) it's marked as plain text:
 * the theme is already set by then, and React warns about creating real script tags on the
 * client. suppressHydrationWarning covers the one attribute that differs.
 */
export function ThemeScript() {
  return (
    <script
      suppressHydrationWarning
      type={typeof window === 'undefined' ? 'text/javascript' : 'text/plain'}
      dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }}
    />
  );
}
