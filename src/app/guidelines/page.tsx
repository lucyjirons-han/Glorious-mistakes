import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Community guidelines',
  description:
    'Laugh with, not at. A few friendly ground rules for sharing mistakes on Glorious Mistakes.',
};

const DOS = [
  {
    emoji: '🙋',
    title: 'Share your own stuff-ups',
    text: 'This is a place for laughing at ourselves. Your mistake, your story, your lesson.',
  },
  {
    emoji: '😂',
    title: 'Keep it light',
    text: 'Silly, cringey and gloriously awkward is perfect. Nobody needs a lecture.',
  },
  {
    emoji: '🫶',
    title: 'React kindly',
    text: 'A “been there” goes a long way. Everyone posting here has been brave enough to own up.',
  },
];

const DONTS = [
  {
    emoji: '🏷️',
    title: 'Don’t name other people',
    text: 'Say “my manager”, “a friend” or “my long-suffering sibling” instead of real names, usernames or tags.',
  },
  {
    emoji: '🔐',
    title: 'Don’t share private details',
    text: 'No addresses, phone numbers, workplaces, health info or screenshots of other people’s messages. That includes your own private details too.',
  },
  {
    emoji: '🎯',
    title: 'Don’t make someone else the punchline',
    text: 'If the joke only works because someone else looks bad, it’s probably their story to tell, not yours.',
  },
];

const CHECKLIST = [
  'Is this my mistake to share?',
  'Could anyone work out who else is involved?',
  'Would I be happy if they read it?',
];

export default function GuidelinesPage() {
  return (
    <div className="container page page--narrow guidelines">
      <header className="page-header">
        <p className="eyebrow">
          <span aria-hidden="true">🤝</span> Community guidelines
        </p>
        <h1 className="page-header__title">Laugh with, not at</h1>
        <p className="page-header__lead">
          Glorious Mistakes works because sharing feels safe. A few friendly ground rules keep it
          that way.
        </p>
      </header>

      <section className="about__section" aria-labelledby="guidelines-do">
        <h2 id="guidelines-do" className="section__title section__title--sm">
          <span aria-hidden="true">👍</span> Please do
        </h2>
        <ul className="guidelines__list guidelines__list--do">
          {DOS.map((item) => (
            <li key={item.title} className="guidelines__item">
              <span className="about__how-emoji" aria-hidden="true">
                {item.emoji}
              </span>
              <div>
                <h3 className="value__title">{item.title}</h3>
                <p>{item.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="about__section" aria-labelledby="guidelines-dont">
        <h2 id="guidelines-dont" className="section__title section__title--sm">
          <span aria-hidden="true">🙅</span> Please don&rsquo;t
        </h2>
        <ul className="guidelines__list guidelines__list--dont">
          {DONTS.map((item) => (
            <li key={item.title} className="guidelines__item">
              <span className="about__how-emoji" aria-hidden="true">
                {item.emoji}
              </span>
              <div>
                <h3 className="value__title">{item.title}</h3>
                <p>{item.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="about__section about__privacy" aria-labelledby="guidelines-check">
        <h2 id="guidelines-check" className="section__title section__title--sm">
          <span aria-hidden="true">✅</span> Before you share, ask yourself
        </h2>
        <ul className="guidelines__checklist">
          {CHECKLIST.map((q) => (
            <li key={q}>{q}</li>
          ))}
        </ul>
        <p>
          Not sure? Keep it private. You can change your mind, edit or delete any entry at any time
          from <Link href="/mine">My mistakes</Link>.
        </p>
      </section>

      <div className="btn-row btn-row--center guidelines__actions">
        <Link href="/log" className="btn btn--primary btn--lg">
          Log a mistake <span aria-hidden="true">✍️</span>
        </Link>
        <Link href="/feed" className="btn btn--lg">
          Browse the feed
        </Link>
      </div>
    </div>
  );
}
