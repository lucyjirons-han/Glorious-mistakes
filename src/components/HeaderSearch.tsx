'use client';

import { ArrowRight, Search, X } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { getCategory } from '@/lib/constants';
import { highlightParts, SITE_PAGES, suggest, type SearchLink, type Suggestion } from '@/lib/search';
import { useMistakes } from '@/lib/store';
import { mistakeHref } from './MistakeCard';
import { Icon } from './Icon';

interface HeaderSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Learn articles and FAQ questions, loaded on the server by the layout. */
  links: { articles: SearchLink[]; faqs: SearchLink[] };
}

const LIST_ID = 'header-search-suggestions';
const optionId = (i: number) => `header-search-option-${i}`;

/**
 * The search button in the header. It opens a search box just below the header that
 * suggests matches as you type (a combobox: arrow keys move through the list, Enter opens
 * one). Searching without picking a suggestion goes to /search?q=… for the full results.
 */
export function HeaderSearch({ open, onOpenChange, links }: HeaderSearchProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { ready, mine, publicFeed } = useMistakes();
  const [query, setQuery] = useState('');
  // Which suggestion the arrow keys are on; -1 means none (typing in the box).
  const [active, setActive] = useState(-1);
  const [listHidden, setListHidden] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Focus the box when it opens; close it on Escape and hand focus back to the button.
  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      onOpenChange(false);
      buttonRef.current?.focus();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onOpenChange]);

  // Close after navigating.
  useEffect(() => onOpenChange(false), [pathname, onOpenChange]);

  const suggestions = useMemo(() => {
    const seen = new Set<string>();
    const entries = [...(ready ? mine : []), ...publicFeed].filter((m) =>
      seen.has(m.id) ? false : (seen.add(m.id), true),
    );
    return suggest(query, [
      ...entries.map((m) => ({
        kind: 'Mistake' as const,
        href: mistakeHref(m.id),
        title: m.title,
        body: [m.whatHappened, m.lesson, getCategory(m.category).label],
      })),
      ...links.articles.map((l) => ({ kind: 'Article' as const, href: l.href, title: l.title, body: [l.summary] })),
      ...links.faqs.map((l) => ({ kind: 'FAQ' as const, href: l.href, title: l.title, body: [] })),
      ...SITE_PAGES.map((l) => ({ kind: 'Page' as const, href: l.href, title: l.title, body: [l.keywords] })),
    ]);
  }, [query, ready, mine, publicFeed, links]);

  const trimmed = query.trim();
  // The suggestions, plus a last option that opens the full results page.
  const options: Suggestion[] = trimmed
    ? [...suggestions, { href: `/search?q=${encodeURIComponent(trimmed)}`, title: trimmed, kind: 'Page' }]
    : [];
  const showList = open && !listHidden && options.length > 0;

  const reset = () => {
    onOpenChange(false);
    setQuery('');
    setActive(-1);
  };

  const go = (href: string) => {
    reset();
    if (href.startsWith('#')) window.location.hash = href;
    else router.push(href);
  };

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (showList && active >= 0) return go(options[active].href);
    if (!trimmed) return inputRef.current?.focus();
    go(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  const onInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      if (options.length === 0) return;
      e.preventDefault();
      setListHidden(false);
      const step = e.key === 'ArrowDown' ? 1 : -1;
      // Wraps round, passing through "no suggestion" (the box itself) on the way.
      setActive((i) => ((i + 1 + step + options.length + 1) % (options.length + 1)) - 1);
    } else if (e.key === 'Escape' && showList) {
      // First Escape hides the suggestions; the next one closes the search box.
      e.preventDefault();
      e.stopPropagation();
      setListHidden(true);
      setActive(-1);
    }
  };

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className="header-search__toggle"
        aria-expanded={open}
        aria-controls="header-search"
        onClick={() => onOpenChange(!open)}
      >
        <Icon icon={open ? X : Search} size={20} />
        <span className="sr-only">{open ? 'Close search' : 'Search'}</span>
      </button>

      <div id="header-search" className={`header-search${open ? ' is-open' : ''}`} hidden={!open}>
        <form role="search" action="/search" className="container header-search__form" onSubmit={submit}>
          <div className="toolbar__search header-search__field">
            <label htmlFor="header-search-input" className="sr-only">
              Search the site
            </label>
            <Icon icon={Search} size={18} className="toolbar__search-icon" />
            <input
              ref={inputRef}
              id="header-search-input"
              name="q"
              type="search"
              className="input"
              placeholder="Search the site…"
              role="combobox"
              aria-autocomplete="list"
              aria-expanded={showList}
              aria-controls={LIST_ID}
              aria-activedescendant={showList && active >= 0 ? optionId(active) : undefined}
              aria-describedby="header-search-hint"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActive(-1);
                setListHidden(false);
              }}
              onKeyDown={onInputKeyDown}
              autoComplete="off"
            />
            <span id="header-search-hint" className="sr-only">
              Suggestions appear as you type. Use the up and down arrows to choose one.
            </span>
          </div>
          <button type="submit" className="btn btn--primary btn--sm">
            Search
          </button>
          <ul id={LIST_ID} role="listbox" aria-label="Search suggestions" className="suggestions" hidden={!showList}>
            {options.map((option, i) => {
              const isAll = i === options.length - 1;
              return (
                <li
                  key={`${option.href}-${i}`}
                  id={optionId(i)}
                  role="option"
                  aria-selected={i === active}
                  className={`suggestions__option${isAll ? ' suggestions__option--all' : ''}`}
                  // Keep focus in the box while clicking, so the list doesn't flicker.
                  onMouseDown={(e) => e.preventDefault()}
                  onMouseMove={() => setActive(i)}
                  onClick={() => go(option.href)}
                >
                  {isAll ? (
                    <>
                      <Icon icon={Search} size={16} className="suggestions__icon" />
                      <span className="suggestions__title">
                        See all results for “{option.title}”
                      </span>
                      <Icon icon={ArrowRight} size={16} className="suggestions__icon" />
                    </>
                  ) : (
                    <>
                      <span className="suggestions__title">
                        {highlightParts(option.title, query).map((part, j) =>
                          part.match ? <mark key={j}>{part.text}</mark> : part.text,
                        )}
                      </span>
                      <span className="suggestions__kind">{option.kind}</span>
                    </>
                  )}
                </li>
              );
            })}
          </ul>
        </form>
      </div>
    </>
  );
}
