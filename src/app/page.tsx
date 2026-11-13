import Link from 'next/link';
import { FeedPreview } from '@/components/FeedPreview';

const STEPS = [
  {
    emoji: '🙈',
    title: 'Own the oops',
    text: 'Write down what happened. Headline, story, cringe level. Two minutes, tops.',
  },
  {
    emoji: '💡',
    title: 'Find the lesson',
    text: 'What did it teach you? Wise, practical or totally ridiculous, it all counts.',
  },
  {
    emoji: '🎉',
    title: 'Keep it or share it',
    text: 'Save it privately, or post it to the feed and collect a few “been there”s.',
  },
];

const VALUES = [
  { emoji: '🏆', title: 'Celebrate, don’t hide', text: 'Mistakes mean you tried something. That deserves a little party.' },
  { emoji: '🪞', title: 'Build a reflection habit', text: 'Two questions: what happened, and what did I take from it?' },
  { emoji: '🫂', title: 'You’re not alone', text: 'Somewhere out there, someone has done the exact same thing.' },
  { emoji: '😂', title: 'Keep it light', text: 'No judgement, no lectures. Just people laughing at themselves together.' },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="hero" aria-labelledby="hero-title">
        <div className="container hero__inner">
          <div className="hero__copy">
            <p className="eyebrow">
              <span aria-hidden="true">✨</span> The mistake appreciation society
            </p>
            <h1 id="hero-title" className="hero__title">
              Stuffed it up? <span className="highlight">Glorious.</span>
            </h1>
            <p className="hero__lead">
              Log the mistakes you make and the lessons they leave behind. Keep them private, or
              share them so everyone can see they&rsquo;re not the only one.
            </p>
            <div className="btn-row">
              <Link href="/log" className="btn btn--primary btn--lg">
                <span aria-hidden="true">✍️</span> Log a mistake
              </Link>
              <Link href="/feed" className="btn btn--secondary btn--lg">
                <span aria-hidden="true">👀</span> Browse the feed
              </Link>
            </div>
          </div>

          <div className="hero__art" aria-hidden="true">
            <div className="sticker sticker--1">🙃</div>
            <div className="sticker sticker--2">💥</div>
            <div className="sticker sticker--3">🤦</div>
            <div className="hero-card hero-card--back">
              <p className="hero-card__tag">🍳 Kitchen · 😬 Big yikes</p>
              <p className="hero-card__title">Microwaved a boiled egg</p>
              <p className="hero-card__lesson">💡 Eggs are tiny grenades.</p>
            </div>
            <div className="hero-card hero-card--front">
              <p className="hero-card__tag">💼 Work · 🫠 Legendary</p>
              <p className="hero-card__title">Said &ldquo;love you, bye&rdquo; to my boss</p>
              <p className="hero-card__lesson">💡 Slow down at the end of calls.</p>
              <p className="hero-card__react">🙋 Been there · 356</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section" aria-labelledby="how-title">
        <div className="container">
          <h2 id="how-title" className="section__title">
            How it works
          </h2>
          <p className="section__lead">A tiny reflection habit with a big grin.</p>
          <ol className="steps">
            {STEPS.map((step, i) => (
              <li key={step.title} className={`step step--${i + 1}`}>
                <span className="step__emoji" aria-hidden="true">
                  {step.emoji}
                </span>
                <h3 className="step__title">
                  <span className="sr-only">Step {i + 1}: </span>
                  {step.title}
                </h3>
                <p>{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Feed preview */}
      <section className="section section--tinted" aria-labelledby="preview-title">
        <div className="container">
          <div className="section__header">
            <div>
              <h2 id="preview-title" className="section__title">
                Fan favourites
              </h2>
              <p className="section__lead">The mistakes everyone keeps saying &ldquo;been there&rdquo; to.</p>
            </div>
            <Link href="/feed" className="btn btn--ghost">
              See the whole feed <span aria-hidden="true">→</span>
            </Link>
          </div>
          <FeedPreview />
        </div>
      </section>

      {/* Values */}
      <section className="section" aria-labelledby="why-title">
        <div className="container">
          <h2 id="why-title" className="section__title">
            Why celebrate mistakes?
          </h2>
          <ul className="values">
            {VALUES.map((v) => (
              <li key={v.title} className="value">
                <span className="value__emoji" aria-hidden="true">
                  {v.emoji}
                </span>
                <div>
                  <h3 className="value__title">{v.title}</h3>
                  <p>{v.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="section" aria-labelledby="cta-title">
        <div className="container">
          <div className="cta-band">
            <h2 id="cta-title" className="cta-band__title">
              Go on. What did you stuff up this week?
            </h2>
            <p>Nobody has to see it but you. Unless you want them to.</p>
            <Link href="/log" className="btn btn--accent btn--lg">
              Log it now <span aria-hidden="true">🚀</span>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
