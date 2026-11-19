import type { CSSProperties } from 'react';

/**
 * Style for a nested `data-reveal-stagger` element: where its children start counting, so they
 * carry on after the items above them (see RevealOnScroll).
 */
export const revealOffset = (n: number) => ({ '--reveal-offset': n }) as CSSProperties;
