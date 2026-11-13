import type { Metadata, Viewport } from 'next';
import { Bricolage_Grotesque, DM_Sans } from 'next/font/google';
import type { ReactNode } from 'react';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';
import { ThemeScript } from '@/components/ThemeScript';
import { ToastProvider } from '@/components/Toast';
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

export const metadata: Metadata = {
  title: {
    default: 'Glorious Mistakes · Celebrate your stuff-ups',
    template: '%s · Glorious Mistakes',
  },
  description:
    'Log a mistake you made and what it taught you. Keep it private or share it so others can say "been there".',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FAF7F0' },
    { media: '(prefers-color-scheme: dark)', color: '#14173A' },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
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
        <MistakesProvider>
          <ToastProvider>
            <SiteHeader />
            <main id="main" tabIndex={-1}>
              {children}
            </main>
            <SiteFooter />
          </ToastProvider>
        </MistakesProvider>
      </body>
    </html>
  );
}
