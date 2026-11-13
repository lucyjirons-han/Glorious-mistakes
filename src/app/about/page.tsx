import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About',
  description:
    'Glorious Mistakes is a celebratory log of stuff-ups and the lessons they taught us. Find out what it is and why it exists.',
};

const AIMS = [
  {
    emoji: '🏆',
    title: 'Celebrate, don’t hide',
    text: 'Make mistakes something to celebrate and learn from, not something to bury and hope nobody noticed.',
  },
  {
    emoji: '🪞',
    title: 'A simple reflection habit',
    text: 'Just two questions, every time: what happened, and what did I take from it?',
  },
  {
    emoji: '🫂',
    title: 'You’re not alone',
    text: 'Everyone stuffs up. Seeing other people’s mistakes is a reminder that yours are perfectly normal.',
  },
  {
    emoji: '😂',
    title: 'Light and funny',
    text: 'Sharing should feel safe and enjoyable. No judgement, no lectures, just people laughing at themselves.',
  },
];

const HOW = [
  {
    emoji: '✍️',
    title: 'Log it',
    text: 'Write down what happened, pick a category and rate the cringe.',
  },
  {
    emoji: '💡',
    title: 'Learn from it',
    text: 'Note what it taught you. Wise, practical or ridiculous, it all counts.',
  },
  {
    emoji: '🔒',
    title: 'Keep it private…',
    text: 'Save it just for you, as a personal record of how far you’ve come.',
  },
  {
    emoji: '🙋',
    title: '…or share it',
    text: 'Post it to the public feed, where other people can react with “been there”.',
  },
];

export default function AboutPage() {
  return (
    <>
      <div className="container page page--narrow about">
        <header className="page-header">
          <p className="eyebrow">
            <span aria-hidden="true">💥</span> About
          </p>
          <h1 className="page-header__title">What is Glorious Mistakes?</h1>
        </header>

        <figure className="about__quote">
          <blockquote>
            <p>A celebratory log of stuff-ups and the lessons they taught us.</p>
          </blockquote>
        </figure>

        <div className="about__intro">
          <p>
            Glorious Mistakes is a web app where anyone can log a mistake they&rsquo;ve made and what it
            taught them. Entries can be kept private or shared to a public feed, where other people can
            react with <strong>&ldquo;been there&rdquo;</strong>.
          </p>
          <p>
            Because the replied-all email, the exploding egg and the presentation given on mute are
            how we learn. They&rsquo;re also some of the best stories we have.
          </p>
        </div>

        <section className="about__section" aria-labelledby="about-how">
          <h2 id="about-how" className="section__title section__title--sm">
            How it works
          </h2>
          <ol className="about__how">
            {HOW.map((step) => (
              <li key={step.title} className="about__how-item">
                <span className="about__how-emoji" aria-hidden="true">
                  {step.emoji}
                </span>
                <div>
                  <h3 className="value__title">{step.title}</h3>
                  <p>{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="about__section" aria-labelledby="about-aims">
          <h2 id="about-aims" className="section__title section__title--sm">
            Our aims
          </h2>
          <ul className="values about__aims">
            {AIMS.map((aim) => (
              <li key={aim.title} className="value">
                <span className="value__emoji" aria-hidden="true">
                  {aim.emoji}
                </span>
                <div>
                  <h3 className="value__title">{aim.title}</h3>
                  <p>{aim.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="about__section about__privacy" aria-labelledby="about-privacy">
          <h2 id="about-privacy" className="section__title section__title--sm">
            <span aria-hidden="true">🔒</span> Your privacy
          </h2>
          <p>
            Private entries are saved on your device and never leave it. You can switch any entry
            between private and shared, edit it or delete it at any time from{' '}
            <Link href="/mine">My mistakes</Link>.
          </p>
        </section>
      </div>

      <section className="section about__cta" aria-labelledby="about-cta">
        <div className="container">
          <div className="cta-band">
            <h2 id="about-cta" className="cta-band__title">
              Ready to celebrate a stuff-up?
            </h2>
            <p>It takes two minutes. Nobody has to see it but you.</p>
            <div className="btn-row btn-row--center">
              <Link href="/log" className="btn btn--accent btn--lg">
                Log a mistake <span aria-hidden="true">🚀</span>
              </Link>
              <Link href="/feed" className="btn btn--lg">
                Browse the feed
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
