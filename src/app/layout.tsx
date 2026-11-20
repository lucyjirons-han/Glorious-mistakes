import type { Metadata, Viewport } from 'next';
import { Bricolage_Grotesque, DM_Sans } from 'next/font/google';
import type { ReactNode } from 'react';
import { NewsletterSignup } from '@/components/NewsletterSignup';
import { RevealOnScroll } from '@/components/RevealOnScroll';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';
import { ThemeScript } from '@/components/ThemeScript';
import { ToastProvider } from '@/components/Toast';
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE, SITE_URL } from '@/lib/site';
import { getExampleMistakes } from '@/lib/examples';
import { MistakesProvider } from '@/lib/store';
import './globals.css';

const display = Bricolage_Grotesque({
  subsets: ['latin'],
  weight: ['800'],
  variable: '--font-display',
  display: 'swap',
});
const body = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-body',
  display: 'swap',
});

const DEFAULT_TITLE = `${SITE_NAME} · ${SITE_TAGLINE}`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: DEFAULT_TITLE,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  // Site-wide share defaults. Pages set their own with pageMetadata() in src/lib/site.ts.
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    locale: 'en_AU',
    url: '/',
    title: DEFAULT_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: { card: 'summary_large_image', title: DEFAULT_TITLE, description: SITE_DESCRIPTION },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FAF7F0' },
    { media: '(prefers-color-scheme: dark)', color: '#14173A' },
  ],
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  return (
    // suppressHydrationWarning only covers these two elements' own attributes, which browser
    // extensions (Grammarly, ColorZilla, password managers…) often change before React loads.
    <html
      lang="en"
      className={`${display.variable} ${body.variable}`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        <ThemeScript />
      </head>
      <body suppressHydrationWarning>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <MistakesProvider examples={await getExampleMistakes()}>
          <ToastProvider>
            <SiteHeader />
            <main id="main" tabIndex={-1}>
              {children}
            </main>
            <NewsletterSignup />
            <SiteFooter />
            <RevealOnScroll />
          </ToastProvider>
        </MistakesProvider>
      </body>
    </html>
  );
}
