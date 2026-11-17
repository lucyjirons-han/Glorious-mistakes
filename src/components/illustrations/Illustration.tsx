import type { ReactNode } from 'react';

/** Props every illustration accepts: a class for sizing and placement. */
export type IllustrationProps = { className?: string };

type Props = IllustrationProps & {
  /** The drawing's viewBox, e.g. "0 0 200 170". */
  viewBox: string;
  children: ReactNode;
};

/**
 * Shared <svg> wrapper for the hand-drawn spot illustrations.
 *
 * - Decorative only: hidden from screen readers and never focusable.
 * - The width, height and aspect-ratio come from the viewBox, so the browser reserves the right
 *   amount of space before anything paints and the layout doesn't jump. CSS sets the real size
 *   (usually a width, with height: auto).
 * - Colours come from the `.ill*` classes in globals.css, which follow the site's light/dark theme.
 */
export function Illustration({ viewBox, className, children }: Props) {
  const [, , w, h] = viewBox.split(/\s+/).map(Number);
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={viewBox}
      width={w}
      height={h}
      className={className ? `ill ${className}` : 'ill'}
      style={{ aspectRatio: `${w} / ${h}` }}
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}
