import type { Block } from '@/app/faq/questions';

/**
 * Site search. Everything is matched in the browser: the search page is handed the Learn
 * articles, FAQ answers and pages by the server, and reads entries from the store.
 */

/** A result that isn't an entry: a page, Learn article or FAQ answer. */
export interface SearchLink {
  href: string;
  title: string;
  summary: string;
  /** Extra words to match that aren't shown (e.g. the full FAQ answer). */
  keywords?: string;
}

/** The site's main pages, so "guidelines" or "newsletter" finds somewhere to go. */
export const SITE_PAGES: SearchLink[] = [
  {
    href: '/feed',
    title: 'Public feed',
    summary: 'Real stuff-ups from real humans. React with “been there” when one hits close to home.',
  },
  {
    href: '/log',
    title: 'Log a mistake',
    summary: 'Two questions: what happened, and what did you take from it?',
    keywords: 'add new write share post entry',
  },
  {
    href: '/mine',
    title: 'My mistakes',
    summary: 'Every stuff-up you’ve logged, private and shared.',
    keywords: 'my entries collection private',
  },
  {
    href: '/learn',
    title: 'Learn',
    summary: 'Short, friendly reads about stuffing up, laughing it off and keeping the lesson.',
    keywords: 'articles reading',
  },
  {
    href: '/about',
    title: 'About',
    summary: 'Why Glorious Mistakes exists and what we’re aiming for.',
    keywords: 'privacy who why',
  },
  {
    href: '/faq',
    title: 'FAQ',
    summary: 'Answers to common questions about logging, sharing and privacy.',
    keywords: 'questions help frequently asked',
  },
  {
    href: '/guidelines',
    title: 'Community guidelines',
    summary: 'How to keep the public feed kind, light and safe for everyone.',
    keywords: 'rules report moderation',
  },
  {
    href: '#newsletter',
    title: 'Newsletter',
    summary: 'Sign up at the bottom of any page for the occasional email.',
    keywords: 'email subscribe sign up',
  },
];

/** Plain text of a FAQ answer, for matching. */
export function faqAnswerText(answer: Block[]): string {
  return answer
    .flatMap((block) => ('p' in block ? [block.p] : block.list))
    .map((inline) => inline.map((part) => (typeof part === 'string' ? part : part.text)).join(''))
    .join(' ');
}

/** Lower case, with curly quotes straightened so "don't" finds "don’t". */
function normalise(text: string): string {
  return text.toLowerCase().replace(/[‘’]/g, "'").replace(/[“”]/g, '"');
}

/** The separate words of a search, ready for `matches`. */
export function searchTerms(query: string): string[] {
  return normalise(query).split(/\s+/).filter(Boolean);
}

/** True when every search word appears somewhere in the given text. */
export function matches(terms: string[], ...fields: (string | undefined)[]): boolean {
  if (terms.length === 0) return false;
  const haystack = normalise(fields.filter(Boolean).join(' '));
  return terms.every((term) => haystack.includes(term));
}

/** One line in the header's suggestions list. */
export interface Suggestion {
  href: string;
  title: string;
  /** What sort of thing it is, shown beside the title. */
  kind: 'Mistake' | 'Article' | 'FAQ' | 'Page';
}

interface SuggestSource {
  kind: Suggestion['kind'];
  href: string;
  title: string;
  /** Text that also counts as a match, but ranks below the title. */
  body: (string | undefined)[];
}

/**
 * The best few matches for the header's suggestions. Titles that contain the whole search
 * rank first, then titles that contain every word, then matches anywhere else.
 */
export function suggest(query: string, sources: SuggestSource[], limit = 6): Suggestion[] {
  const terms = searchTerms(query);
  if (terms.length === 0) return [];
  const phrase = terms.join(' ');
  const scored: { s: Suggestion; score: number; index: number }[] = [];
  sources.forEach((src, index) => {
    if (!matches(terms, src.title, ...src.body)) return;
    const title = normalise(src.title);
    const score = title.startsWith(phrase) ? 4 : title.includes(phrase) ? 3 : matches(terms, src.title) ? 2 : 1;
    scored.push({ s: { href: src.href, title: src.title, kind: src.kind }, score, index });
  });
  return scored
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, limit)
    .map((x) => x.s);
}

/** Splits text into plain and matching parts, so the matching words can be highlighted. */
export function highlightParts(text: string, query: string): { text: string; match: boolean }[] {
  const terms = searchTerms(query);
  if (terms.length === 0) return [{ text, match: false }];
  const lower = normalise(text);
  const marked = new Array<boolean>(text.length).fill(false);
  for (const term of terms) {
    for (let i = lower.indexOf(term); i !== -1; i = lower.indexOf(term, i + 1)) {
      marked.fill(true, i, i + term.length);
    }
  }
  const parts: { text: string; match: boolean }[] = [];
  for (let i = 0; i < text.length; i++) {
    const last = parts[parts.length - 1];
    if (last && last.match === marked[i]) last.text += text[i];
    else parts.push({ text: text[i], match: marked[i] });
  }
  return parts;
}
