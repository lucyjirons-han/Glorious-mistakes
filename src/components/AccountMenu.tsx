'use client';

import { LogIn, LogOut, Settings, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { displayName, initialsFor, useAuth } from '@/lib/auth';
import { loginHref } from '@/lib/login';
import { Icon } from './Icon';
import { useToast } from './Toast';

function useLogOut() {
  const { signOut } = useAuth();
  const toast = useToast();
  return async () => {
    await signOut();
    toast('You’re logged out. Log back in to see your mistakes.');
  };
}

/**
 * The account control in the header bar (wide screens): "Log in", or a round button with the
 * person's initials that opens a small menu. On narrow screens the same links sit in the main
 * menu instead (AccountNavLinks).
 */
export function AccountMenu() {
  const auth = useAuth();
  const pathname = usePathname();
  const logOut = useLogOut();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setOpen(false), [pathname]);

  // Close on Escape (focus goes back to the button) or a click anywhere else.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setOpen(false);
      buttonRef.current?.focus();
    };
    const onPointer = (e: PointerEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
    };
  }, [open]);

  if (!auth.available) return null;
  // Keeps the space while we find out who's here, so the header doesn't jump.
  if (!auth.ready) return <span className="account-menu account-menu--placeholder" aria-hidden="true" />;

  if (!auth.user) {
    return (
      <Link href={loginHref(pathname)} className="account-login" title="Log in">
        <Icon icon={LogIn} size={20} />
        <span className="sr-only">Log in</span>
      </Link>
    );
  }

  const name = displayName(auth.profile, auth.user);

  return (
    <div
      className="account-menu"
      ref={wrapperRef}
      onBlur={(e) => {
        // Close when focus leaves the menu (tabbing past the last item).
        if (open && !wrapperRef.current?.contains(e.relatedTarget as Node | null)) setOpen(false);
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        className="account-menu__toggle"
        aria-expanded={open}
        aria-controls="account-menu-panel"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="avatar account-menu__avatar" aria-hidden="true">
          {initialsFor(auth.profile, auth.user)}
        </span>
        <span className="sr-only">Your account</span>
      </button>
      <div id="account-menu-panel" className={`account-menu__panel${open ? ' is-open' : ''}`} hidden={!open}>
        <p className="account-menu__who">
          <strong>{name}</strong>
          {auth.user.email && auth.user.email !== name && <span>{auth.user.email}</span>}
        </p>
        <ul className="account-menu__list">
          <li>
            <Link href="/settings" className="account-menu__item" aria-current={pathname === '/settings' ? 'page' : undefined}>
              <Icon icon={Settings} size={18} />
              Settings
            </Link>
          </li>
          {auth.isAdmin && (
            <li>
              <Link href="/admin" className="account-menu__item" aria-current={pathname === '/admin' ? 'page' : undefined}>
                <Icon icon={ShieldCheck} size={18} />
                Admin
              </Link>
            </li>
          )}
          <li>
            <button type="button" className="account-menu__item" onClick={() => void logOut()}>
              <Icon icon={LogOut} size={18} />
              Log out
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}

/** The account links inside the mobile menu. */
export function AccountNavLinks() {
  const auth = useAuth();
  const pathname = usePathname();
  const logOut = useLogOut();

  if (!auth.available || !auth.ready) return null;

  if (!auth.user) {
    return (
      <ul className="site-nav__list site-nav__account">
        <li>
          <Link href={loginHref(pathname)} className="site-nav__link">
            <Icon icon={LogIn} size={20} />
            Log in
          </Link>
        </li>
      </ul>
    );
  }

  return (
    <ul className="site-nav__list site-nav__account" aria-label="Your account">
      <li className="site-nav__who">Logged in as {displayName(auth.profile, auth.user)}</li>
      <li>
        <Link href="/settings" className="site-nav__link" aria-current={pathname === '/settings' ? 'page' : undefined}>
          <Icon icon={Settings} size={20} />
          Settings
        </Link>
      </li>
      {auth.isAdmin && (
        <li>
          <Link href="/admin" className="site-nav__link" aria-current={pathname === '/admin' ? 'page' : undefined}>
            <Icon icon={ShieldCheck} size={20} />
            Admin
          </Link>
        </li>
      )}
      <li>
        <button type="button" className="site-nav__link site-nav__link--button" onClick={() => void logOut()}>
          <Icon icon={LogOut} size={20} />
          Log out
        </button>
      </li>
    </ul>
  );
}
