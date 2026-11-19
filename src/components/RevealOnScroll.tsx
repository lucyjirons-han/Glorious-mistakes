'use client';

import { useLayoutEffect } from 'react';

/** Everything this component watches: whole sections, and each child of a long list. */
const TARGETS = '[data-reveal], [data-reveal-each] > *';

/**
 * Fades content up as it scrolls into view (styles in globals.css, section 13). Mounted once in
 * the root layout, so it covers every page.
 *
 * - `data-reveal` on a section: when it scrolls into view, the children of every
 *   `data-reveal-stagger` element inside it (or on it) rise one after another.
 * - `data-reveal-each` on a long list: each child rises on its own as it reaches the screen.
 *   Children that arrive together (a row of cards) still go one after another.
 *
 * Only content that starts below the fold is hidden and animated. Anything already on screen
 * stays put, so nothing visible blinks out while the page hydrates or a view loads. A
 * MutationObserver picks up content that appears later: client-side navigation, and views that
 * render once they've read the visitor's device storage. Without JavaScript, IntersectionObserver
 * or with reduced motion on, everything is simply visible.
 */
export function RevealOnScroll() {
  useLayoutEffect(() => {
    if (typeof IntersectionObserver === 'undefined' || typeof MutationObserver === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const pending = new Set<HTMLElement>();

    const io = new IntersectionObserver(
      (entries) => {
        let batch = 0;
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          if (el.parentElement?.hasAttribute('data-reveal-each')) {
            el.style.setProperty('--reveal-i', String(Math.min(batch++, 4)));
          }
          el.dataset.revealState = 'shown';
          pending.delete(el);
          io.unobserve(el);
        }
      },
      // Wait until content is a little way up the screen, so the movement is seen.
      { rootMargin: '0px 0px -12% 0px' },
    );

    const track = (el: HTMLElement) => {
      if (el.dataset.revealState) return;
      if (el.getBoundingClientRect().top < window.innerHeight) return;
      el.dataset.revealState = 'pending';
      pending.add(el);
      io.observe(el);
    };

    const scan = (node: Node) => {
      if (!(node instanceof HTMLElement)) return;
      if (node.matches(TARGETS)) track(node);
      node.querySelectorAll<HTMLElement>(TARGETS).forEach(track);
    };

    scan(document.body);
    const mo = new MutationObserver((records) => {
      for (const record of records) record.addedNodes.forEach(scan);
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      mo.disconnect();
      io.disconnect();
      // Un-hide anything that never got shown, so a remount (Strict Mode, Fast Refresh) starts fresh.
      for (const el of pending) {
        if (el.dataset.revealState === 'pending') delete el.dataset.revealState;
      }
    };
  }, []);

  return null;
}
