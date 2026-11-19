'use client';

import { useLayoutEffect } from 'react';

/**
 * Fades sections up as they scroll into view (styles in globals.css, section 13).
 *
 * Mark a section with `data-reveal` and the elements whose children should rise with
 * `data-reveal-stagger`. Only sections still below the fold are hidden and animated: anything
 * already on screen stays put, so nothing visible blinks out while the page hydrates. Without
 * JavaScript, IntersectionObserver or with reduced motion on, every section is simply visible.
 */
export function RevealOnScroll() {
  useLayoutEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).dataset.revealState = 'shown';
          observer.unobserve(entry.target);
        }
      },
      // Wait until a section is a little way up the screen, so the movement is seen.
      { rootMargin: '0px 0px -12% 0px' },
    );

    const pending: HTMLElement[] = [];
    for (const el of document.querySelectorAll<HTMLElement>('[data-reveal]')) {
      if (el.dataset.revealState) continue;
      if (el.getBoundingClientRect().top < window.innerHeight) continue;
      el.dataset.revealState = 'pending';
      pending.push(el);
      observer.observe(el);
    }

    return () => {
      observer.disconnect();
      // Un-hide anything that never got shown, so a remount (Strict Mode, Fast Refresh) starts fresh.
      for (const el of pending) {
        if (el.dataset.revealState === 'pending') delete el.dataset.revealState;
      }
    };
  }, []);

  return null;
}
