'use client';

import { Asterisk } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import type { SearchLink } from '@/lib/search';
import { AccountMenu, AccountNavLinks } from './AccountMenu';
import { HeaderSearch } from './HeaderSearch';
import { Icon } from './Icon';
import { ThemeToggle } from './ThemeToggle';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/feed', label: 'Public feed' },
  { href: '/learn', label: 'Learn' },
  { href: '/about', label: 'About' },
];

export function SiteHeader({
  searchLinks,
}: {
  searchLinks: { articles: SearchLink[]; faqs: SearchLink[] };
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpenState] = useState(false);

  // Only one of the mobile menu and the search box is open at a time.
  const setSearchOpen = useCallback((next: boolean) => {
    setSearchOpenState(next);
    if (next) setOpen(false);
  }, []);
  const toggleMenu = () => {
    setOpen((o) => !o);
    setSearchOpenState(false);
  };

  // Close the mobile menu after navigating, or when Escape is pressed.
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Link href="/" className="logo" aria-label="Glorious Mistakes home">
          <span className="logo__mark" aria-hidden="true">
            <Icon icon={Asterisk} size={24} />
          </span>
          <span className="logo__text">
            Glorious <span>Mistakes</span>
          </span>
        </Link>

        <button
          type="button"
          className="nav-toggle"
          aria-expanded={open}
          aria-controls="site-nav"
          onClick={toggleMenu}
        >
          <span className="nav-toggle__bars" aria-hidden="true" />
          <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
        </button>

        <nav id="site-nav" aria-label="Main" className={`site-nav${open ? ' is-open' : ''}`}>
          <ul className="site-nav__list">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="site-nav__link"
                  aria-current={isActive(link.href) ? 'page' : undefined}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              {/* The sign-up form sits at the bottom of every page, so this is an in-page link. */}
              <a href="#newsletter" className="site-nav__link" onClick={() => setOpen(false)}>
                Newsletter
              </a>
            </li>
          </ul>
          <AccountNavLinks />
          <Link href="/log" className="btn btn--primary btn--sm">
            Log a mistake
          </Link>
        </nav>

        <HeaderSearch open={searchOpen} onOpenChange={setSearchOpen} links={searchLinks} />
        <AccountMenu />
        <ThemeToggle />
      </div>
    </header>
  );
}
