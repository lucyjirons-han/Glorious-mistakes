'use client';

import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Icon } from './Icon';
import { setTheme, type Theme } from '@/lib/theme';

/** Header button that switches between light and dark mode and remembers the choice. */
export function ThemeToggle() {
  // The theme script has already set data-theme; read it after mounting.
  const [theme, setThemeState] = useState<Theme | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    const read = () => setThemeState(root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');
    read();
    // Stay in sync if the device setting changes while no choice has been saved.
    const observer = new MutationObserver(read);
    observer.observe(root, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      className="theme-toggle"
      aria-pressed={theme ? isDark : undefined}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {/* Both icons render; CSS shows the right one, so it's correct before React loads. */}
      <Icon icon={Sun} size={20} className="theme-toggle__icon theme-toggle__icon--sun" />
      <Icon icon={Moon} size={20} className="theme-toggle__icon theme-toggle__icon--moon" />
      <span className="sr-only">Dark mode</span>
    </button>
  );
}
