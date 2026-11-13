import Link from 'next/link';
import { EmptyState } from '@/components/EmptyState';

export default function NotFound() {
  return (
    <div className="container page page--narrow">
      <EmptyState
        emoji="🙈"
        title="Well, this is a glorious mistake"
        action={
          <Link href="/" className="btn btn--primary">
            Take me home
          </Link>
        }
      >
        <p>That page doesn&rsquo;t exist. Lesson learned: check the link.</p>
      </EmptyState>
    </div>
  );
}
