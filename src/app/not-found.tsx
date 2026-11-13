import type { Metadata } from 'next';
import { MapPinOff } from 'lucide-react';
import Link from 'next/link';
import { EmptyState } from '@/components/EmptyState';

export const metadata: Metadata = {
  title: 'Page not found',
};

export default function NotFound() {
  return (
    <div className="container page page--narrow">
      <EmptyState
        icon={MapPinOff}
        title="Well, this is a glorious mistake"
        action={
          <div className="btn-row btn-row--center">
            <Link href="/" className="btn btn--primary">
              Take me home
            </Link>
            <Link href="/log" className="btn">
              Log this as a mistake
            </Link>
          </div>
        }
      >
        <p>
          <strong>404:</strong> that page doesn&rsquo;t exist. Maybe it was moved, maybe the link
          had a typo, maybe it never existed at all.
        </p>
        <p>Lesson learned: always double-check the link.</p>
      </EmptyState>

      <nav aria-label="Popular pages" className="about__section">
        <ul className="not-found__links">
          <li>
            <Link href="/feed">Public feed</Link>
          </li>
          <li>
            <Link href="/mine">My mistakes</Link>
          </li>
          <li>
            <Link href="/about">About</Link>
          </li>
          <li>
            <Link href="/guidelines">Community guidelines</Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}
