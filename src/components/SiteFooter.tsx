import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container site-footer__inner">
        <p className="site-footer__tagline">
          <span aria-hidden="true">💥</span> Everyone stuffs up. The glorious part is what you do next.
        </p>
        <nav aria-label="Footer">
          <ul className="site-footer__links">
            <li>
              <Link href="/log">Log a mistake</Link>
            </li>
            <li>
              <Link href="/feed">Public feed</Link>
            </li>
            <li>
              <Link href="/mine">My mistakes</Link>
            </li>
            <li>
              <Link href="/about">About</Link>
            </li>
          </ul>
        </nav>
        <p className="site-footer__note">
          Your entries are saved on this device only. Private ones never leave it.
        </p>
      </div>
    </footer>
  );
}
