'use client';

import { Search, X } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Icon } from './Icon';

interface HeaderSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * The search button in the header. It opens a search box just below the header; searching
 * goes to /search?q=…, which lists matching mistakes, Learn articles, FAQ answers and pages.
 */
export function HeaderSearch({ open, onOpenChange }: HeaderSearchProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Focus the box when it opens; close it on Escape and hand focus back to the button.
  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      onOpenChange(false);
      buttonRef.current?.focus();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onOpenChange]);

  // Close after navigating.
  useEffect(() => onOpenChange(false), [pathname, onOpenChange]);

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) {
      inputRef.current?.focus();
      return;
    }
    onOpenChange(false);
    setQuery('');
    router.push(`/search?q=${encodeURIComponent(q)}`);
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
        <form
          role="search"
          action="/search"
          className="container header-search__form"
          onSubmit={submit}
        >
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
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoComplete="off"
            />
          </div>
          <button type="submit" className="btn btn--primary btn--sm">
            Search
          </button>
        </form>
      </div>
    </>
  );
}
