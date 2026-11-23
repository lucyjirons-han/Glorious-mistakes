import type { Metadata } from 'next';

/** The live address of the site. Used for the sitemap, canonical links and share previews. */
export const SITE_URL = 'https://glorious-mistakes.vercel.app';
export const SITE_NAME = 'Glorious Mistakes';
export const SITE_TAGLINE = 'Celebrate your stuff-ups';
export const SITE_DESCRIPTION =
  'Log a mistake you made and what it taught you. Keep it private or share it so others can say "been there".';

/** The default share image, drawn by src/app/opengraph-image.tsx. */
const SHARE_IMAGE = {
  url: '/opengraph-image',
  width: 1200,
  height: 630,
  alt: 'Glorious Mistakes: Stuffed it up? Glorious.',
};

interface PageMetadataOptions {
  /** The page's own title. The layout adds " · Glorious Mistakes". */
  title: string;
  description: string;
  /** Path from the site root, e.g. "/faq". */
  path: string;
  /** Keep the page out of search results (it still follows links). */
  noindex?: boolean;
  /** A share image of the page's own (1200 × 630), instead of the site-wide one. */
  image?: { url: string; alt: string };
  openGraph?: Partial<NonNullable<Metadata['openGraph']>>;
}

/**
 * Title, description, canonical link and social share tags for one page.
 *
 * Next replaces (rather than merges) a parent's `openGraph` and `twitter` objects, so every
 * page builds them here to keep the site name, locale, card type and share image. (The
 * file-based image in src/app only reaches pages that don't set their own `openGraph`.)
 */
export function pageMetadata({
  title,
  description,
  path,
  noindex,
  image,
  openGraph,
}: PageMetadataOptions): Metadata {
  const fullTitle = `${title} · ${SITE_NAME}`;
  const shareImage = image ? { ...SHARE_IMAGE, ...image } : SHARE_IMAGE;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      locale: 'en_AU',
      url: path,
      title: fullTitle,
      description,
      images: [shareImage],
      ...openGraph,
    } as Metadata['openGraph'],
    twitter: { card: 'summary_large_image', title: fullTitle, description, images: [shareImage] },
    ...(noindex ? { robots: { index: false, follow: true } } : {}),
  };
}

/** Renders a JSON-LD structured data block. Escapes "<" so the JSON can't close the script tag. */
export function jsonLd(data: unknown): { __html: string } {
  return { __html: JSON.stringify(data).replace(/</g, '\\u003c') };
}
